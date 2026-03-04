'use client'

import { Download, Info, Plus, Share2, Save } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'

import { JURISDICTIONS } from '@/lib/jurisdiction-data'
import { cn } from '@/lib/utils'
import { usePrivacyMode } from '@/components/shared/PrivacyModeContext'
import { Citation } from '@/components/ui/Citation'

type LPMix = {
  institutional: number
  familyOffice: number
  sovereign: number
}

type CompareInput = {
  fundSize: number
  strategy: 'buyout' | 'venture' | 'credit' | 'infrastructure'
  lpMix: LPMix
}

type ComparisonColumn = {
  jurisdictionId: string
  vehicle: string
}

type MetricResult = {
  formationCost: number
  annualCost: number
  timeline: string
  taxAtFundLevel: string
  lpWithholding: number
  regulatoryBurden: number
  lpFamiliarity: number
  euMarketing: 'YES' | 'NO' | 'NPPR'
  providers: string[]
  overallScore: number
  why: Record<string, string>
}

const strategies: CompareInput['strategy'][] = ['buyout', 'venture', 'credit', 'infrastructure']

const marketingAccess: Record<string, 'YES' | 'NO' | 'NPPR'> = {
  Luxembourg: 'YES',
  Ireland: 'YES',
  Netherlands: 'YES',
  Jersey: 'NPPR',
  Guernsey: 'NPPR',
}

function getMetricForColumn(input: CompareInput, column: ComparisonColumn): MetricResult {
  const jurisdiction = JURISDICTIONS.find((item) => item.id === column.jurisdictionId) ?? JURISDICTIONS[0]
  const sizeFactor = Math.max(0.8, Math.min(1.5, input.fundSize / 250_000_000))
  const strategyFactor =
    input.strategy === 'venture' ? 0.9 : input.strategy === 'credit' ? 1.15 : input.strategy === 'infrastructure' ? 1.25 : 1

  const formationCost = Math.round(((jurisdiction.formationCostRange.min + jurisdiction.formationCostRange.max) / 2) * sizeFactor * strategyFactor)
  const annualCost = Math.round(((jurisdiction.annualCostRange.min + jurisdiction.annualCostRange.max) / 2) * (0.7 + sizeFactor / 2))
  const lpWithholding = Math.round(
    input.lpMix.institutional * (jurisdiction.taxTreatyStrength === 'high' ? 11 : jurisdiction.taxTreatyStrength === 'medium' ? 16 : 21) +
      input.lpMix.familyOffice * 18 +
      input.lpMix.sovereign * 9
  )

  const regulatoryBurden = Math.min(10, Math.max(1, Math.round((jurisdiction.setupTimeWeeks.max / 3 + (annualCost > 100000 ? 3 : 1.5)) * 0.8)))
  const lpFamiliarity = Math.min(10, Math.max(1, Math.round((jurisdiction.bestFor.length + (jurisdiction.region === 'europe' ? 2 : 1)) * 1.4)))

  const euMarketing = marketingAccess[jurisdiction.name] || (jurisdiction.region === 'europe' ? 'NPPR' : 'NO')
  const fundTax = jurisdiction.taxTreatyStrength === 'high' ? 'Low with treaty support' : jurisdiction.taxTreatyStrength === 'medium' ? 'Moderate / structure dependent' : 'Neutral low-tax base'

  const overallScore = Math.round(
    100 -
      (formationCost / 7000 + annualCost / 18000 + regulatoryBurden * 2.2 + lpWithholding * 0.8) +
      lpFamiliarity * 3.3 +
      (euMarketing === 'YES' ? 9 : euMarketing === 'NPPR' ? 4 : 0)
  )

  return {
    formationCost,
    annualCost,
    timeline: `${jurisdiction.setupTimeWeeks.min}-${jurisdiction.setupTimeWeeks.max} weeks`,
    taxAtFundLevel: fundTax,
    lpWithholding,
    regulatoryBurden,
    lpFamiliarity,
    euMarketing,
    providers: [...jurisdiction.keyServiceProviders.lawFirms.slice(0, 1), ...jurisdiction.keyServiceProviders.administrators.slice(0, 1), ...jurisdiction.keyServiceProviders.auditors.slice(0, 1)],
    overallScore: Math.max(25, Math.min(95, overallScore)),
    why: {
      formationCost: 'Uses midpoint formation range, adjusted for fund size and strategy complexity.',
      annualCost: 'Based on jurisdiction annual range and scaled by expected operating footprint.',
      timeline: 'Directly mapped from known setup time ranges for the selected jurisdiction.',
      taxAtFundLevel: 'Derived from treaty strength and jurisdiction tax profile.',
      lpWithholding: 'Weighted average by LP mix and treaty strength assumptions.',
      regulatoryBurden: 'Proxy score combining timeline and compliance-heavy annual spend.',
      lpFamiliarity: 'Proxy score based on institutional adoption signals and region familiarity.',
      euMarketing: 'Estimated from EU domicile, passport access, or NPPR pathways.',
      providers: 'Top suggested legal, admin, and audit providers from coverage data.',
      overallScore: 'Blended GNCO score that rewards familiarity/access and penalizes cost + complexity.',
    },
  }
}

