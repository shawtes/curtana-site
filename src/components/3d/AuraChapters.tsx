'use client'

import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface AuraSection {
  phase: 'about' | 'services' | 'testimonials' | 'cta'
  from: number
  to: number
  eyebrow: string
  heading: string
  mantra: string
  align: 'left' | 'center' | 'right'
}

const SECTIONS: AuraSection[] = [
  {
    phase: 'about',
    from: 0.02,
    to: 0.27,
    eyebrow: 'about',
    heading: 'More than\nmovement.',
    mantra: 'Your body already knows the way.',
    align: 'left',
  },
  {
    phase: 'services',
    from: 0.30,
    to: 0.57,
    eyebrow: 'what I offer',
    heading: 'Practices for\nevery body.',
    mantra: 'Choose your path. Begin where you are.',
    align: 'right',
  },
  {
    phase: 'testimonials',
    from: 0.60,
    to: 0.84,
    eyebrow: 'what others say',
    heading: 'Real\ntransformations.',
    mantra: 'Words that found their way home.',
    align: 'left',
  },
  {
    phase: 'cta',
    from: 0.87,
    to: 1.0,
    eyebrow: 'begin',
    heading: 'Ready\nto flow?',
    mantra: 'One breath. That is all it takes.',
    align: 'center',
  },
]

// Framer Motion named easing (avoids bezier tuple type conflicts in FM 12)
const BREATH_EASE = 'easeOut' as const

const alignStyles: Record<string, CSSProperties> = {
  left: {
    left: 'clamp(24px, 6vw, 80px)',
    right: 'auto',
    textAlign: 'left',
  },
  right: {
    right: 'clamp(24px, 6vw, 80px)',
    left: 'auto',
    textAlign: 'right',
  },
  center: {
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
  },
}

// Word-by-word animated text
function AnimatedWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <span style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1.1,
            delay: delay + i * 0.07,
            ease: BREATH_EASE,
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export default function AuraChapters({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {SECTIONS.map((s) => {
          const active = progress >= s.from && progress <= s.to
          if (!active) return null

          // How far into this section (0→1) — used for glass opacity
          const sectionProg = Math.min(1, (progress - s.from) / (s.to - s.from))

          const baseAlign = alignStyles[s.align]
          const verticalPos: CSSProperties =
            s.align === 'center'
              ? { bottom: 'clamp(60px, 10vh, 120px)', top: 'auto' }
              : { top: '50%', transform: s.align === 'left' ? 'translateY(-50%)' : 'translateY(-50%)' }

          const posStyle: CSSProperties = {
            position: 'absolute',
            maxWidth: 420,
            ...baseAlign,
            ...verticalPos,
            // fix transform conflict for left/right
            ...(s.align !== 'center'
              ? { top: '50%', transform: 'translateY(-50%)' }
              : {}),
          }

          return (
            <motion.div
              key={s.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 0.8, ease: BREATH_EASE }}
              style={posStyle}
            >
              {/* Glass panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: BREATH_EASE }}
                style={{
                  background: `rgba(13,15,14,${0.55 + sectionProg * 0.1})`,
                  backdropFilter: 'blur(18px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
                  border: '1px solid rgba(127,168,130,0.14)',
                  borderRadius: 20,
                  padding: 'clamp(24px, 3vw, 40px)',
                  boxShadow: '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                {/* Eyebrow */}
                <motion.p
                  initial={{ opacity: 0, x: s.align === 'right' ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.0, delay: 0.1, ease: BREATH_EASE }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    justifyContent: s.align === 'right' ? 'flex-end' : s.align === 'center' ? 'center' : 'flex-start',
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: '10px',
                    letterSpacing: '3.5px',
                    textTransform: 'uppercase',
                    color: 'var(--sage)',
                    marginBottom: 14,
                  }}
                >
                  {s.align !== 'right' && (
                    <span style={{ display: 'inline-block', width: 20, height: 1, background: 'var(--sage)', opacity: 0.6 }} />
                  )}
                  {s.eyebrow}
                  {s.align === 'right' && (
                    <span style={{ display: 'inline-block', width: 20, height: 1, background: 'var(--sage)', opacity: 0.6 }} />
                  )}
                </motion.p>

                {/* Main heading — word by word */}
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 'clamp(32px, 4.5vw, 58px)',
                    color: 'var(--cream)',
                    lineHeight: 1.08,
                    letterSpacing: '-1px',
                    margin: '0 0 16px',
                    whiteSpace: 'pre-line',
                    textShadow: '0 0 80px rgba(200,168,124,0.3)',
                  }}
                >
                  {s.heading.split('\n').map((line, li) => (
                    <span key={li} style={{ display: 'block' }}>
                      <AnimatedWords text={line} delay={0.2 + li * 0.12} />
                    </span>
                  ))}
                </h2>

                {/* Mantra line */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.65, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.55, ease: BREATH_EASE }}
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 'clamp(14px, 1.8vw, 20px)',
                    color: 'var(--sand)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {s.mantra}
                </motion.p>
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
