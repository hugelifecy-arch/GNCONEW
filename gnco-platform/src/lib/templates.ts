export interface Template {
  id: number
  name: string
  strategy: 'Private Equity' | 'Real Estate' | 'Venture Capital' | 'Private Credit'
  jurisdiction: string
  flag: string
  description: string
}

export const TEMPLATES: Template[] = [
  // Private Equity (15)
  { id: 1, name: 'Cayman Islands Exempted LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Cayman Islands', flag: '🇰🇾', description: 'Standard closed-end PE structure. Optimal for US institutional LPs. CIMA regulated.' },
  { id: 2, name: 'Luxembourg SCSp — Private Equity', strategy: 'Private Equity', jurisdiction: 'Luxembourg', flag: '🇱🇺', description: 'EU-passportable PE structure. AIFMD compliant. Preferred by European institutional LPs.' },
  { id: 3, name: 'Delaware LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Delaware', flag: '🇺🇸', description: 'US domestic PE fund. Fast formation. Standard for US pension and endowment allocators.' },
  { id: 4, name: 'Jersey Private Fund — Private Equity', strategy: 'Private Equity', jurisdiction: 'Jersey', flag: '🇯🇪', description: 'Flexible PE structure with light regulation. Popular with UK and EU institutional LPs.' },
  { id: 5, name: 'Guernsey LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Guernsey', flag: '🇬🇬', description: 'Established PE domicile. Strong fund administration ecosystem. NPPR marketing to EU.' },
  { id: 6, name: 'Ireland ICAV — Private Equity', strategy: 'Private Equity', jurisdiction: 'Ireland', flag: '🇮🇪', description: 'EU-domiciled PE vehicle. CBI regulated. Full AIFMD passport access.' },
  { id: 7, name: 'Singapore VCC — Private Equity', strategy: 'Private Equity', jurisdiction: 'Singapore', flag: '🇸🇬', description: 'Asia-focused PE structure. MAS regulated. Tax incentives for qualifying funds.' },
  { id: 8, name: 'BVI Limited Partnership — Private Equity', strategy: 'Private Equity', jurisdiction: 'BVI', flag: '🇻🇬', description: 'Tax-neutral PE structure. Rapid formation. Common for emerging market strategies.' },
  { id: 9, name: 'Bermuda Exempted LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Bermuda', flag: '🇧🇲', description: 'Established offshore PE domicile. Strong insurance LP familiarity.' },
  { id: 10, name: 'Netherlands CV — Private Equity', strategy: 'Private Equity', jurisdiction: 'Netherlands', flag: '🇳🇱', description: 'EU-based PE holding structure. Extensive treaty network. Institutional familiarity.' },
  { id: 11, name: 'Switzerland LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Switzerland', flag: '🇨🇭', description: 'Swiss-domiciled PE fund. FINMA supervised. Preferred by Swiss pension allocators.' },
  { id: 12, name: 'Hong Kong LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Hong Kong', flag: '🇭🇰', description: 'Asia PE vehicle. Carried interest tax concession. Gateway to Greater China.' },
  { id: 13, name: 'Cyprus AIF — Private Equity', strategy: 'Private Equity', jurisdiction: 'Cyprus', flag: '🇨🇾', description: 'Cost-efficient EU PE structure. CySEC regulated. Growing institutional acceptance.' },
  { id: 14, name: 'Mauritius GBL — Private Equity', strategy: 'Private Equity', jurisdiction: 'Mauritius', flag: '🇲🇺', description: 'Africa/India-focused PE gateway. FSC regulated. Treaty access to emerging markets.' },
  { id: 15, name: 'Dubai DIFC LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Dubai DIFC', flag: '🇦🇪', description: 'Middle East PE hub. DFSA regulated. Growing allocation from Gulf sovereign wealth.' },

  // Real Estate (15)
  { id: 16, name: 'Luxembourg SCSp — Real Estate', strategy: 'Real Estate', jurisdiction: 'Luxembourg', flag: '🇱🇺', description: 'EU real estate fund vehicle. SPF/SIF structures. Full AIFMD passport for cross-border capital raising.' },
  { id: 17, name: 'Jersey Property Unit Trust', strategy: 'Real Estate', jurisdiction: 'Jersey', flag: '🇯🇪', description: 'UK/EU real estate fund structure. Strong familiarity with UK pension LPs.' },
  { id: 18, name: 'Cayman Islands Exempted LP — Real Estate', strategy: 'Real Estate', jurisdiction: 'Cayman Islands', flag: '🇰🇾', description: 'Global real estate fund. Preferred by US institutional RE allocators.' },
  { id: 19, name: 'Delaware LP — Real Estate', strategy: 'Real Estate', jurisdiction: 'Delaware', flag: '🇺🇸', description: 'US domestic real estate fund. FIRPTA considerations for non-US LPs.' },
  { id: 20, name: 'Ireland ICAV — Real Estate', strategy: 'Real Estate', jurisdiction: 'Ireland', flag: '🇮🇪', description: 'EU-passportable RE vehicle. Section 110 structures. CBI regulated.' },
  { id: 21, name: 'Guernsey Property Fund', strategy: 'Real Estate', jurisdiction: 'Guernsey', flag: '🇬🇬', description: 'Established RE fund domicile. GFSC regulated. UK treaty access.' },
  { id: 22, name: 'Singapore VCC — Real Estate', strategy: 'Real Estate', jurisdiction: 'Singapore', flag: '🇸🇬', description: 'Asia Pacific RE fund vehicle. MAS regulated. Tax incentive schemes available.' },
  { id: 23, name: 'Netherlands FGR — Real Estate', strategy: 'Real Estate', jurisdiction: 'Netherlands', flag: '🇳🇱', description: 'Dutch fund for joint account. Tax-transparent RE structure. Extensive treaty network.' },
  { id: 24, name: 'BVI Limited Partnership — Real Estate', strategy: 'Real Estate', jurisdiction: 'BVI', flag: '🇻🇬', description: 'Offshore RE fund structure. Fast formation. Flexible governance terms.' },
  { id: 25, name: 'Cyprus RAIF — Real Estate', strategy: 'Real Estate', jurisdiction: 'Cyprus', flag: '🇨🇾', description: 'Cost-effective EU RE vehicle. No CySEC approval required. AIFMD compliant.' },
  { id: 26, name: 'Bermuda Exempted LP — Real Estate', strategy: 'Real Estate', jurisdiction: 'Bermuda', flag: '🇧🇲', description: 'Offshore RE fund. Institutional familiarity. BMA regulated.' },
  { id: 27, name: 'Dubai DIFC LP — Real Estate', strategy: 'Real Estate', jurisdiction: 'Dubai DIFC', flag: '🇦🇪', description: 'MENA real estate fund vehicle. DFSA regulated. No income or capital gains tax.' },
  { id: 28, name: 'Mauritius GBL — Real Estate', strategy: 'Real Estate', jurisdiction: 'Mauritius', flag: '🇲🇺', description: 'Africa/India RE gateway. Treaty access for cross-border property investments.' },
  { id: 29, name: 'Switzerland LP — Real Estate', strategy: 'Real Estate', jurisdiction: 'Switzerland', flag: '🇨🇭', description: 'Swiss RE fund. FINMA regulated. Popular with Swiss and German institutional LPs.' },
  { id: 30, name: 'Hong Kong LP — Real Estate', strategy: 'Real Estate', jurisdiction: 'Hong Kong', flag: '🇭🇰', description: 'Asia Pacific RE fund. Tax concessions for qualifying funds. SFC oversight.' },

  // Venture Capital (12)
  { id: 31, name: 'Delaware LP — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Delaware', flag: '🇺🇸', description: 'Standard US VC fund structure. Fast formation. Preferred for US LP-heavy funds.' },
  { id: 32, name: 'Cayman Islands Exempted LP — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Cayman Islands', flag: '🇰🇾', description: 'Global VC fund. Cross-border LP base. CIMA regulated.' },
  { id: 33, name: 'Luxembourg SCSp — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Luxembourg', flag: '🇱🇺', description: 'EU-passportable VC vehicle. EuVECA regime available. AIFMD compliant.' },
  { id: 34, name: 'Singapore VCC — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Singapore', flag: '🇸🇬', description: 'Asia VC fund. Section 13O/13U tax exemptions. MAS regulated.' },
  { id: 35, name: 'Jersey Private Fund — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Jersey', flag: '🇯🇪', description: 'Flexible VC vehicle. 50-investor limit. Rapid JFSC consent process.' },
  { id: 36, name: 'Ireland ICAV — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Ireland', flag: '🇮🇪', description: 'EU VC fund. CBI regulated. Access to EuVECA passport for sub-threshold managers.' },
  { id: 37, name: 'BVI Limited Partnership — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'BVI', flag: '🇻🇬', description: 'Offshore VC structure. Minimal regulation. Fast setup for emerging managers.' },
  { id: 38, name: 'Hong Kong LP — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Hong Kong', flag: '🇭🇰', description: 'Asia VC vehicle. Carried interest tax concession. Greater China deal flow.' },
  { id: 39, name: 'Cyprus AIF — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Cyprus', flag: '🇨🇾', description: 'Low-cost EU VC vehicle. CySEC regulated. Growing tech ecosystem.' },
  { id: 40, name: 'Netherlands CV — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Netherlands', flag: '🇳🇱', description: 'Dutch VC partnership. Tax-transparent. Strong European startup ecosystem.' },
  { id: 41, name: 'Guernsey LP — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Guernsey', flag: '🇬🇬', description: 'Channel Islands VC fund. GFSC registered. NPPR access to EU markets.' },
  { id: 42, name: 'Dubai DIFC LP — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Dubai DIFC', flag: '🇦🇪', description: 'MENA VC hub. DFSA regulated. Zero tax on fund income.' },

  // Private Credit (10)
  { id: 43, name: 'Cayman Islands Exempted LP — Private Credit', strategy: 'Private Credit', jurisdiction: 'Cayman Islands', flag: '🇰🇾', description: 'Global credit fund. Flexible lending structures. US institutional LP familiarity.' },
  { id: 44, name: 'Luxembourg SCSp — Private Credit', strategy: 'Private Credit', jurisdiction: 'Luxembourg', flag: '🇱🇺', description: 'EU credit fund vehicle. Securitization law advantages. Full AIFMD passport.' },
  { id: 45, name: 'Delaware LP — Private Credit', strategy: 'Private Credit', jurisdiction: 'Delaware', flag: '🇺🇸', description: 'US direct lending fund. BDC and non-BDC structures. SEC/state considerations.' },
  { id: 46, name: 'Ireland Section 110 — Private Credit', strategy: 'Private Credit', jurisdiction: 'Ireland', flag: '🇮🇪', description: 'Tax-efficient EU credit structure. CBI regulated. CLO/CDO capabilities.' },
  { id: 47, name: 'Jersey Private Fund — Private Credit', strategy: 'Private Credit', jurisdiction: 'Jersey', flag: '🇯🇪', description: 'Flexible credit fund. Loan origination capabilities. JFSC regulated.' },
  { id: 48, name: 'Singapore VCC — Private Credit', strategy: 'Private Credit', jurisdiction: 'Singapore', flag: '🇸🇬', description: 'Asia-focused credit fund. MAS regulated. Tax incentives for qualifying funds.' },
  { id: 49, name: 'Guernsey LP — Private Credit', strategy: 'Private Credit', jurisdiction: 'Guernsey', flag: '🇬🇬', description: 'Offshore credit vehicle. Established lending fund ecosystem. GFSC oversight.' },
  { id: 50, name: 'Netherlands FGR — Private Credit', strategy: 'Private Credit', jurisdiction: 'Netherlands', flag: '🇳🇱', description: 'Dutch credit fund. Tax transparency. Extensive double tax treaty network.' },
  { id: 51, name: 'BVI Limited Partnership — Private Credit', strategy: 'Private Credit', jurisdiction: 'BVI', flag: '🇻🇬', description: 'Offshore lending vehicle. Flexible terms. Common for distressed strategies.' },
  { id: 52, name: 'Bermuda Exempted LP — Private Credit', strategy: 'Private Credit', jurisdiction: 'Bermuda', flag: '🇧🇲', description: 'Insurance-linked credit fund. BMA regulated. Reinsurance LP familiarity.' },
]
