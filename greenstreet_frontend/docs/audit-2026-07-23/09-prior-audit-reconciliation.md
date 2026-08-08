# 09 — Prior-Audit Reconciliation (the TIME dimension)

**Lane:** Audit-reconciliation specialist — "what was already known, and was it ever fixed?"
**Repo:** `/home/user/greenstreet_frontend`
**Reconciliation date:** 2026-07-23
**Method:** Read all 4 root audit docs + 2 docs-corpus docs → extract distinct findings → verify each HIGH/CRITICAL against current code (Read/Grep) → cross-check `git log`.

---

## HEADLINE

> **~42 distinct HIGH/CRITICAL prior findings. 5 still open (1 fully-open compliance-data bug + 4 hardening/architecture gaps), 3 partial. The other ~34 are genuinely FIXED.**
> Separately, **8 aspirational "engine-math architectural debts"** (R-vine copula, CECL, conformal intervals, …) remain unbuilt — but those were roadmap items, never regressions.

**This is the opposite of audit theater.** The four audits (dated 2026-06-23/24) drove a real remediation wave: content/routing/design fixes landed 2026-06-25/26, and a large backend-hardening + test-coverage pass landed 2026-07-15. The prior findings were overwhelmingly *closed*, not ignored.

**The single most important survivor:** a compliance-data defect the Blueprint explicitly corrected (PA Act 6 prepay threshold) was applied to the marketing page but **NOT to the engine** — the engine still gates on the wrong number, and now the engine and the page contradict each other. See B-1 below. Hand this to the engine-correctness / content-compliance lanes.

**Process-health smell that remains:** all four audit docs + `QA_FIXPLAN.md` were left in the repo with their checkboxes still unchecked (`[ ]`) even though the work is done. Anyone reading the repo today would wrongly conclude the platform is still full of open P0s. The *code* was remediated; the *paper trail* was not closed.

---

## (A) Consolidated prior-findings register

Sources: `FS` = FULL_STACK_AUDIT.md (2026-06-23) · `QD` = QA_REPORT_DEFINITIVE_2026-06-24.md · `UR` = ULTRA_REVIEW_2026-06-24.md · `FP` = QA_FIXPLAN.md (2026-06-23) · `BP` = DSCR_Blueprint_Verification_Corrections_Log.md (2026-06-18) · `AD` = dscr_sovereign_os_architectural_debt_and_math.md (2026-06-18).
Status verified against current code with file:line evidence.

### A.1 — Code-correctness / crash bugs (CRITICAL)

| # | Finding | Source | Sev | Status | Evidence (current code) |
|---|---|---|---|---|---|
| 1 | No error boundary → any page throw whites-out whole app | FP V1 | 🔴 | **FIXED** | `src/App.tsx:78` `class ErrorBoundary`, wraps render at `:390` |
| 2 | `/blog` + `/blog/<slug>` white-screen (`onNavigate` undefined) | FP V2, UR | 🔴 | **FIXED** | `BlogPage.tsx:949` comment "onNavigate crash fixed by threading it to every sub-component"; `BlogIndex`/`PostDetail` take `onNavigate` prop |
| 3 | `/tools/portfolio` (+returns) render blank/crash | FP V3 | 🔴 | **FIXED** | PortfolioPage present; typechecks clean (lint over `src/pages` = 0 errors) |
| 4 | DecisionSupport TDZ: `result?.afterTaxIRR` self-ref → always 0 | QD 2.7 | 🔴 | **FIXED** | `DecisionSupportPage.tsx:124-125` explicit "TDZ FIX: use the locally-computed value, not result?.afterTaxIRR" |
| 5 | TaxEngine hardcoded `(1/100)*loanAmount` cost basis | QD 2.8 | 🔴 | **FIXED** | `TaxEnginePage.tsx:72` now `(exitPppPct/100)*loanAmount` (user input) |
| 6 | STRUnderwriting arg-order mismatch to engine | QD 2.9 | 🟠 | **FIXED (likely)** | typechecks clean with `@ts-nocheck` removed |
| 7 | Routing round-trip broken (tool routes missing from `resolveRoute`) | FP P1.1 | 🔴 | **FIXED** | `router/resolve.ts:4-8` PageView union + `:54-57` ROUTE_MAP entries for dscr-calculator/lender-intel/state-laws/deal-analyzer |
| 8 | Clean audience routes (`/brokers`,`/investors`,`/borrower-profiles`) fall through to homepage | FP V4 | 🔴 | **FIXED** | `router/resolve.ts:50` etc. now in ROUTE_MAP |

