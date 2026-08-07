# DSCR Underwriting Engine v14 — Complete Organized Master Document

**Document type:** Consolidated technical specification  
**Prepared:** June 18, 2026  
**Purpose:** Organize, de-duplicate, analyze, and upgrade the provided research into one coherent Markdown build document for an institutional-grade DSCR underwriting engine.

---

## 0. Analysis Before Organization

The uploaded material contained three overlapping documents:

1. An exploratory research document with immediate corrections, numerical upgrades, solver recommendations, Monte Carlo redesign, tax/legal flags, and deeper Phase 2 modeling ideas.
2. A detailed “Comprehensive Underwriting Engine Documentation” file with longer TypeScript snippets and implementation examples.
3. A shorter synthesized v14 roadmap that already resolved some duplication.

The final document below does **not** merely concatenate those files. It applies the following analysis rules:

### 0.1 Deduplication Rules

Repeated ideas were merged into the strongest version:

| Repeated Topic | Consolidated Decision |
|---|---|
| Purchase LTV | Use lower-of sales price or appraised value by default; use appraised value only under explicit Affordable LTV/shared-equity exception flag. |
| XIRR/XNPV day count | Default to Excel-compatible `365`; expose day-count convention as a setting. |
| Solver strategy | Treat Newton and Brent as historical/intermediate recommendations. Final production standard is ITP for bracketed scalar roots, with Brent acceptable where library availability matters. |
| Monte Carlo | Split into pseudo-random MC and QMC modes. Sobol replaces Halton for QMC. |
| Normal generation | Pseudo-random path uses Ziggurat; QMC path uses inverse-normal transform with AS241. Box-Muller is retained only as a benchmark/fallback, not the default QMC transform. |
| Risk metrics | Percentiles remain as familiar UI outputs, but CVaR/Expected Shortfall becomes the primary tail-risk metric. |
| Sensitivity analysis | Tornado charts become secondary/explanatory. Sobol first-order and total-effect indices become the true engine metric. |
| Tax logic | Hardcoded tax constants are deprecated. Use year/version-gated tax rules with legal-review notes. |

### 0.2 Conflict Resolution

Some source material contained conflicting or evolving recommendations. This document resolves them as follows:

| Conflict | Resolution |
|---|---|
| “Use Brent” vs. “ITP beats Brent” | Use **ITP** as the final target because it combines superlinear convergence with optimal bisection-like worst-case guarantees. Keep **Brent** as a mature library-standard fallback. |
| “Sobol + Box-Muller” vs. “Sobol + inverse transform” | Use **inverse-normal transform** for QMC because it preserves the one-dimensional low-discrepancy mapping more directly and aligns with modern QMC normal construction. Use **Ziggurat** for pseudo-random normals. |
| “Cholesky covariance” vs. “Iman-Conover rank correlation” | Use both by mode: Cholesky for multivariate normal/t-copula workflows; Iman-Conover when preserving arbitrary non-normal marginals matters. |
| “Normal distributions” vs. “heavy-tailed marginals” | Normal remains acceptable for deterministic/simple stress testing, but institutional stochastic mode should support Student-t, beta, lognormal, jump, and mixture distributions. |
| “Static tax percentages” vs. “law-version tables” | Static rules are removed. Tax logic becomes date-driven, election-driven, jurisdiction-aware, and reviewable. |

### 0.3 Final Product Direction

The v14 engine should not be a “calculator with Monte Carlo bolted on.” It should become a layered underwriting platform:

1. **Deterministic truth engine** — exact eligibility, DSCR math, LTV, payments, debt service, reserves, rate floors, and lender constraints.
2. **Numerics core** — stable primitives used by every calculation.
3. **Stochastic underwriting layer** — Sobol/MC simulations, covariance/copula dependence, stochastic rates, rents, vacancy, cap rates, and CapEx.
4. **Risk reporting layer** — CVaR, probability of ruin, Sobol sensitivity, PD/LGD/EAD, tail scenarios, and stress narratives.
5. **Tax/legal versioning layer** — year-gated federal/state tax assumptions, elections, depreciation, PAL, QBI, NIIT, Opportunity Zone handling, and legal-review warnings.
6. **Portfolio/decision layer** — lender matching, Pareto frontier, risk parity, reserve sizing, Modified Dietz, and capital allocation.

---

## 1. Executive Summary

The current DSCR underwriting engine is directionally strong, but the uploaded research identifies several categories of required upgrades:

### 1.1 Must-Fix Correctness Items

| Area | Current Issue | Required Change |
|---|---|---|
| Purchase LTV | Higher-of value may be used in some logic | Default to `min(purchasePrice, appraisedValue)` |
| Affordable LTV | Exception not clearly separated | Add explicit Affordable LTV/shared-equity program flag |
| XIRR/XNPV | Hardcoded `365.25` can break Excel parity | Default to `365`; expose `excel365 | act365f | actact` |
| Tax engine | Hardcoded thresholds and depreciation assumptions | Move to year/version-gated tax tables |
| Bonus depreciation | Static phase-down logic may be stale | Date/election/binding-contract logic |
| IRR/root finding | Newton can diverge or overshoot | Bracketed ITP/Brent-style robust solver |
| Monte Carlo | Halton and pairwise correlations are insufficient | Scrambled Sobol, full dependence modeling, tail metrics |

### 1.2 High-Impact Institutional Upgrades

| Upgrade | Why It Matters |
|---|---|
| Stable numerics via `log1p`, `expm1`, precise summation, Horner recurrence | Prevents precision loss in long-horizon debt math and cash-flow sums |
| ITP root finder | Robust, derivative-free scalar solves for IRR, breakeven rate, max price, reverse sizing |
| Scrambled Sobol QMC | Faster convergence and better high-dimensional behavior than Halton |
| CVaR / Expected Shortfall | Measures how bad tail failures are, not just how often they happen |
| Sobol sensitivity indices | Detects nonlinear interactions missed by tornado charts |
| Copulas and heavy-tailed marginals | Models joint market crashes better than Gaussian correlation |
| Stochastic rates and cap-rate spreads | More realistic ARM resets, defeasance, refi risk, and exit valuation |
| Probability-of-ruin reserves | Replaces arbitrary “3 months reserves” with risk-targeted reserve sizing |

---

## 2. Master Architecture

### 2.1 Layered Engine Model

```text
DSCR Engine v14
├── 1. Input & Validation Layer
│   ├── Property inputs
│   ├── Loan/pricing inputs
│   ├── Tax profile inputs
│   ├── Scenario inputs
│   └── Lender/program constraints
│
├── 2. Deterministic Underwriting Layer
│   ├── LTV / CLTV / HCLTV
│   ├── DSCR / stressed DSCR
│   ├── Loan sizing
│   ├── Debt service
│   ├── IO / amortizing schedules
│   ├── Rate floors / caps
│   └── Eligibility/pricing waterfalls
│
├── 3. Numerics Core
│   ├── log1p/expm1 discounting
│   ├── stable PMT / balance
│   ├── Kahan/Neumaier/Math.sumPrecise
│   ├── Horner NPV
│   ├── ITP / Brent root solvers
│   └── AS241 inverse normal
│
├── 4. Stochastic Simulation Layer
│   ├── Pseudo-random MC
│   ├── Quasi-Monte Carlo
│   ├── Sobol / Latin Hypercube
│   ├── Full covariance / Cholesky
│   ├── Iman-Conover
│   ├── Copulas
│   └── Stochastic processes
│
├── 5. Risk Metrics Layer
│   ├── P10 / P50 / P90
│   ├── CVaR / Expected Shortfall
│   ├── Probability of ruin
│   ├── Sobol sensitivity
│   ├── PD / LGD / EAD
│   └── Sharpe / Sortino / Calmar / Omega
│
├── 6. Tax & Legal Versioning Layer
│   ├── Year-gated tax rules
│   ├── Bonus depreciation
│   ├── Cost segregation
│   ├── PAL / NIIT / QBI
│   ├── Opportunity Zone deferral
│   ├── State conformity overlays
│   └── Legal-review warnings
│
└── 7. Portfolio & Decision Layer
    ├── Lender matching
    ├── Pareto frontier
    ├── Risk parity
    ├── Modified Dietz
    ├── Reserve optimization
    └── Capital allocation
```

