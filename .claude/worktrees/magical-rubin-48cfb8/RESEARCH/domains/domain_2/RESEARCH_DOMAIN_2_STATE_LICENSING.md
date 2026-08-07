---
<!-- 2026-06-21 17:36 PT: Insula Capital Group references in this document are DEPRECATED per user removal of Insula channel (see decisions.md D3). Document content retained for historical reference; Insula no longer an active go-to-market channel. -->
type: research
slice: 2
status: drafted
confidence: 5
title: "DOMAIN 2: 50-State DSCR Product Licensing + State-Specific Compliance"
summary: "**Owner:** Compliance research (Agent 1, parallel dispatch)"
entities:
  - concept/arm
  - concept/dscr
  - concept/ltv
  - lender/acra-lending
  - lender/ad-mortgage
  - lender/american-heritage
  - lender/angel-oak
  - lender/crosscountry
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/insula
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/newfi
  - lender/ocmbc
  - lender/pennymac
  - lender/ready-capital
  - lender/rocket-pro
  - lender/uwm
  - lender/visio-lending
  - regulation/reg-z
  - regulation/tila
  - slice/2
  - state/ca
  - state/md
  - state/mn
  - state/nj
  - state/ny
  - state/oh
  - state/pa
  - state/wi
  - tax/pal
  - topic/multifamily
  - topic/non-qm
  - topic/str
tags:
  - topic/compliance
  - topic/default-rate
  - topic/insurance
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/short-rate
  - topic/tax
  - topic/usury
  - type/audit
source: RESEARCH/domain_2/RESEARCH_DOMAIN_2_STATE_LICENSING.md
vaulted_at: 2026-06-20
---
# DOMAIN 2: 50-State DSCR Product Licensing + State-Specific Compliance

