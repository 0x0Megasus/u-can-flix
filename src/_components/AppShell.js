'use client';
import { usePathname } from 'next/navigation'
import Footer from './Footer'
import BottomNav from './BottomNav'

export default function AppShell({ children }) {
  const pathname = usePathname()
  const isWatchPage = pathname?.startsWith('/watch/')

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-10 lg:px-[200px] pb-[80px] md:pb-0">
        {children}
      </main>
      {!isWatchPage && <Footer />}
      <BottomNav />
    </div>
  )
}
