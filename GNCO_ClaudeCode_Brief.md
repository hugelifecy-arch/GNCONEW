# GNCO — Architect Engine: Full Improvement Brief
**For:** Claude Code Implementation  
**Project:** gnconew.vercel.app  
**Prepared from:** Full platform audit + Architect Engine deep analysis  
**Scope:** Fixes · Updates · New Features · Structural Additions

---

## 0. CONTEXT SUMMARY

GNCO is a fund structure modeling SaaS platform targeting Family Offices, PE GPs, Real Assets Fund Managers, and Endowments. The core product — the **Architect Engine** — takes an 8-question intake and scores 15 jurisdictions, outputting a top-3 recommendation + attorney brief. Currently in Open Beta (free), paid launch Q3 2026 from €500/month.

This document covers every change, fix, and addition identified across:
1. Homepage / marketing layer
2. Architect Engine intake flow
3. Scoring & methodology
4. Output / deliverables
5. Post-recommendation features
6. New modules & revenue features

---

## 1. HOMEPAGE FIXES (Quick Wins — Deploy This Week)

### 1.1 Fix Broken Footnote Links
- **Issue:** Cost footnotes on the homepage reference `gnco.ai` — a different domain from the live app (`gnconew.vercel.app`)
- **Fix:** Update all footnote `href` values to point to `/methodology` and `/coverage` on the current domain

### 1.2 Replace Empty Social Proof
- **Issue:** "Trusted by institutional teams worldwide" has zero supporting data, logos, or numbers beneath it
- **Fix:** Replace with a live beta counter, e.g.:
  ```
  847 fund structures modeled · 214 beta users · 18 countries
  ```
  Wire this to a real counter from the database, or hardcode a conservative accurate number

### 1.3 Replace mailto: Waitlist with a Form
- **Issue:** "Join Waitlist →" button on Professional tier points to `mailto:contact@gnco.io`
- **Fix:** Replace with an inline form (name + email + fund size dropdown) that posts to a CRM (HubSpot / Loops.so). Add a confirmation message.

### 1.4 Add Secondary CTA
- **Issue:** "Start Free →" appears 5+ times with no alternative for institutional visitors who won't click cold
- **Fix:** Add a secondary CTA button alongside every primary CTA:
  ```
  [Start Free →]   [View Sample Report ↓]
  ```

### 1.5 Expand Homepage Cost Slider
- **Issue:** Interactive cost slider only shows 3 jurisdictions (Ireland, BVI, Jersey)
- **Fix:** Show all 15 jurisdictions in the slider output, collapsed by default with a "Show all 15 →" toggle. On expand, render a full table sorted by Year 1 Total Cost.

### 1.6 "52 Templates" — Add Breakdown
- **Issue:** The number "52 templates" appears with no explanation
- **Fix:** Add a tooltip or expandable section listing template categories, e.g.:
  ```
  PE Buyout (8) · Venture (6) · Real Estate (7) · Private Credit (5) · Multi-Strategy (4) ...
  ```

---

## 2. ARCHITECT ENGINE — INTAKE FLOW OVERHAUL

### 2.1 Expand from 8 to 16 Questions with Conditional Logic

Restructure the intake into **3 stages**. Use conditional branching so irrelevant questions are hidden.

---

#### STAGE 1 — Fund Basics (Questions 1–5)

| # | Question | Input Type | Options / Notes |
|---|----------|------------|-----------------|
| 1 | Fund Strategy | Single select | PE Buyout · Venture Capital · Real Estate · Private Credit · Real Assets · Multi-Strategy · Other |
| 2 | Target Fund Size | Slider | €1M → €1B+ (log scale) |
| 3 | Fund Life | Single select | 3 yr · 5 yr · 7 yr · 10 yr · Open-ended |
| 4 | Target Asset Geography | Multi-select | Europe · North America · MENA · Asia-Pacific · Global · CIS/Eastern Europe |
| 5 | Debt / Leverage Strategy | Single select | None · Moderate (<30% LTV) · Significant (>30% LTV) |

---

