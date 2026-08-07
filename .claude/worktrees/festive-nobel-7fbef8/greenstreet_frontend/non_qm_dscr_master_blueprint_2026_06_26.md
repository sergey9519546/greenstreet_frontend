# NON-QM / DSCR MASTER BLUEPRINT
## Broker-First Operating Company + Proprietary Deal-Truth Engine + Future Wholesale Lender OS

**Prepared for:** Sergey Avetisyan  
**Date:** June 26, 2026  
**Classification:** Consolidated business, product, technical, underwriting, compliance, and operating blueprint  
**Source base:** Four uploaded internal documents plus public web verification performed June 26, 2026.

---

## 0. Executive Decision

The correct build is **not** “build a full lender from scratch.” That is the expensive fantasy version.

The correct build is:

```text
PHASE 1: Broker-first DSCR / investor-loan operating company
PHASE 2: Proprietary internal Deal-Truth Engine used to close cleaner files faster
PHASE 3: Capital-markets-ready correspondent platform
PHASE 4: Wholesale lender only after tape, compliance, capital, and operations exist
```

The strategic rule:

```text
BUY commodity infrastructure.
BUILD proprietary judgment.
```

### Buy

- Product and Pricing Engine (PPE)
- Loan Origination System (LOS)
- Broker/TPO portal plumbing
- Document parsing and bank-statement extraction where possible
- HMDA/compliance workflow tooling
- QC workflow tooling
- Hedge/MSR analytics when entering lender/correspondent mode

### Build

- Dual-track DSCR math
- Investor survival analysis
- True cost of capital / AEY ranking
- State-aware prepayment and STR gates
- Insurance and property-tax shock detection
- Deal repair solver
- After-tax insight layer
- Lender-fit intelligence ledger
- Broker-facing “speed-to-certainty” workflow
- Investment memo / borrower advisory output

**Verdict:** Start as a disciplined DSCR broker with a proprietary screening and advisory engine. Do not spend the first budget building a lender, PPE, LOS, servicing stack, or securitization workflow. Those are later-stage infrastructure.

---

## 1. Source Consolidation: What Was Accepted, Upgraded, or Rejected

### Internal documents consolidated

| Code | Document | Role in final blueprint |
|---|---|---|
| D1 | `DSCR PROFESSIONAL ENGINE — Canonical Blueprint (FINAL)` | Core product math, dual-track principle, golden tests, stress engine, lender ranking, compliance posture |
| D2 | `DSCR Strategic Decision Memo` | Business strategy, broker-first path, bootstrap sequencing, 90-day plan, wedge selection |
| D3 | `THE MISSING PIECES: NON-QM WHOLESALE LENDER GAP ANALYSIS` | Destination-state lender gaps: PPE, TPO, warehouse, QC, LOS, compliance, capital markets |
| D4 | `NON-QM PPE: BUILD VS. BUY ANALYSIS` | PPE vendor strategy and buy-vs-build recommendation |

### Accepted

1. **Dual-track DSCR is the spine.** Track 1 answers “can it qualify?” Track 2 answers “can the investor survive it?”
2. **Law gates economics.** STR legality, prepayment legality, licensing, business-purpose classification, insurance bindability, and fraud checks run before lender shopping.
3. **False precision is dangerous.** No numeric approval probabilities. Use fit tiers, confidence labels, source dates, and reasons.
4. **Buy PPE; build analytics.** The internal docs were directionally correct: a proprietary PPE is not the right first build.
5. **Broker-first is the correct launch.** A bootstrap budget belongs in licensing review, lender approvals, lead flow, and workflow—not capital markets fantasy.
6. **After-tax insight is the strongest high-trust wedge.** It is useful on day one and requires no warehouse line.

### Upgraded

1. **The blueprint now separates three businesses that were previously mixed:**
   - Brokerage
   - Software-assisted underwriting/advisory tool
   - Wholesale/correspondent lender
2. **The build order is more ruthless.** Monte Carlo, ML, securitization dashboards, and full PPE integration are explicitly gated behind real closed-loan data.
3. **State claims are demoted unless counsel-verifiable.** The engine stores state rules, but the business cannot rely on scraped law summaries without legal review.
4. **Insurance is elevated from line item to kill criterion.** In high-risk states, no bindable quote means no “proceed” output.
5. **Property-tax reassessment is promoted to a P0 underwriting gate.** Seller tax bill is treated as suspect until purchase-basis tax is modeled.
6. **Vendor choice is reframed.** The first decision is not “which enterprise PPE?” It is “which broker stack gets us quoting and closing fastest now, while preserving a future API path?”

### Rejected / demoted

| Claim or behavior | Decision |
|---|---|
| “Build the best wholesale lender immediately.” | Rejected. Too capital- and compliance-heavy before tape. |
| “Build proprietary PPE from scratch.” | Rejected. Commodity infrastructure; too much maintenance burden. |
| “Nationwide launch because business-purpose loans are exempt.” | Demoted. Federal consumer-credit exemptions do not eliminate state licensing, advertising, servicing, usury, UDAAP, fair-lending, or fraud risk. |
| “Use lender/state/rate details as evergreen facts.” | Rejected. Every such claim needs source date, source type, and direct reverification. |
| “Use AI/ML approval scoring now.” | Rejected until there is closed-loan performance data and compliance governance. |
| “Make sub-1.0/no-ratio DSCR the hook.” | Rejected. It attracts bad paper, high fallout, and weak lender reputation. |

