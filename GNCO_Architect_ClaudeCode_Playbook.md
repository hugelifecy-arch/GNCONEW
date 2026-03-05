# GNCO — Architect Engine & Results Page
# Claude Code Fix Playbook
# Generated: March 2026

---

## HOW TO USE THIS PLAYBOOK

Paste each prompt block directly into Claude Code in sequence.
Complete and verify each fix before moving to the next.
Prompts are ordered by priority: Critical → Data/Accuracy → UX → Enhancements.

---

---

# ═══════════════════════════════════════════
# PHASE 1 — CRITICAL FIXES
# ═══════════════════════════════════════════

---

## FIX 01 — Results Page: Demo Fallback State
**Problem:** `/architect/results` shows a dead-end error when accessed directly without wizard session data. This is the worst possible first impression for institutional prospects.

```
Find the file that renders `/architect/results` (likely app/architect/results/page.tsx or similar).

Currently, when no wizard session/state is found, the page renders only:
"No wizard input found. Complete the architect wizard first."

Replace this empty error state with a fully populated DEMO fallback that automatically activates when no session data exists.

The demo fallback should:
1. Show a realistic sample results output using these hardcoded demo inputs:
   - Fund Type: Private Equity
   - Fund Size: $250M
   - GP Domicile: United States
   - LP Base: Mixed (US Taxable + US Tax-Exempt + European)
   - Investment Geography: North America + Western Europe
   - Priorities: Tax Efficiency, Regulatory Reputation, Moderate Cost
   - Timeline: 6 months
   - Experience: Experienced GP (2+ prior funds)

2. Display a top-banner notice: 
   "You are viewing a sample result. Start the Architect Wizard to generate your personalised analysis →"
   Style this as a subtle amber/gold info banner, NOT a blocking modal.

3. Show at least 4 jurisdiction recommendations in the results (e.g., Cayman Islands SLP, Delaware LP, Luxembourg SCSp, BVI LP) with:
   - Suitability score (0–100)
   - Estimated formation cost range
   - Estimated formation timeline
   - 3 key advantages
   - 1 key consideration/risk

4. Keep the existing disclaimer footer intact.

5. Do NOT redirect away from the page — always render the demo fallback in place.
```

---

## FIX 02 — Results Page: "Back" CTA on Empty State
**Problem:** The current error state has only one CTA ("Go to Architect Wizard →"). If a user arrived via a shared link, they have no context.

```
On the `/architect/results` page, when no session data exists AND before the demo fallback from FIX 01 is complete, update the current empty error state UI as follows:

1. Replace the plain "No wizard input found" text with a structured layout:
   - Headline: "Your Results Will Appear Here"
   - Subheading: "Complete the 8-step Architect Wizard to receive your personalised jurisdiction analysis across 15 fund domiciles."
   - Primary CTA button: "Start the Architect Wizard →" (links to /architect)
   - Secondary text: "Want to see a sample? View Demo Results" (triggers the demo fallback mode from FIX 01)

2. Add 3 icon+text value proposition bullets below:
   - "15 jurisdictions modelled in real time"
   - "Cost, timeline & tax efficiency scoring"
   - "Export-ready PDF report"

Keep the disclaimer footer visible.
```

---

## FIX 03 — Wizard Step 1: Add Missing Fund Types
**Problem:** "Hedge Fund / Open-Ended" and "Fund of Funds" are absent from Step 1. Users attempting to structure these will get completely wrong jurisdiction recommendations.

```
In the Architect Wizard Step 1 component (Fund Type selection), add two new fund type options to the existing grid alongside Private Equity, Real Estate, etc.:

NEW OPTION A:
- Name: "Hedge Fund"
- Subtitle: "Open-ended liquid and multi-strategy vehicles"
- Icon: use an appropriate existing icon or a simple chart/wave icon

NEW OPTION B:
- Name: "Fund of Funds"
- Subtitle: "Diversified allocations to underlying fund managers"
- Icon: use a layered/stack icon

Additionally, add a notice at the bottom of Step 1 (above the Continue button):
"GNCO models closed-end and open-end fund structures. Hedge Fund and UCITS structures follow separate regulatory pathways — results will reflect open-ended jurisdiction suitability."

Make sure both new types propagate correctly through all 8 wizard steps and into the results/scoring logic. If the scoring logic for these two types is not yet built, flag them as "Beta" with a badge and show a message on the results page: "Hedge Fund / FoF structuring recommendations are in beta. Results are indicative only."
```

