'use client'

import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Building2, Check, Copy, Download, Loader2, Plus, RotateCcw, Share2, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { generateRecommendations } from '@/lib/architect-logic'
import { exportArchitectResults } from '@/lib/excel-export'
import { JURISDICTIONS } from '@/lib/jurisdiction-data'
import { trackEvent } from '@/lib/analytics'
import type { ArchitectBrief, FundStructureRecommendation } from '@/lib/types'
import { cn, formatCurrency } from '@/lib/utils'
import { Citation } from '@/components/ui/Citation'

import { BookCallCTA } from './BookCallCTA'

interface RecommendationPanelProps {
  brief: ArchitectBrief
  onStartNew: () => void
}

interface TaxRow {
  id: string
  lpType: string
  domicile: string
  commitment: number
}

const lpTypePresets = ['US Family Office', 'US Pension', 'EU Insurance', 'Sovereign Wealth', 'Endowment']

function scoreBar(score: number) {
  return '█'.repeat(Math.max(1, Math.round(score / 10))) + '░'.repeat(10 - Math.max(1, Math.round(score / 10)))
}

function estimateTaxImpact(jurisdiction: string, domicile: string, lpType: string): number {
  let base = 24
  if (jurisdiction.includes('Cayman') || jurisdiction.includes('Mauritius')) base -= 4
  if (jurisdiction.includes('Luxembourg') || jurisdiction.includes('Netherlands')) base -= 2
  if (domicile.toLowerCase().includes('new york') || domicile.toLowerCase().includes('united states')) base += 2
  if (lpType.toLowerCase().includes('sovereign') || lpType.toLowerCase().includes('pension')) base -= 3
  return Math.min(35, Math.max(8, base))
}

