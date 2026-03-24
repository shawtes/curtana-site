'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePathname } from 'next/navigation'
import ScrollReveal from '@/components/ui/ScrollReveal'
import RevealImage from '@/components/ui/RevealImage'
import AnimatedLine from '@/components/ui/AnimatedLine'
import InnerPageShell from '@/components/layout/InnerPageShell'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  inquiries: string[]
}

const INQUIRY_TYPES = [
  { value: 'services',         label: 'Services' },
  { value: 'corporate-events', label: 'Corporate events' },
  { value: 'group-events',     label: 'Group events' },
  { value: 'press',            label: 'Press opportunity' },
]

const labelStyle = {
  display: 'block' as const,
  fontFamily: 'var(--font-body), sans-serif',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '14px 18px',
  fontFamily: 'var(--font-body), sans-serif',
  fontSize: '15px',
  fontWeight: 300,
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 300ms ease, box-shadow 300ms ease',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  boxSizing: 'border-box' as const,
}

export default function ContactPage() {
  const pathname = usePathname()
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [checked, setChecked] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log('Form submitted:', { ...data, inquiries: checked })
    setSubmitted(true)
    reset()
    setChecked([])
  }

  const getFocusStyle = (name: string) =>
    focused === name
      ? { borderColor: 'var(--sage)', boxShadow: '0 0 0 3px var(--sage-glow)' }
      : {}

  const getErrorStyle = (hasError: boolean) =>
    hasError ? { borderColor: 'rgba(201,169,110,0.6)' } : {}

  const toggleInquiry = (val: string) =>
    setChecked(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

  if (submitted) {
    return (
      <main style={{ paddingTop: 72 }}>
        <section style={{
          minHeight: '70vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px)',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--sage-glow)', border: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic',
              color: 'var(--cream)', letterSpacing: '-1px', marginBottom: 16,
            }}>
              Message sent.
            </h1>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '15px', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 40,
            }}>
              Thank you for reaching out. I respond to all enquiries within 48 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--muted)', background: 'none',
                border: '1px solid var(--border)', padding: '12px 28px',
                borderRadius: '100px', cursor: 'none',
                transition: 'border-color 300ms ease, color 300ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              Send another
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <InnerPageShell>
    <main style={{ paddingTop: 72, overflow: 'hidden' }}>

      {/* ══ HERO ══ */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 72px) 0',
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(40px, 6vw, 100px)', alignItems: 'end',
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
              get in touch
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
              Let's flow together.
            </h1>
          </ScrollReveal>
          <ScrollReveal duration={1000} delay={180}>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300,
              color: 'var(--muted)', lineHeight: 1.85, marginBottom: 40,
              maxWidth: 420,
            }}>
              For inquiries about coaching, events or press opportunities, please feel free to reach out here.
            </p>
          </ScrollReveal>
          <ScrollReveal duration={900} delay={260}>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '13px', fontWeight: 300,
              color: 'var(--dim)', lineHeight: 1.7,
            }}>
              Everything is confidential from the first message.
            </p>
          </ScrollReveal>
        </div>

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
        <AnimatedLine seed={pathname + '-contact-1'} height={130} opacity={0.16} delay={500} duration={2200} />
      </div>

      {/* ══ FORM SECTION ══ */}
      <section style={{
        padding: 'clamp(40px, 6vw, 80px) clamp(24px, 5vw, 72px) clamp(80px, 12vw, 140px)',
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 2fr',
        gap: 'clamp(48px, 8vw, 120px)', alignItems: 'start',
      }}>
        {/* Left: contact info */}
        <div>
          <ScrollReveal duration={1000}>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--sage)', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--sage)', opacity: 0.5 }} />
              reach out
            </p>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '14px', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 32,
            }}>
              I respond to all enquiries within 48 hours.
            </p>
            <a
              href="https://instagram.com/flowwithcurtana"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '14px', color: 'var(--sage)', textDecoration: 'none',
                transition: 'color 300ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--sage-light)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--sage)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              @flowwithcurtana
            </a>
          </ScrollReveal>
        </div>

        {/* Right: Form */}
        <ScrollReveal duration={1100} delay={150}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* First + Last name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label htmlFor="firstName" style={labelStyle}>First Name</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First"
                  {...register('firstName', { required: 'Required' })}
                  style={{ ...inputStyle, ...getFocusStyle('firstName'), ...getErrorStyle(!!errors.firstName) }}
                  onFocus={() => setFocused('firstName')}
                  onBlur={() => setFocused(null)}
                />
                {errors.firstName && (
                  <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" style={labelStyle}>Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last"
                  {...register('lastName', { required: 'Required' })}
                  style={{ ...inputStyle, ...getFocusStyle('lastName'), ...getErrorStyle(!!errors.lastName) }}
                  onFocus={() => setFocused('lastName')}
                  onBlur={() => setFocused(null)}
                />
                {errors.lastName && (
                  <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
                })}
                style={{ ...inputStyle, ...getFocusStyle('email'), ...getErrorStyle(!!errors.email) }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
              {errors.email && (
                <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" style={labelStyle}>Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="What's on your mind?"
                {...register('subject')}
                style={{ ...inputStyle, ...getFocusStyle('subject') }}
                onFocus={() => setFocused('subject')}
                onBlur={() => setFocused(null)}
              />
            </div>

            {/* Inquiry type checkboxes */}
            <div>
              <p style={{ ...labelStyle, marginBottom: 16 }}>Inquiry type</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px' }}>
                {INQUIRY_TYPES.map(type => {
                  const isChecked = checked.includes(type.value)
                  return (
                    <label
                      key={type.value}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        cursor: 'none',
                        fontFamily: 'var(--font-body), sans-serif',
                        fontSize: '14px', fontWeight: 300,
                        color: isChecked ? 'var(--text)' : 'var(--muted)',
                        transition: 'color 250ms ease',
                      }}
                    >
                      <span
                        onClick={() => toggleInquiry(type.value)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: `1px solid ${isChecked ? 'var(--sage)' : 'var(--border)'}`,
                          background: isChecked ? 'var(--sage-glow)' : 'transparent',
                          transition: 'border-color 250ms ease, background 250ms ease',
                        }}
                      >
                        {isChecked && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                        )}
                      </span>
                      <span onClick={() => toggleInquiry(type.value)}>{type.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" style={labelStyle}>Message</label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell me a little about yourself and what brings you here..."
                {...register('message', { required: 'A message is required' })}
                style={{
                  ...inputStyle,
                  ...getFocusStyle('message'),
                  ...getErrorStyle(!!errors.message),
                  resize: 'vertical', minHeight: 120,
                }}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
              />
              {errors.message && (
                <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '13px', fontWeight: 400,
                letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--bg)', background: isSubmitting ? 'var(--muted)' : 'var(--sage)',
                padding: '16px 44px', borderRadius: '100px',
                border: 'none', cursor: 'none',
                transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
                alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseEnter={e => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'var(--sage-light)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isSubmitting ? 'var(--muted)' : 'var(--sage)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send message →'}
            </button>
          </form>
        </ScrollReveal>
      </section>

      {/* ══ ANIMATED LINE 2 ══ */}
      <div style={{ margin: '0 clamp(24px, 5vw, 72px)' }}>
        <AnimatedLine seed={pathname + '-contact-2'} height={90} opacity={0.12} color="#c9a96e" delay={0} duration={2600} />
      </div>

      <style>{`
        input::placeholder, textarea::placeholder {
          color: var(--dim);
          font-family: var(--font-body), sans-serif;
        }
        @media (max-width: 700px) {
          section[style*="grid-template-columns: 1fr 2fr"] {
            grid-template-columns: 1fr !important;
          }
          section[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
    </InnerPageShell>
  )
}
