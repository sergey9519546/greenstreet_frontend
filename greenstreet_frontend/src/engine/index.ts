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
  // Shared quick-estimate helper for lightweight callers (e.g. QualifyModal).
  // Accepts the same inputs as the modal's inline calc but uses engine defaults
  // (0.5%/yr insurance) and returns a structured tier + disclaimer.
  quickDscrEstimate,
} from './engine';
export type { QuickDscrTier, QuickDscrEstimate } from './engine';

// --- Preliminary qualification engine (LTV/PITIA/DSCR/outcome/levers) ---
// Note: OUTCOME_META is intentionally not re-exported here — it has no
// consumer anywhere in the app (verified by repo-wide grep); import it
// directly from './qualify' if a future caller needs it.
export {
  qualify,
  amortize,
  loanForPayment,
  QUALIFY_POLICY,
  fmtUsd,
  fmtPct,
  fmtRateRange,
} from './qualify';
export type {
  QualifyInput,
  QualifyResult,
  Lever,
  Outcome,
  DscrBand,
  PropertyType as QualifyPropertyType,
  BorrowerType,
  FicoBand as EngineFicoBand,
  Purpose as EnginePurpose,
} from './qualify';

// --- State PPP / STR / usury facts ---
// Note: checkPPPWithBranching, getIndexedThreshold, and getMnHf3437Status are
// intentionally not re-exported here — none has a consumer anywhere in the
// app (verified by repo-wide grep); import directly from './statePppLaws' if
// a future caller needs one of them.
export {
  checkPPPLegal,
  getNoPPPPremium,
  PPP_STATE_LAWS,
} from './statePppLaws';

// --- Sensitivity / breakeven ---
export { computeBreakevenResult, computeTornado } from './sensitivity';

// --- Loan structure optimizer / rescue ---
export { generateStructureOptions } from './loanOptimizer';

// --- Decision support (verdict + IC memo; v2 wiring) ---
export { computeVerdict, buildICMemo } from './decisionSupport';

// --- Commercial (5+ unit) DSCR ---
export { computeCommercialDscr } from './commercialDscr';
export type { CommercialDscrInput, CommercialDscrResult, CommercialDscrDisposition, NoiSanity } from './commercialDscr';

// --- Construction / bridge DSCR ---
export { computeConstructionBridge } from './constructionBridge';
export type { ConstructionBridgeInput, ConstructionBridgeResult, BridgeViability } from './constructionBridge';

// --- TCO ↔ standard DSCR threshold conversion ---
export { stdToTco, tcoToStd, tcoThresholdTable, DEFAULT_RESERVE_LOAD } from './tcoThreshold';
export type { TcoThresholdRow } from './tcoThreshold';

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
  ProvenanceLabel,
} from './types';
