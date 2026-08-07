# AEGIS-DSCR Algorithm Gap Upgrade Pack
## Structural Blind Spots, Usable Patches, and Integration Instructions

**Document type:** Upload-ready improvement pack  
**Target system:** AEGIS / Advisor-Grade DSCR Decision Engine  
**Purpose:** Identify which algorithmic-gap research should be integrated into the current master specification, where each item belongs, and how to implement it without corrupting the deterministic, auditable core.

---

## 0. Executive Verdict

The new research is highly usable, but it should **not replace** the Deterministic Core Math Library.

It should be integrated as a new architecture layer:

```text
AEGIS-DSCR Algorithmic Failure-Mode & Structural Blind-Spot Layer
```

The current deterministic core is strong for point-in-time DSCR analysis, dual-ledger separation, stress DSCR, liquidity runway, assumption confidence, and breakpoint repair. The new research exposes where that deterministic system can still fail because real deals are not static, continuous, independent, or single-period.

The main upgrade is this:

```text
Current AEGIS Core:
Can calculate the deal correctly today.

New Algorithm Gap Layer:
Tests whether the algorithm itself is missing the way the deal fails over time, across lender matrix cliffs, through refinance valuation shocks, through monthly liquidity sequence risk, through seasonality, and through compliance constraints.
```

The most important additions to keep are:

1. Cap-rate linked refinance solver  
2. Matrix grid solver for lender-tier cliffs  
3. Sequential drawdown array for liquidity ruin  
4. Seasonality trough detector for STR/student/seasonal income  
5. Correlated macro archetype scenarios  
6. ECOA/fair-lending proxy-risk lockout  
7. Post-depreciation tax-shield display with tax-advice boundary  
8. Multi-year pro forma trajectory  
9. IO reset cliff modeling  
10. ARM reset modeling  
11. Expense inflation by component  
12. Market rent validation  
13. Adverse-action reason-code infrastructure  
14. Backtest, drift, and outcome tracking framework  

---

## 1. Placement in the Master Specification

Add this after the Deterministic Core Math Library and before the Recommendation Engine.

```text
1. Product Thesis
2. Operating Model
3. Dual-Ledger Architecture
4. Deterministic Core Math Library
5. Algorithmic Failure-Mode & Structural Blind-Spot Layer   ← ADD HERE
6. Scenario + Stress-Test Engine
7. Breakpoint + Deal Repair Engine
8. Recommendation + Human Review Engine
9. Audit + Compliance Layer
10. Validation + Monitoring Framework
```

Reason: the new research does not change the basic formulas. It changes how the engine protects itself from deterministic blind spots.

---

## 2. What This Research Improves

The research improves the engine in five categories:

| Category | Existing Core Weakness | New Patch |
|---|---|---|
| Time | Point-in-time DSCR can miss future failure | Multi-year DSCR trajectory, IO reset, ARM reset |
| Refinance | Refi solver assumes value is stable | Cap-rate linked value + LTV refi check |
| Optimization | Breakpoint algebra assumes continuous functions | Matrix grid solver / state-space search |
| Liquidity | LSC is a scalar average | Sequential month-by-month drawdown |
| Seasonality | Annual DSCR hides intra-year troughs | Seasonality trough detector |
| Correlation | Shocks are stacked without structure | Named macro archetypes |
| Compliance | Risk overlays may become proxy discrimination | ECOA lockout and reason-code system |
| Tax economics | CoC is pre-tax and can mislead | Depreciation shield display with disclaimer |
| Validation | Assumptions remain static | Backtest, drift, outcome tracking |

---

# PART I — SEVEN CRITICAL STRUCTURAL PATCHES

---

## 3. Gap 1 — Refinance LTV-Cap Rate Spiral

### Status

**Keep. Add as a high-priority v1.1 refinance-risk patch.**

### Existing flaw

The existing Refinance Risk Meter solves for the break-even refinance rate:

```text
Find r* where DSCR_E(r*) = Target DSCR
```

That is useful, but incomplete. It assumes the property value remains stable while interest rates change. In real estate finance, refinance failure can occur even when DSCR survives, because higher rates often pressure cap rates upward. Higher cap rates reduce value. Lower value increases LTV. Higher LTV can cause refinance denial or require cash-in refinance.

### Failure example

```text
Year 0:
NOI = $80,000
Cap rate = 6.00%
Value = $1,333,333
Loan balance = $900,000
LTV = 67.5%

Year 5 shock:
NOI = $82,000
Rate shock = +200 bps
Cap rate expands to 7.50%
Value = $1,093,333
Loan balance = $875,000
LTV = 80.0%
```

