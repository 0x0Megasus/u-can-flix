'use client';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayer } from '@/_components/PlayerProvider'
import HeroBanner from '@/_components/HeroBanner'
import ContentCard from '@/_components/ContentCard'
import ShowCard from '@/_components/ShowCard'
import TopRatedRow from '@/_components/TopRatedRow'
import LoadingSkeleton from '@/_components/LoadingSkeleton'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import { fetchBestContent, fetchContent, fetchPosts } from '@/_lib/api'
import { groupByShow, pickBiggestSeason, getCategoryIds, detectType, showKey } from '@/_lib/utils'

const PAGE_SIZE = 10
const ROW_SIZE = 13

function ItemsRow({ items, onWatch }) {
  const { containerRef, showArrows, scroll } = useHorizontalScroll([items])

  if (items.length === 0) return null

  return (
    <div className="mb-2">
      <div className="flex items-center justify-end gap-2 px-4 sm:px-10 h-7 mb-3">
        {showArrows && (
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} aria-label="Scroll left"
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/10 cursor-pointer text-white transition-all duration-200 hover:scale-110"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
            </button>
            <button onClick={() => scroll('right')} aria-label="Scroll right"
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/10 cursor-pointer text-white transition-all duration-200 hover:scale-110"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <div ref={containerRef} className="flex gap-3 px-4 sm:px-10 overflow-x-auto scrollbar-hide pb-2">
        {items.map((g, i) => {
          const item = g.representative || g
          const type = detectType(item)
          const key = item.id ? `item-${item.id}` : `group-${g.displayName || i}`
          if (type === 'TV Show' || type === 'Anime') {
            return <ShowCard key={key} group={g} onWatch={onWatch} />
          }
          return <ContentCard key={key} item={item} onWatch={onWatch} />
        })}
      </div>
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#141414] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#141414] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

export default function CategoryPage({ filter, label }) {
  const navigate = useRouter()
  const { openPlayer } = usePlayer()
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heroItem, setHeroItem] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setItems(null)
    setHeroItem(null)
    setVisibleCount(PAGE_SIZE)

    async function load() {
      try {
        const data = await fetchContent(filter)
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      } catch {
        if (!cancelled) { setItems([]); setLoading(false) }
      }
    }

    load()

    if (filter === 'tv' || filter === 'anime') {
      fetchBestContent(filter, 1).then(best => {
        if (!cancelled && best?.[0]) setHeroItem(best[0])
      }).catch(() => {})
    }

    return () => { cancelled = true }
  }, [filter])

  const catLabel = label || (filter === 'movies' ? 'Movies' : filter === 'tv' ? 'TV Shows' : 'Anime')
  const isShowType = filter === 'tv' || filter === 'anime'

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=${filter}`)
  }

  const displayItems = isShowType 
    ? groupByShow(items || []).map(g => {
        const season = pickBiggestSeason(g)
        const sNum = season.seasonNum || 1
        if (Object.keys(g.seasons).length === 0) {
          g.seasons[sNum] = g.posts
        }
        return { ...g, ...season }
      }).filter((item, idx, arr) => {
        const key = showKey(item.displayName || '')
        return key && arr.findIndex(x => showKey(x.displayName || '') === key) === idx
      })
    : items || []

  const visibleItems = displayItems.slice(0, visibleCount)
  const hasMore = visibleCount < displayItems.length
  const canFetchMore = !hasMore && items?.length >= 100

  const itemRows = []
  for (let i = 0; i < visibleItems.length; i += ROW_SIZE) {
    itemRows.push(visibleItems.slice(i, i + ROW_SIZE))
  }

  const handleLoadMore = async () => {
    if (visibleCount < displayItems.length) {
      setVisibleCount(prev => prev + PAGE_SIZE)
      return
    }
    if (loadingMore) return
    setLoadingMore(true)
    const nextPage = Math.floor((items?.length || 0) / 50) + 1
    const more = await fetchPosts({ filter, page: nextPage, perPage: 50 }).catch(() => [])
    if (Array.isArray(more) && more.length > 0) {
      setItems(prev => {
        const seen = new Set((prev || []).map(p => p.id))
        const fresh = more.filter(p => !seen.has(p.id))
        return [...(prev || []), ...fresh]
      })
    }
    setLoadingMore(false)
  }

  if (loading) {
    return (
      <main className="pt-[100px] md:pt-[68px]">
        <HeroBanner loading={true} onWatch={openPlayer} />
        <LoadingSkeleton title={`Top ${catLabel}`} count={10} grid={true} />
        <LoadingSkeleton title={`More ${catLabel}`} count={10} grid={false} />
      </main>
    )
  }

  const catHero = heroItem || (Array.isArray(items) && items.find(i => {
    const cats = getCategoryIds(i)
    if (filter === 'anime') return cats.some(c => [5, 8].includes(c)) && !cats.some(c => [7, 9].includes(c))
    if (filter === 'tv') return cats.some(c => [7, 9].includes(c)) && !cats.some(c => [5, 8].includes(c)) && !cats.some(c => [3, 4].includes(c))
    if (filter === 'movies') return cats.some(c => [3, 4].includes(c)) && !cats.some(c => [7, 9].includes(c))
    return false
  })) || items?.[0] || null

  const handleSearchBtn = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    navigate.push(`/search?type=${filter}`)
  }

  return (
    <main className="pt-[100px] md:pt-[68px]">
      {catHero && <HeroBanner item={catHero} onWatch={openPlayer} />}
      
      <section className="pt-12">
        <TopRatedRow 
          title={`Top ${catLabel}`} 
          filter={filter} 
          onWatch={openPlayer} 
          limit={10} 
        />

        <div className="mb-8">
          <div className="flex items-center justify-between px-4 sm:px-10 mb-4">
            <h2 className="text-xl font-bold text-white">More {catLabel}</h2>
            <span className="text-sm text-[#808080]">{displayItems.length} items</span>
          </div>
          {visibleItems.length === 0 ? (
            <p className="px-4 sm:px-10 text-[#808080]">No {catLabel.toLowerCase()} available</p>
          ) : (
            itemRows.map((row, i) => <ItemsRow key={i} items={row} onWatch={openPlayer} />)
          )}

          {(hasMore || canFetchMore) && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded bg-[#e50914] text-white font-bold border-none cursor-pointer hover:bg-[#f40612] transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>Loading...</>
                ) : canFetchMore ? (
                  <>Load More from Page {Math.floor((items?.length || 0) / 50) + 1}</>
                ) : (
                  <>Load More ({displayItems.length - visibleCount} remaining)</>
                )}
              </button>
              {!hasMore && !canFetchMore && displayItems.length > 0 && (
                <p className="text-[#808080] text-sm mt-3">You&apos;ve seen all {catLabel.toLowerCase()}</p>
              )}
            </div>
          )}

          <div className="px-4 sm:px-10 pb-12 mt-8">
            <form onSubmit={handleSearch} className="flex items-stretch gap-2 max-w-xl mx-auto">
              <input
                className="flex-1 px-4 py-3.5 rounded bg-[#333] text-white text-base border-none outline-none focus:ring-2 focus:ring-[#e50914] placeholder-[#808080]"
                type="text"
                placeholder={`Search ${catLabel}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search"
                className="px-5 py-3.5 rounded bg-[#e50914] text-white border-none cursor-pointer hover:bg-[#f40612] transition-colors flex items-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <button type="button" onClick={handleSearchBtn}
                className="px-5 py-3.5 rounded bg-[#444] text-[#b3b3b3] hover:text-white border-none cursor-pointer text-sm font-medium transition-colors"
              >
                Advanced
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
