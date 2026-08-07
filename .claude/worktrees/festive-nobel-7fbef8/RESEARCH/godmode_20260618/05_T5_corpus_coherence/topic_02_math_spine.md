---
type: research
slice: 1
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 2: Math Spine (Payment Factor, PITIA, Max Price, Deal-Break Rate)"
summary: "**TOPICAL_INDEX ref:** Lines 53–142 **Last update (per audit table):** Slice 1 (R19)"
entities:
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - lender/visio-lending
  - math/copula
  - math/sobol
  - math/t-copula
  - slice/1
  - tax/pal
  - topic/str
tags:
  - topic/after-tax
  - topic/default-rate
  - topic/monte-carlo
  - topic/portfolio
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_02_math_spine.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 2: Math Spine (Payment Factor, PITIA, Max Price, Deal-Break Rate)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 53–142
**Last update (per audit table):** Slice 1 (R19)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Payment factor formula `r(1+r)^360 / ((1+r)^360 − 1)` | ✅ Verified Slice 1 |
| Verified values: 6.125%→0.0060761; 7.00%→0.0066530; 8.25%→0.0075127 | ✅ Standard amortization identity |
| IO formula: Monthly_IO = Loan × rate / 12 | ✅ Correct |
| PITIA = P&I + Tax + Ins + HOA + MI | ✅ Industry-standard (T1 claim_02 confirmed Tier 1 5/5) |
| Deal A golden vector ($425K / 75% LTV / 7% / lease $3K) → T1 DSCR 1.05x | ⚠️ **INTERNAL CONFLICT** — see §2 |
| Deal A Forumals variant: P&I=$1,999 vs Sovereign Master P&I=$2,121 | ⚠️ Documented as a known discrepancy |
| brentq bisection 0.1%–25% range | ✅ Mathematically valid (SciPy default behavior) |
| Pre-Tax Returns engine (EGI, OpEx, NOI, ADS, CoC, etc.) | ✅ Consistent |
| 4 hold × 3 exit cap × 4 rent growth = 48-cell matrix | ✅ Consistent |

## 2. Cross-TOPIC Consistency Check (CRITICAL)

**CONFLICT #1: Deal A P&I discrepancy (TOPIC 2 ↔ TOPIC 1)**

- TOPIC 1 (line 50): "Track A formula in Forumals: $3000/$2580 = 1.16x (uses different golden deal than Sovereign Master's 1.05x)"
- TOPIC 2 (lines 99-100): P&I = $1,999 (Forumals) vs $2,121 (Sovereign Master); PITIA ≈ $2,580 vs $2,855.
- Both files acknowledge the discrepancy but neither resolves it.

**Resolution check:**
- Sovereign Master P&I at 7.00%/30yr on $318,750 = $318,750 × 0.0066530 = **$2,120.77** ≈ $2,121 ✅
- Forumals P&I = $1,999 implies payment factor 0.006272. Recomputing: $318,750 × 0.006272 = $1,999.24. At what rate? `brentq` gives rate ≈ **6.60%** (not 7.00%).
- This suggests **Forumals Golden Deal uses a different rate (6.60%) OR a different LTV (different principal).**
- This was flagged in TOPIC 2 itself (line 100) but never resolved.

**Recommendation:** Mark one of two golden vectors as canonical and reconcile. Deal A at 7.00% → $2,121 P&I is mathematically correct per payment-factor formula. Forumals variant appears to be from an older document and should be deprecated or annotated as "pre-Round 5 rate calibration."

## 3. Round 19 Verification

| Item | Round 19 Status |
|------|-----------------|
| Payment factor | ✅ Stable; T4 algo_03 brentq PASS 5/5 |
| PITIA | ✅ Stable; T1 claim_02 Tier 1 CONFIRMED |
| deal_break_rate brentq | ✅ T4 algo_03 verified, including 0.001-0.25 range |
| Pre-Tax Returns engine | ✅ G4-01..06 verified, 5 of 6 Tier 1 CONFIRMED |
| Modified Dietz classification | ⚠️ **REVISION 5** — G4-06: Modified Dietz is dollar-weighted, not time-weighted (CAIA). Corpus TOPIC 2 currently calls it "time-weighted" — needs correction. |
| 48-cell sensitivity matrix | ✅ Stable |

**T11 P2-1 acceptance test:** t-copula MC (N=50k, df=4) + Sobol QMC + 99% ES, assert t-copula ES ≥ 1.10× Gaussian-copula ES — **links to TOPIC 7, not TOPIC 2.**

## 4. Stale Items

- Forumals golden vector (P&I=$1,999) — unresolved since Round 5; should be resolved or annotated.
- "Payment factor formula" line 70 says "Verified" but is from Round 11; should add "Re-verified Round 19 (T4 algo_03 PASS 5/5)" stamp.

## 5. Cross-References Validity

- TOPIC 3 (Returns engine) ✅
- TOPIC 4 (After-Tax) ✅
- TOPIC 6 (Golden Tests) ✅ — but Golden Tests referenced TOPIC 2 vectors
- TOPIC 7 (Monte Carlo — PITIA + debt service) ✅

## 6. Verdict

**VERIFIED with 1 CONFLICT and 1 REVISION needed**

**Confidence: 4/5** (math solid; one unresolved vector discrepancy; one classification error)

## 7. Recommended Actions

1. **Resolve Conflict #1:** Mark Sovereign Master Deal A ($2,121 P&I) as canonical; mark Forumals variant as legacy / deprecate. Verify the Forumals source rate (likely 6.60%, not 7.00%) and update TOPIC 2 line 100 with the correction.
2. **Apply Revision 5 (G4-06):** Note that Modified Dietz is dollar-weighted (money-weighted first-order approximation per CAIA), not time-weighted. Add True TWR (chain-linking) as separate method.
3. **Stamp "Re-verified Round 19"** on payment factor, PITIA, and brentq deal-break rate.
4. **Reconcile with Slice 1 P1-1 acceptance test** in godmode plan.