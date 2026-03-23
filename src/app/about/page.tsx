import ScrollReveal from '@/components/ui/ScrollReveal'
import Link from 'next/link'

export const metadata = {
  title: 'About — Flow With Curtana',
  description:
    'Curtana is a yoga teacher, breathwork guide, and wellness coach. Learn about her practice and approach.',
}

const PHILOSOPHY = [
  {
    title: 'Meet you where you are',
    body: 'No judgment, no comparison. Every body is different and every practice is personal. We start from exactly where you are today.',
  },
  {
    title: 'Breath first, always',
    body: 'The breath is the foundation of everything. When the breath leads, the body follows — safely, naturally, at your own pace.',
  },
  {
    title: 'Integration over intensity',
    body: 'A sustainable practice is more valuable than a dramatic one. We build consistency, awareness, and joy — not just flexibility and strength.',
  },
]

export default function AboutPage() {
  return (
    <main style={{ paddingTop: 72 }}>
      {/* ── PAGE HERO ── */}
      <section
        style={{
          padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px)',
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(48px, 8vw, 100px)',
          alignItems: 'start',
        }}
      >
        <ScrollReveal duration={1200}>
          <div>
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'var(--sage)',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 24,
                  height: 1,
                  background: 'var(--sage)',
                  opacity: 0.6,
                }}
              />
              about curtana
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(40px, 6vw, 76px)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--cream)',
                lineHeight: 1.05,
                letterSpacing: '-2px',
                marginBottom: 32,
              }}
            >
              I believe in the wisdom of the body.
            </h1>

            {/* Decorative line */}
            <div
              style={{
                width: 60,
                height: 2,
                background: 'linear-gradient(90deg, var(--sage), transparent)',
              }}
            />
          </div>
        </ScrollReveal>

        {/* Bio */}
        <ScrollReveal duration={1100} delay={150}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              paddingTop: 'clamp(0px, 4vw, 48px)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '16px',
                fontWeight: 300,
                color: 'var(--text)',
                lineHeight: 1.9,
              }}
            >
              My name is Curtana. I've been moving, breathing, and teaching for many years. But before I was a teacher, I was a student — someone who found yoga when I needed it most and never looked back.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '16px',
                fontWeight: 300,
                color: 'var(--text)',
                lineHeight: 1.9,
              }}
            >
              My approach blends the structure of traditional yoga with the freedom of intuitive movement. Whether you're new to practice or deepening an existing one, I meet you exactly where you are.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '16px',
                fontWeight: 300,
                color: 'var(--text)',
                lineHeight: 1.9,
              }}
            >
              I teach because transformation is real. I've seen it — in my own body and in the bodies of hundreds of students. Movement isn't just physical. It's how we process, release, and become.
            </p>

            {/* Pull quote */}
            <blockquote
              style={{
                borderLeft: '2px solid var(--sage)',
                paddingLeft: 24,
                marginTop: 12,
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(20px, 2.5vw, 26px)',
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'var(--sand-light)',
                lineHeight: 1.5,
              }}
            >
              "Your body already knows the way. I'm just here to help you listen."
            </blockquote>
          </div>
        </ScrollReveal>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section
        style={{
          padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px)',
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <ScrollReveal duration={1000}>
            <div style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}>
              <p
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'var(--sage)',
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 24,
                    height: 1,
                    background: 'var(--sage)',
                    opacity: 0.6,
                  }}
                />
                how I work
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(32px, 4vw, 56px)',
                  fontWeight: 400,
                  color: 'var(--cream)',
                  lineHeight: 1.1,
                  letterSpacing: '-1px',
                }}
              >
                My approach
              </h2>
            </div>
          </ScrollReveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'clamp(16px, 3vw, 28px)',
            }}
          >
            {PHILOSOPHY.map((item, i) => (
              <ScrollReveal key={item.title} duration={1000} delay={i * 120}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: 'clamp(28px, 4vw, 40px)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'linear-gradient(90deg, var(--sage), var(--sand))',
                      opacity: 0.6,
                    }}
                  />

                  {/* Number */}
                  <p
                    style={{
                      fontFamily: 'var(--font-display), Georgia, serif',
                      fontSize: '48px',
                      fontWeight: 300,
                      color: 'var(--sage)',
                      opacity: 0.2,
                      lineHeight: 1,
                      marginBottom: 16,
                    }}
                  >
                    0{i + 1}
                  </p>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display), Georgia, serif',
                      fontSize: '22px',
                      fontWeight: 500,
                      color: 'var(--cream)',
                      marginBottom: 16,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: '14px',
                      fontWeight: 300,
                      color: 'var(--muted)',
                      lineHeight: 1.85,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 60px)',
          textAlign: 'center',
        }}
      >
        <ScrollReveal duration={1200}>
          <h2
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--cream)',
              letterSpacing: '-0.5px',
              marginBottom: 20,
            }}
          >
            Ready to begin?
          </h2>
        </ScrollReveal>
        <ScrollReveal duration={1000} delay={150}>
          <p
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '15px',
              fontWeight: 300,
              color: 'var(--muted)',
              lineHeight: 1.85,
              marginBottom: 40,
            }}
          >
            Sessions available online and in-person.
          </p>
        </ScrollReveal>
        <ScrollReveal duration={900} delay={250}>
          <Link
            href="/book"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--bg)',
              background: 'var(--sage)',
              padding: '16px 44px',
              borderRadius: '100px',
              textDecoration: 'none',
            }}
          >
            Book a session →
          </Link>
        </ScrollReveal>
      </section>
    </main>
  )
}
