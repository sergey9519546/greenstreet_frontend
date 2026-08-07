# AEGIS-DSCR Deterministic Core — Detailed “Keeps” Integration File

**Document purpose:** This file captures every item from the latest uploaded deterministic-core research that should be kept, upgraded, or integrated into the current AEGIS / Advisor-Grade DSCR master specification.

**Use this file as:** an upload-ready improvement document for an AI builder, product architect, quant engineer, or coding agent.

**Core decision:** Import the math, structure, registry discipline, validation tests, accounting-boundary rules, and diagnostic architecture. Do **not** import unsupported lender thresholds or market percentages as facts. Treat all thresholds, reserve floors, shock percentages, discounts, and matrix rules as assumptions unless backed by a current lender matrix or primary source.

---

## 0. Integration Verdict

The uploaded deterministic-core research is highly usable. It should become the **math backbone** of the AEGIS-DSCR engine.

It should be integrated under this master section:

```text
AEGIS-DSCR Deterministic Core Math Library vNext
```

This section should sit inside the larger product architecture:

```text
Advisor-Grade DSCR Decision Engine
├── Operating Model
├── Data Intake + Verification Layer
├── Dual-Ledger Normalization Layer
├── Deterministic Core Math Library  ← ADD THIS FILE HERE
├── Lender Qualification Engine
├── Investor Survival Engine
├── Delta Ledger / Risk Diagnosis Engine
├── Scenario + Stress-Test Engine
├── Breakpoint + Deal-Repair Engine
├── Recommendation + Human-Review Engine
└── Audit + Compliance Layer
```

The best contribution from the new research is not one isolated formula. The best contribution is a **complete, auditable deterministic math registry** with explicit formulas, validation tests, failure modes, ledger assignment, and accounting-boundary discipline.

---

# 1. Keep: Formula Registry Standard

## Why this is important

Every production formula must live in a versioned formula registry. Formulas should not live only in AI prompts, loose documentation, or scattered code. A formula registry makes the system auditable, testable, explainable, and version-controlled.

## Keep this requirement

Each formula must include:

```text
Formula ID
Formula version
Name
Ledger assignment
Equation
Expanded equation
Required inputs
Output unit
Accounting boundary
Gating use
Limitations
Assumptions
Validation test
Last calibrated date
```

## Required registry object format

```json
{
  "formula_id": "CORE-DSCR-E-001",
  "version": "1.0.0",
  "name": "Economic DSCR",
  "equation": "(EGI - OpEx_E) / ADS",
  "expanded": "[GSI × (1-v) - (T_postsale + Ins + HOA + Mgmt + Maint + CapEx + Turnover)] / (PI_mo × 12)",
  "inputs": [
    {"name": "GSI", "source_formula": "CORE-GSI-001"},
    {"name": "vacancy_rate", "min_floor": 0.05, "floor_source": "ASSUMPTION"},
    {"name": "T_postsale", "source_formula": "CORE-TAX-SHOCK-001"},
    {"name": "insurance", "source": "user_or_quote"},
    {"name": "HOA", "source": "user_or_document"},
    {"name": "management", "min_floor": "policy_default", "floor_source": "ASSUMPTION"},
    {"name": "maintenance", "min_floor": "policy_default", "floor_source": "ASSUMPTION"},
    {"name": "capex_reserve", "min_floor": "property_or_policy_default", "floor_source": "ASSUMPTION_OR_LENDER_MATRIX"},
    {"name": "turnover_cost", "default": "rent_monthly / 24", "floor_source": "ASSUMPTION"},
    {"name": "ADS", "source_formula": "CORE-ADS-001"}
  ],
  "output_unit": "ratio",
  "accounting_boundary": "denominator = P+I only; T/I/A in numerator",
  "ledger": "investor_survival",
  "gating_use": "investor_survival_gate",
  "limitations": [
    "Depends on accuracy of rent, vacancy, and expense inputs",
    "CapEx floor is not property-specific unless inspection or lender matrix is supplied",
    "Post-sale tax projection requires local assessment rules and effective tax rate"
  ],
  "validation_test": "Set all OpEx to zero and v to zero: result must equal GSI / ADS",
  "last_calibrated": "TBD"
}
```

## Production rule

The recommendation engine may not call a formula unless that formula exists in the registry and has passed its validation test.

---

# 2. Keep: Accounting-Boundary Discipline

## Why this is critical

This is one of the most important engineering rules in the entire DSCR engine.

The common implementation error is double-counting taxes, insurance, and HOA. This happens when the engine subtracts taxes/insurance/HOA from the numerator and also uses PITIA as the denominator.

## Keep this rule exactly

| Formula | Numerator | Denominator | Use |
|---|---|---|---|
| **DSCR_L** | Gross rent | PITIA | Lender qualification |
| **DSCR_E** | EGI − OpEx_E | ADS / P&I only | Investor survival |

## Required definition

```text
DSCR_L uses PITIA because lender-style DSCR often uses gross rent over total monthly housing payment.
DSCR_E uses ADS / P&I only because taxes, insurance, HOA, management, maintenance, CapEx, and turnover are already treated as economic expenses in the numerator.
```

## Required guardrail

No expense item may appear in both:

```text
numerator subtraction
AND
denominator components
```

