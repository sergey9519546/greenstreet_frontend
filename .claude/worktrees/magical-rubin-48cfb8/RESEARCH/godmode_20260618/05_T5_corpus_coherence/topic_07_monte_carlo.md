---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 7: Monte Carlo (t-Copula, R-Vine, Conformal)"
summary: "**TOPICAL_INDEX ref:** Lines 438–528 **Last update (per audit table):** Round 19"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - data/cotality
  - data/kbra
  - data/trepp
  - math/copula
  - math/sobol
  - math/t-copula
  - ml/conformal
  - ml/timesfm
  - slice/2
  - topic/str
tags:
  - topic/cure-rate
  - topic/monte-carlo
  - topic/short-rate
  - topic/yield-curve
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_07_monte_carlo.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 7: Monte Carlo (t-Copula, R-Vine, Conformal)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 438–528
**Last update (per audit table):** Round 19

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Base iterations 10,000; securitization 50,000 | ✅ Mathematically grounded |
| KBRA-calibrated marginal distributions table | ✅ Internally consistent |
| Correlation matrix (t-Copula ν=5-7) | ✅ Standard |
| Student-t copula (Gaussian BANNED) | ✅ Mathematically correct per T3 G5-02 |
| Variance reduction (Antithetic, Sobol, Stratified) | ✅ Per T3 G5-03 (Sobol QMC verified PASS 5/5) |
| Action thresholds (P(DSCR<1)>10% CONDITIONAL-GO, >15% PASS) | ✅ Reasonable |
| 54.8% of US counties had yield decline 2025-26 | ⚠️ Need verification — source? Round 12 claim. |
| CPTC (Conformal Prediction for Time-series with Change Points) | ✅ NeurIPS 2025 poster 118881, arXiv 2509.02844 |
| Distributional DSCR JSON schema | ✅ Aligned with TOPIC 13 outputs |
| Gaussian BANNED — 2008 CDO failure | ✅ Standard narrative |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 2 (math inputs — PITIA, debt service) | ✅ Aligned |
| TOPIC 13 (TimesFM, TFT — CPTC) | ✅ TOPIC 7 calls out CPTC, TOPIC 13 also mentions CPTC |
| TOPIC 6 (Action Thresholds in AC #23 — Distributional DSCR) | ✅ Aligned |
| TOPIC 12 (Monte Carlo rate path simulation — CIR or Hull-White) | ✅ TOPIC 12 says CIR or Hull-White; TOPIC 7 says CIR or Hull-White — consistent |

## 3. Round 19 Verification

**Group 5 — Monte Carlo (4 claims verified):**
- G5-01 t-copula df=5-7 — **TIER 1 CONFIRMED**
- G5-02 Gaussian vs Student-t (Gaussian BANNED) — **TIER 1 CONFIRMED**
- G5-03 Sobol QMC convergence — **TIER 1 CONFIRMED**
- G5-04 CVaR / Expected Shortfall coherence — **TIER 1 CONFIRMED**

**T4 Algorithm Validation (T4 #1-4):**
- algo_01 t-copula Monte Carlo — **PASS 5/5**
- algo_02 Sobol QMC — **PASS 5/5**
- algo_03 Brent brentq — **PASS 5/5** (used in deal_break_rate)
- algo_04 CVaR / Expected Shortfall — **PASS 5/5**

**T11 Hardcore Algos:** NSS-Svensson + Hull-White + Vasicek/CIR feed the rate path (TOPIC 12 not TOPIC 7 directly, but layered ensemble bridges both).

**Slice 2 P2-1 acceptance test ready:** t-copula MC (N=50k, df=4) + Sobol QMC + 99% ES, assert t-copula ES ≥ 1.10× Gaussian-copula ES — concrete hook for Slice 2 build.

**All Round 19 verifications pass.** TOPIC 7 is current and rigorous.

## 4. Stale Items

- **54.8% county yield decline claim** (line 492) — cited as 2025-26 fact; needs source citation. Per T3 G8-05, "DSCR-LTR cure 50-65% / DSCR-STR 36-60%" — this is cure rate not yield decline.
- **Last update Round 19 stamp** should be applied.

## 5. Cross-References Validity

- TOPIC 2 link ✅
- TOPIC 13 link ✅
- TOPIC 6 link ✅

## 6. Verdict

**VERIFIED**

**Confidence: 5/5** (all 4 T3 G5 claims + 4 T4 algorithm validations pass; Slice 2 P2-1 hook ready)

## 7. Recommended Actions

1. **Cite source for "54.8% of US counties had yield decline 2025-26"** — needs Round 12 source reference. Likely Cotality or Trepp.
2. **Update last-update stamp to Round 19.**
3. **Cross-link to Slice 2 P2-1 acceptance test** in build documentation.
4. **No critical actions** — TOPIC 7 is the most thoroughly verified TOPIC in the corpus.