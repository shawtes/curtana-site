'use client'

import { useRef, useEffect, useMemo } from 'react'

interface Props {
  seed?:     string
  color?:    string
  opacity?:  number
  duration?: number
  delay?:    number
  height?:   string | number
  style?:    React.CSSProperties
}

function seededRand(seed: number) {
  let s = seed | 1
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return ((s >>> 0) / 0xffffffff)
  }
}

function hashSeed(str: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h
}

function buildPath(seed: string, width: number, height: number): string {
  const rand = seededRand(hashSeed(seed))
  const startY = rand() * height * 0.6 + height * 0.2
  const endY   = rand() * height * 0.6 + height * 0.2
  const cp1x = width * (0.2 + rand() * 0.15)
  const cp1y = rand() * height
  const cp2x = width * (0.4 + rand() * 0.1)
  const cp2y = rand() * height
  const cp3x = width * (0.55 + rand() * 0.15)
  const cp3y = rand() * height
  const cp4x = width * (0.75 + rand() * 0.15)
  const cp4y = rand() * height
  return (
    `M 0 ${startY} ` +
    `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${width * 0.5} ${rand() * height * 0.5 + height * 0.25} ` +
    `C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${width} ${endY}`
  )
}

// Four layers: outermost diffuse → tight glow → inner glow → sharp core
// Opacities are fixed high values — `opacity` prop scales the whole container
const LAYERS = [
  { width: 32,  op: 0.45 },  // wide diffuse halo
  { width: 10,  op: 0.75 },  // soft glow
  { width: 3,   op: 0.95 },  // inner glow
  { width: 0.8, op: 1.0  },  // sharp bright core
]

export default function AnimatedLine({
  seed     = 'default',
  color    = '#7fa882',
  opacity  = 0.18,
  duration = 1800,
  delay    = 200,
  height   = 200,
  style,
}: Props) {
  const refs   = [
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
  ]
  const started = useRef(false)
  const pathD   = useMemo(() => buildPath(seed, 1000, 400), [seed])
  const uid     = useMemo(() => `al-${hashSeed(seed).toString(36)}`, [seed])

  useEffect(() => {
    const core = refs[3].current
    if (!core || started.current) return
    started.current = true

    const length = core.getTotalLength()
    refs.forEach(r => {
      if (!r.current) return
      r.current.style.strokeDasharray  = `${length}`
      r.current.style.strokeDashoffset = `${length}`
    })

    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const t    = Math.min(1, (now - start) / duration)
        const ease = 1 - Math.pow(1 - t, 3) * (1 + 2 * t)
        const off  = `${length * (1 - ease)}`
        refs.forEach(r => { if (r.current) r.current.style.strokeDashoffset = off })
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, delay, pathD])

  return (
    <svg
      viewBox="0 0 1000 400"
      preserveAspectRatio="none"
      style={{
        display:  'block',
        width:    '100%',
        height,
        overflow: 'visible',
        pointerEvents: 'none',
        opacity,          // overall scale — layers are always bright
        ...style,
      }}
    >
      <defs>
        {/* Fade both ends to transparent */}
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={color} stopOpacity="0"   />
          <stop offset="8%"   stopColor={color} stopOpacity="1"   />
          <stop offset="92%"  stopColor={color} stopOpacity="1"   />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>

      {LAYERS.map((layer, i) => (
        <path
          key={i}
          ref={refs[i]}
          d={pathD}
          fill="none"
          stroke={`url(#${uid}-g)`}
          strokeWidth={layer.width}
          strokeLinecap="round"
          opacity={layer.op}
        />
      ))}
    </svg>
  )
}
