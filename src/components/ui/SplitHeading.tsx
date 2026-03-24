'use client'

/**
 * SplitHeading — splits a heading into words and staggers them in on scroll.
 * Each word slides up and fades in with a 60ms stagger.
 */

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const BREATH: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface Props {
  as?:       'h1' | 'h2' | 'h3'
  children:  string
  style?:    React.CSSProperties
  delay?:    number   // base delay in ms before first word
  duration?: number   // per-word duration in ms
}

export default function SplitHeading({
  as: Tag = 'h2',
  children,
  style,
  delay    = 0,
  duration = 700,
}: Props) {
  const ref    = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.88) setInView(true)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  const words = children.split(' ')

  return (
    <div ref={ref}>
      <Tag style={{ ...style, overflow: 'hidden', display: 'block' }}>
        {words.map((word, i) => (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.28em' }}>
            <motion.span
              initial={{ y: '105%', opacity: 0 }}
              animate={inView ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
              transition={{
                duration: duration / 1000,
                delay:    delay / 1000 + i * 0.06,
                ease:     BREATH,
              }}
              style={{ display: 'inline-block' }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </Tag>
    </div>
  )
}
