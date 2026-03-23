'use client'

import { useRef, useEffect } from 'react'

// Wellness adaptation: max 5deg (Shaw uses 9deg — softer for Curtana)
export function useTilt(maxDeg = 5) {
  const ref = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(hover: none)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)

      el.style.transform = `perspective(900px) rotateX(${-dy * maxDeg}deg) rotateY(${dx * maxDeg}deg) scale(1.015)`
      el.style.transition = 'transform 0.06s'

      if (shineRef.current) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        shineRef.current.style.background =
          `linear-gradient(${angle}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 70%)`
        shineRef.current.style.opacity = '1'
      }
    }

    const onLeave = () => {
      el.style.transform = ''
      el.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
      if (shineRef.current) shineRef.current.style.opacity = '0'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [maxDeg])

  return { ref, shineRef }
}
