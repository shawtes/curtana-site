# CLAUDE.md — Flow With Curtana — Website Redesign

> Read this EVERY session before touching a single file.
> This is the complete brain of the project — brand, goals, design system, 3D vision, all content decisions.

---

## 👤 The Client: Curtana

**Brand:** Flow With Curtana
**URL:** flowwithcurtana.com
**Industry:** Personal wellness — yoga, movement, breathwork, coaching
**Audience:** People seeking mind-body transformation, stress relief, holistic health
**Platform origin:** Instagram (`link_in_bio` in URL = strong social following)
**Tone:** Warm, grounded, fluid, empowering — NOT clinical, NOT corporate

**The business is Shaw's brother's business.** Treat this with the same care and ambition as the Shaw portfolio.

---

## 🎯 Design Vision: Lusion-Inspired Wellness

This is NOT a typical soft-pastel yoga website.
This is a **cinematic, immersive wellness experience** — inspired by Lusion's WebGL storytelling,
but translated into the language of breath, water, flow, and the human body.

**The core metaphor:** Water in motion. Breath expanding. A body finding stillness inside movement.

**What Lusion does for tech → we do for wellness:**
- Lusion: astronaut flying through space portals on scroll
- Curtana: the viewer breathes deeper as they scroll — the world expands and softens

**The signature interaction:**
Scroll drives a slow, meditative journey through:
1. Hero — mist/fog parts as you arrive, Curtana's name breathes in
2. About — organic particle field forms the shape of a body in motion
3. Services — each service card blooms open on hover like a flower
4. Testimonials — words float and settle like leaves on water
5. Booking — a portal of calm light invites you in

---

## 🎨 Design System

### Color Palette
```css
/* Grounding — earth and water tones, NOT generic wellness pastels */
--bg:           #0d0f0e;   /* deep forest dark — not pure black */
--bg2:          #141815;   /* slightly warmer dark */
--surface:      #1c211d;   /* card surfaces */

/* Primary brand */
--sage:         #7fa882;   /* deep sage green — the signature color */
--sage-light:   #a8c5aa;   /* lighter sage for text accents */
--sage-glow:    rgba(127, 168, 130, 0.25);

/* Warmth */
--sand:         #c8b89a;   /* warm sand/skin — for body warmth */
--sand-light:   #e0d4c0;   /* light sand for text */
--cream:        #f5f0e8;   /* off-white for headings */

/* Water / sky */
--mist:         #8fb5c4;   /* misty blue for breath/water elements */
--mist-soft:    rgba(143, 181, 196, 0.15);

/* Accent */
--gold:         #c9a96e;   /* warm gold for special moments */

/* Text */
--text:         #e8ede9;   /* primary — warm white */
--muted:        #7a8b7c;   /* secondary — muted sage */
--dim:          #3d4a3e;   /* disabled / borders */

/* Borders */
--border:       rgba(127, 168, 130, 0.12);
--border2:      rgba(127, 168, 130, 0.25);
```

### Typography
```
Display:  'Cormorant Garamond' — italic, elegant, editorial. Weight 300–600.
          OR 'Playfair Display' as fallback
          This is the voice of Curtana — feminine, authoritative, timeless.

Body:     'DM Sans' — clean, modern, readable. Weight 300–400.
          Not mono — this is human warmth, not tech.

Accent:   'Cormorant Garamond' italic — for pullquotes, testimonials, mantras.

NEVER: Inter, Roboto, Open Sans — too corporate, kills the vibe.
```

### Typography Scale
```
Hero name:   clamp(64px, 10vw, 120px) — Cormorant, weight 300, italic, letter-spacing -3px
Section H1:  clamp(40px, 5vw, 68px)  — Cormorant, weight 400
Card title:  24px                    — Cormorant, weight 500
Body:        15px                    — DM Sans, weight 300, line-height 1.9
Label:       11px                    — DM Sans, weight 400, letter-spacing 3px, uppercase
Mantra:      clamp(20px, 3vw, 32px)  — Cormorant italic, weight 300
```

