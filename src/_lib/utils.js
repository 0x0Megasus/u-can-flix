export function getFeaturedImage(item, preferred = 'full') {
  const media = item._embedded?.['wp:featuredmedia'];
  if (!media?.length) return '';

  const mediaItem = media[0];
  const sizes = mediaItem?.media_details?.sizes;

  if (sizes) {
    const sorted = Object.entries(sizes)
      .filter(([, s]) => s?.source_url)
      .sort((a, b) => (b[1].width || 0) - (a[1].width || 0));

    if (preferred === 'full' && sorted.length > 0) {
      return sorted[0][1].source_url;
    }

    if (preferred !== 'full') {
      const prefer = preferred === 'medium' ? 300 : preferred === 'medium_large' ? 768 : 1024;
      const best = sorted.find(([, s]) => (s.width || 0) <= prefer) || sorted[sorted.length - 1];
      if (best) return best[1].source_url;
    }
  }

  return mediaItem?.source_url || '';
}

const IMDB_SIZE_RE = /_(SX|SY|UX|UY)(\d+)(_|\.)/i;

export function getHighResImage(url) {
  if (!url) return '';

  const match = url.match(IMDB_SIZE_RE);
  if (match) {
    const currentSize = parseInt(match[2], 10);
    const targetSize = Math.max(currentSize, 1920);
    if (targetSize > currentSize) {
      return url.replace(IMDB_SIZE_RE, `_${match[1]}${targetSize}${match[3]}`);
    }
  }

  return url;
}

export function getCategoryIds(item) {
  if (!item) return [];
  const ids = new Set();
  if (Array.isArray(item.categories)) {
    item.categories.forEach(id => ids.add(Number(id)));
  }
  const terms = item._embedded?.['wp:term'];
  if (terms) {
    terms.forEach(group => {
      if (Array.isArray(group)) {
        group.forEach(term => {
          if (term?.id) ids.add(Number(term.id));
        });
      }
    });
  }
  return Array.from(ids);
}

export function detectType(item) {
  const cats = getCategoryIds(item);
  const isAnimeCat = cats.some(c => [5, 8].includes(c));
  const isTVCat = cats.some(c => [7, 9].includes(c));
  const isMovieCat = cats.some(c => [3, 4].includes(c));

  const title = (item.title?.rendered || '').toLowerCase();
  const hasAnimeKeyword = /انمي|anime|otaku/i.test(title);
  const hasTVKeyword = /مسلسل|series|season|الموسم|الحلقة|episode/i.test(title);
  const hasMovieKeyword = /فيلم|movie/i.test(title);

  if (isAnimeCat && !isTVCat && !isMovieCat) {
    return 'Anime';
  }
  if (isAnimeCat && !isTVCat && (isMovieCat || (hasMovieKeyword && !hasTVKeyword))) {
    return 'Anime Movie';
  }
  if (isTVCat) return 'TV Show';
  if (isMovieCat) return 'Movie';

  if (hasAnimeKeyword) {
    if (hasMovieKeyword && !hasTVKeyword) return 'Anime Movie';
    return 'Anime';
  }
  if (hasTVKeyword) return 'TV Show';

  return /season|episode|الموسم|الحلقة/i.test(title) ? 'TV Show' : 'Movie';
}

export function detectSeason(title) {
  const m = title.match(/season\s*(\d+)/i) || title.match(/الموسم\s*(\d+)/i);
  return m ? `S${m[1]}` : '';
}

export function extractQuality(title) {
  const m = title.match(/(\d+p)\s*(WEB-DL|BluRay|WEBRip|HDRip|DVD|BRRip|HDTV|WEB|CAM|TS|TC)/i)
    || title.match(/(WEB-DL|BluRay|WEBRip|HDRip|DVD|BRRip|HDTV|WEB|CAM|TS|TC)/i)
    || title.match(/(\d+p)/i);
  return m ? m[0] : '';
}

export function cleanExcerpt(item) {
  const html = item.excerpt?.rendered || item.content?.rendered || '';
  if (!html) return 'No description available';
  if (typeof document !== 'undefined') {
    const d = document.createElement('div');
    d.innerHTML = html;
    const text = (d.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return 'No description available';
    return text.length > 200 ? text.slice(0, 200) + '\u2026' : text;
  }
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);
}

