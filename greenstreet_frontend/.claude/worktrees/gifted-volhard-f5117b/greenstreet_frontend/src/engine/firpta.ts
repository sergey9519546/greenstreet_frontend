// ============================================================
// FIRPTA — Foreign Investment in Real Property Tax Act
// ============================================================
// Adapted from IMPROVE_FOREIGN_NATIONAL_ITIN_DSCR.md §6, §10.6. Estimates the
// withholding a foreign seller faces at disposition (15% of GROSS sale price +
// state) and whether a withholding certificate (Form 8288-B) is worth pursuing.
// Educational estimate — not tax advice. Refinances (R&T or cash-out) are NOT
// dispositions → no FIRPTA.

export interface FirptaInput {
  salePrice: number;
  adjustedBasis: number;     // purchase price + improvements − depreciation taken
  state: string;
  isUsResident: boolean;     // green card / substantial-presence ⇒ exempt
}

export interface FirptaResult {
  gain: number;
  federalWithholdingRate: number;   // 0.15 (gross) for foreign persons
  stateWithholdingRate: number;
  federalWithholdingAmount: number; // 15% of GROSS sale price
  stateWithholdingAmount: number;
  totalWithholding: number;
  estimatedTaxOnGain: number;
  /** Cash potentially tied up at closing above the actual tax owed. */
  potentialRefund: number;
  withholdingCertificateRecommended: boolean;
  note: string;
}

// State non-resident withholding on the GAIN (most states 0).
const STATE_GAIN_WITHHOLDING: Record<string, number> = {
  NY: 0.109, CA: 0.033, HI: 0.05, OR: 0.10, NJ: 0.02, MD: 0.08,
};

export function calculateFIRPTAImpact(input: FirptaInput): FirptaResult {
  const { salePrice, adjustedBasis, state, isUsResident } = input;
  const gain = Math.max(0, salePrice - adjustedBasis);

  if (isUsResident) {
    return {
      gain,
      federalWithholdingRate: 0, stateWithholdingRate: 0,
      federalWithholdingAmount: 0, stateWithholdingAmount: 0,
      totalWithholding: 0, estimatedTaxOnGain: 0, potentialRefund: 0,
      withholdingCertificateRecommended: false,
      note: 'U.S. resident (green card / substantial presence) — FIRPTA does not apply. Provide a Non-Foreign Status Affidavit.',
    };
  }

  const federalWithholding = salePrice * 0.15; // 15% of GROSS, not gain
  const stateRate = STATE_GAIN_WITHHOLDING[(state || '').toUpperCase()] ?? 0;
  const stateWithholding = gain * stateRate;
  // ~20% LTCG + 3.8% NIIT, simplified.
  const estimatedTax = gain * 0.20;
  const total = federalWithholding + stateWithholding;
  const certRecommended = federalWithholding > estimatedTax * 1.5;

  return {
    gain: Math.round(gain),
    federalWithholdingRate: 0.15,
    stateWithholdingRate: stateRate,
    federalWithholdingAmount: Math.round(federalWithholding),
    stateWithholdingAmount: Math.round(stateWithholding),
    totalWithholding: Math.round(total),
    estimatedTaxOnGain: Math.round(estimatedTax),
    potentialRefund: Math.round(Math.max(0, total - estimatedTax)),
    withholdingCertificateRecommended: certRecommended,
    note: certRecommended
      ? `15% of gross ($${Math.round(federalWithholding).toLocaleString()}) far exceeds the ~$${Math.round(estimatedTax).toLocaleString()} tax on the gain — apply for a withholding certificate (Form 8288-B) early to free up the difference.`
      : 'Withholding is close to the estimated tax — a certificate may not be worth the delay.',
  };
}

/**
 * Non-resident-alien estate-tax exposure note (§4.6, §6.8): only a $60,000
 * exemption (vs $13.99M for citizens); 40% above that on U.S.-situs assets.
 */
export function nraEstateTaxNote(propertyValue: number): { exposedValue: number; estTaxAt40: number; note: string } {
  const exposed = Math.max(0, propertyValue - 60_000);
  return {
    exposedValue: Math.round(exposed),
    estTaxAt40: Math.round(exposed * 0.40),
    note: 'Non-resident aliens get only a $60,000 U.S. estate-tax exemption; U.S.-situs value above that is taxed up to 40%. Holding through a properly structured entity can change the situs analysis — consult a cross-border tax advisor.',
  };
}
