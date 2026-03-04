'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TEMPLATES, type Template } from '@/lib/templates'

type Strategy = Template['strategy'] | 'All'

const STRATEGIES: Strategy[] = ['All', 'Private Equity', 'Real Estate', 'Venture Capital', 'Private Credit']

const STRATEGY_COLORS: Record<Template['strategy'], string> = {
  'Private Equity': 'bg-[#1B2A4A] text-white',
  'Real Estate': 'bg-accent-gold/20 text-accent-gold',
  'Venture Capital': 'bg-green-900/30 text-green-400',
  'Private Credit': 'bg-slate-700/40 text-slate-300',
}

export default function TemplatesPage() {
  const [activeStrategy, setActiveStrategy] = useState<Strategy>('All')

  const filtered = useMemo(
    () => (activeStrategy === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.strategy === activeStrategy)),
    [activeStrategy],
  )

  return (
    <main className="bg-bg-primary px-4 py-14 text-text-primary sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="space-y-3">
          <h1 className="font-serif text-3xl tracking-tight sm:text-5xl">
            {TEMPLATES.length} Fund Structure Templates
          </h1>
          <p className="max-w-3xl text-base text-text-secondary sm:text-lg">
            {TEMPLATES.length} templates across 4 strategies and 15 jurisdictions. Browse our full library of fund structure templates covering Private Equity, Real Estate, Venture Capital, and Private Credit.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2">
          {STRATEGIES.map((strategy) => (
            <button
              key={strategy}
              onClick={() => setActiveStrategy(strategy)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeStrategy === strategy
                  ? 'bg-accent-gold text-bg-primary'
                  : 'border border-bg-border text-text-secondary hover:border-accent-gold/40 hover:text-text-primary'
              }`}
            >
              {strategy}
              {strategy !== 'All' && (
                <span className="ml-1 opacity-60">
                  ({TEMPLATES.filter((t) => t.strategy === strategy).length})
                </span>
              )}
            </button>
          ))}
        </nav>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <article
              key={template.id}
              className="flex flex-col justify-between rounded-xl border border-bg-border bg-bg-surface p-5 transition hover:border-accent-gold/30"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{template.flag}</span>
                  <span className="text-sm text-text-secondary">{template.jurisdiction}</span>
                </div>
                <h2 className="mt-2 font-semibold text-text-primary">{template.name}</h2>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STRATEGY_COLORS[template.strategy]}`}
                >
                  {template.strategy}
                </span>
                <p className="mt-3 text-sm text-text-secondary">{template.description}</p>
              </div>
              <Link
                href="/architect"
                className="mt-4 inline-block text-sm font-medium text-accent-gold transition hover:text-accent-gold-light"
              >
                Use in Architect Engine →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
