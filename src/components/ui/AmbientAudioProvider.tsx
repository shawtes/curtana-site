'use client'

/**
 * AmbientAudioProvider — Auto-enables ambient audio on first user interaction.
 * Connects to journey-progress events from SubmersionJourney.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAmbientAudio } from '@/hooks/useAmbientAudio'
import SoundToggle from './SoundToggle'

export default function AmbientAudioProvider() {
  const audio = useAmbientAudio()
  const [enabled, setEnabled] = useState(false)
  const autoEnabled = useRef(false)

  // Auto-enable audio on first user interaction (click, touch, keydown, scroll)
  useEffect(() => {
    const unlock = () => {
      if (autoEnabled.current) return
      autoEnabled.current = true
      audio.enable()
      setEnabled(true)
      // Clean up all listeners
      window.removeEventListener('click', unlock, true)
      window.removeEventListener('touchstart', unlock, true)
      window.removeEventListener('keydown', unlock, true)
      window.removeEventListener('wheel', unlock, true)
    }

    window.addEventListener('click', unlock, { capture: true, once: false })
    window.addEventListener('touchstart', unlock, { capture: true, once: false })
    window.addEventListener('keydown', unlock, { capture: true, once: false })
    window.addEventListener('wheel', unlock, { capture: true, once: false })

    return () => {
      window.removeEventListener('click', unlock, true)
      window.removeEventListener('touchstart', unlock, true)
      window.removeEventListener('keydown', unlock, true)
      window.removeEventListener('wheel', unlock, true)
    }
  }, [audio])

  const handleToggle = useCallback(() => {
    audio.toggle()
    setEnabled(prev => !prev)
  }, [audio])

  // Listen for journey progress events
  useEffect(() => {
    const onProgress = (e: Event) => {
      const { p } = (e as CustomEvent<{ p: number }>).detail
      audio.update(p)
    }
    window.addEventListener('journey-progress', onProgress)
    return () => window.removeEventListener('journey-progress', onProgress)
  }, [audio])

  return <SoundToggle onToggle={handleToggle} enabled={enabled} />
}
