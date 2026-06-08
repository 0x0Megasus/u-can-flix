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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'glass-nav shadow-[0_1px_0_var(--border-subtle)]'
        : 'bg-transparent max-lg:bg-gradient-to-b max-lg:from-black/40 max-lg:to-transparent'
    }`}>
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between px-4 sm:px-10 lg:px-[200px] h-[64px] gap-3">
          <button
            type="button"
            className="text-[var(--accent)] text-xl sm:text-2xl font-black tracking-[0.08em] cursor-pointer select-none bg-transparent border-none p-0 whitespace-nowrap shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => router.push('/')}
          >
            U CAN FLIX
          </button>

          <div className="hidden md:flex items-center gap-6 flex-1 ml-8">
            {NAVS.map(({ path, label }) => (
              <button
                type="button"
                key={path}
                onClick={() => router.push(path)}
                className={`relative text-sm font-medium transition-all duration-300 cursor-pointer bg-transparent border-none p-0 py-1 ${
                  isActive(path)
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {label}
                {isActive(path) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[var(--accent)] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center shrink-0 gap-2">
            {!isSearch && (
              <button onClick={handleSearchClick} aria-label="Search"
                className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-300 bg-transparent border border-[var(--border-default)] cursor-pointer text-sm rounded-full px-4 py-2 justify-center group"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:scale-110">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline text-xs font-medium tracking-wide uppercase">Search</span>
              </button>
            )}
          </div>
        </div>

        <div className="md:hidden overflow-x-auto pb-3 px-4 sm:px-10 lg:px-[200px] scrollbar-hide">
          <div className="flex gap-2">
            {NAVS.map(({ path, label }) => (
              <button
                type="button"
                key={path}
                onClick={() => router.push(path)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 cursor-pointer border-none shrink-0 ${
                  isActive(path)
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]'
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
