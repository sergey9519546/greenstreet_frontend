# Advisor-Grade DSCR Decision Engine — Complete Usable Master Specification

**Version:** Consolidated v3.0  
**Status:** Clean master document built from the usable components of the two attached research drafts plus the existing usable master spec.  
**Scope:** Residential investor DSCR loans, SFR, condo/townhome rentals, and 2–4 unit small multifamily first; expandable to 5+ unit multifamily and commercial-style underwriting.  
**Product positioning:** Advisor-grade DSCR decision-support engine — not a lender approval system, not a loan commitment, not legal/tax/investment advice.

---

## 0. What Was Used From the Two Attached Research Drafts

### From Research Draft 1 — “Ultimate Advisor-Grade DSCR Decision Engine / Seven Pillars”
Useful components kept:

| Component | Verdict | Integrated As |
|---|---:|---|
| Seven-pillar decision-intelligence framing | Keep | High-level system architecture |
| Deterministic formula core | Keep | Formula Engine |
| Adversarial input auditor | Keep | Data Intake + Evidence Layer |
| Data Integrity Score / confidence logic | Keep, renamed | Input Confidence Score |
| Rent Market Alignment Index | Keep | Rent evidence audit |
| Expense and vacancy audits | Keep | Input risk flags |
| Stress-testing hierarchy | Keep | Stress + Fragility Engine |
| Composite stress / robust DSCR concept | Keep, modified | Worst-Case Stress DSCR |
| Breakpoint / deal repair solver | Keep | Breakpoint + Deal Repair Engine |
| Monte Carlo / probabilistic layer | Keep only as optional overlay | Scenario Overlay, non-binding |
| Explainability and audit trail | Keep | Audit + Compliance Layer |
| Validation framework | Keep | Test suite and QA requirements |
| “Guaranteed safe” wording | Reject | Replaced with “passes defined stress framework” |
| “Litigation-ready / regulator-friendly” wording | Reject | Replaced with “audit-ready / reviewable / compliance-aware” |
| Universal shock percentages | Modify | Labeled as calibration assumptions |

### From Research Draft 2 — “Dual-Ledger Advisor-Grade DSCR Decision Engine”
Useful components kept:

| Component | Verdict | Integrated As |
|---|---:|---|
| Dual-ledger architecture | Keep | Core engine architecture |
| Lender Qualification vs Investor Survival split | Keep | Central product principle |
| “Qualifies but Dangerous” detector | Keep | Flagship warning feature |
| Lender qualification matrix | Keep, modified | External versioned lender adapter |
| Investor survival logic | Keep, modified | Stabilized NOI and liquidity engine |
| Stress dashboard | Keep | Risk diagnosis dashboard |
| Breakpoint + repair engine | Keep | Required change calculator |
| Rule-based recommendations | Keep | Deterministic recommendation state machine |
| Implementation pseudocode | Keep, rewritten | Production blueprint |
| Example “pass that destroys capital” | Keep as concept | Example report pattern |
| Universal DSCR/LTV/FICO values | Modify | Placeholder matrix assumptions only |
| SCR formula with possible double counting | Modify | Replaced with clean stabilized NOI logic |
| “Qualified” wording | Modify | Use “likely fits selected matrix” |

---

# 1. Executive Summary

The correct target is not a better DSCR calculator.

The correct target is a **dual-ledger, deterministic, matrix-aware, stress-tested, breakpoint-solving DSCR Decision Engine** that separates:

1. **Lender Qualification** — whether the deal appears to fit a selected lender/product matrix.
2. **Investor Survival** — whether the property and borrower can survive real-world ownership stress.

The engine’s flagship job is detecting this hidden condition:

> **Qualifies but Dangerous:** the property appears financeable under a lender-style DSCR screen but fails economic survival after vacancy, management, taxes, insurance, repairs, CapEx, liquidity, or reset/refinance risk.

Basic DSCR calculators usually output one ratio. This engine outputs a decision package:

```text
Lender Qualification Result
Investor Survival Result
Qualifies-but-Dangerous Flag
Stress-Test Results
Fragility Diagnosis
Breakpoint / Repair Options
Input Confidence Score
Assumptions
Human-Review Triggers
Audit Log
Compliance Notice
```

The system is **calculation-first**. AI may explain results, but it does not invent formulas, thresholds, lender rules, market data, or recommendations.

---

# 2. External Source Anchors

This specification relies on these factual anchors:

1. **Fannie Mae Multifamily DSCR:** Underwritten DSCR is based on Underwritten Net Cash Flow relative to annual debt service.
2. **Fannie Mae Multifamily Underwritten NCF:** Replacement reserves are deducted in the underwritten cash-flow structure; Fannie’s guide includes minimum reserve concepts and property-specific reserve requirements.
3. **OCC Commercial Real Estate Lending Handbook:** DSCR is cash flow or NOI divided by debt service; debt yield is NOI divided by debt.
4. **Deephaven public DSCR matrix example:** Residential investor DSCR programs may define DSCR as gross rents divided by PITIA for fully amortizing loans or ITIA for interest-only loans.
5. **CFPB Circular 2022-03:** Creditors using complex algorithms must still provide accurate and specific principal reasons for adverse action.
6. **OCC 2026 Model Risk Management guidance:** Simple arithmetic calculations and deterministic rule-based processes are excluded from the model definition, but governance, validation, and controls still matter for serious financial systems.
7. **Fannie Mae Selling Guide reserves:** Minimum reserve requirements vary by transaction, occupancy status, amortization type, number of units, and number of financed properties.

