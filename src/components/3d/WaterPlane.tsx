'use client'

/**
 * WaterPlane — Three.js Water shader for the surface scene.
 *
 * Sage-dark tinted reflective water with breath-driven ripple animation.
 * Sun is set below the horizon with dark colors so reflections are
 * dark — no blue sky leak.
 *
 * Position: y = -1.8 (just below figure base at y = -0.8)
 */

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'

interface Props {
  visible: boolean
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
      // Night — sun below horizon, dark sage tones, no blue
      sunDirection:    new THREE.Vector3(0, -1, 0).normalize(),
      sunColor:        0x000000,  // no sun — eliminates blue at all angles
      waterColor:      0x0d1a14,  // subtle sage tint lives here instead
      distortionScale: distortion,
      fog:             true,
      alpha:           1.0,
    })
    water.rotation.x = -Math.PI / 2
    waterRef.current  = water

    // Hide stars during the water's reflection render pass so they don't
    // appear mirrored on the water surface.
    const originalOnBeforeRender = water.onBeforeRender.bind(water)
    water.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
      const hidden: THREE.Object3D[] = []
      scene.traverse((obj) => {
        if (obj.userData.hideFromWaterReflection && obj.visible) {
          obj.visible = false
          hidden.push(obj)
        }
      })
      originalOnBeforeRender(renderer, scene, camera, geometry, material, group)
      hidden.forEach((obj) => { obj.visible = true })
    }

    if (groupRef.current) groupRef.current.add(water)

    return () => {
      if (groupRef.current) groupRef.current.remove(water)
      geom.dispose()
      water.material.dispose()
      ;(water as unknown as { renderTarget?: THREE.WebGLRenderTarget }).renderTarget?.dispose()
      waterRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, normals])

  useFrame(({ clock }) => {
    if (!waterRef.current) return
    const t = clock.elapsedTime
    const u = waterRef.current.material.uniforms

    // Breath-driven ripple speed
    const breathFactor = 1 + Math.sin(t * 0.45) * 0.3
    if (u.time)             u.time.value            += breathFactor * 0.008
    if (u.distortionScale)  u.distortionScale.value  = distortion
    if (u.size)             u.size.value             = 0.8
  })

  if (!visible) return null

  return <group ref={groupRef} position={[0, -1.8, 0]} />
}
