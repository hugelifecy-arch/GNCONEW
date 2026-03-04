import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Use Cases | GNCO',
  description:
    'See how family offices, PE fund managers, and real estate investors use GNCO to make fund structure decisions faster and cheaper.',
}

const USE_CASES = [
  {
    icp: 'Private Equity GP',
    headline: 'From blank brief to attorney meeting in 2 hours',
    scenario:
      'A GP raising a €150M fund was defaulting to Cayman Islands without analysis. GNCO modeled their specific LP base — 40% US, 35% EU, 25% Middle East — and showed a Luxembourg SCSp structure saved €340K over 5 years while improving EU LP tax efficiency. The GP entered legal with a complete cost model and jurisdiction rationale on day one.',
    outcome:
      '€340K projected 5-year savings. Legal engagement compressed from 6 weeks to 1 meeting.',
  },
  {
    icp: 'Single Family Office',
    headline: 'Structure decision made before the board meeting',
    scenario:
      'A Cyprus-based SFO was structuring its third real estate co-investment vehicle and needed board approval before engaging counsel. GNCO compared Jersey, Luxembourg, and Ireland in 12 minutes and produced a cost comparison and suitability scoring matrix the CIO presented directly to principals. Jersey was selected based on EU LP familiarity and treaty access for French and German assets.',
    outcome:
      'Board decision made in one meeting. No external legal fees in the pre-formation phase.',
  },
  {
    icp: 'First-Time Fund Manager',
    headline: 'Eliminated three weeks of exploratory legal engagement',
    scenario:
      'An emerging VC manager had no structuring experience and was preparing for a first close with 12 US and EU LPs. GNCO\'s 8-question intake surfaced three viable structures and identified a Delaware LP as optimal for the US LP concentration, with a Cyprus feeder for EU investors. The manager entered counsel with a fully modeled structure and LP-level WHT analysis.',
    outcome:
      'First close timeline cut by 3 weeks. Legal engagement started at execution, not exploration.',
  },
  {
    icp: 'Multi-Family Office',
    headline: 'Consistent structuring methodology across 8 client funds',
    scenario:
      'An MFO managing wealth for 12 families needed a repeatable process for evaluating fund structures across different strategies and LP profiles. GNCO became the pre-engagement standard for every new vehicle: all structure proposals are validated against GNCO\'s cost and suitability model before any external advisor is briefed.',
    outcome:
      'Standardized structuring process. Estimated €200K+ saved annually across client engagements.',
  },
  {
    icp: 'Legal Advisor / CSP',
    headline: 'Client briefings that take days now take minutes',
    scenario:
      'A fund administration firm used GNCO to pre-screen jurisdictions for new client mandates before the initial kickoff call. Instead of arriving with a blank slate, the admin team presents a GNCO-generated comparison table and cost model as the starting point. Clients arrive informed; engagement time is cut.',
    outcome:
      'Client onboarding time reduced. Higher-quality first meetings. Stronger advisor credibility.',
  },
]

export default function UseCasesPage() {
  return (
    <main className="bg-bg-primary px-4 py-14 text-text-primary sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl space-y-12">
        <header className="space-y-3">
          <h1 className="font-serif text-3xl tracking-tight sm:text-5xl">How Practitioners Use GNCO</h1>
          <p className="max-w-3xl text-base text-text-secondary sm:text-lg">
            See how family offices, PE fund managers, and real estate investors use GNCO to make fund structure decisions faster and cheaper.
          </p>
        </header>

        <section className="space-y-6">
          {USE_CASES.map((uc) => (
            <article
              key={uc.icp}
              className="rounded-xl border border-bg-border bg-bg-surface p-6 transition hover:border-accent-gold/30"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">
                {uc.icp}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-text-primary">{uc.headline}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{uc.scenario}</p>
              <p className="mt-3 text-sm font-semibold text-text-primary">{uc.outcome}</p>
              <Link
                href="/architect"
                className="mt-4 inline-block text-sm font-medium text-accent-gold transition hover:text-accent-gold-light"
              >
                Try this scenario →
              </Link>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-accent-gold/20 bg-accent-gold/5 p-8 text-center">
          <h2 className="font-serif text-2xl text-text-primary">Ready to model your scenario?</h2>
          <Link
            href="/architect"
            className="mt-6 inline-block rounded-sm bg-accent-gold px-8 py-4 font-semibold text-bg-primary transition hover:bg-accent-gold-light"
          >
            Launch Architect Engine →
          </Link>
        </section>
      </div>
    </main>
  )
}