---

## FIX 04 — Wizard Step 1: Continuation Fund Conflict Warning
**Problem:** Continuation funds have mandatory LP conflict-of-interest disclosures and ILPA guidance implications. No warning exists.

```
On Wizard Step 1, when the user selects "Continuation Fund", trigger an inline contextual alert directly below the selected card (do not use a blocking modal):

Alert style: amber warning box
Alert content:
  Heading: "Continuation Fund — Key Consideration"
  Body: "GP-led continuation vehicles involve inherent LP conflicts of interest. ILPA guidelines recommend independent LP advisory committee consent and third-party fairness opinions. GNCO's recommendations assume these governance requirements will be addressed with qualified legal counsel before formation."
  Link: "Learn more about ILPA Continuation Fund Guidelines →" (open in new tab, link to https://ilpa.org)

The alert should:
- Appear when "Continuation Fund" is selected/highlighted
- Disappear if the user selects a different fund type
- NOT block the user from continuing — it is informational only
```

---

## FIX 05 — Wizard Step 1: Fix Co-Investment Description
**Problem:** Co-Investment is described only as "Deal-by-deal capital sleeves" — missing dedicated co-invest fund structures which have different jurisdiction logic.

```
Update the Co-Investment fund type card on Wizard Step 1:

Change the subtitle from:
"Deal-by-deal capital sleeves"

To:
"Deal-by-deal sleeves and dedicated co-invest funds"

Then, when "Co-Investment" is selected, show an inline prompt (small, non-blocking, below the card):
"Are you structuring a deal-by-deal sleeve or a dedicated committed-capital co-invest fund?"
With two radio options: "Deal-by-deal" | "Dedicated committed capital"

Store this selection as a sub-type in the wizard state (e.g., coInvestType: 'deal-by-deal' | 'dedicated') and pass it through to the results scoring logic, as these have meaningfully different jurisdiction recommendations.
```

---

## FIX 06 — Wizard Step 1: Back Button on Step 1
**Problem:** Step 1 shows a "Back" button that has no valid destination.

```
On Wizard Step 1, hide the "Back" button entirely when currentStep === 1.

Alternatively, if a landing/intro page exists at /architect/intro or similar, route the Back button there.

Do not show a Back button with no valid destination — it signals broken navigation to institutional users.
```

---

---

# ═══════════════════════════════════════════
# PHASE 2 — DATA ACCURACY FIXES
# ═══════════════════════════════════════════

---

## FIX 07 — Add Jurisdiction Data Timestamps
**Problem:** Formation cost and timeline data is undated. Fund formation costs change annually. Without timestamps, institutional users cannot rely on any figure.

```
Find the jurisdiction data store (likely a constants file, JSON, or TypeScript object — e.g., jurisdictions.ts, jurisdictionData.ts, or similar).

For each jurisdiction in the dataset, add a `dataVerifiedDate` field in ISO format (e.g., "2025-Q4" or "2025-11-01").

Then, on the Results page, display this date beneath each jurisdiction's cost/timeline figures:
"Cost & timeline data verified: [dataVerifiedDate]"

Style as small muted text (gray, 12px) below the figures.

Additionally, add a global note in the Results page header:
"Jurisdiction data is reviewed quarterly. Formation costs and regulatory timelines are subject to change. Always verify current figures with local counsel."

If the dataVerifiedDate is more than 6 months old, show a subtle amber indicator next to that jurisdiction's figures: "⚠ Data may be outdated — verify with local counsel"
```

---

## FIX 08 — Architect Engine: Expose Scoring Methodology
**Problem:** Jurisdiction suitability scores (0–100) are unauditable. Institutional investors and their counsel will not trust black-box scores.

