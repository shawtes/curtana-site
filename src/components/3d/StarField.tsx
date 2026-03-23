'use client'

/**
 * StarField — 3-layer realistic night sky for Act 00 surface scene.
 *
 * Layer 1: 2000 bright foreground stars — custom ShaderMaterial,
 *           per-star color temperature (blue-white → orange-red),
 *           scintillation twinkling tied to clock.
 * Layer 2: 8000 dense field stars — PointsMaterial, no twinkling.
 * Layer 3: 15000 Milky Way band — Gaussian-concentrated on galactic plane.
 *
 * All layers: AdditiveBlending, no depthWrite, upper-hemisphere distribution.
 * Opacity prop: driven by scroll (1 → 0 as submersion begins).
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── STAR COLOR TEMPERATURES ────────────────────────────────────────────────
// RGB triples, ordered hot→cool. Weighted toward white/warm-white majority.
const STAR_COLORS = [
  [0.60, 0.70, 1.00],  // O/B — blue-white hot
  [0.85, 0.90, 1.00],  // A   — blue-white
  [1.00, 1.00, 1.00],  // F/G — white (sun-type) — most common
  [1.00, 0.97, 0.88],  // G   — warm white
  [1.00, 0.88, 0.70],  // K   — yellow-orange
  [1.00, 0.75, 0.55],  // K/M — orange
  [1.00, 0.60, 0.45],  // M   — red cool giant
]
// Sampling weights: more white/warm, fewer blue/red
const WEIGHTS = [
  0, 0,           // 2/24 blue-white hot
  1, 1, 1,        // 3/24 blue-white
  2, 2, 2, 2, 2, 2, 2, // 7/24 white
  3, 3, 3, 3, 3,  // 5/24 warm white
  4, 4, 4,        // 3/24 yellow-orange
  5, 5,           // 2/24 orange
  6,              // 1/24 red
]

// Upper-hemisphere sphere distribution
function hemispherePt(r: number): [number, number, number] {
  const theta = Math.random() * Math.PI * 2
  const phi   = Math.acos(2 * Math.random() - 1)
  return [
    r * Math.sin(phi) * Math.cos(theta),
    Math.abs(r * Math.cos(phi)),          // flip negative y above horizon
    r * Math.sin(phi) * Math.sin(theta),
  ]
}

// ─── LAYER 1: BRIGHT TWINKLING STARS ────────────────────────────────────────

const TWINKLE_VERT = `
  attribute float aSize;
  attribute float aSeed;
  varying float vSeed;
  varying vec3  vColor;
  void main() {
    vSeed  = aSeed;
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (280.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

const TWINKLE_FRAG = `
  uniform float uTime;
  uniform float uOpacity;
  varying float vSeed;
  varying vec3  vColor;
  void main() {
    // Scintillation — atmospheric shimmer
    float speed   = 2.2 + vSeed * 4.5;
    float phase   = vSeed * 6.2832;
    float twinkle = sin(uTime * speed + phase) * 0.12
                  + sin(uTime * speed * 1.7 + phase + 1.3) * 0.07;

    // Soft circular disc
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float core  = 1.0 - smoothstep(0.0, 0.5, d);
    float alpha = core * clamp(0.75 + twinkle, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(vColor * (1.0 + max(twinkle, 0.0) * 0.4), alpha);
  }
`

function BrightStars({ opacity }: { opacity: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const { geo, mat } = useMemo(() => {
    const N         = 2000
    const positions = new Float32Array(N * 3)
    const colors    = new Float32Array(N * 3)
    const sizes     = new Float32Array(N)
    const seeds     = new Float32Array(N)

    for (let i = 0; i < N; i++) {
      const [x, y, z] = hemispherePt(90)
      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const ci = STAR_COLORS[WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)]]
      colors[i * 3]     = ci[0]
      colors[i * 3 + 1] = ci[1]
      colors[i * 3 + 2] = ci[2]

      // Magnitude-based size: most stars are small (faint), a few are large (bright)
      sizes[i] = Math.random() < 0.05
        ? 0.28 + Math.random() * 0.20   // ~5% bright/large
        : 0.06 + Math.random() * 0.18   // ~95% faint/small
      seeds[i] = Math.random()
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    g.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSeed',    new THREE.BufferAttribute(seeds, 1))

    const m = new THREE.ShaderMaterial({
      uniforms:       { uTime: { value: 0 }, uOpacity: { value: 1.0 } },
      vertexColors:   true,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
      vertexShader:   TWINKLE_VERT,
      fragmentShader: TWINKLE_FRAG,
    })

    return { geo: g, mat: m }
  }, [])

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value    = clock.elapsedTime
    mat.uniforms.uOpacity.value = opacity
  })

  return <points geometry={geo} material={mat} />
}

// ─── LAYER 2: DENSE FIELD STARS ─────────────────────────────────────────────

function FieldStars({ opacity, mobile }: { opacity: number; mobile: boolean }) {
  const matRef = useRef<THREE.PointsMaterial>(null)

  const geo = useMemo(() => {
    const N = mobile ? 3000 : 8000
    const positions = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const [x, y, z] = hemispherePt(82 + Math.random() * 12)
      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [mobile])

  useFrame(() => {
    if (matRef.current) matRef.current.opacity = opacity * 0.5
  })

  return (
    <points geometry={geo}>
      <pointsMaterial
        ref={matRef}
        size={0.035}
        color={0xc8d2f0}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// ─── LAYER 3: MILKY WAY BAND ─────────────────────────────────────────────────

function MilkyWay({ opacity, mobile }: { opacity: number; mobile: boolean }) {
  const matRef = useRef<THREE.PointsMaterial>(null)

  const geo = useMemo(() => {
    const N = mobile ? 5000 : 15000
    const positions = new Float32Array(N * 3)

    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2
      // Gaussian concentration toward galactic equator
      const lat    = (Math.random() - 0.5) * Math.PI
      const inBand = Math.random() < Math.exp(-lat * lat / 0.025)
      const phi    = inBand
        ? (Math.random() * 0.18 + 0.42) * Math.PI  // near galactic plane
        : Math.acos(2 * Math.random() - 1)

      const r = 72 + Math.random() * 18
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi))
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [mobile])

  useFrame(() => {
    if (matRef.current) matRef.current.opacity = opacity * 0.32
  })

  return (
    <points geometry={geo}>
      <pointsMaterial
        ref={matRef}
        size={0.012}
        color={0xf0ebe0}
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

interface Props {
  opacity?: number
  mobile?:  boolean
}

export default function StarField({ opacity = 1, mobile = false }: Props) {
  return (
    <group>
      <BrightStars opacity={opacity} />
      <FieldStars  opacity={opacity} mobile={mobile} />
      <MilkyWay    opacity={opacity} mobile={mobile} />
    </group>
  )
}
