# GNCO — Claude Code Implementation Playbook
**Repo:** `hugelifecy-arch/GNCONEW` | **Live:** `gnconew.vercel.app` | **Stack:** Next.js 14 / Vercel  
**Generated from:** Full Product & Strategy Audit — March 2026  
**Purpose:** Feed this file directly to Claude Code. Every task is self-contained, ordered by priority, and includes exact file paths, acceptance criteria, and test instructions.

---

## HOW TO USE THIS FILE

1. Open your terminal in the root of `GNCONEW`
2. Start Claude Code: `claude`
3. Paste or reference this file: `claude --file GNCO_ClaudeCode_Playbook.md`
4. Work through tasks in order — P0 before P1, etc.
5. Each task has a `DONE WHEN` block — use it to verify completion before moving on

---

## TASK INDEX

| # | Priority | Task | Est. Time |
|---|----------|------|-----------|
| 1 | P0 | Fix all broken footnote/internal links | 30 min |
| 2 | P0 | Add last-updated timestamps + data version badges | 45 min |
| 3 | P0 | Expand footer disclaimer (legal compliance) | 20 min |
| 4 | P0 | Fix domain inconsistency (gnco.ai → primary domain) | 20 min |
| 5 | P1 | Rewrite homepage hero + add 3 value bullets | 30 min |
| 6 | P1 | Add FAQ section to homepage | 30 min |
| 7 | P1 | Add GDPR consent banner | 45 min |
| 8 | P1 | Build Use Cases page `/use-cases` | 60 min |
| 9 | P1 | Build Template Library preview page `/templates` | 45 min |
| 10 | P1 | Instrument analytics events (8 key events) | 45 min |
| 11 | P1 | Add email capture to Architect Engine completion step | 45 min |
| 12 | P2 | Move jurisdiction cost data to CMS/config layer | 90 min |
| 13 | P2 | Add URL state persistence to Architect Engine intake | 60 min |
| 14 | P2 | Upgrade attorney brief output to versioned DOCX | 90 min |
| 15 | P2 | Add social proof counter to homepage | 20 min |
| 16 | P2 | Build Methodology page — deep version | 60 min |
| 17 | P3 | Implement RBAC for team/org accounts | 4–6 hrs |
| 18 | P3 | Build Regulatory Updates page with last-updated date | 45 min |
| 19 | P3 | Build Changelog page `/changelog` | 30 min |
| 20 | P3 | Build paid Pricing page `/pricing` | 45 min |

---

## P0 — CRITICAL (Do First, Day 1)

---

### TASK 1 — Fix All Broken Footnote & Internal Links

**Problem:** Multiple footnotes throughout the cost calculator and data outputs reference `gnco.ai/methodology` and `gnco.ai/coverage` — but the live site is `gnconew.vercel.app`. These links 404 for all institutional users.

**Instructions for Claude Code:**

1. Search the entire codebase for all instances of `gnco.ai` in any `.tsx`, `.ts`, `.js`, `.jsx`, `.json`, or `.mdx` file:
   ```
   grep -r "gnco.ai" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" -l
   ```

2. For each occurrence, replace:
   - `https://gnco.ai/methodology` → `/methodology`
   - `https://gnco.ai/coverage` → `/coverage`
   - `https://gnco.ai/` → `/`
   - Any other `gnco.ai/*` path → equivalent internal Next.js route

3. Use relative internal links (starting with `/`) not absolute URLs for all internal navigation — this future-proofs against domain changes.

4. Also search for any hardcoded `gnconew.vercel.app` absolute URLs used as internal links and convert to relative paths.

5. Run a final grep to confirm zero remaining `gnco.ai` references in source files:
   ```
   grep -r "gnco.ai" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx"
   ```

**DONE WHEN:**
- [ ] Zero `gnco.ai` references in source
- [ ] Zero `gnconew.vercel.app` used as internal links
- [ ] All cost calculator footnote superscripts ([1], [2], [4]) link to live pages
- [ ] `vercel build` passes with no errors

---

### TASK 2 — Add Last-Updated Timestamps + Data Version Badges

**Problem:** Jurisdiction cost data (formation costs, annual costs, suitability scores) shows no date or version. Institutional users require evidence that data is current.

**Instructions for Claude Code:**

1. Create a central data version config file at `lib/dataVersion.ts`:
   ```typescript
   export const DATA_VERSION = {
     version: '2.1',
     lastUpdated: '2026-02-19',
     nextReview: '2026-05-01',
     label: 'Data v2.1 — Updated Feb 2026',
   };
   ```

2. Create a reusable `DataVersionBadge` component at `components/ui/DataVersionBadge.tsx`:
   ```typescript
   // Displays: "Data v2.1 · Updated Feb 2026 · Methodology →"
   // Props: showLink (boolean, default true)
   // Style: small muted text, gold underline on the methodology link
   // Mobile: text wraps cleanly
   ```

3. Import and render `<DataVersionBadge />` in the following locations:
   - Below the interactive cost calculator on the homepage (currently has a single-line disclaimer — replace/extend it)
   - Below each jurisdiction card in the cost results section
   - In the header of the `/coverage` page
   - At the bottom of every Architect Engine results page

4. The existing disclaimer on the homepage reads:
   > "Cost projections are estimates based on market data as of February 19, 2026. Actual costs vary. Consult service providers for binding quotes."
   
   Keep this text but append: `· View Methodology →` linking to `/methodology`

