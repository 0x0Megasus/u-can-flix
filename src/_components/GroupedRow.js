'use client';
import { useRef, useMemo } from 'react'
import { useContent } from '@/_hooks/useContent'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import { groupByShow, pickBiggestSeason, hasFullSeason, scoreGroup, matchTitle } from '@/_lib/utils'
import ShowCard from './ShowCard'
import ScrollArrows from './ScrollArrows'

export default function GroupedRow({ title, filter, page = 1, searchTerm = '', categories = '', externalItems, limit, grid }) {
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
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5 px-4 sm:px-10">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
        {showArrows && !grid && <ScrollArrows onScroll={scroll} />}
      </div>

      {loading ? (
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
      ) : grid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 px-4 sm:px-10">
          {groups.map((group, i) => (
            <ShowCard key={group.displayName + i} group={group} />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div ref={containerRef} className="flex gap-3 px-4 sm:px-10 overflow-x-auto scrollbar-hide pb-2">
          {groups.map((group, i) => (
            <ShowCard key={group.displayName + i} group={group} />
          ))}
        </div>
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />
        </div>
      )}
    </section>
  )
}
