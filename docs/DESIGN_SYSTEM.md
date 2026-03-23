# DESIGN_SYSTEM.md — Flow With Curtana

> Every visual decision. Claude Code: check here before ANY CSS.

---

## 🎨 Color Tokens

```css
:root {
  /* Backgrounds */
  --bg:          #0d0f0e;   /* deep forest dark */
  --bg2:         #141815;   /* card backgrounds */
  --surface:     #1c211d;   /* elevated surfaces */

  /* Borders */
  --border:      rgba(127, 168, 130, 0.12);
  --border2:     rgba(127, 168, 130, 0.25);
  --border3:     rgba(127, 168, 130, 0.4);

  /* Sage — primary brand */
  --sage:        #7fa882;
  --sage-light:  #a8c5aa;
  --sage-dark:   #4a6b4c;
  --sage-glow:   rgba(127, 168, 130, 0.25);

  /* Sand / skin warmth */
  --sand:        #c8b89a;
  --sand-light:  #e0d4c0;
  --sand-dark:   #8c7a62;

  /* Cream */
  --cream:       #f5f0e8;

  /* Water / breath */
  --mist:        #8fb5c4;
  --mist-soft:   rgba(143, 181, 196, 0.15);

  /* Gold — accent, special moments */
  --gold:        #c9a96e;
  --gold-soft:   rgba(201, 169, 110, 0.2);

  /* Text */
  --text:        #e8ede9;   /* primary — warm white */
  --muted:       #7a8b7c;   /* secondary */
  --dim:         #3d4a3e;   /* disabled */
}
```

---

## 🔤 Typography

### Fonts
```css
--font-display: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
--font-body:    'DM Sans', -apple-system, sans-serif;
```

### Loading (Next.js)
```ts
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
})
```

### Scale
| Use | Size | Font | Weight | Style | Tracking |
|-----|------|------|--------|-------|---------|
| Hero name | clamp(64px, 10vw, 120px) | display | 300 | italic | -3px |
| Section H1 | clamp(40px, 5vw, 68px) | display | 400 | normal | -2px |
| Section H2 | clamp(28px, 3vw, 42px) | display | 400 | italic | -1px |
| Card title | 24px | display | 500 | normal | -0.5px |
| Body text | 15px | body | 300 | normal | 0 |
| Body large | 17px | body | 300 | normal | 0 |
| Label | 11px | body | 400 | normal | 3px |
| Mantra quote | clamp(20px, 3vw, 32px) | display | 300 | italic | 0 |
| Button | 13px | body | 400 | normal | 1.5px |
| Nav link | 13px | body | 400 | normal | 1px |

### Rules
- Display font is ALWAYS Cormorant Garamond
- Body is ALWAYS DM Sans — never mono
- Italic is for emotional moments: hero, quotes, mantras
- Uppercase labels: 11px, 3px letter-spacing, body font only

---

## 📐 Spacing

```
4px   — micro (between pill elements)
8px   — tight (icon + text)
12px  — component gap
16px  — standard internal padding
20px  — card padding (mobile)
28px  — card padding (desktop)
32px  — section element gap
48px  — section padding horizontal
64px  — between page sections (mobile: 48px)
100px — major section breaks (mobile: 64px)
```

---

## 🧩 Component Specs

### Card (base — wellness style)
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;        /* softer than Shaw's 16px */
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: all 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hover: soft bloom outward */
.card:hover {
  border-color: var(--border2);
  transform: scale(1.015);    /* very subtle — not tech-snappy */
  box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 30px var(--sage-glow);
}
```

### Service Card
```css
/* Has an organic top gradient accent */
.service-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--sage), var(--sand));
  opacity: 0;
  transition: opacity 600ms;
}
.service-card:hover::before { opacity: 1; }
```

### Button — Primary
```css
.btn-primary {
  background: var(--sage);
  color: var(--bg);
  padding: 14px 32px;
  border-radius: 100px;       /* pill shape — soft, welcoming */
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: all 500ms cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  cursor: none;
}

.btn-primary:hover {
  background: var(--sage-light);
  transform: scale(1.03);
  box-shadow: 0 8px 30px var(--sage-glow);
}
```

### Button — Ghost (outline)
```css
.btn-ghost {
  background: transparent;
  color: var(--sage-light);
  border: 1px solid var(--border2);
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-ghost:hover {
  border-color: var(--sage);
  color: var(--sage);
  box-shadow: 0 0 20px var(--sage-glow);
}
```

### Section Tag (eyebrow label)
```css
/* "01 — about" style label above section titles */
.section-tag {
  font-family: var(--font-body);
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--sage);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.section-tag::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--sage);
}
```

### Testimonial Card
```css
.testimonial {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
}
.testimonial-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 300;
  color: var(--sand-light);
  line-height: 1.65;
  margin-bottom: 20px;
}
.testimonial-author {
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
}
```

### Nav
```css
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 20px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 600ms, backdrop-filter 600ms;
}

/* Scrolled state */
nav.scrolled {
  background: rgba(13, 15, 14, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.nav-logo {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 20px;
  font-weight: 300;
  color: var(--cream);
  letter-spacing: -0.5px;
}

.nav-link {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--muted);
  text-decoration: none;
  transition: color 300ms;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0; right: 0;
  height: 1px;
  background: var(--sage);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover { color: var(--text); }
.nav-link:hover::after { transform: scaleX(1); }
```

---

## 🌊 Particle Color Palette (Three.js)

```ts
// Mix of these colors for organic mist feel
const PARTICLE_COLORS = [
  new THREE.Color('#7fa882'),  // sage — dominant
  new THREE.Color('#a8c5aa'),  // sage light
  new THREE.Color('#c8b89a'),  // sand
  new THREE.Color('#f5f0e8'),  // cream — brightest, fewest
  new THREE.Color('#8fb5c4'),  // mist blue — accent
]

// Distribution weights
// sage:        40%
// sage-light:  30%
// sand:        20%
// cream:        7%
// mist:         3%
```

---

## ⏱️ Animation Tokens

```css
/* The "breath" ease — slow in, feather out */
--ease-breath:  cubic-bezier(0.16, 1, 0.3, 1);

/* For hover states — immediate but soft */
--ease-bloom:   cubic-bezier(0.34, 1.1, 0.64, 1);  /* slight overshoot */

/* For exits / fades */
--ease-release: cubic-bezier(0.4, 0, 0.2, 1);

/* Durations */
--dur-instant:  150ms;   /* color changes */
--dur-fast:     300ms;   /* hover states */
--dur-reveal:   900ms;   /* scroll reveals */
--dur-slow:     1400ms;  /* hero reveals, page transitions */
--dur-breath:   4000ms;  /* breathing animations */

/* Stagger */
--stagger-word:   60ms;   /* word-by-word text reveal */
--stagger-card:   120ms;  /* between cards */
--stagger-elem:   80ms;   /* between general elements */
```

---

## 🌿 Wellness-Specific Rules

1. **Never use box-shadow alone** — use `box-shadow + sage glow` together
2. **Round corners everywhere** — border-radius minimum 12px, prefer 16–24px
3. **No sharp dividers** — section breaks use gradient fades, not hard lines
4. **Breathing space** — line-height never below 1.7 for body text
5. **Warmth in everything** — even dark sections have warm undertones (not cold gray)
6. **Images: always rounded** — never square crop photos
7. **Motion: always slow** — if it feels too fast, halve the speed
8. **Text on dark: always warm white** — use --cream or --text, never pure #ffffff