---

## 2. Market Reality as of June 2026

### Non-QM is real, but volatile

Non-QM is no longer a fringe category. Public industry reporting based on Optimal Blue data showed Non-QM reaching **10% of total lock volume in March 2026** and **9% in May 2026**, with monthly volatility rather than a clean straight-line climb. Treat the segment as structurally important, not risk-free.

### DSCR is a major Non-QM engine, but not the only one

Investor / DSCR loans were reported at **28.7% of Non-QM volume** in 2025-era reporting, while bank-statement loans were reported at **33.7%**. That means DSCR is large enough to launch around, but a full Non-QM lender eventually needs bank statement, asset depletion, ITIN/foreign national, and bridge-to-DSCR channels.

### Private lending confirms the split

Q1 2026 private-lending reporting showed combined DSCR + RTL activity just under $30B, up ~4.2% YoY, while DSCR alone was reported at **$10.7B**, down **8.8% YoY** from the prior Q1 high-water mark. Translation: investors are still borrowing, but DSCR math is tightening. The winning operator is not the loosest operator; it is the fastest operator that knows when to decline, restructure, or redirect.

### Current rate posture must be live, not hard-coded

The engine must pull live data from:

- Federal Reserve H.15 for Treasury yields
- New York Fed / FRED for SOFR and SOFR averages
- Freddie Mac PMMS for conforming mortgage benchmarks
- PPE/vendor/lender sheets for actual DSCR and Non-QM pricing

As of the current fact-check, the Fed held the target range for fed funds at **3.50%–3.75%** on June 17, 2026; the New York Fed’s 30-day average SOFR was around **3.63%** on June 25, 2026; and Freddie Mac/AP reporting placed the 30-year fixed mortgage average near **6.49%** in late June 2026.

The product must display dated pricing bands, not one fake “current DSCR rate.”

---

## 3. Company Thesis

### One-line company thesis

> A DSCR and investor-loan brokerage that closes cleaner files faster by showing investors both the lender’s approval math and the real survival math before the file reaches underwriting.

### Real wedge

Most brokers sell:

```text
rate + speed + “no tax returns”
```

This company sells:

```text
speed-to-certainty + deal truth + after-tax awareness + lender-fit precision
```

### The borrower-facing promise

```text
We tell you the number the lender sees, the number ownership will feel, the costs hiding in tax/insurance/prepay, and the cleanest path to fund—or we tell you to pass before you waste time.
```

### The lender-facing promise

```text
We send cleaner investor files with business-purpose support, occupancy evidence, verified rent logic, bindable insurance, reserve documentation, and fewer late-stage surprises.
```

### What this is not

- Not a loan commitment
- Not legal advice
- Not tax advice
- Not an appraisal
- Not an automated credit decision
- Not a consumer mortgage promise
- Not a “no rules because LLC” operation
- Not a sub-1.0 DSCR lead trap

---

## 4. Operating Model: Broker First

### Why broker-first wins

| Constraint | Broker-first answer |
|---|---|
| Sub-$25k budget | Avoids warehouse capital, servicing, hedging, lender licensing, and securitization overhead |
| Need revenue fast | Broker approvals + referral channels can produce revenue before a full platform exists |
| Need market knowledge | Every submitted file teaches lender appetite, overlays, defects, and borrower friction |
| Need future capital markets credibility | Clean broker-originated tape becomes the first proof asset |
| Need software product validation | Internal tool becomes tested against real borrower conversations |

### Launch market posture

Do **not** launch as “nationwide DSCR for everyone.”

Launch as:

```text
Experienced investors buying/refinancing 1–4 unit long-term rentals
+
Bridge/hard-money borrowers needing a stabilized DSCR takeout
```

### Files to actively pursue

- FICO 700+
- DSCR ≥ 1.10, preferably ≥ 1.20 for cash-out
- LTV ≤75% purchase
- LTV ≤70% cash-out
- 6–9 months reserves
- Long-term rental or seasoned STR
- Entity ownership when valid and supported
- Signed lease or credible 1007/1025 support
- Bindable insurance quote early
- Clean beneficial ownership and occupancy story

### Files to decline or restructure

- First-time investor + high LTV + low FICO + sub-1.0 DSCR
- STR with no legality proof and no operating history
- Deal relying on seller’s stale property tax bill
- High-risk insurance state without a bindable quote
- Borrower intends to occupy while calling it business-purpose
- Lease rent materially above appraised market rent with no proof of collection
- Cash-out file with thin reserves and DSCR below 1.20
- Any file where the business-purpose classification is cosmetic

---

## 5. The Product: Deal-Truth Engine

### Product name for internal build

```text
DEAL TRUTH ENGINE
```

Submodules:

1. **Truth Ledger** — every input has source, confidence, timestamp, owner, and staleness.
2. **Dual-Track DSCR Core** — lender qualification vs investor survival.
3. **Law-Gate Console** — business purpose, occupancy, state licensing posture, PPP, STR legality, HOA restrictions.
4. **Insurance Kill Switch** — quote required in risk states before scenario approval.
5. **Tax Shock Engine** — purchase-year reassessment, depreciation, recapture, passive-loss boundaries.
6. **Lender-Fit Router** — eligible lenders, fit tier, overlays, reserve needs, required documents.
7. **AEY / True Cost Engine** — ranks capital by actual borrower cost over expected hold.
8. **Deal Repair Solver** — required rent, price, LTV, rate, reserves, insurance, tax appeal, or product switch.
9. **IC Memo Generator** — borrower/advisor memo, lender package summary, red-flag log.
10. **Tape Builder** — performance and defect learning loop once deals close.

