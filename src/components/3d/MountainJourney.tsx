'use client'

import { useEffect, useRef } from 'react'

/**
 * MountainJourney — 8-Act cinematic 2D canvas scroll experience.
 *
 *   Act 0 (0→0.10):   3D STARFIELD — depth-parallax stars, mouse reactive, meditator seated
 *   Act 1 (0.10→0.22): THE FALL — meditator tips face-first into ground, concentric ripples
 *   Act 2 (0.22→0.32): THROUGH THE WATER — caustic surface, camera dives through membrane
 *   Act 3 (0.32→0.50): HYPERSPACE GEOMETRY — 4D polytopes (tesseract, 16-cell, 24-cell)
 *   Act 4 (0.50→0.63): MANDALA VORTEX — 24 beams + 280 petal particles
 *   Act 5 (0.63→0.74): GOLDEN CHAKRA BLOOM — 56 rays + 80 orbiting orbs
 *   Act 6 (0.74→0.87): MOUNTAIN ARRIVAL — aurora, layered ranges, meditator on summit
 *   Act 7 (0.87→1.0):  TURN + CANDLE + SMOKE → white portal
 */

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

interface MountainJourneyProps { scrollProgress: number }

interface DepthStar {
  x: number; y: number; z: number   // x/y normalized -0.5→0.5, z 0→1 (depth)
  size: number; brightness: number; twinkle: number; phase: number; hue: number
}

interface TunnelRing {
  z: number; rotation: number; sides: number; scale: number; hue: number; speed: number
  emitters: { angle: number; brightness: number; speed: number; size: number }[]
}

interface SporeParticle {
  x: number; y: number; z: number; size: number; hue: number; alpha: number; drift: number
}

interface VortexBeam { angle: number; length: number; width: number; hue: number; pulse: number }

interface VortexPetal {
  angle: number; dist: number; size: number; hue: number; brightness: number; spin: number
}

interface BloomRay { angle: number; len: number; width: number; speed: number; phase: number }
interface BloomOrb { angle: number; dist: number; size: number; hue: number; orbit: number; phase: number }
interface AuroraRibbon { y: number; amp: number; freq: number; phase: number; hue: number; width: number }
interface StarParticle { x: number; y: number; size: number; phase: number; twinkleSpeed: number }
interface SnowParticle { x: number; y: number; size: number; speed: number; drift: number; alpha: number; wobble: number }

interface SmokeParticle {
  x: number; y: number; vx: number; vy: number; size: number; maxSize: number
  life: number; maxLife: number; alpha: number; seed: number; active: boolean; hue: number
}

interface FlashState { active: boolean; progress: number; r: number; g: number; b: number }

// 4D polytope data
interface Polytope4D {
  verts: number[][]   // [x,y,z,w] per vertex
  edges: [number, number][]
  hue: number
  rotPhase: number    // time offset so polytopes rotate at different phases
  scale: number
}

interface SceneData {
  depthStars: DepthStar[]
  tunnelRings: TunnelRing[]
  spores: SporeParticle[]
  vortexBeams: VortexBeam[]
  vortexPetals: VortexPetal[]
  bloomRays: BloomRay[]
  bloomOrbs: BloomOrb[]
  auroraRibbons: AuroraRibbon[]
  stars: StarParticle[]
  snow: SnowParticle[]
  smoke: SmokeParticle[]
  flashes: FlashState[]
  polytopes: Polytope4D[]
  lastAct: number
}

// ─────────────────────────────────────────────
// 4D MATH HELPERS
// ─────────────────────────────────────────────

function rot4XW(v: number[], a: number): number[] {
  const [x, y, z, w] = v
  return [x * Math.cos(a) - w * Math.sin(a), y, z, x * Math.sin(a) + w * Math.cos(a)]
}
function rot4YW(v: number[], a: number): number[] {
  const [x, y, z, w] = v
  return [x, y * Math.cos(a) - w * Math.sin(a), z, y * Math.sin(a) + w * Math.cos(a)]
}
function rot4ZW(v: number[], a: number): number[] {
  const [x, y, z, w] = v
  return [x, y, z * Math.cos(a) - w * Math.sin(a), z * Math.sin(a) + w * Math.cos(a)]
}
function rot4XY(v: number[], a: number): number[] {
  const [x, y, z, w] = v
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z, w]
}
function rot4YZ(v: number[], a: number): number[] {
  const [x, y, z, w] = v
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a), w]
}

function project4to2(v: number[], fov4: number, fov3: number): [number, number, number] {
  // 4D → 3D perspective
  const w4 = 2.2
  const d4 = 1 / (w4 - v[3])
  const x3 = v[0] * d4 * fov4
  const y3 = v[1] * d4 * fov4
  const z3 = v[2] * d4 * fov4
  // 3D → 2D perspective
  const z4 = 3
  const d3 = 1 / (z4 - z3 * 0.3)
  return [x3 * d3 * fov3, y3 * d3 * fov3, z3]
}

function rotatePoly(v: number[], t: number, phase: number): number[] {
  const T = t * 0.0004 + phase
  let r = rot4XW(v, T * 0.7)
  r = rot4YW(r, T * 0.5)
  r = rot4ZW(r, T * 0.3)
  r = rot4XY(r, T * 0.4)
  r = rot4YZ(r, T * 0.2)
  return r
}

// Build tesseract: 16 verts, 32 edges
function buildTesseract(): Polytope4D {
  const verts: number[][] = []
  for (let i = 0; i < 16; i++) {
    verts.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1,
    ])
  }
  const edges: [number, number][] = []
  for (let a = 0; a < 16; a++) {
    for (let b = a + 1; b < 16; b++) {
      const diff = a ^ b
      if (diff > 0 && (diff & (diff - 1)) === 0) edges.push([a, b])
    }
  }
  return { verts, edges, hue: 160, rotPhase: 0, scale: 1.0 }
}

// Build 16-cell (cross-polytope): 8 verts, 24 edges
function build16Cell(): Polytope4D {
  const verts: number[][] = [
    [1,0,0,0],[-1,0,0,0],[0,1,0,0],[0,-1,0,0],
    [0,0,1,0],[0,0,-1,0],[0,0,0,1],[0,0,0,-1],
  ]
  const edges: [number, number][] = []
  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      // Connect all non-antipodal pairs
      if (a !== b - 1 || b % 2 === 0) {
        // antipodal = (0,1), (2,3), (4,5), (6,7)
        const antipodal = (b === a + 1 && a % 2 === 0)
        if (!antipodal) edges.push([a, b])
      }
    }
  }
  return { verts, edges, hue: 200, rotPhase: Math.PI * 0.7, scale: 1.4 }
}

// Build 24-cell: 24 verts (permutations of (±1,±1,0,0))
function build24Cell(): Polytope4D {
  const verts: number[][] = []
  const coords = [0, 1, 2, 3]
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v = [0, 0, 0, 0]
          v[i] = si; v[j] = sj
          verts.push(v)
        }
      }
    }
  }
  // Connect vertices at distance sqrt(2)
  const edges: [number, number][] = []
  for (let a = 0; a < verts.length; a++) {
    for (let b = a + 1; b < verts.length; b++) {
      let d = 0
      for (let k = 0; k < 4; k++) d += (verts[a][k] - verts[b][k]) ** 2
      if (Math.abs(d - 2) < 0.01) edges.push([a, b])
    }
  }
  return { verts, edges, hue: 40, rotPhase: Math.PI * 1.3, scale: 0.72 }
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

