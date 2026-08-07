# Master DSCR Knowledge Document

This document synthesizes information from various provided sources related to Debt Service Coverage Ratio (DSCR) loans, including lender guidelines, technical specifications, strategic blueprints, and research reports. The goal is to provide a comprehensive and reconciled view of DSCR lending, prioritizing the most current and authoritative information, particularly primary lender guidelines and validated technical specifications for 2026.

## Table of Contents

1.  Introduction and Core Principles
2.  DSCR Calculation and Income Qualification
3.  Borrower Eligibility
4.  Property Eligibility and Collateral
5.  Pricing, Fees, and Prepayment Penalties
6.  Reserves and Assets
7.  Risk Management and Stress Testing
8.  Lender Intelligence and Program Matching
9.  Technical Architecture and Implementation
10. Compliance and Regulatory Considerations
11. Unit Economics and Business Strategy
12. References

---

## 1. Introduction and Core Principles

DSCR lending is positioned as a sophisticated segment of the non-Qualified Mortgage (Non-QM) market, requiring a deep understanding of capital markets, compliance, and advanced analytics. The market is maturing, with non-QM loans comprising approximately 9% of total lock volume in May 2026, and DSCR loans representing a significant portion of this growth [397]. The prevailing sentiment emphasizes underwriting quality over product label, with a clear trend towards stricter DSCR floors and higher FICO requirements for optimal rates and leverage [398] [401].

### Guiding Principles for Information Synthesis:

When reconciling conflicting information across documents, the following hierarchy of evidence is applied [17] [711]:

1.  **Statutory/Legal Rules:** Highest priority.
2.  **Official Lender Program Guides (Current):** Primary sources like the Cake Mortgage Corp. guidelines (Version 4.0, effective April 1, 2026) are authoritative for specific lender policies [6].
3.  **Verified Market Production Data:** Independently checkable facts and figures [706].
4.  **Dated Technical Specifications/Master Blueprints:** Documents like `TheNext-GenerationDSCRLoanEngine_AMasterBlueprintforanInstitution-GradeDealIntelligenceSystem.pdf` provide the definitive technical framework [721].
5.  **Validated Strategic Memos (2026):** Documents outlining strategic direction and market analysis [397].
6.  **Broker/Rep Quotes (Dated):** Must be dated and used with caution [716].
7.  **Market Rumors/Unverified Notes:** Lowest priority; not to be used for calculations or actionable recommendations [717].

### The Dual-Track Principle:

A fundamental correction across the documentation is the **Dual-Track DSCR Principle**, which distinguishes between lender qualification and investor survival [694] [723]:

*   **Track 1: Lender Qualification DSCR:** This is the official ratio used for loan approval. For 1-4 unit residential rentals, it typically uses the appraiser's market rent (Form 1007) with **no vacancy deduction**, as market rent is presumed to account for natural vacancy. For Short-Term Rentals (STRs), a standardized reduction (e.g., 20%) may be applied to projected income to account for vacancy/fees [695] [724].
*   **Track 2: Investor Survival DSCR:** This is a stress test for real-world performance, modeling actual cash flow. It incorporates a vacancy rate, management fees, maintenance, and potentially CapEx. A deal can pass Track 1 but fail Track 2, indicating it qualifies for a loan but may not be profitable to operate [696] [725].

The system must always show both DSCR tracks and never blend lender qualification with investor survival [651] [663].

---

## 2. DSCR Calculation and Income Qualification

### Core DSCR Formula:

DSCR is generally calculated as **Gross Rental Income ÷ Qualifying Monthly Mortgage Payment** [25].

*   For fully amortizing loans, the qualifying payment is **PITIA** (Principal, Interest, Taxes, Insurance, Association dues) [26].
*   For interest-only (IO) loans, the qualifying payment is **ITIA** (Interest, Taxes, Insurance, Association dues) [27]. IO payments can provide 15% to 22% denominator relief in DSCR calculations [298].
*   Rounding up the DSCR ratio is **not permitted** [28].

### Rent Treatment Hierarchy (Long-Term Rentals - LTR):

For purchase and refinance of LTR properties, qualifying rent typically uses the **higher** of FNMA Form 1007/1025 market rent or current lease, provided the difference does not exceed 20% [31].

