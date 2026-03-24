'use client'

/**
 * useActProgress — 4-act simplified submersion cinematic.
 *
 *   A0  0.00 → 0.25  Surface        — meditating on water
 *   A1  0.25 → 0.60  Submersion     — descends, camera follows under
 *   A2  0.60 → 0.85  The Turn       — rotates to face camera
 *   A3  0.85 → 1.00  White Bloom    — light floods screen → into site
 */

function clamp01(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)))
}

export interface ActProgress {
  act: number
  a0: number
  a1: number
  a2: number
  a3: number
  a4: number
  a5: number
  a6: number
}

export function useActProgress(scrollProgress: number): ActProgress {
  const p = scrollProgress

  const act =
    p < 0.25 ? 0 :
    p < 0.60 ? 1 :
    p < 0.85 ? 2 : 3

  return {
    act,
    a0: clamp01(p, 0.00, 0.25),
    a1: clamp01(p, 0.25, 0.60),
    a2: clamp01(p, 0.60, 0.85),
    a3: clamp01(p, 0.85, 1.00),
    // legacy aliases — mapped so downstream code doesn't break
    a4: 0,
    a5: clamp01(p, 0.60, 0.85),  // "turn" progress (shrinks streaks, slow rings)
    a6: clamp01(p, 0.85, 1.00),  // "bloom" progress (was a6)
  }
}
