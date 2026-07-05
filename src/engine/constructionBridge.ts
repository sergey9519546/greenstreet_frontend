// ============================================================
// CONSTRUCTION / BRIDGE DSCR (interest-reserve + exit-takeout test)
// ============================================================
// A construction or bridge loan is interest-only on the DRAWN balance and
// carries no rental income during the build — so day-one DSCR is undefined.
// The real questions are: (1) how much interest reserve funds the carry, and
// (2) does the STABILIZED property support a takeout loan large enough to
// retire the bridge? This engine answers both with honest, deterministic math.
//
// Interest reserve uses a 50%-average-draw approximation over the term (funds
// are drawn progressively, not day one). Pure math, reuses engine primitives.

import { calculateIOPayment, calculatePI } from './engine';

export interface ConstructionBridgeInput {
  totalProjectCost: number;      // land + hard + soft costs
  loanAmount: number;            // bridge/construction loan (LTC numerator)
  bridgeRate: number;            // bridge note rate (%), interest-only
  constructionMonths: number;    // build/reposition duration
  /** Fraction of loan drawn on average over the term (0–1). Default 0.5. */
  avgDrawFraction?: number;
  // --- Exit / takeout ---
  stabilizedRentMonthly: number; // projected stabilized qualifying rent
  stabilizedEscrowsMonthly: number; // taxes + ins + HOA, monthly
  exitRate: number;              // takeout note rate (%)
  exitTermYears?: number;        // takeout amortization, default 30
  /** Takeout loan that retires the bridge. Defaults to the bridge loanAmount. */
  takeoutLoanAmount?: number;
  minExitDscr?: number;          // takeout DSCR floor, default 1.0
}

export type BridgeViability = 'VIABLE' | 'TIGHT' | 'SHORTFALL';

export interface ConstructionBridgeResult {
  ltcPct: number;                // loanAmount ÷ totalProjectCost
  monthlyIOPaymentFull: number;  // IO on the FULL loan (peak carry)
  interestReserveNeeded: number; // avg-draw IO × months (reserve to fund the carry)
  exitPayment: number;           // takeout P&I
  exitPitia: number;             // takeout PITIA
  exitDscr: number;              // stabilized rent ÷ takeout PITIA
  takeoutRetiresBridge: boolean; // takeout ≥ bridge balance
  viability: BridgeViability;
}

export function computeConstructionBridge(
  input: ConstructionBridgeInput,
): ConstructionBridgeResult {
  const avgDraw = input.avgDrawFraction ?? 0.5;
  const minExitDscr = input.minExitDscr ?? 1.0;
  const exitTermMonths = (input.exitTermYears ?? 30) * 12;
  const takeout = input.takeoutLoanAmount ?? input.loanAmount;

  const ltcPct =
    input.totalProjectCost > 0
      ? (input.loanAmount / input.totalProjectCost) * 100
      : 0;

  const monthlyIOPaymentFull = calculateIOPayment(input.loanAmount, input.bridgeRate);
  const interestReserveNeeded =
    calculateIOPayment(input.loanAmount * avgDraw, input.bridgeRate) *
    input.constructionMonths;

  const exitPayment = calculatePI(takeout, input.exitRate, exitTermMonths);
  const exitPitia = exitPayment + input.stabilizedEscrowsMonthly;
  const exitDscr = exitPitia > 0 ? input.stabilizedRentMonthly / exitPitia : 0;

  const takeoutRetiresBridge = takeout >= input.loanAmount;

  let viability: BridgeViability;
  if (!takeoutRetiresBridge || exitDscr < minExitDscr) {
    viability = 'SHORTFALL';
  } else if (exitDscr < minExitDscr + 0.1) {
    viability = 'TIGHT';
  } else {
    viability = 'VIABLE';
  }

  return {
    ltcPct: Math.round(ltcPct * 10) / 10,
    monthlyIOPaymentFull: Math.round(monthlyIOPaymentFull),
    interestReserveNeeded: Math.round(interestReserveNeeded),
    exitPayment: Math.round(exitPayment),
    exitPitia: Math.round(exitPitia),
    exitDscr: Math.round(exitDscr * 1000) / 1000,
    takeoutRetiresBridge,
    viability,
  };
}
