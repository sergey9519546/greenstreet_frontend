# Advisor-Grade DSCR Decision Engine: Master Specification

## Zero-Base Research & Design Document

**Document Version:** 1.0  
**Date:** 2026-06-19  
**Classification:** Professional Software Requirements Specification + Financial Model Design Document  
**Research Phases Completed:** 14 of 14  
**Sources Consulted:** 80+ primary and secondary sources  
**Formulas Defined:** 40+ explicit, auditable calculations  
**Engine Architectures Evaluated:** 9 competing designs  
**Breakthrough Features Invented:** 20+  

---

## 1. Executive Summary

The Advisor-Grade DSCR Decision Engine is a factual, calculation-first decision support system designed to transform how real estate investors, mortgage brokers, and private lenders evaluate Debt Service Coverage Ratio (DSCR) financing opportunities. Unlike every existing DSCR calculator—which typically computes a single ratio and leaves the user to interpret what it means—this engine operates as a multi-layered decision system that separates **lender qualification** from **investor survival**, diagnoses specific risks, models scenarios, solves for breakpoints, and produces mathematically justified recommendations with full audit trails and compliance boundaries.

The Non-QM lending market, which includes DSCR loans, has grown from **less than 3% of mortgage originations in 2020 to 5% in 2024**, with forecasts projecting **10–15% market share in 2025** [^1^][^2^][^7^]. DSCR loans specifically have emerged as the dominant financing vehicle for residential real estate investors, with more than **70% of U.S. rental properties owned by individual investors** who often cannot qualify under traditional income-verification requirements [^5^]. Yet the tools available to evaluate these loans remain primitive—most DSCR calculators perform nothing more than dividing rent by PITIA, producing a number that creates dangerous false confidence.

This specification defines a breakthrough engine built on a core principle: **a property can qualify for financing and still be a terrible investment**. Therefore, the engine's advisory recommendation always prioritizes investor survival over lender qualification. The system is designed as an institutional framework adaptable to single-family rentals through small multifamily properties (the initial target: $100K–$1.5M deals), with a flexible property-type architecture capable of later expansion to 5+ unit commercial multifamily.

The engine comprises **11 integrated modules**, **40+ explicit formulas**, **8 explainable scoring systems**, **20+ breakthrough features**, and a comprehensive compliance layer that ensures the system provides decision support without crossing into regulated investment advice. Every formula, threshold, and recommendation rule in this document is either source-cited from lender guidelines, derived from first-principles mathematics, or explicitly labeled as an assumption.

---

## 2. Breakthrough Thesis

### 2.1 The Core Problem: False Confidence

Every existing DSCR calculator shares a fatal flaw: they answer "What is the DSCR?" without answering "What does it mean for this specific deal, this specific borrower, in this specific market, under realistic stress?" A calculator that returns DSCR = 1.15 tells the user the property meets most lender minimums. It does not tell them that a single month of vacancy, a 15% insurance premium increase, and a property tax reassessment could simultaneously push the property into negative cash flow. It does not tell them that the interest-only structure they're using artificially inflates the DSCR by 20%. It does not tell them that the rent comp they used came from a property 2 miles away in a better school district.

### 2.2 The Breakthrough: Separation of Concerns

The Advisor-Grade DSCR Decision Engine introduces a fundamental architectural separation: **Lender Qualification Analysis** and **Investor Survival Analysis** are computed independently, displayed side-by-side, and integrated only at the final recommendation stage. This separation prevents the single most dangerous error in DSCR analysis—conflating "the bank will lend on this" with "this property will survive real-world ownership."

| Dimension | Lender Qualification | Investor Survival |
|---|---|---|
| **Primary Question** | Does the property meet lender criteria? | Will the property survive realistic stress? |
| **Time Horizon** | Origination snapshot | Full hold period + exit |
| **Rent Input** | Gross rent or market rent (Form 1007) | Gross rent minus vacancy, management, reserves |
| **Expense Treatment** | PITIA only | PITIA + CapEx + repairs + management + reserves |
| **DSCR Formula** | Rent / PITIA (or NOI / Debt Service) | (Rent - OpEx - Reserves) / PITIA |
| **Pass/Fail Logic** | Binary: meets lender matrix or not | Spectrum: survival probability under stress |
| **Output** | Eligible / Ineligible with conditions | Survival months, fragility score, risk diagnosis |

### 2.3 The Breakthrough: Deterministic Math + Explainable AI

The engine rejects black-box scoring. Every metric is computed from explicit, version-controlled formulas. Scoring systems use mathematically defensible weights calibrated to market data, not opaque machine learning. The system's "intelligence" comes from layered deterministic calculations, not from AI hallucination. Where AI is used—primarily in natural language recommendation generation—it operates only on outputs produced by verified formulas, never inventing math, thresholds, or conclusions.

### 2.4 The Breakthrough: Deal Repair Logic

No existing DSCR calculator tells the user *exactly what to change* to make a deal work. The engine's Breakpoint and Deal-Repair module solves for specific, actionable improvements: "To reach a 1.25 DSCR, either reduce the purchase price by $23,000, increase rent by $180/month, reduce the interest rate by 0.375%, increase your down payment to 28%, or build 9 months of reserves." Each solution is computed deterministically, not guessed.

---

## 3. Definition of "Advisor-Grade" DSCR Decision Engine

### 3.1 What "Advisor-Grade" Means

An advisor-grade system is one that a licensed mortgage broker, investment adviser, or real estate professional could confidently use as a decision-support tool in client-facing analysis—knowing that every number is traceable, every assumption is labeled, every recommendation is mathematically justified, and every limitation is disclosed. It does not replace professional judgment; it augments it with computational rigor.

### 3.2 The Seven Standards of Advisor-Grade

| Standard | Requirement | Implementation |
|---|---|---|
| **Deterministic** | Every output traces to explicit formulas | Formula Engine with version control |
| **Source-Cited** | Every factual claim references a source | Source tagging on all thresholds and rules |
| **Stress-Tested** | Deals evaluated under multiple scenarios | Scenario Engine with base/conservative/severe cases |
| **Risk-Diagnosed** | Specific weaknesses identified, not just scores | Risk Diagnosis Engine with primary risk factor |
| **Repair-Oriented** | Specific improvements suggested | Breakpoint Engine with exact dollar/percentage solutions |
| **Compliance-Bounded** | System knows what it may and may not say | Compliance Layer with disclaimer management |
| **Auditable** | Every analysis reproducible with inputs and assumptions | Audit Trail with timestamped inputs, formulas, and outputs |

### 3.3 What Advisor-Grade Is Not

The engine is explicitly **not** a licensed financial adviser, investment adviser, mortgage broker, lender, CPA, attorney, or underwriter. It does not approve loans. It does not guarantee returns. It does not provide personalized investment advice. It provides calculation-backed decision support with appropriate disclosures and human-review triggers for cases requiring professional judgment.

---

## 4. Current DSCR Calculator Failure Map

### 4.1 The Existing Tool Landscape

Research identified the following categories of DSCR-related tools in the market:

| Tool Category | Examples | What They Do Well | What They Fail To Do |
|---|---|---|---|
| **Basic DSCR Calculators** | NerdWallet [^11^], OfferMarket [^8^], Newfi [^12^] | Simple Rent/PITIA ratio | No investor survival analysis, no stress testing |
| **Lender-Specific Calculators** | Griffin Funding [^15^], Ameritrust [^17^] | Embed lender-specific guidelines | Only evaluate against one lender, no comparison |
| **Commercial Underwriting Platforms** | Trepp [^29^], ARGUS, CoStar | Institutional-grade DSCR/NOI analysis | Expensive, complex, not designed for 1-4 unit residential |
| **Investment Analysis Spreadsheets** | BiggerPockets, custom Excel | Flexible, user-controlled | Prone to formula errors, no validation, stale data |
| **Real Estate Pro Forma Tools** | TheAnalyst PRO [^30^], PropertyMetrics | Cap rate, cash-on-cash, IRR | Not DSCR-loan-specific, no lender qualification logic |

### 4.2 Specific Failure Modes

Research identified **18 specific failure modes** in existing DSCR tools:

| # | Failure Mode | Danger | Engine Solution |
|---|---|---|---|
| 1 | **Rent/PITIA-only DSCR** ignores operating expenses | Overstates true coverage by 15-40% | Dual DSCR: Lender DSCR + Investor DSCR |
| 2 | **No vacancy adjustment** | Assumes 100% occupancy year-round | Vacancy-adjusted income with market-specific rates |
| 3 | **No CapEx reserve** | Ignores roof, HVAC, major repairs | CapEx reserve engine with property-age-based rates |
| 4 | **No management fee** | Self-management assumption unrealistic | Management fee inclusion (8-10% default) |
| 5 | **Interest-only illusion** | Lower payment = better DSCR, but no principal paydown | Interest-Only Detector with expiration shock modeling |
| 6 | **No tax reassessment modeling** | Taxes reset to purchase price in many jurisdictions | Tax Shock Simulator with reassessment timing |
| 7 | **No insurance volatility** | Insurance costs rose 75% (2019-2024) [^50^] | Insurance Shock Simulator with trend adjustment |
| 8 | **No prepayment penalty analysis** | 3-5 year lock-in costs thousands | Prepayment Penalty Drag Calculator |
| 9 | **No refinance risk** | Balloon/reset risk not evaluated | Refinance Risk Meter with rate environment analysis |
| 10 | **No break-even analysis** | User doesn't know minimum rent/occupancy | Break-Even Rent, Occupancy, and Price calculators |
| 11 | **No scenario modeling** | Single-point analysis ignores uncertainty | Base/Conservative/Severe/Custom scenario engine |
| 12 | **No deal repair logic** | User knows deal is weak but not how to fix | Breakpoint solver with exact improvement targets |
| 13 | **No assumption labeling** | User can't distinguish verified from guessed data | Input Confidence Framework with 7 confidence levels |
| 14 | **No risk diagnosis** | Weak deal but no specific reason given | Risk Diagnosis Engine with primary risk factor |
| 15 | **No borrower suitability** | Deal may work but not for this borrower's goals | Borrower Suitability Engine |
| 16 | **No compliance boundaries** | Tool gives advice it shouldn't | Compliance Layer with disclosure management |
| 17 | **No audit trail** | Analysis can't be reproduced or defended | Audit Trail Generator with full provenance |
| 18 | **Stale lender data** | Rates and guidelines change weekly | Lender Matrix Versioning with staleness detection |

