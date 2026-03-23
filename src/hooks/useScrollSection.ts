'use client'

/**
 * useScrollSection — returns scroll progress (0→1→0) as a section
 * enters and exits the viewport, driven by the SmoothScroll custom event.
 *
 * enterProgress:  0→1 as top edge scrolls from bottom to center of viewport
 * inView:         true once top edge has crossed THRESHOLD of viewport height
 *
 * Uses getBoundingClientRect() which correctly reads visual (post-transform)
 * position — essential for SmoothScroll's translate3d content wrapper.
 */

import { useRef, useState, useEffect } from 'react'

const ENTER_THRESHOLD = 0.88 // element top must be within this % of viewport height

export function useScrollSection() {
  const ref = useRef<HTMLElement>(null)
  const [enterProgress, setEnterProgress] = useState(0)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      // Progress from 0 (top edge at bottom of viewport) → 1 (top edge at top of viewport)
      const raw = 1 - rect.top / vh
      const clamped = Math.max(0, Math.min(1, raw))

      setEnterProgress(clamped)
      setInView(rect.top < vh * ENTER_THRESHOLD)
    }

    // Initial check
    update()

    window.addEventListener('smooth-scroll', update)
    window.addEventListener('scroll', update, { passive: true })

    return () => {
      window.removeEventListener('smooth-scroll', update)
      window.removeEventListener('scroll', update)
    }
  }, [])

  return { ref, enterProgress, inView }
}
