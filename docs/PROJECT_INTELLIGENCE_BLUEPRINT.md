# PROJECT INTELLIGENCE & ADVANCEMENT BLUEPRINT

**Repository:** greenstreet-dscr-engine (DSCR_LOAN OFFICE)
**Date:** 2026-08-16
**Basis:** Full end-to-end traversal of source, server, engine, data, config, CI, tests, git history, and the recovered data assets. Supersedes and expands `docs/BLUEPRINT_2026-08.md` (data claims there corrected 2026-08-16 after the dataset regeneration).

---

## A. Executive Assessment

Greenstreet is a **DSCR (debt-service coverage ratio) loan analysis and lead-generation product** whose real moat is its calculation core: 93 pure, tested engine modules, a 29,166-ZIP attributed market-seed dataset, a 50-state prepayment/legal matrix, provenance-stamped lender intel, and a 33-post educational corpus — wrapped in a marketing SPA that, as of the last week, is a **functioning, test-pinned lead funnel**.

Current reality, verified against code and runtime (not notes):

- **Healthy baseline:** `tsc --noEmit` clean · **103 test files / 1,506 tests green** · production build succeeds · two CI workflows enforce it.
- **Security posture is genuinely strong:** fail-closed Firebase auth, fail-closed Firestore rules, CSP/HSTS on every route, rate-limited + strictly validated public endpoints, no client write path to `leads`, idempotent lead persistence.
- **The interrupted work has been executed:** Wave 2 a11y (committed `b219d6a` + drawer/fieldset batch), Wave 2 SEO (`/tools` hub, anchor CTAs, BreadcrumbList), and — this week — a **dataset repair** that lifted state coverage 29.3% → 96.9% and insurance coverage 5% → 85.6% from data already in the recovered DB.
- **The biggest remaining strategic gaps are not bugs — they are disconnection:** (1) the fully-built `DSCRBrainEngine` has zero callers; (2) meticulously-maintained lender provenance never reaches the DOM; (3) all 73 routes serve an empty SPA shell to the AI crawlers the robots.txt policy explicitly courts.

**Highest-level judgment:** the project is close to production-ready as a *tool*, but its two differentiators — the engine and the data — are under-deployed. The strongest defensible end state is a **prerendered, AI-citable, provenance-transparent DSCR decision engine** whose lead funnel and lender data are wired end-to-end.

---

## B. Reconstructed Product/System Intent

| Intent element | Evidence | Status |
|---|---|---|
| **What it is** | DSCR loan analysis suite + mortgage lead generation | CONFIRMED — 93 engine modules, `/tools` pages, `leads` API |
| **Users** | Real-estate investors, STR hosts, brokers, non-US investors, borrowers | CONFIRMED — buyer personas in nav model, `/tools` page family |
| **Problem** | Investors systematically misprice DSCR deals (insurance impact > rate; negative leverage) | CONFIRMED — `insuranceEstimate.ts` header, `DATA_ASSET_BRIEF.md` median-yield analysis |
| **Business model** | Lead-gen: qualified scenario → lead record → operator webhook | CONFIRMED — `leads.ts`, `leadDelivery` collection |
| **Design philosophy** | "Seed, never claim" — prefilled values always attributed, editable, dated | CONFIRMED — `zipFundamentals.ts` header, `ZipSeedPanel`, `ZIP_ATTRIBUTION` |
| **Technical philosophy** | Fail-closed everywhere; provenance is first-class; every completion has a failing test | CONFIRMED — auth, rules, worker validation, `dataVintage`, audit tests |
| **Intended environment** | Vercel (SPA + serverless API) + Firebase (auth, Firestore) + optional Supabase | CONFIRMED — `vercel.json`, `firebase.ts`, `integrations/supabase.ts` |

**Contradiction found and resolved:** the product-upgrade plan and audit docs describe the ZIP dataset as a differentiator, but the shipped dataset was a 7-of-20-field subset with CA/FL-only insurance (5% coverage). The brief in `DSCR_DB_RECOVERED` warned "insurance CA/FL-only" as a *limitation*; the derivation had simply left the FIO NATIONAL series on the table. **Repaired 2026-08-16.**

