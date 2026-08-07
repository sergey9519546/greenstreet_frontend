# Advisor-Grade DSCR Decision Engine  
## Organized Research, Formula Tournament, Architecture Tournament, and Implementation Blueprint

**Status:** Consolidated research draft  
**Scope:** DSCR loan qualification + investor survival + risk diagnosis + scenario modeling + recommendation logic  
**Product standard:** Factual, calculation-first, deterministic core; AI limited to explanation, research synthesis, and user-facing interpretation  
**Important limitation:** This document organizes the supplied research and adds a clean implementation structure. External lender, regulatory, and market claims must be refreshed against live primary sources before production use.

---

## 1. Executive Verdict

The correct target is **not** a better DSCR calculator.

The correct target is a:

> **Dual-ledger, deterministic, matrix-aware, stress-tested, breakpoint-solving DSCR Decision Engine.**

It must separate:

1. **Lender Qualification Ledger**  
   What the lender/product matrix will accept.

2. **Investor Survival Ledger**  
   What the property and borrower can actually survive.

The winning architecture is:

```text
Data Intake + Verification
→ Deterministic Formula Engine
→ Lender Qualification Ledger
→ Investor Survival Ledger
→ Scenario / Stress Engine
→ Breakpoint / Repair Solver
→ Risk Diagnosis Engine
→ Recommendation Rules
→ Audit + Compliance Layer
→ AI Explanation Layer
```

The strongest product concept is:

> **“Qualifies but Dangerous” detection.**

That is the flagship value. A deal can qualify under a lender’s DSCR screen while failing economic survival, liquidity, refinance, tax, insurance, or CapEx stress.

---

## 2. Core Thesis

A basic DSCR calculator usually answers only:

```text
Does rent cover PITIA?
```

An advisor-grade DSCR engine must answer:

```text
1. Does the deal qualify under a specific lender/product matrix?
2. Does the property survive realistic ownership stress?
3. What specific variable breaks the deal?
4. What exact change repairs the deal?
5. Which inputs are verified, estimated, stale, missing, or dangerous?
6. What recommendation is mathematically justified?
7. What compliance boundaries must be shown?
```

The research supports one central principle:

> **Never collapse qualification and investment quality into one number.**

A single DSCR ratio is unsafe because different sources and contexts use different DSCR definitions. Public lender-facing DSCR tools often use rent divided by PITIA/ITIA, while more institutional real-estate underwriting uses NOI or net cash flow against debt service. Therefore the engine must carry **parallel coverage ratios**, not a single “truth” DSCR.

---

## 3. What the Basic Calculator Does — and Why It Is Not Enough

### 3.1 Basic Residential DSCR Calculator

```math
DSCR_{basic} = \frac{R_{gross}}{PITIA}
```

Where:

| Variable | Meaning |
|---|---|
| `R_gross` | stated monthly market rent |
| `PITIA` | principal + interest + taxes + insurance + association dues |

A more lender-specific version is:

```math
QDSCR = \frac{R_q}{P_q}
```

Where:

| Variable | Meaning |
|---|---|
| `R_q` | lender-accepted monthly qualifying rent |
| `P_q` | lender-accepted monthly qualifying payment, usually PITIA or ITIA depending on product |

### 3.2 What the Basic Calculator Does Well

| Strength | Why it matters |
|---|---|
| Fast screening | Good for first-pass broker/investor checks |
| Clear qualification math | Easy to explain |
| Low input burden | Needs only a handful of numbers |
| High auditability | Anyone can recompute it |

### 3.3 What It Misses

A basic calculator usually does **not** test:

- vacancy normalization
- management fee normalization
- recurring repair reserves
- replacement reserves / CapEx reserves
- tax reassessment shock
- insurance shock
- liquidity burn
- refinance failure
- prepayment drag
- matrix staleness
- rent-source confidence
- lease vs. market rent conflict
- data conflicts
- interest-only illusion
- balloon/reset risk
- borrower reserve weakness
- “qualifies but dangerous” scenarios

### 3.4 Benchmark to Beat

The basic calculator’s profile:

| Dimension | Basic Calculator |
|---|---|
| Inputs | ~6 numbers |
| Time horizon | Instant, t=0 |
| Survival realism | Low |
| Variance awareness | None |
| Time-decay awareness | None |
| Manipulation resistance | Low |
| Auditability | High |
| Compute cost | Very low |
| Input burden | Very low |

The goal is not complexity for its own sake.

The goal is **strict dominance**:

> Better risk discrimination while preserving transparency and auditability.

---

## 4. Design Law: Deterministic Core, AI Overlay

The safest architecture is:

```text
Deterministic Formula + Rule Engine = decision core
AI = explanation, summarization, classification, narrative, and research assistant
```

### AI May Do

- explain results
- summarize risks
- compare scenarios
- detect missing data
- translate formulas into plain English
- generate borrower-facing explanations
- create checklists
- produce audit summaries
- assist with source review

### AI Must Not Do

- invent lender rules
- invent rates
- invent DSCR thresholds
- invent rent assumptions
- override deterministic formulas
- silently fill missing inputs
- create black-box approval logic
- produce unsupported personalized advice
- hide assumptions or uncertainty

