import { requireEnv } from '@/_lib/env';

const ALLOWED_IMDB_ORIGINS = [
  'https://imdb-api.com',
  'https://api.imdb.com',
  'https://imdb226.p.rapidapi.com',
  'https://tv-api.com',
  'https://imdb-top-100-movies.p.rapidapi.com',
];

const IMDB_TOP_URLS = {
  movies: requireEnv('IMDB_MOVIES_URL'),
  tv: requireEnv('IMDB_TV_URL'),
  anime: requireEnv('IMDB_ANIME_URL'),
};

const IMDB_CACHE = new Map();
const IMDB_CACHE_TTL = 60 * 60 * 1000;

function isValidImdbUrl(url) {
  try {
    new URL(url);
    return ALLOWED_IMDB_ORIGINS.some(origin => url.startsWith(origin));
  } catch {
    return false;
  }
}

export async function GET(request, props) {
  const params = await props.params;
  const type = params.type;
  const url = IMDB_TOP_URLS[type];

  if (!url) return Response.json({ error: 'Invalid type' }, { status: 400 });
  if (!isValidImdbUrl(url)) return Response.json({ error: 'Invalid IMDb upstream URL' }, { status: 500 });

  const cached = IMDB_CACHE.get(type);
  if (cached && Date.now() - cached.timestamp < IMDB_CACHE_TTL) {
    return Response.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200' }
    });
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`IMDB API error ${response.status}`);
    const data = await response.json();
    IMDB_CACHE.set(type, { data, timestamp: Date.now() });
    return Response.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200' }
    });
  } catch (err) {
    return Response.json({ error: 'IMDB proxy error', message: err.message }, { status: 500 });
  }
}
