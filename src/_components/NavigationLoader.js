'use client';
import { useState, useEffect, useRef, useCallback } from 'react'

const SAFETY_TIMEOUT = 10000

export default function NavigationLoader() {
  const [title, setTitle] = useState('')
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef(null)
  const leaveTimerRef = useRef(null)

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setLeaving(true)
    clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = setTimeout(() => {
      setVisible(false)
      setLeaving(false)
      setTitle('')
    }, 250)
  }, [])

  const show = useCallback((e) => {
    // Only watch-navigation carries a title; plain tab switches (BottomNav)
    // keep just the thin LoadingBar instead of a fullscreen overlay.
    if (!e?.detail?.title) return
    clearTimeout(timerRef.current)
    clearTimeout(leaveTimerRef.current)
    setLeaving(false)
    setTitle(e?.detail?.title || '')
    setVisible(true)
    timerRef.current = setTimeout(hide, SAFETY_TIMEOUT)
  }, [hide])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('nav:start', show)
    window.addEventListener('nav:end', hide)
    return () => {
      window.removeEventListener('nav:start', show)
      window.removeEventListener('nav:end', hide)
      clearTimeout(timerRef.current)
      clearTimeout(leaveTimerRef.current)
    }
  }, [show, hide])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title ? `Loading ${title}` : 'Loading content'}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200"
      style={{ opacity: leaving ? 0 : 1, animation: 'fadeIn 0.25s ease' }}
    >
      <div
        className="flex flex-col items-center gap-4 px-6 text-center"
        style={{ animation: 'scaleIn 0.3s var(--ease-out-expo)' }}
      >
        <span
          className="text-xs font-black tracking-[0.25em] bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), #f59e0b, #ec4899, var(--accent))' }}
        >
          U CAN FLIX
        </span>
        <div className="w-12 h-12 rounded-full border-[3px] border-white/10 border-t-[var(--accent)] animate-spin" />
        <div>
          <p className="text-[var(--text-primary)] font-bold text-lg truncate max-w-[70vw]">
            {title || 'Loading...'}
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Preparing your stream...</p>
        </div>
      </div>
    </div>
  )
}