### Practical Rule

```text
If a number affects eligibility, risk, pricing, or recommendation,
it must be:
1. source-cited,
2. directly calculated from inputs, or
3. clearly labeled as an assumption.
```

---

## 5. Final Engine Philosophy

The engine is a **vector**, not a scalar.

Do not output one “deal score” as the primary result. Output a structured decision vector:

```math
\mathbf{D} =
[
QDSCR,\ EDSCR,\ SDSCR,\ RSDSCR,\ WCDSCR,\ DY,\ ESR,\ LSC,\ F_s,\ CADSCR
]
```

Where:

| Metric | Meaning |
|---|---|
| `QDSCR` | lender/product qualifying DSCR |
| `EDSCR` | economic DSCR based on operating reality |
| `SDSCR` | stabilized DSCR using normalized NOI |
| `RSDSCR` | reset-safe DSCR after IO/ARM/balloon stress |
| `WCDSCR` | worst-case DSCR across scenario set |
| `DY` | debt yield |
| `ESR` | exit safety ratio |
| `LSC` | liquidity survival clock |
| `F_s` | fragility score |
| `CADSCR` | confidence-adjusted DSCR |

This vector preserves orthogonal truths that a single score would hide.

---

## 6. Formula Tournament — Survivors and Rejections

### 6.1 F0 — Qualifying DSCR

```math
QDSCR = \frac{R_q}{P_q}
```

| Field | Detail |
|---|---|
| Purpose | Exact lender-style screen |
| Used for | Lender Qualification Ledger |
| Strength | Mirrors product-specific qualification math |
| Weakness | Ignores true OpEx, reserves, vacancy, repairs, and investor survival |
| Verdict | **Keep**, but qualification only |

**Rule:** Never use `QDSCR` alone to call a deal “good.”

---

### 6.2 F1 — Economic DSCR

```math
EDSCR = \frac{NOI_s}{ADS_{act}}
```

Where:

| Variable | Meaning |
|---|---|
| `NOI_s` | stabilized net operating income |
| `ADS_act` | actual annual debt service under current loan terms |

A reserve-loaded monthly version:

```math
DSCR_{econ} =
\frac{
R_{gross}(1-v) - (M_{mgmt} + C_{cap} + C_{maint} + L_{turn})
}{
P\&I + T + I + A
}
```

| Variable | Meaning |
|---|---|
| `v` | vacancy fraction |
| `M_mgmt` | management fee |
| `C_cap` | CapEx reserve |
| `C_maint` | recurring maintenance |
| `L_turn` | amortized turnover/leasing cost |
| `P&I` | principal and interest |
| `T` | taxes |
| `I` | insurance |
| `A` | association dues |

| Field | Detail |
|---|---|
| Purpose | Real operating coverage |
| Used for | Investor Survival Ledger |
| Strength | Moves from gross rent to retained-cash basis |
| Main attack | User can zero out reserves and collapse it back to basic DSCR |
| Mitigation | Apply minimum reserve floors by property type, age, region, and evidence quality |
| Verdict | **Keep**, with reserve floors |

---

### 6.3 F2 — Stabilized DSCR

```math
SDSCR = \frac{NOI_{stab}}{ADS_{act}}
```

Where:

```math
NOI_{stab} =
EGI - OpEx_n - RR
```

| Variable | Meaning |
|---|---|
| `EGI` | effective gross income |
| `OpEx_n` | normalized recurring operating expenses |
| `RR` | replacement reserve |
| `ADS_act` | annual debt service under actual loan terms |

| Field | Detail |
|---|---|
| Purpose | Removes owner-optimistic assumptions |
| Used for | Investor Survival Ledger |
| Strength | Forces market vacancy, management, expenses, reserves |
| Main attack | Sensitive to comp quality |
| Mitigation | Use rent-source confidence and evidence hierarchy |
| Verdict | **Keep** |

---

### 6.4 F3 — Reset-Safe DSCR

```math
RSDSCR = \frac{NOI_{stab}}{ADS_{reset}}
```

Where:

| Variable | Meaning |
|---|---|
| `NOI_stab` | stabilized NOI |
| `ADS_reset` | debt service after IO expiry, ARM reset, balloon/refi, or fully indexed terms |

Time-based form:

```math
DSCR(t) = \frac{NOI(t)}{ADS(t)}
```

```math
ADS(t) =
\begin{cases}
12 \cdot I_{mo}, & t < t_{IO} \\
12 \cdot Amort(P, r_{refi}, n), & t \geq t_{IO}
\end{cases}
```

Define the **Cliff Ratio**:

```math
\Phi = \frac{DSCR(t_{IO}^{-})}{DSCR(t_{IO}^{+})}
```

| Field | Detail |
|---|---|
| Purpose | Detects IO/ARM/balloon illusion |
| Used for | Investor Survival + Refinance Risk |
| Main attack | Refinance rate is unknowable |
| Mitigation | Do not forecast one rate; sweep a rate range and calculate break-even refi rate |
| Verdict | **Keep conditionally** |

#### Break-even refi rate

