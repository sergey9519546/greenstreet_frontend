# AUDIT-FINAL-6 — STR Underwriting Correctness + Monthly Seasonality (v11.1)

**Task ID:** AUDIT-FINAL-6
**Agent:** Audit-Subagent-6 (general-purpose)
**Scope:**
- `src/lib/dscr/strUnderwriting.ts` (three worlds, legality gate, seasonality)
- `src/lib/dscr/types.ts` (STRUnderwritingResult, STRMonthlySeasonality, STRMonthBreakdown)
- `src/app/page.tsx` (STRAnalysis component — seasonality chart)
- `src/lib/dscr/decisionSupport.ts` (deal-kill DSCR floor)
- `scripts/audit7_str_tests.ts` (test suite)

---

## 1. Three-World Verification (items 1–5)

### Item 1 — World 1: Long-term Market Rent (lower of lease and 1007, no haircut)

**Code location:** `strUnderwriting.ts` `buildWorld1()` (lines 421–434).

```ts
function buildWorld1(ltrMarketRent: number, pitiaTotal: number): STRWorld {
  const dscr = pitiaTotal > 0 ? ltrMarketRent / pitiaTotal : 0;
  return {
    name: 'World 1 — Long-term Market Rent',
    grossIncome: ltrMarketRent,
    haircutPercent: 0,            // ✓ no haircut
    netIncome: ltrMarketRent,
    ltrFallback: ltrMarketRent,
    qualifyingRent: ltrMarketRent,
    dscr: Math.round(dscr * 1000) / 1000,
    method: 'Lower of lease and 1007 market rent — no vacancy haircut',
    lenderConfirmationRequired: false,
  };
}
```

Caller (`evaluateSTRUnderwriting` line 321): `ltrFallback = Math.min(property.leaseRent, property.marketRent)`. ✓

**Test C1–C4** (lease $3,000, market $3,100): World 1 grossIncome=$3,000, haircutPercent=0, netIncome=$3,000, qualifyingRent=$3,000. ✓ PASS

### Item 2 — World 2: Projected STR (STR_Gross × 0.80, no per-world LT cap)

**Code location:** `strUnderwriting.ts` `buildWorld2()` (lines 436–464).

**v11.1 FIX (D-1, HIGH):** Removed `Math.min(netIncome, ltrFallback)` LT cap. Per spec items 2 & 5, World 2 qualifyingRent = STR_Gross × 0.80 when CLEAR. LT fallback applied only when UNCERTAIN (STEP 5 override).

```ts
const netIncome = strGrossProjected * (1 - PROJECTED_STR_HAIRCUT_PCT / 100);
const qualifyingRent = netIncome;  // ✓ no LT cap — was Math.min(netIncome, ltrFallback)
```

`PROJECTED_STR_HAIRCUT_PCT = 20` (line 30). ✓

**Test C5–C8** (strProjected $4,500): grossIncome=$4,500, haircutPercent=20, netIncome=$3,600, qualifyingRent=$3,600. ✓ PASS (was failing pre-fix with qualifyingRent=$3,000)

### Item 3 — World 3: Documented Historical (12-mo actual × 0.90, lower haircut than World 2)

**Code location:** `strUnderwriting.ts` `buildWorld3()` (lines 466–491).

**v11.1 FIX (D-1, HIGH):** Same fix as World 2 — removed `Math.min(netIncome, ltrFallback)` LT cap.

```ts
const netIncome = strGrossDocumented * (1 - DOCUMENTED_STR_HAIRCUT_PCT / 100);
const qualifyingRent = netIncome;  // ✓ no LT cap
```

`DOCUMENTED_STR_HAIRCUT_PCT = 10` (line 31). ✓ Lower than World 2's 20% because actuals more reliable.

**Test C9–C13** (strDocumented $4,000): grossIncome=$4,000, haircutPercent=10, netIncome=$3,600, qualifyingRent=$3,600. C13 verifies 10 < 20. ✓ PASS

### Item 4 — Best World Selection: MIN (not MAX)

**Code location:** `strUnderwriting.ts` STEP 6 (lines 381–393).

```ts
const worlds = [world1, world2, world3];
const bestWorld = worlds.reduce(
  (best, w) => (w.qualifyingRent < best.qualifyingRent ? w : best),  // ✓ MIN
  world1,
);
```

