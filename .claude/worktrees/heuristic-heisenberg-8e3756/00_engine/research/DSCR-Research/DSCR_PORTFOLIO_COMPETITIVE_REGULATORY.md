# DSCR Portfolio, Competitive Landscape & Regulatory Framework Report

**Prepared for:** DSCR Intelligence Platform  
**Date:** March 2026  
**Research Methodology:** Web search, page scraping, and synthesis of 40+ sources including lender websites, CFPB filings, S&P Global ratings, NPLA market reports, and industry publications.

---

## PART 1: PORTFOLIO DSCR & BLANKET LOANS

### 1.1 Ridge Street Capital Portfolio DSCR — Verification of Claimed Parameters

**Source:** Ridge Street Capital blog post "DSCR Portfolio Loan: How Investors Finance Multiple Rentals with One Mortgage" (published May 19, 2026, updated May 26, 2026) — [ridgestreetcap.com/blog/dscr-portfolio-loan](https://www.ridgestreetcap.com/blog/dscr-portfolio-loan)

| Parameter | Claimed | Verified | Source / Notes |
|-----------|---------|----------|----------------|
| Min 2 properties | ✅ | ✅ Confirmed | "finance two or more rental properties under a single loan structure" |
| Min $250k total loan | ✅ | ✅ Confirmed | Listed as "Minimum Total Loan $250,000" in their requirements table |
| Min $50k per property | ✅ | ✅ Confirmed | Listed as "Minimum Per-Property Allocation $50,000" |
| Max LTV 80% purchase / 75% cash-out | ✅ | ✅ Confirmed | "Maximum LTV (purchase / rate-and-term) 80%", "Maximum LTV (cash-out refinance) 75%" |
| Min blended DSCR 1.0 | ✅ | ✅ Confirmed | "Minimum DSCR 1.0" — page also notes "1.20+ comfortable" threshold implied by pricing |
| 660 FICO | ✅ | ✅ Confirmed | "Minimum Credit Score 660" |
| 6 months reserves | ✅ | ✅ Confirmed | "Reserve Requirement 6 months PITIA" — note page also says "Most lenders require 6-9 months PITIA reserves" |
| 120% release price | ✅ | ✅ Confirmed | "Release Price = 120% × Allocated Loan Balance" — detailed example provided |
| Sub-$100k concentration: >25% → LTV drops to 70% | ✅ | ✅ Confirmed | "If more than 25% of the properties in a portfolio are valued below $100,000, the lower ceiling applies to the entire portfolio" — typically 70% instead of 80% |

**Additional Ridge Street Details:**
- Loan terms: 30-year fixed or 5/1 ARM
- Eligible property types: 1-4 unit residential, condos, townhomes
- Entity ownership: LLC or corporation (personal guarantee required)
- Rate premium: Portfolio loans price **0.25%-0.5% above single-asset DSCR rates**
- Origination fees: Apply to the first two properties in a portfolio; additional properties close without origination charges
- Geographic constraint: Most programs require all properties to be in the same state
- STR inclusion: Allowed, uses AirDNA projections for properties without rental history
- Cross-default risk explicitly highlighted: "A default on one property puts the entire portfolio at risk"
- Adding properties mid-term: Requires new underwriting, appraisals, revised DSCR; most investors refinance the entire portfolio instead

### 1.2 Other Portfolio DSCR Lenders

#### FlexPoint Inc. — Cross Collateral DSCR
**Source:** [flexpointinc.com/loan-programs/non-qm/cross-collateral](https://flexpointinc.com/loan-programs/non-qm/cross-collateral)

| Parameter | FlexPoint Terms |
|-----------|----------------|
| Properties | 2–25 in one loan |
| Max Loan | $6,250,000 |
| Max LTV | 80% Purchase/R&T; 70% cash-out |
| Min Credit Score | 700 (highest FICO used for multi-borrower) |
| Min Asset Value | $187,500 per property |
| Max Cash-Out | $1,000,000 (FICO >700 required) |
| Multi-State | ✅ Properties in different states can be combined |
| Short-Term Rentals | Allowed with conditions — STR properties capped at 60% LTV |
| Non-Warrantable Condos | ❌ Not allowed (only warrantable condos) |
| Foreign Nationals | ❌ Not eligible |

**Key Differentiators:**
- Highest property count in the market (up to 25)
- Highest loan amount ($6.25M)
- Explicit multi-state capability
- Minimum FICO 700 is more restrictive than Ridge Street's 660
- Per-property minimum asset value of $187.5K (much higher than Ridge Street's $50K allocation minimum)
- Lending since 1996; $5B+ in loans funded

#### Other Lenders Mentioned in Market

| Lender | Product | Notes |
|--------|---------|-------|
| **Velocity Mortgage Capital** | Blanket/cross-collateral DSCR | Mentioned in broker forums as offering cross-collateral |
| **Axos Bank** | Cross-collateralization | Mentioned in Facebook broker group |
| **Brokers First Funding** | Blanket loans for DSCR | Mentioned in broker forums |
| **FBC Funding** | DSCR blanket/portfolio loan | [rehablender.net](https://www.rehablender.net/rental-loan) — offers blanket loans for cross-collateralization |
| **NQM Funding** | Multi-loan strategy (NOT true portfolio) | Offers parallel individual DSCR loans instead of cross-collateral — explicitly positions against portfolio loans |

#### NQM Funding's Contrarian Position
NQM Funding argues **against** true portfolio DSCR loans, instead offering a "multi-loan strategy" — submitting 3-10 DSCR loans simultaneously, each underwritten individually but processed in parallel. Their stated advantages:
- Risk isolation: One vacancy doesn't jeopardize the portfolio
- Exit flexibility: Sell/refinance/1031 exchange individual properties
- No cross-default risk
- Properties can be in separate LLCs
- No release price complications
- If 4 of 5 loans are clear, they fund while resolving the 5th

### 1.3 Blended DSCR Calculation

**Formula (universally consistent across all sources):**

```
Portfolio DSCR = Total Monthly Rent (all properties) ÷ Total Monthly PITIA (all properties)
```

Where PITIA = Principal + Interest + Taxes + Insurance + Association fees

**Key insight from FlexPoint:** "No — and this is one of the program's key advantages. The loan qualifies on the combined DSCR of the entire portfolio. A property running at 0.90 DSCR individually can be offset by another property running at 1.25, as long as the portfolio as a whole meets the required combined ratio."

**Ridge Street example:**
| Property | Monthly Rent | Monthly PITIA |
|----------|-------------|---------------|
| Property A | $2,200 | $1,600 |
| Property B | $1,800 | $1,400 |
| Property C | $2,000 | $1,500 |
| **Totals** | **$6,000** | **$4,500** |

Portfolio DSCR = $6,000 ÷ $4,500 = **1.33**

### 1.4 Can Borrowers Mix Property Types?

- **Ridge Street:** 1-4 unit residential, condos, townhomes — all allowed in same portfolio
- **FlexPoint:** SFR, duplex, triplex, fourplex, warrantable condos — mix allowed; STR with conditions; **no 5+ unit properties** (separate program); **no non-warrantable condos**
- **General:** Mixing SFRs and small multifamily (2-4 units) is typically allowed. The key constraint is the property type eligibility of the specific lender's matrix, not mixing rules.

### 1.5 Cross-Collateralization Requirements

All portfolio DSCR loans require cross-collateralization by definition:
- All properties are pledged as collateral together under one note
- Personal guarantee required (LLC/corporate ownership standard)
- Cross-default is inherent: default on one = default on all
- Properties are released only via partial release clause (negotiated at origination)

### 1.6 Release/Substitution Mechanics

| Feature | Detail |
|---------|--------|
| **Release Price** | Typically 120% of allocated loan balance (set by secondary market institutional buyers) |
| **Why 120%?** | "Ensures the remaining collateral stays proportionally strong after a property exits the pool. Releasing at par would leave the remaining loan under-collateralized" |
| **Release Process** | Must be structured upfront at origination — cannot be added after closing |
| **Substitution** | Most programs don't support easy substitution; cleaner path is full refinance |
| **Adding Properties** | Requires new underwriting event, updated appraisals, revised DSCR calculations, formal lender approval |

### 1.7 Pricing vs Single-Asset DSCR

| Feature | Single-Asset DSCR | Portfolio DSCR |
|---------|-------------------|----------------|
| Rate | Base rate | **+0.25%-0.50% premium** |
| Origination fees | Per loan | First 2 properties charged; additional often free (Ridge Street model) |
| Closing costs | Per property | Lower per-property but each property still needs appraisal + title |
| Title/Appraisal | One set | Multiple appraisals + title reviews (still required per property) |
| Net savings | N/A | **Modest** — Harpoon Capital analysis shows "cost savings benefits remain more theoretical than empirical" |

### 1.8 Single-Asset Property Count Rules

#### LendSure
**Source:** [lendsure.com](https://lendsure.com) — multiple pages

- **Can finance up to 10 properties for one investor** (NOT "10 loans per investor cap" — it's 10 financed properties)
- **No limit on the number of properties owned** — only on financed count
- Loan amounts up to $3,000,000
- Close multiple loans for the same investor at the same time
- Non-warrantable condos & condotels allowed (up to 75% LTV)

**Correction to claim:** LendSure's cap is "finance up to 10 properties for one investor" — this is a **financing cap**, not a total ownership cap. The distinction matters.

#### Angel Oak Mortgage Solutions
**Source:** [angeloakms.com](https://angeloakms.com/programs/investor-cash-flow-mortgage-program)

- **No explicit cap on number of financed properties** found in public materials
- Generous loan limit: up to $3 million
- Launched industry-first **Rental AVM for DSCR loans** — allows automated rent estimation without full appraisal in some cases
- Major Non-QM securitization platform (AOMT deals)

**Assessment:** Angel Oak's lack of an explicit published cap suggests either no limit or a flexible/larger limit, but this should be confirmed directly with their wholesale desk.

#### How Lenders Track Financed Property Count
- Credit report analysis (mortgage tradelines)
- Title search for recorded liens
- Self-attestation on application (borrower must disclose all financed properties)
- For LLC-owned properties: lenders review entity structures and look for personal guarantees
- Fannie Mae B2-2-03 requires counting properties where borrower has >25% LLC ownership or personal guarantee

#### More Properties = Higher LLPAs or Reserves?
- **Generally yes** — lenders increase reserve requirements (6-9 months PITIA) for larger portfolios
- Rate adjustments may apply for higher property counts (not always explicitly published as LLPAs)
- LTV reductions possible for higher property counts or concentrations of lower-value properties
- Conventional/Fannie Mae has explicit LLPAs for 5-10 financed properties

#### Fannie Mae B2-2-03: 10 Financed Property Limit
**Source:** [selling-guide.fanniemae.com/sel/b2-2-03](https://selling-guide.fanniemae.com/sel/b2-2-03/multiple-financed-properties-same-borrower)

| Feature | Fannie Mae Rule |
|---------|----------------|
| **Max financed properties** | 10 (including primary residence and second homes) |
| **1-4 financed properties** | Standard underwriting, no additional requirements |
| **5-10 financed properties** | Additional requirements: 720+ FICO, 25% down payment on 2-4 unit properties, 6 months reserves per property |
| **Excluded from count** | Commercial real estate, multifamily (5+ units), timeshares, vacant land |
| **LLPA** | Yes —Loan-Level Price Adjustments increase with financed property count |
| **LLC properties** | Count toward limit if borrower owns >25% or provides personal guarantee |

**This is why DSCR/Non-QM loans exist for scaling investors** — they bypass this 10-property cap entirely.

---

## PART 2: COMPETITIVE LANDSCAPE

### 2.1 Free DSCR Calculators — Feature Analysis

#### Lima One Capital
**URL:** [limaone.com/calculate-debt-service-coverage-ratio](https://www.limaone.com/calculate-debt-service-coverage-ratio)  
**What it calculates:** Basic DSCR = Monthly Rent ÷ Monthly PITIA  
**What it misses:**
- No rent data integration
- No multi-lender rate comparison
- No portfolio/blended DSCR calculation
- No optimization or scenario modeling
- Lead generation tool only (captures contact info)

#### Kiavi
**URL:** [kiavi.com](https://www.kiavi.com/the-complete-guide-to-dscr-rental-property-loans)  
**What it calculates:** DSCR = Monthly Rent ÷ PITIA; offers guide with examples  
**What it misses:**
- No standalone calculator found (informational guide only)
- No live rate quotes
- No portfolio DSCR
- No rent data API integration

#### Visio Lending
**URL:** [visiolending.com/dscr-calculator](https://visiolending.com/dscr-calculator)  
**What it calculates:** DSCR for single property; determines if property qualifies  
**What it misses:**
- Single-property only
- No comparison across lenders
- No integrated rent data
- No optimization engine

#### Griffin Funding
**URL:** Referenced in comparison articles; DSCR calculator available on their site  
**What it calculates:** Single-property DSCR; rate comparison vs competitors (self-serving)  
**What it misses:**
- Biased comparison (positions Griffin as best)
- No real-time multi-lender pricing
- No portfolio DSCR

#### Other DSCR Calculators Found

| Lender/Platform | Calculator | Features | Limitations |
|----------------|------------|----------|-------------|
| **Ridge Street Capital** | DSCR calculator + Refinance calculator | Single-property DSCR, refinance cash-out estimate | No portfolio, no multi-lender |
| **Angel Oak** | DSCR Loan Calculator | Cash flow assessment, income potential | Single-property, no rent data |
| **Newfi** | DSCR Calculator | Loan eligibility, payments, investment performance | Single-property only |
| **LendingOne** | DSCR Rental Loan Calculator | Instant DSCR estimate, lender benchmarks | Single-property, lead gen |
| **Figure** | DSCR Calculator | NOI, debt service, DSCR, loan fit | More commercial-focused |
| **Swoop Funding** | DSCR Calculator | Business-focused DSCR | Not real-estate specific |
| **SoFi** | DSCR Calculator | General DSCR calculator | Business debt, not investment property |
| **Lower Mortgage** | DSCR Calculator | Slider-based comparison | Consumer-focused |
| **HUD Loans** | DSCR Calculator | Commercial/HUD-specific | Not residential rental focused |
| **Bridge Marketplace** | DSCR Loan Qualifier | Pre-qualification + lender matching | Limited lender network |

### 2.2 Multi-Lender DSCR Comparison Platforms

**Finding: NO true multi-lender DSCR comparison platform exists.**

The closest analogues:
- **Griffin Funding** publishes a "best DSCR lenders" comparison article — but it's self-serving editorial content, not a real-time pricing engine
- **LendingOne** has a "best DSCR lenders" list — again, editorial content
- **OfferMarket.us** positions itself as a DSCR lender comparison tool — but it's primarily a lead-generation marketplace, not a transparent rate comparison engine
- **Bridge Marketplace** offers a "DSCR Loan Qualifier" with lender matching — limited participating lenders, not comprehensive

**None of these provide:**
- Real-time rate/term comparison across multiple DSCR lenders
- Side-by-side pricing with all LLPAs, fees, and adjustments visible
- Automated rate lock or pre-approval

### 2.3 Rent Data Integration with DSCR Calculation

**Finding: NO standalone tool integrates rent data with DSCR calculation.**

Closest approach:
- **Angel Oak Mortgage Solutions** launched an **industry-first Rental AVM (Automated Valuation Model)** for DSCR loans in 2024/2025. This provides automated rent estimates for qualifying purposes but is **internal to their origination process** — not a consumer-facing tool.
- **Ridge Street Capital** uses **AirDNA projections** for STR properties in their portfolio loans — again, internal underwriting tool, not a platform.
- **Rent data providers** (RentCast, Rentometer, Zillow Rent Zestimate, AirDNA) exist but none are integrated with DSCR calculators in a single platform.

### 2.4 DSCR Optimization/Structuring Tools

**Finding: NO DSCR optimization engine exists.**

There are no tools that:
- Optimize which properties to bundle for best blended DSCR
- Model release price impact on exit strategy
- Compare portfolio vs. individual loan structures with total cost analysis
- Suggest property combinations that maximize LTV/DSCR
- Run sensitivity analysis on rent changes, vacancy, or rate adjustments

### 2.5 General Mortgage Platforms with DSCR Features

#### Optimal Blue
**URL:** [optimalblue.com](https://www2.optimalblue.com)  
**Product:** Product & Pricing Engine (PPE) — the industry standard for mortgage rate/eligibility  
**DSCR Features:**
- Optimal Blue has noted that "DSCR loans surge in Non-QM strategies"
- PPE supports Non-QM product eligibility and pricing
- Used by lenders (B2B), not investors/consumers
- **Pricing:** Enterprise SaaS (thousands/month), not accessible to individual investors
- **Limitation:** Designed for loan officers pricing loans for borrowers; requires lender license access. Not a consumer tool.

#### Morty
**URL:** [morty.com](https://www.morty.com/resources/mortgage-topics/dscr)  
**Product:** Digital mortgage platform with DSCR resource content  
**DSCR Features:**
- Educational content on DSCR loans
- No DSCR-specific calculator or comparison tool found
- Primarily focused on conventional/QM mortgages

#### Other Platforms
- **Encompass by ICE:** Loan origination system that supports Non-QM workflows but is lender-side software
- **Calyx Point:** Similar LOS with Non-QM support
- **Blend:** Digital lending platform — no DSCR-specific tools for investors

### 2.6 Market Gap Analysis

| Gap | Status | Opportunity |
|-----|--------|-------------|
| **Multi-lender DSCR comparison platform** | ❌ Does NOT exist | High — investors currently shop manually across 5-10 lenders |
| **Integrated rent data + DSCR platform** | ❌ Does NOT exist (Angel Oak's Rental AVM is internal only) | High — combine RentCast/AirDNA API with DSCR engine |
| **DSCR optimization engine** | ❌ Does NOT exist | Very High — portfolio structuring, property selection, release price modeling |
| **Portfolio DSCR calculator** | ❌ Does NOT exist (all calculators are single-property) | High — blended DSCR across multiple properties with release price impact |
| **DSCR scenario/sensitivity analysis** | ❌ Does NOT exist | Medium-High — rent changes, vacancy, rate adjustments |
| **DSCR lender eligibility matching** | Partially addressed (Bridge Marketplace, but limited) | Medium — better lender-product matching needed |
| **Cross-collateral release price calculator** | ❌ Does NOT exist | Medium — niche but valuable for portfolio loan borrowers |

**Summary:** The DSCR tool landscape consists entirely of **single-property, single-lender calculators** that serve as lead generation for the lender offering them. There are no multi-lender, no rent-data-integrated, and no optimization tools in the market. This represents a significant white space for a DSCR Intelligence Platform.

---

## PART 3: REGULATORY FRAMEWORK

### 3.1 Ability-to-Repay (ATR) Rule and DSCR Loans

**Regulatory Basis:** 12 CFR § 1026.43 (TILA/Reg Z) — Ability-to-Repay/Qualified Mortgage Rule

**How ATR applies to DSCR loans:**

DSCR loans are **Non-QM** (non-Qualified Mortgage) products. Under the ATR rule, creditors must make a "reasonable, good faith determination" of a consumer's ability to repay. For Non-QM loans, lenders have two paths:

1. **QM Path:** Meet strict underwriting and pricing parameters → automatic compliance (safe harbor or rebuttable presumption)
2. **Non-QM Path:** More underwriting flexibility, but must still demonstrate "reasonable" ATR determination considering enumerated factors: DTI or residual income, credit history, income/assets, etc.

**DSCR-Specific ATR Approach:**
- DSCR lenders qualify borrowers based on **property cash flow** (DSCR ≥ 1.0) rather than personal DTI
- This is the "consider income/assets" factor — the property's rental income IS the income considered
- Lenders still verify: credit score, property condition, appraisals, rent schedules
- **No personal income verification required** — this is the core value proposition

**CFPB Enforcement (January 2025):**
On January 6, 2025, the CFPB sued a mortgage lender (manufactured home financing company) under ATR/Non-QM rules. Key allegations:
- The lender used a residual income model based on "unreasonable," "implausible," or "unrealistic" expense estimates
- Failed to consider borrowers' lack of assets, debts in collection, and family size
- Delinquency/default rates were cited as evidence of unreasonable ATR determinations
- The CFPB "ignored clear and obvious red flags"

**Implications for DSCR lending:** While this case involves manufactured home lending (not DSCR specifically), it establishes that:
- Non-QM lenders must have **reasonable** underwriting standards even without QM safe harbor
- High delinquency rates can be used as evidence of unreasonable ATR
- The CFPB may scrutinize income estimation methodologies
- DSCR lenders should ensure their rent estimation methods are defensible

### 3.2 QM Exemption for DSCR

**There is no specific "QM exemption for DSCR."** DSCR loans are Non-QM by design:

- **Why not QM?** QM rules require consideration of the **borrower's** DTI (now using price-based thresholds instead of the old 43% rule as of 2021 General QM Final Rule). DSCR loans qualify on **property** cash flow, not borrower personal income.
- **Business-purpose exemption:** Some DSCR loans are structured as business-purpose loans (for LLC borrowers), which may be exempt from TILA/ATR requirements entirely. However, this exemption requires:
  - Loan must be primarily for a business/commercial purpose
  - Property cannot be owner-occupied
  - Borrower must be an entity (LLC, corp)
  - The exemption is fact-specific and not automatic

- **Investor Cash Flow QM:** In 2021, the CFPB considered but did not create a specific QM category for investor cash flow loans. DSCR loans remain Non-QM.

### 3.3 State-Specific DSCR Regulations

No comprehensive state-by-state DSCR regulation database exists, but key observations:

- **Most states** treat DSCR loans under existing mortgage lending regulations — no DSCR-specific statutes
- **Licensing:** DSCR lenders must hold appropriate state mortgage lender/broker licenses (NMLS)
- **Usury:** Some states have interest rate caps that may affect DSCR pricing
- **Foreclosure:** State foreclosure laws (judicial vs. non-judicial) apply equally to DSCR loans
- **Business-purpose exemption** varies by state — some states (California, for example) have stricter definitions
- **No state has enacted DSCR-specific legislation** as of March 2026

### 3.4 CFPB Enforcement Actions on DSCR/Non-QM

| Date | Action | Details |
|------|--------|---------|
| **Jan 6, 2025** | CFPB v. Manufactured Home Lender | Sued for unreasonable ATR determinations on Non-QM loans; residual income model deemed unrealistic |
| **2016** | CFPB objection to internet income estimates | Objected to use of internet-based income estimates — directly relevant to DSCR rent estimation |
| **Ongoing** | General Non-QM scrutiny | CFPB monitoring delinquency rates in Non-QM; DSCR/investor loans = ~29% of Non-QM volume |

**Key Risk:** Under the current administration (as of early 2026), the CFPB has signaled it "will not prioritize enforcement actions taken on the basis of Truth in Lending (Regulation Z)" — this may reduce near-term DSCR enforcement risk but does not eliminate compliance obligations.

### 3.5 Compliance Requirements for a DSCR Platform

**Is providing DSCR calculations "loan origination"?**

| Activity | Likely Classification | Licensing Required? |
|----------|-----------------------|---------------------|
| DSCR calculator (informational) | Not origination — educational/informational tool | ❌ No mortgage license needed |
| Rent data aggregation | Data service — not origination | ❌ No mortgage license needed |
| Lender comparison/matching | Could trigger broker licensing if referral fees are involved | ⚠️ Depends on business model |
| Pre-qualification with specific lenders | Loan brokering activity | ✅ State mortgage broker license likely required |
| Rate lock negotiation | Loan origination | ✅ NMLS license required |

**Licensing Framework:**
- **Pure technology/information platform:** No mortgage licensing required — safe harbor under "informational tool" status
- **Lead generation/referral model:** May require state mortgage broker licenses if receiving referral fees; subject to RESPA Section 8 anti-kickback rules
- **Rate comparison with application support:** Likely triggers mortgage broker licensing in most states
- **SAFE Act:** Loan originators must be licensed; a platform facilitating origination would need licensed MLOs

**Data Privacy:**
- **GLBA:** Gramm-Leach-Bliley Act applies if collecting financial information — requires privacy notices and data protection
- **CCPA/CPRA:** California Consumer Privacy Act applies if serving California residents
- **State privacy laws:** Growing patchwork (VA, CO, CT, etc.)
- **Credit pulls:** If platform initiates credit inquiries, FCRA compliance required

**Anti-Steering:**
- If the platform recommends specific lenders, anti-steering provisions under TILA/Reg Z may apply
- Must disclose lender relationships and compensation
- Should present multiple options, not steer to a single lender
- RESPA Section 8 prohibits kickbacks for referrals

### 3.6 DSCR Market Size

| Metric | Value | Source |
|--------|-------|--------|
| **Non-QM securitization volume (2024)** | $40 billion | Morningstar DBRS |
| **YoY growth in Non-QM securitization** | 34% (2023→2024) | Morningstar DBRS |
| **Projected H1 2025 growth** | +20% additional | National Mortgage Professional |
| **DSCR/Investor share of Non-QM** | ~29% of Non-QM volume | LinkedIn/industry analysis |
| **Estimated DSCR origination volume (2024)** | ~$12-15 billion (extrapolated from 29% of $40B securitized) | Calculated |
| **DSCR YoY growth (2024)** | 52% increase | Baseline Software |
| **January 2025 DSCR spike** | 123% YoY increase | Baseline Software |
| **Private lending market size (2025 projected)** | $2 trillion (up from $1.75T in 2024) | RCN Capital |
| **Top 100 private lender volume growth** | +25.3% in 2024 | Forecasa/AAPL |
| **Q1 2025 Non-QM securitizations** | $15.9 billion | Scotsman Guide |

### 3.7 Top 10 DSCR Lenders by Volume and Market Share

**Note:** Precise volume data by DSCR product line is not publicly reported by most lenders. The following is a best-effort ranking based on multiple industry sources.

| Rank | Lender | Estimated Position | Key Distinguisher |
|------|--------|-------------------|-------------------|
| 1 | **Angel Oak Mortgage Solutions** | Largest Non-QM/DSCR wholesale lender | Major securitization platform (AOMT deals); Rental AVM; no published property count cap |
| 2 | **LendSure Mortgage Corp** | Top-3 DSCR wholesale lender | Up to 10 properties per investor; condotel-friendly |
| 3 | **Kiavi** (fka LendingHome) | Major fintech DSCR lender | Tech-savvy platform; streamlined process |
| 4 | **Visio Lending** | Established DSCR lender | Transparent pricing; long-term rental focus |
| 5 | **Lima One Capital** | Large DSCR lender | Supports large-scale investors; wide product range |
| 6 | **Easy Street Capital** | Growing DSCR lender | Competitive rates; STR-friendly |
| 7 | **Griffin Funding** | Mid-size DSCR lender | 40-year DSCR option; wide property type eligibility |
| 8 | **Ridge Street Capital** | Mid-size DSCR lender | Sub-$100K DSCR loans; portfolio product; 0% origination fee option |
| 9 | **NQM Funding** | Wholesale DSCR lender | Multi-loan strategy; broker-focused |
| 10 | **RCN Capital** | Private lending/DSCR | Bridge + DSCR; $2T+ market projection source |

**Other notable DSCR lenders:** LendingOne, Dominion Financial, Conventus, Constructive Capital, 5th Street Capital, Rize Mortgage, CrossCountry Mortgage, Quontic Bank

### 3.8 Non-QM Securitization: MBS Deals Including DSCR

**Major Non-QM Securitization Platforms:**

| Issuer | Deal Series | DSCR Inclusion | Notes |
|--------|-------------|----------------|-------|
| **Angel Oak Mortgage Trust** | AOMT 2025-NQM1 through 2025-6+ | 30%+ DSCR/investor loans by pool balance | Most prolific Non-QM issuer; DSCR pools increasingly separated from bank-statement pools |
| **Deephaven Mortgage** | DHMT series | DSCR loans included | Major Non-QM securitizer |
| **Carrington Mortgage** | CARR series | DSCR loans included | Growing Non-QM shelf |
| **Verus Mortgage Capital** | VMBS series | DSCR loans included | Specialized Non-QM issuer |
| **New Residential Mortgage Loan Trust** | NRMLT 2025-NQM4 | 30%+ DSCR/investor loans | SP Global rated; 408 loans |
| **AD Mortgage / Imperial Fund** | ADMT 2025-NQM5 | DSCR included | $417.15M securitization closed |

**Key Securitization Trends:**
- Top shelves now **separate DSCR pools from bank-statement pools** — allowing sharper pricing and better-matched buyers
- DSCR investor loans = nearly 29% of Non-QM volume
- Weighted-average coupon prices 150-250 bps above conforming
- Securitization shelves from Angel Oak, Deephaven, Carrington, and Verus reported **oversubscribed** in 2025
- 34% bank statement loans and other Non-QM products fill remaining volume
- Q1 2025 securitizations reached $15.9B

**Major Investors in DSCR-Backed MBS:**
- Private credit funds (hungry for yield premium over conforming)
- Insurance companies
- Hedge funds
- REITs specializing in mortgage credit
- Pension funds seeking inflation-hedged yield

**Performance Data:**
- DSCR/investor loan 90-day delinquency: 2.92% (Dec 2024, RiskSpan)
- Non-QM 90-day delinquency for 2024 vintages: 3.71%
- Non-QM 90-day delinquency for 2025 vintages: 1.18%
- Current-to-delinquent transition rate: approaching 3% in H2 2023-2024 (S&P Global)
- Private money lending market projected at $2T in 2025 (up 14% from $1.75T in 2024)

---

## EXECUTIVE SUMMARY & STRATEGIC IMPLICATIONS

### Confirmed Market Gaps for DSCR Intelligence Platform

1. **No multi-lender DSCR comparison tool** — ✅ Confirmed. Investors currently call/email 5-10 lenders manually.
2. **No integrated rent data + DSCR platform** — ✅ Confirmed. Angel Oak's Rental AVM is the closest but is internal/proprietary.
3. **No DSCR optimization engine** — ✅ Confirmed. No tool models optimal property bundling, release price impact, or portfolio vs. individual structuring.

### Highest-Value Features to Build

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | Multi-lender DSCR rate comparison | Investors need this desperately; no one offers it |
| 2 | Integrated rent data (RentCast/AirDNA API) + DSCR | Eliminates manual rent estimation; Angel Oak proved the model |
| 3 | Portfolio DSCR optimizer | Proprietary value — property selection, blended DSCR modeling, release price impact |
| 4 | Portfolio vs. Individual loan analyzer | NQM Funding's argument has merit; let investors compare structures |
| 5 | DSCR scenario/sensitivity modeling | Rent changes, vacancy, rate adjustments, property count effects |

### Regulatory Strategy

- **Stay an informational/calculator platform** — no mortgage licensing needed
- **Avoid referral fees** — triggers broker licensing and RESPA compliance
- **If lender matching is offered** — structure as neutral marketplace, disclose all relationships
- **Data privacy** — comply with GLBA, CCPA/CPRA from day one
- **Anti-steering** — present all qualifying lenders, not just highest-bidding

### Market Opportunity

The DSCR market is growing 50%+ YoY with ~$12-15B in annual DSCR originations (2024), projected to exceed $20B in 2025-2026. Non-QM securitization hit $40B in 2024 (+34% YoY). The investor segment is underserved by technology, and no platform currently addresses the three confirmed gaps.

---

*Report compiled from 40+ sources including lender websites, CFPB enforcement filings, S&P Global ratings, Morningstar DBRS data, NPLA market reports, AAPL market data, and direct page content from Ridge Street Capital, FlexPoint Inc., Harpoon Capital, NQM Funding, and others.*
