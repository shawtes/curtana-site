'use client'

/**
 * useDepthParallax — Lusion-inspired depth layer parallax for cards
 *
 * Each layer ref moves at a different rate based on cursor position,
 * creating the illusion of true 3D depth without a WebGL scene.
 * Lusion achieves this with _depth.webp textures + WebGL; we translate
 * individual DOM layers using the same exponential lerp formula.
 *
 * Depth layers (front → back):
 *   ctaRef      factor +1.0  — closest to viewer, most movement
 *   titleRef    factor +0.55 — floats out toward viewer
 *   accentRef   factor +0.28 — accent line drifts gently
 *   glowRef     factor -0.18 — bg glow recedes opposite (parallax depth cue)
 */

import { useRef, useEffect } from 'react'

const LERP_SPEED = 9   // fast response — cursor parallax should feel immediate
const MAX_X = 11       // px of travel at the closest layer
const MAX_Y = 7

interface DepthLayers {
  containerRef: React.RefObject<HTMLDivElement | null>
  glowRef:      React.RefObject<HTMLDivElement | null>  // layer 0 — bg, recedes
  accentRef:    React.RefObject<HTMLDivElement | null>  // layer 1 — accent line
  titleRef:     React.RefObject<HTMLDivElement | null>  // layer 2 — title/subtitle
  ctaRef:       React.RefObject<HTMLDivElement | null>  // layer 3 — CTA, closest
}

export function useDepthParallax(): DepthLayers {
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef      = useRef<HTMLDivElement>(null)
  const accentRef    = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLDivElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)

  const rafRef    = useRef<number>(0)
  const curX      = useRef(0)
  const curY      = useRef(0)
  const tgtX      = useRef(0)
  const tgtY      = useRef(0)
  const lastTime  = useRef(0)
  const active    = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (window.matchMedia('(hover: none)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onEnter = () => { active.current = true }

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      tgtX.current = ((e.clientX - rect.left) / rect.width  - 0.5) * 2 // -1 → +1
      tgtY.current = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
    }

    const onLeave = () => {
      tgtX.current = 0
      tgtY.current = 0
    }

    const applyLayer = (
      ref: React.RefObject<HTMLDivElement | null>,
      factor: number,
      inverted = false
    ) => {
      if (!ref.current) return
      const dir = inverted ? -1 : 1
      ref.current.style.transform =
        `translate(${curX.current * MAX_X * factor * dir}px, ${curY.current * MAX_Y * factor * dir}px)`
      ref.current.style.transition = 'none'
    }

    const tick = (time: number) => {
      if (lastTime.current === 0) lastTime.current = time
      const dt = Math.min((time - lastTime.current) / 1000, 0.1)
      lastTime.current = time

      const factor = 1 - Math.exp(-dt * LERP_SPEED)
      curX.current += (tgtX.current - curX.current) * factor
      curY.current += (tgtY.current - curY.current) * factor

      applyLayer(glowRef,   0.18, true)  // recedes (inverted)
      applyLayer(accentRef, 0.28)
      applyLayer(titleRef,  0.55)
      applyLayer(ctaRef,    1.0)

      // Reset when settled and inactive
      if (!active.current &&
        Math.abs(curX.current) < 0.001 &&
        Math.abs(curY.current) < 0.001) {
        // All at rest — nothing to do but keep RAF alive for next hover
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { containerRef, glowRef, accentRef, titleRef, ctaRef }
}
