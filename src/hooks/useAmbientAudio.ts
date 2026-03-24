'use client'

/**
 * useAmbientAudio — Procedural ambient soundscape driven by animation progress.
 *
 * Layers (all procedural — no audio files needed):
 *   Surface  (p 0.00–0.30)  Warm pad + filtered noise (wind on water)
 *   Descend  (p 0.20–0.60)  Low drone + bubble-like resonant noise
 *   Deep     (p 0.50–0.85)  Sub-bass + slow evolving filter
 *   Ascend   (p 0.75–1.00)  Rising tone + opening filter
 *
 * Master low-pass filter sweeps 8000 Hz → 250 Hz → 8000 Hz with depth.
 *
 * Audio is gated behind a user gesture (call `enable()` from a click handler).
 * Respects prefers-reduced-motion by staying silent.
 */

import { useRef, useCallback, useEffect } from 'react'

// ── Equal-power crossfade helpers ────────────────────────────────────────────
function fadeIn(p: number, start: number, end: number): number {
  if (p <= start) return 0
  if (p >= end)   return 1
  const t = (p - start) / (end - start)
  return Math.sin(t * Math.PI / 2)
}

function fadeOut(p: number, start: number, end: number): number {
  if (p <= start) return 1
  if (p >= end)   return 0
  const t = (p - start) / (end - start)
  return Math.cos(t * Math.PI / 2)
}

// ── Noise buffer generator ──────────────────────────────────────────────────
function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const len    = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data   = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

interface AmbientAudio {
  /** Call from a click/touch handler to unlock audio */
  enable:  () => void
  /** Call from a click/touch handler to toggle mute */
  toggle:  () => void
  /** Update every frame with current animation progress 0→1 */
  update:  (progress: number) => void
  /** Whether audio is currently enabled */
  enabled: boolean
  /** Cleanup */
  destroy: () => void
}

