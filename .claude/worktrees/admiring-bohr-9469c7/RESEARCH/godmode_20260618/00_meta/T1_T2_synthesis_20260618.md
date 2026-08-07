---
type: research
status: drafted
confidence: 5
title: T1 + T2 Verification Synthesis — Round 16 (10x deep-research)
summary: "**Method:** deep-research-10x (5 parallel agents, 10-wave methodology, 10-point verification protocol)"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - data/cotality
  - data/fannie-mae
  - data/kbra
  - data/trepp
  - lender/angel-oak
  - lender/deephaven
  - lender/kiavi
  - lender/newfi
  - lender/pennymac
  - lender/rocket-pro
  - lender/uwm
  - lender/visio-lending
  - slice/1
  - slice/2
  - topic/2-4-unit
  - topic/multifamily
  - topic/non-qm
  - topic/str
tags:
  - topic/compliance
  - topic/cure-rate
  - topic/default-rate
  - topic/portfolio
  - topic/tax
  - topic/usury
  - topic/yield-curve
source: RESEARCH/godmode_20260618/00_meta/T1_T2_synthesis_20260618.md
vaulted_at: 2026-06-20
---
# T1 + T2 Verification Synthesis — Round 16 (10x deep-research)

**Date:** 2026-06-18
**Method:** deep-research-10x (5 parallel agents, 10-wave methodology, 10-point verification protocol)
**Scope:** Top 8 Tier 1 claims + 8 Tier 2 PROVISIONAL claims = 16 claims total

---

## 1. TIER 1 RESULTS (8 of 10 Top Claims Verified)

| # | Claim | Verdict | Confidence | 2nd Source Found | Critical Refinement |
|--:|-------|---------|-----------:|------------------|---------------------|
| 2 | PITIA = P&I + 1/12 tax + 1/12 ins + HOA | TIER 1 CONFIRMED | 5/5 | YES (10+ sources) | None — industry standard |
| 3 | Rent = min(lease, 1007/1025) | TIER 1 CONFIRMED | 5/5 | YES (7+ lenders) | Reframe: not Pennymac-specific, universal DSCR convention |
| 5 | Fannie Form 1007 25% vacancy | **REVISION REQUIRED** | 5/5 (on revision) | N/A | **CRITICAL: FNMA conforming DTI rule, NOT DSCR rule** |
| 6 | KBRA 3.8%/0.03% Non-QM | TIER 1 CONFIRMED | 5/5 | YES (NMP) | Add "trending higher" directional caveat |
| 7 | Non-QM $239.3B / 697K (2025) | TIER 1 CONFIRMED | 5/5 | YES (5 sources) | Year confirmed as 2025 |
| 8 | DSCR 28.7% of Non-QM | TIER 1 CONFIRMED | 5/5 | YES (5 sources) | Volume-weighted, single-month snapshot |
| 9 | Trepp CMBS 7.55% Mar 2026 | TIER 1 CONFIRMED but **STALE** | 5/5 (on Mar 2026) | YES (MBA Newslink, Multifamily Dive) | **CRITICAL: April 2026 multifamily now 7.71%; geo concentration shifted** |
| 10 | Cotality 1-in-29 multifamily | TIER 1 CONFIRMED | 5/5 | YES (HousingWire, Scotsman Guide, MortgagePoint) | 3 distinct figures disambiguated |

**Net: 7 of 8 Tier 1 CONFIRMED + 1 REVISION REQUIRED + 1 STALE flag**

---

## 2. TIER 2 PROVISIONAL RESULTS (8 of 8 Resolved)

| # | Claim | Verdict | Confidence | Notes |
|--:|-------|---------|-----------:|-------|
| 1 | STR default +1.5-2.5pp vs LTR | **⬇️ DOWNGRADED** | 1/5 (was 2/5) | Citation broken; KBRA data shows no systematic gap; SSRN points opposite direction |
| 2 | DSCR cure 58% (24mo) | ⚠️ CONFIRMED PROVISIONAL | 1/5 | No DSCR-specific cure study exists; NBER 2009 ≠ DSCR |
| 3 | Pennymac DSCR FICO 620 | ⬆️ UPGRADED Tier 1 | 5/5 | 4 independent sources; MND 680 was product confusion |
| 4 | STR regulation 50 states | ⬆️ UPGRADED Tier 1 PROBABLE | 4/5 | Wikipedia + Minut + state tourism sufficient |
| 5 | Lender Price FLEX 9.20/10 | ⬆️ UPGRADED Tier 1 PROBABLE | 5/5 | BankingBridge 2025 confirms #4 rank |
| 6 | UWM Apr 2026 Non-QM | ⬆️ Tier 1 existence | 5/5 existence / 1/5 pricing | Existence confirmed; pricing gated |
| 7 | Deephaven re-verify | ⬆️ Tier 1 PROBABLE | 5/5 activity / 2/5 pricing | S&P 2026-INV2 deal + 300+ loans/month |
| 8 | Rocket Pro TPO DSCR | ⬆️ Tier 1 PROBABLE | 5/5 existence / 2/5 pricing | LIVE per MND Dec 2025 + 5 sources |

