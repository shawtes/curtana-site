'use client'

/**
 * ClientLayout — Lusion-style page transition.
 *
 * On every route change:
 *   1. Sage-tinted curtain sweeps UP from bottom (covers screen) — 500ms
 *   2. New page content mounts underneath
 *   3. Curtain sweeps UP off-screen to reveal new page — 600ms
 *
 * Input-blocker: pointer-events:none on the curtain prevents mis-clicks.
 * Matches Lusion's #input-blocker pattern exactly.
 */

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      {/* ── Page content — fades in gently after curtain exits ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.35, ease: EASE } }}
          exit={{    opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* ── Curtain overlay — sweeps in then out on every route change ── */}
      <AnimatePresence>
        <motion.div
          key={`curtain-${pathname}`}
          initial={{    clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{
            clipPath:   ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'],
            transition: {
              duration: 1.1,
              times:    [0, 0.45, 1],
              ease:     EASE,
            },
          }}
          style={{
            position:      'fixed',
            inset:         0,
            zIndex:        200,
            pointerEvents: 'none',
            background:    'linear-gradient(160deg, #1c211d 0%, #0d1210 60%, #141815 100%)',
            willChange:    'clip-path',
          }}
        >
          {/* Sage accent line that draws across the curtain */}
          <div style={{
            position:   'absolute',
            bottom:     '50%',
            left:       0,
            right:      0,
            height:     1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(127,168,130,0.4) 40%, rgba(201,169,110,0.3) 70%, transparent 100%)',
          }} />

          {/* Brand mark on curtain */}
          <div style={{
            position:   'absolute',
            top:        '50%',
            left:       '50%',
            transform:  'translate(-50%, -50%)',
            fontFamily: 'var(--font-display), Georgia, serif',
            fontStyle:  'italic',
            fontWeight: 300,
            fontSize:   'clamp(20px, 3vw, 32px)',
            color:      'rgba(245,240,232,0.15)',
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap',
          }}>
            Flow With Curtana
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
