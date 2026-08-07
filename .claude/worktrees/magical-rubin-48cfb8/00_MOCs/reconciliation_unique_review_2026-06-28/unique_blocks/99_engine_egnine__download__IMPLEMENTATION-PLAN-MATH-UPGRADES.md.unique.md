# Unique Content Review

- Source path: 99_engine_egnine/download/IMPLEMENTATION-PLAN-MATH-UPGRADES.md
- Archived path: 99_attachments/generated_archive_2026-06-28/p13_generated_stale_2026-06-28/99_engine_egnine/download/IMPLEMENTATION-PLAN-MATH-UPGRADES.md
- Replacement path: docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 2313
- Preliminary classification: GENERATED_ARTIFACT_RETAIN_ARCHIVE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\99_engine_egnine\download\IMPLEMENTATION-PLAN-MATH-UPGRADES.md

## Unique Headings
- # IMPLEMENTATION PLAN — Engine Math & Algorithm Upgrades
- ## DSCR Underwriting Engine v13.0.0 → v15.0.0
- ## ALREADY SHIPPED (verified in code + runtime)
- ## PHASE 1: Numerics Core (Priority: 🔴 Must-do)
- ### 1.1 Add Neumaier compensated summation
- ### 1.2 Add stable discount factor primitive
- ### 1.3 Add log1p-rate transform for IRR
- ### 1.4 Welford's online algorithm for Monte Carlo statistics
- ## PHASE 2: Solver Upgrades (Priority: 🟠 High)
- ### 2.1 ITP root-finder (replaces Brent for breakeven/max-price solvers)
- ### 2.2 Apply Brent to all bracketed solvers
- ### 2.3 Halley's method for after-tax IRR polishing
- ### 2.4 Unify all IRR solvers
- ## PHASE 3: Monte Carlo Redesign (Priority: 🟠 High)
- ### 3.1 Scrambled Sobol' sequence (replaces Halton)
- ### 3.2 PCG/sfc32 PRNG (replaces mulberry32)
- ### 3.3 Split MC into pseudo-random + QMC modes
- ### 3.4 Iman-Conover rank correlation
- ### 3.5 CVaR / Expected Shortfall
- ### 3.6 Latin Hypercube Sampling option
- ## PHASE 4: Tax Logic Versioning (Priority: 🟠 High)
- ### 4.1 Year/version-gated tax tables
- ### 4.2 §179 updated limits (OBBBA)
- ### 4.3 State non-conformity flag
- ### 4.4 QBI 2026 status resolution
- ## PHASE 5: Advanced Financial Models (Priority: 🟡 Medium)
- ### 5.1 Vasicek/CIR interest rate model for ARM stress
- ### 5.2 Nelson-Siegel-Svensson yield curve for defeasance
- ### 5.3 Ornstein-Uhlenbeck NOI stabilization (Track 3)
- ### 5.4 PSA prepayment seasoning curves
- ### 5.5 Weighted Average Life (WAL)
- ### 5.6 Macaulay/Modified Duration + DV01
- ### 5.7 CVaR with Generalized Pareto Distribution (EVT)
- ### 5.8 Sobol sensitivity indices (replaces tornado chart)
- ### 5.9 Student-t copula option
- ### 5.10 Clayton copula for asymmetric rent↔vacancy
- ## PHASE 6: Risk & Portfolio Models (Priority: 🟢 Nice-to-have)
- ### 6.1 Distance to Default (Merton structural model)
- ### 6.2 PD/LGD/EAD framework
- ### 6.3 Risk-based reserve sizing (P(ruin))

## First Unique Blocks

### Block 1
```text
# IMPLEMENTATION PLAN — Engine Math & Algorithm Upgrades ## DSCR Underwriting Engine v13.0.0 → v15.0.0
```

### Block 2
```text
**Based on:** External research audit (Phase 1 + Phase 2 combined) **Status:** 9 items already shipped, 27 items remaining **Estimated effort:** 6 phases, ~20 hours total
```