### A.2 — Security / backend (CRITICAL — FS scored Security 2/10)

| # | Finding | Source | Sev | Status | Evidence |
|---|---|---|---|---|---|
| 9 | No auth on `/api/*` endpoints | FS 3.1 | 🔴 | **FIXED** | `src/serverApp.ts:30` `app.use(verifyFirebaseToken)` |
| 10 | No rate limiting | FS 3.2 | 🔴 | **FIXED** | `serverApp.ts:67` `narrateLimiter`, `:74` `apiLimiter`, mounted `:90-91`; dep `express-rate-limit` in package.json |
| 11 | No CORS | FS 3.3 | 🔴 | **FIXED** | `serverApp.ts:18` `cors({...})`; dep `cors` added |
| 12 | No input validation → `NaN` propagation | FS 3.4, FS exec | 🔴 | **FIXED** | `src/routes/schemas.ts` (zod); `serverApp.ts:27` `express.json({limit:"100kb"})`; dep `zod` added |
| 13 | No error-handling middleware | FS 3.5 | 🟠 | **FIXED** | `serverApp.ts:94` `app.use(errorHandler)` |
| 14 | No Firestore security rules | FS 3.6 | 🔴 | **FIXED** | `firestore.rules` present: `isOwner()`, `isValidEmail()`, per-user match, hard-delete denied |
| 15 | No security headers (helmet) | FS 4.6 | 🟠 | **FIXED** | `serverApp.ts:50-60` sets X-Content-Type-Options, X-Frame-Options DENY, HSTS, Referrer-Policy, Permissions-Policy (manual, no helmet dep) |
| 16 | No health check / graceful shutdown / env-validation / request logging | FS 3.8/5.1/5.2/5.3 | 🟠 | **FIXED** | `serverApp.ts:82` `/health`; `server.ts:44-58` SIGTERM/SIGINT; `server.ts:11-17` REQUIRED_ENV loop; `pino` logger wired |
| 17 | ComplianceDashboard fake NMLS `123456` / "Capital Mortgage Group" on live disclaimer (TILA/Reg Z) | UR P0.5, QD 2.1 | 🔴 | **FIXED** | `ComplianceDashboard.tsx:293` `brokerName:"" nmls:""`; disclaimer no longer contains "NMLS#123456" |
| 18 | Blog subscribe form swallows emails (`preventDefault`, no capture) | UR P0.6 | 🔴 | **FIXED** | subscribe form removed entirely (no "Subscribe"/newsletter in `src/pages`) |
| 19 | ComplianceDashboard `/api/dscr/*` 404 (no server) | QD 2.1 | 🔴 | **FIXED** | real `/api/dscr` router mounted `serverApp.ts:90` → `routes/dscr.ts` |
| 20 | CDN scripts have no SRI `integrity` hashes; jQuery 3.5.1 | FS 2.4, QD 4.5 | 🟠 | **STILL OPEN** | `index.html`: only 1 `integrity=` present; `jquery-3.5.1` still referenced |
| 21 | API keys exposed / `@anthropic-ai/sdk` in client deps | FS exec, FS 2.7 | 🔴 | **PARTIAL** | `@anthropic-ai/sdk` still in `dependencies` (package.json:16); Firebase web apiKey committed in `firebase-applet-config.json` (expected-public for Firebase, low risk); Anthropic token is server-side only |