### Product philosophy

```text
The system does not “approve” loans.
It creates a defensible, dated, evidence-backed recommendation.
```

Outputs:

```text
PROCEED
PROCEED WITH CONDITIONS
RESTRUCTURE
HOLD FOR DOCUMENTS
PASS
LEGAL / TAX / INSURANCE REVIEW REQUIRED
```

---

## 6. Core Math Spine

### 6.1 Track 1 — Lender Qualification DSCR

Purpose: model what the lender/program usually uses to qualify the loan.

```text
Track1_DSCR = Qualifying_Gross_Rent / PITIA
```

Where:

```text
PITIA = Principal + Interest + Taxes + Insurance + HOA/Association + required flood/MI if applicable
```

Program toggles:

```text
Gross Rent / PITIA
Gross Rent / ITIA for interest-only
Lower of lease or appraised market rent
Vacant property → appraised market rent
2–4 unit vacancy toggle if specific lender requires it
STR income method: historical / AirDNA / appraiser / long-term fallback
NOI / P&I alternative if lender uses that method
```

Strict rule:

```text
No default vacancy haircut on long-term 1–4 unit Track 1 unless the target lender’s program requires it.
```

Public support: Griffin Funding publishes a gross-rental-income ÷ PITIA method and distinguishes it from NOI-based methods. The system must still treat formula choice as lender-specific.

### 6.2 Track 2 — Investor Survival DSCR

Purpose: model whether the investor can actually survive the asset.

Two acceptable forms must be supported. Do not mix them.

#### Simplified survival form

```text
Investor_Adjusted_Rent = Gross_Rent × (1 − Vacancy)
Investor_Net_Before_PITIA = Investor_Adjusted_Rent − Management − Maintenance − STR_Operating_Adjustments
Track2_DSCR = Investor_Net_Before_PITIA / PITIA
```

In this simplified form, do **not** also subtract taxes/insurance/HOA from the numerator because PITIA already contains them.

#### Full investment-accounting form

```text
EGI = Gross_Potential_Rent × (1 − Vacancy)
OpEx = Management + Maintenance + Taxes + Insurance + HOA + Utilities + Turnover + STR Costs
NOI = EGI − OpEx
ADS = P&I × 12
Economic_DSCR = NOI / ADS
```

The UI must label which method is being displayed.

### 6.3 Golden test vector

Ship these as unit tests:

```text
Price: $425,000
LTV: 75%
Loan: $318,750
Rent: $3,000/mo
Taxes: $5,000/yr
Insurance: $2,000/yr
HOA: $150/mo
Non-P&I monthly fixed cost: $733.34

30-year amortizing factors:
6.125% → $607.61 per $100k
6.500% → $632.07 per $100k
7.000% → $665.30 per $100k
7.500% → $699.21 per $100k
8.000% → $733.76 per $100k
8.250% → $751.27 per $100k

At 7.00%:
P&I ≈ $2,121
PITIA ≈ $2,854
Track 1 ≈ 1.05

At 8.25%:
Track 1 ≈ 0.96

At 8% vacancy and 8% management:
Track 2 ≈ 0.88
```

---

## 7. Legal, Compliance, and Kill Gates

### 7.1 Business-purpose classification

Federal Regulation Z commentary treats credit to acquire, improve, or maintain non-owner-occupied rental property as business-purpose credit, including a single-family house rented to another person, but that does **not** eliminate all legal risk.

The engine must capture:

```text
Borrower type: individual / LLC / corporation / trust
Beneficial owners
Occupancy intent
Business-purpose attestation
Use of proceeds
Lease/listing/property-manager evidence
Expected personal use days
Property units
State
Lien position
Loan purpose: purchase / rate-term / cash-out / rehab / bridge takeout
```

System warning:

```text
Business-purpose ≠ unregulated.
```

Still relevant:

- State mortgage broker/lender licensing
- Advertising rules
- Usury and rate caps
- UDAAP
- ECOA / fair-lending risk
- Privacy and data security
- Servicing/collection rules
- Fraud statutes
- Appraisal independence
- HMDA depending on institution and transaction coverage
- TILA/RESPA if the facts make it consumer-purpose

### 7.2 State licensing

Do not hard-code “no license needed” as a blanket state claim.

Build a **state legal memo table**:

| Field | Required |
|---|---|
| State | Yes |
| Business-purpose broker license required? | Yes |
| Entity borrower exemption? | Yes |
| Individual investor treatment | Yes |
| Commercial mortgage broker license? | Yes |
| Advertising registration? | Yes |
| Servicing license? | Yes |
| Usury / rate cap exposure | Yes |
| PPP law implications | Yes |
| Source | Attorney memo / statute / regulator |
| Last verified | Date |
| Expiration / reverify date | Date |

Minimum counsel questions:

1. Does the state regulate origination/brokering of business-purpose loans secured by residential real property?
2. Does the business-purpose exemption apply to LLC/entity borrowers?
3. Does it apply when the occupant is the borrower/member?
4. Is there a separate commercial mortgage broker/lender license?
5. Are there usury or rate caps on business-purpose real estate loans?
6. Are mortgage advertising or lead-generation registrations required?
7. Does the state regulate servicing or collections on these loans?
8. Are prepayment penalties limited by state law, unit count, loan size, APR, borrower type, or fixed/ARM status?

