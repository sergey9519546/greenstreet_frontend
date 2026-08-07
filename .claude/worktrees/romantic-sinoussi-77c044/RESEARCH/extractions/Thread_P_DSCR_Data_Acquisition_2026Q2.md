---
type: synthesis
status: drafted
title: "Thread P: DSCR Data Acquisition 2026 Q2"
summary: "DSCR data acquisition strategy. No public DSCR loan-level dataset exists (business-purpose DSCR loans typically HMDA-exempt). Alternative data sources identified."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread P — Proprietary DSCR Loan Performance Data Acquisition

**Date:** 2026-06-21
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_P_DSCR_Data_Acquisition_2026Q2.md`

---

## 0. Why this thread exists

Per Thread N audit: "No proprietary DSCR loan performance data" is the most critical Tier 4 v1 gap. Without it, our XGBoost model accuracy ceiling is fundamentally limited (per Thread E §6). This thread audits all available channels to acquire DSCR loan-level data, with cost, lead time, and quality assessments.

**Bottom line up front:** No public DSCR loan-level dataset exists. Three viable acquisition channels ranked by ROI: (1) bank partner direct sharing (highest value, longest lead time), (2) dv01-Fitch Non-QM Benchmark subscription (fastest, lowest quality), (3) synthetic + scraped public data for POC (cheapest, lowest credibility).

## 1. The fundamental problem

**No public DSCR loan-level performance dataset exists.** Reasons:
- DSCR loans are typically business-purpose (Reg Z §1026.3(a) exemption), so HMDA reporting doesn't apply
- Most non-QM lenders don't publish loan-level data (unlike Fannie/Freddie)
- Securitization deals (NLT 2026-NQM1, MFA 2026-NQM2, CROSS 2026-NQM5) publish pool-level data, not loan-level
- RiskSpan, dv01, Trepp are commercial data vendors with proprietary datasets (paywall)

**Closest available public datasets (analogs, not direct):**
- Fannie Mae Single-Family Loan Performance Data (single-family, NOT DSCR, but analogous)
- Freddie Mac Single-Family Loan-Level Dataset
- FHFA Public Use Database (Enterprise Single-Family)
- FRED-MIT Sloan Consumer Credit data (consumer credit, not DSCR)

## 2. Data acquisition channels (ranked by ROI)

### Channel 1: Bank partner direct sharing (HIGHEST VALUE)

**Sources:**
- Lima One Capital (lender profile in domain_3 corpus)
- Visio Lending (lender profile in domain_3 corpus)
- Newfi (lender profile in domain_3 corpus)
- Angel Oak Mortgage Solutions (broker channel contact)
- Insula Capital Group (post-pilot, per Thread K)

**Approach:**
1. Pilot broker outreach (per Thread L) leads to 5 pilot agreements
2. Each pilot agreement includes anonymized loan-level data sharing clause
3. Standardize data schema (loan_id, originated_date, DSCR, FICO, LTV, property_type, MSA, performance_status, 60+_DPD_flag, foreclosure_flag, etc.)
4. Aggregate across pilots → build proprietary dataset over 12-18 months

**Cost:** $0 cash (built into pilot economics per Thread L); 1 FTE × 25% time on data engineering + NDA + schema design
**Lead time:** 6-9 months from pilot start to first usable aggregated dataset
**Quality:** HIGHEST (real DSCR, real performance, real pilot data)
**Legal:** NDA + data sharing agreement per pilot broker; anonymization standard; CCPA/GLBA compliance
**Volume:** Realistic 2,000-10,000 loans in 12 months from 5 pilot brokers @ 50-300 loans/yr each

**Critical risk:** Bank partner legal/compliance may block data sharing entirely. Mitigation: offer co-marketing, anonymization, MBA Annual 2027 case study rights in exchange.

### Channel 2: dv01-Fitch Non-QM Benchmark subscription (FASTEST)

**Source:** https://app.snowflake.com/marketplace/listing/GZ2FTZ8E8RH/dv01-fitch-dv01-non-qm-benchmark

**What it is:** Anonymized loan-level data on US non-QM securitizations. Includes DSCR loans as a subset of the broader non-QM pool. Available via Snowflake Marketplace subscription.

**Cost:** ~$15K-$50K/yr for institutional access (estimate; not publicly listed)
**Lead time:** 1-2 weeks (Snowflake Marketplace)
**Quality:** HIGH (real data, 100K+ loans); but DSCR is a subset (~10-20% of non-QM), so useful DSCR subset may be 10K-20K loans
**Legal:** Subscription agreement; redistribution restrictions typical
**Volume:** 10K-20K DSCR loans (anonymized, performance data)

**Limitations:** (a) only includes securitized DSCR loans (not bank-portfolio held loans), (b) typically excludes loan-level data on most recent 12-18 months (lockup period), (c) is a benchmark/sample, not exhaustive coverage

**Recommendation:** Start with this for immediate POC + ongoing benchmarking; supplement with Channel 1 over time

### Channel 3: Synthetic + scraped public data (CHEAPEST)

**Sources:**
- **Fannie Mae SF Loan Performance Data** (Q4 2025 release per April 30, 2026 update) — public, free
- **Freddie Mac SF Loan-Level Dataset** (through Sept 30, 2025) — public, free
- **FHFA PUDB Dashboard** — interactive
- **S&P / Fitch presale reports for non-QM securitizations** — published per deal, free
- **HMDA data** — public, free (but business-purpose DSCR typically exempt)
- **DSCR market reports** (Verus, Mortgage News Daily, Scotsman Guide) — public

**Approach:**
1. Use Fannie/Freddie SF data as analogy training set (similar property/borrower features, similar default patterns)
2. Use non-QM securitization pool data for DSCR-specific signal
3. Scrape HMDA for any DSCR-like entries (rare but possible)
4. Use Verus + Scotsman Guide for market-level benchmarks (rate, volume, delinquency)
5. Supplement with synthetic data generation for edge cases

**Cost:** $0 cash; 1-2 FTE-months for data engineering
**Lead time:** 1-2 months to assemble POC dataset
**Quality:** LOW (analogs, not actual DSCR; defensibility questionable for production)
**Legal:** Public data, no restrictions; but cannot claim proprietary insights
**Volume:** Unlimited (Fannie + Freddie SF data is 50M+ loans; non-QM securitization data is 100K+ loans)

**Recommendation:** Use for POC only (per Thread E §6 — must be positioned as research artifact, not production). Don't claim statistical validity on synthetic data.

### Channel 4: Trepp T-ALLR consortium (HIGH QUALITY, EXPENSIVE)

**Source:** https://www.trepp.com/t-allr

**What it is:** Trepp's Anonymized Loan-Level Repository — consortium-based dataset of anonymized bank CRE loan-level data. Designed for risk managers and modelers for loss modeling. Includes multifamily, but typically excludes 1-4 unit DSCR.

**Cost:** ~$50K-$150K/yr (Trepp institutional pricing, not publicly listed)
**Lead time:** 3-6 months (consortium application, NDA, onboarding)
**Quality:** HIGH (real bank CRE loan-level data, performance history)
**Legal:** Consortium membership required; data use restrictions
**Volume:** 100K+ CRE loans; subset is multifamily; 1-4 unit DSCR is minority

**Limitations:** Primarily CRE (5+ units, $5M+), not 1-4 unit DSCR. Useful for Tier 4 portfolio analytics on larger properties, less so for typical 1-4 unit DSCR.

**Recommendation:** Skip for v1 (too expensive, not focused enough); revisit for Tier 4 v2 (CRE portfolio expansion)

### Channel 5: RiskSpan Non-QM credit model (PARTIAL)

**Source:** https://riskspan.com/category/blog/ — released Non-QM-specific credit model "designed around the underwriting features (DSCR, bank statement, expanded LTV)"

**What it is:** RiskSpan is a non-QM ABS data + analytics vendor. They have proprietary non-QM loan-level data (anonymized). New credit model explicitly covers DSCR underwriting features.

**Cost:** Engagement pricing (~$25K-$75K/yr for data + model license)
**Lead time:** 1-3 months
**Quality:** MEDIUM-HIGH (real non-QM data, DSCR features covered)
**Legal:** Commercial agreement; data redistribution restrictions
**Volume:** RiskSpan is smaller than Trepp; likely 10K-50K non-QM loans; DSCR subset unclear

**Recommendation:** Useful for benchmarking Tier 4 v1 against RiskSpan's model; consider as Channel 2 alternative if dv01-Fitch too expensive

### Channel 6: Federal Reserve / academic datasets (FREE, ANALOG ONLY)

**Sources:**
- Federal Reserve Y-14M (Schedule D.1 — Commercial Real Estate) — bank-hold CRE loans, requires FRB submission access
- FRED-MIT Sloan Consumer Credit Panel — consumer credit, not DSCR
- CFPB HMDA — public, but DSCR typically exempt
- FHFA PUDB — Fannie/Freddie, single-family

**Cost:** $0 (some require application; Y-14M requires FRB relationship)
**Lead time:** 1-6 months (depends on access requirements)
**Quality:** HIGH (regulator data) but not DSCR-specific
**Legal:** Varies (HMDA public, Y-14M restricted)

**Recommendation:** Y-14M is a long-term bet; HMDA + FHFA PUDB for benchmarking

## 3. Recommended acquisition sequence (12-month plan)

| Quarter | Channel | Goal | Realistic outcome |
|---|---|---|---|
| Q3 2026 | Channel 3 (synthetic + scraped) + Channel 2 (dv01-Fitch subscription) | POC dataset ready | 10K-20K DSCR loans (mixed quality) |
| Q4 2026 | Channel 1 (pilot broker data sharing) | 1-2 pilot brokers actively sharing | 500-1,000 real DSCR loans |
| Q1 2027 | Channel 1 expansion | 3-5 pilot brokers sharing | 2,000-5,000 real DSCR loans |
| Q2 2027 | Channel 5 (RiskSpan benchmark) | Validate Tier 4 v1 model vs RiskSpan | Benchmark report |
| Q3 2027 | Channel 4 (Trepp T-ALLR) evaluate | Decision: add CRE portfolio support | 100K+ CRE loans if pursued |

**Target: 5,000+ real DSCR loans by Q1 2027** → enable Thread E's XGBoost POC with real performance data

## 4. Acquisition cost summary

| Channel | Year 1 cost | Year 2 cost | Quality |
|---|---|---|---|
| 1. Bank partner sharing | $0 cash (built into pilot) | $0 cash | Highest |
| 2. dv01-Fitch subscription | $15K-$50K | $15K-$50K | High |
| 3. Synthetic + public | $0 (1-2 FTE-months) | $0 (ongoing) | Low (POC only) |
| 4. Trepp T-ALLR | $0 (skip Q3 2026) | $50K-$150K (revisit Q3 2027) | High (CRE) |
| 5. RiskSpan engagement | $0 (skip Q3 2026) | $25K-$75K (Q2 2027) | Medium-High |
| 6. FedReserve Y-14M | $0 (long-term bet) | $0 (need FRB relationship) | High (CRE) |
| **TOTAL recommended Year 1** | **$15K-$50K cash + 1-2 FTE-months** | | |

**Year 1 acquisition cost: $15K-$50K** (manageable within pilot economics per Thread L)

## 5. Legal / compliance checklist

For any data sharing arrangement (Channels 1, 2, 5, 6):

- [ ] **NDA executed** with each data provider
- [ ] **Data sharing agreement** specifies:
  - [ ] Anonymization standard (loan_id hash; no PII; no specific addresses)
  - [ ] Permitted uses (Tier 4 v1 product, model training, internal analytics)
  - [ ] Re-disclosure restrictions (no re-sharing; no public disclosure of source-specific insights)
  - [ ] Term + termination clause (typically 3-5 years, 30-day termination)
  - [ ] Audit rights (data provider can audit our use)
- [ ] **CCPA / GLBA compliance** (US privacy laws; no PII in shared data)
- [ ] **§1071 exemption check** (if data includes small business lending, ensure §1071 May 2026 Final Rule compliance per Thread H)
- [ ] **FCRA compliance** (if any consumer credit data; not DSCR per se)
- [ ] **State law compliance** (CA CCPA, IL BIPA, etc. as applicable)
- [ ] **MRM documentation** (per OCC 2026-13 per Thread E — model training data provenance must be documented)

## 6. Open questions for user

1. **Approve Channel 2 ($15K-$50K/yr dv01-Fitch) as Q3 2026 priority?** (enables immediate POC dataset)
2. **Approve Channel 1 (bank partner data sharing) as part of pilot MoU terms?** (per Thread L pilot economics)
3. **Approve Channel 3 (synthetic POC) for the 90-day XGBoost POC per Thread E?** (no cash, but limits defensibility)
4. **Defer Channels 4 + 5 to Q2-Q3 2027?**
5. **Are there existing data partnerships in your network we should leverage?** (e.g., existing bank contacts, RiskSpan relationship)

## 7. Sources cited

**Public data sources:**
- Fannie Mae Single-Family Loan Performance Data: https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-credit-risk-transfer/fannie-mae-single-family-loan-performance-data (Q4 2025 release)
- Fannie Mae SF Loan Performance Data FAQs: https://capitalmarkets.fanniemae.com/media/8921/display
- Fannie Mae Loan Performance Data Tutorial: https://capitalmarkets.fanniemae.com/media/9066/display
- Fannie Mae SF Loan Performance + CRT: https://capitalmarkets.fanniemae.com/media/6931/display
- Freddie Mac Single-Family Loan-Level Dataset: https://www.freddiemac.com/research/datasets/sf-loanlevel-dataset
- FHFA Public Use Database: https://www.fhfa.gov/data/public-use-database

**Commercial data sources:**
- dv01-Fitch Non-QM Benchmark (Snowflake): https://app.snowflake.com/marketplace/listing/GZ2FTZ8E8RH/dv01-fitch-dv01-non-qm-benchmark
- dv01 + Fitch announcement: https://www.businesswire.com/news/home/20240220178716/en/dv01-and-Fitch-Ratings-Launch-Fitch-dv01-Non-Agency-RMBS-Benchmarks
- dv01 Feb 2026 Non-QM Performance Report: https://www.dv01.co/resources/research/performance-report-non-qm-feb-2026/
- Trepp T-ALLR: https://www.trepp.com/t-allr
- Trepp T-ALLR consortium benefits: https://www.linkedin.com/posts/trepp_trepps-anonymized-loan-level-repository-activity-7454570182372491264-ue6Y
- RiskSpan Non-QM credit model: https://riskspan.com/category/blog/
- S&P NLT 2026-NQM1 presale: https://www.spglobal.com/ratings/en/regulatory/article/-/view/type/HTML/id/3534849
- Fitch MFA 2026-NQM2: https://www.fitchratings.com/research/structured-finance/fitch-assigns-final-ratings-to-mfa-2026-nqm2-trust-09-06-2026

**Securitization context (DSCR pool-level):**
- Per Thread A: CROSS 2026-NQM5, OBX 2026-NQM5, NLT 2026-NQM1 (cross-collateral deal)

**Regulatory context:**
- Federal Reserve 2026 Stress Test Credit Risk Models: https://www.federalreserve.gov/supervisionreg/files/credit-risk-models.pdf
- HMDA / FFIEC data (DVRPC): https://catalog.dvrpc.org/dataset/mortgage-lending

**Related research:**
- Thread E — AI/ML Production Reality Audit (uses data acquisition for XGBoost POC)
- Thread I — Pilot Broker Profile (Channel 1 is built into pilot MoU)
- Thread L — Pilot Broker Outreach Playbook (Channel 1 negotiation tactics)
- Thread B — Tier 4 Portfolio Architecture (data requirements)
- Thread K — Insula Sales Call Prep (Channel 1 post-pilot)

---

**End of Thread P. Linked threads: Thread E (XGBoost POC), Thread I + L (pilot data sharing), Thread K (Insula data post-pilot), Thread B (architecture data requirements).**