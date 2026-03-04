export type ChangelogType = 'data-update' | 'feature' | 'fix' | 'regulatory'

export interface ChangelogEntry {
  version: string
  date: string
  type: ChangelogType
  description: string
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v2.1.3',
    date: '2026-03-01',
    type: 'feature',
    description: 'Added email capture to Architect Engine results page. Beta signup data is now collected before brief download.',
  },
  {
    version: 'v2.1.2',
    date: '2026-02-25',
    type: 'feature',
    description: 'Launched Use Cases page with 5 ICP scenarios and Template Library page with all 52 fund structure templates.',
  },
  {
    version: 'v2.1.1',
    date: '2026-02-20',
    type: 'fix',
    description: 'Fixed broken internal links referencing gnco.ai domain. All footnotes and citation links now resolve to correct internal routes.',
  },
  {
    version: 'v2.1',
    date: '2026-02-19',
    type: 'data-update',
    description: 'Updated Ireland annual cost estimates based on latest service provider benchmarks. Added BVI treaty data for Switzerland.',
  },
  {
    version: 'v2.0.1',
    date: '2025-12-10',
    type: 'regulatory',
    description: 'Incorporated Cyprus CySEC fee schedule update effective January 2026. Updated AIFLNP formation cost range.',
  },
  {
    version: 'v2.0',
    date: '2025-11-15',
    type: 'data-update',
    description: 'Added Cyprus as 15th jurisdiction. Updated Luxembourg AIFMD compliance data and RAIF formation cost benchmarks.',
  },
  {
    version: 'v1.2',
    date: '2025-10-01',
    type: 'feature',
    description: 'Launched LP Tax Modeler tool and GP Relocation comparison tool. Added ILPA-aligned performance metrics.',
  },
  {
    version: 'v1.1',
    date: '2025-09-15',
    type: 'regulatory',
    description: 'Updated Singapore VCC fee schedule following MAS circular. Revised Hong Kong LPF formation timeline estimates.',
  },
  {
    version: 'v1.0',
    date: '2025-08-01',
    type: 'feature',
    description: 'Initial platform release with 12 jurisdictions, Architect Engine, cost calculator, and attorney brief generation.',
  },
]