### 7.3 Prepayment penalty gate

Prepayment penalties are not merely pricing features. They are legal and economic features.

Engine branch order:

```text
1. Business-purpose and entity-vested?
2. Bank/depository or nonbank lender?
3. Individual vesting?
4. Consumer-purpose facts present?
5. State, loan amount, unit count, APR, fixed/ARM, and penalty structure
6. Lender-specific state matrix
7. Actual loan-document language
```

Outputs:

```text
Allowed
Restricted
Unavailable
Ambiguous — counsel required
Unavailable with no-PPP repricing required
```

If no PPP is available:

```text
Reprice no-PPP → recompute payment → recompute Track 1 → recompute Track 2 → recompute AEY → rerank lenders
```

### 7.4 STR legality gate

Short-term rental income is disabled unless legality is clear enough to support underwriting.

Required fields:

```text
City rules
County rules
State rules
Permit status
Permit cap / waitlist
Minimum stay
Owner-occupancy requirement
HOA / condo / CC&R status
Enforcement history
Pending legislation
Existing platform history
Professional operator status
Property manager agreement
```

STR output states:

```text
CLEAR
RESTRICTED
UNCERTAIN
PROHIBITED
HOA REVIEW REQUIRED
LEGAL REVIEW REQUIRED
```

If not CLEAR:

```text
STR income is excluded from base qualification or shown only as speculative scenario.
```

---

## 8. Property-Tax and Insurance Shock Engine

### 8.1 Property-tax reassessment

The engine must never use seller’s tax bill as a clean input without checking purchase-basis reassessment.

Required behavior:

```text
Seller_Tax_Bill = input
Purchase_Price = input
State_County_Rule = lookup
Estimated_New_Tax = Purchase_Price × effective_tax_rate OR assessor estimator
DSCR_Before = rent / PITIA_seller_tax
DSCR_After = rent / PITIA_reassessed_tax
Delta = DSCR_After − DSCR_Before
```

High-priority states:

- California: Prop 13 reappraisal on change of ownership; supplemental bills possible.
- Texas: taxable property generally appraised at market value as of January 1.
- Florida: capped/homestead assessed values can reset toward market after ownership change; use local estimator.
- New Jersey, New York, Illinois: high tax sensitivity; require local tax modeling.

UI copy:

```text
Seller pays $X/year. Your tax bill may reset toward a purchase-basis estimate of ~$Y/year. This changes Track 1 DSCR from A to B and cash flow from C to D.
```

### 8.2 Insurance kill switch

Insurance is not a soft assumption in high-risk markets.

Kill criterion:

```text
IF property_state_region IN {FL, coastal CA, CA wildfire zones, TX Gulf, LA coastal, other high-risk insurance counties}
AND no bindable quote
THEN verdict = HOLD FOR INSURANCE / PASS UNTIL QUOTE
```

Modeling behavior:

```text
Year 1 premium = bindable quote
Year 2 stress = quote × 1.10
Year 3 stress = quote × 1.25 or local stress curve
Track 1 uses premium in PITIA
Track 2/full NOI uses premium in OpEx
```

Insurance data should have:

```text
Carrier
Quote date
Coverage type
Deductible
Wind/hail/fire exclusions
FAIR Plan / Citizens / residual market reliance
Replacement cost
Lender acceptability
Expiration date
```

---

## 9. After-Tax Wedge

The after-tax module is not tax advice. It is an advisory prompt generator and scenario layer. Every output must say “CPA review required.”

### 9.1 Depreciation

Core rule:

```text
Residential rental building basis / 27.5 years under GDS
Land is not depreciable
```

The engine must require:

```text
Purchase price
Land allocation %
Building allocation %
Closing cost allocation
Placed-in-service date
Personal-use days
Cost segregation study? yes/no
```

### 9.2 Bonus depreciation and cost segregation

Current verified tax posture:

```text
OBBB/OBBBA restored permanent 100% additional first-year depreciation for qualified property acquired after January 19, 2025.
```

But:

```text
The residential building structure itself is 27.5-year property and does not become 100% bonus property.
Cost segregation may identify 5-, 7-, or 15-year components that can qualify.
State conformity varies.
CPA review required.
```

### 9.3 Recapture and exit

The exit model must show at least:

```text
Sell-and-pay-tax scenario
1031-exchange scenario
Hold/refi scenario
```

Required tax flags:

```text
Depreciation recapture
Section 1245 ordinary-income recapture for short-life components
Unrecaptured Section 1250 gain
Capital gain
NIIT exposure
Passive loss limitation
Suspended losses
Real estate professional status toggle
```

---

## 10. Lender-Fit and Pricing Architecture

### 10.1 Build-vs-buy decision

Final answer:

```text
Buy PPE.
Do not build proprietary PPE from scratch.
Build an overlay intelligence system that feeds and reads from PPE.
```

### Why

A real PPE must handle:

- Pricing sheets
- Eligibility matrices
- LLPA stacks
- Margin management
- Lock desk workflow
- Investor overlays
- State restrictions
- PPE/LOS integrations
- Broker distribution
- Audit logs
- Rate lock and extension logic

This is not the first proprietary build.

### 10.2 Vendor posture