---

## 5. Research Findings

### 5.1 DSCR Loan Market Landscape

The Non-QM lending sector has demonstrated remarkable growth and resilience. Non-QM loans accounted for approximately **5% of all mortgage originations in 2024**, up from 3% in 2020 [^7^]. Industry forecasts project this share to **more than double to 10–15% in 2025** [^2^]. Within Non-QM, DSCR loans have emerged as one of the three primary product categories (alongside bank statement loans and second liens), specifically serving the **70%+ of rental properties owned by individual investors** [^5^].

Key market statistics from the research:

| Metric | Value | Source |
|---|---|---|
| Non-QM market share 2024 | ~5% of originations | Scotsman Guide [^7^] |
| Non-QM projected share 2025 | 10–15% | SS&C / MBA webinar [^2^] |
| Non-QM borrower average FICO | 737+ | SS&C research [^2^] |
| Cumulative Non-QM losses since 2018 | <0.02% | BofA Global Research [^7^] |
| Self-employed U.S. workers | 16.5 million (~10% of workforce) | LendSure [^5^] |
| Real estate investment software market 2025 | $5.6–12.8 billion | Mordor Intelligence / Dataintelo [^57^][^66^] |

### 5.2 Lender Guideline Convergence

Published guidelines from major DSCR lenders (Newfi [^13^], Griffin Funding [^15^], MCF Funding [^16^], Ameritrust [^17^], Angel Oak [^10^], Easy Street Capital, CoreVest, Visio, Kiavi [^14^]) show remarkable convergence on core parameters, with variation primarily in pricing adjustments rather than eligibility floors.

| Parameter | Typical Range | Notes |
|---|---|---|
| **Minimum DSCR** | 1.00x (0.75x with compensating factors) | 1.25x+ earns best rates [^14^][^15^] |
| **Minimum FICO** | 640–680 | 620 available with overlays [^14^][^19^] |
| **Maximum LTV (Purchase)** | 75–80% | 70–75% on cash-out refi [^13^][^15^] |
| **Interest-Only LTV** | Reduce by 5% | 75% max vs 80% for amortizing [^21^] |
| **Cash Reserves** | 6 months PITIA | 12 months for STRs; may be waived <65% LTV [^14^][^23^] |
| **Loan Amount Range** | $100K–$3M | Portfolio programs to $5M+ [^3^][^14^] |
| **Prepayment Penalty** | 3–5 year step-down or flat | Flat: 5% for 5 years common [^16^][^25^] |
| **Property Types** | 1-4 units, condos, condotels | Mixed-use, STRs vary by lender [^3^][^17^] |
| **Seasoning** | 6 months typical | Some lenders waive for refi [^25^] |
| **First-Time Investor** | Max 70% LTV, min 700 FICO | Experienced investors get better terms [^21^] |
| **Declining Market** | 5% LTV reduction | Applied at lender discretion [^16^] |
| **Housing History** | 0x30x12 required | Max 75% LTV if 1x30x12 [^16^][^23^] |

### 5.3 Operating Expense Benchmarks

Research across multiple sources established realistic operating expense ranges for residential investment properties. Single-family rental operating expense ratios typically fall between **30–50% of effective gross income**, with well-managed stabilized properties achieving **20–26%** [^77^]. Multifamily properties (5+ units) typically run **35–50%** [^37^].

| Expense Category | SFR Benchmark | Multifamily Benchmark | Source |
|---|---|---|---|
| Property Management | 8–10% of EGI | 3–5% of EGI | Industry standard [^75^][^80^] |
| Repairs & Maintenance | 1–2% of property value/year | $400–800/unit/year | [^18^][^75^] |
| Insurance | 1–3% of property value | $200–400/unit/year | [^50^][^75^] |
| Property Taxes | 1–3% of assessed value | Varies by jurisdiction | [^55^] |
| CapEx Reserve | 5–10% of rent | $200–500/unit/year | [^18^][^75^] |
| Vacancy Allowance | 5–10% of GPR | 5–8% of GPR | [^18^][^37^] |
| Utilities (if owner-paid) | Varies | $50–100/unit/month | [^75^] |

### 5.4 Insurance Cost Volatility

The Federal Reserve's analysis of multifamily insurance costs found that **average monthly property insurance per unit increased from $39 in 2019 to $68 in 2024 in real terms—an increase of more than 75%** [^50^]. Landlord insurance typically costs **15–20% more than homeowners insurance** for the same property [^51^]. Industry forecasts suggest continued premium growth in the mid-to-high single digits annually [^51^][^53^].

### 5.5 DSCR Fragility Research

Academic and institutional research confirms that DSCR is highly sensitive to operational and market variables. Fannie Mae data shows that loans originated during periods of low rent growth experienced **default rates of 3.8–5.8%**, while loans during high national rental vacancy (9.6–10.6%) saw default rates **above 4.9%** [^81^]. A DSCR of 1.25x provides meaningful cushion; as DSCR tightens toward **1.05–1.20x**, "even modest disruptions—such as a tenant vacancy or unexpected repair—can impair debt service" [^78^].

---

## 6. Source-Backed Formula Library

### 6.1 Core DSCR Formulas

#### 6.1.1 Lender DSCR (Rent/PITIA Method)
The standard DSCR formula used by residential DSCR lenders for 1-4 unit properties [^8^][^15^]:

$$\\text{DSCR}_{\\text{lender}} = \\frac{\\text{Monthly Gross Rent}}{\\text{Monthly PITIA}}$$

Where:
- **Gross Rent** = The lesser of actual lease rent or appraiser's market rent (Form 1007/1025) [^15^]
- **PITIA** = Principal + Interest + Taxes + Insurance + Association Dues (HOA) [^8^]

For interest-only loans, PITIA becomes **ITIA** (Interest + Taxes + Insurance + Association Dues) [^16^].

#### 6.1.2 Investor DSCR (NOI Method)
The institutional-grade DSCR formula used in commercial real estate underwriting [^26^][^32^]:

$$\\text{DSCR}_{\\text{investor}} = \\frac{\\text{NOI}}{\\text{Annual Debt Service}}$$

Where:
- **NOI** = Effective Gross Income − Operating Expenses (excluding debt service, depreciation, CapEx)
- **Annual Debt Service** = 12 × Monthly Principal & Interest Payment [^26^][^29^]

#### 6.1.3 Net Cash Flow DSCR (Conservative Method)
The most conservative DSCR calculation, used by sophisticated lenders and institutional investors [^28^][^29^]:

$$\\text{DSCR}_{\\text{NCF}} = \\frac{\\text{NOI} - \\text{CapEx Reserve}}{\\text{Annual Debt Service}}$$

This formula accounts for capital expenditures that standard NOI excludes, providing a more realistic test of long-term debt service capacity [^28^].

### 6.2 Income and Expense Formulas

#### 6.2.1 Potential Gross Income (PGI)

$$\\text{PGI} = \\sum_{i=1}^{n} (\\text{Unit}_i \\text{ Rent} \\times 12)$$

#### 6.2.2 Vacancy and Credit Loss

$$\\text{Vacancy Loss} = \\text{PGI} \\times \\text{Vacancy Rate}$$

Typical vacancy rates: **5–10% for stabilized properties** [^18^][^37^]; below 5% is aggressive, above 10% requires explanation [^37^].

#### 6.2.3 Effective Gross Income (EGI)

$$\\text{EGI} = \\text{PGI} - \\text{Vacancy Loss} + \\text{Other Income}$$

#### 6.2.4 Net Operating Income (NOI)

$$\\text{NOI} = \\text{EGI} - \\text{Operating Expenses}$$

Operating expenses include: property taxes, insurance, management fees, repairs/maintenance, utilities (owner-paid), landscaping, marketing, and administrative costs [^26^][^32^]. Operating expenses **exclude** debt service, depreciation, income taxes, and capital expenditures.

#### 6.2.5 Operating Expense Ratio

$$\\text{Operating Expense Ratio} = \\frac{\\text{Operating Expenses}}{\\text{EGI}}$$

Benchmark: **35–50%** for most market-rate multifamily properties [^37^]; **30–50%** for single-family rentals [^77^].

### 6.3 Loan and Debt Formulas

#### 6.3.1 Monthly Mortgage Payment (Amortizing)

$$\\text{PMT} = P \\times \\frac{r(1+r)^n}{(1+r)^n - 1}$$

Where:
- P = Principal loan amount
- r = Monthly interest rate (annual rate / 12)
- n = Total number of payments (loan term in years × 12)

#### 6.3.2 Monthly Interest-Only Payment

$$\\text{IO Payment} = P \\times \\frac{r_{\\text{annual}}}{12}$$

#### 6.3.3 Annual Debt Service

$$\\text{Annual Debt Service} = 12 \\times \\text{Monthly Payment (P&I or I-only)}$$

#### 6.3.4 Loan Constant (Debt Constant)

$$\\text{Loan Constant} = \\frac{\\text{Annual Debt Service}}{\\text{Loan Amount}}$$

