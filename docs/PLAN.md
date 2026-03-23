# PLAN.md — Flow With Curtana — Build Plan

> Claude Code: read this every session. Update status as you work.
> Current phase and next task are always at the top.

---

## 📊 Current Status

```
Phase:        1 — Foundation
Started:      —
Last updated: 2026-03-22
Completion:   0%
Next task:    Run scripts/setup.sh to bootstrap project
```

---

## 🗺️ Phases

```
Phase 1: Foundation           — Next.js, design tokens, fonts, globals
Phase 2: Layout + Nav         — Navigation, footer, page shells, transitions
Phase 3: Hero 3D Scene        — Breathing mist WebGL, scroll sync (inner pages)
Phase 3B: MOUNTAIN JOURNEY    — NEW: 5-act Lusion-style scroll experience (home page)
Phase 4: Core Pages           — Home, About, Services, Contact
Phase 5: Interactions         — Water cursor, card blooms, particle field
Phase 6: Content              — All real copy, real images wired in
Phase 7: Booking              — Calendly/Acuity integration, contact form
Phase 8: Polish               — Mobile, performance, SEO, accessibility
Phase 9: Launch               — Domain, Vercel, analytics
```

---

## ✅ Phase 1 — Foundation

- [ ] Run `bash scripts/setup.sh`
- [ ] Verify `npm run dev` works
- [ ] Confirm fonts load: Cormorant Garamond + DM Sans
- [ ] Confirm CSS variables are set in globals.css
- [ ] Confirm Tailwind colors match design system
- [ ] Initial git commit

---

## ✅ Phase 2 — Layout + Navigation

### Nav component
```
File: src/components/layout/Nav.tsx

Design:
- Position: fixed, transparent → blurred glass on scroll
- Logo: "Flow With Curtana" in Cormorant Garamond italic
  OR just a minimal monogram "FC"
- Links: Home · About · Services · Book
- CTA button: "Book a Session" — warm sage, soft hover glow
- Mobile: full-screen overlay menu with fade
- Behavior: hides on scroll down, reappears on scroll up
```

- [ ] Nav component with transparent/glass states
- [ ] Mobile hamburger menu
- [ ] Scroll hide/show behavior
- [ ] Active link indicator (soft underline, sage color)

### Footer component
```
File: src/components/layout/Footer.tsx

Content:
- Logo + one-line tagline
- Navigation links
- Social icons: Instagram, maybe YouTube
- "© 2026 Flow With Curtana"
- "Designed with intention"

Design:
- Dark, warm, no harsh lines
- Soft top border in sage
```

- [ ] Footer component
- [ ] Social icons (SVG, not emoji)

### Page Transitions
```
File: src/components/layout/PageTransition.tsx

Using Framer Motion AnimatePresence:
- Enter: opacity 0 → 1, translateY 12px → 0, duration 800ms
- Exit: opacity 1 → 0, duration 400ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

- [ ] PageTransition wrapper
- [ ] RootLayout wired up

---

## ✅ Phase 3 — Hero 3D Scene (PRIORITY)

> The signature piece. This is what makes the site unforgettable.
> Lusion-quality scroll experience, but in the language of breath and nature.

### Step 1 — Canvas setup
```
File: src/components/3d/MistScene.tsx

