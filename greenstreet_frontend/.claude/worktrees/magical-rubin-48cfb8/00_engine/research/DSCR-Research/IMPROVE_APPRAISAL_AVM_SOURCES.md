# Appraisal & AVM Data Sources for DSCR Lending

> **Comprehensive Valuation Data Source Guide**  
> Research Date: March 2026  
> Purpose: Define all valuation tools available, which ones DSCR lenders use, and how to integrate them into the platform

---

## Table of Contents

1. [DSCR Lender Appraisal Requirements](#1-dscr-lender-appraisal-requirements)
2. [AVM Providers for DSCR](#2-avm-providers-for-dscr)
3. [BPO (Broker Price Opinion) for DSCR](#3-bpo-broker-price-opinion-for-dscr)
4. [Rental Income Appraisal (Form 1007)](#4-rental-income-appraisal-form-1007)
5. [Appraisal Management Companies (AMCs)](#5-appraisal-management-companies-amcs)
6. [Property Data APIs](#6-property-data-apis)
7. [Inspection Requirements](#7-inspection-requirements)
8. [Valuation Cost & Timeline Comparison Table](#8-valuation-cost--timeline-comparison-table)
9. [Platform Integration Recommendations](#9-platform-integration-recommendations)
10. [Implementation Priority & Roadmap](#10-implementation-priority--roadmap)

---

## 1. DSCR Lender Appraisal Requirements

### 1.1 Do DSCR Lenders Require Full Appraisals?

**Yes — virtually all DSCR lenders require a full appraisal for origination.** Unlike agency loans that may qualify for appraisal waivers (PIWs), DSCR/non-QM lenders almost universally require a full interior/exterior appraisal because:

- DSCR loans are non-QM and lack GSE appraisal waiver eligibility
- The rental income component requires an appraiser's market rent determination
- Investors and securitizers demand full collateral verification
- The property is investment-grade, not owner-occupied, increasing risk

**Key exceptions:**
- Some lenders may waive a **new** appraisal for refinance if a prior appraisal is less than 6-12 months old (lender-specific)
- Angel Oak's Rental AVM (see Section 2) provides a rent estimate at pre-qualification, but a full appraisal is still required before closing
- A few DSCR lenders accept desktop or hybrid appraisals for lower LTV scenarios (see Section 7)

### 1.2 Appraisal Form Types Used

| Form | Use Case | Property Type |
|------|----------|---------------|
| **Fannie Mae 1004 / Freddie Mac 70** | Standard URAR — single-family, 1-unit investment properties | SFR, condo |
| **Fannie Mae 1025 / Freddie Mac 72** | Small Residential Income Property — 2-4 unit properties | Duplex, triplex, fourplex |
| **Fannie Mae 1007** | Single-Family Comparable Rent Schedule — always paired with 1004 or 1025 for DSCR | All DSCR loans |
| **Fannie Mae 1004D / Freddie Mac 442** | Appraisal Update and/or Completion Report — for construction or stale appraisals | As needed |

**DSCR-specific rules:**
- **1-unit SFR/condo:** Form 1004 + Form 1007
- **2-4 unit properties:** Form 1025 + Form 1007 (1025 already includes income analysis, but 1007 may still be required by lender)
- **Loan amounts > $2M:** Most lenders require **two full appraisals** from different appraisers and different appraisal companies (confirmed by Pennymac, MCFunding, and other non-QM lenders)

### 1.3 Who Orders the Appraisal?

- **The lender orders the appraisal** through their AMC or approved appraiser panel
- Brokers cannot order appraisals directly for DSCR loans (Dodd-Frank/Appraiser Independence Requirements)
- Some lenders allow broker-ordered appraisals if the appraiser is on the lender's approved panel, but this is rare
- The borrower pays for the appraisal (typically at closing or upfront)
- The AMC acts as the firewall between production and the appraiser

### 1.4 Typical Appraisal Cost for DSCR Loans

| Appraisal Type | Cost Range | Notes |
|---|---|---|
| SFR 1004 + 1007 | $550 - $900 | 1007 adds $150-300 to base 1004 cost |
| 2-4 Unit 1025 + 1007 | $700 - $1,200 | More complex; income approach required |
| Second appraisal (>$2M) | $700 - $1,200 | Required by many lenders for high-value properties |
| Rush appraisal | +$200-400 premium | 3-5 day turnaround instead of 2-3 weeks |
| Desktop appraisal | $200 - $400 | Only accepted by some DSCR lenders (see Section 7) |
| 1007-only (standalone) | $150 - $300 | When base appraisal exists but rent schedule is needed |

### 1.5 Timeline: Order to Delivery

| Phase | Duration | Notes |
|---|---|---|
| Order placement to inspection | 3-7 business days | Depends on appraiser availability |
| Property inspection | 1 day | Interior + exterior for full appraisal |
| Report writing | 3-7 business days | Complex properties take longer |
| QC/review by AMC | 1-3 business days | Some AMCs review every report |
| Delivery to lender | 1 business day | Electronic delivery via AMC portal |
| **Total typical timeline** | **10-21 business days** | 2-4 weeks from order to delivery |
| Rush timeline | 5-8 business days | Premium fee; not all markets |

### 1.6 Lenders Accepting Desktop or Drive-By Appraisals

Very few DSCR lenders accept desktop or drive-by appraisals for origination. However:

- **Clear Capital** offers desktop appraisals (Form 1004 Desktop / 70D) as a product — some non-QM lenders use them for low-LTV or rate-term refinance scenarios
- **Hybrid appraisals** (Form 1004 Hybrid / 70H) — a third-party inspector does the property visit, appraiser writes the report from data — accepted by a small number of non-QM lenders
- **Property Inspection Waivers (PIWs)** are GSE-specific and **not available for DSCR/non-QM loans**
- Some DSCR lenders accept desktop appraisals for properties with LTV ≤ 60% or for portfolios they already service

---

## 2. AVM Providers for DSCR

### 2.1 AVM Landscape for DSCR Lending

AVMs are primarily used for **pre-qualification, portfolio monitoring, and quality control** in DSCR lending — NOT for origination decisions. No DSCR lender uses an AVM as the sole basis for a loan approval, but AVMs play critical supporting roles.

### 2.2 CoreLogic AVM (now Cotality)

| Attribute | Details |
|---|---|
| **Product** | Total Home ValueX (formerly CAVM) |
| **Coverage** | 100M+ US residential properties |
| **Accuracy** | Median absolute error ~5-8% nationally; better in metro areas |
| **Data Sources** | MLS, public records, tax assessments, deed recordings, proprietary data |
| **Pricing** | Enterprise pricing; $0.50-$5.00 per AVM hit depending on volume; monthly minimums typically $5,000-$25,000+ |
| **API Access** | RESTful API; integrated with major LOS platforms (Encompass, Mortgage Cadence) |
| **DSCR Use** | Portfolio monitoring, QC on appraisals, pre-qual screening |
| **Key Differentiator** | Largest property database in the US; gold standard for mortgage AVMs |
| **Integration** | Available through ICE Mortgage Technology ecosystem; direct API |

**Notes:** CoreLogic rebranded to Cotality in 2025. Their AVM is the most widely used in the mortgage industry. For DSCR, CoreLogic provides property value but does NOT provide rent estimates natively — rent data would require separate data products.

### 2.3 HouseCanary AVM

| Attribute | Details |
|---|---|
| **Product** | HouseCanary Analytics API / Value Report |
| **Coverage** | 100M+ US residential properties |
| **Accuracy** | Median absolute error ~4-7%; competitive with CoreLogic |
| **Data Sources** | MLS, public records, permit data, geographic data |
| **Pricing** | Tiered plans: Starter ~$19/mo (2 reports), Professional ~$100+/mo (15 reports), Team ~$250+/mo (40 reports), Enterprise (custom). API calls $0.30-$6.00 per call depending on endpoint |
| **API Access** | RESTful API; excellent documentation; also offers MCP server for AI agents |
| **DSCR Use** | **Best-in-class for DSCR** — provides both property value AND rent estimates in a single API call |
| **Key Differentiator** | AI-powered forecasts, rental projections, price growth estimates, market volatility metrics |
| **Integration** | Direct API; MCP server for AI integration; available in bulk |

**Notes:** HouseCanary is the strongest AVM candidate for DSCR platform integration because it provides both value and rent estimates. Their rent estimate AVM is specifically useful for pre-qualification DSCR calculations. They also offer a new MCP (Model Context Protocol) server that connects AI agents to 149 property data tools.

### 2.4 Clear Capital AVM (ClearAVM)

| Attribute | Details |
|---|---|
| **Product** | ClearAVM; Rental AVM |
| **Coverage** | Nationwide; 100M+ properties |
| **Accuracy** | Morningstar #1 rated lending-grade AVM (per Clear Capital) |
| **Data Sources** | MLS, public records, proprietary analytics |
| **Pricing** | Enterprise licensing; per-hit pricing varies by volume |
| **API Access** | Property Valuation API; RESTful |
| **DSCR Use** | **Directly integrated with Angel Oak for DSCR Rental AVM** — the only AVM specifically built for DSCR rent calculations |
| **Key Differentiator** | Industry-first Rental AVM designed for DSCR lending; uses same MLS data and comparable analysis that appraisers use for 1007 |
| **Integration** | Property Valuation API; integrated with MeridianLink; direct partnership with Angel Oak |

**Critical Finding — Angel Oak + Clear Capital Rental AVM:**
Angel Oak Mortgage Solutions launched an industry-first Rental AVM for DSCR loans in partnership with Clear Capital. Key features:
- Instantly estimates market rent for a property using MLS data and comparable analysis
- Generated at pre-qualification after credit requirements are met
- **The rental AVM figure is locked for the loan term** (barring significant changes), giving brokers and borrowers certainty of execution
- Eliminates the uncertainty of waiting for the 1007 form to determine actual DSCR
- Full appraisal is still required before closing, but the Rental AVM determines DSCR upfront
- This is a significant competitive advantage for Angel Oak — no other lender offers this

### 2.5 Zillow Zestimate

| Attribute | Details |
|---|---|
| **Product** | Zestimate |
| **Coverage** | 110M+ US homes |
| **Accuracy** | Median error ~2.4% for on-market homes; ~7.5% for off-market |
| **Data Sources** | Public records, user-submitted data, MLS (limited), tax assessments |
| **Pricing** | Free on Zillow.com; no commercial API for mortgage lending |
| **API Access** | **No longer available** — Zillow shut down the Zestimate API in 2024 |
| **DSCR Use** | **Cannot be used for DSCR lending** — not lending-grade, no rent estimate, no API |
| **Key Differentiator** | Consumer-facing brand recognition; not designed for mortgage use |

**Verdict:** Zillow Zestimate cannot be used for DSCR lending. No API access, not compliant with AVM quality control standards under the 2024 Interagency AVM Final Rule, and provides no rent data.

### 2.6 Freddie Mac HVE (Home Value Explorer)

| Attribute | Details |
|---|---|
| **Product** | HVE — Home Value Explorer |
| **Coverage** | Available for Freddie Mac seller/servicers only |
| **Accuracy** | High confidence scores for metropolitan areas |
| **Data Sources** | Freddie Mac's proprietary database of 100M+ property records |
| **Pricing** | Available through Freddie Mac's Loan Advisor Suite; no standalone pricing |
| **API Access** | Available through Loan Advisor Suite API for Freddie Mac-approved lenders |
| **DSCR Use** | **Not available for DSCR/non-QM loans** — HVE is restricted to Freddie Mac seller/servicers for agency loan transactions. DSCR loans are non-QM and not eligible. |
| **Key Differentiator** | GSE-backed; used for PIW eligibility on agency loans |

**Verdict:** Freddie Mac HVE is not available for DSCR lending. It is restricted to agency transactions by Freddie Mac seller/servicers.

### 2.7 Other AVM Providers Worth Noting

| Provider | Key Feature | DSCR Relevance |
|---|---|---|
| **RentCast** | Rent estimate AVM API; low-cost ($0.01-$0.10/call) | Budget-friendly rent estimates for pre-qual; not lending-grade |
| **Realie** | Disruptive pricing for property data | Lower-cost alternative to CoreLogic/ATTOM for property characteristics |
| **HomeSage** | AI-powered property data | Emerging provider; limited DSCR applicability |
| **Dataflect** | Property data for mortgage | Specialized in mortgage data pipelines; enterprise pricing |
| **Regrid** | Parcel boundary & ownership data | Good for ownership verification; no AVM |
| **BatchData** | Property & ownership data API | Bulk data provider; useful for portfolio analysis |

---

## 3. BPO (Broker Price Opinion) for DSCR

### 3.1 Do DSCR Lenders Accept BPOs?

**Generally NO** — DSCR lenders do not accept BPOs for loan origination. Key reasons:

1. **Federal Law (12 USC 3355):** BPOs may not be used as the primary basis for a loan origination decision for a consumer's principal dwelling. While this applies to principal dwellings specifically, the industry standard extends this practice to investment properties.

2. **Non-QM Investor Requirements:** Securitizers and investors in DSCR loans require full appraisals, not BPOs.

3. **Accuracy Concerns:** BPOs are less rigorous than full appraisals — no interior inspection required (exterior-only BPOs), no standardized adjustment methodology, and less regulatory oversight.

**Limited Exceptions:**
- Some DSCR lenders may use BPOs for **portfolio monitoring/servicing** (e.g., checking collateral value on an existing loan)
- BPOs may be used for **loss mitigation** or **short sale** scenarios
- A very small number of non-QM lenders accept BPOs for **rate-term refinances** with LTV ≤ 60% on properties they already service
- Clear Capital offers BPOs as part of their valuation product suite, but they are primarily positioned for home equity and servicing, not DSCR origination

### 3.2 BPO Providers and Platforms

| Provider | BPO Type | Notes |
|---|---|---|
| **Clear Capital** | Residential BPO, Commercial BPO | Morningstar top-rated BPO; nationwide coverage |
| **ServiceLink** | Exterior & Interior BPO | Large AMC; integrated with major LOS |
| **LRES** | Residential BPO | National coverage; used for default servicing |
| **Altisource** | BPO + AVM combo | Used in default/REO scenarios |
| **Broker Price Opinion Network (NABPOP)** | BPO platform | Connects brokers with BPO orders; not a provider |

### 3.3 BPO Cost vs Appraisal Cost

| Valuation Method | Cost | Time | Interior Inspection? |
|---|---|---|---|
| Full Appraisal (1004) | $500-800 | 2-3 weeks | Yes |
| Desktop Appraisal | $200-400 | 3-5 days | No (data-driven) |
| Interior BPO | $150-250 | 3-7 days | Yes |
| Exterior BPO | $75-150 | 2-5 days | No |
| AVM | $0.50-6.00 | Instant | No |

### 3.4 Accuracy Comparison: BPO vs Appraisal vs AVM

| Valuation Method | Median Absolute Error | Regulatory Oversight | DSCR Origination Acceptance |
|---|---|---|---|
| Full Appraisal | 2-4% | High (USPAP, state licensing) | Universal |
| Desktop Appraisal | 4-7% | High (USPAP, state licensing) | Some lenders |
| BPO | 5-10% | Low (state RE license only) | Very few |
| AVM | 5-10% | Moderate (2024 Interagency AVM Rule) | Pre-qual only |

---

## 4. Rental Income Appraisal (Form 1007)

### 4.1 What is Form 1007?

**Form 1007 — Single-Family Comparable Rent Schedule** is a Fannie Mae appraisal form used to estimate the monthly market rent of a single-family investment property or condominium. It is always completed by a licensed or certified appraiser as a supplement to Form 1004 or Form 1025.

**Key characteristics:**
- Provides an estimate of **fair market rent** for the subject property
- Uses **3+ comparable rental properties** to develop the rent estimate
- Includes adjustments for differences between the subject and comparables (bedrooms, bathrooms, square footage, condition, location, amenities)
- Completed as part of the appraisal process, not as a standalone product
- The appraiser must indicate whether the estimated market rent is **above, below, or at** market levels

### 4.2 How Does the Appraiser Determine Market Rent?

The appraiser uses the following data sources and methods:

1. **MLS rental listings** — active and closed rental comps in the subject's market area
2. **Property management company data** — rent rolls from local PM companies
3. **Current lease on the subject property** — the existing lease is considered but not solely relied upon
4. **Rent surveys** — appraiser may contact property managers or landlords for rental data
5. **Public records** — limited utility for rent data
6. **Online rental platforms** — Zillow Rental Manager, Apartments.com, Rent.com (as supporting data)

**The 1007 analysis includes:**
- Subject property's current rental status (vacant, tenant-occupied)
- Current lease terms and monthly rent
- Comparable rental properties (address, rent, bedrooms, baths, sq ft, date of rental)
- Adjustments to comparables
- Reconciled estimated market rent

### 4.3 Is Form 1007 Required for All DSCR Loans?

**Yes — Form 1007 is effectively required for all DSCR loans** because:

- DSCR is calculated using the property's rental income
- The lender must verify the market rent independently of the borrower's representation
- Fannie Mae guidelines require Form 1007 "when rental income is used to qualify, and the subject is a one-unit investment property"
- Non-QM DSCR lenders universally require the 1007 as part of the appraisal package
- For 2-4 unit properties (Form 1025), the Operating Income Statement within the 1025 partially replaces the 1007, but many DSCR lenders still request the 1007

**Important nuance for short-term rentals (STR):**
- Form 1007 is designed for **long-term rental income** only
- It cannot be used to support short-term rental (Airbnb/VRBO) income
- For STR properties, lenders rely on AIRDNA reports, Rentometer, or other STR analytics platforms instead of or in addition to the 1007
- Some lenders have stopped requesting 1007 for STR-focused DSCR loans and rely on AIRDNA instead

### 4.4 Can Rent Estimates Replace Form 1007?

| Rent Estimate Source | Can Replace 1007? | Notes |
|---|---|---|
| **HouseCanary Rent Estimate API** | No — for pre-qual only | Excellent for initial screening but not accepted in lieu of 1007 |
| **Clear Capital Rental AVM** | No — but Angel Oak uses it to lock DSCR at pre-qual | Still requires 1007 at closing |
| **Rentometer** | No | Consumer-grade tool; not lending-grade |
| **RentCast API** | No | Budget option; not lending-grade |
| **AIRDNA** | For STR only | Accepted for STR DSCR loans by some lenders; not a replacement for 1007 on LTR |
| **Existing lease agreement** | Partially | Lenders consider existing lease but still require 1007 for market rent verification |
| **Rent schedule from property manager** | No | Supporting document only; not a substitute for appraiser's 1007 |
| **Form 1007 from appraiser** | **Yes — this IS the required document** | Gold standard for DSCR rent verification |

**Bottom line:** For long-term rental DSCR loans, nothing replaces the 1007 at closing. AVM rent estimates are valuable for pre-qualification speed and certainty (as Angel Oak has demonstrated) but do not eliminate the need for the appraiser's 1007.

---

## 5. Appraisal Management Companies (AMCs) for DSCR

### 5.1 Which AMCs Serve DSCR/Non-QM Lenders?

| AMC | DSCR/Non-QM Focus | Key Features |
|---|---|---|
| **Clear Capital** | Yes — primary partner for Angel Oak DSCR | Rental AVM, BPO, desktop, hybrid, traditional appraisals; PropertyNova data |
| **ServiceLink** | Yes — serves major non-QM lenders | Full AMC services; integrated with major LOS; nationwide appraiser panel |
| **LenderX** | Yes — software platform for lenders | Not an AMC — provides software for lenders to manage their own appraiser panels; supports AMC, appraisal company, and alternative valuation vendor categories |
| **Swift AMC (Solidifi)** | Yes | Full-service AMC; USPAP-compliant; nationwide |
| **Regent AMC** | Yes | Full-service AMC; quality review process |
| **R3 AMC** | Yes | Appraiser panel management; 1004-focused lender guide |
| **Class Valuation** | Yes | Full AMC; appraisal modernization; AURA risk analytics |
| **LRES Corporation** | Yes | AMC + BPO provider; default and origination |
| **Exactus AMC** | Yes — mentioned in DSCR context | Specializes in DSCR appraisal requirements |
| **Global DMS** | Yes (software) | AMC management software; eTrak platform |

### 5.2 Typical AMC Fee Structure

| Fee Component | Typical Cost | Notes |
|---|---|---|
| AMC management fee | $100-200 per order | Over the appraiser's fee |
| Appraisal fee (paid to appraiser) | $400-800 | Varies by property type and market |
| Total to borrower | $550-1,000 | AMC fee + appraiser fee |
| QC review fee | $25-75 per report | Some AMCs charge separately |
| Rush surcharge | $100-300 | Expedited turnaround |
| Technology/platform fee | $0-25 per order | Some AMCs include in management fee |

### 5.3 Can the Platform Auto-Order Appraisals?

**Yes — through AMC portal APIs.** Most major AMCs and appraisal management platforms offer API or portal integration:

| Platform | Integration Method | Auto-Order Support |
|---|---|---|
| **LenderX** | REST API + Web Portal | Yes — full lifecycle management |
| **Clear Capital** | Property Valuation API | Yes — order appraisals, BPOs, desktop, hybrid |
| **ServiceLink** | Integration with Encompass, Empower | Yes — through LOS integration |
| **Global DMS (eTrak)** | REST API | Yes — order management, status tracking |
| **Swift/Solidifi** | Portal + API | Yes — order placement and tracking |
| **Class Valuation** | Portal + API | Yes — order, track, review |

**Implementation path for auto-ordering:**
1. Platform integrates with one or more AMC APIs
2. When a DSCR loan application reaches the appraisal stage, the system automatically:
   - Submits order to the AMC via API
   - Includes property address, loan type (DSCR), required forms (1004 + 1007 or 1025 + 1007)
   - Receives order confirmation and appraiser assignment
   - Tracks status through inspection, report writing, QC, and delivery
   - Receives the completed appraisal report (PDF + XML/UAD data)
3. System extracts key data points from the appraisal (value, market rent, condition rating) for automated DSCR calculation

---

## 6. Property Data APIs

### 6.1 API Provider Comparison

| Feature | ATTOM Data | CoreLogic (Cotality) | HouseCanary | RentCast | Regrid |
|---|---|---|---|---|---|
| **Property Value/AVM** | Yes | Yes (Total Home ValueX) | Yes | Yes (rent + value) | No |
| **Rent Estimate** | Limited | No (separate product) | **Yes — strongest** | Yes | No |
| **Property Characteristics** | Yes (comprehensive) | Yes (most comprehensive) | Yes | Basic | Basic |
| **Tax Assessment Data** | Yes | Yes | Yes | No | Yes |
| **Ownership/Deed Data** | Yes | Yes | Yes | No | Yes |
| **Mortgage Data** | Yes | Yes | Limited | No | No |
| **MLS Data** | No (public records only) | Yes (via MLS alliances) | Yes (via partnerships) | No | No |
| **Foreclosure Data** | Yes | Yes | No | No | No |
| **Geographic/Hazard Data** | Yes | Yes | Yes | No | Yes |
| **API Format** | REST API | REST API + SOAP | REST API | REST API | REST API |
| **Pricing Model** | Enterprise; per-call | Enterprise; per-hit | Tiered + per-call | Per-call (low cost) | Per-parcel |
| **Typical Cost/API Call** | $0.10-$2.00 | $0.50-$5.00 | $0.30-$6.00 | $0.01-$0.10 | $0.01-$0.05 |
| **Minimum Commitment** | ~$1,000-5,000/mo | ~$5,000-25,000/mo | $19/mo (starter) | $49/mo (starter) | $250/mo |
| **DSCR Relevance** | High | High | **Highest** | Medium | Low |

### 6.2 ATTOM Data Solutions

| Attribute | Details |
|---|---|
| **Coverage** | 155M+ US properties |
| **Data Points** | 300+ property attributes per record |
| **Key Products** | Property API, Tax API, Deed/Mortgage API, AVM, GeoData |
| **DSCR Use Cases** | Ownership verification, tax record validation, property characteristics, AVM pre-screen |
| **Strengths** | Most comprehensive public records data; excellent for ownership chain, tax assessments, deed history |
| **Weaknesses** | No rent estimates; AVM is less accurate than CoreLogic; no MLS data |
| **API Docs** | https://api.developer.attomdata.com |
| **Pricing** | Enterprise licensing; custom quotes based on volume and data products needed |

### 6.3 CoreLogic (Cotality)

| Attribute | Details |
|---|---|
| **Coverage** | 100M+ US residential properties |
| **Data Points** | 400+ property attributes; largest property database in the US |
| **Key Products** | Total Home ValueX AVM, Property Data, Tax/Deed/Mortgage, Climate Risk |
| **DSCR Use Cases** | Property verification, AVM, mortgage/lien verification, market analytics |
| **Strengths** | Gold standard for mortgage data; most lenders already have CoreLogic access; integrated with major LOS |
| **Weaknesses** | Expensive; no rent estimates natively; enterprise minimums are high |
| **API Docs** | Enterprise API; typically accessed through ICE Mortgage Technology |
| **Pricing** | Enterprise only; $5,000-25,000+/mo depending on products and volume |

### 6.4 HouseCanary

| Attribute | Details |
|---|---|
| **Coverage** | 100M+ US residential properties |
| **Data Points** | Property value, rent estimate, forecast, risk, market trends, comps |
| **Key Products** | Analytics API, Value Report, Rent Report, CMA, Data Explorer, MCP Server |
| **DSCR Use Cases** | **Best overall for DSCR** — provides both value and rent estimates; 20 years of price trends; 10 years of rental data |
| **Strengths** | Combined AVM + rent estimate in single API; AI-powered forecasts; affordable entry pricing; MCP server for AI agents |
| **Weaknesses** | Less comprehensive public records vs ATTOM/CoreLogic; rent estimate accuracy varies by market |
| **API Docs** | https://developers.housecanary.com |
| **Pricing** | Starter $19/mo → Professional ~$100+/mo → Team ~$250+/mo → Enterprise (custom); API calls $0.30-$6.00 |

**HouseCanary API Endpoints Most Relevant to DSCR:**
- `/property/value` — AVM property value estimate
- `/property/rental_value` — Rental value estimate (monthly market rent)
- `/property/details` — Property characteristics (beds, baths, sq ft, year built, lot size)
- `/property/comparables` — Comparable sales and rentals
- `/property/forecast` — Price and rent forecasts
- `/analytics/risk` — Market risk scores

### 6.5 Recommended Data API Stack for DSCR Platform

| Priority | Provider | Purpose | Est. Monthly Cost |
|---|---|---|---|
| **1st** | HouseCanary | AVM + Rent Estimate + Property Details + Forecasts | $500-2,000/mo (API usage) |
| **2nd** | ATTOM | Ownership verification, tax records, deed/mortgage data | $1,000-5,000/mo |
| **3rd** | CoreLogic | AVM cross-check, mortgage data, market analytics | $5,000-25,000/mo (if budget allows) |
| **Optional** | RentCast | Low-cost rent estimate supplement | $49-200/mo |
| **Optional** | Regrid | Parcel/ownership verification | $250-500/mo |

---

## 7. Inspection Requirements

### 7.1 Do DSCR Lenders Require Property Inspections?

**Yes — for full appraisals, an interior and exterior inspection is required.** The appraiser must physically visit the property as part of the 1004 or 1025 appraisal process.

| Inspection Type | Required for DSCR? | Who Performs | What's Included |
|---|---|---|---|
| **Interior + Exterior Inspection** | Yes (with full appraisal) | Licensed appraiser | Room count, condition, systems, photos, measurements |
| **Exterior-Only Inspection** | Only for drive-by BPO or exterior BPO | Appraiser or broker | Street view photos, exterior condition, neighborhood |
| **Desktop Appraisal** | No physical inspection | Licensed appraiser | Data analysis from records + third-party data |
| **Hybrid Appraisal** | Third-party property data collection (not appraiser) | Trained data collector | Photos, measurements, room count; appraiser writes report remotely |
| **Property Condition Inspection (PCI)** | Sometimes (lender-specific) | Trained inspector | Risk summary report; condition assessment without value opinion |

### 7.2 Interior vs Exterior Inspection

- **Full DSCR appraisals (1004/1025) require interior inspection** — the appraiser must see the inside of the property
- The appraiser documents: room count, condition of kitchen/bath/HVAC/roof, overall condition, health/safety issues
- Photos are required for every room, plus exterior photos from multiple angles
- Interior access is typically arranged through the property manager or tenant

### 7.3 Who Performs the Inspection?

| Scenario | Inspector | Notes |
|---|---|---|
| Full appraisal | Licensed/certified appraiser | The same person who writes the appraisal report |
| Hybrid appraisal | Third-party data collector (not necessarily licensed) | Trained inspector; separate from the appraiser |
| PCI (Property Condition Inspection) | Trained inspector | Does not provide value opinion; condition only |
| BPO | Licensed real estate broker/agent | Not an appraiser; limited inspection |
| Automated Property Condition Report (aPCR) | Aerial imagery / AI | Clear Capital product; no human inspection |

### 7.4 Can Photos Replace an Inspection?

- **No** — for full appraisals, the appraiser must physically inspect the property. Photos alone are not sufficient.
- **However**, Clear Capital's **Automated Property Condition Report (aPCR)** uses aerial imagery and AI to assess property condition without a human visit. This is used for portfolio monitoring and risk assessment, not for origination.
- Some DSCR lenders accept **borrower-provided photos** as a supplement to the appraisal, but never as a replacement
- Hybrid appraisals use a **data collector** who takes photos and measurements; the appraiser writes the report from this data

### 7.5 DSCR Loan Inspection Waiver

- **There is no universal inspection waiver for DSCR loans** — unlike GSE Property Inspection Waivers (PIWs) that are available for agency loans
- **Clear Capital** has published guidance on **inspection-based appraisal waivers** — these allow lenders to take a risk-based approach, using property data and AVMs to waive the full inspection requirement. However, this is primarily for home equity and low-risk scenarios, not DSCR origination.
- **Class Valuation** notes that DSCR closing ratios improve from ~50% to 70%+ with better inspection/valuation processes, suggesting that efficient inspection processes (not waivers) are the key to DSCR efficiency
- **The industry trend is toward hybrid and desktop appraisals**, not inspection waivers, for DSCR loans

---

## 8. Valuation Cost & Timeline Comparison Table

| Valuation Method | Cost Range | Timeline | Accuracy (Median Error) | DSCR Lender Acceptance | Forms Used |
|---|---|---|---|---|---|
| **Full Appraisal (1004 + 1007)** | $550-900 | 2-3 weeks | 2-4% | Universal (all lenders) | 1004 + 1007 |
| **Full Appraisal (1025 + 1007)** | $700-1,200 | 2-4 weeks | 2-4% | Universal (2-4 unit) | 1025 + 1007 |
| **Two Full Appraisals (>$2M)** | $1,400-2,400 | 3-5 weeks | 2-4% (double verification) | Required by most lenders >$2M | 1004/1025 + 1007 x2 |
| **Desktop Appraisal (1004D)** | $200-400 | 3-5 days | 4-7% | Very few DSCR lenders | 1004 Desktop (70D) |
| **Hybrid Appraisal (1004H)** | $300-500 | 5-10 days | 3-6% | Some non-QM lenders | 1004 Hybrid (70H) |
| **AVM (Value Only)** | $0.50-6.00 | Instant | 5-10% | Pre-qual only; never for origination | N/A |
| **AVM (Rental)** | $1.00-6.00 | Instant | 5-15% (rent estimates) | Pre-qual only; Angel Oak locks at pre-qual | N/A |
| **BPO (Exterior)** | $75-150 | 2-5 days | 5-10% | Not accepted for DSCR origination | BPO form |
| **BPO (Interior)** | $150-250 | 3-7 days | 5-8% | Not accepted for DSCR origination | BPO form |
| **Form 1007 (standalone)** | $150-300 | 1-2 weeks | High (rent only) | Required for all DSCR loans | 1007 |
| **PCI (Property Condition)** | $50-150 | 3-7 days | N/A (condition only) | Supplemental; some lenders require | PCI report |
| **aPCR (Aerial/AI Condition)** | $20-50 | Instant | N/A (condition only) | Portfolio monitoring only | aPCR report |

---

## 9. Platform Integration Recommendations

### 9.1 Recommended Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DSCR PLATFORM                          │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Pre-Qual     │  │ Underwriting │  │ Post-Close   │  │
│  │ Engine       │  │ Engine       │  │ Servicing    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │           │
│  ┌──────┴─────────────────┴──────────────────┴───────┐  │
│  │          VALUATION ORCHESTRATION LAYER             │  │
│  │  (Select method → Order → Track → Receive → Parse) │  │
│  └──────┬─────────────────┬──────────────────┬───────┘  │
│         │                 │                  │           │
└─────────┼─────────────────┼──────────────────┼───────────┘
          │                 │                  │
    ┌─────┴─────┐    ┌─────┴─────┐    ┌───────┴───────┐
    │ AVM Layer │    │ AMC Layer │    │ Data API Layer │
    │           │    │           │    │                │
    │ HouseCan. │    │ ClearCap. │    │ ATTOM          │
    │ ClearAVM  │    │ LenderX   │    │ HouseCanary    │
    │ CoreLogic │    │ ServiceLk │    │ CoreLogic      │
    │ RentCast  │    │ Class Val │    │ Regrid         │
    └───────────┘    └───────────┘    └────────────────┘
```

### 9.2 Valuation Decision Flow for DSCR

```
Loan Application Received
         │
         ▼
┌─────────────────────┐
│ Step 1: Pre-Qual    │
│ AVM + Rent Estimate │◄── HouseCanary API (value + rent)
│ Instant DSCR calc   │◄── ClearAVM (if available)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 2: Full Order  │
│ Order full appraisal│◄── AMC API (Clear Capital / LenderX)
│ 1004 + 1007         │◄── Specify DSCR loan type
│ or 1025 + 1007      │◄── Request rent schedule
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 3: Track       │
│ Monitor status      │◄── AMC API status polling/webhook
│ Inspection scheduled│◄── Receive appraiser assignment
│ Report in progress  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 4: Receive     │
│ Appraisal delivered │◄── PDF + UAD XML from AMC
│ Parse key data      │◄── Extract: value, rent, condition
│ Verify DSCR         │◄── Recalculate DSCR with 1007 rent
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 5: QC          │
│ AVM cross-check     │◄── HouseCanary / CoreLogic AVM
│ Value reconciliation│◄── Flag if AVM differs >15% from appraisal
│ Final approval      │
└─────────────────────┘
```

### 9.3 API Integration Specifications

#### HouseCanary API (Primary AVM + Rent)

```typescript
// HouseCanary API Integration
interface HouseCanaryAPI {
  // Get property value + rent estimate
  getPropertyAnalytics(address: string): Promise<{
    value: number;           // AVM property value
    valueLow: number;        // Low end of confidence interval
    valueHigh: number;       // High end of confidence interval
    rentalValue: number;     // Monthly market rent estimate
    rentalValueLow: number;
    rentalValueHigh: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    lotSize: number;
    forecast: {
      price1yr: number;      // 1-year price forecast %
      rent1yr: number;       // 1-year rent forecast %
    };
  }>;

  // Get comparable sales and rentals
  getComparables(address: string): Promise<{
    saleComps: Comp[];
    rentalComps: Comp[];
  }>;
}

// Estimated cost: ~$1.00-3.00 per property lookup
// Rate limit: varies by plan
```

#### ATTOM API (Property Data + Ownership)

```typescript
// ATTOM Data API Integration
interface ATTOMAPI {
  // Property detail with ownership
  getPropertyDetail(address: string): Promise<{
    propertyId: string;
    owner: { name; mailingAddress };
    assessment: { taxAmount; assessedValue; taxYear };
    lot: { size; zoning };
    building: { beds; baths; sqft; yearBuilt; rooms };
    saleHistory: SaleRecord[];
    mortgageHistory: MortgageRecord[];
  }>;

  // AVM value
  getAVM(address: string): Promise<{
    avmValue: number;
    avmLow: number;
    avmHigh: number;
    confidenceScore: number;
  }>;
}

// Estimated cost: ~$0.50-2.00 per property lookup
```

#### Clear Capital / AMC API (Appraisal Ordering)

```typescript
// Clear Capital Property Valuation API
interface ClearCapitalAPI {
  // Order full appraisal with 1007
  orderAppraisal(order: {
    propertyAddress: string;
    loanType: 'DSCR';
    forms: ['1004', '1007'];  // or ['1025', '1007']
    rush: boolean;
    specialInstructions: string;
  }): Promise<{
    orderId: string;
    status: 'ordered';
    estimatedDelivery: Date;
  }>;

  // Get Rental AVM
  getRentalAVM(address: string): Promise<{
    estimatedMarketRent: number;
    confidenceScore: number;
    comparables: RentalComp[];
  }>;

  // Check order status
  getOrderStatus(orderId: string): Promise<{
    status: 'ordered' | 'assigned' | 'inspected' | 'reporting' | 'qc' | 'delivered';
    appraiserName: string;
    inspectionDate: Date;
    reportDeliveryDate: Date;
  }>;

  // Get completed report
  getReport(orderId: string): Promise<{
    appraisalValue: number;
    marketRent: number;      // From 1007
    conditionRating: string;  // C1-C6
    pdfUrl: string;
    uadXml: string;
  }>;
}
```

---

## 10. Implementation Priority & Roadmap

### Phase 1: Pre-Qualification AVM (Week 1-2)

| Task | Provider | Priority |
|---|---|---|
| Integrate HouseCanary API for instant property value + rent estimate | HouseCanary | **P0 — Critical** |
| Auto-calculate pre-qual DSCR from AVM rent estimate | Internal | **P0 — Critical** |
| Display AVM confidence intervals and data freshness | HouseCanary | P1 |
| Add property characteristics auto-fill from API | HouseCanary | P1 |

### Phase 2: Property Data Enrichment (Week 2-3)

| Task | Provider | Priority |
|---|---|---|
| Integrate ATTOM for ownership verification and tax records | ATTOM | **P0 — Critical** |
| Cross-reference AVM values (HouseCanary vs ATTOM) | Both | P1 |
| Auto-verify property type (SFR vs multi-unit) for correct form selection | ATTOM/HouseCanary | P1 |
| Add mortgage/lien verification | ATTOM | P2 |

### Phase 3: AMC Appraisal Ordering (Week 3-6)

| Task | Provider | Priority |
|---|---|---|
| Integrate with Clear Capital Property Valuation API | Clear Capital | **P0 — Critical** |
| Auto-order full appraisal (1004 + 1007 or 1025 + 1007) based on property type | Clear Capital | **P0 — Critical** |
| Implement order tracking with status updates | Clear Capital | P1 |
| Parse delivered appraisal (extract value, rent, condition) | Internal | P1 |
| Add LenderX as secondary AMC option | LenderX | P2 |

### Phase 4: Quality Control & Cross-Check (Week 4-6)

| Task | Provider | Priority |
|---|---|---|
| Implement AVM vs appraisal cross-check (flag >15% variance) | HouseCanary + appraisal data | P1 |
| Build value reconciliation tool for two-appraisal scenarios | Internal | P2 |
| Add Clear Capital Rental AVM for pre-qual DSCR lock (if partnering with Angel Oak) | Clear Capital | P2 |

### Phase 5: Advanced Analytics (Week 6-8)

| Task | Provider | Priority |
|---|---|---|
| Portfolio monitoring with periodic AVM updates | HouseCanary/CoreLogic | P2 |
| Market trend integration for DSCR risk assessment | HouseCanary forecasts | P2 |
| Rent forecast for cash flow projection | HouseCanary | P3 |
| STR data integration (AIRDNA) for short-term rental DSCR | AIRDNA | P3 |

---

## Key Findings Summary

### Critical Insights for the Platform

1. **Full appraisals are mandatory** for all DSCR loan originations — there is no shortcut around the 1004/1025 + 1007 requirement. The platform must be built around ordering and receiving full appraisals.

2. **HouseCanary is the #1 AVM integration priority** because it uniquely provides both property value AND rent estimates in a single API call — exactly what DSCR pre-qualification needs.

3. **Angel Oak + Clear Capital Rental AVM is a breakthrough** — the ability to lock DSCR at pre-qualification using an AVM rent estimate is an industry first. If the platform partners with Angel Oak or Clear Capital, this could be a significant competitive advantage.

4. **Form 1007 is non-negotiable** for DSCR — the appraiser's market rent determination is the foundation of the DSCR calculation. Nothing replaces it at closing, but AVMs can provide pre-qual certainty.

5. **AVMs are for pre-qual, not origination** — they reduce uncertainty and speed up the process, but the full appraisal still determines the final DSCR and loan parameters.

6. **BPOs are not accepted** for DSCR origination — don't invest in BPO integration for origination workflows.

7. **Two appraisals are required** for loan amounts > $2M at most DSCR lenders — the platform must support this workflow.

8. **AMC API integration** (especially Clear Capital) is essential for automating the appraisal ordering, tracking, and delivery process.

9. **Inspection waivers are not available** for DSCR loans — but hybrid and desktop appraisals are emerging alternatives for some non-QM lenders.

10. **The 2024 Interagency AVM Final Rule** (effective 2025) imposes quality control standards on AVMs used in mortgage lending — any AVM integration must comply with these standards, including bias testing, human oversight, and documentation.

---

## Data Source Reference Table

| Data Need | Primary Source | Backup Source | API Cost/Call |
|---|---|---|---|
| Property Value (AVM) | HouseCanary | ATTOM / CoreLogic | $1-3 |
| Market Rent Estimate | HouseCanary | Clear Capital Rental AVM | $1-3 |
| Property Characteristics | HouseCanary | ATTOM | $0.50-2 |
| Ownership Verification | ATTOM | CoreLogic | $0.50-1 |
| Tax Assessment Data | ATTOM | CoreLogic | $0.50-1 |
| Deed/Mortgage History | ATTOM | CoreLogic | $0.50-2 |
| Comparable Sales | HouseCanary | AMC appraisal data | $1-3 |
| Comparable Rentals | HouseCanary | 1007 form data | $1-3 |
| Price/Rent Forecasts | HouseCanary | N/A | $1-3 |
| Full Appraisal | Clear Capital AMC | ServiceLink / LenderX | $550-1200 |
| Form 1007 Rent Schedule | Clear Capital AMC (with appraisal) | Any AMC | Included with appraisal |
| Property Condition | Appraisal (C1-C6 rating) | PCI from AMC | Included / $50-150 |
| STR Data (Airbnb) | AIRDNA | RentCast | Custom pricing |
| Market Trends | HouseCanary HDI | ATTOM | Included in API |

---

*This guide will be updated as new AVM products, regulatory changes, and DSCR lender requirements evolve. The property data and valuation landscape is rapidly changing, with appraisal modernization (hybrid, desktop) and AI-driven analytics reshaping how DSCR lenders evaluate collateral and rental income.*
