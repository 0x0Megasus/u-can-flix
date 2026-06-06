import { requireEnv } from '@/_lib/env';

const WP_BASE = requireEnv('WP_API_BASE');
const WP_ORIGIN = requireEnv('WP_ORIGIN');

const IMDB_TOP_URLS = {
  movies: requireEnv('IMDB_MOVIES_URL'),
  tv: requireEnv('IMDB_TV_URL'),
  anime: requireEnv('IMDB_ANIME_URL'),
};

const BEST_CONTENT_CACHE = new Map();
const BEST_CONTENT_CACHE_TTL = 30 * 60 * 1000;

const CAT_ANIME = new Set([5, 8]);
const CAT_TV = new Set([7, 9]);
const CAT_MOVIE = new Set([3, 4]);
const CONFLICT_MAP = { anime: CAT_TV, tv: CAT_ANIME, movies: CAT_TV };
const FILTERS_SERVER = { movies: '3,4', tv: '7,9', anime: '5,8' };
const ALLOWED_IMDB_ORIGINS = [
  'https://imdb-api.com',
  'https://api.imdb.com',
  'https://imdb226.p.rapidapi.com',
  'https://tv-api.com',
  'https://imdb-top-100-movies.p.rapidapi.com',
  'https://imdb.devjugal.com',
];

function isValidImdbUrl(url) {
  try {
    new URL(url);
    return ALLOWED_IMDB_ORIGINS.some(origin => url.startsWith(origin));
  } catch {
    return false;
  }
}

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

function getPostCats(post) {
  const cats = new Set();
  if (Array.isArray(post.categories)) post.categories.forEach(c => cats.add(Number(c)));
  const terms = post._embedded?.['wp:term'];
  if (terms) terms.forEach(group => { if (Array.isArray(group)) group.forEach(t => { if (t?.id) cats.add(Number(t.id)); }); });
  return cats;
}

function hasConflictCats(post, type) {
  const conflict = CONFLICT_MAP[type];
  if (!conflict) return false;
  const cats = getPostCats(post);
  return [...conflict].some(c => cats.has(c));
}

function matchTitleServer(renderedTitle, query) {
  const title = decodeHtml(renderedTitle || '').toLowerCase();
  const q = query.toLowerCase().trim();
  if (title.includes(q)) return true;

  const tNorm = title.replace(/[^a-z0-9\s]/g, '').trim();
  const qNorm = q.replace(/[^a-z0-9\s]/g, '').trim();
  if (tNorm.includes(qNorm)) return true;

  const tTokens = tNorm.split(/\s+/).filter(Boolean);
  const qTokens = qNorm.split(/\s+/).filter(Boolean);
  const matchingTokens = qTokens.filter(qt =>
    tTokens.some(tt => (tt.includes(qt) || qt.includes(tt)) && qt.length >= 3)
  );
  if (matchingTokens.length === 0) return false;
  if (qTokens.length === 1) return true;
  return matchingTokens.length >= 2;
}

export async function GET(request, props) {
  const params = await props.params;
  const { type } = params;
  const { searchParams } = new URL(request.url);
  const requestedLimit = Number.parseInt(searchParams.get('limit'), 10);
  const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 10, 1), 20);
  const url = IMDB_TOP_URLS[type];

  if (!url) return Response.json({ error: 'Invalid type' }, { status: 400 });
  if (!isValidImdbUrl(url)) return Response.json({ error: 'Invalid IMDb upstream URL' }, { status: 500 });

  const cached = BEST_CONTENT_CACHE.get(type);
  if (cached && Date.now() - cached.timestamp < BEST_CONTENT_CACHE_TTL) {
    return Response.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600' }
    });
  }

  const catIds = FILTERS_SERVER[type] || '';

  const execute = async () => {
    const imdbRes = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!imdbRes.ok) throw new Error(`IMDB API error ${imdbRes.status}`);
    const list = await imdbRes.json();
    if (!Array.isArray(list)) return [];

    const matched = [];
    const seen = new Set();
    const failedSearches = new Set();
    const headers = { 'Accept': 'application/json', 'User-Agent': 'UCanFlix/1.0', 'Origin': WP_ORIGIN, 'Referer': WP_ORIGIN + '/' };

    for (let i = 0; i < list.length && matched.length < limit; i += 10) {
      const batch = list.slice(i, i + 10);
      const results = await Promise.allSettled(batch.map(async (item) => {
        const title = item.name || item["Movie Name"] || item["Show Name"];
        const rating = parseFloat(item["IMDb Rating"]);
        if (!title || isNaN(rating)) return null;

        const cacheKey = `${catIds}:${title.toLowerCase()}`;
        if (failedSearches.has(cacheKey)) return null;

        const su = new URL(WP_BASE + '/posts');
        su.searchParams.set('per_page', '50');
        su.searchParams.set('_embed', 'wp:featuredmedia,wp:term');
        su.searchParams.set('search', title);
        if (catIds) su.searchParams.set('categories', catIds);

        try {
          const wr = await fetch(su.toString(), { headers, signal: AbortSignal.timeout(10000) });
          if (!wr.ok) return null;
          const posts = await wr.json();
          if (!Array.isArray(posts) || posts.length === 0) { failedSearches.add(cacheKey); return null; }
          const match = posts.find(p => matchTitleServer(p.title?.rendered || '', title) && !hasConflictCats(p, type));
          if (!match) { failedSearches.add(cacheKey); return null; }
          return { post: match, rating, title };
        } catch { return null; }
      }));

      for (const result of results) {
        if (result.status !== 'fulfilled' || !result.value) continue;
        const r = result.value;
        if (seen.has(r.post.id)) continue;
        seen.add(r.post.id);

        matched.push({ ...r.post, imdbRating: r.rating, imdbTitle: r.title });
        if (matched.length >= limit) break;
      }
    }

    const sorted = matched.sort((a, b) => b.imdbRating - a.imdbRating);
    BEST_CONTENT_CACHE.set(type, { data: sorted, timestamp: Date.now() });
    return sorted;
  };

  try {
    const result = await Promise.race([
      execute(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 8000))
    ]);
    return Response.json(result, {
      headers: { 'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600' }
    });
  } catch (err) {
    return Response.json({ error: 'Best content error', message: err.message }, { status: 500 });
  }
}
