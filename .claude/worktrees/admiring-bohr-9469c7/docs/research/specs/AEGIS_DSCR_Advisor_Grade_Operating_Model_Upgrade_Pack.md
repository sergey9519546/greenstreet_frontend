# AEGIS DSCR — Advisor-Grade Operating Model Upgrade Pack

**Purpose:** This document is designed to be uploaded into another AI, build agent, research agent, or coding agent to improve the existing AEGIS / Advisor-Grade DSCR Decision Engine master specification.

**Instruction to improvement agent:** Do not replace the existing master DSCR formula library or dual-ledger architecture. Use this document as an **integration patch** that upgrades the operating model, governance layer, build sequence, compliance boundaries, audit trail, and user-facing report structure.

---

# 1. Executive Integration Summary

The current master DSCR engine already contains the core technical system:

- Dual-ledger architecture
- Lender Qualification Ledger
- Investor Survival Ledger
- Deterministic Formula Engine
- Stress and Scenario Engine
- Breakpoint and Deal-Repair Engine
- Qualifies-but-Dangerous Detector
- Assumption Confidence Score
- Rule-based Recommendation Engine
- Audit Trail
- Compliance-aware output language

This upgrade pack should be integrated as a **governance + operating model layer** on top of the existing master specification.

The breakthrough is not one better DSCR formula. The breakthrough is the controlled separation of:

```text
Can the loan likely qualify?
```

from:

```text
Can the investor survive?
```

and then solving:

```text
What exact change repairs the deal?
```

---

# 2. Highest-Value Additions From This Blueprint

The following additions should be merged into the master spec:

| Addition | Where It Belongs | Verdict |
|---|---|---|
| Advisor-grade operating model | New Section 0 | Keep |
| Four non-negotiable rules | New Section 0 | Keep |
| Nine-module architecture | System Architecture | Keep and merge |
| Dual-Ledger Normalization Layer | New module after Data Intake | Keep |
| Delta Ledger | Risk Diagnosis / QbD module | Keep — major improvement |
| Formula Registry | Deterministic Formula Engine | Keep — major improvement |
| Input Record schema | Data Intake + Verification Layer | Keep |
| Lender Matrix schema | Lender Qualification Engine | Keep |
| Conservative LTV convention | Formula Library / LTV section | Keep with caveat |
| Rent-source discipline using Form 1007 / lease support | Input Confidence Layer | Keep with caveat |
| TRID / Loan Estimate boundary | Compliance section | Keep |
| Expanded human-review triggers | Recommendation + Compliance Layer | Keep |
| Investor Survival Score as minimum-gate score | Scoring Methodology | Keep; replace blended score |
| Deal-repair ranking logic | Breakpoint + Deal Repair Engine | Keep |
| Audit schema with output hash | Audit Trail | Keep |
| MVP 1–5 build sequence | Implementation Roadmap | Keep |
| 11-part user report structure | Output Report section | Keep |

---

# 3. Source-Backed Anchors To Preserve

These facts should be used as external anchors, not as overbroad universal rules.

## 3.1 Model-risk governance

As of June 18, 2026, the relevant supervisory anchor is the revised interagency model-risk guidance issued April 17, 2026. It emphasizes model development and use, model validation and monitoring, governance and controls, effective challenge, and risks from model misuse.

**Design implication:** The DSCR engine should be treated as a governed financial decision-support system with formula versioning, validation, monitoring, audit logs, and human-review triggers.

**Reference:** OCC Bulletin 2026-13, “Model Risk Management: Revised Guidance.”

---

## 3.2 Complex algorithm / adverse action boundary

If the system is used by or on behalf of a creditor in connection with credit decisions, ECOA / Regulation B adverse-action requirements may apply, including the need for specific, accurate reasons for adverse action. A complex algorithm cannot be used as an excuse for vague or generic denial reasons.

**Design implication:** The system must use traceable rule triggers and explainable reasons, not black-box scores.

**Reference:** CFPB Circular 2022-03, “Adverse action notification requirements in connection with credit decisions based on complex algorithms.”

---

## 3.3 TRID / Loan Estimate boundary

For covered mortgage transactions, a lender is legally required to provide a Loan Estimate once the consumer has submitted six pieces of information.

**Design implication:** The DSCR engine must not present its output as an official Loan Estimate unless operated inside a compliant creditor workflow.

**Reference:** CFPB, “What information do I have to provide a lender in order to receive a Loan Estimate?”

---

