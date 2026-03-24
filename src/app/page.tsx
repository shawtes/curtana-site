'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import ScrollReveal from '@/components/ui/ScrollReveal'
import RevealImage from '@/components/ui/RevealImage'
import VerticalThreadLine from '@/components/ui/VerticalThreadLine'
import SplitHeading from '@/components/ui/SplitHeading'
import LoadingScreen from '@/components/ui/LoadingScreen'
import AmbientAudioProvider from '@/components/ui/AmbientAudioProvider'

// Materialize-in animation for sections that appear in front of the character
const sectionVariants = {
  hidden: {
    opacity:   0,
    y:         28,
    boxShadow: '0 0 80px rgba(127,168,130,0.18), inset 0 1px 0 rgba(127,168,130,0.25)',
  },
  visible: {
    opacity:   1,
    y:         0,
    boxShadow: '0 0 0px rgba(127,168,130,0), inset 0 1px 0 rgba(127,168,130,0.06)',
  },
}
const sectionTransition = { duration: 1.3, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }

const SubmersionJourney = dynamic(() => import('@/components/3d/SubmersionJourney'), {
  ssr:     false,
  loading: () => (
    <div style={{ height: '480vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', background: 'var(--bg)' }} />
    </div>
  ),
})

// ── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    tag: 'psychological health',
    title: 'Psychological Health',
    subtitle: 'Less suffering. More happiness.',
    duration: '1:1 sessions \u00b7 in-person or virtual',
    description:
      'Experience less suffering and more happiness through psychological exercise and nutrition programs. Curtana works with you to identify the root causes of your pain points and build a personalised plan for lasting change.',
    includes: [
      'Personalised psychological assessment',
      'Exercise & nutrition integration',
      'Weekly 1:1 sessions',
      'Between-session support',
    ],
    gradient: 'linear-gradient(135deg, #1a2e1c 0%, #0d1210 60%, #0a1510 100%)',
    // Person in stillness, low light, forest — matches psychological depth
    src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    alt: 'Person in quiet contemplation by water',
  },
  {
    tag: 'social skills',
    title: 'Social Skills',
    subtitle: 'Confidence in every room.',
    duration: '1:1 or group \u00b7 in-person or virtual',
    description:
      'Improve confidence and communication skills in romantic and platonic relationships. Through ethical influence techniques and immersive social practice, you’ll move through the world with ease, warmth, and genuine presence.',
    includes: [
      'Confidence & communication frameworks',
      'Ethical flirting & attraction dynamics',
      'Real-world social practice',
      'Ongoing coaching & feedback',
    ],
    gradient: 'linear-gradient(135deg, #1c201a 0%, #0d0f0e 55%, #101a14 100%)',
    // Two people, warm candlelit conversation — intimacy and connection
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    alt: 'Two people in warm intimate conversation',
  },
  {
    tag: 'professional referrals',
    title: 'Professional Referrals',
    subtitle: 'The right expert. Every time.',
    duration: 'Consultation \u00b7 confidential',
    description:
      'Private solutions to professional problems through a curated network of trusted specialists across industries. Whether legal, financial, medical, or creative — Curtana connects you with exactly the right person, quietly and efficiently.',
    includes: [
      'Discreet needs assessment',
      'Curated specialist matching',
      'Warm introduction & context briefing',
      'Follow-through support',
    ],
    gradient: 'linear-gradient(135deg, #12181a 0%, #0d0f0e 55%, #0a1214 100%)',
    // Minimal, clean interior — discretion and precision
    src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    alt: 'Minimal clean professional interior',
  },
  {
    tag: 'corporate',
    title: 'Corporate Events',
    subtitle: 'Bring clarity to your team.',
    duration: 'Half-day or full-day \u00b7 in-person',
    description:
      'Workshops and immersive experiences for teams — from communication and conflict resolution to group psychological health sessions. Curtana works with leadership to create bespoke programmes that actually move the needle.',
    includes: [],
    gradient: 'linear-gradient(135deg, #1e1a14 0%, #0d1210 55%, #181210 100%)',
    // People gathered in purposeful session, warm overhead light
    src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80',
    alt: 'People engaged in a workshop session',
  },
  {
    tag: 'press',
    title: 'Press & Speaking',
    subtitle: 'Thoughtful. On-brand. Memorable.',
    duration: 'Flexible \u00b7 in-person or virtual',
    description:
      'For press enquiries, podcast appearances, panel discussions, and keynote opportunities. Curtana speaks on psychological health, social intelligence, and the private landscape of personal transformation.',
    includes: [],
    gradient: 'linear-gradient(135deg, #1a1e1c 0%, #0d1210 55%, #101810 100%)',
    // Speaker commanding a room, dramatic stage light
    src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80',
    alt: 'Speaker on stage under dramatic light',
  },
]

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

