'use client'

/**
 * useAmbientAudio — Procedural ambient soundscape driven by animation progress.
 *
 * Audio is built immediately and resumed on ANY user gesture.
 * Browsers require a gesture to unlock AudioContext — we attach listeners
 * to every possible event and keep retrying until it works.
 */

import { useRef, useCallback, useEffect } from 'react'

// ── Equal-power crossfade helpers ────────────────────────────────────────────
function fadeIn(p: number, start: number, end: number): number {
  if (p <= start) return 0
  if (p >= end)   return 1
  return Math.sin(((p - start) / (end - start)) * Math.PI / 2)
}

function fadeOut(p: number, start: number, end: number): number {
  if (p <= start) return 1
  if (p >= end)   return 0
  return Math.cos(((p - start) / (end - start)) * Math.PI / 2)
}

// ── Noise buffer ────────────────────────────────────────────────────────────
function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const len    = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data   = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

export function useAmbientAudio() {
  const ctxRef   = useRef<AudioContext | null>(null)
  const builtRef = useRef(false)
  const mutedRef = useRef(false)
  const nodesRef = useRef<Record<string, AudioNode> | null>(null)

  // Build the entire audio graph once
  const build = useCallback(() => {
    if (builtRef.current) return
    builtRef.current = true

    const ctx = new AudioContext()
    ctxRef.current = ctx

    // ── Master chain ──────────────────────────────────────────────────────
    const masterFilter = ctx.createBiquadFilter()
    masterFilter.type = 'lowpass'
    masterFilter.frequency.value = 8000
    masterFilter.Q.value = 0.7

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.6
    masterFilter.connect(masterGain)
    masterGain.connect(ctx.destination)

    // ── Surface: warm pad + wind/water noise ──────────────────────────────
    const surfaceGain = ctx.createGain()
    surfaceGain.gain.value = 0.7
    surfaceGain.connect(masterFilter)

    const pad1 = ctx.createOscillator()
    pad1.type = 'triangle'
    pad1.frequency.value = 130.81  // C3
    pad1.connect(surfaceGain)

    const pad2 = ctx.createOscillator()
    pad2.type = 'triangle'
    pad2.frequency.value = 196.0   // G3
    const pad2g = ctx.createGain()
    pad2g.gain.value = 0.5
    pad2.connect(pad2g)
    pad2g.connect(surfaceGain)

    // Wind noise
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'highpass'
    noiseFilter.frequency.value = 2500
    noiseFilter.Q.value = 0.3
    noiseFilter.connect(surfaceGain)

    const noiseBuf = createNoiseBuffer(ctx, 4)
    const noise1 = ctx.createBufferSource()
    noise1.buffer = noiseBuf
    noise1.loop = true
    const noise1g = ctx.createGain()
    noise1g.gain.value = 0.18
    noise1.connect(noise1g)
    noise1g.connect(noiseFilter)

    // ── Descend: low drone + bubble noise ─────────────────────────────────
    const descendGain = ctx.createGain()
    descendGain.gain.value = 0
    descendGain.connect(masterFilter)

    const drone = ctx.createOscillator()
    drone.type = 'sine'
    drone.frequency.value = 65.41  // C2
    const droneg = ctx.createGain()
    droneg.gain.value = 0.7
    drone.connect(droneg)
    droneg.connect(descendGain)

    const bubbleFilter = ctx.createBiquadFilter()
    bubbleFilter.type = 'bandpass'
    bubbleFilter.frequency.value = 800
    bubbleFilter.Q.value = 5
    bubbleFilter.connect(descendGain)

    const noise2 = ctx.createBufferSource()
    noise2.buffer = noiseBuf
    noise2.loop = true
    const noise2g = ctx.createGain()
    noise2g.gain.value = 0.05
    noise2.connect(noise2g)
    noise2g.connect(bubbleFilter)

    // ── Deep: sub-bass with LFO wobble ────────────────────────────────────
    const deepGain = ctx.createGain()
    deepGain.gain.value = 0
    deepGain.connect(masterFilter)

    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.value = 41.2  // E1
    sub.connect(deepGain)

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.15
    const lfog = ctx.createGain()
    lfog.gain.value = 100
    lfo.connect(lfog)

    const deepFilter = ctx.createBiquadFilter()
    deepFilter.type = 'lowpass'
    deepFilter.frequency.value = 200
    deepFilter.Q.value = 4
    deepFilter.connect(deepGain)
    lfog.connect(deepFilter.frequency)

    // ── Ascend: rising tone ───────────────────────────────────────────────
    const ascendGain = ctx.createGain()
    ascendGain.gain.value = 0
    ascendGain.connect(masterFilter)

    const rise = ctx.createOscillator()
    rise.type = 'sine'
    rise.frequency.value = 261.63  // C4
    const riseg = ctx.createGain()
    riseg.gain.value = 0.5
    rise.connect(riseg)
    riseg.connect(ascendGain)

    // Start everything
    const now = ctx.currentTime
    pad1.start(now)
    pad2.start(now)
    noise1.start(now)
    drone.start(now)
    noise2.start(now)
    sub.start(now)
    lfo.start(now)
    rise.start(now)

    nodesRef.current = {
      masterGain, masterFilter,
      surfaceGain, descendGain, deepGain, ascendGain,
      bubbleFilter, rise,
    }

    // Try to resume immediately (works if called during gesture)
    ctx.resume().catch(() => {})
  }, [])

  // Aggressively try to resume the AudioContext
  const tryResume = useCallback(() => {
    if (!ctxRef.current) build()
    const ctx = ctxRef.current
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }, [build])

  // Toggle mute
  const toggle = useCallback(() => {
    tryResume()
    mutedRef.current = !mutedRef.current
    const mg = nodesRef.current?.masterGain as GainNode | undefined
    if (mg && ctxRef.current) {
      mg.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.6,
        ctxRef.current.currentTime,
        0.3
      )
    }
  }, [tryResume])

  // Update layers based on journey progress
  const update = useCallback((progress: number) => {
    if (!nodesRef.current || !ctxRef.current || mutedRef.current) return
    const n   = nodesRef.current
    const ctx = ctxRef.current
    const t   = ctx.currentTime

    const mg = n.masterFilter as BiquadFilterNode
    const sg = n.surfaceGain  as GainNode
    const dg = n.descendGain  as GainNode
    const eg = n.deepGain     as GainNode
    const ag = n.ascendGain   as GainNode
    const bf = n.bubbleFilter as BiquadFilterNode
    const ri = n.rise         as OscillatorNode

    // Master low-pass: surface bright → deep muffled → ascend opens
    let lpFreq: number
    if (progress < 0.6) {
      lpFreq = 8000 - (8000 - 250) * (progress / 0.6)
    } else {
      lpFreq = 250 + (6000 - 250) * ((progress - 0.6) / 0.4)
    }
    mg.frequency.setTargetAtTime(lpFreq, t, 0.1)

    // Surface: full at 0, fades out 0.20–0.50
    sg.gain.setTargetAtTime(fadeOut(progress, 0.20, 0.50) * 0.7, t, 0.15)

    // Descend: in 0.15–0.35, out 0.50–0.70
    dg.gain.setTargetAtTime(
      fadeIn(progress, 0.15, 0.35) * fadeOut(progress, 0.50, 0.70) * 0.5,
      t, 0.15
    )

    // Deep: in 0.45–0.60, out 0.80–0.92
    eg.gain.setTargetAtTime(
      fadeIn(progress, 0.45, 0.60) * fadeOut(progress, 0.80, 0.92) * 0.55,
      t, 0.15
    )

    // Ascend: in 0.78–0.92
    const ascVol = fadeIn(progress, 0.78, 0.92)
    ag.gain.setTargetAtTime(ascVol * 0.4, t, 0.15)
    ri.frequency.setTargetAtTime(261.63 + ascVol * 260, t, 0.3)

    // Bubble resonance increases with depth
    bf.Q.setTargetAtTime(5 + progress * 10, t, 0.2)
  }, [])

  // Build audio graph immediately on mount, attach gesture listeners
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    build()

    // Keep trying to resume on any user gesture
    const resume = () => tryResume()
    const events = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown', 'pointerdown'] as const
    events.forEach(e => document.addEventListener(e, resume, { capture: true }))

    // Visibility API: pause/resume
    const onVis = () => {
      if (!ctxRef.current) return
      if (document.hidden) ctxRef.current.suspend()
      else if (!mutedRef.current) ctxRef.current.resume().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      events.forEach(e => document.removeEventListener(e, resume, { capture: true } as EventListenerOptions))
      document.removeEventListener('visibilitychange', onVis)
      ctxRef.current?.close()
      ctxRef.current = null
      nodesRef.current = null
      builtRef.current = false
    }
  }, [build, tryResume])

  return {
    toggle,
    update,
    get muted() { return mutedRef.current },
  }
}