```
Find the Architect Engine scoring logic (likely a function like calculateScore(), scoreJurisdiction(), or similar in a file like architectEngine.ts or scoringModel.ts).

Make the following changes:

1. For each jurisdiction score on the Results page, add an expandable "Score Breakdown" section (collapsed by default, expand on click).

The breakdown should show the weighted components, for example:
  - Tax Efficiency: [score]/25
  - Regulatory Reputation: [score]/20
  - Formation Cost: [score]/20
  - Formation Speed: [score]/15
  - LP Familiarity: [score]/10
  - Ongoing Compliance: [score]/10
  (Adjust categories to match your actual scoring model)

2. Add a small "ⓘ How scores are calculated" link in the Results page header, linking to /methodology or opening a modal with a plain-English explanation of the scoring model.

3. The methodology explanation should include:
   - What factors are weighted
   - What the percentage weightings are
   - That scores are relative (benchmarked against the 15 modelled jurisdictions, not absolute)
   - That scores are customised based on wizard inputs (a different GP profile will produce different scores for the same jurisdiction)
```

---

## FIX 09 — Wizard Step 4: LP Base — Add Investor Type Dimension
**Problem:** Step 4 (LP Base) likely only asks about LP geography. But LP *type* (taxable individual, pension/endowment, sovereign wealth fund, insurance company) fundamentally changes jurisdiction suitability — especially around blocker entity requirements.

```
In Wizard Step 4 (LP Base), add a second dimension to the existing geography selection:

After the user selects LP geographies, add a follow-up sub-step or inline section:
Heading: "What types of investors will your LP base include?"
(Select all that apply)

Options:
- Taxable Individuals / Family Offices
- US Tax-Exempt (Pension Funds, Endowments, Foundations) [show tooltip: "May require blocker entities to avoid UBTI"]
- Sovereign Wealth Funds [show tooltip: "May require specific structuring for political sensitivity and FOIA considerations"]
- Insurance Companies [show tooltip: "Often subject to 'look-through' asset rules"]
- Non-US Institutional (Banks, Pension Funds)
- Retail / High-Net-Worth (non-qualified)

Pass these LP types into the scoring engine. At minimum, use them to:
1. Flag when a Cayman blocker is recommended (triggered by: US Tax-Exempt LPs investing in operating companies)
2. Flag when AIFMD marketing passport is relevant (triggered by: Non-US Institutional from EU countries)
3. Flag when FATCA/CRS reporting obligations are elevated (triggered by: mixed US + non-US LP base)
```

---

## FIX 10 — Wizard Step 7: Timeline — Add Regulator Backlog Warnings
**Problem:** Static timeline estimates don't reflect current regulator processing times, which have shifted significantly since 2022.

```
Find the data source for jurisdiction formation timeline estimates (in jurisdictions.ts or similar constants file).

Update the timeline estimates to reflect current (2025) regulator processing times:

CAYMAN ISLANDS:
  - Registered Fund (CIMA): 6–10 weeks (update if different)
  - Licensed Fund (CIMA): 12–20 weeks
  - Exempted LP: 1–2 weeks

LUXEMBOURG:
  - RAIF: 10–16 weeks
  - SIF: 16–24 weeks  
  - SICAR: 20–28 weeks
  - SCSp (unregulated): 2–4 weeks

BVI:
  - Private Fund (SIBA): 4–6 weeks
  - Approved Fund: 2–4 weeks

DELAWARE:
  - LP/LLC: 1–3 business days (expedited available: same day)

IRELAND:
  - QIAIF: 24+ weeks
  - ICAV: 8–12 weeks

SINGAPORE:
  - VCC (MAS): 8–14 weeks

DUBAI (DIFC):
  - Fund: 10–16 weeks

For each jurisdiction on Step 7 (Timeline) AND on the Results page, add a dynamic disclaimer beneath each timeline figure:
"Processing times are current estimates as of [current quarter]. Actual timelines depend on fund complexity and regulator workload."

If the user's required timeline (from Step 7) is shorter than a jurisdiction's minimum, flag that jurisdiction with a warning badge on the Results page: "⚠ Timeline Risk — formation may not complete within your target window"
```

---

---

# ═══════════════════════════════════════════
# PHASE 3 — UX FIXES
# ═══════════════════════════════════════════

---

## FIX 11 — Wizard: Estimated Completion Time
**Problem:** No time estimate shown. Reduces friction for busy allocators.

```
On the Architect Wizard landing (Step 1), add a single line of muted text directly below the page heading "Architect Engine":

"8 steps · takes approximately 3–4 minutes"

Place this between the heading and the fund type grid.
Keep it subtle: small font, muted gray color, no icon needed.
```

---

