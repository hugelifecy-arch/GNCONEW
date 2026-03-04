'use client'

import { useMemo, useState } from 'react'

import type { ArchitectBrief, FundStructureRecommendation } from '@/lib/types'
import { track } from '@/lib/analytics'

type AttorneyBriefProps = {
  brief: Partial<ArchitectBrief>
  recommendations: FundStructureRecommendation[]
}

function formatSize(size?: ArchitectBrief['fundSize']) {
  if (!size) return 'Not provided'
  return size.replaceAll('-', ' ')
}

function formatStrategy(strategy?: ArchitectBrief['strategy']) {
  if (!strategy) return 'Not provided'
  return strategy.replaceAll('-', ' ')
}

export function AttorneyBrief({ brief, recommendations }: AttorneyBriefProps) {
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const topThree = useMemo(() => recommendations.slice(0, 3), [recommendations])

  const handleGenerate = async () => {
    if (!topThree[0]) return

    setExporting(true)
    setMessage(null)

    const response = await fetch('/api/generate-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        brief: {
          strategy: formatStrategy(brief.strategy),
          fundSize: formatSize(brief.fundSize),
          lpCount: Array.isArray(brief.lpProfile) ? brief.lpProfile.length : 0,
          lpMix: brief.lpProfile ?? [],
          gpDomicile: brief.gpDomicile ?? 'Not provided',
        },
        recommendations: topThree,
      }),
    })

    if (response.status === 401) {
      setMessage('Please sign in to generate the Attorney Brief.')
      setExporting(false)
      return
    }

    if (!response.ok) {
      setMessage('Unable to generate brief. Please try again.')
      setExporting(false)
      return
    }

    const accessLevel = (response.headers.get('x-brief-access-level') as 'preview' | 'full' | null) ?? 'preview'
    const filename = response.headers.get('x-brief-filename') ?? `gnco-attorney-brief-${new Date().toISOString().slice(0, 10)}.docx`
    const blob = await response.blob()

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)

    track('brief_downloaded', {
      jurisdiction: topThree[0]?.jurisdiction,
      fund_size: formatSize(brief.fundSize),
    })
    setMessage(accessLevel === 'preview' ? 'Preview brief generated (summary only for free tier).' : 'Full Attorney Brief generated.')
    setExporting(false)
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={exporting || !topThree[0]}
        className="rounded-md border border-accent-gold px-4 py-2 text-sm text-accent-gold disabled:opacity-60"
      >
        {exporting ? 'Generating Attorney Brief...' : 'Generate Attorney Brief'}
      </button>
      {message ? <p className="text-xs text-text-secondary">{message}</p> : null}
    </div>
  )
}
