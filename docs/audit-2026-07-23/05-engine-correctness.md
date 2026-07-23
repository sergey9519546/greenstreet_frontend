# Greenstreet DSCR Engine — Correctness & Defensibility Audit

**Scope:** `src/engine/` (27 modules) + wiring into `src/pages` / `src/routes`
**Method:** Line-by-line read of the deterministic core, financial models, compliance layer, and tests; cross-referenced against `docs/dscr_loan_office/DSCR Forumals.md`, the Master Specification, and the team's own `DSCR_Blueprint_Verification_Corrections_Log.md`.
**Date:** 2026-07-23
**Read-only:** No repository files were modified.

---

## Overall Verdict

**The CORE lending-decision math is trustworthy; the ADVISORY (returns / tax / IRR) layer and one compliance threshold are not.**

- `solveDSCR` / `calculatePITIA` / `calculatePaymentFactor` implement Track 1 = Rent ÷ PITIA and Track 2 = NOI ÷ PITIA correctly and consistently with `DSCR Forumals.md`. Amortization, IO→ITIA switching, and the deal-break-rate bisection reproduce the documented golden values to <0.01. Input guards return a safe "NEEDS_REVIEW" object instead of NaN for the three primary inputs. This is the part that decides who gets a loan, and it is sound.
- The surrounding **returns / after-tax-IRR / IRR-waterfall stack contains material correctness bugs** (missing interest deduction, decimal-vs-percent IRR scale confusion, double-counted waterfall cumulatives, a crude proxy masquerading as after-tax IRR on the decision page).
- **One compliance value is wrong and directly contradicts the team's own corrections log** (PA prepay threshold).
- A **unit mismatch on flood insurance** can overstate the core DSCR on flood-zone deals.
- **Test coverage pins the amortization primitives but does not test any financial model, and does not verify the legal correctness of the state PPP rules** — the two areas where the bugs actually live.

Bottom line: safe to rely on the Track-1/Track-2 qualification number; do **not** present the after-tax IRR, Return Grade, IRR waterfall, or PA prepay legality as authoritative until the items below are fixed. Total findings: **17** (5 High, 8 Medium, 4 Low).

---

## TOP 5 CORRECTNESS RISKS

1. **Flood-insurance unit mismatch overstates the core DSCR** — the request contract documents `floodInsurance` as *monthly*, but `calculatePITIA` divides it by 12 (treats it as *annual*). On a populated flood-zone deal this understates PITIA and **overstates Track 1 DSCR**, the number that gates the loan. (HIGH)
2. **After-tax taxable income omits the mortgage-interest deduction** — `taxableIncome = NOI − depreciation` (interest never subtracted). Overstates tax by the full annual interest, materially mis-stating after-tax IRR shown on the Tax Engine page. (HIGH)
3. **PA prepayment-penalty threshold is wrong** — code uses `$329,411`; the team's own correction C6 says the correct 2026 value is `$319,777` and the code even labels the correct value as the "previous" one. Correction was inverted, not applied. (HIGH)
4. **IRR scale is inconsistent across engines and double-scaled in the runner** — `taxEngine` returns IRR as a decimal (0.15); `returnsEngine` returns it as a percent (15.0); `v11Runner` divides the decimal by 100 again, producing a 100×-too-small after-tax IRR into the verdict/IC-memo. (HIGH)
5. **The financial models have zero unit tests and PPP legal correctness is untested** — every bug above sits in code the test suite never exercises; the PPP tests only assert an object shape, not any statutory rule. (HIGH, coverage)

---

## Detailed Findings

### FINDING 1 — Flood insurance: "monthly" contract vs "annual" engine handling
**Severity: HIGH**
**Evidence:**
- `src/engine/inputs.ts:41` — `floodInsurance?: number;   // monthly`
- `src/engine/inputs.ts:116` — passes `req.floodInsurance` straight into `property.floodInsurance`
- `src/engine/engine.ts:433` — `const flood = floodInsurance / 12;` (treats it as **annual**)
- `src/engine/monteCarlo.ts:121,139` — `(property.floodInsurance || 0) / 12` (annual)
- `src/engine/irrWaterfall.ts:92` — `property.floodInsurance * 12` (monthly) — **and** `:102` uses it ×1. Internally inconsistent within one file.

