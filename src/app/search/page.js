import { Suspense } from 'react';
import { searchTmdb, hasTmdbKey } from '@/_lib/tmdb';
import TitleGrid from '@/_components/TitleGrid';

export const metadata = {
  title: 'Search',
  description: 'Search thousands of movies and TV shows available to stream free in HD.',
  robots: { index: false, follow: true },
};

async function SearchResults({ query, type }) {
  if (!query) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-tertiary)]">
          Type a title above to start searching.
        </p>
      </div>
    );
  }

  if (!hasTmdbKey()) {
    return <p className="py-20 text-center text-[var(--text-tertiary)]">Search is unavailable right now.</p>;
  }

  const data = await searchTmdb(query, 'multi', 1).catch(() => []);
  const results = data.filter(item => item?.tmdb_id && item?.poster_path);

  if (results.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-primary)] font-semibold mb-1">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-[var(--text-tertiary)] text-sm">Try a different spelling or a shorter title.</p>
      </div>
    );
  }

  // Search spans both media types, so each result is grouped under its own type
  // rather than being forced into one grid.
  const movies = results.filter(r => r.type !== 'TV Show');
  const shows = results.filter(r => r.type === 'TV Show');

  return (
    <div className="space-y-10">
      {movies.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
            {type === 'tv' ? 'Related' : `Movies (${movies.length})`}
          </h2>
          <TitleGrid items={movies} type="movie" />
        </section>
      )}
      {shows.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
            {type === 'movie' ? 'Related' : `TV Shows (${shows.length})`}
          </h2>
          <TitleGrid items={shows} type="tv" />
        </section>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === 'string' ? params.q.trim().slice(0, 100) : '';
  const type = params?.type === 'tv' ? 'tv' : 'movie';

  return (
    <main className="min-h-screen pt-[60px]">
      <div className="page-shell py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {query ? `Results for “${query}”` : 'Search'}
          </h1>
        </header>

        <Suspense
          key={query}
          fallback={
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[2/3] rounded-[var(--radius-md)] skeleton mb-2" />
                </div>
              ))}
            </div>
          }
        >
          <SearchResults query={query} type={type} />
        </Suspense>
      </div>
    </main>
  );
}
