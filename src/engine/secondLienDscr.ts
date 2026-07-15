// ============================================================
// SECOND-LIEN / HELOC DSCR SCENARIO MATH
// ============================================================

import { calculatePI } from './engine';

const MAX_MODEL_RATE_PCT = 25;
const MAX_MODEL_TERM_YEARS = 50;

export interface SecondLienInput {
  monthlyRent: number;
  firstLienPITIA: number;
  firstLienBalance: number;
  propertyValue: number;
  secondLienAmount: number;
  secondLienRate: number;
  secondLienTermYears?: number;
  maxCltvPct?: number;
  minDscr?: number;
}

export interface SecondLienResult {
  status: 'AVAILABLE' | 'REVIEW';
  reviewReasons: string[];
  secondLienPayment: number;
  combinedDebtService: number;
  combinedDSCR: number;
  cltv: number;
  qualifies: boolean;
  maxSecondLien: number;
  bindingConstraint: 'CLTV' | 'DSCR' | 'NONE';
}

function reviewResult(reasons: string[]): SecondLienResult {
  return {
    status: 'REVIEW',
    reviewReasons: reasons,
    secondLienPayment: 0,
    combinedDebtService: 0,
    combinedDSCR: 0,
    cltv: 0,
    qualifies: false,
    maxSecondLien: 0,
    bindingConstraint: 'NONE',
  };
}

function safePayment(principal: number, annualRatePct: number, months: number): number {
  if (principal === 0) return 0;
  if (annualRatePct === 0) return principal / months;
  const payment = calculatePI(principal, annualRatePct, months);
  return Number.isFinite(payment) && payment >= 0 ? payment : Number.NaN;
}

export function computeSecondLienDscr(input: SecondLienInput): SecondLienResult {
  const termYears = input.secondLienTermYears ?? 30;
  const maxCltvPct = input.maxCltvPct ?? 75;
  const minDscr = input.minDscr ?? 1;
  const values: Array<[number, string]> = [
    [input.monthlyRent, 'Monthly rent'],
    [input.firstLienPITIA, 'First-lien PITIA'],
    [input.firstLienBalance, 'First-lien balance'],
    [input.propertyValue, 'Property value'],
    [input.secondLienAmount, 'Second-lien amount'],
    [input.secondLienRate, 'Second-lien rate'],
    [termYears, 'Second-lien term'],
    [maxCltvPct, 'Maximum CLTV'],
    [minDscr, 'Minimum DSCR'],
  ];
  const reasons = values
    .filter(([value]) => !Number.isFinite(value))
    .map(([, label]) => `${label} must be a finite number.`);

  if (Number.isFinite(input.monthlyRent) && input.monthlyRent < 0) reasons.push('Monthly rent cannot be negative.');
  if (Number.isFinite(input.firstLienPITIA) && input.firstLienPITIA <= 0) reasons.push('First-lien PITIA must be greater than zero.');
  if (Number.isFinite(input.firstLienBalance) && input.firstLienBalance < 0) reasons.push('First-lien balance cannot be negative.');
  if (Number.isFinite(input.propertyValue) && input.propertyValue <= 0) reasons.push('Property value must be greater than zero.');
  if (Number.isFinite(input.secondLienAmount) && input.secondLienAmount <= 0) reasons.push('Second-lien amount must be greater than zero.');
  if (
    Number.isFinite(input.propertyValue)
    && Number.isFinite(input.secondLienAmount)
    && input.propertyValue > 0
    && input.secondLienAmount > input.propertyValue
  ) {
    reasons.push('Second-lien amount cannot exceed the entered property value in this model.');
  }
  if (
    Number.isFinite(input.secondLienRate)
    && (input.secondLienRate < 0 || input.secondLienRate > MAX_MODEL_RATE_PCT)
  ) {
    reasons.push(`Second-lien rate must be between 0% and ${MAX_MODEL_RATE_PCT}% for this model.`);
  }
  if (
    Number.isFinite(termYears)
    && (!Number.isInteger(termYears) || termYears < 1 || termYears > MAX_MODEL_TERM_YEARS)
  ) {
    reasons.push(`Second-lien term must be a whole number from 1 to ${MAX_MODEL_TERM_YEARS} years.`);
  }
  if (Number.isFinite(maxCltvPct) && (maxCltvPct <= 0 || maxCltvPct > 100)) {
    reasons.push('Maximum CLTV must be greater than 0% and no more than 100%.');
  }
  if (Number.isFinite(minDscr) && minDscr <= 0) reasons.push('Minimum DSCR must be greater than zero.');

  if (reasons.length > 0) return reviewResult(reasons);

  const termMonths = termYears * 12;
  const maxCltv = maxCltvPct / 100;
  const secondPayment = safePayment(input.secondLienAmount, input.secondLienRate, termMonths);
  const combinedDebtService = input.firstLienPITIA + secondPayment;
  const combinedDSCR = input.monthlyRent / combinedDebtService;
  const cltv = ((input.firstLienBalance + input.secondLienAmount) / input.propertyValue) * 100;
  const cltvRoom = Math.max(0, input.propertyValue * maxCltv - input.firstLienBalance);
  const maxSecondPayment = Math.max(0, input.monthlyRent / minDscr - input.firstLienPITIA);
  const paymentFactor = safePayment(1, input.secondLienRate, termMonths);
  const dscrRoom = paymentFactor > 0 ? maxSecondPayment / paymentFactor : 0;

  if (![secondPayment, combinedDebtService, combinedDSCR, cltv, cltvRoom, dscrRoom].every(Number.isFinite)) {
    return reviewResult(['The entered values produced a non-finite second-lien result.']);
  }

  const rawMaxSecondLien = Math.min(cltvRoom, dscrRoom);
  const maxSecondLien = Math.max(0, Math.round(rawMaxSecondLien));
  const qualifies = cltv <= maxCltvPct + 1e-9 && combinedDSCR >= minDscr;
  const bindingConstraint: SecondLienResult['bindingConstraint'] = maxSecondLien <= 0
    ? cltvRoom <= 0
      ? 'CLTV'
      : dscrRoom <= 0
        ? 'DSCR'
        : 'NONE'
    : cltvRoom < dscrRoom
      ? 'CLTV'
      : 'DSCR';

  return {
    status: 'AVAILABLE',
    reviewReasons: [],
    secondLienPayment: Math.round(secondPayment),
    combinedDebtService: Math.round(combinedDebtService),
    combinedDSCR: Math.round(combinedDSCR * 1000) / 1000,
    cltv: Math.round(cltv * 10) / 10,
    qualifies,
    maxSecondLien,
    bindingConstraint,
  };
}
