'use client';
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function AppShell({ children }) {
  const pathname = usePathname()
  const isWatchPage = pathname?.startsWith('/watch/')

  return (
    <div className="relative min-h-screen flex flex-col">
      {!isWatchPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isWatchPage && <Footer />}
    </div>
  )
}