The deal may still have DSCR above 1.00x but fail lender refinance LTV constraints.

### Patch: Cap-Rate Linked Refi Solver

Add this as:

```text
CORE-RRM-LTV-001
Cap-Rate Linked Refinance Solver
```

### Formula

```text
Projected Value at Refi =
Projected Stabilized NOI / Projected Exit Cap Rate

Projected Exit Cap Rate =
Current Cap Rate + (ΔRate × CapRateBeta)

Projected Refi LTV =
Projected Loan Balance / Projected Value at Refi
```

### Variables

| Variable | Meaning | Source / Status |
|---|---|---|
| Projected Stabilized NOI | Year-N NOI under projected/stressed case | Engine calculation |
| Current Cap Rate | Current market cap rate or implied acquisition cap | User/market data |
| ΔRate | Rate shock or market-rate change | Scenario input |
| CapRateBeta | Cap-rate expansion per 1% rate increase | `[ASSUMPTION — calibrate by market/property type]` |
| Projected Loan Balance | Amortization schedule balance at refi date | Engine calculation |
| Max Refi LTV | Selected lender/product matrix | Matrix input |

### Dual gate

The Refinance Risk Meter must check both:

```text
1. DSCR refi gate:
Projected DSCR at Refi >= Target DSCR

2. LTV refi gate:
Projected Refi LTV <= Max Refi LTV
```

### Output

```text
Refinance Result:
DSCR Gate: Pass / Fail
LTV Gate: Pass / Fail
Projected Exit Value: $X
Projected Refi LTV: Y%
Cash-In Required: $Z
Primary Refi Failure Driver: DSCR / LTV / Both
```

### Human review trigger

Trigger human review if:

```text
Projected Refi LTV is within 2.5% of max allowed LTV
OR
Projected DSCR is within 0.05x of selected lender threshold
OR
CapRateBeta is estimated instead of source-calibrated
```

### Integration location

```text
Module: Investor Survival Engine
Submodule: Refinance Risk Meter
Add: Cap-Rate Linked Refi Solver
```

---

## 4. Gap 2 — Matrix Cliff / Step-Function Optimization Failure

### Status

**Keep. Critical upgrade to the Breakpoint Solver.**

### Existing flaw

The current breakpoint solver uses algebraic inversions:

```text
Required rent
Required price
Required loan reduction
Required LTV reduction
Required rate
```

This assumes continuous functions. But lender matrices are not continuous. They are discrete step functions.

Example:

```text
LTV <= 75%: Rate = 7.50%, Min DSCR = 1.00
LTV 75.01%–80%: Rate = 8.00%, Min DSCR = 1.20
DSCR < 1.00: Not eligible
DSCR 1.00–1.19: Price add-on
DSCR >= 1.20: Better price
```

A small LTV move can improve pricing or eligibility dramatically. Linear solvers miss this.

### Patch: Matrix Grid Solver

Add this as:

```text
CORE-MATRIX-GRID-001
Discrete Matrix Grid Solver
```

### Core logic

The engine must evaluate all relevant lender-matrix nodes instead of solving only a smooth equation.

```pseudo
FOR each lender_matrix_node:
    FOR each feasible LTV tier:
        FOR each FICO band:
            FOR each DSCR band:
                FOR each product option:
                    compute rate, payment, DSCR_L, DSCR_E, cash to close
                    compute eligibility
                    compute survival
                    compute total cost
                    compute improvement needed to reach node
RANK feasible nodes by:
    - eligibility pass
    - investor survival pass
    - lowest cash-to-close increase
    - lowest monthly payment
    - lowest total cost
    - lowest fragility
    - lowest side-effect penalty
```

### Required output

```text
Best Matrix Move:
Bring LTV from 76.2% to 74.9%.
Additional down payment required: $4,850.
Effect:
- Moves file into lower LTV tier.
- Reduces rate by 0.375%.
- Improves DSCR_L from 1.18x to 1.24x.
- Reduces monthly payment by $212.
- Improves Economic DSCR from 0.96x to 1.03x.
```

### Why this is superior

The old solver says:

```text
Reduce loan by $X to hit target DSCR.
```

The grid solver says:

```text
Reduce loan by exactly $X to cross the specific lender tier that changes pricing and eligibility.
```

That is advisor-grade.

### Integration location

