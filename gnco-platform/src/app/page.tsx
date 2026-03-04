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
        <FAQSection />
        <PricingSection />
        <RequestAccessCTA />
      </main>
      <MarketingFooter />
    </>
  )
}
