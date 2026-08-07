import type { DealInputs, DataQualityResult, FraudCheck } from './types';
import { getEstimatedTaxRate } from './state-overlays';

// ============================================================================
// FRAUD / DATA QUALITY ENGINE
// ============================================================================
// Detects inflated leases, fake leases, STR projection abuse, occupancy fraud,
// straw entities, undisclosed debt, condition issues, insurance underquote,
// tax underquote.
// ============================================================================

const SEVERITY_ORDER = { low: 0, moderate: 1, high: 2, critical: 3 } as const;
const SEVERITY_WEIGHT: Record<FraudCheck['severity'], number> = {
  low: 5,
  moderate: 15,
  high: 30,
  critical: 50,
};

// Severity helpers — take the MAX of competing severity signals
function maxSeverity(a: FraudCheck['severity'], b: FraudCheck['severity']): FraudCheck['severity'] {
  return SEVERITY_ORDER[a] >= SEVERITY_ORDER[b] ? a : b;
}

export function runFraudChecks(i: DealInputs): FraudCheck[] {
  const checks: FraudCheck[] = [];

  // 1. Inflated lease — compare lease to appraiser market rent
  //    Gap is computed as (claim - appraiser) / appraiser. Positive = inflated.
  const rentDiff = i.appraiserRent > 0
    ? (i.borrowerRentClaim - i.appraiserRent) / i.appraiserRent
    : 0;
  {
    let severity: FraudCheck['severity'] = 'low';
    if (rentDiff > 0.25) severity = 'high';
    else if (rentDiff > 0.1) severity = 'moderate';
    checks.push({
      risk: 'Inflated lease',
      check: 'Compare lease to market rent and deposits',
      passed: rentDiff <= 0.1,
      severity,
      note: rentDiff > 0.1
        ? `Borrower claim $${i.borrowerRentClaim.toFixed(0)} exceeds appraiser $${i.appraiserRent.toFixed(0)} by ${(rentDiff * 100).toFixed(0)}%`
        : `Borrower claim within 10% of appraiser market rent`,
    });
  }

  // 2. Fake lease — verify tenant, payment history, bank deposits
  {
    let severity: FraudCheck['severity'] = 'low';
    if (!i.leaseVerified) severity = 'high';
    else if (!i.leaseDepositVerified) severity = 'moderate';
    checks.push({
      risk: 'Fake lease',
      check: 'Verify tenant, payment history, bank deposits',
      passed: i.leaseVerified && i.leaseDepositVerified,
      severity,
      note: i.leaseVerified
        ? i.leaseDepositVerified
          ? 'Lease verified and deposit traced to bank statements'
          : 'Lease verified but deposit not confirmed in bank statements'
        : 'NO LEASE VERIFICATION — lease authenticity cannot be confirmed',
    });
  }

  // 3. STR projection abuse — compare projection to actual trailing 12
  //    FIX (C2): operator-precedence bug — must wrap projection in parens.
  if (i.rentType === 'STR' || i.propertyType === 'CONDOTEL') {
    let severity: FraudCheck['severity'] = 'low';
    let passed = true;
    let note = '';

    if (!i.strPlatformHistoryPulled) {
      // Unverified platform history is at least moderate risk on its own
      severity = 'moderate';
      passed = false;
      note = 'STR platform history NOT pulled — cannot validate trailing 12';
    }

    if (i.strTrailingRevenue && i.strTrailingRevenue > 0) {
      // CORRECT: ((projection || 0) - trailing) / trailing
      const projGap = ((i.strProjection ?? 0) - i.strTrailingRevenue) / i.strTrailingRevenue;
      if (projGap > 0.1) {
        // Projection overstates trailing 12 — escalating severity
        let projSeverity: FraudCheck['severity'] = 'moderate';
        if (projGap > 0.5) projSeverity = 'critical';
        else if (projGap > 0.25) projSeverity = 'high';
        severity = maxSeverity(severity, projSeverity);
        passed = false;
        note = note
          ? `${note}; Projection $${(i.strProjection ?? 0).toFixed(0)}/mo vs trailing 12 $${i.strTrailingRevenue.toFixed(0)}/mo — ${(projGap * 100).toFixed(0)}% overstatement`
          : `Projection $${(i.strProjection ?? 0).toFixed(0)}/mo vs trailing 12 $${i.strTrailingRevenue.toFixed(0)}/mo — ${(projGap * 100).toFixed(0)}% overstatement`;
      } else if (note === '') {
        note = 'Projection within 10% of verified trailing 12';
      }
    } else if (note === '') {
      note = 'No verified STR trailing 12 revenue — projection cannot be validated';
      severity = maxSeverity(severity, 'high');
      passed = false;
    }

    checks.push({
      risk: 'STR projection abuse',
      check: 'Compare AirDNA/market projections to actual comps',
      passed,
      severity,
      note,
    });
  }

  // 4. Occupancy fraud — confirm borrower will not occupy
  checks.push({
    risk: 'Occupancy fraud',
    check: 'Confirm borrower will not occupy property',
    passed: i.occupancyIntent === 'INVESTMENT',
    severity: i.occupancyIntent === 'INVESTMENT' ? 'low' : 'critical',
    note:
      i.occupancyIntent === 'INVESTMENT'
        ? 'Borrower attests non-owner-occupied investment intent'
        : 'OCCUPANCY FRAUD RISK — loan structure requires non-owner-occupied status',
  });

  // 5. Straw entity — validate LLC ownership and guarantor linkage
  {
    const entityOk = i.llcOwnershipVerified && i.guarantorLinkageVerified;
    let severity: FraudCheck['severity'] = 'low';
    if (!entityOk) {
      severity = i.entity === 'LLC' ? 'high' : 'moderate';
    }
    checks.push({
      risk: 'Straw entity',
      check: 'Validate LLC ownership and guarantor linkage',
      passed: entityOk,
      severity,
      note: entityOk
        ? 'LLC ownership verified through Secretary of State, guarantor linkage confirmed'
        : i.entity === 'LLC'
          ? 'LLC ownership OR guarantor linkage not verified — straw-buyer risk'
          : 'Individual vesting — lower straw risk but less asset protection',
    });
  }

  // 6. Undisclosed debt — credit, title, bank statement review
  {
    const undisclosedOk = i.creditReportPulled && i.titleSearchPulled && i.bankStatementsPulled;
    const missing: string[] = [];
    if (!i.creditReportPulled) missing.push('credit');
    if (!i.titleSearchPulled) missing.push('title');
    if (!i.bankStatementsPulled) missing.push('bank statements');
    checks.push({
      risk: 'Undisclosed debt',
      check: 'Credit, title, bank statement review',
      passed: undisclosedOk,
      severity: undisclosedOk ? 'low' : 'high',
      note: undisclosedOk
        ? 'Credit, title, and bank statements all reviewed'
        : `Missing: ${missing.join(', ')}`,
    });
  }

  // 7. Property condition — appraisal, inspection, repair reserves
  {
    const condOk = i.appraisalDone && i.inspectionDone;
    const missing: string[] = [];
    if (!i.appraisalDone) missing.push('appraisal');
    if (!i.inspectionDone) missing.push('inspection');
    checks.push({
      risk: 'Property condition',
      check: 'Appraisal, inspection, repair reserves',
      passed: condOk,
      severity: condOk ? 'low' : 'moderate',
      note: condOk
        ? 'Appraisal complete, inspection complete'
        : `Missing: ${missing.join(', ')}`,
    });
  }

  // 8. Insurance underquote — confirm bindable policy
  checks.push({
    risk: 'Insurance underquote',
    check: 'Confirm bindable policy, not placeholder estimate',
    passed: i.insuranceQuotedBindable,
    severity: i.insuranceQuotedBindable ? 'low' : 'moderate',
    note: i.insuranceQuotedBindable
      ? 'Bindable insurance quote in hand'
      : 'Insurance is a placeholder estimate — actual premium likely higher at binding',
  });

  // 9. Tax underquote — use post-sale reassessment estimate (state-specific)
  //    FIX (C3): logic was inverted. taxGap = (estNewTax - currentTax) / estNewTax.
  //    Positive gap (current < est) means UNDERQUOTE = risk. Negative means overquote = safe.
  {
    const stateTaxRate = getEstimatedTaxRate(i.state);
    const estNewTax = (i.purchasePrice * (stateTaxRate / 100)) / 12;
    let passed = true;
    let severity: FraudCheck['severity'] = 'low';
    let note = '';

    if (!i.taxReassessmentEstimated) {
      passed = false;
      severity = 'moderate';
      note = `Reassessment not modeled — post-sale tax may jump to ~$${estNewTax.toFixed(0)}/mo`;
    } else {
      // taxGap > 0 means current tax is below estimate (underquote = risk)
      const taxGap = estNewTax > 0 ? (estNewTax - i.propertyTaxes) / estNewTax : 0;
      if (taxGap > 0.3) {
        passed = false;
        severity = 'high';
        note = `Reassessment modeled, but current $${i.propertyTaxes.toFixed(0)}/mo is well below est $${estNewTax.toFixed(0)}/mo — ${(taxGap * 100).toFixed(0)}% underquote`;
      } else if (taxGap > 0.15) {
        passed = false;
        severity = 'moderate';
        note = `Reassessment modeled, but current $${i.propertyTaxes.toFixed(0)}/mo is below est $${estNewTax.toFixed(0)}/mo — ${(taxGap * 100).toFixed(0)}% underquote`;
      } else {
        note = `Reassessment modeled. Current $${i.propertyTaxes.toFixed(0)}/mo vs est $${estNewTax.toFixed(0)}/mo`;
      }
    }

    checks.push({
      risk: 'Tax underquote',
      check: 'Use post-sale reassessment estimate where applicable',
      passed,
      severity,
      note,
    });
  }

  return checks;
}

