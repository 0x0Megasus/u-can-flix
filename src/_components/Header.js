'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv-shows', label: 'TV Shows' },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 no-underline shrink-0" aria-label="U Can Flix home">
      <span className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow-glow)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </span>
      <span className="font-display text-[17px] text-[var(--text-primary)] hidden sm:block">
        U Can Flix
      </span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // "/" focuses search the way it does on most media sites.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Reflect the current search term when landing on /search from a shared link.
  useEffect(() => {
    if (pathname !== '/search') return;
    setQuery(new URLSearchParams(window.location.search).get('q') || '');
  }, [pathname]);

  const submit = useCallback(
    e => {
      e.preventDefault();
      const term = query.trim();
      if (!term) return;
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    [query, router]
  );

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
        // No bottom border: it painted a pale line across the hero the moment
        // the user scrolled. Blur + background alone separate the bar.
        scrolled ? 'bg-[var(--bg-primary)]/90 backdrop-blur-xl' : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <div className="page-shell h-[60px] flex items-center gap-3 sm:gap-4 lg:gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden md:flex items-center gap-1">
          {LINKS.map(link => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`px-2.5 py-1.5 rounded-full text-sm font-semibold no-underline transition-colors duration-200 ${
                  active ? 'text-[var(--text-primary)] bg-white/10' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submit} role="search" className="flex-1 flex justify-end min-w-0">
          <div className="relative w-full max-w-[240px] sm:max-w-[280px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles…"
              aria-label="Search titles"
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.09] border border-[var(--border-default)] text-sm text-white placeholder-[#9aa3b5] caret-[var(--accent)] outline-none focus:bg-white/[0.13] focus:border-[var(--border-hover)] transition-colors duration-200"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