### Block 3
```text
## ALREADY SHIPPED (verified in code + runtime)
```

### Block 4
```text
These items from the research are already implemented and verified:
```

### Block 5
```text
| # | Item | File | Verified | |---|------|------|----------| | ✅ | LTV lower-of (Fix A) | engine.ts | `Math.min(appraisedValue, purchasePrice)` | | ✅ | XIRR 365-day (Fix B) | solvers-v13.ts | `365 * 24 * 60 * 60 * 1000` | | ✅ | QBI legal-review flag (Fix C) | engine.ts | "LEGAL REVIEW" note in qbi_deduction | | ✅ | Bonus dep elect-out (Fix D) | after-tax.ts | `electOut` parameter on getBonusDepPct | | ✅ | Brent's method IRR/XIRR | solvers-v13.ts | Full Brent implementation with IQI | | ✅ | log1p/expm1 PMT + remainingBalance | solvers-v13.ts | Stable forms | | ✅ | Horner NPV | solvers-v13.ts | O(n) recurrence, no pow() | | ✅ | AS241 normal inversion | solvers-v13.ts | Wichura coefficients | | ✅ | MIRR | solvers-v13.ts | Separate finance/reinvest rates | | ✅ | LLCR/PLCR | solvers-v13.ts | NPV-based forward coverage | | ✅ | Yield maintenance proper formula | ppp-optimizer.ts | Monthly PV sum | | ✅ | Cholesky 4D covariance | monte-carlo.ts | Full covariance matrix | | ✅ | Antithetic variates | monte-carlo.ts | (z, -z) pairs | | ✅ | PAL rules §469 | engine.ts | Allowance + suspended losses | | ✅ | Foreign national | engine.ts | LLPA + ITIN flag | | ✅ | Bridge loan wired | engine.ts | c ... [truncated]
```

### Block 6
```text
## PHASE 1: Numerics Core (Priority: 🔴 Must-do) **Effort:** ~2 hours | **Impact:** Precision floor for everything downstream
```

