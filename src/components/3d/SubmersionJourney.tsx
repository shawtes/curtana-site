'use client'

/**
 * SubmersionJourney — 7-act cinematic scroll hero experience.
 *
 * Acts (scrollProgress 0→1 over 800vh):
 *   A0  0.00–0.15  Surface        — she meditates on reflective water
 *   A1  0.15–0.28  Submersion     — she descends, camera follows
 *   A2  0.28–0.45  The Deep       — darkness, bioluminescence, tumbling
 *   A3  0.45–0.62  Geometry       — torus rings + sacred wireframes emerge
 *   A4  0.62–0.78  Hyperspace     — warp streaks, camera rush (canvas overlay)
 *   A5  0.78–0.92  The Turn       — streaks slow, figure rotates 180° to face you
 *   A6  0.92–1.00  White Bloom    — palm light expands, everything dissolves
 *
 * File: src/components/3d/SubmersionJourney.tsx
 * Reference: /Downloads/SUBMERSION_JOURNEY_PROMPT.md
 */

import React, { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import StarField from './StarField'
import * as THREE from 'three'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { useActProgress }          from '@/hooks/useActProgress'
import { useDeviceTier }           from '@/hooks/useDeviceTier'
import { RyJeaneCharacter, UnderwaterLighting } from './RyJeaneCharacter'
import WaterPlane                  from './WaterPlane'
import BiolumiParticles            from './BiolumiParticles'
import { Caustics, Stars }         from '@react-three/drei'

// ─── SHARED COLORS ────────────────────────────────────────────────────────────
const SAGE  = new THREE.Color('#7fa882')
const GOLD  = new THREE.Color('#c9a96e')
const WHITE = new THREE.Color('#ffffff')
const DARK  = new THREE.Color('#0d0f0e')

// ─── BREATH EASE ──────────────────────────────────────────────────────────────
const BREATH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ─── GUIDE WIRE (invisible CatmullRom3 spline) ──────────────────────────────
// The character follows this smooth 3D path through the entire journey.
// Points: surface → descend → deep → turn zone → hold
const GUIDE_POINTS = [
  new THREE.Vector3(0,    -0.8,  0),     // 0.00 — surface, meditating
  new THREE.Vector3(0,    -0.8,  0),     // 0.12 — hold on surface
  new THREE.Vector3(0,    -1.0,  0),     // 0.18 — just starting to sink
  new THREE.Vector3(0.15, -1.6, -0.2),   // 0.28 — crossing water line
  new THREE.Vector3(0.2,  -2.4, -0.3),   // 0.35 — clearly underwater
  new THREE.Vector3(0.1,  -3.2, -0.1),   // 0.42 — mid-descent, slight drift
  new THREE.Vector3(-0.1, -4.2,  0.1),   // 0.50 — approaching deep
  new THREE.Vector3(0,    -5.0,  0),     // 0.60 — deep position
  new THREE.Vector3(0,    -5.0,  0),     // 0.75 — turn zone
  new THREE.Vector3(0,    -5.0,  0),     // 1.00 — hold, front-facing
]
const GUIDE_CURVE = new THREE.CatmullRomCurve3(GUIDE_POINTS, false, 'centripetal', 0.5)

// ─── FIGURE WRAPPER ───────────────────────────────────────────────────────────
// Follows the invisible guide wire spline. Rotation handled per-act.

function Figure({
  progress,
  a1, a2, a3, a5,
  submersionDepth,
}: {
  progress:        number
  a1: number; a2: number; a3: number; a5: number
  submersionDepth: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const turnY    = useRef(0)
  const posVec   = useRef(new THREE.Vector3())

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t      = clock.elapsedTime
    const breath = Math.sin(t * 0.45) * 0.008

    // Sample position from guide wire
    GUIDE_CURVE.getPoint(Math.min(1, progress), posVec.current)
    groupRef.current.position.copy(posVec.current)
    groupRef.current.scale.setScalar(0.011 * (1 + breath))

    if (progress < 0.60) {
      // Act 0–1: back to camera
      groupRef.current.rotation.set(0, 0, 0)
      turnY.current = 0
    } else if (progress < 0.85) {
      // Act 2: The Turn — rotate π on Y (back-facing → front-facing)
      turnY.current = THREE.MathUtils.lerp(turnY.current, a2 * Math.PI, 0.04)
      groupRef.current.rotation.set(0, turnY.current, 0)
    } else {
      // Act 3: front-facing, hold
      groupRef.current.rotation.set(0, Math.PI, 0)
    }
  })

  return (
    <group ref={groupRef}>
      <RyJeaneCharacter submersionDepth={submersionDepth} />
    </group>
  )
}

