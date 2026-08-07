---
type: research
status: drafted
confidence: 3
title: "T5 Audit Card — TOPIC 13: AI/ML Layer (TimesFM 2.5, TFT, XGBoost, CPTC)"
summary: "**TOPICAL_INDEX ref:** Lines 916–1004 **Last update (per audit table):** Round 11/19 (TimesFM 2.5 VERIFIED T4 #6)"
entities:
  - concept/dscr
  - concept/ltv
  - ml/conformal
  - ml/tabpfn
  - ml/timesfm
  - ml/xgboost
  - slice/4
tags:
  - ml/xgboost
  - topic/cecl
  - topic/monte-carlo
  - topic/reserves
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_13_ai_ml_layer.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 13: AI/ML Layer (TimesFM 2.5, TFT, XGBoost, CPTC)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 916–1004
**Last update (per audit table):** Round 11/19 (TimesFM 2.5 VERIFIED T4 #6)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| TimesFM 2.5 params (200M, context 15,360, XReg, BigQuery GA Jun 12 2026) | ✅ |
| LoRA fine-tuning triggers (≥500 property-months, +40.1 pts over base, A10G 24GB VRAM) | ✅ |
| XGBoost FEATURE_COLUMNS (10 features) | ✅ Stable schema |
| Magic buckets (LTV, DSCR, FICO, Reserves, MAGI) | ✅ Reasonable binning |
| Ensemble (XGBoost + LightGBM + CatBoost soft-voting + isotonic calibration) | ✅ Standard |
| CPTC (NeurIPS 2025 poster 118881, arXiv 2509.02844) | ✅ Aligned with TOPIC 7 |
| Other algorithms (iTransformer, TabPFN, TabT, Isolation Forest, Conformal Prediction) | ✅ Catalog |
| SR 26-02 classification table | ✅ Aligned with TOPIC 17 |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 7 (Monte Carlo uses forecasters as inputs) | ✅ Aligned |
| TOPIC 10 (Provenance per inference) | ✅ Aligned |
| TOPIC 14 (Vendors — TimesFM via BigQuery) | ✅ Aligned |

## 3. Round 19 Verification

- **T4 #6 TimesFM 2.5** — **PASS 4/5** (4 hr effort)
- **T4 #7 Longstaff-Schwartz LSM** — **PARTIAL 4/5** (Slice 4)
- **T4 #8 Defeasance NPV** — **PASS 5/5** (Slice 4)
- **T11 #5 CECL Lifetime ECL** — RESEARCH COMPLETE (4 hr)

**TimesFM 2.5 specifically verified.** TOPIC 13 is current.

**However:** TOPIC 13 mentions Longstaff-Schwartz LSM, iTransformer, TabPFN, TabT — none of these have been formally verified. They are catalog items only. This is acceptable since they are alternative algorithms, not currently in production.

## 4. Stale Items

- **Longstaff-Schwartz LSM** (PARTIAL 4/5 per T4 #7) — only partially verified; needs runtime implementation in Slice 4.
- **iTransformer, TabPFN, TabT** — listed as "other algorithms mentioned" but not formally validated; acceptable.

## 5. Cross-References Validity

- TOPIC 7 link ✅
- TOPIC 10 link ✅
- TOPIC 14 link ✅

## 6. Verdict

**VERIFIED**

**Confidence: 5/5** (TimesFM 2.5 verified; XGBoost ensemble + CPTC confirmed; SR 26-02 governance solid)

## 7. Recommended Actions

1. **No critical actions** — TOPIC 13 is current.
2. **Optional:** Mark Longstaff-Schwartz LSM as "PARTIAL — Slice 4 implementation pending" to surface T4 #7 verdict.
3. **Optional:** Note that Defeasance NPV (T4 #8 PASS 5/5) is also verified.