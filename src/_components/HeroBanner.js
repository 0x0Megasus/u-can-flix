'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { tmdbImage } from '@/_lib/tmdb';
import { buildWatchPath, TYPE_LABEL, TYPE_ACCENT } from '@/_lib/slug';

function Stars({ rating, count }) {
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f5c518]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      {rating.toFixed(1)}
      {count > 0 && <span className="text-[var(--text-muted)] font-medium text-xs">({compact(count)})</span>}
    </span>
  );
}

function compact(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

function formatRuntime(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

export default function HeroBanner({ items = [] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [loadedIds, setLoadedIds] = useState(() => new Set());

  // Only titles that actually have artwork are eligible; a blank hero is worse
  // than one fewer slide.
  const slides = items.filter(i => i?.backdrop_path || i?.poster_path);
  const current = slides[index] || slides[0];

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Preload the next backdrop so the rotation does not flash.
  useEffect(() => {
    if (slides.length < 2) return;
    const next = slides[(index + 1) % slides.length];
    const path = next?.backdrop_path || next?.poster_path;
    if (!path || loadedIds.has(path)) return;
    const img = new window.Image();
    img.src = tmdbImage(path, 'w1280');
    img.onload = () => setLoadedIds(prev => new Set(prev).add(path));
  }, [index, slides, loadedIds]);

  const handleWatch = useCallback(() => {
    if (!current) return;
    router.push(buildWatchPath({ type: current.type, title: current.title, year: current.year, id: current.tmdb_id }));
  }, [current, router]);

  if (!current) {
    return <div className="h-[38vh] min-h-[240px] bg-[var(--bg-secondary)]" aria-hidden="true" />;
  }

  const art = current.backdrop_path || current.poster_path;

  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)]" aria-roledescription="carousel" aria-label="Featured titles">
      <div className="relative h-[62vh] h-[62dvh] min-h-[380px] sm:h-[68vh] sm:h-[68dvh] lg:h-[70vh] lg:h-[70dvh] bg-[var(--bg-primary)]">
        {slides.map((slide, i) => {
          const path = slide.backdrop_path || slide.poster_path;
          if (!path) return null;
          return (
            <div
              key={slide.tmdb_id}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={tmdbImage(path, 'w1280')}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-[center_28%]"
              />
            </div>
          );
        })}

        {/* Bottom scrim so the rail below meets the hero on a clean edge. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] from-8% via-[var(--bg-primary)]/72 via-45% to-transparent" />
        {/* Side scrim keeps the text column readable over any frame. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/95 via-[var(--bg-primary)]/45 via-55% to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="page-shell pb-12 sm:pb-16">
              {/* Opacity-only swap: the old translateY remount flashed a pale seam across the hero on every rotation. */}
              <div key={current.tmdb_id} className="max-w-xl lg:max-w-2xl hero-swap">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                <span
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] text-white"
                  style={{ background: TYPE_ACCENT[current.type] || TYPE_ACCENT.movie }}
                >
                  {TYPE_LABEL[current.type] || 'Title'}
                </span>
                {current.year && <span className="text-sm text-[var(--text-secondary)] font-medium">{current.year}</span>}
                {current.type === 'tv' && current.number_of_seasons > 0 && (
                  <span className="text-sm text-[var(--text-secondary)]">
                    {current.number_of_seasons} season{current.number_of_seasons > 1 ? 's' : ''}
                  </span>
                )}
                {current.runtime > 0 && (
                  <span className="text-sm text-[var(--text-secondary)]">{formatRuntime(current.runtime)}</span>
                )}
                <Stars rating={current.vote_average} count={current.vote_count} />
              </div>

              <h1 className="text-[28px] sm:text-4xl md:text-[42px] lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl mb-4">
                {current.title}
              </h1>

              {current.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {current.genres.slice(0, 4).map(g => (
                    <span key={g.id} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white/85 bg-white/10 backdrop-blur-sm border border-white/10">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {current.overview && (
                <p className="text-sm sm:text-[15px] text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-6 max-w-[52ch]">
                  {current.overview}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                <button onClick={handleWatch} className="btn btn-primary px-6 py-3 text-sm">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-5 z-10">
            <div className="page-shell flex items-center justify-end">
            {slides.map((slide, i) => (
              <button
                key={slide.tmdb_id}
                onClick={() => setIndex(i)}
                aria-label={`Show ${slide.title}`}
                aria-current={i === index}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer border-none ${
                  i === index ? 'w-6 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
              </div>
          </div>
        )}
      </div>
    </section>
  );
}
