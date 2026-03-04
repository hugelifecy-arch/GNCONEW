'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Citation } from '@/components/ui/Citation'
import { DataVersionBadge } from '@/components/ui/DataVersionBadge'
import { JURISDICTIONS } from '@/lib/jurisdiction-data'
import { track } from '@/lib/analytics'

const scoringCriteria = [
  { name: 'Cost Efficiency', weight: 25, description: 'Formation + 5-year operating cost vs. fund size' },
  { name: 'Tax Efficiency', weight: 25, description: 'Treaty network quality, WHT rates for LP domicile mix' },
  { name: 'Regulatory Burden', weight: 20, description: 'Formation complexity, ongoing compliance requirements' },
  { name: 'LP Familiarity', weight: 15, description: 'How well-known/accepted this structure is with target LP types' },
  { name: 'Formation Timeline', weight: 10, description: 'Weeks to operational fund' },
  { name: 'Asset Geography Fit', weight: 5, description: 'Regulatory alignment with target asset locations' },
]

const versionHistory = [
  { version: 'v2.1', date: 'Feb 2026', changes: 'Updated Ireland annual cost estimates; added BVI treaty data' },
  { version: 'v2.0', date: 'Nov 2025', changes: 'Added Cyprus jurisdiction; updated Luxembourg AIFMD compliance data' },
  { version: 'v1.0', date: 'Aug 2025', changes: 'Initial release — 12 jurisdictions' },
]

