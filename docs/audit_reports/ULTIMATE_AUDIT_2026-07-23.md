# 🛰️ ULTIMATE SYSTEM AUDIT — Greenstreet DSCR Platform
**Date:** 2026-07-23 · **Method:** 9 parallel specialist subagents (architecture, graphs, memory, security, engine-math, vision-vs-reality, content/compliance, ops, prior-audit reconciliation) · **Scope:** whole system, big-picture — not line-level style
**Repo:** `greenstreet_frontend` · **Branch:** `claude/comprehensive-system-audit-ju5bmr`

> Total distinct findings surfaced: **~120** across 9 lanes (10 Critical · 30 High · ~45 Medium · ~35 Low). This document consolidates, de-duplicates, and ranks them by *business* severity, then gives a prioritized remediation roadmap. Full per-lane detail lives in `docs/audit-2026-07-23/01..09-*.md`.

---

## 0. Executive verdict (read this first)

**You have shipped a genuinely good deterministic DSCR calculator wearing the marketing costume of an institutional AI lending platform you have not built — and the seams of a half-finished "we are the lender" repositioning are showing on the public site.**

Three things are true at once, and they must be held together:

1. **The core is real and sound.** The dual-track DSCR qualification math (`Rent÷PITIA` and `NOI÷PITIA`) is correct, reproduces its documented golden factors, and is defensible. There is a real 19-lender provenance matrix, a 147 KB 50-state prepay/usury law engine, tax/ARM/returns modules, and 57 tests. This is non-trivial, competent work.
2. **The team can execute remediation.** The prior-audit lane proved this is **not audit theater**: ~34 of ~42 previously-known High/Critical findings were genuinely *fixed* between 2026-06-25 and 2026-07-15 (auth, CORS, rate limiting, Firestore rules, error boundaries, routing, brand cleanup). The trajectory is monotonic — no regressions found.
3. **The gap between what is claimed and what exists is the core risk.** The "DSCR Sovereign OS" described across **51 blueprint docs** — TimesFM forecasting, t-copula Monte Carlo, ML approval prediction, memory/self-learning, an Evidence Vault — exists in **zero lines of shipped code**. Meanwhile the *public* site makes lender claims it cannot legally or factually support, loses its own sales leads silently, and sends borrower financials to a third-party endpoint by default.

**The single most valuable strategic move is subtraction, not addition:** stop marketing the vaporware, finish the one repositioning you started, close the compliance gaps, and let the excellent calculator be the product. You are one honest positioning pass and a compliance sprint away from a coherent, shippable company. Right now the *story* is the liability, not the *engine*.

**Overall grades:**

| Dimension | Grade | One-line |
|---|---|---|
| Core DSCR qualification math | **A−** | Correct, golden-tested, defensible |
| Engineering execution (frontend/backend) | **B** | Competent; hardened; a few real architecture faults |
| Remediation discipline | **B+** | Prior findings genuinely closed |
| **Data integrity / persistence** | **D** | Leads lost, deals never saved, AI has no memory |
| **Regulatory / compliance posture** | **D−** | No lender disclosures; deceptive sourcing & claims |
| **Positioning / narrative honesty** | **F** | 4 companies in the docs; 90% vaporware; contradicts itself |
| Repo/ops hygiene | **C−** | 482 MB repo, no CI, 3 deploy targets |

---

## 1. The eight cross-cutting themes (the "large picture")

Everything below rolls up into eight systemic themes. Individual bugs are symptoms; these are the diseases.

