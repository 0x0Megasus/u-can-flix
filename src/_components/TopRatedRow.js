'use client';
import { useState, useEffect } from 'react'
import { fetchBestContent, fetchContent } from '@/_lib/api'
import { getCleanTitle, getCategoryIds, detectType, groupByShow, pickBiggestSeason } from '@/_lib/utils'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import ContentCard from './ContentCard'
import ShowCard from './ShowCard'
import ScrollArrows from './ScrollArrows'

export default function TopRatedRow({ title, type, filter, items: externalItems, limit }) {
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

        const isShowType = filter === 'tv' || filter === 'anime';
        if ((isShowType || combined.length < (limit || 10)) && Array.isArray(fallbackData)) {
          const seenIds = new Set(combined.map(i => i.id));
          const fill = fallbackData.filter(i => !seenIds.has(i.id));
          combined = [...combined, ...fill];
        }

        if (!cancelled) {
          let finalData = combined

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

          if (filter === 'tv' || filter === 'anime') {
            const groups = groupByShow(finalData)
            finalData = groups.map(g => {
              if (!g.posts?.length) return null
              return {
                _isShowGroup: true,
                displayName: g.displayName,
                seasons: g.seasons,
                posts: g.posts,
                representative: g.representative || g.posts[0],
                hasRealSeasons: g.hasRealSeasons,
                imdbRating: g.imdbRating,
              }
            }).filter(Boolean)
            if (limit) finalData = finalData.slice(0, limit)
          } else {
            finalData = finalData.slice(0, limit || 10)
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
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5 px-4 sm:px-10">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
        {showArrows && <ScrollArrows onScroll={scroll} />}
      </div>
      {displayLoading ? (
        <div className="relative">
          <div className="flex gap-3 px-4 sm:px-10 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
              <div className="aspect-[2/3] rounded-[var(--radius-md)] skeleton mb-2" />
              <div className="h-3 rounded skeleton w-full mb-1.5" />
              <div className="h-3 w-3/5 rounded skeleton" />
            </div>
          ))}
        </div>
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />
        </div>
      ) : displayItems.length === 0 ? (
        <p className="px-4 sm:px-10 text-[var(--text-muted)] text-sm">No content available</p>
      ) : (
        <div className="relative">
          <div ref={containerRef} className="flex gap-3 px-4 sm:px-10 overflow-x-auto scrollbar-hide pb-2">
          {displayItems.map((item, i) => {
            const key = item.id ? `rated-${item.id}` : `rated-idx-${i}`

            if (item._isShowGroup) {
              return <ShowCard key={key} group={item} />
            }
            const itemType = detectType(item)
            if (itemType === 'TV Show' || itemType === 'Anime') {
              const cleanTitle = getCleanTitle(item)
              const group = {
                displayName: item.imdbTitle || cleanTitle,
                representative: item,
                posts: [item],
                seasons: { [1]: [item] },
              }
              return <ShowCard key={key} group={group} />
            }
            return <ContentCard key={key} item={item} />
          })}
        </div>
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />
        </div>
      )}
    </section>
  )
}
