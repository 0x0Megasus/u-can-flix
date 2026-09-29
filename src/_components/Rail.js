'use client';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { pickRotating, reshuffle } from '@/_lib/rotation';
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll';
import TmdbCard from './TmdbCard';
import ScrollArrows from './ScrollArrows';
import RowShuffleButton from './RowShuffleButton';

/**
 * A horizontal rail of titles.
 *
 * Items always arrive from the server, so the cards are in the initial HTML
 * instead of appearing after a client fetch.
 */
export default function Rail({ title, items = [], limit = 10, salt = 1, href }) {
  // Seed 0 keeps server markup and the first client render identical. Shuffling
  // is explicit through the row button instead of happening after hydration.
  const [seed, setSeed] = useState(0);
  const { containerRef, showArrows, scroll } = useHorizontalScroll([items]);

  const visible = useMemo(
    () => pickRotating(items, { seed, salt, count: limit, rotate: true }),
    [items, seed, salt, limit]
  );

  const handleShuffle = useCallback(() => setSeed(reshuffle()), []);

  if (!items.length) return null;

  return (
    <section className="mb-11 sm:mb-12">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="rail-title text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight truncate">{title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors duration-200 no-underline"
            >
              See all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </Link>
          )}
          {showArrows && <ScrollArrows onScroll={scroll} />}
          <RowShuffleButton onClick={handleShuffle} />
        </div>
      </div>

      <div className="relative rail-shell">
        <div ref={containerRef} className="rail scrollbar-hide">
          {visible.map(item => (
            <TmdbCard key={`${item.type}-${item.tmdb_id}`} item={item} />
          ))}
        </div>
        <div className="rail-fade" />
      </div>
    </section>
  );
}