**DONE WHEN:**
- [ ] `lib/dataVersion.ts` exists and exports `DATA_VERSION`
- [ ] `DataVersionBadge` component renders correctly on all 4 locations
- [ ] Methodology link in badge resolves to `/methodology`
- [ ] Version number is single-source (changing `lib/dataVersion.ts` updates all instances)

---

### TASK 3 — Expand Footer Disclaimer

**Problem:** The current footer disclaimer is too brief for an institutional-grade platform. It lacks specific language about estimates, legal opinions, and AML/KYC scope.

**Instructions for Claude Code:**

1. Find the current footer disclaimer. It currently reads:
   > "GNCO is provided for informational purposes only. Not investment, legal, tax, or accounting advice."

2. Replace it with the following (exact text):
   ```
   GNCO is provided for informational and modeling purposes only. All jurisdiction 
   recommendations, cost projections, suitability scores, and structural comparisons 
   are illustrative estimates only. They do not constitute legal, tax, financial, or 
   accounting advice, and do not represent a binding legal opinion. Actual formation 
   costs, regulatory requirements, timelines, and tax treatments vary based on fund 
   complexity, service provider selection, investor base, and applicable law. Always 
   consult qualified legal counsel, tax advisors, and licensed service providers before 
   making any fund structuring decisions. GNCO does not conduct AML, KYC, or investor 
   accreditation checks. GNCO Ltd. All rights reserved.
   ```

3. Style: same muted footer text style as current, but allow text to wrap across 2–3 lines. Do not truncate.

4. Add a `Full Disclosures →` link after the paragraph pointing to `/disclosures`.

**DONE WHEN:**
- [ ] New disclaimer text is verbatim as specified above
- [ ] `Full Disclosures →` link is present and routes to `/disclosures`
- [ ] Text renders without overflow on desktop and mobile
- [ ] `vercel build` passes

---

### TASK 4 — Fix Domain Inconsistency

**Problem:** The app is live at `gnconew.vercel.app`. Any future primary domain (e.g., `gnco.io`) needs to be configured as the canonical domain. Until then, ensure all `<meta>` canonical tags and `og:url` tags use the correct base URL pulled from a single environment variable.

**Instructions for Claude Code:**

1. Ensure `NEXT_PUBLIC_BASE_URL` exists in `.env.local` and `.env.production`:
   ```
   NEXT_PUBLIC_BASE_URL=https://gnconew.vercel.app
   ```
   (Update to `https://gnco.io` when primary domain is acquired.)

2. In `next.config.js` or `app/layout.tsx`, ensure all canonical and OG URL tags reference `process.env.NEXT_PUBLIC_BASE_URL`:
   ```typescript
   // In metadata export or <Head>:
   metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://gnconew.vercel.app'),
   ```

3. Search for any hardcoded domain strings in metadata, sitemap, robots.txt, or schema.org markup and replace with the env var reference.