## 3.4 Rent-source discipline

Fannie Mae Selling Guide rental-income guidance references lease agreements, Form 1007, and Form 1025 as rental-income support documents in relevant contexts, and applies a 75% factor in specified qualifying contexts.

**Important caveat:** This is not automatically a private DSCR-loan rule. Use it as evidence that rent source, rent support, and income haircuts must be explicit and source-bound.

**Reference:** Fannie Mae Selling Guide B3-3.8-01, Rental Income.

---

## 3.5 Conservative LTV convention

For conservative acquisition analysis, calculate LTV using the lesser of purchase price or appraised value when both are available, unless the selected lender matrix defines LTV differently.

**Important caveat:** Use this as an internal conservative calculation convention, not as a universal DSCR lender rule.

---

# 4. Add New Section 0 — Advisor-Grade Operating Model

Insert the following near the very front of the master specification.

---

## 0. Advisor-Grade Operating Model

The DSCR engine must not be treated as a calculator. It must be built as a controlled financial-decision system.

Core operating principle:

```text
AI explains.
Deterministic formulas calculate.
Versioned lender matrices qualify.
Stress engines test survival.
Breakpoint solvers repair deals.
Audit logs prove every output.
```

The product standard is:

```text
Advisor-grade DSCR decision support.
Calculation-first.
Dual-ledger.
Stress-tested.
Breakpoint-solving.
Auditable.
Compliance-aware.
```

A basic DSCR calculator answers:

```text
What is rent divided by PITIA?
```

An advisor-grade DSCR decision-support engine answers:

1. Can this property likely qualify for DSCR financing?
2. Will the investor survive ownership stress?
3. Which variable breaks the deal?
4. What exact rent, price, rate, LTV, reserve, or expense change repairs it?
5. Which inputs are verified, estimated, stale, missing, or dangerous?
6. What recommendation is mathematically supported?
7. What compliance boundary prevents false advice, loan steering, or black-box credit decisions?

---

# 5. Four Non-Negotiable Rules

Add these rules to the design mandate.

---

## Rule 1 — Calculation First

No AI-generated math.

All numerical outputs must come from:

- explicit formulas,
- versioned lender matrices,
- user inputs,
- verified data sources,
- or labeled assumptions.

The AI layer may explain, summarize, compare, and translate outputs into plain language. It must not invent thresholds, lender rules, formulas, interest rates, eligibility requirements, or financial advice.

---

## Rule 2 — Dual Ledger

Separate the deal into two ledgers:

| Ledger | Purpose | Main Question |
|---|---|---|
| Lender Qualification Ledger | Tests financing fit | “Will a lender consider this under the selected matrix?” |
| Investor Survival Ledger | Tests real-world ownership viability | “Will this investor survive this deal?” |

This separation is essential because a deal can be:

- financeable but fragile,
- qualifies but dangerous,
- non-qualifying but economically strong,
- non-qualifying and structurally broken.

---

## Rule 3 — Stress-Tested

The engine must not stop at base DSCR.

It must run:

- base case,
- lender case,
- economic case,
- conservative case,
- severe case,
- breakpoint case,
- custom scenario case.

---

## Rule 4 — Auditable and Compliance-Aware

Every output must be traceable to:

- input value,
- input source,
- timestamp,
- formula version,
- matrix version,
- assumption label,
- calculation result,
- rule fired,
- recommendation template,
- human-review trigger.

The engine must not present itself as a lender, underwriter, financial adviser, tax adviser, attorney, CPA, or loan approval system unless operated inside a legally compliant supervised workflow.

---

# 6. Replace / Upgrade Architecture With 9 Modules

The existing system architecture should be updated to this module order:

```text
Advisor-Grade DSCR Decision Engine

1. Data Intake + Verification Layer
2. Dual-Ledger Normalization Layer
3. Deterministic Formula Engine
4. Lender Qualification Engine
5. Investor Survival Engine
6. Scenario + Stress-Test Engine
7. Breakpoint + Deal-Repair Engine
8. Recommendation + Human-Review Engine
9. Audit + Compliance Layer
```

Important: This does not replace the current core formulas. It clarifies execution order and separates raw inputs from controlled lender/investor ledgers before any formulas run.

---

# 7. Module 1 Upgrade — Data Intake + Verification Layer

Every input must be captured as a structured record.

## Input Record Schema

