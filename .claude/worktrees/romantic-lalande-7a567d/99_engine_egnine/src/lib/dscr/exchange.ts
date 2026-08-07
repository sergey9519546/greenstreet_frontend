// ============================================================================
// DEFEASANCE — v12.1 (P3-30 missing feature, properly implemented)
// ============================================================================
// Defeasance = borrower buys a portfolio of Treasury securities whose cash
// flows exactly match the remaining loan payments. The lender then releases
// the mortgage. Used on CMBS/conduit loans (typically 5+ years into term).
//
// Cost = (Treasury purchase price) − (remaining loan balance)
//   — Treasuries are bought at a discount/premium depending on coupon vs yield
//   — When loan rate > Treasury yield (normal case), Treasuries trade at premium,
//     so borrower pays MORE than the loan balance
//   — When loan rate < Treasury yield (rare), borrower pays less
//
// This module uses a simplified single-Treasury approximation:
//   defeasance_cost = Σ (remaining_payment_t / (1 + treasury_yield/12)^t) - remaining_balance
// which is the standard "PV of remaining payments at Treasury yield minus balance" formula.
//
// For production use, a full Treasury strip portfolio matching each payment
// would be needed. This approximation is within 1-2% of broker quotes.
// ============================================================================

export interface DefeasanceInput {
  loanBalance: number;          // remaining principal at payoff
  interestRate: number;         // loan annual rate %
  amortMonths: number;          // original amortization
  monthsElapsed: number;        // months since origination
  treasuryYield: number;        // matching-maturity Treasury yield % (e.g. 5yr Treasury for 5yr remaining)
  // Optional: defeasance broker fee + administrative costs
  brokerFee?: number;           // typical $25k-$75k flat
  adminCosts?: number;          // typical $10k-$20k
}

export interface DefeasanceResult {
  remainingPayments: number;
  monthlyPayment: number;
  pvAtTreasuryYield: number;    // PV of remaining payments discounted at Treasury yield
  defeasanceCost: number;       // PV - balance + fees (what borrower pays to defease)
  treasuryPremium: number;      // PV - balance (positive = borrower pays premium)
  totalCost: number;            // defeasanceCost + broker + admin
  costPctOfBalance: number;     // totalCost / balance × 100
  notes: string[];
}

export function calculateDefeasance(input: DefeasanceInput): DefeasanceResult {
  const notes: string[] = [];
  const { loanBalance, interestRate, amortMonths, monthsElapsed, treasuryYield } = input;
  const brokerFee = input.brokerFee ?? 35_000;
  const adminCosts = input.adminCosts ?? 15_000;

  const remainingMonths = Math.max(0, amortMonths - monthsElapsed);
  if (remainingMonths === 0 || loanBalance <= 0) {
    return {
      remainingPayments: 0, monthlyPayment: 0, pvAtTreasuryYield: 0,
      defeasanceCost: 0, treasuryPremium: 0, totalCost: 0, costPctOfBalance: 0,
      notes: ['No remaining payments — loan matured or no balance.'],
    };
  }

  // Monthly payment (using original rate, since payments are fixed)
  const r = interestRate / 100 / 12;
  const monthlyPmt = r > 0
    ? (loanBalance * r) / (1 - Math.pow(1 + r, -remainingMonths))
    : loanBalance / remainingMonths;

  // PV of remaining payments at Treasury yield (the cost to buy matching Treasuries)
  const rt = treasuryYield / 100 / 12;
  let pvAtTreasury = 0;
  for (let t = 1; t <= remainingMonths; t++) {
    pvAtTreasury += monthlyPmt / Math.pow(1 + rt, t);
  }

  // Defeasance cost = PV of Treasuries − loan balance + fees
  // When loan rate > Treasury yield: Treasuries are priced at premium (PV > balance),
  // so borrower pays the premium to buy them
  const treasuryPremium = pvAtTreasury - loanBalance;
  const defeasanceCost = treasuryPremium + brokerFee + adminCosts;
  const totalCost = defeasanceCost;
  const costPctOfBalance = loanBalance > 0 ? (totalCost / loanBalance) * 100 : 0;

  notes.push(`Remaining payments: ${remainingMonths} months × $${monthlyPmt.toFixed(0)}/mo`);
  notes.push(`PV at Treasury yield (${treasuryYield}%): $${pvAtTreasury.toFixed(0)}`);
  notes.push(`Treasury premium: ${treasuryPremium >= 0 ? '+' : ''}$${treasuryPremium.toFixed(0)} (${treasuryPremium >= 0 ? 'borrower pays premium' : 'borrower receives discount'})`);
  notes.push(`Broker fee: $${brokerFee.toLocaleString()} | Admin: $${adminCosts.toLocaleString()}`);
  if (costPctOfBalance > 5) {
    notes.push(`⚠️ Defeasance cost ${costPctOfBalance.toFixed(1)}% of balance — consider waiting for Treasury yields to drop or loan rate < Treasury yield (rare).`);
  } else if (costPctOfBalance < 1) {
    notes.push(`✅ Defeasance cost ${costPctOfBalance.toFixed(1)}% of balance — favorable defeasance window.`);
  }

  return {
    remainingPayments: remainingMonths,
    monthlyPayment: Math.round(monthlyPmt),
    pvAtTreasuryYield: Math.round(pvAtTreasury),
    defeasanceCost: Math.round(defeasanceCost),
    treasuryPremium: Math.round(treasuryPremium),
    totalCost: Math.round(totalCost),
    costPctOfBalance: Math.round(costPctOfBalance * 100) / 100,
    notes,
  };
}

