// ============================================================
// DSCR Deal Desk v11.0 — Zustand Store
// Dual-Track, Math-Verified, Provenance-Honest, v11 Intelligence
// ============================================================

import { create } from 'zustand';
import type {
  PropertyInputs,
  BorrowerProfile,
  LoanStructure,
  RentalStrategy,
  DSCRResult,
  ReserveScenarios,
  LenderFitResult,
  BreakevenResult,
  STRUnderwritingResult,
  MonteCarloResult,
  RescueResult,
  StructureOption,
  PPPCheckResult,
  AcquisitionScore,
  DealKillCheck,
  // v11 types
  ReassessmentResult,
  ARMResetResult,
  ReturnsResult,
  AfterTaxIRRResult,
  VerdictResult,
  ICMemo,
  LenderRankingEntry,
  InsuranceGateResult,
  BRRRRSeasoningGate,
  // v11.10 types — Monte Carlo rate-path + multi-scenario ARM + refi tracker
  MultiScenarioARMResult,
  MonteCarloRatePathResult,
  RefiAnalysis,
  // v11.11 types — Lender Match Score
  LenderMatchScoreResult,
  // v11.12 types — Combined Stress Matrix
  StressMatrixResult,
  // v11.13 types — IRR Waterfall
  IRRWaterfallResult,
} from './types';
import type { ExecutionRiskResult, TwoQuoteValidation } from './decisionSupport';
import type { CostSegViabilityResult } from './taxEngine';

// --- Flagship Deal Defaults ---
const DEFAULT_PROPERTY: PropertyInputs = {
  purchasePrice: 425000,
  leaseRent: 3000,
  marketRent: 3100,
  strProjectedRent: 5500,
  strDocumentedRent: 4200,
  hoa: 150,
  annualTaxes: 5000,
  annualInsurance: 2000,
  floodInsurance: 0,
  propertyType: 'SFR',
  state: 'TX',
  unitCount: 1,
  sqft: 1800,
  yearBuilt: 2005,
  isCondotel: false,
  isNonWarrantable: false,
  isRural: false,
  isDecliningMarket: false,
  hoaSTRPolicy: 'UNKNOWN',
};

const DEFAULT_BORROWER: BorrowerProfile = {
  ficoScore: 729,
  experience: 'EXPERIENCED',
  existingFinancedProperties: 2,
  entityType: 'LLC',
  isUSCitizenOrPR: true,
  availableReserves: 75000,
  reserveAssets: [
    { type: 'CHECKING', value: 30000 },
    { type: 'SAVINGS', value: 25000 },
    { type: 'BROKERAGE', value: 20000 },
  ],
  isFirstResponder: false,
  isForeignNational: false,
};

const DEFAULT_LOAN: LoanStructure = {
  ltv: 75,
  term: '30_YR',
  ioPeriod: 'NONE',
  armType: 'FIXED',
  prepayPreference: 'NONE',
  purpose: 'PURCHASE',
  expectedHoldYears: 5,
  points: 0,
  lenderFees: 1295,
  brokerFees: 0,
  rateLockCost: 0,
};

// --- Store Interface ---
interface DSCRStore {
  // Inputs
  property: PropertyInputs;
  borrower: BorrowerProfile;
  loan: LoanStructure;
  strategy: RentalStrategy;

  // Actions
  setProperty: (updates: Partial<PropertyInputs>) => void;
  setBorrower: (updates: Partial<BorrowerProfile>) => void;
  setLoan: (updates: Partial<LoanStructure>) => void;
  setStrategy: (s: RentalStrategy) => void;
  resetToDefaults: () => void;

  // Computed flag
  computed: boolean;
  setComputed: (v: boolean) => void;

  // Results
  dscrResult: DSCRResult | null;
  setDscrResult: (r: DSCRResult | null) => void;

  reserveScenarios: ReserveScenarios | null;
  setReserveScenarios: (r: ReserveScenarios | null) => void;

  lenderFits: LenderFitResult[];
  setLenderFits: (l: LenderFitResult[]) => void;

  breakevenResult: BreakevenResult | null;
  setBreakevenResult: (r: BreakevenResult | null) => void;

  strResult: STRUnderwritingResult | null;
  setStrResult: (r: STRUnderwritingResult | null) => void;

