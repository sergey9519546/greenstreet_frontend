# IMPLEMENTATION PLAN — Engine Math & Algorithm Upgrades
## DSCR Underwriting Engine v13.0.0 → v15.0.0

**Based on:** External research audit (Phase 1 + Phase 2 combined)
**Status:** 9 items already shipped, 27 items remaining
**Estimated effort:** 6 phases, ~20 hours total

---

## ALREADY SHIPPED (verified in code + runtime)

These items from the research are already implemented and verified:

| # | Item | File | Verified |
|---|------|------|----------|
| ✅ | LTV lower-of (Fix A) | engine.ts | `Math.min(appraisedValue, purchasePrice)` |
| ✅ | XIRR 365-day (Fix B) | solvers-v13.ts | `365 * 24 * 60 * 60 * 1000` |
| ✅ | QBI legal-review flag (Fix C) | engine.ts | "LEGAL REVIEW" note in qbi_deduction |
| ✅ | Bonus dep elect-out (Fix D) | after-tax.ts | `electOut` parameter on getBonusDepPct |
| ✅ | Brent's method IRR/XIRR | solvers-v13.ts | Full Brent implementation with IQI |
| ✅ | log1p/expm1 PMT + remainingBalance | solvers-v13.ts | Stable forms |
| ✅ | Horner NPV | solvers-v13.ts | O(n) recurrence, no pow() |
| ✅ | AS241 normal inversion | solvers-v13.ts | Wichura coefficients |
| ✅ | MIRR | solvers-v13.ts | Separate finance/reinvest rates |
| ✅ | LLCR/PLCR | solvers-v13.ts | NPV-based forward coverage |
| ✅ | Yield maintenance proper formula | ppp-optimizer.ts | Monthly PV sum |
| ✅ | Cholesky 4D covariance | monte-carlo.ts | Full covariance matrix |
| ✅ | Antithetic variates | monte-carlo.ts | (z, -z) pairs |
| ✅ | PAL rules §469 | engine.ts | Allowance + suspended losses |
| ✅ | Foreign national | engine.ts | LLPA + ITIN flag |
| ✅ | Bridge loan wired | engine.ts | calculateBridgeLoan called |
| ✅ | Seller financing wired | engine.ts | calculateSellerFinancing called |

---

## PHASE 1: Numerics Core (Priority: 🔴 Must-do)
**Effort:** ~2 hours | **Impact:** Precision floor for everything downstream

### 1.1 Add Neumaier compensated summation
**Problem:** `Math.sumPrecise()` is not yet widely available. NPV/XNPV alternating-sign sums lose precision.  
**Fix:** Implement Neumaier (Kahan-Babuška) compensated summation as a utility:
```ts
function neumaierSum(values: number[]): number {
  let sum = 0, c = 0; // c = compensation
  for (const v of values) {
    const t = sum + v;
    if (Math.abs(sum) >= Math.abs(v)) c += (sum - t) + v;
    else c += (v - t) + sum;
    sum = t;
  }
  return sum + c;
}
```
**File:** solvers-v13.ts  
**Route through:** NPV, XNPV, true-cost total, Monte Carlo statistics  
**Test:** `neumaierSum([1e16, 1, -1e16])` should return `1` (naive returns `0`)

### 1.2 Add stable discount factor primitive
**Problem:** Repeated `Math.pow(1+rate, years)` loses precision for fractional years.  
**Fix:**
```ts
function discountFactor(rate: number, years: number): number {
  return Math.exp(-years * Math.log1p(rate));
}
```
**File:** solvers-v13.ts  
**Route through:** XNPV (replaces `1/Math.pow(1+rate, years)`), defeasance PV

### 1.3 Add log1p-rate transform for IRR
**Problem:** IRR solver works in rate space where `r > -1` is required but not enforced.  
**Fix:** Transform to `y = log1p(r)`, solve in y-space where `y ∈ (-∞, ∞)`, convert back with `r = expm1(y)`. Discount factors become `exp(-t*y)`.  
**File:** solvers-v13.ts (irr function)  
**Benefit:** Naturally enforces `r > -1`, better precision near zero, no bracket needed for the `> -1` constraint

### 1.4 Welford's online algorithm for Monte Carlo statistics
**Problem:** Running sum/sum-of-squares loses precision for large N (1000+ iterations).  
**Fix:**
```ts
// Welford update
n += 1;
delta = x - mean;
mean += delta / n;
M2 += delta * (x - mean);
variance = M2 / (n - 1);
```
**File:** monte-carlo.ts (replace current sum/sumOfSquares accumulation)  
**Benefit:** Numerically stable for any N, one-pass, no precision loss

