# Advisor-Grade DSCR Decision Engine — Usable Master Specification

**Status:** Cleaned master specification  
**Scope:** Only the usable, defensible components from the latest research audit  
**Product category:** Advisor-grade DSCR decision-support engine, not a basic calculator and not a replacement for licensed financial, mortgage, tax, legal, or underwriting advice

---

## 1. Executive Thesis

The correct target is not a better DSCR calculator. The correct target is a **dual-ledger, deterministic, matrix-aware, stress-tested, breakpoint-solving DSCR Decision Engine**.

A basic DSCR calculator answers one narrow question:

> Does rent cover the payment?

This engine answers a stronger professional question set:

1. Does the deal likely fit a selected lender/product matrix?
2. Does the property survive realistic ownership stress?
3. Which specific assumption breaks the deal?
4. What exact change repairs the deal?
5. Which numbers are verified, estimated, stale, missing, or dangerous?
6. What recommendation is mathematically justified?
7. What needs human review before anyone relies on the result?

The engine must always separate:

```text
Lender Qualification ≠ Investor Survival
```

A property can be financeable and still economically dangerous. That separation is the core product advantage.

---

## 2. Non-Negotiable Design Principles

### 2.1 Deterministic math first

All core calculations must be formula-based, versioned, reproducible, and auditable.

AI may explain, summarize, classify missing information, and generate human-readable narratives. AI must not invent lender rules, market rents, pricing, thresholds, formulas, or approval conclusions.

### 2.2 Dual-ledger analysis

The engine must maintain two independent ledgers:

| Ledger | Purpose | Output |
|---|---|---|
| **Ledger 1 — Lender Qualification** | Tests likely fit against a selected lender/product matrix | Likely fits / conditional / does not fit / unknown |
| **Ledger 2 — Investor Survival** | Tests whether the property survives real ownership costs and stress | Survivable / fragile / fails / insufficient data |

### 2.3 No universal DSCR rule

No single DSCR threshold should be hard-coded as a universal truth.

All lender thresholds must be:

- Pulled from a live or versioned matrix,
- Defined as an internal policy default, or
- Labeled as an assumption.

### 2.4 No black-box recommendation logic

The final recommendation must come from a visible rule table and traceable calculations.

Do not use a monolithic weighted score as the final decision. Scores may support interpretation, but they cannot hide fatal failures.

### 2.5 Investor survival overrides lender qualification

A lender pass does not create an investment recommendation.

Final rule:

```text
If lender qualification passes but investor survival fails,
final output = "Qualifies but Dangerous" or equivalent warning.
```

### 2.6 No overclaim language

Do not use:

- Guaranteed safe
- Worst-case proof
- Regulator-friendly
- Litigation-ready
- Approved
- Guaranteed qualification
- Financial advice

Use:

- Passes selected stress framework
- Traceable
- Audit-ready
- Compliance-aware
- Likely fits selected matrix
- Decision support

---

## 3. Final System Architecture

```text
INPUTS
  ↓
DATA INTAKE + EVIDENCE LAYER
  ↓
ADVERSARIAL INPUT AUDITOR
  ↓
DATA INTEGRITY SCORE + CONFIDENCE LABELS
  ↓
DETERMINISTIC FORMULA CORE
  ↓
┌─────────────────────────────┬─────────────────────────────┐
│ LEDGER 1                    │ LEDGER 2                    │
│ LENDER QUALIFICATION        │ INVESTOR SURVIVAL           │
│ Matrix-aware                │ Stabilized NOI + stress     │
└─────────────────────────────┴─────────────────────────────┘
  ↓
QUALIFIES-BUT-DANGEROUS DETECTOR
  ↓
STRESS + FRAGILITY ENGINE
  ↓
BREAKPOINT + DEAL REPAIR ENGINE
  ↓
RULE-BASED RECOMMENDATION ENGINE
  ↓
AUDIT + COMPLIANCE LAYER
```

---

## 4. Data Intake and Evidence Layer

Every input must carry a source, timestamp, and confidence label.

### 4.1 Required input groups

#### Property inputs

