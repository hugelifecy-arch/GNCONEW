'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { JURISDICTIONS } from '@/lib/jurisdiction-data'

const headlineWords = 'The Fund Structure Decision That Takes 6 Weeks — Made in 30 Minutes.'.split(' ')

function StatsStrip() {
  return (
    <div className="mt-16 text-center">
      <p className="font-serif text-2xl text-accent-gold md:text-3xl">
        {JURISDICTIONS.length} Jurisdictions · 52 Templates ·{' '}
        Under 30 min — Avg. time to full recommendation ·{' '}
        <a href="https://ilpa.org/reporting-template/" target="_blank" rel="noopener noreferrer">
          ILPA-Aligned ↗
        </a>
      </p>
    </div>
  )
}

function ValueBullets() {
  const bullets = [
    'Cut pre-formation legal costs by up to €50,000+ — enter counsel with a data-backed recommendation, not a blank brief.',
    'Model your exact LP base — GNCO calculates withholding tax impact for up to 50 LPs by domicile, so you optimize for your investors, not averages.',
    `${JURISDICTIONS.length} jurisdictions · 52 templates · one platform — from Cayman and Luxembourg to Cyprus and Singapore.`,
  ]

  return (
    <motion.ul
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mx-auto mt-8 max-w-2xl space-y-4 text-left"
    >
      {bullets.map((bullet, index) => (
        <li key={index} className="flex items-start gap-3 text-sm text-text-secondary md:text-base">
          <span className="mt-0.5 shrink-0 text-accent-gold">✓</span>
          <span>{bullet}</span>
        </li>
      ))}
    </motion.ul>
  )
}

export function HeroSection() {
  return (
    <section className="hero-grid-bg relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 85%, rgba(10, 22, 40, 0.95) 0%, rgba(10, 22, 40, 0.55) 35%, transparent 70%)',
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        {[
          { left: '18%', top: '26%', delay: 0 },
          { left: '74%', top: '20%', delay: 2.2 },
          { left: '30%', top: '72%', delay: 1.1 },
          { left: '84%', top: '60%', delay: 3 },
        ].map((dot, idx) => (
          <motion.span
            key={idx}
            className="absolute h-1.5 w-1.5 rounded-full bg-accent-gold/70"
            style={{ left: dot.left, top: dot.top }}
            animate={{ y: [0, -14, 0], opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: dot.delay }}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          className="mb-6 font-sans text-xs uppercase tracking-[0.3em] text-accent-gold"
        >
          INSTITUTIONAL FUND ARCHITECTURE
        </motion.p>

        <h1 className="font-serif text-5xl leading-tight tracking-normal whitespace-normal text-text-primary md:text-7xl">
          {headlineWords.map((word, index) => (
            <span key={`${word}-${index}`}>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + index * 0.05 }}
              >
                {word}
              </motion.span>
              {index < headlineWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-6 max-w-3xl text-lg text-text-secondary md:text-xl"
        >
          GNCO models your optimal fund structure across {JURISDICTIONS.length} global jurisdictions, quantifies LP-level tax impact, and generates your attorney brief — before you spend a euro on legal fees.
        </motion.p>

        <ValueBullets />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/architect"
            className="w-full rounded-sm bg-accent-gold px-8 py-4 font-semibold text-bg-primary transition hover:bg-accent-gold-light sm:w-auto"
          >
            Start Free →
          </Link>
          <Link
            href="/methodology"
            className="w-full rounded-sm border border-accent-gold/40 px-8 py-4 text-accent-gold transition hover:bg-accent-gold/5 sm:w-auto"
          >
            View Methodology →
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-4 text-sm text-text-tertiary"
        >
          No credit card required · Free during Open Beta · Paid plans Q3 2026
        </motion.p>

        <StatsStrip />
      </div>
    </section>
  )
}
