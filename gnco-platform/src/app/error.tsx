'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="font-serif text-2xl text-text-primary">Something went wrong</h2>
      <p className="mt-2 text-sm text-text-secondary">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-sm bg-accent-gold px-6 py-2 text-sm font-semibold text-bg-primary transition hover:bg-accent-gold-light"
      >
        Try again
      </button>
    </div>
  )
}