---

## PHASE 2: Solver Upgrades (Priority: 🟠 High)
**Effort:** ~3 hours | **Impact:** Speed + robustness across all root-finding

### 2.1 ITP root-finder (replaces Brent for breakeven/max-price solvers)
**Problem:** Brent is good but ITP (Interpolate Truncate Project) has optimal worst-case complexity and superlinear convergence.  
**Algorithm:** ITP combines bisection, regula falsi, and a projection step. Worst-case ≤ bisection iterations, typical case ~5-8 iterations.  
**Files:** solvers.ts (solveBreakevenRate, solveMaxPurchasePrice)  
**Effort:** ~80 lines  
**Note:** Keep Brent for IRR (already works well). ITP for bracketed DSCR target solves.

### 2.2 Apply Brent to all bracketed solvers
**Problem:** solvers.ts still uses Newton-Raphson + bisection for breakeven rate and max purchase price.  
**Fix:** Replace with Brent's method (already implemented in solvers-v13.ts)  
**Files:** solvers.ts — `solveBreakevenRate`, `solveMaxPurchasePrice`  
**Effort:** ~30 lines per solver (extract Brent as shared utility)

### 2.3 Halley's method for after-tax IRR polishing
**Problem:** after-tax.ts has its own bisection-only solver with narrow bounds.  
**Fix:** Replace with: (1) Brent for bracketing, (2) optional Halley polish for machine precision  
**Formula:** `x_{n+1} = x_n − 2·f·f' / (2·f'² − f·f'')` where `f'' = NPV''(rate)`  
**File:** after-tax.ts  
**Effort:** ~30 lines

### 2.4 Unify all IRR solvers
**Problem:** 3 separate IRR solvers exist: engine.ts (solveSimpleIrr, solveStandardIrr), after-tax.ts (solveIrr), waterfall.ts (solveIrr).  
**Fix:** Delete all 3, import `irr()` from solvers-v13.ts everywhere.  
**Files:** engine.ts, after-tax.ts, waterfall.ts  
**Effort:** ~15 lines of import changes + delete ~100 lines of dead code

---

## PHASE 3: Monte Carlo Redesign (Priority: 🟠 High)
**Effort:** ~4 hours | **Impact:** Convergence speed + tail accuracy

### 3.1 Scrambled Sobol' sequence (replaces Halton)
**Problem:** Halton degrades in dimensions > 6. Engine has 5-6 stochastic dimensions.  
**Fix:** Implement scrambled Sobol' with Owen scrambling. Use power-of-2 sample counts (1024 or 2048 instead of 1000). Never skip first point.  
**File:** solvers-v13.ts (new `sobol()` function) + monte-carlo.ts (switch from Halton)  
**Effort:** ~150 lines for Sobol' direction numbers + scrambling  
**Test:** Verify P50 DSCR within 2% of current Halton result on same deal

### 3.2 PCG/sfc32 PRNG (replaces mulberry32)
**Problem:** mulberry32 has decent but not cryptographic statistical quality. PCG64 is NumPy's default.  
**Fix:** Implement sfc32 (small, fast, excellent statistical quality) or PCG32.  
**File:** monte-carlo.ts (replace seededRandom)  
**Effort:** ~40 lines

### 3.3 Split MC into pseudo-random + QMC modes
**Problem:** Currently one mode (pseudo-random with antithetic).  
**Fix:**
- **Pseudo-random mode:** sfc32 PRNG + Ziggurat normals (2-10x faster than Box-Muller)
- **QMC mode:** Scrambled Sobol' + inverse-normal transform (AS241) + Box-Muller
- Default: QMC (faster convergence), fallback: pseudo-random for arbitrary N  
**File:** monte-carlo.ts  
**Effort:** ~100 lines refactoring

### 3.4 Iman-Conover rank correlation
**Problem:** Cholesky decomposition imposes Gaussian copula structure — no tail dependence.  
**Fix:** Iman-Conover preserves the marginal distributions but induces a target rank correlation matrix. Works with any marginal (not just Gaussian).  
**File:** monte-carlo.ts  
**Effort:** ~100 lines

