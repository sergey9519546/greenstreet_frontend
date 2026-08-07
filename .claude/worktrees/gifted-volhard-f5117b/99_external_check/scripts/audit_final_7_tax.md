# AUDIT-FINAL-7 — Tax Engine Correctness

**Task ID:** AUDIT-FINAL-7
**Scope:** Tax Engine (cost-seg, NIIT, OBBBA, §1250/§1245) + AEY + Counterparty Risk
**Files Audited:**
- `src/lib/dscr/taxEngine.ts` (658 → 691 lines after fix)
- `src/lib/dscr/returnsEngine.ts` (308 lines — pre-tax IRR / hold matrix)
- `src/lib/dscr/trueCostEngine.ts` (451 lines — AEY + COUNTERPARTY_RISK)
- Callers updated: `src/app/page.tsx` (line 354), `src/lib/dscr/v11Runner.ts` (line 315)

**Baseline:** `npx tsx scripts/verify_v11.ts` → 53/53 PASS (pre- and post-fix).

---

## 1. Tax Treatment Verification Matrix

| # | Audit Item | Code Reference | Expected | Actual | Verdict |
|---|---|---|---|---|---|
| 1 | OBBBA 100% bonus dep, post-1/19/25 acquisitions | taxEngine.ts:66-68 `if (acq > obbba) { bonusPct = 1.00 }` | 1.00 | 1.00 | ✅ PASS |
| 1b | OBBBA category label | taxEngine.ts:67 | `'POST_2025_01_19'` | `'POST_2025_01_19'` | ✅ PASS |
| 1c | OBBBA pre-1/19/25, PIS-2025 | taxEngine.ts:71-73 | 0.40 | 0.40 | ✅ PASS |
| 1d | OBBBA pre-1/19/25, PIS-2026 | taxEngine.ts:74-76 | 0.20 | 0.20 | ✅ PASS |
| 2 | §1250 recapture @ 25% federal rate (max) | taxEngine.ts:276 `federalRecaptureTax = §1250gain × 0.25` | 25% | 25% | ✅ PASS |
| 3 | §1245 recapture @ ordinary income rate (up to 37% top bracket) | taxEngine.ts:278-279 `marginalRate = getMarginalOrdinaryRate(MAGI)`; bracket table at :314-333 tops at 37% for MAGI > $751,600 MFJ | 37% (top marginal) | 37% (top of 7-tier ordinary bracket, applied via MAGI) | ✅ PASS |
| 4 | Cost-seg bonus dep treated as §1245 (NOT double-taxed as both §1250 + §1245) | taxEngine.ts:238-272 v11 FIX comment + `straightLineDepreciation = max(totalDep - costSegBonus, 0)` and `§1250 = min(straightLine, gain)` — cost-seg bonus is EXCLUDED from §1250 base, then allocated to §1245 | No double-tax | No double-tax (verified by allocation) | ✅ PASS |
| 5 | NIIT 3.8% stacks on §1245 recapture per IRC §1411 | taxEngine.ts:286-291 v11 FIX comment + `niitTax = (§1250 + §1245 + appreciation) × 0.038` | §1245 included in NIIT base | §1245 included | ✅ PASS |
| 6 | State tax correctly applied | taxEngine.ts:294 `stateTax = totalGainOnSale × (stateTaxRatePct/100)` (output field `stateTax` in RecaptureComputation; input field `stateTaxRatePct` on TaxProfile — audit spec calls this `stateIncomeTax`; same concept, name variant) | State tax on gain | State tax on gain | ✅ PASS (name variant only) |
| 7 | After-tax IRR computed correctly (year-by-year + exit) | taxEngine.ts:431-570 `computeAfterTaxIRR`: builds year-by-year after-tax NCF, exit year adds after-tax exit proceeds less remaining balance + prepay | XIRR of after-tax CFs | XIRR of after-tax CFs | ✅ PASS (post D-1 fix) |
| 8 | LTCG 20% federal rate for hold >1yr | taxEngine.ts:167-179 `LTCG_BRACKETS_MFJ` top bracket = 0.20 at MAGI ≥ $600,050; SINGLE top = 0.20 at $533,400 | 20% top | 20% top | ✅ PASS |
| 9 | Depreciation recapture happens at exit (sale) | taxEngine.ts:496-503 `computeRecaptureOnSale(...)` invoked inside `computeAfterTaxIRR` exit block; output added to year-N cash flow | Recapture at exit | Recapture at exit | ✅ PASS |
| 10 | IRC §167/§168/§1250/§1245/§1411/§469 references present in source comments | taxEngine.ts:9-15 header SOURCES block; :98 source string `'OBBBA (signed Jan 2025); IRC §168(k)'`; :181 `'NIIT thresholds (IRC §1411)'`; :200-201 docstring; :351 `'Per IRC §469'` | All 6 references present | §167 ✓, §168 ✓ (×2), §1250 ✓ (×8), §1245 ✓ (×7), §1411 ✓ (×2), §469 ✓ (×2) | ✅ PASS |

**Tax treatment matrix verdict: 10/10 items PASS.**