```text
Module: Breakpoint + Deal Repair Engine
Replace: pure algebraic LTV/price optimization
Add: Matrix Grid Solver before recommendation ranking
```

### Keep both solvers

Do not delete algebraic breakpoints. Use them as first-pass diagnostics.

```text
Algebraic Solver = tells what would repair the math
Matrix Grid Solver = tells what actually changes lender eligibility/pricing
```

---

## 5. Gap 3 — Path Dependency / Sequence-of-Returns Ruin

### Status

**Keep. Critical liquidity upgrade.**

### Existing flaw

The current Liquidity Survival Clock is scalar:

```text
LSC = Liquid Reserves / Monthly Cash Drain
```

This assumes losses occur smoothly. Real estate failure is path-dependent. Ruin happens when cash shocks occur in a bad sequence.

Example:

```text
Reserves = $18,000
Monthly zero-occupancy drain = $2,250
Scalar LSC = 8 months
```

This looks acceptable. But if an HVAC fails in Month 2 during vacancy:

```text
Month 1: -$2,250
Month 2: -$2,250 - $15,000 HVAC
Month 3: -$2,250
Remaining reserves after Month 3: negative
```

The true survival time is three months, not eight.

### Patch: Sequential Drawdown Array

Add this as:

```text
CORE-LSC-ARRAY-001
Sequential Drawdown Liquidity Simulator
```

### Algorithm

```pseudo
starting_cash = verified_liquid_reserves

FOR month in 1..12 or 1..24:
    income = scheduled_income[month]
    debt = monthly_debt_service[month]
    taxes = monthly_tax_or_escrow[month]
    insurance = monthly_insurance_or_escrow[month]
    fixed_opex = fixed_operating_expenses[month]
    variable_opex = variable_operating_expenses[month]
    capex_event = capex_schedule[month]
    net_cash = income - debt - taxes - insurance - fixed_opex - variable_opex - capex_event
    ending_cash = prior_cash + net_cash

    IF ending_cash < 0:
        liquidity_failure_month = month
        STOP
```

### Required outputs

```text
Liquidity Path:
Month 1 ending cash: $15,750
Month 2 ending cash: -$1,500
Failure month: 2

Failure Cause:
Vacancy + HVAC event occurred before reserve recovery.

Scalar LSC:
8.0 months

Sequential LSC:
2.0 months

Conclusion:
Scalar LSC overstated liquidity survival because it ignored event timing.
```

### Required scenarios

Run at least these sequences:

```text
1. Vacancy-first
2. CapEx-first
3. Vacancy + CapEx same month
4. Insurance premium jump before tenant placement
5. IO reset before rent stabilization
6. Tax reassessment before rent increase
```

### Integration location

```text
Module: Investor Survival Engine
Submodule: Liquidity Survival Clock
Add: Sequential Drawdown Array
```

---

## 6. Gap 4 — Intra-Year Seasonality Trough

### Status

**Keep. Required for STR, student housing, vacation rentals, and seasonal markets.**

### Existing flaw

Annual DSCR hides seasonal cash-flow troughs.

Example:

```text
Annual income = $120,000
Annual debt + expense = $82,000
Annual DSCR = 1.46x
```

But if 80% of income occurs in four months, the property may go deeply cash-negative during the off-season. Annual DSCR can pass while monthly liquidity fails.

### Patch: Seasonality Trough Detector

Add this as:

```text
CORE-SEASONALITY-001
Seasonality Trough Detector
```

### Required trigger

Run this module automatically if:

```text
property_type = STR
OR income_type = seasonal
OR student_housing = true
OR monthly rent/income data is materially uneven
OR revenue concentration > 40% in any 3-month period
```

### Algorithm

```pseudo
Input:
monthly_income_curve[12]
monthly_expense_curve[12]
starting_liquid_reserves

FOR each month:
    monthly_cash_flow = monthly_income - monthly_debt_service - monthly_expenses
    cumulative_cash_flow += monthly_cash_flow
    track maximum cumulative deficit

Maximum Cumulative Deficit =
largest negative cumulative cash-flow trough before income recovery
```

### Survival rule

```text
If Maximum Cumulative Deficit > Liquid Reserves:
    Investor Survival = Fail
    Reason = Seasonality Trough Failure
```

### Output

```text
Annual DSCR:
1.46x

Worst Monthly DSCR:
0.42x in February

Maximum Cumulative Deficit:
$18,600 before seasonal recovery

Liquid Reserves:
$12,000

Result:
Annual DSCR passes, but seasonal liquidity fails.
Investor must add at least $6,600 reserves plus safety buffer.
```