**Implementation rule:** Any threshold not directly pulled from a live lender matrix or primary source must be labeled:

```text
[ASSUMPTION — must be calibrated]
```

---

# 3. Product Mandate

## 3.1 The engine must answer seven questions

1. Does the deal appear to fit a selected lender DSCR matrix?
2. Does the deal survive realistic investor ownership assumptions?
3. What specific variable breaks the deal?
4. What exact change repairs the deal?
5. Which inputs are verified, estimated, stale, missing, or user-provided?
6. What recommendation is mathematically justified?
7. What compliance boundaries must be shown?

## 3.2 Non-negotiable principles

```text
1. Deterministic math first.
2. AI explains; formulas decide.
3. Lender qualification is not investment quality.
4. Investor survival overrides lender pass in final advisory output.
5. Every formula must be explicit.
6. Every threshold must be sourced, calculated, matrix-loaded, or assumption-labeled.
7. No black-box approval or denial logic.
8. No universal lender minimums.
9. No “guaranteed safe” language.
10. No recommendation without input-confidence disclosure.
```

---

# 4. Final Architecture

```text
INPUTS
  ↓
DATA INTAKE + EVIDENCE LAYER
  - source labels
  - timestamps
  - input confidence
  - missing/stale/conflicting flags
  ↓
DETERMINISTIC FORMULA CORE
  - PMT, PITIA, ITIA, ADS
  - NOI / stabilized NOI
  - QDSCR / Economic DSCR / Stress DSCR
  - LTV, Debt Yield, Cap Rate, CoC
  ↓
DUAL LEDGERS
  ├── LEDGER 1: LENDER QUALIFICATION
  │     - selected lender matrix
  │     - DSCR / LTV / FICO / reserves / property-type rules
  │     - output: likely fit / conditional / fail / unknown
  │
  └── LEDGER 2: INVESTOR SURVIVAL
        - stabilized NOI
        - real operating costs
        - liquidity runway
        - stress DSCRs
        - reset/refi risk
        - output: survivable / borderline / fail
  ↓
QUALIFIES-BUT-DANGEROUS DETECTOR
  ↓
STRESS + FRAGILITY ENGINE
  - tax shock
  - insurance shock
  - vacancy shock
  - CapEx shock
  - IO / reset shock
  - combined stress
  ↓
BREAKPOINT + DEAL REPAIR ENGINE
  - required rent
  - required price reduction
  - required LTV reduction
  - required rate improvement
  - required reserves
  ↓
RULE-BASED RECOMMENDATION ENGINE
  ↓
AUDIT + COMPLIANCE LAYER
  - formulas
  - assumptions
  - sources
  - matrix versions
  - human-review triggers
```

---

# 5. Baseline Formula Library

## 5.1 Monthly amortizing payment

```text
PI_mo = P × [r(1+r)^n] / [(1+r)^n - 1]
```

Where:

| Variable | Definition |
|---|---|
| `P` | Loan principal |
| `r` | Monthly interest rate |
| `n` | Number of monthly payments |

If `r = 0`, use:

```text
PI_mo = P / n
```

## 5.2 Interest-only payment

```text
I_mo = P × annual_rate / 12
```

## 5.3 PITIA

```text
PITIA_mo = Principal + Interest + Taxes + Insurance + Association Dues
```

For interest-only products where a lender matrix uses ITIA:

```text
ITIA_mo = Interest + Taxes + Insurance + Association Dues
```

## 5.4 Annual Debt Service

```text
ADS = PI_mo × 12
```

## 5.5 Qualifying DSCR / lender-style DSCR

```text
QDSCR = Qualifying Monthly Rent / Qualifying Monthly Payment
```

Where qualifying monthly payment is defined by the selected lender/product matrix.

Common matrix definitions may include:

```text
Fully amortizing: Gross Rent / PITIA
Interest-only: Gross Rent / ITIA
```

**Critical rule:** The engine must not hard-code this universally. It must come from a selected lender matrix.

## 5.6 NOI

```text
NOI = Effective Gross Income - Operating Expenses
```

```text
Effective Gross Income = Gross Scheduled Income - Vacancy Loss - Collection Loss + Other Income
```

## 5.7 Stabilized NOI

```text
Stabilized NOI =
Gross Scheduled Rent
- Market Vacancy
- Collection Loss
- Property Taxes
- Insurance
- HOA
- Management Fee
- Repairs and Maintenance
- Replacement Reserve / CapEx Reserve
- Owner-paid Utilities
- Other recurring operating expenses
```

**Boundary rule:** Do not double-count. If management, reserves, or repairs are already inside operating expenses, they cannot be subtracted again.

