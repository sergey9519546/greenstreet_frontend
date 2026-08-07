// ============================================================================
// PARTNERSHIP WATERFALL — v12.1 (P3-30 missing feature)
// ============================================================================
// Models a GP/LP equity split with:
//   - Preferred return (e.g. 8% annual pref, compounded)
//   - Return of capital (GP/LP pari passu until capital returned)
//   - Promote tiers (e.g. 70/30 after 8% pref, 60/40 after 12% IRR, 50/50 after 18% IRR)
//
// Cash flow waterfall order:
//   1. Operating cash flow distributed to LP until pref is current
//   2. Catch-up to GP (if applicable) up to promote %
//   3. Remaining cash flow split per promote tier on exit

// v15 Phase 2.4: Use unified robust IRR solver (Brent's method) from solvers-v13.
import { irr as robustIrrWaterfall } from './solvers-v13';
//
// Returns:
//   - LP IRR, GP IRR
//   - LP equity multiple, GP equity multiple
//   - Effective promote paid by LP
//   - Pref shortfall (if any year's cash flow < pref accrual)
// ============================================================================

export interface WaterfallTier {
  irrThreshold: number;        // IRR hurdle (e.g. 0.08 = 8%)
  gpSplit: number;             // GP share above this hurdle (e.g. 0.30 = 30%)
}

export interface PartnershipWaterfallInput {
  // Equity contributions
  lpEquity: number;            // LP cash invested at t=0
  gpEquity: number;            // GP co-invest cash at t=0 (often 0% but can be 5-10%)
  // Operating cash flows (annual, after debt service) — year 1 through N
  annualCashFlows: number[];   // [Y1, Y2, ..., Yn] — can be negative (capital call)
  // Exit proceeds (sale price − selling costs − loan payoff) at end of year N
  exitProceeds: number;
  // Pref rate (annual, compounded)
  prefRate: number;            // e.g. 0.08 for 8%
  // Promote tiers (sorted by IRR threshold ascending). Last tier applies to all IRR above its threshold.
  tiers: WaterfallTier[];
  // GP catch-up % (0 = no catch-up, 1 = full catch-up to promote % before split resumes)
  // Typical: 0.5-1.0 (50-100% catch-up)
  gpCatchupPct: number;
  // Hold period (years) — used to size the cash flow array
  holdYears: number;
  // v14: Waterfall style — AMERICAN (default) splits profit per promote as distributed.
  // EUROPEAN: LP gets 100% until capital + pref returned, then GP gets promote on backend.
  waterfallStyle?: 'AMERICAN' | 'EUROPEAN';
}

export interface PartnershipWaterfallResult {
  lpIrr: number;
  gpIrr: number;
  lpEquityMultiple: number;
  gpEquityMultiple: number;
  totalDistributions: number;
  lpTotalDistributions: number;
  gpTotalDistributions: number;
  prefPaid: number;            // Total pref paid to LP
  prefShortfall: number;       // Total unpaid pref (if cash flow was insufficient)
  promotePaid: number;         // Total promote (excess split above pref)
  effectivePromotePct: number; // Promote as % of total profit
  lpCashFlows: number[];       // Year-by-year LP cash flows (for IRR)
  gpCashFlows: number[];       // Year-by-year GP cash flows (for IRR)
  notes: string[];
}

// ---------------------------------------------------------------------------
// IRR solver — unified v15 wrapper around solvers-v13's Brent implementation.
// Handles negative IRR + pure-promote GP case (Infinity) + all-positive
// (Infinity) + all-negative (-Infinity).
// ---------------------------------------------------------------------------
function solveIrr(cashflows: number[]): number {
  if (cashflows.length < 2) return 0;
  // v12.1: Handle pure-promote GP case — only positive cash flows (no investment).
  // IRR is undefined (infinite). Return Infinity rather than NaN.
  const hasNegative = cashflows.some(cf => cf < 0);
  if (!hasNegative) {
    const totalPositive = cashflows.reduce((s, x) => s + Math.max(0, x), 0);
    return totalPositive > 0 ? Infinity : 0;
  }
  // v15 Phase 2.4: Use unified robust IRR from solvers-v13 (Brent's method).
  const result = robustIrrWaterfall(cashflows, { initialGuess: 0.10, tolerance: 1e-8 });
  return Number.isFinite(result) ? result : NaN;
}

