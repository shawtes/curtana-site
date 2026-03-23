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

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import StarField from './StarField'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { useScrollProgress }       from '@/hooks/useScrollProgress'
import { useActProgress }          from '@/hooks/useActProgress'
import { useDeviceTier }           from '@/hooks/useDeviceTier'
import { RyJeaneCharacter, UnderwaterLighting } from './RyJeaneCharacter'
import WaterPlane                  from './WaterPlane'
import TorusRings                  from './TorusRings'
import BiolumiParticles            from './BiolumiParticles'
import WarpStreaks                  from './WarpStreaks'
import JourneyChapters             from './JourneyChapters'
import WhiteFlash                  from '@/components/ui/WhiteFlash'

// ─── SHARED COLORS ────────────────────────────────────────────────────────────
const SAGE  = new THREE.Color('#7fa882')
const GOLD  = new THREE.Color('#c9a96e')
const WHITE = new THREE.Color('#ffffff')
const DARK  = new THREE.Color('#0d1210')

// ─── BREATH EASE ──────────────────────────────────────────────────────────────
const BREATH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ─── FIGURE WRAPPER ───────────────────────────────────────────────────────────
// Handles position, rotation, scale changes across all acts.
// RyJeaneCharacter inside handles textures/materials/hair.

function Figure({
  progress,
  a1, a2, a3, a5,
  submersionDepth,
}: {
  progress:        number
  a1: number; a2: number; a3: number; a5: number
  submersionDepth: number
}) {
  const groupRef   = useRef<THREE.Group>(null)
  const prevProg   = useRef(progress)
  const tumbleX    = useRef(0)
  const tumbleZ    = useRef(0)
  const turnY      = useRef(0)  // accumulated Y rotation for Act 5 turn

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t     = clock.elapsedTime
    const breath = Math.sin(t * 0.45) * 0.008

    // Track scroll delta for tumble
    const delta  = progress - prevProg.current
    prevProg.current = progress

    if (progress < 0.15) {
      // Act 0: lotus pose, seated, subtle breath
      groupRef.current.position.set(0, -0.8, 0)
      groupRef.current.rotation.set(0, 0, 0)
      groupRef.current.scale.setScalar(0.011 * (1 + breath))
      tumbleX.current = 0
      tumbleZ.current = 0

    } else if (progress < 0.28) {
      // Act 1: descend from -0.8 → -5.0
      const figY = THREE.MathUtils.lerp(-0.8, -5.0, a1)
      groupRef.current.position.set(0, figY, 0)
      groupRef.current.rotation.set(0, 0, 0)
      groupRef.current.scale.setScalar(0.011 * (1 + breath))
      tumbleX.current = 0
      tumbleZ.current = 0

    } else if (progress < 0.45) {
      // Act 2: tumble driven by scroll delta
      const eased = 1  // cubic-bezier applied at act-level
      tumbleX.current += delta * 0.8 * eased
      tumbleZ.current += delta * 0.3 * eased
      groupRef.current.rotation.x = tumbleX.current
      groupRef.current.rotation.z = tumbleZ.current
      // Subtle breath scale even while tumbling
      groupRef.current.scale.setScalar(0.011 * (0.85 + Math.sin(t * 0.3) * 0.04))

    } else if (progress < 0.62) {
      // Act 3: stills — lerp rotation back to 0
      const stillPct = Math.min(1, a3 / 0.4)
      tumbleX.current *= (1 - stillPct * 0.12)
      tumbleZ.current *= (1 - stillPct * 0.12)
      groupRef.current.rotation.x = tumbleX.current
      groupRef.current.rotation.z = tumbleZ.current
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.scale.setScalar(0.011 * (1 + breath))

    } else if (progress < 0.78) {
      // Act 4: perfectly still, back-facing
      groupRef.current.rotation.set(0, 0, 0)
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.scale.setScalar(0.011 * (1 + breath))
      tumbleX.current = 0
      tumbleZ.current = 0

    } else if (progress < 0.92) {
      // Act 5: The Turn — rotate π on Y axis
      // Target = a5 * Math.PI (0 = back-facing, Math.PI = front-facing)
      turnY.current = THREE.MathUtils.lerp(turnY.current, a5 * Math.PI, 0.04)
      groupRef.current.rotation.set(0, turnY.current, 0)
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.scale.setScalar(0.011 * (1 + breath))

    } else {
      // Act 6: front-facing, scale up slightly with bloom
      groupRef.current.rotation.set(0, Math.PI, 0)
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.scale.setScalar(0.011 * (1 + breath))
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
      const radius = Math.max(0, Math.sin(b.life * Math.PI)) * (0.015 + Math.random() * 0.005)
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
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side:        THREE.BackSide,
    transparent: true,
    depthWrite:  false,
    uniforms: {
      topColor:    { value: new THREE.Color(0x0d0f0e) },  // sky — exact match to --bg
      bottomColor: { value: new THREE.Color(0x0a1214) },  // water color
    },
    vertexShader:   HORIZON_VERT,
    fragmentShader: HORIZON_FRAG,
  }), [])

  if (!visible) return null

  return (
    <mesh position={[0, -2, 0]} renderOrder={-1} material={mat}>
      <cylinderGeometry args={[500, 500, 40, 64, 1, true]} />
    </mesh>
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
// Breath-paced lerp factors: camZ × 0.025, camY × 0.02 (spec requirement).

function CameraRig({
  progress, a1, a2, a3, a4, a5,
  figureY,
}: {
  progress: number
  a1: number; a2: number; a3: number; a4: number; a5: number
  figureY: number
}) {
  const { camera } = useThree()
  const targetPos  = useRef(new THREE.Vector3(0, 1.2, 5))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))
  const curLook    = useRef(new THREE.Vector3(0, 0, 0))
  const camRotZ    = useRef(0)
  const prevProg   = useRef(progress)

  useFrame(() => {
    const delta = progress - prevProg.current
    prevProg.current = progress

    if (progress < 0.15) {
      // Act 0: low eye-level over water surface — camera close to water
      targetPos.current.set(0, 1.8, 6)
      targetLook.current.set(0, 0.3, 0)

    } else if (progress < 0.28) {
      // Act 1: camera descends with figure, pulls forward slightly
      targetPos.current.set(
        0,
        THREE.MathUtils.lerp(1.8, -3.5, a1),
        THREE.MathUtils.lerp(6.0, 3.0, a1),
      )
      targetLook.current.set(0, figureY + 1, 0)

    } else if (progress < 0.45) {
      // Act 2: offset from figure, tumbling camera
      targetPos.current.set(
        figureY * 0.1 + 0.6,
        figureY + 0.3,
        2.5,
      )
      targetLook.current.set(0, figureY, 0)
      camRotZ.current += delta * 0.15

    } else if (progress < 0.62) {
      // Act 3: locks forward, moves up to center
      camRotZ.current *= 0.95   // decay camera tumble
      targetPos.current.set(0, figureY + 0.5, 3.5)
      targetLook.current.set(0, figureY, 0)

    } else if (progress < 0.78) {
      // Act 4: rush toward figure
      camRotZ.current *= 0.9
      targetPos.current.set(0, 0, THREE.MathUtils.lerp(3.5, 0.8, a4))
      targetLook.current.set(0, 0, 0)

    } else if (progress < 0.92) {
      // Act 5: maintain position, face revealed
      targetPos.current.set(0, 0, 2.0)
      targetLook.current.set(0, 0.5, 0)

    } else {
      // Act 6: pull back slightly for the bloom
      targetPos.current.set(0, 0, 3.0)
      targetLook.current.set(0, 0, 0)
    }

    // Breath-paced lerp from spec: 0.025 for Z, 0.02 for Y
    const cp = camera.position
    cp.x += (targetPos.current.x - cp.x) * 0.025
    cp.y += (targetPos.current.y - cp.y) * 0.02
    cp.z += (targetPos.current.z - cp.z) * 0.025

    curLook.current.lerp(targetLook.current, 0.025)
    camera.lookAt(curLook.current)

    // Decay camera Z rotation (from Act 2 tumble) via camera matrix
    camera.rotation.z += (0 - camera.rotation.z) * 0.05
  })

  return null
}