## Required implementation assertion

```python
def validate_accounting_boundary(numerator_expenses, denominator_components):
    overlap = set(numerator_expenses.keys()) & set(denominator_components.keys())
    if overlap:
        raise AccountingBoundaryViolation(
            f"Double-counted items: {overlap}. "
            "Each expense must appear in numerator OR denominator, not both."
        )
```

## Final integration rule

This validation should fire **before** any DSCR_E calculation. It is not a report warning. It is a blocking calculation guard.

---

# 3. Keep: Dual-Ledger DSCR Separation

## Why this matters

The engine must preserve two separate worlds:

```text
Lender world: Does the deal fit the selected lender matrix?
Investor world: Does the property survive real ownership economics?
```

A property can pass the lender ledger while failing investor survival. That mismatch is the reason the AEGIS engine exists.

## Keep this language

```text
A deal can qualify under DSCR_L and still fail under DSCR_E.
That conflict is not an edge case. It is the core reason the engine exists.
```

## Keep these two core formulas

### DSCR_L — Lender DSCR

```text
DSCR_L = Monthly Gross Rent / PITIA_mo
```

or annualized:

```text
DSCR_L = GSI / (PITIA_mo × 12)
```

**Use:** lender-matrix comparison only.

**Do not use:** investor survival.

### DSCR_E — Economic DSCR

```text
DSCR_E = (EGI − OpEx_E) / ADS
```

Expanded:

```text
DSCR_E =
[GSI × (1 − vacancy)
− (post_sale_taxes + insurance + HOA + management + maintenance + CapEx + turnover)]
/ annual_debt_service
```

**Use:** investor survival.

**Do not use:** lender qualification unless a selected lender matrix specifically requires NOI-based underwriting.

---

# 4. Keep: GSI → EGI → NOI Income Chain

## Why this is useful

The uploaded file gives the engine a clean mathematical income sequence. Keep it as the starting point of the deterministic core.

```text
Contract Rent → GSI → EGI → NOI → DSCR variants
```

## 4.1 Gross Scheduled Income

**Registry:** `CORE-GSI-001 v1.0.0`

```text
GSI = Monthly Contract Rent × 12
```

**Measures:** theoretical maximum annual rental income at full occupancy.

**Required source discipline:** signed lease, rent schedule, Form 1007/Form 1025, or another documented rent source. User estimates should be accepted only with a confidence label.

**Failure modes:**

```text
- Rent entered with no verification
- STR projection treated as stabilized rent
- Inflated lease created before sale
- Above-market rent with weak comp support
```

**Validation test:**

```text
Monthly rent = $2,500 → GSI = $30,000
```

## 4.2 Effective Gross Income

**Registry:** `CORE-EGI-001 v1.0.0`

```text
EGI = GSI × (1 − Vacancy Rate) − Collection Loss
```

**Measures:** income actually expected after vacancy and collection loss.

**Investor ledger rule:** enforce a minimum vacancy floor as a policy assumption until better property/market data is available.

**Important caveat:** the exact vacancy floor is not a universal fact. It must be calibrated by property type, market, rent source, and deal history.

## 4.3 Net Operating Income

**Registry:** `CORE-NOI-001 v1.0.0`

```text
NOI = EGI − Operating Expenses
```

**Lender ledger:** may use lender-defined expenses or bypass formal NOI entirely if the lender matrix uses gross rent over PITIA.

**Investor ledger:** uses the full economic expense set.

---

# 5. Keep: Rent-Source Confidence and Discount Framework

## Why this is important

The same rent number should not be trusted equally if it comes from different sources. A signed lease, appraisal rent schedule, user guess, and STR projection do not have the same evidentiary value.

## Keep the framework

| Rent Source | Treatment | Confidence Label |
|---|---:|---|
| Signed lease with support | 0% discount | `VERIFIED` |
| Form 1007 / Form 1025 rent schedule | 0% discount | `VERIFIED` |
| User-provided estimate without documentation | Discount by policy default | `USER_PROVIDED` |
| STR projection without operating history | Higher discount by policy default | `ESTIMATED` |
| Conflicting sources | Use lower/conservative value or trigger review | `CONFLICTING` |
| Missing rent | Halt critical calculations | `MISSING` |

## Required implementation rule

```text
Rent-source adjustments are internal confidence controls, not universal lender rules.
```

## Required documentation

Every rent number must show:

```json
{
  "rent_value": 2500,
  "unit": "USD/month",
  "source": "Form 1007",
  "confidence_label": "VERIFIED",
  "discount_applied": 0,
  "used_in": ["lender_ledger", "investor_ledger"],
  "timestamp": "TBD"
}
```

---

# 6. Keep: Economic Operating Expenses

## Why this matters

The basic DSCR calculator ignores many ownership costs. The investor ledger must not.

## Keep this formula

**Registry:** `CORE-OPEX-E-001 v1.0.0`

```text
OpEx_E =
  Post-sale taxes
+ Insurance
+ HOA
+ Management
+ Maintenance
+ CapEx reserve
+ Turnover cost
+ Other required operating expenses
```

## Required expense categories

### Post-sale taxes
Use projected post-sale tax when applicable.

### Insurance
Use verified quote where available; otherwise label as estimated.