```text
Property address
Property type
Unit count
Purchase price
Appraised value / estimated value
Current tax amount
Insurance quote
HOA / association dues
Utilities paid by owner
Property age
Known repair issues
Market / submarket
```

#### Loan inputs

```text
Loan amount
Interest rate
Term
Amortization period
Interest-only period
Prepayment penalty
Points / credits
Closing costs
LTV
Purpose: purchase / rate-term refinance / cash-out refinance
Entity or individual vesting
Selected lender/product matrix
```

#### Income inputs

```text
Current lease rent
Market rent
Rent source
Other income
Vacancy assumption
Short-term rental income treatment, if applicable
```

#### Expense inputs

```text
Taxes
Insurance
HOA
Management
Repairs and maintenance
CapEx / replacement reserve
Utilities
Leasing / turnover cost
Other operating expenses
```

#### Borrower / investor inputs

```text
Liquid reserves after close
Target cash flow
Risk tolerance
Hold period
Experience level
Portfolio exposure
Refinance plan
Maximum acceptable negative cash flow
```

### 4.2 Input confidence labels

Each input must be labeled:

| Label | Meaning |
|---|---|
| **Verified** | Supported by document, lender matrix, official record, or reliable data source |
| **User-provided** | Entered by user without verification |
| **Estimated** | Estimated from market data or model logic |
| **Assumed** | Policy/default assumption used because data is missing |
| **Stale** | Source exists but is too old for reliable use |
| **Missing** | Required field absent |
| **Conflicting** | Multiple sources disagree materially |

### 4.3 Evidence hierarchy

Use the strongest available source.

| Rank | Input type | Preferred evidence |
|---|---|---|
| 1 | Lender rules | Current lender/product matrix with version date |
| 2 | Rent | Signed lease + receipts, appraisal rent schedule, verified rent comp set |
| 3 | Taxes | County assessor / tax bill / reassessment estimate |
| 4 | Insurance | Current insurance quote or binder |
| 5 | Expenses | Actual operating statement, inspection, property condition report |
| 6 | Reserves | Verified liquid asset documentation |
| 7 | Market assumptions | Timestamped market data source |
| 8 | User estimates | Allowed, but low confidence |

---

## 5. Deterministic Formula Core

The formula core is the single source of truth. Every formula must be versioned and testable.

### 5.1 Monthly amortizing payment

```text
Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
```

Where:

```text
P = loan principal
r = monthly interest rate
n = number of monthly payments
```

### 5.2 Interest-only monthly payment

```text
IO Payment = Loan Amount × Annual Interest Rate / 12
```

### 5.3 PITIA / ITIA

```text
PITIA = Principal + Interest + Taxes + Insurance + Association Dues
ITIA = Interest + Taxes + Insurance + Association Dues
```

### 5.4 Qualifying DSCR / QDSCR

This is the lender-style DSCR used for product qualification.

```text
QDSCR = Lender-Accepted Monthly Rent / Lender-Accepted Monthly Payment
```

The denominator must follow the selected lender matrix. Some matrices may use PITIA for amortizing loans and ITIA for interest-only loans. The engine must not assume one universal denominator.

### 5.5 Effective Gross Income / EGI

```text
EGI = Gross Scheduled Rent × (1 - Vacancy Rate) + Other Income
```

Annualized version:

```text
Annual EGI = Monthly Gross Scheduled Rent × 12 × (1 - Vacancy Rate) + Annual Other Income
```

### 5.6 Stabilized NOI

Use this for investor survival.

```text
Stabilized NOI = EGI
                 - Taxes
                 - Insurance
                 - HOA
                 - Management Fee
                 - Repairs and Maintenance
                 - Utilities Paid by Owner
                 - Leasing / Turnover Cost
                 - Replacement Reserve / CapEx Reserve
                 - Other Normalized Operating Expenses
```

Important rule:

```text
Do not double-count expenses.
```

If NOI already includes management, repairs, or replacement reserves, do not subtract them again.

### 5.7 Investor DSCR

```text
Investor DSCR = Stabilized NOI / Actual Annual Debt Service
```

This ratio measures whether the property survives real ownership economics, not merely lender qualification.

