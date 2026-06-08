import { searchTmdb } from '@/_lib/tmdb'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'multi'
  const page = parseInt(searchParams.get('page') || '1')

  if (!query.trim()) {
    return Response.json({ error: 'Query required' }, { status: 400 })
  }

  const data = await searchTmdb(query, type, page)

  if (!data) {
    return Response.json({ error: 'TMDB API key not configured' }, { status: 503 })
  }

  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=600, s-maxage=1800' }
  })
}
