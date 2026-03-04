import { REGULATORY_UPDATES } from '@/data/regulatory-updates'
import { DATA_VERSION } from '@/lib/dataVersion'
import { RegulatoryUpdate, UpdateImpact } from '@/types/regulatory-update'

const IMPACT_CONFIG: Record<UpdateImpact, { color: string; bg: string }> = {
  HIGH: { color: '#ef4444', bg: '#450a0a' },
  MEDIUM: { color: '#f59e0b', bg: '#451a03' },
  LOW: { color: '#34d399', bg: '#022c22' },
}

export const metadata = {
  title: 'Regulatory Updates — GNCO',
  description: 'Latest regulatory and tax changes affecting fund structures across all 15 GNCO jurisdictions.',
}

export default function RegulatoryUpdatesPage() {
  const active = REGULATORY_UPDATES.filter((u) => u.status === 'active').sort(
    (a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime(),
  )

  const highImpact = active.filter((u) => u.impact === 'HIGH')
  const other = active.filter((u) => u.impact !== 'HIGH')

  return (
    <div
      style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb', fontFamily: 'sans-serif', padding: 32 }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#6b7280', marginBottom: 8 }}>INTELLIGENCE LAYER</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Regulatory Updates</h1>
          <p style={{ color: '#9ca3af', marginTop: 10, fontSize: 15, lineHeight: 1.6 }}>
            Material regulatory and tax changes across all 15 GNCO jurisdictions. Updated by our research team. All updates
            sourced from official authorities.
          </p>
          <div
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: '#111827',
              border: '1px solid #1f2937',
              borderRadius: 8,
              display: 'inline-block',
              fontSize: 12,
              color: '#9ca3af',
            }}
          >
            {active.length} active updates · Last reviewed: {DATA_VERSION.lastUpdated} · {DATA_VERSION.label}
          </div>
        </div>

        {/* HIGH Impact Section */}
        {highImpact.length > 0 && (
          <>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#ef4444', marginBottom: 12 }}>
              ⚠️ HIGH IMPACT — ACTION MAY BE REQUIRED
            </div>
            {highImpact.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
            <div style={{ height: 32 }} />
          </>
        )}

        {/* Other Updates */}
        {other.length > 0 && (
          <>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#6b7280', marginBottom: 12 }}>OTHER UPDATES</div>
            {other.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </>
        )}

        {/* Disclaimer */}
        <div
          style={{
            marginTop: 40,
            padding: '14px 18px',
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: 8,
            fontSize: 11,
            color: '#6b7280',
            lineHeight: 1.7,
          }}
        >
          All regulatory update summaries are for informational purposes only and do not constitute legal, tax, or investment
          advice. Regulatory positions are complex and fact-specific. Always verify with qualified counsel in the relevant
          jurisdiction before taking action. GNCO updates this page on a best-efforts basis. Last verified: 19 February 2026.
        </div>
      </div>
    </div>
  )
}

function UpdateCard({ update }: { update: RegulatoryUpdate }) {
  const cfg = IMPACT_CONFIG[update.impact]
  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid #1f2937',
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 10,
        padding: '20px 24px',
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            <span
              style={{
                fontSize: 10,
                padding: '2px 10px',
                borderRadius: 10,
                background: cfg.bg,
                color: cfg.color,
                fontWeight: 700,
              }}
            >
              {update.impact}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: '2px 10px',
                borderRadius: 10,
                background: '#1f2937',
                color: '#9ca3af',
                fontWeight: 600,
              }}
            >
              {update.jurisdiction_name}
            </span>
            {update.action_required && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 10px',
                  borderRadius: 10,
                  background: '#450a0a',
                  color: '#fca5a5',
                  fontWeight: 600,
                }}
              >
                ACTION REQUIRED
              </span>
            )}
            {update.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: '#111827',
                  color: '#6b7280',
                  border: '1px solid #1f2937',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>{update.title}</h3>
          <p style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: 13, lineHeight: 1.6 }}>{update.summary}</p>

          {update.action_required && update.action_description && (
            <div
              style={{
                padding: '8px 12px',
                background: '#450a0a',
                border: '1px solid #7f1d1d',
                borderRadius: 6,
                fontSize: 12,
                color: '#fca5a5',
                lineHeight: 1.5,
                marginBottom: 10,
              }}
            >
              <strong>Action:</strong> {update.action_description}
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6b7280' }}>
            <span>
              Effective: <strong style={{ color: '#d1d5db' }}>{update.effective_date}</strong>
            </span>
            <a href={update.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
              {update.source_title} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