---

## 3. Critical Correctness & Compliance Fixes

## 3.1 Purchase LTV Calculation

### Problem

The engine must not use the higher of purchase price and appraised value for normal purchase-money LTV. That can understate LTV and risk when the appraisal is higher than the contract price.

### Correct Default

```ts
const propertyValueForPurchaseLTV = Math.min(purchasePrice, appraisedValue);
const ltv = loanAmount / propertyValueForPurchaseLTV;
```

### Affordable LTV Exception

Some Affordable LTV/shared-equity cases may use appraised value rather than the lesser of sales price and appraised value. This must be an explicit program override.

```ts
interface LtvParams {
  loanAmount: number;
  purchasePrice: number;
  appraisedValue: number;
  transactionType: 'purchase' | 'refinance';
  affordableLtvProgram?: boolean;
}

function calculateLtv(params: LtvParams): number {
  let denominator: number;

  if (params.transactionType === 'refinance') {
    denominator = params.appraisedValue;
  } else if (params.affordableLtvProgram) {
    denominator = params.appraisedValue;
  } else {
    denominator = Math.min(params.purchasePrice, params.appraisedValue);
  }

  if (denominator <= 0) throw new Error('Invalid LTV denominator');
  return params.loanAmount / denominator;
}
```

### Acceptance Tests

| Case | Input | Expected |
|---|---|---|
| Appraisal higher than contract | Price $500k, appraisal $540k, loan $375k | LTV = 75.00%, not 69.44% |
| Appraisal lower than contract | Price $500k, appraisal $480k, loan $375k | LTV = 78.13% |
| Affordable LTV flag | Price $500k, appraisal $540k, loan $375k, flag true | LTV = 69.44% |
| Refinance | Appraisal $540k, loan $375k | LTV = 69.44% |

---

## 3.2 XIRR/XNPV Day-Count Convention

### Problem

Hardcoding `365.25` creates reconciliation drift against Excel and many underwriting spreadsheets. Excel’s XIRR/XNPV convention discounts succeeding payments on a 365-day year.

### Required Design

Expose a configurable day-count convention and default to `excel365`.

```ts
type DayCountConvention = 'excel365' | 'act365f' | 'actact';

function yearFraction(
  startDate: Date,
  endDate: Date,
  convention: DayCountConvention = 'excel365'
): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.trunc((endDate.getTime() - startDate.getTime()) / msPerDay);

  switch (convention) {
    case 'excel365':
      return days / 365;
    case 'act365f':
      return days / 365.25;
    case 'actact':
      return days / 365.2425;
    default:
      return days / 365;
  }
}
```

### Rules

- Default: `excel365`.
- UI label: “Excel-compatible 365-day XIRR/XNPV.”
- Store convention in scenario metadata.
- Include convention in exports so Excel reconciliation is transparent.

---

## 3.3 Tax Logic Must Be Year-Versioned

### Problem

Tax assumptions change by tax year, federal law, state conformity, election, property type, entity type, and taxpayer profile. Hardcoded constants create silent errors.

### Required Architecture

```ts
interface TaxRuleVersion {
  taxYear: number;
  federal: {
    qbi?: QbiRules;
    bonusDepreciation?: BonusDepreciationRules;
    section179?: Section179Rules;
    passiveActivityLoss?: PassiveActivityRules;
    niit?: NiitRules;
    opportunityZone?: OpportunityZoneRules;
  };
  states?: Record<string, StateTaxOverlay>;
  legalReviewNotes: string[];
  sourceDate: string;
}

const TAX_RULES_BY_YEAR: Record<number, TaxRuleVersion> = {
  2025: {
    taxYear: 2025,
    federal: {
      qbi: {
        status: 'available_or_pending_review',
        legalReviewRequired: true
      },
      bonusDepreciation: {
        mode: 'date_driven',
        legalReviewRequired: true
      }
    },
    states: {},
    legalReviewNotes: [
      'Validate QBI and bonus depreciation rules before production filing logic.',
      'State conformity may diverge from federal depreciation treatment.'
    ],
    sourceDate: '2026-06-18'
  }
};
```

### Required UI Behavior

If a tax rule is flagged as uncertain, the engine should not silently compute it as certain. It should return:

```ts
{
  value: calculatedValue,
  confidence: 'requires_legal_review',
  warnings: [
    'QBI status is year-specific and must be reviewed before production use.'
  ]
}
```

---

## 3.4 Bonus Depreciation Logic

### Problem

Static phase-down tables are insufficient. The engine must encode:

- Acquisition date.
- Placed-in-service date.
- Written binding contract date.
- Election to reduce or elect out.
- Long-production-period property.
- State conformity.

### Required Model

```ts
interface BonusDepreciationParams {
  acquisitionDate: Date;
  placedInServiceDate: Date;
  bindingContractDate?: Date;
  electOut?: boolean;
  electReducedRate?: boolean;
  longProductionPeriodOrAircraft?: boolean;
  state?: string;
}

interface BonusDepreciationResult {
  federalRate: number;
  stateRate?: number;
  warnings: string[];
  legalReviewRequired: boolean;
}

function bonusDepreciationRate(params: BonusDepreciationParams): BonusDepreciationResult {
  const warnings: string[] = [];
  const cutoff = new Date('2025-01-19T00:00:00Z');
  const bindingContractCutoff = new Date('2025-01-20T00:00:00Z');

  if (params.electOut) {
    return {
      federalRate: 0,
      warnings: ['Taxpayer elected out of bonus depreciation.'],
      legalReviewRequired: true
    };
  }

  if (params.electReducedRate) {
    return {
      federalRate: params.longProductionPeriodOrAircraft ? 0.60 : 0.40,
      warnings: ['Reduced-rate election applied. Validate eligibility.'],
      legalReviewRequired: true
    };
  }

  if (params.bindingContractDate && params.bindingContractDate < bindingContractCutoff) {
    warnings.push('Pre-Jan 20, 2025 binding contract may remain subject to prior phase-down rules.');
    return {
      federalRate: priorPhaseDownRate(params.placedInServiceDate),
      warnings,
      legalReviewRequired: true
    };
  }

  if (params.acquisitionDate > cutoff && params.placedInServiceDate > cutoff) {
    return {
      federalRate: 1.0,
      warnings,
      legalReviewRequired: false
    };
  }

  return {
    federalRate: priorPhaseDownRate(params.placedInServiceDate),
    warnings: ['Fallback to prior phase-down schedule. Validate facts.'],
    legalReviewRequired: true
  };
}

function priorPhaseDownRate(placedInServiceDate: Date): number {
  const year = placedInServiceDate.getFullYear();
  const schedule: Record<number, number> = {
    2023: 0.80,
    2024: 0.60,
    2025: 0.40,
    2026: 0.20,
    2027: 0.00
  };
  return schedule[year] ?? 0.00;
}
```