Used to back-calculate maximum loan amount from NOI and required DSCR [^26^].

#### 6.3.5 Maximum Loan Amount (from DSCR)

$$\\text{Max Loan Amount}_{\\text{DSCR}} = \\frac{\\text{NOI}}{\\text{Required DSCR} \\times \\text{Loan Constant}}$$

#### 6.3.6 Loan-to-Value (LTV)

$$\\text{LTV} = \\frac{\\text{Loan Amount}}{\\text{Property Value (or Purchase Price)}}$$

#### 6.3.7 Loan-to-Cost (LTC)

$$\\text{LTC} = \\frac{\\text{Loan Amount}}{\\text{Total Project Cost (Purchase + Renovation)}}$$

### 6.4 Return and Yield Formulas

#### 6.4.1 Cap Rate

$$\\text{Cap Rate} = \\frac{\\text{NOI}}{\\text{Property Value}}$$

Core multifamily averaged **4.73%** going-in cap rate in Q3 2025 [^37^]. Value-add properties typically trade at **5.5–7.0%** [^37^].

#### 6.4.2 Cash-on-Cash Return

$$\\text{Cash-on-Cash} = \\frac{\\text{Annual Pre-Tax Cash Flow}}{\\text{Equity Invested}}$$

Benchmark: **4–8%** year-one for stabilized deals; **0–3%** for value-add in year one [^37^].

#### 6.4.3 Debt Yield

$$\\text{Debt Yield} = \\frac{\\text{NOI}}{\\text{Loan Amount}}$$

Typical minimum: **8–10%** for commercial real estate lenders [^30^][^45^]. Below 8% is viewed as higher risk [^45^].

#### 6.4.4 Net Cash Flow

$$\\text{Net Cash Flow} = \\text{NOI} - \\text{Annual Debt Service} - \\text{CapEx Reserve}$$

### 6.5 Break-Even Formulas

#### 6.5.1 Break-Even Rent

$$\\text{Break-Even Rent} = \\frac{\\text{Monthly Operating Expenses} + \\text{Monthly Debt Service} + \\text{Monthly Reserves}}{1 - \\text{Vacancy Rate}}$$

#### 6.5.2 Break-Even Occupancy Rate

$$\\text{Break-Even Occupancy} = \\frac{\\text{Annual Operating Expenses} + \\text{Annual Debt Service}}{\\text{Gross Potential Annual Rent}} \\times 100$$

Interpretation: Below **80%** is comfortable; **80–85%** acceptable; **85–90%** concerning; above **90%** dangerous [^41^][^48^].

#### 6.5.3 Break-Even Purchase Price

$$\\text{Break-Even Price} = \\frac{\\text{Target DSCR} \\times \\text{Annual Debt Service at Max LTV}}{\\text{Cap Rate}}$$

### 6.6 Stress Test Formulas

#### 6.6.1 Stress DSCR

$$\\text{DSCR}_{\\text{stress}} = \\frac{\\text{NOI} \\times (1 - \\text{Income Shock}) - \\text{OpEx} \\times (1 + \\text{Expense Shock})}{\\text{Annual Debt Service} \\times (1 + \\text{Rate Shock})}$$

#### 6.6.2 Debt Yield Under Stress

$$\\text{Debt Yield}_{\\text{stress}} = \\frac{\\text{NOI} \\times (1 - \\text{Income Shock})}{\\text{Loan Amount}}$$

#### 6.6.3 Liquidity Survival Months

$$\\text{Survival Months} = \\frac{\\text{Liquid Reserves}}{\\text{Monthly Net Cash Flow Deficit (if negative)}}$$

If monthly cash flow is positive, survival months = "indefinite." If negative, survival months indicates how long reserves last before requiring external capital.

### 6.7 Pricing and Sensitivity Formulas

#### 6.7.1 Points Breakeven

$$\\text{Points Breakeven (months)} = \\frac{\\text{Points Cost (\\$)}}{\\text{Monthly Payment Reduction (\\$)}}$$

#### 6.7.2 Prepayment Penalty Cost

$$\\text{PPP Cost} = \\text{Remaining Balance} \\times \\text{Penalty Rate}$$

For step-down penalties: rate declines by 1% annually (e.g., 5% year 1, 4% year 2, ..., 1% year 5) [^25^].

#### 6.7.3 Interest-Only Illusion Factor

$$\\text{IO Illusion Factor} = \\frac{\\text{DSCR}_{\\text{IO}}}{\\text{DSCR}_{\\text{amortizing at same rate}}} = \\frac{\\text{PITIA}_{\\text{amortizing}}}{\\text{ITIA}_{\\text{IO}}}$$

This ratio shows how much the DSCR is artificially inflated by the interest-only structure.

#### 6.7.4 CapEx Reserve Annual Requirement

$$\\text{Annual CapEx Reserve} = \\text{Property Value} \\times \\text{CapEx Rate}$$

Typical CapEx rates: **1–2% of property value annually** for single-family rentals [^18^]; **$200–500/unit annually** for multifamily [^75^].

### 6.8 Formula Validation Rules

Every formula in the engine must pass these validation tests:

| Validation | Rule | Failure Action |
|---|---|---|
| **Numerical** | No division by zero; all inputs within reasonable bounds | Return "undefined" with explanation |
| **Dimensional** | Units must match (monthly vs annual consistency) | Auto-convert or flag mismatch |
| **Bounds** | LTV must be 0–100%; DSCR must be non-negative | Clamp to bounds with warning |
| **Cross-check** | Lender DSCR ≥ Investor DSCR always | Flag data error if violated |
| **Temporal** | All values must use same time basis (monthly/annual) | Standardize to monthly for engine |
| **Source** | All thresholds must reference source or be labeled "ASSUMPTION" | Block unsubstantiated thresholds |

---

## 7. Full Engine Architecture

### 7.1 Architectural Overview

The Advisor-Grade DSCR Decision Engine is organized into **11 integrated modules** arranged in a layered pipeline. Data flows from the Intake Layer through Deterministic Calculation, Qualification, Survival, and Advisory Layers, with an Audit and Compliance Layer wrapping all operations.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUDIT & COMPLIANCE LAYER                          │
│  (Audit Trail, Disclaimers, Human-Review Triggers, Compliance Check) │
└─────────────────────────────────────────────────────────────────────┘
                               ▲
┌──────────────────────────────┼──────────────────────────────────────┐
│                              │         ADVISORY LAYER               │
│  ┌─────────────────┐  ┌──────┴──────┐  ┌─────────────────────────┐  │
│  │  Scoring Engine │  │ Recommendation│ │ Borrower Suitability    │  │
│  │  (8 scores)     │  │ Engine        │ │ Engine                  │  │
│  └─────────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ▲
┌──────────────────────────────┼──────────────────────────────────────┐
│                              │      SURVIVAL & SCENARIO LAYER       │
│  ┌─────────────────┐  ┌──────┴──────┐  ┌─────────────────────────┐  │
│  │ Investor Survival│  │ Scenario/    │ │ Breakpoint &            │  │
│  │ Engine           │  │ Stress-Test  │ │ Deal-Repair Engine      │  │
│  └─────────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ▲
┌──────────────────────────────┼──────────────────────────────────────┐
│                              │    QUALIFICATION LAYER               │
│  ┌─────────────────┐  ┌──────┴──────┐  ┌─────────────────────────┐  │
│  │ Lender Qualification│ │ Risk       │ │ Pricing & Sensitivity    │  │
│  │ Engine              │ │ Diagnosis  │ │ Engine                   │  │
│  └─────────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ▲
┌──────────────────────────────┼──────────────────────────────────────┐
│                              │   DETERMINISTIC CALCULATION LAYER    │
│  ┌─────────────────┐  ┌──────┴──────┐  ┌─────────────────────────┐  │
│  │ Formula Engine  │  │ Data Schema │ │ Input Confidence        │  │
│  │ (40+ formulas)  │  │ & Validation│ │ Framework               │  │
│  └─────────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ▲
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA INTAKE LAYER                             │
│   (Property, Loan, Rent, Expense, Market, Borrower inputs)           │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Module Definitions

| Module | Layer | Core Function | Input | Output |
|---|---|---|---|---|
| **M1: Data Intake** | Intake | Capture and normalize all inputs | User forms, API, files | Structured data objects with confidence labels |
| **M2: Input Confidence** | Calculation | Label each input's reliability | Raw inputs | Confidence scores (7 levels) |
| **M3: Formula Engine** | Calculation | Compute all financial metrics | Validated inputs | 40+ calculated metrics |
| **M4: Lender Qualification** | Qualification | Evaluate against lender matrices | Property + loan + borrower data | Eligibility status, conditions, pricing |
| **M5: Risk Diagnosis** | Qualification | Identify primary deal weakness | All calculated metrics | Primary risk factor + severity |
| **M6: Pricing & Sensitivity** | Qualification | Test rate/points/LTV/DSCR effects | Loan terms | Sensitivity tables, optimal structure |
| **M7: Investor Survival** | Survival | Real-world ownership stress test | All inputs + reserves + shocks | Survival months, fragility score |
| **M8: Scenario Engine** | Survival | Run base/conservative/severe cases | All inputs + scenario parameters | DSCR, cash flow, risk under each scenario |
| **M9: Breakpoint Engine** | Survival | Solve for deal repair targets | Current deal + target parameters | Exact improvement requirements |
| **M10: Scoring Engine** | Advisory | Compute 8 explainable scores | All module outputs | Weighted scores with calibration |
| **M11: Recommendation** | Advisory | Generate justified recommendation | All scores + diagnosis + compliance | Recommendation + basis + disclaimer |

---

## 8. Module-by-Module Design

