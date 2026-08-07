// ============================================================================
// REFINANCE OPPORTUNITY SCANNER + PORTFOLIO RISK DASHBOARD — v7.0 Section 19
// ============================================================================

import { monthlyPayment, round } from './math';
import { calculatePppPenalty, type PppModelType } from './ppp-optimizer';

// ---------------------------------------------------------------------------
// REFINANCE OPPORTUNITY SCANNER — v7.0 Section 19.3
// ---------------------------------------------------------------------------

export interface RefiCandidate {
  propertyId: string;
  address: string;
  currentRate: number;
  marketRate: number;
  loanAmount: number;
  amortMonths: number;
  monthsSinceOrigination: number;
  pppModel: PppModelType;
  pppOutstandingBalance: number;
  // Computed
  monthlySavings: number;
  annualSavings: number;
  refiCost: number;
  pppRemaining: number;
  breakEvenMonths: number;
  recommendRefi: boolean;
  reason: string;
}

export interface RefiScanResult {
  candidates: RefiCandidate[];
  totalAnnualSavings: number;
  recommendedCount: number;
  thresholdBps: number; // 75bps per v7.0
}

export function scanRefinanceOpportunities(
  properties: Omit<RefiCandidate, 'monthlySavings' | 'annualSavings' | 'refiCost' | 'pppRemaining' | 'breakEvenMonths' | 'recommendRefi' | 'reason'>[],
  marketRate: number,
  thresholdBps: number = 75
): RefiScanResult {
  const candidates: RefiCandidate[] = properties.map((p) => {
    const currentPmt = monthlyPayment(p.loanAmount, p.currentRate, p.amortMonths);
    const newPmt = monthlyPayment(p.loanAmount, p.marketRate, p.amortMonths);
    const monthlySavings = currentPmt - newPmt;
    const annualSavings = monthlySavings * 12;

    // PPP remaining
    const pppResult = calculatePppPenalty(
      p.pppModel,
      p.pppOutstandingBalance,
      p.loanAmount,
      p.monthsSinceOrigination,
      p.currentRate
    );
    const pppRemaining = pppResult.penalty;

    // Refi cost — estimate at 2% of loan amount + PPP
    const refiCost = (p.loanAmount * 0.02) + pppRemaining;

    const breakEvenMonths = monthlySavings > 0 ? refiCost / monthlySavings : Infinity;

    // Recommend if rate diff > threshold AND break-even < 60 months (5 years)
    const rateDiffBps = (p.currentRate - p.marketRate) * 100;
    const recommendRefi = rateDiffBps > thresholdBps && Number.isFinite(breakEvenMonths) && breakEvenMonths < 60;

    let reason: string;
    if (rateDiffBps <= thresholdBps) {
      reason = `Rate diff ${rateDiffBps.toFixed(0)}bps below ${thresholdBps}bps threshold — no refi benefit.`;
    } else if (!Number.isFinite(breakEvenMonths)) {
      reason = 'No monthly savings — refi not viable.';
    } else if (breakEvenMonths >= 60) {
      reason = `Break-even ${breakEvenMonths.toFixed(0)}mo exceeds 60mo limit.`;
    } else {
      reason = `Refi recommended — save $${monthlySavings.toFixed(0)}/mo, break-even ${breakEvenMonths.toFixed(0)}mo.`;
    }

    return {
      ...p,
      monthlySavings: round(monthlySavings),
      annualSavings: round(annualSavings),
      refiCost: round(refiCost),
      pppRemaining: round(pppRemaining),
      breakEvenMonths: Number.isFinite(breakEvenMonths) ? round(breakEvenMonths, 1) : 9999,
      recommendRefi,
      reason,
    };
  });

  const recommended = candidates.filter((c) => c.recommendRefi);
  const totalAnnualSavings = recommended.reduce((sum, c) => sum + c.annualSavings, 0);

  return {
    candidates,
    totalAnnualSavings: round(totalAnnualSavings),
    recommendedCount: recommended.length,
    thresholdBps,
  };
}

// ---------------------------------------------------------------------------
// PORTFOLIO RISK DASHBOARD — v7.0 Section 19.4
// ---------------------------------------------------------------------------

export type AlertLevel = 'red' | 'yellow' | 'blue' | 'green';

export interface PortfolioAlert {
  level: AlertLevel;
  propertyId: string;
  address: string;
  alertType: string;
  message: string;
  actionRequired: string;
}

export interface PortfolioRiskDashboard {
  alerts: PortfolioAlert[];
  redCount: number;
  yellowCount: number;
  blueCount: number;
  greenCount: number;
  summary: string;
}