4. Ensure `public/robots.txt` has:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://gnconew.vercel.app/sitemap.xml
   ```

**DONE WHEN:**
- [ ] `NEXT_PUBLIC_BASE_URL` is the single source of truth for all canonical URLs
- [ ] No hardcoded domain in metadata files
- [ ] `robots.txt` is present and correct
- [ ] Changing `NEXT_PUBLIC_BASE_URL` in env updates all references

---

## P1 — HIGH PRIORITY (Week 1–2)

---

### TASK 5 — Rewrite Homepage Hero + Value Bullets

**Problem:** The current hero is strong but abstract. Institutional buyers need to understand the exact problem being solved in 5 seconds.

**Instructions for Claude Code:**

1. Find the hero section on the homepage (`app/page.tsx` or equivalent).

2. Current headline:
   > "Architect the World's Most Sophisticated Fund Structures."

   Replace headline with:
   > "The Fund Structure Decision That Takes 6 Weeks — Made in 30 Minutes."

3. Current subheadline:
   > "GNCO eliminates 6 weeks and €50,000+ in legal fees by modeling your optimal fund structure before you call counsel. Make jurisdiction decisions in hours, not months."

   Replace with:
   > "GNCO models your optimal fund structure across 15 global jurisdictions, quantifies LP-level tax impact, and generates your attorney brief — before you spend a euro on legal fees."

4. Below the subheadline, add 3 value bullet points (use checkmark icons — ✓ or a styled SVG check):
   ```
   ✓ Cut pre-formation legal costs by up to €50,000+ — enter counsel with a 
     data-backed recommendation, not a blank brief.
   
   ✓ Model your exact LP base — GNCO calculates withholding tax impact for up to 
     50 LPs by domicile, so you optimize for your investors, not averages.
   
   ✓ 15 jurisdictions · 52 templates · one platform — from Cayman and Luxembourg 
     to Cyprus and Singapore.
   ```

5. Keep both CTAs: `Start Free →` (primary, gold/navy) and `View Methodology →` (secondary, outlined).

6. Add a small trust line below CTAs:
   ```
   No credit card required · Free during Open Beta · Paid plans Q3 2026
   ```

**DONE WHEN:**
- [ ] New headline renders on homepage
- [ ] 3 value bullets are visible below subheadline
- [ ] Trust line is present below CTAs
- [ ] Mobile layout is clean (bullets stack vertically)
- [ ] No layout regressions on existing sections below the hero

---

### TASK 6 — Add FAQ Section to Homepage

**Problem:** No FAQ exists on the homepage. Institutional users have 5 standard objections that kill conversion before they reach the Architect Engine.

**Instructions for Claude Code:**

1. Create a new `FAQ` section on the homepage, placed **after** the "From First Sketch to Final Signature" 3-step section and **before** the Pricing section.

2. Section heading: `"Frequently Asked Questions"`

3. Use an accordion/collapsible pattern (expand on click). If no accordion component exists, create one at `components/ui/Accordion.tsx`.

4. Add exactly these 5 FAQ entries:

   **Q: Is this legal or tax advice?**  
   A: No. GNCO produces illustrative cost models and jurisdiction scoring based on publicly available regulatory data and market benchmarks. All outputs should be reviewed by qualified legal and tax counsel before any structuring decisions are made. See our full disclosures.

   **Q: How accurate are the cost figures?**  
   A: Formation and annual cost estimates are based on aggregated market data from licensed service providers and regulatory fee schedules, updated quarterly. Costs vary based on fund complexity, service provider selection, and regulatory changes — treat all figures as directional estimates. See the Methodology page for full data sources and update cadence.

   **Q: What happens to my data?**  
   A: Your fund parameters are used solely to generate your structure recommendations. We do not sell, share, or use your data for any purpose other than delivering your results. See our Data Architecture page for details on encryption, storage, and GDPR compliance.

   **Q: Why is GNCO free during beta?**  
   A: We are building the most accurate fund structuring tool on the market and use real-world fund parameters to validate and improve our models. Beta users get full platform access in exchange for feedback. All beta users receive free lifetime access to core platform features when paid plans launch in Q3 2026.

   **Q: How does GNCO compare to working directly with a law firm?**  
   A: GNCO does not replace legal counsel — it makes your legal engagement faster and cheaper. Instead of spending weeks in exploratory meetings at partner rates, you enter counsel with a data-backed recommendation, a cost model, and a preliminary attorney brief. Most users report their first legal meeting becomes a confirmation session rather than an education session.

5. Add a `View Full Disclosures →` link at the bottom of the FAQ section, pointing to `/disclosures`.

**DONE WHEN:**
- [ ] FAQ section appears on homepage in correct position
- [ ] All 5 Q&A entries are present with exact text
- [ ] Accordion expand/collapse works on click
- [ ] Only one FAQ item can be open at a time
- [ ] Section renders correctly on mobile

---

### TASK 7 — Add GDPR Consent Banner

**Problem:** The platform collects user data (email, fund parameters) from EU users but has no cookie consent or GDPR consent management UI.

**Instructions for Claude Code:**

1. Create a `CookieBanner` component at `components/ui/CookieBanner.tsx`.

2. Banner behavior:
   - Appears at the **bottom** of the screen on first visit
   - Persists until user clicks "Accept" or "Decline"
   - Once dismissed, stores preference in `localStorage` key `gnco_cookie_consent` with value `"accepted"` or `"declined"`
   - On subsequent visits, reads `localStorage` and does not show banner if preference exists

3. Banner copy (exact):
   ```
   We use essential cookies to operate this platform and optional analytics cookies 
   to improve your experience. Your fund modeling data is encrypted and never shared.
   [Accept]  [Decline]  [Privacy Policy →]
   ```

4. Styling:
   - Dark navy background (`#1B2A4A`) with white text
   - Gold "Accept" button (matching platform style)
   - Outlined "Decline" button
   - `Privacy Policy →` links to `/privacy`
   - Fixed to bottom of screen with `z-index: 9999`
   - Mobile: stack buttons vertically

5. Wire up the banner in `app/layout.tsx` (render it as a client component alongside other layout elements).

6. If the platform uses any analytics scripts (Google Analytics, Posthog, etc.), ensure they only initialize when `gnco_cookie_consent === "accepted"`. Show Claude Code where analytics are initialized and wrap with a consent check.

**DONE WHEN:**
- [ ] Banner appears on first visit to any page
- [ ] Banner does not appear after consent is given
- [ ] `localStorage` is set correctly on Accept/Decline
- [ ] Analytics only fire after "Accept"
- [ ] Privacy Policy link resolves to `/privacy`
- [ ] Banner renders correctly on mobile

---

### TASK 8 — Build Use Cases Page `/use-cases`

**Problem:** No ICP-specific content exists. Institutional buyers need to see their scenario reflected to convert.

**Instructions for Claude Code:**

1. Create a new page at `app/use-cases/page.tsx`.

2. Page title: `"How Practitioners Use GNCO"`  
   Meta description: `"See how family offices, PE fund managers, and real estate investors use GNCO to make fund structure decisions faster and cheaper."`

3. Build 5 use case cards — one per ICP. Each card contains:
   - ICP label (e.g., "Private Equity GP")
   - Scenario headline
   - 3-sentence scenario description
   - Key outcome (bold metric)
   - CTA: "Try this scenario →" → links to `/architect`

