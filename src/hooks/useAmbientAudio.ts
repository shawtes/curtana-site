'use client'

/**
 * useAmbientAudio — Gentle ambient piano that plays the entire time.
 *
 * Generates a slow, meditative piano-like sequence using the Web Audio API.
 * Notes from a pentatonic scale play softly with long decay, creating
 * a continuous, peaceful atmosphere like a spa or meditation studio.
 */

import { useRef, useCallback, useEffect } from 'react'

// C major pentatonic across two octaves — always sounds peaceful
const NOTES = [
  261.63, 293.66, 329.63, 392.00, 440.00,  // C4 D4 E4 G4 A4
  523.25, 587.33, 659.25, 783.99, 880.00,  // C5 D5 E5 G5 A5
]

export function useAmbientAudio() {
  const ctxRef      = useRef<AudioContext | null>(null)
  const builtRef    = useRef(false)
  const mutedRef    = useRef(false)
  const masterRef   = useRef<GainNode | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const playNote = useCallback((ctx: AudioContext, dest: AudioNode, freq: number) => {
    const now = ctx.currentTime

    // Two detuned sines — gives warmth like a felt piano
    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = freq

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 1.002  // slight detune for warmth

    // Soft harmonic overtone
    const osc3 = ctx.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.value = freq * 2  // octave above, very quiet

    const noteGain = ctx.createGain()
    noteGain.gain.setValueAtTime(0, now)
    // Soft attack, long decay — like a piano key gently pressed
    noteGain.gain.linearRampToValueAtTime(0.12, now + 0.08)
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5)

    const osc2Gain = ctx.createGain()
    osc2Gain.gain.value = 0.7

    const osc3Gain = ctx.createGain()
    osc3Gain.gain.value = 0.15

    osc1.connect(noteGain)
    osc2.connect(osc2Gain)
    osc2Gain.connect(noteGain)
    osc3.connect(osc3Gain)
    osc3Gain.connect(noteGain)
    noteGain.connect(dest)

    osc1.start(now)
    osc2.start(now)
    osc3.start(now)
    osc1.stop(now + 5)
    osc2.stop(now + 5)
    osc3.stop(now + 5)
  }, [])

  const build = useCallback(() => {
    if (builtRef.current) return
    builtRef.current = true

    const ctx = new AudioContext()
    ctxRef.current = ctx

    // Reverb-like effect using delay + feedback
    const delay = ctx.createDelay(1.0)
    delay.delayTime.value = 0.4

    const feedback = ctx.createGain()
    feedback.gain.value = 0.3

    const delayFilter = ctx.createBiquadFilter()
    delayFilter.type = 'lowpass'
    delayFilter.frequency.value = 2000

    // Master output
    const master = ctx.createGain()
    master.gain.value = 0.15
    masterRef.current = master

    // Dry path
    const dry = ctx.createGain()
    dry.gain.value = 1.0
    dry.connect(master)

    // Wet path (delay → filter → feedback loop)
    const wet = ctx.createGain()
    wet.gain.value = 0.5
    wet.connect(delay)
    delay.connect(delayFilter)
    delayFilter.connect(feedback)
    feedback.connect(delay)  // feedback loop
    delayFilter.connect(master)

    // Mix node — notes connect here
    const mix = ctx.createGain()
    mix.gain.value = 1.0
    mix.connect(dry)
    mix.connect(wet)

    master.connect(ctx.destination)

    // Play notes on a slow interval — 2-3 seconds apart, random from scale
    let lastIdx = -1
    const scheduleNote = () => {
      if (ctx.state !== 'running' || mutedRef.current) return
      // Pick a note, avoid repeating the same one
      let idx = Math.floor(Math.random() * NOTES.length)
      if (idx === lastIdx) idx = (idx + 1) % NOTES.length
      lastIdx = idx
      playNote(ctx, mix, NOTES[idx])

      // Occasionally play a second note for a gentle chord (30% chance)
      if (Math.random() < 0.3) {
        const offset = Math.random() < 0.5 ? 2 : 4  // third or fifth
        const chordIdx = (idx + offset) % NOTES.length
        setTimeout(() => {
          if (ctx.state === 'running') playNote(ctx, mix, NOTES[chordIdx])
        }, 150 + Math.random() * 200)
      }
    }

    // First note after a short delay
    setTimeout(scheduleNote, 500)
    // Then every 2.5–4 seconds (randomized)
    intervalRef.current = setInterval(() => {
      scheduleNote()
    }, 2800)

    ctx.resume().catch(() => {})
  }, [playNote])

  const tryResume = useCallback(() => {
    if (!ctxRef.current) build()
    const ctx = ctxRef.current
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
  }, [build])

  const toggle = useCallback(() => {
    tryResume()
    mutedRef.current = !mutedRef.current
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.15,
        ctxRef.current.currentTime, 0.3
      )
    }
  }, [tryResume])

  // No-op — kept for compatibility with AmbientAudioProvider
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const update = useCallback((_progress?: number) => {}, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    build()

    const resume = () => tryResume()
    const evts = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown', 'pointerdown'] as const
    evts.forEach(e => document.addEventListener(e, resume, { capture: true }))

    const onVis = () => {
      if (!ctxRef.current) return
      if (document.hidden) ctxRef.current.suspend()
      else if (!mutedRef.current) ctxRef.current.resume().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      evts.forEach(e => document.removeEventListener(e, resume, { capture: true } as EventListenerOptions))
      document.removeEventListener('visibilitychange', onVis)
      if (intervalRef.current) clearInterval(intervalRef.current)
      ctxRef.current?.close()
      ctxRef.current = null
      builtRef.current = false
    }
  }, [build, tryResume])

  return { toggle, update, get muted() { return mutedRef.current } }
}
