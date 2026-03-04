import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclosures | GNCO',
  description:
    'Review GNCO legal disclosures including early access status, advisory limitations, jurisdiction notices, privacy statements, data architecture, and contact information.',
}

const sections = [
  {
    title: 'Early Access Status Disclosure',
    body: 'GNCO is currently provided as an early-access platform. Features, coverage breadth, and output formatting may evolve rapidly as the platform expands. Information may change without prior notice while systems are being calibrated for broader production deployment.',
  },
  {
    title: 'Not Investment Advice',
    body: 'Materials presented through GNCO are for informational purposes only and do not constitute investment advice, investment recommendations, or a view on the suitability of any fund, strategy, jurisdiction, or vehicle for any investor or manager.',
  },
  {
    title: 'No Offer or Solicitation',
    body: 'Nothing in GNCO constitutes an offer to sell, a solicitation of an offer to buy, or a marketing communication for securities, fund interests, or advisory services in any jurisdiction. Any offering activity must occur through separate, authorized documentation.',
  },
  {
    title: 'No Legal or Tax Advice',
    body: 'GNCO does not provide legal, accounting, or tax advice. Users must consult qualified counsel and tax advisors in relevant jurisdictions before taking action based on platform output, including formation, fundraising, or structuring decisions.',
  },
  {
    title: 'Jurisdiction-Specific Notices (US, EU, UK, Singapore, UAE)',
    body: 'United States: platform content is not intended as SEC-registered advisory output. European Union and United Kingdom: no statement herein should be treated as regulated financial promotion. Singapore and UAE: users remain responsible for local licensing, promotion, and placement compliance obligations.',
  },
  {
    title: 'Data Privacy Statement (GDPR + CCPA placeholder)',
    body: 'GNCO is designed to support privacy rights frameworks including GDPR and CCPA. Data subject request workflows, retention controls, and processing records are maintained and will continue to be refined during rollout. Jurisdiction-specific notices may be supplemented in future versions.',
  },
  {
    title: 'Data Architecture Summary (what we collect, where stored, who has access)',
    body: 'We collect account identity information, firm profile inputs, selected modeling assumptions, and interaction telemetry required for platform operation. Data is stored in managed cloud infrastructure with role-based access controls. Access is limited to authorized GNCO personnel and vetted processors with a need-to-know basis.',
  },
  {
    title: 'NDA and DPA Availability',
    body: 'We sign NDAs and Data Processing Agreements on request.',
  },
  {
    title: 'Contact Information',
    body: 'For legal, compliance, or privacy inquiries, contact legal@gnco.io. For security matters, include “Security Disclosure” in the subject line to support expedited routing.',
  },
]

export default function DisclosuresPage() {
  return (
    <main className="bg-bg-primary px-4 py-12 text-text-primary sm:px-6 lg:px-8 disclosures-print-root">
      <article className="mx-auto w-full max-w-2xl rounded-xl border border-bg-border bg-bg-elevated p-6 sm:p-8 print:max-w-none print:border-0 print:bg-white print:p-0 print:text-black">
        <header className="mb-8 space-y-3 border-b border-bg-border pb-6 print:border-slate-300">
          <p className="text-sm uppercase tracking-wide text-text-secondary print:text-slate-600">Last Updated: February 2026</p>
          <h1 className="text-3xl font-semibold print:text-black">Disclosures</h1>
          <p className="text-sm text-text-secondary print:text-slate-700">
            This page summarizes key legal and compliance disclosures applicable to use of the GNCO platform.
          </p>
        </header>

        <div className="space-y-7">
          {sections.map((section, index) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-xl font-semibold print:text-black">
                {index + 1}. {section.title}
              </h2>
              <p className="leading-7 text-text-secondary print:text-slate-800">{section.body}</p>
            </section>
          ))}
        </div>
      </article>

    </main>
  )
}
