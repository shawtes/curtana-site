'use client'

import { useScramble } from '@/hooks/useScramble'

interface ScrambleLabelProps {
  text: string
  style?: React.CSSProperties
  className?: string
}

export default function ScrambleLabel({ text, style, className }: ScrambleLabelProps) {
  const { display } = useScramble(text)

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-body), sans-serif',
        fontSize: 11,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'var(--sage)',
        ...style,
      }}
    >
      {display}
    </span>
  )
}