#### STAGE 2 — LP Profile (Questions 6–11)

| # | Question | Input Type | Options / Notes |
|---|----------|------------|-----------------|
| 6 | Number of LPs | Slider | 1 – 50+ |
| 7 | LP Type Mix | Multi-row builder | For each LP type: Type + Domicile + Commitment % |
|   | LP Types | Dropdown | Family Trust · HNWI Individual · Corporate HoldCo · Pension Fund · Sovereign Wealth Fund · Endowment · Fund of Funds · Other |
|   | LP Domicile | Dropdown | 30+ countries including UAE, Switzerland, Germany, UK, USA, Russia, Kazakhstan, Singapore, etc. |
| 8 | Any US-Connected Persons? (LPs or GP) | Yes/No toggle | Triggers FATCA/ECI warning logic |
| 9 | Any EU-Domiciled LPs? | Yes/No | Triggers AIFMD marketing passport logic |
| 10 | LP CRS Reporting Preference | Single select | LPs prefer CRS-reporting jurisdiction · LPs prefer non-CRS · No preference |
| 11 | Co-Investment Vehicles Needed? | Yes/No | If Yes: triggers SPV/HoldCo structuring question |

---

#### STAGE 3 — Tax & Regulatory Priorities (Questions 12–16)

| # | Question | Input Type | Options / Notes |
|---|----------|------------|-----------------|
| 12 | GP Domicile (tax residency, not just legal) | Country select | Required for carried interest treatment analysis |
| 13 | AIFMD Marketing Passport Required? | Yes/No | If Yes: removes Cayman, BVI, Delaware from top recommendations |
| 14 | Priority Weighting | Drag-to-rank OR sliders | Tax Efficiency · Formation Speed · Cost · LP Familiarity · Regulatory Simplicity · Privacy |
| 15 | Carried Interest Structure Preference | Single select | Standard 20% carry · Profits interest · European waterfall · American waterfall · Not decided |
| 16 | Multi-Generational / Succession Planning Needed? | Yes/No | If Yes: triggers estate/gift transfer analysis in output |

---

### 2.2 Conditional Logic Rules

```
IF Q8 (US person) = Yes → Flag ECI / UBTI risk in output for all jurisdictions
IF Q9 (EU LPs) = Yes AND Q13 (AIFMD) = No → Show warning: "EU LPs may require AIFMD-compliant vehicle"
IF Q11 (Co-invest) = Yes → Add SPV jurisdiction recommendation to output
IF Q16 (Multi-gen) = Yes → Add succession analysis section to attorney brief
IF Q5 (Leverage) = Significant → Deprioritize thin-cap restricted jurisdictions
IF fund size < €10M → Warn that certain jurisdictions (Luxembourg SICAV) have minimum AUM requirements
```

---

## 3. SCORING ENGINE — METHODOLOGY OVERHAUL

### 3.1 Expose the 6 Scoring Criteria

Currently the "6 weighted criteria" are unnamed. They must be visible to users. Proposed criteria and default weights:

| Criterion | Default Weight | Description |
|-----------|---------------|-------------|
| Tax Efficiency | 25% | Treaty network strength, WHT rates, carry treatment |
| Formation Cost | 20% | Legal + regulatory + notary fees |
| Annual Operating Cost | 15% | Admin, audit, compliance, substance costs |
| LP Familiarity | 15% | How well-known/trusted the jurisdiction is among LPs of the selected type |
| Regulatory Burden | 15% | Reporting complexity, substance requirements, AIFMD status |
| Formation Speed | 10% | Weeks from decision to operative structure |

### 3.2 User-Adjustable Weights

Add a "Customize Scoring" panel in the Architect Engine (collapsible, advanced mode):
- 6 sliders (0–100, must sum to 100)
- Preset profiles: "Speed-Optimized" · "Cost-Optimized" · "Institutional LP Friendly" · "Maximum Privacy"
- Show how changing weights reorders the jurisdiction ranking in real time

### 3.3 Add Regulated vs. Unregulated Structure Type

For each jurisdiction, the tool must distinguish:

| Structure Type | Example | Cost Difference |
|----------------|---------|-----------------|
| Regulated AIF | Irish ICAV, Lux SICAV | 3–5x higher cost, longer timeline |
| Unregulated LP/SCSp | Cayman LP, Jersey LP | Lower cost, faster, no AIFMD passport |
| Hybrid | Malta PIF, Cyprus AIF (light-touch) | Middle ground |

Add a selector at the start: "Do you need a regulated fund structure?" (Yes / No / Not Sure → explain why it matters)

### 3.4 Validate and Source Cost Figures

Current figures need verification. Target sources:
- **Ireland ICAV:** Dillon Eustace / Matheson published fee guides
- **Luxembourg:** ALFI industry cost survey
- **Cayman:** Maples / Walkers standard formation quotes
- **BVI:** Harneys / Ogier published schedules
- **Cyprus:** CYSEC published regulatory fees + local law firm quotes
- **Jersey / Guernsey:** Carey Olsen published schedules

Add a "Last verified" date stamp next to each cost figure. Add a disclaimer: "Figures reflect standard structures. Regulated vehicles may cost 2–4x more."

---

## 4. OUTPUT — ATTORNEY BRIEF OVERHAUL

### 4.1 Current State
The brief is generated in <30 seconds but its contents are never shown, previewed, or described anywhere.

### 4.2 Required Brief Structure (6 Sections)

The generated attorney brief PDF must include:

```
1. EXECUTIVE SUMMARY
   - Recommended structure (top 1)
   - Key rationale (3 bullet points)
   - Estimated formation cost + timeline

2. FUND STRUCTURE DIAGRAM
   - Visual diagram: GP Entity → Fund Vehicle → HoldCo (if applicable) → Portfolio
   - Show LP feeding in, carried interest flow out

3. JURISDICTION COMPARISON TABLE
   - All 15 jurisdictions scored
   - Top 3 highlighted
   - Columns: Score | Formation Cost | Annual Cost | Timeline | AIFMD | CRS | Key Notes

4. LP TAX IMPACT ANALYSIS
   - For each LP entered: Entity type | Domicile | WHT rate | Estimated net return impact
   - Summary table + per-LP detail

5. REGULATORY OBLIGATIONS SUMMARY
   - For recommended jurisdiction: list of all filing/reporting requirements with frequency and estimated cost
   - Flag any US/EU regulatory triggers

6. RED FLAGS & COUNSEL NOTES
   - Any detected risks (US person, AIFMD conflict, thin-cap, economic substance)
   - Recommended next steps for counsel
   - 3 recommended law firms for the recommended jurisdiction
```

### 4.3 Sample Brief Page

Add a `/sample-brief` page (public, no auth required) showing a redacted example brief for a "€100M PE fund, 12 LPs, Ireland recommended." This is the single highest-impact conversion addition on the platform.

### 4.4 Brief Customization (AI-Powered)
Add a text field before generation: "Any specific instructions for your attorney?" (e.g., "Format for Carey Olsen Jersey intake" or "Include UAE regulatory considerations in detail"). Pass this to Claude API to customize brief tone and structure.

---

## 5. LP-BY-LP TAX WATERFALL SIMULATOR

**This is the #1 killer feature for family offices.**

### 5.1 Description
After jurisdiction recommendation, offer an expanded LP tax simulator:

**Input per LP:**
- Name (optional)
- Entity type (Trust / Corporate / Individual / Pension / SWF)
- Country of tax residence
- Commitment amount (€)
- Expected distributions timeline

**Output per LP per jurisdiction:**
- Applicable WHT rate (sourced from OECD treaty database)
- Estimated annual tax drag (€)
- Net IRR impact (bps)
- Treaty benefit eligibility (Yes/No + treaty article reference)
- FATCA/CRS reporting status

