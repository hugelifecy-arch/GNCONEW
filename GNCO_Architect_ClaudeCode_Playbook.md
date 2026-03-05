# GNCO — Architect Engine & Results Page
# Claude Code Fix Playbook
# Generated: March 2026 | Updated: March 2026 (v2 — codebase-verified)

---

## HOW TO USE THIS PLAYBOOK

Paste each prompt block directly into Claude Code in sequence.
Complete and verify each fix before moving to the next.
Prompts are ordered by priority: Critical > Data/Accuracy > UX > Enhancements.

### Codebase Context (verified)

The GNCO platform is a Next.js App Router application located at `gnco-platform/`.

**Key architecture details:**
- The wizard is a single monolithic component: `src/components/architect/IntakeWizard.tsx` (500 lines, all 8 steps inline)
- There is a separate `WizardStep.tsx` component but it is a **stub placeholder** (3 lines, not used)
- Wizard state is managed by a custom hook: `src/hooks/useWizard.ts` using `localStorage` (`gnco:architect-brief`) and `sessionStorage` (`gnco:architect-step`)
- The results page delegates to: `src/components/architect/ArchitectResultsClient.tsx`
- There is a separate `RecommendationPanel.tsx` with richer results UI (score bars, LP tax modeler, PDF/Excel export, BookCallCTA) but it is **not rendered** by the current `ArchitectResultsClient.tsx` — the results client has its own simpler inline rendering
- Scoring logic lives in: `src/lib/architect-logic.ts` (`generateRecommendations()`)
- A second scoring module exists: `src/lib/jurisdiction-scoring.ts` (`scoreJurisdiction()`) — used separately, not by the wizard results
- Jurisdiction data: `src/lib/jurisdiction-data.ts` (16 jurisdictions, each with `lastUpdated`, `dataVersion`, `sourceNote` fields already present)
- Type definitions: `src/lib/types.ts` (defines `FundStrategy`, `ArchitectBrief`, `JurisdictionProfile`, `FundStructureRecommendation`, etc.)
- Demo user label: `src/components/shared/DemoDatasetNotice.tsx` (inline amber banner)
- Sidebar user label: `src/components/navigation/AppSidebar.tsx` (shows "AD" avatar + "Demo User" text at bottom)
- PDF generation utility: `src/lib/pdf.ts` (raw PDF builder — `buildSimplePdf()`, `buildAttorneyBriefPdf()`)
- Email capture / attorney brief gate: `src/components/architect/EmailCaptureForm.tsx`
- BookCallCTA component: `src/components/architect/BookCallCTA.tsx` (Calendly link, "FREE Launch Offer")

**Fund types currently in Step 1** (8 types):
`private-equity`, `real-estate`, `private-credit`, `venture-capital`, `real-assets`, `multi-strategy`, `co-investment`, `continuation-fund`

**LP profiles currently in Step 4** (8 options — geography + type mixed):
`us-taxable`, `us-tax-exempt`, `european`, `middle-eastern`, `asian`, `family-office`, `sovereign-wealth`, `mixed`

**The wizard has 8 steps** (tracked as steps 1-8, with step 9 triggering redirect to results):
1. Fund Type, 2. Fund Size, 3. GP Domicile, 4. LP Base, 5. Investment Geography, 6. Priorities, 7. Timeline, 8. Experience

---

---

# ═══════════════════════════════════════════
# PHASE 1 — CRITICAL FIXES
# ═══════════════════════════════════════════

---

## FIX 01 — Results Page: Demo Fallback State
**Problem:** `/architect/results` shows a dead-end error when accessed directly without wizard session data. This is the worst possible first impression for institutional prospects.

**Affected file:** `src/components/architect/ArchitectResultsClient.tsx` (lines 86-94, the `if (!brief)` block)

```
In src/components/architect/ArchitectResultsClient.tsx, find the empty state block at ~line 86:

  if (!brief) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-14">
        <h1 className="font-serif text-4xl">Architect Results</h1>
        <p className="text-text-secondary">No wizard input found. Complete the architect wizard first.</p>
        <Link href="/architect" className="text-accent-gold">Go to Architect Wizard →</Link>
      </main>
    )
  }

Replace this with a fully populated DEMO fallback that automatically activates when no session data exists.

The demo fallback should:
1. Create a hardcoded demo brief object matching the ArchitectBrief type from src/lib/types.ts:
   {
     strategy: 'private-equity' as FundStrategy,
     fundSize: '250m-1b' as FundSize,
     gpDomicile: 'United States',
     lpProfile: ['us-taxable', 'us-tax-exempt', 'european'] as LPProfile[],
     assetGeography: ['North America', 'Europe'],
     priorities: ['tax-efficiency', 'lp-familiarity', 'cost-of-formation', 'speed-to-close', 'regulatory-simplicity', 'privacy', 'fundraising-flexibility'] as Priority[],
     timeline: '6-months',
     experience: 'experienced',
   }

2. Call generateRecommendations(demoBrief, JURISDICTIONS) (already imported) to generate real scored results from the demo inputs.

3. Display a top-banner notice:
   "You are viewing a sample result. Start the Architect Wizard to generate your personalised analysis →"
   Style this as a subtle amber/gold info banner (use the existing accent-gold color tokens), NOT a blocking modal. Link "Start the Architect Wizard" to /architect.

4. Render the full results layout (same as the existing results rendering below the if-block) using the demo data — including the top 3 jurisdiction cards, trade-off sliders, methodology section, and red flag engine.

5. Keep the existing disclaimer footer (DataVersionBadge) intact.

6. Do NOT redirect away from the page — always render the demo fallback in place.

NOTE: The existing ArchitectResultsClient only shows 3 jurisdiction cards with basic info. The richer RecommendationPanel component in src/components/architect/RecommendationPanel.tsx is NOT currently wired up. You can either:
  (a) Wire up RecommendationPanel for both demo and real results, OR
  (b) Keep the simpler inline rendering but ensure demo data flows through it.
```

