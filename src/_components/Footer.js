import Link from 'next/link';

const GROUPS = [
  {
    title: 'Browse',
    links: [
      { href: '/', label: 'Home' },
      { href: '/movies', label: 'Movies' },
      { href: '/tv-shows', label: 'TV Shows' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/dmca', label: 'DMCA' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-16">
      <div className="page-shell py-10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </span>
              <span className="font-black text-sm tracking-tight text-[var(--text-primary)]">U Can Flix</span>
            </div>
            <p className="text-[var(--text-muted)] text-xs leading-relaxed">
              Stream movies and TV shows free in HD. No sign up, no ads, no limits.
            </p>
          </div>

          <div className="flex gap-10 sm:gap-16">
            {GROUPS.map(group => (
              <div key={group.title}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  {group.title}
                </h2>
                <ul className="space-y-2">
                  {group.links.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm transition-colors duration-200 no-underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[var(--text-muted)] text-[11px] mt-8 pt-6 border-t border-[var(--border-subtle)]">
          Title data provided by The Movie Database. Playback is served by third-party providers.
        </p>
      </div>
    </footer>
  );
}
