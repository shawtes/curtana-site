'use client'

/**
 * TestimonialCard — "words drift in like leaves settling on water" (CLAUDE.md)
 *
 * Each card drifts in from a unique direction/angle on scroll reveal,
 * driven by the smooth-scroll custom event (getBoundingClientRect visual check).
 * DRIFT_VARIANTS gives each index a distinct entry angle for the leaf effect.
 */

import { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useTransform, MotionValue } from 'framer-motion'

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  delay?: number
  index?: number
}

const BREATH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Three distinct leaf-drift entry directions
const DRIFT_VARIANTS = [
  { x: -24, y: 36, rotate: -2.5 }, // drifts from bottom-left
  { x:   0, y: 48, rotate:  0   }, // falls straight down
  { x:  20, y: 32, rotate:  2.0 }, // drifts from bottom-right
]

export default function TestimonialCard({
  quote,
  name,
  role,
  delay = 0,
  index = 0,
}: TestimonialCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const drift = DRIFT_VARIANTS[index % DRIFT_VARIANTS.length]

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const check = () => {
      if (inView) return
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.88) {
        setInView(true)
      }
    }

    check()
    window.addEventListener('smooth-scroll', check)
    window.addEventListener('scroll', check, { passive: true })
    return () => {
      window.removeEventListener('smooth-scroll', check)
      window.removeEventListener('scroll', check)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: drift.x,
        y: drift.y,
        rotate: drift.rotate,
      }}
      animate={inView ? {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
      } : {
        opacity: 0,
        x: drift.x,
        y: drift.y,
        rotate: drift.rotate,
      }}
      transition={{
        duration: 1.1,
        delay: delay / 1000,
        ease: BREATH_EASE,
      }}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 'clamp(28px, 4vw, 40px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        transformOrigin: 'bottom center',
      }}
    >
      {/* Quotation mark */}
      <div
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: '64px',
          color: 'var(--sage)',
          lineHeight: 1,
          opacity: 0.4,
          marginBottom: -16,
        }}
      >
        "
      </div>

      {/* Quote */}
      <blockquote
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(17px, 2vw, 20px)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--sand-light)',
          lineHeight: 1.75,
          margin: 0,
        }}
      >
        {quote}
      </blockquote>

      {/* Attribution */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--sage-dark), var(--sage))',
            opacity: 0.7,
            flexShrink: 0,
          }}
        />
        <div>
          <p
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--text)',
              marginBottom: 2,
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            {role}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