## 5.8 Economic DSCR / Investor DSCR

```text
Economic DSCR = Stabilized NOI / Actual Annual Debt Service
```

This is the investor-survival ratio. It is different from lender-style QDSCR.

## 5.9 Reset-Safe DSCR

```text
Reset-Safe DSCR = Stabilized NOI / Reset Annual Debt Service
```

Use for:

```text
Interest-only loans
ARMs
Balloon loans
Loans with scheduled payment cliffs
```

## 5.10 Loan Constant

```text
Loan Constant = Annual Debt Service / Loan Amount
```

## 5.11 LTV

```text
LTV = Loan Amount / Value
```

Value should be determined by the selected matrix:

```text
Appraised value
Purchase price
Lower of purchase price or appraised value
Internal valuation
```

## 5.12 Debt Yield

```text
Debt Yield = Stabilized NOI / Loan Amount
```

Debt yield is useful because it is independent of rate and amortization structure.

## 5.13 Cap Rate

```text
Cap Rate = Stabilized NOI / Market Value
```

## 5.14 Cash-on-Cash Return

```text
Cash-on-Cash Return = Annual Net Cash Flow / Total Cash Invested
```

```text
Annual Net Cash Flow = Stabilized NOI - Annual Debt Service
```

## 5.15 Break-even rent

```text
Break-Even Rent =
(Annual Debt Service + Fixed Operating Expenses) / (1 - Vacancy Rate)
```

## 5.16 Break-even occupancy

```text
Break-Even Occupancy =
(Operating Expenses + Annual Debt Service) / Gross Potential Income
```

## 5.17 Points breakeven

```text
Points Cost = Loan Amount × Points Fraction
Monthly Payment Reduction = Payment at Base Rate - Payment at Bought-Down Rate
Points Breakeven Months = Points Cost / Monthly Payment Reduction
```

## 5.18 Prepayment penalty drag

```text
Prepayment Penalty Drag =
Penalty Cost / Annual Payment Savings at Refinance
```

---

# 6. Advanced Formula Library

## 6.1 Tax Shock DSCR

Purpose: detect post-sale tax reassessment risk.

```text
Projected Tax = Purchase Price × Effective Local Tax Rate
Tax Shock = max(0, Projected Tax - Current Annual Tax)
Tax Shock DSCR = (Stabilized NOI - Tax Shock) / Annual Debt Service
```

**Source hierarchy for tax rate:**

```text
County assessor / tax collector
Tax bill
Closing attorney / escrow estimate
Reliable tax database
User-provided estimate
Engine assumption
```

## 6.2 Insurance Shock DSCR

Purpose: detect premium volatility.

```text
Insurance Shock = Current Annual Insurance × Insurance Shock %
Insurance Shock DSCR = (Stabilized NOI - Insurance Shock) / Annual Debt Service
```

Default shock percentage must be labeled:

```text
[ASSUMPTION — region/property hazard calibrated]
```

## 6.3 Vacancy Shock DSCR

```text
Vacancy Shock DSCR =
(Gross Scheduled Rent × (1 - Shock Vacancy Rate) - Fixed Operating Expenses) / Annual Debt Service
```

## 6.4 Break-even vacancy

```text
Break-Even Vacancy =
1 - (Annual Debt Service + Fixed Operating Expenses) / Gross Scheduled Rent
```

Interpretation:

```text
Break-Even Vacancy < 0% = property cannot cover debt and fixed costs even at full occupancy
Low break-even vacancy cushion = fragile tenancy risk
High break-even vacancy cushion = stronger vacancy tolerance
```

## 6.5 CapEx Stress DSCR

```text
CapEx Stress DSCR =
(Stabilized NOI - Annualized Major Repair Event) / Annual Debt Service
```

```text
Annualized Major Repair Event = Repair Event Cost / Amortization Months × 12
```

Repair event cost should come from:

```text
Inspection report
Property condition assessment
Component-age schedule
Contractor bid
Class-based fallback assumption
```

## 6.6 Interest-Only Illusion Detector

```text
IO Payment = Loan Amount × Annual Rate / 12
Amortizing Payment = standard PMT formula
IO Payment Gap = Amortizing Payment - IO Payment
IO Illusion Ratio = DSCR_IO / DSCR_Amortizing
```

Flag when:

```text
DSCR_IO passes selected matrix
AND
Reset-Safe DSCR fails investor survival
```

**Do not assume all lenders qualify IO loans on amortizing payment.** The engine must compute both:

```text
Lender IO QDSCR, if matrix uses ITIA
Reset-Safe DSCR for investor survival
```

## 6.7 Liquidity Survival Clock

Purpose: measure months the investor can survive a zero-income property event.

```text
Liquidity Survival Clock =
Verified Liquid Reserves / Monthly Zero-Income Cash Drain
```

```text
Monthly Zero-Income Cash Drain =
PITIA + fixed owner-paid expenses + required recurring obligations
```

Only liquid assets count:

```text
Cash
Checking
Savings
Money market
Verified liquid business reserves
```

Exclude or separately flag:

