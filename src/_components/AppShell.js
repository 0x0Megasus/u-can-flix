'use client';
import Navbar from './Navbar'
import Footer from './Footer'
import { PlayerProvider } from './PlayerProvider'

export default function AppShell({ children }) {
  return (
    <PlayerProvider>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </PlayerProvider>
  )
}