### HOA
Use disclosure or user-provided input. Special assessments should be flagged separately.

### Management
Include a management cost even if the owner intends to self-manage, unless the engine is explicitly running an owner-managed scenario. Self-management can be shown as a separate scenario, not the default survival case.

### Maintenance
Use property-specific data if available; otherwise use a labeled default.

### CapEx reserve
Use inspection/reserve study/property age where available. Fallback floors must be labeled assumptions or lender-matrix requirements.

### Turnover cost
Use local leasing cost or a labeled assumption.

## Required anti-manipulation guard

```text
User cannot set management, maintenance, vacancy, or CapEx to zero in the investor survival ledger without triggering a policy floor or human-review flag.
```

---

# 7. Keep: Post-Sale Tax Projection / Tax Shock

## Why this matters

Current taxes often reflect the seller’s basis or exemption status. The investor may face different taxes after acquisition. The engine should calculate the delta instead of assuming current taxes persist.

## Keep this formula

**Registry:** `CORE-TAX-SHOCK-001 v1.0.0`

```text
T_projected = Purchase Price × Effective Tax Rate
ΔT_shock = max(0, T_projected − T_current)
```

## Safer final wording

Use:

```text
DSCR after potential post-sale reassessment, where applicable by jurisdiction.
```

Do not use:

```text
DSCR after the nearly-certain tax reassessment in most U.S. jurisdictions.
```

## Required inputs

```text
Purchase price
Current annual taxes
Local effective tax rate or millage rate
Assessment ratio, if applicable
Exemption status
Investor vs owner-occupant status
Jurisdiction rule notes
```

## Required engine behavior

```text
If local tax rate or reassessment rule is missing, the engine must not silently estimate tax shock as fact.
It should output: Tax shock cannot be confirmed — human review or local tax lookup required.
```

## Validation test

```text
If Purchase Price × Effective Tax Rate = Current Taxes,
then ΔT_shock = 0 and Tax Shock DSCR = Economic DSCR.
```

---

# 8. Keep: Debt Service Formula Set

## Why this matters

The DSCR engine depends on exact debt math. These formulas should be in the deterministic core and validated with unit tests.

## 8.1 Monthly Amortizing Payment

**Registry:** `CORE-AMORT-001 v1.0.0`

```text
PI_mo = P × [r(1+r)^n] / [(1+r)^n − 1]
```

Where:

```text
P = loan principal
r = monthly interest rate
n = total number of monthly payments
```

## 8.2 Interest-Only Payment

**Registry:** `CORE-IO-001 v1.0.0`

```text
IO_mo = Loan Amount × Annual Rate / 12
```

## 8.3 PITIA

**Registry:** `CORE-PITIA-001 v1.0.0`

```text
PITIA_mo = PI_mo + Taxes_mo + Insurance_mo + HOA_mo
```

**Lender ledger:** may use current taxes if that is how the selected lender matrix treats the deal.

**Investor ledger:** should use post-sale projected taxes when applicable.

## 8.4 Annual Debt Service

**Registry:** `CORE-ADS-001 v1.0.0`

```text
ADS = PI_mo × 12
```

For interest-only period:

```text
ADS_IO = IO_mo × 12
```

## 8.5 Loan Constant

**Registry:** `CORE-LOAN-CONST-001 v1.0.0`

```text
Loan Constant = ADS / Loan Amount
```

or:

```text
k = 12 × r(1+r)^n / [(1+r)^n − 1]
```

**Engine use:** breakpoint solving, max loan amount, max purchase price, rate sensitivity, and refinance-risk analysis.

---

# 9. Keep: Lender DSCR as Matrix-Comparison Metric

## Registry

`CORE-DSCR-L-001 v1.0.0`

## Formula

```text
DSCR_L = Monthly Gross Rent / PITIA_mo
```

or:

```text
DSCR_L = GSI / (PITIA_mo × 12)
```

## Keep this rule

```text
DSCR_L exists only for lender-matrix comparison.
It must not be used to judge investment quality.
```

## Output wording

Use:

```text
Likely fits selected matrix
Conditionally fits selected matrix
Does not fit selected matrix
Unknown — matrix missing or stale
```

Avoid:

```text
Approved
Guaranteed eligible
Lender will approve
```

---

# 10. Keep: Economic DSCR as Investor-Survival Metric

## Registry

`CORE-DSCR-E-001 v1.0.0`

## Formula

```text
DSCR_E = (EGI − OpEx_E) / ADS
```

## Expanded formula

```text
DSCR_E =
[GSI × (1 − vacancy)
− (post-sale taxes + insurance + HOA + management + maintenance + CapEx + turnover)]
/ (PI_mo × 12)
```

## Keep this interpretation

```text
DSCR_E measures whether retained investor cash covers debt service after realistic ownership expenses.
```

## Required use

```text
Investor Survival Ledger
Qualifies-but-Dangerous Detector
Stress testing
Breakpoint repair
Dominant risk diagnosis
```

## Required validation

```text
With vacancy = 0 and OpEx_E = 0, DSCR_E must equal GSI / ADS.
This confirms that the denominator is ADS, not PITIA.
```

---

# 11. Keep: Stress DSCR Suite

## Why this matters

