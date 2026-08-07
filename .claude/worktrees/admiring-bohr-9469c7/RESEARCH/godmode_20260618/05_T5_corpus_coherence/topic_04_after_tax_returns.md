---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 4: After-Tax Returns (OBBBA, §1250, NIIT, PAL, 1031)"
summary: "**TOPICAL_INDEX ref:** Lines 188–289 **Last update (per audit table):** Round 15"
entities:
  - concept/dscr
  - data/kbra
  - lender/visio-lending
  - regulation/section-1071
  - tax/1031
  - tax/bonus-depreciation
  - tax/niit
  - tax/pal
  - tax/qoz
  - topic/str
tags:
  - topic/after-tax
  - topic/compliance
  - topic/cure-rate
  - topic/default-rate
  - topic/monte-carlo
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_04_after_tax_returns.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 4: After-Tax Returns (OBBBA, §1250, NIIT, PAL, 1031)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 188–289
**Last update (per audit table):** Round 15

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| OBBBA signed Jul 4, 2025; effective Jan 19, 2025; permanent | ✅ PL 119-21, verified Round 14/15 |
| 100% bonus depreciation applies to assets with recovery period ≤20 yr | ✅ IRC §168(k) |
| Residential rental 27.5yr doesn't qualify directly; cost-seg components do | ✅ Standard CPA guidance |
| Cost-seg: surface for properties ≥$450K; $2.5K–$15K study cost; $50K–$100K savings per $1M | ✅ Industry-standard |
| §179 post-OBBBA: $2,560,000 (2026) | ✅ IRS Rev. Proc. 2025-32 §4.24, Tier 1 verified 5 sources |
| §163(j) ATI: post-OBBBA EBITDA-based | ✅ Effective tax years beginning after Dec 31, 2024 |
| QBI = 23% for 2026 | ✅ OBBBA §70411, Round 14 corrected (was 20% flat) |
| §1250 recapture: max 25% on SL depreciation; accelerated at ordinary rate | ✅ IRC §1250 |
| NIIT 3.8%; MAGI thresholds $200K/$250K/$125K | ✅ IRC §1411 |
| §1250 + NIIT = 28.8% effective; LTCG + NIIT = 23.8% | ✅ Standard computation |
| PAL $25K allowance phaseout $0.50/$1 over $100K; fully gone at $150K | ✅ IRC §469 |
| REP exception: 750 hours + 50% test | ✅ IRC §469(c)(7) |
| Depreciation residential rental: 27.5yr SL | ✅ IRC §168 |
| 1031: 45-day ID, 180-day close, like-kind | ✅ IRC §1031 |
| QOZ correction (made permanent, post-2026 rules) | ✅ OBBBA §70431; verified Round 14 |
| Counterintuitive 1031+QOZ finding | ✅ Agent 4 verified; matches Big-4 CPA guidance |
| PAL Phase-Out Godmode code | ✅ Code matches IRC §469 |

**No internal contradictions found.**

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 3 (Pre-Tax IRR feeds After-Tax) | ✅ Aligned |
| TOPIC 7 (Monte Carlo pre/post-tax IRR distributions) | ✅ Aligned |
| TOPIC 14 (Cost Stack — cost-seg $2.5K-$15K) | ✅ Consistent |
| TOPIC 17 (Compliance — Section 1071, SR 26-02) | ✅ Independent topics; no conflict |

## 3. Round 19 Verification

- TOPIC 4 was last verified Round 15. Round 19 did not re-sweep tax (correctly — Round 19 was math/algo focus).
- T2 PROVISIONAL claims #1 (STR default premium) and #2 (DSCR cure rate) are adjacent to TOPIC 4 exit modeling — Round 17 already downgraded claim #1 and confirmed PROVISIONAL #2. **TOPIC 4 does not currently cite these** — opportunity for cleaner cross-reference hygiene.

**Cross-verification check:** TOPIC 4 doesn't currently surface the STR default +1.5-2.5pp rule of thumb. Good — that was an industry misconception per Round 17 T2 finding #1. No correction needed in TOPIC 4 itself.

## 4. Stale Items

- None — TOPIC 4 has been refreshed through Round 15 and all critical 2025-26 tax law (OBBBA, QOZ, §179, QBI, §163(j)) is current.

## 5. Cross-References Validity

- TOPIC 3 link ✅
- TOPIC 7 link ✅

## 6. Verdict

**VERIFIED**

**Confidence: 5/5** (all tax law current, OBBBA-based corrections applied, counterintuitive QOZ finding preserved)

## 7. Recommended Actions

1. **Optional:** Add cross-reference to Round 17 T2 finding #1 (STR default delta is property-level not systematic per KBRA 475K loans) — minor cross-reference hygiene. Not required.
2. **No critical actions** — TOPIC 4 is current and internally consistent.