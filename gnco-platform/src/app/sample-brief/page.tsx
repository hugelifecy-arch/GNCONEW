import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sample Attorney Brief | GNCO',
  description:
    'See a redacted sample of the GNCO Architect Engine attorney brief — generated for a €100M PE fund with 12 LPs, recommending Ireland.',
}

const jurisdictionScores = [
  { rank: 1, name: 'Ireland', flag: '🇮🇪', score: 87, formationCost: '€75,000', annualCost: '€130,000', timeline: '6–12 weeks', aifmd: 'Yes', crs: 'Yes', notes: 'QIAIF fast-track. Full AIFMD passport.' },
  { rank: 2, name: 'Luxembourg', flag: '🇱🇺', score: 82, formationCost: '€85,000', annualCost: '€140,000', timeline: '8–12 weeks', aifmd: 'Yes', crs: 'Yes', notes: 'RAIF route avoids CSSF approval delay.' },
  { rank: 3, name: 'Cayman Islands', flag: '🇰🇾', score: 79, formationCost: '€22,500', annualCost: '€30,000', timeline: '1–2 weeks', aifmd: 'No', crs: 'Yes', notes: 'No EU passport. NPPR required for EU marketing.' },
  { rank: 4, name: 'Jersey', flag: '🇯🇪', score: 76, formationCost: '€35,000', annualCost: '€55,000', timeline: '2–10 weeks', aifmd: 'No', crs: 'Yes', notes: 'JPF 48-hour route available.' },
  { rank: 5, name: 'Singapore', flag: '🇸🇬', score: 74, formationCost: '€27,500', annualCost: '€65,000', timeline: '4–24 weeks', aifmd: 'No', crs: 'Yes', notes: 'VCC structure. MAS licensing required.' },
]

const lpTaxImpact = [
  { type: 'Family Trust', domicile: 'Germany', commitment: '€25M', wht: '15%', netImpact: '-42 bps', treaty: 'Yes (Art. 10)' },
  { type: 'HNWI Individual', domicile: 'UAE', commitment: '€20M', wht: '0%', netImpact: '0 bps', treaty: 'Yes (Art. 10)' },
  { type: 'Pension Fund', domicile: 'Germany', commitment: '€15M', wht: '0%', netImpact: '0 bps', treaty: 'Exempt' },
  { type: 'Corporate HoldCo', domicile: 'Singapore', commitment: '€15M', wht: '10%', netImpact: '-28 bps', treaty: 'Yes (Art. 10)' },
  { type: 'Family Trust', domicile: 'UK', commitment: '€10M', wht: '15%', netImpact: '-42 bps', treaty: 'Yes (Art. 10)' },
  { type: 'Endowment', domicile: 'Switzerland', commitment: '€10M', wht: '0%', netImpact: '0 bps', treaty: 'Yes (Art. 10)' },
  { type: 'HNWI Individual', domicile: 'USA', commitment: '€5M', wht: '15%', netImpact: '-42 bps', treaty: 'Yes (Art. 10)' },
]

const regulatoryObligations = [
  { filing: 'CBI Annual Return', frequency: 'Annual', deadline: 'Within 6 months of FYE', cost: '€5,000–€8,000' },
  { filing: 'AIFMD Annex IV Reporting', frequency: 'Quarterly', deadline: '45 days post-quarter', cost: '€3,000–€5,000/yr' },
  { filing: 'CRS/FATCA Reporting', frequency: 'Annual', deadline: '30 June', cost: '€2,000–€4,000' },
  { filing: 'Financial Statements & Audit', frequency: 'Annual', deadline: '6 months post-FYE', cost: '€25,000–€40,000' },
  { filing: 'Anti-Money Laundering Returns', frequency: 'Annual', deadline: 'As required by CBI', cost: 'Included in admin' },
  { filing: 'Beneficial Ownership Register', frequency: 'Ongoing', deadline: 'Within 5 months of FYE', cost: '€1,000–€2,000' },
]

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="mt-10 flex items-center gap-3 border-b border-bg-border pb-3 font-serif text-2xl text-text-primary">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold/15 text-sm font-semibold text-accent-gold">
        {number}
      </span>
      {title}
    </h2>
  )
}