// ─── SURFACE FROM BELOW ───────────────────────────────────────────────────────
// Semi-transparent shimmer plane at water level when camera is underwater.
// Includes animated caustic-like shimmer via emissive oscillation.

function SurfaceFromBelow({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t   = clock.elapsedTime
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    // Caustic shimmer from above — ocean blue shifting light
    mat.emissiveIntensity = 0.35 + Math.abs(Math.sin(t * 0.7)) * 0.25
      + Math.abs(Math.sin(t * 1.3 + 1.1)) * 0.1
    meshRef.current.position.y = -1.8 + Math.sin(t * 0.6) * 0.015
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#021428"
        emissive="#0a3060"
        emissiveIntensity={0.3}
        transparent
        opacity={0.72}
        side={THREE.BackSide}
        roughness={0.05}
        metalness={0.85}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── BUBBLE PARTICLES ─────────────────────────────────────────────────────────

const BUBBLE_COUNT = 80

function Bubbles({ visible, figureY }: { visible: boolean; figureY: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useRef(new THREE.Object3D()).current

  const data = useRef(
    Array.from({ length: BUBBLE_COUNT }, () => ({
      x:      (Math.random() - 0.5) * 2,
      z:      (Math.random() - 0.5) * 2,
      offset: Math.random() * Math.PI * 2,
      speed:  0.008 + Math.random() * 0.004,
      seed:   Math.random() * Math.PI * 2,
      life:   Math.random(),  // staggered start
    }))
  ).current

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    data.forEach((b, i) => {
      b.life = (b.life + b.speed * 0.1) % 1
      const y      = figureY + b.life * 4  // rise upward from figure
      const wobble = Math.sin(t * 2 + b.seed) * 0.03
      dummy.position.set(b.x + wobble, y, b.z)
      // Grow then shrink with life
      const radius = Math.max(0, Math.sin(b.life * Math.PI)) * (0.015 + (b.seed % 1) * 0.005)
      dummy.scale.setScalar(radius)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!visible) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BUBBLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#b4f0dc"
        transparent
        opacity={0.3}
        roughness={0}
        metalness={0.2}
      />
    </instancedMesh>
  )
}

// ─── SACRED GEOMETRY WIREFRAMES ───────────────────────────────────────────────

function SacredGeo({ act3Progress }: { act3Progress: number }) {
  const icoRef = useRef<THREE.Mesh>(null)
  const octRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (icoRef.current) {
      icoRef.current.rotation.x = t * 0.18
      icoRef.current.rotation.y = t * 0.12
      icoRef.current.rotation.z = t * 0.09
      const mat = icoRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = act3Progress * 0.12
    }
    if (octRef.current) {
      octRef.current.rotation.x = -t * 0.14
      octRef.current.rotation.y = -t * 0.19
      const mat = octRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = act3Progress * 0.18
    }
  })

  if (act3Progress < 0.01) return null

  return (
    <group>
      <mesh ref={icoRef}>
        <icosahedronGeometry args={[3.5, 1]} />
        <meshBasicMaterial color="#c9a96e" wireframe transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={octRef}>
        <octahedronGeometry args={[1.8]} />
        <meshBasicMaterial color="#7fa882" wireframe transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ─── HORIZON GRADIENT ─────────────────────────────────────────────────────────
// Large cylinder (BackSide) that blends the water edge into the sky,
// eliminating the sharp cut-off at the water plane's boundary.

const HORIZON_VERT = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPosition = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const HORIZON_FRAG = `
  uniform vec3  topColor;
  uniform vec3  bottomColor;
  varying vec3  vWorldPosition;
  void main() {
    // t = 0 at water level (y ≈ -2), t = 1 well above
    float t = clamp((vWorldPosition.y + 2.0) / 22.0, 0.0, 1.0);
    t = pow(t, 0.55);
    float alpha = 1.0 - t * 0.55;
    gl_FragColor = vec4(mix(bottomColor, topColor, t), alpha);
  }
`

function HorizonGradient({ visible }: { visible: boolean }) {
  const { mat, geo } = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      side:        THREE.BackSide,
      transparent: true,
      depthWrite:  false,
      uniforms: {
        topColor:    { value: new THREE.Color(0x0d0f0e) },
        bottomColor: { value: new THREE.Color(0x0a1214) },
      },
      vertexShader:   HORIZON_VERT,
      fragmentShader: HORIZON_FRAG,
    })
    const g = new THREE.CylinderGeometry(500, 500, 40, 64, 1, true)
    return { mat: m, geo: g }
  }, [])

  useEffect(() => {
    return () => { mat.dispose(); geo.dispose() }
  }, [mat, geo])

  if (!visible) return null

  return (
    <mesh position={[0, -2, 0]} renderOrder={-1} material={mat} geometry={geo} />
  )
}

