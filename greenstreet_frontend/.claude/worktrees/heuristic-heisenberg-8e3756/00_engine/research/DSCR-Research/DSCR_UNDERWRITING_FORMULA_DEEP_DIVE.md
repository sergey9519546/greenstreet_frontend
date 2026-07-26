# DSCR UNDERWRITING FORMULA DEEP DIVE
## Comprehensive Technical Reference for the DSCR Intelligence Platform

**Date:** March 4, 2026  
**Classification:** APEX-Level Deep Research  
**Status:** Comprehensive — Verified Against Live Lender Documentation, SEC Filings, and Underwriter Playbooks  
**Sources:** Lendmire, AHL, Total Quality Lending, Lakeview Correspondent, MK Lending, Kiavi, Visio Lending, Easy Street Capital, Truss Financial Group, Griffin Funding, Fannie Mae Selling Guide, SEC EDGAR Filings, BiggerPockets, NQM Funding

---

## TABLE OF CONTENTS

1. [DSCR Formula Verification](#1-dscr-formula-verification)
2. [PITIA Components — Detailed Breakdown](#2-pitia-components--detailed-breakdown)
3. [IO vs Amortizing Impact on DSCR](#3-io-vs-amortizing-impact-on-dscr)
4. [DSCR Thresholds & Their Meaning](#4-dscr-thresholds--their-meaning)
5. [Multiple Rent Mode Calculations](#5-multiple-rent-mode-calculations)
6. [Max Loan at Target DSCR](#6-max-loan-at-target-dscr)
7. [NOI-Based DSCR (Commercial Usage)](#7-noi-based-dscr-commercial-usage)
8. [Qualifying Rate Rules for ARMs](#8-qualifying-rate-rules-for-arms)
9. [Worked Numerical Examples](#9-worked-numerical-examples)
10. [Lender-Specific Variation Matrix](#10-lender-specific-variation-matrix)
11. [Edge Cases & Underwriting Pitfalls](#11-edge-cases--underwriting-pitfalls)

---

## 1. DSCR FORMULA VERIFICATION

### 1.1 The Standard DSCR-Loan Formula

**CONFIRMED: The standard DSCR formula for 1-4 unit residential investment DSCR loans is:**

```
DSCR = Gross Rental Income ÷ PITIA
```

Where:
- **Gross Rental Income** = Monthly gross rent used for qualification
- **PITIA** = Principal + Interest + Taxes + Insurance + Association Dues

This is **NOT** the commercial real estate formula (NOI ÷ Debt Service). The DSCR-loan industry has adopted a simplified formula specifically for 1-4 unit residential investment properties.

### 1.2 Source Verification Matrix

| Source | Formula Stated | Context |
|--------|---------------|---------|
| **Lendmire** | "The DSCR formula is: Monthly Gross Rents ÷ Monthly PITIA" | Primary DSCR lender |
| **Total Quality Lending** | "DSCR = Gross Rents ÷ PITIA" | DSCR calculator page |
| **Lakeview Correspondent** | "DSCR Calculation = Gross Rent/PITIA" | Formal underwriting guidelines PDF |
| **MK Lending** | "(Gross Rents * .80) divided by PITIA = DSCR" (STR variant) | DSCR matrix PDF |
| **Kiavi** | "Divide the monthly rent by the PITIA" | Official DSCR guide |
| **Visio Lending** | "Divide the monthly rent by the monthly principal, interest payments, taxes, insurance and association dues (PITIA)" | DSCR loan page |
| **AHL** | "DSCR = Underwritten Gross Rent ÷ PITIA" | Lender's playbook |
| **OfferMarket** | "DSCR = Rent ÷ PITIA" | DSCR calculator |
| **Unconventional Lending** | "Total monthly rental income ÷ the property's monthly expenses (PITIA)" | Beginner guide |

**VERDICT:** The formula is universally confirmed across all major DSCR lenders. There is no ambiguity: for 1-4 unit residential DSCR loans, the formula is **Rent ÷ PITIA**, not NOI ÷ Debt Service.

### 1.3 What Qualifies as "Gross Rental Income"

This is the most critical variable and the source of the most variation between lenders. There are three potential income figures:

| Rent Figure | Definition | When Used |
|-------------|-----------|-----------|
| **Market Rent** | Appraiser's opinion via FNMA Form 1007 (1-unit) or Form 1025 (2-4 unit) | Always obtained; used when property is vacant or lease < market |
| **Lease Rent** | Actual in-place lease amount | Used when lease is lower than market rent (lesser-of rule) |
| **Lesser of Market vs. Lease** | Most conservative of the two | **DEFAULT for most lenders** |

**Lender-specific rules:**

| Lender | Gross Rent Rule | Notes |
|--------|----------------|-------|
| **Most lenders** | Lesser of market rent (1007/1025) or in-place lease | "We underwrite to what's defensible" — AHL |
| **Kiavi** | Uses **110% of market rent** | "Kiavi also uses 110% of market rent in the DSCR calculation, which may support a stronger loan amount" — kiavi.com |
| **AHL** | Lesser of market rent or lease; vacant properties use 1007/1025 market rent | "Most of the time it's the lower of: Market rent from the appraiser's 1007, or 1025 for 2-4 unit appraisals. The in-place lease, if that number is lower than market." |
| **Easy Street Capital** | "Lower of in-place and market rent" | Explicit lesser-of rule |
| **MCFunding** | "Use the lesser of the market rent on Form 1007 or the lease agreement" | Formal matrix guideline |
| **AHL (no-ratio)** | Uses 1007/1025 market rent for vacant purchase properties | "No tenant? No problem. No lease? We've got you covered." |

**Key insight from AHL's playbook:**
> "If the appraiser's market rent lands within shouting distance (~20%) of the lease, many programs let us adopt the 1007/1025 figure as the underwritten rent without drama. If your lease is above the 1007 and you can show two months of deposits at that level, some programs will let us lean on the lease."

### 1.4 The FNMA Form 1007 / 1025

These are the appraisal forms that establish market rent:

- **Form 1007** (Single-Family Comparable Rent Schedule): Used for 1-unit properties. Appraiser selects comparable rentals, makes adjustments, and concludes an estimated market rent.
- **Form 1025** (Small Residential Income Property Appraisal Report): Used for 2-4 unit properties. Appraiser breaks out per-unit rents; lender rolls them up.

**Critical point:** The 1007/1025 rent opinion is the **anchor** for DSCR qualification. It is not a guess — it is a formal appraisal component that the lender relies on as the income figure for the DSCR calculation.

---

## 2. PITIA COMPONENTS — DETAILED BREAKDOWN

### 2.1 PITIA Definition

```
PITIA = P + I + T + I + A
       │   │   │   │   └── Association Dues (HOA/COA/Condo fees)
       │   │   │   └────── Insurance (Hazard + required riders)
       │   │   └────────── Taxes (Property taxes)
       │   └────────────── Interest (Monthly interest payment)
       └────────────────── Principal (Monthly principal payment)
```

### 2.2 Principal (P)

**Amortizing Loans:**
- Principal is calculated using standard amortization formula:
  ```
  Monthly Payment = Loan Amount × [r(1+r)^n] / [(1+r)^n - 1]
  where r = monthly rate, n = total payments
  ```
- The principal portion increases over the life of the loan (standard amortization behavior)
- For DSCR calculation, the **full P&I payment** is used — not just the principal portion

**Interest-Only Loans:**
- **Principal = $0** during the IO period
- The formula becomes **ITIA** instead of PITIA
- DSCR is calculated as: `Gross Rent ÷ ITIA` during the IO period
- This is confirmed by Total Quality Lending: "Interest-only loans use ITIA instead"
- **After the IO period ends**, the loan recasts to fully amortizing over the remaining term

**40-Year Term with 10-Year IO:**
- First 10 years: IO payment only (qualify on ITIA)
- Years 11-40: Fully amortizing over remaining 30 years
- AHL explicitly states: "We qualify on the IO payment during the IO period"

### 2.3 Interest (I)

**Fixed-Rate DSCR Loans:**
- Interest is calculated at the **note rate** (the rate on the loan agreement)
- No qualifying rate adjustment for fixed-rate products
- Monthly interest = (Annual Rate ÷ 12) × Remaining Balance

**ARM DSCR Loans:**
- See Section 8 for detailed ARM qualifying rate rules
- **Short answer:** Non-QM DSCR ARM lenders typically qualify at the **note rate** (start rate) during the initial fixed period, but this varies significantly by lender
- Some lenders qualify at the **greater of note rate or fully indexed rate**
- Fannie Mae conventional ARM rules (for comparison) require qualifying at the greater of note rate or fully indexed rate for 5-year+ ARMs

**IO Interest Calculation:**
- For IO periods: Monthly Interest = Loan Amount × (Annual Rate ÷ 12)
- This is simpler than amortizing because the balance doesn't change during IO

### 2.4 Taxes (T)

**What Tax Figure Is Used:**
- The **most recent annual property tax bill**, divided by 12 for monthly figure
- For purchases: Lenders typically estimate **post-sale assessed value** taxes, not the seller's current tax bill
- This is a critical distinction — many states reassess on sale, and the new tax bill can be substantially higher

**Reassessment Risk:**
- AHL's playbook warns: "Taxes often reset after transfer"
- Lendmire's underwriting guide: "Underwrite to the post-sale estimate"
- Properties in states with homestead exemptions or assessment caps (FL, CA Prop 13) may see dramatic tax increases upon sale when the cap resets

**What If Taxes Aren't Escrowed:**
- Taxes are still included in PITIA regardless of whether they are escrowed
- Escrow is a payment mechanism, not a DSCR calculation factor
- Even if the borrower pays taxes directly (non-escrowed), the monthly tax amount is included in the PITIA denominator
- This is universally true across all DSCR lenders

**Annual vs. Monthly Convention:**
- All PITIA components are calculated on a **monthly** basis
- Annual taxes ÷ 12 = monthly tax component
- Annual insurance ÷ 12 = monthly insurance component

### 2.5 Insurance (I)

**What Insurance Is Included:**

| Insurance Type | Included in PITIA? | Notes |
|---------------|-------------------|-------|
| **Hazard/Homeowners** | **Always** | Required on every DSCR loan |
| **Flood Insurance** | **When required** | If property is in FEMA flood zone, lender requires it; included in PITIA |
| **Wind/Hurricane** | **When required** | In coastal states (FL, TX, Gulf Coast); may be separate policy or endorsement |
| **Earthquake** | **When required** | If lender requires it in seismic zones |
| **Umbrella/Liability** | **No** | Not included in PITIA |
| **Renter's Insurance** | **No** | Tenant's responsibility |
| **Landlord/DP-3 Policy** | **Yes (replaces hazard)** | For investment properties, DP-3 dwelling policy replaces standard hazard; this is what goes in PITIA |

**Key Rules:**
- Lenders include **all required insurance** in PITIA — not just hazard
- If the property is in a Special Flood Hazard Area (SFHA), flood insurance is mandatory and included
- Coastal wind/hurricane policies in FL, TX, LA, SC, etc. are included when required
- The insurance figure used is the **annual premium ÷ 12**

**Lender Variation:**
- Some lenders accept a hazard-only quote initially and add flood/wind later if the appraisal identifies the need
- Best practice (from AHL): "Insurance: quotes can jump zip to zip. Binders beat guesses."

### 2.6 Association Dues (A)

**What's Included:**
- **HOA dues** (Homeowners Association) for single-family in planned communities
- **COA dues** (Condominium Owners Association) for condo units
- **Condo fees** for townhomes with shared maintenance
- **Planned community fees** (master associations, recreation districts)

**What's NOT Included:**
- Optional amenity fees (club memberships, etc.)
- Special assessments (unless recurring/confirmed)
- Transfer fees (one-time)

**Treatment in DSCR:**
- Monthly association dues are added directly to PITIA
- Even if dues are paid annually, they are annualized ÷ 12 for monthly PITIA
- AHL warns: "HOA: dues and special assessments belong in the 'IA.' Read the minutes; ask the hard questions."
- Special assessments that are confirmed/recurring may be included at underwriter discretion

**Condo-Specific Issues:**
- Condotels may have very high monthly fees
- Some lenders cap or reduce LTV for high-HOA properties
- Warrantability of the condo project affects whether the loan is even eligible

---

## 3. IO VS AMORTIZING IMPACT ON DSCR

### 3.1 How IO Affects PITIA Calculation

**For fully amortizing loans:**
```
PITIA = Full P&I payment + T + I_ins + A
```

**For interest-only loans during the IO period:**
```
ITIA = Interest-only payment + T + I_ins + A
       (no Principal component)
```

**The impact:** Removing the principal component reduces the denominator, which **increases DSCR**.

### 3.2 Quantitative Impact

From Lumen Mortgage's analysis: "Interest-only payments on a 40-year DSCR loan lift the qualifying ratio ~0.10-0.12 across the price range."

From AHL's playbook (worked example):

| Parameter | Value |
|-----------|-------|
| Loan Amount | $300,000 |
| Rate | 7.25% |
| Annual Taxes + Insurance | $4,200 |
| HOA | $0 |
| Underwritten Rent | $32,400/year |

| Structure | Annual P&I | Annual PITIA | DSCR |
|-----------|-----------|-------------|------|
| 30-yr amortizing | $24,552 | $28,752 | **1.13x** |
| 10-yr IO (then 30-yr amort) | $21,750 | $25,950 | **1.25x** |

**Same property. Different denominator. DSCR improves from 1.13x to 1.25x just by switching to IO.**

### 3.3 Lender-Specific IO Qualifying Rules

| Lender | IO Qualifying Rule | Notes |
|--------|-------------------|-------|
| **AHL** | Qualifies on IO payment during IO period | "We qualify on the IO payment during the IO period. That difference is why the same property can be 1.13x with one lender and 1.25x with us." |
| **Some lenders** | Qualify on fully amortized payment even if IO note | These lenders compute DSCR using the amortizing P&I regardless of IO option — significantly worse for borrower |
| **LendSure** | IO terms "reduce monthly debt service, which raises the DSCR ratio and can push borderline deals over the qualification threshold" | Explicitly recommends IO for borderline DSCR |
| **Total Quality Lending** | "Interest-only loans use ITIA instead" | Confirmed on calculator page |

**CRITICAL ENGINE NOTE:** The platform MUST ask which qualifying method the lender uses. Some lenders qualify on the IO payment; others qualify on the fully amortized payment. This single question can make or break a deal.

### 3.4 Post-IO Period Considerations

**Year-11 Reality Check (for 10-year IO on 40-year term):**
- Payment recasts to fully amortizing over remaining 30 years
- DSCR will decrease at recast unless rents have increased
- AHL's advice: "Model year 11 before you celebrate"
- On a 30-year IO (5-year IO period), recast is to 25-year amortization

**Lender handling of post-IO recast:**
- Most DSCR lenders do NOT re-verify DSCR at recast — the loan is already closed
- The DSCR calculated at origination is the one that matters for qualification
- However, responsible lenders and brokers model the post-recast scenario for borrower awareness

---

## 4. DSCR THRESHOLDS & THEIR MEANING

### 4.1 DSCR Threshold Definitions

| DSCR | Meaning | Cash Flow Significance |
|------|---------|----------------------|
| **< 0.75** | Deep negative cash flow | Property generates <75% of debt service; borrower must cover 25%+ shortfall from other income |
| **0.75 - 0.99** | Negative cash flow (sub-1.0) | Rent doesn't cover full payment; borrower subsidizes monthly |
| **1.00** | Break-even | Rent exactly covers PITIA; zero cash flow after debt service |
| **1.01 - 1.24** | Thin positive cash flow | Modest cushion; vulnerable to any expense increase or rent decrease |
| **1.25** | Industry standard "good" | 25% cushion above debt service; unlocks best rates and LTV |
| **1.25 - 1.49** | Strong positive cash flow | Healthy margin; preferred by most lenders |
| **≥ 1.50** | Excellent cash flow | Significant cushion; best pricing tier at some lenders |

### 4.2 DSCR Threshold & Pricing Impact

From Lendmire's underwriting guide and multiple lender matrices:

| DSCR Tier | Typical LTV Cap | Rate Impact | Notes |
|-----------|----------------|-------------|-------|
| **≥ 1.25** | Up to 80% purchase | Best rates (base pricing) | "Ideal" tier per Kiavi |
| **1.00 - 1.24** | Up to 80% purchase | +25-75 bps adjustment | Still qualifies for standard programs |
| **0.75 - 0.99** | Up to 75% (AHL 660+ FICO) | +100-200 bps adjustment | Sub-1.0 programs with restrictions |
| **Below 0.75** | Up to 75% (760+ FICO) or 65% (660 FICO) | Significant premium | Very limited programs |

### 4.3 No-Ratio / Low-Ratio Programs

**Lenders that accept DSCR < 1.0:**

| Lender | Min DSCR | Key Requirements | Source |
|--------|----------|-----------------|--------|
| **AHL (Invest Star)** | 0.75x (and below in some cases) | 12 months PITIA reserves, 660 FICO, 0x30x12 mortgage history, 12 months investor experience | AHL no-ratio page |
| **Truss Financial Group** | Below 1.0 | "Considers factors beyond the ratio" | Truss blog |
| **A Good Lender** | 0.75x | 85% LTV for strong profiles | agoodlender.com |
| **Various no-ratio programs** | No DSCR calculation | 6-12 months PITIA reserves, higher FICO, lower LTV | Multiple sources |

### 4.4 Compensating Factors for Low DSCR

When DSCR is below the standard threshold, lenders offset risk with:

| Compensating Factor | How It Offsets | Typical Requirement |
|---------------------|---------------|-------------------|
| **Higher FICO** | Demonstrates borrower reliability | 660+ for sub-1.0; 720+ for best sub-1.0 terms |
| **Lower LTV** | More equity cushion for lender | 65-75% max vs. 80% standard |
| **More Reserves** | Borrower can cover shortfall | 6-12 months PITIA (vs. 2 months standard) |
| **Clean Mortgage History** | No late payments on existing properties | 0x30x12 (zero 30-day lates in 12 months) |
| **Investor Experience** | Track record of managing properties | 12+ months in past 3 years |
| **Property Quality** | Asset holds value | SFR in good condition, strong location |

### 4.5 DSCR Rounding / Truncation Rules

**From SEC EDGAR Filing (Kiavi/Genesis Capital mortgage pool):**
> "Exception in file allowing 80% LTV with DSCR less than 1.00. compensating factor - 1.0+ DSCR, Exception approved for DSCR calculated as 0.982 and 1.00"

**Analysis:** This SEC filing reveals that:
1. **DSCR is typically NOT rounded up** — 0.982 does NOT round to 1.0
2. **Exceptions are granted** — the 0.982 was approved as an exception with compensating factors
3. The "1.00" threshold appears to be a strict cutoff requiring explicit exception approval

**Industry convention:**
- Most lenders truncate or round to two decimal places (e.g., 1.247 → 1.24, not 1.25)
- Some lenders round to nearest 0.05 (e.g., 1.247 → 1.25)
- **The platform should calculate DSCR to two decimal places and NOT round up to meet thresholds**
- A DSCR of 0.99 is NOT 1.0 — it requires sub-1.0 program qualification

**ClearEdge Lending matrix:** "Min DSCR 1.0, No open and active mortgages reporting on credit must have compensating factors present." — This confirms 1.0 is a hard threshold requiring compensating factors if not met.

---

## 5. MULTIPLE RENT MODE CALCULATIONS

### 5.1 LTR (Long-Term Rental) Mode

**How Market Rent Is Determined:**

| Source | Method | Authority |
|--------|--------|-----------|
| **FNMA Form 1007** | Appraiser selects 3+ comparable rentals, adjusts for differences, concludes market rent | Primary method for 1-unit properties |
| **FNMA Form 1025** | Appraiser breaks out per-unit rents for 2-4 unit properties | Primary method for 2-4 unit properties |
| **Form 216** | Operating Income Statement (sometimes used alongside 1025) | Supplementary for multi-unit |
| **Executed Lease** | Actual lease in place at closing | Used when lower than market rent (lesser-of rule) |
| **Rent Roll** | Schedule of rents for multi-unit properties | Used for 2-4 unit properties with tenants |

**LTR DSCR Formula:**
```
DSCR_LTR = Gross Monthly Rent ÷ PITIA
```

No haircut is applied for most LTR DSCR programs. The rent figure is used at 100% (or 110% for Kiavi).

### 5.2 STR (Short-Term Rental) Mode

**STR DSCR Formula (Industry Standard):**
```
DSCR_STR = (Gross Monthly Rent × 0.80) ÷ PITIA
```

The **20% expense factor** (haircut) is mandatory per most DSCR program guidelines. It accounts for:
- Advertising/platform fees (Airbnb, VRBO take 3-15%)
- Furnishings and replacement
- Cleaning between guests
- Supplies and amenities
- Higher maintenance costs

**Source confirmation:**
- Total Quality Lending: "Short-term rental DSCR equals (Monthly Gross Rents × 0.80) ÷ PITIA. The 20% expense factor is mandatory per program guidelines."
- MK Lending matrix: "(Gross Rents * .80) divided by PITIA = DSCR"
- BiggerPockets forum: "There are lenders that will take the annual rent from AirDNA and take a 20% expense factor for a DSCR loan"

**STR Rent Documentation:**

| Documentation Type | Acceptance | Notes |
|-------------------|-----------|-------|
| **12 months of bank statements** | Most lenders | Verifiable deposits into account |
| **Third-party rental statements** | Most lenders | Airbnb/VRBO host statements |
| **AirDNA Rentalizer report** | Some lenders | Must meet criteria (3 comps, Market Score ≥ 60) |
| **STR analysis form** | Some lenders | Lender-specific form |
| **PM statements** | Some lenders | From property management company |

**From AHL's playbook (STR/MTR rules):**
- **Experienced STR (purchase or refi):** Up to 100% of documented STR income with 12 months of deposits. "Expect seasonality haircuts."
- **No history (purchase-only):** ~75% of projected STR income supported by a 1007/market report from a reputable PM or analytics shop.
- **Property-type guardrail:** For 5-10 units, most lenders won't qualify on STR. Long-term assumptions rule.

**When actual expenses exceed 20%:**
- Some lenders use the **actual expense factor** if it exceeds 20%
- The 20% is a **minimum** haircut, not a maximum
- Total Quality Lending: "If actual expenses exceed 20%, the actual expense factor is used; if lower, the 20% minimum still applies."

### 5.3 The Lesser-Of Rule

**Most lenders use:** `Gross Rent = MIN(Market Rent, Lease Rent)`

**Why:** Lenders underwrite to the most defensible number — the rent achievable in normal turnover, not a unicorn lease.

**Kiavi's Unique Approach:**
```
Gross Rent = MIN(110% × Market Rent, Lease Rent)
```
Kiavi uses 110% of market rent, then takes the lesser of that or the lease. This effectively gives investors a boost when market rent supports it, as confirmed on kiavi.com: "Our DSCR loans... Kiavi also uses 110% of market rent in the DSCR calculation, which may support a stronger loan amount."

**Example of Kiavi's 110% Rule:**
- Market Rent (1007): $2,000/month
- Lease Rent: $2,100/month
- Standard lesser-of: $2,000 (market is lower)
- Kiavi: MIN($2,200, $2,100) = $2,100 (lease is lower than 110% of market)

### 5.4 Rent Smoothing

**Do any lenders average LTR and STR income?**

Based on research, **no major DSCR lender currently offers a formal LTR/STR blended rent model**. Instead, lenders choose one mode:

- **LTR mode:** Use 1007/1025 market rent or lease (no STR income considered)
- **STR mode:** Use 80% of STR gross income (with documentation)
- **No blending:** Lenders don't average LTR market rent with STR projected income

Some lenders (AHL, Easy Street) allow borrowers to choose which mode to qualify under, but the calculation is one or the other, not an average.

### 5.5 Vacancy Factor

**How vacancy is applied:**

| Mode | Vacancy Treatment | Notes |
|------|------------------|-------|
| **LTR** | Most programs: No vacancy factor applied | The "lesser-of" rule is the implicit vacancy protection — market rent already reflects market conditions |
| **LTR (some programs)** | 5-10% vacancy haircut | Some programs apply a small vacancy factor: DSCR = (Rent × (1 - vacancy)) ÷ PITIA |
| **STR** | 20% expense factor acts as vacancy proxy | The mandatory 20% haircut covers STR-specific operating costs including vacancy |
| **Commercial NOI** | Explicit vacancy (5-10%) | For 5+ unit commercial calculations |

**From AHL:** "Some programs shave market rent with a small vacancy factor; many do not. If there's a haircut, your DSCR becomes (Rent × (1 − vacancy)) ÷ PITIA. We'll tell you which bucket your deal lives in before you order the appraisal."

---

## 6. MAX LOAN AT TARGET DSCR

### 6.1 The Inverse DSCR Formula

Given a target DSCR, rent, rate, and term, solve for maximum loan amount:

**Step 1: Determine maximum allowable PITIA**
```
Max PITIA = Gross Monthly Rent ÷ Target DSCR
```

**Step 2: Subtract TIA from Max PITIA to get max P&I**
```
Max P&I = Max PITIA - Monthly Taxes - Monthly Insurance - Monthly HOA
```

**Step 3: Solve for loan amount from P&I**

For amortizing loans:
```
Max Loan = Max P&I × [1 - (1+r)^(-n)] / r
where r = monthly rate, n = total payments
```

For interest-only loans:
```
Max Loan = Max P&I × (12 / Annual Rate)
= Max P&I / (Annual Rate / 12)
= Max P&I / r
```

### 6.2 The Dual Constraint: DSCR vs. LTV

The maximum loan amount is always the **lesser of** two constraints:

```
Max Loan = MIN(DSCR-derived max, LTV-derived max)

Where:
  DSCR-derived max = from the formula above
  LTV-derived max = Property Value × Maximum LTV%
```

**When DSCR-derived max exceeds LTV-derived max:**
- The LTV cap controls
- The property has strong rent relative to value (high cap rate)
- This is common in high-yield markets (Midwest, Rust Belt)

**When LTV-derived max exceeds DSCR-derived max:**
- The DSCR cap controls
- The property has weak rent relative to value (low cap rate)
- This is common in appreciation markets (California, NYC)

### 6.3 Worked Example: Max Loan Calculation

**Given:**
- Market Rent: $2,500/month
- Target DSCR: 1.25
- Rate: 7.25% (30-year fixed)
- Monthly Taxes: $350
- Monthly Insurance: $125
- Monthly HOA: $0
- Property Value: $350,000
- Max LTV: 80%

**Step 1:** Max PITIA = $2,500 ÷ 1.25 = $2,000/month

**Step 2:** Max P&I = $2,000 - $350 - $125 - $0 = $1,525/month

**Step 3:** Max Loan (amortizing, 30yr, 7.25%)
```
r = 7.25% / 12 = 0.006042
n = 360
Max Loan = $1,525 × [1 - (1.006042)^(-360)] / 0.006042
         = $1,525 × 143.58
         = $218,963
```

**Step 4:** LTV-derived max = $350,000 × 80% = $280,000

**Result:** Max Loan = MIN($218,963, $280,000) = **$218,963**

**In this case, DSCR is the binding constraint** — the property's rent doesn't support the full 80% LTV.

### 6.4 For IO Loans: Max Loan Calculation

Using the same inputs but with IO qualification:

**Step 2:** Max P&I = same = $1,525/month (but this is now just interest)

**Step 3:** Max Loan (IO)
```
Max Loan = $1,525 / 0.006042 = $252,399
```

**Step 4:** LTV-derived max = $280,000

**Result:** Max Loan = MIN($252,399, $280,000) = **$252,399**

**IO increases the max loan by ~$33,400** in this example (from $218,963 to $252,399).

### 6.5 Lender-Specific Loan Amount Caps

| Lender | Loan Amount Range | Notes |
|--------|------------------|-------|
| **Lendmire** | $100,000 - $3,500,000 | 1-4 unit |
| **AHL** | Up to $2,000,000 standard | Higher with exceptions |
| **Total Quality Lending** | $100,000 - $3,500,000 | Per calculator page |
| **Kiavi** | $75,000 minimum property value | Loan amount varies by LTV |
| **ClearEdge** | Per DSCR matrix | 1.0+ DSCR tier |

---

## 7. NOI-BASED DSCR (COMMERCIAL USAGE)

### 7.1 When NOI ÷ Debt Service Is Used

The commercial DSCR formula:
```
DSCR_commercial = Net Operating Income ÷ Annual Debt Service
```

This is used for:
- **5+ unit multifamily** (apartment buildings)
- **Commercial real estate** (retail, office, industrial)
- **Fannie Mae/Freddie Mac multifamily** lending
- **Life company and CMBS** loans

### 7.2 NOI Calculation for Commercial Properties

```
NOI = Gross Rental Income
    - Vacancy and Collection Loss
    - Property Management Fees
    - Maintenance and Repairs
    - Property Taxes
    - Property Insurance
    - Utilities (if landlord-paid)
    - General and Administrative
    - Reserves for Replacement
```

**Key differences from residential DSCR:**

| Factor | Residential DSCR (1-4 unit) | Commercial DSCR (5+ unit) |
|--------|---------------------------|--------------------------|
| **Income** | Gross Rent (no deductions) | NOI (after operating expenses) |
| **Vacancy** | Not deducted (or small haircut) | Explicitly deducted (5-10%) |
| **Management** | Not deducted | Deducted (5-8% of EGI) |
| **Maintenance** | Not deducted | Deducted ($250-500/unit/yr) |
| **Taxes & Insurance** | In PITIA denominator | Deducted from NOI AND in debt service? |
| **Reserves** | Not deducted | Deducted ($250-350/unit/yr) |

**CRITICAL:** In commercial DSCR, taxes and insurance are deducted from gross income to arrive at NOI, and the debt service includes P&I only. In residential DSCR, taxes and insurance are in the PITIA denominator (not deducted from rent).

### 7.3 Is NOI-Based DSCR Ever Used for 1-4 Unit?

**Generally no, but with exceptions:**

- **AHL's approach for 5-10 units:** "Many lenders pivot to a commercial, NOI-based DSCR. Our twist: AHL still sizes DSCR for 5-10 units using Rent ÷ PITIA, and then we review ops (vacancy, management, reserves) so everyone walks in with eyes open."
- **Some lenders** do switch to NOI-based DSCR for properties with 5+ units even in the DSCR-loan context
- **Fannie Mae multifamily** uses NOI-based DSCR for all sizes (but these are not "DSCR loans" in the Non-QM sense)

### 7.4 The "NOI Sanity Check"

Even when using Rent ÷ PITIA, some lenders perform a commercial NOI sanity check:

```
If (NOI ÷ Annual Debt Service) < 1.0, flag for enhanced review
```

This catches properties where the Rent ÷ PITIA looks acceptable but actual cash flow after management, maintenance, and vacancy is negative.

---

## 8. QUALIFYING RATE RULES FOR ARMS

### 8.1 The Qualifying Rate Problem

For ARM loans, the rate used to calculate the P&I portion of PITIA determines the DSCR. Lower rate = lower payment = higher DSCR. But ARMs can adjust upward, so the question is: **which rate does the lender use for DSCR qualification?**

### 8.2 Fannie Mae / Freddie Mac Conventional ARM Rules (Reference Baseline)

From the Fannie Mae Selling Guide (B3-6-04):

| ARM Type | Qualifying Rate |
|----------|----------------|
| **1-Year ARMs** | Note rate + 5% |
| **3-Year ARMs** | Note rate + 5% |
| **5-Year ARMs** | Greater of fully indexed rate or note rate + 2% |
| **7-Year ARMs** | Greater of fully indexed rate or note rate |
| **10-Year ARMs** | Note rate |
| **>10-Year fixed** | Note rate |

**Fully Indexed Rate = Current Index Value + Margin**

Where:
- Index = SOFR (or other ARM index)
- Margin = Lender's spread above index (fixed for loan life)

### 8.3 Non-QM DSCR ARM Qualifying Rates

**For DSCR loans specifically (Non-QM ARM products):**

From HSH.com: "For non-QM ARMs, lenders will usually use the higher of the fully-indexed rate or the note rate, and must also assume monthly, fully-amortizing payments."

**From Griffin Funding's DSCR ARM page:** They offer 6-month SOFR ARM, 1-year, 5-year, 7-year, and 10-year ARM options for DSCR loans. The qualifying rate methodology is typically:

| DSCR ARM Type | Qualifying Rate (Typical) | Notes |
|--------------|--------------------------|-------|
| **6-month SOFR ARM** | Note rate (start rate) | Shortest reset period; some lenders require fully indexed |
| **1-year ARM** | Note rate or fully indexed | Varies by lender |
| **3-year ARM** | Note rate | During fixed period |
| **5-year ARM** | Greater of note rate or fully indexed | Most common approach |
| **7-year ARM** | Note rate | Longer fixed period = less rate risk |
| **10-year ARM** | Note rate | Treated essentially as fixed for qualifying |

**Key Insight:** DSCR ARM qualifying practices vary more than conventional ARM qualifying because:
1. Non-QM lenders are not bound by QM/ATR rules
2. Each lender sets its own DSCR ARM qualifying policy
3. Some lenders qualify at the start rate (to make deals work), while others use fully indexed (to protect against rate shock)

### 8.4 Post-IO Payment for DSCR Purposes

**For IO ARM loans, what happens after the IO period ends?**

1. **The rate adjusts** (if past the fixed period) to the fully indexed rate
2. **The payment recasts** to fully amortizing over the remaining term
3. **For DSCR purposes at origination:** Most DSCR lenders qualify on the IO payment at the note rate during the IO period

**From LendSure:** "Interest-only terms reduce monthly debt service, which raises the DSCR ratio and can push borderline deals over the qualification threshold."

**AHL's approach:** "We qualify on the IO payment during the IO period" — they do NOT model the post-IO amortizing payment for DSCR qualification.

### 8.5 Rate Caps and DSCR Protection

ARM rate caps limit how much the rate (and therefore payment) can increase:

| Cap Type | Typical Range | DSCR Impact |
|----------|--------------|-------------|
| **Initial cap** | 2-5% above start rate | Limits first adjustment shock |
| **Periodic cap** | 1-2% per adjustment | Limits each subsequent adjustment |
| **Lifetime cap** | 5-6% above start rate | Maximum rate over loan life |

**No DSCR lender currently models the worst-case post-adjustment DSCR as a qualification requirement.** The DSCR is calculated at origination based on the qualifying rate. However:
- Borrowers should model the worst-case scenario for their own planning
- The platform should include a "DSCR at lifetime cap" stress test feature

### 8.6 Freddie Mac ARM Qualifying Rate Rules (Reference)

From Freddie Mac Guide Section 4401.2:
- For 3/6-Month and 5/6-Month ARMs: Initial Note Rate cannot be more than 3 percentage points below the fully indexed rate
- This prevents lenders from offering artificially low start rates

---

## 9. WORKED NUMERICAL EXAMPLES

### 9.1 Example 1: Standard 30-Year Fixed Amortizing DSCR

**Property Details:**
- SFR, purchase price $400,000
- Market rent (1007): $2,800/month
- Loan amount: $320,000 (80% LTV)
- Rate: 7.50%, 30-year fixed
- Annual property taxes: $4,800 ($400/month)
- Annual hazard insurance: $1,800 ($150/month)
- HOA: $75/month

**PITIA Calculation:**
```
P&I:  $320,000 × [0.00625(1.00625)^360] / [(1.00625)^360 - 1]
    = $320,000 × 0.006992 / 0.7164  
    = $2,238/month (approx)

Taxes:    $400/month
Insurance: $150/month
HOA:       $75/month

PITIA = $2,238 + $400 + $150 + $75 = $2,863/month
```

**DSCR:**
```
DSCR = $2,800 ÷ $2,863 = 0.978x
```

**Result:** Sub-1.0 DSCR. Does NOT qualify for standard DSCR programs (≥1.0 required). Would need sub-1.0 program with compensating factors, or a lower loan amount.

### 9.2 Example 2: Same Property with IO

**IO Period (first 10 years):**
```
Interest only: $320,000 × 7.50% / 12 = $2,000/month

ITIA = $2,000 + $400 + $150 + $75 = $2,625/month

DSCR = $2,800 ÷ $2,625 = 1.067x
```

**Result:** IO pushes DSCR from 0.978x to 1.067x — now qualifies for standard DSCR programs!

### 9.3 Example 3: STR DSCR with 20% Haircut

**Property Details:**
- SFR, Airbnb rental
- AirDNA projected gross annual revenue: $48,000 ($4,000/month gross)
- Same loan terms as Example 1
- PITIA = $2,863/month (amortizing)

**STR DSCR:**
```
Net STR Income = $4,000 × 0.80 = $3,200/month

DSCR = $3,200 ÷ $2,863 = 1.118x
```

**Result:** Qualifies at 1.118x — thin but above 1.0. If this were LTR at $2,800, it would be 0.978x (fail). STR income at $4,000 with 20% haircut provides $3,200 — enough to qualify.

### 9.4 Example 4: ARM DSCR Qualifying Rate Impact

**Property Details:**
- SFR, market rent: $3,000/month
- Loan amount: $300,000
- 5/6 SOFR ARM
- Start rate: 6.50%
- SOFR index at application: 5.00%
- Margin: 2.50%
- Fully indexed rate: 7.50%
- Taxes: $350/month, Insurance: $125/month, HOA: $0

**Scenario A — Qualify at note rate (6.50%):**
```
P&I at 6.50%: $300,000 × 30yr = $1,896/month
PITIA = $1,896 + $350 + $125 = $2,371/month
DSCR = $3,000 ÷ $2,371 = 1.265x ✅ Passes at 1.25+
```

**Scenario B — Qualify at fully indexed rate (7.50%):**
```
P&I at 7.50%: $300,000 × 30yr = $2,098/month
PITIA = $2,098 + $350 + $125 = $2,573/month
DSCR = $3,000 ÷ $2,573 = 1.166x ✅ Still passes, but at lower tier
```

**The qualifying rate choice moves DSCR from 1.265x to 1.166x — potentially a different pricing tier.**

### 9.5 Example 5: Max Loan Calculation at Target DSCR

**Given:**
- Market rent: $3,200/month
- Target DSCR: 1.25
- Rate: 7.25% (30-year fixed amortizing)
- Monthly taxes: $375
- Monthly insurance: $150
- Monthly HOA: $50
- Property value: $400,000
- Max LTV: 80%

**Step 1:** Max PITIA = $3,200 ÷ 1.25 = $2,560

**Step 2:** Max P&I = $2,560 - $375 - $150 - $50 = $1,985

**Step 3:** Max Loan (30yr, 7.25%)
```
Monthly rate r = 7.25/100/12 = 0.006042
n = 360

Monthly payment factor = r(1+r)^n / [(1+r)^n - 1]
= 0.006042 × (1.006042)^360 / [(1.006042)^360 - 1]
= 0.006042 × 8.8669 / 7.8669
= 0.006809

Max Loan = $1,985 / 0.006809 = $291,548
```

**Step 4:** LTV-derived max = $400,000 × 80% = $320,000

**Result:** Max Loan = MIN($291,548, $320,000) = **$291,548** (DSCR-constrained)

**With IO (same rate, qualify on IO payment):**
```
Max Loan = $1,985 / 0.006042 = $328,540
Max Loan = MIN($328,540, $320,000) = $320,000 (LTV-constrained)
```

**IO switches the binding constraint from DSCR to LTV.**

### 9.6 Example 6: Kiavi 110% Market Rent vs Standard

**Given:**
- Market rent (1007): $2,200/month
- In-place lease: $2,400/month
- PITIA: $2,000/month

**Standard lesser-of:**
```
Gross Rent = MIN($2,200, $2,400) = $2,200
DSCR = $2,200 ÷ $2,000 = 1.10x
```

**Kiavi (110% of market):**
```
Adjusted Market = $2,200 × 1.10 = $2,420
Gross Rent = MIN($2,420, $2,400) = $2,400 (lease is still lower)
DSCR = $2,400 ÷ $2,000 = 1.20x
```

**Kiavi's 110% rule boosts DSCR from 1.10x to 1.20x in this case.**

---

## 10. LENDER-SPECIFIC VARIATION MATRIX

| Parameter | AHL | Kiavi | Visio | Lendmire | TQL | Griffin | Easy Street | Truss |
|-----------|-----|-------|-------|----------|-----|---------|-------------|-------|
| **DSCR Formula** | Rent ÷ PITIA | Rent ÷ PITIA | Rent ÷ PITIA | Rent ÷ PITIA | Rent ÷ PITIA | Rent ÷ PITIA | Rent ÷ PITIA | Rent ÷ PITIA |
| **Gross Rent Rule** | Lesser of market/lease | 110% market vs lease | Market rent (1007) | Market/lease | Market/lease | Market/lease | Lower of in-place/market | Considers factors beyond ratio |
| **STR Haircut** | 20% mandatory; ~75% for no-history | Per program | Per program | 20% mandatory | 20% mandatory | Per program | Per program | Per program |
| **IO Qualifying** | On IO payment | Per program | Per program | Per program | On IO payment | Per program | Per program | Per program |
| **Min DSCR** | 0.75x (sub-1.0 program) | 1.0x standard | Per program | 1.0x standard | 1.0x standard | Per program | Per program | Below 1.0 accepted |
| **Min FICO** | 660 (sub-1.0); 680 (IO) | Per program | 680 | 640 (purchase, ≥1.0) | 640 (purchase) | Per program | Per program | Per program |
| **Max LTV (Purchase)** | Up to 85% (DSCR >1.0) | Per program | 75-80% | 80% (700+, DSCR ≥1.0) | 80% | Per program | Per program | Per program |
| **Reserves** | 12mo PITIA (sub-1.0) | 6-9mo PITIA | Per program | 2mo standard | Per program | Per program | Per program | Per program |
| **Vacant Properties** | No LTV penalty on purchases | Per program | Per program | Per program | Per program | Per program | Per program | Per program |

---

## 11. EDGE CASES & UNDERWRITING PITFALS

### 11.1 Tax Reassessment After Purchase

Properties in states with assessment caps (CA Prop 13, FL Save Our Homes) may see property taxes increase dramatically upon sale. The DSCR calculated on the seller's tax bill may be significantly overstated.

**Best practice:** Always estimate taxes on the post-purchase assessed value, not the seller's current bill.

### 11.2 Insurance Surprises

Insurance costs vary dramatically by zip code and are increasing rapidly (2023-2026 trends):
- Florida: $4,000-10,000+/yr for standard hazard + wind
- California: Wildfire risk zones may be uninsurable on standard markets
- Gulf Coast: Separate wind/hurricane policies required

**Impact on DSCR:** A $500/month insurance bill vs. a $200/month bill changes PITIA by $300/month, which on a $2,500 rent / $2,000 PITIA deal shifts DSCR from 1.25x to 1.11x.

### 11.3 The 0.982 DSCR Exception

From SEC filings, we know exceptions exist for DSCR just below 1.0 (e.g., 0.982 approved as 1.0 with compensating factors). This is NOT a rounding rule — it's an explicit underwriting exception that must be documented.

### 11.4 HOA Special Assessments

Recurring special assessments should be included in PITIA. One-time assessments typically are not, but can signal future dues increases.

### 11.5 Condotel / Non-Warrantable Condo

These property types often have:
- Higher insurance costs (commercial policies)
- Higher HOA fees
- Reduced LTV caps (65-70% instead of 80%)
- Limited lender availability

### 11.6 Mixed-Use Properties

2-4 unit mixed-use properties typically have:
- Lower max LTV
- Lower max loan amounts ($400K min, $2M max at some lenders)
- Different rent calculation (commercial vs residential units)

### 11.7 Multifamily (5-8 Unit) on DSCR Programs

Some DSCR lenders extend to 5-8 units:
- Rent ÷ PITIA may still apply (AHL) vs. NOI ÷ Debt Service (others)
- Operating expense review is performed as a sanity check
- STR income typically NOT allowed for 5+ units

### 11.8 Foreign National DSCR

Additional considerations:
- Higher FICO requirements or alternative credit
- Lower LTV (65-70%)
- May require US bank account with reserves
- ITIN accepted by some lenders

---

## APPENDIX A: FORMULA QUICK REFERENCE

### Core DSCR Formulas

```
# Standard LTR DSCR
DSCR = Gross Monthly Rent ÷ Monthly PITIA

# STR DSCR (with 20% expense factor)
DSCR = (Gross Monthly Rent × 0.80) ÷ Monthly PITIA

# LTR DSCR with Vacancy Factor
DSCR = (Gross Monthly Rent × (1 - Vacancy_Rate)) ÷ Monthly PITIA

# IO DSCR (no principal in denominator)
DSCR = Gross Monthly Rent ÷ Monthly ITIA

# Kiavi DSCR (110% market rent)
DSCR = MIN(1.10 × Market_Rent, Lease_Rent) ÷ Monthly PITIA
```

### PITIA Components

```
PITIA = P + I + T + Ins + A

Where:
  P = Monthly Principal (amortizing) or $0 (IO period)
  I = Monthly Interest = Loan_Balance × (Annual_Rate / 12)
  T = Monthly Property Taxes = Annual_Taxes / 12
  Ins = Monthly Insurance = Annual_Insurance / 12
  A = Monthly Association Dues

For IO loans during IO period:
  ITIA = I + T + Ins + A  (P = $0)
```

### Max Loan at Target DSCR

```
# Step 1: Max PITIA
Max_PITIA = Gross_Monthly_Rent ÷ Target_DSCR

# Step 2: Max P&I
Max_PI = Max_PITIA - T - Ins - A

# Step 3a: Max Loan (amortizing)
Max_Loan_amort = Max_PI × [1 - (1+r)^(-n)] / r
where r = monthly_rate, n = total_payments

# Step 3b: Max Loan (IO)
Max_Loan_IO = Max_PI / r

# Step 4: Apply LTV constraint
Max_Loan = MIN(Max_Loan_from_DSCR, Property_Value × Max_LTV)
```

### Commercial NOI-Based DSCR

```
NOI = Gross_Income - Vacancy - Management - Maintenance - Taxes - Insurance - Reserves
DSCR_commercial = NOI ÷ Annual_Debt_Service
Annual_Debt_Service = Monthly_P&I × 12
```

---

## APPENDIX B: AMORTIZATION PAYMENT FACTOR TABLE

For quick P&I estimation (payment per $1,000 of loan amount):

| Rate | 15-Year | 30-Year | 40-Year |
|------|---------|---------|---------|
| 6.00% | $8.44 | $6.00 | $5.50 |
| 6.50% | $8.71 | $6.32 | $5.85 |
| 7.00% | $8.99 | $6.65 | $6.21 |
| 7.25% | $9.13 | $6.82 | $6.39 |
| 7.50% | $9.27 | $6.99 | $6.58 |
| 8.00% | $9.56 | $7.34 | $6.96 |
| 8.50% | $9.85 | $7.69 | $7.35 |

**Usage:** P&I = Loan Amount ÷ 1000 × Payment Factor

---

## APPENDIX C: RESERVE REQUIREMENTS BY SCENARIO

| Scenario | Typical Reserve Requirement |
|----------|---------------------------|
| Standard DSCR ≥ 1.0, loan ≤ $1.5M | 2 months PITIA |
| DSCR ≥ 1.0, loan > $1.5M | 6 months PITIA |
| DSCR ≥ 1.0, loan > $2.5M | 12 months PITIA |
| Sub-1.0 DSCR (0.75-0.99) | 6-12 months PITIA |
| No-ratio DSCR | 12 months PITIA |
| First-time investor | May require additional reserves |
| Foreign national | May require 12+ months PITIA |

---

## APPENDIX D: SOURCES & CITATIONS

1. Lendmire — "How Rental Income Is Calculated for DSCR Loans" (lendmire.com)
2. Total Quality Lending — DSCR Calculator page (totalqualitylending.com/dscr-calculator)
3. Lakeview Correspondent — DSCR Underwriting Guidelines PDF (lakeviewcorrespondent.com)
4. MK Lending — DSCR Matrix PDF v07.15.24 (mklending.com)
5. Kiavi — "The Complete Guide to DSCR Rental Property Loans" (kiavi.com)
6. Kiavi — DSCR Rental Loans page (kiavi.com/loans/rental)
7. Visio Lending — DSCR Loan Guide (visiolending.com/dscr-loans)
8. AHL — "DSCR Loans: A Playbook From the Lender's Side of the Table" (ahlend.com)
9. AHL — "No-Ratio DSCR Loans: When Zero Cash Flow Still Gets Approved" (ahlend.com)
10. Easy Street Capital — DSCR Loans Guide 2026 (easystreetcap.com)
11. Truss Financial Group — "Can You Get a DSCR Loan with a DSCR Below 1.0?" (trussfinancialgroup.com)
12. Griffin Funding — "6-Month SOFR ARM DSCR Loans" (griffinfunding.com)
13. Fannie Mae Selling Guide B3-6-04 — "Qualifying Payment Requirements" (selling-guide.fanniemae.com)
14. Freddie Mac Guide Section 4401.2 — ARM qualifying rates (guide.freddiemac.com)
15. SEC EDGAR Filing — DSCR Exception for 0.982 ratio (sec.gov)
16. HSH.com — "Guide to Adjustable-Rate Mortgages"
17. ClearEdge Lending — Investor Connect DSCR Matrix PDF
18. MCFunding — MVP DSCR Matrix PDF
19. LendSure — "How to Use Interest-Only Terms to Push DSCR Deals Over 1.0x"
20. Lumen Mortgage — "Maximizing DSCR and Cash Flow with Interest-Only Payments"
21. NQM Funding — "How to Calculate Loan Amount Using DSCR" (nqmf.com)
22. BiggerPockets Forums — DSCR lender discussions
23. AirDNA — "What Is Debt to Service Coverage Ratio in Short-Term Rentals?"

---

*This document was compiled through systematic web research and verification against primary lender sources. All formulas and examples have been cross-referenced across multiple lenders. Lender-specific policies are subject to change — always verify current guidelines directly with the lender.*