### Integration location

```text
Module: Investor Survival Engine
Submodule: Seasonal Income Handling
Add: Seasonality Trough Detector
```

### Important compliance rule

Do not treat STR projected income as equivalent to long-term lease income unless supported by:

```text
12-month operating history
platform revenue records
bank deposits
local STR legality confirmation
seasonality curve
expense ratio specific to STR
```

---

## 7. Gap 5 — Correlation Blindness in Stress Testing

### Status

**Keep, but implement deterministically. Do not use black-box Monte Carlo as a gate.**

### Existing flaw

The current combined stress formula stacks shocks mechanically:

```text
Rent -5%
Vacancy +5 pts
Insurance +25%
Tax shock
Rate shock
```

That is useful, but still too generic. Real risks are correlated by macro regime.

### Patch: Named Macro Archetypes

Add this as:

```text
CORE-MACRO-ARCHETYPE-001
Deterministic Correlated Scenario Engine
```

### Required archetypes

#### Archetype A — Stagflation

```text
Rent: flat or +0%
Vacancy: +5 pts
OpEx: +10%
Insurance: +20%
Rates: +200 bps
Cap rates: +100 bps
Value: down through cap-rate expansion
```

#### Archetype B — Recession

```text
Rent: -10% to -15%
Vacancy: +10 pts
OpEx: +3% to +5%
Rates: -100 bps or flat
Cap rates: +100 to +150 bps
Value: -10% to -20%
```

#### Archetype C — Climate / Regional Insurance Shock

```text
Insurance: +50%
Taxes: +10% to +20%
Repairs: major event
Value: -10%
Rent: flat to -5%
Liquidity: stressed by insurance + repairs
```

#### Archetype D — Local Market Distress

```text
Rent: -15%
Vacancy: +15 pts
Value: -20%
Exit cap rate: +150 bps
Liquidity: prolonged lease-up stress
```

#### Archetype E — Refinance Wall

```text
Rates: +200 bps
Cap rates: +100 bps
LTV: worsens through value decline
DSCR: tested at reset/refi payment
Cash-in refinance gap computed
```

### Required outputs

```text
Scenario:
Stagflation

Economic DSCR:
0.88x

Projected Refi LTV:
82.4%

Liquidity Failure Month:
7

Dominant Failure:
Refi LTV + insurance inflation

Repair:
Requires $38,000 lower loan balance or $52,000 price reduction.
```

### Integration location

```text
Module: Scenario + Stress-Test Engine
Add: Macro Archetype Stress Library
```

---

## 8. Gap 6 — Fair Lending Proxy Discrimination / ECOA Risk

### Status

**Keep. Critical compliance architecture patch.**

### Existing flaw

A “conservative” model can become discriminatory if it uses geography, ZIP code, neighborhood, property age, or demographic proxies without careful governance. Risk overlays tied to ZIP code can become a redlining mechanism if not justified by legitimate, verifiable, non-protected, business-necessary data.

### Patch: ECOA Lockout

Add this as:

```text
CORE-ECOA-LOCKOUT-001
Fair Lending Proxy Risk Guardrail
```

### Structural rule

The engine must block or escalate any variable or adjustment that uses:

```text
ZIP code
Census tract
neighborhood label
race/ethnicity proxies
national origin proxies
religion proxies
sex/marital/family-status proxies
age of borrower
public assistance status
immigration or citizenship proxy unless legally reviewed
school ratings
crime score
neighborhood “quality”
informal area risk labels
```

### Allowed location-based data

Location-based adjustments may be used only when:

```text
1. The data source is objective and business-necessary.
2. The variable directly affects property economics.
3. The data is not a disguised demographic proxy.
4. The adjustment is explainable and documented.
5. The source is approved in compliance policy.
6. The output is monitored for disparate impact if used in credit decisioning.
```

Examples of potentially allowed data:

```text
County property-tax rate
State insurance regulatory environment
FEMA flood zone
Official wildfire risk zone
MSA-level vacancy rate
MSA-level rent trend
State or local STR legality
Official tax assessment rules
```

### Blocked examples

```text
ZIP-risk premium with no source
Neighborhood quality score
Crime-risk score without legal review
School-rating rent haircut
Area desirability penalty
Unexplained “urban risk” factor
```

### Required validation

