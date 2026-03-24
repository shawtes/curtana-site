'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ScrollReveal from '@/components/ui/ScrollReveal'
import RevealImage from '@/components/ui/RevealImage'
import AnimatedLine from '@/components/ui/AnimatedLine'
import InnerPageShell from '@/components/layout/InnerPageShell'

const SERVICES = [
  {
    tag: 'psychological health',
    title: 'Psychological Health',
    subtitle: 'Less suffering. More happiness.',
    duration: '1:1 sessions · in-person or virtual',
    description:
      'Experience less suffering and more happiness through psychological exercise and nutrition programs. Curtana works with you to identify the root causes of your pain points and build a personalised plan for lasting change.',
    includes: [
      'Personalised psychological assessment',
      'Exercise & nutrition integration',
      'Weekly 1:1 sessions',
      'Between-session support',
    ],
    gradient: 'linear-gradient(135deg, #1a2e1c 0%, #0d1210 60%, #0a1510 100%)',
  },
  {
    tag: 'social skills',
    title: 'Social Skills',
    subtitle: 'Confidence in every room.',
    duration: '1:1 or group · in-person or virtual',
    description:
      'Improve confidence and communication skills in romantic and platonic relationships. Through ethical influence techniques and immersive social practice, you’ll move through the world with ease, warmth, and genuine presence.',
    includes: [
      'Confidence & communication frameworks',
      'Ethical flirting & attraction dynamics',
      'Real-world social practice',
      'Ongoing coaching & feedback',
    ],
    gradient: 'linear-gradient(135deg, #1c201a 0%, #0d0f0e 55%, #101a14 100%)',
  },
  {
    tag: 'professional referrals',
    title: 'Professional Referrals',
    subtitle: 'The right expert. Every time.',
    duration: 'Consultation · confidential',
    description:
      'Private solutions to professional problems through a curated network of trusted specialists across industries. Whether legal, financial, medical, or creative — Curtana connects you with exactly the right person, quietly and efficiently.',
    includes: [
      'Discreet needs assessment',
      'Curated specialist matching',
      'Warm introduction & context briefing',
      'Follow-through support',
    ],
    gradient: 'linear-gradient(135deg, #12181a 0%, #0d0f0e 55%, #0a1214 100%)',
  },
  {
    tag: 'corporate',
    title: 'Corporate Events',
    subtitle: 'Bring clarity to your team.',
    duration: 'Half-day or full-day · in-person',
    description:
      'Workshops and immersive experiences for teams — from communication and conflict resolution to group psychological health sessions. Curtana works with leadership to create bespoke programmes that actually move the needle.',
    includes: [],
    gradient: 'linear-gradient(135deg, #1e1a14 0%, #0d1210 55%, #181210 100%)',
  },
  {
    tag: 'press',
    title: 'Press & Speaking',
    subtitle: 'Thoughtful. On-brand. Memorable.',
    duration: 'Flexible · in-person or virtual',
    description:
      'For press enquiries, podcast appearances, panel discussions, and keynote opportunities. Curtana speaks on psychological health, social intelligence, and the private landscape of personal transformation.',
    includes: [],
    gradient: 'linear-gradient(135deg, #1a1e1c 0%, #0d1210 55%, #101810 100%)',
  },
]

