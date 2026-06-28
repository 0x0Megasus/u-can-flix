'use client';
import { useEffect, useRef } from 'react'

export default function AdBanner() {
  const containerRef = useRef(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return
    loadedRef.current = true

    const container = containerRef.current

    // Set atOptions globally
    window.atOptions = {
      key: 'f0e6a6da7462c54a63bc5e46a10c6fc9',
      format: 'iframe',
      height: 300,
      width: 160,
      params: {},
    }

    const invoke = document.createElement('script')
    invoke.src = 'https://www.highperformanceformat.com/f0e6a6da7462c54a63bc5e46a10c6fc9/invoke.js'
    invoke.async = true
    invoke.setAttribute('data-nscript', 'afterInteractive')
    container.appendChild(invoke)

    return () => {
      if (invoke.parentNode) invoke.parentNode.removeChild(invoke)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex justify-center my-4"
      style={{ minHeight: 300 }}
    />
  )
}
