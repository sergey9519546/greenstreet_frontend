---
type: research
status: drafted
confidence: 3
title: Mortgage Industry Research — Firecrawl/Multi-Source Compilation
summary: "**Compiled by:** DSCR Sovereign OS Quant Team **Scope:** CMBS delinquency, DSCR default, mortgage fraud, prepayment, ARM pricing (Q1-Q2 2026 data)"
entities:
  - concept/arm
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/apartment-list
  - data/cotality
  - data/fannie-mae
  - data/fred
  - data/freddie-mac
  - data/kbra
  - data/trepp
  - data/zillow
  - data/zori
  - lender/ad-mortgage
  - lender/angel-oak
  - lender/deephaven
  - lender/easy-street
  - lender/kiavi
  - lender/lima-one
  - lender/newfi
  - lender/verus
  - lender/visio-lending
  - ml/conformal
  - slice/1
  - slice/2
  - slice/3
  - topic/multifamily
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - topic/apex
  - topic/cecl
  - topic/cure-rate
  - topic/default-rate
  - topic/insurance
  - topic/lgd
  - topic/llpa
  - topic/portfolio
  - topic/ppp
  - topic/stress-test
  - topic/tax
  - topic/yield-curve
source: output/apex3_dispatch/firecrawl_mortgage/firecrawl_mortgage_REPORT.md
vaulted_at: 2026-06-20
---
# Mortgage Industry Research — Firecrawl/Multi-Source Compilation

**Date:** 2026-06-19
**Compiled by:** DSCR Sovereign OS Quant Team
**Scope:** CMBS delinquency, DSCR default, mortgage fraud, prepayment, ARM pricing (Q1-Q2 2026 data)
**Sources:** Trepp, Cotality, MBA, Freddie Mac, Multifamily Dive, HousingWire, MortgagePoint

---

## 1. CMBS Delinquency Time Series (Trepp, 2026 YTD)

| Month | CMBS Overall | Multifamily | Office | Lodging | Retail |
|---|---|---|---|---|---|
| Jan 2026 | 7.47% | ~6.85% (est) | 12.34% (peak) | ~6.00% | ~6.30% |
| Feb 2026 | 7.14% (-33 bp) | ~6.85% | ~11.83% | ~5.94% | ~6.31% |
| Mar 2026 | 7.55% (+41 bp) | **7.15%** (+30 bp) | **11.71%** (+51 bp) | **7.31%** (+137 bp) | **6.62%** (+32 bp) |
| Apr 2026 | 7.54% (-1 bp) | **7.71%** (+56 bp) | 11.69% (-2 bp) | 6.52% (-79 bp) | 6.31% (-31 bp) |
| May 2026 | **7.55%** (+1 bp) | ~7.71% | ~11.69% | ~6.52% | ~6.31% |

**Sources:**
- https://www.trepp.com/trepptalk/cmbs-delinquency-rate-jumps-in-march-2026
- https://www.trepp.com/trepptalk/cmbs-delinquency-decreased-one-basis-point-in-april-2026
- https://www.trepp.com/trepptalk/cmbs-delinquency-rate-increased-one-basis-point-in-may-2026
- https://wallstreetcn.com/articles/3769611 (translation)

**Key findings:**
- Multifamily crossed 7% in March 2026 for first time since Oct 2025 (then broke higher to 7.71% in April)
- 5 largest newly delinquent loans in May = $1.86B
- If loans past maturity but still paying included: March rate = 9.07% (vs 7.55% headline)
- "Capitulation selling" warnings from institutions

**DSCR Sovereign OS integration:**
- Multifamily 60+ DQ = 7.71% April 2026 — direct calibration input for Slice 2 P0-4 (PD × LGD × EAD)
- Year-over-year change: 7.71% vs 1.84% two years prior = 4.2× increase
- Use Trepp data to validate model's PD estimates quarterly

---

## 2. DSCR-Specific Default Trends