---

## FIX 02 — Results Page: "Back" CTA on Empty State
**Problem:** The current error state has only one CTA ("Go to Architect Wizard →"). If a user arrived via a shared link, they have no context.

**Affected file:** `src/components/architect/ArchitectResultsClient.tsx` (lines 86-94)

```
On the /architect/results page, when no session data exists AND before the demo fallback from FIX 01 is complete, update the current empty error state UI as follows:

1. Replace the plain "No wizard input found" text with a structured layout:
   - Headline: "Your Results Will Appear Here"
   - Subheading: "Complete the 8-step Architect Wizard to receive your personalised jurisdiction analysis across 16 fund domiciles."
   - Primary CTA button: "Start the Architect Wizard →" (links to /architect)
   - Secondary text: "Want to see a sample? View Demo Results" (triggers the demo fallback mode from FIX 01)

2. Add 3 icon+text value proposition bullets below (use lucide-react icons — already installed):
   - Globe icon: "16 jurisdictions modelled in real time"
   - Coins icon: "Cost, timeline & tax efficiency scoring"
   - FileText icon: "Export-ready PDF report"

Keep the disclaimer footer visible (DataVersionBadge component).
```

---

## FIX 03 — Wizard Step 1: Add Missing Fund Types
**Problem:** "Hedge Fund / Open-Ended" and "Fund of Funds" are absent from Step 1. Users attempting to structure these will get completely wrong jurisdiction recommendations.

**Affected files:**
- `src/lib/types.ts` — add new values to `FundStrategy` union type
- `src/components/architect/IntakeWizard.tsx` — add to `step1Options` array (~line 38)
- `src/lib/architect-logic.ts` — may need scoring adjustments for new types

```
1. In src/lib/types.ts, extend the FundStrategy type to add:
   | 'hedge-fund'
   | 'fund-of-funds'

2. In src/components/architect/IntakeWizard.tsx, add two new entries to the step1Options array (currently at ~line 38-47):

NEW OPTION A:
- value: 'hedge-fund'
- label: 'Hedge Fund'
- description: 'Open-ended liquid and multi-strategy vehicles'
- icon: LineChart (already imported from lucide-react)

NEW OPTION B:
- value: 'fund-of-funds'
- label: 'Fund of Funds'
- description: 'Diversified allocations to underlying fund managers'
- icon: Layers (already imported from lucide-react)

Note: LineChart and Layers are already imported in IntakeWizard.tsx but Layers is already used for multi-strategy. Use a different icon for one of them — import "BarChart3" or "Network" from lucide-react for Fund of Funds.

3. Add a notice at the bottom of Step 1 (inside the currentStep === 1 block, after the grid div, before the closing fragment):
"GNCO models closed-end and open-end fund structures. Hedge Fund and UCITS structures follow separate regulatory pathways — results will reflect open-ended jurisdiction suitability."

4. In src/lib/architect-logic.ts, review the applyBriefRules function. The scoring logic currently does not branch on strategy except for 'real-estate' (Cyprus bonus at ~line 87). Add basic handling for hedge-fund and fund-of-funds, or flag them as "Beta" with a badge on the results page:
"Hedge Fund / FoF structuring recommendations are in beta. Results are indicative only."
```

---

## FIX 04 — Wizard Step 1: Continuation Fund Conflict Warning
**Problem:** Continuation funds have mandatory LP conflict-of-interest disclosures and ILPA guidance implications. No warning exists.

**Affected file:** `src/components/architect/IntakeWizard.tsx` — inside the `currentStep === 1` block (~line 266-289)