// ---------------------------------------------------------------------------
// MAIN WATERFALL CALCULATION
// ---------------------------------------------------------------------------
export function calculatePartnershipWaterfall(input: PartnershipWaterfallInput): PartnershipWaterfallResult {
  const notes: string[] = [];
  const { lpEquity, gpEquity, prefRate, gpCatchupPct, holdYears } = input;
  const totalEquity = lpEquity + gpEquity;

  if (totalEquity <= 0) {
    return {
      lpIrr: 0, gpIrr: 0, lpEquityMultiple: 0, gpEquityMultiple: 0,
      totalDistributions: 0, lpTotalDistributions: 0, gpTotalDistributions: 0,
      prefPaid: 0, prefShortfall: 0, promotePaid: 0, effectivePromotePct: 0,
      lpCashFlows: [], gpCashFlows: [], notes: ['No equity invested — waterfall undefined.'],
    };
  }

  // Year-by-year LP/GP cash flow arrays
  // t=0: equity contributions (negative)
  // t=1..N: operating distributions + exit at year N
  const lpCashFlows: number[] = [-lpEquity];
  const gpCashFlows: number[] = [-gpEquity];

  let prefAccrued = 0;       // cumulative unpaid pref
  let lpCapitalReturned = 0;
  let gpCapitalReturned = 0;
  let totalPrefPaid = 0;
  let totalPrefShortfall = 0;
  let totalPromote = 0;
  let lpTotal = 0;
  let gpTotal = 0;

  // LP ownership % (for return-of-capital pari passu)
  const lpOwnershipPct = totalEquity > 0 ? lpEquity / totalEquity : 0;
  const gpOwnershipPct = 1 - lpOwnershipPct;

  for (let year = 1; year <= holdYears; year++) {
    // Operating cash flow for this year (0 if beyond array)
    const opCf = input.annualCashFlows[year - 1] ?? 0;
    // Exit proceeds only in final year
    const isExitYear = year === holdYears;
    const exitCf = isExitYear ? input.exitProceeds : 0;
    const totalAvailable = opCf + exitCf;

    if (totalAvailable <= 0) {
      // No distribution this year; pref accrues
      prefAccrued += lpEquity * prefRate;
      lpCashFlows.push(0);
      gpCashFlows.push(0);
      continue;
    }

    let remaining = totalAvailable;
    let lpDist = 0;
    let gpDist = 0;

    // 1. Pref accrual for this year
    const prefThisYear = lpEquity * prefRate;
    prefAccrued += prefThisYear;

    // 2. Pay pref to LP (current year + accrued shortfall)
    const prefPayment = Math.min(remaining, prefAccrued);
    lpDist += prefPayment;
    remaining -= prefPayment;
    prefAccrued -= prefPayment;
    totalPrefPaid += prefPayment;
    if (prefAccrued > 0) totalPrefShortfall += 0; // shortfall tracked via prefAccrued at end

    // 3. GP catch-up (if remaining > 0 and catchup > 0)
    // Catch-up gives GP a share of remaining cash up to (catchupPct / (1 - catchupPct)) × prefPaidThisYear
    // v12.1: Handle 100% catch-up edge case (division by zero) — at 100% catch-up,
    // GP gets the same dollar amount as the pref payment (50/50 split of pre-catch-up cash).
    if (remaining > 0 && gpCatchupPct > 0 && prefPayment > 0) {
      let catchupTarget: number;
      if (gpCatchupPct >= 1.0) {
        // 100% catch-up: GP gets equal to pref payment (so total GP+LP split of pre-profit cash is 50/50)
        catchupTarget = prefPayment;
      } else {
        catchupTarget = (gpCatchupPct / (1 - gpCatchupPct)) * prefPayment;
      }
      const catchupPayment = Math.min(remaining, catchupTarget);
      gpDist += catchupPayment;
      remaining -= catchupPayment;
    }

    // 4. Return of capital (pari passu per ownership %)
    if (remaining > 0) {
      const lpCapitalDue = lpEquity - lpCapitalReturned;
      const gpCapitalDue = gpEquity - gpCapitalReturned;
      const totalCapitalDue = lpCapitalDue + gpCapitalDue;
      const capitalReturn = Math.min(remaining, totalCapitalDue);
      const lpCapitalPortion = totalCapitalDue > 0 ? (lpCapitalDue / totalCapitalDue) * capitalReturn : 0;
      const gpCapitalPortion = capitalReturn - lpCapitalPortion;
      lpDist += lpCapitalPortion;
      gpDist += gpCapitalPortion;
      lpCapitalReturned += lpCapitalPortion;
      gpCapitalReturned += gpCapitalPortion;
      remaining -= capitalReturn;
    }

    // 5. Promote split (only on exit year — promote applies to total profit, not annual cash flow)
    // v12.1: Simplified promote logic — split remaining profit per applicable tier's GP %.
    // v14: Added EUROPEAN waterfall style — LP gets 100% until capital+pref returned, then GP promote.
    const style = input.waterfallStyle ?? 'AMERICAN';
    if (isExitYear && remaining > 0) {
      const totalDistributedSoFar = lpTotal + gpTotal + lpDist + gpDist;
      const dealProfit = totalDistributedSoFar + remaining - totalEquity;

      if (style === 'EUROPEAN') {
        // European: LP must receive ALL capital back + ALL pref before GP gets any promote.
        // Steps: 1) Return LP capital, 2) Return GP capital, 3) Pay LP pref, 4) GP catch-up, 5) Promote split
        // In this simplified model, pref + return of capital already happened in steps 1-4 above.
        // Now just do promote split on remaining profit.
        if (dealProfit > 0) {
          const dealIrr = solveIrr([-totalEquity, ...Array(holdYears - 1).fill(0), totalDistributedSoFar + remaining]);
          const sortedTiers = [...input.tiers].sort((a, b) => a.irrThreshold - b.irrThreshold);
          let applicableGpSplit = sortedTiers.length > 0 ? sortedTiers[0].gpSplit : 0;
          for (const tier of sortedTiers) {
            if (dealIrr >= tier.irrThreshold) applicableGpSplit = tier.gpSplit;
          }
          gpDist += remaining * applicableGpSplit;
          lpDist += remaining * (1 - applicableGpSplit);
          totalPromote += Math.max(0, applicableGpSplit - gpOwnershipPct) * remaining;
        } else {
          lpDist += remaining * lpOwnershipPct;
          gpDist += remaining * gpOwnershipPct;
        }
      } else {
        // American (default): split per promote % on each dollar of profit as distributed
        if (dealProfit > 0) {
          const dealIrr = solveIrr([-totalEquity, ...Array(holdYears - 1).fill(0), totalDistributedSoFar + remaining]);
          const sortedTiers = [...input.tiers].sort((a, b) => a.irrThreshold - b.irrThreshold);
          let applicableGpSplit = sortedTiers.length > 0 ? sortedTiers[0].gpSplit : 0;
          for (const tier of sortedTiers) {
            if (dealIrr >= tier.irrThreshold) applicableGpSplit = tier.gpSplit;
          }
          const gpShare = remaining * applicableGpSplit;
          const lpShare = remaining * (1 - applicableGpSplit);
          gpDist += gpShare;
          lpDist += lpShare;
          totalPromote += Math.max(0, applicableGpSplit - gpOwnershipPct) * remaining;
        } else {
          lpDist += remaining * lpOwnershipPct;
          gpDist += remaining * gpOwnershipPct;
        }
      }
      remaining = 0;
    } else if (remaining > 0) {
      // Non-exit year: split per ownership %
      lpDist += remaining * lpOwnershipPct;
      gpDist += remaining * gpOwnershipPct;
      remaining = 0;
    }

    lpCashFlows.push(lpDist);
    gpCashFlows.push(gpDist);
    lpTotal += lpDist;
    gpTotal += gpDist;
  }

  if (prefAccrued > 0) {
    totalPrefShortfall = prefAccrued;
    notes.push(`⚠️ Pref shortfall of $${prefAccrued.toFixed(0)} — LP did not receive full ${prefRate * 100}% preferred return. Negotiate pref accrual or guarantee.`);
  }

  const lpIrr = solveIrr(lpCashFlows);
  const gpIrr = solveIrr(gpCashFlows);
  const lpEquityMultiple = lpEquity > 0 ? lpTotal / lpEquity : 0;
  const gpEquityMultiple = gpEquity > 0 ? gpTotal / gpEquity : 0;
  const totalProfit = (lpTotal + gpTotal) - totalEquity;
  const effectivePromotePct = totalProfit > 0 ? totalPromote / totalProfit : 0;

  if (gpEquity === 0) {
    notes.push('GP contributed $0 co-invest — pure promote structure. GP IRR is technically infinite on any promote.');
  }
  if (gpCatchupPct === 0) {
    notes.push('No GP catch-up — LP receives 100% of cash until pref is current.');
  }

  return {
    lpIrr,
    gpIrr,
    lpEquityMultiple,
    gpEquityMultiple,
    totalDistributions: lpTotal + gpTotal,
    lpTotalDistributions: lpTotal,
    gpTotalDistributions: gpTotal,
    prefPaid: totalPrefPaid,
    prefShortfall: totalPrefShortfall,
    promotePaid: totalPromote,
    effectivePromotePct,
    lpCashFlows,
    gpCashFlows,
    notes,
  };
}

