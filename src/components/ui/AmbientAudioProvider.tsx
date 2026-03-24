'use client'

/**
 * AmbientAudioProvider — Audio starts immediately on mount.
 * Browsers will suspend it until a user gesture — the hook handles
 * resuming on any click/touch/keydown automatically.
 */

import { useEffect, useState, useCallback } from 'react'
import { useAmbientAudio } from '@/hooks/useAmbientAudio'
import SoundToggle from './SoundToggle'

export default function AmbientAudioProvider() {
  const audio = useAmbientAudio()
  const [muted, setMuted] = useState(false)

  const handleToggle = useCallback(() => {
    audio.toggle()
    setMuted(prev => !prev)
  }, [audio])

  // Listen for journey progress
  useEffect(() => {
    const onProgress = (e: Event) => {
      const { p } = (e as CustomEvent<{ p: number }>).detail
      audio.update(p)
    }
    window.addEventListener('journey-progress', onProgress)
    return () => window.removeEventListener('journey-progress', onProgress)
  }, [audio])

  return <SoundToggle onToggle={handleToggle} enabled={!muted} />
}
