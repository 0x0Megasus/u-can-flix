const DESC_CACHE = new Map()
const CACHE_TTL = 60 * 60 * 1000

export function clearDescCache() {
  DESC_CACHE.clear()
}

export async function fetchDescription(title, type) {
  if (!title) return null

  const cacheKey = `${type}:${title.toLowerCase().trim()}`
  const cached = DESC_CACHE.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const res = await fetch(`/api/desc/search?q=${encodeURIComponent(title)}&type=${encodeURIComponent(type)}`)
    if (!res.ok) return null
    const data = await res.json()
    DESC_CACHE.set(cacheKey, { data, timestamp: Date.now() })
    return data
  } catch {
    return null
  }
}
