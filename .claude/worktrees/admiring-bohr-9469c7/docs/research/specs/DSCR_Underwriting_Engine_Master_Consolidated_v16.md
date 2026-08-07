# DSCR Underwriting Engine — Master Consolidated Specification v16.0.0

**Document Type:** Consolidated audit, architecture, implementation, and regression specification  
**Prepared From:** Uploaded DSCR Engine v14.0.0 and v15.0.0 research/audit documents  
**Consolidation Date:** 2026-06-18  
**Status:** Master build document for engineering implementation  

> This document reorganizes, deduplicates, and upgrades the supplied v14/v15 material into one coherent production specification. It uses v15 as the decision baseline where v15 is more current or cleaner, but restores v14 content where v14 was more detailed: hand-verified scenarios, expanded test cases, deeper edge-case logic, full tax configuration, LLPA detail, stress scenarios, and numerical robustness rules.

---

## 0. Consolidation Analysis

### 0.1 Source Relationship

| Source | Role in Final Document | Key Value |
|---|---|---|
| **v14.0.0** | Detail reservoir | More complete formulas, expanded tests, hand-verified scenarios, full phase-based checklist, detailed tax YAML, detailed Monte Carlo hygiene. |
| **v15.0.0** | Decision baseline | Cleaner production posture, CFPB/ARM framing, institutional lender framing, stressed debt-service re-amortization, shorter priority order, updated configuration schema. |

### 0.2 What Was Kept

The following items were retained and promoted into the master specification:

1. **All critical bug fixes**: LTV denominator, NOI growth exponent, vacancy tornado labels, breakeven occupancy, IO max-loan notation.
2. **All logic flaws**: required DSCR risk stacking, tranched waterfall, §1031 boot taxation, ARM cap hierarchy, EGI vacancy/credit-loss modes.
3. **All risk controls**: anchor-rate staleness, external tax config, Monte Carlo underwater metric, IRR multi-root handling, refinance term-extension analysis, IO-to-amort AEY schedule, yield-maintenance PV calculation.
4. **All improvements**: LLPA extensions, lognormal rent model, CoC CapEx inclusion, max-loan solver, named stress scenarios, kill criteria, inverse-normal tail accuracy, stressed DS re-amortization.
5. **All architectural upgrades**: dimensional types, DSCR track formalization, unified cash-flow definition, DRY core math library.
6. **Testing suite**: v15 concise list plus v14 detailed unit tests and hand-verified scenarios.

### 0.3 What Was Reconciled or Corrected

| Conflict / Redundancy | Master Decision |
|---|---|
| v14 uses `min(100, vac + 5)` percentage style; v15 uses decimal style. | Standardize on decimal percentages in code (`0.05`) and display percentages only in UI. |
| v14 includes BUG-04 separately; v15 omits it. | Retain as a note under BUG-02 because it is fully subsumed by the NOI growth exponent bug. |
| v14 gives deeper §1031 debt-boot offset logic; v15 gives cleaner Form 8824 logic. | Use v15 net-boot structure, add v14 debt-boot offset edge case. |
| v14 gives detailed tax YAML; v15 summarizes. | Keep full tax YAML and mark future-year values as externally configurable. |
| v15 adds IMP-08 stressed DS re-amortization. | Promote into master priority order because it materially affects stress DSCR. |
| v14 gives more complete priority ordering; v15 gives tighter top-10. | Use a two-layer order: mandatory top-10 plus full backlog. |
| Source claims about tax and lender standards can become stale. | Add explicit staleness guards and external verification requirements. |

### 0.4 Product Principle

The engine must not behave like a casual calculator. It must behave like a **deterministic underwriting system** with:

- strict unit discipline,
- explicit lender-vs-investor tracks,
- traceable formulas,
- edge-case flags,
- configurable lender overlays,
- auditable tax logic,
- regression-tested outputs,
- transparent warnings whenever assumptions become stale.

---

# PART I — Operating Definitions and Conventions

## 1. Severity Scale

| Label | Meaning | Required Handling |
|---|---|---|
| 🔴 **BUG** | Mathematically incorrect; produces wrong output. | Fix before any production release. Add regression test. |
| 🟠 **FLAW** | Formula may be mathematically valid but applied to the wrong concept, definition, or underwriting context. | Fix before decision outputs are trusted. |
| 🟡 **RISK** | Edge case, stale assumption, brittle dependency, undefined variable, or silent failure condition. | Add guardrails, warnings, and tests. |
| 🔵 **IMP** | Accuracy, robustness, usability, or completeness improvement. | Implement after critical path is stable. |
| 🟢 **NEW** | Research-driven new finding or new market/tax/lender standard. | Externalize in config where possible. |

## 2. Rate and Unit Standard

**Engine-wide rule:** all math uses decimals, never UI-formatted percentages.

```python
annual_rate_decimal = 0.07      # 7.00%
monthly_rate = annual_rate_decimal / 12
annual_rate_percent = annual_rate_decimal * 100  # display only
```

### Required Dimensional Types

```typescript
class Rate {
  annual: number; // decimal, e.g. 0.07
  get monthly(): number { return this.annual / 12; }
  get display(): string { return `${(this.annual * 100).toFixed(3)}%`; }
}

type Frequency = "monthly" | "annual";

class CashFlow {
  value: number;
  frequency: Frequency;

  toAnnual(): CashFlow {
    return this.frequency === "monthly"
      ? new CashFlow(this.value * 12, "annual")
      : this;
  }

  toMonthly(): CashFlow {
    return this.frequency === "annual"
      ? new CashFlow(this.value / 12, "monthly")
      : this;
  }
}
```

**Forbidden:** raw `rate%`, ambiguous `7` vs `0.07`, or mixing monthly numerator with annual denominator.

---

# PART II — Core DSCR Tracks

## 3. Formal DSCR Track Definitions

| Track | Numerator | Denominator | Frequency | Primary Use Case | Rule |
|---|---|---|---|---|---|
| **Track 1 — Lender Qualifying DSCR** | Qualifying rent: lower of actual lease vs market rent when occupied | PITIA | Monthly | Standard DSCR loan qualification | `Qualifying_Rent_Monthly / PITIA_Monthly` |
| **Track 2 — Investor Survival DSCR** | NOI = EGI − OpEx, excluding debt service | ADS = annual debt service | Annual | True property-level debt coverage | `NOI_Annual / ADS_Annual` |
| **Track 3 — Stabilized DSCR** | Stabilized Year-N NOI, usually Year 3 after rehab/lease-up | ADS after recast or perm debt | Annual | Value-add, bridge-to-perm, repositioning | `Stabilized_NOI / Stabilized_ADS` |
| **All-In DSCR** | NOI | PI + Taxes + Insurance + HOA, annualized | Annual | Conservative lender/investor variant | `NOI / All_In_Housing_Cost` |

### Engine Enforcement

