# CLAUDE.md — Flow With Curtana — Website (curtana-site)

> **Read this at the start of every session. This is the single source of truth.**
> Updated: 2026-03-23 | Status: Active Development

---

## 🗂 Project State Snapshot

### What's Built (Production-Ready or Close)
| Component | File | Status |
|---|---|---|
| SubmersionJourney (7-act 3D hero) | `components/3d/SubmersionJourney.tsx` | ✅ Functional, needs polish |
| WaterPlane (Three.js Water shader) | `components/3d/WaterPlane.tsx` | ✅ Near-black moonlit, 5000×5000 |
| StarField (3-layer twinkling) | `components/3d/StarField.tsx` | ✅ Full spectral color system |
| WarpStreaks (Canvas 2D) | `components/3d/WarpStreaks.tsx` | ✅ Centers correctly |
| AuraStage (WebGL content bg) | `components/3d/AuraStage.tsx` | ✅ Scroll-driven |
| AuraChapters (text overlays) | `components/3d/AuraChapters.tsx` | ✅ |
| Home Page | `app/page.tsx` | ✅ SubmersionJourney + AuraStage |
| Nav | `components/layout/Nav.tsx` | ✅ Needs transition polish |
| Footer | `components/layout/Footer.tsx` | ✅ |
| WaterCursor | `components/ui/WaterCursor.tsx` | ✅ Sage bloom + ripple trail |
| ScrollReveal | `components/ui/ScrollReveal.tsx` | ✅ |
| About Page | `app/about/page.tsx` | 🔶 Skeleton |
| Services Page | `app/services/page.tsx` | 🔶 Skeleton |
| Book Page | `app/book/page.tsx` | 🔶 Skeleton (no Calendly yet) |
| Contact Page | `app/contact/page.tsx` | 🔶 Skeleton |
| Virtual Scroll (Lusion-style) | `hooks/useVirtualScroll.ts` | ❌ NOT YET BUILT |

### Act System (SubmersionJourney)
```
A0  0.00 → 0.15  Surface — night water, starfield, figure emerges
A1  0.15 → 0.28  Submersion — camera breaks through water surface
A2  0.28 → 0.45  The Deep — dark water, teal bioluminescence
A3  0.45 → 0.62  Geometry Awakens — sacred geometry rings
A4  0.62 → 0.78  Full Hyperspace — warp streaks, radial burst
A5  0.78 → 0.92  The Turn — figure rotates, faces camera
A6  0.92 → 1.00  White Bloom — light floods screen → portal out
```

---

## 👤 The Client

**Brand:** Flow With Curtana | **URL:** flowwithcurtana.com
**Owner:** Curtana — Shaw's brother's business. Treat with full ambition.
**Industry:** Yoga, breathwork, movement coaching
**Audience:** Instagram-first. Mobile is primary. Seeking transformation, not information.
**Tone:** Warm, grounded, sensory. NOT clinical, NOT corporate.

---

## 🎨 Design System (Implemented in globals.css)

### CSS Variables (already in `:root`)
```css
--bg:          #0d0f0e   /* deep forest dark */
--bg2:         #141815
--surface:     #1c211d

--sage:        #7fa882   /* SIGNATURE COLOR */
--sage-light:  #a8c5aa
--sage-dark:   #4a6b4c
--sage-glow:   rgba(127,168,130,0.25)

--sand:        #c8b89a
--sand-light:  #e0d4c0
--cream:       #f5f0e8   /* headings */

--mist:        #8fb5c4
--gold:        #c9a96e

--text:        #e8ede9
--muted:       #7a8b7c
--dim:         #3d4a3e

--border:      rgba(127,168,130,0.12)
--border2:     rgba(127,168,130,0.25)
```

### Fonts (loaded via @fontsource)
```
Display: Cormorant Garamond — italic, weights 300/400/500. All editorial headings.
Body:    DM Sans — weights 300/400/500. Clean, warm, never corporate.
NEVER:   Inter / Roboto / Open Sans
```

### Motion Rules
```
Easing:    cubic-bezier(0.16, 1, 0.3, 1)   — the "breath" ease
Duration:  800ms–1400ms for reveals (NOT snappy)
Lerp:      0.175 per 60fps frame (Lusion-measured, see below)
```

---

## 🌊 3D / WebGL Architecture

### Canvas Setup (SubmersionJourney)
```
Camera:  fov=55, near=0.1, far=2000, position=[0,1.8,6]
Fog:     Act 0 — FogExp2(0x0d0f0e, 0.012), Act 1+ — FogExp2(0x020b0e, 0.035)
Water:   PlaneGeometry(5000,5000), y=-1.8, sunDirection=(-0.4,0.08,-0.9), waterColor=0x0a1214
Stars:   3-layer system (BrightStars 2000 / FieldStars 8000 / MilkyWay 15000)
Streaks: WarpStreaks canvas2D overlay, active during A4+A5
```

### Key Rules for 3D Work
- `camera.far` must be ≥ water plane size. Water is 5000×5000 → `far: 2000` minimum.
- `AdditiveBlending` + `depthWrite: false` for all star/particle layers.
- `Stars` from drei is REMOVED — use `<StarField>` component.
- `DepthParticles` is REMOVED (sparkles around character, user hated it).
- `HorizonGradient` cylinder uses `THREE.BackSide` + custom ShaderMaterial.

---

## 🎡 Virtual Scroll System (Lusion-Style) — NEXT MAJOR SPRINT

We reverse-engineered Lusion's scroll at the byte level. See full analysis:
`/Users/sineshawmesfintesfaye/Downloads/curtana-workspace/inspiration/LUSION_SCROLL_ANALYSIS.md`

