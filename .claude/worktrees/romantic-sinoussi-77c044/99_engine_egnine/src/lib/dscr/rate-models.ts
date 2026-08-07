// ============================================================================
// STOCHASTIC RATE & NOI MODELS — Phase 5
// ============================================================================
// Vasicek / CIR interest rate models for ARM stress
// Nelson-Siegel-Svensson yield curve for defeasance
// Ornstein-Uhlenbeck NOI process for Track 3 stabilization
// PSA prepayment model
// ============================================================================

import { SFC32 } from './monte-carlo-v15';

// ---------------------------------------------------------------------------
// Vasicek model: dr_t = κ(θ - r_t)dt + σ dW_t
// ---------------------------------------------------------------------------

export interface VasicekParams {
  /** Long-term mean rate θ (decimal, e.g. 0.045 = 4.5%) */
  theta: number;
  /** Mean reversion speed κ (1/year, typical 0.5-2.0) */
  kappa: number;
  /** Volatility σ (decimal/year, typical 0.01-0.02 for rates) */
  sigma: number;
  /** Initial rate r_0 (decimal) */
  r0: number;
}

/**
 * Simulate a Vasicek path over `nSteps` periods.
 *
 * Vasicek is the simplest mean-reverting interest rate model. Closed-form
 * bond prices exist, making it useful for ARM stress:
 *   r_{t+dt} = r_t + κ(θ - r_t)dt + σ√dt × Z
 *
 * Mean reversion prevents rates from drifting to unreasonable levels
 * (which pure GBM allows). Used by Basel III IRB for IRRBB.
 *
 * @param params - { theta, kappa, sigma, r0 }
 * @param years - total time horizon
 * @param nSteps - number of discretization steps
 * @param rng - PRNG (default: seeded SFC32)
 * @returns array of rates at each step
 */
export function simulateVasicek(
  params: VasicekParams,
  years: number,
  nSteps: number = 360,
  rng: SFC32 = new SFC32(42)
): number[] {
  const dt = years / nSteps;
  const sqrtDt = Math.sqrt(dt);
  const rates: number[] = [params.r0];

  for (let i = 1; i <= nSteps; i++) {
    // Box-Muller normal
    const u1 = rng.next() || Number.EPSILON;
    const u2 = rng.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    const rPrev = rates[i - 1];
    const drift = params.kappa * (params.theta - rPrev) * dt;
    const diffusion = params.sigma * sqrtDt * z;
    rates.push(rPrev + drift + diffusion);
  }

  return rates;
}

/**
 * Expected ARM rate at month `t` under Vasicek dynamics.
 *
 * E[r_t | r_0] = θ + (r_0 - θ) × exp(-κt)
 *
 * Closed form — useful for deterministic stress scenarios without running MC.
 */
export function vasicekExpectedRate(
  params: VasicekParams,
  years: number
): number {
  return params.theta + (params.r0 - params.theta) * Math.exp(-params.kappa * years);
}

/**
 * Vasicek bond price (closed form).
 *
 * P(t,T) = A(τ) × exp(-B(τ) × r_t)
 *   τ = T - t
 *   B(τ) = (1 - exp(-κτ)) / κ
 *   A(τ) = exp[(B(τ) - τ)(κ²θ - σ²/2)/σ² - σ²B(τ)²/(4κ)]
 *
 * @returns price of a zero-coupon bond paying 1 at maturity T
 */
export function vasicekBondPrice(
  params: VasicekParams,
  currentRate: number,
  yearsToMaturity: number
): number {
  const { kappa: k, theta, sigma, r0: _ } = params;
  const tau = yearsToMaturity;
  const B = k > 1e-10 ? (1 - Math.exp(-k * tau)) / k : tau;
  const A = k > 1e-10 && sigma > 1e-10
    ? Math.exp(
        ((B - tau) * (k * k * theta - sigma * sigma / 2)) / (sigma * sigma)
        - (sigma * sigma * B * B) / (4 * k)
      )
    : Math.exp(-currentRate * tau);
  return A * Math.exp(-B * currentRate);
}

// ---------------------------------------------------------------------------
// CIR model: dr_t = κ(θ - r_t)dt + σ√r_t dW_t  (rates stay non-negative)
// ---------------------------------------------------------------------------

// v15: CirParams has the same shape as VasicekParams (same fields, same meaning).
// Use a type alias instead of an empty interface to avoid the no-empty-object-type lint.
export type CirParams = VasicekParams;

