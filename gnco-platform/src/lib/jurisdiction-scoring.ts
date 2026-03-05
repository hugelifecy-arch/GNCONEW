export type FundStrategy = 'private-equity' | 'real-estate' | 'venture-capital' | 'private-credit'

export type LPType =
  | 'Individual/Family Office'
  | 'Pension Fund'
  | 'Endowment/Foundation'
  | 'Sovereign Wealth Fund'
  | 'Corporate'
  | 'Insurance'

export type LPMixEntry = {
  lpType: LPType
  domicile: string
  commitmentPercent: number
}

export type ScoringInputs = {
  fundSize: number
  lpCount: number
  strategy: FundStrategy
  lpMix?: LPMixEntry[]
}

export const defaultScoringInputs: ScoringInputs = {
  fundSize: 100,
  lpCount: 15,
  strategy: 'private-equity',
}

const BASE_SCORES: Record<string, number> = {
  ireland: 87,
  bvi: 71,
  jersey: 79,
  'cayman-islands': 89,
  luxembourg: 82,
  'delaware-usa': 87,
  singapore: 85,
  cyprus: 83,
}

const STRATEGY_OFFSETS: Record<FundStrategy, Partial<Record<string, number>>> = {
  'private-equity': {
    ireland: 0,
    bvi: 0,
    jersey: 0,
  },
  'real-estate': {
    ireland: -2,
    bvi: -4,
    jersey: -1,
  },
  'venture-capital': {
    ireland: -1,
    bvi: 2,
    jersey: 1,
  },
  'private-credit': {
    ireland: 1,
    bvi: -2,
    jersey: 1,
  },
}

const BASE_WHT_BY_TYPE: Record<LPType, number> = {
  'Individual/Family Office': 22,
  'Pension Fund': 10,
  'Endowment/Foundation': 12,
  'Sovereign Wealth Fund': 7,
  Corporate: 18,
  Insurance: 16,
}

const JURISDICTION_WHT_ADJUSTMENT: Record<string, number> = {
  ireland: -4,
  jersey: -2,
  bvi: 2,
  'cayman-islands': 1,
  luxembourg: -5,
  'delaware-usa': 4,
  singapore: -3,
  cyprus: -2,
}

function computeWeightedWht(jurisdiction: { id: string; taxTreaties: string[] }, lpMix: LPMixEntry[]) {
  const normalized = lpMix
    .filter((entry) => entry.commitmentPercent > 0)
    .map((entry) => ({ ...entry, commitmentPercent: Math.min(100, Math.max(0, entry.commitmentPercent)) }))

  const total = normalized.reduce((sum, entry) => sum + entry.commitmentPercent, 0)
  if (total <= 0) return null

  const weightedWht = normalized.reduce((sum, entry) => {
    const hasTreaty = jurisdiction.taxTreaties.includes(entry.domicile)
    const baseRate = BASE_WHT_BY_TYPE[entry.lpType]
    const jurisdictionAdjustment = JURISDICTION_WHT_ADJUSTMENT[jurisdiction.id] ?? 0
    const treatyReduction = hasTreaty ? 5 : 0
    const effectiveRate = Math.max(0, baseRate + jurisdictionAdjustment - treatyReduction)
    return sum + effectiveRate * (entry.commitmentPercent / total)
  }, 0)

  return weightedWht
}

export function scoreJurisdiction(jurisdiction: string | { id: string; taxTreaties: string[] }, inputs: ScoringInputs): number {
  const id = typeof jurisdiction === 'string' ? jurisdiction : jurisdiction.id
  const taxTreaties = typeof jurisdiction === 'string' ? [] : jurisdiction.taxTreaties

  const baseScore = BASE_SCORES[id] ?? 75

  const strategyOffset = STRATEGY_OFFSETS[inputs.strategy][id] ?? 0

  const scalePenalty = inputs.fundSize >= 250 ? 2 : 0
  const lpComplexityPenalty = inputs.lpCount >= 30 ? 2 : 0
  const weightedWht = inputs.lpMix ? computeWeightedWht({ id, taxTreaties }, inputs.lpMix) : null
  const whtPenalty = weightedWht === null ? 0 : Math.max(0, (weightedWht - 10) * 0.7)

  return Math.max(40, Math.min(100, baseScore + strategyOffset - scalePenalty - lpComplexityPenalty - whtPenalty))
}