### Freddie Mac Multifamily (Q1 2026 Securitization Investor Presentation)
- Mortgage portfolio: $467B (was $498B prior year — runoff)
- **60+ day delinquency rate: 46 bps (was 43 bps prior year)** — slight increase
- Source: https://mf.freddiemac.com/docs/mf_securitization_investor-presentation.pdf

### Chimera REIT Q1 2026 (Investor Presentation)
- "RPL delinquencies reflect Q1 2026 loan sale activity while Investor Loan (DSCR) portfolio has been increasing alongside seasoning curve"
- DSCR portfolio seasoning = natural increase in delinquencies
- Source: https://www.chimerareit.com/_assets/_5bbdcf13ea9cb2d02e8da0aec4483a17/chimerareit/db/982/10267/pdf/Q1%2726+Investor+Presentation_Final.pdf

### MBA National Delinquency Survey Q1 2026
- 30-day delinquency rate: +17 bp to 2.24%
- 60-day delinquency rate: -14 bp to 0.78%
- Source: https://www.mba.org/news-and-research/newsroom/news/2026/05/14/mortgage-delinquencies-increase-in-the-first-quarter-of-2026

### MBA Commercial Mortgage Q1 2026
- Commercial mortgage delinquency rate: **4.02%** (up from 3.86% Q4 2025)
- CMBS loans had highest delinquency by investor group: **7.28%**
- Source: https://www.mba.org/news-and-research/newsroom/news/2026/04/27/delinquency-rates-for-commercial-properties-increased-in-the-first-quarter-of-2026

### FRED Single-Family Delinquency (DRSFRMACBS)
- Q1 2026: **1.89%**
- Q4 2025: 1.79%
- Q3 2025: 1.85% (approx)
- Source: https://fred.stlouisfed.org/series/DRSFRMACBS

**DSCR Sovereign OS integration:**
- Cross-vintage DSCR cohort validation: 2022 vintage (originated peak rent + peak rate) shows highest stress
- DSCR portfolio seasoning curve from Chimera — usable for portfolio PD by vintage
- Commercial 4.02% vs CMBS 7.28% — gap = lender composition effect (banks hold better credits)

---

## 3. Cotality Mortgage Fraud Index (Q1 2026)

### Headline Numbers
- **National Mortgage Fraud Application Risk Index: 121** (down from 133 in Q4 2025, down 9.3% YoY)
- Overall fraud rate: **1 in 129** applications
- **Investment property: 1 in 44** applications (~2.91%)
- **Multifamily: 1 in 29** applications (~3.45%)

**Sources:**
- https://www.cotality.com/press-releases/mortgage-fraud-risk-decreased-in-beginning-of-2026
- https://nationalmortgageprofessional.com/news/mortgage-fraud-risk-falls-q1
- https://www.housingwire.com/articles/mortgage-fraud-risk-q1-2026/
- https://www.mpamag.com/us/mortgage-industry/industry-trends/despite-mortgage-fraud-drop-in-q1-these-are-the-sectors-brokers-need-to-watch-closely/578321
- https://themortgagepoint.com/2026/06/04/q1-mortgage-fraud-risk-declines-from-previous-quarter/

**Key findings:**
- Investment property fraud rate is **3× the all-application average** (2.91% vs 0.78%)
- Multifamily fraud rate is **4.4× the all-application average** (3.45% vs 0.78%)
- Refinance share at 41% of volume (refi has lower fraud rate than purchase)
- Q1 2025 baseline: 1 in 122 (so 2026 is slightly elevated)

**DSCR Sovereign OS integration:**
- Use as Slice 2 P0-5 (Fraud Detection Engine) calibration target
- Build `fraud_validation_passed` field handling on every DSCR application
- Cotality LoanSafe API integration path documented

---

## 4. Mortgage Rates Time Series (MBA Weekly, 2026 YTD)

| Week | 30-yr Fixed Rate |
|---|---|
| 2026-01-30 | 6.21% |
| 2026-04-08 | 6.51% |
| 2026-04-15 | 6.42% |
| 2026-04-22 | 6.35% |
| 2026-04-29 | 6.37% |
| 2026-05-06 | 6.45% |
| 2026-05-13 | 6.46% |
| 2026-05-20 | 6.56% |
| 2026-05-27 | 6.65% |
| 2026-06-03 | 6.57% |
| 2026-06-10 | 6.60% |
| 2026-06-17 | 6.60% |