### Block 7
```text
### 1.1 Add Neumaier compensated summation **Problem:** `Math.sumPrecise()` is not yet widely available. NPV/XNPV alternating-sign sums lose precision. **Fix:** Implement Neumaier (Kahan-Babuška) compensated summation as a utility: ```ts function neumaierSum(values: number[]): number { let sum = 0, c = 0; // c = compensation for (const v of values) { const t = sum + v; if (Math.abs(sum) >= Math.abs(v)) c += (sum - t) + v; else c += (v - t) + sum; sum = t; } return sum + c; } ``` **File:** solvers-v13.ts **Route through:** NPV, XNPV, true-cost total, Monte Carlo statistics **Test:** `neumaierSum([1e16, 1, -1e16])` should return `1` (naive returns `0`)
```

### Block 8
```text
### 1.2 Add stable discount factor primitive **Problem:** Repeated `Math.pow(1+rate, years)` loses precision for fractional years. **Fix:** ```ts function discountFactor(rate: number, years: number): number { return Math.exp(-years * Math.log1p(rate)); } ``` **File:** solvers-v13.ts **Route through:** XNPV (replaces `1/Math.pow(1+rate, years)`), defeasance PV
```

### Block 9
```text
### 1.3 Add log1p-rate transform for IRR **Problem:** IRR solver works in rate space where `r > -1` is required but not enforced. **Fix:** Transform to `y = log1p(r)`, solve in y-space where `y ∈ (-∞, ∞)`, convert back with `r = expm1(y)`. Discount factors become `exp(-t*y)`. **File:** solvers-v13.ts (irr function) **Benefit:** Naturally enforces `r > -1`, better precision near zero, no bracket needed for the `> -1` constraint
```

### Block 10
```text
### 1.4 Welford's online algorithm for Monte Carlo statistics **Problem:** Running sum/sum-of-squares loses precision for large N (1000+ iterations). **Fix:** ```ts // Welford update n += 1; delta = x - mean; mean += delta / n; M2 += delta * (x - mean); variance = M2 / (n - 1); ``` **File:** monte-carlo.ts (replace current sum/sumOfSquares accumulation) **Benefit:** Numerically stable for any N, one-pass, no precision loss
```

### Block 11
```text
## PHASE 2: Solver Upgrades (Priority: 🟠 High) **Effort:** ~3 hours | **Impact:** Speed + robustness across all root-finding
```

### Block 12
```text
### 2.1 ITP root-finder (replaces Brent for breakeven/max-price solvers) **Problem:** Brent is good but ITP (Interpolate Truncate Project) has optimal worst-case complexity and superlinear convergence. **Algorithm:** ITP combines bisection, regula falsi, and a projection step. Worst-case ≤ bisection iterations, typical case ~5-8 iterations. **Files:** solvers.ts (solveBreakevenRate, solveMaxPurchasePrice) **Effort:** ~80 lines **Note:** Keep Brent for IRR (already works well). ITP for bracketed DSCR target solves.
```

### Block 13
```text
### 2.2 Apply Brent to all bracketed solvers **Problem:** solvers.ts still uses Newton-Raphson + bisection for breakeven rate and max purchase price. **Fix:** Replace with Brent's method (already implemented in solvers-v13.ts) **Files:** solvers.ts — `solveBreakevenRate`, `solveMaxPurchasePrice` **Effort:** ~30 lines per solver (extract Brent as shared utility)
```

### Block 14
```text
### 2.3 Halley's method for after-tax IRR polishing **Problem:** after-tax.ts has its own bisection-only solver with narrow bounds. **Fix:** Replace with: (1) Brent for bracketing, (2) optional Halley polish for machine precision **Formula:** `x_{n+1} = x_n − 2·f·f' / (2·f'² − f·f'')` where `f'' = NPV''(rate)` **File:** after-tax.ts **Effort:** ~30 lines
```

### Block 15
```text
### 2.4 Unify all IRR solvers **Problem:** 3 separate IRR solvers exist: engine.ts (solveSimpleIrr, solveStandardIrr), after-tax.ts (solveIrr), waterfall.ts (solveIrr). **Fix:** Delete all 3, import `irr()` from solvers-v13.ts everywhere. **Files:** engine.ts, after-tax.ts, waterfall.ts **Effort:** ~15 lines of import changes + delete ~100 lines of dead code
```

### Block 16
```text
## PHASE 3: Monte Carlo Redesign (Priority: 🟠 High) **Effort:** ~4 hours | **Impact:** Convergence speed + tail accuracy
```

### Block 17
```text
### 3.1 Scrambled Sobol' sequence (replaces Halton) **Problem:** Halton degrades in dimensions > 6. Engine has 5-6 stochastic dimensions. **Fix:** Implement scrambled Sobol' with Owen scrambling. Use power-of-2 sample counts (1024 or 2048 instead of 1000). Never skip first point. **File:** solvers-v13.ts (new `sobol()` function) + monte-carlo.ts (switch from Halton) **Effort:** ~150 lines for Sobol' direction numbers + scrambling **Test:** Verify P50 DSCR within 2% of current Halton result on same deal
```

### Block 18
```text
### 3.2 PCG/sfc32 PRNG (replaces mulberry32) **Problem:** mulberry32 has decent but not cryptographic statistical quality. PCG64 is NumPy's default. **Fix:** Implement sfc32 (small, fast, excellent statistical quality) or PCG32. **File:** monte-carlo.ts (replace seededRandom) **Effort:** ~40 lines
```

### Block 19
```text
### 3.3 Split MC into pseudo-random + QMC modes **Problem:** Currently one mode (pseudo-random with antithetic). **Fix:** - **Pseudo-random mode:** sfc32 PRNG + Ziggurat normals (2-10x faster than Box-Muller) - **QMC mode:** Scrambled Sobol' + inverse-normal transform (AS241) + Box-Muller - Default: QMC (faster convergence), fallback: pseudo-random for arbitrary N **File:** monte-carlo.ts **Effort:** ~100 lines refactoring
```

### Block 20
```text
### 3.4 Iman-Conover rank correlation **Problem:** Cholesky decomposition imposes Gaussian copula structure — no tail dependence. **Fix:** Iman-Conover preserves the marginal distributions but induces a target rank correlation matrix. Works with any marginal (not just Gaussian). **File:** monte-carlo.ts **Effort:** ~100 lines
```

### Block 21
```text
### 3.5 CVaR / Expected Shortfall **Problem:** Current risk reporting uses P10/P50/P90 and P(DSCR<1.0). CVaR is the institutional standard. **Fix:** Compute CVaR at 5% and 10% levels: ```ts CVaR_5% = mean of worst 5% of DSCR outcomes ``` **File:** monte-carlo.ts + engine.ts (add to monte_carlo output block) **Effort:** ~30 lines **Surface in UI:** StoryFlow risk section + drilldown
```

### Block 22
```text
### 3.6 Latin Hypercube Sampling option **Problem:** When user wants arbitrary N (not power of 2), Sobol' loses properties. **Fix:** Add LHS as third mode for arbitrary sample sizes. LHS variance < plain MC for nearly additive integrands. **File:** monte-carlo.ts **Effort:** ~60 lines
```

### Block 23
```text
## PHASE 4: Tax Logic Versioning (Priority: 🟠 High) **Effort:** ~2 hours | **Impact:** Legal compliance
```

### Block 24
```text
### 4.1 Year/version-gated tax tables **Problem:** Tax thresholds (QBI, PAL, bonus dep, §179) are hardcoded in code. They change annually. **Fix:** Create `tax-tables.ts` with year-indexed tables: ```ts const TAX_TABLES = { 2025: { qbiPhaseOutStartMFJ: 383900, qbiPhaseOutEndMFJ: 483900, ... }, 2026: { qbiPhaseOutStartMFJ: 395000, qbiPhaseOutEndMFJ: 495000, ... }, // projected }; ``` **File:** new `tax-tables.ts` **Route through:** engine.ts (QBI, PAL), after-tax.ts (bonus dep, §179), alternative-financing.ts (cost seg)
```

### Block 25
```text
### 4.2 §179 updated limits (OBBBA) **Problem:** §179 deduction increased from $1M to $2.5M, phaseout from $2M to $4M. Not in engine. **Fix:** Add to tax tables + cost seg module.
```

### Block 26
```text
### 4.3 State non-conformity flag **Problem:** Many states don't conform to federal bonus depreciation. **Fix:** Add `state_conforms_bonus_dep` boolean to state-overlays.ts for each state. Adjust cost seg state-tax savings accordingly.
```

### Block 27
```text
### 4.4 QBI 2026 status resolution **Problem:** IRS materials are not aligned on whether QBI deduction continues in 2026. **Fix:** Compute the deduction but show "Subject to legislative confirmation" flag until IRS publishes definitive 2026 guidance. Already partially done — formalize into version table.
```

### Block 28
```text
## PHASE 5: Advanced Financial Models (Priority: 🟡 Medium) **Effort:** ~6 hours | **Impact:** Institutional-grade analytics
```

### Block 29
```text
### 5.1 Vasicek/CIR interest rate model for ARM stress **Problem:** ARM reset currently uses static SOFR + margin. Real rates follow mean-reverting stochastic processes. **Fix:** Implement Vasicek model: `dr_t = κ(θ − r_t)dt + σdW_t` **File:** new `rate-models.ts` + arm-reset.ts **Effort:** ~150 lines
```

### Block 30
```text
### 5.2 Nelson-Siegel-Svensson yield curve for defeasance **Problem:** Defeasance uses single Treasury yield. Real defeasance requires matching each payment to a Treasury of corresponding maturity. **Fix:** Fit NSS curve to Treasury yield data, use fitted curve to discount each payment at its matching maturity. **File:** exchange.ts (defeasance) **Effort:** ~200 lines + data source
```
