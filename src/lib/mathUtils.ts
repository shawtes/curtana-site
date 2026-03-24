/**
 * mathUtils — frame-rate-independent math helpers.
 * Ported directly from shaw-portfolio/src/lib/mathUtils.ts
 */

export function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b
}

/**
 * Exponential damp — frame-rate independent equivalent of lerp.
 * damp(a, b, lambda=8, dt) at 60 fps ≈ lerp(a, b, 0.125)
 * Same visual result at 30 fps, 60 fps, 144 fps.
 *
 * lambda guide:
 *   4  → very slow coast (~1.2 s settle)
 *   5  → slow / cinematic (~1.0 s settle) ← Curtana default
 *   8  → medium / responsive (~0.6 s settle) ← shaw-portfolio default
 *  12  → snappy / near-instant
 */
export function damp(a: number, b: number, lambda: number, dt: number): number {
  return lerp(a, b, 1 - Math.exp(-lambda * dt))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function remap(
  value: number,
  fromMin: number, fromMax: number,
  toMin: number,  toMax: number,
): number {
  const t = clamp((value - fromMin) / (fromMax - fromMin), 0, 1)
  return lerp(toMin, toMax, t)
}