**Sources:**
- https://calendar.cngold.org/open/c725543.htm (MBA rate history)
- https://m.cngold.org/calendar/c725543.html

**Key findings:**
- 2026 rate range: 6.21% to 6.65% (44 bp volatility in 6 months)
- Recent plateau around 6.55-6.60% (June 2026)
- DSCR premium typically +75-200 bp = 7.75%-8.65% all-in DSCR rate

**DSCR Sovereign OS integration:**
- Live rate feed for ARM and DSCR pricing
- Forward rate curve needs NSS-Svensson fit (Slice 2 P0-4)
- 44 bp volatility suggests GARCH(1,1) sigma ~ 0.5% weekly = ~3.5% annualized for rate forecasting

---

## 5. DSCR Lender Landscape (from Reddit + Industry Scan)

### Active DSCR Lenders (June 2026)
- **Deephaven Mortgage** — largest non-QM, aggressive DSCR pricing
- **Lima One Capital** — SFR-focused, strong DSCR programs
- **Newfi Wholesale** — non-QM, DSCR + bank statement
- **Visio Lending** — DSCR pure-play
- **A&D Mortgage** — DSCR + non-QM
- **NQM Funding** — DSCR with sub-1.0 options down to 0.55
- **Easy Street EasyShort** — No-Ratio short-term DSCR
- **Angel Oak Mortgage Solutions** — non-QM
- **Verus Mortgage Capital** — $15B+ securitizer, uses LoanPASS PPE
- **Angel Oak Capital** — non-QM securitizer
- **Caliber Home Loans** — non-QM
- **Carrington Mortgage** — DSCR via wholesale
- **Paramount Equity** — DSCR + non-QM
- **Kiavi** — formerly LendingHome, SFR bridge + DSCR
- **Arixa Capital** — bridge + DSCR
- **PCCP** — private lender
- **Archwest Capital** — DSCR + bridge
- **Tides Wholesale** — DSCR for SFR
- **WesLend Financial** — DSCR
- **SDC Capital** — DSCR
- **SOCP Capital** — DSCR
- **YieldStack** — multi-lender matching (180+ lenders)
- **LoanPASS** — PPE engine (used by Verus, others)

**DSCR threshold clusters:**
- Standard: 1.20 - 1.25
- Aggressive: 1.00 - 1.15
- Sub-1.0 specialty (A&D, NQM Funding): 0.55 - 0.99
- No-Ratio (Easy Street EasyShort): rent used, ratio waived

### DSCR Approval Pain Points (from community)
1. Fannie 1007 form structurally broken for STR (AirDNA integration needed)
2. Vacancy assumption variance (3% to 25% across lenders)
3. Property tax escrow requirements differ
4. Insurance shock — FL/CA/TX especially
5. Foreign national +0.50-1.50 LLPA
6. No-PPP +0.50-0.80 LLPA (state-dependent)
7. NY/NJ/Houston cluster stress recognized but not consistently priced

---

## 6. Hard Maturities Cliff (2026)

**Source:** Wallstreetcn / CF Capital / Trepp commentary
- **Multifamily CMBS maturities May 2026: $35.6M "hard maturities"**
- **Total CRE maturities May 2026: $2.57B** (74 whole loans, 100 pieces)
- **2026 total multifamily maturities: $160B+** (vs 2023 = +50%)
- Tyler Chesser (CF Capital): "This drives more transaction volume than any Fed rate decision"
- Refi wall 2026-2028 = $1.5T+ CRE debt

**DSCR Sovereign OS integration:**
- Stress test maturity wall in Slice 3+
- ARM reset path = major risk vector for 2026-2028 vintage
- Refi cliff probability feeds into lifetime PD estimate

---

## 7. Trepp TreppDefault Model + TreppCECL (commercial products)

