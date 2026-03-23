import ScrollReveal from '@/components/ui/ScrollReveal'
import ServiceCard from '@/components/sections/ServiceCard'
import Link from 'next/link'

export const metadata = {
  title: 'Services — Flow With Curtana',
  description:
    'Yoga, breathwork, retreats, and corporate wellness. Practices for every body — online and in-person.',
}

const SERVICES = [
  {
    tag: 'one on one',
    title: 'Private Flow',
    subtitle: 'Your practice, your pace.',
    duration: '60 or 90 min · in-person or virtual',
    description:
      'One-on-one sessions built entirely around you. We\'ll begin with a conversation, then move into a practice designed for your body, your goals, and how you\'re feeling today. Private sessions are ideal for beginners who want personal attention, experienced practitioners who want to deepen their practice, or anyone recovering from injury.',
    includes: [
      'Personalized movement sequence',
      'Breathwork integration',
      'Meditation guidance',
      'Follow-up practice recommendations',
    ],
    delay: 0,
  },
  {
    tag: 'group',
    title: 'Collective Breath',
    subtitle: 'Move together. Breathe together.',
    duration: '60 min · in-person or virtual',
    description:
      'There\'s something powerful about breathing in sync with others. Group classes offer a shared experience of movement, breath, and community — welcoming to all levels.',
    includes: [],
    delay: 100,
  },
  {
    tag: 'breathwork',
    title: 'The Breath Work',
    subtitle: 'Where transformation begins.',
    duration: '75 min · in-person or virtual',
    description:
      'Breathwork is one of the most powerful tools for nervous system regulation, emotional release, and mental clarity. Sessions blend guided breathing techniques with grounding movement to leave you feeling reset and whole. No experience necessary.',
    includes: [],
    delay: 200,
  },
  {
    tag: 'retreat',
    title: 'Return to Stillness',
    subtitle: 'A day to come back to yourself.',
    duration: 'Half-day or full-day · in-person',
    description:
      'Immersive wellness retreats that create space for deep rest, reflection, and renewal. Each retreat is a carefully curated journey through movement, breath, stillness, and nourishment.',
    includes: [],
    delay: 300,
  },
  {
    tag: 'corporate',
    title: 'Workplace Wellness',
    subtitle: 'Bring wellbeing to your team.',
    duration: 'Flexible 45 min to full day · in-person',
    description:
      'Yoga and breathwork for teams. Whether it\'s a lunchtime session or a full wellness day, I work with companies to create experiences that reduce burnout, improve focus, and build team connection.',
    includes: [],
    delay: 400,
  },
]

export default function ServicesPage() {
  return (
    <main style={{ paddingTop: 72 }}>
      {/* ── PAGE HEADER ── */}
      <section
        style={{
          padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px) clamp(40px, 5vw, 60px)',
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
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
            what I offer
          </p>
        </ScrollReveal>

        <ScrollReveal duration={1200} delay={100}>
          <h1
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(40px, 6vw, 76px)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--cream)',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              marginBottom: 24,
            }}
          >
            Practices for every body.
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
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            Whether you're new to yoga or deepening an existing practice, there's a session that meets you where you are.
          </p>
        </ScrollReveal>
      </section>

      {/* ── SERVICE CARDS ── */}
      <section
        style={{
          padding: '0 clamp(20px, 5vw, 60px) clamp(80px, 12vw, 140px)',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(16px, 2vw, 24px)',
          }}
        >
          {SERVICES.map(service => (
            <ServiceCard
              key={service.title}
              tag={service.tag}
              title={service.title}
              subtitle={service.subtitle}
              duration={service.duration}
              description={service.description}
              delay={service.delay}
              href="/book"
            />
          ))}
        </div>

        {/* Not sure section */}
        <ScrollReveal duration={1000} delay={200}>
          <div
            style={{
              marginTop: 'clamp(60px, 8vw, 100px)',
              padding: 'clamp(40px, 5vw, 64px)',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 20,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent, var(--sage), transparent)',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'var(--sage)',
              }}
            >
              not sure where to start?
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(28px, 3vw, 40px)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--cream)',
                maxWidth: 500,
                lineHeight: 1.2,
              }}
            >
              Book a free discovery call.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '15px',
                fontWeight: 300,
                color: 'var(--muted)',
                lineHeight: 1.85,
                maxWidth: 480,
              }}
            >
              15 minutes. We'll talk about where you are and what kind of practice would serve you best. No commitment.
            </p>
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
                padding: '14px 36px',
                borderRadius: '100px',
                textDecoration: 'none',
              }}
            >
              Book a free call →
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  )
}