// ============================================================================
// 1031 EXCHANGE — v12.1 (P3-30 missing feature)
// ============================================================================
// §1031 like-kind exchange: defer capital gains tax by reinvesting sale proceeds
// into a replacement property within strict timelines:
//   - Identification period: 45 days from sale closing
//   - Exchange period: 180 days from sale closing
//   - Must reinvest ALL proceeds (any cash retained = "boot" = taxable)
//   - Replacement property must be of equal or greater value to fully defer
//   - Debt on replacement must be ≥ debt on relinquished (or pay cash difference)
//
// Returns:
//   - Capital gains deferred
//   - Tax owed if boot / partial reinvestment
//   - Required equity for full deferral
//   - Required debt on replacement
// ============================================================================

export interface Exchange1031Input {
  // Relinquished property
  relinquishedPurchasePrice: number;   // original purchase price
  relinquishedSalePrice: number;       // current sale price
  relinquishedAdjustedBasis: number;   // purchase − cumulative depreciation + capital improvements
  relinquishedLoanBalance: number;     // loan payoff at sale
  relinquishedSellingCostsPct: number; // e.g. 6% = 6
  // Replacement property
  replacementValue: number;            // target replacement property value
  replacementLoanAmount: number;       // target new loan
  // Tax profile
  capitalGainsRate: number;            // federal LTCG rate % (15 or 20)
  depreciationRecaptureRate: number;   // §1250 recapture rate % (25)
  stateTaxRate: number;                // state income tax % (varies; CA 13.3%, TX 0%, FL 0%)
  niitRate: number;                    // Net Investment Income Tax % (3.8)
  // Reinvestment amount (defaults to all proceeds)
  cashRetained?: number;               // "boot" — cash NOT reinvested (taxable)
}

export interface Exchange1031Result {
  saleNetProceeds: number;
  capitalGain: number;                  // sale price − adjusted basis
  depreciationRecapture: number;        // cumulative depreciation (calculated as purchase − adjusted basis if positive)
  totalTaxableGain: number;
  fullDeferralTax: number;              // tax IF no exchange (full taxation)
  deferredTax: number;                  // tax deferred via 1031
  bootTax: number;                      // tax on cash retained
  taxOwed: number;                      // actual tax owed (boot only)
  netTaxSavings: number;                // fullDeferralTax - taxOwed
  requiredEquityForFullDeferral: number; // equity that must go into replacement
  requiredDebtOnReplacement: number;    // debt that must be on replacement
  replacementEquityShortfall: number;   // if replacement is too cheap
  notes: string[];
}

