'use client'

/**
 * useDeviceTier — detects GPU/device capability and returns a tier (0–3).
 *
 * 0 = very low-end → CSS fallback only
 * 1 = low-end      → reduced particle counts, 256px water
 * 2 = mid-tier     → standard effects (default)
 * 3 = high-end     → full effects including GPGPU
 */

import { useState, useEffect } from 'react'

export function useDeviceTier(): number {
  const [tier, setTier] = useState(2) // SSR-safe default

  useEffect(() => {
    let score = 2

    // CPU cores as device capability proxy
    const cores = navigator.hardwareConcurrency ?? 4
    if (cores <= 2) score = Math.min(score, 1)
    else if (cores >= 8) score = Math.max(score, 3)

    // WebGL2 support check
    try {
      const c = document.createElement('canvas')
      const gl2 = c.getContext('webgl2')
      if (!gl2) score = Math.min(score, 1)
    } catch {
      score = 0
    }

    // Device memory (Chrome only — non-standard)
    const mem = (navigator as { deviceMemory?: number }).deviceMemory
    if (mem !== undefined) {
      if (mem < 2) score = Math.min(score, 0)
      else if (mem < 4) score = Math.min(score, 1)
      else if (mem >= 8) score = Math.max(score, 3)
    }

    // Mobile: cap at tier 1
    if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      score = Math.min(score, 1)
    }

    setTier(score)
  }, [])

  return tier
}
