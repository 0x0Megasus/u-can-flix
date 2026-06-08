const DISC_CACHE = new Map()
const DISC_TTL = 60 * 60 * 1000

function stripHtml(html) {
  return html ? html.replace(/<[^>]+>/g, '').trim() : ''
}

function isAnime(type) {
  return type === 'Anime' || type === 'Anime Movie' || type === 'anime' || type === 'anime movie'
}

async function fromJikan(q) {
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`, {
    signal: AbortSignal.timeout(5000)
  })
  if (!res.ok) return ''
  const data = await res.json()
  return data?.data?.[0]?.synopsis || ''
}

async function fromTvmaze(q) {
  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, {
    signal: AbortSignal.timeout(5000)
  })
  if (!res.ok) return ''
  const results = await res.json()
  if (!Array.isArray(results) || results.length === 0) return ''
  return results[0].show?.summary || ''
}

async function fromWikipedia(q) {
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=1&origin=*`,
    { signal: AbortSignal.timeout(5000) }
  )
  if (!searchRes.ok) return ''
  const searchData = await searchRes.json()
  const pageTitle = searchData?.query?.search?.[0]?.title || q

  const summaryRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
    { signal: AbortSignal.timeout(5000) }
  )
  if (!summaryRes.ok) return ''
  const summaryData = await summaryRes.json()
  return summaryData?.extract || ''
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const type = searchParams.get('type') || 'tv'

  if (!q) return Response.json({ overview: '' })

  const cacheKey = `${type}:${q.toLowerCase().trim()}`
  const cached = DISC_CACHE.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < DISC_TTL) {
    return Response.json(cached.data)
  }

  try {
    let overview = ''

    if (isAnime(type)) {
      overview = await fromJikan(q)
    }

    if (!overview) {
      overview = await fromTvmaze(q)
    }

    if (!overview && type === 'Movie') {
      overview = await fromWikipedia(q)
    }

    const result = { overview: stripHtml(overview) }
    DISC_CACHE.set(cacheKey, { data: result, timestamp: Date.now() })
    return Response.json(result)
  } catch {
    return Response.json({ overview: '' })
  }
}