### 8.1 Module 1: Data Intake and Verification

#### 8.1.1 Input Categories

The engine captures inputs across six domains:

| Category | Fields | Criticality |
|---|---|---|
| **Property** | Address, type (SFR/condo/2-4 unit), units, sqft, year built, condition, HOA dues | Required |
| **Loan** | Purpose (purchase/refi/cash-out), amount, LTV, rate, term, amortization, IO period, points, prepay structure | Required |
| **Rent** | Monthly rent, rent source (lease/1007/user estimate), lease start/end, STR flag | Required |
| **Expenses** | Taxes, insurance, management, repairs, utilities, other (user-provided or estimated) | Required |
| **Market** | Market rent, vacancy rate, cap rate, rent growth trend, market classification | Auto-populated or user |
| **Borrower** | FICO, liquid reserves, experience (deals owned), entity type, risk tolerance, hold period, target return | Required for suitability |

#### 8.1.2 Input Validation Rules

```python
VALIDATION_RULES = {
    "purchase_price": {"min": 50000, "max": 5000000, "type": "currency"},
    "loan_amount": {"min": 75000, "max": 4000000, "type": "currency", "ltv_check": True},
    "interest_rate": {"min": 0.01, "max": 0.20, "type": "percentage"},
    "monthly_rent": {"min": 500, "max": 50000, "type": "currency"},
    "fico_score": {"min": 500, "max": 850, "type": "integer"},
    "property_age": {"min": 0, "max": 200, "type": "integer"},
    "vacancy_rate": {"min": 0, "max": 0.50, "type": "percentage", "default": 0.075},
    "property_type": {"enum": ["SFR", "CONDO", "TOWNHOME", "DUPLEX", "TRIPLEX", "FOURPLEX"]},
}
```

### 8.2 Module 2: Input Confidence Framework

#### 8.2.1 Confidence Levels

Every input is assigned one of seven confidence levels:

| Level | Label | Color | Definition | Example |
|---|---|---|---|---|
| **C1** | Verified | Green | Documented, third-party verified | Appraisal rent schedule (Form 1007), recorded lease |
| **C2** | User-Provided | Blue-Green | User entered with supporting documentation | Bank statement showing reserves, insurance quote |
| **C3** | Estimated (High) | Blue | Industry benchmark applied to known property | Management fee at 10% based on market standard |
| **C4** | Estimated (Medium) | Yellow | Regional average applied | Property tax from county assessor database |
| **C5** | Estimated (Low) | Orange | National default applied with uncertainty | CapEx reserve default without property inspection |
| **C6** | Stale | Red-Orange | Previously verified but outdated | Rent comp from 6+ months ago |
| **C7** | Missing | Red | No data available; default assumption used | Repair history unknown; using age-based estimate |

#### 8.2.2 Assumption Confidence Score (ACS)

The Assumption Confidence Score aggregates input confidence into a single metric:

$$\\text{ACS} = \\frac{\\sum_{i=1}^{n} w_i \\times c_i}{\\sum_{i=1}^{n} w_i}$$

Where:
- $w_i$ = Weight of input $i$ (based on sensitivity of DSCR to that input)
- $c_i$ = Confidence value (C1=1.0, C2=0.9, C3=0.75, C4=0.6, C5=0.4, C6=0.2, C7=0.0)

**Thresholds:**
- ACS ≥ 0.8: "High confidence—analysis is reliable"
- ACS 0.6–0.79: "Medium confidence—key assumptions should be verified"
- ACS 0.4–0.59: "Low confidence—results are directional only"
- ACS < 0.4: "Insufficient data—professional review required"

### 8.3 Module 3: Deterministic Formula Engine

#### 8.3.1 Formula Registry

The Formula Engine maintains a version-controlled registry of all 40+ formulas. Each formula entry contains:

```python
FORMULA_REGISTRY = {
    "dscr_lender": {
        "name": "Lender DSCR (Rent/PITIA)",
        "formula": "monthly_rent / monthly_pitia",
        "version": "1.0",
        "source": "Industry standard—see Griffin Funding [15], OfferMarket [8]",
        "inputs": ["monthly_rent", "monthly_pitia"],
        "output": "ratio",
        "validation": "result > 0",
        "category": "lender_qualification"
    },
    "dscr_investor": {
        "name": "Investor DSCR (NOI/Debt Service)",
        "formula": "noi / annual_debt_service",
        "version": "1.0",
        "source": "CRE industry standard—see JPMorgan [32], IPG [26]",
        "inputs": ["noi", "annual_debt_service"],
        "output": "ratio",
        "validation": "result > 0",
        "category": "investor_survival"
    },
    # ... additional formulas
}
```

#### 8.3.2 Formula Execution Pipeline

```
Inputs → Validation → Standardization (monthly) → Computation → 
Cross-Check → Output with Provenance
```

The engine enforces **monthly standardization** for all cash flows to prevent the most common DSCR calculation error: mixing monthly rent with annual debt service.

### 8.4 Module 4: Lender Qualification Engine

#### 8.4.1 Lender Matrix Architecture

The engine uses a configurable lender matrix system that can be updated as lender guidelines change. The default matrix synthesizes published guidelines from major DSCR lenders [^13^][^14^][^15^][^16^][^17^].

| DSCR Band | FICO 720+ | FICO 700-719 | FICO 680-699 | FICO 660-679 | FICO 640-659 | FICO 620-639 |
|---|---|---|---|---|---|---|
| **≥ 1.25** | 80% LTV | 80% LTV | 75% LTV | 75% LTV | 70% LTV | 65% LTV |
| **1.00 – 1.24** | 75% LTV | 75% LTV | 70% LTV | 70% LTV | 65% LTV | 60% LTV |
| **0.75 – 0.99** | 70% LTV | 70% LTV | 65% LTV | 65% LTV | 60% LTV | 55% LTV |
| **< 0.75** | 65% LTV | 65% LTV | 60% LTV | 60% LTV | 55% LTV | 50% LTV |

*Note: This matrix is a synthesis for illustrative purposes. Live lender matrices should be sourced directly from lenders and updated weekly. The engine flags any matrix older than 30 days as "STALE."*

#### 8.4.2 Qualification Logic Flow

```
1. Calculate Lender DSCR
2. Lookup max LTV for DSCR band + FICO in matrix
3. Check if requested LTV ≤ max LTV
4. Check if liquid reserves ≥ required months (6 default, 12 for STR)
5. Check property type eligibility
6. Check loan amount within min/max
7. Check first-time investor restrictions (max 70% LTV, min 700 FICO)
8. If IO: check min FICO 700, reduce LTV by 5%, check DSCR ≥ 1.0
9. Return: ELIGIBLE / INELIGIBLE / ELIGIBLE_WITH_CONDITIONS
```

#### 8.4.3 Pricing Adjustment Engine

The engine models rate adjustments based on LTV, FICO, and DSCR bands using published pricing structures [^56^][^60^]:

| Factor | Adjustment Range | Source |
|---|---|---|
| LTV 80% vs 70% | +0.25% to +0.50% rate | HomeAbroad [56] |
| FICO 640 vs 720 | +0.50% to +1.00% rate | Industry standard |
| DSCR < 1.0 | +0.25% to +0.50% rate | Lender overlays [14] |
| Interest-Only | +0.125% to +0.375% rate | Lender pricing [16] |
| Cash-out refinance | +0.125% to +0.25% rate | Industry standard |
| Points (buydown) | -0.125% to -0.375% per point | Standard pricing |

### 8.5 Module 5: Investor Survival Engine

#### 8.5.1 Survival Analysis Framework

The Investor Survival Engine evaluates whether the property generates sufficient cash flow to survive realistic ownership stress. It computes a **Net Owner Cash Flow** that the lender DSCR intentionally ignores:

$$\\text{Net Owner Cash Flow} = \\text{Gross Rent} - \\text{Vacancy} - \\text{PITIA} - \\text{Management} - \\text{Repairs} - \\text{CapEx Reserve} - \\text{Utilities}$$

#### 8.5.2 Reserve Requirements

The engine applies property-type-specific reserve calculations:

| Reserve Type | SFR Formula | Multifamily Formula | Source |
|---|---|---|---|
| **Vacancy Reserve** | 1 month rent | 5-10% of EGI | [^18^][^37^] |
| **Repair Reserve** | 1-2% of property value/year | $400-800/unit/year | [^18^][^75^] |
| **CapEx Reserve** | 5-10% of monthly rent | $200-500/unit/year | [^18^][^75^] |
| **Management Reserve** | 8-10% of collected rent | 3-5% of EGI | Industry standard |
| **Liquidity Reserve** | 6 months PITIA + reserves | 6 months PITIA + reserves | Lender standard [^14^] |

#### 8.5.3 Survival Months Calculation

If Net Owner Cash Flow is negative:

$$\\text{Survival Months} = \\frac{\\text{Liquid Reserves} + \\text{Vacancy Reserve} + \\text{Repair Reserve}}{|\\text{Monthly Net Owner Cash Flow}|}$$

**Interpretation:**
- Survival Months ≥ 12: Strong liquidity position
- Survival Months 6–11: Adequate but monitor
- Survival Months 3–5: Fragile—build reserves
- Survival Months < 3: Dangerous—immediate action required

### 8.6 Module 6: Scenario and Stress-Test Engine

#### 8.6.1 Scenario Definitions

| Scenario | Vacancy | Rent Change | Expense Change | Rate Change | Insurance Change | Tax Change |
|---|---|---|---|---|---|---|
| **Base** | Market rate | 0% | 0% | 0% | 0% | 0% |
| **Conservative** | +3% | −5% | +10% | +0.50% | +15% | +10% reassessment |
| **Severe** | +8% | −15% | +20% | +2.00% | +30% | +25% reassessment |
| **Custom** | User-defined | User-defined | User-defined | User-defined | User-defined | User-defined |

