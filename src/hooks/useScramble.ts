'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// Wellness adaptation: softer character set — no punctuation symbols
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function useScramble(text: string, autoRepeat = 0) {
  const [display, setDisplay] = useState(text)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let iter = 0
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < iter) return text[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )

      if (iter >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplay(text)
      }
      iter += 0.35
    }, 35)
  }, [text])

  useEffect(() => {
    const timer = setTimeout(scramble, 600)

    if (autoRepeat) {
      repeatRef.current = setInterval(scramble, autoRepeat)
    }

    return () => {
      clearTimeout(timer)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (repeatRef.current) clearInterval(repeatRef.current)
    }
  }, [scramble, autoRepeat])

  return { display, scramble }
}
