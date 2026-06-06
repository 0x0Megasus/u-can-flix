'use client';
import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { detectType, groupByShow, pickBiggestSeason } from '@/_lib/utils'
import { fetchPosts, searchPosts } from '@/_lib/api'
import ShowCard from './ShowCard'
import ContentCard from './ContentCard'

const SEARCH_TYPES = [
  { key: '', label: 'All', catFilter: '' },
  { key: 'movies', label: 'Movies', catFilter: 'movies' },
  { key: 'tv', label: 'TV Shows', catFilter: 'tv' },
  { key: 'anime', label: 'Anime', catFilter: 'anime' },
]

function runSearch({ catFilter, searchQuery, activeType, onResult, onLoading }) {
  if (!searchQuery.trim()) {
    onResult(null)
    onLoading(false)
    return
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
  onLoading(true)

  ;(async () => {
    try {
      let data
      if (catFilter) {
        const page = await fetchPosts({ filter: catFilter, search: searchQuery, perPage: 100 })
        data = Array.isArray(page) ? page : []
      } else {
        data = await searchPosts(searchQuery)
      }
      onResult(data)
    } catch { onResult([]) }
    onLoading(false)
  })()
}

function SearchContent({ onWatch }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const typeParam = searchParams.get('type') || ''

  const [input, setInput] = useState(query)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const searchingRef = useRef(false)

  const activeType = SEARCH_TYPES.find(t => t.key === typeParam) || SEARCH_TYPES[0]
  const catFilter = activeType?.catFilter || ''

  // Initial search from URL on mount
  useEffect(() => {
    if (query.trim()) {
      doSearch(query)
    }
  }, [])

  // Sync input & clear results on external URL changes (back/forward), not our own pushes
  useEffect(() => {
    if (searchingRef.current) { searchingRef.current = false; return }
    setInput(query)
    setResults(null)
    setLoading(false)
  }, [query])

  const doSearch = useCallback((searchQuery) => {
    runSearch({ catFilter, searchQuery, activeType, onResult: setResults, onLoading: setLoading })
  }, [catFilter, activeType])

  const handleSearchBtn = useCallback(() => {
    if (!input.trim()) return
    const params = new URLSearchParams()
    params.set('q', input.trim())
    if (typeParam) params.set('type', typeParam)
    searchingRef.current = true
    router.push(`/search?${params.toString()}`, { scroll: false })
    doSearch(input.trim())
  }, [input, typeParam, router, doSearch])

  const grouped = useMemo(() => {
    if (!results || results.length === 0) return null
    const raw = groupByShow(results)
    const tv = [], anime = [], movie = []

    for (const group of raw) {
      const rep = group.representative || group.posts[0]
      if (!rep) continue
      const type = detectType(rep)
      const season = pickBiggestSeason(group)
      const entry = {
        ...group,
        representative: season.representative || group.posts[0],
        episodeCount: season.episodeCount || group.posts.length,
        totalEpisodeCount: season.totalEpisodeCount || group.posts.length,
        seasonNum: season.seasonNum || 1
      }
      if (Object.keys(entry.seasons).length === 0) entry.seasons[entry.seasonNum] = entry.posts

      if (type === 'TV Show') tv.push(entry)
      else if (type === 'Anime') anime.push(entry)
      else movie.push(entry)
    }
    return { tvGroups: tv, movieGroups: movie, animeGroups: anime }
  }, [results])

  const { tvGroups, movieGroups, animeGroups } = grouped || { tvGroups: [], movieGroups: [], animeGroups: [] }
  const totalCount = tvGroups.length + movieGroups.length + animeGroups.length

  return (
    <>
      <div className="flex items-center justify-between px-4 sm:px-10 py-4 border-b border-[#333]">
        <div className="flex gap-2">
          {SEARCH_TYPES.map(t => (
            <button
              key={t.key}
              onClick={() => { if (activeType?.key !== t.key) { setResults(null); setLoading(true); const params = new URLSearchParams(); params.set('q', query); params.set('type', t.key); searchingRef.current = true; router.push(`/search?${params.toString()}`, { scroll: false }); doSearch(query) } }}
              className={`px-4 py-2 rounded text-sm font-bold transition-colors border-none cursor-pointer ${
                activeType?.key === t.key ? 'bg-[#e50914] text-white' : 'bg-[#333] text-[#b3b3b3] hover:bg-[#444]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[#b3b3b3] hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Close
        </button>
      </div>

      <div className="flex items-stretch gap-2 px-4 sm:px-10 py-4 max-w-2xl">
          <input
            className="flex-1 px-4 py-3.5 rounded bg-[#333] text-white text-base border-none outline-none focus:ring-2 focus:ring-[#e50914] placeholder-[#808080]"
            type="text"
            placeholder={activeType.key === '' ? 'Search movies, TV shows & anime...' : `Search ${activeType.label}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchBtn()}
            autoFocus={!input.trim()}
          />
          <button onClick={handleSearchBtn} disabled={!input.trim()} aria-label="Search"
            className="px-5 py-3.5 rounded bg-[#e50914] text-white disabled:opacity-50 border-none cursor-pointer disabled:cursor-not-allowed flex items-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

      <div className="px-4 sm:px-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded bg-[#2a2a2a] animate-shimmer" />
            ))}
          </div>
        ) : results && query.trim() && totalCount === 0 ? (
          <p className="text-[#808080] text-center py-12">
            No results found for &ldquo;{query}&rdquo;{activeType.key ? ` in ${activeType.label}` : ''}. Try a different search term.
          </p>
        ) : query.trim() ? (
          <>
            {tvGroups.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">TV Shows</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {tvGroups.map((group, i) => <ShowCard key={group.displayName || i} group={group} onWatch={onWatch} />)}
                </div>
              </section>
            )}
            {movieGroups.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {movieGroups.map((group, i) => {
                    const post = group.representative || group.posts[0]
                    return <ContentCard key={post?.id || i} item={post} onWatch={onWatch} />
                  })}
                </div>
              </section>
            )}
            {animeGroups.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Anime</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {animeGroups.map((group, i) => {
                    const item = group.representative || group.posts[0]
                    const type = detectType(item)
                    if (type === 'Anime Movie') return <ContentCard key={item.id || i} item={item} onWatch={onWatch} />
                    return <ShowCard key={group.displayName || i} group={group} onWatch={onWatch} />
                  })}
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </>
  )
}

export default function SearchResults({ onWatch }) {
  return (
    <section className="min-h-screen pt-[100px] md:pt-[68px]">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <SearchContent onWatch={onWatch} />
      </Suspense>
    </section>
  )
}
