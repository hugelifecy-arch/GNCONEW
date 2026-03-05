import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — GNCO',
  description: 'Simple, transparent pricing for fund structuring. Free during open beta. Paid plans launching Q3 2026.',
}

const tiers = [
  {
    name: 'Beta',
    badge: 'Current',
    price: '€0',
    period: '/month',
    description: 'Full platform access during development phase.',
    features: [
      'Full Architect Engine (15 jurisdictions)',
      'All 52 fund structure templates',
      'LP registry & capital call manager',
      'Distribution waterfall calculator',
      'ILPA-aligned quarterly reporting',
    ],
    cta: { label: 'Continue Free →', href: '/architect' },
    highlight: false,
  },
  {
    name: 'Starter',
    badge: 'Q3 2026',
    price: '€299',
    period: '/month',
    description: 'For individual fund managers getting started.',
    features: [
      '5 models/month',
      'Brief generator',
      'LP registry (25 LPs)',
      'Basic reporting',
      'Email support',
    ],
    cta: { label: 'Join Waitlist →', href: '/#pricing' },
    highlight: false,
  },
  {
    name: 'Professional',
    badge: 'Most Popular',
    price: '€699',
    period: '/month',
    description: 'For active fund managers and family offices.',
    features: [
      'Unlimited models',
      '100 LPs',
      'Full waterfall calculator',
      'ILPA reports',
      'API access',
      'Priority support',
    ],
    cta: { label: 'Join Waitlist →', href: '/#pricing' },
    highlight: true,
  },
  {
    name: 'Family Office',
    badge: 'Q3 2026',
    price: '€1,499',
    period: '/month',
    description: 'Multi-fund management with team collaboration.',
    features: [
      'Everything in Professional',
      'Multi-fund support',
      '5 team seats',
      'White-label reporting',
      'Dedicated CSM',
    ],
    cta: { label: 'Join Waitlist →', href: '/#pricing' },
    highlight: false,
  },
  {
    name: 'Enterprise',
    badge: 'Custom',
    price: 'Custom',
    period: '',
    description: 'White-label platform for institutions and CSPs.',
    features: [
      'White-label platform',
      'Custom API integration',
      'SSO & RBAC',
      'Custom SLA',
      'Dedicated infrastructure',
    ],
    cta: { label: 'Contact Sales →', href: '/#pricing' },
    highlight: false,
  },
]

const pricingFaqs = [
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your data is always yours. If you downgrade, you retain read-only access to all historical models and reports. You can export all data at any time.',
  },
  {
    q: 'Can I switch plans mid-cycle?',
    a: 'Yes. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Annual billing with a 20% discount will be available at launch. Beta users who convert to annual plans receive an additional 10% loyalty discount.',
  },
]

export default function PricingPage() {
  return (
    <main className="bg-bg-primary px-6 py-14 text-text-primary">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Pricing</p>
          <h1 className="mt-3 font-serif text-4xl">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg text-text-secondary">Free during open beta. Paid plans launching Q3 2026.</p>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                tier.highlight
                  ? 'border-accent-gold/40 bg-bg-elevated shadow-[0_0_0_1px_rgba(212,175,55,0.08)]'
                  : 'border-bg-border bg-bg-surface'
              }`}
            >
              <div
                className={`inline-flex self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  tier.highlight
                    ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                    : 'border-bg-border bg-bg-elevated text-text-secondary'
                }`}
              >
                {tier.badge}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{tier.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className={`text-3xl font-semibold ${tier.highlight ? 'text-accent-gold' : 'text-text-primary'}`}>
                  {tier.price}
                </span>
                {tier.period && <span className="pb-0.5 text-sm text-text-secondary">{tier.period}</span>}
              </div>
              <p className="mt-3 text-sm text-text-secondary">{tier.description}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-text-secondary">
                {tier.features.map((feature) => (
                  <li key={feature}>&#10003; {feature}</li>
                ))}
              </ul>
              {tier.cta.href.startsWith('/') ? (
                <Link
                  href={tier.cta.href}
                  className={`mt-6 inline-block rounded-sm px-5 py-2.5 text-center text-sm font-semibold transition ${
                    tier.highlight
                      ? 'bg-accent-gold text-bg-primary hover:bg-accent-gold-light'
                      : 'border border-bg-border text-text-primary hover:border-accent-gold hover:text-accent-gold'
                  }`}
                >
                  {tier.cta.label}
                </Link>
              ) : (
                <a
                  href={tier.cta.href}
                  className={`mt-6 inline-block rounded-sm px-5 py-2.5 text-center text-sm font-semibold transition ${
                    tier.highlight
                      ? 'bg-accent-gold text-bg-primary hover:bg-accent-gold-light'
                      : 'border border-bg-border text-text-primary hover:border-accent-gold hover:text-accent-gold'
                  }`}
                >
                  {tier.cta.label}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-bg-border bg-bg-surface p-6 text-sm leading-relaxed text-text-tertiary">
          * Beta users receive free lifetime access to core platform features when paid plans launch. &ldquo;Core features&rdquo; includes the Architect Engine, 52 templates, basic LP registry, and distribution waterfall calculator. Advanced features (white-label reporting, API access, team seats, priority support) are Professional and above.
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-semibold">Pricing FAQ</h2>
          <div className="mt-8 space-y-6">
            {pricingFaqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-bg-border bg-bg-surface p-5">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-text-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
