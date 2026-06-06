import { matchTitle } from './utils';

const REQUEST_CACHE = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function cacheKey(...parts) {
  return parts.join(':');
}

function fromCache(key) {
  const entry = REQUEST_CACHE.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  REQUEST_CACHE.delete(key);
  return null;
}

function toCache(key, data) {
  REQUEST_CACHE.set(key, { data, timestamp: Date.now() });
}

const IN_FLIGHT = new Map();

async function dedupedFetch(url, cacheKey) {
  const cached = fromCache(cacheKey);
  if (cached) return cached;

  if (IN_FLIGHT.has(cacheKey)) {
    return IN_FLIGHT.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      toCache(cacheKey, data);
      return data;
    } finally {
      IN_FLIGHT.delete(cacheKey);
    }
  })();

  IN_FLIGHT.set(cacheKey, promise);
  return promise;
}

export function clearCache() {
  REQUEST_CACHE.clear();
}

const FILTERS = {
  home: null,
  movies: '3,4',
  tv: '7,9',
  anime: '5,8'
};

export async function fetchPosts({ filter = 'home', search = '', page = 1, perPage = 50, categories = '' } = {}) {
  const key = cacheKey('fetchPosts', filter, search, page, perPage, categories);
  const cached = fromCache(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  params.set('per_page', String(perPage));
  params.set('_embed', '');
  params.set('page', String(page));
  const catIds = categories || FILTERS[filter];
  if (catIds) params.set('categories', catIds);
  if (search) params.set('search', search);

  const url = `/api/wp/v2/posts?${params.toString()}`;
  return dedupedFetch(url, key);
}

export async function searchPosts(query) {
  if (!query.trim()) return [];
  const key = cacheKey('searchPosts', query);
  const cached = fromCache(key);
  if (cached) return cached;

  const seen = new Set();
  const allMatches = [];

  const fetchAndMatch = async (opts) => {
    try {
      const data = await fetchPosts(opts);
      for (const item of Array.isArray(data) ? data : []) {
        if (!seen.has(item.id) && matchTitle(item, query)) {
          seen.add(item.id);
          allMatches.push(item);
        }
      }
    } catch { /* ignore */ }
  };

  await fetchAndMatch({ search: query, perPage: 100 });

  if (allMatches.length < 5) {
    await fetchAndMatch({ perPage: 100, page: 1 });
  }

  toCache(key, allMatches);
  return allMatches;
}

export async function fetchBestContent(type, limit = 10) {
  const key = cacheKey('fetchBestContent', type, limit);
  const cached = fromCache(key);
  if (cached) return cached;

  const url = `/api/best-content/${type}?limit=${limit}`;
  return dedupedFetch(url, key);
}

export async function fetchShowEpisodes(showName, categoryIds) {
  const key = cacheKey('fetchShowEpisodes', showName, categoryIds);
  const cached = fromCache(key);
  if (cached) return cached;

  const showLower = showName.toLowerCase().trim();
  const params = new URLSearchParams();
  params.set('per_page', '100');
  params.set('_embed', '');
  params.set('page', '1');
  params.set('search', showName);
  if (categoryIds) params.set('categories', categoryIds);

  const url = `/api/wp/v2/posts?${params.toString()}`;

  let firstPageData = [];
  let totalPages = 1;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1');
    firstPageData = await res.json();
  } catch (err) {
    console.error('Failed to fetch first page of episodes:', err);
    return [];
  }

  const allPosts = [...firstPageData];
  const seen = new Set(allPosts.map(p => p.id));

  if (totalPages > 1) {
    const remainingPages = Array.from({ length: Math.min(totalPages - 1, 7) }, (_, i) => i + 2);
    const results = await Promise.allSettled(remainingPages.map(async (page) => {
      const pageParams = new URLSearchParams(params);
      pageParams.set('page', String(page));
      try {
        const pageRes = await fetch(`/api/wp/v2/posts?${pageParams.toString()}`);
        if (!pageRes.ok) return [];
        return pageRes.json();
      } catch { return []; }
    }));

    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        res.value.forEach(post => {
          if (!seen.has(post.id)) { allPosts.push(post); seen.add(post.id); }
        });
      }
    }
  }

  const matchedPosts = allPosts.filter(post => {
    const title = (post.title?.rendered || '').toLowerCase().trim();
    return title.includes(showLower) ||
           (showLower.includes(title.length > 3 ? title : '____NOT_MATCH____'));
  });

  toCache(key, matchedPosts);
  return matchedPosts;
}

export async function fetchContent(filter, search = '', page = 1, categories = '') {
  const [page1, page2] = await Promise.all([
    fetchPosts({ filter, search, page, categories, perPage: 50 }),
    search ? Promise.resolve([]) : fetchPosts({ filter, search, page: page + 1, categories, perPage: 50 }),
  ]);
  const rawItems = [...(Array.isArray(page1) ? page1 : []), ...(Array.isArray(page2) ? page2 : [])];
  const seen = new Set();
  const items = rawItems.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  if (!search) return items;

  const matched = items.filter(item => matchTitle(item, search));
  if (matched.length >= 5) return matched;

  const seenAll = new Set(items.map(i => i.id));
  const all = await fetchPosts({ filter, page: 1, categories, perPage: 100 });
  if (Array.isArray(all)) {
    all.forEach(item => {
      if (!seenAll.has(item.id) && matchTitle(item, search)) {
        seenAll.add(item.id);
        items.push(item);
      }
    });
  }

  return items.filter(item => matchTitle(item, search));
}

export async function fetchTopRatedContent(type) {
  return fetchBestContent(type);
}
