'use client'

/**
 * RyJeaneCharacter — Photorealistic photogrammetry-scan character.
 *
 * Loads meditation-pose.fbx with full PBR texture mapping, underwater
 * material dynamics, breath animation, hair particles, and bioluminescence.
 *
 * Props:
 *   submersionDepth  — 0 = on surface, 1 = fully deep underwater
 *   breathPhase      — caller-provided breath cycle value (radians, optional)
 *
 * Exports:
 *   RyJeaneCharacter  — the character itself
 *   UnderwaterLighting — companion lighting rig (add to same Canvas scene)
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ─── TEXTURE BASE PATH ───────────────────────────────────────────────────────

const T = '/models/meditation/textures/'

// ─── MODULE-LEVEL COLOR CACHE (never allocate in hot path) ───────────────────

const WARM_SKIN  = new THREE.Color(1.0,  0.85, 0.75)
const DEEP_SKIN  = new THREE.Color(0.4,  0.65, 0.8)
const SAGE_EMIT  = new THREE.Color('#7fa882')
const _tmpColor  = new THREE.Color()

// ─── MATERIAL FACTORIES ──────────────────────────────────────────────────────

function makeSkin(map: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map,
    roughness: 0.65,
    metalness: 0.0,
    sheen: 0.18,
    sheenRoughness: 0.80,
    sheenColor: new THREE.Color(0xffccaa),
    clearcoat: 0.15,
    clearcoatRoughness: 0.25,
    // Bioluminescence starts off; driven per-frame
    emissive: SAGE_EMIT,
    emissiveIntensity: 0.0,
  })
}

function makeLash(map: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map,
    alphaMap: map,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.3,
    metalness: 0.0,
    depthWrite: false,
  })
}

function makeEye(eyeMap: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map: eyeMap,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,   // perfectly wet cornea
    roughness: 0.05,
    metalness: 0.0,
    envMapIntensity: 0.6,
    emissive: new THREE.Color('#0a0a12'),
    emissiveIntensity: 0.05,
  })
}

function makeCloth(map: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map,
    roughness: 0.75,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.4,
    sheen: 0.3,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#1a5a8a'),
  })
}

// ─── HAIR PARTICLES ──────────────────────────────────────────────────────────
// 150 points floating above/around the head, drifting upward underwater.

const HAIR_COUNT  = 150
const ROOT_COLOR  = new THREE.Color('#3d2518')
const TIP_COLOR   = new THREE.Color('#7a5540')

function HairParticles({ depth }: { depth: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry, basePos } = useMemo(() => {
    const pos = new Float32Array(HAIR_COUNT * 3)
    const col = new Float32Array(HAIR_COUNT * 3)

    for (let i = 0; i < HAIR_COUNT; i++) {
      const t = i / HAIR_COUNT
      pos[i * 3]     = (Math.random() - 0.5) * 0.20
      pos[i * 3 + 1] = 1.52 + t * 0.38 + (Math.random() - 0.5) * 0.05
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.16

      _tmpColor.lerpColors(ROOT_COLOR, TIP_COLOR, t)
      col[i * 3]     = _tmpColor.r
      col[i * 3 + 1] = _tmpColor.g
      col[i * 3 + 2] = _tmpColor.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))
    return { geometry: geo, basePos: pos.slice() }
  }, [])

  useEffect(() => {
    return () => { geometry.dispose() }
  }, [geometry])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t    = clock.elapsedTime
    const d    = depth
    const wave = 0.018 + d * 0.07
    const lift = d * 0.28

    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr  = attr.array as Float32Array

    for (let i = 0; i < HAIR_COUNT; i++) {
      const bx = basePos[i * 3]
      const by = basePos[i * 3 + 1]
      const bz = basePos[i * 3 + 2]

      arr[i * 3]     = bx + Math.sin(t * 0.8  + by * 2.0) * wave
      arr[i * 3 + 1] = by + lift * (1.0 - by * 0.28)
      arr[i * 3 + 2] = bz + Math.cos(t * 0.62 + by * 1.5) * wave * 0.7
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.013}
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
      />
    </points>
  )
}

// ─── UNDERWATER LIGHTING ─────────────────────────────────────────────────────
// Export this and place it in the same Canvas as RyJeaneCharacter.

const CAUSTIC_COLOR = new THREE.Color('#3a8fa0')
const AURA_COLOR    = new THREE.Color('#7fa882')
const RIM_COLOR     = new THREE.Color('#1a4060')
const SURFACE_AMB   = new THREE.Color('#2a3f2e')
const DEEP_AMB      = new THREE.Color('#020810')

export function UnderwaterLighting({ depth }: { depth: number }) {
  const causticRef = useRef<THREE.PointLight>(null)
  const auraRef    = useRef<THREE.PointLight>(null)
  const rimRef     = useRef<THREE.PointLight>(null)
  const ambRef     = useRef<THREE.AmbientLight>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Multi-frequency shimmer mimics caustic light from above
    const shimmer = 0.6
      + Math.sin(t * 1.73) * 0.15
      + Math.sin(t * 3.11) * 0.08
      + Math.sin(t * 5.29) * 0.04

    if (causticRef.current) {
      causticRef.current.intensity = shimmer * depth
      causticRef.current.color.copy(CAUSTIC_COLOR)
    }
    if (auraRef.current) {
      auraRef.current.intensity = depth * 0.4
    }
    if (rimRef.current) {
      rimRef.current.intensity = depth * 0.25
    }
    if (ambRef.current) {
      _tmpColor.lerpColors(SURFACE_AMB, DEEP_AMB, depth)
      ambRef.current.color.copy(_tmpColor)
    }
  })

  return (
    <>
      {/* Caustic shimmer from above */}
      <pointLight
        ref={causticRef}
        position={[0, 3, 0]}
        color={CAUSTIC_COLOR}
        intensity={0}
        distance={8}
        decay={2}
      />
      {/* Bioluminescent character aura */}
      <pointLight
        ref={auraRef}
        position={[0, 0, 0.3]}
        color={AURA_COLOR}
        intensity={0}
        distance={3}
        decay={2}
      />
      {/* Cold rim from below — ocean floor scatter */}
      <pointLight
        ref={rimRef}
        position={[0, -2, 1]}
        color={RIM_COLOR}
        intensity={0}
        distance={4}
        decay={2}
      />
      {/* Ambient lerps from sage-dark surface → near-black deep */}
      <ambientLight ref={ambRef} color={SURFACE_AMB} intensity={0.3} />
    </>
  )
}

