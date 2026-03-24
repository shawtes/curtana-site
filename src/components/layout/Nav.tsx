'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMagnetic } from '@/hooks/useMagnetic'

const BREATH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const bookRef = useMagnetic(0.25, 70) as React.RefObject<HTMLAnchorElement>

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 clamp(20px, 5vw, 60px)',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 600ms cubic-bezier(0.16,1,0.3,1), border-color 600ms ease, backdrop-filter 600ms ease',
          background: scrolled ? 'rgba(13, 15, 14, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: '18px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--cream)',
            textDecoration: 'none',
            letterSpacing: '0.01em',
            transition: 'color 300ms ease',
          }}
        >
          Flow With Curtana
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
          }}
          className="hidden-mobile"
        >
          <ul
            style={{
              display: 'flex',
              gap: 36,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: pathname === link.href ? 'var(--sage-light)' : 'var(--muted)',
                    textDecoration: 'none',
                    transition: 'color 300ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = pathname === link.href ? 'var(--sage-light)' : 'var(--muted)')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            ref={bookRef}
            href="/contact"
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--bg)',
              background: 'var(--sage)',
              padding: '10px 24px',
              borderRadius: '100px',
              textDecoration: 'none',
              transition: 'background 300ms ease, box-shadow 300ms ease',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--sage-light)'
              e.currentTarget.style.boxShadow = '0 8px 30px var(--sage-glow)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--sage)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Work with me
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="show-mobile"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'none',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            alignItems: 'flex-end',
          }}
        >
          <span
            style={{
              display: 'block',
              width: 24,
              height: 1.5,
              background: 'var(--text)',
              borderRadius: 2,
              transformOrigin: 'right center',
              transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease',
              transform: menuOpen ? 'rotate(-45deg) translateY(3px)' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              width: menuOpen ? 0 : 18,
              height: 1.5,
              background: 'var(--text)',
              borderRadius: 2,
              transition: 'width 300ms ease, opacity 300ms ease',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: 'block',
              width: 24,
              height: 1.5,
              background: 'var(--text)',
              borderRadius: 2,
              transformOrigin: 'right center',
              transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
              transform: menuOpen ? 'rotate(45deg) translateY(-3px)' : 'none',
            }}
          />
        </button>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: BREATH_EASE }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(320px, 100vw)',
              background: 'var(--bg2)',
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '40px 48px',
              borderLeft: '1px solid var(--border)',
            }}
          >
            <nav>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: BREATH_EASE }}
                    style={{ marginBottom: 32 }}
                  >
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontSize: '32px',
                        fontWeight: 300,
                        fontStyle: 'italic',
                        color: pathname === link.href ? 'var(--sage-light)' : 'var(--cream)',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: BREATH_EASE }}
                  style={{ marginTop: 48 }}
                >
                  <Link
                    href="/contact"
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: '13px',
                      fontWeight: 400,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: 'var(--bg)',
                      background: 'var(--sage)',
                      padding: '14px 32px',
                      borderRadius: '100px',
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    Work with me
                  </Link>
                </motion.li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 98,
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}