*   If vacant, a new tenant's lease can qualify up to 120% of Form 1007/1025 market rent, with documented security deposit and first month's rent [32].
*   If Form 1007 market rent exceeds lease by >20%, up to 120% of lease amount may be used [33].
*   If current lease exceeds Form 1007 by >20%, the higher lease amount may be used with two months of proof of rent receipt from the seller [34].
*   For unleased units (1-4 units), no vacancy factor is applied, and 100% vacancy is permitted [44] [46].
*   The 
"Lower-Of Rule" (lesser of signed lease or Form 1007 market rent) is also cited as a common lender policy, highlighting the need for configurable income policy engines [58] [726].

### Short-Term Rental (STR) Qualification:

STR income qualification is complex and requires a tiered approach, often gated by legality checks [536]:

1.  **Legality Gate:** STR legality must be confirmed before STR income is considered. Statuses include CLEAR, RESTRICTED, UNCERTAIN, and PROHIBITED. If PROHIBITED, STR income is disabled [540].
2.  **Income Methods:** When documented using multiple sources, the **lowest monthly income figure must be used** [37]. Acceptable methods include:
    *   Form 1007/1025 comparable rent schedule (appraiser indicates occupancy/vacancy factor, or a default 20% vacancy factor is applied) [39].
    *   Most recent 12-month rental history statement from a third-party service (excluding food/vendor fees) [41].
    *   **AirDNA Rentalizer/Property Earning Potential Report** (for purchases only). Gross rents are reduced by a 20% occupancy/vacancy rate. The report must cover 12 months, be dated within 90 days, include 3 comparables, have a market score >= 60, and limit occupancy to 2 individuals per bedroom [42].

The default STR stress assumption is a 20% reduction on projected revenue, but this is not a universal lender law [546].

---

## 3. Borrower Eligibility

Borrower eligibility extends beyond U.S. citizens and permanent residents, though specific requirements vary by lender.

### Eligible Categories:

*   **U.S. Citizens and Permanent Residents:** Eligible without significant restrictions [62] [63].
*   **Non-Permanent Resident Aliens:** Eligible with evidence of legal U.S. presence and work authorization (unexpired visa/EAD) [64].
*   **ITIN Borrowers:** Non-permanent resident aliens without an SSN may qualify using an ITIN, requiring a valid ITIN card/letter and government-issued photo ID [65].
*   **Foreign Nationals:** Eligible but subject to specific rules. They must live and work in another country, provide a valid passport and visa/ESTA, and undergo OFAC screening. Power of Attorney (POA) is not permitted. U.S. credit reports are not strictly required; alternative credit documentation (international reports, reference letters, foreign bank statements) is acceptable [87] [89] [90] [95].

### Experience Tiers:

*   **Experienced Investor:** Must have owned at least one non-owner-occupied residential or commercial income-producing property for at least 12 months within the prior 3 years, or be actively employed in property management [68].
*   **First-Time Investor:** Currently owns or previously owned a primary residence, and this is their first investment property purchase, or has owned an investment property for less than 12 months. Requires at least 12 months of verifiable housing payment history [69] [70].
*   **First-Time Homebuyer (FTHB):** Has never owned any real property. Eligible for DSCR, but requires a rent-free letter if they lack 12 consecutive months of rental history [71] [72].

### Entity Vesting and Guarantors:

*   Title vesting in U.S. domestic LLCs, partnerships, or corporations is acceptable for business-purpose transactions [100].
*   Entities are typically limited to a maximum of 4 owners [102].
*   A minimum of 25% of entity ownership must be represented as borrowers on the loan [103].
*   **Personal Guarantors:** Required when lending to an entity. Must be provided by members/managers representing at least 51% cumulative ownership. The guaranty must be full recourse [106] [109] [110].
*   Layered LLCs are permitted up to two layers, provided the personal guarantor owns at least 51% of the borrowing entity and all ascending LLCs [113] [115].

### Credit Requirements:

*   A tri-merged credit report is required, dated within 120 days of the note [136] [139].
*   Minimum of two credit scores required; qualifying score is the lower of two or middle of three [143] [144].
*   Tradeline requirements vary but generally require 3 tradelines reporting for 12 months or 2 tradelines for 24 months. Alternative tradelines (rent, utilities) may be allowed [148] [150].
*   Charge-offs and collections may be ignored for DSCR loans unless they are title-impacting [154].
*   Active forbearance plans are not permitted [156].