// ─── MAIN CHARACTER ──────────────────────────────────────────────────────────

interface RyJeaneProps {
  /** 0 = at/above surface, 1 = fully deep underwater */
  submersionDepth?: number
}

export function RyJeaneCharacter({ submersionDepth = 0 }: RyJeaneProps) {
  const innerRef = useRef<THREE.Group>(null)

  // FBX — drei caches by URL, so shared with any other useFBX of same path
  const fbx = useFBX('/models/meditation/meditation-pose.fbx')

  // All character textures
  const [
    faceMap, torsoMap, legsMap, armsMap,
    mouthMap, lashMap, eyeMap,
    braMap, shortsMap,
  ] = useTexture([
    T + 'RyJeane_face_1001.jpeg',
    T + 'RyJeane_torso_1002.jpeg',
    T + 'RyJeane_legs_1003.jpeg',
    T + 'RyJeane_arms_1004.jpeg',
    T + 'RyJeane_mouth_1005.jpeg',
    T + 'RyJeane_lashes_1006.jpeg',
    T + 'RyJeane_eyes01_1007.jpeg',
    T + '05_SportsBra_Base_Color.jpeg',
    T + '05_BoyShorts_Base_Color.jpeg',
  ])

  // Fix FBX UV convention (FBX UVs are already Y-flipped)
  useEffect(() => {
    const maps = [faceMap, torsoMap, legsMap, armsMap, mouthMap, lashMap, eyeMap, braMap, shortsMap]
    maps.forEach(t => {
      t.colorSpace = THREE.SRGBColorSpace
      t.flipY      = false
      t.needsUpdate = true
    })
  }, [faceMap, torsoMap, legsMap, armsMap, mouthMap, lashMap, eyeMap, braMap, shortsMap])

  // Build material map and assign to meshes once
  // Mesh name matching: robust keyword-based fallback so any FBX naming works
  useEffect(() => {
    const mats = {
      face:   makeSkin(faceMap),
      torso:  makeSkin(torsoMap),
      arms:   makeSkin(armsMap),
      legs:   makeSkin(legsMap),
      mouth:  makeSkin(mouthMap),
      lashes: makeLash(lashMap),
      eyes:   makeEye(eyeMap),
      bra:    makeCloth(braMap),
      shorts: makeCloth(shortsMap),
    }

    let fallbackAssigned = false

    fbx.traverse(child => {
      if (
        !(child instanceof THREE.Mesh) &&
        !(child instanceof THREE.SkinnedMesh)
      ) return

      const n = child.name.toLowerCase()

      if (n.includes('lash')) {
        child.material = mats.lashes
      } else if (n.includes('eye') && !n.includes('brow') && !n.includes('lid')) {
        child.material = mats.eyes
      } else if (n.includes('face') || n.includes('head')) {
        child.material = mats.face
      } else if (n.includes('torso') || n.includes('chest')) {
        child.material = mats.torso
      } else if (n.includes('arm') || n.includes('hand') || n.includes('finger')) {
        child.material = mats.arms
      } else if (
        n.includes('leg') || n.includes('foot') ||
        n.includes('knee') || n.includes('thigh') || n.includes('calf')
      ) {
        child.material = mats.legs
      } else if (
        n.includes('mouth') || n.includes('lip') ||
        n.includes('teeth') || n.includes('tongue') || n.includes('gum')
      ) {
        child.material = mats.mouth
      } else if (n.includes('bra') || n.includes('top') || n.includes('shirt')) {
        child.material = mats.bra
      } else if (
        n.includes('short') || n.includes('pant') ||
        n.includes('bottom') || n.includes('brief')
      ) {
        child.material = mats.shorts
      } else if (child instanceof THREE.SkinnedMesh && !fallbackAssigned) {
        // Fallback: first unmatched SkinnedMesh gets body skin
        child.material = mats.torso
        fallbackAssigned = true
      } else if (child instanceof THREE.SkinnedMesh) {
        child.material = mats.torso
      }
    })

    return () => {
      Object.values(mats).forEach(m => m.dispose())
    }
  }, [fbx, faceMap, torsoMap, armsMap, legsMap, mouthMap, lashMap, eyeMap, braMap, shortsMap])

  // Per-frame: underwater material dynamics + gentle body sway
  useFrame(({ clock }) => {
    if (!innerRef.current) return
    const t = clock.elapsedTime
    const d = submersionDepth

    // ── Zero-gravity sway (starts at depth 0.3) ──
    const swayAmt = Math.max(0, d - 0.3) * 0.015
    innerRef.current.rotation.z = Math.sin(t * 0.31) * swayAmt
    innerRef.current.rotation.x = Math.cos(t * 0.41) * swayAmt * 0.5

    // ── Caustics shimmer (scalar, no texture needed) ──
    const caustic = (Math.sin(t * 2.1) * 0.5 + 0.5) *
                    (Math.sin(t * 1.7 + 1.3) * 0.5 + 0.5)

    fbx.traverse(child => {
      if (
        !(child instanceof THREE.Mesh) &&
        !(child instanceof THREE.SkinnedMesh)
      ) return
      const mat = child.material as THREE.MeshPhysicalMaterial
      if (!mat?.isMeshPhysicalMaterial) return

      const n = child.name.toLowerCase()
      const isCloth =
        n.includes('bra')  || n.includes('short') ||
        n.includes('top')  || n.includes('pant')  ||
        n.includes('shirt')|| n.includes('brief')
      const isEye   = n.includes('eye') && !n.includes('brow') && !n.includes('lid')
      const isLash  = n.includes('lash')

      if (isEye || isLash) return  // eyes/lashes don't change with depth

      if (isCloth) {
        mat.roughness       = THREE.MathUtils.lerp(0.75, 0.35, d)
        mat.clearcoat       = THREE.MathUtils.lerp(0.0,  0.30, d)
      } else {
        // Skin — wet + blue-tinted + bioluminescent at depth
        mat.clearcoat          = THREE.MathUtils.lerp(0.15, 0.80, d)
        mat.clearcoatRoughness = THREE.MathUtils.lerp(0.25, 0.05, d)

        _tmpColor.lerpColors(WARM_SKIN, DEEP_SKIN, d * 0.6)
        mat.color.copy(_tmpColor)

        // Bioluminescence ramps in after 70% depth
        const bio = d > 0.7 ? (d - 0.7) * 0.15 : 0
        // Caustics add teal shimmer to upward-facing skin
        mat.emissive.copy(SAGE_EMIT)
        mat.emissiveIntensity = bio + (d > 0.1 ? caustic * d * 0.035 : 0)
      }
    })
  })

  return (
    <group ref={innerRef}>
      {/*
        NO scale here — callers (MeditationModel, Figure) apply scale=0.011
        on their parent group. Adding it here causes double-scaling (invisible).
      */}
      <primitive
        object={fbx}
        rotation={[0, Math.PI, 0]}
        position={[0, 0, 0]}
      />
      <HairParticles depth={submersionDepth} />
    </group>
  )
}
