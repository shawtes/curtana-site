'use client'

/**
 * VHSetup — sets --vh CSS variable on every resize.
 *
 * Solves the mobile Safari viewport height bug where 100vh includes
 * the browser chrome. Use calc(var(--vh) * 100) instead of 100vh.
 *
 * Measured from lusion.co: --vh: 6.77px when viewport = 677px
 * Formula: window.innerHeight / 100
 *
 * No render output — pure side effect component.
 */

import { useEffect } from 'react'

export default function VHSetup() {
  useEffect(() => {
    const set = () =>
      document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`)

    set()
    window.addEventListener('resize', set)
    window.addEventListener('orientationchange', set)

    return () => {
      window.removeEventListener('resize', set)
      window.removeEventListener('orientationchange', set)
    }
  }, [])

  return null
}
