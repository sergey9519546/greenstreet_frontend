# Greenstreet DSCR Engine — Full Stack Audit & Remediation Plan

> **Audit date:** 2026-06-23
> **Auditor:** Hermes Agent (full-stack-deploy pipeline)
> **Project:** Greenstreet Finance DSCR Engine (`greenstreet_frontend`)
> **Verdict:** 3/18 pipeline components are production-ready. Prototype-grade, not production-grade.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Stage 1: Design & Architecture](#stage-1-design--architecture)
3. [Stage 2: Frontend Build](#stage-2-frontend-build)
4. [Stage 3: Backend Build](#stage-3-backend-build)
5. [Stage 4: Deploy & Monitor](#stage-4-deploy--monitor)
6. [Stage 5: Infrastructure](#stage-5-infrastructure)
7. [What IS Good (Don't Break These)](#what-is-good)
8. [Remediation Priority Matrix](#remediation-priority-matrix)
9. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

The Greenstreet DSCR Engine is a React + Express + Firebase application that helps real estate brokers price DSCR loans, match lenders, and encode 50-state PPP rules. The core loan math engine (`src/engine/`) is well-architected — deterministic, properly typed, clean barrel exports. Everything around it is not production-ready.

### Current State

| Category | Score | Status |
|---|---|---|
| Security | 2/10 | 🔴 API keys exposed, no rate limiting, no input validation |
| Architecture | 3/10 | 🔴 No router, no code splitting, dual rendering |
| Code Quality | 4/10 | 🟠 Duplicate deps, no linting, no strict TS |
| Business Logic | 5/10 | 🟠 Two math engines, legacy routes, compliance risk |
| Infrastructure | 1/10 | 🔴 No tests, no CI/CD, no monitoring, no env separation |
| Full Stack Completeness | 3/10 | 🔴 No auth flow, no DB schema, no security rules |

### What Works

- ✅ `src/engine/` — deterministic loan math, lender matching, state PPP laws, sensitivity analysis
- ✅ `theme.ts` — clean design token system from Webflow reference
- ✅ AI separation — LLM only used for narration, never for numbers

---

## Stage 1: Design & Architecture

### 1.1 ❌ No Component Library

**What exists:** Each page hand-rolls its own buttons, cards, modals, inputs, and layout wrappers using raw Tailwind classes.

**What's needed:**
- Install shadcn/ui (built on Radix UI primitives, Tailwind-compatible)
- Extract reusable components: `Button`, `Card`, `Input`, `Select`, `Modal`, `Badge`, `DataTable`, `Stat`, `StatusIndicator`
- Refactor `ComplianceDashboard.tsx` (1,081 lines) into composable pieces
- Create a `components/ui/` directory with the design system primitives

**Why it matters:**
- Consistency — right now each page has slightly different button styles, spacing, and color usage
- Maintenance — changing a button style means editing 25+ files
- Accessibility — Radix primitives come with ARIA attributes, keyboard navigation, focus management

**Files affected:**
- Every file in `src/pages/` (25+ pages)
- `src/components/ComplianceDashboard.tsx` (1,081 lines → split into 10+ components)
- `src/components/MarketingSite.tsx` — fix `className` → `class` in raw HTML

---

### 1.2 ❌ No API Contract / Schema Validation

**What exists:** `buildEngineInputs()` in `src/engine/inputs.ts` accepts a `DealRequest` interface where all fields are optional except 4. No runtime validation — `Number("banana")` = `NaN` propagates through every calculation.

**What's needed:**
- Install `zod` for runtime schema validation
- Define a `DealRequestSchema` that validates types, ranges, and required fields
- Add validation middleware to all Express routes
- Generate OpenAPI spec from the zod schemas (or vice versa)
- Share schemas between client and server via a `shared/` directory

**Example — what validation should look like:**
```typescript
import { z } from 'zod';

const DealRequestSchema = z.object({
  purchasePrice: z.number().positive().min(50000).max(50000000),
  monthlyRent: z.number().min(0).max(1000000),
  state: z.string().length(2).regex(/^[A-Z]{2}$/),
  ltv: z.number().min(50).max(85).optional(),
  ficoScore: z.number().min(300).max(850).optional(),
  // ... all fields with proper constraints
});
```

**Why it matters:**
- This is a financial application — wrong inputs = wrong loan terms shown to borrowers
- The AGENTS.md documents 12 HOEPA bugs that shipped without verification
- NaN propagation is silent — no error, just wrong numbers

**Files affected:**
- `src/engine/inputs.ts` — add validation before building engine inputs
- `server.ts` — add validation middleware to all `/api/` routes
- New: `src/shared/schemas.ts` — shared zod schemas
- New: `src/shared/types.ts` — shared TypeScript types derived from schemas

---

### 1.3 ⚠️ Styling Systems — Preserve Webflow, Fix Integration

**What exists:**
1. **Webflow CSS + JS** — the marketing page's design system (CDN-loaded, intentional — DO NOT REMOVE)
2. **Tailwind CSS** — used in React portal/tool pages
3. **TypeScript tokens** — `theme.ts` mirrors the Webflow swatches
4. **Inline styles** — `style={{}}` in ErrorBoundary

**The Webflow marketing page is the brand identity.** The Webflow CSS, jQuery, GSAP, Swiper, and the full script stack in `index.html` are the design system and must stay. The marketing page's visual is correct as-is.

**What's actually wrong:**
- `MarketingSite.tsx` uses `className` inside `dangerouslySetInnerHTML` raw HTML — should be `class` (React syntax doesn't apply inside raw HTML strings)
- Tailwind tokens in `theme.ts` are TypeScript constants, invisible to Tailwind — need CSS custom properties
- React portal/tool pages don't match the Webflow design language — they should use the same swatches, typography, and spacing from `theme.ts`
- No bridge between Webflow's CSS variables and Tailwind's theme config

**What's needed:**
- Fix `className` → `class` in the raw HTML string inside `MarketingSite.tsx`
- Convert `theme.ts` tokens to CSS custom properties so Tailwind can use them
- Add `@theme` block in Tailwind config referencing the Webflow CSS variables
- Ensure React pages (portal, tools) visually match the Webflow marketing aesthetic
- Keep all CDN scripts, jQuery, GSAP, Swiper — they power the marketing page correctly

**Files affected:**
- `src/components/MarketingSite.tsx` — fix `className` → `class` in raw HTML
- `src/theme.ts` — convert to CSS custom properties
- `src/index.css` — add `@theme` block with Webflow swatch variables

---

### 1.4 ❌ No Architecture Decision Records

**What exists:** No ADRs, no architectural documentation.

**What's needed:**
- Document key decisions: why Express over Next.js, why Firebase over Supabase, why custom router over React Router
- Create `docs/adr/` directory
- At minimum, document: routing strategy, state management, auth flow, deployment target

---

## Stage 2: Frontend Build

### 2.1 ❌ No Router — Hand-Rolled State Machine

**What exists:** `App.tsx` uses a `switch(view)` with 25+ cases. Navigation is done via `window.history.pushState` + custom `PopStateEvent` dispatch. A global click interceptor on `document` captures all `<a>` clicks.

**Problems:**
- No code splitting — every page loads in one bundle
- `viewToPath()` and `resolveRoute()` are duplicate logic that must stay in sync
- No `<Link>` component — no prefetching, no active state, no accessibility
- No nested routes — can't have `/tools/:toolId` patterns
- No route guards — can't protect `/dscrgo` without auth
- Scroll restoration is manual (`window.scrollTo({ top: 0 })`)
- Legacy routes from old Greenboard compliance platform still in the map

**What's needed:**
- Install React Router v6+ (or TanStack Router for type-safe routing)
- Create a proper route configuration file
- Replace the switch statement with `<Routes>` / `<Route>`
- Add `React.lazy()` for code splitting on every page
- Create `<Link>` components with prefetching
- Add route guards for authenticated pages
- Remove legacy Greenboard routes (`/products/communications-archiving-supervision`, etc.)

**What the route config should look like:**
```tsx
const routes = [
  // "/" is served as static Webflow HTML by the server — no React route needed
  { path: "/dscrgo", element: lazy(() => import("./pages/PortalPage")), guard: true },
  { path: "/dscr-calculator", element: lazy(() => import("./pages/DSCRCalculatorPage")) },
  { path: "/tools/:toolId", element: lazy(() => import("./pages/ToolPage")) },
  // ... etc
];
```

**Files affected:**
- `src/App.tsx` — complete rewrite of routing logic
- `src/router/resolve.ts` — replace with React Router config
- New: `src/router/routes.tsx` — route definitions
- New: `src/router/guards.tsx` — auth guards
- Every page file — wrap with `React.lazy()`

---

### 2.2 ❌ No Code Splitting / Lazy Loading

**What exists:** All 25+ pages imported eagerly in `App.tsx`. The entire app — Monte Carlo engine, tax engine, stress matrix, portfolio analyzer, deal analyzer — downloads on first load.

**What's needed:**
```tsx
// Before (current — loads everything):
import DSCRCalculatorPage from "./pages/DSCRCalculatorPage";
import MonteCarloPage from "./pages/MonteCarloPage";

// After (lazy — loads on demand):
const DSCRCalculatorPage = lazy(() => import("./pages/DSCRCalculatorPage"));
const MonteCarloPage = lazy(() => import("./pages/MonteCarloPage"));
```

**Impact estimate:**
- Current bundle likely 500KB+ gzipped (25 pages + engine + Firebase + Framer Motion)
- With code splitting: initial load ~100KB, each page ~20-50KB on demand
- Core Web Vitals (LCP, FCP) will improve dramatically

**Files affected:**
- `src/App.tsx` — convert all imports to `React.lazy()`
- `src/main.tsx` — add `<Suspense>` fallback
- Every page file — ensure proper default export

---

### 2.3 ⚠️ `dangerouslySetInnerHTML` — Fix `className` Bug, Keep the Pattern

**What exists:** `MarketingSite.tsx` renders the Webflow marketing page via `dangerouslySetInnerHTML`. This is the correct approach — the Webflow HTML is the brand design and should be rendered as-is.

**Actual bug:** The raw HTML string uses `className` (React syntax) instead of `class` (HTML syntax). Inside `dangerouslySetInnerHTML`, React doesn't process the content — it's injected as raw HTML. So `className="page_code_wrap"` renders as a literal attribute `className`, not the CSS class `class`. The Webflow CSS selectors target `.page_code_wrap` (class), so styles don't apply.

**Fix:**
```tsx
// Before (broken — className is React syntax, not HTML)
dangerouslySetInnerHTML={{ __html: `<div className="page_code_wrap">...` }}

// After (correct — class is HTML syntax)
dangerouslySetInnerHTML={{ __html: `<div class="page_code_wrap">...` }}
```
Search the entire raw HTML string for `className` and replace all instances with `class`.

**Do NOT:**
- Remove the `dangerouslySetInnerHTML` pattern — it's the correct way to render the Webflow export
- Remove the Webflow CSS from `index.html` — it's the design system
- Convert the marketing page to React components — the Webflow HTML IS the design

**Files affected:**
- `src/components/MarketingSite.tsx` — fix all `className` → `class` in raw HTML string

---

### 2.4 ⚠️ External CDN Scripts — Add Integrity Hashes, Keep the Stack

**What exists:** `index.html` loads jQuery, GSAP, ScrollTrigger, Observer, Flip, Swiper, and HubSpot from CDNs. These power the Webflow marketing page and must stay.

**Actual issue:** No `integrity` or `crossorigin` attributes on the CDN scripts. If a CDN is compromised, malicious code runs in the browser.

**What's needed:**
- Add `integrity` (SHA-384 hash) and `crossorigin="anonymous"` to every `<script>` and `<link>` tag loading from CDNs
- Update jQuery from 3.5.1 to 3.7.x (security patches)
- Keep GSAP, Swiper, HubSpot — they're part of the Webflow design system
- Keep Framer Motion (`motion` package) — it's for the React portal/tools, separate concern
- The two animation libraries serve different purposes: GSAP for marketing page, Framer Motion for React app

**Example fix:**
```html
<!-- Before -->
<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"></script>

<!-- After -->
<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.7.1.min.js"
  integrity="sha384-..." crossorigin="anonymous"></script>
```

**Do NOT:**
- Remove jQuery — the Webflow scripts depend on it
- Remove GSAP/Swiper — they power the marketing animations
- Move CDN deps to npm — the Webflow scripts expect them as globals

**Files affected:**
- `index.html` — add integrity hashes, update jQuery version

---

### 2.5 ⚠️ Tailwind v4 Not Configured

**What exists:** `@tailwindcss/vite` plugin is installed and `vite.config.ts` includes it. But there's no `tailwind.config.ts` (expected for v4) and no `@theme` block in any CSS file.

**What's needed:**
- Add `@import "tailwindcss"` to `src/index.css`
- Add `@theme` block with custom colors from `theme.ts`:
```css
@import "tailwindcss";

@theme {
  --color-midnight: #003738;
  --color-dark-teal: #004041;
  --color-mint: #e8e9bf;
  --color-pistachio: #eeefd3;
  --color-lemon: #d8d958;
  --color-rainforest: #006565;
  --color-emerald: #4dbd97;
  --color-light-green: #039692;
}
```

**Files affected:**
- `src/index.css` — add Tailwind imports and theme
- `src/theme.ts` — convert to CSS custom properties (or keep as JS that references CSS vars)

---

### 2.6 ❌ `vite` Duplicated in Dependencies

**What exists:**
```json
"dependencies": { "vite": "^6.2.3" },
"devDependencies": { "vite": "^6.2.3" }
```

**Fix:** Remove `vite` from `dependencies`. It should only be in `devDependencies`.

---

### 2.7 ❌ `@anthropic-ai/sdk` in Client Dependencies

**What exists:** The Anthropic SDK is in `dependencies` (bundled to client). It should only be used server-side.

**Fix:** Move to `devDependencies` or `peerDependencies`. The server imports it directly, and Vite's `packages=external` flag in the build script should exclude it from the client bundle — but it shouldn't be in the dependency tree at all for client builds.

---

## Stage 3: Backend Build

### 3.1 ❌ No Authentication on API Endpoints

**What exists:** `firebase.ts` exports auth helpers, `ComplianceDashboard.tsx` uses auth internally. But the Express API endpoints (`/api/dscr/solve`, `/api/narrate`, `/api/dscr/state`, etc.) have **zero authentication**.

**What's needed:**
- Add Firebase Admin SDK to the server
- Create auth middleware that verifies Firebase ID tokens
- Apply to all `/api/` routes (except maybe `/api/health`)
- Add auth context provider to the React app
- Add route guards for authenticated pages

**Server middleware:**
```typescript
import admin from 'firebase-admin';

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/dscr/solve', requireAuth, (req, res) => { ... });
app.post('/api/narrate', requireAuth, async (req, res) => { ... });
```

**Files affected:**
- `server.ts` — add Firebase Admin, auth middleware
- New: `src/contexts/AuthContext.tsx` — React auth provider
- New: `src/lib/api.ts` — API client that attaches auth tokens
- Every page that calls API — use the API client instead of raw `fetch`

---

### 3.2 ❌ No Rate Limiting

**What exists:** No rate limiting on any endpoint. `/api/narrate` calls Anthropic on every request.

**What's needed:**
```typescript
import rateLimit from 'express-rate-limit';

const narrateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { error: 'Too many requests. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/narrate', narrateLimiter, async (req, res) => { ... });
```

**Files affected:**
- `package.json` — add `express-rate-limit`
- `server.ts` — apply rate limiters to all routes

---

### 3.3 ❌ No CORS Configuration

**What exists:** No CORS middleware. If frontend and backend are on different origins, API calls fail silently.

**What's needed:**
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST'],
}));
```

**Files affected:**
- `package.json` — add `cors`
- `server.ts` — add CORS middleware

---

### 3.4 ❌ No Input Validation (Critical for Financial App)

**What exists:** `buildEngineInputs()` accepts any input and applies defaults. `Number("banana")` = `NaN` propagates silently.

**What's needed:**
- `zod` schema validation on every endpoint
- Validate ranges: purchase price $50K-$50M, FICO 300-850, LTV 50-85%, state = 2-letter code
- Return 400 with specific field errors, not 500 with generic "Engine solve failed"
- Log validation failures for monitoring

**Critical validation rules:**
| Field | Type | Range | Default |
|---|---|---|---|
| `purchasePrice` | number | 50,000 — 50,000,000 | required |
| `monthlyRent` | number | 0 — 1,000,000 | required |
| `state` | string | exactly 2 uppercase letters | required |
| `ficoScore` | number | 300 — 850 | 740 |
| `ltv` | number | 50 — 85 | 75 |
| `unitCount` | number | 1 — 4 | 1 |
| `annualTaxes` | number | 0 — 1,000,000 | 1.2% of price |
| `annualInsurance` | number | 0 — 500,000 | 0.5% of price |

**Files affected:**
- New: `src/shared/schemas.ts` — zod schemas
- `server.ts` — add validation middleware
- `src/engine/inputs.ts` — validate before building inputs

---

### 3.5 ❌ No Error Handling Middleware

**What exists:** Each route has its own `try/catch`. Errors return `{ error: message }` with no structure.

**What's needed:**
```typescript
// Global error handler
app.use((err, req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  console.error(`[${requestId}] ${err.message}`, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    requestId,
  });
});
```

**Files affected:**
- `server.ts` — add global error handler

---

### 3.6 ❌ No Firestore Security Rules

**What exists:** Firebase is initialized but no `firestore.rules` file exists.

**What's needed:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Deal history - users can only see their own deals
    match /deals/{dealId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

**Files affected:**
- New: `firestore.rules`
- New: `firebase.json` — Firebase project config
- New: `firestore.indexes.json` — composite indexes

---

### 3.7 ❌ Model Name Hardcoded

**What exists:** `const MODEL = "claude-sonnet-4-6";` in `server.ts`.

**Fix:** Move to environment variable:
```typescript
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
```

---

### 3.8 ❌ No Health Check Endpoint

**What exists:** No `/health` or `/ready` endpoint.

**Fix:**
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: process.env.npm_package_version });
});
```

---

## Stage 4: Deploy & Monitor

### 4.1 ❌ No CI/CD Pipeline

**What's needed:**
- `.github/workflows/ci.yml` — run lint, type check, tests on every PR
- `.github/workflows/deploy.yml` — deploy to staging on merge to main, production on tag
- Or: `vercel.json` if deploying to Vercel (recommended for this stack)

**Minimal CI pipeline:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint        # tsc --noEmit
      - run: npm run test         # vitest (once tests exist)
      - run: npm run build        # vite build
```

**Files affected:**
- New: `.github/workflows/ci.yml`
- New: `.github/workflows/deploy.yml`
- Or: New: `vercel.json`

---

### 4.2 ❌ No Environment Separation

**What's needed:**
- `.env.development` — local dev (Firebase emulator, local Anthropic proxy)
- `.env.staging` — staging Firebase project, staging Anthropic key
- `.env.production` — production Firebase, production Anthropic key
- `firebase.json` with emulator configuration for local dev
- Separate Firebase projects for dev/staging/prod

**Files affected:**
- New: `.env.development`
- New: `.env.staging`
- New: `.env.production`
- New: `firebase.json`
- `server.ts` — read env vars with validation

---

### 4.3 ❌ No Tests (Critical for Financial App)

**What's needed:**

**Unit tests (vitest):**
- `src/engine/engine.test.ts` — DSCR solver with golden values
- `src/engine/lenders.test.ts` — lender matching logic
- `src/engine/statePppLaws.test.ts` — all 50 states PPP rules
- `src/engine/sensitivity.test.ts` — breakeven calculations
- `src/engine/inputs.test.ts` — input validation and defaults
- `src/lib/loanMath.test.ts` — client-side math (must match engine)

**Integration tests:**
- `server.test.ts` — API endpoint tests with supertest
- Auth flow tests — login, logout, token refresh

**E2E tests (Playwright):**
- Calculator flow — enter deal, see results, check numbers
- Portal flow — login, view history, run analysis
- Navigation — all routes render, back/forward works

**Critical test cases:**
1. DSCR = 1.00 exactly (boundary)
2. FICO = 620 (minimum for most lenders)
3. LTV = 80% (boundary for PMI/conventional)
4. HOEPA threshold tests (the 12 bugs from AGENTS.md)
5. NaN input handling (the "banana" test)
6. State PPP for all 50 states

**Files affected:**
- New: `vitest.config.ts`
- New: `src/engine/__tests__/` — 10+ test files
- New: `src/lib/__tests__/loanMath.test.ts`
- New: `tests/api/` — API integration tests
- New: `tests/e2e/` — Playwright tests
- `package.json` — add test scripts

---

### 4.4 ❌ No Monitoring / Observability

**What's needed:**
- **Error tracking:** Sentry (free tier available)
  - Server: `@sentry/node` — catch unhandled errors, track API failures
  - Client: `@sentry/react` — catch React errors, track user sessions
- **Analytics:** PostHog or Plausible (privacy-friendly)
  - Track: calculator usage, lender matches, portal logins
- **Performance:** Core Web Vitals monitoring
  - LCP, INP, CLS tracking via web-vitals library
- **Server logging:** Structured logging with `pino` or `winston`

**Files affected:**
- New: `src/lib/sentry.ts` — Sentry client init
- New: `src/lib/analytics.ts` — analytics client
- `server.ts` — add Sentry middleware, structured logging
- `src/main.tsx` — add Sentry React plugin

---

### 4.5 ❌ No SEO / Meta Tags

**What exists:** Basic `<title>` and `<meta description>` in `index.html`.

**What's needed:**
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD) for financial service
- `robots.txt` and `sitemap.xml`
- Meta tags per page (not just the root)
- Consider SSR or pre-rendering for the marketing page

**Files affected:**
- `index.html` — add OG/Twitter meta tags
- New: `public/robots.txt`
- New: `public/sitemap.xml`
- Each page — add dynamic meta tags via `react-helmet` or similar

---

### 4.6 ❌ No Security Headers

**What's needed:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.prod.website-files.com", "https://d3e54v103j8qbb.cloudfront.net", "https://cdn.jsdelivr.net", "https://static.hsappstatic.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.prod.website-files.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.z.ai", "https://*.firebaseio.com", "https://*.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

**Files affected:**
- `package.json` — add `helmet`
- `server.ts` — add helmet middleware

---

## Stage 5: Infrastructure

### 5.1 ❌ No Graceful Shutdown

**What's needed:**
```typescript
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Greenstreet DSCR Engine → http://0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
```

---

### 5.2 ❌ No Request Logging

**What's needed:**
```typescript
import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));
```

---

### 5.3 ❌ No `.env` Validation at Startup

**What's needed:**
```typescript
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'ANTHROPIC_AUTH_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set. Related features will be disabled.`);
  }
}
```

---

## What IS Good

### ✅ Webflow Marketing Page (Brand Identity)
- The Webflow export in `MarketingSite.tsx` + `index.html` IS the design system
- Webflow CSS, jQuery, GSAP, Swiper, HubSpot — all serve the marketing page correctly
- `theme.ts` faithfully mirrors the Webflow swatches (midnight, pistachio, lemon, rainforest)
- The dual-render approach (static marketing HTML at `/`, React app for tools) is architecturally sound
- Preserve this entirely — the work is making the React pages match it, not replacing it

### ✅ Engine Architecture (`src/engine/`)
- Deterministic math — no LLM in the calculation path
- Clean barrel exports via `src/engine/index.ts`
- Comprehensive types in `src/engine/types.ts`
- 20+ engine modules covering: solver, lenders, state PPP, sensitivity, tax, stress, Monte Carlo, portfolio, STR underwriting, returns, refi tracking

### ✅ Design Tokens (`theme.ts`)
- Well-structured color system from Webflow reference
- Typography scale defined
- Back-compat aliases for migration

### ✅ AI Separation
- LLM only used for `/api/narrate` — generates human-readable explanations
- All numbers computed deterministically
- Narration prompt explicitly says "Do NOT generate new numbers"

---

## Remediation Priority Matrix

### 🔴 P0 — Security (Do This Week)

| # | Issue | Effort | Impact |
|---|---|---|---|
| 1 | Add auth middleware to all API endpoints | 2 hours | Prevents API abuse and credit drain |
| 2 | Add rate limiting to `/api/narrate` | 30 min | Prevents Anthropic credit exhaustion |
| 3 | Add input validation (zod) to all endpoints | 4 hours | Prevents NaN propagation and wrong numbers |
| 4 | Add CORS configuration | 30 min | Prevents cross-origin abuse |
| 5 | Add `integrity` to CDN scripts | 30 min | Prevents CDN compromise XSS |

### 🟠 P1 — Architecture (Do This Month)

**From `cc-skill-security-review`:**

| # | Issue | Effort | Impact |
|---|---|---|---|
| 26 | Add CSRF tokens on all state-changing operations | 2 hours | Prevents cross-site request forgery |
| 27 | Switch auth token storage from localStorage to httpOnly cookies | 2 hours | Prevents token theft via XSS |
| 28 | Run `npm audit` and fix known CVEs | 30 min | Closes known dependency vulnerabilities |
| 29 | Verify `package-lock.json` is committed and use `npm ci` in CI | 15 min | Reproducible builds |

**From `api-designer`:**

| # | Issue | Effort | Impact |
|---|---|---|---|
| 30 | Adopt RFC 7807 Problem Details for all error responses | 2 hours | Standard error format, machine-readable |
| 31 | Generate OpenAPI 3.1 spec from zod schemas | 4 hours | API documentation, client generation, contract testing |
| 32 | Add API versioning (`/api/v1/`) with deprecation policy | 1 hour | Future-proof API evolution |

**From `core-web-vitals`:**

| # | Issue | Effort | Impact |
|---|---|---|---|
| 33 | Add `fetchpriority="high"` to LCP image/element | 30 min | Faster LCP |
| 34 | Set `font-display: swap` on all web fonts | 30 min | Prevents text invisible during font load (FOIT) |
| 35 | Add width/height or aspect-ratio to all images | 1 hour | Prevents CLS from image loading |
| 36 | Add Speculation Rules API for prerendering likely navigations | 30 min | Near-instant LCP on navigation |
| 37 | Install `web-vitals` library for field CWV measurement | 30 min | Real-user LCP/INP/CLS tracking |
| 38 | Memoize expensive React components to reduce INP | 2 hours | Better interaction responsiveness |
| 39 | Break long tasks with `scheduler.yield()` | 2 hours | Prevents main thread blocking |

**From `frontend-design`:**

| # | Issue | Effort | Impact |
|---|---|---|---|
| 40 | Fix `className` → `class` bug in MarketingSite raw HTML | 30 min | Webflow CSS actually applies to marketing page |
| 41 | React portal/tool pages should match Webflow design language | 2 days | Visual consistency between marketing and app |
| 42 | Error and empty states not designed | 4 hours | Professional polish, better UX |

| # | Issue | Effort | Impact |
|---|---|---|---|
| 6 | Replace hand-rolled router with React Router | 1 day | Code splitting, proper navigation, SEO |
| 7 | Add `React.lazy()` to all pages | 2 hours | 70%+ reduction in initial bundle size |
| 8 | Fix `className` → `class` in MarketingSite raw HTML | 30 min | Webflow CSS actually applies |
| 9 | Configure Tailwind v4 with Webflow swatch variables | 2 hours | Consistent styling, design token integration |
| 10 | Create component library (shadcn/ui) for React pages | 1-2 days | Consistency, accessibility, maintenance |

### 🟡 P2 — Quality (Do This Quarter)

| # | Issue | Effort | Impact |
|---|---|---|---|
| 11 | Add unit tests for engine (vitest) | 2-3 days | Prevents compliance regressions |
| 12 | Add API integration tests | 1 day | Prevents API breakage |
| 13 | Add E2E tests (Playwright) | 2 days | Prevents user-facing bugs |
| 14 | Set up CI/CD pipeline | 4 hours | Automated quality gates |
| 15 | Add environment separation | 2 hours | Safe dev/staging/prod isolation |

### 🟢 P3 — Polish (Ongoing)

| # | Issue | Effort | Impact |
|---|---|---|---|
| 16 | Add Sentry error tracking | 2 hours | Visibility into production errors |
| 17 | Add analytics (PostHog) | 2 hours | User behavior insights |
| 18 | Add SEO meta tags + sitemap | 2 hours | Search engine visibility |
| 19 | Add security headers (helmet) | 30 min | Defense in depth |
| 20 | Add structured logging (pino) | 2 hours | Debuggability |
| 21 | Remove legacy Greenboard routes | 1 hour | Cleaner codebase |
| 22 | Convert theme.ts to CSS custom properties | 1 hour | Tailwind integration |
| 23 | Add Firestore security rules | 2 hours | Data protection |

---

## Implementation Checklist

### Phase 1: Security Hardening (Week 1)
- [ ] Install `firebase-admin` and create auth middleware
- [ ] Install `express-rate-limit` and apply to all routes
- [ ] Install `zod` and create request schemas
- [ ] Install `cors` and configure allowed origins
- [ ] Add `integrity` attributes to all CDN scripts
- [ ] Install `helmet` and configure CSP
- [ ] Add `/health` endpoint

### Phase 2: Architecture Fix (Week 2-3)
- [ ] Install `react-router-dom` v6
- [ ] Create route configuration file
- [ ] Replace switch statement with `<Routes>`
- [ ] Convert all page imports to `React.lazy()`
- [ ] Add `<Suspense>` with loading fallback
- [ ] Add auth route guard for `/dscrgo`
- [ ] Configure Tailwind v4 with `@theme` block
- [ ] Fix `vite` duplicate in package.json

### Phase 3: Component Library (Week 3-4)
- [ ] Install shadcn/ui
- [ ] Extract: Button, Card, Input, Select, Modal, Badge
- [ ] Refactor ComplianceDashboard into composable pieces
- [ ] Fix `className` → `class` in MarketingSite raw HTML
- [ ] Ensure React portal/tool pages match Webflow design language

### Phase 4: Testing (Week 4-5)
- [ ] Install vitest + @testing-library/react
- [ ] Write engine unit tests (golden values)
- [ ] Write API integration tests (supertest)
- [ ] Install Playwright for E2E
- [ ] Write calculator flow E2E test
- [ ] Write portal flow E2E test

### Phase 5: Infrastructure (Week 5-6)
- [ ] Create GitHub Actions CI pipeline
- [ ] Create deployment workflow
- [ ] Set up environment separation (.env files)
- [ ] Add Sentry error tracking
- [ ] Add structured logging (pino)
- [ ] Add graceful shutdown
- [ ] Create Firestore security rules
- [ ] Add SEO meta tags + sitemap
- [ ] Add analytics (PostHog)

---

## File Inventory

### Files That Need Major Changes
| File | Lines | Issue |
|---|---|---|
| `src/App.tsx` | 262 | Complete router rewrite, lazy loading |
| `src/components/ComplianceDashboard.tsx` | 1,081 | Split into 10+ components |
| `src/components/MarketingSite.tsx` | 1,098 | Fix `className` → `class` in raw HTML |
| `server.ts` | 218 | Add auth, validation, CORS, rate limiting, error handling |
| `index.html` | 173 | Add integrity hashes to CDN scripts, update jQuery, add meta tags |
| `package.json` | 39 | Fix duplicates, add missing deps |

### Files That Need Minor Changes
| File | Change |
|---|---|
| `src/firebase.ts` | Add Firestore rules export |
| `src/engine/inputs.ts` | Add zod validation |
| `src/theme.ts` | Convert to CSS custom properties |
| `src/index.css` | Add Tailwind v4 config with Webflow swatch variables |
| `vite.config.ts` | Add build optimization |

### Files That Need to Be Created
| File | Purpose |
|---|---|
| `src/shared/schemas.ts` | Zod request/response schemas |
| `src/contexts/AuthContext.tsx` | React auth provider |
| `src/lib/api.ts` | API client with auth token |
| `src/lib/sentry.ts` | Sentry client init |
| `src/router/routes.tsx` | React Router config |
| `src/router/guards.tsx` | Auth route guards |
| `src/components/ui/` | shadcn/ui components |
| `firestore.rules` | Firestore security rules |
| `firebase.json` | Firebase project config |
| `.github/workflows/ci.yml` | CI pipeline |
| `.github/workflows/deploy.yml` | Deploy pipeline |
| `vitest.config.ts` | Test configuration |
| `tests/` | Test directory |
| `public/robots.txt` | SEO |
| `public/sitemap.xml` | SEO |

---

*Generated by Hermes Agent — full-stack-deploy pipeline audit*

---

## Appendix: Skill-Derived Code Patterns

> These patterns come from loading the chained skills in the `full-stack-deploy` pipeline:
> `cc-skill-security-review`, `api-designer`, `core-web-vitals`, `frontend-design`.

### A. RFC 7807 Error Responses (from `api-designer`)

All error responses should follow RFC 7807 Problem Details:
```json
{
  "type": "https://greenstreet.finance/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The 'purchasePrice' field must be a positive number.",
  "instance": "/api/dscr/solve/req-abc123",
  "errors": [
    { "field": "purchasePrice", "message": "Must be a positive number, got NaN." }
  ]
}
```
Always use `Content-Type: application/problem+json` for error responses.
`type` must be a stable, documented URI. `detail` must be human-readable and actionable.
Extend with `errors[]` for field-level validation failures.

### B. CSRF Protection (from `cc-skill-security-review`)

```typescript
import { csrf } from './lib/csrf';

app.post('/api/dscr/solve', requireAuth, (req, res) => {
  const token = req.headers.get('X-CSRF-Token');
  if (!csrf.verify(token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  // ... process
});
```

### C. httpOnly Cookie Auth (from `cc-skill-security-review`)

```typescript
// ❌ WRONG: localStorage (vulnerable to XSS)
localStorage.setItem('token', idToken);

// ✅ CORRECT: httpOnly cookies
res.setHeader('Set-Cookie',
  `session=${idToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`);
```

### D. LCP Preload + Speculation Rules (from `core-web-vitals`)

```html
<!-- In index.html <head> -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Speculation Rules for instant navigation -->
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```

### E. INP with scheduler.yield() (from `core-web-vitals`)

```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setLoading(true);  // Immediate visual feedback

  // Yield so browser can paint the loading state before we block
  if ('scheduler' in window && 'yield' in scheduler) {
    await scheduler.yield();
  }

  const result = await fetch('/api/v1/dscr/solve', { ... });
  setResult(await result.json());
  setLoading(false);
}
```

### F. CLS Prevention (from `core-web-vitals`)

```html
<!-- All images must have dimensions -->
<img src="/hero.jpg" alt="Hero" width="800" height="600">
```

**Note:** The Webflow font loading in `index.html` (Google Fonts `<link>` tags) should stay as-is.
If CLS from font loading is observed, add `font-display: swap` to the Google Fonts URL parameter:
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### G. OpenAPI 3.1 Spec Starter (from `api-designer`)

```yaml
openapi: "3.1.0"
info:
  title: Greenstreet DSCR Engine API
  version: "1.0.0"
  description: Deterministic DSCR loan pricing engine for non-QM brokers
paths:
  /api/v1/dscr/solve:
    post:
      summary: Solve a DSCR deal
      operationId: solveDSCR
      tags: [DSCR]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/DealRequest"
      responses:
        "200":
          description: Deal solved successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DealResult"
        "400": { $ref: "#/components/responses/BadRequest" }
        "401": { $ref: "#/components/responses/Unauthorized" }
        "429": { $ref: "#/components/responses/TooManyRequests" }
  /api/v1/dscr/sensitivity:
    post:
      summary: Compute breakeven sensitivity analysis
      operationId: computeSensitivity
      tags: [DSCR]
      security:
        - BearerAuth: []
      responses:
        "200":
          description: Sensitivity analysis complete
        "400": { $ref: "#/components/responses/BadRequest" }
  /api/v1/narrate:
    post:
      summary: Generate plain-English narration of deal results
      operationId: narrateDeal
      tags: [AI]
      security:
        - BearerAuth: []
      responses:
        "200":
          description: Narration generated
        "429": { $ref: "#/components/responses/TooManyRequests" }
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    DealRequest:
      type: object
      required: [purchasePrice, monthlyRent, state]
      properties:
        purchasePrice: { type: number, minimum: 50000, maximum: 50000000 }
        monthlyRent: { type: number, minimum: 0 }
        state: { type: string, pattern: "^[A-Z]{2}$" }
        ficoScore: { type: number, minimum: 300, maximum: 850, default: 740 }
        ltv: { type: number, minimum: 50, maximum: 85, default: 75 }
    Problem:
      type: object
      required: [type, title, status]
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
        instance: { type: string, format: uri }
        errors:
          type: array
          items:
            type: object
            properties:
              field: { type: string }
              message: { type: string }
  responses:
    BadRequest:
      description: Invalid request parameters
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    Unauthorized:
      description: Missing or invalid authentication
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    TooManyRequests:
      description: Rate limit exceeded
      headers:
        Retry-After: { schema: { type: integer } }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
```

### H. Pre-Deployment Security Checklist (from `cc-skill-security-review`)

- [ ] No hardcoded secrets, all in env vars
- [ ] All user inputs validated with zod schemas
- [ ] CSRF tokens on state-changing operations
- [ ] Tokens stored in httpOnly cookies (not localStorage)
- [ ] Rate limiting on all API endpoints
- [ ] Stricter limits on expensive operations (/api/narrate)
- [ ] Security headers configured (CSP, X-Frame-Options, HSTS)
- [ ] Error messages generic for users, detailed only in server logs
- [ ] No stack traces exposed to users
- [ ] Dependencies up to date, `npm audit` clean
- [ ] Lock files committed, `npm ci` used in CI
- [ ] CORS properly configured with explicit allowed origins
- [ ] HTTPS enforced in production
- [ ] Firebase Auth tokens verified on every API request
- [ ] Firestore security rules deployed and tested
