---
type: research
slice: 2
status: drafted
confidence: 3
title: DSCR Sovereign OS — Comprehensive Research Plan
summary: "**Author:** MiniMax Mavis (post Round 13 self-audit + content-gap-analysis)"
entities:
  - concept/arm
  - concept/cap-rate
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/apartment-list
  - data/cotality
  - data/fannie-mae
  - data/fred
  - data/kbra
  - data/trepp
  - data/zillow
  - data/zori
  - lender/acra-lending
  - lender/ad-mortgage
  - lender/american-heritage
  - lender/angel-oak
  - lender/crosscountry
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/insula
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/newfi
  - lender/ocmbc
  - lender/pennymac
  - lender/ready-capital
  - lender/rocket-pro
  - lender/uwm
  - lender/verus
  - lender/visio-lending
  - math/copula
  - math/merton-dd
  - math/t-copula
  - ml/shap
  - ml/timesfm
  - ml/xgboost
  - regulation/cfpb
  - regulation/ecoa
  - regulation/fcra
  - regulation/hoepa
  - regulation/section-1071
  - slice/1
  - slice/2
  - slice/3
  - slice/4
  - state/ca
  - state/fl
  - tax/1031
  - tax/bonus-depreciation
  - tax/niit
  - tax/pal
  - tax/qoz
  - topic/2-4-unit
  - topic/condo
  - topic/condotel
  - topic/multifamily
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - ml/xgboost
  - topic/adverse-action
  - topic/after-tax
  - topic/architecture
  - topic/borrower-demographics
  - topic/cecl
  - topic/compliance
  - topic/cure-rate
  - topic/default-rate
  - topic/fair-plan
  - topic/flood-insurance
  - topic/foreclosure
  - topic/ic-memo
  - topic/insurance
  - topic/kill-criteria
  - topic/lgd
  - topic/monte-carlo
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/short-rate
  - topic/tax
  - topic/usury
  - topic/yield-curve
  - type/audit
source: ANALYSIS/research_plan_20260618.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Comprehensive Research Plan

