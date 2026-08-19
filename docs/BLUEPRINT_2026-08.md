# Greenstreet Finance — Implementation-Grade Blueprint

**Date:** 2026-08-16 · **Method:** repository reconstruction (code, history, worktrees, plans, audits), then externally grounded research, then gap analysis, target architecture, validation framework, risk register, execution plan, and an adversarial review of the result.
**Companion docs:** `docs/audit-2026-08-08/ULTIMATE_AUDIT.md` (165 findings), `docs/PLAN_product_upgrade_2026-08.md`, `docs/PLAN_defect_remediation_2026-08.md`, `docs/DEPLOYMENT_GUIDE.md`, `docs/DESIGN_SOURCE_OF_TRUTH.md`.

---

## 0. Verdict

Greenstreet is a **DSCR loan analysis and lead-generation product with a genuinely differentiated calculation core** — 60+ pure, tested engine modules, 29,533 ZIPs of attributed market seed data, a 50-state prepayment/legal matrix, provenance-tagged lender intel, and a 33-post educational corpus — wrapped in a marketing SPA that **as of this week is a functioning, test-pinned lead funnel** (that was not true on 2026-08-08).

The strongest defensible end state is **not** "licensed direct lender" (the site is not licensed; the footer says so; the fabricated lender facade is FTC-exposed and self-contradicting). It is **the reference DSCR decision tool** — the site investors, brokers, and AI assistants consult to model a deal before any lender conversation. Five properties define that end state:

1. **Crawlable and citable** — every one of the 73 routes serves real HTML to crawlers that don't run JavaScript (GPTBot, ClaudeBot, PerplexityBot all invited by `robots.txt`).
2. **Every number honest and sourced** — provenance carried to the UI, never discarded.
3. **Every tool trustworthy** — validation, fail-closed guards, reliability holds re-attached, and no fabricated "done".
4. **Every claim defensible** — truthful posture sitewide, or the facade removed.
5. **A real feedback loop** — cookieless analytics and delivered, owned leads, so the product learns from reality instead of its own documents.

The single biggest risk is unchanged from the 08-08 audit: **the business keeps manufacturing the evidence of things instead of the things, and the memory/knowledge systems read that back as fact.** This blueprint's execution plan therefore ends every task with a *falsifiable acceptance test*, not a document.

---

## 1. Project Reconstruction

### 1.1 What it is

A Vite 6 + React 19 SPA (TypeScript strict, Tailwind 4, Motion) with an Express/Firebase API, dual-deployed to Firebase Functions + Vercel. The public origin is `https://www.greenstreet.finance`. It targets rental-property investors and mortgage brokers researching DSCR (debt-service coverage ratio) financing. Product surface: 1 marketing homepage, ~19 tool/calculator pages, ~12 marketing pages, 33 blog posts = **73 sitemap URLs**.

### 1.2 Architecture

**Layers (bottom-up):**

| Layer | Location | Role |
|---|---|---|
| Engine | `src/engine/*.ts` (~60 modules) | Pure, deterministic calculation: DSCR solve, PITIA, amortization (incl. 40Y/IO recast), qualification, tax (IRC), ARM reset, commercial, construction bridge, covenant checks, FIRPTA, FnM/FnF loan limits, insurance estimates, IRR waterfall, lender matching, leverage checks, loan optimizer, loss framing, Monte Carlo (rate paths), portfolio, LLPA pricing, program fit, reassessment, refi evaluate/proceeds/tracker, rent integrity, reserves, returns, second lien, sensitivity, stress matrix, STR underwriting, TCO/true-cost, v11 runner, golden values, fail-closed input guards |
| ~~Brain (disconnected)~~ | ~~`src/engine/brain/*`~~ **DELETED 2026-08-18** | Retired, not wired: `DecisionSupportPage` already implements the full surface (gate verdict, solved-rate, dated matrix, provenance); the brain added a second DSCR formula, a hardcoded fabricated rate (6.875% base), approval verdicts, and an 11k-line personal research index in the client |
| Data | `public/data/zip/NNN.json` (29,166 ZIPs shipped, sharded), `src/data/dscrPrograms.ts`, `src/data/usMapPaths.ts` | ZIP market seeds (ZORI 2026-05, realtor.com 2026-05, Treasury FIO 2022 insurance — **NATIONAL series, 24,965 ZIPs**), source-level state (96.9%), FEMA NFIP flood, HUD SAFMR, program metadata, US map |
| Lib/services | `src/lib/{dealState,zipFundamentals,analytics}.ts`, `src/services/firebaseAdmin.ts`, `src/integrations/supabase.ts`, `src/engineService.ts`, `src/engineWorker.ts` | Deal state (URL query params + localStorage), ZIP lookups, Plausible (env-gated), Firestore admin, Supabase live-deal feed, worker-pool solve |
| Server | `src/serverApp.ts` + `src/routes/*` + `src/middleware/*` | Express: `/health`, `/api/dscr/{solve,sensitivity}`, `/api/leads`, `/api/sdr`, `/api/narrate` |
| UI | `src/pages/*` (lazy route modules), `src/components/*`, `src/design/*` (`dc.tsx`, `theme.ts`, `navModel.ts`), `src/marketing/*` | Tool pages, design system, marketing homepage |
| SEO | `src/seo/routeMetadata.ts`, `src/router/resolve.ts`, `src/site/seo.ts`, `scripts/generate-sitemap.ts` | Route registry → metadata/JSON-LD/sitemap single source |
| Deploy | `firebase.json`, `vercel.json`, `.github/workflows/{ci,verify}.yml`, `api/index.js` | Dual host; CI (tsc, 1506 tests, contract checks, build, Vercel-entry guard) |

