'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { DataVersionBadge } from '@/components/ui/DataVersionBadge'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { JURISDICTIONS } from '@/lib/jurisdiction-data'
import { scoreJurisdiction, type FundStrategy, type LPMixEntry, type LPType } from '@/lib/jurisdiction-scoring'
import { trackEvent } from '@/lib/analytics'
import { formatCurrency } from '@/lib/utils'
import { Citation } from '@/components/ui/Citation'

const PREVIEW_JURISDICTIONS = ['ireland', 'bvi', 'jersey'] as const

const STRATEGY_LABEL: Record<FundStrategy, string> = {
  'private-equity': 'PE',
  'real-estate': 'Real Estate',
  'venture-capital': 'Venture Capital',
  'private-credit': 'Private Credit',
}

const LP_TYPES: LPType[] = [
  'Individual/Family Office',
  'Pension Fund',
  'Endowment/Foundation',
  'Sovereign Wealth Fund',
  'Corporate',
  'Insurance',
]

const LP_MIX_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'Netherlands',
  'Luxembourg',
  'Switzerland',
  'Ireland',
  'Spain',
  'Italy',
  'Belgium',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Portugal',
  'Poland',
  'Austria',
  'Japan',
  'Singapore',
  'Hong Kong',
  'China',
  'South Korea',
  'Australia',
  'New Zealand',
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Israel',
  'Brazil',
  'Mexico',
  'South Africa',
  'Mauritius',
  'Cayman Islands',
  'Jersey',
  'Guernsey',
]

type LPMixRow = LPMixEntry & { id: string }

const createLpMixRow = (index: number): LPMixRow => ({
  id: `lp-mix-${index}`,
  lpType: 'Individual/Family Office',
  domicile: 'United States',
  commitmentPercent: 0,
})

