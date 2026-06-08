'use client';
import { useRef, useCallback, useState, useEffect } from 'react'
import { useContent } from '@/_hooks/useContent'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import ContentCard from './ContentCard'
import ScrollArrows from './ScrollArrows'

export default function ContentRow({ title, filter, searchTerm = '', categories = '', limit }) {
  const [page, setPage] = useState(1)
  const [allItems, setAllItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const { items, loading } = useContent(filter, searchTerm, page, categories)
  const { containerRef, showArrows, scroll } = useHorizontalScroll([allItems])
  const observerRef = useRef(null)

  useEffect(() => {
    setPage(1)
    setAllItems([])
    setHasMore(true)
  }, [filter, searchTerm, categories])

  useEffect(() => {
    if (!items) return
    setAllItems(prev => {
      const next = items.filter(item => !prev.some(p => p.id === item.id))
      return [...prev, ...next]
    })
    setHasMore(items.length === 50)
  }, [items])

  const displayed = limit ? allItems.slice(0, limit) : allItems

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) setPage(p => p + 1)
  }, [loading, hasMore])

  useEffect(() => {
    if (!observerRef.current) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && !loading && hasMore) handleLoadMore() },
      { threshold: 0.25 }
    )
    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [handleLoadMore, loading, hasMore])

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5 px-4 sm:px-10">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
        {showArrows && <ScrollArrows onScroll={scroll} />}
      </div>

      {loading && allItems.length === 0 ? (
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
      ) : displayed.length === 0 ? (
        <p className="px-4 sm:px-10 text-[var(--text-muted)] text-sm">No content available</p>
      ) : (
        <>
          <div className="relative">
            <div ref={containerRef} className="flex gap-3 px-4 sm:px-10 overflow-x-auto scrollbar-hide pb-2">
            {displayed.map((item, i) => (
              <ContentCard key={item.id || i} item={item} />
            ))}
          </div>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />
          </div>
          <div ref={observerRef} className="h-px" />
          {loading && <p className="px-4 sm:px-10 text-[var(--text-muted)] text-sm mt-3">Loading more...</p>}
        </>
      )}
    </section>
  )
}