```json
{
  "field_name": "gross_rent",
  "value": 2400,
  "unit": "USD/month",
  "source": "user_provided",
  "confidence_label": "USER_PROVIDED",
  "trust_weight": 0.70,
  "timestamp": "2026-06-18T12:00:00Z",
  "source_date": "2026-06-18",
  "staleness_days": 0,
  "used_in": ["lender_ledger", "investor_ledger"],
  "assumptions": [],
  "warnings": []
}
```

## Input Confidence Labels

| Label | Meaning | Trust Weight |
|---|---|---:|
| `VERIFIED` | Signed lease, appraisal, tax record, insurance quote | 1.00 |
| `USER_PROVIDED` | Entered by user without documentation | 0.70 |
| `ESTIMATED` | Engine default or modeled assumption | 0.50 |
| `STALE` | Data older than permitted freshness window | 0.40 |
| `CONFLICTING` | Sources materially disagree | 0.30 |
| `MISSING` | Required input absent | 0.00 |

## Required Data Integrity Rules

- Do not silently substitute missing data.
- Do not silently correct user input.
- Show user-provided view and evidence-adjusted view separately.
- Halt or require human review when critical inputs are missing.
- Mark every estimate as an assumption.
- Every user-facing output must show which major inputs were verified vs. estimated.

---

# 8. New Module 2 — Dual-Ledger Normalization Layer

This is the most important structural upgrade.

## Purpose

Convert raw user inputs into two controlled ledgers before calculation:

1. Lender Qualification Ledger
2. Investor Survival Ledger
3. Delta Ledger

---

## 8.1 Lender Qualification Ledger

Used to answer:

```text
Does this appear to fit a selected DSCR lender matrix?
```

Inputs:

- gross rent,
- lender-accepted rent source,
- lender-accepted payment definition,
- PITIA or ITIA,
- loan amount,
- rate,
- term,
- LTV,
- FICO,
- property type,
- loan purpose,
- occupancy,
- entity vesting,
- state restrictions,
- lender matrix version.

Primary outputs:

```text
DSCR_Lender
Likely eligibility
Matrix gaps
Pricing tier, if matrix-supported
Human-review triggers
```

Important wording:

Use:

```text
Likely fits selected matrix
Conditionally fits selected matrix
Does not fit selected matrix
Unknown — matrix missing or stale
```

Do not use:

```text
Approved
Guaranteed qualified
Lender will approve
```

---

## 8.2 Investor Survival Ledger

Used to answer:

```text
Does this property survive real ownership?
```

Inputs:

- effective rent,
- vacancy,
- post-sale taxes,
- insurance,
- HOA,
- management,
- maintenance,
- CapEx reserve,
- turnover,
- repairs,
- reserves,
- liquidity,
- refinance risk,
- hold period,
- prepayment penalty,
- tax reassessment,
- insurance shock.

Primary outputs:

```text
Economic DSCR
Stress DSCR
Liquidity Survival Clock
Break-even vacancy
Break-even rent
Refinance risk
Deal repair options
```

---

## 8.3 Delta Ledger

The Delta Ledger is the diagnostic bridge between lender-world math and investor-world reality.

It compares:

```text
Lender DSCR vs Economic DSCR
Base DSCR vs Stress DSCR
Current loan terms vs repair terms
User rent vs verified rent
Current taxes vs post-sale taxes
Current reserves vs required reserves
IO payment vs amortizing/reset payment
Current insurance vs stress insurance
Current LTV vs matrix max LTV
```

This enables the flagship warning:

```text
Qualifies but Dangerous
```

## Delta Ledger Output Example

```json
{
  "lender_dscr": 1.24,
  "economic_dscr": 0.96,
  "stress_dscr": 0.81,
  "dscr_delta_lender_to_economic": -0.28,
  "dominant_delta": "post_sale_tax_and_capex_reserves",
  "qualifies_but_dangerous": true,
  "explanation": "The deal appears financeable under lender rent/PITIA math but fails investor survival after post-sale taxes, vacancy, CapEx, and management."
}
```

---

# 9. Module 3 Upgrade — Deterministic Formula Registry

All formulas should live in a formula registry, not inside free-form AI prompts.

## Formula Registry Entry Example