export interface PortfolioPropertyForRisk {
  propertyId: string;
  address: string;
  track1Dscr: number;
  currentRate: number;
  marketRate: number;
  rateLockExpiryMonths: number | null; // null = no rate lock
  isStr: boolean;
  strLegislationPending: boolean;
  isBlanketLoan: boolean;
  blanketSaleOrRefiPlanned: boolean;
  approachingDscrTierBump: boolean; // approaching 1.25 from below
  pppPeriodEndingMonths: number | null; // null = no PPP or already ended
}

export function buildPortfolioRiskDashboard(properties: PortfolioPropertyForRisk[]): PortfolioRiskDashboard {
  const alerts: PortfolioAlert[] = [];

  for (const p of properties) {
    // RED: Sub-1.0 DSCR properties (Track 1)
    if (p.track1Dscr < 1.0) {
      alerts.push({
        level: 'red',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'Sub-1.0 DSCR',
        message: `Track 1 DSCR ${p.track1Dscr.toFixed(2)}x below 1.0 — portfolio cash flow drag`,
        actionRequired: 'Restructure or sell — consider rate buydown, lower LTV, or exit.',
      });
    }

    // YELLOW: Expiring rate locks
    if (p.rateLockExpiryMonths !== null && p.rateLockExpiryMonths <= 2) {
      alerts.push({
        level: 'yellow',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'Rate Lock Expiring',
        message: `Rate lock expires in ${p.rateLockExpiryMonths}mo`,
        actionRequired: 'Lock new rate or prepare for payment shock.',
      });
    }

    // YELLOW: STR properties with pending legislation
    if (p.isStr && p.strLegislationPending) {
      alerts.push({
        level: 'yellow',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'STR Legislation Pending',
        message: 'STR property in market with pending regulatory legislation',
        actionRequired: 'Monitor legislation — prepare LTR fallback plan.',
      });
    }

    // YELLOW: Blanket loans with upcoming sale/refi need
    if (p.isBlanketLoan && p.blanketSaleOrRefiPlanned) {
      alerts.push({
        level: 'yellow',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'Blanket Loan Exit Risk',
        message: 'Blanket loan with planned sale/refi — exit may trigger yield maintenance',
        actionRequired: 'Negotiate partial release clause BEFORE needing to exit. Yield maintenance can run 6 figures.',
      });
    }

    // BLUE: Refi candidates with favorable break-even
    const rateDiff = p.currentRate - p.marketRate;
    if (rateDiff > 0.75 && p.track1Dscr >= 1.0) {
      alerts.push({
        level: 'blue',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'Refi Opportunity',
        message: `Current rate ${p.currentRate}% vs market ${p.marketRate}% — ${rateDiff.toFixed(2)}% savings available`,
        actionRequired: 'Run refi break-even calculator — may be opportune time to lock lower rate.',
      });
    }

    // BLUE: Prepay period endings
    if (p.pppPeriodEndingMonths !== null && p.pppPeriodEndingMonths <= 6) {
      alerts.push({
        level: 'blue',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'PPP Period Ending',
        message: `Prepay penalty period ends in ${p.pppPeriodEndingMonths}mo`,
        actionRequired: 'Refi or sell without penalty soon — flexibility opening up.',
      });
    }

    // BLUE: Properties approaching 1.25 DSCR (pricing tier bump)
    if (p.approachingDscrTierBump && p.track1Dscr >= 1.15 && p.track1Dscr < 1.25) {
      alerts.push({
        level: 'blue',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'Approaching Pricing Tier Bump',
        message: `DSCR ${p.track1Dscr.toFixed(2)}x approaching 1.25x best-pricing tier`,
        actionRequired: 'Small rent increase or principal paydown could unlock better pricing on refi.',
      });
    }

    // GREEN: Healthy properties (no alerts above)
    if (p.track1Dscr >= 1.25 && !p.isStr && !p.isBlanketLoan) {
      alerts.push({
        level: 'green',
        propertyId: p.propertyId,
        address: p.address,
        alertType: 'Healthy',
        message: `DSCR ${p.track1Dscr.toFixed(2)}x — healthy portfolio member`,
        actionRequired: 'No action needed.',
      });
    }
  }

  const redCount = alerts.filter((a) => a.level === 'red').length;
  const yellowCount = alerts.filter((a) => a.level === 'yellow').length;
  const blueCount = alerts.filter((a) => a.level === 'blue').length;
  const greenCount = alerts.filter((a) => a.level === 'green').length;

  const summary = `Portfolio: ${redCount} red, ${yellowCount} yellow, ${blueCount} blue, ${greenCount} green. ${
    redCount > 0 ? 'Immediate action required on red alerts.' : yellowCount > 0 ? 'Monitor yellow alerts.' : 'Portfolio healthy.'
  }`;

  return {
    alerts,
    redCount,
    yellowCount,
    blueCount,
    greenCount,
    summary,
  };
}
