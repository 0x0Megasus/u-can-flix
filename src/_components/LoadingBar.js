'use client';
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const SAFETY_TIMEOUT = 8000

export default function LoadingBar() {
  const pathname = usePathname()
  const pathRef = useRef(pathname)
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)
  const rafRef = useRef(null)

  const animate = useCallback((from, to, duration) => {
    const start = performance.now()
    rafRef.current = requestAnimationFrame(function tick(now) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setWidth(from + (to - from) * ease)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    })
  }, [])

  const show = useCallback(() => {
    setVisible(true)
    setWidth(0)
    cancelAnimationFrame(rafRef.current)
    clearTimeout(timerRef.current)

    requestAnimationFrame(() => {
      animate(0, 30, 400)
    })

    timerRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current)
      animate(30, 90, 3000)
    }, 500)
  }, [animate])

  const hide = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(timerRef.current)
    animate(0, 100, 200)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 300)
  }, [animate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('nav:start', show)
    window.addEventListener('nav:end', hide)
    return () => {
      window.removeEventListener('nav:start', show)
      window.removeEventListener('nav:end', hide)
      cancelAnimationFrame(rafRef.current)
      clearTimeout(timerRef.current)
    }
  }, [show, hide])

  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname
      window.dispatchEvent(new CustomEvent('nav:end'))
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] pointer-events-none overflow-hidden">
      <div
        className="h-full transition-none"
        style={{
          width: `${width}%`,
          background: '#ffffff',
          boxShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 16px rgba(255,255,255,0.2)',
        }}
      />
    </div>
  )
}
