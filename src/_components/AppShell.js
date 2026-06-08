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
      <main className="flex-1 px-4 sm:px-10 lg:px-[200px]">
        {children}
      </main>
      {!isWatchPage && <Footer />}
    </div>
  )
}