### THEME A — 🎭 Identity crisis: the repositioning is half-done and now self-contradicts
A hard pivot (16+ commits) reframed the product from a broker/lender **marketplace** to a direct **"we are the lender."** The pivot touched marketing copy but not the substrate, so the site now argues with itself:
- `AboutPage.tsx:27` — *"We are a software platform, **not a lender**, not a referral marketplace"* — directly contradicts `SolutionsPage.tsx:368`, `BorrowerProfilesPage.tsx:318`, `BrokersPortalPage.tsx:15` (*"direct lender / we are the broker AND the lender"*).
- The **public SEO/social identity is still the old one**: `index.html:32-44` titles the site *"The DSCR Engine for **Non-QM Brokers**"* — the marketplace positioning is literally the face Google and social shares see.
- The **backend LLM prompt still speaks broker**: `narrate.ts:40,44,54` — *"for a broker to explain to a borrower," "Track 1 (lender qual)," "broker-to-client."*
- The engine's flagship feature is **lender matching across 19 lenders** (`matchLenders`) — pure marketplace mechanics — untouched by a pivot that says "we are the single lender."
- Product-identity sprawl across docs+code: **Sovereign OS, AEGIS, 20X Deal Engine, Command Center v7, Dual Truth Engine, Godmode, Greenstreet, InvestGO** (itself renamed DSCRGo→InvestorGO→InvestGO). That's ~10 names for one product.

**Impact:** a visitor, a regulator, and a partner each get a different story. This is the #1 big-picture problem.

### THEME B — 🌫️ Vaporware vs. reality: the differentiator doesn't exist
- **51 master/blueprint docs** promise AI underwriting, TimesFM 2.5 LoRA rent forecasting, R-vine/t-copula Monte Carlo, XGBoost approval prediction, CECL loss modeling, conformal intervals, a graph-native runtime, an Evidence Vault, memory/self-learning, live RentCast/SOFR feeds. `grep` of `src/` for `timesfm|copula|xgboost|conformal|cecl|embedding|vector` → **0 hits** (except the string "memory: 1GiB" and statute text). `package.json` has **no ML dependency**.
- What actually ships as "AI": **one** `narrate.ts` call that sends ~6 computed numbers to `api.z.ai` and returns 2-3 sentences, explicitly barred from generating numbers.
- The shipped Monte Carlo does **exactly what the spec forbids**: the MASTER BLUEPRINT says *"Gaussian copulas are forbidden,"* yet `monteCarlo.ts` ships independent Gaussian shocks + a single-factor Vasicek path, presented on `MonteCarloPage.tsx` as institutional stress testing.
- The `dscr_sovereign_os_architectural_debt_and_math.md` "debt register" critiques *"the current t-copula Monte Carlo,"* *"the XGBoost predictor retrained weekly,"* and *"the Evidence Vault"* as **existing systems** — none exist. You are accruing planned upgrade work against foundations never poured.

**Impact:** positioning that leans on the vision materially misrepresents a deterministic calculator. ~12 of ~25 promised capability clusters are outright vaporware; the ~8 that shipped are the "deterministic floor" the docs themselves call the *minimum*.

### THEME C — ⚖️ Compliance exposure on a real-money lending site
DSCR loans are business-purpose (largely exempt from TILA/RESPA/consumer-ECOA), **but** FTC-Act/UDAAP deception, Fair-Housing/Equal-Housing, ECOA anti-discrimination, and state NMLS/licensing + mortgage-advertising rules still apply. Against those:
- **[CRITICAL] Mandatory lender disclosures absent site-wide.** No NMLS ID, no state-licensing statement, no Equal Housing Lender logo/text, no ECOA notice, no physical address — anywhere in `src/pages` or `index.html` — despite repeated "direct lender / fund in-house" claims. (`LegalPage.tsx` and both footers carry none.)
- **[CRITICAL] Concealed white-label sourcing = UDAAP risk.** `dscrPrograms.ts:1-10` documents that programs are sourced from partner **`caketpo.com`** and *"Partner name is NEVER surfaced,"* while public copy says loans are funded **in-house**. If loans are wholesale/resold, "we fund it ourselves" is deceptive.
- **[HIGH] Fabricated testimonials & logos.** `BrokersPortalPage.tsx:40-59` ships named endorsers with hard stats (*"closed in 19 days"*) and **no disclaimer**; `CaseStudiesPage.tsx` ships real company logos for entities it elsewhere admits are "not verified named customers."
- **[HIGH] Hardcoded state-law map fails open.** `StateLawsPage.tsx:19,53-61` hand-codes 24 states and defaults the **other 26 to green "PPP Allowed / no restriction,"** never importing the authoritative `statePppLaws.ts`. Michigan — which the engine calls legally *"ambiguous, no consensus"* — is shown as unambiguously allowed. Fabricated-authoritative legal guidance.
- **[HIGH] Wrong PA prepay threshold in the engine** (see Theme D / F-1).
- **[HIGH] Fake `+1 (555) 010-0000` phone** (reserved fictional exchange) shipped in **14 files**, including on "not a commitment to lend" legal disclaimers.
- **Stale rates shown as current;** past-due "next review Jul 22, 2026"; `armResetEngine.ts:34` market snapshot `asOfDate:'2026-06-17'` feeds Monte Carlo/ARM as if live.

