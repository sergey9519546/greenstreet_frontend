# DSCR Lender Document Requirements — Comprehensive Guide

> **Last Updated:** March 2026 | **Purpose:** Platform reference for exact document requirements per DSCR lender, condition patterns, and submission processes.

---

## Table of Contents

1. [Standard DSCR Document Requirements](#1-standard-dscr-document-requirements)
2. [Lender-Specific Requirements](#2-lender-specific-requirements)
3. [STR-Specific Document Requirements](#3-str-specific-document-requirements)
4. [Entity Document Requirements](#4-entity-document-requirements)
5. [Appraisal Requirements](#5-appraisal-requirements)
6. [Condition Sheet Patterns](#6-condition-sheet-patterns)
7. [Insurance Requirements](#7-insurance-requirements)
8. [Rent Verification Methods](#8-rent-verification-methods)
9. [Submission Process Overview](#9-submission-process-overview)
10. [Platform Implementation Notes](#10-platform-implementation-notes)

---

## 1. Standard DSCR Document Requirements

### 1.1 What DSCR Loans Do NOT Require (vs. Conventional)

| Document | Conventional | DSCR |
|----------|:------------:|:----:|
| W-2s / Pay Stubs | Required | **NOT required** |
| Personal Tax Returns (1040) | Required | **NOT required** |
| IRS Tax Transcripts | Required | **NOT required** |
| Employment Verification (VOE) | Required | **NOT required** |
| Debt-to-Income (DTI) Calculation | Required | **NOT required** |
| Personal Income/Employment section on 1003 | Required | **Left blank** |

### 1.2 Universally Required Documents

These documents are required by virtually all DSCR lenders:

#### A. Personal / Borrower Documents
| Document | Notes |
|----------|-------|
| **1003 Uniform Residential Loan Application** | Standard application; employment section left blank |
| **Government-issued Photo ID** | Driver's license, passport, or state ID |
| **Social Security Number** | For credit pull |
| **Credit Authorization** | Signed permission for tri-merge credit pull |
| **Personal Guaranty** | Required when closing in entity name |

#### B. Property Documents
| Document | Notes |
|----------|-------|
| **Purchase Contract** | For acquisition transactions |
| **Existing Mortgage Statement** | For refinance transactions (most recent) |
| **Lease Agreement(s)** | If tenant-occupied; signed by all parties |
| **Rent Roll** | Unit-by-unit breakdown: unit #, BR/BA count, lease rent, deposit, lease dates, occupancy |
| **HOA Documents** | If applicable — bylaws, financials, rental restrictions |

#### C. Income / Rent Verification
| Document | Notes |
|----------|-------|
| **Appraisal with Form 1007** | Single-Family Comparable Rent Schedule (1-unit properties) |
| **Appraisal with Form 1025** | Small Residential Income Property Appraisal Report (2-4 units) |
| **Market Rent Opinion** | Part of the appraisal — drives DSCR calculation |

#### D. Entity Documents (if closing in LLC)
| Document | Notes |
|----------|-------|
| **Articles of Organization** | State-issued formation document |
| **Operating Agreement** | Signed by all members; defines ownership/management |
| **EIN Confirmation Letter** | IRS-issued Employer Identification Number |
| **Certificate of Good Standing** | Required if LLC registered >1 year |
| **Foreign Entity Registration** | If LLC state ≠ property state |

#### E. Insurance Documents
| Document | Notes |
|----------|-------|
| **Landlord / Dwelling Policy (DP-3)** | Must be replacement cost, not ACV |
| **General Liability Insurance** | Minimum $100K per occurrence typical |
| **Flood Insurance** | Required if property in Special Flood Hazard Area |
| **Rent-Loss Coverage** | 6 months typical; required by some lenders |

#### F. Reserve / Asset Documentation
| Document | Notes |
|----------|-------|
| **Bank Statements** | 2-3 months personal; 2-3 months business/entity |
| **Reserve Verification** | 3-12 months PITIA depending on lender and loan size |

#### G. Closing / Compliance
| Document | Notes |
|----------|-------|
| **Business Purpose Letter** | Confirms investment-purpose, non-owner-occupied |
| **Occupancy Affidavit** | Confirms property will not be owner-occupied |

### 1.3 Key Differences from Conventional Loans

- **No income verification** — The employment/income section of the 1003 is left blank
- **Property qualifies the loan** — DSCR ratio (rent ÷ PITIA) replaces DTI
- **Entity vesting allowed** — LLCs can hold title at closing (unlike conventional)
- **Appraisal includes rent schedule** — Form 1007/1025 is mandatory, not optional
- **Reserves replace income docs** — Bank statements showing liquid reserves instead of pay stubs
- **Business purpose affidavit required** — Confirms non-owner-occupied investment intent

---

## 2. Lender-Specific Requirements

### 2.1 Kiavi

| Category | Details |
|----------|---------|
| **Min Credit Score** | 660 |
| **Min DSCR** | 1.0 (0.75 available with 25%+ down) |
| **Max LTV** | 80% (75% for DSCR <1.0) |
| **Loan Amounts** | Not published; typically $100K-$3M |
| **States** | All 50 |
| **Closing Time** | 15-30 days |
| **Experience Required** | No |

**Kiavi Document Checklist:**
- Government-issued ID
- Lease agreement or rent roll
- Property insurance declaration page
- Bank statements (3 months for reserves)
- Entity documents (if LLC)
- Credit authorization (soft pull to start, hard pull later)
- No W-2s, tax returns, or pay stubs required

**Kiavi Submission Process:**
1. **Step 1: Online Application** (15-30 min) — Submit via Kiavi's portal; no hard credit pull initially
2. **Step 2: Document Upload** (1-3 days) — Upload required docs through portal
3. **Step 3: Appraisal** (7-10 days) — Kiavi orders the appraisal; includes rental market analysis
4. **Step 4: Underwriting & Conditions** — Typical conditions: title work, final insurance verification, reserve documentation
5. **Step 5: Clear to Close** (1-3 days) — Total timeline: 15-30 days

**Kiavi-Specific Notes:**
- Technology-forward platform with real-time loan visibility
- Portfolio pricing available for multi-property investors
- Prepayment penalty: 3-year typical (3-2-1 structure)
- Reserve requirement: 6-9 months PITIA (varies by # of financed properties)
- Appraisal cost: $400-$600
- Origination fee: 1-2 points

---

### 2.2 Visio Lending

| Category | Details |
|----------|---------|
| **Min Credit Score** | 680 (720+ for best pricing) |
| **Min DSCR** | 1.0 (firm floor — no exceptions) |
| **Max LTV** | 80% |
| **Loan Amounts** | $100K - $5M ($7M in select cases) |
| **States** | 48 (excludes AK, HI) |
| **Closing Time** | 28-32 days |
| **Experience Required** | Yes — 1+ rental property |

**Visio Document Checklist:**
- Photo ID
- Proof of property ownership (showing investment experience)
- Lease agreements or rent roll
- Property insurance declaration page
- Bank statements (reserves verification)
- Entity documents (if closing in LLC)
- Credit authorization
- STR documentation (if applicable — see below)

**Visio Submission Process:**
1. **Step 1: Pre-Qualification** (Day 1) — Online form (10-15 min); soft credit pull; preliminary rate quote within 24-48 hours
2. **Step 2: Full Application** (Days 2-4) — Full application with property details; upload initial documents
3. **Step 3: Processing & Appraisal** — Appraisal ordered with rent schedule
4. **Step 4: Underwriting** — Conditions issued
5. **Step 5: Closing** — 28-32 days typical

**Visio-Specific Notes:**
- Most competitive rates for 740+ credit borrowers (up to 0.50% better than competitors)
- Strict DSCR floor at 1.0 — no exceptions (unlike Griffin at 0.75 or Easy Street)
- 5-year prepayment penalty standard track (5-4-3-2-1); 3-year alternative (3-2-1) with 0.50% rate add
- Granular credit score tiers: 780+, 740-779, 720-739, 700-719, 680-699
- STR income accepted with 24 months operating history + tax returns + platform reports
- No vacancy factor applied in DSCR calculation (unique advantage)
- Comfortable with LLCs, trusts, various holding structures
- Fees: Underwriting $500, Processing $495, Appraisal $450-$700, Credit report $50-$75, Flood cert $15-$25

---

### 2.3 Lima One Capital

| Category | Details |
|----------|---------|
| **Min Credit Score** | 660 (640 in some cases) |
| **Min DSCR** | 1.0 (0.90 with compensating factors) |
| **Max LTV** | 80% |
| **Loan Amounts** | $75K - $5M |
| **States** | All 50 |
| **Closing Time** | 20-30 days |
| **Experience Required** | No |

**Lima One Document Checklist:**
- Government-issued ID
- Lease agreement or rent roll
- Property insurance
- Bank statements (reserves)
- Entity documents (if LLC)
- Credit authorization
- Purchase contract or mortgage statement

**Lima One Program Variations:**
- **Standard DSCR:** DSCR ≥ 1.0, 660+ credit
- **Low-DSCR Program:** DSCR 0.75-0.99, requires 25% down + 680+ credit
- **High-Balance DSCR:** Loans above $1.5M, requires DSCR 1.25+ and stronger profile

**Lima One-Specific Notes:**
- Institutional backing from MFA Financial (publicly-traded REIT)
- Full suite of investor products: DSCR, fix-and-flip, bridge, construction, multifamily
- Origination fee: 1.0 points (processing & underwriting included)
- Appraisal: $450-$750
- More flexible on property condition than some competitors
- DSCR requirements differ for long-term vs. short-term rental programs
- Reserve requirement varies: standard ~6 months PITIA

---

### 2.4 Griffin Funding

| Category | Details |
|----------|---------|
| **Min Credit Score** | 660 nationwide; 640 in CA with compensating factors |
| **Min DSCR** | 1.0 (0.75 accepted; 0.95 in CA with compensating factors) |
| **Max LTV** | 80% (85% in select CA situations) |
| **Loan Amounts** | $150K - $4M ($5M+ in select CA markets) |
| **States** | All 50 (strongest in CA, AZ, NV, OR, WA) |
| **Closing Time** | 18-30 days |
| **Experience Required** | No |

**Griffin Funding Document Checklist:**
- Photo ID
- Lease agreement or rent roll
- Insurance quote/declaration page (3 months)
- Bank statements (reserves — 6-12 months PITIA depending on portfolio)
- Entity documents (if LLC)
- Credit authorization
- Personal identification documents
- Credit report
- Rent schedule (via appraisal)
- Tenant/occupancy information
- Articles of organization (if LLC)

**Griffin Funding-Specific Notes:**
- California specialist: 85% LTV available for 740+ credit + 1.25+ DSCR in CA
- Higher reserve requirements for CA: 9/12/15 months vs. 6/9/12 months elsewhere
- Mello-Roos taxes included in DSCR calculation (unique for CA)
- Accepts STR income: 24 months history + tax returns + platform reports; income at 75% of trailing 12-month
- Comfortable with series LLCs, trusts, partnerships
- California appraisals run $700-$850 vs. $500 typical elsewhere
- Fee structure: Origination 0.50-2.0 points, Processing $695, Underwriting $500
- Prepayment penalty: 3-year (3-2-1) standard, 0.50% rate add for no-PPP option
- Reserve scale: 1-4 properties: 6 mo PITIA; 5-10: 9 mo; 11+: 12 mo (CA: add 3 months each tier)

**Griffin DSCR Document Checklist (Published by Griffin):**
1. Personal identification documents
2. Credit report
3. A rent schedule (Form 1007)
4. Tenant/occupancy information
5. Articles of organization (if borrowing in LLC)
6. Proof of rental income (real or projected)
7. Property insurance documentation

---

### 2.5 Angel Oak Mortgage Solutions

| Category | Details |
|----------|---------|
| **Min Credit Score** | 640-680 (varies by program) |
| **Min DSCR** | 1.0 (standard); No-ratio option available |
| **Max LTV** | 80% |
| **Loan Amounts** | Varies by channel |
| **States** | Nationwide (wholesale/correspondent) |
| **Closing Time** | Varies by broker/correspondent |
| **Experience Required** | Varies |

**Angel Oak Document Checklist:**
- Standard DSCR document package
- No personal income or employment information required
- Property appraisal with rent schedule (Form 1007 or 1025)
- Lease agreements or rent roll
- Entity documentation (if LLC)
- Credit authorization

**Angel Oak-Specific Notes:**
- **Industry-first Rental AVM:** Angel Oak launched a proprietary Rental AVM that instantly generates a rental income estimate upon pre-qualification — potentially replacing or supplementing the traditional 1007 form
- Wholesale/correspondent lender — loans originated through broker channel
- Investor Cash Flow Loan program is their primary DSCR product
- No personal income or employment verification required
- STR income accepted with proper documentation
- The Rental AVM can speed up pre-qualification significantly

---

### 2.6 LendSure Mortgage Corp

| Category | Details |
|----------|---------|
| **Min Credit Score** | Varies by wholesale partner |
| **Min DSCR** | Per program guidelines |
| **Max LTV** | Per program guidelines |
| **Loan Amounts** | Varies |
| **States** | Nationwide (wholesale) |
| **Closing Time** | Varies by broker |
| **Experience Required** | Varies |

**LendSure Document Checklist:**
- Completed Schedule of Real Estate Owned
- No additional income documentation required ("The Ratio is Your Income")
- Simplified documentation approach
- Standard DSCR document package through broker

**LendSure-Specific Notes:**
- **Wholesale-only lender** — works exclusively through mortgage brokers
- "DSCR Wholesale Power" program with simplified documentation
- Only requires a completed Schedule of Real Estate Owned (no income docs)
- Focus on broker-friendly processes and quick turn times
- Investor Cash Flow (DSCR) uses property cash flow only — no other income documents required
- Pricing and terms vary by wholesale partner/broker

---

### 2.7 Ridge Street Capital

| Category | Details |
|----------|---------|
| **Min Credit Score** | Varies by program |
| **Min DSCR** | 1.0 (typical) |
| **Max LTV** | 80% |
| **Loan Amounts** | Varies |
| **States** | 35 states |
| **Closing Time** | Varies |
| **Experience Required** | No |

**Ridge Street Capital Document Checklist:**

**For the LLC:**
- Articles of Organization / Certificate of Formation
- Operating Agreement (signed by all members)
- EIN Letter (IRS-issued)
- Certificate of Good Standing (if LLC >1 year old)
- Foreign Entity Registration (if LLC state ≠ property state)

**For the Guarantor(s):**
- Government-issued photo ID
- 2 months personal bank statements (verifying liquidity for down payment + reserves)
- Tri-merge credit report (pulled by lender)

**For the Property:**
- Purchase contract (if purchase)
- Existing mortgage statement (if refinance)
- Lease agreement or rent roll
- Property insurance
- Appraisal with rent schedule

**Ridge Street-Specific Notes:**
- **6 states require LLC closing:** GA, HI, MA, NY, RI, PA — DSCR must close in LLC
- **"To Be Formed" entities accepted** — can apply before LLC is registered; LLC must be formed before closing
- STR specialist: uses AirDNA for income projections (80% of projected figures)
- Foreign Entity Registration required when LLC state differs from property state
- STR income projected using AirDNA comparable data with 80% factor applied

---

### 2.8 Easy Street Capital

| Category | Details |
|----------|---------|
| **Min Credit Score** | 640 (lower than most competitors) |
| **Min DSCR** | 0.75 (among the lowest in market) |
| **Max LTV** | 80% |
| **Loan Amounts** | Varies |
| **States** | Nationwide |
| **Closing Time** | Can close in 24 hours (for some products) |
| **Experience Required** | No |

**Easy Street Capital Document Checklist:**
- Application
- Credit authorization
- Bank statements
- Property insurance
- Leases
- Short-term rental history (if STR property)
- Entity documents (if LLC)

**Easy Street-Specific Notes:**
- **America's leading STR lender** — most innovative in short-term rental DSCR
- **Lowest DSCR minimum: 0.75** — accessible for properties with negative cash flow
- **Lowest credit minimum: 640** — most accessible for credit-challenged borrowers
- No appraisal required for some products (high leverage, 24-hour close)
- AirDNA case study partner — uses AirDNA for STR income underwriting
- Over $1.1 billion funded across 3,400+ DSCR loans
- "Easy Rent" long-term loan product for up to 10 units including mixed-use and STR
- Good option for first-time investors and marginal borrowers
- STR income verification: booking platform statements, property management reports

---

## 3. STR-Specific Document Requirements

### 3.1 Additional Documents Required for Short-Term Rental Properties

| Document | Required By | Notes |
|----------|-------------|-------|
| **STR Operating History** | Most lenders | Minimum 12-24 months |
| **Platform Income Reports** | Visio, Griffin, Easy Street | Airbnb/VRBO payout history, 1099-K |
| **Tax Returns Showing Rental Income** | Visio, Griffin | Schedule E showing STR income |
| **AirDNA Market Report** | Ridge Street, Easy Street | Third-party STR market data |
| **Property Management Statements** | Various | If using professional management |
| **STR Permit / License** | Varies by jurisdiction | Local compliance documentation |
| **STR-Specific Insurance** | All STR lenders | Commercial hospitality policy or STR endorsement |

### 3.2 How Lenders Evaluate STR Income

**Three Income Evaluation Methods:**

1. **Operating History (Trailing 12-24 Months)**
   - Bank statements showing STR deposits
   - Platform-generated income reports (Airbnb, VRBO)
   - Tax returns with Schedule E
   - **Visio:** Requires 24 months history + tax returns + platform reports; income at 75% of trailing 12-month
   - **Griffin:** Same 24 months; income at 75% of trailing 12-month

2. **AirDNA / Comparable Market Data (No Operating History)**
   - Used for STR acquisitions without rental history
   - **Ridge Street:** Uses AirDNA, applies 80% of projected figures, filters for comparable properties (unit type, bedroom count, property tier) within defined radius
   - **Easy Street:** Uses AirDNA for STR income underwriting (case study partner)
   - **Angel Oak:** Rental AVM provides instant STR income estimates

3. **Supplemental Appraisal Form / AMC Analysis**
   - Some programs require an STR analysis by an Appraisal Management Company
   - Note: Form 1007 **cannot** be used for STR properties — it only supports long-term rental comparables

### 3.3 STR Income Reductions Applied by Lenders

| Lender | STR Income Factor | Notes |
|--------|:-:|------|
| **Ridge Street** | 80% | Applies 80% of AirDNA projected figures |
| **Visio** | 75% | Of trailing 12-month revenue |
| **Griffin** | 75% | Of trailing 12-month revenue |
| **General Market** | 75-80% | Standard 20-25% reduction for vacancy/variability |
| **Some programs** | Higher DSCR required | e.g., 1.25 minimum instead of 1.0 |

### 3.4 STR Permit Requirements

- Varies by municipality — no universal lender requirement
- Some cities require STR registration/license (e.g., Austin, Nashville, Denver)
- Lenders may require proof of STR legality in the jurisdiction
- HOA rental restrictions must be reviewed — some prohibit STRs entirely

---

## 4. Entity Document Requirements

### 4.1 Standard LLC Documentation for DSCR Loans

| Document | Always Required? | Notes |
|----------|:----------------:|-------|
| **Articles of Organization** | Yes | State-issued formation document; entity name, formation state, active status |
| **Operating Agreement** | Yes (most lenders) | Signed by all members; defines ownership/management structure; reviewed for ownership percentages |
| **EIN Confirmation Letter (CP575/147C)** | Yes | IRS-issued tax ID for the entity |
| **Certificate of Good Standing** | If LLC >1 year | Confirms entity is active and compliant with state |
| **Foreign Entity Registration** | If LLC state ≠ property state | E.g., Delaware LLC purchasing in FL must register as foreign entity in FL |
| **Personal Guaranty** | Yes | Individual guarantor(s) provide personal guarantee |

### 4.2 Single-Member LLC vs. Multi-Member LLC

| Aspect | Single-Member LLC | Multi-Member LLC |
|--------|:-----------------:|:----------------:|
| **Operating Agreement** | Required (some states don't mandate, but lenders do) | Required; must show all members and ownership % |
| **All Members Must Guarantee?** | Single guarantor | Typically all members with 25%+ ownership must guarantee |
| **EIN Required** | Yes (even though IRS allows SSN for SMLLC) | Yes |
| **Complexity** | Lower | Higher — may trigger legal review, longer underwriting |

### 4.3 State-Specific LLC Requirements

- **Georgia, Hawaii, Massachusetts, New York, Rhode Island, Pennsylvania:** DSCR loans **must** close in an LLC (per Ridge Street Capital's guidelines; may vary by lender)
- **Florida, Texas, North Carolina, Ohio:** LLC closing is optional — can close in personal name or entity
- Most lenders allow either structure in most states

### 4.4 Does the LLC Need to Be in the Property's State?

**No, but foreign registration is required.** If your LLC is registered in one state (e.g., Delaware) and the property is in another (e.g., Florida), you must:
1. Register the LLC as a "foreign entity" in the property's state
2. Provide the foreign registration certificate to the lender
3. The LLC remains domiciled in its formation state

### 4.5 Series LLC Documentation

- **Griffin Funding** is comfortable with series LLCs (common among sophisticated CA investors)
- Not all lenders accept series LLCs — check with each lender
- If accepted, documentation must clearly identify which series holds the property
- Each series typically needs its own operating agreement provisions

### 4.6 "To Be Formed" Entity Process

- **Ridge Street** and most DSCR lenders allow applications under a "To Be Formed" entity
- You can apply for the DSCR loan and register the LLC simultaneously
- The LLC must be formed and in good standing **before closing**
- This prevents delays — don't wait for LLC formation to start the loan process

---

## 5. Appraisal Requirements

### 5.1 Appraisal Type Required

| Appraisal Type | Used For | Notes |
|---------------|----------|-------|
| **Full Interior/Appraisal (Form 1004 + 1007)** | 1-unit SFR | Full inspection + rent schedule; standard for most DSCR |
| **Form 1025** | 2-4 unit properties | Small Residential Income Property Appraisal Report |
| **Form 1007** | Rent schedule addendum | Single-Family Comparable Rent Schedule; attached to 1004 |
| **Desktop Appraisal** | Generally NOT accepted | Most DSCR lenders require full appraisal |

**Key Rule:** DSCR loans virtually always require a **full appraisal with interior inspection** plus a **rent schedule (Form 1007 or 1025)**. Desktop-only or exterior-only appraisals are generally not accepted.

### 5.2 AVM Acceptance

| Lender | AVM Accepted? | Notes |
|--------|:-------------:|-------|
| **Angel Oak** | **Yes — Rental AVM** | Industry-first Rental AVM for DSCR; instantly generates rental estimate at pre-qualification |
| **Others** | Generally No | Most DSCR lenders require full appraisal |
| **Easy Street** | Some products | No-appraisal products available for certain high-leverage, fast-close loans |

### 5.3 Who Orders the Appraisal?

- **Lender orders** through an Appraisal Management Company (AMC) in most cases
- **Kiavi:** Lender orders the appraisal; appraiser provides rental market analysis for DSCR calculation
- **Visio:** Lender orders through AMC
- **Griffin:** Lender orders
- Some wholesale/correspondent channels may allow broker-ordered appraisals with lender approval

### 5.4 Two-Appraisal Requirements

- **Loans >$2M:** Some lenders require two full appraisal reports (e.g., per MC Funding Elite DSCR guidelines)
- **Loans ≤$2M:** One full appraisal + CDA (Credit Document Analysis) review
- Transferred appraisals are sometimes allowed with lender approval

### 5.5 Appraisal Cost and Timeline

| Item | Typical Range |
|------|--------------|
| **SFR Appraisal Cost** | $400-$700 |
| **CA Appraisal Cost** | $700-$850 |
| **2-4 Unit Appraisal Cost** | $500-$800+ |
| **Appraisal Timeline** | 7-14 days (rural areas may be longer) |

### 5.6 Appraisal Waivers

- **Generally not available** for DSCR loans — the rent schedule is essential to the DSCR calculation
- Angel Oak's Rental AVM is the closest thing to an "appraisal waiver" — it provides rental data instantly but still typically requires a full appraisal for property valuation
- Easy Street Capital has some no-appraisal products for specific scenarios

### 5.7 What the DSCR Appraisal Includes Beyond Standard

In addition to standard property valuation, DSCR appraisals include:
1. **Rental market analysis** — comparable rental listings and recently leased properties
2. **Market rent estimate** — the figure used in DSCR calculation
3. **Vacancy rate analysis** — local market vacancy rates
4. **Property condition assessment** — must confirm "rent-ready" condition
5. **STR income analysis** (for STR properties) — may require supplemental form or AMC analysis

---

## 6. Condition Sheet Patterns

### 6.1 Typical Prior-to-Doc (PTD) Conditions

These conditions must be satisfied before loan documents are drawn:

| Condition | Common? | Notes |
|-----------|:-------:|-------|
| **Title commitment clear** | Universal | No liens, judgments, or title defects |
| **Final insurance verification** | Universal | Declaration page, paid receipt, evidence of coverage |
| **Appraisal review completed** | Universal | Value and rent schedule confirmed |
| **Entity document review** | If LLC | Articles, operating agreement, EIN, good standing |
| **Reserve documentation** | Common | Bank statements showing required reserves |
| **Property inspection (if needed)** | Sometimes | If condition issues noted in appraisal |
| **Flood zone determination** | Universal | Flood cert ordered; if in SFHA, flood insurance required |
| **Payoff statement** | If refinance | Current mortgage payoff amount |
| **Business purpose affidavit** | Universal | Confirms investment intent |
| **Identity verification (CIP)** | Universal | Patriot Act compliance |

### 6.2 Typical Prior-to-Funding (PTF) Conditions

These conditions must be satisfied before funds are disbursed:

| Condition | Common? | Notes |
|-----------|:-------:|-------|
| **Signed loan documents** | Universal | All closing documents executed |
| **Evidence of insurance (final)** | Universal | Final declaration page with lender as loss payee |
| **Title policy issued** | Universal | Title insurance in place |
| **Down payment verification** | If purchase | Source and transfer of down payment funds |
| **Property condition verification** | Sometimes | If repairs were a condition |
| **Entity in good standing (current)** | If LLC | Certificate of good standing dated within 30-60 days |

### 6.3 Condition Comparison by Lender

| Lender | Condition Volume | Notable Strictness |
|--------|:----------------:|--------------------|
| **Kiavi** | Moderate | 6-9 months reserves; reserve documentation |
| **Visio** | Moderate-High | Strict DSCR floor; 24-month STR history; experience verification |
| **Lima One** | Moderate | Property condition may require additional docs |
| **Griffin** | Moderate-High | Higher CA reserves; Mello-Roos verification; condition pickiness |
| **Angel Oak** | Varies | Broker-dependent; Rental AVM may reduce conditions |
| **LendSure** | Low-Moderate | Simplified documentation; Schedule of RE Owned only |
| **Ridge Street** | Moderate | Foreign entity registration; STR documentation |
| **Easy Street** | Low | Most flexible; lowest credit/DSCR requirements |

### 6.4 Timeline to Clear Conditions

- **Standard conditions:** 1-5 business days
- **Complex conditions** (entity legal review, property repairs): 5-15 business days
- **Appraisal disputes/second appraisals:** 7-14 additional days
- **Typical total:** Most loans clear conditions within 3-7 days of initial condition letter

---

## 7. Insurance Requirements

### 7.1 Core Insurance Policies

#### A. Hazard Insurance (Landlord / Dwelling Policy)

| Requirement | Details |
|------------|---------|
| **Policy Type** | DP-3 (Dwelling Fire Policy) or Landlord Policy — NOT homeowner's policy |
| **Coverage Type** | Replacement Cost (RC) — NOT Actual Cash Value (ACV) |
| **Coverage Amount** | Total loan amount OR 100% of insurable value, whichever is less |
| **Perils Covered** | Fire, wind, hail, vandalism, and other named/open perils |
| **Deductible** | Typically max 1% of coverage amount or $5,000 (varies by lender) |

**Critical:** DSCR lenders generally do **NOT** accept ACV policies. Replacement cost coverage is required.

#### B. General Liability Insurance

| Requirement | Details |
|------------|---------|
| **Minimum Coverage** | $100,000 per occurrence (some lenders require $300K or $1M) |
| **Purpose** | Protects against tenant/visitor injury claims |
| **Required By** | Most DSCR lenders |

#### C. Flood Insurance

| Requirement | Details |
|------------|---------|
| **When Required** | Property in Special Flood Hazard Area (SFHA) per FEMA determination |
| **Coverage Amount** | Minimum of outstanding loan balance; max $250K through NFIP |
| **Determination** | Standard Flood Hazard Determination Form required for every loan |
| **Note** | Required regardless of lender type — even non-federally regulated lenders require it |

### 7.2 Additional Insurance Requirements

| Insurance | Required By | Notes |
|-----------|-------------|-------|
| **Rent-Loss Coverage** | Some lenders | 6 months of rental income coverage typical |
| **Wind/Hail Exclusion** | Coastal areas | Separate wind/hail policy if excluded from base |
| **Earthquake Insurance** | Some CA lenders | Not universally required; some Griffin CA loans may need it |
| **Umbrella/Excess Liability** | Some lenders | For multi-property investors; not always required |
| **STR-Specific Insurance** | All STR lenders | Commercial hospitality policy or STR endorsement required |

### 7.3 STR Insurance Requirements

- **Commercial hospitality policy** or **STR endorsement** on landlord policy
- Standard homeowner's insurance does NOT cover short-term rental activity
- Must cover guest injuries, property damage by guests, and liability
- Some lenders require proof that the insurance covers STR use specifically
- Rent-loss coverage more common for STR properties due to income variability

### 7.4 Insurance Timing

- **Initial:** Insurance quote or binder at application
- **Prior to Docs:** Declaration page with evidence of coverage
- **At Closing:** Final declaration page with lender named as loss payee

---

## 8. Rent Verification Methods

### 8.1 Primary Verification Methods

#### Method 1: Appraiser's Rent Schedule (Form 1007 / Form 1025)

**Used for:** Vacant properties, purchases, properties without current leases

- **Form 1007** (Single-Family Comparable Rent Schedule): Used for 1-unit properties
- **Form 1025** (Small Residential Income Property Appraisal Report): Used for 2-4 units
- Appraiser analyzes: comparable rental listings, recently leased properties, market vacancy rates, property condition
- **The appraiser's market rent estimate becomes the income figure used in DSCR calculation**
- If appraiser says $1,700 but borrower claims $2,000 — **$1,700 is used**

**Form 1007 CANNOT be used for STR properties.** It only supports long-term rental comparables.

#### Method 2: Existing Lease Agreements

**Used for:** Tenant-occupied properties

- Signed 12-month lease required
- Most lenders use **lesser of lease amount or appraiser's market rent**
- Requirements for lease acceptance:
  - Signed by both landlord and tenant
  - Must not be month-to-month (some lenders accept with reservations)
  - Must not be below market (triggers reliance on appraiser's opinion)
  - Must include all essential terms (rent amount, dates, security deposit)

#### Method 3: STR Platform Reports (for STR properties)

**Used for:** Short-term rental properties

- Airbnb/VRBO payout history (12-24 months)
- Platform-generated income reports
- Tax returns showing Schedule E rental income
- Bank statements showing STR deposits
- Property management company statements

#### Method 4: AirDNA / Third-Party Market Data

**Used for:** STR acquisitions without operating history

- Ridge Street Capital: AirDNA, 80% of projected figures
- Easy Street Capital: AirDNA for STR income underwriting
- Angel Oak: Proprietary Rental AVM
- Comparable properties filtered by: unit type, bedroom count, property tier, radius

### 8.2 What Happens If Appraiser's Rent Opinion Differs from Claimed?

| Scenario | Lender Response |
|----------|----------------|
| **Appraiser < Claimed Rent** | Appraiser's lower figure is used; DSCR may fall below minimum |
| **Lease > Market Rent** | Most lenders use market rent (lesser of two) |
| **Lease < Market Rent** | Most lenders use lease amount (lesser of two) |
| **STR Projected > Actual** | Lender applies reduction factor (75-80%) |

**Best Practice:** Provide the loan team with a "clean rental comp packet" before the appraisal is completed: 3-5 active listings, screenshots with dates, address distance, BR/BA count, and condition notes.

### 8.3 Rent Verification for Different Transaction Types

| Transaction Type | Primary Verification |
|-----------------|---------------------|
| **Purchase (vacant)** | Appraiser's market rent (Form 1007/1025) |
| **Purchase (tenant-occupied)** | Existing lease + appraiser's market rent (lesser used) |
| **Refinance (LTR)** | Current lease + appraiser's market rent |
| **Refinance (STR)** | 12-24 months operating history + platform reports |
| **STR Acquisition (no history)** | AirDNA / third-party data + lender reduction factor |
| **Cash-Out Refinance** | Same as refinance + 6-month seasoning typical |

### 8.4 DSCR Income Calculation Formula

```
DSCR = Monthly Gross Rent ÷ Monthly PITIA

Where PITIA = Principal + Interest + Taxes + Insurance + Association fees

For Interest-Only:
DSCR = Monthly Gross Rent ÷ Monthly ITIA (no principal)
```

**STR Income Calculation:**
```
Qualifying STR Income = Annualized STR Revenue × Lender Factor (75-80%)
DSCR = (Qualifying STR Income ÷ 12) ÷ Monthly PITIA
```

---

## 9. Submission Process Overview

### 9.1 Typical DSCR Loan Submission Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  1. PRE-QUAL     │────▶│  2. APPLICATION   │────▶│  3. DOC UPLOAD    │
│  (Soft credit    │     │  (1003 + property │     │  (ID, leases,     │
│   pull, basic    │     │   details, entity │     │   insurance,      │
│   info)          │     │   info)           │     │   reserves,       │
│  1-2 days        │     │  1-3 days         │     │   entity docs)    │
└─────────────────┘     └──────────────────┘     │  1-5 days         │
                                                  └─────────┬─────────┘
                                                            │
┌─────────────────┐     ┌──────────────────┐     ┌─────────▼─────────┐
│  6. CLOSING      │◀────│  5. CLEAR TO     │◀────│  4. APPRAISAL +   │
│  (Sign docs,     │     │     CLOSE        │     │     UNDERWRITING  │
│   fund loan)     │     │  (All conditions │     │  (Full appraisal   │
│  1-3 days        │     │   cleared)       │     │   + rent schedule, │
│                  │     │  1-3 days        │     │   conditions)      │
└─────────────────┘     └──────────────────┘     │  7-14 days         │
                                                  └───────────────────┘
```

### 9.2 Submission Process by Lender

| Lender | Submission Method | Initial Pull | Typical Timeline |
|--------|-------------------|:------------:|:----------------:|
| **Kiavi** | Online portal | Soft credit | 15-30 days |
| **Visio** | Online application | Soft credit | 28-32 days |
| **Lima One** | Online/broker | Soft credit | 20-30 days |
| **Griffin** | Online/broker | Soft credit | 18-30 days |
| **Angel Oak** | Wholesale broker | Varies | Varies by broker |
| **LendSure** | Wholesale broker | Varies | Varies by broker |
| **Ridge Street** | Online direct | Soft credit | Varies |
| **Easy Street** | Online direct | Soft credit | As fast as 24 hrs |

### 9.3 Documents to Have Ready Before Applying

**For fastest closing, prepare these before starting the application:**

1. ✅ Government-issued ID (clear photo/scan)
2. ✅ Property address and basic details
3. ✅ Current lease agreement(s) or rent roll
4. ✅ Property insurance quote or declaration page
5. ✅ 2-3 months bank statements (personal and entity)
6. ✅ Entity documents (if LLC): Articles of Organization, Operating Agreement, EIN letter, Certificate of Good Standing
7. ✅ Purchase contract (if purchase) or mortgage statement (if refinance)
8. ✅ STR operating history (if applicable): platform reports, tax returns, bank statements
9. ✅ HOA documents (if applicable)
10. ✅ Foreign entity registration (if LLC state ≠ property state)

---

## 10. Platform Implementation Notes

### 10.1 Lender Document Requirement Matrix (for Platform Config)

```typescript
interface LenderDocRequirements {
  lenderId: string;
  minCreditScore: number;
  minDSCR: number;
  maxLTV: number;
  requiresExperience: boolean;
  acceptsSTR: boolean;
  strIncomeFactor: number; // e.g., 0.75 or 0.80
  strMinHistory: number; // months
  usesAirDNA: boolean;
  acceptsAVM: boolean;
  requiresFullAppraisal: boolean;
  reserveMonths: number; // base
  entityDocRequirements: EntityDocReq;
  insuranceRequirements: InsuranceReq;
  specificConditions: string[];
}

interface EntityDocReq {
  articlesOfOrg: boolean;
  operatingAgreement: boolean;
  einLetter: boolean;
  goodStanding: boolean; // and if >1 year only
  foreignRegistration: boolean; // if cross-state
  personalGuaranty: boolean;
  acceptsToBeFormed: boolean;
  acceptsSeriesLLC: boolean;
}

interface InsuranceReq {
  landlordPolicy: boolean;
  policyType: 'DP-3' | 'DP-1' | 'any';
  replacementCost: boolean; // vs ACV
  liability: boolean;
  liabilityMin: number; // dollars
  floodIfSFHA: boolean;
  rentLoss: boolean;
  rentLossMonths: number;
  strEndorsement: boolean; // for STR properties
}
```

### 10.2 Document Checklist Generator Logic

When a user selects a lender + property type + transaction type, the platform should generate a custom checklist:

**Inputs:**
- Lender selection
- Property type (SFR, 2-4 units, condo, townhome)
- Transaction type (purchase, rate-term refi, cash-out refi)
- Occupancy type (vacant, LTR tenant-occupied, STR)
- Entity structure (individual, LLC single-member, LLC multi-member, trust)
- State

**Outputs:**
- Complete document checklist with required/optional flags
- Estimated timeline
- Estimated costs (appraisal, fees)
- Known pitfalls for that lender

### 10.3 Key Data Points to Track Per Lender

| Data Point | Why It Matters |
|-----------|----------------|
| Which form (1007 vs 1025) | Depends on unit count |
| STR income factor (75% vs 80%) | Affects DSCR calculation |
| Reserve months by portfolio size | Griffin scales: 6/9/12; others fixed |
| Foreign entity registration requirement | Cross-state LLCs need this |
| "To Be Formed" entity acceptance | Timing of LLC formation |
| STR minimum history (12 vs 24 months) | New STR investors blocked at some lenders |
| Appraisal cost by geography | CA costs significantly more |
| Prepayment penalty structure | 3-2-1 vs 5-4-3-2-1 vs none |
| Credit score tiers and rate adjustments | Granular pricing impacts |

### 10.4 Common Rejection / Delay Causes

| Issue | Prevention |
|-------|------------|
| **Appraiser's rent opinion too low** | Pre-verify rental comps before appraisal; provide comp packet |
| **Entity not in good standing** | Verify good standing before applying; order certificate early |
| **Insurance wrong type (HO instead of DP-3)** | Confirm landlord/dwelling policy, not homeowner |
| **STR income below DSCR after reduction** | Model DSCR with 75-80% factor before applying |
| **Missing foreign entity registration** | Check if LLC state ≠ property state |
| **Lease below market** | Lender uses lesser of lease vs market rent |
| **Insufficient reserves** | Calculate required reserves: PITIA × required months |
| **Property not rent-ready** | Ensure property is in rentable condition before appraisal |
| **Month-to-month lease** | Lenders prefer 12-month leases; M-t-M triggers market rent use |
| **HOA rental restrictions (STR)** | Verify HOA allows STRs before applying for STR DSCR |

---

## Sources

- Griffin Funding: DSCR Mortgage Document Checklist (2026)
- DSCR Authority: Document Checklist
- Easy Street Capital: What Documents Do You Need for a DSCR Loan?
- Ridge Street Capital: DSCR Loan Requirements; DSCR Loan for LLC; DSCR Loan for Airbnb
- HonestCasa: Kiavi DSCR Review 2026; Visio Lending DSCR Review; Griffin Funding DSCR Review; Lima One Capital DSCR Review; DSCR Loan Rental Income Verification
- Angel Oak Mortgage Solutions: Investor Cash Flow Mortgage Program; Rental AVM Launch
- LendSure Mortgage Corp: DSCR Wholesale Power
- Park Place Finance: Are DSCR Appraisals Required?
- The Lender: Understanding Insurance Requirements for DSCR Loans
- Truss Financial Group: How Lenders Are Using AirDNA
- Lendmire: How DSCR Loans Are Underwritten; How Rental Income Is Calculated
- Shining Star Funding: DSCR Income Documentation
- Mo The Broker: DSCR Loan for LLC Entity Structure 2026
- Class Valuation: Understanding the 1007 Appraisal and STRs
- AirDNA: Easy Street Capital Case Study
- Lakeview Correspondent: DSCR Underwriting Guidelines