---

## C. Repository Architecture

```
┌────────────────────────────── VITE REACT SPA ──────────────────────────────┐
│ src/router/resolve.ts (PageView union, 41 views, ROUTE_MAP)                 │
│ src/App.tsx (routeModules registry → React.lazy, SPA click interceptor,    │
│              warmAllRoutes chunk self-heal)                                 │
│ src/design/ (dc.tsx DcShell, navModel.ts, artifacts.tsx, theme.ts)         │
│ src/pages/ (23 tool pages + marketing pages)                                │
│ src/components/ (ZipSeedPanel, PremiumUI, QualifyModal, ComplianceDashboard,│
│                 TrueCostComparator, LiveDistressDealsFeed, ...)             │
│ src/engine/ (93 pure modules)                                               │
│ src/lib/ (zipFundamentals shard loader)                                     │
│ src/seo/ (routeMetadata, JSON-LD, sitemap)  src/marketing/  src/data/       │
│ src/monitoring/sentry.ts (optional no-op)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                          │ fetch /data/zip/NNN.json  (887 shards)
                          ▼
┌────────────────────────── VERCEL SERVERLESS API ───────────────────────────┐
│ api/_app.cjs (esbuild bundle of src/serverApp.ts)                           │
│ src/serverApp.ts — Express: /health, /api/dscr (public, rate-limited),      │
│   /api/sdr (auth), /api/narrate (auth + quota + Anthropic), /api/leads      │
│ src/middleware/ (auth fail-closed, validate zod, rateLimitStore, error)     │
│ src/routes/ (dscr, sdr, narrate, leads + zod schemas)                       │
│ src/engineService.ts → worker_threads pool → src/engineWorker.ts            │
└─────────────────────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴──────────────┐
              ▼                          ▼
   Firebase Admin (auth verify,    Optional external:
   Firestore: leads, leadDelivery,  Supabase parcels (live deals feed)
   auditLogs, users, deals,         Anthropic (narrate)
   artifacts)                       Operator webhook (lead delivery)
```

**Ownership boundaries:** engine = pure + deterministic (no I/O); lib = client-side data access; routes = server I/O + validation; middleware = trust enforcement; design = UI system; governance = evidence primitives (currently inert); conversion = React-memory scenario handoff (deliberately no identity fields).

---

## D. Current-State Reality

| System | Class | Evidence |
|---|---|---|
| Engine (93 modules) | **Complete** | Golden values, fail-closed guards, NaN regressions, v11 runner |
| ZIP market data | **Complete (repaired 2026-08-16)** | 29,166 ZIPs; state 96.9%, insurance 85.6%, flood/safmr/active ship |
| Lead intake + delivery | **Complete** | Idempotent UUID, server timestamps, env-gated HTTPS webhook, storage-only fallback |
| Firestore rules | **Complete** | Fail-closed, owner-scoped, immutable audit logs, client-blocked leads |
| Auth middleware | **Complete** | Fail-closed, dev bypass double-gated, production-impossible |
| SEO (routes/sitemap/BreadcrumbList) | **Complete** | 73 URLs, `/tools` hub, anchor CTAs |
| a11y Wave 2 | **Complete** | Committed `b219d6a` + drawer/fieldset batch (uncommitted) |
| Narrate (LLM) | **Complete** | Auth + quota + safe-narration regex fallback + no-store |
| Engine worker pool | **Complete** | Validated message contract, pool 0 on Vercel (inline fallback) |
| ~~Brain engine (`src/engine/brain/`)~~ | **Deleted 2026-08-18** | `DSCRBrainEngine`, `AegisAdvisor`, `CertaintyGovernor` — tested, zero callers. Retired: capability already served by `decisionSupport` + `DecisionSupportPage` with provenance; the brain fabricated pricing + underwriting verdicts (see H.1) |
| **Lender provenance → UI** | **Incorrectly implemented** | `lenders.ts` stamps every datapoint VERIFIED/UNVERIFIED; `LenderIntelPage` renders none |
| **Prerendering** | **Missing** | All 73 routes serve empty SPA shell; robots.txt invites GPTBot/ClaudeBot/PerplexityBot |
| **Real testimonials/logos** | **Missing** | Fabricated content renders zero on public site (containment by deletion-in-history) |
| **Sentry** | **Stub** | No-op until `@sentry/react` + DSN |
| **Lead webhook destination** | **Not configured** | Deliberate; storage-only recorder active |

