'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface ContactFormData {
  name: string
  email: string
  service: string
  message: string
}

const SERVICES = [
  { value: '', label: 'Select a service (optional)' },
  { value: 'private-flow', label: 'Private Flow' },
  { value: 'collective-breath', label: 'Collective Breath' },
  { value: 'breath-work', label: 'The Breath Work' },
  { value: 'return-to-stillness', label: 'Return to Stillness' },
  { value: 'workplace-wellness', label: 'Workplace Wellness' },
  { value: 'other', label: 'Other' },
]

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
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    // Simulate async submission
    await new Promise(resolve => setTimeout(resolve, 800))
    console.log('Form submitted:', data)
    setSubmitted(true)
    reset()
  }

  const getFocusStyle = (name: string) =>
    focused === name
      ? { borderColor: 'var(--sage)', boxShadow: '0 0 0 3px var(--sage-glow)' }
      : {}

  const getErrorStyle = (hasError: boolean) =>
    hasError ? { borderColor: 'rgba(201,169,110,0.6)' } : {}

  if (submitted) {
    return (
      <main style={{ paddingTop: 72 }}>
        <section
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--sage-glow)',
                border: '1px solid var(--border2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--cream)',
                letterSpacing: '-1px',
                marginBottom: 16,
              }}
            >
              Message sent.
            </h1>
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
              Thank you for reaching out. I respond to all enquiries within 48 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: '13px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                background: 'none',
                border: '1px solid var(--border)',
                padding: '12px 28px',
                borderRadius: '100px',
                cursor: 'none',
                transition: 'border-color 300ms ease, color 300ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border2)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              Send another
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={{ paddingTop: 72 }}>
      {/* ── HEADER ── */}
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
        {/* Left */}
        <div>
          <ScrollReveal duration={1000}>
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
              get in touch
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
              Let's connect.
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
                marginBottom: 48,
                maxWidth: 400,
              }}
            >
              Questions about services, retreats, or corporate wellness? I'd love to hear from you.
            </p>
          </ScrollReveal>

          <ScrollReveal duration={1000} delay={300}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'var(--muted)',
                  lineHeight: 1.7,
                }}
              >
                I respond to all enquiries within 48 hours.
              </p>
              <a
                href="https://instagram.com/flowwithcurtana"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '14px',
                  color: 'var(--sage)',
                  textDecoration: 'none',
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
            </div>
          </ScrollReveal>
        </div>

        {/* Right: Form */}
        <ScrollReveal duration={1100} delay={150}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 8,
                }}
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                {...register('name', { required: 'Name is required' })}
                style={{
                  ...inputStyle,
                  ...getFocusStyle('name'),
                  ...getErrorStyle(!!errors.name),
                }}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
              />
              {errors.name && (
                <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
                })}
                style={{
                  ...inputStyle,
                  ...getFocusStyle('email'),
                  ...getErrorStyle(!!errors.email),
                }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
              {errors.email && (
                <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Service */}
            <div>
              <label
                htmlFor="service"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 8,
                }}
              >
                Service
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="service"
                  {...register('service')}
                  style={{
                    ...inputStyle,
                    ...getFocusStyle('service'),
                    cursor: 'none',
                  }}
                  onFocus={() => setFocused('service')}
                  onBlur={() => setFocused(null)}
                >
                  {SERVICES.map(s => (
                    <option key={s.value} value={s.value} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--muted)',
                  }}
                >
                  ↓
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 8,
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell me a little about yourself and what brings you here..."
                {...register('message', { required: 'A message is required' })}
                style={{
                  ...inputStyle,
                  ...getFocusStyle('message'),
                  ...getErrorStyle(!!errors.message),
                  resize: 'vertical',
                  minHeight: 120,
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
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--bg)',
                background: isSubmitting ? 'var(--muted)' : 'var(--sage)',
                padding: '16px 44px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'none',
                transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
                alignSelf: 'flex-start',
                opacity: isSubmitting ? 0.7 : 1,
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

      <style>{`
        input::placeholder, textarea::placeholder {
          color: var(--dim);
          font-family: var(--font-body), sans-serif;
        }
        select option {
          background: #1c211d;
          color: #e8ede9;
        }
      `}</style>
    </main>
  )
}