**Expected:** A single documented unit for `floodInsurance`, applied identically everywhere it enters PITIA/NOI.
**Actual:** The API contract says monthly; the PITIA math treats it as annual. If the frontend honors its own documented contract and sends a monthly premium (e.g. $200/mo for coastal FL), the engine books $16.67/mo → understates PITIA by ~$183/mo → **overstates Track 1 DSCR**. `irrWaterfall` disagrees with the engine in the opposite direction.
**Impact:** Can flip a borderline flood-zone deal from fail→pass on the qualification number itself (real underwriting harm). At minimum, DSCR is not reproducible across modules for any deal with flood insurance.
**Recommendation:** Pick one unit (recommend annual, to match taxes/insurance), fix the `inputs.ts` comment and every consumer, and add a golden test with non-zero flood insurance.

---

### FINDING 2 — After-tax IRR omits the mortgage-interest deduction
**Severity: HIGH**
**Evidence:** `src/engine/taxEngine.ts:465-467`
```
const preTaxNCF = yearNOI - annualADS;
const depreciation = depreciationSchedule[yr - 1].totalAnnualDepreciation;
const taxableIncome = yearNOI - depreciation;   // ← interest never deducted
```
Confirmed live: `src/pages/TaxEnginePage.tsx:43-44,64-75` passes a true NOI (`monthlyRent*12*0.85 − taxes − ins − hoa`) into `computeAfterTaxIRR`, and displays `afterTaxIRR`.
**Expected:** Taxable rental income = NOI − mortgage **interest** − depreciation (interest is deductible; principal is not).
**Actual:** Interest is dropped entirely from taxable income. On a $300K/7% loan (~$21K Yr-1 interest) at a 24% marginal rate, taxable income is overstated by ~$21K → tax overstated ~$5K/yr → after-tax NCF and after-tax IRR **understated** every year. In loss years the shield is likewise understated.
**Impact:** The headline after-tax IRR / tax-drag figures on the Tax Engine page are materially wrong (conservative direction, but still indefensible for an "advisor-grade" number a borrower may rely on for a purchase/1031 decision).
**Recommendation:** `taxableIncome = yearNOI − annualInterestForYear − depreciation`, where `annualInterestForYear` comes from the amortization schedule (declines each year). Add a unit test against a hand-computed Schedule-E figure.

---

