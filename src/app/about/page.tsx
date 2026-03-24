'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ScrollReveal from '@/components/ui/ScrollReveal'
import RevealImage from '@/components/ui/RevealImage'
import AnimatedLine from '@/components/ui/AnimatedLine'
import InnerPageShell from '@/components/layout/InnerPageShell'

const PHILOSOPHY = [
  {
    title: 'Confidentiality first',
    body: 'Every engagement begins and ends in complete confidence. What you share never leaves the room. Privacy is not a feature — it is the foundation.',
    gradient: 'linear-gradient(135deg, #1a2e1c 0%, #0d1210 60%, #0f1a10 100%)',
  },
  {
    title: 'Root cause, not symptom',
    body: 'Surface-level fixes create surface-level results. The work here goes deeper — identifying what is actually driving the patterns that hold you back.',
    gradient: 'linear-gradient(135deg, #1c201a 0%, #0d0f0e 60%, #12181a 100%)',
  },
  {
    title: 'Lasting change',
    body: 'A meaningful shift is more valuable than a dramatic one. Every plan is built for real life — sustainable, personal, and grounded in who you actually are.',
    gradient: 'linear-gradient(135deg, #1e1a14 0%, #0d1210 60%, #181210 100%)',
  },
]

export default function AboutPage() {
  const pathname = usePathname()

  return (
    <InnerPageShell>
    <main style={{ paddingTop: 72, overflow: 'hidden' }}>

      {/* \u2550\u2550 HERO — split layout: text left, portrait right \u2550\u2550 */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 72px)',
        maxWidth: 1200,
        margin:   '0 auto',
        display:  'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(48px, 8vw, 120px)',
        alignItems: 'center',
      }}>
        {/* Left: text */}
        <div>
          <ScrollReveal duration={1000}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--sage)', marginBottom: 28,
            }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--sage)', opacity: 0.5 }} />
              about curtana
            </p>
          </ScrollReveal>

          <ScrollReveal duration={1200} delay={80}>
            <h1 style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(38px, 5.5vw, 76px)',
              fontWeight: 400, fontStyle: 'italic',
              color: 'var(--cream)',
              lineHeight: 1.05, letterSpacing: '-2px',
              marginBottom: 36,
            }}>
              Private. Precise. Transformative.
            </h1>
          </ScrollReveal>

          <ScrollReveal duration={1000} delay={180}>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300,
              color: 'var(--text)', lineHeight: 1.9, marginBottom: 24,
            }}>
              I’m Curtana. I work with individuals and organisations on the problems they
              can’t talk about openly — psychological wellbeing, social confidence,
              and the kind of professional situations that require complete discretion.
            </p>
          </ScrollReveal>

          <ScrollReveal duration={1000} delay={240}>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300,
              color: 'var(--text)', lineHeight: 1.9, marginBottom: 36,
            }}>
              Every engagement is tailored. There is no template, no generic programme.
              Whether you’re navigating a personal challenge or a complex professional
              situation, I meet you exactly where you are — and we build from there.
            </p>
          </ScrollReveal>

          <ScrollReveal duration={900} delay={300}>
            <blockquote style={{
              borderLeft: '2px solid var(--sage)', paddingLeft: 24,
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(18px, 2vw, 24px)', fontStyle: 'italic',
              fontWeight: 300, color: 'var(--sand-light)', lineHeight: 1.5,
            }}>
              &ldquo;Private solutions to personal &amp; professional problems.&rdquo;
            </blockquote>
          </ScrollReveal>
        </div>

        {/* Right: portrait image */}
        <RevealImage
          aspect="4/5"
          delay={300}
          parallax={0.3}
          src="https://images.squarespace-cdn.com/content/v1/695b27224b510b7c2a50e426/46f10a10-d989-4db8-bbb1-c04c9c6c604a/2706.jpg"
          alt="Curtana"
          style={{ borderRadius: 2 }}
        />
      </section>

      {/* \u2550\u2550 ANIMATED LINE \u2550\u2550 */}
      <div style={{ position: 'relative', margin: '0 clamp(24px, 5vw, 72px)' }}>
        <AnimatedLine seed={pathname + '-1'} height={120} opacity={0.75} delay={600} duration={2000} />
      </div>

      {/* \u2550\u2550 PHILOSOPHY — 3 cards \u2550\u2550 */}
      <section style={{
        padding: 'clamp(48px, 8vw, 100px) clamp(24px, 5vw, 72px)',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal duration={1000}>
            <p style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--sage)', marginBottom: 20,
            }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--sage)', opacity: 0.5 }} />
              how I work
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 400,
              color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-1px',
              marginBottom: 'clamp(40px, 6vw, 80px)',
            }}>
              My approach
            </h2>
          </ScrollReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(20px, 3vw, 36px)',
          }}>
            {PHILOSOPHY.map((item, i) => (
              <ScrollReveal key={item.title} duration={1000} delay={i * 140}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <RevealImage
                    aspect="3/2"
                    delay={i * 120}
                    parallax={0.25}
                    gradient={item.gradient}
                  />
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 'clamp(22px, 3vw, 32px)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                      background: 'linear-gradient(90deg, var(--sage), var(--sand))',
                      opacity: 0.5,
                    }} />
                    <p style={{
                      fontFamily: 'var(--font-display), Georgia, serif',
                      fontSize: 40, fontWeight: 300,
                      color: 'var(--sage)', opacity: 0.2, lineHeight: 1, marginBottom: 12,
                    }}>0{i + 1}</p>
                    <h3 style={{
                      fontFamily: 'var(--font-display), Georgia, serif',
                      fontSize: 20, fontWeight: 500,
                      color: 'var(--cream)', marginBottom: 12, lineHeight: 1.2,
                    }}>{item.title}</h3>
                    <p style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: 14, fontWeight: 300,
                      color: 'var(--muted)', lineHeight: 1.85,
                    }}>{item.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* \u2550\u2550 ANIMATED LINE 2 \u2550\u2550 */}
      <div style={{ margin: '0 clamp(24px, 5vw, 72px)' }}>
        <AnimatedLine seed={pathname + '-2'} height={100} opacity={0.55} delay={0} duration={2400} color="#c9a96e" />
      </div>

      {/* \u2550\u2550 FULL-WIDTH BANNER IMAGE \u2550\u2550 */}
      <section style={{ padding: '0 clamp(24px, 5vw, 72px)', marginBottom: 'clamp(60px, 8vw, 100px)' }}>
        <RevealImage
          aspect="21/9"
          delay={0}
          parallax={0.2}
          gradient="linear-gradient(180deg, #1a2e1c 0%, #0d1210 40%, #0a1810 100%)"
          style={{ borderRadius: 4 }}
        />
      </section>

      {/* \u2550\u2550 CTA \u2550\u2550 */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 72px)',
        textAlign: 'center',
      }}>
        <ScrollReveal duration={1200}>
          <h2 style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic',
            color: 'var(--cream)', letterSpacing: '-0.5px', marginBottom: 20,
          }}>
            Ready to begin?
          </h2>
        </ScrollReveal>
        <ScrollReveal duration={1000} delay={150}>
          <p style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 15, fontWeight: 300,
            color: 'var(--muted)', lineHeight: 1.85, marginBottom: 40,
          }}>
            Everything is confidential from the first message.
          </p>
        </ScrollReveal>
        <ScrollReveal duration={900} delay={250}>
          <Link
            href="/contact"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 13, fontWeight: 400,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--bg)', background: 'var(--sage)',
              padding: '16px 48px', borderRadius: 100,
              textDecoration: 'none',
              transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--sage-light)'
              e.currentTarget.style.transform  = 'scale(1.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--sage)'
              e.currentTarget.style.transform  = 'scale(1)'
            }}
          >
            Work with me &rarr;
          </Link>
        </ScrollReveal>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .about-hero-grid { grid-template-columns: 1fr !important; }
          .philosophy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
    </InnerPageShell>
  )
}
