import { notFound } from 'next/navigation';
import { cache } from 'react';
import TmdbWatch from '@/_components/TmdbWatch';
import { getFullDetails, getSeasons, getSimilar } from '@/_lib/tmdb';
import { parseWatchSlug, normaliseMediaType } from '@/_lib/slug';

export const revalidate = 3600;

const loadData = cache(async (id, type) => {
  const item = await getFullDetails(id, type).catch(() => null);
  if (!item) return null;

  const similar = await getSimilar(id, type).catch(() => []);
  if (type !== 'tv') {
    return { item: { ...item, type: 'movie' }, seasons: [], similar };
  }

  const seasons = await getSeasons(id).catch(() => []);
  return { item: { ...item, type: 'tv' }, seasons, similar };
});

function parseRoute(params) {
  const type = normaliseMediaType(params.type);
  const id = parseWatchSlug(params.slug);
  return type && id ? { type, id } : null;
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const route = parseRoute(resolved);
  const data = route ? await loadData(route.id, route.type) : null;

  if (!data) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }

  const { item } = data;
  const label = item.type === 'tv' ? 'TV Show' : 'Movie';
  const year = item.year ? ` (${item.year})` : '';
  const title = `Watch ${item.title}${year} Online Free in HD`;
  const description =
    item.overview?.slice(0, 155) ||
    `Watch ${item.title} free online in HD. ${label}. No sign up, no ads, instant streaming.`;

  return {
    title,
    description,
    alternates: { canonical: `/watch/${item.type === 'tv' ? 'series' : 'movie'}/${resolved.slug ?? ''}` },
    openGraph: {
      title,
      description,
      type: 'video.movie',
      images: item.backdrop_path
        ? [{ url: `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` }]
        : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function WatchPage({ params }) {
  const route = parseRoute(await params);
  if (!route) notFound();

  const data = await loadData(route.id, route.type);
  if (!data) notFound();

  return (
    <TmdbWatch
      item={data.item}
      type={data.item.type}
      seasons={data.seasons}
      credits={data.item.credits}
      similar={data.similar}
    />
  );
}