Instead of guessing:

```text
“Refi rate will be 8.5%.”
```

The engine should solve:

```text
At what refi rate does post-reset DSCR fall below 1.00x?
```

That is a deal-specific breakpoint, not a forecast.

---

### 6.5 F4 — Confidence-Adjusted DSCR

```math
CADSCR = \frac{NOI_{conf}}{ADS_{act}}
```

Where:

```math
NOI_{conf} =
(Rent \times h_r \times (1 - Vac_m)) - OpEx_n \times (1 + u_e) - RR
```

| Variable | Meaning |
|---|---|
| `h_r` | rent-confidence haircut factor |
| `Vac_m` | market/stabilized vacancy assumption |
| `u_e` | expense uncertainty uplift |
| `RR` | replacement reserve |

| Field | Detail |
|---|---|
| Purpose | Penalizes weak evidence |
| Used for | Advisory overlay / confidence layer |
| Main attack | Haircuts can become arbitrary |
| Mitigation | Treat haircuts as policy assumptions requiring calibration |
| Verdict | **Keep as advisory**, not as primary decision gate |

---

### 6.6 F5 — Worst-Case DSCR

```math
WCDSCR = \min(DSCR_{base}, DSCR_{conservative}, DSCR_{severe})
```

| Field | Detail |
|---|---|
| Purpose | Creates robustness floor |
| Used for | Investor Survival Gate |
| Strength | Prevents average-case comfort from hiding tail failure |
| Main attack | Depends on scenario design |
| Mitigation | Version shock scenarios; user can add worse scenarios but cannot soften floor |
| Verdict | **Keep** |

---

### 6.7 F6 — Exit Safety Ratio

```math
ESR = \frac{RefiCap}{B_{exit}}
```

| Variable | Meaning |
|---|---|
| `RefiCap` | refinance capacity under stress |
| `B_exit` | projected loan balance at exit |

| Field | Detail |
|---|---|
| Purpose | Measures refinance survivability |
| Used for | Exit / Refinance Risk |
| Main attack | Future value and rate assumptions uncertain |
| Mitigation | Use scenario ranges and breakpoints, not single forecasts |
| Verdict | **Keep** |

---

### 6.8 F7 — Debt Yield

```math
DY = \frac{NOI_{stab}}{LoanAmount}
```

| Field | Detail |
|---|---|
| Purpose | Rate-independent leverage check |
| Used for | Survival side-constraint |
| Strength | Not distorted by interest rate or amortization structure |
| Weakness | Not enough alone |
| Verdict | **Keep as side constraint** |

---

### 6.9 F8 — Liquidity Survival Clock

```math
LSC =
\frac{
Liquid\ Reserves
}{
\max(0,\ ADS_{mo} + OpEx_{mo} - R_{gross}(1-v_{shock}))
}
```

| Field | Detail |
|---|---|
| Purpose | Measures how long borrower can fund the property under stress |
| Used for | Liquidity Gate |
| Strength | Couples borrower balance sheet to property income statement |
| Main attack | Reserves are easy to misstate |
| Mitigation | Mark as `UNVERIFIED` unless reserves are sourced |
| Verdict | **Promote to core as independent dimension** |

**Important:** Do not blend LSC into DSCR. Liquidity and coverage are different physics.

---

### 6.10 F9 — DSCR Fragility / Elasticity

Fragility asks:

```text
How sensitive is this deal to each driver?
```

Normalized partial derivative:

```math
\varepsilon_x =
\frac{\partial DSCR}{\partial x}
\cdot
\frac{x}{DSCR}
```

Dominant failure driver:

```math
DominantRisk = \arg\max_x |\varepsilon_x|
```

Bounded fragility score:

```math
F_s =
100 \cdot
\left(
1 -
\frac{DSCR_{base} - DSCR_{stress}}{DSCR_{base}}
\right)
```

Clamp:

```math
F_s \in [0,100]
```

| Field | Detail |
|---|---|
| Purpose | Names what breaks the deal |
| Used for | Risk Diagnosis Engine |
| Main attack | Derivatives are local and may fail under large nonlinear shocks |
| Mitigation | Use finite-difference recomputation from actual stress scenarios |
| Verdict | **Promote to core diagnosis engine** |

---

### 6.11 F10 — Margin-to-Failure / Breakpoint Map

Solve the smallest adverse delta that causes failure:

```math
\Delta x_{failure}
=
\min_{\Delta x}
\{x: DSCR(x) < Target\}
```

Repair inversion:

```math
Required\ \Delta x =
\frac{DSCR_{target} - DSCR_{current}}{\partial DSCR / \partial x}
```

Use for:

- required rent increase
- required price reduction
- required loan reduction
- required LTV reduction
- required rate improvement
- required reserve increase
- required expense reduction
- break-even refi rate
- break-even tax/insurance shock

| Field | Detail |
|---|---|
| Purpose | Converts diagnosis into exact repair |
| Used for | Deal Repair Engine |
| Strength | Gives user actionable levers |
| Main attack | Garbage-in if base inputs are weak |
| Mitigation | Pair with input confidence framework |
| Verdict | **Keep** |

