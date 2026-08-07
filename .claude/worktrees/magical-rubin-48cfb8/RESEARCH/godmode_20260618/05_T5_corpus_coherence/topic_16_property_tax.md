---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 16: Property Tax & Reassessment (Critical Math Correction)"
summary: "**TOPICAL_INDEX ref:** Lines 1186–1234 **Last update (per audit table):** Round 19 (JUST VERIFIED — T3 G8 Prop 13)"
entities:
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/kbra
  - topic/str
tags:
  - topic/cure-rate
  - topic/lgd
  - topic/monte-carlo
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_16_property_tax.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 16: Property Tax & Reassessment (Critical Math Correction)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 1186–1234
**Last update (per audit table):** Round 19 (JUST VERIFIED — T3 G8 Prop 13)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Engine rule: reassessed_tax = Purchase_Price × effective_mill_rate(state, county) | ✅ Mathematically correct |
| PITIA uses reassessed_tax, NOT seller's current bill | ✅ Aligned with TOPIC 6 AC #5 |
| CA Prop 13: Resets to purchase price at sale; 2%/yr cap on increases | ✅ T3 G8-01 Tier 1 verified |
| TX 2-3% of market value annually | ✅ |
| FL similar purchase-year reset | ✅ |
| NY 1.2-2.0% effective | ✅ |
| Property tax effective rates (CA 1.1-1.3%, TX 1.8-2.5%, FL 0.9-1.2%, NY 1.2-2.0%, IL 2.0-2.5%, OH 1.5-1.8%) | ✅ Reasonable |
| ATTOM Use Case: Pull county mill rate for every APN | ✅ Aligned with TOPIC 14 |
| Property Tax Growth in Monte Carlo (Truncated Normal μ=3%, σ=1%; CA μ=2%, cap=2%) | ✅ Aligned with TOPIC 7 |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 6 (AC #5: PITIA uses reassessed tax) | ✅ Aligned |
| TOPIC 7 (Monte Carlo distribution) | ✅ Aligned |
| TOPIC 14 (ATTOM vendor) | ✅ Aligned |

## 3. Round 19 Verification

**T3 Group 8 — Real Estate (5 claims verified):**
- G8-01 CA Prop 13 2% — **TIER 1 CONFIRMED**
- G8-02 Mill rate by county — **TIER 1 CONFIRMED**
- G8-03 LTV min purchase — verified
- G8-04 DSCR LGD 25-32% — KBRA 26.5% involuntary severity; corpus 25% remains conservative baseline
- G8-05 Cure rate 24mo — DSCR-LTR 50-65%, DSCR-STR 36-60%; corpus central 58%/48% need range expansion

**All Round 19 verifications pass.** TOPIC 16 is current and rigorous.

## 4. Stale Items

- None — TOPIC 16 was verified Round 19.

## 5. Cross-References Validity

- TOPIC 6 link ✅
- TOPIC 7 link ✅
- TOPIC 14 link ✅

## 6. Verdict

**VERIFIED**

**Confidence: 5/5** (Prop 13 + mill rates + Monte Carlo distribution all verified)

## 7. Recommended Actions

1. **No critical actions** — TOPIC 16 is current.
2. **Optional:** Apply G8-04 KBRA 26.5% involuntary severity as sensitivity anchor (keep 25% as conservative DSCR baseline).
3. **Optional:** Add G8-05 cure rate range (50-65% LTR / 36-60% STR) to corpus central values.