'use client';
import { useRef, useCallback, useState, useEffect } from 'react'
import { useContent } from '@/_hooks/useContent'
import { useHorizontalScroll } from '@/_hooks/useHorizontalScroll'
import ContentCard from './ContentCard'

export default function ContentRow({ title, filter, onWatch, searchTerm = '', categories = '', limit }) {
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
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-10">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
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

      {loading && allItems.length === 0 ? (
        <div className="flex gap-3 px-4 sm:px-10 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[250px] lg:w-[280px]">
              <div className="aspect-[2/3] rounded bg-[#222] animate-shimmer mb-2" />
              <div className="h-3 rounded bg-[#222] animate-shimmer mb-1.5" />
              <div className="h-3 w-3/5 rounded bg-[#222] animate-shimmer" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <p className="px-4 sm:px-10 text-[#808080]">No content available</p>
      ) : (
        <>
          <div ref={containerRef} className="flex gap-3 px-4 sm:px-10 overflow-x-auto scrollbar-hide pb-2">
            {displayed.map((item, i) => (
              <ContentCard key={item.id || i} item={item} onWatch={onWatch} />
            ))}
          </div>
          <div ref={observerRef} className="h-px" />
          {loading && <p className="px-4 sm:px-10 text-[#808080] text-sm mt-2">Loading more...</p>}
        </>
      )}
    </section>
  )
}
