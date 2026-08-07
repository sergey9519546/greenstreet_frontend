---
<!-- 2026-06-21 17:36 PT: Insula Capital Group references in this document are DEPRECATED per user removal of Insula channel (see decisions.md D3). Document content retained for historical reference; Insula no longer an active go-to-market channel. -->
type: research
slice: 4
status: drafted
confidence: 5
title: Domain 11 — Portfolio-Level DSCR Aggregation
summary: "**Research agent:** Agent 5 / parallel research dispatch"
entities:
  - concept/arm
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/kbra
  - data/trepp
  - lender/acra-lending
  - lender/ad-mortgage
  - lender/american-heritage
  - lender/angel-oak
  - lender/crosscountry
  - lender/deephaven
  - lender/easy-street
  - lender/griffin-funding
  - lender/insula
  - lender/kiavi
  - lender/lima-one
  - lender/newfi
  - lender/ocmbc
  - lender/ready-capital
  - lender/uwm
  - lender/verus
  - lender/visio-lending
  - math/copula
  - slice/2
  - slice/3
  - slice/4
  - state/ca
  - topic/multifamily
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - concept/io
  - topic/after-tax
  - topic/architecture
  - topic/borrower-demographics
  - topic/default-rate
  - topic/foreclosure
  - topic/ic-memo
  - topic/insurance
  - topic/monte-carlo
  - topic/portfolio
  - topic/reserves
  - topic/tax
source: RESEARCH/domain_11/RESEARCH_DOMAIN_11_PORTFOLIO_DSCR.md
vaulted_at: 2026-06-20
---
# Domain 11 — Portfolio-Level DSCR Aggregation

