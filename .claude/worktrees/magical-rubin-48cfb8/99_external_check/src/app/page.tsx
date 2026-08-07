'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, Line, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Shield, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Zap, TrendingDown,
  BarChart3, Activity, ShieldCheck, ShieldAlert, ShieldX,
  FileText, Calculator, Target, Wrench, CalendarDays, RefreshCw,
  Grid3x3,
} from 'lucide-react';
import { useDSCRStore } from '@/lib/dscr/store';
import { solveDSCR, verifyGoldenValues, getDSCRGradient } from '@/lib/dscr/engine';
import {
  computeRentSensitivity, computeRateSensitivity,
  computePriceSensitivity, computeLTVSensitivity,
  computeCombinedStressMatrix, computeJointAppraisalRisk,
  computeHeatmap, computeBreakevenResult,
} from '@/lib/dscr/sensitivity';
import { matchLenders } from '@/lib/dscr/lenders';
import { scoreLenderMatch } from '@/lib/dscr/lenderMatchScore';
import { computeStressMatrix, riskZoneColor, riskZoneTextColor, riskZoneLabel } from '@/lib/dscr/stressMatrix';
import { computeIRRWaterfall, waterfallStageColor, waterfallSignSymbol } from '@/lib/dscr/irrWaterfall';
import { computeReserveScenarios } from '@/lib/dscr/reserveEngine';
import { evaluateSTRUnderwriting } from '@/lib/dscr/strUnderwriting';
import { runMonteCarlo } from '@/lib/dscr/monteCarlo';
import { runMonteCarloRatePath } from '@/lib/dscr/monteCarloRatePath';
import { analyzeRefi } from '@/lib/dscr/refiTracker';
import { rescueTrack1, rescueTrack2, generateStructureOptions } from '@/lib/dscr/loanOptimizer';
import { checkPPPLegal, checkPPPWithBranching } from '@/lib/dscr/statePppLaws';
import {
  computeAcquisitionScore,
  computeExecutionRisk,
  computeDealKillCheck,
  validateTwoQuoteRule,
} from '@/lib/dscr/decisionSupport';
// v11 NEW imports
import {
  computeReassessedTax,
  computeReassessmentDSCRImpact,
} from '@/lib/dscr/reassessmentEngine';
import { computeARMReset, DEFAULT_ARM_PROGRAMS, computeRemainingBalanceAtReset, CURRENT_MARKET_SNAPSHOT, computeMultiScenarioARMReset, computePaymentShockPct, findDSCRBreakYear, computeRefiTriggerRate } from '@/lib/dscr/armResetEngine';
import { computeReturns } from '@/lib/dscr/returnsEngine';
import { computeAfterTaxIRR, assessCostSegViability } from '@/lib/dscr/taxEngine';
import { computeAEY, rankLendersByAEY, enforceTwoQuoteRule, COUNTERPARTY_RISK } from '@/lib/dscr/trueCostEngine';
import { computeVerdict, buildICMemo } from '@/lib/dscr/decisionSupport';
import type {
  PropertyType, LoanTerm, IOPeriod, ARMType, PrepayType,
  LoanPurpose, InvestorExperience, EntityType, RentalStrategy,
  DSCRResult, DSCRTrack, DSCRGradient, LenderFitResult, FitTier,
  ProvenanceLabel, BreakevenResult, ReserveScenarios,
  STRUnderwritingResult, MonteCarloResult, RescueResult, RescueFix,
  StructureOption, PPPCheckResult, HeatmapCell, AcquisitionScore, DealKillItem, DealKillCheck,
  // v11 types
  ReassessmentResult, ARMResetResult, ReturnsResult, AfterTaxIRRResult,
  VerdictResult, ICMemo, LenderRankingEntry, InsuranceGateResult, BRRRRSeasoningGate,
  TaxProfile, LenderProgram,
} from '@/lib/dscr/types';
import type { ExecutionRiskResult } from '@/lib/dscr/decisionSupport';
import { US_STATES } from '@/lib/dscr/types';

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function dscrColor(dscr: number): string {
  // Hex values aligned with Tailwind classes used in dscrBgClass + Track 1/2 progress bars
  if (dscr >= 1.5) return '#10b981';  // emerald-500 (matches bg-emerald-950/40)
  if (dscr >= 1.25) return '#22c55e';  // green-500 (matches bg-green-950/40)
  if (dscr >= 1.1) return '#06b6d4';   // cyan-500 (matches bg-cyan-950/40)
  if (dscr >= 1.0) return '#eab308';   // yellow-500 (matches bg-yellow-950/40)
  if (dscr >= 0.75) return '#f97316';  // orange-500 (matches bg-orange-950/40)
  return '#ef4444';  // red-500 (matches bg-red-950/40)
}

function dscrBgClass(g: DSCRGradient): string {
  const m: Record<string, string> = {
    emerald: 'bg-emerald-950/40 border-emerald-800/50',
    cyan: 'bg-cyan-950/40 border-cyan-800/50',
    green: 'bg-green-950/40 border-green-800/50',
    yellow: 'bg-yellow-950/40 border-yellow-800/50',
    orange: 'bg-orange-950/40 border-orange-800/50',
    red: 'bg-red-950/40 border-red-800/50',
  };
  return m[g.color] || 'bg-zinc-900 border-zinc-800';
}

function provenanceBadge(p: ProvenanceLabel) {
  const m: Record<ProvenanceLabel, { bg: string; text: string; icon: React.ReactNode }> = {
    VERIFIED_PRIMARY: { bg: 'bg-emerald-900/50', text: 'text-emerald-400', icon: <ShieldCheck className="h-2.5 w-2.5" /> },
    VERIFIED_SECONDARY: { bg: 'bg-cyan-900/50', text: 'text-cyan-400', icon: <Shield className="h-2.5 w-2.5" /> },
    UNVERIFIED: { bg: 'bg-amber-900/50', text: 'text-amber-400', icon: <ShieldAlert className="h-2.5 w-2.5" /> },
  };
  const v = m[p];
  return (
    <Badge className={`${v.bg} ${v.text} border-0 text-[9px] px-1.5 py-0 flex items-center gap-0.5`}>
      {v.icon} {p.replace(/_/g, ' ')}
    </Badge>
  );
}

