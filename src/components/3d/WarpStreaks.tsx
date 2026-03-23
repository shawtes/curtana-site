'use client'

/**
 * WarpStreaks — Canvas 2D overlay for Acts 4 & 5.
 *
 * 300 (desktop) / 80 (mobile) radial gradient streak lines burst from center.
 * Streaks grow longer as act4Progress increases, then shrink in Act 5.
 * Pure 2D canvas — drawn over the R3F canvas via absolute positioning.
 *
 * Technique from SUBMERSION_JOURNEY_PROMPT.md Act 04:
 *   currentDist = (baseDistance + t * speed * 60) % 380
 *   x1 = cx + cos(angle) * currentDist
 *   x2 = cx + cos(angle) * (currentDist + streakLength)
 *   y *= 0.55  (elliptical perspective compression)
 */

import { useRef, useEffect, useMemo } from 'react'
import type { ActProgress } from '@/hooks/useActProgress'

interface Props {
  progress: number
  acts:     ActProgress
  mobile?:  boolean
}

const STREAK_COLORS = [
  [120, 160, 255],
  [180, 120, 255],
  [200, 240, 255],
] as const

interface StreakData {
  angle:        number
  baseDistance: number
  speed:        number
  colorIdx:     number
  width:        number
  phase:        number
}

export default function WarpStreaks({ acts, mobile = false }: Props) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const actsRef       = useRef(acts)
  const animRef       = useRef<number>(0)

  const count  = mobile ? 80 : 300

  const streaks: StreakData[] = useMemo(() =>
    Array.from({ length: count }, () => ({
      angle:        Math.random() * Math.PI * 2,
      baseDistance: 0.5 + Math.random() * 3,
      speed:        0.8 + Math.random() * 3.5,
      colorIdx:     Math.floor(Math.random() * STREAK_COLORS.length),
      width:        0.5 + Math.random() * 1.5,
      phase:        Math.random(),
    })),
  [count])

  // Keep acts ref current
  useEffect(() => { actsRef.current = acts }, [acts])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      // Use parent dimensions as fallback when canvas has no layout yet
      const w = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || window.innerWidth
      const h = canvas.offsetHeight || canvas.parentElement?.offsetHeight || window.innerHeight
      canvas.width  = w
      canvas.height = h
    }
    // Defer first resize to next frame so layout is complete
    requestAnimationFrame(resize)
    window.addEventListener('resize', resize)

    let startTime: number | null = null

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const t  = (timestamp - startTime) / 1000
      const a  = actsRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return }

      const { a4, a5 } = a

      // Only draw during acts 4 and 5
      if (a4 < 0.01 && a5 < 0.01) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width  / 2
      const cy = canvas.height / 2

      // Streak length: grows through Act 4, shrinks through Act 5
      const streakLength = Math.max(0,
        (15 + a4 * 120) * (1 - a5 * 0.9)
      )
      if (streakLength < 0.5) { animRef.current = requestAnimationFrame(draw); return }

      for (const s of streaks) {
        const distNow = (s.baseDistance + t * s.speed * 60) % 380

        const cos = Math.cos(s.angle)
        const sin = Math.sin(s.angle) * 0.55  // elliptical compression

        const x1 = cx + cos * distNow
        const y1 = cy + sin * distNow
        const x2 = cx + cos * (distNow + streakLength)
        const y2 = cy + sin * (distNow + streakLength)

        const [r, g, b] = STREAK_COLORS[s.colorIdx]
        const alpha     = Math.min(0.75, a4 * 1.1) * (1 - a5 * 0.8)

        const grad = ctx.createLinearGradient(x1, y1, x2, y2)
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`)
        grad.addColorStop(1, `rgba(${r},${g},${b},${alpha})`)

        ctx.lineWidth   = s.width
        ctx.strokeStyle = grad
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [streaks])

  const isActive = acts.a4 > 0.01 || acts.a5 > 0.01

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        opacity:       isActive ? 1 : 0,
        transition:    'opacity 400ms ease',
        zIndex:        5,
      }}
    />
  )
}
