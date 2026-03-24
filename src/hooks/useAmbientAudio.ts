'use client'

/**
 * useAmbientAudio — Meditative ambient soundscape for Flow With Curtana.
 *
 * Designed to feel like a meditation app, not a synthesizer:
 *   - Singing bowl resonances (detuned sine pairs with slow tremolo)
 *   - Gentle ocean/breath noise (shaped white noise)
 *   - Warm sub-harmonic drone (barely audible foundation)
 *   - Everything evolves slowly with the journey progress
 *
 * The master low-pass filter creates the underwater illusion as she descends.
 */

import { useRef, useCallback, useEffect } from 'react'

// ── Crossfade helpers ────────────────────────────────────────────────────────
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

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d   = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

// ── Create a singing bowl voice ──────────────────────────────────────────────
// Two slightly detuned sines + slow tremolo = warm, alive, bowl-like resonance
function createBowl(
  ctx: AudioContext, freq: number, detune: number, tremoloRate: number, dest: AudioNode
) {
  const g = ctx.createGain()
  g.gain.value = 0
  g.connect(dest)

  // Primary tone
  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = freq
  osc1.connect(g)

  // Detuned pair — creates gentle beating/warmth
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = freq + detune
  const osc2g = ctx.createGain()
  osc2g.gain.value = 0.6
  osc2.connect(osc2g)
  osc2g.connect(g)

  // Slow tremolo (amplitude modulation) — mimics singing bowl resonance
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = tremoloRate
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.value = 0.15  // subtle shimmer
  lfo.connect(lfoDepth)
  lfoDepth.connect(g.gain)

  return { osc1, osc2, lfo, gain: g }
}