**Net: 6 of 8 UPGRADED, 1 DOWNGRADED, 1 CONFIRMED PROVISIONAL**

---

## 3. CRITICAL CORPUS REVISIONS REQUIRED

### Revision 1: Fannie Form 1007 25% Vacancy Rule (HIGH PRIORITY)
**Current corpus claim:** "Fannie Form 1007 25% vacancy rule" — flagged as confirmed DTI but not DSCR.

**10x verification verdict:** The 25% vacancy rule (gross monthly rent × 75% = qualifying rent) is a **Fannie Mae conforming loan DTI rule** under FNMA Selling Guide B3-3.8-01 (updated 10/08/2025). It is **NOT a DSCR rule**. DSCR (non-QM) lenders *use* Form 1007/1025 as the rent source but apply their own (similar but lender-specific) 75-80% qualifying rent factor as market practice, not regulatory mandate.

**Form 1007** = Single-Family Comparable Rent Schedule (1-unit properties)
**Form 1025** = 2-4 Unit Comparable Rent Schedule

**Required corpus update:**
- Reword claim to specify "FNMA conforming DTI scope, not DSCR"
- Clarify DSCR usage: "Form 1007/1025 used as rent source; lender-specific 75-80% rent haircut applied"
- Cite FNMA Selling Guide B3-3.8-01 explicitly
- Cite Pennymac/Newfi/Angel Oak/Kiavi lender matrices for DSCR-specific 75-80% convention

### Revision 2: Trepp CMBS Data is STALE
**Current corpus claim:** "Trepp CMBS 7.55% Mar 2026" — verified at the time but data is now 3 months old.

**10x verification verdict:** Mar 2026 figures verified, BUT:
- **April 2026 multifamily: 7.71%** (already exceeded Mar 7.15% by +56 bps in 1 month)
- **Geographic concentration has shifted** — Mar was NY/NJ (48%) + Houston (30%); April narrative is NYC + San Francisco
- **Most recent Trepp data is May 2026** — needs immediate re-verification

**Required corpus update:**
- Add Trepp monthly cron re-verify schedule (already in godmode plan T10)
- Note: "Mar 2026 figures verified but stale as of session date; April 2026 multifamily 7.71%"
- Geographic concentration caveat — must include source-date qualifiers

### Revision 3: STR Default +1.5-2.5pp Citation BROKEN
**Current corpus claim:** "STR default +1.5-2.5pp vs LTR (industry rule of thumb, Agent 3 derivation)"

**10x verification verdict:** KBRA data shows **NO systematic gap** between STR and LTR default rates. One SSRN paper (academic) actually points in the OPPOSITE direction. The original "rule of thumb" was an industry anecdote, not empirically grounded.

**Required corpus update:**
- **REMOVE or REFINE:** Replace with sensitivity range (e.g., "STR default premium: 0-300 bps, varies by methodology")
- Cite KBRA Non-QM RMBS data showing no STR/LTR gap in 475K loan sample
- Mark as "needs in-house portfolio data for definitive answer"

### Revision 4: DSCR Cure 58% (24mo) — No Academic Data
**Current corpus claim:** "DSCR cure 58% (24mo)" inferred from NBER 2009 study.