```pseudo
FOR each variable in model_inputs:
    IF variable is geospatial:
        check source
        check business necessity
        check protected-class proxy risk
        check compliance approval
        IF any check fails:
            block variable
            trigger human_review
```

### Integration location

```text
Module: Audit + Compliance Layer
Submodule: Fair Lending / ECOA Guardrail
Add: ECOA Lockout
```

### Important note

If the system is used only as investor decision support, this still matters because the product may later be used by brokers, lenders, or originators. Build the guardrail now.

---

## 9. Gap 7 — Entity / Tax-Bracket Illusion

### Status

**Keep as a display layer only. Do not turn it into tax advice.**

### Existing flaw

Cash-on-cash return is usually pre-tax. But investors evaluate after-tax economics, and real estate tax treatment can materially change realized cash flow.

A property may:

```text
Lose money on paper because of depreciation
Generate positive cash flow but taxable income
Generate negative cash flow and passive losses
Benefit from cost segregation
Trigger depreciation recapture on sale
```

The current engine shows CoC as if taxes do not exist.

### Patch: Depreciation Shield Display

Add this as:

```text
CORE-TAX-SHIELD-DISPLAY-001
Depreciation Shield Display
```

### Permitted output

The engine may show an estimate, not advice:

```text
Estimated annual straight-line residential depreciation =
Depreciable Building Basis / 27.5 years
```

### Required distinction

```text
Land is not depreciable.
Building/improvements may be depreciable.
Residential rental property is generally depreciated over 27.5 years under MACRS/GDS.
Commercial property is generally different and must be handled separately.
```

### Formula

```text
Depreciable Building Basis =
Purchase Price × Building Allocation %

Estimated Annual Depreciation =
Depreciable Building Basis / 27.5
```

### Example

```text
Purchase Price: $500,000
Estimated building allocation: 80% [ASSUMPTION]
Depreciable basis: $400,000
Estimated annual depreciation: $14,545

Pre-tax cash flow: $8,000
Estimated depreciation: $14,545
Possible paper result before other tax items: -$6,545
```

### Required disclaimer

```text
This is not tax advice. Actual depreciation depends on land allocation, placed-in-service date, closing statement, improvements, cost segregation, passive activity rules, entity structure, taxpayer status, and CPA review.
```

### Integration location

```text
Module: Investor Return Analysis
Submodule: Tax-Aware Display
Add: Depreciation Shield Display
```

---

# PART II — ADDITIONAL HIGH-VALUE GAPS FROM THE EXTENDED GAP ANALYSIS

The attached extended analysis identifies 47 gaps. Not all should be integrated immediately. The following are the ones to keep.

---

## 10. Multi-Year DSCR Trajectory

### Status

**Keep. Critical.**

### Problem

The current engine can be right for Year 1 and still wrong for the deal. Real estate investments are multi-year cash-flow streams.

### Add module

```text
CORE-DSCR-TRAJECTORY-001
Multi-Year DSCR Trajectory Engine
```

### Required projections

```text
Year-by-year rent
Year-by-year vacancy
Year-by-year taxes
Year-by-year insurance
Year-by-year OpEx
Year-by-year debt service
IO reset year
ARM reset year
Balloon/refi year
Reserve balance
Cumulative cash flow
Exit value
Exit LTV
```

### Required output

```text
Year 1 DSCR_E: 1.12x
Year 2 DSCR_E: 1.05x
Year 3 DSCR_E: 0.98x
Year 4 DSCR_E: 0.91x
Year 5 Refi DSCR: 0.84x
Year 5 Refi LTV: 81.2%

Trajectory Verdict:
Fails in Year 3 despite Year 1 passing.
```

### Integration

```text
Module: Investor Survival Engine
Add after base-year DSCR and before recommendation.
```

---

## 11. IO Reset Cliff Modeling

### Status

**Keep. Critical.**

### Problem

The current IO detector compares IO to amortizing, but the true cliff occurs when IO ends and the remaining balance amortizes over the remaining loan term.

### Add formula

```text
Reset Payment =
Amortizing payment on remaining balance over remaining amortization period
```

### Required output

```text
IO Payment: $2,500/mo
Reset Payment: $2,797/mo
Payment Increase: 11.9%
Reset-Year Economic DSCR: 0.91x
Reset Severity: Critical Reset Failure
```

### Integration

```text
Module: IO Illusion Detector
Upgrade to IO Reset Cliff Engine
```

---

## 12. ARM Reset Modeling

### Status