## FIX 12 — Wizard: Per-Step Autosave Confirmation
**Problem:** "Your session is saved automatically" is stated once at the top but gives no visual confirmation as users progress through steps.

```
In the Architect Wizard component, after each step's state is persisted (to localStorage, session, or server), show a brief autosave confirmation:

Implementation:
1. Add a small "Saved ✓" indicator that appears in the top-right area of the wizard card (or near the step counter)
2. It should appear for 2 seconds after each successful save, then fade out
3. Use a subtle green checkmark style — do not use a toast or modal
4. If save fails (localStorage full, network error for server-side save), show "⚠ Not saved — check your connection" in amber

This applies to all 8 steps.
```

---

## FIX 13 — Wizard: Step 1 — Add Hover/Tap Expanded Descriptions
**Problem:** Fund type cards show only a name + one-liner. Complex types (Real Assets, Multi-Strategy, Continuation Fund) need more context.

```
On Wizard Step 1's fund type grid, enhance each card with an expandable description:

1. Add an info icon (ⓘ) to the top-right corner of each fund type card
2. On hover (desktop) or tap (mobile), show an expanded tooltip or inline expansion with:
   - 2–3 sentence description of the fund type
   - Typical LP base for this type
   - Common jurisdiction for this type (teaser)

Example for Private Equity:
  "Closed-end vehicles targeting control or significant minority positions in private companies. Typical LPs include pension funds, endowments, and family offices. Cayman and Delaware are the most common domiciles."

Example for Continuation Fund:
  "A GP-led secondary transaction where assets from a maturing fund are transferred to a new vehicle. Requires existing LP consent and independent fairness opinion. Subject to ILPA conflict-of-interest guidelines."

Write out the full description content for all 8 existing fund types plus the 2 new types added in FIX 03.
```

---

## FIX 14 — Wizard: Add "I'm Not Sure Yet" Option
**Problem:** Users in exploratory mode abandon the wizard when forced to commit to a fund type they haven't decided on.

```
On Wizard Step 1, add a final card option to the fund type grid:

- Name: "I'm Not Sure Yet"
- Subtitle: "Explore all fund structures side by side"
- Icon: a question mark or compass icon
- Styling: slightly different from the other cards — use a dashed border or lighter background to visually distinguish it as an exploratory path

When selected:
1. The wizard should continue through all remaining steps (size, GP domicile, LP base, etc.) normally
2. On the Results page, show ALL fund types as rows in a comparison table rather than a single-structure deep-dive
3. Add a note: "You selected 'Explore All' mode. Results show comparative suitability across fund structures for your profile. Select a specific fund type to see a detailed analysis."
```

---

## FIX 15 — Demo User Label: Restyle for Institutional Credibility
**Problem:** The "ADDemo User — Demo dataset: values and people shown..." label appears as prominent text on every page, making the platform feel like a prototype.

```
Find the component that renders the Demo User label/banner (likely in the sidebar, header, or layout component).

Restyle it as follows:
1. Replace the full text block with a compact pill/badge in the top navigation bar
2. Badge text: "DEMO MODE"
3. Style: small, outlined badge (border only, no fill), muted gray color, 11px font
4. On hover/click, show a small tooltip: "You are viewing GNCO with demo data. Sign up to use live data."
5. Remove the verbose "Demo dataset: values and people shown in this environment are sample data for product demonstration." text from the main content area entirely — this information should only appear on hover of the badge

This change applies to the layout wrapper, so it will affect all pages simultaneously.
```

---

## FIX 16 — Step 8 (Experience): Add Self-Reported Data Disclaimer
**Problem:** Step 8 asks about GP experience to calibrate recommendations, but GNCO cannot verify claims. No disclaimer exists at this step.

```
On Wizard Step 8 (Experience), add a small disclaimer text block directly below the step heading, before the input options:

Text:
"GNCO models recommendations based on self-reported experience data. We do not verify credentials or prior fund history. Regulatory bodies (SEC, CIMA, CSSF, MAS) will conduct their own due diligence during the registration process."

Style: small, muted gray text, italic, similar to the existing footer disclaimer in tone.

Additionally, if the user selects "First-time GP / No prior fund" as their experience level, trigger an inline guidance note:
"As a first-time GP, certain jurisdictions and fund structures have higher minimum requirements or require additional regulatory approvals. Your results will highlight these thresholds."
```

---

---