> Note: The prior phase-down schedule must be verified against the final statute and effective-date rules before production use.

---

## 3.5 QBI / §199A Handling

### Problem

QBI appears in the source material as legally unsettled or at least source-conflicted for 2026. The engine should not treat QBI as a timeless deduction.

### Required Logic

```ts
interface QbiParams {
  taxYear: number;
  qualifiedBusinessIncome: number;
  taxableIncomeBeforeQbi: number;
  filingStatus: 'single' | 'mfj' | 'hoh';
  entityType: 'sole_prop' | 'partnership' | 's_corp' | 'c_corp' | 'other';
}

interface QbiResult {
  deduction: number;
  warnings: string[];
  legalReviewRequired: boolean;
}

function computeQbiDeduction(params: QbiParams, rules: TaxRuleVersion): QbiResult {
  const warnings: string[] = [];

  if (params.entityType === 'c_corp') {
    return {
      deduction: 0,
      warnings: ['QBI generally does not apply to C-corp income.'],
      legalReviewRequired: false
    };
  }

  const qbiRules = rules.federal.qbi;

  if (!qbiRules || qbiRules.status === 'unavailable') {
    return {
      deduction: 0,
      warnings: [`QBI unavailable or not configured for tax year ${params.taxYear}.`],
      legalReviewRequired: true
    };
  }

  if (qbiRules.legalReviewRequired) {
    warnings.push(`QBI requires legal review for tax year ${params.taxYear}.`);
  }

  const tentativeDeduction = 0.20 * params.qualifiedBusinessIncome;

  return {
    deduction: Math.max(0, tentativeDeduction),
    warnings,
    legalReviewRequired: Boolean(qbiRules.legalReviewRequired)
  };
}
```

### Required Output Behavior

Always show:

- Tax year.
- Filing status.
- Entity type.
- Whether QBI was applied.
- Whether QBI is flagged for legal review.
- Whether phase-out logic was used.
- Source/version date.

---

## 4. Numerical Stability & Computational Primitives

The numerical core should be treated as infrastructure. PMT, remaining balance, IRR, XIRR, XNPV, break-even rate, cap-rate valuation, duration, and simulation outputs should route through the same stable primitives.

---

## 4.1 Stable Rate Transform

```ts
function log1pRate(r: number): number {
  if (r <= -1) return NaN;
  return Math.log1p(r);
}

function rateFromLog(y: number): number {
  return Math.expm1(y);
}
```

### Why

The transformation `y = log1p(r)` has three advantages:

1. It enforces `r > -1`.
2. It behaves well near zero.
3. It simplifies discount factors as `exp(-t * y)`.

---

## 4.2 Stable Discount Factor

```ts
function discountFactor(rate: number, years: number): number {
  if (rate === 0) return 1;
  return Math.exp(-years * Math.log1p(rate));
}
```

---

## 4.3 Stable PMT

```ts
function pmtStable(principal: number, monthlyRate: number, nMonths: number): number {
  if (principal === 0) return 0;
  if (nMonths <= 0) throw new Error('nMonths must be positive');
  if (monthlyRate === 0) return principal / nMonths;

  const q = nMonths * Math.log1p(monthlyRate);
  const denominator = -Math.expm1(-q); // 1 - (1+r)^(-n)
  return principal * monthlyRate / denominator;
}
```

---

## 4.4 Stable Remaining Balance

```ts
function remainingBalanceStable(
  payment: number,
  monthlyRate: number,
  remainingMonths: number
): number {
  if (remainingMonths <= 0) return 0;
  if (monthlyRate === 0) return payment * remainingMonths;

  const q = remainingMonths * Math.log1p(monthlyRate);
  const annuityFactor = -Math.expm1(-q) / monthlyRate;
  return payment * annuityFactor;
}
```

---

## 4.5 Precise Summation

Use:

1. `Math.sumPrecise()` when available.
2. Neumaier summation as the default fallback.
3. Kahan summation where simple and sufficient.

```ts
function neumaierSum(values: number[]): number {
  let sum = 0;
  let compensation = 0;

  for (const value of values) {
    const t = sum + value;
    if (Math.abs(sum) >= Math.abs(value)) {
      compensation += (sum - t) + value;
    } else {
      compensation += (value - t) + sum;
    }
    sum = t;
  }

  return sum + compensation;
}

function preciseSum(values: number[]): number {
  return (Math as any).sumPrecise
    ? (Math as any).sumPrecise(values)
    : neumaierSum(values);
}
```

---

## 4.6 XNPV Stable

```ts
function xnpvStable(
  rate: number,
  cashFlows: number[],
  dates: Date[],
  dayCount: DayCountConvention = 'excel365'
): number {
  if (cashFlows.length !== dates.length) {
    throw new Error('cashFlows and dates must have same length');
  }
  if (cashFlows.length === 0) return 0;

  const t0 = dates[0];

  const terms = cashFlows.map((cf, i) => {
    const years = yearFraction(t0, dates[i], dayCount);
    return cf * discountFactor(rate, years);
  });

  return preciseSum(terms);
}
```

---

## 4.7 Periodic NPV via Horner Recurrence

```ts
function npvPeriodicHorner(rate: number, cashFlows: number[]): number {
  if (cashFlows.length === 0) return 0;
  if (rate === 0) return preciseSum(cashFlows);

  const q = 1 / (1 + rate);
  let acc = cashFlows[cashFlows.length - 1];

  for (let i = cashFlows.length - 2; i >= 0; i--) {
    acc = acc * q + cashFlows[i];
  }

  return acc;
}
```

---

## 4.8 Welford Running Statistics

Use Welford for Monte Carlo running mean/variance without storing every path.

```ts
class WelfordStats {
  private n = 0;
  private meanValue = 0;
  private m2 = 0;

  push(x: number): void {
    this.n += 1;
    const delta = x - this.meanValue;
    this.meanValue += delta / this.n;
    const delta2 = x - this.meanValue;
    this.m2 += delta * delta2;
  }

  mean(): number {
    return this.meanValue;
  }

  variance(): number {
    return this.n > 1 ? this.m2 / (this.n - 1) : 0;
  }

  stdDev(): number {
    return Math.sqrt(this.variance());
  }

  count(): number {
    return this.n;
  }
}
```

---

## 5. Root-Finding Solvers

## 5.1 Solver Hierarchy

| Solver | Role |
|---|---|
| Bisection | Guaranteed fallback; slow but safe |
| Newton | Optional polish only; not primary |
| Halley | Optional cubic polish when derivative and second derivative are cheap |
| Brent | Mature library fallback; good default if ITP unavailable |
| ITP | Final target for production bracketed scalar roots |

---

## 5.2 ITP as the Production Solver

### Use ITP For

- IRR.
- XIRR.
- Breakeven interest rate.
- Max purchase price.
- Reverse loan sizing.
- Breakeven occupancy.
- DSCR target solves.
- Break-even rent.
- Break-even cap rate.
- Waterfall hurdle root tests.

### Required Design

```ts
interface RootResult {
  root: number;
  iterations: number;
  converged: boolean;
  bracket: [number, number];
  method: 'itp' | 'brent' | 'bisection' | 'newton_polish';
}

interface RootOptions {
  tolerance?: number;
  maxIterations?: number;
  k1?: number;
  k2?: number;
  n0?: number;
}
```

