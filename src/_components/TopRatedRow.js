'use client';
import { useState, useEffect, useRef } from 'react'
import { fetchBestContent, fetchContent } from '@/_lib/api'
import { getCleanTitle, getCategoryIds, detectType, groupByShow, pickBiggestSeason } from '@/_lib/utils'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import ContentCard from './ContentCard'
import ShowCard from './ShowCard'

export default function TopRatedRow({ title, type, filter, onWatch, items: externalItems, limit }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { containerRef, showArrows, scroll } = useHorizontalScroll([items])

  useEffect(() => {
    if (externalItems) {
      setItems(externalItems)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    async function loadTopRated() {
      try {
        const [bestData, fallbackData] = await Promise.all([
          fetchBestContent(type || filter, limit).catch(() => []),
          filter ? fetchContent(filter, '', 1).catch(() => []) : Promise.resolve([])
        ]);

        let combined = [...(Array.isArray(bestData) ? bestData : [])];

        if (combined.length < (limit || 10) && Array.isArray(fallbackData)) {
          const seenIds = new Set(combined.map(i => i.id));
          const fill = fallbackData.filter(i => !seenIds.has(i.id));
          combined = [...combined, ...fill];
        }

        if (!cancelled) {
          let finalData = combined.slice(0, limit || 10)

          if (filter === 'anime') {
            finalData = finalData.filter(item => {
              const cats = getCategoryIds(item)
              return cats.some(c => [5, 8].includes(c)) && !cats.some(c => [7, 9].includes(c))
            })
          } else if (filter === 'tv') {
            finalData = finalData.filter(item => {
              const cats = getCategoryIds(item)
              return cats.some(c => [7, 9].includes(c)) && !cats.some(c => [5, 8].includes(c)) && !cats.some(c => [3, 4].includes(c))
            })
          } else if (filter === 'movies') {
            finalData = finalData.filter(item => {
              const cats = getCategoryIds(item)
              return cats.some(c => [3, 4].includes(c)) && !cats.some(c => [7, 9].includes(c))
            })
          }

          const hasImdb = finalData.some(i => i.imdbTitle)
          if (!hasImdb && (filter === 'tv' || filter === 'anime') && finalData.length > 0) {
            const groups = groupByShow(finalData)
            finalData = groups.map(g => {
              const season = pickBiggestSeason(g)
              const rep = season.representative || g.posts?.[0]
              if (!rep) return null
              return { ...rep, seasonNum: season.seasonNum || 1, displayName: g.displayName }
            }).filter(Boolean)
          }

          setItems(finalData)
          setLoading(false)
        }
      } catch {
        if (!cancelled) { setItems([]); setLoading(false) }
      }
    }

    loadTopRated()
    return () => { cancelled = true }
  }, [type, filter, externalItems, limit])

  const displayItems = limit ? (externalItems || items).slice(0, limit) : (externalItems || items)
  const displayLoading = loading && !externalItems

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-10">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {showArrows && (
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} aria-label="Scroll left"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/10 cursor-pointer text-white transition-all duration-200 hover:scale-110"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
            </button>
            <button onClick={() => scroll('right')} aria-label="Scroll right"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/10 cursor-pointer text-white transition-all duration-200 hover:scale-110"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
            </button>
          </div>
        )}
      </div>
      {displayLoading ? (
        <div className="flex gap-3 px-4 sm:px-10 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[150px] sm:w-[175px] md:w-[200px] lg:w-[220px]">
              <div className="aspect-[2/3] rounded bg-[#2a2a2a] animate-shimmer mb-2" />
              <div className="h-3 rounded bg-[#2a2a2a] animate-shimmer mb-1.5" />
              <div className="h-3 w-3/5 rounded bg-[#2a2a2a] animate-shimmer" />
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <p className="px-4 sm:px-10 text-[#808080]">No content available</p>
      ) : (
        <div ref={containerRef} className="flex gap-3 px-4 sm:px-10 overflow-x-auto scrollbar-hide pb-2">
          {displayItems.map((item, i) => {
            const itemType = detectType(item)
            const isShow = itemType === 'TV Show' || itemType === 'Anime'
            const key = item.id ? `rated-${item.id}` : `rated-idx-${i}`

            if (isShow) {
              const displayName = item.imdbTitle || getCleanTitle(item)
              const sNum = item.seasonNum || 1
              const group = {
                displayName,
                representative: item,
                posts: [item],
                seasons: { [sNum]: [item] }
              }
              return <ShowCard key={key} group={group} onWatch={onWatch} />
            }
            return <ContentCard key={key} item={item} onWatch={onWatch} />
          })}
        </div>
      )}
    </section>
  )
}