### A.3 — Config / brand / cruft (CRITICAL–HIGH)

| # | Finding | Source | Sev | Status | Evidence |
|---|---|---|---|---|---|
| 22 | `.firebaserc` empty `{}` → deploy fails | QD 2.3 | 🔴 | **FIXED** | now `{"projects":{"default":"gen-lang-client-0809198072"}}` |
| 23 | `firebase-applet-config.json` name "Greenboard SEC FINRA Compliance Platform" | QD 2.4, QD | 🔴 | **FIXED** | now "Greenstreet DSCR Loan Engine" |
| 24 | External route → `trust.greenboard.com` (wrong product domain) | QD 4.3 | 🔴 | **FIXED** | `App.tsx:379` → `https://www.greenstreet.com` |
| 25 | Three different domains (greenstreet.com / greenstreet.capital / none) | UR P0.3 | 🔴 | **FIXED (minor nuance)** | robots.txt + index.html og/twitter all `greenstreet.com`; `App.tsx` uses `www.greenstreet.com` (apex-vs-www nit); residual `greenboard` strings are CSS-source-slug comments only |
| 26 | `extract.cjs` hardcoded `C:\Users\serge\...` path | QD 2.2 | 🔴 | **FIXED** | file deleted |
| 27 | `deployed-index.html` vs `index.html` conflict; greenboard CDN CSS | UR P0.1/P0.2 | 🔴 | **FIXED** | `deployed-index.html`, `marketing-page.html`, `marketingBody.html` all deleted; single `index.html` |
| 28 | `dataconnect-generated` = movie-review schema, not DSCR | QD 3.7 | 🔴 | **FIXED** | `src/dataconnect-generated/` deleted |
| 29 | Cruft: greenboard.zip, fix-*.cjs, tmp.py, temp.html, pglite-debug.log, *.bak2 | QD 3.8/3.10, UR P2 | 🟠 | **FIXED** | all deleted (verified absent) |
| 30 | `package.json` name "react-example"; vite duped in deps+devDeps | QD 3.5, FS 2.6 | 🟠 | **FIXED** | name "greenstreet-dscr-engine"; `vite` appears once (devDeps) |
| 31 | MarketingSite `className=` inside raw HTML → Webflow CSS doesn't apply | QD 2.5, FS 1.3/2.3 (top-3 in all 3 big audits) | 🔴 | **FIXED (by removal)** | `MarketingSite.tsx` deleted; no `dangerouslySetInnerHTML` anywhere in `src/`; marketing is now static `index.html` |

### A.4 — Data / lender / compliance accuracy (CRITICAL for a lending product)

