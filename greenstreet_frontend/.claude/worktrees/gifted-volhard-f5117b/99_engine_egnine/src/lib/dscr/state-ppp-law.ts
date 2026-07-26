// ============================================================================
// STATE PPP (PREPAYMENT PENALTY) LAW ENGINE — v7.0 Section 13.3
// ============================================================================
// The system must check state + vesting + loan amount + product type before
// showing PPP options. Offering an illegal PPP structure creates legal exposure.
// ============================================================================

export type VestingType = 'individual' | 'llc' | 'partnership' | 'corporation' | 'trust';
export type ProductType = 'fixed_rate' | 'arm' | 'io';

export interface StatePppLaw {
  state: string;
  status: 'effectively_prohibited' | 'individual_barred' | 'amount_conditional' | 'arm_restricted' | 'structure_restricted' | 'permitted';
  description: string;
  // For amount-conditional states
  amountThreshold?: number; // PPP banned below this loan amount
  // For vesting-dependent states
  individualBarred?: boolean;
  entityAllowed?: boolean;
  // For ARM-restricted states
  armProhibited?: boolean;
  // For structure-restricted states
  allowedStructures?: string[]; // e.g., ['declining'] for MS
  // Rate impact of no-PPP
  noPppRateImpactBps: number; // typically +25-50bps
  noPppOriginationFeePct: number; // typically ≤0.625%
}

