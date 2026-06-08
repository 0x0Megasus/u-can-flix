import { getTrending, getPopular } from '@/_lib/tmdb'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'movie'
  const page = parseInt(searchParams.get('page') || '1')
  const source = searchParams.get('source') || 'trending'

  let data
  if (source === 'popular') {
    data = await getPopular(type, page)
  } else {
    data = await getTrending(type, page)
  }

  if (!data) {
    return Response.json({ error: 'TMDB API key not configured or request failed' }, { status: 503 })
  }

  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=7200' }
  })
}
