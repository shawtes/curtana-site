# REFERENCES.md — Inspiration for Flow With Curtana

> The goal: Lusion-quality interactions, wellness-industry aesthetic.
> NOT a typical soft yoga site. NOT a Lusion clone.
> The meeting point of both: cinematic, grounded, alive.

---

## 🏆 Primary Inspiration

### Lusion (lusion.co) — For INTERACTION quality
**What to steal:**
- Scroll-driven 3D storytelling — the camera moves, the world opens
- Click to slow motion → we use this for the breathing particle field
- Particles that feel alive and responsive, not decorative
- Chapter text overlays that appear and fade with scroll progress
- The feeling that scrolling is a journey, not just reading

**What NOT to steal:**
- Electric blue/purple color palette — wrong for wellness
- Hard geometric shapes — too tech
- Fast snappy animations — opposite of what we want
- The dramatic/intense energy — we want calm, grounded, expansive

---

### Some Good Wellness Sites to Reference

**Alo Yoga (aloyoga.com)**
- Why: Premium dark aesthetic, not the typical white/pastel yoga site
- Steal: How they use large editorial photography
- Steal: The dark background with warm white text
- Don't steal: Their fast animations, commercial energy

**Headspace (headspace.com)**
- Why: Calm, clean, purposeful design
- Steal: The whitespace, the breathing room in layouts
- Steal: How they convey calm through composition
- Don't steal: Their flat cartoon illustrations

**Goop (goop.com)**
- Why: Editorial wellness with premium feel
- Steal: The serif type pairing, editorial layout
- Steal: How they elevate wellness to luxury
- Don't steal: The white/beige palette (too expected)

---

## 🌿 Color Mood References

**Natural references (not websites — actual nature):**
- Forest at dawn — deep greens, morning mist, dappled light
- Breath on a cold morning — soft, dissipating, gentle
- Still water surface — mirror-like, occasional ripple
- Moss on stone — deep sage, earth tones, organic

**The WRONG references:**
- Bright white + mint green (clinical spa)
- Purple gradient (spiritual cliché)
- Pastel pink (Instagram wellness trend)
- Neon green (tech/gaming, opposite)

---

## 🎬 WebGL References (Lusion techniques → wellness translation)

### Lusion astronaut → Curtana breathing mist

| Lusion | Curtana Equivalent |
|--------|-------------------|
| Astronaut flies through space | Viewer breathes into expanding mist |
| Click = slow motion | Click/hold = deeper breath, world slows |
| Electric blue particles | Organic sage/cream particles |
| Space portals | Moments of stillness / arrivals |
| Glass shattering at end | Mist fully clears, golden light arrives |
| Fast lerp camera | Slow breath-paced camera lerp |

### Key Three.js techniques to use

**1. Organic particle drift (replace star field)**
```
Instead of sharp star points:
- Slightly larger particles (0.025 vs 0.015)
- Soft colors (sage, cream, sand) not white
- Random drift upward (like incense smoke)
- Gentle breath modulation on y-velocity
```

**2. Particle morphing (body silhouette)**
```
Lusion uses it for abstract shapes.
We use it for: particles that form a human body in yoga pose
- State A: scattered mist
- State B: particles gather into a body silhouette
- Morph on scroll
- Uses lerp between two BufferGeometry attribute sets
```

**3. Portal ring → Stillness rings**
```
Lusion: sharp glowing rings in space
Curtana: soft, breath-paced expanding rings
         like ripples on water or sound waves from a singing bowl
         colors: sage → sand → cream → fade out
```

**4. Volumetric fog (not available in basic Three.js but approximated)**
```
- THREE.Fog with near/far that changes with scroll
- Particle density modulated by scroll
- Camera fog = scene feels like mist is real
```

---

## 🔤 Typography References

**Cormorant Garamond in the wild:**
- Loewe (luxury fashion brand) — similar editorial quality
- The New York Times Magazine — authoritative serif
- Various high-end wellness brands

**The italic usage:**
- Hero name: italic, very large, weight 300 — delicate strength
- Quote/mantra text: italic, flowing — emotional resonance
- Regular text: not italic — grounded, clear

---

## ❌ Anti-Inspiration (What NOT to Build)

| Pattern | Why it's wrong |
|---------|---------------|
| White background with sage accents | Expected, generic, forgettable |
| Stock photo of woman on beach doing yoga | Every wellness site does this |
| "Holistic wellness journey" copy | Meaningless wellness jargon |
| Fast page transitions | Wrong energy for the brand |
| Rainbow chakra color palette | Spiritual cliché |
| Subscription popup on arrival | Kills the meditative arrival experience |
| Auto-playing background video | Heavy, intrusive, wrong texture |
| Parallax scrolling forest images | Overdone, expected |
| Mint/turquoise palette | Too spa-like, not premium enough |

---

## 📸 Photography Direction

**When Curtana provides real photos:**
- Shot in: natural light, organic settings (studio, outdoor, home)
- Colors: warm tones, sage greens, earth tones — NOT clinical white studio
- Composition: flowing movement preferred over static poses
- Edit: slightly warm, slightly moody — NOT oversaturated Instagram filter
- Treatment on site: always rounded corners (24–32px), never square crop
- Placement: always full-bleed or floated — never constrained in a small box

**Hero image:** Curtana in motion — not static. The movement should be visible.

**About image:** Warm, approachable, direct eye contact. Not a "yoga pose" shot.
