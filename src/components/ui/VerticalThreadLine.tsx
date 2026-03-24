'use client'

/**
 * VerticalThreadLine — Lusion-style thick ribbon that sweeps full-width
 * across the page, going behind images and in front of text.
 *
 * Technique:
 *   - Full-width SVG (position: absolute, inset: 0) so the path uses the
 *     entire page width for its sweeping curves.
 *   - Thick stroke (14px) — a ribbon, not a hairline.
 *   - Lusion lerp: targetProgress updates from scroll, currentProgress lerps
 *     toward it at 0.175/frame (same constant Lusion uses, same in both directions).
 *   - z-index: 3 — in front of backgrounds/text, behind image cards
 *     (RevealImage wrapper gets z-index: 4 via CSS class).
 */

import { useRef, useEffect, useState } from 'react'

const LERP = 0.035

// Build a full-width sweeping path.
// vW = normalized view width (1000), vH = container height in px.
function buildPath(vH: number): string {
  if (vH < 100) return ''

  // The path sweeps across the full 1000-unit width.
  // Each "section" is roughly vH/5 tall.
  // Pattern: top-center → sweep left behind image → back to center →
  //          sweep right behind next image → repeat.
  const s = vH / 6   // segment height

  return [
    // Start from the left wall, slightly below top
    `M 0 ${s * 0.15}`,
    // ── sweep right then back left (about section) ────────────────────────
    `C 200 ${s * 0.15}, 550 ${s * 0.5},  500 ${s * 1.0}`,
    `C 450 ${s * 1.4},  80 ${s * 1.7},   80 ${s * 1.3}`,
    `C  80 ${s * 1.7}, 420 ${s * 1.9},  500 ${s * 2.1}`,
    // ── sweep right (services 1) ─────────────────────────────────────────────
    `C 580 ${s * 2.3}, 940 ${s * 2.7},  920 ${s * 3.1}`,
    `C 900 ${s * 3.5}, 480 ${s * 3.7},  460 ${s * 3.9}`,
    // ── sweep left (services 2–3) ────────────────────────────────────────────
    `C 440 ${s * 4.1},  60 ${s * 4.4},   80 ${s * 4.7}`,
    `C 100 ${s * 5.0}, 520 ${s * 5.2},  500 ${s * 5.5}`,
    // ── arrive at bottom center ──────────────────────────────────────────────
    `C 490 ${s * 5.7}, 460 ${s * 5.9},  480 ${vH}`,
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
  const wrapRef   = useRef<HTMLDivElement>(null)
  const pathRef   = useRef<SVGPathElement>(null)
  const lenRef    = useRef(0)
  const rafIdRef  = useRef<number | null>(null)
  const targetRef = useRef(0)
  const currentRef= useRef(0)

  const [size, setSize] = useState({ w: 0, h: 0 })

  // ── 1. Measure parent ────────────────────────────────────────────────────
  useEffect(() => {
    const parent = wrapRef.current?.parentElement
    if (!parent) return
    const measure = () => setSize({ w: parent.offsetWidth, h: parent.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  // ── 2. Measure path length once SVG is painted ───────────────────────────
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

  // ── 3. Continuous lerp loop ──────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      rafIdRef.current = requestAnimationFrame(loop)
      const diff = targetRef.current - currentRef.current
      if (Math.abs(diff) < 0.0001) {
        currentRef.current = targetRef.current
      } else {
        currentRef.current += diff * LERP
      }
      // Always write to DOM — never skip, even on snap
      const path = pathRef.current
      const len  = lenRef.current
      if (path && len) {
        path.style.strokeDashoffset = `${len * (1 - currentRef.current)}`
      }
    }
    rafIdRef.current = requestAnimationFrame(loop)
    return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current) }
  }, [])

  // ── 4. Scroll → targetProgress ──────────────────────────────────────────
  // Maps against the full remaining page scroll after this section enters —
  // not just the container's own height. Line is at 50% when the user is
  // halfway through the rest of the page.
  useEffect(() => {
    const update = (e?: Event) => {
      const parent = wrapRef.current?.parentElement
      if (!parent) return

      const scrollY = (e as CustomEvent)?.detail?.y ?? window.scrollY
      const rect    = parent.getBoundingClientRect()
      const vh      = window.innerHeight
      const totalScrollable = Math.max(1, document.documentElement.scrollHeight - vh)

      // Absolute top of this section in the document
      const sectionTop  = rect.top + scrollY
      // Start drawing when section enters the bottom of the viewport
      const startScroll = Math.max(0, sectionTop - vh)
      const range       = totalScrollable - startScroll
      if (range <= 0) return

      const raw = (scrollY - startScroll) / range
      targetRef.current = Math.min(1, Math.max(0, raw))
    }
    window.addEventListener('scroll',        update, { passive: true })
    window.addEventListener('smooth-scroll', update as EventListener, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll',        update)
      window.removeEventListener('smooth-scroll', update as EventListener)
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
