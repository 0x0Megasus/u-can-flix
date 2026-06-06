'use client';
import { useEffect, useCallback, useRef } from 'react'

export default function ContactModal({ onClose }) {
  const closeRef = useRef(null)
  const modalRef = useRef(null)
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key !== 'Tab') return

    const focusable = modalRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable?.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [onClose])

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative w-full max-w-md mx-4 animate-scaleIn bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#333]">
          <h2 id="contact-modal-title" className="text-xl font-bold text-white">Contact Us</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close contact dialog" className="text-[#808080] hover:text-white text-xl bg-transparent border-none cursor-pointer">✕</button>
        </div>
        <div className="p-5">
          <p className="text-[#b3b3b3] mb-6">
            Have a question, suggestion, or need to report an issue? We&rsquo;d love to hear from you.
          </p>
          <div className="mb-4">
            <span className="text-sm text-[#808080] block mb-1">Email</span>
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'itsmegasus@gmail.com'}`} className="text-[#e50914] hover:underline">{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'itsmegasus@gmail.com'}</a>
          </div>
          <div className="mb-4">
            <span className="text-sm text-[#808080] block mb-1">DMCA</span>
            <span className="text-[#b3b3b3] text-sm">For takedown requests, please visit our <a href="/dmca" className="text-[#e50914] hover:underline">DMCA page</a>.</span>
          </div>
          <p className="text-[#808080] text-xs mt-6">
            We aim to respond to all inquiries within 48 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