/**
 * Simulate a CIR (Cox-Ingersoll-Ross) path.
 *
 * Like Vasicek but with σ × √r_t instead of σ — keeps rates non-negative
 * (important when rates are near zero). Common in academic finance.
 *
 * Feller condition (2κθ > σ²) guarantees rates stay strictly positive.
 */
export function simulateCIR(
  params: CirParams,
  years: number,
  nSteps: number = 360,
  rng: SFC32 = new SFC32(42)
): number[] {
  const dt = years / nSteps;
  const sqrtDt = Math.sqrt(dt);
  const rates: number[] = [params.r0];

  for (let i = 1; i <= nSteps; i++) {
    const u1 = rng.next() || Number.EPSILON;
    const u2 = rng.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    const rPrev = Math.max(0, rates[i - 1]);
    const drift = params.kappa * (params.theta - rPrev) * dt;
    const diffusion = params.sigma * Math.sqrt(rPrev) * sqrtDt * z;
    rates.push(Math.max(0, rPrev + drift + diffusion));
  }

  return rates;
}

// ---------------------------------------------------------------------------
// Nelson-Siegel-Svensson yield curve
// ---------------------------------------------------------------------------

export interface NSSParams {
  /** Long-term level β0 (decimal) */
  beta0: number;
  /** Short-term component β1 (decimal, negative = inverted curve) */
  beta1: number;
  /** Medium-term hump β2 (decimal) */
  beta2: number;
  /** Second hump β3 (decimal) */
  beta3: number;
  /** Decay parameter τ1 (years) */
  tau1: number;
  /** Decay parameter τ2 (years) */
  tau2: number;
}

/**
 * Nelson-Siegel-Svensson yield at maturity `t`.
 *
 * y(t) = β0
 *      + β1 × (1 - exp(-t/τ1)) / (t/τ1)
 *      + β2 × [(1 - exp(-t/τ1)) / (t/τ1) - exp(-t/τ1)]
 *      + β3 × [(1 - exp(-t/τ2)) / (t/τ2) - exp(-t/τ2)]
 *
 * Standard model for interpolating Treasury yield curve from a few
 * observed points. Required for accurate defeasance — each cash flow
 * is discounted at its own maturity-matched Treasury yield.
 *
 * @returns yield as decimal
 */
export function nssYield(params: NSSParams, years: number): number {
  if (years <= 0) return params.beta0;

  const t1 = years / params.tau1;
  const t2 = years / params.tau2;

  const factor1 = (1 - Math.exp(-t1)) / t1;
  const factor2 = factor1 - Math.exp(-t1);
  const factor3 = (1 - Math.exp(-t2)) / t2 - Math.exp(-t2);

  return params.beta0
    + params.beta1 * factor1
    + params.beta2 * factor2
    + params.beta3 * factor3;
}

/**
 * Fit NSS parameters to observed yield data via simple least squares.
 *
 * Uses Levenberg-Marquardt-free coordinate descent (simpler, no extra deps).
 * Returns a reasonable fit for typical Treasury curves.
 *
 * @param observed - array of {maturity, yield} pairs
 * @returns fitted NSSParams
 */
export function fitNSS(
  observed: { maturity: number; yield: number }[]
): NSSParams {
  if (observed.length < 4) {
    // Fall back to flat curve at average yield
    const avg = observed.reduce((s, o) => s + o.yield, 0) / Math.max(1, observed.length);
    return { beta0: avg, beta1: 0, beta2: 0, beta3: 0, tau1: 2, tau2: 7 };
  }

  // Initial guess: level = long yield, slope = short - long
  const sorted = [...observed].sort((a, b) => a.maturity - b.maturity);
  const longYield = sorted[sorted.length - 1].yield;
  const shortYield = sorted[0].yield;

  const params: NSSParams = {
    beta0: longYield,
    beta1: shortYield - longYield,
    beta2: 0,
    beta3: 0,
    tau1: 2,
    tau2: 7,
  };

  // Simple coordinate descent (10 passes)
  const stepSizes = [0.001, 0.001, 0.001, 0.001, 0.1, 0.1];
  const paramKeys: (keyof NSSParams)[] = ['beta0', 'beta1', 'beta2', 'beta3', 'tau1', 'tau2'];

  const loss = (p: NSSParams): number => {
    let s = 0;
    for (const o of observed) {
      const pred = nssYield(p, o.maturity);
      s += (pred - o.yield) ** 2;
    }
    return s;
  };

  let currentLoss = loss(params);

  for (let pass = 0; pass < 20; pass++) {
    for (let i = 0; i < paramKeys.length; i++) {
      const key = paramKeys[i];
      const orig = params[key];
      const step = stepSizes[i];

      // Try +step
      (params[key] as number) = orig + step;
      const lossPlus = loss(params);
      if (lossPlus < currentLoss) {
        currentLoss = lossPlus;
        continue;
      }

      // Try -step
      (params[key] as number) = orig - step;
      const lossMinus = loss(params);
      if (lossMinus < currentLoss) {
        currentLoss = lossMinus;
        continue;
      }

      // Revert
      params[key] = orig;
    }
  }

  return params;
}

