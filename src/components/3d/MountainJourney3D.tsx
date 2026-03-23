'use client'

/**
 * MountainJourney3D — Cinematic 3D scroll experience.
 *
 * Acts:
 *   0 (0.00→0.10)  Hero — white stick figure meditating above black water
 *   1 (0.10→0.22)  The Fall — figure tips forward, rushes toward camera, submerges
 *   2 (0.22→0.32)  The Dive — camera moves overhead, watches figure descend into void
 *   3 (0.32→0.50)  Hyperspace — wireframe geometry; figure arrives at center
 *   4 (0.50→0.63)  Mandala — torus rings, warm amber
 *   5 (0.63→0.74)  Chakra Bloom — golden rays + orbiting orbs
 *   6 (0.74→0.87)  Mountain Arrival — layered peaks + aurora
 *   7 (0.87→1.00)  The Turn — figure faces you, white portal
 */

import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles, Float, useTexture } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { RyJeaneCharacter, UnderwaterLighting } from './RyJeaneCharacter'
import SummitScene from './SummitScene'

interface Props { scrollProgress: number }

// ─────────────────────────────────────────────
// ACT HELPERS
// ─────────────────────────────────────────────

const ACTS = {
  A0: [0.00, 0.10] as [number, number],
  A1: [0.10, 0.22] as [number, number],
  A2: [0.22, 0.32] as [number, number],
  A3: [0.32, 0.50] as [number, number],
  A4: [0.50, 0.63] as [number, number],
  A5: [0.63, 0.74] as [number, number],
  A6: [0.74, 0.87] as [number, number],
  A7: [0.87, 1.00] as [number, number],
}

function ap(p: number, [s, e]: [number, number]) {
  return Math.min(1, Math.max(0, (p - s) / (e - s)))
}

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────

const SAGE    = new THREE.Color('#7fa882')
const SAGE_LT = new THREE.Color('#a8c5aa')
const GOLD    = new THREE.Color('#c9a96e')
const DARK    = new THREE.Color('#0d1210')
const WHITE   = new THREE.Color('#ffffff')

// ─────────────────────────────────────────────
// 3D STICK FIGURE — white, from bone pairs
// ─────────────────────────────────────────────

// FBX scale: model is in centimeters, convert to meters
// Adjust MODEL_SCALE if the figure appears too big or small
const MODEL_SCALE = 0.011

function MeditationModel({ progress, facing = false }: { progress: number; facing?: boolean }) {
  const groupRef  = useRef<THREE.Group>(null)
  const fallPhase = ap(progress, ACTS.A1)
  const sinkPhase = fallPhase > 0.65 ? (fallPhase - 0.65) / 0.35 : 0
  const act2Phase = ap(progress, ACTS.A2)

  // submersionDepth: 0 on surface, ramps to 1 as figure sinks through Acts 1–2
  const submersionDepth =
    progress < ACTS.A1[0] ? 0 :
    progress < ACTS.A2[0] ? sinkPhase :
    progress < ACTS.A3[0] ? Math.min(1, 0.5 + act2Phase * 0.5) : 0

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const breath = Math.sin(clock.elapsedTime * 0.65) * 0.008

    if (progress >= ACTS.A1[0] && progress < ACTS.A2[0]) {
      groupRef.current.rotation.x = -fallPhase * Math.PI * 0.50
      groupRef.current.rotation.y = 0
      groupRef.current.position.z = 0
      groupRef.current.position.y = -sinkPhase * 1.4
      groupRef.current.scale.setScalar(MODEL_SCALE * (1 + breath))

    } else if (progress >= ACTS.A2[0] && progress < ACTS.A3[0]) {
      groupRef.current.rotation.x = -Math.PI * 0.50
      groupRef.current.rotation.y = 0
      groupRef.current.position.z = 0
      groupRef.current.position.y = -1.4 - act2Phase * 7.0
      groupRef.current.scale.setScalar(MODEL_SCALE * (1 + breath))

    } else if (progress >= ACTS.A3[0]) {
      groupRef.current.rotation.x = 0
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.scale.setScalar(MODEL_SCALE * (0.9 + breath))
      if (progress >= ACTS.A7[0]) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y, facing ? Math.PI : 0, 0.05
        )
      } else {
        groupRef.current.rotation.y = 0
      }

    } else {
      groupRef.current.rotation.x = 0
      groupRef.current.rotation.y = 0
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.scale.setScalar(MODEL_SCALE * (1 + breath))
    }
  })

  return (
    <group ref={groupRef}>
      {/*
        RyJeaneCharacter handles texture loading, PBR materials,
        underwater dynamics, hair particles, and body sway.
        The outer groupRef handles fall/sink/facing animation.
      */}
      <RyJeaneCharacter submersionDepth={submersionDepth} />
    </group>
  )
}