Base DSCR is not enough. The engine must calculate how quickly a deal breaks under named shocks.

## 11.1 Tax Shock DSCR

**Registry:** `CORE-DSCR-TS-001 v1.0.0`

```text
DSCR_TS = (EGI − OpEx_E − ΔT_shock) / ADS
```

## 11.2 Insurance Shock DSCR

**Registry:** `CORE-DSCR-IS-001 v1.0.0`

```text
DSCR_IS = (EGI − OpEx_E − ΔI_shock) / ADS
ΔI_shock = Current Insurance × Insurance Shock Multiplier
```

Shock multiplier is an assumption unless backed by regional insurance data or lender policy.

## 11.3 Vacancy Shock DSCR

**Registry:** `CORE-DSCR-V-001 v1.0.0`

```text
DSCR_V(v_shock) = [GSI × (1 − v_shock) − OpEx_fixed] / ADS
```

## 11.4 Break-Even Vacancy

```text
v_BE = 1 − (ADS + OpEx_fixed) / [GSI × (1 − management_rate)]
```

**Important interpretation:**

```text
v_BE ≤ 0 means the property cannot break even even at full occupancy.
This is a hard-fail diagnostic signal.
```

## 11.5 CapEx Stress DSCR

**Registry:** `CORE-DSCR-CAPEX-001 v1.0.0`

```text
DSCR_CapEx = [EGI − OpEx_E − (C_event / N_amort_months × 12)] / ADS
```

## 11.6 Combined Stress DSCR

**Registry:** `CORE-DSCR-COMBINED-001 v1.0.0`

```text
DSCR_combined =
[GSI × (1 − v − Δv) × (1 − δ_R)
− OpEx_E × (1 + δ_ex)
− ΔT_shock
− ΔI_shock]
/ [ADS × (1 + δ_ADS)]
```

## Required rule

```text
All shock parameters are assumptions until calibrated.
Users may create harsher custom shocks, but should not be allowed to soften the engine’s base/conservative scenario floors.
```

---

# 12. Keep: Debt Yield, With Corrected Threshold Treatment

## Registry

`CORE-DY-001 v1.0.0`

## Formula

```text
Debt Yield = NOI / Loan Amount
```

## Correct interpretation

```text
Debt Yield is expressed as a percentage, not as a DSCR-style x ratio.
```

## Keep as

```text
Rate-independent loan support metric
Refinance-risk side constraint
Commercial/institutional underwriting reference metric
```

## Do not keep as universal fact

```text
Most banks require 1.15x or 1.30x debt yield.
```

That language is likely confused with DSCR. Replace with:

```text
Debt-yield thresholds must come from lender matrix, institutional credit policy, or calibrated internal policy.
```

---

# 13. Keep: Liquidity Survival Clock

## Registry

`CORE-LSC-001 v1.0.0`

## Formula

```text
LSC = Liquid Reserves / Monthly Cash Drain at Zero Occupancy
```

## Monthly drain definition

```text
Monthly Cash Drain = PITIA_mo + Fixed OpEx_mo not already included in PITIA
```

## Accounting boundary

If PITIA already includes taxes and insurance, do not add taxes and insurance again as fixed operating expense.

## What it measures

```text
How many months the investor can fund the property at total vacancy before reserves are depleted.
```

## Keep this interpretation

```text
LSC measures solvency, not property coverage.
Two deals can have the same DSCR_E but radically different survival profiles if one borrower has 18 months of reserves and another has 2 months.
```

## Reserve classification

| Reserve Type | Treatment |
|---|---|
| Cash/checking/savings/money market | Count at face value if verified |
| Brokerage | Count only if policy allows; may haircut |
| Retirement accounts | Exclude or haircut per matrix/policy |
| HELOC capacity | Do not count as liquid reserves unless policy allows |
| Property equity | Do not count as liquid reserves |

## Required rule

```text
Only verified liquid reserves count at face value.
Non-liquid assets must be labeled separately and excluded or haircut according to the selected lender matrix or internal reserve policy.
```

---

# 14. Keep: Refinance Risk Meter / Break-Even Refi Rate

## Registry

`CORE-RRM-001 v1.0.0`

## Formula concept

Solve for the interest rate `r*` where:

```text
DSCR_E(r*) = DSCR_target
```

## Why it is good

This does not forecast rates. It identifies the rate at which the deal breaks. That is a structural fact about the deal.

## Required output

```text
This deal breaks if refinance rate exceeds X%.
```

## Required method

Use binary search / bisection over the amortization formula.

```python
r_low = 0.001
r_high = 0.25
tolerance = 0.0001

while (r_high - r_low) > tolerance:
    r_mid = (r_low + r_high) / 2
    PI_test = amortizing_payment(P, r_mid, n)
    DSCR_test = (EGI - OpEx_E) / (PI_test * 12)
    if DSCR_test > DSCR_target:
        r_low = r_mid
    else:
        r_high = r_mid

r_breakeven = (r_low + r_high) / 2
```

## Human-review trigger

```text
If r* is close to the current rate, the deal has little refinance headroom and must be reviewed.
```

Exact headroom threshold is an assumption or policy input.

---

# 15. Keep: Conservative LTV Convention

## Registry

`CORE-LTV-001 v1.0.0`