function generateSimplePdf(filename: string, lines: string[]) {
  const content = lines.join('\n').replace(/[()]/g, '')
  const stream = `BT /F1 10 Tf 50 760 Td (${content.replace(/\n/g, ') Tj T* (')}) Tj ET`
  const pdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000243 00000 n \n0000000313 00000 n \ntrailer << /Root 1 0 R /Size 6 >>\nstartxref\n${350 + stream.length}\n%%EOF`
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}


interface ShareResultsButtonProps {
  results: Record<string, unknown>
}

export function ShareResultsButton({ results }: ShareResultsButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    setIsSharing(true)

    try {
      const response = await fetch('/api/architect/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      })
      const data = (await response.json()) as { success?: boolean; shareUrl?: string }

      if (data.success && data.shareUrl) {
        setShareUrl(data.shareUrl)
      }
    } catch (error) {
      console.error('Failed to generate share link:', error)
    } finally {
      setIsSharing(false)
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="">
      {!shareUrl ? (
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2 rounded-sm border border-accent-gold/30 bg-bg-elevated px-6 py-3 text-accent-gold transition-all hover:bg-accent-gold/5 disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          {isSharing ? 'Generating link...' : 'Share Results with Team'}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Share this link with your co-founders, legal counsel, or team:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-sm border border-bg-border bg-bg-surface px-4 py-2 text-sm text-text-primary focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-sm bg-accent-gold px-4 py-2 text-bg-primary transition-all hover:bg-accent-gold-light"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-text-tertiary">Anyone with this link can view your results (read-only)</p>
        </div>
      )}
    </div>
  )
}

export function RecommendationPanel({ brief, onStartNew }: RecommendationPanelProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<FundStructureRecommendation[]>([])
  const [taxRows, setTaxRows] = useState<TaxRow[]>([{ id: crypto.randomUUID(), lpType: 'US Family Office', domicile: 'New York', commitment: 50000000 }])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecommendations(generateRecommendations(brief, JURISDICTIONS))
      setIsLoading(false)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [brief])

  const primary = recommendations[0]
  const alternatives = recommendations.slice(1)

  const sharePayload = useMemo(() => ({
    brief,
    recommendations,
    primary,
    alternatives,
    taxRows,
  }), [alternatives, brief, primary, recommendations, taxRows])

  const blendedScore = useMemo(() => {
    if (!primary || taxRows.length === 0) return 0
    const totalCommitment = taxRows.reduce((sum, row) => sum + row.commitment, 0)
    if (totalCommitment === 0) return 0
    const weightedTax = taxRows.reduce((sum, row) => {
      const impact = estimateTaxImpact(primary.jurisdiction, row.domicile, row.lpType)
      return sum + impact * row.commitment
    }, 0)
    return Math.round(100 - weightedTax / totalCommitment)
  }, [primary, taxRows])

  const handleJurisdictionSelected = (jurisdiction: string) => {
    trackEvent('jurisdiction_selected', {
      jurisdiction,
      rank: recommendations.findIndex((rec) => rec.jurisdiction === jurisdiction) + 1,
      allRecommendations: recommendations.map((rec) => rec.jurisdiction),
    })
  }

  const swapPrimary = (rank: 2 | 3) => {
    const idx = recommendations.findIndex((rec) => rec.rank === rank)
    if (idx < 0) return
    const selected = recommendations[idx]

    if (selected) {
      handleJurisdictionSelected(selected.jurisdiction)
    }

    const next = [...recommendations]
    ;[next[0], next[idx]] = [next[idx], next[0]]
    setRecommendations(next.map((item, i) => ({ ...item, rank: (i + 1) as 1 | 2 | 3 })))
  }

  const handleExcelExport = () => {
    exportArchitectResults(recommendations, brief)
    trackEvent('excel_exported', {
      topJurisdiction: recommendations[0]?.jurisdiction,
      recommendationCount: recommendations.length,
    })
  }

  const handleBookCall = () => {
    trackEvent('strategy_call_clicked', {
      topJurisdiction: recommendations[0]?.jurisdiction,
    })
  }

  const exportPdf = () => {
    if (!primary) return
    generateSimplePdf('pre-legal-brief.pdf', [
      'PRE-LEGAL STRUCTURING BRIEF',
      `Generated: ${format(new Date(), 'PPP p')}`,
      `Primary: ${primary.jurisdiction} - ${primary.vehicleType}`,
      `Reasoning: ${primary.reasoning}`,
      `Cost: ${formatCurrency(primary.estimatedFormationCost.min, true)}-${formatCurrency(primary.estimatedFormationCost.max, true)}`,
      `Timeline: ${primary.estimatedTimelineWeeks.min}-${primary.estimatedTimelineWeeks.max} weeks`,
      'Key decisions requiring legal input: investor eligibility, blocker design, governance rights, side letter policy.',
      'Open questions: LP-specific tax treaty treatment, carried interest allocation, ESG disclosure obligations.',
      `Suggested firms: ${JURISDICTIONS.find((j) => j.name === primary.jurisdiction)?.keyServiceProviders.lawFirms.slice(0, 2).join(', ') ?? 'Specialist counsel'}`,
    ])
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[76vh] flex-col items-center justify-center rounded-xl border border-bg-border bg-bg-surface p-10">
        <Loader2 className="h-12 w-12 animate-spin text-accent-gold" />
        <p className="mt-4 text-lg">{`Analyzing ${JURISDICTIONS.length} jurisdictions...`}</p>
        <div className="mt-8 h-2 w-full max-w-md overflow-hidden rounded-full bg-bg-border">
          <motion.div className="h-full bg-accent-gold" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2 }} />
        </div>
      </div>
    )
  }

  if (!primary) return null

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-accent-gold/60 bg-bg-surface p-6 shadow-gold">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent-gold"><Star className="h-4 w-4" />RECOMMENDED PRIMARY STRUCTURE</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif">{primary.jurisdiction}</h2>
            <p className="text-text-secondary">{primary.vehicleType}</p>
            <p className="mt-1 text-2xl">{JURISDICTIONS.find((j) => j.name === primary.jurisdiction)?.flag ?? '🌍'}</p>
          </div>
          <div className="rounded-lg border border-bg-border bg-bg-elevated px-4 py-2 text-xl font-semibold">Score: {primary.scores.overallScore}</div>
        </div>
        <p className="mt-5 max-w-4xl text-text-secondary">{primary.reasoning}</p>
        <p className="mt-4 text-sm text-text-secondary">
          <Citation source="Service provider estimates" url="/methodology" marker="1">
            Est. Formation Cost: {formatCurrency(primary.estimatedFormationCost.min, true)}–{formatCurrency(primary.estimatedFormationCost.max, true)}
          </Citation>{' '}
          |{' '}
          <Citation source="Relevant regulator setup guidance" url="/coverage" marker="2">
            Est. Timeline: {primary.estimatedTimelineWeeks.min}–{primary.estimatedTimelineWeeks.max} wks
          </Citation>
        </p>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <Citation source="Relevant tax authority and treaty references" url="/disclosures" marker="3">
              Tax Efficiency: {scoreBar(primary.scores.taxEfficiency)} {primary.scores.taxEfficiency}
            </Citation>
          </p>
          <p>LP Familiarity: {scoreBar(primary.scores.lpFamiliarity)} {primary.scores.lpFamiliarity}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {alternatives.map((rec) => (
          <article key={rec.rank} className="rounded-xl border border-bg-border bg-bg-surface p-5">
            <p className="text-xs tracking-[0.2em] text-text-secondary">RANK {rec.rank}</p>
            <h3 className="mt-2 text-2xl font-serif">{rec.jurisdiction}</h3>
            <p className="text-sm text-text-secondary">{rec.vehicleType} · Score {rec.scores.overallScore}</p>
            <p className="mt-3 text-sm text-text-secondary">{rec.reasoning}</p>
            <button onClick={() => swapPrimary(rec.rank as 2 | 3)} className="mt-4 rounded-md border border-accent-gold px-3 py-2 text-sm text-accent-gold">Set as Primary</button>
          </article>
        ))}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          onClick={handleExcelExport}
          className="flex items-center gap-2 rounded-sm bg-accent-gold px-6 py-3 font-semibold text-bg-primary transition-all hover:bg-accent-gold-light"
        >
          <Download className="h-4 w-4" />
          Download Excel Report
        </button>

        <button
          onClick={exportPdf}
          className="flex items-center gap-2 rounded-sm border border-accent-gold/30 bg-bg-elevated px-6 py-3 text-accent-gold transition-all hover:bg-accent-gold/5"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>

        <ShareResultsButton results={sharePayload} />
      </div>

      <BookCallCTA onBookCallClick={handleBookCall} />

      <section className="rounded-xl border border-bg-border bg-bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">LP TAX IMPACT MODELER</h3>
          <button
            onClick={() => setTaxRows((prev) => [...prev, { id: crypto.randomUUID(), lpType: 'US Family Office', domicile: '', commitment: 10000000 }])}
            className="inline-flex items-center gap-2 rounded-md border border-bg-border px-3 py-2 text-sm"
          >
            <Plus className="h-4 w-4" /> Add LP +
          </button>
        </div>
        <div className="space-y-2">
          {taxRows.map((row) => {
            const taxImpact = estimateTaxImpact(primary.jurisdiction, row.domicile, row.lpType)
            return (
              <div key={row.id} className="grid grid-cols-12 gap-2">
                <select value={row.lpType} onChange={(e) => setTaxRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, lpType: e.target.value } : item)))} className="col-span-3 rounded-md border border-bg-border bg-bg-elevated px-2 py-2 text-sm">
                  {lpTypePresets.map((type) => <option key={type}>{type}</option>)}
                </select>
                <input value={row.domicile} onChange={(e) => setTaxRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, domicile: e.target.value } : item)))} placeholder="Domicile" className="col-span-3 rounded-md border border-bg-border bg-bg-elevated px-2 py-2 text-sm" />
                <input type="number" value={row.commitment} onChange={(e) => setTaxRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, commitment: Number(e.target.value) } : item)))} className="col-span-3 rounded-md border border-bg-border bg-bg-elevated px-2 py-2 text-sm" />
                <div className="col-span-2 flex items-center text-sm">
                  <Citation source="Relevant tax authority and treaty references" url="/disclosures" marker="3">
                    {taxImpact.toFixed(1)}% effective
                  </Citation>
                </div>
                <button onClick={() => setTaxRows((prev) => prev.filter((item) => item.id !== row.id))} className="col-span-1 rounded-md border border-bg-border text-sm">×</button>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-sm">Blended Portfolio Tax Efficiency: {blendedScore}/100 {scoreBar(blendedScore)}</p>
        <p className="mt-2 text-xs text-text-secondary">Rule-based estimate for planning only. Not legal or tax advice.</p>
      </section>

      <section className="rounded-xl border border-bg-border bg-bg-surface p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">PRE-LEGAL STRUCTURING BRIEF</h3>
          <div className="flex gap-2">
            <button onClick={handleExcelExport} className="inline-flex items-center gap-1 rounded-md border border-bg-border px-3 py-2 text-sm"><Download className="h-4 w-4" />Download Excel</button>
            <button onClick={exportPdf} className="inline-flex items-center gap-1 rounded-md border border-bg-border px-3 py-2 text-sm"><Download className="h-4 w-4" />PDF</button>
          </div>
        </div>
        <p className="text-xs text-text-secondary">Generated: {format(new Date(), 'PPP p')}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text-secondary">
          <li><span className="text-text-primary">Recommended Structure Summary:</span> {primary.reasoning}</li>
          <li><span className="text-text-primary">Key Decisions Requiring Legal Input:</span> blocker selection, governance rights, and side letter framework.</li>
          <li>
            <span className="text-text-primary">Estimated Budget:</span>{' '}
            <Citation source="Service provider estimates" url="/methodology" marker="1">
              {formatCurrency(primary.estimatedFormationCost.min, true)}–{formatCurrency(primary.estimatedFormationCost.max, true)} plus local admin.
            </Citation>
          </li>
          <li><span className="text-text-primary">Open Questions to Resolve:</span> treaty qualification, VAT, and reporting obligations.</li>
          <li><span className="text-text-primary">Suggested Specialist Firms:</span> {JURISDICTIONS.find((j) => j.name === primary.jurisdiction)?.keyServiceProviders.lawFirms.slice(0, 3).join(', ')}</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleExcelExport} className="rounded-md border border-accent-gold px-4 py-2 text-sm text-accent-gold">Download as Excel</button>
        <button onClick={exportPdf} className="rounded-md border border-accent-gold px-4 py-2 text-sm text-accent-gold">Download as PDF</button>
        <button onClick={onStartNew} className="inline-flex items-center gap-2 rounded-md border border-bg-border px-4 py-2 text-sm"><RotateCcw className="h-4 w-4" />Start New Analysis</button>
      </div>
    </div>
  )
}