export const STATE_PPP_LAWS: Record<string, StatePppLaw> = {
  // EFFECTIVELY PROHIBITED
  KS: {
    state: 'KS',
    status: 'effectively_prohibited',
    description: 'Kansas effectively prohibits prepayment penalties on residential mortgage loans.',
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  MN: {
    state: 'MN',
    status: 'effectively_prohibited',
    description: 'Minnesota restrictions so narrow that virtually all DSCR lenders offer no PPP on MN loans at all.',
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  NM: {
    state: 'NM',
    status: 'effectively_prohibited',
    description: 'New Mexico prohibits prepayment penalties on residential loans.',
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  ND: {
    state: 'ND',
    status: 'effectively_prohibited',
    description: 'North Dakota prohibits prepayment penalties on residential loans.',
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  MD: {
    state: 'MD',
    status: 'effectively_prohibited',
    description: 'Maryland — usury law conditions apply, effectively prohibiting PPP on most residential DSCR loans.',
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },

  // INDIVIDUAL-BARRED (entity may qualify)
  NJ: {
    state: 'NJ',
    status: 'individual_barred',
    description: 'New Jersey bars prepayment penalties for individual borrowers. LLCs/entities may qualify — varies by lender.',
    individualBarred: true,
    entityAllowed: true,
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  IL: {
    state: 'IL',
    status: 'individual_barred',
    description: 'Illinois bars prepayment penalties for individual borrowers. Entities subject to APR tests.',
    individualBarred: true,
    entityAllowed: true,
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },

  // AMOUNT-CONDITIONAL
  OH: {
    state: 'OH',
    status: 'amount_conditional',
    description: 'Ohio bans prepayment penalties on loans ≤ ~$112,957 (threshold adjusts). Loans above threshold may have PPP.',
    amountThreshold: 112957,
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  PA: {
    state: 'PA',
    status: 'amount_conditional',
    description: 'Pennsylvania bans prepayment penalties on 1-2 unit properties ≤ ~$319,777 (threshold adjusts).',
    amountThreshold: 319777,
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },

  // ARM-RESTRICTED
  WA: {
    state: 'WA',
    status: 'arm_restricted',
    description: 'Washington prohibits PPP on ARMs; fixed-rate only may have PPP.',
    armProhibited: true,
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },

  // STRUCTURE-RESTRICTED
  MS: {
    state: 'MS',
    status: 'structure_restricted',
    description: 'Mississippi allows only declining-balance prepayment structures (no flat penalties).',
    allowedStructures: ['declining'],
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },

  // NY, MA, SC, AK — prepay restricted (from my existing state-overlays.ts, confirmed by v7.0)
  NY: {
    state: 'NY',
    status: 'effectively_prohibited',
    description: 'New York bans prepay penalties on 1-2 family owner-occupied loans under $2.5M. Non-owner occupied DSCR loans typically use defeasance.',
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  MA: {
    state: 'MA',
    status: 'individual_barred',
    description: 'Massachusetts restricts prepay penalties on owner-occupied 1-4 unit properties. Non-owner occupied is exempt but lenders typically comply.',
    individualBarred: true,
    entityAllowed: true,
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  SC: {
    state: 'SC',
    status: 'individual_barred',
    description: 'South Carolina restricts prepay penalties on certain owner-occupied loans. Non-owner occupied is exempt.',
    individualBarred: true,
    entityAllowed: true,
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
  AK: {
    state: 'AK',
    status: 'effectively_prohibited',
    description: 'Alaska restricts prepay penalties on certain residential loans.',
    noPppRateImpactBps: 25,
    noPppOriginationFeePct: 0.625,
  },
};

export interface PppEligibilityInput {
  state: string;
  vesting: VestingType;
  loanAmount: number;
  productType: ProductType;
  prepayStructure: string; // 'declining' | 'flat' | 'yield_maintenance' | etc.
}

export interface PppEligibilityResult {
  state: string;
  law: StatePppLaw | null;
  pppAllowed: boolean;
  reason: string;
  rateImpactBps: number;
  originationFeePct: number;
  warnings: string[];
}

export function checkPppEligibility(input: PppEligibilityInput): PppEligibilityResult {
  const law = STATE_PPP_LAWS[input.state.toUpperCase()] ?? null;
  const warnings: string[] = [];

  if (!law) {
    // No specific restriction — PPP generally permitted
    return {
      state: input.state,
      law: null,
      pppAllowed: true,
      reason: `${input.state} has no specific PPP restriction — standard structures permitted.`,
      rateImpactBps: 0,
      originationFeePct: 0,
      warnings,
    };
  }

  let pppAllowed = true;
  let reason = '';

  switch (law.status) {
    case 'effectively_prohibited':
      pppAllowed = false;
      reason = `${law.state}: ${law.description}`;
      warnings.push(`PPP prohibited — expect +${law.noPppRateImpactBps}bps rate add and/or ${law.noPppOriginationFeePct}% origination fee.`);
      break;

    case 'individual_barred':
      if (input.vesting === 'individual') {
        pppAllowed = false;
        reason = `${law.state}: Individuals barred from PPP. ${law.description}`;
      } else {
        pppAllowed = true;
        reason = `${law.state}: Individuals barred, but ${input.vesting} vesting may qualify. ${law.description}`;
        warnings.push('Entity vesting PPP eligibility varies by lender — confirm directly.');
      }
      break;

    case 'amount_conditional':
      if (input.loanAmount <= (law.amountThreshold ?? 0)) {
        pppAllowed = false;
        reason = `${law.state}: PPP banned on loans ≤ $${law.amountThreshold?.toLocaleString()}. Your loan $${input.loanAmount.toLocaleString()} is below threshold.`;
      } else {
        pppAllowed = true;
        reason = `${law.state}: PPP permitted on loans > $${law.amountThreshold?.toLocaleString()}. Your loan $${input.loanAmount.toLocaleString()} qualifies.`;
      }
      break;

    case 'arm_restricted':
      if (input.productType === 'arm') {
        pppAllowed = false;
        reason = `${law.state}: PPP prohibited on ARMs. Fixed-rate only may have PPP.`;
      } else {
        pppAllowed = true;
        reason = `${law.state}: PPP permitted on fixed-rate products (ARMs prohibited).`;
      }
      break;

    case 'structure_restricted':
      if (law.allowedStructures && !law.allowedStructures.includes(input.prepayStructure)) {
        pppAllowed = false;
        reason = `${law.state}: Only ${law.allowedStructures.join(', ')} structures permitted. '${input.prepayStructure}' not allowed.`;
      } else {
        pppAllowed = true;
        reason = `${law.state}: '${input.prepayStructure}' structure permitted.`;
      }
      break;

    case 'permitted':
      pppAllowed = true;
      reason = `${law.state}: PPP generally permitted.`;
      break;
  }

  return {
    state: input.state,
    law,
    pppAllowed,
    reason,
    rateImpactBps: pppAllowed ? 0 : law.noPppRateImpactBps,
    originationFeePct: pppAllowed ? 0 : law.noPppOriginationFeePct,
    warnings,
  };
}
