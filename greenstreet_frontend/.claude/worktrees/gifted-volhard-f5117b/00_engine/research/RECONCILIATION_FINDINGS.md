# DSCR Engine ↔ Research-Docs Reconciliation Findings

**Date:** 2026-06-28
**Scope:** Compare the live engine (`greenstreet_frontend/src/engine`) against 7 research docs
(behavioral finance, FN/ITIN, TCO-DSCR, Monte-Carlo calibration, edge-case shock math,
underwriting formula deep-dive). Verdicts: `MATCH` · `OURS-BETTER` · `DOC-GAP` · `NEW`.

**Headline:** the engine is materially **more complete and more current** than the docs assume.
~90 exported functions cover most doc proposals; several beat the doc. Genuine build list is short.

---

## 🟢 OURS-BETTER / already present — PROTECT, do not regress or rebuild

| # | Capability | Evidence | Doc | Verdict |
|---|---|---|---|---|
| 1 | Bonus depreciation | `taxEngine.ts:35-51` OBBBA 100% permanent (post-2025-01-19) + phase-down | TCJA 60/40/20, no OBBBA (TCO §7.2) | **OURS-BETTER** (doc stale) |
| 2 | STR haircut | `strUnderwriting.ts:30-37` 20% projection + 10% documented + month seasonality | flat 0.80 (Underwriting §5.2) | **OURS-BETTER** |
| 3 | Tax reassessment | `reassessmentEngine.ts` price-based per-state, CA Prop 13 + supplemental, TX market, FL reset | blunt multipliers (MC §3) | **OURS-BETTER** |
| 4 | After-tax / cost-seg / §1250 recapture / passive-loss / NIIT | `taxEngine.ts` `computeDepreciationSchedule`/`assessCostSegViability`/`computeRecaptureOnSale`/`computePassiveLossAllowance`/`computeAfterTaxIRR` | after-tax TCO, cost-seg, recapture (TCO §7) | **MATCH+** (reuse in Phase 2) |
| 5 | Hold-period total return | `returnsEngine.computeHoldMatrix` exit value, remaining bal, prepay-at-exit, XIRR, equity-multiple | total cost/return over holds (Behavioral §6) | **MATCH** (reuse Phase 3) |
| 6 | Compensating-factor / path-to-qualify | `loanOptimizer.rescueTrack1/rescueTrack2/generateStructureOptions` | recovery factors (Edge §8) | **MATCH** |
| 7 | Prepay break-even / exit cost | `loanOptimizer.computePrepayExitCost/computePrepaySchedule` + `statePppLaws.ts` | prepay break-even (Behavioral §6) | **MATCH** |
| 8 | Portfolio resilience | `portfolio.ts` lender conc >50%, geo conc >40%, blanket warning, ΣNOI/ΣDS (never averaged) | concentration alerts (Behavioral §8) | **MATCH** |
| 9 | Lender qualifying-rent rules | `lenders.computeQualifyingRentForLender` lesser-of(lease,market), per-lender STR haircut, documented half-haircut, MTR 0.88, 2-4u ×0.95 | lesser-of, STR, per-lender (Underwriting §5) | **MATCH** (only Kiavi-110% missing) |
| 10 | IO=ITIA + ARM stress-rate | `engine.calculateIOPayment`, `armResetEngine.computeLenderStressRate`, `sensitivity` IO break-even (`ioPayment` line 780) | IO=ITIA, ARM qual-rate (Underwriting §3/§8) | **MATCH** (Calculator surfacing only) |
| 11 | Max loan / required rent at target DSCR | `engine.solveMaxPurchasePrice/solveMinDownPayment/solveRequiredRent` | inverse-DSCR (Underwriting §6) | **MATCH** |
| 12 | ARM reset / IO recast / IO+ARM double-shock / lifetime cap | `armResetEngine.ts` (`computeARMReset`, `findDSCRBreakYear`, `computeRefiTriggerRate`) | reset DSCR, ARM preview (Underwriting §3) | **OURS-BETTER** (double-shock) |
| 13 | Dual-track + break-even vacancy + "Qualifies but Dangerous" | `stressMatrix.computeDualTrackDSCR/computeBreakEvenVacancy` (shipped 3 tools) | DSCR_L↔DSCR_E | **OURS-AHEAD** |
| 14 | Sensitivity break-evens + tornado + combined/joint/heatmap | `sensitivity.ts` rent/price/LTV/rate break-evens, `computeCombinedStressMatrix/JointAppraisalRisk/Heatmap` | sensitivity tables (Edge App. A) | **MATCH** (values validated below) |
| 15 | FN reserve awareness | `isNonUsInvestor` + reserve `+6mo` overlay (`lenders.ts`) | FN reserves stringent (FN doc) | **MATCH** (Phase 5 extends) |
| 16 | Insurance / BRRRR gates | `v11Runner.checkInsuranceGate/checkBRRRRSeasoningGate` | insurance gate | **MATCH** |
| 17 | DSCR rounding | Calculator/`classifyRiskZone` raw `dscr >=`; `toFixed(2)` display-only | never round 0.99→1.0 (Underwriting §4.5) | **MATCH** (no round-up) |

