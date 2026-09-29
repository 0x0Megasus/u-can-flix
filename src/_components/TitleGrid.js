import Image from 'next/image';
import WatchLink from './WatchLink';
import { tmdbImage } from '@/_lib/tmdb';
import { buildWatchPath } from '@/_lib/slug';

/**
 * A static poster grid. Search results render once on the server — no
 * infinite scroll, no client state.
 */
export default function TitleGrid({ items = [], type }) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-tertiary)]">Nothing found. Try a different title.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {items.map(item => (
        <WatchLink
          key={item.tmdb_id}
          href={buildWatchPath({ type, title: item.title, year: item.year, id: item.tmdb_id })}
          className="group block no-underline poster-hover"
          aria-label={`Watch ${item.title}${item.year ? ` (${item.year})` : ''}`}
        >
          <div className="poster aspect-[2/3] w-full mb-2">
            <Image
              src={tmdbImage(item.poster_path, 'w342')}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              sizes="(max-width:640px) 30vw, (max-width:1024px) 18vw, 12vw"
              className="object-cover"
            />
            {item.vote_average > 0 && (
              <span className="absolute top-2 left-2 z-10 flex items-center gap-1 h-[22px] px-1.5 rounded-md bg-black/70 backdrop-blur-sm ring-1 ring-white/10 text-[11px] font-bold text-[#f5c518] tabular-nums">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                {item.vote_average.toFixed(1)}
              </span>
            )}
            <span className="absolute inset-0 z-10 flex items-end justify-center p-2 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
              <span className="btn btn-accent w-full py-1.5 text-[11px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Watch
              </span>
            </span>
          </div>
          <p className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
            {item.title}
          </p>
          {item.year && <p className="text-[11px] text-[var(--text-muted)]">{item.year}</p>}
        </WatchLink>
      ))}
    </div>
  );
}
