// ============================================================================
// STR THREE WORLDS INCOME MODULE — v7.0 Section 10
// ============================================================================
// v7.0 Principle 3: Three STR income worlds, never blended.
//   World 1 — Long-Term Market Rent (Form 1007) — universal acceptance
//   World 2 — Projected STR Income (AirDNA) — ~40% lender acceptance, market-conditional
//   World 3 — Documented Historical STR Income — ~70% acceptance
//
// v7.0 Section 11: STR Legality Engine runs BEFORE income calculation.
//   If STR is legally prohibited or HOA-restricted, no income calculation matters.
// ============================================================================

export type StrIncomeWorld = 'world1_lt_market' | 'world2_airdna' | 'world3_historical';
export type StrLegalityStatus = 'CLEAR' | 'RESTRICTED' | 'UNCERTAIN' | 'PROHIBITED';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Deal-killer';

// ---------------------------------------------------------------------------
// STR LEGALITY ENGINE — v7.0 Section 11
// ---------------------------------------------------------------------------

export interface StrLegalityInput {
  city: string;
  state: string;
  // Permit
  permitRequired: boolean;
  permitAvailable: boolean;
  permitCapClosed: boolean;
  // Restrictions
  countyRestrictions: boolean;
  stateRestrictions: boolean;
  minStayNights: number; // 0 = no minimum
  ownerOccupancyRequired: boolean;
  // HOA
  hoaExists: boolean;
  hoaDocumentsReviewed: boolean;
  hoaStrStatus: 'explicitly_permitted' | 'explicitly_prohibited' | 'silent' | 'unknown';
  // Enforcement
  enforcementIntensity: 'low' | 'medium' | 'high';
  // Legislation
  pendingLegislation: boolean;
  // Lender confirmation
  lenderStrMethodConfirmed: boolean;
  airdnaMarketOnApprovedList: boolean;
  historical12moAvailable: boolean;
}

export interface StrLegalityResult {
  status: StrLegalityStatus;
  permitRisk: RiskLevel;
  minStayRisk: RiskLevel;
  ownerOccupancyRisk: RiskLevel;
  hoaRisk: RiskLevel;
  enforcementRisk: RiskLevel;
  legislationRisk: RiskLevel;
  requiredActions: string[];
  canProceedWithStrIncome: boolean;
}

