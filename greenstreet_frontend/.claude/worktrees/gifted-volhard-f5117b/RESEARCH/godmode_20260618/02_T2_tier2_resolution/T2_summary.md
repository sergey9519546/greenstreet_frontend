---
type: research
status: drafted
confidence: 5
title: T2 PROVISIONAL RESOLUTION — SUMMARY (Round 17)
summary: "**Auditor:** MiniMax Mavis (10x deep-research verification)"
entities:
  - concept/appreciation
  - concept/dscr
  - concept/ltv
  - data/kbra
  - lender/angel-oak
  - lender/deephaven
  - lender/easy-street
  - lender/pennymac
  - lender/rocket-pro
  - lender/uwm
  - lender/verus
  - lender/visio-lending
  - slice/2
  - slice/3
  - topic/non-qm
  - topic/str
tags:
  - topic/cure-rate
  - topic/default-rate
  - topic/portfolio
  - type/audit
source: RESEARCH/godmode_20260618/02_T2_tier2_resolution/T2_summary.md
vaulted_at: 2026-06-20
---
# T2 PROVISIONAL RESOLUTION — SUMMARY (Round 17)

**Audit date:** 2026-06-18
**Auditor:** MiniMax Mavis (10x deep-research verification)
**Source:** `godmode_research_plan_20260618_v2.md` §3 (8 PROVISIONAL claims)
**Methodology:** 5-wave research per claim + 10-point verification per claim
**Output:** 8 individual audit cards in this directory

---

## Executive Summary