| Vendor | Best use | Blueprint recommendation |
|---|---|---|
| Optimal Blue / LoanSifter | Broad broker/investor pricing network, enterprise capital markets, broker quoting | Useful for broker speed and market access; watch cost and dependency risk |
| Polly | Modern enterprise PPE with highly configurable dimensional rules | Strong later-stage contender for lender/correspondent mode |
| Lender Price FLEX | Non-QM/non-agency configurable pricing engine | Strong destination-state PPE candidate |
| LoanPASS | Rules-first pricing/eligibility decisioning, Non-QM/BPL specialty | Strong destination-state candidate where complex eligibility is central |

### 10.3 Overlay design

The Deal-Truth Engine sends to PPE:

```json
{
  "loan_purpose": "purchase|rate_term|cash_out",
  "property_state": "CA",
  "property_type": "SFR|2-4|condo|condotel|mixed",
  "occupancy": "non_owner_investment",
  "borrower_type": "LLC|individual",
  "fico": 740,
  "ltv": 75,
  "loan_amount": 318750,
  "track1_dscr": 1.05,
  "track2_dscr": 0.88,
  "str_status": "CLEAR|UNCERTAIN|PROHIBITED",
  "ppp_status": "allowed|restricted|unavailable|ambiguous",
  "insurance_status": "bindable_quote_received",
  "reserve_months_available": 9,
  "documentation_confidence": "verified|partial|weak"
}
```

The PPE returns:

```json
{
  "eligible_products": [],
  "ineligible_reasons": [],
  "rate": 0.07125,
  "points": 1.5,
  "fees": 1495,
  "prepay_structure": "5-4-3-2-1",
  "lock_days": 45,
  "extension_cost": 0.25,
  "reserve_requirement": "6 months",
  "investor_name": "redacted_or_named",
  "source_timestamp": "2026-06-26T09:00:00-07:00"
}
```

The Deal-Truth Engine then computes:

```text
True Cost
AEY
Track 1 rerun
Track 2 rerun
Hold-period comparison
Points recoup
PPP trap risk
Recommended lender order
```

### 10.4 Two-quote rule

Every borrower scenario should show:

```text
Quote A: best-fit / flexible lender
Quote B: rate-competitive lender
```

Never show a single “best” quote unless only one eligible lender exists and the output says that clearly.

---

## 11. True Cost of Capital

Rate is not cost.

### Required formula

```text
True_Cost(hold_period) =
  Interest paid during hold
+ Points
+ Lender fees
+ Broker fees
+ UW / processing / doc fees
+ Lock extension cost
+ Prepay penalty
+ Refinance / exit costs
− Any lender credits
```

### AEY formula

```text
AEY = XIRR(actual borrower cash flows)
```

Example borrower cash flows:

```text
Month 0: Loan proceeds net of points/fees
Month 1..N: monthly payments
Exit month: payoff balance + PPP + exit/refi costs
```

### Required hold periods

```text
12 months
24 months
36 months
60 months
Expected hold entered by borrower
```

### Points recoup

```text
Break_even_months = points_cost / monthly_payment_savings_vs_par
```

Output color logic:

```text
Green: recoup before expected hold and before PPP trap
Yellow: recoup within 12 months of PPP expiry
Red: recoup after expected hold or trapped by prepay
```

---

## 12. Deal Repair Solver

The solver must answer:

```text
What exact change fixes the deal?
```

Repair levers:

| Failure | Solver output |
|---|---|
| Track 1 DSCR too low | Required rent, lower loan amount, lower LTV, lower rate, buy-down points, lower taxes/insurance, different product |
| Track 2 survival too low | Price reduction, expense reduction, reserve requirement, property management change, insurance renegotiation, pass |
| LTV too high | Required down payment, required price cut, required appraised value |
| Rate too high | Max rate before fail, points recoup, ARM/IO comparison |
| Insurance kills | Maximum acceptable premium, alternate carrier requirement, pass |
| Tax reassessment kills | Max purchase price, county tax appeal scenario, pass |
| STR legality uncertain | Long-term rent fallback, legal review, pass |
| PPP unavailable | No-PPP rate delta, hold-period recommendation |
| Reserves short | Required liquid cash, eligible asset tiers, cash-out reserve counting if allowed |
| Lender mismatch | Alternate lender/product/documentation route |

Required output:

```text
This deal fails because [dominant constraint].
The smallest repair is [specific change].
If not possible, pass.
```

---

## 13. Product Modules

### 13.1 Public lead magnet

Public calculator:

- Dual-track DSCR
- Rent-to-price pressure indicator
- Tax reset warning
- Insurance warning
- “What the lender sees vs what you own”
- Lead capture
- Soft scenario export

Do not show lender names or quote rates publicly unless licensed/approved and compliant.

### 13.2 Internal scenario desk

Broker-facing app:

- Intake
- Deal scorecard
- Document checklist
- Lender-fit router
- Scenario comparison
- AEY ranking
- Repair solver
- Memo export
- Follow-up tasks

### 13.3 Borrower advisory memo

One-page memo:

```text
Deal verdict
Track 1 DSCR
Track 2 DSCR
Cash flow
Lender fit tier
Biggest risk
Insurance status
Tax reset status
Prepay status
Required reserves
Repair plan
Next document checklist
Disclaimer
```

### 13.4 Lender package summary

Package:

```text
Borrower/entity summary
Property summary
Loan request
Rent source
DSCR method
Insurance quote
Reserve proof
Business-purpose / occupancy support
STR legality support if applicable
Known exceptions
Broker recommendation
```

### 13.5 Tape builder

After closing:

