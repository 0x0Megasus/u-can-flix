'use client';
import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Something went wrong</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1 max-w-sm">
          We couldn&apos;t load this section. Try again, or head back to the home page.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-2 rounded-full bg-[var(--accent)] text-white font-bold border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-all duration-300 text-sm"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-2 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-bold border border-[var(--border-default)] hover:text-[var(--text-primary)] transition-all duration-300 text-sm no-underline"
        >
          Browse Home
        </Link>
      </div>
    </div>
  );
}
