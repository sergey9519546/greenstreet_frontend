import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { swatch, radius, risk, font } from "../theme";
import { DscrGauge, BalanceScale, RiskFlame, riskFromDscr } from "../design/artifacts";
import {
  computeVerdictDetail,
  computeDealKillCheck,
  computeAcquisitionScore,
  assessDecisionSupportEvidence,
  type ProceedGate,
  type Track2Acknowledgment,
} from "../engine/decisionSupport";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import { computeReserveScenarios } from "../engine/reserveEngine";
import { checkInsuranceGate } from "../engine/v11Runner";
import { checkPPPLegal } from "../engine/statePppLaws";
import {
  assumptionsFromV11,
  buildReturnsSchedule,
  DEFAULT_TAX_ASSUMPTIONS,
} from "../engine/returnsEngine";
import {
  DATA_VINTAGE,
  REVIEWED_AS_OF,
  formatVintage,
  staleDatasets,
  type DataVintageKey,
} from "../engine/dataVintage";
import type { EntityType, LenderRankingEntry, ReserveAsset } from "../engine/types";
import { DSCR_PROGRAMS, DSCR_PROGRAMS_AS_OF, lookupMaxLTV } from "../data/dscrPrograms";
import BottomCTA from "../design/BottomCTA";
import { CurrencyInput } from "../components/ui/CurrencyInput";

// ── tokens ──────────────────────────────────────────────────────────────────
// Two surfaces only (DESIGN_SOURCE_OF_TRUTH §2): #003738 band, #004041 card fill.
const BAND = dc.dark;          // #003738 — the section ground
const CARD = swatch.darkTeal;  // #004041 — card fill ONLY, never a band
const HAIRLINE = "1px solid rgba(238,239,211,0.16)";
const INK = dc.cream;
const INK_DIM = dc.ink.secondary;

// One risk ramp. On the midnight ground the on-dark inks are the readable pair.
function verdictColor(v: string): string {
  if (v === "PROCEED") return dc.emerald;
  if (v === "RESTRUCTURE") return risk.cautionOnDark;
  return risk.dangerOnDark;
}
function gradeColor(g: string): string {
  if (g === "A" || g === "B") return dc.emerald;
  if (g === "C" || g === "D") return risk.warning;
  return risk.dangerOnDark;
}
function severityColor(s: string): string {
  if (s === "BLOCKER") return risk.dangerOnDark;
  if (s === "WARNING") return risk.warning;
  return risk.cautionOnDark;
}

// ── formatting ──────────────────────────────────────────────────────────────
// One currency formatter, one locale, signed. `-$1,234`, never `$-1,234`.
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
function money(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "not established";
  return n < 0 ? `-${USD.format(Math.abs(n))}` : USD.format(n);
}
function pct(n: number | null, digits = 1): string {
  if (n === null || !Number.isFinite(n)) return "not established";
  return `${n.toFixed(digits)}%`;
}
function ratio(n: number | null, digits = 2): string {
  if (n === null || !Number.isFinite(n)) return "not established";
  return `${n.toFixed(digits)}×`;
}
/** A finite number, or null. Non-finite is MISSING — never a value to publish. */
function finite(n: number | null | undefined): number | null {
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}
/** returnsEngine reports percentages; the verdict engine wants decimals. */
function toDecimal(percentValue: number | null): number | null {
  const v = finite(percentValue);
  return v === null ? null : v / 100;
}

// ── Gate gauge — the hero's live answer, derived from the gates themselves ───
//
// This replaces a "composite score" whose five weights summed to 0.92 (so a
// flawless deal could only ever reach 92/100) and whose liquidity term was the
// constant 60 — a fabricated input the page never collected. The needle now
// shows a number the user can COUNT on screen: PROCEED gates cleared.
function VerdictGauge({ cleared, total, verdict }: { cleared: number; total: number; verdict: string }) {
  const frac = total > 0 ? cleared / total : 0;
  const needleDeg = -74 + frac * 148;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "clamp(12px,2vw,28px)" }}>
      <svg
        id="ds-gauge"
        viewBox="0 0 280 186"
        style={{ width: "100%", maxWidth: 380, overflow: "visible" }}
        role="img"
        aria-label={`${cleared} of ${total} decision gates cleared — verdict ${verdict}`}
      >
        <path d="M 30,150 A 110,110 0 0 1 73,64" fill="none" stroke={risk.danger} strokeWidth="16" strokeLinecap="round" />
        <path d="M 86,54 A 110,110 0 0 1 194,54" fill="none" stroke={risk.caution} strokeWidth="16" strokeLinecap="round" />
        <path d="M 207,64 A 110,110 0 0 1 250,150" fill="none" stroke={risk.positive} strokeWidth="16" strokeLinecap="round" />

        <g style={{ transformOrigin: "140px 150px", transform: `rotate(${needleDeg}deg)`, transition: "transform 0.55s cubic-bezier(.4,0,.2,1)" }}>
          <line x1="140" y1="150" x2="140" y2="60" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <circle cx="140" cy="150" r="9" fill={INK} />
        </g>

        <text x="28" y="170" fill={risk.dangerOnDark} fontSize="11" fontFamily={dc.mono} textAnchor="middle">PASS</text>
        <text x="140" y="34" fill={risk.cautionOnDark} fontSize="11" fontFamily={dc.mono} textAnchor="middle">RESTRUCTURE</text>
        <text x="252" y="170" fill={dc.emerald} fontSize="11" fontFamily={dc.mono} textAnchor="middle">PROCEED</text>

        <text x="140" y="170" fill={INK} fontSize="15" fontFamily={dc.mono} textAnchor="middle" fontWeight="600">
          {cleared}/{total} gates
        </text>
        <text x="140" y="184" fill={INK_DIM} fontSize="10.5" fontFamily={dc.mono} textAnchor="middle">
          cleared
        </text>
      </svg>
    </div>
  );
}

// ── small building blocks ───────────────────────────────────────────────────
function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ background: CARD, borderRadius: radius.lg, border: HAIRLINE, padding: 26, ...style }}>
      {children}
    </div>
  );
}

