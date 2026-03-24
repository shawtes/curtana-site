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

  // ── Cup geometry ─────────────────────────────────────────────────────────
  const HW_RIM  = 56   // half-width at rim
  const HW_BASE = 30   // half-width at base
  const H       = 78   // cup interior height
  const RIM_Y   = -9   // rim arc top
  const BASE_Y  = H + 7  // base bottom

  const cupPath = [
    `M ${-HW_RIM} 0`,
    `Q ${-HW_RIM} ${RIM_Y} 0 ${RIM_Y}`,
    `Q ${HW_RIM} ${RIM_Y} ${HW_RIM} 0`,
    `L ${HW_BASE} ${H}`,
    `Q ${HW_BASE} ${BASE_Y} 0 ${BASE_Y}`,
    `Q ${-HW_BASE} ${BASE_Y} ${-HW_BASE} ${H}`,
    'Z',
  ].join(' ')

  const handleR = `M ${HW_RIM - 5} 16 Q ${HW_RIM + 28} 22 ${HW_RIM + 28} 48 Q ${HW_RIM + 28} 72 ${HW_BASE + 6} 70`
  const handleL = `M ${-(HW_RIM - 5)} 16 Q ${-(HW_RIM + 28)} 22 ${-(HW_RIM + 28)} 48 Q ${-(HW_RIM + 28)} 72 ${-(HW_BASE + 6)} 70`

  // Right cup: H = empty, 0 = full
  const WL   = H * (1 - progress)
  const hw   = HW_RIM - (HW_RIM - HW_BASE) * (WL / H)

  const rightWaterPath = progress > 0.01 ? [
    `M ${-hw + 1} ${WL}`,
    `L ${-HW_BASE + 2} ${H - 1}`,
    `Q 0 ${BASE_Y - 1} ${HW_BASE - 2} ${H - 1}`,
    `L ${hw - 1} ${WL}`,
    'Z',
  ].join(' ') : ''

  // Left cup: empties as progress increases (0 = full, 1 = empty)
  const LWL  = H * progress
  const lhw  = HW_RIM - (HW_RIM - HW_BASE) * (LWL / H)

  const leftWaterPath = LWL < H - 1 ? [
    `M ${-lhw + 1} ${LWL}`,
    `L ${-HW_BASE + 2} ${H - 1}`,
    `Q 0 ${BASE_Y - 1} ${HW_BASE - 2} ${H - 1}`,
    `L ${lhw - 1} ${LWL}`,
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
                  viewBox="-10 -60 360 230"
                  width="300"
                  style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
                >
                  {/* ── Left cup — elevated and tilted, emptying ── */}
                  <g transform="translate(70, 6) rotate(-46, 0, 39)">
                    {leftWaterPath && (
                      <path d={leftWaterPath} fill="rgba(127,168,130,0.46)" />
                    )}
                    {/* Emptying water surface shimmer */}
                    {LWL < H - 2 && (
                      <line
                        x1={-lhw + 2} y1={LWL}
                        x2={ lhw - 2} y2={LWL}
                        stroke="rgba(143,181,196,0.45)"
                        strokeWidth="1"
                        strokeLinecap="round"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.1;0.55;0.1"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </line>
                    )}
                    <path
                      d={cupPath}
                      fill="none"
                      stroke="rgba(245,240,232,0.72)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d={handleL}
                      fill="none"
                      stroke="rgba(245,240,232,0.55)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* ── Water stream — arcs from elevated spout down to right cup ── */}
                  <path
                    d="M 90 14 C 140 -8 195 48 224 88"
                    fill="none"
                    stroke="rgba(127,168,130,0.58)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="145"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="145" to="0"
                      dur="1.1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.85;0.3"
                      dur="1.1s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Drop landing in right cup */}
                  <circle cx="227" cy="94" r="2.5" fill="rgba(127,168,130,0.65)">
                    <animate attributeName="opacity" values="0;1;0"      dur="1.1s" repeatCount="indefinite" />
                    <animate attributeName="cy"      values="88;104;104" dur="1.1s" repeatCount="indefinite" />
                  </circle>

                  {/* ── Right cup (upright, filling) ── */}
                  <g transform="translate(265, 60)">
                    {rightWaterPath && (
                      <path d={rightWaterPath} fill="rgba(127,168,130,0.46)" />
                    )}
                    {/* Water surface shimmer */}
                    {progress > 0.02 && (
                      <line
                        x1={-hw + 2} y1={WL}
                        x2={ hw - 2} y2={WL}
                        stroke="rgba(143,181,196,0.48)"
                        strokeWidth="1"
                        strokeLinecap="round"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.15;0.65;0.15"
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </line>
                    )}
                    <path
                      d={cupPath}
                      fill="none"
                      stroke="rgba(245,240,232,0.72)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d={handleR}
                      fill="none"
                      stroke="rgba(245,240,232,0.55)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