### 3.5 CVaR / Expected Shortfall
**Problem:** Current risk reporting uses P10/P50/P90 and P(DSCR<1.0). CVaR is the institutional standard.  
**Fix:** Compute CVaR at 5% and 10% levels:
```ts
CVaR_5% = mean of worst 5% of DSCR outcomes
```
**File:** monte-carlo.ts + engine.ts (add to monte_carlo output block)  
**Effort:** ~30 lines  
**Surface in UI:** StoryFlow risk section + drilldown

### 3.6 Latin Hypercube Sampling option
**Problem:** When user wants arbitrary N (not power of 2), Sobol' loses properties.  
**Fix:** Add LHS as third mode for arbitrary sample sizes. LHS variance < plain MC for nearly additive integrands.  
**File:** monte-carlo.ts  
**Effort:** ~60 lines

---

## PHASE 4: Tax Logic Versioning (Priority: 🟠 High)
**Effort:** ~2 hours | **Impact:** Legal compliance

### 4.1 Year/version-gated tax tables
**Problem:** Tax thresholds (QBI, PAL, bonus dep, §179) are hardcoded in code. They change annually.  
**Fix:** Create `tax-tables.ts` with year-indexed tables:
```ts
const TAX_TABLES = {
  2025: { qbiPhaseOutStartMFJ: 383900, qbiPhaseOutEndMFJ: 483900, ... },
  2026: { qbiPhaseOutStartMFJ: 395000, qbiPhaseOutEndMFJ: 495000, ... }, // projected
};
```
**File:** new `tax-tables.ts`  
**Route through:** engine.ts (QBI, PAL), after-tax.ts (bonus dep, §179), alternative-financing.ts (cost seg)

### 4.2 §179 updated limits (OBBBA)
**Problem:** §179 deduction increased from $1M to $2.5M, phaseout from $2M to $4M. Not in engine.  
**Fix:** Add to tax tables + cost seg module.

### 4.3 State non-conformity flag
**Problem:** Many states don't conform to federal bonus depreciation.  
**Fix:** Add `state_conforms_bonus_dep` boolean to state-overlays.ts for each state. Adjust cost seg state-tax savings accordingly.

### 4.4 QBI 2026 status resolution
**Problem:** IRS materials are not aligned on whether QBI deduction continues in 2026.  
**Fix:** Compute the deduction but show "Subject to legislative confirmation" flag until IRS publishes definitive 2026 guidance. Already partially done — formalize into version table.

---

## PHASE 5: Advanced Financial Models (Priority: 🟡 Medium)
**Effort:** ~6 hours | **Impact:** Institutional-grade analytics

### 5.1 Vasicek/CIR interest rate model for ARM stress
**Problem:** ARM reset currently uses static SOFR + margin. Real rates follow mean-reverting stochastic processes.  
**Fix:** Implement Vasicek model: `dr_t = κ(θ − r_t)dt + σdW_t`  
**File:** new `rate-models.ts` + arm-reset.ts  
**Effort:** ~150 lines

### 5.2 Nelson-Siegel-Svensson yield curve for defeasance
**Problem:** Defeasance uses single Treasury yield. Real defeasance requires matching each payment to a Treasury of corresponding maturity.  
**Fix:** Fit NSS curve to Treasury yield data, use fitted curve to discount each payment at its matching maturity.  
**File:** exchange.ts (defeasance)  
**Effort:** ~200 lines + data source

### 5.3 Ornstein-Uhlenbeck NOI stabilization (Track 3)
**Problem:** Track 3 uses flat `NOI × (1+growth)^3`. Real estate cycles are mean-reverting.  
**Fix:** `NOI_{t+1} = NOI_t + κ(θ − NOI_t)Δt + σε√Δt` where θ = market equilibrium rent, κ = reversion speed  
**File:** engine.ts (Track 3 computation)  
**Effort:** ~80 lines

### 5.4 PSA prepayment seasoning curves
**Problem:** PPP uses step-down percentages. Real borrowers prepay along a seasoning curve.  
**Fix:** PSA model: CPR ramps from 0% to 6% over 30 months, then plateaus. SMM = 1−(1−CPR)^(1/12).  
**File:** ppp-optimizer.ts  
**Effort:** ~50 lines

### 5.5 Weighted Average Life (WAL)
**Problem:** Not computed. Critical for bridge/high-PPP loans.  
**Fix:** `WAL = Σ(Principal_i × Time_i) / Total_Loan`  
**File:** solvers-v13.ts or true-cost.ts  
**Effort:** ~30 lines