```text
Loan closed? yes/no
Fallout reason
Final lender
Final rate/points/fees
Final DSCR
Appraisal variance
Insurance variance
Time to close
Conditions count
Defects
First payment made?
60/90-day status
Borrower repeat activity
```

This becomes the future underwriting moat.

---

## 14. Data Model

### 14.1 Input provenance object

```json
{
  "field": "monthly_rent",
  "value": 3000,
  "unit": "USD/month",
  "source_type": "lease|1007|airdna|borrower|appraisal|bank_statement|manual",
  "source_document_id": "doc_123",
  "confidence": "verified|probable|borrower_provided|estimated|stale|conflicting|missing",
  "collected_at": "2026-06-26T10:00:00-07:00",
  "expires_at": "2026-07-26T10:00:00-07:00",
  "used_in": ["track1", "track2", "lender_fit"],
  "override_reason": null
}
```

### 14.2 Core tables

```text
borrowers
entities
beneficial_owners
properties
loans
loan_scenarios
rent_sources
insurance_quotes
tax_estimates
dscr_calculations
lender_products
lender_guidelines
ppe_results
prepay_rules
state_legal_memos
str_rules
documents
conditions
scenario_outputs
memos
closed_loan_tape
audit_events
```

### 14.3 Audit events

Every meaningful output stores:

```text
who
what
when
input snapshot
formula version
guideline version
source versions
output
disclaimer
manual overrides
```

---

## 15. Architecture

### Phase 1 technical stack

```text
Frontend: Next.js / React
Marketing site: Webflow or Next.js, but app must share design tokens
Backend: FastAPI or Node/NestJS
Database: Postgres
ORM: Prisma or SQLAlchemy
Document storage: S3-compatible object storage
Auth: Clerk / Auth0 / Supabase Auth
Calculations: deterministic Python/TypeScript library with golden tests
Workflow: Linear-like status model or simple pipeline
Exports: Markdown/PDF memo generation
Observability: Sentry + structured logs
```

### Design constraint if using Webflow + React

If Webflow remains the front page and React handles the app, build a shared design-token layer:

```text
colors
spacing
radius
shadow
typography
buttons
inputs
cards
motion
layout grid
```

Do not manually “eyeball” React to match Webflow. Extract tokens and rebuild shared components.

### Phase 2 technical stack

```text
PPE API integration
LOS integration
Document parser
Bank statement parser
Automated condition checklist
Broker referral CRM
Email/SMS status automation
```

### Phase 3 technical stack

```text
Warehouse line tracking
Hedge analytics
MSR valuation
QC sampling
Investor reporting
TPO management
HMDA / compliance exports
Capital partner dashboard
```

---

## 16. Build / Buy / Partner Matrix

| Capability | Phase 1 decision | Later-state decision |
|---|---|---|
| DSCR calculator | Build | Keep proprietary |
| Dual-track survival | Build | Keep proprietary |
| AEY / true cost | Build | Keep proprietary |
| Lender-fit router | Build lightweight | Integrate with PPE |
| PPE | Use vendor/broker tools | Buy LoanPASS / Lender Price / Polly / Optimal Blue depending model |
| LOS | Avoid full LOS at start | Buy/integrate Encompass, LendingPad, Calyx, etc. |
| Bank statement parsing | Manual/partner | Ocrolus/LoanLogics-style integration |
| TPO portal | Not phase 1 | Buy or build on Salesforce/Encompass TPO-like stack |
| Warehouse management | Not phase 1 | Buy/vendor module |
| QC | Checklist + manual | ACES/LoanLogics-style platform |
| Hedge/MSR | Not phase 1 | MCT/MIAC/Optimal Blue-type tools |
| Investor reporting | Spreadsheet/manual | Data room + dashboard |

---

## 17. 90-Day Execution Plan

### Days 1–14: Foundation

1. Form entity.
2. Pick name/domain/email.
3. Draft compliance disclaimers and business-purpose intake language.
4. Attorney consult using state memo template.
5. Choose 3–5 launch states based on counsel, not internet lists.
6. Apply for broker approvals with 3–5 DSCR/private lenders.
7. Build lender comparison spreadsheet:
   - Min FICO
   - DSCR floor
   - LTV max
   - cash-out cap
   - STR rules
   - reserve rules
   - PPP availability
   - states
   - turn times
   - broker comp
   - overlays
   - contact/AE
8. Build document checklist.
9. Build fraud/occupancy/business-purpose checklist.

### Days 15–30: Productized screening

1. Build internal DSCR calculator with golden tests.
2. Add tax reset warning.
3. Add insurance quote gate.
4. Add reserve calculator.
5. Add basic lender-fit tiering.
6. Add borrower intake form.
7. Add memo template.
8. Build public landing page with lead capture.
9. Add “qualified but negative cash flow” explainer.
10. Create 5 sample scenarios.

### Days 31–60: Distribution

1. Build referral list:
   - investor agents
   - property managers
   - hard-money lenders
   - CPAs
   - REIA organizers
   - small multifamily operators
   - DSCR-unfriendly conventional brokers
2. Outreach daily.
3. Offer free 10-minute “DSCR truth check.”
4. Run all scenarios through checklist.
5. Track every fallout reason.
6. Refine lender router based on real AE feedback.

### Days 61–90: Pilot and close