---

## 4. Property Eligibility and Collateral

### Eligible Property Types:

*   Single-family detached and attached
*   2-4 unit residential
*   **5-8 unit residential properties (DSCR only)** [213]
*   Condominiums (Warrantable and Non-Warrantable)
*   Condotels
*   Manufactured and modular homes
*   Properties with ADUs (classification depends on county/appraiser) [203]

### Ineligible Property Types:

*   Assisted living/group homes
*   Agricultural properties/rural properties exceeding 20 acres
*   Properties with C5 or C6 condition ratings
*   Co-ops, fractional ownership/timeshares
*   Mixed-use or commercial properties
*   Properties under 500 sq. ft. of living space [214]

### Condominium Rules:

*   **Warrantable Condos:** FNMA-eligible projects are permitted [228].
*   **Non-Warrantable Condos:** Eligible subject to exceptions (e.g., subject unit 100% residential, project complete, at least 50% units sold/under contract) [229] [231].
*   **Condotels:** Individually owned units with hotel amenities. Eligible if common elements complete, 50% units sold, minimum 500 sq. ft., and full kitchen [232].
*   Investor concentration within a project may exceed established criteria, up to 100% [236].

### Appraisals:

*   Full interior/exterior appraisal required, following FNMA/FHLMC standards [198].
*   Loans >= $2,000,000 require a second appraisal [201].
*   Appraisal review product (CU, LCA, or desk review) required on every loan unless a second appraisal is obtained [202].
*   Appraisals must be dated within 120 days prior to the note date [209].

### Multifamily Collateral (5-9 Units):

*   Minimum DSCR 1.00 [259].
*   Loans >= $2,000,000 require DSCR >= 1.00 and Debt Yield >= 9% [261].
*   STR income is not eligible [265].
*   Minimum reserves are 6 months (12 months for foreign nationals) [267].

---

## 5. Pricing, Fees, and Prepayment Penalties

### Rate Calibration and Pricing Solver:

Rates are dynamic and must be presented as a **triplet**: [Competitive / Typical / Full-Market] [701].

*   **Mid-2026 Pricing Anchor:** 6.125% fixed rate at par for a strong file (740 FICO, 70% LTV) [700].
*   **Planning Bands:** ~6.125%–6.49% (competitive), 6.50%–7.50% (typical), 7.50%–10.75%+ (thin/higher-risk) [515].
*   **Iterative Pricing Solver:** The system must solve the circular loop of Rate → P&I → PITIA → DSCR → pricing tier → revised rate, using dampening heuristics to prevent oscillation [528] [386].

### Loan-Level Price Adjustments (LLPAs):

Pricing is heavily influenced by FICO, LTV, DSCR, and property characteristics [303-339]:

*   **FICO:** Sharp penalties for scores below 680 (+0.500% to +2.500%).
*   **LTV:** Premiums for LTVs > 75% (+0.400% to +0.900%).
*   **DSCR:** Penalties for DSCR < 1.10 (+0.350% to +0.850%).
*   **Property/Structure:** Overlays for IO (+0.250%), non-warrantable condos (+0.500%), condotels (+0.750%), STR use (+0.300%), and foreign nationals (+0.750% to +1.500%).

### Prepayment Penalties (PPP):

PPP structures are critical to DSCR economics and must be state-aware [556] [735]:

*   **Standard Structure:** 5-4-3-2-1 (5% penalty in year 1, 4% in year 2, etc.).
*   **Penalty Formula:** Penalty equals the **outstanding principal balance at exit multiplied by the applicable penalty rate** [556].
*   **State-Law Gating:** PPPs are banned or restricted in several states (e.g., PA, OH, MN, MS, NJ, IL, NM, AK) [736-740] [330].
*   **Repricing Mechanism:** If a PPP is illegal or unavailable, the system must apply a "no-PPP premium" (e.g., +0.25% rate and/or 0.625% fee) and recalculate all metrics [562] [741].

---

## 6. Reserves and Assets

### Reserve Requirements:

Reserves should be presented as a range (Likely, Conservative, Stress-case) rather than a single number [548].

*   **Prime Profile (1.25+ DSCR, 740 FICO, <=70% LTV):** 3 months PITIA [349].
*   **Standard Profile (1.00 to 1.24 DSCR):** 6 months PITIA [350].
*   **High-Risk / Sub-1.0 DSCR:** 9 to 12 months minimum, up to 18 months for no-ratio [351].
*   **Portfolio Drag:** Add 2 months of PITIA reserves for every additional financed property owned by the borrower [356].
*   Reserves may be waived for rate-and-term refinances producing a payment savings of >= 10% [189].

### Asset Eligibility and Haircuts:

Assets do not require seasoning for DSCR loans under certain guidelines [179].

*   **Liquid Cash/Checking/Savings:** 100% [180].
*   **Marketable Securities:** 100% of vested account value (excluding margin) [180].
*   **Retirement Accounts:** 70% of vested balance if >= 59.5 years old; 50% if younger [180].
*   **Cryptocurrency:** 0% for reserves (due to volatility/compliance), or 60% if liquidated/deposited to a U.S. bank [180] [357].
*   **Gift Funds:** Permitted (up to 100% gift), but borrower must demonstrate 10% of their own funds for down payment [183] [184].

---

## 7. Risk Management and Stress Testing

The engine must incorporate a Monte Carlo Risk Engine and comprehensive stress testing to evaluate investor survivability [675].

### Stress Test Scenarios:

*   **Rent Shocks:** -5%, -10%, -15% [603].
*   **Rate Shocks:** +25, +50, +100 bps [603].
*   **Insurance Shocks:** +10%, +25%, +50% [603].
*   **Joint Appraisal Shock:** Evaluates the combined impact of a value shortfall (increases cash needed) and a rent shortfall (lowers DSCR) [605].
*   **Other Shocks:** Tax reassessment, vacancy shock, STR regulatory shutdown, reserve depletion, ARM reset, IO recast [603].

### Deal Kill Criteria:

Automated gates must stop flawed transactions before manual underwriting [595]:

*   STR prohibited by local regulations or HOA.
*   PPP illegal or unavailable for the priced structure.
*   FICO below all known floors.
*   Track 1 DSCR below realistic lender floor.
*   Track 2 DSCR materially negative without borrower acknowledgment.
*   Value shortfall cash gap unfundable.
*   Reserves not liquid or unacceptable.

### Deal Rescue Engine:

The system must provide pathways to rescue failing deals, distinguishing between Track 1 (qualification) and Track 2 (economics) failures [597]:

*   **Track 1 Rescue Levers:** Increase down payment, lower rate (points buydown), switch to IO, change PPP structure, change lender program [599].
*   **Track 2 Rescue Levers:** Raise rent, reduce management/insurance costs, self-manage, increase down payment, accept negative carry [599].
*   Rescue strategies must be ranked by cash required, DSCR improvement, certainty, and true cost over the hold period [601].

---

## 8. Lender Intelligence and Program Matching

Lender recommendations must be dynamic, evidence-backed, and freshness-aware, rejecting static rankings [589].

### Provenance and Confidence Rules:

*   **No-Render Rule:** A lender program cannot be shown as actionable unless it has a verified date, source record, confidence score, and policy version [639] [709].
*   **Evidence Hierarchy:** Statutory rules > Official Program Guides > Verified Market Data > Dated Rate Sheets > Broker Quotes [711].
*   **Confidence Scoring:** Claims with confidence >= 80 can appear in recommendations; 60-79 as conditional fits; < 60 as research notes only [573].
*   **Two-Quote Rule:** Every recommendation must force the user to see at least two competing lender options [747].

### Lender Fit Output:

Lenders must be classified into qualitative tiers: Strong fit, Standard fit, Conditional fit, Weak fit, Not eligible, or Needs reverification [591] [645].

### Key Lender Profiles (Mid-2026 Working View):