// ─────────────────────────────────────────────
// WATER SURFACE — Three.js Water shader
// Uses waternormals.jpg for animated ripple normals.
// Present from Act 0, hides after Act 2.
// ─────────────────────────────────────────────

function WaterSurface({ progress }: { progress: number }) {
  const waterRef = useRef<Water | null>(null)
  const groupRef = useRef<THREE.Group>(null)

  const normals = useTexture('/textures/waternormals.jpg')
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping

  // Build Water once
  useEffect(() => {
    const geom = new THREE.PlaneGeometry(40, 40)
    const water = new Water(geom, {
      textureWidth:    512,
      textureHeight:   512,
      waterNormals:    normals,
      sunDirection:    new THREE.Vector3(0, 1, 0),
      sunColor:        0xffffff,
      waterColor:      0x000000,   // black water
      distortionScale: 2.5,        // subtle ripple
      fog:             false,
      alpha:           0.98,
    })
    water.rotation.x = -Math.PI / 2
    waterRef.current = water

    if (groupRef.current) groupRef.current.add(water)

    return () => {
      if (groupRef.current) groupRef.current.remove(water)
      geom.dispose()
      water.material.dispose()
      waterRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normals])

  // Tick water time uniform each frame
  useFrame(({ clock }) => {
    if (!waterRef.current) return
    const u = waterRef.current.material.uniforms
    if (u.time) u.time.value = clock.elapsedTime * 0.5

    // Ripple intensity: calm → stirred as figure falls
    const dist = progress < ACTS.A1[0]
      ? 1.5
      : Math.min(5.0, 1.5 + ap(progress, ACTS.A1) * 3.5)
    if (u.distortionScale) u.distortionScale.value = dist
  })

  const hideAfter = ACTS.A3[0]
  if (progress >= hideAfter) return null

  return <group ref={groupRef} position={[0, -0.55, 0]} />
}

// ─────────────────────────────────────────────
// HYPERSPACE — wireframe spinning (Act 3)
// ─────────────────────────────────────────────

function HyperspaceGeo({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const lp = ap(progress, ACTS.A3)

  useFrame(({ clock }) => {
    if (!groupRef.current || lp < 0.01) return
    groupRef.current.rotation.x = clock.elapsedTime * 0.35
    groupRef.current.rotation.y = clock.elapsedTime * 0.52
    groupRef.current.rotation.z = clock.elapsedTime * 0.21
  })

  if (lp < 0.01) return null

  return (
    <group ref={groupRef}>
      {[1.2, 1.9, 2.7, 3.6].map((r, i) => (
        <mesh key={i}>
          <icosahedronGeometry args={[r, i < 2 ? 1 : 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? SAGE : '#8fb5c4'}
            emissive={i % 2 === 0 ? SAGE : '#8fb5c4'}
            emissiveIntensity={0.7 - i * 0.1}
            wireframe
            transparent
            opacity={Math.max(0, lp * (0.9 - i * 0.18))}
          />
        </mesh>
      ))}
      <Sparkles count={60} scale={7} size={2} speed={0.4} color={SAGE_LT} opacity={lp * 0.5} />
    </group>
  )
}

// ─────────────────────────────────────────────
// MANDALA — torus rings (Act 4)
// ─────────────────────────────────────────────

function MandalaRings({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const lp = ap(progress, ACTS.A4)

  useFrame(({ clock }) => {
    if (!groupRef.current || lp < 0.01) return
    groupRef.current.rotation.z = clock.elapsedTime * 0.25
    groupRef.current.children.forEach((child, i) => {
      child.rotation.x = clock.elapsedTime * (0.2 + i * 0.1) * (i % 2 === 0 ? 1 : -1)
      child.rotation.y = clock.elapsedTime * (0.15 + i * 0.08)
    })
  })

  if (lp < 0.01) return null

  return (
    <group ref={groupRef}>
      {[0.6, 1.0, 1.5, 2.0, 2.6].map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r, 0.025 + i * 0.008, 8, 80]} />
          <meshStandardMaterial
            color={i < 2 ? GOLD : '#c8b89a'}
            emissive={i < 2 ? GOLD : SAGE}
            emissiveIntensity={0.8 - i * 0.1}
            transparent
            opacity={Math.max(0, lp * (1 - i * 0.15))}
          />
        </mesh>
      ))}
      <Sparkles count={80} scale={4} size={1.5} speed={0.6} color={GOLD} opacity={lp * 0.7} />
    </group>
  )
}

