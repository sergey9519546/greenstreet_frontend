# AUDIT-FINAL-1 — Math & Engine Golden Values Re-verification

**Task ID:** AUDIT-FINAL-1
**Agent:** Audit-Subagent-1 (Math & Engine)
**Scope:** `src/lib/dscr/engine.ts`, `src/lib/dscr/types.ts`, `src/lib/dscr/armResetEngine.ts`
**Date:** Final-round audit, post v11.1 ARM-reset-engine fix
**Verdict:** ✅ **PASS** — All 15 golden values verified; ARM ladder traces reproduce spec exactly; no CRITICAL/HIGH defects found.

---

## 1. Independent Verification Run

A dedicated audit runner (`scripts/audit_final_1_math_runner.ts`) was authored that re-derives every golden value directly from the engine functions, without reusing the production `verifyGoldenValues()` block. The runner also traces the two ARM ladder scenarios (11 & 12) and exercises `ioArmDoubleShockYear` across four IO-period configurations.

**Result:** 26 / 26 independent checks pass.

In addition, `npx tsx scripts/verify_v11.ts` returns **53 / 53 PASS**.

---

## 2. Golden Values 1–10 — Math Engine

| #  | Golden value | Expected | Actual | Status |
|----|--------------|----------|--------|--------|
| 1  | Payment factor @ 8.25%, 30 yr | 0.0075127 | 0.0075127 | ✅ |
| 2  | Payment factor @ 7.00%, 30 yr | 0.006653 | 0.0066530 | ✅ |
| 3  | P&I on $300,000 @ 8.25% | $2,254/mo | $2,254 | ✅ |
| 4  | P&I on $318,750 @ 8.25% | $2,395/mo | $2,395 | ✅ |
| 5  | PITIA @ 8.25% | $3,129 | $3,128 | ✅ *(see note A)* |
| 6  | Track 1 DSCR @ 8.25% on $3,000 rent | 0.96 | 0.959 | ✅ |
| 7  | Track 1 DSCR @ 7.00% | 1.051 | 1.051 | ✅ |
| 8  | Rent breakeven (% below rent @ 7.00%) | 4.9 | 4.9 | ✅ |
| 9  | Deal-break rate | 7.67% | 7.67% | ✅ |
| 10 | (1.006875)^360 compound factor | 11.781 | 11.782 | ✅ *(see note B)* |

### Note A — PITIA $3,128 vs spec $3,129 (LOW-severity cosmetic)
The engine keeps tax & insurance **fractional** inside `calculatePITIA` (tax = `5000/12 = 416.6667`, ins = `2000/12 = 166.6667`) and rounds only the final PITIA total. So:

  - engine: `pi 2394.66 + tax 416.67 + ins 166.67 + HOA 150 = 3128.00 → $3,128`
  - spec derivation: `PI $2,395 + tax $417 + ins $167 + HOA $150 = $3,129` (pre-rounded components)

The $1 delta is purely a rounding-mode choice. The corresponding Track 1 DSCR `3000 / 3128.00 = 0.95914` rounds to **0.96** either way — so the displayed DSCR matches spec exactly. No material impact. Severity: **LOW (cosmetic display only)**.

### Note B — Compound factor 11.782 vs spec 11.781 (LOW-severity display rounding)
`Math.pow(1.006875, 360)` in V8 returns `11.781505620…`, which JS `Math.round` rounds half-up to `11.782`. The spec value `11.781` is the round-half-down (or truncated) form of the same number. Both are within 1 unit-in-the-3rd-decimal; the factor itself is unchanged. Notably this proves the v5.0 bug (`10.935`) is gone — the engine is using the correct compound factor within ±0.001. Severity: **LOW (cosmetic display only)**.

---

## 3. ARM Reset Engine — v11.1 Ladder Simulation Trace

### Scenario 11 — 5/6 ARM, SOFR stress 5.0% + margin 2.75% = 7.75% fully-indexed

Program: `5_6_ARM` (`initialRate 5.125`, `initialCap 2.0`, `periodicCap 1.0`, `lifetimeCap 5.0`, `floor 5.125`).

`simulateARMResetLadder(arm, 5.0, 10)`:

