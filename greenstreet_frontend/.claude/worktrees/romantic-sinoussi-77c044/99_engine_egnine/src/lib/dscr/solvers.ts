import { monthlyPayment } from './math';
import { estimateRate, type EstimateRateInput } from './llpa';
import type { DealInputs } from './types';
// v15 Phase 2.2: Import ITP root-finder (optimal worst-case, superlinear typical)
import { itp } from './solvers-v13';

// ============================================================================
// SOLVERS — Recursive DSCR-Rate, Bisection Max Price, Newton-Raphson Breakeven
// ============================================================================
// Implements the three core computational modules from the v5.0 Spec:
//   1. computeScenario — Recursive DSCR-Rate Solver (damped iteration)
//   2. solveMaxPurchasePrice — Bisection solver for max affordable price
//   3. solveBreakevenRate — ITP / Newton-Raphson solver for exact breakeven rate
// ============================================================================

// ---------------------------------------------------------------------------
// 1. RECURSIVE DAMPED ITERATION SOLVER (computeScenario)
// ---------------------------------------------------------------------------
// Solves the Rate→PITIA→DSCR→Rate circular dependency.
// Damping formula: assumedDscr_new = (assumedDscr_old * 0.4) + (actualDscr * 0.6)
// Convergence: |delta| < 0.002 DSCR units, max 15 iterations
// ---------------------------------------------------------------------------

export interface SolverResult {
  converged: boolean;
  iterations: number;
  finalRate: number;
  finalDscr: number;
  finalPitia: number;
  finalMonthlyPayment: number;
  history: { iteration: number; assumedDscr: number; actualDscr: number; rate: number; delta: number }[];
}

export interface ComputeScenarioInput {
  loanAmount: number;
  amortMonths: number;
  interestOnlyMonths: number;
  qualifyingRent: number; // monthly
  taxes: number; // monthly
  insurance: number; // monthly
  hoa: number; // monthly
  // LLPA inputs (passed through to estimateRate)
  fico: number;
  ltv: number;
  propertyType: EstimateRateInput['propertyType'];
  loanPurpose: EstimateRateInput['loanPurpose'];
  isForeignNational: boolean;
  isArmStructure: boolean;
  // Solver config
  initialDscrAssumption?: number;
  maxIterations?: number;
  convergenceThreshold?: number;
  dampingNew?: number; // weight on new calculation (default 0.6)
  dampingOld?: number; // weight on prior assumption (default 0.4)
}

export function computeScenario(input: ComputeScenarioInput): SolverResult {
  const maxIter = input.maxIterations ?? 15;
  const threshold = input.convergenceThreshold ?? 0.002;
  const dampingNew = input.dampingNew ?? 0.6;
  const dampingOld = input.dampingOld ?? 0.4;

  let assumedDscr = input.initialDscrAssumption ?? 1.10;
  const history: SolverResult['history'] = [];
  let converged = false;
  let finalRate = 0;
  let finalDscr = 0;
  let finalPitia = 0;
  let finalPmt = 0;

  for (let i = 1; i <= maxIter; i++) {
    // Step 1: estimate rate using current assumedDscr
    const rateResult = estimateRate({
      fico: input.fico,
      ltv: input.ltv,
      dscr: assumedDscr,
      propertyType: input.propertyType,
      loanPurpose: input.loanPurpose,
      loanAmount: input.loanAmount,
      interestOnlyMonths: input.interestOnlyMonths,
      isForeignNational: input.isForeignNational,
      isArmStructure: input.isArmStructure,
    });
    const rate = rateResult.estimatedRate;

    // Step 2: compute PITIA at this rate
    const pmt = input.interestOnlyMonths > 0
      ? (input.loanAmount * (rate / 100)) / 12 // IO payment
      : monthlyPayment(input.loanAmount, rate, input.amortMonths);
    const pitia = pmt + input.taxes + input.insurance + input.hoa;

    // Step 3: compute actual DSCR
    const actualDscr = pitia > 0 ? input.qualifyingRent / pitia : 0;

    // Step 4: apply damping
    const newAssumedDscr = (assumedDscr * dampingOld) + (actualDscr * dampingNew);
    const delta = Math.abs(newAssumedDscr - assumedDscr);

    history.push({
      iteration: i,
      assumedDscr: Math.round(assumedDscr * 1000) / 1000,
      actualDscr: Math.round(actualDscr * 1000) / 1000,
      rate: Math.round(rate * 1000) / 1000,
      delta: Math.round(delta * 10000) / 10000,
    });

    if (delta < threshold) {
      converged = true;
      finalRate = rate;
      finalDscr = actualDscr;
      finalPitia = pitia;
      finalPmt = pmt;
      break;
    }

    assumedDscr = newAssumedDscr;
    finalRate = rate;
    finalDscr = actualDscr;
    finalPitia = pitia;
    finalPmt = pmt;
  }

  return {
    converged,
    iterations: history.length,
    finalRate: Math.round(finalRate * 1000) / 1000,
    finalDscr: Math.round(finalDscr * 1000) / 1000,
    finalPitia: Math.round(finalPitia * 100) / 100,
    finalMonthlyPayment: Math.round(finalPmt * 100) / 100,
    history,
  };
}