export function useAmbientAudio() {
  const ctxRef   = useRef<AudioContext | null>(null)
  const builtRef = useRef(false)
  const mutedRef = useRef(false)
  const nodes    = useRef<{
    masterGain:    GainNode
    masterFilter:  BiquadFilterNode
    // Surface: singing bowls + ocean noise
    bowl1Gain:     GainNode
    bowl2Gain:     GainNode
    oceanGain:     GainNode
    // Depth: warm drone + muffled water
    droneGain:     GainNode
    waterGain:     GainNode
    // Deep: sub-harmonic
    subGain:       GainNode
    // Ascend: bright bowl
    brightGain:    GainNode
    brightOsc:     OscillatorNode
    // Breath LFO on master
    breathLfo:     OscillatorNode
  } | null>(null)

  const build = useCallback(() => {
    if (builtRef.current) return
    builtRef.current = true

    const ctx = new AudioContext()
    ctxRef.current = ctx
    const noiseBuf = createNoiseBuffer(ctx, 4)

    // ── Master chain ──────────────────────────────────────────────────────
    const masterFilter = ctx.createBiquadFilter()
    masterFilter.type = 'lowpass'
    masterFilter.frequency.value = 9000
    masterFilter.Q.value = 0.5

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.45
    masterFilter.connect(masterGain)
    masterGain.connect(ctx.destination)

    // Gentle breathing rhythm on master volume (very subtle)
    const breathLfo = ctx.createOscillator()
    breathLfo.type = 'sine'
    breathLfo.frequency.value = 0.12  // ~7s breath cycle
    const breathDepth = ctx.createGain()
    breathDepth.gain.value = 0.06  // barely perceptible
    breathLfo.connect(breathDepth)
    breathDepth.connect(masterGain.gain)

    // ── Surface: two singing bowls + gentle ocean ─────────────────────────
    // Bowl 1: F4 (349 Hz) — heart chakra frequency area
    const bowl1 = createBowl(ctx, 349.23, 0.8, 0.18, masterFilter)
    // Bowl 2: C5 (523 Hz) — perfect fifth above, peaceful interval
    const bowl2 = createBowl(ctx, 523.25, 1.2, 0.13, masterFilter)

    // Ocean: low-pass filtered noise, very gentle
    const oceanGain = ctx.createGain()
    oceanGain.gain.value = 0.12
    const oceanFilter = ctx.createBiquadFilter()
    oceanFilter.type = 'lowpass'
    oceanFilter.frequency.value = 800
    oceanFilter.Q.value = 0.3
    oceanFilter.connect(oceanGain)
    oceanGain.connect(masterFilter)

    const ocean = ctx.createBufferSource()
    ocean.buffer = noiseBuf
    ocean.loop = true
    ocean.connect(oceanFilter)

    // ── Depth: warm drone (Bb2) + muffled water texture ──────────────────
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0
    droneGain.connect(masterFilter)

    // Drone: two detuned sines an octave below the bowls
    const droneOsc1 = ctx.createOscillator()
    droneOsc1.type = 'sine'
    droneOsc1.frequency.value = 116.54  // Bb2
    droneOsc1.connect(droneGain)

    const droneOsc2 = ctx.createOscillator()
    droneOsc2.type = 'sine'
    droneOsc2.frequency.value = 117.2  // slightly detuned
    const droneOsc2g = ctx.createGain()
    droneOsc2g.gain.value = 0.5
    droneOsc2.connect(droneOsc2g)
    droneOsc2g.connect(droneGain)

    // Muffled water: band-pass noise
    const waterGain = ctx.createGain()
    waterGain.gain.value = 0
    const waterFilter = ctx.createBiquadFilter()
    waterFilter.type = 'bandpass'
    waterFilter.frequency.value = 400
    waterFilter.Q.value = 1.5
    waterFilter.connect(waterGain)
    waterGain.connect(masterFilter)

    const water = ctx.createBufferSource()
    water.buffer = noiseBuf
    water.loop = true
    const waterg = ctx.createGain()
    waterg.gain.value = 0.08
    water.connect(waterg)
    waterg.connect(waterFilter)

    // ── Deep: sub-harmonic foundation ─────────────────────────────────────
    const subGain = ctx.createGain()
    subGain.gain.value = 0
    subGain.connect(masterFilter)

    const subOsc = ctx.createOscillator()
    subOsc.type = 'sine'
    subOsc.frequency.value = 58.27  // Bb1 — felt more than heard
    const subOscg = ctx.createGain()
    subOscg.gain.value = 0.4
    subOsc.connect(subOscg)
    subOscg.connect(subGain)

    // ── Ascend: bright singing bowl (high, shimmering) ────────────────────
    const bright = createBowl(ctx, 698.46, 1.5, 0.22, masterFilter) // F5
    // Also add a gentle octave harmonic
    const brightHarm = ctx.createOscillator()
    brightHarm.type = 'sine'
    brightHarm.frequency.value = 1396.91  // F6
    const brightHarmg = ctx.createGain()
    brightHarmg.gain.value = 0.15
    brightHarm.connect(brightHarmg)
    brightHarmg.connect(bright.gain)

    // ── Start everything ──────────────────────────────────────────────────
    const now = ctx.currentTime
    bowl1.osc1.start(now); bowl1.osc2.start(now); bowl1.lfo.start(now)
    bowl2.osc1.start(now); bowl2.osc2.start(now); bowl2.lfo.start(now)
    ocean.start(now)
    droneOsc1.start(now); droneOsc2.start(now)
    water.start(now)
    subOsc.start(now)
    bright.osc1.start(now); bright.osc2.start(now); bright.lfo.start(now)
    brightHarm.start(now)
    breathLfo.start(now)

    nodes.current = {
      masterGain, masterFilter,
      bowl1Gain: bowl1.gain,
      bowl2Gain: bowl2.gain,
      oceanGain,
      droneGain,
      waterGain,
      subGain,
      brightGain: bright.gain,
      brightOsc: bright.osc1,
      breathLfo,
    }

    ctx.resume().catch(() => {})
  }, [])

  const tryResume = useCallback(() => {
    if (!ctxRef.current) build()
    const ctx = ctxRef.current
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
  }, [build])

  const toggle = useCallback(() => {
    tryResume()
    mutedRef.current = !mutedRef.current
    const mg = nodes.current?.masterGain
    if (mg && ctxRef.current) {
      mg.gain.setTargetAtTime(mutedRef.current ? 0 : 0.45, ctxRef.current.currentTime, 0.4)
    }
  }, [tryResume])

  const update = useCallback((progress: number) => {
    if (!nodes.current || !ctxRef.current || mutedRef.current) return
    const n = nodes.current
    const t = ctxRef.current.currentTime

    // ── Master low-pass: bright surface → muffled deep → opens on ascent ──
    let lp: number
    if (progress < 0.55) {
      lp = 9000 - (9000 - 300) * (progress / 0.55)
    } else {
      lp = 300 + (7000 - 300) * ((progress - 0.55) / 0.45)
    }
    n.masterFilter.frequency.setTargetAtTime(lp, t, 0.15)

    // ── Surface bowls + ocean: full at start, fade by 0.45 ────────────────
    const surf = fadeOut(progress, 0.18, 0.45)
    n.bowl1Gain.gain.setTargetAtTime(surf * 0.22, t, 0.2)
    n.bowl2Gain.gain.setTargetAtTime(surf * 0.15, t, 0.2)
    n.oceanGain.gain.setTargetAtTime(surf * 0.12, t, 0.2)

    // ── Drone + water: in 0.15–0.35, out 0.65–0.80 ───────────────────────
    const depth = fadeIn(progress, 0.15, 0.35) * fadeOut(progress, 0.65, 0.80)
    n.droneGain.gain.setTargetAtTime(depth * 0.20, t, 0.2)
    n.waterGain.gain.setTargetAtTime(depth * 0.08, t, 0.2)

    // ── Sub-harmonic: in 0.40–0.55, out 0.82–0.95 ────────────────────────
    const sub = fadeIn(progress, 0.40, 0.55) * fadeOut(progress, 0.82, 0.95)
    n.subGain.gain.setTargetAtTime(sub * 0.18, t, 0.2)

    // ── Bright bowl: in 0.75–0.90 ────────────────────────────────────────
    const asc = fadeIn(progress, 0.75, 0.90)
    n.brightGain.gain.setTargetAtTime(asc * 0.16, t, 0.2)
  }, [])

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
      ctxRef.current?.close()
      ctxRef.current = null
      nodes.current = null
      builtRef.current = false
    }
  }, [build, tryResume])

  return { toggle, update, get muted() { return mutedRef.current } }
}
