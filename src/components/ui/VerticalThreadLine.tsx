'use client'

/**
 * VerticalThreadLine — Lusion-style self-drawing ribbon.
 *
 * Key technique: frame-rate-independent exponential damping (not raw lerp).
 * Target comes from Lenis virtual scroll (smooth-scroll custom event),
 * current position damps toward it at LAMBDA=3 (~1.5s settle time).
 * This matches the exact feel of Lenis's own smoothing.
 */

import { useRef, useEffect, useState } from 'react'

// Frame-rate-independent damp: 1 - exp(-lambda * dt)
// LAMBDA=0.5 → ~9s to settle. Very slow, meditative draw.
const LAMBDA = 0.5

function buildPath(vH: number): string {
  if (vH < 100) return ''
  // 96px = ~1 inch margin from bottom edge
  const usableH = vH - 96
  const s = usableH / 6

  return [
    `M 0 ${s * 0.15}`,
    `C 200 ${s * 0.15}, 550 ${s * 0.5},  500 ${s * 1.0}`,
    `C 450 ${s * 1.4},  80 ${s * 1.7},   80 ${s * 1.3}`,
    `C  80 ${s * 1.7}, 420 ${s * 1.9},  500 ${s * 2.1}`,
    `C 580 ${s * 2.3}, 940 ${s * 2.7},  920 ${s * 3.1}`,
    `C 900 ${s * 3.5}, 480 ${s * 3.7},  460 ${s * 3.9}`,
    `C 440 ${s * 4.1},  60 ${s * 4.4},   80 ${s * 4.7}`,
    `C 100 ${s * 5.0}, 520 ${s * 5.2},  500 ${s * 5.5}`,
    `C 490 ${s * 5.7}, 460 ${s * 5.9},  480 ${usableH}`,
  ].join(' ')
}

interface Props {
  color?:       string
  opacity?:     number
  strokeWidth?: number
}

export default function VerticalThreadLine({
  color       = '#a8d4b0',
  opacity     = 0.7,
  strokeWidth = 21,
}: Props) {
  const wrapRef    = useRef<HTMLDivElement>(null)
  const pathRef    = useRef<SVGPathElement>(null)
  const lenRef     = useRef(0)
  const rafIdRef   = useRef<number | null>(null)
  const targetRef  = useRef(0)
  const currentRef = useRef(0)
  const lastTsRef  = useRef(-1)

  const [size, setSize] = useState({ w: 0, h: 0 })

  // ── 1. Measure parent ──────────────────────────────────────────────────
  useEffect(() => {
    const parent = wrapRef.current?.parentElement
    if (!parent) return
    const measure = () => setSize({ w: parent.offsetWidth, h: parent.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  // ── 2. Measure path length ─────────────────────────────────────────────
  useEffect(() => {
    if (!size.h) return
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => {
        const path = pathRef.current
        if (!path) return
        const len = path.getTotalLength()
        if (!len) return
        lenRef.current = len
        path.style.strokeDasharray  = `${len}`
        path.style.strokeDashoffset = `${len}`
      })
    })
    return () => cancelAnimationFrame(id)
  }, [size])

  // ── 3. Frame-rate-independent damp loop ────────────────────────────────
  useEffect(() => {
    const loop = (ts: number) => {
      rafIdRef.current = requestAnimationFrame(loop)

      // dt in seconds, capped at 100ms to avoid jumps after tab switch
      const dt = lastTsRef.current < 0
        ? 1 / 60
        : Math.min((ts - lastTsRef.current) / 1000, 0.1)
      lastTsRef.current = ts

      // Exponential damp: same formula Lenis uses internally
      const factor = 1 - Math.exp(-LAMBDA * dt)
      const diff = targetRef.current - currentRef.current

      if (Math.abs(diff) < 0.00005) {
        currentRef.current = targetRef.current
      } else {
        currentRef.current += diff * factor
      }

      const path = pathRef.current
      const len  = lenRef.current
      if (path && len) {
        path.style.strokeDashoffset = `${len * (1 - currentRef.current)}`
      }
    }
    rafIdRef.current = requestAnimationFrame(loop)
    return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current) }
  }, [])

  // ── 4. Scroll → target (reads Lenis virtual position) ─────────────────
  useEffect(() => {
    const update = (e?: Event) => {
      const parent = wrapRef.current?.parentElement
      if (!parent) return

      // Prefer Lenis's smooth-scroll event (interpolated), fall back to native
      const scrollY = (e as CustomEvent)?.detail?.y ?? window.scrollY
      const rect    = parent.getBoundingClientRect()
      const vh      = window.innerHeight
      const totalScrollable = Math.max(1, document.documentElement.scrollHeight - vh)

      const sectionTop  = rect.top + scrollY
      const startScroll = Math.max(0, sectionTop - vh)
      const range       = totalScrollable - startScroll
      if (range <= 0) return

      const raw = (scrollY - startScroll) / range
      targetRef.current = Math.min(1, Math.max(0, raw))
    }

    // smooth-scroll fires every rAF from Lenis — this is the smooth source
    window.addEventListener('smooth-scroll', update as EventListener, { passive: true })
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      window.removeEventListener('smooth-scroll', update as EventListener)
      window.removeEventListener('scroll', update)
    }
  }, [])

  if (!size.h) return <div ref={wrapRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

  return (
    <div
      ref={wrapRef}
      style={{
        position:      'absolute',
        inset:         0,
        pointerEvents: 'none',
        zIndex:        2,
      }}
    >
      <svg
        viewBox={`0 0 1000 ${size.h}`}
        preserveAspectRatio="none"
        width="100%"
        height={size.h}
        style={{
          display: 'block',
          overflow: 'visible',
          filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 18px ${color})`,
        }}
      >
        <path
          ref={pathRef}
          d={buildPath(size.h)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