function Eyebrow({ children, color = dc.emerald }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function StatCell({ label, value, note, color }: { label: string; value: string; note?: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: INK_DIM }}>{label}</span>
      <Mono style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: color ?? INK, lineHeight: 1.05 }}>{value}</Mono>
      {note ? <span style={{ fontSize: 11.5, color: INK_DIM, lineHeight: 1.4 }}>{note}</span> : null}
    </div>
  );
}

// ── the datasets this page actually reads ───────────────────────────────────
const USED_VINTAGE_KEYS: { key: DataVintageKey; usedFor: string }[] = [
  { key: "dscrPrograms", usedFor: "Program eligibility, LTV caps and the lender DSCR floor used by the verdict." },
  { key: "rateAnchor", usedFor: "The solved note rate, the deal-break rate and the rate-headroom gate." },
  { key: "taxRules", usedFor: "Depreciation, interest deduction and recapture inside the after-tax IRR." },
  { key: "insuranceTable", usedFor: "Insurance is a user input here; this table is the fallback the engine would otherwise use." },
];

export default function DecisionSupportPage({ onNavigate }: { onBack?: () => void; onNavigate: (v: any) => void }) {
  useEffect(() => {
    document.title = "Decision Support | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // ── Deal inputs ───────────────────────────────────────────────────────────
  // NOTE: the old "Note Rate" field was removed. `solveDSCR` SOLVES the rate
  // from the FICO/LTV pricing grid, so the field the user could edit changed
  // nothing on screen. The solved rate is now published as an OUTPUT instead.
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct, setDownPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  // State and vesting must be explicit. A Texas/PPP-allowed default gave every
  // visitor a state-specific conclusion without asking where or how they would
  // hold the property.
  const [propertyState, setPropertyState] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("LLC");
  const [fico, setFico] = useState(740);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);
  const [insuranceQuoteConfirmed, setInsuranceQuoteConfirmed] = useState(false);
  const [reportedLiquidReserves, setReportedLiquidReserves] = useState(0);
  const [reserveEvidenceDocumented, setReserveEvidenceDocumented] = useState(false);
  // The exit assumptions move the after-tax IRR further than any other input on
  // this page — at the engine default of a 6.5% exit cap, a property bought at a
  // sub-5% cap is modelled as sold at a ~25% discount, and that spread (not the
  // rent) decides the return grade. Leaving it buried in a default was the
  // largest invisible assumption here, so it is now a field the user can see.
  const [exitCapRate, setExitCapRate] = useState(6.5);
  const [holdYears, setHoldYears] = useState(5);

  // ── Track-2 acknowledgment (see decisionSupport.computeVerdict) ────────────
  // An acknowledgment is something the investor GIVES. It starts absent.
  const [ackChecked, setAckChecked] = useState(false);
  const [ackThesisDollars, setAckThesisDollars] = useState(0);
  const [ackStatement, setAckStatement] = useState("");

  const result = useMemo(() => {
    try {
      const inputs = buildEngineInputs({
        purchasePrice,
        loanAmount: purchasePrice * (1 - downPct / 100),
        monthlyRent,
        state: propertyState,
        entityType,
        ficoScore: fico,
        propertyType: "SFR" as const,
        annualTaxes,
        annualInsurance,
        hoa,
      });
      const deal = solveDSCR(inputs.property, inputs.borrower, inputs.loan, inputs.strategy);
      const reserveAssets: ReserveAsset[] = reportedLiquidReserves > 0
        ? [{ type: "CHECKING", value: reportedLiquidReserves }]
        : [];
      const borrower = {
        ...inputs.borrower,
        availableReserves: reportedLiquidReserves,
        reserveAssets,
      };
      const insuranceGate = checkInsuranceGate(
        inputs.property.state,
        false,
        false,
        insuranceQuoteConfirmed,
        inputs.property.annualInsurance,
      );
      const reserveScenarios = computeReserveScenarios(
        deal.dscr,
        deal.monthlyPITIA.total,
        inputs.strategy,
        borrower,
        inputs.loan,
        inputs.property.state,
        reserveAssets,
      );
      const pppResult = checkPPPLegal(
        inputs.property.state,
        borrower.entityType,
        deal.loanAmount,
        inputs.property.unitCount,
        inputs.loan.armType === "FIXED" ? "FIXED" : "ARM",
      );
      const evidenceReview = assessDecisionSupportEvidence({
        propertyState: inputs.property.state,
        pppResult,
        insuranceGate,
        reserveScenarios,
        reserveEvidence: reserveEvidenceDocumented
          ? "DOCUMENTED"
          : reportedLiquidReserves > 0
            ? "SELF_REPORTED"
            : "NOT_PROVIDED",
      });

      // ── ONE approved scenario and debt schedule ──────────────────────────
      // Every return figure below is read off a SINGLE amortising schedule that
      // runs acquisition → operations → sale. Nothing is re-derived, so the
      // IRR, the after-tax IRR, the cash-on-cash and the equity multiple cannot
      // disagree with each other or with the debt service in the DSCR.
      //
      // This replaces `afterTaxIRR = max(0, year1CoC/100 * 5)`, which was not an
      // IRR at all: it floored negative cash flow at zero (a deal bleeding
      // $1,554/mo reported 0.00% instead of a loss) and multiplied a one-year
      // yield by five to make a CUMULATIVE figure, which was then graded against
      // ANNUALISED thresholds — a 22.95% cash-on-cash printed 114.75% and graded A.
      const grossRentMonthly = Math.min(inputs.property.leaseRent, inputs.property.marketRent);
      const assumptions = {
        ...assumptionsFromV11(
          inputs.property,
          inputs.loan,
          grossRentMonthly,
          inputs.strategy,
          deal.solvedRate,
          0,
          deal.cashToClose.total,
        ),
        exitCapRatePct: exitCapRate,
        holdYears: Math.max(1, Math.round(holdYears)),
        // The pre-tax Part B contract disables tax; an after-tax IRR needs it on.
        tax: { ...DEFAULT_TAX_ASSUMPTIONS, enabled: true },
      };
      const schedule = buildReturnsSchedule(assumptions);

      const afterTaxIRR = toDecimal(schedule.metrics.afterTaxIrrPct);
      const preTaxIRR = toDecimal(schedule.metrics.leveredIrrPct);
      const year1CoC = toDecimal(schedule.metrics.year1CashOnCashPct);
      const equityMultiple = finite(schedule.metrics.equityMultiple);

      const track2DSCR = deal.dualTrackDSCR.track2.dscr;
      const track2MonthlyCashFlow = deal.dualTrackDSCR.track2.monthlyCashFlow;
      const ltvNeeded = 100 - downPct;

      // ── Lender ranking — EVERY program evaluated, eligible or not ─────────
      // The previous version built the ranking only from matching programs and
      // stamped each with confidenceScore 85, estimatedRate 7.0 and
      // counterparty continuity 90 — none of which exist in dscrPrograms.ts.
      // A fabricated 85 also silently cleared the "<60 confidence" kill.
      const evaluated = DSCR_PROGRAMS.map((p) => {
        const offerLTV = lookupMaxLTV(p, fico, deal.loanAmount, deal.dscr >= 0.01 ? deal.dscr : null, "purchase");
        const reasons: string[] = [];
        if (fico < p.minFICO) reasons.push(`FICO ${fico} below program minimum ${p.minFICO}`);
        if (offerLTV === null) reasons.push("No LTV grid cell matches this FICO / loan size / DSCR");
        else if (offerLTV < ltvNeeded) reasons.push(`Offers ${offerLTV}% LTV; this deal needs ${ltvNeeded}%`);
        if (deal.loanAmount > p.maxLoan) reasons.push(`Loan ${money(deal.loanAmount)} above program max ${money(p.maxLoan)}`);
        if (p.minLoan !== undefined && deal.loanAmount < p.minLoan) reasons.push(`Loan ${money(deal.loanAmount)} below program min ${money(p.minLoan)}`);
        return { program: p, offerLTV, eligible: reasons.length === 0, reasons };
      });

      // Best fit = most leverage available; ties broken by the HIGHER DSCR floor
      // so a tie never quietly picks the loosest floor.
      const bestFit = evaluated
        .filter((e) => e.eligible)
        .sort((a, b) => (b.offerLTV ?? 0) - (a.offerLTV ?? 0) || b.program.dscrFloor - a.program.dscrFloor)[0] ?? null;

      const lenderRanking: LenderRankingEntry[] = evaluated.map((e, i) => ({
        rank: i + 1,
        lenderId: e.program.id,
        lenderName: e.program.name,
        fitTier: e.eligible ? ("STANDARD_FIT" as const) : ("DOES_NOT_MEET_GUIDELINES" as const),
        eligible: e.eligible,
        ineligibleReasons: e.reasons,
        // The engine-solved rate for THIS scenario. dscrPrograms.ts carries no
        // pricing at all, so this is not a lender quote and is labelled as such.
        estimatedRate: deal.solvedRate,
        aey: deal.solvedRate,
        totalCost60mo: 0,
        // No confidence model scores these programs. 0 is not "low confidence";
        // the verdict is told the score is absent via `bestLenderConfidence: null`.
        confidenceScore: 0,
        counterpartyRisk: {
          lenderId: e.program.id,
          continuityScore: 0,
          knownDisruption: null,
          lastReportedStatus: "NOT_ASSESSED",
          flag: "WATCH" as const,
        },
        pppAllowed: false,
        pppStructure: "not established",
        provenance: "VERIFIED_PRIMARY" as const,
        provenanceWarnings: [
          `Eligibility grid pulled ${DSCR_PROGRAMS_AS_OF}. Rate shown is the engine-solved rate for this scenario, not a lender quote — the program data carries no pricing.`,
        ],
        sourceSnapshot: DSCR_PROGRAMS_AS_OF,
      }));

      const acknowledgment: Track2Acknowledgment | null = ackChecked
        ? { acknowledged: true, thesisMonthlyDollars: ackThesisDollars, thesisStatement: ackStatement }
        : null;

      const { verdict, gates } = computeVerdictDetail({
        track1DSCR: deal.dscr,
        track2DSCR,
        // Real floor from the dated program matrix. NaN when nothing fits, which
        // the verdict treats as "floor unknown" rather than defaulting to 1.0.
        lenderMinDSCR: bestFit ? bestFit.program.dscrFloor : Number.NaN,
        afterTaxIRR,
        preTaxIRR,
        year1CoC,
        dealBreakRate: deal.dealBreakRate,
        solvedRate: deal.solvedRate,
        rateHeadroomBps: deal.rateHeadroomBps,
        appraisalBreakpointPercent: deal.appraisalBreakpointPercent,
        insuranceGate,
        brrrrGate: null,
        armReset: null,
        strLegalityStatus: "NOT_APPLICABLE", // long-term rental: the STR gate does not apply
        pppResult,
        pppAllowed: pppResult.allowed,
        ficoScore: fico,
        ltv: ltvNeeded,
        ltvCap: bestFit ? bestFit.program.maxLTV : Number.NaN,
        loanAmount: deal.loanAmount,
        lenderMinLoan: bestFit?.program.minLoan ?? Number.NaN,
        bestLenderConfidence: null, // no confidence model exists for these programs
        lenderRanking,
        isDecliningMarket: inputs.property.isDecliningMarket,
        track2MonthlyCashFlow,
        track2Acknowledgment: acknowledgment,
        evidenceReview,
      });

      const kill = computeDealKillCheck(deal, borrower, inputs.loan, inputs.property, inputs.strategy, reserveScenarios, pppResult, null);
      const acq = computeAcquisitionScore(deal, reserveScenarios, inputs.property, borrower, inputs.loan, inputs.strategy, null, pppResult);

      const cleared = gates.filter((g) => g.passed).length;

      return {
        deal,
        schedule,
        assumptions,
        verdict,
        gates,
        cleared,
        kill,
        acq,
        afterTaxIRR,
        preTaxIRR,
        year1CoC,
        equityMultiple,
        track2DSCR,
        track2MonthlyCashFlow,
        evaluated,
        bestFit,
        pppResult,
        insuranceGate,
        reserveScenarios,
        evidenceReview,
      };
    } catch {
      return null;
    }
  }, [purchasePrice, downPct, monthlyRent, propertyState, entityType, fico, annualTaxes, annualInsurance, hoa, insuranceQuoteConfirmed, reportedLiquidReserves, reserveEvidenceDocumented, exitCapRate, holdYears, ackChecked, ackThesisDollars, ackStatement]);

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#ds-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  const heroVerdict = result?.verdict.verdict ?? "—";
  const stale = staleDatasets();
  const staleKeys = new Set(stale.map((s) => s.key));

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Programs", view: "lender-intel" },
      ]}
      cta={{ label: "Get the verdict →", onClick: scrollToTool }}
    >
      <style>{`
        @media(max-width:991px){.ds-tool-grid{grid-template-columns:1fr !important;} .dc-hero{grid-template-columns:1fr !important;} .ds-verdict-inner{grid-template-columns:1fr !important;} .ds-bottom-2{grid-template-columns:1fr !important;} .ds-returns-4{grid-template-columns:1fr 1fr !important;}}
        @media(max-width:767px){.ds-band-2{grid-template-columns:1fr !important;} .ds-returns-4{grid-template-columns:1fr !important;} .ds-gate-row{grid-template-columns:1fr !important;}}
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: BAND, color: INK, padding: `clamp(64px,9vh,120px) ${dc.pad} clamp(56px,7vh,92px)`, overflow: "hidden" }}>
        <div
          className="dc-hero"
          style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(36px,5vw,80px)", alignItems: "center" }}
        >
          <div id="gs-hero-content">
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase", color: INK_DIM,
                background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)",
                borderRadius: 100, padding: "7px 14px", marginBottom: 24,
              }}
            >
              Decision engine · preliminary screen
            </div>
            <H1 style={{ margin: "0 0 24px" }}>Should you buy this deal?</H1>
            <Lead style={{ color: dc.ink.dim, maxWidth: "50ch", margin: "0 0 20px" }}>
              Enter the deal on the left. One amortising schedule runs it from purchase through sale, and six
              gates decide the verdict: PROCEED, RESTRUCTURE, or PASS. Every gate shows what it required and
              what your deal actually returned, so you can see exactly which one binds.
            </Lead>
          </div>
          <VerdictGauge cleared={result?.cleared ?? 0} total={result?.gates.length ?? 6} verdict={heroVerdict} />
        </div>
      </section>

      {/* ── TOOL ── */}
      <section
        id="ds-tool"
        style={{ background: BAND, color: INK, padding: `clamp(52px,7vw,92px) ${dc.pad} clamp(64px,9vh,116px)`, borderTop: HAIRLINE }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 34 }}>
            <Eyebrow color={dc.lemon}>Live decision-support engine</Eyebrow>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 10px", color: INK }}>
              Verdict:{" "}
              <span style={{ color: result ? verdictColor(heroVerdict) : dc.lemon }}>{heroVerdict}</span>
            </h2>
            <p style={{ fontSize: 15, color: INK_DIM, margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              {result
                ? result.verdict.bindingConstraint
                : "Engine returned no result — check the inputs."}
            </p>
          </div>

          <div className="gs-reveal ds-tool-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 36, alignItems: "start" }}>
            {/* ── INPUTS ── */}
            <Card style={{ padding: 30 }}>
              <Eyebrow>Deal &amp; borrower</Eyebrow>
              <p style={{ fontSize: 12, color: INK_DIM, margin: "0 0 18px", lineHeight: 1.5 }}>
                Estimates are fine for screening. The page never treats an estimate as a lender approval: state, insurance, and post-close reserves still need review.
              </p>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Property State (2-letter)
                </span>
                <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 5, lineHeight: 1.4 }}>
                  Required for the governed prepayment review and state-level underwriting overlays. Leave blank only if you want a manual-review result.
                </span>
                <input
                  aria-label="Property State"
                  type="text"
                  maxLength={2}
                  value={propertyState}
                  onChange={(e) => setPropertyState((e.target.value || "").toUpperCase().slice(0, 2))}
                  placeholder="e.g. TX"
                  style={{ width: "100%", boxSizing: "border-box", background: BAND, color: INK, border: HAIRLINE, borderRadius: radius.sm, padding: "12px 14px", fontSize: 16, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", outline: "none" }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Projected Vesting
                </span>
                <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 5, lineHeight: 1.4 }}>
                  Used only to run the existing state PPP matrix. Your lender and counsel must confirm the actual closing vesting.
                </span>
                <select
                  aria-label="Projected Vesting"
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as EntityType)}
                  style={{ width: "100%", boxSizing: "border-box", background: BAND, color: INK, border: HAIRLINE, borderRadius: radius.sm, padding: "12px 14px", fontSize: 15, fontWeight: 600, outline: "none" }}
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="LLC">LLC</option>
                  <option value="S_CORP">S corporation</option>
                  <option value="C_CORP">C corporation</option>
                  <option value="TRUST">Trust</option>
                </select>
              </label>

              {([
                { label: "Purchase Price", hint: "What you're paying for the property.", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$", suffix: "" },
                { label: "Down Payment", hint: "Your cash in. Higher down = lower LTV = stronger approval odds.", value: downPct, set: setDownPct, step: 1, prefix: "", suffix: "%" },
                { label: "Monthly Rent", hint: "Expected gross rent. For a vacant property, use market-comparable rent.", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$", suffix: "" },
                { label: "FICO Score", hint: "620 is the floor for most DSCR programs; 740+ unlocks the best grid cells.", value: fico, set: setFico, step: 5, prefix: "", suffix: "" },
                { label: "Annual Taxes", hint: "Property taxes per year. County assessor site — an estimate is fine.", value: annualTaxes, set: setAnnualTaxes, step: 250, prefix: "$", suffix: "" },
                { label: "Annual Ins.", hint: "Annual hazard premium. An estimate is modeled, but the verdict remains preliminary until you confirm a current bindable quote.", value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$", suffix: "" },
                { label: "Monthly HOA", hint: "HOA dues per month. Enter 0 if none.", value: hoa, set: setHoa, step: 25, prefix: "$", suffix: "" },
                { label: "Hold Period", hint: "Years until you sell. The return is measured over this window.", value: holdYears, set: setHoldYears, step: 1, prefix: "", suffix: "yr" },
                { label: "Exit Cap Rate", hint: "The cap rate you assume a buyer pays when you sell. This single field moves the return more than anything else on this page.", value: exitCapRate, set: setExitCapRate, step: 0.25, prefix: "", suffix: "%" },
              ] as const).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 16 }}>
                  <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {f.label}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 5, lineHeight: 1.4 }}>{f.hint}</span>
                  <CurrencyInput
                    surface="dark"
                    value={f.value}
                    onChange={f.set as (n: number) => void}
                    step={f.step}
                    prefix={f.prefix}
                    suffix={f.suffix}
                    style={{ background: BAND, padding: "0 13px" }}
                    inputStyle={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </label>
              ))}

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Reported Liquid Reserves After Close
                </span>
                <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 5, lineHeight: 1.4 }}>
                  Cash remaining after down payment and closing. This scenario models it as checking-account cash; other asset types can have lender haircuts.
                </span>
                <CurrencyInput
                  ariaLabel="Reported Liquid Reserves After Close"
                  surface="dark"
                  value={reportedLiquidReserves}
                  onChange={setReportedLiquidReserves}
                  step={1000}
                  prefix="$"
                  style={{ background: BAND, padding: "0 13px" }}
                  inputStyle={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                />
              </label>

              <div style={{ borderTop: HAIRLINE, marginTop: 22, paddingTop: 16, display: "grid", gap: 12 }}>
                <label style={{ display: "flex", gap: 9, alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={insuranceQuoteConfirmed}
                    onChange={(e) => setInsuranceQuoteConfirmed(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: dc.emerald, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: INK_DIM, lineHeight: 1.45 }}>
                    I have reviewed a current bindable insurance quote for this property and entered that annual premium above.
                  </span>
                </label>
                <label style={{ display: "flex", gap: 9, alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={reserveEvidenceDocumented}
                    onChange={(e) => setReserveEvidenceDocumented(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: dc.emerald, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: INK_DIM, lineHeight: 1.45 }}>
                    I have reviewed current statements showing the reported reserves remain available after closing. A lender must still confirm eligibility.
                  </span>
                </label>
              </div>

              <div style={{ borderTop: HAIRLINE, marginTop: 22, paddingTop: 16 }}>
                <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 6, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Note rate — solved, not entered
                </span>
                <Mono style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: dc.lemon }}>
                  {result ? pct(result.deal.solvedRate, 3) : "—"}
                </Mono>
                <p style={{ fontSize: 11, color: INK_DIM, margin: "6px 0 0", lineHeight: 1.45 }}>
                  The engine prices this rate off the FICO and LTV grid. It is an output, not an input — an
                  editable rate field here would have changed nothing on screen.
                </p>
              </div>
            </Card>

            {/* ── RESULTS ── */}
            {!result ? (
              <Card style={{ padding: 40, textAlign: "center" }}>
                <p style={{ color: risk.dangerOnDark, fontWeight: 600, margin: 0 }}>
                  Engine returned no result for these inputs. Nothing is published when the model cannot run.
                </p>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* VERDICT CARD */}
                <Card className="gs-reveal" style={{ padding: "clamp(28px,3vw,40px)" }}>
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: result.verdict.verdict === "PROCEED" ? "rgba(77,189,151,0.12)" : result.verdict.verdict === "RESTRUCTURE" ? risk.cautionBg : risk.dangerBg,
                        border: `1px solid ${verdictColor(result.verdict.verdict)}`, borderRadius: 100, padding: "6px 14px", marginBottom: 12,
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: verdictColor(result.verdict.verdict), display: "inline-block" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: verdictColor(result.verdict.verdict) }}>
                        Preliminary modeled verdict
                      </span>
                    </div>
                    {result.verdict.manualReviewRequired ? (
                      <p style={{ color: risk.cautionOnDark, fontSize: 12.5, fontWeight: 600, margin: "0 0 12px", lineHeight: 1.5 }}>
                        Manual review required — incomplete state, PPP, insurance, or reserve evidence means this is not an approval recommendation.
                      </p>
                    ) : (
                      <p style={{ color: INK_DIM, fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.5 }}>
                        This is a preliminary modeled screen, not a lender approval, rate lock, legal conclusion, or commitment to lend.
                      </p>
                    )}
                    <Mono style={{ display: "block", fontSize: "clamp(42px,5vw,64px)", fontWeight: 600, letterSpacing: "-0.02em", color: verdictColor(result.verdict.verdict), lineHeight: 1, marginBottom: 14 }}>
                      {result.verdict.verdict}
                    </Mono>
                    <div style={{ background: BAND, border: HAIRLINE, borderRadius: radius.sm, padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: INK_DIM, display: "block", marginBottom: 4 }}>
                        Binding constraint
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: INK }}>
                        {result.verdict.bindingConstraint}
                      </span>
                    </div>
                  </div>

                  {/* Three symmetric bays */}
                  <div className="ds-verdict-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "clamp(16px,2.5vw,28px)", alignItems: "stretch", padding: "24px 0", borderTop: HAIRLINE, borderBottom: HAIRLINE, marginBottom: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: INK_DIM }}>Track 1 DSCR</div>
                      <DscrGauge value={result.deal.dscr} size={138} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <RiskFlame level={riskFromDscr(result.deal.dscr)} size={16} />
                        <span style={{ fontSize: 11, color: INK_DIM, fontWeight: 500 }}>
                          floor {result.bestFit ? result.bestFit.program.dscrFloor.toFixed(2) : "not established"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: INK_DIM }}>Rent vs PITIA</div>
                      <BalanceScale rent={monthlyRent} payment={result.deal.monthlyPITIA.total} size={150} />
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 210 }}>
                        <span style={{ fontSize: 11, color: INK_DIM }}>{money(monthlyRent)} rent</span>
                        <span style={{ fontSize: 11, color: INK_DIM }}>{money(result.deal.monthlyPITIA.total)} PITIA</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: INK_DIM }}>Track 2 monthly carry</div>
                      <Mono style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: result.track2MonthlyCashFlow >= 0 ? dc.emerald : risk.dangerOnDark }}>
                        {money(result.track2MonthlyCashFlow)}
                      </Mono>
                      <span style={{ fontSize: 11, color: INK_DIM, lineHeight: 1.45 }}>
                        per month after operating expenses · Track 2 DSCR {ratio(result.track2DSCR, 3)}
                      </span>
                    </div>
                  </div>

                  {/* Return stack — every figure from the one schedule */}
                  <div className="ds-returns-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "clamp(14px,2vw,24px)", marginBottom: 20 }}>
                    <StatCell
                      label="After-tax IRR"
                      value={pct(result.afterTaxIRR === null ? null : result.afterTaxIRR * 100)}
                      note={`Graded A ≥15% · B ≥12% · C ≥8%`}
                      color={gradeColor(result.verdict.returnGrade)}
                    />
                    <StatCell
                      label="Pre-tax levered IRR"
                      value={pct(result.preTaxIRR === null ? null : result.preTaxIRR * 100)}
                      note={`${result.assumptions.holdYears}-yr hold, exit at ${result.assumptions.exitCapRatePct}% cap`}
                    />
                    <StatCell
                      label="Year-1 cash-on-cash"
                      value={pct(result.year1CoC === null ? null : result.year1CoC * 100)}
                      note={`On ${money(result.schedule.acquisition.cashInvested)} cash invested · signed, not floored at zero`}
                      color={result.year1CoC !== null && result.year1CoC < 0 ? risk.dangerOnDark : undefined}
                    />
                    <StatCell
                      label="Equity multiple"
                      value={result.equityMultiple === null ? "not established" : `${result.equityMultiple.toFixed(2)}×`}
                      note={`Break-even year ${result.schedule.metrics.breakEvenYear ?? "not within hold"}`}
                    />
                  </div>

                  <p style={{ fontSize: 12, color: INK_DIM, margin: "0 0 18px", lineHeight: 1.55, background: BAND, border: HAIRLINE, borderRadius: radius.sm, padding: "10px 14px" }}>
                    <strong style={{ color: INK, fontWeight: 600 }}>Read this before the IRR: </strong>
                    you are buying at a {pct(result.schedule.metrics.entryCapRatePct, 2)} entry cap and the schedule
                    sells at a {pct(result.assumptions.exitCapRatePct, 2)} exit cap
                    {" "}— a {pct(result.assumptions.exitCapRatePct - result.schedule.metrics.entryCapRatePct, 2)} spread
                    against you. That spread, not the rent, is usually what decides the return grade. Change the exit
                    cap on the left to see the verdict move.
                  </p>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href="/rate-quiz"
                      onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: dc.emerald, color: dc.dark, fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "10px 18px", borderRadius: radius.sm, minHeight: 44 }}
                    >
                      Get my rate →
                    </a>
                    <a
                      href="/lender-intel"
                      onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1.5px solid rgba(238,239,211,0.5)", color: dc.ink.dim, fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "10px 16px", borderRadius: radius.sm, minHeight: 44 }}
                    >
                      See matching programs →
                    </a>
                  </div>
                  <p style={{ fontSize: 11, color: INK_DIM, margin: "10px 0 0" }}>
                    Preliminary estimate — not a commitment to lend. Submit a scenario review for exact underwriting.
                  </p>
                </Card>

                {/* ── EVIDENCE REVIEW ── */}
                <Card className="gs-reveal">
                  <Eyebrow color={result.evidenceReview.status === "READY_FOR_MODELED_VERDICT" ? dc.emerald : risk.cautionOnDark}>
                    Scenario evidence review
                  </Eyebrow>
                  <p style={{ fontSize: 12.5, color: INK_DIM, margin: "0 0 16px", lineHeight: 1.5 }}>
                    State and PPP are calculated from the existing governed matrix. Insurance and reserves are reported inputs that must be confirmed in the actual lender file.
                  </p>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                      <strong style={{ display: "block", fontSize: 13, color: INK, marginBottom: 3 }}>
                        PPP review for {propertyState || "an unselected state"}
                      </strong>
                      <span style={{ fontSize: 12, color: INK_DIM, lineHeight: 1.45 }}>
                        {result.pppResult.status.replace(/_/g, " ")} · {result.pppResult.reason}
                      </span>
                    </div>
                    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                      <strong style={{ display: "block", fontSize: 13, color: INK, marginBottom: 3 }}>
                        Insurance evidence
                      </strong>
                      <span style={{ fontSize: 12, color: INK_DIM, lineHeight: 1.45 }}>
                        {result.insuranceGate.quoteConfirmed
                          ? `Reported bindable quote: ${money(result.insuranceGate.premiumAnnual)}/yr. ${result.insuranceGate.reason}`
                          : "No bindable quote confirmed. The annual insurance amount remains a modeled estimate until a quote is reviewed."}
                      </span>
                    </div>
                    <div style={{ padding: "10px 0" }}>
                      <strong style={{ display: "block", fontSize: 13, color: INK, marginBottom: 3 }}>
                        Conservative eligible reserves
                      </strong>
                      <span style={{ fontSize: 12, color: INK_DIM, lineHeight: 1.45 }}>
                        {money(result.reserveScenarios.conservative.totalEligibleReserves)} modeled eligible against {money(result.reserveScenarios.conservative.totalDollars)} required. {result.evidenceReview.status === "READY_FOR_MODELED_VERDICT" ? "Reported evidence is complete for this model; lender eligibility still requires confirmation." : "Manual review remains required before relying on this scenario."}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* ── THE GATES — the published "why" ── */}
                <Card className="gs-reveal">
                  <Eyebrow>Why — the gates PROCEED must clear</Eyebrow>
                  <p style={{ fontSize: 12, color: INK_DIM, margin: "0 0 16px", lineHeight: 1.5 }}>
                    These are the exact gates the verdict evaluated, in the order it evaluated them — not a
                    second scoring system. The first FAIL is the binding constraint quoted above.
                    {" "}{result.cleared} of {result.gates.length} cleared.
                  </p>
                  {result.gates.map((g: ProceedGate) => (
                    <div
                      key={g.id}
                      className="ds-gate-row"
                      style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr auto", gap: 14, alignItems: "start", padding: "12px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>{g.label}</span>
                      <span style={{ fontSize: 12.5, color: INK_DIM, lineHeight: 1.45 }}>
                        <strong style={{ color: INK_DIM, fontWeight: 600 }}>Requires: </strong>{g.requirement}
                      </span>
                      <span style={{ fontSize: 12.5, color: INK_DIM, lineHeight: 1.45 }}>
                        <strong style={{ color: INK_DIM, fontWeight: 600 }}>Deal shows: </strong>{g.observed}
                      </span>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
                          color: g.passed ? dc.emerald : risk.dangerOnDark,
                          border: `1px solid ${g.passed ? dc.emerald : risk.dangerOnDark}`,
                          background: g.passed ? "rgba(77,189,151,0.12)" : risk.dangerBg,
                        }}
                      >
                        {g.passed ? "CLEAR" : "FAIL"}
                      </span>
                    </div>
                  ))}
                </Card>

                {/* ── TRACK-2 ACKNOWLEDGMENT ── */}
                {result.verdict.track2AcknowledgmentRequired && (
                  <Card className="gs-reveal" style={{ borderColor: risk.cautionBorder, background: CARD }}>
                    <Eyebrow color={risk.cautionOnDark}>Track 2 negative carry — acknowledgment required</Eyebrow>
                    <p style={{ fontSize: 13.5, color: dc.ink.dim, margin: "0 0 16px", lineHeight: 1.55 }}>
                      {result.verdict.track2AcknowledgmentText}
                    </p>
                    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={ackChecked}
                        onChange={(e) => setAckChecked(e.target.checked)}
                        style={{ marginTop: 3, width: 18, height: 18, accentColor: dc.emerald, flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13.5, color: INK, fontWeight: 500, lineHeight: 1.5 }}>
                        I understand this property loses money every month, and I am proceeding on the thesis below.
                      </span>
                    </label>
                    <div className="ds-bottom-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <label style={{ display: "block" }}>
                        <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          Thesis value, $ per month
                        </span>
                        <CurrencyInput
                          surface="dark"
                          value={ackThesisDollars}
                          onChange={setAckThesisDollars}
                          step={50}
                          prefix="$"
                          suffix=""
                          style={{ background: BAND, padding: "0 13px" }}
                          inputStyle={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                        />
                        <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginTop: 5, lineHeight: 1.45 }}>
                          Must at least cover the {money(Math.abs(result.track2MonthlyCashFlow))}/mo bleed, or the gate stays closed.
                        </span>
                      </label>
                      <label style={{ display: "block" }}>
                        <span style={{ display: "block", fontSize: 11, color: INK_DIM, marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          The thesis, in writing
                        </span>
                        <textarea
                          value={ackStatement}
                          onChange={(e) => setAckStatement(e.target.value)}
                          rows={3}
                          placeholder="e.g. cost-segregation depreciation offsets the carry at my marginal rate"
                          style={{
                            width: "100%", background: BAND, color: INK, border: HAIRLINE, borderRadius: radius.sm,
                            padding: "10px 12px", fontFamily: font.family, fontSize: 14, fontWeight: 500,
                            lineHeight: 1.45, letterSpacing: "-0.02em", resize: "vertical", outline: "none",
                          }}
                        />
                      </label>
                    </div>
                  </Card>
                )}

                {/* ── KILL CRITERIA ── */}
                {result.verdict.killCriteriaTriggered.length > 0 && (
                  <Card className="gs-reveal">
                    <Eyebrow color={dc.lemon}>Criteria flagged — {result.verdict.killCriteriaTriggered.length}</Eyebrow>
                    <p style={{ fontSize: 12, color: INK_DIM, margin: "0 0 14px", lineHeight: 1.45 }}>
                      BLOCKER = the deal cannot proceed as structured. WARNING = disclose and address.
                      ACKNOWLEDGMENT = the investor must sign off in writing.
                    </p>
                    {result.verdict.killCriteriaTriggered.map((k, i) => {
                      const kc = severityColor(k.severity);
                      return (
                        <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: INK, letterSpacing: "-0.02em" }}>{k.criterion}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: `${kc}22`, color: kc, border: `1px solid ${kc}`, whiteSpace: "nowrap" }}>
                              {k.severity}
                            </span>
                          </div>
                          <p style={{ color: INK_DIM, fontSize: 12.5, margin: "0 0 2px", lineHeight: 1.5 }}>{k.detail}</p>
                          <p style={{ color: INK_DIM, fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
                            <strong style={{ color: dc.emerald, fontWeight: 600 }}>Action: </strong>{k.action}
                          </p>
                        </div>
                      );
                    })}
                  </Card>
                )}

                {/* ── PROGRAM ELIGIBILITY ── */}
                <Card className="gs-reveal">
                  <Eyebrow>Programs evaluated — {result.evaluated.filter((e) => e.eligible).length} of {result.evaluated.length} eligible</Eyebrow>
                  <p style={{ fontSize: 12, color: INK_DIM, margin: "0 0 14px", lineHeight: 1.45 }}>
                    Every program is evaluated and shown, eligible or not. An empty or all-ineligible list is a
                    PASS — "no lender was checked" is never read as "a lender said yes".
                  </p>
                  {result.evaluated.map((e) => (
                    <div key={e.program.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>
                          {e.program.name}
                          {result.bestFit?.program.id === e.program.id ? (
                            <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.05em", color: dc.emerald }}>BEST FIT</span>
                          ) : null}
                        </span>
                        <div style={{ fontSize: 11.5, color: INK_DIM, lineHeight: 1.45, marginTop: 2 }}>
                          DSCR floor {e.program.dscrFloor.toFixed(2)} · offers {e.offerLTV === null ? "no matching grid cell" : `${e.offerLTV}% LTV`} · needs {100 - downPct}%
                          {e.reasons.length > 0 ? ` — ${e.reasons.join("; ")}` : ""}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: e.eligible ? dc.emerald : INK_DIM, whiteSpace: "nowrap" }}>
                        {e.eligible ? "ELIGIBLE" : "not eligible"}
                      </span>
                    </div>
                  ))}
                </Card>

                {/* ── GRADE + ACQ SCORE ── */}
                <div
                  className="gs-reveal ds-band-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(238,239,211,0.16)", borderRadius: radius.lg, overflow: "hidden", border: HAIRLINE }}
                >
                  <div style={{ background: CARD, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.emerald, marginBottom: 4 }}>Return grade</div>
                    <div style={{ fontSize: 11, color: INK_DIM, marginBottom: 10, lineHeight: 1.45 }}>
                      A: after-tax IRR ≥15% and Track 2 ≥1.10 · B: ≥12% and Track 2 ≥1.00 · C: ≥8% · D: below 8% · F: negative
                    </div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 600, color: gradeColor(result.verdict.returnGrade), lineHeight: 1 }}>
                      {result.verdict.returnGrade}
                    </Mono>
                    <div style={{ fontSize: 11.5, color: INK_DIM, marginTop: 8, lineHeight: 1.5 }}>{result.verdict.returnGradeReason}</div>
                  </div>
                  <div style={{ background: CARD, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.emerald, marginBottom: 4 }}>Acquisition score</div>
                    <div style={{ fontSize: 11, color: INK_DIM, marginBottom: 10, lineHeight: 1.45 }}>
                      A separate 0–100 weighting of cash flow, feasibility, reserves, exit liquidity and rate risk. It informs; it does not decide.
                    </div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 600, color: result.acq.score >= 75 ? dc.emerald : result.acq.score >= 60 ? risk.warning : risk.dangerOnDark, lineHeight: 1 }}>
                      {Math.round(result.acq.score)}
                    </Mono>
                    <div style={{ fontSize: 12, color: INK_DIM, marginTop: 8 }}>{result.acq.band}</div>
                  </div>
                </div>

                {/* ── ASSUMPTIONS + PROVENANCE ── */}
                <div className="gs-reveal ds-bottom-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "stretch" }}>
                  <Card>
                    <Eyebrow>Where the program terms come from</Eyebrow>
                    <p style={{ fontSize: 12, color: INK_DIM, margin: "0 0 14px", lineHeight: 1.45 }}>
                      Source and review date for every dated dataset this verdict reads. Reviewed as of {formatVintage(REVIEWED_AS_OF)}.
                    </p>
                    {USED_VINTAGE_KEYS.map(({ key, usedFor }) => {
                      const entry = DATA_VINTAGE.find((d) => d.key === key)!;
                      const isStale = staleKeys.has(key);
                      return (
                        <div key={key} style={{ padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>{entry.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: isStale ? risk.warning : dc.emerald, whiteSpace: "nowrap" }}>
                              {entry.asOf === null ? "UNDATED" : isStale ? `STALE · ${formatVintage(entry.asOf)}` : formatVintage(entry.asOf)}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: INK_DIM, lineHeight: 1.45 }}>
                            {usedFor} Source: {entry.source} Re-verified every {entry.refreshCadenceDays} days.
                          </div>
                        </div>
                      );
                    })}
                    <p style={{ fontSize: 11.5, color: risk.warning, margin: "12px 0 0", lineHeight: 1.5 }}>
                      {stale.length > 0
                        ? `${stale.length} of the registry's datasets are past their refresh cadence today. Verify against current sources before relying on this verdict.`
                        : "Every registered dataset is within its refresh cadence."}
                    </p>
                  </Card>

                  <Card>
                    <Eyebrow color={risk.cautionOnDark}>Assumptions with no dated source</Eyebrow>
                    <p style={{ fontSize: 12, color: INK_DIM, margin: "0 0 14px", lineHeight: 1.45 }}>
                      The cash-flow schedule needs these to run, and no sourced value for them exists in this
                      repository. They are model defaults, not researched figures — read every return above with
                      that in mind.
                    </p>
                    {[
                      ["Rent growth", `${result.assumptions.rentGrowthPct}% / yr`],
                      ["Vacancy", `${result.assumptions.vacancyPct}% of gross rent`],
                      ["Management", `${result.assumptions.managementPct}%`],
                      ["Maintenance", `${result.assumptions.maintenancePct}%`],
                      ["Turnover", `${result.assumptions.turnoverPct}%`],
                      ["Capex reserve", `${result.assumptions.capExReservePct}% of effective gross income`],
                      ["Selling costs", `${result.assumptions.sellingCostsPct}% of sale price`],
                      ["Ordinary tax rate", `${result.assumptions.tax.ordinaryRatePct}%`],
                      ["State tax rate", `${result.assumptions.tax.stateRatePct}%`],
                      ["Land allocation", `${result.assumptions.tax.landAllocationPct}% (non-depreciable)`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                        <span style={{ fontSize: 12.5, color: INK_DIM }}>{label}</span>
                        <Mono style={{ fontSize: 12.5, color: INK, fontWeight: 600 }}>{value}</Mono>
                      </div>
                    ))}
                    <p style={{ fontSize: 11.5, color: INK_DIM, margin: "12px 0 0", lineHeight: 1.5 }}>
                      Property taxes, insurance, hold period and exit cap rate are NOT on this list — they are the
                      figures you entered on the left.
                    </p>
                  </Card>
                </div>

                {/* ── KILL SWITCH + FOOTNOTE ── */}
                <Card>
                  <Eyebrow color={dc.lemon}>What flips this verdict</Eyebrow>
                  {result.verdict.killSwitchConditions.map((c, i) => (
                    <p key={i} style={{ fontSize: 13, color: dc.ink.dim, margin: "0 0 6px", lineHeight: 1.5 }}>· {c}</p>
                  ))}
                  <p style={{ fontSize: 12, color: INK_DIM, margin: "14px 0 0", lineHeight: 1.6, borderTop: HAIRLINE, paddingTop: 14 }}>
                    <strong style={{ color: dc.emerald, fontWeight: 600 }}>How PROCEED is decided: </strong>
                    all six gates above must clear — no hard blockers, at least one eligible program, Track 1 DSCR
                    at least 0.05 above the program floor, Track 2 at or above 1.00 (or an acknowledged $/mo thesis
                    that covers the bleed), a return grade of B or better on the after-tax IRR, and at least 50 basis
                    points of rate headroom. Any missing input is treated as a failure, never as a pass.
                    {" "}Unvalidated decision-support model. Preliminary estimate — not a commitment to lend, a rate
                    quote, or a credit decision. Final terms subject to full underwriting.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
