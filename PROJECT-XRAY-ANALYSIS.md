# GNCO Project X-Ray Analysis

> Senior Investment Technology Expert Assessment
> Date: March 4, 2026
> Target: Institutional Investors, Family Offices, GPs, LPs ($100M-$10B+ AUM)

---

## What GNCO Actually Does (Plain English)

GNCO is a **digital fund structuring and operations platform** for institutional investors. Think of it as a Bloomberg Terminal meets legal counsel tool — it helps family offices, fund managers, and limited partners figure out:

1. **Where to set up their fund** (Cayman, Luxembourg, Delaware, etc.) based on their specific investor base, strategy, and tax needs
2. **How to run day-to-day fund operations** — tracking investors, making capital calls, distributing profits, and managing documents
3. **How the fund is performing** — dashboards showing IRR, TVPI, MOIC, and other metrics that institutional investors care about

The platform replaces what today takes 3-6 months of back-and-forth with lawyers, accountants, and administrators with an intelligent recommendation engine and operational toolkit.

---

## How It Works Step by Step

### Step 1: The Architect (Fund Structuring Wizard)
A GP or family office CIO enters an 8-step questionnaire: fund strategy (PE, VC, real estate, credit), target fund size, GP domicile, LP types (pension funds, sovereign wealth, family offices), timeline, and priorities (tax efficiency vs. speed vs. privacy). The system scores 15 jurisdictions across 6 dimensions and recommends the top 3 structures with estimated costs, timelines, and regulatory requirements. Results can be exported as a PDF "attorney brief" or shared via link.

### Step 2: The Operator (Fund Management Suite)
Once the fund is structured, the operator module handles:
- **LP Registry**: Track every investor — legal name, entity type, domicile, commitment, KYC status, subscription status. Automatic compliance screening (ERISA thresholds, FATCA classification, withholding tax).
- **Capital Calls**: Create calls, allocate across LPs pro rata, track payment status.
- **Distributions**: 4-tier waterfall calculator (return of capital → preferred return → GP catch-up → carried interest split). Per-LP allocation with tax attribution.
- **Document Vault**: Upload, version, categorize fund documents. Full audit trail of who accessed what.

### Step 3: The Dashboard (Performance Intelligence)
KPI cards showing AUM, committed capital, IRR, and deployment ratio. Vintage year heatmap, performance charts, and activity tables. Privacy mode toggle to mask sensitive numbers during demos.

### Step 4: Intelligence Module (Future — Scaffolded)
Placeholder for AI-powered regulatory monitoring, scenario stress testing, and performance analytics.

---

## 5 Most Important Parts (Value Creators)

### 1. Jurisdiction Scoring Algorithm (`architect-logic.ts`)
This is the **crown jewel**. It scores 15 jurisdictions across tax efficiency, LP familiarity, regulatory simplicity, speed-to-close, cost, and privacy — then adjusts based on the specific fund brief. This is what no other platform does well. It replaces $50K-$100K in legal consultation with an instant, data-driven recommendation.

### 2. LP Compliance Screening Engine (`lp-compliance.ts`)
Automatic ERISA threshold detection (25% rule), FATCA classification, and withholding tax analysis. This catches compliance landmines before they become problems. For a fund with 20+ LPs across multiple jurisdictions, this alone saves weeks of counsel time.

### 3. Waterfall Calculator (`waterfall-calculator.ts`)
Proper 4-tier distribution waterfall with GP catch-up, carried interest split, and management fee offset. This is the math that determines how profits flow — getting it wrong means legal disputes. Having it automated and transparent is high-value.

### 4. LP Attribution & Tax Modeling (`lp-attribution.ts`)
Per-LP performance metrics (gross IRR, net IRR, after-WHT IRR, after-tax IRR) with domicile-specific withholding tax rates. This is what LPs actually want to see — their real, after-tax returns. Most platforms stop at gross returns.

### 5. Institutional-Grade UX and Design System
Dark theme, DM Serif Display/DM Sans typography, CSS custom property tokens, privacy mode, and compliance-first workflows. This isn't a consumer app with a dark skin — it's designed to sit on the desk of someone managing $500M. The design credibility is essential for institutional trust.

