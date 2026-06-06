'use client';
import { useState } from 'react'
import Link from 'next/link'
import ContactModal from './ContactModal'

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <footer className="bg-[#141414] border-t border-[#222] py-8 px-4 sm:px-10 mt-12">
      <div className="max-w-[1440px] mx-auto text-center">
        <div className="text-[#e50914] text-xl font-black tracking-wider mb-4">U CAN FLIX</div>

        <div className="flex items-center justify-center gap-6 mb-4">
          <Link href="/dmca" className="text-[#808080] hover:text-white text-sm transition-colors">DMCA</Link>
          <button onClick={() => setContactOpen(true)}
            className="text-[#808080] hover:text-white text-sm bg-transparent border-none cursor-pointer transition-colors"
          >
            Contact Us
          </button>
        </div>
        <p className="text-[#555] text-xs max-w-xl mx-auto mb-4">
          This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
        </p>
        <div className="text-[#555] text-xs">
          &copy; {new Date().getFullYear()} U Can Flix. All rights reserved.
        </div>
      </div>
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </footer>
  )
}
