# Lusion v3 Visual Analysis — From 72 Actual Screenshots

> Shaw captured the full Lusion.co scroll journey frame-by-frame on 2026-03-22.
> This is what we actually saw, not guesses.

---

## The 6-Act Scroll Journey

### Act 1: Data Corridor (Early Scroll)
- Dark environment, astronaut SMALL at center (~8-10% viewport height)
- Tunnel made of **chunky rectangular blocks** — like floating server racks
- **Emission lights** on block surfaces: cyan, red, green, magenta points
- **Heavy chromatic aberration** — 3-5px RGB split on every edge
- Camera moves FORWARD through corridor as user scrolls
- Astronaut stays centered, environment moves past it

### Act 2: Crystalline Vortex (Mid Scroll)
- Blocks compress into **radiating beam structures**
- Green crystalline beams extend center → edges like inside a gemstone
- Center becomes a **dark void** ringed with bright green emission
- Kaleidoscope/mandala symmetry — beams form geometric patterns
- Particle density increases massively

### Act 3: Color Shift to Pink/Magenta
- Green shifts to **hot magenta/pink**
- Beams become a **fractal metallic web** — shattered crystal sphere from inside
- Glowing core pulses at center — extremely bright pink/white
- Emotional peak of the warp — feels alive

### Act 4: Blue Flash + Breakthrough
- SUDDEN saturated electric blue fills entire viewport
- Bright white light beams — geometry melts to smooth organic shapes
- The **portal breakthrough** — abstract warp → physical space
- Very brief — ~1-2 seconds of scroll

### Act 5: Blue Room Arrival
- Completely different world — deep saturated blue environment
- **White organic shapes** (circles, arches, flower petals) on walls/floor
- Astronaut NOW STANDING, full detail, in an **architectural space**
- Gallery/cathedral feel with actual perspective depth

### Act 6: CTA Finale
- Astronaut with arm raised (greeting/wave)
- Black background with **floating 3D stickers** — playful objects
- Glass bubbles floating
- Giant serif text: "Let's work together!"

---

## Technical Insights

### What Makes It Feel Real
1. **Chromatic aberration everywhere** — 3-5px RGB split, not subtle
2. **Emission lights on geometry** — small bright points on surfaces
3. **90% black backgrounds** — lights carry the entire scene
4. **Scene transitions use LIGHT FLASH/BLOOM** — not fades
5. **Astronaut is small** — 8-10% viewport during tunnel, grows to 40% at arrival

### Color Palettes
- Tunnel: Black + cyan/teal + red/magenta + green emissions
- Vortex: Black + bright green + gold-green
- Bloom: Black + hot pink/magenta + chrome metallic
- Breakthrough: Saturated blue + white flash
- Arrival: Deep blue + white shapes
- CTA: Black + white + playful stickers

---

## Wellness Remapping (Curtana's Version)

| Lusion Act | Curtana Act | Visual |
|------------|-------------|--------|
| Data corridor | Sacred geometry tunnel | Hexagonal rings with sage/teal emissions, floating spore particles |
| Crystalline vortex | Mandala vortex | Radiating beams from center, sacred geometry connecting lines |
| Pink core | Golden chakra bloom | Amber/gold rays, orbiting golden orbs, warm core |
| Blue room arrival | Mountain arrival | Snowy peaks, aurora sky, meditator on summit |
| CTA stickers | Candle + smoke portal | Figure turns, lights candle, smoke becomes page transition |

---

## The Mountain Journey Cinematic (5 Acts)

### Act 1 (0→0.20): SACRED GEOMETRY WARP TUNNEL
- Meditator back-facing, dead center, small
- Sacred geometry rings (hexagons/octagons) fly toward camera
- Sage/teal/cream emission lights on vertices
- Floating spore particles instead of data blocks
- Central glow at vanishing point
- Chromatic aberration on edges

### Act 2 (0.20→0.40): MANDALA VORTEX
- Rings compress into radiating beam mandala
- 24 beams from center with pulsing tips
- 200 spinning petal particles
- Dark void center with bright sage rim
- Sacred geometry connecting lines between beams

### Act 3 (0.40→0.55): GOLDEN CHAKRA BLOOM
- Color shift: sage/teal → warm amber/gold
- 40 radiating golden light rays
- 60 orbiting golden orbs
- Central golden core pulses with breath
- This is the emotional peak — warmth instead of heat

### Act 4 (0.55→0.72): MOUNTAIN ARRIVAL
- FLASH transition (golden bloom → mountain world)
- Layered mountain ranges: far (dark blue), mid (blue-grey), near (snow-capped)
- Starfield with aurora hint at horizon
- 200 snow particles drifting with wind
- Meditator seated on summit peak, breathing
- Aura glow + third eye bindi

### Act 5 (0.72→1.0): THE TURN + CANDLE + SMOKE PORTAL
- Figure rotates 180° (ctx.scale simulates 3D Y rotation)
  - < 90°: back facing | > 90°: front facing | at 90°: thin slice
- Face reveals: closed eyes, soft smile, third eye bindi
- At 0.70: candle appears between palms, flame ignites
- Warm amber light spreads across entire mountain scene
- Snow particles colorize: white → warm gold
- Mountain peaks shift: cold blue → warm ochre
- Smoke rises from flame, curves into vortex at top
- Portal expands from vortex point to fill viewport
- Full white at 0.98 → page transition to /services

### Chapter Overlays (DOM, not canvas)
```
0.02–0.12: "Somewhere beyond thought…" (left aligned)
0.22–0.32: "The breath finds you." (right aligned)
0.45–0.58: "Be still." (centered, large)
0.65–0.78: "A light in the dark." (centered)
0.85–0.95: "Follow the smoke." (centered, very large, gold)
```

Font: Cormorant Garamond italic, var(--cream)
Animate: opacity 0→1→0, y: 20px→0→-10px
Duration: 1400ms ease cubic-bezier(0.16,1,0.3,1)
