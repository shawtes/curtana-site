'use client'

/**
 * LoadingScreen — Pours water from one cup into another as assets load.
 * When the cup is full: "Welcome" sweeps up, then the whole screen slides
 * off the top revealing the page.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress]   = useState(0)
  const [phase, setPhase]         = useState<'loading' | 'welcome' | 'exit'>('loading')
  const doneRef                   = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setProgress(1)
    setTimeout(() => setPhase('welcome'), 350)
    setTimeout(() => setPhase('exit'),   2000)
    setTimeout(() => onComplete(),       3100)
  }, [onComplete])

  useEffect(() => {
    // Animate fill to ~88 % over 2.3 s, then hold for real assets
    const t0   = performance.now()
    const RAMP = 2300
    let raf: number

    const tick = (now: number) => {
      const t   = Math.min(1, (now - t0) / RAMP)
      const ease = 1 - Math.pow(1 - t, 2)
      setProgress(ease * 0.88)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Minimum visible time + actual asset preloads
    const minTime = new Promise<void>(r => setTimeout(r, 2500))

    const preloadImg = (src: string) =>
      new Promise<void>(res => {
        const img = new Image()
        img.onload = img.onerror = () => res()
        img.src = src
      })

    Promise.all([
      minTime,
      preloadImg('/textures/waternormals.jpg'),
      preloadImg('/models/meditation/textures/RyJeane_face_1001.jpeg'),
      preloadImg('/models/meditation/textures/RyJeane_torso_1002.jpeg'),
    ]).then(finish)

    return () => cancelAnimationFrame(raf)
  }, [finish])

  // ── Cup geometry — realistic tea cup profile ────────────────────────────
  // Modelled after a real ceramic tea cup: slight flare at rim, curved belly,
  // narrow waist, small foot. All coordinates relative to rim-center (0,0).
  const RIM_HW   = 44    // half-width at rim (lip)
  const BELLY_HW = 48    // half-width at widest belly point
  const FOOT_HW  = 20    // half-width at foot
  const CUP_H    = 62    // interior depth (rim to inner base)
  const BELLY_Y  = 28    // y where belly is widest
  const BASE_Y   = CUP_H + 6  // outer base including foot curve

  // Cup body: rim → belly curve → foot, with rounded bottom
  const cupPath = [
    // Rim (slight lip flare — rim is narrower than belly)
    `M ${-RIM_HW} 0`,
    // Left wall: flares out to belly, then tapers to foot
    `C ${-RIM_HW - 2} ${BELLY_Y * 0.4}, ${-BELLY_HW} ${BELLY_Y * 0.7}, ${-BELLY_HW} ${BELLY_Y}`,
    `C ${-BELLY_HW} ${BELLY_Y + 18}, ${-FOOT_HW - 12} ${CUP_H - 6}, ${-FOOT_HW} ${CUP_H}`,
    // Rounded bottom
    `Q ${-FOOT_HW} ${BASE_Y}, 0 ${BASE_Y}`,
    `Q ${FOOT_HW} ${BASE_Y}, ${FOOT_HW} ${CUP_H}`,
    // Right wall back up
    `C ${FOOT_HW + 12} ${CUP_H - 6}, ${BELLY_HW} ${BELLY_Y + 18}, ${BELLY_HW} ${BELLY_Y}`,
    `C ${BELLY_HW} ${BELLY_Y * 0.7}, ${RIM_HW + 2} ${BELLY_Y * 0.4}, ${RIM_HW} 0`,
  ].join(' ')

  // Rim ellipse (top opening — visible oval)
  const rimPath = `M ${-RIM_HW} 0 Q ${-RIM_HW} -7, 0 -7 Q ${RIM_HW} -7, ${RIM_HW} 0 Q ${RIM_HW} 4, 0 4 Q ${-RIM_HW} 4, ${-RIM_HW} 0`

  // Small foot ring at base
  const footPath = `M ${-FOOT_HW - 3} ${CUP_H + 2} Q ${-FOOT_HW - 3} ${BASE_Y + 2}, 0 ${BASE_Y + 2} Q ${FOOT_HW + 3} ${BASE_Y + 2}, ${FOOT_HW + 3} ${CUP_H + 2}`

  // Handle — ear-shaped, right side (for right cup)
  const handleR = [
    `M ${RIM_HW - 4} 10`,
    `C ${RIM_HW + 22} 6, ${RIM_HW + 30} 20, ${RIM_HW + 30} 32`,
    `C ${RIM_HW + 30} 46, ${RIM_HW + 18} 54, ${BELLY_HW - 2} 50`,
  ].join(' ')

  // Handle — left side (for left/pouring cup)
  const handleL = [
    `M ${-(RIM_HW - 4)} 10`,
    `C ${-(RIM_HW + 22)} 6, ${-(RIM_HW + 30)} 20, ${-(RIM_HW + 30)} 32`,
    `C ${-(RIM_HW + 30)} 46, ${-(RIM_HW + 18)} 54, ${-(BELLY_HW - 2)} 50`,
  ].join(' ')

  // ── Water fill calculation ──────────────────────────────────────────────
  // Compute the cup width at a given y using the belly curve profile
  function cupHalfWidthAt(y: number): number {
    if (y <= 0) return RIM_HW
    if (y >= CUP_H) return FOOT_HW
    if (y <= BELLY_Y) {
      // Rim → belly: slight outward bulge
      const t = y / BELLY_Y
      return RIM_HW + (BELLY_HW - RIM_HW) * Math.sin(t * Math.PI * 0.5)
    }
    // Belly → foot: taper inward
    const t = (y - BELLY_Y) / (CUP_H - BELLY_Y)
    return BELLY_HW + (FOOT_HW - BELLY_HW) * t * t
  }

  // Right cup: fills from bottom up (WL = water line y, 0 = full, CUP_H = empty)
  const WL   = CUP_H * (1 - progress)
  const wlHW = cupHalfWidthAt(WL)

  const rightWaterPath = progress > 0.01 ? [
    `M ${-wlHW + 1} ${WL}`,
    // Follow left wall down to base
    `C ${-cupHalfWidthAt(WL + (CUP_H - WL) * 0.5) - 1} ${WL + (CUP_H - WL) * 0.5}, ${-FOOT_HW - 2} ${CUP_H - 4}, ${-FOOT_HW} ${CUP_H}`,
    // Rounded bottom
    `Q ${-FOOT_HW} ${BASE_Y - 1}, 0 ${BASE_Y - 1}`,
    `Q ${FOOT_HW} ${BASE_Y - 1}, ${FOOT_HW} ${CUP_H}`,
    // Follow right wall back up
    `C ${FOOT_HW + 2} ${CUP_H - 4}, ${cupHalfWidthAt(WL + (CUP_H - WL) * 0.5) + 1} ${WL + (CUP_H - WL) * 0.5}, ${wlHW - 1} ${WL}`,
    'Z',
  ].join(' ') : ''

  // Left cup: empties as progress increases (LWL goes from 0 → CUP_H)
  const LWL   = CUP_H * progress
  const lwlHW = cupHalfWidthAt(LWL)

  const leftWaterPath = LWL < CUP_H - 1 ? [
    `M ${-lwlHW + 1} ${LWL}`,
    `C ${-cupHalfWidthAt(LWL + (CUP_H - LWL) * 0.5) - 1} ${LWL + (CUP_H - LWL) * 0.5}, ${-FOOT_HW - 2} ${CUP_H - 4}, ${-FOOT_HW} ${CUP_H}`,
    `Q ${-FOOT_HW} ${BASE_Y - 1}, 0 ${BASE_Y - 1}`,
    `Q ${FOOT_HW} ${BASE_Y - 1}, ${FOOT_HW} ${CUP_H}`,
    `C ${FOOT_HW + 2} ${CUP_H - 4}, ${cupHalfWidthAt(LWL + (CUP_H - LWL) * 0.5) + 1} ${LWL + (CUP_H - LWL) * 0.5}, ${lwlHW - 1} ${LWL}`,
    'Z',
  ].join(' ') : ''

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="loader"
          exit={{ y: '-100%', transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         200,
            background:     '#0d0f0e',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            overflow:       'hidden',
          }}
        >
          <AnimatePresence mode="wait">

            {/* ── Loading emblem ─────────────────────────────────────────── */}
            {phase === 'loading' && (
              <motion.div
                key="emblem"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14, transition: { duration: 0.38 } }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'center' }}
              >
                <svg
                  viewBox="-20 -50 340 210"
                  width="300"
                  style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
                >
                  {/* ── Left cup — gently tilted to pour, emptying ── */}
                  <g transform="translate(60, 10) rotate(-18, 0, 34)">
                    {/* Water fill */}
                    {leftWaterPath && (
                      <path d={leftWaterPath} fill="rgba(127,168,130,0.40)" />
                    )}
                    {/* Water surface shimmer */}
                    {LWL < CUP_H - 2 && (
                      <ellipse
                        cx={0} cy={LWL}
                        rx={lwlHW - 3} ry={2.5}
                        fill="none"
                        stroke="rgba(143,181,196,0.45)"
                        strokeWidth="0.8"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.1;0.55;0.1"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </ellipse>
                    )}
                    {/* Cup body */}
                    <path
                      d={cupPath}
                      fill="none"
                      stroke="rgba(245,240,232,0.68)"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    {/* Rim ellipse */}
                    <path
                      d={rimPath}
                      fill="rgba(245,240,232,0.04)"
                      stroke="rgba(245,240,232,0.45)"
                      strokeWidth="0.8"
                    />
                    {/* Foot ring */}
                    <path
                      d={footPath}
                      fill="none"
                      stroke="rgba(245,240,232,0.3)"
                      strokeWidth="0.8"
                    />
                    {/* Handle */}
                    <path
                      d={handleL}
                      fill="none"
                      stroke="rgba(245,240,232,0.50)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* ── Water stream — gentle arc from spout to right cup ── */}
                  <path
                    d="M 96 18 C 130 4 185 40 212 78"
                    fill="none"
                    stroke="rgba(127,168,130,0.55)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="150"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="150" to="0"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.25;0.8;0.25"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </path>
                  {/* Secondary thin stream for depth */}
                  <path
                    d="M 98 20 C 128 8 182 44 210 80"
                    fill="none"
                    stroke="rgba(143,181,196,0.25)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="145"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="145" to="0"
                      dur="1.2s"
                      begin="0.15s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Drop landing + ripple in right cup */}
                  <circle cx="214" cy="84" r="2" fill="rgba(127,168,130,0.6)">
                    <animate attributeName="opacity" values="0;1;0"      dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="cy"      values="78;92;92"   dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="r"       values="2;1.2;1.2" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  {/* Ripple ring */}
                  <ellipse cx="214" cy="92" rx="0" ry="0" fill="none"
                    stroke="rgba(143,181,196,0.35)" strokeWidth="0.6">
                    <animate attributeName="rx"      values="0;8;12"   dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="ry"      values="0;2;3"    dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity"  values="0;0.4;0" dur="1.2s" repeatCount="indefinite" />
                  </ellipse>

                  {/* ── Right cup (upright, filling) ── */}
                  <g transform="translate(250, 52)">
                    {/* Water fill */}
                    {rightWaterPath && (
                      <path d={rightWaterPath} fill="rgba(127,168,130,0.40)" />
                    )}
                    {/* Water surface shimmer */}
                    {progress > 0.02 && (
                      <ellipse
                        cx={0} cy={WL}
                        rx={wlHW - 3} ry={2.5}
                        fill="none"
                        stroke="rgba(143,181,196,0.48)"
                        strokeWidth="0.8"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.15;0.65;0.15"
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </ellipse>
                    )}
                    {/* Cup body */}
                    <path
                      d={cupPath}
                      fill="none"
                      stroke="rgba(245,240,232,0.68)"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    {/* Rim ellipse */}
                    <path
                      d={rimPath}
                      fill="rgba(245,240,232,0.04)"
                      stroke="rgba(245,240,232,0.45)"
                      strokeWidth="0.8"
                    />
                    {/* Foot ring */}
                    <path
                      d={footPath}
                      fill="none"
                      stroke="rgba(245,240,232,0.3)"
                      strokeWidth="0.8"
                    />
                    {/* Handle */}
                    <path
                      d={handleR}
                      fill="none"
                      stroke="rgba(245,240,232,0.50)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>

                {/* Brand name */}
                <p style={{
                  fontFamily:      'var(--font-body, sans-serif)',
                  fontSize:        '10px',
                  letterSpacing:   '4px',
                  textTransform:   'uppercase',
                  color:           'rgba(127,168,130,0.52)',
                  margin:          '22px 0 0',
                }}>
                  Flow With Curtana
                </p>

                {/* Progress line */}
                <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width:        100,
                    height:       1,
                    background:   'rgba(245,240,232,0.07)',
                    borderRadius: 1,
                    overflow:     'hidden',
                  }}>
                    <div style={{
                      height:     '100%',
                      width:      `${progress * 100}%`,
                      background: 'linear-gradient(90deg, rgba(127,168,130,0.3), rgba(127,168,130,0.95))',
                      transition: 'width 100ms linear',
                      borderRadius: 1,
                    }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Welcome sweep ──────────────────────────────────────────── */}
            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
                style={{ textAlign: 'center' }}
              >
                {/* Clip container so text sweeps in from below */}
                <div style={{ overflow: 'hidden', lineHeight: 1 }}>
                  <motion.h1
                    initial={{ y: '108%', rotate: 2.5 }}
                    animate={{ y: '0%',   rotate: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily:    'var(--font-display, Georgia, serif)',
                      fontSize:      'clamp(78px, 14vw, 170px)',
                      fontWeight:    300,
                      fontStyle:     'italic',
                      color:         '#f5f0e8',
                      letterSpacing: '-4px',
                      lineHeight:    1,
                      margin:        0,
                      padding:       '0 0 6px',
                      display:       'block',
                    }}
                  >
                    Welcome
                  </motion.h1>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  transition={{ delay: 0.58, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily:    'var(--font-body, sans-serif)',
                    fontSize:      '11px',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    color:         '#7fa882',
                    marginTop:     22,
                    marginBottom:  0,
                  }}
                >
                  Flow With Curtana
                </motion.p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
