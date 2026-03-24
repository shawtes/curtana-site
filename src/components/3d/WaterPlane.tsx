'use client'

/**
 * WaterPlane — Dark reflective water surface for night scene.
 *
 * Replaces the Three.js Water shader (which has a hardcoded blue sky)
 * with a simple animated dark plane using custom shaders.
 * No blue sky reflection — just dark rippling water under stars.
 *
 * Position: y = -1.8
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WATER_VERT = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Gentle wave displacement
    float wave1 = sin(pos.x * 0.8 + uTime * 0.4) * 0.02;
    float wave2 = sin(pos.y * 0.6 + uTime * 0.3 + 1.5) * 0.015;
    float wave3 = sin((pos.x + pos.y) * 0.5 + uTime * 0.25) * 0.01;
    pos.z += wave1 + wave2 + wave3;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const WATER_FRAG = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  uniform float uTime;

  // Simple noise for surface detail
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    // Dark base color — forest dark, matching the scene
    vec3 deepColor = vec3(0.035, 0.05, 0.045);   // very dark sage
    vec3 surfaceColor = vec3(0.05, 0.07, 0.06);   // slightly lighter

    // Animated ripple pattern
    vec2 uv = vWorldPos.xz * 0.15;
    float n1 = noise(uv + uTime * 0.08);
    float n2 = noise(uv * 2.0 - uTime * 0.05);
    float ripple = n1 * 0.6 + n2 * 0.4;

    // Mix colors based on ripple
    vec3 col = mix(deepColor, surfaceColor, ripple * 0.5);

    // Subtle sage highlight on wave crests
    float crest = smoothstep(0.55, 0.75, ripple);
    col += vec3(0.02, 0.04, 0.03) * crest;

    // Fresnel — edges slightly brighter (star reflection sim)
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 4.0);
    col += vec3(0.015, 0.02, 0.018) * fresnel;

    // Very subtle star-like sparkles
    float sparkle = noise(vWorldPos.xz * 3.0 + uTime * 0.2);
    sparkle = pow(sparkle, 8.0) * 0.15;
    col += vec3(0.04, 0.05, 0.04) * sparkle;

    gl_FragColor = vec4(col, 0.95);
  }
`

interface Props {
  visible: boolean
  distortion?: number
}

export default function WaterPlane({ visible }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef  = useRef<THREE.ShaderMaterial | null>(null)

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  if (!visible) return null

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.8, 0]}
    >
      <planeGeometry args={[200, 200, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={WATER_VERT}
        fragmentShader={WATER_FRAG}
        uniforms={{
          uTime: { value: 0 },
        }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