```text
Retirement accounts
HELOC access not drawn
Equity in other properties
Unverified promises
Illiquid investments
```

## 6.8 Liquidity Reserve Adequacy

```text
Required Liquidity =
max(6 × PITIA, Major Repair Event + 3 × PITIA)
```

```text
Liquidity Reserve Adequacy =
(Liquid Reserves - Required Liquidity) / Required Liquidity
```

Thresholds are assumptions and must be calibrated to property type, borrower profile, and lender requirements.

## 6.9 Combined Stress DSCR

Purpose: deterministic “bad year” test.

```text
Combined Stress DSCR =
[Gross Rent × (1 - Rent Decline %) × (1 - Stressed Vacancy %)
 - Operating Expenses × (1 + Expense Shock %)
 - Tax Shock
 - Insurance Shock
 - Annualized CapEx Shock]
 / Stressed Annual Debt Service
```

Default stress values must be tagged:

```text
[ASSUMPTION — calibration default]
```

## 6.10 Robust Worst-Case DSCR

Purpose: find the minimum DSCR across defined scenarios.

```text
RWDSCR = min(
Base DSCR,
Tax Shock DSCR,
Insurance Shock DSCR,
Vacancy Shock DSCR,
CapEx Stress DSCR,
Reset-Safe DSCR,
Combined Stress DSCR
)
```

## 6.11 Fragility Score

Purpose: quantify how much the deal deteriorates under named shocks.

For each shock:

```text
Delta_k = Base Economic DSCR - Shock DSCR_k
```

Dominant risk driver:

```text
Dominant Driver = argmax(Delta_k)
```

Simple bounded fragility score:

```text
Weighted Shock Loss = Σ(weight_k × max(0, Delta_k))
Fragility Score = 100 × max(0, 1 - Weighted Shock Loss / max(Base Economic DSCR, 0.01))
```

Interpretation:

```text
80-100 = resilient
60-79 = acceptable but monitor
40-59 = fragile
0-39 = dangerous
```

**Important:** Fragility Score is diagnostic. It does not gate decisions by itself. The underlying shock DSCRs and liquidity tests gate decisions.

## 6.12 Assumption / Input Confidence Score

Purpose: prevent false precision from weak inputs.

Input labels:

| Label | Meaning | Trust Weight |
|---|---|---:|
| `VERIFIED` | Signed lease, appraisal, tax bill, insurance quote, lender matrix | 1.00 |
| `USER_PROVIDED` | User entered, no document | 0.70 |
| `ESTIMATED` | Engine/comps estimate | 0.50 |
| `STALE` | Source older than freshness threshold | 0.40 |
| `CONFLICTING` | Sources disagree materially | 0.30 |
| `MISSING` | Required input missing | 0.00 |

Formula:

```text
Input Confidence Score = Σ(input_weight_i × trust_weight_i) / Σ(input_weight_i)
```

Initial importance weights:

```text
Rent: 30%
Post-sale taxes: 20%
Insurance: 10%
CapEx reserve: 15%
Vacancy: 15%
Management/maintenance: 10%
```

All weights are assumptions until validated.

## 6.13 Rent Market Alignment Index

Purpose: flag inflated rent assumptions.

```text
RMAI = (User Rent - Market Median Rent) / (Market 90th Percentile Rent - Market 10th Percentile Rent)
```

Flags:

```text
RMAI > 1.0 = user rent above 90th percentile range; cap confidence and require verification
RMAI < -1.0 = user rent materially below market; check under-rent or data mismatch
```

## 6.14 Required Rent Improvement

```text
Required Gross Rent =
(DSCR Target × Annual Debt Service + Operating Expenses) / (1 - Vacancy Rate)
```

```text
Required Rent Increase =
Required Gross Rent - Current Gross Rent
```

## 6.15 Break-even purchase price

```text
Target ADS = Stabilized NOI / Target DSCR
Maximum Loan Amount = Target ADS / Loan Constant
Maximum Purchase Price = Maximum Loan Amount / Target LTV
Required Price Reduction = Current Purchase Price - Maximum Purchase Price
```

## 6.16 Required LTV Reduction

```text
Maximum Loan Amount = Stabilized NOI / (Target DSCR × Loan Constant)
Required Loan Reduction = Current Loan Amount - Maximum Loan Amount
New LTV = Maximum Loan Amount / Purchase Price
```

## 6.17 Break-even refinance rate

Purpose: identify rate headroom at refinance/reset.

```text
Target ADS = Stabilized NOI / Target DSCR
Target Monthly Payment = Target ADS / 12
Solve for rate in PMT formula where Payment(rate) = Target Monthly Payment
```

Use binary search or Newton-Raphson.

Output:

```text
Break-even refinance rate = X%
Rate headroom = X% - current rate
```

This is a deal-structure fact, not a forecast.

## 6.18 Refinance Gap

```text
Refi Capacity = Stabilized NOI_exit / (Future DSCR Target × Future Loan Constant)
Refi Gap = max(0, Projected Exit Balance - Refi Capacity)
```

This estimates a possible cash-in refinance requirement under a defined scenario.

## 6.19 Deal Repairability Score