### Important Implementation Rule

For IRR/XIRR, solve in transformed space:

```ts
// y = log1p(r)
// r = expm1(y)
const fY = (y: number) => xnpvStable(Math.expm1(y), cashFlows, dates);
```

This prevents invalid rates `r <= -1` and improves numerical behavior near zero.

---

## 5.3 IRR / XIRR Validity Rules

IRR can be mathematically ambiguous when cash flows change sign multiple times.

### Required Engine Behavior

```ts
function countSignChanges(cashFlows: number[]): number {
  const nonZero = cashFlows.filter(x => x !== 0);
  let changes = 0;

  for (let i = 1; i < nonZero.length; i++) {
    if (Math.sign(nonZero[i]) !== Math.sign(nonZero[i - 1])) changes++;
  }

  return changes;
}
```

| Cash-Flow Pattern | Engine Behavior |
|---|---|
| No positive or no negative flows | Return no IRR |
| One sign change | Solve normally |
| Multiple sign changes | Warn: multiple IRRs possible; show MIRR and NPV profile |
| No bracket found | Return “no real bracketed IRR in search range” |

---

## 5.4 MIRR Companion Metric

MIRR should not replace IRR, but should be added for deals with irregular cash flows or multiple sign changes.

```ts
function mirr(
  cashFlows: number[],
  financeRate: number,
  reinvestRate: number
): number {
  const n = cashFlows.length - 1;
  let pvNegative = 0;
  let fvPositive = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    const cf = cashFlows[i];
    if (cf < 0) {
      pvNegative += cf / Math.pow(1 + financeRate, i);
    } else if (cf > 0) {
      fvPositive += cf * Math.pow(1 + reinvestRate, n - i);
    }
  }

  if (pvNegative === 0) return NaN;
  return Math.pow(fvPositive / -pvNegative, 1 / n) - 1;
}
```

---

## 6. Monte Carlo & Stochastic Simulation

## 6.1 Required Two-Mode Architecture

```ts
type SimulationMode = 'pseudo_random' | 'quasi_monte_carlo' | 'latin_hypercube';

interface SimulationConfig {
  mode: SimulationMode;
  nPaths: number;
  seed?: number;
  dimensions: string[];
  qmc?: {
    engine: 'scrambled_sobol';
    requirePowerOfTwo: boolean;
    replicatedScrambles?: number;
  };
}
```

### Mode 1 — Pseudo-Random MC

Use when:

- Arbitrary sample count is required.
- Exact reproducibility matters.
- The user is running exploratory scenarios.
- QMC constraints are inconvenient.

Recommended components:

- PRNG: PCG-class generator, SFC32, or other deterministic high-quality generator.
- Normal sampler: Ziggurat.
- Statistics: Welford + precise summation.
- Sensitivity: Common Random Numbers.

### Mode 2 — Quasi-Monte Carlo

Use when:

- Risk distributions need fast convergence.
- Sensitivity analysis is being calculated.
- Tail metrics require stable sampling.
- Sample count can be `2^m`.

Recommended components:

- Scrambled Sobol.
- Sample count exactly `2^m`.
- Do not skip, drop, burn in, or thin initial points.
- Use replicated scrambles for error bars.
- Use inverse-normal transform with AS241.

### Mode 3 — Latin Hypercube

Use when:

- The user demands exactly `N` paths.
- `N` is not a power of two.
- Better space coverage than plain pseudo-random MC is desired.

---

## 6.2 Sobol Rules

| Rule | Required Behavior |
|---|---|
| Sample size | Force `nPaths = 2^m`, or auto-round upward with a warning |
| First point | Do not skip the first point |
| Scrambling | Default on |
| Replicates | Use replicated independent scrambles for uncertainty/error bars |
| Dimensions | Explicitly map each dimension to a model variable |
| Output metadata | Store seed, scramble ID, dimensions, and sample count |

```ts
function enforceSobolSampleCount(nPaths: number): number {
  const m = Math.ceil(Math.log2(nPaths));
  const rounded = 2 ** m;
  return rounded;
}
```

---

## 6.3 Variable Dimension Map

A real underwriting simulation should not rely on vague “random scenario” inputs. It needs explicit dimensions.

| Dimension | Recommended Marginal | Notes |
|---|---|---|
| Rent growth | Student-t or OU process | Allows fat tails and mean reversion |
| Vacancy | Beta distribution | Naturally bounded between 0 and 1 |
| Expense growth | Student-t / lognormal | Can spike under inflation |
| CapEx | Poisson jump + severity distribution | Lumpy repairs |
| Interest rate | Vasicek/CIR path | ARM reset/refi stress |
| Cap rate | Treasury spread model / lognormal spread | Exit valuation |
| Property tax | Jump or scenario table | Assessor reassessment risk |
| Insurance | Heavy-tailed growth | Climate/location risk |
| Refinance proceeds | Derived variable | Depends on NOI, cap rate, LTV, DSCR |
| Sale price | Derived variable | NOI / exit cap rate |

---

## 6.4 Pseudo-Random Normal Sampling

Use Ziggurat for speed. Avoid Box-Muller as the primary pseudo-random normal generator unless implementation simplicity is more important than speed.

```ts
interface NormalSampler {
  next(): number;
}
```

---

## 6.5 QMC Normal Sampling

Use inverse-normal transform with AS241.

```ts
function qmcUniformToNormal(u: number): number {
  const clamped = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, u));
  return inverseNormalAS241(clamped);
}
```

### Why AS241

- Better tail accuracy than Beasley-Springer-Moro.
- Important for `P(DSCR < 0.75)`, `P(underwater)`, reserve ruin, and CVaR.
- Comparable practical speed to less accurate approximations.

---

## 6.6 Full Covariance Matrix

Replace isolated pairwise correlations with a single PSD matrix.

```ts
interface CorrelationMatrix {
  variables: string[];
  rho: number[][];
}

const baseCorrelationMatrix: CorrelationMatrix = {
  variables: ['rentGrowth', 'vacancy', 'interestRate', 'capRate'],
  rho: [
    [ 1.00, -0.70, -0.30, -0.25],
    [-0.70,  1.00,  0.40,  0.35],
    [-0.30,  0.40,  1.00,  0.80],
    [-0.25,  0.35,  0.80,  1.00]
  ]
};
```

### Required Validation

- Matrix must be symmetric.
- Diagonal must equal 1.
- All correlations must be in `[-1, 1]`.
- Matrix must be positive semidefinite.
- If not PSD, repair via nearest PSD projection or reject the scenario.

---

## 6.7 Cholesky Sampling

Use when marginals are normal or elliptical.

```ts
function applyCholesky(L: number[][], z: number[]): number[] {
  return L.map(row => row.reduce((sum, lij, j) => sum + lij * z[j], 0));
}
```

---

## 6.8 Iman-Conover Rank Correlation

Use when preserving arbitrary marginals is more important than assuming normality.

### Use Cases

- Vacancy beta distribution.
- CapEx jump distribution.
- Insurance heavy-tail distribution.
- Mixed empirical/historical marginals.
- When rank correlation is more stable than Pearson correlation.

### Required Output Metadata

- Target rank correlation.
- Achieved rank correlation.
- Error tolerance.
- Reordering seed.
- Marginal distribution versions.

---

## 7. Dependence Modeling & Copulas

## 7.1 Why Gaussian Correlation Is Not Enough

Gaussian correlation is symmetric and has no tail dependence unless correlation is perfect. That makes it structurally weak for underwriting stress:

