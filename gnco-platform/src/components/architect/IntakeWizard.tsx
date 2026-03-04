'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Banknote,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Globe,
  Landmark,
  Layers,
  LineChart,
  Loader2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useWizard } from '@/hooks/useWizard'
import type { ArchitectBrief, FundSize, FundStrategy, LPProfile, Priority } from '@/lib/types'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'
const stepLabels = [
  'Fund Type',
  'Fund Size',
  'GP Domicile',
  'LP Base',
  'Investment Geography',
  'Priorities',
  'Timeline',
  'Experience',
]

const step1Options: { value: FundStrategy; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'private-equity', label: 'Private Equity', description: 'Buyout and growth equity funds', icon: TrendingUp },
  { value: 'real-estate', label: 'Real Estate', description: 'Value-add and core property vehicles', icon: Building2 },
  { value: 'private-credit', label: 'Private Credit', description: 'Direct lending and special situations', icon: Coins },
  { value: 'venture-capital', label: 'Venture Capital', description: 'Early stage and growth venture', icon: LineChart },
  { value: 'real-assets', label: 'Real Assets', description: 'Infrastructure and hard assets', icon: Landmark },
  { value: 'multi-strategy', label: 'Multi-Strategy', description: 'Hybrid and flexible mandate funds', icon: Layers },
  { value: 'co-investment', label: 'Co-Investment', description: 'Deal-by-deal capital sleeves', icon: Banknote },
  { value: 'continuation-fund', label: 'Continuation Fund', description: 'GP-led secondary continuation', icon: RefreshCw },
]

const fundSizes: { value: FundSize; label: string }[] = [
  { value: 'under-50m', label: 'Under $50M' },
  { value: '50m-250m', label: '$50M–$250M' },
  { value: '250m-1b', label: '$250M–$1B' },
  { value: '1b-plus', label: '$1B+' },
]

