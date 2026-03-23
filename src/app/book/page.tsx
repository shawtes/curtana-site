import ScrollReveal from '@/components/ui/ScrollReveal'
import DiscoveryCallCard from '@/components/sections/DiscoveryCallCard'
import BookServices from '@/components/sections/BookServices'

export const metadata = {
  title: 'Book — Flow With Curtana',
  description:
    'Book a private yoga session, breathwork appointment, or free discovery call with Curtana.',
}

export default function BookPage() {
  return (
    <main style={{ paddingTop: 72 }}>
      {/* ── HEADER ── */}
      <section
        style={{
          padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px) clamp(40px, 5vw, 60px)',
          textAlign: 'center',
          maxWidth: 700,
          margin: '0 auto',
        }}
      >
        <ScrollReveal duration={1000}>
          <p
            style={{
              display: 'inline-flex',
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
            book a session
          </p>
        </ScrollReveal>

        <ScrollReveal duration={1200} delay={100}>
          <h1
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--cream)',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              marginBottom: 24,
            }}
          >
            Your practice starts here.
          </h1>
        </ScrollReveal>

        <ScrollReveal duration={1000} delay={200}>
          <p
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '16px',
              fontWeight: 300,
              color: 'var(--muted)',
              lineHeight: 1.85,
            }}
          >
            Choose a service below and pick a time that works for you. First time? A free 15-minute discovery call is a great place to start.
          </p>
        </ScrollReveal>
      </section>

      {/* ── DISCOVERY CALL ── */}
      <section
        style={{
          padding: '0 clamp(20px, 5vw, 60px)',
          maxWidth: 900,
          margin: '0 auto clamp(60px, 8vw, 100px)',
        }}
      >
        <DiscoveryCallCard />
      </section>

      {/* ── SERVICES LIST ── */}
      <section
        style={{
          padding: '0 clamp(20px, 5vw, 60px) clamp(80px, 12vw, 140px)',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <ScrollReveal duration={1000}>
          <h2
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 400,
              color: 'var(--cream)',
              marginBottom: 'clamp(32px, 4vw, 48px)',
              letterSpacing: '-0.5px',
            }}
          >
            Choose your session
          </h2>
        </ScrollReveal>

        <BookServices />
      </section>
    </main>
  )
}