```
In IntakeWizard.tsx, inside the currentStep === 1 block, after the fund type grid (after the closing </div> of the grid at ~line 288), add a conditional inline alert:

When brief.strategy === 'continuation-fund', render an inline contextual alert:

Alert style: amber warning box using existing Tailwind tokens (border-accent-gold/30 bg-accent-gold/10 text-accent-gold)
Alert content:
  Heading: "Continuation Fund — Key Consideration"
  Body: "GP-led continuation vehicles involve inherent LP conflicts of interest. ILPA guidelines recommend independent LP advisory committee consent and third-party fairness opinions. GNCO's recommendations assume these governance requirements will be addressed with qualified legal counsel before formation."
  Link: "Learn more about ILPA Continuation Fund Guidelines →" (open in new tab, href="https://ilpa.org", rel="noopener noreferrer")

The alert should:
- Appear when brief.strategy === 'continuation-fund'
- Disappear if the user selects a different fund type (reactive via brief.strategy state)
- NOT block the user from continuing — it is informational only
```

---

## FIX 05 — Wizard Step 1: Fix Co-Investment Description
**Problem:** Co-Investment is described only as "Deal-by-deal capital sleeves" — missing dedicated co-invest fund structures which have different jurisdiction logic.

**Affected file:** `src/components/architect/IntakeWizard.tsx` — step1Options array (~line 45)

```
1. In IntakeWizard.tsx, update the co-investment entry in step1Options (line ~45):

Change:
{ value: 'co-investment', label: 'Co-Investment', description: 'Deal-by-deal capital sleeves', icon: Banknote },

To:
{ value: 'co-investment', label: 'Co-Investment', description: 'Deal-by-deal sleeves and dedicated co-invest funds', icon: Banknote },

2. Then, in the currentStep === 1 block, when brief.strategy === 'co-investment', show an inline prompt below the grid:
"Are you structuring a deal-by-deal sleeve or a dedicated committed-capital co-invest fund?"
With two radio-style buttons: "Deal-by-deal" | "Dedicated committed capital"

Store this selection using updateBrief({ coInvestType: 'deal-by-deal' | 'dedicated' }).

Note: You will need to extend the ArchitectBrief interface in src/lib/types.ts to add:
  coInvestType?: 'deal-by-deal' | 'dedicated'

Pass this through to the results scoring logic in architect-logic.ts.
```

---

## FIX 06 — Wizard Step 1: Back Button on Step 1
**Problem:** Step 1 shows a "Back" button that is disabled but still visible.

**Affected file:** `src/components/architect/IntakeWizard.tsx` (~line 483-485)

```
In IntakeWizard.tsx, find the Back button in the sticky bottom bar (~line 484):

<button onClick={back} disabled={currentStep === 1} className="flex items-center gap-1 text-sm disabled:opacity-40">
  <ChevronLeft className="h-4 w-4" /> Back
</button>

The button is currently disabled with opacity-40 when currentStep === 1. This is better than nothing, but for institutional credibility, hide it entirely:

Change to:
{currentStep > 1 && (
  <button onClick={back} className="flex items-center gap-1 text-sm">
    <ChevronLeft className="h-4 w-4" /> Back
  </button>
)}
{currentStep === 1 && <div />}

The empty <div /> preserves the flex justify-between spacing.
```

---

---

# ═══════════════════════════════════════════
# PHASE 2 — DATA ACCURACY FIXES
# ═══════════════════════════════════════════

---

## FIX 07 — Add Jurisdiction Data Timestamps to Results UI
**Problem:** Formation cost and timeline data is undated on the results page. The jurisdiction data already has `lastUpdated` and `dataVersion` fields, but the Results page doesn't display them per-jurisdiction.

**Affected files:**
- `src/components/architect/ArchitectResultsClient.tsx` — add per-jurisdiction date display
- `src/lib/jurisdiction-data.ts` — data already has `lastUpdated: '2026-02-19'` fields (verified)

```
The jurisdiction data in src/lib/jurisdiction-data.ts already includes:
  - lastUpdated: '2026-02-19' (per jurisdiction)
  - dataVersion: '2.1'
  - sourceNote: 'Aggregated service provider quotes + [regulator] fee schedule'

These fields are NOT currently shown on the results page.

In ArchitectResultsClient.tsx, for each jurisdiction card in the topThree.map() section (~line 104-111):

1. Look up the full jurisdiction profile from JURISDICTIONS (already imported) by matching result.jurisdiction to j.name.

2. Below the reasoning text, add:
   "Cost & timeline data verified: [jurisdiction.lastUpdated]"
   Style as small muted text (text-xs text-text-tertiary).

3. If the lastUpdated date is more than 6 months old (compare against current date), show:
   "⚠ Data may be outdated — verify with local counsel" in amber (text-accent-gold).

4. Add a global note in the results page header section (~line 98-101), below the existing subtitle:
   "Jurisdiction data is reviewed quarterly. Formation costs and regulatory timelines are subject to change. Always verify current figures with local counsel."
   Style as text-xs text-text-tertiary.
```

---

## FIX 08 — Architect Engine: Expose Scoring Methodology
**Problem:** Jurisdiction suitability scores (0-100) are unauditable. Institutional investors and their counsel will not trust black-box scores.

