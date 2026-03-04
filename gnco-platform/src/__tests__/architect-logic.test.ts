import { generateRecommendations } from '../lib/architect-logic'
import { JURISDICTIONS } from '../lib/jurisdiction-data'
import type { ArchitectBrief } from '../lib/types'

const baseBrief: ArchitectBrief = {
  strategy: 'private-equity',
  fundSize: '250m-1b',
  gpDomicile: 'United States',
  lpProfile: ['us-tax-exempt'],
  assetGeography: ['North America'],
  priorities: ['tax-efficiency', 'lp-familiarity', 'speed-to-close'],
  timeline: '60-90-days',
  experience: 'experienced',
}

describe('Architect Recommendation Engine', () => {
  test('returns exactly 3 recommendations', () => {
    const results = generateRecommendations(baseBrief, JURISDICTIONS)
    expect(results).toHaveLength(3)
  })

  test('recommendations are ranked 1, 2, 3', () => {
    const results = generateRecommendations(baseBrief, JURISDICTIONS)
    expect(results[0].rank).toBe(1)
    expect(results[1].rank).toBe(2)
    expect(results[2].rank).toBe(3)
  })

  test('overall scores are in descending order', () => {
    const results = generateRecommendations(baseBrief, JURISDICTIONS)
    expect(results[0].scores.overallScore).toBeGreaterThanOrEqual(results[1].scores.overallScore)
    expect(results[1].scores.overallScore).toBeGreaterThanOrEqual(results[2].scores.overallScore)
  })

  test('all scores are clamped between 0 and 100', () => {
    const results = generateRecommendations(baseBrief, JURISDICTIONS)
    results.forEach((r) => {
      const { overallScore, ...dimensionScores } = r.scores
      Object.values(dimensionScores).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })
  })

  test('US tax-exempt LPs boost Cayman and Delaware scores', () => {
    const results = generateRecommendations(baseBrief, JURISDICTIONS)
    const topJurisdictions = results.map((r) => r.jurisdiction)
    const hasCaymanOrDelaware =
      topJurisdictions.includes('Cayman Islands') || topJurisdictions.includes('Delaware, USA')
    expect(hasCaymanOrDelaware).toBe(true)
  })

  test('speed-to-close priority favors fast jurisdictions', () => {
    const speedBrief: ArchitectBrief = {
      ...baseBrief,
      priorities: ['speed-to-close', 'cost-of-formation', 'regulatory-simplicity'],
    }
    const results = generateRecommendations(speedBrief, JURISDICTIONS)
    // Top result should have high speed score
    expect(results[0].scores.speedToClose).toBeGreaterThan(60)
  })

  test('large fund size boosts Luxembourg familiarity', () => {
    const largeFundBrief: ArchitectBrief = {
      ...baseBrief,
      fundSize: '1b-plus',
      lpProfile: ['european'],
      priorities: ['lp-familiarity', 'tax-efficiency', 'regulatory-simplicity'],
    }
    const results = generateRecommendations(largeFundBrief, JURISDICTIONS)
    const lux = results.find((r) => r.jurisdiction === 'Luxembourg')
    if (lux) {
      expect(lux.scores.lpFamiliarity).toBeGreaterThan(80)
    }
  })

  test('each recommendation includes key considerations', () => {
    const results = generateRecommendations(baseBrief, JURISDICTIONS)
    results.forEach((r) => {
      expect(r.keyConsiderations.length).toBeGreaterThanOrEqual(2)
      expect(r.keyConsiderations.length).toBeLessThanOrEqual(5)
    })
  })

  test('each recommendation has cost and timeline estimates', () => {
    const results = generateRecommendations(baseBrief, JURISDICTIONS)
    results.forEach((r) => {
      expect(r.estimatedFormationCost.min).toBeGreaterThan(0)
      expect(r.estimatedFormationCost.max).toBeGreaterThanOrEqual(r.estimatedFormationCost.min)
      expect(r.estimatedTimelineWeeks.min).toBeGreaterThan(0)
      expect(r.estimatedTimelineWeeks.max).toBeGreaterThanOrEqual(r.estimatedTimelineWeeks.min)
    })
  })

  test('small fund penalizes Luxembourg cost score', () => {
    const smallBrief: ArchitectBrief = {
      ...baseBrief,
      fundSize: 'under-50m',
      priorities: ['cost-of-formation', 'speed-to-close', 'regulatory-simplicity'],
    }
    const results = generateRecommendations(smallBrief, JURISDICTIONS)
    const lux = results.find((r) => r.jurisdiction === 'Luxembourg')
    // Luxembourg should either not be in top 3, or have lower cost score
    if (lux) {
      expect(lux.scores.costScore).toBeLessThan(80)
    }
  })
})
