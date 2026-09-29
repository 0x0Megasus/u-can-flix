'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildEmbedCandidates, PROVIDERS, MEDIA_TYPE } from '@/_lib/embed';
import { getProgressFor } from '@/_lib/progress';

const PREFERRED_KEY = 'ucanflix:preferred-servers';

function readPreferred() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PREFERRED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePreferred(list) {
  try {
    window.localStorage.setItem(PREFERRED_KEY, JSON.stringify(list));
  } catch { /* best effort */ }
}

/**
 * Remembers which provider worked last so the next play of the same title
 * opens on the same server instead of re-failing the broken one.
 */
function promoteProvider(providerId) {
  const current = readPreferred().filter(id => id !== providerId);
  writePreferred([providerId, ...current].slice(0, PROVIDERS.length));
}

/**
 * Embeds a title with a provider switcher.
 *
 * `wpFallbackUrl` is the WordPress-hosted player. It is used whenever no
 * TMDB/IMDb id is known, which keeps existing behaviour for titles that
 * cannot be resolved externally.
 */
export default function EmbedPlayer({
  tmdbId,
  imdbId,
  type = MEDIA_TYPE.MOVIE,
  season,
  episode,
  isAnime = false,
  title,
  wpFallbackUrl,
  onTimeUpdate,
}) {
  const [serverId, setServerId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState([]);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(null);
  const containerRef = useRef(null);
  const closeRef = useRef(null);
  const loadTimer = useRef(null);

  const mediaType = useMemo(() => {
    if (type === 'movie' || type === MEDIA_TYPE.MOVIE) return MEDIA_TYPE.MOVIE;
    return MEDIA_TYPE.TV;
  }, [type]);

  const resumeAt = useMemo(() => {
    if (!tmdbId) return 0;
    const entry = getProgressFor(tmdbId);
    if (!entry?.progress?.duration) return 0;
    const ratio = entry.progress.watched / entry.progress.duration;
    if (ratio < 0.01 || ratio > 0.97) return 0;
    return Math.floor(entry.progress.watched);
  }, [tmdbId]);

  const candidates = useMemo(() => {
    const all = buildEmbedCandidates({
      tmdbId,
      imdbId,
      type: mediaType,
      season,
      episode,
      isAnime,
      startAt: resumeAt,
      order: readPreferred(),
    });
    return all.filter(c => !failed.includes(c.id));
  }, [tmdbId, imdbId, mediaType, season, episode, isAnime, resumeAt, failed]);

  const active = candidates[0] || null;

  // Reset when the underlying title changes.
  useEffect(() => {
    setServerId(null);
    setLoaded(false);
    setFailed([]);
    setOpen(false);
    setProgress(resumeAt > 0 ? { seconds: resumeAt, duration: 0 } : null);
  }, [tmdbId, imdbId, mediaType, season, episode, resumeAt]);

  // Never leave the spinner running forever if a provider never fires onLoad.
  useEffect(() => {
    setLoaded(false);
    loadTimer.current = setTimeout(() => setLoaded(true), 12000);
    return () => clearTimeout(loadTimer.current);
  }, [serverId, active?.url]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleServerChange = useCallback((id) => {
    promoteProvider(id);
    setServerId(id);
    setLoaded(false);
    setOpen(false);
  }, []);

  const current = active && (!serverId || active.id === serverId) ? active : candidates.find(c => c.id === serverId) || active;
  const src = current?.url || wpFallbackUrl || '';

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-[var(--text-muted)] text-sm">No player available for this title</p>
      </div>
    );
  }

  const isExternal = Boolean(current);

  // Fills the fit-inside box from the parent exactly: no overflow, no scroll,
  // and the provider's bottom controls are always on screen.
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-muted)] text-sm">Loading player…</span>
        </div>
      )}

      <iframe
        key={src}
        src={src}
        title={title || 'Video player'}
        onLoad={() => { clearTimeout(loadTimer.current); setLoaded(true); if (current) promoteProvider(current.id); }}
        className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *"
        allowFullScreen
        playsInline
        referrerPolicy="origin"
      />

      {isExternal && candidates.length > 0 && (
        <div className="absolute top-3 right-3 z-20">
          <div className="relative">
            <button
              type="button"
              ref={open ? closeRef : undefined}
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-haspopup="listbox"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md border border-white/15 hover:bg-black/80 transition-colors duration-200 cursor-pointer"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h11l-3-3M20 17H9l3 3" />
              </svg>
              {current?.label || 'Server'}
            </button>

            {open && (
              <ul
                role="listbox"
                className="absolute right-0 mt-2 min-w-[160px] rounded-[var(--radius-md)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-default)] shadow-[var(--shadow-elevated)] overflow-hidden py-1"
              >
                {candidates.map(candidate => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={candidate.id === current?.id}
                      onClick={() => handleServerChange(candidate.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                        candidate.id === current?.id
                          ? 'text-[var(--accent)] bg-[var(--accent-subtle)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {candidate.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {progress && resumeAt > 0 && (
        <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md border border-white/15">
          Resuming at {Math.floor(resumeAt / 60)}:{String(resumeAt % 60).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