### 5.8 Reset-Safe DSCR

Use for interest-only, ARM, balloon, or refinance-dependent structures.

```text
Reset-Safe DSCR = Stabilized NOI / Reset Annual Debt Service
```

Where reset annual debt service is calculated using a defined reset/refinance scenario, not a hidden forecast.

Recommended output:

```text
Break-even refinance rate
Rate shock DSCR
Post-IO amortizing DSCR
```

### 5.9 Debt Yield

```text
Debt Yield = Stabilized NOI / Loan Amount
```

Debt yield is useful because it is independent of interest rate and amortization structure. It should be a side constraint, not the final recommendation.

### 5.10 Liquidity Survival Clock

```text
Zero-Income Survival Months = Verified Liquid Reserves /
                              Monthly Cash Burn During Zero-Income Event
```

Where:

```text
Monthly Cash Burn = Debt Service + Taxes + Insurance + HOA + Utilities + Required Minimum Operating Costs
```

This measures reserve survivability during vacancy or collection failure.

### 5.11 Liquidity-to-Shock Ratio / LSR

```text
LSR = Verified Liquid Reserves / Estimated Major Repair Shock
```

The major repair shock must be property-specific when possible. If a default value is used, it must be labeled as a policy assumption.

### 5.12 Worst-Case / Robust DSCR

```text
Robust DSCR = Stressed NOI / Stressed Annual Debt Service
```

Stressed NOI must come from a defined scenario set, not arbitrary user changes.

### 5.13 Composite Fragility Index / CFI

Use a guarded version to avoid denominator failure near DSCR = 1.0.

```text
If Base DSCR <= 1.00:
    CFI = "Broken at base case"
Else:
    CFI = clamp(
        100 × (Base DSCR - Composite Shock DSCR) / (Base DSCR - 1.00),
        0,
        200
    )
```

Interpretation:

| CFI | Meaning |
|---:|---|
| 0–30 | Low fragility |
| 30–60 | Sensitive |
| 60–100 | Highly fragile |
| >100 | Shock breaks coverage below 1.0 |

These bands are initial policy defaults until calibrated.

### 5.14 Break-even rent

```text
Required Annual NOI = Target DSCR × Annual Debt Service
Required EGI = Required Annual NOI + Normalized Operating Expenses
Required Monthly Rent = Required EGI / [12 × (1 - Vacancy Rate)]
Required Rent Increase = Required Monthly Rent - Current Monthly Rent
```

### 5.15 Break-even price / loan amount / LTV

These should be solved through deterministic root-finding or direct algebra where available.

Outputs:

```text
Maximum supportable loan amount
Required LTV reduction
Required price reduction
Required cash-in amount
Required rate improvement
```

---

## 6. Ledger 1 — Lender Qualification Engine

### 6.1 Purpose

Evaluate whether the deal likely fits a selected lender/product matrix.

This ledger does **not** decide whether the investment is good.

### 6.2 Inputs

```text
Selected lender/product matrix
Matrix version date
Property type
Loan amount
LTV
FICO
QDSCR
Loan purpose
Occupancy / investment status
Reserves
Prepayment penalty
Interest-only flag
State restrictions
Entity vesting
Rent source requirements
```

### 6.3 Outputs

Use cautious language:

```text
Likely fits selected matrix
Conditionally fits selected matrix
Does not fit selected matrix
Unknown — matrix missing, stale, or incomplete
Requires human review
```

Do not output:

```text
Approved
Guaranteed qualified
Loan will close
```

### 6.4 Matrix versioning

Every lender matrix must include:

```text
Lender name
Product name
Version date
Imported date
Expiration date if known
Source file / URL
Fields parsed
Fields not parsed
Assumptions
Manual overrides
Human reviewer
```

---

## 7. Ledger 2 — Investor Survival Engine

### 7.1 Purpose

Evaluate whether the property survives real-world ownership stress after normalized expenses, reserves, vacancy, taxes, insurance, repairs, and liquidity risk.

### 7.2 Core outputs