*   **Griffin Funding:** Benchmark for sub-1.0/low-DSCR, no-ratio, jumbo DSCR, and micro-condos [579] [377].
*   **Visio:** Strong STR and investor-rental specialist, including unique assets (A-frames, rural cabins) [584] [367].
*   **Kiavi:** Tech-forward, rapid closings, AVM-heavy [583] [368].
*   **Deephaven:** Aggressive sub-1.0 posture, offers DSCR second-lien mortgages [366].
*   **Angel Oak:** Deep exception underwriting, strong in non-warrantable condos [378].
*   **Ready Capital:** Commercial/multifamily bridge specialist (5-10 units) [381].

---

## 9. Technical Architecture and Implementation

The engine is designed as an "Investment Decision Simulator" utilizing advanced analytics [671].

### Core Components:

*   **AI Qualification Predictor:** An XGBoost binary classifier using SHAP for explainability, trained on 10,000+ historical records (potentially via Bayesian transfer learning) [673] [686].
*   **Monte Carlo Risk Engine:** Runs 10,000 iterations per scenario using Copula-GARCH models to capture non-linear dependencies between economic variables [675].
*   **Deterministic Solvers:** Uses bisection or damped iteration for recursive pricing, max purchase price, and deal-break rate calculations [342] [387].

### Tech Stack:

*   **Frontend:** Next.js/React with TypeScript, React Hook Form, Zod, TanStack Table, Recharts/Visx, Zustand/Redux [631].
*   **Backend:** Python 3.11+ with FastAPI, deterministic math module, pricing solver, lender-rules engine [631].
*   **Database:** PostgreSQL with relational tables for policies, evidence, scenarios, and audit logs [633].
*   **Storage/Jobs:** S3-compatible storage for documents; Celery + Redis for background jobs (confidence decay, rate refresh) [635].

### Testing Requirements:

The CI pipeline must validate golden formulas, including amortizing P&I, IO payment, PITIA, Track 1/Track 2 DSCR, lower-of-rent logic, reserve ranges, PPP remaining balance, and fixed-point pricing solver convergence [637] [513].

---

## 10. Compliance and Regulatory Considerations

DSCR lending is fundamentally a compliance business.

*   **Business Purpose:** DSCR loans are federally business-purpose and typically outside TRID/ATR, but state treatment varies [416].
*   **"LLC Wrapper" Trap:** Closing in an entity does not guarantee business-purpose treatment; true occupancy/business-purpose attestations and corroborating evidence are required [418].
*   **Fair Lending:** Compliance with FHA, ECOA, and nondiscrimination policies is mandatory [22].
*   **ATR Rules:** Even in Non-QM, lenders must make a reasonable, good-faith determination of repayment ability [766].
*   **State Licensing:** A phased approach is recommended: broker-only model -> hybrid model (business-purpose + selected licenses) -> fully licensed direct lender [416].

---

## 11. Unit Economics and Business Strategy

The business plan must prove solvency and operational discipline [615].

*   **Unit Economics Tracking:** Must track average loan amount, broker compensation bps, gross revenue per funded loan, lead cost, CAC, pull-through rate, and breakeven funded loans per month [615].
*   **Channel Performance:** Track metrics by acquisition channel (SEO, referrals, paid leads) to tie marketing directly to funded-loan quality [619].
*   **Capital Partner Relationships:** Maintain 3-5 active DSCR lender outlets to manage concentration risk (no single lender > 40% submitted volume or 50% locks) [625].
*   **Repeat-Borrower CRM:** Monitor portfolio metrics (PPP expiration, equity thresholds, lease renewals) to trigger lifecycle-management prompts [613].

---

## 12. References

[1] CAKE Mortgage Corp. Wholesale Lending Division DSCR Loan Eligibility Guidelines, Version 4.0, Effective April 1, 2026.
[2] Apex Master Specification: Next-Generation DSCR Deal Engine v5.0 (Mid-2026 Framework).
[3] Building an Extremely Profitable DSCR Loan Company: The Definitive 2026 Master Blueprint.
[4] DSCR Deal Command Center v8.4.
[5] Validating the Decision Simulator: A Technical and Market Analysis of the 20X DSCR Deal Engine's Core Proprietary Moats.
[6] Deconstructing the Master Audit: A Verified Framework for a Next-Generation Dual-Track DSCR Loan Engine.
[7] The Next-Generation DSCR Loan Engine: A Master Blueprint for an Institution-Grade Deal Intelligence System.
