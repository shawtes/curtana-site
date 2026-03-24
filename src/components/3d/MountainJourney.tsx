'use client'

/**
 * MountainJourney — 5-Act cinematic 2D canvas scroll experience.
 *
 * Act 00 (0→0.15):   THE SURFACE — still water, meditator back-facing, Milky Way sky
 * T  00→01 (0.15→0.28): SUBMERSION — camera dives through water membrane
 * Act 01 (0.28→0.45): THE DEEP — bioluminescent void, figure tumbles
 * T  01→02 (0.45→0.48): VOID OPENS — particles slow, geometry wakes
 * Act 02 (0.48→0.62): GEOMETRY AWAKENS — torus rings materialize
 * Act 03 (0.62→0.78): FULL HYPERSPACE — warp streaks, figure is the eye of the storm
 * T  03→04 (0.78→0.85): THE TURN — figure rotates to face camera
 * Act 04 (0.85→0.95): THE CANDLE — flame ignites, warm light, smoke rises
 * Act 05 (0.95→1.00): THE PORTAL — smoke spirals, white circle fills screen
 *
 * Architecture: 700vh sticky container, pure 2D canvas, Framer Motion DOM chapters
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:         '#0d0f0e',
  sage:       '#7fa882',
  sand:       '#c8b89a',
  cream:      '#f5f0e8',
  mist:       '#8fb5c4',
  gold:       '#c9a96e',
  underwater: '#0a1f14',
  void_bg:    '#04080a',
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Star        { x: number; y: number; z: number; r: number; twinkle: number; phase: number }
interface MistP       { x: number; y: number; vx: number; vy: number; r: number; alpha: number; col: string; life: number; maxLife: number }
interface BioP        { x: number; y: number; vx: number; vy: number; r: number; alpha: number; col: string; tumble: number; life: number; maxLife: number }
interface SmokeP      { x: number; y: number; vx: number; vy: number; r: number; maxR: number; life: number; maxLife: number; seed: number; alpha: number; active: boolean }
interface AuraRing    { r: number; maxR: number; alpha: number; phase: number; col: string }
interface CursorRipple{ x: number; y: number; r: number; maxR: number; alpha: number; lerp: number }

interface SceneRefs {
  stars:       Star[]
  mist:        MistP[]
  bio:         BioP[]
  smoke:       SmokeP[]
  auraRings:   AuraRing[]
  cursor:      CursorRipple[]
  mouseX:      number
  mouseY:      number
  camX:        number
  camY:        number
  breathPhase: number
  figTumbleX:  number
  figTumbleV:  number
  scrollVel:   number
  lastProgress:number
  navigated:   boolean
  raf:         number
  t:           number
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const lerp   = (a: number, b: number, t: number) => a + (b - a) * t
const clamp  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const inv    = (v: number, lo: number, hi: number) => clamp((v - lo) / (hi - lo), 0, 1)
const ease   = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t

function hexToRgb(hex: string): [number,number,number] {
  const v = parseInt(hex.slice(1), 16)
  return [(v>>16)&255, (v>>8)&255, v&255]
}

function lerpColor(a: [number,number,number], b: [number,number,number], t: number): string {
  return `rgb(${Math.round(lerp(a[0],b[0],t))},${Math.round(lerp(a[1],b[1],t))},${Math.round(lerp(a[2],b[2],t))})`
}

const BG_SURFACE    = hexToRgb('#0d0f0e')
const BG_UNDERWATER = hexToRgb('#021428')
const BG_VOID       = hexToRgb('#04080a')
const BG_WARM       = hexToRgb('#120c04')

// ─────────────────────────────────────────────────────────────────────────────
// INIT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MIST_COLORS = [C.sage, C.sage, C.sand, C.cream, C.mist]

function initStars(count: number): Star[] {
  return Array.from({length: count}, () => ({
    x: Math.random(), y: Math.random(),
    z: Math.random(),
    r: 0.3 + Math.random() * 1.4,
    twinkle: 0.5 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
  }))
}

function initMist(count: number, W: number, H: number): MistP[] {
  return Array.from({length: count}, () => ({
    x: Math.random() * W,
    y: H * 0.2 + Math.random() * H * 0.6,
    vx: (Math.random() - 0.5) * 0.18,
    vy: -(0.12 + Math.random() * 0.28),
    r: 1 + Math.random() * 3.5,
    alpha: 0.08 + Math.random() * 0.28,
    col: MIST_COLORS[Math.floor(Math.random() * MIST_COLORS.length)],
    life: Math.random() * 400,
    maxLife: 280 + Math.random() * 320,
  }))
}

function initBio(count: number, W: number, H: number): BioP[] {
  const cols = [C.sage, C.mist, '#5dcaa5', C.sand]
  return Array.from({length: count}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1 + Math.random() * 3,
    alpha: 0.15 + Math.random() * 0.45,
    col: cols[Math.floor(Math.random() * cols.length)],
    tumble: Math.random() * Math.PI * 2,
    life: Math.random() * 400,
    maxLife: 280 + Math.random() * 320,
  }))
}

function initSmoke(count: number): SmokeP[] {
  return Array.from({length: count}, () => ({
    x: 0, y: 0, vx: 0, vy: 0,
    r: 1, maxR: 4 + Math.random() * 3,
    life: 0, maxLife: 60 + Math.random() * 80,
    seed: Math.random() * 100,
    alpha: 0, active: false,
  }))
}

function initAuraRings(): AuraRing[] {
  const cols = [C.sage, C.sand, C.mist, C.cream]
  return Array.from({length: 4}, (_, i) => ({
    r: 55, maxR: 110 + i * 15,
    alpha: 0,
    phase: i * 0.9,
    col: cols[i],
  }))
}

function initCursorRipples(): CursorRipple[] {
  return [
    { x: 0, y: 0, r: 0, maxR: 0, alpha: 0, lerp: 0.08 },
    { x: 0, y: 0, r: 0, maxR: 0, alpha: 0, lerp: 0.06 },
    { x: 0, y: 0, r: 0, maxR: 0, alpha: 0, lerp: 0.04 },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — STARFIELD
// ─────────────────────────────────────────────────────────────────────────────

function drawStarfield(ctx: CanvasRenderingContext2D, W: number, H: number,
  stars: Star[], t: number, camX: number, camY: number, alpha: number) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  for (const s of stars) {
    const tw = s.twinkle * (0.6 + 0.4 * Math.sin(t * 0.8 + s.phase))
    const brightness = 0.5 + tw * 0.5
    const sx = (s.x * W + camX * 0.2) % W
    const sy = (s.y * H + camY * 0.1) % H
    ctx.beginPath()
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${Math.round(220+brightness*35)},${Math.round(220+brightness*35)},${Math.round(230+brightness*25)},${brightness * 0.9})`
    ctx.fill()
    // milky way glow for larger stars
    if (s.r > 1.0) {
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3)
      g.addColorStop(0, `rgba(200,210,240,${brightness * 0.25})`)
      g.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(sx, sy, s.r * 3, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
    }
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — WATER SURFACE
// ─────────────────────────────────────────────────────────────────────────────

function drawWater(ctx: CanvasRenderingContext2D, W: number, H: number,
  t: number, waterY: number, alpha: number) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  // water body
  const wg = ctx.createLinearGradient(0, waterY, 0, H)
  wg.addColorStop(0, 'rgba(2,20,40,0.95)')
  wg.addColorStop(1, 'rgba(1,10,22,1)')
  ctx.fillStyle = wg
  ctx.fillRect(0, waterY, W, H - waterY)
  // ripple lines
  ctx.strokeStyle = 'rgba(143,181,196,0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i < 6; i++) {
    const wy = waterY + i * 18 + Math.sin(t * 0.4 + i) * 4
    ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(W, wy); ctx.stroke()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — FIGURE (BACK)
// ─────────────────────────────────────────────────────────────────────────────

function drawFigureBack(ctx: CanvasRenderingContext2D, x: number, y: number,
  scale: number, breathPhase: number, alpha: number) {
  if (alpha <= 0) return
  const breath = Math.sin(breathPhase) * 0.012
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.scale(scale * (1 + breath), scale * (1 + breath * 0.5))

  // lotus legs — two curved wings
  ctx.beginPath()
  ctx.ellipse(0, 28, 38, 14, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(30,30,28,0.92)'
  ctx.fill()
  // body torso
  ctx.beginPath()
  ctx.ellipse(0, 0, 14, 22, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#1a1d1b'
  ctx.fill()
  // head
  ctx.beginPath()
  ctx.arc(0, -28, 13, 0, Math.PI * 2)
  ctx.fillStyle = '#1a1d1b'
  ctx.fill()
  // arms
  ctx.strokeStyle = '#1a1d1b'; ctx.lineWidth = 5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-10, 4); ctx.quadraticCurveTo(-26, 18, -20, 28); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(10, 4); ctx.quadraticCurveTo(26, 18, 20, 28); ctx.stroke()
  // spine glow
  const sg = ctx.createLinearGradient(0, -26, 0, 26)
  sg.addColorStop(0, 'rgba(127,168,130,0.0)')
  sg.addColorStop(0.5, 'rgba(127,168,130,0.08)')
  sg.addColorStop(1, 'rgba(127,168,130,0.0)')
  ctx.beginPath(); ctx.rect(-2, -26, 4, 52); ctx.fillStyle = sg; ctx.fill()

  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — FIGURE (FRONT)
// ─────────────────────────────────────────────────────────────────────────────

function drawFigureFront(ctx: CanvasRenderingContext2D, x: number, y: number,
  scale: number, breathPhase: number, alpha: number, candleAlpha: number) {
  if (alpha <= 0) return
  const breath = Math.sin(breathPhase) * 0.012
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.scale(scale * (1 + breath), scale * (1 + breath * 0.5))

  // lotus legs
  ctx.beginPath()
  ctx.ellipse(0, 28, 38, 14, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#1e201d'
  ctx.fill()
  // torso
  ctx.beginPath()
  ctx.ellipse(0, 0, 14, 22, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#1e201d'
  ctx.fill()
  // arms
  ctx.strokeStyle = '#1e201d'; ctx.lineWidth = 5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-10, 4); ctx.quadraticCurveTo(-24, 20, -16, 30); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(10, 4); ctx.quadraticCurveTo(24, 20, 16, 30); ctx.stroke()
  // mudra hands — cupped
  if (candleAlpha < 0.8) {
    ctx.beginPath(); ctx.arc(-13, 30, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#2a2b28'; ctx.fill()
    ctx.beginPath(); ctx.arc(13, 30, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#2a2b28'; ctx.fill()
  } else {
    // hands raised and cupped for candle
    const liftY = (candleAlpha - 0.8) / 0.2 * 18
    ctx.beginPath(); ctx.arc(-10, 30 - liftY, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#2a2b28'; ctx.fill()
    ctx.beginPath(); ctx.arc(10, 30 - liftY, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#2a2b28'; ctx.fill()
  }
  // head
  ctx.beginPath(); ctx.arc(0, -28, 13, 0, Math.PI * 2)
  ctx.fillStyle = '#1e201d'; ctx.fill()
  // face — closed eyes
  ctx.strokeStyle = 'rgba(200,190,170,0.5)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-5, -29); ctx.quadraticCurveTo(-3, -31, -1, -29); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(5, -29); ctx.quadraticCurveTo(3, -31, 1, -29); ctx.stroke()
  // bindi (third eye)
  const bindiBright = 0.5 + 0.5 * Math.sin(breathPhase * 1.1)
  ctx.beginPath(); ctx.arc(0, -34, 2.5 + bindiBright, 0, Math.PI * 2)
  const bg = ctx.createRadialGradient(0, -34, 0, 0, -34, 4)
  bg.addColorStop(0, `rgba(201,169,110,${0.8 + bindiBright * 0.2})`)
  bg.addColorStop(1, 'transparent')
  ctx.fillStyle = bg; ctx.fill()
  // candlelight face glow
  if (candleAlpha > 0) {
    const fg = ctx.createRadialGradient(0, 10, 0, 0, 10, 60)
    fg.addColorStop(0, `rgba(255,180,60,${candleAlpha * 0.18})`)
    fg.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.arc(0, 10, 60, 0, Math.PI * 2)
    ctx.fillStyle = fg; ctx.fill()
  }

  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — WATER REFLECTION OF FIGURE
// ─────────────────────────────────────────────────────────────────────────────

function drawReflection(ctx: CanvasRenderingContext2D, x: number, y: number,
  waterY: number, scale: number, breathPhase: number, t: number, alpha: number) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha * 0.28
  ctx.translate(x, waterY + (waterY - y))
  ctx.scale(scale, -scale * (1 + Math.sin(breathPhase) * 0.005))
  // simple rippled reflection — just the silhouette
  const wave = Math.sin(t * 0.6) * 1.5
  ctx.translate(wave, 0)
  ctx.beginPath()
  ctx.ellipse(0, 28, 38, 14, 0, 0, Math.PI * 2)
  ctx.ellipse(0, 0, 14, 22, 0, 0, Math.PI * 2)
  ctx.arc(0, -28, 13, 0, Math.PI * 2)
  ctx.fillStyle = '#7fa882'
  ctx.fill()
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — AURA RINGS
// ─────────────────────────────────────────────────────────────────────────────

function updateAndDrawAuraRings(ctx: CanvasRenderingContext2D, rings: AuraRing[],
  x: number, y: number, t: number, visible: boolean) {
  if (!visible) return
  for (const ring of rings) {
    ring.r += 0.6
    if (ring.r > ring.maxR) { ring.r = 55; ring.alpha = 0.35 }
    ring.alpha *= 0.994
    if (ring.alpha < 0.02) { ring.r = 55; ring.alpha = 0.35 }
    const progress = (ring.r - 55) / (ring.maxR - 55)
    const a = ring.alpha * (1 - progress * 0.7)
    const hex = ring.col.replace('#','')
    const rv = parseInt(hex.slice(0,2),16), gv = parseInt(hex.slice(2,4),16), bv = parseInt(hex.slice(4,6),16)
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = `rgb(${rv},${gv},${bv})`
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(x, y + 28, ring.r, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — CHAKRA DOTS
// ─────────────────────────────────────────────────────────────────────────────

function drawChakraDots(ctx: CanvasRenderingContext2D, x: number, y: number,
  scale: number, t: number, alpha: number) {
  if (alpha <= 0) return
  const CHAKRA_Y = [-26, -18, -8, 2, 10, 18, 26]
  const CHAKRA_C = ['#c8b89a','#c9a96e','#c9a96e','#7fa882','#8fb5c4','#8fb5c4','#f5f0e8']
  ctx.save()
  ctx.globalAlpha = alpha
  for (let i = 0; i < CHAKRA_Y.length; i++) {
    const pulse = 0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.1 + i * 0.7))
    const cy = y + CHAKRA_Y[i] * scale
    ctx.beginPath(); ctx.arc(x, cy, 2.5 * scale * pulse, 0, Math.PI * 2)
    const g = ctx.createRadialGradient(x, cy, 0, x, cy, 5 * scale)
    g.addColorStop(0, CHAKRA_C[i]); g.addColorStop(1, 'transparent')
    ctx.fillStyle = g; ctx.fill()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — CROWN RAYS
// ─────────────────────────────────────────────────────────────────────────────

function drawCrownRays(ctx: CanvasRenderingContext2D, x: number, y: number,
  headY: number, t: number, breathPhase: number, alpha: number) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha * (0.08 + 0.12 * (0.5 + 0.5 * Math.sin(breathPhase)))
  ctx.strokeStyle = C.cream
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI * 0.5
    const len = 18 + Math.sin(t * 0.7 + i * 0.5) * 6
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(angle) * 14, headY + Math.sin(angle) * 14)
    ctx.lineTo(x + Math.cos(angle) * (14 + len), headY + Math.sin(angle) * (14 + len))
    ctx.stroke()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — MIST PARTICLES
// ─────────────────────────────────────────────────────────────────────────────

function updateAndDrawMist(ctx: CanvasRenderingContext2D, particles: (MistP | BioP)[],
  W: number, H: number, breathPhase: number, alpha: number, bioMode: boolean) {
  if (alpha <= 0) return
  ctx.save()
  const breathMod = 1 + Math.sin(breathPhase) * 0.28

  for (const p of particles) {
    p.life++
    if (p.life > p.maxLife) {
      p.x = Math.random() * W
      p.y = bioMode ? Math.random() * H : H * 0.3 + Math.random() * H * 0.5
      p.life = 0
      p.alpha = 0.08 + Math.random() * 0.28
      if (bioMode) {
        p.vx = (Math.random() - 0.5) * 0.4
        p.vy = (Math.random() - 0.5) * 0.4
      }
    }
    p.x += p.vx * breathMod + (bioMode ? Math.sin(p.life * 0.04) * 0.2 : 0)
    p.vy += bioMode ? 0 : -0.0008
    p.y += p.vy * breathMod
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
    if (!bioMode && p.y < -10) { p.y = H * 0.8; p.x = Math.random() * W }

    const prog = p.life / p.maxLife
    const fade = prog < 0.12 ? prog / 0.12 : prog > 0.8 ? (1 - prog) / 0.2 : 1
    ctx.globalAlpha = p.alpha * fade * alpha
    const col = bioMode
      ? p.col.replace('#','')
      : p.col.replace('#','')
    const rv = parseInt(col.slice(0,2),16), gv = parseInt(col.slice(2,4),16), bv = parseInt(col.slice(4,6),16)

    if (bioMode) {
      // bioluminescent glow
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
      g.addColorStop(0, `rgba(${rv},${gv},${bv},1)`)
      g.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgb(${rv},${gv},${bv})`
      ctx.fill()
    }
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — CAUSTIC LIGHT (underwater)
// ─────────────────────────────────────────────────────────────────────────────

function drawCaustics(ctx: CanvasRenderingContext2D, W: number, H: number,
  t: number, alpha: number) {
  if (alpha <= 0) return
  ctx.save()
  const patches = [
    { x: W * 0.3, y: H * 0.25, r: 120 },
    { x: W * 0.7, y: H * 0.35, r: 90 },
    { x: W * 0.5, y: H * 0.6,  r: 100 },
  ]
  for (let i = 0; i < patches.length; i++) {
    const p = patches[i]
    const dx = Math.sin(t * 0.15 + i * 1.3) * 40
    const dy = Math.cos(t * 0.12 + i * 0.9) * 30
    const g = ctx.createRadialGradient(p.x + dx, p.y + dy, 0, p.x + dx, p.y + dy, p.r)
    g.addColorStop(0, `rgba(143,181,196,${alpha * 0.07})`)
    g.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.arc(p.x + dx, p.y + dy, p.r, 0, Math.PI * 2)
    ctx.fillStyle = g; ctx.fill()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — TORUS RINGS (2D ellipses with tilt)
// ─────────────────────────────────────────────────────────────────────────────

function drawTorusRings(ctx: CanvasRenderingContext2D, cx: number, cy: number,
  t: number, alpha: number) {
  if (alpha <= 0) return
  const rings = [
    { rx: 160, ry: 80,  tilt: 0.3,  speed: 0.0008, col: C.sage,  lw: 2.0 },
    { rx: 115, ry: 58,  tilt: -0.6, speed: -0.0012, col: C.sand,  lw: 1.5 },
    { rx: 70,  ry: 35,  tilt: 0.9,  speed: 0.0018, col: C.mist,  lw: 1.2 },
  ]
  ctx.save()
  ctx.globalAlpha = alpha
  for (const ring of rings) {
    const rot = t * ring.speed * 1000
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(ring.tilt + rot)
    ctx.strokeStyle = ring.col
    ctx.lineWidth = ring.lw
    ctx.shadowBlur = 8
    ctx.shadowColor = ring.col
    ctx.beginPath()
    ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — WARP STREAKS
// ─────────────────────────────────────────────────────────────────────────────

interface WarpStreak { angle: number; dist: number; speed: number; col: string; phase: number }
let warpStreaks: WarpStreak[] = []

function initWarpStreaks(count: number): WarpStreak[] {
  const cols = [C.sage, C.sage, C.gold, C.cream, C.mist]
  return Array.from({length: count}, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 380,
    speed: 1.2 + Math.random() * 3.3,
    col: cols[Math.floor(Math.random() * cols.length)],
    phase: Math.random() * Math.PI * 2,
  }))
}

function drawWarpStreaks(ctx: CanvasRenderingContext2D, cx: number, cy: number,
  W: number, t: number, streakProgress: number, alpha: number, streaks: WarpStreak[]) {
  if (alpha <= 0 || streakProgress <= 0) return
  const len = (15 + streakProgress * 120) * alpha
  ctx.save()
  ctx.globalAlpha = 0.7 * alpha
  for (const s of streaks) {
    const angle = s.angle + t * s.speed * 0.002
    const d = s.dist * 0.3 + s.dist * 0.7 * streakProgress
    const x1 = cx + Math.cos(angle) * d
    const y1 = cy + Math.sin(angle) * d * 0.55   // Y compressed for perspective oval
    const x2 = cx + Math.cos(angle) * (d + len)
    const y2 = cy + Math.sin(angle) * (d + len) * 0.55
    const g = ctx.createLinearGradient(x1, y1, x2, y2)
    g.addColorStop(0, 'transparent')
    g.addColorStop(1, s.col)
    ctx.strokeStyle = g
    ctx.lineWidth = 0.8 + streakProgress * 0.6
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — CANDLE + FLAME
// ─────────────────────────────────────────────────────────────────────────────

function drawCandle(ctx: CanvasRenderingContext2D, cx: number, cy: number,
  alpha: number) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  // candle body
  ctx.fillStyle = '#e8dfc8'
  ctx.beginPath()
  ctx.rect(cx - 4, cy - 12, 8, 16)
  ctx.fill()
  // wick
  ctx.strokeStyle = '#3a2810'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy - 16); ctx.stroke()
  ctx.restore()
}

function drawFlame(ctx: CanvasRenderingContext2D, cx: number, cy: number,
  t: number, progress: number) {
  if (progress <= 0) return
  const flicker1 = Math.sin(t * 8.3 + 1.1) * 3
  const flicker2 = Math.sin(t * 11.7 + 0.4) * 2
  const h = 14 * progress
  const w = 6 * progress
  ctx.save()
  ctx.globalAlpha = progress
  // outer flame
  const og = ctx.createRadialGradient(cx + flicker2, cy - h * 0.6, 0, cx, cy, h + 10)
  og.addColorStop(0, 'rgba(255,220,80,0.9)')
  og.addColorStop(0.4, 'rgba(255,140,40,0.6)')
  og.addColorStop(1, 'transparent')
  ctx.beginPath()
  ctx.moveTo(cx - w, cy)
  ctx.quadraticCurveTo(cx - w * 1.2 + flicker1, cy - h * 0.5, cx + flicker2 * 0.5, cy - h)
  ctx.quadraticCurveTo(cx + w * 1.2 - flicker1, cy - h * 0.5, cx + w, cy)
  ctx.closePath()
  ctx.fillStyle = og; ctx.fill()
  // inner bright core
  const ig = ctx.createRadialGradient(cx, cy - h * 0.3, 0, cx, cy - h * 0.3, h * 0.4)
  ig.addColorStop(0, 'rgba(255,255,200,1)')
  ig.addColorStop(1, 'transparent')
  ctx.beginPath(); ctx.arc(cx, cy - h * 0.3, h * 0.4, 0, Math.PI * 2)
  ctx.fillStyle = ig; ctx.fill()
  // warm radial light on scene
  const wg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 280 * progress)
  wg.addColorStop(0, `rgba(255,180,60,${0.18 * progress})`)
  wg.addColorStop(1, 'transparent')
  ctx.beginPath(); ctx.arc(cx, cy, 280, 0, Math.PI * 2)
  ctx.fillStyle = wg; ctx.fill()
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — SMOKE PARTICLES
// ─────────────────────────────────────────────────────────────────────────────

function updateAndDrawSmoke(ctx: CanvasRenderingContext2D, particles: SmokeP[],
  originX: number, originY: number, t: number, alpha: number, vortexProgress: number) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha

  // spawn
  const freeSlot = particles.find(p => !p.active)
  if (freeSlot && Math.random() < 0.4) {
    freeSlot.active = true; freeSlot.x = originX + (Math.random()-0.5)*4
    freeSlot.y = originY; freeSlot.vx = (Math.random()-0.5)*0.3; freeSlot.vy = -0.8 - Math.random()*0.5
    freeSlot.r = 1; freeSlot.life = 0; freeSlot.alpha = 0.6; freeSlot.seed = Math.random()*100
  }

  const vortexX = originX
  const vortexY = originY - 200  // vortex center above the flame

  for (const p of particles) {
    if (!p.active) continue
    p.life++
    if (p.life > p.maxLife) { p.active = false; continue }
    const prog = p.life / p.maxLife

    if (vortexProgress > 0) {
      // spiral inward to vortex center
      const dx = vortexX - p.x, dy = vortexY - p.y
      const dist = Math.sqrt(dx*dx + dy*dy)
      const pull = vortexProgress * 0.06
      p.vx += dx / (dist + 1) * pull - p.y * 0.003 * vortexProgress
      p.vy += dy / (dist + 1) * pull + p.x * 0.003 * vortexProgress
    } else {
      p.vx += Math.sin(t * 2.1 + p.seed) * 0.04
    }
    p.x += p.vx; p.y += p.vy
    p.r = lerp(1, p.maxR, prog)
    p.alpha = 0.6 * (prog < 0.2 ? prog / 0.2 : (1 - prog))

    const a = p.alpha * alpha
    if (a <= 0) continue
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
    g.addColorStop(0, `rgba(240,230,210,${a})`)
    g.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = g; ctx.fill()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — PORTAL WHITE OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

function drawPortal(ctx: CanvasRenderingContext2D, W: number, H: number,
  cx: number, cy: number, progress: number) {
  if (progress <= 0) return
  const maxR = Math.hypot(W, H)
  const r = maxR * ease(progress)
  ctx.save()
  const g = ctx.createRadialGradient(cx, cy * 0.15, 0, cx, cy * 0.15, r)
  g.addColorStop(0, `rgba(255,255,255,${Math.min(1, progress * 1.4)})`)
  g.addColorStop(0.6, `rgba(240,235,225,${Math.min(1, progress * 1.2)})`)
  g.addColorStop(1, 'transparent')
  ctx.beginPath(); ctx.arc(cx, cy * 0.15, r, 0, Math.PI * 2)
  ctx.fillStyle = g; ctx.fill()
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

interface Chapter {
  id: string; text: string; sub?: string
  from: number; to: number
  align: 'left' | 'center' | 'right'
  size: 'hero' | 'xl' | 'large' | 'medium'
  condition?: (p: number) => boolean
}

const CHAPTERS: Chapter[] = [
  { id:'ch0', text:'Move with intention.', sub:'Yoga · Breathwork · Wellness Coaching', from:0, to:0.14, align:'left', size:'hero' },
  { id:'ch1', text:'Let go.', from:0.17, to:0.28, align:'center', size:'large' },
  { id:'ch2', text:'Deeper.', from:0.31, to:0.44, align:'right', size:'medium' },
  { id:'ch3', text:'The pattern beneath everything.', from:0.50, to:0.61, align:'left', size:'medium' },
  { id:'ch4', text:'She is the eye of the storm.', from:0.64, to:0.77, align:'center', size:'large' },
  { id:'ch5', text:'She sees you.', from:0.84, to:0.92, align:'center', size:'xl', condition:(p)=>p>0.845 },
  { id:'ch6', text:'A light in the dark.', from:0.88, to:0.93, align:'center', size:'medium' },
  { id:'ch7', text:'Follow the smoke.', from:0.93, to:1.0, align:'center', size:'large' },
]

const SIZE_MAP: Record<string, string> = {
  hero:   'clamp(48px,7vw,80px)',
  xl:     'clamp(44px,6vw,72px)',
  large:  'clamp(36px,5vw,60px)',
  medium: 'clamp(28px,4vw,48px)',
}

const ALIGN_STYLE: Record<string, React.CSSProperties> = {
  left:   { left: 'clamp(32px,5vw,80px)', top: '50%', transform: 'translateY(-50%)' },
  center: { left: '50%', top: '50%', transform: 'translate(-50%,-50%)' },
  right:  { right: 'clamp(32px,5vw,80px)', top: '50%', transform: 'translateY(-50%)' },
}

function ChapterOverlay({ progress }: { progress: number }) {
  const visible = CHAPTERS.filter(ch => {
    if (progress < ch.from - 0.02 || progress > ch.to + 0.02) return false
    if (ch.condition && !ch.condition(progress)) return false
    return true
  })

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:10 }}>
      <AnimatePresence>
        {visible.map(ch => (
          <motion.div
            key={ch.id}
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }}
            transition={{ duration:1.2, ease:[0.16,1,0.3,1] }}
            style={{
              position: 'absolute',
              ...ALIGN_STYLE[ch.align],
              maxWidth: ch.align === 'center' ? '80vw' : 'min(560px,45vw)',
              textAlign: ch.align,
            }}
          >
            <p style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontStyle:'italic', fontWeight:300,
              fontSize: SIZE_MAP[ch.size],
              color: '#f5f0e8',
              letterSpacing:'-1px', lineHeight:1.1, margin:0,
              textShadow:'0 2px 40px rgba(0,0,0,0.8)',
            }}>
              {ch.text}
            </p>
            {ch.sub && (
              <p style={{
                fontFamily:'var(--font-body,sans-serif)',
                fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase',
                color:'rgba(127,168,130,0.8)', marginTop:16,
              }}>
                {ch.sub}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL HINT
// ─────────────────────────────────────────────────────────────────────────────

function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration:0.8 }}
      style={{
        position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)',
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
        pointerEvents:'none', zIndex:10,
      }}
    >
      <span style={{
        fontFamily:'var(--font-body,sans-serif)', fontSize:'10px',
        letterSpacing:'3px', textTransform:'uppercase', color:'rgba(127,168,130,0.7)',
      }}>
        scroll to explore
      </span>
      <div style={{
        width:1, height:32, background:'rgba(127,168,130,0.5)',
        animation:'scrollPulse 2s ease-in-out infinite',
      }}/>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS RING (SVG)
// ─────────────────────────────────────────────────────────────────────────────

function ProgressRing({ progress }: { progress: number }) {
  const r = 18, circ = 2 * Math.PI * r
  const dash = circ * progress
  return (
    <div style={{
      position:'absolute', bottom:32, right:32, zIndex:12,
      opacity: progress > 0.01 ? 1 : 0,
      transition:'opacity 600ms ease',
    }}>
      <svg width={44} height={44} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(127,168,130,0.15)" strokeWidth={1.5}/>
        <circle cx={22} cy={22} r={r} fill="none" stroke="#7fa882" strokeWidth={1.5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 200ms ease' }}/>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BREATHE BADGE
// ─────────────────────────────────────────────────────────────────────────────

function BreatheBadge({ visible }: { visible: boolean }) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration:1.0 }}
      style={{
        position:'absolute', top:28, right:32, zIndex:12,
        display:'flex', alignItems:'center', gap:6,
        background:'rgba(13,15,14,0.55)',
        backdropFilter:'blur(12px)',
        border:'1px solid rgba(127,168,130,0.2)',
        borderRadius:100, padding:'6px 14px',
        pointerEvents:'none',
      }}
    >
      <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--sage,#7fa882)', animation:'breathePulse 5.5s ease-in-out infinite' }}/>
      <span style={{
        fontFamily:'var(--font-body,sans-serif)', fontSize:'10px',
        letterSpacing:'2px', textTransform:'uppercase', color:'rgba(200,220,200,0.7)',
      }}>
        breathe slowly
      </span>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR RIPPLES
// ─────────────────────────────────────────────────────────────────────────────

function drawCursorRipples(ctx: CanvasRenderingContext2D, ripples: CursorRipple[],
  mouseX: number, mouseY: number, alpha: number) {
  if (alpha <= 0) return
  for (let i = 0; i < ripples.length; i++) {
    const r = ripples[i]
    r.x += (mouseX - r.x) * r.lerp
    r.y += (mouseY - r.y) * r.lerp
    if (i === 0) { r.r = 20; r.alpha = 0.3 }
    else { r.r = 20 + i * 8; r.alpha = 0.12 - i * 0.03 }
    ctx.save()
    ctx.globalAlpha = r.alpha * alpha
    ctx.strokeStyle = '#7fa882'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function MountainJourney() {
  const { containerRef, progress } = useScrollProgress()
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const scene      = useRef<SceneRefs | null>(null)
  const streaksRef = useRef<WarpStreak[]>([])
  const isMobile   = useRef(typeof window !== 'undefined' && window.innerWidth < 768)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [showBadge, setShowBadge] = useState(false)

  // sync progress to ref (no re-render on every scroll tick)
  useEffect(() => { progressRef.current = progress }, [progress])
  useEffect(() => { if (progress > 0.02) setShowScrollHint(false) }, [progress])
  useEffect(() => { if (progress > 0.05) setShowBadge(true) }, [progress])

  // init scene data once
  const getScene = useCallback((W: number, H: number): SceneRefs => {
    const mobile = isMobile.current
    const mistCount = mobile ? 770 : 2200
    const bioCount  = mobile ? 280 : 800
    const smokeCount = mobile ? 14 : 40
    return {
      stars:       initStars(mobile ? 1200 : 3000),
      mist:        initMist(mistCount, W, H),
      bio:         initBio(bioCount, W, H),
      smoke:       initSmoke(smokeCount),
      auraRings:   initAuraRings(),
      cursor:      initCursorRipples(),
      mouseX:      W / 2, mouseY: H / 2,
      camX:0, camY:0,
      breathPhase: 0,
      figTumbleX:  0, figTumbleV: 0,
      scrollVel:   0,
      lastProgress:0,
      navigated:   false,
      raf:         0,
      t:           0,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H
    streaksRef.current = initWarpStreaks(isMobile.current ? 105 : 300)

    if (!scene.current) scene.current = getScene(W, H)
    const s = scene.current

    function onResize() {
      W = window.innerWidth; H = window.innerHeight
      if (!canvasRef.current) return
      canvasRef.current.width = W; canvasRef.current.height = H
      if (scene.current) {
        scene.current.mist = initMist(isMobile.current ? 770 : 2200, W, H)
        scene.current.bio  = initBio(isMobile.current ? 280 : 800, W, H)
      }
    }
    function onMouse(e: MouseEvent) {
      if (scene.current) { scene.current.mouseX = e.clientX; scene.current.mouseY = e.clientY }
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)

    // ── RAF LOOP ──────────────────────────────────────────────────────────────
    function frame() {
      if (!ctx) return
      s.raf = requestAnimationFrame(frame)
      s.t += 0.016
      const p = progressRef.current

      // scroll velocity
      s.scrollVel = (p - s.lastProgress) * 60
      s.lastProgress = p

      // breath
      s.breathPhase += 0.006

      // camera parallax
      s.camX += (s.mouseX - W * 0.5 - s.camX) * 0.025
      s.camY += (s.mouseY - H * 0.5 - s.camY) * 0.025

      // figure tumble (Act 01)
      if (p > 0.28 && p < 0.45) {
        s.figTumbleV += s.scrollVel * 0.8
        s.figTumbleX += s.figTumbleV
        s.figTumbleV *= 0.96
      } else {
        s.figTumbleX *= 0.95
        s.figTumbleV *= 0.9
      }

      // ── BACKGROUND COLOR ──────────────────────────────────────────────────
      let bgR: [number,number,number]
      if (p < 0.15) {
        bgR = BG_SURFACE
      } else if (p < 0.28) {
        const t2 = inv(p, 0.15, 0.28)
        bgR = [lerp(BG_SURFACE[0],BG_UNDERWATER[0],t2), lerp(BG_SURFACE[1],BG_UNDERWATER[1],t2), lerp(BG_SURFACE[2],BG_UNDERWATER[2],t2)]
      } else if (p < 0.48) {
        const t2 = inv(p, 0.28, 0.48)
        bgR = [lerp(BG_UNDERWATER[0],BG_VOID[0],t2), lerp(BG_UNDERWATER[1],BG_VOID[1],t2), lerp(BG_UNDERWATER[2],BG_VOID[2],t2)]
      } else if (p < 0.85) {
        bgR = BG_VOID
      } else {
        const t2 = inv(p, 0.85, 1.0)
        bgR = [lerp(BG_VOID[0],BG_WARM[0],t2), lerp(BG_VOID[1],BG_WARM[1],t2), lerp(BG_VOID[2],BG_WARM[2],t2)]
      }
      ctx.fillStyle = `rgb(${bgR[0]},${bgR[1]},${bgR[2]})`
      ctx.fillRect(0, 0, W, H)

      const figX = W * 0.5 + s.camX * 0.15
      const figY = H * 0.52
      const figScale = 1.0

      // ── ACT 00 (0→0.15): STILL WATER SURFACE ──────────────────────────────
      const a00 = p < 0.18 ? 1 : (1 - inv(p, 0.18, 0.26))
      if (a00 > 0) {
        drawStarfield(ctx, W, H, s.stars, s.t, s.camX, s.camY, a00)
        const waterY = H * 0.56
        drawWater(ctx, W, H, s.t, waterY, a00)
        drawReflection(ctx, figX, figY, waterY, figScale, s.breathPhase, s.t, a00)
        updateAndDrawAuraRings(ctx, s.auraRings, figX, figY, s.t, true)
        drawChakraDots(ctx, figX, figY, figScale, s.t, a00 * 0.7)
        drawCrownRays(ctx, figX, figY, figY - 28 * figScale, s.t, s.breathPhase, a00 * 0.8)
        drawFigureBack(ctx, figX, figY, figScale, s.breathPhase, a00)
      }

      // ── TRANSITION 00→01 (0.15→0.28): SUBMERSION ──────────────────────────
      if (p > 0.15 && p < 0.32) {
        const subT = inv(p, 0.15, 0.32)
        // caustic shimmer at surface crossing (~0.18)
        if (p > 0.16 && p < 0.22) {
          const flash = 1 - Math.abs(inv(p, 0.16, 0.22) - 0.5) * 2
          ctx.fillStyle = `rgba(143,181,196,${flash * 0.3})`
          ctx.fillRect(0, 0, W, H)
        }
        drawCaustics(ctx, W, H, s.t, subT)
        // figure still visible but fading/receding
        if (p < 0.26) drawFigureBack(ctx, figX, figY, figScale * (1 - inv(p,0.2,0.26)*0.15), s.breathPhase, 1 - inv(p, 0.22, 0.28))
      }

      // ── ACT 01 (0.28→0.45): THE DEEP ──────────────────────────────────────
      const a01 = p > 0.25 && p < 0.48
        ? inv(p, 0.25, 0.32) * (1 - inv(p, 0.44, 0.48))
        : 0
      if (a01 > 0) {
        drawCaustics(ctx, W, H, s.t, a01 * 0.6)
        const tumX = figX + s.figTumbleX * 0.3
        const tumY = figY + Math.sin(s.figTumbleX * 0.05) * 20
        drawFigureBack(ctx, tumX, tumY, figScale * 0.9, s.breathPhase + s.figTumbleX * 0.02, a01)
      }

      // ── BIOLUMINESCENT PARTICLES (acts 00-02) ─────────────────────────────
      const bioAlpha = p > 0.2 ? Math.min(1, inv(p, 0.2, 0.35)) * (1 - inv(p, 0.6, 0.7)) : 0
      updateAndDrawMist(ctx, s.bio, W, H, s.breathPhase, bioAlpha, true)

      // ── MIST PARTICLES (act 00) ────────────────────────────────────────────
      const mistAlpha = p < 0.22 ? (1 - inv(p, 0.14, 0.22)) : 0
      updateAndDrawMist(ctx, s.mist, W, H, s.breathPhase, mistAlpha, false)

      // ── CURSOR RIPPLES (acts 00-01) ────────────────────────────────────────
      const cursorAlpha = p < 0.25 ? (1 - p / 0.25) : 0
      drawCursorRipples(ctx, s.cursor, s.mouseX, s.mouseY, cursorAlpha * 0.8)

      // ── ACT 02 (0.48→0.62): GEOMETRY AWAKENS ──────────────────────────────
      const a02 = p > 0.46 ? inv(p, 0.46, 0.55) * (1 - inv(p, 0.6, 0.66)) : 0
      if (a02 > 0) {
        drawTorusRings(ctx, figX, figY, s.t, a02)
        drawFigureBack(ctx, figX, figY, figScale, s.breathPhase, a02)
        drawChakraDots(ctx, figX, figY, figScale, s.t, a02 * 0.8)
        drawCrownRays(ctx, figX, figY, figY - 28, s.t, s.breathPhase, a02)
      }

      // ── ACT 03 (0.62→0.78): HYPERSPACE ────────────────────────────────────
      const a03 = p > 0.60 ? inv(p, 0.60, 0.68) * (1 - inv(p, 0.76, 0.82)) : 0
      if (a03 > 0) {
        const streakProg = inv(p, 0.62, 0.78)
        drawTorusRings(ctx, figX, figY, s.t, a03 * (1 - streakProg * 0.6))
        drawWarpStreaks(ctx, figX, figY, W, s.t, streakProg, a03, streaksRef.current)
        drawFigureBack(ctx, figX, figY, figScale, s.breathPhase, a03)
        drawChakraDots(ctx, figX, figY, figScale, s.t, a03 * 0.9)
        drawCrownRays(ctx, figX, figY, figY - 28, s.t, s.breathPhase, a03 * 1.2)
      }

      // ── TRANSITION 03→04 (0.78→0.85): THE TURN ────────────────────────────
      const turnP = p > 0.78 ? inv(p, 0.78, 0.86) : 0
      if (turnP > 0) {
        // remaining streaks slow down
        const slowStreak = 1 - turnP
        if (slowStreak > 0) {
          drawWarpStreaks(ctx, figX, figY, W, s.t, slowStreak * 0.4, slowStreak, streaksRef.current)
          drawTorusRings(ctx, figX, figY, s.t, slowStreak * 0.5)
        }

        const rotAngle = turnP * Math.PI
        const cosA = Math.cos(rotAngle)
        ctx.save()
        ctx.translate(figX, figY)
        ctx.scale(cosA, 1)
        ctx.translate(-figX, -figY)
        if (turnP < 0.5) {
          drawFigureBack(ctx, figX, figY, figScale, s.breathPhase, 1)
        } else {
          drawFigureFront(ctx, figX, figY, figScale, s.breathPhase, 1, 0)
        }
        ctx.restore()
        drawChakraDots(ctx, figX, figY, figScale, s.t, 0.7)
        drawCrownRays(ctx, figX, figY, figY - 28, s.t, s.breathPhase, 0.9)
        // warm pre-glow when facing camera
        if (turnP > 0.5) {
          const warmA = (turnP - 0.5) / 0.5 * 0.15
          const wg = ctx.createRadialGradient(figX, figY - 28, 0, figX, figY - 28, 80)
          wg.addColorStop(0, `rgba(255,180,60,${warmA})`); wg.addColorStop(1, 'transparent')
          ctx.beginPath(); ctx.arc(figX, figY - 28, 80, 0, Math.PI * 2)
          ctx.fillStyle = wg; ctx.fill()
        }
      }

      // ── ACT 04 (0.85→0.95): THE CANDLE ────────────────────────────────────
      const a04 = p > 0.84 && p < 0.98 ? inv(p, 0.84, 0.88) : 0
      if (a04 > 0 && turnP <= 0) {
        const candleT = inv(p, 0.88, 0.91)
        const smokeT  = inv(p, 0.91, 0.95)
        const candleY = figY + 14 - (inv(p, 0.85, 0.88)) * 18
        drawFigureFront(ctx, figX, figY, figScale, s.breathPhase, a04, candleT)
        drawChakraDots(ctx, figX, figY, figScale, s.t, a04 * 0.9)
        drawCrownRays(ctx, figX, figY, figY - 28, s.t, s.breathPhase, a04 * 1.3)
        if (candleT > 0) {
          drawCandle(ctx, figX, candleY - 12, candleT)
          drawFlame(ctx, figX, candleY - 28, s.t, candleT)
        }
        if (smokeT > 0) updateAndDrawSmoke(ctx, s.smoke, figX, candleY - 40, s.t, smokeT, 0)
      }

      // ── ACT 05 (0.95→1.0): THE PORTAL ─────────────────────────────────────
      const a05 = p > 0.93 ? inv(p, 0.93, 0.97) : 0
      if (a05 > 0) {
        const candleY = figY + 14 - 18  // same position as act 04
        const figAlpha = 1 - inv(p, 0.96, 0.995)
        drawFigureFront(ctx, figX, figY, figScale, s.breathPhase, figAlpha, 1.0)
        drawCandle(ctx, figX, candleY - 12, figAlpha)
        drawFlame(ctx, figX, candleY - 28, s.t, figAlpha)
        updateAndDrawSmoke(ctx, s.smoke, figX, candleY - 40, s.t, figAlpha, a05)
        drawPortal(ctx, W, H, W * 0.5, H, inv(p, 0.95, 1.0))
        // global white overlay
        const whiteA = inv(p, 0.97, 1.0)
        if (whiteA > 0) {
          ctx.fillStyle = `rgba(255,255,255,${whiteA})`
          ctx.fillRect(0, 0, W, H)
        }
      }

      // ── FILM GRAIN (subtle) ────────────────────────────────────────────────
      if (p < 0.95 && Math.random() < 0.15) {
        ctx.globalAlpha = 0.015
        for (let i = 0; i < 200; i++) {
          const gx = Math.random() * W, gy = Math.random() * H
          ctx.fillStyle = `rgba(255,255,255,${Math.random()})`
          ctx.fillRect(gx, gy, 1, 1)
        }
        ctx.globalAlpha = 1
      }
    }

    frame()

    return () => {
      cancelAnimationFrame(s.raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [getScene])

  return (
    <>
      <style>{`
        @keyframes scrollPulse {
          0%,100%{opacity:0.4;transform:scaleY(1)}
          50%{opacity:1;transform:scaleY(1.2)}
        }
        @keyframes breathePulse {
          0%,100%{opacity:0.5;transform:scale(1)}
          50%{opacity:1;transform:scale(1.35)}
        }
      `}</style>

      {/* 700vh sticky scroll container */}
      <div ref={containerRef} style={{ height:'700vh', position:'relative' }}>
        <div style={{ position:'sticky', top:0, height:'100vh', overflow:'hidden' }}>
          <canvas
            ref={canvasRef}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
          />
          <ChapterOverlay progress={progress} />
          <ScrollHint visible={showScrollHint} />
          <ProgressRing progress={progress} />
          <BreatheBadge visible={showBadge} />
        </div>
      </div>
    </>
  )
}
