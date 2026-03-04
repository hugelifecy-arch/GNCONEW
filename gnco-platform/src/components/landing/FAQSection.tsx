'use client'

import Link from 'next/link'
import { Accordion } from '@/components/ui/Accordion'

const FAQ_ITEMS = [
  {
    question: 'Is this legal or tax advice?',
    answer:
      'No. GNCO produces illustrative cost models and jurisdiction scoring based on publicly available regulatory data and market benchmarks. All outputs should be reviewed by qualified legal and tax counsel before any structuring decisions are made. See our full disclosures.',
  },
  {
    question: 'How accurate are the cost figures?',
    answer:
      'Formation and annual cost estimates are based on aggregated market data from licensed service providers and regulatory fee schedules, updated quarterly. Costs vary based on fund complexity, service provider selection, and regulatory changes — treat all figures as directional estimates. See the Methodology page for full data sources and update cadence.',
  },
  {
    question: 'What happens to my data?',
    answer:
      'Your fund parameters are used solely to generate your structure recommendations. We do not sell, share, or use your data for any purpose other than delivering your results. See our Data Architecture page for details on encryption, storage, and GDPR compliance.',
  },
  {
    question: 'Why is GNCO free during beta?',
    answer:
      'We are building the most accurate fund structuring tool on the market and use real-world fund parameters to validate and improve our models. Beta users get full platform access in exchange for feedback. All beta users receive free lifetime access to core platform features when paid plans launch in Q3 2026.',
  },
  {
    question: 'How does GNCO compare to working directly with a law firm?',
    answer:
      'GNCO does not replace legal counsel — it makes your legal engagement faster and cheaper. Instead of spending weeks in exploratory meetings at partner rates, you enter counsel with a data-backed recommendation, a cost model, and a preliminary attorney brief. Most users report their first legal meeting becomes a confirmation session rather than an education session.',
  },
]

export function FAQSection() {
  return (
    <section className="bg-bg-primary px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-serif text-3xl text-text-primary md:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-text-secondary">
          Common questions from institutional teams evaluating GNCO.
        </p>

        <div className="mt-10">
          <Accordion items={FAQ_ITEMS} />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/disclosures"
            className="text-sm text-accent-gold transition hover:text-accent-gold-light"
          >
            View Full Disclosures →
          </Link>
        </div>
      </div>
    </section>
  )
}