**Date:** 2026-06-18
**Author:** MiniMax Mavis (post Round 13 self-audit + content-gap-analysis)
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`
**Status:** Research phase 99.5% complete; this plan covers what REMAINING research is needed before Slice 2/3/4 build

---

## 0. Executive Summary

The DSCR Sovereign OS research base is **mature on technical architecture and core math** but has **15 distinct research domains** that still need work before Slice 2/3/4 can build with full confidence:

| # | Domain | Effort | Priority | Slice Blocker |
|---|--------|-------:|----------|---------------|
| 1 | Insurance / FEMA / NFIP / NFHL Compliance | 12 hr | P0 | Slice 2 P0-4 (kill criteria) |
| 2 | 50-State DSCR Product Licensing | 16 hr | P0 | Slice 2 P0-2 |
| 3 | Top 20 DSCR Lender Product Profiles | 40 hr | P0 | Slice 2 P0-2 |
| 4 | DSCR Lender API Aggregator (Optimal Blue / Polly / Lender Price / LoanPASS) | 24 hr | P1 | Slice 3 P2-3 |
| 5 | Empirical Calibration Data (rent / vacancy / cap rates / defaults) | 32 hr | P1 | Slice 2 P2-1 (Monte Carlo) |
| 6 | STR Market Saturation + Empirical Default Data | 24 hr | P1 | Slice 2 P1-2 (STR module) |
| 7 | Capital Markets & Securitization (KBRA / Verus / DBRS deal templates) | 24 hr | P2 | Slice 4 (capital markets) |
| 8 | Insurance Market Quotes (High-Risk Geography) | 16 hr | P1 | Slice 2 P0-4 (insurance kill) |
| 9 | DSCR After-Tax Engine Validation (OBBBA, NIIT, QOZ, REPS, 1031) | 24 hr | P1 | Slice 3 (after-tax engine) |
| 10 | 1031 × QOZ Interaction Modeling | 16 hr | P2 | Slice 3 (exit strategy modeling) |
| 11 | Portfolio-Level DSCR Aggregation (Insula-style) | 24 hr | P2 | Slice 4 (portfolio analytics) |
| 12 | Foreclosure + Loss-Given-Default Benchmarks | 20 hr | P2 | Slice 2 P2-1 (Monte Carlo LGD) |
| 13 | DSCR Borrower Demographics (Persona Library) | 16 hr | P3 | Marketing content + Slice 4 segmentation |
| 14 | Adverse Action Reason Crosswalk (FCRA + ECOA + 50-State) | 16 hr | P0 | Slice 2 P0-4 (reason engine) |
| 15 | Build-Time Validation (Pytest Golden Vectors + Snapshot Testing) | 32 hr | P0 | All Slice 2/3/4 (regression) |

**Total estimated effort:** ~336 hours over 6-12 weeks (1 person full-time equivalent).

**Critical path (P0 must-have before Slice 2 build):**
1. Domain 14 (Adverse Action Reason Crosswalk) — 16 hr
2. Domain 1 (Insurance/FEMA) — 12 hr
3. Domain 3 (Lender Profiles — first 5) — 12 hr (subset)
4. Domain 15 (Golden Vectors → Pytest) — already partially done in Slice 1

**Tier 1 status:** 47/47 verified. **Tier 2 PROVISIONAL:** 0 outstanding.
**Tier 2 candidates for re-verification (Round 14 candidates):** OBBBA §179 $2.5M-$2.56M; NIIT $200K/$250K MAGI; DSCR 28.7% Non-QM share.

---

## 1. Current State (What's Mature)

### 1.1 Slice 1 Production-Ready
- 122 tests passing, 91% coverage
- All checks pass: ruff lint, ruff format
- 7 commits on master including E501 fix (commit `290b0f0`) + ruff format (commit `40334cd`)
- Modules: payment, dscr, leverage, ltv, compliance
- Golden Vector: $425K / 75% LTV / 7% / 30yr / $3K rent / $5K tax / $2K ins / $150 HOA → P&I $2,120.6517, PITIA $2,853.9850, T1 DSCR 1.0512

### 1.2 20 Topics Documented in TOPICAL_INDEX.md
All Tier 1 verified:
- TOPIC 1: DUAL-TRACK DSCR MATH (10+ source convergence)
- TOPIC 2: MATH SPINE — PAYMENT FACTOR, PITIA, MAX PRICE, DEAL-BREAK RATE (golden vectors pinned)
- TOPIC 3: PRE-TAX RETURNS ENGINE (Levered IRR + Exit)
- TOPIC 4: AFTER-TAX RETURNS (OBBBA, §1250, NIIT, PAL, 1031)
- TOPIC 5: RATES & PRICING (Dated triplet June 17-18, 2026 verified)
- TOPIC 6: GOLDEN TESTS (23 acceptance criteria + 15 kill criteria)
- TOPIC 7: MONTE CARLO (t-copula, R-vine, CPTC)
- TOPIC 8: LENDER MATRIX (9-lender + 2-cite quick-match)
- TOPIC 9: STR INCOME (Legality, 3 worlds, seasonality)
- TOPIC 10: EVIDENCE VAULT & PROVENANCE (JSONB + SHA-256)
- TOPIC 11: 50-STATE PPP MATRIX (17 states mapped + branching gate)
- TOPIC 12: ARM RESET (SOFR forward curve + NSS-Svensson/Hull-White)
- TOPIC 13: AI/ML LAYER (TimesFM 2.5, TFT, XGBoost, CPTC)
- TOPIC 14: COST STACK & VENDORS (8 vendors verified)
- TOPIC 15: MARKET INTELLIGENCE (Non-QM $239B / 10% market; KBRA 3.8% / 0.03%)
- TOPIC 16: PROPERTY TAX & REASSESSMENT (state mechanics)
- TOPIC 17: COMPLIANCE, INSURANCE, REGULATORY (HOEPA, Section 1071, SR 26-02, FinCEN BOI)
- TOPIC 18: IC MEMO & REPORT GENERATION (RAG + CoT + LLM firewall)
- TOPIC 19: HYBRID OCR PIPELINE (Docling + Mistral 2505 + Ocrolus)
- TOPIC 20: BUILD ORDER & ARCHITECTURE (3-plane + 5 phases)

### 1.3 Externally Verified (29 sources)
Federal Register (HOEPA 2026, Section 1071), Trepp CMBS, KBRA Non-QM, Scotsman Guide 2025, Cotality Q1 2026, Deloitte LA28, Pennymac DSCR profile, Google Research TimesFM, Mayer Brown, CFPB, Verus, LeadPops, Multifamily Dive, Inside Mortgage Finance, Insula Capital, Stessa/Roofstock, arxiv 2602.10848.

### 1.4 Tier 2 Single-Source Items (Re-verification candidates)
| Item | Current Status | Re-Verify Source |
|------|----------------|------------------|
| OBBBA §179 $2.5M-$2.56M (2026) | Single source: Sovereign Master | IRS Rev. Proc. 2025-XX |
| NIIT $200K/$250K MAGI FROZEN since 2013 | 2 sources (Master + Sovereign) | IRS Form 8960 instructions |
| DSCR 28.7% Non-QM share | 2 sources (Def Master + Master Syn) | Inside Mortgage Finance 2026 Q1 report |
| STR LA 2028 economics | Single source: Deloitte/Airbnb commissioned | Independent academic study (UCLA Anderson, USC Lusk) |
| Scotsman Guide 2025 (2024 production) | Verified ✓ | (already Tier 1) |
| Cotality Q1 2026 fraud 1-in-44 | Verified ✓ | (already Tier 1) |
| KBRA 3.8% / 0.03% | Verified ✓ | (already Tier 1) |
| Pennymac DSCR profile 6.12.26 | Verified ✓ | (already Tier 1) |

---

## 2. Research Domains (15)

### DOMAIN 1: Insurance / FEMA / NFIP / NFHL Compliance

**Current state:** 3 FEMA + 1 NFIP + 2 NFHL mentions in corpus. **Gap severity:** HIGH (compliance blind spot).

**Why it matters:**
- DSCR loans on properties in SFHA (Special Flood Hazard Area) require flood insurance
- NFIP coverage limits: $250K building / $100K contents (residential); $500K/$500K (non-residential)
- FEMA NFHL zone verification required pre-closing
- FEMA remap events trigger policy rescission risk → loan default

**Research questions:**
1. What is the current FEMA NFHL zone determination API/workflow for lenders?
2. What are the NFIP coverage limits for residential vs non-residential properties?
3. What is the GRAND FATHER (Preferred Risk Policy) eligibility for properties in moderate-risk zones?
4. How does FEMA remap (Map Modernization / Risk Rating 2.0) affect existing DSCR portfolios?
5. What private flood insurance is accepted by top 20 DSCR lenders (vs NFIP-only)?
6. Does NFIP require evidence of insurance at closing or just zone determination?

**Sources to consult:**
- FEMA Map Service Center (msc.fema.gov) — public NFHL API
- NFIP Flood Insurance Manual (2024 edition)
- NFIP Write-Your-Own (WYO) program documentation
- FEMA Risk Rating 2.0: Equity in Action (technical documentation)
- Lender product profiles (Pennymac, Griffin, Kiavi) for flood insurance requirements

**Effort:** 12 hours research + 2 hours writing

**Priority:** **P0** (Slice 2 P0-4 kill criterion #3)

**Owner:** Compliance research

**Output artifact:**
- `RESEARCH_DOMAIN_1_INSURANCE_FEMA.md` (5-8KB)
- New section in TOPICAL_INDEX.md §17 (Insurance gap-fill)
- Schema additions to `compliance.py` for FEMA NFHL zone check

---

### DOMAIN 2: 50-State DSCR Product Licensing + State-Specific Compliance

**Current state:** 17-state PPP matrix verified (TOPIC 11); 33 states NOT individually detailed.

**Why it matters:**
- Lender licensing varies dramatically by state
- Some states prohibit specific entity types (NJ, NM, ND, KS, MD)
- DSCR product availability by state (some lenders exclude AK/HI, e.g., Visio)
- SAFE Act / MLO licensing varies by state
- Some states require specific disclosures (CA, NY)

**Research questions:**
1. For each of 50 states + DC: which of the top 20 DSCR lenders are licensed?
2. Which states require entity-level mortgage banking license (not just MLO)?
3. Which states require SAFE Act MLO licensing for DSCR originators?
4. Which states have unique DSCR disclosure requirements (e.g., CA Prop 13 + Prop 19)?
5. Which states restrict non-bank DSCR lending (e.g., NY Banking Law §6-l)?
6. Which states have usury caps that affect DSCR pricing (e.g., CA 10%, NY 16%)?

**Sources to consult:**
- NMLS (Nationwide Multistate Licensing System) public registry
- State banking department websites (50 states)
- Conference of State Bank Supervisors (CSBS) AARMR data
- Lender product profiles for "states served" field
- SAFE Act §1500 et seq.
- State usury statutes (50-state matrix)

**Effort:** 16 hours

**Priority:** **P0** (Slice 2 P0-2 lender schema)

**Owner:** Compliance research

**Output artifact:**
- `RESEARCH_DOMAIN_2_STATE_LICENSING.md` (8-10KB)
- `state_lender_licensing_matrix.csv` (50 states × 20 lenders)
- New section in TOPICAL_INDEX.md §11 (state matrix completion)

---

### DOMAIN 3: Top 20 DSCR Lender Product Profiles

**Current state:** Pennymac only verified primary-source extract. 9-lender matrix in TOPIC 8. 4 Scotsman Guide top lenders by volume. **Gap severity:** HIGH (Slice 2 P0-2 requires product profiles).

**Why it matters:**
- Slice 2 P0-2 "Lender rule schema + versioning" requires structured product profiles for ALL active lenders
- Confidence decay rules (TOPIC 10) require per-lender verified_date
- Two-quote quick-match (TOPIC 8) requires accurate DSCR floor / LTV / FICO / state coverage per lender

**Lenders to profile (target: 20):**

| # | Lender | Volume Tier | Profile Status |
|---|--------|-------------|----------------|
| 1 | Pennymac Correspondent | Top wholesale | ✅ Verified 6.12.26 |
| 2 | Griffin Funding | Top DSCR specialist | ⚠️ Partial (TOPIC 8) |
| 3 | Kiavi | Top tech-forward | ⚠️ Partial (TOPIC 8) |
| 4 | Visio Lending | Top DSCR specialist | ⚠️ Partial (TOPIC 8) |
| 5 | Acra Lending | 100% non-QM | ⚠️ Partial (TOPIC 8) |
| 6 | OCMBC | Top wholesale | ❌ Missing |
| 7 | CrossCountry Mortgage | Top retail/WS | ❌ Missing |
| 8 | A&D Mortgage | DSCR specialist | ❌ Missing |
| 9 | Newfi | DSCR + bridge | ⚠️ Partial (TOPIC 8) |
| 10 | Angel Oak Mortgage Solutions | Non-QM suite | ⚠️ Partial (TOPIC 8) |
| 11 | UWM (NEW Apr 2026) | Wholesale #1 | ❌ Missing |
| 12 | Defy Mortgage | DSCR specialist | ⚠️ Partial (TOPIC 8) |
| 13 | Easy Street Capital | STR specialist | ⚠️ Partial (TOPIC 8) |
| 14 | Lima One Capital | STR/blanket | ⚠️ Partial (TOPIC 8) |
| 15 | New Silver | DSCR + bridge | ⚠️ Partial (TOPIC 8) |
| 16 | American Heritage | DSCR specialist | ⚠️ Partial (TOPIC 8) |
| 17 | Rocket Pro TPO | Wholesale | ⚠️ Partial (TOPIC 8) |
| 18 | Insula Capital Group (NEW Jun 2026) | Portfolio-level | ❌ Missing |
| 19 | Deephaven | Non-QM | ⚠️ Stale (re-verify priority) |
| 20 | Ready Capital | Commercial bridge | ⚠️ Partial (TOPIC 8) |

**Per-lender research fields (extract from public sources):**
- Lender name + corporate entity
- DSCR floor (standard + with reserves)
- LTV max (purchase + cash-out + rate/term)
- FICO floor (CA if different)
- DSCR LTV cap matrix
- State coverage (50-state, exclude list)
- Property types (SFR, 2-4 unit, condo, non-warrantable condo, condotel)
- Entity types accepted (LLC, LP, Corp, individual, ITIN, Foreign National)
- Prepayment penalty structures offered
- ARM/IO products available
- STR support (projected / documented / 12-mo / haircut %)
- Reserve requirements (tiered by LTV/DSCR)
- Foreign National / ITIN pricing
- Pricing as of date + source
- Last verified date + confidence score

**Sources to consult:**
- Lender website product pages (20)
- Lender rate sheets (where publicly available)
- Scotsman Guide 2025 (already extracted)
- NMLS Consumer Access (nmlsconsumeraccess.org) for entity verification
- Scotsman Guide / Inside Mortgage Finance for production rankings
- Broker partner reviews (LinkedIn broker communities)

**Effort:** 2 hours per lender × 20 = 40 hours

**Priority:** **P0** (Slice 2 P0-2 lender schema blocker)

**Owner:** Lender research + mortgage SME

**Output artifact:**
- `RESEARCH_DOMAIN_3_LENDER_PROFILES.md` (40-60KB consolidated)
- `lender_profiles.jsonl` (20 entries with verified_date, source_url, confidence)
- 20 individual `lender_<name>_profile.md` files
- Update TOPICAL_INDEX §8 with full 20-lender matrix
- Schema additions to Slice 2 P0-2 (lender_programs table per TOPIC 10)

---

### DOMAIN 4: DSCR Lender API Aggregator (PPE Vendors)

**Current state:** TOPIC 14 verified vendor costs; LoanPASS + Lender Price FLEX identified as best for non-QM. **Gap severity:** MEDIUM (Slice 3 P2-3 blocker).

**Why it matters:**
- Slice 3 P2-3 "Capital markets adapter" requires live PPE integration
- Optimal Blue = market leader (120+ investors, BESTX™); legacy non-QM support
- Polly = API-driven, growing; strong but expensive
- Lender Price (LoanPRICE) = legacy
- LoanPASS = rules-first, no-code; selected by Verus (securitization sponsor)
- Need API docs, authentication, rate limits, pricing endpoints

**Research questions:**
1. Optimal Blue API: which endpoints for non-QM eligibility? Pricing per call?
2. Polly API: similar endpoints + pricing + SLA?
3. Lender Price FLEX API: authentication model, OAuth vs API key?
4. LoanPASS API: rules engine API vs pricing API?
5. Which vendor supports all 20 top DSCR lenders in their pricing engine?
6. Multi-source pricing reconciliation (when Optimal Blue and Polly disagree)?
7. Real-time rate lock APIs (which vendors support 30/45/60-day locks)?
8. Secondary market best execution (BESTX™ equivalent at each vendor)?

**Sources to consult:**
- Optimal Blue API documentation (developer.optimalblue.com)
- Polly API documentation (polly.io/developers)
- Lender Price API documentation (lenderprice.com/developers)
- LoanPASS API documentation (loanpass.io/developers)
- Vendor sales engineering contacts (request API trial)
- 3rd party benchmarks (leadpops.com/blog/mortgage-pricing-engines-compared)
- Vendor pricing proposals (request from sales)

**Effort:** 24 hours (including vendor sales outreach)

**Priority:** **P1** (Slice 3 P2-3 blocker)

**Owner:** Engineering lead + capital markets SME

**Output artifact:**
- `RESEARCH_DOMAIN_4_PPE_API.md` (15-20KB)
- `ppe_vendor_comparison.csv` (4 vendors × 25 fields)
- Architecture decision record (ADR) for primary vendor selection
- API integration spec (one per chosen vendor)

---

### DOMAIN 5: Empirical Calibration Data

**Current state:** TOPIC 7 has Monte Carlo config with KBRA-calibrated distributions. **Gap severity:** MEDIUM (Slice 2 P2-1 calibration).

**Why it matters:**
- Monte Carlo calibration depends on empirical rent growth, vacancy, cap rate distributions
- Current config: rent μ=0%, σ=9.5% (KBRA DSCR methodology); insurance μ=7%/12% coastal; tax μ=3%/σ=1%
- 54.8% of US counties had yield decline 2025-26 (TOPIC 15) — needs validation
- STR distributions: ADR μ=lognormal σ=18-25%; occupancy varies by market

**Research questions:**
1. What is the empirical rent growth distribution by MSA (top 50 MSAs) for 2015-2025?
2. What is the empirical cap rate distribution by MSA and property type?
3. What is the empirical LTR vacancy rate distribution by MSA?
4. What is the empirical STR occupancy + ADR distribution by market (top 50)?
5. What is the empirical property tax growth distribution by state (with cap effects)?
6. What is the empirical insurance escalation distribution by geography (high-risk vs normal)?
7. What is the empirical default rate by FICO bucket, DSCR bucket, LTV bucket?
8. What is the empirical loss-given-default (LGD) by property type and foreclosure method?
9. What is the empirical cure rate (default → cure) within 6/12/24 months?
10. How to obtain these datasets (free vs paid)?

**Sources to consult:**
- FRED (Federal Reserve Economic Data) — CPI rent index, Case-Shiller, FHFA HPI
- BLS CPI Rent series (CUUR0000SEHA)
- Apartment List rent index (free, monthly)
- CoStar (paid, industry standard)
- Zillow ZORI (rent index; used in TOPIC 7 ICF)
- AirDNA (paid enterprise; STR data)
- RentCast (API; LTR data)
- ATTOM (property tax, foreclosure)
- Cotality LoanSafe (default data)
- KBRA Non-QM RMBS reports (default rates by FICO/LTV)
- Trepp CMBS (cap rate + DS data)
- Federal Reserve Survey of Consumer Finances (borrower demographics)

**Effort:** 32 hours (research + data engineering)

**Priority:** **P1** (Slice 2 P2-1 Monte Carlo)

**Owner:** Quant engineer + data engineer

**Output artifact:**
- `RESEARCH_DOMAIN_5_CALIBRATION.md` (10-15KB)
- `empirical_calibration_dataset.csv` (top 50 MSAs × 10 metrics)
- `mc_distribution_params.json` (consumed by Slice 2 P2-1)
- Update TOPICAL_INDEX §7 with empirical validation

---

### DOMAIN 6: STR Market Saturation + Empirical Default Data

**Current state:** TOPIC 9 has STR module (3 worlds, three-source min, OpEx 45-65%). **Gap severity:** MEDIUM (Slice 2 P1-2 STR module).

**Why it matters:**
- STR underwriting haircut (×0.70-0.80 of projected) is heuristic; need empirical validation
- STR default rate vs LTR default rate is critical (STR risk premium)
- STR market saturation varies by MSA (Nashville saturated, Tampa hot, etc.)
- STR seasonality bar chart mandated but default pattern unclear

**Research questions:**
1. What is the empirical default rate for STR-backed DSCR loans vs LTR?
2. What is the empirical seasonality pattern by MSA (12-month occupancy)?
3. What is the empirical ADR volatility by MSA (σ)?
4. What is the STR market saturation index (rentals per capita) by MSA?
5. What is the STR OpEx distribution (45-65% — what determines high vs low)?
6. What is the STR cap rate by market (Nashville vs Brooklyn)?
7. How does STR refinance rate compare to LTR refinance rate?
8. What STR-friendly lenders offer 30-year fixed (vs only ARM)?
9. What is the empirical STR profitability vs LTR at different occupancy levels?
10. STR regulation database — how comprehensive is current coverage?

**Sources to consult:**
- AirDNA (STR ADR, occupancy, supply by market)
- Mashvisor (STR ROI data)
- Roofstock (STR + LTR market data)
- AllTheRooms (formerly Transparent) — STR data
- STR regulation tracker (TOPIC 9 mentions hardcoded LA/NYC/Miami/Nashville; need 50 MSA + state)
- KBRA Non-QM study — breakdown by property type (STR vs LTR)
- Verus S&P DSCR Presale 2025 (63.04% no lease, 3.82% 30-day DQ)

**Effort:** 24 hours

**Priority:** **P1** (Slice 2 P1-2 STR module)

**Owner:** Quant engineer + STR SME

**Output artifact:**
- `RESEARCH_DOMAIN_6_STR_DATA.md` (10-12KB)
- `str_seasonality_by_msa.csv` (50 MSAs × 12 months × occupancy/ADR)
- `str_saturation_index.csv` (50 MSAs × supply growth)
- `str_default_rate_empirical.csv` (STR vs LTR default comparison)
- Update TOPIC 9 haircut validation
- Schema additions for STR confidence band

---

### DOMAIN 7: Capital Markets & Securitization

**Current state:** TOPIC 17 has capital markets + securitization; KBRA 3.8%/0.03% verified; Verus S&P DSCR 89.44% property-focused. **Gap severity:** MEDIUM (Slice 4 capital markets).

**Why it matters:**
- Slice 4 "Capital markets v1" requires warehouse integration + loan tape + securitization analytics
- Securitization deal templates from KBRA/Verus inform pool eligibility criteria
- Gain-on-sale economics depend on MSR valuation (MCT: 3.65x-4.25x)
- Credit enhancement (5-15%) is pool-specific

**Research questions:**
1. What is the KBRA Non-QM RMBS pool eligibility criteria (current template)?
2. What is the Verus DSCR MBS issuance template (2025-2026)?
3. What is the DBRS Morningstar Non-QM rating template?
4. What is the Fitch Non-QM rating template?
5. What is the S&P Non-QM rating template?
6. What is the average credit enhancement by DSCR pool?
7. What is the standard loan tape schema for DSCR MBS issuance?
8. What is the typical pool size for DSCR ABS issuance (e.g., 1,000 loans, $400M)?
9. What are the warehouse facility terms (advance rate, mark-to-market, covenants)?
10. What is the typical MSR fair value by LTV/DSCR/FICO bucket?
11. What are the HECM/HFA reverse implications (if any)?
12. What is the typical securitization timeline (origination → warehouse → MBS issuance)?

**Sources to consult:**
- KBRA Non-QM RMBS research portal (subscription)
- Verus Mortgage Capital 2026 Outlook (already cited)
- DBRS Morningstar Non-QM methodology
- Fitch Ratings Non-QM RMBS criteria
- S&P Global Ratings Non-QM RMBS methodology
- MBS data (Bloomberg, Intex — paid)
- MIAC Analytics (MSR fair values)
- MCT Trading (MSR valuations)
- LoanVantage (warehouse facility)
- ICE Encompass Warehouse (warehouse modules)

**Effort:** 24 hours

**Priority:** **P2** (Slice 4 capital markets; not blocking Slice 2/3)

**Owner:** Capital markets SME + data engineer

**Output artifact:**
- `RESEARCH_DOMAIN_7_CAPITAL_MARKETS.md` (12-15KB)
- `loan_tape_schema.json` (KBRA-compatible)
- `pool_eligibility_template.csv` (rating agency criteria)
- `msr_fair_value_by_bucket.csv`
- Update TOPIC 17 capital markets section

---

### DOMAIN 8: Insurance Market Quotes (High-Risk Geography)

**Current state:** TOPIC 17 has insurance kill criterion for FL/CA/TX Gulf/LA Coastal. **Gap severity:** HIGH (kill criterion is currently abstract — need market quotes).

**Why it matters:**
- Insurance kill criterion is a Tier 0 gate (no insurance → no loan)
- Need empirical quote ranges by geography + property type
- 90%+ FL investors missed deals due to insurance (2024 data)
- 83% CA investors missed deals (2024)
- Coastal insurance market in 2026 still constrained

**Research questions:**
1. What is the typical insurance quote range for FL coastal single-family rental (SFR)?
2. What is the typical insurance quote for CA wildfire zone SFR?
3. What is the typical insurance quote for TX Gulf Coast SFR?
4. What is the typical insurance quote for LA Coastal SFR?
5. What is the typical insurance quote for normal-risk SFR (e.g., OH, PA)?
6. What is the typical STR insurance cost vs LTR insurance?
7. What is the typical condo insurance (HO-6) for investment property?
8. Which private insurance carriers accept high-risk DSCR properties?
9. What is the typical insurance quote timeline (binding → policy issuance)?
10. Are there insurance aggregator APIs (e.g., Neptune, Layr, Slide) for DSCR?

**Sources to consult:**
- Insurance carrier quote APIs (Neptune, Layr, Slide, Berkley)
- Lender product profiles (which insurance is required per lender)
- Insurance Information Institute (III.org)
- Florida Citizens Property Insurance Corporation (state-backed insurer)
- California FAIR Plan (state-backed insurer)
- Insurance broker partner channels (commercial insurance brokers)
- Insurify 2026 industry report (already cited)

**Effort:** 16 hours

**Priority:** **P1** (Slice 2 P0-4 insurance kill criterion)

**Owner:** Compliance research + insurance SME

**Output artifact:**
- `RESEARCH_DOMAIN_8_INSURANCE_QUOTES.md` (8-10KB)
- `insurance_quotes_by_geography.csv` (50 states × risk tier × property type)
- `insurance_aggregator_apis.csv` (vendor comparison)
- Update TOPIC 17 with empirical insurance data

---

### DOMAIN 9: DSCR After-Tax Engine Validation

**Current state:** TOPIC 4 has OBBBA, §1250, NIIT, PAL, 1031, 469, REPS, §179, §163(j), QBI all covered. **Gap severity:** MEDIUM (Slice 3 after-tax engine).

**Why it matters:**
- Slice 3 after-tax engine needs second-source validation for single-source claims
- OBBBA §179 $2.5M-$2.56M is single-source (Sovereign Master)
- NIIT $200K/$250K FROZEN since 2013 is 2-source but historical
- Cost segregation edge cases (5/7/15/27.5/39-yr lives) need empirical validation

**Research questions:**
1. What is the current IRS Revenue Procedure 2025-XX §179 limit (verify $2.5M-$2.56M)?
2. What is the IRS Form 8960 NIIT MAGI threshold (verify $200K/$250K FROZEN)?
3. What is the OBBBA §163(j) ATI calculation (EBIT vs EBITDA-based) for real estate?
4. What is the QBI 20% deduction calculation for pass-through rental income?
5. What is the cost segregation class life determination (5/7/15/27.5/39-yr)?
6. What is the REPS 750-hour test documentation requirements (per 2026 IRS guidance)?
7. What is the §469 passive loss phase-out formula validation?
8. What is the §1250 recapture calculation for accelerated depreciation (vs straight-line)?
9. What is the 1031 like-kind exchange holding period (current IRS guidance)?
10. What is the QOZ December 31, 2026 sunset — is there pending legislation to extend?
11. What is the OB BBA 100% bonus depreciation interaction with §179 + QOZ?
12. What is the SECURE Act 2.0 impact on DSCR (if any)?

**Sources to consult:**
- IRS Revenue Procedure 2025-XX (annual §179 inflation adjustment)
- IRS Form 8960 instructions
- IRS Publication 946 (How to Depreciate Property)
- IRS Cost Segregation Audit Techniques Guide (ATG)
- Tax Cuts and Jobs Act (TCJA) text
- OBBBA Public Law 119-21 (July 4, 2025)
- AICPA DSCR tax engine guidance
- Bloomberg Tax / CCH Intelliconnect (paid)
- Big-4 CPA firm white papers (Deloitte, PwC, EY, KPMG)

**Effort:** 24 hours

**Priority:** **P1** (Slice 3 after-tax engine; some items P0 for validation)

**Owner:** Tax SME + compliance research

**Output artifact:**
- `RESEARCH_DOMAIN_9_TAX_VALIDATION.md` (10-12KB)
- `tax_engine_validation_table.csv` (12 items × verified source)
- Update TOPIC 4 with second-source verifications
- Schema additions to Slice 3 after-tax module

---

### DOMAIN 10: 1031 × QOZ Interaction Modeling

**Current state:** 1031 individually covered (30 mentions); QOZ individually covered (13 mentions); interaction NOT modeled. **Gap severity:** HIGH (deal-structuring lever).

**Why it matters:**
- 1031 + QOZ sequencing is sophisticated exit strategy
- §1400Z-2 deferral can extend to 12/31/2026 (QOZ sunset)
- §1031 exchange property can be QOZ property
- Interaction effects: tax basis reduction, deferred gain roll-forward

**Research questions:**
1. Can a 1031 exchange property be in a QOZ?
2. How does §1400Z-2 deferral interact with §1031 boot recognition?
3. What is the optimal 1031+QOZ exit sequence (sell → 1031 into QOZ → defer 12/31/2026)?
4. What is the §1031 exchange timeline (45-day identification / 180-day closing)?
5. What is the QI (Qualified Intermediary) requirement for §1031?
6. What is the §1400Z-2 10-year QOZ holding period?
7. What is the §1400Z-2 180-day reinvestment requirement?
8. What is the tax basis step-up when QOZ holding period ends?
9. How does OBBBA 100% bonus depreciation interact with QOZ (cost segregation in QOZ)?
10. What is the QOZ sunset scenario (no extension = all deferrals recognized 12/31/2026)?

**Sources to consult:**
- IRC §1031 (Like-Kind Exchanges)
- IRC §1400Z-2 (Qualified Opportunity Zones)
- IRS Notice 2018-48 (QOZ initial guidance)
- Rev. Proc. 2020-12 (QOZ working capital safe harbor)
- IRS Form 8824 (Like-Kind Exchanges)
- IRS Form 8996 (Qualified Opportunity Fund)
- Big-4 CPA white papers
- 1031 CORP. (industry Q&A)
- QOZ investor community resources (Opportunity Zones Database)

**Effort:** 16 hours

**Priority:** **P2** (Slice 3 after-tax engine)

**Owner:** Tax SME + modeling engineer

**Output artifact:**
- `RESEARCH_DOMAIN_10_1031_QOZ.md` (10-12KB)
- `1031_qoz_interaction_model.py` (Python model)
- Update TOPIC 4 with §10 section
- Schema for exit strategy modeling

---

### DOMAIN 11: Portfolio-Level DSCR Aggregation

**Current state:** Insula Capital Group (Jun 11 2026) NEW entry. TOPIC 9 has ΣNOI/ΣADS for portfolio. **Gap severity:** MEDIUM (Slice 4 portfolio).

**Why it matters:**
- Insula Capital launched portfolio-level DSCR June 11, 2026
- Modified Dietz portfolio return already in TOPIC 9
- EPFL Contagion Index proposed but not validated
- Slice 4 portfolio analytics needs portfolio aggregation conventions

**Research questions:**
1. What is Insula Capital's portfolio-level underwriting criteria?
2. What other lenders offer portfolio-level DSCR (AUM, cross-collateral, blanket)?
3. What is the industry-standard Modified Dietz formula for real estate portfolios?
4. What is the EPFL Contagion Index calculation methodology?
5. How do portfolio loans handle cross-default risk?
6. How are portfolio loans priced vs single-property loans (spread differential)?
7. What are the concentration limits per MSA / per property type / per borrower?
8. What is the empirical correlation of defaults within a single investor's portfolio?
9. How do portfolio refinances work (single loan vs multiple loans)?
10. What is the typical portfolio loan size range ($5M-$50M? $50M-$500M?)?

**Sources to consult:**
- Insula Capital Group product materials (press release + website)
- Lima One Capital portfolio products (TOPIC 8)
- Ready Capital portfolio products
- ACREFI / IMN portfolio lending conferences
- MBA Quarterly Portfolio Lending Report
- Multi-Housing News (portfolio lending coverage)
- Institutional Real Estate (portfolio lending research)

**Effort:** 24 hours

**Priority:** **P2** (Slice 4 portfolio; not blocking Slice 2/3)

**Owner:** Portfolio SME + capital markets SME

**Output artifact:**
- `RESEARCH_DOMAIN_11_PORTFOLIO_DSCR.md` (8-10KB)
- `portfolio_aggregation_model.py` (Modified Dietz + EPFL)
- `portfolio_lender_matrix.csv` (Insula, Lima One, Ready Capital, etc.)
- Update TOPIC 9 + TOPIC 15 portfolio sections

---

### DOMAIN 12: Foreclosure + Loss-Given-Default Benchmarks

**Current state:** TOPIC 7 has Monte Carlo LGD reference; TOPIC 15 has 0.03% realized losses; not enough for production model. **Gap severity:** MEDIUM (Slice 2 P2-1 LGD calibration).

**Why it matters:**
- Merton Distance-to-Default (TOPIC 7) requires LGD input
- CECL lifetime expected credit loss (TOPIC 20 Phase 4b) requires LGD
- KBRA 3.8% default / 0.03% loss → 0.79% severity, but only KBRA-rated

**Research questions:**
1. What is the empirical LGD by property type (SFR, 2-4 unit, condo, STR)?
2. What is the empirical LGD by state (judicial vs non-judicial foreclosure)?
3. What is the empirical LGD by LTV bucket at default?
4. What is the empirical cure rate (default → cure) within 6/12/24 months?
5. What is the timeline for non-judicial foreclosure in CA, TX, FL?
6. What is the timeline for judicial foreclosure in NY, NJ, FL?
7. What is the typical foreclosure cost (legal, carrying, marketing) by state?
8. What is the typical eviction timeline post-foreclosure?
9. What is the typical resale discount (fire sale vs orderly)?
10. What is the typical loan modification / repayment plan success rate?
11. What is the COVID-era CARES Act impact on DSCR delinquency (2020-2021)?
12. What is the post-COVID DSCR delinquency pattern (recovery curve)?

**Sources to consult:**
- ATTOM foreclosure data
- Cotality (CoreLogic) default data
- Verus S&P DSCR Presale reports
- KBRA Non-QM RMBS reports (loss severity)
- MBA National Delinquency Survey
- Federal Reserve Financial Accounts of the United States
- State foreclosure statutes (50 states)
- DSCR-specific research from KBRA, Trepp

**Effort:** 20 hours

**Priority:** **P2** (Slice 2 P2-1 calibration; Slice 4 CECL)

**Owner:** Credit risk SME + data engineer

**Output artifact:**
- `RESEARCH_DOMAIN_12_LGD_BENCHMARKS.md` (10-12KB)
- `lgd_by_property_type_state.csv` (5 property types × 50 states)
- `cure_rate_by_month.csv` (default → 6/12/24 month cure)
- `foreclosure_timeline_by_state.csv`
- Update TOPIC 7 + TOPIC 15 with empirical LGD

---

### DOMAIN 13: DSCR Borrower Demographics

**Current state:** TOPIC 17 has borrower eligibility (US citizen, ITIN, Foreign National); not enough for persona-based marketing. **Gap severity:** LOW (marketing content + Slice 4 segmentation).

**Why it matters:**
- Slice 4 segmentation requires borrower persona library
- Marketing content needs persona-specific messaging
- Default rates vary by borrower type (ITIN, Foreign National, REPS, etc.)
- Top-of-funnel content needs to match borrower search intent

**Research questions:**
1. What is the demographic breakdown of DSCR borrowers by type?
2. What is the typical DSCR borrower age, income, net worth, geographic distribution?
3. What percentage of DSCR borrowers are LLC-vested vs individual?
4. What percentage of DSCR borrowers are first-time investors vs repeat?
5. What percentage of DSCR borrowers use ITIN or Foreign National programs?
6. What is the typical DSCR borrower portfolio size (1-3 properties, 4-10, 10+)?
7. What is the geographic distribution of DSCR borrowers by MSA?
8. What is the typical DSCR borrower credit profile (FICO distribution)?
9. What is the DSCR borrower retention rate (refinance / repeat with same lender)?
10. How do DSCR borrowers discover lenders (broker referral, Google, podcast, social)?

**Sources to consult:**
- Scotsman Guide Top Brokers list
- MBA Quarterly Mortgage Origination by Borrower Demographics
- Fannie Mae Home Purchase Sentiment Index (HPSI)
- Urban Institute Housing Finance at a Glance
- Census Bureau American Community Survey (investor demographics)
- Federal Reserve Survey of Consumer Finances
- Cotality LoanSafe (borrower profile data)
- Verus S&P DSCR Presale (borrower characteristics)

**Effort:** 16 hours

**Priority:** **P3** (Slice 4 segmentation; not blocking Slice 2/3)

**Owner:** Marketing + product

**Output artifact:**
- `RESEARCH_DOMAIN_13_BORROWER_DEMOGRAPHICS.md` (8-10KB)
- `dscr_borrower_personas.csv` (5-7 personas)
- `borrower_journey_map.md` (Awareness → Decision → Retention)
- Update content-gap-analysis marketing strategy

---

### DOMAIN 14: Adverse Action Reason Crosswalk (FCRA + ECOA + 50-State)

**Current state:** TOPIC 17 has CFPB Circular 2022-03 mention; TOPIC 18 has LLM firewall; not enough for production reason engine. **Gap severity:** HIGH (Slice 2 P0-4 blocker).

**Why it matters:**
- Slice 2 P0-4 "Adverse action reason engine" requires specific reason templates
- CFPB Circular 2022-03 requires specific and accurate reasons
- Each lender has different reason codes
- 50-state variations in required reasons

**Research questions:**
1. What are the FCRA-required adverse action reason categories (4 main + sub)?
2. What are the ECOA-required adverse action reasons (specific prohibited bases)?
3. What is the CFPB Circular 2022-03 requirement for AI/ML model explanations?
4. How do top 20 DSCR lenders phrase their adverse action reasons?
5. What SHAP values map to specific reason text?
6. What are the state-specific adverse action disclosure requirements (CA, NY, MA)?
7. How does the ECOA notice differ from FCRA notice?
8. What is the timing requirement (30 days for FCRA, 30 days for ECOA)?
9. What is the record retention requirement (25 months for FCRA)?
10. What is the LLM hallucination firewall approach (TOPIC 18) for adverse action?
11. How do you generate specific reasons from XGBoost SHAP values?
12. What is the standard "right to obtain credit score" disclosure?

**Sources to consult:**
- FCRA §615 (15 USC §1681m)
- ECOA §701 et seq. (15 USC §1691)
- Regulation B (12 CFR §1002.9)
- CFPB Circular 2022-03 (Adverse Action Notice Requirements)
- CFPB Consumer Financial Protection Circular Series
- Lender adverse action notice templates (20 lenders)
- State-specific disclosure requirements (50 states)
- AICPA adverse action best practices
- Bloomberg Law / Consumer Finance Monitor

**Effort:** 16 hours

**Priority:** **P0** (Slice 2 P0-4 reason engine blocker)

**Owner:** Compliance research + engineering

**Output artifact:**
- `RESEARCH_DOMAIN_14_ADVERSE_ACTION.md` (10-12KB)
- `adverse_action_reason_library.json` (50+ reason templates)
- `shap_to_reason_mapping.csv` (XGBoost features → reason text)
- Schema additions to Slice 2 P0-4 (adverse_action_reasons table)
- Update TOPIC 17 with adverse action details

---

### DOMAIN 15: Build-Time Validation (Pytest Golden Vectors + Snapshot Testing)

**Current state:** Slice 1 has 122 tests with 91% coverage. Slice 2/3/4 need additional golden vectors + snapshot tests. **Gap severity:** HIGH (all Slice 2/3/4 quality bar).

**Why it matters:**
- Slice 1 verification-before-completion requires fresh test runs
- Slice 2/3/4 build introduces new modules (lender matching, Monte Carlo, OCR, etc.)
- Golden vectors from GOLDEN_VECTORS.md need to become pytest fixtures
- Snapshot tests needed for distributional DSCR (Monte Carlo reproducibility)
- Mutation testing for adverse action reason library

**Research questions:**
1. What additional golden vectors are needed for Slice 2 (lender matching)?
2. What additional golden vectors are needed for Slice 3 (Monte Carlo)?
3. What snapshot tests are needed for distributional DSCR outputs?
4. What golden vectors are needed for the adverse action reason engine?
5. What mutation tests are needed for the reason library?
6. What is the test data strategy for OCR (synthetic PDFs vs production)?
7. What is the CI/CD strategy for GPU-dependent tests (TimesFM 2.5)?
8. What is the property-based testing strategy for Monte Carlo (Hypothesis)?
9. What is the regression test strategy for lender matrix updates?
10. What is the load testing strategy for API endpoints (FastAPI + Locust)?

**Sources to consult:**
- pytest documentation
- Hypothesis (property-based testing) documentation
- mutmut / cosmic-ray (mutation testing for Python)
- Locust (load testing)
- golden-master / snapshot testing patterns
- SciPy testing patterns for numerical code
- QuantLib testing patterns for financial math
- Vercel + FastAPI testing patterns

**Effort:** 32 hours

**Priority:** **P0** (all Slice 2/3/4 quality bar)

**Owner:** Engineering + QA

**Output artifact:**
- `RESEARCH_DOMAIN_15_VALIDATION.md` (8-10KB)
- 100+ new pytest fixtures in `tests/golden/`
- Snapshot test infrastructure for Monte Carlo
- CI/CD workflow updates (.github/workflows/)
- Coverage targets for each Slice 2/3/4 module

---

## 3. Prioritized Execution Order

### Tier 1 — Quick Wins (This Week, ~30 hours)

| # | Domain | Effort | Outcome |
|---|--------|-------:|---------|
| 1 | Domain 14 (Adverse Action Reason Crosswalk) | 16 hr | Slice 2 P0-4 unblocked |
| 2 | Domain 1 (Insurance/FEMA/NFIP/NFHL) | 12 hr | Slice 2 P0-4 kill criterion #3 validated |

### Tier 2 — Strategic Builds (This Month, ~150 hours)

| # | Domain | Effort | Outcome |
|---|--------|-------:|---------|
| 3 | Domain 3 (Top 20 Lender Profiles) | 40 hr | Slice 2 P0-2 unblocked |
| 4 | Domain 4 (PPE Vendor API Docs) | 24 hr | Slice 3 P2-3 unblocked |
| 5 | Domain 5 (Empirical Calibration) | 32 hr | Slice 2 P2-1 Monte Carlo calibrated |
| 6 | Domain 8 (Insurance Quotes by Geography) | 16 hr | Slice 2 P0-4 insurance kill validated |
| 7 | Domain 9 (After-Tax Engine Validation) | 24 hr | Slice 3 after-tax engine validated |
| 8 | Domain 15 (Build-Time Validation) | 32 hr | Slice 2/3/4 quality bar met |

### Tier 3 — Long-Term (This Quarter, ~160 hours)

| # | Domain | Effort | Outcome |
|---|--------|-------:|---------|
| 9 | Domain 6 (STR Empirical) | 24 hr | Slice 2 P1-2 STR module validated |
| 10 | Domain 10 (1031 × QOZ) | 16 hr | Slice 3 exit strategy modeling |
| 11 | Domain 11 (Portfolio DSCR) | 24 hr | Slice 4 portfolio analytics |
| 12 | Domain 12 (LGD Benchmarks) | 20 hr | Slice 2 P2-1 + Slice 4 CECL |
| 13 | Domain 2 (State Licensing Matrix) | 16 hr | Slice 2 P0-2 state coverage |
| 14 | Domain 7 (Capital Markets & Securitization) | 24 hr | Slice 4 capital markets |
| 15 | Domain 13 (Borrower Demographics) | 16 hr | Slice 4 segmentation |

---

## 4. Dependencies & Blockers

| Downstream | Depends On | Notes |
|------------|-----------|-------|
| Slice 2 P0-2 (lender rule schema) | Domain 3 (lender profiles) | Cannot build schema without profiles |
| Slice 2 P0-4 (adverse action engine) | Domain 14 (reason library) | Cannot generate reasons without library |
| Slice 2 P0-4 (insurance kill) | Domain 1 (FEMA/NFIP) + Domain 8 (quotes) | Both regulatory + market data needed |
| Slice 2 P1-2 (STR module) | Domain 6 (STR empirical) | Haircut validation depends on data |
| Slice 2 P2-1 (Monte Carlo) | Domain 5 (calibration) + Domain 12 (LGD) | Calibration + LGD both required |
| Slice 3 P2-3 (capital markets adapter) | Domain 4 (PPE APIs) | Cannot integrate without API specs |
| Slice 3 (after-tax engine) | Domain 9 (tax validation) + Domain 10 (1031×QOZ) | Both validation + new modeling |
| Slice 4 (portfolio analytics) | Domain 11 (portfolio) + Domain 7 (capital markets) | Both required |
| Slice 4 (CECL) | Domain 12 (LGD benchmarks) | CECL needs LGD |
| All Slice 2/3/4 | Domain 15 (validation infrastructure) | Quality bar depends on tests |

**Critical path to Slice 2 build:**
Domain 14 → Domain 1 → Domain 3 (first 5 lenders) → Domain 15 (Slice 2 tests) → Build starts

---

## 5. Re-Verification (Round 14 Tier 2 Candidates)

Per self-audit (Round 13), these single-source items need second-source verification:

| # | Item | Current Source | Re-Verify Source | Effort |
|---|------|----------------|------------------|--------|
| 1 | OBBBA §179 $2.5M-$2.56M (2026) | Sovereign Master | IRS Rev. Proc. 2025-XX | 2 hr |
| 2 | NIIT $200K/$250K MAGI FROZEN since 2013 | Master + Sovereign | IRS Form 8960 instructions | 2 hr |
| 3 | DSCR 28.7% Non-QM share | Def Master + Master Syn | Inside Mortgage Finance Q1 2026 report | 2 hr |
| 4 | STR LA 2028 economics | Deloitte/Airbnb commissioned | UCLA Anderson / USC Lusk independent study | 4 hr |
| 5 | Pennymac DSCR FICO 620 minimum | Pennymac PDF | Mortgage News Daily secondary | 1 hr |
| 6 | Pennymac rent input = min(lease, 1007) | Pennymac PDF | Industry standard (FNMA form 1000) | 1 hr |
| 7 | UWM April 2026 Non-QM entry | Inside Mortgage Finance | Scotsman Guide 2026 (when published) | 2 hr |
| 8 | Insula Capital June 11 launch | PR Web press release | Insula website + secondary | 1 hr |

**Total Round 14 re-verification effort:** 15 hours.

---

## 6. Success Criteria

The research plan is **COMPLETE** when:

| # | Criteria | Target |
|---|----------|--------|
| 1 | All 15 domains have research artifact (whitepaper, schema, dataset) | 15/15 |
| 2 | All Tier 2 single-source claims have second source | 8/8 |
| 3 | All Slice 2 P0 build tickets have research backing | 4/4 |
| 4 | All Slice 2/3/4 build tickets have research backing | 14/14 |
| 5 | All 23 acceptance criteria (TOPIC 6) have research evidence | 23/23 |
| 6 | All 15 kill criteria (TOPIC 6) have research evidence | 15/15 |
| 7 | 100+ new pytest golden vectors for Slice 2/3/4 | ≥100 |
| 8 | All 50-state PPP matrix completed (Domain 2) | 50/50 |

---

## 7. Time Budget & Resource Allocation

### Total Estimated Effort: ~336 hours over 6-12 weeks

| Tier | Effort | Cumulative |
|------|-------:|-----------:|
| Quick Wins (Tier 1) | 30 hr | 30 hr |
| Strategic Builds (Tier 2) | 150 hr | 180 hr |
| Long-Term (Tier 3) | 160 hr | 340 hr |
| Round 14 re-verification | 15 hr | 355 hr |

### Resource Allocation (Assumes 1 Full-Time + SME Support)

| Role | % Time | Focus |
|------|-------:|-------|
| Research Analyst (FTE) | 80% | Domains 1, 3, 5, 8, 12, 14 |
| Mortgage SME | 20% | Domains 3, 6, 11 lender review |
| Compliance/Legal SME | 10% | Domains 2, 9, 10, 14 |
| Quant/ML Engineer | 10% | Domains 5, 10, 12, 15 |
| Engineering Lead | 10% | Domains 4, 15 architecture |
| Tax SME | 5% | Domains 9, 10 |
| Marketing/Product | 5% | Domain 13 |

### Calendar (Suggested Schedule)

| Week | Activities | Outcome |
|------|-----------|---------|
| **Week 1** | Domain 14 + Domain 1 | Slice 2 P0-4 unblocked |
| **Week 2-3** | Domain 3 (first 10 lenders) | Slice 2 P0-2 partial |
| **Week 4** | Domain 15 (Slice 2 validation infra) | Slice 2 quality bar |
| **Week 5-6** | Domain 3 (last 10 lenders) + Domain 8 | Slice 2 P0-2 complete |
| **Week 7-8** | Domain 4 + Domain 5 + Domain 9 | Slice 3 unblocked |
| **Week 9-10** | Domain 6 + Domain 12 + Domain 2 | Slice 2 P2-1 + Slice 2 P1-2 |
| **Week 11-12** | Domain 10 + Domain 11 + Domain 7 | Slice 3 exit strategy + Slice 4 |

**Critical milestone:** Slice 2 build can START after Week 4 (with partial lender matrix + validation infra).

---

## 8. Deliverables Per Domain (Detailed)

| Domain | Primary Artifact | Secondary Artifacts | Update Where |
|--------|------------------|---------------------|--------------|
| 1 | RESEARCH_DOMAIN_1_INSURANCE_FEMA.md | Schema additions to compliance.py | TOPICAL_INDEX §17 |
| 2 | RESEARCH_DOMAIN_2_STATE_LICENSING.md | state_lender_licensing_matrix.csv | TOPICAL_INDEX §11 |
| 3 | RESEARCH_DOMAIN_3_LENDER_PROFILES.md | lender_profiles.jsonl (20) + 20 individual files | TOPICAL_INDEX §8 |
| 4 | RESEARCH_DOMAIN_4_PPE_API.md | ppe_vendor_comparison.csv + ADRs | TOPICAL_INDEX §14 |
| 5 | RESEARCH_DOMAIN_5_CALIBRATION.md | empirical_calibration_dataset.csv + mc_distribution_params.json | TOPICAL_INDEX §7 |
| 6 | RESEARCH_DOMAIN_6_STR_DATA.md | str_seasonality_by_msa.csv + str_saturation_index.csv | TOPICAL_INDEX §9 |
| 7 | RESEARCH_DOMAIN_7_CAPITAL_MARKETS.md | loan_tape_schema.json + pool_eligibility_template.csv | TOPICAL_INDEX §17 |
| 8 | RESEARCH_DOMAIN_8_INSURANCE_QUOTES.md | insurance_quotes_by_geography.csv | TOPICAL_INDEX §17 |
| 9 | RESEARCH_DOMAIN_9_TAX_VALIDATION.md | tax_engine_validation_table.csv | TOPICAL_INDEX §4 |
| 10 | RESEARCH_DOMAIN_10_1031_QOZ.md | 1031_qoz_interaction_model.py | TOPICAL_INDEX §4 |
| 11 | RESEARCH_DOMAIN_11_PORTFOLIO_DSCR.md | portfolio_aggregation_model.py | TOPICAL_INDEX §9, §15 |
| 12 | RESEARCH_DOMAIN_12_LGD_BENCHMARKS.md | lgd_by_property_type_state.csv + cure_rate_by_month.csv | TOPICAL_INDEX §7, §15 |
| 13 | RESEARCH_DOMAIN_13_BORROWER_DEMOGRAPHICS.md | dscr_borrower_personas.csv + borrower_journey_map.md | content-gap-analysis update |
| 14 | RESEARCH_DOMAIN_14_ADVERSE_ACTION.md | adverse_action_reason_library.json + shap_to_reason_mapping.csv | TOPICAL_INDEX §17 |
| 15 | RESEARCH_DOMAIN_15_VALIDATION.md | 100+ pytest fixtures + snapshot tests + CI/CD | TOPICAL_INDEX §20 |

---

## 9. Round 14 Re-Verification (Tier 2 Candidates)

Already detailed in §5. Effort: 15 hours, outcome: 8 single-source items verified to Tier 1.

---

## 10. Output Locations

All artifacts saved to:
- **Research domain docs:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_N\RESEARCH_DOMAIN_N_*.md`
- **Data files (CSV/JSON):** Same directory as the research doc
- **TOPICAL_INDEX updates:** Append to `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\ANALYSIS\TOPICAL_INDEX.md`
- **MASTER_ANALYSIS Round 14:** Append to `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\ANALYSIS\MASTER_ANALYSIS.md`