```text
Investor DSCR
Reset-Safe DSCR
Robust DSCR
Debt Yield
Net Cash Flow After Debt Service
Liquidity Survival Months
Liquidity-to-Shock Ratio
CapEx reserve adequacy
Expense confidence
Rent confidence
```

### 7.3 Survival classification

| Result | Condition |
|---|---|
| **Survivable** | Investor DSCR and robust DSCR pass selected thresholds; liquidity is adequate; data confidence is acceptable |
| **Fragile** | Base case survives but stress cases break or liquidity is weak |
| **Fails** | Base investor DSCR or robust DSCR fails materially |
| **Insufficient Data** | Missing/stale/conflicting inputs prevent a reliable survival view |

Thresholds must be policy-configurable and calibrated.

---

## 8. Qualifies-but-Dangerous Detector

This is a flagship feature.

### 8.1 Rule

```text
IF Ledger 1 = likely fits / conditional fit
AND Ledger 2 = fragile / fails
THEN Flag = "Qualifies but Dangerous"
```

### 8.2 Meaning

The deal may fit lender qualification math, but the property may not survive real ownership economics.

### 8.3 Output format

```text
Qualifies but Dangerous:
The selected lender matrix may accept this deal, but investor survival fails under normalized ownership costs or defined stress scenarios. The primary failure driver is [risk]. To repair the deal, the model estimates [required change]. Human review is required before relying on this result.
```

---

## 9. Stress and Fragility Engine

### 9.1 Stress philosophy

Stress tests should be deterministic and named. The user may run custom scenarios, but the engine should maintain conservative default policy scenarios that cannot be softened without permission.

### 9.2 Scenario set

| Scenario | Purpose |
|---|---|
| **Base Case** | Current verified or user-provided inputs |
| **Evidence-Adjusted Case** | Applies confidence haircuts to weak inputs |
| **Conservative Case** | Moderate adverse movement in rent, vacancy, expenses, taxes, insurance |
| **Severe Case** | Larger simultaneous shocks |
| **Cascading Shock** | Vacancy + tax + insurance + repair/CapEx combined |
| **Reset / Refinance Case** | Tests post-IO, balloon, or refinancing risk |

### 9.3 Default policy shocks

All defaults are assumptions until calibrated.

```text
Rent decline: policy default
Vacancy increase: policy default
Tax reassessment: calculated when local millage/assessment rules are available; otherwise assumption
Insurance increase: policy default, with hazard-zone adjustment if sourced
Expense inflation: policy default
CapEx / major repair event: property-specific preferred; default only if necessary
Rate reset: scenario-based, not forecasted as fact
```

### 9.4 Shock-specific outputs

```text
Tax Shock DSCR
Insurance Shock DSCR
Vacancy Shock DSCR
CapEx Stress DSCR
Rate Reset DSCR
Composite Shock DSCR
Robust DSCR
Composite Fragility Index
Dominant Failure Driver
```

---

## 10. Data Integrity and Adversarial Input Auditor

### 10.1 Purpose

Detect over-optimistic, stale, unsupported, or manipulated inputs.

### 10.2 Rent audit

```text
Rent Market Alignment Index =
(User Rent - Market Median Rent) / (Market P90 Rent - Market P10 Rent)
```

If the user rent sits materially above the market distribution, cap confidence and flag the input.

### 10.3 Expense audit

Compare operating expense ratio against a relevant property-type and market benchmark when available.

```text
Operating Expense Ratio = Normalized Operating Expenses / EGI
```

If expenses appear unusually low, flag the output.

### 10.4 Vacancy audit

Compare user vacancy assumption against market vacancy or a policy floor.

### 10.5 Data Integrity Score / DIS

DIS should be a calibrated evidence score, not a claimed truth.

Suggested structure:

```text
DIS = weighted score of:
- Rent evidence quality
- Expense evidence quality
- Tax evidence quality
- Insurance evidence quality
- Reserve verification
- Matrix freshness
- Market data freshness
- Missing/conflicting inputs
```

Interpretation:

| DIS | Label |
|---:|---|
| 80–100 | High confidence |
| 60–79 | Usable with assumptions |
| 40–59 | Low confidence / human review |
| <40 | Insufficient data |

