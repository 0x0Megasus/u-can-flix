import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl font-black text-[var(--accent)] mb-4 tracking-tight">404</div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Lost your way?</h1>
        <p className="text-[var(--text-tertiary)] max-w-md mx-auto mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or was removed.
        </p>
        <Link href="/"
          className="inline-block px-8 py-3 rounded-full bg-[var(--accent)] text-white font-bold hover:bg-[var(--accent-hover)] transition-all duration-300 shadow-lg shadow-[var(--accent-glow)]"
        >
          Back to Home
        </Link>
      </div>
    </section>
  )
}
