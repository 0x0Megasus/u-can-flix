'use client';
import { useRouter, usePathname } from 'next/navigation'

const ITEMS = [
  {
    path: '/',
    label: 'Home',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9" /><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>,
  },
  {
    path: '/tv-shows',
    label: 'TV',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 22h8" /><path d="M12 18v4" /></svg>,
  },
  {
    path: '/movies',
    label: 'Movies',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M8 4v16" /><path d="M16 4v16" /><path d="M2 10h20" /><path d="M2 14h20" /></svg>,
  },
  {
    path: '/anime',
    label: 'Anime',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 10l4 2-4 2" /></svg>,
  },
  {
    path: '/search',
    label: 'Search',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center pointer-events-none px-4 pb-[max(env(safe-area-inset-bottom,8px),8px)] md:pb-3">
      <div
        className="pointer-events-auto flex items-center justify-around gap-1 px-3 h-[64px] rounded-[32px] w-full max-w-[480px]"
        style={{
          background: 'linear-gradient(135deg, rgba(31,31,43,0.92), rgba(43,36,52,0.92))',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {ITEMS.map(({ path, label, icon }) => {
          const active = isActive(path)
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                const same = path === '/' ? pathname === '/' : pathname.startsWith(path)
                if (!same) window.dispatchEvent(new CustomEvent('nav:start'))
                router.push(path)
              }}
              aria-label={label}
              className="relative flex flex-col items-center justify-center gap-0.5 w-[56px] h-[52px] rounded-xl bg-transparent border-none cursor-pointer transition-all duration-300 group hover:-translate-y-0.5"
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <span
                className="transition-all duration-300"
                style={{
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {icon}
              </span>

              <span
                className="text-[9px] font-semibold tracking-wide transition-all duration-300"
                style={{
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </span>

              {active && (
                <span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{
                    background: '#ff2fa0',
                    boxShadow: '0 0 8px #ff2fa0, 0 0 16px rgba(255,47,160,0.4)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
