'use client';
import { useCallback, useEffect, useState } from 'react';
import WatchLink from './WatchLink';
import Image from 'next/image';
import { listenForProgress, getProgressEntries, getTitleMeta } from '@/_lib/progress';
import { tmdbImage } from '@/_lib/tmdb';
import { buildWatchPath } from '@/_lib/slug';

/**
 * Renders titles the visitor has partially watched.
 *
 * The list is built from ids the embedded player reported, so it only exists in
 * the browser. The row is intentionally absent from the server render — a
 * placeholder would flash in and then be replaced.
 */
export default function ContinueWatching({ titles = {} }) {
  const [entries, setEntries] = useState([]);

  const refresh = useCallback(() => {
    setEntries(getProgressEntries());
  }, []);

  useEffect(() => {
    refresh();
    const stopListening = listenForProgress();
    window.addEventListener('progress:update', refresh);
    return () => {
      stopListening();
      window.removeEventListener('progress:update', refresh);
    };
  }, [refresh]);

  if (entries.length === 0) return null;

  return (
    <section className="mb-9" aria-label="Continue watching">
      <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight mb-4">
        Continue Watching
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {entries.slice(0, 12).map(entry => {
          const meta = getTitleMeta()[entry.id] || titles[entry.id];
          // Never link an untitled entry back to the homepage.
          if (!meta?.title) return null;
          const href = buildWatchPath({ type: meta.type === 'tv' ? 'tv' : 'movie', title: meta.title, year: meta.year, id: entry.id });
          const ratio = entry.progress?.watched / entry.progress?.duration || 0;
          const remaining = entry.progress?.duration
            ? Math.round((entry.progress.duration - entry.progress.watched) / 60)
            : 0;

          return (
            <WatchLink
              key={entry.id}
              href={href}
              className="group block no-underline poster-hover"
            >
              <div className="poster aspect-video w-full mb-2">
                {meta?.backdrop_path ? (
                  <Image
                    src={tmdbImage(meta.backdrop_path, 'w500')}
                    alt={meta.title || ''}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width:640px) 45vw, 20vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-muted)" aria-hidden="true">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                )}

                <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
                  <span className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="black" aria-hidden="true">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </span>
                </span>

                <span className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-10">
                  <span
                    className="block h-full bg-[var(--accent)]"
                    style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                  />
                </span>
              </div>

              <p className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                {meta?.title || 'Continue watching'}
              </p>
              {remaining > 0 && (
                <p className="text-[11px] text-[var(--text-muted)]">{remaining}m left</p>
              )}
            </WatchLink>
          );
        })}
      </div>
    </section>
  );
}