Purpose: estimate whether the deal gap is practically fixable.

```text
Deal Repairability Score =
100 × [1 - Required Improvement Burden / Maximum Feasible Improvement]
```

But:

```text
This score is diagnostic only.
It must not override actual repair calculations.
```

## 6.20 Scenario-Adjusted Return

Use only as advisory context.

```text
Scenario Adjusted Return = Σ(probability_scenario × Cash-on-Cash_scenario)
```

Scenario probabilities must be user-provided or clearly labeled as assumptions. This cannot gate recommendations.

---

# 7. Scenario Library

## 7.1 Required deterministic scenarios

| Scenario | Rent | Vacancy | Taxes | Insurance | Expenses | Debt Service |
|---|---:|---:|---:|---:|---:|---:|
| Base | Verified/current | Market floor | Post-sale | Current quote | Normalized | Current |
| Conservative | -5% | +5 pp | Post-sale | +10–25% | +5–10% | Current |
| Severe | -10–20% | +10–15 pp | Post-sale | +25–50% | +10–20% | Reset/refi if applicable |
| Tax Shock | Current | Current | Reassessed | Current | Current | Current |
| Insurance Shock | Current | Current | Current | Shocked | Current | Current |
| Vacancy Shock | Current | Stress vacancy | Current | Current | Fixed expenses | Current |
| CapEx Shock | Current | Current | Current | Current | Major event | Current |
| Reset / Refi Shock | Current | Current | Current | Current | Current | Reset debt service |

All default values are calibration assumptions. Users may create custom scenarios, but the system should not allow them to soften required base/conservative tests below engine floors unless clearly labeled as a custom optimistic scenario.

## 7.2 Optional probabilistic overlay

Monte Carlo or Latin Hypercube simulation may be included only as an overlay:

```text
Allowed:
- Probability DSCR < 1.0
- Range of reserve depletion months
- Scenario distribution display

Not allowed:
- Approval/denial based on simulation alone
- Recommendation based on probability alone
- Hidden priors
- Unseeded, non-reproducible output
```

Requirements:

```text
Fixed random seed
Visible assumptions
Correlation controls
Timestamped parameters
"Simulation — not prediction" label
```

---

# 8. Dual-Ledger Logic

## 8.1 Ledger 1 — Lender Qualification

Purpose: determine whether the deal appears to fit a selected lender/product matrix.

Inputs:

```text
Selected lender matrix
Matrix version/date
Loan purpose
Property type
Loan amount
LTV
FICO
Rent documentation
QDSCR
Reserves
State/property overlays
Interest-only / amortization structure
Prepayment structure
```

Outputs:

```text
Likely fits selected matrix
Conditionally fits selected matrix
Does not fit selected matrix
Unknown — matrix missing/stale/incomplete
```

Do not output:

```text
Approved
Guaranteed qualified
Commitment to lend
```

## 8.2 Ledger 2 — Investor Survival

Purpose: determine whether the property survives real ownership.

Inputs:

```text
Stabilized NOI
Economic DSCR
Reset-Safe DSCR
Worst-case Stress DSCR
Liquidity Survival Clock
Break-even vacancy
CapEx stress
Tax/insurance shocks
Input Confidence Score
Borrower liquidity
Hold period
Refinance plan
```

Outputs:

```text
Survivable
Borderline
Not survivable
Unknown — missing critical data
```

## 8.3 Gated final decision hierarchy

Do not use a simple weighted average.

Use gates:

```text
Gate 0: Critical Input Gate
Gate 1: Input Confidence Gate
Gate 2: Lender Qualification Gate
Gate 3: Investor Survival Gate
Gate 4: Liquidity Gate
Gate 5: Fragility / Stress Gate
Gate 6: Suitability / Hold-period Gate
Gate 7: Recommendation Gate
```

Investor survival overrides lender qualification in final advisory language.

---

# 9. Qualifies-but-Dangerous Detector

## 9.1 Core rule

```text
IF Lender Qualification = Pass or Likely Fit
AND Investor Survival = Fail
THEN QbD = TRUE
```

## 9.2 Expanded rule

```text
QbD = TRUE if:
  Lender ledger passes selected matrix
  AND any of the following:
    Economic DSCR < 1.00
    Reset-Safe DSCR < 1.00
    Worst-Case Stress DSCR < 1.00
    Liquidity Survival Clock < minimum reserve runway
    Break-even vacancy is negative or extremely thin
    Fragility Score is dangerous
    Input Confidence Score is too low to trust the pass
```

## 9.3 Output language

```text
This deal appears financeable under the selected lender matrix, but the investor-survival ledger fails. The primary failure driver is [dominant driver]. This is a Qualifies-but-Dangerous deal. It should not be treated as a good investment solely because it may fit a lender DSCR screen.
```

---

# 10. Data Intake and Evidence Layer

## 10.1 Input categories

```text
Property inputs
Loan inputs
Rent inputs
Expense inputs
Tax inputs
Insurance inputs
Borrower liquidity
Lender matrix
Market data
Scenario assumptions
```

## 10.2 Required metadata for every input

