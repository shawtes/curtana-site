'use client'

/**
 * UnderwaterDistortion — Layer 4: SVG filter for screen warp when submerged.
 *
 * Uses feTurbulence + feDisplacementMap applied via CSS filter on the canvas.
 * Also includes the Layer 5 tint overlay (deep aquamarine).
 *
 * Receives `progress` (0→1). When progress > 0.28, distortion ramps in.
 */

import React from 'react'

interface Props {
  progress: number
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export default function UnderwaterDistortion({ progress }: Props) {
  // Distortion strength ramps in over progress 0.28 → 0.35
  const distortionT = clamp((progress - 0.28) / 0.07, 0, 1)
  const strength = lerp(0, 12, distortionT)

  return (
    <svg
      style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="underwater-distort" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02 0.05"
            numOctaves={2}
            seed={2}
          >
            <animate
              attributeName="baseFrequency"
              dur="8s"
              values="0.02 0.05;0.025 0.06;0.02 0.05"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            xChannelSelector="R"
            yChannelSelector="G"
            scale={strength}
          />
        </filter>
      </defs>
    </svg>
  )
}

/**
 * Returns the CSS filter string to apply to the canvas wrapper.
 * Call this from SubmersionJourney to get the filter value.
 */
export function getUnderwaterFilter(progress: number): string {
  if (progress <= 0.28) return 'none'
  return 'url(#underwater-distort)'
}