| # | Finding | Source | Sev | Status | Evidence |
|---|---|---|---|---|---|
| 32 | Kiavi minDSCR wrong (0.8 → should be 1.10) | FP #11 | 🟠 | **FIXED** | `engine/lenders.ts:184` `minDSCR: dp(1.1, …'1.1 DSCR to prequalify; do not assume lower')` (the file it was in, `dscrData.ts`, was deleted) |
| 33 | Lender count drift: 11 vs 17 vs 19 vs 30+ vs 7 | QD 2.6, UR, FP #11 | 🟠 | **FIXED** | `LenderIntelPage.tsx:57,114-115` computes `total`/`matchCount` from `DSCR_PROGRAMS` (16 programs in `src/data/dscrPrograms.ts`); no hardcoded "30+" in pages |
| 34 | Griffin "$20M" / Visio "$5M" page claims vs engine caps | QD 2.6 | 🟠 | **FIXED** | no `Griffin`/`Visio`/`$20M`/`30+` lender claims remain in `src/pages` (BrokersPage repurposed to investor page) |
| 35 | Insula Capital + UWM cited as lenders but not in engine | QD 2.6, FP #11 (D2) | 🟠 | **FIXED** | no `Insula`/`UWM` anywhere in `src/` |
| 36 | Golden example inconsistent: 1.11x (calc) vs 1.13x (marketing) | FP #14 (D1) | 🟠 | **FIXED** | standardized to **1.11x** everywhere (CaseStudies:104, Investors:260, Products:39); 1.13x only survives as a *different* worked scenario in BlogPage:615 (0.92→1.13 by cutting PITIA) |
| **B-1** | **PA Act 6 prepay threshold: engine uses $329,411; Blueprint corrected 2026 value to $319,777** | **BP C6** | 🔴 | **STILL OPEN + CONTRADICTION** | `engine/statePppLaws.ts:30` `const PA_PPP_THRESHOLD_2026 = 329_411;` (drives the gating logic at `:1441`). Blueprint C6 (primary-source, Arch Home Loans 2026): correct 2026 value is **$319,777**; $329,411 was the wrong figure. `StateLawsPage.tsx:37` displays "$319,777 (2026)" — page and engine now contradict each other. |
| 37 | OH prepay citation ORC §1343.01 → §1343.011; threshold $116,356 | BP C7 | 🟠 | **FIXED** | `statePppLaws.ts:140` "Ohio Rev. Code § 1343.011"; `:31` `OH_PPP_THRESHOLD_2026 = 116_356` |
| 38 | Fake/composite testimonials + case studies published as real (FTC §5 / Reg Z) | UR copy audit | 🟠 | **FIXED** | `CaseStudiesPage.tsx:21` "Illustrative composite quote — not attributed to a verified named individual"; `:1050` "Company names are representative examples, not verified named" |
| 39 | "Rated #1 DSCR Pricing Engine" unattributed (false advertising) | UR copy audit | 🟠 | **FIXED** | not present in `index.html` |

### A.5 — TypeScript / testing / architecture (HIGH)

| # | Finding | Source | Sev | Status | Evidence |
|---|---|---|---|---|---|
| 40 | `tsconfig` no `strict`; every page `// @ts-nocheck` | QD 3.4, FS | 🟠 | **PARTIAL** | `@ts-nocheck` removed from **all** files (0 occurrences); `src/pages`+`src/engine` typecheck **clean**. BUT `tsconfig.json` still has **no `"strict": true`** |
| 41 | No tests (engine "69 golden tests" only in comments) | QD 3, FS 4.3 | 🟠 | **PARTIAL** | real vitest suites now exist: `engine/engine.test.ts` (442 lines, `toBeCloseTo` golden values), `engine/modes.test.ts`; `test` script = `vitest run`. Still **no** API-integration/E2E tests |
| 42 | No React Router (hand-rolled `switch(view)`) | FS 2.1, QD 4.1 | 🟠 | **OPEN (by choice)** | `App.tsx:123,309` still `switch(view)`. Architecture preference, not a defect; click-interceptor router works |
| 43 | No code-splitting / `React.lazy` | FS 2.2 | 🟠 | **FIXED** | git commits `7a22bdd` "idle-prefetch all chunks + null Suspense fallback", lazy routes wired |
| 44 | No component library (hand-rolled everything) | FS 1.1 | 🟢 | **OPEN (by choice)** | custom design system `src/design/dc.tsx` + `SiteShell.tsx` adopted instead of shadcn |
| 45 | Orphan dead code (wf.tsx, loanMath.ts, 4×ComplianceTab, DSCRCalculatorSection) | QD 3.1-3.3, 3.15 | 🟢 | **MOSTLY FIXED** | `loanMath.ts`, 4 ComplianceTabs, DSCRCalculatorSection **deleted**; `src/components/wf.tsx` **still present** (lone orphan) |
| 46 | Placeholder phone `+1 (555) 010-0000` with TODO remnant | UR FAQ | 🟢 | **PARTIAL** | TODO removed, but the fake 555 number remains on **~10 pages'** legal disclaimers (ComplianceDashboard:268, PortfolioPage:687, FAQPage:551, StressMatrixPage, STRUnderwritingPage, AboutPage:885, MonteCarloPage:615, RateQuizPage:1339) |