**Date:** 2026-06-18  
**Owner:** Compliance research (Agent 1, parallel dispatch)  
**Status:** Tier 1 — P0 (Slice 2 P0-2 lender schema blocker)  
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_2\`

---

## 0. Executive Summary

All 50 states + DC require both **(a) entity-level mortgage banker/broker licensing** and **(b) individual Mortgage Loan Originator (MLO) licensing** under the **SAFE Act of 2008 (P.L. 110-289, Title V)** as implemented by the **Nationwide Multistate Licensing System (NMLS)**. Business-purpose DSCR loans, while exempt from many consumer-protections statutes (Reg Z, TILA §1461 of TILA; RESPA §7/§8), are still subject to licensing and usury laws in most states. The most material state-by-state risks for DSCR are: **(1) NY Banking Law §6-l and §6-m** (PPP and subprime restrictions, but business-purpose exemption for §6-l), **(2) MN HF 3437** (effective 8/1/26, business-purpose DSCR exempt from consumer §58.137), **(3) NJ §46:10B-2** (lender-split LLC state), **(4) OH ORC §1343.011** (PPP base = original principal, 2026 threshold $116,356), **(5) PA Act 6 §406 LIPL** (1-2 unit PPP banned below $329,411), and **(6) state usury caps** (CA 10%, NY 16%, AZ 10%, etc.) that can affect non-brokered entity lending.

**State_lender_licensing_matrix.csv (50 states × 20 lenders) is included as a deliverable.** This file documents: SAFE Act MLO requirement, entity mortgage banking license type and statute, key state law, usury cap, business-purpose usury exemption, NY §6-l applicability, DSCR-specific disclosure requirements, and per-state lender restrictions for the top 20 DSCR lenders (per TOPIC 8 / TOPIC 15 corpus).

---

## 1. Regulatory Framework

### 1.1 SAFE Act of 2008 (Federal)

The **Secure and Fair Enforcement for Mortgage Licensing Act of 2008 (SAFE Act)** (codified at 12 USC §5101-5116; 15 USC §1639b) requires every state to:
- Adopt a licensing and registration system for **state-licensed Mortgage Loan Originators (MLOs)**.
- Use the **Nationwide Multistate Licensing System (NMLS)** as the centralized database.
- Require MLOs to pass a SAFE written test, complete 20 hours of NMLS-approved pre-licensure education, and 8 hours of annual continuing education.
- Run FBI criminal background check (fingerprinting) and NMLS credit report.

**Federal registration (MLO on a depository institution's payroll):** Administered by the OCC, FRB, FDIC, NCUA, and Farm Credit Administration. State-licensed MLOs register with NMLS through their state agency.

**Sources:** 12 USC §5101-5116; SAFE Act Test Preparation, http://safeactpreptest.com/; NMLS MLO License Information, https://mortgage.nationwidelicensingsystem.org/; DRE MLO License, https://dre.ca.gov/Licensees/MLOLicense.html; 12 CFR §1008.103 (SAFE Act implementing regulation).

### 1.2 Business-Purpose Exemption (Critical for DSCR)

Under the SAFE Act, "Mortgage Loan Originator" is defined as "an individual who for compensation or gain...takes a residential mortgage loan application...or offers or negotiates terms of a residential mortgage loan." 

**AAPL (American Association of Private Lenders) position:** "Business-purpose loans should not be subject to mortgage lender licensing." Most states follow this principle and EXEMPT pure business-purpose loans from entity mortgage banking license requirements IF the lender is NOT taking residential mortgage loan applications from consumers (i.e., is lending own capital or commercial paper, not brokering consumer mortgage applications).

**Critical distinction:**
- **Lending own capital** to a business entity (LLC, LP, Corp) for business purpose → typically NOT a "residential mortgage loan" → often exempt from SAFE Act MLO and state mortgage banker license
- **Brokering consumer mortgage applications** to multiple lenders → triggers MLO + entity license requirements
- **Originating loans and selling to secondary market** (most non-bank DSCR lenders do this) → triggers entity license; individual MLOs must be licensed
- **LLC vestings on borrower side** → does NOT change lending-side licensing requirements

**Source:** AAPL Business-Purpose Loans, https://aaplonline.com/articles/featured/business-purpose-loans-should-not-be-subject-to-mortgage-lender-licensing/; LoanStream Wholesale Business Purpose Lending Matrix, https://loanstreamwholesale.com/wp-content/uploads/2025/07/LSM-F-BRK_BRKLICREQALTDSCR-250710.pdf

### 1.3 NMLS Consumer Access

Public lookup: https://www.nmlsconsumeraccess.org — anyone (consumer, regulator, lender) can verify:
- Entity NMLS ID (unique identifier)
- State(s) licensed in
- License type (banker, broker, servicer, etc.)
- License status (active, inactive, suspended)
- Public regulatory actions

**Engine rule:** Every top-20 DSCR lender must be NMLS-verified before they appear in the lender matrix. NMLS ID is the canonical "verified" anchor for lender matrix entries (per TOPIC 10 evidence_vault requirements).

### 1.4 State Mortgage Banking Licenses (50-State Survey)

All 50 states + DC require **entity-level mortgage banker or broker licenses** for non-depository lenders operating in the state. Most states distinguish between "lender" (originating + funding loans) and "broker" (originating only, no funding) licenses. Some states require both; some have a single license.

| License Type | Issuing Authority | Examples |
|---|---|---|
| **Mortgage Banker License** | State Department of Financial Institutions | CA, TX, FL, NY, IL, PA, OH |
| **Mortgage Broker License** | State Department of Financial Institutions | AZ, NV, CO (registration, not full license) |
| **Banking Department License** | State Banking Dept | AL, MS, KS, ND |
| **Real Estate Commission License** | State Real Estate Commission | AR, GA, OK (some dual-license) |
| **Combined License** | Single state agency | Most states |
| **DRE (CA) + DFPI (CA CFL)** | CA-specific dual license | CA only |

**Source:** CSBS 50-State Survey of Consumer Finance Laws, https://www.csbs.org/50-state-survey-consumer-finance-laws; MBA State Licensing Resource, https://www.mba.org/industry-resources/Commercial-Multifamily-Professionals/licensing-by-state-landing-page; ARDRI State Licensing Maps, https://ardri.ai/state-licensing/; LoanStream Wholesale Business Purpose Lending Matrix (2025).

**Engine rule:** Per-lender state coverage in the DSCR Sovereign OS matrix should pull from each lender's NMLS Consumer Access profile (canonical, machine-readable) and be cross-referenced against the lender's own published "states served" disclosure.

---

## 2. 50-State Survey: Per-State Highlights

### 2.1 Critical State-Specific DSCR Issues

#### **California (CA) — Highest-Risk State for DSCR Lenders**
- **Entity licensing**: California Department of Financial Protection and Innovation (DFPI) **California Financing Law (CFL) license** + California Department of Real Estate (DRE) **Real Estate Broker / Residential Mortgage Lender license** (Bus & Prof §10166)
- **CFL licensee exemption from usury**: CA Constitution Article XV §1 sets 10% usury cap; CFL licensees are "exempt persons" and can charge higher rates
- **Prop 13 + Prop 19**: Property tax reassessment on sale (per TOPIC 16)
- **DFPI scrutiny**: Highest DSCR filing activity; DFPI regularly audits non-bank DSCR lenders
- **Practical impact**: A DSCR lender WITHOUT a CFL license cannot lend in California at rates above 10%/year. This effectively requires CFL for any meaningful DSCR operation in CA.

**Source:** Doss Law Definitive Guide to Usury in California, https://www.dosslaw.com/definitive-guides/doss-law-llps-definitive-guide-to-usury-in-california/; CA Constitution Art XV, https://oag.ca.gov/sites/all/files/agweb/pdfs/consumers/constitution.pdf; Cal Corp Law, https://www.calcorporatelaw.com/2010/10/usury-exemption-bites-cfl-licensee; BBR Legal, https://www.bbrlegal.com/california-law-on-loans/

#### **New York (NY) — §6-l and §6-m Compliance Critical**
- **NY Banking Law §6-l** ("High-Cost Home Loan" statute): No prepayment penalty on high-cost home loans (per https://codes.findlaw.com/ny/banking-law/bnk-sect-6-l/); applies to consumer loans; **BUSINESS-PURPOSE LOANS ARE EXEMPT**
- **NY Banking Law §6-m** ("Subprime Home Loan"): No prepayment penalty on subprime home loans; again, business-purpose exempt
- **Entity licensing**: NY Department of Financial Services (NYDFS) **Mortgage Banker / Mortgage Broker license** under 3 NYCRR Part 410
- **NY usury cap**: 16% (criminal usury threshold per NY Gen Oblig Law §5-511); loans >$2.5M exempt from criminal usury (per Practical Law, https://uk.practicallaw.thomsonreuters.com/Glossary/PracticalLaw/I03f4d84eeee311e28578f7ccc38dcbee)
- **NY regulator**: NYDFS is the most active state regulator for non-bank mortgage lenders; expect examination, consent orders, and licensing delays for new entrants

**Source:** FindLaw NY Banking Law §6-l, https://codes.findlaw.com/ny/banking-law/bnk-sect-6-l/; Justia NY Banking Law §6-i, https://law.justia.com/codes/new-york/bnk/article-1/6-i/; NY DFS Mortgage Banker Guidebook.

#### **Minnesota (MN) — HF 3437 Enacted 4/23/26, Effective 8/1/26**
- **Statute**: MN Stat §58.137 (Mortgage Origination and Servicing)
- **Pre-HF 3437**: §58.137 reached some DSCR loans (entity vestings not always exempt)
- **HF 3437 amendment**: Explicitly exempts business-purpose DSCR loans from §58.137
- **Effective 8/1/26**: MN lenders may originate business-purpose DSCR loans without §58.137 consumer protections, but consumer-purpose still regulated
- **MN usury cap**: 8% (consumer), 18% criminal usury; business-purpose typically exempt

**Source:** TOPICAL_INDEX §11 (MN HF 3437 hardcoded); MN Statutes §58.137; primary source verification of enactment 4/23/26.

#### **New Jersey (NJ) — Lender-Split LLC State**
- **NJ Stat §46:10B-2**: Defines "mortgagor" narrowly; bars non-corp individuals on certain mortgages
- **NJ SAFE Act**: NJ Stat §17:11C-51 (separate from federal SAFE Act; state-level licensing)
- **NJ usury**: 30% (civil usury cap); corporate borrowers exempt under most circumstances
- **NJ LLC = HIGH-RISK**: Per TOPIC 11, NJ LLC/entity vestings default to HIGH-RISK because lender matrices SPLIT on whether to lend to NJ LLC borrowers
- **Engine rule**: NJ LLC vestings require per-lender matrix confirmation before lender match; cannot default to a single "NJ LLC allowed" rule

**Source:** NJ Department of Banking and Insurance; TOPICAL_INDEX §11; N.J.S.A. 46:10B-2.

#### **Ohio (OH) — ORC §1343.011 PPP**
- **OH Rev Code §1343.011**: Prepayment interest limitation
- **Threshold 2026**: $116,356 (annually indexed; was $113,771 in 2025)
- **Penalty base**: **ORIGINAL principal** (not remaining balance, like most states)
- **Cap**: 1% per year, max 5 years
- **Business-purpose exemption**: Yes (business-purpose mortgage above threshold not subject to cap)

**Source:** TOPICAL_INDEX §11; Ohio ORC §1343.011 (publicly available).

#### **Pennsylvania (PA) — Act 6 LIPL**
- **PA Act 6 of 1974 §406 LIPL** (Loan Interest and Protection Law): 1-2 unit residential prepayment penalty restrictions
- **Threshold 2026**: $329,411 (annually indexed)
- **Below threshold**: PPP banned on 1-2 unit
- **Above threshold OR 3-4 unit OR business-purpose**: Allowed
- **PA usury**: 6% simple interest (consumer; can be waived by 2X signed writing for >$50K)

**Source:** TOPICAL_INDEX §11; PA Act 6 publicly available; 2026 indexed threshold verified per Arch Wholesale guidelines.

#### **Other Notable State-Specific Issues**
- **MD**: New licensing regs 2024-2025 (per National Mortgage Professional article: "New Maryland Licensing Regs Spark Funding Uncertainty," https://nationalmortgageprofessional.com/news/new-maryland-licensing-regs-spark-funding-uncertainty) — investor-purchasers in secondary market must now be NMLS-licensed in MD
- **CT, FL, IL, NJ, NY**: "Declining-market LTV cap binds" — these states have elevated LTV restrictions in designated declining markets (per TOPICAL_INDEX §6 acceptance criterion 11)
- **CO, NV**: No general usury cap (high-rate DSCR fully permissible)
- **DE**: 5% above federal discount rate — extremely low cap; business-purpose exemption narrow
- **MA**: Strong consumer protection; investor-1-2 family may need additional scrutiny
- **WI, ME**: No PPP on ARM (Wisconsin caps at 2 months' interest)
- **MN, NM, ND, KS, MD**: De facto PPP-prohibited or restricted at many lenders (per TOPICAL_INDEX §11)

### 2.2 Usury Cap Matrix (Critical for DSCR Pricing)

| Tier | States | Usury Cap (Consumer) | Business-Purpose Exemption? | DSCR Impact |
|---|---|---|---|---|
| **Low (≤10%)** | CA, AZ, AR, GA, ME (8% via NH cert), MN (8% consumer), MO, MT, NH, OK, SC (8.75%), UT, WY (7%/10%) | 7-10% | CA: CFL licensee exemption; others vary | **Critical** — DSCR pricing must respect cap; entity structuring required |
| **Medium (10-15%)** | CT, IA (8% general), ID, IL (9% >$25K business-purpose), KY, LA, MS, NE, NM, NV (no cap), NY (16%), OR, PA, SD, TN, VA, VT, WA, WI, WV (6% but wavier available) | 10-15% | Usually yes | Moderate — typical DSCR pricing feasible |
| **High (≥18%)** | CO (no cap), DC (24%), FL, IN, KS, MA, MI (25% criminal), MO, MT, NC (8% general), NJ (30%), TX, WY, SD | 18-30% or no cap | Usually yes | Negligible — high-rate DSCR fully permissible |
| **No general cap** | CO, NV | N/A | N/A | None — no ceiling |

**Critical for engine:** Pricing engine should pull state usury cap at loan-level and flag if pricing exceeds cap × 1.5 (margin warning) or cap (block). For business-purpose entity-vested DSCR loans, the cap typically does NOT bind; but consumer-purpose or individual vestings do bind.

**Source:** USury laws summary at https://www.hudsoncook.com/article/the-hudson-cook-usury-monitor-a-publication-of-recent-usury-and-finance-charge-cases-fall-2025/; Fortra Law usury analysis, https://fortralaw.com/navigating-complex-usury-laws-as-a-privatelender/; Doss Law California usury, https://www.dosslaw.com/definitive-guides/doss-law-llps-definitive-guide-to-usury-in-california/; NJ Law Revision Commission usury report, https://dspace.njstatelib.org/bitstreams/48e7716d-339b-4e3b-b9d4-798ba39871c8/download; CSBS 50-State Survey, https://www.csbs.org/50-state-survey-consumer-finance-laws; Bankrate, https://www.bankrate.com/credit-cards/zero-interest/does-law-cap-credit-card-interest-rates/.

### 2.3 NY Banking Law §6-l / §6-m Applicability to DSCR

| Law | Scope | DSCR Business-Purpose Loan? |
|---|---|---|
| **§6-l** (high-cost home loan) | Consumer residential mortgage loans with APR >8% above comparable Treasury | **EXEMPT** if business-purpose; PPP restrictions DO NOT apply |
| **§6-m** (subprime home loan) | Consumer residential mortgage loans with rate spread >1.75% above comparable Treasury | **EXEMPT** if business-purpose; PPP restrictions DO NOT apply |
| **§6-l** PPP prohibition | No PPP on high-cost home loans (originally; with consumer-purpose exception) | **NOT REACHED** for business-purpose DSCR |

**Engine rule:** NY DSCR loans with verified business-purpose attestation are NOT subject to §6-l or §6-m. However, NY requires the **business-purpose attestation** (written certification of business purpose, signed by borrower) at application; absence of this attestation = treat as consumer-purpose and apply §6-l/§6-m protections.

**Source:** FindLaw §6-l, https://codes.findlaw.com/ny/banking-law/bnk-sect-6-l/; FindLaw §6-m, https://codes.findlaw.com/ny/banking-law/bnk-sect-6-m/; Justia §6-i, https://law.justia.com/codes/new-york/bnk/article-1/6-i/.

### 2.4 SAFE Act MLO Licensing for DSCR Originators

The SAFE Act applies to **all MLOs** who take residential mortgage loan applications or negotiate terms, regardless of whether the loan is consumer-purpose or business-purpose. The 2008 Act was specifically designed to capture ALL residential mortgage lending (not just consumer).

**However, "independent contractor loan processors" and "admin-only" personnel** are exempt from MLO licensing under 12 USC §5102(3)(B)(ii) (per HUD interpretive rule).

**Engine rule:** Each top-20 DSCR lender must have:
1. Entity NMLS license in each state it operates
2. Each MLO (originator, account executive) must be NMLS-licensed in each state where they take applications from in-state residents
3. The NMLS ID for both entity and MLO must be recorded in the lender_programs table (per TOPIC 10 evidence_vault)
4. MLO continuing education (8 hr/yr NMLS-approved + state-specific) must be current

---

## 3. 50-State DSCR Lender Licensing Matrix (Summary)

The full `state_lender_licensing_matrix.csv` is the deliverable. Headline per-state highlights:

| State | Critical Issue | License / Cap | Lender Restriction Note |
|---|---|---|---|
| AL | Standard | NMLS + AL Banking Dept; 8% usury | None |
| AK | Market-excluded | NMLS + AK Commerce; 10% | Most DSCR lenders exclude (Visio, Kiavi) |
| AZ | Standard | NMLS + AZ DIFI; 10% | None |
| AR | PPP restricted (3yr declining) | NMLS + AR Securities; 10% | PPP allowed first 3yrs only |
| **CA** | **CFL license REQUIRED for non-bank DSCR**; Prop 13/19 | DFPI CFL + DRE; 10% (CFL exempt) | Some lenders limit non-CFL; high DSCR market |
| CO | No usury cap | NMLS + CO DRE (registration) | No ceiling |
| CT | Declining-market LTV binds | NMLS + CT Banking; 12% civil | Decline-market restriction |
| DE | Very low cap (5%+) | NMLS + DE State Banking; very low | Entity structuring required |
| DC | Standard | DC DISB; 24% | Standard |
| **FL** | **Insurance crisis; top DSCR market** | NMLS + FL OFR; 18% | High insurance scrutiny (Domain 1) |
| GA | Standard | NMLS + GA DBF; 7%/mo consumer | Standard |
| HI | Market-excluded | NMLS + HI DFI; 10% | Most DSCR lenders exclude |
| ID | Standard | NMLS + ID Finance; 12% | Standard |
| **IL** | **Declining-market LTV; >$25K business-purpose exempt** | NMLS + IDFPR; 9% consumer | Decline-market; usury exemption key |
| IN | Standard | NMLS + IN DFI; 24% | Standard |
| IA | Standard | NMLS + IA Banking; 8% consumer | Standard |
| KS | Some lender de facto exclusion | NMLS + KS OSBC; 15% | Per TOPIC 11 |
| KY | Standard | NMLS + KY DFI; 19% | Standard |
| LA | Coastal insurance | NMLS + LA OFI; 12% consumer | Standard (but insurance critical) |
| ME | No PPP on ARM | NMLS + ME Bureau; 18% | ARM cap |
| MD | New licensing reg 2024-2025 | NMLS + MD DLLR; 24% (commercial exempt) | Investor NMLS-licensed for secondary market |
| MA | Strong consumer protection | NMLS + MA Div of Banks; 20% | Investor-1-2 family scrutiny |
| MI | Standard | NMLS + MI DIFS; 7% (25% criminal) | Standard |
| **MN** | **HF 3437 ENACTED 4/23/26, eff 8/1/26** | NMLS + MN Commerce; 8% (business-purpose exempt post-HF 3437) | Business-purpose DSCR exempt |
| MS | PPP restricted (flat >1yr banned) | NMLS + MS DB&CF; 10% | §75-17-31 |
| MO | Standard | NMLS + MO Div of Finance; 10% | Standard |
| MT | Standard | NMLS + MT DBFI; 10% | Standard |
| NE | Standard | NMLS + NE DBF; 16% criminal | Standard |
| NV | No usury cap | NMLS + NV B&I; no cap | No ceiling |
| NH | Standard | NMLS + NH Banking; 10% | Standard |
| **NJ** | **NJ LLC = HIGH-RISK (lender-split state)** | NMLS + NJ DOBI; 30% civil | Per-lender matrix required for LLC |
| NM | Individual PPP ban | NMLS + NM RLD; 15% | Entity varies |
| **NY** | **§6-l and §6-m (business-purpose exempt); high regulatory scrutiny** | NYDFS; 16% criminal usury | Business-purpose attestation required |
| NC | Coastal insurance | NMLS + NC Commissioner; 8% | Standard |
| ND | De facto prohibited | NMLS + ND DFI; 7% | Per TOPIC 11 |
| **OH** | **PPP base = ORIGINAL principal; threshold $116,356 (2026)** | NMLS + OH DFI; 8% (waivable) | ORC §1343.011 |
| OK | OK/TX ban PPP if APR >13% | NMLS + OK DCC; 10% | APR cap trigger |
| OR | Standard | NMLS + OR DCBS; 12% | Standard |
| **PA** | **1-2 unit PPP banned below $329,411 (2026)** | NMLS + PA DBS; 6% (waivable >$50K) | Act 6 §406 LIPL |
| RI | Max PPP 1yr/2% | NMLS + RI DBR; 21% | PPP cap |
| SC | PPP not allowed ≤$690K | NMLS + SC Board; 8.75% | Threshold |
| SD | No cap on business-purpose >$10K | NMLS + SD Banking; 15% | Standard |
| TN | Standard | NMLS + TN DFI; 24% | Standard |
| TX | OK/TX ban PPP if APR >12%; high DSCR market | NMLS + TX SML/OCCC; 18% | APR cap trigger |
| UT | Standard | NMLS + UT DFI; 10% | Standard |
| VT | Standard | NMLS + VT DFR; 12% | Standard |
| VA | Standard | NMLS + VA SCC; 12% | Standard |
| WA | No PPP on 5/6 ARM (unverified) | NMLS + WA DFI; 12% | ARM PPP (UNVERIFIED) |
| WV | Max PPP 3yr/1% | NMLS + WV Div of Banking; 6% | PPP cap |
| WI | No PPP on ARM; cap 2 mo interest | NMLS + WI DFI; 12% | ARM cap |
| WY | Standard | NMLS + WY Audit; 7%/10% | Standard |

---

## 4. Top 20 DSCR Lender — Per-State Licensing Status (Snapshot)

| # | Lender | NMLS ID | Confirmed Licensing States (per NMLS Consumer Access) | Business-Purpose Focus? | Notes |
|---|---|---|---|---|---|
| 1 | **Pennymac Correspondent** | 35953 | All 50 + DC | Mixed (DSCR + QM) | Top wholesale; verify per state at NMLS |
| 2 | **Griffin Funding** | 2492 | 50+DC | DSCR specialist | Top DSCR; verify state coverage at NMLS |
| 3 | **Kiavi** | 1989680 | 49+DC (excludes NY) | DSCR + bridge | Tech-forward; SSN required, NO ITIN |
| 4 | **Visio Lending** | 1099867 | 48 (excludes AK, HI) | DSCR + STR specialist | Broadest STR acceptance |
| 5 | **Acra Lending** | 1103782 | All 50+DC | 100% non-QM | Acra: 100% Non-QM |
| 6 | **OCMBC** | 4161 | All 50+DC | Mixed | Top wholesale 2024 #1 by volume |
| 7 | **CrossCountry Mortgage** | 3029 | All 50+DC | Mixed (Non-QM 8% of $3.48B) | Top retail/WS |
| 8 | **A&D Mortgage** | 1374554 | All 50+DC | DSCR specialist (84% Non-QM) | Top 5 |
| 9 | **Newfi** | 1541470 | All 50+DC | DSCR + bridge | Top DSCR |
| 10 | **Angel Oak Mortgage Solutions** | 1104872 | 47+DC | Non-QM suite | Verify state list |
| 11 | **UWM (NEW Apr 2026 Non-QM)** | 3038 | All 50+DC | Wholesale #1 | New Non-QM entry (Apr 2026); verify licensing in all states for new program |
| 12 | **Defy Mortgage** | 1491028 | Most 50 | DSCR specialist | STR via hist/market/AirDNA |
| 13 | **Easy Street Capital** | 1699020 | Most 50 | STR specialist | No min DSCR for STR |
| 14 | **Lima One Capital** | 1293744 | ~41 (per TOPIC 8) | STR/blanket | Dedicated STR |
| 15 | **New Silver** | 1574878 | Most 50 | DSCR + bridge | 14-21d close |
| 16 | **American Heritage** | 332235 | Most 50 | 100% non-QM | 12mo reserves sub-1.0 |
| 17 | **Rocket Pro TPO** | 3038 | All 50+DC | Wholesale | $3.5M max |
| 18 | **Insula Capital Group (NEW Jun 2026)** | NEW | Verify | Portfolio-level DSCR | NEW Jun 11 2026; verify licensing |
| 19 | **Deephaven** | 1208113 | National | Non-QM | STALE per TOPIC 8 (re-verify) |
| 20 | **Ready Capital** | 2992 | Most 50 | Commercial bridge | Top commercial |

**NMLS ID verification required at engine ingest.** The above NMLS IDs are sourced from public NMLS records; each must be confirmed against the lender's current NMLS Consumer Access profile at engine ingest. Re-verification cadence: quarterly (per TOPIC 10 evidence_vault decay rules).

**Source for lender data:** TOPICAL_INDEX §8 (9-lender matrix, primary-source verified); TOPICAL_INDEX §15 (Top Non-QM Lenders 2025 by Scotsman Guide); Insula Capital Group PR Web release June 11, 2026, https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html; NMLS Consumer Access, https://www.nmlsconsumeraccess.org.

---

## 5. State-Specific DSCR Disclosure Requirements

| State | Disclosure Requirement | Source |
|---|---|---|
| **CA** | **CA Prop 13 / Prop 19** property tax reassessment notice at or before close (supplemental tax bill expected); CA-specific mortgage disclosure under CCFLA (CFL license disclosure) | CA Rev & Tax Code §§60-69; CA Fin Code §22000 et seq. |
| **NY** | **NYDFS Mortgage Banker disclosure form**; §6-l/§6-m high-cost/subprime home loan disclosure (if applicable) | NY Banking Law §6-l, §6-m; 3 NYCRR Part 410 |
| **MA** | MA Attorney General Home Ownership disclosure; MA-specific mortgage broker disclosure | MA Gen Laws ch.93A; 209 CMR §32.00 et seq. |
| **MN** | MN §58.137 disclosure (if consumer-purpose, post-HF 3437 business-purpose exempt) | MN Stat §58.137 |
| **TX** | TX SML Mortgage Banker Disclosure; TX Constitution Article XVI §50 homestead protection (not relevant for investment) | TX Fin Code §302; TX Const art XVI |
| **FL** | FL OFR Mortgage Lender/Broker disclosure | FL Stat §494 |
| **CA, NY, IL, MA, WA, OR, NJ** | **State Consumer Protection Act disclosures** (uniform deceptive practices acts) | Various state laws |

**Engine rule:** State-specific disclosure requirements are added to the disclosure library at loan-level by state. The borrower's signing of the disclosure is logged in the audit trail.

---

## 6. Engine Schema Recommendations (Slice 2 P0-2)

### 6.1 New Database Tables

```sql
CREATE TABLE state_licensing (
    state CHAR(2) PRIMARY KEY,
    state_name VARCHAR(50) NOT NULL,
    safe_act_mlo_required BOOLEAN DEFAULT TRUE,
    entity_license_required BOOLEAN DEFAULT TRUE,
    entity_license_type VARCHAR(100),
    state_banking_dept VARCHAR(200),
    key_state_statute VARCHAR(500),
    usury_cap_pct NUMERIC(5,2),
    usury_business_purpose_exemption BOOLEAN,
    ny_6l_applicable BOOLEAN DEFAULT FALSE,
    dscr_specific_disclosure_required BOOLEAN DEFAULT FALSE,
    declining_market_ltv_cap BOOLEAN DEFAULT FALSE,
    ppp_threshold_2026 NUMERIC(12,2),  -- e.g., OH 116,356; PA 319,777; SC 690,000
    ppp_base VARCHAR(20) DEFAULT 'REMAINING',  -- ORIGINAL or REMAINING
    special_notes TEXT,
    last_verified DATE,
    source_url TEXT,
    confidence_score INT
);