```python
class DSCRResult:
    track: Literal["TRACK_1", "TRACK_2", "TRACK_3", "ALL_IN"]
    numerator: CashFlow
    denominator: CashFlow

    @property
    def value(self):
        n = self.numerator.toAnnual()
        d = self.denominator.toAnnual()
        if d.value <= 0:
            return {"value": float("nan"), "flag": "NO_DENOMINATOR"}
        return {"value": n.value / d.value, "flag": "OK"}
```

**No cross-track comparison is allowed without explicit labeling.** A deal can pass Track 1 lender qualification while failing Track 2 investor survival.

---

# PART III — Critical Bugs

## BUG-01 — LTV Denominator Must Use `min()` for Purchases

### Incorrect Formula

```text
LTV = Loan_Amount / max(Appraised_Value, Purchase_Price)
```

### Correct Formula

```python
def value_for_ltv(transaction_type, appraised_value, purchase_price=None,
                  original_purchase_price=None, seasoning_months=None,
                  cash_out_and_low_seasoning=False):
    if transaction_type == "PURCHASE":
        return min(appraised_value, purchase_price)

    if transaction_type == "DELAYED_FINANCING" and seasoning_months is not None and seasoning_months < 6:
        return min(appraised_value, original_purchase_price)

    if transaction_type in ["RATE_TERM_REFI", "CASH_OUT_REFI"]:
        value = appraised_value
        if cash_out_and_low_seasoning and original_purchase_price is not None:
            value = min(value, original_purchase_price)
        return value

    raise ValueError("Unsupported transaction type")

LTV = Loan_Amount / Value_for_LTV
CLTV = (Loan_Amount + Subordinate_Debt) / Value_for_LTV
```

### Required Tests

```python
def test_ltv_purchase_low_appraisal():
    assert ltv(loan=400000, price=500000, appraisal=480000, type="PURCHASE") == 400000 / 480000


def test_ltv_purchase_low_contract_price():
    assert ltv(loan=375000, price=500000, appraisal=525000, type="PURCHASE") == 375000 / 500000
```

---

## BUG-02 — NOI Growth Exponent Off-by-One

### Incorrect Pattern

```text
Year3_NOI = Year1_NOI × (1 + g)^3
Exit_NOI = Year1_NOI × (1 + g)^hold
```

This treats Year 1 as Year 0. That pushes every projection one year too far forward.

### Correct Standard

**Convention:** `Year1_NOI` is the first full operating year.

```python
def noi_at_year(year1_noi: float, growth: float, year: int) -> float:
    if year < 1:
        raise ValueError("year must be >= 1")
    return year1_noi * (1 + growth) ** (year - 1)
```

### Apply To

- Track 3 stabilized DSCR
- Levered IRR cash-flow vector
- Unlevered IRR cash-flow vector
- Monte Carlo exit NOI
- Stress scenario NOI projections
- Refinance future NOI
- AEY projections

### Required Regression

```python
def test_year3_noi_growth():
    assert round(noi_at_year(100000, 0.03, 3), 2) == 106090.00
```

**BUG-04 is merged here:** levered IRR rent-growth off-by-one is the same defect and must be fixed through the single `noi_at_year()` function.

---

## BUG-03 — Vacancy Tornado Labels Were Swapped

### Correct Formula

```python
vac_best = max(0.0, vacancy_pct - 0.05)    # less vacancy = higher rent/DSCR
vac_worst = min(1.0, vacancy_pct + 0.05)   # more vacancy = lower rent/DSCR

DSCR_high = Rent * (1 - vac_best) / PITIA
DSCR_low = Rent * (1 - vac_worst) / PITIA
Swing = DSCR_high - DSCR_low
```

### UI Requirement

- Right/high side: **High DSCR / Low Vacancy / Best Case**
- Left/low side: **Low DSCR / High Vacancy / Worst Case**
- `Swing` must always be non-negative.

---

## BUG-05 — Breakeven Occupancy Must Include OpEx

### Incorrect Formula

```text
Breakeven_Occupancy = ADS / Potential_Gross_Income
```

### Correct Formula

```python
annual_opex = (
    Taxes + Insurance + HOA + Management + Repairs +
    Utilities + Reserves + Other_OpEx
)

Breakeven_Occupancy = (Annual_Debt_Service + annual_opex) / Potential_Gross_Income
```

### Flags

```python
if Potential_Gross_Income <= 0:
    flag = "NO_GROSS_RENT"
elif Breakeven_Occupancy > 1.0:
    flag = "STRUCTURALLY_UNVIABLE"
else:
    flag = "OK"
```

---

## BUG-06 — IO Max Loan Formula Must Use Decimal Rate

### Correct Formula

```python
annual_rate_decimal = user_input_rate_percent / 100

if annual_rate_decimal < 1e-8:
    Max_Loan_IO = float("inf")
else:
    Max_Loan_IO = (Max_PI_monthly * 12) / annual_rate_decimal
```

### Example

At 7.00% annual IO rate:

```text
$2,000 max monthly IO payment → $24,000 annual IO capacity
Max_Loan_IO = 24,000 / 0.07 = $342,857
```

Using `7` instead of `0.07` would create a 100× sizing error.

---

# PART IV — Logic Flaws

## FLAW-01 — Required DSCR Risk Factors Must Stack

### Problem

If each risk independently caps required DSCR at 1.10, then four risks still equal 1.10. That materially understates combined risk.

### Correct Additive Model

```python
def required_dscr(product_type_minimum, d):
    risk_adjustments = 0.0

    if d.ltv > 0.75: risk_adjustments += 0.05
    if d.ltv > 0.80: risk_adjustments += 0.05
    if d.property_type in ["STR", "CONDOTEL"]: risk_adjustments += 0.05
    if d.transaction == "CASH_OUT_REFI": risk_adjustments += 0.05
    if d.fico < 680: risk_adjustments += 0.05
    if d.fico < 660: risk_adjustments += 0.05
    if d.first_time_investor: risk_adjustments += 0.05
    if d.property_units >= 5: risk_adjustments += 0.05
    if d.declining_market_state: risk_adjustments += 0.05

    return min(1.30, product_type_minimum + risk_adjustments)
```

### Interpretation

- **1.30 ceiling**: above this, treat as structured/manual-exception underwriting rather than automated approval.
- Risk stacking affects eligibility, pricing, and warning severity.

---

## FLAW-02 — Waterfall Promote Must Be Tranched

### Problem

A cliff model applies the highest achieved promote split to all excess returns. That misallocates GP/LP economics.

### Correct Concept

The waterfall must fill sequential tranches and use **LP IRR**, not deal IRR, as the hurdle driver.

### Required Capital Account State

Each period must track:

- beginning unreturned capital,
- accrued preferred return,
- unpaid preferred return,
- distributions to pref,
- distributions to return of capital,
- promoted distributions,
- ending unreturned capital,
- LP IRR after distributions,
- GP promote by tranche.

### Pseudocode

