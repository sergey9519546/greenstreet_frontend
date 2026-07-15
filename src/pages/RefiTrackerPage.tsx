import React, { useState, useMemo, useEffect, useRef } from "react";
import { DcShell, dc, Mono, H1, H2, Lead, Btn, useRevealOnView } from "../design/dc";
import { RiskFlame, riskFromDscr } from "../design/artifacts";
import { analyzeRefi, getRefiAuxiliaryGuidanceState } from "../engine/refiTracker";
import { computeSecondLienDscr } from "../engine/secondLienDscr";
import { computeRefiProceedsGap } from "../engine/refiProceeds";
import { assessDscrCovenant, assessDayOneVsStabilized } from "../engine/covenantCheck";
import { radius, font } from "../theme";
import type { PropertyInputs, BorrowerProfile } from "../engine/types";
import BottomCTA from "../design/BottomCTA";

const fmt$ = (n: number) => Number.isFinite(n)
  ? "$" + Math.round(n).toLocaleString("en-US")
  : "Unavailable";
const fmtPct = (n: number, digits = 2) => Number.isFinite(n) ? `${n.toFixed(digits)}%` : "Unavailable";
const parseNumericInput = (raw: string) => raw.trim() === "" ? Number.NaN : Number(raw);

// Mint accent — the page's distinct colour identity (light warm-green)
const MINT = dc.mintBg; // #e8e9bf

// Colour helpers (via dc tokens only, no local consts)
const scoreColor = (score: number) =>
  score >= 80 ? dc.emerald : score >= 55 ? dc.lemon : "#e06363";
const factorColor = (v: number) =>
  v >= 20 ? dc.emerald : v >= 12 ? dc.lemon : "#e06363";

