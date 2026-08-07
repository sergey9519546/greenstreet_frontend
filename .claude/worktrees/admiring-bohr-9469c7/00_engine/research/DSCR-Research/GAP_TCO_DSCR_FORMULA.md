# TCO-DSCR: Total Cost of Ownership DSCR Formula Design

> **Gap Addressed**: Standard DSCR = Rent / PITIA ignores management, maintenance, vacancy, and CapEx — creating a systematic overstatement of coverage by 20-40%.

---

## Table of Contents

1. [The Problem with Standard DSCR](#1-the-problem-with-standard-dscr)
2. [Management Cost Factors](#2-management-cost-factors)
3. [Maintenance & Repair Costs](#3-maintenance--repair-costs)
4. [CapEx Reserves](#4-capex-reserves)
5. [Vacancy & Turnover Costs](#5-vacancy--turnover-costs)
6. [TCO-DSCR Formula Design](#6-tco-dscr-formula-design)
7. [After-Tax TCO-DSCR](#7-after-tax-tco-dscr)
8. [Cost Factors by Property Type](#8-cost-factors-by-property-type)
9. [Worked Example](#9-worked-example)
10. [Implementation Notes](#10-implementation-notes)

---

## 1. The Problem with Standard DSCR

**Standard DSCR Formula:**
```
DSCR = Gross Rent / PITIA
```

Where PITIA = Principal + Interest + Taxes + Insurance + Assessments (HOA)

**The Hidden Costs Standard DSCR Ignores:**

| Hidden Cost | Typical Range (% of Rent) | Impact on DSCR |
|---|---|---|
| Property Management | 8–12% | 0.08–0.12× reduction |
| Maintenance & Repairs | 5–10% | 0.05–0.10× reduction |
| CapEx Reserves | 3–7% | 0.03–0.07× reduction |
| Vacancy & Turnover | 5–10% | 0.05–0.10× reduction |
| **Total Above PITIA** | **21–39%** | **Massive** |

A property showing DSCR of 1.25 under the standard formula may actually be 0.95–1.05 under TCO-DSCR — below the 1.0 breakeven threshold.

**Real-World Example of the Gap:**
- Rent: $2,500/mo, PITIA: $2,000/mo → Standard DSCR = 1.25
- But hidden costs: ~$550/mo (22% of rent) → True coverage = $2,500 / $2,550 = **0.98** (NEGATIVE CASH FLOW)

---

## 2. Management Cost Factors

### 2.1 Typical Management Fees by Property Type

| Property Type | Monthly Fee (% of Rent) | Typical Range | Notes |
|---|---|---|---|
| **SFR (Single Family)** | 8–10% | 7–12% | Higher % on lower-rent SFRs; some PMs charge flat $100–150/mo minimum |
| **2–4 Unit (Small Multifamily)** | 6–9% | 5–10% | Slight discount for scale; some PMs charge per unit |
| **5–10 Unit** | 5–8% | 4–9% | Economies of scale; often negotiable at 7+ units |
| **10+ Unit** | 4–6% | 3–7% | Commercial PM contracts; may include on-site manager |
| **Condotel / Short-Term Rental** | 20–30% | 15–40% | Includes booking, turnover, guest communication, dynamic pricing |

**Sources**: IREM Income/Expense Analysis Reports; NAR Property Management Survey; All Property Management annual fee survey; BiggerPockets community data.

### 2.2 Additional Management Fees (Often Overlooked)

| Fee Type | Typical Amount | Frequency | Notes |
|---|---|---|---|
| **Lease-Up / Tenant Placement** | 50–100% of 1 month rent | Per new tenant | Some charge 75–100% for first tenant, 50% for replacements |
| **Lease Renewal Fee** | $200–$500 or 25–50% of 1 month | Per renewal | Often waived for self-managed; incentivizes turnover |
| **Vacancy Fee** | $0–$200/mo | While vacant | Some PMs charge this; most do not |
| **Maintenance Coordination Fee** | 10–20% of invoice | Per work order | Markup on vendor costs; some include in base fee |
| **Eviction Fee** | $500–$1,500 + costs | Per eviction | Legal fees additional |
| **Inspection Fee** | $150–$350 | Semi-annually | Move-in/move-out + periodic inspections |
| **Accounting/Reporting Fee** | $0–$50/mo | Monthly | Often included; some charge separately |

**Annualized Impact of Ancillary Fees**: For a typical SFR with 2-year average tenant stay, the lease-up fee alone adds ~2–4% effective cost on top of the monthly management percentage.

### 2.3 Self-Managed Implicit Cost

Self-managed landlords often assume $0 management cost. This is incorrect:

| Time Commitment | Monthly Hours | Implicit Cost (@ $30–50/hr) | Effective % (on $2,500 rent) |
|---|---|---|---|
| Tenant communication | 2–4 hrs | $60–$200 | 2.4–8.0% |
| Maintenance coordination | 1–3 hrs | $30–$150 | 1.2–6.0% |
| Bookkeeping/admin | 1–2 hrs | $30–$100 | 1.2–4.0% |
| Lease-up (amortized) | 0.5–1 hr | $15–$50 | 0.6–2.0% |
| **Total Self-Managed** | **4.5–10 hrs** | **$135–$500** | **5.4–20%** |

**Recommendation for TCO-DSCR**: Use a minimum 5% implicit management factor for self-managed properties to account for owner labor opportunity cost. This prevents self-managed properties from appearing artificially stronger.

---

## 3. Maintenance & Repair Costs

### 3.1 Maintenance Budget by Percentage

| Source / Rule of Thumb | Percentage of Rent | Notes |
|---|---|---|
| **1% Rule** (of property value) | Varies by rent yield | On $350K at $2,500/mo rent: $292/mo = 11.7% |
| **5% of Rent** (conservative) | 5% | For newer properties under warranty |
| **BiggerPockets consensus** | 5–8% | For average-condition properties |
| **$1/sqft/year rule** | Varies | On 1,500 sf: $125/mo = 5% of $2,500 rent |
| **Industry standard (BPO)** | 5–10% | Varies by age, condition, climate |

### 3.2 Maintenance Cost by Property Age

| Property Age | Annual Maintenance (% of rent) | Key Drivers |
|---|---|---|
| **0–5 years** | 3–5% | Warranty coverage, minimal wear |
| **5–15 years** | 5–8% | First round of appliance/HVAC issues |
| **15–30 years** | 8–12% | Roof, HVAC, plumbing approaching end-of-life |
| **30+ years** | 10–15% | Systemic issues, code updates, chronic repairs |

### 3.3 SFR vs Multifamily Maintenance Differences

| Factor | SFR | 2–4 Unit | 5–10 Unit |
|---|---|---|---|
| Exterior per unit | Higher (full roof, yard) | Shared walls, roof | Shared systems, lower per-unit |
| Plumbing per unit | Individual systems | Some shared | Centralized systems |
| Common areas | N/A | Minimal | Hallways, laundry, parking |
| Landscaping | Tenant or owner | Owner typically | Professional contract |
| **Effective % of Rent** | 7–10% | 6–9% | 5–8% |

### 3.4 Common Repair Costs & Frequency

| Item | Typical Cost | Frequency | Annualized Cost |
|---|---|---|---|
| Plumbing repair | $150–$500 | 1–2x/year | $150–$1,000 |
| Electrical repair | $150–$400 | 0.5–1x/year | $75–$400 |
| Appliance repair | $100–$300 | 1x/year | $100–$300 |
| HVAC service/repair | $150–$600 | 0.5–1x/year | $75–$600 |
| Exterior/painting (partial) | $500–$2,000 | Every 3–5 years | $100–$667/yr |
| Pest control | $100–$300 | 1–2x/year | $100–$600 |
| General handyman | $200–$500 | 2–4x/year | $400–$2,000 |

---

## 4. CapEx Reserves

### 4.1 CapEx Reserve Percentage

| Approach | % of Rent | Notes |
|---|---|---|
| **Conservative** | 5–7% | Older properties, harsh climates |
| **Standard** | 3–5% | Average properties |
| **Aggressive** | 2–3% | New construction, warranties |

**Important**: CapEx is NOT the same as maintenance. Maintenance = routine upkeep. CapEx = major system replacement that extends life or adds value. Both must be budgeted.

### 4.2 Major System Replacement Costs & Timelines

| System | Typical Replacement Cost | Useful Life (years) | Annualized Cost | Monthly Reserve |
|---|---|---|---|---|
| **Roof (asphalt shingle)** | $8,000–$15,000 | 20–25 | $320–$750 | $27–$63 |
| **Roof (metal/flat)** | $12,000–$25,000 | 30–50 | $240–$833 | $20–$69 |
| **HVAC (central)** | $5,000–$12,000 | 15–20 | $250–$800 | $21–$67 |
| **Water Heater** | $1,000–$3,000 | 10–15 | $67–$300 | $6–$25 |
| **Appliances (kitchen pkg)** | $2,000–$5,000 | 10–15 | $133–$500 | $11–$42 |
| **Flooring** | $3,000–$8,000 | 10–20 | $150–$800 | $13–$67 |
| **Plumbing (repiping)** | $4,000–$10,000 | 30–50 | $80–$333 | $7–$28 |
| **Electrical panel/upgrade** | $2,000–$5,000 | 25–40 | $50–$200 | $4–$17 |
| **Siding/Paint (exterior)** | $5,000–$15,000 | 10–15 | $333–$1,500 | $28–$125 |
| **Driveway/Walkway** | $2,000–$6,000 | 20–30 | $67–$300 | $6–$25 |
| **Windows** | $3,000–$10,000 | 20–30 | $100–$500 | $8–$42 |

### 4.3 Annualizing CapEx into Monthly Cost

**Method: Per-System Annualization**

```
Monthly_CapEx_Reserve = Σ (Replacement_Cost_i / Useful_Life_i) / 12
```

For each major system `i`:
- `Replacement_Cost_i` = current cost to replace the system
- `Useful_Life_i` = expected remaining useful life in years
- Sum all systems, divide by 12 for monthly

**Example for a 15-year-old SFR:**

| System | Replacement Cost | Remaining Life | Annual Reserve | Monthly |
|---|---|---|---|---|
| Roof | $12,000 | 8 years | $1,500 | $125 |
| HVAC | $8,000 | 5 years | $1,600 | $133 |
| Water Heater | $2,000 | 3 years | $667 | $56 |
| Appliances | $3,500 | 5 years | $700 | $58 |
| Flooring | $5,000 | 8 years | $625 | $52 |
| Exterior Paint | $6,000 | 3 years | $2,000 | $167 |
| **Total** | | | **$7,092/yr** | **$591/mo** |

At $2,500/mo rent: $591 / $2,500 = **23.6%** for an aging property — far above the 3-7% rule of thumb.

**Simplified Percentage Method (for modeling):**

```
Monthly_CapEx = Gross_Rent × CapEx_Rate
```

Where `CapEx_Rate` is drawn from the property type table (Section 8). Use per-system annualization for precision on individual property analysis; use percentage method for portfolio-level modeling.

---

## 5. Vacancy & Turnover Costs

### 5.1 Average Vacancy Rate by Property Type and Market

| Property Type | National Avg | Low-Demand Market | High-Demand Market | Notes |
|---|---|---|---|---|
| **SFR** | 5–7% | 8–12% | 2–4% | Lower turnover; longer leases |
| **2–4 Unit** | 6–8% | 10–14% | 3–5% | More turnover than SFR |
| **5–10 Unit** | 7–9% | 10–15% | 4–6% | Always some unit turning |
| **Condotel/STR** | 15–30% | 25–40% | 10–20% | Seasonal; measured differently |

**Sources**: US Census Bureau Housing Vacancy Survey; NAA (National Apartment Association) Survey; Moody's Analytics REIS; BiggerPockets market data.

### 5.2 Turnover Cost Per Unit

| Turnover Item | Low Estimate | High Estimate | Notes |
|---|---|---|---|
| Painting (full interior) | $1,500 | $3,500 | Depends on size, quality |
| Deep cleaning | $200 | $500 | |
| Carpet cleaning/replacement | $200 | $1,500 | Clean vs replace |
| Minor repairs | $300 | $1,000 | Patch walls, fix doors |
| Appliance replacement | $0 | $2,000 | If needed |
| Landscaping/curb appeal | $100 | $500 | |
| **Total Turnover Cost** | **$2,300** | **$9,000** | **$3,000–$5,000 typical** |

### 5.3 Lost Rent During Turnover

| Market Type | Days Vacant | Lost Rent (at $2,500/mo) |
|---|---|---|
| Hot market | 14–21 days | $1,167–$1,750 |
| Normal market | 21–45 days | $1,750–$3,750 |
| Slow market | 45–90 days | $3,750–$7,500 |

### 5.4 Annualizing Vacancy into Monthly Cost

**Method 1: Percentage of Gross Rent**
```
Vacancy_Rate = Average_Annual_Vacancy / 12  (monthly rate)
Monthly_Vacancy_Loss = Gross_Rent × Vacancy_Rate
```

Example: 7% annual vacancy rate → Monthly_Vacancy_Loss = $2,500 × 0.07 = **$175/mo**

**Method 2: Turnover-Adjusted Annualization**
```
Avg_Months_Between_Turnovers = 24  (typical 2-year tenant stay)
Turnover_Cost_Per_Event = $4,000
Lost_Rent_Per_Event = 1.5 months × $2,500 = $3,750
Total_Turnover_Cost = $4,000 + $3,750 = $7,750

Annual_Turnover_Cost = $7,750 / 2 = $3,875/yr = $323/mo
```

At $2,500/mo rent: $323 / $2,500 = **12.9%** — notably higher than the simple vacancy percentage method.

**Recommendation**: Use the **higher** of Method 1 (vacancy rate) and Method 2 (turnover-adjusted) for conservative modeling. For the TCO-DSCR formula default, use the turnover-adjusted method as it captures both lost rent AND the cost of making the unit rentable again.

---

## 6. TCO-DSCR Formula Design

### 6.1 Why a Hybrid Approach is Best

Three candidate formulations were evaluated:

**Option A: Additive to PITIA**
```
TCO-DSCR = Gross Rent / (PITIA + Mgmt + Maint + CapEx + Vacancy)
```
- Pro: Intuitive, extends familiar DSCR formula
- Con: Mixes debt service (fixed) with operating costs (variable); doesn't align with commercial real estate NOI methodology

**Option B: NOI-Based (Commercial Standard)**
```
NOI = Gross Rent - Mgmt - Maint - CapEx - Vacancy - Insurance - Taxes
TCO-DSCR = NOI / Debt_Service (P&I only)
```
- Pro: Aligns with institutional CRE underwriting (NOI / DS)
- Con: Restructures the familiar PITIA denominator; requires separating P&I from T&I

**Option C: Hybrid TCO-DSCR (RECOMMENDED)**
```
TCO_OpEx = Management + Maintenance + CapEx_Reserve + Vacancy_Loss
TCO_Denominator = PITIA + TCO_OpEx
TCO-DSCR = Gross Rent / TCO_Denominator
```

### 6.2 The Recommended Formula

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  TCO-DSCR = Gross Rent / (PITIA + TCO_OpEx)               │
│                                                             │
│  Where:                                                     │
│    PITIA = P&I + Taxes + Insurance + HOA/Assessments       │
│    TCO_OpEx = Mgmt + Maint + CapEx + Vacancy               │
│                                                             │
│  Expanded:                                                  │
│    TCO-DSCR = Gross_Rent /                                  │
│      (PITIA                                                 │
│       + Gross_Rent × Mgmt_Rate                              │
│       + Gross_Rent × Maint_Rate                             │
│       + Gross_Rent × CapEx_Rate                             │
│       + Gross_Rent × Vacancy_Rate)                          │
│                                                             │
│  Simplified:                                                │
│    TCO-DSCR = 1 / (PITIA/Rent + TCO_Rate)                  │
│    where TCO_Rate = Mgmt_Rate + Maint_Rate + CapEx_Rate    │
│                     + Vacancy_Rate                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Why the Hybrid is Best

| Criterion | Option A (Additive) | Option B (NOI) | Option C (Hybrid) ✓ |
|---|---|---|---|
| Backward compatible with DSCR | ✓✓✓ | ✗ | ✓✓✓ |
| Aligns with CRE underwriting | ✗ | ✓✓✓ | ✓✓ |
| Intuitive for residential investors | ✓✓✓ | ✗ | ✓✓✓ |
| Captures all ownership costs | ✓✓ | ✓✓✓ | ✓✓✓ |
| Easy to implement in calculators | ✓✓✓ | ✓✓ | ✓✓✓ |
| Lender familiarity | ✓✓ | ✓✓ | ✓✓ |

### 6.4 Additional Derived Metrics

**TCO Coverage Gap** — How much standard DSCR overstates coverage:
```
TCO_Gap = Standard_DSCR - TCO_DSCR
TCO_Gap_Pct = (Standard_DSCR - TCO_DSCR) / Standard_DSCR × 100
```

**Break-Even Rent** — Minimum rent to achieve TCO-DSCR = 1.0:
```
Break_Even_Rent = PITIA / (1 - TCO_Rate)
```

**Maximum Supportable Loan** — Given rent and TCO-DSCR target:
```
Max_Debt_Service = Gross_Rent × (1 - TCO_Rate) / Target_TCO_DSCR
Max_Loan = Max_Debt_Service × PV_Annuity_Factor(rate, term)
```

**NOI Equivalent** — For those who think in commercial terms:
```
TCO_NOI = Gross_Rent × (1 - TCO_Rate) - Taxes - Insurance - HOA
TCO_DSCR_NOI = TCO_NOI / (P&I)
```
(This will yield the same ratio as the hybrid formula.)

---

## 7. After-Tax TCO-DSCR

### 7.1 How Depreciation Affects After-Tax Cash Flow

Rental property depreciation allows investors to deduct a portion of the property's value (excluding land) over 27.5 years (residential) or 39 years (commercial):

```
Annual_Depreciation = (Purchase_Price - Land_Value) / 27.5
```

**Tax Shield Calculation:**
```
Taxable_Income = Gross_Rent - PITIA - TCO_OpEx - Depreciation
Tax_Shield = Depreciation × Marginal_Tax_Rate
```

If taxable income is negative (common in early years due to depreciation), the loss can:
1. Offset other passive income (if active participant, up to $25K/yr)
2. Be carried forward to offset future gains
3. Be used against ordinary income for real estate professionals

### 7.2 Cost Segregation: Enhanced Year 1 Depreciation

Cost segregation accelerates depreciation by reclassifying components into shorter-life categories:

| Component Category | Useful Life | Typical % of Property | Example ($350K property, $280K depreciable) |
|---|---|---|---|
| 5-year property | 5 years | 5–15% | Carpeting, appliances, decorative fixtures: $14K–$42K |
| 7-year property | 7 years | 5–10% | Furniture, specialty fixtures: $14K–$28K |
| 15-year property | 15 years | 5–15% | Landscaping, parking, sidewalks: $14K–$42K |
| 27.5-year property | 27.5 years | 60–85% | Structure, roof, plumbing, electrical: $168K–$238K |

**Year 1 Bonus Depreciation** (current law):
- 2024: 60% bonus depreciation (deduct 60% of segregated component costs in Year 1)
- 2025: 40% bonus depreciation
- 2026: 20% bonus depreciation
- 2027+: 0% bonus depreciation (unless extended by Congress)

**Cost Segregation Example ($350K purchase, $280K depreciable):**

| Without Segregation | With Segregation (Year 1) |
|---|---|
| Annual depreciation: $280K / 27.5 = $10,182/yr | 5-yr ($28K × 60% bonus) = $16,800 |
| | 7-yr ($21K × 60% bonus) = $12,600 |
| | 15-yr ($28K × 60% bonus) = $16,800 |
| | 27.5-yr ($203K / 27.5) = $7,382 |
| | **Year 1 Total: $53,582** |
| | **vs. standard $10,182 — 5.3× more depreciation** |

### 7.3 Tax Bracket Assumptions

For modeling purposes:

| Income Level | Marginal Rate | Effective Rate | Common For |
|---|---|---|---|
| Moderate income | 22% | ~15% | W-2 earners $44K–$95K |
| Upper middle | 24% | ~18% | W-2 earners $95K–$182K |
| High income | 32% | ~22% | $182K–$231K |
| Very high | 35–37% | ~25% | $231K+ |
| **Recommended default** | **24%** | | Most DSCR investors |

### 7.4 After-Tax TCO-DSCR Formula

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  After_Tax_TCO-DSCR = After_Tax_Cash_Flow_Available / P&I          │
│                                                                      │
│  Where:                                                              │
│    Pre_Tax_Cash_Flow = Gross_Rent - PITIA - TCO_OpEx               │
│    Taxable_Income = Pre_Tax_Cash_Flow - Depreciation                │
│    Tax = max(Taxable_Income, 0) × Marginal_Rate                    │
│    Tax_Savings = max(-Taxable_Income, 0) × Marginal_Rate           │
│    After_Tax_Cash_Flow = Pre_Tax_Cash_Flow - Tax + Tax_Savings     │
│                                                                      │
│  Simplified (when depreciation > pre-tax cash flow, typical):       │
│    After_Tax_Cash_Flow = Pre_Tax_Cash_Flow + (Depreciation          │
│                          - Pre_Tax_Cash_Flow) × Marginal_Rate       │
│    = Pre_Tax_Cash_Flow × (1 - Marginal_Rate)                       │
│      + Depreciation × Marginal_Rate                                 │
│                                                                      │
│  After_Tax_TCO-DSCR = After_Tax_Cash_Flow / P&I                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Note**: When `Taxable_Income < 0` (negative, which is common), the investor gets a tax refund/savings, which INCREASES after-tax cash flow. This means:

```
After_Tax_TCO-DSCR ≥ Pre_Tax_TCO-DSCR (when depreciation creates tax losses)
```

This is the "depreciation subsidy" that makes real estate investing viable even when pre-tax TCO-DSCR < 1.0.

### 7.5 Depreciation Recapture Warning

When the property is sold, depreciation is "recaptured" at 25% (not the investor's ordinary rate). This creates a deferred tax liability:

```
Recapture_Tax = Total_Depreciation_Taken × 25%
```

**TCO-DSCR does NOT account for recapture** — it measures ongoing cash flow coverage, not lifetime return. Recapture should be addressed in total return analysis, not DSCR.

---

## 8. Cost Factors by Property Type

### 8.1 Default TCO Rate Table

| Cost Factor | SFR | 2–4 Unit | 5–10 Unit | Condotel/STR | Source Basis |
|---|---|---|---|---|---|
| **Management** | 8% | 7% | 6% | 25% | IREM, NAR PM surveys |
| **Maintenance** | 8% | 7% | 6% | 10% | BP consensus, 1% rule calibrated |
| **CapEx Reserve** | 5% | 5% | 4% | 8% | Per-system annualization averages |
| **Vacancy + Turnover** | 7% | 8% | 9% | 20% | Census, NAA, turnover-adjusted |
| **Total TCO Rate** | **28%** | **27%** | **25%** | **63%** | Sum of above |

### 8.2 Age-Adjusted Factors

| Property Age | Maintenance Adj | CapEx Adj | Combined TCO Adj |
|---|---|---|---|
| New (0–5 yr) | -3% | -2% | -5% |
| Average (5–15 yr) | 0% | 0% | 0% |
| Aging (15–30 yr) | +3% | +2% | +5% |
| Old (30+ yr) | +5% | +4% | +9% |

**Apply adjustment to base TCO Rate:**
```
Adjusted_TCO_Rate = Base_TCO_Rate + Age_Adjustment
```

### 8.3 Market-Adjusted Vacancy

| Market Type | Vacancy Adjustment |
|---|---|
| High demand (rent growth > 5%) | -2% |
| Normal demand | 0% |
| Low demand (rent decline) | +3% |
| Recession/stress scenario | +5% |

### 8.4 Complete Adjusted TCO Rate Formula

```
Final_TCO_Rate = Base_TCO_Rate + Age_Adjustment + Market_Adjustment
```

**Range of realistic TCO rates:**

| Scenario | SFR | 2–4 Unit | 5–10 Unit | Condotel |
|---|---|---|---|---|
| Optimistic (new, hot market) | 21% | 20% | 18% | 53% |
| Base case | 28% | 27% | 25% | 63% |
| Pessimistic (old, slow market) | 36% | 35% | 33% | 72% |
| Stress test (old, recession) | 38% | 37% | 35% | 75% |

---

## 9. Worked Example

### 9.1 Property Parameters

| Parameter | Value |
|---|---|
| Purchase Price | $350,000 |
| Land Value (20%) | $70,000 |
| Depreciable Basis | $280,000 |
| Monthly Gross Rent | $2,500 |
| Annual Gross Rent | $30,000 |
| Loan Amount | $280,000 (80% LTV) |
| Interest Rate | 7.0% |
| Loan Term | 30 years |
| Monthly P&I | $1,862.62 |
| Monthly Property Tax | $350.00 |
| Monthly Insurance | $200.00 |
| Monthly HOA | $0.00 |
| Property Type | SFR, 15 years old, normal market |

### 9.2 PITIA Calculation

| Component | Monthly | Annual |
|---|---|---|
| Principal & Interest | $1,862.62 | $22,351.44 |
| Property Taxes | $350.00 | $4,200.00 |
| Insurance | $200.00 | $2,400.00 |
| HOA | $0.00 | $0.00 |
| **PITIA** | **$2,412.62** | **$28,951.44** |

### 9.3 Standard DSCR

```
Standard DSCR = Gross Rent / PITIA
              = $2,500 / $2,412.62
              = 1.036
```

**This looks like barely positive cash flow.** But we're ignoring $700+/month in hidden costs...

### 9.4 TCO-DSCR Calculation

**Using SFR base rates (no age/market adjustment):**

| TCO Component | Rate | Monthly Cost | Annual Cost |
|---|---|---|---|
| Management | 8% | $200.00 | $2,400.00 |
| Maintenance | 8% | $200.00 | $2,400.00 |
| CapEx Reserve | 5% | $125.00 | $1,500.00 |
| Vacancy + Turnover | 7% | $175.00 | $2,100.00 |
| **Total TCO OpEx** | **28%** | **$700.00** | **$8,400.00** |

```
TCO Denominator = PITIA + TCO_OpEx
                = $2,412.62 + $700.00
                = $3,112.62

TCO-DSCR = $2,500 / $3,112.62
         = 0.803
```

**TCO-DSCR = 0.803 — This property is LOSING $612.62/month after all ownership costs.**

### 9.5 After-Tax TCO-DSCR

**Tax Parameters:**
- Marginal Tax Rate: 24%
- Annual Depreciation: $280,000 / 27.5 = $10,181.82/yr = $848.48/mo

**Pre-Tax Cash Flow:**
```
Pre_Tax_CF = Gross_Rent - PITIA - TCO_OpEx
           = $2,500 - $2,412.62 - $700.00
           = -$612.62/mo
           = -$7,351.44/yr
```

**Taxable Income:**
```
Taxable_Income = Pre_Tax_CF - Depreciation
               = -$7,351.44 - $10,181.82
               = -$17,533.26/yr
```

Taxable income is **negative** — investor gets a tax loss.

**Tax Savings:**
```
Tax_Savings = |-17,533.26| × 0.24 = $4,207.98/yr = $350.67/mo
```

(Assuming full ability to use the passive loss — requires active participation or RE professional status)

**After-Tax Cash Flow:**
```
After_Tax_CF = Pre_Tax_CF + Tax_Savings
             = -$7,351.44 + $4,207.98
             = -$3,143.46/yr
             = -$261.95/mo
```

**After-Tax TCO-DSCR:**
```
After_Tax_TCO-DSCR = (P&I + After_Tax_CF_Available) / P&I

Wait — we need to express this correctly.

After_Tax_Cash_Available_for_Debt_Service = After_Tax_CF + P&I
    (because P&I was already deducted in Pre_Tax_CF)

= -$3,143.46 + $22,351.44 = $19,208.00/yr

After_Tax_TCO-DSCR = $19,208.00 / $22,351.44 = 0.859

OR equivalently, using the formula from Section 7.4:

After_Tax_TCO-DSCR = After_Tax_CF_Available / P&I
where After_Tax_CF_Available = Pre_Tax_CF + Depreciation × Marginal_Rate + P&I
```

Let me recalculate more clearly:

**Alternative formulation (more standard):**
```
After_Tax_CF = Pre_Tax_CF + Tax_Savings
             = -$612.62 + $350.67 = -$261.95/mo

This means the investor still pays $261.95/mo out of pocket after tax benefits.
```

**After-Tax TCO-DSCR:**
```
After_Tax_TCO-DSCR = (Gross_Rent - TCO_OpEx - Taxes - Insurance - HOA - Tax) / P&I

= ($2,500 - $700.00 - $350.00 - $200.00 - $0 + $350.67) / $1,862.62
= $1,600.67 / $1,862.62
= 0.859
```

### 9.6 Summary Comparison

| Metric | Value | Monthly Surplus/(Deficit) | Interpretation |
|---|---|---|---|
| **Standard DSCR** | **1.036** | +$87.38 | Appears cash-flow positive |
| **TCO-DSCR** | **0.803** | -$612.62 | Actually losing money pre-tax |
| **After-Tax TCO-DSCR** | **0.859** | -$261.95 | Still negative after tax shield |
| **TCO Coverage Gap** | **0.233** | — | Standard DSCR overstates by 22.5% |

### 9.7 What Rent Would Be Needed for TCO-DSCR = 1.0?

```
Break_Even_Rent = PITIA / (1 - TCO_Rate)
                = $2,412.62 / (1 - 0.28)
                = $2,412.62 / 0.72
                = $3,350.86/mo
```

**The property needs $850/mo MORE in rent (34% increase) to truly break even.**

### 9.8 What Loan Amount Would Make TCO-DSCR = 1.25?

```
Max_P&I = Gross_Rent × (1 - TCO_Rate) / Target_TCO_DSCR
        = $2,500 × 0.72 / 1.25
        = $1,440.00/mo

Max_Loan = $1,440.00 × PV_annuity(7%, 30yr)
         = $1,440.00 × 150.31  [PV factor for 7%, 30yr]
         = $216,446
```

Instead of an $280K loan (80% LTV), the investor can only support ~$216K (62% LTV) for a TCO-DSCR of 1.25.

---

## 10. Implementation Notes

### 10.1 Implementation in Code

```typescript
interface TCO_DSCR_Input {
  grossRent: number;
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  propertyType: 'SFR' | 'SMALL_MULTI' | 'MED_MULTI' | 'CONDOTEL';
  propertyAge: 'NEW' | 'AVERAGE' | 'AGING' | 'OLD';
  marketType: 'HOT' | 'NORMAL' | 'SLOW' | 'STRESS';
  isSelfManaged: boolean;
  marginalTaxRate: number;
  annualDepreciation: number;
}

interface TCO_DSCR_Result {
  standardDSCR: number;
  tcoDSCR: number;
  afterTaxTCO_DSCR: number;
  tcoGap: number;
  tcoGapPercent: number;
  breakEvenRent: number;
  monthlyDeficit: number;
  afterTaxMonthlyDeficit: number;
  tcoComponents: {
    management: number;
    maintenance: number;
    capex: number;
    vacancy: number;
    totalTCO_OpEx: number;
  };
}

// Base TCO rates by property type
const BASE_TCO_RATES = {
  SFR:         { management: 0.08, maintenance: 0.08, capex: 0.05, vacancy: 0.07 },
  SMALL_MULTI: { management: 0.07, maintenance: 0.07, capex: 0.05, vacancy: 0.08 },
  MED_MULTI:   { management: 0.06, maintenance: 0.06, capex: 0.04, vacancy: 0.09 },
  CONDOTEL:    { management: 0.25, maintenance: 0.10, capex: 0.08, vacancy: 0.20 },
};

// Age adjustments
const AGE_ADJUSTMENTS = {
  NEW:     { maintenance: -0.03, capex: -0.02 },
  AVERAGE: { maintenance:  0.00, capex:  0.00 },
  AGING:   { maintenance: +0.03, capex: +0.02 },
  OLD:     { maintenance: +0.05, capex: +0.04 },
};

// Market adjustments (to vacancy)
const MARKET_ADJUSTMENTS = {
  HOT:    -0.02,
  NORMAL:  0.00,
  SLOW:   +0.03,
  STRESS: +0.05,
};

function calculateTCO_DSCR(input: TCO_DSCR_Input): TCO_DSCR_Result {
  const { grossRent, principalAndInterest, propertyTax, insurance, hoa,
          propertyType, propertyAge, marketType, isSelfManaged,
          marginalTaxRate, annualDepreciation } = input;

  // 1. Calculate PITIA
  const pitia = principalAndInterest + propertyTax + insurance + hoa;

  // 2. Get base rates
  const baseRates = BASE_TCO_RATES[propertyType];
  const ageAdj = AGE_ADJUSTMENTS[propertyAge];
  const marketAdj = MARKET_ADJUSTMENTS[marketType];

  // 3. Calculate adjusted rates
  const managementRate = isSelfManaged
    ? Math.min(baseRates.management, 0.05)  // Cap self-managed at 5% implicit cost
    : baseRates.management;

  const maintenanceRate = baseRates.maintenance + ageAdj.maintenance;
  const capexRate = baseRates.capex + ageAdj.capex;
  const vacancyRate = Math.max(baseRates.vacancy + marketAdj, 0.02); // Floor at 2%

  const tcoRate = managementRate + maintenanceRate + capexRate + vacancyRate;

  // 4. Calculate monthly TCO components
  const management = grossRent * managementRate;
  const maintenance = grossRent * maintenanceRate;
  const capex = grossRent * capexRate;
  const vacancy = grossRent * vacancyRate;
  const totalTCO_OpEx = management + maintenance + capex + vacancy;

  // 5. Standard DSCR
  const standardDSCR = grossRent / pitia;

  // 6. TCO-DSCR
  const tcoDenominator = pitia + totalTCO_OpEx;
  const tcoDSCR = grossRent / tcoDenominator;

  // 7. After-Tax TCO-DSCR
  const preTaxCF = grossRent - pitia - totalTCO_OpEx;
  const monthlyDepreciation = annualDepreciation / 12;
  const taxableIncome = preTaxCF - monthlyDepreciation;
  const taxSavings = Math.max(-taxableIncome, 0) * marginalTaxRate;
  const taxOwed = Math.max(taxableIncome, 0) * marginalTaxRate;
  const afterTaxCF = preTaxCF + taxSavings - taxOwed;

  // After-tax cash available for debt service = afterTaxCF + P&I
  // (because P&I was already subtracted in preTaxCF via PITIA)
  const afterTaxCFAvailable = afterTaxCF + principalAndInterest;
  const afterTaxTCO_DSCR = afterTaxCFAvailable / principalAndInterest;

  // 8. Derived metrics
  const tcoGap = standardDSCR - tcoDSCR;
  const tcoGapPercent = (tcoGap / standardDSCR) * 100;
  const breakEvenRent = pitia / (1 - tcoRate);

  return {
    standardDSCR: round4(standardDSCR),
    tcoDSCR: round4(tcoDSCR),
    afterTaxTCO_DSCR: round4(afterTaxTCO_DSCR),
    tcoGap: round4(tcoGap),
    tcoGapPercent: round2(tcoGapPercent),
    breakEvenRent: round2(breakEvenRent),
    monthlyDeficit: round2(preTaxCF),
    afterTaxMonthlyDeficit: round2(afterTaxCF),
    tcoComponents: {
      management: round2(management),
      maintenance: round2(maintenance),
      capex: round2(capex),
      vacancy: round2(vacancy),
      totalTCO_OpEx: round2(totalTCO_OpEx),
    },
  };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }
```

### 10.2 DSCR Lender Thresholds — TCO-Adjusted

| Lender Standard DSCR Threshold | Equivalent TCO-DSCR (at 28% TCO rate) | Effective Implication |
|---|---|---|
| 1.00 (breakeven) | 0.72 | Actually cash-flow negative |
| 1.20 | 0.86 | Still losing money |
| 1.25 | 0.90 | Barely covering with tax benefits |
| 1.50 | 1.08 | First truly positive after all costs |
| 1.75 | 1.26 | Comfortable coverage |
| 2.00 | 1.44 | Strong coverage |

**Conversion formula:**
```
TCO_DSCR_equivalent = Standard_DSCR × (1 - TCO_Rate)
```

This means lenders requiring DSCR ≥ 1.25 are actually requiring TCO-DSCR ≥ 0.90 — **the property still loses money on a total-cost basis.**

### 10.3 When TCO-DSCR < 1.0 But Investment Still Makes Sense

TCO-DSCR < 1.0 does NOT automatically mean a bad investment. It means:

1. **Negative monthly cash flow** — investor must subsidize from other income
2. **But total return may still be positive** when including:
   - Principal paydown (equity accumulation)
   - Appreciation (historical 3–5%/yr)
   - Tax benefits (depreciation, deductions)
   - Leverage amplification on appreciation

**Total Return Framework** (for future development):
```
Total_Return = Cash_Flow + Principal_Paydown + Appreciation + Tax_Benefits
IRR = Solve for rate where NPV of all cash flows (including sale) = 0
```

TCO-DSCR isolates the **cash flow** component. A complete investment analysis requires IRR or NPV calculations that include all return components.

### 10.4 Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| CapEx as operating expense vs. separate reserve | Operating expense (in TCO_OpEx) | Must be budgeted monthly; "unexpected" CapEx is the #1 cause of investor distress |
| Self-managed cost | 5% floor (not 0%) | Opportunity cost of owner's time is real |
| Vacancy method | Turnover-adjusted (higher of % vs per-event) | Simple vacancy % underestimates true cost |
| Depreciation in TCO-DSCR | Separate after-tax metric only | Pre-tax TCO-DSCR should reflect actual cash outflows |
| HOA in PITIA vs TCO_OpEx | PITIA | HOA is a fixed contractual obligation, not an operating variable |
| Age/market adjustments | Additive to base rates | Simple, transparent, conservative |

---

## Appendix A: Quick Reference — TCO-DSCR in One Page

```
TCO-DSCR = Gross_Rent / (PITIA + TCO_OpEx)

PITIA = P&I + Tax + Insurance + HOA
TCO_OpEx = Gross_Rent × TCO_Rate

Default TCO_Rates:
  SFR:         28% (Mgmt 8% + Maint 8% + CapEx 5% + Vac 7%)
  2-4 Unit:    27% (Mgmt 7% + Maint 7% + CapEx 5% + Vac 8%)
  5-10 Unit:   25% (Mgmt 6% + Maint 6% + CapEx 4% + Vac 9%)
  Condotel:    63% (Mgmt 25% + Maint 10% + CapEx 8% + Vac 20%)

After-Tax TCO-DSCR = After_Tax_CF_Available / P&I
  After_Tax_CF_Available = Pre_Tax_CF + Tax_Savings + P&I
  Tax_Savings = |Taxable_Income| × Marginal_Rate (when negative)

Break-Even Rent = PITIA / (1 - TCO_Rate)
TCO Gap = Standard_DSCR - TCO_DSCR
```

## Appendix B: Sensitivity Analysis — Impact of TCO Rate on DSCR

For a property with PITIA/Rent = 0.80 (standard DSCR = 1.25):

| TCO Rate | TCO-DSCR | Monthly Cash Flow (per $1K rent) | Status |
|---|---|---|---|
| 0% (standard) | 1.250 | +$200 | Appears profitable |
| 15% | 1.053 | +$50 | Marginal |
| 20% | 1.000 | $0 | Breakeven |
| 25% | 0.952 | -$50 | Losing money |
| 28% | 0.926 | -$80 | Losing money |
| 30% | 0.909 | -$100 | Losing money |
| 35% | 0.870 | -$150 | Significant loss |
| 40% | 0.833 | -$200 | Major loss |

**Critical insight**: At the base SFR TCO rate of 28%, a property that appears to have DSCR of 1.25 is actually operating at a loss. This is the core problem TCO-DSCR solves.

---

*Document Version: 1.0 | Date: 2025-03-04 | Status: COMPLETE*
*Sources: IREM Income/Expense Analysis; NAR Property Management Survey; NAA Survey; US Census Housing Vacancy Survey; BiggerPockets Community Data; Investopedia; IRS Publication 527; Industry standard underwriting practices*