```python
def tranched_waterfall(periodic_cash_flows, equity, tiers):
    # tiers sorted ascending by hurdle
    # example: [{"hurdle": 0.08, "gp_promote": 0.00},
    #           {"hurdle": 0.12, "gp_promote": 0.20},
    #           {"hurdle": 0.18, "gp_promote": 0.30}]

    state = init_capital_accounts(equity)

    for period, cash_available in enumerate(periodic_cash_flows, start=1):
        if cash_available <= 0:
            continue

        # 1. Pay unpaid pref / current pref according to tier rules.
        cash_available = distribute_pref(cash_available, state, tiers)

        # 2. Return capital.
        cash_available = return_capital(cash_available, state)

        # 3. Allocate excess sequentially by hurdle tranche.
        for tier in tiers:
            if cash_available <= 0:
                break
            tranche_amount = amount_until_lp_irr_reaches_next_hurdle(state, tier)
            distribution = min(cash_available, tranche_amount)
            gp_take = distribution * tier.gp_promote
            lp_take = distribution - gp_take
            record_distribution(state, lp_take, gp_take, tier)
            cash_available -= distribution

        # 4. Any residual above final hurdle uses final tier split.
        if cash_available > 0:
            final_promote = tiers[-1].gp_promote
            record_distribution(state, cash_available * (1 - final_promote), cash_available * final_promote, tiers[-1])

    return state
```

### Regression

```python
def test_tranched_waterfall_not_cliff():
    # GP must not get final promote percentage on all returns above first hurdle.
    assert gp_take != 0.40 * all_excess_above_8_percent
```

---

## FLAW-03 — §1031 Boot Tax Must Follow Net Boot and Recapture Sequence

### Problem

A proportional formula such as:

```text
Boot_tax = (cash_retained / capital_gain) × total_tax
```

is conceptually wrong.

### Correct Sequence

```python
Total_Realized_Gain = Sale_Price - Adjusted_Basis

Boot_Received = Cash_Received + Net_Debt_Relief + Non_Like_Kind_Property_FMV
Boot_Paid = Cash_Added + Net_Debt_Assumed
Net_Boot = max(0, Boot_Received - Boot_Paid)

Recognized_Gain = min(Total_Realized_Gain, Net_Boot)

Section_1250_Recapture = min(Recognized_Gain, Cumulative_Depreciation_Taken)
LTCG_Recognized = Recognized_Gain - Section_1250_Recapture

Recapture_Tax = Section_1250_Recapture * min(0.25, ordinary_rate)
LTCG_Tax = LTCG_Recognized * applicable_ltcg_rate
NIIT_Tax = Recognized_Gain * 0.038 if AGI > NIIT_threshold else 0
State_Tax = Recognized_Gain * state_capital_gains_rate

Boot_Tax_Total = Recapture_Tax + LTCG_Tax + NIIT_Tax + State_Tax

Deferred_Gain = Total_Realized_Gain - Recognized_Gain
Deferred_Recapture = Cumulative_Depreciation_Taken - Section_1250_Recapture

New_Basis = Basis_of_Replacement + Recognized_Gain + Additional_Cash_Paid - Boot_Received
```

### Debt Boot Edge Case

- Cash boot is taxable to the extent of recognized gain.
- Debt boot can be offset with additional cash contribution at purchase.
- Engine must include `additional_cash_to_offset_debt_boot` as an input and net it before recognized gain.

### Required Test

```python
def test_1031_recapture_first():
    realized_gain = 200000
    boot = 100000
    depreciation = 80000
    recognized = min(realized_gain, boot)
    recapture = min(recognized, depreciation)
    ltcg = recognized - recapture
    tax = recapture * 0.25 + ltcg * 0.15
    assert tax == 23000
```

---

## FLAW-04 — ARM Reset Must Apply Initial, Periodic, Lifetime Caps and Carryover

### Required Inputs

```yaml
arm:
  initial_rate: 0.055
  margin: 0.0275
  floor_rate: 0.0275
  initial_cap: 0.02
  periodic_cap: 0.01
  lifetime_cap: 0.05
  carryover_enabled: true
```

### Correct Reset Function

```python
def compute_arm_reset(prior_rate, index, margin, reset_number,
                      initial_cap, periodic_cap, lifetime_cap,
                      initial_rate, floor_rate=None,
                      carryover_enabled=False, carryover=0.0):
    target = index + margin
    target_with_carryover = target + carryover

    per_reset_cap = initial_cap if reset_number == 1 else periodic_cap

    lifetime_ceiling = initial_rate + lifetime_cap
    lifetime_floor = initial_rate - lifetime_cap

    capped = clamp(
        target_with_carryover,
        prior_rate - per_reset_cap,
        prior_rate + per_reset_cap
    )

    capped = clamp(capped, lifetime_floor, lifetime_ceiling)
    capped = max(capped, floor_rate if floor_rate is not None else margin)

    new_carryover = 0.0
    if carryover_enabled:
        new_carryover = max(0.0, target_with_carryover - capped)

    return capped, new_carryover
```

### Slow-Burn Rate Shock Detection

```python
r1, c1 = compute_arm_reset(initial_rate, index_y1, margin, 1, ...)
r2, c2 = compute_arm_reset(r1, index_y2, margin, 2, ..., carryover=c1)
r3, c3 = compute_arm_reset(r2, index_y3, margin, 3, ..., carryover=c2)

if (r3 - initial_rate) >= lifetime_cap * 0.80:
    flag = "SLOW_BURN_RATE_SHOCK"
```

---

## IMP-08 — Stressed Debt Service Requires Re-Amortization

### Problem

You cannot stress amortizing DS by simply adding bps to the old payment. The payment must be recalculated over the remaining term.

### Correct Formula

```python
Stressed_Annual_Rate = Reset_Rate
Stressed_Monthly_Rate = Stressed_Annual_Rate / 12

if Loan_Type == "INTEREST_ONLY":
    Stressed_Monthly_PMT = Remaining_Balance * Stressed_Monthly_Rate
else:
    Stressed_Monthly_PMT = Remaining_Balance * (
        Stressed_Monthly_Rate / (1 - (1 + Stressed_Monthly_Rate) ** (-Remaining_Months))
    )

Stressed_ADS = Stressed_Monthly_PMT * 12
Stressed_DSCR = Stressed_NOI / Stressed_ADS
```

---

## FLAW-05 — EGI Must Not Double-Count Vacancy and Collection Loss

### Mode A — Appraisal / Lender Standard

Use when lender or appraisal methodology provides combined vacancy and credit loss.

```python
EGI = PGI * (1 - combined_vacancy_credit_loss_pct) + Other_Income - Concessions
```

### Mode B — Granular Investor Standard

Use when physical vacancy and credit loss are modeled separately.

```python
Physical_Vacancy_Loss = GSR * physical_vacancy_pct
Effective_Gross_Rent = GSR - Physical_Vacancy_Loss
Credit_Loss = Effective_Gross_Rent * credit_loss_pct
EGI = Effective_Gross_Rent - Credit_Loss + Other_Income - Concessions
```