#### 8.6.2 Stress Test Outputs

For each scenario, the engine outputs:
- Lender DSCR
- Investor DSCR (NOI method)
- Net Owner Cash Flow (monthly and annual)
- Break-Even Occupancy
- Survival Months
- Debt Yield
- Cash-on-Cash Return
- Cap Rate (if market value changes)

### 8.7 Module 7: Breakpoint and Deal-Repair Engine

#### 8.7.1 Breakpoint Variables

The engine can solve for any of the following to achieve a target DSCR or cash flow:

| Target Variable | Formula | Input Required |
|---|---|---|
| **Required Rent** | Target DSCR × PITIA | Target DSCR, loan terms |
| **Required Price Reduction** | (Current Price × Target DSCR / Current DSCR) − Current Price | Target DSCR |
| **Required LTV Reduction** | Solve: DSCR(LTV) = Target | Target DSCR, pricing model |
| **Required Rate Reduction** | Solve: DSCR(rate) = Target | Target DSCR |
| **Required Down Payment Increase** | New equity to achieve target LTV | Target LTV from matrix |
| **Required Reserve Build** | Months needed to reach survival threshold | Target survival months |

#### 8.7.2 Deal Repair Priority

The engine ranks repair options by feasibility:

1. **Increase down payment** (if borrower has capital)—immediate effect
2. **Negotiate lower purchase price**—depends on seller motivation
3. **Secure lower interest rate** (points buydown or shop lenders)—immediate if available
4. **Increase rent** (market analysis required)—medium-term
5. **Reduce expenses** (insurance shopping, tax appeal)—ongoing
6. **Build reserves**—defensive measure

### 8.8 Module 8: Risk Diagnosis Engine

#### 8.8.1 Risk Categories

The engine evaluates 12 distinct risk categories:

| # | Risk Category | Metric | Threshold | Severity |
|---|---|---|---|---|
| 1 | **Low DSCR** | Lender DSCR < 1.25 | DSCR < 1.0: Critical; 1.0–1.1: High; 1.1–1.25: Medium | High if < 1.1 |
| 2 | **High LTV** | LTV > 75% | > 80%: Critical; 75–80%: High; 70–75%: Medium | High if > 75% |
| 3 | **Weak Borrower** | FICO < 680 or reserves < 6 months | FICO < 640: Critical; < 680: High | Medium-High |
| 4 | **Negative Cash Flow** | Net Owner Cash Flow < 0 | Any negative: High | High |
| 5 | **Thin Reserves** | Survival Months < 6 | < 3: Critical; 3–6: High; 6–12: Medium | High |
| 6 | **IO Expiration Risk** | IO period < hold period | Payment shock > 25%: High | High |
| 7 | **Prepayment Trap** | PPP cost > 6 months cash flow | > 12 months: High | Medium |
| 8 | **Tax Reassessment** | Assessment lag > 3 years | Reset to purchase price: High | Medium |
| 9 | **Insurance Volatility** | Insurance > 3% of rent | > 5%: High; > 3%: Medium | Medium |
| 10 | **Vacancy Sensitivity** | Break-even occupancy > 85% | > 90%: Critical; > 85%: High | Medium-High |
| 11 | **Refinance Risk** | Balloon/reset within hold period | < 2 years buffer: High | Medium |
| 12 | **Rent Confidence** | Rent source = "user estimate" | No lease or 1007: Medium | Medium |

#### 8.8.2 Primary Risk Identification

The engine identifies the **single primary risk** as the category with the highest severity score that is not already being mitigated. This prevents "risk fatigue" where the user sees 8 problems and addresses none.

### 8.9 Module 9: Scoring Engine

#### 8.9.1 Score Definitions

The engine computes 8 explainable scores. Each uses explicit weights calibrated to market data.

| Score | Range | Formula | Purpose |
|---|---|---|---|
| **Lender Qualification Score (LQS)** | 0–100 | Weighted eligibility across 6 lender criteria | Likelihood of loan approval |
| **Investor Survival Score (ISS)** | 0–100 | Survival months + cash flow stability + reserve adequacy | Likelihood of ownership success |
| **DSCR Fragility Score (DFS)** | 0–100 | Sensitivity of DSCR to ±10% rent, ±10% expenses, +1% rate | How easily DSCR breaks |
| **Assumption Confidence Score (ACS)** | 0–100 | Weighted average of input confidence levels | Data reliability |
| **Liquidity Risk Score (LRS)** | 0–100 | Inverse of survival months (normalized) | Short-term liquidity danger |
| **Refinance Risk Score (RRS)** | 0–100 | Balloon proximity + rate environment + equity cushion | Long-term refinancing danger |
| **Deal Repairability Score (DRS)** | 0–100 | Feasibility of reaching target DSCR through adjustments | How fixable the deal is |
| **Overall Deal Quality (ODQ)** | A+ to F | Composite weighted by ISS (40%), LQS (25%), DFS (15%), ACS (10%), LRS (10%) | Holistic deal assessment |

#### 8.9.2 Score Calibration

Scores are calibrated so that:
- A property with DSCR = 1.25, LTV = 75%, FICO = 720, 12 months reserves, positive cash flow receives ODQ = A−
- A property with DSCR = 1.0, LTV = 80%, FICO = 660, 6 months reserves, break-even cash flow receives ODQ = C
- A property with DSCR < 0.9, LTV > 80%, negative cash flow receives ODQ = D or F

### 8.10 Module 10: Recommendation Engine

#### 8.10.1 Recommendation Taxonomy

The engine produces one of 12 recommendation categories:

| # | Recommendation | Trigger Condition | Confidence Required |
|---|---|---|---|
| 1 | **Strong Deal** | DSCR ≥ 1.25, LTV ≤ 75%, ISS ≥ 80, positive cash flow, ACS ≥ 0.7 | High |
| 2 | **Good but Sensitive** | DSCR 1.15–1.25, ISS 65–80, DFS < 60 | Medium-High |
| 3 | **Financeable but Fragile** | DSCR 1.0–1.15, ISS 50–65, one major risk factor | Medium |
| 4 | **Qualifies but Poor Investment** | LQS ≥ 70 but ISS < 50 (investor survival fails) | Medium |
| 5 | **Needs Lower Purchase Price** | DSCR gap solvable by 5–15% price reduction | Medium |
| 6 | **Needs Lower LTV** | LTV exceeds matrix for DSCR/FICO band | High |
| 7 | **Needs Higher Rent** | Market supports 10%+ rent increase | Medium |
| 8 | **Needs Larger Reserves** | Survival months < 6 but deal otherwise viable | Medium |
| 9 | **Needs Better Rate/Points** | Rate reduction of 0.25–0.75% would fix DSCR | Medium |
| 10 | **Needs Verified Rent Data** | Rent source is C5-C7 confidence | Low-Medium |
| 11 | **Requires Human Review** | Multiple critical risks, ACS < 0.4, or complex structure | Any |
| 12 | **Avoid Unless Terms Improve** | ISS < 30, negative cash flow, LQS < 50 | High |

#### 8.10.2 Recommendation Output Format

Every recommendation includes:

```
RECOMMENDATION: [Category]
CALCULATION BASIS:
  - Lender DSCR: [X.XX] (threshold: [Y.YY])
  - Investor DSCR: [X.XX]
  - LTV: [XX]% (max: [YY]%)
  - Net Cash Flow: $[X,XXX]/month
  - Survival Months: [X]
KEY RISK: [Primary risk factor]
REQUIRED IMPROVEMENT: [Specific action + quantified target]
CONFIDENCE LEVEL: [High/Medium/Low] (ACS: [X.XX])
MISSING DATA: [List of C6-C7 inputs]
ASSUMPTIONS: [Key assumptions affecting recommendation]
COMPLIANCE DISCLAIMER: [Required disclosure text]
```

### 8.11 Module 11: Audit and Compliance Layer

#### 8.11.1 Audit Trail Structure

Every analysis generates an immutable audit record:

```python
AUDIT_RECORD = {
    "analysis_id": "uuid",
    "timestamp": "ISO 8601",
    "user_id": "anonymous_or_authenticated",
    "inputs": { /* all inputs with confidence labels */ },
    "formulas_used": [ /* list of formula IDs and versions */ ],
    "lender_matrix_version": "v2025.06.15",
    "lender_matrix_source": "synthesized_from_published_guidelines",
    "calculated_metrics": { /* all 40+ metrics */ },
    "scores": { /* all 8 scores with weights */ },
    "recommendation": { /* full recommendation object */ },
    "assumptions": [ /* list of all assumptions */ ],
    "disclaimers_shown": [ /* list of compliance disclosures */ ],
    "human_review_triggered": true/false,
    "human_review_reason": "reason_if_triggered"
}
```

#### 8.11.2 Compliance Boundaries

| Rule | Implementation |
|---|---|
| **No loan approval claims** | Recommendation uses "financeable" not "approved" |
| **No investment advice** | Language is informational: "Based on provided inputs..." |
| **No guaranteed returns** | All returns labeled as "projected" or "estimated" |
| **Assumption disclosure** | Every assumption shown to user with confidence level |
| **Professional review trigger** | Complex deals, low confidence, or borderline cases flagged |
| **State licensing awareness** | System notes that DSCR loans may require licensed originator |
| **Data staleness warning** | Lender matrices older than 30 days flagged as stale |

---

## 9. Data Schema

### 9.1 Core Entities

