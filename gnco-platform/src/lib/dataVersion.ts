import { JURISDICTIONS } from './jurisdiction-data'

const latestUpdate = JURISDICTIONS.reduce(
  (latest, j) => (j.lastUpdated > latest ? j.lastUpdated : latest),
  '',
)

const formattedDate = new Date(latestUpdate).toLocaleDateString('en-US', {
  month: 'short',
  year: 'numeric',
})

export const DATA_VERSION = {
  version: '2.1',
  lastUpdated: latestUpdate,
  nextReview: '2026-05-01',
  label: `Data v2.1 — Updated ${formattedDate}`,
}