### 5.6 Macaulay/Modified Duration + DV01
**Problem:** Not computed. Essential for hedging and rate sensitivity.  
**Fix:**
```
Macaulay_Duration = Σ(t × PV(CF_t)) / Price
Modified_Duration = Macaulay / (1 + y/n)
DV01 = Modified_Duration × Price × 0.0001
```
**File:** solvers-v13.ts  
**Effort:** ~30 lines

### 5.7 CVaR with Generalized Pareto Distribution (EVT)
**Problem:** Normal distribution underestimates tail risk. Real estate has fat tails.  
**Fix:** Fit worst 5% of MC outcomes to GPD. Report CVaR from GPD fit.  
**File:** monte-carlo.ts  
**Effort:** ~100 lines

### 5.8 Sobol sensitivity indices (replaces tornado chart)
**Problem:** Tornado chart uses one-at-a-time sensitivity. Sobol indices decompose variance into first-order + total-order effects.  
**Fix:** Compute Sobol' total-order sensitivity index S_Ti for each variable.  
**File:** new `sobol-sensitivity.ts`  
**Effort:** ~80 lines

### 5.9 Student-t copula option
**Problem:** Gaussian copula has no tail dependence. Student-t captures joint extremes.  
**Fix:** Add t-copula with degrees of freedom ν. As ν→∞, converges to Gaussian (backward compatible).  
**File:** monte-carlo.ts  
**Effort:** ~80 lines

### 5.10 Clayton copula for asymmetric rent↔vacancy
**Problem:** Rent and vacancy crash together in downturns but don't boom together. Gaussian is symmetric.  
**Fix:** Clayton copula captures lower-tail dependence only.  
**File:** monte-carlo.ts  
**Effort:** ~60 lines

---

## PHASE 6: Risk & Portfolio Models (Priority: 🟢 Nice-to-have)
**Effort:** ~4 hours | **Impact:** Institutional portfolio management

### 6.1 Distance to Default (Merton structural model)
**Formula:** `DD = (ln(V/D) + (r − 0.5σ²)T) / (σ√T)`  
**File:** new `credit-risk.ts`  
**Effort:** ~50 lines

### 6.2 PD/LGD/EAD framework
**Problem:** No formal probability of default / loss given default / exposure at default.  
**Fix:** Compute PD from DD, LGD from LTV, EAD from remaining balance.  
**File:** credit-risk.ts  
**Effort:** ~200 lines

### 6.3 Risk-based reserve sizing (P(ruin))
**Problem:** Reserves are "3 months" heuristic. Better: solve for initial reserves where P(ruin) < 5%.  
**Fix:** Bisection on initial reserves until Monte Carlo P(ruin) ≤ 5%.  
**File:** engine.ts (reserves)  
**Effort:** ~80 lines

### 6.4 Risk parity portfolio allocation
**Problem:** Portfolio uses capital-weighted LTV/DSCR. Better: equal risk contribution.  
**Fix:** `Weight_i = (1/σ_i) / Σ(1/σ_j)`  
**File:** alternative-financing.ts (portfolio)  
**Effort:** ~40 lines

### 6.5 Block bootstrap historical stress
**Problem:** Stress scenarios are parametric. Historical bootstrap captures real joint dynamics.  
**Fix:** Resample 12-month blocks from 40 years of SOFR/Treasury/rent/cap-rate data.  
**File:** new `historical-stress.ts`  
**Effort:** ~100 lines + data

### 6.6 Sharpe/Sortino/Calmar/Omega ratios
**Problem:** Only IRR and equity multiple. No risk-adjusted return metrics.  
**Fix:** Add Sharpe (risk-free rate), Sortino (downside deviation), Calmar (max drawdown), Omega (gain/loss ratio).  
**File:** solvers-v13.ts or new `risk-metrics.ts`  
**Effort:** ~50 lines

### 6.7 Period-by-period marginal tax rates
**Problem:** After-tax IRR uses flat tax rate. Real marginal rates change with income.  
**Fix:** For each year: compute taxable income, apply PAL limits, NIIT threshold, QBI phase-out, look up marginal bracket.  
**File:** after-tax.ts  
**Effort:** ~100 lines

### 6.8 BRRRR seasoning-aware cash-out modeling
**Problem:** Binary seasoning gate. Better: seasoning curve with optimal timing.  
**Fix:** 0-6mo: cost basis × 75%, 6-12mo: max(cost, ARV×70%) × 75%, 12+mo: ARV × 75%. Solve for optimal refi timing.  
**File:** reassessment-insurance.ts (BRRRR gate)  
**Effort:** ~60 lines

