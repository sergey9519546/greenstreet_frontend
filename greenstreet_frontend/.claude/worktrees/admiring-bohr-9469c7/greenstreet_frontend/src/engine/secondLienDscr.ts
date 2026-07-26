// ============================================================
// SECOND-LIEN / HELOC DSCR
// ============================================================
// IMPROVE_SECOND_LIEN_HELOC_DSCR.md — the $21B (2025) DSCR closed-end 2nd-lien
// market (Angel Oak et al.) lets investors tap equity WITHOUT refinancing a
// low-rate 1st lien or eating its prepay penalty. Qualification is combined:
//   Combined DSCR = Rent / (1st-lien PITIA + new 2nd-lien P&I)
// subject to a CLTV cap (~75%) and a DSCR floor (~1.0).
//
// Pure math, reuses calculatePI. Frontend-native.

import { calculatePI } from './engine';

export interface SecondLienInput {
  monthlyRent: number;        // qualifying gross rent
  firstLienPITIA: number;     // existing 1st-lien full monthly payment (P+I+T+I+HOA)
  firstLienBalance: number;   // remaining 1st-lien principal
  propertyValue: number;      // current appraised value
  secondLienAmount: number;   // requested 2nd-lien draw
  secondLienRate: number;     // 2nd-lien note rate (%)
  secondLienTermYears?: number; // default 30
  maxCltvPct?: number;        // default 75
  minDscr?: number;           // default 1.0
}

export interface SecondLienResult {
  secondLienPayment: number;  // monthly P&I on the 2nd
  combinedDebtService: number;// 1st PITIA + 2nd P&I
  combinedDSCR: number;       // rent ÷ combined debt service
  cltv: number;               // (1st balance + 2nd amount) ÷ value, %
  qualifies: boolean;         // meets BOTH CLTV cap and DSCR floor
  /** Largest 2nd-lien draw that still clears both constraints. */
  maxSecondLien: number;
  bindingConstraint: 'CLTV' | 'DSCR' | 'NONE';
}

export function computeSecondLienDscr(input: SecondLienInput): SecondLienResult {
  const termYears = input.secondLienTermYears ?? 30;
  const maxCltv = (input.maxCltvPct ?? 75) / 100;
  const minDscr = input.minDscr ?? 1.0;
  const termMonths = termYears * 12;

  const secondPayment = input.secondLienAmount > 0
    ? calculatePI(input.secondLienAmount, input.secondLienRate, termMonths)
    : 0;
  const combinedDebtService = input.firstLienPITIA + secondPayment;
  const combinedDSCR = combinedDebtService > 0 ? input.monthlyRent / combinedDebtService : 0;
  const cltv = input.propertyValue > 0
    ? ((input.firstLienBalance + input.secondLienAmount) / input.propertyValue) * 100
    : 0;

  const qualifies = cltv <= maxCltv * 100 + 1e-9 && combinedDSCR >= minDscr;

  // Max 2nd lien = min(CLTV-room, DSCR-room).
  const cltvRoom = Math.max(0, input.propertyValue * maxCltv - input.firstLienBalance);
  // DSCR: max combined payment = rent/minDscr ⇒ max 2nd payment ⇒ max 2nd loan.
  const maxSecondPayment = Math.max(0, input.monthlyRent / minDscr - input.firstLienPITIA);
  const pf = calculatePI(1, input.secondLienRate, termMonths); // payment per $1
  const dscrRoom = pf > 0 ? maxSecondPayment / pf : 0;

  const maxSecondLien = Math.round(Math.min(cltvRoom, dscrRoom));
  const bindingConstraint: 'CLTV' | 'DSCR' | 'NONE' =
    maxSecondLien <= 0 ? 'NONE' : cltvRoom < dscrRoom ? 'CLTV' : 'DSCR';

  return {
    secondLienPayment: Math.round(secondPayment),
    combinedDebtService: Math.round(combinedDebtService),
    combinedDSCR: Math.round(combinedDSCR * 1000) / 1000,
    cltv: Math.round(cltv * 10) / 10,
    qualifies,
    maxSecondLien,
    bindingConstraint,
  };
}