// ---------------------------------------------------------------------------
// 2. BISECTION SOLVER FOR MAX PURCHASE PRICE
// ---------------------------------------------------------------------------
// Given a target DSCR, find the maximum purchase price that maintains it.
// Binary search: lowerBound = $50,000, upperBound = requestedPrice × 3
// Convergence: within $100, max 80 iterations
// DSCR is strictly monotonic decreasing in purchase price (more price = more loan = more PITIA = lower DSCR)
// ---------------------------------------------------------------------------

export interface BisectionResult {
  converged: boolean;
  iterations: number;
  maxPurchasePrice: number;
  finalDscr: number;
  finalLoanAmount: number;
  finalRate: number;
  history: { iteration: number; midPrice: number; dscr: number; delta: number }[];
}

export interface BisectionInput {
  targetDscr: number;
  ltvPct: number; // LTV ratio as percent (e.g., 75)
  amortMonths: number;
  interestOnlyMonths: number;
  qualifyingRent: number; // monthly
  taxes: number; // monthly (assumed constant — could scale with price if reassessment-modeled)
  insurance: number; // monthly
  hoa: number; // monthly
  fico: number;
  propertyType: EstimateRateInput['propertyType'];
  loanPurpose: EstimateRateInput['loanPurpose'];
  isForeignNational: boolean;
  isArmStructure: boolean;
  requestedPrice: number; // upper bound = this × 3
  maxIterations?: number;
  convergenceDollars?: number;
}

export function solveMaxPurchasePrice(input: BisectionInput): BisectionResult {
  const maxIter = input.maxIterations ?? 80;
  const convDollars = input.convergenceDollars ?? 100;

  // v12 (P1-18): When requestedPrice = 0, upperBound was 0 < lowerBound = 50000,
  // breaking bisection. Floor the upper bound at $50k × 3 = $150k.
  let lowerBound = 50000;
  let upperBound = Math.max(50000, input.requestedPrice * 3);
  const history: BisectionResult['history'] = [];
  let converged = false;
  let finalPrice = 0;
  let finalDscr = 0;
  let finalLoan = 0;
  let finalRate = 0;

  for (let i = 1; i <= maxIter; i++) {
    const midPrice = (lowerBound + upperBound) / 2;
    const loanAmount = (midPrice * input.ltvPct) / 100;
    const ltv = input.ltvPct; // LTV is constant — we vary price/loan together

    // Compute DSCR at this price
    // v12 (P1-19): Was using dscr: 1.0 placeholder which skewed the rate estimate
    // (LLPA's DSCR band adjustment was always evaluated at 1.0 regardless of target).
    // Now we pass the actual target DSCR so the rate adjustment reflects the deal.
    const rateResult = estimateRate({
      fico: input.fico,
      ltv,
      dscr: input.targetDscr,
      propertyType: input.propertyType,
      loanPurpose: input.loanPurpose,
      loanAmount,
      interestOnlyMonths: input.interestOnlyMonths,
      isForeignNational: input.isForeignNational,
      isArmStructure: input.isArmStructure,
    });
    const rate = rateResult.estimatedRate;

    const pmt = input.interestOnlyMonths > 0
      ? (loanAmount * (rate / 100)) / 12
      : monthlyPayment(loanAmount, rate, input.amortMonths);
    const pitia = pmt + input.taxes + input.insurance + input.hoa;
    const dscr = pitia > 0 ? input.qualifyingRent / pitia : 0;

    const delta = upperBound - lowerBound;
    history.push({
      iteration: i,
      midPrice: Math.round(midPrice),
      dscr: Math.round(dscr * 1000) / 1000,
      delta: Math.round(delta),
    });

    if (delta < convDollars) {
      converged = true;
      finalPrice = midPrice;
      finalDscr = dscr;
      finalLoan = loanAmount;
      finalRate = rate;
      break;
    }

    // If DSCR at midpoint is >= target, we can afford more (go up)
    // If DSCR at midpoint is < target, we need less price (go down)
    if (dscr >= input.targetDscr) {
      lowerBound = midPrice;
    } else {
      upperBound = midPrice;
    }

    finalPrice = midPrice;
    finalDscr = dscr;
    finalLoan = loanAmount;
    finalRate = rate;
  }

  return {
    converged,
    iterations: history.length,
    maxPurchasePrice: Math.round(finalPrice),
    finalDscr: Math.round(finalDscr * 1000) / 1000,
    finalLoanAmount: Math.round(finalLoan),
    finalRate: Math.round(finalRate * 1000) / 1000,
    history,
  };
}

