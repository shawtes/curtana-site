'use client'

import { useRef, useEffect, useCallback } from 'react'

interface AuraStageProps {
  scrollProgress: number // 0 → 1 across the 500vh content journey
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function drawFigure(ctx: CanvasRenderingContext2D, cx: number, cy: number, progress: number, t: number) {
  const breathe = Math.sin(t * 1.1) * 2
  const alpha = Math.min(1, progress * 8 + 0.3)

  ctx.save()
  ctx.globalAlpha = alpha

  // Shadow beneath figure
  const shadowGrad = ctx.createRadialGradient(cx, cy + 10, 0, cx, cy + 10, 60)
  shadowGrad.addColorStop(0, 'rgba(127,168,130,0.18)')
  shadowGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = shadowGrad
  ctx.beginPath()
  ctx.ellipse(cx, cy + 12, 52, 14, 0, 0, Math.PI * 2)
  ctx.fill()

  // Seated lotus silhouette
  // Base / crossed legs
  ctx.fillStyle = `rgba(15,20,16,0.95)`
  ctx.beginPath()
  ctx.ellipse(cx, cy + 4, 38, 18, 0, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.beginPath()
  ctx.moveTo(cx - 14, cy + 2)
  ctx.bezierCurveTo(cx - 16, cy - 30 + breathe, cx + 16, cy - 30 + breathe, cx + 14, cy + 2)
  ctx.closePath()
  ctx.fillStyle = 'rgba(15,20,16,0.95)'
  ctx.fill()

  // Head
  ctx.beginPath()
  ctx.arc(cx, cy - 44 + breathe * 0.5, 14, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(15,20,16,0.95)'
  ctx.fill()

  // Inner aura rim — the glow that emanates FROM the figure
  const rimGrad = ctx.createRadialGradient(cx, cy - 30 + breathe, 10, cx, cy - 30 + breathe, 60)
  rimGrad.addColorStop(0, `rgba(245,240,232,${0.35 + Math.sin(t * 0.9) * 0.1})`)
  rimGrad.addColorStop(0.4, `rgba(200,168,124,${0.2 + Math.sin(t * 0.7) * 0.08})`)
  rimGrad.addColorStop(0.8, `rgba(127,168,130,${0.1 + progress * 0.1})`)
  rimGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = rimGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 30 + breathe, 72, 0, Math.PI * 2)
  ctx.fill()

  // Crown chakra glow
  if (progress > 0.1) {
    const crownAlpha = Math.min(1, (progress - 0.1) * 4) * (0.4 + Math.sin(t * 1.3) * 0.15)
    const crownGrad = ctx.createRadialGradient(cx, cy - 58 + breathe, 0, cx, cy - 58 + breathe, 28)
    crownGrad.addColorStop(0, `rgba(245,240,232,${crownAlpha})`)
    crownGrad.addColorStop(0.5, `rgba(201,169,110,${crownAlpha * 0.5})`)
    crownGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = crownGrad
    ctx.beginPath()
    ctx.arc(cx, cy - 58 + breathe, 28, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawPetalRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  petals: number,
  t: number,
  alpha: number
) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(0.55, alpha * 0.55))

  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2 + t * 0.15
    const px = cx + Math.cos(angle) * radius
    const py = cy + Math.sin(angle) * radius * 0.7

    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(angle + Math.PI / 2)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(-10, -18, 10, -18, 0, 0)
    ctx.fillStyle = `rgba(127,168,130,${0.3 + Math.sin(t + i) * 0.1})`
    ctx.fill()

    // petal inner highlight
    ctx.beginPath()
    ctx.moveTo(0, -2)
    ctx.bezierCurveTo(-4, -12, 4, -12, 0, -2)
    ctx.fillStyle = `rgba(200,184,154,0.25)`
    ctx.fill()

    ctx.restore()
  }
  ctx.restore()
}

function drawMiniFlower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  t: number,
  alpha: number
) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(0.7, alpha * 0.7))

  const petals = 6
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2 + t * 0.2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.ellipse(0, -radius * 0.6, radius * 0.25, radius * 0.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(143,181,196,${0.35 + Math.sin(t * 0.8 + i) * 0.1})`
    ctx.fill()
    ctx.restore()
  }

  // center dot
  const dotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.3)
  dotGrad.addColorStop(0, 'rgba(245,240,232,0.8)')
  dotGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = dotGrad
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawMandala(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  t: number,
  alpha: number
) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(0.6, alpha * 0.6))

  const rings = 3
  for (let r = 0; r < rings; r++) {
    const rRadius = radius * (0.4 + r * 0.35)
    const segments = 8 + r * 4
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2 + t * (0.1 - r * 0.03)
      const a2 = ((i + 0.45) / segments) * Math.PI * 2 + t * (0.1 - r * 0.03)
      ctx.beginPath()
      ctx.arc(cx, cy, rRadius, a1, a2)
      ctx.strokeStyle = r === 0
        ? `rgba(127,168,130,0.4)`
        : r === 1
          ? `rgba(200,168,124,0.3)`
          : `rgba(143,181,196,0.25)`
      ctx.lineWidth = 1.5 - r * 0.3
      ctx.stroke()
    }
  }

  // Center medallion
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2)
  const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.18)
  cGrad.addColorStop(0, 'rgba(245,240,232,0.5)')
  cGrad.addColorStop(1, 'rgba(127,168,130,0.1)')
  ctx.fillStyle = cGrad
  ctx.fill()

  ctx.restore()
}

function drawGoldenBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  t: number,
  alpha: number
) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(0.75, alpha * 0.75))

  // Radiating golden rays
  const rays = 24
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + t * 0.08
    const rayLen = radius * (0.6 + Math.sin(t * 0.5 + i * 0.7) * 0.2)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)

    const rayGrad = ctx.createLinearGradient(0, 0, 0, -rayLen)
    rayGrad.addColorStop(0, `rgba(201,169,110,${0.5 + Math.sin(t + i) * 0.1})`)
    rayGrad.addColorStop(0.6, `rgba(200,168,124,0.15)`)
    rayGrad.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.moveTo(-1.5, 0)
    ctx.lineTo(0, -rayLen)
    ctx.lineTo(1.5, 0)
    ctx.closePath()
    ctx.fillStyle = rayGrad
    ctx.fill()
    ctx.restore()
  }

  // Outer glow ring
  const outerGrad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.1)
  outerGrad.addColorStop(0, `rgba(201,169,110,${alpha * 0.2})`)
  outerGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = outerGrad
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Ambient floating particles — drifting sage/sand motes
function drawParticles(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  progress: number,
  particles: Float32Array
) {
  ctx.save()
  const count = particles.length / 4 // x, y, speed, size per particle
  for (let i = 0; i < count; i++) {
    const base = i * 4
    const px = particles[base]
    const py = ((particles[base + 1] - t * particles[base + 2] * 15) % H + H) % H
    const size = particles[base + 3]

    const colors = [
      `rgba(127,168,130,`,
      `rgba(200,168,124,`,
      `rgba(143,181,196,`,
      `rgba(245,240,232,`,
    ]
    const color = colors[i % 4]
    const a = (0.08 + Math.sin(t * 0.6 + i) * 0.04) * (0.5 + progress * 0.5)

    ctx.beginPath()
    ctx.arc(px, py, size, 0, Math.PI * 2)
    ctx.fillStyle = `${color}${a})`
    ctx.fill()
  }
  ctx.restore()
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function AuraStage({ scrollProgress }: AuraStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const timeRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)
  const progressRef = useRef(scrollProgress)
  // Pre-generate particle positions (stable across renders)
  const particlesRef = useRef<Float32Array | null>(null)

  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Init particles
    const PARTICLE_COUNT = 80
    const p = new Float32Array(PARTICLE_COUNT * 4)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      p[i * 4 + 0] = Math.random() * canvas.width  // x
      p[i * 4 + 1] = Math.random() * canvas.height // y
      p[i * 4 + 2] = 0.2 + Math.random() * 0.6    // speed
      p[i * 4 + 3] = 0.8 + Math.random() * 2.2    // size
    }
    particlesRef.current = p

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * Math.min(window.devicePixelRatio, 2)
      canvas.height = canvas.offsetHeight * Math.min(window.devicePixelRatio, 2)
      // Remap particle x positions to new width
      if (particlesRef.current) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particlesRef.current[i * 4 + 0] = Math.random() * canvas.width
        }
      }
    }
    resize()
    window.addEventListener('resize', resize)

    function loop(ts: number) {
      if (!canvas) return
      if (lastTimeRef.current === null) lastTimeRef.current = ts
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = ts
      timeRef.current += dt

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      // figure sits at 58% down the canvas
      const cy = H * 0.58
      const prog = progressRef.current
      const t = timeRef.current

      // Clear
      ctx.fillStyle = '#0d0f0e'
      ctx.fillRect(0, 0, W, H)

      // Particles behind everything
      if (particlesRef.current) {
        drawParticles(ctx, W, H, t, prog, particlesRef.current)
      }

      // Camera zoom — zooms in as progress increases
      const zoom = 0.82 + prog * 0.32
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(zoom, zoom)
      ctx.translate(-cx, -cy)

      // Stage floor radial light
      const floorGrad = ctx.createRadialGradient(cx, cy + 60, 10, cx, cy + 60, W * 0.55)
      floorGrad.addColorStop(0, `rgba(127,168,130,${0.05 + prog * 0.07})`)
      floorGrad.addColorStop(0.5, `rgba(200,168,124,${0.025 + prog * 0.03})`)
      floorGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = floorGrad
      ctx.beginPath()
      ctx.ellipse(cx, cy + 80, W * 0.55, H * 0.22, 0, 0, Math.PI * 2)
      ctx.fill()

      // Main aura — breathes and grows with progress
      const breathPulse = Math.sin(t * 0.85) * 12
      const auraRadius = 120 + prog * 160 + breathPulse
      const auraAlpha = 0.12 + prog * 0.18 + Math.sin(t * 0.7) * 0.04

      const auraGrad = ctx.createRadialGradient(cx, cy - 50, 0, cx, cy - 50, auraRadius)
      auraGrad.addColorStop(0, `rgba(245,240,232,${auraAlpha * 1.2})`)
      auraGrad.addColorStop(0.25, `rgba(200,184,154,${auraAlpha})`)
      auraGrad.addColorStop(0.55, `rgba(127,168,130,${auraAlpha * 0.6})`)
      auraGrad.addColorStop(0.8, `rgba(143,181,196,${auraAlpha * 0.3})`)
      auraGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = auraGrad
      ctx.beginPath()
      ctx.arc(cx, cy - 50, auraRadius * 1.4, 0, Math.PI * 2)
      ctx.fill()

      // Ripple rings — 6 rings that expand continuously from figure
      for (let r = 0; r < 6; r++) {
        const phase = ((t * 0.35 + r / 6) % 1)
        const rRad = 40 + phase * (180 + prog * 220)
        const rAlpha = (1 - phase) * (0.18 + prog * 0.1)
        ctx.beginPath()
        ctx.arc(cx, cy - 50, rRad, 0, Math.PI * 2)
        const ringColor = r % 2 === 0
          ? `rgba(127,168,130,${rAlpha})`
          : `rgba(200,168,124,${rAlpha * 0.7})`
        ctx.strokeStyle = ringColor
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // ── MORPHING SHAPE based on progress phase ──
      if (prog < 0.28) {
        // About: blooming petal ring emerges from aura
        const p = prog / 0.28
        drawPetalRing(ctx, cx, cy - 50, 70 + p * 50, 8, t, p)
      } else if (prog < 0.58) {
        // Services: 3 satellite flowers bloom from center ring
        const p = (prog - 0.28) / 0.30
        drawPetalRing(ctx, cx, cy - 50, 95, 12, t, Math.min(1, p * 2))
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 2 + t * 0.12
          const dist = 140 * Math.min(1, p * 1.5)
          const sx = cx + Math.cos(angle) * dist
          const sy = (cy - 50) + Math.sin(angle) * dist * 0.55
          drawMiniFlower(ctx, sx, sy, 22 + p * 18, t + i * 2.1, p)
        }
      } else if (prog < 0.85) {
        // Testimonials: mandala crystallises
        const p = (prog - 0.58) / 0.27
        drawMandala(ctx, cx, cy - 50, 80 + p * 55, t, p)
        // Faint outer petal echo
        drawPetalRing(ctx, cx, cy - 50, 160 + p * 30, 16, t * 0.5, p * 0.4)
      } else {
        // CTA: full golden bloom
        const p = (prog - 0.85) / 0.15
        drawGoldenBloom(ctx, cx, cy - 50, 110 + p * 70, t, p)
        // Mandala echo beneath bloom
        drawMandala(ctx, cx, cy - 50, 90, t * 0.7, (1 - p) * 0.5)
      }

      // Draw figure last (on top of aura shapes)
      drawFigure(ctx, cx, cy, prog, t)

      ctx.restore()

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  )
}