- Rent can fall.
- Vacancy can spike.
- Cap rates can expand.
- Refinance proceeds can decline.
- Insurance and taxes can rise.
- These can occur together in stressed states.

A linear Gaussian correlation matrix may understate those joint extremes.

---

## 7.2 Student-t Copula

Use Student-t copula as the first copula upgrade because it is a clean superset of Gaussian dependence.

```ts
interface TCopulaConfig {
  correlationMatrix: number[][];
  degreesOfFreedom: number; // lower = heavier joint tails
}
```

### Interpretation

| Degrees of Freedom | Behavior |
|---|---|
| `ν → ∞` | Approaches Gaussian copula |
| `ν = 10` | Mild tail dependence |
| `ν = 5` | Moderate tail dependence |
| `ν = 3` | Severe joint-tail behavior |

### Use Cases

- Rate/cap-rate stress.
- Macro downturn scenarios.
- Portfolio-level drawdown modeling.
- Credit risk / default clustering.

---

## 7.3 Clayton Copula

Use Clayton when downside dependence is stronger than upside dependence.

### Best Fit

- Rent and vacancy.
- NOI and delinquency/default risk.
- Reserve burn and CapEx spikes.
- Market downturns where bad variables worsen together.

---

## 7.4 Vine Copulas

Vine copulas are optional Phase 3+ infrastructure. Use only if:

- Dimension count is high.
- Pairwise dependence differs strongly across variables.
- You have enough historical data or calibrated assumptions.
- The added complexity is justified.

---

## 8. Marginal Distributions & Stochastic Processes

## 8.1 Replace Normal Assumptions Where Needed

| Variable | Weak Default | Better Model |
|---|---|---|
| Rent growth | Normal | Student-t, OU, AR(1), mixture |
| Vacancy | Normal | Beta, logistic-normal, regime model |
| Cap rate | Normal | Lognormal spread over Treasury |
| Interest rate | Flat shock | Vasicek/CIR path |
| CapEx | Smooth average | Poisson jump + severity |
| Insurance | Fixed inflation | Heavy-tailed growth / scenario table |
| Property taxes | Fixed growth | Reassessment jump model |
| Exit value | Point cap rate | Distribution of cap-rate spread and NOI |

---

## 8.2 Ornstein-Uhlenbeck Rent / NOI Process

```ts
function nextOU(
  current: number,
  theta: number,
  kappa: number,
  sigma: number,
  dt: number,
  epsilon: number
): number {
  return current + kappa * (theta - current) * dt + sigma * epsilon * Math.sqrt(dt);
}
```

### Use Cases

- Stabilized rent after renovation.
- Mean-reverting market rent.
- NOI normalization.
- Avoiding unrealistic exponential growth forever.

---

## 8.3 Vasicek Interest Rate Model

```ts
function nextVasicekRate(
  r: number,
  a: number,
  b: number,
  sigma: number,
  dt: number,
  epsilon: number
): number {
  return r + a * (b - r) * dt + sigma * Math.sqrt(dt) * epsilon;
}
```

### Pros

- Simple.
- Mean-reverting.
- Easy to calibrate.

### Cons

- Can produce negative rates.

---

## 8.4 CIR Interest Rate Model

```ts
function nextCIRRate(
  r: number,
  kappa: number,
  theta: number,
  sigma: number,
  dt: number,
  epsilon: number
): number {
  const sqrtR = Math.sqrt(Math.max(r, 0));
  return Math.max(0, r + kappa * (theta - r) * dt + sigma * sqrtR * Math.sqrt(dt) * epsilon);
}
```

### Pros

- Non-negative rate process.
- Better for interest-rate paths where negative rates are not allowed.

### Cons

- Calibration is more complex than Vasicek.

---

## 8.5 Cap Rate as Treasury Spread

Replace static cap-rate exit assumptions with:

```text
exitCapRate_t = treasuryCurvePoint_t + marketSpread_t + propertyRiskPremium_t
```

This enables:

- Rate-driven exit valuation.
- Refi stress.
- Defeasance integration.
- Spread widening scenarios.
- Better connection between debt markets and valuation.

---

## 8.6 CapEx Jump Process

```ts
interface CapexJumpConfig {
  annualFrequency: number; // lambda
  severityMean: number;
  severityStd: number;
}

function simulateCapexJump(hasJump: boolean, severity: number): number {
  return hasJump ? severity : 0;
}
```

Use a Poisson jump process for events such as:

- Roof replacement.
- HVAC failure.
- Plumbing.
- Insurance deductible events.
- Turnover renovation.
- Code compliance.

---

## 9. Risk Metrics & Reporting

## 9.1 Keep Percentiles, But Do Not Stop There

Percentiles are familiar:

- P10.
- P50.
- P90.
- Probability DSCR < 1.00.
- Probability DSCR < 1.25.
- Probability negative cash flow.

But they do not answer: “How bad is the failure when it fails?”

---

## 9.2 CVaR / Expected Shortfall

### Definition

```text
CVaR_α = mean(outcomes in the worst α% of scenarios)
```

### Required Metrics

```text
CVaR_DSCR_5%
CVaR_DSCR_10%
CVaR_CashFlow_5%
CVaR_CashFlow_10%
CVaR_IRR_5%
CVaR_EquityMultiple_5%
CVaR_ReserveBalance_5%
```

### Implementation

```ts
function cvarLowerTail(values: number[], alpha: number): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const k = Math.max(1, Math.floor(alpha * sorted.length));
  return preciseSum(sorted.slice(0, k)) / k;
}
```

### UI Example

| Metric | P10 | CVaR 10% | Interpretation |
|---|---:|---:|---|
| DSCR | 0.95 | 0.78 | Tail failures are severe, not just marginal |
| Monthly cash flow | -$1,200 | -$3,400 | Reserve burn risk is high |
| IRR | 4.2% | -2.1% | Downside destroys return |

---

## 9.3 Probability of Ruin

Replace fixed reserve multiples with probability-targeted reserves.

```ts
function probabilityOfRuin(paths: { reserveBalances: number[] }[]): number {
  const ruined = paths.filter(path => path.reserveBalances.some(x => x < 0)).length;
  return ruined / paths.length;
}
```

### Reserve Optimization

```ts
target: P(reserveBalance < 0 at any month) < 5%
solve: minimum initialReserve
method: ITP / bisection
```

---

## 9.4 Sobol Sensitivity Indices

Tornado charts are one-variable-at-a-time. They miss interactions.

Sobol indices answer:

- How much output variance comes from each variable alone?
- How much comes from each variable including interactions?
- Which variables are dangerous only in combination?

### Outputs

| Variable | First-Order Index | Total-Effect Index | Interaction Gap |
|---|---:|---:|---:|
| Rent growth | 0.24 | 0.45 | 0.21 |
| Vacancy | 0.18 | 0.39 | 0.21 |
| Cap rate | 0.31 | 0.52 | 0.21 |
| Interest rate | 0.08 | 0.22 | 0.14 |

### Interpretation

High interaction gap means the variable is more dangerous in combination than in isolation.

---

## 9.5 Risk-Adjusted Return Metrics

Add these metrics after core stochastic outputs are stable:

| Metric | Use |
|---|---|
| Sharpe ratio | Return per unit total volatility |
| Sortino ratio | Return per unit downside volatility |
| Calmar ratio | Return relative to max drawdown |
| Omega ratio | Probability-weighted upside vs downside |
| CVaR-adjusted IRR | Return after penalizing tail loss |
| Expected utility | Investor-specific risk preference |

