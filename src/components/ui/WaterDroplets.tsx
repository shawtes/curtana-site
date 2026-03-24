'use client'

/**
 * WaterDroplets — Layer 7: DOM overlay showing water droplets sliding
 * down the screen when the camera crosses the waterline.
 *
 * When `triggered` flips to true, 30-40 droplets spawn at random X positions
 * and slide downward over 1.5–2.5s, then fade out.
 */

import React, { useEffect, useState, useRef } from 'react'

interface Droplet {
  id: number
  x: number      // percent from left
  startY: number // percent from top
  size: number   // px
  duration: number // seconds
  delay: number  // seconds
}

interface Props {
  triggered: boolean
}

export default function WaterDroplets({ triggered }: Props) {
  const [droplets, setDroplets] = useState<Droplet[]>([])
  const prevTriggered = useRef(false)
  const idCounter = useRef(0)

  useEffect(() => {
    // Only spawn when triggered flips from false to true
    if (triggered && !prevTriggered.current) {
      const count = 30 + Math.floor(Math.random() * 11) // 30-40
      const newDroplets: Droplet[] = []
      for (let i = 0; i < count; i++) {
        newDroplets.push({
          id: idCounter.current++,
          x: Math.random() * 100,
          startY: 15 + Math.random() * 30, // spawn in middle zone
          size: 8 + Math.random() * 12,
          duration: 1.5 + Math.random() * 1.0,
          delay: Math.random() * 0.3,
        })
      }
      setDroplets(newDroplets)

      // Clear droplets after longest possible animation
      const timeout = setTimeout(() => {
        setDroplets([])
      }, 3000)

      return () => clearTimeout(timeout)
    }
    prevTriggered.current = triggered
  }, [triggered])

  if (droplets.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {droplets.map((d) => (
        <div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.startY}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: 'rgba(143,181,196,0.25)',
            border: '1px solid rgba(143,181,196,0.4)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            animation: `droplet-fall ${d.duration}s ${d.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}

      <style>{`
        @keyframes droplet-fall {
          0% {
            opacity: 0.8;
            transform: translateY(0);
          }
          70% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: translateY(60vh);
          }
        }
      `}</style>
    </div>
  )
}