```json
{
  "formula_id": "DSCR_ECON_001",
  "version": "1.0.0",
  "name": "Economic DSCR",
  "equation": "(GrossRent * (1 - VacancyRate) - EconomicExpenses) / AnnualDebtService",
  "inputs": [
    "gross_rent",
    "vacancy_rate",
    "taxes",
    "insurance",
    "hoa",
    "management_fee",
    "maintenance",
    "capex_reserve",
    "turnover_cost",
    "annual_debt_service"
  ],
  "output_unit": "ratio",
  "gating_use": "investor_survival",
  "limitations": [
    "Depends on accuracy of rent, vacancy, expenses, reserves",
    "Does not include income-tax consequences",
    "Should not be interpreted as loan approval"
  ],
  "validation_tests": [
    "Zero vacancy increases numerator relative to nonzero vacancy",
    "Increasing annual debt service lowers DSCR",
    "Missing critical input triggers halt or human review"
  ]
}
```

## Core Formula Set To Preserve

Do not remove the existing formula library. Preserve and organize formulas under the registry:

1. Lender DSCR
2. Economic DSCR
3. PITIA
4. Monthly amortizing payment
5. Interest-only payment
6. Loan constant
7. LTV
8. Debt yield
9. Break-even rent
10. Break-even vacancy
11. Liquidity Survival Clock
12. Tax Shock DSCR
13. Insurance Shock DSCR
14. Vacancy Shock DSCR
15. CapEx Stress DSCR
16. IO Illusion Detector
17. Refinance Risk Meter
18. Required rent improvement
19. Required price reduction
20. Required LTV reduction
21. Required reserves
22. Assumption Confidence Score
23. Qualifies-but-Dangerous Detector
24. DSCR Fragility Score
25. Combined Stress DSCR

---

# 10. Formula Library Additions / Clarifications

## 10.1 Conservative LTV Convention

Use:

```text
LTV = Loan Amount / min(Purchase Price, Appraised Value)
```

For conservative acquisition analysis, use the lesser of purchase price or appraised value when both are available, unless the selected lender matrix defines LTV differently.

Important caveat:

```text
This is an internal conservative calculation convention, not a universal DSCR lender rule.
```

---

## 10.2 Economic DSCR Boundary

Economic DSCR must not double-count taxes, insurance, management, or reserves.

Use a clear expense boundary:

```text
Gross Scheduled Rent
- Vacancy / collection loss
= Effective Gross Income

Effective Gross Income
- Taxes
- Insurance
- HOA
- Management
- Repairs and maintenance
- CapEx / replacement reserve
- Turnover cost
= Stabilized Economic NOI

Economic DSCR = Stabilized Economic NOI / Annual Debt Service
```

Do not bury opportunity cost of equity inside DSCR. Track it separately as return-on-equity or opportunity-cost analysis.

---

## 10.3 Liquidity Survival Clock

Use:

```text
LSC = Liquid Reserves / Monthly Cash Drain Under Zero Occupancy
```

Where:

```text
Monthly Cash Drain = PITIA + Fixed Operating Expenses
```

Liquid reserves must exclude:

- retirement accounts unless immediately accessible and legally usable,
- home equity,
- other property equity,
- unsecured credit lines unless explicitly modeled as emergency borrowing.

---

# 11. Module 4 Upgrade — Lender Matrix Object

Do not hardcode lender rules. Create a versioned lender-matrix object.

## Lender Matrix Schema

```json
{
  "lender_id": "example_lender",
  "matrix_version": "2026-06-15",
  "source_document": "uploaded_pdf",
  "source_type": "lender_rate_sheet_or_guideline",
  "valid_from": "2026-06-15",
  "valid_until": "2026-07-15",
  "staleness_days": 3,
  "fico_bands": [],
  "ltv_bands": [],
  "dscr_minimums": [],
  "property_type_rules": [],
  "state_restrictions": [],
  "prepay_options": [],
  "interest_only_rules": [],
  "short_term_rental_rules": [],
  "reserve_requirements": [],
  "pricing_adjustments": [],
  "human_review_rules": []
}
```

## Lender Qualification Output

```json
{
  "lender_status": "likely_eligible",
  "dscr_lender": 1.23,
  "matrix_min_dscr": 1.20,
  "ltv": 0.75,
  "max_ltv": 0.75,
  "fico_band": "720-739",
  "pricing_tier": "matrix_tier_2",
  "matrix_version": "2026-06-15",
  "confidence": "matrix_verified",
  "warnings": []
}
```

## Stale Matrix Rule

If the matrix is missing or stale:

```text
Lender qualification cannot be confirmed because the lender matrix is missing or stale. Human review required.
```

Do not guess thresholds.

---

# 12. Module 5 Upgrade — Investor Survival Engine

The investor engine should never ask:

```text
Does it qualify?
```