export default function SampleBriefPage() {
  return (
    <main className="bg-bg-primary px-6 py-14 text-text-primary">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-accent-gold/30 bg-bg-surface p-8 shadow-lg sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full border border-accent-gold/30 bg-accent-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">
              Sample Brief
            </span>
            <span className="text-xs text-text-tertiary">Redacted &middot; For illustration only</span>
          </div>

          <h1 className="font-serif text-3xl text-text-primary sm:text-4xl">
            GNCO Architect Engine — Attorney Brief
          </h1>
          <p className="mt-3 text-text-secondary">
            Generated for a &euro;100M Private Equity fund &middot; 12 LPs across Germany, UAE, Singapore, UK, Switzerland, USA &middot; Ireland recommended
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            Brief ID: GNCO-2026-SAMPLE &middot; Generated: March 2026 &middot; Data version v2.1
          </p>

          {/* Section 1: Executive Summary */}
          <SectionHeading number={1} title="Executive Summary" />
          <div className="mt-4 space-y-4 text-text-secondary">
            <div className="rounded-md border border-accent-gold/25 bg-accent-gold/5 p-5">
              <p className="font-semibold text-text-primary">Recommended Structure: Ireland QIAIF (ICAV)</p>
              <ul className="mt-3 space-y-2">
                <li>&#10003; Full AIFMD marketing passport — enables EU-wide LP fundraising without NPPR complexity</li>
                <li>&#10003; Treaty network covers all 7 LP domiciles — reducing aggregate WHT drag by an estimated 18 bps vs. Cayman</li>
                <li>&#10003; QIAIF fast-track authorization available — estimated 6–12 week formation timeline</li>
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-bg-border p-4 text-center">
                <p className="text-sm text-text-tertiary">Estimated Formation Cost</p>
                <p className="mt-1 font-serif text-2xl text-accent-gold">&euro;75,000</p>
              </div>
              <div className="rounded-md border border-bg-border p-4 text-center">
                <p className="text-sm text-text-tertiary">Estimated Annual Cost</p>
                <p className="mt-1 font-serif text-2xl text-accent-gold">&euro;130,000</p>
              </div>
              <div className="rounded-md border border-bg-border p-4 text-center">
                <p className="text-sm text-text-tertiary">Formation Timeline</p>
                <p className="mt-1 font-serif text-2xl text-accent-gold">6–12 wks</p>
              </div>
            </div>
          </div>

          {/* Section 2: Fund Structure Diagram */}
          <SectionHeading number={2} title="Fund Structure Diagram" />
          <div className="mt-4 rounded-md border border-bg-border bg-bg-elevated p-6">
            <div className="flex flex-col items-center gap-4 text-center text-sm">
              <div className="w-full max-w-xs rounded-md border border-accent-gold/30 bg-accent-gold/10 p-3">
                <p className="font-semibold text-accent-gold">Limited Partners (12 LPs)</p>
                <p className="text-xs text-text-tertiary">Germany &middot; UAE &middot; Singapore &middot; UK &middot; Switzerland &middot; USA</p>
              </div>
              <div className="h-6 w-px bg-bg-border" />
              <div className="w-full max-w-xs rounded-md border border-bg-border p-3">
                <p className="font-semibold text-text-primary">Ireland QIAIF (ICAV)</p>
                <p className="text-xs text-text-tertiary">Fund Vehicle &middot; CBI Regulated</p>
              </div>
              <div className="flex w-full max-w-md items-center justify-center gap-4">
                <div className="h-px flex-1 bg-bg-border" />
                <span className="text-xs text-text-tertiary">Management</span>
                <div className="h-px flex-1 bg-bg-border" />
              </div>
              <div className="flex w-full max-w-md gap-4">
                <div className="flex-1 rounded-md border border-bg-border p-3">
                  <p className="font-semibold text-text-primary">GP Entity</p>
                  <p className="text-xs text-text-tertiary">[Redacted] GP Ltd</p>
                </div>
                <div className="flex-1 rounded-md border border-bg-border p-3">
                  <p className="font-semibold text-text-primary">AIFM</p>
                  <p className="text-xs text-text-tertiary">Third-party or self-managed</p>
                </div>
              </div>
              <div className="h-6 w-px bg-bg-border" />
              <div className="w-full max-w-xs rounded-md border border-bg-border p-3">
                <p className="font-semibold text-text-primary">Portfolio Companies</p>
                <p className="text-xs text-text-tertiary">PE Buyout targets &middot; Europe &amp; North America</p>
              </div>
            </div>
          </div>

          {/* Section 3: Jurisdiction Comparison Table */}
          <SectionHeading number={3} title="Jurisdiction Comparison Table" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-bg-border text-text-secondary">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Jurisdiction</th>
                  <th className="py-2 pr-3">Score</th>
                  <th className="py-2 pr-3">Formation</th>
                  <th className="py-2 pr-3">Annual</th>
                  <th className="py-2 pr-3">Timeline</th>
                  <th className="py-2 pr-3">AIFMD</th>
                  <th className="py-2 pr-3">CRS</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {jurisdictionScores.map((j) => (
                  <tr
                    key={j.name}
                    className={`border-b border-bg-border/70 ${j.rank <= 3 ? 'bg-accent-gold/5 text-text-primary' : 'text-text-secondary'}`}
                  >
                    <td className="py-3 pr-3 font-semibold text-accent-gold">{j.rank}</td>
                    <td className="py-3 pr-3">
                      <span className="mr-1">{j.flag}</span> {j.name}
                    </td>
                    <td className="py-3 pr-3 font-semibold">{j.score}/100</td>
                    <td className="py-3 pr-3">{j.formationCost}</td>
                    <td className="py-3 pr-3">{j.annualCost}</td>
                    <td className="py-3 pr-3">{j.timeline}</td>
                    <td className="py-3 pr-3">{j.aifmd}</td>
                    <td className="py-3 pr-3">{j.crs}</td>
                    <td className="py-3 text-xs">{j.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-text-tertiary">
              Showing top 5 of 15 scored jurisdictions. Full table available in generated brief.
            </p>
          </div>

          {/* Section 4: LP Tax Impact Analysis */}
          <SectionHeading number={4} title="LP Tax Impact Analysis" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-bg-border text-text-secondary">
                  <th className="py-2 pr-3">LP Type</th>
                  <th className="py-2 pr-3">Domicile</th>
                  <th className="py-2 pr-3">Commitment</th>
                  <th className="py-2 pr-3">WHT Rate</th>
                  <th className="py-2 pr-3">Net IRR Impact</th>
                  <th className="py-2">Treaty</th>
                </tr>
              </thead>
              <tbody>
                {lpTaxImpact.map((lp, idx) => (
                  <tr key={idx} className="border-b border-bg-border/70 text-text-primary">
                    <td className="py-3 pr-3">{lp.type}</td>
                    <td className="py-3 pr-3">{lp.domicile}</td>
                    <td className="py-3 pr-3">{lp.commitment}</td>
                    <td className="py-3 pr-3">{lp.wht}</td>
                    <td className="py-3 pr-3">{lp.netImpact}</td>
                    <td className="py-3">{lp.treaty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 5: Regulatory Obligations */}
          <SectionHeading number={5} title="Regulatory Obligations Summary" />
          <p className="mt-4 text-sm text-text-secondary">
            Key regulatory filings for an Ireland QIAIF (ICAV):
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-bg-border text-text-secondary">
                  <th className="py-2 pr-3">Filing</th>
                  <th className="py-2 pr-3">Frequency</th>
                  <th className="py-2 pr-3">Deadline</th>
                  <th className="py-2">Estimated Cost</th>
                </tr>
              </thead>
              <tbody>
                {regulatoryObligations.map((r) => (
                  <tr key={r.filing} className="border-b border-bg-border/70 text-text-primary">
                    <td className="py-3 pr-3">{r.filing}</td>
                    <td className="py-3 pr-3">{r.frequency}</td>
                    <td className="py-3 pr-3">{r.deadline}</td>
                    <td className="py-3">{r.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 6: Red Flags & Counsel Notes */}
          <SectionHeading number={6} title="Red Flags & Counsel Notes" />
          <div className="mt-4 space-y-3">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="font-semibold text-amber-400">US-Connected LP Detected</p>
              <p className="mt-1 text-sm text-text-secondary">
                1 LP is US-domiciled. Counsel should review ECI/UBTI exposure and consider blocker entity if fund holds operating businesses. FIRPTA implications for US real property interests.
              </p>
            </div>
            <div className="rounded-md border border-bg-border p-4">
              <p className="font-semibold text-text-primary">Recommended Next Steps</p>
              <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                <li>1. Engage Irish counsel for QIAIF application (estimated 6–12 weeks)</li>
                <li>2. Appoint AIFM (self-managed or third-party) and depositaire</li>
                <li>3. Prepare LP subscription documents and side letter framework</li>
                <li>4. Confirm US LP blocker entity requirements with US tax counsel</li>
              </ul>
            </div>
            <div className="rounded-md border border-bg-border p-4">
              <p className="font-semibold text-text-primary">Recommended Law Firms — Ireland</p>
              <div className="mt-2 space-y-1 text-sm text-text-secondary">
                <p>Matheson &middot; A&amp;L Goodbody &middot; Arthur Cox</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-10 rounded-md border border-bg-border bg-bg-elevated p-5 text-xs text-text-tertiary">
            <p className="font-semibold text-text-secondary">Disclaimer</p>
            <p className="mt-2">
              This sample brief is for illustration purposes only and does not constitute legal, tax, or investment advice. Actual briefs generated by the GNCO Architect Engine are customized based on your specific fund parameters. All cost figures are estimates based on market data as of February 2026. Consult licensed legal and tax counsel before making any fund structuring decisions.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
            <Link
              href="/architect"
              className="inline-block rounded-sm bg-accent-gold px-8 py-4 font-semibold text-bg-primary transition hover:bg-accent-gold-light"
            >
              Generate Your Own Brief →
            </Link>
            <Link
              href="/methodology"
              className="inline-block rounded-sm border border-accent-gold/40 px-8 py-4 font-semibold text-accent-gold transition hover:bg-accent-gold/5"
            >
              View Methodology →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