export function InstantCostCalculator() {
  const [fundSize, setFundSize] = useState(100)
  const [lpCount, setLpCount] = useState(15)
  const [strategy, setStrategy] = useState<FundStrategy>('private-equity')
  const [showLpMix, setShowLpMix] = useState(false)
  const [lpMixRows, setLpMixRows] = useState<LPMixRow[]>([createLpMixRow(1)])
  const [fundLife, setFundLife] = useState<5 | 7 | 10>(5)
  const [aumGrowthRate, setAumGrowthRate] = useState<0 | 10 | 25>(10)
  const reinvestmentRate = 3

  const lastVerifiedDate = 'February 19, 2026'

  const handleFundSizeChange = (value: number) => {
    setFundSize(value)
    trackEvent('calculator_fund_size_changed', {
      fundSize: value,
      lpCount,
      strategy,
    })
  }

  const handleLpCountChange = (value: number) => {
    setLpCount(value)
    trackEvent('calculator_lp_count_changed', {
      lpCount: value,
      fundSize,
      strategy,
    })
  }

  const handleStrategyChange = (value: FundStrategy) => {
    setStrategy(value)
    trackEvent('calculator_strategy_changed', {
      strategy: value,
      fundSize,
      lpCount,
    })
  }

  const updateLpMixRow = (id: string, updates: Partial<LPMixRow>) => {
    setLpMixRows((current) => current.map((row) => (row.id === id ? { ...row, ...updates } : row)))
  }

  const addLpMixRow = () => {
    if (lpMixRows.length >= 10) return
    setLpMixRows((current) => [...current, createLpMixRow(current.length + 1)])
  }

  const removeLpMixRow = (id: string) => {
    setLpMixRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== id)))
  }

  const lpMixTotal = useMemo(
    () => lpMixRows.reduce((sum, row) => sum + (Number.isFinite(row.commitmentPercent) ? row.commitmentPercent : 0), 0),
    [lpMixRows]
  )
  const lpMixProgress = Math.min(lpMixTotal, 100)
  const lpMixReady = lpMixRows.some((row) => row.commitmentPercent > 0) && lpMixTotal === 100

  const scoringLpMix = useMemo(
    () => (showLpMix && lpMixReady ? lpMixRows.map(({ lpType, domicile, commitmentPercent }) => ({ lpType, domicile, commitmentPercent })) : undefined),
    [lpMixReady, lpMixRows, showLpMix]
  )

  const topJurisdictions = useMemo(() => {
    const scoredById = new Map(
      JURISDICTIONS.map((j) => {
        let formationCost = (j.formationCostRange.min + j.formationCostRange.max) / 2

        const strategyMultiplier: Record<FundStrategy, number> = {
          'private-equity': 1,
          'real-estate': 1.08,
          'venture-capital': 0.94,
          'private-credit': 1.12,
        }

        formationCost *= strategyMultiplier[strategy]

        if (fundSize > 250) formationCost *= 1.3
        if (fundSize > 500) formationCost *= 1.5

        formationCost += (lpCount - 10) * 500

        let annualCost = (j.annualCostRange.min + j.annualCostRange.max) / 2
        annualCost *= strategyMultiplier[strategy]
        if (fundSize > 250) annualCost *= 1.2

        const regulatoryCost = Math.round(
          annualCost * (j.taxTreatyStrength === 'high' ? 0.08 : j.taxTreatyStrength === 'medium' ? 0.1 : 0.12)
        )

        const totalYear1 = formationCost + annualCost

        const score = scoreJurisdiction(
          { id: j.id, taxTreaties: j.taxTreaties },
          { fundSize, lpCount, strategy, lpMix: scoringLpMix }
        )

        return [
          j.id,
          {
            id: j.id,
            name: j.name,
            flag: j.flag,
            formationCost: Math.round(formationCost),
            annualCost: Math.round(annualCost),
            regulatoryCost,
            totalYear1: Math.round(totalYear1),
            score,
            timeline: `${j.setupTimeWeeks.min}-${j.setupTimeWeeks.max} weeks`,
          },
        ] as const
      })
    )

    return PREVIEW_JURISDICTIONS.map((jurisdictionId) => scoredById.get(jurisdictionId)).filter(
      (jurisdiction): jurisdiction is NonNullable<typeof jurisdiction> => Boolean(jurisdiction)
    )
  }, [fundSize, lpCount, scoringLpMix, strategy])

  const projectionData = useMemo(() => {
    return topJurisdictions.map((jurisdiction) => {
      const yearly = Array.from({ length: 5 }, (_, yearIndex) => {
        const year = yearIndex + 1
        const growthFactor = Math.pow(1 + aumGrowthRate / 100, yearIndex)
        const inflationFactor = Math.pow(1 + reinvestmentRate / 100, yearIndex)
        const formation = year === 1 ? jurisdiction.formationCost : 0
        const annualOps = Math.round(jurisdiction.annualCost * growthFactor * inflationFactor)
        const regulatory = Math.round(jurisdiction.regulatoryCost * growthFactor * inflationFactor)
        const total = formation + annualOps + regulatory

        return {
          year,
          formation,
          annualOps,
          regulatory,
          total,
        }
      })

      let runningCumulative = 0
      const yearlyWithCumulative = yearly.map((row) => {
        runningCumulative += row.total
        return {
          ...row,
          cumulative: runningCumulative,
        }
      })

      return {
        ...jurisdiction,
        yearly: yearlyWithCumulative,
      }
    })
  }, [aumGrowthRate, reinvestmentRate, topJurisdictions])

  const comparisonChartData = useMemo(
    () =>
      Array.from({ length: 5 }, (_, yearIndex) => {
        const year = yearIndex + 1
        const dataPoint: Record<string, number | string> = { year: `Year ${year}` }

        projectionData.forEach((jurisdiction) => {
          dataPoint[jurisdiction.name] = jurisdiction.yearly[yearIndex]?.cumulative ?? 0
        })

        return dataPoint
      }),
    [projectionData]
  )

  const insight = useMemo(() => {
    const ireland = projectionData.find((item) => item.id === 'ireland')
    const luxembourg = projectionData.find((item) => item.id === 'luxembourg')

    if (!ireland || !luxembourg) {
      return null
    }

    const irelandOps = ireland.yearly.reduce((sum, year) => sum + year.annualOps + year.regulatory, 0)
    const luxOps = luxembourg.yearly.reduce((sum, year) => sum + year.annualOps + year.regulatory, 0)
    const opsSavings = Math.max(0, luxOps - irelandOps)

    const taxEfficiencyDelta = Math.round(
      fundSize * 1_000_000 * (fundLife / 5) * (1 + aumGrowthRate / 100) * 0.0004
    )
    const netAdvantage = taxEfficiencyDelta - opsSavings

    return {
      opsSavings,
      taxEfficiencyDelta,
      netAdvantage,
    }
  }, [aumGrowthRate, fundLife, fundSize, projectionData])

  const scoreContext = scoringLpMix
    ? `Score: ${STRATEGY_LABEL[strategy]} strategy · €${fundSize}M · ${lpCount} LPs · LP-mix WHT weighted`
    : `Score: ${STRATEGY_LABEL[strategy]} strategy · €${fundSize}M · ${lpCount} LPs · default GP domicile`

  return (
    <section id="cost-calculator" className="w-full border-y border-bg-border bg-bg-surface py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-4 font-serif text-4xl text-text-primary md:text-5xl">
            How Much Does Your Fund Actually Cost?
          </h2>
          <p className="text-lg text-text-secondary">
            Move the sliders to see real formation costs across jurisdictions
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-bg-border bg-bg-elevated p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <label className="font-sans text-sm text-text-secondary">Target Fund Size</label>
                <span className="font-serif text-2xl text-accent-gold">€{fundSize}M</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={fundSize}
                onChange={(e) => handleFundSizeChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-bg-border accent-accent-gold"
              />
              <div className="mt-1 flex justify-between text-xs text-text-tertiary">
                <span>€10M</span>
                <span>€500M</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <label className="font-sans text-sm text-text-secondary">Number of LPs</label>
                <span className="font-serif text-2xl text-accent-gold">{lpCount}</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={lpCount}
                onChange={(e) => handleLpCountChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-bg-border accent-accent-gold"
              />
              <div className="mt-1 flex justify-between text-xs text-text-tertiary">
                <span>5 LPs</span>
                <span>50 LPs</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-sans text-sm text-text-secondary">
              Fund Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => handleStrategyChange(e.target.value as FundStrategy)}
              className="w-full rounded-sm border border-bg-border bg-bg-primary px-4 py-3 text-text-primary focus:border-accent-gold focus:outline-none"
            >
              <option value="private-equity">Private Equity</option>
              <option value="real-estate">Real Estate</option>
              <option value="venture-capital">Venture Capital</option>
              <option value="private-credit">Private Credit</option>
            </select>
          </div>

          <div className="mt-6 rounded-md border border-bg-border bg-bg-primary/60">
            <button
              type="button"
              onClick={() => setShowLpMix((value) => !value)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="font-sans text-sm text-text-primary">Define LP Mix (optional)</p>
                <p className="text-xs text-text-secondary">Use LP type + domicile + commitment % to drive WHT-weighted suitability scoring.</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${showLpMix ? 'rotate-180' : ''}`} />
            </button>

            {showLpMix && (
              <div className="space-y-4 border-t border-bg-border px-4 py-4">
                {lpMixRows.map((row, index) => (
                  <div key={row.id} className="grid gap-3 rounded-md border border-bg-border p-3 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <label className="mb-1 block text-xs text-text-secondary">LP Type</label>
                      <select
                        value={row.lpType}
                        onChange={(event) => updateLpMixRow(row.id, { lpType: event.target.value as LPType })}
                        className="w-full rounded-sm border border-bg-border bg-bg-primary px-3 py-2 text-sm"
                      >
                        {LP_TYPES.map((lpType) => (
                          <option key={lpType} value={lpType}>{lpType}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="mb-1 block text-xs text-text-secondary">Domicile</label>
                      <select
                        value={row.domicile}
                        onChange={(event) => updateLpMixRow(row.id, { domicile: event.target.value })}
                        className="w-full rounded-sm border border-bg-border bg-bg-primary px-3 py-2 text-sm"
                      >
                        {LP_MIX_COUNTRIES.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="mb-1 block text-xs text-text-secondary">Approx. commitment %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={row.commitmentPercent}
                        onChange={(event) =>
                          updateLpMixRow(row.id, {
                            commitmentPercent: Math.min(100, Math.max(0, Number(event.target.value) || 0)),
                          })
                        }
                        className="w-full rounded-sm border border-bg-border bg-bg-primary px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex items-end md:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeLpMixRow(row.id)}
                        disabled={lpMixRows.length === 1}
                        className="w-full rounded-sm border border-bg-border px-2 py-2 text-xs text-text-secondary disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={addLpMixRow}
                    disabled={lpMixRows.length >= 10}
                    className="rounded-sm border border-bg-border px-3 py-2 text-xs text-text-secondary disabled:opacity-40"
                  >
                    Add LP row ({lpMixRows.length}/10)
                  </button>
                  <span className="text-xs text-text-secondary">Total commitment: {lpMixTotal}%</span>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-text-secondary">Allocation progress</span>
                    <span className={lpMixTotal === 100 ? 'text-green-400' : 'text-amber-400'}>{lpMixTotal}% / 100%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-border">
                    <div
                      className={`h-full transition-all ${lpMixTotal === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${lpMixProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">
                    {lpMixReady
                      ? 'LP mix is valid. Suitability scores now include WHT-weighted LP mix impact.'
                      : 'Set total commitment to exactly 100% to activate LP-specific WHT-weighted scoring.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-sans text-sm text-text-secondary">Fund Life</label>
              <select
                value={fundLife}
                onChange={(e) => setFundLife(Number(e.target.value) as 5 | 7 | 10)}
                className="w-full rounded-sm border border-bg-border bg-bg-primary px-4 py-3 text-text-primary focus:border-accent-gold focus:outline-none"
              >
                <option value={5}>5 years</option>
                <option value={7}>7 years</option>
                <option value={10}>10 years</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-sans text-sm text-text-secondary">
                Expected AUM Growth Rate
              </label>
              <select
                value={aumGrowthRate}
                onChange={(e) => setAumGrowthRate(Number(e.target.value) as 0 | 10 | 25)}
                className="w-full rounded-sm border border-bg-border bg-bg-primary px-4 py-3 text-text-primary focus:border-accent-gold focus:outline-none"
              >
                <option value={0}>0% / year</option>
                <option value={10}>10% / year</option>
                <option value={25}>25% / year</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-sans text-sm text-text-secondary">
                Reinvestment Rate (Cost Escalation)
              </label>
              <div className="rounded-sm border border-bg-border bg-bg-primary px-4 py-3 text-text-primary">
                {reinvestmentRate}% annual inflation
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {topJurisdictions.map((j, index) => (
            <div
              key={j.id}
              className={`rounded-lg border bg-bg-elevated p-6 transition-all duration-200 hover:border-accent-gold/50 ${
                index === 0 ? 'border-accent-gold' : 'border-bg-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{j.flag}</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-xl text-text-primary">{j.name}</h3>
                      {index === 0 && (
                        <span className="rounded-full border border-accent-gold/30 bg-accent-gold/10 px-2 py-1 text-xs text-accent-gold">
                          Optimal Cost/Regulatory Profile
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-text-secondary">
                      <span>
                        <Citation source="Service provider estimates" url="/methodology" marker="1">
                          Formation: {formatCurrency(j.formationCost, true)}
                        </Citation>
                      </span>
                      <span>•</span>
                      <span>Annual: {formatCurrency(j.annualCost, true)}</span>
                      <span>•</span>
                      <span>
                        <Citation source="Relevant regulator setup guidance" url="/coverage" marker="2">
                          {j.timeline}
                        </Citation>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif text-3xl text-accent-gold">
                    {formatCurrency(j.totalYear1, true)}
                  </div>
                  <div className="mt-1 text-xs text-text-tertiary">Year 1 Total</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                  <Citation source="GNCO methodology weighting framework" url="/methodology" marker="4">
                    Suitability Score
                  </Citation>
                  <span className="font-semibold text-accent-gold">{j.score}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-border">
                  <div
                    className="h-full bg-gradient-to-r from-accent-gold to-accent-gold-light transition-all duration-1000 ease-out"
                    style={{ width: `${j.score}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-text-tertiary">{scoreContext}</p>
                <div className="mt-2">
                  <DataVersionBadge showLink={false} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-bg-border bg-bg-elevated p-6">
          <h3 className="font-serif text-2xl text-text-primary">5-Year Total Cost Projection</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Projection reflects fund life ({fundLife}y), AUM growth ({aumGrowthRate}%/yr), and
            reinvestment inflation ({reinvestmentRate}%/yr).
          </p>

          {projectionData[0] && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-bg-border text-text-secondary">
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Formation</th>
                    <th className="py-2 pr-4">Annual Ops</th>
                    <th className="py-2 pr-4">Regulatory</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionData[0].yearly.map((row) => (
                    <tr key={row.year} className="border-b border-bg-border/70 text-text-primary">
                      <td className="py-3 pr-4">{row.year}</td>
                      <td className="py-3 pr-4">
                        {row.formation > 0 ? formatCurrency(row.formation, true) : '—'}
                      </td>
                      <td className="py-3 pr-4">{formatCurrency(row.annualOps, true)}</td>
                      <td className="py-3 pr-4">{formatCurrency(row.regulatory, true)}</td>
                      <td className="py-3 pr-4">{formatCurrency(row.total, true)}</td>
                      <td className="py-3">{formatCurrency(row.cumulative, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 h-80 rounded-lg border border-bg-border bg-bg-primary p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b313d" />
                <XAxis dataKey="year" stroke="#97A3B6" />
                <YAxis
                  stroke="#97A3B6"
                  tickFormatter={(value) => `€${Math.round(Number(value) / 1000)}K`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value), true)} />
                <Legend />
                {projectionData.map((jurisdiction, index) => (
                  <Line
                    key={jurisdiction.id}
                    type="monotone"
                    dataKey={jurisdiction.name}
                    stroke={index === 0 ? '#D3AF37' : index === 1 ? '#6AB6FF' : '#7ED957'}
                    strokeWidth={3}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {insight && (
            <div className="mt-6 rounded-md border border-accent-gold/35 bg-accent-gold/10 p-5">
              <h4 className="font-semibold text-accent-gold">Net Present Value of Jurisdiction Choice</h4>
              <p className="mt-2 text-sm text-text-primary">
                By choosing Ireland over Luxembourg for your {STRATEGY_LABEL[strategy]} fund
                profile, you save an estimated {formatCurrency(insight.opsSavings, true)} over 5
                years in operational costs. The tax efficiency difference offsets this by
                approximately {formatCurrency(insight.taxEfficiencyDelta, true)} — giving
                Luxembourg a net{' '}
                {insight.netAdvantage >= 0 ? formatCurrency(insight.netAdvantage, true) : '€0'}
                {' '}advantage over 5 years.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/coverage"
            className="inline-block rounded-sm bg-accent-gold px-8 py-4 font-semibold text-bg-primary transition-all duration-200 hover:bg-accent-gold-light"
          >
            {`See Full ${JURISDICTIONS.length}-Jurisdiction Comparison →`}
          </Link>
          <p className="mt-4 text-sm text-text-tertiary">
            Or start the full Architect Engine to get personalized recommendations
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-sm text-text-secondary">
            Cost projections are estimates based on market data as of {lastVerifiedDate}. Actual
            costs vary. Consult service providers for binding quotes.{' '}
            <Link href="/methodology" className="text-accent-gold underline decoration-accent-gold/40 underline-offset-2 transition hover:text-accent-gold-light">View Methodology →</Link>
          </p>
          <div className="mt-2 text-center">
            <DataVersionBadge />
          </div>
        </div>
      </div>
    </section>
  )
}
