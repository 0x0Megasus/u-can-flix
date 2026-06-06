'use client';
import { useRouter, usePathname } from 'next/navigation'
import { useScrollPosition } from '@/_hooks/useScrollPosition'

const NAVS = [
  { path: '/', label: 'Home' },
  { path: '/movies', label: 'Movies' },
  { path: '/tv-shows', label: 'TV Shows' },
  { path: '/anime', label: 'Anime' },
]

export default function Navbar() {
  const scrolled = useScrollPosition(60)
  const router = useRouter()
  const pathname = usePathname()

  const isSearch = pathname === '/search'

  const handleSearchClick = () => {
    window.scrollTo(0, 0)
    router.push('/search')
  }

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#141414] ${
      scrolled ? 'shadow-lg shadow-black/20' : ''
    }`}>
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between px-4 sm:px-10 h-[60px] gap-3">
          <button
            type="button"
            className="text-[#e50914] text-xl sm:text-2xl font-black tracking-wider cursor-pointer select-none bg-transparent border-none p-0 whitespace-nowrap shrink-0"
            onClick={() => router.push('/')}
          >
            U CAN FLIX
          </button>

          <div className="hidden md:flex items-center gap-5 flex-1 ml-6">
            {NAVS.map(({ path, label }) => (
              <button
                type="button"
                key={path}
                onClick={() => router.push(path)}
                className={`relative text-sm font-medium transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 ${
                  isActive(path) ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                {label}
                {isActive(path) && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#e50914] rounded-full" />}
              </button>
            ))}
          </div>

          <div className="flex items-center shrink-0">
            {!isSearch && (
              <button onClick={handleSearchClick} aria-label="Search"
                className="flex items-center gap-2 text-[#b3b3b3] hover:text-white hover:border-white transition-all duration-200 bg-transparent border border-white/20 cursor-pointer text-sm rounded-full px-3 sm:px-5 py-2 min-w-[100px] sm:min-w-0 justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            )}
          </div>
        </div>

        <div className="md:hidden overflow-x-auto pb-3 px-4 sm:px-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex gap-2">
            {NAVS.map(({ path, label }) => (
              <button
                type="button"
                key={path}
                onClick={() => router.push(path)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer border-none shrink-0 ${
                  isActive(path)
                    ? 'bg-[#e50914] text-white shadow-md shadow-red-800/40'
                    : 'bg-white/10 text-[#b3b3b3] hover:bg-white/20 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