Comment updated to reflect v11.1 spec: "APPRAISAL GOVERNS: min() across sources." Each world's qualifyingRent computed independently per spec items 1–3 (NO per-world LT cap). MIN ensures most conservative income source governs.

**Test C14–C17** (LT $3,000 / STR net $3,600 / Doc net $3,600):
- C14: bestQualifyingRent = $3,000 (MIN) ✓
- C15: equals `Math.min(worlds)` ✓
- C16: bestWorld = "World 1" ✓
- C17: haircutPercent = 0 (World 1 wins) ✓

**Test J6** (LT $5,000 / STR net $3,200 / Doc net $3,150): bestQualifyingRent = $3,150 (MIN) → World 3. ✓

### Item 5 — World 2/3 Fall Back to LT When Legality UNCERTAIN

**Code location:** `strUnderwriting.ts` STEP 5 (lines 367–378).

```ts
if (legalityGate.status === 'UNCERTAIN') {
  world2.qualifyingRent = ltrFallback;
  world2.method = 'Speculative only — legality UNCERTAIN, LT fallback used for qualification';
  world2.lenderConfirmationRequired = true;
  world2.dscr = pitiaTotal > 0 ? ltrFallback / pitiaTotal : 0;
  // same for world3
}
```

✓ LT fallback applied to World 2/3 qualifyingRent when UNCERTAIN. PROHIBITED case (STEP 3) returns world1 only with strGross=0 for world2/3.

**Test F1–F6** (hoaSTRPolicy=UNKNOWN → UNCERTAIN): World 2/3 qualifyingRent = $3,000 (LT), lenderConfirmationRequired=true. ✓ PASS

---

## 2. Legality Gate Verification (items 6–10)

### Item 6 — CLEAR → STR income enabled

**Test D1–D2** (HOA=ALLOWS + LOW enforcement + permit): status=CLEAR, incomeEnabled=true. ✓

### Item 7 — RESTRICTED → incomeEnabled=true (NOT false — v11.0 bug FIXED)

**Code location:** `strUnderwriting.ts` RESTRICTED block (lines 226–241).

```ts
return {
  status: 'RESTRICTED',
  ...
  incomeEnabled: true,  // ✓ v11.0 had false (bug); v11.1 fixed to true
};
```

**Test D3–D4** (CA + HOA=ALLOWS + LOW enforcement + permit): status=RESTRICTED, incomeEnabled=true. ✓ PASS

### Item 8 — UNCERTAIN → STR income shown only as speculative scenario (LT fallback used)

**Test F1–F6** (HOA=UNKNOWN): status=UNCERTAIN, incomeEnabled=false, world2/3 qualifyingRent=LT ($3,000). ✓ PASS

### Item 9 — PROHIBITED → all STR income disabled, only World 1 LT shown

**Test E1–E7** (HOA=PROHIBITS): status=PROHIBITED, incomeEnabled=false, world2/3 grossIncome=0, bestQualifyingRent=$3,000 (LT), bestWorld=World 1. ✓ PASS

### Item 10 — HOA SILENT and UNKNOWN both trigger UNCERTAIN with attorney review required

**v11.1 FIX (D-3, HIGH):** `checkSTRLegality` UNCERTAINTY block (lines 191–224) now includes `hoaSilent = hoaPolicy === 'SILENT'` in the condition. v11.0 only treated UNKNOWN.

```ts
const hoaUnknown = hoaPolicy === 'UNKNOWN';
const hoaSilent = hoaPolicy === 'SILENT';  // ✓ NEW v11.1
...
if (hoaUnknown || hoaSilent || pendingLegislationRisk || ...) {
  ...
  if (hoaSilent) reasons.push('HOA governing docs are SILENT on STR — attorney must review CC&Rs to confirm no implied prohibition before relying on STR income.');
  ...
}
```

**Test S1–S4:** HOA=SILENT → UNCERTAIN; summary mentions attorney/CC&Rs review. HOA=UNKNOWN → UNCERTAIN. ✓ PASS

---

## 3. STR DSCR Floor Verification (item 11)

### Item 11 — STR deals require DSCR ≥ 1.0 (higher than LTR's 0.75)

**v11.1 FIX (D-2, HIGH):** `decisionSupport.ts` `computeDealKillCheck` BLOCKER 1 (lines 380–400) now uses strategy-aware DSCR floor.

