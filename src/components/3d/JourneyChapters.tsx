'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface Chapter {
  text: string
  from: number
  to: number
  align: 'left' | 'center' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  color?: string
  /** If true, text pulses opacity instead of holding steady */
  pulse?: boolean
}

// Chapters per SUBMERSION_JOURNEY_PROMPT.md
const CHAPTERS: Chapter[] = [
  { text: 'Private solutions\nto personal &\nprofessional problems.', from: 0.00, to: 0.14, align: 'left',   size: 'md' },
  { text: 'Let go.',                                                   from: 0.18, to: 0.27, align: 'center', size: 'lg' },
  { text: 'Go deeper.',                                                from: 0.30, to: 0.44, align: 'right',  size: 'sm', pulse: true },
  { text: 'The clarity\nyou\u2019ve been\nlooking for.',                   from: 0.50, to: 0.61, align: 'left',   size: 'md' },
  { text: 'Confidential.\nPersonal.\nPowerful.',                      from: 0.64, to: 0.76, align: 'center', size: 'md' },
  { text: 'She sees you.',                                             from: 0.82, to: 0.91, align: 'center', size: 'xl' },
  { text: 'Begin.',                                                    from: 0.93, to: 1.00, align: 'center', size: 'xxl', color: '#2a3f2e' },
]

const BREATH_EASE = [0.16, 1, 0.3, 1] as const

const sizeMap = {
  sm:  'clamp(18px, 3vw, 28px)',
  md:  'clamp(28px, 4vw, 48px)',
  lg:  'clamp(40px, 6vw, 72px)',
  xl:  'clamp(52px, 7vw, 88px)',
  xxl: 'clamp(64px, 9vw, 120px)',
}

const alignMap = {
  left: { top: '50%', left: '8%', right: 'auto', textAlign: 'left' as const, transform: 'translateY(-50%)' },
  right: { top: '50%', right: '8%', left: 'auto', textAlign: 'right' as const, transform: 'translateY(-50%)' },
  center: { top: '50%', left: '50%', right: 'auto', textAlign: 'center' as const, transform: 'translate(-50%, -50%)' },
}

export default function JourneyChapters({ progress }: { progress: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
      <AnimatePresence>
        {CHAPTERS.map((ch, i) => {
          const active = progress >= ch.from && progress <= ch.to
          if (!active) return null

          const pos = alignMap[ch.align]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={ch.pulse
                ? { opacity: [0.3, 0.6, 0.3], y: 0 }
                : { opacity: 1, y: 0 }
              }
              exit={{ opacity: 0, y: -10 }}
              transition={ch.pulse
                ? { opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 1.4, ease: BREATH_EASE as unknown as [number, number, number, number] } }
                : { duration: 1.4, ease: BREATH_EASE as unknown as [number, number, number, number] }
              }
              style={{
                position: 'absolute',
                ...pos,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: sizeMap[ch.size ?? 'md'],
                  color: ch.color ?? 'var(--cream, #f5f0eb)',
                  textShadow: '0 0 60px rgba(200,168,124,0.4)',
                  lineHeight: 1.2,
                  whiteSpace: 'pre-line',
                  margin: 0,
                }}
              >
                {ch.text}
              </h2>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