---

## 7. Rejected or Quarantined Formula Families

### 7.1 Stochastic / Monte Carlo DSCR

```math
\widetilde{DSCR} =
\frac{
\widetilde{R}(1-\widetilde{v}) - \widetilde{OpEx}
}{
\widetilde{PI} + \widetilde{T} + \widetilde{I} + A
}
```

Risk-tail outputs:

```math
DSCR_{p05} = 5th\ percentile\ of\ \widetilde{DSCR}
```

```math
P(DSCR < 1.0)
```

| Field | Detail |
|---|---|
| Strength | Can express distribution and confidence |
| Fatal risk | Garbage priors create precise fiction |
| Audit issue | Harder to hand-recompute |
| Correlation issue | Naive independence understates tail risk |
| Verdict | **Quarantine to non-binding diagnostic overlay** |

Allowed only if:

- random seed is fixed
- priors are disclosed
- correlation matrix is explicit
- output is labeled advisory
- deterministic gates still control recommendations

---

### 7.2 Liquidity-Augmented DSCR

```math
\frac{NOI + reserve\_draw}{ADS}
```

| Problem | Explanation |
|---|---|
| Mixes stock and flow | Reserves are not operating income |
| Can make bad property look good | Cash reserves can hide property weakness |
| Verdict | **Reject from core** |

---

### 7.3 Appreciation-Assisted DSCR

```math
\frac{NOI + expected\ appreciation}{ADS}
```

| Problem | Explanation |
|---|---|
| Non-cash | Appreciation does not pay monthly debt service |
| Speculative | Forecast-dependent |
| Advice risk | Can justify bad cash-flow deals |
| Verdict | **Reject** |

---

### 7.4 Scenario-Weighted Expected DSCR

```math
\sum p_s DSCR_s
```

| Problem | Explanation |
|---|---|
| Hides tail risk | Average can look safe while severe case fails |
| Requires calibrated probabilities | Most users will not have them |
| Verdict | **Defer / reject for core unless calibrated on realized data** |

---

## 8. Architecture Tournament

| ID | Architecture | Core Idea | Fatal Weakness | Verdict |
|---|---|---|---|---|
| A0 | Basic DSCR Calculator | Rent + PITIA/ITIA math | No survival logic | Reject as standalone |
| A1 | Matrix-Exact Qualification Engine | Apply lender row exactly | Matrix freshness risk | Keep |
| A2 | Stabilized NOI Underwriter | Build normalized NOI | Needs evidence discipline | Keep |
| A3 | Evidence-Haircut Engine | Penalize weak evidence | Haircuts can be arbitrary | Keep advisory |
| A4 | Stress Lattice Engine | Base / conservative / severe / custom scenarios | Scenario design risk | Keep |
| A5 | Breakpoint Solver | Solve exact repair needed | Garbage-in if base inputs weak | Keep |
| A6 | Liquidity + Exit Survival Engine | Burn-rate + refi gap + prepay drag | Needs asset verification and hold assumptions | Keep |
| A7 | Monolithic Weighted Deal Score | One number summarizes all | Opaque; hides fatal defects | Reject |
| A8 | Black-Box ML Approval Engine | Statistical decisioning | Explainability + compliance risk | Reject for core |
| A9 | Dual-Ledger Advisor Engine | Qualification ledger + survival ledger | Slightly more complex UX | **Final winner** |

### Why A9 Wins

A9 wins because it separates two realities:

```text
Program reality:
What a lender/product matrix may accept.

Economic reality:
What the property and borrower can survive.
```

The engine should not let one reality overwrite the other.

---

## 9. Final Architecture: Dual-Ledger Deterministic Engine

### Ledger 1 — Lender Qualification

Purpose:

```text
Determine whether the deal fits a specific lender/product matrix.
```

Includes:

- exact `QDSCR`
- exact rent-source rule
- exact PITIA/ITIA rule
- FICO / LTV / reserve checks
- property-type checks
- loan-purpose checks
- state restrictions
- vesting/entity restrictions
- loan amount limits
- prepayment structure
- IO eligibility
- matrix timestamp
- matrix staleness flag
- guideline conflict flag

Outputs:

```text
Eligible
Conditionally eligible
Unknown: stale matrix
Likely ineligible
Human review required
```

---

### Ledger 2 — Investor Survival

Purpose:

```text
Determine whether the property and borrower can survive realistic ownership stress.
```

Includes:

- `EDSCR`
- `SDSCR`
- `RSDSCR`
- `WCDSCR`
- `Debt Yield`
- `Exit Safety Ratio`
- `Liquidity Survival Clock`
- break-even refi rate
- margin-to-failure map
- stress lattice
- borrower reserve verification

Outputs:

```text
Survivable
Survivable but sensitive
Fragile
Fails conservative survival
Fails severe survival
Human review required
```

---

## 10. Stress Lattice

### 10.1 Stress-Vector DSCR

```math
DSCR_{stress}(\vec{s}) =
\frac{
R_{gross}(1-v-\Delta v)(1-\delta_R) - OpEx \cdot (1+\delta_{ex})
}{
(P\&I)\cdot(1+\delta_{rate}^{*}) + T(1+\tau) + I(1+\iota) + A(1+\eta)
}
```