## Acquisition formula

```text
LTV = Loan Amount / min(Purchase Price, Appraised Value)
```

## Refinance formula

```text
LTV = Loan Amount / Appraised Value
```

## Correct framing

```text
For conservative acquisition analysis, use the lesser of purchase price or appraised value unless the selected lender matrix defines LTV differently.
```

## Appraisal gap warning

```text
If purchase price exceeds appraised value by more than the policy threshold, flag Appraisal Gap Warning.
```

The threshold must be policy-defined or lender-matrix-defined.

---

# 16. Keep: Cap Rate and Cash-on-Cash Return

## Cap Rate

**Registry:** `CORE-CAP-001 v1.0.0`

```text
Cap Rate = NOI / Property Value
```

**Use:** market-comparison metric, not lender qualification.

## Cash-on-Cash Return

**Registry:** `CORE-COC-001 v1.0.0`

```text
CoC = Annual Net Cash Flow / Total Cash Invested
```

Where:

```text
Annual Net Cash Flow = EGI − OpEx_E − ADS
Total Cash Invested = Down Payment + Closing Costs + Points + Prepaid Expenses + Funded Reserves
```

## Required rule

Do not calculate CoC using only down payment. Include closing costs, points, prepaid expenses, and funded reserves to avoid overstating return.

---

# 17. Keep: Interest-Only Illusion Detector

## Registry

`CORE-IOI-001 v1.0.0`

## Formula

```text
Cliff Ratio Φ = DSCR_E(IO) / DSCR_E(Amortizing)
```

```text
IO Payment Increase = (PI_amort − PI_IO) / PI_IO × 100
```

## What it measures

```text
How much the interest-only structure is masking the deal’s true amortizing economics.
```

## Required output

If IO is selected, the engine must display side-by-side:

```text
DSCR_E during IO period
DSCR_E after amortization/reset
Monthly IO payment
Monthly amortizing payment
Payment increase at IO expiration
Exact IO expiration date
```

## Required flags

```text
Moderate IO dependency
IO Illusion Alert
Hard IO Danger: amortizing DSCR_E fails while IO DSCR_E passes
```

Thresholds are assumptions until calibrated.

---

# 18. Keep: Breakpoint and Deal-Repair Formulas

## Why this matters

This is what turns the engine from a calculator into decision support. It answers what exact change repairs the deal.

## 18.1 Required Rent Improvement

**Registry:** `CORE-BE-RENT-001 v1.0.0`

```text
GSI_required = (DSCR_target × ADS + OpEx_E) / (1 − vacancy)
ΔR_monthly = (GSI_required − GSI_current) / 12
```

## 18.2 Required Price Reduction / Maximum Purchase Price

**Registry:** `CORE-BE-PRICE-001 v1.0.0`

```text
ADS_max = (EGI − OpEx_E) / DSCR_target
P_max = ADS_max / Loan Constant
V_max = P_max / Target LTV
Required Price Reduction = Current Purchase Price − V_max
```

## 18.3 Required LTV Reduction / Additional Down Payment

**Registry:** `CORE-BE-LTV-001 v1.0.0`

```text
P_max = ADS_max / Loan Constant
Additional Down Payment = max(0, Current Loan Amount − P_max)
New LTV = P_max / Current Value
```

## 18.4 Required Interest Rate

**Registry:** `CORE-BE-RATE-001 v1.0.0`

Solve numerically:

```text
DSCR_E(rate) = DSCR_target
```

## 18.5 Required Reserves

**Registry:** `CORE-BE-RESERVES-001 v1.0.0`

```text
Required Reserves = Target LSC Months × Monthly Cash Drain
Reserve Gap = max(0, Required Reserves − Current Liquid Reserves)
```

## 18.6 Points Breakeven Adjusted for Prepayment Penalty

**Registry:** `CORE-PTS-BE-001 v1.0.0`

```text
Points Cost = Loan Amount × Points Fraction
Monthly Savings = PI_mo(base_rate) − PI_mo(reduced_rate)
Basic Breakeven Months = Points Cost / Monthly Savings
Adjusted Breakeven = Basic Breakeven Months + (Prepay Penalty / Monthly Savings)
```

## Required output format

```text
Repair Option:
Required change:
Resulting DSCR_E:
Confidence:
Side effect:
Feasibility:
```

---

# 19. Keep: DSCR Fragility Score as Display Metric

## Registry

`CORE-FRAGILITY-001 v1.0.0`

## Method

For each stress driver:

```text
DSCR Drop_k = DSCR_E_base − DSCR_stress_k
```

Dominant risk:

```text
k* = argmax(DSCR Drop_k)
```

Composite score:

```text
Weighted Stress Loss = Σ(weight_k × DSCR Drop_k)
F_s = 100 × [1 − Weighted Stress Loss / DSCR_E_base]
```

Clamp to:

```text
0 to 100
```

## Keep this rule

```text
Fragility Score summarizes risk.
It does not make the decision.
The underlying stress DSCRs make the decision.
```

## Required display

```text
Fragility Score: 52 / 100
Dominant risk: Tax Shock
Stress loss table:
- Tax shock: -0.18x
- Vacancy shock: -0.09x
- Insurance shock: -0.04x
- CapEx shock: -0.12x
- Rate shock: -0.15x
```