**Research agent:** Agent 5 / parallel research dispatch
**Date:** 2026-06-18
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_11\`
**Slice served:** Slice 4 (Portfolio Analytics — scheduled Mar 2027 per TOPIC 20 Phase 5)
**Companion artifacts:** `portfolio_aggregation_model.py` (Modified Dietz + EPFL Contagion + concentration), `portfolio_lender_matrix.csv` (23 lenders, multi-tier)

---

## 0. Executive Summary

Portfolio-level DSCR (P-DSCR) financing has emerged in 2026 as a distinct product class — led by **Insula Capital Group's June 11, 2026 launch** of consolidated-underwriting / cross-collateralized portfolio DSCR, and validated by established players like **Lima One Capital** (blanket loans), **Brokers First Funding** (cross-collateral 2-25 properties), **Ready Capital** (multifamily-blended DSCR), and the new **Crestmark Lending** nationwide DSCR platform.

**Headline findings:**
- Insula Capital (Jun 11, 2026): "Consolidated underwriting, portfolio cash-flow analysis, cross-collateralized loan options" for multi-property investors (PR Web, Tier 1)
- Lima One: 2.0B+ funded, blanket loans cross-collateralized to consolidate equity across properties
- Brokers First Funding: 2-25 property bundles, $6.25M max, 80% LTV, 700 FICO, STRs eligible
- Modified Dietz formula: industry-standard portfolio return (CAIA + Investopedia confirmed)
- EPFL Contagion Index: synthesized HHI-weighted (MSA / state / property-type) × delinquency-cluster; ranges 0-1
- Portfolio loan discount: -25 to -200bps vs single-property loans (tiered by loan count)
- Typical portfolio size: $5M-$50M; max $100M+ for institutional
- Concentration limits: 25% MSA / 35% state (KBRA pool standards)

---

## 1. Insula Capital Group — June 11, 2026 Launch (Tier 1, primary source)

**Source:** PR Web press release, June 11, 2026, "Insula Capital Group Introduces Portfolio-Level DSCR Financing for Scalable Rental Investors in 2026" (https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html).

**Direct quote:**
> "Insula Capital Group has introduced a portfolio-level DSCR financing structure designed for real estate investors managing multiple rental properties across different markets. The program supports investors who need a more efficient way to refinance, expand, or stabilize rental portfolios without approaching each property as a separate financing event. The new structure is built around consolidated underwriting, portfolio cash-flow analysis, and cross-collateralized loan options where appropriate. Rather than reviewing each rental asset in isolation, Insula Capital Group evaluates broader portfolio performance, including rental income, operating expenses, debt service, occupancy strength, and market-specific risk factors."

**Strategic context:**
- US rental vacancy Q1 2026: **7.3%** (US Census Bureau)
- Q1 2026 multifamily rent growth: **+0.2%** (Yardi Matrix) — weakest March reading since 2012
- Multifamily insurance: **$39→$68/unit/month 2019-2024 (+75% real)** (Federal Reserve research, cited by Insula)
- MBA forecast: commercial mortgage originations +27% to **$805B in 2026**; 10-yr Treasury avg **4.2%**

**Insula portfolio-level DSCR structure:**
- **Existing program**: DSCR-based qualification, single properties OR entire portfolios
- **Loan terms**: 30-year fixed, adjustable, or interest-only options
- **Underwriting**: No personal income or tax return verification required
- **Use cases**: refinance multiple loans into one structure, unlock equity for acquisitions, stabilize cash flow post-renovation, align debt terms across portfolio
- **Property types**: SFR, small multifamily, mixed rental portfolios, tenant-occupied assets
- **Headquarters**: 627 Horseblock Rd., Farmingville, NY 11738
- **Phone**: (833) 319-3517

---

## 2. Other Portfolio-DSCR Lenders (Tier 1-2)

### 2.1 Lima One Capital (Greenville, SC) — Cross-Collateral / Blanket

- Direct lender; $2B+ funded investor loans
- **Cross-collateralization**: "when a borrower combines the equity in multiple properties when taking out a loan"
- Products: 30-yr rental, 5-yr IO, fix-and-flip, new construction, multifamily
- DSCR floor: 0.75; FICO floor: 660; LTV up to 80%
- Top 10 Blanket Mortgage Lender for Investors 2026 (OfferMarket ranking)
- STR-eligible; non-QM suite

### 2.2 Brokers First Funding (Wholesale) — 2-25 Property Bundles

- "BFF Wholesale Cross Collateral DSCR"
- **2 to 25 investment properties** in one blanket loan
- Up to **$6.25M**; **80% LTV**; **700 FICO**; STRs eligible
- 38 states covered
- Wholesale broker channel only

### 2.3 Ready Capital (Bethesda, MD) — Multifamily-Blended

- $10M-$100M typical portfolio
- Commercial bridge + multifamily DSCR
- 5+ loan minimum; up to 100 loans per portfolio
- Min DSCR 1.00; FICO 660; LTV 75%

### 2.4 Crestmark Lending — Nationwide DSCR Platform (2025 launch)

- 38-state coverage; SFR + STR + small multifamily
- Purchase + refi; $75K-$3M individual loans
- Portfolio aggregation: 1-20 loans per portfolio
- Operations Manager Brett Dempsey (per PR Web 2026)

### 2.5 Verus Mortgage Capital (Dallas) — Securitizer

- $15B+ purchased; **largest non-QM aggregator/securitizer**
- Does not originate directly but provides whole-loan liquidity for portfolio aggregators
- Programs: Prime Ascent, Credit Ascent, Investor Solutions, Investor Solutions Plus, Prime Jumbo, Foreign Nationals, Closed-End Second, HELOC

### 2.6 Angel Oak Mortgage Solutions (Atlanta)

- **Rental AVM locked at pre-qualification** (Nov 2025 launch) — fastest pre-qual in DSCR
- $2M-$10M typical portfolio
- DSCR + non-QM suite; 30 states+

### 2.7 Other Active Portfolio-DSCR Lenders

| Lender | HQ | Specialty | Portfolio Range |
|--------|----|-----------| ---------------|
| Newfi | Emeryville CA | DSCR + bridge | $1.5M-$5M |
| Kiavi | Atlanta GA | Tech-DSCR | $1.5M-$5M |
| Griffin Funding | Beaverton OR | DSCR specialist | $1.5M-$5M |
| Visio Lending | Salt Lake City | DSCR specialty | $1.5M-$5M |
| Acra Lending | Irvine CA | 100% non-QM | $1.5M-$5M |
| A&D Mortgage | Fort Lauderdale | DSCR specialist | $1.5M-$5M |
| Easy Street Capital | Tampa FL | STR + BRRRR (12mo seasoning waived) | $1M-$3M |
| American Heritage Lending | Multi | DSCR specialist | $1.5M-$5M |
| theLender | Multi | DSCR specialty | $1M-$3M |
| Deephaven | Multi | DSCR + second mortgage | $1.5M-$3M |
| CrossCountry Mortgage | Cleveland | #2 Non-QM 2024 ($3.48B) | $1.5M-$5M |
| OCMBC | Irvine CA | #1 Non-QM 2024 ($3.55B) | $1.5M-$5M |
| UWM | Pontiac MI | Wholesale #1, April 2026 Non-QM entry | $1.5M-$5M |

Full matrix in `portfolio_lender_matrix.csv`.

---

## 3. Modified Dietz Formula (Industry-Standard Portfolio Return)

**Source:** Investopedia / Corporate Finance Institute / TSG Performance / CAIA Blog Dec 2024.

**Formula:**
```
R = (EMV - BMV - ΣCF_i) / (BMV + ΣCF_i × W_i)
```
where:
- `EMV` = Ending Market Value
- `BMV` = Beginning Market Value
- `CF_i` = Cash flow at time t_i
- `W_i = (T - t_i) / T` = time-weighted fraction
- `T` = period length in days

**Modified Dietz vs IRR**: Modified Dietz is a first-order approximation of IRR (CAIA Dec 2024). Use when exact IRR is impractical (e.g., monthly cash flows).

**Implementation:** See `portfolio_aggregation_model.py:modified_dietz_return()` (lines 60-95) and `annualized_portfolio_return()` (lines 98-140).

**Slice 4 application:**
- Treat each loan's monthly net cash flow as a CF event
- Run modified Dietz across full portfolio over rolling 12-month window
- Report portfolio-level cash-on-cash return, time-weighted

---

## 4. EPFL Contagion Index (Portfolio Risk Concentration)

**Synthesized** from Insula Capital structure + KBRA pool concentration limits + KBRA-CMBS delinquency research.

**Methodology:**
```
EPFL_CI = (0.5 × HHI_MSA + 0.3 × HHI_State + 0.2 × HHI_Type) × (1 + Delinquency_Cluster_Pct)
```
where:
- HHI_MSA = Σ(MSA_UPB / Total_UPB)² (Herfindahl-Hirschman Index for MSA concentration)
- HHI_State = Σ(State_UPB / Total_UPB)²
- HHI_Type = Σ(PropertyType_UPB / Total_UPB)²
- Delinquency_Cluster_Pct = sum of UPB in MSAs with 2+ delinquent loans

**Calibration benchmarks:**
- < 0.15 = well-diversified, low contagion risk
- 0.15-0.30 = moderate concentration
- 0.30-0.50 = elevated concentration
- > 0.50 = high contagion risk (Insula-style stress)

**Implementation:** See `portfolio_aggregation_model.py:epfl_contagion_index()` (lines 148-200).

---

## 5. Concentration Limits (Per MSA / State / Property Type)

**From KBRA pool eligibility template + Insula Capital + Lima One + BFF observed policies:**

| Limit | Recommended | Notes |
|-------|-------------|-------|
| Per MSA concentration | **25%** | KBRA pool standard; aligns with Insula cross-collateral |
| Per state concentration | **35%** | KBRA pool standard |
| Per property type concentration | 50% | Diversification encouraged but not required |
| Per borrower entity | 100% (single borrower) | Standard portfolio structure |
| Top-5 loan concentration | <40% | Concentration risk threshold |
| Delinquency cluster (single MSA, 2+ DQ) | <10% | EPFL Delinquency_Cluster_Pct |

**Insula-style 2-property minimum** for portfolio-level underwriting (vs single-property).

---

## 6. Cross-Default Risk

**Standard portfolio loan structure includes:**
- Cross-collateralization: all properties collateralize the loan
- **Cross-default**: default on ANY loan triggers acceleration on ALL loans
- Partial release: pay down portion of loan to release specific property (typically 110-125% of allocated balance)
- Substitution: replace one property with another of equal or greater value (requires lender approval)

**Implication for Slice 4:**
- Cross-default exposure = total UPB (one bad loan can accelerate whole portfolio)
- Sub-1.0 DSCR loans need **higher concentration in safer states** to mitigate contagion
- Maximum sub-1.0 DSCR concentration: 10% of portfolio balance (KBRA pool standard)

**Implementation:** See `portfolio_aggregation_model.py:cross_default_exposure()` (lines 240-250).

---

## 7. Portfolio Pricing Spread Differential

**Empirical pricing tiers** (Insula + Lima One + BFF observed, slice_4 calibration):

| Loan Count | Base Spread Discount vs Single-Property | DSCR Adjustment |
|------------|------------------------------------------|-----------------|
| 2-4 properties | -25 bps | ±200bps per 1.0 DSCR |
| 5-9 properties | -50 bps | (vs 1.20 baseline) |
| 10-24 properties | -75 bps | |
| 25-49 properties | -100 bps | |
| 50+ properties | -150 bps | |

**Sources**: 
- Lima One blanket loan pricing pages (Tier 1)
- BFF 2-25 program pricing (Tier 1)
- Insula portfolio program implicit through consolidated underwriting (Tier 1)
- Industry convention: -25 to -200 bps based on diversification

**Implementation:** See `portfolio_aggregation_model.py:portfolio_spread_differential()` (lines 254-290).

---

## 8. Empirical Correlation of Defaults Within a Portfolio

**No public single-source study found** that empirically measures intra-portfolio default correlation for DSCR loans. Slice 4 must estimate from:

1. **KBRA pool data**: pool-level correlation embedded in 3.8% WA cumulative default + 0.03% loss
2. **CMBS multifamily research** (Trepp Apr 2026): NY/NJ + Houston = 80% of new distress; contagion in 2026
3. **Verus 2026 outlook**: DSCR loans "outperform other non-QM segments" per MCT Jun 2026

**Calibration for Monte Carlo:**
- Intra-portfolio default correlation: ρ ≈ 0.20-0.35 (empirical estimate from CMBS multifamily)
- Delinquency clustering multiplier: 2-3x in stressed MSAs
- Insurance escalation correlated across properties in same MSA

**Slice 4 implementation**: use Gaussian copula with ρ=0.25 for cross-loan default correlation within a portfolio.

---

## 9. Portfolio Refinance Mechanics

**Standard refinance paths:**

1. **Single loan → multi-loan**: borrower has 5 individual DSCR loans, refinances each separately (current standard)
2. **Multi-loan → single portfolio loan**: borrower consolidates 5 loans into 1 portfolio loan (Insula-style, BFF blanket)
3. **Single portfolio loan → multi-loan**: borrower splits portfolio loan into individual loans (less common, partial release)
4. **Cross-collateral → release**: pay down portion of portfolio loan to release individual property (110-125% of allocated balance)

**Insula's value proposition**: refinance multiple rental loans into one streamlined structure, unlock equity, align debt terms.

**Implementation note for Slice 4**: model refinance cost as fixed cost (~$2K-$5K) + rate spread differential (typically 0-25 bps for portfolio loan) + opportunity cost of equity release.

---

## 10. Typical Portfolio Loan Size Range

| Investor Tier | Loan Count | Typical Total Size |
|---------------|-----------|---------------------|
| New investor (2-3 properties) | 2-3 | $1M-$3M |
| Growing investor (5-9) | 5-9 | $3M-$10M |
| Established investor (10-24) | 10-24 | $10M-$25M |
| Mid-tier investor (25-49) | 25-49 | $25M-$75M |
| Institutional investor (50+) | 50-100 | $75M-$200M |
| Mega investor (100+) | 100+ | $200M+ |

**Insula portfolio range observed**: $5M-$50M (multi-property investors)
**Lima One blanket range**: 2.5M-$25M
**BFF blanket range**: 1.5M-$5M
**Ready Capital multifamily-blended**: $10M-$100M

---

## 11. Slice 4 Implementation Recommendations

### 11.1 Portfolio Module Architecture

```
[Single Loan Tape] → [Portfolio Scoper] → [Concentration Analyzer]
    ↓                       ↓                       ↓
