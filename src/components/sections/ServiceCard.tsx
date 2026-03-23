'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTilt } from '@/hooks/useTilt'
import { useDepthParallax } from '@/hooks/useDepthParallax'

interface ServiceCardProps {
  tag: string
  title: string
  subtitle: string
  duration: string
  description: string
  href?: string
  delay?: number
}

const BREATH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function ServiceCard({
  tag,
  title,
  subtitle,
  duration,
  description,
  href = '/services',
  delay = 0,
}: ServiceCardProps) {
  const [hovered, setHovered] = useState(false)
  const { ref: tiltRef, shineRef } = useTilt(5)
  const { containerRef, glowRef, accentRef, titleRef, ctaRef } = useDepthParallax()

  // Merge tiltRef and containerRef onto the same element
  const setRefs = (el: HTMLDivElement | null) => {
    ;(tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: BREATH_EASE }}
    >
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          ref={setRefs}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            background: 'var(--surface)',
            border: '1px solid',
            borderColor: hovered ? 'var(--border2)' : 'var(--border)',
            borderRadius: 20,
            padding: 'clamp(28px, 4vw, 40px)',
            overflow: 'hidden',
            boxShadow: hovered
              ? '0 24px 64px rgba(0,0,0,0.4), 0 0 40px var(--sage-glow)'
              : '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'border-color 400ms ease, box-shadow 600ms ease',
          }}
        >
          {/* Specular shine */}
          <div
            ref={shineRef}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 300ms ease',
            }}
          />

          {/* Depth layer 0 — bg glow (recedes, inverted parallax) */}
          <div
            ref={glowRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% -20%, var(--sage-glow) 0%, transparent 60%)',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 600ms ease',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />

          {/* Depth layer 1 — accent top line (gentle drift) */}
          <div
            ref={accentRef}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 2,
              background: 'linear-gradient(90deg, var(--sage), var(--sand))',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 400ms ease',
              willChange: 'transform',
            }}
          />

          {/* Tag — no parallax (structural anchor) */}
          <p style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 11, letterSpacing: '3px',
            textTransform: 'uppercase', color: 'var(--sage)',
            marginBottom: 16,
          }}>
            {tag}
          </p>

          {/* Depth layer 2 — title + subtitle float forward */}
          <div ref={titleRef} style={{ willChange: 'transform' }}>
            <h3 style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 24, fontWeight: 500,
              color: 'var(--cream)', marginBottom: 6, lineHeight: 1.2,
            }}>
              {title}
            </h3>

            <p style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 16, fontStyle: 'italic', fontWeight: 300,
              color: 'var(--sand)', marginBottom: 12,
            }}>
              {subtitle}
            </p>

            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 12, letterSpacing: '1.5px',
              color: 'var(--muted)', marginBottom: 20,
              textTransform: 'uppercase',
            }}>
              {duration}
            </p>
          </div>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

          {/* Description — base depth */}
          <p style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 14, fontWeight: 300,
            color: 'var(--muted)', lineHeight: 1.85, marginBottom: 28,
          }}>
            {description}
          </p>

          {/* Depth layer 3 — CTA closest to viewer, max parallax */}
          <div
            ref={ctaRef}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 12, letterSpacing: '2px',
              textTransform: 'uppercase',
              color: hovered ? 'var(--sage-light)' : 'var(--muted)',
              transition: 'color 300ms ease',
              willChange: 'transform',
            }}
          >
            <span>Learn more</span>
            <span style={{
              transform: hovered ? 'translateX(4px)' : 'none',
              transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
              display: 'inline-block',
            }}>→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
