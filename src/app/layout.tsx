import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import WaterCursorWrapper from '@/components/ui/WaterCursorWrapper'
import ClientLayout from '@/components/layout/ClientLayout'
import SmoothScroll from '@/components/layout/SmoothScroll'
import ScrollIndicator from '@/components/ui/ScrollIndicator'
import VHSetup from '@/components/ui/VHSetup'

export const metadata: Metadata = {
  title: 'Flow With Curtana — Yoga, Breathwork & Wellness Coaching',
  description:
    'Yoga teacher, breathwork guide, and wellness coach. Move with intention. Breathe with purpose. Come home to yourself.',
  openGraph: {
    title: 'Flow With Curtana',
    description: 'Move with intention. Breathe with purpose. Come home to yourself.',
    siteName: 'Flow With Curtana',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* Sets --vh CSS variable on every resize (mobile Safari fix) */}
        <VHSetup />
        {/* Cursor + Nav are fixed-position — sit above the scroll layer */}
        <WaterCursorWrapper />
        <Nav />
        {/* Virtual scroll engine wraps all scrollable content */}
        <SmoothScroll>
          <ClientLayout>{children}</ClientLayout>
          <Footer />
          {/* Lusion-style fixed scrollbar indicator */}
          <ScrollIndicator />
        </SmoothScroll>
      </body>
    </html>
  )
}
