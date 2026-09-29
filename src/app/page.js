import { Suspense } from 'react';
import HeroBanner from '@/_components/HeroBanner';
import Rail from '@/_components/Rail';
import ContinueWatching from '@/_components/ContinueWatching';
import { getTrending, hasTmdbKey } from '@/_lib/tmdb';

export const revalidate = 1800;

export const metadata = {
  title: 'Watch Free Movies & TV Shows Online HD',
  description:
    'Stream movies and TV shows free in HD. Thousands of titles, full seasons, no sign up and no ads.',
  alternates: { canonical: '/' },
};

function RailFallback({ title }) {
  return (
    <section className="mb-10">
      <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight mb-4">{title}</h2>
      <div className="flex gap-3 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ width: 'var(--card-w)' }} className="flex-shrink-0">
            <div className="aspect-[2/3] rounded-[var(--radius-md)] skeleton mb-2" />
            <div className="h-3 rounded skeleton w-full mb-1.5" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Only titles with artwork are worth a slot on a rail. */
function usable(list) {
  return (Array.isArray(list) ? list : []).filter(item => item?.tmdb_id && item?.poster_path);
}

async function getHomeData() {
  if (!hasTmdbKey()) return null;

  // Home stays light: hero plus two trending rows. Deeper browsing lives on
  // Movies, TV Shows, and Search.
  const [trendingAll, trendingMovies, trendingTv] = await Promise.all([
    getTrending('all', 1).catch(() => []),
    getTrending('movie', 1).catch(() => []),
    getTrending('tv', 1).catch(() => []),
  ]);

  // Trending mixes movies and shows, so each entry needs a concrete type.
  const typed = (list, fallback) =>
    usable(list).map(item => ({ ...item, type: item.type === 'TV Show' ? 'tv' : fallback }));

  return {
    hero: typed(trendingAll, 'movie'),
    trendingMovies: typed(trendingMovies, 'movie'),
    trendingTv: typed(trendingTv, 'tv'),
  };
}

export default async function HomePage() {
  const data = await getHomeData();

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">Catalogue unavailable</h1>
          <p className="text-[var(--text-tertiary)] text-sm">
            The title service could not be reached. Please try again shortly.
          </p>
        </div>
      </main>
    );
  }

  const titles = {};
  for (const item of [...data.trendingMovies, ...data.trendingTv]) {
    if (item.tmdb_id && !titles[item.tmdb_id]) {
      titles[item.tmdb_id] = { title: item.title, type: item.type, year: item.year, backdrop_path: item.backdrop_path || null };
    }
  }

  return (
    <main>
      <HeroBanner items={data.hero} />

      <div className="pt-9 sm:pt-12">
        <div className="page-shell">
          <ContinueWatching titles={titles} />
        </div>

        <div className="page-shell">
          <Suspense fallback={<RailFallback title="Trending Movies This Week" />}>
            <Rail title="Trending Movies This Week" items={data.trendingMovies} href="/movies" salt={1} />
          </Suspense>

          <Suspense fallback={<RailFallback title="Trending Series" />}>
            <Rail title="Trending Series" items={data.trendingTv} href="/tv-shows" salt={2} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