---

## E. Architecture & Dependency Map

**Frontend → data:** `lookupZip(zip)` → `fetch(/data/zip/{prefix}.json)` → compact wire rows (`r,i,p,d,y,s,c,f,fp,s2,a`) → `ZipFundamentals` → `ZipSeedPanel` → calculator deal state. Shard cache at module scope; never throws; missing = normal outcome.

**Frontend → API:** pages → `VITE_API_URL` → `/api/dscr` (public, `apiLimiter`), `/api/sdr`, `/api/narrate` (auth-gated). Engine runs client-side via `engineWorker` inline fallback; server path only for SDR/narrate.

**Lead flow:** `QualifyModal`/hero → `QualificationScenarioDraft` (no identity) → submission → `POST /api/leads` → zod `LeadSubmissionSchema` (8 KB cap) → `persistLeadIdempotently` (Firestore `.create()` by client UUID, server timestamps, consent version) → delivery recorder (webhook or `not_configured`) → idempotent retry-safe.

**Auth flow:** Firebase ID token → `verifyFirebaseToken` → firebase-admin verify → `req.user` → `requireAuth` gates → Firestore rules re-verify ownership client-side.

**External deps:** Firebase (auth/Firestore), Supabase (optional parcels feed w/ fallback), Anthropic (narrate, gated), operator webhook (unset), Plausible (analytics), Google Fonts, Vercel CDN.

---

## F. End-to-End Flow Maps

**User journey — DSCR tool:** visitor → marketing page → tool route → enters deal (or ZIP-seeds rent/insurance/price) → engine solves DSCR/rate → verdict subtree (`aria-live` announced) → qualification CTA → scenario handoff → lead modal → server validation → Firestore + delivery.

**User journey — STR underwriting:** `str-underwriting` route (was orphaned) → `/tools` hub now links it → STR engine → occupancy/rent analysis → same funnel.

**Data pipeline:** raw sources (Zillow ZORI/ZHVI, realtor.com, Treasury FIO, FEMA NFIP, HUD SAFMR) → `dscr_engine.db` (recovered, 903 MB, 16 tables) → `derived/zip_fundamentals.json` → `scripts/generate-zip-shards.py` (NATIONAL insurance join + realtor.com state join + field selection) → 887 shards → SPA.

**Failure paths verified:** network-failed shard → null, tool undisturbed (test-pinned); duplicate lead → atomic create swallows `already-exists`; webhook non-2xx → `delivered=false` recorded, never retried from server (retry-safe by UUID); worker malformed input → validated error, pool degrades to inline; auth admin-init failure → 401 fail-closed.

---

## G. Repository Archaeology

- **`main` at `02092d7` (2026-08-15):** merge of `feat/product-upgrade-2026-08` — mostly cleanup (~120k lines of stale agent-skill assets deleted) + `scripts/apply-state-rules-map.py`.
- **Product-upgrade plan** tasks 1–3 (lead delivery, analytics, ZIP seeding) done; the merge was the endpoint where meaningful work paused.
- **Wave 1 defect remediation** done (`674ecdf` + follow-ups); **Wave 2** defined but never started — this conversation executed a11y, SEO, and perf slices.
- **`codex/p0-calculator-str-guards` (unmerged):** P0 fail-closed engine fix. Verified: **already landed on main, more thoroughly** (`MODEL_AUTO_DECISION_FLOOR`, `MIN_MODELED_RATE_PCT`, NaN regressions). Stale branch; nothing to recover.
- **`codex/reconcile-branches-20260808`:** homepage-design divergence; correctly kept unmerged.
- **`codex/navigation-integrity-20260811`:** unmerged on origin.
- **Recovered DB archaeology:** 16 tables; 5 header-broken on ingest (`fannie_mae_sf`, `ca_dof_e5_census`, `fl_bebr_*` — columns `0..N`); `nfip_claims.reportedCity` broken (1 distinct value); Airbnb tables deliberately excluded (ToS risk). FIO NATIONAL series was the big un-recovered asset — **recovered this week**.
- **Design intent preserved in `docs/DESIGN_SOURCE_OF_TRUTH.md`, `docs/REMOVED_MARKETING_CONTENT.md`** (documents fabricated testimonials removed).