// ---------------------------------------------------------------------------
// Ornstein-Uhlenbeck NOI process (Track 3 stabilization)
// ---------------------------------------------------------------------------

export interface OUParams {
  /** Long-term equilibrium NOI θ */
  theta: number;
  /** Mean reversion speed κ (1/year) */
  kappa: number;
  /** Volatility σ */
  sigma: number;
  /** Initial NOI */
  n0: number;
}

/**
 * Simulate Ornstein-Uhlenbeck process for NOI stabilization.
 *
 * NOI_{t+dt} = NOI_t + κ(θ - NOI_t)dt + σε√dt × Z
 *
 * Models the fact that distressed/value-add properties converge toward
 * market-equilibrium NOI over time. Replaces the flat `NOI × (1+g)^t`
 * used in Track 3 with mean-reverting dynamics.
 *
 * @returns array of NOI values at each time step
 */
export function simulateOUNoi(
  params: OUParams,
  years: number,
  nSteps: number = 36,
  rng: SFC32 = new SFC32(42)
): number[] {
  const dt = years / nSteps;
  const sqrtDt = Math.sqrt(dt);
  const noi: number[] = [params.n0];

  for (let i = 1; i <= nSteps; i++) {
    const u1 = rng.next() || Number.EPSILON;
    const u2 = rng.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    const prev = noi[i - 1];
    const drift = params.kappa * (params.theta - prev) * dt;
    const diffusion = params.sigma * sqrtDt * z;
    noi.push(Math.max(0, prev + drift + diffusion));
  }

  return noi;
}

/**
 * Expected NOI at year `t` under OU dynamics.
 * E[NOI_t | NOI_0] = θ + (NOI_0 - θ) × exp(-κt)
 */
export function ouExpectedNoi(params: OUParams, years: number): number {
  return params.theta + (params.n0 - params.theta) * Math.exp(-params.kappa * years);
}

// ---------------------------------------------------------------------------
// PSA prepayment model (Public Securities Association)
// ---------------------------------------------------------------------------

/**
 * PSA prepayment rate at month `m`.
 *
 * Standard model: CPR ramps linearly from 0% at month 0 to 6% at month 30,
 * then stays at 6% for the rest of the loan life. "100 PSA" = baseline;
 * "200 PSA" doubles the rate.
 *
 * @param month - month number (1-indexed)
 * @param psaSpeed - PSA multiplier (1.0 = 100 PSA, 2.0 = 200 PSA)
 * @returns CPR (conditional prepayment rate) as decimal
 */
export function psaCpr(month: number, psaSpeed: number = 1.0): number {
  const baseCpr = month < 30 ? 0.002 * month : 0.06;
  return Math.min(1, baseCpr * psaSpeed);
}

/**
 * Single Monthly Mortality (SMM) from CPR.
 *
 * SMM = 1 - (1 - CPR)^(1/12)
 *
 * SMM is the fraction of remaining loans that prepay in a given month.
 */
export function psaSmm(month: number, psaSpeed: number = 1.0): number {
  const cpr = psaCpr(month, psaSpeed);
  return 1 - Math.pow(1 - cpr, 1 / 12);
}

/**
 * Project loan balance under PSA prepayments.
 *
 * @param principal - original loan amount
 * @param annualRatePct - annual interest rate
 * @param amortMonths - amortization term
 * @param months - months to project
 * @param psaSpeed - PSA multiplier (default 1.0)
 * @returns array of {month, balance, scheduledPaydown, prepayment, totalPayment}
 */
