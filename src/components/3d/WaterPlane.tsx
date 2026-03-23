'use client'

/**
 * WaterPlane — Three.js Water shader for Act 00 and Act 01.
 *
 * Sage-dark tinted reflective water with breath-driven ripple animation.
 * Ripples expand faster on inhale, slower on exhale.
 *
 * Position: y = -1.8 (just below figure base at y = -0.8)
 */

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'

interface Props {
  /** visible: render the water plane, hidden: remove it */
  visible: boolean
  /** how distorted/choppy the water is (1.2 = calm, 5 = stormy) */
  distortion?: number
}

export default function WaterPlane({ visible, distortion = 1.2 }: Props) {
  const groupRef  = useRef<THREE.Group>(null)
  const waterRef  = useRef<Water | null>(null)

  const normals = useTexture('/textures/waternormals.jpg')
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping

  useEffect(() => {
    if (!visible) return

    const geom = new THREE.PlaneGeometry(5000, 5000)
    const water = new Water(geom, {
      textureWidth:    512,
      textureHeight:   512,
      waterNormals:    normals,
      // Low-angle moonlight — grazes the horizon, cool dim reflection
      sunDirection:    new THREE.Vector3(-0.4, 0.08, -0.9).normalize(),
      sunColor:        0x223344,   // dim cool moonlight, not white sun
      waterColor:      0x0a1214,   // near-black with faint teal — still water at 2am
      distortionScale: distortion,
      fog:             true,
      alpha:           1.0,        // fully opaque — no sea-floor showing
    })
    water.rotation.x = -Math.PI / 2
    waterRef.current  = water

    if (groupRef.current) groupRef.current.add(water)

    return () => {
      if (groupRef.current) groupRef.current.remove(water)
      geom.dispose()
      water.material.dispose()
      waterRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, normals])

  useFrame(({ clock }) => {
    if (!waterRef.current) return
    const t = clock.elapsedTime
    const u = waterRef.current.material.uniforms

    // Breath-driven ripple speed — faster on inhale, slower on exhale
    const breathFactor = 1 + Math.sin(t * 0.45) * 0.3
    if (u.time)             u.time.value            += breathFactor * 0.008
    if (u.distortionScale)  u.distortionScale.value  = distortion
    if (u.size)             u.size.value             = 0.8  // smaller normal map tiles
  })

  if (!visible) return null

  return <group ref={groupRef} position={[0, -1.8, 0]} />
}
