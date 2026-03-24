'use client'

/**
 * AwakeningGeometry — Act 3 (A3: 0.45 → 0.62) visual layers.
 *
 * Layer 1: MandelbrotPlane — GLSL fractal shader on a 20×20 plane.
 *          uZoom: 1.0 → 0.0001 (zooms into Elephant Valley −0.7269, 0.1889)
 *          Palette: sage → sand → cream → gold.
 *
 * Layer 3: LissajousLines — 12 parametric Lissajous curves.
 *          500 pts each, phase morphs +0.18 rad/s, sage/gold alternating.
 *          Disabled on mobile.
 *
 * Layer 4: KaleidoscopePass (named export) — React component for use inside
 *          EffectComposer. Wraps KaleidoscopeEffect (extends postprocessing Effect).
 *          uSegments: 6→12, uStrength: 0→0.7, uAngle drifts +0.0008/frame.
 *
 * Wire-up in SubmersionJourney:
 *   import AwakeningGeometry, { KaleidoscopePass } from './AwakeningGeometry'
 *   <AwakeningGeometry act3Progress={a3} mobile={mobile} />   // alongside SacredGeo
 *   <KaleidoscopePass act3Progress={a3} />                    // inside EffectComposer
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── PALETTE CONSTANTS ──────────────────────────────────────────────────────────
const SAGE = new THREE.Color(0x7fa882)
const GOLD = new THREE.Color(0xc9a96e)

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1 — MANDELBROT FRACTAL PLANE
// ─────────────────────────────────────────────────────────────────────────────

const mandelbrotVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const mandelbrotFrag = /* glsl */ `
  precision highp float;

  uniform float uZoom;       // 1.0 → 0.0001 (zoom into fractal)
  uniform vec2  uCenter;     // drifts from (-0.5, 0) → (-0.7269, 0.1889)
  uniform float uOpacity;
  uniform float uTime;

  varying vec2 vUv;

  // Curtana palette cycling: sage → sand → cream → gold
  vec3 cwPalette(float t) {
    vec3 a = vec3(0.498, 0.659, 0.510);  // sage
    vec3 b = vec3(0.784, 0.722, 0.604);  // sand
    vec3 c = vec3(0.500, 0.500, 0.500);
    vec3 d = vec3(0.788, 0.663, 0.431);  // gold offset
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uZoom * 4.0;
    vec2 c  = uCenter + uv;

    vec2  z    = vec2(0.0);
    float iter = 0.0;
    const float maxIter = 128.0;

    for (float i = 0.0; i < maxIter; i++) {
      if (dot(z, z) > 4.0) break;
      z    = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      iter++;
    }

    // Smooth colouring (Böttcher smoothing)
    float smooth_t = iter - log2(log2(dot(z, z) + 1e-6)) + 4.0;
    float t        = clamp(smooth_t / maxIter, 0.0, 1.0);

    vec3 col = cwPalette(t + uTime * 0.04);

    // Interior of the set stays dark
    if (iter >= maxIter - 0.5) col = vec3(0.04, 0.06, 0.05);

    // Alpha: additive blend so it layers on top of 3D scene naturally
    float alpha = uOpacity * (1.0 - t * 0.35);
    gl_FragColor = vec4(col * alpha, alpha);
  }
`

interface MandelbrotPlaneProps {
  act3Progress: number
}

