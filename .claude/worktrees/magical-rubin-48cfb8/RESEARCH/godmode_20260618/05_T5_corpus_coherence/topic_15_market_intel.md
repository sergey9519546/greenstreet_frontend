---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 15: Market Intelligence (Non-QM Market, Competitors, Delinquency)"
summary: "**TOPICAL_INDEX ref:** Lines 1096–1180 **Last update (per audit table):** Round 12 (NEEDS Q2 2026 refresh + T15 free sources)"
entities:
  - concept/dscr
  - data/cotality
  - data/fred
  - data/kbra
  - data/trepp
  - lender/verus
  - topic/multifamily
  - topic/non-qm
tags:
  - topic/default-rate
  - topic/insurance
  - topic/kill-criteria
  - topic/monte-carlo
  - topic/portfolio
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_15_market_intel.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 15: Market Intelligence (Non-QM Market, Competitors, Delinquency)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 1096–1180
**Last update (per audit table):** Round 12 (NEEDS Q2 2026 refresh + T15 free sources)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Non-QM 2025 origination $239B (697,605 loans = 10.2% of originations) | ✅ T1 claim_07 verified Tier 1 |
| DSCR share of Non-QM: 28.7% = ~$68.7B | ✅ T1 claim_08 verified Tier 1 |
| May 2026 Non-QM ~9% of total mortgage lock volume | ✅ Reasonable |
| Top Non-QM Lenders 2025 (Scotsman Guide) | ✅ |
| Verus S&P DSCR Presale 2025: 89.44% property-focused, 1.10x weighted avg, 63.04% no lease, 3.82% 30-day DQ at issuance | ✅ T1 claim_06 KBRA methodology aligned |
| Delinquency data (MBA Q1 2026 commercial 4.02%, Trepp CMBS 7.28%, Multifamily 7.15%) | ⚠️ **STALE per Round 16 T1 claim_09** — April 2026 multifamily 7.71%; geo shifted NYC + SF |
| Office CMBS 12.34% all-time high (Jan 2026) | ✅ |
| KBRA Non-QM Default Study 2025: 3.8% WA cumulative; 0.03% realized credit losses | ✅ T1 claim_06 Tier 1 |
| 54.8% of US counties yield decline 2025-26 | ⚠️ Source citation needed |
| SimilarWeb traffic verified | ✅ |
| Broker channel 5,000-7,000 active Non-QM brokers | ✅ |
| Insurance crisis data (>90% FL, 83% CA) | ✅ Aligned with TOPIC 17 |
| Securitization 2026 (first $1B+ DSCR ABS deal) | ✅ |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 6 (Kill criteria for declining markets — CT/FL/IL/NJ/NY) | ✅ Aligned |
| TOPIC 17 (Insurance crisis — kill criterion) | ✅ Aligned |
| TOPIC 7 (Monte Carlo calibration — KBRA data) | ✅ Aligned |

**CONFLICT candidate #8: Trepp CMBS data staleness**
- TOPIC 15 line 1134: "Trepp CMBS delinquency: 7.28% (Mar 2026); Multifamily CMBS: 7.15% (Mar 2026)"
- Round 16 T1 claim_09: "April 2026 multifamily 7.71%; geo concentration shifted"
- **Conflict:** TOPIC 15 shows March 2026 data; Round 16 found it stale.

## 3. Round 19 Verification

- TOPIC 15 was NOT explicitly re-verified in Round 19.
- **Round 16 T1 claim_09 flagged Trepp CMBS as STALE** — needs immediate April/May 2026 refresh.
- **T15 free real-time data sources** are pending per godmode plan T15 (FRED API + Cotality/Trepp press feeds).

## 4. Stale Items

- **Trepp CMBS data** (Mar 2026) — STALE per Round 16.
- **54.8% yield decline** — source citation needed.
- **Securitization 2026** data may need refresh.

## 5. Cross-References Validity

- TOPIC 6 link ✅
- TOPIC 17 link ✅
- TOPIC 7 link ✅

## 6. Verdict

**NEEDS REFRESH (Q2 2026 macro data stale)**

**Confidence: 3/5** (Non-QM sizing verified; Trepp CMBS + securitization data stale)

## 7. Recommended Actions

1. **CRITICAL — Refresh Trepp CMBS data** to April/May 2026 per Round 16 T1 claim_09 finding.
2. **Cite source for 54.8% yield decline** claim.
3. **T15 work:** Identify free real-time data sources (FRED + Cotality/Trepp press feeds) for monthly refresh.
4. **Schedule T10 cron** for Trepp CMBS monthly refresh.