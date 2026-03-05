import Link from 'next/link'
import { HeroSection } from '@/components/landing/HeroSection'
import { SocialProofCounter } from '@/components/landing/SocialProofCounter'
import { CredibilityStrip } from '@/components/landing/CredibilityStrip'
import { FeatureCards } from '@/components/landing/FeatureCards'
import { InstantCostCalculator } from '@/components/landing/InstantCostCalculator'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PartnerStrip } from '@/components/landing/PartnerStrip'
import { FAQSection } from '@/components/landing/FAQSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { RequestAccessCTA } from '@/components/landing/RequestAccessCTA'
import { MarketingFooter } from '@/components/landing/MarketingFooter'

function SampleOutputSection() {
  return (
    <section className="border-t border-bg-border bg-bg-surface py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-serif text-4xl text-text-primary">See What You Get</h2>
        <p className="mt-4 text-lg text-text-secondary">
          A real attorney brief generated for a &euro;75M PE fund with 8 LPs across Germany, UAE, and Singapore.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sample-brief"
            className="inline-block rounded-sm bg-accent-gold px-8 py-4 font-semibold text-bg-primary transition hover:bg-accent-gold-light"
          >
            View Sample Brief →
          </Link>
          <Link
            href="/architect"
            className="inline-block rounded-sm border border-accent-gold/40 px-8 py-4 font-semibold text-accent-gold transition hover:bg-accent-gold/5"
          >
            Launch Architect Engine →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <main className="bg-bg-primary text-text-primary">
        <HeroSection />
        <SocialProofCounter />
        <CredibilityStrip />
        <InstantCostCalculator />
        <FeatureCards />
        <PartnerStrip />
        <HowItWorks />
        <SampleOutputSection />
        <PricingSection />
        <FAQSection />
        <RequestAccessCTA />
      </main>
      <MarketingFooter />
    </>
  )
}