// ─── SCENE BACKGROUND ─────────────────────────────────────────────────────────

function SceneBackground({ progress, a1, a6 }: { progress: number; a1: number; a6: number }) {
  const { scene, camera } = useThree()

  useFrame(() => {
    // Underwater: camera below y = -1.8
    const depth = Math.max(0, -1.8 - camera.position.y)
    if (depth > 0.05 && progress < 0.45) {
      const t = Math.min(1, depth / 8)
      scene.background = new THREE.Color('#0d2a4a').lerp(new THREE.Color('#020810'), t)
      return
    }

    if (progress < 0.15)      scene.background = DARK.clone()
    else if (progress < 0.28) scene.background = DARK.clone().lerp(new THREE.Color('#000000'), a1)
    else if (progress < 0.45) scene.background = new THREE.Color('#010306')
    else if (progress < 0.62) scene.background = new THREE.Color('#030508')
    else if (progress < 0.78) scene.background = new THREE.Color('#040310')
    else if (progress < 0.92) scene.background = new THREE.Color('#050310').lerp(new THREE.Color('#0d0f0e'), a6)
    else                       scene.background = new THREE.Color('#0d0f0e').lerp(WHITE, a6 * a6)
  })

  return null
}

// ─── UNDERWATER FOG ───────────────────────────────────────────────────────────

