import HeroBanner from '@/_components/HeroBanner';
import Rail from '@/_components/Rail';
import { getTrending, getTopRated, getGenreShelf, hasTmdbKey } from '@/_lib/tmdb';

export const revalidate = 3600;

export const metadata = {
  title: 'Free TV Shows Online in HD',
  description:
    'Browse trending and top-rated TV series online in HD. Drama, comedy, crime and more — no sign up, no ads.',
  alternates: { canonical: '/tv-shows' },
};

/** Featured series hero plus a few curated shelves. Anything specific lives behind search. */
async function getTvData() {
  if (!hasTmdbKey()) return null;

  const [trending, top, drama, comedy, crime] = await Promise.all([
    getTrending('tv', 1).catch(() => []),
    getTopRated('tv', 1).catch(() => []),
    getGenreShelf('tv', 18).catch(() => []),
    getGenreShelf('tv', 35).catch(() => []),
    getGenreShelf('tv', 80).catch(() => []),
  ]);

  const typed = list =>
    (Array.isArray(list) ? list : [])
      .filter(item => item?.tmdb_id && item?.poster_path)
      .map(item => ({ ...item, type: 'tv' }));

  return {
    hero: typed(trending),
    trending: typed(trending),
    top: typed(top),
    drama: typed(drama),
    comedy: typed(comedy),
    crime: typed(crime),
  };
}

const SHELVES = [
  { key: 'trending', title: 'Trending Series', salt: 21 },
  { key: 'top', title: 'Top Rated Series', salt: 22 },
  { key: 'drama', title: 'Drama', salt: 23 },
  { key: 'comedy', title: 'Comedy', salt: 24 },
  { key: 'crime', title: 'Crime', salt: 25 },
];

export default async function TvShowsPage() {
  const data = await getTvData();

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-sm text-[var(--text-tertiary)]">
          The catalogue could not be reached. Please try again shortly.
        </p>
      </main>
    );
  }

  return (
    <main>
      <HeroBanner items={data.hero} />

      <div className="page-shell pt-9 sm:pt-12">
        {SHELVES.map(shelf =>
          data[shelf.key].length > 0 && (
            <Rail key={shelf.key} title={shelf.title} items={data[shelf.key]} limit={10} salt={shelf.salt} />
          )
        )}
      </div>
    </main>
  );
}