```ts
const dscrFloor = strategy === 'STR' ? 1.0 : 0.75;
if (dscrResult.dscr < dscrFloor) {
  criteria.push({
    criterion: strategy === 'STR'
      ? 'Track 1 DSCR below 1.00× (STR floor)'
      : 'Track 1 DSCR below 0.75×',
    triggered: true,
    severity: 'BLOCKER',
    detail: strategy === 'STR'
      ? `Track 1 DSCR is ${dscrResult.dscr.toFixed(2)}× — below the 1.00× floor for STR deals (higher than LTR's 0.75× due to occupancy/seasonality/regulation volatility).`
      : `Track 1 DSCR is ${dscrResult.dscr.toFixed(2)}× — below the 0.75× floor for nearly all DSCR programs.`,
    action: strategy === 'STR'
      ? 'Reduce purchase price, increase down payment, switch to IO, find no-ratio STR lender (e.g., Easy Street), or switch to LTR strategy.'
      : 'Reduce purchase price, increase down payment, switch to IO, or find a no-ratio lender.',
  });
}
```

WARNING 1 (sub-1.0 DSCR) also updated to skip when strategy=STR (already blocked).

**Test P1–P5:**
- P1: STR @ DSCR 0.85 → BLOCKER ✓
- P2: criterion mentions "1.00×" or "STR floor" ✓
- P3: LTR @ DSCR 0.85 → NO BLOCKER (LTR floor = 0.75) ✓
- P4: STR @ DSCR 1.05 → NO BLOCKER ✓
- P5: LTR @ DSCR 0.70 → BLOCKER (below 0.75 LTR floor) ✓

---

## 4. Monthly Seasonality Verification (items 12–20)

### Sample Computation Trace — $5,000 STR rent, $3,000 PITIA

**Inputs:**
- `annualProjectedSTR` = $5,000/mo × 12 = **$60,000**
- `monthlyPITIA` = **$3,000**
- `haircutPct` = 20% (default `PROJECTED_STR_HAIRCUT_PCT`)
- `seasonalityIndex` = `US_NATIONAL_STR_SEASONALITY` (12 entries)
- `indexSum` = 75+80+95+105+110+130+140+130+100+95+80+90 = **1230**

**Formula** (per `computeSTRMonthlySeasonality` lines 84–98):
```
projectedRevenue = annualProjectedSTR × index / indexSum
haircutRevenue   = projectedRevenue × (1 − haircutPct/100)
monthlyDSCR      = haircutRevenue / monthlyPITIA
isOffSeason      = monthlyDSCR < 1.0
```

**Per-month trace:**

| Month | Index | Projected | Haircut (×0.80) | DSCR | Off-Season? |
|-------|-------|-----------|-----------------|------|-------------|
| Jan   | 75    | $3,659    | $2,927          | 0.976 | **YES** ⚠️ |
| Feb   | 80    | $3,902    | $3,122          | 1.041 | no          |
| Mar   | 95    | $4,634    | $3,707          | 1.236 | no          |
| Apr   | 105   | $5,122    | $4,098          | 1.366 | no          |
| May   | 110   | $5,366    | $4,293          | 1.431 | no          |
| Jun   | 130   | $6,341    | $5,073          | 1.691 | no          |
| **Jul** | **140** | **$6,829** | **$5,463** | **1.821** | no (PEAK) ★ |
| Aug   | 130   | $6,341    | $5,073          | 1.691 | no          |
| Sep   | 100   | $4,878    | $3,902          | 1.301 | no          |
| Oct   | 95    | $4,634    | $3,707          | 1.236 | no          |
| Nov   | 80    | $3,902    | $3,122          | 1.041 | no          |
| Dec   | 90    | $4,390    | $3,512          | 1.171 | no          |

**Aggregate:**
- annualRevenueProjected = $60,000 (sum of projected)
- annualRevenueHaircut = $48,000 (sum of haircut = $60K × 0.80)
- offSeasonMonths = `['Jan']` (1 month below 1.0× DSCR)
- worstMonth = `Jan` (DSCR 0.976)
- bestMonth = `Jul` (DSCR 1.821)
- warningMessage: "⚠️ 1 month below 1.0 DSCR: Jan. Worst: Jan (0.98×). Investor must reserve cash for off-season PITIA gaps."

### Item 12 — Returns 12 STRMonthBreakdown entries

**Test Q1:** `seasonality.months.length === 12` ✓ PASS

### Item 13 — Each entry has month, monthIndex, seasonalityIndex, projectedRevenue, haircutRevenue, monthlyPITIA, monthlyDSCR, isOffSeason

**Code location:** `types.ts` `STRMonthBreakdown` (lines 457–466) — all 8 fields present.

**Test Q2:** All 8 required fields present in every entry. ✓ PASS

### Item 14 — US_NATIONAL_STR_SEASONALITY has 12 entries summing to ~1200

**Code location:** `strUnderwriting.ts` lines 43–56. 12 entries; sum = 1230 (within 5% of 1200).

**Test Q3, Q4:** length=12; sum=1230 (within 1140–1260 range). ✓ PASS

### Item 15 — Jul index = 140 (peak), Jan index = 75 (low)

**Test Q5, Q6, Q7:** Jul=140, Jan=75, Jul is max (peak). ✓ PASS

### Item 16 — Off-season months correctly identified (monthlyDSCR < 1.0)

**Test Q8:** isOffSeason=true iff monthlyDSCR < 1.0 (consistency check). ✓ PASS

**Sample trace Q9–Q12 (Jan):** projected=$3,659, haircut=$2,927, DSCR=0.976, isOffSeason=true. ✓ PASS

**Sample trace Q13–Q16 (Jul):** projected=$6,829, haircut=$5,463, DSCR=1.821, isOffSeason=false. ✓ PASS

### Item 17 — warningMessage includes off-season warning when applicable

**Code location:** `strUnderwriting.ts` lines 110–124. Off-season warning built when `offSeasonMonths.length > 0`.

**Test Q17, Q18:** warningMessage contains "below 1.0" / "DSCR"; offSeasonMonths non-empty for $60K/$3K scenario. ✓ PASS

### Item 18 — STRAnalysis component renders the monthly bar chart

**Code location:** `page.tsx` STRAnalysis component (lines 1784–1872). Card titled "Monthly Seasonality & Off-Season Stress" with `monthlySeasonality.months.map(...)` rendering 12-bar chart.

**Test R1, R2:** page.tsx contains "Monthly Seasonality" header and `months.map`. ✓ PASS

### Item 19 — Bar colors: green ≥1.0, amber 0.75-1.0, red <0.75

**Code location:** `page.tsx` lines 1801–1803.

```tsx
const barColor = m.monthlyDSCR >= 1.0
  ? (m.monthlyDSCR >= 1.25 ? 'bg-emerald-500' : 'bg-emerald-600/70')  // green ≥1.0
  : (m.monthlyDSCR >= 0.75 ? 'bg-amber-500' : 'bg-red-500');          // amber 0.75-1.0, red <0.75