export function assessStrLegality(input: StrLegalityInput): StrLegalityResult {
  const requiredActions: string[] = [];
  let permitRisk: RiskLevel = 'Low';
  let minStayRisk: RiskLevel = 'Low';
  let ownerOccupancyRisk: RiskLevel = 'Low';
  let hoaRisk: RiskLevel = 'Low';
  let enforcementRisk: RiskLevel = 'Low';
  let legislationRisk: RiskLevel = 'Low';

  // Permit risk
  if (input.permitCapClosed) {
    permitRisk = 'Deal-killer';
    requiredActions.push('STR permit cap is closed — cannot obtain permit. STR income not viable.');
  } else if (input.permitRequired && !input.permitAvailable) {
    permitRisk = 'Deal-killer';
    requiredActions.push('STR permit required but not available — STR income not viable.');
  } else if (input.permitRequired && input.permitAvailable) {
    permitRisk = 'Medium';
    requiredActions.push('STR permit required and available — obtain permit before closing.');
  }

  // County/state restrictions
  if (input.stateRestrictions || input.countyRestrictions) {
    permitRisk = 'High';
    requiredActions.push('County/state STR restrictions apply — verify specific requirements.');
  }

  // Min stay risk
  if (input.minStayNights >= 30) {
    minStayRisk = 'Deal-killer';
    requiredActions.push(`Minimum stay ${input.minStayNights} nights effectively prohibits short-term rental.`);
  } else if (input.minStayNights >= 7) {
    minStayRisk = 'High';
    requiredActions.push(`Minimum stay ${input.minStayNights} nights limits STR viability — mid-term model may be required.`);
  } else if (input.minStayNights >= 3) {
    minStayRisk = 'Medium';
  }

  // Owner occupancy
  if (input.ownerOccupancyRequired) {
    ownerOccupancyRisk = 'Deal-killer';
    requiredActions.push('Owner-occupancy required — non-owner-occupied DSCR STR income not viable.');
  }

  // HOA risk
  if (input.hoaExists) {
    if (!input.hoaDocumentsReviewed) {
      hoaRisk = 'High';
      requiredActions.push('HOA exists but documents NOT reviewed — cannot proceed with STR income until CC&Rs confirmed.');
    } else if (input.hoaStrStatus === 'explicitly_prohibited') {
      hoaRisk = 'Deal-killer';
      requiredActions.push('HOA explicitly prohibits STR — STR income not viable.');
    } else if (input.hoaStrStatus === 'silent') {
      hoaRisk = 'Medium';
      requiredActions.push('HOA documents silent on STR — attorney review recommended before underwriting STR income.');
    } else if (input.hoaStrStatus === 'unknown') {
      hoaRisk = 'High';
      requiredActions.push('HOA STR status unknown — obtain and review CC&Rs before proceeding.');
    } else if (input.hoaStrStatus === 'explicitly_permitted') {
      hoaRisk = 'Low';
    }
  }

  // Enforcement
  if (input.enforcementIntensity === 'high') {
    enforcementRisk = 'High';
    requiredActions.push('High enforcement intensity — violations likely to result in fines or STR shutdown.');
  } else if (input.enforcementIntensity === 'medium') {
    enforcementRisk = 'Medium';
  }

  // Legislation
  if (input.pendingLegislation) {
    legislationRisk = 'High';
    requiredActions.push('Pending STR legislation — income may be impacted by regulatory changes. Monitor closely.');
  }

  // Overall status
  const risks: RiskLevel[] = [permitRisk, minStayRisk, ownerOccupancyRisk, hoaRisk, enforcementRisk, legislationRisk];
  const hasDealKiller = risks.includes('Deal-killer');
  const hasHigh = risks.includes('High');

  let status: StrLegalityStatus;
  if (hasDealKiller) {
    status = 'PROHIBITED';
  } else if (hasHigh) {
    status = 'UNCERTAIN';
  } else if (risks.includes('Medium')) {
    status = 'RESTRICTED';
  } else {
    status = 'CLEAR';
  }

  const canProceedWithStrIncome = status === 'CLEAR' || status === 'RESTRICTED';

  return {
    status,
    permitRisk,
    minStayRisk,
    ownerOccupancyRisk,
    hoaRisk,
    enforcementRisk,
    legislationRisk,
    requiredActions,
    canProceedWithStrIncome,
  };
}

// ---------------------------------------------------------------------------
// STR THREE WORLDS INCOME CALCULATION — v7.0 Section 10
// ---------------------------------------------------------------------------

export interface StrIncomeInput {
  world: StrIncomeWorld;
  // World 1: LT market rent (Form 1007)
  ltMarketRentMonthly: number;
  // World 2: AirDNA projected annual income
  airdnaProjectedAnnual: number;
  airdnaMarketApproved: boolean; // is this market on the lender's approved list?
  // World 3: Historical 12-month gross payout
  historical12moGross: number;
  // Common
  pitia: number; // monthly PITIA for DSCR calculation
}

export interface StrIncomeResult {
  world: StrIncomeWorld;
  worldLabel: string;
  lenderAcceptancePct: number; // approximate % of lenders accepting this method
  grossIncomeMonthly: number;
  haircutPct: number;
  effectiveIncomeMonthly: number;
  dscr: number;
  rateOverlayBps: number; // typical rate add for this method
  reserveAddMonths: number;
  notes: string[];
  warnings: string[];
}