# ═══════════════════════════════════════════
# PHASE 4 — HIGH-VALUE FEATURE ADDITIONS
# ═══════════════════════════════════════════

---

## FIX 17 — Results Page: PDF Export
**Problem:** No export functionality. Every institutional user will need to share results with counsel or LPs.

```
On the Results page, add a "Export PDF Report" button in the page header area (top right, prominent).

The PDF export should include:
1. Cover page:
   - "GNCO Fund Structure Analysis"
   - User's fund profile summary (from wizard inputs)
   - Date generated
   - GNCO logo and "Confidential — For Discussion Purposes Only" watermark

2. Jurisdiction Comparison Table:
   - All recommended jurisdictions with scores, costs, timelines

3. Detailed pages per top 3 jurisdictions:
   - Full score breakdown (from FIX 08)
   - Formation steps overview
   - Key service providers needed (fund lawyer, administrator, auditor — generic categories only)
   - Relevant regulatory authority and contact

4. Full disclaimer page (copy from existing footer disclaimer)

Implementation options (choose based on existing stack):
   Option A: Use react-pdf or @react-pdf/renderer for client-side PDF generation
   Option B: Use a server-side route /api/export-results that accepts wizard state and returns a PDF buffer
   Option C: Use html2canvas + jsPDF to screenshot and export the results page

Add a secondary "Copy shareable link" button that generates a URL with wizard state encoded in query params, so results can be shared without requiring login.
```

---

## FIX 18 — Results Page: "Request a Consultation" CTA
**Problem:** No lead capture on the highest-intent page in the entire product.

```
On the Results page, add a sticky CTA section at the bottom of the results (above the disclaimer footer):

Layout: full-width card with subtle background
Heading: "Ready to proceed with fund formation?"
Subheading: "Connect with a vetted fund formation specialist who can act on these recommendations."
Primary button: "Request a Consultation →"
Secondary link: "Download your results PDF first →" (links to FIX 17 export)

The "Request a Consultation" button should:
1. Open a simple modal with a short form: Name, Email, Fund Type (pre-filled from wizard), Jurisdiction of Interest (pre-filled from top recommendation), Message (optional)
2. On submit, send to your configured email endpoint or CRM
3. Show a confirmation: "We'll connect you with a specialist within 24 hours."

This is the primary monetisation/lead generation touchpoint. Make it visually prominent but not aggressive.
```

---

## FIX 19 — Results Page: Value Proposition Anchor
**Problem:** No competitive framing vs. hiring a law firm. The platform's core value prop isn't stated anywhere near the results.

```
On the Results page, add a subtle value-proposition banner directly below the page heading, above the results:

Text:
"This analysis covers 15 jurisdictions across 47 regulatory variables. Equivalent work from a fund formation law firm typically costs $8,000–$20,000 and takes 2–4 weeks. GNCO delivered it in under 5 minutes."

Style: small card with a light background (not intrusive), left-aligned, with a small GNCO logo or icon.

Make this dismissible (X button) so users who have seen it before can close it. Use localStorage to remember if the user has dismissed it (key: 'gnco_value_prop_dismissed').
```

---

## FIX 20 — Glossary Tooltip Layer (Global)
**Problem:** Technical terms throughout the platform (RAIF, AIFMD, UBTI, SCSp, CIMA, CSSF, etc.) are unexplained. Range of users spans sophisticated GPs to newly allocating family offices.

