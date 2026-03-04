import Link from 'next/link'

import { DATA_VERSION } from '@/lib/dataVersion'

interface DataVersionBadgeProps {
  showLink?: boolean
}

export function DataVersionBadge({ showLink = true }: DataVersionBadgeProps) {
  const formattedDate = new Date(DATA_VERSION.lastUpdated).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-xs text-text-tertiary">
      <span>Data v{DATA_VERSION.version}</span>
      <span className="hidden sm:inline">·</span>
      <span>Updated {formattedDate}</span>
      {showLink && (
        <>
          <span className="hidden sm:inline">·</span>
          <Link
            href="/methodology"
            className="text-accent-gold underline decoration-accent-gold/40 underline-offset-2 transition hover:text-accent-gold-light hover:decoration-accent-gold"
          >
            Methodology →
          </Link>
        </>
      )}
    </span>
  )
}