  monteCarloResult: MonteCarloResult | null;
  setMonteCarloResult: (r: MonteCarloResult | null) => void;

  rescueResult: RescueResult | null;
  setRescueResult: (r: RescueResult | null) => void;

  structureOptions: StructureOption[];
  setStructureOptions: (s: StructureOption[]) => void;

  pppCheckResult: PPPCheckResult | null;
  setPppCheckResult: (r: PPPCheckResult | null) => void;

  acquisitionScore: AcquisitionScore | null;
  setAcquisitionScore: (s: AcquisitionScore | null) => void;

  executionRisk: ExecutionRiskResult | null;
  setExecutionRisk: (r: ExecutionRiskResult | null) => void;

  dealKillCheck: DealKillCheck | null;
  setDealKillCheck: (c: DealKillCheck | null) => void;

  twoQuoteValidation: TwoQuoteValidation | null;
  setTwoQuoteValidation: (v: TwoQuoteValidation | null) => void;

  // v11 NEW state
  v11Reassessment: ReassessmentResult | null;
  setV11Reassessment: (r: ReassessmentResult | null) => void;

  v11ArmReset: ARMResetResult | null;
  setV11ArmReset: (r: ARMResetResult | null) => void;

  v11Returns: ReturnsResult | null;
  setV11Returns: (r: ReturnsResult | null) => void;

  v11AfterTaxIRR: AfterTaxIRRResult | null;
  setV11AfterTaxIRR: (r: AfterTaxIRRResult | null) => void;

  v11Verdict: VerdictResult | null;
  setV11Verdict: (v: VerdictResult | null) => void;

  v11ICMemo: ICMemo | null;
  setV11ICMemo: (m: ICMemo | null) => void;

  v11LenderRanking: LenderRankingEntry[];
  setV11LenderRanking: (l: LenderRankingEntry[]) => void;

  v11InsuranceGate: InsuranceGateResult | null;
  setV11InsuranceGate: (r: InsuranceGateResult | null) => void;

  v11BrrrrGate: BRRRRSeasoningGate | null;
  setV11BrrrrGate: (g: BRRRRSeasoningGate | null) => void;

  // v11.8: Multi-scenario ARM stress testing (5 scenarios)
  v11MultiScenarioARM: MultiScenarioARMResult | null;
  setV11MultiScenarioARM: (r: MultiScenarioARMResult | null) => void;

  // v11.10: Monte Carlo ARM/SOFR rate-path simulator (Vasicek)
  v11MonteCarloRatePath: MonteCarloRatePathResult | null;
  setV11MonteCarloRatePath: (r: MonteCarloRatePathResult | null) => void;

  // v11.7: Refi tracker analysis (4-factor readiness scoring)
  v11RefiAnalysis: RefiAnalysis | null;
  setV11RefiAnalysis: (r: RefiAnalysis | null) => void;

  // v11.11: Lender Match Score (0-100 weighted factor breakdown)
  v11LenderMatchScore: LenderMatchScoreResult | null;
  setV11LenderMatchScore: (r: LenderMatchScoreResult | null) => void;

  // v11.12: Combined Stress Matrix (rate × rent 2D heatmap)
  v11StressMatrix: StressMatrixResult | null;
  setV11StressMatrix: (r: StressMatrixResult | null) => void;

  // v11.13: IRR Waterfall (gross rent → opex → NOI → debt → tax → after-tax → exit → IRR)
  v11IRRWaterfall: IRRWaterfallResult | null;
  setV11IRRWaterfall: (r: IRRWaterfallResult | null) => void;

  // v11.1 D-3 fix: Cost-seg viability surfaced to UI (was only console.log'd)
  v11CostSegViability: CostSegViabilityResult | null;
  setV11CostSegViability: (r: CostSegViabilityResult | null) => void;

  // v11.1 D-6 fix: Track which v11 modules failed (was silently swallowed by try/catch)
  v11ModuleErrors: Record<string, string>;
  setV11ModuleError: (module: string, err: string | null) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  // v11.1 D-2 fix: Insurance gate — user-confirmed bindable quote
  insuranceQuoteConfirmed: boolean;
  setInsuranceQuoteConfirmed: (v: boolean) => void;