```text
Value
Source
Date of source
Confidence label
Verification status
Used in formula?
Assumption flag?
Override allowed?
```

## 10.3 Rent source hierarchy

```text
Signed lease + proof of receipt
Appraisal rent schedule / 1007 / 1025
Lender-accepted rental AVM
Multiple recent local comps
Third-party rent estimate
Broker opinion
User estimate
STR projection
```

STR projection requires separate treatment and should not be treated the same as stabilized long-term rent unless backed by operating history and matrix rules.

## 10.4 Expense source hierarchy

```text
Tax bill / assessor data
Insurance quote / policy
HOA statement
Property management agreement
Inspection / property condition report
Historical owner statements
Market default assumptions
User estimate
```

## 10.5 Input-confidence restrictions

```text
If critical input missing → halt relevant calculations.
If Input Confidence Score < 0.60 → suppress strong recommendations and require human review.
If lender matrix missing/stale → output “qualification unknown.”
If rent is user-provided only → show both user view and conservative adjusted view.
```

---

# 11. Breakpoint and Deal Repair Engine

The engine should never merely say “fails.” It should calculate the repair.

## 11.1 Required repair outputs

```text
Required monthly rent increase
Required annual rent increase
Required price reduction
Required loan reduction
Required LTV reduction
Required rate improvement
Required additional reserves
Break-even refinance rate
Refinance gap at maturity
```

## 11.2 Repair feasibility labels

```text
Low-friction repair
Moderate repair
Difficult repair
Structurally broken under selected constraints
```

## 11.3 Language rule

Do not say:

```text
Guaranteed safe
Worst-case-proof
Definitely fixed
```

Say:

```text
Passes the selected stress framework
Passes the selected target threshold
Survives the defined scenario set
```

---

# 12. Rule-Based Recommendation Engine

Recommendations must be deterministic templates populated by formula outputs.

## 12.1 Recommendation classes

| Class | Conditions |
|---|---|
| Strong | Lender likely fits + investor survival passes + confidence high + stress acceptable |
| Good but sensitive | Lender fits + survival passes + one dominant fragility driver |
| Financeable but fragile | Lender fits + survival borderline |
| Qualifies but Dangerous | Lender fits + investor survival fails |
| Needs restructure | Lender fails or survival fails but repair options are feasible |
| Avoid unless terms improve | Multiple failures and repair burden is structural |
| Human review required | Missing/stale/conflicting inputs, low confidence, stale matrix, or compliance trigger |

## 12.2 Mandatory output fields

```text
Recommendation class
Lender ledger result
Investor ledger result
QbD flag
Key calculations
Dominant risk driver
Required improvement
Input confidence score
Missing data
Assumptions used
Human-review status
Compliance notice
```

## 12.3 Recommendation table

| Condition | Output |
|---|---|
| Lender fit + survival pass + high confidence | Strong |
| Lender fit + survival pass + fragility | Good but sensitive |
| Lender fit + survival borderline | Financeable but fragile |
| Lender fit + survival fail | Qualifies but Dangerous |
| Lender fail + survival pass | Strong asset, restructure debt |
| Lender fail + survival fail | Avoid or major restructure |
| Any path + low input confidence | Human review required |
| Any path + low liquidity | Liquidity danger override |
| Any path + stale matrix | Qualification unknown |

---

# 13. Audit Trail and Compliance Layer

## 13.1 Audit log must capture

```text
Engine version
Formula version
Run timestamp
User inputs
Input sources
Input confidence labels
Assumptions used
Lender matrix version/date
Scenario parameters
Formula outputs
Rule triggers
Recommendation template used
Human-review triggers
Compliance notices displayed
```

## 13.2 Prohibited language

```text
Approved
Guaranteed
Safe
Best loan for you
You should buy
This is financial advice
This is legal advice
This is tax advice
This is a loan commitment
```

## 13.3 Required disclaimer

```text
This output is decision-support analysis generated from user-provided inputs, verified documents, selected lender matrices, and labeled assumptions. It is not financial advice, legal advice, tax advice, a loan approval, a loan commitment, or a guarantee of investment performance. Consult a licensed mortgage professional, financial advisor, CPA, attorney, or underwriter before making financing or investment decisions.
```

## 13.4 Compliance-sensitive triggers

Human review required when:

```text
Input Confidence Score below threshold
Lender matrix missing/stale
Conflicting documents
Rent source unsupported
STR projection used without history
Recommendation could influence credit denial
Borrower-specific suitability question asked
User requests personalized financial advice
Any adverse-action-like output is generated in a lending workflow
```

---

# 14. Validation Framework

## 14.1 Formula tests

```text
PMT formula with known loan values
DSCR = numerator / denominator
Economic DSCR recomputes from stabilized NOI
Tax shock equals zero when current tax = projected tax
Insurance shock equals base when shock percent = 0
Break-even vacancy plugged back into DSCR = 1.0
Required rent added to current rent reaches target DSCR
LSC at zero reserves = 0
```

## 14.2 Edge-case tests

