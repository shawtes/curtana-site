'use client'

/**
 * AmbientAudioProvider — Connects the ambient audio engine to the journey
 * progress events and renders the sound toggle button.
 *
 * Listens for 'journey-progress' custom events dispatched by SubmersionJourney.
 */

import { useEffect, useState, useCallback } from 'react'
import { useAmbientAudio } from '@/hooks/useAmbientAudio'
import SoundToggle from './SoundToggle'

export default function AmbientAudioProvider() {
  const audio = useAmbientAudio()
  const [enabled, setEnabled] = useState(false)

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
