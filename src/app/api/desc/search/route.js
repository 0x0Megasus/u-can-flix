const DISC_CACHE = new Map()
const DISC_TTL = 60 * 60 * 1000

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
}

function stripHtml(html) {
  if (!html) return ''
  return decodeEntities(html.replace(/<[^>]+>/g, '').trim())
}

function isAnime(type) {
  return type === 'Anime' || type === 'Anime Movie' || type === 'anime' || type === 'anime movie'
}

function titleMatches(query, resultTitle) {
  const qTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2)
  const rTokens = resultTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2)
  if (!qTokens.length || !rTokens.length) return true
  const matches = qTokens.filter(qt => rTokens.some(rt => rt.includes(qt) || qt.includes(rt)))
  return matches.length >= Math.min(2, qTokens.length)
}

async function fromJikan(q) {
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=3`, {
    signal: AbortSignal.timeout(5000)
  })
  if (!res.ok) return ''
  const data = await res.json()
  const items = data?.data || []
  for (const item of items) {
    if (titleMatches(q, item.title || '')) {
      return item.synopsis || ''
    }
  }
  return ''
}

async function fromTvmaze(q) {
  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, {
    signal: AbortSignal.timeout(5000)
  })
  if (!res.ok) return ''
  const results = await res.json()
  if (!Array.isArray(results) || results.length === 0) return ''
  for (const result of results) {
    if (titleMatches(q, result.show?.name || '')) {
      return result.show?.summary || ''
    }
  }
  return ''
}

async function fromWikipedia(q) {
  let summaryRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`,
    { signal: AbortSignal.timeout(5000) }
  )

  if (summaryRes.status === 404) {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=3&origin=*`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!searchRes.ok) return ''
    const searchData = await searchRes.json()
    const pages = searchData?.query?.search || []
    for (const page of pages) {
      summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (summaryRes.ok) break
    }
  }

  if (!summaryRes.ok) return ''
  const summaryData = await summaryRes.json()

  if (summaryData?.type === 'disambiguation') return ''

  const extract = summaryData?.extract || ''
  if (extract.length < 40) return ''
  if (/may refer to:/.test(extract)) return ''

  return extract
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
      if (!overview) overview = await fromWikipedia(q)
    } else if (type === 'Movie' || type === 'movie') {
      overview = await fromWikipedia(q)
    } else {
      overview = await fromTvmaze(q)
      if (!overview) overview = await fromWikipedia(q)
    }

    const result = { overview: stripHtml(overview) }
    DISC_CACHE.set(cacheKey, { data: result, timestamp: Date.now() })
    return Response.json(result)
  } catch {
    return Response.json({ overview: '' })
  }
}
