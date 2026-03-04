'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { COVERAGE_DATA } from '@/data/coverage'
import { Citation } from '@/components/ui/Citation'
import { DataVersionBadge } from '@/components/ui/DataVersionBadge'

export function CoveragePageClient() {
  const [query, setQuery] = useState('')

  const jurisdictions = useMemo(
    () => COVERAGE_DATA.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  )

  return (
    <main className="bg-bg-primary px-4 py-12 text-text-primary sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Coverage</h1>
          <p className="max-w-4xl text-base text-text-secondary sm:text-lg">
            Jurisdiction details are rendered from our structured coverage dataset with explicit cost currency labels,
            timelines, and methodology metadata.
          </p>
          <div className="mt-2">
            <DataVersionBadge />
          </div>
        </section>

        <section className="rounded-xl border border-bg-border bg-bg-surface p-4">
          <label className="space-y-2 text-sm text-text-secondary">
            <span>Search jurisdictions</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g., Cayman, Singapore"
              className="w-full rounded-md border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none ring-accent-gold/40 transition focus:ring-2"
            />
          </label>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jurisdictions.map((jurisdiction) => (
            <article key={jurisdiction.slug} className="rounded-xl border border-bg-border bg-bg-elevated p-5">
              <h2 className="text-xl font-semibold">{jurisdiction.name}</h2>
              <p className="mt-3 text-sm text-text-secondary">
                <Citation source="Service provider estimates" url="/methodology" marker="1">
                  Formation cost: {jurisdiction.formationCostRange}
                </Citation>
              </p>
              <p className="text-sm text-text-secondary">
                <Citation source="Relevant regulator setup guidance" url="/coverage" marker="2">
                  Timeline: {jurisdiction.timelineRange}
                </Citation>
              </p>
              <p className="mt-1 text-xs text-text-tertiary">Confidence: {jurisdiction.confidence}</p>
              <Link
                href={`/coverage/${jurisdiction.slug}`}
                className="mt-4 inline-block text-sm font-medium text-accent-gold transition hover:text-accent-gold-light"
              >
                Details →
              </Link>
            </article>
          ))}

          {!jurisdictions.length && (
            <div className="rounded-xl border border-bg-border bg-bg-elevated p-6 text-sm text-text-secondary md:col-span-2 xl:col-span-3">
              No jurisdictions match your search.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