```yaml
Property:
  property_id: UUID
  address: Address
  property_type: enum(SFR, CONDO, TOWNHOME, DUPLEX, TRIPLEX, FOURPLEX)
  units: integer(1-4)
  square_feet: integer
  year_built: integer
  condition: enum(EXCELLENT, GOOD, FAIR, POOR)
  hoa_monthly: currency
  market_rent_monthly: currency
  market_rent_source: enum(LEASE, FORM_1007, FORM_1025, COMP_ANALYSIS, USER_ESTIMATE)
  
Loan:
  loan_id: UUID
  property_id: UUID
  loan_purpose: enum(PURCHASE, RATE_TERM_REFI, CASH_OUT_REFI)
  purchase_price: currency
  loan_amount: currency
  ltv: percentage
  interest_rate: percentage
  term_years: integer
  amortization_years: integer
  interest_only_period: integer(years, 0=none)
  points: percentage
  prepay_penalty_years: integer
  prepay_penalty_type: enum(FLAT, STEP_DOWN, NONE)
  prepay_penalty_rate: percentage
  
Expenses:
  property_id: UUID
  property_tax_annual: currency
  property_tax_assessed_value: currency
  property_tax_reassessment_year: integer
  insurance_annual: currency
  insurance_trend: percentage(yearly increase)
  management_pct: percentage(of collected rent)
  repairs_annual: currency
  repairs_method: enum(PCT_OF_VALUE, PCT_OF_RENT, FIXED_DOLLAR)
  capex_annual: currency
  capex_method: enum(PCT_OF_RENT, PCT_OF_VALUE, PER_UNIT)
  utilities_monthly: currency
  other_expenses_monthly: currency
  
Borrower:
  borrower_id: UUID
  fico_score: integer(300-850)
  liquid_reserves: currency
  experience_deals: integer
  entity_type: enum(INDIVIDUAL, LLC, CORP, TRUST)
  risk_tolerance: enum(CONSERVATIVE, MODERATE, AGGRESSIVE)
  hold_period_years: integer
  target_return_pct: percentage
  
Analysis:
  analysis_id: UUID
  property_id: UUID
  loan_id: UUID
  borrower_id: UUID
  timestamp: datetime
  scenario_type: enum(BASE, CONSERVATIVE, SEVERE, CUSTOM)
  results: AnalysisResults
  scores: Scores
  recommendation: Recommendation
  audit_trail: AuditRecord
```

### 9.2 Analysis Results Schema

```yaml
AnalysisResults:
  # Core DSCR Metrics
  dscr_lender: float
  dscr_investor: float
  dscr_ncf: float
  
  # Income Metrics
  pgi_annual: currency
  vacancy_loss_annual: currency
  egi_annual: currency
  noi_annual: currency
  
  # Debt Metrics
  monthly_pitia: currency
  annual_debt_service: currency
  loan_constant: float
  
  # Return Metrics
  cap_rate: percentage
  cash_on_cash: percentage
  debt_yield: percentage
  
  # Cash Flow Metrics
  net_owner_cash_flow_monthly: currency
  net_owner_cash_flow_annual: currency
  
  # Break-Even Metrics
  break_even_rent_monthly: currency
  break_even_occupancy: percentage
  break_even_price: currency
  
  # Stress Metrics
  survival_months: integer(or "infinite")
  
  # Risk Metrics
  primary_risk: RiskCategory
  risk_factors: [RiskFactor]
```

---

## 10. Compliance Boundaries

### 10.1 Permissible Language

The engine **may** use the following language patterns:

| Permitted | Example |
|---|---|
| Calculation-based observations | "Based on the provided inputs, this property's DSCR is 1.18" |
| Conditional qualification | "This property appears to meet typical DSCR lender guidelines" |
| Risk identification | "The primary risk factor is thin cash flow reserves" |
| Comparative analysis | "Compared to market benchmarks, this expense ratio is above average" |
| Suggested verification | "We recommend verifying the rent estimate with a current lease or appraisal" |
| Educational explanation | "A DSCR below 1.0 means the property's income does not cover debt payments" |
| Disclosure of limitations | "This analysis is based on user-provided estimates and should be reviewed by a professional" |

### 10.2 Prohibited Language

The engine **must not** use the following language patterns:

| Prohibited | Example | Why |
|---|---|---|
| Absolute recommendations | "You should buy this property" | Personalized investment advice |
| Guaranteed outcomes | "This property will generate $500/month profit" | Guarantee of future performance |
| Loan approval claims | "This loan is approved" or "You qualify" | Only lenders can approve loans |
| Legal conclusions | "This structure is legal in your state" | Legal advice requires attorney |
| Tax advice | "You can deduct $X on your taxes" | Tax advice requires CPA |
| Steering | "Lender X has the best rate for you" | Loan steering without broker license |
| Unsubstantiated claims | "This is a great deal" | Opinion without calculation basis |

### 10.3 Required Disclaimers

Every analysis output must include:

> **Educational Disclosure:** This analysis is provided for educational and decision-support purposes only. It does not constitute financial, investment, tax, legal, or mortgage advice. The calculations are based on information you provided, which may include estimates and assumptions. All lending decisions are made by licensed lenders based on their own underwriting criteria. You should consult with a licensed mortgage professional, financial advisor, and/or attorney before making any investment or financing decisions. Past performance and calculated projections do not guarantee future results.

### 10.4 Human-Review Triggers

The engine triggers a human-review recommendation when any of the following conditions are met:

| Trigger | Condition | Severity |
|---|---|---|
| Low confidence | ACS < 0.4 | Mandatory |
| Complex structure | IO + cash-out + STR + entity vesting | Recommended |
| Borderline qualification | DSCR 0.95–1.05 and LTV within 2% of max | Recommended |
| Multiple critical risks | 3+ risk categories at "Critical" severity | Mandatory |
| Negative cash flow | Net Owner Cash Flow < 0 and borrower reserves < 12 months | Mandatory |
| Declared market | Property in lender-declined market | Recommended |
| First-time investor | Experience = 0 and LTV > 70% | Recommended |
| Jumbo territory | Loan amount > $1.5M | Recommended |
| Custom scenario | User-defined stress parameters outside normal ranges | Informational |

---

## 11. Validation Framework

### 11.1 Test Categories

| Category | Description | Examples |
|---|---|---|
| **Formula Tests** | Verify each formula produces correct output | DSCR = Rent/PITIA: $2000/$1800 = 1.11 |
| **Unit Tests** | Test each module in isolation | Input validation rejects negative rent |
| **Integration Tests** | Test module interactions | Lender Qualification → Investor Survival scoring consistency |
| **Regression Tests** | Ensure changes don't break existing functionality | Re-run standard deal library after code changes |
| **Edge-Case Tests** | Test boundary conditions | DSCR exactly 1.0, LTV exactly at max, zero reserves |
| **Stress Tests** | Test extreme inputs | 50% vacancy, 20% rate, $0 rent |
| **Scenario Tests** | Verify scenario modeling accuracy | Conservative scenario should reduce DSCR by expected amount |
| **Sensitivity Tests** | Verify sensitivity calculations | +1% rate should change payment by correct amount |
| **Bad-Input Tests** | Graceful handling of invalid data | Negative interest rate, LTV > 100% |
| **Missing-Data Tests** | Handling of incomplete inputs | Missing insurance should use estimate with low confidence |
| **Recommendation Tests** | Verify recommendation logic | Property with ISS < 30 must produce "Avoid" |
| **Compliance Tests** | Verify disclaimer and language rules | System must never output "approved" |

### 11.2 Test Deal Library

The validation framework includes a library of test deals covering the full spectrum:

| Deal # | Profile | Expected LQS | Expected ISS | Expected ODQ | Primary Risk |
|---|---|---|---|---|---|
| T001 | Strong: DSCR 1.35, LTV 70%, FICO 750, 12mo reserves | 95+ | 90+ | A | None |
| T002 | Good: DSCR 1.20, LTV 75%, FICO 720, 6mo reserves | 85+ | 75+ | B+ | Thin reserves |
| T003 | Borderline: DSCR 1.05, LTV 80%, FICO 680, 6mo reserves | 70+ | 55+ | C+ | Low DSCR + high LTV |
| T004 | Fragile: DSCR 1.0, LTV 75%, FICO 660, 3mo reserves | 60+ | 40+ | C | Thin reserves |
| T005 | IO Illusion: DSCR 1.25 (IO), 1.0 (amortizing) | 80+ | 45+ | C+ | IO expiration |
| T006 | Negative CF: DSCR 0.90, LTV 70%, FICO 700 | 40+ | 20+ | D | Negative cash flow |
| T007 | High Expense: DSCR 1.15, OpEx 55% of EGI | 75+ | 50+ | C | High expense ratio |
| T008 | Low Confidence: ACS 0.3, user estimates only | 50+ | 30+ | D+ | Unverified data |

### 11.3 Continuous Validation

| Check | Frequency | Responsible |
|---|---|---|
| Formula accuracy | Every code change | Automated unit tests |
| Lender matrix freshness | Weekly | System alert + manual review |
| Market data (rates, benchmarks) | Weekly | API/integration check |
| Recommendation consistency | Every release | Automated test suite |
| Compliance language | Every release | Automated + legal review |
| Score calibration | Quarterly | Data science review |

---

## 12. Implementation-Ready Pseudocode

### 12.1 Core Calculation Pipeline