**Affected files:**
- `src/components/architect/ArchitectResultsClient.tsx` — add expandable score breakdown
- `src/lib/architect-logic.ts` — scoring model reference (weights are in BASE_WEIGHTS array: [3, 2, 1.5, 1.2, 1])

```
The scoring model in src/lib/architect-logic.ts works as follows:
- buildBaseScore() generates per-dimension scores (0-100) for: taxEfficiency, lpFamiliarity, regulatorySimplicity, speedToClose, costScore, privacyScore
- applyBriefRules() adjusts scores based on the user's brief inputs
- weightedOverallScore() applies priority-based weighting using BASE_WEIGHTS = [3, 2, 1.5, 1.2, 1] mapped to the user's ranked priorities

The FundStructureRecommendation type already includes a full `scores: JurisdictionScore` object with all 6 dimensions plus overallScore. These scores are available in ArchitectResultsClient but NOT displayed.

1. In ArchitectResultsClient.tsx, for each jurisdiction card in the topThree section, add an expandable "Score Breakdown" section (collapsed by default, expand on click):

The breakdown should show:
  - Tax Efficiency: [scores.taxEfficiency]/100
  - LP Familiarity: [scores.lpFamiliarity]/100
  - Regulatory Simplicity: [scores.regulatorySimplicity]/100
  - Speed to Close: [scores.speedToClose]/100
  - Cost Score: [scores.costScore]/100
  - Privacy: [scores.privacyScore]/100
  - Overall (weighted): [scores.overallScore]

2. The existing "Why this ranked #1" section (~line 126-137) already mentions methodology weights. Enhance it with a link:
   "How scores are calculated" linking to /methodology (page already exists at src/components/marketing/MethodologyPageClient.tsx).

3. Add to the methodology explanation:
   - Scores are relative (benchmarked against the 16 modelled jurisdictions)
   - Scores are customised based on wizard inputs (a different GP profile produces different scores)
   - Priority ranking determines weighting: #1 priority gets 3x weight, #2 gets 2x, #3 gets 1.5x, etc.
```

---

## FIX 09 — Wizard Step 4: LP Base — Add Investor Type Dimension
**Problem:** Step 4 (LP Base) mixes geography and investor type in a flat list. LP *type* (taxable individual, pension/endowment, sovereign wealth fund, insurance company) fundamentally changes jurisdiction suitability.

**Affected files:**
- `src/components/architect/IntakeWizard.tsx` — Step 4 block (~line 353-375)
- `src/lib/types.ts` — may need new type for LP investor types
- `src/lib/architect-logic.ts` — scoring adjustments

```
Currently, Step 4 in IntakeWizard.tsx (~line 353-375) shows a flat grid of 8 LP profile options that mix geography and type:
us-taxable, us-tax-exempt, european, middle-eastern, asian, family-office, sovereign-wealth, mixed

These are already stored as brief.lpProfile (LPProfile[]) and used in architect-logic.ts for scoring.

The existing options already cover some investor types (family-office, sovereign-wealth, us-tax-exempt). However, key types are missing. Add a second selection section within Step 4:

After the current LP geography/type grid, add:
Heading: "What types of investors will your LP base include?"
(Select all that apply)

Options (add as a new lpInvestorTypes field, or integrate as tooltips on existing options):
- For "US Tax-Exempt": add tooltip: "May require blocker entities to avoid UBTI"
- For "Sovereign Wealth": add tooltip: "May require specific structuring for political sensitivity and FOIA considerations"
- New option: "Insurance Companies" with tooltip: "Often subject to 'look-through' asset rules"
- New option: "Retail / High-Net-Worth (non-qualified)"

At minimum, use the existing lpProfile selections to:
1. Flag when a Cayman blocker is recommended (already partially done in redFlagRules in ArchitectResultsClient — rule rf-1)
2. Flag when AIFMD marketing passport is relevant (already partially done — rule rf-5)
3. Flag when FATCA/CRS reporting obligations are elevated (triggered by: mixed US + non-US LP base)
```

---

## FIX 10 — Wizard Step 7: Timeline — Add Regulator Backlog Warnings
**Problem:** Static timeline estimates don't reflect current regulator processing times. The jurisdiction data has setupTimeWeeks but these are not validated against the user's timeline.

**Affected files:**
- `src/lib/jurisdiction-data.ts` — verify/update setupTimeWeeks values
- `src/components/architect/ArchitectResultsClient.tsx` — add timeline warnings