function UnderwaterFog({ progress, a1, a2, a3 }: { progress: number; a1: number; a2: number; a3: number }) {
  const { scene, camera } = useThree()

  useFrame(() => {
    const depth = Math.max(0, -1.8 - camera.position.y)

    if (depth > 0.05 && progress < 0.62) {
      // Underwater fog — deepens with submersion
      const t        = Math.min(1, depth / 10)
      const density  = Math.min(0.12, depth * 0.014 + a2 * 0.04)
      const fogColor = new THREE.Color('#0d2a4a').lerp(new THREE.Color('#020510'), t)
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(fogColor)
        scene.fog.density = density
      } else {
        scene.fog = new THREE.FogExp2(fogColor.getHex(), density)
      }
    } else if (progress < 0.15) {
      // Act 0 surface — light horizon fog blends water edge into sky
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

// ─── THREE-LAYER PARTICLE DEPTH SYSTEM ───────────────────────────────────────
// Three depth layers as specified in Act 00 surface scene.

// Dust motes / pollen on the water surface — natural, no green
function DepthParticles({ visible, mobile }: { visible: boolean; mobile: boolean }) {
  if (!visible) return null

  const scale = mobile ? 0.4 : 1

  return (
    <group>
      {/* Layer 1 — close water-surface dust motes, pale cream */}
      <Sparkles
        count={Math.round(120 * scale)}
        scale={3}
        size={1.8}
        speed={0.12}
        color="#e8dfc8"
        opacity={0.30}
      />
      {/* Layer 2 — mid distance, cool silver-white */}
      <Sparkles
        count={Math.round(400 * scale)}
        scale={9}
        size={0.9}
        speed={0.07}
        color="#c8d8e8"
        opacity={0.18}
      />
      {/* Layer 3 — far, near-invisible atmosphere shimmer */}
      <Sparkles
        count={Math.round(200 * scale)}
        scale={20}
        size={0.4}
        speed={0.03}
        color="#a0b8cc"
        opacity={0.10}
      />
    </group>
  )
}

// ─── SCENE ROOT ───────────────────────────────────────────────────────────────

function Scene({ progress }: { progress: number }) {
  const tier   = useDeviceTier()
  const mobile = tier <= 1
  const acts   = useActProgress(progress)
  const { act, a1, a2, a3, a4, a5, a6 } = acts

  // figureY: descends in Acts 1–2
  const figureY = act < 1 ? -0.8 :
    act === 1 ? THREE.MathUtils.lerp(-0.8, -5.0, a1) :
    act === 2 ? -5.0 : 0

  // submersionDepth: 0 on surface → 1 fully submerged
  const submersionDepth =
    act < 1  ? 0 :
    act === 1 ? a1 :
    act === 2 ? 1 :
    act === 3 ? THREE.MathUtils.lerp(1, 0, a3) : 0

  const bioCount = mobile ? 200 : 600

  return (
    <>
      <SceneBackground progress={progress} a1={a1} a6={a6} />
      <CameraRig progress={progress} a1={a1} a2={a2} a3={a3} a4={a4} a5={a5} figureY={figureY} />
      <UnderwaterFog progress={progress} a1={a1} a2={a2} a3={a3} />

      {/* ── Lighting ── */}
      <ambientLight intensity={0.18} color="#e8ede9" />
      <directionalLight position={[-2, 4, 3]} intensity={0.4} color="#c8b89a" />
      {/* Replaced sage-green fill with neutral blue-white moonlight */}
      <pointLight position={[0, 2, -2]} intensity={0.6} color="#c8d8f0" />
      <pointLight position={[2, 0, 2]}  intensity={0.20} color="#8fb5c4" />

      {/* Top light during submersion */}
      {(act === 1 || act === 2) && (
        <pointLight position={[0, 4, 2]} intensity={2.5} color={WHITE} distance={14} />
      )}
      {/* Act 4: golden rim from front */}
      {act === 4 && (
        <pointLight
          position={[0, 0, 2.5]}
          color="#c9a96e"
          intensity={0.3 + a4 * 0.4}
          distance={6}
          decay={2}
        />
      )}
      {/* Underwater rig (Acts 1–2) */}
      {(act === 1 || act === 2) && (
        <UnderwaterLighting depth={submersionDepth} />
      )}
      <PalmGlow act5Progress={a5} act6Progress={a6} />

      {/* ── Stars: Act 0–1 — 3-layer realistic night sky with scroll fade ── */}
      {act <= 1 && (
        <StarField
          opacity={act === 0 ? 1.0 : Math.max(0, 1.0 - a1 * 7)}
          mobile={mobile}
        />
      )}

      {/* ── Horizon gradient: Act 0 — blends water plane into sky ── */}
      <HorizonGradient visible={act === 0} />

      {/* ── Surface particles: Acts 0–1 ── */}
      <DepthParticles visible={act <= 1} mobile={mobile} />

      {/* ── Figure ── */}
      <Figure
        progress={progress}
        a1={a1} a2={a2} a3={a3} a5={a5}
        submersionDepth={submersionDepth}
      />

      {/* ── Water surface ── */}
      <WaterPlane
        visible={act <= 1}
        distortion={act === 1 ? 1.2 + a1 * 3.5 : 1.2}
      />

      {/* ── Surface from below + bubbles: Acts 1–2 ── */}
      <SurfaceFromBelow visible={act === 1 || act === 2} />
      <Bubbles
        visible={act === 1 && a1 > 0.1}
        figureY={figureY}
      />

      {/* ── Bioluminescent particles: Act 2 ── */}
      {(act === 2 || (act === 3 && a3 < 0.3)) && (
        <BiolumiParticles
          opacity={act === 2 ? a2 : THREE.MathUtils.lerp(1, 0, a3 / 0.3)}
          count={bioCount}
        />
      )}

      {/* ── Torus portal rings: Acts 3–5 ── */}
      <TorusRings act3Progress={a3} act4Progress={a4} act5Progress={a5} />

      {/* ── Sacred geometry wireframes: Act 3 ── */}
      <SacredGeo act3Progress={a3} />

      {/* ── Warp streaks canvas overlay: Act 4 ── */}
      {(act === 4 || (act === 5 && a5 < 0.3)) && (
        <WarpStreaks progress={progress} acts={acts} mobile={mobile} />
      )}

      {/* ── Post-processing ── */}
      <EffectComposer>
        <Bloom
          intensity={act >= 5 ? 2.0 + a6 * 2.0 : act <= 2 ? 1.2 : 0.8}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[
            act === 4 ? 0.003 : 0.001,
            act === 4 ? 0.003 : 0.001,
          ]}
        />
        <Vignette offset={0.38} darkness={0.65} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
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
            yoga · breathwork · movement
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
          href="/book"
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
          Begin your practice →
        </Link>
      </motion.div>

      {/* Bottom bar */}
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
          alignItems:   'center',
          justifyContent: 'center',
          gap:          14,
          borderTop:    '1px solid var(--border)',
          pointerEvents: 'none',
          zIndex:       10,
        }}
      >
        <span style={{ color: 'var(--sage)', opacity: 0.5, fontSize: 12 }}>+</span>
        <span style={{
          fontFamily: 'var(--font-body, sans-serif)',
          fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)',
        }}>
          scroll to explore
        </span>
        <span style={{ color: 'var(--sage)', opacity: 0.5, fontSize: 12 }}>+</span>
      </motion.div>
    </>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function SubmersionJourney() {
  const { containerRef, progress } = useScrollProgress()
  const acts                       = useActProgress(progress)
  const tier                       = useDeviceTier()
  const mobile                     = tier <= 1

  const heroOpacity    = Math.max(0, 1 - progress / 0.12)
  const whiteFlashOpacity = acts.a6 > 0.7 ? (acts.a6 - 0.7) / 0.3 : 0

  return (
    <div
      ref={containerRef}
      id="submersion-wrap"
      style={{ height: '800vh', position: 'relative' }}
    >
      <div
        style={{
          position:   'sticky',
          top:        0,
          height:     '100vh',
          background: 'var(--bg)',
          zIndex:     1,
          overflow:   'hidden',
        }}
      >
        {/* ── 3D Canvas ── */}
        <div
          style={{
            position:     'absolute',
            top:          72,
            left:         'clamp(12px, 1.5vw, 20px)',
            right:        'clamp(12px, 1.5vw, 20px)',
            bottom:       52,
            borderRadius: 18,
            overflow:     'hidden',
          }}
        >
          <Canvas
            style={{ width: '100%', height: '100%', display: 'block' }}
            camera={{ position: [0, 1.8, 6], fov: 55, near: 0.1, far: 2000 }}
            gl={{
              antialias:           true,
              toneMapping:         THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
              outputColorSpace:    THREE.SRGBColorSpace,
            }}
          >
            <Suspense fallback={null}>
              <Scene progress={progress} />
            </Suspense>
          </Canvas>

          {/* ── Warp streaks canvas overlay ── */}
          <WarpStreaks progress={progress} acts={acts} mobile={mobile} />

          {/* ── Chapter text overlays ── */}
          <JourneyChapters progress={progress} />

          {/* ── White bloom ── */}
          <WhiteFlash opacity={whiteFlashOpacity} />
        </div>

        {/* ── Hero overlay (fades with scroll) ── */}
        <HeroOverlay opacity={heroOpacity} />
      </div>
    </div>
  )
}