// ---------------------------------------------------------------------------
// 3. NEWTON-RAPHSON BREAKEVEN RATE SOLVER
// ---------------------------------------------------------------------------
// Solves for the exact interest rate that produces a target DSCR.
// Newton-Raphson: rate_{n+1} = rate_n - f(rate)/f'(rate)
//   where f(rate) = DSCR(rate) - targetDscr
//   and f'(rate) is approximated numerically (central difference)
// Fallback: bisection if Newton-Raphson fails to converge (handles LLPA cliffs)
// ---------------------------------------------------------------------------

export interface BreakevenRateResult {
  converged: boolean;
  iterations: number;
  breakevenRate: number;
  finalDscr: number;
  method: 'newton-raphson' | 'bisection-fallback' | 'itp';
  history: { iteration: number; rate: number; dscr: number; delta: number }[];
}

export interface BreakevenRateInput {
  targetDscr: number;
  loanAmount: number;
  amortMonths: number;
  interestOnlyMonths: number;
  qualifyingRent: number;
  taxes: number;
  insurance: number;
  hoa: number;
  maxIterations?: number;
  convergenceThreshold?: number; // in DSCR units
  initialRateGuess?: number;
}

function computeDscrAtRate(rate: number, input: BreakevenRateInput): number {
  // v13.2: Guard against negative rates — clamp to 0 (free money = max DSCR)
  const safeRate = Math.max(0, rate);
  const pmt = input.interestOnlyMonths > 0
    ? (input.loanAmount * (safeRate / 100)) / 12
    : monthlyPayment(input.loanAmount, safeRate, input.amortMonths);
  const pitia = pmt + input.taxes + input.insurance + input.hoa;
  return pitia > 0 ? input.qualifyingRent / pitia : 0;
}

