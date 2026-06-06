'use client';
import Image from 'next/image'
import { useState, useRef } from 'react'
import { getFeaturedImage, detectType, extractQuality, groupByShow, extractGenres, stripArabic } from '@/_lib/utils'
import { fetchShowEpisodes } from '@/_lib/api'
import EpisodeModal from './EpisodeModal'

export default function ShowCard({ group, onWatch }) {
  const [showModal, setShowModal] = useState(false)
  const [episodeGroup, setEpisodeGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const fetchRef = useRef(false)

  const posts = group?.posts || (group?.id ? [group] : [])
  const fallbackPost = posts.find(p => p?.id) || posts[0]
  const post = group?.representative?.id ? group.representative : fallbackPost

  if (!post) return null

  const title = stripArabic(group?.displayName || post.title?.rendered || 'Untitled')
  const image = getFeaturedImage(post, 'medium')
  const type = detectType(post)
  const quality = extractQuality(post.title?.rendered || '')
  const genres = extractGenres(post)
  const rating = group?.imdbRating || post.imdbRating
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleClick = async () => {
    if (episodeGroup && episodeGroup.posts.length > 1) {
      setShowModal(true)
      return
    }

    const existingSeasons = Object.values(group.seasons || {})
    const hasFullData = existingSeasons.some(posts => posts.length > 1)

    if (hasFullData && episodeGroup) {
      setShowModal(true)
      return
    }

    if (fetchRef.current) return
    fetchRef.current = true
    setLoading(true)
    setShowModal(true)

    try {
      const detectedType = detectType(post)
      const catIds = detectedType === 'Anime' ? '5,8' : detectedType === 'TV Show' ? '7,9' : ''

      const safeGroup = { ...group }
      const currentSNum = group.seasonNum || 1
      if (!safeGroup.seasons || Object.keys(safeGroup.seasons).length === 0) {
        safeGroup.seasons = { [currentSNum]: [post] }
      }

      if (!catIds) {
        setEpisodeGroup(safeGroup)
        setLoading(false)
        return
      }

      const episodes = await fetchShowEpisodes(title, catIds)
      if (episodes && episodes.length > 0) {
        const regrouped = groupByShow(episodes)
        const best = regrouped.find(g => g.displayName.toLowerCase().includes(title.toLowerCase())) || regrouped[0]
        if (best) {
          setEpisodeGroup(best)
        } else {
          setEpisodeGroup(safeGroup)
        }
      } else {
        setEpisodeGroup(safeGroup)
      }
    } catch {
      const currentSNum = group.seasonNum || 1
      const safeGroup = { ...group }
      if (!safeGroup.seasons || Object.keys(safeGroup.seasons).length === 0) {
        safeGroup.seasons = { [currentSNum]: [post] }
      }
      setEpisodeGroup(safeGroup)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-label={`Browse episodes for ${title}`}
        className="flex-shrink-0 w-[150px] sm:w-[175px] md:w-[200px] lg:w-[220px] cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="relative aspect-[2/3] rounded overflow-hidden mb-2 bg-[#1e1e1e]">
          {image ? (
            <Image
              className="object-cover"
              src={image}
              alt={title}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 768px) 200px, (min-width: 640px) 175px, 150px"
            />
          ) : (
            <div className="w-full h-full bg-[#1e1e1e]" />
          )}
          <div className="absolute inset-0 card-overlay-gradient opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              className="w-full py-1.5 rounded bg-[#e50914] text-white text-xs font-bold flex items-center justify-center gap-1 border-none cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Episodes
            </button>
          </div>
        </div>
        <div className="px-0.5">
          <h3 className="text-sm font-semibold text-white truncate mb-1">{title}</h3>
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
              style={{ background: type === 'Anime' ? '#9C27B0' : '#2196F3', color: '#fff' }}
            >
              {type === 'Anime Movie' ? 'Anime' : type}
            </span>
            {quality && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2d6a4f] text-white">{quality}</span>}
            {rating && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5c518] text-black font-bold">★ {rating}</span>}
            {genres.slice(0, 2).map(g => (
              <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-[#b3b3b3]">{g}</span>
            ))}
          </div>
        </div>
      </article>
      {showModal && (
        <EpisodeModal
          group={episodeGroup}
          loading={loading && !episodeGroup}
          onClose={() => { setShowModal(false); fetchRef.current = false }}
          onWatch={onWatch}
        />
      )}
    </>
  )
}
