'use client'

import { motion } from 'framer-motion'

import Link from 'next/link'

export function RequestAccessCTA() {
  return (
    <section className="border-y border-bg-border bg-bg-elevated py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl px-6 text-center"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
          <p className="text-sm text-text-secondary">Start modeling in minutes →</p>
        </div>
        <h2 className="mt-4 font-serif text-4xl text-text-primary">Start Using GNCO Today</h2>
        <p className="mt-5 text-text-secondary">
          Full platform access is currently free during development. No credit card required. Start modeling fund
          structures in minutes.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/architect"
            className="inline-block rounded-sm bg-accent-gold px-10 py-4 text-lg font-semibold text-bg-primary transition hover:bg-accent-gold-light"
          >
            Launch Architect Engine →
          </Link>
          <Link
            href="/sample-brief"
            className="inline-block rounded-sm border border-accent-gold/40 px-10 py-4 text-lg font-semibold text-accent-gold transition hover:bg-accent-gold/5"
          >
            View Sample Report →
          </Link>
        </div>

        <p className="mt-4 text-xs text-text-tertiary">
          Users get free lifetime access to core features when we launch paid plans in Q3 2026. Your feedback shapes the product.
        </p>
      </motion.div>
    </section>
  )
}
