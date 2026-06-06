import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-[100px] md:pt-[68px]">
      <div className="text-center px-4">
        <h1 className="text-7xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-3">Lost your way?</h2>
        <p className="text-[#b3b3b3] max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or was removed.
        </p>
        <Link href="/"
          className="inline-block px-8 py-3 rounded bg-[#e50914] text-white font-bold hover:bg-[#f40612] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </section>
  )
}