### Motion Language
```
Easing:    cubic-bezier(0.16, 1, 0.3, 1)  — the "breath" ease: slow start, soft landing
Duration:  Long and slow — 800ms to 1400ms for reveals (not snappy like tech sites)
Parallax:  Gentle 0.3 speed — like looking through water
Hover:     Blooms outward — scale 1.02, opacity increase, soft glow
Particles: Organic, drifting — NOT sharp or electric
```

---

## 🌊 3D / WebGL Vision (Lusion-Inspired)

### TWO EXPERIENCES:

**Experience A: Breathing Mist Hero** (current implementation in MistScene.tsx)
Used on inner pages and as fallback. Soft particle mist that breathes.

**Experience B: Mountain Journey** (NEW — the signature piece)
Used on the HOME PAGE as the primary scroll experience.
Full Lusion-style 5-act cinematic scroll journey.

### Mountain Journey — 5-Act Cinematic Scroll (HOME PAGE)
```
Technology: 2D Canvas (no Three.js needed — pure ctx)
Container:  900vh scroll container with sticky 100vh canvas
Hook:       useScrollProgress() → returns 0→1

Act 1 (0→0.22):   SACRED GEOMETRY WARP TUNNEL
  - Meditator back-facing, small at center
  - Sacred geometry rings (hex/oct) fly toward camera with sage/teal emissions
  - Floating spore particles, central glow, chromatic aberration
  - Chapter: "Somewhere beyond thought…"

Act 2 (0.22→0.40): MANDALA VORTEX
  - Rings compress into radiating beam mandala
  - 24 beams + 200 spinning petal particles
  - Dark void center with bright sage rim
  - Chapter: "The breath finds you."

Act 3 (0.40→0.55): GOLDEN CHAKRA BLOOM
  - Color shift: sage → warm amber/gold
  - 40 golden light rays + 60 orbiting orbs
  - Pulsing golden core — emotional peak
  - Chapter: "Be still."

Act 4 (0.55→0.72): MOUNTAIN ARRIVAL
  - Flash transition to physical world
  - Layered mountain ranges + starfield + aurora
  - 200 snow particles with wind drift
  - Meditator seated on summit, breathing, aura glow
  - Chapter: "A light in the dark."

Act 5 (0.72→1.0):  THE TURN + CANDLE + SMOKE PORTAL
  - Figure rotates 180° to face user (ctx.scale Y-rotation trick)
  - Face reveals: closed eyes, soft smile, third eye bindi
  - Candle ignites between palms at ~0.70 progress
  - Warm amber light spreads across mountain (cold→warm shift)
  - Smoke rises from flame, curves into vortex → white portal
  - Portal fills screen → transitions to content below
  - Chapter: "Follow the smoke."
```

### Key Files for Mountain Journey
```
src/components/3d/MountainJourney.tsx  — Main canvas renderer (all 5 acts)
src/components/3d/JourneyChapters.tsx  — DOM chapter text overlays (Framer Motion)
src/components/ui/ScrollPath.tsx       — SVG path that draws itself on scroll
src/hooks/useScrollProgress.ts         — 0→1 scroll progress for sticky containers
inspiration/LUSION_VISUAL_ANALYSIS.md  — Frame-by-frame analysis of actual Lusion site
```

### Breathing Mist (INNER PAGES)
```
Technology: Three.js + React Three Fiber
File:       src/components/3d/MistScene.tsx (already built)
Usage:      /about, /services, /contact hero backgrounds
```

### Organic Particle Field (About section)
```
Instead of Lusion's star field → a particle field that forms the shape
of a person in a yoga pose. Particles drift and reform on scroll.

Using: Three.js BufferGeometry, custom vertex positions,
       lerp-based particle morphing between states
Colors: sage greens, warm creams — NOT neon
```

### Card Bloom Effect (Services)
```
Each service card:
- Starts slightly below, rotated away, reduced opacity
- On scroll reveal: rotates up, blooms forward, opacity fades in
- On hover: subtle 3D tilt (much softer than Shaw — max 5deg not 9deg)
- Background: organic gradient using sage/sand, NOT flat dark
```

### Water Cursor
```
Instead of Shaw's dot-ring cursor:
- A soft bloom — 20px circle, sage green, very low opacity (0.3)
- Leaves a trailing "ripple" that fades out over 600ms
- On hover of CTAs: cursor swells to 40px, warm gold color
- Completely custom, no browser cursor
```

