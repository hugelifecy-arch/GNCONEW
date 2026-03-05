export function CredibilityStrip() {
  return (
    <section className="w-full border-y border-bg-border bg-bg-surface py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative">
            <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
            <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-accent-green opacity-75" />
          </div>
          <p className="text-sm text-text-secondary">
            847 fund structures modeled &middot; 214 beta users &middot; 18 countries
          </p>
        </div>

        <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-text-tertiary">Designed for practitioners across</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            'Single Family Office',
            'Multi-Family Office',
            'Private Equity GP',
            'Real Assets Fund',
            'Endowment & Foundation',
          ].map((type) => (
            <span
              key={type}
              className="rounded-full border border-bg-border px-5 py-2 font-sans text-sm text-text-secondary transition-all duration-200 hover:border-accent-gold/30 hover:text-text-primary"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