```text
Zero rent
Negative NOI
100% vacancy
Zero interest rate
Interest-only loan
ARM reset
Balloon maturity
Missing taxes
Missing insurance
No HOA
All-cash deal
Negative cash flow
Extreme LTV
Stale matrix
Conflicting rent sources
```

## 14.3 Stress-consistency tests

```text
Stress DSCR must not exceed base DSCR when shocks are adverse.
Combined stress DSCR must not exceed individual base DSCR.
Worst-case DSCR must equal min(scenario DSCRs).
Fragility score must be clamped 0-100.
```

## 14.4 Recommendation consistency tests

```text
QbD must fire if lender pass + survival fail.
Strong recommendation cannot fire if input confidence is low.
Strong recommendation cannot fire if liquidity fails.
Approval language must never appear.
Compliance disclaimer must always appear.
```

## 14.5 AI safety tests

```text
AI cannot modify formulas.
AI cannot invent lender thresholds.
AI cannot suppress assumptions.
AI cannot override rule-based recommendation state.
AI cannot produce unsupported approval, denial, or investment advice.
```

---

# 15. Implementation Pseudocode

```python
class DSCRDecisionEngine:
    def __init__(self, inputs, lender_matrix, engine_policy):
        self.inputs = inputs
        self.lender_matrix = lender_matrix
        self.policy = engine_policy
        self.audit = []

    def run(self):
        clean_inputs = self.data_intake_and_validation(self.inputs)
        confidence = self.compute_input_confidence(clean_inputs)

        formula_outputs = self.run_formula_core(clean_inputs)
        lender_result = self.run_lender_ledger(clean_inputs, formula_outputs)
        survival_result = self.run_survival_ledger(clean_inputs, formula_outputs)

        stress_results = self.run_stress_engine(clean_inputs, formula_outputs)
        qbd = self.run_qbd_detector(lender_result, survival_result, stress_results, confidence)

        repairs = self.run_repair_engine(clean_inputs, formula_outputs, survival_result, stress_results)
        recommendation = self.run_recommendation_engine(
            lender_result=lender_result,
            survival_result=survival_result,
            stress_results=stress_results,
            qbd=qbd,
            repairs=repairs,
            confidence=confidence
        )

        return self.build_decision_package(
            lender_result,
            survival_result,
            stress_results,
            qbd,
            repairs,
            confidence,
            recommendation
        )

    def data_intake_and_validation(self, inputs):
        # Validate required inputs, attach source labels, timestamps, and confidence labels.
        # Halt or partial-halt if critical inputs are missing.
        return inputs

    def compute_input_confidence(self, inputs):
        # Weighted trust score using verified/user/estimated/stale/conflicting/missing labels.
        return {"score": 0.0, "grade": "LOW", "human_review": True}

    def run_formula_core(self, inputs):
        # PMT, PITIA, ITIA, ADS, NOI, stabilized NOI, QDSCR, Economic DSCR, etc.
        return {}

    def run_lender_ledger(self, inputs, outputs):
        if self.lender_matrix is None or self.lender_matrix.is_stale:
            return {"status": "UNKNOWN", "reason": "Matrix missing or stale"}
        # Apply selected matrix rules exactly.
        return {"status": "LIKELY_FIT"}

    def run_survival_ledger(self, inputs, outputs):
        # Economic DSCR, Reset-Safe DSCR, RWDSCR, LSC, break-even vacancy.
        return {"status": "NOT_SURVIVABLE"}

    def run_stress_engine(self, inputs, outputs):
        # Tax, insurance, vacancy, CapEx, reset/refi, combined stress.
        return {}

    def run_qbd_detector(self, lender_result, survival_result, stress_results, confidence):
        return lender_result["status"] == "LIKELY_FIT" and survival_result["status"] == "NOT_SURVIVABLE"

    def run_repair_engine(self, inputs, outputs, survival_result, stress_results):
        # Required rent, price, LTV, rate, reserves.
        return {}

    def run_recommendation_engine(self, lender_result, survival_result, stress_results, qbd, repairs, confidence):
        # Deterministic state machine, not AI-generated advice.
        return {}

    def build_decision_package(self, lender, survival, stress, qbd, repairs, confidence, recommendation):
        return {
            "engine_version": "AEGIS-DSCR-v3.0",
            "lender_qualification": lender,
            "investor_survival": survival,
            "qualifies_but_dangerous": qbd,
            "stress_results": stress,
            "repair_options": repairs,
            "input_confidence": confidence,
            "recommendation": recommendation,
            "audit_log": self.audit,
            "compliance_notice": "Decision-support only; not financial advice or loan approval."
        }
```

---

# 16. Decision Package Output Schema

