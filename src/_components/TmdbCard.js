'use client';
import { memo, useCallback, useState } from 'react';
import Image from 'next/image';
import WatchLink from './WatchLink';
import { tmdbImage } from '@/_lib/tmdb';
import { buildWatchPath } from '@/_lib/slug';

const TMDB_IMG = 'https://image.tmdb.org/t/p';
const SIZES = [185, 342, 500, 780];

function srcSet(path) {
  if (!path) return undefined;
  return SIZES.map(size => `${TMDB_IMG}/${size}${path} ${size}w`).join(', ');
}

function TmdbCardInner({ item, showProgress = false }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(() => setBroken(true), []);

  if (broken || !item?.poster_path) {
    return (
      <div className="flex-shrink-0" style={{ width: 'var(--card-w)' }}>
        <div className="poster aspect-[2/3] w-full flex items-center justify-center p-2 ring-1 ring-white/5">
          <span className="text-center text-[11px] font-semibold text-[var(--text-muted)] line-clamp-3">
            {item?.title}
          </span>
        </div>
        <p className="text-xs font-semibold text-[var(--text-secondary)] truncate">{item?.title}</p>
      </div>
    );
  }

  const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const href = buildWatchPath({ type: item.type, title: item.title, year: item.year, id: item.tmdb_id });

  return (
    <div className="flex-shrink-0 poster-hover" style={{ width: 'var(--card-w)' }}>
      <WatchLink
        href={href}
        className="block group focus:outline-none no-underline"
        aria-label={`Watch ${item.title}${item.year ? ` (${item.year})` : ''}`}
      >
        <div className="poster aspect-[2/3] w-full mb-2">
          <Image
            src={tmdbImage(item.poster_path, 'w342')}
            srcSet={srcSet(item.poster_path)}
            alt={item.title}
            fill
            loading="lazy"
            decoding="async"
            sizes="(max-width:640px) 168px, (max-width:768px) 188px, 208px"
            className={`object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
          {rating && (
            <span className="absolute top-2 left-2 z-10 flex items-center gap-1 h-[22px] px-1.5 rounded-md bg-black/70 backdrop-blur-sm ring-1 ring-white/10 text-[11px] font-bold text-[#f5c518] tabular-nums">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              {rating}
            </span>
          )}

          {item.type === 'tv' && (
            <span className="absolute top-2 right-2 z-10 flex items-center h-[22px] px-1.5 rounded-md bg-black/70 backdrop-blur-sm ring-1 ring-white/10 text-[10px] font-bold uppercase tracking-wide text-white">
              Series
            </span>
          )}

          <span className="absolute inset-0 z-10 flex items-end justify-center p-2 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
            <span className="btn btn-accent w-full py-1.5 text-[11px]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Watch
            </span>
          </span>

          {showProgress && item.progress > 0 && (
            <span className="absolute bottom-0 inset-x-0 h-1 bg-white/15 z-10">
              <span
                className="block h-full bg-[var(--accent)]"
                style={{ width: `${Math.min(100, Math.round(item.progress * 100))}%` }}
              />
            </span>
          )}
        </div>
      </WatchLink>

      <p className="mt-1 text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
        {item.title}
      </p>
      <p className="text-[11px] text-[var(--text-muted)] truncate">
        {item.year || (item.type === 'tv' ? 'Series' : '')}
      </p>
    </div>
  );
}

/** Memoised because a home page renders several rails of these at once. */
const MemoCard = memo(TmdbCardInner);

export default function TmdbCard({ item, showProgress = false }) {
  return <MemoCard item={item} showProgress={showProgress} />;
}
