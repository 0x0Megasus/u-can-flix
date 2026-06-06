'use client';
import { useRef, useMemo } from 'react'
import { useContent } from '@/_hooks/useContent'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import { groupByShow, pickBiggestSeason, hasFullSeason, scoreGroup, matchTitle } from '@/_lib/utils'
import ShowCard from './ShowCard'

export default function GroupedRow({ title, filter, onWatch, page = 1, searchTerm = '', categories = '', externalItems, limit, grid }) {
  const { items: fetchedItems, loading: fetchLoading } = useContent(filter, searchTerm, page, categories)
  const loading = !externalItems && fetchLoading

  const groups = useMemo(() => {
    let source = externalItems || fetchedItems
    if (!source.length) return []
    if (externalItems && searchTerm) source = source.filter(item => matchTitle(item, searchTerm))
    const grouped = groupByShow(source)
    grouped.sort((a, b) => scoreGroup(b) - scoreGroup(a))
    let result = grouped.map(g => ({ ...g, ...pickBiggestSeason(g) }))

    if ((filter === 'tv' || filter === 'anime') && result.length > 0) {
      result = result.filter(g => hasFullSeason(g))
    }

    if (limit) result = result.slice(0, limit)
    return result
  }, [fetchedItems, externalItems, searchTerm, limit, filter])

  const { containerRef, showArrows, scroll } = useHorizontalScroll([groups])

  if (!loading && groups.length === 0) return null

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

      {loading ? (
        <div className="flex gap-3 px-4 sm:px-10 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[250px] lg:w-[280px]">
              <div className="aspect-[2/3] rounded bg-[#2a2a2a] animate-shimmer mb-2" />
              <div className="h-3 rounded bg-[#2a2a2a] animate-shimmer mb-1.5" />
              <div className="h-3 w-3/5 rounded bg-[#2a2a2a] animate-shimmer" />
            </div>
          ))}
        </div>
      ) : (
        <div ref={grid ? null : containerRef} className={grid ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-10' : 'flex gap-3 px-4 sm:px-10 overflow-x-auto scrollbar-hide pb-2'}>
          {groups.map((group, i) => (
            <ShowCard key={group.displayName + i} group={group} onWatch={onWatch} />
          ))}
        </div>
      )}
    </section>
  )
}