  track2Acknowledged: boolean;
  setTrack2Acknowledged: (v: boolean) => void;

  goldenVerified: boolean;
  setGoldenVerified: (v: boolean) => void;

  disclaimerOpen: boolean;
  setDisclaimerOpen: (v: boolean) => void;

  analyzing: boolean;
  setAnalyzing: (v: boolean) => void;

  clearResults: () => void;
}

export const useDSCRStore = create<DSCRStore>((set) => ({
  // Inputs
  property: DEFAULT_PROPERTY,
  borrower: DEFAULT_BORROWER,
  loan: DEFAULT_LOAN,
  strategy: 'LTR',

  // Actions
  setProperty: (updates) =>
    set((state) => ({ property: { ...state.property, ...updates } })),
  setBorrower: (updates) =>
    set((state) => ({ borrower: { ...state.borrower, ...updates } })),
  setLoan: (updates) =>
    set((state) => ({ loan: { ...state.loan, ...updates } })),
  setStrategy: (s) => set({ strategy: s }),
  resetToDefaults: () =>
    set({
      property: DEFAULT_PROPERTY,
      borrower: DEFAULT_BORROWER,
      loan: DEFAULT_LOAN,
      strategy: 'LTR',
      computed: false,
      dscrResult: null,
      reserveScenarios: null,
      lenderFits: [],
      breakevenResult: null,
      strResult: null,
      monteCarloResult: null,
      rescueResult: null,
      structureOptions: [],
      pppCheckResult: null,
      acquisitionScore: null,
      executionRisk: null,
      dealKillCheck: null,
      twoQuoteValidation: null,
      track2Acknowledged: false,
      // v11
      v11Reassessment: null,
      v11ArmReset: null,
      v11Returns: null,
      v11AfterTaxIRR: null,
      v11Verdict: null,
      v11ICMemo: null,
      v11LenderRanking: [],
      v11InsuranceGate: null,
      v11BrrrrGate: null,
      // v11.8/v11.10/v11.7: Multi-scenario ARM + Monte Carlo rate-path + Refi tracker
      v11MultiScenarioARM: null,
      v11MonteCarloRatePath: null,
      v11RefiAnalysis: null,
      v11LenderMatchScore: null,
      v11StressMatrix: null,
      v11IRRWaterfall: null,
      // v11.1 D-3 fix: Cost-seg viability slot
      v11CostSegViability: null,
      // v11.1 D-6 fix: v11 module error tracker (empty = no errors)
      v11ModuleErrors: {},

      // v11.1 D-2 fix: Insurance gate bindable-quote toggle
      insuranceQuoteConfirmed: false,
    }),

  // Computed flag
  computed: false,
  setComputed: (v) => set({ computed: v }),

  // Results
  dscrResult: null,
  setDscrResult: (r) => set({ dscrResult: r }),

  reserveScenarios: null,
  setReserveScenarios: (r) => set({ reserveScenarios: r }),

  lenderFits: [],
  setLenderFits: (l) => set({ lenderFits: l }),

  breakevenResult: null,
  setBreakevenResult: (r) => set({ breakevenResult: r }),

  strResult: null,
  setStrResult: (r) => set({ strResult: r }),

  monteCarloResult: null,
  setMonteCarloResult: (r) => set({ monteCarloResult: r }),

  rescueResult: null,
  setRescueResult: (r) => set({ rescueResult: r }),

  structureOptions: [],
  setStructureOptions: (s) => set({ structureOptions: s }),

  pppCheckResult: null,
  setPppCheckResult: (r) => set({ pppCheckResult: r }),

  acquisitionScore: null,
  setAcquisitionScore: (s) => set({ acquisitionScore: s }),

  executionRisk: null,
  setExecutionRisk: (r) => set({ executionRisk: r }),

  dealKillCheck: null,
  setDealKillCheck: (c) => set({ dealKillCheck: c }),

  twoQuoteValidation: null,
  setTwoQuoteValidation: (v) => set({ twoQuoteValidation: v }),

  // v11 NEW state initial values
  v11Reassessment: null,
  setV11Reassessment: (r) => set({ v11Reassessment: r }),

  v11ArmReset: null,
  setV11ArmReset: (r) => set({ v11ArmReset: r }),

  v11Returns: null,
  setV11Returns: (r) => set({ v11Returns: r }),

  v11AfterTaxIRR: null,
  setV11AfterTaxIRR: (r) => set({ v11AfterTaxIRR: r }),

  v11Verdict: null,
  setV11Verdict: (v) => set({ v11Verdict: v }),

  v11ICMemo: null,
  setV11ICMemo: (m) => set({ v11ICMemo: m }),

  v11LenderRanking: [],
  setV11LenderRanking: (l) => set({ v11LenderRanking: l }),

  v11InsuranceGate: null,
  setV11InsuranceGate: (r) => set({ v11InsuranceGate: r }),

  v11BrrrrGate: null,
  setV11BrrrrGate: (g) => set({ v11BrrrrGate: g }),

  // v11.8: Multi-scenario ARM stress testing
  v11MultiScenarioARM: null,
  setV11MultiScenarioARM: (r) => set({ v11MultiScenarioARM: r }),

  // v11.10: Monte Carlo rate-path simulator
  v11MonteCarloRatePath: null,
  setV11MonteCarloRatePath: (r) => set({ v11MonteCarloRatePath: r }),

  // v11.7: Refi tracker analysis
  v11RefiAnalysis: null,
  setV11RefiAnalysis: (r) => set({ v11RefiAnalysis: r }),

  v11LenderMatchScore: null,
  setV11LenderMatchScore: (r) => set({ v11LenderMatchScore: r }),

  v11StressMatrix: null,
  setV11StressMatrix: (r) => set({ v11StressMatrix: r }),

  v11IRRWaterfall: null,
  setV11IRRWaterfall: (r) => set({ v11IRRWaterfall: r }),

  // v11.1 D-3 fix: Cost-seg viability setter
  v11CostSegViability: null,
  setV11CostSegViability: (r) => set({ v11CostSegViability: r }),

  // v11.1 D-6 fix: Module error tracker — null clears the entry, string sets it
  v11ModuleErrors: {},
  setV11ModuleError: (module, err) => set((state) => {
    const next = { ...state.v11ModuleErrors };
    if (err === null) {
      delete next[module];
    } else {
      next[module] = err;
    }
    return { v11ModuleErrors: next };
  }),

  // v11.1 D-2 fix: Insurance gate bindable-quote toggle
  insuranceQuoteConfirmed: false,
  setInsuranceQuoteConfirmed: (v) => set({ insuranceQuoteConfirmed: v }),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  track2Acknowledged: false,
  setTrack2Acknowledged: (v) => set({ track2Acknowledged: v }),

  goldenVerified: false,
  setGoldenVerified: (v) => set({ goldenVerified: v }),

  disclaimerOpen: false,
  setDisclaimerOpen: (v) => set({ disclaimerOpen: v }),

  analyzing: false,
  setAnalyzing: (v) => set({ analyzing: v }),

  clearResults: () =>
    set({
      computed: false,
      dscrResult: null,
      reserveScenarios: null,
      lenderFits: [],
      breakevenResult: null,
      strResult: null,
      monteCarloResult: null,
      rescueResult: null,
      structureOptions: [],
      pppCheckResult: null,
      acquisitionScore: null,
      executionRisk: null,
      dealKillCheck: null,
      twoQuoteValidation: null,
      track2Acknowledged: false,
      // v11
      v11Reassessment: null,
      v11ArmReset: null,
      v11Returns: null,
      v11AfterTaxIRR: null,
      v11Verdict: null,
      v11ICMemo: null,
      v11LenderRanking: [],
      v11InsuranceGate: null,
      v11BrrrrGate: null,
      // v11.8/v11.10/v11.7 reset on clear
      v11MultiScenarioARM: null,
      v11MonteCarloRatePath: null,
      v11RefiAnalysis: null,
      v11LenderMatchScore: null,
      v11StressMatrix: null,
      v11IRRWaterfall: null,
      // v11.1 D-3 fix: reset cost-seg slot on clear
      v11CostSegViability: null,
      // v11.1 D-6 fix: clear module error tracker
      v11ModuleErrors: {},
      // v11.1 D-2 fix: reset insurance quote toggle on clear
      insuranceQuoteConfirmed: false,
    }),
}));
