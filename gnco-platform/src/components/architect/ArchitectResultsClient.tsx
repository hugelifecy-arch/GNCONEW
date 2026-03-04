'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { AttorneyBrief } from '@/components/AttorneyBrief'
import { generateRecommendations } from '@/lib/architect-logic'
import { JURISDICTIONS } from '@/lib/jurisdiction-data'
import type { ArchitectBrief } from '@/lib/types'
import { Citation } from '@/components/ui/Citation'
import { DataVersionBadge } from '@/components/ui/DataVersionBadge'
import { EmailCaptureForm } from '@/components/architect/EmailCaptureForm'
import { track } from '@/lib/analytics'

const WIZARD_STORAGE_KEY = 'gnco:architect-brief'

const methodologyWeights = {
  taxFriction: 25,
  lpFamiliarity: 20,
  timeToClose: 15,
  cost: 15,
}

const redFlagRules: { id: string; text: string; match: (brief: Partial<ArchitectBrief>) => boolean }[] = [
  { id: 'rf-1', text: 'US tax-exempt LPs may require blocker analysis for UBTI/ECI exposure.', match: (brief) => brief.lpProfile?.includes('us-tax-exempt') ?? false },
  { id: 'rf-2', text: 'Mixed LP bases often need side-letter governance and disclosure controls.', match: (brief) => brief.lpProfile?.includes('mixed') ?? false },
  { id: 'rf-3', text: 'Aggressive launch timelines can constrain regulator review and provider onboarding.', match: (brief) => brief.timeline === '30-days' },
  { id: 'rf-4', text: 'First-time managers typically face enhanced diligence from administrators and banks.', match: (brief) => brief.experience === 'first-fund' },
  { id: 'rf-5', text: 'EU-focused deployment may require AIFMD marketing or equivalent access planning.', match: (brief) => brief.assetGeography?.includes('Europe') ?? false },
  { id: 'rf-6', text: 'US asset focus can increase state/federal filing touchpoints for non-US structures.', match: (brief) => brief.assetGeography?.includes('North America') ?? false },
  { id: 'rf-7', text: 'Middle East LP participation may require bespoke investor onboarding workflows.', match: (brief) => brief.lpProfile?.includes('middle-eastern') ?? false },
  { id: 'rf-8', text: 'Family office-heavy raises often require tailored reporting cadences and rights.', match: (brief) => brief.lpProfile?.includes('family-office') ?? false },
  { id: 'rf-9', text: 'Tax-efficiency priority should be validated with treaty-by-treaty withholding analysis.', match: (brief) => brief.priorities?.includes('tax-efficiency') ?? false },
  { id: 'rf-10', text: 'Speed-to-close priority can trade off with jurisdictional familiarity for some LPs.', match: (brief) => brief.priorities?.includes('speed-to-close') ?? false },
  { id: 'rf-11', text: 'Regulatory simplicity priority should be checked against local substance requirements.', match: (brief) => brief.priorities?.includes('regulatory-simplicity') ?? false },
  { id: 'rf-12', text: 'Fundraising flexibility assumptions should be stress-tested for future vehicle expansion.', match: (brief) => brief.priorities?.includes('fundraising-flexibility') ?? false },
]

function getSavedBrief(): Partial<ArchitectBrief> | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as Partial<ArchitectBrief>
  } catch {
    return null
  }
}

function formatPriority(priority: string) {
  return priority.replaceAll('-', ' ')
}

