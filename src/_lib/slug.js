/**
 * URL helpers.
 *
 * Public URLs are readable slugs with the numeric id appended, e.g.
 *   /watch/movie/inception-2010-27205
 *   /watch/series/breaking-bad-2008-1396
 *
 * The trailing number keeps resolution a single lookup-free operation while the
 * readable part keeps the link something a person would not be embarrassed to
 * share.
 *
 * The media type is part of the path on purpose. Movie and TV ids live in
 * separate namespaces, so /1396 is a Breaking Bad episode list *and* an
 * unrelated 1975 film. Guessing the type from a probe request silently served
 * the wrong title, so it is stated explicitly.
 */

/** Strips the marketing suffixes WordPress-free catalogues tend to carry. */
export function toSlug(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^\p{L}\p{N}]+/gu, '-') // anything non-alphanumeric
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80);
}

export const TYPE_SEGMENT = { movie: 'movie', tv: 'series' };

export function buildWatchPath({ type, title, year, id }) {
  const segment = TYPE_SEGMENT[type === 'tv' ? 'tv' : 'movie'];
  const parts = [toSlug(title), year || '', id].filter(Boolean);
  return `/watch/${segment}/${parts.join('-')}`;
}

const TRAILING_ID = /-(\d+)$/;

/** Reads the id back out of a watch path. Returns null when absent. */
export function parseWatchSlug(slug) {
  const match = TRAILING_ID.exec(String(slug || ''));
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Maps a path segment back to a media type. Unknown segments return null. */
export function normaliseMediaType(raw) {
  const value = String(raw || '').toLowerCase();
  if (value === 'movie' || value === 'movies' || value === 'film') return 'movie';
  if (value === 'series' || value === 'tv' || value === 'show' || value === 'tv-show') return 'tv';
  return null;
}

export const TYPE_LABEL = { movie: 'Movie', tv: 'TV Show' };

export const TYPE_ACCENT = { movie: '#e50914', tv: '#3b82f6' };