### A.6 — Aspirational engine-math "architectural debts" (roadmap, not regressions)

`AD` (dscr_sovereign_os_architectural_debt_and_math.md) is a **vision doc**, not a bug list. Its 8 "debts" describe institutional math the engine *should* grow into. All 8 are **still open by design** — they were never claimed-fixed and are not defects. Flagging the two highest-value ones for the engine-correctness lane:

| Debt | Description | Status | Note |
|---|---|---|---|
| AD-1 | DSCR is a point PASS/FAIL, not a distribution (no conformal intervals) | Open (roadmap) | Doc concedes current engine outputs a point estimate; high-value but not a regression |
| AD-2 | Monte Carlo assumes stationary t-copula correlations (no R-vine tail dependence) | Open (roadmap) | Doc states the engine *currently has* a t-copula MC → confirms a real MC exists |
| AD-3..8 | CECL PD/LGD/EAD, LLM hallucination firewall, evidence-vault versioning, Nelson-Siegel rate surface, EVT tails, contagion graph | Open (roadmap) | AD-7 (LLM number-verification firewall) is worth flagging to security lane |

---

## (B) Still-open HIGH-severity items (the payload of this lane)

Ordered by value. Everything here was **known before** and is **still live**.

1. **[COMPLIANCE-DATA — highest value] PA Act 6 prepay threshold is wrong in the engine.**
   `src/engine/statePppLaws.ts:30` → `PA_PPP_THRESHOLD_2026 = 329_411`. The Blueprint's own correction **C6** (primary-source verified, 2026-06-18) says the correct 2026 value is **$319,777** and that **$329,411 was the erroneous figure**. The engine has it exactly inverted (calls $319,777 "previous"). The gating logic at `:1441-1451` uses `329_411`, so **PA 1–2-unit loans between $319,777 and $329,411 get the wrong prepay-penalty determination** (flagged prohibited when they should be permitted). Worse, `StateLawsPage.tsx:37` displays the *correct* $319,777, so the **engine and the marketing page now contradict each other**. OH's twin correction (C7) *was* applied; PA was missed. → engine-correctness + content-compliance lanes.

2. **[SECURITY] CDN scripts still lack SRI integrity hashes; jQuery pinned to 3.5.1.**
   `index.html` has a single `integrity=` and still loads `jquery-3.5.1`. Flagged identically by FS 2.4 and QD 4.5 a month ago. A CDN compromise runs arbitrary JS on the marketing origin. → security/ops lane.

3. **[TYPE-SAFETY] `tsconfig.json` still has no `"strict": true`.**
   The team did the hard part — removed `@ts-nocheck` from every file and the frontend/engine now typecheck clean — but stopped short of enabling `strict`, so `noImplicitAny`/null-safety regressions can silently re-enter. Half the fix (QD 3.4). → ops-hygiene lane.

4. **[DEP-HYGIENE] `@anthropic-ai/sdk` still in `dependencies`.**
   FS 2.7. Low real risk (server build uses `--packages=external`), but it keeps a server SDK in the client dependency graph. → ops-hygiene lane.

5. **[TRUST/POLISH] Fake `+1 (555) 010-0000` phone on ~10 pages' compliance disclaimers.**
   A 555 placeholder sitting on "not a commitment to lend" legal text is a credibility/consistency issue on customer-facing disclaimers. Partial fix (TODO removed, number kept). → content-compliance lane.