---

## 5 Biggest Problems

### 1. Everything Runs on Mock Data (CRITICAL)
The entire platform — LP registry, capital calls, distributions, documents, dashboard KPIs — uses hardcoded mock data. The Prisma schema exists, PostgreSQL is configured, but **no live database is connected**. Authentication via Clerk is stubbed. This means the product cannot be used by a real customer today. The gap between "impressive demo" and "production-ready" is significant.

### 2. Security Vulnerabilities in Shared Features (HIGH)
- Passwords for shared comparisons are stored **in plaintext in memory** and transmitted as **URL query parameters** (visible in browser history, server logs, and HTTP referrer headers)
- API endpoints (`/api/architect/recommend`, `/api/architect/share`, `/api/compare/share`) have **no authentication** — anyone can call them
- Rate limiting uses an in-memory `Map` that resets on server restart and doesn't work across multiple instances
- No CSRF protection on POST endpoints

### 3. No Test Coverage (HIGH)
Only 1 test file exists (`jurisdictions.test.ts`) out of 99 TypeScript files. No API route tests, no component tests, no integration tests. Estimated coverage: **under 5%**. For a platform handling fund operations and compliance calculations, this is dangerous. A single regression in the waterfall calculator or ERISA screening could produce incorrect financial outputs.

### 4. Unpinned Dependencies (MEDIUM-HIGH)
`package.json` specifies `"next": "latest"`, `"react": "latest"`, `"react-dom": "latest"`. This means every `npm install` could pull a different version of Next.js or React. A breaking change in Next.js 15+ could crash the build without warning. This is a deployment time bomb.

### 5. In-Memory State Instead of Persistent Storage (MEDIUM-HIGH)
Share links, saved comparisons, and rate-limiting data all use in-memory `Map` objects. On Vercel (serverless), these reset with every cold start. A user could create a share link that stops working 5 minutes later. The architect brief is stored in `localStorage` — clear the browser and the work is gone.

---

## First 5 Things to Fix (Priority Order)

### Fix 1: Pin Dependencies and Lock Versions
**Effort: 30 minutes | Impact: Prevents deployment failures**

Change `package.json`:
```json
"next": "14.2.x",
"react": "18.3.x",
"react-dom": "18.3.x"
```
Run `npm install` to generate a proper `package-lock.json`. Commit the lock file. This prevents surprise breakages on every deploy.

### Fix 2: Connect the Database
**Effort: 2-4 hours | Impact: Makes the platform functional**

The Prisma schema is already defined with 8 models. Set up a PostgreSQL instance (Supabase, Neon, or Vercel Postgres), run `npx prisma migrate dev`, and replace mock data imports with Prisma queries in the API routes. Start with the LP Registry and Capital Calls — these are the most data-dependent modules.

### Fix 3: Secure the Share/Compare Endpoints
**Effort: 2-3 hours | Impact: Eliminates security vulnerabilities**

1. Move passwords from URL query params to POST request bodies
2. Hash passwords with bcrypt before storing
3. Replace in-memory stores with database tables (or at minimum Redis)
4. Add authentication middleware to `/api/architect/recommend` and `/api/compare/share`
5. Implement proper CSRF tokens

### Fix 4: Add Core Business Logic Tests
**Effort: 4-6 hours | Impact: Prevents financial calculation errors**

Write tests for the 4 critical calculation modules:
- `architect-logic.ts` — Jurisdiction scoring produces correct rankings
- `waterfall-calculator.ts` — Distribution math matches manual calculations
- `lp-compliance.ts` — ERISA/FATCA screening catches known edge cases
- `lp-attribution.ts` — IRR and tax calculations are accurate

Use Vitest (already compatible with Next.js). Even 20-30 tests covering the critical paths would dramatically reduce risk.

### Fix 5: Add Environment Variable Validation
**Effort: 1 hour | Impact: Prevents silent runtime failures**