```

**Test R3, R4, R5:** green (emerald) ≥1.0, amber 0.75-1.0, red <0.75. ✓ PASS

### Item 20 — Off-season warning card displayed when offSeasonMonths.length > 0

**Code location:** `page.tsx` lines 1854–1869. Conditional render: `offSeasonMonths.length > 0` shows red warning card; `=== 0` shows emerald "Year-Round Positive Carry" card.

**Test R6, R7:** Off-season warning card and stable card both present. ✓ PASS

---

## 5. Defects Found & Fixed

| ID | Severity | Description | Fix |
|----|----------|-------------|-----|
| **D-1** | **HIGH** | `buildWorld2`/`buildWorld3` applied `Math.min(netIncome, ltrFallback)` LT cap to qualifyingRent in CLEAR case. This made World 2/3 redundant whenever STR net > LT (the typical STR-deal case), contradicting spec items 2/3 which define each world's qualifyingRent as just the haircutted income. Per-world DSCR calculations (e.g., World 2 DSCR for $3,600 net / $2,854 PITIA) returned ~1.051 (LT basis) instead of the correct ~1.262 (STR net basis). 14 audit7 tests failed. | Removed LT cap from `buildWorld2`/`buildWorld3`: `qualifyingRent = netIncome`. LT fallback still applied in STEP 5 (UNCERTAIN) and STEP 3 (PROHIBITED via strGross=0). Updated method strings. Updated STEP 6 comment to clarify "appraisal governs min()" is enforced at the BEST-WORLD selection step, not per-world. |
| **D-2** | **HIGH** | `computeDealKillCheck` BLOCKER 1 used fixed 0.75 DSCR floor for ALL strategies. STR deals (more volatile income — occupancy, seasonality, regulation) require higher 1.0 floor per spec item 11. STR deals with DSCR 0.75-1.0 were not blocked, only warned, understating risk. | Added `dscrFloor = strategy === 'STR' ? 1.0 : 0.75` with strategy-specific criterion text, detail, and action. Updated WARNING 1 (sub-1.0 DSCR) to skip when strategy=STR (already blocked). |
| **D-3** | **HIGH** | `checkSTRLegality` UNCERTAINTY conditions only included `hoaPolicy === 'UNKNOWN'`. HOA=SILENT fell through to CLEAR/RESTRICTED, understating legal risk. Per spec item 10, SILENT and UNKNOWN both trigger UNCERTAIN with attorney review required. v11.0 only treated UNKNOWN. | Added `hoaSilent = hoaPolicy === 'SILENT'` to UNCERTAINTY conditions and corresponding reason string: "HOA governing docs are SILENT on STR — attorney must review CC&Rs to confirm no implied prohibition." Updated test D3/D4 to use HOA=ALLOWS (so they correctly test RESTRICTED status without SILENT preempting). |
| **D-4** | **MEDIUM** | `audit7_str_tests.ts` was stale — 14 tests expected v11.0 (MAX) behavior at both per-world and best-world levels. Tests C8/C12 expected World 2/3 qualifyingRent = STR net when STR > LT (correct v11.1 reading), but C14/C15/C16/C17 expected bestQualifyingRent = MAX (v11.0 bug, fixed in v11.1 to MIN). Tests J2/J4 expected LT fallback when STR < LT (v11.0 per-world cap behavior; v11.1 removes per-world cap). Tests O2/O3/O4/O5 expected World 2/3 DSCR on STR net basis (correct after D-1 fix). | Updated C14/C15/C16/C17 to expect MIN behavior. Updated J2/J4 to expect STR net (no LT cap). Updated J6 to expect MIN of $3,150 → World 3. Updated G5 to expect $3,000 (MIN). O2/O3/O4/O5 now pass after D-1 fix (no test edit needed). Updated C-group header comment to reflect v11.1 MIN logic. Added GROUP P (5 checks — STR DSCR floor), GROUP Q (22 checks — monthly seasonality computation), GROUP R (7 checks — page.tsx component), GROUP S (4 checks — HOA SILENT). |
| **D-5** | **LOW** (documented, no fix) | `US_NATIONAL_STR_SEASONALITY` indices sum to 1230 (2.5% above spec's ~1200 target). Spec says "~1200 (100 avg × 12)" — within tolerance. | No fix — within the 5% tolerance enforced by test Q4 (1140–1260 range). Documented as informational. Future calibration could shift 2-3 indices down by 5-10 points to hit exactly 1200 (e.g., Jun 130→125, Aug 130→125, Sep 100→95, Oct 95→90 reduces sum by 20). |

---

## 6. Test Suite Results

### Primary audit suite (in scope)

```
$ npx tsx scripts/audit7_str_tests.ts
================================================================================
AUDIT-7: STR UNDERWRITING VERIFICATION — TEST RESULTS
================================================================================
Total checks: 141
Passed: 141
Failed: 0
Pass rate: 100.0%
================================================================================
[A] Structure (3 worlds): 7/7 passed
[B] STRWorld field completeness: 9/9 passed
[C] Test scenario math (the headline numbers): 18/18 passed
[D] Legality gate 4 statuses + incomeEnabled: 11/11 passed
[E] PROHIBITED → STR income disabled: 7/7 passed
[F] UNCERTAIN → speculative only, LT fallback: 6/6 passed
[G] CLEAR → STR income fully modeled: 5/5 passed
[H] Market direction warning (2026 trend): 4/4 passed
[I] Documentation checklist: 10/10 passed
[J] Worlds NEVER blended: 6/6 passed
[K] Easy Street Capital 100% override: 5/5 passed
[L] AIRDNA_PROJECTION 20% haircut: 4/4 passed
[M] LTR strategy no STR haircut: 2/2 passed
[N] Legality gate runs BEFORE income modeling: 3/3 passed
[O] Round-trip DSCR sanity: 5/5 passed
[P] v11.1 STR DSCR floor (≥1.0 vs LTR 0.75): 5/5 passed  ← NEW
[Q] v11.1 Monthly seasonality computation: 22/22 passed   ← NEW
[R] v11.1 STRAnalysis component (page.tsx): 7/7 passed    ← NEW
[S] v11.1 HOA SILENT triggers UNCERTAIN: 4/4 passed       ← NEW
================================================================================
✅ ALL AUDIT-7 STR UNDERWRITING CHECKS PASSED
================================================================================
```

### Regression checks (other audit suites)

| Suite | Pre-Final-6 | Post-Final-6 | Delta |
|-------|-------------|--------------|-------|
| `verify_v11.ts` | 53/53 ✓ | 53/53 ✓ | 0 |
| `audit_v7_full.ts` | (P1_LENDERS 32 + P2_PPP 13 + P3_RATES 3 + P4_PROVENANCE 4 + P5_STRUCT 5) ✓ | same ✓ | 0 |
| `audit4_ppp_tests.ts` | 61/61 ✓ | 61/61 ✓ | 0 |
| `audit5_provenance_tests.ts` | 277/277 ✓ | 277/277 ✓ | 0 |
| `audit6_reserve_tests.ts` | (full pass) ✓ | (full pass) ✓ | 0 |
| `audit8_sensitivity_tests.ts` | 90/90 ✓ | 90/90 ✓ | 0 |
| `audit9_optimizer_tests.ts` | (full pass) ✓ | (full pass) ✓ | 0 |

**No regressions.** All previously-green suites remain green.

### TypeScript compilation

```
$ npx tsc --noEmit src/lib/dscr/strUnderwriting.ts src/lib/dscr/decisionSupport.ts
(no output — clean)

