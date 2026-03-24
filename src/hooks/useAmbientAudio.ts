'use client'

/**
 * useAmbientAudio — Gentle ambient piano that plays the whole time.
 *
 * Creates AudioContext on the FIRST user gesture (click/tap/keydown).
 * Safari requires AudioContext to be created during a gesture, not just resumed.
 */

import { useRef, useCallback, useEffect } from 'react'

const NOTES = [
  261.63, 293.66, 329.63, 392.00, 440.00,  // C4 D4 E4 G4 A4
  523.25, 587.33, 659.25, 783.99, 880.00,  // C5 D5 E5 G5 A5
]

export function useAmbientAudio() {
  const ctxRef      = useRef<AudioContext | null>(null)
  const masterRef   = useRef<GainNode | null>(null)
  const mixRef      = useRef<GainNode | null>(null)
  const mutedRef    = useRef(false)
  const startedRef  = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cleanupRef  = useRef<(() => void) | null>(null)

  const playNote = useCallback((ctx: AudioContext, dest: AudioNode, freq: number) => {
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = freq

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 1.002

    const osc3 = ctx.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.value = freq * 2

    const noteGain = ctx.createGain()
    noteGain.gain.setValueAtTime(0, now)
    noteGain.gain.linearRampToValueAtTime(0.12, now + 0.08)
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5)

    const osc2g = ctx.createGain()
    osc2g.gain.value = 0.7
    const osc3g = ctx.createGain()
    osc3g.gain.value = 0.15

    osc1.connect(noteGain)
    osc2.connect(osc2g); osc2g.connect(noteGain)
    osc3.connect(osc3g); osc3g.connect(noteGain)
    noteGain.connect(dest)

    osc1.start(now); osc2.start(now); osc3.start(now)
    osc1.stop(now + 5); osc2.stop(now + 5); osc3.stop(now + 5)
  }, [])

  // Build and start — called INSIDE a user gesture handler
  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    ctxRef.current = ctx

    // Delay + feedback for reverb
    const delay = ctx.createDelay(1.0)
    delay.delayTime.value = 0.4
    const feedback = ctx.createGain()
    feedback.gain.value = 0.3
    const delayFilter = ctx.createBiquadFilter()
    delayFilter.type = 'lowpass'
    delayFilter.frequency.value = 2000

    const master = ctx.createGain()
    master.gain.value = 0.15
    masterRef.current = master

    const dry = ctx.createGain()
    dry.gain.value = 1.0
    dry.connect(master)

    const wet = ctx.createGain()
    wet.gain.value = 0.5
    wet.connect(delay)
    delay.connect(delayFilter)
    delayFilter.connect(feedback)
    feedback.connect(delay)
    delayFilter.connect(master)

    const mix = ctx.createGain()
    mix.gain.value = 1.0
    mix.connect(dry)
    mix.connect(wet)
    mixRef.current = mix

    master.connect(ctx.destination)

    // Play first note immediately
    let lastIdx = -1
    const scheduleNote = () => {
      if (!ctxRef.current || ctxRef.current.state !== 'running' || mutedRef.current) return
      let idx = Math.floor(Math.random() * NOTES.length)
      if (idx === lastIdx) idx = (idx + 1) % NOTES.length
      lastIdx = idx
      playNote(ctxRef.current, mix, NOTES[idx])

      if (Math.random() < 0.3) {
        const offset = Math.random() < 0.5 ? 2 : 4
        const chordIdx = (idx + offset) % NOTES.length
        setTimeout(() => {
          if (ctxRef.current?.state === 'running') {
            playNote(ctxRef.current, mix, NOTES[chordIdx])
          }
        }, 150 + Math.random() * 200)
      }
    }

    scheduleNote()
    intervalRef.current = setInterval(scheduleNote, 2800)

    // Resume just in case
    ctx.resume().catch(() => {})
  }, [playNote])

  const toggle = useCallback(() => {
    if (!startedRef.current) start()
    mutedRef.current = !mutedRef.current
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.15,
        ctxRef.current.currentTime, 0.3
      )
    }
  }, [start])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const update = useCallback((_p?: number) => {}, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Start audio on first user gesture — this is the ONLY way to
    // reliably unlock AudioContext on Safari, Chrome, and Firefox
    const onGesture = () => {
      if (startedRef.current) {
        // Already started — just make sure it's running
        ctxRef.current?.resume().catch(() => {})
        return
      }
      start()
    }

    const evts = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown', 'pointerdown'] as const
    evts.forEach(e => document.addEventListener(e, onGesture, { capture: true }))

    const onVis = () => {
      if (!ctxRef.current) return
      if (document.hidden) ctxRef.current.suspend()
      else if (!mutedRef.current) ctxRef.current.resume().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)

    cleanupRef.current = () => {
      evts.forEach(e => document.removeEventListener(e, onGesture, { capture: true } as EventListenerOptions))
      document.removeEventListener('visibilitychange', onVis)
      if (intervalRef.current) clearInterval(intervalRef.current)
      ctxRef.current?.close()
    }

    return () => cleanupRef.current?.()
  }, [start])

  return { toggle, update, get muted() { return mutedRef.current } }
}
