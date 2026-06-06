'use client';
import Image from 'next/image'
import { useState, useRef } from 'react'
import { getFeaturedImage, getCleanTitle, detectType, groupByShow } from '@/_lib/utils'
import { fetchShowEpisodes } from '@/_lib/api'
import EpisodeModal from './EpisodeModal'

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect fill="%230a0a0a" width="800" height="400"/%3E%3Ctext fill="%23444" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EU Can Flix%3C/text%3E%3C/svg%3E'

export default function HeroBanner({ item, onWatch, loading }) {
  const [imgError, setImgError] = useState(false)
  const [showSeasons, setShowSeasons] = useState(false)
  const [episodeGroup, setEpisodeGroup] = useState(null)
  const [seasonLoading, setSeasonLoading] = useState(false)
  const fetchRef = useRef(false)

  if (loading) {
    return (
      <section className="relative h-[80vh] min-h-[400px] bg-[#0a0a0a]">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="hero-gradient absolute inset-0" />
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#808080] text-sm">Loading content...</span>
        </div>
      </section>
    )
  }

  if (!item) return null

  const title = item.imdbTitle || getCleanTitle(item)
  const image = imgError ? FALLBACK_IMG : (getFeaturedImage(item, 'large') || FALLBACK_IMG)
  const isDataImage = image.startsWith('data:')
  const type = detectType(item)
  const isShowType = type === 'TV Show' || type === 'Anime'

  const handleShowSeasons = async () => {
    if (episodeGroup && episodeGroup.posts?.length > 1) {
      setShowSeasons(true)
      return
    }
    if (fetchRef.current) return
    fetchRef.current = true
    setSeasonLoading(true)
    setShowSeasons(true)

    try {
      const catIds = type === 'Anime' ? '5,8' : '7,9'
      const cleanTitle = getCleanTitle(item)
      const episodes = await fetchShowEpisodes(cleanTitle, catIds)
      if (episodes?.length > 0) {
        const regrouped = groupByShow(episodes)
        const best = regrouped.find(g =>
          g.displayName.toLowerCase().includes(cleanTitle.toLowerCase())
        ) || regrouped[0]
        if (best) setEpisodeGroup(best)
      }
    } catch {
    } finally {
      setSeasonLoading(false)
    }
  }

  return (
    <section className="relative h-[80vh] min-h-[400px]">
      <div className="absolute inset-0">
        {isDataImage ? (
          <img className="w-full h-full object-cover" src={image} alt={title} decoding="sync" />
        ) : (
          <Image
            className="object-cover"
            src={image}
            alt={title}
            fill
            priority
            loading="eager"
            unoptimized
            sizes="100vw"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0" style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', opacity: 0 }} />
      </div>
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10 max-w-[1440px] mx-auto">
        <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3"
          style={{ background: type === 'Movie' ? '#e50914' : type === 'TV Show' ? '#2c3e50' : type === 'Anime' ? '#9C27B0' : '#e50914' }}
        >
          {type}
        </span>
        <h1 className="text-3xl md:text-5xl font-bold mb-[60px] text-white drop-shadow-lg">{title}</h1>

        <button
          onClick={isShowType ? handleShowSeasons : () => onWatch(item)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#e50914] hover:bg-[#f40612] text-white font-bold text-lg transition-colors border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          {isShowType ? 'All Seasons' : 'Play'}
        </button>
      </div>
      {isShowType && showSeasons && (
        <EpisodeModal
          group={episodeGroup}
          loading={seasonLoading && !episodeGroup}
          onClose={() => { setShowSeasons(false); fetchRef.current = false }}
          onWatch={onWatch}
        />
      )}
    </section>
  )
}
