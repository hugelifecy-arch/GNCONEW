'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

interface EmailCaptureFormProps {
  fundStrategy?: string
  fundSize?: string
  topJurisdiction?: string
  onSuccess: () => void
}

export function EmailCaptureForm({ fundStrategy, fundSize, topJurisdiction, onSuccess }: EmailCaptureFormProps) {
  const [email, setEmail] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail) {
      setError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fundStrategy, fundSize, topJurisdiction, marketingConsent }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong.')
        setSubmitting(false)
        return
      }

      track('brief_downloaded', { jurisdiction: topJurisdiction, fund_size: fundSize })
      onSuccess()
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-accent-gold/30 bg-bg-elevated p-6">
      <h3 className="font-serif text-xl text-text-primary">Get Your Full Attorney Brief</h3>
      <p className="mt-2 text-sm text-text-secondary">
        Enter your email to download your personalized jurisdiction recommendation and attorney brief.
        No credit card. Cancel anytime.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 rounded-md border border-bg-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none ring-accent-gold/40 transition placeholder:text-text-tertiary focus:ring-2"
          />
          <button
            type="submit"
            disabled={submitting || !isValidEmail}
            className="rounded-sm bg-accent-gold px-6 py-3 text-sm font-semibold text-bg-primary transition hover:bg-accent-gold-light disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Download →'}
          </button>
        </div>

        <label className="flex items-start gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 rounded border-bg-border"
          />
          <span>I agree to receive product updates from GNCO. You can unsubscribe at any time.</span>
        </label>

        {error && <p className="text-xs text-accent-red">{error}</p>}
      </form>

      <div className="mt-3 flex items-center gap-4 text-xs text-text-tertiary">
        <span>✓ Free during beta</span>
        <span>✓ Unsubscribe any time</span>
      </div>
    </div>
  )
}
