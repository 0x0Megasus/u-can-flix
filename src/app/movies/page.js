import HeroBanner from '@/_components/HeroBanner';
import Rail from '@/_components/Rail';
import { getTrending, getTopRated, getGenreShelf, hasTmdbKey } from '@/_lib/tmdb';

export const revalidate = 3600;

export const metadata = {
  title: 'Free Movies Online in HD',
  description:
    'Browse trending and top-rated movies online in HD. Action, comedy, drama and more — no sign up, no ads.',
  alternates: { canonical: '/movies' },
};

/** Featured movie hero plus a few curated shelves. Anything specific lives behind search. */
async function getMoviesData() {
  if (!hasTmdbKey()) return null;

  const [trending, top, action, comedy, drama] = await Promise.all([
    getTrending('movie', 1).catch(() => []),
    getTopRated('movie', 1).catch(() => []),
    getGenreShelf('movie', 28).catch(() => []),
    getGenreShelf('movie', 35).catch(() => []),
    getGenreShelf('movie', 18).catch(() => []),
  ]);

  const typed = list =>
    (Array.isArray(list) ? list : [])
      .filter(item => item?.tmdb_id && item?.poster_path)
      .map(item => ({ ...item, type: 'movie' }));

  return {
    hero: typed(trending),
    trending: typed(trending),
    top: typed(top),
    action: typed(action),
    comedy: typed(comedy),
    drama: typed(drama),
  };
}

const SHELVES = [
  { key: 'trending', title: 'Trending Movies', salt: 11 },
  { key: 'top', title: 'Top Rated Movies', salt: 12 },
  { key: 'action', title: 'Action', salt: 13 },
  { key: 'comedy', title: 'Comedy', salt: 14 },
  { key: 'drama', title: 'Drama', salt: 15 },
];

export default async function MoviesPage() {
  const data = await getMoviesData();

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
