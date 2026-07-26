---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 3: Pre-Tax Returns Engine (Levered IRR + Exit)"
summary: "**TOPICAL_INDEX ref:** Lines 144–186 **Last update (per audit table):** Round 19"
entities:
  - concept/arm
  - concept/cap-rate
  - lender/visio-lending
  - tax/niit
  - topic/str
tags:
  - topic/after-tax
  - topic/apex
  - topic/monte-carlo
  - topic/portfolio
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_03_pre_tax_returns.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 3: Pre-Tax Returns Engine (Levered IRR + Exit)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 144–186
**Last update (per audit table):** Round 19

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Levered IRR cash flow model (m0: −Cash_Invested; m1..n: NOI/12−P&I; mn: + Exit) | ✅ Standard; T3 G4-01..06 verified |
| 48-cell sensitivity matrix (4 hold × 3 exit cap × 4 rent growth) | ✅ Internally consistent |
| CapEx reserve 5-8% EGI (NOT in OpEx) | ✅ Important distinction; consistent |
| Exit cap sensitivity ±50-150 bps | ✅ Reasonable |
| Tornado chart variables (stable ±10%, cyclical ±20%, rates ±50-100 bps) | ✅ Standard PMCC calibration |
| Return Grade A/B/C/D/F on AFTER-TAX IRR | ✅ Consistent with TOPIC 4 |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 2 (Math spine EGI/NOI/ADS formulas) | ✅ Aligned |
| TOPIC 4 (After-Tax IRR — OBBBA, §1250, NIIT) | ✅ Return Grade uses after-tax IRR, not pre-tax |
| TOPIC 7 (Monte Carlo extends with distributions) | ✅ Pre-tax IRR + Monte Carlo is the right layering |
| TOPIC 12 (ARM reset — IO expires + rate reset) | ⚠️ No explicit link from TOPIC 3 IRR formula to ARM reset year cash flows. IRR formula in TOPIC 3 doesn't show how ARM-reset year cash flows change. |

## 3. Round 19 Verification

**Group 4 — Pre-Tax Returns (6 claims verified):**
- G4-01 Levered IRR — Tier 1 CONFIRMED
- G4-02 XIRR vs IRR — Tier 1 CONFIRMED
- G4-03 NOI geometric growth — Tier 1 CONFIRMED
- G4-04 Exit cap sensitivity — Tier 1 CONFIRMED
- G4-05 Cap rate drift — Tier 1 CONFIRMED
- G4-06 Modified Dietz — **REVISION REQUIRED** (dollar-weighted, not time-weighted)

**T3 Net:** 5/6 Tier 1, 1 REVISION (G4-06 only)

**Action needed:** TOPIC 3 does NOT currently mention Modified Dietz in its Data Points. The Modified Dietz correction is mentioned in TOPIC 2 (line 120-133 Pre-Tax Returns Engine section) and may apply to portfolio aggregation rather than single-deal IRR. TOPIC 3 is a **single-deal** levered IRR + Exit engine, so Modified Dietz is **not directly relevant** to TOPIC 3. No change required for TOPIC 3 itself, but flag for cross-reference hygiene.

## 4. Stale Items

- TOPIC 3 was just verified (Round 19) and is fresh.
- All 6 G4 math claims either pass or get revised; no stale data.

## 5. Cross-References Validity

- TOPIC 2 link ✅
- TOPIC 4 link ✅
- TOPIC 7 link ✅

## 6. Verdict

**VERIFIED**

**Confidence: 5/5** (single-deal levered IRR + Exit is solid; all 6 G4 claims pass or get revision in TOPIC 2, not TOPIC 3)

## 7. Recommended Actions

1. **Optional add:** Show ARM-reset year cash flow override explicitly in IRR formula (link to TOPIC 12). Low priority.
2. **No critical actions** — TOPIC 3 is current and consistent.