### THEME D — 🔢 Data integrity: the numbers aren't always what they claim
- **[CRITICAL] Financial math is not server-authoritative.** Only `ComplianceDashboard` calls `/api/dscr/*`; ~10 tool pages import the engine and compute **in-browser** (0 `fetch` calls in `src/pages`). Underwriting numbers that gate loans are client-side and user-editable.
- **[HIGH] The flagship public calculator bypasses the audited engine.** `DSCRCalculatorPage.tsx:12-15` re-implements amortization inline (term hardcoded to 360 mo), importing nothing from `src/engine` — it can silently diverge from the audited `solveDSCR` used elsewhere. There are **≥3 divergent DSCR implementations** that can show different DSCR for the same deal, plus a 100× foot-gun (`qualify.ts` uses rate-as-fraction, `engine.ts` rate-as-percent).
- **[HIGH] Real engine bugs in the advisory layer** (see §2 Findings): flood-insurance **unit mismatch inflates the gating Track-1 DSCR**; after-tax IRR omits the mortgage-interest deduction; IRR double-scaled 100×; IRR-waterfall cumulative column double-counts.
- **[HIGH] Count/label inflation:** "**19 programs**" advertised (`ProductsPage.tsx:56`) vs **7** real (`FAQPage.tsx:61`); lender count told as 12 / 17 / 19 / "60+" for one 19-entry matrix; charts labeled "distribution bar chart" are stat tiles (`MonteCarloPage.tsx:62`); computed Vasicek paths are never actually plotted.

### THEME E — 🧠 Memory & persistence: broken where it matters most
*(You asked specifically about memory systems — this is the answer: there is almost no working memory, and the one thing that should persist, loses money.)*
- **[CRITICAL] You are silently losing your own sales leads.** The `/leads` Firestore rule requires `submittedAt` (`firestore.rules:57`) but the QualifyModal payload sets `createdAt` (`QualifyModal.tsx:1932`) — `submittedAt` appears nowhere. **Every lead write is denied** and falls back to the *visitor's own* `localStorage['gs_leads']` (`:1944`), which the business can never read. The "See If You Qualify" funnel captures nothing.
- **[CRITICAL] ComplianceDashboard persistence is rules-blocked.** It reads/writes `artifacts/default-app-id/users/{uid}/...` (`ComplianceDashboard.tsx:333-368`), a path with **no allow rule** → denied by the catch-all. Audit history & settings can't save or load.
- **[HIGH] `/deals` "deal history" is vaporware** — the rules protect a collection **no code ever writes** (`grep collection(db,"deals")` → 0). `/users` and `/auditLogs` are likewise orphaned. The "immutable audit log" and "soft-delete users" guarantees protect unused collections while the *real* audit path allows client `deleteDoc`.
- **[HIGH] The AI feature has zero memory/retrieval.** `narrate.ts` is a stateless single-shot prompt — no RAG, no session memory, no embeddings. The 2.9-million-word `docs/dscr_loan_office` corpus and the `graphify-out` graph sitting right there are **never read at runtime**.
- **[MEDIUM] No calculator state persistence** — `DealAnalyzerPage` = 9 `useState`, zero storage; a refresh wipes every input. **In-memory rate limiters** reset on cold start and don't coordinate across `maxInstances:10`, so the "10/min" LLM cap is really ~100/min and unenforceable.