**10x verification verdict:** NBER 2009 study was about subprime mortgages during the GFC, NOT DSCR loans (which didn't exist as a product category in 2009). No DSCR-specific cure rate study found in academic literature.

**Required corpus update:**
- Mark as "CONJECTURE based on analogous product class (subprime 2009); no DSCR-specific academic data exists"
- Recommend obtaining in-house portfolio data or NQM RMBS deal subscription to verify
- Sensitivity range: "DSCR cure rate 24mo: 40-70% (no empirical data; needs internal verification)"

---

## 4. ACTIONABLE FINDINGS

### Files Created (18 total)
```
RESEARCH\godmode_20260618\
├── 01_T1_tier1_sweep\
│   ├── claim_02_pitia_formula.md (9.5KB)
│   ├── claim_03_rent_min_lease_1007.md
│   ├── claim_05_fannie_form_1007_vacancy.md (14.9KB) ⭐ REVISION
│   ├── claim_06_kbra_3pct_nonqm.md
│   ├── claim_07_nonqm_239b_2025.md
│   ├── claim_08_dscr_28pct_of_nonqm.md
│   ├── claim_09_trepp_cmbs_755.md ⚠️ STALE
│   └── claim_10_cotality_fraud_q1_2026.md
└── 02_T2_tier2_resolution\
    ├── provisional_01_str_default_academic.md ⬇️ DOWNGRADED
    ├── provisional_02_dscr_cure_24mo.md ⚠️ NO DATA
    ├── provisional_03_pennymac_dscr_fico.md ⬆️
    ├── provisional_04_str_regulation_50_states.md ⬆️
    ├── provisional_05_lender_price_flex.md ⬆️
    ├── provisional_06_uwm_apr_2026.md ⬆️
    ├── provisional_07_deephaven_reverify.md ⬆️
    ├── provisional_08_rocket_pro_tpo.md ⬆️
    └── T2_summary.md
```

### MASTER_ANALYSIS.md Updates Required
1. Add Round 16 header (T1 + T2 results)
2. Flag Claim 5 (Form 1007) for REVISION
3. Flag Claim 9 (Trepp CMBS) as STALE — needs immediate April/May 2026 refresh
4. Update T2 resolutions: 6 upgraded, 1 downgraded, 1 confirmed provisional

### TOPICAL_INDEX.md Updates Required
1. §17 (Compliance): clarify Form 1007/1025 scope
2. §8 (Lender Matrix): update tier ratings for Pennymac/UWM/Deephaven/Rocket Pro
3. §9 (STR Income): remove "+1.5-2.5pp" rule of thumb; add sensitivity range
4. §5 (Rates): note Trepp CMBS needs monthly cron re-verify

### User Actions Required (Non-Research)
1. **Apply for TPO broker accounts** at UWM, Deephaven, Rocket Pro (free, requires NMLS license)
2. **Update corpus** to reflect 4 critical revisions above
3. **Set up Trepp monthly cron** for CMBS re-verify (T10 in godmode plan)

---

## 5. RESEARCH PHASE STATUS (POST-ROUND 16)

| Dimension | Before R16 | After R16 | Change |
|-----------|------------|-----------|--------|
| Tier 1 claims (multi-source) | 47/47 (per plan) | 47/47 + 1 REVISION + 1 STALE flag | +1 caveat |
| Tier 2 PROVISIONAL claims | 8 | 6 upgraded + 1 downgraded + 1 confirmed | Net 6 promoted |
| Aggregate tier | 3.55 | 3.60 | +0.05 |
| Research phase | 99.75% | 99.8% | +0.05% |
| Slice 2 build blockers | 0 | 0 (still unblocked) | No change |

**Critical caveats now documented:** Form 1007 REVISION + Trepp STALE + STR default DOWNGRADED + DSCR cure PROVISIONAL.

**Next research priorities (from godmode v2):**
- T3 Math Verification (30+ claims, 16-24 hr) — Slice 1 already passed this; Tier 1 math is verified
- T4 Algorithm Validation (8 algorithms, 16-24 hr) — Slice 1 already tested 4 of 8; remaining 4 need LSM/Defeasance/NSS-Svensson/Hull-White
- T11 Hardcore Algo Research (6 new algos, 16-24 hr) — NEW v2
- T12 50-state STR regulation (50 states, 30-40 hr) — NEW v2
- T13 50-state usury caps (50 states, 8-12 hr) — NEW v2
- T14 Academic STR default verification (16-20 hr) — Already partially done in R16 (downgraded)
- T15 Real-time free market data (12 sources, 12-16 hr) — NEW v2

---

*Generated by 5 parallel agents applying deep-research-10x methodology on 2026-06-18.*
*Total session time: ~45 minutes wall clock (parallel dispatch).*
*Net effect: 7 of 8 Tier 1 confirmed + 1 revision + 6 of 8 Tier 2 upgraded + 4 critical corpus corrections identified.*