```
Current setupTimeWeeks in jurisdiction-data.ts (verified):
- Cayman Islands: { min: 1, max: 2 } — this is for ELP only, not registered/licensed funds
- Luxembourg: { min: 2, max: 12 } — OK for SCSp, low for RAIF/SIF
- Delaware: { min: 1, max: 7 }
- Singapore: { min: 1, max: 24 }
- Ireland: { min: 1, max: 12 }
- BVI: { min: 1, max: 2 }
- Jersey: { min: 1, max: 10 }
- Switzerland: { min: 12, max: 52 }
- Hong Kong: { min: 1, max: 24 }
- Cyprus: { min: 2, max: 24 }
- Dubai (DIFC): { min: 1, max: 24 }

Review and update these to reflect realistic 2025/2026 processing:
- Cayman: min 1 is accurate for ELP; for Registered Fund (CIMA) add note about 6-10 weeks
- Luxembourg RAIF: should note 10-16 weeks; SCSp unregulated is 2-4 weeks
- Ireland QIAIF: 24+ weeks is missing context (current max is 12)
- Singapore VCC: MAS processing is 8-14 weeks

For each jurisdiction on the Results page, add a dynamic disclaimer:
"Processing times are current estimates as of Q1 2026. Actual timelines depend on fund complexity and regulator workload."

If the user's required timeline (brief.timeline) is shorter than a jurisdiction's minimum setupTimeWeeks, flag that jurisdiction with a warning badge on the Results page:
"⚠ Timeline Risk — formation may not complete within your target window"

Timeline mapping for comparison:
- '30-days' = ~4 weeks
- '60-90-days' = ~9-13 weeks
- '6-months' = ~26 weeks
- 'planning-only' = no constraint
```

---

---

# ═══════════════════════════════════════════
# PHASE 3 — UX FIXES
# ═══════════════════════════════════════════

---

## FIX 11 — Wizard: Estimated Completion Time
**Problem:** No time estimate shown. Reduces friction for busy allocators.

**Affected file:** `src/app/(app)/architect/page.tsx` (~line 9) OR `src/components/architect/IntakeWizard.tsx`

```
On the Architect Wizard page, add a single line of muted text.

Option A — In src/app/(app)/architect/page.tsx, below the h1 "Architect Engine" (~line 9):
Add: <p className="text-sm text-text-secondary">8 steps · takes approximately 3-4 minutes</p>

Option B — In IntakeWizard.tsx, inside the aside (sidebar) section, below the existing "Your session is saved automatically." text (~line 244):
Add a line: "8 steps · approximately 3-4 minutes"

Keep it subtle: text-xs or text-sm, text-text-tertiary color.
```

---

## FIX 12 — Wizard: Per-Step Autosave Confirmation
**Problem:** "Your session is saved automatically" is stated once in the sidebar but gives no visual confirmation as users progress.

**Affected file:** `src/components/architect/IntakeWizard.tsx`

```
The useWizard hook (src/hooks/useWizard.ts) persists briefData to localStorage on every change (useEffect at line 42-44). This happens automatically.

In IntakeWizard.tsx, add a brief autosave confirmation:

1. Add state: const [showSaved, setShowSaved] = useState(false)
2. After each successful step completion (in the proceed() function at ~line 187), trigger:
   setShowSaved(true)
   setTimeout(() => setShowSaved(false), 2000)

3. Render a small "Saved ✓" indicator near the step counter in the sidebar or in the top-right area of the main content section. Use:
   {showSaved && <span className="text-xs text-green-500 transition-opacity">Saved ✓</span>}

4. Use a fade-out animation (opacity transition).

This applies to all 8 steps (the proceed function is shared).
```

---

## FIX 13 — Wizard: Step 1 — Add Hover/Tap Expanded Descriptions
**Problem:** Fund type cards show only a name + one-liner. Complex types need more context.

**Affected file:** `src/components/architect/IntakeWizard.tsx` — step1Options array and Step 1 rendering block

```
In IntakeWizard.tsx, enhance each fund type card in Step 1:

1. Extend the step1Options array type to include an expandedDescription field:
   { value: FundStrategy; label: string; description: string; expandedDescription: string; icon: ... }

2. Add expandedDescription content for all types. Examples:

- private-equity: "Closed-end vehicles targeting control or significant minority positions in private companies. Typical LPs include pension funds, endowments, and family offices. Cayman and Delaware are the most common domiciles."
- real-estate: "Closed-end vehicles focused on property acquisition, value-add, and core strategies. LP bases typically include pension funds and insurance companies. Luxembourg and Cayman are dominant domiciles for cross-border capital."
- continuation-fund: "A GP-led secondary transaction where assets from a maturing fund are transferred to a new vehicle. Requires existing LP consent and independent fairness opinion. Subject to ILPA conflict-of-interest guidelines."
- co-investment: "Deal-by-deal or committed capital vehicles that invest alongside a main fund. Structure varies significantly based on commitment model. Delaware and Cayman are most common."
(Write out descriptions for all 8+ fund types)

3. Add an info icon (use lucide-react Info icon) to the top-right corner of each card.
4. On hover (desktop) or tap (mobile), show the expandedDescription in a tooltip or inline expansion below the card.
```

---

## FIX 14 — Wizard: Add "I'm Not Sure Yet" Option
**Problem:** Users in exploratory mode abandon the wizard when forced to commit to a fund type they haven't decided on.