### Default Behavior

| Use Case | Default Mode |
|---|---|
| Track 1 lender DSCR | Mode A |
| Track 2 investor DSCR | Mode B if details exist; otherwise Mode A |
| Track 3 stabilized projections | Mode B |
| Monte Carlo | Mode B |

---

# PART V — Risk Controls

## RISK-01 — Anchor Rate Must Be Externalized

### Config

```yaml
market_data:
  anchor_rate: 0.06875
  anchor_rate_as_of: "2026-06-18"
  source: "manual" # manual | api | daily_feed
  staleness_warning_days: 7
  staleness_block_days: 30
```

### Runtime

```python
age_days = (now - anchor_rate_as_of).days

if age_days > staleness_block_days:
    raise PricingBlocked("Anchor rate stale; refresh required")
elif age_days > staleness_warning_days:
    warn("Anchor rate stale; pricing may be miscalibrated")
```

---

## RISK-02 — Tax Thresholds Must Be Configurable

Tax constants are not hardcoded. The engine loads tax-year configuration and warns when the requested year exceeds the last verified year.

### Tax Config Skeleton

```yaml
tax_year: 2026
last_verified: "2026-06-18"

qbi_section_199a:
  2025:
    threshold_mfj: 394600
    threshold_single: 197300
    phase_in_range_mfj: 100000
    phase_in_range_single: 50000
  2026:
    threshold_mfj: 403500
    threshold_single: 201750
    threshold_mfs: 201775
    phase_in_range_mfj: 150000
    phase_in_range_single: 75000
    minimum_deduction: 400
    minimum_qbi_threshold: 1000
    permanent: true

bonus_depreciation:
  rules:
    - acquired_before: "2025-01-20"
      placed_in_service_2025: 0.40
      placed_in_service_2026: 0.20
      placed_in_service_2027_plus: 0.00
    - acquired_after: "2025-01-19"
      rate: 1.00
      election_alternatives: [0.40, 0.60]

section_179:
  2025:
    deduction_cap: 2500000
    phaseout_threshold: 4000000
  2026:
    deduction_cap: 2500000
    phaseout_threshold: 4000000
    indexed: true

ltcg_brackets:
  source: "external_tax_config_required"

niit_threshold:
  mfj: 250000
  single: 200000
  indexed: false

section_1250_recapture_rate: 0.25
```

### Runtime Guard

```python
if tax_year > max(tax_config.years):
    warn(f"Tax year {tax_year} exceeds last updated config; using {max_year} values")
```

---

## RISK-03 — Monte Carlo `P(Underwater)` Must Be Defined

### Correct Simulation Step

```python
simulated_year_N_NOI = max(
    0,
    noi_at_year(base_year1_noi, sim_growth, hold_year) * occupancy_factor
)

simulated_exit_cap_rate = clamp(
    base_exit_cap + cap_rate_shock,
    0.01,
    0.25
)

simulated_property_value = simulated_year_N_NOI / simulated_exit_cap_rate
simulated_loan_balance = remaining_balance(loan, monthly_rate, term_months, hold_year * 12)

underwater_flag = simulated_property_value < simulated_loan_balance
P_underwater = mean(underwater_flag) * 100
```

### Required Distribution Assumptions

| Variable | Distribution | Guardrail |
|---|---|---|
| Rent | Lognormal | never negative |
| NOI | Lognormal or bounded correlated process | clamp at `>= 0` |
| Vacancy | Logit-normal or bounded beta | `[0, 1]` |
| Rate shocks | Gaussian | may be negative; clamp resulting rates if required |
| Exit cap | Gaussian shock with correlation to rates | `[0.01, 0.25]` |

---

## RISK-04 — IRR Must Handle No-Root and Multi-Root Cases

### Robust IRR Algorithm

```python
def robust_irr(cash_flows, lo=-0.99, hi=10.0, step=0.005):
    sign_changes = []
    r = lo
    prior = npv(cash_flows, r)

    while r < hi:
        r_next = r + step
        current = npv(cash_flows, r_next)
        if sign(current) != sign(prior):
            sign_changes.append((r, r_next))
        r = r_next
        prior = current

    if len(sign_changes) == 0:
        return {"irr": float("nan"), "status": "NO_ROOT"}

    roots = [brent(cash_flows, a, b) for a, b in sign_changes]

    if len(roots) > 1:
        positive_roots = [x for x in roots if x > 0]
        primary = min(positive_roots) if positive_roots else roots[0]
        return {
            "irr": primary,
            "status": "MULTIPLE_ROOTS",
            "all_roots": roots,
            "show_mirr": True
        }

    return {"irr": roots[0], "status": "OK"}
```

### MIRR Companion Metric

```python
def mirr(cash_flows, finance_rate, reinvest_rate):
    n = len(cash_flows) - 1
    fv_positive = sum(max(cf, 0) * (1 + reinvest_rate) ** (n - t) for t, cf in enumerate(cash_flows))
    pv_negative = sum(min(cf, 0) / (1 + finance_rate) ** t for t, cf in enumerate(cash_flows))
    if fv_positive <= 0 or pv_negative >= 0:
        return float("nan")
    return (fv_positive / -pv_negative) ** (1 / n) - 1
```

---

## RISK-05 — Refinance Break-Even Must Include Term Extension

### Required Outputs

```python
Cash_Flow_Payback_Months = refi_closing_costs / max(epsilon, monthly_payment_reduction)

Remaining_Interest_Current = sum(IPMT_current for remaining months on current loan)
Total_Interest_Refi = sum(IPMT_refi for full new loan term)
Net_Lifetime_Cost = Total_Interest_Refi - Remaining_Interest_Current + refi_closing_costs

Hold_Period_Current_Interest = sum(IPMT_current for expected_hold_months)
Hold_Period_Refi_Interest = sum(IPMT_refi for expected_hold_months)
Net_Hold_Period_Savings = Hold_Period_Current_Interest - Hold_Period_Refi_Interest - refi_closing_costs
```

### UI Requirement

Display all three:

1. **Cash-flow payback**
2. **Lifetime interest delta**
3. **Hold-period net savings**

A refinance may improve cash flow while increasing lifetime interest. The engine must not hide that tradeoff.

---

## RISK-06 — IO-to-Amort AEY Requires Full Debt-Service Schedule

```python
def compute_ds_schedule(loan, annual_rate, io_months, total_term_months):
    monthly_rate = annual_rate / 12
    ds_by_year = []

    monthly_io = loan * monthly_rate
    amort_months = total_term_months - io_months
    monthly_amort = pmt(loan, monthly_rate, amort_months) if amort_months > 0 else None

    for year_start in range(0, total_term_months, 12):
        months_in_year = min(12, total_term_months - year_start)
        io_in_year = max(0, min(io_months - year_start, months_in_year))
        amort_in_year = months_in_year - io_in_year

        ds = io_in_year * monthly_io
        if amort_in_year > 0:
            ds += amort_in_year * monthly_amort

        ds_by_year.append(ds)

    return ds_by_year
```