export function ArchitectResultsClient() {
  const [brief] = useState<Partial<ArchitectBrief> | null>(() => getSavedBrief())
  const [tradeoffs, setTradeoffs] = useState({ cost: 50, time: 50, familiarity: 50, taxFriction: 50 })
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const topThree = useMemo(() => {
    if (!brief) return []
    return generateRecommendations(brief as ArchitectBrief, JURISDICTIONS).slice(0, 3)
  }, [brief])

  const flags = useMemo(() => {
    if (!brief) return []
    return redFlagRules.filter((rule) => rule.match(brief))
  }, [brief])

  const topPriorities = (brief?.priorities ?? []).slice(0, 3).map(formatPriority)

  const hasTracked = useRef(false)
  useEffect(() => {
    if (!hasTracked.current && topThree.length > 0) {
      hasTracked.current = true
      track('architect_engine_completed', {
        top_jurisdiction: topThree[0]?.jurisdiction,
        fund_size: brief?.fundSize,
        strategy: brief?.strategy,
      })
    }
  }, [topThree, brief])


  if (!brief) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        <h1 className="font-serif text-4xl">Architect Results</h1>
        <p className="text-text-secondary">No wizard input found. Complete the architect wizard first.</p>
        <Link href="/architect" className="text-accent-gold">Go to Architect Wizard →</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-14">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl">Architect Results</h1>
        <p className="text-sm text-text-secondary">Top 3 structures are shown below. Ranking order is currently static while ranking logic is in progress.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {topThree.map((result) => (
          <article key={result.rank} className="rounded-xl border border-bg-border bg-bg-surface p-5">
            <p className="text-xs uppercase tracking-wider text-text-secondary">Rank #{result.rank}</p>
            <h2 className="mt-2 text-2xl font-semibold">{result.jurisdiction}</h2>
            <p className="text-sm text-text-secondary">{result.vehicleType}</p>
            <p className="mt-2 text-sm text-text-secondary">{result.reasoning}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-semibold">Trade-off sliders</h2>
        <p className="mt-1 text-sm text-text-secondary">Adjust your preferred emphasis. Ranking logic is in progress, so card ordering remains static for now.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Slider label="Cost" value={tradeoffs.cost} onChange={(value) => setTradeoffs((prev) => ({ ...prev, cost: value }))} />
          <Slider label="Time" value={tradeoffs.time} onChange={(value) => setTradeoffs((prev) => ({ ...prev, time: value }))} />
          <Slider label="LP familiarity" value={tradeoffs.familiarity} onChange={(value) => setTradeoffs((prev) => ({ ...prev, familiarity: value }))} />
          <Slider label="Tax friction" value={tradeoffs.taxFriction} onChange={(value) => setTradeoffs((prev) => ({ ...prev, taxFriction: value }))} />
        </div>
      </section>

      <section className="rounded-xl border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-semibold">Why this ranked #1</h2>
        <p className="mt-3 text-sm text-text-secondary">
          <Citation source="GNCO methodology weighting framework" url="/methodology" marker="4">
            The methodology currently weights tax efficiency ({methodologyWeights.taxFriction}%), LP familiarity ({methodologyWeights.lpFamiliarity}%), speed to close ({methodologyWeights.timeToClose}%), and cost of formation ({methodologyWeights.cost}%) as core factors.
          </Citation>{' '}
          Your current slider priorities emphasize cost ({tradeoffs.cost}%), time ({tradeoffs.time}%), LP familiarity ({tradeoffs.familiarity}%), and tax friction ({tradeoffs.taxFriction}%).
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          User-indicated priorities: {topPriorities.length ? topPriorities.join(', ') : 'No explicit priorities selected'}.
        </p>
      </section>

      <section className="rounded-xl border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-semibold">Red flag engine (flag-only)</h2>
        <p className="mt-2 text-sm text-text-secondary">These are directional risk flags only and not legal, tax, or regulatory advice.</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary">
          {flags.map((flag) => (
            <li key={flag.id}>{flag.text}</li>
          ))}
        </ul>
      </section>

      {!emailSubmitted ? (
        <EmailCaptureForm
          fundStrategy={brief.strategy}
          fundSize={brief.fundSize}
          topJurisdiction={topThree[0]?.jurisdiction}
          onSuccess={() => setEmailSubmitted(true)}
        />
      ) : (
        <AttorneyBrief brief={brief} recommendations={topThree} />
      )}

      <div className="mt-6 text-center">
        <DataVersionBadge />
      </div>
    </main>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-1 text-sm text-text-secondary">
      <span>{label}: {value}</span>
      <input type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full" />
    </label>
  )
}
