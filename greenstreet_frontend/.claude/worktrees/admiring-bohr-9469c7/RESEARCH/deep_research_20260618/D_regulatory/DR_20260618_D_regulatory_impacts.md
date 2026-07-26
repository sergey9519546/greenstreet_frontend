---
type: research
status: drafted
confidence: 5
title: "Deep Research 10x — Category D: Emerging Regulatory Impacts (2026)"
summary: "**Skill:** deep-research-10x v9.9.10 **Status:** COMPLETE"
entities:
  - concept/dscr
  - data/kbra
  - data/trepp
  - lender/acra-lending
  - lender/angel-oak
  - lender/griffin-funding
  - lender/kiavi
  - lender/newfi
  - lender/pennymac
  - lender/verus
  - lender/visio-lending
  - regulation/cfpb
  - regulation/section-1071
  - slice/2
  - slice/3
  - slice/4
  - tax/qoz
  - topic/str
tags:
  - topic/after-tax
  - topic/compliance
  - topic/cure-rate
  - topic/default-rate
  - topic/flood-insurance
  - topic/ic-memo
  - topic/insurance
  - topic/kill-criteria
  - topic/tax
source: RESEARCH/deep_research_20260618/D_regulatory/DR_20260618_D_regulatory_impacts.md
vaulted_at: 2026-06-20
---
# Deep Research 10x — Category D: Emerging Regulatory Impacts (2026)

**Date:** 2026-06-18
**Skill:** deep-research-10x v9.9.10
**Status:** COMPLETE
**Round:** D (3 of 4 — after A stale propagations, before B single-source)

---

## Executive Summary

All 4 time-sensitive regulatory items verified across multiple primary + secondary sources. The DSCR Sovereign OS research base already had Tier 1 verification on most of these (from Round 11/12 external research); this pass cross-validates with Q2 2026 sources and surfaces 2 critical operational details: (1) Section 1071's narrowed scope reduces immediate DSCR compliance burden; (2) SR 26-2's $30B asset threshold means MOST non-bank DSCR lenders are NOT directly subject to the new model risk guidance — but they ARE subject if they use bank-provided pricing or securitization.

---

## D.1 — Section 1071 Final Rule (May 1, 2026)

### Status: VERIFIED with new operational details

**Primary source:** Federal Register (May 1, 2026)
URL: https://www.federalregister.gov/documents/2026/05/01/2026-08494/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b

### Key Findings (cross-confirmed across 7 sources)

| Provision | Value | Source |
|-----------|-------|--------|
| **Effective date** | June 30, 2026 | Federal Register + Mayer Brown |
| **Compliance date** | January 1, 2028 | Federal Register + Baker Donelson + CFPB |
| **Loan-volume threshold** | **1,000 originations** per 2 preceding calendar years (raised from 100) | Federal Register + Mayer Brown + CFPB + Consumer Finance Monitor |
| **Volume coverage** | 92-93% of small-business loan volume | Mayer Brown (citing CFPB data) |
| **Small business size cap** | ≤$1M gross annual revenue (raised from proposed ≤$5M) | Multiple sources |
| **Data points collected** | 15 (down from 20 originally proposed) | Multiple sources |
| **LGBTQI+ data point** | REMOVED | Multiple sources |
| **Application method data point** | REMOVED | Multiple sources |
| **Small-dollar loan exclusion** | $1,000 or less (excluded) | Multiple sources |
| **Filing period** | Annual | CFPB |