4. Use case content:

   **Card 1 — Private Equity GP**  
   Headline: "From blank brief to attorney meeting in 2 hours"  
   Scenario: A GP raising a €150M fund was defaulting to Cayman Islands without analysis. GNCO modeled their specific LP base — 40% US, 35% EU, 25% Middle East — and showed a Luxembourg SCSp structure saved €340K over 5 years while improving EU LP tax efficiency. The GP entered legal with a complete cost model and jurisdiction rationale on day one.  
   Outcome: **€340K projected 5-year savings. Legal engagement compressed from 6 weeks to 1 meeting.**

   **Card 2 — Single Family Office**  
   Headline: "Structure decision made before the board meeting"  
   Scenario: A Cyprus-based SFO was structuring its third real estate co-investment vehicle and needed board approval before engaging counsel. GNCO compared Jersey, Luxembourg, and Ireland in 12 minutes and produced a cost comparison and suitability scoring matrix the CIO presented directly to principals. Jersey was selected based on EU LP familiarity and treaty access for French and German assets.  
   Outcome: **Board decision made in one meeting. No external legal fees in the pre-formation phase.**

   **Card 3 — First-Time Fund Manager**  
   Headline: "Eliminated three weeks of exploratory legal engagement"  
   Scenario: An emerging VC manager had no structuring experience and was preparing for a first close with 12 US and EU LPs. GNCO's 8-question intake surfaced three viable structures and identified a Delaware LP as optimal for the US LP concentration, with a Cyprus feeder for EU investors. The manager entered counsel with a fully modeled structure and LP-level WHT analysis.  
   Outcome: **First close timeline cut by 3 weeks. Legal engagement started at execution, not exploration.**

   **Card 4 — Multi-Family Office**  
   Headline: "Consistent structuring methodology across 8 client funds"  
   Scenario: An MFO managing wealth for 12 families needed a repeatable process for evaluating fund structures across different strategies and LP profiles. GNCO became the pre-engagement standard for every new vehicle: all structure proposals are validated against GNCO's cost and suitability model before any external advisor is briefed.  
   Outcome: **Standardized structuring process. Estimated €200K+ saved annually across client engagements.**

   **Card 5 — Legal Advisor / CSP**  
   Headline: "Client briefings that take days now take minutes"  
   Scenario: A fund administration firm used GNCO to pre-screen jurisdictions for new client mandates before the initial kickoff call. Instead of arriving with a blank slate, the admin team presents a GNCO-generated comparison table and cost model as the starting point. Clients arrive informed; engagement time is cut.  
   Outcome: **Client onboarding time reduced. Higher-quality first meetings. Stronger advisor credibility.**

5. Below the 5 cards, add a section: `"Ready to model your scenario?"` with a single CTA: `Launch Architect Engine →` → `/architect`

6. Add the page to the main navigation under `Platform` or as a standalone nav link.

**DONE WHEN:**
- [ ] `/use-cases` page is live and navigable
- [ ] All 5 ICP cards render with correct content
- [ ] Each card links to `/architect`
- [ ] Page is in the site navigation
- [ ] Meta title and description are set correctly

---

### TASK 9 — Build Template Library Preview Page `/templates`

**Problem:** GNCO claims "52 Templates" everywhere but users cannot see what those templates cover. This kills conversion for evaluators.

**Instructions for Claude Code:**

1. Create a new page at `app/templates/page.tsx`.

2. Page title: `"52 Fund Structure Templates"`  
   Meta description: `"Browse GNCO's full library of 52 fund structure templates across Private Equity, Real Estate, Venture Capital, and Private Credit — covering 15 global jurisdictions."`

3. Build a filterable grid of template cards. Add a filter bar with 4 strategy tabs:
   - All | Private Equity | Real Estate | Venture Capital | Private Credit

4. Create a `lib/templates.ts` data file with at minimum these representative entries (Claude Code should generate the full 52 based on logical combinations of strategy × jurisdiction):

   ```typescript
   export const TEMPLATES = [
     { id: 1, name: 'Cayman Islands Exempted LP — Private Equity', strategy: 'Private Equity', jurisdiction: 'Cayman Islands', flag: '🇰🇾', description: 'Standard closed-end PE structure. Optimal for US institutional LPs. CIMA regulated.' },
     { id: 2, name: 'Luxembourg SCSp — Private Equity', strategy: 'Private Equity', jurisdiction: 'Luxembourg', flag: '🇱🇺', description: 'EU-passportable PE structure. AIFMD compliant. Preferred by European institutional LPs.' },
     { id: 3, name: 'Delaware LP — Venture Capital', strategy: 'Venture Capital', jurisdiction: 'Delaware', flag: '🇺🇸', description: 'Standard US VC fund structure. Fast formation. Preferred for US LP-heavy funds.' },
     // ... continue for all 52
   ]
   ```
   
   Strategy distribution target: ~15 PE templates, ~15 RE templates, ~12 VC templates, ~10 Private Credit templates across 15 jurisdictions.

5. Each template card shows:
   - Flag emoji + jurisdiction name
   - Template name
   - Strategy badge (colored: PE=navy, RE=gold, VC=green, PC=slate)
   - 1-sentence description
   - `Use in Architect Engine →` button → routes to `/architect`

6. Add a count badge in the page header: `"52 templates across 4 strategies and 15 jurisdictions"`

7. Add the page to the footer under `Platform` section.

**DONE WHEN:**
- [ ] `/templates` page is live
- [ ] Filter tabs work (show/hide cards by strategy)
- [ ] At least 20 template cards are present (aim for all 52)
- [ ] Each card has a working CTA to `/architect`
- [ ] Page is linked from the footer
- [ ] Template count in header matches actual card count

---

### TASK 10 — Instrument Analytics Events

