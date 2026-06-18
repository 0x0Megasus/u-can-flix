'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { stripArabic, getFeaturedImage, detectType, groupByShow, extractGenres, parseEpisode } from '@/_lib/utils'
import { fetchShowEpisodes } from '@/_lib/api'
import { fetchDescription } from '@/_lib/description'

function extractPlayerUrl(item) {
  const content = item.content?.rendered || ''
  const iframeMatch = content.match(/<iframe.*?src=["'](.*?)["']/i)
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].replace(/^http:\/\//i, 'https://')
  }
  try {
    const u = new URL(item.link)
    u.protocol = 'https:'
    u.searchParams.set('embedScreen', 'true')
    return u.toString()
  } catch {
    return ''
  }
}

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const [watchData, setWatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [episodeGroups, setEpisodeGroups] = useState(null)
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [activeEpisode, setActiveEpisode] = useState(null)
  const [playerLoaded, setPlayerLoaded] = useState(false)
  const [fetchingEpisodes, setFetchingEpisodes] = useState(false)
  const [description, setDescription] = useState('')
  const [descLoading, setDescLoading] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const seasonRef = useRef(null)

  const checkSeasonScroll = useCallback(() => {
    const el = seasonRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  const scrollSeason = (dir) => {
    const el = seasonRef.current
    if (!el) return
    const amount = dir === 'left' ? -300 : 300
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handlePlayEpisode = (ep) => {
    sessionStorage.setItem('watchItem', JSON.stringify(ep))
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveEpisode(ep)
    setPlayerLoaded(false)
  }

  useEffect(() => {
    const stored = sessionStorage.getItem('watchItem')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setWatchData(parsed)
        setLoading(false)
        return
      } catch {}
    }
    setLoading(false)
  }, [])

  const isShow = watchData?.isShow || watchData?.type === 'TV Show' || watchData?.type === 'Anime'
  const item = watchData?.item || watchData
  const showName = watchData?.displayName || (() => {
    const raw = stripArabic(item?.title?.rendered || '')
    const { name } = parseEpisode(raw)
    return name || raw || ''
  })()
  const showType = watchData?.type || (item ? detectType(item) : '')
  const showTypeColor = showType === 'Anime' ? '#7c3aed' : '#2563eb'
  const catIds = showType === 'Anime' ? '5,8' : '7,9'

  useEffect(() => {
    if (!isShow || !showName || episodeGroups) return
    setFetchingEpisodes(true)
    fetchShowEpisodes(showName, catIds).then(episodes => {
      if (episodes?.length > 0) {
        const grouped = groupByShow(episodes)
        if (grouped.length > 0) setEpisodeGroups(grouped)
      }
      setFetchingEpisodes(false)
    }).catch(() => setFetchingEpisodes(false))
  }, [isShow, showName, catIds, episodeGroups])

  useEffect(() => {
    if (!showName) return
    let cancelled = false
    setDescLoading(true)
    fetchDescription(showName, showType).then(desc => {
      if (!cancelled && desc?.overview) setDescription(desc.overview)
    }).finally(() => {
      if (!cancelled) setDescLoading(false)
    })
    return () => { cancelled = true }
  }, [showName, showType])

  const seasons = useMemo(() => {
    if (!episodeGroups?.length) return []
    const group = episodeGroups[0]
    const entries = Object.entries(group.seasons || {})
    entries.sort(([a], [b]) => parseInt(a) - parseInt(b))
    return entries.map(([seasonNum, eps]) => ({
      seasonNum: parseInt(seasonNum),
      episodes: [...eps].sort((a, b) => (a.episode || 0) - (b.episode || 0))
    }))
  }, [episodeGroups])

  const groupGenres = useMemo(() => {
    if (!episodeGroups?.length) return []
    const rep = episodeGroups[0]?.representative || episodeGroups[0]?.posts?.[0]
    return rep ? extractGenres(rep) : []
  }, [episodeGroups])

  const groupRating = episodeGroups?.[0]?.imdbRating || item?.imdbRating || null

  useEffect(() => {
    if (seasons.length === 1 && selectedSeason === null) {
      setSelectedSeason(seasons[0].seasonNum)
    }
  }, [seasons, selectedSeason])

  useEffect(() => {
    const el = seasonRef.current
    if (!el) return
    checkSeasonScroll()
    el.addEventListener('scroll', checkSeasonScroll, { passive: true })
    const ro = new ResizeObserver(checkSeasonScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkSeasonScroll)
      ro.disconnect()
    }
  }, [seasons, checkSeasonScroll])

  const quickPlayAuto = useRef(false)

  useEffect(() => {
    if (!episodeGroups?.length || quickPlayAuto.current) return
    if (!watchData?.quickPlay) return
    quickPlayAuto.current = true
    const firstSeason = seasons[0]
    if (firstSeason?.episodes?.length) {
      handlePlayEpisode(firstSeason.episodes[0])
    }
  }, [episodeGroups, seasons, watchData?.quickPlay])

  const activeSeason = selectedSeason
    ? seasons.find(s => s.seasonNum === selectedSeason)
    : seasons[0]

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-[var(--text-tertiary)]">No content found</p>
        <button onClick={() => router.back()}
          className="px-6 py-2 rounded-full bg-[var(--accent)] text-white font-bold border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-all duration-300 text-sm"
        >
          Go Back
        </button>
      </div>
    )
  }

  const title = stripArabic(item.title?.rendered || item.title || 'Untitled')

  if (!isShow) {
    const playerUrl = extractPlayerUrl(item)
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] z-10 shrink-0 border-b border-[var(--border-subtle)]">
          <button onClick={() => router.back()} aria-label="Back"
            className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-300 bg-transparent border-none cursor-pointer text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back
          </button>
          <h1 className="text-[var(--text-primary)] font-bold truncate mx-4 text-sm sm:text-base">{title}</h1>
          <div className="w-16" />
        </div>
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {!playerLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--text-muted)] text-sm">Loading player...</span>
            </div>
          )}
          {playerUrl ? (
            <div className="relative w-full h-full">
              <iframe
                src={playerUrl}
                title={title}
                onLoad={() => setPlayerLoaded(true)}
                className={`w-full h-full ${playerLoaded ? '' : 'invisible'}`}
                allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *"
                allowFullScreen
                playsInline
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          ) : (
            <p className="text-[var(--text-muted)]">No player available for this content</p>
          )}
        </div>
      </div>
    )
  }

  const activePlayerUrl = activeEpisode ? extractPlayerUrl(activeEpisode) : ''

  return (
    <div className={`${activeEpisode ? 'h-screen flex flex-col' : 'min-h-screen'} bg-[var(--bg-primary)] -mx-4 sm:-mx-10 lg:-mx-[200px]`}>
      <div className="shrink-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between px-4 sm:px-10 lg:px-[200px] py-3 max-w-[1440px] mx-auto">
          <button onClick={() => activeEpisode ? (setActiveEpisode(null), setPlayerLoaded(false)) : router.back()} aria-label="Back"
            className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-300 bg-transparent border-none cursor-pointer text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            {activeEpisode ? 'Episodes' : 'Back'}
          </button>
          <h1 className="text-[var(--text-primary)] font-bold truncate mx-4 text-sm sm:text-base">{showName}</h1>
          <div className="w-16" />
        </div>
      </div>

      {activeEpisode && (
        <div className="relative w-full bg-black shrink-0 lg:max-w-6xl lg:mx-auto lg:rounded-2xl lg:overflow-hidden lg:shadow-2xl" style={{ aspectRatio: '16/9', maxHeight: '55vh' }}>
          {!playerLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--text-muted)] text-sm">Loading player...</span>
            </div>
          )}
          {activePlayerUrl ? (
            <iframe
              src={activePlayerUrl}
              title={stripArabic(activeEpisode.title?.rendered || '')}
              onLoad={() => setPlayerLoaded(true)}
              className={`w-full h-full ${playerLoaded ? '' : 'invisible'}`}
              allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *"
              allowFullScreen
              playsInline
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <p className="text-[var(--text-muted)]">No player available</p>
            </div>
          )}
        </div>
      )}

      <div className={`${activeEpisode ? 'flex-1 overflow-y-auto' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-[200px] py-8">
        {!activeEpisode && (
          <div className="mb-8" style={{ animation: 'fadeInUp 0.6s var(--ease-out-expo)' }}>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg"
                style={{ background: showTypeColor, color: '#fff' }}
              >
                {showType === 'Anime Movie' ? 'Anime' : showType}
              </span>
              {groupRating && (
                <span className="flex items-center gap-1 text-sm text-[#f5c518] font-bold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  {groupRating}
                </span>
              )}
              {groupGenres.slice(0, 3).map(g => (
                <span key={g} className="text-xs px-2 py-0.5 rounded-full glass-card text-[var(--text-tertiary)]">{g}</span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">{showName}</h1>
            {fetchingEpisodes && seasons.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm mt-2">
                <span className="skeleton inline-block rounded h-4 w-48 align-middle" />
              </p>
            ) : (
              <p className="text-[var(--text-muted)] text-sm mt-2">
                {seasons.reduce((sum, s) => sum + s.episodes.length, 0)} episodes across {seasons.length} season{seasons.length > 1 ? 's' : ''}
              </p>
            )}
            {descLoading ? (
              <div className="mt-4 max-w-2xl space-y-2">
                <div className="h-3 skeleton rounded w-full" />
                <div className="h-3 skeleton rounded w-4/5" />
                <div className="h-3 skeleton rounded w-3/5" />
                <div className="h-3 skeleton rounded w-2/5" />
              </div>
            ) : description ? (
              <p className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed max-w-2xl">
                {description}
              </p>
            ) : null}
          </div>
        )}

        {fetchingEpisodes ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-7 h-7 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--text-muted)] text-sm">Loading episodes...</span>
          </div>
        ) : seasons.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[var(--text-tertiary)]">No episodes found for this show</p>
            <button onClick={() => router.push('/')}
              className="px-6 py-2 rounded-full bg-[var(--accent)] text-white font-bold border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-all duration-300 text-sm"
            >
              Browse Home
            </button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 bg-[var(--bg-primary)] pb-3 pt-2 -mx-4 sm:-mx-10 lg:-mx-[200px] px-4 sm:px-10 lg:px-[200px]">
              <div className="flex items-center gap-1 max-w-[1440px] mx-auto">
                {canScrollLeft && (
                  <button onClick={() => scrollSeason('left')}
                    className="shrink-0 w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5">
                      <polyline points="15,18 9,12 15,6" />
                    </svg>
                  </button>
                )}
                <div ref={seasonRef} onScroll={checkSeasonScroll} className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {seasons.map(s => (
                    <button
                      key={s.seasonNum}
                      onClick={() => { setSelectedSeason(s.seasonNum); if (activeEpisode) { setActiveEpisode(null); setPlayerLoaded(false) } }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border-none cursor-pointer whitespace-nowrap shrink-0 ${
                        (selectedSeason || seasons[0].seasonNum) === s.seasonNum
                          ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      S{s.seasonNum}
                      <span className="ml-1 opacity-70">({s.episodes.length})</span>
                    </button>
                  ))}
                </div>
                {canScrollRight && (
                  <button onClick={() => scrollSeason('right')}
                    className="shrink-0 w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5">
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {(activeSeason?.episodes || []).map((ep, i) => {
                const epImage = getFeaturedImage(ep, 'medium')
                const epTitle = stripArabic(ep.title?.rendered || `Episode ${ep.episode || i + 1}`)
                const isActive = activeEpisode?.id === ep.id
                return (
                  <div
                    key={ep.id || i}
                    onClick={() => handlePlayEpisode(ep)}
                    className={`flex items-center gap-2 p-2 rounded-[var(--radius-sm)] cursor-pointer transition-all duration-300 group ${
                      isActive
                        ? 'bg-[var(--accent-subtle)] border border-[var(--accent)]/30'
                        : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
                    }`}
                  >
                    <span className={`text-xs font-bold w-6 text-center shrink-0 ${
                      isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                    }`}>
                      {ep.episode || i + 1}
                    </span>
                    <div className="w-[100px] sm:w-[120px] aspect-video rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-card)] shrink-0 relative">
                      {epImage ? (
                        <Image src={epImage} alt={epTitle} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="120px" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-muted)">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 ${
                          isActive ? 'opacity-100 scale-100' : ''
                        }`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold truncate ${
                        isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                      }`}>
                        {epTitle}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:bg-[var(--accent)] group-hover:text-white'
                    }`}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                      {isActive ? 'Playing' : 'Play'}
                    </div>
                  </div>
                )
              })}
            </div>
          </>        )}
      </div>
      </div>
    </div>
  )
}
