import Link from 'next/link'

export function DisclaimerFooterBar() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-bg-border bg-bg-primary/98">
      <div className="flex flex-col gap-1 px-6 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-[11px] leading-relaxed text-text-tertiary">
          GNCO is provided for informational and modeling purposes only. All jurisdiction recommendations, cost projections, suitability scores, and structural comparisons are illustrative estimates only. They do not constitute legal, tax, financial, or accounting advice, and do not represent a binding legal opinion. Actual formation costs, regulatory requirements, timelines, and tax treatments vary based on fund complexity, service provider selection, investor base, and applicable law. Always consult qualified legal counsel, tax advisors, and licensed service providers before making any fund structuring decisions. GNCO does not conduct AML, KYC, or investor accreditation checks. GNCO Ltd. All rights reserved.
        </p>
        <Link href="/disclosures" className="shrink-0 text-[11px] text-text-tertiary transition hover:text-accent-gold">
          Full Disclosures →
        </Link>
      </div>
    </footer>
  )
}
