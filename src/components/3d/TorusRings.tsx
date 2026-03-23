'use client'

/**
 * TorusRings — Three concentric portal rings (Acts 3–5).
 *
 * Act 3: Scale in from 0, opacity builds with act3Progress.
 * Act 4: Scale up dramatically + new rings spawn (rushing past effect).
 * Act 5: Slow to gentle orbit, shrink as hyperspace decelerates.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  act3Progress: number
  act4Progress: number
  act5Progress: number
}

// Ring definitions from spec
const RINGS = [
  { r: 2.2, tube: 0.035, color: 0x7fa882, spin: +0.008,   opacity: 0.9, segments: [16, 120] },
  { r: 1.55, tube: 0.025, color: 0xc8b89a, spin: -0.014,  opacity: 0.7, segments: [16, 100] },
  { r: 0.95, tube: 0.018, color: 0x8fb5c4, spin: +0.022,  opacity: 0.6, segments: [16, 80]  },
] as const

export default function TorusRings({ act3Progress, act4Progress, act5Progress }: Props) {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const refs     = [ring1Ref, ring2Ref, ring3Ref]

  // useFrame must be called unconditionally — never after an early return
  useFrame(() => {
    // Skip animation when not visible
    const visible = act3Progress > 0.01 || act4Progress > 0.01 || act5Progress > 0.01
    if (!visible) return
    refs.forEach((ref, i) => {
      if (!ref.current) return
      const ring = RINGS[i]
      const mat  = ref.current.material as THREE.MeshBasicMaterial

      // Spin on Y axis
      ref.current.rotation.y += ring.spin

      // Ring 3 is slightly tilted on X
      if (i === 2) ref.current.rotation.x = Math.PI * 0.25

      // Act 3: scale in, opacity builds
      const base3Opacity = ring.opacity * act3Progress
      const base3Scale   = act3Progress

      // Act 4: scale up (rushing past), opacity fades as rings grow huge
      const rush4Scale   = 1 + act4Progress * 3
      const rush4Opacity = Math.max(0, 1 - act4Progress * 0.85)

      // Act 5: slow spin, keep at full scale unless streaks stop
      const slow5Scale   = THREE.MathUtils.lerp(rush4Scale, 1.2, act5Progress)

      if (act5Progress > 0.01) {
        ref.current.scale.setScalar(slow5Scale)
        mat.opacity = base3Opacity * rush4Opacity * THREE.MathUtils.lerp(1, 0.6, act5Progress)
      } else if (act4Progress > 0.01) {
        ref.current.scale.setScalar(base3Scale * rush4Scale)
        mat.opacity = base3Opacity * rush4Opacity
      } else {
        ref.current.scale.setScalar(base3Scale)
        mat.opacity = base3Opacity
      }
    })
  })

  return (
    <group>
      {RINGS.map((ring, i) => (
        <mesh key={i} ref={refs[i]}>
          <torusGeometry
            args={[ring.r, ring.tube, ring.segments[0], ring.segments[1]]}
          />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