---

# 20. Keep: Cash-Flow Sensitivity Gradient, but Defer to v2

## Registry

`CORE-SENSITIVITY-001 v1.0.0`

## Formula

```text
ε_k ≈ [NCF(x_k × 1.01) − NCF(x_k)] / [0.01 × NCF(x_k)]
```

## Use

This is useful for ranking sensitivity by rent, vacancy, rate, taxes, and insurance.

## v1 decision

Defer as a v2 feature. For v1, use the easier and more explainable metric:

```text
Dominant Risk = argmax(DSCR_Base − DSCR_Stress_k)
```

## Reason

Stress-loss tables are easier for users, loan officers, and compliance reviewers to understand than elasticity formulas.

---

# 21. Keep: Assumption Confidence Score

## Registry

`CORE-ACS-001 v1.0.0`

## Formula

```text
ACS = Σ(Input Weight × Input Trust Score) / Σ(Input Weight)
```

## Suggested input trust mapping

| Label | Trust Score |
|---|---:|
| `VERIFIED` | 1.00 |
| `USER_PROVIDED` | 0.70 |
| `ESTIMATED` | 0.50 |
| `STALE` | 0.40 |
| `CONFLICTING` | 0.30 |
| `MISSING` | 0.00 |

## Suggested importance weights

| Input | Weight |
|---|---:|
| Gross rent | 0.30 |
| Post-sale taxes | 0.20 |
| CapEx reserve | 0.15 |
| Vacancy rate | 0.15 |
| Insurance | 0.10 |
| Rate / terms | 0.10 |

All weights are assumptions until calibrated.

## Recommendation gate

```text
ACS ≥ 0.80: high confidence
0.60 ≤ ACS < 0.80: moderate confidence
ACS < 0.60: low confidence; suppress recommendation; human review required
```

## Required output

```text
Confidence: Moderate
ACS: 0.72
Low-confidence inputs: insurance, vacancy
Missing inputs: local effective tax rate
Recommendation enabled: yes, with caveats
```

---

# 22. Keep: Qualifies-but-Dangerous Detector

## Registry

`CORE-QBD-001 v1.0.0`

## Formula

```text
QbD = TRUE if:
    DSCR_L ≥ selected_matrix_min_DSCR
    AND (
        DSCR_E < 1.0
        OR Fragility Score < policy threshold
        OR LSC < policy threshold
    )
```

## Required wording

Use:

```text
This property appears to fit the selected lender matrix under current inputs.
However, the investor survival analysis indicates that real-world ownership stress reduces effective coverage to [DSCR_E]x.
Primary risk: [dominant risk].
This is a Qualifies-but-Dangerous condition.
Human review is required.
```

Avoid:

```text
This loan is approved.
This lender will approve.
This is a good investment.
You should proceed.
```

## Required classification

```text
Lender ledger passes + investor ledger fails = Qualifies but Dangerous
```

This is the flagship output.

---

# 23. Keep: Minimum-Gate Investor Survival Score

## Registry

`CORE-ISS-001 v1.0.0`

## Formula

```text
ISS = min(
  DSCR Stress Subscore,
  Liquidity Subscore,
  Refinance Subscore,
  CapEx Subscore
)
```

## Why this is better than weighted average

A weighted-average survival score can hide a fatal flaw. If liquidity is catastrophic, strong DSCR should not make the score look safe.

## Example

```text
DSCR Stress Score: 82
Liquidity Score: 21
Refinance Score: 78
CapEx Score: 65
Investor Survival Score = 21
```

## Required interpretation

```text
The weakest dimension controls the survival score.
A chain breaks at its weakest link.
```

## Use

Diagnostic display only. Do not let it replace the underlying gates.

---

# 24. Keep: Scenario Engine Parameters, With Assumption Labels

## Registry

`CORE-SCENARIO-001 v1.0.0`

## Scenario table

| Scenario | Rent | Vacancy | Taxes | Insurance | OpEx | Rate |
|---|---:|---:|---:|---:|---:|---:|
| Base | Verified/current | Base | Post-sale | Current quote | Current | Current |
| Conservative | -5% | +5 pts | Post-sale | +10% | +5% | Current |
| Severe | -10% | +10 pts | Post-sale | +25% | +10% | +200 bps |
| Custom | User-defined | User-defined | User-defined | User-defined | User-defined | User-defined |

## Required caveat

```text
All scenario parameters are assumptions until calibrated by market, property, insurance, tax, lender, or portfolio-loss data.
```

## Required guard

```text
Users may create custom harsher scenarios, but may not soften the system’s base/conservative scenario below policy floors.
```

---

# 25. Keep: Formula Dependency Map

## Why this matters

The dependency map makes implementation safer. It shows what formulas feed other formulas, preventing inconsistent or circular logic.

## Keep this dependency structure

