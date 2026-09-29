const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'
const TMDB_TIMEOUT_MS = 10000

function getKey() {
  return process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
}

export function hasTmdbKey() {
  return Boolean(getKey());
}

async function tmdbFetch(endpoint, params = {}) {
  const key = getKey()
  if (!key) return null

  const url = new URL(TMDB_BASE + endpoint)
  url.searchParams.set('api_key', key)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })

  try {
    // A slow upstream call must fail fast instead of blocking a page or API
    // route. Callers already treat null as “unavailable”.
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TMDB_TIMEOUT_MS),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function tmdbImage(path, size = 'original') {
  if (!path) return ''
  return `${IMG_BASE}/${size}${path}`
}

export async function getTrending(type = 'movie', page = 1) {
  const data = await tmdbFetch(`/trending/${type}/week`, { page })
  if (!data?.results) return []
  return data.results.map(m => formatTmdbItem(m, type))
}

export async function getPopular(type = 'movie', page = 1) {
  const data = await tmdbFetch(`/${type}/popular`, { page })
  if (!data?.results) return []
  return data.results.map(m => formatTmdbItem(m, type))
}

export async function getTopRated(type = 'movie', page = 1) {
  const data = await tmdbFetch(`/${type}/top_rated`, { page })
  if (!data?.results) return []
  return data.results.map(m => formatTmdbItem(m, type))
}

export async function searchTmdb(query, type = 'multi', page = 1) {
  const data = await tmdbFetch('/search/' + type, { query, page })
  if (!data?.results) return []
  return data.results.map(m => formatTmdbItem(m, m.media_type || type))
}

/**
 * Resolves a catalogue title to its real TMDB record.
 *
 * WordPress titles are messy ("S01E03 - Title", Arabic prefixes, romanised
 * names), so the caller passes an already-cleaned title. The top result is
 * returned because TMDB's search ranking already accounts for popularity and
 * exact-match weighting.
 */
export async function findByTitle(title, type = 'movie') {
  const clean = String(title || '').trim()
  if (!clean) return null
  const data = await tmdbFetch(`/search/${type}`, { query: clean, page: 1 })
  const results = data?.results
  if (!Array.isArray(results) || results.length === 0) return null
  return formatTmdbItem(results[0], type)
}

export async function getDetails(id, type = 'movie') {
  const data = await tmdbFetch(`/${type}/${id}`, { append_to_response: 'videos,credits' })
  if (!data) return null
  return formatTmdbItem(data, type)
}

/**
 * Full detail for a title, including the imdb_id that list endpoints omit.
 * This is the request the watch page depends on.
 */
export async function getFullDetails(id, type = 'movie') {
  const data = await tmdbFetch(`/${type}/${id}`, { append_to_response: 'credits,external_ids' })
  if (!data) return null
  const item = formatTmdbItem(data, type)
  // external_ids is only present when explicitly requested.
  if (!item.imdb_id && data.external_ids?.imdb_id) {
    item.imdb_id = data.external_ids.imdb_id
  }
  item.credits = {
    cast: (data.credits?.cast || []).slice(0, 12).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path,
    })),
  }
  return item
}

export async function getSeasons(tvId) {
  const data = await tmdbFetch(`/tv/${tvId}`)
  if (!Array.isArray(data?.seasons)) return []
  // Season 0 holds specials, which are not part of the main viewing flow.
  return data.seasons
    .filter(s => s.season_number > 0)
    .map(s => ({ season_number: s.season_number, episode_count: s.episode_count || 0 }))
}

export async function getSeasonEpisodes(tvId, seasonNumber) {
  const data = await tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`)
  if (!Array.isArray(data?.episodes)) return []
  return data.episodes.map(ep => ({
    id: ep.id,
    season_number: ep.season_number,
    episode_number: ep.episode_number,
    name: ep.name,
    overview: ep.overview,
    runtime: ep.runtime || 0,
    still_path: ep.still_path,
  }))
}

export async function getSimilar(id, type = 'movie') {
  const data = await tmdbFetch(`/${type}/${id}/similar`)
  if (!Array.isArray(data?.results)) return []
  return data.results
    .filter(r => r.poster_path)
    .slice(0, 12)
    .map(r => ({ ...formatTmdbItem(r, type), type }))
}

/**
 * One shelf of a single genre, popularity-ordered. Shelves show a handful of
 * titles each; anything specific goes through search instead of a full
 * catalogue grid.
 */
export async function getGenreShelf(type = 'movie', genreId, page = 1) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  // The path is /discover/{type}, not /{type}/discover. The latter resolves as
  // /movie/{id} and returns "Invalid id".
  const data = await tmdbFetch(`/discover/${mediaType}`, {
    page,
    sort_by: 'popularity.desc',
    with_genres: String(genreId),
    'vote_count.gte': 30,
    'with_original_language': 'en',
    include_adult: 'false',
  });
  if (!data?.results) return [];
  return data.results.map(r => formatTmdbItem(r, mediaType));
}

function formatTmdbItem(item, mediaType) {
  const type = mediaType === 'movie' ? 'Movie' : mediaType === 'tv' ? 'TV Show' : item.media_type === 'movie' ? 'Movie' : 'TV Show'
  const title = type === 'Movie' ? item.title : item.name
  const date = type === 'Movie' ? item.release_date : item.first_air_date
  const runtime = type === 'Movie' ? item.runtime : item.episode_run_time?.[0]

  return {
    tmdb_id: item.id,
    // The player needs a real external id. list endpoints omit imdb_id, so it
    // is only present on detail fetches — callers must treat it as optional.
    imdb_id: item.imdb_id || '',
    title,
    original_title: type === 'Movie' ? item.original_title : item.original_name || '',
    type,
    overview: item.overview || '',
    tagline: item.tagline || '',
    status: item.status || '',
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    release_date: date,
    year: date ? date.split('-')[0] : '',
    runtime: runtime || 0,
    genre_ids: item.genre_ids || [],
    genres: item.genres || [],
    original_language: item.original_language || '',
    origin_country: item.origin_country || [],
    popularity: item.popularity || 0,
    number_of_seasons: item.number_of_seasons || 0,
    number_of_episodes: item.number_of_episodes || 0,
  }
}
