'use client';
import { useState, useEffect, useRef } from 'react'

export function useScrollPosition(threshold = 50) {
  const [scrolled, setScrolled] = useState(false)
  const rafRef = useRef(null)
  const lastRef = useRef(null)

  useEffect(() => {
    const update = () => {
      rafRef.current = null
      const value = window.scrollY > threshold
      if (lastRef.current !== value) {
        lastRef.current = value
        setScrolled(value)
      }
    }
    const handle = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(update)
      }
    }
    lastRef.current = window.scrollY > threshold
    setScrolled(lastRef.current)
    window.addEventListener('scroll', handle, { passive: true })
    return () => {
      window.removeEventListener('scroll', handle)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [threshold])

  return scrolled
}