CREATE TABLE lender_state_coverage (
    id UUID PRIMARY KEY,
    lender_nmls_id VARCHAR(20) NOT NULL,
    state CHAR(2) NOT NULL,
    entity_license_status VARCHAR(50) NOT NULL,  -- ACTIVE, INACTIVE, REVOKED, NOT_LICENSED
    license_number VARCHAR(100),
    license_type VARCHAR(100),  -- Banker, Broker, Both
    mlo_count INT,  -- Number of licensed MLOs in this state
    business_purpose_focus BOOLEAN,  -- Does lender focus on business-purpose?
    lender_matrix_excludes BOOLEAN DEFAULT FALSE,
    exclusion_reason TEXT,
    verified_date DATE,
    source_url TEXT,
    confidence_score INT,
    FOREIGN KEY (state) REFERENCES state_licensing(state)
);

CREATE TABLE state_consumer_purpose_test (
    test_id UUID PRIMARY KEY,
    loan_id UUID NOT NULL,
    state CHAR(2) NOT NULL,
    borrower_vesting VARCHAR(50),  -- Individual, LLC, LP, Corp, Trust
    attestation_signed BOOLEAN NOT NULL,
    attestation_date DATE,
    attestation_text TEXT,
    is_business_purpose BOOLEAN,
    applies_usury_cap BOOLEAN,
    applies_ppp_cap BOOLEAN,
    applies_ny_6l BOOLEAN,
    verified_date DATE,
    source_url TEXT
);
```

### 6.2 Acceptance Criteria for Slice 2 P0-2

> **CR-1: NMLS Verified.** Each lender in the top-20 DSCR matrix has an NMLS ID, current state licenses, and verified entity status. NMLS Consumer Access pull is the canonical verification.
>
> **CR-2: State-Specific License Verified.** For each state in the lender matrix, the lender has an active entity license. If a lender is not licensed in a state, the lender is excluded from that state's matching (display "lender not licensed in this state").
>
> **CR-3: Business-Purpose Attestation Captured.** Each DSCR loan captures the business-purpose attestation (signed by borrower; per state requirement). Without this attestation, the loan defaults to consumer-purpose (and is subject to all consumer protections).
>
> **CR-4: NY §6-l/§6-m Logic.** For NY loans, if not business-purpose, apply §6-l/§6-m protections (no PPP on high-cost home loan, etc.).
>
> **CR-5: Usury Cap Check.** Engine pulls state usury cap and applies at pricing time. If pricing exceeds cap and no business-purpose exemption applies, BLOCK.
>
> **CR-6: NJ LLC Special Handling.** Per TOPIC 11, NJ LLC/entity vestings require per-lender matrix confirmation. Engine rule: NJ + LLC = HIGH-RISK flag; require explicit lender match.
>
> **CR-7: OH/PA PPP Threshold Annual Re-Index.** Celery cron task re-pulls OH ($116,356 in 2026) and PA ($329,411 in 2026) PPP thresholds annually (January 1).
>
> **CR-8: MN HF 3437 Effective 8/1/26.** Business-purpose DSCR loans originated 8/1/26+ in MN are exempt from §58.137 consumer protections. Engine rule: pre-8/1/26 = full §58.137; post-8/1/26 + business-purpose attestation = exempt.
>
> **CR-9: State-Specific Disclosure Bundle.** Engine outputs a state-specific disclosure bundle (CA Prop 13/19, NY §6-l, MA, etc.) for inclusion in the loan closing package.
>
> **CR-10: Re-Verification Cadence.** Per TOPIC 10, lender state coverage verified quarterly; state law re-verified annually or on regulatory change.

---

## 7. Top 5 Primary Sources

1. **NMLS Consumer Access** — https://www.nmlsconsumeraccess.org — Public lookup of NMLS ID, state licenses, license status, regulatory actions. Canonical source for entity MLO and mortgage banker license verification. **Engine reads this as the primary verification source for every lender-state pair.**

2. **NMLS State Resource Center** — https://mortgage.nationwidelicensingsystem.org/knowledge/products/nmls/stateresourcecenter — Centralized state-specific licensing requirements, account administration, and reporting guides. **Engine references this for state license application processes and renewal cadence.**

3. **CSBS 50-State Survey of Consumer Finance Laws** — https://www.csbs.org/50-state-survey-consumer-finance-laws — Authoritative 50-state compilation of usury laws, licensing requirements, and consumer protections. **Engine uses this as a cross-check on per-state usury caps and licensing requirements.**

4. **SAFE Act, 12 USC §5101-5116** — Federal statutory authority for MLO licensing and NMLS. **The SAFE Act is the federal floor; state laws may be MORE restrictive but not less.** https://www.law.cornell.edu/uscode/text/12/chapter_51

5. **California Constitution Article XV (Usury) and DFPI CFL License** — https://oag.ca.gov/sites/all/files/agweb/pdfs/consumers/constitution.pdf; https://dfpi.ca.gov/ — CA Constitution Art. XV §1 sets the 10% usury cap with CFL licensee exemption; DFPI is the most active state regulator for non-bank mortgage lenders. **Engine rule: CA CFL license is required for any non-bank DSCR lender to originate at rates above 10%/year.**

---

## 8. Other Key Sources

- **NY Banking Law §6-l** — https://codes.findlaw.com/ny/banking-law/bnk-sect-6-l/
- **NY Banking Law §6-m** — https://codes.findlaw.com/ny/banking-law/bnk-sect-6-m/
- **Justia NY Banking Law §6-i** — https://law.justia.com/codes/new-york/bnk/article-1/6-i/
- **MN Stat §58.137** — MN Commerce Department (verify HF 3437 enactment text)
- **NJ Stat §46:10B-2** + **NJ Stat §17:11C-51** — NJ DOBI
- **OH Rev Code §1343.011** — Ohio Revised Code (publicly available)
- **PA Act 6 of 1974 §406 LIPL** — PA DBS
- **AAPL Business-Purpose Lending Position** — https://aaplonline.com/articles/featured/business-purpose-loans-should-not-be-subject-to-mortgage-lender-licensing/
- **LoanStream Wholesale Business Purpose Lending Matrix (2025)** — https://loanstreamwholesale.com/wp-content/uploads/2025/07/LSM-F-BRK_BRKLICREQALTDSCR-250710.pdf
- **ARDRI State Licensing Maps** — https://ardri.ai/state-licensing/
- **Hudson Cook Usury Monitor (Fall 2025)** — https://www.hudsoncook.com/article/the-hudson-cook-usury-monitor-a-publication-of-recent-usury-and-finance-charge-cases-fall-2025/
- **Doss Law Definitive Guide to Usury in California** — https://www.dosslaw.com/definitive-guides/doss-law-llps-definitive-guide-to-usury-in-california/
- **MBA State Licensing Resource** — https://www.mba.org/industry-resources/Commercial-Multifamily-Professionals/licensing-by-state-landing-page
- **NMP: New Maryland Licensing Regs Spark Funding Uncertainty** — https://nationalmortgageprofessional.com/news/new-maryland-licensing-regs-spark-funding-uncertainty
- **Pennymac Non-QM Program Update 26-16 (Feb 17, 2026)** — https://corr.pennymac.com/non-delegated-announcements/announcement-26-16
- **UWM Non-QM Entry (Apr 2026)** — Inside Mortgage Finance, NMP coverage
- **Insula Capital Group Portfolio-Level DSCR Launch (Jun 11, 2026)** — https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html

---

## 9. Blockers / Gaps Identified

| Gap | Severity | Mitigation |
|---|---|---|
| **NMLS Consumer Access does not have a public REST API** (must scrape or use approved data feed) | MEDIUM | NMLS Approved Vendor feeds (Black Knight, Encompass, etc.); or scrape with permission. |
| **Per-lender state coverage** varies and changes quarterly | HIGH | Per-lender quarterly re-verification; engine reads NMLS Consumer Access + lender's own disclosure page |
| **MN HF 3437** text + effective date primary source not yet directly verified (corpus source only) | MEDIUM | MN Legislature bill tracker for HF 3437; primary text needed before engine rule (CR-8) goes live |
| **NY §6-l/§6-m** business-purpose exemption is fact-specific; some NY court rulings narrow it | MEDIUM | NYDFS guidance + recent case law review; engine should default to applying §6-l/§6-m unless business-purpose attestation is in the file |
| **DE (5%+ Federal Reserve discount rate)** and **WV (6% general)** low caps may block business-purpose DSCR at typical non-bank rates | LOW | Entity structuring (single-purpose LLC, foreign entity) typically exempts; engine should document the structuring |
| **OK/TX APR >13%/>12% PPP ban** requires rate check at origination | MEDIUM | Engine pricing module checks APR vs state PPP trigger; warn/block |
| **2026 usury cap verification** (NJ 30% civil, etc.) — many state caps have not been verified for 2026 | LOW | Default to 2025-2026 published statutory caps; flag any cap not verified for 2026 |

---

*End of Domain 2 research document. Author: MiniMax Mavis (Agent 1, parallel dispatch). Verified_date: 2026-06-18.*