| Shock | Symbol | Default Status |
|---|---|---|
| Rent decline | `δ_R` | policy assumption |
| Extra vacancy | `Δv` | policy assumption |
| Tax reassessment | `τ` | calculated when millage/assessment rules are available |
| Insurance spike | `ι` | policy assumption |
| HOA increase | `η` | policy assumption |
| OpEx inflation | `δ_ex` | policy assumption |
| Refi rate reset | `δ_rate*` | fires at IO expiry, ARM reset, or balloon |

### 10.2 Scenario Set

| Scenario | Use | Engine Treatment |
|---|---|---|
| Base | Current best view | Display only; not sufficient for recommendation |
| Conservative | Advisor default | Primary investor-survival gate |
| Severe | Fragility diagnosis | Not automatic reject unless catastrophic |
| Cascading shock | Multiple simultaneous shocks | Shows compound vulnerability |
| Refinance failure | Exit/refi risk | Required for IO, balloon, ARM, short-term holds |
| Custom | User-defined | Allowed only if labeled user-defined |

### 10.3 Scenario Governance

- Shock floors must be versioned.
- User may add worse shocks.
- User may not soften the conservative floor.
- Scenario version must appear in audit log.
- Regional/property-type calibration should be supported later.

---

## 11. Input Confidence Framework

Every input must be labeled:

```text
Verified
User-provided
Estimated
Assumed
Missing
Stale
Conflicting
```

### 11.1 Evidence Ladder

| Evidence | Confidence |
|---|---|
| Signed lease + bank receipts | Highest |
| Appraisal rent schedule / 1007 / 1025 | High |
| Lender-accepted rental AVM | Moderate-high |
| Third-party rent AVM | Moderate |
| User estimate | Low |
| Stale document | Very low |
| Unsupported assumption | Assumption only |

### 11.2 Required Input Metadata

Each input should include:

```json
{
  "field": "monthly_rent",
  "value": 3000,
  "unit": "USD/month",
  "source_type": "signed_lease",
  "source_name": "Lease Agreement",
  "timestamp": "2026-06-18",
  "confidence": "verified",
  "staleness_days": 0,
  "used_in": ["QDSCR", "SDSCR", "WCDSCR"],
  "assumption_flag": false
}
```

---

## 12. Recommendation Logic

### 12.1 Do Not Use Simple Weighted Average

A deal that passes lender DSCR but fails investor survival should not become:

```text
72/100 — Decent deal
```

That hides the actual danger.

Use gated logic instead.

### 12.2 Two-Gate Decision Logic

```text
GATE 1 — ELIGIBILITY / LENDER WORLD

Pass if:
- QDSCR >= lender matrix minimum
- LTV <= lender matrix maximum
- FICO >= lender matrix minimum
- reserves >= product requirement
- rent-source rule passes
- product/state/property overlays pass

GATE 2 — VIABILITY / INVESTOR WORLD

Pass if:
- WCDSCR >= policy target
- LSC >= policy reserve target
- RSDSCR does not reveal unacceptable reset risk
- ESR shows acceptable refinance/exit capacity
- dominant fragility is not catastrophic
- input confidence meets minimum standard
```

### 12.3 Classification

| Lender Gate | Investor Gate | Output |
|---|---|---|
| Pass | Pass | Financeable and survivable |
| Pass | Fail | Qualifies but dangerous |
| Fail | Pass | Strong asset, restructure debt |
| Fail | Fail | Avoid unless repaired |
| Unknown | Any | Human review required |
| Any | Unknown | Insufficient verified data |

### 12.4 Recommendation Wording

Allowed:

```text
Based on the provided inputs, this deal appears financeable but fragile.
```

```text
The property may qualify under the lender-screen scenario, but it fails investor survival under conservative stress.
```

```text
To reach the target survival threshold, the purchase price must decrease by approximately $X, rent must increase by $Y, or LTV must fall to Z%.
```

Not allowed:

```text
You should definitely buy this property.
```

```text
This investment is guaranteed.
```

```text
This loan is approved.
```

```text
This is legal, tax, mortgage, or investment advice.
```

---

## 13. Risk Diagnosis Engine

The engine should identify the smallest adverse delta that breaks the deal.

Failure drivers:

- rent
- rate
- tax
- insurance
- vacancy
- repairs
- CapEx
- HOA
- LTV
- refi capacity
- reserves
- prepay drag
- appraisal gap
- data quality

Output example:

```text
Primary failure driver: insurance shock.
A 22% insurance increase pushes WCDSCR from 1.04x to 0.98x.
The deal is insurance-sensitive and should not be labeled strong without a verified insurance quote.
```

---

## 14. Deal Repair Engine

The repair engine should invert the failed constraint.

Return exact required improvements:

- lower purchase price by `$X`
- lower loan amount by `$Y`
- raise verified rent by `$Z/month`
- add reserves `$A`
- improve rate by `B` bps
- reduce LTV to `Z%`
- avoid IO
- require amortizing qualification
- remove or reprice prepay penalty
- obtain verified insurance quote
- use stronger rent source
- reject if repair depends on appreciation or unsupported rent

