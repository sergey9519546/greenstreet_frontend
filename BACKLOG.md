# Greenstreet Frontend — Backlog & Session Handoff

> Self-contained TODO for continuing in a fresh session (no prior context assumed).
> Last updated: end of the skills-validation session. All items below are **not yet
> implemented**. Verify against current code before acting — some may have moved.

## How this engine is structured (orient first)
- React + Vite + TS. Deterministic financial engine in `src/engine/` (math only, no
  LLM calls). Pages in `src/pages/`. Shared design system `src/design/dc.tsx`.
- **`src/engine/returnsEngine.ts` is the comprehensive, golden-tested source of truth**
  (cap rate, cash-on-cash, YOC, debt yield, equity multiple, levered IRR, hold matrix).
  Past bugs lived in **page-level quick recomputes that bypass the engine** — when
  adding a metric to a page, reuse the engine, don't re-derive.
- Verify any change: `npx tsc --noEmit` · `npx vitest run` · `npx vite build`.
  Preview: `claude plugin`-less — start via the preview tool (`greenstreet-portal`, port 3000).
- **Protect (do NOT regress):** `modes.test.ts` locks the flagship solved rate at
  6.125; golden tests in `engine.test.ts`/`golden.test.ts`; OBBBA 100% bonus dep
  (`taxEngine.ts`); restrained risk colors (danger #e06363/#e0635f, warn #e6b84d,
  lemon #d8d958, emerald #4dbd97 — never reintroduce #ff6b6b/#f97316).

---

## A. QUICK WINS — engine built + tested, just not surfaced (highest ROI)

> ✅ A1, A2, A3 all SHIPPED (skills-validation session, cont.). tsc clean · 220 tests ·
> `vite build` ✓ · live-verified in preview. Details on each below.

### A1. Rent-integrity / deviation-alert flag — ✅ DONE
- Engine: `src/engine/rentIntegrity.ts` → `assessRentIntegrity({leaseRent, marketRent, strProjectedRent, strDocumentedRent})` → `{leaseVsMarketPct, strDivergencePct, score, disposition (CLEAR|REVIEW|ELEVATED), flags[]}`. Tested (`rentIntegrity.test.ts`). **Used by 0 pages.**
- Do: surface on the Deal Analyzer (or a tool exposing both lease + market rent). Show a flag when stated rent is >10% over the 1007/market rent, or STR projection ≫ documented. On-brand: the behavioral "you're overestimating rent" honesty.

### A2. True Cost of Capital + choice architecture — ✅ DONE (new `src/components/TrueCostComparator.tsx`, surfaced on LenderIntelPage; borrower-quote comparator — lenders carry no points/fees so per-lender fabrication was avoided per the caution)
- Engine: `src/engine/trueCostOfCapital.ts` → `computeTrueCost` / `compareTrueCost` (all-in cost over a hold = interest + points/fees + prepay − paydown; reuses `loanOptimizer` prepay). Tested. **Used by 0 pages.**
- Do: a loan-comparison view on `RateQuizPage.tsx` or `LenderIntelPage.tsx` — rank by total cost (not rate), single "Recommended" default, cap to ≤3, "you pay $X for the lower rate" framing. CAUTION: use real per-lender rate/prepay data (lenders carry `prepayOptions`); don't fabricate fees.

### A3. NRA estate-tax note — ✅ DONE (card on NonUsInvestorsPage, after the FIRPTA block)
- Engine: `src/engine/firpta.ts` → `nraEstateTaxNote(propertyValue)` → exposed value + 40% est. tax ($60K NRA exemption). **Used by 0 pages.**
- Do: surface on `NonUsInvestorsPage.tsx` near the FIRPTA block (already wired). One small card.

---

## B. SKILLS-VALIDATION SPRINTS (continue the ultraplan)
See `00_engine/research/SKILLS_VALIDATION_ULTRAPLAN.md`. Sprint 1 (cash-on-cash) + the
negative-leverage flag are DONE. Remaining:

### B1. Sprint 2 — debt & leverage (real value) — ✅ DONE
> Engines: new `src/engine/refiProceeds.ts` (`computeRefiProceedsGap` — max new loan =
> min(LTV, DSCR) + binding-constraint label + proceeds gap/cash-out) and
> `src/engine/covenantCheck.ts` (`assessDscrCovenant` maintenance test +
> `assessDayOneVsStabilized` lease-up flag). 10 new tests (230 total). Surfaced in a new
> "Refinance at maturity" section on `RefiTrackerPage.tsx` (proceeds-gap band + 3 flags).
> tsc clean. NOTE: `vite build` blocked this session by host commit-memory exhaustion
> (tailwind-oxide Rust abort) — env, not code; verify build after a session restart.
- **Refi-proceeds-gap** (cre-capital-markets skill): at maturity/ARM reset, can the
  property refi enough to retire the existing balance? max new loan (cash-out LTV cap
  AND DSCR-constrained) vs current balance → gap = cash needed to close. Surface on
  `RefiTrackerPage.tsx` (it has currentBalance, value, rent; engine `analyzeRefi`).
- **Binding-constraint label** (debt-tool): on the max-loan path, state "LTV-constrained
  vs DSCR-constrained" (the 2nd-lien engine already does this — mirror it).
- **Day-one vs stabilized DSCR** flag (lease-up/vacant risk) — flag day-one < 1.10x.
- **DSCR-covenant breach** warning (covenant-analysis skill: maintenance test).

### B2. Sprint 3 — credit risk (likely low-yield)
- Validate `engine.ts` `ficoAdjustment` bands + default-prob-by-DSCR-tier vs
  credit-scoring-models / rating-methodologies. NOTE: Altman-Z/Merton are corporate;
  expect mostly "validated, no change."

### B3. Sprint 4 — compliance
- Re-run `firebase-security-rules-auditor` on `firestore.rules` after this session's
  changes (low-yield, already hardened in commit 7f39e21).
- Check the lead-capture flow (`QualifyModal`/`QualifyWidget` → Firestore `leads`) for
  KYC/source-of-funds expectations (anti-money-laundering / operations:kyc skills).

### B4. Sprint 5 — code quality
- `vercel-react-best-practices` perf pass: the new `HeroProof` GSAP timeline + page
  re-renders / memoization (esp. heavy pages). Likely real wins.
- `vitest` coverage gaps on new modules: leverageCheck (done), secondLien, rentIntegrity,
  insuranceEstimate, trueCostOfCapital.
- ✅ Coverage added for 6 previously-untested engines (branch `test/engine-coverage-b4`,
  +41 tests → 271 total): firpta, taxEngine (OBBBA lock), decisionSupport.computeReturnGrade,
  sensitivity (golden values), portfolio (+health score), reserveEngine.
- ✅ Coverage added for 5 more engines (+43 tests → 314 total): qualify, armResetEngine,
  loanOptimizer (prepay schedule/exit-cost/remaining-balance), monteCarloRatePath
  (seed reproducibility), refiTracker (4-factor readiness). tsc clean · vite build ✓.
- ✅ Coverage added for the final 4 untested engines (+39 tests → 353 total): strUnderwriting
  (legality gate CLEAR/UNCERTAIN/PROHIBITED, 3-world haircuts 20%/10%, MIN-governs selection,
  monthly seasonality), reassessmentEngine (state rules, reassessed-tax + DSCR impact),
  lenderMatchScore (weight sum, ranking/tiers, top-3), irrWaterfall (16 Year-1 stages,
  hold-total/exit blocks). tsc clean. **B4 engine-coverage COMPLETE — every engine now has tests.**

---

## C. PRODUCT BACKLOG (net-new or low-priority)

> Backlog reconciled 2026-07-04 (daily-fix run): several items below were already
> shipped in-tree ahead of these notes — struck through with the verifying location.

- **Construction/bridge DSCR** — net-new product calculator (`IMPROVE_CONSTRUCTION_BRIDGE_DSCR.md`).
  ENGINE DONE: `src/engine/constructionBridge.ts` (`computeConstructionBridge` — LTC,
  peak IO carry, interest-reserve on 50% avg draw, stabilized exit DSCR + takeout-retires
  test → VIABLE/TIGHT/SHORTFALL). Tested (6). **UI still open — used by 0 pages.**
- **Commercial DSCR** (NOI ÷ annual P&I) + NOI-sanity-check for 5+ unit (debt-tool / underwriting-deep-dive). We use Rent/PITIA for all; 5+ unit convention differs.
  ENGINE DONE: `src/engine/commercialDscr.ts` (`computeCommercialDscr` — EGI/NOI, DSCR vs
  1.25 floor, PASS/MARGINAL/FAIL, expense-ratio + <30% understated-opex flag). Tested (6).
  **UI still open — used by 0 pages.**
- **Lender-rule toggles** on `DSCRCalculatorPage.tsx`: IO=ITIA, lesser-of(market,lease),
  ARM note-vs-fully-indexed qualifying rate. Engine has `calculateIOPayment` +
  `computeLenderStressRate`; only Kiavi 110% is surfaced so far. PARTIAL: lender rows
  now DSCR-tier-gated + "your tier" badge; self-consistent max-price (tax/ins scale with
  solved price); HOA input (commit this session). IO/lesser-of/ARM-qual toggles still open.
- **TCO threshold-conversion table** (1.25 std ≈ 0.90 TCO) — small explainer.
  ENGINE DONE: `src/engine/tcoThreshold.ts` (`stdToTco`/`tcoToStd`/`tcoThresholdTable`,
  `DEFAULT_RESERVE_LOAD` 0.3889 reproduces the 1.25→0.90 anchor). Tested (5). **UI explainer still open.**
- ~~**Portfolio health-score**~~ ✅ DONE — 0–100 rollup surfaced on `PortfolioPage.tsx:286-318`
  with DSCR/concentration/cash-flow/reserve breakdown + colored bar. Engine tested (B4).
- ~~**DecisionSupport CoC fix**~~ ✅ DONE — `DecisionSupportPage.tsx:119` already adds
  `purchasePrice * 0.03` closing costs; matches Deal Analyzer (`DealAnalyzerPage.tsx:58`).
- ~~**Recession scenario cards**~~ ✅ DONE — StressMatrix `PRESETS` already carries
  `covid` (COVID-style shock) + `fl_ins` (FL insurance crisis) alongside the 2008 preset
  (`StressMatrixPage.tsx:89-97`).
- **Remaining pricing LLPA adjusters** (low value): loan-size (<$75K / >$1.5M), blanket,
  vacant-at-closing, TX 50(a)(6) cash-out. Each needs a field `estimateRate` doesn't
  carry (signature change). Keep flagship `modes.test` 6.125 lock intact (the adjuster
  must be 0 for the EXPERIENCED + open-prepay default profile).

---

## D. SCOPE-OUT (deferred by design — needs data feeds / platform / external; not "todo")
- **Data feeds:** live rent (RentCast/ZORI), insurance (HazardHub), FEMA flood, county
  tax (ATTOM), MBS spreads. Engine has static fallbacks (state insurance table, per-state
  tax) — the APIs are a canonical-platform project.
- **Community intelligence / social proof** (needs aggregated user data + GLBA/FCRA).
- **Reserve tracking / cash-out purpose tagging / auto-escrow** (bank-account linking).
- **Accuracy dashboard / post-close DSCR variance** (needs lender outcome data).
- **HOA auto-estimate** — no good static model (HouseCanary/MLS only).
- **FN entity-formation integration, multilingual onboarding.**
- **External devops:** CI/CD (GitHub Actions), monitoring (Sentry), rate-limiter → Redis.
- **Content decisions (deferred by owner):** ~89 fabricated home logos/testimonials in
  `index.html` (owner said leave); lender count 11-vs-13; trust band.

---

## Done this session (context — don't redo)
7-doc reconciliation (Phases 0–5: TCO-DSCR replace, regime-switching Monte Carlo,
FN/FIRPTA, loss-framing, multi-shock waterfall, break-even vacancy, dual-track flag);
corpus mining (insurance auto-estimate, pricing LLPA reconcile, 2nd-lien/HELOC engine
+ surfaced, rent-integrity engine); skill-driven fixes (firestore userId-reassignment,
AML/KYC ×4 FN-engine, overstated cap rate ×2 Deal-Analyzer+Calculator, negative-leverage
flag); HeroProof redesign (dual-track gauge); cash-on-cash on Deal Analyzer.
~22 commits, 220 tests. Skills installed under `~/.claude/skills/` (RIDGE suite,
finance suite, cre-underwriting/financing/capital-markets, AML/KYC, cookbooks
creating-financial-models).