1. Push first 3–5 qualified files.
2. Document every condition and delay.
3. Compare engine estimate vs final lender terms.
4. Record appraisal variance.
5. Record insurance variance.
6. Record tax variance.
7. Collect testimonials only after actual value is delivered.
8. Publish anonymized case studies:
   - approved as structured
   - approved after repair
   - passed because deal was bad
9. Decide whether to expand state/product scope.

---

## 18. 12-Month Roadmap

### Quarter 1

- Broker approvals
- Public calculator
- Internal scenario desk
- First closed loans
- Lender matrix v1
- State legal matrix v1
- Basic memo generator

### Quarter 2

- PPE/broker pricing workflow
- Borrower portal
- Automated document collection
- Referral CRM
- STR legality workflow
- Insurance partner flow
- CPA referral path for after-tax review

### Quarter 3

- Bank statement scenario module
- Asset depletion module
- Portfolio DSCR module
- Post-close tape tracking
- Quality-control checklist
- API-ready architecture cleanup

### Quarter 4

- Decide:
  - stay broker and scale
  - become correspondent
  - build SaaS side product
  - partner with lender
- Begin warehouse/correspondent feasibility only if:
  - enough clean funded volume
  - low defect rate
  - documented lender pull-through
  - clear capital partner interest
  - compliance budget exists

---

## 19. Future Wholesale Lender Checklist

A fully operational wholesale lender needs the 12 missing systems from the gap analysis:

### P0 blockers

1. Bank statement income engine
2. Product and Pricing Engine
3. Broker/TPO approval and management
4. Warehouse facility management

### P1 high priority

5. Asset depletion / utilization
6. Foreign national / ITIN programs
7. MSR valuation and secondary execution
8. Pipeline hedging and interest-rate risk management
9. QC / loan review process

### P2 medium priority

10. LOS integration
11. Compliance management and state licensing
12. Investor reporting / capital partner dashboard

Strict rule:

```text
Do not call yourself a wholesale lender until these systems exist operationally, not just in a document.
```

---

## 20. Fraud and Quality-Control Program

### Fraud checks

| Risk | Control |
|---|---|
| Occupancy fraud | Attestation + utility/mail/lease/listing evidence |
| Fake lease | Lease verification + deposit history + market rent cross-check |
| Inflated STR projection | AirDNA/historical/appraiser triangulation + legality gate |
| Straw entity | Beneficial ownership verification |
| Undisclosed debt | Credit/liability review where permitted |
| Reserve fabrication | Seasoning and source documentation |
| Appraisal/rent mismatch | 1007/1025 vs lease vs market rent variance |
| Property condition | Appraisal/photo/inspection issue log |
| Insurance gap | Bindable quote and lender-acceptable coverage |
| Business-purpose wrapper abuse | Use-of-proceeds and occupancy consistency checks |

### QC sampling

Phase 1:

```text
100% checklist review on every file.
```

Future lender phase:

```text
10% random pre-funding QC
100% review of high-risk exceptions
100% EPD review
Defect taxonomy
Root-cause correction
Broker scorecards
```

---

## 21. KPIs

### Broker KPIs

| KPI | Target direction |
|---|---|
| Scenario-to-application conversion | Up |
| Application-to-fund conversion | Up |
| Fallout reason clarity | 100% categorized |
| Average days to conditional approval | Down |
| Average conditions per file | Down |
| Lender exception rate | Down |
| Pull-through | Up |
| Repeat borrower rate | Up |
| Referral partner productivity | Up |
| Gross revenue per funded loan | Up, but not by harming borrower DSCR |

### Product KPIs

| KPI | Target |
|---|---|
| Calculation test pass rate | 100% |
| Scenario completion time | <10 minutes internal |
| Missing critical input rate | Down |
| Estimate-to-final-rate variance | Tracked |
| Estimate-to-final-DSCR variance | Tracked |
| Insurance quote variance | Tracked |
| Tax reset variance | Tracked |
| Memo generation time | <2 minutes |
| Manual override rate | Down over time |

### Future capital-markets KPIs

| KPI | Why it matters |
|---|---|
| EPD rate | Lender/investor trust |
| 30/60/90 day delinquency | Tape quality |
| Defect rate | Securitization readiness |
| Repurchase exposure | Survival |
| Pull-through | Hedge accuracy |
| Gain-on-sale | Profitability |
| MSR valuation | Full economics |
| Warehouse dwell time | Liquidity risk |

---

## 22. UI / UX Blueprint

### Visual principle

```text
High-trust financial cockpit, not a mortgage lead form.
```

### Screens

1. **Public Calculator**
   - Big split-screen: lender number vs survival number
   - “This qualifies but loses money” moment
   - Lead capture after useful result, not before

2. **Scenario Desk**
   - Property card
   - Loan terms
   - Rent source
   - Tax/insurance panel
   - Track 1 / Track 2 output
   - Kill gates
   - Repair solver

3. **Lender Router**
   - Eligible lenders
   - Excluded lenders with reasons
   - Fit tier
   - Rate/points/fees if available
   - AEY comparison
   - Quote A / Quote B

4. **Document War Room**
   - Required docs
   - Missing docs
   - Stale docs
   - Conflicting docs
   - Conditions

5. **Memo Generator**
   - Borrower memo
   - Lender package
   - Internal red-flag memo

6. **Tape Dashboard**
   - Closed loans
   - Fallout reasons
   - Variance tracking
   - Lender performance
   - Repeat/refi opportunities

### UX copy style

Use direct language:

```text
This deal qualifies on lender DSCR but fails investor survival.
Insurance is not verified. Do not proceed until a bindable quote is uploaded.
Seller tax bill is not usable. Purchase-basis tax estimate reduces DSCR by 0.11x.
This lender is cheaper on rate but more expensive over your 24-month hold because of points and prepay.
```

Avoid fake certainty:

```text
“You are approved”
“Guaranteed”
“No rules”
“Best rate”
“100% accurate”
```

---

## 23. Compliance Language

### Required global disclaimer

```text
This tool provides scenario analysis and financing-support information for business-purpose investment-property loans. It is not a loan commitment, credit decision, appraisal, legal advice, tax advice, or guarantee of approval. Final eligibility, pricing, documentation, and terms are determined by the applicable lender/investor and governing law. Legal and CPA review may be required.
```

### Required tax disclaimer

```text
Tax outputs are educational scenario estimates only. They do not constitute tax advice. Depreciation, bonus depreciation, cost segregation, passive loss treatment, NIIT, recapture, and 1031 treatment depend on taxpayer-specific facts and must be reviewed by a qualified CPA/tax advisor.
```

### Required legal disclaimer

```text
Business-purpose treatment, licensing, prepayment penalties, STR legality, and entity-borrower treatment vary by state and transaction facts. Attorney review is required before relying on a state-specific legal conclusion.
```

---

## 24. Strict Build Gates

### Gate 1 — Before public launch

- Golden math tests pass
- Disclaimer approved
- Intake form complete
- State launch memo complete for initial states
- At least 3 lender approvals started
- Document checklist complete
- Fraud/business-purpose attestation complete

### Gate 2 — Before quoting lender names/rates publicly

- Broker approval confirmed
- Advertising compliance reviewed
- Rate source and timestamp shown
- No guaranteed language
- State licensing confirmed

### Gate 3 — Before PPE integration

- At least 20 real scenarios logged
- At least 3 funded files or strong lender feedback
- Lender matrix fields stabilized
- Manual process understood
- API requirements documented

### Gate 4 — Before correspondent/lender move

- Closed-loan tape exists
- Defect rate known
- Pull-through known
- Warehouse conversations started
- QC process exists
- Compliance budget exists
- Hedge/MSR path selected
- Licensing plan created by counsel

---

## 25. Final Canonical Strategy

### The company to build now

```text
A DSCR / investor-loan brokerage with a proprietary Deal-Truth Engine.
```

### The software to build now

```text
A dual-track DSCR and investor-survival scenario desk with legal/tax/insurance kill gates and lender-fit routing.
```

### The thing not to build now

```text
A full wholesale lender, proprietary PPE, securitization platform, ML credit model, or nationwide unverified legal matrix.
```

### The first 90-day outcome

```text
Get approved with lenders.
Run real investor scenarios.
Close clean loans.
Build the tape.
Use every real file to harden the system.
```

### The creative but strict wedge

```text
Be the broker who tells the truth before underwriting does.
```

---

# External Source Register

The final blueprint relies on these public verification categories:

| Code | Source category | What it supports |
|---|---|---|
| W1 | CFPB Regulation Z §1026.3 and commentary | Business-purpose treatment for non-owner-occupied rental property |
| W2 | CSBS / NMLS | NMLS as official licensing system; state licensing remains jurisdictional |
| W3 | CFPB HMDA resources | HMDA filing/LAR governance for covered institutions |
| W4 | MISMO and Fannie/Freddie ULAD resources | Mortgage data standards and MISMO 3.4 / ULAD mapping |
| W5 | Optimal Blue / NMP market reporting | Non-QM share of lock volume |
| W6 | NPLA private lending report | Q1 2026 DSCR/RTL activity |
| W7 | Griffin Funding DSCR material | Gross rent / PITIA DSCR method example |
| W8 | Defy Mortgage DSCR material | Current published DSCR pricing/LTV examples |
| W9 | Easy Street Capital / AirDNA | STR/DSCR program and projection workflow examples |
| W10 | IRS OBBB/bonus depreciation guidance | Permanent 100% bonus depreciation for qualified property acquired after Jan. 19, 2025 |
| W11 | IRS Publication 527 | Residential rental depreciation and 27.5-year recovery |
| W12 | CA BOE / LA Assessor, Texas Comptroller, Florida county/property appraiser resources | Property-tax reassessment / market value risk |
| W13 | Federal Reserve, New York Fed, Freddie Mac/AP | Fed funds, SOFR, mortgage-rate benchmark environment |
| W14 | GAO / housing insurance reporting | Property insurance availability and premium stress |
| W15 | NMP investor insurance survey | Investor missed-deal insurance impacts in FL/CA |
| W16 | Optimal Blue, Polly, Lender Price, LoanPASS official pages | PPE vendor capabilities and build-vs-buy support |
| W17 | KBRA / RiskSpan / Fitch-reported industry coverage | Non-QM and DSCR performance caution |

---

# Internal Source Register

| Code | Internal file | Accepted contribution |
|---|---|---|
| D1 | DSCR Professional Engine — Canonical Blueprint | Dual-track math, golden tests, stress/AEY architecture |
| D2 | DSCR Strategic Decision Memo | Broker-first strategy, after-tax wedge, 90-day path |
| D3 | Missing Pieces Gap Analysis | 12 operational gaps between engine and wholesale lender |
| D4 | PPE Build vs Buy Analysis | Buy PPE / build proprietary analytics recommendation |

---

# End of Blueprint