### 1.3 Data / control flows

**Lead funnel (end-to-end, verified fixed):** tool page or homepage hero → `QualifyModal` (13-field schema, honeypot, `submissionId` UUID) → `POST /api/leads` → Zod `.strict()` validation → idempotent `leads/{submissionId}` create (server stamps timestamps) → `leadDelivery/{submissionId}` records `not_configured` or webhook status → 202. Test-pinned in `QualifyModal.test.tsx`; delivery contract in `scripts/check-delivery-contract.mjs` (CI-invoked).

**Engine pipeline:** page form → `engineService.runSolveDSCR` (worker pool) → pure engine → verdict + recommendation bands → verdict subtree announced via `aria-live`. Fail-closed guards in `src/engine/inputs.ts` (`isFiniteNonNegative`, `MAX_PURCHASE_PRICE`, `MODEL_AUTO_DECISION_FLOOR`, `MIN_MODELED_RATE_PCT`, `validate()`).

**ZIP seeding:** tool page → `zipFundamentals` fetches `public/data/zip/NNN.json` shard (median 1.1 KB) → editable seed fields labelled with source + date (Zillow ZORI / realtor.com / Treasury FIO). Never asserted as fact (r = 0.539 vs HUD SAFMR documented).

**SEO/metadata:** `resolve.ts` RouteKey union → `routeMetadata.ts` (73 entries, JSON-LD: WebSite, CollectionPage, BreadcrumbList `Home › Tools › Tool`) → `applyRouteMetadata` swaps tags + schema on route change → `scripts/generate-sitemap.ts` regenerates `public/sitemap.xml` (73 URLs).

**Analytics:** Plausible, injected at runtime only when `VITE_PLAUSIBLE_DOMAIN` set; build sanitizer strips GTM/GA/Vector/CookieYes from `index.html`.

### 1.4 User workflows