**Affected files:**
- `src/lib/types.ts` — add 'explore-all' to FundStrategy union
- `src/components/architect/IntakeWizard.tsx` — add card to step1Options
- `src/components/architect/ArchitectResultsClient.tsx` — handle explore mode

```
1. In src/lib/types.ts, add to FundStrategy: | 'explore-all'

2. In IntakeWizard.tsx, add a final card to step1Options:
- value: 'explore-all'
- label: "I'm Not Sure Yet"
- description: "Explore all fund structures side by side"
- icon: Compass (import from lucide-react)
- Style differently: use a dashed border (border-dashed) to distinguish it

3. When 'explore-all' is selected and results are generated:
   In ArchitectResultsClient.tsx, detect brief.strategy === 'explore-all' and show ALL fund types as rows in a comparison table rather than a single-structure deep-dive.
   Add a note: "You selected 'Explore All' mode. Results show comparative suitability across fund structures."
```

---

## FIX 15 — Demo User Label: Restyle for Institutional Credibility
**Problem:** The DemoDatasetNotice component appears as a prominent amber banner on pages. The sidebar shows "AD / Demo User" text.

**Affected files:**
- `src/components/shared/DemoDatasetNotice.tsx` — restyle from banner to compact badge
- `src/components/navigation/AppSidebar.tsx` — restyle "Demo User" label (~line 122-126)

```
1. In DemoDatasetNotice.tsx (currently 7 lines), restyle:

Current: amber banner with full text "Demo dataset: values and people shown in this environment are sample data for product demonstration."

Replace with: a compact pill/badge.
- Badge text: "DEMO MODE"
- Style: small outlined badge (border border-text-tertiary text-text-tertiary), 11px font (text-[11px]), rounded-full, px-2 py-0.5
- On hover, show a tooltip with the full demo dataset explanation
- Remove the verbose text from the main content area

2. In AppSidebar.tsx (~line 122-126), the bottom section shows:
   <span className="flex h-8 w-8 ...">AD</span>
   <span className="hidden truncate text-sm text-text-secondary lg:inline">Demo User</span>

This is fine for the sidebar. No change needed here unless you want to add the DEMO MODE badge near the GNCO logo area instead.
```

---

## FIX 16 — Step 8 (Experience): Add Self-Reported Data Disclaimer
**Problem:** Step 8 asks about GP experience to calibrate recommendations, but GNCO cannot verify claims.

**Affected file:** `src/components/architect/IntakeWizard.tsx` — currentStep === 8 block (~line 455-478)

```
In IntakeWizard.tsx, inside the currentStep === 8 block (~line 455), add a disclaimer text below the heading "Your fund formation experience?" and before the experience options:

Text:
"GNCO models recommendations based on self-reported experience data. We do not verify credentials or prior fund history. Regulatory bodies (SEC, CIMA, CSSF, MAS) will conduct their own due diligence during the registration process."

Style: text-xs text-text-tertiary italic, max-w-2xl mx-auto text-center

Additionally, when the user selects 'first-fund' (the first option, value 'first-fund' at ~line 460), trigger an inline guidance note below the options:
"As a first-time GP, certain jurisdictions and fund structures have higher minimum requirements or require additional regulatory approvals. Your results will highlight these thresholds."

This conditional is: {brief.experience === 'first-fund' && <p>...</p>}
```

---

---

# ═══════════════════════════════════════════
# PHASE 4 — HIGH-VALUE FEATURE ADDITIONS
# ═══════════════════════════════════════════

---

## FIX 17 — Results Page: PDF Export
**Problem:** No prominent PDF export on the results page. The RecommendationPanel has export buttons but is NOT rendered by ArchitectResultsClient.

**Affected files:**
- `src/components/architect/ArchitectResultsClient.tsx` — add export button
- `src/lib/pdf.ts` — already has buildSimplePdf() and buildAttorneyBriefPdf()
- OR use the existing `generateSimplePdf()` helper from `RecommendationPanel.tsx`

```
Note: The codebase already has PDF infrastructure:
- src/lib/pdf.ts has buildSimplePdf() and buildAttorneyBriefPdf() (server-side Buffer-based)
- RecommendationPanel.tsx has a client-side generateSimplePdf() function (~line 45-56) that creates and downloads PDFs using Blob
- RecommendationPanel.tsx also has an exportPdf() function (~line 211-224) that generates a pre-legal brief PDF
- There's also Excel export via src/lib/excel-export.ts (exportArchitectResults())

The simplest path is to add export buttons to ArchitectResultsClient.tsx:

1. Add a "Export PDF Report" button in the page header (top right, prominent).
   Use the client-side approach from RecommendationPanel (Blob + createObjectURL).

2. The PDF should include:
   - Title: "GNCO Fund Structure Analysis"
   - User's fund profile summary (from brief)
   - Date generated
   - Top 3 jurisdiction recommendations with scores, costs, timelines
   - Full disclaimer

3. Add a secondary "Download Excel" button using the existing exportArchitectResults function from src/lib/excel-export.ts.

4. Consider importing and rendering the ShareResultsButton from RecommendationPanel.tsx, which already handles share link generation via /api/architect/share.
```