export function parseEpisode(title) {
  if (!title) return { name: '', season: 0, episode: 0 }

  let t = title.trim()

  const ARABIC_ORDINALS = {
    '\u0627\u0644\u0623\u0648\u0644': 1, '\u0627\u0644\u0627\u0648\u0644': 1,
    '\u0627\u0644\u062b\u0627\u0646\u064a': 2, '\u0627\u0644\u062a\u0627\u0646\u064a': 2,
    '\u0627\u0644\u062b\u0627\u0644\u062b': 3, '\u0627\u0644\u062a\u0627\u0644\u062a': 3,
    '\u0627\u0644\u0631\u0627\u0628\u0639': 4,
    '\u0627\u0644\u062e\u0627\u0645\u0633': 5,
    '\u0627\u0644\u0633\u0627\u062f\u0633': 6,
    '\u0627\u0644\u0633\u0627\u0628\u0639': 7,
    '\u0627\u0644\u062b\u0627\u0645\u0646': 8,
    '\u0627\u0644\u062a\u0627\u0633\u0639': 9,
    '\u0627\u0644\u0639\u0627\u0634\u0631': 10,
  }

  const ordinalPattern = Object.keys(ARABIC_ORDINALS).join('|')

  t = t.replace(/^(\u0645\u0633\u0644\u0633\u0644|\u0627\u0646\u0645\u064a|series|anime|\u0641\u064a\u0644\u0645|movie)\s+/i, '').trim()

  t = t.replace(/\d{3,4}p(?:\s*(?:WEB-DL|BluRay|WEBRip|HDRip|DVD|BRRip|HDTV|WEB|CAM|TS|TC))?/gi, '').trim()
  t = t.replace(/(?:WEB-DL|BluRay|WEBRip|HDRip|DVD|BRRip|HDTV|WEB|CAM|TS|TC)\s*\d*p?/gi, '').trim()

  t = t.replace(/\s*\u0645\u062a\u0631\u062c\u0645\s*\u0627\u0648\u0646\s*\u0644\u0627\u064a\u0646\s*/gi, ' ').trim()
  t = t.replace(/\s*\u0645\u062a\u0631\u062c\u0645\u0629\s*/gi, ' ').trim()
  t = t.replace(/\s*\u0645\u062a\u0631\u062c\u0645\s+$/gi, ' ').trim()
  t = t.replace(/\s*\u0648\u0627\u0644\u0627\u062e\u064a\u0631\u0629\s*/gi, ' ').trim()
  t = t.replace(/\s{2,}/g, ' ').trim()

  let season = 0
  let episode = 0

  const sxeMatch = t.match(/S(\d+)\s*E(\d+)/i)
  if (sxeMatch) {
    season = parseInt(sxeMatch[1])
    episode = parseInt(sxeMatch[2])
    const sxeIndex = t.search(/S\d+\s*E\d+/i)
    return { name: t.slice(0, sxeIndex).trim(), season, episode }
  }

  const axbMatch = t.match(/(\d+)\s*x\s*(\d+)/i)
  if (axbMatch) {
    season = parseInt(axbMatch[1])
    episode = parseInt(axbMatch[2])
    const axbIndex = t.search(/\d+\s*x\s*\d+/i)
    return { name: t.slice(0, axbIndex).trim(), season, episode }
  }

  let markerIndex = t.length

  const seasonMatch = t.match(new RegExp(`\u0627\u0644\u0645\u0648\u0633\u0645\\s+(${ordinalPattern})`, 'i'))
  if (seasonMatch) {
    season = ARABIC_ORDINALS[seasonMatch[1]]
    if (seasonMatch.index < markerIndex) markerIndex = seasonMatch.index
  } else {
    const seasonDigit = t.match(/\u0627\u0644\u0645\u0648\u0633\u0645\s*(\d+)/i)
    if (seasonDigit) {
      season = parseInt(seasonDigit[1])
      if (seasonDigit.index < markerIndex) markerIndex = seasonDigit.index
    }
  }

  const episodeMatch = t.match(/\u0627\u0644\u062d\u0644\u0642\u0629\s*(\d+)/i)
  if (episodeMatch) {
    episode = parseInt(episodeMatch[1])
    if (episodeMatch.index < markerIndex) markerIndex = episodeMatch.index
  }

  const name = t.slice(0, markerIndex).trim()

  return { name, season, episode }
}

