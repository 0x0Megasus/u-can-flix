import { requireEnv } from '@/_lib/env';

const WP_BASE = requireEnv('WP_API_BASE');
const WP_ORIGIN = requireEnv('WP_ORIGIN');
const MAX_PER_PAGE = 100;
const MAX_PAGE = 100;

function toBoundedNumber(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function sanitizeCategories(value) {
  if (!value) return '';
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => /^\d+$/.test(item))
    .slice(0, 20)
    .join(',');
}

function buildWpSearchParams(searchParams) {
  const params = new URLSearchParams();
  params.set('per_page', String(toBoundedNumber(searchParams.get('per_page'), 50, 1, MAX_PER_PAGE)));
  params.set('page', String(toBoundedNumber(searchParams.get('page'), 1, 1, MAX_PAGE)));

  const search = (searchParams.get('search') || '').trim().slice(0, 120);
  if (search) params.set('search', search);

  const categories = sanitizeCategories(searchParams.get('categories') || '');
  if (categories) params.set('categories', categories);

  const embed = searchParams.get('_embed');
  if (embed !== null) {
    const allowedEmbeds = embed
      .split(',')
      .map(item => item.trim())
      .filter(item => item === 'wp:featuredmedia' || item === 'wp:term')
      .join(',');
    params.set('_embed', allowedEmbeds);
  }

  return params;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = buildWpSearchParams(searchParams).toString();
    const url = new URL(WP_BASE + '/posts' + (queryString ? '?' + queryString : ''));

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'UCanFlix/1.0',
        'Origin': WP_ORIGIN,
        'Referer': WP_ORIGIN + '/'
      },
      signal: AbortSignal.timeout(20000)
    });

    const total = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    if (!response.ok) {
      return Response.json({ error: `API error ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const seen = new Set();
    const deduped = Array.isArray(data) ? data.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    }) : data;

    const headers = new Headers();
    if (total) headers.set('X-WP-Total', total);
    if (totalPages) headers.set('X-WP-TotalPages', totalPages);
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600');

    return Response.json(deduped, { headers });
  } catch (err) {
    return Response.json({ error: 'Proxy error', message: err.message }, { status: 500 });
  }
}