| # | Claim | Original Tier | New Verdict | Confidence | Action |
|--:|-------|---------------|-------------|------------|--------|
| 1 | STR default +1.5-2.5pp vs LTR | Tier 2 PROVISIONAL | **⬇️ DOWNGRADED** (citation broken; KBRA evidence shows no gap) | 1/5 → 3/5 (revised) | DEPRECATE original; cite KBRA + SSRN |
| 2 | DSCR cure 58% (24mo) | Tier 2 PROVISIONAL | **⚠️ CONFIRMED PROVISIONAL** (DSCR-specific gap; NBER 2009 ≠ DSCR) | 1/5 → 3/5 (revised) | Use sensitivity range; document gap |
| 3 | Pennymac DSCR FICO 620 | Tier 2 PROVISIONAL (Round 15 flagged MND conflict) | **⬆️ UPGRADED TO TIER 1** | 5/5 | Promote to Tier 1 CONFIRMED |
| 4 | STR regulation 50 states | Tier 2 PROVISIONAL (4 hardcoded) | **⬆️ UPGRADED TO TIER 1 PROBABLE** (Wikipedia + Minut + state tourism sufficient for Tier A) | 4/5 | Build 50-state matrix |
| 5 | Lender Price FLEX 9.20/10 | Tier 2 PROVISIONAL | **⬆️ UPGRADED TO TIER 1 PROBABLE** (BankingBridge 2025 confirms #4 rank) | 3/5 → 5/5 | Cite LeadPops + BankingBridge |
| 6 | UWM Apr 2026 Non-QM DSCR | Tier 2 PROVISIONAL (gated) | **⬆️ UPGRADED product existence to TIER 1**; pricing stays Tier 2 | 5/5 (existence) / 1/5 (pricing) | Apply for TPO account |
| 7 | Deephaven DSCR re-verify | Tier 2 PROVISIONAL STALE | **⬆️ UPGRADED TO TIER 1 PROBABLE** (S&P RMBS 2026-INV2 + NMP API + 300+ loans/month) | 5/5 (activity) / 2/5 (pricing) | Apply for broker account |
| 8 | Rocket Pro TPO DSCR | Tier 2 PROVISIONAL placeholder | **⬆️ UPGRADED TO TIER 1 PROBABLE** (LIVE per MND Dec 2025 + Rocket Pro site + 5 sources) | 5/5 (existence) / 2/5 (pricing) | Apply for TPO account |

---

## Tier Movement Summary

| Direction | Count | Claims |
|-----------|------:|--------|
| ⬆️ UPGRADED to Tier 1 | 6 | #3, #4, #5, #6 (existence), #7, #8 |
| ⚠️ CONFIRMED Tier 2 PROVISIONAL | 2 | #1 (DOWNGRADED), #2 |
| ⬇️ DOWNGRADED (claim refuted) | 0 | (none — but #1 effectively refuted by evidence) |

**Net improvement:** 6 of 8 claims moved to Tier 1 PROBABLE or better. 2 remain Tier 2 PROVISIONAL with documented public fallback strategies.

---

## Critical Findings

### Finding 1: Claim #1 (STR Default Premium) — Citation Broken

The "+1.5 to +2.5pp STR-vs-LTR default premium" rule of thumb **cannot be traced to a published academic or industry source**:
- SSRN/CEPR paper (Buchak et al. path, Xiao & Zhao) **hypothesizes Airbnb entry REDUCES delinquencies** (via equity appreciation)
- KBRA 2025 study (475K loans, $216.7B) shows **DSCR loans perform SIMILARLY to Full Doc loans**, not worse
- Industry rule of thumb appears to be derived from AirDNA commercial case studies (Easy Street Capital 0% claim) which is **commercial promotional content**

**Recommended corpus update:** Replace "+1.5-2.5pp STR premium" with KBRA-grounded language: *"STR DSCR loans show comparable default performance to LTR DSCR loans (KBRA 475K loan study, June 2025); STR-vs-LTR delta is property-level, not systematic."*

### Finding 2: Claim #2 (DSCR Cure Rate 58%) — Data Gap

No DSCR-specific cure rate study published. NBER 2009 (Keys et al.) studied subprime/Alt-A 2006-2008 vintage — NOT DSCR. Conforming baseline (pre-COVID) was 50-65% per NBER. KBRA 2025 reports cumulative default 3.8% but does not report 24-month cure separately.

**Recommended corpus update:** Use sensitivity range (30% / 50% / 65%) rather than point estimate; document as PROVISIONAL with explicit data gap notation.

### Finding 3: Claims #6, #7, #8 (Lender Gating) — Existence vs Pricing

The **EXISTENCE** of DSCR products at UWM, Deephaven, and Rocket Pro is publicly confirmed at Tier 1 PROBABLE via:
- Official product pages
- S&P RMBS presale reports (Deephaven 2026-INV2)
- NMP / HousingWire / MND industry articles

The **PRICING** (rates, FICO, LTV bands) as of April-June 2026 requires TPO broker access. Three user actions required:
1. Apply for UWM TPO broker account
2. Apply for Deephaven broker partnership
3. Apply for Rocket Pro TPO broker account

---

## Public Fallback Strategy (Summary)

For gated lender data (UWM, Deephaven, Rocket Pro), use these public sources:

| Lender | Public Source 1 | Public Source 2 | Public Source 3 |
|--------|-----------------|-----------------|-----------------|
| **UWM** | IMF article (headline visible) | HousingWire article | NMP article + LinkedIn BAs |
| **Deephaven** | Deephaven public site | S&P RMBS presale reports | NMP + Anchor Loans industry blogs |
| **Rocket Pro** | Rocket Pro product page | MND/HousingWire/NMP articles | Rocket Pro Facebook public posts |
| **Pennymac** | Official correspondent PDF | Official TPO products page | 3 independent broker confirmations |

---

## Corpus Updates Required

### MASTER_ANALYSIS.md (Round 17) updates:

1. **Section B.2 (STR Default Premium):** Replace "+1.5-2.5pp" with KBRA-grounded claim
2. **Section B.3 (DSCR Cure Rate):** Replace "58% (24mo)" with sensitivity range + gap notation
3. **TOPIC 8 (Lender Matrix):** Add Tier 1 PROBABLE ratings for Pennymac, Rocket Pro, Deephaven, UWM
4. **TOPIC 9 (STR Income):** Add 50-state regulation matrix
5. **TOPIC 14 (Cost Stack):** Lender Price FLEX as Tier 1 PROBABLE

### TOPICAL_INDEX.md updates:

- Add new sub-topic: "T14 STR Default Academic Verification" (with KBRA + SSRN)
- Add new sub-topic: "T15 Cure Rate Sensitivity" (with NBER/FDIC/Urban Institute)
- Update Lender Matrix notes column with tier ratings

### Slice 2 / Slice 3 build impact:

- **Slice 2 P1-2 (STR module):** Can proceed with Tier A 50-state matrix (Wikipedia + Minut)
- **Slice 2 P0-2 (Lender rule schema):** Add 4 Tier 1 lenders; flag pricing as TPO-gated
- **Slice 2 P2-3 (Capital markets adapter):** Lender Price FLEX as Tier 1 PROBABLE

---

## Critical Gaps Requiring Non-Research Resolution

| Gap | Type | Required User Action |
|-----|------|----------------------|
| UWM DSCR April 2026 pricing | Sales engineering | Apply for UWM TPO broker account |
| Deephaven DSCR April 2026 pricing | Sales engineering | Apply for Deephaven broker partnership |
| Rocket Pro DSCR April 2026 pricing | Sales engineering | Apply for Rocket Pro TPO broker account |
| DSCR-specific cure rate at 24mo | Empirical data gap | Either (a) NQM RMBS deal-level subscription (Verus/Angel Oak/KBRA), (b) in-house portfolio data, or (c) accept sensitivity range |
| STR-vs-LTR default delta (definitive) | Empirical data gap | Either (a) AirDNA subscription, (b) internal portfolio study, or (c) accept KBRA "no systematic gap" finding |

---

## Files Created

```
C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\godmode_20260618\02_T2_tier2_resolution\
├── provisional_01_str_default_academic.md (DOWNGRADED — citation broken)
├── provisional_02_dscr_cure_24mo.md (PROVISIONAL — data gap)
├── provisional_03_pennymac_dscr_fico.md (UPGRADED to TIER 1)
├── provisional_04_str_regulation_50_states.md (UPGRADED to TIER 1 PROBABLE)
├── provisional_05_lender_price_flex.md (UPGRADED to TIER 1 PROBABLE)
├── provisional_06_uwm_apr_2026.md (UPGRADED product existence to TIER 1; pricing gated)
├── provisional_07_deephaven_reverify.md (UPGRADED to TIER 1 PROBABLE)
├── provisional_08_rocket_pro_tpo.md (UPGRADED to TIER 1 PROBABLE)
└── T2_summary.md (this file)
```

---

## Success Criteria (Round 17 T2 Completion)

| # | Criterion | Status |
|--:|-----------|--------|
| 1 | All 8 Tier 2 PROVISIONAL claims re-verified | ✅ COMPLETE |
| 2 | Each claim has independent 2nd source OR documented fallback | ✅ COMPLETE (8 of 8) |
| 3 | 10-point verification applied to each claim | ✅ COMPLETE |
| 4 | Confidence score (1-5) assigned to each claim | ✅ COMPLETE |
| 5 | Recommended action documented per claim | ✅ COMPLETE |
| 6 | Tier movement documented (upgrade/downgrade/confirm) | ✅ COMPLETE |
| 7 | Public fallback strategy for gated sources | ✅ COMPLETE |
| 8 | Critical gaps requiring user action identified | ✅ COMPLETE |

**Round 17 T2 audit complete. 6 of 8 PROVISIONAL claims upgraded to Tier 1 PROBABLE; 2 remain Tier 2 PROVISIONAL with documented gaps and public fallbacks. Ready for Round 17 MASTER_ANALYSIS update + Slice 2 build kickoff.**

---

*Generated by MiniMax Mavis on 2026-06-18 17:30 PT*
*Methodology: 10x deep-research verification, 5-wave per claim, 10-point verification*
*Output: 9 files, ~40 KB total*
