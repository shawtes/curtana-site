'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COLORS = [
  new THREE.Color('#7fa882'),
  new THREE.Color('#a8c5aa'),
  new THREE.Color('#c8b89a'),
  new THREE.Color('#f5f0e8'),
  new THREE.Color('#8fb5c4'),
]

const PARTICLE_COUNT = 2000

function MistParticles({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Points>(null!)
  const mouse = useRef({ x: 0, y: 0 })

  const { geometry, velocities, origins } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const vels = new Float32Array(PARTICLE_COUNT * 3)
    const origs = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const theta = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.5) * 5.5
      const x = Math.cos(theta) * r + (Math.random() - 0.5) * 1.5
      const y = (Math.random() - 0.3) * 8
      const z = (Math.random() - 0.5) * 2.5

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      origs[i3] = x
      origs[i3 + 1] = y
      origs[i3 + 2] = z

      vels[i3]     = (Math.random() - 0.5) * 0.003
      vels[i3 + 1] = Math.random() * 0.005 + 0.001
      vels[i3 + 2] = (Math.random() - 0.5) * 0.002

      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      colors[i3]     = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return { geometry: geo, velocities: vels, origins: origs }
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame(state => {
    if (!meshRef.current) return
    const pos = geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3

      pos[i3]     += velocities[i3]     + Math.sin(time * 0.3 + i * 0.1) * 0.0008
      pos[i3 + 1] += velocities[i3 + 1]
      pos[i3 + 2] += velocities[i3 + 2] + Math.cos(time * 0.2 + i * 0.15) * 0.0006

      if (pos[i3 + 1] > 6) {
        pos[i3 + 1] = -5
        pos[i3]     = origins[i3]     + (Math.random() - 0.5) * 1.5
        pos[i3 + 2] = origins[i3 + 2] + (Math.random() - 0.5) * 1
      }

      const mx = mouse.current.x * 4
      const my = mouse.current.y * 3
      const dx = pos[i3]     - mx
      const dy = pos[i3 + 1] - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 1.5 && dist > 0) {
        const force = (1.5 - dist) / 1.5 * 0.003
        pos[i3]     += (dx / dist) * force
        pos[i3 + 1] += (dy / dist) * force
      }
    }

    geometry.attributes.position.needsUpdate = true

    const breath = 1 + Math.sin(time * 0.4) * 0.04
    meshRef.current.scale.setScalar(breath)

    const mat = meshRef.current.material as THREE.PointsMaterial
    mat.opacity = Math.max(0, 1 - scrollProgress * 1.3)
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.048}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface MistSceneProps {
  scrollProgress?: number
}

export default function MistScene({ scrollProgress = 0 }: MistSceneProps) {
  return (
    <Canvas
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: false, alpha: true }}
    >
      <MistParticles scrollProgress={scrollProgress} />
    </Canvas>
  )
}