**Output summary:**
- Side-by-side table: Jurisdiction A vs B vs C — aggregate after-tax return to LP pool
- Download as PDF (branded, ready to send to each LP's counsel)

### 5.2 Implementation Notes
- Source WHT rates from OECD Tax Database API (public)
- Cache treaty data, update quarterly
- Handle edge cases: US-connected LPs (FIRPTA, ECI), pension fund exemptions, sovereign immunity

---

## 6. SCENARIO BUILDER

**Run 2–3 structures side by side and compare outcomes.**

### 6.1 User Flow
1. Complete the main intake → get Recommendation A
2. Click "Add Scenario" → tweak inputs (e.g., change GP domicile, add a US LP, change fund size)
3. See Recommendation B generated alongside A
4. Side-by-side comparison panel:
   - Score difference
   - Cost difference (Year 1 + 5-year NPV)
   - LP tax impact difference
   - Timeline difference
   - Key trade-off summary (1 paragraph, AI-generated)

### 6.2 Use Cases This Unlocks
- "What if 3 of my LPs move from Germany to UAE?"
- "What if we grow to €300M in Year 3?"
- "What's the cost of using Luxembourg vs. Cayman for this LP mix?"

---

## 7. COMPLIANCE CALENDAR GENERATOR

**Post-recommendation output. Huge value for retaining users month-to-month.**

### 7.1 For Each Recommended Jurisdiction, Generate:

| Filing | Frequency | Deadline | Estimated Cost | Notes |
|--------|-----------|----------|----------------|-------|
| Annual accounts filing | Annual | varies | €X | |
| FATCA/CRS reporting | Annual | 30 Jun | €X | If applicable |
| AIFMD Annex IV | Quarterly/Annual | varies | €X | If EU marketing |
| Economic substance declaration | Annual | varies | €X | Cayman/BVI/Jersey |
| LP capital account statements | Quarterly | varies | Included in admin | |
| ILPA quarterly report | Quarterly | 45 days post-quarter | €X | |

### 7.2 Features
- Export as iCal (.ics) file — LPs/GPs can add to calendar
- Email reminder system (opt-in): "Your BVI economic substance report is due in 30 days"
- Tied to user's chosen structure — only shows relevant filings

---

## 8. "MY STRUCTURE" PERSISTENT DASHBOARD

Once a structure is selected, the user enters an ongoing operating environment:

### 8.1 Dashboard Modules

| Module | Description |
|--------|-------------|
| **Structure Overview** | Jurisdiction, entity type, formation date, key dates |
| **LP Register** | Add/edit LPs, track commitments, KYC status, onboarding progress |
| **Capital Call Manager** | Schedule calls, send notices, track funding |
| **Distribution Waterfall Calculator** | Input realized proceeds → auto-calculate GP/LP splits, carried interest, preferred return |
| **Document Vault** | Upload/store LPA, side letters, subscription docs — DocuSign integration |
| **Compliance Calendar** | Auto-populated from structure (see §7) |
| **Cost Tracker** | Actual vs. projected costs from the Architect Engine estimate |
| **ILPA Reporting** | Quarterly report generation in ILPA template format |

### 8.2 Annual Review Prompt
Each year, prompt the user: "Your fund is now in Year 2. Has your LP mix changed? Any new regulatory developments in [jurisdiction] may affect your structure. Run a re-score →"

---

## 9. COUNSEL MATCHING ENGINE (New Revenue Stream)

### 9.1 Description
After the Architect Engine produces a recommendation, show:

**"Recommended Counsel for [Jurisdiction]"**

For each of top 3 recommended jurisdictions, list 3 pre-vetted law firms:
- Firm name + logo
- Typical formation fee range
- Average timeline
- Specializations (PE / RE / VC / Family Office)
- GNCO user rating (stars)
- "Request Introduction →" button

### 9.2 Monetization
- Law firms pay €500–€2,000/month for a verified listing
- OR: GNCO takes a referral fee (€1,000–€5,000) per closed mandate
- Carey Olsen (already listed as partner) becomes the anchor listing for Jersey/Guernsey/BVI

### 9.3 Implementation
- Build a `/counsel` page with filterable directory
- Add "Claim your listing" CTA for law firms (B2B acquisition channel)

---

## 10. CIS / RUSSIAN-SPEAKING LP MODULE

**Zero competition in this space. Direct synergy with existing client base.**

### 10.1 Features
- Russian-language UI toggle (RU/EN) — translate all Architect Engine inputs and outputs
- LP domicile options specifically expanded for CIS: Russia, Kazakhstan, Azerbaijan, Uzbekistan, Armenia, Georgia, Ukraine
- Cyprus holding company layer modeling (direct synergy — Cyprus-based GP + CIS LPs is a common structure)
- UAE freezone LP entity support (DIFC, ADGM entity types)
- Output: WHT analysis for Russia-Cyprus, Kazakhstan-Luxembourg, and UAE-Ireland treaty pairs

### 10.2 Attorney Brief Localization
- Russian-language brief option
- Footnotes referencing Russian Tax Code articles where applicable
- "Common structure for CIS family offices" template preset

---

## 11. REGULATORY UPDATES PAGE (`/regulatory-updates`)

**Currently in nav but not properly built. Should be a major SEO and retention asset.**

### 11.1 Structure

Each update entry:
```
[Date] [Jurisdiction Flag] [Headline]
[2-sentence summary]
[Impact on your structure: High / Medium / Low]
[→ See how this affects your GNCO recommendation]
```

### 11.2 Content Categories
- AIFMD / AIFMD II changes
- FATCA / CRS reporting updates
- Cayman CIMA regulatory fee changes
- Luxembourg tax law changes
- BVI / Jersey economic substance updates
- Cyprus AIF/RAIF regulatory developments
- OECD Pillar Two / global minimum tax impacts on fund structures

### 11.3 Personalization
- If user is authenticated and has a saved structure: highlight updates relevant to their jurisdiction with a "⚠️ This affects your structure" badge

---

## 12. API DOCUMENTATION (`/docs`)

The Professional tier promises "API access" but no documentation exists.

### 12.1 Minimum Required for Q3 2026 Launch

**Endpoints to document:**

```
POST /api/v1/architect/score
  Body: { fund_strategy, lp_mix[], gp_domicile, fund_size, priorities }
  Returns: { top_3_jurisdictions[], scores{}, brief_pdf_url }

GET /api/v1/jurisdictions
  Returns: All 15 jurisdictions with current cost data + regulatory status

POST /api/v1/brief/generate
  Body: { recommendation_id, custom_instructions }
  Returns: { brief_pdf_url }

GET /api/v1/compliance-calendar/{structure_id}
  Returns: All upcoming filing deadlines for a saved structure
```

### 12.2 Authentication
- API key issued per Professional+ account
- Rate limiting: 100 calls/day on Professional, unlimited on Enterprise

---

## 13. HOMEPAGE CONTENT ADDITIONS

### 13.1 Add Sample Attorney Brief CTA Section
Between "How It Works" and Pricing:

```html
<!-- Sample Output Section -->
<h2>See What You Get</h2>
<p>A real attorney brief generated for a €75M PE fund with 8 LPs across Germany, UAE, and Singapore.</p>
[Download Sample Brief →]  [Launch Architect Engine →]
```

### 13.2 Add Cyprus-Specific Landing Section
Create `/jurisdictions/cyprus` — a dedicated page covering:
- Cyprus AIF (Alternative Investment Fund) structure
- Cyprus RAIF (Registered AIF)
- Cyprus holding company as GP vehicle
- Tax treaty network (60+ treaties)
- CYSEC regulatory framework
- Cost + timeline for Cyprus fund formation
- WHT rates for key LP domiciles (Russia, UAE, Germany, UK)

This serves SEO and directly leverages your location/client base.

### 13.3 Worked Example / Case Study
Add a case study section:
```
"How a €75M PE Fund Chose Luxembourg over Cayman — and Saved €340K in LP Tax Drag"
[Read Case Study →]
```
Show the actual GNCO output (anonymized) with the jurisdiction comparison table and LP tax analysis.

---

## 14. TECHNICAL / INFRASTRUCTURE

### 14.1 Cost Data Freshness
- Add a `last_verified` timestamp to every jurisdiction cost figure in the database
- Build an admin panel to update cost figures without code deployment
- Trigger email alert to admin if any figure is >90 days old

### 14.2 Brief Generation Pipeline
- Use Claude API (claude-sonnet-4-20250514) for attorney brief text generation
- Pass full intake answers + scoring results as context
- Brief should be generated as a formatted PDF (use Puppeteer or WeasyPrint)
- Store in Supabase Storage / S3, return signed URL valid 7 days

### 14.3 WHT Treaty Database
- Integrate OECD treaty database (XML/CSV download available publicly)
- Build internal lookup table: [LP domicile] × [Fund jurisdiction] → WHT rate + treaty article
- Update quarterly (cron job)

### 14.4 Analytics
- Add Posthog or Mixpanel for Architect Engine funnel tracking
- Key events to track:
  - `intake_started` → `intake_completed` → `brief_generated` → `brief_downloaded`
  - Drop-off point analysis (which question do users abandon?)
  - Most popular jurisdiction recommendations
  - Most common LP domicile combinations

---

## 15. PRICING PAGE UPDATES

### 15.1 Define "Core Features" Explicitly
The current beta promise — "free lifetime access to core features at launch" — is vague. Define it:

```
Core features (always free):
- Architect Engine (up to 3 runs/month)
- 15-jurisdiction scoring
- Basic attorney brief (PDF, standard template)
- 1 saved structure

Professional (€500/month):
- Unlimited Architect Engine runs
- Full brief customization
- LP Tax Waterfall Simulator
- Scenario Builder
- Compliance Calendar
- LP Register + Capital Call Manager
- Distribution Waterfall Calculator
- API access
- White-label reporting

Enterprise (custom pricing):
- Unlimited everything
- Custom intake branding
- Dedicated counsel matching
- Russian/multilingual outputs
- SLA + priority support
```

---

## IMPLEMENTATION PRIORITY ORDER

### Phase 1 — Fix & Credibility (Week 1–2)
1. Fix footnote links (domain mismatch)
2. Add beta user count / social proof
3. Replace mailto: waitlist with proper form
4. Add sample attorney brief page (`/sample-brief`)
5. Expose 6 scoring criteria with descriptions

### Phase 2 — Engine Depth (Week 3–6)
6. Expand intake to 16 questions with conditional logic
7. Add regulated vs. unregulated structure selector
8. Validate and source all cost figures
9. Add user-adjustable scoring weight sliders
10. Expand cost slider to all 15 jurisdictions

### Phase 3 — Output Quality (Week 6–10)
11. Rebuild attorney brief with all 6 sections
12. Add fund structure diagram to brief
13. Add LP-by-LP tax waterfall table to brief
14. Add brief customization text input (AI-powered)

### Phase 4 — Killer Features (Week 10–16)
15. LP Tax Waterfall Simulator (standalone module)
16. Scenario Builder (2–3 parallel structures)
17. Compliance Calendar Generator + iCal export
18. My Structure Dashboard

### Phase 5 — Growth & Monetization (Post-Beta)
19. Counsel Matching Directory
20. CIS/Russian-Language Module
21. Regulatory Updates Page (live feed)
22. API + documentation
23. Cyprus jurisdiction landing page

---

## NOTES FOR CLAUDE CODE

- All new pages should follow the existing Next.js 14 structure at `gnconew.vercel.app`
- Dark institutional theme must be preserved across all new components
- All form components: avoid `<form>` HTML tags, use React state + onClick handlers
- PDF generation for attorney briefs: use Puppeteer server-side or a PDF API (PDFShift / DocRaptor)
- WHT treaty data: build a static JSON lookup table first, replace with API later
- Brief generation: integrate Anthropic Claude API (`claude-sonnet-4-20250514`) for text, pass structured JSON intake data as context
- All cost figures need `source_url` and `last_verified_date` fields in the data model
- Deploy via Vercel — existing GitHub repo connection should handle CI/CD

---

*Document prepared March 2026 — covers all findings from full platform audit and Architect Engine analysis.*