It asks:

```text
Does it survive?
```

## Required Survival Tests

| Test | Purpose |
|---|---|
| Economic DSCR | Measures true retained-cash coverage |
| Stress DSCR | Tests bad-year performance |
| Tax Shock DSCR | Tests reassessed taxes |
| Insurance Shock DSCR | Tests premium increase |
| Vacancy Shock DSCR | Tests tenant-loss tolerance |
| CapEx Stress DSCR | Tests major repair event |
| Liquidity Survival Clock | Tests borrower reserve survival |
| Refinance Risk Meter | Tests maturity/refi failure |
| IO Illusion Detector | Tests payment cliff |
| Debt Yield | Tests rate-independent loan support |

## Investor Survival Score Upgrade

Replace blended weighted Investor Survival Score with a minimum-gate score:

```text
Investor Survival Score = min(
  DSCR Stress Subscore,
  Liquidity Subscore,
  Refinance Subscore,
  CapEx Subscore
)
```

Why:

```text
A fatal weakness in one survival dimension should not be hidden by strength in other dimensions.
```

Example:

```text
DSCR Stress Score: 82
Liquidity Score: 21
Refinance Score: 78
CapEx Score: 65

Investor Survival Score = 21
```

Output:

```text
The deal is not broadly safe because liquidity is the binding constraint.
```

---

# 13. Module 6 Upgrade — Scenario and Stress-Test Engine

Use named deterministic scenarios. Do not rely on Monte Carlo for gating decisions unless distributions and correlations are validated.

## Scenario Table

| Scenario | Rent | Vacancy | Taxes | Insurance | OpEx | Rate |
|---|---:|---:|---:|---:|---:|---:|
| Base | Verified/current | Base | Post-sale | Current quote | Current | Current |
| Conservative | -5% `[ASSUMPTION]` | +5 pts `[ASSUMPTION]` | Post-sale | +10% `[ASSUMPTION]` | +5% `[ASSUMPTION]` | Current |
| Severe | -10% `[ASSUMPTION]` | +10 pts `[ASSUMPTION]` | Post-sale | +25% `[ASSUMPTION]` | +10% `[ASSUMPTION]` | +200 bps `[ASSUMPTION]` |
| Custom | User-defined | User-defined | User-defined | User-defined | User-defined | User-defined |

All stress values are assumptions until calibrated against market, insurance, tax, or portfolio-loss data.

## Scenario Output Example

```text
Scenario        DSCR_E     Cash Flow/mo     LSC      Status
Base            1.18x      $320             14.2     Pass
Conservative    0.98x     -$75              8.1      Fragile
Severe          0.74x     -$690             3.2      Fail
```

---

# 14. Module 7 Upgrade — Breakpoint and Deal-Repair Engine

This is what upgrades the tool from diagnostic to advisor-grade decision support.

The engine should solve:

1. required rent,
2. required price reduction,
3. required loan reduction,
4. required LTV reduction,
5. required interest rate,
6. required reserves,
7. required expense reduction,
8. required insurance cap,
9. required tax appeal reduction,
10. required blended repair package.

## Required Rent Improvement

```text
Required Rent =
(Target DSCR × Annual Debt Service + Economic Expenses) / (1 - Vacancy)

Rent Gap =
Required Rent - Current Rent
```

## Required Loan Amount

```text
Max Annual Debt Service =
NOI / Target DSCR

Max Loan Amount =
Max Annual Debt Service / Loan Constant
```

## Required Price Reduction

```text
Max Purchase Price =
Max Loan Amount / Target LTV

Required Price Reduction =
Current Purchase Price - Max Purchase Price
```

## Required Reserves

```text
Required Reserves =
Target LSC × Monthly Zero-Occupancy Cash Drain

Reserve Gap =
Required Reserves - Current Liquid Reserves
```

## Required Rate

Solve numerically:

```text
DSCR_E(rate) = Target DSCR
```

Use binary search.

---

# 15. Deal-Repair Ranking Logic

Each repair option should be scored by:

```text
Repair Feasibility =
Mathematical Effect
× Practical Feasibility
× Confidence
× Side-Effect Penalty
```

## Repair Option Table

| Repair | Math Effect | Practical Feasibility | Side Effect | Verdict |
|---|---:|---:|---|---|
| Raise rent $400/mo | High | Low if above comps | Tenant / vacancy risk | Weak unless verified |
| Reduce price $35k | High | Medium | Negotiation risk | Strong |
| Lower LTV by 5% | Medium | Depends on liquidity | Cash drain | Conditional |
| Buy down rate | Medium | Depends on hold period | Points cost | Conditional |
| Use IO | High short term | Low | Payment cliff | Dangerous if it masks survival failure |

