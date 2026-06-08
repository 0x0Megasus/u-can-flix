'use client';
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getFeaturedImage, detectType, extractQuality, extractGenres, getCleanTitle, parseEpisode, stripArabic } from '@/_lib/utils'

export default function ContentCard({ item }) {
  const router = useRouter()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const title = stripArabic(getCleanTitle(item))
  const image = imgError ? null : getFeaturedImage(item, 'medium')
  const type = detectType(item)
  const quality = extractQuality(item.title?.rendered || '')
  const genres = extractGenres(item)
  const { season, episode } = parseEpisode(item.title?.rendered || '')

  const handlePlay = () => {
    sessionStorage.setItem('watchItem', JSON.stringify(item))
    router.push(`/watch/${item.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handlePlay()
    }
  }

  const typeColor = type === 'Movie' ? 'var(--accent)' : type === 'TV Show' ? '#2563eb' : '#7c3aed'

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
      className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] cursor-pointer group"
      onClick={handlePlay}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden mb-3 bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-all duration-500 group-hover:shadow-[var(--shadow-elevated)] group-hover:-translate-y-1.5">
        {image ? (
          <>
            <Image
              className={`object-cover transition-all duration-700 ${imgLoaded ? 'scale-100' : 'scale-110'}`}
              src={image}
              alt={title}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 768px) 200px, (min-width: 640px) 180px, 160px"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
          </>
        ) : (
          <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-muted)">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 card-overlay-gradient opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-3 translate-y-2 group-hover:translate-y-0">
          <div
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
            className="w-full py-2 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer transition-all duration-300 hover:bg-[var(--accent-hover)]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Play
          </div>
        </div>

        {quality && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white shadow-lg backdrop-blur-sm">
            {quality}
          </span>
        )}
      </div>

      <div className="px-0.5 space-y-1.5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors duration-300">{title}</h3>
        <div className="flex flex-wrap gap-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{ background: typeColor, color: '#fff' }}
          >
            {type === 'Anime Movie' ? 'Anime' : type}
          </span>
          {season > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">S{season}</span>}
          {episode > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">E{episode}</span>}
          {item.imdbRating && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f5c518] text-black font-bold flex items-center gap-0.5">
              ★ {item.imdbRating}
            </span>
          )}
          {genres.slice(0, 1).map(g => (
            <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">{g}</span>
          ))}
        </div>
      </div>
    </article>
  )
}