- **Investor:** search/ads → tool page (default state prefilled from URL) → ZIP seed → verdict → qualify modal → lead.
- **Broker:** `/brokers` → InvestGO demo → broker intake (NMLS, licenses) → ComplianceDashboard (`/investgo`, auth-gated).
- **Content reader:** blog post → related tool → qualify.
- **AI searcher (GPT/Claude/Perplexity):** crawler fetches route → **today receives the identical empty SPA shell for all 73 URLs** (the #1 SEO defect).

### 1.5 Current state (verified this week)

- `tsc --noEmit` clean; **103 test files / 1506 tests green**; `npm run build` succeeds; CI workflows exist at repo root (fixed since audit #14).
- Wave 2 a11y shipped (committed `b219d6a`): slider accessible names, QualifyModal contrast, StressMatrix keyboard, label contrast, `aria-live` verdict subtrees, `Cache-Control` on `/assets/*`.
- SEO slice shipped (uncommitted): `/tools` hub, Products CTAs → anchors, BreadcrumbList, sitemap.
- Drawer dialog + TaxEngine fieldsets shipped (uncommitted, tested).
- `api/index.js` tracked (audit #6 fixed); lead 400 bug fixed (audit #1); SDR auth closed (audit #8's abuse vector); 17a-4 pill removed (audit #7).

---

## 2. Evidence Map

Consequential claims → repository evidence:

| Claim | Evidence |
|---|---|
| Engine is pure + tested | `src/engine/*.test.ts` (60+ modules), `golden.test.ts`, `failClosed.test.ts`, `v11Runner.test.ts` |
| Fail-closed input guards live | `src/engine/inputs.ts` → `validate()`, `MODEL_AUTO_DECISION_FLOOR`, `MIN_MODELED_RATE_PCT` (added after stale P0 branch) |
| Lead funnel fixed + pinned | `src/components/QualifyModal.test.tsx` (URL `/api/leads`, `submissionId`), `src/routes/leads.ts` (`.strict()` schema, honeypot, idempotent create) |
| Delivery truthful + env-gated | `README.md` Security section; `.env.example` LEAD_DELIVERY_*; `src/routes/leads.ts` `createLeadDeliveryRecorder` |
| Brain subsystem disconnected | `grep -rln "DSCRBrainEngine|AegisAdvisor|CertaintyGovernor" src/{pages,components,routes,lib}` → **0 matches** |
| Provenance discarded at UI | `src/engine/lenders.ts` (per-point `.provenance`, `UNVERIFIED` … "do not present as fact"); `src/pages/LenderIntelPage.tsx` → grep confidence/sourceType/asOfDate/provenance → **0 matches** |
| Fabricated content currently not rendering | `grep -c "trust-" index.html` → 0; `src/marketing/REMOVED_MARKETING_CONTENT.md` (81 logo imgs retained in `home-markup.html`, portal host `#marketing-root` does not exist) |
| "In-house lender" claims still live | `src/marketing/home-markup.html` ("underwritten and funded in-house"); `src/pages/BrokersPage.tsx:471` ("Direct · in-house underwriting"); truthful footer at `src/design/SiteShell.tsx:434` |
| SPA shell for all routes | `src/server.ts` `appType:"spa"`; `vercel.json` rewrite `/(.*)` → `/index.html`; 73 `<loc>` in `public/sitemap.xml` |
| ZIP data real + attributed | `src/lib/zipFundamentals.ts` header + `scripts/generate-zip-shards.py` (29,166 ZIPs ship, source+date per field, r=0.539 caveat, state/insurance coverage repaired 2026-08-16) |
| BreadcrumbList + tools hub (new) | `src/seo/routeMetadata.ts` `breadcrumbFor()`; `src/pages/ToolsPage.tsx`; `src/router/resolve.ts` `tools` view |
| Owner standing constraint (fabricated content stays) | `docs/PLAN_product_upgrade_2026-08.md` "Standing constraint"; `docs/REMOVED_MARKETING_CONTENT.md` "Owner decision 2026-08-15" |
| 50-item backlog ledger honesty | `docs/dscr_loan_office/05_MASTER_IMPROVEMENTS_AND_EXPANSIONS.md` (Implemented/Partial/Planned statuses, delivery boundaries) |

---

## 3. Current-State Audit

Classification of major systems:

| System | Class | Notes |
|---|---|---|
| DSCR engine + 60 modules | **Complete** | Golden values, fail-closed, NaN regressions |
| ZIP market data | **Complete** (repaired 2026-08-16) | Sharded, attributed, lazy. Regenerated shards now ship the full public-domain field set: state 96.9% (was 29.3%, joined from realtor.com zip_name), insurance 24,965 ZIPs (was 1,452 CA/FL-only — the FIO NATIONAL series was left on the table), + FEMA NFIP flood claims, HUD SAFMR cross-check, active listings. See `scripts/generate-zip-shards.py` |
| Lead intake + delivery | **Complete** | Idempotent, strict, env-gated webhook; still no configured destination |
| SEO metadata/sitemap/JSON-LD | **Complete** | 73 routes, BreadcrumbList; `lastmod`/legal inversion pending |
| a11y (Wave 2 group A) | **Complete** | Committed `b219d6a` |
| a11y (drawer, fieldsets) | **Complete** | Uncommitted, tested |
| Router + tools hub + products anchors | **Complete** | Uncommitted, tested |
| CI / contract checks | **Complete** | `ci.yml`, `verify.yml`, delivery/home/project-brain contracts |
| Firestore rules | **Partially complete** | Rules well-written; **deploy path unverified** (audit #15) |
| AI crawler / prerender | **Missing** | 73 URLs → one empty shell |
| Lender provenance → UI | **Incorrectly implemented** | Data carries it; UI drops it |
| Brain (AEGIS/CQR/knowledge/research) | **Disconnected** | Fully built + tested, zero callers |
| Loan optimizer API | **Disconnected (held)** | `/api/dscr/optimize` → `TOOL_RELIABILITY_HOLD` 503 (correct fail-closed) |
| `warmAllRoutes` prefetch | **Deliberate** | Load-bearing for chunk-recovery self-heal (`chunkRecovery.test.ts`) |
| Fabricated marketing content | **Obsolete-but-preserved** | Owner instruction; not rendering; must stay non-rendering |
| "In-house lender" copy | **Incorrect** | Contradicts the truthful footer; live risk |
| Research corpus index | **Obsolete paths** | `MASTER_RESEARCH_INDEX.json` absolute Windows paths, normalized in `researchRetriever.ts`; corpus stranded in orphaned worktrees per audit §0 |
| sdr_outreach pipeline | **Partial** | Queue exists; dispatch orchestration (Instantly/n8n) is a comment |
| App Check | **Missing** | Anonymous auth, no App Check (audit #15) |
| Git history hygiene | **Obsolete** | ~3.1 GB of loan-level blobs in pack (audit #11) |

---

## 4. Gap Analysis

| Gap | Current | Strongest achievable | Evidence |
|---|---|---|---|
| AI-crawler visibility | Empty SPA shell per route | Static, content-rich HTML per route (prerender) | research §5.1; `vercel.json` rewrite |
| Trust | Footer admits no lender; page copy claims in-house funding | Truthful posture sitewide | `SiteShell.tsx:434` vs `home-markup.html` |
| Provenance | Dropped at the UI | Rendered on LenderIntel + decision pages | `lenders.ts` vs `LenderIntelPage.tsx` |
| Brain value | 0 callers | Decision-support differentiation or explicit retirement | grep evidence |
| Lead ops | Funnel works, no owner | Events measured, leads delivered, funnel drop-off visible | `analytics.ts`, `leads.ts` |
| Media assets | 4.6 MB og:image, no hero poster, no srcset | <150 KB AVIF/WebP, poster frame, srcset | `index.html` og:image; `public/img/generated/hero.png` |
| Money math | IEEE-754 doubles | `decimal.js` with golden regressions | ledger item 38 |
| Market freshness | Static 2026-05 ZIP + static lender sheets | Dated, provenance-stamped refresh pipeline | `zipFundamentals.ts`, `lenders.ts` |
| Firestore controls | Rules written, deploy unverified | Rules deployed + verified, App Check | `firestore.rules`, audit #15 |

---

## 5. Research Synthesis

Every direction below originates from a concrete repo question.

### 5.1 AI crawlers do not render JavaScript — prerendering is the fix (repo question: audit #12, "client-only SPA")

Multiple independent 2025–2026 studies (SearchViu, Lantern, Passionfruit, capconvert, Wolfstone) measured the same result: **GPTBot, ClaudeBot, and PerplexityBot do not execute JavaScript**; they consume the raw HTML a server returns. Googlebot renders; the AI crawlers mostly don't. For this repo, that means Bing-feeding ChatGPT, Claude, and Perplexity all see the identical empty shell for all 73 URLs — including the 33-post blog corpus the content strategy rests on. The fixes, in order of value: (a) **build-time prerender** (static HTML per route — what Prerender.io and the SSG ecosystem do, done here at build time so it costs nothing at runtime); (b) keep JSON-LD (BreadcrumbList already shipped); (c) `llms.txt` is optional — Google's 2026 AI-optimization guidance states it has no ranking or AI-visibility effect, so it is a cheap navigation nicety, not a strategy.

### 5.2 The DSCR market thesis is real and competitive (repo question: is this a viable product?)

2026 sources (The Mortgage Office, Ridge Street Capital, Sistar, HomeAbroad, AHLEND) converge: DSCR rates run ~6.5–8% (low-to-mid 6s for strong files), ~0.5–1.5% over conventional, benchmarked to the 2-year Treasury, with secondary-market demand making DSCR a **permanent non-QM fixture**, not a trend. The site's core value — rent-coverage modeling, PITIA, state rules, ZIP-level seeds — is exactly what this audience needs before talking to a lender. But "DSCR calculator" is a commodity query with 20+ competitors; the defensible niches are **state-specific tool pages** ("DSCR calculator Florida/Texas/California" with real state law) and **being the page AI assistants cite** (prerender + provenance + clean data).

### 5.3 FTC fake-reviews exposure is live and escalating (repo question: audit #3, fabricated logos/testimonials)

16 CFR Part 465 (final rule, effective **Oct 21 2024**) prohibits fake consumer reviews/testimonials "by someone who does not exist"; it authorizes civil penalties up to **$53,088 per violation**, the FTC issued warning letters to 10 companies in **Dec 2025**, and 2026 enforcement is ramping (Sitejabber action Nov 2024; first penalty-track actions through 2026). Named testimonials ("Maya Reynolds, Principal Broker, Nexus Financial") and client logos (Vanguard, Sequoia) are squarely in scope. **Mitigation status — LOCK SHIPPED 2026-08-18:** the content renders **zero** on the public site and now cannot regress — `npm run test:ftc` (in ci.yml + verify.yml) scans every shipped HTML file (shell + all 73 prerendered twins) for 81 banned fabricated strings and fails the build on any hit; the build-time sanitizer applies the same replacements to index.html (fixing two live shell/twin leaks: the `⎋` announcement and the footer "The DSCR engine. Deterministic…" claim). The owner's standing instruction (keep the assets in the repo) is respected — they never render. A real, FTC-compliant testimonial pipeline still replaces the fiction over time (§7.5, P3-17).

### 5.4 The engine's underwriting math matches industry practice (repo question: are Track 1/2 haircuts defensible?)

Industry sources (Lendmire, Easy Street, Private Money, Kiavi, OfferMarket, AHLEND) confirm the standard methodology: **DSCR = eligible rent ÷ PITIA**, with rent haircuts of 15–30% (vacancy 5–10% + management 3–5%, or a flat haircut), and STR income haircut ~20%. The repo's Track 1 (GROSS/PITIA) and Track 2 (NET = 85% of gross, the documented 15% expense haircut) sit inside the industry band; the STR underwriting module's projection haircuts are consistent. **Conclusion:** the engine's methodology is defensible; what needs validation is lender-specific rate/term data freshness (§5.2), not the math shape.

---

## 6. Target Architecture

The end state optimizes the whole system, not files.

### 6.1 Rendering (the biggest architectural change)

- **Build-time prerender of all 73 routes.** A `scripts/prerender.ts` step in `npm run build`, after `vite build`:
  - Marketing/blog/legal routes: render to static HTML (they're already static content).
  - Tool routes: render with **default deal state** (engines run in Node at build; the verdict/analysis text is inline in the HTML) and hydrate client-side. URL-persistence (`dealState`) continues to drive the interactive experience.
  - Emit `dist/<route>/index.html` + `dist/404.html`; `vercel.json`/`firebase.json` rewrites already serve the SPA fallback — static files win first.
- **Constraint:** prerender must never break the "route modules are lazy chunks" design — prerendering renders modules, it doesn't bundle them differently.
- **Gate:** `prerenderContent.test.ts` asserts, for the 10 highest-value routes (home, tools, dscr-calculator, deal-analyzer, state-laws, lender-intel, top 5 blog), that the emitted HTML contains the route's `<title>`, an `<h1>`, and route-specific body text — with no JS executed (a `fetch` of the file + string assertions, exactly what a non-rendering crawler sees).

### 6.2 Data

- **Blog corpus** moves from inline JSX (`BlogPage.tsx`) to `src/data/blog/*` modules shared by client + prerender.
- **lenders.ts freshness:** replace static rate-sheet numbers with **dated, provenance-stamped snapshots** (the type already supports this; add an `asOfDate` roll-up) refreshed by a manual/scripted pipeline; a stale-`asOfDate` CI warning.
- **Lead data:** stays Firestore (`leads`, `leadDelivery`, `sdr_outreach`); delivery webhook is env-gated and approved by an owner.

### 6.3 API

- Keep `/api/dscr/{solve,sensitivity}` public (product design), `/api/leads` public-but-hardened, `/api/sdr` + `/api/narrate` auth-gated.
- Re-attach the `TOOL_RELIABILITY_HOLD` gate as a registry (`toolReliabilityHolds.ts`) with a CI orphan-check (audit #8), so a tool can only ship when its hold is genuinely resolved.

### 6.4 Trust / compliance boundary

- **Truthful posture is a single source**: a `trustPosture.ts` config (entity name, NMLS, licenses, address, contact email) rendered by footer, legal page, contact page, and security.txt. One change updates all; a CI test asserts no page contradicts it ("in-house" claims fail).
- Fabricated content: repo-preserved, **never rendered**, CI-locked.

### 6.5 Observability

- Plausible events: `tool_run`, `verdict_band`, `qualify_open`, `lead_submitted`, `lead_failed` — low-cardinality, no PII (module contract already says this).
- Sentry stays optional. Pino logs stay structured and PII-free.

### 6.6 Testing / deployment

- CI stays the single gate; add: prerender content test, trust-posture test, provenance-render test, firestore-rules-deploy check, and the existing delivery/home contracts.
- Deploy: keep dual Firebase+Vercel only while both are actually used; document the canonical one (Vercel appears primary for the SPA, Firebase for functions/rules).

---

## 7. Product / UX Architecture

- **Information hierarchy:** `/tools` hub is the doorway (shipped); state-specific landing pages become the SEO wedge.
- **Progressive disclosure:** tool pages lead with the verdict (done), then the model details, then the qualify CTA; no modal on first render.
- **Trust signals replace fabricated ones:** real, verified, FTC-disclosed testimonials; "preliminary analysis, not approval" notices (already present on `/api/dscr` and tool pages); provenance chips on lender intel.
- **Empty/error states:** every tool has a defined zero-input and invalid-input state (fail-closed guards exist; surface them as UX, not 503s).
- **a11y remainder:** heading structure for results panels, `risk.danger` small-text swaps, focus rings ≥3:1, `<fieldset>/<legend>` where forms have sections.

## 8. Data / AI Architecture

- **Engine = deterministic core** (already the principle; keep it — the 08-08 audit's "Deterministic Core" doc agrees).
- **Brain:** wire `AegisAdvisor` + `CertaintyGovernor` into DecisionSupport **as modeled advice with provenance and the preliminary notice** — or delete the dir. Half-measures (code with no callers) are the worst state.
- **Research retriever:** fix `MASTER_RESEARCH_INDEX.json` paths to repo-relative (normalization exists), and rescue the corpus from the orphaned worktrees before any cache cleanup (audit §0).
- **Guardrails:** every AI-adjacent output (narrate, AEGIS) passes the existing safety filters (`isSafeNarration`, finite-range checks); no AI output may assert approval or a specific rate without provenance.

## 9. Validation Framework

| Layer | What | Gate |
|---|---|---|
| Engine | Golden values, fail-closed, v11 runner, godmode QA | existing (1506 tests) |
| Contract | home-fidelity, project-brain, delivery | existing CI scripts |
| **Prerender** | emitted HTML contains title/h1/body text per route, no JS | `prerenderContent.test.ts` (new) |
| **AI-crawler smoke** | fetch top-10 routes as a non-JS client; assert distinct content | `scripts/check-live.mjs` + CI |
| **Trust posture** | no "in-house/we fund" claim; footer/legal/security.txt consistent; 0 fabricated items in rendered DOM | `trustPosture.test.ts` (new) |
| **Provenance** | LenderIntel renders source + as-of date + confidence for every datapoint | `lenderIntel.provenance.test.tsx` (new) |
| **Lead E2E** | submit → `leads/{id}` created → delivery status recorded | existing + `leads.test.ts` |
| **Analytics** | event emitted on tool run when domain configured; nothing when not | `analytics.test.ts` (exists) |
| **Live checks** | DNS of contact domain, og:image 200, /health ok on deployed origin | `check-live.mjs` (new) |
| **Perf** | bundle budget, og:image <150 KB, LCP on tool route | CI step |

## 10. Risk Register

| Risk | L | S | Mitigation |
|---|---|---|---|
| FTC/Lanham exposure from fabricated testimonials/logos | M | H | Non-rendering is CI-locked; real pipeline replaces fiction (P0-2, P3-17) |
| "In-house lender" claims vs unlicensed reality (state licensing, ECOA) | M | H | Truthful posture sweep + single source (P0-1) |
| AI crawlers see empty pages; blog corpus wasted | H | M | Prerender (P1-7) |
| Brain ships wrong advice if wired naively | M | M | Wire behind modeled-advice + preliminary notice + provenance (P2-10) |
| Firestore rules never deployed → rules are fiction | H | H | Deploy step + verification (P0-4) |
| Only copy of the business on one laptop | H | H | Repo backup + worktree rescue + git history hygiene (P0-6, P4-18) |
| Stale lender/rate data presented as current | H | M | Dated snapshots + stale warning (P2-13) |
| Lead delivery misconfigured → leads lost silently | M | H | Truthful delivery state + env-gated webhook + owner approval (P0-5) |
| Anonymous auth / no App Check | M | M | App Check when auth matters (P4-20) |
| Money arithmetic drift (doubles) | M | L | decimal.js with golden regressions (P4-19) |
| Perf regression (3.2 MB JS) | H | M | Code-split + prefetch rework + budgets (P2-13) |
| Memory/knowledge system re-canonizes fiction | H | H | "No completion without a failing test" rule (blueprint-wide) |

## 11. Execution Plan

**P0 — correctness / blockers** (why: legal + trust + invisible-failure exposure; none depend on the architecture work)

1. **Truthful posture sweep.** Remove/reword "underwritten and funded in-house" (`home-markup.html` step-2 tab, `BrokersPage.tsx:471`, `ProductsPage` copy) to match the truthful footer; add `trustPosture.ts` single source (entity, NMLS-or-"none", address-or-"none", contact). **Validate:** `trustPosture.test.ts` fails on any contradiction; manual live review. **Done when:** 0 "in-house/fund it" strings in rendered output; footer/legal/contact agree.
2. **Fabricated-content containment lock.** CI test: `dist/index.html` + every prerendered route contain 0 trust logos, 0 named testimonials, 0 named execs; `home-markup.html` may keep them per owner instruction, but no render path may emit them. **Validate:** the test fails if the `#marketing-root` portal is ever re-wired with the current markup. **Done when:** gate green + audit grep of rendered DOM clean.
3. **Contact-channel truth.** Audit #4: `greenstreetfinance.com` is NXDOMAIN but published for legal/careers/security.txt. Move all published addresses to `greenstreet.finance`; fix `public/.well-known/security.txt`. **Validate:** `check-live.mjs` DNS assertions. **Done when:** every published contact resolves.
4. **Firestore rules deployed + verified.** Confirm the live project (audit #15: two projects + AI-Studio DB in play); add `firebase deploy --only firestore:rules` to the deploy path (not CI by default), or document the canonical alternative. **Validate:** rules file version deployed; a write from an unauthenticated client to `leads` fails. **Done when:** deployment is reproducible from the repo.
5. **Provenance to the UI.** `LenderIntelPage` (and the tools that list lenders) renders each program's source, as-of date, and confidence; "UNVERIFIED — do not present as fact" renders as such. **Validate:** `lenderIntel.provenance.test.tsx` asserts provenance text present. **Done when:** no lender datapoint can reach the DOM without its provenance.
6. **Backup + live smoke.** Document/execute: push to a dated branch, back up env/secrets, rescue the 7 orphaned worktrees' corpus (audit §0) before any cleanup. **Validate:** `check-live.mjs` — `/health`, `/api/dscr/solve`, og:image 200 on the deployed origin. **Done when:** a fresh checkout + env builds and the live origin passes.

**P1 — architectural foundations**

7. **Build-time prerender** (the AI-crawler fix). §6.1. **Validate:** `prerenderContent.test.ts` + AI-crawler smoke on top-10 routes. **Done when:** `curl` (no JS) of any sitemap URL returns route-specific HTML with title/h1/body; sitemap URLs all resolve distinct content.
8. **Blog corpus → data modules.** **Validate:** BlogPage renders identically (existing tests + prerender gate). **Done when:** blog routes prerender with full post text.
9. **LLM-crawler gate in CI.** A step that fetches the prerendered `/tools/dscr-calculator` and asserts the verdict text is present without executing JS. **Done when:** the gate is green and the committed robots.txt policy (allow GPTBot/ClaudeBot/PerplexityBot) is honored by real HTML.

**P2 — core product completion**

10. ~~Wire or retire the brain~~ — **DONE 2026-08-18 (retired).** Wiring was rejected on evidence: `AegisAdvisor` fabricates an interest rate from a hardcoded 6.875% base and emits STRONG_APPROVE/APPROVE underwriting verdicts — both prohibited by the site's governed trust posture ("pricing and provider matching are disabled until governed source data is approved"; "not a lender approval"); `evaluateDeal` recomputes DSCR with a flat 15% haircut, contradicting the main engine's solve; the bundled 1,011-doc research index is a duplicate of the docs-level `docs/project_brain/` asset with dead machine paths. `src/engine/brain/` deleted; `decisionSupport` is the sanctioned verdict path. **Done when:** no tested-but-dead code remains.
11. **Lead ops loop.** Plausible funnel events (tool_run, verdict_band, qualify_open, lead_submitted/failed) when domain configured; owner approves a `LEAD_DELIVERY_WEBHOOK_URL` destination; a weekly artifact reports lead count + funnel drop-off. **Done when:** a lead reaches a human; drop-off is visible in analytics.
12. **Media assets.** Hero poster frame from a real compression pass; og:image <150 KB (AVIF/WebP with PNG fallback); `srcset` on hero; retire the 4.6 MB `hero.png`. **Validate:** og:image size budget in CI; visual check. **Done when:** social/AI scrapers get a fast, correct image.
13. **Perf remainder.** `warmAllRoutes` → `<link rel="prefetch">` **preserving the chunk-recovery self-heal** (keep the loader + error/fallback path; the prefetch links are additive warming, not the recovery mechanism); `risk.danger` small-text swaps (~30 sites); results-panel heading structure. **Validate:** `chunkRecovery.test.ts` still green; bundle budget step. **Done when:** LCP improves on tool routes and chunk-recovery self-heal still works.

**P3 — quality / UX / SEO**

14. **Remaining a11y** (focus-ring contrast, heading skips, empty/error states, `<fieldset>/<legend>` pattern). **Validate:** WCAG-spot-check + per-item tests.
15. **SEO completeness.** Sitemap `lastmod` + legal-URL inversion; blog `og:image`/`twitter:*`; FAQPage schema where real FAQs exist. **Validate:** schema tests + live fetch.
16. **`llms.txt`** — a short, maintained index of canonical pages for AI navigation (no ranking value; cheap). **Validate:** links resolve.
17. **Real testimonial pipeline.** Collect + verify + display real client/broker endorsements with FTC-compliant disclosures; retire the fabricated set. **Validate:** every displayed endorsement has a verifiable source. **Done when:** trust content is real or absent.

**P4 — optimization / scale / hardening**

18. **Git history hygiene + backups.** `git filter-repo` strip >5 MB blobs (~3.1 GB pack); document env backup; re-verify the worktree corpus is safe. **Validate:** clone size, pack size, `check-live` still green after rewrite.
19. **`decimal.js` money arithmetic** with golden-value regressions (ledger #38). **Validate:** engine tests pass with identical outputs within tolerance.
20. **App Check + Firestore rate-limit store rollout** when auth matters beyond demo; verify shared rate limiting. **Validate:** rate-limit tests green with Firestore store; App Check attestation on auth flows.
21. **Browser Monte-Carlo worker with streaming progress** (ledger #42); worker-pool sizing. **Validate:** MonteCarlo page responsive on slow devices; worker tests green.

**P5 — advanced / experimental**

22. **Lender-sheet freshness pipeline** — dated, provenance-stamped updates to `lenders.ts` (crawl → review → commit with `asOfDate`). **Validate:** stale-date CI warning; provenance renders.
23. **STR market data integration** (AirDNA-grade) into `strUnderwriting`. **Validate:** STR tool tests green with real market inputs.
24. **CA-DSCR / climate-adjusted scoring** from the research corpus (FEMA NFIP + FIO insurance seeds now ship for 24,965 ZIPs, up from CA/FL-only). **Validate:** golden values + cross-check vs published methodology.
25. **Credit-memo PDF / broker deal room** (ledger #43). **Validate:** PDF generation test; broker workflow E2E.
26. **Portfolio / second-lien / 5–9-unit commercial gates completion** (ledgers #7, 33–37). **Validate:** gate tests + fixture deals.

---

## 12. Adversarial Review

I attacked this blueprint as six reviewers and corrected it where they were right.

- **Principal engineer:** "Prerendering an interactive calculator site is a trap — you'll ship broken hydration or a duplicated logic source." *Corrected:* prerender only the *shell* with default-state verdict inline; the engine stays client-side; URL persistence untouched; prerenderContent test guards the seam.
- **Product architect:** "Wiring the brain is risky — untested-against-reality advice is worse than none." *Corrected:* P2-10 is explicitly *wire behind the preliminary notice with provenance* **or retire** — the blueprint prefers wiring only because the code is already tested pure functions, but makes "modeled advice, never approval" a hard property.
- **Security engineer:** "P0 should start with App Check and rules deployment, not copy." *Corrected:* rules deployment moved to P0-4; App Check stays P4 because nothing sensitive is behind auth today (the lead funnel is the crown jewel and it's server-side).
- **Perf engineer:** "Prerender doesn't fix 3.2 MB of JS." *Accepted:* perf is its own track (P2-13, P4-21); prerender fixes *crawlability*, not *download size*.
- **Senior UX designer:** "The trust problem is the conversion problem — a visitor who reads 'in-house funding' then sees the footer admit there's no lender will leave forever." *Accepted:* that contradiction is now P0-1, above all UX polish.
- **Skeptical customer / competitor:** "There are 20 DSCR calculators; why this one?" *Answer, now in the plan:* state-specific depth (real law, real ZIP data) + being the AI-citable source. Competing on "the calculator" is lost; competing on "the Florida DSCR answer with sources" is winnable.

**What the review removed:** no prerender-bundling changes; no naive brain wiring; no attempt to touch the fabricated content beyond CI-locked non-rendering; no App Check front-loading.

---

## 13. How we prove it works

The blueprint's meta-rule, inherited from the 08-08 audit and now applied as a standing constraint: **nothing may be marked complete on the basis of a document. Completion requires a test that fails when the claim is false, or an observation of the real world.** Each P-task above carries its falsifiable gate; CI enforces the mechanical ones; `check-live.mjs` enforces the real-world ones (DNS, deployed origin, og:image). The first three P0 gates can land within a day and are the ones that would have prevented every top-15 audit finding.
