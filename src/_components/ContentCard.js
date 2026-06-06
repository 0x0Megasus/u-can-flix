'use client';
import Image from 'next/image'
import { getFeaturedImage, detectType, extractQuality, extractGenres, getCleanTitle, parseEpisode, stripArabic } from '@/_lib/utils'

export default function ContentCard({ item, onWatch }) {
  const title = stripArabic(getCleanTitle(item))
  const image = getFeaturedImage(item, 'medium')
  const type = detectType(item)
  const quality = extractQuality(item.title?.rendered || '')
  const genres = extractGenres(item)
  const { season, episode } = parseEpisode(item.title?.rendered || '')
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onWatch(item)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
      className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[250px] lg:w-[280px] cursor-pointer "
      onClick={() => onWatch(item)}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-[2/3] rounded overflow-hidden mb-2 bg-[#1e1e1e]">
        {image ? (
          <Image
            className="object-cover"
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 768px) 250px, (min-width: 640px) 200px, 160px"
          />
        ) : (
          <div className="w-full h-full bg-[#1e1e1e]" />
        )}
        <div className="absolute inset-0 card-overlay-gradient opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <button
            onClick={(e) => { e.stopPropagation(); onWatch(item); }}
            className="w-full py-1.5 rounded bg-[#e50914] text-white text-xs font-bold flex items-center justify-center gap-1 border-none cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Play
          </button>
        </div>
      </div>
      <div className="px-0.5">
        <h3 className="text-sm font-semibold text-white truncate mb-1">{title}</h3>
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
            style={{ background: type === 'Movie' ? '#e50914' : type === 'TV Show' ? '#2c3e50' : type === 'Anime' ? '#9C27B0' : '#e50914', color: '#fff' }}
          >
            {type === 'Anime Movie' ? 'Anime' : type}
          </span>
          {season > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-[#b3b3b3]">S{season}</span>}
          {episode > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-[#b3b3b3]">EP{episode}</span>}
          {quality && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2d6a4f] text-white">{quality}</span>}
          {item.imdbRating && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5c518] text-black font-bold">★ {item.imdbRating}</span>}
          {genres.slice(0, 2).map(g => (
            <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-[#b3b3b3]">{g}</span>
          ))}
        </div>
      </div>
    </article>
  )
}