---

## 10. Product-Specific Financial Modeling

## 10.1 Amortization & Prepayment

### Problem

Constant CPR is too simple. Borrower prepayment seasons over time.

### Upgrade

Use PSA-style seasoning curves.

```text
SMM = 1 - (1 - CPR)^(1/12)
CPR_t ramps over first 30 months, then plateaus
```

### Add Weighted Average Life

```text
WAL = Σ(PrincipalPayment_i × Time_i) / TotalLoanAmount
```

WAL is essential for:

- Bridge loans.
- High-PPP loans.
- Refi-heavy strategies.
- DSCR loans expected to prepay long before legal maturity.

---

## 10.2 DSCR & Stabilization

### Add Forward-Looking Annual DSCR

Trailing DSCR is not enough. Add FADSCR:

```text
FADSCR = Forward_12_Month_NOI / Forward_12_Month_Debt_Service
```

### Use Mean-Reverting NOI

Use OU/AR(1) rather than perpetual exponential growth.

---

## 10.3 Waterfalls & Promotes

### Problem

European waterfall hurdle logic is often implemented incorrectly as a simple overall IRR test.

### Correct Direction

- Compute incremental clearance through each hurdle tier.
- Track contributed capital.
- Track distributions.
- Run IRR test on relevant cash-flow stream.
- Add clawback simulation based on interim hypothetical liquidation values.

### Required Warnings

If multiple sign changes exist in the waterfall cash-flow stream:

- Show IRR ambiguity warning.
- Use MIRR companion metric.
- Show NPV at hurdle rate.

---

## 10.4 Exit & Defeasance

### Cap Rates

Model exit cap rate as:

```text
Exit Cap = Treasury Tenor + Spread + Property Risk Premium
```

### Defeasance

Use Nelson-Siegel-Svensson yield curve for discounting defeasance cash flows.

```text
y(t) = β0
     + β1 * ((1 - exp(-t/τ1)) / (t/τ1))
     + β2 * (((1 - exp(-t/τ1)) / (t/τ1)) - exp(-t/τ1))
     + β3 * (((1 - exp(-t/τ2)) / (t/τ2)) - exp(-t/τ2))
```

### Add Fixed-Income Metrics

- Macaulay duration.
- Modified duration.
- DV01.
- Convexity.

---

## 10.5 Refinance / Points Analysis

Do not compare points only by static APR. Add:

- Breakeven month.
- Duration-adjusted cost.
- Refi probability.
- Convexity.
- Rate path sensitivity.
- Borrower exit probability.

---

## 10.6 BRRRR / Seasoning-Aware Cash-Out

Replace binary seasoning gates with optimal timing.

### Required Inputs

- Initial acquisition date.
- Rehab completion date.
- Stabilization month.
- Lender seasoning rule.
- Post-rehab NOI distribution.
- Reappraisal uncertainty.
- Refi rate distribution.
- Exit/cash-out constraints.

### Objective

Maximize risk-adjusted cash-out proceeds subject to:

- DSCR minimum.
- LTV maximum.
- Reserve minimum.
- Probability of ruin.
- Expected IRR.

---

## 10.7 Lender Matching as Optimization

Replace simple lender ranking with a constrained multi-objective optimization.

### Objective Dimensions

- Rate.
- Points/fees.
- DSCR buffer.
- Close time.
- Reserve requirement.
- Prepayment penalty.
- IO availability.
- Cash-out limits.
- State/program eligibility.
- Execution certainty.

### Output

- Pareto frontier.
- Best conservative lender.
- Best max-proceeds lender.
- Best speed lender.
- Best risk-adjusted lender.

---

## 11. Tax, Depreciation & After-Tax Returns

## 11.1 Cost Segregation Module

```ts
interface CostSegComponent {
  name: string;
  cost: number;
  lifeYears: 5 | 7 | 15 | 27.5 | 39;
  bonusEligible: boolean;
}

interface CostSegInput {
  enabled: boolean;
  components: CostSegComponent[];
}
```

### Year-1 Depreciation

```ts
function costSegDepreciationYear(
  components: CostSegComponent[],
  year: number,
  bonusRate: number
): number {
  let total = 0;

  for (const component of components) {
    if (year === 1 && component.bonusEligible) {
      const bonus = component.cost * bonusRate;
      const remainingBasis = component.cost - bonus;
      total += bonus + remainingBasis / component.lifeYears;
    } else {
      total += component.cost / component.lifeYears;
    }
  }

  return total;
}
```

---

## 11.2 Passive Activity Loss / §469

The tax layer must handle:

- Passive loss limitation.
- Real estate professional status.
- Active participation allowance.
- Income phase-outs.
- Suspended passive losses.
- Release on disposition.

### Required Output

- Current-year allowed loss.
- Suspended loss carryforward.
- Tax savings actually usable this year.
- Tax savings deferred to future years.

---

## 11.3 NIIT

The after-tax module should explicitly model NIIT rather than burying it in a flat tax rate.

Inputs:

- Filing status.
- MAGI.
- Net investment income.
- Rental activity classification.
- Active/passive status.

---

## 11.4 Opportunity Zone Deferral

The source material states the engine should treat Opportunity Zone deferral as ending on the earlier of:

- Inclusion event.
- December 31, 2026.

### Required Design

```ts
interface OpportunityZoneResult {
  deferredGain: number;
  inclusionDate: Date;
  warnings: string[];
}
```

The model should not assume an indefinite deferral.

---

## 11.5 After-Tax IRR

Replace flat tax rate with period-by-period tax calculation.

```ts
interface AfterTaxCashFlowPeriod {
  year: number;
  beforeTaxCashFlow: number;
  depreciation: number;
  interestExpense: number;
  taxableIncome: number;
  allowedPassiveLoss: number;
  qbiDeduction: number;
  niit: number;
  taxDueOrSavings: number;
  afterTaxCashFlow: number;
}
```

### Required IRR Logic

- Build after-tax cash-flow series.
- Solve with ITP in `log1p(rate)` space.
- Show tax warnings separately.
- Provide after-tax IRR, MIRR, and NPV at investor hurdle.

---

## 12. Portfolio, Credit Risk & Reserves

## 12.1 Modified Dietz Portfolio Return

Use Modified Dietz for portfolios with mid-period cash flows.

```text
Modified Dietz Return =
(Ending Value - Beginning Value - Net Flows)
/
(Beginning Value + Σ(Flow_i × Weight_i))
```

Use cases:

- Multi-property portfolio performance.
- Contributions/distributions during holding period.
- Investor reporting.

---

## 12.2 Risk Parity Allocation

Move from capital-weighted portfolio summaries to risk-aware allocation.

### Required Inputs

- Expected returns.
- Volatility.
- Correlation matrix.
- CVaR contributions.
- Debt maturity ladder.
- Geographic concentration.
- Property type concentration.

### Output

- Capital weight.
- Risk contribution.
- Marginal CVaR contribution.
- Suggested rebalancing.

---

## 12.3 PD / LGD / EAD Framework

Add a credit-risk layer:

| Metric | Meaning |
|---|---|
| PD | Probability of default |
| LGD | Loss given default |
| EAD | Exposure at default |
| EL | Expected loss = PD × LGD × EAD |

### Property-Level PD Inputs

- Current DSCR.
- Stressed DSCR.
- LTV.
- Liquidity/reserves.
- Occupancy volatility.
- Rent concentration.
- Maturity/refi risk.
- Market stress index.