const sections: { id: string; title: string; content: ReactNode }[] = [
  {
    id: 'how-gnco-scores-jurisdictions',
    title: 'How GNCO Scores Jurisdictions',
    content: (
      <>
        <p>
          <Citation source="GNCO methodology weighting framework" url="/methodology" marker="1">
            GNCO evaluates jurisdictions across six weighted dimensions. Weighted scores are normalized to a 0-100 scale and refreshed whenever major regulatory or treaty updates are detected.
          </Citation>
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="py-2 text-left font-semibold">Criterion</th>
                <th className="py-2 text-left font-semibold">Weight</th>
                <th className="py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {scoringCriteria.map((criterion) => (
                <tr key={criterion.name} className="border-b border-bg-border/50">
                  <td className="py-2 font-medium text-text-primary">{criterion.name}</td>
                  <td className="py-2 text-accent-gold">{criterion.weight}%</td>
                  <td className="py-2">{criterion.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Every recommendation is produced from scenario-based modeling rather than static jurisdiction rankings. LP tax impact estimates combine asset-geography assumptions, investor profile mappings, treaty relief availability, withholding benchmarks, and pass-through leakage assumptions.
        </p>
      </>
    ),
  },
  {
    id: 'data-sources-by-jurisdiction',
    title: 'Data Sources by Jurisdiction',
    content: (
      <>
        <p>Each jurisdiction&rsquo;s cost, regulatory, and scoring data is sourced from public regulator schedules, licensed service provider quotes, and GNCO-maintained operational surveys.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="py-2 text-left font-semibold">Jurisdiction</th>
                <th className="py-2 text-left font-semibold">Regulator</th>
                <th className="py-2 text-left font-semibold">Cost Data Source</th>
                <th className="py-2 text-left font-semibold">Last Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {JURISDICTIONS.map((j) => (
                <tr key={j.id} className="border-b border-bg-border/50">
                  <td className="py-2 font-medium text-text-primary">{j.flag} {j.name}</td>
                  <td className="py-2">
                    <a href={j.regulatorUrl} target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">
                      {j.regulator}
                    </a>
                  </td>
                  <td className="py-2">{j.sourceNote}</td>
                  <td className="py-2">{j.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: 'what-gnco-does-not-do',
    title: 'What GNCO Does NOT Do',
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>GNCO does not provide legal opinions</li>
        <li>GNCO does not conduct AML or KYC checks</li>
        <li>GNCO does not guarantee cost accuracy — all figures are estimates</li>
        <li>GNCO does not replace licensed legal, tax, or compliance counsel</li>
        <li>GNCO does not perform investor accreditation or suitability checks</li>
      </ul>
    ),
  },
  {
    id: 'update-cadence',
    title: 'Update Cadence',
    content: (
      <>
        <p>Jurisdiction data is reviewed quarterly (March, June, September, December). Regulatory changes trigger an out-of-cycle update within 30 days of publication. All updates are logged in the Changelog.</p>
        <p className="mt-3">Source inputs include public regulator circulars, treaty databases, law firm briefing updates, fund administrator benchmarks, and GNCO-maintained operational surveys. Core metrics are reviewed monthly, while event-driven updates are pushed within 72 hours after material legal or tax announcements.</p>
        <div className="mt-4">
          <DataVersionBadge />
        </div>
      </>
    ),
  },
  {
    id: 'version-history',
    title: 'Version History',
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-border">
              <th className="py-2 text-left font-semibold">Version</th>
              <th className="py-2 text-left font-semibold">Date</th>
              <th className="py-2 text-left font-semibold">Changes</th>
            </tr>
          </thead>
          <tbody>
            {versionHistory.map((entry) => (
              <tr key={entry.version} className="border-b border-bg-border/50">
                <td className="py-2 font-medium text-accent-gold">{entry.version}</td>
                <td className="py-2">{entry.date}</td>
                <td className="py-2">{entry.changes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'performance-calculation-standards',
    title: 'Performance Calculation Standards',
    content:
      'GNCO follows ILPA-aligned definitions: IRR for annualized cashflow return, TVPI for total value to paid-in, DPI for distributed to paid-in, RVPI for residual value to paid-in, and PME for public market equivalent benchmarking. Calculations assume consistent cashflow cutoffs and NAV timestamps across all compared structures.',
  },
  {
    id: 'interpreting-recommendations',
    title: 'How to Interpret Recommendations',
    content:
      'Treat recommendations as decision support, not deterministic prescriptions. Start with the top-ranked structure, compare second-best alternatives for trade-off awareness, then validate assumptions with legal and tax counsel before term sheet or governing document finalization. Outputs rely on assumed fund strategy, manager profile, LP composition, and anticipated cross-border asset flow. Exceptional situations — such as bespoke side letters, sanctions constraints, or unusual investor tax elections — can materially alter results and are not fully represented in baseline scoring.',
  },
]

export function MethodologyPageClient() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true
      track('methodology_page_viewed')
    }
  }, [])

  const sectionIds = useMemo(() => sections.map((section) => section.id), [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActiveSection(visible[0].target.id)
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.15, 0.35, 0.6],
      },
    )

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [sectionIds])

  return (
    <main className="bg-bg-primary px-4 py-12 text-text-primary sm:px-6 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-bg-border bg-bg-surface p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">Table of Contents</p>
            <nav aria-label="Methodology sections">
              <ul className="space-y-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`block rounded-md px-3 py-2 text-sm transition ${
                        activeSection === section.id
                          ? 'bg-accent-gold/15 text-accent-gold'
                          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                      }`}
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <article className="space-y-10 rounded-xl border border-bg-border bg-bg-surface p-6 sm:p-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold sm:text-4xl">Methodology</h1>
            <p className="max-w-3xl text-text-secondary">
              This document outlines the analytical standards behind GNCO recommendations, including scoring logic,
              data sources, performance definitions, update cadence, and interpretation guardrails.
            </p>
            <DataVersionBadge />
          </header>

          {sections.map((section, index) => (
            <section id={section.id} key={section.id} className="scroll-mt-24 space-y-3 border-t border-bg-border pt-6 first:border-t-0 first:pt-0">
              <h2 className="text-2xl font-semibold">
                {index + 1}. {section.title}
              </h2>
              <div className="leading-7 text-text-secondary">{section.content}</div>
            </section>
          ))}
        </article>
      </div>
    </main>
  )
}