Minor lingering: `src/components/wf.tsx` orphan (A.5 #45); apex-vs-www domain nit ($greenstreet.com$ vs $www.greenstreet.com$, A.3 #25); no API/E2E tests (A.5 #41).

---

## (C) Contradictions between prior audits, and regressions

**Disagreements the audits documented (about the app's own inconsistencies):**
- **Severity disagreement, self-flagged:** `QA_FIXPLAN` rated the Blog white-screen 🟢 low from static analysis, then its own Round-2 live QA (V2) re-rated it **🔴 CRITICAL** ("Static plan rated this 🟢; rendered it's CRITICAL"). Good example of static-vs-runtime divergence. (Now moot — fixed.)
- **Lender count:** the app carried 11 (pages) vs 17 (`dscrData.ts`) vs 19 (`engine/lenders.ts`) vs "30+" (BrokersPage) vs "7 programs" (FAQ) simultaneously; FS/QD/UR each cite different subsets. Resolved by making the count dynamic.
- **Golden example:** 1.11x (calculator) vs 1.13x (marketing/blog) — `FP` D1. Resolved to 1.11x.
- **Live contradiction that survives:** **Blueprint C6 ($319,777) vs `engine/statePppLaws.ts` ($329,411) vs `StateLawsPage.tsx` ($319,777)** — the correction doc and the display page agree; the engine disagrees. This is B-1 and is the one that still matters.

**Regressions (fixed-then-broke):** none found. The trajectory is monotonic — I found no item that a prior audit marked fixed that has since regressed. The concern is the reverse (things fixed in code but still shown as open in the stale docs).

**Audit-process health assessment:**
- **Volume smell is real but benign here.** Four overlapping audits + a fixplan in a 2-day window (2026-06-23/24) *looks* like audit theater. It wasn't: `git log` shows a dense remediation wave 2026-06-25/26 (content/routing/design merge PRs) and a major hardening pass 2026-07-15 (`4ab2345` — "test coverage… leads route with rate limiting… SeoHead… webVitals… sitemap/robots"). ~34 of ~42 high/critical findings are closed. **Findings-closed rate is high, not low.**
- **The docs are stale and were never closed out.** All four audit docs still sit at repo root dated 2026-06-24, and `QA_FIXPLAN.md`'s checkboxes are still `[ ]` unchecked despite the work being done. The three "Open decisions" (D1 golden example, D2 lender set, D3 trust band) were in fact decided (1.11x, hard-remove Insula/UWM, composite disclaimers) but the doc doesn't record it. **Net effect: a reader today would over-estimate open risk.** Recommend archiving/annotating these docs or deleting them — leaving 125KB of "prototype-grade, Security 2/10" audit prose in the repo root is itself a hygiene/impression problem now that most of it is false.
- **One real closure gap slipped through the cracks:** the PA Act 6 correction (B-1) was applied to the page but not the engine — a classic "fixed the visible copy, missed the source of truth" miss. Everything else in the Blueprint corrections spot-checked as applied (OH §1343.011, Kiavi 660 FICO, Angel Oak 720/STR).

---

## Appendix — verification method / evidence trail

- `git log` dates: audits 2026-06-23/24 → fixes 2026-06-25/26 (13 commits: repositioning, unification) → 2026-07-15 `4ab2345` (backend + tests). Today 2026-07-23.
- Lint: `npm run lint` (tsc --noEmit) exits 2, but **every error is a module-resolution error** (`Cannot find module 'zod'/'express'`, `Cannot find name 'process'`) because **node_modules is not installed** in this checkout — not a code defect. Zero errors originate in `src/pages`, `src/components`, or `src/engine`. With deps installed these resolve.
- Deleted-cruft confirmed absent: extract.cjs, fix-{safescript,ts,ts2}.cjs, greenboard-sec-finra-compliance-platform.zip, marketing-page.html.bak2, tmp.py, temp.html, pglite-debug.log, marketingBody.html, deployed-index.html, marketing-page.html, src/dscrData.ts, src/dataconnect-generated/, src/lib/loanMath.ts, 4×ComplianceTab, DSCRCalculatorSection.tsx, MarketingSite.tsx.
- Still present: `src/components/wf.tsx` (orphan), `firebase-applet-config.json` (rebranded, carries public Firebase web keys), all 4 audit docs + QA_FIXPLAN.md (stale, unchecked).