---

## H. Critical Findings (ranked)

1. ~~Brain engine is fully built and entirely unwired~~ — **RESOLVED 2026-08-18: retired (deleted).** The decision was made against the code: `DecisionSupportPage` already implements the brain's entire promised surface (gate-based verdict via `computeVerdictDetail`, engine-solved DSCR via `solveDSCR`, dated program matrix with provenance stamps, `checkPPPLegal`), so wiring the brain would have put a *second, contradictory* DSCR formula (flat 15% haircut vs the main engine), a **fabricated hardcoded interest rate** (6.875% base in `AegisAdvisor` — directly contradicting "the program data carries no pricing" and the homepage's "No live rates"), and underwriting-approval verdict language ("STRONG_APPROVE") on screen. It also bundled an 11k-line personal research index of dead `C:\Users\serge\...` paths into the client. The preliminary-analysis notice does not cure fabricated pricing. Package deleted; `decisionSupport` remains the sanctioned verdict path.
2. **Lender provenance thrown away at render** — `lenders.ts` stamps `UNVERIFIED — do not present as fact`; `LenderIntelPage` renders none of it. **P0: no lender datapoint reaches the DOM without its provenance.**
3. **All 73 routes serve the identical empty SPA shell to AI crawlers** that don't run JS. The 33-post blog corpus is invisible to the exact surfaces robots.txt courts. **P1: build-time prerender.**
4. **Rent coverage is 28.9% and that's a source limit, not a shipping choice.** ZORI's latest month genuinely covers 8,433 ZIPs. The fix is a HUD SAFMR-derived fallback (public domain, ~full coverage, r=0.539/1.23-ratio calibration already documented). **P1 — the largest remaining dataset gain.**
5. **FTC 16 CFR 465 (effective Oct 2024, $53,088/violation) is live enforcement**; fabricated testimonials currently render zero but are recoverable from git history. **Containment shipped 2026-08-18:** `npm run test:ftc` scans every shipped HTML file (shell + all 73 prerendered twins) for 81 banned fabricated strings — claims, personas, firms, exec names, trust-logo paths — and fails CI on any hit. The build-time sanitizer now applies the same replacements to index.html, which also fixed two live leaks (the `⎋` announcement and the footer "The DSCR engine. Deterministic…" claim that shipped in the shell and every twin). Owner keeps the assets; they never render.
6. **Two CI workflows duplicate the same checks** (`ci.yml`, `verify.yml`). Not harmful, but drift-prone. **P4 consolidation.**
7. **`react-markdown` declared, zero usage** (verified across src). **P4 removal.**
8. **`api/_app.cjs`** shows pre-existing line-ending-only noise; not ours, leave alone.

---

## I. Missing Systems & Negative-Space Findings

- **State→engine wiring:** `ZipSeedPanel.onApply` passes rent/insurance/price only; the state it now carries (96.9%) never reaches the state-aware engine layer (PPP laws, insurance state table, reassessment). The data was repaired; the wiring is the next step.
- **Flood data → insurance estimate:** `FLOOD_MULTIPLIER` exists in `insuranceEstimate.ts`; NFIP flood claims now ship per ZIP; nothing connects them.
- **Provenance release gate:** `sourceEvidence.ts` is an inert primitive with no caller — exactly the missing enforcement for finding #2.
- **Prerender pipeline:** no build-time static emission; the "73 routes" claim is SPA-routes-only.
- **Lead ops loop:** delivery status is recorded (`leadDelivery`), never surfaced to the operator (no dashboard, no retry job, no alert).
- **Observability:** Sentry is a no-op stub; no structured error dashboard; `logger` (pino) exists server-side but no ingestion.
- **Data lineage doc:** the derivation chain (DB → derived → shards) has no committed manifest; `scripts/generate-zip-shards.py` now documents it, but raw → DB is still external.
- **`warmAllRoutes` prefetch-vs-chunk-recovery tension:** documented in `chunkRecovery.test.ts`; prefetch links would break the self-heal. Leave as-is; note in perf backlog.