Weights must be calibrated over time.

---

## 11. Breakpoint and Deal Repair Engine

### 11.1 Purpose

Convert diagnosis into action.

The engine should not only say the deal fails. It should calculate what change would make it pass the selected standard.

### 11.2 Repair outputs

```text
Required rent increase
Required price reduction
Required loan reduction
Required LTV reduction
Required interest rate reduction
Required reserves increase
Required verified income improvement
Required expense reduction
Required tax/insurance verification
```

### 11.3 Repair language

Use:

```text
This change passes the selected stress framework.
```

Do not use:

```text
This guarantees safety.
```

### 11.4 Feasibility logic

A repair is feasible only if it fits:

```text
User constraints
Lender matrix constraints
Market-supported rent assumptions
Property economics
Available liquidity
Compliance / human-review rules
```

If no repair fits the selected constraints:

```text
No feasible repair under selected assumptions.
```

Use “structurally unfixable” only as a conservative label and only after constraints are explicit.

---

## 12. Recommendation Engine

### 12.1 Recommendation method

Use a gated rule hierarchy, not a weighted average.

```text
Gate 1 — Data confidence
Gate 2 — Lender matrix fit
Gate 3 — Investor survival
Gate 4 — Liquidity survival
Gate 5 — Stress / fragility
Gate 6 — Borrower suitability
Gate 7 — Compliance / human review
```

### 12.2 Recommendation categories

```text
Strong under selected assumptions
Financeable and survivable
Financeable but sensitive
Qualifies but Dangerous
Does not fit selected lender matrix
Economically viable but needs different debt structure
Insufficient verified data
Requires human review
Avoid / do not proceed under current assumptions
```

### 12.3 Rule table

| Condition | Recommendation |
|---|---|
| Data confidence too low | Insufficient verified data / human review required |
| Lender ledger passes + investor ledger passes + stress acceptable | Financeable and survivable under selected assumptions |
| Lender ledger passes + investor ledger fragile/fails | Qualifies but Dangerous |
| Lender ledger fails + investor ledger passes | Economically viable but needs different lender/debt structure |
| Both ledgers fail | Avoid or restructure under current assumptions |
| Tax shock breaks DSCR | Verify post-purchase tax liability before proceeding |
| Insurance shock breaks DSCR | Verify insurance quote and hazard exposure |
| Liquidity survival weak | Increase reserves or reduce leverage |
| Repair requires unsupported rent | Do not recommend; require verified rent evidence |

### 12.4 Required explanation for every recommendation

Every recommendation must include:

```text
Decision
Triggered rules
Key calculations
Thresholds used
Primary risk driver
Required repair
Missing data
Assumptions
Confidence level
Human-review trigger
Compliance disclaimer
```

---

## 13. Probabilistic Scenario Engine

### 13.1 Status

Optional overlay only. Not part of the core decision gate.

### 13.2 Use cases

```text
Distribution of DSCR outcomes
Probability DSCR < 1.0
Probability of negative cash flow
Reserve depletion distribution
Scenario range explanation
```

### 13.3 Rules

```text
Seeded runs for reproducibility
Visible assumptions
Visible correlations
No hidden priors
No recommendation based on simulation alone
Always shown after deterministic stress results
Clearly labeled: simulation, not prediction
```

---

## 14. Audit and Compliance Layer

### 14.1 Audit log

Every output must be traceable.

Log:

```text
User inputs
Source documents
Market data sources
Lender matrix version
Formula versions
Assumptions
Scenario settings
Rule triggers
Human overrides
AI-generated explanations
Random seed if simulation used
Timestamp
```

### 14.2 Compliance boundaries

The engine is decision support. It must not represent itself as:

```text
Licensed financial advisor
Mortgage broker
Lender
Underwriter
Attorney
CPA
Investment adviser
```

### 14.3 Safe language

Use:

```text
Based on the provided inputs...
Under the selected lender matrix...
Under the selected stress assumptions...
This analysis suggests...
Requires human review...
Consult a licensed professional before acting.
```

Avoid:

```text
You should buy this.
This is approved.
This loan will close.
This is guaranteed.
This is legal/tax/investment advice.
```

### 14.4 Credit decision caution

If the engine is used in actual credit decisioning, every adverse or negative conclusion must have specific, traceable reasons.

---

## 15. Final Output Package

The engine should output a structured deal report.

```text
1. Executive Deal Verdict
2. Data Confidence Summary
3. Lender Qualification Ledger
4. Investor Survival Ledger
5. Qualifies-but-Dangerous Flag
6. Formula Results
7. Stress-Test Dashboard
8. Fragility Diagnosis
9. Breakpoint / Deal Repair Results
10. Liquidity Survival Analysis
11. Missing Data and Assumption Warnings
12. Recommendation and Rationale
13. Human Review Triggers
14. Audit Log
15. Compliance Disclaimer
```

---

## 16. Implementation Pseudocode

```python
def advisor_grade_dscr_engine(inputs, market_data, lender_matrix, policy):
    # 1. Validate and label inputs
    validated_inputs = validate_required_fields(inputs)
    evidence = label_evidence_sources(validated_inputs, market_data, lender_matrix)
    dis = compute_data_integrity_score(evidence, policy.dis_weights)

    # 2. Build normalized assumptions
    normalized = normalize_inputs(
        inputs=validated_inputs,
        market_data=market_data,
        policy=policy,
        evidence=evidence
    )

    # 3. Core loan calculations
    monthly_pi = calc_amortizing_payment(
        principal=normalized.loan_amount,
        rate=normalized.rate,
        months=normalized.amortization_months
    )
    monthly_io = calc_interest_only_payment(
        principal=normalized.loan_amount,
        rate=normalized.rate
    )
    pitia = calc_pitia(monthly_pi, normalized.taxes, normalized.insurance, normalized.hoa)
    itia = calc_itia(monthly_io, normalized.taxes, normalized.insurance, normalized.hoa)

    # 4. Lender qualification ledger
    qdscr = calc_qdscr(normalized, lender_matrix, pitia, itia)
    lender_result = evaluate_lender_matrix(
        deal=normalized,
        matrix=lender_matrix,
        qdscr=qdscr,
        evidence=evidence
    )

    # 5. Investor survival ledger
    egi = calc_effective_gross_income(normalized)
    stabilized_noi = calc_stabilized_noi(normalized, egi)
    annual_debt_service = calc_actual_annual_debt_service(normalized)
    investor_dscr = stabilized_noi / annual_debt_service
    reset_safe_dscr = calc_reset_safe_dscr(normalized, stabilized_noi, policy)
    debt_yield = stabilized_noi / normalized.loan_amount
    liquidity_months = calc_liquidity_survival_months(normalized)
    lsr = calc_liquidity_to_shock_ratio(normalized, policy)

    investor_result = evaluate_investor_survival(
        investor_dscr=investor_dscr,
        reset_safe_dscr=reset_safe_dscr,
        debt_yield=debt_yield,
        liquidity_months=liquidity_months,
        lsr=lsr,
        dis=dis,
        policy=policy
    )

    # 6. Stress and fragility
    scenarios = build_scenarios(normalized, market_data, policy)
    stress_results = run_deterministic_stress_tests(normalized, scenarios)
    cfi = compute_composite_fragility_index(
        base_dscr=investor_dscr,
        composite_shock_dscr=stress_results.composite_dscr
    )
    dominant_failure_driver = identify_dominant_failure_driver(stress_results)

    # 7. Qualifies-but-dangerous detector
    qbd = detect_qualifies_but_dangerous(
        lender_result=lender_result,
        investor_result=investor_result
    )

    # 8. Breakpoint and repair
    breakpoints = compute_breakpoints(
        normalized=normalized,
        stabilized_noi=stabilized_noi,
        annual_debt_service=annual_debt_service,
        policy=policy
    )
    repair_options = solve_deal_repairs(
        normalized=normalized,
        target_framework=policy.target_framework,
        constraints=policy.constraints
    )

    # 9. Rule-based recommendation
    recommendation = generate_rule_based_recommendation(
        data_integrity_score=dis,
        lender_result=lender_result,
        investor_result=investor_result,
        qbd=qbd,
        stress_results=stress_results,
        cfi=cfi,
        repair_options=repair_options,
        policy=policy
    )

    # 10. Audit package
    audit_log = build_audit_log(
        inputs=inputs,
        evidence=evidence,
        formulas=policy.formula_versions,
        matrix=lender_matrix,
        scenarios=scenarios,
        rules_triggered=recommendation.rules_triggered
    )

    return {
        "executive_verdict": recommendation.verdict,
        "data_integrity_score": dis,
        "lender_qualification": lender_result,
        "investor_survival": investor_result,
        "qualifies_but_dangerous": qbd,
        "metrics": {
            "qdscr": qdscr,
            "investor_dscr": investor_dscr,
            "reset_safe_dscr": reset_safe_dscr,
            "debt_yield": debt_yield,
            "liquidity_survival_months": liquidity_months,
            "lsr": lsr,
            "cfi": cfi
        },
        "stress_results": stress_results,
        "dominant_failure_driver": dominant_failure_driver,
        "breakpoints": breakpoints,
        "repair_options": repair_options,
        "recommendation": recommendation,
        "audit_log": audit_log,
        "compliance_disclaimer": policy.disclaimer
    }
```

