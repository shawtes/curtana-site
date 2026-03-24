'use client'

/**
 * VerticalThreadLine — Lusion-style self-drawing ribbon.
 *
 * Lusion technique (confirmed via Playwright inspection):
 *   - NO lerp/damp on the line draw — the scroll is already smooth (Lenis)
 *   - quadInOut easing applied to the raw scroll ratio
 *   - Progress reads from Lenis smooth-scroll event (already interpolated)
 *   - Line draws directly at the eased position — zero lag
 */

import { useRef, useEffect, useState } from 'react'

// Ease-out quad — fast start, gentle landing. Line keeps up early, settles at end.
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

function buildPath(vH: number): string {
  if (vH < 100) return ''
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
  const wrapRef  = useRef<HTMLDivElement>(null)
  const pathRef  = useRef<SVGPathElement>(null)
  const lenRef   = useRef(0)

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

  // ── 3. Scroll → draw (NO lerp — Lenis is already smooth) ──────────────
  useEffect(() => {
    const update = () => {
      const parent = wrapRef.current?.parentElement
      const path   = pathRef.current
      const len    = lenRef.current
      if (!parent || !path || !len) return

      const rect = parent.getBoundingClientRect()

      // 0 = container top at viewport top, 1 = container bottom at viewport top
      const scrolled = -rect.top
      const range    = Math.max(1, rect.height)

      const raw  = Math.min(1, Math.max(0, scrolled / range))
      // 1.5x multiplier — line draws 50% faster than scroll
      const boosted = Math.min(1, raw * 1.5)
      const eased = easeOutQuad(boosted)

      // Write directly — no damp, no RAF loop. Lenis fires this 60fps.
      path.style.strokeDashoffset = `${len * (1 - eased)}`
    }

    // smooth-scroll fires every rAF from Lenis — already interpolated
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
