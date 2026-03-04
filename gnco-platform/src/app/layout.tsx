import { Metadata } from 'next'
import { AnalyticsProvider } from '@/components/shared/AnalyticsProvider'
import { DisclaimerFooterBar } from '@/components/shared/DisclaimerFooterBar'
import { LayoutNavigation } from '@/components/navigation/LayoutNavigation'
import { LayoutPageFrame } from '@/components/navigation/LayoutPageFrame'
import { PrivacyModeProvider } from '@/components/shared/PrivacyModeContext'
import { CookieBanner } from '@/components/ui/CookieBanner'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gnconew.vercel.app'

export const metadata: Metadata = {
  title: 'GNCO — Global Fund Architect | 15-Jurisdiction Fund Structure Modeling',
  description: 'Model, compare, and optimize fund structures across 15 jurisdictions in minutes. Built for family offices, GPs, and fund architects. Free open beta access — no credit card required.',
  keywords: ['fund structure', 'jurisdiction selection', 'family office', 'fund architecture', 'Cayman Islands fund', 'Luxembourg fund', 'AIFMD', 'fund formation'],
  authors: [{ name: 'GNCO' }],
  metadataBase: new URL(BASE_URL),

  openGraph: {
    title: 'GNCO — Global Fund Architect',
    description: 'Model optimal fund structures across 15 jurisdictions. From Cayman to Luxembourg to Singapore — in minutes, not months. Free beta access.',
    url: BASE_URL,
    siteName: 'GNCO',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GNCO Global Fund Architect — 15 Jurisdictions',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'GNCO — Global Fund Architect',
    description: 'Model fund structures across 15 jurisdictions. Free beta access.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg-primary text-text-primary font-sans antialiased">
        <PrivacyModeProvider>
          <AnalyticsProvider />
          <LayoutNavigation />
          <LayoutPageFrame>{children}</LayoutPageFrame>
          <DisclaimerFooterBar />
          <CookieBanner />
        </PrivacyModeProvider>
      </body>
    </html>
  )
}