function MandelbrotPlane({ act3Progress }: MandelbrotPlaneProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uZoom:    { value: 1.0 },
    uCenter:  { value: new THREE.Vector2(-0.5, 0.0) },
    uOpacity: { value: 0.0 },
    uTime:    { value: 0.0 },
  }), [])

  useFrame((_, delta) => {
    const mat = matRef.current
    if (!mat) return

    const p = act3Progress

    // Zoom exponentially into Elephant Valley
    mat.uniforms.uZoom.value = THREE.MathUtils.lerp(1.0, 0.0001, p)

    // Drift center toward Elephant Valley
    mat.uniforms.uCenter.value.x = THREE.MathUtils.lerp(-0.50, -0.7269, p)
    mat.uniforms.uCenter.value.y = THREE.MathUtils.lerp( 0.00,  0.1889, p)

    // Fade envelope: fade in 0→0.3, full 0.3→0.8, fade out 0.8→1.0
    const fade =
      p < 0.3 ? p / 0.3 :
      p > 0.8 ? (1.0 - p) / 0.2 :
      1.0
    mat.uniforms.uOpacity.value = fade * 0.75  // max 75% opacity

    mat.uniforms.uTime.value += delta
  })

  return (
    <mesh position={[0, 0, -8]}>
      <planeGeometry args={[20, 20, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={mandelbrotVert}
        fragmentShader={mandelbrotFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — LISSAJOUS PARAMETRIC LINES
// ─────────────────────────────────────────────────────────────────────────────

const LISSAJOUS_COUNT = 12
const LISSAJOUS_PTS   = 500

// a/b frequency ratios — irrational-ish for complex, never-repeating figures
const LISSAJOUS_PARAMS: Array<{ freqA: number; freqB: number; phaseOffset: number }> = [
  { freqA: 3, freqB: 2, phaseOffset: 0.00 },
  { freqA: 5, freqB: 4, phaseOffset: 0.25 },
  { freqA: 4, freqB: 3, phaseOffset: 0.50 },
  { freqA: 7, freqB: 6, phaseOffset: 0.75 },
  { freqA: 3, freqB: 4, phaseOffset: 1.00 },
  { freqA: 5, freqB: 6, phaseOffset: 1.25 },
  { freqA: 6, freqB: 5, phaseOffset: 0.10 },
  { freqA: 7, freqB: 4, phaseOffset: 0.60 },
  { freqA: 5, freqB: 3, phaseOffset: 0.90 },
  { freqA: 8, freqB: 5, phaseOffset: 0.40 },
  { freqA: 9, freqB: 8, phaseOffset: 0.70 },
  { freqA: 4, freqB: 7, phaseOffset: 1.10 },
]

interface SingleLissajousProps {
  freqA:       number
  freqB:       number
  phaseOffset: number
  lineIndex:   number
  color:       THREE.Color
  act3Progress: number
}

function SingleLissajous({ freqA, freqB, phaseOffset, lineIndex, color, act3Progress }: SingleLissajousProps) {
  const geomRef  = useRef<THREE.BufferGeometry>(null)
  const phaseRef = useRef(lineIndex * (Math.PI * 2 / LISSAJOUS_COUNT) + phaseOffset)
  // Reuse Float32Array to avoid GC pressure
  const posBuffer = useMemo(() => new Float32Array(LISSAJOUS_PTS * 3), [])

  useFrame((_, frameDelta) => {
    const geom = geomRef.current
    if (!geom) return

    // Phase advances at ~0.18 rad/s (0.003 * 60fps)
    phaseRef.current += frameDelta * 0.18

    const phase = phaseRef.current
    const p     = act3Progress
    // Scale curves in/out with A3 progress
    const scale =
      p < 0.15 ? p / 0.15 :
      p > 0.85 ? (1.0 - p) / 0.15 :
      1.0

    for (let i = 0; i < LISSAJOUS_PTS; i++) {
      const t = (i / (LISSAJOUS_PTS - 1)) * Math.PI * 2
      posBuffer[i * 3 + 0] = Math.sin(freqA * t + phaseOffset + phase) * scale * 4
      posBuffer[i * 3 + 1] = Math.sin(freqB * t + phase) * scale * 3
      posBuffer[i * 3 + 2] = Math.cos((freqA + freqB) * 0.5 * t + phase * 0.3) * scale * 0.5
    }

    if (!geom.attributes.position) {
      geom.setAttribute('position', new THREE.BufferAttribute(posBuffer, 3))
    } else {
      const attr = geom.attributes.position as THREE.BufferAttribute
      attr.array.set(posBuffer)
      attr.needsUpdate = true
    }
  })

  const p = act3Progress
  const opacity =
    p < 0.15 ? (p / 0.15) * 0.6 :
    p > 0.85 ? ((1.0 - p) / 0.15) * 0.6 :
    0.6

  return (
    <line>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </line>
  )
}

interface LissajousLinesProps {
  act3Progress: number
}

function LissajousLines({ act3Progress }: LissajousLinesProps) {
  return (
    <>
      {LISSAJOUS_PARAMS.map((params, i) => (
        <SingleLissajous
          key={i}
          {...params}
          lineIndex={i}
          color={i % 2 === 0 ? SAGE : GOLD}
          act3Progress={act3Progress}
        />
      ))}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 4 — HOPF FIBRATION POST-PROCESS (DEFERRED)
//
// Math: unit quaternions q ∈ S³ act on S² by Möbius transformations via
// stereographic projection. Rodrigues rotation: v' = v + 2·qv × (qv × v + qw·v)
// Fold symmetry follows Villarceau circles (curved Hopf fiber arcs on torus),
// not straight polar sectors like a kaleidoscope.
//
// Implementation requires a custom postprocessing Effect passed into
// EffectComposer. Deferred: wrapEffect + React 19 ref semantics need
// a clean integration path (see SPRINT.md S2-2c).
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT — AwakeningGeometry (Layers 1 + 3)
// Add <KaleidoscopePass act3Progress={a3} /> inside EffectComposer separately.
// ─────────────────────────────────────────────────────────────────────────────

interface AwakeningGeometryProps {
  act3Progress: number
  mobile?: boolean
}

export default function AwakeningGeometry({ act3Progress, mobile = false }: AwakeningGeometryProps) {
  if (act3Progress < 0.001) return null

  return (
    <>
      <MandelbrotPlane act3Progress={act3Progress} />
      {!mobile && <LissajousLines act3Progress={act3Progress} />}
    </>
  )
}
