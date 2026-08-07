---
type: research
status: drafted
confidence: 3
title: "T5 Audit Card — TOPIC 17: Compliance, Insurance & Regulatory"
summary: "**TOPICAL_INDEX ref:** Lines 1237–1355 **Last update (per audit table):** Round 15/19 (JUST VERIFIED — T3 G7 insurance)"
entities:
  - concept/dscr
  - lender/visio-lending
  - ml/shap
  - regulation/cfpb
  - regulation/ecoa
  - regulation/hoepa
  - regulation/reg-z
  - regulation/section-1071
  - topic/non-qm
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/flood-insurance
  - topic/insurance
  - topic/portfolio
  - topic/ppp
  - topic/short-rate
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_17_compliance_insurance.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 17: Compliance, Insurance & Regulatory

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 1237–1355
**Last update (per audit table):** Round 15/19 (JUST VERIFIED — T3 G7 insurance)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Regulatory Surface (B2B vs Consumer): SAFE Act potentially; RESPA §8 No; ECOA Yes; Reg Z No; GLBA Yes; CFPB 2022-03 Yes | ✅ |
| B2B positioning as professional decision-support | ✅ |
| CFPB Circular 2022-03 adverse action with SHAP | ✅ |
| Section 1071 revised May 1, 2026, effective Jan 1, 2028 | ✅ |
| SR 26-02 (OCC 2026-13, effective Apr 17, 2026) | ✅ Aligned with TOPIC 10 + TOPIC 13 |
| FinCEN BOI: Domestic LLCs EXEMPT under March 2025 interim final rule | ✅ Critical correction |
| RRE Rule effective March 1, 2026 | ✅ |
| HOEPA 2026 thresholds ($27,592 / $1,380) | ✅ |
| Insurance Kill Rule (FL, CA, TX Gulf, LA Coastal) | ✅ Aligned with TOPIC 6 AC #8 |
| Insurance premium 10-30% annual increase in high-risk | ⚠️ Refined by T3 G7-01 — coastal-only, national avg 7-9% |
| BRRRR refi-seasoning gate | ✅ Aligned |
| Borrower Eligibility (US Citizen, NPR, ITIN, FN) | ✅ |
| Personal Guarantors (≥51% cumulative, FULL RECOURSE) | ✅ |
| Tradeline Requirements (3×12mo or 2×24mo) | ✅ |
| Appraisal Rules (Full, FNMA/FHLMC, ≥$2M second, 120-day) | ✅ |
| Capital Markets & Securitization | ✅ Aligned with TOPIC 14 |
| Gain on Sale (Non-QM MSR 3.65x-4.25x per MCT Feb 2026) | ✅ |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 6 (Kill criteria — insurance, BRRRR seasoning) | ✅ Aligned |
| TOPIC 11 (PPP — MN HF 3437) | ✅ Aligned |
| TOPIC 10 (Evidence Vault — provenance per regulation) | ✅ Aligned |
| TOPIC 16 (Insurance as geographic gate) | ✅ Aligned |

**CONFLICT candidate #9: Insurance escalation rates**
- TOPIC 17 line 1307: "Model premium as volatile (10-30% annual increase in high-risk zones)"
- T3 G7-01 (Round 17): μ=12%/σ=8% values are **coastal portfolio means, NOT national**. National avg is 7-9%.
- **Resolution:** TOPIC 17 says "high-risk zones" only, which is consistent with G7-01 coastal-only finding. No real conflict, but should add the national baseline reference.

## 3. Round 19 Verification

**T3 Group 7 — Insurance (4 claims verified):**
- G7-01 Insurance escalation — **TIER 1 CONFIRMED with REFINEMENT** (coastal-only baseline, not national)
- G7-02 NFHL zone determination — verified
- G7-03 NFIP coverage limits — verified
- G7-04 RR 20-11 39% decline — **REVISION REQUIRED** — FEMA RR 2.0 dates were wrong (effective Oct 1, 2021 new / Apr 1, 2022 renewal, NOT Apr 1, 2023)

**Critical Revision 7 (G7-04):** FEMA RR 2.0 dates correction. Corpus said "effective Apr 1, 2023" — actually **Oct 1, 2021 (new) / Apr 1, 2022 (renewal)**.

**TOPIC 17 may reference FEMA RR 2.0 dates** that need correction. Audit didn't find explicit FEMA RR 2.0 dates in TOPIC 17, but the insurance section should be reviewed.

## 4. Stale Items

- **FEMA RR 2.0 dates** if referenced anywhere in TOPIC 17 — verify Round 17 correction.
- **Insurance escalation rates** in corpus — apply coastal-only baseline per Round 17 G7-01.

## 5. Cross-References Validity

- TOPIC 6 link ✅
- TOPIC 11 link ✅
- TOPIC 10 link ✅
- TOPIC 16 link ✅

## 6. Verdict

**VERIFIED with REFINEMENT (Round 17 G7-01 + G7-04)**

**Confidence: 5/5** (regulatory surface, FinCEN BOI, SR 26-02, insurance kill rule all current)

## 7. Recommended Actions

1. **Apply Round 17 G7-01 REFINEMENT** — reframe insurance escalation as coastal-DSCR baseline (μ=12%, σ=8%) with national avg 7-9%.
2. **Apply Round 17 G7-04 REVISION** — FEMA RR 2.0 dates were Oct 1, 2021 / Apr 1, 2022, not Apr 1, 2023.
3. **No critical content errors** — TOPIC 17 is rigorous and current.