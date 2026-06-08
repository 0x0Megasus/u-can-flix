'use client';
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getFeaturedImage, getCleanTitle, detectType, extractGenres } from '@/_lib/utils'
import { tmdbImage } from '@/_lib/tmdb'
import { fetchDescription } from '@/_lib/description'

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect fill="%230a0a0a" width="800" height="400"/%3E%3Ctext fill="%23333" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EU Can Flix%3C/text%3E%3C/svg%3E'

export default function HeroBanner({ item, onWatch, loading }) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [tmdbData, setTmdbData] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [descLoading, setDescLoading] = useState(false)

  useEffect(() => {
    setTmdbData(null)
    setImgError(false)
    setImageLoaded(false)
    setDescLoading(false)
    if (!item) return

    const title = getCleanTitle(item)
    if (!title) return

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const type = detectType(item)
        const searchType = type === 'Movie' ? 'movie' : 'tv'
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(title)}&type=${searchType}`, {
          signal: controller.signal
        })
        if (res.ok) {
          const results = await res.json()
          if (results?.length > 0 && !controller.signal.aborted) {
            setTmdbData(results[0])
            return
          }
        }
      } catch {}

      if (!controller.signal.aborted) {
        setDescLoading(true)
        try {
          const type = detectType(item)
          const desc = await fetchDescription(title, type)
          if (desc?.overview) {
            setTmdbData({ overview: desc.overview })
          }
        } finally {
          setDescLoading(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [item])

  if (loading) {
    return (
      <section className="relative h-[85vh] min-h-[500px] bg-[var(--bg-primary)] pt-[64px]">
        <div className="absolute inset-0 skeleton" />
        <div className="hero-gradient absolute inset-0" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 15%, transparent 85%, var(--bg-primary) 100%)' }}
        />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-muted)] text-sm">Loading content...</span>
        </div>
      </section>
    )
  }

  if (!item) return null

  const title = item.imdbTitle || getCleanTitle(item)
  const type = detectType(item)
  const isShowType = type === 'TV Show' || type === 'Anime'

  const rating = tmdbData?.vote_average || item.imdbRating || null
  const year = tmdbData?.year || ''
  const overview = tmdbData?.overview || ''
  const genres = tmdbData?.genres || extractGenres(item) || []

  const wpImage = getFeaturedImage(item, 'large')

  const image = imgError
    ? FALLBACK_IMG
    : (tmdbData?.backdrop_path
        ? tmdbImage(tmdbData.backdrop_path, 'original')
        : tmdbData?.poster_path
          ? tmdbImage(tmdbData.poster_path, 'w500')
          : wpImage || FALLBACK_IMG)

  const handlePlay = (quickPlay) => {
    const data = isShowType
      ? { item, type, displayName: title, isShow: true, quickPlay: !!quickPlay }
      : { item, type: 'movie' }
    sessionStorage.setItem('watchItem', JSON.stringify(data))
    router.push(`/watch/${item.id}`)
  }

  const typeColor = type === 'Movie' ? 'var(--accent)' : type === 'TV Show' ? '#2563eb' : '#7c3aed'

  return (
    <section className="relative h-[90vh] min-h-[550px] pt-[64px]">
      <div className="absolute inset-0 bg-[var(--bg-primary)] overflow-hidden">
        {image ? (
          image.startsWith('data:') ? (
            <img
              className="w-full h-full object-cover transition-opacity duration-1000"
              src={image}
              alt={title}
              decoding="sync"
              style={{ opacity: imageLoaded ? 1 : 0.6 }}
            />
          ) : (
            <Image
              className={`object-cover transition-all duration-1000 ${imageLoaded ? 'scale-100 blur-0' : 'scale-105 blur-sm'}`}
              src={image}
              alt={title}
              fill
              priority
              loading="eager"
              unoptimized
              sizes="100vw"
              onError={() => setImgError(true)}
              onLoad={() => setImageLoaded(true)}
            />
          )
        ) : (
          <div className="w-full h-full bg-[var(--bg-secondary)]" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/80 via-transparent to-[var(--bg-primary)]/40 pointer-events-none" />

      <div className="absolute inset-0 flex items-end">
        <div className="w-full px-4 sm:px-10 lg:px-[200px] pb-16 md:pb-28 z-10 max-w-[1440px] mx-auto"
          style={{ animation: 'fadeInUp 0.8s var(--ease-out-expo)' }}
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] shadow-lg"
                style={{ background: typeColor, color: '#fff' }}
              >
                {type === 'Anime Movie' ? 'Anime' : type}
              </span>
              {year && (
                <span className="text-sm text-[var(--text-secondary)] font-medium">{year}</span>
              )}
              {rating && (
                <span className="flex items-center gap-1.5 text-sm text-[#f5c518] font-bold">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  {rating.toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white drop-shadow-2xl mb-4 leading-[1.1] tracking-tight">
              {title}
            </h1>

            {descLoading ? (
              <div className="mb-6 max-w-xl space-y-2.5">
                <div className="h-4 skeleton rounded w-full" />
                <div className="h-4 skeleton rounded w-4/5" />
                <div className="h-4 skeleton rounded w-3/5" />
              </div>
            ) : overview ? (
              <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6 max-w-xl leading-relaxed">
                {overview}
              </p>
            ) : null}

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.slice(0, 4).map(g => (
                  <span key={typeof g === 'string' ? g : g.id || g.name}
                    className="px-3 py-1 rounded-full text-xs font-medium glass-card text-[var(--text-secondary)]"
                  >
                    {typeof g === 'string' ? g : g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handlePlay}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-lg transition-all duration-300 border-none cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent-glow)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                {isShowType ? 'Browse Episodes' : 'Play Now'}
              </button>

              {isShowType && (
                <button
                  onClick={() => handlePlay(true)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full glass-card text-white font-semibold text-base transition-all duration-300 border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-hover)] hover:border-[var(--border-hover)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Quick Play
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