---

## 2. AEY Computation Check

| # | Audit Item | Code Reference | Verdict |
|---|---|---|---|
| 11 | AEY uses actual lender fees (`loan.lenderFees`, `loan.points`, `loan.brokerFees`, `loan.rateLockCost`) NOT `loanAmountMin` placeholder | trueCostEngine.ts:319-332 v11 FIX comment + `computeAEY(q.loanAmount, q.estimatedRate, q.termMonths, q.holdMonths, q.pointsPct ?? 0, q.lenderFees ?? 1500, q.brokerFees ?? 0, q.rateLockCost ?? 0, ...)` — uses ACTUAL fees from quote, not `loanAmountMin`. No reference to `loanAmountMin` in trueCostEngine.ts. | ✅ PASS |
| 12 | AEY formula: t=0 (+loan − fees), t=1..n (−PI), t=n (−balance − prepay) | trueCostEngine.ts:163-187 — t=0: `netLoanProceeds = loanAmount − pointsDollars − lenderFees − brokerFees − rateLockCost`; t=1..n: `-piMonthly × 12` aggregated annually; t=n: `-(remainingBalance + prepayPenaltyAtExit)` added to last CF. XIRR solves IRR. | ✅ PASS |
| 13 | Counterparty risk table has all 12 lenders; American Heritage continuityScore=65; Deephaven knownDisruption contains "Matrix may be stale" | trueCostEngine.ts:36-125 enumerates all 12 lenders: griffin (88/STABLE), kiavi (82/STABLE), visio (80/STABLE), lima_one (78/STABLE), easy_street (76/STABLE), new_silver (72/STABLE), defy (75/STABLE), angel_oak (70/STABLE), deephaven (60/WATCH/"Matrix may be stale — highest reverify priority"), american_heritage (65/STABLE), corevest (70/STABLE), rcn_capital (75/STABLE). Total = 12. AH score=65 ✓. Deephaven disruption contains "Matrix may be stale" ✓. | ✅ PASS |

**AEY computation verdict: 3/3 items PASS.**

---

## 3. Counterparty Risk Table Verification

Per `types.ts:1037-1043`, `CounterpartyRisk.flag` is `'STABLE' | 'WATCH' | 'ELEVATED'` (no DISTRESSED — code uses ELEVATED instead, which the audit prompt explicitly allows).

| # | Audit Item | Code Reference | Expected | Actual | Verdict |
|---|---|---|---|---|---|
| 14 | Flag values: STABLE / WATCH / DISTRESSED (or ELEVATED per types.ts) | types.ts:1042 `flag: 'STABLE' \| 'WATCH' \| 'ELEVATED'` | Allowed: STABLE/WATCH/ELEVATED | STABLE/WATCH/ELEVATED | ✅ PASS |
| 15 | American Heritage = STABLE | trueCostEngine.ts:105 `flag: 'STABLE'` | STABLE | STABLE | ✅ PASS |
| 16 | Deephaven = WATCH (stale matrix) | trueCostEngine.ts:98 `flag: 'WATCH'` + :96 `knownDisruption: 'Matrix may be stale — highest reverify priority'` | WATCH | WATCH | ✅ PASS |
| 17 | CoreVest = STABLE | trueCostEngine.ts:116 `flag: 'STABLE'` | STABLE | STABLE | ✅ PASS |
| 18 | RCN Capital = STABLE | trueCostEngine.ts:123 `flag: 'STABLE'` | STABLE | STABLE | ✅ PASS |

**Full counterparty table (12 lenders, audit spec verification):**

| Lender | continuityScore | flag | knownDisruption | Spec Match |
|---|---|---|---|---|
| griffin | 88 | STABLE | null | ✅ |
| kiavi | 82 | STABLE | null | ✅ |
| visio | 80 | STABLE | null | ✅ |
| lima_one | 78 | STABLE | null | ✅ |
| easy_street | 76 | STABLE | null | ✅ |
| new_silver | 72 | STABLE | null | ✅ |
| defy | 75 | STABLE | null | ✅ |
| angel_oak | 70 | STABLE | null | ✅ |
| deephaven | 60 | WATCH | "Matrix may be stale — highest reverify priority" | ✅ (audit spec: WATCH + stale matrix) |
| american_heritage | 65 | STABLE | null | ✅ (audit spec: continuityScore=65) |
| corevest | 70 | STABLE | null | ✅ (audit spec: STABLE) |
| rcn_capital | 75 | STABLE | null | ✅ (audit spec: STABLE) |

**Counterparty risk verdict: 5/5 items PASS. All 12 lenders present and correctly flagged.**

---

## 4. Defects Found & Fixed

### D-1 (HIGH) — FIXED
**Title:** `taxEngine.computeRemainingBalance` used simplified linear approximation `loanAmount × (1 − holdYears/30)` instead of proper amortization, understating remaining loan balance by ~10pp at typical 5-yr hold on a 30-yr 7% loan.

