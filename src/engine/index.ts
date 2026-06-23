// ============================================================
// Greenstreet DSCR Engine — public barrel
// Lifted in-process from 99_external_check/src/lib/dscr (zero runtime deps).
// Every number the portal shows is computed here, deterministically.
// Do NOT add LLM calls to this folder — math only.
// ============================================================

// --- Core solver + primitives ---
export {
  solveDSCR,
  calculatePaymentFactor,
  calculatePI,
  calculatePITIA,
  solveDealBreakRate,
  estimateRate,
  getDSCRGradient,
  verifyGoldenValues,
} from './engine';

// --- Lender matching (real 19-lender provenance DB) ---
export {
  LENDERS,
  getLenderById,
  matchLenders,
  computeQualifyingRentForLender,
} from './lenders';
export { scoreLenderMatch } from './lenderMatchScore';

// --- State PPP / STR / usury facts ---
export {
  checkPPPLegal,
  checkPPPWithBranching,
  getNoPPPPremium,
  getIndexedThreshold,
  getMnHf3437Status,
  PPP_STATE_LAWS,
} from './statePppLaws';

// --- Sensitivity / breakeven ---
export { computeBreakevenResult, computeTornado } from './sensitivity';

// --- Loan structure optimizer / rescue ---
export { generateStructureOptions } from './loanOptimizer';

// --- Decision support (verdict + IC memo; v2 wiring) ---
export { computeVerdict, buildICMemo } from './decisionSupport';

// --- Types (re-exported for the server + frontend) ---
export type {
  PropertyInputs,
  PropertyType,
  BorrowerProfile,
  InvestorExperience,
  EntityType,
  ReserveAsset,
  ReserveAssetType,
  LoanStructure,
  LoanTerm,
  IOPeriod,
  ARMType,
  PrepayType,
  LoanPurpose,
  RentalStrategy,
  DSCRFormulaMethod,
  DSCRTier,
  DSCRGradient,
  DualTrackDSCR,
  DSCRTrack,
  DualTrackVerdict,
  TripleRate,
  PITIABreakdown,
  DSCRResult,
  CashToCloseStack,
  PPPCheckResult,
  PPPStateLaw,
  PPPStateStatus,
  LenderProgram,
  LenderFitResult,
  ProvenanceLabel,
} from './types';
