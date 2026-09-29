import { getSeasonEpisodes } from '@/_lib/tmdb';

export const revalidate = 3600;

/**
 * The watch page is a client component (season and episode switching, resume
 * tracking), but the TMDB key is a private server env var. Episodes therefore
 * have to come back through a route handler rather than a direct import.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const id = Number.parseInt(searchParams.get('id') || '', 10);
  const season = Number.parseInt(searchParams.get('season') || '', 10);

  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(season) || season <= 0) {
    return Response.json({ error: 'invalid id or season' }, { status: 400 });
  }

  try {
    const episodes = await getSeasonEpisodes(id, season);
    return Response.json(
      { episodes },
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch {
    return Response.json({ episodes: [] });
  }
}
