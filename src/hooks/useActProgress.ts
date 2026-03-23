'use client'

/**
 * useActProgress — returns normalized 0→1 progress for each submersion act.
 *
 * Act boundaries match SUBMERSION_JOURNEY_PROMPT.md:
 *   A0  0.00 → 0.15  Surface
 *   A1  0.15 → 0.28  Submersion
 *   A2  0.28 → 0.45  The Deep
 *   A3  0.45 → 0.62  Geometry Awakens
 *   A4  0.62 → 0.78  Full Hyperspace
 *   A5  0.78 → 0.92  The Turn
 *   A6  0.92 → 1.00  White Bloom
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
    p < 0.15 ? 0 :
    p < 0.28 ? 1 :
    p < 0.45 ? 2 :
    p < 0.62 ? 3 :
    p < 0.78 ? 4 :
    p < 0.92 ? 5 : 6

  return {
    act,
    a0: clamp01(p, 0.00, 0.15),
    a1: clamp01(p, 0.15, 0.28),
    a2: clamp01(p, 0.28, 0.45),
    a3: clamp01(p, 0.45, 0.62),
    a4: clamp01(p, 0.62, 0.78),
    a5: clamp01(p, 0.78, 0.92),
    a6: clamp01(p, 0.92, 1.00),
  }
}