```json
{
  "engine_version": "AEGIS-DSCR-v3.0",
  "run_timestamp": "ISO-8601",
  "input_confidence": {
    "score": 0.78,
    "grade": "MODERATE",
    "missing_inputs": [],
    "stale_inputs": [],
    "conflicting_inputs": [],
    "human_review_required": false
  },
  "lender_qualification": {
    "status": "LIKELY_FIT",
    "selected_matrix": "Matrix Name + Version",
    "qdscr": 1.21,
    "ltv": 0.75,
    "fico_band": "720-739",
    "fail_reasons": []
  },
  "investor_survival": {
    "status": "BORDERLINE",
    "economic_dscr": 1.03,
    "reset_safe_dscr": 0.94,
    "liquidity_survival_months": 5.4,
    "break_even_vacancy": 0.11
  },
  "stress_results": {
    "tax_shock_dscr": 0.98,
    "insurance_shock_dscr": 1.01,
    "vacancy_shock_dscr": 0.91,
    "capex_stress_dscr": 0.88,
    "combined_stress_dscr": 0.79,
    "dominant_driver": "vacancy"
  },
  "qualifies_but_dangerous": true,
  "repair_options": {
    "required_rent_increase_monthly": 275,
    "required_price_reduction": 32000,
    "required_ltv_reduction": "from 75% to 69%",
    "additional_reserves_required": 8500
  },
  "recommendation": {
    "class": "QUALIFIES_BUT_DANGEROUS",
    "text": "This appears to fit the selected lender matrix but fails investor survival under defined stress assumptions."
  },
  "assumptions": [],
  "audit_log_uri": "internal_or_exported_log",
  "compliance_notice": "..."
}
```

---

# 17. Example Output Pattern

```text
EXECUTIVE VERDICT:
Qualifies but Dangerous.

LENDER LEDGER:
Likely fits selected lender matrix.
QDSCR: 1.21x
LTV: 74.8%
Matrix version: [source/date]

INVESTOR SURVIVAL LEDGER:
Fails under investor survival.
Economic DSCR: 0.96x
Reset-Safe DSCR: 0.88x
Liquidity Survival Clock: 4.2 months
Break-even vacancy: 6%

DOMINANT RISK:
Vacancy and tax reassessment.

STRESS TEST:
Tax Shock DSCR: 0.93x
Insurance Shock DSCR: 0.95x
CapEx Stress DSCR: 0.89x
Combined Stress DSCR: 0.76x

REPAIR OPTIONS:
1. Increase verified rent by $310/month.
2. Reduce purchase price by $38,500.
3. Reduce LTV from 75% to 68%.
4. Add $11,200 verified liquid reserves.

INPUT CONFIDENCE:
Moderate confidence.
Rent verified by lease, taxes estimated, insurance quote current, CapEx assumed.

RECOMMENDATION:
This deal should not be treated as strong simply because it may fit the selected lender matrix. It requires restructure or additional verification before proceeding.

COMPLIANCE:
Decision-support analysis only. Not financial advice, loan approval, or investment advice.
```

---

# 18. Implementation Roadmap

## Phase 1 — Deterministic MVP

Build:

```text
Data intake
Formula core
QDSCR
Economic DSCR
Tax shock
Insurance shock
Vacancy shock
Liquidity clock
QbD detector
Rule-based recommendation templates
Audit log
```

## Phase 2 — Lender Matrix System

Build:

```text
Versioned lender matrix schema
Matrix uploader/admin panel
Matrix freshness checks
Pricing tier display
Condition / fail reason logic
```

## Phase 3 — Investor Survival Expansion

Build:

```text
CapEx model
Component-age model
Reset/refi risk
Debt yield
Break-even refinance rate
Deal repair solver
```

## Phase 4 — Data Integrations

Build:

```text
Property tax data
Rent comps
Insurance quote fields
FEMA/fire/flood/hazard flags
Inspection upload parsing
Document evidence tagging
```

## Phase 5 — Scenario and Portfolio Layer

Build:

```text
Multi-scenario dashboard
Optional Monte Carlo overlay
Portfolio-level liquidity survival
Multiple property exposure
Borrower suitability profile
```

---

# 19. Known Limitations

1. **No actual lender approval:** The engine can only determine likely matrix fit unless connected to a lender/underwriter workflow.
2. **Lender matrices change:** Any matrix must be versioned and stale-flagged.
3. **Reserve assumptions require calibration:** CapEx, repairs, management, and vacancy floors vary by region, property age, and asset class.
4. **Tax shock requires local rules:** Property tax reassessment logic varies by jurisdiction.
5. **Insurance shocks vary by hazard zone:** Flat percentage defaults are not sufficient for production.
6. **STR income is volatile:** STR projections require separate stabilization and lender-matrix treatment.
7. **Scores are diagnostic:** Fragility, confidence, and repairability scores should not override deterministic gates.
8. **Monte Carlo is optional:** Simulations are explanatory, not decisive.
9. **Compliance requires legal review:** Final product language should be reviewed by counsel before commercial deployment.

---

# 20. Final Master Principle

The engine must never let a lender pass become an investment recommendation.

```text
A deal can be financeable and still dangerous.
A deal can fail one lender but still be economically strong.
A deal can look strong only because the data is weak.
A deal is not advisor-grade until every number is traceable, every assumption is labeled, and every recommendation is tied to deterministic math.
```

**Final category:** Advisor-grade DSCR decision support.  
**Final architecture:** Dual-ledger, deterministic, matrix-aware, stress-tested, breakpoint-solving, audit-ready.  
**Final flagship feature:** Qualifies-but-Dangerous detection.
