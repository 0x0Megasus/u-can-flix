'use client';
import { useState, useEffect, useCallback, useRef } from 'react'
import { stripArabic } from '@/_lib/utils'

export default function PlayerModal({ item, onClose }) {
  const [loaded, setLoaded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [hiding, setHiding] = useState(false)
  const closeRef = useRef(null)
  const modalRef = useRef(null)

  const handleDismiss = () => {
    setHiding(true)
    setTimeout(() => setDismissed(true), 200)
  }
  const title = stripArabic(item.title?.rendered || 'Untitled')

  const playerUrl = (() => {
    const content = item.content?.rendered || ''
    const iframeMatch = content.match(/<iframe.*?src=["'](.*?)["']/i)
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1].replace(/^http:\/\//i, 'https://')
    }

    try {
      const u = new URL(item.link)
      u.protocol = 'https:'
      u.searchParams.set('embedScreen', 'true')
      return u.toString()
    } catch {
      return ''
    }
  })()

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key !== 'Tab') return

    const focusable = modalRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-modal-title"
        className="relative w-full max-w-4xl mx-4 animate-scaleIn glass-modal rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-elevated)]"
      >
        <div className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border-b border-[var(--border-default)]">
          <h2 id="player-modal-title" className="text-lg font-bold text-[var(--text-primary)] truncate mr-4">{title}</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close player"
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xl bg-transparent border-none cursor-pointer transition-colors duration-300"
          >
            ✕
          </button>
        </div>
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--text-muted)] text-sm">Loading player...</span>
            </div>
          )}
          <iframe
            src={playerUrl}
            title={title}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full ${loaded ? '' : 'invisible'}`}
            allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *"
            allowFullScreen
            playsInline
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
        {!dismissed && (
          <div className={`p-3 bg-[var(--bg-primary)] border-t border-[var(--border-default)] text-center ${
            hiding ? 'animate-hintOut' : 'animate-hintIn'
          }`}>
            <span className="text-[var(--text-tertiary)] text-sm">
              If you see ads on the player, <strong className="text-[var(--text-primary)]">clicking them won&apos;t redirect you anywhere</strong> &mdash; they are blocked.
            </span>
            <button onClick={handleDismiss} aria-label="Dismiss hint"
              className="ml-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