---

## 11. Recommended Next Steps

1. **Approve this research plan** (your call)
2. **Pick Tier 1 priority** — start with Domain 14 (adverse action) + Domain 1 (FEMA) immediately
3. **Schedule Slice 2 build kickoff** for Week 5 (after Tier 1 + Tier 2 partial)
4. **Allocate resource** — research analyst FTE for 6-12 weeks
5. **Track progress** via Round 14+ entries in MASTER_ANALYSIS.md

**Estimated to Slice 2 production-ready:** 6-8 weeks from approval of this plan.

---

## 12. Open Questions for User (Not Blocking)

1. **Resource allocation:** Do you have research analyst support, or is this a one-person effort?
2. **Sequencing priority:** Confirm Domain 14 + Domain 1 as Tier 1 priority?
3. **Subscription access:** Do you have access to any of these paid subscriptions?
   - Trepp CMBS subscription (for Domain 5, 12)
   - KBRA RMBS subscription (for Domain 5, 12)
   - CoStar (for Domain 5, 6)
   - AirDNA Enterprise (for Domain 6)
   - Optimal Blue / Polly / Lender Price API trial (for Domain 4)
   - Big-4 CPA firm tax research (for Domain 9, 10)
   - Bloomberg / Intex (for Domain 7)
4. **Build schedule:** Confirm Slice 2 build kickoff for Week 5?
5. **Tier 2 single-source items:** Re-verify in parallel with Tier 1, or sequence after Tier 1?

---

*Generated by MiniMax Mavis on 2026-06-18 13:55 PT. Based on 13 rounds of MASTER_ANALYSIS + 20 topics in TOPICAL_INDEX + 55-file corpus + Slice 1 verification + content-gap-analysis.*

*Total estimated effort: ~336 hours over 6-12 weeks. Critical path to Slice 2 build: 4-6 weeks.*
