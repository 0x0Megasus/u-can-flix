import { getTrending, getTopRated, hasTmdbKey } from '@/_lib/tmdb';
import { buildWatchPath } from '@/_lib/slug';

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'hourly', priority: 1 },
  { path: '/movies', changeFrequency: 'daily', priority: 0.9 },
  { path: '/tv-shows', changeFrequency: 'daily', priority: 0.9 },
  { path: '/dmca', changeFrequency: 'monthly', priority: 0.2 },
];

export const revalidate = 3600;

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ucanflix.com';
  const lastModified = new Date();

  const entries = STATIC_ROUTES.map(route => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Including real watch URLs gives crawlers something to index instead of an
  // empty list of only three section pages.
  if (hasTmdbKey()) {
    const [trending, topMovies, topTv] = await Promise.all([
      getTrending('all', 1).catch(() => []),
      getTopRated('movie', 1).catch(() => []),
      getTopRated('tv', 1).catch(() => []),
    ]);

    const seen = new Set();
    for (const item of [...trending, ...topMovies, ...topTv]) {
      if (!item?.tmdb_id || !item?.poster_path) continue;
      const type = item.type === 'TV Show' ? 'tv' : 'movie';
      const key = `${type}-${item.tmdb_id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      entries.push({
        url: new URL(buildWatchPath({ type, title: item.title, year: item.year, id: item.tmdb_id }), siteUrl).toString(),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
