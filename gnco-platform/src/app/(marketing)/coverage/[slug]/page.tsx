import Link from 'next/link'
import { notFound } from 'next/navigation'

import CitationsList from '@/components/CitationsList'
import DataFreshnessBanner from '@/components/DataFreshnessBanner'
import { getCoverageBySlug } from '@/data/coverage'
import { Citation } from '@/components/ui/Citation'

export default function CoverageDetailPage({ params }: { params: { slug: string } }) {
  const coverage = getCoverageBySlug(params.slug)

  if (!coverage) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-14">
      <Link href="/coverage" className="text-sm text-accent-gold">
        ← Back to coverage
      </Link>

      <section className="rounded-xl border border-bg-border bg-bg-surface p-6">
        <h1 className="font-serif text-4xl">{coverage.name}</h1>
        <div className="mt-4">
          <DataFreshnessBanner
            lastVerifiedDate={coverage.lastVerifiedDate}
            jurisdictionName={coverage.name}
          />
        </div>
        <p className="mt-4 text-sm text-text-secondary">
          <Citation source="Service provider estimates" url="/methodology" marker="1">
            Formation cost range: {coverage.formationCostRange}
          </Citation>
        </p>
        <p className="text-sm text-text-secondary">
          <Citation source="Relevant regulator setup guidance" url="/coverage" marker="2">
            Formation timeline: {coverage.timelineRange}
          </Citation>
        </p>
      </section>

      <section className="grid gap-4 rounded-xl border border-bg-border bg-bg-surface p-6 md:grid-cols-2">
        <ListBlock title="Included" items={coverage.included} />
        <ListBlock title="Excluded" items={coverage.excluded} />
      </section>

      <section className="rounded-xl border border-bg-border bg-bg-surface p-6">
        <h2 className="text-lg font-semibold">Sources & methodology</h2>
        <p className="mt-3 text-sm text-text-secondary">Last updated: {coverage.lastUpdated}</p>
        <p className="text-sm text-text-secondary">Confidence: {coverage.confidence}</p>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">Source types</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
          {coverage.sourceTypes.map((sourceType) => (
            <li key={sourceType}>{sourceType}</li>
          ))}
        </ul>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">Change log</h3>
        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
          {(coverage.changeLog ?? []).map((entry) => (
            <li key={`${entry.date}-${entry.note}`}>
              {entry.date}: {entry.note}
            </li>
          ))}
        </ul>
      </section>

      <CitationsList citations={coverage.citations} />
    </main>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