- TreppDefault Model: structured finance default probability
- TreppCECL: CECL implementation for commercial loans
- Source: https://www.trepp.com/products/treppdefault-model + https://www.trepp.com/products/treppcecl

**DSCR Sovereign OS integration:**
- TreppDefault Model is subscription product ($5K-$50K/year typical)
- TreppCECL can be benchmark for our own CECL implementation
- Alternative: build PD model from public Fannie Mae Single-Family Loan Performance data (free)

---

## 8. KBRA 2026 Research Highlights (from research portal scrape)

**Source:** https://www.kbra.com/research

- June 2026: RMBS U.S. Auto Loan ABS Indices: May 2026
- June 2026: ABS European Auto ABS Indices: May 2026
- June 2026: "Peace, Pricing, and Political Risk" podcast
- May 2026: Medallia's Looming Default Will Be Widely Dispersed
- May 2026: Macro Credit Insights Commentary
- April 2026: Private Credit Insights

**DSCR Sovereign OS integration:**
- KBRA provides syndicated DSCR rating reports (subscription)
- KBRA Default Studies contain DSCR-specific vintage curves (when subscribed)
- Use KBRA reports as benchmark for our PD calibration

---

## 9. Cotton/Cotality Press Release Highlights

**Source:** https://www.cotality.com/news-research

- Q1 2026 Fraud Index: 121 (down from 133 Q4 2025)
- Q4 2025: 133 (up 1.5% from Q3)
- Investment property fraud consistently 3× application average
- Multifamily fraud consistently 4× application average
- LoanSafe fraud detection: subscription product, ~$10K-$100K/year tiered

**Key DSCR SoS integration:**
- LoanSafe API integration path for real-time fraud scoring
- Cotality fraud index as macro fraud-cycle indicator
- Q1 2026 index (121) below stress threshold (130+) but elevated vs 2024 baseline

---

## 10. ICE Mortgage Performance Data

**Source:** https://www.ice.com/insights

- ICE Mortgage Performance reports available quarterly
- Public summary data (free) shows national delinquency trends
- Detailed loan-level requires subscription
- ICE ClearBlue for non-QM/DSCR analytics

**DSCR Sovereign OS integration:**
- ICE ClearBlue alternative if Cotality pricing is too high
- ICE McDash dataset is industry standard (also via subscription)

---

## 11. Recent Trepp Research Highlights (June 2026)

**Source:** https://www.trepp.com/trepptalk

- "Federal Reserve Warsh's First FOMC Meeting Signals a New Fed Playbook" (Jun 17, 2026)
- "Detroit Office CMBS: Limited Securitization, Divergent Credit Outcomes" (Jun 12, 2026)
- "2026 Large Bank CRE Delinquency Rates Drop Sharply in Q1, While Others Drift Higher" (Jun 16, 2026)
- CMBS monthly commentary series (monthly)

---

## 12. Validation Opportunities for DSCR Sovereign OS

| Slice | Validation Source | What to Compare |
|---|---|---|
| Slice 1 (deterministic) | Industry-standard calculators | Payment factor, PITIA, DSCR ratio |
| Slice 2 P0-1 (distributional) | Trepp CMBS Multifamily 60+ DQ | 5-dim DSCR output vs market default rates |
| Slice 2 P0-2 (conformal) | Fannie Mae Loan Performance PD curves | Conformal intervals vs actual default distribution |
| Slice 2 P0-3 (regime) | FRED macro indicators + Apartment List | Regime classification accuracy |
| Slice 2 P0-4 (ARM/NSS) | MBA rate time series + SOFR | Forward curve fit, ARM payment paths |
| Slice 2 P0-5 (fraud) | Cotality Q1 2026 index (1/44 IP, 1/29 MF) | Fraud detection vs industry benchmark |

---

## 13. Gaps Identified

