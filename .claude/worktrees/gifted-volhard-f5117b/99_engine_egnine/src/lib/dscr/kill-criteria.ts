// ============================================================================
// DEAL KILL CRITERIA GATE — v7.0 Section 16
// ============================================================================
// Check these BEFORE spending time on lender shopping. Any triggered criterion
// requires resolution before proceeding.
// ============================================================================

import type { DealInputs } from './types';
import { assessStrLegality, type StrLegalityInput } from './str-worlds';
import { checkPppEligibility, type VestingType, type ProductType } from './state-ppp-law';
import { ltvPct } from './math';
import { isDecliningMarketState } from './llpa';
import {
  FICO_FLOOR_SUBPRIME,
  FICO_FLOOR_NEAR_PRIME,
  DSCR_MINIMUM,
  DSCR_NO_RATIO_FLOOR,
  RESERVES_MINIMUM_MONTHS,
  RESERVES_STANDARD_MONTHS,
  LTV_STANDARD_MAX,
  LTV_STR_CAP,
  LTV_DECLINING_MARKET_CAP,
  RATE_CUSHION_WARNING,
} from './constants';

export type KillCriterionStatus = 'clear' | 'kill' | 'resolve' | 'flag';

export interface KillCriterion {
  criterion: string;
  howToCheck: string;
  status: KillCriterionStatus;
  detail: string;
  actionRequired: string | null;
}

export interface KillCriteriaResult {
  criteria: KillCriterion[];
  overallStatus: 'CLEAR' | 'RESOLVE_FIRST' | 'KILL';
  blockingCriteria: KillCriterion[];
  warnings: string[];
  canProceedToLenderMatching: boolean;
}

