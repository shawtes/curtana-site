# ANIMATIONS.md — Flow With Curtana

> Every animation, specced exactly. The feel should be: slow breath, soft bloom, water settling.
> Nothing is snappy. Nothing is electric. Everything breathes.

---

## 🌊 The Wellness Animation Philosophy

Lusion's animations feel like a rocket launch — fast, electric, kinetic.
Curtana's animations feel like deep breath — slow, expanding, returning to stillness.

| Lusion | Curtana |
|--------|---------|
| 60ms tilt tracking | 150ms tilt tracking |
| 9deg max rotation | 5deg max rotation |
| 0.06 camera lerp | 0.03 camera lerp |
| Sharp particle edges | Soft particle blur |
| Electric colors | Organic sage/cream |
| Snappy spring-back | Slow float-back |

---

## 🫧 Water Cursor

### Spec
- Main bloom: 20px circle, sage green `rgba(127,168,130,0.28)`, `filter: blur(6px)`
- Trailing ripple: 3 concentric rings, expanding + fading over 700ms
- CTA hover: bloom swells to 44px, color transitions to gold `rgba(201,169,110,0.4)`
- Movement: main cursor is immediate, rings lag with different lerp factors (0.08, 0.06, 0.04)

### Code pattern
```ts
// hooks/useWaterCursor.ts
export function useWaterCursor() {
  const mainRef = useRef<HTMLDivElement>(null)
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cx = 0, cy = 0
    let r1x = 0, r1y = 0
    let r2x = 0, r2y = 0

    const onMove = (e: MouseEvent) => { cx = e.clientX; cy = e.clientY }
    document.addEventListener('mousemove', onMove)

    const loop = () => {
      requestAnimationFrame(loop)
      // Main: immediate
      if (mainRef.current) {
        mainRef.current.style.left = `${cx}px`
        mainRef.current.style.top = `${cy}px`
      }
      // Ring 1: lerp 0.08
      r1x += (cx - r1x) * 0.08; r1y += (cy - r1y) * 0.08
      if (ring1Ref.current) {
        ring1Ref.current.style.left = `${r1x}px`
        ring1Ref.current.style.top = `${r1y}px`
      }
      // Ring 2: lerp 0.05
      r2x += (cx - r2x) * 0.05; r2y += (cy - r2y) * 0.05
      if (ring2Ref.current) {
        ring2Ref.current.style.left = `${r2x}px`
        ring2Ref.current.style.top = `${r2y}px`
      }
    }
    loop()
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return { mainRef, ring1Ref, ring2Ref }
}
```

---

## 🌸 Card Bloom Reveal (Scroll)

### Spec
- Start: `opacity:0, translateY(40px), rotateX(-6deg), scale(0.97)`
- End: `opacity:1, translateY(0), rotateX(0), scale(1)`
- Duration: **900ms**
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Trigger: IntersectionObserver, threshold 0.12
- Stagger: 120ms between cards

### Framer Motion version
```tsx
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotateX: -6,
    scale: 0.97,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.12,
    },
  }),
}

// Usage:
<motion.div
  variants={cardVariants}
  initial="hidden"
  whileInView="visible"
  custom={index}
  viewport={{ once: true, amount: 0.12 }}
/>
```

---

## 🌬️ Soft 3D Card Tilt (Hover)