// ---------------------------------------------------------------------------
// DATA QUALITY SCORE — weighted by severity
// ---------------------------------------------------------------------------

export function calculateDataQuality(i: DealInputs): DataQualityResult {
  const checks = runFraudChecks(i);

  let penalty = 0;
  let maxPenalty = 0;
  let criticalCount = 0;
  let highCount = 0;
  let moderateCount = 0;

  for (const c of checks) {
    maxPenalty += SEVERITY_WEIGHT[c.severity];
    if (!c.passed) {
      penalty += SEVERITY_WEIGHT[c.severity];
      if (c.severity === 'critical') criticalCount++;
      else if (c.severity === 'high') highCount++;
      else if (c.severity === 'moderate') moderateCount++;
    }
  }

  const score = Math.max(0, Math.round(100 - (penalty / Math.max(1, maxPenalty)) * 100));

  // Reconciled fraud-risk band — drives from BOTH score AND severity counts
  // so the displayed band never disagrees with the score.
  let fraudRisk: DataQualityResult['fraudRisk'];
  if (criticalCount > 0) fraudRisk = 'Critical';
  else if (highCount >= 2) fraudRisk = 'High';
  else if (highCount === 1 || score < 60) fraudRisk = 'High';
  else if (moderateCount >= 2 || score < 75) fraudRisk = 'Moderate';
  else if (moderateCount === 1 || score < 90) fraudRisk = 'Moderate';
  else fraudRisk = 'Low';

  // Primary weakness — top 3 highest-severity failing checks (no in-place sort)
  const failedChecks = checks.filter((c) => !c.passed);
  const topFailures = [...failedChecks]
    .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
    .slice(0, 3);
  const primaryWeakness = topFailures.length === 0
    ? 'No major weaknesses identified — all checks passed.'
    : topFailures.map((c, idx) => `${idx + 1}. ${c.risk}: ${c.note}`).join(' ');

  return {
    score,
    fraudRisk,
    checks,
    primaryWeakness,
  };
}