### 6.9 Stochastic lumpy capex (Poisson process)
**Problem:** Capex is smooth % of EGI. Real capex is lumpy (roof, HVAC failures).  
**Fix:** Poisson process triggers major events randomly during hold: `P(k events) = (λt)^k e^(-λt) / k!`  
**File:** monte-carlo.ts  
**Effort:** ~50 lines

### 6.10 Pareto-frontier lender matching
**Problem:** Single 0-100 match score. Better: multi-objective Pareto frontier.  
**Fix:** Objectives: minimize rate, fees, PPP NPV, DSCR buffer. Output: non-dominated lender set.  
**File:** lender-matching.ts  
**Effort:** ~80 lines

### 6.11 Modified Dietz portfolio return
**Problem:** No GIPS-compliant portfolio return calculation.  
**Fix:** `R_Dietz = (EMV − BMV − CF) / (BMV + Σ(W_i × CF_i))`  
**File:** alternative-financing.ts (portfolio)  
**Effort:** ~40 lines

### 6.12 Cap rate as spread to Treasury
**Problem:** Exit cap is a flat assumption. Better: cap = Treasury + spread + ε.  
**Fix:** Couple cap rate to interest rate process structurally.  
**File:** engine.ts (exit calculations)  
**Effort:** ~50 lines

### 6.13 Convexity in refinance analysis
**Problem:** Linear break-even. Better: include option value of refinancing again.  
**Fix:** `Refi_NPV = Σ(savings_t / (1+r)^t) − refi_cost + option_value`  
**File:** engine.ts (refinance analysis)  
**Effort:** ~60 lines

### 6.14 Common Random Numbers (CRN) for sensitivity comparisons
**Problem:** Each sensitivity scenario uses independent random draws. Better: use same random stream.  
**Fix:** Fix the seed across scenarios, vary only the parameter being stressed.  
**File:** monte-carlo.ts  
**Effort:** ~20 lines (seed plumbing)

### 6.15 Log-sum-exp for probability-weighted aggregation
**Problem:** Rare scenario probabilities can underflow.  
**Fix:** `log Σ p_i x_i = max + log Σ exp(log_p_i + log_x_i − max)`  
**File:** solvers-v13.ts  
**Effort:** ~20 lines

---

## IMPLEMENTATION ORDER

| Priority | Phase | Items | Effort |
|----------|-------|-------|--------|
| 🔴 P0 | Phase 1 | Neumaier sum, discount factor, log1p IRR, Welford stats | 2 hrs |
| 🔴 P0 | Phase 2 | ITP solver, Brent everywhere, Halley polish, unify IRR | 3 hrs |
| 🟠 P1 | Phase 3 | Sobol', PCG, MC modes, Iman-Conover, CVaR, LHS | 4 hrs |
| 🟠 P1 | Phase 4 | Tax tables, §179, state conformity, QBI resolution | 2 hrs |
| 🟡 P2 | Phase 5 | Vasicek, NSS, OU NOI, PSA, WAL, Duration/DV01, GPD, Sobol indices, t-copula, Clayton | 6 hrs |
| 🟢 P3 | Phase 6 | DD/PD/LGD, P(ruin), risk parity, bootstrap, Sharpe/Sortino, marginal tax, BRRRR timing, Poisson capex, Pareto matching, Dietz, cap spread, convexity, CRN, log-sum-exp | 4 hrs |

**Total: ~21 hours for all 42 items (15 already done + 27 remaining)**

---

## VERIFICATION PLAN

After each phase:
1. Run `npx tsx scripts/unit-tests.ts` — all 25 tests must pass
2. Run `npx tsx scripts/verify-solvers-v13.ts` — all 27 tests must pass
3. Run `npx tsx scripts/verify-edge-cases.ts` — all 20 cases must pass
4. Run `npx tsx scripts/verify-v13.ts` — regression must pass
5. Compare IRR results before/after within 1e-6 tolerance
6. Compare Monte Carlo P50 before/after within 2% tolerance
7. Type-check: `npx tsc --noEmit` — no new errors

---

## RISK NOTES

- **Sobol' implementation** is the highest-risk item — direction number tables must be correct. Use Joe & Kuo (2008) tables.
- **Tax tables** must be verified by a CPA before production use.
- **Vasicek/CIR** parameters (κ, θ, σ) must be calibrated to actual market data.
- **NSS yield curve** requires live Treasury data — currently hardcoded anchors.
- **Student-t copula** requires multivariate t-distribution sampling — use Cholesky + gamma mixture.