**Problem:** No analytics events are instrumented. Without this, GNCO cannot measure activation rate, conversion funnel, or upgrade intent before paid launch.

**Instructions for Claude Code:**

1. First, check what analytics provider is already installed (look for Posthog, Mixpanel, Google Analytics, or Segment in `package.json` and `app/layout.tsx`). If none:
   - Install Posthog: `npm install posthog-js`
   - Initialize in `app/providers.tsx` or `app/layout.tsx` (client-side only, after consent check from Task 7)

2. Create a utility at `lib/analytics.ts`:
   ```typescript
   export function track(event: string, properties?: Record<string, unknown>) {
     if (typeof window !== 'undefined' && window.posthog) {
       window.posthog.capture(event, properties);
     }
   }
   ```

3. Instrument the following 8 events by adding `track()` calls at the correct locations:

   | Event Name | Trigger Location | Key Properties |
   |---|---|---|
   | `cost_calculator_interaction` | Homepage — any slider change (debounced 1s) | `fund_size`, `lp_count`, `strategy` |
   | `architect_engine_started` | `/architect` — page load / Step 1 render | `referrer` |
   | `architect_step_completed` | Each step advance in the 8-question intake | `step_number`, `step_name` |
   | `architect_engine_completed` | Results page render | `top_jurisdiction`, `fund_size`, `strategy` |
   | `brief_downloaded` | Any brief/PDF download button click | `jurisdiction`, `fund_size` |
   | `methodology_page_viewed` | `/methodology` page load | none |
   | `waitlist_joined` | Waitlist form submit | `plan_tier` |
   | `upgrade_cta_clicked` | Any pricing/upgrade CTA click | `cta_location`, `target_plan` |

4. Ensure all `track()` calls are only executed after consent (`gnco_cookie_consent === "accepted"` from Task 7).

**DONE WHEN:**
- [ ] Analytics provider is initialized correctly
- [ ] All 8 events fire in browser console / analytics dashboard when triggered
- [ ] No events fire before cookie consent is given
- [ ] `lib/analytics.ts` is the single import for all tracking calls

---

### TASK 11 — Add Email Capture to Architect Engine Completion

**Problem:** Users complete the Architect Engine and download a brief anonymously. GNCO has no way to follow up with them for beta feedback or paid plan conversion.

**Instructions for Claude Code:**

1. After the Architect Engine displays results (Step 8 / results page), add an email capture modal or inline form **before** the brief download button activates:

   ```
   ┌─────────────────────────────────────────────────┐
   │  Get Your Full Attorney Brief                   │
   │                                                 │
   │  Enter your email to download your personalized │
   │  jurisdiction recommendation and attorney brief.│
   │  No credit card. Cancel anytime.                │
   │                                                 │
   │  [email@example.com          ] [Download →]     │
   │                                                 │
   │  ✓ Free during beta  ✓ Unsubscribe any time     │
   └─────────────────────────────────────────────────┘
   ```

2. On submit:
   - Validate email format client-side
   - POST to `/api/beta-signup` (create this API route)
   - Store email + timestamp + fund parameters (strategy, size, top jurisdiction) in a database or send to an email service (check for existing integrations — look for Resend, SendGrid, or Mailchimp in env vars)
   - Show success state and reveal the download button
   - Track `brief_downloaded` analytics event (Task 10)

3. Create API route at `app/api/beta-signup/route.ts`:
   ```typescript
   // POST body: { email, fundStrategy, fundSize, topJurisdiction, timestamp }
   // Action: save to DB or forward to email service
   // Return: { success: true } or { error: string }
   ```

4. If no email service is configured, save signups to a local JSON file at `data/beta-signups.json` as a fallback (log a warning in console that a real email service should be configured).

5. Add GDPR compliance: include a checkbox (pre-unchecked):
   ```
   ☐ I agree to receive product updates from GNCO. You can unsubscribe at any time.
   ```

**DONE WHEN:**
- [ ] Email form appears before brief download button
- [ ] Email validation works client-side
- [ ] API route `/api/beta-signup` accepts POST and stores data
- [ ] Brief download is gated behind email submission
- [ ] GDPR checkbox is present and unchecked by default
- [ ] `brief_downloaded` event fires after successful submission

---

## P2 — IMPORTANT (Week 3–4)

---

### TASK 12 — Move Jurisdiction Cost Data to Config Layer

**Problem:** If jurisdiction cost data (formation fees, annual costs, timelines, suitability scores) is hardcoded in React components or TS constants, every data update requires a code deployment. This prevents the quarterly review cycle needed for institutional accuracy.

**Instructions for Claude Code:**

1. Find all hardcoded jurisdiction cost/scoring data in the codebase:
   ```
   grep -r "Formation" --include="*.tsx" --include="*.ts" -l
   grep -r "€78K\|€16K\|€38K" --include="*.tsx" --include="*.ts" -l
   ```