```python
class DSCREngine:
    """
    Advisor-Grade DSCR Decision Engine
    Core calculation pipeline
    """
    
    def __init__(self, lender_matrix_version="2025.06"):
        self.formula_registry = FormulaRegistry()
        self.lender_matrix = LenderMatrix(version=lender_matrix_version)
        self.scenario_engine = ScenarioEngine()
        self.scoring_engine = ScoringEngine()
        self.compliance_layer = ComplianceLayer()
    
    def analyze(self, property_data, loan_data, expense_data, borrower_data, 
                scenario_type="BASE") -> AnalysisResult:
        """
        Main analysis pipeline.
        """
        # Step 1: Intake and validate
        validated = self._validate_inputs(property_data, loan_data, 
                                          expense_data, borrower_data)
        
        # Step 2: Assign confidence levels
        confidence_map = self._assign_confidence(validated)
        
        # Step 3: Standardize to monthly
        monthly = self._standardize_monthly(validated)
        
        # Step 4: Calculate base metrics (deterministic)
        base_metrics = self._calculate_base_metrics(monthly)
        
        # Step 5: Apply scenario adjustments
        scenario_metrics = self.scenario_engine.apply(
            base_metrics, scenario_type, monthly.market_conditions
        )
        
        # Step 6: Lender qualification
        lender_qual = self._evaluate_lender_qualification(
            scenario_metrics, borrower_data, loan_data
        )
        
        # Step 7: Investor survival
        investor_survival = self._evaluate_investor_survival(
            scenario_metrics, expense_data, borrower_data
        )
        
        # Step 8: Risk diagnosis
        risk_diagnosis = self._diagnose_risks(
            lender_qual, investor_survival, scenario_metrics
        )
        
        # Step 9: Breakpoint analysis
        breakpoints = self._calculate_breakpoints(
            scenario_metrics, loan_data, target_dscr=1.25
        )
        
        # Step 10: Calculate scores
        scores = self.scoring_engine.calculate(
            lender_qual, investor_survival, risk_diagnosis, 
            confidence_map, breakpoints
        )
        
        # Step 11: Generate recommendation
        recommendation = self._generate_recommendation(
            scores, risk_diagnosis, confidence_map
        )
        
        # Step 12: Compliance check
        compliant_output = self.compliance_layer.apply(
            recommendation, scores, confidence_map
        )
        
        # Step 13: Generate audit trail
        audit_record = self._generate_audit_trail(
            validated, base_metrics, scenario_metrics, scores,
            recommendation, compliant_output
        )
        
        return AnalysisResult(
            metrics=scenario_metrics,
            lender_qualification=lender_qual,
            investor_survival=investor_survival,
            risk_diagnosis=risk_diagnosis,
            breakpoints=breakpoints,
            scores=scores,
            recommendation=compliant_output,
            audit_trail=audit_record
        )
    
    def _calculate_base_metrics(self, monthly: MonthlyData) -> BaseMetrics:
        """
        Compute all base financial metrics using explicit formulas.
        """
        # Income calculations
        pgi = monthly.rent * 12
        vacancy_loss = pgi * monthly.vacancy_rate
        egi = pgi - vacancy_loss + (monthly.other_income * 12)
        
        # Operating expenses
        operating_expenses = (
            monthly.property_tax * 12 +
            monthly.insurance * 12 +
            monthly.management_fee * 12 +
            monthly.repairs * 12 +
            monthly.utilities * 12 +
            monthly.hoa * 12 +
            monthly.other_expenses * 12
        )
        
        noi = egi - operating_expenses
        
        # Debt service
        if monthly.interest_only_years > 0:
            monthly_debt_service = monthly.loan_amount * (monthly.interest_rate / 12)
        else:
            monthly_debt_service = self._amortization_payment(
                monthly.loan_amount, monthly.interest_rate, 
                monthly.amortization_years
            )
        
        annual_debt_service = monthly_debt_service * 12
        pitia = monthly_debt_service + monthly.property_tax + monthly.insurance + monthly.hoa
        
        # DSCR calculations
        dscr_lender = monthly.rent / pitia
        dscr_investor = noi / annual_debt_service if annual_debt_service > 0 else 0
        
        # CapEx reserve
        capex_reserve = monthly.rent * monthly.capex_rate * 12
        dscr_ncf = (noi - capex_reserve) / annual_debt_service if annual_debt_service > 0 else 0
        
        # Return metrics
        cap_rate = noi / monthly.purchase_price if monthly.purchase_price > 0 else 0
        equity = monthly.purchase_price - monthly.loan_amount
        cash_on_cash = (noi - annual_debt_service - capex_reserve) / equity if equity > 0 else 0
        debt_yield = noi / monthly.loan_amount if monthly.loan_amount > 0 else 0
        
        # Cash flow
        net_owner_cf_monthly = (
            monthly.rent * (1 - monthly.vacancy_rate) - pitia -
            monthly.management_fee - monthly.repairs / 12 -
            monthly.capex_rate * monthly.rent - monthly.utilities - monthly.other_expenses
        )
        
        # Break-even
        break_even_rent = pitia / (1 - monthly.vacancy_rate)
        break_even_occupancy = (operating_expenses + annual_debt_service) / pgi * 100
        
        # Survival
        if net_owner_cf_monthly >= 0:
            survival_months = float('inf')
        else:
            total_reserves = (
                borrower_data.liquid_reserves + 
                monthly.rent +  # 1 month vacancy reserve
                monthly.repairs  # repair reserve
            )
            survival_months = total_reserves / abs(net_owner_cf_monthly)
        
        return BaseMetrics(
            pgi=pgi, vacancy_loss=vacancy_loss, egi=egi, noi=noi,
            operating_expenses=operating_expenses, monthly_pitia=pitia,
            annual_debt_service=annual_debt_service,
            dscr_lender=dscr_lender, dscr_investor=dscr_investor, dscr_ncf=dscr_ncf,
            cap_rate=cap_rate, cash_on_cash=cash_on_cash, debt_yield=debt_yield,
            net_owner_cf_monthly=net_owner_cf_monthly,
            break_even_rent=break_even_rent, break_even_occupancy=break_even_occupancy,
            survival_months=survival_months
        )
```

### 12.2 Scoring Engine Pseudocode

```python
class ScoringEngine:
    """
    Computes 8 explainable scores with explicit weights.
    """
    
    SCORE_WEIGHTS = {
        "lqs": {"dscr": 0.30, "ltv": 0.25, "fico": 0.20, "reserves": 0.15, 
                "property_type": 0.05, "experience": 0.05},
        "iss": {"dscr_investor": 0.25, "cash_flow": 0.25, "survival_months": 0.20,
                "reserves": 0.15, "debt_yield": 0.10, "capex_adequacy": 0.05},
        "dfs": {"rent_sensitivity": 0.35, "expense_sensitivity": 0.30, 
                "rate_sensitivity": 0.25, "ltv_sensitivity": 0.10},
        "odq": {"iss": 0.40, "lqs": 0.25, "dfs": 0.15, "acs": 0.10, "lrs": 0.10}
    }
    
    def calculate_lqs(self, lender_qual, borrower) -> float:
        """Lender Qualification Score (0-100)"""
        dscr_score = min(lender_qual.dscr / 1.5 * 100, 100)
        ltv_score = max(0, (100 - lender_qual.ltv) / 30 * 100)
        fico_score = min((borrower.fico - 620) / 200 * 100, 100)
        reserves_score = min(borrower.liquid_reserves_months / 12 * 100, 100)
        
        weights = self.SCORE_WEIGHTS["lqs"]
        lqs = (
            dscr_score * weights["dscr"] +
            ltv_score * weights["ltv"] +
            fico_score * weights["fico"] +
            reserves_score * weights["reserves"] +
            80 * weights["property_type"] +  # baseline
            min(borrower.experience_deals / 10 * 100, 100) * weights["experience"]
        )
        return round(lqs, 1)
    
    def calculate_iss(self, metrics, borrower) -> float:
        """Investor Survival Score (0-100)"""
        dscr_score = min(metrics.dscr_investor / 1.5 * 100, 100)
        cf_score = 100 if metrics.net_owner_cf_monthly > 500 else \
                   max(0, (metrics.net_owner_cf_monthly + 500) / 1000 * 100)
        survival_score = min(metrics.survival_months / 12 * 100, 100) \
                        if metrics.survival_months != float('inf') else 100
        
        weights = self.SCORE_WEIGHTS["iss"]
        iss = (
            dscr_score * weights["dscr_investor"] +
            cf_score * weights["cash_flow"] +
            survival_score * weights["survival_months"] +
            min(borrower.liquid_reserves_months / 12 * 100, 100) * weights["reserves"] +
            min(metrics.debt_yield / 0.10 * 100, 100) * weights["debt_yield"] +
            75 * weights["capex_adequacy"]  # baseline
        )
        return round(iss, 1)
    
    def calculate_odq(self, lqs, iss, dfs, acs, lrs) -> str:
        """Overall Deal Quality (A+ to F)"""
        weights = self.SCORE_WEIGHTS["odq"]
        composite = (
            iss * weights["iss"] +
            lqs * weights["lqs"] +
            (100 - dfs) * weights["dfs"] +  # lower fragility = higher score
            acs * 100 * weights["acs"] +
            (100 - lrs) * weights["lrs"]     # lower liquidity risk = higher score
        )
        
        if composite >= 90: return "A+"
        elif composite >= 85: return "A"
        elif composite >= 80: return "A-"
        elif composite >= 75: return "B+"
        elif composite >= 70: return "B"
        elif composite >= 65: return "B-"
        elif composite >= 60: return "C+"
        elif composite >= 55: return "C"
        elif composite >= 50: return "C-"
        elif composite >= 45: return "D+"
        elif composite >= 40: return "D"
        else: return "F"
```

---

## 13. Example Deal Analysis

### 13.1 Deal Profile: Single-Family Rental in Texas