---

## J. State-of-the-Art Comparison

| Concern | This repo | State of the art | Verdict |
|---|---|---|---|
| AI crawler visibility | Empty SPA shell (GPTBot/ClaudeBot/PerplexityBot invited by robots.txt, 2025–26 crawler studies: no JS execution) | Build-time prerender / SSG + `llms.txt` | **Gap — P1** |
| Mortgage lead-gen compliance | FTC 16 CFR 465 live ($53,088/violation, Dec 2025 warning letters); fabricated content contained | Full disclosure + verified testimonials | **Gap — P0 lock** |
| DSCR market thesis | Engine uses industry-band haircuts; median gross yield 5.1% vs ~7% pricing → negative-leverage story | 2026 market: DSCR 6.5–8%, permanent non-QM fixture | **Validated** |
| Structured data | BreadcrumbList on tools; CollectionPage | Full JSON-LD (FAQPage, HowTo, Product, Organization) + sitemap `lastmod` | **Partial** |
| Dataset provenance | Per-claim VERIFIED tags, `dataVintage` registry w/ staleness tests, per-field asof | Industry: dated + licensed attribution everywhere | **Best-in-class discipline; now coverage-repaired** |
| Security | Fail-closed auth/rules/CSP/HSTS, rate limits, zod schemas, SSRF guard on webhook | OWASP ASVS-aligned | **Strong** |
| Observability | Sentry stub, pino server-side | OpenTelemetry + error budgets + alerting | **Gap — P3** |

---

## K. Architectural Decisions

**Keep (correct abstractions):**
- Engine purity + determinism (93 modules, golden values) — the moat.
- Fail-closed auth, rules, worker validation — never weaken.
- Provenance discipline (`dataVintage`, per-claim tags, attribution strings) — extend, don't replace.
- Sharded ZIP data + cacheable-forever headers — right call vs one 3.5 MB blob.
- Lead idempotency by client UUID + server-owned timestamps.
- The `PageView`-union router with a single `routeModules` registry — one place to add a route.