### FINDING 3 — Pennsylvania prepay threshold wrong; correction C6 not applied (inverted)
**Severity: HIGH (compliance)**
**Evidence:**
- `src/engine/statePppLaws.ts:30` — `const PA_PPP_THRESHOLD_2026 = 329_411;`
- `src/engine/statePppLaws.ts:150,154,1447,1451,1468` — narrative repeatedly states "2026 threshold $329,411 (was $319,777)"
- `docs/dscr_loan_office/DSCR_Blueprint_Verification_Corrections_Log.md:54-57` (C6): **Was $329,411 → Is $319,777** (business-purpose, 1–2 unit), sourced to Arch wholesale guidelines 2026.
**Expected:** `$319,777` per the team's verified correction.
**Actual:** Code uses the pre-correction `$329,411` and describes the correct value as historical — the correction was reversed. The check at `:1444` (`loanAmount <= threshold` → block PPP) therefore mis-classifies PA loans in the `$319,778–$329,411` band. (Ohio's $116,356 at `:31` matches C7 and is correct; only PA is wrong.)
**Impact:** Wrong statutory guardrail in a compliance-sensitive output. Here it is conservative (prohibits some legal PPPs), but it is a factual/legal error that contradicts the firm's own verification record and would fail a regulator's spot-check.
**Recommendation:** Set `PA_PPP_THRESHOLD_2026 = 319_777`, flip the "was/is" narrative, and add a test asserting a $325K PA 1-unit loan is PPP-**allowed**.

---

### FINDING 4 — IRR scale inconsistency (decimal vs percent) + double-scaling in the runner
**Severity: HIGH**
**Evidence:**
- `src/engine/taxEngine.ts:560-561` — `preTaxIRR`/`afterTaxIRR = Math.round(xirr * 1000)/1000` → **decimal** (0.15). Confirmed by consumer `src/pages/TaxEnginePage.tsx:105-107` ("Engine returns IRR … as decimal fractions").
- `src/engine/returnsEngine.ts:162-163,245` — `leveredIRR/unleveredIRR = Math.round(xirr * 1000)/10` → **percent** (15.0), commented "as percentage".
- `src/engine/v11Runner.ts:354,355,396` — `afterTaxIRR: afterTaxIRR.afterTaxIRR / 100` (and `preTaxIRR/100`) — divides the already-decimal value by 100 → 0.0015.
- `src/engine/decisionSupport.ts:944-951` — `computeReturnGrade` expects a **decimal** (`irrPct >= 0.15` → 'A'). Fed 0.0015 ⇒ always 'D'.
- `src/engine/decisionSupport.ts:928,1073` — memo prints `(afterTaxIRR*100).toFixed(1)` ⇒ "0.2%".
**Expected:** One IRR scale across the engine barrel.
**Actual:** Two engines disagree on scale; `v11Runner` then double-scales the tax engine's value. Any consumer of `runV11Analysis`/`computeIRRWaterfall` gets a 100×-too-small after-tax IRR and a systematically wrong Return Grade.
**Impact / caveat:** `runV11Analysis` currently has **no callers** in `src/pages`/`src/routes` (grep), so this is latent rather than shipping today — but it is a live landmine: the moment the integrated pipeline or the IRR waterfall is wired to a page, the IC memo shows pre-tax 15% next to after-tax 0.2%.
**Recommendation:** Standardize on decimal fractions across the barrel (fix `returnsEngine`), delete the `/100` in `v11Runner`, and add a cross-module test asserting `returnsEngine.leveredIRR` and `taxEngine.afterTaxIRR` are on the same scale.

---

### FINDING 5 — No tests on any financial model; PPP legal correctness untested
**Severity: HIGH (coverage)**
**Evidence:**
- `src/engine/engine.test.ts` covers only `calculatePaymentFactor`, `calculatePI`, `calculateIOPayment`, `solveDSCR` (monotonicity/bounds), `buildEngineInputs`, `quickDscrEstimate`, and PPP **shape**.
- `checkPPPLegal` tests (`engine.test.ts:290-336`) assert the result object *has* `.allowed` for 50 states plus one semantic case ("TX allows"). No test pins any threshold, entity rule, or ARM restriction — so Findings 3 and the whole 2,573-line `statePppLaws.ts` are effectively unverified by CI.
- Zero tests exist for `taxEngine`, `returnsEngine`, `irrWaterfall`, `monteCarlo`, `monteCarloRatePath`, `armResetEngine`, `reassessmentEngine`, `trueCostEngine`, `loanOptimizer`, `sensitivity`, `stressMatrix`, `decisionSupport`, `v11Runner`.
**Impact:** Findings 2, 4, 6, 7 would all be caught by a single hand-computed assertion each; none exist. The models are "smoke-clean" (they don't throw) but their financial behavior is unpinned — exactly the false-confidence the audit warns against.
**Recommendation:** Add golden tests with hand-computed expected values for: after-tax IRR (with interest deduction), levered IRR scale, §1250/§1245 split, a Monte-Carlo reproducibility hash, and per-state PPP legality/threshold (at least CA/PA/OH/NJ/MS/WI edge cases).

---

### FINDING 6 — IRR waterfall: cumulative column double-counts every subtotal
**Severity: MEDIUM**
**Evidence:** `src/engine/irrWaterfall.ts:287-302` (and identical `:342-357`)
```
if (sign === 'ADD' || sign === 'SUBTOTAL' || sign === 'TOTAL') cum += amount;
else if (sign === 'SUBTRACT') cum -= amount;
...
push('Gross Effective Rent', grossEff, 'SUBTOTAL', ...) // grossEff === grossRent - vacancy
```
**Expected:** A subtotal is a *checkpoint* equal to the running balance; it should set/label `cum`, not add to it.
**Actual:** After Gross Rent (add) − Vacancy (sub), `cum` already equals `grossEff`; the SUBTOTAL then does `cum += grossEff`, doubling it. Every subsequent `cumulative` value is corrupted (NOI, Pre-Tax CF, Taxable, After-Tax CF checkpoints all compound the error).
**Impact:** The `cumulative` column of the "where every dollar goes" waterfall — a transparency/defensibility feature — is arithmetically nonsense. Headline `year1.afterTaxCF` etc. come straight from `taxEngine` and are unaffected, so this is a display/reporting defect, not a decision defect.
**Recommendation:** For SUBTOTAL/TOTAL, set `cum = amount` (checkpoint) rather than `cum += amount`; add a test that the final cumulative equals After-Tax CF.

---

### FINDING 7 — IRR waterfall exit block: dead code, hardcoded splits, self-inconsistent
**Severity: MEDIUM**
**Evidence:** `src/engine/irrWaterfall.ts:163-215`
- `:177-186` computes `operatingCFDiscounted`, `exitAfterTax`, `exitAfterTaxImplied` — **none are used** (dead).
- `:186` `exitAfterTaxImplied` uses `afterTaxIRR_pct = afterTaxIRR.afterTaxIRR / 100` (:169) — same decimal/percent confusion as Finding 4.
- `:194-202` independently re-derives sale price from hardcoded `exitCapRate = 0.065` and `sellingCostsPct = 0.06`, ignoring the actual recapture already computed in `taxEngine`.
- `:211-212` `depreciationRecapture = totalTaxOnExit * 0.6`, `capitalGainsTax = * 0.4` — arbitrary fixed split, not the real §1250/§1245/LTCG decomposition available in `computeRecaptureOnSale`.
- `:446` summary prints `${afterTaxIRR.toFixed(2)}%` on a decimal ⇒ "0.15%" instead of "15%".
**Impact:** The exit waterfall is a tangle of approximations disagreeing with the authoritative `taxEngine` recapture, plus a 100× summary misprint. Not decision-critical (unwired), but not defensible as shown.
**Recommendation:** Expose the `RecaptureComputation` from `computeAfterTaxIRR` and consume it directly; delete the reverse-engineering block; fix the summary scale.

---

### FINDING 8 — DecisionSupport "after-tax IRR" is a crude proxy presented as a graded return
**Severity: MEDIUM**
**Evidence:** `src/pages/DecisionSupportPage.tsx:125,171-172,195`
```
const afterTaxIRR = Math.max(0, (year1CoC / 100) * 5);   // Year-1 CoC × 5
...
computeVerdict({ afterTaxIRR, preTaxIRR: afterTaxIRR, ... })
const grade = computeReturnGrade(afterTaxIRR, track2DSCR);
```
**Expected:** The Return Grade (A–F) and IC-memo return line should reflect a real multi-year after-tax IRR (the engine has `computeAfterTaxIRR` for exactly this).
**Actual:** The live decision page ignores `taxEngine`/`returnsEngine` entirely and grades on `Year-1 cash-on-cash × 5` — no appreciation, principal paydown, depreciation, recapture, exit, or taxes. `preTaxIRR` is set equal to `afterTaxIRR`, so any pre/after-tax distinction in the memo is illusory. It is honestly labeled "proxy, not true IRR" in one factor row (`:208`) but the A–F **Return Grade** and memo carry no such caveat.
**Impact:** An authoritative-looking institutional grade rests on a back-of-envelope proxy; the same deal shows a different "after-tax IRR" on `TaxEnginePage` (real engine) vs `DecisionSupportPage` (proxy). Defensibility gap.
**Recommendation:** Wire the real `computeAfterTaxIRR` into the decision page (after fixing Findings 2/4), or rename the grade to "Preliminary CoC Grade" and stop labeling it after-tax IRR.

---

### FINDING 9 — Monte Carlo is a single-year model with deterministic and hardcoded elements
**Severity: MEDIUM**
**Evidence:** `src/engine/monteCarlo.ts`
- `:86-88` rent shock drawn **once per simulation** and held flat for all 12 months → a 1-year horizon, not a multi-year path (reserve curve is only 12 months, `:165`).
- `:94` `currentInsurance *= (1 + insuranceInflation)` applied **unconditionally in every path** (deterministic +8%, not stochastic).
- Vacancy is modeled two different ways: monthly Bernoulli full-month loss for cash flow (`:113`) vs a flat `1 − 8% − 8% − 5%` haircut for the Track-2 DSCR (`:144`).
- `:208,213` "Insurance Spike >15%" and "Major Maintenance" risks are **hardcoded probabilities** (0.12, 0.15), not derived from the simulation.
**Good:** Seed is fixed (`mulberry32(42)`), so runs are bit-for-bit reproducible — correct for an audit trail. Box-Muller is standard.
**Impact:** Labeled a risk engine but delivers a one-year snapshot with a deterministic insurance bump and two mutually inconsistent vacancy treatments; two of the five "key risks" are constants. Distributions are directionally useful but overstate rigor.
**Recommendation:** Document the 1-year scope explicitly (or extend to a multi-year path), make insurance inflation stochastic, unify the vacancy treatment, and derive all `keyRisks` from the simulated draws.

---

### FINDING 10 — Two divergent DSCR/amortization implementations with different rate-unit conventions
**Severity: MEDIUM**
**Evidence:**
- `src/engine/engine.ts:46-51` `calculatePaymentFactor(annualRate,…)` treats `annualRate` as a **percent** (`/100/12`).
- `src/engine/qualify.ts:89-95` `amortize(loan, annualRate,…)` treats `annualRate` as a **fraction** (`/12`), with its own rate model (`baseRate 0.0725`, `:69-83`) vs the engine's pricing matrix (`anchor 6.125`, `:84-106`).
**Expected:** One amortization primitive and one rate model, or clearly namespaced ones with a shared convention.
**Actual:** The "See If You Qualify" modal (`qualify`) and the full engine (`solveDSCR`) can return **different DSCR and rate** for the same deal, and the two amortization helpers take the rate in different units (a 100× foot-gun if ever cross-called).
**Impact:** Inconsistent qualification numbers between surfaces; latent 100× error risk. Defensibility/consistency.
**Recommendation:** Have `qualify` delegate to `calculatePI`/`calculatePITIA` (converting units once) or document the two as deliberately distinct "quick vs full" estimates with a reconciliation note.

---

### FINDING 11 — Incomplete NaN/Infinity guards in `solveDSCR`
**Severity: MEDIUM**
**Evidence:** `src/engine/engine.ts:799-803` guards only `purchasePrice`, `leaseRent`, `ltv`. Not guarded: `annualTaxes`, `annualInsurance`, `hoa`, `floodInsurance`, and (for STR/MTR) `strProjectedRent` (`:257-259`). The existence of `src/routes/narrate.ts:33-38` `safeNum(...)` defending the LLM prompt confirms NaN can escape the engine.
**Expected:** All numeric inputs sanitized/clamped before math; outputs finite by construction.
**Actual:** An STR deal with missing `strProjectedRent`, or a NaN tax/insurance field, propagates `NaN` through PITIA → DSCR → downstream. The narrate route only patches the display, not the source.
**Impact:** NaN can reach outputs and any consumer that doesn't independently defend (e.g. lender matching, verdict thresholds `NaN < 1.0` is `false`).
**Recommendation:** Coerce every numeric input via `Number.isFinite(x) ? x : 0/needs-review` at the top of `solveDSCR` (extend the existing guard), and add tests for NaN tax and missing STR rent.

---

### FINDING 12 — Golden-value verification is self-referential; documented flagship never produced by the solver
**Severity: MEDIUM**
**Evidence:**
- `src/engine/engine.ts:1037-1041` `verifyGoldenValues()` checks `3000 / pitia7.total` at a **hardcoded 7.00%**, not the output of `solveDSCR`.
- The engine header (`:8`) documents "Flagship Track 1: 1.05 @ 7.00%", but for the flagship borrower the pricing matrix bottoms out at the 6.125% floor (all adjustments 0), so `solveDSCR` returns ~1.25 @ 6.125% — pinned by `src/engine/modes.test.ts:29` (`solvedRate ≈ 6.125`). The "1.05 @ 7.00%" headline is never generated end-to-end.
**Impact:** The golden suite validates the amortization primitives (good) but gives false confidence that it validates the solver's rate/DSCR output (it does not). Documentation and implementation have drifted.
**Recommendation:** Add an end-to-end golden assertion on `solveDSCR(...).dscr`/`.solvedRate`, and reconcile the header comment with the actual floor-anchored output.

---

### FINDING 13 — `solveDSCR` rate fixpoint can fail to converge at tier boundaries
**Severity: LOW/MEDIUM**
**Evidence:** `src/engine/engine.ts:842-885`. `estimateRate` depends on `dscrTierAdjustment` (`:118-128`), a **step function**; the rate↔DSCR iteration can oscillate across a tier edge and exhaust `maxIterations = 10`. On non-convergence it exits with `solvedRate` derived from the prior iteration's `assumedDSCR`, then recomputes PITIA/DSCR at that rate.
**Expected:** A converged fixpoint, or an explicit "did-not-converge" signal.
**Actual:** Final `dscr` is always recomputed consistently with the final `solvedRate` (so the pair is self-consistent), but `solvedRate` may reflect a stale tier; error is bounded to one tier step (~12.5–50 bps).
**Impact:** Small, bounded rate error for borderline deals sitting exactly on a DSCR tier boundary; no wild output. Worth hardening for auditability.
**Recommendation:** Detect the two-cycle oscillation and pick the conservative (higher-rate) tier; expose an `converged`/`iterations` flag on the result.

---

### FINDING 14 — Tax brackets: HOH/MFS approximations
**Severity: LOW**
**Evidence:** `src/engine/taxEngine.ts:314-333` `getMarginalOrdinaryRate` routes SINGLE/HOH/MFS through one non-MFJ table (HOH has distinct brackets); `:335-342` `getLTCGRate` uses SINGLE thresholds for MFS (MFS LTCG breakpoints are ~half of MFJ, not equal to single). Federal tax also applies a single marginal rate to the entire incremental amount (`:471-473`).
**Impact:** Minor tax-figure inaccuracy for HOH/MFS filers; dwarfed by Finding 2. Advisory only.
**Recommendation:** Add HOH and MFS bracket tables; note the marginal-rate simplification in the disclaimer.

---

### FINDING 15 — Hardcoded financial assumptions that should be documented, tunable rules
**Severity: LOW/MEDIUM**
**Evidence (non-exhaustive):** exit cap `0.065` (`returnsEngine.ts:103`, `irrWaterfall.ts:195`), rent growth `0.02` (`taxEngine.ts:461`, `returnsEngine.ts:102`, `irrWaterfall.ts:193`), selling costs `0.06`, closing costs `3%` (`engine.ts:581`), refi closing `2.5%` (`armResetEngine.ts:837`), hold-matrix after-tax = `irr × 0.75` (`returnsEngine.ts:246`), STR furnishing `5000` (`engine.ts:943`). STR vacancy also disagrees across modules: **8%** in `engine.ts:236` Track 2 and `monteCarlo`, but **25%** in `returnsEngine.ts:68`.
**Impact:** Reasonable defaults, but embedded rather than surfaced; the STR-vacancy divergence means Track-2 DSCR and pre-tax returns use different assumptions for the same STR deal.
**Recommendation:** Lift these into a documented policy object (like `QUALIFY_POLICY`) with provenance, and reconcile STR vacancy to one value.

---

### FINDING 16 — ARM reset ladder: documented pseudocode contradicts the code (decreases)
**Severity: LOW**
**Evidence:** `src/engine/armResetEngine.ts:103-112` pseudocode lists `prev_rate` as a **lower** clamp (rate can't fall below prior), but the implementation (`:169-178`) allows the rate to step **down** to `max(floor, index+margin)`. The prose at `:116-119` says decreases are intended, so the code is right and the header pseudocode is stale.
**Impact:** Documentation-only; the reset math itself (initial-cap then periodic-cap toward lifetime cap) is correct and the v11 "can't jump to lifetime cap in one reset" fix is sound.
**Recommendation:** Correct the pseudocode block to match the implemented decrease behavior.

---

### FINDING 17 — `computePassiveLossAllowance` has dead reassignments (code smell)
**Severity: LOW**
**Evidence:** `src/engine/taxEngine.ts:367-391` reassigns `actualAllowableLoss` up to four times in the `magi <= phaseOutStart` branch (`:373,375,378,380`), each overwriting the last. The final phase-out math (`:382-391`) is correct, but the branch is unreadable and fragile. MFS also always uses `$12,500` (ignores the living-together = $0 rule).
**Impact:** No numeric error today, but a maintenance hazard directly adjacent to the tax logic.
**Recommendation:** Collapse to a single clamped expression; add a comment for the MFS living-arrangement caveat.

---

## What is correct and defensible (for balance)

- **Core amortization & PITIA:** `calculatePaymentFactor`/`calculatePI`/`calculateIOPayment`/`calculatePITIA` reproduce the documented factors (0.006653 @7%, 0.0075127 @8.25%) and PITIA/DSCR golden values; taxes & insurance annualized ÷12, HOA monthly, r=0 handled (`engine.ts:46-51,406-451`).
- **Track 1 = Rent/PITIA, Track 2 = NOI/PITIA, IO→ITIA switch:** matches `DSCR Forumals.md`; `NOI_PI` denominator correctly uses P&I-only (the MI-inclusion bug was fixed, `engine.ts:314-321`).
- **Deal-break rate solver:** monotone bisection, IO closed-form branch, `targetPI<=0` guard (`engine.ts:459-498`).
- **Reassessment engine:** correctly rebases tax to purchase price and recomputes PITIA/DSCR (`reassessmentEngine.ts`), and `v11Runner` correctly threads the reassessed tax into `solveDSCR` — the "seller's bill overstates DSCR" failure mode is properly handled.
- **ARM reset ladder & multi-scenario stress:** per-reset caps enforced, lifetime cap only reached after consecutive resets, remaining-balance formula correct (`armResetEngine.ts`).
- **Reproducibility:** both Monte Carlo engines use a fixed-seed Mulberry32 (`monteCarlo.ts:44`, `monteCarloRatePath.ts:185`) — deterministic and auditable.
- **XIRR:** bracketed bisection with range-widening and a divergence fallback (`taxEngine.ts:611-654`) — robust for conventional cash-flow signs.
- **OH prepay threshold and §1343.011 citation** match correction C7; **§1250/§1245 split and NIIT stacking** reflect the applied AUDIT-5 fixes.

---

## Severity tally
| Severity | Count | Findings |
|---|---|---|
| High | 5 | 1, 2, 3, 4, 5 |
| Medium | 8 | 6, 7, 8, 9, 10, 11, 12, 15 |
| Low | 4 | 13, 14, 16, 17 |
| **Total** | **17** | |
