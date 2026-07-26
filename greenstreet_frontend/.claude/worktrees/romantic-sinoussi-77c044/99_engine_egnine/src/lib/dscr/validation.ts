import type { DealInputs, ValidationIssue, ValidationResult } from './types';

// ============================================================================
// INPUT VALIDATION
// ============================================================================
// Returns structured issues instead of silently running the engine on NaN,
// negative, or out-of-range inputs. Called at the top of runEngine().
// ============================================================================

interface FieldRule {
  field: keyof DealInputs;
  check: (v: number, inputs: DealInputs) => string | null; // null = OK
}

const NUMERIC_FIELDS: (keyof DealInputs)[] = [
  'purchasePrice', 'appraisedValue', 'loanAmount', 'rate', 'points',
  'termMonths', 'amortMonths', 'interestOnlyMonths',
  'borrowerRentClaim', 'appraiserRent', 'leaseRent', 'otherIncome',
  'strTrailingRevenue', 'strProjection',
  'propertyTaxes', 'insurance', 'hoa', 'propertyMgmtPct',
  'repairsMaintenancePct', 'capexReservePct', 'turnoverPct',
  'utilities', 'landscaping', 'accounting', 'licensing',
  'legalEvictionReserve', 'emergencyReserve', 'strFurnishingReserve',
  'fico', 'experienceProperties', 'bankruptcySeasoningMonths',
  'foreclosureSeasoningMonths', 'reservesMonths', 'mortgageHistoryMonths',
  'vacancyPct', 'collectionLossPct', 'concessionsPct', 'platformFeesPct',
  'seasonalityHaircutPct', 'marketCapRate', 'stressCapRate',
];

export function validateDealInputs(i: DealInputs): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Check every numeric field for NaN / Infinity
  for (const field of NUMERIC_FIELDS) {
    const v = i[field];
    if (typeof v === 'number' && !Number.isFinite(v)) {
      issues.push({
        field,
        message: `${String(field)} is ${Number.isNaN(v) ? 'NaN' : 'Infinity'} — must be a finite number.`,
        severity: 'error',
      });
    }
  }

  // 2. Range checks — only run on finite numbers
  const rangeRules: FieldRule[] = [
    { field: 'purchasePrice', check: (v) => v < 0 ? 'Purchase price cannot be negative.' : v < 10000 ? 'Purchase price suspiciously low (<$10k).' : null },
    { field: 'appraisedValue', check: (v) => v < 0 ? 'Appraised value cannot be negative.' : null },
    { field: 'loanAmount', check: (v) => v < 0 ? 'Loan amount cannot be negative.' : null },
    { field: 'rate', check: (v) => v < 0 ? 'Interest rate cannot be negative.' : v > 25 ? 'Interest rate >25% is unrealistic.' : null },
    { field: 'points', check: (v) => v < 0 ? 'Points cannot be negative.' : v > 10 ? 'Points >10% is unusual.' : null },
    { field: 'termMonths', check: (v) => v <= 0 ? 'Term must be > 0 months.' : v > 480 ? 'Term >40 years is unusual.' : null },
    { field: 'amortMonths', check: (v) => v <= 0 ? 'Amortization must be > 0 months.' : null },
    { field: 'interestOnlyMonths', check: (v, inp) => v < 0 ? 'IO months cannot be negative.' : v > inp.termMonths ? 'IO period cannot exceed loan term.' : null },
    { field: 'fico', check: (v) => v < 300 || v > 850 ? 'FICO must be 300–850.' : null },
    { field: 'vacancyPct', check: (v) => v < 0 || v > 100 ? 'Vacancy % must be 0–100.' : null },
    { field: 'collectionLossPct', check: (v) => v < 0 || v > 100 ? 'Collection loss % must be 0–100.' : null },
    { field: 'concessionsPct', check: (v) => v < 0 || v > 100 ? 'Concessions % must be 0–100.' : null },
    { field: 'platformFeesPct', check: (v) => v < 0 || v > 100 ? 'Platform fees % must be 0–100.' : null },
    { field: 'seasonalityHaircutPct', check: (v) => v < 0 || v > 100 ? 'Seasonality haircut % must be 0–100.' : null },
    { field: 'propertyMgmtPct', check: (v) => v < 0 || v > 30 ? 'Property mgmt % should be 0–30.' : null },
    { field: 'repairsMaintenancePct', check: (v) => v < 0 || v > 30 ? 'R&M % should be 0–30.' : null },
    { field: 'capexReservePct', check: (v) => v < 0 || v > 30 ? 'Capex reserve % should be 0–30.' : null },
    { field: 'turnoverPct', check: (v) => v < 0 || v > 30 ? 'Turnover % should be 0–30.' : null },
    { field: 'reservesMonths', check: (v) => v < 0 ? 'Reserves cannot be negative.' : null },
    { field: 'bankruptcySeasoningMonths', check: (v) => v < 0 ? 'BK seasoning cannot be negative.' : null },
    { field: 'foreclosureSeasoningMonths', check: (v) => v < 0 ? 'FC seasoning cannot be negative.' : null },
    { field: 'mortgageHistoryMonths', check: (v) => v < 0 ? 'Mortgage history cannot be negative.' : null },
    { field: 'marketCapRate', check: (v) => v <= 0 ? 'Market cap rate must be > 0.' : v > 20 ? 'Cap rate >20% is unrealistic.' : null },
    { field: 'stressCapRate', check: (v) => v <= 0 ? 'Stress cap rate must be > 0.' : null },
    { field: 'experienceProperties', check: (v) => v < 0 ? 'Experience cannot be negative.' : null },
  ];

  for (const rule of rangeRules) {
    const v = i[rule.field];
    if (typeof v === 'number' && Number.isFinite(v)) {
      const msg = rule.check(v, i);
      if (msg) {
        issues.push({ field: rule.field, message: msg, severity: msg.includes('unrealistic') || msg.includes('unusual') || msg.includes('suspiciously') || msg.includes('should be') ? 'warning' : 'error' });
      }
    }
  }

  // 3. Cross-field rules
  if (Number.isFinite(i.loanAmount) && Number.isFinite(i.appraisedValue) && i.appraisedValue > 0) {
    const ltv = (i.loanAmount / i.appraisedValue) * 100;
    if (ltv > 100) {
      issues.push({ field: 'loanAmount', message: `LTV ${ltv.toFixed(1)}% exceeds 100% — loan amount greater than appraised value.`, severity: 'error' });
    } else if (ltv > 90) {
      issues.push({ field: 'loanAmount', message: `LTV ${ltv.toFixed(1)}% exceeds typical DSCR max of 80%.`, severity: 'warning' });
    }
  }

  if (Number.isFinite(i.purchasePrice) && Number.isFinite(i.loanAmount) && i.loanAmount > i.purchasePrice) {
    issues.push({ field: 'loanAmount', message: 'Loan amount exceeds purchase price.', severity: 'error' });
  }

  if (Number.isFinite(i.marketCapRate) && Number.isFinite(i.stressCapRate) && i.stressCapRate <= i.marketCapRate) {
    issues.push({ field: 'stressCapRate', message: 'Stress cap rate should be higher than market cap rate to model adverse exit.', severity: 'warning' });
  }

  if (i.interestOnlyMonths > 0 && i.structure !== 'INTEREST_ONLY' && !i.structure.startsWith('ARM_')) {
    // interest-only with a fixed structure is unusual but not invalid
  }

  const errors = issues.filter((x) => x.severity === 'error');
  return {
    valid: errors.length === 0,
    issues,
  };
}