## Structural vs. Cosmetic Repairs

Prefer structural repairs:

- lower price,
- lower loan amount,
- verified higher rent,
- lower taxes,
- lower insurance,
- higher reserves.

Do not treat cosmetic repairs as true fixes:

- interest-only masking,
- ignoring management,
- ignoring CapEx,
- optimistic rent growth,
- excluding vacancy,
- assuming future refinance success without testing.

---

# 16. Module 8 Upgrade — Risk Diagnosis and Recommendation Engine

The recommendation engine must be rule-based, not AI-discretionary.

## Dominant Risk Driver

For each stress driver:

```text
DSCR Drop_k = DSCR_Base - DSCR_Stress_k
```

Then:

```text
Dominant Risk = argmax(DSCR Drop_k)
```

Example:

```text
Tax Shock:        -0.18x
Vacancy Shock:    -0.09x
Insurance Shock:  -0.04x
CapEx Shock:      -0.12x
Rate Shock:       -0.15x

Dominant Risk = Tax Shock
```

Output:

```text
The deal is primarily fragile because post-sale property taxes reduce DSCR by 0.18x, which is larger than the rate, vacancy, insurance, or CapEx shocks.
```

---

## Recommendation Classes

```text
Strong Deal
Good but Sensitive
Financeable but Fragile
Qualifies but Dangerous
Needs Lower Price
Needs Lower LTV
Needs Higher Verified Rent
Needs More Reserves
Needs Better Rate / Points Structure
Needs Verified Rent Data
Requires Human Review
Avoid Unless Terms Improve
```

## Recommendation Rule Examples

```pseudo
IF lender_status = pass
AND investor_status = pass
AND stress_dscr >= 1.00
AND LSC >= target_months
AND ACS >= 0.70
THEN recommendation = "Strong Deal"
```

```pseudo
IF lender_status = pass
AND economic_dscr < 1.00
THEN recommendation = "Qualifies but Dangerous"
```

```pseudo
IF ACS < 0.60
THEN recommendation = "Requires Human Review"
```

## Required Recommendation Format

Every recommendation must include:

```text
Decision:
Calculation basis:
Key risk:
Required improvement:
Confidence level:
Missing data:
Assumptions:
Human-review trigger:
Compliance notice:
```

---

# 17. Compliance-Aware Boundaries

The engine should describe itself as:

```text
DSCR decision-support software for educational, analytical, and workflow-support purposes.
```

It should not say:

- “You are approved.”
- “You should buy this property.”
- “This is the best loan.”
- “This lender will approve you.”
- “This is financial advice.”
- “This is tax advice.”
- “This is legal advice.”
- “This is a Loan Estimate.”

## Required Disclaimer

```text
This analysis is decision-support only.
It is not a loan approval, loan commitment, Loan Estimate, investment recommendation, legal advice, tax advice, or underwriting decision.
Actual lender qualification depends on current lender guidelines, pricing, credit review, appraisal, title, insurance, rent documentation, and final underwriting.
Consult licensed mortgage, legal, tax, and financial professionals before acting.
```

## TRID / Loan Estimate Boundary

For any covered mortgage transaction, the system must avoid presenting outputs as official Loan Estimates unless operated inside a compliant creditor workflow.

If the product collects information that may constitute a mortgage application in a covered transaction context, route to compliant creditor workflow or suppress any Loan-Estimate-style presentation.

---

# 18. Expanded Human-Review Triggers

Human review should be mandatory if:

- lender matrix is missing or stale,
- rent is unverified,
- tax rate is missing,
- insurance is estimated,
- DSCR is within 0.05x of a threshold,
- LTV is within 2.5% of max matrix LTV,
- economic DSCR < 1.00,
- stress DSCR < 1.00,
- liquidity runway < required months,
- interest-only structure creates post-IO failure,
- refinance break-even rate is near current rate,
- Assumption Confidence Score < 0.60,
- any protected-class or fair-lending-sensitive variable is requested or used,
- recommendation would affect credit eligibility,
- lender matrix conflicts with deal inputs,
- borrower reserves are illiquid or unverifiable,
- property type falls outside supported v1 scope,
- short-term-rental income is projected rather than historical,
- any output would be interpreted as loan approval, denial, steering, investment advice, legal advice, or tax advice.