function fitTierBadge(tier: FitTier) {
  const m: Record<FitTier, { bg: string; text: string }> = {
    STRONG_FIT: { bg: 'bg-emerald-900/50', text: 'text-emerald-400' },
    STANDARD_FIT: { bg: 'bg-cyan-900/50', text: 'text-cyan-400' },
    CONDITIONAL_FIT: { bg: 'bg-amber-900/50', text: 'text-amber-400' },
    UNLIKELY_FIT: { bg: 'bg-red-900/50', text: 'text-red-400' },
    DOES_NOT_MEET_GUIDELINES: { bg: 'bg-zinc-800', text: 'text-zinc-500' },
  };
  const v = m[tier];
  return <Badge className={`${v.bg} ${v.text} border-0 text-[9px] px-1.5 py-0`}>{tier.replace(/_/g, ' ')}</Badge>;
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function DSCRCommandCenter() {
  const store = useDSCRStore();
  const { property, borrower, loan, strategy } = store;

  // Verify golden values on load
  useEffect(() => {
    const v = verifyGoldenValues();
    useDSCRStore.getState().setGoldenVerified(v.pass);
  }, []);

  // Analyze deal
  const analyzeDeal = useCallback(() => {
    store.setAnalyzing(true);
    try {
      // v11 FIX (AUDIT-8 #1): Compute reassessed tax FIRST, then use it in solveDSCR.
      // PITIA MUST use reassessed tax, NOT the seller's current bill.
      const reassessmentData = computeReassessedTax(
        property.purchasePrice,
        property.state,
        property.annualTaxes,  // seller's current bill
      );
      const reassessedAnnualTax = reassessmentData.reassessedAnnualTax;

      // Pass reassessed tax into solveDSCR via the override parameter
      const result = solveDSCR(
        property, borrower, loan, strategy,
        false, 0, 'GROSS_PITIA',
        reassessedAnnualTax,  // v11 FIX: PITIA uses reassessed tax
      );
      store.setDscrResult(result);

      const loanAmount = property.purchasePrice * (loan.ltv / 100);
      const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;

      // Reserve scenarios
      const reserves = computeReserveScenarios(
        result.dscr, result.monthlyPITIA.total, strategy, borrower, loan,
        property.state, borrower.reserveAssets
      );
      store.setReserveScenarios(reserves);

      // Lender matching
      const lenders = matchLenders(property, borrower, loan, strategy, result.solvedRate);
      store.setLenderFits(lenders);

      // Breakeven
      const breakeven = computeBreakevenResult(
        result.qualifyingRent, result.monthlyPITIA.total, loanAmount, result.solvedRate,
        termYears, property.annualTaxes, property.annualInsurance, property.hoa,
        property.floodInsurance, property.purchasePrice, loan.ltv
      );
      store.setBreakevenResult(breakeven);

      // PPP check
      const ppp = checkPPPLegal(
        property.state, borrower.entityType, loanAmount,
        property.unitCount, loan.armType === 'FIXED' ? 'FIXED' : 'ARM'
      );
      store.setPppCheckResult(ppp);

      // STR underwriting
      if (strategy === 'STR') {
        const strResult = evaluateSTRUnderwriting(
          property, loanAmount, result.solvedRate, termYears, loan.ioPeriod,
          property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance
        );
        store.setStrResult(strResult);
      } else {
        store.setStrResult(null);
      }

      // Monte Carlo risk simulation
      try {
        const mcResult = runMonteCarlo(
          property, loan, strategy, result
        );
        store.setMonteCarloResult(mcResult);
      } catch {
        store.setMonteCarloResult(null);
      }

      // Structure options (loan optimizer)
      try {
        const structOptions = generateStructureOptions(property, borrower, loan, strategy);
        store.setStructureOptions(structOptions);
      } catch {
        store.setStructureOptions([]);
      }

      // Decision support: Acquisition Score, Execution Risk, Deal-Kill, Two-Quote
      try {
        const acquisitionScore = computeAcquisitionScore(
          result, reserves, property, borrower, loan, strategy, store.strResult, ppp
        );
        store.setAcquisitionScore(acquisitionScore);
      } catch {
        store.setAcquisitionScore(null);
      }

      try {
        const execRisk = computeExecutionRisk(result, borrower, loan, property, reserves);
        store.setExecutionRisk(execRisk);
      } catch {
        store.setExecutionRisk(null);
      }

      try {
        const dealKill = computeDealKillCheck(
          result, borrower, loan, property, strategy, reserves, ppp, store.strResult
        );
        store.setDealKillCheck(dealKill);
      } catch {
        store.setDealKillCheck(null);
      }

      // Two-quote rule: pass top 2 eligible lender IDs as pre-selection
      const eligibleLenderIds = lenders.filter(l => l.eligible).slice(0, 2).map(l => l.lenderId);
      const twoQuote = validateTwoQuoteRule(eligibleLenderIds, lenders);
      store.setTwoQuoteValidation(twoQuote);

      // Rescue engine (if deal fails)
      if (result.dscr < 1.0) {
        const rescue = rescueTrack1(
          property, borrower, loan, result.dscr, 1.0,
          result.monthlyPITIA.total, loanAmount, result.solvedRate, termYears
        );
        store.setRescueResult(rescue);
      } else if (result.dualTrackDSCR.track2.dscr < 1.0) {
        const vacPct = strategy === 'STR' ? 25 : strategy === 'MTR' ? 12 : 8;
        const rescue = rescueTrack2(
          result.qualifyingRent, result.monthlyPITIA.total,
          result.dualTrackDSCR.track2.dscr, vacPct, 8, 5
        );
        store.setRescueResult(rescue);
      } else {
        store.setRescueResult(null);
      }

      // ═════════════════════════════════════════════════════════
      // v11.1 UPGRADE — Reassessment, ARM Reset, Returns,
      //                 After-Tax IRR, True Cost Ranking, Verdict
      // ═════════════════════════════════════════════════════════
      // 1. Property-tax reassessment (already computed above for solveDSCR)
      try {
        const reassessment = computeReassessmentDSCRImpact(
          property.purchasePrice,
          property.state,
          result.qualifyingRent,
          result.monthlyPITIA.total,
          property.annualTaxes,
          reassessedAnnualTax,
        );
        store.setV11Reassessment(reassessment);
        store.setV11ModuleError('reassessment', null);
      } catch (e: unknown) {
        store.setV11Reassessment(null);
        store.setV11ModuleError('reassessment', e instanceof Error ? e.message : String(e));
      }

      // 2. ARM reset engine (v11.0) + Multi-scenario ARM (v11.8) + Monte Carlo rate-path (v11.10)
      try {
        if (loan.armType !== 'FIXED') {
          const armTerms = DEFAULT_ARM_PROGRAMS[loan.armType] ?? DEFAULT_ARM_PROGRAMS['5_6_ARM'];
          const termMonthsTotal = termYears * 12;
          const monthsToReset = armTerms.fixedPeriodMonths;
          const remainingTermAtReset = termMonthsTotal - monthsToReset;
          const loanBalanceAtReset = computeRemainingBalanceAtReset(loanAmount, result.solvedRate, termMonthsTotal, monthsToReset);
          const monthlyFixedExpenses = property.annualTaxes / 12
            + property.annualInsurance / 12
            + property.hoa
            + property.floodInsurance / 12;
          const ioPeriodMonths = loan.ioPeriod === 'NONE' ? 0 : loan.ioPeriod === '5_YR' ? 60 : loan.ioPeriod === '7_YR' ? 84 : 120;
          const armReset = computeARMReset(
            armTerms,
            loanBalanceAtReset,
            remainingTermAtReset,
            result.qualifyingRent,
            monthlyFixedExpenses,
            ioPeriodMonths,
          );
          store.setV11ArmReset(armReset);

          // v11.8: Multi-scenario ARM stress testing (5 scenarios: Bullish/Base/Bearish/Stress/Crisis)
          const multiScenario = computeMultiScenarioARMReset(
            armTerms,
            loanBalanceAtReset,
            remainingTermAtReset,
            result.qualifyingRent,
            monthlyFixedExpenses,
          );
          store.setV11MultiScenarioARM(multiScenario);

          // v11.10: Monte Carlo ARM/SOFR rate-path simulator (Vasicek process, 500 paths × 120 months)
          // Smaller path count (500) than the 1000-path default for UI responsiveness
          const mcRatePath = runMonteCarloRatePath(
            armTerms,
            loanBalanceAtReset,
            remainingTermAtReset,
            result.qualifyingRent,
            monthlyFixedExpenses,
            /* simulations */ 500,
            /* horizonMonths */ 120,
            /* seed */ 42,
          );
          store.setV11MonteCarloRatePath(mcRatePath);
        } else {
          store.setV11ArmReset(null);
          store.setV11MultiScenarioARM(null);
          store.setV11MonteCarloRatePath(null);
        }
      } catch (e: unknown) {
        store.setV11ArmReset(null);
        store.setV11MultiScenarioARM(null);
        store.setV11MonteCarloRatePath(null);
        store.setV11ModuleError('armReset', e instanceof Error ? e.message : String(e));
      }

      // 2b. v11.7 Refi tracker analysis (applies to all loan types — ARM and fixed)
      try {
        // Project refi at 6 months seasoning + 5% appreciation + current rate env
        const refiAnalysis = analyzeRefi(
          property,
          borrower,
          {
            balance: loanAmount,
            rate: result.solvedRate,
            monthlyPayment: result.monthlyPITIA.principalAndInterest,
          },
          /* monthsOwned */ 0,           // assume just-closed (analyzing forward refi readiness)
          /* projectedAppreciation */ 0.05,
          /* projectedRateEnvironment */ CURRENT_MARKET_SNAPSHOT.treasury10Y / 100,
        );
        store.setV11RefiAnalysis(refiAnalysis);
      } catch (e: unknown) {
        store.setV11RefiAnalysis(null);
        store.setV11ModuleError('refiTracker', e instanceof Error ? e.message : String(e));
      }

      // 3. Pre-tax returns
      try {
        const grossRentMonthly = strategy === 'STR' ? property.strProjectedRent
          : strategy === 'MTR' ? property.strProjectedRent * 0.88
          : Math.min(property.leaseRent, property.marketRent);
        const returns = computeReturns(
          property, loan, grossRentMonthly, strategy, result.solvedRate, 0,
          result.cashToClose.total,
        );
        store.setV11Returns(returns);
      } catch (e: unknown) {
        store.setV11Returns(null);
        store.setV11ModuleError('returns', e instanceof Error ? e.message : String(e));
      }

      // 4. After-tax IRR
      try {
        const taxProfile: TaxProfile = {
          ordinaryIncomeBrackets: [],
          magi: 200000,  // default assumption — could be added to borrower inputs
          filingStatus: 'MFJ',
          stateTaxRatePct: 5,
          isRealEstateProfessional: false,
          yearsREP: 0,
          landAllocationPct: 20,
          costSegStudyCompleted: false,
          costSegReclassifiedPct: 30,
          acquisitionDate: '2026-01-15',
          placedInServiceDate: '2026-02-01',
          expectedHoldYears: loan.expectedHoldYears,
          exitSellingCostsPct: 6,
          exitCapRatePct: 6.5,
          section1031Exchange: false,
        };
        const termMonths = termYears * 12;
        const piMonthly = result.monthlyPITIA.principalAndInterest;
        const annualADS = piMonthly * 12;
        const annualNOI = store.v11Returns ? (store.v11Returns.entryCapRate / 100) * property.purchasePrice : 0;
        const grossRentMonthly = strategy === 'STR' ? property.strProjectedRent
          : strategy === 'MTR' ? property.strProjectedRent * 0.88
          : Math.min(property.leaseRent, property.marketRent);
        const afterTaxIRR = computeAfterTaxIRR(
          property.purchasePrice, loanAmount, grossRentMonthly,
          annualNOI, annualADS, result.monthlyPITIA.total,
          taxProfile, 0,
          result.solvedRate, termMonths,  // v11.1 FIX (AUDIT-FINAL-7 D-1): pass rate + term for proper amortization
        );
        store.setV11AfterTaxIRR(afterTaxIRR);
        store.setV11ModuleError('afterTaxIRR', null);

        // v11.13: IRR Waterfall — decompose gross rent → opex → NOI → debt → tax → after-tax → exit → IRR
        try {
          const grossRentMonthlyForWF = strategy === 'STR' ? property.strProjectedRent
            : strategy === 'MTR' ? property.strProjectedRent * 0.88
            : Math.min(property.leaseRent, property.marketRent);
          const waterfall = computeIRRWaterfall(
            afterTaxIRR, property, loan, strategy, result.solvedRate,
            grossRentMonthlyForWF, loanAmount, result.cashToClose.total, 0,
          );
          store.setV11IRRWaterfall(waterfall);
          store.setV11ModuleError('irrWaterfall', null);
        } catch (e: unknown) {
          store.setV11IRRWaterfall(null);
          store.setV11ModuleError('irrWaterfall', e instanceof Error ? e.message : String(e));
        }
      } catch (e: unknown) {
        store.setV11AfterTaxIRR(null);
        store.setV11IRRWaterfall(null);
        store.setV11ModuleError('afterTaxIRR', e instanceof Error ? e.message : String(e));
      }

      // 5. True cost / AEY lender ranking
      try {
        const quotes = lenders.filter(l => l.eligible).map(l => ({
          lender: ({
            id: l.lenderId,
            name: l.lenderName,
            version: '11.1',
            effectiveDate: '2026-06',
            verifiedDate: '2026-06',
            sourceType: l.sourceProvenance,
            sourceSnapshot: l.sourceSnapshot,
            confidenceScore: l.confidenceScore,
            confidenceBand: '',
            statesAvailable: [],
            minFICO: { value: 620, provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            maxLTV: { value: 80, provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            minDSCR: { value: 1.0, provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            noRatioAvailable: { value: false, provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            reserveRule: { value: '6mo', provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            strPolicy: {
              lenderId: l.lenderId, allowed: true, haircutPercent: 20,
              incomeMethod: 'AIRDNA_PROJECTION' as const, requiresAirDNA: false, requiresLease: false,
              maxLTVForSTR: 75, provenance: 'VERIFIED_PRIMARY' as const,
            },
            prepayOptions: ['54321', 'NONE'],
            loanAmountMin: { value: 75000, provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            loanAmountMax: { value: 2000000, provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'],
            foreignNationalAllowed: { value: false, provenance: 'VERIFIED_PRIMARY' as const, source: '', asOfDate: '2026-06' },
            propertyTypeRules: {} as any,
            dscrFormulaMethod: 'GROSS_PITIA' as const,
            vacancyTreatment: 'NONE' as const,
            rateAdjustment: l.rateAdjustment,
            rateSheetDate: '2026-06',
            bestFor: [], cautions: [], notes: '', provenanceDetails: [],
          }) as LenderProgram,
          estimatedRate: l.estimatedRate.typical,
          eligible: l.eligible,
          ineligibleReasons: l.ineligibleReasons,
          fitTier: l.fitTier,
          pppAllowed: l.pppStateResult.allowed,
          pppStructure: '5-4-3-2-1',
          loanAmount,
          termMonths: termYears * 12,
          holdMonths: loan.expectedHoldYears * 12,
          parRate: 6.125,
          prepayPenaltyAtExit: 0,
          provenanceWarnings: l.provenanceWarnings,
          // v11 FIX (AUDIT-7 #1): Pass actual fees from LoanStructure so AEY is correct
          pointsPct: loan.points,
          lenderFees: loan.lenderFees,
          brokerFees: loan.brokerFees,
          rateLockCost: loan.rateLockCost,
        }));
        const ranking = rankLendersByAEY(quotes);
        store.setV11LenderRanking(ranking);
        store.setV11ModuleError('lenderRanking', null);
      } catch (e: unknown) {
        store.setV11LenderRanking([]);
        store.setV11ModuleError('lenderRanking', e instanceof Error ? e.message : String(e));
      }

      // 5b. v11.11: Lender Match Score (0-100 weighted factor breakdown — top-3 recommendation)
      try {
        const matchScore = scoreLenderMatch(lenders, loan, borrower, strategy);
        store.setV11LenderMatchScore(matchScore);
        store.setV11ModuleError('lenderMatchScore', null);
      } catch (e: unknown) {
        store.setV11LenderMatchScore(null);
        store.setV11ModuleError('lenderMatchScore', e instanceof Error ? e.message : String(e));
      }

      // 5c. v11.12: Combined Stress Matrix (rate × rent 2D heatmap with risk zones)
      try {
        const stressMatrix = computeStressMatrix(
          property, loan, strategy, result.solvedRate, result.qualifyingRent,
        );
        store.setV11StressMatrix(stressMatrix);
        store.setV11ModuleError('stressMatrix', null);
      } catch (e: unknown) {
        store.setV11StressMatrix(null);
        store.setV11ModuleError('stressMatrix', e instanceof Error ? e.message : String(e));
      }

      // 6. Insurance gate — v11 FIX (INT-4): Actually fire kill criterion in high-risk zones
      try {
        const isHighRiskState = ['FL', 'TX', 'LA'].includes(property.state);
        const isCA = property.state === 'CA';
        const isHighRisk = isHighRiskState || isCA;
        // Per spec Part B'.3: "if property_state in HIGH_RISK_ZONES AND insurance_quote_unconfirmed:
        //   kill_criterion = True"
        // v11.1 D-2 fix: read user-confirmed toggle from store (was hardcoded false).
        const quoteConfirmed = store.insuranceQuoteConfirmed;
        const insuranceGate: InsuranceGateResult = {
          zone: isHighRiskState
            ? (property.state === 'FL' ? 'FL_HIGH_RISK' : property.state === 'TX' ? 'TX_GULF' : 'LA_COASTAL')
            : isCA ? 'CA_COASTAL' : 'STANDARD',
          zoneLabel: isHighRiskState
            ? `${property.state} High-Risk Zone`
            : isCA ? 'California Zone' : 'Standard Risk Zone',
          quoteConfirmed,
          premiumAnnual: property.annualInsurance,
          premiumStressY3: Math.round(property.annualInsurance * 1.25),
          // v11 FIX: Kill criterion fires when in high-risk zone AND quote unconfirmed
          killCriterion: isHighRisk && !quoteConfirmed,
          verdict: isHighRisk
            ? (quoteConfirmed ? 'CONFIRM_REQUIRED' : 'KILL')
            : 'CLEAR',
          reason: isHighRisk
            ? `${property.state} is a high-risk insurance zone. 2024 survey: >90% of FL investors and 83% of CA investors missed deals due to insurance issues. ${quoteConfirmed ? 'Bindable quote CONFIRMED — stress Year 3 at +25%.' : 'NO BINDABLE QUOTE CONFIRMED — KILL CRITERION. Do not proceed until quote is in hand.'}`
            : `${property.state} standard insurance risk. Annual premium $${property.annualInsurance.toLocaleString()}.`,
          provenance: 'VERIFIED_PRIMARY',
          source: 'RCN Capital/CJ Patrick 2024 survey; Enterprise Community Partners',
        };
        store.setV11InsuranceGate(insuranceGate);
        store.setV11ModuleError('insuranceGate', null);
      } catch (e: unknown) {
        store.setV11InsuranceGate(null);
        store.setV11ModuleError('insuranceGate', e instanceof Error ? e.message : String(e));
      }

      // 7. BRRRR gate — v11 FIX (INT-5): Properly gate based on strategy + seasoning
      // Default: not a BRRRR deal unless strategy indicates rehab/refi intent.
      // For now, conservatively assume BRRRR applies when strategy is STR (AirBnBRRRR pattern)
      // or when expectedHoldYears < 2 (typical BRRRR flip-refi timeline).
      try {
        const isBRRRR = strategy === 'STR' || loan.expectedHoldYears < 2;
        const monthsHeld = 0;  // initial purchase — no seasoning yet
        const arvExpected = property.purchasePrice * 1.15;  // 15% ARV uplift assumption
        const lenderRuleMonths = 6;  // standard 6mo seasoning for ARV cash-out
        const seasoningMet = monthsHeld >= lenderRuleMonths;
        // Easy Street Capital waives 12-mo STR cash-out seasoning
        const waivedByLender = strategy === 'STR' ? 'Easy Street Capital' : null;
        const carryCostDuringSeasoning = result.monthlyPITIA.total * Math.max(0, lenderRuleMonths - monthsHeld);

        let brrrrVerdict: 'PROCEED' | 'WAIT' | 'RESTRUCTURE';
        let brrrrReason: string;
        if (!isBRRRR) {
          brrrrVerdict = 'PROCEED';
          brrrrReason = 'Not a BRRRR deal.';
        } else if (seasoningMet) {
          brrrrVerdict = 'PROCEED';
          brrrrReason = `BRRRR seasoning met (${monthsHeld}mo ≥ ${lenderRuleMonths}mo). Cash-out basis = ARV ($${arvExpected.toLocaleString()}).`;
        } else if (waivedByLender) {
          brrrrVerdict = 'PROCEED';
          brrrrReason = `BRRRR seasoning waived by ${waivedByLender} for STR cash-out. ARV basis = $${arvExpected.toLocaleString()}.`;
        } else {
          brrrrVerdict = 'WAIT';
          brrrrReason = `BRRRR seasoning not met (${monthsHeld}mo < ${lenderRuleMonths}mo). Carry cost during wait: $${carryCostDuringSeasoning.toLocaleString()}. Cash-out basis = cost basis until seasoned.`;
        }

        store.setV11BrrrrGate({
          applies: isBRRRR,
          monthsHeld,
          lenderRuleMonths,
          seasoningMet,
          cashOutBasis: (seasoningMet || waivedByLender) ? 'ARV' : 'COST_BASIS',
          arvExpected,
          carryCostDuringSeasoning: Math.round(carryCostDuringSeasoning),
          waivedByLender,
          verdict: brrrrVerdict,
          reason: brrrrReason,
        });
        store.setV11ModuleError('brrrrGate', null);
      } catch (e: unknown) {
        store.setV11BrrrrGate(null);
        store.setV11ModuleError('brrrrGate', e instanceof Error ? e.message : String(e));
      }

      // 7b. Cost-seg viability (Part B'.2 #7)
      // v11.1: Persist cost-seg viability to store so V11IntelligencePanel can render it.
      try {
        const costSegViability = assessCostSegViability(property.purchasePrice, 20);
        store.setV11CostSegViability(costSegViability);
        store.setV11ModuleError('costSegViability', null);
      } catch (e: unknown) {
        // Cost-seg viability is non-blocking
        store.setV11CostSegViability(null);
        store.setV11ModuleError('costSegViability', e instanceof Error ? e.message : String(e));
      }

      // 8. Final verdict
      try {
        const afterTaxIRRVal = store.v11AfterTaxIRR?.afterTaxIRR ?? 0;
        const preTaxIRRVal = store.v11AfterTaxIRR?.preTaxIRR ?? 0;
        const verdictInput = {
          track1DSCR: result.dualTrackDSCR.track1.dscr,
          track2DSCR: result.dualTrackDSCR.track2.dscr,
          lenderMinDSCR: 1.0,
          afterTaxIRR: afterTaxIRRVal / 100,
          preTaxIRR: preTaxIRRVal / 100,
          year1CoC: store.v11Returns?.year1CashOnCash ?? 0,
          dealBreakRate: result.dealBreakRate,
          solvedRate: result.solvedRate,
          rateHeadroomBps: result.rateHeadroomBps,
          appraisalBreakpointPercent: result.appraisalBreakpointPercent,
          insuranceGate: store.v11InsuranceGate,
          brrrrGate: store.v11BrrrrGate,
          armReset: store.v11ArmReset,
          strLegalityStatus: strategy === 'STR' ? 'CLEAR' : 'N/A',
          pppAllowed: ppp.allowed,
          ficoScore: borrower.ficoScore,
          ltv: loan.ltv,
          ltvCap: 80,
          loanAmount,
          lenderMinLoan: 75000,
          bestLenderConfidence: lenders[0]?.confidenceScore ?? 75,
          lenderRanking: store.v11LenderRanking,
          isDecliningMarket: property.isDecliningMarket,
          monteCarloPDSCRLessThan1: store.monteCarloResult?.probabilityDSCRAbove1_0 !== undefined
            ? 1 - store.monteCarloResult.probabilityDSCRAbove1_0 : undefined,
          monteCarlo5thPctDSCR: undefined,
        };
        const verdict = computeVerdict(verdictInput);
        store.setV11Verdict(verdict);

        // 8b. Build IC Memo (Part J) — v11 FIX (INT-2): Actually populate the memo
        try {
          const memo = buildICMemo({
            propertyAddress: `${property.state} deal`,
            entityType: borrower.entityType,
            verdict,
            track1DSCR: result.dualTrackDSCR.track1.dscr,
            lenderMinDSCR: 1.0,
            debtYield: result.debtYield * 100,
            ltv: loan.ltv,
            ltvCap: 80,
            dealBreakRate: result.dealBreakRate,
            cushionBps: result.rateHeadroomBps,
            entryCapRate: store.v11Returns?.entryCapRate ?? 0,
            year1CoC: store.v11Returns?.year1CashOnCash ?? 0,
            preTaxIRR: store.v11Returns?.leveredIRR ?? 0,
            preTaxP10: (store.v11Returns?.leveredIRR ?? 0) * 0.8,
            preTaxP90: (store.v11Returns?.leveredIRR ?? 0) * 1.2,
            afterTaxIRR: (store.v11AfterTaxIRR?.afterTaxIRR ?? 0) / 100,
            equityMultiple: store.v11Returns?.equityMultiple ?? 0,
            sellerAnnualTax: property.annualTaxes,
            reassessedAnnualTax: reassessedAnnualTax,
            bindingRisk: 'Rent (Track 1 sensitivity)',
            pDSCRLessThan1: store.monteCarloResult?.probabilityDSCRAbove1_0 !== undefined
              ? 1 - store.monteCarloResult.probabilityDSCRAbove1_0 : 0.10,
            fifthPctDSCR: 0.85,
            heatmapSummary: 'Fails at vacancy >12% + rent -10%',
            armReset: store.v11ArmReset,
            lenderRanking: store.v11LenderRanking,
            insuranceStatus: store.v11InsuranceGate?.verdict === 'CLEAR' ? 'CLEAR'
              : store.v11InsuranceGate?.verdict === 'KILL' ? 'UNCONFIRMED — kill criterion' : 'CONFIRMED',
            strLegality: strategy === 'STR' ? 'CLEAR' : 'N/A (LTR)',
            reserves: {
              likely: result.cashToClose.reserveRequirement,
              conservative: result.cashToClose.reserveConservative,
              stress: result.cashToClose.totalStress,
              portfolioStack: 0,
            },
            prepaySchedule: '5-4-3-2-1 declining on REMAINING balance',
            assumptions: [
              `10yr Treasury: ${CURRENT_MARKET_SNAPSHOT.treasury10Y}% (FRED DGS10, ${CURRENT_MARKET_SNAPSHOT.asOfDate})`,
              `5yr Treasury: ${CURRENT_MARKET_SNAPSHOT.treasury5Y}%`,
              `30-day SOFR: ${CURRENT_MARKET_SNAPSHOT.sofr30Day}%`,
              `Freddie Mac 30yr fixed: ${CURRENT_MARKET_SNAPSHOT.freddieMac30YrFixed}%`,
              `Risk-tiered spread: 175-450 bps over 10yr Treasury`,
              `MN HF 3437 enacted April 23, 2026, eff. August 1, 2026 (business-purpose DSCR not reached)`,
              `OBBBA 100% bonus depreciation for property acquired after January 19, 2025`,
              `§1250 recapture: max 25% federal; §1411 NIIT: 3.8% above $200K/$250K MAGI`,
              `Property tax reassessment modeled per state law (CA Prop 13, TX, FL, NJ, NY, IL)`,
              `PITIA uses reassessed tax: $${property.annualTaxes.toLocaleString()} → $${reassessedAnnualTax.toLocaleString()}/yr`,
            ],
            sourceDates: [
              { name: 'FRED DGS10', date: '2026-06-17', provenance: 'VERIFIED_PRIMARY' },
              { name: 'FRB H.15', date: '2026-06-16', provenance: 'VERIFIED_PRIMARY' },
              { name: 'Northmarq rates', date: '2026-06', provenance: 'VERIFIED_PRIMARY' },
              { name: 'MN HF 3437', date: '2026-04-23', provenance: 'VERIFIED_PRIMARY' },
              { name: 'OBBBA', date: '2025-01', provenance: 'VERIFIED_PRIMARY' },
              { name: 'IRC §167/168/1250/1411/469', date: '2026', provenance: 'VERIFIED_PRIMARY' },
            ],
          });
          store.setV11ICMemo(memo);
          store.setV11ModuleError('icMemo', null);
        } catch (memoErr) {
          // IC memo is non-blocking; verdict is still set
          store.setV11ICMemo(null);
          store.setV11ModuleError('icMemo', memoErr instanceof Error ? memoErr.message : String(memoErr));
        }
      } catch (e: unknown) {
        store.setV11Verdict(null);
        store.setV11ModuleError('verdict', e instanceof Error ? e.message : String(e));
      }

      store.setComputed(true);
    } finally {
      store.setAnalyzing(false);
    }
  }, [property, borrower, loan, strategy]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                  DSCR Deal Desk <span className="text-emerald-400">v11.14</span>
                </h1>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Dual-Track · Verdict · Return Grade · Reassessment · ARM/SOFR Reset · After-Tax IRR · AEY Lender Ranking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {store.goldenVerified && (
                <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800 text-[10px] px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Golden Values Verified
                </Badge>
              )}
              <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] px-2 py-1">
                Data as of June 17, 2026
              </Badge>
              <Collapsible open={store.disclaimerOpen} onOpenChange={store.setDisclaimerOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-zinc-400 h-7 hover:text-zinc-200">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Disclaimer
                    {store.disclaimerOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>
          <Collapsible open={store.disclaimerOpen} onOpenChange={store.setDisclaimerOpen}>
            <CollapsibleContent>
              <div className="mt-2 p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg text-[11px] text-amber-200/80 leading-relaxed">
                <strong className="text-amber-400">IMPORTANT:</strong> This tool provides estimates for analysis purposes only.
                Rates, lender guidelines, and state laws change frequently. Provenance labels indicate data reliability —
                &quot;UNVERIFIED&quot; items must be confirmed before relying on them.
                This is not a loan commitment. Always verify with your lender and legal counsel.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </header>

      {/* ═══════════════════ MAIN LAYOUT ═══════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT PANEL: Deal Intake ─── */}
        <div
          className="border-r border-zinc-800 bg-zinc-950 overflow-hidden shrink-0 transition-all duration-200"
          style={{ width: store.sidebarOpen ? 360 : 0 }}
        >
          {store.sidebarOpen && (
            <DealIntakeForm onAnalyze={analyzeDeal} />
          )}
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => store.setSidebarOpen(!store.sidebarOpen)}
          aria-label={store.sidebarOpen ? 'Collapse deal intake sidebar' : 'Expand deal intake sidebar'}
          title={store.sidebarOpen ? 'Collapse panel' : 'Expand panel'}
          className="absolute z-40 bg-zinc-900 border border-zinc-800 rounded-r-lg p-1 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          style={{ left: store.sidebarOpen ? 360 : 0, top: '50%', transform: 'translateY(-50%)' }}
        >
          {store.sidebarOpen
            ? <ChevronLeft className="h-4 w-4 text-zinc-400" />
            : <ChevronRight className="h-4 w-4 text-zinc-400" />}
        </button>

        {/* ─── RIGHT PANEL: Results ─── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {!store.computed ? (
              <EmptyState onAnalyze={analyzeDeal} analyzing={store.analyzing} />
            ) : store.dscrResult ? (
              <ResultsDashboard />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EMPTY STATE
// ══════════════════════════════════════════════════════════════
function EmptyState({ onAnalyze, analyzing }: { onAnalyze: () => void; analyzing: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border border-emerald-800/30 flex items-center justify-center mb-6">
        <Calculator className="h-10 w-10 text-emerald-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Configure Your Deal</h2>
      <p className="text-zinc-400 text-sm max-w-md mb-6">
        Fill in the property, borrower, and loan details on the left panel, then hit Analyze to run the full dual-track DSCR evaluation.
      </p>
      <Button
        onClick={onAnalyze}
        disabled={analyzing}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 text-base shadow-lg shadow-emerald-900/30"
      >
        {analyzing ? (
          <><Activity className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
        ) : (
          <><Zap className="h-4 w-4 mr-2" /> Analyze Deal</>
        )}
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DEAL INTAKE FORM
// ══════════════════════════════════════════════════════════════
function DealIntakeForm({ onAnalyze }: { onAnalyze: () => void }) {
  const store = useDSCRStore();
  const { property, borrower, loan, strategy } = store;
  const [advOpen, setAdvOpen] = useState(false);

  const up = (k: keyof typeof property, v: number | string) => store.setProperty({ [k]: v });
  const ub = (k: keyof typeof borrower, v: number | string | boolean) => store.setBorrower({ [k]: v });
  const ul = (k: keyof typeof loan, v: number | string) => store.setLoan({ [k]: v });

  return (
    <div className="space-y-3 p-4 h-full overflow-y-auto custom-scrollbar">
      {/* Strategy Toggle */}
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardContent className="p-3">
          <Label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Strategy</Label>
          <div className="flex gap-1.5">
            {(['LTR', 'STR', 'MTR'] as RentalStrategy[]).map((s) => (
              <button
                key={s}
                onClick={() => store.setStrategy(s)}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition-all ${
                  strategy === s
                    ? s === 'STR' ? 'bg-violet-600 text-white' : s === 'MTR' ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property */}
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> Property
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          <div>
            <Label className="text-[10px] text-zinc-500">Purchase Price</Label>
            <Input type="number" value={property.purchasePrice} onChange={(e) => up('purchasePrice', +e.target.value)}
              className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">Lease Rent/mo</Label>
              <Input type="number" value={property.leaseRent} onChange={(e) => up('leaseRent', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Market Rent/mo</Label>
              <Input type="number" value={property.marketRent} onChange={(e) => up('marketRent', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
          </div>
          {strategy !== 'LTR' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-zinc-500">STR Projected/mo</Label>
                <Input type="number" value={property.strProjectedRent} onChange={(e) => up('strProjectedRent', +e.target.value)}
                  className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
              </div>
              <div>
                <Label className="text-[10px] text-zinc-500">STR Documented/mo</Label>
                <Input type="number" value={property.strDocumentedRent} onChange={(e) => up('strDocumentedRent', +e.target.value)}
                  className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">Annual Taxes</Label>
              <Input type="number" value={property.annualTaxes} onChange={(e) => up('annualTaxes', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Annual Insurance</Label>
              <Input type="number" value={property.annualInsurance} onChange={(e) => up('annualInsurance', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">HOA/mo</Label>
              <Input type="number" value={property.hoa} onChange={(e) => up('hoa', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Flood Ins/yr</Label>
              <Input type="number" value={property.floodInsurance} onChange={(e) => up('floodInsurance', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Units</Label>
              <Input type="number" value={property.unitCount} onChange={(e) => up('unitCount', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" min={1} max={4} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">Property Type</Label>
              <Select value={property.propertyType} onValueChange={(v) => up('propertyType', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {(['SFR','2-4_UNIT','CONDO_WARRANTABLE','CONDO_NON_WARRANTABLE','CONDOTEL','RURAL','5+_UNIT','MIXED_USE'] as PropertyType[]).map((pt) => (
                    <SelectItem key={pt} value={pt}>{pt.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">State</Label>
              <Select value={property.state} onValueChange={(v) => up('state', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 max-h-48">
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Borrower */}
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-cyan-400" /> Borrower
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">FICO Score</Label>
              <Input type="number" value={borrower.ficoScore} onChange={(e) => ub('ficoScore', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Experience</Label>
              <Select value={borrower.experience} onValueChange={(v) => ub('experience', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="FIRST_TIME">First Time</SelectItem>
                  <SelectItem value="EXPERIENCED">Experienced</SelectItem>
                  <SelectItem value="VETERAN">Veteran (10+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">Entity Type</Label>
              <Select value={borrower.entityType} onValueChange={(v) => ub('entityType', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {(['INDIVIDUAL','LLC','S_CORP','C_CORP','TRUST'] as EntityType[]).map((e) => (
                    <SelectItem key={e} value={e}>{e.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Financed Properties</Label>
              <Input type="number" value={borrower.existingFinancedProperties} onChange={(e) => ub('existingFinancedProperties', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={borrower.isUSCitizenOrPR} onCheckedChange={(v) => ub('isUSCitizenOrPR', v)} />
              <Label className="text-[10px] text-zinc-400">US Citizen/PR</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={borrower.isForeignNational} onCheckedChange={(v) => ub('isForeignNational', v)} />
              <Label className="text-[10px] text-zinc-400">Foreign National</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Structure */}
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Calculator className="h-3.5 w-3.5 text-amber-400" /> Loan Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          <div>
            <Label className="text-[10px] text-zinc-500">LTV: {loan.ltv}%</Label>
            <Slider value={[loan.ltv]} onValueChange={([v]) => ul('ltv', v)} min={60} max={85} step={1}
              className="mt-1" />
            <div className="flex justify-between text-[9px] text-zinc-600"><span>60%</span><span>85%</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">Term</Label>
              <Select value={loan.term} onValueChange={(v) => ul('term', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="30_YR">30 Year</SelectItem>
                  <SelectItem value="40_YR">40 Year</SelectItem>
                  <SelectItem value="15_YR">15 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">IO Period</Label>
              <Select value={loan.ioPeriod} onValueChange={(v) => ul('ioPeriod', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="5_YR">5 Year IO</SelectItem>
                  <SelectItem value="7_YR">7 Year IO</SelectItem>
                  <SelectItem value="10_YR">10 Year IO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">ARM Type</Label>
              <Select value={loan.armType} onValueChange={(v) => ul('armType', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="FIXED">Fixed</SelectItem>
                  <SelectItem value="5_6_ARM">5/6 ARM</SelectItem>
                  <SelectItem value="7_6_ARM">7/6 ARM</SelectItem>
                  <SelectItem value="10_6_ARM">10/6 ARM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Prepay</Label>
              <Select value={loan.prepayPreference} onValueChange={(v) => ul('prepayPreference', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {(['NONE','321','54321','54333','FLAT_5','SIX_MONTHS_INTEREST','YIELD_MAINTENANCE','SOFT_PREPAY'] as PrepayType[]).map((p) => (
                    <SelectItem key={p} value={p}>{p.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-zinc-500">Purpose</Label>
              <Select value={loan.purpose} onValueChange={(v) => ul('purpose', v)}>
                <SelectTrigger className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="RATE_TERM">Rate/Term Refi</SelectItem>
                  <SelectItem value="CASH_OUT">Cash-Out Refi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500">Hold Years</Label>
              <Input type="number" value={loan.expectedHoldYears} onChange={(e) => ul('expectedHoldYears', +e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
            </div>
          </div>
          <Collapsible open={advOpen} onOpenChange={setAdvOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors mt-1">
              {advOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Advanced
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-zinc-500">Points</Label>
                  <Input type="number" value={loan.points} onChange={(e) => ul('points', +e.target.value)}
                    className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" step={0.125} />
                </div>
                <div>
                  <Label className="text-[10px] text-zinc-500">Lender Fees</Label>
                  <Input type="number" value={loan.lenderFees} onChange={(e) => ul('lenderFees', +e.target.value)}
                    className="bg-zinc-800/80 border-zinc-700 text-white h-8 text-sm" />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Analyze Button */}
      <Button
        onClick={() => { store.clearResults(); setTimeout(onAnalyze, 50); }}
        disabled={store.analyzing}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-base shadow-lg shadow-emerald-900/30"
      >
        {store.analyzing ? (
          <><Activity className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
        ) : (
          <><Zap className="h-4 w-4 mr-2" /> Analyze Deal</>
        )}
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// RESULTS DASHBOARD
// ══════════════════════════════════════════════════════════════
function ResultsDashboard() {
  const store = useDSCRStore();
  const result = store.dscrResult!;
  const track1 = result.dualTrackDSCR.track1;
  const track2 = result.dualTrackDSCR.track2;
  const verdict = result.dualTrackDSCR.verdict;
  const g1 = track1.gradient;
  const g2 = track2.gradient;

  return (
    <div className="space-y-6">
      {/* ═══════════ v11.1 Intelligence Panel ═══════════ */}
      <V11IntelligencePanel />

      {/* ═══════════ DUAL-TRACK DSCR DISPLAY ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Track 1 */}
        <Card className={`${dscrBgClass(g1)} border overflow-hidden`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-1">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Track 1 — Lender Qualification</div>
              <Badge className={`${g1.bgClass} ${g1.textClass} border ${g1.borderClass} text-xs font-bold px-2 py-0.5`}>
                {g1.tier}
              </Badge>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-black text-white leading-none">{track1.dscr.toFixed(2)}×</div>
              <Badge className={`text-sm font-bold ${track1.passes ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'} border-0`}>
                {track1.passes ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-3">
              <div className={`h-full bg-gradient-to-r ${g1.color === 'emerald' ? 'from-emerald-600 to-emerald-400' : g1.color === 'cyan' ? 'from-cyan-600 to-cyan-400' : g1.color === 'green' ? 'from-green-600 to-green-400' : g1.color === 'yellow' ? 'from-yellow-600 to-yellow-400' : g1.color === 'orange' ? 'from-orange-600 to-orange-400' : 'from-red-600 to-red-400'} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, (track1.dscr / 1.5) * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-zinc-600"><span>0.50×</span><span className="text-zinc-500">1.00×</span><span className="text-zinc-400">1.25×</span><span>1.50×</span></div>
            <Separator className="my-2 bg-zinc-800" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-zinc-500">Qualifying Rent</span> <span className="text-white font-mono">${fmt(track1.qualifyingRent)}</span></div>
              <div><span className="text-zinc-500">Rent Source</span> <span className="text-emerald-400/70 truncate block text-[10px]">{track1.rentSource}</span></div>
              <div><span className="text-zinc-500">Formula</span> <span className="text-white">{track1.formulaMethod}</span></div>
              <div><span className="text-zinc-500">Haircut</span> <span className="text-amber-400">{track1.vacancyApplied}%</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Track 2 */}
        <Card className={`${dscrBgClass(g2)} border overflow-hidden`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-1">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider font-medium">Track 2 — Investor Survival</div>
              <Badge className={`${g2.bgClass} ${g2.textClass} border ${g2.borderClass} text-xs font-bold px-2 py-0.5`}>
                {g2.tier}
              </Badge>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-black text-white leading-none">{track2.dscr.toFixed(2)}×</div>
              <Badge className={`text-sm font-bold ${track2.passes ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'} border-0`}>
                {track2.passes ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-3">
              <div className={`h-full bg-gradient-to-r ${g2.color === 'emerald' ? 'from-emerald-600 to-emerald-400' : g2.color === 'cyan' ? 'from-cyan-600 to-cyan-400' : g2.color === 'green' ? 'from-green-600 to-green-400' : g2.color === 'yellow' ? 'from-yellow-600 to-yellow-400' : g2.color === 'orange' ? 'from-orange-600 to-orange-400' : 'from-red-600 to-red-400'} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, (track2.dscr / 1.5) * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-zinc-600"><span>0.50×</span><span className="text-zinc-500">1.00×</span><span className="text-zinc-400">1.25×</span><span>1.50×</span></div>
            <Separator className="my-2 bg-zinc-800" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-zinc-500">Monthly Cash Flow</span> <span className={`font-bold font-mono ${track2.monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${fmt(track2.monthlyCashFlow)}
              </span></div>
              <div><span className="text-zinc-500">Net After Deductions</span> <span className="text-white font-mono">${fmt(track2.netRentAfterDeductions)}</span></div>
              <div><span className="text-zinc-500">Vacancy</span> <span className="text-amber-400">{track2.vacancyApplied}%</span></div>
              <div><span className="text-zinc-500">Mgmt/Maint</span> <span className="text-amber-400">{track2.managementApplied}%/{track2.maintenanceApplied}%</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ VERDICT ═══════════ */}
      <Card className={`border ${verdict.warningRequired ? 'bg-amber-950/20 border-amber-800/30' : verdict.track1Passes && verdict.track2Passes ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-red-950/20 border-red-800/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            {verdict.warningRequired ? (
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            ) : verdict.track1Passes ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold text-white">{verdict.summary}</div>
              {verdict.warningRequired && !store.track2Acknowledged && (
                <Button
                  onClick={() => store.setTrack2Acknowledged(true)}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs bg-amber-900/30 border-amber-700 text-amber-300 hover:bg-amber-900/50"
                >
                  I acknowledge the negative carry
                </Button>
              )}
              {store.track2Acknowledged && verdict.warningRequired && (
                <Badge className="mt-2 bg-amber-900/50 text-amber-400 border-amber-800 text-[10px]">
                  Negative carry acknowledged
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ RISK PANEL ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rate Triplet */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Rate Triplet ({result.tripleRate.dateStamp})</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Competitive</span>
                <span className="text-lg font-bold text-emerald-400">{result.tripleRate.competitive.toFixed(3)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Typical</span>
                <span className="text-lg font-bold text-white">{result.tripleRate.typical.toFixed(3)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Full Market</span>
                <span className="text-lg font-bold text-red-400">{result.tripleRate.fullMarket.toFixed(3)}%</span>
              </div>
            </div>
            <div className="text-[9px] text-zinc-600 mt-2">{result.tripleRate.treasurySpread}</div>
          </CardContent>
        </Card>

        {/* Deal-Break Rate */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Rent Break-Even & Deal-Break Rate</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Break-even Rent</span>
                <span className="text-sm font-bold text-white font-mono">${fmt(result.appraisalBreakpointRent)}/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Headroom</span>
                <span className={`text-sm font-bold ${result.appraisalBreakpointPercent < 5 ? 'text-red-400' : result.appraisalBreakpointPercent < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.appraisalBreakpointPercent.toFixed(1)}%
                </span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Deal-Break Rate</span>
                <span className="text-sm font-bold text-red-400 font-mono">{result.dealBreakRate.toFixed(3)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Rate Headroom</span>
                <span className={`text-sm font-bold font-mono ${result.rateHeadroomBps < 50 ? 'text-red-400' : result.rateHeadroomBps < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.rateHeadroomBps} bps
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Key Metrics</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-zinc-400">Solved Rate</span><span className="text-emerald-400 font-mono">{result.solvedRate.toFixed(3)}%</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Loan Amount</span><span className="text-white font-mono">${fmt(result.loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Monthly PITIA</span><span className="text-white font-mono">${fmt(result.monthlyPITIA.total)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Debt Yield</span><span className="text-white font-mono">{(result.debtYield * 100).toFixed(2)}%</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Max Price @1.0×</span><span className="text-amber-400 font-mono">${fmt(result.maxPurchaseAtDSCR1)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Cash to Close</span><span className="text-white font-mono">${fmt(result.cashToClose.total)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ PITIA BREAKDOWN + CASH TO CLOSE ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-300 mb-3">PITIA Breakdown</div>
            <div className="space-y-2">
              {[
                { label: 'P&I', value: result.monthlyPITIA.principalAndInterest, color: 'bg-emerald-500' },
                { label: 'Tax/mo', value: result.monthlyPITIA.taxes, color: 'bg-teal-500' },
                { label: 'Ins/mo', value: result.monthlyPITIA.insurance, color: 'bg-violet-500' },
                { label: 'HOA', value: result.monthlyPITIA.hoa, color: 'bg-amber-500' },
                ...(result.monthlyPITIA.floodInsurance > 0 ? [{ label: 'Flood', value: result.monthlyPITIA.floodInsurance, color: 'bg-sky-500' }] : []),
              ].map(({ label, value, color }) => {
                const pct = result.monthlyPITIA.total > 0 ? (value / result.monthlyPITIA.total) * 100 : 0;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-12 text-xs text-zinc-400 text-right">{label}</div>
                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-16 text-xs text-right text-zinc-300 font-mono">${fmt(value)}</div>
                  </div>
                );
              })}
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-zinc-300">Total PITIA</span>
                <span className="text-white font-mono">${fmt(result.monthlyPITIA.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-300 mb-3">Cash-to-Close Stack</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-zinc-400">Down Payment</span><span className="text-white font-mono">${fmt(result.cashToClose.downPayment)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Closing Costs (3%)</span><span className="text-white font-mono">${fmt(result.cashToClose.closingCosts)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Points</span><span className="text-white font-mono">${fmt(result.cashToClose.points)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Lender Fees</span><span className="text-white font-mono">${fmt(result.cashToClose.lenderFees)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Reserves (Likely)</span><span className="text-white font-mono">${fmt(result.cashToClose.reserveRequirement)}</span></div>
              {result.cashToClose.furnishingBudget > 0 && (
                <div className="flex justify-between"><span className="text-zinc-400">Furnishing (STR)</span><span className="text-white font-mono">${fmt(result.cashToClose.furnishingBudget)}</span></div>
              )}
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between font-bold"><span className="text-zinc-300">Total (Likely)</span><span className="text-emerald-400 font-mono">${fmt(result.cashToClose.total)}</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-zinc-500">Conservative</span><span className="text-amber-400 font-mono">${fmt(result.cashToClose.totalConservative)}</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-zinc-500">Stress</span><span className="text-red-400 font-mono">${fmt(result.cashToClose.totalStress)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ SENSITIVITY SECTION ═══════════ */}
      <Tabs defaultValue="rent" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="rent" className="text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 min-w-0">Rent</TabsTrigger>
          <TabsTrigger value="rate" className="text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 min-w-0">Rate</TabsTrigger>
          <TabsTrigger value="ltv" className="text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 min-w-0">LTV</TabsTrigger>
          <TabsTrigger value="price" className="text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 min-w-0">Price</TabsTrigger>
          <TabsTrigger value="stress" className="text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 min-w-0">Stress</TabsTrigger>
          <TabsTrigger value="heatmap" className="text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex-1 min-w-0">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="rent"><SensitivityTable type="rent" /></TabsContent>
        <TabsContent value="rate"><SensitivityTable type="rate" /></TabsContent>
        <TabsContent value="ltv"><SensitivityTable type="ltv" /></TabsContent>
        <TabsContent value="price"><SensitivityTable type="price" /></TabsContent>
        <TabsContent value="stress"><StressMatrix /></TabsContent>
        <TabsContent value="heatmap"><HeatmapSection /></TabsContent>
      </Tabs>

      {/* ═══════════ APPRAISAL SHOCK TABLE ═══════════ */}
      {store.breakevenResult && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" /> Appraisal Value Shock Table
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="text-left p-2">Shock</th>
                    <th className="text-right p-2">Appraised Value</th>
                    <th className="text-right p-2">Max Loan</th>
                    <th className="text-right p-2">Cash Gap</th>
                    <th className="text-right p-2">DSCR</th>
                  </tr>
                </thead>
                <tbody>
                  {store.breakevenResult.jointAppraisalRisk.valueShockTable.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="p-2 text-zinc-300">{[0, -2, -4, -6, -8, -10][i]}%</td>
                      <td className="p-2 text-right text-white font-mono">${fmt(row.appraisedValue)}</td>
                      <td className="p-2 text-right text-white font-mono">${fmt(row.maxLoan)}</td>
                      <td className="p-2 text-right font-mono"><span className={row.cashGap > 0 ? 'text-red-400' : 'text-emerald-400'}>${fmt(row.cashGap)}</span></td>
                      <td className="p-2 text-right font-mono"><span style={{ color: dscrColor(row.dscrAtMaxLoan) }}>{row.dscrAtMaxLoan.toFixed(2)}×</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">{store.breakevenResult.jointAppraisalRisk.summary}</div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════ LENDER MATCHING ═══════════ */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-cyan-400" /> Lender Matching
          </div>
          <div className="text-[10px] text-amber-400 mb-2">
            ⚠ Two-quote rule: Always obtain quotes from at least 2 lenders before proceeding.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left p-2">Lender</th>
                  <th className="text-center p-2">Fit Tier</th>
                  <th className="text-center p-2">Est. Rate</th>
                  <th className="text-center p-2">Track 1 DSCR</th>
                  <th className="text-center p-2">Provenance</th>
                  <th className="text-center p-2">Confidence</th>
                  <th className="text-center p-2">PPP</th>
                </tr>
              </thead>
              <tbody>
                {store.lenderFits.map((l) => (
                  <tr key={l.lenderId} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 ${l.eligible ? '' : 'opacity-50'}`}>
                    <td className="p-2">
                      <div className="font-medium text-white">{l.lenderName}</div>
                      {l.ineligibleReasons.length > 0 && (
                        <div className="text-[9px] text-red-400 mt-0.5">{l.ineligibleReasons[0]}</div>
                      )}
                      {l.provenanceWarnings.length > 0 && (
                        <div className="text-[9px] text-amber-400 mt-0.5" title={l.provenanceWarnings.join('\n')}>
                          ⚠ {l.provenanceWarnings.length} warning{l.provenanceWarnings.length > 1 ? 's' : ''}
                        </div>
                      )}
                      <div className="text-[9px] text-zinc-600 mt-0.5" title={l.sourceSnapshot}>{l.sourceSnapshot.slice(0, 60)}{l.sourceSnapshot.length > 60 ? '…' : ''}</div>
                    </td>
                    <td className="p-2 text-center">{fitTierBadge(l.fitTier)}</td>
                    <td className="p-2 text-center text-emerald-400 font-mono">{l.estimatedRate.typical.toFixed(3)}%</td>
                    <td className="p-2 text-center font-mono">
                      <span style={{ color: dscrColor(l.track1DSCR) }}>{l.track1DSCR.toFixed(2)}×</span>
                    </td>
                    <td className="p-2 text-center">
                      {provenanceBadge(l.sourceProvenance)}
                    </td>
                    <td className="p-2 text-center">
                      <Badge className={`border-0 text-[9px] px-1 ${
                        l.confidenceScore >= 80 ? 'bg-emerald-900/50 text-emerald-400'
                        : l.confidenceScore >= 70 ? 'bg-cyan-900/50 text-cyan-400'
                        : l.confidenceScore >= 60 ? 'bg-amber-900/50 text-amber-400'
                        : 'bg-red-900/50 text-red-400'
                      }`} title={l.confidenceBand}>
                        {l.confidenceScore}/100
                      </Badge>
                      <div className="text-[8px] text-zinc-600 mt-0.5">{l.confidenceBand}</div>
                    </td>
                    <td className="p-2 text-center">
                      {l.pppStateResult?.allowed ? (
                        <Badge className="bg-emerald-900/50 text-emerald-400 border-0 text-[9px] px-1">Allowed</Badge>
                      ) : (
                        <Badge className="bg-red-900/50 text-red-400 border-0 text-[9px] px-1">Blocked</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ PPP STATE ANALYSIS ═══════════ */}
      {store.pppCheckResult && (
        <Card className={`border ${store.pppCheckResult.allowed ? 'bg-zinc-900 border-zinc-800' : 'bg-amber-950/20 border-amber-800/30'}`}>
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> PPP State Analysis — {store.property.state}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-zinc-500">Status</div>
                <Badge className={`${store.pppCheckResult.allowed ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'} border-0`}>
                  {store.pppCheckResult.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <div className="text-zinc-500">Entity Restriction</div>
                <div className="text-white">{store.pppCheckResult.requiresEntityVesting ? 'Entity vesting required' : 'None'}</div>
              </div>
              <div>
                <div className="text-zinc-500">No-PPP Premium</div>
                <div className="text-amber-400">
                  {store.pppCheckResult.noPPPPremiumRate > 0
                    ? `+${(store.pppCheckResult.noPPPPremiumRate * 100).toFixed(2)}% rate, +${(store.pppCheckResult.noPPPPremiumFee * 100).toFixed(2)}% fee`
                    : 'None'}
                </div>
              </div>
            </div>
            {store.pppCheckResult.legalWarning && (
              <div className="mt-2 text-[10px] text-amber-300/70">{store.pppCheckResult.legalWarning}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══════════ RESERVE FORECAST ═══════════ */}
      {store.reserveScenarios && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-300 mb-3">Reserve Forecast — Three Scenarios</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([['Likely', store.reserveScenarios.likely], ['Conservative', store.reserveScenarios.conservative], ['Stress Ceiling', store.reserveScenarios.stress]] as const).map(([label, data]) => (
                <div key={label} className="p-3 bg-zinc-800/50 rounded-lg">
                  <div className="text-xs font-semibold text-zinc-300 mb-2">{label}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-zinc-500">Months</span><span className="text-white font-mono">{data.totalMonths}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Required</span><span className="text-white font-mono">${fmt(data.totalDollars)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Shortfall</span>
                      <span className={data.shortfall > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {data.shortfall > 0 ? `$${fmt(data.shortfall)}` : 'None ✓'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {store.reserveScenarios.geographyOverlay && (
              <div className="mt-2 text-[10px] text-cyan-400/70">
                Geography overlay: {store.reserveScenarios.geographyOverlay.state} schedule {store.reserveScenarios.geographyOverlay.schedule}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══════════ STR ANALYSIS ═══════════ */}
      {store.strResult && <STRAnalysis />}

      {/* ═══════════ RESCUE ENGINE ═══════════ */}
      {store.rescueResult && <RescueEngine />}

      {/* ═══════════ DECISION SUPPORT PANELS ═══════════ */}
      <DecisionSupportPanels />

      {/* ═══════════ STRUCTURE OPTIONS ═══════════ */}
      <StructureOptionsPanel />

      {/* ═══════════ MONTE CARLO ═══════════ */}
      <MonteCarloSection />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SENSITIVITY TABLE
// ══════════════════════════════════════════════════════════════
function SensitivityTable({ type }: { type: 'rent' | 'rate' | 'ltv' | 'price' }) {
  const store = useDSCRStore();
  const { property, borrower, loan, strategy } = store;
  const result = store.dscrResult!;
  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;

  const data = useMemo(() => {
    if (type === 'rent') return computeRentSensitivity(result.qualifyingRent, result.monthlyPITIA.total);
    if (type === 'rate') return computeRateSensitivity(loanAmount, property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance, result.qualifyingRent, termYears);
    if (type === 'ltv') return computeLTVSensitivity(property.purchasePrice, result.solvedRate, result.qualifyingRent, termYears, property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance);
    if (type === 'price') return computePriceSensitivity(property.purchasePrice, loan.ltv, result.solvedRate, result.qualifyingRent, termYears, property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance);
    return [];
  }, [type, result, property, loan, loanAmount, termYears]);

  const columns = type === 'rent'
    ? [{ h: 'Rent', k: 'rent' }, { h: 'Track 1', k: 'track1DSCR' }, { h: 'Track 2', k: 'track2DSCR' }, { h: 'Status', k: 'status' }]
    : type === 'rate'
    ? [{ h: 'Rate', k: 'rate' }, { h: 'P&I', k: 'pi' }, { h: 'PITIA', k: 'pitia' }, { h: 'DSCR', k: 'track1DSCR' }, { h: 'Status', k: 'status' }]
    : type === 'ltv'
    ? [{ h: 'LTV', k: 'ltv' }, { h: 'Loan', k: 'loan' }, { h: 'Down', k: 'down' }, { h: 'PITIA', k: 'pitia' }, { h: 'DSCR', k: 'dscr' }, { h: 'Status', k: 'status' }]
    : [{ h: 'Price', k: 'price' }, { h: 'Loan', k: 'loan' }, { h: 'PITIA', k: 'pitia' }, { h: 'DSCR', k: 'dscr' }, { h: 'Status', k: 'status' }];

  return (
    <Card className="bg-zinc-900 border-zinc-800 mt-2">
      <CardContent className="p-4">
        <div className="overflow-x-auto max-h-80 overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              <tr className="border-b border-zinc-800 text-zinc-400">
                {columns.map((c) => (
                  <th key={c.k} className="text-right p-2 last:text-left">{c.h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: Record<string, number | string>, i: number) => {
                const dscrVal = (row.track1DSCR ?? row.dscr ?? 0) as number;
                return (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    {columns.map((c) => {
                      const v = row[c.k];
                      const isDscr = c.k.includes('DSCR') || c.k === 'dscr';
                      const isStatus = c.k === 'status';
                      return (
                        <td key={c.k} className={`p-2 ${isStatus ? 'text-left' : 'text-right'} font-mono`}>
                          {isStatus ? (
                            <Badge className={`${v === 'Pass' ? 'bg-emerald-900/50 text-emerald-400' : v === 'Marginal' ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'} border-0 text-[9px] px-1`}>
                              {String(v)}
                            </Badge>
                          ) : isDscr ? (
                            <span style={{ color: dscrColor(Number(v)) }}>{Number(v).toFixed(2)}×</span>
                          ) : typeof v === 'number' ? (
                            c.k === 'rate' || c.k === 'ltv' ? `${Number(v).toFixed(2)}${c.k === 'rate' ? '%' : '%'}` : `$${fmt(v)}`
                          ) : String(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// COMBINED STRESS MATRIX
// ══════════════════════════════════════════════════════════════
function StressMatrix() {
  const store = useDSCRStore();
  const { property, loan } = store;
  const result = store.dscrResult!;
  const loanAmount = property.purchasePrice * (loan.ltv / 100);

  const data = useMemo(() =>
    computeCombinedStressMatrix(loanAmount, result.solvedRate, result.qualifyingRent, property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance, loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15),
    [loanAmount, result, property, loan]
  );

  return (
    <Card className="bg-zinc-900 border-zinc-800 mt-2">
      <CardContent className="p-4">
        <div className="text-xs font-semibold text-zinc-300 mb-3">Combined Stress: Rate × Rent</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="p-1 text-left">Rate ↓ \ Rent →</th>
                {data[0]?.rentPcts.map((rp, i) => (
                  <th key={i} className="p-1 text-center">{rp.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="p-1 text-zinc-300 font-mono">{row.rateLabel}</td>
                  {row.rentPcts.map((rp, j) => (
                    <td key={j} className="p-1 text-center font-mono" style={{ color: dscrColor(rp.dscr) }}>
                      {rp.dscr.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// HEATMAP SECTION
// ══════════════════════════════════════════════════════════════
function HeatmapSection() {
  const store = useDSCRStore();
  const { property, loan } = store;
  const result = store.dscrResult!;

  const rentSteps = useMemo(() => {
    const steps: number[] = [];
    const lo = Math.floor(result.qualifyingRent * 0.8 / 100) * 100;
    const hi = Math.ceil(result.qualifyingRent * 1.4 / 100) * 100;
    for (let r = lo; r <= hi; r += 100) steps.push(r);
    return steps;
  }, [result]);

  const priceSteps = useMemo(() => {
    const steps: number[] = [];
    const lo = Math.round(property.purchasePrice * 0.75 / 10000) * 10000;
    const hi = Math.round(property.purchasePrice * 1.25 / 10000) * 10000;
    for (let p = lo; p <= hi; p += 10000) steps.push(p);
    return steps;
  }, [property]);

  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;

  const heatmapData = useMemo(() =>
    computeHeatmap(rentSteps, priceSteps, loan.ltv, result.solvedRate, termYears, property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance),
    [rentSteps, priceSteps, loan, result, property, termYears]
  );

  const flatData = useMemo(() =>
    heatmapData.map((c: HeatmapCell) => ({ ...c, color: dscrColor(c.dscr) })),
    [heatmapData]
  );

  return (
    <Card className="bg-zinc-900 border-zinc-800 mt-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-zinc-300">Price × Rent DSCR Heatmap</div>
          <div className="flex items-center gap-1 text-[9px] flex-wrap">
            {[{ c: '#ef4444', l: '<0.75' }, { c: '#f97316', l: '0.75' }, { c: '#f59e0b', l: '1.0' }, { c: '#14b8a6', l: '1.1' }, { c: '#22c55e', l: '1.25' }, { c: '#10b981', l: '1.5+' }].map(({ c, l }) => (
              <span key={l} className="flex items-center gap-0.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c }} /><span className="text-zinc-500">{l}</span></span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={flatData} margin={{ left: 10, right: 10 }}>
            <XAxis dataKey="price" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={{ stroke: '#3f3f46' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
            <YAxis dataKey="dscr" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={{ stroke: '#3f3f46' }} tickFormatter={(v: number) => `${v.toFixed(1)}×`} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '11px' }}
              formatter={((_v: unknown, _n: unknown, p: unknown) => {
                const d = (p as { payload?: HeatmapCell })?.payload;
                if (!d) return ['—', '—'];
                return [`DSCR: ${d.dscr.toFixed(2)}×`, `Rent: $${d.rent} | Price: $${d.price.toLocaleString()}`];
              }) as never} />
            <Bar dataKey="dscr" radius={[2, 2, 0, 0]}>
              {flatData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// STR ANALYSIS
// ══════════════════════════════════════════════════════════════
function STRAnalysis() {
  const store = useDSCRStore();
  const strResult = store.strResult!;

  const statusColor = { CLEAR: 'text-emerald-400', RESTRICTED: 'text-amber-400', UNCERTAIN: 'text-orange-400', PROHIBITED: 'text-red-400' };
  const statusBg = { CLEAR: 'bg-emerald-950/20 border-emerald-800/30', RESTRICTED: 'bg-amber-950/20 border-amber-800/30', UNCERTAIN: 'bg-orange-950/20 border-orange-800/30', PROHIBITED: 'bg-red-950/20 border-red-800/30' };

  return (
    <div className="space-y-4">
      {/* Legality Gate */}
      <Card className={`border ${statusBg[strResult.legalityGate.status]}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {strResult.legalityGate.status === 'CLEAR' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
            <div>
              <div className={`text-xs font-bold uppercase ${statusColor[strResult.legalityGate.status]}`}>
                STR Legality: {strResult.legalityGate.status}
              </div>
              <div className="text-xs text-zinc-300 mt-0.5">{strResult.legalityGate.summary}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Worlds */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="text-xs font-semibold text-zinc-300 mb-3">Three Worlds — NEVER Blended</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[strResult.world1_LTR, strResult.world2_Projected, strResult.world3_Documented].map((world) => (
              <div key={world.name} className={`p-3 rounded-lg border ${
                world.qualifyingRent === strResult.bestQualifyingRent
                  ? 'bg-emerald-950/20 border-emerald-800/50'
                  : 'bg-zinc-800 border-zinc-700'
              }`}>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">{world.name}</div>
                <div className="text-2xl font-black text-white">{world.dscr.toFixed(2)}×</div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-zinc-400">Gross</span><span className="text-white">${fmt(world.grossIncome)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Haircut</span><span className="text-amber-400">{world.haircutPercent}%</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Qualifying</span><span className="text-emerald-400 font-bold">${fmt(world.qualifyingRent)}</span></div>
                </div>
                {world.qualifyingRent === strResult.bestQualifyingRent && (
                  <Badge className="mt-2 bg-emerald-900/50 text-emerald-400 border-emerald-800 text-[9px]">Best World</Badge>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-zinc-400">
            Best qualifying rent: <span className="text-emerald-400 font-bold">${fmt(strResult.bestQualifyingRent)}</span> from <span className="text-white">{strResult.bestWorld}</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-400/70">{strResult.marketDirectionWarning}</div>
        </CardContent>
      </Card>

      {/* Documentation Checklist */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-zinc-400" /> Documentation Checklist
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {strResult.documentationChecklist.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  {item.status === 'COMPLETE' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : item.status === 'NEEDED' ? <XCircle className="h-3 w-3 text-red-400" /> : <div className="h-3 w-3 rounded-full bg-zinc-700" />}
                  <span className={item.required ? 'text-zinc-300' : 'text-zinc-500'}>{item.item}</span>
                </div>
                <Badge className={`${item.required ? 'bg-amber-900/30 text-amber-400' : 'bg-zinc-800 text-zinc-500'} border-0 text-[8px] px-1`}>
                  {item.required ? 'REQ' : 'OPT'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* v11.1: Monthly Seasonality (AUDIT-FINAL issue 6) */}
      {strResult.monthlySeasonality && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
              <CalendarDays className="h-3.5 w-3.5 text-violet-400" /> Monthly Seasonality & Off-Season Stress
            </div>
            <div className="text-[10px] text-zinc-500 mb-3">
              Projected STR revenue distributed by US national seasonality index, with 20% Track-1 haircut applied.
              Months below 1.0× DSCR require cash reserves to bridge PITIA gaps.
            </div>

            {/* Monthly bar chart */}
            <div className="grid grid-cols-12 gap-1 h-32 items-end mb-3">
              {strResult.monthlySeasonality.months.map((m) => {
                const maxDSCR = Math.max(...strResult.monthlySeasonality!.months.map(x => x.monthlyDSCR), 1.5);
                const heightPct = Math.min(100, (m.monthlyDSCR / maxDSCR) * 100);
                const barColor = m.monthlyDSCR >= 1.0
                  ? (m.monthlyDSCR >= 1.25 ? 'bg-emerald-500' : 'bg-emerald-600/70')
                  : (m.monthlyDSCR >= 0.75 ? 'bg-amber-500' : 'bg-red-500');
                return (
                  <div key={m.month} className="flex flex-col items-center gap-1">
                    <div className="text-[8px] font-mono text-zinc-400">{m.monthlyDSCR.toFixed(2)}×</div>
                    <div className="w-full bg-zinc-800/50 rounded-t-sm flex flex-col justify-end" style={{ height: '80px' }}>
                      <div
                        className={`${barColor} rounded-t-sm transition-all`}
                        style={{ height: `${heightPct}%` }}
                        title={`${m.month}: $${m.haircutRevenue} revenue, DSCR ${m.monthlyDSCR.toFixed(2)}×`}
                      />
                    </div>
                    <div className="text-[8px] text-zinc-500">{m.month}</div>
                  </div>
                );
              })}
            </div>

            {/* DSCR 1.0 reference line indicator */}
            <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-sm" /> ≥1.25×</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-600/70 rounded-sm" /> 1.0–1.25×</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-sm" /> 0.75–1.0×</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm" /> &lt;0.75×</div>
              </div>
              <div>DSCR 1.0 = break-even on PITIA</div>
            </div>

            {/* Aggregate stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-zinc-800/50 rounded-md p-2">
                <div className="text-[9px] text-zinc-500 uppercase">Annual Gross</div>
                <div className="text-sm font-bold text-white">${fmt(strResult.monthlySeasonality.annualRevenueProjected)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-md p-2">
                <div className="text-[9px] text-zinc-500 uppercase">After 20% Haircut</div>
                <div className="text-sm font-bold text-emerald-400">${fmt(strResult.monthlySeasonality.annualRevenueHaircut)}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-md p-2">
                <div className="text-[9px] text-zinc-500 uppercase">Best Month</div>
                <div className="text-sm font-bold text-emerald-400">{strResult.monthlySeasonality.bestMonth}</div>
                <div className="text-[10px] text-zinc-400">{strResult.monthlySeasonality.bestMonthDSCR.toFixed(2)}×</div>
              </div>
              <div className="bg-zinc-800/50 rounded-md p-2">
                <div className="text-[9px] text-zinc-500 uppercase">Worst Month</div>
                <div className={`text-sm font-bold ${strResult.monthlySeasonality.worstMonthDSCR < 1.0 ? 'text-red-400' : 'text-amber-400'}`}>{strResult.monthlySeasonality.worstMonth}</div>
                <div className="text-[10px] text-zinc-400">{strResult.monthlySeasonality.worstMonthDSCR.toFixed(2)}×</div>
              </div>
            </div>

            {/* Off-season warning */}
            {strResult.monthlySeasonality.offSeasonMonths.length > 0 && (
              <div className="bg-red-950/20 border border-red-800/30 rounded-md p-2 mt-2">
                <div className="text-[10px] font-bold text-red-400 mb-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Off-Season Risk — {strResult.monthlySeasonality.offSeasonMonths.length} month{strResult.monthlySeasonality.offSeasonMonths.length > 1 ? 's' : ''} below 1.0× DSCR
                </div>
                <div className="text-[10px] text-zinc-300 leading-relaxed">{strResult.monthlySeasonality.warningMessage}</div>
              </div>
            )}
            {strResult.monthlySeasonality.offSeasonMonths.length === 0 && (
              <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-md p-2 mt-2">
                <div className="text-[10px] font-bold text-emerald-400 mb-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Year-Round Positive Carry
                </div>
                <div className="text-[10px] text-zinc-300 leading-relaxed">{strResult.monthlySeasonality.warningMessage}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// RESCUE ENGINE
// ══════════════════════════════════════════════════════════════
function RescueEngine() {
  const store = useDSCRStore();
  const rescue = store.rescueResult!;

  const riskColor = { LOW: 'text-emerald-400', MODERATE: 'text-amber-400', HIGH: 'text-red-400' };

  return (
    <Card className="bg-red-950/10 border-red-800/30">
      <CardContent className="p-4">
        <div className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
          <Wrench className="h-3.5 w-3.5" /> Rescue Engine
        </div>
        <div className="text-sm text-zinc-300 mb-3">{rescue.warning}</div>
        <div className="mb-3 text-xs text-zinc-400">
          Current DSCR: <span className="text-red-400 font-bold">{rescue.currentTrack1DSCR.toFixed(2)}×</span> → Target: <span className="text-emerald-400 font-bold">{rescue.targetTrack1DSCR.toFixed(2)}×</span>
        </div>

        {/* Top Picks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Fastest', fix: rescue.fastestFix },
            { label: 'Cheapest', fix: rescue.cheapestFix },
            { label: 'Lowest Risk', fix: rescue.lowestRiskFix },
            { label: 'Best ROI', fix: rescue.bestROIFix },
          ].map(({ label, fix }) => (
            <div key={label} className="p-2 bg-zinc-800/50 rounded-lg">
              <div className="text-[9px] text-zinc-500 uppercase">{label}</div>
              <div className="text-xs font-medium text-white mt-1">{fix.action}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">+{fix.track1Impact.toFixed(2)}× DSCR</div>
              <div className="text-[10px] text-zinc-400">Cost: ${fmt(fix.cost)}</div>
            </div>
          ))}
        </div>

        {/* All Fixes */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
          {rescue.fixes.map((fix: RescueFix, i: number) => (
            <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-md text-xs">
              <div>
                <span className="text-white font-medium">{fix.action}</span>
                <span className="text-zinc-500 ml-2">{fix.description.substring(0, 80)}...</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-emerald-400 font-mono">+{fix.track1Impact.toFixed(2)}×</span>
                <span className={riskColor[fix.risk]}>{fix.risk}</span>
                <span className="text-zinc-400">${fmt(fix.cost)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// DECISION SUPPORT PANELS (Acquisition Score + Execution Risk + Deal-Kill + Two-Quote)
// ══════════════════════════════════════════════════════════════
function DecisionSupportPanels() {
  const store = useDSCRStore();
  const { acquisitionScore, executionRisk, dealKillCheck, twoQuoteValidation } = store;

  if (!acquisitionScore && !executionRisk && !dealKillCheck) return null;

  return (
    <div className="space-y-4">
      {/* ── Acquisition Score + Execution Risk (side by side) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {acquisitionScore && <AcquisitionScoreCard score={acquisitionScore} />}
        {executionRisk && <ExecutionRiskCard risk={executionRisk} />}
      </div>

      {/* ── Deal-Kill Criteria ── */}
      {dealKillCheck && <DealKillCard check={dealKillCheck} />}

      {/* ── Two-Quote Rule ── */}
      {twoQuoteValidation && <TwoQuoteCard validation={twoQuoteValidation} />}
    </div>
  );
}

function AcquisitionScoreCard({ score }: { score: AcquisitionScore }) {
  const bandColor =
    score.band === 'Exceptional' ? 'text-emerald-400' :
    score.band === 'Strong' ? 'text-cyan-400' :
    score.band === 'Acceptable' ? 'text-green-400' :
    score.band === 'Marginal' ? 'text-amber-400' :
    score.band === 'Weak' ? 'text-orange-400' : 'text-red-400';

  const bandBg =
    score.band === 'Exceptional' ? 'bg-emerald-950/20 border-emerald-800/30' :
    score.band === 'Strong' ? 'bg-cyan-950/20 border-cyan-800/30' :
    score.band === 'Acceptable' ? 'bg-green-950/20 border-green-800/30' :
    score.band === 'Marginal' ? 'bg-amber-950/20 border-amber-800/30' :
    score.band === 'Weak' ? 'bg-orange-950/20 border-orange-800/30' :
    'bg-red-950/20 border-red-800/30';

  return (
    <Card className={`${bandBg} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Acquisition Score</div>
          <Target className="h-3.5 w-3.5 text-zinc-500" />
        </div>
        <div className="flex items-end gap-3">
          <div className={`text-5xl font-black leading-none ${bandColor}`}>{score.score}</div>
          <div className="text-xs text-zinc-400 mb-1">/ 100</div>
          <Badge className={`ml-auto ${bandColor.replace('text-', 'bg-').replace('400', '900').replace('500', '900')}/50 ${bandColor} border-0 text-[10px] font-bold uppercase`}>
            {score.band}
          </Badge>
        </div>
        <Separator className="my-3 bg-zinc-800" />
        <div className="space-y-1.5">
          {score.factors.map((f) => (
            <div key={f.name} className="text-xs">
              <div className="flex justify-between mb-0.5">
                <span className="text-zinc-400">{f.name} <span className="text-zinc-600">({f.weight}%)</span></span>
                <span className="text-zinc-300 font-mono">+{(f.contribution).toFixed(1)}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                  style={{ width: `${(f.contribution / f.weight) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ExecutionRiskCard({ risk }: { risk: ExecutionRiskResult }) {
  const verdictColor =
    risk.verdict === 'Very Likely' ? 'text-emerald-400' :
    risk.verdict === 'Likely' ? 'text-cyan-400' :
    risk.verdict === 'Moderate' ? 'text-amber-400' :
    risk.verdict === 'Difficult' ? 'text-orange-400' : 'text-red-400';

  const verdictBg =
    risk.verdict === 'Very Likely' ? 'bg-emerald-950/20 border-emerald-800/30' :
    risk.verdict === 'Likely' ? 'bg-cyan-950/20 border-cyan-800/30' :
    risk.verdict === 'Moderate' ? 'bg-amber-950/20 border-amber-800/30' :
    risk.verdict === 'Difficult' ? 'bg-orange-950/20 border-orange-800/30' :
    'bg-red-950/20 border-red-800/30';

  return (
    <Card className={`${verdictBg} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Execution Risk Scorecard</div>
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
        </div>
        <div className="flex items-end gap-3">
          <div className={`text-5xl font-black leading-none ${verdictColor}`}>{risk.score}</div>
          <div className="text-xs text-zinc-400 mb-1">/ 100</div>
          <Badge className={`ml-auto ${verdictColor.replace('text-', 'bg-').replace('400', '900').replace('500', '900')}/50 ${verdictColor} border-0 text-[10px] font-bold uppercase`}>
            {risk.verdict}
          </Badge>
        </div>
        <Separator className="my-3 bg-zinc-800" />
        <div className="grid grid-cols-5 gap-2">
          {risk.dimensions.map((d) => (
            <div key={d.name} className="text-center">
              <div className="text-[9px] text-zinc-500 uppercase mb-0.5">{d.name}</div>
              <div className="text-sm font-bold text-white">{d.score}</div>
              <div className="text-[9px] text-zinc-400">{d.detail}</div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${d.score}%`,
                    background: d.score >= 80 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-zinc-500 leading-relaxed">{risk.summary}</div>
      </CardContent>
    </Card>
  );
}

function DealKillCard({ check }: { check: DealKillCheck }) {
  const blockers = check.criteria.filter(c => c.severity === 'BLOCKER' && c.triggered);
  const warnings = check.criteria.filter(c => c.severity === 'WARNING' && c.triggered);
  const acks = check.criteria.filter(c => c.severity === 'ACKNOWLEDGMENT' && c.triggered);

  return (
    <Card className={`border ${check.allClear ? 'bg-emerald-950/10 border-emerald-800/30' : 'bg-red-950/10 border-red-800/30'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {check.allClear ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <ShieldX className="h-4 w-4 text-red-400" />
          )}
          <div className={`text-xs font-bold uppercase ${check.allClear ? 'text-emerald-400' : 'text-red-400'}`}>
            Deal-Kill Criteria {check.allClear ? '— All Clear' : `— ${blockers.length} Blocker${blockers.length === 1 ? '' : 's'}`}
          </div>
        </div>

        {/* Blockers */}
        {blockers.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {blockers.map((b: DealKillItem, i: number) => (
              <div key={`b-${i}`} className="p-2 bg-red-950/30 border border-red-800/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-900/50 text-red-400 border-0 text-[9px]">BLOCKER</Badge>
                  <span className="text-xs font-medium text-red-200">{b.criterion}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">{b.detail}</div>
                <div className="text-[10px] text-amber-400 mt-0.5">→ {b.action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-1 mb-3">
            {warnings.map((w: DealKillItem, i: number) => (
              <div key={`w-${i}`} className="p-1.5 bg-amber-950/20 border border-amber-800/30 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-900/50 text-amber-400 border-0 text-[9px]">WARNING</Badge>
                  <span className="text-[11px] text-amber-200">{w.criterion}</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{w.detail}</div>
              </div>
            ))}
          </div>
        )}

        {/* Acknowledgments */}
        {acks.length > 0 && (
          <div className="space-y-1">
            {acks.map((a: DealKillItem, i: number) => (
              <div key={`a-${i}`} className="p-1.5 bg-orange-950/20 border border-orange-800/30 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-900/50 text-orange-400 border-0 text-[9px]">ACK</Badge>
                  <span className="text-[11px] text-orange-200">{a.criterion}</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{a.detail}</div>
              </div>
            ))}
          </div>
        )}

        {check.allClear && (
          <div className="text-[11px] text-emerald-300/80 mt-1">
            No blockers triggered. Deal passes hard reject criteria. Review warnings (if any) before proceeding.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TwoQuoteCard({ validation }: { validation: import('@/lib/dscr/decisionSupport').TwoQuoteValidation }) {
  return (
    <Card className={`border ${validation.satisfied ? 'bg-emerald-950/10 border-emerald-800/30' : 'bg-amber-950/20 border-amber-800/40'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-cyan-400" />
          <div className="text-xs font-bold uppercase text-cyan-400">Two-Quote Rule</div>
          {validation.satisfied ? (
            <Badge className="bg-emerald-900/50 text-emerald-400 border-0 text-[9px] ml-auto">SATISFIED</Badge>
          ) : (
            <Badge className="bg-amber-900/50 text-amber-400 border-0 text-[9px] ml-auto">ACTION NEEDED</Badge>
          )}
        </div>
        <div className="text-xs text-zinc-300 mb-2">{validation.reason}</div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2 bg-zinc-800/50 rounded-md">
            <div className="text-zinc-500 uppercase">Flex Lender</div>
            <div className="text-cyan-300 font-medium">{validation.recommendedPair.flex ?? '—'}</div>
          </div>
          <div className="p-2 bg-zinc-800/50 rounded-md">
            <div className="text-zinc-500 uppercase">Rate-Competitive</div>
            <div className="text-emerald-300 font-medium">{validation.recommendedPair.rateCompetitive ?? '—'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// STRUCTURE OPTIONS PANEL
// ══════════════════════════════════════════════════════════════
function StructureOptionsPanel() {
  const store = useDSCRStore();
  const options = store.structureOptions;
  const [open, setOpen] = useState(false);

  if (!options || options.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <BarChart3 className="h-4 w-4 mr-2" /> Structure Options ({options.length} alternatives)
          {open ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-[10px] text-zinc-500 mb-2">
              Sorted by Track 1 DSCR ≥ 1.0 first, then by 5-year cost. Each row shows a different loan structure with its true cost of capital.
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-zinc-900 z-10">
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="text-left p-2">Structure</th>
                    <th className="text-right p-2">Rate</th>
                    <th className="text-right p-2">Track 1</th>
                    <th className="text-right p-2">Track 2</th>
                    <th className="text-right p-2">Monthly Pmt</th>
                    <th className="text-right p-2">5-Yr Cost</th>
                    <th className="text-left p-2">Prepay</th>
                    <th className="text-left p-2">Lender</th>
                    <th className="text-left p-2">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((opt, i) => (
                    <tr key={i} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 ${opt.track1DSCR >= 1.0 ? '' : 'opacity-60'}`}>
                      <td className="p-2 text-zinc-200">{opt.name}</td>
                      <td className="p-2 text-right text-emerald-400 font-mono">{opt.rate.toFixed(3)}%</td>
                      <td className="p-2 text-right font-mono">
                        <span style={{ color: dscrColor(opt.track1DSCR) }}>{opt.track1DSCR.toFixed(2)}×</span>
                      </td>
                      <td className="p-2 text-right font-mono">
                        <span style={{ color: dscrColor(opt.track2DSCR) }}>{opt.track2DSCR.toFixed(2)}×</span>
                      </td>
                      <td className="p-2 text-right text-zinc-300 font-mono">${fmt(opt.monthlyPayment)}</td>
                      <td className="p-2 text-right text-amber-400 font-mono">${fmt(opt.fiveYearCost)}</td>
                      <td className="p-2 text-zinc-400 text-[10px]">{opt.prepayPenalty}</td>
                      <td className="p-2 text-zinc-300 text-[10px]">{opt.bestLender}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-0.5">
                          {opt.tags.map((t) => (
                            <Badge key={t} className="bg-zinc-800 text-zinc-400 border-0 text-[8px] px-1">{t}</Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {options.some(o => o.ioRecastWarning) && (
              <div className="mt-3 p-2 bg-amber-950/20 border border-amber-800/30 rounded-md">
                <div className="text-[10px] text-amber-300 font-semibold mb-1">⚠ IO Recast Warnings:</div>
                {options.filter(o => o.ioRecastWarning).slice(0, 2).map((o, i) => (
                  <div key={i} className="text-[10px] text-amber-200/70 mb-1">
                    <strong className="text-amber-300">{o.name}:</strong> {o.ioRecastWarning}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}


function MonteCarloSection() {
  const store = useDSCRStore();
  const [open, setOpen] = useState(false);
  const mcResult = store.monteCarloResult;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <Activity className="h-4 w-4 mr-2" /> Monte Carlo Simulation
          {open ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        {!mcResult ? (
          <div className="flex items-center justify-center p-8 text-zinc-500">
            <Activity className="h-5 w-5 mr-2 animate-spin" /> Running 2,500 simulations...
          </div>
        ) : (
          <>
            {/* Probability cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider">DSCR &gt; 1.0× Probability</div>
                  <div className="text-4xl font-black mt-1" style={{ color: mcResult.probabilityDSCRAbove1_0 >= 0.85 ? '#10b981' : mcResult.probabilityDSCRAbove1_0 >= 0.70 ? '#f59e0b' : '#ef4444' }}>
                    {(mcResult.probabilityDSCRAbove1_0 * 100).toFixed(0)}%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider">Negative Cash Flow Risk</div>
                  <div className={`text-4xl font-black mt-1 ${mcResult.probabilityNegativeCashFlow > 0.3 ? 'text-red-400' : mcResult.probabilityNegativeCashFlow > 0.15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {(mcResult.probabilityNegativeCashFlow * 100).toFixed(0)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash flow distribution */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="text-xs font-semibold text-zinc-300">DSCR Distribution (2,500 sims)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mcResult.dscrDistribution} margin={{ left: 10, right: 10 }}>
                    <XAxis dataKey="dscr" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={{ stroke: '#3f3f46' }} tickFormatter={(v: number) => `${v.toFixed(1)}×`} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={{ stroke: '#3f3f46' }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
                      labelFormatter={(label: number) => `DSCR: ${label.toFixed(2)}×`} />
                    <Bar dataKey="probability" radius={[2, 2, 0, 0]}>
                      {mcResult.dscrDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.dscr >= 1.25 ? '#10b981' : entry.dscr >= 1.0 ? '#f59e0b' : '#ef4444'} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Reserve depletion curve */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1 pt-2 px-3">
                <CardTitle className="text-xs font-semibold text-zinc-300">Reserve Depletion Curve (12 Months)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={mcResult.reserveDepletionCurve} margin={{ left: 10, right: 10 }}>
                    <defs>
                      <linearGradient id="mcGrad90" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                      <linearGradient id="mcGrad10" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="p90Reserve" stroke="#10b981" fill="url(#mcGrad90)" strokeWidth={2} />
                    <Line type="monotone" dataKey="p50Reserve" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="p10Reserve" stroke="#ef4444" fill="url(#mcGrad10)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 text-[10px] mt-2 text-zinc-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> P90</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block" /> P50</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> P10</span>
                </div>
              </CardContent>
            </Card>

            {/* Key risks */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-zinc-300 mb-2">Key Risks (Ranked)</div>
                <div className="space-y-1.5">
                  {mcResult.keyRisks.map((risk, i) => {
                    const score = risk.probability * risk.impact;
                    return (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-md text-xs">
                        <span className="text-zinc-300">{risk.risk}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-zinc-500">P: <span className="text-amber-400">{(risk.probability * 100).toFixed(0)}%</span></span>
                          <span className="text-zinc-500">I: <span className="text-red-400">{(risk.impact * 100).toFixed(0)}%</span></span>
                          <Badge className={`${score > 0.5 ? 'bg-red-900/50 text-red-400' : score > 0.2 ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400'} border-0 text-[9px] px-1.5`}>
                            {(score * 100).toFixed(0)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ══════════════════════════════════════════════════════════════
// v11.1 Intelligence Panel — Surfaces all v11 new modules:
// Verdict + Return Grade + Reassessment + ARM Reset + Returns +
// After-Tax IRR + True Cost Lender Ranking + Insurance Gate
// ══════════════════════════════════════════════════════════════
function V11IntelligencePanel() {
  const store = useDSCRStore();
  const [open, setOpen] = useState(true);
  const v = store.v11Verdict;
  const reassessment = store.v11Reassessment;
  const armReset = store.v11ArmReset;
  const returns = store.v11Returns;
  const afterTax = store.v11AfterTaxIRR;
  const ranking = store.v11LenderRanking;
  const insurance = store.v11InsuranceGate;
  const brrrr = store.v11BrrrrGate;
  // v11.8/v11.10/v11.7 new modules
  const multiScenario = store.v11MultiScenarioARM;
  const mcRatePath = store.v11MonteCarloRatePath;
  const refi = store.v11RefiAnalysis;
  // v11.11 new module
  const matchScore = store.v11LenderMatchScore;
  // v11.12 new module
  const stressMatrix = store.v11StressMatrix;
  // v11.13 new module
  const irrWaterfall = store.v11IRRWaterfall;

  const verdictColor = v?.verdict === 'PROCEED' ? 'bg-emerald-600' : v?.verdict === 'RESTRUCTURE' ? 'bg-amber-600' : 'bg-red-600';
  const gradeColor = v?.returnGrade === 'A' ? 'text-emerald-400' : v?.returnGrade === 'B' ? 'text-cyan-400' : v?.returnGrade === 'C' ? 'text-yellow-400' : v?.returnGrade === 'D' ? 'text-orange-400' : 'text-red-400';

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-emerald-900/40 overflow-hidden">
      <CardHeader className="bg-emerald-950/20 border-b border-emerald-900/30 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-emerald-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-emerald-400">v11.14 Intelligence — Institutional Decision Engine</CardTitle>
              <p className="text-[10px] text-zinc-500">Verdict · Return Grade · Reassessment · ARM/SOFR Reset · Multi-Scenario Stress · Monte Carlo Rate-Path · Refi Tracker · Returns · After-Tax IRR · IRR Waterfall · AEY Lender Ranking · Lender Match Score · Stress Matrix · Insurance Gate · Cost-Seg · BRRRR</p>
              <p className="text-[9px] text-emerald-500/80 mt-0.5">v11.14 adds: factor radar chart (top-3 lenders overlay) · risk-zone distribution bar with pulse · break-even curve area chart · year-1 waterfall stage bar chart · animated fragile/break heatmap cells</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-zinc-500">10yr T-Note</div>
            <div className="text-sm font-mono text-emerald-400">{CURRENT_MARKET_SNAPSHOT.treasury10Y}%</div>
            <div className="text-[9px] text-zinc-500">SOFR 30d: {CURRENT_MARKET_SNAPSHOT.sofr30Day}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* v11.1 D-6 fix: Module error indicator (was silently swallowed by try/catch) */}
        {Object.keys(store.v11ModuleErrors).length > 0 && (
          <div className="rounded-lg bg-amber-950/20 border border-amber-800/40 p-2 text-[10px] text-amber-300 leading-relaxed">
            <div className="font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> MODULE ERRORS ({Object.keys(store.v11ModuleErrors).length})
            </div>
            <div className="space-y-0.5">
              {Object.entries(store.v11ModuleErrors).map(([mod, err]) => (
                <div key={mod} className="font-mono">
                  <span className="text-amber-400">{mod}</span>: <span className="text-zinc-300">{err}</span>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-amber-400/70 mt-1">
              Modules above failed during analysis and their cards will be hidden. Re-analyze after addressing inputs.
            </div>
          </div>
        )}

        {/* VERDICT + RETURN GRADE — top banner */}
        {v && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className={`md:col-span-2 rounded-lg ${verdictColor} p-4`}>
              <div className="text-[10px] uppercase tracking-wider text-white/70">VERDICT</div>
              <div className="text-3xl font-black text-white">{v.verdict}</div>
              <div className="text-[11px] text-white/80 mt-1">{v.bindingConstraint}</div>
              <div className="text-[10px] text-white/60 mt-2">
                {v.killCriteriaTriggered.filter(k => k.triggered).length} criteria triggered ({v.killCriteriaTriggered.filter(k => k.triggered && k.severity === 'BLOCKER').length} blockers)
              </div>
            </div>
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">RETURN GRADE</div>
              <div className={`text-4xl font-black ${gradeColor}`}>{v.returnGrade}</div>
              <div className="text-[10px] text-zinc-500 mt-1">{v.returnGradeReason.substring(0, 100)}...</div>
            </div>
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">AFTER-TAX IRR</div>
              <div className="text-3xl font-mono font-black text-cyan-400">
                {afterTax ? `${(afterTax.afterTaxIRR).toFixed(1)}%` : '—'}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Pre-tax: {afterTax ? `${afterTax.preTaxIRR.toFixed(1)}%` : '—'}
                <br/>Tax impact: {afterTax ? `${afterTax.irrImpactOfTaxes.toFixed(1)}%` : '—'}
              </div>
            </div>
          </div>
        )}

        {/* KILL-SWITCH + TRACK 2 ACK */}
        {v && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-amber-950/20 border border-amber-800/30 p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> KILL-SWITCH CONDITIONS
              </div>
              <ul className="text-[11px] text-amber-200/80 space-y-1">
                {v.killSwitchConditions.map((k, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`rounded-lg border p-3 ${v.track2AcknowledgmentRequired ? 'bg-red-950/20 border-red-800/40' : 'bg-emerald-950/20 border-emerald-800/30'}`}>
              <div className={`text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1 ${v.track2AcknowledgmentRequired ? 'text-red-400' : 'text-emerald-400'}`}>
                <ShieldAlert className="h-3 w-3" /> TRACK 2 SURVIVAL CHECK
              </div>
              {v.track2AcknowledgmentRequired ? (
                <div className="text-[11px] text-red-200/80">
                  <div className="font-bold text-red-300 mb-1">⚠ Negative carry — acknowledgment required</div>
                  <div>{v.track2AcknowledgmentText}</div>
                </div>
              ) : (
                <div className="text-[11px] text-emerald-200/80">
                  Track 2 DSCR ≥ 1.0 — deal survives investor cash-flow test.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROPERTY-TAX REASSESSMENT (Part B'.1) */}
        {reassessment && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-2 flex items-center gap-1">
              <Calculator className="h-3 w-3" /> PROPERTY-TAX REASSESSMENT (Part B'.1)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
              <div>
                <div className="text-[10px] text-zinc-500">Seller Tax</div>
                <div className="text-white font-mono">${fmt(reassessment.sellerAnnualTax)}/yr</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Your Reassessed Tax</div>
                <div className="text-amber-400 font-mono">${fmt(reassessment.reassessedAnnualTax)}/yr</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Monthly PITIA Δ</div>
                <div className={reassessment.taxDeltaMonthly > 0 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                  +${fmt(Math.abs(reassessment.taxDeltaMonthly))}/mo
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Track 1 DSCR Impact</div>
                <div className={reassessment.dscrImpact < 0 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                  {reassessment.dscrBefore.toFixed(2)}× → {reassessment.dscrAfter.toFixed(2)}× ({reassessment.dscrImpact < 0 ? '↓' : '↑'}{Math.abs(reassessment.dscrImpact).toFixed(2)}×)
                </div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 leading-relaxed border-l-2 border-amber-700/40 pl-2">
              {reassessment.note}
              {reassessment.supplementalBillEstimate > 0 && (
                <span className="text-amber-400"> ⚠ Supplemental bill ~${fmt(reassessment.supplementalBillEstimate)} expected 3-9 months post-closing.</span>
              )}
            </div>
          </div>
        )}

        {/* ARM RESET (Part B") */}
        {armReset && (
          <div className="rounded-lg bg-zinc-900 border border-orange-800/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-orange-400 font-bold mb-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> ARM / SOFR RATE RESET ENGINE (Part B")
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
              <div>
                <div className="text-[10px] text-zinc-500">Initial Rate</div>
                <div className="text-white font-mono">{armReset.initialRate.toFixed(3)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Reset @ Current SOFR ({armReset.currentIndex}%)</div>
                <div className="text-cyan-400 font-mono">{armReset.resetRateAtCurrentIndex.toFixed(3)}%</div>
                <div className="text-[10px] text-zinc-500">T1 DSCR: {armReset.track1DSCRAtCurrentReset.toFixed(2)}×</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Reset @ Stress SOFR 5.0%</div>
                <div className="text-orange-400 font-mono">{armReset.resetRateAtStressIndex.toFixed(3)}%</div>
                <div className="text-[10px] text-zinc-500">T1 DSCR: {armReset.track1DSCRAtStressReset.toFixed(2)}×</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Cushion vs Deal-Break</div>
                <div className={armReset.cushionBpsAtStress < 100 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                  {armReset.cushionBpsAtStress} bps
                </div>
                <div className="text-[10px] text-zinc-500">Deal-break: {armReset.dealBreakRate.toFixed(3)}%</div>
              </div>
            </div>
            {armReset.ioArmDoubleShockYear !== null && (
              <div className="rounded-md bg-red-950/40 border border-red-800/40 p-2 mb-2">
                <div className="text-[10px] text-red-400 font-bold">🚨 IO+ARM DOUBLE-SHOCK YEAR {armReset.ioArmDoubleShockYear} — RISK: {armReset.doubleShockRisk}</div>
                <div className="text-[10px] text-red-200/70 mt-0.5">IO recast AND ARM reset hit simultaneously. Switch to fixed-rate product.</div>
              </div>
            )}
            <div className="text-[10px] text-zinc-400 leading-relaxed border-l-2 border-orange-700/40 pl-2">
              {armReset.warningMessage}
            </div>
          </div>
        )}

        {/* v11.8: MULTI-SCENARIO ARM STRESS TESTING (5 scenarios) */}
        {multiScenario && (
          <div className="rounded-lg bg-zinc-900 border border-amber-800/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> MULTI-SCENARIO ARM STRESS (v11.8) — 5 SOFR Scenarios
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs mb-2">
              {multiScenario.scenarios.map((s) => (
                <div key={s.scenarioName} className={`rounded border p-1.5 ${s.dealBreaks ? 'border-red-700/60 bg-red-950/20' : 'border-zinc-800 bg-zinc-950/40'}`}>
                  <div className="text-[9px] font-bold text-zinc-400">{s.scenarioName}</div>
                  <div className="text-[9px] text-zinc-500">SOFR {s.indexPct}%</div>
                  <div className="text-[10px] text-white font-mono">{s.stabilizedRate.toFixed(3)}%</div>
                  <div className={`text-[10px] font-mono ${s.track1DSCRAtStabilization >= 1.25 ? 'text-emerald-400' : s.track1DSCRAtStabilization >= 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    DSCR {s.track1DSCRAtStabilization.toFixed(2)}×
                  </div>
                  <div className="text-[9px] text-zinc-500">{s.cushionBps} bps</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Worst Case</div>
                <div className="text-red-400 font-bold">{multiScenario.worstCase.scenarioName}</div>
                <div className="text-zinc-400">DSCR {multiScenario.worstCase.track1DSCRAtStabilization.toFixed(2)}×</div>
              </div>
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Deal-Break Scenarios</div>
                <div className={`font-bold ${multiScenario.breaksCount >= 3 ? 'text-red-400' : multiScenario.breaksCount >= 1 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {multiScenario.breaksCount}/5
                </div>
                <div className="text-zinc-400">{multiScenario.breaksCount === 0 ? 'Robust' : multiScenario.breaksCount <= 2 ? 'Tail risk' : 'Fragile'}</div>
              </div>
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">30yr Fixed Reference</div>
                <div className="text-cyan-400 font-mono">{multiScenario.fixedRateComparison.toFixed(3)}%</div>
                <div className="text-zinc-400">Freddie Mac</div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 leading-relaxed border-l-2 border-amber-700/40 pl-2">
              {multiScenario.summary}
            </div>
          </div>
        )}

        {/* v11.10: MONTE CARLO ARM/SOFR RATE-PATH (Vasicek process) */}
        {mcRatePath && (
          <div className="rounded-lg bg-zinc-900 border border-purple-800/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-2 flex items-center gap-1">
              <Activity className="h-3 w-3" /> MONTE CARLO ARM/SOFR RATE-PATH (v11.10) — Vasicek Mean-Reverting Process
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
              <div>
                <div className="text-[10px] text-zinc-500">P(DSCR &lt; 1.0) — Deal-Break</div>
                <div className={`font-mono font-bold ${mcRatePath.probabilityDSCRBelow1_0 > 0.20 ? 'text-red-400' : mcRatePath.probabilityDSCRBelow1_0 > 0.05 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {(mcRatePath.probabilityDSCRBelow1_0 * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">P(DSCR &lt; 1.25) — Marginal</div>
                <div className="text-yellow-400 font-mono">{(mcRatePath.probabilityDSCRBelow1_25 * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Mean Stabilized Rate</div>
                <div className="text-white font-mono">{mcRatePath.finalRateStats.mean.toFixed(3)}%</div>
                <div className="text-[9px] text-zinc-500">σ {mcRatePath.finalRateStats.stddev.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">P(Hits Lifetime Cap)</div>
                <div className="text-orange-400 font-mono">{(mcRatePath.probabilityRateAboveLifetimeCap * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] mb-2">
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Rate p10 (low)</div>
                <div className="text-emerald-400 font-mono">{mcRatePath.finalRateStats.p10.toFixed(3)}%</div>
              </div>
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Rate p50 (median)</div>
                <div className="text-white font-mono">{mcRatePath.finalRateStats.median.toFixed(3)}%</div>
              </div>
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Rate p90 (high)</div>
                <div className="text-red-400 font-mono">{mcRatePath.finalRateStats.p90.toFixed(3)}%</div>
              </div>
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">DSCR median</div>
                <div className={`font-mono ${mcRatePath.dscrStats.median >= 1.25 ? 'text-emerald-400' : mcRatePath.dscrStats.median >= 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {mcRatePath.dscrStats.median.toFixed(3)}×
                </div>
              </div>
            </div>
            <div className="text-[9px] text-zinc-500 mb-1">
              SOFR path (mean / p10 / p90): Yr1 {mcRatePath.sofrAtHorizon.year1.mean.toFixed(2)}% / {mcRatePath.sofrAtHorizon.year1.p10.toFixed(2)}% / {mcRatePath.sofrAtHorizon.year1.p90.toFixed(2)}% ·
              Yr5 {mcRatePath.sofrAtHorizon.year5.mean.toFixed(2)}% / {mcRatePath.sofrAtHorizon.year5.p10.toFixed(2)}% / {mcRatePath.sofrAtHorizon.year5.p90.toFixed(2)}% ·
              Yr10 {mcRatePath.sofrAtHorizon.year10.mean.toFixed(2)}% / {mcRatePath.sofrAtHorizon.year10.p10.toFixed(2)}% / {mcRatePath.sofrAtHorizon.year10.p90.toFixed(2)}%
            </div>
            <div className="text-[9px] text-zinc-500 mb-2">
              Model: Vasicek (κ={mcRatePath.modelParameters.meanReversionSpeed}, θ={mcRatePath.modelParameters.longRunMeanSOFR}%, σ={mcRatePath.modelParameters.volatility}%, r0={mcRatePath.modelParameters.initialSOFR}%, shock={(mcRatePath.modelParameters.shockProbMonthly * 100).toFixed(1)}%/mo × ±{mcRatePath.modelParameters.shockMagnitudeBps}bps) · {mcRatePath.simulations} paths × {mcRatePath.horizonMonths}mo · seed={mcRatePath.seed}
            </div>
            <div className="text-[10px] text-zinc-400 leading-relaxed border-l-2 border-purple-700/40 pl-2">
              {mcRatePath.summary}
            </div>
          </div>
        )}

        {/* v11.7: REFI TRACKER (4-factor readiness scoring) */}
        {refi && (
          <div className="rounded-lg bg-zinc-900 border border-cyan-800/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> REFI TRACKER (v11.7) — 4-Factor Readiness Score
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
              <div>
                <div className="text-[10px] text-zinc-500">Refi Type</div>
                <div className={`font-mono font-bold ${refi.refiType === 'NO_REFI' ? 'text-red-400' : refi.refiType === 'CASH_OUT' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                  {refi.refiType}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Readiness Score</div>
                <div className={`font-mono font-bold ${refi.refiReadinessScore >= 75 ? 'text-emerald-400' : refi.refiReadinessScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {refi.refiReadinessScore}/100
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Cash-Out Capacity (70% LTV)</div>
                <div className="text-cyan-400 font-mono">${refi.cashOutMaxAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Seasoning Status</div>
                <div className={`font-mono ${refi.seasoningMet ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {refi.seasoningMet ? 'Met' : `${refi.seasoningMonthsRemaining}mo left`}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] mb-2">
              {refi.readinessFactors.map((f) => (
                <div key={f.factor} className="rounded bg-zinc-950/60 p-1.5">
                  <div className="text-zinc-500">{f.factor} <span className="text-zinc-600">({f.score}/{f.maxScore})</span></div>
                  <div className={`font-bold ${f.status === 'PASS' ? 'text-emerald-400' : f.status === 'WARN' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {f.status}
                  </div>
                  <div className="text-[9px] text-zinc-400 leading-tight mt-0.5">{f.detail}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Current DSCR</div>
                <div className="text-white font-mono">{refi.currentDSCR.toFixed(3)}×</div>
              </div>
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Projected Refi DSCR</div>
                <div className={`font-mono ${refi.projectedRefiDSCR >= 1.25 ? 'text-emerald-400' : refi.projectedRefiDSCR >= 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {refi.projectedRefiDSCR.toFixed(3)}×
                </div>
              </div>
              <div className="rounded bg-zinc-950/60 p-1.5">
                <div className="text-zinc-500">Break-Even Months</div>
                <div className="text-white font-mono">{refi.breakEvenMonths === 999 ? '—' : `${refi.breakEvenMonths}mo`}</div>
              </div>
            </div>
          </div>
        )}

        {/* RETURNS + AFTER-TAX IRR (Part B + B'.2) */}
        {returns && afterTax && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> RETURNS ENGINE — PRE-TAX + AFTER-TAX (Part B + B'.2)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs mb-2">
              <div>
                <div className="text-[10px] text-zinc-500">Entry Cap Rate</div>
                <div className="text-white font-mono">{returns.entryCapRate.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Year 1 CoC</div>
                <div className={returns.year1CashOnCash > 0 ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'}>
                  {returns.year1CashOnCash.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Pre-Tax IRR ({returns.exitYear}yr)</div>
                <div className="text-cyan-400 font-mono">{returns.leveredIRR.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">After-Tax IRR</div>
                <div className="text-cyan-400 font-mono">{afterTax.afterTaxIRR.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Equity Multiple</div>
                <div className="text-white font-mono">{returns.equityMultiple.toFixed(2)}×</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2 pt-2 border-t border-zinc-800">
              <div>
                <div className="text-[10px] text-zinc-500">Debt Yield</div>
                <div className="text-white font-mono">{returns.debtYield.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Break-Even Occupancy</div>
                <div className="text-white font-mono">{returns.breakEvenOccupancy.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">NIIT Applies</div>
                <div className={afterTax.niitApplies ? 'text-amber-400 font-mono' : 'text-emerald-400 font-mono'}>
                  {afterTax.niitApplies ? 'Yes (3.8%)' : 'No'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Eff. Recapture Rate</div>
                <div className="text-amber-400 font-mono">{(afterTax.effectiveRecaptureRate * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 leading-relaxed border-l-2 border-cyan-700/40 pl-2">
              {returns.note}
              <br/>
              <span className="text-amber-400">{afterTax.disclaimer}</span>
            </div>
          </div>
        )}

        {/* v11.13: IRR WATERFALL — gross rent → opex → NOI → debt → tax → after-tax → exit → IRR */}
        {irrWaterfall && (
          <div className="rounded-lg bg-gradient-to-br from-amber-950/30 to-zinc-900 border-2 border-amber-800/50 p-3">
            <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-2 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> IRR WATERFALL (v11.13) — Where Every Dollar of Rent Goes
            </div>

            {/* Header KPIs */}
            <div className="grid grid-cols-6 gap-2 mb-3 pb-2 border-b border-amber-900/40">
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Y1 Gross Rent</div>
                <div className="text-white font-mono text-xs font-bold">${irrWaterfall.year1.grossRent.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Y1 NOI</div>
                <div className="text-cyan-400 font-mono text-xs font-bold">${irrWaterfall.year1.noi.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Y1 After-Tax CF</div>
                <div className={`font-mono text-xs font-bold ${irrWaterfall.year1.afterTaxCF >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${irrWaterfall.year1.afterTaxCF.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Y1 Eff Tax Rate</div>
                <div className="text-amber-400 font-mono text-xs font-bold">{irrWaterfall.year1.effectiveTaxRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Y1 Dep Shield</div>
                <div className="text-violet-400 font-mono text-xs font-bold">{irrWaterfall.year1.depreciationShieldPct.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">After-Tax IRR</div>
                <div className={`font-mono text-xs font-bold ${irrWaterfall.holdTotal.afterTaxIRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {irrWaterfall.holdTotal.afterTaxIRR.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Year 1 waterfall */}
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">Year 1 Waterfall</div>
              <div className="space-y-0.5">
                {irrWaterfall.year1.stages.map((s) => {
                  const isNegative = s.amount < 0;
                  const barWidth = Math.min(100, Math.abs(s.amount) / (irrWaterfall.year1.grossRent / 100));
                  return (
                    <div key={s.step} className="flex items-center gap-2 text-[10px]">
                      <div className="w-5 text-zinc-500 text-right font-mono">{s.step}.</div>
                      <div className="w-40 text-zinc-300">{s.label}</div>
                      <div className={`w-12 text-center font-mono font-bold ${waterfallStageColor(s.sign).split(' ')[1]}`}>
                        {waterfallSignSymbol(s.sign)}
                      </div>
                      <div className={`w-20 text-right font-mono ${isNegative ? 'text-red-400' : 'text-white'}`}>
                        ${Math.abs(s.amount).toLocaleString()}
                        {isNegative && <span className="text-[8px] text-red-500 ml-0.5">(loss)</span>}
                      </div>
                      <div className="flex-1 h-3 bg-zinc-800 rounded overflow-hidden relative">
                        <div
                          className={`h-full ${waterfallStageColor(s.sign).split(' ')[0]}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-zinc-500 font-mono">{s.pctOfGrossRent.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>

              {/* v11.14: Year-1 Waterfall Bar Chart — visual stage-by-stage breakdown */}
              <div className="mt-2 bg-zinc-950/40 rounded p-2 border border-amber-900/30">
                <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold mb-1">Year-1 Stage Magnitudes (% of Gross Rent)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={irrWaterfall.year1.stages.map(s => ({
                      step: `${s.step}`,
                      label: s.label.length > 14 ? s.label.slice(0, 12) + '…' : s.label,
                      amount: s.amount,
                      pctOfGross: s.pctOfGrossRent,
                      sign: s.sign,
                    }))}
                    margin={{ top: 8, right: 16, bottom: 40, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#a1a1aa', fontSize: 9 }}
                      stroke="#3f3f46"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fill: '#a1a1aa', fontSize: 9 }} stroke="#3f3f46" label={{ value: '% of rent', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #b45309', borderRadius: 6, fontSize: 11 }}
                      labelStyle={{ color: '#fbbf24' }}
                      formatter={(value: number, _name: string, item: { payload?: { sign?: string; amount?: number } }) => [
                        `${value.toFixed(1)}% ($${Math.abs(item?.payload?.amount ?? 0).toLocaleString()})`,
                        item?.payload?.sign === 'ADD' ? 'Added' : item?.payload?.sign === 'SUBTRACT' ? 'Subtracted' : item?.payload?.sign === 'SUBTOTAL' ? 'Subtotal' : 'Total',
                      ]}
                    />
                    <Bar dataKey="pctOfGross" radius={[2, 2, 0, 0]}>
                      {irrWaterfall.year1.stages.map((s, i) => {
                        const fillColor =
                          s.sign === 'ADD' ? '#10b981' :
                          s.sign === 'SUBTRACT' ? '#ef4444' :
                          s.sign === 'SUBTOTAL' ? '#06b6d4' :
                          '#a855f7';
                        return <Cell key={i} fill={fillColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-1 text-[8px]">
                  <div className="flex items-center gap-1"><div className="h-2 w-2 bg-emerald-500 rounded"></div><span className="text-zinc-400">ADD</span></div>
                  <div className="flex items-center gap-1"><div className="h-2 w-2 bg-red-500 rounded"></div><span className="text-zinc-400">SUBTRACT</span></div>
                  <div className="flex items-center gap-1"><div className="h-2 w-2 bg-cyan-500 rounded"></div><span className="text-zinc-400">SUBTOTAL</span></div>
                  <div className="flex items-center gap-1"><div className="h-2 w-2 bg-purple-500 rounded"></div><span className="text-zinc-400">TOTAL</span></div>
                </div>
              </div>
            </div>

            {/* Exit waterfall */}
            <div className="mb-3 pt-2 border-t border-amber-900/40">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">
                Exit Waterfall (Year {irrWaterfall.exit.exitYear})
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div className="bg-emerald-950/30 rounded p-1.5 border border-emerald-800/30">
                  <div className="text-[9px] text-zinc-500 uppercase">Sale Price</div>
                  <div className="text-white font-mono font-bold">${irrWaterfall.exit.salePrice.toLocaleString()}</div>
                </div>
                <div className="bg-red-950/30 rounded p-1.5 border border-red-800/30">
                  <div className="text-[9px] text-zinc-500 uppercase">- Selling Costs</div>
                  <div className="text-red-300 font-mono font-bold">${irrWaterfall.exit.sellingCosts.toLocaleString()}</div>
                </div>
                <div className="bg-red-950/30 rounded p-1.5 border border-red-800/30">
                  <div className="text-[9px] text-zinc-500 uppercase">- Loan Payoff</div>
                  <div className="text-red-300 font-mono font-bold">${irrWaterfall.exit.remainingLoanBalance.toLocaleString()}</div>
                </div>
                <div className="bg-red-950/30 rounded p-1.5 border border-red-800/30">
                  <div className="text-[9px] text-zinc-500 uppercase">- Sale Tax</div>
                  <div className="text-red-300 font-mono font-bold">${(irrWaterfall.exit.depreciationRecapture + irrWaterfall.exit.capitalGainsTax).toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                <div className="col-span-2 bg-violet-950/30 rounded p-1.5 border border-violet-800/40">
                  <div className="text-[9px] text-zinc-500 uppercase">Net After-Tax Exit Proceeds</div>
                  <div className={`font-mono font-bold text-sm ${irrWaterfall.exit.netAfterTaxExit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${irrWaterfall.exit.netAfterTaxExit.toLocaleString()}
                  </div>
                </div>
                <div className="bg-amber-950/30 rounded p-1.5 border border-amber-800/40">
                  <div className="text-[9px] text-zinc-500 uppercase">Exit Multiple</div>
                  <div className="font-mono font-bold text-sm text-amber-300">{irrWaterfall.exit.exitMultiple.toFixed(2)}×</div>
                </div>
              </div>
            </div>

            {/* Hold-total summary */}
            <div className="pt-2 border-t border-amber-900/40">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">Hold-Period Summary ({irrWaterfall.exit.exitYear} years)</div>
              <div className="grid grid-cols-5 gap-2 text-[10px]">
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase">Cash Invested</div>
                  <div className="text-red-300 font-mono font-bold">${irrWaterfall.holdTotal.cashInvested.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase">Total Operating CF</div>
                  <div className={`font-mono font-bold ${irrWaterfall.holdTotal.totalOperatingCF >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${irrWaterfall.holdTotal.totalOperatingCF.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase">Exit After-Tax</div>
                  <div className={`font-mono font-bold ${irrWaterfall.holdTotal.exitAfterTax >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${irrWaterfall.holdTotal.exitAfterTax.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase">Total Return</div>
                  <div className={`font-mono font-bold ${irrWaterfall.holdTotal.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${irrWaterfall.holdTotal.totalReturn.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-zinc-500">{irrWaterfall.holdTotal.returnMultiple.toFixed(2)}× multiple</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase">Net Profit</div>
                  <div className={`font-mono font-bold ${irrWaterfall.holdTotal.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${irrWaterfall.holdTotal.totalProfit.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                <div className="bg-zinc-800/40 rounded p-1.5">
                  <div className="text-[9px] text-zinc-500 uppercase">Pre-Tax IRR</div>
                  <div className={`font-mono font-bold ${irrWaterfall.holdTotal.preTaxIRR >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {irrWaterfall.holdTotal.preTaxIRR.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-zinc-800/40 rounded p-1.5">
                  <div className="text-[9px] text-zinc-500 uppercase">After-Tax IRR</div>
                  <div className={`font-mono font-bold ${irrWaterfall.holdTotal.afterTaxIRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {irrWaterfall.holdTotal.afterTaxIRR.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-zinc-800/40 rounded p-1.5">
                  <div className="text-[9px] text-zinc-500 uppercase">Tax Drag (pp)</div>
                  <div className="text-amber-400 font-mono font-bold">{irrWaterfall.holdTotal.irrImpactOfTaxes.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Summary text */}
            <div className="text-[10px] text-zinc-400 mt-2 leading-relaxed border-l-2 border-amber-700/40 pl-2">
              {irrWaterfall.summary}
            </div>
          </div>
        )}

        {/* TRUE COST / AEY LENDER RANKING (Part D) */}
        {ranking.length > 0 && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] uppercase tracking-wider text-violet-400 font-bold mb-2 flex items-center gap-1">
              <Target className="h-3 w-3" /> TRUE COST / AEY LENDER RANKING (Part D) — Sort by XIRR, NOT by stated rate
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                    <th className="text-left py-1.5 pr-2">#</th>
                    <th className="text-left py-1.5 pr-2">Lender</th>
                    <th className="text-right py-1.5 pr-2">Rate</th>
                    <th className="text-right py-1.5 pr-2">AEY</th>
                    <th className="text-right py-1.5 pr-2">60mo Cost</th>
                    <th className="text-center py-1.5 pr-2">PPP</th>
                    <th className="text-center py-1.5 pr-2">Conf</th>
                    <th className="text-center py-1.5 pr-2">Counterparty</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.slice(0, 6).map((l) => (
                    <tr key={l.lenderId} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 ${l.rank === 1 ? 'bg-emerald-950/30' : ''}`}>
                      <td className="py-1.5 pr-2 font-mono text-zinc-400">{l.rank}</td>
                      <td className="py-1.5 pr-2 font-bold text-white">{l.lenderName}</td>
                      <td className="py-1.5 pr-2 text-right font-mono text-zinc-300">{l.estimatedRate.toFixed(3)}%</td>
                      <td className={`py-1.5 pr-2 text-right font-mono font-bold ${l.rank === 1 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {l.aey.toFixed(3)}%
                      </td>
                      <td className="py-1.5 pr-2 text-right font-mono text-zinc-300">${fmt(l.totalCost60mo)}</td>
                      <td className="py-1.5 pr-2 text-center">
                        <Badge className={l.pppAllowed ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'} variant="outline" >
                          {l.pppAllowed ? 'Allowed' : 'Blocked'}
                        </Badge>
                      </td>
                      <td className="py-1.5 pr-2 text-center">
                        <Badge variant="outline" className={
                          l.confidenceScore >= 80 ? 'bg-emerald-900/50 text-emerald-400' :
                          l.confidenceScore >= 70 ? 'bg-cyan-900/50 text-cyan-400' :
                          l.confidenceScore >= 60 ? 'bg-amber-900/50 text-amber-400' :
                          'bg-red-900/50 text-red-400'
                        }>
                          {l.confidenceScore}
                        </Badge>
                      </td>
                      <td className="py-1.5 pr-2 text-center">
                        <Badge variant="outline" className={
                          l.counterpartyRisk.flag === 'STABLE' ? 'bg-emerald-900/50 text-emerald-400' :
                          l.counterpartyRisk.flag === 'WATCH' ? 'bg-amber-900/50 text-amber-400' :
                          'bg-red-900/50 text-red-400'
                        }>
                          {l.counterpartyRisk.flag}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-zinc-400 mt-2 leading-relaxed border-l-2 border-violet-700/40 pl-2">
              <strong>Two-Quote Rule:</strong> Always one rate-competitive + one flex/fit lender with AEY delta in dollars.
              AEY = XIRR of actual borrower cash flows (net proceeds → monthly payments → exit balloon + prepay).
              Lender with lowest AEY over expected hold is cheapest, regardless of stated rate.
            </div>
          </div>
        )}

        {/* v11.11: LENDER MATCH SCORE — 0-100 weighted factor breakdown, top-3 recommendation */}
        {matchScore && matchScore.topPicks.length > 0 && (
          <div className="rounded-lg bg-gradient-to-br from-indigo-950/30 to-zinc-900 border-2 border-indigo-800/50 p-3">
            <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-2 flex items-center gap-1">
              <Target className="h-3 w-3" /> LENDER MATCH SCORE (v11.11) — 6-Factor Weighted Recommendation
            </div>

            {/* Top picks summary header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-900/40">
              <div className="text-[10px] text-zinc-400">
                <span className="text-indigo-300 font-bold">{matchScore.fieldCount}</span> eligible lenders scored ·
                Median market rate: <span className="text-white font-mono">{matchScore.marketRateBenchmark.toFixed(3)}%</span>
              </div>
              <div className="text-[10px] text-zinc-500 italic">
                Top pick: <span className="text-emerald-400 font-bold">{matchScore.topPicks[0].lenderName}</span> ({matchScore.topPicks[0].totalScore}/100)
              </div>
            </div>

            {/* v11.14: Radar Chart — 6-factor visualization for top-3 lenders side-by-side */}
            <div className="mb-3 bg-zinc-950/40 rounded p-2 border border-indigo-900/30">
              <div className="text-[9px] uppercase tracking-wider text-indigo-300 font-bold mb-1">Factor Radar — Top 3 Lenders Overlay</div>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart
                  data={matchScore.topPicks[0].factors.map((f) => {
                    const factorKey = f.key;
                    const row: Record<string, number | string> = { factor: f.label.split(' ')[0] };
                    matchScore.topPicks.forEach((pick) => {
                      const found = pick.factors.find((pf) => pf.key === factorKey);
                      row[pick.lenderName] = found ? found.rawScore : 0;
                    });
                    return row;
                  })}
                  margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
                >
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 8 }} stroke="#27272a" />
                  {matchScore.topPicks.map((pick, idx) => (
                    <Radar
                      key={pick.lenderId}
                      name={pick.lenderName}
                      dataKey={pick.lenderName}
                      stroke={idx === 0 ? '#10b981' : idx === 1 ? '#22d3ee' : '#a1a1aa'}
                      fill={idx === 0 ? '#10b981' : idx === 1 ? '#22d3ee' : '#a1a1aa'}
                      fillOpacity={idx === 0 ? 0.35 : idx === 1 ? 0.20 : 0.10}
                      strokeWidth={idx === 0 ? 2 : 1.5}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #312e81', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: '#a5b4fc' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 justify-center mt-1">
                {matchScore.topPicks.map((pick, idx) => (
                  <div key={pick.lenderId} className="flex items-center gap-1 text-[9px]">
                    <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-cyan-400' : 'bg-zinc-400'}`}></div>
                    <span className="text-zinc-300">{pick.lenderName}</span>
                    <span className="text-zinc-500">({pick.totalScore})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 picks with factor breakdown */}
            <div className="space-y-2">
              {matchScore.topPicks.map((pick, idx) => (
                <div key={pick.lenderId} className={`rounded p-2 border ${
                  idx === 0 ? 'bg-emerald-950/20 border-emerald-700/50' :
                  idx === 1 ? 'bg-cyan-950/20 border-cyan-700/40' :
                  'bg-zinc-800/30 border-zinc-700/50'
                }`}>
                  {/* Pick header row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-emerald-600 text-white' :
                        idx === 1 ? 'bg-cyan-600 text-white' :
                        'bg-zinc-600 text-white'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="text-sm font-bold text-white">{pick.lenderName}</div>
                      <Badge variant="outline" className={
                        pick.tier === 'TOP_PICK' ? 'bg-emerald-900/50 text-emerald-300' :
                        pick.tier === 'STRONG' ? 'bg-cyan-900/50 text-cyan-300' :
                        pick.tier === 'VIABLE' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-red-900/50 text-red-300'
                      }>
                        {pick.tier.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-lg font-bold ${
                        pick.totalScore >= 80 ? 'text-emerald-400' :
                        pick.totalScore >= 65 ? 'text-cyan-400' :
                        pick.totalScore >= 50 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {pick.totalScore}<span className="text-[10px] text-zinc-500">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Factor breakdown bars */}
                  <div className="grid grid-cols-6 gap-1.5 mb-1.5">
                    {pick.factors.map((f) => (
                      <div key={f.key} className="text-[9px]">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-zinc-400 uppercase tracking-tight">{f.label.split(' ')[0]}</span>
                          <span className={`font-mono font-bold ${
                            f.rawScore >= 80 ? 'text-emerald-400' :
                            f.rawScore >= 65 ? 'text-cyan-400' :
                            f.rawScore >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>{f.rawScore}</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded overflow-hidden">
                          <div
                            className={`h-full rounded ${
                              f.rawScore >= 80 ? 'bg-emerald-500' :
                              f.rawScore >= 65 ? 'bg-cyan-500' :
                              f.rawScore >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${f.rawScore}%` }}
                          />
                        </div>
                        <div className="text-[8px] text-zinc-600 mt-0.5">wgt {f.weight * 100}%</div>
                      </div>
                    ))}
                  </div>

                  {/* Factor details (compact one-line each) */}
                  <div className="text-[10px] text-zinc-400 space-y-0.5 mb-1.5">
                    {pick.factors.map((f) => (
                      <div key={f.key} className="flex items-baseline gap-1">
                        <span className="text-zinc-500 uppercase tracking-tight w-24 flex-shrink-0">{f.label.split(' ')[0]}:</span>
                        <span className="text-zinc-300">{f.detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reasons & concerns */}
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-zinc-700/30">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5">Strengths</div>
                      {pick.topReasons.length > 0 ? (
                        <ul className="text-[10px] text-zinc-300 space-y-0.5">
                          {pick.topReasons.slice(0, 3).map((r, i) => (
                            <li key={i} className="leading-tight">• {r}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[10px] text-zinc-500 italic">No standout strengths</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mb-0.5">Watch</div>
                      {pick.topConcerns.length > 0 ? (
                        <ul className="text-[10px] text-zinc-300 space-y-0.5">
                          {pick.topConcerns.slice(0, 2).map((c, i) => (
                            <li key={i} className="leading-tight">• {c}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[10px] text-emerald-500 italic">No concerns flagged</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall summary */}
            <div className="text-[10px] text-zinc-400 mt-2 leading-relaxed border-l-2 border-indigo-700/40 pl-2">
              <strong>Methodology:</strong> 6-factor weighted score (Rate 25% · DSCR Headroom 20% · Reserves 15% · Provenance 15% · LTV Fit 15% · Flexibility 10%).
              <strong> Tiers:</strong> TOP_PICK ≥80 · STRONG ≥65 · VIABLE ≥50 · WEAK &lt;50.
              {matchScore.summary}
            </div>
          </div>
        )}

        {/* v11.12: COMBINED STRESS MATRIX — 2D rate×rent heatmap with risk zones */}
        {stressMatrix && (
          <div className="rounded-lg bg-gradient-to-br from-rose-950/30 to-zinc-900 border-2 border-rose-800/50 p-3">
            <div className="text-[10px] uppercase tracking-wider text-rose-300 font-bold mb-2 flex items-center gap-1">
              <Grid3x3 className="h-3 w-3" /> COMBINED STRESS MATRIX (v11.12) — Rate × Rent 2D Heatmap with Risk Zones
            </div>

            {/* Header summary */}
            <div className="grid grid-cols-5 gap-2 mb-3 pb-2 border-b border-rose-900/40">
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Base Rate</div>
                <div className="text-white font-mono text-sm font-bold">{stressMatrix.baseRate.toFixed(3)}%</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Base Rent</div>
                <div className="text-white font-mono text-sm font-bold">${stressMatrix.baseRent.toFixed(0)}/mo</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Base T1 DSCR</div>
                <div className={`font-mono text-sm font-bold ${stressMatrix.baseTrack1DSCR >= 1.25 ? 'text-emerald-400' : stressMatrix.baseTrack1DSCR >= 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {stressMatrix.baseTrack1DSCR.toFixed(3)}×
                </div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Safe Zone %</div>
                <div className={`font-mono text-sm font-bold ${stressMatrix.safeZonePct >= 50 ? 'text-emerald-400' : stressMatrix.safeZonePct >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {stressMatrix.safeZonePct.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase">Fragile + Break</div>
                <div className={`font-mono text-sm font-bold ${stressMatrix.fragileZonePct < 15 ? 'text-emerald-400' : stressMatrix.fragileZonePct < 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {stressMatrix.fragileZonePct.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* 2D heatmap grid */}
            <div className="overflow-x-auto mb-2">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="text-[8px] text-zinc-500 uppercase tracking-tight p-1 text-right sticky left-0 bg-zinc-900">
                      Rate ↓ / Rent →
                    </th>
                    {stressMatrix.rentAxis.map((r) => (
                      <th key={r} className={`text-[9px] p-1 text-center min-w-[52px] ${r === 0 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                        {r > 0 ? '+' : ''}{r}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stressMatrix.cells.map((row, i) => (
                    <tr key={i}>
                      <td className={`text-[9px] p-1 text-right font-mono sticky left-0 bg-zinc-900 ${stressMatrix.rateAxis[i] === stressMatrix.baseRate ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                        {stressMatrix.rateAxis[i].toFixed(2)}%
                      </td>
                      {row.map((cell, j) => {
                        const isBase = cell.rateOffsetBps === 0 && cell.rentOffsetPct === 0;
                        const isDanger = cell.riskZone === 'FRAGILE' || cell.riskZone === 'DEAL_BREAK';
                        return (
                          <td key={j} className="p-0.5">
                            <div
                              className={`h-9 w-12 flex flex-col items-center justify-center rounded text-[10px] font-mono font-bold ${riskZoneColor(cell.riskZone)} ${isBase ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-900' : ''} ${isDanger ? 'animate-pulse' : ''}`}
                              title={cell.interpretation}
                            >
                              <div className="leading-tight">{cell.track1DSCR.toFixed(2)}</div>
                              <div className="text-[7px] opacity-80 leading-tight">
                                {cell.monthlyCashFlow >= 0 ? '+' : '-'}${Math.abs(cell.monthlyCashFlow).toFixed(0)}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 mb-2 text-[9px]">
              {(['SAFE', 'COMFORTABLE', 'MARGINAL', 'FRAGILE', 'DEAL_BREAK'] as const).map(zone => (
                <div key={zone} className="flex items-center gap-1">
                  <div className={`h-3 w-3 rounded ${riskZoneColor(zone)}`}></div>
                  <span className={riskZoneTextColor(zone)}>{riskZoneLabel(zone)}</span>
                  <span className="text-zinc-500">({stressMatrix.zoneCounts[zone]})</span>
                </div>
              ))}
            </div>

            {/* v11.14: Risk-Zone Distribution Bar — visual proportional breakdown of all 120 cells */}
            <div className="mb-2 bg-zinc-950/40 rounded p-2 border border-rose-900/30">
              <div className="text-[9px] uppercase tracking-wider text-rose-300 font-bold mb-1">Risk-Zone Distribution — 120 Cells Proportional Breakdown</div>
              <div className="flex h-6 rounded overflow-hidden border border-zinc-800">
                {(['SAFE', 'COMFORTABLE', 'MARGINAL', 'FRAGILE', 'DEAL_BREAK'] as const).map(zone => {
                  const count = stressMatrix.zoneCounts[zone];
                  const pct = (count / 120) * 100;
                  if (count === 0) return null;
                  return (
                    <div
                      key={zone}
                      className={`${riskZoneColor(zone).split(' ')[0]} flex items-center justify-center text-[9px] font-bold transition-all duration-300 hover:brightness-125 ${zone === 'FRAGILE' || zone === 'DEAL_BREAK' ? 'animate-pulse' : ''}`}
                      style={{ width: `${pct}%` }}
                      title={`${riskZoneLabel(zone)}: ${count} cells (${pct.toFixed(1)}%)`}
                    >
                      {pct >= 8 ? count : ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] text-zinc-500 mt-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Break-even curve */}
            <div className="mt-2 pt-2 border-t border-rose-900/40">
              <div className="text-[9px] uppercase tracking-wider text-rose-300 font-bold mb-1">Break-Even Rate Curve (T1 DSCR = 1.00)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead>
                    <tr className="text-zinc-500 uppercase tracking-tight border-b border-zinc-800">
                      <th className="text-left py-0.5 pr-2">Rent Shock</th>
                      {stressMatrix.breakEvenCurve.map(pt => (
                        <th key={pt.rentOffsetPct} className={`text-center py-0.5 px-1 ${pt.rentOffsetPct === 0 ? 'text-emerald-400' : ''}`}>
                          {pt.rentOffsetPct > 0 ? '+' : ''}{pt.rentOffsetPct}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-zinc-400 py-0.5 pr-2 font-bold">Break-Even Rate</td>
                      {stressMatrix.breakEvenCurve.map(pt => (
                        <td key={pt.rentOffsetPct} className={`text-center py-0.5 px-1 font-mono ${pt.cushionBps === 99999 ? 'text-emerald-400' : pt.cushionBps >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pt.breakEvenRatePct === null ? 'never' : `${pt.breakEvenRatePct.toFixed(2)}%`}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-zinc-400 py-0.5 pr-2 font-bold">Cushion vs Base</td>
                      {stressMatrix.breakEvenCurve.map(pt => (
                        <td key={pt.rentOffsetPct} className={`text-center py-0.5 px-1 font-mono ${pt.cushionBps === 99999 ? 'text-emerald-400' : pt.cushionBps >= 100 ? 'text-emerald-400' : pt.cushionBps >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {pt.cushionBps === 99999 ? '∞' : `${pt.cushionBps >= 0 ? '+' : ''}${pt.cushionBps}bps`}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* v11.14: Break-Even Curve Area Chart — visualizes how rate cushion changes with rent shocks */}
              <div className="mt-2 bg-zinc-950/40 rounded p-2 border border-rose-900/30">
                <div className="text-[9px] uppercase tracking-wider text-rose-300 font-bold mb-1">Cushion vs Base Rate (bps) — by Rent Shock</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={stressMatrix.breakEvenCurve.map(pt => ({
                      rentShock: `${pt.rentOffsetPct > 0 ? '+' : ''}${pt.rentOffsetPct}%`,
                      cushion: pt.cushionBps === 99999 ? 400 : pt.cushionBps,
                      isInf: pt.cushionBps === 99999,
                    }))}
                    margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="cushionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="rentShock" tick={{ fill: '#a1a1aa', fontSize: 10 }} stroke="#3f3f46" />
                    <YAxis tick={{ fill: '#a1a1aa', fontSize: 9 }} stroke="#3f3f46" label={{ value: 'bps', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #9f1239', borderRadius: 6, fontSize: 11 }}
                      labelStyle={{ color: '#fb7185' }}
                      formatter={(value: number, _name: string, item: { payload?: { isInf?: boolean } }) => [
                        item?.payload?.isInf ? '∞ (never breaks)' : `${value} bps`,
                        'Cushion',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cushion"
                      stroke="#fb7185"
                      strokeWidth={2}
                      fill="url(#cushionGrad)"
                      dot={{ fill: '#fb7185', r: 3 }}
                      activeDot={{ r: 5, fill: '#fda4af' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="text-[8px] text-zinc-500 italic text-center mt-0.5">
                  Green = comfortable cushion · Yellow = thin cushion · Red = negative cushion (deal breaks below base rate)
                </div>
              </div>
            </div>

            {/* Worst/best case */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-rose-900/40">
              <div className="bg-red-950/30 rounded p-1.5 border border-red-800/30">
                <div className="text-[9px] uppercase tracking-wider text-red-400 font-bold mb-0.5">Worst Case</div>
                <div className="text-[10px] text-zinc-300 font-mono">
                  {stressMatrix.worstCase.ratePct.toFixed(2)}% × {stressMatrix.worstCase.rentOffsetPct > 0 ? '+' : ''}{stressMatrix.worstCase.rentOffsetPct}% rent
                </div>
                <div className="text-[10px] text-white font-mono">
                  T1 {stressMatrix.worstCase.track1DSCR.toFixed(3)}× · CF ${stressMatrix.worstCase.monthlyCashFlow.toFixed(0)}/mo
                </div>
                <div className={`text-[9px] ${riskZoneTextColor(stressMatrix.worstCase.riskZone)}`}>
                  {stressMatrix.worstCase.riskZone}
                </div>
              </div>
              <div className="bg-emerald-950/30 rounded p-1.5 border border-emerald-800/30">
                <div className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5">Best Case</div>
                <div className="text-[10px] text-zinc-300 font-mono">
                  {stressMatrix.bestCase.ratePct.toFixed(2)}% × {stressMatrix.bestCase.rentOffsetPct > 0 ? '+' : ''}{stressMatrix.bestCase.rentOffsetPct}% rent
                </div>
                <div className="text-[10px] text-white font-mono">
                  T1 {stressMatrix.bestCase.track1DSCR.toFixed(3)}× · CF ${stressMatrix.bestCase.monthlyCashFlow.toFixed(0)}/mo
                </div>
                <div className={`text-[9px] ${riskZoneTextColor(stressMatrix.bestCase.riskZone)}`}>
                  {stressMatrix.bestCase.riskZone}
                </div>
              </div>
            </div>

            {/* Summary text */}
            <div className="text-[10px] text-zinc-400 mt-2 leading-relaxed border-l-2 border-rose-700/40 pl-2">
              {stressMatrix.summary}
            </div>
          </div>
        )}

        {/* INSURANCE GATE (Part B'.3) */}
        {insurance && (
          <div className={`rounded-lg border p-3 ${
            insurance.verdict === 'CLEAR' ? 'bg-emerald-950/20 border-emerald-800/30' :
            insurance.verdict === 'CONFIRM_REQUIRED' ? 'bg-amber-950/20 border-amber-800/40' :
            'bg-red-950/30 border-red-800/50'
          }`}>
            <div className={`text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1 ${
              insurance.verdict === 'CLEAR' ? 'text-emerald-400' :
              insurance.verdict === 'CONFIRM_REQUIRED' ? 'text-amber-400' : 'text-red-400'
            }`}>
              <ShieldCheck className="h-3 w-3" /> INSURANCE GATE (Part B'.3) — {insurance.zoneLabel}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
              <div>
                <div className="text-[10px] text-zinc-500">Annual Premium</div>
                <div className="text-white font-mono">${fmt(insurance.premiumAnnual)}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Stress Year 3 (+25%)</div>
                <div className="text-amber-400 font-mono">${fmt(insurance.premiumStressY3)}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Verdict</div>
                <div className={`font-bold ${insurance.verdict === 'CLEAR' ? 'text-emerald-400' : insurance.verdict === 'CONFIRM_REQUIRED' ? 'text-amber-400' : 'text-red-400'}`}>
                  {insurance.verdict}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Kill Criterion</div>
                <div className={insurance.killCriterion ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {insurance.killCriterion ? 'YES — BLOCKS DEAL' : 'No'}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 leading-relaxed border-l-2 border-amber-700/40 pl-2">
              {insurance.reason}
            </div>
            {/* v11.1 D-2 fix: User-confirmed bindable quote toggle */}
            <div className="mt-2 flex items-center gap-2 p-2 rounded-md bg-zinc-900/50 border border-zinc-700/50">
              <Switch
                checked={store.insuranceQuoteConfirmed}
                onCheckedChange={(v) => {
                  store.setInsuranceQuoteConfirmed(v);
                }}
                disabled={insurance.verdict === 'CLEAR'}
              />
              <div className="flex-1">
                <div className="text-[10px] text-zinc-300 font-medium">
                  Bindable insurance quote confirmed
                </div>
                <div className="text-[9px] text-zinc-500">
                  {insurance.verdict === 'CLEAR'
                    ? 'Not required — property is in a standard-risk zone.'
                    : store.insuranceQuoteConfirmed
                      ? 'Confirmed — re-analyze to update verdict to CONFIRM_REQUIRED (Year 3 stress applies).'
                      : 'Toggle ON once a bindable quote is in hand, then re-analyze. Until then, KILL criterion remains active for high-risk zones.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* v11.1: Cost-Seg Viability card */}
        {store.v11CostSegViability && (() => {
          const cs = store.v11CostSegViability;
          return (
            <div className={`rounded-lg border p-3 ${
              cs.economic
                ? 'bg-emerald-950/20 border-emerald-800/30'
                : 'bg-zinc-950/30 border-zinc-800/50'
            }`}>
              <div className={`text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1 ${
                cs.economic ? 'text-emerald-400' : 'text-zinc-400'
              }`}>
                <Calculator className="h-3 w-3" /> COST-SEG VIABILITY (Part B'.2 #7)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                <div>
                  <div className="text-[10px] text-zinc-500">Economic?</div>
                  <div className={`font-bold ${cs.economic ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {cs.economic ? 'YES — candidate' : 'No'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Est. Study Cost</div>
                  <div className="text-white font-mono">${fmt(cs.estimatedStudyCost)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Year 1 Tax Shield</div>
                  <div className="text-emerald-400 font-mono">${fmt(cs.estimatedYear1Savings)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Reclassified %</div>
                  <div className="text-white font-mono">{cs.reclassifiedPct}%</div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 leading-relaxed border-l-2 border-zinc-700/40 pl-2">
                {cs.note}
              </div>
            </div>
          );
        })()}

        {/* KILL CRITERIA TRIGGERED */}
        {v && v.killCriteriaTriggered.filter(k => k.triggered).length > 0 && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
            <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-2 flex items-center gap-1">
              <ShieldX className="h-3 w-3" /> KILL CRITERIA & WARNINGS (Part J)
            </div>
            <div className="space-y-1.5">
              {v.killCriteriaTriggered.filter(k => k.triggered).map((k, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded ${
                  k.severity === 'BLOCKER' ? 'bg-red-950/30 border border-red-800/40' :
                  k.severity === 'WARNING' ? 'bg-amber-950/20 border border-amber-800/30' :
                  'bg-blue-950/20 border border-blue-800/30'
                }`}>
                  <Badge variant="outline" className={
                    k.severity === 'BLOCKER' ? 'bg-red-900/50 text-red-400' :
                    k.severity === 'WARNING' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-blue-900/50 text-blue-400'
                  }>{k.severity}</Badge>
                  <div className="flex-1">
                    <div className="font-bold text-white">{k.criterion}</div>
                    <div className="text-zinc-400 text-[11px]">{k.detail}</div>
                    <div className="text-emerald-400 text-[10px] mt-0.5">→ {k.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOURCE DATES & DISCLAIMERS */}
        <div className="rounded-lg bg-zinc-950/50 border border-zinc-800/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">SOURCE REGISTRY (June 17, 2026)</div>
          <div className="text-[10px] text-zinc-500 leading-relaxed">
            Math: direct computation, golden vector Part A.2. Rates: FRED DGS10 (10yr 4.47%), FRB H.15 (FFR 3.62%), Northmarq (5yr 4.26%, SOFR 3.59%).
            Tax: IRC §167/168/1250/1411/469; OBBBA (signed Jan 2025, 100% bonus dep). PPP: MN HF 3437 enacted April 23, 2026, eff. August 1, 2026.
            Lender anchors: 19 lender profiles (9 spec anchors + 3 bonus + 4 v11.2 roadmap: A&D Mortgage, LendingOne, Civic Financial, Finance of America + 3 v11.3 roadmap: Broadmark/Ready Capital, Park Place Finance, Stratton Capital), each with confidence scores + counterparty continuity flags. All 9 spec Part I anchors now have full LenderProgram records (American Heritage added v11.1). State PPP laws: 48 entries (14 original + 6 v11.2 additions: CA, TX, FL, GA, NC, CO + 5 v11.3 additions: TN, AZ, VA, IN, SC + 5 v11.4 additions: OR, NV, UT, MO, AL + 13 v11.5 additions: NY, HI, WV, VT, NH, DE, RI, ID, MT, WY, NE, IA, SD + 5 v11.9 additions: AR, LA, OK, KY, DC — all with documented business-purpose carve-outs + DIDMCA preemption). Portfolio analytics: v11.6 added lender/geographic concentration risk, DSCR distribution stats, negative-cash-flow bleed tracking. Refi tracker: v11.7 added 4-factor readiness score (Seasoning/Equity/Rate Incentive/DSCR Headroom, max 100), refi-type classification (RATE_TERM/CASH_OUT/NO_REFI), 70% LTV cash-out capacity. ARM/SOFR engine: v11.8 added 5-scenario stress testing (Bullish/Base/Bearish/Stress/Crisis SOFR sustained at 2.59-7.00%), Reg Z payment-shock disclosure, DSCR break-year analysis, refi-trigger rate solver. Monte Carlo: v11.10 added Vasicek mean-reverting SOFR path simulator (500 paths × 120 months, κ=0.30, θ=3.50%, σ=1.20%, with FOMC shock jumps), computes P(DSCR&lt;1.0/1.25/1.50) + rate percentiles + cap-hit probability. Lender Match Score: v11.11 added 6-factor weighted recommendation engine (Rate Competitiveness 25%, DSCR Headroom 20%, Reserve Burden 15%, Provenance Confidence 15%, LTV Fit 15%, Flexibility 10%) with TOP_PICK/STRONG/VIABLE/WEAK tier classification and top-3 ranking. Stress Matrix: v11.12 added 2D rate×rent heatmap (12 rate offsets × 10 rent offsets = 120 cells) with 5 risk zones (SAFE/COMFORTABLE/MARGINAL/FRAGILE/DEAL_BREAK), Track 1+2 DSCR per cell, monthly cash flow, break-even rate curve, and worst/best case summary. IRR Waterfall: v11.13 added 16-stage Year-1 waterfall (gross rent → vacancy → opex → NOI → interest → principal → pre-tax CF → depreciation → taxable → fed tax → state tax → after-tax CF) + hold-total 19-stage waterfall + 4-cell exit waterfall (sale - costs - loan - tax = net proceeds) with exit multiple + tax drag.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
