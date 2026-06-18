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

async function fromWikipedia(q) {
  // Try exact search first
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
  if (!q) return Response.json({ overview: '' })

  const cacheKey = q.toLowerCase().trim()
  const cached = DISC_CACHE.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < DISC_TTL) {
    return Response.json(cached.data)
  }

  try {
    const overview = await fromWikipedia(q)
    const result = { overview: stripHtml(overview) }
    DISC_CACHE.set(cacheKey, { data: result, timestamp: Date.now() })
    return Response.json(result)
  } catch {
    return Response.json({ overview: '' })
  }
}