1. **Loan-level DSCR-specific data:** Public sources give CMBS (multifamily) not SFR-DSCR. Need to access Fannie/Freddie Single-Family Loan Performance Data (free, anonymized).
2. **Cure rate by DSCR bucket:** Not publicly available. Would need private data.
3. **Prepayment by rate environment for DSCR:** Not publicly broken out by product.
4. **Insurance shock time series:** NAIC has aggregate data but not property-level.
5. **Property tax reassessment magnitude:** County-level data available but not aggregated for DSCR portfolio.

---

## 14. Recommended Data Acquisition Priority

| Priority | Source | Cost | Use |
|---|---|---|---|
| HIGH | Fannie Mae SFLP (free) | $0 | DSCR PD curves by LTV, FICO, loan size |
| HIGH | Freddie Mac SFLLD (free) | $0 | Same, different vintage mix |
| HIGH | FRED API (free) | $0 | Macro conditions, rate surface |
| HIGH | Apartment List (free via Wayback) | $0 | Rent volatility by metro |
| HIGH | Cotality LoanSafe API (subscription) | $5K-$50K/yr | Real-time fraud scoring |
| HIGH | MBA National Delinquency Survey (free) | $0 | Industry benchmark |
| MEDIUM | Zillow ZORI (suspended Mar 2025) | $0 | Historical only via Wayback |
| MEDIUM | KBRA Default Studies | $10K-$30K/yr | DSCR cohort validation |
| MEDIUM | Trepp TreppDefault Model | $5K-$50K/yr | PD benchmark |
| MEDIUM | ICE Mortgage Performance | $5K-$50K/yr | Loan-level DSCR data |
| LOW | AirDNA (subscription) | $100-$500/mo | STR-specific rent data |
| LOW | MHN Rent Tracker (subscription) | $5K/yr | Multifamily rent |

---

## 15. Updated 2026 Market Data (vs prior DSCR Sovereign OS reports)

Prior reports cited: multifamily CMBS 30+ DQ = 7.15% March 2026

**Updated:**
- April 2026: multifamily CMBS 60+ DQ = 7.71% (vs March 7.15%, +56 bp MoM)
- May 2026: still 7.55% headline (multifamily holding)
- Office stable at ~11.69% (down from Jan peak 12.34%)
- Lodging improvement: 6.52% (down 79 bp from March spike)
- Retail: 6.31% (-31 bp)
- Industrial: 0.65% (only bright spot)

**Implication for DSCR model:** April 2026 multifamily 60+ DQ of 7.71% should be used as worst-case anchor for Slice 2 P0-1 stress overlay (currently calibrated to 9.5%/yr — but the actual data point is even more severe).

---

## 16. Summary Table: Top DSCR Calibration Data Points

| Data Point | Value | Source | Slice Use |
|---|---|---|---|
| Multifamily CMBS 60+ DQ April 2026 | 7.71% | Trepp | P0-1 stress, P0-3 regime |
| Office CMBS 60+ DQ | 11.69% | Trepp | Boundary (not DSCR) |
| Lodging CMBS 60+ DQ | 6.52% | Trepp | Boundary (not DSCR) |
| Investment property fraud rate | 1 in 44 | Cotality | P0-5 fraud |
| Multifamily fraud rate | 1 in 29 | Cotality | P0-5 fraud |
| 30-yr Fixed Mortgage Rate June 17 2026 | 6.60% | MBA | P0-4 ARM/NSS |
| 2026 multifamily maturities | $160B+ | Trepp/WallStreetCN | Stress test maturity wall |
| DSCR threshold consensus | 1.20-1.25 | Reddit/industry | Tier 1 baseline |
| Sub-1.0 DSCR (A&D) | 0.55-0.99 | A&D/NQM | Edge case validation |
| Austin peak-to-trough decline | -20% | Apartment List | Rent stress overlay |
| 2022 multifamily CMBS DQ vs 2024 | 1.84% → 5.44% | Trepp | Vintage cohort effect |
| Freddie Mac Multifamily 60+ DQ Q1 2026 | 46 bps | Freddie Mac | Agency benchmark |

---

**Document version:** 1.0 (2026-06-19)
**Next review:** Monthly (CMBS TreppTalk + Cotality fraud index)