export default function ServicesPage() {
  const pathname = usePathname()

  return (
    <InnerPageShell>
    <main style={{ paddingTop: 72, overflow: 'hidden' }}>

      {/* ══ HERO ══ */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 72px) 0',
        maxWidth: 1200, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(40px, 6vw, 100px)',
        alignItems: 'end',
      }}>
        <div>
          <ScrollReveal duration={1000}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--sage)', marginBottom: 28,
            }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--sage)', opacity: 0.5 }} />
              what I offer
            </p>
          </ScrollReveal>
          <ScrollReveal duration={1200} delay={80}>
            <h1 style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(38px, 5.5vw, 76px)',
              fontWeight: 400, fontStyle: 'italic',
              color: 'var(--cream)', lineHeight: 1.05,
              letterSpacing: '-2px', marginBottom: 32,
            }}>
              Private solutions to personal & professional problems.
            </h1>
          </ScrollReveal>
          <ScrollReveal duration={1000} delay={180}>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300,
              color: 'var(--muted)', lineHeight: 1.85, marginBottom: 40,
            }}>
              Every engagement is confidential. Every solution is tailored.
              Whether personal or professional — I meet you where you are.
            </p>
          </ScrollReveal>
        </div>

        {/* Hero — botanical garden image (real photo from site) */}
        <RevealImage
          aspect="3/4"
          delay={200}
          parallax={0.3}
          src="https://images.squarespace-cdn.com/content/v1/695b27224b510b7c2a50e426/46f10a10-d989-4db8-bbb1-c04c9c6c604a/2706.jpg"
          alt="Curtana — botanical greenhouse"
        />
      </section>

      {/* ══ ANIMATED LINE ══ */}
      <div style={{ margin: '0 clamp(24px, 5vw, 72px)' }}>
        <AnimatedLine seed={pathname + '-1'} height={130} opacity={0.7} delay={500} duration={2200} />
      </div>

      {/* ══ SERVICES — alternating rows ══ */}
      <section style={{
        padding: '0 clamp(24px, 5vw, 72px) clamp(80px, 12vw, 140px)',
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        gap: 'clamp(60px, 10vw, 120px)',
      }}>
        {SERVICES.map((service, i) => (
          <ScrollReveal key={service.title} duration={1100} delay={0}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(32px, 5vw, 80px)',
              alignItems: 'center',
              direction: i % 2 === 0 ? 'ltr' : 'rtl',
            }}>
              <div style={{ direction: 'ltr' }}>
                <RevealImage
                  aspect="4/3"
                  delay={i * 60}
                  parallax={0.28}
                  gradient={service.gradient}
                />
              </div>

              <div style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
                  color: 'var(--sage)',
                }}>{service.tag}</p>

                <h2 style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(26px, 3vw, 42px)',
                  fontWeight: 400, fontStyle: 'italic',
                  color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.5px',
                }}>{service.title}</h2>

                <p style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '11px', letterSpacing: '1.5px',
                  color: 'var(--muted)',
                }}>{service.duration}</p>

                <p style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 300,
                  color: 'var(--text)', lineHeight: 1.85,
                }}>{service.description}</p>

                {service.includes.length > 0 && (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {service.includes.map(item => (
                      <li key={item} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontFamily: 'var(--font-body), sans-serif',
                        fontSize: 13, fontWeight: 300, color: 'var(--muted)',
                      }}>
                        <span style={{ width: 16, height: 1, background: 'var(--sage)', opacity: 0.6, flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href="/contact"
                  style={{
                    alignSelf: 'flex-start', display: 'inline-block', marginTop: 8,
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: '12px', fontWeight: 400,
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: 'var(--bg)', background: 'var(--sage)',
                    padding: '13px 36px', borderRadius: 100, textDecoration: 'none',
                    transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--sage-light)'; e.currentTarget.style.transform = 'scale(1.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  Enquire →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* ══ ANIMATED LINE 2 ══ */}
      <div style={{ margin: '0 clamp(24px, 5vw, 72px)' }}>
        <AnimatedLine seed={pathname + '-2'} height={90} opacity={0.55} color="#c9a96e" delay={0} duration={2600} />
      </div>

      {/* ══ CTA ══ */}
      <section style={{ padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 72px)', textAlign: 'center' }}>
        <ScrollReveal duration={1200}>
          <h2 style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic',
            color: 'var(--cream)', letterSpacing: '-0.5px', marginBottom: 20,
          }}>
            Not sure where to start?
          </h2>
        </ScrollReveal>
        <ScrollReveal duration={1000} delay={150}>
          <p style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 15, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 40,
          }}>
            Reach out. Everything is confidential from the first message.
          </p>
        </ScrollReveal>
        <ScrollReveal duration={900} delay={250}>
          <Link
            href="/contact"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 13, fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--bg)', background: 'var(--sage)',
              padding: '16px 48px', borderRadius: 100, textDecoration: 'none',
              transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sage-light)'; e.currentTarget.style.transform = 'scale(1.04)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            Work with me →
          </Link>
        </ScrollReveal>
      </section>

      <style>{`
        @media (max-width: 700px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
          }
        }
      `}</style>
    </main>
    </InnerPageShell>
  )
}