export function psaBalanceProjection(
  principal: number,
  annualRatePct: number,
  amortMonths: number,
  months: number,
  psaSpeed: number = 1.0
): Array<{ month: number; balance: number; scheduledPaydown: number; prepayment: number; totalPayment: number }> {
  if (amortMonths <= 0) return [];
  const r = annualRatePct / 100 / 12;
  const scheduledPmt = r === 0
    ? principal / amortMonths
    : (principal * r) / (1 - Math.pow(1 + r, -amortMonths));

  const result: Array<{ month: number; balance: number; scheduledPaydown: number; prepayment: number; totalPayment: number }> = [];
  let balance = principal;

  for (let m = 1; m <= months && balance > 0.01; m++) {
    const interest = balance * r;
    const scheduledPrincipal = scheduledPmt - interest;
    const smm = psaSmm(m, psaSpeed);
    const prepayment = (balance - scheduledPrincipal) * smm;
    const totalPrincipal = scheduledPrincipal + prepayment;
    balance = Math.max(0, balance - totalPrincipal);

    result.push({
      month: m,
      balance,
      scheduledPaydown: scheduledPrincipal,
      prepayment,
      totalPayment: scheduledPmt + prepayment,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Cap rate as spread to Treasury (structural coupling)
// ---------------------------------------------------------------------------

/**
 * Cap rate as a spread to 10Y Treasury.
 *
 * cap_rate = treasury_10y + cap_spread + ε
 *
 * When rates rise, cap rates typically rise too (correlated ~0.5).
 * This couples the exit cap to the rate environment rather than treating
 * it as an independent assumption.
 *
 * @param treasury10y - 10-year Treasury yield (decimal)
 * @param capSpread - typical spread (decimal, ~0.015-0.03 for residential)
 * @param noise - optional random shock (decimal)
 */
export function capRateFromTreasury(
  treasury10y: number,
  capSpread: number = 0.025,
  noise: number = 0
): number {
  return Math.max(0.02, treasury10y + capSpread + noise);
}

// ---------------------------------------------------------------------------
// Distance to Default (Merton structural model)
// ---------------------------------------------------------------------------

export interface MertonInputs {
  /** Asset value V (property value) */
  assetValue: number;
  /** Debt (loan balance) — face value due at horizon */
  debt: number;
  /** Asset volatility σ (annual, decimal — typical RE: 0.10-0.20) */
  assetVolatility: number;
  /** Risk-free rate (decimal) */
  riskFreeRate: number;
  /** Time horizon T (years) */
  horizon: number;
}

/**
 * Merton Distance to Default.
 *
 * DD = (ln(V/D) + (r - 0.5σ²)T) / (σ√T)
 *
 * Interpretation:
 *   DD > 3  → very safe (PD ≈ 0.1%)
 *   DD = 2  → safe (PD ≈ 2.3%)
 *   DD = 1  → at risk (PD ≈ 16%)
 *   DD < 0  → currently underwater
 *
 * @returns distance to default (number of standard deviations)
 */
export function distanceToDefault(inputs: MertonInputs): number {
  const { assetValue: V, debt: D, assetVolatility: sigma, riskFreeRate: r, horizon: T } = inputs;
  if (D <= 0 || V <= 0 || sigma <= 0 || T <= 0) return NaN;
  return (Math.log(V / D) + (r - 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
}

/**
 * Probability of Default from Merton DD.
 * PD = N(-DD) where N is standard normal CDF.
 */
export function mertonPD(inputs: MertonInputs): number {
  const dd = distanceToDefault(inputs);
  if (!Number.isFinite(dd)) return NaN;
  return normalCDF(-dd);
}

/**
 * Loss Given Default (LGD) from LTV.
 *
 * Empirical relationship: LGD = max(0, (LTV - 0.7) / 0.3) × recovery_factor
 * Simplified: LGD = (1 - recovery_rate) when LTV > 70%, scaled down below.
 *
 * @param ltv - loan-to-value ratio (decimal)
 * @param recoveryRate - recovery rate on collateral (typical RE: 0.5-0.7)
 */
export function lgdFromLtv(ltv: number, recoveryRate: number = 0.6): number {
  if (ltv <= 0) return 0;
  // Higher LTV → higher LGD (less equity cushion)
  const exposureAtDefault = Math.min(1, ltv);
  const recovery = recoveryRate * (1 - Math.max(0, ltv - 0.7));
  return Math.max(0, exposureAtDefault - recovery);
}

// Standard normal CDF (Abramowitz & Stegun 26.2.17)
function normalCDF(x: number): number {
  // Constants
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * absX);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1 + sign * y);
}

// ---------------------------------------------------------------------------
// Risk-based reserve sizing — solve for P(ruin) ≤ target
// ---------------------------------------------------------------------------

/**
 * Solve for required reserves such that P(ruin during hold) ≤ target.
 *
 * "Ruin" = running out of cash (reserves + cumulative cash flow < 0).
 * Uses bisection: try increasing reserves until MC P(ruin) drops below target.
 *
 * @param inputs - deal economics
 * @param targetRuinProb - target probability of ruin (default 5%)
 * @param maxReserves - search upper bound (default 12 months of debt service)
 * @returns required reserves in dollars
 */
export function sizeReservesForRuinProbability(
  ruinProbFn: (reserves: number) => number,
  targetRuinProb: number = 0.05,
  maxReserves: number = 100000
): number {
  let lo = 0;
  let hi = maxReserves;

  for (let iter = 0; iter < 50; iter++) {
    const mid = (lo + hi) / 2;
    const p = ruinProbFn(mid);
    if (p > targetRuinProb) {
      lo = mid;  // need more reserves
    } else {
      hi = mid;  // can afford less
    }
    if (hi - lo < 100) break;  // $100 precision
  }

  return hi;
}

// ---------------------------------------------------------------------------
// Risk parity portfolio allocation
// ---------------------------------------------------------------------------

/**
 * Risk parity weights — equal risk contribution from each asset.
 *
 * Weight_i = (1/σ_i) / Σ(1/σ_j)
 *
 * @param volatilities - per-asset volatilities
 * @returns weights summing to 1
 */
export function riskParityWeights(volatilities: number[]): number[] {
  const invVols = volatilities.map(v => v > 0 ? 1 / v : 0);
  const totalInvVol = invVols.reduce((s, v) => s + v, 0);
  if (totalInvVol === 0) return volatilities.map(() => 1 / volatilities.length);
  return invVols.map(v => v / totalInvVol);
}

// ---------------------------------------------------------------------------
// Modified Dietz return (GIPS-compliant)
// ---------------------------------------------------------------------------

/**
 * Modified Dietz return — GIPS-compliant time-weighted return.
 *
 * R_Dietz = (EMV - BMV - CF) / (BMV + Σ(W_i × CF_i))
 *
 * Where W_i = (T - t_i) / T is the time weight of cash flow i.
 *
 * @param beginningMarketValue - BMV
 * @param endingMarketValue - EMV
 * @param cashFlows - array of {amount, dayNumber} (day 0 = start, day T = end)
 * @param totalDays - total period length in days
 */
export function modifiedDietzReturn(
  beginningMarketValue: number,
  endingMarketValue: number,
  cashFlows: { amount: number; dayNumber: number }[],
  totalDays: number
): number {
  const totalCF = cashFlows.reduce((s, cf) => s + cf.amount, 0);
  const weightedCF = cashFlows.reduce(
    (s, cf) => s + cf.amount * (totalDays - cf.dayNumber) / totalDays,
    0
  );
  const denominator = beginningMarketValue + weightedCF;
  if (denominator === 0) return 0;
  return (endingMarketValue - beginningMarketValue - totalCF) / denominator;
}

// ---------------------------------------------------------------------------
// Refinance option value (convexity in refinance analysis)
// ---------------------------------------------------------------------------

/**
 * Refinance NPV with option value of being able to refinance again.
 *
 * Traditional break-even: refi if savings NPV > 0.
 * Better: refi if savings NPV + option_value(refi again later) > 0.
 *
 * The option value is approximated by the expected value of being able to
 * refi at a lower rate in the future, discounted by the probability of
 * rates dropping.
 *
 * @param monthlySavings - monthly payment reduction from refi
 * @param refiCost - upfront refi cost
 * @param holdMonths - remaining hold period
 * @param discountRate - opportunity cost rate (decimal)
 * @param probRatesDrop - estimated probability rates drop within hold (default 0.3)
 * @param expectedRateDropSavings - estimated monthly savings if rates drop (default = current savings × 0.5)
 */
export function refiNpvWithOptionValue(
  monthlySavings: number,
  refiCost: number,
  holdMonths: number,
  discountRate: number = 0.05,
  probRatesDrop: number = 0.3,
  expectedRateDropSavings: number = monthlySavings * 0.5
): number {
  // Base NPV: PV of savings - refi cost
  const monthlyRate = discountRate / 12;
  let baseNpv = 0;
  for (let t = 1; t <= holdMonths; t++) {
    baseNpv += monthlySavings / Math.pow(1 + monthlyRate, t);
  }
  baseNpv -= refiCost;

  // Option value: expected NPV of being able to refi again
  // (simplified — assumes you refi once more if rates drop, capturing additional savings)
  const avgMonthOfReRefi = holdMonths / 2;
  let optionValue = 0;
  for (let t = Math.floor(avgMonthOfReRefi); t <= holdMonths; t++) {
    optionValue += expectedRateDropSavings / Math.pow(1 + monthlyRate, t);
  }
  optionValue *= probRatesDrop;
  // Subtract expected cost of future refi (proportional to current refi cost)
  optionValue -= refiCost * 0.5 * probRatesDrop;

  return baseNpv + optionValue;
}
