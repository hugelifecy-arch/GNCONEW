// Fund structure types
export type FundStrategy =
  | 'private-equity'
  | 'real-estate'
  | 'private-credit'
  | 'venture-capital'
  | 'real-assets'
  | 'multi-strategy'
  | 'co-investment'
  | 'continuation-fund'

export type FundSize = 'under-50m' | '50m-250m' | '250m-1b' | '1b-plus'

export type LPProfile =
  | 'us-taxable'
  | 'us-tax-exempt'
  | 'european'
  | 'middle-eastern'
  | 'asian'
  | 'family-office'
  | 'sovereign-wealth'
  | 'mixed'

export type Priority =
  | 'tax-efficiency'
  | 'speed-to-close'
  | 'regulatory-simplicity'
  | 'lp-familiarity'
  | 'cost-of-formation'
  | 'privacy'
  | 'fundraising-flexibility'

export interface ArchitectBrief {
  strategy: FundStrategy
  fundSize: FundSize
  gpDomicile: string
  lpProfile: LPProfile[]
  assetGeography: string[]
  priorities: Priority[]
  timeline: '30-days' | '60-90-days' | '6-months' | 'planning-only'
  experience: 'first-fund' | 'experienced' | 'institutional'
}

export interface JurisdictionScore {
  taxEfficiency: number // 0–100
  lpFamiliarity: number // 0–100
  regulatorySimplicity: number // 0–100
  speedToClose: number // 0–100
  costScore: number // 0–100
  privacyScore: number // 0–100
  overallScore: number // weighted composite
}

export interface FundStructureRecommendation {
  jurisdiction: string
  vehicleType: string
  rank: 1 | 2 | 3
  reasoning: string
  scores: JurisdictionScore
  estimatedFormationCost: { min: number; max: number }
  estimatedTimelineWeeks: { min: number; max: number }
  bestFor: string[]
  notIdealFor: string[]
  keyConsiderations: string[]
}

export interface LPEntry {
  id: string
  legalName: string
  entityType:
    | 'individual'
    | 'trust'
    | 'foundation'
    | 'pension'
    | 'endowment'
    | 'sovereign'
    | 'fund-of-funds'
    | 'family-office'
  domicile: string
  commitmentAmount: number // in USD
  calledCapital: number // in USD
  distributionsReceived: number // in USD
  kycStatus: 'complete' | 'pending' | 'incomplete'
  subscriptionStatus: 'signed' | 'pending' | 'draft'
  relationshipManager: string
  onboardedDate: string
  estimatedTaxRate?: number // % effective tax rate
}

export interface CapitalCall {
  id: string
  fundName: string
  callDate: string
  dueDate: string
  totalAmount: number
  purpose: string
  status: 'draft' | 'sent' | 'partially-paid' | 'complete'
  lpAllocations: LPAllocation[]
}

export interface LPAllocation {
  lpId: string
  lpName: string
  allocationAmount: number
  paidAmount: number
  paidDate?: string
  status: 'pending' | 'paid' | 'overdue'
}

export interface Distribution {
  id: string
  fundName: string
  distributionDate: string
  totalAmount: number
  type: 'return-of-capital' | 'realized-gain' | 'income' | 'mixed'
  waterfallComplete: boolean
  lpAllocations: LPAllocation[]
}

export interface FundDocument {
  id: string
  name: string
  fundName: string
  category:
    | 'formation'
    | 'lp-agreement'
    | 'financial'
    | 'capital-activity'
    | 'regulatory'
    | 'correspondence'
    | 'kyc'
  uploadedDate: string
  expiryDate?: string
  fileSize: string
  fileType: 'pdf' | 'xlsx' | 'docx' | 'msg'
  uploadedBy: string
  accessLog: AccessLogEntry[]
  version: number
}

export interface AccessLogEntry {
  userId: string
  userName: string
  action: 'viewed' | 'downloaded' | 'shared'
  timestamp: string
  ipAddress?: string
}

export interface FundPerformance {
  fundName: string
  vintage: number
  strategy: FundStrategy
  aum: number
  irr: number
  tvpi: number
  dpi: number
  rvpi: number
  status: 'fundraising' | 'investing' | 'harvesting' | 'closed'
}

export interface PerformanceDataPoint {
  month: string
  portfolioReturn: number
  benchmarkReturn: number
  nav: number
}

export interface WaterfallInput {
  totalProceeds: number
  preferredReturn: number // % e.g. 8
  carriedInterest: number // % e.g. 20
  catchUpPercent: number // % e.g. 100
  managementFeeOffset: boolean
  lpCommitments: { lpId: string; lpName: string; commitment: number }[]
}

export interface WaterfallOutput {
  tiers: WaterfallTier[]
  lpDistributions: {
    lpId: string
    lpName: string
    amount: number
    effectiveReturn: number
  }[]
  gpCarry: number
  totalDistributed: number
}

export interface WaterfallTier {
  tierName: string
  totalAmount: number
  description: string
  recipient: 'lp' | 'gp' | 'split'
  splitRatio?: { lp: number; gp: number }
}

export interface JurisdictionProfile {
  id: string
  name: string
  region: 'americas' | 'europe' | 'asia-pacific' | 'middle-east'
  flag: string
  primaryVehicles: string[]
  regulator: string
  regulatorUrl: string
  taxTreatyStrength: 'high' | 'medium' | 'limited'
  setupTimeWeeks: { min: number; max: number }
  annualCostRange: { min: number; max: number }
  formationCostRange: { min: number; max: number }
  suitabilityScore: number
  bestFor: string[]
  notIdealFor: string[]
  coverageStatus: 'full' | 'partial' | 'coming-soon'
  keyServiceProviders: {
    administrators: string[]
    lawFirms: string[]
    auditors: string[]
  }
  taxTreaties: string[]
  fatcaStatus: string
  notes: string
  strategies: ('PE' | 'RE' | 'VC' | 'PC')[]
  dataVersion: string
  lastUpdated: string
  sourceNote: string
}

export interface AccessRequest {
  id: string
  name: string
  organization: string
  role: 'cio' | 'cfo' | 'fund-manager' | 'legal-counsel' | 'other'
  aumRange: 'under-100m' | '100m-500m' | '500m-2b' | '2b-plus'
  email: string
  submittedAt: string
  status: 'pending' | 'approved' | 'declined'
}