// ─── PALM GLOW ────────────────────────────────────────────────────────────────
// Warm gold light from raised hands during Act 5 (arms raise at act5 > 0.65).

function PalmGlow({ act5Progress, act6Progress }: { act5Progress: number; act6Progress: number }) {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    if (!lightRef.current) return
    const raise   = act5Progress > 0.65 ? (act5Progress - 0.65) / 0.35 : 0
    const bloom6  = act6Progress
    lightRef.current.intensity = raise * 0.8 + bloom6 * 2.0
  })

  if (act5Progress < 0.6) return null

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0.5, 1.0]}
      color="#c9a96e"
      intensity={0}
      distance={6}
      decay={2}
    />
  )
}

// ─── CAMERA RIG ───────────────────────────────────────────────────────────────
// Always stays directly behind the figure at a fixed offset.
// Same lerp speed throughout all acts — camera and figure move as one.

function CameraRig({ figureY, progress }: { figureY: number; progress: number }) {
  const { camera } = useThree()
  const curLookY   = useRef(figureY + 0.3)

  useFrame(() => {
    // Camera sits above and behind the figure.
    // At surface: higher up so we see her on the water.
    // During descent: follows her down, looking slightly below her.
    const aboveSurface = progress < 0.20
    const camOffsetY   = aboveSurface ? 1.0 : 1.2
    const camZ         = aboveSurface ? 4.5 : 5.0

    const targetX     = 0
    const targetY     = figureY + camOffsetY
    const targetZ     = camZ
    // Look slightly above figure at surface (avoids water horizon)
    const targetLookY = figureY + (aboveSurface ? 0.3 : 0.3)

    // Faster lerp during descent so camera keeps up
    const LERP = progress > 0.15 && progress < 0.55 ? 0.06 : 0.035
    camera.position.x += (targetX     - camera.position.x) * LERP
    camera.position.y += (targetY     - camera.position.y) * LERP
    camera.position.z += (targetZ     - camera.position.z) * LERP
    curLookY.current  += (targetLookY - curLookY.current)  * LERP

    camera.lookAt(0, curLookY.current, 0)
    camera.rotation.z = 0
  })

  return null
}

// ─── SCENE BACKGROUND ─────────────────────────────────────────────────────────

const _bgColor   = new THREE.Color()
const _bgColorA  = new THREE.Color()
const _bgColorB  = new THREE.Color()

