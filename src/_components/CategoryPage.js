'use client';
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import HeroBanner from '@/_components/HeroBanner'
import ContentCard from '@/_components/ContentCard'
import ShowCard from '@/_components/ShowCard'
import TopRatedRow from '@/_components/TopRatedRow'
import LoadingSkeleton from '@/_components/LoadingSkeleton'
import ScrollArrows from '@/_components/ScrollArrows'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import { fetchBestContent, fetchContent, fetchPosts } from '@/_lib/api'
import { groupByShow, pickBiggestSeason, getCategoryIds, detectType, showKey } from '@/_lib/utils'

const PAGE_SIZE = 12
const ROW_SIZE = 12

function ItemsRow({ items }) {
  const { containerRef, showArrows, scroll } = useHorizontalScroll([items])

  if (items.length === 0) return null

  return (
    <div className="mb-2">
      <div className="flex items-center justify-end gap-2  h-7 mb-3">
        {showArrows && <ScrollArrows onScroll={scroll} />}
      </div>
      <div className="relative">
        <div ref={containerRef} className="flex gap-3  overflow-x-auto scrollbar-hide pb-2">
        {items.map((g, i) => {
          const item = g.representative || g
          const type = detectType(item)
          const key = item.id ? `item-${item.id}` : `group-${g.displayName || i}`
          if (type === 'TV Show' || type === 'Anime') {
            return <ShowCard key={key} group={g} />
          }
          return <ContentCard key={key} item={item} />
        })}
      </div>
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

export default function CategoryPage({ filter, label }) {
  const navigate = useRouter()
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heroItem, setHeroItem] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleWatch = useCallback((item) => {
    sessionStorage.setItem('watchItem', JSON.stringify(item))
    navigate.push(`/watch/${item.id}`)
  }, [navigate])

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
      <main>
        <HeroBanner loading={true} onWatch={handleWatch} />
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
    <main>
      {catHero && <HeroBanner item={catHero} onWatch={handleWatch} />}
      
      <section className="pt-12">
        <TopRatedRow title={`Top ${catLabel}`} filter={filter} limit={10} />

        <div className="mb-10">
          <div className="flex items-center justify-between  mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">More {catLabel}</h2>
            <span className="text-sm text-[var(--text-muted)]">{displayItems.length} items</span>
          </div>
          {visibleItems.length === 0 ? (
            <p className=" text-[var(--text-muted)] text-sm">No {catLabel.toLowerCase()} available</p>
          ) : (
            itemRows.map((row, i) => <ItemsRow key={i} items={row} />)
          )}

          {(hasMore || canFetchMore) && (
            <div className="text-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-full bg-[var(--accent)] text-white font-bold border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[var(--accent-glow)] text-sm"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : canFetchMore ? (
                  <>Load More from Page {Math.floor((items?.length || 0) / 50) + 1}</>
                ) : (
                  <>Load More ({displayItems.length - visibleCount} remaining)</>
                )}
              </button>
              {!hasMore && !canFetchMore && displayItems.length > 0 && (
                <p className="text-[var(--text-muted)] text-sm mt-4">You&apos;ve seen all {catLabel.toLowerCase()}</p>
              )}
            </div>
          )}

          <div className=" pb-12 mt-10">
            <form onSubmit={handleSearch} className="flex items-stretch gap-2 max-w-xl mx-auto">
              <input
                className="flex-1 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-base border border-[var(--border-default)] outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder-[var(--text-muted)] transition-all duration-300"
                type="text"
                placeholder={`Search ${catLabel}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search"
                className="px-5 py-3 rounded-[var(--radius-md)] bg-[var(--accent)] text-white border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-all duration-300 flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <button type="button" onClick={handleSearchBtn}
                className="px-5 py-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] cursor-pointer text-sm font-medium transition-all duration-300"
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
