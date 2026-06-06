'use client';
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePlayer } from '@/_components/PlayerProvider'
import HeroBanner from '@/_components/HeroBanner'
import TopRatedRow from '@/_components/TopRatedRow'
import { fetchContent, fetchBestContent } from '@/_lib/api'
import { getCategoryIds } from '@/_lib/utils'

export default function HomePage() {
  const navigate = useRouter()
  const { openPlayer } = usePlayer()
  const [heroItem, setHeroItem] = useState(null)
  const [heroLoading, setHeroLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setHeroLoading(true)
      try {
        const [tvContent] = await Promise.all([
          fetchContent('tv', '', 1),
        ])
        if (cancelled) return
        const hero = Array.isArray(tvContent)
          ? tvContent.find(i => !getCategoryIds(i).some(c => [5, 8].includes(c))) || tvContent[0]
          : null
        setHeroItem(hero)
      } catch {
      } finally {
        if (!cancelled) setHeroLoading(false)
      }

      fetchBestContent('movies', 10).catch(() => {})
      fetchBestContent('tv', 10).catch(() => {})
      fetchBestContent('anime', 10).catch(() => {})
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <main>
      <div className="sr-only">
        <h1>Watch Free Movies, TV Shows & Anime Online</h1>
        <section>
          <h2>Why UCanFlix?</h2>
          <p>
            UCanFlix is a free streaming site no sign up required, offering thousands of
            movies, TV shows, and anime in HD quality. You can watch free movies online
            without signing up or creating an account. Unlike other platforms, we have
            zero ads, no limits, and no hidden fees — just unlimited access to premium
            entertainment across every genre imaginable.
          </p>
        </section>
        <section>
          <h2>Top Categories</h2>
          <p>
            Browse our library of <Link href="/movies">free movies online</Link> across
            action, drama, comedy, and crime. Catch up on popular{' '}
            <Link href="/tv-shows">free TV shows online</Link> including the latest
            series. Stream full seasons of the best <Link href="/anime">anime free HD</Link>{' '}
            with English subtitles and dubbing. Use our{' '}
            <Link href="/search">advanced search</Link> to discover new releases.
          </p>
        </section>
        <section>
          <h2>No Registration Required</h2>
          <p>
            Stream movies free no registration needed — just click and watch instantly.
            As the best free anime streaming site 2026, we deliver instant playback in HD
            quality. Enjoy free HD movie streaming no account necessary on any device.
            UCanFlix is the best free streaming site like Netflix, but without the cost.
          </p>
        </section>
      </div>
      <HeroBanner item={heroItem} onWatch={openPlayer} loading={heroLoading} />
      <section className="pt-12">
        <TopRatedRow title="Top Movies" filter="movies" onWatch={openPlayer} limit={10} />
        <TopRatedRow title="TV Shows" filter="tv" onWatch={openPlayer} limit={10} />
        <TopRatedRow title="Anime" filter="anime" onWatch={openPlayer} limit={10} />
      </section>

      <div className="px-4 sm:px-10 pb-12">
        <form onSubmit={handleSearch} className="flex items-stretch gap-2 max-w-xl mx-auto">
          <input
            className="flex-1 px-4 py-3.5 rounded bg-[#333] text-white text-base border-none outline-none focus:ring-2 focus:ring-[#e50914] placeholder-[#808080]"
            type="text"
            placeholder="Search movies, TV shows & anime..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search"
            className="px-5 py-3.5 rounded bg-[#e50914] text-white border-none cursor-pointer hover:bg-[#f40612] transition-colors flex items-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button type="button" onClick={() => navigate.push('/search')}
            className="px-5 py-3.5 rounded bg-[#444] text-[#b3b3b3] hover:text-white border-none cursor-pointer text-sm font-medium transition-colors"
          >
            Advanced
          </button>
        </form>
      </div>
    </main>
  )
}