```text
GSI
  → EGI
      → NOI
      → DSCR_E
      → Tax Shock DSCR
      → Insurance Shock DSCR
      → Vacancy Shock DSCR
      → CapEx Stress DSCR
      → Combined Stress DSCR

Tax Shock
  → DSCR_TS
  → DSCR_Combined
  → Investor PITIA

Economic OpEx
  → All investor-ledger DSCR variants

Amortizing Payment
  → PITIA
  → ADS
  → Loan Constant

Interest-Only Payment
  → IO Illusion Detector
  → PITIA_IO

PITIA
  → DSCR_L
  → LSC

Loan Constant
  → Price / loan / LTV breakpoint solver

Stress DSCRs
  → Fragility Score
  → Dominant Risk Driver

Input metadata
  → Assumption Confidence Score

DSCR_L + DSCR_E + Fragility + LSC
  → Qualifies-but-Dangerous Detector
```

## Required output

Include this dependency map in the technical appendix and keep it synchronized with formula IDs.

---

# 26. Keep: Validation Test Battery

## Why this matters

This is one of the highest-value additions. The uploaded file gives concrete tests, not generic validation language.

## Production validation battery

| Test ID | Test | Expected Result |
|---|---|---|
| V-01 | Amortization: P=$300k, r=7.25%, n=30yr | PI_mo approximately $2,048 |
| V-02 | IO: P=$300k, r=7.25% | IO_mo = $1,812.50 |
| V-03 | DSCR_L: Rent=$2,500/mo, PITIA=$2,200/mo | 1.136x |
| V-04 | User tries to zero out required expense floors | Engine rejects or applies floor |
| V-05 | Tax shock where projected tax equals current tax | ΔT = 0; DSCR_TS = DSCR_E |
| V-06 | Break-even vacancy plugged back into formula | DSCR_E = 1.000 ± 0.001 |
| V-07 | Required rent added back into GSI | DSCR_E = target ± 0.001 |
| V-08 | All combined-stress shocks set to zero | DSCR_combined = DSCR_E |
| V-09 | All fragility shocks set to zero | Fs = 100 or approaches 100 |
| V-10 | IO period = 0 | Cliff Ratio = 1.000 |
| V-11 | Liquid reserves = 0 | LSC = 0 |
| V-12 | Reserves = 12 × monthly drain | LSC = 12 |
| V-13 | Rent input = null | Engine halts with missing critical input |
| V-14 | Rent input is negative | Engine rejects input |
| V-15 | ACS with all verified inputs | ACS = 1.00 |
| V-16 | ACS with all missing inputs | ACS = 0.00; recommendations suppressed |
| V-17 | Taxes appear in both numerator and denominator | AccountingBoundaryViolation raised |
| V-18 | Non-liquid reserve asset counted at face value | Engine rejects, excludes, or haircuts per policy |

## Required rule

No formula enters production until its validation test passes.

---

# 27. Keep: Known Limitations

## Keep these limitations in the master doc

### 1. Lender matrices are not embedded facts

```text
Lender qualification requires a live, timestamped, selected lender matrix.
If the matrix is missing or stale, lender fit must output UNKNOWN and trigger human review.
```

### 2. Millage rates and reassessment rules are jurisdiction-specific

```text
Tax shock is a calculation only when the local tax inputs are correct.
If local tax rules are missing, the result must be labeled incomplete.
```

### 3. Reserve floors are policy defaults unless sourced

```text
Reserve floors should be property-specific where possible.
Use inspection, reserve study, lender matrix, property age, condition, and unit count before relying on default floors.
```

### 4. Fragility weights are uncalibrated

```text
Stress weights are assumptions until calibrated against loss/default/performance data.
```

### 5. STR projections need separate treatment

```text
Short-term rental projections are volatile and should not be treated like signed long-term lease income unless the selected matrix permits it and operating history supports it.
```

### 6. The engine cannot verify user truthfulness

```text
It can label, discount, and flag inputs, but cannot guarantee a user has not overstated rent, reserves, or expenses.
```

### 7. Probabilistic modeling is outside the deterministic core

```text
Monte Carlo or probability outputs may be added only as non-binding overlays with full assumptions and should not gate recommendations.
```

### 8. Decision support is not advice

```text
All outputs are conditional mathematical analysis, not investment advice, tax advice, legal advice, underwriting decision, loan approval, loan commitment, or Loan Estimate.
```

---

# 28. Keep: Red-Team / Adversarial Defense Logic

## Why this matters

The engine should be designed against manipulation, not merely for clean inputs.

## Keep these attack-defense pairs

| Attack | Defense |
|---|---|
| Inflated rent | ACS + rent-source discount + verified-rent requirement |
| Missing rent | Halt critical calculations |
| Pre-sale taxes | Tax shock projection |
| IO pass / amortizing fail | IO Illusion Detector + Reset-Safe DSCR |
| Zero vacancy | Vacancy floor |
| Zero management | Management floor or owner-managed warning scenario |
| Zero CapEx | CapEx floor or property-condition required input |
| Weak liquidity | LSC and reserve-gap solver |
| Stale lender matrix | Matrix staleness trigger |
| Black-box AI recommendation | Rule-based templates only |
| Double-counted taxes/insurance | Accounting-boundary validation |
| Non-liquid reserves | Exclude or haircut per policy/matrix |

---

# 29. Keep: Final Vector Output, Not One Scalar Score

## Why this matters

Do not collapse everything into one “deal score.” That hides fatal risks.

## Keep vector output

