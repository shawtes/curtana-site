'use client'

/**
 * SmoothScroll — Lenis-powered scroll engine, ticked inside rAF.
 *
 * Why Lenis + manual rAF tick?
 *   Native scroll runs on a separate compositor thread. WebGL (Three.js) renders
 *   inside requestAnimationFrame. If scroll position is read from window.scrollY
 *   mid-frame, the scroll state and the WebGL render are one frame out of sync —
 *   you get jitter on fast scrolls, especially on mobile.
 *
 *   Lenis intercepts wheel/touch, maintains a virtual scroll position with lerp,
 *   and is ticked manually via lenis.raf(timestamp) INSIDE our rAF loop.
 *   This means scroll update → WebGL read → render all happen in the same frame.
 *   Zero desync.
 *
 * Lerp: frame-rate-independent exponential damp (ported from shaw-portfolio)
 *   lerp(t) = 1 - exp(-LAMBDA * dt)   where dt = seconds since last frame
 *
 *   LAMBDA = 5  → ~1.0 s settle ("cinematic" Curtana feel — lambda guide in mathUtils)
 *   LAMBDA = 8  → ~0.6 s settle (shaw-portfolio default — too snappy for wellness)
 *
 *   This is equivalent to the old fixed-lerp 0.08 at exactly 60 fps but remains
 *   identical at 30 fps, 90 fps, and 144 fps — no frame-rate drift.
 *
 * smooth-scroll-to custom event:
 *   dispatchEvent(new CustomEvent('smooth-scroll-to', { detail: { y: targetY } }))
 *   calls lenis.scrollTo() so the auto-scroll during SubmersionJourney Act 2 is
 *   handled by Lenis rather than raw window.scrollTo().
 *
 * Native scroll is driven by Lenis internally via window.scrollTo() so
 * position:sticky on SubmersionJourney keeps working correctly.
 *
 * prefers-reduced-motion: lerp becomes 1 (instant, no animation).
 */

import Lenis from 'lenis'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

// ─── DAMP LAMBDA ──────────────────────────────────────────────────────────────
// Frame-rate-independent. lerp per frame = 1 - exp(-LAMBDA * dt).
// LAMBDA=5 gives ~1.0 s settle — Curtana's cinematic "breath" pace.
const LAMBDA         = 5
const LERP_REDUCED   = 1.0


// ─── CONTEXT ──────────────────────────────────────────────────────────────────

interface ScrollState {
  scrollY:        number
  scrollProgress: number
  velocity:       number
}

const SmoothScrollContext = createContext<ScrollState>({
  scrollY: 0, scrollProgress: 0, velocity: 0,
})

export const useSmoothScroll = () => useContext(SmoothScrollContext)

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const rafRef    = useRef<number>(0)
  const lenisRef  = useRef<Lenis | null>(null)
  const lastTsRef = useRef<number>(-1)
  const [state, setState] = useState<ScrollState>({ scrollY: 0, scrollProgress: 0, velocity: 0 })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Create Lenis ────────────────────────────────────────────────────────
    // Initial lerp is set per-frame below; provide a sane fallback here.
    const lenis = new Lenis({
      lerp:        reduced ? LERP_REDUCED : 0.1,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    // ── smooth-scroll-to event — lets internal code drive Lenis directly ───
    // Usage: dispatchEvent(new CustomEvent('smooth-scroll-to', { detail: { y } }))
    const onScrollTo = (e: Event) => {
      const { y } = (e as CustomEvent<{ y: number }>).detail
      lenis.scrollTo(y, { immediate: false })
    }
    window.addEventListener('smooth-scroll-to', onScrollTo)

    // ── RAF loop — ticks Lenis on the same frame as Three.js renders ────────
    const tick = (timestamp: number) => {
      // ── Compute frame-rate-independent lerp ───────────────────────────────
      // dt in seconds; clamp to 100 ms to avoid giant jumps after tab-switch.
      if (!reduced) {
        const dt         = lastTsRef.current < 0 ? 1 / 60 : Math.min((timestamp - lastTsRef.current) / 1000, 0.1)
        const dynamicLerp = 1 - Math.exp(-LAMBDA * dt);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (lenis as any).options.lerp = dynamicLerp
      }
      lastTsRef.current = timestamp

      // ── Tick Lenis — this is the sync point with WebGL ────────────────────
      // lenis.raf() lerps animatedScroll → targetScroll and calls window.scrollTo()
      // internally. After this call, lenis.scroll and lenis.progress are current.
      lenis.raf(timestamp)

      // ── Publish scroll state to context + custom event ────────────────────
      const y        = lenis.scroll
      const progress = lenis.progress
      const velocity = lenis.velocity ?? 0

      window.dispatchEvent(
        new CustomEvent('smooth-scroll', { detail: { y } })
      )

      setState(s =>
        Math.abs(s.scrollY - y) > 0.5
          ? { scrollY: y, scrollProgress: progress, velocity }
          : s
      )

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('smooth-scroll-to', onScrollTo)
      lenis.destroy()
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={state}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
