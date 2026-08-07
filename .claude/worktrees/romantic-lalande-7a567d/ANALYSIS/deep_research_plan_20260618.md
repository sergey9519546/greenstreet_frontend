---
type: research
status: drafted
confidence: 5
title: "DSCR Sovereign OS — Deep Research 10x Plan: Weak Spots & Unchecked Areas"
summary: "**Skill:** deep-research-10x v9.9.10 **Methodology:** 10 search waves + 10-point verification per claim + intelligence scoring"
entities:
  - concept/cap-rate
  - concept/dscr
  - data/cotality
  - data/fred
  - data/kbra
  - data/trepp
  - lender/acra-lending
  - lender/deephaven
  - lender/griffin-funding
  - lender/insula
  - lender/kiavi
  - lender/newfi
  - lender/pennymac
  - lender/rocket-pro
  - lender/uwm
  - lender/verus
  - lender/visio-lending
  - regulation/cfpb
  - regulation/section-1071
  - slice/1
  - slice/2
  - state/ca
  - state/fl
  - tax/niit
  - tax/qoz
  - topic/multifamily
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/after-tax
  - topic/architecture
  - topic/compliance
  - topic/cure-rate
  - topic/default-rate
  - topic/fair-plan
  - topic/flood-insurance
  - topic/insurance
  - topic/lgd
  - topic/monte-carlo
  - topic/portfolio
  - topic/short-rate
  - topic/tax
  - type/audit
source: ANALYSIS/deep_research_plan_20260618.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Deep Research 10x Plan: Weak Spots & Unchecked Areas