---

## FIX 18 — Results Page: "Request a Consultation" CTA
**Problem:** The BookCallCTA component exists but is NOT rendered on the ArchitectResultsClient page.

**Affected file:** `src/components/architect/ArchitectResultsClient.tsx`

```
The BookCallCTA component (src/components/architect/BookCallCTA.tsx) already exists with:
- "Want Expert Guidance?" heading
- Strategy call booking via Calendly
- Value props (Expert Review, Customized Plan, Action Items)
- Pricing: "FREE (Launch Offer)" crossed out from €1,500

It is rendered in RecommendationPanel.tsx (~line 304) but NOT in ArchitectResultsClient.tsx.

Simply import and render it in ArchitectResultsClient.tsx:

1. Import: import { BookCallCTA } from '@/components/architect/BookCallCTA'
2. Add it after the email capture / attorney brief section (~line 158), before the DataVersionBadge:
   <BookCallCTA />

Alternatively, add a simpler sticky CTA section:
- Heading: "Ready to proceed with fund formation?"
- Subheading: "Connect with a vetted fund formation specialist who can act on these recommendations."
- Primary button: "Request a Consultation →" (links to Calendly or opens modal)
```

---

## FIX 19 — Results Page: Value Proposition Anchor
**Problem:** No competitive framing vs. hiring a law firm.

**Affected file:** `src/components/architect/ArchitectResultsClient.tsx`

```
In ArchitectResultsClient.tsx, add a subtle value-proposition banner directly below the page heading (~line 99), above the results:

Text:
"This analysis covers 16 jurisdictions across 47 regulatory variables. Equivalent work from a fund formation law firm typically costs $8,000-$20,000 and takes 2-4 weeks. GNCO delivered it in under 5 minutes."

Style: small card with bg-bg-elevated border border-bg-border rounded-lg p-4, text-sm text-text-secondary

Make this dismissible (X button). Use localStorage to remember dismissal:
Key: 'gnco_value_prop_dismissed'
```

---

## FIX 20 — Glossary Tooltip Layer (Global)
**Problem:** Technical terms throughout the platform (RAIF, AIFMD, UBTI, SCSp, CIMA, CSSF, etc.) are unexplained.

**New files to create:**
- `src/lib/glossary.ts` — glossary data
- `src/components/ui/GlossaryTerm.tsx` — tooltip component
- `src/app/(app)/glossary/page.tsx` — glossary page

```
1. Create src/lib/glossary.ts with at least these terms:
   - AIFMD: "EU Alternative Investment Fund Managers Directive — governs marketing of funds to EU professional investors"
   - RAIF: "Reserved Alternative Investment Fund — Luxembourg fund structure requiring no direct regulatory approval, but must appoint an AIFM"
   - CIMA: "Cayman Islands Monetary Authority — the fund regulator for Cayman Islands funds"
   - CSSF: "Commission de Surveillance du Secteur Financier — Luxembourg's financial regulator"
   - SCSp: "Societe en Commandite Speciale — Luxembourg's equivalent of a limited partnership, no legal personality"
   - UBTI: "Unrelated Business Taxable Income — US tax issue for tax-exempt LPs investing in operating companies"
   - NPPR: "National Private Placement Regime — allows non-EU AIFMs to market to EU investors without full AIFMD passport"
   - ILPA: "Institutional Limited Partners Association — industry body setting LP governance standards"
   - GP/LP/AIF/FATCA/CRS/KYC/NAV (see original playbook for full definitions)

2. Create src/components/ui/GlossaryTerm.tsx:
   - Wraps any term on the page
   - Shows a dotted underline (border-b border-dotted border-text-tertiary)
   - On hover/tap, displays a tooltip with the definition
   - Tooltip includes a "Full Glossary →" link to /glossary

3. Apply <GlossaryTerm> to key terms across:
   - ArchitectResultsClient.tsx (jurisdiction names, vehicle types)
   - IntakeWizard.tsx (fund type descriptions)
   - RecommendationPanel.tsx (scoring labels)

4. Create src/app/(app)/glossary/page.tsx listing all terms alphabetically.
```

---

---

# ═══════════════════════════════════════════
# IMPLEMENTATION ORDER & VERIFICATION
# ═══════════════════════════════════════════

