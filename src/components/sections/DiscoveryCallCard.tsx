'use client'

import ScrollReveal from '@/components/ui/ScrollReveal'

export default function DiscoveryCallCard() {
  return (
    <ScrollReveal duration={1100} delay={100}>
      <div
        style={{
          padding: 'clamp(40px, 5vw, 64px)',
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
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
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(ellipse, rgba(127,168,130,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Top gradient line */}
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
            position: 'relative',
          }}
        >
          not sure where to start?
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--cream)',
            maxWidth: 500,
            lineHeight: 1.2,
            position: 'relative',
          }}
        >
          Book a free 15-minute call.
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '15px',
            fontWeight: 300,
            color: 'var(--muted)',
            lineHeight: 1.85,
            maxWidth: 460,
            position: 'relative',
          }}
        >
          We'll talk about where you are and what kind of practice would serve you best. No commitment, no pressure.
        </p>

        <a
          href="https://calendly.com/flowwithcurtana/discovery"
          target="_blank"
          rel="noopener noreferrer"
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
            transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
            position: 'relative',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--sage-light)'
            e.currentTarget.style.transform = 'scale(1.03)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--sage)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Book a free call →
        </a>
      </div>
    </ScrollReveal>
  )
}