export function checkKillCriteria(
  inputs: DealInputs,
  track1Dscr: number,
  track2Dscr: number,
  dealBreakRate: number,
  strLegalityInput: StrLegalityInput | null
): KillCriteriaResult {
  const criteria: KillCriterion[] = [];

  // 1. STR prohibited by city/county
  if (inputs.rentType === 'STR' || inputs.propertyType === 'CONDOTEL') {
    if (strLegalityInput) {
      const legality = assessStrLegality(strLegalityInput);
      if (legality.status === 'PROHIBITED') {
        criteria.push({
          criterion: 'STR prohibited by city/county',
          howToCheck: 'STR legality engine',
          status: 'kill',
          detail: `STR legality status: ${legality.status}`,
          actionRequired: legality.requiredActions[0] ?? 'Resolve STR prohibition before proceeding.',
        });
      } else if (legality.status === 'UNCERTAIN') {
        criteria.push({
          criterion: 'STR legality uncertain',
          howToCheck: 'STR legality engine',
          status: 'resolve',
          detail: `STR legality status: ${legality.status}`,
          actionRequired: 'Resolve uncertain items before proceeding with STR income.',
        });
      } else {
        criteria.push({
          criterion: 'STR legality confirmed',
          howToCheck: 'STR legality engine',
          status: 'clear',
          detail: `STR legality status: ${legality.status}`,
          actionRequired: null,
        });
      }
    } else {
      criteria.push({
        criterion: 'STR legality not assessed',
        howToCheck: 'STR legality engine',
        status: 'flag',
        detail: 'STR property — legality engine not run',
        actionRequired: 'Run STR legality assessment before proceeding.',
      });
    }
  } else {
    criteria.push({
      criterion: 'STR prohibition (N/A — not STR)',
      howToCheck: 'N/A',
      status: 'clear',
      detail: 'Property is not STR — no STR legality check needed',
      actionRequired: null,
    });
  }

  // 2. STR prohibited by HOA (checked in legality engine above, but flag separately)
  if (inputs.rentType === 'STR' && inputs.hoa > 0) {
    if (strLegalityInput?.hoaStrStatus === 'explicitly_prohibited') {
      criteria.push({
        criterion: 'STR prohibited by HOA',
        howToCheck: 'HOA document review',
        status: 'kill',
        detail: 'HOA explicitly prohibits STR',
        actionRequired: 'STR income not viable — convert to LTR or find different property.',
      });
    } else {
      criteria.push({
        criterion: 'HOA STR status',
        howToCheck: 'HOA document review',
        status: strLegalityInput?.hoaStrStatus === 'unknown' ? 'resolve' : 'clear',
        detail: `HOA status: ${strLegalityInput?.hoaStrStatus ?? 'unknown'}`,
        actionRequired: strLegalityInput?.hoaStrStatus === 'unknown' ? 'Obtain and review HOA CC&Rs' : null,
      });
    }
  }

  // 3. FICO below all lender floors
  if (inputs.fico < FICO_FLOOR_SUBPRIME) {
    criteria.push({
      criterion: 'FICO below all lender floors',
      howToCheck: `Below ${FICO_FLOOR_SUBPRIME} = effectively no standard lenders`,
      status: 'kill',
      detail: `FICO ${inputs.fico} below ${FICO_FLOOR_SUBPRIME} effective floor`,
      actionRequired: 'No standard DSCR lenders available — consider hard money or credit repair.',
    });
  } else if (inputs.fico < FICO_FLOOR_NEAR_PRIME) {
    criteria.push({
      criterion: 'FICO below standard floor',
      howToCheck: `Below ${FICO_FLOOR_NEAR_PRIME} = limited lenders`,
      status: 'flag',
      detail: `FICO ${inputs.fico} below ${FICO_FLOOR_NEAR_PRIME} standard floor — limited lenders`,
      actionRequired: 'Only subprime/specialty lenders available — expect higher rates.',
    });
  } else {
    criteria.push({
      criterion: 'FICO meets lender floors',
      howToCheck: `FICO ≥ ${FICO_FLOOR_NEAR_PRIME}`,
      status: 'clear',
      detail: `FICO ${inputs.fico} meets standard ${FICO_FLOOR_NEAR_PRIME} floor`,
      actionRequired: null,
    });
  }

  // 4. DSCR below no-ratio floor
  if (track1Dscr < DSCR_NO_RATIO_FLOOR) {
    criteria.push({
      criterion: 'DSCR below no-ratio floor',
      howToCheck: `Below ${DSCR_NO_RATIO_FLOOR} without asset base = very limited options`,
      status: 'kill',
      detail: `Track 1 DSCR ${track1Dscr.toFixed(2)}x below ${DSCR_NO_RATIO_FLOOR} no-ratio floor`,
      actionRequired: 'Very limited options — restructure deal (lower LTV, higher rent, lower price).',
    });
  } else if (track1Dscr < DSCR_MINIMUM) {
    criteria.push({
      criterion: 'DSCR below 1.0 (sub-1.0 territory)',
      howToCheck: 'Sub-1.0 requires 25-35% down at most lenders',
      status: 'flag',
      detail: `Track 1 DSCR ${track1Dscr.toFixed(2)}x — sub-1.0 territory`,
      actionRequired: 'Expect 25-35% down payment requirement and higher reserves.',
    });
  } else {
    criteria.push({
      criterion: 'DSCR above 1.0',
      howToCheck: `Track 1 DSCR ≥ ${DSCR_MINIMUM}`,
      status: 'clear',
      detail: `Track 1 DSCR ${track1Dscr.toFixed(2)}x — qualifies at standard lenders`,
      actionRequired: null,
    });
  }

  // 5. Rate above deal-break rate
  if (inputs.rate > dealBreakRate) {
    criteria.push({
      criterion: 'Rate above deal-break rate',
      howToCheck: 'Rate shock engine',
      status: 'kill',
      detail: `Current rate ${inputs.rate}% above deal-break rate ${dealBreakRate.toFixed(2)}%`,
      actionRequired: 'Deal fails at current rate — buy down rate or restructure.',
    });
  } else {
    const cushion = dealBreakRate - inputs.rate;
    criteria.push({
      criterion: 'Rate within deal-break cushion',
      howToCheck: `Deal-break rate ${dealBreakRate.toFixed(2)}%`,
      status: cushion < RATE_CUSHION_WARNING ? 'flag' : 'clear',
      detail: `Current rate ${inputs.rate}% — ${cushion.toFixed(2)}% cushion`,
      actionRequired: cushion < RATE_CUSHION_WARNING ? 'Thin rate cushion — rate lock recommended' : null,
    });
  }

  // 6. PPP illegal in borrower's state
  const vesting = (inputs.entity === 'INDIVIDUAL' ? 'individual' : 'llc') as VestingType;
  const productType: ProductType = inputs.structure.startsWith('ARM_') ? 'arm' : (inputs.interestOnlyMonths > 0 ? 'io' : 'fixed_rate');
  const pppEligibility = checkPppEligibility({
    state: inputs.state,
    vesting,
    loanAmount: inputs.loanAmount,
    productType,
    prepayStructure: 'declining',
  });
  if (inputs.prepayType !== 'NONE' && !pppEligibility.pppAllowed) {
    criteria.push({
      criterion: 'PPP illegal in borrower state',
      howToCheck: 'State PPP law engine',
      status: 'kill',
      detail: pppEligibility.reason,
      actionRequired: `Switch to no-PPP option (expect +${pppEligibility.rateImpactBps}bps rate add).`,
    });
  } else {
    criteria.push({
      criterion: 'PPP legal in borrower state',
      howToCheck: 'State PPP law engine',
      status: 'clear',
      detail: pppEligibility.pppAllowed ? 'PPP permitted' : 'PPP not selected — no issue',
      actionRequired: null,
    });
  }

  // 7. Reserves unavailable liquid
  if (inputs.reservesMonths < RESERVES_MINIMUM_MONTHS) {
    criteria.push({
      criterion: 'Reserves unavailable liquid',
      howToCheck: 'Liquidity review',
      status: 'kill',
      detail: `Reserves ${inputs.reservesMonths}mo below ${RESERVES_MINIMUM_MONTHS}mo minimum`,
      actionRequired: 'Insufficient reserves — add liquid capital before applying.',
    });
  } else {
    criteria.push({
      criterion: 'Reserves adequate',
      howToCheck: 'Liquidity review',
      status: inputs.reservesMonths < RESERVES_STANDARD_MONTHS ? 'flag' : 'clear',
      detail: `Reserves ${inputs.reservesMonths}mo`,
      actionRequired: inputs.reservesMonths < RESERVES_STANDARD_MONTHS ? `Reserves below ${RESERVES_STANDARD_MONTHS}mo median — some lenders may require more` : null,
    });
  }

  // 8. LTV exceeds max
  const ltv = ltvPct(inputs.loanAmount, inputs.appraisedValue || inputs.purchasePrice);
  if (Number.isNaN(ltv)) { return { criteria: [{ criterion: "Invalid LTV", howToCheck: "Verify appraised value and purchase price are positive", status: "kill" as const, detail: "LTV cannot be computed — invalid property value", actionRequired: "Provide valid appraised value or purchase price" }], overallStatus: "KILL" as const, blockingCriteria: [{ criterion: "Invalid LTV", howToCheck: "Verify appraised value and purchase price are positive", status: "kill" as const, detail: "LTV cannot be computed — invalid property value", actionRequired: "Provide valid appraised value or purchase price" }], warnings: [], canProceedToLenderMatching: false }; }
  if (ltv > LTV_STANDARD_MAX) {
    criteria.push({
      criterion: 'LTV exceeds 80% max',
      howToCheck: 'LTV calculation',
      status: 'kill',
      detail: `LTV ${ltv.toFixed(1)}% exceeds ${LTV_STANDARD_MAX}% standard max`,
      actionRequired: 'Increase down payment or reduce purchase price.',
    });
  } else {
    criteria.push({
      criterion: 'LTV within limits',
      howToCheck: `LTV ≤ ${LTV_STANDARD_MAX}%`,
      status: 'clear',
      detail: `LTV ${ltv.toFixed(1)}% within ${LTV_STANDARD_MAX}% max`,
      actionRequired: null,
    });
  }

  // v7.1 Mistake #16: Declining-market state overlay — CT/FL/IL/NJ/NY
  // Properties in these states face automatic LTV reduction to 75% regardless of DSCR/FICO
  if (isDecliningMarketState(inputs.state)) {
    if (ltv > LTV_DECLINING_MARKET_CAP) {
      criteria.push({
        criterion: 'Declining-market state LTV overlay',
        howToCheck: `${inputs.state} is a declining-market state`,
        status: 'kill',
        detail: `${inputs.state} declining-market overlay: LTV capped at ${LTV_DECLINING_MARKET_CAP}% — current LTV ${ltv.toFixed(1)}% exceeds cap`,
        actionRequired: `Increase down payment to bring LTV ≤ ${LTV_DECLINING_MARKET_CAP}%, or find lender without declining-market overlay (rare).`,
      });
    } else {
      criteria.push({
        criterion: 'Declining-market state overlay (within cap)',
        howToCheck: `${inputs.state} declining-market check`,
        status: 'flag',
        detail: `${inputs.state} is a declining-market state — LTV capped at ${LTV_DECLINING_MARKET_CAP}% (current ${ltv.toFixed(1)}% OK)`,
        actionRequired: null,
      });
    }
  }

  // v7.1: STR LTV cap at 75% (Angel Oak, Visio, others)
  if ((inputs.rentType === 'STR' || inputs.propertyType === 'CONDOTEL') && ltv > LTV_STR_CAP) {
    criteria.push({
      criterion: 'STR LTV cap exceeded',
      howToCheck: 'STR-specific LTV grid',
      status: 'kill',
      detail: `STR property LTV ${ltv.toFixed(1)}% exceeds ${LTV_STR_CAP}% STR cap (Angel Oak, Visio, others)`,
      actionRequired: `STR properties are capped at ${LTV_STR_CAP}% LTV by multiple lenders — increase down payment.`,
    });
  }

  // Determine overall status
  const hasKill = criteria.some((c) => c.status === 'kill');
  const hasResolve = criteria.some((c) => c.status === 'resolve');
  const blockingCriteria = criteria.filter((c) => c.status === 'kill' || c.status === 'resolve');

  const overallStatus: KillCriteriaResult['overallStatus'] = hasKill ? 'KILL' : hasResolve ? 'RESOLVE_FIRST' : 'CLEAR';
  const canProceedToLenderMatching = overallStatus === 'CLEAR';

  const warnings = criteria
    .filter((c) => c.status === 'flag')
    .map((c) => `${c.criterion}: ${c.detail}`);

  return {
    criteria,
    overallStatus,
    blockingCriteria,
    warnings,
    canProceedToLenderMatching,
  };
}
