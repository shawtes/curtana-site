'use client'

/**
 * SoundToggle — Floating mute/unmute button.
 * First click also serves as the user gesture to unlock Web Audio.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onToggle: () => void
  enabled:  boolean
}

export default function SoundToggle({ onToggle, enabled }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-label={enabled ? 'Mute sound' : 'Enable sound'}
      style={{
        position:      'fixed',
        bottom:        24,
        left:          24,
        zIndex:        100,
        width:         44,
        height:        44,
        borderRadius:  '50%',
        border:        '1px solid rgba(127,168,130,0.25)',
        background:    'rgba(13,15,14,0.6)',
        backdropFilter: 'blur(12px)',
        display:       'flex',
        alignItems:    'center',
        justifyContent: 'center',
        cursor:        'pointer',
        padding:       0,
        outline:       'none',
        transition:    'border-color 0.3s, background 0.3s',
        ...(hovered ? {
          borderColor: 'rgba(127,168,130,0.5)',
          background:  'rgba(13,15,14,0.8)',
        } : {}),
      }}
    >
      {/* Sound wave icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--sage, #7fa882)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Speaker body */}
        <path d="M11 5L6 9H2v6h4l5 4V5z" />

        <AnimatePresence mode="wait">
          {enabled ? (
            <motion.g
              key="on"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Sound waves */}
              <path d="M15.5 8.5a5 5 0 010 7" />
              <path d="M19 5a10 10 0 010 14" opacity={0.5} />
            </motion.g>
          ) : (
            <motion.g
              key="off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Mute X */}
              <line x1="22" y1="2" x2="15" y2="9" />
              <line x1="15" y1="15" x2="22" y2="22" />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </motion.button>
  )
}
