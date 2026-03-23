'use client'

/**
 * SummitScene — Himalayan summit scene for Act 6 of the Mountain Journey.
 *
 * Spec from mountain_summit_scene_map.html:
 *  - Procedural PlaneGeometry terrain with ridged FBM noise
 *  - 3-layer instanced snow particles with wind gusts
 *  - Cloud sheet below summit (volumetric-look via alpha-blended planes)
 *  - THREE.Sky + FogExp2 cold atmosphere (above-8000m look)
 *  - Cold directional + ambient lighting
 *  - Slow camera orbit (~7min per revolution when sustained)
 *
 * Usage:  <SummitScene progress={ap} />  (ap = 0→1 within Act 6)
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SummitProps {
  progress: number   // 0→1 within Act 6 (already normalised by caller)
  globalProgress: number // raw page progress — for orbit tracking
}

// ─── Ridged FBM noise (JS) ───────────────────────────────────────────────────

function hash2(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return h - Math.floor(h)
}

function noise2(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  // smooth
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
  const a = hash2(ix,     iy)
  const b = hash2(ix + 1, iy)
  const c = hash2(ix,     iy + 1)
  const d = hash2(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (d - b + a - c) * ux * uy
}

function fbm(x: number, y: number, octaves = 6): number {
  let v = 0, a = 0.5, px = x, py = y
  for (let i = 0; i < octaves; i++) {
    v += a * noise2(px, py)
    px *= 2.02; py *= 2.02; a *= 0.5
  }
  return v
}

// Ridged: peaks are sharp ridges, not smooth hills
function ridgedFBM(x: number, y: number): number {
  return 1 - Math.abs(fbm(x, y) * 2 - 1)
}

// ─── Terrain geometry (generated once) ───────────────────────────────────────

function buildMountainGeometry(segments = 200, size = 20, maxH = 7.5) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments)
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)

    // Base ridged noise — scale so summit is at center
    const nx = x * 0.38 + 0.5
    const nz = z * 0.38 + 0.5
    let h = ridgedFBM(nx, nz) * maxH

    // Radial falloff — ensures border edges sink down, summit at center
    const dist = Math.sqrt(x * x + z * z) / (size * 0.5)
    h *= Math.max(0, 1 - dist * 0.85)

    // Slight flat summit platform (the lotus seat)
    const summitDist = Math.sqrt(x * x + z * z)
    if (summitDist < 1.2) {
      const flatBlend = 1 - summitDist / 1.2
      const summitH = maxH * 0.82
      h = h + (summitH - h) * flatBlend * flatBlend
    }

    pos.setY(i, Math.max(-0.5, h))
  }

  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

// ─── Procedural Mountain ─────────────────────────────────────────────────────

function ProceduralMountain({ progress }: { progress: number }) {
  const geoRef = useRef<THREE.BufferGeometry | null>(null)
  const snowMatRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const rockMatRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  const geo = useMemo(() => buildMountainGeometry(200, 22, 7.5), [])

  useEffect(() => {
    geoRef.current = geo
    return () => { geo.dispose() }
  }, [geo])

  // Vertex-based snow/rock coloring via onBeforeCompile
  // We split into 2 meshes for simplicity: one for snow faces above Y>2.5, one for rock below

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    // Very subtle breath: mesh slightly rises/falls (thermal on summit)
    meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.18) * 0.04
  })

  return (
    <group>
      {/* Snow surface — full mesh, snow colored */}
      <mesh ref={meshRef} geometry={geo} receiveShadow castShadow>
        <meshStandardMaterial
          ref={snowMatRef}
          color="#dce8f0"       // cold blue-white snow
          roughness={0.92}
          metalness={0.0}
          envMapIntensity={0.25}
          transparent
          opacity={progress}
        />
      </mesh>

      {/* Layered back mountains — 2.5D depth planes, Framestore technique */}
      {[
        { y: -3.5, z: -9,  w: 26, h: 5.5, color: '#07111e', em: 0.00 },
        { y: -2.5, z: -5,  w: 22, h: 4.5, color: '#0b1928', em: 0.01 },
        { y: -1.5, z: -2,  w: 18, h: 3.5, color: '#0f2035', em: 0.02 },
      ].map((m, i) => (
        <mesh key={i} position={[0, m.y, m.z]}>
          <planeGeometry args={[m.w, m.h, 1, 1]} />
          <meshStandardMaterial
            color={m.color}
            emissive="#8fb5c4"
            emissiveIntensity={m.em + progress * 0.04}
            transparent
            opacity={Math.min(1, progress * 2) * (0.9 - i * 0.1)}
            side={THREE.FrontSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Cloud Sheet below summit ────────────────────────────────────────────────
// 60 overlapping alpha planes at Y = -9 → -13, simulating volumetric clouds

const CLOUD_COUNT = 60

function CloudLayer({ progress }: { progress: number }) {
  const cloudsRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const cloudData = useMemo(() =>
    Array.from({ length: CLOUD_COUNT }, (_, i) => ({
      x:    (Math.random() - 0.5) * 40,
      y:    -9 - Math.random() * 4,
      z:    (Math.random() - 0.5) * 40,
      rx:   Math.random() * Math.PI,
      w:    4 + Math.random() * 8,
      h:    1.5 + Math.random() * 2.5,
      driftX: (Math.random() - 0.5) * 0.003,
      driftZ: (Math.random() - 0.5) * 0.003,
      phase: Math.random() * Math.PI * 2,
    })), [])

  useFrame(({ clock }) => {
    if (!cloudsRef.current) return
    const t = clock.elapsedTime

    cloudData.forEach((c, i) => {
      dummy.position.set(
        c.x + Math.sin(t * 0.06 + c.phase) * 0.8,
        c.y + Math.sin(t * 0.12 + c.phase) * 0.15,
        c.z + Math.cos(t * 0.05 + c.phase) * 0.6
      )
      dummy.rotation.x = c.rx
      dummy.rotation.y = t * 0.008 + c.phase
      dummy.scale.set(c.w, c.h, 1)
      dummy.updateMatrix()
      cloudsRef.current!.setMatrixAt(i, dummy.matrix)
    })
    cloudsRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={cloudsRef} args={[undefined, undefined, CLOUD_COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#8aa0b0"
        transparent
        opacity={Math.min(0.55, progress * 0.6)}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </instancedMesh>
  )
}

// ─── Snow Particles — 3 instanced layers ─────────────────────────────────────

interface SnowLayer {
  count: number
  size: number
  speed: number
  zRange: number
  spread: number
}

const SNOW_LAYERS: SnowLayer[] = [
  { count: 300,  size: 0.028, speed: 0.08, zRange: 5,  spread: 14 },  // foreground
  { count: 600,  size: 0.016, speed: 0.05, zRange: 15, spread: 22 },  // mid
  { count: 400,  size: 0.008, speed: 0.02, zRange: 30, spread: 32 },  // far
]

function SnowLayer3D({ layer, progress, windMult }: {
  layer: SnowLayer
  progress: number
  windMult: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(() =>
    Array.from({ length: layer.count }, () => ({
      x:     (Math.random() - 0.5) * layer.spread,
      y:     (Math.random() - 0.5) * 12,
      z:     (Math.random() - 0.5) * layer.zRange * 2,
      phase: Math.random() * Math.PI * 2,
      wobble: (Math.random() - 0.5) * 0.4,
    })), [layer])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t   = clock.elapsedTime
    const wX  = 0.3 * windMult  // wind drift rightward

    data.forEach((p, i) => {
      // Drift downward + wind
      const yPos = ((p.y - t * layer.speed + 6) % 12) - 6
      const xPos = p.x + Math.sin(t * 0.7 + p.phase) * 0.12 + wX * t * 0.3
      const zPos = p.z + Math.cos(t * 0.5 + p.phase) * 0.08

      dummy.position.set(xPos, yPos, zPos)
      dummy.scale.setScalar(layer.size)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, layer.count]}>
      <sphereGeometry args={[1, 3, 3]} />
      <meshStandardMaterial
        color="#e8f0f8"
        transparent
        opacity={Math.min(0.75, progress * 0.9) * (layer.zRange < 10 ? 0.9 : 0.6)}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

function SnowSystem({ progress }: { progress: number }) {
  const gustRef     = useRef(1)
  const gustTimer   = useRef(0)
  const windMultRef = useRef(1)

  // Wind gust system: calm → 3x gust every 8–12s for 1.5s
  useFrame((_, dt) => {
    gustTimer.current += dt
    if (gustTimer.current > 8 + Math.random() * 4) {
      gustRef.current    = 3
      gustTimer.current  = 0
    }
    // Decay gust over 1.5s
    if (gustRef.current > 1) {
      gustRef.current = Math.max(1, gustRef.current - dt * 1.33)
    }
    windMultRef.current = gustRef.current
  })

  if (progress < 0.01) return null

  return (
    <>
      {SNOW_LAYERS.map((layer, i) => (
        <SnowLayer3D key={i} layer={layer} progress={progress} windMult={windMultRef.current} />
      ))}
    </>
  )
}

// ─── Scene-wide atmosphere ───────────────────────────────────────────────────

function SummitAtmosphere({ progress }: { progress: number }) {
  const { scene } = useThree()

  useEffect(() => {
    // Cold blue exponential fog — density increases with opacity fade-in
    const fog = new THREE.FogExp2(0xc8d8e8, 0.008 * progress)
    scene.fog = fog
    return () => { scene.fog = null }
  }, [scene, progress])

  // Keep fog density synced to progress without recreating
  useFrame(() => {
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, 0.008 * progress, 0.05)
    }
  })

  return null
}

// ─── Summit Lighting ─────────────────────────────────────────────────────────

function SummitLighting({ progress }: { progress: number }) {
  const dirRef = useRef<THREE.DirectionalLight>(null)
  const ambRef = useRef<THREE.AmbientLight>(null)

  useFrame(({ clock }) => {
    if (!dirRef.current || !ambRef.current) return
    // Subtle pulsing — cloud shadows moving across summit
    const pulse = 1 + Math.sin(clock.elapsedTime * 0.12) * 0.06
    dirRef.current.intensity = 2.0 * progress * pulse
    ambRef.current.intensity = 0.4 * progress
  })

  return (
    <>
      {/* Primary: cold blue-white sunlight from low angle */}
      <directionalLight
        ref={dirRef}
        position={[2, 4, -3]}
        color="#c8d8f0"
        intensity={0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* Secondary: warm backfill from candle direction */}
      <pointLight position={[0, 1, 0.5]} color="#c9a96e" intensity={0.8 * progress} distance={6} />
      {/* Ambient: cold dark */}
      <ambientLight ref={ambRef} color="#1a2030" intensity={0} />
    </>
  )
}

// ─── Slow Orbit Camera ───────────────────────────────────────────────────────
// Camera starts at (0, 1, 4) and orbits at 0.00015 rad/frame
// Full revolution ≈ 7 minutes of viewing

function OrbitCamera({ progress, globalProgress }: { progress: number; globalProgress: number }) {
  const { camera } = useThree()
  const angleRef   = useRef(0)
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0.8, 0), [])
  const posTarget  = useMemo(() => new THREE.Vector3(0, 1.0, 4.0), [])
  const UP         = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useFrame(() => {
    if (progress < 0.05) return

    // Orbit accumulates — very slow
    angleRef.current += 0.00015

    // Radial position — camera circles the summit at radius 4
    const r   = 4.2
    const px  = Math.sin(angleRef.current) * r
    const pz  = Math.cos(angleRef.current) * r
    const py  = 1.0 + Math.sin(globalProgress * Math.PI) * 0.3  // gentle elevation arc

    posTarget.set(px, py, pz)

    camera.position.lerp(posTarget, 0.04)
    camera.lookAt(lookTarget)
  })

  return null
}

// ─── SUMMIT SCENE — main export ──────────────────────────────────────────────

export default function SummitScene({ progress, globalProgress }: SummitProps) {
  if (progress < 0.005) return null

  return (
    <group>
      {/* Atmosphere (fog) */}
      <SummitAtmosphere progress={progress} />

      {/* Lighting */}
      <SummitLighting progress={progress} />

      {/* Sky — above 8000m: deep cold blue, low sun */}
      <Sky
        distance={450000}
        sunPosition={[0.5, 0.3, -1]}
        turbidity={0.4}
        rayleigh={0.8}
        mieCoefficient={0.003}
        mieDirectionalG={0.7}
      />

      {/* Stars — faintly visible through thin atmosphere */}
      <Stars radius={60} depth={20} count={1200} factor={1.5} fade saturation={0.2} />

      {/* Terrain */}
      <ProceduralMountain progress={progress} />

      {/* Cloud sheet far below (you're above the clouds) */}
      <CloudLayer progress={progress} />

      {/* Snow */}
      <SnowSystem progress={progress} />

      {/* Orbit camera */}
      <OrbitCamera progress={progress} globalProgress={globalProgress} />
    </group>
  )
}
