'use client';
import { useState } from 'react'
import Link from 'next/link'
import ContactModal from './ContactModal'

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <footer className="border-t border-[var(--border-subtle)] py-10 px-4 sm:px-10 lg:px-[200px] mt-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <div className="text-[var(--accent)] text-xl font-black tracking-[0.08em] mb-1">U CAN FLIX</div>
            <p className="text-[var(--text-muted)] text-xs max-w-xs">
              Unlimited entertainment, zero cost. Stream free movies, TV shows & anime in HD.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dmca"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300"
            >
              DMCA
            </Link>
            <button onClick={() => setContactOpen(true)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm bg-transparent border-none cursor-pointer transition-colors duration-300"
            >
              Contact Us
            </button>
            <Link href="/search"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors duration-300"
            >
              Search
            </Link>
          </div>
        </div>
        <div className="border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-muted)] text-xs max-w-lg text-center sm:text-left">
            This site does not store any files on our server. We only link to media hosted on third-party services.
          </p>
          <div className="text-[var(--text-muted)] text-xs">
            &copy; {new Date().getFullYear()} U Can Flix. All rights reserved.
          </div>
        </div>
      </div>
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </footer>
  )
}
