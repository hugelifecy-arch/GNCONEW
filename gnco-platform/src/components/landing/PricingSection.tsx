'use client'

import { useState } from 'react'
import Link from 'next/link'
import { track } from '@/lib/analytics'

const FUND_SIZE_OPTIONS = [
  'Under €10M',
  '€10M – €50M',
  '€50M – €100M',
  '€100M – €250M',
  '€250M – €500M',
  '€500M+',
]

function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [fundSize, setFundSize] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !fundSize) return
    setSubmitting(true)
    track('waitlist_joined', { plan_tier: 'professional', fund_size: fundSize })
    // Simulate submission — replace with CRM endpoint when available
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-md border border-accent-green/30 bg-accent-green/10 p-4 text-center">
        <p className="font-semibold text-accent-green">You&apos;re on the list.</p>
        <p className="mt-1 text-sm text-text-secondary">We&apos;ll reach out before launch with early access details.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-sm border border-bg-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-gold focus:outline-none"
      />
      <input
        type="email"
        placeholder="Work email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-sm border border-bg-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-gold focus:outline-none"
      />
      <select
        value={fundSize}
        onChange={(e) => setFundSize(e.target.value)}
        className="w-full rounded-sm border border-bg-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
      >
        <option value="">Target fund size</option>
        {FUND_SIZE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!name.trim() || !email.trim() || !fundSize || submitting}
        className="w-full rounded-sm border border-bg-border bg-transparent px-6 py-3 text-base font-semibold text-text-primary transition hover:border-accent-gold hover:text-accent-gold disabled:opacity-50 disabled:hover:border-bg-border disabled:hover:text-text-primary"
      >
        {submitting ? 'Submitting...' : 'Join Waitlist →'}
      </button>
    </div>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-bg-border bg-bg-primary py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Pricing</p>
          <h2 className="mt-3 font-serif text-4xl text-text-primary">Simple, Transparent Access</h2>
          <p className="mt-4 text-lg text-text-secondary">Free during open beta. Paid plans launching Q3 2026.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-accent-gold/40 bg-bg-elevated p-8 shadow-[0_0_0_1px_rgba(212,175,55,0.08)]">
            <div className="inline-flex rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
              Current — Open Beta
            </div>
            <h3 className="mt-5 font-serif text-3xl text-text-primary">Beta Access</h3>
            <div className="mt-4 flex items-end gap-1 text-text-primary">
              <span className="text-2xl font-semibold text-accent-gold">€</span>
              <span className="text-5xl font-semibold text-accent-gold">0</span>
              <span className="pb-1 text-base text-text-secondary">/month</span>
            </div>
            <p className="mt-4 text-text-secondary">Full platform access during development phase.</p>
            <ul className="mt-6 space-y-3 text-text-secondary">
              <li>✓ Full Architect Engine (15 jurisdictions)</li>
              <li>✓ All 52 fund structure templates</li>
              <li>✓ LP registry &amp; capital call manager</li>
              <li>✓ Distribution waterfall calculator</li>
              <li>✓ ILPA-aligned quarterly reporting</li>
              <li>✓ Free lifetime access to core features at launch*</li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/architect"
                onClick={() => track('upgrade_cta_clicked', { cta_location: 'pricing_section', target_plan: 'beta' })}
                className="inline-block rounded-sm bg-accent-gold px-6 py-3 text-center text-base font-semibold text-bg-primary transition hover:bg-accent-gold-light"
              >
                Start Free →
              </Link>
              <Link
                href="/sample-brief"
                className="inline-block rounded-sm border border-accent-gold/40 px-6 py-3 text-center text-base font-semibold text-accent-gold transition hover:bg-accent-gold/5"
              >
                View Sample Report →
              </Link>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-text-tertiary">
              * Beta users receive free lifetime access to core platform features when paid plans launch. See Terms
              of Service.
            </p>
          </div>

          <div className="rounded-2xl border border-bg-border bg-bg-surface p-8">
            <div className="inline-flex rounded-full border border-accent-gold/30 bg-accent-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">
              Launching Q3 2026
            </div>
            <h3 className="mt-5 font-serif text-3xl text-text-primary">Professional</h3>
            <div className="mt-4 flex items-end gap-1 text-text-primary">
              <span className="text-4xl font-semibold text-accent-gold">From €500</span>
              <span className="pb-1 text-base text-text-secondary">/month</span>
            </div>
            <p className="mt-4 text-text-secondary">For active fund managers and family offices.</p>
            <ul className="mt-6 space-y-3 text-text-secondary">
              <li>✓ Everything in beta, plus</li>
              <li>✓ Priority support</li>
              <li>✓ Custom LP onboarding flows</li>
              <li>✓ White-label reporting</li>
              <li>✓ API access</li>
            </ul>
            <WaitlistForm />
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-text-tertiary">
          Need legal details before launch?{' '}
          <Link href="/terms" className="text-accent-gold transition hover:text-accent-gold-light">
            Review Terms of Service →
          </Link>
        </p>
      </div>
    </section>
  )
}