**Impact:** For the v11Runner flagship deal ($318,750 loan @ 7.0%, 30-yr term, 5-yr hold):
- Simplified proxy: $265,625 (83.3% remaining)
- Proper amortization: $299,932 (94.1% remaining)
- Delta: $34,307 (≈10.8% of loanAmount)

The proxy OVERSTATED after-tax exit proceeds by $34,307, inflating after-tax IRR by an estimated 300-500bps depending on exit value. This was a material mis-statement of the headline after-tax returns figure.

**Fix:** Added optional `loanRatePct` and `loanTermMonths` parameters to `computeAfterTaxIRR` (backward-compatible — defaults to prior proxy when not supplied). When both are supplied, `computeRemainingBalance` now uses the proper standard amortization formula `B_t = L × ((1+r)^n − (1+r)^t) / ((1+r)^n − 1)` — identical to the one in `returnsEngine.computeRemainingBalance` (which was already correct for pre-tax IRR).

**Caller updates:**
- `src/app/page.tsx:354` — now passes `result.solvedRate, termMonths` (both in scope at call site)
- `src/lib/dscr/v11Runner.ts:315` — now passes `dscr.solvedRate, termMonths` (both in scope at call site)

**Verification:** `npx tsx scripts/verify_v11.ts` → 53/53 PASS (no regression). Standalone `npx tsc --noEmit` on the three tax files + v11Runner.ts → no errors.

### D-2 (LOW) — FIXED
**Title:** Dead variable `preTaxIRR` in `computeAfterTaxIRR` — computed via a buggy mapping that double-counted exit proceeds on EVERY positive cash flow (not just the exit year), but the value was never used (the returned `preTaxIRR` field uses `preTaxIRRComputed`, computed separately from a clean pre-tax CF array).

**Impact:** Zero runtime impact (dead code) but the buggy computation would have caused confusion if anyone later "fixed" the dead-code warning by replacing `preTaxIRRComputed` with `preTaxIRR`.

**Fix:** Removed the dead variable + added a comment explaining the correct `preTaxIRRComputed` computation. Pre-tax cash flow correctly uses pre-tax NCF + after-tax exit proceeds + totalTaxOnSale (add-back to get pre-tax) − remaining loan balance − prepay.

### D-3 (LOW) — DOCUMENTATION ONLY (no code fix needed)
**Title:** Field-name mismatch between audit spec and code. Audit spec item 6 says "State tax correctly applied (stateIncomeTax field)". Code uses:
- Input field on `TaxProfile`: `stateTaxRatePct` (types.ts:804)
- Output field on `RecaptureComputation`: `stateTax` (types.ts:861)
- Output field on `AfterTaxCashFlowRow`: `stateTax` (types.ts:897)

There is no field literally named `stateIncomeTax` anywhere in the codebase. The state tax IS correctly applied to the total gain on sale (`taxEngine.ts:294`) and to annual taxable income (`taxEngine.ts:477`). This is purely a spec-vocabulary variance — no behavior defect.

### D-4 (LOW) — DOCUMENTATION ONLY
**Title:** `rentGrowthPct` is hardcoded to 0.02 (2%) in `computeAfterTaxIRR` (taxEngine.ts:457). Not exposed as a `TaxProfile` field. Audit spec does not require rent growth as a parameter; 2% is a standard mid-cycle assumption. No fix required; flagged for future parameterization.

### D-5 (LOW) — TEST COVERAGE GAP (not in audit scope to fix)
**Title:** `verify_v11.ts` Section 3 tests bonus dep, depreciation, NIIT thresholds, PAL, and cost-seg viability, but does NOT have a direct test for `computeRecaptureOnSale` (§1250/§1245/NIIT/LTCG/state allocation on a sale) or `computeAfterTaxIRR` (year-by-year after-tax cash flow + exit). The tax engine functions pass indirect verification via the 53-check suite but lack dedicated recapture/IRR assertions. Recommend adding a dedicated `audit8_tax_tests.ts` runner with 30-40 checks in a future audit cycle.

---

## 5. Pass/Fail Verdict

| Category | Items | PASS | FAIL | Verdict |
|---|---|---|---|---|
| Tax treatment (items 1-10) | 10 | 10 | 0 | ✅ PASS |
| AEY computation (items 11-13) | 3 | 3 | 0 | ✅ PASS |
| Counterparty risk (items 14-18) | 5 | 5 | 0 | ✅ PASS |
| **TOTAL** | **18** | **18** | **0** | **✅ PASS** |

**Defects:** 1 HIGH (D-1, FIXED), 1 LOW (D-2, FIXED), 3 LOW/informational (D-3/D-4/D-5, documented only).

**Test suite:** `npx tsx scripts/verify_v11.ts` → 53/53 PASS (no regression after fixes).

**Standalone TS compilation:** `npx tsc --noEmit src/lib/dscr/taxEngine.ts src/lib/dscr/returnsEngine.ts src/lib/dscr/trueCostEngine.ts src/lib/dscr/v11Runner.ts` → no errors.

**Final verdict: ✅ PASS — Tax engine (cost-seg, NIIT, OBBBA, §1250/§1245) and AEY/counterparty risk table are spec-compliant and ready for production release.**