$ npx tsc --noEmit scripts/audit7_str_tests.ts
(no output — clean)
```

---

## 7. Files Modified

1. **`src/lib/dscr/strUnderwriting.ts`** — D-1 (removed per-world LT cap in `buildWorld2`/`buildWorld3`), D-3 (added SILENT to UNCERTAIN conditions). Updated STEP 4/STEP 6 comments.
2. **`src/lib/dscr/decisionSupport.ts`** — D-2 (strategy-aware DSCR floor 1.0 STR / 0.75 LTR in BLOCKER 1; skip sub-1.0 WARNING for STR).
3. **`scripts/audit7_str_tests.ts`** — D-4 (updated 8 stale test expectations to v11.1 MIN spec; added 4 new test groups P/Q/R/S with 38 new checks; updated GROUP C header comment; updated D3/D4 to use ALLOWS instead of SILENT).

---

## 8. Verdict

**✅ PASS** — All 20 audit verification items pass.

- Three-world structure (items 1–5): PASS. Per-world LT cap removed (D-1); best world = MIN across independently-computed worlds; LT fallback applied only when UNCERTAIN.
- Legality gate (items 6–10): PASS. CLEAR→enabled, RESTRICTED→enabled (v11.0 false bug fixed), UNCERTAIN→speculative-only with LT fallback, PROHIBITED→all STR disabled. **HOA SILENT now triggers UNCERTAIN with attorney review (D-3 fix).**
- STR DSCR floor (item 11): PASS. **STR deals blocked at DSCR < 1.0 (D-2 fix); LTR floor remains 0.75.**
- Monthly seasonality (items 12–20): PASS. 12 entries with all 8 required fields; Jul=140 peak, Jan=75 low; off-season detection (monthlyDSCR < 1.0) consistent; warningMessage includes off-season advisory; page.tsx renders 12-bar chart with green/amber/red color thresholds and off-season warning card.

**Defects fixed:** 3 HIGH (D-1 per-world LT cap, D-2 STR DSCR floor, D-3 HOA SILENT UNCERTAIN), 1 MEDIUM (D-4 stale tests + new test groups), 1 LOW documented (D-5 seasonality index sum 1230 vs ~1200 target — within tolerance).

**Test suite:** audit7_str_tests.ts 141/141 (was 88/102 pre-fix); verify_v11.ts 53/53; no regressions across 7 other audit suites. TypeScript compilation clean.

STR underwriting module is spec-compliant and ready for production release.
