const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'

function getKey() {
  return process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || ''
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
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
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

export async function getDetails(id, type = 'movie') {
  const data = await tmdbFetch(`/${type}/${id}`, { append_to_response: 'videos,credits' })
  if (!data) return null
  return formatTmdbItem(data, type)
}

function formatTmdbItem(item, mediaType) {
  const type = mediaType === 'movie' ? 'Movie' : mediaType === 'tv' ? 'TV Show' : item.media_type === 'movie' ? 'Movie' : 'TV Show'
  const title = type === 'Movie' ? item.title : item.name
  const date = type === 'Movie' ? item.release_date : item.first_air_date

  return {
    tmdb_id: item.id,
    title,
    type,
    overview: item.overview || '',
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    release_date: date,
    year: date ? date.split('-')[0] : '',
    genre_ids: item.genre_ids || [],
    genres: item.genres || [],
    original_language: item.original_language || '',
    popularity: item.popularity || 0,
  }
}
