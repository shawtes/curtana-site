'use client'

/**
 * useVirtualScroll — read current virtual scroll state anywhere in the tree.
 *
 * Wraps useSmoothScroll (the VirtualScroll context) and adds convenience
 * helpers for act-based scroll ranges.
 *
 * Usage:
 *   const { scrollY, progress, velocity } = useVirtualScroll()
 *
 *   // Progress within a specific pixel range:
 *   const heroProgress = rangeProgress(scrollY, 0, window.innerHeight * 8)
 */

import { useSmoothScroll } from '@/components/layout/SmoothScroll'

function rangeProgress(scrollY: number, start: number, end: number): number {
  if (end <= start) return 0
  return Math.min(1, Math.max(0, (scrollY - start) / (end - start)))
}

export function useVirtualScroll() {
  const { scrollY, scrollProgress, velocity } = useSmoothScroll()

  return {
    /** Current lerped scroll position in pixels (0 → maxScroll) */
    scrollY,
    /** Overall page progress 0→1 */
    progress: scrollProgress,
    /** Pixels per frame velocity (positive = scrolling down) */
    velocity,
    /** Get 0→1 progress within a specific pixel window */
    rangeProgress: (start: number, end: number) => rangeProgress(scrollY, start, end),
  }
}
