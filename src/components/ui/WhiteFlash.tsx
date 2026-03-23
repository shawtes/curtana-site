'use client'

/**
 * WhiteFlash — Warm-white overlay that fills the screen during Act 6 (White Bloom).
 *
 * Sits at z-index 100, pointer-events none.
 * The page content below fades in through it after opacity reaches 1.
 */

interface Props {
  /** 0 = fully transparent, 1 = fully opaque white */
  opacity: number
}

export default function WhiteFlash({ opacity }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        zIndex:        100,
        background:    '#faf8f4',   // warm white from spec
        opacity,
        pointerEvents: 'none',
        transition:    opacity > 0.9 ? 'none' : 'opacity 300ms ease',
        borderRadius:  'inherit',
      }}
    />
  )
}