### THEME F — 🔐 Security posture: hardened perimeter, soft interior
- **[CRITICAL] `/api/narrate` is an open, unauthenticated, paid-LLM endpoint.** Auth is **fail-open** (`auth.ts:38-45`), the SPA sends no token, and prod is documented to run with `REQUIRE_AUTH` unset. Direct LLM cost-abuse vector.
- **[CRITICAL] Borrower financials egress to a third party by default.** `narrate.ts:14` defaults the base URL to **`https://api.z.ai/api/anthropic`** — computed deal financials + a free-text `context` field go offshore unless env overrides it. No DPA in evidence. (Bonus: model id `claude-sonnet-4-6` is not a real Anthropic model.)
- **[HIGH] Auth fails open to a static mock identity** — if `firebase-admin` init fails, any Bearer token authenticates as `dev-user-id` (`auth.ts:5-17`).
- **[HIGH] `leads` accepts unauthenticated writes with arbitrary extra fields, no App Check** (`firestore.rules:54`) — world-writable PII intake / storage-cost abuse.
- **[HIGH] No CSP** while `index.html` loads Vector.co pixel, GTM, CookieYes, Webflow CDN on PII pages; CDN `<script>`s still lack SRI hashes and pin `jquery-3.5.1` (flagged a month ago, still open).
- **[MEDIUM] `auditLogs` are client-forgeable; `deals` update rule doesn't pin the owner field** (an owner can set `userId` to a victim's uid).

### THEME G — 📦 Ops & repo hygiene: a 482 MB prototype pretending to be a product
- **[HIGH] 482 MB repo / 235 MB `.git`.** ~114 MB of tracked **junk media** `.gitignore` covers none of: 364 `audit-frames*` screenshots (67 MB), 87 root `matrix-media-*.png` (23 MB), 5 root marketing `.mp4` (19 MB). ~90 MB is deleted-but-in-history and needs a filter-repo rewrite to reclaim. Every clone/CI drags it.
- **[HIGH] No CI at all** — no `.github/workflows`, nothing. vitest + `tsc` exist but are never enforced.
- **[HIGH] Deploy target is ambiguous** — Firebase + Vercel + orphaned GCP (`.gcloudignore`+`server.ts`), and **two different Firebase project IDs** (`.firebaserc` vs `firebase-applet-config.json`). Nobody can say authoritatively where this deploys.
- **[MEDIUM] Stale build artifacts committed** — `graphify-out/` (78 files, Windows paths leak the dev box), `.firebase/` CLI cache, `_regen_tmp/`, `.trash/`. `tsconfig` still lacks `"strict": true` (half the type-safety fix).

### THEME H — 🕸️ Graphs & knowledge systems: generated once, never wired in
*(Your second specific ask — both "graph" systems and the knowledge corpus.)*
- **The code-dependency graph (`graphify-out/`)** is a deterministic GraphRAG-style extractor (367 nodes / 478 edges) that ran **once on 2026-06-24 on a Windows box** and was committed as a build artifact. It's **stale** (17 current source files — all of `routes/`, `middleware/`, `engineWorker`, `qualify.ts` — are missing), its report is largely noise (~40 empty "communities," a Python comment parsed as a node), and it leaks internal structure. Its **one** useful signal — ranking `solveDSCR` the #1 god-node — correctly fingerprints the DSCR-duplication problem (Theme D), which nobody acted on.
- **The `hf-*` hyperframes** are **13 orphaned** 1920×1080 GSAP animation projects (`hf-deal`, `hf-dscr`, … `hf-tax`) referenced **nowhere** in `src/`/`index.html`, with an identity bug: **all 13** `package.json` say `"name":"hf-statelaws"` and 8/13 `meta.json` are mislabeled. 104+ files + 13 duplicated font binaries committed into the app repo for zero runtime benefit.
- **The 51-doc knowledge corpus** has **no single source of truth**: literal `(1)` duplicate files (one drifted 179 vs 176 lines), coexisting v14/v16 specs, three "Upgrade Reports," and a `Blueprint_Verification_Corrections_Log` that walks back its own fabricated citations. It is never used at runtime and materially overstates the product.

---

## 2. Consolidated top findings — ranked by business severity