// ─────────────────────────────────────────────
// CHAKRA BLOOM — rays + orbiting orbs (Act 5)
// ─────────────────────────────────────────────

function ChakraBloom({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const orbsRef  = useRef<THREE.Group>(null)
  const lp = ap(progress, ACTS.A5)

  const orbPositions = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2
      return [Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0] as [number, number, number]
    }), [])

  useFrame(({ clock }) => {
    if (!orbsRef.current || lp < 0.01) return
    orbsRef.current.rotation.z = clock.elapsedTime * 0.4
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.15
  })

  if (lp < 0.01) return null

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.4, 20, 20]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={3 * lp} transparent opacity={lp * 0.9} />
      </mesh>
      <group ref={orbsRef}>
        {orbPositions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.07 + (i % 3) * 0.02, 8, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? GOLD : '#c8b89a'} emissive={GOLD} emissiveIntensity={1.5} />
          </mesh>
        ))}
      </group>
      <Sparkles count={120} scale={5} size={2.5} speed={0.8} color={GOLD} opacity={lp * 0.9} />
    </group>
  )
}

// ─────────────────────────────────────────────
// MOUNTAIN SCENE (Act 6)
// ─────────────────────────────────────────────

function AuroraRibbon({ color, yOffset, phase, lp }: { color: string; yOffset: number; phase: number; lp: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.position.y = yOffset + Math.sin(clock.elapsedTime * 0.5 + phase) * 0.15
    meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3 + phase) * 0.05
  })

  return (
    <mesh ref={meshRef} position={[0, yOffset, -3]}>
      <planeGeometry args={[18, 0.35, 30, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.9}
        transparent
        opacity={lp * 0.55}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function MountainScene({ progress }: { progress: number }) {
  const lp = ap(progress, ACTS.A6)
  if (lp < 0.01) return null

  const AURORA_COLORS = ['#7fa882', '#a8c5aa', '#8fb5c4', '#99c4a0', '#7db8a8']

  return (
    <group>
      <mesh>
        <sphereGeometry args={[30, 16, 16]} />
        <meshStandardMaterial color="#050e18" side={THREE.BackSide} />
      </mesh>
      {[
        { y: -1.8, z: -4, color: '#0d1a2a', scale: 12, height: 3.5 },
        { y: -1.5, z: -2.5, color: '#0f2035', scale: 9, height: 2.8 },
        { y: -1.2, z: -1, color: '#152840', scale: 7, height: 2.2 },
      ].map((m, i) => (
        <mesh key={i} position={[0, m.y, m.z]}>
          <coneGeometry args={[m.scale, m.height, 3]} />
          <meshStandardMaterial color={m.color} emissive={SAGE} emissiveIntensity={0.02 * lp} />
        </mesh>
      ))}
      {AURORA_COLORS.map((color, i) => (
        <AuroraRibbon key={i} color={color} yOffset={0.5 + i * 0.4} phase={i * 1.2} lp={lp} />
      ))}
      <Stars radius={20} depth={10} count={2000} factor={2} fade />
    </group>
  )
}

// ─────────────────────────────────────────────
// WHITE PORTAL (Act 7)
// ─────────────────────────────────────────────

function WhitePortal({ progress }: { progress: number }) {
  const lp = ap(progress, ACTS.A7)
  const portalRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!portalRef.current) return
    const mat = portalRef.current.material as THREE.MeshStandardMaterial
    mat.opacity = Math.min(1, lp * 1.5)
    mat.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 2) * 0.2
  })

  if (lp < 0.01) return null

  return (
    <mesh ref={portalRef} position={[0, 0.5, -1]}>
      <circleGeometry args={[lp * 3, 40]} />
      <meshStandardMaterial
        color="#f5f0e8"
        emissive={WHITE}
        emissiveIntensity={2}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// CAMERA RIG
// ─────────────────────────────────────────────

function CameraRig({ progress }: { progress: number }) {
  const { camera } = useThree()
  const targetPos   = useRef(new THREE.Vector3(0, 2.2, 4.5))
  const targetLook  = useRef(new THREE.Vector3(0, 0.7, 0))
  const currentLook = useRef(new THREE.Vector3(0, 0.7, 0))

  const fallPhase = ap(progress, ACTS.A1)
  const sinkPhase = fallPhase > 0.65 ? (fallPhase - 0.65) / 0.35 : 0
  const act2Phase = ap(progress, ACTS.A2)

  useFrame(() => {
    if (progress < 0.10) {
      // Act 0: at figure's torso level — water visible, figure centred
      targetPos.current.set(0, 0.9, 3.8)
      targetLook.current.set(0, 0.8, 0)

    } else if (progress < 0.22) {
      // Act 1: stay at torso level, watch figure tip AWAY from you.
      // As it sinks, camera descends with it so you always see its back.
      const figureY = -sinkPhase * 1.4
      targetPos.current.set(0, figureY + 0.9, 3.8)
      targetLook.current.set(0, figureY + 0.6, 0)

    } else if (progress < 0.32) {
      // Act 2: camera follows figure straight down, always aimed at its back.
      // Figure moves faster → gets progressively further away (smaller).
      const figureY = -1.4 - act2Phase * 7.0
      targetPos.current.set(0, figureY + 1.8, 3.8)
      targetLook.current.set(0, figureY + 0.5, 0)

    } else if (progress < 0.50) {
      // Act 3: come around in front of figure at center
      const lp = ap(progress, ACTS.A3)
      targetPos.current.set(0, THREE.MathUtils.lerp(-6, 0, lp), THREE.MathUtils.lerp(4.5, 5, lp))
      targetLook.current.set(0, 0, 0)

    } else if (progress < 0.74) {
      // Acts 4-5: centered, pull in slightly
      const lp = ap(progress, [0.50, 0.74])
      targetPos.current.set(0, 0, 4.5 - lp * 1.5)
      targetLook.current.set(0, 0, 0)

    } else if (progress < 0.87) {
      // Act 6: SummitScene handles its own orbit — CameraRig does nothing
      return

    } else {
      // Act 7: face-to-face
      const lp = ap(progress, ACTS.A7)
      targetPos.current.set(0, 1.0 + lp * 0.4, 3.5 - lp * 0.5)
      targetLook.current.set(0, 0.8, 0)
    }

    camera.position.lerp(targetPos.current, 0.055)
    currentLook.current.lerp(targetLook.current, 0.055)
    camera.lookAt(currentLook.current.x, currentLook.current.y, currentLook.current.z)
  })

  return null
}

// ─────────────────────────────────────────────
// SCENE BACKGROUND COLOR
// ─────────────────────────────────────────────

function SceneBackground({ progress }: { progress: number }) {
  const { scene, camera } = useThree()

  useFrame(() => {
    // When camera is below water surface, show underwater blue gradient
    const depth = Math.max(0, -0.55 - camera.position.y)
    if (depth > 0.05) {
      const t = Math.min(1, depth / 10)
      scene.background = new THREE.Color('#0d2a4a').lerp(new THREE.Color('#020510'), t)
      return
    }

    if (progress < 0.10) {
      scene.background = DARK.clone()
    } else if (progress < 0.32) {
      scene.background = DARK.clone().lerp(new THREE.Color('#000000'), ap(progress, ACTS.A1))
    } else if (progress < 0.50) {
      scene.background = new THREE.Color('#030508')
    } else if (progress < 0.63) {
      scene.background = new THREE.Color('#0a0805')
    } else if (progress < 0.74) {
      scene.background = new THREE.Color('#100c04')
    } else if (progress < 0.87) {
      scene.background = new THREE.Color('#050e18')
    } else {
      const lp = ap(progress, ACTS.A7)
      scene.background = new THREE.Color('#050e18').lerp(new THREE.Color('#f5f0e8'), lp * lp)
    }
  })

  return null
}

// ─────────────────────────────────────────────
// UNDERWATER ENVIRONMENT
// Activates when camera crosses y = -0.55 (water surface).
// Manages scene fog — density grows with depth.
// ─────────────────────────────────────────────

function UnderwaterEnv({ progress }: { progress: number }) {
  const { scene, camera } = useThree()

  useFrame(() => {
    const depth = Math.max(0, -0.55 - camera.position.y)

    if (depth > 0.05 && progress < ACTS.A3[0]) {
      const t       = Math.min(1, depth / 10)
      const density = Math.min(0.10, depth * 0.014)
      const fogColor = new THREE.Color('#0d2a4a').lerp(new THREE.Color('#020510'), t)

      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(fogColor)
        scene.fog.density = density
      } else {
        scene.fog = new THREE.FogExp2(fogColor.getHex(), density)
      }
    } else {
      scene.fog = null
    }
  })

  return null
}