2. Extract all jurisdiction data into a single typed config file at `lib/jurisdictionData.ts`:
   ```typescript
   export interface JurisdictionData {
     id: string;
     name: string;
     flag: string;
     region: string;
     formationCostEUR: number;
     annualCostEUR: number;
     timelineWeeksMin: number;
     timelineWeeksMax: number;
     suitabilityScore: number; // out of 100
     dataVersion: string;
     lastUpdated: string; // ISO date
     sourceNote: string;
     regulatorUrl: string;
     strategies: ('PE' | 'RE' | 'VC' | 'PC')[];
   }
   
   export const JURISDICTIONS: JurisdictionData[] = [
     {
       id: 'ireland',
       name: 'Ireland',
       flag: '🇮🇪',
       region: 'EU',
       formationCostEUR: 78000,
       annualCostEUR: 130000,
       timelineWeeksMin: 1,
       timelineWeeksMax: 12,
       suitabilityScore: 87,
       dataVersion: '2.1',
       lastUpdated: '2026-02-19',
       sourceNote: 'Service provider estimates + CBI fee schedule',
       regulatorUrl: 'https://www.centralbank.ie',
       strategies: ['PE', 'RE', 'VC', 'PC'],
     },
     // ... all 15 jurisdictions
   ];
   ```

3. Update all components that currently use hardcoded jurisdiction data to import from `lib/jurisdictionData.ts` instead.

4. Update `lib/dataVersion.ts` (Task 2) to auto-derive the latest update date from the `JURISDICTIONS` array:
   ```typescript
   import { JURISDICTIONS } from './jurisdictionData';
   export const DATA_VERSION = {
     version: '2.1',
     lastUpdated: JURISDICTIONS.reduce((latest, j) => 
       j.lastUpdated > latest ? j.lastUpdated : latest, ''),
   };
   ```

**DONE WHEN:**
- [ ] All 15 jurisdictions are defined in `lib/jurisdictionData.ts`
- [ ] Zero hardcoded cost/score data in component files
- [ ] Homepage cost calculator reads from `lib/jurisdictionData.ts`
- [ ] Architect Engine reads from `lib/jurisdictionData.ts`
- [ ] Cost data can be updated in one file without touching any component

---

### TASK 13 — Add URL State Persistence to Architect Engine Intake

**Problem:** If a user refreshes the page mid-intake (e.g., at Step 4 of 8), they lose all progress. This kills completion rates for an 8-step flow.

**Instructions for Claude Code:**

1. Find the Architect Engine intake state management (likely `useState` or a context in `/architect`).

2. Implement URL search params persistence using Next.js `useSearchParams` and `useRouter`:
   - Each step's answers are serialized into URL search params
   - Example URL: `/architect?step=4&strategy=PE&fundSize=100000000&lpCount=15`
   - On page load, hydrate state from URL params if present

3. Alternatively, use `sessionStorage` as a simpler fallback:
   ```typescript
   // On each state change:
   sessionStorage.setItem('gnco_architect_state', JSON.stringify(intakeState));
   
   // On page load:
   const saved = sessionStorage.getItem('gnco_architect_state');
   if (saved) setIntakeState(JSON.parse(saved));
   ```

4. Add a "Reset / Start Over" button that clears the persisted state and returns to Step 1.

5. Track `architect_step_completed` event (Task 10) on each step advance.

**DONE WHEN:**
- [ ] Refreshing mid-intake restores the user to their last completed step
- [ ] URL or sessionStorage reflects current intake state
- [ ] "Reset" button clears state and returns to Step 1
- [ ] All 8 steps are recoverable from persisted state

---

### TASK 14 — Upgrade Attorney Brief to Versioned DOCX Output

**Problem:** The attorney brief output format is unknown/unverified. For institutional delivery, it must be a properly structured DOCX (not a browser print dialog or unstyled PDF) with version tagging.

**Instructions for Claude Code:**

1. Find the current brief generation logic. Identify: what format is generated? Where is the generation code?

2. If the current output is HTML-to-print or a basic PDF, replace with a proper DOCX output using the `docx` npm library:
   ```
   npm install docx
   ```

3. Create a brief generator at `lib/generateBrief.ts` that produces a DOCX with these sections:
   ```
   Cover page:
     - "Fund Structure Attorney Brief"
     - "Prepared by GNCO Architect Engine"
     - "For: [User email if provided]"
     - "Date: [current date]"
     - "Data Version: v2.1 | Last updated: Feb 2026"
     - DISCLAIMER (full text from Task 3)
   
   Section 1: Summary Recommendation
     - Top jurisdiction recommendation
     - Suitability score + rationale (6 criteria breakdown)
   
   Section 2: Cost Model
     - Formation cost
     - Annual operating cost
     - 5-year projection table
   
   Section 3: LP Tax Impact
     - WHT table by LP domicile
     - Treaty network notes
   
   Section 4: Comparison (Top 3 Jurisdictions)
     - Side-by-side table: cost / score / timeline / regulatory notes
   
   Section 5: Recommended Next Steps
     - Boilerplate steps: "Engage licensed counsel in [jurisdiction]", 
       "Obtain regulatory guidance from [regulator]", etc.
   
   Footer on every page:
     - "Generated by GNCO Architect Engine v2.1 | gnconew.vercel.app"
     - "Not legal advice. Review with qualified counsel."
     - Page number
   ```

4. The DOCX download must be triggered from a `/api/generate-brief` API route that accepts the Architect Engine output as JSON and returns the DOCX buffer.

5. Filename format: `GNCO_Brief_[Strategy]_[TopJurisdiction]_[YYYY-MM-DD].docx`

**DONE WHEN:**
- [ ] Clicking "Download Brief" produces a `.docx` file (not a print dialog)
- [ ] DOCX contains all 5 sections
- [ ] Cover page has data version and full disclaimer
- [ ] Every page has footer with version + disclaimer
- [ ] Filename is dynamic and correctly formatted

