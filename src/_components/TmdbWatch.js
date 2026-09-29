'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import EmbedPlayer from './EmbedPlayer';
import { tmdbImage } from '@/_lib/tmdb';
import { rememberTitleMeta } from '@/_lib/progress';
import { buildWatchPath, TYPE_LABEL, TYPE_ACCENT } from '@/_lib/slug';

function formatRuntime(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`;
}

export default function TmdbWatch({ item, type, seasons, credits, similar }) {
  const router = useRouter();
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  // Details first: the player only appears after the user presses play.
  const [playing, setPlaying] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const isTv = type === 'tv';
  const poster = item.poster_path ? tmdbImage(item.poster_path, 'w500') : '';
  const backdrop = item.backdrop_path ? tmdbImage(item.backdrop_path, 'w1280') : '';

  useEffect(() => {
    // Load on the details view, not only after pressing play, so the episode
    // list is already there when the user picks a season.
    if (!isTv) return;
    let cancelled = false;
    setLoadingEpisodes(true);
    // Via route handler, not a direct import: the TMDB key is a private server
    // env var and this file runs in the browser.
    fetch(`/api/episodes?id=${item.tmdb_id}&season=${season}`)
      .then(r => (r.ok ? r.json() : { episodes: [] }))
      .then(d => { if (!cancelled) setEpisodes(d.episodes || []); })
      .catch(() => { if (!cancelled) setEpisodes([]); })
      .finally(() => { if (!cancelled) setLoadingEpisodes(false); });
    return () => { cancelled = true; };
  }, [isTv, item.tmdb_id, season]);

  const cast = useMemo(() => (credits?.cast || []).slice(0, 8), [credits]);

  // Persist the current title once so Continue Watching can link it even when
  // it is no longer present in the home rails.
  useEffect(() => {
    rememberTitleMeta(item.tmdb_id, {
      title: item.title,
      type,
      year: item.year,
      backdrop_path: item.backdrop_path || null,
    });
  }, [item.tmdb_id, item.title, item.year, item.backdrop_path, type]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
      <div className="relative">
        {backdrop && (
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/40" />
          </div>
        )}

        <div className="relative page-shell pt-[70px] pb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-300 bg-transparent border-none cursor-pointer text-sm mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {poster && (
              <div className="relative w-32 md:w-44 aspect-[2/3] rounded-[var(--radius-lg)] overflow-hidden shrink-0 shadow-2xl ring-1 ring-white/10">
                <Image src={poster} alt={item.title} fill sizes="176px" className="object-cover" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ background: TYPE_ACCENT[type] || TYPE_ACCENT.movie, color: '#fff' }}
                >
                  {TYPE_LABEL[type] || 'Title'}
                </span>
                {item.year && <span className="text-sm text-[var(--text-secondary)] font-medium">{item.year}</span>}
                {item.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-[#f5c518] font-bold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    {item.vote_average.toFixed(1)}
                    <span className="text-[var(--text-muted)] font-medium text-xs">
                      ({item.vote_count?.toLocaleString()})
                    </span>
                  </span>
                )}
                {item.status && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] font-semibold">
                    {item.status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
                {item.title}
              </h1>

              {item.tagline && (
                <p className="text-[var(--text-tertiary)] italic text-sm mb-4">{item.tagline}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                {item.runtime > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full glass-card text-[var(--text-tertiary)]">
                    {formatRuntime(item.runtime)}
                  </span>
                )}
                {item.number_of_seasons > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full glass-card text-[var(--text-tertiary)]">
                    {item.number_of_seasons} season{item.number_of_seasons > 1 ? 's' : ''}
                  </span>
                )}
                {item.genres.slice(0, 4).map(g => (
                  <span key={g.id} className="text-xs px-2.5 py-1 rounded-full glass-card text-[var(--text-tertiary)]">
                    {g.name}
                  </span>
                ))}
              </div>

              {item.overview && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-6">{item.overview}</p>
              )}

              {cast.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Cast</h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {cast.map(c => c.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell">
        {isTv ? (
          <section aria-label="Episodes">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
              {seasons.map(s => (
                <button
                  key={s.season_number}
                  onClick={() => { setSeason(s.season_number); setEpisode(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border-none cursor-pointer whitespace-nowrap shrink-0 ${
                    season === s.season_number
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Season {s.season_number}
                  <span className="ml-1 opacity-70">({s.episode_count})</span>
                </button>
              ))}
            </div>

            {loadingEpisodes ? (
              <div className="flex flex-col gap-1.5 py-2" role="status" aria-label="Loading episodes">
                <span className="sr-only">Loading episodes…</span>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5" aria-hidden="true">
                    <div className="skeleton w-8 h-8 rounded-md shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="skeleton h-3 rounded w-2/3 mb-1.5" />
                      <div className="skeleton h-2.5 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : episodes.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-6 text-center">
                No episodes found for this season.
              </p>
            ) : (
              <div className="eps-scroll flex flex-col rounded-[var(--radius-md)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-[300px] sm:max-h-[380px] overflow-y-auto">
                {episodes.map(ep => {
                  const isActive = playing && season === ep.season_number && episode === ep.episode_number;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => { setSeason(ep.season_number); setEpisode(ep.episode_number); setPlaying(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 text-left transition-colors duration-200 cursor-pointer group ${
                        isActive ? 'bg-[var(--accent-subtle)]' : 'hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'
                      }`}>
                        {ep.episode_number}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-[13px] font-semibold truncate ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                          {ep.name || `Episode ${ep.episode_number}`}
                        </span>
                        {ep.runtime > 0 && (
                          <span className="block text-[11px] text-[var(--text-muted)]">{ep.runtime}m</span>
                        )}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                        className={`shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}
      </div>

      {playing && (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col">
          <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
            <button
              onClick={() => setPlaying(false)}
              className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-300 bg-transparent border-none cursor-pointer text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Close
            </button>
            <h2 className="text-[var(--text-primary)] font-bold truncate mx-4 text-sm">
              {item.title}
              {isTv && ` · S${season}E${episode}`}
            </h2>
            <div className="w-16" />
          </div>
          <div className="flex-1 min-h-0 w-full overflow-y-auto bg-black">
            <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
              {/* Width is capped by both the viewport width and the viewport
                  height (via the 16:9 ratio), so the 16:9 player always fits
                  on screen with no cropping and no dead space. */}
              <div
                className="w-full"
                style={{ maxWidth: 'min(72rem, calc((100dvh - 140px) * 16 / 9))' }}
              >
                <EmbedPlayer
                  tmdbId={item.tmdb_id}
                  imdbId={item.imdb_id}
                  type={isTv ? 'tv' : 'movie'}
                  season={isTv ? season : undefined}
                  episode={isTv ? episode : undefined}
                  title={item.title}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!playing && (
        <div className="page-shell mt-7 pb-8">
          <button
            onClick={() => setPlaying(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold transition-all duration-300 border-none cursor-pointer hover:scale-105 active:scale-95 shadow-2xl"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            {isTv ? `Play Season ${season}` : 'Play Now'}
          </button>
        </div>
      )}

      {similar.length > 0 && (
        <section className="page-shell pb-16" aria-label="More like this">
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-5">More Like This</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {similar.map(s => {
              const href = buildWatchPath({ type: s.type, title: s.title, year: s.year, id: s.tmdb_id });
              return (
                <Link key={s.tmdb_id} href={href} className="group block no-underline">
                  <div className="relative aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-card)] mb-2">
                    {s.poster_path && (
                      <Image
                        src={tmdbImage(s.poster_path, 'w342')}
                        alt={s.title}
                        fill
                        sizes="(max-width:640px) 33vw, 16vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                    {s.title}
                  </p>
                  {s.year && <p className="text-[11px] text-[var(--text-muted)]">{s.year}</p>}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
