'use client';
import Image from 'next/image'
import { useState, useEffect, useMemo, useRef } from 'react'
import { getFeaturedImage, extractGenres, stripArabic } from '@/_lib/utils'

export default function EpisodeModal({ group, loading, onClose, onWatch }) {
  const [selectedSeason, setSelectedSeason] = useState(null)
  const closeRef = useRef(null)
  const modalRef = useRef(null)

  const seasons = useMemo(() => {
    const entries = Object.entries(group?.seasons || {})
    entries.sort(([a], [b]) => parseInt(a) - parseInt(b))
    return entries.map(([seasonNum, posts]) => ({
      seasonNum: parseInt(seasonNum),
      episodes: [...posts].sort((a, b) => (a.episode || 0) - (b.episode || 0))
    }))
  }, [group])

  const displayName = stripArabic(group?.displayName || '')
  const representative = group?.representative || (group?.posts ? group.posts[0] : null)
  const genres = representative ? extractGenres(representative) : []
  const rating = group?.imdbRating || representative?.imdbRating

  useEffect(() => {
    if (seasons.length === 1) setSelectedSeason(seasons[0].seasonNum)
  }, [seasons])

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedSeason && !loading) setSelectedSeason(null)
        else onClose()
      }
      if (e.key !== 'Tab') return

      const focusable = modalRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, selectedSeason, loading])

  const activeSeason = selectedSeason
    ? seasons.find(s => s.seasonNum === selectedSeason)
    : null

  const handleBack = () => setSelectedSeason(null)
  const handleBackdrop = () => {
    if (selectedSeason && !loading) setSelectedSeason(null)
    else onClose()
  }
  const activateOnKey = (handler) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handler()
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleBackdrop} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="episode-modal-title"
        className="relative w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-scaleIn bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden shadow-2xl"
      >
        <div className="flex items-start justify-between p-5 border-b border-[#333]">
          <div className="flex-1 min-w-0">
            <h2 id="episode-modal-title" className="text-xl font-bold text-white truncate">{displayName}</h2>
            <div className="flex gap-1 mt-2 flex-wrap">
              {rating && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5c518] text-black font-bold">★ {rating}</span>}
              {genres.map(g => (
                <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-[#b3b3b3]">{g}</span>
              ))}
            </div>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close episodes" className="text-[#808080] hover:text-white text-xl bg-transparent border-none cursor-pointer ml-4">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex items-center gap-2 text-[#b3b3b3]">
                <div className="w-5 h-5 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading seasons & episodes...</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded bg-[#222]">
                    <div className="h-6 w-12 bg-[#333] rounded animate-shimmer mb-2" />
                    <div className="h-4 w-20 bg-[#333] rounded animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ) : seasons.length === 0 ? (
            <p className="text-[#808080] text-center py-8">No seasons found</p>
          ) : !selectedSeason ? (
            <>
              {seasons.length > 1 && (
                <p className="text-[#808080] text-sm mb-4">Select a season to browse episodes</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {seasons.map(s => (
                  <div key={s.seasonNum}
                    role="button"
                    tabIndex={0}
                    aria-label={`Browse season ${s.seasonNum}`}
                    className="p-4 rounded bg-[#333] hover:bg-[#444] cursor-pointer transition-colors text-center"
                    onClick={() => setSelectedSeason(s.seasonNum)}
                    onKeyDown={activateOnKey(() => setSelectedSeason(s.seasonNum))}
                  >
                    <div className="text-2xl font-bold text-white">S{s.seasonNum}</div>
                    <div className="text-sm text-[#b3b3b3] mt-1">
                      {s.episodes.length > 1
                        ? `EP ${s.episodes[0].episode || 1}-${s.episodes[s.episodes.length - 1].episode || s.episodes.length}`
                        : `EP ${s.episodes[0].episode || 1}`}
                    </div>
                    <button className="mt-3 px-4 py-1.5 rounded bg-[#e50914] text-white text-xs font-bold border-none cursor-pointer hover:bg-[#f40612] transition-colors">
                      Browse
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : activeSeason ? (
            <>
              <button onClick={handleBack}
                className="flex items-center gap-1 text-[#b3b3b3] hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm mb-4"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
                All Seasons
              </button>
              <h3 className="text-lg font-bold text-white mb-4">
                Season {activeSeason.seasonNum}
                <span className="text-sm text-[#808080] font-normal ml-2">{activeSeason.episodes.length} episodes</span>
              </h3>
              {activeSeason.episodes.map((ep, i) => (
                (() => {
                  const image = getFeaturedImage(ep, 'medium')
                  const title = stripArabic(ep.title?.rendered || `Episode ${ep.episode || i + 1}`)
                  return (
                <div key={ep.id || i}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play ${title}`}
                  className="flex items-center gap-3 p-3 rounded hover:bg-[#333] cursor-pointer transition-colors mb-2"
                  onClick={() => onWatch(ep)}
                  onKeyDown={activateOnKey(() => onWatch(ep))}
                >
                  <span className="text-sm font-bold text-[#b3b3b3] w-12 flex-shrink-0">EP {ep.episode || i + 1}</span>
                  <div className="w-24 h-14 flex-shrink-0 rounded overflow-hidden bg-[#333]">
                    {image ? (
                      <Image src={image} alt={title} width={96} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#333]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{title}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onWatch(ep); }}
                    className="px-3 py-1.5 rounded bg-[#e50914] text-white text-xs font-bold flex items-center gap-1 border-none cursor-pointer hover:bg-[#f40612] transition-colors flex-shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Play
                  </button>
                </div>
                  )
                })()
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
