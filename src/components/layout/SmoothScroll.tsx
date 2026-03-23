'use client'

/**
 * SmoothScroll — Lenis-based smooth scroll provider.
 *
 * Lenis uses virtual scroll (intercepts wheel/touch events, animates lerp,
 * updates window.scrollY via a fake scrollbar or raf loop). Unlike the old
 * CSS-transform approach, it does NOT apply position:fixed or transform to
 * the page, so position:sticky works correctly everywhere.
 *
 * The 'smooth-scroll' CustomEvent is dispatched each RAF frame so
 * useScrollProgress and other scroll-driven hooks keep working unchanged.
 *
 * prefers-reduced-motion: Lenis disables itself (duration=0) automatically.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import Lenis from 'lenis'

interface ScrollState {
  scrollY: number
  scrollProgress: number
  velocity: number
}

const SmoothScrollContext = createContext<ScrollState>({
  scrollY: 0,
  scrollProgress: 0,
  velocity: 0,
})

export const useSmoothScroll = () => useContext(SmoothScrollContext)

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef   = useRef<number>(0)

  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollProgress: 0,
    velocity: 0,
  })

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: !reducedMotion,
      touchMultiplier: 1.8,
    })

    lenisRef.current = lenis

    lenis.on('scroll', (l: Lenis) => {
      const scroll   = l.scroll
      const progress = l.progress
      const velocity = l.velocity

      // Dispatch lightweight event so useScrollProgress / ScrollReveal still work
      window.dispatchEvent(
        new CustomEvent('smooth-scroll', { detail: { y: scroll } })
      )

      setScrollState(prev => {
        if (Math.abs(prev.scrollY - scroll) > 0.5) {
          return {
            scrollY: scroll,
            scrollProgress: Math.max(0, Math.min(1, progress)),
            velocity,
          }
        }
        return prev
      })
    })

    const tick = (time: number) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      lenis.destroy()
    }
  }, [])

  // No wrapper element needed — Lenis doesn't require a transform context
  return (
    <SmoothScrollContext.Provider value={scrollState}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