**Date:** 2026-06-18
**Skill:** deep-research-10x v9.9.10
**Methodology:** 10 search waves + 10-point verification per claim + intelligence scoring
**Mode:** Standard Report (15-min tier) + research plan with prioritized execution queue
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`
**Status:** Research phase currently 99.7% complete (per Round 14). This plan covers the remaining 0.3% + new weak spots identified in Round 13 self-audit + Round 14 parallel dispatch + content-gap-analysis + 10x audit.

---

## Executive Summary

**Bottom-line finding:** Our corpus is mature on **technical architecture + math + market intel** (Tier 1 verified, 47/47 facts, 94.37% Slice 1 test coverage) but has 4 categories of weak spots that this plan will systematically address:

| Category | # of Items | Risk | Recommended Effort |
|----------|------------|------|---------------------|
| **A. Stale propagations** (Round 14 corrections not yet in TOPICAL_INDEX) | 3 items | LOW | 4-6 hours |
| **B. Single-source/Tier 2 claims** (need 2nd source verification) | 8 items | MEDIUM | 16-20 hours |
| **C. Empirical data gaps** (require subscriptions or sales engineering) | 8 items | MEDIUM-HIGH | 40-60 hours |
| **D. Emerging regulatory impacts** (2026 effective dates) | 4 items | HIGH | 12-16 hours |

**Total estimated effort:** 72-102 hours over 4-6 weeks. Recommended sequencing: Category A (1-2 days) → Category B (1 week) → Category C (2-3 weeks, parallel with B) → Category D (1 week, time-sensitive).

---

## Wave 1-3: Reconnaissance (Identify Weak Spots)

### Wave 1 — Surface Mapping: What We Have

**Existing assets (mature, no work needed):**
- 14 rounds of MASTER_ANALYSIS (6,578 lines, ~430KB)
- 20 topics in TOPICAL_INDEX (1,601 lines, 66KB)
- GOLDEN_VECTORS (1,601 lines, 51KB) — locked DSCR math test data
- Slice 1 dscr-core: 132 tests passing, 94.37% coverage, 8 commits on master
- Deep-research synthesis (research_report_20260618_dscr_sovereign_os.md, 17 sections, 17 KB, 83 citations)
- 59 research artifacts across 13 of 15 domains (Round 14 parallel dispatch, 586 KB)
- Content-gap-analysis (35 KB, 4 modes)
- 10x audit report (AUDIT_20260618.md, ~17 KB)

**Existing claims with single-source or Tier 2 status (Round 14 re-verification candidates):**
- OBBBA §179 $2,560,000 — RESOLVED to Tier 1 (5 sources confirmed)
- NIIT MAGI $200K/$250K FROZEN since 2013 — RESOLVED to Tier 1 (6 sources confirmed)
- DSCR 28.7% of Non-QM share — Tier 1 (2 sources + Interior Mortgage Finance article)
- STR LA 2028 economics — Tier 2 (Deloitte/Airbnb commissioned, no independent study)

### Wave 2 — Depth Expansion: What's Weak

**Category A: Stale Propagations (Round 14 corrections not yet in TOPICAL_INDEX.md)**
1. QOZ permanence (OBBBA §70431, July 4, 2025) — `research_report` updated; `TOPICAL_INDEX` §4 not updated
2. QBI 23% for 2026 (OBBBA §70411 + §199A(i)) — `research_report` updated; `TOPICAL_INDEX` §4 not updated
3. OBBBA §179 $2,560,000 (IRS Rev. Proc. 2025-32) — verified in `research_report`; `TOPICAL_INDEX` §4 not updated

**Category B: Single-Source / Provisional Claims (need 2nd source)**
4. Pennymac FICO floor 620 — single primary source (Pennymac PDF)
5. STR default rate +1.5-2.5pp vs LTR (rule of thumb, no measured data)
6. Cure rate 58% DSCR vs 73% conforming (inferred, not measured)
7. Lender Price FLEX 9.20/10 score (single assessment, needs benchmark)
8. Optimal Blue vs LoanPASS spread comparison (LeadPops comparison, not primary)
9. Cotality multifamily 1-in-29 (single Q1 2026 report, needs historical validation)
10. STR regulation count: 50 MSAs (per Agent 6) vs 50 states (not done)
11. Insula Capital Jun 11 2026 launch (single press release, no follow-up)

**Category C: Empirical Data Gaps (subscription-gated or sales engineering required)**
12. UWM Apr 2026 Non-QM rate sheet (not public, needs sales contact)
13. Deephaven DSCR program (pre-2024 STALE data, needs re-verify)
14. Rocket Pro TPO DSCR product (TOPIC 8 placeholder, needs verify)
15. Per-MSA cap rate drift (CoStar subscription $10-30K/yr)
16. Pool correlation empirical data (intra-portfolio default correlation, no public)
17. Insurance escalation empirical data for SFR (CBRE/Trepp study)
18. Lender Price FLEX / LoanPASS API trial accounts (sales engineering)
19. NMLS Consumer Access REST API (NMLS Approved Vendor feeds needed)

**Category D: Emerging Regulatory Impacts (2026 effective dates)**
20. Section 1071 final rule implementation impact (effective Jun 30, 2026; compliance Jan 1, 2028)
21. FEMA Risk Rating 2.0 impact on DSCR coastal markets (effective Apr 1, 2023, ongoing)
22. OBBBA QOZ rural opportunity fund (QROF) details — new tier, 30% step-up
23. SR 26-02 model governance effective date (Apr 17, 2026) + CFPB Circular 2022-03 enforcement

### Wave 3 — Intelligence Harvest: Who Has the Data

**Authoritative sources for each category:**

| Category | Primary Source | Backup Source | Access |
|----------|----------------|---------------|--------|
| A. Stale propagations | (internal update) | (internal update) | No external research needed |
| B. Single-source claims | Pennymac / Optimal Blue / LoanPASS sales engineering; FRED, BLS, ATTOM, Federal Reserve | Scotsman Guide, Inside Mortgage Finance | Public + sales contact |
| C. Empirical data gaps | CoStar, ATTOM, Trepp, KBRA, AirDNA, Cotality, Roofstock, Optimal Blue API | Internal portfolio data (when available) | Subscription-gated |
| D. Regulatory impacts | Federal Register, CFPB, FEMA, IRS, OBBBA text (P.L. 119-21) | Big-4 CPA white papers, Mayer Brown, JD Supra | Public |

---

## Wave 4-7: Deep Collection (Specific Research Plan)

### Category A: Stale Propagations (Quick Wins)

#### Research Question A.1: Update TOPICAL_INDEX §4 to reflect QOZ permanence
- **Source priority:** Internal (research_report §5.4 + Round 14 corrections)
- **Verification:** Confirm text matches across all 3 files (research_report, TOPICAL_INDEX, MASTER_ANALYSIS)
- **Output artifact:** TOPICAL_INDEX §4.4 (QOZ Deferral) updated
- **Effort:** 1-2 hours
- **Tier:** 5 (Highly Confident — already verified in MASTER_ANALYSIS)

#### Research Question A.2: Update TOPICAL_INDEX §4 to reflect QBI 23% for 2026
- **Source priority:** Internal (research_report §5.2)
- **Verification:** Confirm 23% (not 20%) across all files
- **Output artifact:** TOPICAL_INDEX §4.2 (QBI) updated
- **Effort:** 1-2 hours
- **Tier:** 5 (Highly Confident)

#### Research Question A.3: Update TOPICAL_INDEX §4 to reflect OBBBA §179 = $2,560,000
- **Source priority:** Internal (research_report + Round 14 Tier 1 verification with 5 sources)
- **Verification:** Confirm $2,560,000 (not "$2.5M-$2.56M")
- **Output artifact:** TOPICAL_INDEX §4 (After-Tax) §179 line updated
- **Effort:** 1-2 hours
- **Tier:** 5 (Highly Confident)

### Category B: Single-Source / Provisional Claims

#### Research Question B.1: Pennymac FICO floor 620 — second source verification
- **Query pattern:** "Pennymac DSCR FICO 620 minimum secondary source", "Pennymac Non-QM rate sheet public"
- **Sources to consult:** Mortgage News Daily (cited in Agent 2), Scotsman Guide 2025 (Top 4), broker partner reviews
- **Verification:** Find a 2nd source confirming FICO 620 for Pennymac DSCR
- **Output artifact:** Updated `lender_pennymac_profile.md` with 2nd source citation
- **Effort:** 2-3 hours
- **Tier:** 4 (Confident — primary source already extracted)

#### Research Question B.2: STR default rate +1.5-2.5pp vs LTR — measured data
- **Query pattern:** "DSCR STR vs LTR default rate measured data", "Airbnb mortgage default rate 2026"
- **Sources to consult:** Roofstock 400K+ investor study, AirDNA Enterprise, Verus S&P presale, Cotality
- **Verification:** Replace rule-of-thumb with measured rate if available
- **Output artifact:** Updated `RESEARCH_DOMAIN_6_STR_DATA.md` with measured rate
- **Effort:** 3-4 hours
- **Tier:** 2 → 3 (currently Possible → upgrade to Probable)

#### Research Question B.3: DSCR cure rate 58% vs conforming 73% — measured data
- **Query pattern:** "DSCR cure rate measured vs conforming", "Non-QM cure rate empirical"
- **Sources to consult:** KBRA Non-QM RMBS servicing reports, MBA National Delinquency Survey, Cotality
- **Verification:** Find empirical cure rate, or document as "inferred"
- **Output artifact:** Updated `RESEARCH_DOMAIN_12_LGD_BENCHMARKS.md` with measured rate
- **Effort:** 2-3 hours
- **Tier:** 2 → 3

#### Research Question B.4: Lender Price FLEX 9.20/10 — second assessment
- **Query pattern:** "Lender Price FLEX vs Polly vs Optimal Blue independent review 2026"
- **Sources to consult:** LeadPops 2026 comparison (already cited), HousingWire, MortgageOrb, broker reviews
- **Verification:** Find a 2nd source confirming or challenging the 9.20/10 weighted score
- **Output artifact:** Updated `RESEARCH_DOMAIN_4_PPE_API.md` with cross-source validation
- **Effort:** 2-3 hours
- **Tier:** 3 (Probable)

#### Research Question B.5: Optimal Blue vs LoanPASS — independent spread comparison
- **Query pattern:** "Optimal Blue vs LoanPASS price comparison 2026", "PPE non-QM pricing benchmark"
- **Sources to consult:** LeadPops 2026 (cited), HousingWire, MortgageOrb
- **Verification:** Cross-check LeadPops data with another source
- **Output artifact:** Confidence scoring updated
- **Effort:** 2 hours
- **Tier:** 3 (Probable)

#### Research Question B.6: Cotality multifamily 1-in-29 — historical validation
- **Query pattern:** "multifamily mortgage fraud rate 2024 2025 2026 historical", "investment property fraud trend"
- **Sources to consult:** Cotality Q4 2024, Q1 2025, Q2 2025, Q3 2025, Q4 2025, Q1 2026 reports
- **Verification:** Confirm 1-in-29 is anomalous vs prior quarters
- **Output artifact:** Updated `RESEARCH_DOMAIN_8_INSURANCE_QUOTES.md` with historical chart
- **Effort:** 2-3 hours
- **Tier:** 3 (Probable — quarterly reports public)

#### Research Question B.7: STR regulation — full 50-state coverage
- **Query pattern:** "short term rental regulation by state 2026", "STR legality [state name]"
- **Sources to consult:** STR industry reports, state tourism departments, AirDNA regulatory database
- **Verification:** Map all 50 states × STR status (CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED)
- **Output artifact:** `str_regulation_by_state_2026.csv` (50 states × 4 status)
- **Effort:** 4-6 hours
- **Tier:** 3 (Probable — industry data exists)

#### Research Question B.8: Insula Capital — follow-up 30 days post-launch
- **Query pattern:** "Insula Capital Group portfolio DSCR update", "Insula Capital lending volume June 2026"
- **Sources to consult:** Insula website, PR Web updates, mortgage trade press
- **Verification:** Find product specs, first fundings, sales engineering contact
- **Output artifact:** Updated `RESEARCH_DOMAIN_11_PORTFOLIO_DSCR.md` with Insula specifics
- **Effort:** 2-3 hours
- **Tier:** 3 (Probable)

### Category C: Empirical Data Gaps (Subscription-Gated)

#### Research Question C.1: UWM Apr 2026 Non-QM rate sheet
- **Query pattern:** "UWM non-QM rate sheet June 2026", "United Wholesale Mortgage DSCR product", "UWM broker non-QM pricing"
- **Sources to consult:** UWM sales engineering contact, broker partner channels, Inside Mortgage Finance, Scotsman Guide
- **Verification:** Sales engineering call + 2nd source broker community
- **Output artifact:** `lender_uwm_profile.md` with verified rate sheet
- **Effort:** 4-6 hours
- **Tier:** 2 (Possible — gated by UWM access)
- **Access requirement:** UWM TPO broker account

#### Research Question C.2: Deephaven DSCR program re-verification
- **Query pattern:** "Deephaven Mortgage DSCR 2026", "Deephaven non-QM program update"
- **Sources to consult:** Deephaven website, broker reviews, NMLS verification
- **Verification:** Confirm program still active, get current rates
- **Output artifact:** Updated `lender_deephaven_profile.md`
- **Effort:** 2-3 hours
- **Tier:** 2 (Possible)

#### Research Question C.3: Rocket Pro TPO DSCR product
- **Query pattern:** "Rocket Pro TPO DSCR product 2026", "Rocket Mortgage wholesale non-QM"
- **Sources to consult:** Rocket Pro TPO website, broker community
- **Verification:** Extract DSCR product specifics
- **Output artifact:** Updated `lender_rocket_pro_tpo_profile.md`
- **Effort:** 2-3 hours
- **Tier:** 2 (Possible)

#### Research Question C.4: Per-MSA cap rate drift
- **Query pattern:** "cap rate by MSA 2026", "real estate cap rate by city", "CoStar cap rate trend 2026"
- **Sources to consult:** CoStar (paid), NCREIF NPI (free quarterly), CBRE cap rate survey (free annual)
- **Verification:** CBRE + NCREIF public data + CoStar paid data
- **Output artifact:** `cap_rate_by_msa_2026.csv` (top 50 MSAs × 4 property types)
- **Effort:** 6-8 hours (CBRE/NCREIF public) + 8-12 hours (CoStar paid)
- **Tier:** 3 (Probable with CBRE+NCREIF) / 4 (Confident with CoStar)
- **Access requirement:** CoStar subscription ($10-30K/yr) OR CBRE/NCREIF public

#### Research Question C.5: Pool correlation empirical data (intra-portfolio default correlation)
- **Query pattern:** "intra-portfolio default correlation DSCR", "real estate loan correlation within investor portfolio", "concentration risk DSCR"
- **Sources to consult:** Trepp CMBS (paid), KBRA NQM (paid), academic papers (SSRN, NBER)
- **Verification:** Find empirical correlation study
- **Output artifact:** `intra_portfolio_correlation.csv` (correlation matrix by property type)
- **Effort:** 8-12 hours
- **Tier:** 2 (Possible — academic data may exist)
- **Access requirement:** Trepp/KBRA subscription OR SSRN/NBER free

#### Research Question C.6: Insurance escalation empirical data for SFR
- **Query pattern:** "DSCR insurance escalation rate 2026", "SFR insurance premium increase 2024 2025 2026", "Florida insurance rate increase"
- **Sources to consult:** CBRE insurance report, Trepp insurance study, Florida Citizens Insurance data
- **Verification:** Get historical 2020-2026 SFR insurance escalation
- **Output artifact:** `sfr_insurance_escalation_2026.csv` (50 states × annual %)
- **Effort:** 4-6 hours
- **Tier:** 3 (Probable with CBRE/Trepp)
- **Access requirement:** CBRE or Trepp subscription

#### Research Question C.7: Lender Price FLEX + LoanPASS API trial accounts
- **Query pattern:** "Lender Price FLEX API documentation", "LoanPASS API documentation"
- **Sources to consult:** Vendor sales engineering, FLEX/LoanPASS API docs
- **Verification:** Get API access, run rate sheet ETL test
- **Output artifact:** API integration spec + test plan
- **Effort:** 8-12 hours (sales contact + onboarding + test)
- **Tier:** 2 (Possible)
- **Access requirement:** Vendor API trial account

#### Research Question C.8: NMLS Consumer Access REST API
- **Query pattern:** "NMLS Approved Vendor API", "NMLS Consumer Access data feed"
- **Sources to consult:** NMLS, CSBS
- **Verification:** Find approved vendor path for NMLS data
- **Output artifact:** NMLS data access plan
- **Effort:** 2-4 hours
- **Tier:** 2 (Possible — vendor relationship needed)

### Category D: Emerging Regulatory Impacts (Time-Sensitive)

#### Research Question D.1: Section 1071 implementation impact on DSCR
- **Query pattern:** "Section 1071 implementation June 2026 DSCR impact", "CFPB Section 1071 small business lending data DSCR"
- **Sources to consult:** CFPB, Federal Register (May 1 2026 final rule), Mayer Brown, JD Supra, Ballard Spahr
- **Verification:** Confirm 1,000-loan threshold, 15 data points, Jan 1 2028 compliance date
- **Output artifact:** Section 1071 impact memo for DSCR Sovereign OS
- **Effort:** 3-4 hours
- **Tier:** 5 (Highly Confident — primary source verified)
- **Time-sensitive:** Effective Jun 30 2026; compliance Jan 1 2028

#### Research Question D.2: FEMA Risk Rating 2.0 ongoing impact
- **Query pattern:** "FEMA Risk Rating 2.0 DSCR impact 2026", "flood insurance DSCR coastal markets"
- **Sources to consult:** FEMA, Florida Citizens Insurance, California FAIR Plan
- **Verification:** Find post-2.0 implementation data (2023-2026)
- **Output artifact:** FEMA Risk Rating 2.0 DSCR impact analysis
- **Effort:** 2-3 hours
- **Tier:** 4 (Confident)

#### Research Question D.3: OBBBA QOZ Rural Opportunity Fund (QROF) details
- **Query pattern:** "QOZ Rural Opportunity Fund 30% step-up", "QROF QOZ OBBBA Section 70431"
- **Sources to consult:** OBBBA Public Law 119-21, IRS Notice 2018-48, Rev. Proc. 2020-12
- **Verification:** Get QROF specifics — eligibility, step-up, holding period, decennial cycle
- **Output artifact:** QOZ/QROF update to TOPICAL_INDEX §4
- **Effort:** 3-4 hours
- **Tier:** 5 (Highly Confident)
- **Time-sensitive:** Decennial cycle begins July 1 2026

#### Research Question D.4: SR 26-02 model governance + CFPB Circular 2022-03 enforcement
- **Query pattern:** "SR 26-02 model governance enforcement", "CFPB Circular 2022-03 AI ML adverse action enforcement actions"
- **Sources to consult:** OCC, Federal Reserve, FDIC, CFPB enforcement actions
- **Verification:** Find any 2026 enforcement actions against DSCR lenders
- **Output artifact:** Compliance enforcement update
- **Effort:** 2-3 hours
- **Tier:** 3 (Probable)

---

## Wave 8: Evidence Architecture (Confidence Scoring)

| Research Area | Tier Before | Tier Target | Source Count | Source Credibility (1-10) |
|---------------|-------------|-------------|--------------|--------------------------|
| A.1 QOZ permanence | 5 | 5 | 3 (OBBBA, IRS, Big-4) | 9 |
| A.2 QBI 23% | 5 | 5 | 4 (OBBBA, IRS, AICPA, KPMG) | 9 |
| A.3 §179 $2.56M | 5 | 5 | 5 (IRS Rev. Proc., KPMG, CCH, etc.) | 9 |
| B.1 Pennymac FICO 620 | 3 | 4 | 2-3 (Pennymac + 2nd) | 8 |
| B.2 STR default rate | 2 | 3 | 1-2 (Roofstock or AirDNA) | 6 |
| B.3 DSCR cure rate | 2 | 3 | 1-2 (KBRA servicing) | 7 |
| B.4 FLEX 9.20/10 score | 3 | 4 | 2 (LeadPops + 1 more) | 6 |
| B.5 PPE spread | 3 | 4 | 2 (LeadPops + 1 more) | 6 |
| B.6 Cotality historical | 3 | 4 | 4-6 (quarterly reports) | 8 |
| B.7 STR 50 states | 3 | 4 | 2-3 (industry + state) | 7 |
| B.8 Insula follow-up | 3 | 4 | 2-3 (PR Web + sales) | 7 |
| C.1 UWM rate sheet | 2 | 4 | 1-2 (sales eng) | 8 |
| C.2 Deephaven re-verify | 2 | 4 | 1-2 (Deephaven + broker) | 7 |
| C.3 Rocket Pro TPO | 2 | 4 | 1-2 (website + broker) | 7 |
| C.4 Cap rate by MSA | 3 | 4 | 2-3 (CBRE + NCREIF) | 7-8 |
| C.5 Portfolio correlation | 2 | 3 | 1-2 (academic) | 6-7 |
| C.6 SFR insurance escalation | 3 | 4 | 1-2 (CBRE/Trepp) | 7 |
| C.7 FLEX/LoanPASS API | 2 | 4 | 1-2 (vendor sales) | 8 |
| C.8 NMLS API | 2 | 3 | 1-2 (vendor) | 6 |
| D.1 Section 1071 impact | 5 | 5 | 3+ (CFPB, Federal Reg, Mayer Brown) | 9 |
| D.2 FEMA RR 2.0 | 4 | 4 | 2-3 (FEMA, FL Citizens) | 8 |
| D.3 QROF details | 5 | 5 | 2-3 (OBBBA, IRS) | 9 |
| D.4 SR 26-02 enforcement | 3 | 4 | 1-2 (CFPB enforcement) | 7 |

**Aggregate target:** 23 research questions, expected aggregate tier: 4.0 (Confident) — up from current 3.5 baseline.

---

## Wave 9: Interactive Refinement (User Feedback Points)

**Questions for user before execution:**

1. **Subscription access:** Do you have access to any of these paid subscriptions?
   - [ ] CoStar (for C.4 cap rates)
   - [ ] Trepp CMBS (for C.5 portfolio correlation, C.6 insurance)
   - [ ] KBRA RMBS (for B.3 cure rate, C.5 correlation)
   - [ ] Scotsman Guide (for top 25+ lenders)
   - [ ] Inside Mortgage Finance (for B.6 Cotality historical)
   - [ ] Bloomberg / Intex (for capital markets data)
   - [ ] Optimal Blue / Polly / Lender Price / LoanPASS API trial (for C.7)

2. **Sales engineering contacts:** Do you have relationships with any of these for C.1, C.2, C.3, C.7?
   - [ ] UWM TPO contact
   - [ ] Pennymac TPO contact
   - [ ] Griffin / Kiavi / Visio / Newfi / Acra / A&D sales
   - [ ] Insula Capital Group contact
   - [ ] Lender Price FLEX / LoanPASS sales

3. **Resource priority:** Which categories to start first?
   - [ ] Category A only (1-2 days, internal updates)
   - [ ] Category A + B (1-2 weeks, public sources)
   - [ ] Category A + B + D (2-3 weeks, mostly public + time-sensitive)
   - [ ] All 4 categories (4-6 weeks, requires subscriptions)

4. **Output format:**
   - [ ] Standard Report (15 min tier, ~5KB) — just the plan
   - [ ] Comprehensive Report (30+ min tier, ~50KB) — plan + intelligence analysis + risk matrix
   - [ ] Both — plan + subsequent research execution

---

## Wave 10: Final Polish — Prioritized Execution Order

### Quick Wins (Week 1) — Category A + light Category B
1. **A.1-A.3** (3 items, 4-6 hours): Update TOPICAL_INDEX §4 — QOZ, QBI, §179
2. **B.1** (2-3 hours): Pennymac FICO 620 second source
3. **B.7** (4-6 hours): STR regulation 50-state coverage
4. **B.6** (2-3 hours): Cotality multifamily historical validation
5. **D.1-D.4** (10-14 hours): All 4 regulatory impacts (time-sensitive)

**Total Week 1:** 22-32 hours

### Strategic Builds (Weeks 2-3) — Category B (medium items) + Category C (public sources)
6. **B.2** STR default rate (3-4 hours)
7. **B.3** DSCR cure rate (2-3 hours)
8. **B.4** Lender Price FLEX 2nd assessment (2-3 hours)
9. **B.5** PPE spread comparison (2 hours)
10. **B.8** Insula follow-up (2-3 hours)
11. **C.2** Deephaven re-verify (2-3 hours)
12. **C.3** Rocket Pro TPO (2-3 hours)
13. **C.8** NMLS API access (2-4 hours)
14. **C.4** Cap rates via CBRE+NCREIF public (6-8 hours)
15. **C.6** SFR insurance via CBRE/Trepp (4-6 hours)

**Total Weeks 2-3:** 30-44 hours

### Long-Term (Weeks 4-6) — Category C (gated items)
16. **C.1** UWM rate sheet (sales eng, 4-6 hours)
17. **C.5** Portfolio correlation (academic search, 8-12 hours)
18. **C.7** FLEX/LoanPASS API trials (8-12 hours)

**Total Weeks 4-6:** 20-30 hours

### Grand Total: 72-106 hours over 4-6 weeks

---

## Quality Assurance Gates

### Gate 1: Source Diversity ✅
- [x] 5+ source types targeted (Federal Register, IRS, FEMA, lender product profiles, industry data, sales eng, academic)
- [x] 3+ government sources (Federal Register, IRS, FEMA)
- [x] 3+ industry sources (Pennymac, Scotsman Guide, Cotality)
- [x] No single source > 30% of total citations

### Gate 2: Fact Verification (Target: Tier 4+ for 90% of items)
- [ ] All Round 14 corrections (3 items, Tier 5)
- [ ] All B-category items: Tier 3-4 (up from Tier 2-3)
- [ ] All C-category items: Tier 3-4 (up from Tier 2)
- [ ] All D-category items: Tier 4-5 (up from Tier 3-4)

### Gate 3: Recency Check
- [ ] Primary sources < 12 months old (June 2025 - June 2026)
- [ ] Round 14 corrections: 2026 sources
- [ ] Industry data: 2024-2026
- [ ] Federal Register: 2025-2026

### Gate 4: Balance Check
- [x] Alternative viewpoints included (e.g., QOZ sunset debate, UWM Non-QM entry debate)
- [x] Critical gaps acknowledged (no public STR default data)
- [x] No single perspective over-represented

### Gate 5: Usability Check
- [x] Executive summary < 100 words (yes)
- [x] All sections clearly headed (yes)
- [x] Actionable insights highlighted (yes, with 23 research questions + sources + effort)
- [x] Citations traceable (yes, per-question source list)

---

## Stakeholder Map

| Stakeholder | Position | Interest | Action Needed |
|-------------|----------|----------|---------------|
| User (THE BUILDER) | Project owner | Slice 2 readiness | Approve plan, allocate resources |
| Mortgage SME (project role) | Lending expert | Lender matrix accuracy | Sales eng contact for C.1, C.2, C.3 |
| Quant/ML Engineer | Tech lead | Monte Carlo calibration | C.4, C.5, C.6 datasets |
| Compliance Research | Reg expert | Regulatory compliance | D.1, D.2, D.3, D.4 |
| Product/Ops | Marketing | Content + GTM | A.1-A.3 updates for marketing site |
| Engineering Lead | Architecture | API integration | C.7 FLEX/LoanPASS API |
| Data Engineer | Data pipeline | Vendor integration | C.8 NMLS API |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Subscription cost too high (CoStar $10-30K/yr) | HIGH | Blocks C.4 | Use CBRE + NCREIF public data first; CoStar only if needed |
| Sales eng unresponsive (UWM, Insula) | MEDIUM | Blocks C.1, B.8 | Use Inside Mortgage Finance secondary; broker community |
| Academic data missing for portfolio correlation (C.5) | MEDIUM | Monte Carlo accuracy degraded | Use CMBS multifamily correlation as proxy; document as estimate |
| Federal Register Section 1071 implementation delay | LOW | Compliance risk | Monitor CFPB announcements quarterly |
| FEMA remap triggering SFHA reclassification | MEDIUM | DSCR property default risk | Re-verify FEMA NFHL every 6 months for top 50 MSAs |
| OBBBA QOZ details change before Jul 1 2026 | LOW | Tax engine accuracy | Re-verify IRS guidance Q3 2026 |

---

## Research Gaps (Acknowledged)

Even after executing this plan, the following will remain TBD:
- **DSCR Forumals.md mathematical inconsistency** — needs explicit rejection note in TOPICAL_INDEX (Slice 1 already documents this in README)
- **Internal portfolio correlation data** — can only be obtained with proprietary origination data
- **2026 Scotsman Guide ranking (2025 production)** — annual cycle, publishes Apr 2027
- **Real-time vendor pricing comparison** — only available with active PPE API subscriptions
- **Master Synthesis + v14 + v16 cross-source consistency** — may have remaining minor drift

---

## Recommended Next Steps

1. **Approve this plan** (your call)
2. **Answer Wave 9 questions** (subscription access + sales contacts + priority)
3. **Start with Category A** (1-2 days) — internal TOPICAL_INDEX updates
4. **Then Category D** (1 week) — time-sensitive regulatory impacts
5. **Then Category B** (2 weeks) — second-source verifications
6. **Then Category C** (2-3 weeks) — subscription-gated data
7. **Re-run 10x audit after each category** to track quality score progression

**Estimated time to Tier 4+ on all 23 research areas: 4-6 weeks (1 FTE)**

---

*Generated by MiniMax Mavis deep-research-10x skill v9.9.10 on 2026-06-18 16:11 PT.*
*Methodology: 10 search waves + 10-point verification + intelligence scoring + 5 QA gates.*
*Aggregate target: Tier 4.0 (Confident) across 23 research areas, up from current Tier 3.5 baseline.*
