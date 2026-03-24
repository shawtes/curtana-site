'use client'

/**
 * BiolumiParticles — Bioluminescent deep-sea particles for Act 02.
 *
 * N particles drift with simplified curl-noise motion (sine-based).
 * Additive blending creates the glow effect.
 * Color palette: sage greens + misty blues.
 * Count adapts to device tier: 600 (tier 2+) / 200 (tier 1) / 60 (tier 0).
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COLORS = [
  new THREE.Color('#7fa882'),
  new THREE.Color('#8fb5c4'),
  new THREE.Color('#4a9e7a'),
  new THREE.Color('#2a6e5a'),
  new THREE.Color('#a8c5aa'),
]

interface Props {
  opacity: number    // 0→1, drives overall visibility
  count?:  number    // particle count — caller controls for device tier
}

export default function BiolumiParticles({ opacity, count = 400 }: Props) {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry, phases, speeds, colorIdx } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors    = new Float32Array(count * 3)
    const ph        = new Float32Array(count * 3) // phase seeds per axis
    const sp        = new Float32Array(count)     // speed multiplier
    const ci        = new Uint8Array(count)       // color index

    for (let i = 0; i < count; i++) {
      // Scatter across a wide volume (figure descends into y = -5 during Act 2)
      positions[i * 3]     = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = -2 - Math.random() * 12
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14

      ph[i * 3]     = Math.random() * Math.PI * 2
      ph[i * 3 + 1] = Math.random() * Math.PI * 2
      ph[i * 3 + 2] = Math.random() * Math.PI * 2
      sp[i]         = 0.4 + Math.random() * 0.8

      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      ci[i] = i % COLORS.length
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

    return { geometry: geo, phases: ph, speeds: sp, colorIdx: ci }
  }, [count])

  const basePos = useMemo(() => {
    const attr = geometry.attributes.position as THREE.BufferAttribute
    return (attr.array as Float32Array).slice()
  }, [geometry])

  useEffect(() => {
    return () => { geometry.dispose() }
  }, [geometry])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t    = clock.elapsedTime
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr  = attr.array as Float32Array

    for (let i = 0; i < count; i++) {
      const bx = basePos[i * 3]
      const by = basePos[i * 3 + 1]
      const bz = basePos[i * 3 + 2]
      const s  = speeds[i]
      const px = phases[i * 3]
      const py = phases[i * 3 + 1]
      const pz = phases[i * 3 + 2]

      // Curl-noise approximation: cross-axis sine derivatives
      arr[i * 3]     = bx + Math.sin(t * s * 0.4 + by * 0.3 + px) * 0.4
                          + Math.cos(t * s * 0.3 + bz * 0.2) * 0.25
      arr[i * 3 + 1] = by + Math.sin(t * s * 0.35 + bx * 0.2 + py) * 0.3
                          + t * s * 0.001   // slight upward drift
      arr[i * 3 + 2] = bz + Math.cos(t * s * 0.3 + bx * 0.3 + pz) * 0.35
                          + Math.sin(t * s * 0.25 + by * 0.25) * 0.2
    }

    attr.needsUpdate = true

    // Per-particle opacity via point size pulsing (limited — use opacity prop)
    const mat = pointsRef.current.material as THREE.PointsMaterial
    mat.opacity = opacity * 0.8
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.025}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  )
}