export function useAmbientAudio(): AmbientAudio {
  const ctxRef     = useRef<AudioContext | null>(null)
  const enabledRef = useRef(false)
  const mutedRef   = useRef(false)
  const nodesRef   = useRef<{
    masterGain:   GainNode
    masterFilter: BiquadFilterNode
    // Surface layer
    surfacePad:   OscillatorNode
    surfacePad5:  OscillatorNode
    surfaceNoise: AudioBufferSourceNode
    surfaceGain:  GainNode
    surfaceNoiseFilter: BiquadFilterNode
    // Descend layer
    descendDrone: OscillatorNode
    descendNoise: AudioBufferSourceNode
    descendGain:  GainNode
    descendNoiseFilter: BiquadFilterNode
    // Deep layer
    deepSub:      OscillatorNode
    deepLfo:      OscillatorNode
    deepLfoGain:  GainNode
    deepGain:     GainNode
    // Ascend layer
    ascendTone:   OscillatorNode
    ascendGain:   GainNode
  } | null>(null)

  const build = useCallback(() => {
    if (ctxRef.current) return
    const ctx = new AudioContext()
    ctxRef.current = ctx

    // ── Master chain ──────────────────────────────────────────────────────
    const masterFilter = ctx.createBiquadFilter()
    masterFilter.type = 'lowpass'
    masterFilter.frequency.value = 8000
    masterFilter.Q.value = 0.7

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.55  // overall volume

    masterFilter.connect(masterGain)
    masterGain.connect(ctx.destination)

    // ── Surface layer: warm pad + wind noise ──────────────────────────────
    const surfaceGain = ctx.createGain()
    surfaceGain.gain.value = 0.7  // start audible — surface plays at p=0
    surfaceGain.connect(masterFilter)

    // Pad: root (C3 ~130Hz) + fifth (G3 ~196Hz), triangle for warmth
    const surfacePad = ctx.createOscillator()
    surfacePad.type = 'triangle'
    surfacePad.frequency.value = 130.81
    surfacePad.connect(surfaceGain)

    const surfacePad5 = ctx.createOscillator()
    surfacePad5.type = 'triangle'
    surfacePad5.frequency.value = 196.0
    const pad5Gain = ctx.createGain()
    pad5Gain.gain.value = 0.6
    surfacePad5.connect(pad5Gain)
    pad5Gain.connect(surfaceGain)

    // Wind/water noise — high-pass filtered white noise
    const surfaceNoiseFilter = ctx.createBiquadFilter()
    surfaceNoiseFilter.type = 'highpass'
    surfaceNoiseFilter.frequency.value = 3000
    surfaceNoiseFilter.Q.value = 0.3
    surfaceNoiseFilter.connect(surfaceGain)

    const noiseBuffer = createNoiseBuffer(ctx, 4)
    const surfaceNoise = ctx.createBufferSource()
    surfaceNoise.buffer = noiseBuffer
    surfaceNoise.loop = true
    const surfaceNoiseGain = ctx.createGain()
    surfaceNoiseGain.gain.value = 0.15
    surfaceNoise.connect(surfaceNoiseGain)
    surfaceNoiseGain.connect(surfaceNoiseFilter)

    // ── Descend layer: low drone + resonant bubbles ──────────────────────
    const descendGain = ctx.createGain()
    descendGain.gain.value = 0
    descendGain.connect(masterFilter)

    const descendDrone = ctx.createOscillator()
    descendDrone.type = 'sine'
    descendDrone.frequency.value = 65.41  // C2
    const droneGainNode = ctx.createGain()
    droneGainNode.gain.value = 0.7
    descendDrone.connect(droneGainNode)
    droneGainNode.connect(descendGain)

    // Bubble noise — band-pass filtered
    const descendNoiseFilter = ctx.createBiquadFilter()
    descendNoiseFilter.type = 'bandpass'
    descendNoiseFilter.frequency.value = 800
    descendNoiseFilter.Q.value = 5
    descendNoiseFilter.connect(descendGain)

    const descendNoise = ctx.createBufferSource()
    descendNoise.buffer = noiseBuffer
    descendNoise.loop = true
    const descendNoiseGain = ctx.createGain()
    descendNoiseGain.gain.value = 0.04
    descendNoise.connect(descendNoiseGain)
    descendNoiseGain.connect(descendNoiseFilter)

    // ── Deep layer: sub-bass with slow LFO filter wobble ─────────────────
    const deepGain = ctx.createGain()
    deepGain.gain.value = 0
    deepGain.connect(masterFilter)

    const deepSub = ctx.createOscillator()
    deepSub.type = 'sine'
    deepSub.frequency.value = 41.2  // E1
    deepSub.connect(deepGain)

    // LFO modulates filter for slow evolving feel
    const deepFilter = ctx.createBiquadFilter()
    deepFilter.type = 'lowpass'
    deepFilter.frequency.value = 200
    deepFilter.Q.value = 4
    deepFilter.connect(deepGain)

    const deepLfo = ctx.createOscillator()
    deepLfo.type = 'sine'
    deepLfo.frequency.value = 0.15  // very slow wobble
    const deepLfoGain = ctx.createGain()
    deepLfoGain.gain.value = 100  // modulation range ±100 Hz
    deepLfo.connect(deepLfoGain)
    deepLfoGain.connect(deepFilter.frequency)

    // ── Ascend layer: rising tone ────────────────────────────────────────
    const ascendGain = ctx.createGain()
    ascendGain.gain.value = 0
    ascendGain.connect(masterFilter)

    const ascendTone = ctx.createOscillator()
    ascendTone.type = 'sine'
    ascendTone.frequency.value = 261.63  // C4
    const ascendToneGain = ctx.createGain()
    ascendToneGain.gain.value = 0.5
    ascendTone.connect(ascendToneGain)
    ascendToneGain.connect(ascendGain)

    // ── Start all sources ────────────────────────────────────────────────
    const now = ctx.currentTime
    surfacePad.start(now)
    surfacePad5.start(now)
    surfaceNoise.start(now)
    descendDrone.start(now)
    descendNoise.start(now)
    deepSub.start(now)
    deepLfo.start(now)
    ascendTone.start(now)

    nodesRef.current = {
      masterGain, masterFilter,
      surfacePad, surfacePad5, surfaceNoise, surfaceGain, surfaceNoiseFilter,
      descendDrone, descendNoise, descendGain, descendNoiseFilter,
      deepSub, deepLfo, deepLfoGain, deepGain,
      ascendTone, ascendGain,
    }
  }, [])

  const enable = useCallback(() => {
    if (enabledRef.current) return
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    enabledRef.current = true
    mutedRef.current = false
    build()
    ctxRef.current?.resume()
  }, [build])

  const toggle = useCallback(() => {
    if (!enabledRef.current) {
      enable()
      return
    }
    mutedRef.current = !mutedRef.current
    if (nodesRef.current) {
      nodesRef.current.masterGain.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.55,
        ctxRef.current!.currentTime,
        0.3
      )
    }
  }, [enable])

  const update = useCallback((progress: number) => {
    if (!enabledRef.current || !nodesRef.current || !ctxRef.current) return
    const n   = nodesRef.current
    const ctx = ctxRef.current
    const t   = ctx.currentTime

    // ── Master low-pass filter: dips deep underwater, opens on ascent ────
    // Surface (8000) → Deep at p=0.6 (250) → Ascend back (6000)
    let lpFreq: number
    if (progress < 0.6) {
      lpFreq = 8000 - (8000 - 250) * (progress / 0.6)
    } else {
      lpFreq = 250 + (6000 - 250) * ((progress - 0.6) / 0.4)
    }
    n.masterFilter.frequency.setTargetAtTime(lpFreq, t, 0.1)

    // ── Layer gains (equal-power crossfade) ──────────────────────────────
    // Surface: full at 0, fades out 0.20–0.50
    const surfVol = fadeOut(progress, 0.20, 0.50)
    n.surfaceGain.gain.setTargetAtTime(surfVol * 0.7, t, 0.15)

    // Descend: fade in 0.15–0.35, fade out 0.50–0.70
    const descVol = fadeIn(progress, 0.15, 0.35) * fadeOut(progress, 0.50, 0.70)
    n.descendGain.gain.setTargetAtTime(descVol * 0.5, t, 0.15)

    // Deep: fade in 0.45–0.60, fade out 0.80–0.92
    const deepVol = fadeIn(progress, 0.45, 0.60) * fadeOut(progress, 0.80, 0.92)
    n.deepGain.gain.setTargetAtTime(deepVol * 0.55, t, 0.15)

    // Ascend: fade in 0.78–0.90
    const ascVol = fadeIn(progress, 0.78, 0.92)
    n.ascendGain.gain.setTargetAtTime(ascVol * 0.4, t, 0.15)

    // Rising pitch on ascend tone
    const ascendFreq = 261.63 + ascVol * 260  // C4 → C5
    n.ascendTone.frequency.setTargetAtTime(ascendFreq, t, 0.3)

    // Bubble filter resonance increases with depth
    n.descendNoiseFilter.Q.setTargetAtTime(5 + progress * 10, t, 0.2)
  }, [])

  const destroy = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.close()
      ctxRef.current = null
    }
    nodesRef.current = null
    enabledRef.current = false
  }, [])

  // Pause when tab is hidden
  useEffect(() => {
    const onVis = () => {
      if (!ctxRef.current) return
      if (document.hidden) ctxRef.current.suspend()
      else if (enabledRef.current && !mutedRef.current) ctxRef.current.resume()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      destroy()
    }
  }, [destroy])

  return {
    enable,
    toggle,
    update,
    get enabled() { return enabledRef.current && !mutedRef.current },
    destroy,
  }
}
