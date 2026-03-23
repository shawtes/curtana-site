'use client'

/**
 * ScrollReveal — compatible with SmoothScroll's translate3d approach
 *
 * Uses getBoundingClientRect() instead of IntersectionObserver because
 * getBoundingClientRect() reads visual (post-transform) position, which
 * correctly reflects where elements appear on screen after the translate3d
 * applied by SmoothScroll. IntersectionObserver uses layout position and
 * would fire too early.
 *
 * Listens to 'smooth-scroll' custom event (dispatched by SmoothScroll RAF)
 * and native 'scroll' (fallback for reduced-motion / SSR).
 */

import { useEffect, useRef, ReactNode, useState } from 'react'
import { motion, Variants } from 'framer-motion'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  yOffset?: number
  className?: string
  once?: boolean
}

const BREATH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
// Reveal when element top enters lower 85% of viewport
const REVEAL_THRESHOLD = 0.85

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 1000,
  yOffset = 32,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const check = () => {
      if (once && inView) return
      const rect = el.getBoundingClientRect()
      const visible = rect.top < window.innerHeight * REVEAL_THRESHOLD
      if (visible) setInView(true)
      else if (!once) setInView(false)
    }

    // Check immediately (element may already be visible on load)
    check()

    // Listen to smooth-scroll events (60fps during scroll)
    window.addEventListener('smooth-scroll', check)
    // Fallback: native scroll (reduced-motion path)
    window.addEventListener('scroll', check, { passive: true })

    return () => {
      window.removeEventListener('smooth-scroll', check)
      window.removeEventListener('scroll', check)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once])

  const variants: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration / 1000,
        delay: delay / 1000,
        ease: BREATH_EASE,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
