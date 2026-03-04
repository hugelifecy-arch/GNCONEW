import { calculateLPAttribution, getWithholdingTaxRate, DEFAULT_HURDLE_RATE } from '../lib/lp-attribution'
import { MOCK_LPS } from '../lib/mock-data'
import type { LPEntry } from '../lib/types'

const mockLP: LPEntry = {
  id: 'test-lp-1',
  legalName: 'Test LP',
  entityType: 'pension',
  domicile: 'United States',
  commitmentAmount: 50_000_000,
  calledCapital: 40_000_000,
  distributionsReceived: 10_000_000,
  kycStatus: 'complete',
  subscriptionStatus: 'signed',
  relationshipManager: 'John Doe',
  onboardedDate: '2023-01-15',
}

describe('LP Attribution Calculations', () => {
  test('returns complete metric set for an LP', () => {
    const metrics = calculateLPAttribution(MOCK_LPS[0])
    expect(metrics.currentNav).toBeGreaterThanOrEqual(0)
    expect(metrics.grossIrr).toBeGreaterThan(-100)
    expect(metrics.netIrr).toBeLessThanOrEqual(metrics.grossIrr)
    expect(metrics.dpi + metrics.rvpi).toBeCloseTo(metrics.tvpi, 6)
    expect(metrics.moic).toBeCloseTo(metrics.tvpi, 6)
  })

  test('TVPI equals DPI + RVPI', () => {
    const metrics = calculateLPAttribution(mockLP)
    expect(metrics.tvpi).toBeCloseTo(metrics.dpi + metrics.rvpi, 6)
  })

  test('MOIC equals TVPI', () => {
    const metrics = calculateLPAttribution(mockLP)
    expect(metrics.moic).toBeCloseTo(metrics.tvpi, 6)
  })

  test('net IRR is less than gross IRR (fees reduce returns)', () => {
    const metrics = calculateLPAttribution(mockLP)
    expect(metrics.netIrr).toBeLessThan(metrics.grossIrr)
  })

  test('after-WHT IRR is less than or equal to net IRR', () => {
    const metrics = calculateLPAttribution(mockLP)
    expect(metrics.afterWhtIrr).toBeLessThanOrEqual(metrics.netIrr)
  })

  test('after-tax IRR is less than or equal to after-WHT IRR', () => {
    const metrics = calculateLPAttribution(mockLP)
    expect(metrics.afterTaxIrr).toBeLessThanOrEqual(metrics.afterWhtIrr)
  })

  test('UAE LP has zero withholding tax', () => {
    const uaeLp: LPEntry = { ...mockLP, domicile: 'United Arab Emirates' }
    const metrics = calculateLPAttribution(uaeLp)
    // With 0% WHT, after-WHT IRR should equal net IRR
    expect(metrics.afterWhtIrr).toBeCloseTo(metrics.netIrr, 6)
  })

  test('US LP has 30% withholding tax rate', () => {
    expect(getWithholdingTaxRate('United States')).toBe(30)
  })

  test('Germany has 26.375% withholding tax rate', () => {
    expect(getWithholdingTaxRate('Germany')).toBe(26.375)
  })

  test('unknown domicile falls back to 15% withholding', () => {
    expect(getWithholdingTaxRate('Unknown Country')).toBe(15)
    expect(getWithholdingTaxRate('Antarctica')).toBe(15)
  })

  test('DPI reflects distributions relative to called capital', () => {
    const metrics = calculateLPAttribution(mockLP)
    expect(metrics.dpi).toBeCloseTo(mockLP.distributionsReceived / mockLP.calledCapital, 6)
  })

  test('currentNav is non-negative', () => {
    const metrics = calculateLPAttribution(mockLP)
    expect(metrics.currentNav).toBeGreaterThanOrEqual(0)
  })

  test('custom hurdle rate changes net IRR calculation', () => {
    const defaultMetrics = calculateLPAttribution(mockLP)
    const highHurdleMetrics = calculateLPAttribution(mockLP, 12)
    // Higher hurdle means less carry drag, so net IRR should be higher
    expect(highHurdleMetrics.netIrr).toBeGreaterThanOrEqual(defaultMetrics.netIrr)
  })

  test('all MOCK_LPS produce valid metrics', () => {
    MOCK_LPS.forEach((lp) => {
      const metrics = calculateLPAttribution(lp)
      expect(metrics.currentNav).toBeGreaterThanOrEqual(0)
      expect(typeof metrics.grossIrr).toBe('number')
      expect(typeof metrics.netIrr).toBe('number')
      expect(typeof metrics.tvpi).toBe('number')
      expect(Number.isFinite(metrics.grossIrr)).toBe(true)
      expect(Number.isFinite(metrics.netIrr)).toBe(true)
    })
  })
})
