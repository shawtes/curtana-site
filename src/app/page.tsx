'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { useScrollSection } from '@/hooks/useScrollSection'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const SubmersionJourney = dynamic(() => import('@/components/3d/SubmersionJourney'), {
  ssr:     false,
  loading: () => (
    <div style={{ height: '800vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', background: 'var(--bg)' }} />
    </div>
  ),
})

const AuraStage = dynamic(() => import('@/components/3d/AuraStage'), {
  ssr:     false,
  loading: () => null,
})

const AuraChapters = dynamic(() => import('@/components/3d/AuraChapters'), {
  ssr:     false,
  loading: () => null,
})

const FEATURED_SERVICES = [
  {
    tag: 'one on one',
    title: 'Private Flow',
    subtitle: 'Your practice, your pace.',
    duration: '60 or 90 min · in-person or virtual',
    description:
      'One-on-one sessions built entirely around you. We\'ll begin with a conversation, then move into a practice designed for your body, your goals, and how you\'re feeling today.',
    href: '/services',
    delay: 100,
  },
  {
    tag: 'group',
    title: 'Collective Breath',
    subtitle: 'Move together. Breathe together.',
    duration: '60 min · in-person or virtual',
    description:
      'There\'s something powerful about breathing in sync with others. Group classes offer a shared experience of movement, breath, and community — welcoming to all levels.',
    href: '/services',
    delay: 200,
  },
  {
    tag: 'breathwork',
    title: 'The Breath Work',
    subtitle: 'Where transformation begins.',
    duration: '75 min · in-person or virtual',
    description:
      'Breathwork is one of the most powerful tools for nervous system regulation, emotional release, and mental clarity. Sessions blend guided breathing with grounding movement.',
    href: '/services',
    delay: 300,
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Working with Curtana changed how I relate to my body. For the first time in years, I actually enjoy moving.',
    name: 'Sarah M.',
    role: 'Private Flow client',
    delay: 0,
  },
  {
    quote:
      'The breathwork session was unlike anything I\'d experienced. I left feeling like I\'d been reset.',
    name: 'James K.',
    role: 'Breathwork session',
    delay: 120,
  },
  {
    quote:
      'I came for the yoga. I stayed for the community and the way Curtana holds space. Truly transformative.',
    name: 'Priya R.',
    role: 'Group class member',
    delay: 240,
  },
]

const BREATH_EASE_TUPLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Fades a content panel in/out based on progress window
function inRange(p: number, from: number, to: number, fadePad = 0.03) {
  if (p < from - fadePad || p > to + fadePad) return 0
  if (p < from) return (p - (from - fadePad)) / fadePad
  if (p > to) return 1 - (p - to) / fadePad
  return 1
}

