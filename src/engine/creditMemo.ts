export interface CreditMemoInput {
  price: number;
  loan: number;
  downPercent: number;
  rent: number;
  marketRent: number;
  rate: number;
  pitia: number;
  dscr: number;
  noi: number;
  capRate: number;
  debtYield: number;
  leverageState: "positive" | "neutral" | "negative";
  stateCode: string;
  pppRule?: string;
}

export interface CreditMemo {
  verdict: "STRONG_APPROVAL" | "CONDITIONAL_APPROVAL" | "SUB_1_0_EXCEPTION" | "DECLINE_RESTRUCTURE_NEEDED";
  verdictTitle: string;
  executiveSummary: string;
  keyStrengths: string[];
  riskFactors: string[];
  mitigationSteps: string[];
  recommendedLTV: number;
}

export function generateCreditMemo(input: CreditMemoInput): CreditMemo {
  const {
    price,
    loan,
    downPercent,
    rent,
    marketRent,
    rate,
    pitia,
    dscr,
    noi,
    capRate,
    debtYield,
    leverageState,
    stateCode,
    pppRule,
  } = input;

  const ltv = 100 - downPercent;
  const rentGap = rent - marketRent;
  const hasRentHaircutRisk = rentGap > 50;

  const keyStrengths: string[] = [];
  const riskFactors: string[] = [];
  const mitigationSteps: string[] = [];

  // Evaluate DSCR & Verdict
  let verdict: CreditMemo["verdict"] = "DECLINE_RESTRUCTURE_NEEDED";
  let verdictTitle = "Restructure Required";

  if (dscr >= 1.25) {
    verdict = "STRONG_APPROVAL";
    verdictTitle = "Institutional Quality — Prime DSCR Target";
    keyStrengths.push(`DSCR of ${dscr.toFixed(2)}x exceeds 1.25x tier-1 lender benchmark.`);
  } else if (dscr >= 1.0) {
    verdict = "CONDITIONAL_APPROVAL";
    verdictTitle = "Qualifies at 1.00x+ Standard Benchmark";
    keyStrengths.push(`DSCR of ${dscr.toFixed(2)}x satisfies base 1.00x debt coverage criteria.`);
  } else if (dscr >= 0.75) {
    verdict = "SUB_1_0_EXCEPTION";
    verdictTitle = "Sub-1.00x Exception Program Fit";
    riskFactors.push(`DSCR of ${dscr.toFixed(2)}x requires a sub-1.0 lender program overlay.`);
  } else {
    verdict = "DECLINE_RESTRUCTURE_NEEDED";
    verdictTitle = "High Coverage Deficit — Restructure Needed";
    riskFactors.push(`DSCR of ${dscr.toFixed(2)}x falls below standard 0.75x minimum thresholds.`);
  }

  // Debt yield evaluation
  if (debtYield >= 10.0) {
    keyStrengths.push(`Strong Debt Yield of ${debtYield.toFixed(2)}% provides exceptional lender downside protection.`);
  } else if (debtYield < 7.0) {
    riskFactors.push(`Thin Debt Yield of ${debtYield.toFixed(2)}% (<7.0%) signals elevated capital risk for lender.`);
  }

  // Leverage state evaluation
  if (leverageState === "positive") {
    keyStrengths.push(`Positive leverage: Cap rate (${capRate.toFixed(2)}%) exceeds debt constant.`);
  } else if (leverageState === "negative") {
    riskFactors.push(`Negative leverage: Cap rate (${capRate.toFixed(2)}%) is below note rate (${rate.toFixed(2)}%), squeezing investor cash flow.`);
    mitigationSteps.push(`Increase down payment from ${downPercent}% to ${Math.min(40, downPercent + 10)}% to eliminate negative leverage.`);
  }

  // Rent integrity evaluation
  if (hasRentHaircutRisk) {
    riskFactors.push(`Lease rent ($${rent.toLocaleString()}) exceeds 1007 market rent ($${marketRent.toLocaleString()}) by $${rentGap.toLocaleString()}/mo.`);
    mitigationSteps.push(`Underwrite loan using conservative $${marketRent.toLocaleString()} market rent to ensure no closing haircut surprises.`);
  } else {
    keyStrengths.push(`Lease rent is fully aligned with appraised 1007 market rent.`);
  }

  // State-specific PPP notes
  if (pppRule && pppRule.includes("HIGH-RISK")) {
    riskFactors.push(`State (${stateCode}): ${pppRule}`);
    mitigationSteps.push(`Ensure borrowing entity is structured as C-Corp/S-Corp if required by state statute.`);
  }

  // Calculate recommended LTV for safe 1.25x DSCR
  let recommendedLTV = ltv;
  if (dscr < 1.25 && pitia > 0) {
    const targetPitia = rent / 1.25;
    const nonDebtMo = pitia - (loan * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, 360)) / (Math.pow(1 + rate / 100 / 12, 360) - 1);
    const targetPiMo = Math.max(0, targetPitia - nonDebtMo);
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate > 0 && targetPiMo > 0) {
      const maxLoan = (targetPiMo * (Math.pow(1 + monthlyRate, 360) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, 360));
      recommendedLTV = Math.max(50, Math.min(ltv, Math.floor((maxLoan / price) * 100)));
    }
  }

  if (dscr < 1.25 && recommendedLTV < ltv) {
    mitigationSteps.push(`Adjust LTV from ${ltv}% down to ${recommendedLTV}% to hit 1.25x DSCR tier-1 pricing.`);
  }

  const executiveSummary = `Subject property in ${stateCode} valued at $${price.toLocaleString()} with $${loan.toLocaleString()} debt (${ltv}% LTV at ${rate.toFixed(2)}%). Monthly gross rent of $${rent.toLocaleString()} yields a ${dscr.toFixed(2)}x DSCR and ${debtYield.toFixed(2)}% Debt Yield. ${
    verdict === "STRONG_APPROVAL"
      ? "This asset represents an ideal institutional DSCR profile with strong debt coverage."
      : verdict === "CONDITIONAL_APPROVAL"
      ? "The deal satisfies core lender requirements but benefits from LTV optimization."
      : verdict === "SUB_1_0_EXCEPTION"
      ? "The transaction qualifies under sub-1.0x specialty guidelines with compensating liquidity."
      : "The deal requires structural modification (higher down payment or lower rate) to achieve lender debt service thresholds."
  }`;

  return {
    verdict,
    verdictTitle,
    executiveSummary,
    keyStrengths,
    riskFactors,
    mitigationSteps,
    recommendedLTV,
  };
}
