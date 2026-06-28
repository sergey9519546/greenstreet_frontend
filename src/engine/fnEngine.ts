// ============================================================
// FOREIGN-NATIONAL / ITIN DSCR ENGINE
// ============================================================
// Adapted from IMPROVE_FOREIGN_NATIONAL_ITIN_DSCR.md §10. Rate adjusters, LTV
// caps, OFAC/country-risk tiers, and a document checklist for non-US borrowers.
// Pure math + lookups — screening guidance, NOT legal advice. The actual DSCR
// still flows through the standard engine; this layers the FN-specific overlays.

export type FnIdType = 'SSN' | 'ITIN' | 'PASSPORT_ONLY';
export type CountryRiskTier = 'PREFERRED' | 'STANDARD' | 'ELEVATED' | 'RESTRICTED' | 'PROHIBITED';

export interface ForeignNationalProfile {
  idType: FnIdType;
  countryCode: string;        // ISO-2 (e.g. 'MX', 'BR', 'GB')
  hasUsFico: boolean;
  visaType?: string;          // B1, E2, H1B, L1, O1, TN, … (undefined = no visa)
  hasUsResidency: boolean;
  entityType: 'US_LLC' | 'US_CORP' | 'FOREIGN_ENTITY';
  entityState?: string;       // formation state (DE/WY/NV/…)
  propertyState?: string;     // for foreign-entity-registration check
  entityFormedOver1YrAgo?: boolean;
}

export interface RateAdjuster {
  name: string;
  basisPoints: number;        // Infinity ⇒ cannot lend
  reason: string;
}

// OFAC / country-risk tiers (§10.5). Unlisted countries default to STANDARD.
export const COUNTRY_RISK_TIERS: Record<string, CountryRiskTier> = {
  // Prohibited (comprehensive sanctions)
  KP: 'PROHIBITED', IR: 'PROHIBITED', SY: 'PROHIBITED', CU: 'PROHIBITED',
  // Restricted (active sanctions / high AML)
  RU: 'RESTRICTED', VE: 'RESTRICTED', MM: 'RESTRICTED',
  // Elevated (enhanced due diligence)
  CN: 'ELEVATED', PK: 'ELEVATED', NG: 'ELEVATED', UA: 'ELEVATED',
  // Preferred (common, low-risk investor origins)
  CA: 'PREFERRED', GB: 'PREFERRED', DE: 'PREFERRED', AU: 'PREFERRED', JP: 'PREFERRED',
  KR: 'PREFERRED', AE: 'PREFERRED', BR: 'PREFERRED', MX: 'PREFERRED', CO: 'PREFERRED',
  IL: 'PREFERRED', SG: 'PREFERRED',
};

export function getCountryRiskTier(countryCode: string): CountryRiskTier {
  return COUNTRY_RISK_TIERS[(countryCode || '').toUpperCase()] ?? 'STANDARD';
}

const COUNTRY_RISK_BPS: Record<CountryRiskTier, number> = {
  PREFERRED: 0, STANDARD: 25, ELEVATED: 75, RESTRICTED: 200, PROHIBITED: Infinity,
};

/** Rate adjusters (bps) for a foreign-national profile (§10.2). */
export function calculateForeignNationalRateAdjusters(p: ForeignNationalProfile): RateAdjuster[] {
  const adj: RateAdjuster[] = [];

  if (p.idType !== 'SSN') {
    adj.push({
      name: 'FOREIGN_NATIONAL_PREMIUM',
      basisPoints: p.idType === 'ITIN' ? 75 : 125,
      reason: p.idType === 'ITIN' ? 'ITIN borrower risk premium' : 'Passport-only (no SSN) risk premium',
    });
  }
  if (!p.hasUsFico) {
    adj.push({ name: 'NO_US_CREDIT', basisPoints: 50, reason: 'No U.S. FICO score available' });
  }
  if (!p.visaType && !p.hasUsResidency) {
    adj.push({ name: 'NO_VISA', basisPoints: 50, reason: 'No U.S. visa — investor-only program' });
  }
  const tier = getCountryRiskTier(p.countryCode);
  adj.push({ name: 'COUNTRY_RISK', basisPoints: COUNTRY_RISK_BPS[tier], reason: `Country risk tier: ${tier}` });

  if (p.entityType === 'FOREIGN_ENTITY') {
    adj.push({ name: 'FOREIGN_ENTITY_PREMIUM', basisPoints: 100, reason: 'Non-U.S. entity borrower' });
  }
  return adj;
}

/** Total rate add-on in basis points (Infinity ⇒ cannot lend). */
export function totalRateAdjustmentBps(p: ForeignNationalProfile): number {
  return calculateForeignNationalRateAdjusters(p).reduce((s, a) => s + a.basisPoints, 0);
}

export interface FnMaxLTV { purchase: number; rateAndTerm: number; cashOut: number; }