### Regression

```python
def test_io_to_amort_ds_continuity():
    schedule = compute_ds_schedule(500000, 0.07, 60, 360)
    assert schedule[4] == 500000 * (0.07 / 12) * 12
    assert schedule[5] > schedule[4]
```

---

## RISK-07 — Yield Maintenance Requires Monthly PV Calculation

### Correct Institutional Method

```python
def yield_maintenance(balance, note_rate, treasury_rate, remaining_months, min_pct=0.01):
    note_m = note_rate / 12
    treasury_m = treasury_rate / 12

    scheduled_pmt = pmt(balance, note_m, remaining_months)

    pv_payments = sum(
        scheduled_pmt / (1 + treasury_m) ** t
        for t in range(1, remaining_months + 1)
    )

    ym = max(0, pv_payments - balance)
    ym = max(ym, balance * min_pct) if min_pct else ym
    return ym
```

### Edge Case

If note rate is less than or equal to treasury rate, raw YM may be negative. Borrower does not receive a credit. Floor at zero before lender-specific minimum is applied.

---

# PART VI — Improvements and Additions

## IMP-01 — LLPA Grid Must Include Missing Adjustments

```yaml
llpa_adjustments:
  loan_amount_lt_75000: 0.0075     # +75 bps, may be +50 to +100 bps
  loan_amount_lt_150000: 0.0025
  loan_amount_gt_1500000: 0.0025   # may be +25 to +50 bps
  units_5_to_8: 0.0050
  ppp_waiver: 0.0050               # may be +50 to +75 bps
  rural_or_non_msa: 0.0025
  declining_market_state: 0.0025
  declining_market_ltv_haircut: -0.05
  short_term_rental: 0.0025        # may be +25 to +75 bps
  str_ltv_haircut: -0.05
  first_time_investor: 0.0025
  foreign_national: 0.0050         # may be +50 to +150 bps
  non_warrantable_condo: 0.0050
  vacant_refi_ltv_haircut: -0.05
```

**Rule:** LLPA must be external config, not code constants.

---

## IMP-02 — Monte Carlo Rent Should Be Lognormal

```python
def lognormal_params(mean, std_pct):
    sigma_squared = math.log(1 + std_pct ** 2)
    sigma = math.sqrt(sigma_squared)
    mu = math.log(mean) - sigma_squared / 2
    return mu, sigma

mu, sigma = lognormal_params(mean_rent, std_rent_pct)
simulated_rent = math.exp(normal_draw(mu, sigma))
```

Benefits:

- rent never becomes negative,
- expected rent remains anchored to mean,
- upside tail is more realistic than symmetric Gaussian rent.

---

## IMP-03 — Cash-on-Cash Must Include Value-Add CapEx

```python
Cash_Invested = (
    Down_Payment
    + Loan_Closing_Costs
    + Acquisition_Closing_Costs
    + Upfront_CapEx_Out_of_Pocket
    + Initial_Reserves_Above_Required
    - Seller_Credits
    - Lender_Credits
)

Upfront_CapEx_Out_of_Pocket = Total_Planned_Rehab - Rehab_Loan_Proceeds

CoC = (NOI_Year1 - ADS) / Cash_Invested
```

Use this same `Cash_Invested` definition for:

- CoC,
- equity multiple,
- bridge-to-perm,
- refinance recoup,
- LP/GP waterfall,
- Monte Carlo equity-at-risk.

---

## IMP-04 — Max Loan Solver Must Test Both IO and Post-IO Amortization

```python
def max_loan_dscr_constrained(rent_monthly, fixed_expenses_monthly,
                              annual_rate, term_months, io_months,
                              target_dscr, property_value, max_ltv):
    monthly_rate = annual_rate / 12
    amort_months = term_months - io_months

    max_monthly_ds = (rent_monthly / target_dscr) - fixed_expenses_monthly

    if max_monthly_ds <= 0:
        return 0

    max_loan_io = max_monthly_ds / monthly_rate if monthly_rate > 1e-8 else float("inf")

    amort_factor = monthly_rate / (1 - (1 + monthly_rate) ** (-amort_months))
    max_loan_amort = max_monthly_ds / amort_factor

    max_loan_ltv = property_value * max_ltv

    return min(max_loan_io, max_loan_amort, max_loan_ltv)
```

---

## IMP-05 — Add Named Stress Scenarios

```yaml
stress_scenarios:
  base:
    rent_change: 0.00
    rate_shock_bps: 0
    vacancy_delta: 0.00
    exit_cap_delta_bps: 0
    description: "Underwriting base case"

  recession:
    rent_change: -0.10
    rate_shock_bps: -100
    vacancy_delta: 0.05
    exit_cap_delta_bps: 75
    description: "GDP contraction, rising vacancy, Fed easing"

  stagflation:
    rent_change: -0.15
    rate_shock_bps: 200
    vacancy_delta: 0.05
    exit_cap_delta_bps: 150
    description: "Persistent inflation, higher rates, weaker demand"

  rate_shock_only:
    rent_change: 0.00
    rate_shock_bps: 300
    vacancy_delta: 0.00
    exit_cap_delta_bps: 100
    description: "Pure interest-rate shock"

  insurance_shock:
    rent_change: 0.00
    rate_shock_bps: 0
    insurance_premium_delta: 0.50
    description: "Insurance market repricing"

  natural_disaster:
    occupancy_disruption_months: 6
    repair_capex_pct_of_value: 0.05
    description: "Property uninhabitable for six months"

combined_worst:
  method: "max_severity_each_dimension"
  description: "Most punitive dimension selected from all scenarios; not an average"
```

---

## IMP-06 — Expanded Kill Criteria

```python
KILL_CRITERIA = [
    ("DSCR < 0.75", lambda d: d.dscr < 0.75),
    ("LTV > 80%", lambda d: d.ltv > 0.80),
    ("FICO < 620", lambda d: d.fico < 620),
    ("Loan amount < $75,000", lambda d: d.loan_amount < 75000),
    ("Cash-out refi seasoning < 6 months", lambda d: d.transaction == "CASH_OUT_REFI" and d.title_seasoning_months < 6),
    ("BK discharge < 2 years", lambda d: d.bk_months_ago < 24),
    ("Foreclosure < 3 years", lambda d: d.foreclosure_months_ago < 36),
    ("Short sale / DIL < 2 years", lambda d: d.short_sale_months_ago < 24),
    ("Recent mortgage lates", lambda d: d.recent_mortgage_lates_exceed_policy),
    ("Property condition C5/C6", lambda d: d.property_condition in ["C5", "C6"]),
    ("Rural + non-warrantable condo", lambda d: d.rural and d.non_warrantable_condo),
    ("Insufficient reserves", lambda d: d.reserves_months < 3),
    ("Unsupported vesting/entity", lambda d: d.vesting in ["TRUST_COMPLEX", "FOREIGN_LLC"]),
]
```