interface ContactFormData {
  firstName: string
  lastName:  string
  email:     string
  subject:   string
  message:   string
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [loaderDone, setLoaderDone] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [focused,   setFocused]     = useState<string | null>(null)
  const [checked,   setChecked]     = useState<string[]>([])

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    await new Promise(r => setTimeout(r, 800))
    console.log('Form submitted:', { ...data, inquiries: checked })
    setSubmitted(true)
    reset()
    setChecked([])
  }

  const getFocusStyle  = (name: string) =>
    focused === name ? { borderColor: 'var(--sage)', boxShadow: '0 0 0 3px var(--sage-glow)' } : {}
  const getErrorStyle  = (has: boolean) =>
    has ? { borderColor: 'rgba(201,169,110,0.6)' } : {}
  const toggleInquiry  = (val: string) =>
    setChecked(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

  return (
    <>
    {!loaderDone && <LoadingScreen onComplete={() => setLoaderDone(true)} />}
    <AmbientAudioProvider />
    <main style={{ position: 'relative', zIndex: 1 }}>

      {/* ══ 3D HERO ══ */}
      <SubmersionJourney />

      {/* ══ CONTENT — relative wrapper so VerticalThreadLine can span all sections ══ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <VerticalThreadLine />

      {/* ══════════════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        transition={sectionTransition}
        style={{ background: 'rgba(13,15,14,0.72)', position: 'relative', zIndex: 4 }}
      >
      <section id="about" style={{
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 5vw, 72px)',
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(48px, 8vw, 120px)', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', zIndex: 5 }}>
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

          <SplitHeading
            delay={80}
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(38px, 5vw, 70px)',
              fontWeight: 400, fontStyle: 'italic',
              color: 'var(--cream)', lineHeight: 1.05,
              letterSpacing: '-2px', marginBottom: 32,
            }}
          >
            Private. Precise. Transformative.
          </SplitHeading>

          <ScrollReveal duration={1000} delay={180}>
            <p style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300,
              color: 'var(--text)', lineHeight: 1.9, marginBottom: 22,
            }}>
              I’m Curtana. I work with individuals and organisations on the problems
              they can’t talk about openly — psychological wellbeing, social
              confidence, and professional situations that require complete discretion.
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
              fontSize: 'clamp(17px, 2vw, 22px)', fontStyle: 'italic',
              fontWeight: 300, color: 'var(--sand-light)', lineHeight: 1.5,
            }}>
              &ldquo;Private solutions to personal &amp; professional problems.&rdquo;
            </blockquote>
          </ScrollReveal>
        </div>

        <RevealImage
          aspect="4/5"
          delay={200}
          parallax={0.3}
          src="https://images.squarespace-cdn.com/content/v1/695b27224b510b7c2a50e426/46f10a10-d989-4db8-bbb1-c04c9c6c604a/2706.jpg"
          alt="Curtana"
          style={{ borderRadius: 2 }}
        />
      </section>
      </motion.div>{/* /about */}


      {/* ══════════════════════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ ...sectionTransition, delay: 0.05 }}
        style={{ background: 'rgba(13,15,14,0.72)', position: 'relative', zIndex: 4 }}
      >
      <section id="services" style={{
        padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 72px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <ScrollReveal duration={1000}>
          <p style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
            color: 'var(--sage)', marginBottom: 20,
            position: 'relative', zIndex: 5,
          }}>
            <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--sage)', opacity: 0.5 }} />
            what I offer
          </p>
        </ScrollReveal>
        <SplitHeading style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(38px, 5.5vw, 76px)',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--cream)', lineHeight: 1.05,
          letterSpacing: '-2px', marginBottom: 'clamp(60px, 8vw, 100px)',
          position: 'relative', zIndex: 5,
        }}>
          Private solutions to personal & professional problems.
        </SplitHeading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(60px, 10vw, 120px)' }}>
          {SERVICES.map((service, i) => (
            <div key={service.title}>
            <ScrollReveal duration={1100} delay={0}>
              <div>
              <div className="service-row" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(32px, 5vw, 80px)',
                alignItems: 'center',
                direction: i % 2 === 0 ? 'ltr' : 'rtl',
              }}>
                <div style={{ direction: 'ltr' }}>
                  <RevealImage
                    aspect="4/3"
                    delay={i * 60}
                    parallax={0.28}
                    gradient={service.gradient}
                    src={service.src}
                    alt={service.alt}
                  />
                </div>

                <div style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 5 }}>
                  <p style={{
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
                    color: 'var(--sage)',
                  }}>{service.tag}</p>

                  <SplitHeading as="h3" delay={i * 40} style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 'clamp(26px, 3vw, 42px)',
                    fontWeight: 400, fontStyle: 'italic',
                    color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.5px',
                  }}>{service.title}</SplitHeading>

                  <p style={{
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: '11px', letterSpacing: '1.5px',
                    color: 'var(--muted)',
                  }}>{service.duration}</p>

                  <p style={{
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 300,
                    color: 'var(--text)', lineHeight: 1.85,
                  }}>{service.description}</p>

                  {service.includes.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {service.includes.map(item => (
                        <li key={item} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          fontFamily: 'var(--font-body), sans-serif',
                          fontSize: 13, fontWeight: 300, color: 'var(--muted)',
                        }}>
                          <span style={{ width: 16, height: 1, background: 'var(--sage)', opacity: 0.6, flexShrink: 0 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              </div>
            </ScrollReveal>
            </div>
          ))}
        </div>
      </section>
      </motion.div>{/* /services */}


      {/* ══════════════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ ...sectionTransition, delay: 0.05 }}
        style={{ background: 'rgba(13,15,14,0.80)', position: 'relative', zIndex: 4 }}
      >
      <section id="contact" style={{
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 5vw, 72px)',
        maxWidth: 1200, margin: '0 auto',
      }}>

        {/* Contact hero */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(40px, 6vw, 100px)', alignItems: 'end',
          marginBottom: 'clamp(40px, 6vw, 80px)',
        }}>
          <div style={{ position: 'relative', zIndex: 5 }}>
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
            <SplitHeading delay={80} style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(38px, 5.5vw, 72px)',
              fontWeight: 400, fontStyle: 'italic',
              color: 'var(--cream)', lineHeight: 1.05,
              letterSpacing: '-2px', marginBottom: 28,
            }}>
              Let's flow together.
            </SplitHeading>
            <ScrollReveal duration={1000} delay={180}>
              <p style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300,
                color: 'var(--muted)', lineHeight: 1.85, marginBottom: 20, maxWidth: 420,
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
        </div>

        {/* Form or success */}
        {submitted ? (
          <div style={{ textAlign: 'center', padding: 'clamp(60px, 8vw, 100px) 0', position: 'relative', zIndex: 5 }}>
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
            <h3 style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic',
              color: 'var(--cream)', letterSpacing: '-1px', marginBottom: 16,
            }}>Message sent.</h3>
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
                borderRadius: '100px', cursor: 'pointer',
                transition: 'border-color 300ms ease, color 300ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--muted)' }}
            >
              Send another
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr',
            gap: 'clamp(48px, 8vw, 120px)', alignItems: 'start',
            position: 'relative', zIndex: 5,
          }}>
            {/* Left: info */}
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
                target="_blank" rel="noopener noreferrer"
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

            {/* Right: form */}
            <ScrollReveal duration={1100} delay={150}>
              <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* First + Last */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label htmlFor="firstName" style={labelStyle}>First Name</label>
                    <input
                      id="firstName" type="text" placeholder="First"
                      {...register('firstName', { required: 'Required' })}
                      style={{ ...inputStyle, ...getFocusStyle('firstName'), ...getErrorStyle(!!errors.firstName) }}
                      onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)}
                    />
                    {errors.firstName && <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" style={labelStyle}>Last Name</label>
                    <input
                      id="lastName" type="text" placeholder="Last"
                      {...register('lastName', { required: 'Required' })}
                      style={{ ...inputStyle, ...getFocusStyle('lastName'), ...getErrorStyle(!!errors.lastName) }}
                      onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)}
                    />
                    {errors.lastName && <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>{errors.lastName.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" style={labelStyle}>Email</label>
                  <input
                    id="email" type="email" placeholder="your@email.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
                    })}
                    style={{ ...inputStyle, ...getFocusStyle('email'), ...getErrorStyle(!!errors.email) }}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  />
                  {errors.email && <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>{errors.email.message}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" style={labelStyle}>Subject</label>
                  <input
                    id="subject" type="text" placeholder="What’s on your mind?"
                    {...register('subject')}
                    style={{ ...inputStyle, ...getFocusStyle('subject') }}
                    onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                  />
                </div>

                {/* Inquiry checkboxes */}
                <div>
                  <p style={{ ...labelStyle, marginBottom: 16 }}>Inquiry type</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px' }}>
                    {INQUIRY_TYPES.map(type => {
                      const isChecked = checked.includes(type.value)
                      return (
                        <label key={type.value} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body), sans-serif',
                          fontSize: '14px', fontWeight: 300,
                          color: isChecked ? 'var(--text)' : 'var(--muted)',
                          transition: 'color 250ms ease',
                        }}>
                          <span
                            onClick={() => toggleInquiry(type.value)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                              border: `1px solid ${isChecked ? 'var(--sage)' : 'var(--border)'}`,
                              background: isChecked ? 'var(--sage-glow)' : 'transparent',
                              transition: 'border-color 250ms ease, background 250ms ease',
                              cursor: 'pointer',
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
                    id="message" rows={5}
                    placeholder="Tell me a little about yourself and what brings you here..."
                    {...register('message', { required: 'A message is required' })}
                    style={{ ...inputStyle, ...getFocusStyle('message'), ...getErrorStyle(!!errors.message), resize: 'vertical', minHeight: 120 }}
                    onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                  />
                  {errors.message && <p style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '12px', color: 'var(--gold)', marginTop: 6 }}>{errors.message.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={isSubmitting}
                  style={{
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: '13px', fontWeight: 400,
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: 'var(--bg)', background: isSubmitting ? 'var(--muted)' : 'var(--sage)',
                    padding: '16px 44px', borderRadius: '100px',
                    border: 'none', cursor: 'pointer',
                    transition: 'background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)',
                    alignSelf: 'flex-start', opacity: isSubmitting ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.background = 'var(--sage-light)'; e.currentTarget.style.transform = 'scale(1.02)' } }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSubmitting ? 'var(--muted)' : 'var(--sage)'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send message \u2192'}
                </button>
              </form>
            </ScrollReveal>
          </div>
        )}
      </section>
      </motion.div>{/* /contact */}
      </div>{/* /content wrapper */}

      <style>{`
        @media (max-width: 768px) {
          #about,
          #contact > div:first-child { grid-template-columns: 1fr !important; }
          .service-row { grid-template-columns: 1fr !important; direction: ltr !important; }
          #contact > div:last-child { grid-template-columns: 1fr !important; }
        }
        input::placeholder, textarea::placeholder {
          color: var(--dim);
          font-family: var(--font-body), sans-serif;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50%       { opacity: 1;   transform: scaleY(1.2); }
        }
      `}</style>
    </main>
    </>
  )
}