---

## 12.4 Merton-Style Distance to Default

Use as a structural proxy:

```text
Distance to Default = (Asset Value - Default Boundary) / Asset Volatility
```

For DSCR real estate:

```text
Asset Value ≈ NOI / Cap Rate
Default Boundary ≈ Loan Balance or Refi Proceeds Constraint
```

---

## 12.5 Reserve Adequacy

Replace:

```text
Required reserves = 3 months debt service
```

With:

```text
Minimum reserves = smallest reserve amount such that P(ruin) < target
```

### Example

| Reserve Amount | P(Ruin) |
|---:|---:|
| $10,000 | 18% |
| $25,000 | 9% |
| $40,000 | 4.8% |
| $60,000 | 2.1% |

If target is 5%, required reserve is `$40,000`.

---

## 13. Sensitivity, Scenario Comparison & Validation

## 13.1 Common Random Numbers

Use the same random draws when comparing scenario A vs. scenario B.

### Why

Without CRN, the difference between two scenarios can be polluted by sampling noise.

### Use Cases

- Compare lender offers.
- Compare rate buy-downs.
- Compare refinance timing.
- Compare reserve policies.
- Compare cost-seg election choices.

---

## 13.2 Block Bootstrap

Use block bootstrap for historical stress scenarios so autocorrelation is preserved.

### Use Cases

- Rent growth history.
- Vacancy series.
- Treasury/cap spread history.
- Insurance inflation.
- Regional market cycles.

---

## 13.3 Extreme Value Theory

Use EVT/GPD for the worst 5–10% of simulated outcomes only after core CVaR is stable.

### Use Cases

- Worst-case reserve burn.
- Catastrophic CapEx.
- Tail DSCR collapses.
- Tail refi failure.

---

## 13.4 Regression Suite

Every model upgrade must be protected by deterministic tests.

### Required Tests

| Module | Required Test |
|---|---|
| LTV | Purchase uses lower-of by default |
| Affordable LTV | Program flag uses appraised value |
| XIRR/XNPV | Matches Excel test cases under `excel365` |
| Stable PMT | Matches naive formula at normal rates, remains stable near zero |
| NPV | Horner result matches direct NPV within tolerance |
| Solver | ITP root matches Brent within tolerance on monotone bracket |
| IRR | Multiple sign-change flows warn correctly |
| Sobol | Rejects or rounds non-power-of-two sample counts |
| QMC | Does not skip first point |
| Correlation | Rejects non-PSD matrices |
| CVaR | Correctly averages worst alpha tail |
| Tax | Uncertain QBI returns warning |
| Bonus depreciation | Binding-contract/election/date flags change result |
| Reserves | Reserve optimization hits target P(ruin) |

---

## 14. Implementation Roadmap

## 14.1 Red Tier — Must Do

| Priority | Change | Effort | Impact |
|---:|---|---:|---|
| 1 | Fix purchase LTV lower-of logic | Low | Correctness |
| 2 | Add Affordable LTV explicit override | Low | Correctness / eligibility |
| 3 | Change XIRR/XNPV default to Excel 365 | Low | Spreadsheet parity |
| 4 | Add day-count convention setting | Low | Auditability |
| 5 | Add stable numerics core | Low-Medium | Precision foundation |
| 6 | Add precise summation | Low | NPV/XNPV accuracy |
| 7 | Add tax-year version tables | Medium | Legal/compliance |
| 8 | Fix bonus depreciation date/election logic | Medium | Tax correctness |
| 9 | Add legal-review warning framework | Low | Risk control |

## 14.2 Orange Tier — High Priority

| Priority | Change | Effort | Impact |
|---:|---|---:|---|
| 10 | Implement ITP root solver | Medium | Robust solves |
| 11 | Solve IRR/XIRR in `log1p(rate)` space | Medium | Stability |
| 12 | Add MIRR companion metric | Low | Better irregular-flow reporting |
| 13 | Split MC into pseudo-random/QMC modes | Medium | Architecture |
| 14 | Replace Halton with scrambled Sobol | Medium | QMC convergence |
| 15 | Enforce Sobol power-of-two samples | Low | Correct QMC behavior |
| 16 | Add AS241 inverse normal | Medium | Tail accuracy |
| 17 | Add full covariance matrix validation | Medium | Dependence correctness |
| 18 | Add CVaR metrics | Low | Tail risk reporting |
| 19 | Add probability of ruin | Medium | Reserve risk |

## 14.3 Yellow Tier — Medium Priority

| Priority | Change | Effort | Impact |
|---:|---|---:|---|
| 20 | Add Iman-Conover rank correlation | Medium | Arbitrary marginals |
| 21 | Add Student-t copula | Medium-High | Tail dependence |
| 22 | Add Clayton copula | Medium | Lower-tail stress |
| 23 | Add heavy-tailed marginals | Medium | Better risk modeling |
| 24 | Add OU rent/NOI model | Medium | Stabilization realism |
| 25 | Add Vasicek/CIR rate paths | Medium | ARM/refi stress |
| 26 | Add Sobol sensitivity indices | Medium | Replace tornado limits |
| 27 | Add PSA prepayment curve | Medium | Better loan life |
| 28 | Add WAL | Low | Duration insight |
| 29 | Add FADSCR | Low | Forward DSCR view |
| 30 | Add after-tax IRR period engine | High | Investor realism |

## 14.4 Green Tier — Nice to Have

| Priority | Change | Effort | Impact |
|---:|---|---:|---|
| 31 | Nelson-Siegel-Svensson curve | High | Defeasance precision |
| 32 | DV01 / duration / convexity | Low-Medium | Fixed-income analytics |
| 33 | Block bootstrap | Medium | Historical stress |
| 34 | EVT / GPD tail fitting | Medium | Extreme tail risk |
| 35 | PD/LGD/EAD framework | High | Credit-risk platform |
| 36 | Risk parity allocation | Medium | Portfolio allocation |
| 37 | Modified Dietz return | Low | Portfolio reporting |
| 38 | Pareto lender matching | Medium-High | Decision quality |
| 39 | Vine copulas | High | Advanced dependence |
| 40 | Halley polish | Low | Solver refinement |

---

## 15. Suggested Module Structure

```text
src/
├── core/
│   ├── numerics/
│   │   ├── logRate.ts
│   │   ├── summation.ts
│   │   ├── pmt.ts
│   │   ├── npv.ts
│   │   ├── xnpv.ts
│   │   ├── roots/
│   │   │   ├── itp.ts
│   │   │   ├── brent.ts
│   │   │   └── bracket.ts
│   │   └── distributions/
│   │       ├── normalAS241.ts
│   │       ├── studentT.ts
│   │       └── beta.ts
│   │
│   ├── finance/
│   │   ├── ltv.ts
│   │   ├── amortization.ts
│   │   ├── prepayment.ts
│   │   ├── dscr.ts
│   │   ├── duration.ts
│   │   └── irr.ts
│   │
│   ├── simulation/
│   │   ├── config.ts
│   │   ├── pseudoRandom.ts
│   │   ├── qmcSobol.ts
│   │   ├── lhs.ts
│   │   ├── covariance.ts
│   │   ├── imanConover.ts
│   │   ├── copulas.ts
│   │   ├── stochasticProcesses.ts
│   │   └── pathEngine.ts
│   │
│   ├── risk/
│   │   ├── cvar.ts
│   │   ├── ruin.ts
│   │   ├── sobolSensitivity.ts
│   │   ├── pdLgdEad.ts
│   │   └── ratios.ts
│   │
│   ├── tax/
│   │   ├── taxRules.ts
│   │   ├── bonusDepreciation.ts
│   │   ├── costSeg.ts
│   │   ├── qbi.ts
│   │   ├── pal.ts
│   │   ├── niit.ts
│   │   ├── opportunityZone.ts
│   │   └── afterTaxIrr.ts
│   │
│   └── decision/
│       ├── lenderMatching.ts
│       ├── pareto.ts
│       ├── reserveOptimization.ts
│       ├── riskParity.ts
│       └── portfolioReturns.ts
│
└── tests/
    ├── numerics/
    ├── finance/
    ├── simulation/
    ├── risk/
    ├── tax/
    └── regression/
```