**Keep for v1.1 if ARM products are in scope.**

### Problem

A static rate cannot evaluate adjustable-rate DSCR loans.

### Required scenarios

```text
Expected reset = current index + margin
Worst legal reset = periodic/lifetime cap
Floor reset = contract floor
```

### Required output

```text
Initial rate: 6.50%
Expected reset rate: 8.25%
Worst-case reset rate: 10.50%
Expected reset DSCR_E: 0.97x
Worst-case reset DSCR_E: 0.74x
```

### Integration

```text
Loan Terms Module
Rate Reset Module
Refinance Risk Meter
```

---

## 13. Expense Inflation Modeling

### Status

**Keep. High priority.**

### Problem

Expenses inflate at different speeds. Insurance, taxes, HOA, and maintenance should not use one generic inflation factor.

### Add component-specific inflation

```text
Taxes inflation
Insurance inflation
Maintenance inflation
HOA inflation
Utilities inflation
Management inflation
CapEx escalation
```

### Required rule

All inflation assumptions must be:

```text
source-backed
market-calibrated
or labeled [ASSUMPTION — calibrate]
```

### Integration

```text
Multi-Year DSCR Trajectory
Scenario Engine
Investor Survival Engine
```

---

## 14. Market Rent Validation

### Status

**Keep. Critical if the product will be used with real deals.**

### Problem

User-provided rent is the most dangerous input.

### Required hierarchy

```text
Signed lease + bank deposits
Form 1007 / 1025
Appraisal rent schedule
Multiple AVMs
Manual market comps
User estimate
```

### Required output

```text
User rent: $2,700
Triangulated market rent: $2,425
Deviation: +11.3%
Rent confidence: Moderate-Low
Economic ledger rent used: $2,425 or discounted $2,700 depending policy
Human review: Required if rent is unsupported and near threshold
```

### Integration

```text
Data Intake + Verification Layer
ACS Engine
Lender Ledger
Investor Ledger
```

---

## 15. Live Rate Sheet / Matrix Staleness Controls

### Status

**Keep as roadmap; required for production-grade lender qualification.**

### Problem

DSCR lender pricing and matrices change frequently. A stale matrix can make the engine wrong.

### Required rule

```text
If lender matrix or rate sheet is stale:
    lender qualification = UNKNOWN
    human review required
```

### Required metadata

```json
{
  "lender_id": "example",
  "matrix_version": "2026-06-15",
  "rate_sheet_timestamp": "2026-06-15T09:00:00Z",
  "source_document": "uploaded_pdf",
  "freshness_status": "current/stale/unknown"
}
```

### Integration

```text
Lender Qualification Engine
Audit Layer
Human Review Engine
```

---

## 16. Multi-Variable Deal Repair Optimization

### Status

**Keep, but implement after Matrix Grid Solver.**

### Problem

Real repairs are not single-variable. A deal may need a combination:

```text
lower price + lower LTV + verified rent + added reserves
```

### Required output

```text
Optimal Repair Bundle:
- Reduce purchase price by $18,000
- Add $9,000 reserves
- Reduce LTV from 78% to 75%
- Verify rent at $2,650/mo

Result:
DSCR_E improves from 0.93x to 1.04x.
LSC improves from 3.2 months to 7.1 months.
Matrix tier improves from Tier 4 to Tier 3.
```

### Integration

```text
Breakpoint + Deal Repair Engine
After single-variable breakpoints
After matrix grid solver
```

---

## 17. Counterfactual Explanations

### Status

**Keep. High-value explainability upgrade.**

### Problem

The user needs the smallest change that flips the decision.

### Required output

```text
Current decision:
Qualifies but Dangerous

Smallest change to become Financeable but Fragile:
Increase verified rent by $180/mo

Smallest structural change to become Strong:
Reduce price by $31,000 and add $12,000 reserves
```

### Integration

```text
Recommendation Engine
Deal Repair Engine
Explainability Layer
```

---

## 18. Adverse Action Reason-Code Infrastructure

### Status

**Keep. Critical if used by or on behalf of creditors.**

### Problem

If the engine influences credit decisions, adverse-action reasons may be required. Generic “failed model” reasons are not acceptable.

### Add reason-code generator

```text
Reason codes must be:
specific
principal
accurate
traceable to calculations
ranked by materiality
```

### Example