```text
D = [
  DSCR_L,
  DSCR_E,
  DSCR_Stress,
  IO Cliff Ratio,
  Break-Even Refi Rate,
  LSC,
  Fragility Score,
  ACS,
  QbD Flag
]
```

## Required classification logic

```text
Gate 1 — Lender eligibility:
  Uses selected lender matrix.

Gate 2 — Investor viability:
  Uses Economic DSCR, Stress DSCR, LSC, IO/Refi risk, and ACS.

If Gate 1 passes and Gate 2 fails:
  Qualifies but Dangerous.
```

---

# 30. Keep: Implementation Placement Map

Use this map when merging this file into the master spec.

| Keep Item | Where to Put It | Action |
|---|---|---|
| Formula registry IDs | Deterministic Formula Engine | Add |
| Accounting-boundary discipline | Deterministic Formula Engine / Guardrails | Add as mandatory |
| GSI / EGI / NOI | Income Formula Library | Add |
| OpEx_E | Investor Survival Ledger | Add |
| Post-sale tax projection | Stress Engine + Formula Library | Add |
| Amortization / IO / PITIA / ADS / Loan Constant | Debt Service Formula Library | Add |
| DSCR_L vs DSCR_E distinction | Dual-Ledger Architecture | Strengthen |
| Stress DSCR suite | Scenario + Stress Engine | Merge |
| LSC | Liquidity Module | Keep |
| Break-even refi rate | Refinance Risk Module | Keep |
| Conservative LTV | LTV Formula | Add with caveat |
| Debt Yield | Risk Metrics | Keep, fix thresholds |
| CoC | Investor Return Module | Keep |
| Breakpoint formulas | Deal Repair Engine | Add |
| Fragility score | Risk Dashboard | Keep as display |
| Sensitivity gradient | Roadmap / v2 | Defer |
| ACS | Data Confidence Engine | Keep |
| QbD | Delta Ledger + Recommendation Engine | Keep |
| Minimum-gate ISS | Survival Score | Replace blended ISS |
| Formula dependency map | Technical Appendix | Add |
| Validation test battery | QA / Model Validation | Add |
| Known limitations | Limitations Section | Merge |

---

# 31. Final Build Instruction for Next AI / Build Agent

Use this instruction when uploading this file for another improvement pass:

```text
Integrate this deterministic-core math library into the current AEGIS-DSCR master specification.
Keep all formulas, registry IDs, accounting-boundary rules, dependency maps, validation tests, and diagnostic logic.
Do not import unsupported thresholds as facts.
Convert all shock percentages, reserve floors, rent discounts, LSC thresholds, debt-yield thresholds, and lender-matrix values into assumptions, calibration defaults, or live-matrix variables.
Preserve the dual-ledger architecture: DSCR_L is for lender qualification; DSCR_E is for investor survival.
Preserve the Delta Ledger / Qualifies-but-Dangerous detector as the flagship diagnostic.
Preserve deterministic math as the only gating layer.
AI may explain outputs but must not invent calculations, lender rules, thresholds, or advice.
```

---

# 32. External Source Anchors for Future Fact-Checking

These sources should be used to support or calibrate the final master spec. Do not treat this section as a full citation library; it is a source anchor list for the next research pass.

## Fannie Mae Multifamily — Underwritten DSCR

Use to support institutional DSCR framing as Underwritten Net Cash Flow to annual debt service.

URL: https://mfguide.fanniemae.com/node/1541

## Fannie Mae Multifamily — Replacement Reserve

Use to support reserve treatment and the $250/unit/year multifamily reference, while preserving the caveat that SFR DSCR reserves need separate treatment.

URL: https://mfguide.fanniemae.com/node/3416

URL: https://mfguide.fanniemae.com/node/4101

## Fannie Mae Selling Guide — Rental Income / Forms 1007 and 1025

Use to support rent-source documentation discipline.

URL: https://selling-guide.fanniemae.com/sel/b3-3.8-01/rental-income

URL: https://selling-guide.fanniemae.com/sel/b4-1.2-01/appraisal-report-forms-and-exhibits

## OCC 2026 Model Risk Management Revised Guidance

Use to support governance, validation, monitoring, controls, and the decision not to use black-box scoring as the core.

URL: https://occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html

## CFPB Circular 2022-03 — Complex Algorithms and Adverse Action

Use to support the requirement for specific, accurate, traceable reasons when credit decisions or adverse-action contexts are involved.

URL: https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/

---

# 33. Final Bottom Line

Keep this deterministic-core research. It is the strongest math library layer produced so far.

The best usable additions are:

```text
1. Formula registry IDs
2. Accounting-boundary discipline
3. DSCR_L vs DSCR_E separation
4. GSI → EGI → NOI formula chain
5. Post-sale tax projection
6. Economic operating expense floors
7. Vacancy shock and break-even vacancy
8. Combined stress DSCR
9. Liquidity Survival Clock
10. Break-even refi rate
11. Breakpoint and repair formulas
12. Assumption Confidence Score
13. Qualifies-but-Dangerous detector
14. Minimum-gate Investor Survival Score
15. Formula dependency map
16. Validation test battery
17. Known limitations and anti-overclaim rules
```

The main rule:

```text
Import the math.
Import the structure.
Import the validation tests.
Do not import unsupported market thresholds as facts.
```
