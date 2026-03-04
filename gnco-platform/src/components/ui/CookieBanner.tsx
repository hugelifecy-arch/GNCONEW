'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'gnco_cookie_consent'

export function getConsentStatus(): 'accepted' | 'declined' | null {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(CONSENT_KEY)
  if (value === 'accepted' || value === 'declined') return value
  return null
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = getConsentStatus()
    if (!consent) {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    // Trigger analytics initialization after consent
    window.dispatchEvent(new Event('gnco_consent_granted'))
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-bg-border"
      style={{ backgroundColor: '#1B2A4A' }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-white/90">
          We use essential cookies to operate this platform and optional analytics cookies to improve your experience. Your fund modeling data is encrypted and never shared.
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleAccept}
            className="rounded-sm bg-accent-gold px-5 py-2 text-sm font-semibold text-bg-primary transition hover:bg-accent-gold-light"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="rounded-sm border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/60"
          >
            Decline
          </button>
          <Link
            href="/privacy"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}