| Parameter | Value | Confidence |
|---|---|---|
| **Property** | 3BR/2BA SFR, built 2005, 1,800 sqft | C2 (user-provided) |
| **Purchase Price** | $350,000 | C1 (purchase contract) |
| **Loan Amount** | $280,000 (80% LTV) | C1 |
| **Interest Rate** | 6.49% (80% LTV pricing) | C3 (market estimate) |
| **Term** | 30 years, fully amortizing | C1 |
| **Monthly Rent** | $2,400 | C2 (lease agreement) |
| **Property Tax** | $525/month ($6,300/year) | C4 (county assessor) |
| **Insurance** | $175/month ($2,100/year) | C3 (quote estimate) |
| **HOA** | $50/month | C2 |
| **Management** | 10% of collected rent | C3 (market standard) |
| **Repairs** | $200/month | C5 (age-based estimate) |
| **CapEx Reserve** | 5% of rent ($120/month) | C5 (default) |
| **FICO** | 720 | C1 (credit report) |
| **Liquid Reserves** | $25,000 | C2 (bank statement) |
| **Experience** | 3 prior rental properties | C2 |

### 13.2 Calculation Walkthrough

**Step 1: Monthly PITIA**
- Principal & Interest: $280,000 at 6.49% for 30 years = $1,768.47
- Taxes: $525
- Insurance: $175
- HOA: $50
- **PITIA = $2,518.47**

**Step 2: Lender DSCR**
- DSCR = $2,400 / $2,518.47 = **0.95**

**Step 3: Investor DSCR (NOI Method)**
- PGI = $2,400 × 12 = $28,800
- Vacancy (7.5%) = $2,160
- EGI = $26,640
- Operating Expenses = ($525 + $175 + $50) × 12 + 10% × $26,640 + $200 × 12 + $120 × 12
- Operating Expenses = $9,000 + $2,664 + $2,400 + $1,440 = $15,504
- NOI = $26,640 − $15,504 = $11,136
- Annual Debt Service = $1,768.47 × 12 = $21,221.64
- Investor DSCR = $11,136 / $21,221.64 = **0.52**

**Step 4: Net Owner Cash Flow**
- Effective Rent = $2,400 × (1 − 0.075) = $2,220
- Less PITIA = $2,518.47
- Less Management (10% of $2,220) = $222
- Less Repairs = $200
- Less CapEx = $120
- **Net Owner CF = −$840.47/month**

**Step 5: Survival Months**
- Liquid Reserves = $25,000
- Monthly Deficit = $840.47
- **Survival Months = 29.7 months**

**Step 6: Break-Even Occupancy**
- Operating Expenses + Debt Service = $15,504 + $21,221.64 = $36,725.64
- Gross Potential Rent = $28,800
- **Break-Even Occupancy = 127.5%** (impossible—property cannot break even at current terms)

### 13.3 Engine Output Summary

| Metric | Value | Assessment |
|---|---|---|
| Lender DSCR | 0.95 | **FAIL** (minimum 1.0 for most lenders) |
| Investor DSCR | 0.52 | **DANGEROUS** |
| Net Owner Cash Flow | −$840/mo | **NEGATIVE** |
| Survival Months | 29.7 | Adequate (reserves buy time) |
| Break-Even Occupancy | 127.5% | **IMPOSSIBLE** |
| Break-Even Rent | $2,722/mo | Current rent is $322 short |
| LQS | 55 | Marginal qualification |
| ISS | 25 | Poor survival prospects |
| DFS | 85 | Highly fragile |
| ACS | 72 | Medium confidence |
| ODQ | **D** | Poor deal quality |

### 13.4 Deal Repair Analysis

To reach **Lender DSCR = 1.25**:

| Repair Option | Required Change | Impact |
|---|---|---|
| Reduce purchase price | −$70,000 (to $280,000) | LTV stays 80%, but PITIA drops |
| Reduce purchase price (better) | −$87,500 + 20% down | New price $262,500, loan $210,000 |
| Increase down payment | 28% down ($98,000) | Loan $252,000, LTV 72%, better rate |
| Increase rent | +$322/month (to $2,722) | Matches break-even rent |
| Reduce interest rate | −1.25% (to 5.24%) | May require points or better credit |
| Combination: Price −$40K + Rent +$150 | Price $310K, rent $2,550 | Multiple levers, more achievable |

**Engine Recommendation:** "FINANCEABLE BUT FRAGILE / NEEDS IMPROVEMENT. This property does not meet typical DSCR lender requirements (DSCR 0.95 < 1.0). The investor survival analysis reveals a monthly cash flow deficit of $840. With $25,000 in reserves, the property survives approximately 30 months before requiring additional capital. The most feasible repair is reducing the purchase price by approximately $70,000–$87,500 or increasing the down payment to 28%. Alternatively, if market rent supports $2,722/month (vs. current $2,400), the deal reaches break-even. Human review recommended due to negative cash flow and high fragility score."

---

## 14. Known Limitations

### 14.1 Current Limitations

| # | Limitation | Impact | Mitigation |
|---|---|---|---|
| 1 | **Lender matrices are synthesized**, not live | Actual lender terms may differ | Weekly updates, user can input actual lender quotes |
| 2 | **Market rent data requires external source** | Rent estimates may be inaccurate | Integration with rent comp APIs (CoStar, Rentometer) |
| 3 | **Property condition is user-reported** | CapEx estimates may be wrong | Photos/inspection integration in future |
| 4 | **Tax reassessment timing varies by jurisdiction** | Tax shock modeling is approximate | Jurisdiction-specific rules in future |
| 5 | **Insurance cost trends are regional** | National averages may not apply | ZIP-code-level insurance data in future |
| 6 | **No portfolio-level DSCR analysis** | Cannot evaluate cross-collateralization | Phase 2 feature |
| 7 | **No short-term rental income modeling** | AirDNA data not integrated | Phase 2 feature |
| 8 | **Scoring weights require calibration** | Initial weights are assumptions | Backtesting against actual loan performance data |
| 9 | **No machine learning for rent prediction** | Rent estimates rely on user input | ML rent prediction in future |
| 10 | **Compliance framework is U.S.-focused** | International DSCR loans not covered | Jurisdiction-specific compliance modules in future |

### 14.2 Assumptions Requiring Disclosure

The following are **engine assumptions** (not sourced facts) that must be disclosed to users:

| Assumption | Default Value | Rationale |
|---|---|---|
| Default vacancy rate | 7.5% | Midpoint of 5–10% stabilized range [^18^] |
| Default management fee | 10% | Industry standard for SFR |
| Default CapEx reserve | 5% of rent | Conservative midpoint [^18^] |
| Default repair reserve | $200/month | Age-adjusted estimate |
| Lender matrix | Synthesized from published guidelines | No single lender matrix exists |
| Scoring weights | Engineer's judgment + market data | Require calibration |
| Stress scenario parameters | ±10% rent, ±10% expenses, +1% rate | Standard stress test convention |
| Survival month threshold | 6 months minimum | Industry rule of thumb |

---

## 15. Future Innovation Roadmap

### 15.1 Phase 2: Enhanced Features (Months 3–6)

| Feature | Description | Value |
|---|---|---|
| **Live Lender API Integration** | Direct connection to 5+ DSCR lender pricing engines | Real-time, accurate qualification |
| **Rent Comp Integration** | CoStar, Rentometer, or Zillow API for market rent | C1 confidence on rent inputs |
| **Short-Term Rental Module** | AirDNA integration for STR income analysis | Fastest-growing DSCR segment |
| **Portfolio DSCR** | Cross-property analysis for multi-asset investors | 30%+ of DSCR borrowers have 3+ properties |
| **Tax Appeal Advisor** | Jurisdiction-specific tax reassessment rules | Major expense optimization |
| **Insurance Shopping** | Integration with insurance comparison APIs | Address 75% cost increase [^50^] |
| **Mobile App** | iOS/Android for field analysis | Broker/investor workflow |

### 15.2 Phase 3: Advanced Analytics (Months 6–12)

| Feature | Description | Value |
|---|---|---|
| **Predictive Default Model** | ML model trained on actual DSCR loan performance | Proactive risk identification |
| **Market Cycle Indicator** | Local market timing analysis | Avoid buying at peak |
| **Automated Sensitivity Maps** | Visual sensitivity analysis (tornado charts) | Professional presentation |
| **Document OCR** | Auto-extract data from leases, appraisals, tax bills | Reduce manual entry |
| **White-Label Broker Platform** | Branded version for mortgage brokerages | B2B revenue model |
| **Regulatory Compliance Engine** | State-by-state DSCR lending regulations | Compliance automation |

### 15.3 Phase 4: Institutional Features (Months 12–18)

| Feature | Description | Value |
|---|---|---|
| **5+ Unit Multifamily** | Full NOI-based underwriting for commercial multifamily | Expand TAM significantly |
| **Debt Yield Analysis** | Full debt yield modeling per CRE standards | Institutional lender integration |
| **Waterfall Modeling** | LP/GP waterfall for syndicated deals | Syndication market |
| **ESG Scoring** | Environmental/social/governance property factors | Institutional investor requirement |
| **API-First Architecture** | Full REST API for enterprise integration | Platform strategy |

---

## 16. Conclusion

The Advisor-Grade DSCR Decision Engine represents a fundamental advance over existing DSCR calculators. By separating lender qualification from investor survival, by applying explicit and auditable formulas, by modeling realistic stress scenarios, by solving for specific deal repairs, and by maintaining strict compliance boundaries, the engine provides decision support that is both computationally rigorous and professionally defensible.

The research phase confirmed that the DSCR loan market is growing rapidly, that existing tools create dangerous false confidence, and that the separation of qualification from survival is the single most important architectural innovation possible. The 40+ formulas, 8 scoring systems, 20+ breakthrough features, and comprehensive compliance layer defined in this specification provide a complete blueprint for implementation.

The next step is to implement the deterministic calculation prototype in Python, validate it against the test deal library, and then build the web application layer for production deployment.