### The Algorithm (confirmed from live measurement)
```js
// Input: wheel deltaY → target (1:1 pixel mapping confirmed)
// Loop: lerp current toward target every RAF
// Output: translate3d(0px, -currentScroll, 0px) on #page-container

const LERP = 0.175  // confirmed: remaining × 0.67 per 30fps frame → 0.175 at 60fps
scrollCurrent += (scrollTarget - scrollCurrent) * LERP
pageContainer.style.transform = `translate3d(0px, ${-scrollCurrent}px, 0px)`
```

### Required Setup
```css
/* globals.css — add these */
html, body { overflow: hidden; }
```
```js
// layout.tsx — add this
const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`)
window.addEventListener('resize', setVH); setVH()
```

### Hook Location
Build: `src/hooks/useVirtualScroll.ts` — see LUSION_SCROLL_ANALYSIS.md for full recipe.

---

## 📱 Page Map

```
/          Home — SubmersionJourney (800vh) + AuraStage (500vh) + CTA strip
/about     About — MistScene bg, bio, philosophy, photo
/services  Services — all offerings, pricing (if any), booking CTA
/book      Book — Calendly embed or Acuity Scheduling
/contact   Contact — EmailJS form
```

### Inner Page Template Pattern
```tsx
// Every inner page uses:
// 1. MistScene (Three.js) as a fixed background hero
// 2. Glass-card content sections with blur/border
// 3. ScrollReveal for all body copy
// 4. WaterCursor always active
```

---

## ⚙️ Technical Stack

```
Framework:  Next.js 14+ App Router
Language:   TypeScript
Styling:    Tailwind CSS + CSS vars (globals.css)
3D:         Three.js + React Three Fiber + Drei
Animation:  Framer Motion (DOM), Three.js RAF (3D)
Fonts:      @fontsource/cormorant-garamond + @fontsource/dm-sans
Booking:    Calendly embed (Sprint 3)
Forms:      EmailJS (Sprint 3)
Deploy:     Vercel
Repo:       GitHub private (pushed)
```

---

## 🧠 Claude Code Working Rules

### Absolute Rules (never break these)
1. **SubmersionJourney is the home page hero** — never import MountainJourney on `/`
2. **No sparkles/DepthParticles** — removed by user request, do not re-add
3. **Stars = `<StarField>` component** — never use drei `<Stars>` on home page
4. **Colors from CSS vars only** — never hardcode hex that duplicates a CSS variable
5. **`camera.far ≥ 2000`** on any scene with WaterPlane (5000×5000 geometry)
6. **`width: '100%', height: '100%'`** required on canvas overlays alongside `inset: 0`
7. **`useActProgress` hook** is the source of truth for act-based animations
8. **Do not touch `page.tsx` import** — `SubmersionJourney` not `MountainJourney`

### Style Rules
9. Easing is always `cubic-bezier(0.16, 1, 0.3, 1)` — never `ease-in-out`
10. Durations 800ms–1400ms for reveals. Never under 600ms for major transitions.
11. Glass cards: `rgba(13,15,14,0.65)` bg + `blur(20px)` + sage border `0.12`
12. Headings: Cormorant Garamond, italic, weight 300-400
13. Body text: DM Sans 300, line-height 1.85

### Architecture Rules
14. All 3D components are dynamically imported with `ssr: false`
15. Inner pages use `<MistScene>` not `<SubmersionJourney>`
16. `useScrollProgress` for sticky-container scroll (existing)
17. `useVirtualScroll` (to-be-built) for the global Lusion-style scroll takeover
18. `prefers-reduced-motion` must be respected everywhere

---

## 🛠 Skills Arsenal (596 globally installed at `~/.claude/skills/`)

Invoke with `/skill-name` in any session. Quick reference for this project:

| What you're doing | Skill to use |
|---|---|
| Building React/Next.js features | `/jeffallan-react-expert` `/jeffallan-nextjs-developer` `/jeffallan-typescript-pro` |
| Debugging visual/3D issues | `/jeffallan-debugging-wizard` |
| Canvas 2D / shader work | `/anthropics-canvas-design` |
| UI design decisions | `/anthropics-frontend-design` `/daymade-ui-designer` |
| Researching Three.js patterns | `/daymade-deep-research` `/glebis-deep-research` |
| Code review before committing | `/jeffallan-code-reviewer` `/lev-ln-511-code-quality-checker` |
| Performance profiling | `/avifenesh-perf-profiler` `/avifenesh-perf-benchmarker` |
| Bundle / npm optimization | `/lev-ln-832-bundle-optimizer` `/lev-ln-821-npm-upgrader` |
| E2E / Playwright tests | `/jeffallan-playwright-expert` `/anthropics-webapp-testing` |
| Pre-launch security/code audit | `/lev-ln-620-codebase-auditor` `/lev-ln-621-security-auditor` |
| SEO | `/alireza-ai-seo` |
| Dead code removal | `/qdhenry-remove-dead-code` `/avifenesh-deslop` |
| Keeping docs current | `/avifenesh-sync-docs` `/lev-ln-110-project-docs-coordinator` |
| Animation patterns | `/qdhenry-gsap-animation` |
| TDD | `/glebis-tdd` `/jeffallan-test-master` |

Full sprint-to-skill mapping: `../SPRINT.md` → Skills Arsenal section.

---

## 🔗 References
- Lusion scroll analysis: `../inspiration/LUSION_SCROLL_ANALYSIS.md`
- Sprint plan: `../SPRINT.md`
- GitHub repo: (private, see .git/config)
- Live client site: https://www.flowwithcurtana.com
- Lusion inspiration: https://lusion.co
