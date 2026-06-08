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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative w-full max-w-md mx-4 animate-scaleIn glass-modal rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-elevated)]"
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
          <h2 id="contact-modal-title" className="text-xl font-bold text-[var(--text-primary)]">Contact Us</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close contact dialog"
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xl bg-transparent border-none cursor-pointer transition-colors duration-300"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
            Have a question, suggestion, or need to report an issue? We&rsquo;d love to hear from you.
          </p>
          <div className="mb-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)]">
            <span className="text-xs text-[var(--text-muted)] block mb-1 uppercase tracking-wider font-medium">Email</span>
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'itsmegasus@gmail.com'}`}
              className="text-[var(--accent)] hover:underline font-medium"
            >
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'itsmegasus@gmail.com'}
            </a>
          </div>
          <div className="mb-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)]">
            <span className="text-xs text-[var(--text-muted)] block mb-1 uppercase tracking-wider font-medium">DMCA</span>
            <span className="text-[var(--text-secondary)] text-sm">
              For takedown requests, please visit our <a href="/dmca" className="text-[var(--accent)] hover:underline">DMCA page</a>.
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-6">
            We aim to respond to all inquiries within 48 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