---

## 📱 Pages

### Page Structure
```
/ Home
/about
/services
  /services/yoga         (1:1 sessions, group, corporate)
  /services/breathwork   (breathwork coaching)
  /services/retreats     (wellness retreats)
/testimonials
/blog                    (optional — Phase 2)
/contact
/book                    (booking page — links to scheduling tool)
```

### Home Page Sections
```
1. Hero          — Full-screen mist scene, name, tagline, one CTA
2. About teaser  — Brief 2-sentence bio with link to /about
3. Services      — 3 featured service cards
4. Testimonials  — 2-3 rotating testimonials
5. Instagram     — Live feed or static grid (Phase 2)
6. CTA strip     — "Ready to flow?" → /book
7. Footer
```

---

## 💬 Voice & Copy Direction

### Tone Rules
```
✓ Warm, direct, first-person
✓ Sensory language — feel, breathe, move, soften, open, ground
✓ Short sentences. Let them breathe.
✓ "You" focused — about the client's experience, not Curtana's credentials
✗ No buzzwords: "holistic journey", "transformative experience", "wellness warrior"
✗ No clinical language: "optimize", "maximize", "performance"
✗ No corporate speak
```

### Sample Hero Copy (placeholder — replace with Curtana's real voice)
```
hero name:    Flow With Curtana
tagline:      Move with intention.
              Breathe with purpose.
              Come home to yourself.
cta:          Begin your practice →
```

### Sample Service Names
```
1:1 Sessions  →  "Private Flow"
Group Classes →  "Collective Breath"
Retreats      →  "Return to Stillness"
Breathwork    →  "The Breath Work"
Corporate     →  "Workplace Wellness"
```

---

## ⚙️ Technical Stack

```
Framework:    Next.js 14+ (App Router)
Language:     TypeScript
Styling:      Tailwind CSS + CSS modules for complex animations
3D:           Three.js / React Three Fiber (@react-three/fiber + @react-three/drei)
Animation:    Framer Motion (page transitions, reveals)
Fonts:        next/font — Cormorant Garamond + DM Sans
Booking:      Calendly embed or Acuity Scheduling
Forms:        React Hook Form + EmailJS
Deploy:       Vercel
CMS:          Sanity.io (Phase 2 — for blog + testimonials)
```

### Key npm packages
```bash
npm install three @react-three/fiber @react-three/drei
npm install framer-motion
npm install @fontsource/cormorant-garamond @fontsource/dm-sans
npm install react-hook-form
npm install clsx tailwind-merge
```

---

## 🧠 Claude Code Working Rules

1. **Wellness first, tech second** — every decision serves the feeling of calm, movement, breath
2. **Check DESIGN_SYSTEM.md before any CSS** — use the tokens, no improvised colors
3. **Soft over sharp** — when in doubt, make it softer, slower, warmer
4. **Mobile is primary** — Curtana's audience comes from Instagram (mobile first)
5. **Performance matters** — 3D scenes must be lazy loaded, not blocking
6. **CLAUDE.md is truth** — never use placeholder copy, use the content from CONTENT.md
7. **Accessibility** — wellness audience includes people with sensory sensitivities — always respect `prefers-reduced-motion`
8. **Never use generic wellness stock imagery** — flag when real photos needed

---

## 📐 Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Dark background | Yes (#0d0f0e forest dark) | Intimate, premium, NOT clinical white |
| Particle style | Organic drifting, sage/cream | Matches breath/nature metaphor |
| Card style | Soft blur-glass, very subtle | Not sharp tech cards |
| Font | Cormorant Garamond serif | Feminine, authoritative, timeless |
| Scroll speed | Slow, breath-paced | Mirrors the calming intention |
| Cursor | Soft bloom + ripple trail | Poetic, not tech cursor |
| Booking CTA | Warm, welcoming | "Begin" not "Sign Up" |

---

## 🔗 Links

- **Current site:** https://www.flowwithcurtana.com
- **Instagram:** flowwithcurtana (link_in_bio source)
- **Inspiration:** lusion.co (for interaction quality), not for visual style
- **Design refs:** See inspiration/REFERENCES.md