function initScene(): SceneData {
  // Depth stars for Act 0
  const depthStars: DepthStar[] = []
  for (let i = 0; i < 1200; i++) {
    depthStars.push({
      x: (Math.random() - 0.5),
      y: (Math.random() - 0.5),
      z: 0.05 + Math.random() * 0.95,
      size: 0.3 + Math.random() * 1.8,
      brightness: 0.4 + Math.random() * 0.6,
      twinkle: 0.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.15 ? 200 + Math.random() * 40 : (Math.random() < 0.1 ? 30 + Math.random() * 20 : 0),
    })
  }

  const tunnelRings: TunnelRing[] = []
  for (let i = 0; i < 36; i++) {
    const emitters = []
    for (let j = 0; j < 10; j++) {
      emitters.push({
        angle: (j / 10) * Math.PI * 2 + Math.random() * 0.2,
        brightness: Math.random(), speed: 0.4 + Math.random() * 2.0, size: 2 + Math.random() * 5,
      })
    }
    tunnelRings.push({
      z: i * 180, rotation: Math.random() * Math.PI * 2, sides: Math.random() < 0.55 ? 6 : 8,
      scale: 0.5 + Math.random() * 0.7, hue: 135 + Math.random() * 50,
      speed: 0.5 + Math.random() * 1.5, emitters,
    })
  }

  const spores: SporeParticle[] = []
  for (let i = 0; i < 600; i++) {
    spores.push({
      x: (Math.random() - 0.5) * 2000, y: (Math.random() - 0.5) * 1400,
      z: Math.random() * 6500, size: 0.5 + Math.random() * 2.5,
      hue: 100 + Math.random() * 100, alpha: 0.2 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.4,
    })
  }

  const vortexBeams: VortexBeam[] = []
  for (let i = 0; i < 24; i++) {
    vortexBeams.push({
      angle: (i / 24) * Math.PI * 2, length: 220 + Math.random() * 380,
      width: 0.5 + Math.random() * 2.5, hue: 120 + Math.random() * 60,
      pulse: Math.random() * Math.PI * 2,
    })
  }

  const vortexPetals: VortexPetal[] = []
  for (let i = 0; i < 280; i++) {
    vortexPetals.push({
      angle: Math.random() * Math.PI * 2, dist: 30 + Math.random() * 520,
      size: 2 + Math.random() * 12, hue: 125 + Math.random() * 60,
      brightness: 40 + Math.random() * 35, spin: (Math.random() - 0.5) * 0.004,
    })
  }

  const bloomRays: BloomRay[] = []
  for (let i = 0; i < 56; i++) {
    bloomRays.push({
      angle: (i / 56) * Math.PI * 2 + Math.random() * 0.05,
      len: 120 + Math.random() * 380, width: 0.3 + Math.random() * 4,
      speed: 0.4 + Math.random() * 1.8, phase: Math.random() * Math.PI * 2,
    })
  }

  const bloomOrbs: BloomOrb[] = []
  for (let i = 0; i < 80; i++) {
    bloomOrbs.push({
      angle: Math.random() * Math.PI * 2, dist: 30 + Math.random() * 400,
      size: 1.5 + Math.random() * 9, hue: 20 + Math.random() * 40,
      orbit: 0.0005 + Math.random() * 0.003, phase: Math.random() * Math.PI * 2,
    })
  }

  const auroraRibbons: AuroraRibbon[] = []
  const auroraHues = [168, 175, 155, 140, 162]
  for (let i = 0; i < 5; i++) {
    auroraRibbons.push({
      y: 0.12 + i * 0.06, amp: 0.04 + Math.random() * 0.05,
      freq: 1.5 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2,
      hue: auroraHues[i], width: 0.025 + Math.random() * 0.04,
    })
  }

  const stars: StarParticle[] = []
  for (let i = 0; i < 280; i++) {
    stars.push({
      x: Math.random(), y: Math.random() * 0.62,
      size: 0.3 + Math.random() * 1.8, phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.8 + Math.random() * 2.0,
    })
  }

  const snow: SnowParticle[] = []
  for (let i = 0; i < 260; i++) {
    snow.push({
      x: Math.random(), y: Math.random(), size: 0.5 + Math.random() * 2.5,
      speed: 0.0003 + Math.random() * 0.0007, drift: (Math.random() - 0.3) * 0.0002,
      alpha: 0.2 + Math.random() * 0.55, wobble: Math.random() * Math.PI * 2,
    })
  }

  const smoke: SmokeParticle[] = []
  for (let i = 0; i < 80; i++) {
    smoke.push({
      x: 0, y: 0, vx: 0, vy: 0, size: 1, maxSize: 6 + Math.random() * 10,
      life: 0, maxLife: 70 + Math.random() * 90, alpha: 0, seed: Math.random() * Math.PI * 2,
      active: false, hue: 200 + Math.random() * 40,
    })
  }

  const flashes: FlashState[] = [
    { active: false, progress: 0, r: 180, g: 230, b: 255 },  // Act 1→2: blue-white (ripple impact)
    { active: false, progress: 0, r: 80,  g: 200, b: 210 },  // Act 2→3: teal emergence
    { active: false, progress: 0, r: 200, g: 255, b: 220 },  // Act 3→4: sage-white
    { active: false, progress: 0, r: 255, g: 210, b: 130 },  // Act 4→5: gold-white
    { active: false, progress: 0, r: 230, g: 240, b: 255 },  // Act 5→6: cool daylight
  ]

  const polytopes: Polytope4D[] = [
    buildTesseract(),
    build16Cell(),
    build24Cell(),
  ]

  return {
    depthStars, tunnelRings, spores, vortexBeams, vortexPetals,
    bloomRays, bloomOrbs, auroraRibbons, stars, snow, smoke,
    flashes, polytopes, lastAct: 0,
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function MountainJourney({ scrollProgress }: MountainJourneyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })
  const rafRef = useRef(0)
  const sceneRef = useRef<SceneData | null>(null)

  useEffect(() => { progressRef.current = scrollProgress }, [scrollProgress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth * (window.devicePixelRatio || 1)
      canvas.height = window.innerHeight * (window.devicePixelRatio || 1)
      canvas.style.width = '100%'
      canvas.style.height = '100%'
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.tx = e.clientX / window.innerWidth
      mouseRef.current.ty = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    if (!sceneRef.current) sceneRef.current = initScene()
    const scene = sceneRef.current

    const render = () => {
      const p = progressRef.current
      const t = performance.now()
      const W = canvas.width
      const H = canvas.height

      const m = mouseRef.current
      m.x += (m.tx - m.x) * 0.04
      m.y += (m.ty - m.y) * 0.04
      const mox = m.x - 0.5
      const moy = m.y - 0.5

      // Act detection
      const act = p < 0.10 ? 0
        : p < 0.22 ? 1
        : p < 0.32 ? 2
        : p < 0.50 ? 3
        : p < 0.63 ? 4
        : p < 0.74 ? 5
        : p < 0.87 ? 6
        : 7

      // Flash triggers on act change
      if (act !== scene.lastAct) {
        if (act > scene.lastAct) {
          const flashIdx = act - 1  // acts 1→7 map to flash indices 0→6
          if (flashIdx >= 0 && flashIdx < scene.flashes.length) {
            const f = scene.flashes[flashIdx]
            if (f) { f.active = true; f.progress = 0 }
          }
        }
        scene.lastAct = act
      }

      for (const f of scene.flashes) {
        if (f.active) {
          f.progress += 0.035
          if (f.progress >= 1) { f.active = false; f.progress = 1 }
        }
      }

      // Route
      if (p < 0.10) {
        drawAct0(ctx, t, p / 0.10, W, H, mox, moy, scene)
      } else if (p < 0.22) {
        drawAct1(ctx, t, (p - 0.10) / 0.12, W, H, mox, moy, scene)
      } else if (p < 0.32) {
        drawAct2(ctx, t, (p - 0.22) / 0.10, W, H, mox, moy, scene)
      } else if (p < 0.50) {
        drawAct3Hyper(ctx, t, (p - 0.32) / 0.18, W, H, mox, moy, scene)
      } else if (p < 0.63) {
        drawAct4(ctx, t, (p - 0.50) / 0.13, W, H, mox, moy, scene)
      } else if (p < 0.74) {
        drawAct5(ctx, t, (p - 0.63) / 0.11, W, H, mox, moy, scene)
      } else if (p < 0.87) {
        drawAct6(ctx, t, (p - 0.74) / 0.13, W, H, mox, moy, scene)
      } else {
        drawAct7(ctx, t, (p - 0.87) / 0.13, W, H, mox, moy, scene)
      }

      // Flash compositing (Lusion-style light blooms)
      for (const f of scene.flashes) {
        if (!f.active && f.progress <= 0) continue
        if (!f.active && f.progress >= 1) continue
        const flashT = f.progress < 0.25 ? f.progress / 0.25 : 1 - ((f.progress - 0.25) / 0.75)
        const a = Math.pow(flashT, 0.4) * 0.88
        if (a < 0.01) continue
        const cx2 = W / 2; const cy2 = H / 2; const r = Math.max(W, H) * 1.5
        const fg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r)
        fg.addColorStop(0, `rgba(${f.r},${f.g},${f.b},${a})`)
        fg.addColorStop(0.3, `rgba(${f.r},${f.g},${f.b},${a * 0.55})`)
        fg.addColorStop(1, `rgba(${f.r},${f.g},${f.b},0)`)
        ctx.fillStyle = fg
        ctx.fillRect(0, 0, W, H)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
  )
}

// ─────────────────────────────────────────────
// ACT 0: 3D STARFIELD — parallax + meditator
// ─────────────────────────────────────────────

function drawAct0(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2; const cy = H / 2

  // Deep space background
  ctx.fillStyle = `hsl(230,25%,${2 + lp * 2}%)`
  ctx.fillRect(0, 0, W, H)

  // Subtle nebula at center
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const nebR = Math.min(W, H) * 0.55
  const neb = ctx.createRadialGradient(cx + mox * 30, cy + moy * 20, 0, cx, cy, nebR)
  neb.addColorStop(0, `rgba(60,90,140,${0.08 * lp})`)
  neb.addColorStop(0.4, `rgba(40,70,110,${0.05 * lp})`)
  neb.addColorStop(1, 'rgba(20,40,80,0)')
  ctx.fillStyle = neb
  ctx.fillRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  // Slow dome rotation
  const domeSpin = t * 0.000045

  // Draw depth stars
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const star of scene.depthStars) {
    // Parallax: nearer stars (higher z) shift more with mouse
    const parallaxStrength = star.z * 0.18
    const spinOffset = domeSpin * star.z * 0.6
    const sx = cx + (star.x * W + Math.cos(spinOffset) * star.z * W * 0.04 + mox * parallaxStrength * W)
    const sy = cy + (star.y * H + Math.sin(spinOffset) * star.z * H * 0.025 + moy * parallaxStrength * H * 0.7)

    const twinkle = Math.sin(t * 0.001 * star.twinkle + star.phase) * 0.35 + 0.65
    const alpha = star.brightness * twinkle * Math.min(1, lp * 3)
    if (alpha < 0.02) continue

    const screenSize = star.size * (0.5 + star.z * 0.8)

    // Color: white with occasional blue/gold tint
    if (star.hue > 0) {
      ctx.fillStyle = `hsla(${star.hue},60%,80%,${alpha * 0.7})`
    } else {
      ctx.fillStyle = `rgba(${200 + star.size * 12},${210 + star.size * 6},240,${alpha})`
    }
    ctx.beginPath()
    ctx.arc(sx, sy, Math.max(0.3, screenSize), 0, Math.PI * 2)
    ctx.fill()

    // Glow for bright close stars
    if (star.size > 1.3 && star.z > 0.7) {
      const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, screenSize * 5)
      gr.addColorStop(0, `rgba(200,220,255,${alpha * 0.18})`)
      gr.addColorStop(1, 'rgba(200,220,255,0)')
      ctx.fillStyle = gr
      ctx.beginPath()
      ctx.arc(sx, sy, screenSize * 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  // Horizon atmosphere glow
  const atm = ctx.createLinearGradient(0, H * 0.55, 0, H)
  atm.addColorStop(0, 'rgba(0,0,0,0)')
  atm.addColorStop(1, `rgba(8,12,28,${0.6 * lp})`)
  ctx.fillStyle = atm
  ctx.fillRect(0, H * 0.55, W, H * 0.45)

  // Meditator — close-up on back, large, lower center of frame
  const figScale0 = (H * 0.42) / 72        // 42% of screen height = true close-up
  const figY = cy + H * 0.28 + moy * 8     // lower-center so back fills the frame
  drawFigureBack(ctx, t, cx + mox * 6, figY, figScale0, true)
}

// ─────────────────────────────────────────────
// ACT 1: THE FALL + RIPPLE
// ─────────────────────────────────────────────

function drawAct1(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2; const cy = H / 2

  // Stars fade out quickly as water world takes over
  const starFade = Math.max(0, 1 - lp * 2.5)
  if (starFade > 0.02) {
    ctx.fillStyle = `hsl(230,25%,3%)`
    ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const domeSpin = t * 0.000045
    for (const star of scene.depthStars) {
      const parallaxStrength = star.z * 0.18
      const spinOffset = domeSpin * star.z * 0.6
      const sx = cx + (star.x * W + Math.cos(spinOffset) * star.z * W * 0.04 + mox * parallaxStrength * W)
      const sy = cy + (star.y * H + Math.sin(spinOffset) * star.z * H * 0.025 + moy * parallaxStrength * H * 0.7)
      const twinkle = Math.sin(t * 0.001 * star.twinkle + star.phase) * 0.35 + 0.65
      const alpha = star.brightness * twinkle * starFade
      if (alpha < 0.02) continue
      const screenSize = star.size * (0.5 + star.z * 0.8)
      ctx.fillStyle = `rgba(200,210,240,${alpha})`
      ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.3, screenSize), 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  } else {
    ctx.fillStyle = '#050a0c'
    ctx.fillRect(0, 0, W, H)
  }

  // ── Figure sizing matches Act 0 close-up ──
  const figScale1 = (H * 0.42) / 72
  const figX = cx + mox * 6
  // Water surface Y — the figure's feet rest ON the water
  const waterY = cy + H * 0.28 + 14 * figScale1   // same position as Act 0 figure base

  // ── Phases ──
  const fallPhase   = Math.min(1, lp / 0.38)                    // 0→1: figure tips into water
  const entryPhase  = lp > 0.35 ? Math.min(1, (lp - 0.35) / 0.18) : 0  // sinking into water
  const ripplePhase = Math.max(0, (lp - 0.38) / 0.62)           // ripples expand outward
  const sinkPhase   = lp > 0.40 ? Math.min(1, (lp - 0.40) / 0.45) : 0  // figure disappears below

  // ── Water surface — appears and brightens as fall progresses ──
  const waterAppear = Math.min(1, lp * 3)
  if (waterAppear > 0) {
    // Below-water fill — deepens as camera follows
    const depthFill = ctx.createLinearGradient(0, waterY, 0, H)
    depthFill.addColorStop(0, `rgba(8,40,55,${waterAppear * 0.9})`)
    depthFill.addColorStop(1, `rgba(4,20,35,${waterAppear})`)
    ctx.fillStyle = depthFill
    ctx.fillRect(0, waterY, W, H - waterY)

    // Wavy surface line
    ctx.save()
    ctx.beginPath()
    const waveSteps = 120
    for (let i = 0; i <= waveSteps; i++) {
      const wx = (i / waveSteps) * W
      const wy = waterY
        + Math.sin(wx * 0.012 + t * 0.0018) * (5 + entryPhase * 18)
        + Math.sin(wx * 0.007 + t * 0.0012) * (3 + entryPhase * 10)
        + Math.sin(wx * 0.022 - t * 0.002) * 2
      i === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy)
    }
    // Shimmer line
    const shimmerAlpha = 0.5 + Math.sin(t * 0.002) * 0.15
    ctx.strokeStyle = `rgba(160,220,240,${shimmerAlpha * waterAppear})`
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Surface caustic glow
    ctx.globalCompositeOperation = 'lighter'
    const surfGrad = ctx.createLinearGradient(0, waterY - 30, 0, waterY + 60)
    surfGrad.addColorStop(0, 'rgba(0,0,0,0)')
    surfGrad.addColorStop(0.4, `rgba(60,160,200,${0.12 * waterAppear})`)
    surfGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = surfGrad
    ctx.fillRect(0, waterY - 30, W, 90)
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  // ── Falling / sinking figure ──
  const figBaseY = cy + H * 0.28   // matches Act 0 position
  ctx.save()
  ctx.translate(figX, figBaseY)

  if (sinkPhase < 1) {
    const tilt = fallPhase * Math.PI * 0.5   // X-axis rotation: 0=upright, PI/2=flat
    const sinkY = sinkPhase * figScale1 * 85
    const pivotY = 14 * figScale1

    ctx.save()
    if (sinkPhase > 0) {
      ctx.beginPath()
      ctx.rect(-W, -H * 2, W * 2, H * 2 + (waterY - figBaseY))
      ctx.clip()
    }
    // X-axis rotation simulation: squash Y around seat pivot
    ctx.translate(0, sinkY)
    ctx.translate(0, pivotY)
    ctx.scale(1, Math.cos(tilt))
    ctx.translate(0, -pivotY)
    ctx.globalAlpha = Math.max(0, 1 - sinkPhase * 1.6)
    ctx.scale(figScale1, figScale1)
    drawFigureLocalBack(ctx, t, 0)
    ctx.restore()
  }
  ctx.globalAlpha = 1
  ctx.restore()

  // ── Water surface splash — brightens as figure enters ──
  if (entryPhase > 0 && entryPhase < 1) {
    const splashA = Math.sin(entryPhase * Math.PI) * 0.7
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const splashGrad = ctx.createRadialGradient(figX, waterY, 0, figX, waterY, W * 0.35)
    splashGrad.addColorStop(0, `rgba(180,240,255,${splashA * 0.9})`)
    splashGrad.addColorStop(0.25, `rgba(120,210,240,${splashA * 0.45})`)
    splashGrad.addColorStop(1, 'rgba(60,140,190,0)')
    ctx.fillStyle = splashGrad
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  // ── Concentric water ripples from entry point ──
  if (ripplePhase > 0) {
    const impactX = figX
    const impactY = waterY

    // Draw ripples as ellipses (perspective-flattened on water surface)
    const ringCount = 10
    for (let r = 0; r < ringCount; r++) {
      const delay = r * 0.07
      const rp = Math.max(0, ripplePhase - delay)
      if (rp <= 0) continue

      const rx = rp * W * 0.9                 // wide horizontal spread
      const ry = rx * 0.22                    // flat ellipse = water surface perspective
      const alpha = Math.max(0, (1 - rp) * (1 - r * 0.07)) * 0.75

      if (alpha < 0.01) continue

      const rippleHue = 185 + r * 2
      ctx.save()
      ctx.globalCompositeOperation = r < 4 ? 'lighter' : 'source-over'
      ctx.beginPath()
      ctx.ellipse(impactX, impactY, rx, ry, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${rippleHue},70%,75%,${alpha})`
      ctx.lineWidth = Math.max(0.4, (2.8 - r * 0.22) * (1 - rp * 0.6))
      ctx.stroke()

      // Glow band inside ring
      if (r < 5 && alpha > 0.08) {
        const innerG = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, rx)
        innerG.addColorStop(Math.max(0, 1 - 0.12 / Math.max(0.01, rp)), `hsla(${rippleHue},70%,78%,0)`)
        innerG.addColorStop(1, `hsla(${rippleHue},70%,78%,${alpha * 0.35})`)
        ctx.fillStyle = innerG
        ctx.beginPath()
        ctx.ellipse(impactX, impactY, rx, ry, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    // Surface glow at entry point — fades as camera follows under
    const entryGlow = Math.max(0, 1 - ripplePhase * 1.8)
    if (entryGlow > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const eg = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, 80)
      eg.addColorStop(0, `rgba(150,230,250,${entryGlow * 0.6})`)
      eg.addColorStop(1, 'rgba(80,180,220,0)')
      ctx.fillStyle = eg
      ctx.beginPath(); ctx.arc(impactX, impactY, 80, 0, Math.PI * 2); ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()
    }
  }
}

// ─────────────────────────────────────────────
// ACT 2: THROUGH THE WATER SURFACE
// ─────────────────────────────────────────────

function drawAct2(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2; const cy = H / 2

  // Camera push-through: 0 = looking at surface, 1 = deep below
  const throughPhase = Math.pow(lp, 0.7)

  // Deep water color — boosted lightness so caustics are visible
  const deepBlue = `hsl(${200 - throughPhase * 20},${50 + throughPhase * 20}%,${10 + throughPhase * 12}%)`
  ctx.fillStyle = deepBlue
  ctx.fillRect(0, 0, W, H)

  // ── Caustic light from surface above ──
  // Keep caustics visible through full act — fade gently in second half
  const surfaceAlpha = Math.max(0, 1 - throughPhase * 0.75)
  if (surfaceAlpha > 0.01) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    // Moving caustic rings — overlapping ellipses of light
    const causticCount = 28
    for (let i = 0; i < causticCount; i++) {
      const seed = i * 137.508
      const cx2 = cx + Math.sin(seed * 0.031 + t * 0.0005 + mox * 0.4) * W * 0.42
      const cy2 = cy * 0.5 + Math.cos(seed * 0.027 + t * 0.0004 + moy * 0.3) * H * 0.28
      const r = (25 + Math.sin(seed * 0.11 + t * 0.0008) * 18) * (W / 1440)
      const alpha = (0.22 + Math.sin(seed * 0.07 + t * 0.001) * 0.1) * surfaceAlpha

      const cg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r * 3)
      cg.addColorStop(0, `rgba(150,220,240,${alpha * 2.0})`)
      cg.addColorStop(0.3, `rgba(100,190,220,${alpha})`)
      cg.addColorStop(1, 'rgba(60,150,190,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.ellipse(cx2, cy2, r * 3, r * 2, seed * 0.1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Vertical light shafts from surface
    for (let s = 0; s < 8; s++) {
      const sx = cx + (s / 8 - 0.5 + 1 / 16) * W * 0.9 + mox * 30
      const shaftAlpha = (0.16 + Math.sin(s * 1.3 + t * 0.0006) * 0.08) * surfaceAlpha
      const sg = ctx.createLinearGradient(sx - 20, 0, sx + 20, H * 0.8)
      sg.addColorStop(0, `rgba(140,220,240,${shaftAlpha * 1.8})`)
      sg.addColorStop(0.5, `rgba(90,185,215,${shaftAlpha})`)
      sg.addColorStop(1, 'rgba(60,150,190,0)')
      ctx.fillStyle = sg
      ctx.fillRect(sx - 20 + Math.sin(t * 0.0007 + s) * 10, 0, 40, H * 0.8)
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  // ── Water membrane surface visible above ──
  const membraneY = H * (0.25 - throughPhase * 0.6)
  if (membraneY > -50) {
    // Wavy surface line
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, membraneY)
    const steps = 80
    for (let s = 0; s <= steps; s++) {
      const sx = (s / steps) * W
      const wave1 = Math.sin(sx * 0.008 + t * 0.0015 + mox * 2) * 12
      const wave2 = Math.sin(sx * 0.013 + t * 0.001) * 7
      ctx.lineTo(sx, membraneY + wave1 + wave2)
    }
    ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath()

    // Above surface = lighter / more reflective
    const surfGrad = ctx.createLinearGradient(0, membraneY - 60, 0, membraneY + 20)
    surfGrad.addColorStop(0, `rgba(100,180,210,${0.25 * (1 - throughPhase)})`)
    surfGrad.addColorStop(0.7, `rgba(70,150,190,${0.12 * (1 - throughPhase)})`)
    surfGrad.addColorStop(1, 'rgba(50,130,170,0)')
    ctx.fillStyle = surfGrad
    ctx.fill()

    // Surface shimmer line
    ctx.beginPath()
    for (let s = 0; s <= steps; s++) {
      const sx = (s / steps) * W
      const wave1 = Math.sin(sx * 0.008 + t * 0.0015 + mox * 2) * 12
      const wave2 = Math.sin(sx * 0.013 + t * 0.001) * 7
      s === 0 ? ctx.moveTo(sx, membraneY + wave1 + wave2) : ctx.lineTo(sx, membraneY + wave1 + wave2)
    }
    ctx.strokeStyle = `rgba(180,230,245,${0.35 * (1 - throughPhase * 1.5)})`
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
  }

  // ── Scan-line distortion as we push through ──
  if (throughPhase > 0.3 && throughPhase < 0.85) {
    const distortStrength = Math.sin((throughPhase - 0.3) / 0.55 * Math.PI) * 0.6
    const lineCount = 12
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < lineCount; i++) {
      const lineY = (i / lineCount) * H + Math.sin(t * 0.0012 + i) * 20
      const lineAlpha = 0.035 * distortStrength * (0.5 + Math.sin(i * 0.8 + t * 0.0018) * 0.5)
      const lg = ctx.createLinearGradient(0, lineY, W, lineY)
      lg.addColorStop(0, `rgba(80,180,210,0)`)
      lg.addColorStop(0.5, `rgba(80,180,210,${lineAlpha})`)
      lg.addColorStop(1, `rgba(80,180,210,0)`)
      ctx.fillStyle = lg
      ctx.fillRect(0, lineY - 1, W, 2)
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  // ── Deep void emerges below ──
  if (throughPhase > 0.6) {
    const voidAlpha = (throughPhase - 0.6) / 0.4
    const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8)
    vg.addColorStop(0, `rgba(5,8,18,${voidAlpha * 0.7})`)
    vg.addColorStop(0.5, `rgba(3,5,12,${voidAlpha * 0.4})`)
    vg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)
  }

  // ── Deep ambient bioluminescent glow when submerged ──
  if (throughPhase > 0.2) {
    const deepAlpha = Math.min(1, (throughPhase - 0.2) / 0.5)
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const dg = ctx.createRadialGradient(cx, cy * 1.3, 0, cx, cy * 1.3, Math.min(W, H) * 0.8)
    dg.addColorStop(0, `rgba(40,140,160,${deepAlpha * 0.35})`)
    dg.addColorStop(0.4, `rgba(20,100,130,${deepAlpha * 0.18})`)
    dg.addColorStop(1, 'rgba(10,60,100,0)')
    ctx.fillStyle = dg
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  // ── Particle motes rising in water ──
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 80; i++) {
    const seed = i * 73.1
    const px = cx + Math.sin(seed * 0.08 + t * 0.0003 + mox * 0.5) * W * 0.46
    const py = ((1 - ((t * 0.00008 + seed * 0.011) % 1)) * H * 1.2) - H * 0.1
    const moteAlpha = (0.3 + Math.sin(seed * 0.15 + t * 0.002) * 0.15)
    if (moteAlpha < 0.01) continue
    ctx.beginPath()
    ctx.arc(px, py, 1.5 + Math.sin(seed * 0.2) * 1.0, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(140,220,240,${moteAlpha})`
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

// ─────────────────────────────────────────────
// ACT 3: HYPERSPACE 4D GEOMETRY
// ─────────────────────────────────────────────

function drawAct3Hyper(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2 + mox * 50; const cy = H / 2 + moy * 35

  // Pure void — maximum contrast for wireframe visibility
  ctx.fillStyle = `hsl(222,30%,${2 + lp * 2}%)`
  ctx.fillRect(0, 0, W, H)

  // Smaller FOV so polytope fits within viewport as a single object, not a flood
  const fov4 = Math.min(W, H) * 0.18 * (0.6 + lp * 0.5)
  const fov3 = Math.min(W, H) * 0.22

  // ── Only render tesseract (32 edges) — secondary polytopes overwhelm the scene ──
  const polyAlphas = [
    0.85,   // tesseract: primary crisp
    0.35,   // 16-cell: ghost secondary
    0.0,    // 24-cell: disabled (96 edges = too much coverage)
  ]
  const polyLineWidths = [
    0.9,
    0.5,
    0.0,
  ]

  for (let pi = 0; pi < scene.polytopes.length; pi++) {
    const poly = scene.polytopes[pi]
    const baseAlpha = polyAlphas[pi]
    const lw = polyLineWidths[pi]

    // Project all vertices
    const projected: [number, number, number][] = poly.verts.map(v => {
      const s = [...v].map(c => c * poly.scale)
      const r = rotatePoly(s, t, poly.rotPhase)
      const [px, py, pz] = project4to2(r, fov4, fov3)
      return [cx + px, cy + py, pz]
    })

    // Draw edges with depth-based alpha — use source-over to avoid 'lighter' wash
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'

    for (const [a, b] of poly.edges) {
      const [ax, ay, az] = projected[a]
      const [bx, by, bz] = projected[b]

      // Depth-based alpha
      const depthFactor = Math.max(0.15, 1 - Math.abs(az + bz) * 0.12)
      const alpha = baseAlpha * depthFactor

      if (pi === 0) {
        // Tesseract: chromatic aberration pass
        const caOff = 2.0 * (1 - lp * 0.3)
        const passes: [number, string][] = [
          [-caOff, `hsla(0,80%,70%,${alpha * 0.25})`],
          [0,      `hsla(${poly.hue},75%,72%,${alpha})`],
          [caOff,  `hsla(195,80%,72%,${alpha * 0.25})`],
        ]
        for (const [dx, color] of passes) {
          ctx.beginPath()
          ctx.moveTo(ax + dx, ay)
          ctx.lineTo(bx + dx, by)
          ctx.strokeStyle = color
          ctx.lineWidth = lw
          ctx.shadowBlur = 0
          ctx.stroke()
        }
      } else {
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.strokeStyle = `hsla(${poly.hue},65%,65%,${alpha})`
        ctx.lineWidth = lw
        ctx.shadowBlur = 0
        ctx.stroke()
      }
    }

    // Vertex glow nodes — capped radius so they don't overexpose
    for (const [px, py] of projected) {
      const pulse = Math.sin(t * 0.003 + px * 0.01 + py * 0.008) * 0.5 + 0.5
      const glowR = Math.min(10, 4 + lw * 2)
      const vg = ctx.createRadialGradient(px, py, 0, px, py, glowR)
      vg.addColorStop(0, `hsla(${poly.hue + 20},90%,90%,${baseAlpha * 0.8 * pulse})`)
      vg.addColorStop(1, `hsla(${poly.hue},70%,60%,0)`)
      ctx.fillStyle = vg
      ctx.beginPath()
      ctx.arc(px, py, glowR, 0, Math.PI * 2)
      ctx.fill()
    }

    // ── Mirror flash pass — sharp specular burst at peak of pulse ──
    // Each polytope independently flashes like a mirror catching light
    const mirrorPulse = Math.pow(Math.max(0, Math.sin(t * 0.0031 + pi * 2.4)), 6)
    if (mirrorPulse > 0.05 && pi === 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const [a, b] of poly.edges) {
        const [ax, ay] = projected[a]
        const [bx, by] = projected[b]
        ctx.beginPath()
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
        ctx.strokeStyle = `rgba(255,255,255,${mirrorPulse * 0.7})`
        ctx.lineWidth = lw * 2.5
        ctx.shadowColor = `rgba(200,240,255,${mirrorPulse * 0.8})`
        ctx.shadowBlur = 18
        ctx.stroke()
      }
      ctx.shadowBlur = 0
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()
    }

    ctx.shadowBlur = 0
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  // ── Hyperspace spore particles — sparse, only ~30 bright dots against void ──
  const camZ = lp * 6000 + t * 0.15
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  let sporeDraw = 0
  for (let si = 0; si < scene.spores.length; si++) {
    if (sporeDraw >= 30) break           // hard cap: max 30 visible at a time
    const sp = scene.spores[si]
    let pz = ((sp.z - camZ) % 6500 + 6500) % 6500
    if (pz < 400 || pz > 4000) continue // only mid-range depth
    const fovS = Math.min(W, H) * 0.55
    const scale = fovS / pz
    const px = cx + (sp.x + mox * 80) * scale
    const py = cy + (sp.y + moy * 60) * scale
    if (px < 0 || px > W || py < 0 || py > H) continue
    const ps = Math.min(3, sp.size * scale)
    const pa = sp.alpha * Math.max(0, 1 - pz / 3600) * lp * 0.5
    if (pa < 0.05 || ps < 0.3) continue
    ctx.beginPath()
    ctx.arc(px, py, ps, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${sp.hue},60%,82%,${pa})`
    ctx.fill()
    sporeDraw++
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  // ── Central singularity glow — small focal point only ──
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const glowP = Math.sin(t * 0.0016) * 0.5 + 0.5
  const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + glowP * 20)
  cGrad.addColorStop(0, `rgba(180,240,220,${0.9 + glowP * 0.1})`)
  cGrad.addColorStop(0.5, `rgba(100,200,180,0.2)`)
  cGrad.addColorStop(1, 'rgba(60,140,140,0)')
  ctx.fillStyle = cGrad
  ctx.fillRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  // Tiny meditator at center, barely visible
  drawFigureBack(ctx, t, cx + mox * 0.1, cy + moy * 0.1 + 16, 0.22 * (W / 1440), false)
}

// ─────────────────────────────────────────────
// ACT 4: MANDALA VORTEX
// ─────────────────────────────────────────────

function drawAct4(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2 + mox * 40; const cy = H / 2 + moy * 30

  // Warm amber-gold background — visually distinct from Act 3's blue-sage
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.9)
  bg.addColorStop(0, `hsl(${35 + lp * 10},${30 + lp * 20}%,${5 + lp * 4}%)`)
  bg.addColorStop(0.5, 'hsl(30,20%,2%)')
  bg.addColorStop(1, 'hsl(25,10%,1%)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const spin = t * 0.00035 + lp * Math.PI * 0.8
  const maxLen = Math.min(W, H) * 0.5

  // Warm radial glow at center
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const manGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxLen * 0.5)
  manGlow.addColorStop(0, `rgba(200,150,60,${0.3 * lp})`)
  manGlow.addColorStop(0.4, `rgba(160,110,40,${0.12 * lp})`)
  manGlow.addColorStop(1, 'rgba(100,60,20,0)')
  ctx.fillStyle = manGlow
  ctx.fillRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const beam of scene.vortexBeams) {
    const a = beam.angle + spin
    const pulse = Math.sin(t * 0.0022 + beam.pulse) * 0.5 + 0.5
    const len = beam.length * (0.5 + lp * 0.9) * (maxLen / 400)
    const x1 = cx + Math.cos(a) * 20; const y1 = cy + Math.sin(a) * 20
    const x2 = cx + Math.cos(a) * len; const y2 = cy + Math.sin(a) * len
    // Warm amber/gold beams (hue 30-60) instead of sage green
    const warmHue = 30 + (beam.hue - 120) * 0.3  // remap sage 120-180 → amber 30-48
    const bGrad = ctx.createLinearGradient(x1, y1, x2, y2)
    bGrad.addColorStop(0, `hsla(${warmHue},90%,75%,${0.7 * pulse})`)
    bGrad.addColorStop(0.4, `hsla(${warmHue},75%,55%,${0.25 * pulse})`)
    bGrad.addColorStop(1, `hsla(${warmHue},55%,40%,0)`)
    ctx.beginPath()
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
    ctx.strokeStyle = bGrad
    ctx.lineWidth = beam.width * (1.5 + pulse * 1.0)
    ctx.shadowColor = `hsla(${warmHue},85%,65%,0.5)`
    ctx.shadowBlur = 6
    ctx.stroke()
  }
  ctx.shadowBlur = 0
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  const ringCount = 7
  for (let r = 0; r < ringCount; r++) {
    const rRatio = (r + 1) / ringCount
    const ringR = rRatio * maxLen * 0.8 * (0.6 + lp * 0.6)
    const nodeCount = 6 + r * 2
    const rotOff = spin * (r % 2 === 0 ? 1 : -1) * 0.3
    ctx.save()
    ctx.globalCompositeOperation = r < 3 ? 'lighter' : 'source-over'
    ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = `hsla(38,65%,55%,${0.08 + lp * 0.12})`; ctx.lineWidth = 0.8; ctx.stroke()
    for (let n = 0; n < nodeCount; n++) {
      const na = (n / nodeCount) * Math.PI * 2 + rotOff
      const nx = cx + Math.cos(na) * ringR; const ny = cy + Math.sin(na) * ringR
      const nb = Math.sin(t * 0.003 + n * 1.3 + r) * 0.5 + 0.5
      ctx.beginPath(); ctx.arc(nx, ny, 2 + r * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${35 + r * 5},75%,65%,${0.4 * nb * lp})`; ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const p of scene.vortexPetals) {
    const a = p.angle + spin * (1 + Math.abs(p.spin) * 100)
    const d = p.dist * (0.25 + lp * 0.95) * (Math.min(W, H) / 800)
    const px = cx + Math.cos(a) * d; const py = cy + Math.sin(a) * d
    const pulse = Math.sin(t * 0.004 + p.angle * 3) * 0.5 + 0.5
    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size)
    const warmPetalHue = 30 + (p.hue - 125) * 0.25  // remap to warm amber range
    pGrad.addColorStop(0, `hsla(${warmPetalHue},75%,${p.brightness}%,${0.18 + pulse * 0.12})`)
    pGrad.addColorStop(1, `hsla(${warmPetalHue},50%,40%,0)`)
    ctx.fillStyle = pGrad
    ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  const voidR = maxLen * 0.08 * (1 + lp * 0.5)
  const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, voidR * 2.5)
  voidGrad.addColorStop(0, 'rgba(0,0,0,0.95)')
  voidGrad.addColorStop(0.6, 'rgba(0,0,0,0.6)')
  voidGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = voidGrad
  ctx.beginPath(); ctx.arc(cx, cy, voidR * 2.5, 0, Math.PI * 2); ctx.fill()

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const rimGrad = ctx.createRadialGradient(cx, cy, voidR * 0.5, cx, cy, voidR * 1.6)
  rimGrad.addColorStop(0, 'rgba(0,0,0,0)')
  rimGrad.addColorStop(0.7, `rgba(210,160,70,${0.5 * lp})`)
  rimGrad.addColorStop(1, 'rgba(180,120,40,0)')
  ctx.fillStyle = rimGrad
  ctx.beginPath(); ctx.arc(cx, cy, voidR * 1.6, 0, Math.PI * 2); ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

// ─────────────────────────────────────────────
// ACT 5: GOLDEN CHAKRA BLOOM
// ─────────────────────────────────────────────

function drawAct5(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2 + mox * 30; const cy = H / 2 + moy * 20
  const maxD = Math.min(W, H) * 0.5

  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H))
  bg.addColorStop(0, `hsl(${30 + lp * 10},${40 + lp * 20}%,${7 + lp * 5}%)`)
  bg.addColorStop(0.7, 'hsl(25,20%,3%)')
  bg.addColorStop(1, 'hsl(20,15%,1%)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const ray of scene.bloomRays) {
    const a = ray.angle + t * 0.00015
    const pulse = Math.sin(t * 0.003 * ray.speed + ray.phase) * 0.5 + 0.5
    const len = ray.len * (0.5 + lp * 1.2) * (maxD / 300) * (0.6 + pulse * 0.6)
    const rGrad = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    rGrad.addColorStop(0, `rgba(255,220,130,${0.45 * pulse})`)
    rGrad.addColorStop(0.3, `rgba(240,170,70,${0.2 * pulse})`)
    rGrad.addColorStop(1, 'rgba(200,100,30,0)')
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    ctx.strokeStyle = rGrad; ctx.lineWidth = ray.width * (0.8 + pulse * 1.2); ctx.stroke()
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const orb of scene.bloomOrbs) {
    const a = orb.angle + t * orb.orbit
    const d = orb.dist * (0.35 + lp * 0.9) * (maxD / 350)
    const ox = cx + Math.cos(a) * d; const oy = cy + Math.sin(a) * d
    const pulse = Math.sin(t * 0.004 + orb.phase) * 0.5 + 0.5
    const oR = orb.size * (0.7 + pulse * 0.6)
    const oGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, oR * 4)
    oGrad.addColorStop(0, `hsla(${orb.hue},90%,75%,${0.65 * pulse})`)
    oGrad.addColorStop(0.4, `hsla(${orb.hue},75%,60%,${0.25 * pulse})`)
    oGrad.addColorStop(1, `hsla(${orb.hue},60%,50%,0)`)
    ctx.fillStyle = oGrad
    ctx.beginPath(); ctx.arc(ox, oy, oR * 4, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  const coreBreath = Math.sin(t * 0.0022) * 0.5 + 0.5
  const coreR = (70 + coreBreath * 35 + lp * 50) * (maxD / 300)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5)
  coreGrad.addColorStop(0, `rgba(255,240,180,${0.6 + coreBreath * 0.3})`)
  coreGrad.addColorStop(0.2, `rgba(255,200,80,0.4)`)
  coreGrad.addColorStop(0.6, `rgba(220,140,40,0.12)`)
  coreGrad.addColorStop(1, 'rgba(180,80,20,0)')
  ctx.fillStyle = coreGrad
  ctx.beginPath(); ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  ctx.beginPath(); ctx.arc(cx, cy, coreR * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,250,220,${0.7 + coreBreath * 0.25})`; ctx.fill()

  for (let r = 0; r < 5; r++) {
    const rR = (40 + r * 55 + lp * 30) * (maxD / 300)
    const rA = Math.sin(t * 0.002 + r) * 0.5 + 0.5
    ctx.beginPath(); ctx.arc(cx, cy, rR, 0, Math.PI * 2)
    ctx.strokeStyle = `hsla(${30 + r * 8},80%,65%,${0.08 + rA * 0.12})`
    ctx.lineWidth = 0.8; ctx.stroke()
  }
}

// ─────────────────────────────────────────────
// ACT 6: MOUNTAIN ARRIVAL
// ─────────────────────────────────────────────

function drawAct6(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2; const cy = H / 2
  const mx = mox * 18; const my = moy * 12

  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, `hsl(230,${30 + lp * 15}%,${5 + lp * 4}%)`)
  sky.addColorStop(0.3, `hsl(225,25%,${3 + lp * 3}%)`)
  sky.addColorStop(0.7, 'hsl(220,20%,4%)'); sky.addColorStop(1, 'hsl(218,18%,6%)')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

  for (const star of scene.stars) {
    const sb = Math.sin(t * 0.001 * star.twinkleSpeed + star.phase) * 0.4 + 0.6
    const sx = (star.x * W + mx * 0.2) % W; const sy = star.y * H * 0.65 + my * 0.1
    ctx.beginPath(); ctx.arc(sx, sy, star.size * sb, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${200 + star.size * 10},${210 + star.size * 5},240,${sb * 0.75})`; ctx.fill()
    if (star.size > 1.2) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 4)
      sg.addColorStop(0, `rgba(200,220,255,${0.15 * sb})`); sg.addColorStop(1, 'rgba(200,220,255,0)')
      ctx.fillStyle = sg; ctx.fillRect(sx - star.size * 4, sy - star.size * 4, star.size * 8, star.size * 8)
      ctx.globalCompositeOperation = 'source-over'; ctx.restore()
    }
  }

  if (lp > 0.2) {
    const auroraAlpha = Math.min(1, (lp - 0.2) / 0.4)
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    for (const ribbon of scene.auroraRibbons) {
      const baseY = ribbon.y * H
      const pulseA = Math.sin(t * 0.0008 + ribbon.phase) * 0.5 + 0.5
      const ribbonAlpha = auroraAlpha * (0.3 + pulseA * 0.4) * 0.6
      if (ribbonAlpha < 0.02) continue
      const steps = 80
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath()
        for (let s = 0; s <= steps; s++) {
          const sx = (s / steps) * W
          const offset = Math.sin(sx / W * Math.PI * 2 * ribbon.freq + t * 0.0006 + ribbon.phase)
          const sy = baseY + offset * ribbon.amp * H + my * 0.4 + layer * ribbon.width * H * 0.4
          s === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
        }
        for (let s = steps; s >= 0; s--) {
          const sx = (s / steps) * W
          const offset = Math.sin(sx / W * Math.PI * 2 * ribbon.freq + t * 0.0006 + ribbon.phase)
          const sy = baseY + offset * ribbon.amp * H + my * 0.4 - (layer + 1) * ribbon.width * H * 0.4
          ctx.lineTo(sx, sy)
        }
        ctx.closePath()
        const layerAlpha = ribbonAlpha * (1 - layer * 0.3)
        const aGrad = ctx.createLinearGradient(0, baseY - ribbon.amp * H, 0, baseY + ribbon.amp * H)
        aGrad.addColorStop(0, `hsla(${ribbon.hue},75%,65%,0)`)
        aGrad.addColorStop(0.5, `hsla(${ribbon.hue},75%,65%,${layerAlpha})`)
        aGrad.addColorStop(1, `hsla(${ribbon.hue},75%,65%,0)`)
        ctx.fillStyle = aGrad; ctx.fill()
      }
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.restore()
  }

  drawMountainHaze(ctx, cx, cy, W, H, mx, my)
  drawMountainRange(ctx, W, H, mx * 0.2, my * 0.15,
    [0.06,0.55,0.20,0.47,0.38,0.52,0.55,0.44,0.72,0.50,0.88,0.46,1.06,0.60], '#111428', 0.72)
  drawMountainRange(ctx, W, H, mx * 0.4, my * 0.25,
    [0.04,0.62,0.16,0.53,0.27,0.59,0.40,0.49,0.52,0.46,0.62,0.52,0.76,0.55,0.90,0.48,1.06,0.65], '#171a35', 0.76)

  const peakX = cx + mx * 0.8; const peakY = H * 0.42 + my * 0.5
  ctx.beginPath()
  ctx.moveTo(peakX - 280 + mx * 0.5, H * 0.76 + my * 0.3); ctx.lineTo(peakX, peakY)
  ctx.lineTo(peakX + 280 + mx * 0.5, H * 0.76 + my * 0.3); ctx.lineTo(peakX + 340, H); ctx.lineTo(peakX - 340, H)
  ctx.closePath()
  const peakGrad = ctx.createLinearGradient(peakX, peakY, peakX, H * 0.76)
  peakGrad.addColorStop(0, '#f0ecea'); peakGrad.addColorStop(0.15, '#c8c0bc')
  peakGrad.addColorStop(0.4, '#2c3252'); peakGrad.addColorStop(1, '#1c2048')
  ctx.fillStyle = peakGrad; ctx.fill()

  ctx.save(); ctx.clip()
  const snowCapGrad = ctx.createLinearGradient(peakX, peakY, peakX, peakY + H * 0.1)
  snowCapGrad.addColorStop(0, 'rgba(245,243,242,0.9)'); snowCapGrad.addColorStop(0.5, 'rgba(200,195,192,0.4)')
  snowCapGrad.addColorStop(1, 'rgba(180,178,185,0)'); ctx.fillStyle = snowCapGrad; ctx.fill(); ctx.restore()

  for (const s of scene.snow) {
    s.x = ((s.x + s.speed + Math.sin(t * 0.0008 + s.wobble) * 0.0001) % 1.2 + 1.2) % 1.2
    s.y += s.drift + s.speed * 0.7
    if (s.y > 1.0) { s.y = -0.05; s.x = Math.random() * 1.2 }
    ctx.beginPath(); ctx.arc(s.x * W + mx * 0.15, s.y * H + my * 0.1, s.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(230,236,242,${s.alpha * Math.min(1, lp * 2)})`; ctx.fill()
  }

  const figX = peakX; const figY = peakY - 42
  const figBreath = Math.sin(t * 0.0011) * 0.028
  const figScale = (0.55 + lp * 0.35 + figBreath * 0.05) * (W / 1440)
  drawFigureBack(ctx, t, figX, figY, figScale, true)

  if (lp > 0.3) {
    const aGlow = (lp - 0.3) / 0.7
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    const auraGrad = ctx.createRadialGradient(figX, figY - 30, 0, figX, figY - 30, 80 * figScale * 60)
    auraGrad.addColorStop(0, `rgba(200,168,124,${0.08 * aGlow})`)
    auraGrad.addColorStop(0.5, `rgba(127,168,130,${0.04 * aGlow})`)
    auraGrad.addColorStop(1, 'rgba(127,168,130,0)')
    ctx.fillStyle = auraGrad; ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'; ctx.restore()
  }
}

// ─────────────────────────────────────────────
// ACT 7: TURN + CANDLE + SMOKE → PORTAL
// ─────────────────────────────────────────────

function drawAct7(
  ctx: CanvasRenderingContext2D, t: number, lp: number,
  W: number, H: number, mox: number, moy: number, scene: SceneData
) {
  const cx = W / 2; const cy = H / 2
  const mx = mox * 18; const my = moy * 12
  const rotProgress = Math.min(1, lp * 2.8)
  const candleProgress = Math.max(0, (lp - 0.35) / 0.65)
  const smokeProgress = Math.max(0, (lp - 0.65) / 0.35)
  const warmth = candleProgress * 0.4

  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, `hsl(${220 + warmth * 30},${20 + warmth * 20}%,${4 + warmth * 6}%)`)
  sky.addColorStop(1, `hsl(${215 + warmth * 20},15%,${5 + warmth * 5}%)`)
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

  const starFade = Math.max(0, 1 - candleProgress * 1.5)
  if (starFade > 0) {
    for (const star of scene.stars) {
      const sb = Math.sin(t * 0.001 * star.twinkleSpeed + star.phase) * 0.4 + 0.6
      ctx.beginPath()
      ctx.arc((star.x * W + mx * 0.2) % W, star.y * H * 0.65, star.size * sb, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200,210,240,${sb * 0.6 * starFade})`; ctx.fill()
    }
  }

  drawMountainRange(ctx, W, H, mx * 0.4, my * 0.25,
    [0.04,0.62,0.16,0.53,0.27,0.59,0.40,0.49,0.52,0.46,0.62,0.52,0.76,0.55,0.90,0.48,1.06,0.65],
    `hsl(${215 + warmth * 15},${25 + warmth * 15}%,${8 + warmth * 8}%)`, 0.76)

  const peakX = cx + mx * 0.8; const peakY = H * 0.42 + my * 0.5
  ctx.beginPath()
  ctx.moveTo(peakX - 280 + mx * 0.5, H * 0.76 + my * 0.3); ctx.lineTo(peakX, peakY)
  ctx.lineTo(peakX + 280 + mx * 0.5, H * 0.76 + my * 0.3); ctx.lineTo(peakX + 340, H); ctx.lineTo(peakX - 340, H)
  ctx.closePath()
  const pg = ctx.createLinearGradient(peakX, peakY, peakX, H * 0.76)
  const warmR = Math.floor(220 + warmth * 35); const warmG = Math.floor(190 + warmth * 20)
  pg.addColorStop(0, `rgb(${warmR},${warmG},185)`); pg.addColorStop(0.15, `rgb(${warmR - 30},${warmG - 20},170)`)
  pg.addColorStop(0.4, `hsl(${230 + warmth * 15},${30 + warmth * 20}%,${16 + warmth * 8}%)`)
  pg.addColorStop(1, `hsl(${228 + warmth * 15},28%,13%)`)
  ctx.fillStyle = pg; ctx.fill()

  if (candleProgress > 0) {
    const figX = peakX; const figY = peakY - 42
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    const warmR2 = candleProgress * 300
    const warmGrad = ctx.createRadialGradient(figX, figY - 5, 0, figX, figY - 5, warmR2)
    warmGrad.addColorStop(0, `rgba(255,170,50,${0.18 * candleProgress})`)
    warmGrad.addColorStop(0.4, `rgba(240,120,30,${0.06 * candleProgress})`)
    warmGrad.addColorStop(1, 'rgba(200,80,20,0)')
    ctx.fillStyle = warmGrad; ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'; ctx.restore()
  }

  const figX = peakX; const figY = peakY - 42
  const scaleX = Math.cos(rotProgress * Math.PI)
  const breath = Math.sin(t * 0.0009) * 0.022
  const figScale = (0.8 + lp * 0.2) * (W / 1440)

  ctx.save()
  ctx.translate(figX, figY)
  ctx.scale(scaleX * figScale, figScale * (1 + breath))
  if (rotProgress < 0.5) {
    drawFigureLocalBack(ctx, t, candleProgress)
  } else {
    drawFigureFacing(ctx, t, rotProgress, candleProgress)
  }
  ctx.restore()

  for (const s of scene.snow) {
    ctx.beginPath(); ctx.arc(s.x * W + mx * 0.15, s.y * H + my * 0.1, s.size * 0.7, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(230,236,242,${s.alpha * 0.35})`; ctx.fill()
  }

  if (smokeProgress > 0 && candleProgress > 0) {
    const flameTopY = figY - 60 * figScale
    updateSmoke(scene.smoke, t, figX, flameTopY, smokeProgress, cx)
    ctx.save(); ctx.globalCompositeOperation = 'screen'
    for (const sp of scene.smoke) {
      if (!sp.active) continue
      const sGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.size)
      sGrad.addColorStop(0, `hsla(${sp.hue},30%,85%,${sp.alpha * smokeProgress})`)
      sGrad.addColorStop(1, `hsla(${sp.hue},20%,70%,0)`)
      ctx.fillStyle = sGrad
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.restore()
  }

  if (smokeProgress > 0.55) {
    const pp = Math.pow((smokeProgress - 0.55) / 0.45, 0.6)
    const portalY = H * 0.18; const pr = pp * Math.max(W, H) * 1.6
    ctx.save(); ctx.globalCompositeOperation = 'lighter'
    const pGrad = ctx.createRadialGradient(cx, portalY, pr * 0.05, cx, portalY, pr)
    pGrad.addColorStop(0, `rgba(255,252,248,${0.75 * pp})`)
    pGrad.addColorStop(0.2, `rgba(250,240,225,${0.5 * pp})`)
    pGrad.addColorStop(0.6, `rgba(240,230,210,${0.15 * pp})`)
    pGrad.addColorStop(1, 'rgba(240,230,210,0)')
    ctx.fillStyle = pGrad; ctx.beginPath(); ctx.arc(cx, portalY, pr, 0, Math.PI * 2); ctx.fill()
    ctx.globalCompositeOperation = 'source-over'; ctx.restore()
    ctx.beginPath(); ctx.arc(cx, portalY, pr * 0.06, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255,250,240,${0.6 * pp})`; ctx.lineWidth = 2 * pp; ctx.stroke()
  }

  if (smokeProgress > 0.82) {
    const wash = (smokeProgress - 0.82) / 0.18
    ctx.fillStyle = `rgba(252,248,242,${Math.pow(wash, 0.5)})`; ctx.fillRect(0, 0, W, H)
  }
}

// ─────────────────────────────────────────────
// DRAW HELPERS
// ─────────────────────────────────────────────

function drawMountainHaze(ctx: CanvasRenderingContext2D, cx: number, cy: number, W: number, H: number, mx: number, my: number) {
  const hazeGrad = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.75)
  hazeGrad.addColorStop(0, 'rgba(20,25,50,0)'); hazeGrad.addColorStop(0.5, 'rgba(18,22,45,0.12)')
  hazeGrad.addColorStop(1, 'rgba(15,18,40,0)')
  ctx.fillStyle = hazeGrad; ctx.fillRect(0, H * 0.3, W, H * 0.45)
}

function drawMountainRange(ctx: CanvasRenderingContext2D, W: number, H: number, mx: number, my: number, peaks: number[], color: string, baseY: number) {
  ctx.beginPath(); ctx.moveTo(-60, H * baseY)
  for (let i = 0; i < peaks.length; i += 2) ctx.lineTo(W * peaks[i] + mx, H * peaks[i + 1] + my)
  ctx.lineTo(W + 60, H); ctx.lineTo(-60, H); ctx.closePath()
  ctx.fillStyle = color; ctx.fill()
}

function drawFigureBack(ctx: CanvasRenderingContext2D, t: number, x: number, y: number, scale: number, showAura: boolean) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  if (showAura) {
    const aGrad = ctx.createRadialGradient(0, -25, 8, 0, -25, 90)
    aGrad.addColorStop(0, `rgba(200,168,124,${0.18 + Math.sin(t * 0.002) * 0.05})`)
    aGrad.addColorStop(0.6, 'rgba(127,168,130,0.06)'); aGrad.addColorStop(1, 'rgba(127,168,130,0)')
    ctx.fillStyle = aGrad; ctx.beginPath(); ctx.arc(0, -25, 90, 0, Math.PI * 2); ctx.fill()
  }

  ctx.beginPath(); ctx.ellipse(0, 14, 38, 13, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#1e1e2e'; ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-19, 10); ctx.quadraticCurveTo(-24, -12, -16, -32)
  ctx.quadraticCurveTo(0, -43, 16, -32); ctx.quadraticCurveTo(24, -12, 19, 10)
  ctx.closePath(); ctx.fillStyle = '#252535'; ctx.fill()
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, 8)
  ctx.strokeStyle = 'rgba(127,168,130,0.12)'; ctx.lineWidth = 1; ctx.stroke()
  ctx.beginPath(); ctx.arc(0, -44, 12, 0, Math.PI * 2); ctx.fillStyle = '#2e2e40'; ctx.fill()
  ctx.beginPath(); ctx.ellipse(0, -58, 5, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#1a1a2a'; ctx.fill()
  ctx.lineCap = 'round'; ctx.strokeStyle = '#252535'; ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(-17, -16); ctx.quadraticCurveTo(-34, -2, -32, 8); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(17, -16); ctx.quadraticCurveTo(34, -2, 32, 8); ctx.stroke()
  ctx.restore()
}

function drawFigureLocalBack(ctx: CanvasRenderingContext2D, t: number, candleProgress: number) {
  ctx.beginPath(); ctx.ellipse(0, 14, 38, 13, 0, 0, Math.PI * 2); ctx.fillStyle = '#1e1e2e'; ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-19, 10); ctx.quadraticCurveTo(-24, -12, -16, -32)
  ctx.quadraticCurveTo(0, -43, 16, -32); ctx.quadraticCurveTo(24, -12, 19, 10)
  ctx.closePath(); ctx.fillStyle = '#252535'; ctx.fill()
  ctx.beginPath(); ctx.arc(0, -44, 12, 0, Math.PI * 2); ctx.fillStyle = '#2e2e40'; ctx.fill()
  ctx.beginPath(); ctx.ellipse(0, -58, 5, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#1a1a2a'; ctx.fill()
  ctx.lineCap = 'round'; ctx.strokeStyle = '#252535'; ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(-17, -16); ctx.quadraticCurveTo(-34, -2, -32, 8); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(17, -16); ctx.quadraticCurveTo(34, -2, 32, 8); ctx.stroke()
  if (candleProgress > 0) drawCandleInHands(ctx, t, candleProgress, 0)
}

function drawFigureFacing(ctx: CanvasRenderingContext2D, t: number, rotProgress: number, candleProgress: number) {
  const fa = Math.min(1, (rotProgress - 0.5) * 2.2)
  const aGrad = ctx.createRadialGradient(0, -25, 8, 0, -25, 100)
  aGrad.addColorStop(0, `rgba(200,168,124,${0.15 * fa + Math.sin(t * 0.0015) * 0.03})`)
  aGrad.addColorStop(0.5, `rgba(127,168,130,${0.06 * fa})`); aGrad.addColorStop(1, 'rgba(127,168,130,0)')
  ctx.fillStyle = aGrad; ctx.beginPath(); ctx.arc(0, -25, 100, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(0, 14, 38, 13, 0, 0, Math.PI * 2); ctx.fillStyle = '#1e1e2e'; ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-19, 10); ctx.quadraticCurveTo(-24, -12, -16, -32)
  ctx.quadraticCurveTo(0, -43, 16, -32); ctx.quadraticCurveTo(24, -12, 19, 10)
  ctx.closePath(); ctx.fillStyle = '#2a2840'; ctx.fill()
  const skinTone = `rgba(${55 + fa * 30},${48 + fa * 25},${70 + fa * 10},1)`
  ctx.beginPath(); ctx.arc(0, -44, 12, 0, Math.PI * 2); ctx.fillStyle = skinTone; ctx.fill()
  if (fa > 0.1) {
    ctx.save(); ctx.globalAlpha = fa
    ctx.strokeStyle = 'rgba(30,25,45,0.8)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(-4, -45, 3.5, Math.PI * 0.1, Math.PI * 0.9, false); ctx.stroke()
    ctx.beginPath(); ctx.arc(4, -45, 3.5, Math.PI * 0.1, Math.PI * 0.9, false); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, -40, 5, 0.08 * Math.PI, 0.92 * Math.PI, false)
    ctx.strokeStyle = 'rgba(40,35,55,0.5)'; ctx.lineWidth = 0.9; ctx.stroke()
    ctx.restore()
    const bindiFade = fa * (Math.sin(t * 0.0025) * 0.35 + 0.65)
    const bGrad = ctx.createRadialGradient(0, -49, 0, 0, -49, 7)
    bGrad.addColorStop(0, `rgba(201,169,110,${0.9 * bindiFade})`)
    bGrad.addColorStop(0.5, `rgba(180,140,80,${0.5 * bindiFade})`); bGrad.addColorStop(1, 'rgba(180,140,80,0)')
    ctx.fillStyle = bGrad; ctx.beginPath(); ctx.arc(0, -49, 7, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(0, -49, 1.8, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(220,180,120,${0.95 * bindiFade})`; ctx.fill()
  }
  ctx.beginPath(); ctx.ellipse(0, -58, 5, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#1a1a2a'; ctx.fill()
  const armDrop = candleProgress * 6
  ctx.lineCap = 'round'; ctx.strokeStyle = '#2a2840'; ctx.lineWidth = 7
  ctx.beginPath(); ctx.moveTo(-17, -16); ctx.quadraticCurveTo(-33, -3 + armDrop, -30, 6 + armDrop); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(17, -16); ctx.quadraticCurveTo(33, -3 + armDrop, 30, 6 + armDrop); ctx.stroke()
  if (candleProgress > 0) drawCandleInHands(ctx, t, candleProgress, armDrop)
}

function drawCandleInHands(ctx: CanvasRenderingContext2D, t: number, candleProgress: number, armDrop: number) {
  const ca = Math.min(1, candleProgress * 3)
  const candleY = 5 + armDrop
  ctx.fillStyle = `rgba(235,225,205,${ca})`
  ctx.beginPath(); ctx.rect(-3.5, candleY - 2, 7, 20); ctx.fill()
  ctx.strokeStyle = `rgba(50,40,35,${ca})`; ctx.lineWidth = 1; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, candleY - 2); ctx.lineTo(0, candleY - 6); ctx.stroke()
  const ff = Math.sin(t * 0.009) * 1.8 + Math.sin(t * 0.022) * 1.2 + Math.sin(t * 0.037) * 0.8
  const fh = 8 + candleProgress * 10 + Math.sin(t * 0.005) * 2
  ctx.beginPath()
  ctx.moveTo(-3.5 + ff * 0.25, candleY - 6)
  ctx.quadraticCurveTo(-4.5 + ff * 0.4, candleY - 6 - fh * 0.55, ff * 0.25, candleY - 6 - fh)
  ctx.quadraticCurveTo(4.5 + ff * 0.4, candleY - 6 - fh * 0.55, 3.5 + ff * 0.25, candleY - 6)
  ctx.closePath(); ctx.fillStyle = `rgba(255,140,30,${0.65 * ca})`; ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-2 + ff * 0.15, candleY - 6)
  ctx.quadraticCurveTo(-2.5 + ff * 0.25, candleY - 6 - fh * 0.45, ff * 0.12, candleY - 6 - fh * 0.75)
  ctx.quadraticCurveTo(2.5 + ff * 0.25, candleY - 6 - fh * 0.45, 2 + ff * 0.15, candleY - 6)
  ctx.closePath(); ctx.fillStyle = `rgba(255,245,160,${0.85 * ca})`; ctx.fill()
  ctx.save(); ctx.globalCompositeOperation = 'lighter'
  const fGrad = ctx.createRadialGradient(ff * 0.25, candleY - 6 - fh * 0.5, 0, ff * 0.1, candleY - 6 - fh * 0.5, 40)
  fGrad.addColorStop(0, `rgba(255,210,80,${0.35 * ca})`)
  fGrad.addColorStop(0.5, `rgba(255,150,40,${0.12 * ca})`); fGrad.addColorStop(1, 'rgba(255,100,20,0)')
  ctx.fillStyle = fGrad; ctx.beginPath(); ctx.arc(ff * 0.25, candleY - 6 - fh * 0.5, 40, 0, Math.PI * 2); ctx.fill()
  ctx.globalCompositeOperation = 'source-over'; ctx.restore()
}

function updateSmoke(smoke: SmokeParticle[], t: number, figX: number, flameY: number, smokeProgress: number, portalX: number) {
  for (const sp of smoke) {
    if (!sp.active && Math.random() < 0.18 * smokeProgress) {
      sp.active = true; sp.x = figX + (Math.random() - 0.5) * 5; sp.y = flameY
      sp.vx = (Math.random() - 0.5) * 0.7; sp.vy = -1.2 - Math.random() * 1.8
      sp.size = 2; sp.life = 0; sp.alpha = 0.45; sp.hue = 200 + Math.random() * 40
    }
    if (sp.active) {
      sp.life++
      const curl = Math.sin(sp.x * 0.015 + t * 0.003 + sp.seed) * 0.8 + Math.cos(sp.y * 0.012 + t * 0.0025) * 0.5
      sp.vx += curl * 0.06; sp.vy *= 0.994; sp.vx *= 0.986
      if (smokeProgress > 0.45) {
        const pull = (smokeProgress - 0.45) / 0.55
        const toX = portalX - sp.x; const toY = flameY - 120 - sp.y
        const d = Math.sqrt(toX * toX + toY * toY)
        if (d > 1) { sp.vx += (toX / d) * 0.06 * pull; sp.vy += (toY / d) * 0.06 * pull }
      }
      sp.x += sp.vx; sp.y += sp.vy; sp.size += 0.12
      sp.alpha = Math.max(0, 0.45 * (1 - sp.life / sp.maxLife))
      if (sp.life > sp.maxLife) sp.active = false
    }
  }
}
