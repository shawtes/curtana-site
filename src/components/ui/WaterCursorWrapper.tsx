'use client'

import dynamic from 'next/dynamic'

const WaterCursor = dynamic(() => import('./WaterCursor'), {
  ssr: false,
})

export default function WaterCursorWrapper() {
  return <WaterCursor />
}
