import {
  evaluateLPCompliance,
  FATCA_CLASSIFICATIONS,
  type LPComplianceInput,
  type FundComplianceProfile,
} from '../lib/lp-compliance'

const baseFund: FundComplianceProfile = {
  fundDomicile: 'Cayman Islands',
  usesLeverage: false,
  hasUSAssets: false,
  totalFundCommitments: 100_000_000,
  existingERISACommitments: 0,
}

const usERISAPlan: LPComplianceInput = {
  legalName: 'US State Pension',
  domicile: 'United States',
  lpType: 'US ERISA Plan',
  commitmentAmount: 10_000_000,
  hasUSBeneficialOwners: true,
}

const usTaxExempt: LPComplianceInput = {
  legalName: 'University Endowment',
  domicile: 'United States',
  lpType: 'US Endowment',
  commitmentAmount: 15_000_000,
  hasUSBeneficialOwners: true,
}

const germanLP: LPComplianceInput = {
  legalName: 'Deutsche Versicherung AG',
  domicile: 'Germany',
  lpType: 'Institutional Investor',
  commitmentAmount: 20_000_000,
  hasUSBeneficialOwners: false,
}

describe('LP Compliance Screening', () => {
  test('ERISA below 25% returns amber when approaching threshold', () => {
    const fund: FundComplianceProfile = {
      ...baseFund,
      totalFundCommitments: 100_000_000,
      existingERISACommitments: 15_000_000, // existing 15% + new 10% = 25%
    }
    const result = evaluateLPCompliance(usERISAPlan, fund)
    expect(result.erisaPlanPercentage).toBeGreaterThanOrEqual(20)
    expect(result.status).not.toBe('green')
  })

  test('ERISA at exactly 25% triggers red status', () => {
    const fund: FundComplianceProfile = {
      ...baseFund,
      totalFundCommitments: 100_000_000,
      existingERISACommitments: 15_000_000,
    }
    const result = evaluateLPCompliance(usERISAPlan, fund)
    if (result.erisaPlanPercentage >= 25) {
      expect(result.status).toBe('red')
      expect(result.findings.some((f) => f.includes('ERISA'))).toBe(true)
    }
  })

  test('ERISA well below threshold returns green', () => {
    const fund: FundComplianceProfile = {
      ...baseFund,
      totalFundCommitments: 500_000_000,
      existingERISACommitments: 0,
    }
    const smallERISA: LPComplianceInput = { ...usERISAPlan, commitmentAmount: 5_000_000 }
    const result = evaluateLPCompliance(smallERISA, fund)
    // 5M / 500M = 1% - well below threshold
    expect(result.erisaPlanPercentage).toBeLessThan(20)
    expect(result.findings.some((f) => f.includes('ERISA'))).toBe(false)
  })

  test('UBTI warning for leveraged fund with tax-exempt US LP', () => {
    const leveragedFund: FundComplianceProfile = { ...baseFund, usesLeverage: true }
    const result = evaluateLPCompliance(usTaxExempt, leveragedFund)
    expect(result.status).toBe('amber')
    expect(result.findings.some((f) => f.includes('UBTI'))).toBe(true)
  })

  test('no UBTI warning when fund does not use leverage', () => {
    const result = evaluateLPCompliance(usTaxExempt, baseFund)
    expect(result.findings.some((f) => f.includes('UBTI'))).toBe(false)
  })

  test('ECI risk flagged for non-US LP when fund has US assets', () => {
    const usAssetFund: FundComplianceProfile = { ...baseFund, hasUSAssets: true }
    const result = evaluateLPCompliance(germanLP, usAssetFund)
    expect(result.findings.some((f) => f.includes('ECI'))).toBe(true)
  })

  test('FATCA W-9 required for US domiciled LP', () => {
    const result = evaluateLPCompliance(usERISAPlan, baseFund)
    expect(result.taxForms).toContain(FATCA_CLASSIFICATIONS.US_LP)
  })

  test('W-8BEN-E required for non-US LP with US beneficial owners', () => {
    const nonUSWithBO: LPComplianceInput = {
      ...germanLP,
      hasUSBeneficialOwners: true,
    }
    const result = evaluateLPCompliance(nonUSWithBO, baseFund)
    expect(result.taxForms).toContain(FATCA_CLASSIFICATIONS.NON_US_WITH_US_BO)
  })

  test('CRS self-certification for EU domiciled LP', () => {
    const result = evaluateLPCompliance(germanLP, baseFund)
    expect(result.taxForms).toContain(FATCA_CLASSIFICATIONS.EU_CRS)
  })

  test('AIFMD NPPR required for EU LP in non-EU fund', () => {
    const result = evaluateLPCompliance(germanLP, baseFund)
    expect(result.npprCountries).toContain('Germany')
    expect(result.findings.some((f) => f.includes('AIFMD NPPR'))).toBe(true)
  })

  test('no NPPR for EU LP in EU-domiciled fund', () => {
    const euFund: FundComplianceProfile = { ...baseFund, fundDomicile: 'Luxembourg' }
    const result = evaluateLPCompliance(germanLP, euFund)
    expect(result.npprCountries).toHaveLength(0)
  })

  test('green status LP has no counsel review requirement', () => {
    const cleanLP: LPComplianceInput = {
      legalName: 'Cayman Fund of Funds',
      domicile: 'Cayman Islands',
      lpType: 'Institutional Investor',
      commitmentAmount: 10_000_000,
      hasUSBeneficialOwners: false,
    }
    const result = evaluateLPCompliance(cleanLP, baseFund)
    expect(result.status).toBe('green')
    expect(result.requiresCounselReview).toBe(false)
  })
})