export default function HomePage() {
  // Aura content journey — 500vh scroll experience
  const { containerRef: contentRef, progress: cp } = useScrollProgress()

  // CTA portal ring
  const { ref: ctaRef, enterProgress: ctaProgress, inView: ctaInView } =
    useScrollSection()

  return (
    <main>
      {/* ── SUBMERSION JOURNEY — 800vh cinematic hero ── */}
      <SubmersionJourney />


      {/* ══════════════════════════════════════════════════════════════════════
          AURA CONTENT JOURNEY — 500vh sticky container
          The stage: Curtana's aura glows out and transforms into each section.
          Camera follows her deeper as you scroll.
          ══════════════════════════════════════════════════════════════════════ */}
      <div
        ref={contentRef}
        style={{ height: '500vh', position: 'relative' }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            background: 'var(--bg)',
            overflow: 'hidden',
          }}
        >
          {/* ── AURA STAGE CANVAS ── */}
          <AuraStage scrollProgress={cp} />

          {/* ── AURA CHAPTER TEXT OVERLAYS (glass + animated words) ── */}
          <AuraChapters progress={cp} />

          {/* ── SECTION CONTENT PANELS ── */}

          {/* ── ABOUT PANEL ── visible 0.02 → 0.27 ── */}
          <motion.div
            animate={{ opacity: inRange(cp, 0.02, 0.27) }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              bottom: 'clamp(48px, 8vh, 80px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(640px, 90vw)',
              pointerEvents: cp >= 0.02 && cp <= 0.27 ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                background: 'rgba(13,15,14,0.6)',
                backdropFilter: 'blur(20px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                border: '1px solid rgba(127,168,130,0.12)',
                borderRadius: 18,
                padding: 'clamp(20px, 3vw, 36px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 'clamp(14px, 1.6vw, 16px)',
                  fontWeight: 300,
                  color: 'var(--text)',
                  lineHeight: 1.85,
                  margin: 0,
                }}
              >
                I'm Curtana — a yoga teacher, breathwork guide, and wellness coach.
                My practice is rooted in the belief that your body already knows the way.
                I'm just here to help you listen.
              </p>
              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '12px',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: 'var(--sage)',
                  textDecoration: 'none',
                  alignSelf: 'flex-start',
                }}
              >
                Learn more →
              </Link>
            </div>
          </motion.div>

          {/* ── SERVICES PANEL ── visible 0.30 → 0.57 ── */}
          <motion.div
            animate={{ opacity: inRange(cp, 0.30, 0.57) }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              bottom: 'clamp(40px, 6vh, 64px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(900px, 94vw)',
              pointerEvents: cp >= 0.30 && cp <= 0.57 ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(10px, 1.5vw, 18px)',
              }}
            >
              {FEATURED_SERVICES.map((service, i) => (
                <motion.div
                  key={service.title}
                  animate={{ opacity: inRange(cp, 0.30, 0.57), y: inRange(cp, 0.30, 0.57) === 0 ? 20 : 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: BREATH_EASE_TUPLE }}
                  style={{
                    background: 'rgba(13,15,14,0.65)',
                    backdropFilter: 'blur(20px) saturate(1.3)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                    border: '1px solid rgba(127,168,130,0.13)',
                    borderRadius: 16,
                    padding: 'clamp(16px, 2.5vw, 28px)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: '10px',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      color: 'var(--sage)',
                      marginBottom: 10,
                    }}
                  >
                    {service.tag}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 'clamp(18px, 2vw, 24px)',
                      color: 'var(--cream)',
                      marginBottom: 8,
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: '10px',
                      color: 'var(--muted)',
                      letterSpacing: '1.5px',
                      marginBottom: 12,
                    }}
                  >
                    {service.duration}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: 'clamp(12px, 1.3vw, 14px)',
                      fontWeight: 300,
                      color: 'var(--text)',
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── TESTIMONIALS PANEL ── visible 0.60 → 0.84 ── */}
          <motion.div
            animate={{ opacity: inRange(cp, 0.60, 0.84) }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              bottom: 'clamp(40px, 6vh, 64px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(880px, 94vw)',
              pointerEvents: cp >= 0.60 && cp <= 0.84 ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(10px, 1.5vw, 18px)',
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  animate={{
                    opacity: inRange(cp, 0.60, 0.84),
                    y: inRange(cp, 0.60, 0.84) === 0 ? 20 : 0,
                  }}
                  transition={{ duration: 0.9, delay: i * 0.12, ease: BREATH_EASE_TUPLE }}
                  style={{
                    background: 'rgba(20,24,21,0.7)',
                    backdropFilter: 'blur(20px) saturate(1.3)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                    border: '1px solid rgba(127,168,130,0.1)',
                    borderRadius: 16,
                    padding: 'clamp(18px, 2.5vw, 32px)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: 'clamp(14px, 1.6vw, 18px)',
                      color: 'var(--cream)',
                      lineHeight: 1.65,
                      marginBottom: 20,
                    }}
                  >
                    "{t.quote}"
                  </p>
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body), sans-serif',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: 'var(--sand)',
                        marginBottom: 2,
                      }}
                    >
                      {t.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-body), sans-serif',
                        fontSize: '11px',
                        color: 'var(--muted)',
                        letterSpacing: '1.5px',
                      }}
                    >
                      {t.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── CTA PANEL ── visible 0.87 → 1.0 ── */}
          <motion.div
            animate={{ opacity: inRange(cp, 0.87, 1.0) }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: cp >= 0.87 ? 'auto' : 'none',
            }}
          >
            <motion.p
              animate={{ opacity: inRange(cp, 0.87, 1.0) > 0.3 ? 1 : 0, y: inRange(cp, 0.87, 1.0) > 0.3 ? 0 : 12 }}
              transition={{ duration: 1.0, delay: 0.3 }}
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--muted)',
                lineHeight: 1.85,
                marginBottom: 36,
                maxWidth: 440,
              }}
            >
              Sessions available online and in-person.
              <br />Your practice begins with one breath.
            </motion.p>
            <motion.div
              animate={{ opacity: inRange(cp, 0.87, 1.0) > 0.5 ? 1 : 0, scale: inRange(cp, 0.87, 1.0) > 0.5 ? 1 : 0.95 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              <Link
                href="/book"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: 'var(--bg)',
                  background: 'var(--sage)',
                  padding: '16px 52px',
                  borderRadius: '100px',
                  textDecoration: 'none',
                }}
              >
                Book a session →
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll position indicator dots */}
          <div
            style={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              zIndex: 30,
            }}
          >
            {(['about', 'services', 'testimonials', 'cta'] as const).map((phase, i) => {
              const ranges = [[0.02, 0.27], [0.30, 0.57], [0.60, 0.84], [0.87, 1.0]]
              const [from, to] = ranges[i]
              const active = cp >= from && cp <= to
              return (
                <div
                  key={phase}
                  style={{
                    width: active ? 6 : 4,
                    height: active ? 20 : 4,
                    borderRadius: 100,
                    background: active ? 'var(--sage)' : 'rgba(127,168,130,0.25)',
                    transition: 'all 600ms cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>{/* /500vh-container */}

      {/* ── CTA STRIP — Scene 5: portal of calm light ── */}
      <section
        ref={ctaRef as React.RefObject<HTMLElement>}
        style={{
          padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 60px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Portal ring — expands on scroll, inviting entry */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              borderRadius: '50%',
              border: `1px solid rgba(127,168,130,${0.12 - i * 0.03})`,
              transform: `translate(-50%, -50%) scale(${
                ctaInView
                  ? 0.4 + ctaProgress * (0.6 + i * 0.5)
                  : 0.2 + i * 0.1
              })`,
              width: `${80 + i * 120}vw`,
              height: `${80 + i * 120}vw`,
              opacity: ctaInView ? Math.max(0, 0.7 - i * 0.2) : 0,
              transition: `transform 1400ms cubic-bezier(0.16,1,0.3,1) ${i * 80}ms,
                           opacity 800ms ease ${i * 80}ms`,
              pointerEvents: 'none',
            }}
          />
        ))}
        {/* Warm radial glow that breathes in */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${ctaInView ? 1 : 0.3})`,
            width: '80vw',
            height: '80vw',
            background: 'radial-gradient(ellipse, rgba(127,168,130,0.09) 0%, transparent 65%)',
            opacity: ctaInView ? 1 : 0,
            transition: 'transform 1600ms cubic-bezier(0.16,1,0.3,1), opacity 1000ms ease',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <ScrollReveal duration={1200}>
            <h2
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(36px, 6vw, 72px)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--cream)',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              Ready to flow?
            </h2>
          </ScrollReveal>

          <ScrollReveal duration={1000} delay={150}>
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '16px',
                fontWeight: 300,
                color: 'var(--muted)',
                lineHeight: 1.85,
                marginBottom: 44,
                maxWidth: 520,
                margin: '0 auto 44px',
              }}
            >
              Sessions are available online and in-person. Your practice begins with one breath.
            </p>
          </ScrollReveal>

          <ScrollReveal duration={900} delay={250}>
            <Link
              href="/book"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--bg)',
                background: 'var(--sage)',
                padding: '18px 52px',
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1), box-shadow 400ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--sage-light)'
                e.currentTarget.style.transform = 'scale(1.04)'
                e.currentTarget.style.boxShadow = '0 0 60px rgba(127,168,130,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--sage)'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Book a session →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50%       { opacity: 1;   transform: scaleY(1.2); }
        }
      `}</style>
    </main>
  )
}
