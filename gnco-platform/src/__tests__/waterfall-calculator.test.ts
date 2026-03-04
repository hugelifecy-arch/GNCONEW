import { calculateWaterfall } from '../lib/waterfall-calculator'
import type { WaterfallInput } from '../lib/types'

const baseInput: WaterfallInput = {
  totalProceeds: 150_000_000, // $150M proceeds
  preferredReturn: 8, // 8% hurdle
  carriedInterest: 20, // 20% carry
  catchUpPercent: 100, // 100% GP catch-up
  managementFeeOffset: false,
  lpCommitments: [
    { lpId: 'lp1', lpName: 'Alpha Pension', commitment: 50_000_000 },
    { lpId: 'lp2', lpName: 'Beta Endowment', commitment: 30_000_000 },
    { lpId: 'lp3', lpName: 'Gamma Family Office', commitment: 20_000_000 },
  ],
}

describe('Waterfall Calculator', () => {
  test('total distributed equals total proceeds', () => {
    const result = calculateWaterfall(baseInput)
    expect(result.totalDistributed).toBeCloseTo(baseInput.totalProceeds, 0)
  })

  test('produces exactly 4 tiers', () => {
    const result = calculateWaterfall(baseInput)
    expect(result.tiers).toHaveLength(4)
  })

  test('tier 1 returns capital to LPs first', () => {
    const result = calculateWaterfall(baseInput)
    const totalCommitted = baseInput.lpCommitments.reduce((s, lp) => s + lp.commitment, 0)
    expect(result.tiers[0].tierName).toContain('Return of Capital')
    expect(result.tiers[0].totalAmount).toBe(totalCommitted)
    expect(result.tiers[0].recipient).toBe('lp')
  })

  test('tier 2 is preferred return to LPs', () => {
    const result = calculateWaterfall(baseInput)
    expect(result.tiers[1].tierName).toContain('Preferred Return')
    expect(result.tiers[1].recipient).toBe('lp')
    expect(result.tiers[1].totalAmount).toBeGreaterThan(0)
  })

  test('LP distributions are proportional to commitments', () => {
    const result = calculateWaterfall(baseInput)
    const totalCommitted = baseInput.lpCommitments.reduce((s, lp) => s + lp.commitment, 0)

    result.lpDistributions.forEach((dist) => {
      const lp = baseInput.lpCommitments.find((c) => c.lpId === dist.lpId)!
      const expectedShare = lp.commitment / totalCommitted
      const actualShare = dist.amount / result.lpDistributions.reduce((s, d) => s + d.amount, 0)
      expect(actualShare).toBeCloseTo(expectedShare, 4)
    })
  })

  test('GP carry is positive when proceeds exceed committed capital plus pref', () => {
    const result = calculateWaterfall(baseInput)
    expect(result.gpCarry).toBeGreaterThan(0)
  })

  test('GP carry is zero when proceeds equal committed capital', () => {
    const breakEvenInput: WaterfallInput = {
      ...baseInput,
      totalProceeds: 100_000_000, // exactly matches committed capital
    }
    const result = calculateWaterfall(breakEvenInput)
    expect(result.gpCarry).toBe(0)
  })

  test('GP carry is zero when proceeds are less than committed capital', () => {
    const lossInput: WaterfallInput = {
      ...baseInput,
      totalProceeds: 80_000_000, // loss scenario
    }
    const result = calculateWaterfall(lossInput)
    expect(result.gpCarry).toBe(0)
  })

  test('management fee offset reduces effective carry rate', () => {
    const withOffset = calculateWaterfall({ ...baseInput, managementFeeOffset: true })
    const withoutOffset = calculateWaterfall({ ...baseInput, managementFeeOffset: false })
    expect(withOffset.gpCarry).toBeLessThan(withoutOffset.gpCarry)
  })

  test('handles zero proceeds without errors', () => {
    const zeroInput: WaterfallInput = { ...baseInput, totalProceeds: 0 }
    const result = calculateWaterfall(zeroInput)
    expect(result.totalDistributed).toBe(0)
    expect(result.gpCarry).toBe(0)
  })

  test('handles single LP correctly', () => {
    const singleLPInput: WaterfallInput = {
      ...baseInput,
      lpCommitments: [{ lpId: 'lp1', lpName: 'Solo LP', commitment: 100_000_000 }],
    }
    const result = calculateWaterfall(singleLPInput)
    expect(result.lpDistributions).toHaveLength(1)
    expect(result.totalDistributed).toBeCloseTo(singleLPInput.totalProceeds, 0)
  })

  test('all LP effective returns are non-negative when profitable', () => {
    const result = calculateWaterfall(baseInput)
    result.lpDistributions.forEach((dist) => {
      expect(dist.effectiveReturn).toBeGreaterThanOrEqual(0)
    })
  })
})