```json
[
  {
    "code": "DSCR_BELOW_MINIMUM",
    "description": "Lender DSCR of 0.94x is below the selected matrix minimum of 1.20x.",
    "source_metric": "DSCR_L",
    "rank": 1
  },
  {
    "code": "LTV_EXCEEDS_MAXIMUM",
    "description": "Loan-to-value ratio of 79.5% exceeds selected matrix maximum of 75.0%.",
    "source_metric": "LTV",
    "rank": 2
  }
]
```

### Integration

```text
Compliance Layer
Recommendation Engine
Audit Trail
Human Review Engine
```

---

## 19. Fair Lending Monitoring

### Status

**Keep as governance roadmap. Critical if creditor-facing.**

### Problem

Blocking protected variables is not enough. If the engine is used in lending workflows, monitoring may be needed to detect disparate outcomes.

### Required structure

```text
Input governance
Variable approval register
Proxy-risk review
Reason-code audit
Outcome monitoring
Disparate-impact testing where legally appropriate
Legal/compliance review before deployment
```

### Integration

```text
Compliance Layer
Model Governance
Monitoring Framework
```

---

## 20. Backtest Framework

### Status

**Keep. Required for serious validation.**

### Problem

The engine cannot know if assumptions work without historical outcome testing.

### Required metrics

```text
True positive rate: correctly flagged bad deals
False negative rate: bad deals missed
False positive rate: good deals over-flagged
Calibration error
Recommendation performance by class
QbD accuracy
Stress-test predictive value
```

### Integration

```text
Validation Framework
Model Monitoring
Champion/Challenger Roadmap
```

---

## 21. Model Drift Detection

### Status

**Keep. Required after deployment.**

### Problem

Insurance, rent, tax, and interest-rate environments change. Assumptions decay.

### Required triggers

```text
Input distribution drift
Outcome drift
Default/distress-rate drift
Matrix-change drift
Insurance shock drift
Rent estimate drift
```

### Required output

```text
Drift detected:
Insurance assumptions no longer match observed quotes.
Severity: High.
Action: recalibrate insurance shock factor.
```

### Integration

```text
Validation + Monitoring Framework
Governance Dashboard
```

---

## 22. Outcome Tracking

### Status

**Keep as roadmap.**

### Problem

The engine needs feedback loops.

### Track

```text
Actual rent vs projected rent
Actual taxes vs projected taxes
Actual insurance vs projected insurance
Actual DSCR by year
Vacancy events
CapEx events
Refinance success/failure
Sale outcome
Default/distress/cash call events
```

### Integration

```text
Post-deployment monitoring
Model calibration
Backtesting
Future empirical weights
```

---

# PART III — WHAT TO REJECT OR DEFER

---

## 23. Reject as Core Gates

Do not use these as deterministic gatekeepers:

```text
Monte Carlo probability of approval
Probability of default without calibrated outcome data
Capital depletion probability as decision gate
Black-box risk score
SHAP-style explanations for deterministic rule decisions if simple reason codes suffice
ZIP-level risk penalties without compliance approval
Uncalibrated geographic risk modifiers
Universal DSCR thresholds
Universal reserve requirements
Universal insurance shock multipliers
```

Reason: these can create false precision, compliance exposure, or unexplainable decision logic.

---

## 24. Defer to v2 or Later

These are useful but not required for the immediate deterministic vNext:

```text
Monte Carlo DSCR distributions
Probability of default model
Pareto frontier
Portfolio-level analysis
Borrower behavior model
Component-level CapEx clustering
State-by-state full compliance engine
Champion/challenger framework
A/B testing infrastructure
SHAP-style attribution
Blanket-loan logic
Mixed-use logic
5+ unit multifamily specialization
```

Do not delete them. Put them in the roadmap.

---

# PART IV — UPDATED ARCHITECTURE

---

## 25. Revised AEGIS Architecture After This Patch

```text
AEGIS-DSCR Decision Engine vNext

1. Data Intake + Verification Layer
2. ECOA / Proxy-Risk Lockout
3. Dual-Ledger Normalization Layer
4. Deterministic Formula Engine
5. Accounting-Boundary Validator
6. Lender Qualification Engine
7. Investor Survival Engine
8. Multi-Year Trajectory Engine
9. IO / ARM Reset Engine
10. Liquidity Sequential Drawdown Engine
11. Seasonality Trough Detector
12. Cap-Rate Linked Refi Solver
13. Scenario + Macro Archetype Engine
14. Matrix Grid Solver
15. Breakpoint + Deal Repair Engine
16. Counterfactual Explanation Engine
17. Recommendation + Human Review Engine
18. Adverse-Action Reason-Code Layer
19. Audit + Compliance Layer
20. Backtest + Drift + Outcome Monitoring Framework
```

