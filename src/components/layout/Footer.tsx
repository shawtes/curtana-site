'use client'

import Link from 'next/link'

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
  { href: '/book', label: 'Book' },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px) 32px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          paddingBottom: 48,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Brand */}
        <div>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '22px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--cream)',
              textDecoration: 'none',
              display: 'block',
              marginBottom: 12,
            }}
          >
            Flow With Curtana
          </Link>
          <p
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '15px',
              fontStyle: 'italic',
              color: 'var(--muted)',
              lineHeight: 1.7,
              maxWidth: 240,
            }}
          >
            Flow with intention.<br />Breathe with purpose.
          </p>
        </div>

        {/* Nav */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 20,
            }}
          >
            Navigate
          </p>
          <nav>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: '14px',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                      transition: 'color 300ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Social */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 20,
            }}
          >
            Follow along
          </p>
          <a
            href="https://instagram.com/flowwithcurtana"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '14px',
              color: 'var(--sage-light)',
              textDecoration: 'none',
              transition: 'color 300ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--sage-light)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            @flowwithcurtana
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          paddingTop: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '12px',
            color: 'var(--dim)',
            letterSpacing: '0.5px',
          }}
        >
          © 2026 Flow With Curtana. All rights reserved.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '12px',
            color: 'var(--dim)',
          }}
        >
          flowwithcurtana.com
        </p>
      </div>
    </footer>
  )
}