Example:

```text
To clear the investor survival gate, the fastest repair is:
- reduce loan amount by $22,400, or
- increase verified rent by $285/month, or
- add $9,800 in verified reserves to move LSC from 4.2 months to 6.0 months.
```

---

## 15. Adversarial Validation Set

The engine must be red-teamed against:

| Attack | Basic Calculator Failure | Surviving Defense |
|---|---|---|
| Inflated rent | Accepts fake numerator | Evidence haircut + rent-source hierarchy |
| Lease above market | Overstates quality | Matrix rules + stabilized NOI |
| IO pass / amortizing fail | Gives false comfort | Reset-safe DSCR + IO illusion detector |
| Tax understatement | Misses reassessment | Stress lattice |
| Insurance understatement | Misses premium shock | Stress lattice |
| Artificially low vacancy | Inflates NOI | Stabilized DSCR |
| Missing CapEx reserve | Overstates survival | Replacement reserve floors |
| Weak borrower liquidity | Ignores reserves | Liquidity Survival Clock |
| Refi trap | Ignores exit risk | Exit Safety Ratio + break-even refi rate |
| Stale matrix | False eligibility | Matrix versioning |
| Input-unit error | Bad calculation | Input validator |
| Black-box denial | Compliance risk | Rule-based reasons only |

---

## 16. Benchmark Examples

All examples below are **testing assumptions**, not market facts.

### 16.1 Case A — Clean but Not Bulletproof

Assumptions:

| Input | Value |
|---|---:|
| Loan amount | $250,000 |
| Rate | 7.00% |
| Amortization | 30 years |
| Monthly rent | $3,000 |
| Taxes | $250/month |
| Insurance | $100/month |
| Vacancy | 5% |
| Management | 8% of collected rent |
| Repairs | 5% of gross rent |
| CapEx reserve | 5% of gross rent |

Results:

| Metric | Result |
|---|---:|
| Monthly P&I | $1,663.26 |
| Program DSCR | 1.49x |
| NOI | $23,664/year |
| Economic DSCR | 1.19x |
| Mild conservative stress DSCR | 1.04x |

Interpretation:

```text
Basic calculator:
Strong pass.

Advisor-grade engine:
Financeable and economically viable, but not invulnerable.
```

---

### 16.2 Case B — IO Illusion / Survival Failure

Assumptions:

| Input | Value |
|---|---:|
| Loan amount | $300,000 |
| Rate | 7.50% |
| Amortization | 30 years |
| Monthly rent | $2,700 |
| Taxes | $500/month |
| Insurance | $175/month |
| Vacancy | 6% |
| Management | 8% of collected rent |
| Repairs | 5% of gross rent |
| CapEx reserve | 5% of gross rent |

Results:

| Metric | Result |
|---|---:|
| Monthly P&I | $2,097.64 |
| Fixed Program DSCR | 0.97x |
| IO Program DSCR | 1.06x |
| NOI | $16,679.52/year |
| Economic DSCR | 0.66x |
| Harsher stress DSCR | 0.55x |

Interpretation:

```text
Basic calculator:
Can produce contradictory comfort:
- fixed view fails
- IO view passes

Advisor-grade engine:
Program qualification may be product-dependent, but economic survival fails.
This is not a good deal merely because an IO screen may pass.
```

---

## 17. Hard Rules for the Engine

1. **Never collapse qualification and investment quality into one number.**
2. **Never hard-code a universal minimum DSCR.**
3. **Never let AI invent formulas.**
4. **Never let AI invent lender rules.**
5. **Never let reserves “fix” a weak property by adding them to DSCR numerator.**
6. **Never use appreciation to justify qualification.**
7. **Never output stronger advice than evidence quality supports.**
8. **If product documents conflict, force human review.**
9. **If used in lending, reasons must be specific and traceable.**
10. **Every threshold must be sourced, calculated, calibrated, or labeled as assumption.**
11. **Every matrix must have version date, source, and staleness flag.**
12. **Every recommendation must show the calculation that caused it.**

---

## 18. Minimal Implementation Blueprint