---

## 26. Updated Human Review Triggers

Add these triggers to the existing list:

```text
- Projected Refi LTV exceeds or nears max matrix LTV
- Exit cap rate is estimated rather than source-backed
- CapRateBeta is an assumption
- Lender matrix contains discrete tier cliffs near current deal position
- Scalar LSC differs materially from sequential drawdown result
- Liquidity failure occurs in any month of the drawdown array
- STR/seasonal property lacks monthly revenue curve
- Annual DSCR passes but seasonality trough fails
- Any location-based adjustment uses ZIP/tract/neighborhood without approved source
- Any protected-class proxy risk is detected
- Any output could affect credit eligibility
- Recommendation requires adverse-action reasons
- Matrix/rate sheet is stale
- Multi-year trajectory falls below threshold after Year 1
- IO/ARM reset-year DSCR falls below threshold
- Rent validation materially disagrees with user rent
```

---

## 27. Updated Recommendation Output Format

Every final report should now include:

```text
1. Executive Decision
2. Lender Qualification Ledger
3. Investor Survival Ledger
4. Delta Ledger
5. Base-Year Metrics
6. Multi-Year DSCR Trajectory
7. IO / ARM / Refi Risk
8. Cap-Rate Linked Exit LTV
9. Scenario + Macro Archetype Results
10. Liquidity Sequential Drawdown
11. Seasonality Trough Analysis, if applicable
12. Matrix Grid Repair Opportunities
13. Breakpoint Repair Map
14. Counterfactual Explanations
15. Assumption Confidence
16. Human Review Triggers
17. Reason Codes, if applicable
18. Compliance Notice
19. Audit Summary
```

---

# PART V — PRIORITY ROADMAP

---

## 28. Immediate Integration — vNext Critical Patch

Implement these before any production use:

```text
1. Matrix Grid Solver
2. Sequential Drawdown Array
3. Cap-Rate Linked Refi Solver
4. IO Reset Cliff Engine
5. Multi-Year DSCR Trajectory
6. Macro Archetype Scenario Engine
7. ECOA Lockout
8. Adverse-Action Reason Code Layer
```

---

## 29. Near-Term Upgrade — v1.2

```text
1. ARM Reset Modeling
2. Expense Inflation by Component
3. Market Rent Validation
4. Seasonality Trough Detector
5. Counterfactual Explanation Engine
6. Matrix/Rate Sheet Staleness Controls
```

---

## 30. Governance / Validation Upgrade — v1.3

```text
1. Backtest Framework
2. Drift Detection
3. Outcome Tracking
4. Confidence Weight Calibration
5. Shock Factor Calibration
6. Fair Lending Monitoring Roadmap
```

---

## 31. Advanced v2 Roadmap

```text
1. Portfolio-level analysis
2. Monte Carlo overlay
3. Calibrated probability of default
4. Pareto frontier optimizer
5. Full STR normalization engine
6. 5+ unit multifamily module
7. Mixed-use module
8. Blanket-loan module
9. State-specific legal/compliance module
10. Champion/challenger model governance
```

---

# 32. Final Integration Instruction for the Next AI / Build Agent

Use this document as an **algorithmic gap patch**, not a replacement for the existing DSCR master specification.

## Preserve

```text
Deterministic formula core
Dual-ledger structure
Formula registry
DSCR_L vs DSCR_E accounting boundary
QbD detector
ACS
Stress DSCRs
LSC
Breakpoint solver
Rule-based recommendation templates
Audit trail
Compliance disclaimers
```

## Add

```text
Cap-rate linked refi solver
Matrix grid solver
Sequential drawdown array
Seasonality trough detector
Macro archetype scenarios
ECOA lockout
Depreciation shield display
Multi-year trajectory
IO reset cliff
ARM reset modeling
Expense inflation
Market rent validation
Reason-code infrastructure
Backtest / drift / outcome tracking
```

## Do not add as decision gates without calibration

```text
Monte Carlo
PD model
Capital depletion probability
Geographic risk modifiers
Proxy-risk variables
One-number approval score
Probability of approval
```

## Product principle

```text
The deterministic core tells us whether the deal works on paper.
The algorithmic gap layer tells us whether the paper missed how the deal fails in reality.
```

That is the upgrade from advanced DSCR calculator to institutional risk-management architecture.