| Reset # | Year | Rate | Cap binding | Spec expectation | Match |
|---------|------|------|-------------|------------------|-------|
| 1 | 5.0 | 7.125% | INITIAL_CAP | min(7.75, 5.125+2) = 7.125 (initialCap binds) | ✅ |
| 2 | 5.5 | 7.750% | NONE | min(7.75, 7.125+1=8.125, lifetime 10.125) = 7.75 (NONE binds) | ✅ |
| 3 | 6.0 | 7.750% | NONE | stabilized at fully-indexed | ✅ |
| 4 | 6.5 | 7.750% | NONE | … | ✅ |
| 5 | 7.0 | 7.750% | NONE | … | ✅ |
| 6 | 7.5 | 7.750% | NONE | … | ✅ |
| 7 | 8.0 | 7.750% | NONE | … | ✅ |
| 8 | 8.5 | 7.750% | NONE | … | ✅ |
| 9 | 9.0 | 7.750% | NONE | … | ✅ |
| 10 | 9.5 | 7.750% | NONE | stabilized | ✅ |

- `stabilizedRate = 7.75%` ✅
- `yearsToLifetimeCap = null` ✅ (never binds — fully-indexed below all caps after reset 2)
- `lifetimeCapRate = 10.125%` ✅

### Scenario 12 — 5/6 ARM, SOFR stress 8.0% + margin 2.75% = 10.75% fully-indexed

| Reset # | Year | Rate | Cap binding | Spec expectation | Match |
|---------|------|------|-------------|------------------|-------|
| 1 | 5.0 | 7.125% | INITIAL_CAP | min(10.75, 7.125) = 7.125 | ✅ |
| 2 | 5.5 | 8.125% | PERIODIC_CAP | min(10.75, 8.125) = 8.125 | ✅ |
| 3 | 6.0 | 9.125% | PERIODIC_CAP | min(10.75, 9.125) = 9.125 | ✅ |
| 4 | 6.5 | 10.125% | LIFETIME_CAP | min(10.75, 10.125) = 10.125 (lifetime binds) | ✅ |
| — | — | stabilized at 10.125% | — | — | ✅ |

- `stabilizedRate = 10.125%` ✅
- `yearsToLifetimeCap = 6.5` ✅ (lifetime cap reached 18 months after first reset)
- Ladder correctly halts after reset 4 via `break` clause (line 186).

---

## 4. Golden Values 11–15 — ARM Engine & Lender Stress

| # | Test | Expected | Actual | Status |
|---|------|----------|--------|--------|
| 11a | Reset 1 (yr 5) under 7.75% stress | 7.125% / INITIAL_CAP | 7.125% / INITIAL_CAP | ✅ |
| 11b | Reset 2 (yr 5.5) under 7.75% stress | 7.75% / NONE | 7.75% / NONE | ✅ |
| 11c | Stabilized rate, never hits lifetime | 7.75% / null | 7.75% / null | ✅ |
| 12a | Reset 1 under 10.75% stress | 7.125% / INITIAL_CAP | 7.125% / INITIAL_CAP | ✅ |
| 12b | Reset 2 under 10.75% stress | 8.125% / PERIODIC_CAP | 8.125% / PERIODIC_CAP | ✅ |
| 12c | Reset 3 under 10.75% stress | 9.125% / PERIODIC_CAP | 9.125% / PERIODIC_CAP | ✅ |
| 12d | Reset 4 under 10.75% stress | 10.125% / LIFETIME_CAP | 10.125% / LIFETIME_CAP | ✅ |
| 12e | Stabilized rate, yearsToLifetimeCap set | 10.125% / non-null | 10.125% / 6.5 | ✅ |
| 13 | `computeLenderStressRate` stressRate | 10.125% (initial+lifetimeCap) | 10.125% | ✅ |
| 13b | stressRate ≠ resetPlus2Rate (no old bug) | true | true | ✅ |
| 14 | `computeARMReset.resetRateAtStressIndex` | 7.75% (NOT 10.125) | 7.75% | ✅ |
| 14b | Reset 1 NEVER binds LIFETIME_CAP | false | false | ✅ |
| 15a | 5/6 ARM + 60-mo IO (yr 5/5) | yr 5 / CRITICAL | yr 5 / CRITICAL | ✅ |
| 15b | 5/6 ARM + 84-mo IO (yr 5/7, Δ=2) | yr 7 / HIGH | yr 7 / HIGH | ✅ |
| 15c | 5/6 ARM + 120-mo IO (yr 5/10, Δ=5) | null / MODERATE | null / MODERATE | ✅ |
| 15d | 7/6 ARM + 84-mo IO (yr 7/7) | yr 7 / CRITICAL | yr 7 / CRITICAL | ✅ |