```python
def run_dscr_engine(deal, matrix, policy):
    # 1. Validate inputs
    validate_input_schema(deal)
    validate_units(deal)
    validate_required_fields(deal)
    validate_source_confidence(deal)

    # 2. Validate matrix
    validate_matrix_schema(matrix)
    validate_matrix_freshness(matrix)

    # 3. Qualification ledger
    qdscr = calc_qdscr(deal, matrix)
    qualification = run_matrix_rules(
        deal=deal,
        matrix=matrix,
        qdscr=qdscr
    )

    # 4. Survival ledger
    noi_stab = calc_stabilized_noi(deal, policy)
    edscr = noi_stab / annual_debt_service_actual(deal)
    rsdscr = noi_stab / annual_debt_service_reset(deal)
    scenario_results = run_scenarios(deal, policy)
    wcdscr = min(s.dscr for s in scenario_results)

    debt_yield = noi_stab / deal.loan_amount
    exit_safety_ratio = refinance_capacity_stress(deal, policy) / projected_exit_balance(deal)
    liquidity_months = liquidity_months_under_stress(deal, policy)
    cadscr = calc_confidence_adjusted_dscr(deal, policy)

    # 5. Diagnosis
    breakpoints = solve_breakpoints(
        deal=deal,
        matrix=matrix,
        policy=policy,
        target_qdscr=matrix.min_dscr if matrix.min_dscr_known else None,
        target_survival_dscr=policy.target_survival_dscr
    )

    dominant_risk = identify_dominant_fragility(
        deal=deal,
        scenario_results=scenario_results,
        breakpoints=breakpoints
    )

    # 6. Gated recommendation
    recommendation = rules_engine(
        qualification=qualification,
        edscr=edscr,
        rsdscr=rsdscr,
        wcdscr=wcdscr,
        debt_yield=debt_yield,
        exit_safety_ratio=exit_safety_ratio,
        liquidity_months=liquidity_months,
        cadscr=cadscr,
        breakpoints=breakpoints,
        dominant_risk=dominant_risk,
        input_confidence=deal.input_confidence
    )

    # 7. Audit output
    return auditable_output(
        qualification=qualification,
        survival={
            "EDSCR": edscr,
            "RSDSCR": rsdscr,
            "WCDSCR": wcdscr,
            "DebtYield": debt_yield,
            "ExitSafetyRatio": exit_safety_ratio,
            "LiquidityMonths": liquidity_months,
            "CADSCR": cadscr,
        },
        diagnosis=dominant_risk,
        breakpoints=breakpoints,
        recommendation=recommendation,
        formulas_used=get_formula_versions(),
        matrix_version=matrix.version,
        policy_version=policy.version,
        sources=deal.sources,
        assumptions=deal.assumptions,
        warnings=deal.warnings
    )
```

---

## 19. Suggested Data Model

### 19.1 Deal Object

```json
{
  "property": {
    "address": null,
    "property_type": "SFR | Condo | 2-4 Unit | 5+ Multifamily",
    "units": 1,
    "purchase_price": null,
    "estimated_value": null,
    "state": null,
    "county": null
  },
  "loan": {
    "loan_amount": null,
    "ltv": null,
    "rate": null,
    "term_months": 360,
    "amortization_months": 360,
    "interest_only_months": 0,
    "points": null,
    "prepay_penalty": null,
    "loan_purpose": "purchase | rate_term_refi | cash_out_refi",
    "product_type": "DSCR"
  },
  "income": {
    "monthly_rent": null,
    "rent_source": null,
    "rent_confidence": null,
    "lease_status": null,
    "market_rent": null
  },
  "expenses": {
    "taxes_monthly": null,
    "insurance_monthly": null,
    "hoa_monthly": null,
    "management_fee_pct": null,
    "repairs_monthly": null,
    "capex_reserve_monthly": null,
    "utilities_owner_paid_monthly": null
  },
  "borrower": {
    "fico": null,
    "verified_liquid_reserves": null,
    "experience_level": null,
    "risk_tolerance": null,
    "target_cash_flow": null,
    "hold_period_months": null
  },
  "metadata": {
    "created_at": null,
    "updated_at": null,
    "data_confidence": null,
    "missing_fields": [],
    "assumptions": []
  }
}
```

### 19.2 Matrix Object

```json
{
  "lender_name": null,
  "product_name": null,
  "matrix_version_date": null,
  "source_document": null,
  "staleness_days": null,
  "eligibility_rules": {
    "min_fico": null,
    "max_ltv": null,
    "min_dscr": null,
    "reserve_requirement": null,
    "property_type_rules": {},
    "state_restrictions": {},
    "io_rules": {},
    "rent_source_rules": {}
  },
  "pricing_rules": {
    "base_rate": null,
    "fico_adjustments": {},
    "ltv_adjustments": {},
    "dscr_adjustments": {},
    "property_adjustments": {},
    "loan_purpose_adjustments": {}
  }
}
```

---

## 20. Audit Trail Requirements

Every output must show:

```text
Formula used
Formula version
Inputs used
Input source
Input confidence
Assumptions
Scenario version
Matrix version
Policy version
Timestamp
Warnings
Human-review triggers
```

Example audit fragment:

```json
{
  "metric": "WCDSCR",
  "value": 0.98,
  "formula_version": "stress_vector_v1.0",
  "scenario_version": "conservative_v1.0",
  "inputs": [
    {
      "field": "monthly_rent",
      "value": 3000,
      "source": "user_provided",
      "confidence": "low"
    },
    {
      "field": "insurance_monthly",
      "value": 175,
      "source": "quote",
      "confidence": "verified"
    }
  ],
  "assumptions": [
    "vacancy_shock=10%",
    "insurance_shock=20%"
  ],
  "warnings": [
    "Rent is user-provided and unverified."
  ]
}
```

---

## 21. Compliance Boundary

The product should be framed as:

```text
Advisor-grade DSCR decision support.
```

Not:

```text
Licensed financial advice.
Loan approval.
Investment recommendation guarantee.
Tax/legal/mortgage advice.
```

