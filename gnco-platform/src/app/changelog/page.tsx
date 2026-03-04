import type { Metadata } from 'next'
import { CHANGELOG, type ChangelogType } from '@/lib/changelog'

export const metadata: Metadata = {
  title: 'Changelog — GNCO',
  description: 'Track all data updates, new features, bug fixes, and regulatory changes to the GNCO platform.',
}

const typeBadge: Record<ChangelogType, { label: string; className: string }> = {
  'data-update': { label: 'Data Update', className: 'bg-accent-gold/15 text-accent-gold' },
  feature: { label: 'Feature', className: 'bg-blue-500/15 text-blue-400' },
  fix: { label: 'Fix', className: 'bg-green-500/15 text-green-400' },
  regulatory: { label: 'Regulatory', className: 'bg-purple-500/15 text-purple-400' },
}

export default function ChangelogPage() {
  return (
    <main className="bg-bg-primary px-6 py-14 text-text-primary">
      <div className="mx-auto max-w-3xl">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Platform</p>
          <h1 className="font-serif text-4xl">Changelog</h1>
          <p className="text-text-secondary">
            All data updates, new features, bug fixes, and regulatory changes to the GNCO platform.
          </p>
        </header>

        <div className="mt-10 space-y-0">
          {CHANGELOG.map((entry, index) => {
            const badge = typeBadge[entry.type]
            return (
              <div key={`${entry.version}-${entry.date}`} className="relative flex gap-6 pb-8">
                {/* Timeline line */}
                {index < CHANGELOG.length - 1 && (
                  <div className="absolute left-[11px] top-8 h-full w-px bg-bg-border" />
                )}
                {/* Timeline dot */}
                <div className="relative mt-1.5 h-6 w-6 shrink-0">
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full border-2 border-accent-gold bg-bg-primary" />
                </div>
                {/* Content */}
                <div className="flex-1 rounded-xl border border-bg-border bg-bg-surface p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-text-primary">{entry.version}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-text-tertiary">{entry.date}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{entry.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
