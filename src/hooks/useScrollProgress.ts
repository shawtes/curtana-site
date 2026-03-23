'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * useScrollProgress — returns 0→1 scroll progress for a sticky scroll container.
 *
 * The container should be height: Xvh (e.g. 900vh) with a sticky 100vh child.
 * Listens to both 'smooth-scroll' (SmoothScroll system) and native 'scroll'
 * so it works correctly whether SmoothScroll is active or not.
 *
 * Usage:
 *   const { containerRef, progress } = useScrollProgress()
 *   <div ref={containerRef} style={{ height: '900vh' }}>
 *     <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
 *       <MyScene scrollProgress={progress} />
 *     </div>
 *   </div>
 */
export function useScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const containerH = containerRef.current.offsetHeight
      const viewportH = window.innerHeight
      const scrollable = containerH - viewportH

      if (scrollable <= 0) { setProgress(0); return }

      // -rect.top = how far the container top has scrolled past viewport top
      const scrolled = -rect.top
      setProgress(Math.min(1, Math.max(0, scrolled / scrollable)))
    }

    update()
    window.addEventListener('smooth-scroll', update)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('smooth-scroll', update)
      window.removeEventListener('scroll', update)
    }
  }, [])

  return { containerRef, progress }
}