### Required User-Facing Boundary

```text
This analysis is based on provided and/or assumed inputs and is intended for educational and decision-support purposes. It is not a loan approval, commitment to lend, legal advice, tax advice, investment advice, or a substitute for review by a licensed mortgage, legal, tax, or financial professional.
```

### Human Review Triggers

Trigger human review when:

- lender matrix is stale
- matrix conflicts with another source
- rent source is weak
- DSCR is near threshold
- IO screen passes but reset-safe DSCR fails
- stress DSCR fails
- liquidity is unverified
- recommendation depends on assumptions
- adverse/decline-like reasoning may be shown to borrower
- black-box or statistical layer influences decision
- state/product restrictions are unclear

---

## 22. Final Product Output Template

```text
Executive Verdict:
Financeable but fragile.

Lender Qualification:
Passes current lender-screen scenario based on QDSCR of 1.16x.
Matrix version: [date/source].
Confidence: moderate.

Investor Survival:
Fails conservative survival scenario.
WCDSCR: 0.94x.
Liquidity Survival Clock: 3.8 months.
Reset-Safe DSCR: 0.89x after IO period.

Primary Risk:
Insurance + tax shock.
A 20% insurance increase and 10% tax reassessment push DSCR below 1.00x.

Deal Repair:
To reach survival threshold:
- reduce purchase price by approximately $X, or
- reduce loan amount by $Y, or
- increase verified rent by $Z/month, or
- add $A verified reserves.

Recommendation:
The deal may be financeable, but it should not be treated as economically safe under current assumptions.
Recommendation: restructure before proceeding.

Assumptions:
[List]

Missing Data:
[List]

Human Review:
Required because stress DSCR fails and rent source is unverified.

Compliance:
This is decision-support analysis, not loan approval or investment advice.
```

---

## 23. Source-Backed Claims to Preserve

The research supports these claims as important, but they should still be refreshed before production:

1. Public DSCR calculators can be narrow and disclaimer-heavy.
2. Some lender-facing DSCR definitions use rent divided by PITIA/ITIA.
3. Institutional CRE underwriting may define DSCR around NOI/net cash flow and annual debt service.
4. Covenant DSCR and underwriting DSCR can differ.
5. Replacement reserves, management fees, market vacancy, and stabilized NOI matter in underwriting.
6. Debt yield is useful because it is independent of interest rate and amortization.
7. Complex/black-box credit decisioning creates compliance risk if specific reasons cannot be provided.
8. Deterministic formula/rule systems are more auditable than black-box models.

---

## 24. Final Consolidated Blueprint

The final system should be built as:

```text
Advisor-Grade DSCR Decision Engine

1. Data Intake + Verification Layer
   - Captures property, loan, income, expenses, borrower, matrix data
   - Labels confidence, source, timestamp, staleness, assumptions

2. Deterministic Formula Engine
   - QDSCR, EDSCR, SDSCR, RSDSCR, WCDSCR, DY, ESR, LSC, Fragility, Breakpoints

3. Lender Qualification Ledger
   - Exact product/matrix eligibility
   - Matrix versioning
   - Rent-source rules
   - PITIA/ITIA rules
   - Pricing assumptions

4. Investor Survival Ledger
   - Stabilized NOI
   - Stress scenarios
   - Liquidity survival
   - Reset/refi risk
   - Debt yield side constraint

5. Stress Lattice Engine
   - Base
   - Conservative
   - Severe
   - Cascading
   - Refinance failure
   - Custom

6. Breakpoint + Repair Solver
   - Required rent
   - Required price
   - Required rate
   - Required LTV
   - Required reserves
   - Required expense reduction

7. Risk Diagnosis Engine
   - Dominant fragility variable
   - Failure driver
   - Data-quality warning
   - Human-review trigger

8. Recommendation Rules Engine
   - Financeable and survivable
   - Qualifies but dangerous
   - Strong asset, restructure debt
   - Avoid unless repaired
   - Insufficient verified data

9. Audit + Compliance Layer
   - Formula versions
   - Matrix versions
   - Assumptions
   - Sources
   - Disclosures
   - Human-review triggers

10. AI Explanation Layer
   - Plain-English analysis
   - Borrower/broker summary
   - Professional report generation
   - No mathematical authority
```

---

## 25. Final Non-Negotiables

```text
The engine is not a calculator.
The engine is not a black box.
The engine is not a lender.
The engine is not a licensed adviser.

It is a deterministic, auditable, advisor-grade DSCR decision-support system.
```

The best version is:

```text
Dual-ledger
Deterministic
Matrix-aware
Stress-tested
Breakpoint-solving
Input-confidence-aware
Compliance-bounded
AI-explained
Human-review-triggered
```

The core output is not:

```text
DSCR = 1.18x
```

The core output is:

```text
This deal may qualify under the lender screen, but it fails investor survival under conservative stress.
The primary breakpoints are insurance shock, tax reassessment, and insufficient reserves.
To repair the deal, reduce loan amount by $X, increase verified rent by $Y, or add $Z in verified reserves.
```

That is the Advisor-Grade DSCR Decision Engine.