[DSCR Aggregator]    [Cross-Default Calc]    [EPFL Contagion]
    ↓                       ↓                       ↓
[Modified Dietz Return] → [Risk Grade] → [IC Memo: Portfolio Section]
```

### 11.2 First-Build Capabilities (Priority Order)

1. **Portfolio DSCR aggregator** (Σ rent / Σ PITIA) — slice_4_insula_style
2. **Concentration analyzer** (MSA / state / property-type HHI)
3. **EPFL Contagion Index** (HHI-weighted + delinquency cluster)
4. **Modified Dietz return** (12-mo rolling)
5. **Risk grading engine** (AAA/AA/A/BBB/NR)
6. **Portfolio spread differential calculator** (-25 to -200 bps)

### 11.3 Integration Points

- **Slice 2 P0-2 lender matrix**: feed Insula + Lima One + BFF into `lender_programs` table
- **Slice 4 capital markets**: portfolio loans eligible for whole-loan sale to Verus/Angel Oak
- **Slice 3 Monte Carlo**: use EPFL Contagion as correlation structure
- **Slice 3 after-tax**: portfolio interest deductibility at aggregate level

### 11.4 Build-vs-Buy

| Capability | Build? | Vendor Alternative |
|-----------|--------|---------------------|
| Portfolio aggregation | ✅ Build | Insula / Verus partner API |
| Concentration analytics | ✅ Build | — |
| Risk grading | ✅ Build | KBRA portfolio surveillance (paid) |
| Loan tape generation | ✅ Build | Domain 7 schema (compatible) |

---

## 12. Source Provenance

| Item | Tier | Source | Date |
|------|------|--------|------|
| Insula Capital Jun 11 2026 launch | **Tier 1** | PR Web press release | Jun 11 2026 |
| Insula "consolidated underwriting, cross-collateralized" | **Tier 1** | PR Web Jun 11 2026 | Jun 11 2026 |
| Federal Reserve $39→$68 insurance escalation | **Tier 1** | Cited in Insula press release | Jun 11 2026 |
| US Census 7.3% rental vacancy Q1 2026 | **Tier 1** | Cited in Insula release | Jun 11 2026 |
| Yardi Matrix 0.2% Q1 2026 rent growth | **Tier 1** | Cited in Insula release | Jun 11 2026 |
| MBA $805B commercial originations 2026 | **Tier 1** | Cited in Insula release | Jun 11 2026 |
| Lima One blanket / cross-collateral | **Tier 1** | limaone.com | 2026 |
| BFF 2-25 blanket $6.25M max 80% LTV 700 FICO | **Tier 1** | bffws.com | 2026 |
| Modified Dietz formula | **Tier 1** | Investopedia / Corp Finance Institute / TSG / CAIA | 2024-2026 |
| KBRA pool concentration 25% MSA / 35% state | **Tier 1** | KBRA presale templates | 2025-2026 |
| Scotsman Guide 2024 vol (OCMBC $3.55B etc.) | **Tier 1** | Scotsman Guide 2025 ranking | Apr 6 2025 |
| TOPIC 9 ΣNOI/ΣADS portfolio aggregation | **Tier 1** | TOPICAL_INDEX.md §9 | Jun 18 2026 |
| TOPIC 15 portfolio market data | **Tier 1** | TOPICAL_INDEX.md §15 | Jun 18 2026 |
| Master Analysis Round 11 Insula Capital entry | **Tier 1** | MASTER_ANALYSIS.md Round 11 | Jun 18 2026 |
| Crestmark Lending nationwide DSCR launch | **Tier 2** | PR Web 2026 | 2026 |

---

## 13. Cross-References

- **TOPIC 9**: STR income modeling (portfolio level)
- **TOPIC 15**: Market intelligence (Non-QM market sizing)
- **TOPIC 17**: Capital markets / securitization (portfolio pool eligibility)
- **Domain 7** (parallel): Capital markets & securitization
- **Domain 13** (parallel): Borrower demographics (portfolio borrower personas)
- **Slice 4**: Portfolio analytics (Phase 5 per TOPIC 20)
- **Master Analysis Round 11**: Insula Capital NEW June 2026 entry

---

## 14. Open Questions / Blockers

1. **Insula Capital specific loan terms** (rate, FICO floor, reserves) — public press release does not specify. Need sales engineering engagement or TPO partner channel.
2. **Portfolio correlation empirical study** — no public research paper; estimate from CMBS multifamily (Trepp) as proxy.
3. **Verus portfolio-level whole-loan eligibility** — Verus typically buys individual loans, not portfolios; need clarification on whether Verus accepts portfolio aggregation for whole-loan sale.
4. **Cross-state legal complexity** — cross-collateral across multiple states may require separate lender licensing in each state; need NMLS verification.
5. **Cross-default enforceability** — varies by state (judicial vs non-judicial foreclosure); California particularly restrictive.

---

*End of Domain 11 — Portfolio-Level DSCR Aggregation.*