```
Create a global glossary tooltip system that works across all pages in the GNCO platform.

Implementation:
1. Create a glossary data file (glossary.ts or glossary.json) with at least the following terms:
   - AIFMD: "EU Alternative Investment Fund Managers Directive — governs marketing of funds to EU professional investors"
   - RAIF: "Reserved Alternative Investment Fund — Luxembourg fund structure requiring no direct regulatory approval, but must appoint an AIFM"
   - CIMA: "Cayman Islands Monetary Authority — the fund regulator for Cayman Islands funds"
   - CSSF: "Commission de Surveillance du Secteur Financier — Luxembourg's financial regulator"
   - SCSp: "Société en Commandite Spéciale — Luxembourg's equivalent of a limited partnership, no legal personality"
   - SLP: "Segregated Portfolio Company or Special Limited Partnership depending on context"
   - UBTI: "Unrelated Business Taxable Income — US tax issue for tax-exempt LPs investing in operating companies"
   - NPPR: "National Private Placement Regime — allows non-EU AIFMs to market to EU investors without full AIFMD passport, subject to local rules"
   - ILPA: "Institutional Limited Partners Association — industry body setting LP governance standards"
   - GP: "General Partner — the fund manager who makes investment decisions"
   - LP: "Limited Partner — investor in the fund with limited liability"
   - AIF: "Alternative Investment Fund — any collective investment vehicle not covered by the UCITS directive"
   - FATCA: "Foreign Account Tax Compliance Act — US law requiring foreign financial institutions to report US account holders"
   - CRS: "Common Reporting Standard — OECD's global automatic exchange of financial account information"
   - KYC: "Know Your Customer — identity verification process required by AML regulations"
   - NAV: "Net Asset Value — total value of fund assets minus liabilities"
   - WACC: "Weighted Average Cost of Capital — blended cost of a company's debt and equity financing"

2. Create a <GlossaryTerm> React component that:
   - Wraps any term on the page
   - Shows a dotted underline to indicate it's hoverable
   - On hover/tap, displays a tooltip with the definition
   - Tooltip includes a "Full Glossary →" link to /glossary page

3. Apply the <GlossaryTerm> wrapper to all instances of glossary terms across:
   - Wizard steps
   - Results page
   - Compare page
   - Any static content pages

4. Create a /glossary page listing all terms alphabetically with full definitions.
```

---

---

# ═══════════════════════════════════════════
# IMPLEMENTATION ORDER & VERIFICATION
# ═══════════════════════════════════════════

## Recommended Sequence

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 1 | FIX 01 — Results demo fallback | Medium | 🔴 Critical |
| 2 | FIX 06 — Hide Back on Step 1 | Low | 🔴 Quick win |
| 3 | FIX 03 — Add Hedge Fund + FoF types | Medium | 🔴 Critical |
| 4 | FIX 15 — Restyle Demo User label | Low | 🟡 Credibility |
| 5 | FIX 04 — Continuation Fund warning | Low | 🔴 Risk mitigation |
| 6 | FIX 05 — Fix Co-Investment description | Low | 🟡 Accuracy |
| 7 | FIX 11 — Add "3–4 minutes" copy | Low | 🟠 UX |
| 8 | FIX 12 — Per-step autosave confirmation | Low | 🟠 UX |
| 9 | FIX 07 — Jurisdiction data timestamps | Medium | 🟡 Credibility |
| 10 | FIX 08 — Score methodology transparency | Medium | 🟡 Credibility |
| 11 | FIX 09 — LP Base investor types | High | 🔴 Data accuracy |
| 12 | FIX 10 — Timeline regulator warnings | Medium | 🟡 Data accuracy |
| 13 | FIX 02 — Better empty state UI | Low | 🟠 UX |
| 14 | FIX 13 — Hover expanded descriptions | Medium | 🟠 UX |
| 15 | FIX 14 — "I'm Not Sure Yet" option | Medium | 🟠 UX |
| 16 | FIX 16 — Step 8 experience disclaimer | Low | 🟡 Risk |
| 17 | FIX 17 — PDF Export | High | 🔵 Feature |
| 18 | FIX 18 — Consultation CTA | Medium | 🔵 Revenue |
| 19 | FIX 19 — Value prop banner | Low | 🔵 Conversion |
| 20 | FIX 20 — Glossary tooltip system | High | 🔵 Credibility |

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

## Files Most Likely to Be Modified

```
/app/architect/page.tsx               — Wizard Step 1
/app/architect/results/page.tsx       — Results page
/app/layout.tsx                       — Demo user label (global)
/components/architect/WizardStep.tsx  — Step wrapper (autosave, back button)
/lib/jurisdictions.ts                 — Jurisdiction data (costs, timelines)
/lib/architectEngine.ts               — Scoring model
/components/ui/GlossaryTerm.tsx       — NEW: Glossary tooltip (FIX 20)
/app/glossary/page.tsx                — NEW: Glossary page (FIX 20)
/lib/glossary.ts                      — NEW: Glossary data (FIX 20)
```

---

*GNCO Claude Code Fix Playbook — 20 fixes across Critical, Data Accuracy, UX, and Feature phases*
*Generated by Claude for Notis @ JetSet / GNCO — March 2026*