function SceneBackground({ progress, a1, a6 }: { progress: number; a1: number; a6: number }) {
  const { scene, camera } = useThree()

  // Allocate scene.background once — reuse via .copy/.lerp
  const bgRef = useRef(new THREE.Color(0x0d0f0e))
  if (!scene.background || !(scene.background instanceof THREE.Color)) {
    scene.background = bgRef.current
  }
  const bg = bgRef.current

  useFrame(() => {
    const depth = Math.max(0, -1.8 - camera.position.y)
    if (progress < 0.25) {
      bg.copy(DARK)
    } else if (progress < 0.60) {
      _bgColorA.set('#020508')
      bg.copy(DARK).lerp(_bgColorA, a1)
    } else {
      bg.set('#020508')
    }
  })

  return null
}

// ─── UNDERWATER FOG ───────────────────────────────────────────────────────────

const _fogColorA = new THREE.Color()
const _fogColorB = new THREE.Color()

function UnderwaterFog({ progress, a1, a2, a3 }: { progress: number; a1: number; a2: number; a3: number }) {
  const { scene, camera } = useThree()
  const surfaceColor = useMemo(() => new THREE.Color(0x0d0f0e), [])
  const deepColor    = useMemo(() => new THREE.Color(0x0a1f2e), [])
  const tmpColor     = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const depth = Math.max(0, -1.8 - camera.position.y)
    if (depth > 0.05) {
      const density = Math.min(0.10, depth * 0.012 + a1 * 0.03)
      // Lerp fog color from surface dark toward deep aquamarine as depth increases
      const depthFactor = Math.min(1, depth / 4.0)
      tmpColor.copy(surfaceColor).lerp(deepColor, depthFactor)
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(tmpColor)
        scene.fog.density = density
      } else {
        scene.fog = new THREE.FogExp2(tmpColor.getHex(), density)
      }
    } else if (progress < 0.25) {
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(0x0d0f0e)
        scene.fog.density = 0.012
      } else {
        scene.fog = new THREE.FogExp2(0x0d0f0e, 0.012)
      }
    } else {
      scene.fog = null
    }
  })

  return null
}


// ─── SCENE ROOT ───────────────────────────────────────────────────────────────

function Scene({ progress }: { progress: number }) {
  const tier   = useDeviceTier()
  const mobile = tier <= 1
  const acts   = useActProgress(progress)
  const { act, a1, a2, a3, a6 } = acts

  const figureY = act === 0 ? -0.8
    : act === 1 ? THREE.MathUtils.lerp(-0.8, -5.0, a1)
    : -5.0

  const submersionDepth = act === 0 ? 0 : act === 1 ? a1 : 1

  return (
    <>
      <SceneBackground progress={progress} a1={a1} a6={a6} />
      <CameraRig figureY={figureY} progress={progress} />
      <UnderwaterFog progress={progress} a1={a1} a2={a2} a3={a3} />

      {/* ── Lighting ── */}
      <ambientLight intensity={0.55} color="#e8ede9" />
      <directionalLight position={[-2, 4, 3]} intensity={0.8} color="#c8d8b8" />
      <pointLight position={[0, 2, -2]} intensity={1.1} color="#c8d8f0" />
      <pointLight position={[2, 0, 2]}  intensity={0.45} color="#8fb5c4" />
      <pointLight position={[-2, 1, 3]} intensity={0.35} color="#7fa882" distance={12} />

      {/* ── Night sky — drei Stars as dense deep-field backdrop ── */}
      {act === 0 && (
        <>
          <Stars
            radius={120}
            depth={60}
            count={6000}
            factor={4}
            saturation={0.1}
            fade
            speed={0.3}
          />
          <StarField opacity={1.0} mobile={mobile} />
        </>
      )}

      {/* Underwater lighting once submerged */}
      {act >= 1 && <UnderwaterLighting depth={submersionDepth} />}

      {/* Golden rim when facing camera (Act 2+) */}
      {act >= 2 && (
        <pointLight position={[0, 0, 2.5]} color="#c9a96e"
          intensity={0.3 + a2 * 0.5} distance={6} decay={2} />
      )}

      {/* ── Figure (wrapped in Caustics when underwater) ── */}
      {(act === 1 || act === 2) ? (
        <Caustics
          intensity={0.06}
          color="#8fb5c4"
          lightSource={[-2, 8, 2]}
          ior={1.4}
          frames={Infinity}
          causticsOnly={false}
          backside={false}
        >
          <Figure
            progress={progress}
            a1={a1} a2={a2} a3={a3} a5={a2}
            submersionDepth={submersionDepth}
          />
        </Caustics>
      ) : (
        <Figure
          progress={progress}
          a1={a1} a2={a2} a3={a3} a5={a2}
          submersionDepth={submersionDepth}
        />
      )}

      {/* ── BiolumiParticles — once underwater ── */}
      {(act === 1 || act === 2) && (
        <BiolumiParticles
          opacity={act === 1 ? a1 : 1}
          count={mobile ? 200 : 600}
        />
      )}

      {/* ── Bubbles — rise from figure during descent ── */}
      <Bubbles visible={act >= 1 && act <= 2} figureY={figureY} />

      {/* ── Water surface — visible at surface AND from below during descent ── */}
      <WaterPlane
        visible={act <= 1}
        distortion={1.8}
      />

      {/* ── Surface shimmer seen from below — during and after descent ── */}
      {/* Only show once camera is clearly below the water surface */}
      <SurfaceFromBelow visible={progress > 0.35 && progress < 0.75} />

    </>
  )
}