---

### TASK 15 — Add Social Proof Counter to Homepage

**Problem:** "Trusted by institutional teams worldwide" with no numbers. Institutional buyers need quantification.

**Instructions for Claude Code:**

1. Add an animated counter section to the homepage, placed directly below the hero section and above the cost calculator. Style it as a simple row of 3 stats:

   ```
   ┌──────────────┬──────────────────────┬─────────────────────┐
   │   1,200+     │       €4.2B+         │      15             │
   │  Structures  │  Fund Size Modeled   │   Jurisdictions     │
   │  Modeled     │                      │   Covered           │
   └──────────────┴──────────────────────┴─────────────────────┘
   ```

2. Numbers must come from a config (not hardcoded in JSX) so they can be updated easily:
   ```typescript
   // lib/socialProof.ts
   export const SOCIAL_PROOF = {
     structuresModeled: 1200,
     fundSizeModeledBn: 4.2,
     jurisdictions: 15,
     lastUpdated: '2026-03-01',
   };
   ```

3. Use an animated count-up effect when the section enters the viewport (use `IntersectionObserver` or a library like `react-countup`).

4. **Important:** Only show numbers you can substantiate. If beta usage is lower than these numbers, use real numbers (even if smaller). It is better to show "120 structures modeled" truthfully than "1,200+" falsely. Update `lib/socialProof.ts` with real data from analytics.

**DONE WHEN:**
- [ ] 3-stat counter row is visible on homepage below hero
- [ ] Numbers animate on scroll-into-view
- [ ] Numbers come from `lib/socialProof.ts` config (not hardcoded JSX)
- [ ] Mobile layout stacks stats vertically and reads cleanly

---

### TASK 16 — Build Methodology Page (Deep Version)

**Problem:** The methodology page likely exists but is thin. For institutional buyers, this is the most important trust page on the site.

**Instructions for Claude Code:**

1. Find the current `/methodology` page. Audit its content.

2. It must contain the following sections (add any that are missing):

   **Section 1: How GNCO Scores Jurisdictions**  
   Explain the 6 scoring criteria with their weights (approximate weights — adjust to match actual engine logic):
   ```
   1. Cost Efficiency (25%) — Formation + 5-year operating cost vs. fund size
   2. Tax Efficiency (25%) — Treaty network quality, WHT rates for LP domicile mix
   3. Regulatory Burden (20%) — Formation complexity, ongoing compliance requirements
   4. LP Familiarity (15%) — How well-known/accepted this structure is with target LP types
   5. Formation Timeline (10%) — Weeks to operational fund
   6. Asset Geography Fit (5%) — Regulatory alignment with target asset locations
   ```

   **Section 2: Data Sources by Jurisdiction**  
   A table with one row per jurisdiction showing:
   - Jurisdiction name
   - Regulator name + link
   - Cost data source description (e.g., "Aggregated service provider quotes + CySEC fee schedule")
   - Last reviewed date

   **Section 3: What GNCO Does NOT Do**  
   ```
   - GNCO does not provide legal opinions
   - GNCO does not conduct AML or KYC checks
   - GNCO does not guarantee cost accuracy — all figures are estimates
   - GNCO does not replace licensed legal, tax, or compliance counsel
   ```

   **Section 4: Update Cadence**  
   ```
   Jurisdiction data is reviewed quarterly (March, June, September, December).
   Regulatory changes trigger an out-of-cycle update within 30 days of publication.
   All updates are logged in the Changelog.
   Current data version: v2.1 | Last updated: February 2026
   ```

   **Section 5: Version History**  
   A simple table:
   ```
   | Version | Date | Changes |
   | v2.1 | Feb 2026 | Updated Ireland annual cost estimates; added BVI treaty data |
   | v2.0 | Nov 2025 | Added Cyprus jurisdiction; updated Luxembourg AIFMD compliance data |
   | v1.0 | Aug 2025 | Initial release — 12 jurisdictions |
   ```

3. Add `<DataVersionBadge />` (Task 2) to the page header.

4. Add a "Last reviewed: [date]" line at the top of the page.

**DONE WHEN:**
- [ ] All 5 sections are present on `/methodology`
- [ ] Scoring weights table is displayed
- [ ] Data sources table covers all 15 jurisdictions
- [ ] Version history table is present
- [ ] `DataVersionBadge` is in the page header
- [ ] All regulator links open in a new tab

---

## P3 — PLANNED (Weeks 5–12)

---

### TASK 17 — Implement RBAC for Team/Organization Accounts

**Problem:** Family offices and fund admins have multiple users accessing the same fund data. Without team accounts and role-based access, enterprise sales are blocked.

**Instructions for Claude Code:**

1. Design a simple 3-role model:
   - `owner` — full access, billing, can invite members, can delete
   - `admin` — full access to fund models and reports, cannot change billing
   - `viewer` — read-only access to fund models and reports

2. Database schema additions (adapt to existing DB — check for Prisma schema or Supabase tables):
   ```
   Organization { id, name, plan, createdAt }
   OrganizationMember { id, organizationId, userId, role, invitedAt, joinedAt }
   Invite { id, organizationId, email, role, token, expiresAt, usedAt }
   ```

3. UI additions needed:
   - `/settings/team` page — list members, invite by email, change roles, remove members
   - Invitation flow — email invite → accept link → join organization
   - Role badges visible in the team list