---

# 19. Audit Trail Requirements

Every run should produce a machine-readable audit file.

## Audit Log Schema

```json
{
  "run_id": "uuid",
  "engine_version": "aegis_dscr_1.0.0",
  "formula_registry_version": "2026-06-18",
  "lender_matrix_version": "uploaded_2026-06-15",
  "timestamp": "2026-06-18T15:30:00Z",
  "inputs": [],
  "assumptions": [],
  "calculations": [],
  "stress_tests": [],
  "breakpoint_solutions": [],
  "recommendation_rules_fired": [],
  "human_review_triggers": [],
  "compliance_disclosures": [],
  "output_hash": "sha256_hash"
}
```

## Audit Checklist

```text
[ ] All inputs labeled by source and confidence.
[ ] All formulas versioned.
[ ] All assumptions displayed.
[ ] Lender matrix timestamped.
[ ] No stale matrix used silently.
[ ] DSCR_L and DSCR_E both shown.
[ ] Delta Ledger generated.
[ ] Stress scenarios computed.
[ ] Dominant risk driver identified.
[ ] Breakpoints solved.
[ ] Recommendation rule identified.
[ ] Human-review triggers shown.
[ ] Compliance disclosure appended.
[ ] Output reproducible from audit file.
[ ] Output hash generated.
```

---

# 20. Implementation-Ready Pseudocode

```python
def run_dscr_decision_engine(inputs, lender_matrix):
    audit = AuditTrail()

    # 1. Validate and label inputs
    verified_inputs = verify_and_label_inputs(inputs)
    audit.record("input_verification", verified_inputs)

    if has_missing_critical_inputs(verified_inputs):
        return halt_with_human_review("Missing critical inputs", audit)

    # 2. Build controlled ledgers
    lender_ledger = build_lender_ledger(verified_inputs)
    investor_ledger = build_investor_ledger(verified_inputs)

    audit.record("dual_ledger_created", {
        "lender_ledger": lender_ledger,
        "investor_ledger": investor_ledger
    })

    # 3. Run deterministic formulas
    lender_metrics = calculate_lender_metrics(lender_ledger)
    investor_metrics = calculate_investor_metrics(investor_ledger)

    audit.record("lender_metrics", lender_metrics)
    audit.record("investor_metrics", investor_metrics)

    # 4. Evaluate selected lender matrix
    lender_result = evaluate_lender_fit(
        lender_metrics,
        lender_matrix
    )

    audit.record("lender_qualification", lender_result)

    # 5. Evaluate investor survival
    survival_result = evaluate_investor_survival(
        investor_metrics,
        investor_ledger
    )

    audit.record("investor_survival", survival_result)

    # 6. Generate Delta Ledger
    delta_ledger = build_delta_ledger(
        lender_metrics=lender_metrics,
        investor_metrics=investor_metrics,
        lender_result=lender_result,
        survival_result=survival_result
    )

    audit.record("delta_ledger", delta_ledger)

    # 7. Run named scenarios and stress tests
    scenario_results = run_scenarios(investor_ledger)

    audit.record("stress_tests", scenario_results)

    # 8. Solve breakpoint and repair options
    repair_options = solve_breakpoints(
        lender_result=lender_result,
        survival_result=survival_result,
        investor_ledger=investor_ledger
    )

    audit.record("breakpoint_repairs", repair_options)

    # 9. Calculate assumption confidence
    confidence_result = calculate_assumption_confidence(verified_inputs)

    audit.record("assumption_confidence", confidence_result)

    # 10. Generate rule-based recommendation
    recommendation = generate_rule_based_recommendation(
        lender_result=lender_result,
        survival_result=survival_result,
        delta_ledger=delta_ledger,
        scenario_results=scenario_results,
        repair_options=repair_options,
        confidence_result=confidence_result
    )

    audit.record("recommendation", recommendation)

    # 11. Apply compliance wrapper and export audit log
    final_output = attach_disclosures_and_audit(
        recommendation=recommendation,
        audit=audit
    )

    return final_output
```

---

# 21. MVP Build Sequence

## MVP 1 — Calculation Core

Build:

- amortization,
- PITIA,
- DSCR_L,
- DSCR_E,
- NOI,
- LTV,
- debt yield,
- break-even rent,
- break-even vacancy,
- liquidity runway.

Goal:

```text
Replace basic DSCR calculator with dual-ledger calculation.
```

---