export function calculateStrIncome(input: StrIncomeInput): StrIncomeResult {
  switch (input.world) {
    case 'world1_lt_market': {
      // World 1: Long-term market rent — universal acceptance, no haircut
      const gross = input.ltMarketRentMonthly;
      const dscr = input.pitia > 0 ? gross / input.pitia : 0;
      return {
        world: 'world1_lt_market',
        worldLabel: 'World 1: LT Market Rent (Form 1007)',
        lenderAcceptancePct: 100,
        grossIncomeMonthly: gross,
        haircutPct: 0,
        effectiveIncomeMonthly: gross,
        dscr: Math.round(dscr * 1000) / 1000,
        rateOverlayBps: 0,
        reserveAddMonths: 0,
        notes: ['Universal lender acceptance', 'Uses appraiser market rent — no STR income assumed'],
        warnings: [],
      };
    }

    case 'world2_airdna': {
      // World 2: AirDNA projected — ~40% acceptance, 20% haircut, market-conditional
      const effectiveAnnual = input.airdnaProjectedAnnual * 0.80; // 20% vacancy/seasonal haircut
      const effectiveMonthly = effectiveAnnual / 12;
      const dscr = input.pitia > 0 ? effectiveMonthly / input.pitia : 0;
      const warnings: string[] = [];
      if (!input.airdnaMarketApproved) {
        warnings.push('CRITICAL: Market NOT on lender approved AirDNA list — this income method will be rejected by most lenders.');
      }
      warnings.push('AirDNA acceptance is market-conditional — confirm specific market eligibility before underwriting.');
      return {
        world: 'world2_airdna',
        worldLabel: 'World 2: AirDNA Projected STR Income',
        lenderAcceptancePct: 40,
        grossIncomeMonthly: input.airdnaProjectedAnnual / 12,
        haircutPct: 20,
        effectiveIncomeMonthly: effectiveMonthly,
        dscr: Math.round(dscr * 1000) / 1000,
        rateOverlayBps: 50, // +0.25% to +0.75%, midpoint 50bps
        reserveAddMonths: 3,
        notes: ['20% vacancy/seasonal haircut applied', 'Market-conditional — verify lender approved market list'],
        warnings,
      };
    }

    case 'world3_historical': {
      // World 3: Documented historical — ~70% acceptance, 20% haircut
      const effectiveMonthly = (input.historical12moGross / 12) * 0.80; // 20% haircut
      const dscr = input.pitia > 0 ? effectiveMonthly / input.pitia : 0;
      return {
        world: 'world3_historical',
        worldLabel: 'World 3: Documented Historical STR Income',
        lenderAcceptancePct: 70,
        grossIncomeMonthly: input.historical12moGross / 12,
        haircutPct: 20,
        effectiveIncomeMonthly: effectiveMonthly,
        dscr: Math.round(dscr * 1000) / 1000,
        rateOverlayBps: 37.5, // +0.25% to +0.50%, midpoint
        reserveAddMonths: 3,
        notes: ['Requires 12-month Airbnb/VRBO payout statements', '20% haircut applied', 'Refinance typically requires 12mo history'],
        warnings: [],
      };
    }
  }
}

// ---------------------------------------------------------------------------
// CONVENIENCE: Run all three worlds and return comparison
// ---------------------------------------------------------------------------

export interface StrThreeWorldsResult {
  legality: StrLegalityResult | null; // null if not STR
  world1: StrIncomeResult;
  world2: StrIncomeResult;
  world3: StrIncomeResult;
  bestWorld: StrIncomeWorld;
  bestDscr: number;
  recommendation: string;
}

export function runStrThreeWorlds(
  legalityInput: StrLegalityInput | null,
  incomeInput: StrIncomeInput
): StrThreeWorldsResult {
  const legality = legalityInput ? assessStrLegality(legalityInput) : null;

  const world1 = calculateStrIncome({ ...incomeInput, world: 'world1_lt_market' });
  const world2 = calculateStrIncome({ ...incomeInput, world: 'world2_airdna' });
  const world3 = calculateStrIncome({ ...incomeInput, world: 'world3_historical' });

  // Best world = highest DSCR among worlds with no deal-killer warnings
  const candidates = [world1, world2, world3].filter((w) => w.warnings.filter((x) => x.includes('CRITICAL')).length === 0);
  const best = candidates.length > 0
    ? candidates.reduce((a, b) => (a.dscr > b.dscr ? a : b))
    : world1; // fallback to World 1 if all have critical warnings

  let recommendation: string;
  if (legality && !legality.canProceedWithStrIncome) {
    recommendation = `STR income NOT viable — legality status: ${legality.status}. Resolve: ${legality.requiredActions.slice(0, 2).join('; ')}`;
  } else if (best.world === 'world2_airdna' && !incomeInput.airdnaMarketApproved) {
    recommendation = 'AirDNA income rejected — market not on lender approved list. Use World 1 (LT market rent) or World 3 (historical) instead.';
  } else {
    recommendation = `Best STR income method: ${best.worldLabel} → DSCR ${best.dscr.toFixed(2)}x. ${best.warnings.length > 0 ? 'Warnings: ' + best.warnings[0] : 'No warnings.'}`;
  }

  return {
    legality,
    world1,
    world2,
    world3,
    bestWorld: best.world,
    bestDscr: best.dscr,
    recommendation,
  };
}