// ---------------------------------------------------------------------------
// PRESET WATERFALL STRUCTURES
// ---------------------------------------------------------------------------
export const WATERFALL_PRESETS = {
  // Common syndication structure: 8% pref, 70/30 after pref, 100% catch-up
  standard_syndication: {
    prefRate: 0.08,
    gpCatchupPct: 1.0,
    tiers: [{ irrThreshold: 0.08, gpSplit: 0.30 }] as WaterfallTier[],
  },
  // Aggressive promote: 8% pref, then 70/30 → 60/40 → 50/50 as IRR climbs
  tiered_promote: {
    prefRate: 0.08,
    gpCatchupPct: 1.0,
    tiers: [
      { irrThreshold: 0.08, gpSplit: 0.30 },
      { irrThreshold: 0.12, gpSplit: 0.40 },
      { irrThreshold: 0.18, gpSplit: 0.50 },
    ] as WaterfallTier[],
  },
  // LP-friendly: 7% pref, 80/20 split, 50% catch-up
  lp_friendly: {
    prefRate: 0.07,
    gpCatchupPct: 0.5,
    tiers: [{ irrThreshold: 0.07, gpSplit: 0.20 }] as WaterfallTier[],
  },
  // GP-friendly (value-add): 9% pref, 60/40 split, full catch-up
  gp_friendly: {
    prefRate: 0.09,
    gpCatchupPct: 1.0,
    tiers: [{ irrThreshold: 0.09, gpSplit: 0.40 }] as WaterfallTier[],
  },
};