Create a `src/lib/env.ts` file using Zod to validate all required environment variables at startup:
```typescript
import { z } from 'zod'

export const env = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  AWS_S3_BUCKET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
}).parse(process.env)
```

Import this in your root layout or middleware. If a variable is missing, the app fails fast with a clear error instead of silently breaking at runtime.

---

## Clear Improvement Plan

### Phase 1: Foundation (Week 1-2) — "Make It Real"
| Task | Priority | Effort |
|------|----------|--------|
| Pin all dependency versions | P0 | 30 min |
| Add env validation with Zod | P0 | 1 hour |
| Set up PostgreSQL (Neon/Supabase) | P0 | 2 hours |
| Run Prisma migrations | P0 | 1 hour |
| Replace mock data with DB queries (LP, Capital Calls) | P0 | 4 hours |
| Activate Clerk authentication | P0 | 2 hours |
| Add Vitest + core business logic tests | P0 | 6 hours |

### Phase 2: Security (Week 2-3) — "Make It Safe"
| Task | Priority | Effort |
|------|----------|--------|
| Fix password handling (hash, POST body, not URL) | P1 | 2 hours |
| Add auth middleware to all API routes | P1 | 3 hours |
| Replace in-memory stores with DB/Redis | P1 | 4 hours |
| Add CSRF protection | P1 | 2 hours |
| Implement distributed rate limiting | P1 | 3 hours |
| Add structured logging (replace console.log) | P1 | 2 hours |
| Security audit of PDF generation inputs | P1 | 1 hour |

### Phase 3: Quality (Week 3-4) — "Make It Professional"
| Task | Priority | Effort |
|------|----------|--------|
| Add API route tests | P2 | 4 hours |
| Add component tests (critical flows) | P2 | 6 hours |
| Set up CI/CD pipeline with test gates | P2 | 3 hours |
| Add error monitoring (Sentry or similar) | P2 | 2 hours |
| Implement proper error boundaries in React | P2 | 2 hours |
| Accessibility audit (axe-core) | P2 | 3 hours |
| Performance audit (Lighthouse, bundle analysis) | P2 | 2 hours |

### Phase 4: Growth (Week 5-8) — "Make It Scale"
| Task | Priority | Effort |
|------|----------|--------|
| Build Intelligence module (regulatory radar) | P3 | 2 weeks |
| Add multi-fund support | P3 | 1 week |
| Implement real document storage (S3) | P3 | 4 hours |
| Add ILPA reporting exports | P3 | 1 week |
| Build admin panel for access request management | P3 | 3 days |
| Add email notifications (Resend integration) | P3 | 2 days |
| Implement real-time collaboration features | P3 | 2 weeks |

---

## Technical Stack Summary

| Layer | Technology | Status |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | Active |
| Language | TypeScript 5.7 (strict) | Active |
| Styling | Tailwind CSS + CSS tokens | Active |
| Components | shadcn/ui (customized) | Active |
| Charts | Recharts, d3-sankey, ReactFlow | Active |
| Animation | Framer Motion | Active |
| Auth | Clerk | Stubbed |
| Database | Prisma + PostgreSQL | Schema only |
| Storage | AWS S3 | Configured, not live |
| Email | Resend | Configured, not live |
| Analytics | PostHog | Active |
| Hosting | Vercel (iad1) | Active |
| Testing | Custom script (no framework) | Minimal |

---

## Bottom Line

GNCO has **exceptional product vision and domain knowledge**. The jurisdiction scoring algorithm, compliance screening, and waterfall calculator represent genuine institutional-grade IP. The design system is already at the level expected by family offices and GPs.

The gap is **engineering maturity**: mock data instead of a real database, no authentication in production, security vulnerabilities in sharing features, no tests, and unpinned dependencies. These are all solvable in 4-6 weeks of focused work.

**The single most important thing to do right now**: Connect the database and activate authentication. Everything else — the beautiful UI, the smart algorithms, the compliance logic — is already built and waiting. The platform is 70% complete; the remaining 30% is infrastructure, security, and testing.

Once the foundation is solid, GNCO is positioned to be a category-defining platform in the fund structuring space.
