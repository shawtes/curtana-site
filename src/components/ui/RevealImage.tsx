'use client'

/**
 * RevealImage — Lusion-style image reveal with clip-path wipe + parallax.
 *
 * On enter viewport:
 *   1. Clip-path sweeps from inset(100%) → inset(0%) — curtain wipes up
 *   2. Inner image scales 1.12 → 1.0 as it reveals (film-frame effect)
 *   3. On scroll: image parallax at 0.4× speed (floats slower than page)
 *   4. On hover: subtle 3D tilt + slight scale bloom
 */

import { useRef, useEffect, useState, useCallback } from 'react'

interface Props {
  /** aspect-ratio of the frame, e.g. "4/5" or "16/9" */
  aspect?:     string
  /** delay before reveal starts (ms) */
  delay?:      number
  /** background — use a gradient placeholder when no real photo exists */
  gradient?:   string
  /** real image src (optional — falls back to gradient) */
  src?:        string
  alt?:        string
  /** parallax multiplier: 0 = none, 0.4 = Lusion-speed */
  parallax?:   number
  className?:  string
  style?:      React.CSSProperties
}

export default function RevealImage({
  aspect    = '4/5',
  delay     = 0,
  gradient  = 'linear-gradient(160deg, #1c211d 0%, #0d1210 50%, #141815 100%)',
  src,
  alt       = '',
  parallax  = 0.35,
  style,
}: Props) {
  const frameRef  = useRef<HTMLDivElement>(null)
  const innerRef  = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [tilt, setTilt]         = useState({ x: 0, y: 0 })
  const parallaxY = useRef(0)
  const rafRef    = useRef<number>(0)

  // Visibility check — same pattern as ScrollReveal (getBoundingClientRect, not IO)
  // IO uses layout position which can mismatch with Lenis smooth-scroll transforms.
  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    const check = () => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        setRevealed(true)
      }
    }

    // Check immediately and on every scroll tick
    check()
    window.addEventListener('smooth-scroll', check)
    window.addEventListener('scroll', check, { passive: true })
    return () => {
      window.removeEventListener('smooth-scroll', check)
      window.removeEventListener('scroll', check)
    }
  }, [])

  // Scroll parallax — image drifts at `parallax` rate relative to page scroll
  useEffect(() => {
    if (!revealed) return
    const frame = frameRef.current
    const inner = innerRef.current
    if (!frame || !inner) return

    const tick = () => {
      const rect    = frame.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2 - window.innerHeight / 2
      const target  = -centerY * parallax
      parallaxY.current += (target - parallaxY.current) * 0.08
      inner.style.transform = `scale(${revealed ? 1.0 : 1.12}) translateY(${parallaxY.current}px)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [revealed, parallax])

  // Hover 3D tilt
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -8
    setTilt({ x, y })
  }, [])

  const onMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  return (
    <div
      ref={frameRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        position:   'relative',
        overflow:   'hidden',
        aspectRatio: aspect,
        borderRadius: 4,
        zIndex:     4,
        willChange: 'clip-path',
        clipPath: revealed
          ? 'inset(0% 0% 0% 0%)'
          : 'inset(100% 0% 0% 0%)',
        transition: `clip-path ${700 + delay}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${tilt.x !== 0 ? 1.02 : 1})`,
        transitionProperty: 'clip-path, transform',
        ...style,
      }}
    >
      {/* Inner: image or gradient, parallaxed */}
      <div
        ref={innerRef}
        style={{
          position:   'absolute',
          inset:      '-12% 0',         // over-size so parallax has room
          transition: revealed ? 'none' : `transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          transform:  `scale(${revealed ? 1.0 : 1.12})`,
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          /* Gradient placeholder — swap for real <img> when photos are ready */
          <div
            style={{
              width:      '100%',
              height:     '100%',
              background: gradient,
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Subtle texture lines */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <line
                  key={i}
                  x1={`${(i / 12) * 100}%`} y1="0"
                  x2={`${(i / 12) * 100 + 20}%`} y2="100%"
                  stroke="#7fa882" strokeWidth="1"
                />
              ))}
            </svg>
            {/* Photo placeholder label */}
            <span style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 10,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(127,168,130,0.35)',
              zIndex: 1,
            }}>
              photo
            </span>
          </div>
        )}

        {/* Sage-tinted vignette overlay */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(to top, rgba(13,18,16,0.55) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}