Kill criteria must return:

```json
{
  "result": "KILL",
  "criteria_triggered": ["DSCR < 0.75", "Insufficient reserves"],
  "override_possible": false,
  "manual_review_reason": null
}
```

---

## IMP-07 — Inverse Normal CDF Tail Accuracy

### Requirement

Use Peter Acklam’s inverse normal CDF approximation in tails and/or across the full curve.

```python
def inv_norm_cdf(p):
    if p <= 0 or p >= 1:
        raise ValueError("p must be in (0, 1)")

    if p < 1e-9 or p > 1 - 1e-9:
        warn("Tail probability near machine precision; result truncated")

    return acklam_inverse_normal(p)
```

Use in:

- 99th percentile stress,
- Monte Carlo tail metrics,
- VaR-style downside analytics,
- probability-to-z-score conversions.

---

# PART VII — Numerical Robustness

## ROB-01 — PMT and Balance Near Zero Rate

```python
EPSILON = 1e-8

def payment_factor(rate, n):
    if abs(rate) < EPSILON:
        return 1.0 / n
    return rate / (1 - (1 + rate) ** (-n))


def pmt(principal, rate, n):
    return principal * payment_factor(rate, n)


def future_value_factor(rate, n):
    if abs(rate) < EPSILON:
        return n
    return ((1 + rate) ** n - 1) / rate


def remaining_balance(principal, rate, term, at_month):
    if abs(rate) < EPSILON:
        return principal * (1 - at_month / term)
    payment = pmt(principal, rate, term)
    return principal * (1 + rate) ** at_month - payment * future_value_factor(rate, at_month)
```

---

## ROB-02 — Safe Division and Negative Equity

```python
def safe_leverage(debt, value):
    equity = value - debt
    if equity <= 0:
        return {"value": float("inf"), "flag": "UNDERWATER"}
    if equity < value * 0.01:
        return {"value": debt / equity, "flag": "DE_MINIMIS_EQUITY"}
    return {"value": debt / equity, "flag": "OK"}


def safe_breakeven_occupancy(ads, opex, pgi):
    if pgi <= 0:
        return {"value": float("nan"), "flag": "NO_GROSS_RENT"}
    result = (ads + opex) / pgi
    if result > 1:
        return {"value": result, "flag": "STRUCTURALLY_UNVIABLE"}
    return {"value": result, "flag": "OK"}
```

---

## ROB-03 — Monte Carlo Hygiene

```python
def box_muller_safe(rng):
    while True:
        u1 = rng.uniform()
        u2 = rng.uniform()
        if u1 > 1e-15:
            break
    z0 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
    z1 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2)
    return z0, z1


def antithetic_pair(z, std_dev, mean):
    if std_dev <= 0:
        return mean, mean
    return mean + z * std_dev, mean - z * std_dev


def halton(i, base):
    if i < 1:
        i = 1
    f = 1.0
    r = 0.0
    while i > 0:
        f = f / base
        r = r + f * (i % base)
        i = math.floor(i / base)
    return r
```

---

# PART VIII — Industry Defaults and Pricing Matrix

## NEW-01 — DSCR Loan Default Assumptions

| Parameter | Master Default | Notes |
|---|---:|---|
| Minimum FICO floor | 620–640 | Product-specific; best pricing typically requires higher. |
| Standard reserves | 6 months PITIA | 6–12 months in more conservative overlays. |
| Standard minimum DSCR | 1.10–1.25 | 1.25 best pricing; 1.00–1.10 weaker tier. |
| Sub-1.00 DSCR | Limited eligibility | Requires lower LTV and often investor experience. |
| Max purchase LTV | 80% | Some high-FICO/sub-$1M overlays may be higher; config-driven. |
| Max cash-out LTV | 70–75% | Seasoning-sensitive. |
| Qualifying rent | Lower of actual or market | Occupied property rule. |
| STR LTV haircut | −5% | Overlay, property-type dependent. |
| Vacant refi haircut | −5% | Overlay, lender-dependent. |

---

## NEW-02 — DSCR Tier Pricing Matrix

```yaml
dscr_tier_pricing:
  - dscr_min: 1.25
    ltv_max_purchase: 0.80
    rate_adj_bps: 0
    label: "Excellent — best pricing"

  - dscr_min: 1.10
    dscr_max: 1.249
    ltv_max_purchase: 0.80
    rate_adj_bps: 25
    label: "Standard"

  - dscr_min: 1.00
    dscr_max: 1.099
    ltv_max_purchase: 0.75
    rate_adj_bps: 75
    label: "Breakeven"

  - dscr_min: 0.75
    dscr_max: 0.999
    ltv_max_purchase: 0.75
    rate_adj_bps: 150
    requires_experience: true
    experience_requirement: "12+ months investment property ownership within last 3 years"
    label: "Sub-1.0 — limited eligibility"

  - dscr_max: 0.749
    action: "KILL"
    label: "Below minimum coverage"
```

---

# PART IX — Tax Compliance Module

## NEW-03 — OBBBA-Aware Tax Rules

### Engine Requirements

1. Bonus depreciation is date-sensitive. Check **acquisition date** and **placed-in-service date**.
2. The Jan. 19/Jan. 20, 2025 discontinuity must be modeled explicitly.
3. QBI/§199A thresholds and phase-in ranges must be tax-year configurable.
4. Section 179 limits and phaseouts must be tax-year configurable.
5. NIIT thresholds are not indexed by default.
6. §1250 recapture must be applied before LTCG in recognized boot gain.

### Tax Output Structure

```json
{
  "tax_year": 2026,
  "bonus_depreciation_rate": 1.0,
  "bonus_depreciation_reason": "Qualified property acquired after 2025-01-19",
  "section_179_available": true,
  "section_179_limit": 2500000,
  "qbi_threshold_used": 403500,
  "warnings": [
    "Tax estimates are model outputs, not tax advice",
    "Verify current-year IRS thresholds before filing"
  ]
}
```

---

# PART X — Architecture

## ARCH-01 — Single Core Math Library

All calculations must call shared functions. No copied PMT, IRR, LTV, NOI, or DSCR formulas in UI components.

```typescript
// engine/core/finance.ts

export function pmt(principal: number, annualRate: number, termMonths: number): number;
export function remainingBalance(principal: number, annualRate: number, termMonths: number, atMonth: number): number;
export function noiAtYear(year1Noi: number, growth: number, yearIndex: number): number;
export function dscrMonthly(rentMonthly: number, pitiaMonthly: number): number;
export function dscrAnnual(noiAnnual: number, adsAnnual: number): number;
export function npv(cashFlows: number[], rate: number): number;
export function irr(cashFlows: number[]): IRRResult;
export function mirr(cashFlows: number[], financeRate: number, reinvestRate: number): number;
export function yieldMaintenanceMonthly(args: YieldMaintenanceArgs): number;
```