## MVP 2 — Stress and Scenario Layer

Add:

- tax shock,
- insurance shock,
- vacancy shock,
- CapEx shock,
- rate shock,
- IO cliff,
- combined stress scenario.

Goal:

```text
Detect fragile deals.
```

---

## MVP 3 — Breakpoint Solver

Add:

- required rent,
- required price,
- required LTV,
- required loan amount,
- required reserves,
- required rate.

Goal:

```text
Move from diagnosis to deal repair.
```

---

## MVP 4 — Lender Matrix Engine

Add:

- versioned lender matrices,
- matrix freshness control,
- FICO/LTV/DSCR rules,
- property-type rules,
- loan-purpose rules,
- state restrictions,
- prepay and IO rules.

Goal:

```text
Separate likely lender eligibility from mathematical survivability.
```

---

## MVP 5 — Audit and Compliance Layer

Add:

- audit JSON,
- formula registry,
- assumption registry,
- recommendation templates,
- compliance disclaimers,
- human-review triggers.

Goal:

```text
Make the system advisor-grade, reproducible, and defensible.
```

---

# 22. Final User-Facing Report Structure

Every user-facing report should follow this structure:

```text
1. Executive Decision
2. Lender Qualification Ledger
3. Investor Survival Ledger
4. Delta: Qualification vs Survival
5. Stress-Test Results
6. Dominant Risk Driver
7. Breakpoint Repair Map
8. Assumption Confidence
9. Human Review Triggers
10. Compliance Notice
11. Audit Summary
```

## Example Executive Decision

```text
Decision:
Qualifies but Dangerous.

Why:
The property appears to meet the lender DSCR threshold under the uploaded lender matrix, but it fails economic survival after vacancy, CapEx, management, and post-sale tax adjustment.

Key calculations:
Lender DSCR: 1.22x
Economic DSCR: 0.94x
Stress DSCR: 0.78x
Liquidity Survival Clock: 3.8 months

Dominant risk:
Post-sale tax reassessment reduces DSCR by 0.16x.

Required repair:
To reach Economic DSCR = 1.00x, the deal requires:
- $310/month higher verified rent, or
- $27,500 price reduction, or
- $21,400 lower loan amount, or
- $9,800 additional reserves to meet the liquidity target.

Confidence:
Moderate. Rent is verified, insurance is estimated, tax rate is user-provided.

Human review:
Required because Economic DSCR is below 1.00x and insurance is estimated.

Compliance:
This is decision-support analysis only, not a loan approval, Loan Estimate, investment recommendation, tax advice, or legal advice.
```

---

# 23. Do Not Add / Do Not Overwrite

The improvement agent must not:

- replace the existing full formula library with this shorter blueprint,
- remove Tax Shock DSCR,
- remove Insurance Shock DSCR,
- remove Vacancy Shock DSCR,
- remove CapEx Stress DSCR,
- remove IO Illusion Detector,
- remove Refinance Risk Meter,
- remove Liquidity Survival Clock,
- remove Qualifies-but-Dangerous Detector,
- remove the breakpoint solver,
- remove Assumption Confidence Score,
- replace deterministic rules with AI judgment,
- replace rule-based recommendations with open-ended LLM advice,
- present outputs as loan approvals,
- present outputs as investment advice,
- use Monte Carlo or probability outputs as gating logic unless validated.

---

# 24. Final Integration Instruction

Integrate this upgrade pack into the existing master specification as follows:

```text
1. Add Section 0: Advisor-Grade Operating Model.
2. Insert Module 2: Dual-Ledger Normalization Layer.
3. Add Delta Ledger as the diagnostic bridge.
4. Add Formula Registry requirement.
5. Add Input Record schema.
6. Add Lender Matrix schema.
7. Add conservative LTV convention using lesser of purchase price/appraised value.
8. Add rent-source discipline using Form 1007 / lease / verified rent support.
9. Add TRID / Loan Estimate boundary.
10. Expand human-review triggers.
11. Replace blended Investor Survival Score with minimum-gate score.
12. Add deal-repair ranking logic.
13. Add audit log schema with output hash.
14. Add MVP 1–5 build sequence.
15. Add final 11-part user-facing report structure.
```

Final product thesis:

```text
AEGIS DSCR is not a DSCR calculator.
It is advisor-grade DSCR decision-support infrastructure:
calculation-first, dual-ledger, matrix-aware, stress-tested, breakpoint-solving, audit-ready, and compliance-aware.
```