export function solveBreakevenRate(input: BreakevenRateInput): BreakevenRateResult {
  const maxIter = input.maxIterations ?? 50;
  const threshold = input.convergenceThreshold ?? 0.001;
  const history: BreakevenRateResult['history'] = [];

  let rate = input.initialRateGuess ?? 7.0;
  let converged = false;
  let method: 'newton-raphson' | 'bisection-fallback' | 'itp' = 'newton-raphson';

  // v15 Phase 2.2: Try ITP first (optimal worst-case, superlinear convergence).
  // ITP handles LLPA cliffs better than Newton because it stays bracketed.
  try {
    const f = (r: number) => computeDscrAtRate(r, input) - input.targetDscr;
    const fLo = f(3);
    const fHi = f(25);
    if (Number.isFinite(fLo) && Number.isFinite(fHi) && fLo * fHi < 0) {
      const itpResult = itp(f, 3, 25, { tolerance: threshold / 10, maxIterations: 30 });
      if (Number.isFinite(itpResult) && Math.abs(f(itpResult)) < threshold) {
        // ITP converged — use it directly
        rate = itpResult;
        converged = true;
        method = 'itp';
        history.push({
          iteration: 1,
          rate: Math.round(rate * 10000) / 10000,
          dscr: Math.round(computeDscrAtRate(rate, input) * 10000) / 10000,
          delta: Math.round(Math.abs(f(rate)) * 100000) / 100000,
        });
      }
    }
  } catch {
    // ITP failed — fall through to Newton-Raphson
  }

  // Newton-Raphson fallback (or primary if ITP didn't converge)
  if (!converged) {
    method = 'newton-raphson';
    for (let i = 1; i <= maxIter; i++) {
      const dscr = computeDscrAtRate(rate, input);
      const f = dscr - input.targetDscr; // we want f = 0

      // Numerical derivative (central difference, 1bp step)
      const h = 0.01; // 1 basis point
      const dscrPlus = computeDscrAtRate(rate + h, input);
      const dscrMinus = computeDscrAtRate(rate - h, input);
      const fPrime = (dscrPlus - dscrMinus) / (2 * h);

      const delta = Math.abs(f);
      history.push({
        iteration: i,
        rate: Math.round(rate * 10000) / 10000,
        dscr: Math.round(dscr * 10000) / 10000,
        delta: Math.round(delta * 100000) / 100000,
      });

      if (delta < threshold) {
        converged = true;
        break;
      }

      // Newton-Raphson update — guard against zero derivative
      if (Math.abs(fPrime) < 1e-9) {
        // Derivative is zero (LLPA cliff) — fall back to bisection
        method = 'bisection-fallback';
        break;
      }

      const newRate = rate - f / fPrime;

      // Sanity bound: rate must stay in [3%, 25%]
      if (newRate < 3 || newRate > 25 || !Number.isFinite(newRate)) {
        method = 'bisection-fallback';
        break;
      }

      rate = newRate;
    }
  }

  // Fallback: bisection between 3% and 25%
  if (!converged && method === 'bisection-fallback') {
    let lo = 3;
    let hi = 25;
    for (let i = 1; i <= 50; i++) {
      const mid = (lo + hi) / 2;
      const dscr = computeDscrAtRate(mid, input);
      const delta = Math.abs(dscr - input.targetDscr);
      history.push({
        iteration: history.length + 1,
        rate: Math.round(mid * 10000) / 10000,
        dscr: Math.round(dscr * 10000) / 10000,
        delta: Math.round(delta * 100000) / 100000,
      });

      if (delta < threshold) {
        rate = mid;
        converged = true;
        break;
      }

      // If DSCR at mid > target, we need a higher rate (lower DSCR)
      // If DSCR at mid < target, we need a lower rate (higher DSCR)
      if (dscr > input.targetDscr) {
        lo = mid;
      } else {
        hi = mid;
      }
      rate = mid;
    }
  }

  const finalDscr = computeDscrAtRate(rate, input);

  return {
    converged,
    iterations: history.length,
    breakevenRate: Math.round(rate * 1000) / 1000,
    finalDscr: Math.round(finalDscr * 1000) / 1000,
    method,
    history,
  };
}

// ---------------------------------------------------------------------------
// 4. REVERSE DSCR — MIN RENT REQUIRED TO HIT TARGET DSCR
// ---------------------------------------------------------------------------
// Formula: Min Rent = (Debt Service × Target DSCR + OpEx) / (1 - Vacancy Rate)
// Actually for DSCR = Rent / PITIA, we want Rent = DSCR × PITIA
// For Investor DSCR = NOI / Debt Service, we want NOI = DSCR × Debt Service
//                     so EGI - Opex = DSCR × Debt Service
//                     so EGI = DSCR × Debt Service + Opex
//                     so Gross Rent = EGI / (1 - vacancy%) + adjustments
// ---------------------------------------------------------------------------

export interface ReverseDscrResult {
  minMonthlyRent: number;
  minAnnualRent: number;
  breakdown: {
    annualDebtService: number;
    targetDscr: number;
    requiredNoi: number;
    operatingExpenses: number;
    requiredEgi: number;
    vacancyLoss: number;
    grossScheduledRent: number;
  };
}

export function solveMinRentForTargetDscr(
  annualDebtService: number,
  targetDscr: number,
  annualOpex: number,
  vacancyPct: number,
  collectionLossPct: number = 0,
  concessionsPct: number = 0
): ReverseDscrResult {
  // Required NOI = target DSCR × annual debt service
  const requiredNoi = annualDebtService * targetDscr;

  // Required EGI = NOI + Opex
  const requiredEgi = requiredNoi + annualOpex;

  // Gross Scheduled Rent = EGI / (1 - vacancy% - collection% - concessions%)
  const totalHaircutPct = (vacancyPct + collectionLossPct + concessionsPct) / 100;
  const grossScheduledRent = totalHaircutPct < 1 ? requiredEgi / (1 - totalHaircutPct) : Infinity;

  const vacancyLoss = (grossScheduledRent * vacancyPct) / 100;

  return {
    minMonthlyRent: Math.round(grossScheduledRent / 12),
    minAnnualRent: Math.round(grossScheduledRent),
    breakdown: {
      annualDebtService: Math.round(annualDebtService),
      targetDscr,
      requiredNoi: Math.round(requiredNoi),
      operatingExpenses: Math.round(annualOpex),
      requiredEgi: Math.round(requiredEgi),
      vacancyLoss: Math.round(vacancyLoss),
      grossScheduledRent: Math.round(grossScheduledRent),
    },
  };
}

