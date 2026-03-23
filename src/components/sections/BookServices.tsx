'use client'

import Link from 'next/link'
import ScrollReveal from '@/components/ui/ScrollReveal'

const SERVICES_BOOK = [
  {
    title: 'Private Flow',
    subtitle: '60 or 90 min',
    desc: 'One-on-one, in-person or virtual.',
  },
  {
    title: 'Collective Breath',
    subtitle: '60 min',
    desc: 'Group class, in-person or virtual.',
  },
  {
    title: 'The Breath Work',
    subtitle: '75 min',
    desc: 'Individual breathwork session.',
  },
  {
    title: 'Return to Stillness',
    subtitle: 'Half or full day',
    desc: 'Immersive wellness retreat.',
  },
  {
    title: 'Workplace Wellness',
    subtitle: 'Flexible',
    desc: 'Yoga & breathwork for teams.',
  },
]

export default function BookServices() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {SERVICES_BOOK.map((s, i) => (
        <ScrollReveal key={s.title} duration={900} delay={i * 80}>
          <a
            href={`https://calendly.com/flowwithcurtana/${s.title.toLowerCase().replace(/ /g, '-')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              padding: 'clamp(20px, 3vw, 28px) clamp(20px, 3vw, 32px)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              textDecoration: 'none',
              transition: 'border-color 400ms ease, background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
              flexWrap: 'wrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border2)'
              e.currentTarget.style.background = 'var(--bg2)'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.transform = 'none'
            }}
          >
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: 'var(--cream)',
                  marginBottom: 4,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'var(--muted)',
                }}
              >
                {s.subtitle} · {s.desc}
              </p>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '13px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--sage)',
                whiteSpace: 'nowrap',
              }}
            >
              Book →
            </span>
          </a>
        </ScrollReveal>
      ))}

      {/* Contact fallback */}
      <ScrollReveal duration={1000} delay={500}>
        <div
          style={{
            marginTop: 36,
            padding: 'clamp(24px, 3vw, 36px)',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '14px',
                fontWeight: 300,
                color: 'var(--text)',
                marginBottom: 4,
              }}
            >
              Have questions before booking?
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--muted)',
              }}
            >
              I'm happy to answer anything.
            </p>
          </div>
          <Link
            href="/contact"
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
              padding: '10px 24px',
              borderRadius: '100px',
              transition: 'color 300ms ease, border-color 300ms ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text)'
              e.currentTarget.style.borderColor = 'var(--border2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            Get in touch →
          </Link>
        </div>
      </ScrollReveal>
    </div>
  )
}
