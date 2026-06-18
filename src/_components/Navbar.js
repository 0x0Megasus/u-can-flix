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
  const scrolled = useScrollPosition(40)
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 will-change-[background,box-shadow,backdrop-filter] ${
        scrolled
          ? 'glass-nav shadow-[0_1px_0_var(--border-subtle)]'
          : 'lg:bg-transparent max-lg:bg-gradient-to-b max-lg:from-black/50 max-lg:to-transparent'
      }`}
    >
      {/* Animated border shimmer */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-700 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 20%, #f59e0b 40%, #ec4899 60%, var(--accent) 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'border-shimmer 3s ease-in-out infinite',
        }}
      />

      <div className="max-w-[1440px] mx-auto">
        <div className={`flex items-center justify-between px-4 sm:px-10 lg:px-[200px] gap-3 transition-all duration-500 ${
          scrolled ? 'h-[56px]' : 'h-[64px]'
        }`}>
          {/* Logo with animated gradient text */}
          <button
            type="button"
            className="cursor-pointer select-none bg-transparent border-none p-0 whitespace-nowrap shrink-0 transition-all duration-300 hover:scale-[1.03] active:scale-95 relative"
            onClick={() => router.push('/')}
          >
            <span
              className="text-xl sm:text-2xl font-black tracking-[0.08em] bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--accent), #f59e0b, #ec4899, var(--accent))',
                backgroundSize: '300% 300%',
                animation: 'logo-shimmer 4s ease-in-out infinite',
              }}
            >
              U CAN FLIX
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-8">
            {NAVS.map(({ path, label }) => (
              <button
                type="button"
                key={path}
                onClick={() => router.push(path)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border-none ${
                  isActive(path)
                    ? 'text-[var(--text-primary)] scale-[1.02]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span className="relative z-10">{label}</span>
                {/* Active glow background */}
                {isActive(path) && (
                  <span
                    className="absolute inset-0 bg-[var(--accent-subtle)] rounded-lg transition-all duration-300"
                    style={{ animation: 'nav-glow-pulse 3s ease-in-out infinite' }}
                  />
                )}
                {/* Hover lift background */}
                <span className="absolute inset-0 bg-[var(--bg-hover)]/30 rounded-lg opacity-0 hover:opacity-100 transition-all duration-300" />
                {/* Active dot */}
                {isActive(path) && (
                  <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--accent)] rounded-full shadow-[0_0_6px_var(--accent)]" />
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center shrink-0 gap-2">
            {!isSearch && (
              <button onClick={handleSearchClick} aria-label="Search"
                className="relative flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300 bg-transparent border border-[var(--border-default)] hover:border-[var(--accent)]/40 cursor-pointer text-sm rounded-full px-3.5 py-1.5 justify-center group overflow-hidden"
              >
                <span className="absolute inset-0 bg-[var(--accent-subtle)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="relative z-10 hidden sm:inline text-[11px] font-bold tracking-wider uppercase">Search</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden px-4 sm:px-10 lg:px-[200px] pb-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {NAVS.map(({ path, label }) => (
              <button
                type="button"
                key={path}
                onClick={() => router.push(path)}
                className={`relative whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-300 cursor-pointer border-none shrink-0 overflow-hidden ${
                  isActive(path)
                    ? 'text-white scale-[1.02]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span className="relative z-10">{label}</span>
                {isActive(path) ? (
                  <span className="absolute inset-0 bg-[var(--accent)] rounded-lg shadow-lg shadow-[var(--accent-glow)]" />
                ) : (
                  <span className="absolute inset-0 bg-[var(--bg-elevated)]/70 rounded-lg hover:bg-[var(--bg-hover)] transition-all duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