---

## ARCH-02 — Unified Cash Flow Definition

```python
CF_BeforeTax_Annual = NOI_Annual - ADS_Annual

CF_BeforeTax_AllIn_Annual = NOI_Annual - (PI_Annual + Taxes + Insurance + HOA)

CF_AfterTax_Annual = (
    CF_BeforeTax_Annual
    - Taxable_Income * marginal_tax_rate
    + Depreciation_Shield
)
```

Use across:

- CoC,
- stress test verdicts,
- Monte Carlo `P(negative CF)`,
- refinance comparison,
- LP/GP waterfall,
- hold-period analysis.

---

## ARCH-03 — Configuration Structure

```yaml
version: "16.0.0"
as_of: "2026-06-18"

market:
  anchor_rate: 0.06875
  anchor_rate_as_of: "2026-06-18"
  source: "daily_feed"
  staleness_warning_days: 7
  staleness_block_days: 30

tax:
  year: 2026
  config_file: "tax_2026_obbba.yaml"
  warn_if_future_year: true

dscr:
  min_fico: 640
  absolute_fico_floor: 620
  qualifying_rent_method: "lower_of_actual_or_market"
  default_reserves_months: 6
  min_reserves_months: 3
  purchase_ltv_basis: "min_of_price_or_appraisal"
  refi_ltv_basis: "appraisal"
  cashout_seasoning_min_months: 6
  ltv_cashout_max: 0.75

pricing:
  llpa_grid: "llpa_2026.json"
  dscr_tier_grid: "dscr_tiers_2026.yaml"
  kill_criteria: "kills_2026.yaml"

stress:
  scenarios_file: "stress_scenarios.yaml"
  combined_worst_method: "max_severity_each_dimension"

monte_carlo:
  iterations: 10000
  rent_distribution: "lognormal"
  cap_rate_correlation_with_rates: 0.5
  rates_rent_correlation: -0.3
  halton_min_index: 1
```

---

# PART XI — Testing and Regression

## TEST-01 — Mandatory Unit Tests

```python
# Zero / near-zero rate
test_pmt_zero_rate: pmt(100000, 0, 360) == 100000 / 360
test_pmt_micro_rate: pmt(100000, 1e-10, 360) ≈ 100000 / 360 ± 0.01

# Extreme terms
test_pmt_short_term: pmt(100000, 0.07, 12) ≈ 8652.67
test_pmt_long_term: pmt(100000, 0.07, 480) ≈ 627.13

# DSCR kill thresholds
test_dscr_kill: deal_with_dscr(0.749) → KILL
test_dscr_pass: deal_with_dscr(0.751) → no kill unless other criteria trigger

# Growth exponent
test_year3_noi_growth: noi_at_year(100000, 0.03, 3) == 106090.00

# LTV
test_ltv_purchase_low_appraisal:
  LTV(loan=400000, purchase=500000, appraisal=480000, type=PURCHASE)
  == 400000 / 480000

# Waterfall
test_tranched_waterfall:
  GP does not get final promote split on all distributions above first hurdle

# 1031
test_1031_recapture_first:
  realized_gain=200K, boot=100K, depreciation=80K
  → recognized=100K, recapture=80K, LTCG=20K
  → federal tax before NIIT/state = 23K

# ARM
test_arm_periodic_cap_binds:
  initial_rate=5%, caps=2/1/5, index shock +3%
  → first reset <= 7%
  → second reset <= 8%
  → never > 10%

# IO to amortization
test_io_to_amort_ds_continuity:
  loan=500K, rate=7%, IO=60mo, term=360mo
  → year 5 DS = IO × 12
  → year 6 DS > year 5 DS

# IRR
test_irr_multiple_roots:
  cash_flows=[-1000, 3000, -2200]
  → status == MULTIPLE_ROOTS
  → MIRR displayed

# Monte Carlo
test_mc_underwater_metric_defined:
  p_underwater in [0, 100]
  p_underwater is not NaN

# Lognormal rent
test_lognormal_rent_never_negative:
  all(simulated_rent > 0)

# OBBBA tax
test_bonus_depreciation_2026:
  acquired_after=2025-01-19, qualified_property=True
  → bonus_rate=1.0 unless election-out selected
```

---

## TEST-02 — Hand-Verified Scenarios

### Scenario 1 — Vanilla SFR Purchase

```yaml
purchase_price: 300000
appraisal: 310000
down_payment_pct: 0.25
loan_amount: 225000
rate: 0.0725
term_months: 360
rent_monthly: 2400
taxes_annual: 3600
insurance_annual: 1800
hoa_monthly: 0
```

Expected:

```text
LTV = 225000 / 300000 = 75.0%
PI_monthly ≈ 1535.05
PITIA_monthly = 1535.05 + 300 + 150 = 1985.05
Track 1 DSCR = 2400 / 1985.05 = 1.209
```

Investor view example:

```text
NOI_annual = 2400 × 12 × 0.95 − 7200 OpEx − 1800 insurance − 3600 taxes
NOI_annual = 14640
ADS_annual = 1535.05 × 12 = 18420.60
Track 2 DSCR = 14640 / 18420.60 = 0.795
```

Interpretation: passes lender-like Track 1 threshold near 1.20, but investor Track 2 is weak and may trigger survival warning.

---

### Scenario 2 — Value-Add Bridge-to-Perm

```yaml
purchase_price: 200000
rehab_budget: 80000
rehab_financed: 60000
year1_noi_post_stabilization: 32000
growth: 0.03
hold_years: 5
exit_cap: 0.065
```

Expected:

```text
Year 3 NOI = 32000 × (1.03)^2 = 33948.80
Year 5 Exit NOI = 32000 × (1.03)^4 = 36016.85
Exit Value = 36016.85 / 0.065 = 554105
```

---

### Scenario 3 — §1031 Exchange with Partial Boot

```yaml
sale_price: 1000000
adjusted_basis: 400000
cumulative_depreciation: 150000
replacement_purchase: 850000
cash_boot: 150000
```

Expected:

```text
Realized gain = 1000000 − 400000 = 600000
Recognized gain = min(150000 boot, 600000 gain) = 150000
Recapture portion = min(150000 recognized, 150000 depreciation) = 150000
Federal recapture tax = 150000 × 25% = 37500
NIIT, if applicable = 150000 × 3.8% = 5700
```

---

# PART XII — Master Priority Fix Order

## 12.1 Mandatory Top-10