### Phase-0 numeric validations
- **Rate break-even:** `solveDealBreakRate` solves rate where rent/PITIA=1.0 — same as doc's canonical 7.88% for $300K/$2800/$350/$200. **MATCH.**
- **Rent break-even:** `computeBreakevenResult.rentBreakeven.for1_0 = PITIA` — doc rent-BE = $2546 = PITIA. **MATCH.**
- **IO break-even:** `sensitivity.ts:780` `ioPayment = loan × rate/12`, `dscrWithIO` — IO=ITIA confirmed. **MATCH.**
- **FL effective tax:** ours 0.89% (FL DOR non-homestead avg) vs doc 1.8% (Miami high-millage example). Both valid; ours = state avg, defensible. Calculator already applies per-state `effTaxRate` at purchase-year reset. **OURS-OK.**

---

## 🔴 Genuine gaps — the build list

| # | Gap | Evidence | Doc | Phase |
|---|---|---|---|---|
| G1 | Track 2 omits **CapEx** + low maintenance | flat 21% (vac8+mgmt8+maint5), 4 sites: `stressMatrix` (`computeDualTrackDSCR`+`computeStressMatrix`), `monteCarlo.ts:58-60`, `portfolio.ts:48-55` | TCO 28% SFR by type/age/market (TCO §6,§8) | **2** |
| G2 | Monte Carlo crude (flat, no regime, no correlation) | `monteCarlo.ts`, Vasicek (`monteCarloRatePath.ts`) | regime-switch + 6×6 corr + CIR (MC doc) | **4** |
| G3 | Insurance flat 8% all states | `monteCarlo.ts:70` | state 3-state regime (MC §4) | **4** |
| G4 | No loss-framed $ scenarios | absent from deal tools | "rent −5% → −$73/mo → $876/yr" (Behavioral §3) | **1** |
| G5 | No multi-shock waterfall viz | combined 2D matrix exists; sequential decomposition does not | DSCR-destruction waterfall (Edge §7) | **1** |
| G6 | No loan-cost comparison / choice architecture | math exists (`computeHoldMatrix`+`computePrepayExitCost`+`matchLenders`); comparison view does not | ≤3 options, total-cost sort, $-framing (Behavioral §2,§6) | **3** |
| G7 | No FN/FIRPTA machinery | `NonUsInvestorsPage` vanilla calc; only `isNonUsInvestor` overlay | adjusters, LTV caps, FIRPTA, OFAC, checklist (FN §10) | **5** |
| G8 | Kiavi 110% nuance + surface IO/qual-rate toggles on Calculator | `computeQualifyingRentForLender` lesser-of only; IO computed but not surfaced on primary calc | Underwriting §3/§5/§8 | **3** |
| G9 | No standalone insurance-BE / tax-BE | `computeBreakevenResult` does rent/price/LTV/rate/IO, not ins/tax | ins-BE $460/mo, tax-BE $598/mo (Edge App. A) | **1** (fold into loss-framing) |

---

## Scope-out (canonical-platform, later — not frontend-native)
Live rent/insurance/tax APIs (RentCast/ZORI/HazardHub/county); community-intelligence & social proof (GLBA/FCRA + aggregated user data); reserve tracking / cash-out tagging / auto-escrow (bank linking); accuracy dashboard / post-close variance (lender outcome data); multilingual onboarding; entity-formation integration; portfolio acquisition-pace (needs deal history).

## Build order
0 (this doc) → 1 (risk comms) → 2 (TCO replace) → 3 (loan cost) → 4 (Monte Carlo) → 5 (FN/FIRPTA).
**Invariant:** no change touches a 🟢/MATCH row except to *reuse* it. Protect rows #1, #2, #3, #12 especially — do not regress to stale doc values.