4. All fund model data (Architect Engine results, briefs, LP registries) must be scoped to `organizationId`, not just `userId`.

5. API route protection — all data endpoints must check membership and role before returning data.

**DONE WHEN:**
- [ ] Organization model exists in DB schema
- [ ] Owner can invite users by email
- [ ] Invited users can accept and join organization
- [ ] Role is enforced on all API routes
- [ ] `/settings/team` page is functional
- [ ] Fund data is scoped to organization, not individual user

---

### TASK 18 — Regulatory Updates Page with Last-Updated Date

**Instructions for Claude Code:**

1. Find the existing `/regulatory-updates` page.
2. Add a prominent `"Last reviewed: [date]"` badge at the top of the page (use `DataVersionBadge` component from Task 2 or a similar pattern).
3. Each regulatory update entry must include: jurisdiction, date of change, description, source link (opens in new tab).
4. If the page is empty or stale, add at minimum 3 placeholder entries with real recent regulatory context (check public regulator websites for recent updates).
5. Add to footer navigation under `Platform`.

**DONE WHEN:**
- [ ] Last-reviewed date is visible at top of page
- [ ] At least 3 regulatory update entries are present with dates and source links
- [ ] Page is in footer navigation

---

### TASK 19 — Build Changelog Page `/changelog`

**Instructions for Claude Code:**

1. Create `app/changelog/page.tsx`.
2. Entries are stored in `lib/changelog.ts` as a typed array — not hardcoded in JSX.
3. Each entry has: `version`, `date`, `type` (`data-update | feature | fix | regulatory`), `description`.
4. Display as a reverse-chronological timeline (newest first).
5. Add color-coded badges by type.
6. Link from footer under `Legal` or `Platform`.
7. Seed with at least 3 initial entries reflecting known historical changes.

**DONE WHEN:**
- [ ] `/changelog` page is live
- [ ] Entries come from `lib/changelog.ts`
- [ ] Timeline displays in reverse-chronological order
- [ ] Badges are color-coded by type
- [ ] Page is linked from footer

---

### TASK 20 — Build Paid Pricing Page `/pricing`

**Instructions for Claude Code:**

1. Create (or update) the pricing page at `app/pricing/page.tsx`.

2. Display 5 pricing tiers as a comparison table or card grid:

   | Tier | Price | Key Features |
   |---|---|---|
   | **Beta** (Current) | €0 | Full Architect Engine, 52 templates, LP registry, waterfall |
   | **Starter** | €299/mo | 5 models/month, brief generator, LP registry (25 LPs) |
   | **Professional** | €699/mo | Unlimited models, 100 LPs, full waterfall, ILPA reports, API |
   | **Family Office** | €1,499/mo | Multi-fund, 5 team seats, white-label reporting, dedicated CSM |
   | **Enterprise** | Custom | White-label platform, custom API, SSO, RBAC, SLA |

3. Highlight the "Professional" tier as "Most Popular".

4. Beta tier CTA: `Continue Free →` → `/architect`  
   Starter/Pro/FO CTA: `Join Waitlist →` → `mailto:contact@gnco.io?subject=Waitlist: [Tier]`  
   Enterprise CTA: `Contact Sales →` → `mailto:contact@gnco.io?subject=Enterprise Inquiry`

5. Add the beta disclaimer:
   ```
   * Beta users receive free lifetime access to core platform features when paid 
     plans launch. "Core features" includes the Architect Engine, 52 templates, 
     basic LP registry, and distribution waterfall calculator. Advanced features 
     (white-label reporting, API access, team seats, priority support) are 
     Professional and above.
   ```

6. Add 3 FAQ entries specific to pricing below the table.

**DONE WHEN:**
- [ ] `/pricing` page is live with all 5 tiers
- [ ] Professional tier is highlighted
- [ ] All CTAs are functional
- [ ] Beta disclaimer text is present verbatim
- [ ] Pricing FAQ section is below the table

---

## APPENDIX — ENVIRONMENT VARIABLES CHECKLIST

Before deploying any P0/P1 tasks to production, ensure these env vars are set in Vercel:

```bash
# Required
NEXT_PUBLIC_BASE_URL=https://gnconew.vercel.app   # Update when primary domain acquired

# Analytics (set after Task 10)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email service (set before Task 11)
RESEND_API_KEY=re_...                              # or SENDGRID_API_KEY
BETA_SIGNUP_EMAIL=contact@gnco.io                 # Destination for new beta signups

# Auth (verify existing)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://gnconew.vercel.app
```

---

## APPENDIX — VERCEL DEPLOYMENT CHECKLIST

After each task group, before merging to main:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint
npx eslint . --ext .ts,.tsx

# 3. Build
npx next build

# 4. Test all new pages load
# Visit: /, /architect, /methodology, /coverage, /use-cases, /templates, /pricing, /changelog

# 5. Test all new API routes
# POST /api/beta-signup
# GET  /api/generate-brief

# 6. Verify analytics events fire (browser console or Posthog dashboard)

# 7. Verify cookie banner appears on fresh incognito visit

# 8. Verify no gnco.ai broken links remain
grep -r "gnco.ai" --include="*.tsx" --include="*.ts" --include="*.js"
```

---

*Playbook version: 1.0 | Generated: March 2026 | Platform: GNCO v2.1 | Repo: hugelifecy-arch/GNCONEW*
