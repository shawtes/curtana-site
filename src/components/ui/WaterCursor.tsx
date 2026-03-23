'use client'

/**
 * WaterCursor — Curtana signature cursor
 *
 * Three layers:
 * 1. Bloom dot  — 20px sage circle, snaps to cursor, blurs softly (mix-blend: screen)
 * 2. Lag ring   — 36px border ring, lags behind with lerp (0.10)
 * 3. Ripple trail — pool of 7 expanding rings spawned every ~22px of travel,
 *                   each fades from 0.32→0 opacity and scales 8px→44px over 600ms
 *
 * On CTA/link hover: bloom swells to 40px + turns gold
 *
 * prefers-reduced-motion: cursor hidden entirely (native cursor shown)
 */

import { useEffect, useRef } from 'react'

const RIPPLE_COUNT   = 7    // pool size
const RIPPLE_DIST    = 22   // px between ripple spawns
const RIPPLE_DURATION = 600 // ms

export default function WaterCursor() {
  const bloomRef  = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)
  const ripplePoolRef = useRef<HTMLDivElement[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number>(0)

  const pos       = useRef({ cx: -200, cy: -200, rx: -200, ry: -200 })
  const lastRipple = useRef({ x: -200, y: -200 })
  const rippleIdx = useRef(0)
  const hovering  = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    // ── Build ripple pool ──
    const container = containerRef.current
    if (!container) return

    const ripples: HTMLDivElement[] = []
    for (let i = 0; i < RIPPLE_COUNT; i++) {
      const el = document.createElement('div')
      el.style.cssText = `
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        border: 1px solid var(--sage);
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.2);
        will-change: transform, opacity;
        transition: none;
        z-index: 9998;
      `
      container.appendChild(el)
      ripples.push(el)
    }
    ripplePoolRef.current = ripples

    // ── Cursor tracking ──
    const onMove = (e: MouseEvent) => {
      pos.current.cx = e.clientX
      pos.current.cy = e.clientY

      // Spawn ripple when cursor has moved RIPPLE_DIST px
      const dx = e.clientX - lastRipple.current.x
      const dy = e.clientY - lastRipple.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist >= RIPPLE_DIST) {
        lastRipple.current = { x: e.clientX, y: e.clientY }
        spawnRipple(e.clientX, e.clientY)
      }
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      hovering.current = !!(t.closest('a') || t.closest('button'))
    }

    const spawnRipple = (x: number, y: number) => {
      const pool = ripplePoolRef.current
      const el = pool[rippleIdx.current % RIPPLE_COUNT]
      rippleIdx.current++

      const color = hovering.current
        ? 'rgba(201,169,110,0.55)'
        : 'rgba(127,168,130,0.38)'

      // Reset and place
      el.style.transition = 'none'
      el.style.left = `${x}px`
      el.style.top  = `${y}px`
      el.style.width  = '8px'
      el.style.height = '8px'
      el.style.borderColor = color
      el.style.opacity = '0.32'
      el.style.transform = 'translate(-50%, -50%) scale(1)'

      // Force reflow so transition fires fresh
      void el.offsetWidth

      el.style.transition = `transform ${RIPPLE_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${RIPPLE_DURATION}ms ease`
      el.style.transform = 'translate(-50%, -50%) scale(5.5)'
      el.style.opacity = '0'
    }

    // ── RAF loop (bloom + ring) ──
    const loop = () => {
      pos.current.rx += (pos.current.cx - pos.current.rx) * 0.10
      pos.current.ry += (pos.current.cy - pos.current.ry) * 0.10

      const bloom = bloomRef.current
      const ring  = ringRef.current
      const h = hovering.current

      if (bloom) {
        bloom.style.left    = `${pos.current.cx}px`
        bloom.style.top     = `${pos.current.cy}px`
        bloom.style.width   = h ? '40px' : '20px'
        bloom.style.height  = h ? '40px' : '20px'
        bloom.style.background = h ? 'var(--gold)' : 'var(--sage)'
        bloom.style.opacity = h ? '0.5' : '0.28'
      }

      if (ring) {
        ring.style.left   = `${pos.current.rx}px`
        ring.style.top    = `${pos.current.ry}px`
        ring.style.width  = h ? '52px' : '36px'
        ring.style.height = h ? '52px' : '36px'
        ring.style.borderColor = h
          ? 'rgba(201,169,110,0.4)'
          : 'rgba(127,168,130,0.3)'
        ring.style.opacity = h ? '0.7' : '0.45'
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafRef.current)
      ripples.forEach(el => el.remove())
    }
  }, [])

  const base: React.CSSProperties = {
    position: 'fixed',
    borderRadius: '50%',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    willChange: 'left, top',
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    >
      {/* Lag ring */}
      <div
        ref={ringRef}
        style={{
          ...base,
          width: 36,
          height: 36,
          border: '1px solid rgba(127,168,130,0.3)',
          background: 'transparent',
          transition: 'width 500ms cubic-bezier(0.16,1,0.3,1), height 500ms cubic-bezier(0.16,1,0.3,1), border-color 400ms ease',
        }}
      />
      {/* Bloom dot */}
      <div
        ref={bloomRef}
        style={{
          ...base,
          width: 20,
          height: 20,
          background: 'var(--sage)',
          opacity: 0.28,
          filter: 'blur(2px)',
          mixBlendMode: 'screen',
          transition: 'width 400ms cubic-bezier(0.16,1,0.3,1), height 400ms cubic-bezier(0.16,1,0.3,1), background 400ms ease, opacity 300ms ease',
        }}
      />
      {/* Ripple pool divs injected by useEffect above */}
    </div>
  )
}