// ─────────────────────────────────────────────
// BUBBLES — rising while submerged (Acts 1–2)
// ─────────────────────────────────────────────

const BUBBLE_COUNT = 60

function Bubbles({ progress }: { progress: number }) {
  const meshRef  = useRef<THREE.InstancedMesh>(null)
  const dummy    = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(() =>
    Array.from({ length: BUBBLE_COUNT }, () => ({
      x:      (Math.random() - 0.5) * 7,
      z:      (Math.random() - 0.5) * 7,
      startY: -0.6 - Math.random() * 9,
      speed:  0.25 + Math.random() * 0.7,
      phase:  Math.random() * Math.PI * 2,
      size:   0.012 + Math.random() * 0.022,
    })), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    data.forEach((b, i) => {
      // Loop from startY upward to water surface
      const y = b.startY + ((t * b.speed) % Math.abs(b.startY))
      const wobble = Math.sin(t * 1.4 + b.phase) * 0.06
      dummy.position.set(b.x + wobble, y, b.z)
      dummy.scale.setScalar(b.size)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (progress < ACTS.A1[0] || progress >= ACTS.A3[0]) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BUBBLE_COUNT]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshStandardMaterial color="white" transparent opacity={0.35} roughness={0} metalness={0.2} />
    </instancedMesh>
  )
}

// ─────────────────────────────────────────────
// SURFACE FROM BELOW — shimmer plane seen when camera is underwater
// ─────────────────────────────────────────────

function SurfaceFromBelow({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.position.y = -0.54 + Math.sin(clock.elapsedTime * 0.6) * 0.015
  })

  if (progress < ACTS.A1[0] || progress >= ACTS.A3[0]) return null

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <meshStandardMaterial
        color="#1e4a6e"
        emissive="#0d2a4a"
        emissiveIntensity={0.4}
        transparent
        opacity={0.45}
        side={THREE.BackSide}
        roughness={0.1}
        metalness={0.7}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// BIOLUMINESCENT FIELD — Act 2 (deep dive void)
// Glowing drifting particles like deep-sea organisms
// ─────────────────────────────────────────────

function BioluminescentField({ progress }: { progress: number }) {
  const lp = ap(progress, ACTS.A2)

  if (lp < 0.01) return null

  return (
    <group>
      <Sparkles count={240} scale={14} size={1.6} speed={0.18} color="#1a6e8a" opacity={lp * 0.85} />
      <Sparkles count={120} scale={9}  size={0.9} speed={0.10} color="#7fa882" opacity={lp * 0.55} />
      <Sparkles count={60}  scale={5}  size={2.2} speed={0.30} color="#8fb5c4" opacity={lp * 0.65} />
    </group>
  )
}

// ─────────────────────────────────────────────
// WARP STREAKS — Act 3 (hyperspace travel)
// 200 light streaks flying radially from camera center
// ─────────────────────────────────────────────

const STREAK_COUNT = 200

function WarpStreaks({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const lp      = ap(progress, ACTS.A3)

  const streaks = useMemo(() =>
    Array.from({ length: STREAK_COUNT }, () => ({
      azimuth:   Math.random() * Math.PI * 2,
      elevation: (Math.random() - 0.5) * 0.7,
      phase:     Math.random(),
      speed:     1.8 + Math.random() * 2.5,
    })), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current || lp < 0.01) return
    const t = clock.elapsedTime

    streaks.forEach((s, i) => {
      const r = 0.4 + ((s.phase + t * s.speed * 0.08) % 1) * 11

      const x = Math.cos(s.azimuth) * Math.cos(s.elevation) * r
      const y = Math.sin(s.elevation) * r
      const z = Math.sin(s.azimuth) * Math.cos(s.elevation) * r

      dummy.position.set(x, y, z)
      dummy.rotation.y = s.azimuth
      dummy.rotation.x = -s.elevation
      dummy.scale.set(0.004, 0.004, 0.06 + lp * s.speed * 0.28)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.min(0.75, lp * 1.1)
  })

  if (lp < 0.01) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STREAK_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#5577ee" transparent opacity={0} depthWrite={false} />
    </instancedMesh>
  )
}

// ─────────────────────────────────────────────
// SCENE ROOT
// ─────────────────────────────────────────────

function Scene({ progress }: { progress: number }) {
  const act = (() => {
    if (progress < 0.10) return 0
    if (progress < 0.22) return 1
    if (progress < 0.32) return 2
    if (progress < 0.50) return 3
    if (progress < 0.63) return 4
    if (progress < 0.74) return 5
    if (progress < 0.87) return 6
    return 7
  })()

  return (
    <>
      <SceneBackground progress={progress} />
      <CameraRig progress={progress} />
      <UnderwaterEnv progress={progress} />

      {/* Lighting */}
      <ambientLight intensity={0.20} color="#e8ede9" />
      <directionalLight position={[-3, 5, 3]} intensity={0.5} color="#c8b89a" />
      <pointLight position={[0, 2, -3]} intensity={1.0} color={SAGE} />
      <pointLight position={[2, 0, 2]}  intensity={0.3} color="#8fb5c4" />
      {/* Bright white top-light during fall to illuminate figure */}
      {(act === 1 || act === 2) && (
        <pointLight position={[0, 4, 2]} intensity={3.0} color={WHITE} distance={12} />
      )}
      {/* Underwater blue-green ambient — colder and dimmer */}
      {(act === 1 || act === 2) && (
        <pointLight position={[0, -3, 0]} intensity={1.8} color="#0d4a6e" distance={20} />
      )}
      {/* RyJeane character lighting rig — caustics, aura, cold rim */}
      {(act === 1 || act === 2) && (
        <UnderwaterLighting
          depth={
            act === 1
              ? Math.max(0, ap(progress, ACTS.A1) - 0.65) / 0.35
              : Math.min(1, 0.5 + ap(progress, ACTS.A2) * 0.5)
          }
        />
      )}

      {/* Stars — Act 0 only (submerged = no stars above) */}
      {act === 0 && (
        <Stars radius={40} depth={20} count={4000} factor={3} fade />
      )}

      {/* Figure */}
      {act <= 2 ? (
        <MeditationModel progress={progress} facing={false} />
      ) : act === 6 ? (
        <group position={[0, -0.5, 0]} scale={0.55}>
          <MeditationModel progress={progress} />
          <Sparkles count={30} scale={2} size={1.5} speed={0.3} color={SAGE_LT} />
        </group>
      ) : act !== 5 ? (
        <Float speed={0.7} rotationIntensity={0.04} floatIntensity={0.12}>
          <MeditationModel progress={progress} facing={act === 7} />
        </Float>
      ) : null}

      {/* Water surface — Acts 0–2 */}
      <WaterSurface progress={progress} />

      {/* Underwater effects — Acts 1–2 */}
      <SurfaceFromBelow progress={progress} />
      <Bubbles progress={progress} />

      {/* Bioluminescent void — Act 2 */}
      {act === 2 && <BioluminescentField progress={progress} />}

      {/* Act 3: Hyperspace geometry + warp streaks */}
      {act === 3 && (
        <>
          <HyperspaceGeo progress={progress} />
          <WarpStreaks progress={progress} />
        </>
      )}

      {/* Act 4 */}
      {act === 4 && <MandalaRings progress={progress} />}

      {/* Act 5 */}
      {act === 5 && <ChakraBloom progress={progress} />}

      {/* Act 6 — full 3D summit scene (replaces basic MountainScene) */}
      {act === 6 && (
        <SummitScene
          progress={ap(progress, ACTS.A6)}
          globalProgress={progress}
        />
      )}

      {/* Act 7 */}
      {act === 7 && <WhitePortal progress={progress} />}

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={act >= 5 ? 2.5 : act <= 2 ? 1.4 : 0.9}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0012, 0.0012]}
        />
        <Vignette offset={0.38} darkness={0.60} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  )
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export default function MountainJourney3D({ scrollProgress }: Props) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', display: 'block' }}
      camera={{ position: [0, 0.9, 3.8], fov: 52, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <Suspense fallback={null}>
        <Scene progress={scrollProgress} />
      </Suspense>
    </Canvas>
  )
}