export function ComparisonWorkspace() {
  const { formatPrivate, isPrivacyMode } = usePrivacyMode()
  const [input, setInput] = useState<CompareInput>({ fundSize: 250_000_000, strategy: 'buyout', lpMix: { institutional: 0.6, familyOffice: 0.25, sovereign: 0.15 } })
  const [columns, setColumns] = useState<ComparisonColumn[]>([
    { jurisdictionId: 'luxembourg', vehicle: 'RAIF' },
    { jurisdictionId: 'cayman-islands', vehicle: 'Exempted Limited Partnership (ELP)' },
  ])
  const [expandedCell, setExpandedCell] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'absolute' | 'relative'>('absolute')
  const [shareUrl, setShareUrl] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const results = useMemo(() => columns.map((col) => ({ ...col, metrics: getMetricForColumn(input, col) })), [columns, input])

  const radarData = results.map((result) => ({
    name: JURISDICTIONS.find((j) => j.id === result.jurisdictionId)?.name.split(' ')[0] || result.jurisdictionId,
    Cost: Math.max(1, 100 - Math.round((result.metrics.formationCost + result.metrics.annualCost) / 2500)),
    Timeline: Math.max(1, 100 - Number(result.metrics.timeline.split('-')[1].split(' ')[0]) * 3),
    Tax: Math.max(1, 100 - result.metrics.lpWithholding * 2),
    Regulatory: Math.max(1, 100 - result.metrics.regulatoryBurden * 8),
    Familiarity: result.metrics.lpFamiliarity * 10,
    Score: result.metrics.overallScore,
  }))

  const canAdd = columns.length < 3

  const addColumn = () => {
    if (!canAdd) return
    const fallback = JURISDICTIONS.find((j) => !columns.some((c) => c.jurisdictionId === j.id)) || JURISDICTIONS[0]
    setColumns((prev) => [...prev, { jurisdictionId: fallback.id, vehicle: fallback.primaryVehicles[0] }])
  }

  const updateColumn = (index: number, jurisdictionId: string) => {
    const jurisdiction = JURISDICTIONS.find((j) => j.id === jurisdictionId) || JURISDICTIONS[0]
    setColumns((prev) => prev.map((item, i) => (i === index ? { jurisdictionId, vehicle: jurisdiction.primaryVehicles[0] } : item)))
  }

  const saveComparison = async () => {
    const response = await fetch('/api/compare/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Compare ${new Date().toLocaleDateString()}`,
        columns: results.map((result) => result.jurisdictionId),
        scoreSummary: Math.round(results.reduce((sum, result) => sum + result.metrics.overallScore, 0) / results.length),
        payload: { input, columns: results },
      }),
    })
    setMessage(response.ok ? 'Comparison saved to dashboard.' : 'Could not save comparison.')
  }

  const shareComparison = async () => {
    const response = await fetch('/api/compare/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: { input, columns: results }, password: password || undefined }),
    })
    const data = (await response.json()) as { shareUrl?: string; success?: boolean }
    if (data.success && data.shareUrl) {
      setShareUrl(data.shareUrl)
      setMessage('Read-only link generated.')
      return
    }
    setMessage('Unable to create share link.')
  }

  const exportPdf = () => {
    const lines = [
      'GNCO COMPARISON SUMMARY',
      `Fund size: ${formatPrivate(input.fundSize, 'currency')}`,
      `Strategy: ${input.strategy}`,
      ...results.map((result) => {
        const jurisdiction = JURISDICTIONS.find((item) => item.id === result.jurisdictionId)?.name || result.jurisdictionId
        return `${formatPrivate(jurisdiction, 'name', 'fund')} (${result.vehicle}) | Score ${result.metrics.overallScore} | Formation ${formatPrivate(result.metrics.formationCost, 'currency')} | Annual ${formatPrivate(result.metrics.annualCost, 'currency')}`
      }),
    ]
    const watermark = isPrivacyMode ? '1 0 0 1 150 420 Tm (CONFIDENTIAL — PORTFOLIO OVERVIEW) Tj\n' : ''
    const stream = `BT /F1 10 Tf 50 760 Td (${lines.join('\n').replace(/[()]/g, '').replace(/\n/g, ') Tj T* (')}) Tj T* ${watermark}ET`
    const pdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000243 00000 n \n0000000313 00000 n \ntrailer << /Root 1 0 R /Size 6 >>\nstartxref\n${350 + stream.length}\n%%EOF`
    const blob = new Blob([pdf], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'comparison-summary.pdf'
    link.click()
    URL.revokeObjectURL(url)
  }

  const rows: Array<{ key: keyof MetricResult; label: string; render?: (value: MetricResult, rowId: string) => ReactNode }> = [
    {
      key: 'formationCost',
      label: 'Formation cost (€)',
      render: (m) => (
        <Citation source="Service provider estimates" url="/methodology" marker="1">
          {formatPrivate(m.formationCost, 'currency')}
        </Citation>
      ),
    },
    { key: 'annualCost', label: 'Annual running cost (€)', render: (m) => formatPrivate(m.annualCost, 'currency') },
    {
      key: 'timeline',
      label: 'Timeline to launch',
      render: (m) => (
        <Citation source="Relevant regulator setup guidance" url="/coverage" marker="2">
          {m.timeline}
        </Citation>
      ),
    },
    { key: 'taxAtFundLevel', label: 'Tax at fund level' },
    {
      key: 'lpWithholding',
      label: 'LP withholding tax (avg)',
      render: (m) => (
        <Citation source="Relevant tax authority and treaty references" url="/disclosures" marker="3">
          {`${m.lpWithholding}%`}
        </Citation>
      ),
    },
    { key: 'regulatoryBurden', label: 'Regulatory burden score (1–10)' },
    { key: 'lpFamiliarity', label: 'LP familiarity score (1–10)' },
    { key: 'euMarketing', label: 'EU marketing access (YES/NO/NPPR)' },
    { key: 'providers', label: 'Required service providers', render: (m) => m.providers.join(', ') },
    { key: 'overallScore', label: 'Overall GNCO score (/100)' },
  ]

  return (
    <main className="grid gap-6 p-6 lg:grid-cols-[320px_1fr] lg:p-8">
      <aside className="space-y-5 rounded-xl border border-bg-border bg-bg-surface p-4">
        <h1 className="text-2xl font-serif">Structure Comparison</h1>
        <div>
          <label className="text-sm text-text-secondary">Fund size (€)</label>
          <input type="number" value={input.fundSize} onChange={(e) => setInput((prev) => ({ ...prev, fundSize: Number(e.target.value || 0) }))} className="mt-1 w-full rounded-md border border-bg-border bg-bg-elevated px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Strategy</label>
          <select value={input.strategy} onChange={(e) => setInput((prev) => ({ ...prev, strategy: e.target.value as CompareInput['strategy'] }))} className="mt-1 w-full rounded-md border border-bg-border bg-bg-elevated px-3 py-2">
            {strategies.map((strategy) => <option key={strategy} value={strategy}>{strategy}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">LP mix</p>
          {([
            ['institutional', 'Institutional'],
            ['familyOffice', 'Family office'],
            ['sovereign', 'Sovereign'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-3 text-sm">
              <span>{label}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(input.lpMix[key] * 100)}
                onChange={(e) => setInput((prev) => ({ ...prev, lpMix: { ...prev.lpMix, [key]: Number(e.target.value || 0) / 100 } }))}
                className="w-20 rounded border border-bg-border bg-bg-elevated px-2 py-1 text-right"
              />
            </label>
          ))}
        </div>
        <div className="space-y-2 border-t border-bg-border pt-4">
          <button onClick={saveComparison} className="flex w-full items-center justify-center gap-2 rounded-md border border-bg-border px-3 py-2 text-sm"><Save className="h-4 w-4" />Save comparison</button>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Optional share password" className="w-full rounded border border-bg-border bg-bg-elevated px-2 py-1 text-sm" />
          <button onClick={shareComparison} className="flex w-full items-center justify-center gap-2 rounded-md border border-bg-border px-3 py-2 text-sm"><Share2 className="h-4 w-4" />Share comparison</button>
          <button onClick={exportPdf} className="flex w-full items-center justify-center gap-2 rounded-md border border-bg-border px-3 py-2 text-sm"><Download className="h-4 w-4" />Export PDF</button>
          {shareUrl ? <p className="break-all text-xs text-accent-gold">{shareUrl}</p> : null}
          {message ? <p className="text-xs text-text-secondary">{message}</p> : null}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('absolute')} className={cn('rounded px-3 py-1 text-sm', viewMode === 'absolute' ? 'bg-accent-gold text-bg-primary' : 'border border-bg-border')}>Absolute values</button>
            <button onClick={() => setViewMode('relative')} className={cn('rounded px-3 py-1 text-sm', viewMode === 'relative' ? 'bg-accent-gold text-bg-primary' : 'border border-bg-border')}>Relative (radar)</button>
          </div>
          <button onClick={addColumn} disabled={!canAdd} className="flex items-center gap-2 rounded-md border border-bg-border px-3 py-2 text-sm disabled:opacity-40"><Plus className="h-4 w-4" />Add jurisdiction</button>
        </div>

        {viewMode === 'relative' ? (
          <div className="h-[420px] rounded-xl border border-bg-border bg-bg-surface p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Cost" dataKey="Cost" stroke="#bfa36a" fill="#bfa36a" fillOpacity={0.15} />
                <Radar name="Timeline" dataKey="Timeline" stroke="#5f6f8f" fill="#5f6f8f" fillOpacity={0.1} />
                <Radar name="Tax" dataKey="Tax" stroke="#4a9b8e" fill="#4a9b8e" fillOpacity={0.1} />
                <Radar name="Regulatory" dataKey="Regulatory" stroke="#a66d6d" fill="#a66d6d" fillOpacity={0.1} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-bg-border bg-bg-surface">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-bg-border p-3 text-left">Metric</th>
                  {results.map((result, index) => {
                    const jurisdiction = JURISDICTIONS.find((item) => item.id === result.jurisdictionId) || JURISDICTIONS[0]
                    return (
                      <th key={result.jurisdictionId + index} className="border-b border-bg-border p-3 text-left align-top">
                        <select value={result.jurisdictionId} onChange={(e) => updateColumn(index, e.target.value)} className="w-full rounded border border-bg-border bg-bg-elevated px-2 py-1">
                          {JURISDICTIONS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <p className="mt-2 text-xs text-text-secondary">{result.vehicle || jurisdiction.primaryVehicles[0]}</p>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="align-top">
                    <td className="border-b border-bg-border p-3 font-medium">{row.label}</td>
                    {results.map((result, index) => {
                      const value = row.render ? row.render(result.metrics, `${row.key}-${index}`) : String(result.metrics[row.key])
                      const rowKey = `${row.key}-${index}`
                      const expanded = expandedCell === rowKey
                      return (
                        <td key={rowKey} className="border-b border-bg-border p-3">
                          <button className="text-left" onClick={() => setExpandedCell(expanded ? null : rowKey)}>
                            <span className="inline-flex items-center gap-2">
                              <span>{value}</span>
                              <span title={result.metrics.why[row.key]} className="text-text-tertiary"><Info className="inline h-3 w-3" /></span>
                            </span>
                            {expanded ? <p className="mt-2 text-xs text-text-secondary">{result.metrics.why[row.key]}</p> : null}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