// ─── HERO OVERLAY ─────────────────────────────────────────────────────────────
// Title + CTA float over the canvas at Act 0, fade out as journey begins.

function HeroOverlay({ opacity }: { opacity: number }) {
  if (opacity < 0.01) return null

  return (
    <>
      {/* Top chrome */}
      <motion.div
        animate={{ opacity }}
        transition={{ duration: 0.4 }}
        style={{
          position:     'absolute',
          top:          'calc(72px + 20px)',
          left:         'clamp(20px, 3vw, 40px)',
          right:        'clamp(20px, 3vw, 40px)',
          zIndex:       10,
          pointerEvents: opacity < 0.05 ? 'none' : 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--sage)',
          }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: 'var(--sage)', opacity: 0.6 }} />
            psychological · social · professional
          </span>
          <span style={{
            fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--muted)', opacity: 0.7,
          }}>
            flowwithcurtana.com
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display, Georgia, serif)',
          fontSize:   'clamp(40px, 6vw, 88px)',
          fontWeight: 300,
          fontStyle:  'italic',
          color:      'var(--cream)',
          letterSpacing: '-2px',
          lineHeight: 1.0,
          margin:     0,
          textAlign:  'center',
        }}>
          Flow With Curtana
        </h1>
      </motion.div>

      {/* CTA */}
      <motion.div
        animate={{ opacity }}
        transition={{ duration: 0.4 }}
        style={{
          position:     'absolute',
          bottom:       96,
          left:         '50%',
          transform:    'translateX(-50%)',
          zIndex:       10,
          pointerEvents: opacity < 0.05 ? 'none' : 'auto',
          whiteSpace:   'nowrap',
        }}
      >
        <Link
          href="/contact"
          style={{
            display:         'inline-block',
            fontFamily:      'var(--font-body, sans-serif)',
            fontSize:        '13px',
            fontWeight:      400,
            letterSpacing:   '2.5px',
            textTransform:   'uppercase',
            color:           'var(--bg)',
            background:      'var(--sage)',
            padding:         '14px 40px',
            borderRadius:    '100px',
            textDecoration:  'none',
          }}
        >
          Work with me →
        </Link>
      </motion.div>

      {/* Bottom bar — breathing prompt */}
      <motion.div
        animate={{ opacity }}
        transition={{ duration: 0.4 }}
        style={{
          position:     'absolute',
          bottom:       0,
          left:         0,
          right:        0,
          height:       52,
          display:      'flex',
          flexDirection: 'column',
          alignItems:   'center',
          justifyContent: 'center',
          gap:          8,
          borderTop:    '1px solid var(--border)',
          pointerEvents: 'none',
          zIndex:       10,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-body, sans-serif)',
          fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)',
        }}>
          breathe — the journey begins
        </span>
        {/* Animated downward chevron */}
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'var(--sage)', opacity: 0.5, fontSize: 14, lineHeight: 1 }}
        >
          &#x2304;
        </motion.span>
      </motion.div>
    </>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function SubmersionJourney() {
  const tier   = useDeviceTier()
  const mobile = tier <= 1

  // ── Pure time-based auto-animation ─────────────────────────────────────────
  // No scroll hijack. After 2s hold on surface, character auto-follows the
  // invisible guide wire through the entire journey. Scroll is locked during
  // animation, then released when the journey completes.
  const HOLD_MS     = 2000   // time on surface before auto-advance starts
  const JOURNEY_MS  = 10000  // total journey animation time (10s)

  const [sceneProgress, setSceneProgress] = React.useState(0)
  const journeyDone  = React.useRef(false)
  const startTimeRef = React.useRef<number | null>(null)
  const rafRef       = React.useRef<number>(0)

  React.useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Lock scroll during the journey
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (reduced) {
      // Skip animation entirely
      setSceneProgress(1)
      journeyDone.current = true
      document.body.style.overflow = prevOverflow
      // Scroll past hero instantly for reduced-motion users
      setTimeout(() => {
        const wrap = document.getElementById('submersion-wrap')
        if (wrap) {
          window.scrollTo(0, wrap.offsetTop + wrap.offsetHeight)
        }
      }, 100)
      return
    }

    const tick = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts
      const elapsed = ts - startTimeRef.current

      if (elapsed <= HOLD_MS) {
        // Hold on surface
        setSceneProgress(0)
        window.dispatchEvent(new CustomEvent('journey-progress', { detail: { p: 0 } }))
      } else {
        const journeyElapsed = elapsed - HOLD_MS
        const t = Math.min(1, journeyElapsed / JOURNEY_MS)
        // Cinematic S-curve ease
        const p = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        setSceneProgress(p)

        // Broadcast progress for ambient audio
        window.dispatchEvent(new CustomEvent('journey-progress', { detail: { p } }))

        // Release scroll as the turn begins (p ~0.70) — page glides up
        // while she's still rotating. Animation continues on the fixed canvas.
        if (p >= 0.70 && !journeyDone.current) {
          journeyDone.current = true
          document.body.style.overflow = ''
          const wrap = document.getElementById('submersion-wrap')
          if (wrap) {
            setTimeout(() => window.dispatchEvent(
              new CustomEvent('smooth-scroll-to', {
                detail: { y: wrap.offsetTop + wrap.offsetHeight, duration: 2.0 }
              })
            ), 60)
          }
          // Don't return — keep the RAF running so scene progress
          // continues advancing to 1.0 on the fixed canvas
        }

        if (t >= 1) return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (!journeyDone.current) document.body.style.overflow = prevOverflow
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const acts = useActProgress(sceneProgress)

  const heroOpacity = Math.max(0, 1 - sceneProgress / 0.12)

  return (
    <>
      {/* ── Fixed 3D Canvas — stays visible behind all page content ── */}
      <div
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        0,
          pointerEvents: 'none',
        }}
      >
        <Canvas
          style={{ width: '100%', height: '100%', display: 'block' }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.8, 6], fov: 55, near: 0.1, far: 2000 }}
          scene={{ background: new THREE.Color('#0d0f0e') }}
          gl={{
            antialias:           false,
            powerPreference:     'high-performance',
            toneMapping:         THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.8,
            outputColorSpace:    THREE.SRGBColorSpace,
          }}
        >
          <Suspense fallback={null}>
            <Scene progress={sceneProgress} />
          </Suspense>
        </Canvas>

      </div>

      {/* ── Spacer — holds page height so content below lands correctly after journey ── */}
      <div
        id="submersion-wrap"
        style={{ height: '100vh', position: 'relative', zIndex: 1 }}
      >
        <div
          style={{
            position: 'sticky',
            top:      0,
            height:   '100vh',
            zIndex:   1,
            overflow: 'hidden',
          }}
        >
          {/* ── Hero overlay (fades with scroll) ── */}
          <HeroOverlay opacity={heroOpacity} />
        </div>
      </div>
    </>
  )
}