const lpOptions: { value: LPProfile; label: string }[] = [
  { value: 'us-taxable', label: 'US Taxable' },
  { value: 'us-tax-exempt', label: 'US Tax-Exempt' },
  { value: 'european', label: 'European (EU)' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
  { value: 'asian', label: 'Asian' },
  { value: 'family-office', label: 'Family Office' },
  { value: 'sovereign-wealth', label: 'Sovereign Wealth' },
  { value: 'mixed', label: 'Highly Mixed' },
]

const geographyOptions = ['North America', 'Europe', 'Asia-Pacific', 'Middle East', 'Latin America', 'Global']

const priorityOptions: { id: Priority; label: string }[] = [
  { id: 'tax-efficiency', label: 'Tax Efficiency' },
  { id: 'speed-to-close', label: 'Speed to Close' },
  { id: 'regulatory-simplicity', label: 'Regulatory Simplicity' },
  { id: 'lp-familiarity', label: 'LP Familiarity' },
  { id: 'cost-of-formation', label: 'Cost of Formation' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'fundraising-flexibility', label: 'Future Flexibility' },
]

const countries = [
  'United States','Canada','Mexico','Brazil','Argentina','United Kingdom','Ireland','Luxembourg','Netherlands','France','Germany','Spain','Italy','Switzerland','Jersey','Guernsey','Cayman Islands','British Virgin Islands','Bermuda','UAE','Saudi Arabia','Qatar','Bahrain','Kuwait','Egypt','South Africa','Mauritius','India','Singapore','Hong Kong','China','Japan','South Korea','Australia','New Zealand','Indonesia','Malaysia','Thailand','Vietnam','Philippines','Taiwan','Turkey','Israel','Portugal','Belgium','Sweden','Norway','Denmark','Finland','Austria',
]

function stepNumber(step: number) {
  return String(step).padStart(2, '0')
}

export function IntakeWizard() {
  const router = useRouter()
  const { currentStep, goBack, goNext, updateBrief, briefData, resetWizard } = useWizard({ totalSteps: 9 })
  const [direction, setDirection] = useState(1)
  const [countrySearch, setCountrySearch] = useState('')
  const [countryOpen, setCountryOpen] = useState(false)

  const brief = briefData as Partial<ArchitectBrief>
  const priorities = (brief.priorities as Priority[] | undefined) ?? priorityOptions.map((p) => p.id)

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 1:
        return Boolean(brief.strategy)
      case 2:
        return Boolean(brief.fundSize)
      case 3:
        return Boolean(brief.gpDomicile)
      case 4:
        return Boolean(brief.lpProfile && brief.lpProfile.length > 0)
      case 5:
        return Boolean(brief.assetGeography && brief.assetGeography.length > 0)
      case 6:
        return priorities.length === 7
      case 7:
        return Boolean(brief.timeline)
      case 8:
        return Boolean(brief.experience)
      default:
        return true
    }
  }, [brief, currentStep, priorities])

  const filteredCountries = countries.filter((country) => country.toLowerCase().includes(countrySearch.toLowerCase()))


  const hasTrackedStart = useRef(false)
  const hasTrackedCompletion = useRef(false)

  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true
      trackEvent('architect_engine_started', { referrer: typeof document !== 'undefined' ? document.referrer : '' })
    }
  }, [])

  useEffect(() => {
    if (currentStep === 9 && !hasTrackedCompletion.current) {
      hasTrackedCompletion.current = true
      trackEvent('architect_wizard_completed', {
        strategy: brief.strategy,
        fundSize: brief.fundSize,
        lpProfile: brief.lpProfile,
        priorities: brief.priorities,
        experience: brief.experience,
      })
    }

    if (currentStep < 9) {
      hasTrackedCompletion.current = false
    }
  }, [brief.experience, brief.fundSize, brief.lpProfile, brief.priorities, brief.strategy, currentStep])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentStep < 8) {
        trackEvent('architect_wizard_abandoned', {
          lastStep: currentStep,
          briefData: JSON.stringify(briefData),
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [briefData, currentStep])

  const toggleMulti = <T extends string,>(key: keyof ArchitectBrief, value: T) => {
    const current = (brief[key] as T[] | undefined) ?? []
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    updateBrief({ [key]: next })
  }

  const movePriority = (from: number, to: number) => {
    const next = [...priorities]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    updateBrief({ priorities: next })
  }

  const proceed = () => {
    if (!canContinue) return
    trackEvent('architect_step_completed', {
      step_number: currentStep,
      step_name: `step_${currentStep}`,
    })
    setDirection(1)
    goNext()
  }

  const back = () => {
    if (currentStep <= 1) return
    setDirection(-1)
    goBack()
  }

  useEffect(() => {
    if (currentStep === 9) {
      router.push('/architect/results')
    }
  }, [currentStep, router])

  if (currentStep === 9) {
    return (
      <div className="flex min-h-[76vh] flex-col items-center justify-center rounded-xl border border-bg-border bg-bg-surface p-10">
        <Loader2 className="h-12 w-12 animate-spin text-accent-gold" />
        <p className="mt-4 text-lg">Preparing your results...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[84vh] overflow-hidden rounded-xl border border-bg-border bg-bg-surface shadow-surface">
      <aside className="w-[280px] shrink-0 border-r border-bg-border bg-bg-elevated p-6">
        <ol className="space-y-4">
          {stepLabels.map((label, idx) => {
            const step = idx + 1
            const complete = step < currentStep
            const active = step === currentStep
            return (
              <li key={label} className="relative flex items-center gap-3 pb-4">
                {step < 8 && <span className="absolute left-4 top-8 h-8 w-px bg-bg-border" />}
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold',
                    complete && 'border-accent-gold bg-accent-gold text-bg-primary',
                    active && 'border-accent-gold text-accent-gold',
                    !complete && !active && 'border-bg-border text-text-tertiary'
                  )}
                >
                  {complete ? <Check className="h-4 w-4" /> : stepNumber(step)}
                </span>
                <span className={cn('text-sm', active ? 'text-text-primary' : 'text-text-secondary')}>{label}</span>
              </li>
            )
          })}
        </ol>
        <p className="mt-8 text-xs text-text-secondary">Your session is saved automatically.</p>
        <button
          onClick={resetWizard}
          className="mt-3 text-xs text-text-tertiary transition hover:text-accent-gold"
        >
          Reset / Start Over
        </button>
      </aside>

      <section className="relative flex min-h-[84vh] flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ x: direction > 0 ? 40 : -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -40 : 40, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="mx-auto flex min-h-[64vh] w-full max-w-4xl flex-col items-center justify-center"
            >
              <p className="text-sm font-semibold tracking-[0.2em] text-accent-gold">{stepNumber(currentStep)}</p>
              {currentStep === 1 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">What type of fund are you structuring?</h2>
                  <div className="mt-10 grid w-full grid-cols-2 gap-4">
                    {step1Options.map((option) => {
                      const Icon = option.icon
                      const selected = brief.strategy === option.value
                      return (
                        <button
                          key={option.value}
                          onClick={() => updateBrief({ strategy: option.value })}
                          className={cn(
                            'rounded-lg border p-4 text-left transition',
                            selected ? 'border-accent-gold bg-accent-gold/5' : 'border-bg-border hover:border-text-tertiary'
                          )}
                        >
                          <Icon className="mb-2 h-5 w-5 text-accent-gold" />
                          <p className="font-medium">{option.label}</p>
                          <p className="mt-1 text-xs text-text-secondary">{option.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">What is your target fund size?</h2>
                  <div className="mt-10 grid w-full grid-cols-2 gap-4">
                    {fundSizes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateBrief({ fundSize: option.value })}
                        className={cn(
                          'rounded-full border px-6 py-8 text-center text-xl font-semibold transition',
                          brief.fundSize === option.value
                            ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                            : 'border-bg-border text-text-secondary hover:border-text-tertiary'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">Where is your GP entity domiciled?</h2>
                  <div className="relative mt-10 w-full max-w-xl">
                    <button
                      onClick={() => setCountryOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-lg border border-bg-border bg-bg-elevated px-4 py-3 text-left"
                    >
                      <span>{brief.gpDomicile || 'Select country...'}</span>
                      <ChevronDown className="h-4 w-4 text-text-secondary" />
                    </button>
                    {countryOpen && (
                      <div className="absolute top-14 z-20 w-full rounded-lg border border-bg-border bg-bg-surface p-2 shadow-surface">
                        <input
                          placeholder="Type to filter"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="mb-2 w-full rounded-md border border-bg-border bg-bg-elevated px-3 py-2 text-sm outline-none"
                        />
                        <div className="max-h-56 overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <button
                              key={country}
                              onClick={() => {
                                updateBrief({ gpDomicile: country })
                                setCountryOpen(false)
                              }}
                              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-bg-elevated"
                            >
                              {country}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">Describe your LP base</h2>
                  <p className="mt-2 text-sm text-text-secondary">Select all that apply.</p>
                  <div className="mt-8 grid w-full grid-cols-2 gap-4">
                    {lpOptions.map((option) => {
                      const selected = ((brief.lpProfile as LPProfile[] | undefined) ?? []).includes(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() => toggleMulti('lpProfile', option.value)}
                          className={cn(
                            'rounded-lg border p-4 text-left transition',
                            selected ? 'border-accent-gold bg-accent-gold/5' : 'border-bg-border hover:border-text-tertiary'
                          )}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">Where will you invest?</h2>
                  <div className="mt-8 flex w-full max-w-2xl flex-wrap justify-center gap-3">
                    {geographyOptions.map((item) => {
                      const selected = ((brief.assetGeography as string[] | undefined) ?? []).includes(item)
                      return (
                        <button
                          key={item}
                          onClick={() => toggleMulti('assetGeography', item)}
                          className={cn(
                            'rounded-full border px-4 py-2',
                            selected ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' : 'border-bg-border text-text-secondary'
                          )}
                        >
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {currentStep === 6 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">Rank your top priorities</h2>
                  <p className="mt-2 text-sm text-text-secondary">Drag to rank. #1 = most important.</p>
                  <div className="mt-6 w-full max-w-xl space-y-2">
                    {priorities.map((priority, idx) => {
                      const item = priorityOptions.find((p) => p.id === priority)
                      if (!item) return null
                      return (
                        <div
                          key={priority}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', String(idx))}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            const from = Number(e.dataTransfer.getData('text/plain'))
                            if (!Number.isNaN(from)) movePriority(from, idx)
                          }}
                          className="flex cursor-grab items-center justify-between rounded-lg border border-bg-border bg-bg-elevated px-4 py-3"
                        >
                          <span className="text-sm text-text-secondary">#{idx + 1}</span>
                          <span className="font-medium">{item.label}</span>
                          <span className="text-text-tertiary">⋮⋮</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {currentStep === 7 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">What is your timeline?</h2>
                  <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-4">
                    {[
                      ['30-days', 'Need structure in 30 days'],
                      ['60-90-days', '60–90 days'],
                      ['6-months', '6 months'],
                      ['planning-only', 'Planning only'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => updateBrief({ timeline: value })}
                        className={cn(
                          'rounded-lg border p-4 text-lg',
                          brief.timeline === value ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' : 'border-bg-border'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {currentStep === 8 && (
                <>
                  <h2 className="mt-2 text-center font-serif text-[32px]">Your fund formation experience?</h2>
                  <div className="mt-10 w-full max-w-3xl space-y-4">
                    {[
                      ['first-fund', 'First fund', 'This is my first time raising an institutional fund'],
                      ['experienced', 'Experienced', "I've formed 2–5 funds, have preferred advisors"],
                      ['institutional', 'Institutional', '5+ funds, in-house legal, full team'],
                    ].map(([value, title, description]) => (
                      <button
                        key={value}
                        onClick={() => updateBrief({ experience: value })}
                        className={cn(
                          'w-full rounded-lg border p-5 text-left',
                          brief.experience === value ? 'border-accent-gold bg-accent-gold/10' : 'border-bg-border'
                        )}
                      >
                        <p className="text-lg font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-text-secondary">{description}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t border-bg-border bg-bg-surface px-8 py-4">
          <button onClick={back} disabled={currentStep === 1} className="flex items-center gap-1 text-sm disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-sm text-text-secondary">Step {currentStep} of 8</p>
          <button
            onClick={proceed}
            disabled={!canContinue}
            className="flex items-center gap-1 rounded-md border border-accent-gold px-4 py-2 text-sm text-accent-gold disabled:opacity-40"
          >
            {currentStep === 8 ? 'Generate Recommendations' : 'Continue'}
            {currentStep === 8 ? <Loader2 className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </section>
    </div>
  )
}
