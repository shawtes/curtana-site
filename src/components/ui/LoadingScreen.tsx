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
  }, [])

  // ── Cup geometry — simple tapered teacup ────────────────────────────────
  // Widest at rim, tapers to narrow base. Like a real teacup side profile.
  const RIM_HW  = 42    // half-width at rim
  const BASE_HW = 22    // half-width at base
  const CUP_H   = 56    // cup height
  const BASE_Y  = CUP_H + 5

  // Cup body — gentle inward taper, rounded bottom
  const cupPath = [
    `M ${-RIM_HW} 0`,
    `C ${-RIM_HW} ${CUP_H * 0.35}, ${-BASE_HW - 6} ${CUP_H * 0.7}, ${-BASE_HW} ${CUP_H}`,
    `Q ${-BASE_HW} ${BASE_Y}, 0 ${BASE_Y}`,
    `Q ${BASE_HW} ${BASE_Y}, ${BASE_HW} ${CUP_H}`,
    `C ${BASE_HW + 6} ${CUP_H * 0.7}, ${RIM_HW} ${CUP_H * 0.35}, ${RIM_HW} 0`,
  ].join(' ')

  // Rim ellipse
  const rimPath = `M ${-RIM_HW} 0 Q ${-RIM_HW} -6, 0 -6 Q ${RIM_HW} -6, ${RIM_HW} 0 Q ${RIM_HW} 3, 0 3 Q ${-RIM_HW} 3, ${-RIM_HW} 0`

  // Foot ring
  const footPath = `M ${-BASE_HW - 2} ${CUP_H + 1} Q ${-BASE_HW - 2} ${BASE_Y + 1}, 0 ${BASE_Y + 1} Q ${BASE_HW + 2} ${BASE_Y + 1}, ${BASE_HW + 2} ${CUP_H + 1}`

  // Handle — right side
  const handleR = [
    `M ${RIM_HW - 3} 8`,
    `C ${RIM_HW + 18} 4, ${RIM_HW + 24} 16, ${RIM_HW + 24} 26`,
    `C ${RIM_HW + 24} 38, ${RIM_HW + 14} 44, ${RIM_HW - 6} 42`,
  ].join(' ')

  // Handle — left side
  const handleL = [
    `M ${-(RIM_HW - 3)} 8`,
    `C ${-(RIM_HW + 18)} 4, ${-(RIM_HW + 24)} 16, ${-(RIM_HW + 24)} 26`,
    `C ${-(RIM_HW + 24)} 38, ${-(RIM_HW + 14)} 44, ${-(RIM_HW - 6)} 42`,
  ].join(' ')

  // ── Water fill — linear taper from rim to base ─────────────────────────
  function cupHW(y: number): number {
    if (y <= 0) return RIM_HW
    if (y >= CUP_H) return BASE_HW
    const t = y / CUP_H
    // Slight curve to match the bezier walls
    return RIM_HW + (BASE_HW - RIM_HW) * (t * 0.6 + t * t * 0.4)
  }

  // Right cup fills as progress increases
  const WL   = CUP_H * (1 - progress)
  const wlHW = cupHW(WL)

  const rightWaterPath = progress > 0.01 ? [
    `M ${-wlHW + 1} ${WL}`,
    `L ${-BASE_HW + 1} ${CUP_H}`,
    `Q ${-BASE_HW} ${BASE_Y - 1}, 0 ${BASE_Y - 1}`,
    `Q ${BASE_HW} ${BASE_Y - 1}, ${BASE_HW - 1} ${CUP_H}`,
    `L ${wlHW - 1} ${WL}`,
    'Z',
  ].join(' ') : ''

  // Left cup empties as progress increases
  const LWL   = CUP_H * progress
  const lwlHW = cupHW(LWL)

  const leftWaterPath = LWL < CUP_H - 1 ? [
    `M ${-lwlHW + 1} ${LWL}`,
    `L ${-BASE_HW + 1} ${CUP_H}`,
    `Q ${-BASE_HW} ${BASE_Y - 1}, 0 ${BASE_Y - 1}`,
    `Q ${BASE_HW} ${BASE_Y - 1}, ${BASE_HW - 1} ${CUP_H}`,
    `L ${lwlHW - 1} ${LWL}`,
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
                  width="clamp(220px, 75vw, 300px)"
                  style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
                >
                  {/* ── Left cup — tilted to pour, emptying ── */}
                  <g transform="translate(62, -2) rotate(20, 0, 28)">
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

                  {/* ── Water stream — short arc from spout lip to right cup ── */}
                  <path
                    d="M 100 22 C 128 12 175 42 208 72"
                    fill="none"
                    stroke="rgba(127,168,130,0.55)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="140"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="140" to="0"
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
                  {/* Secondary thin stream */}
                  <path
                    d="M 102 24 C 126 16 172 46 206 74"
                    fill="none"
                    stroke="rgba(143,181,196,0.25)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="135"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="135" to="0"
                      dur="1.2s"
                      begin="0.15s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Drop landing + ripple in right cup */}
                  <circle cx="210" cy="78" r="2" fill="rgba(127,168,130,0.6)">
                    <animate attributeName="opacity" values="0;1;0"      dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="cy"      values="72;86;86"   dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="r"       values="2;1.2;1.2" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  {/* Ripple ring */}
                  <ellipse cx="210" cy="86" rx="0" ry="0" fill="none"
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