### Spec
- Max rotation: **±5deg** (vs Shaw's 9deg — much softer)
- Perspective: **1200px** (vs 900 — further away = subtler)
- Scale on hover: **1.015**
- Tracking transition: **150ms** (vs 60ms — more meditative)
- Restore transition: **800ms** cubic-bezier(0.16, 1, 0.3, 1)
- Shine: very soft, opacity 0.04 (vs 0.07)

### Code
```ts
// hooks/useSoftTilt.ts
export function useSoftTilt() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(hover: none)').matches) return

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - r.left - r.width/2) / (r.width/2)
      const dy = (e.clientY - r.top - r.height/2) / (r.height/2)
      el.style.transform = `perspective(1200px) rotateX(${-dy*5}deg) rotateY(${dx*5}deg) scale(1.015)`
      el.style.transition = 'transform 150ms'
    }

    const onLeave = () => {
      el.style.transform = ''
      el.style.transition = 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])
  return ref
}
```

---

## 📜 Word-by-Word Text Reveal

### Spec
- Split heading into individual `<span>` words
- Each word: `opacity:0, translateY(10px)` → `opacity:1, translateY(0)`
- Duration: **600ms per word**
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Stagger: **60ms per word**
- Trigger: IntersectionObserver

### Code
```tsx
// components/ui/WordReveal.tsx
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.3 }
    )
    if (containerRef.current) io.observe(containerRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden' }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms,
                         transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  )
}
```

---

## 🏔️ Mountain Journey — 5-Act Scroll Animation (HOME PAGE)

> The signature piece. Lusion-quality scroll cinema, wellness edition.
> File: src/components/3d/MountainJourney.tsx
> Driven by: src/hooks/useScrollProgress.ts (0→1)

### Architecture
```
900vh scroll container → sticky 100vh canvas
scrollProgress 0→1 drives everything
Canvas 2D (ctx) — no Three.js dependency for this scene
```

### Act Timing & Transitions
```
Act 1: 0.00 → 0.22  Sacred Geometry Tunnel
  └─ fade-out: 0.85→1.0 (dark overlay)
Act 2: 0.22 → 0.40  Mandala Vortex
  └─ fade-in: 0.00→0.15 | fade-out: 0.85→1.0
Act 3: 0.40 → 0.55  Golden Chakra Bloom
  └─ fade-in: 0.00→0.15 | flash-out: 0.80→1.0 (golden bloom)
Act 4: 0.55 → 0.72  Mountain Arrival
  └─ golden-fade-in: 0.00→0.15
Act 5: 0.72 → 1.00  Turn + Candle + Smoke Portal
  └─ smoke portal: 0.70→1.0 | white out: 0.85→1.0
```

### Key Animation Values
```
Camera lerp:       0.028 (breath-paced, half of Lusion's 0.06)
Mouse parallax:    120px (tunnel), 40px (vortex), 30px (bloom), 15px (mountain)
Tunnel ring count: 30 rings, 8 emitters each
Tunnel particles:  400 (reduce to 150 on mobile)
Vortex beams:      24 radiating from center
Vortex petals:     200 spinning particles
Bloom rays:        40 golden light rays
Bloom orbs:        60 orbiting golden orbs
Snow particles:    200 (reduce to 80 on mobile)
Smoke particles:   50 (reduce to 20 on mobile)
```

### Figure Rotation (Act 5) — The Cinematic Moment
```ts
// Simulate 3D Y-rotation with ctx.scale
const rotProgress = Math.min(1, localProgress * 2.5)  // rotates in first 40%
const scaleX = Math.cos(rotProgress * Math.PI)         // 1 → -1

ctx.save()
ctx.translate(figX, figY)
ctx.scale(scaleX, 1)  // negative = mirrored = facing viewer
// < 0.5: back-facing  |  > 0.5: front-facing  |  at 0.5: thin slice
if (rotProgress < 0.5) drawFigureBack(ctx)
else drawFigureFront(ctx)  // reveals face, closed eyes, soft smile, bindi
ctx.restore()
```

### Candle Light Spread (Act 5, progress 0.4→1.0)
```
candleProgress = max(0, (localProgress - 0.4) / 0.6)
Warm radial: rgba(255,180,60) radius grows 120px → 280px
Snow recolor: white → rgba(255,220,150) via lerp
Mountain recolor: cold blue (#8fb5c4) → warm ochre (#c8956a) via lerp
```

### Smoke → Portal (Act 5, progress 0.7→1.0)
```
40 smoke particles emit from flame tip
Each: rises with bezier curl, size 2→6px, fades over lifetime
At smokeProgress 0.5: particles curve INWARD toward (cx, 80) — vortex forming
Portal circle: radius 0 → fills viewport over 0.88→1.0
At 0.95: white overlay fades in
At 0.98: full white — trigger page transition or fade to content
```

### Chapter Overlays (JourneyChapters.tsx)
```
File: src/components/3d/JourneyChapters.tsx
Uses: Framer Motion AnimatePresence

Chapters:
  0.02–0.12: "Somewhere beyond thought…" (left, medium)
  0.22–0.32: "The breath finds you." (right, medium)
  0.45–0.58: "Be still." (center, large)
  0.65–0.78: "A light in the dark." (center, medium)
  0.85–0.95: "Follow the smoke." (center, large, gold color)

Font: Cormorant Garamond italic, weight 300
Animate: opacity 0→1→0, y: 20→0→-10, duration 1400ms
Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

### Scroll Path Line (ScrollPath.tsx)
```
File: src/components/ui/ScrollPath.tsx
SVG overlay, fixed position, z-index 50, opacity 0.35
S-curve path: gentle left-right weave as it descends
Draws itself using stroke-dashoffset synced to scrollProgress
At each section break (0.2, 0.4, 0.6, 0.8): bloom circle node
Stroke: var(--sage), width 0.3
```

---

## 🫁 Breathing Particle Animation (Three.js)

### The "breath" wave
```ts
// In the render loop:
let breathPhase = 0

function animate() {
  requestAnimationFrame(animate)
  breathPhase += 0.008  // slow breath cycle ~12s

  const breathFactor = 1 + Math.sin(breathPhase) * 0.25  // ±25% velocity

  const positions = geometry.attributes.position.array as Float32Array

  for (let i = 0; i < N; i++) {
    // Upward drift with breath modulation
    positions[i * 3 + 1] += baseVelocities[i] * breathFactor

    // Reset when particle reaches top
    if (positions[i * 3 + 1] > 5) {
      positions[i * 3 + 1] = -5
    }

    // Gentle horizontal drift
    positions[i * 3] += Math.sin(breathPhase + i * 0.1) * 0.0003
  }

  geometry.attributes.position.needsUpdate = true
}
```

---

## 🌊 Page Transition (Framer Motion)

### Between routes: curtain wipe, not fade-up
```tsx
// A soft dark overlay wipes across: left → right out, then right → left in
const curtainVariants = {
  initial: { scaleX: 0, originX: 0 },
  animate: { scaleX: 0, originX: 1, transition: { duration: 0, delay: 0.6 } },
  exit: { scaleX: 1, originX: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

// Content fades after curtain closes
const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.7, delay: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}
```

---

## 🌀 Scroll Progress Mandala

```tsx
// Bottom right corner — soft sage circle expanding with scroll
export function ScrollMandala() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      setProgress(window.scrollY / max)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const circumference = 2 * Math.PI * 18  // r=18
  const dashOffset = circumference * (1 - progress)

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 50, opacity: 0.45 }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        {/* Background circle */}
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(127,168,130,0.15)" strokeWidth="1"/>
        {/* Progress arc */}
        <circle
          cx="22" cy="22" r="18"
          fill="none"
          stroke="#7fa882"
          strokeWidth="1"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dashoffset 0.1s' }}
        />
        {/* Center dot */}
        <circle cx="22" cy="22" r="2" fill="#7fa882" opacity="0.6"/>
      </svg>
    </div>
  )
}
```

---

## ♿ Reduced Motion

```css
/* ALWAYS wrap animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```ts
// In JS:
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReduced) {
  // Disable Three.js animation loop complexity
  // Show static fallback or simplified version
}
```