// ---------------------------------------------------------------------------
// 5. MAX LOAN BY DSCR — given target DSCR and NOI, find max loan
// ---------------------------------------------------------------------------
// DSCR = NOI / Debt Service → Debt Service = NOI / DSCR
// For amortizing: Debt Service = monthlyPmt × 12 = PMT(loan, rate, amort) × 12
// Solve for loan: loan = PMT × (1 - (1+r)^-n) / r where PMT = Debt Service/12
// For IO: Debt Service = loan × rate → loan = Debt Service / rate
// ---------------------------------------------------------------------------

export function solveMaxLoanByDscr(
  annualNoi: number,
  targetDscr: number,
  annualRatePct: number,
  amortMonths: number,
  interestOnly: boolean = false
): { maxLoan: number; maxDebtService: number; method: string } {
  const maxDebtService = annualNoi / targetDscr;

  if (interestOnly) {
    // loan × rate = debt service → loan = debt service / rate
    const maxLoan = (maxDebtService / (annualRatePct / 100));
    return { maxLoan: Math.round(maxLoan), maxDebtService: Math.round(maxDebtService), method: 'interest-only' };
  }

  // Amortizing
  const r = annualRatePct / 100 / 12;
  const n = amortMonths;
  const monthlyPmt = maxDebtService / 12;
  if (r === 0) {
    return { maxLoan: Math.round(monthlyPmt * n), maxDebtService: Math.round(maxDebtService), method: 'amortizing' };
  }
  const maxLoan = monthlyPmt * (1 - Math.pow(1 + r, -n)) / r;
  return { maxLoan: Math.round(maxLoan), maxDebtService: Math.round(maxDebtService), method: 'amortizing' };
}

// ---------------------------------------------------------------------------
// 6. CONVENIENCE — run all solvers from a DealInputs
// ---------------------------------------------------------------------------

export function runAllSolvers(i: DealInputs): {
  scenario: SolverResult;
  maxPrice: BisectionResult;
  breakevenRate: BreakevenRateResult;
} {
  // Map DealInputs → ComputeScenarioInput
  const qualifyingRent = Math.min(
    i.appraiserRent,
    i.leaseRent || i.appraiserRent
  );

  const scenario = computeScenario({
    loanAmount: i.loanAmount,
    amortMonths: i.amortMonths,
    interestOnlyMonths: i.interestOnlyMonths,
    qualifyingRent,
    taxes: i.propertyTaxes,
    insurance: i.insurance,
    hoa: i.hoa,
    fico: i.fico,
    ltv: (i.loanAmount / (i.appraisedValue || i.purchasePrice)) * 100,
    propertyType: i.propertyType as EstimateRateInput['propertyType'],
    loanPurpose: i.loanPurpose,
    isForeignNational: false, // not in DealInputs yet
    isArmStructure: i.structure.startsWith('ARM_'),
  });

  const maxPrice = solveMaxPurchasePrice({
    targetDscr: 1.0,
    ltvPct: (i.loanAmount / (i.appraisedValue || i.purchasePrice)) * 100,
    amortMonths: i.amortMonths,
    interestOnlyMonths: i.interestOnlyMonths,
    qualifyingRent,
    taxes: i.propertyTaxes,
    insurance: i.insurance,
    hoa: i.hoa,
    fico: i.fico,
    propertyType: i.propertyType as EstimateRateInput['propertyType'],
    loanPurpose: i.loanPurpose,
    isForeignNational: false,
    isArmStructure: i.structure.startsWith('ARM_'),
    requestedPrice: i.purchasePrice,
  });

  const breakevenRate = solveBreakevenRate({
    targetDscr: 1.0,
    loanAmount: i.loanAmount,
    amortMonths: i.amortMonths,
    interestOnlyMonths: i.interestOnlyMonths,
    qualifyingRent,
    taxes: i.propertyTaxes,
    insurance: i.insurance,
    hoa: i.hoa,
  });

  return { scenario, maxPrice, breakevenRate };
}