| Rank | ID | Severity | Why Now |
|---:|---|---|---|
| 1 | BUG-01 | 🔴 | Misprices purchase LTV silently. |
| 2 | BUG-02 | 🔴 | Corrupts NOI projections, IRR, stress, MC, refi. |
| 3 | BUG-05 | 🔴 | Understates true breakeven risk. |
| 4 | RISK-02 | 🟡 | Tax law/config staleness can make 2026+ outputs wrong. |
| 5 | BUG-06 | 🔴 | 100× IO sizing error risk. |
| 6 | FLAW-04 | 🟠 | ARM stress severity wrong without cap hierarchy. |
| 7 | IMP-08 | 🔵 | Stress DSCR wrong unless amortizing payments are recalculated. |
| 8 | FLAW-02 | 🟠 | Waterfall economics materially wrong under cliff method. |
| 9 | FLAW-03 | 🟠 | §1031 tax estimate wrong under proportional boot method. |
| 10 | RISK-07 | 🟡 | Yield-maintenance approximation drifts materially on long terms. |

## 12.2 Full Backlog Order

| Order | ID | Required Action |
|---:|---|---|
| 11 | BUG-03 | Fix tornado labels and chart semantics. |
| 12 | FLAW-01 | Add risk-factor stacking with 1.30 cap. |
| 13 | FLAW-05 | Add EGI Mode A/B. |
| 14 | RISK-01 | Externalize anchor rate and staleness blocking. |
| 15 | RISK-03 | Define Monte Carlo underwater metric. |
| 16 | RISK-04 | Add robust IRR/MIRR multi-root handling. |
| 17 | RISK-05 | Add refinance lifetime/hold-period comparison. |
| 18 | RISK-06 | Add IO-to-amort debt-service schedule. |
| 19 | IMP-01 | Expand LLPA grid. |
| 20 | IMP-02 | Use lognormal rent model. |
| 21 | IMP-03 | Include upfront CapEx in CoC. |
| 22 | IMP-04 | Max-loan solver tests IO and amort. |
| 23 | IMP-05 | Add named stress scenarios. |
| 24 | IMP-06 | Expand kill criteria. |
| 25 | IMP-07 | Upgrade inverse normal CDF. |
| 26 | ARCH-01 | Enforce dimensional types. |
| 27 | ARCH-02 | Formalize DSCR tracks in output model. |
| 28 | ARCH-03 | Unify cash-flow definition. |
| 29 | ARCH-04 | DRY core math library. |
| 30 | TEST-01/02 | Full regression and hand-scenario suite. |

---

# PART XIII — Developer Implementation Checklist

## Phase 1 — Core Math and Blocking Bugs

```markdown
[ ] Audit all purchase LTV formulas and replace max() with min().
[ ] Implement transaction-aware value_for_ltv().
[ ] Create noi_at_year() and replace all direct NOI growth formulas.
[ ] Fix vacancy tornado high/low labels.
[ ] Add OpEx to breakeven occupancy.
[ ] Replace all ambiguous rate% math with annual_rate_decimal.
[ ] Add zero-rate PMT/balance protections.
```

## Phase 2 — Logic and Tax Modules

```markdown
[ ] Implement required DSCR additive risk stacking.
[ ] Replace cliff waterfall with tranched LP-IRR waterfall.
[ ] Implement §1031 net boot and recapture-first tax sequence.
[ ] Implement ARM initial/periodic/lifetime caps with optional carryover.
[ ] Re-amortize stressed debt service over remaining term.
[ ] Implement EGI Mode A and Mode B.
[ ] Move tax tables to external YAML/JSON.
```

## Phase 3 — Risk and Analytics

```markdown
[ ] Externalize anchor rate and add stale/block warnings.
[ ] Define Monte Carlo value path and P(underwater).
[ ] Add robust IRR with sign-scan, Brent solve, and MIRR fallback.
[ ] Add refinance cash-flow, lifetime, and hold-period outputs.
[ ] Build IO-to-amort debt-service schedule.
[ ] Replace yield-maintenance shortcut with monthly PV method.
```

## Phase 4 — Improvements and Configuration

```markdown
[ ] Expand LLPA grid and LTV haircuts.
[ ] Add lognormal rent model and bounded vacancy model.
[ ] Include upfront CapEx in Cash_Invested.
[ ] Make max-loan solver check both IO and amort constraints.
[ ] Add named stress scenarios and combined worst-case scenario.
[ ] Expand kill criteria.
[ ] Upgrade inverse normal CDF.
```

## Phase 5 — Architecture and Regression

```markdown
[ ] Create core finance math library.
[ ] Enforce Rate and CashFlow dimensional types.
[ ] Implement formal DSCR_Result output model.
[ ] Centralize unified cash-flow definition.
[ ] Add all mandatory unit tests.
[ ] Add all hand-verified scenarios.
[ ] Run historical deal comparison against prior engine.
[ ] Document every material output difference.
```

---

# PART XIV — Output Contract

Every deal analysis should return:

```json
{
  "eligibility": {
    "status": "PASS | FAIL | MANUAL_REVIEW | KILL",
    "kill_criteria": [],
    "manual_review_flags": []
  },
  "tracks": {
    "track_1_lender_dscr": {
      "value": 1.21,
      "numerator": "qualifying_rent_monthly",
      "denominator": "pitia_monthly"
    },
    "track_2_investor_dscr": {
      "value": 0.80,
      "numerator": "noi_annual",
      "denominator": "ads_annual"
    },
    "track_3_stabilized_dscr": null
  },
  "ltv": {
    "value": 0.75,
    "basis": "lesser_of_purchase_price_or_appraised_value"
  },
  "pricing": {
    "base_rate": 0.06875,
    "llpa_adjustments": [],
    "final_rate": 0.07125,
    "pricing_warnings": []
  },
  "risk": {
    "breakeven_occupancy": 0.88,
    "stress_results": [],
    "monte_carlo": {
      "p_negative_cf": null,
      "p_underwater": null
    }
  },
  "tax": {
    "tax_year": 2026,
    "warnings": ["Tax model is estimate only; verify with tax professional"]
  },
  "audit": {
    "formula_version": "16.0.0",
    "config_version": "2026-06-18",
    "warnings": []
  }
}
```

---

# PART XV — Final Build Standard

The final engine must satisfy the following acceptance conditions:

1. **No silent math ambiguity.** Every rate, cash flow, and denominator must be dimensionally typed.
2. **No lender/investor confusion.** Track 1 and Track 2 must be separately labeled and cannot be collapsed into one score.
3. **No stale pricing confidence.** Anchor-rate and LLPA config must carry as-of dates and staleness warnings.
4. **No tax hardcoding.** Tax law tables must be external, versioned, and flagged if outdated.
5. **No single-point stress illusion.** Stress output must show base, named scenarios, combined worst, and Monte Carlo probabilities.
6. **No fragile IRR.** Multiple roots, no roots, and MIRR fallback must be surfaced.
7. **No superficial refinance recommendation.** Payback, lifetime cost, and hold-period savings must all be visible.
8. **No waterfall shortcut.** Promote must be tranche-based and LP-IRR driven.
9. **No IO illusion.** IO sizing must also pass post-IO amortization constraints.
10. **No untested formula changes.** Every bug fix must have a regression test.

---

## End of Master Consolidated Specification v16.0.0