export function stripArabic(text) {
  if (!text) return ''
  let t = text

  if (typeof document !== 'undefined') {
    const el = document.createElement('div')
    el.innerHTML = t
    t = el.textContent || ''
  }

  const indicMap = { '\u0660': '0', '\u0661': '1', '\u0662': '2', '\u0663': '3', '\u0664': '4', '\u0665': '5', '\u0666': '6', '\u0667': '7', '\u0668': '8', '\u0669': '9' }
  t = t.replace(/[\u0660-\u0669]/g, d => indicMap[d])

  const ORDINALS = {
    '\u0627\u0644\u0623\u0648\u0644': '1', '\u0627\u0644\u0627\u0648\u0644': '1',
    '\u0627\u0644\u062b\u0627\u0646\u064a': '2', '\u0627\u0644\u062a\u0627\u0646\u064a': '2',
    '\u0627\u0644\u062b\u0627\u0644\u062b': '3', '\u0627\u0644\u062a\u0627\u0644\u062a': '3',
    '\u0627\u0644\u0631\u0627\u0628\u0639': '4',
    '\u0627\u0644\u062e\u0627\u0645\u0633': '5',
    '\u0627\u0644\u0633\u0627\u062f\u0633': '6',
    '\u0627\u0644\u0633\u0627\u0628\u0639': '7',
    '\u0627\u0644\u062b\u0627\u0645\u0646': '8',
    '\u0627\u0644\u062a\u0627\u0633\u0639': '9',
    '\u0627\u0644\u0639\u0627\u0634\u0631': '10',
  }
  for (const [word, num] of Object.entries(ORDINALS).sort(([a], [b]) => b.length - a.length)) {
    t = t.replace(new RegExp(`\\s*${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'gi'), ` ${num} `)
  }

  t = t.replace(/\s*\u0627\u0644\u0645\u0648\u0633\u0645\s*(\d+)\s*/gi, (_, num) => ` Season ${num} `)
  t = t.replace(/\s*\u0627\u0644\u062d\u0644\u0642\u0629\s*(\d+)\s*/gi, (_, num) => ` Episode ${num} `)

  const noise = ['\u0645\u062a\u0631\u062c\u0645 \u0627\u0648\u0646 \u0644\u0627\u064a\u0646', '\u0645\u062a\u0631\u062c\u0645\u0629', '\u0645\u062a\u0631\u062c\u0645', '\u0648\u0627\u0644\u0627\u062e\u064a\u0631\u0629', '\u0648\u0627\u0644\u0623\u062e\u064a\u0631\u0629', '\u0627\u0648\u0646 \u0644\u0627\u064a\u0646', '\u0627\u0646\u0645\u064a', '\u0645\u0633\u0644\u0633\u0644', '\u0641\u064a\u0644\u0645', 'series', 'anime', 'movie']
    .sort((a, b) => b.length - a.length)
  for (const word of noise) {
    t = t.replace(new RegExp(`\\s*${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'gi'), ' ')
  }

  t = t.replace(/[\u0600-\u06FF]/g, '')
  t = t.replace(/\s+/g, ' ').trim()

  return t
}

export function getCleanTitle(item) {
  const raw = item.title?.rendered || ''
  if (!raw) return 'Untitled'

  let decoded = raw
  if (typeof document !== 'undefined') {
    const el = document.createElement('div')
    el.innerHTML = raw
    decoded = el.textContent || ''
  }

  const { name } = parseEpisode(decoded)
  if (!name) return 'Untitled'
  let clean = name
    .replace(/\d{3,4}p(?:\s*(?:WEB-DL|BluRay|WEBRip|HDRip|DVD|BRRip|HDTV|WEB|CAM|TS|TC))?/gi, '')
    .replace(/(?:WEB-DL|BluRay|WEBRip|HDRip|DVD|BRRip|HDTV|WEB|CAM|TS|TC)\s*\d*p?/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/[\u0600-\u06FF]/g, '')
    .replace(/\s*\(\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return clean || name.replace(/[\u0600-\u06FF]/g, '').trim() || 'Untitled'
}

function stripSubtitle(name) {
  return name.replace(/\s*[:|\u2013\u2014\-–—|]\s*.*$/, '').trim()
}

export function showKey(name) {
  return name.toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function groupByShow(posts) {
  const map = {}
  const baseMap = {}
  const seen = new Set()

  posts.forEach(post => {
    if (seen.has(post.id)) return
    seen.add(post.id)

    const { name, season, episode } = parseEpisode(post.title?.rendered || '')
    if (!name) return
    const key = showKey(name)
    const base = showKey(stripSubtitle(name))

    let groupKey = key
    if (!map[key] && baseMap[base]) {
      groupKey = baseMap[base]
    }

    if (!map[groupKey]) {
      map[groupKey] = { displayName: name, posts: [], seasons: {}, hasRealSeasons: false }
      baseMap[base] = groupKey
    }

    const group = map[groupKey]
    if (name.length > group.displayName.length) {
      group.displayName = name
    }
    group.posts.push(post)

    const s = season || 1
    if (!group.seasons[s]) group.seasons[s] = []
    group.seasons[s].push({ ...post, season: s, episode })
    if (season > 0) group.hasRealSeasons = true
  })

  return Object.values(map)
}

export function pickBiggestSeason(group) {
  const seasons = Object.entries(group.seasons)
  if (!seasons.length) return { seasonNum: 0, episodeCount: 0, posts: [], representative: null, totalEpisodeCount: 0 }

  const completeSeasons = seasons.filter(([, posts]) => posts.length > 1)
  const candidateSeasons = completeSeasons.length > 0 ? completeSeasons : seasons

  let best = { seasonNum: 0, episodeCount: 0, posts: [], representative: null }
  for (const [s, posts] of candidateSeasons) {
    const sn = parseInt(s)
    if (posts.length > best.episodeCount || (posts.length === best.episodeCount && sn > best.seasonNum)) {
      const sorted = [...posts].sort((a, b) => (b.episode || 0) - (a.episode || 0))
      best = { seasonNum: sn, episodeCount: posts.length, posts, representative: sorted[0] }
    }
  }

  if (!group.hasRealSeasons) best.seasonNum = 0
  best.totalEpisodeCount = best.episodeCount
  return best
}

export function hasFullSeason(group) {
  const seasons = Object.values(group.seasons || {})
  return seasons.some(posts => posts.length > 1)
}

export function scoreGroup(group) {
  const displayName = group.displayName || ''
  let score = 0
  if (/netflix/i.test(displayName)) score += 50
  const seasons = Object.values(group.seasons)
  const totalEps = seasons.reduce((sum, posts) => sum + posts.length, 0)
  score += Math.min(totalEps, 30)
  const dates = seasons.flat().map(p => new Date(p.date || 0).getTime()).filter(Boolean)
  if (dates.length) {
    const latest = Math.max(...dates)
    const daysAgo = (Date.now() - latest) / 86400000
    if (daysAgo < 7) score += 20
    else if (daysAgo < 30) score += 10
    else if (daysAgo < 90) score += 5
  }
  return score
}

export function normalizeText(text) {
  return text.toLowerCase()
    .replace(/[\u0623\u0625\u0622\u0627]/g, 'a')
    .replace(/\u0649/g, 'y')
    .replace(/\u0624/g, 'w')
    .replace(/\u0626/g, 'e')
    .replace(/\u0629/g, 'h')
    .replace(/[\u0651\u0650\u064f\u064f\u064c\u064d\u064e\u0652]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function tokenize(text) {
  return text.toLowerCase().split(/\s+/).filter(Boolean)
}

function textContainsAny(text, terms) {
  const lower = text.toLowerCase()
  return terms.some(t => lower.includes(t))
}

const GENRE_KEYWORDS = {
  '\u0633\u064a\u0631\u0629 \u0630\u0627\u062a\u064a\u0629': 'Biography',
  '\u062e\u064a\u0627\u0644 \u0639\u0644\u0645\u064a': 'Sci-Fi',
  '\u0627\u0643\u0634\u0646': 'Action',
  '\u0623\u0643\u0634\u0646': 'Action',
  '\u0643\u0648\u0645\u064a\u062f\u064a': 'Comedy',
  '\u0643\u0648\u0645\u064a\u062f\u0649': 'Comedy',
  '\u0643\u0648\u0645\u064a\u062f\u064a\u0627': 'Comedy',
  '\u062f\u0631\u0627\u0645\u0627': 'Drama',
  '\u062f\u0631\u0627\u0645\u064a': 'Drama',
  '\u062f\u0631\u0627\u0645\u064a\u0629': 'Drama',
  '\u0631\u0639\u0628': 'Horror',
  '\u0645\u0631\u0639\u0628': 'Horror',
  '\u0631\u0648\u0645\u0627\u0646\u0633\u064a': 'Romance',
  '\u0631\u0648\u0645\u0627\u0646\u0633\u0649': 'Romance',
  '\u0631\u0648\u0645\u0627\u0646\u0633\u064a\u0629': 'Romance',
  '\u0627\u062b\u0627\u0631\u0629': 'Thriller',
  '\u0625\u062b\u0627\u0631\u0629': 'Thriller',
  '\u062a\u0634\u0648\u064a\u0642': 'Thriller',
  '\u0645\u063a\u0627\u0645\u0631\u0629': 'Adventure',
  '\u0645\u063a\u0627\u0645\u0631\u0627\u062a': 'Adventure',
  '\u062c\u0631\u064a\u0645\u0629': 'Crime',
  '\u063a\u0645\u0648\u0636': 'Mystery',
  '\u0648\u062b\u0627\u0626\u0642\u064a': 'Documentary',
  '\u062a\u0627\u0631\u064a\u062e\u064a': 'Historical',
  '\u0639\u0627\u0626\u0644\u064a': 'Family',
  '\u0641\u0627\u0646\u062a\u0627\u0632\u064a\u0627': 'Fantasy',
  '\u0645\u0648\u0633\u064a\u0642\u064a': 'Musical',
  '\u0628\u0648\u0644\u064a\u0633\u064a': 'Crime',
  '\u0631\u064a\u0627\u0636\u0629': 'Sports',
  '\u0631\u064a\u0627\u0636\u064a': 'Sports',
  '\u062d\u0631\u0628': 'War',
}

export function extractGenres(item) {
  const html = item.content?.rendered || item.excerpt?.rendered || ''
  if (!html) return []

  let text = html
  if (typeof document !== 'undefined') {
    const d = document.createElement('div')
    d.innerHTML = html
    text = d.textContent || ''
  }

  const found = []
  const seen = new Set()

  const sorted = Object.entries(GENRE_KEYWORDS).sort(([a], [b]) => b.length - a.length)

  for (const [arabic, english] of sorted) {
    if (seen.has(english)) continue
    const regex = new RegExp(arabic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    if (regex.test(text)) {
      seen.add(english)
      found.push(english)
    }
  }

  return found
}

const GENRE_SYNONYMS = {
  action: ['action', '\u0627\u0643\u0634\u0646', '\u0623\u0643\u0634\u0646', '\u062d\u0631\u0643\u0629', '\u062d\u0631\u0643\u0647'],
  comedy: ['comedy', '\u0643\u0648\u0645\u064a\u062f\u064a', '\u0643\u0648\u0645\u064a\u062f\u0649', '\u0643\u0648\u0645\u064a\u062f\u064a\u0627', '\u0636\u062d\u0643', '\u0645\u0636\u062d\u0643'],
  romance: ['romance', '\u0631\u0648\u0645\u0627\u0646\u0633\u064a', '\u0631\u0648\u0645\u0627\u0646\u0633\u0649', '\u0631\u0648\u0645\u0627\u0646\u0633\u064a\u0629', '\u062d\u0628', '\u063a\u0631\u0627\u0645', '\u0639\u0634\u0642'],
  horror: ['horror', '\u0631\u0639\u0628', '\u0645\u0631\u0639\u0628', '\u0645\u062e\u064a\u0641'],
  drama: ['drama', '\u062f\u0631\u0627\u0645\u0627'],
  thriller: ['thriller', '\u0627\u062b\u0627\u0631\u0629', '\u0625\u062b\u0627\u0631\u0629', '\u062a\u0634\u0648\u064a\u0642'],
  adventure: ['adventure', '\u0645\u063a\u0627\u0645\u0631\u0629', '\u0645\u063a\u0627\u0645\u0631\u0627\u062a'],
}

export function matchTitle(item, query) {
  const title = item.title?.rendered || ''
  const q = query.toLowerCase().trim()

  if (title.toLowerCase().includes(q)) return true

  const normalizedTitle = normalizeText(title)
  const normalizedQuery = normalizeText(query)
  if (normalizedTitle.includes(normalizedQuery)) return true

  const titleTokens = tokenize(title)
  const queryTokens = tokenize(q)
  if (queryTokens.some(qt => titleTokens.some(tt => tt.includes(qt) || qt.includes(tt)))) return true

  const synonyms = GENRE_SYNONYMS[q]
  if (synonyms && textContainsAny(title, synonyms)) return true

  return false
}