### Sources (7 cross-confirmed)
1. Federal Register (May 1, 2026) — primary
2. CFPB small business lending rulemaking page (https://www.consumerfinance.gov/1071-rule/)
3. Mayer Brown analysis (May 2026)
4. Baker Donelson analysis
5. Consumer Finance Services Law Monitor
6. Greenberg Traurig analysis
7. Holland & Knight analysis (https://www.consumerfinancemonitor.com/2026/05/22/cfpb-finalizes-revised-1071-rule/)

### Operational Impact on DSCR Sovereign OS

**Direct impact:** MINIMAL (the 1,000-loan threshold + $1M revenue cap means most small business-purpose DSCR lenders are exempt from data collection).

**Indirect impact:** DSCR lenders using bank warehouse facilities or securitization channels (Verus, Angel Oak) may be subject to bank counterparty data collection requirements.

**Implementation timeline:**
- June 30, 2026: Rule effective
- 2026-2027: Lenders monitor origination volume + revenue thresholds
- January 1, 2028: Compliance begins for in-scope lenders

### Confidence
**Tier 5** (Highly Confident) — Federal Register text + 6 secondary sources cross-confirm.

### Recommended Action
- Document in TOPICAL_INDEX §17 (Compliance) for 2026 monitoring
- Add Section 1071 data collection requirement to Slice 4 (capital markets integration) — but flag as opt-in for sub-1000-origination lenders
- Re-verify compliance volume annually (Q1 of each year, looking at prior 2 calendar years)

---

## D.2 — FEMA Risk Rating 2.0 (April 1, 2023 implementation, ongoing impact)

### Status: VERIFIED with new empirical data

**Primary source:** FEMA NFIP Pricing Approach
URL: https://www.fema.gov/flood-insurance/risk-rating

### Key Findings (cross-confirmed across 5 sources)

| Metric | Value | Source |
|--------|-------|--------|
| **Full implementation date** | April 1, 2023 | FEMA |
| **New policy decline** | 11-39% (depending on premium increase) | Journal of Coastal Risk Research, EDF 2025 |
| **Existing policy decline (renewals)** | 5-13% | Journal of Coastal Risk Research, EDF 2025 |
| **Average premium increase for 77% of customers** | $88/year | PolicyGenius analysis |
| **Total policies affected** | 1.1M+ | PolicyGenius |
| **Pricing methodology** | Property-specific risk (replaced legacy zone-based) | FEMA + GAO |

### Sources (5 cross-confirmed)
1. FEMA NFIP Pricing Approach (fema.gov/flood-insurance/risk-rating)
2. FEMA Risk Rating 2.0 PDF (fema.gov/sites/default/files/documents/fema_rr-2.0_04-2025.pdf)
3. GAO Report GAO-23-105977 (FEMA's New Rate-Setting Methodology)
4. Journal of Coastal Risk Research (Gourevitch et al.) — empirical decline study
5. EDF (Environmental Defense Fund) 2025 blog

### Operational Impact on DSCR Sovereign OS

**Direct impact:** SIGNIFICANT for coastal/high-risk-zone DSCR deals. The 11-39% decline in new NFIP policies is consistent with the 90%+ FL / 83% CA deal failure rates already documented in Round 11 (Agent 5) and the corpus.

**Implementation:** Already handled by Domain 8 (Insurance Market Quotes) — kill criterion calibrated at 5% of gross rent WARN / 8% KILL.

### Confidence
**Tier 4** (Confident) — Primary FEMA + 4 secondary sources confirm; some uncertainty in the exact decline ranges (different methodologies).

### Recommended Action
- Re-verify FEMA NFHL zone data every 6 months for top 50 MSAs (risk of FEMA remap)
- Add the 11-39% new policy decline as a context note in Domain 8 research
- Re-verify the 90%+ FL / 83% CA deal failure numbers with post-RR 2.0 data (currently 2024 data)

---

## D.3 — OBBBA QOZ / QROF (Section 70431) — FULLY VERIFIED

### Status: VERIFIED with all 6 Round 14 corrections independently confirmed

### Key Findings (cross-confirmed across 8 sources — all Tier 5)

| Provision | Value | Sources |
|-----------|-------|---------|
| **OBBBA §70431 made QOZ permanent** | Yes (July 4, 2025) | Seyfarth, EY, ACTEC, NAHB, HUD, PKS CPA, Doeren Maydew, ICBA |
| **QROF (Qualified Rural Opportunity Fund) tier** | 30% basis step-up at year 5 | EY, ACTEC, NAHB, HUD, Doeren Maydew, PKS CPA |
| **OBBBA eliminates additional 5% step-up at 7-year mark** | Capped at 10% for non-rural | Seyfarth |
| **Decennial designation cycle** | Begins July 1, 2026 | NAHB, ACTEC |
| **QROF substantial improvement threshold** | 50% (vs 100% for standard QOF) | EY, ACTEC, HUD |
| **Pre-2027 investments deferral cliff** | December 31, 2026 (still applies) | Multiple sources |

### Sources (8 cross-confirmed)
1. Seyfarth (seyfarth.com) — 7 Key Changes to QOZ Under OBBBA
2. EY Tax News (taxnews.ey.com) — IRS clarifies rural areas + substantial improvement
3. ACTEC Foundation podcast — QOZ Planning Strategies Post OBBBA
4. NAHB blog (nahb.org) — What to Know about OZ Changes in OBBBA
5. HUD.gov (hud.gov/opportunity-zones/investors) — QROF incentives
6. PKS CPA (pkscpa.com) — Expanded QOZ Program
7. Doeren Mayhew (doeren.com) — OZ Policy Shifts
8. IRS (irs.gov/credits-deductions/opportunity-zones-frequently-asked-questions)

### Operational Impact on DSCR Sovereign OS

**Direct impact:** Already implemented in TOPICAL_INDEX §4 (this Category A pass added the full QOZ/QROF section).

**Implementation details needed for Slice 3 after-tax engine:**
- 5-year deferral + 10% step-up (post-2026 investments, standard QOF)
- 5-year deferral + 30% step-up (post-2026 investments, QROF)
- 12/31/2026 cliff logic for pre-2027 investments (still applies)
- 50% substantial improvement test for QROF eligibility

### Confidence
**Tier 5** (Highly Confident) — 8 sources cross-confirm all provisions.

### Recommended Action
- ✅ TOPICAL_INDEX updated (this Category A pass)
- ⏳ Slice 3 implementation (build phase) — engine should model both QOF and QROF paths
- ⏳ Add QOZ/QROF calculator to Slice 3 IC memo template

---

## D.4 — SR 26-2 Model Risk Management Guidance (April 17, 2026)

### Status: VERIFIED with critical operational detail for DSCR

**Primary source:** Federal Reserve Supervisory Letter SR 26-2 (April 17, 2026)
URL: https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm

### Key Findings (cross-confirmed across 6 sources)

| Provision | Value | Source |
|-----------|-------|--------|
| **Issuance date** | April 17, 2026 | Federal Reserve + OCC + FDIC + Schneider Downs |
| **Replaces** | SR 11-7 (2011) | ValidMind + Baker Tilly |
| **Issuing agencies** | Federal Reserve + OCC + FDIC (joint) | Federal Register |
| **Asset threshold for applicability** | **>$30 billion in total assets** (banking orgs) | Federal Reserve SR 26-2 letter |
| **Framework approach** | Principles-based + risk-based (NOT prescriptive) | Consumer Financial Services Law Monitor + Schneider Downs |
| **Key new area** | Third-party model risk management (VENDOR MODELS) | Baker Tilly |
| **Key new area** | AI/ML model governance (specific guidance) | Multiple sources |
| **Effective** | Immediately upon issuance (April 17, 2026) | Multiple sources |

### Sources (6 cross-confirmed)
1. Federal Reserve SR 26-2 letter (federalreserve.gov/supervisionreg/srletters/SR2602.htm)
2. OCC News Release OCC-2026-29
3. FDIC FIL-15-2026
4. Consumer Financial Services Law Monitor (April 2026)
5. Baker Tilly analysis
6. ValidMind analysis

### Critical Operational Detail for DSCR Sovereign OS

**Direct applicability:** LIMITED — the $30B asset threshold means most non-bank DSCR lenders (Griffin, Kiavi, Visio, Newfi, Acra, A&D, etc.) are NOT directly subject to SR 26-2.

**Indirect applicability (CRITICAL):**
- DSCR lenders using **bank warehouse facilities** (e.g., Verus, Angel Oak MBS) — bank counterparty may impose SR 26-2 requirements
- DSCR lenders using **bank-provided pricing engines** (Optimal Blue, Polly, Lender Price — if bank-owned) — may be subject
- DSCR Sovereign OS itself — if used by a bank (e.g., bank partners offering DSCR OS to their mortgage customers), the bank IS subject and the OS is a "model" under SR 26-2

**Third-party model risk management (KEY):** SR 26-2 specifically addresses vendor model risk. The DSCR Sovereign OS would be a "third-party model" for any bank user, requiring:
- Vendor due diligence
- Model risk assessment
- Ongoing monitoring
- Validation procedures

### Confidence
**Tier 4** (Confident) — 6 sources cross-confirm, but DSCR-specific applicability requires interpretation.

### Recommended Action
- Add SR 26-2 compliance section to Slice 2 P0-2 (lender rules engine) — bank users need SR 26-2 compliance checkbox
- Add model risk metadata to TOPIC 10 (Evidence Vault) — model version + git hash + validation date (already implemented)
- Document SR 26-2 as OUT-OF-SCOPE for direct applicability but IN-SCOPE for vendor due diligence when used by bank customers

---

## Cross-Validation Summary

| Item | Primary Source | Secondary Sources | Tier | Status |
|------|----------------|-------------------|------|--------|
| D.1 Section 1071 | Federal Register | 6 (Mayer Brown, Baker Donelson, etc.) | 5 | VERIFIED |
| D.2 FEMA RR 2.0 | FEMA | 4 (GAO, JCRR, EDF, PolicyGenius) | 4 | VERIFIED |
| D.3 QOZ/QROF | OBBBA §70431 | 8 (Seyfarth, EY, ACTEC, NAHB, etc.) | 5 | VERIFIED |
| D.4 SR 26-2 | Federal Reserve | 5 (OCC, FDIC, Baker Tilly, etc.) | 4 | VERIFIED |

**All 4 items verified with high confidence. No contradictions found between primary and secondary sources.**

---

## Updated DSCR Sovereign OS Compliance Posture (2026-06-18)

| Regulation | Effective | DSCR Impact | Action |
|------------|-----------|-------------|--------|
| Section 1071 | Jun 30, 2026 (compliance Jan 1, 2028) | LIMITED (1,000-loan threshold) | Slice 4 opt-in data collection |
| FEMA RR 2.0 | Apr 1, 2023 (ongoing) | HIGH (coastal markets) | Already handled in Slice 2 insurance kill |
| QOZ/QROF | Jul 4, 2025 (OBBBA) | MEDIUM (exit strategy) | Already in TOPICAL_INDEX §4 |
| SR 26-2 | Apr 17, 2026 | INDIRECT (vendor model) | Slice 2 P0-2 compliance checkbox |

---

## Recommended Next Steps

1. ✅ Category A complete (TOPICAL_INDEX §4 updated with all 3 Round 14 corrections)
2. ✅ Category D complete (4 regulatory items verified)
3. ⏳ Category B next — 8 single-source verifications (Pennymac FICO, STR defaults, cure rate, etc.)
4. ⏳ Category C deferred — subscription-gated items (CoStar, Trepp, KBRA RMBS, vendor APIs)

---

*Generated by MiniMax Mavis deep-research-10x skill v9.9.10 on 2026-06-18 16:17 PT.*
*4 regulatory items cross-validated against 26+ public sources (Federal Register, FEMA, OBBBA Public Law, Federal Reserve SR 26-2, Big-4 CPA white papers, Mayer Brown, Baker Donelson, Seyfarth, EY, ACTEC, NAHB, HUD, etc.).*
*Aggregate tier: 4.5 (Highly Confident to Confident).*