/** Max LTV caps by FN profile (§10.3). */
export function calculateForeignNationalMaxLTV(p: ForeignNationalProfile): FnMaxLTV {
  let ltv: FnMaxLTV = { purchase: 80, rateAndTerm: 80, cashOut: 75 }; // domestic baseline

  if (p.idType === 'ITIN') {
    ltv = { purchase: 75, rateAndTerm: 75, cashOut: 70 };
  } else if (p.idType === 'PASSPORT_ONLY') {
    ltv = p.visaType
      ? { purchase: 75, rateAndTerm: 75, cashOut: 70 }
      : { purchase: 70, rateAndTerm: 70, cashOut: 60 }; // no visa
  }

  if (p.entityType === 'FOREIGN_ENTITY') {
    ltv = {
      purchase: Math.min(ltv.purchase, 70),
      rateAndTerm: Math.min(ltv.rateAndTerm, 70),
      cashOut: Math.min(ltv.cashOut, 60),
    };
  }
  if (getCountryRiskTier(p.countryCode) === 'ELEVATED') {
    ltv = { purchase: ltv.purchase - 5, rateAndTerm: ltv.rateAndTerm - 5, cashOut: ltv.cashOut - 5 };
  }
  return ltv;
}

export interface FnDocument { id: string; label: string; required: boolean; }

/** Document checklist by FN profile (§10.4). */
export function getForeignNationalDocumentChecklist(p: ForeignNationalProfile): FnDocument[] {
  const docs: FnDocument[] = [
    { id: 'purchase_agreement', label: 'Purchase Agreement', required: true },
    { id: 'appraisal', label: 'U.S. Property Appraisal', required: true },
    { id: 'lease_or_rent_schedule', label: 'Lease Agreement / Rent Schedule', required: true },
    { id: 'property_insurance', label: 'Property Insurance (U.S. policy)', required: true },
    { id: 'intent_not_to_occupy', label: 'Intent Not to Occupy Certification', required: true },
    { id: 'articles_of_organization', label: 'LLC Articles of Organization', required: true },
    { id: 'operating_agreement', label: 'LLC Operating Agreement', required: true },
    { id: 'ein_letter', label: 'EIN Confirmation Letter', required: true },
    // CDD Rule (31 CFR 1010.230): identify + verify 25%+ beneficial owners and
    // one control person for the borrowing entity.
    { id: 'beneficial_ownership', label: 'Beneficial-Ownership Certification (25%+ owners)', required: true },
    { id: 'control_person_id', label: 'Control-Person ID (entity manager)', required: true },
  ];

  if (p.idType !== 'SSN') {
    docs.push({ id: 'passport', label: 'Valid Passport', required: true });
    docs.push({ id: 'bank_statements', label: '2+ Months Bank Statements (source of funds)', required: true });
  }
  if (p.idType === 'ITIN') {
    docs.push({ id: 'itin_letter', label: 'ITIN Assignment Letter (CP565)', required: true });
  }
  if (p.visaType) {
    docs.push({ id: 'visa', label: `Visa (${p.visaType})`, required: true });
  }
  if (!p.hasUsFico) {
    docs.push({ id: 'foreign_credit_report', label: 'Foreign Credit Report (3 trade lines, 2-yr history)', required: true });
    docs.push({ id: 'credit_letters', label: 'Credit Reference Letters from Home-Country Banks', required: false });
  }
  if (p.entityFormedOver1YrAgo) {
    docs.push({ id: 'good_standing', label: 'Certificate of Good Standing (within 90 days)', required: true });
  }
  if (p.entityState && p.propertyState && p.entityState !== p.propertyState) {
    docs.push({ id: 'foreign_registration', label: 'Foreign Entity Registration (property state)', required: true });
  }
  return docs;
}

export interface FnEligibility {
  canLend: boolean;
  tier: CountryRiskTier;
  totalRateAddBps: number;
  maxLTV: FnMaxLTV;
  /** OFAC strict-liability: individual SDN-list screening is ALWAYS required —
   * the country tier is a first-pass proxy, never an OFAC clearance. */
  sdnScreeningRequired: boolean;
  /** ELEVATED/RESTRICTED jurisdictions trigger Enhanced Due Diligence (source
   * of wealth, senior approval, OFAC-license check, PEP screening). */
  requiresEnhancedDueDiligence: boolean;
  note: string;
}

/** Top-level eligibility summary (AML/KYC-aware). */
export function assessForeignNationalEligibility(p: ForeignNationalProfile): FnEligibility {
  const tier = getCountryRiskTier(p.countryCode);
  const total = totalRateAdjustmentBps(p);
  const canLend = Number.isFinite(total);
  const edd = tier === 'ELEVATED' || tier === 'RESTRICTED';
  return {
    canLend,
    tier,
    totalRateAddBps: canLend ? total : Infinity,
    maxLTV: calculateForeignNationalMaxLTV(p),
    sdnScreeningRequired: true, // always — strict liability, individual-level
    requiresEnhancedDueDiligence: canLend && edd,
    note: !canLend
      ? `OFAC-sanctioned country (${tier}) — cannot originate. Refer to compliance.`
      : edd
        ? `${tier} country, +${total} bps; entity vesting + Enhanced Due Diligence required (source of wealth, senior approval, PEP + individual SDN screening). Country tier is NOT an OFAC clearance.`
        : `${tier} country, +${total} bps over base; entity vesting required. Individual SDN/sanctions-list screening still required (strict liability).`,
  };
}