---

## 17. Validation Framework

### 17.1 Formula tests

Each formula must have hand-calculated test cases.

Test:

```text
PITIA
ITIA
QDSCR
EGI
Stabilized NOI
Investor DSCR
Reset-Safe DSCR
Debt Yield
Liquidity Survival Months
CFI
Break-even rent
Break-even LTV
```

### 17.2 Edge-case tests

```text
Zero rent
Negative NOI
100% vacancy
Missing taxes
Missing insurance
Interest-only loan
Balloon loan
Stale lender matrix
Contradictory rent sources
Annual/monthly input error
Outlier rent assumption
Very low reserves
Very high LTV
```

### 17.3 Stress consistency tests

```text
Stress DSCR cannot exceed base DSCR unless the scenario improves an input.
Composite shock must be at least as severe as each included mild single shock where applicable.
CFI must handle base DSCR <= 1.0 safely.
Repair solver must not return unsupported rent assumptions.
```

### 17.4 Recommendation consistency tests

```text
Lender pass + investor fail always triggers Qualifies but Dangerous.
Low DIS always triggers confidence warning.
Missing matrix never produces likely qualification.
Simulation alone never produces final recommendation.
Negative recommendation must show specific reasons.
```

---

## 18. V1 Build Scope

### 18.1 Include in V1

```text
Dual-ledger engine
QDSCR
Stabilized NOI
Investor DSCR
Reset-Safe DSCR
Debt Yield
Liquidity Survival Clock
Data Integrity Score
Stress-test dashboard
Composite Fragility Index with denominator guard
Qualifies-but-Dangerous detector
Breakpoint solver
Rule-based recommendation engine
Audit log
Compliance disclaimer
```

### 18.2 Defer from V1

```text
DSCR Convexity Index
Full Monte Carlo engine
Black-box ML scoring
Appreciation-assisted metrics
Universal lender ranking
Automatic credit decisioning
```

### 18.3 Reject permanently from core

```text
Liquidity-added DSCR
Appreciation-assisted DSCR
One-number monolithic deal score
Black-box approval model
Guarantee language
Universal hard-coded DSCR threshold
```

---

## 19. Final Product Standard

The finished system should behave like this:

```text
This deal likely fits the selected lender matrix, but investor survival fails under normalized ownership costs and conservative stress assumptions. The primary issue is insufficient stabilized NOI after taxes, insurance, repairs, and reserves. The deal would require either a verified rent increase of $X/month, a price reduction of $Y, an LTV reduction to Z%, or additional reserves of $A to pass the selected survival framework. Because rent evidence is low-confidence and the lender matrix is stale, human review is required.
```

That is the product category:

```text
Advisor-grade DSCR decision support.
Calculation-first.
Dual-ledger.
Stress-tested.
Breakpoint-solving.
Auditable.
Compliance-aware.
```
