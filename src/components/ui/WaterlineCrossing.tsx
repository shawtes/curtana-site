'use client'

/**
 * WaterlineCrossing — Layer 3: DOM overlay showing a sweeping wavy line
 * across the screen as the camera crosses the water surface.
 *
 * Active when scrollProgress is between 0.15 and 0.30.
 * The line sweeps from bottom to top; below it, a dark blue overlay fades in.
 */

import React from 'react'

interface Props {
  progress: number
}

export default function WaterlineCrossing({ progress }: Props) {
  const active = progress > 0.15 && progress < 0.30
  if (!active) return null

  // Line sweeps from bottom (0%) to top (100%) over progress 0.15 → 0.28
  const sweepT = Math.min(1, Math.max(0, (progress - 0.15) / 0.13))
  const bottomPercent = (1 - sweepT) * 100

  // Fade out the whole effect between 0.28 and 0.30
  const fadeOut = progress > 0.28 ? 1 - (progress - 0.28) / 0.02 : 1
  const opacity = Math.max(0, Math.min(1, fadeOut))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        opacity,
      }}
    >
      {/* The wavy waterline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: `${bottomPercent}%`,
          height: 4,
          transform: 'translateY(50%)',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(143,181,196,0.3) 15%, rgba(143,181,196,0.8) 40%, rgba(255,255,255,0.9) 50%, rgba(143,181,196,0.8) 60%, rgba(143,181,196,0.3) 85%, transparent 100%)',
          filter: 'blur(1px)',
          animation: 'waterline-wiggle 1.2s ease-in-out infinite',
        }}
      />

      {/* Inline keyframes */}
      <style>{`
        @keyframes waterline-wiggle {
          0%   { transform: translateY(50%) translateX(0px); }
          25%  { transform: translateY(50%) translateX(6px); }
          50%  { transform: translateY(50%) translateX(-4px); }
          75%  { transform: translateY(50%) translateX(5px); }
          100% { transform: translateY(50%) translateX(0px); }
        }
      `}</style>
    </div>
  )
}