- R3F Canvas, alpha:true so background CSS shows through
- Camera: PerspectiveCamera, fov=50 (narrow = more intimate)
- Renderer: setClearColor transparent
- Dynamic import — no SSR
```

- [ ] Canvas + camera setup
- [ ] Dynamic import in page.tsx

### Step 2 — Breathing particle mist
```
N = 3000 particles for desktop, 800 for mobile
Colors: mix of sage (#7fa882), sand (#c8b89a), cream (#f5f0e8)
        with varying opacity 0.2–0.7
Size: small (0.02–0.05) with sizeAttenuation:true
Motion:
  - Particles drift upward slowly (vy = 0.001–0.003)
  - Loop: when particle reaches top, reset to bottom
  - Mouse repel: within 60px radius, gentle push (strength 0.15)
  - "Breath" animation: subtle collective in/out wave using sin(time)
    scale all y velocities by (1 + sin(t * 0.5) * 0.3)
```

- [ ] Particle system with organic drift
- [ ] Mouse repel (gentle, not electric)
- [ ] Breath animation (collective wave)
- [ ] Color variation across particles

### Step 3 — Scroll sync
```
Scroll 0–100% maps to:
  - Camera Z: 6 → 0 (pulls forward, world opens)
  - Camera Y: 0 → -0.5 (slight tilt as user descends)
  - Particle opacity: 1.0 → 0.3 (mist clears as you scroll)
  - Particle spread: tightens toward center then disperses

Lerp factor: 0.04 (slower than Shaw's 0.06 — more meditative)
```

- [ ] useScroll hook for progress
- [ ] Camera lerp to scroll position
- [ ] Particle opacity fade on scroll

### Step 4 — Name reveal animation
```
On page load:
  - Particles START in a tight cluster (Curtana's name shape)
  - Over 2 seconds: they bloom outward into the mist
  - Simultaneously: Curtana's name fades in as DOM text over the scene

This is the WOW moment. Like breath expanding.
```

- [ ] Name cluster starting position
- [ ] Bloom-out animation (lerp from cluster to random)
- [ ] Timing sync with DOM text reveal

### Step 5 — Scroll chapter overlays (DOM, not canvas)
```
File: src/components/3d/ChapterOverlay.tsx

Chapters appear as floating text at scroll milestones:
  0–15%:  "Move with intention."
  15–35%: "Find your breath."
  35–55%: "Open to possibility."
  55–75%: "Return to stillness."
  75–100%: "Begin your practice."

Style: Cormorant italic, large, centered, very low opacity (0.6)
       Fade in/out with Framer Motion
```

- [ ] ChapterOverlay component
- [ ] 5 chapters with scroll triggers

---

## ✅ Phase 3B — Mountain Journey (HOME PAGE HERO — THE SIGNATURE PIECE)

> This is the Lusion-inspired 5-act scroll experience.
> All components are pre-built. Wire them into the home page.
> Reference: inspiration/LUSION_VISUAL_ANALYSIS.md

### Pre-built components (already in codebase)
```
src/components/3d/MountainJourney.tsx  — Canvas renderer, all 5 acts
src/components/3d/JourneyChapters.tsx  — Framer Motion chapter overlays
src/components/ui/ScrollPath.tsx       — SVG path that draws on scroll
src/hooks/useScrollProgress.ts         — 0→1 scroll progress hook
```

### Integration tasks
- [ ] Wire MountainJourney into home page as the primary hero
- [ ] Add 900vh scroll container with sticky canvas
- [ ] Add JourneyChapters overlay (reads same scrollProgress)
- [ ] Add ScrollPath line animation
- [ ] Add scroll progress bar at top (gradient line)
- [ ] After journey ends (scrollProgress 1.0): fade into existing content sections
- [ ] Test scroll performance (target 60fps)
- [ ] Mobile: reduce particle counts (tunnel: 150, snow: 80, smoke: 20)
- [ ] prefers-reduced-motion: show static mountain scene, skip journey

### Architecture
```
<div ref={containerRef} style={{ height: '900vh' }}>
  <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
    <MountainJourney scrollProgress={progress} />
  </div>
</div>
<JourneyChapters progress={progress} />
<ScrollPath progress={progress} />

{/* After journey: existing content sections */}
<section> About teaser </section>
<section> Services </section>
<section> Testimonials </section>
<section> CTA </section>
```

### Act-by-act verification checklist
- [ ] Act 1: Sacred geometry rings render, camera moves forward, emitters glow
- [ ] Act 2: Mandala beams radiate, petals spin, dark void center
- [ ] Act 3: Golden rays + orbs, warm core pulses, color shift from sage to gold
- [ ] Act 4: Mountain layers render, snow falls, meditator visible on peak
- [ ] Act 5: Figure rotates, face reveals, candle lights, smoke rises, portal expands
- [ ] Transitions: flash/bloom between acts (not fades)
- [ ] Chapters: text appears/disappears at correct scroll ranges
- [ ] Mouse parallax: all layers respond to cursor position
- [ ] Smooth: camera lerp at 0.028 (breath-paced)

---

## ✅ Phase 4 — Core Pages

### Home page
- [ ] Hero section (3D scene + DOM text overlay)
- [ ] About teaser (2 sentences + photo + link)
- [ ] Featured services (3 cards)
- [ ] Testimonial section (2–3 quotes)
- [ ] CTA strip ("Ready to flow?")

### About page
- [ ] Hero with Curtana's photo and bio
- [ ] Philosophy / approach section
- [ ] Credentials / certifications
- [ ] Personal story section

### Services page
- [ ] Services overview header
- [ ] Individual service cards with:
  - Name, description, duration, price range
  - "Book this" CTA
  - Hover: bloom effect
- [ ] Services: Private Flow, Collective Breath, The Breath Work, Return to Stillness, Workplace Wellness

### Contact page
- [ ] Contact form (React Hook Form + EmailJS)
- [ ] Location / availability info
- [ ] Social links

### Book page
- [ ] Calendly or Acuity embed
- [ ] Brief pre-booking copy ("What to expect")

---

## ✅ Phase 5 — Interactions

### Water cursor
```
File: src/components/ui/WaterCursor.tsx

- 20px soft bloom: sage green, opacity 0.3, blur 4px
- Trailing ripples: 3 concentric circles expand + fade over 600ms
- On CTA hover: bloom swells to 44px, gold color
- Implementation: canvas-based or CSS custom cursor
```
- [ ] WaterCursor component
- [ ] Ripple trail system
- [ ] Hover state (gold for CTAs)

### Card bloom reveal
```
File: src/components/ui/BloomCard.tsx

On scroll into view:
  - Start: translateY(40px), rotateX(-8deg), opacity:0, scale:0.96
  - End: translateY(0), rotateX(0), opacity:1, scale:1
  - Duration: 900ms, easing: cubic-bezier(0.16, 1, 0.3, 1)
  - Stagger: 120ms between cards

On hover:
  - scale: 1.025 (very subtle — not Shaw's 1.02)
  - box-shadow: sage glow outward
  - border-color: sage-light
  - Slow: transition duration 400ms
```
- [ ] BloomCard component
- [ ] Scroll reveal with IntersectionObserver
- [ ] Hover bloom state

### Organic text reveal
```
Headings animate in word-by-word (not letter-by-letter — too techy)
Each word: fade + translateY(8px) → 0
Stagger: 60ms per word
Duration: 600ms per word
```
- [ ] Word-by-word reveal hook
- [ ] Apply to all H1/H2 elements

### Scroll progress indicator
```
NOT a progress bar — a soft breathing circle in the bottom-right:
  - Circle expands from 0% to 100% as you scroll
  - Color: sage, opacity 0.4
  - Like a mandala completing
```
- [ ] Scroll progress mandala

---

## ✅ Phase 6 — Content

> Claude Code: NEVER use placeholder text. All content from CONTENT.md.
> If content is missing, flag it — don't invent it.

- [ ] All page copy from CONTENT.md wired in
- [ ] Placeholder images replaced with real ones (flag when needed)
- [ ] SEO meta tags on all pages
- [ ] Open Graph image generated

---

## ✅ Phase 7 — Booking Integration

- [ ] Calendly embed on /book page
- [ ] "Book a Session" CTA links working
- [ ] Contact form wired to EmailJS
- [ ] Form validation with React Hook Form
- [ ] Success/error states on form

---

## ✅ Phase 8 — Polish

### Mobile (PRIORITY — Instagram audience = mobile first)
- [ ] Nav hamburger menu works
- [ ] 3D scene: 800 particles on mobile (not 3000)
- [ ] Water cursor disabled on touch
- [ ] All text readable at 375px width
- [ ] CTAs are thumb-friendly (min 44px height)

### Performance
- [ ] Lighthouse > 90 performance score
- [ ] Three.js: dynamic import, no SSR
- [ ] Images: next/image, webp format
- [ ] Fonts: display: swap
- [ ] `prefers-reduced-motion` disables all animation

### Accessibility
- [ ] All images have alt text
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested

---

## ✅ Phase 9 — Launch

- [ ] Final Vercel deploy
- [ ] Custom domain: flowwithcurtana.com
- [ ] Vercel Analytics enabled
- [ ] Google Analytics (optional)
- [ ] Test: Chrome, Safari, Firefox
- [ ] Test: iPhone, Android, iPad
- [ ] Share to Curtana's Instagram

---

## 🐛 Open Questions

- [ ] Does Curtana use Calendly or another booking system?
- [ ] What services/prices should be listed?
- [ ] Real photos — headshots, action shots of classes?
- [ ] Does she have existing brand colors / logo?
- [ ] What testimonials can we use?
- [ ] Blog needed in v1?

---

## 📝 Session Log

```
2026-03-22  Initial planning — all docs created by Shaw + Claude
2026-03-22  Added Mountain Journey animation system:
            - src/components/3d/MountainJourney.tsx (5-act canvas renderer)
            - src/components/3d/JourneyChapters.tsx (Framer Motion chapter overlays)
            - src/components/ui/ScrollPath.tsx (SVG line that draws on scroll)
            - src/hooks/useScrollProgress.ts (0→1 scroll progress hook)
            - inspiration/LUSION_VISUAL_ANALYSIS.md (72-screenshot analysis of lusion.co)
            - public/mountain-journey-demo.html (standalone browser preview)
            - Updated CLAUDE.md with mountain journey specs
            - Updated PLAN.md with Phase 3B
            - Updated ANIMATIONS.md with full act-by-act animation specs
```