**Change:**
- Prerender the 73 routes at build time (Vite SSG pass or static emission), keeping the SPA for interactivity.
- Wire state + flood from ZIP seeds into the engine (the data is already there).
- Enforce provenance at render (LenderIntelPage renders provenance, or the datapoint doesn't render).
- ~~Wire-or-retire the brain engine~~ (resolved 2026-08-18: retired — see H.1).

**Merge/consolidate:**
- `ci.yml` + `verify.yml` → one workflow with a single contract-check sequence.
- `monitoring/sentry.ts` stub + logger → one observability path when DSN is set.

**Remove:**
- `react-markdown` (unused).
- `sourceEvidence.ts` either gets a caller (provenance gate) or gets deleted — inert primitives rot.

---

## L. Advanced Opportunities

1. **AI-citable state corpus:** prerender tool pages + blog to static HTML, add `llms.txt`, emit FAQPage/HowTo JSON-LD per tool. Makes the 33-post corpus the answer surface for "what DSCR rate in FL in 2026?" queries — the cheapest high-leverage SEO/AI play available.
2. **SAFMR rent fallback layer:** HUD FY2026 FMR/SAFMR (public domain) → calibrated rent seed (×1.23 median ratio, state-corrected) → rent coverage 28.9% → ~95%, each value labeled with its own source/date. The dataset's last big gap.
3. **Provenance-to-UI:** LenderIntelPage renders each claim with its VERIFIED/UNVERIFIED chip + date + source; `sourceEvidence` becomes the release gate that blocks unverified datapoints from the DOM.
4. **Flood-adjusted insurance:** NFIP claims per ZIP → premium uplift in `estimateAnnualInsurance` via existing `FLOOD_MULTIPLIER` — insurance is the highest-DSCR-impact input per the engine's own notes.
5. **Lead ops loop:** expose `leadDelivery` status to an operator view (or a scheduled check) — the funnel records but never surfaces.
6. **State→engine seed wiring:** ZIP seed now carries state; pass it into deal state so PPP laws + state insurance table + reassessment rules fire from a ZIP lookup alone.

---

## M. Target Architecture

```
                         ┌──────────────────────────────┐
                         │   BUILD-TIME PRERENDER PASS   │
                         │ 73 routes → static HTML+JSON- │
                         │ LD, blog corpus, llms.txt     │
                         └──────────────┬───────────────┘
                                        │ serves
┌───────────────────────────────────────▼──────────────────────────────┐
│  SPA (Vite) — interactive engine + funnel                            │
│  ZIP seeds → state+rent+insurance+flood → engine                    │
│  LenderIntelPage renders provenance-gated claims                     │
│  Lead funnel → validated scenario → lead record                      │
└───────────────────────────────────────┬──────────────────────────────┘
                                        │
┌───────────────────────────────────────▼──────────────────────────────┐
│  API (Vercel serverless) — dscr/sdr/narrate/leads, fail-closed auth  │
│  + provenance gate + delivery recorder → operator surface             │
└───────────────────────────────────────────────────────────────────────┘
```

**Invariants preserved:** engine stays pure; every external claim carries source+date; every completion ships with a failing test; fail-closed stays fail-closed.

---

## N. Detailed Technical Blueprint

1. **Prerender (P1):** a `scripts/prerender.mjs` that imports the route registry, renders each route to static HTML via the existing build output (or a jsdom render pass), emits `dist/prerender/{route}/index.html` + JSON-LD; `vercel.json` rewrites serve static-first with `X-Robots-Tag` intact; CI asserts every sitemap URL has a static twin. Blog posts get FAQPage/HowTo schema; `public/llms.txt` lists tools + top posts.
2. **ZIP wiring (P1):** `ZipSeedPanel.onApply` gains `state` (and `floodClaims`); deal state carries it; `statePppLaws`/`insuranceEstimate`/`reassessment` consume it; `insuranceEstimate` applies flood uplift when NFIP claims present; tests pin the join.
3. **SAFMR layer (P1):** new `scripts/` derivation joins HUD FY2026 SAFMR → `safmr_rent` seed for ZIPs without ZORI (ratio-calibrated, `asOf` stamped, attribution added to `ZIP_DATA_SOURCES`); coverage test asserts ≥90% rent coverage.
4. **Provenance gate (P0):** `sourceEvidence` attaches to a release gate; `LenderIntelPage` renders `provenance` + `asOfDate` + `source` chips per claim; an assertion test fails if any `UNVERIFIED` claim renders without its label.
5. **Brain wiring-or-retire (P0 decision / P1):** `decisionSupport` calls `DSCRBrainEngine.analyze` behind the "preliminary analysis" notice; golden-value tests; if not wired by end of P1, delete the package (dead code).
6. **FTC lock (P0):** CI test scans the render tree for the fabricated testimonial/logo strings and fails if any appears; the owner's keep-instruction is respected — assets stay in history, never render.

---

## O. Security / Reliability / Performance Blueprint

**Security (verified strong, maintain):** fail-closed auth + rules; `ALLOW_DEV_AUTH_BYPASS` double-gated; webhook SSRF guard (https + no credentials); zod schemas; 8 KB body cap; rate limits (`apiLimiter`, `narrateLimiter` + quota); CSP/HSTS/Referrer-Policy/Permissions-Policy; immutable audit logs. **Add:** App Check on client Firebase (P4), provenance gate (P0), lead-retention policy in the delivery contract.

**Reliability:** lead persistence idempotent by UUID; delivery recorder preserves first-writer; worker pool degrades inline on Vercel; shard fetch never throws. **Add:** lead-delivery alerting (no silent `not_configured` forever); retry job with backoff; Sentry wired when DSN present.

**Performance:** hashed-asset `Cache-Control: immutable` (done); sharded ZIP lookup (median 1.9 KB); code-split routes with warmAllRoutes self-heal (leave). **Add:** prerendered static-first delivery; AVIF/srcset hero + compressed poster (blocked on asset generation); drop `react-markdown`.

**Scaling:** 10× traffic → rate limits + static-first absorb it; 100× data → shards still per-prefix; DB is external (never in repo — licensing). Watch: Firestore read amplification on live-deals feed (Supabase path exists).

---

## P. Product & UX Implications

- **Prerender = trust:** AI crawlers and social previews get real content; the blog corpus becomes an inbound channel instead of decoration.
- **Provenance chips on lender pages** convert "transparency" from a claim into visible UI — a differentiator for a skeptical investor audience.
- **ZIP seed filling state + flood** makes the tool feel local: enter a ZIP, see rent, insurance, *and* flood risk, state-corrected laws.
- **SAFMR cross-check row** (already rendered) is the model for the new SAFMR rent fallback: always attributed, always editable.

---

## Q. Migration Strategy

No destructive rewrites required. Order:
1. **P0 now:** provenance gate (additive, test-pinned), FTC render-lock, brain wire-or-retire decision.
2. **P1:** prerender pipeline (additive — SPA stays; static-first is a rewrite-layer on top), ZIP state/flood wiring, SAFMR layer.
3. **P2+:** lead ops surface, Sentry, CI consolidation.
Each step is independently shippable and reversible; the SPA fallback remains until static-first is proven in CI.

---

## R. Implementation Sequence

| # | Workstream | Purpose | Affects | Prereq | Validate | Completion criterion |
|---|---|---|---|---|---|---|
| P0-1 | Provenance release gate | No unverified lender claim reaches DOM unlabeled | `lenders.ts`, `LenderIntelPage`, `sourceEvidence.ts` | — | tsc + new render test | Test fails if UNVERIFIED renders bare; passes labeled |
| ~~P0-2~~ | ~~FTC render-lock~~ | **DONE 2026-08-18** | `scripts/check-ftc-contract.ts`, `scripts/ftcBanned.ts`, `src/marketing/claimReplacements.ts` | — | `npm run test:ftc` in both workflows | 81 banned strings scanned across all shipped HTML; fails on any hit; passes today |
| ~~P0-3~~ | ~~Brain wire-or-retire~~ | **DONE 2026-08-18** | `brain/` | — | tsc (dangling imports fail) | Package deleted; verdict path is `decisionSupport` |
| P1-1 | Prerender 73 routes | AI crawlers see real content | build, `vercel.json`, `scripts/` | — | CI: every sitemap URL has static twin | Crawler fetch of any route returns content, not shell |
| P1-2 | ZIP state/flood wiring | Seeds drive state-aware engine | `ZipSeedPanel`, deal state, engine | P0-1 | engine tests | ZIP lookup → PPP/insurance/reassessment tests pass |
| P1-3 | SAFMR rent layer | Rent coverage 29% → ~90%+ | data pipeline, `zipFundamentals` | — | coverage test | ≥90% of shipped ZIPs carry a rent seed |
| P2-1 | Lead ops surface | Delivery status visible | `leadDelivery` reader, new UI | — | integration test | Operator can see `not_configured` vs delivered |
| P2-2 | Observability | Sentry + error ingest | `monitoring/` | — | DSN test | Exception captured with DSN set, no-op without |
| P4-1 | CI consolidation | One contract-check sequence | workflows | — | both run green | Single workflow file |
| P4-2 | Dep removal | `react-markdown` | package.json | — | build | Tree includes no react-markdown |

---

## S. Validation Framework

- **Every workstream ships with a test that fails when its claim is false** (the audit's meta-rule, already the repo's culture).
- **Baseline gate:** `tsc --noEmit` · `vitest run` (103 files/1,506) · `npm run build` · `test:home-fidelity` · `test:project-brain` · `test:delivery` — all green before/after each step.
- **Dataset gate:** `scripts/generate-zip-shards.py` prints coverage; a committed assertion script checks state ≥90%, insurance ≥80%, rent target per layer.
- **Prerender gate:** CI fetches each sitemap URL and asserts non-shell content + JSON-LD.
- **Provenance gate:** the render test (P0-1) is the acceptance test.

---

## T. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| FTC enforcement on historical fabricated content | High | P0 render-lock; owner keeps assets out of render path permanently |
| Unverified lender claims presented as fact | High | P0 provenance gate |
| AI crawlers index empty shells → brand damage + zero SEO value | Medium | P1 prerender |
| Rent seeds at r=0.539 treated as appraisals | Medium | Seed-not-claim framing (existing); SAFMR layer labeled |
| Brain engine abandoned after wiring effort | Medium | Wire-or-retire gate with deadline |
| Lead webhook misconfiguration (SSRF, leak) | Medium | Existing guards; retention policy in delivery contract |
| Firebase/Anthropic/Supabase single-vendor dependency | Low | Supabase optional; Anthropic gated; firebase-admin fail-closed |
| `api/_app.cjs` line-ending churn | Low | Leave untouched; note in git |
| Two CI workflows drift | Low | P4 consolidation |

---

## U. Delete / Replace / Consolidate List

- **Delete:** `react-markdown` (unused); the brain package (done 2026-08-18 — see H.1); the stale `codex/p0-calculator-str-guards` branch (superseded on main); `docs/BLUEPRINT_2026-08.md`'s superseded data claims (this doc replaces them).
- **Replace:** 7-field shard subset → 11-field set (done); CA/FL-only insurance → NATIONAL (done); SPA-only delivery → static-first (P1).
- **Consolidate:** `ci.yml`/`verify.yml`; Sentry stub + pino into one path.

---

## V. Open Questions

1. **Lead webhook destination** — the storage-only recorder is correct until an owner approves a destination; the owner must choose (CRM/email/retention).
2. **Airbnb tables** — excluded for ToS risk; an owner decision, not a code decision.
3. **Fannie Mae / CA-DOF / FL-BEBR header-broken tables** — re-ingestible from source Excels, but the source files live outside the repo; needs owner's file access.
4. **Hero video poster asset** — the only candidate is 4.8 MB; a compressed frame must be produced (asset work, not code).

---

## W. Final Recommended End State

Greenstreet should become the **AI-citable, provenance-transparent DSCR decision engine**:

- **Every route — tool or post — prerendered** with structured data, so the 33-post corpus and 23 tool pages answer real queries on the surfaces the site already courts (AI crawlers, search, social previews).
- **Every number on screen carries its source and date** — ZIP seeds (rent, insurance, flood, SAFMR), lender claims (VERIFIED/UNVERIFIED chips), rates (as-of), laws (verified-date) — making "we show our work" a visible, enforced product property rather than a header comment.
- **The ZIP seed is the state-aware entry point:** one ZIP lookup seeds rent, insurance, flood risk, state-specific prepay/reassessment law context, and a sanity-checked SAFMR rent — the strongest local-data story in the DSCR lead-gen space.
- **The lead funnel closes the loop:** validated scenario → idempotent record → delivered status visible to the operator → consent and retention governed by an approved contract.
- **No dead-but-tested systems:** the brain package was retired (2026-08-18) because its outputs — fabricated pricing, approval verdicts — conflicted with the governed trust posture; the advisory layer that survives is `decisionSupport`'s gate-based verdict with provenance stamps.

Verified today: tsc 0 · 103 files / 1,506 tests green · build succeeds · dataset repaired (state 96.9%, insurance 85.6%, flood/safmr/active shipping) · Wave 2 a11y committed and SEO shipped · P1 prerender live (73/73 static twins, CI-gated) · brain package retired (P0-3 done). The path from here is P0 (provenance gate, FTC lock) → P1 (ZIP wiring, SAFMR) → P2 (lead ops, observability) — each additive, test-pinned, and reversible.

**Evidence index:** all claims above cite `src/` modules, `scripts/generate-zip-shards.py`, `vercel.json`, `firestore.rules`, `.github/workflows/`, `docs/PLAN_*.md`, `docs/audit-*`, and `C:/Users/serge/DSCR_DB_RECOVERED/` (recovered DB + `DATA_ASSET_BRIEF.md`). Full suite re-run 2026-08-16 during this audit: **1506/1506 green.**
