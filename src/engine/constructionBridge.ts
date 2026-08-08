/**
 * Construction & Bridge Loan DSCR Engine
 *
 * Evaluates short-term construction/bridge debt carries no day-one rent.
 * Evaluates:
 * 1. Interest reserve required based on progressive draw schedules (50% avg draw).
 * 2. Peak monthly IO carry.
 * 3. Takeout DSCR viability to ensure permanent loan retires the bridge note.
 */

import { calculateIOPayment, calculatePI } from "./engine";

export interface ConstructionBridgeInput {
  totalProjectCost: number; // land + hard + soft costs
  loanAmount: number; // bridge/construction loan amount
  bridgeRate: number; // interest rate (%)
  constructionMonths: number; // build duration in months
  avgDrawFraction?: number; // default 0.5 (50% average draw)
  stabilizedRentMonthly: number; // projected monthly rent at completion
  stabilizedEscrowsMonthly: number; // taxes + insurance + HOA monthly
  exitRate: number; // permanent takeout interest rate (%)
  exitTermYears?: number; // default 30
  takeoutLoanAmount?: number; // default = bridge loanAmount
  minExitDscr?: number; // default 1.0
}

export type BridgeViability = "VIABLE" | "TIGHT" | "SHORTFALL";

export interface ConstructionBridgeResult {
  ltcPct: number; // Loan-to-Cost %
  monthlyIOPaymentFull: number; // peak monthly interest-only payment
  interestReserveNeeded: number; // total interest reserve required
  exitPayment: number; // permanent takeout P&I
  exitPitia: number; // permanent takeout PITIA
  exitDscr: number; // stabilized DSCR
  takeoutRetiresBridge: boolean; // true if takeout loan >= bridge loan
  viability: BridgeViability;
}

export function computeConstructionBridge(input: ConstructionBridgeInput): ConstructionBridgeResult {
  const avgDraw = input.avgDrawFraction ?? 0.5;
  const minExitDscr = input.minExitDscr ?? 1.0;
  const exitTermMonths = (input.exitTermYears ?? 30) * 12;
  const takeout = input.takeoutLoanAmount ?? input.loanAmount;

  const ltcPct = input.totalProjectCost > 0 ? (input.loanAmount / input.totalProjectCost) * 100 : 0;

  const monthlyIOPaymentFull = calculateIOPayment(input.loanAmount, input.bridgeRate);
  const interestReserveNeeded =
    calculateIOPayment(input.loanAmount * avgDraw, input.bridgeRate) * input.constructionMonths;

  const exitPayment = calculatePI(takeout, input.exitRate, exitTermMonths);
  const exitPitia = exitPayment + input.stabilizedEscrowsMonthly;
  const exitDscr = exitPitia > 0 ? input.stabilizedRentMonthly / exitPitia : 0;

  const takeoutRetiresBridge = takeout >= input.loanAmount;

  let viability: BridgeViability;
  if (!takeoutRetiresBridge || exitDscr < minExitDscr) {
    viability = "SHORTFALL";
  } else if (exitDscr < minExitDscr + 0.1) {
    viability = "TIGHT";
  } else {
    viability = "VIABLE";
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
