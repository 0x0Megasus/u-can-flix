export const BRAND_HEX = 'e50914';

export const MEDIA_TYPE = {
  MOVIE: 'movie',
  TV: 'tv',
};

function toBoundedInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function withParams(url, params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return url;
  const search = new URLSearchParams(entries);
  return url.includes('?') ? `${url}&${search.toString()}` : `${url}?${search.toString()}`;
}

/**
 * Embed providers, ordered by default preference.
 *
 * Only parameters actually documented by each provider are sent, so an
 * unsupported key can never be interpreted as a media id.
 *
 * Domains and reachability were verified 2026-09-29. vidfast.pro answers
 * with a 301, so its mirrors are listed ahead of it.
 */
export const PROVIDERS = [
  {
    id: 'twoembed',
    label: '2Embed',
    domains: ['www.2embed.cc', 'www.2embed.skin'],
    supportsAnime: true,
    build: ({ id, type, season, episode, autoplay }) => {
      const params = { autoPlay: autoplay ? 'true' : 'false' };
      if (type === MEDIA_TYPE.TV) {
        return withParams(`https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`, params);
      }
      return withParams(`https://www.2embed.cc/embed/${id}`, params);
    },
  },
  {
    id: 'vidnest',
    label: 'VidNest',
    domains: ['vidnest.fun'],
    supportsAnime: true,
    build: ({ id, type, season, episode, autoplay }) => {
      if (type === MEDIA_TYPE.TV) return `https://vidnest.fun/tv/${id}/${season}/${episode}`;
      return `https://vidnest.fun/movie/${id}`;
    },
  },
  {
    id: 'vidlink',
    label: 'VidLink',
    domains: ['vidlink.pro'],
    supportsAnime: true,
    // Documented params: primaryColor / secondaryColor / iconColor.
    theme: { primaryColor: BRAND_HEX, secondaryColor: '4a4a52', iconColor: BRAND_HEX },
    build: ({ id, type, season, episode }) => {
      if (type === MEDIA_TYPE.TV) return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
      return `https://vidlink.pro/movie/${id}`;
    },
  },
  {
    id: 'peachify',
    label: 'Peachify',
    domains: ['peachify.top'],
    supportsAnime: true,
    // Documented params: accent / autoPlay / autoNext / startAt.
    theme: { accent: BRAND_HEX, autoPlay: 'false' },
    build: ({ id, type, season, episode }) => {
      if (type === MEDIA_TYPE.TV) return `https://peachify.top/embed/tv/${id}/${season}/${episode}`;
      return `https://peachify.top/embed/movie/${id}`;
    },
  },
  {
    id: 'vidup',
    label: 'VidUp',
    domains: ['vidup.to', 'www.vidup.to'],
    supportsAnime: false,
    build: ({ id, type, season, episode }) => {
      if (type === MEDIA_TYPE.TV) return `https://vidup.to/tv/${id}/${season}/${episode}?autoPlay=false`;
      return `https://vidup.to/movie/${id}?autoPlay=false`;
    },
  },
  {
    id: 'vidfast',
    label: 'VidFast',
    domains: ['vidfast.in', 'vidfast.io', 'vidfast.me', 'vidfast.net', 'vidfast.pm', 'vidfast.xyz', 'vidfast.pro'],
    supportsAnime: false,
    // Documented param: theme.
    theme: { theme: BRAND_HEX },
    build: ({ id, type, season, episode, domain }) => {
      const host = domain || 'vidfast.in';
      if (type === MEDIA_TYPE.TV) return `https://${host}/tv/${id}/${season}/${episode}?autoPlay=false`;
      return `https://${host}/movie/${id}?autoPlay=false`;
    },
  },
  {
    id: 'vidsrc',
    label: 'VidSrc',
    domains: ['vidsrc.fyi'],
    supportsAnime: false,
    build: ({ id, type, season, episode }) => {
      if (type === MEDIA_TYPE.TV) return `https://vidsrc.fyi/embed/tv/${id}/${season}/${episode}`;
      return `https://vidsrc.fyi/embed/movie/${id}`;
    },
  },
];

const PROVIDER_BY_ID = new Map(PROVIDERS.map(p => [p.id, p]));

export function getProvider(id) {
  return PROVIDER_BY_ID.get(id) || null;
}

function normalizeType(type) {
  return type === MEDIA_TYPE.TV ? MEDIA_TYPE.TV : MEDIA_TYPE.MOVIE;
}

/**
 * Builds the ordered list of player URLs for a title.
 *
 * Returns an empty array when no TMDB/IMDb ID is known — that is the signal
 * for the caller to fall back to the WordPress-hosted player, which is the
 * behaviour that exists today.
 */
export function buildEmbedCandidates({
  tmdbId,
  imdbId,
  type = MEDIA_TYPE.MOVIE,
  season,
  episode,
  isAnime = false,
  startAt,
  autoplay = false,
  order = [],
}) {
  if (!tmdbId && !imdbId) return [];

  const id = tmdbId ? String(tmdbId) : String(imdbId);
  const mediaType = normalizeType(type);
  const s = toBoundedInt(season, 1, 0, 99);
  const e = toBoundedInt(episode, 1, 0, 999);
  const resume = startAt ? Math.max(0, Math.floor(Number(startAt) || 0)) : 0;

  const preferred = new Set(order);
  const ranked = [...PROVIDERS].sort((a, b) => {
    const aScore = preferred.has(a.id) ? 1 : 0;
    const bScore = preferred.has(b.id) ? 1 : 0;
    if (aScore !== bScore) return bScore - aScore;
    return PROVIDERS.indexOf(a) - PROVIDERS.indexOf(b);
  });

  const candidates = [];

  for (const provider of ranked) {
    if (isAnime && !provider.supportsAnime) continue;

    let url = provider.build({ id, type: mediaType, season: s, episode: e, autoplay });
    if (provider.theme) url = withParams(url, provider.theme);
    if (resume > 0) url = withParams(url, { startAt: resume });

    if (!url) continue;

    candidates.push({
      id: provider.id,
      label: provider.label,
      url,
    });
  }

  return candidates;
}