The 10 that would hurt a real customer, regulator, or the business first. (Lane letter in brackets → see `docs/audit-2026-07-23/`.)

| # | Sev | Finding | Evidence | Lane |
|---|---|---|---|---|
| 1 | 🔴 CRIT | **Sales leads silently lost** — every "See If You Qualify" submission is rejected by rules and dumped to the visitor's own localStorage | `firestore.rules:57` vs `QualifyModal.tsx:1932,1944` | Memory |
| 2 | 🔴 CRIT | **No lender regulatory disclosures anywhere** (NMLS, state license, Equal Housing, ECOA, address) despite "direct lender" claims | `src/pages/*`, `LegalPage.tsx`, `index.html` | Compliance |
| 3 | 🔴 CRIT | **Concealed white-label sourcing** — programs from `caketpo.com`, "partner NEVER surfaced," while public copy says "fund in-house" (UDAAP) | `dscrPrograms.ts:1-10` | Compliance |
| 4 | 🔴 CRIT | **Borrower financials egress to `api.z.ai` by default**; endpoint is open + unauthenticated (LLM cost abuse) | `narrate.ts:12-15`, `auth.ts:38-45` | Security |
| 5 | 🔴 CRIT | **Product thesis is vaporware** — all AI/ML/forecasting capabilities have 0 implementing code; marketing/docs materially overstate | `grep src/`, `package.json`, 51 docs | Vision |
| 6 | 🔴 CRIT | **Self-contradictory identity** — "not a lender" vs "direct lender" vs SEO "for Non-QM Brokers" vs backend "broker" | `AboutPage.tsx:27` vs `index.html:32` vs `narrate.ts:40` | Content |
| 7 | 🔴 CRIT | **Underwriting math is client-side & user-editable** (not server-authoritative); flagship calculator bypasses the audited engine | `DSCRCalculatorPage.tsx:12`, 0 `fetch` in pages | Arch |
| 8 | 🟠 HIGH | **Flood-insurance unit mismatch inflates the *gating* Track-1 DSCR** | `inputs.ts:41` (monthly) vs `engine.ts:433` (÷12 as annual) | Engine |
| 9 | 🟠 HIGH | **State-law compliance map fails open** — 26 unresearched states shown green "PPP allowed"; MI shown allowed despite engine "ambiguous" | `StateLawsPage.tsx:19,53-61` | Graphs |
| 10 | 🟠 HIGH | **PA Act 6 prepay threshold wrong in engine** ($329,411; correct 2026 = $319,777); page shows the correct value → engine contradicts page | `statePppLaws.ts:30` vs `StateLawsPage.tsx:37` vs `Corrections_Log C6` | Engine/Prior |

**Next tier (High):** fail-open auth to `dev-user-id`; after-tax IRR omits mortgage-interest deduction (`taxEngine.ts:467`); IRR double-scaled 100× (`v11Runner.ts:354`); fabricated testimonials with hard stats & no disclaimer; "19 programs" vs 7 real; no CSP with 3rd-party trackers on PII pages; worker offload can hang a request forever + is non-functional on Vercel; 482 MB repo / no CI / 2 Firebase project IDs; zero tests on any financial model beyond DSCR; fake `555` phone on 14 legal disclaimers.

---

## 3. What's genuinely good (don't break these)

- ✅ **Core dual-track DSCR math is correct and golden-tested** (`engine.ts`, `decisionSupport.ts`, `engine.test.ts` 442 lines) — reproduces documented factors to <0.01.
- ✅ **Backend was properly hardened** — pino w/ secret+PII redaction, zod validation on every route, generic 5xx, 100 kb body cap, security headers, `/health`, graceful shutdown, owner-scoped Firestore rules.
- ✅ **Remediation discipline is real** — ~34/42 prior High/Critical findings closed; no regressions.
- ✅ **The 19-lender provenance matrix and 50-state law engine are substantive, sourced data assets.**
- ✅ **No hardcoded secrets committed;** `@ts-nocheck` removed from every file; frontend/engine typecheck clean.

---

## 4. Prioritized remediation roadmap