### Detailed view — `computeLenderStressRate` output
```
stressRate        = 10.125%   ← primary stress = lifetime cap (most conservative) ✅
resetPlus2Rate    = 8.340%    ← industry shorthand, bounded by lifetime cap
rateAfter4Resets  = 7.750%    ← realistic 4-reset stress trajectory
lifetimeCapRate   = 10.125%
trajectory        = (first 4 ladder points, scenario 11)
```
The function correctly surfaces all three lender-stress variants per spec Part B" "Engine surfaces both." The legacy v11.0 `min(reset+2%, lifetime cap)` single-step value (8.34%) is now demoted to an "alternative view" rather than the primary stress rate. ✅

### Detailed view — `computeARMReset` integrated output
For the flagship $318,750 loan @ 7.0% 5/6 ARM:
- `resetRateAtStressIndex = 7.75%` — the **stabilized** rate from `simulateARMResetLadder(arm, 5.0, 10)`. This is the correct modeling of sustained stress walking the periodic-cap ladder, NOT a single-reset jump to lifetime cap. ✅ (Golden value 14 satisfied.)

### ioArmDoubleShockYear logic trace (golden value 15)
The implementation at `armResetEngine.ts:286-298`:
```ts
if (ioPeriodMonths > 0) {
  const ioExpiryYear = Math.ceil(ioPeriodMonths / 12);
  const armResetYear = armTerms.fixedPeriodMonths / 12;
  if (Math.abs(ioExpiryYear - armResetYear) <= 1) {
    ioArmDoubleShockYear = Math.max(ioExpiryYear, armResetYear);
    doubleShockRisk = 'CRITICAL';
  } else if (Math.abs(ioExpiryYear - armResetYear) <= 2) {
    ioArmDoubleShockYear = Math.max(ioExpiryYear, armResetYear);
    doubleShockRisk = 'HIGH';
  } else {
    doubleShockRisk = 'MODERATE';  // year stays null
  }
}
```
- Tests both symmetric cases (5+5, 7+7 → CRITICAL), the 2-year-drift case (5+7 → HIGH), the 5-year-drift case (5+10 → MODERATE), and confirms the year value is `Math.max` of the two when within ±2. ✅

---

## 5. Defects Found

| # | Severity | Description | Recommendation |
|---|----------|-------------|----------------|
| D1 | **LOW** (cosmetic) | PITIA displayed as $3,128 vs spec's $3,129 — engine keeps tax/ins fractional and rounds only the final total; spec example pre-rounds each component. Track 1 DSCR still rounds to 0.96 in both. No material impact. | Optional: document rounding convention in spec; or add a "display-rounded" PITIA accessor that rounds each component first for UI parity. |
| D2 | **LOW** (cosmetic) | Compound factor `(1.006875)^360` displays as 11.782 in JS (Math.round of 11.78150…) vs spec's 11.781. The factor value itself is correct (1.0001 difference from spec), and the v5.0 bug (10.935) is definitively eliminated. | No code change; if a future spec revision wants round-half-even, document it explicitly. |
| D3 | **LOW** (defensive) | `computeLenderStressRate` returns `stressPayment: 0, stressDSCR: 0` with a comment "computed in caller with actual loan balance." Per spec Part B" "Engine surfaces both," callers must duplicate PI/DSCR math. Carry-over from v11.0 (AUDIT-6 issue 3). | Optional: extend signature to accept `loanBalanceAtReset, remainingTermMonths, qualifyingRent, monthlyFixedExpenses` and populate `stressPayment` / `stressDSCR`. Not a regression; pre-existing gap. |

**No CRITICAL defects. No HIGH defects. No MEDIUM defects. No regressions vs v11.0.**

---

## 6. Verdict

**✅ PASS** — All 15 golden values reproduce within spec tolerance. The v11.1 ARM reset engine fix (`simulateARMResetLadder`) correctly enforces:
1. First-reset cap = `initial + initialCap` (not lifetime cap)
2. Subsequent-reset cap = `min(prev + periodicCap, initial + lifetimeCap)`
3. `computeLenderStressRate` returns lifetime cap as the primary stress rate, with `reset+2%` and `rateAfter4Resets` as alternative views
4. No path anywhere applies lifetime cap as a single-reset cap (the old v11.0 bug is eliminated — verified by direct capBinding inspection across both scenarios)
5. `ioArmDoubleShockYear` correctly identifies the year of IO expiry AND ARM reset within ±1yr (CRITICAL), ±2yr (HIGH), or sets null with MODERATE risk

The math engine is spec-compliant and ready for production release.
