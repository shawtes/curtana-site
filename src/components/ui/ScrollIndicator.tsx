'use client'

/**
 * ScrollIndicator — Lusion-style fixed right-side scrollbar.
 *
 * 6px × 135px track, 27px thumb.
 * Thumb Y = progress × (trackH - thumbH) = progress × 108px.
 * Fades in after first scroll, hides at top and bottom.
 *
 * Measured from lusion.co:
 *   trackHeight = 135px, thumbHeight = 27px, available = 108px
 *   thumbY = (scrollCurrent / maxScroll) × 108
 */

import { useEffect, useRef } from 'react'
import { useSmoothScroll } from '@/components/layout/SmoothScroll'

const TRACK_H = 135
const THUMB_H = 27
const RANGE   = TRACK_H - THUMB_H  // 108

export default function ScrollIndicator() {
  const { scrollProgress, scrollY } = useSmoothScroll()
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  // Use refs for RAF-speed updates (no React re-render on every frame)
  useEffect(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return

    const update = () => {
      const p    = scrollProgress
      const y    = p * RANGE

      thumb.style.transform = `translate3d(0px, ${y}px, 0px)`

      // Fade: hidden at top, visible after first scroll, hidden near bottom
      const opacity = scrollY < 30 ? 0 : p > 0.97 ? 0 : 1
      track.style.opacity = String(opacity)
    }

    const handler = () => update()
    window.addEventListener('smooth-scroll', handler)
    update()

    return () => window.removeEventListener('smooth-scroll', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={trackRef}
      id="scroll-indicator"
      style={{
        position:   'fixed',
        right:       12,
        top:        '50%',
        transform:  'translateY(-50%)',
        width:       6,
        height:      TRACK_H,
        opacity:     0,
        transition: 'opacity 600ms ease',
        zIndex:      100,
        pointerEvents: 'none',
      }}
    >
      {/* Track */}
      <div
        style={{
          position:     'absolute',
          inset:         0,
          borderRadius:  3,
          background:   'rgba(127,168,130,0.08)',
        }}
      />
      {/* Thumb */}
      <div
        ref={thumbRef}
        id="scroll-indicator-bar"
        style={{
          position:     'absolute',
          top:           0,
          left:          0,
          width:         '100%',
          height:        THUMB_H,
          borderRadius:  3,
          background:   'var(--sage-dark)',
          willChange:   'transform',
        }}
      />
    </div>
  )
}