## Recommended Sequence

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 1 | FIX 01 — Results demo fallback | Medium | CRITICAL |
| 2 | FIX 06 — Hide Back on Step 1 | Low | Quick win |
| 3 | FIX 03 — Add Hedge Fund + FoF types | Medium | CRITICAL |
| 4 | FIX 15 — Restyle Demo User label | Low | Credibility |
| 5 | FIX 04 — Continuation Fund warning | Low | Risk mitigation |
| 6 | FIX 05 — Fix Co-Investment description | Low | Accuracy |
| 7 | FIX 11 — Add "3-4 minutes" copy | Low | UX |
| 8 | FIX 12 — Per-step autosave confirmation | Low | UX |
| 9 | FIX 07 — Jurisdiction data timestamps | Medium | Credibility |
| 10 | FIX 08 — Score methodology transparency | Medium | Credibility |
| 11 | FIX 09 — LP Base investor types | High | Data accuracy |
| 12 | FIX 10 — Timeline regulator warnings | Medium | Data accuracy |
| 13 | FIX 02 — Better empty state UI | Low | UX |
| 14 | FIX 13 — Hover expanded descriptions | Medium | UX |
| 15 | FIX 14 — "I'm Not Sure Yet" option | Medium | UX |
| 16 | FIX 16 — Step 8 experience disclaimer | Low | Risk |
| 17 | FIX 17 — PDF Export | Medium | Feature (infra exists) |
| 18 | FIX 18 — Consultation CTA | Low | Revenue (component exists) |
| 19 | FIX 19 — Value prop banner | Low | Conversion |
| 20 | FIX 20 — Glossary tooltip system | High | Credibility |

---

## Verified File Map (actual paths)

```
src/app/(app)/architect/page.tsx                    — Wizard page wrapper
src/app/(app)/architect/results/page.tsx            — Results page wrapper (thin, delegates to client)
src/components/architect/IntakeWizard.tsx            — Full wizard (all 8 steps, 500 lines)
src/components/architect/ArchitectResultsClient.tsx  — Results page client component
src/components/architect/RecommendationPanel.tsx     — Rich results panel (NOT currently rendered)
src/components/architect/BookCallCTA.tsx             — Consultation CTA (exists, not rendered on results)
src/components/architect/EmailCaptureForm.tsx        — Email gate before attorney brief
src/components/architect/WizardStep.tsx              — STUB (3 lines, unused)
src/components/shared/DemoDatasetNotice.tsx          — Demo banner component
src/components/navigation/AppSidebar.tsx             — Sidebar with "Demo User" label
src/hooks/useWizard.ts                               — Wizard state hook (localStorage + sessionStorage)
src/lib/types.ts                                     — All TypeScript types
src/lib/architect-logic.ts                           — Scoring engine (generateRecommendations)
src/lib/jurisdiction-scoring.ts                      — Separate scoring module (scoreJurisdiction)
src/lib/jurisdiction-data.ts                         — 16 jurisdiction profiles (with lastUpdated)
src/lib/pdf.ts                                       — PDF generation utilities
src/lib/excel-export.ts                              — Excel export utility
src/lib/analytics.ts                                 — Analytics tracking (track, trackEvent)
src/components/ui/GlossaryTerm.tsx                   — NEW: Glossary tooltip (FIX 20)
src/app/(app)/glossary/page.tsx                      — NEW: Glossary page (FIX 20)
src/lib/glossary.ts                                  — NEW: Glossary data (FIX 20)
```

---

## Verification Checklist (Run After Each Fix)

After completing each Claude Code prompt:

- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors in browser dev tools
- [ ] Vercel preview deployment builds successfully
- [ ] Test on mobile viewport (375px width)
- [ ] Test the specific scenario the fix addresses
- [ ] Check that existing functionality on that page/step still works

---

## Key Technical Notes

1. **IntakeWizard is monolithic** — All 8 wizard steps are inline in a single 500-line component with AnimatePresence transitions. There is no per-step component extraction. Edits to any step happen in the same file.

2. **Two results UIs exist** — `ArchitectResultsClient.tsx` (currently active, simpler) and `RecommendationPanel.tsx` (richer, with score bars, LP tax modeler, PDF/Excel export, BookCallCTA). Consider wiring up RecommendationPanel for a better out-of-box experience.

3. **Scoring model** — `architect-logic.ts` uses priority-weighted scoring with BASE_WEIGHTS = [3, 2, 1.5, 1.2, 1]. Scores are clamped 0-100 per dimension. The `jurisdiction-scoring.ts` is a separate module not used by the wizard flow.

4. **State persistence** — Wizard data is in `localStorage` key `gnco:architect-brief`, step number in `sessionStorage` key `gnco:architect-step`. The results page reads from the same localStorage key.

5. **Email gate** — The results page shows EmailCaptureForm first; only after email submission does it show the AttorneyBrief component. The demo fallback should consider whether to bypass or include this gate.

6. **Existing exports** — RecommendationPanel already has PDF export (client-side Blob), Excel export (via excel-export.ts), and share link (via /api/architect/share). These can be reused in ArchitectResultsClient.

---

*GNCO Claude Code Fix Playbook — 20 fixes across Critical, Data Accuracy, UX, and Feature phases*
*Updated with verified codebase paths and component details — March 2026*