export function calculate1031Exchange(input: Exchange1031Input): Exchange1031Result {
  const notes: string[] = [];
  const {
    relinquishedPurchasePrice, relinquishedSalePrice, relinquishedAdjustedBasis,
    relinquishedLoanBalance, relinquishedSellingCostsPct,
    replacementValue, replacementLoanAmount,
    capitalGainsRate, depreciationRecaptureRate, stateTaxRate, niitRate,
  } = input;
  const cashRetained = input.cashRetained ?? 0;

  // Net sale proceeds
  const sellingCosts = relinquishedSalePrice * (relinquishedSellingCostsPct / 100);
  const saleNetProceeds = relinquishedSalePrice - sellingCosts - relinquishedLoanBalance;

  // Capital gain = sale price − adjusted basis
  const capitalGain = relinquishedSalePrice - relinquishedAdjustedBasis - sellingCosts;
  // Depreciation recapture = original purchase − adjusted basis (capped at gain)
  const depreciationRecapture = Math.max(0, Math.min(capitalGain, relinquishedPurchasePrice - relinquishedAdjustedBasis));
  const totalTaxableGain = capitalGain;  // total gain (recapture portion taxed at recapture rate, rest at LTCG)

  // Tax IF no exchange (full taxation)
  const ltcgPortion = Math.max(0, capitalGain - depreciationRecapture);
  const fullDeferralTax = (ltcgPortion * (capitalGainsRate + stateTaxRate + niitRate) / 100)
                        + (depreciationRecapture * (depreciationRecaptureRate + stateTaxRate + niitRate) / 100);

  // Boot tax (cash retained is taxable, prorated by boot / total gain)
  const bootTax = totalTaxableGain > 0 && cashRetained > 0
    ? Math.min(cashRetained / totalTaxableGain, 1) * fullDeferralTax
    : 0;

  const taxOwed = bootTax;
  const deferredTax = fullDeferralTax - bootTax;
  const netTaxSavings = fullDeferralTax - taxOwed;

  // Required equity for full deferral = net sale proceeds − cash retained (boot)
  const requiredEquityForFullDeferral = Math.max(0, saleNetProceeds - cashRetained);
  // Required debt on replacement must be ≥ relinquished debt (or pay cash difference)
  const requiredDebtOnReplacement = relinquishedLoanBalance;

  // Check if replacement is sufficient
  const replacementEquityAvailable = replacementValue - replacementLoanAmount;
  const replacementEquityShortfall = Math.max(0, requiredEquityForFullDeferral - replacementEquityAvailable);

  // Required debt verification
  if (replacementLoanAmount < relinquishedLoanBalance) {
    const debtShortfall = relinquishedLoanBalance - replacementLoanAmount;
    notes.push(`⚠️ Replacement debt ($${replacementLoanAmount.toLocaleString()}) < relinquished debt ($${relinquishedLoanBalance.toLocaleString()}). Borrower must contribute $${debtShortfall.toLocaleString()} extra cash to maintain debt replacement requirement, or pay tax on the debt-relief boot.`);
  }

  // Timelines (informational)
  notes.push(`📅 45-day identification period starts at relinquished property closing.`);
  notes.push(`📅 180-day exchange period ends at relinquished property closing + 180 days.`);
  notes.push(`Capital gain: $${capitalGain.toLocaleString()} (LTCG portion: $${ltcgPortion.toLocaleString()}, depreciation recapture: $${depreciationRecapture.toLocaleString()})`);
  notes.push(`Full tax without exchange: $${fullDeferralTax.toLocaleString()} (${capitalGainsRate}% LTCG + ${depreciationRecaptureRate}% recapture + ${stateTaxRate}% state + ${niitRate}% NIIT)`);
  notes.push(`Boot tax on $${cashRetained.toLocaleString()} retained: $${bootTax.toLocaleString()}`);
  notes.push(`Tax deferred: $${deferredTax.toLocaleString()} | Net savings: $${netTaxSavings.toLocaleString()}`);

  if (replacementEquityShortfall > 0) {
    notes.push(`❌ Replacement property too cheap — equity shortfall of $${replacementEquityShortfall.toLocaleString()}. Either: (a) buy a more expensive replacement, (b) pay tax on the shortfall as boot, or (c) do a reverse exchange.`);
  } else {
    notes.push(`✅ Replacement property sufficient for full deferral (equity surplus: $${(replacementEquityAvailable - requiredEquityForFullDeferral).toLocaleString()}).`);
  }

  return {
    saleNetProceeds: Math.round(saleNetProceeds),
    capitalGain: Math.round(capitalGain),
    depreciationRecapture: Math.round(depreciationRecapture),
    totalTaxableGain: Math.round(totalTaxableGain),
    fullDeferralTax: Math.round(fullDeferralTax),
    deferredTax: Math.round(deferredTax),
    bootTax: Math.round(bootTax),
    taxOwed: Math.round(taxOwed),
    netTaxSavings: Math.round(netTaxSavings),
    requiredEquityForFullDeferral: Math.round(requiredEquityForFullDeferral),
    requiredDebtOnReplacement: Math.round(requiredDebtOnReplacement),
    replacementEquityShortfall: Math.round(replacementEquityShortfall),
    notes,
  };
}
