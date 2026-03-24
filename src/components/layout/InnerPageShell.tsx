'use client'

/**
 * InnerPageShell — shared wrapper for all inner pages (About, Services, Book, Contact).
 *
 * Provides:
 *   1. Fixed MistScene particle canvas in the background (lazy-loaded, no SSR)
 *   2. Page-level fade-in on mount (Framer Motion, 800ms breath ease)
 *   3. Consistent paddingTop for nav clearance
 *
 * Usage:
 *   export default function AboutPage() {
 *     return <InnerPageShell><main>...</main></InnerPageShell>
 *   }
 */

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Lazy-load MistScene — Three.js canvas, no SSR
const MistScene = dynamic(() => import('@/components/3d/MistScene'), {
  ssr: false,
  loading: () => null,
})

const EASE = [0.16, 1, 0.3, 1] as const

interface InnerPageShellProps {
  children: ReactNode
}

export default function InnerPageShell({ children }: InnerPageShellProps) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>

      {/* ── MistScene — fixed particle atmosphere ─────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:  'fixed',
          inset:     0,
          zIndex:    0,
          pointerEvents: 'none',
          // Fade it after ~60% of viewport so content reads cleanly on scroll
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 80%, transparent 100%)',
          maskImage:        'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 80%, transparent 100%)',
        }}
      >
        <MistScene scrollProgress={0} />
      </div>

      {/* ── Vignette overlay to deepen edges ──────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:  'fixed',
          inset:     0,
          zIndex:    1,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(13,15,14,0.55) 100%)',
        }}
      />

      {/* ── Page content — fades in on mount ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        {children}
      </motion.div>

    </div>
  )
}
