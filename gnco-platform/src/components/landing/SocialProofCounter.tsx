'use client'

import { useEffect, useRef, useState } from 'react'
import { SOCIAL_PROOF } from '@/lib/socialProof'

function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return

    const startTime = performance.now()

    function tick() {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [started, target, duration])

  return { value, start: () => setStarted(true) }
}

export function SocialProofCounter() {
  const ref = useRef<HTMLDivElement>(null)
  const structures = useCountUp(SOCIAL_PROOF.structuresModeled)
  const fundSize = useCountUp(SOCIAL_PROOF.fundSizeModeledBn * 10)
  const jurisdictions = useCountUp(SOCIAL_PROOF.jurisdictions, 1200)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          structures.start()
          fundSize.start()
          jurisdictions.start()
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section ref={ref} className="border-t border-bg-border bg-bg-primary py-12">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 text-center sm:grid-cols-3">
        <div>
          <p className="text-4xl font-semibold text-accent-gold">{structures.value.toLocaleString()}+</p>
          <p className="mt-2 text-sm text-text-secondary">Structures Modeled</p>
        </div>
        <div>
          <p className="text-4xl font-semibold text-accent-gold">&euro;{(fundSize.value / 10).toFixed(1)}B+</p>
          <p className="mt-2 text-sm text-text-secondary">Fund Size Modeled</p>
        </div>
        <div>
          <p className="text-4xl font-semibold text-accent-gold">{jurisdictions.value}</p>
          <p className="mt-2 text-sm text-text-secondary">Jurisdictions Covered</p>
        </div>
      </div>
    </section>
  )
}
