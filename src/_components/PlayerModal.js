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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-modal-title"
        className="relative w-full max-w-4xl mx-4 animate-scaleIn border border-white/5 rounded-lg shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-t">
          <h2 id="player-modal-title" className="text-lg font-bold text-white truncate mr-4">{title}</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close player" className="text-[#808080] hover:text-white text-xl bg-transparent border-none cursor-pointer">✕</button>
        </div>
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
              <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#808080] text-sm">Loading player...</span>
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
          />
        </div>
        {!dismissed && (
          <div className={`p-3 bg-[#0a0a0a] rounded-b text-center border-t border-white/5 ${hiding ? 'animate-hintOut' : 'animate-hintIn'}`}
            style={hiding ? { animation: 'hintOut 0.2s forwards' } : { animation: 'hintIn 0.3s' }}>
            <span className="text-[#b3b3b3] text-sm">
              Use <strong className="text-white">full screen mode</strong> to hide external ads if you are seeing them.
            </span>
            <button onClick={handleDismiss} aria-label="Dismiss hint" className="ml-3 text-[#808080] hover:text-white bg-transparent border-none cursor-pointer">✕</button>
          </div>
        )}
      </div>
    </div>
  )
}