---

## 16. UX / Reporting Requirements

## 16.1 Deal Summary Should Separate Two Truths

A DSCR underwriting platform must separate:

1. **Lender Qualification Truth** — whether the loan qualifies under lender/program rules.
2. **Investor Survival Truth** — whether the deal survives under realistic stress.

### Example Output

```text
Lender Qualification:
- DSCR: 1.24x
- Minimum DSCR: 1.20x
- LTV: 72.5%
- Eligible: Yes
- Pricing note: DSCR barely above cliff

Investor Survival:
- P(DSCR < 1.00): 18%
- CVaR DSCR 10%: 0.74x
- P(negative cash flow): 27%
- Required reserves for P(ruin)<5%: $42,000
- Main risk driver: vacancy + insurance interaction
```

---

## 16.2 Required Risk Panels

### Panel 1 — Deterministic Qualification

- Loan amount.
- LTV.
- DSCR.
- Rate.
- Payment.
- Reserve requirement.
- Eligibility.
- Pricing tier.

### Panel 2 — Stress DSCR

- Base DSCR.
- +100 bps DSCR.
- +200 bps DSCR.
- Vacancy stress.
- Expense stress.
- Tax/insurance stress.
- IO-to-amortizing reset stress.

### Panel 3 — Monte Carlo Distribution

- P10/P50/P90 DSCR.
- P10/P50/P90 cash flow.
- P10/P50/P90 IRR.
- Probability DSCR below thresholds.
- Probability negative cash flow.

### Panel 4 — Tail Risk

- CVaR 5%.
- CVaR 10%.
- Worst 1% average.
- Probability of ruin.
- Reserve needed for target ruin probability.

### Panel 5 — Sensitivity

- Sobol first-order.
- Sobol total-effect.
- Interaction gap.
- Tornado chart as explanatory secondary view.

### Panel 6 — Tax / After-Tax

- Depreciation.
- Bonus depreciation.
- Cost segregation benefit.
- PAL limitations.
- QBI warning/status.
- NIIT.
- After-tax cash flow.
- After-tax IRR.

---

## 17. Source Verification Notes

The uploaded files made several claims that depend on external rules or technical documentation. The following public-source verification points were used while organizing this version:

- Fannie Mae Selling Guide describes purchase LTV property value as the lower of sales price or appraised value for purchase-money transactions.
- Fannie Mae Affordable LTV/shared-equity guidance describes an exception using appraised value rather than the lesser of sales price and appraised value.
- Microsoft XIRR and XNPV documentation describes succeeding payments as discounted on a 365-day year.
- IRS Notice 2026-11 and the related IRS news release describe permanent 100% additional first-year depreciation for eligible property acquired after January 19, 2025, with election mechanics.
- IRS QBI materials still require versioning/legal review because the uploaded materials identified conflicting 2026 treatment signals.
- SciPy Brent/Sobol/QMC documentation supports using robust bracketed solvers and preserving Sobol rules such as power-of-two samples and no first-point skipping.
- MDN documentation supports `Math.sumPrecise()` for more accurate summation than loop-based addition and describes precision benefits around floating-point operations.

---

## 18. Final Specification Verdict

The best version of the DSCR underwriting engine is not merely more feature-heavy. It is more **auditable**, **numerically stable**, **legally versioned**, **tail-risk aware**, and **decision-oriented**.

### Final Build Standard

```text
v14 must be:
- Deterministic where rules are deterministic.
- Stochastic where risk is stochastic.
- Versioned where law changes.
- Bracketed where solving roots.
- Tail-aware where underwriting can fail.
- Explicit where assumptions are uncertain.
- Auditable where users compare against Excel/lenders/tax professionals.
```

### Final Priority

1. Correctness fixes.
2. Stable numerics.
3. Versioned tax rules.
4. ITP/Brent solver layer.
5. Sobol QMC simulation.
6. CVaR/probability-of-ruin risk metrics.
7. Dependence modeling and heavy tails.
8. Stochastic rates/rents/cap rates.
9. Portfolio and lender decision optimization.
10. Advanced institutional modules.

---

## 19. Compact Build Prompt for an AI Coding Agent

Use this as the implementation directive:

```text
Upgrade the DSCR underwriting engine to v14 by first fixing deterministic correctness (purchase LTV lower-of logic, Excel-compatible XIRR/XNPV day-count, year-versioned tax/depreciation rules), then routing all finance math through a stable numerics core (`log1p`, `expm1`, precise summation, Horner NPV), replacing fragile root solves with bracketed ITP/Brent solvers in `log1p(rate)` space, splitting simulation into pseudo-random and scrambled-Sobol QMC modes, and adding institutional risk outputs including CVaR, probability of ruin, Sobol sensitivity indices, tail-dependent copulas, stochastic rates/rents/cap rates, and auditable warnings for uncertain tax/legal assumptions.
```

---

## 20. End State Checklist

A build is not v14-complete unless the following are true:

- [ ] Purchase LTV lower-of logic implemented.
- [ ] Affordable LTV override implemented as explicit flag.
- [ ] XIRR/XNPV defaults to `excel365`.
- [ ] Day-count convention exported in reports.
- [ ] Stable PMT implemented.
- [ ] Stable remaining balance implemented.
- [ ] Stable XNPV implemented.
- [ ] Precise summation implemented.
- [ ] Horner NPV implemented.
- [ ] ITP or Brent solver implemented.
- [ ] IRR solved in `log1p(rate)` space.
- [ ] Multiple-IRR warnings implemented.
- [ ] MIRR added.
- [ ] Tax rules moved to year/version tables.
- [ ] Bonus depreciation date/election logic implemented.
- [ ] QBI uncertainty warning implemented.
- [ ] Cost segregation module implemented.
- [ ] After-tax IRR framework implemented.
- [ ] Simulation mode split implemented.
- [ ] Sobol QMC implemented.
- [ ] Sobol power-of-two enforcement implemented.
- [ ] First-point skipping disabled.
- [ ] AS241 inverse normal implemented.
- [ ] Full covariance matrix validation implemented.
- [ ] Iman-Conover added or queued.
- [ ] CVaR added.
- [ ] Probability of ruin added.
- [ ] Reserve optimization added.
- [ ] Sobol sensitivity indices added.
- [ ] Student-t copula added or queued.
- [ ] Clayton copula added or queued.
- [ ] OU rent model added or queued.
- [ ] Vasicek/CIR rate paths added or queued.
- [ ] PSA prepayment and WAL added.
- [ ] FADSCR added.
- [ ] Lender matching reframed as Pareto optimization.
- [ ] Regression tests added for every must-fix item.
- [ ] Tax/legal disclaimer and warning system added.

---

**End of Document**