### P0 — do this week (money & legal bleeding now)
1. **Fix lead capture** — align payload↔rules (`submittedAt`), add a server-side collector, verify a test lead lands where sales can read it. *You are losing every lead right now.*
2. **Compliance disclosure sprint** — add NMLS ID, state-licensing, Equal Housing, ECOA notice, physical address, and a truthful "how loans are funded/sourced" statement to a global footer + LegalPage. Resolve the `caketpo.com` "fund in-house" contradiction with counsel.
3. **Lock down `/api/narrate`** — require Firebase auth (fail-closed), and either self-host the LLM or sign a DPA before borrower data touches `api.z.ai`; fix the invalid model id.
4. **Fix the state-law map fail-open** — drive `StateLawsPage` from `statePppLaws.ts`; mark unresearched states "not determined," never green.
5. **Fix PA Act 6 threshold** in `statePppLaws.ts` ($319,777) so engine matches page.

### P1 — this month (integrity & coherence)
6. **Finish the repositioning** — pick ONE identity, then purge residue: `index.html` SEO/OG, `narrate.ts` prompt, AboutPage vs SolutionsPage contradiction, `/brokers` remnants, the 555 phone.
7. **Make underwriting server-authoritative** — route the flagship calculator through `/api/dscr/*`; delete the inline DSCR re-implementations; unify on one `solveDSCR`.
8. **Fix the engine advisory bugs** — flood-insurance unit, after-tax IRR interest deduction, IRR scaling, waterfall cumulative; add hand-computed golden tests for tax/returns/IRR (currently zero).
9. **Reconcile the numbers** — real program count (7, not 19), one lender count, honest chart labels, disclaimed/refreshed rates.
10. **Stand up CI** — GitHub Actions running `tsc` + `vitest` on PRs; enable `tsconfig` `strict`.

### P2 — this quarter (hygiene & honesty)
11. **De-bloat the repo** — `git filter-repo` the ~114 MB junk media; `.gitignore` `audit-frames*`, `matrix-media-*`, `hf-*`, `graphify-out/`, `_regen_tmp/`, `.trash/`; move real assets to a CDN/bucket.
12. **Pick one deploy target;** unify the Firebase project IDs; delete the orphaned Vercel/GCP configs.
13. **Rationalize the docs** — archive the 51-doc corpus to a `docs/archive/`, keep one honest source-of-truth spec that describes what's *built*; either build the AI roadmap or stop citing it as existing. **Delete/annotate the 4 stale root audit docs** (their unchecked `[ ]` boxes falsely imply the platform is still full of open P0s).
14. **Decide the vision** — either invest in the ML platform the blueprints describe (a real quant+MLE hire), or rebrand honestly as "the best deterministic DSCR calculator" (which it plausibly is).

---

## 5. Lane index (full detail)

| Lane | File | Findings |
|---|---|---|
| 01 Architecture & system integrity | `docs/audit-2026-07-23/01-architecture.md` | 27 (3C/10H/10M/4L) |
| 02 Graphs & data-viz | `docs/audit-2026-07-23/02-graphs-dataviz.md` | 13 |
| 03 Memory & data systems | `docs/audit-2026-07-23/03-memory-data.md` | 12 (2C/2H…) |
| 04 Security, secrets & privacy | `docs/audit-2026-07-23/04-security.md` | 15 (2C/4H/4M/5L) |
| 05 DSCR engine correctness | `docs/audit-2026-07-23/05-engine-correctness.md` | 17 (5H/8M/4L) |
| 06 Vision vs. reality | `docs/audit-2026-07-23/06-vision-vs-reality.md` | scorecard + 6 strategic |
| 07 Content, brand & compliance | `docs/audit-2026-07-23/07-content-compliance.md` | 19 (4C/4H/6M/5L) |
| 08 Ops, hygiene & deploy | `docs/audit-2026-07-23/08-ops-hygiene.md` | 10 (4H/4M/2L) |
| 09 Prior-audit reconciliation | `docs/audit-2026-07-23/09-prior-audit-reconciliation.md` | 42 prior tracked, 5 open |

*Read-only audit — no application source was modified. This report and the lane files are the only additions.*