export default function RefiTrackerPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "DSCR Refinance Scenario Model | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Refs for the SVG chart lines — draw-on driven by IntersectionObserver, not page-load GSAP
  const costLineRef = useRef<SVGPathElement>(null);
  const saveLineRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const lblRef = useRef<SVGTextElement>(null);
  const [chartRef, chartVisible] = useRevealOnView<HTMLDivElement>();

  // ── Inputs ──
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [currentBalance, setCurrentBalance] = useState(340000);
  const [currentRate, setCurrentRate] = useState(7.25);
  const [currentPayment, setCurrentPayment] = useState(2317);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [monthsOwned, setMonthsOwned] = useState(8);
  const [projectedRate, setProjectedRate] = useState(6.5);
  const [projectedAppreciation, setProjectedAppreciation] = useState(5);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);
  // ── 2nd-lien / HELOC: tap equity WITHOUT refinancing the 1st lien ──
  const [secondAmount, setSecondAmount] = useState(50000);
  const [secondRate, setSecondRate] = useState(10.5);
  // ── Sprint 2 debt tests: DSCR maintenance covenant + day-one in-place rent ──
  const [covenantDscr, setCovenantDscr] = useState(1.20);
  const [inPlaceRent, setInPlaceRent] = useState(3000);
  const projectedValueChange = projectedAppreciation * (monthsOwned / 12);
  const pageInputsValid = [
    purchasePrice, currentBalance, currentRate, currentPayment, monthlyRent,
    monthsOwned, projectedRate, projectedAppreciation, annualTaxes, annualInsurance, hoa,
  ].every(Number.isFinite)
    && purchasePrice > 0
    && currentBalance > 0
    && currentRate >= 0 && currentRate <= 25
    && currentPayment > 0
    && monthlyRent >= 0
    && Number.isInteger(monthsOwned) && monthsOwned >= 0 && monthsOwned <= 1200
    && projectedRate >= 0 && projectedRate <= 25
    && projectedValueChange >= -95 && projectedValueChange <= 100
    && annualTaxes >= 0 && annualInsurance >= 0 && hoa >= 0;
  const modeledValue = purchasePrice * (1 + projectedValueChange / 100);
  const currentValue = pageInputsValid && Number.isFinite(modeledValue) && modeledValue > 0
    ? Math.round(modeledValue)
    : 0;
  const firstLienPITIA = pageInputsValid
    ? currentPayment + (annualTaxes + annualInsurance) / 12 + hoa
    : 0;
  const secondLien = computeSecondLienDscr({
    monthlyRent, firstLienPITIA, firstLienBalance: currentBalance,
    propertyValue: currentValue, secondLienAmount: secondAmount, secondLienRate: secondRate,
  });
  // Refi-proceeds gap at maturity/reset: can a new loan (capped by BOTH the
  // rate-term LTV AND the DSCR floor) retire the current balance? + binding label.
  const refiGap = pageInputsValid
    ? computeRefiProceedsGap({
        propertyValue: currentValue,
        currentBalance,
        qualifyingRent: monthlyRent,
        escrowsMonthly: (annualTaxes + annualInsurance) / 12 + hoa,
        newRate: projectedRate,
      })
    : {
        maxNewLoan: 0,
        bindingConstraint: "LTV" as const,
        canRetireBalance: false,
        cashOutAvailable: 0,
        proceedsGap: 0,
        newPayment: 0,
      };
  // Maintenance-covenant test on the current loan + day-one (in-place rent) vs
  // stabilized (market rent) lease-up risk. Stabilized = current rent ÷ current PITIA.
  const stabilizedDSCR = firstLienPITIA > 0 ? monthlyRent / firstLienPITIA : 0;
  const dayOneDSCR = firstLienPITIA > 0 ? inPlaceRent / firstLienPITIA : 0;
  const covenant = assessDscrCovenant(stabilizedDSCR, covenantDscr);
  const dayOne = assessDayOneVsStabilized(dayOneDSCR, stabilizedDSCR);

  // ── Engine ──
  const result = useMemo(() => {
    try {
      const property: PropertyInputs = {
        purchasePrice,
        leaseRent: monthlyRent,
        marketRent: monthlyRent,
        strProjectedRent: 0,
        strDocumentedRent: 0,
        hoa,
        annualTaxes,
        annualInsurance,
        floodInsurance: 0,
        propertyType: "SFR",
        state: "TX",
        unitCount: 1,
        sqft: 1500,
        yearBuilt: 2000,
        isCondotel: false,
        isNonWarrantable: false,
        isRural: false,
        isDecliningMarket: false,
        hoaSTRPolicy: "UNKNOWN",
      };
      const borrower: BorrowerProfile = {
        ficoScore: 740,
        experience: "EXPERIENCED",
        existingFinancedProperties: 1,
        entityType: "LLC",
        isUSCitizenOrPR: true,
        availableReserves: 0,
        reserveAssets: [],
        isFirstResponder: false,
        isNonUsInvestor: false,
      };
      const analysis = analyzeRefi(
        property,
        borrower,
        { balance: currentBalance, rate: currentRate, monthlyPayment: currentPayment },
        monthsOwned,
        projectedValueChange,
        projectedRate
      );
      return {
        status: analysis.status,
        reviewReasons: analysis.reviewReasons,
        totalScore: analysis.refiReadinessScore,
        factors: analysis.readinessFactors.map((f) => ({
          factor: f.factor,
          score: f.score,
          maxScore: f.maxScore,
          status: f.status,
          detail: f.detail,
        })),
        currentDSCR: analysis.currentDSCR,
        refiDSCR: analysis.projectedRefiDSCR,
        appreciatedValue: currentValue,
        cashOutMaxAmount: analysis.cashOutMaxAmount,
        monthlySavings: analysis.monthlySavings,
        breakEvenMonths: analysis.breakEvenMonths,
        refiType: analysis.refiType,
        seasoningMet: analysis.seasoningMet,
      };
    } catch {
      return null;
    }
  }, [
    purchasePrice,
    currentBalance,
    currentRate,
    currentPayment,
    monthlyRent,
    monthsOwned,
    projectedRate,
    projectedAppreciation,
    projectedValueChange,
    currentValue,
    annualTaxes,
    annualInsurance,
    hoa,
  ]);

  const score = result?.totalScore ?? 0;
  const resultAvailable = result?.status === "AVAILABLE";
  const auxiliaryGuidance = getRefiAuxiliaryGuidanceState(
    result?.status,
    secondLien.status,
    currentRate,
    projectedRate,
    covenantDscr,
    inPlaceRent,
  );
  const secondLienAvailable = auxiliaryGuidance.secondLienAvailable;
  const vColor = resultAvailable ? scoreColor(score) : "#e06363";
  const vLabel = resultAvailable
    ? score >= 80
      ? "REFI READY"
      : score >= 55
      ? "CONDITIONAL"
      : "NOT READY"
    : "REVIEW INPUTS";

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#rf-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
  };

  // ── Break-even chart geometry (data-driven so the crossover is honest) ──
  const beMonths = result?.breakEvenMonths ?? 36;
  const ms = result?.monthlySavings ?? 0;
  const bePct = Math.min(1, Math.max(0, beMonths / 60));
  const beDotX = Math.round(bePct * 420);
  const noBreakeven = !resultAvailable || ms <= 0 || beMonths >= 120;
  const showDot = !noBreakeven;
  // Cumulative-savings line passes through (0,178) and must cross the flat refi-cost
  // line (y=40) exactly at beDotX — so the dot sits on the real intersection, not a
  // decorative one. Slope therefore encodes how fast savings accrue.
  const COST_Y = 40, BASE_Y = 178, TOP_Y = 20;
  const crossX = Math.max(10, beDotX); // guard against a vertical/zero-width slope
  const slope = (COST_Y - BASE_Y) / crossX; // SVG y is inverted → negative
  let saveEndX = 420, saveEndY = BASE_Y + slope * 420;
  if (saveEndY < TOP_Y) { saveEndX = (TOP_Y - BASE_Y) / slope; saveEndY = TOP_Y; }
  const savePath = noBreakeven
    ? "M 0,178 L 420,150" // savings never reach the cost line — no payoff yet
    : `M 0,${BASE_Y} L ${Math.round(saveEndX)},${Math.round(saveEndY)}`;

  // ── Draw-on chart lines via IntersectionObserver (never page-load GSAP) ──
  // chartVisible flips true once the chart div enters the viewport (useRevealOnView).
  // CSS transitions on strokeDashoffset handle the draw effect — reduced-motion safe.
  useEffect(() => {
    if (!chartVisible) return;
    const cost = costLineRef.current;
    const save = saveLineRef.current;
    const dot = dotRef.current;
    const lbl = lblRef.current;
    if (!cost || !save) return;

    const costLen = 420;
    const saveLen = save.getTotalLength ? save.getTotalLength() : 420;

    // Start hidden, then let CSS transition draw them in
    cost.style.strokeDasharray = "6,4";
    cost.style.strokeDashoffset = String(costLen);
    save.style.strokeDasharray = String(saveLen);
    save.style.strokeDashoffset = String(saveLen);
    if (dot) { dot.style.opacity = "0"; }
    if (lbl) { lbl.style.opacity = "0"; }

    // rAF ensures the "hidden" state is painted before transition begins
    requestAnimationFrame(() => {
      cost.style.transition = "stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1) 0.1s";
      cost.style.strokeDashoffset = "0";
      save.style.transition = "stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1) 0.3s";
      save.style.strokeDashoffset = "0";
      if (dot && lbl && showDot) {
        dot.style.transition = "opacity 0.5s ease 1.3s";
        lbl.style.transition = "opacity 0.5s ease 1.3s";
        dot.style.opacity = "1";
        lbl.style.opacity = "1";
      }
    });
  }, [chartVisible, showDot]);

  // Input field definitions
  const loanFields: Array<{
    label: string;
    hint?: string;
    value: number;
    set: (v: number) => void;
    step: number;
    min?: number;
    max?: number;
    prefix?: string;
    suffix?: string;
  }> = [
    { label: "Purchase Price", hint: "What you originally paid — sets your equity baseline.", value: purchasePrice, set: setPurchasePrice, step: 5000, min: 1, prefix: "$" },
    { label: "Current Loan Balance", hint: "What you still owe today. Estimate is fine.", value: currentBalance, set: setCurrentBalance, step: 1000, min: 1, prefix: "$" },
    { label: "Current Rate", hint: "Your existing interest rate — drives savings math.", value: currentRate, set: setCurrentRate, step: 0.125, min: 0, max: 25, suffix: "%" },
    { label: "Current Monthly P&I", hint: "Principal + interest only (not taxes/insurance). Check your statement.", value: currentPayment, set: setCurrentPayment, step: 25, min: 0.01, prefix: "$" },
    { label: "Months Owned", hint: "This scenario compares ownership time with a 6-month model threshold; actual requirements vary.", value: monthsOwned, set: setMonthsOwned, step: 1, min: 0, max: 1200 },
    { label: "Monthly Rent (qualifying)", hint: "The lesser of entered lease and market rent is used in this scenario.", value: monthlyRent, set: setMonthlyRent, step: 100, min: 0, prefix: "$" },
    { label: "Assumed Rate at Refi", hint: "A user-entered scenario rate, not a current market quote or forecast. Verify available terms before relying on it.", value: projectedRate, set: setProjectedRate, step: 0.125, min: 0, max: 25, suffix: "%" },
    { label: "Projected Appreciation (%/yr)", hint: "Annualized value-change assumption. The model prorates it by months owned and accepts a total modeled change from -95% to 100%.", value: projectedAppreciation, set: setProjectedAppreciation, step: 0.5, suffix: "%" },
    { label: "Annual Taxes", hint: "Your property tax bill per year. Find it on your last tax statement.", value: annualTaxes, set: setAnnualTaxes, step: 500, min: 0, prefix: "$" },
    { label: "Annual Insurance", hint: "Homeowner's insurance premium per year.", value: annualInsurance, set: setAnnualInsurance, step: 250, min: 0, prefix: "$" },
    { label: "Monthly HOA", hint: "Enter 0 if there is no HOA.", value: hoa, set: setHoa, step: 25, min: 0, prefix: "$" },
  ];

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer" },
      ]}
      cta={{ label: "Check refi →", onClick: scrollToTool }}
    >
      {/* Input spinner reset only */}
      <style>{`
        .rt-num::-webkit-outer-spin-button,.rt-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .rt-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:#eeefd3;letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO — dark background (matches mockup #002423) ── */}
      <section
        id="rf-hero"
        style={{
          position: "relative",
          background: dc.dark,
          color: dc.cream,
          padding: "clamp(56px,8vh,108px) clamp(1.5rem,4vw,3rem) clamp(44px,6vh,76px)",
          overflow: "hidden",
        }}
      >
        <div
          className="dc-hero"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px,5vw,72px)",
            alignItems: "center",
          }}
        >
          {/* Left — hero copy */}
          <div id="gs-hero-content">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(238,239,211,0.62)",
                background: "rgba(238,239,211,0.06)",
                border: "1px solid rgba(238,239,211,0.18)",
                borderRadius: 100,
                padding: "7px 14px",
                marginBottom: 24,
              }}
            >
              Refi Tracker · 4-factor readiness
            </div>
            <H1 style={{ margin: "0 0 24px", color: dc.cream }}>
              Model a DSCR refinance scenario.
            </H1>
            <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, color: dc.lemon, maxWidth: "50ch", margin: "0 0 14px", letterSpacing: "-0.01em" }}>
              Enter your current loan and an assumed replacement rate. The tool compares four modeled factors and estimates a break-even month if every entered assumption holds.
            </div>
            <Lead
              style={{
                color: "rgba(238,239,211,0.68)",
                maxWidth: "50ch",
                margin: "0 0 34px",
              }}
            >
              The model uses seasoning, equity, DSCR headroom, and monthly savings. Its seasoning and LTV thresholds are internal assumptions, not universal lender requirements or eligibility findings.
            </Lead>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
              <Btn label="Open the refi tracker ↓" href="#rf-tool" onClick={scrollToTool} />
            </div>
            {/* Live stat bar — live output under the hero CTA */}
            <div style={{ display: "flex", gap: "clamp(24px,4vw,48px)", flexWrap: "wrap" }}>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(32px,3.6vw,48px)",
                    fontWeight: 600,
                    color: vColor,
                    lineHeight: 1,
                  }}
                >
                  {resultAvailable ? Math.round(score) : "—"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                  readiness / 100
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(32px,3.6vw,48px)",
                    fontWeight: 600,
                    color: dc.cream,
                    lineHeight: 1,
                  }}
                >
                  {resultAvailable && beMonths < 120 ? Math.round(beMonths) + " mo" : "—"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                  break-even
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(32px,3.6vw,48px)",
                    fontWeight: 600,
                    color: dc.cream,
                    lineHeight: 1,
                  }}
                >
                  {resultAvailable ? fmt$(result.cashOutMaxAmount) : "—"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                  cash-out capacity
                </div>
              </div>
            </div>
          </div>

          {/* Right — break-even crossing-lines chart (THE signature visual) */}
          <div
            ref={chartRef}
            style={{
              background: dc.dark,
              borderRadius: dc.r.lg,
              padding: 26,
              border: "1px solid rgba(238,239,211,0.16)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: dc.emerald,
                marginBottom: 8,
              }}
            >
              Break-even crossover
            </div>
            <svg
              id="rf-svg"
              viewBox="0 0 420 200"
              style={{ width: "100%", display: "block", overflow: "visible" }}
            >
              {/* Axes */}
              <line x1="0" y1="180" x2="420" y2="180" stroke="rgba(238,239,211,0.2)" strokeWidth="1" />
              <line x1="0" y1="20" x2="0" y2="180" stroke="rgba(238,239,211,0.2)" strokeWidth="1" />
              {/* Refi cost line — flat dashed red, animated draw */}
              <path
                ref={costLineRef}
                id="rf-cost"
                d="M 0,40 L 420,40"
                fill="none"
                stroke="#e06363"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              {/* Cumulative savings line — rising solid emerald, animated draw */}
              <path
                ref={saveLineRef}
                id="rf-save"
                d={savePath}
                fill="none"
                stroke={dc.emerald}
                strokeWidth="3"
                style={{ transition: "d 0.35s ease" }}
              />
              {/* Break-even intersection dot + label */}
              <circle
                ref={dotRef}
                id="rf-dot"
                cx={beDotX}
                cy={40}
                r={6}
                fill={dc.lemon}
                opacity={showDot ? 1 : 0}
                style={{ transition: "cx 0.35s ease" }}
              />
              {showDot && (
                <text
                  ref={lblRef}
                  id="rf-lbl"
                  x={Math.min(beDotX + 8, 310)}
                  y={36}
                  fill={dc.lemon}
                  fontSize={11}
                  fontFamily={dc.mono}
                  opacity={1}
                >
                  break-even ≈ mo {Math.round(beMonths)}
                </text>
              )}
              {/* Static labels */}
              <text x="6" y="34" fill="rgba(224,99,99,0.8)" fontSize={10} fontFamily={dc.mono}>refi cost</text>
              <text x="6" y="170" fill="rgba(77,189,151,0.9)" fontSize={10} fontFamily={dc.mono}>cumulative savings →</text>
            </svg>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "rgba(238,239,211,0.62)",
                marginTop: 8,
                fontFamily: dc.mono,
              }}
            >
              <span>mo 0</span>
              <span>mo 60</span>
            </div>

            {/* Live driver — drag the refi rate, watch the crossover move */}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(238,239,211,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>
                  Projected refi rate
                </span>
                <Mono style={{ fontSize: 15, fontWeight: 700, color: dc.emerald }}>
                  {fmtPct(currentRate)} → {fmtPct(projectedRate, 3)}
                </Mono>
              </div>
              <input
                type="range"
                min={4}
                max={25}
                step={0.125}
                value={Number.isFinite(projectedRate) ? projectedRate : 6.5}
                onChange={(e) => setProjectedRate(+e.target.value)}
                aria-label="Projected refi rate"
                style={{ width: "100%", accentColor: dc.emerald, cursor: "pointer" }}
              />
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 5, fontFamily: dc.mono }}>
                {noBreakeven
                  ? "no break-even at this rate — savings never recoup the cost"
                  : `break-even ≈ month ${Math.round(beMonths)} · drag to move it`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL (slightly lighter dark, matches mockup #003a39) ── */}
      <section
        id="rf-tool"
        style={{
          background: "#003a39",
          color: dc.cream,
          padding: `clamp(52px,7vw,92px) clamp(1.5rem,4vw,3rem) clamp(64px,9vh,116px)`,
          borderTop: "1px solid rgba(238,239,211,0.07)",
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: dc.lemon,
                marginBottom: 10,
              }}
            >
              Live refi readiness engine
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.6)", maxWidth: "64ch", margin: "0 0 6px", lineHeight: 1.6 }}>
              The 0-100 score is an interface band for comparing assumptions, not a recommendation. This version models a 6-month seasoning threshold and fixed LTV caps; actual requirements vary by program, transaction, property, and borrower.
            </p>
          </div>
          <h2
            className="gs-reveal"
            style={{
              fontSize: "clamp(26px,3.4vw,42px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: "0 0 32px",
              color: dc.cream,
            }}
          >
            Readiness{" "}
            <Mono style={{ color: dc.cream }}>{resultAvailable ? Math.round(score) : "—"}/100</Mono>
            {" · "}
            <span style={{ color: vColor }}>{vLabel}</span>
          </h2>

          {/* Split: inputs + results */}
          <div
            className="gs-reveal dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr",
              gap: 30,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ── */}
            <div
              style={{
                background: dc.teal,
                border: "1px solid rgba(238,239,211,0.12)",
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.emerald,
                  marginBottom: 20,
                }}
              >
                Current loan &amp; refi
              </div>
              {loanFields.map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 12 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "rgba(238,239,211,0.6)",
                      marginBottom: 4,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {f.label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: dc.dark,
                      border: "1px solid rgba(238,239,211,0.18)",
                      borderRadius: 8,
                      padding: "0 11px",
                    }}
                  >
                    {f.prefix && (
                      <span style={{ color: "rgba(238,239,211,0.62)" }}>{f.prefix}</span>
                    )}
                    <input
                      className="rt-num"
                      type="number"
                      step={f.step}
                      min={f.min}
                      max={f.max}
                      value={Number.isFinite(f.value) ? f.value : ""}
                      onChange={(e) => f.set(parseNumericInput(e.target.value))}
                      aria-invalid={!Number.isFinite(f.value)}
                      style={{ padding: "10px 6px", fontSize: 15, fontWeight: 600 }}
                    />
                    {f.suffix && (
                      <span style={{ color: "rgba(238,239,211,0.62)" }}>{f.suffix}</span>
                    )}
                  </div>
                  {f.hint && (
                    <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.45, letterSpacing: 0 }}>
                      {f.hint}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* ── RESULTS ── */}
            <div>
              {/* Score card */}
              <div
                style={{
                  background: dc.teal,
                  border: `1px solid ${vColor}`,
                  borderRadius: 14,
                  padding: 28,
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: dc.lemon,
                    marginBottom: 12,
                  }}
                >
                  Refi Readiness Score
                </div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: 72,
                    fontWeight: 700,
                    color: vColor,
                    lineHeight: 1,
                  }}
                >
                  {resultAvailable ? Math.round(score) : "—"}
                </Mono>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: vColor,
                    margin: "8px 0 14px",
                  }}
                >
                  {vLabel}
                </div>
                <div style={{ fontSize: 14, color: "rgba(238,239,211,0.6)" }}>
                  {!resultAvailable && "Review the highlighted inputs before relying on any refinance output."}
                  {resultAvailable && result?.refiType === "RATE_TERM" &&
                    "Rate & term refi — you lower your rate/term without pulling cash out. Balance stays roughly the same."}
                  {resultAvailable && result?.refiType === "CASH_OUT" &&
                    `You have equity to pull out. Maximum cash-out: ${fmt$(result.cashOutMaxAmount)} (at 70% LTV — 70 cents borrowed per dollar of value).`}
                  {resultAvailable && result?.refiType === "NO_REFI" &&
                    "The entered scenario does not clear the model's equity and payment comparisons. Review alternatives and verify actual terms."}
                </div>
              </div>

              {/* Refi Math */}
              <div
                style={{
                  background: dc.teal,
                  border: "1px solid rgba(238,239,211,0.12)",
                  borderRadius: 14,
                  padding: 24,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: dc.lemon,
                    marginBottom: 12,
                  }}
                >
                  Refi Math
                </div>
                {resultAvailable ? (
                  [
                    {
                      label: "Current DSCR",
                      sub: "Rent ÷ PITIA today. Above 1.0 = property covers its costs.",
                      val: result.currentDSCR.toFixed(2) + "x",
                      color: dc.cream,
                      flame: riskFromDscr(result.currentDSCR),
                    },
                    {
                      label: "DSCR after refi",
                      sub: result.refiDSCR >= 1.0 ? "Modeled rent covers the entered payment assumptions." : "Caution — modeled rent may not cover the entered payment assumptions.",
                      val: result.refiDSCR.toFixed(2) + "x",
                      color: result.refiDSCR >= 1.0 ? dc.emerald : "#e06363",
                      flame: riskFromDscr(result.refiDSCR),
                    },
                    {
                      label: "Monthly savings",
                      sub: "Signed P&I difference versus the current entered payment.",
                      val:
                        (result.monthlySavings >= 0 ? "+" : "") +
                        fmt$(result.monthlySavings),
                      color: result.monthlySavings >= 0 ? dc.emerald : "#e06363",
                    },
                    {
                      label: "Break-even",
      sub: result.breakEvenMonths > 120 ? "Modeled savings do not recoup the entered costs within 120 months." : "Modeled months until cumulative savings exceed the entered refinance costs.",
                      val:
                        result.breakEvenMonths > 120
                          ? "120+ (don't refi)"
                          : Math.round(result.breakEvenMonths) + " mo",
                      color: result.breakEvenMonths < 36 ? dc.emerald : dc.lemon,
                    },
                    {
                      label: "Cash-out capacity",
      sub: "Illustrative proceeds using the model's 70% LTV assumption. Actual limits and eligible proceeds vary.",
                      val: fmt$(result.cashOutMaxAmount),
                      color: dc.cream,
                    },
                    {
                      label: "Seasoning requirement",
                      sub: "Lenders typically require you to own the property 6 months before refinancing.",
                      val: result.seasoningMet
                        ? "Met (6 mo)"
                        : `${monthsOwned}/6 mo — not yet met`,
                      color: result.seasoningMet ? dc.emerald : "#e06363",
                    },
                  ].map((r, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid rgba(238,239,211,0.08)",
                        fontSize: 14,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "rgba(238,239,211,0.65)" }}>{r.label}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {"flame" in r && r.flame !== undefined && <RiskFlame level={r.flame} size={16} />}
                          <Mono style={{ color: r.color, fontWeight: 700 }}>{r.val}</Mono>
                        </span>
                      </div>
                      {"sub" in r && r.sub && (
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2, lineHeight: 1.4 }}>{r.sub}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#e06363",
                      padding: "8px 0",
                    }}
                  >
                    Output unavailable. Enter finite, non-negative values within the displayed model ranges.
                  </div>
                )}
              </div>

              {/* Score Breakdown */}
              <div
                style={{
                  background: dc.teal,
                  border: "1px solid rgba(238,239,211,0.12)",
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: dc.emerald,
                    marginBottom: 14,
                  }}
                >
                  What drives the score (4 factors, 25 pts each)
                </div>
                {result ? (
                  result.factors.map((f) => {
                    const fc = factorColor(f.score);
                    return (
                      <div
                        key={f.factor}
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid rgba(238,239,211,0.08)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: dc.cream,
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {f.factor}
                          </span>
                          <Mono style={{ color: fc, fontWeight: 700, fontSize: 14 }}>
                            {f.score} / {f.maxScore}
                          </Mono>
                        </div>
                        {/* Progress bar */}
                        <div
                          style={{
                            height: 5,
                            borderRadius: 3,
                            background: "rgba(238,239,211,0.1)",
                            marginTop: 7,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(f.score / f.maxScore) * 100}%`,
                              background: fc,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <p
                          style={{
                            color: "rgba(238,239,211,0.62)",
                            fontSize: 12,
                            margin: "6px 0 0",
                            lineHeight: 1.5,
                          }}
                        >
                          {f.detail}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: 13, color: "rgba(238,239,211,0.62)", padding: "8px 0" }}>
                    Enter inputs above to see factor breakdown.
                  </div>
                )}
              </div>

              {/* Engine source note */}
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 18px",
                  background: "rgba(238,239,211,0.05)",
                  borderRadius: 10,
                  border: "1px solid rgba(238,239,211,0.12)",
                  fontSize: 12,
                  color: "rgba(238,239,211,0.62)",
                  lineHeight: 1.6,
                }}
              >
            <strong style={{ color: dc.emerald }}>How the model works:</strong> Four factors are scored 0-25 each: seasoning, equity, DSCR headroom, and modeled monthly savings. This version assumes 70% cash-out LTV and 75% rate-and-term LTV. Those are scenario limits, not current program terms. Output from analyzeRefi v11.7.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2nd-lien / HELOC alternative — tap equity without refinancing ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(48px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Or: tap equity without refinancing</div>
          <H2 style={{ fontSize: "clamp(24px,3vw,38px)", margin: "0 0 12px", maxWidth: "20ch" }}>
            {secondLienAvailable
              ? `Keep your ${auxiliaryGuidance.currentRateLabel} first lien. Borrow against the equity.`
              : "Review inputs before comparing second-lien options."}
          </H2>
          <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "62ch", margin: "0 0 26px" }}>
            {secondLienAvailable ? (
              <>This illustrative second-lien scenario preserves the entered first lien and models <strong style={{ color: dc.cream }}>combined</strong> DSCR = rent / (first payment + second payment), using a 75% CLTV assumption. Availability and terms must be verified.</>
            ) : (
              <>Second-lien guidance is unavailable until the refinance and second-lien inputs produce valid results.</>
            )}
          </Lead>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { l: "2nd-lien draw", v: secondAmount, set: setSecondAmount, step: 5000, min: 1, max: currentValue || undefined, pre: "$" },
              { l: "2nd-lien rate", v: secondRate, set: setSecondRate, step: 0.125, min: 0, max: 25, suf: "%" },
            ].map((f) => (
              <label key={f.l} style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.6)", marginBottom: 6 }}>{f.l}</span>
                <div style={{ display: "inline-flex", alignItems: "center", background: dc.teal, border: "1.5px solid rgba(238,239,211,0.18)", borderRadius: radius.sm, padding: "0 12px" }}>
                  {f.pre && <span style={{ color: "rgba(238,239,211,0.6)", fontSize: 14 }}>{f.pre}</span>}
                  <input type="number" step={f.step} min={f.min} max={f.max} value={Number.isFinite(f.v) ? f.v : ""} onChange={(e) => f.set(parseNumericInput(e.target.value))} aria-invalid={!Number.isFinite(f.v)} style={{ width: 140, border: "none", background: "none", outline: "none", color: dc.cream, fontFamily: font.family, fontWeight: 600, fontSize: 15, padding: "11px 6px" }} />
                  {f.suf && <span style={{ color: "rgba(238,239,211,0.6)", fontSize: 14 }}>{f.suf}</span>}
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="dc-band-4">
            {[
              { v: secondLienAvailable ? `${secondLien.combinedDSCR.toFixed(2)}x` : "Review", l: "combined DSCR", c: secondLienAvailable && secondLien.combinedDSCR >= 1.0 ? dc.emerald : "#e06363" },
              { v: secondLienAvailable ? `${secondLien.cltv.toFixed(0)}%` : "Review", l: "CLTV (cap 75%)", c: secondLienAvailable && secondLien.cltv <= 75 ? dc.cream : "#e06363" },
              { v: secondLienAvailable ? fmt$(secondLien.maxSecondLien) : "Review", l: secondLienAvailable ? `max 2nd lien · ${secondLien.bindingConstraint}-bound` : "max 2nd lien unavailable", c: secondLienAvailable ? dc.lemon : "#e06363" },
              { v: secondLienAvailable ? (secondLien.qualifies ? "FITS MODEL" : "DOES NOT FIT") : "REVIEW INPUTS", l: secondLienAvailable ? `2nd pmt ${fmt$(secondLien.secondLienPayment)}/mo` : secondLien.reviewReasons[0] ?? "Check entered values", c: secondLienAvailable && secondLien.qualifies ? dc.emerald : "#e06363" },
            ].map((s) => (
              <div key={s.l} style={{ background: dc.teal, border: "1px solid rgba(238,239,211,0.14)", borderRadius: radius.md, padding: "clamp(16px,2vw,22px)" }}>
                <Mono style={{ fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 700, color: s.c, letterSpacing: "-0.03em", display: "block", lineHeight: 1 }}>{s.v}</Mono>
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5, maxWidth: "72ch" }}>
            {secondLienAvailable
              ? "Best when your 1st lien is below market and carries a prepay penalty. Max draw is the lesser of the CLTV room and what combined DSCR supports. Illustrative — exact terms by lender."
              : "Review the entered values above. No second-lien fit, payment, or maximum is modeled while this scenario is unavailable."}
          </p>
        </div>
      </section>

      {/* ── REFINANCE AT MATURITY — proceeds gap + debt covenants (Sprint 2) ── */}
      <section style={{ background: dc.teal, color: dc.cream, padding: `clamp(48px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Refinance at maturity / ARM reset</div>
          <H2 style={{ fontSize: "clamp(24px,3vw,38px)", margin: "0 0 12px", maxWidth: "22ch" }}>When the loan comes due, can the property refinance out?</H2>
          <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "64ch", margin: "0 0 26px" }}>
            For this modeled balloon or ARM-reset scenario, proceeds are limited by <strong style={{ color: dc.cream }}>both</strong> an assumed 75% rate-and-term LTV and an assumed DSCR floor. A displayed proceeds gap is a model result, not a payoff or cash-to-close statement.
          </Lead>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { l: "DSCR covenant (maintenance)", v: covenantDscr, set: setCovenantDscr, step: 0.05, min: 0.01, suf: "x", pre: "" },
              { l: "In-place rent now (day-one)", v: inPlaceRent, set: setInPlaceRent, step: 50, min: 0, pre: "$", suf: "" },
            ].map((f) => (
              <label key={f.l} style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.6)", marginBottom: 6 }}>{f.l}</span>
                <div style={{ display: "inline-flex", alignItems: "center", background: dc.dark, border: "1.5px solid rgba(238,239,211,0.18)", borderRadius: radius.sm, padding: "0 12px" }}>
                  {f.pre && <span style={{ color: "rgba(238,239,211,0.6)", fontSize: 14 }}>{f.pre}</span>}
                  <input type="number" step={f.step} min={f.min} value={Number.isFinite(f.v) ? f.v : ""} onChange={(e) => f.set(parseNumericInput(e.target.value))} aria-invalid={!Number.isFinite(f.v)} style={{ width: 150, border: "none", background: "none", outline: "none", color: dc.cream, fontFamily: font.family, fontWeight: 600, fontSize: 15, padding: "11px 6px" }} />
                  {f.suf && <span style={{ color: "rgba(238,239,211,0.6)", fontSize: 14 }}>{f.suf}</span>}
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="dc-band-4">
            {[
              { v: pageInputsValid ? fmt$(refiGap.maxNewLoan) : "Review", l: pageInputsValid ? `max new loan · ${refiGap.bindingConstraint}-bound` : "max new loan unavailable", c: pageInputsValid ? dc.lemon : "#e06363" },
              refiGap.canRetireBalance
                ? { v: fmt$(refiGap.cashOutAvailable), l: "cash-out available", c: dc.emerald }
                : { v: fmt$(refiGap.proceedsGap), l: "cash to close (gap)", c: "#e06363" },
              { v: fmt$(refiGap.newPayment), l: "new P&I / mo", c: dc.cream },
              { v: refiGap.canRetireBalance ? "CLEARS" : "SHORT", l: `vs ${fmt$(currentBalance)} balance`, c: refiGap.canRetireBalance ? dc.emerald : "#e06363" },
            ].map((s) => (
              <div key={s.l} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.14)", borderRadius: radius.md, padding: "clamp(16px,2vw,22px)" }}>
                <Mono style={{ fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 700, color: s.c, letterSpacing: "-0.03em", display: "block", lineHeight: 1 }}>{s.v}</Mono>
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* debt-test flags */}
          <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
            {!pageInputsValid && (
              <div style={{ background: "rgba(224,99,99,0.1)", border: "1px solid rgba(224,99,99,0.4)", borderLeft: "3px solid #e06363", borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#e0635f", marginBottom: 4 }}>Review inputs</div>
                <p style={{ fontSize: 13.5, color: "rgba(238,239,211,0.75)", margin: 0, lineHeight: 1.5 }}>Refinance proceeds are unavailable until all required values are finite and within the displayed model ranges.</p>
              </div>
            )}
            {pageInputsValid && !refiGap.canRetireBalance && (
              <div style={{ background: "rgba(224,99,99,0.1)", border: "1px solid rgba(224,99,99,0.4)", borderLeft: "3px solid #e06363", borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#e0635f", marginBottom: 4 }}>Refi proceeds gap · {refiGap.bindingConstraint}-constrained</div>
                <p style={{ fontSize: 13.5, color: "rgba(238,239,211,0.75)", margin: 0, lineHeight: 1.5 }}>
                  A new loan tops out at {fmt$(refiGap.maxNewLoan)} — {fmt$(refiGap.proceedsGap)} short of the {fmt$(currentBalance)} balance. You'd bring that cash to close, or negotiate an extension/paydown. The {refiGap.bindingConstraint === "LTV" ? "value (LTV)" : "rent (DSCR)"} is the binding limit.
                </p>
              </div>
            )}
            {pageInputsValid && covenant.status !== "OK" && (
              <div style={{ background: covenant.status === "BREACH" ? "rgba(224,99,99,0.1)" : "rgba(230,184,77,0.1)", border: `1px solid ${covenant.status === "BREACH" ? "rgba(224,99,99,0.4)" : "rgba(230,184,77,0.4)"}`, borderLeft: `3px solid ${covenant.status === "BREACH" ? "#e06363" : "#e6b84d"}`, borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: covenant.status === "BREACH" ? "#e0635f" : "#e6b84d", marginBottom: 4 }}>DSCR covenant · {covenant.status}</div>
                <p style={{ fontSize: 13.5, color: "rgba(238,239,211,0.75)", margin: 0, lineHeight: 1.5 }}>{covenant.note}</p>
              </div>
            )}
            {auxiliaryGuidance.debtGuidanceAvailable && dayOne.leaseUpRisk && (
              <div style={{ background: "rgba(230,184,77,0.1)", border: "1px solid rgba(230,184,77,0.4)", borderLeft: "3px solid #e6b84d", borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#e6b84d", marginBottom: 4 }}>Day-one vs stabilized · lease-up risk</div>
                <p style={{ fontSize: 13.5, color: "rgba(238,239,211,0.75)", margin: 0, lineHeight: 1.5 }}>{dayOne.note}</p>
              </div>
            )}
          </div>

          <p style={{ fontSize: 12.5, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5, maxWidth: "72ch" }}>
            {auxiliaryGuidance.debtGuidanceAvailable
              ? `Modeled maximum = lesser of the assumed 75% rate-and-term LTV and what the assumed 1.00x DSCR floor supports at the entered ${auxiliaryGuidance.projectedRateLabel} rate. Covenant test uses entered rent / current PITIA. Illustrative only; verify actual terms and calculations.`
              : "Refinance proceeds and covenant guidance are unavailable until all required inputs are valid."}
          </p>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
