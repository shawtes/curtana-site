'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * SVG path that draws itself downward as the user scrolls.
 * Like breath tracing a path through the body.
 *
 * The line weaves left/right in a gentle S-curve.
 * At each major section, it blooms into a small circle node.
 */
export default function ScrollPath({ progress }: { progress: number }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)

  // Measure path length on mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [])

  const dashOffset = pathLength * (1 - progress)

  // Node positions (0→1 progress for each section break)
  const nodes = [0.2, 0.4, 0.6, 0.8]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 50,
        opacity: 0.35,
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Main organic S-curve path */}
        <path
          ref={pathRef}
          d="M 50 0 C 30 100, 70 200, 50 250 C 30 300, 70 400, 50 500 C 30 600, 70 700, 50 750 C 30 850, 70 900, 50 1000"
          fill="none"
          stroke="var(--sage, #7fa882)"
          strokeWidth="0.3"
          strokeLinecap="round"
          strokeDasharray={pathLength || 1}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />

        {/* Section nodes — small circles that appear as the line reaches them */}
        {nodes.map((nodeProgress, i) => {
          const visible = progress >= nodeProgress
          const nodeY = nodeProgress * 1000
          // Alternate left/right to follow the S curve
          const nodeX = i % 2 === 0 ? 35 : 65

          return (
            <g key={i}>
              {/* Bloom circle */}
              <circle
                cx={50}
                cy={nodeY}
                r={visible ? 4 : 0}
                fill="none"
                stroke="var(--sage, #7fa882)"
                strokeWidth="0.3"
                opacity={visible ? 0.6 : 0}
                style={{ transition: 'r 600ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease' }}
              />
              {/* Center dot */}
              <circle
                cx={50}
                cy={nodeY}
                r={visible ? 1 : 0}
                fill="var(--sage, #7fa882)"
                opacity={visible ? 0.8 : 0}
                style={{ transition: 'r 400ms cubic-bezier(0.16,1,0.3,1) 100ms, opacity 300ms ease' }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
