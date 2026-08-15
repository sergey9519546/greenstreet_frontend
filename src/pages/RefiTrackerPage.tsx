import React, { useState, useMemo, useEffect, useRef } from "react";
import { DcShell, dc, Mono, H1, H2, Lead, Btn, useRevealOnView } from "../design/dc";
import { RiskFlame, riskFromDscr } from "../design/artifacts";
import { analyzeRefi, evaluateRefinance } from "../engine/refiTracker";
import { computeSecondLienDscr } from "../engine/secondLienDscr";
import { computeRefiProceedsGap } from "../engine/refiProceeds";
import { computeRefiBreakEven, type HoldPeriodOutcome } from "../engine/amortization";
import { assessDscrCovenant, assessDayOneVsStabilized } from "../engine/covenantCheck";
import { radius, font, risk } from "../theme";
import type { PropertyInputs, BorrowerProfile } from "../engine/types";
import BottomCTA from "../design/BottomCTA";
import { CurrencyInput } from "../components/ui/CurrencyInput";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// Mint accent — the page's distinct colour identity (light warm-green)
const MINT = dc.mintBg; // #e8e9bf

// Colour helpers (via dc tokens only, no local consts)
const scoreColor = (score: number) =>
  score >= 80 ? dc.emerald : score >= 55 ? dc.lemon : risk.danger;
const factorColor = (v: number) =>
  v >= 20 ? dc.emerald : v >= 12 ? dc.lemon : risk.danger;

export default function RefiTrackerPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Should I Refinance My DSCR Loan? | Greenstreet Finance";
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
  // The existing note, not a remembered balance.
  //
  // This page used to take "Current Loan Balance" and "Current Monthly P&I" as
  // typed numbers. Both are derivable from the note, and taking them by hand
  // let the two disagree with each other and with the rate — a balance, a
  // payment and a rate that do not describe the same loan produce a payoff
  // figure nothing can reconcile. The release gate for this tool is "a complete
  // current-loan amortization schedule", so the schedule is now built from the
  // note terms and the balance and payment are read out of it.
  // 70.6% of the $425K purchase. The old default was $340K — 80% LTV, above
  // the 75% rate-term cap, so this page opened on a deal that could not
  // refinance at all. Nothing said so, because nothing checked.
  const [origLoanAmount, setOrigLoanAmount] = useState(300000);
  const [currentTermYears, setCurrentTermYears] = useState(30);
  const [currentRate, setCurrentRate] = useState(7.25);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [monthsOwned, setMonthsOwned] = useState(8);
  // New-loan costs and payoff requirements — gate 2. Zeroes here would quietly
  // claim a refinance is free, so they are real inputs with real defaults.
  const [newLenderFees, setNewLenderFees] = useState(1800);
  const [newThirdPartyFees, setNewThirdPartyFees] = useState(2400);
  const [newPrepaids, setNewPrepaids] = useState(1500);
  const [prepayPenaltyPct, setPrepayPenaltyPct] = useState(0);
  const [payoffFees, setPayoffFees] = useState(495);
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
  const currentValue = Math.round(purchasePrice * (1 + (projectedAppreciation / 100) * (monthsOwned / 12)));
  const escrowsMonthly = (annualTaxes + annualInsurance) / 12 + hoa;

  // ── The existing loan, evaluated against the shared amortization kernel ──
  // Balance and payment are READ from the schedule. Nothing here is typed.
  const refi = useMemo(() => {
    try {
      return evaluateRefinance({
        current: {
          originalAmount: origLoanAmount,
          annualRatePct: currentRate,
          termMonths: Math.round(currentTermYears * 12),
          monthsElapsed: monthsOwned,
          prepaymentPenaltyPct: prepayPenaltyPct,
          payoffFees,
        },
        proposed: {
          annualRatePct: projectedRate,
          termMonths: 360,
          lenderFees: newLenderFees,
          thirdPartyFees: newThirdPartyFees,
          prepaidsAndEscrows: newPrepaids,
        },
        property: { value: currentValue, qualifyingRent: monthlyRent, monthlyEscrows: escrowsMonthly },
      });
    } catch {
      return null;
    }
  }, [
    origLoanAmount, currentRate, currentTermYears, monthsOwned, prepayPenaltyPct, payoffFees,
    projectedRate, newLenderFees, newThirdPartyFees, newPrepaids,
    currentValue, monthlyRent, escrowsMonthly,
  ]);

  const currentBalance = refi ? Math.round(refi.payoff.principalBalance) : 0;
  const currentPayment = refi ? refi.currentPayment : 0;
  const firstLienPITIA = currentPayment + escrowsMonthly;
  const secondLien = computeSecondLienDscr({
    monthlyRent, firstLienPITIA, firstLienBalance: currentBalance,
    propertyValue: currentValue, secondLienAmount: secondAmount, secondLienRate: secondRate,
  });
  // Refi-proceeds gap at maturity/reset: can a new loan (capped by BOTH the
  // rate-term LTV AND the DSCR floor) retire the current balance? + binding label.
  const refiGap = computeRefiProceedsGap({
    propertyValue: currentValue,
    currentBalance,
    qualifyingRent: monthlyRent,
    escrowsMonthly,
    newRate: projectedRate,
  });
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
        projectedAppreciation,
        projectedRate
      );
      const appreciatedValue = purchasePrice * (1 + projectedAppreciation / 100);
      return {
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
        appreciatedValue,
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
    annualTaxes,
    annualInsurance,
    hoa,
  ]);

  const score = result?.totalScore ?? 0;

  // THE HEADLINE IS THE DECISION, NOT THE READINESS SCORE.
  //
  // The score measures how ready the borrower looks — seasoning, equity, DSCR
  // headroom, monthly saving. It cannot see whether the new loan actually
  // raises enough to retire the existing lien, so a deal that is short at the
  // closing table could still read "REFI READY". `evaluateRefinance` answers
  // that question and refuses when the answer is no; its decision governs, and
  // the score is reported underneath it as supporting detail.
  const decision = refi?.decision ?? null;
  const vColor =
    decision === 'PROCEED' ? dc.emerald
    : decision === 'CONDITIONAL' ? dc.lemon
    : decision === 'REFUSED' ? risk.danger
    : risk.danger;
  const vLabel =
    decision === 'PROCEED' ? 'REFI READY'
    : decision === 'CONDITIONAL' ? 'CONDITIONAL'
    : decision === 'REFUSED' ? 'NOT RECOMMENDED'
    : 'INPUTS REQUIRED';

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#rf-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
  };

  // ── Break-even chart ──────────────────────────────────────────────────────
  //
  // The previous chart drew two abstract lines — a flat "refi cost" and a
  // straight "cumulative savings" — and placed the crossover at
  // `min(1, beMonths / 60) * 420`. At the default scenario break-even is month
  // 84, so that clamped to 1.0 and pinned the marker to the right-hand edge of
  // an axis labelled "mo 60", directly beneath a label reading "mo 84". The
  // picture asserted month 60 while the text asserted month 84.
  //
  // It was also driven by `analyzeRefi.breakEvenMonths` — a payment-savings
  // shortcut — while the verdict above it comes from `evaluateRefinance`, which
  // measures total cost (payments made PLUS the balance still owed). Two
  // different break-even numbers on one page.
  //
  // Now it plots the real thing: cumulative net advantage against staying, month
  // by month, from the same evaluation the verdict uses. Zero is the baseline,
  // so the crossover is where the curve reaches it — nothing to fake.
  const chart = useMemo(() => {
    if (!refi || !refi.proposedSchedule || !refi.breakEven) return null;
    const horizon = Math.min(120, refi.breakEven.horizonMonths);
    if (horizon < 6) return null;

    const be = computeRefiBreakEven({
      currentSchedule: refi.currentSchedule,
      proposedSchedule: refi.proposedSchedule,
      refinanceAtMonth: monthsOwned,
      netCashAtClose: refi.sizing.netCashToBorrower,
      holdPeriodsMonths: Array.from({ length: horizon }, (_, i) => i + 1),
    });

    const pts = be.holdPeriods.map((h: HoldPeriodOutcome) => ({ m: h.holdMonths, adv: h.netAdvantage }));
    if (pts.length < 2) return null;

    const advs = pts.map((p: { m: number; adv: number }) => p.adv);
    // Zero is always in range: the whole question is which side of it the curve
    // is on, and a scale that excluded it would hide the answer.
    const maxUp = Math.max(0, ...advs);
    const maxDown = Math.max(0, ...advs.map((a: number) => -a));
    const span = Math.max(maxUp + maxDown, 1);

    return { pts, horizon, span, maxUp, maxDown, breakEvenMonth: be.breakEvenMonth };
  }, [refi, monthsOwned]);

  // Input field definitions
  const loanFields: Array<{
    label: string;
    hint?: string;
    value: number;
    set: (v: number) => void;
    step: number;
    prefix?: string;
    suffix?: string;
  }> = [
    { label: "Purchase Price", hint: "What you originally paid — sets your equity baseline.", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
    { label: "Original Loan Amount", hint: "What you borrowed at closing. The balance today is calculated from this, not estimated.", value: origLoanAmount, set: setOrigLoanAmount, step: 1000, prefix: "$" },
    { label: "Current Rate", hint: "Your existing interest rate — drives savings math.", value: currentRate, set: setCurrentRate, step: 0.125, suffix: "%" },
    { label: "Original Term", hint: "Years on the existing note. Sets the amortization your payoff is read from.", value: currentTermYears, set: setCurrentTermYears, step: 5, suffix: " yr" },
    { label: "Months Owned", hint: "Most lenders require 6 months before you can refi a DSCR loan.", value: monthsOwned, set: setMonthsOwned, step: 1 },
    { label: "Monthly Rent (qualifying)", hint: "The rent your lender will count — lease amount or appraised rent, whichever is lower.", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
    { label: "Projected Rate at Refi", hint: "The rate you expect to get on the new loan. Use today's market rate as your starting estimate.", value: projectedRate, set: setProjectedRate, step: 0.125, suffix: "%" },
    { label: "Projected Appreciation (%/yr)", hint: "How much you think the property will rise in value annually. Used to estimate equity at refi time.", value: projectedAppreciation, set: setProjectedAppreciation, step: 0.5, suffix: "%" },
    { label: "Annual Taxes", hint: "Your property tax bill per year. Find it on your last tax statement.", value: annualTaxes, set: setAnnualTaxes, step: 500, prefix: "$" },
    { label: "Annual Insurance", hint: "Homeowner's insurance premium per year.", value: annualInsurance, set: setAnnualInsurance, step: 250, prefix: "$" },
    { label: "Monthly HOA", hint: "Enter 0 if there is no HOA.", value: hoa, set: setHoa, step: 25, prefix: "$" },
    // Costs. Leaving these out does not make a refinance free — it just stops
    // the tool from counting what the refinance costs, which is the single
    // largest input to whether it is worth doing.
    { label: "New Lender Fees", hint: "Origination and underwriting charged by the new lender.", value: newLenderFees, set: setNewLenderFees, step: 100, prefix: "$" },
    { label: "Title, Appraisal & Recording", hint: "Third-party costs at the new closing.", value: newThirdPartyFees, set: setNewThirdPartyFees, step: 100, prefix: "$" },
    { label: "Prepaids & Escrow Deposits", hint: "Prepaid interest and escrow funded at close.", value: newPrepaids, set: setNewPrepaids, step: 100, prefix: "$" },
    { label: "Prepayment Penalty", hint: "Percent of the payoff balance charged by your CURRENT lender. 0 if your penalty has expired.", value: prepayPenaltyPct, set: setPrepayPenaltyPct, step: 1, suffix: "%" },
    { label: "Payoff / Demand Fees", hint: "Demand, recording and statement fees charged to retire the existing loan.", value: payoffFees, set: setPayoffFees, step: 50, prefix: "$" },
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
                borderRadius: 999,
                padding: "7px 14px",
                marginBottom: 24,
              }}
            >
              Refi Tracker · 4-factor readiness
            </div>
            <H1 style={{ margin: "0 0 24px", color: dc.cream }}>
              Should you refi this DSCR loan yet?
            </H1>
            <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, color: dc.lemon, maxWidth: "50ch", margin: "0 0 14px", letterSpacing: "-0.01em" }}>
              Enter your current loan and the rate you could refi into. This tool scores your deal 0–100 on four factors and shows the exact month your savings pay back the refi cost.
            </div>
            <Lead
              style={{
                color: "rgba(238,239,211,0.68)",
                maxWidth: "50ch",
                margin: "0 0 34px",
              }}
            >
              Scores seasoning (you usually need 6 months), equity (how much LTV — how the loan amount compares to the property value — has improved), DSCR (whether the property's rent can cover the loan payment; 1.00 = rent exactly covers it; higher is stronger) headroom, and monthly savings.
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
                    fontSize: "clamp(24px,3.6vw,48px)",
                    fontWeight: 600,
                    color: vColor,
                    lineHeight: 1,
                  }}
                >
                  {result ? Math.round(score) : "—"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                  readiness / 100
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(24px,3.6vw,48px)",
                    fontWeight: 600,
                    color: dc.cream,
                    lineHeight: 1,
                  }}
                >
                  {chart?.breakEvenMonth != null ? chart.breakEvenMonth + " mo" : "never"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                  break-even
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(24px,3.6vw,48px)",
                    fontWeight: 600,
                    color: dc.cream,
                    lineHeight: 1,
                  }}
                >
                  {result ? fmt$(result.cashOutMaxAmount) : "—"}
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
            {chart ? (
              <svg
                id="rf-svg"
                viewBox="0 0 420 200"
                style={{ width: "100%", display: "block", overflow: "visible" }}
                role="img"
                aria-label={
                  chart.breakEvenMonth === null
                    ? `Refinancing never costs less than staying within ${chart.horizon} months.`
                    : `Refinancing costs less than staying from month ${chart.breakEvenMonth} onward, measured on total cost.`
                }
              >
                {(() => {
                  const padL = 6, padR = 6, padT = 22, padB = 26;
                  const plotH = 200 - padT - padB;
                  const zeroY = padT + (chart.maxUp / chart.span) * plotH;
                  const X = (m: number) => padL + ((m - 1) / (chart.horizon - 1)) * (420 - padL - padR);
                  const Y = (adv: number) => zeroY - (adv / chart.span) * plotH;

                  const line = chart.pts.map((p: { m: number; adv: number }, i: number) => `${i === 0 ? "M" : "L"} ${X(p.m).toFixed(1)} ${Y(p.adv).toFixed(1)}`).join(" ");
                  const beX = chart.breakEvenMonth === null ? null : X(chart.breakEvenMonth);
                  // No crossing inside the horizon means total cost never favours
                  // refinancing (see the "Break-even" row below, which already colors
                  // this same null case risk.dangerOnDark) — the curve must not read
                  // as the same green that means "ahead" when it never gets there.
                  const trajColor = beX === null ? risk.dangerOnDark : dc.emerald;

                  return (
                    <>
                      {/* Zero is the axis: at or above it, refinancing is cheaper. */}
                      <line x1={padL} x2={420 - padR} y1={zeroY} y2={zeroY} stroke={dc.lemon} strokeWidth="1.5" />
                      <text x={padL} y={zeroY - 6} fill={dc.lemon} fontSize={10} fontWeight={700} fontFamily={dc.mono}>
                        break even
                      </text>

                      {/* Behind zero the refinance is still down on the deal. */}
                      <path d={`${line} L ${X(chart.pts[chart.pts.length - 1].m).toFixed(1)} ${zeroY} L ${X(chart.pts[0].m).toFixed(1)} ${zeroY} Z`}
                        fill={trajColor} fillOpacity="0.14" />
                      <path d={line} fill="none" stroke={trajColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

                      {beX !== null && (
                        <>
                          <line x1={beX} x2={beX} y1={padT} y2={200 - padB} stroke={dc.lemon} strokeWidth="1" strokeDasharray="4 4" />
                          <circle cx={beX} cy={zeroY} r={4.5} fill={dc.lemon} />
                          <text
                            x={beX > 300 ? beX - 8 : beX + 8}
                            y={padT + 10}
                            textAnchor={beX > 300 ? "end" : "start"}
                            fill={dc.lemon}
                            fontSize={11}
                            fontWeight={700}
                            fontFamily={dc.mono}
                          >
                            month {chart.breakEvenMonth}
                          </text>
                        </>
                      )}

                      <text x={padL} y={200 - 8} fill="rgba(238,239,211,0.66)" fontSize={11} fontFamily={dc.mono}>mo 0</text>
                      <text x={420 - padR} y={200 - 8} textAnchor="end" fill="rgba(238,239,211,0.66)" fontSize={11} fontFamily={dc.mono}>
                        mo {chart.horizon}
                      </text>
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div style={{ padding: "28px 4px", fontSize: 13, color: "rgba(238,239,211,0.62)", lineHeight: 1.6 }}>
                No crossover to plot — this refinance was refused, so there is no recommendation to
                measure against staying.
              </div>
            )}
            {/* The SVG carries its own axis, labelled with the real horizon. A second
                strip here hardcoded "mo 60" and contradicted it. */}

            {/* Live driver — drag the refi rate, watch the crossover move */}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(238,239,211,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>
                  Projected refi rate
                </span>
                <Mono style={{ fontSize: 15, fontWeight: 700, color: dc.emerald }}>
                  {currentRate.toFixed(2)}% → {projectedRate.toFixed(3).replace(/0$/, "")}%
                </Mono>
              </div>
              <input
                type="range"
                min={4}
                max={Math.max(9, Math.ceil(currentRate))}
                step={0.125}
                value={projectedRate}
                onChange={(e) => setProjectedRate(+e.target.value)}
                aria-label="Projected refi rate"
                style={{ width: "100%", accentColor: dc.emerald, cursor: "pointer" }}
              />
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 5, fontFamily: dc.mono }}>
                {chart?.breakEvenMonth == null
                  ? "no break-even at this rate — total cost never favours refinancing"
                  : `break-even at month ${chart.breakEvenMonth} · drag the rate to move it`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ──
          This section was #003a39 and its cards were #003738, sitting on the
          page's #003738 ground: three greens within six RGB points of each
          other, stacked. Read as one muddy field rather than three surfaces.
          DESIGN_SOURCE_OF_TRUTH allows exactly two surfaces — #003738 dark and
          #eeefd3 light — and separates blocks with a border, not a near-miss
          fill. Both extra greens are gone; the borders were already there. */}
      <section
        id="rf-tool"
        style={{
          background: dc.dark,
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
              80–100 = refi-ready now. 55–79 = worth watching. Below 55 = wait. A rate &amp; term refinance (replace your current loan to change the rate or term, without taking cash out) needs at least 6 months of seasoning; cash-out requires additional equity.
            </p>
          </div>
          <h2
            className="gs-reveal"
            style={{
              fontSize: "clamp(21px,3.4vw,42px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: "0 0 32px",
              color: dc.cream,
            }}
          >
            Readiness{" "}
            <Mono style={{ color: dc.cream }}>{result ? Math.round(score) : "—"}/100</Mono>
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
                background: dc.dark,
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
                  <CurrencyInput
                    surface="dark"
                    value={f.value}
                    onChange={f.set}
                    step={f.step}
                    prefix={f.prefix}
                    suffix={f.suffix}
                    style={{ padding: "0 11px" }}
                    inputStyle={{ padding: "10px 6px", fontSize: 15, fontWeight: 600 }}
                  />
                  {f.hint && (
                    <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.45, letterSpacing: 0 }}>
                      {f.hint}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* ── RESULTS ── */}
            <div className="dc-results-first">
              {/* Score card */}
              <div
                style={{
                  background: dc.dark,
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
                  Refinance Decision
                </div>
                <div
                  style={{
                    fontSize: "clamp(22px,4vw,44px)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: vColor,
                    lineHeight: 1.05,
                    fontFamily: font.family,
                  }}
                >
                  {vLabel}
                </div>

                {/* The refusal, verbatim. When the proceeds cannot retire the
                    existing lien there is no recommendation to soften — the
                    number that decides it is stated instead. */}
                {refi && refi.refusals.length > 0 && (
                  <div
                    style={{
                      textAlign: "left",
                      margin: "14px 0 0",
                      padding: "12px 14px",
                      borderRadius: radius.sm,
                      background: risk.dangerBg,
                      border: `1px solid ${risk.dangerBorder}`,
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: dc.cream,
                    }}
                  >
                    {refi.refusals.map((r) => (
                      <p key={r.code} style={{ margin: "0 0 6px" }}>{r.message}</p>
                    ))}
                  </div>
                )}

                {/* The three figures the decision rests on, always shown so the
                    verdict can be checked rather than taken on trust. */}
                {refi && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "16px 0 0" }}>
                    {[
                      { l: "Payoff today", v: fmt$(refi.payoff.totalPayoff) },
                      { l: "New loan funds at", v: fmt$(refi.sizing.fundedAmount) },
                      {
                        l: refi.sizing.netCashToBorrower >= 0 ? "Cash to you" : "Cash to close",
                        v: fmt$(Math.abs(refi.sizing.netCashToBorrower)),
                      },
                    ].map((c) => (
                      <div key={c.l} style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "10px 12px" }}>
                        <Mono style={{ display: "block", fontSize: 16, fontWeight: 700, color: dc.cream }}>{c.v}</Mono>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>{c.l}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Readiness is reported UNDER the decision, never as it. It
                    cannot see whether the loan retires the lien. */}
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "14px 0 12px" }}>
                  Borrower readiness{" "}
                  <Mono style={{ color: result ? scoreColor(score) : "inherit", fontWeight: 700 }}>
                    {result ? Math.round(score) : "—"}/100
                  </Mono>{" "}
                  — seasoning, equity, coverage and saving. Separate from whether the proceeds clear the payoff.
                </div>
                <div style={{ fontSize: 14, color: "rgba(238,239,211,0.6)" }}>
                  {result?.refiType === "RATE_TERM" &&
                    "Rate & term refi — you lower your rate/term without pulling cash out. Balance stays roughly the same."}
                  {result?.refiType === "CASH_OUT" &&
                    `You have equity to pull out. Maximum cash-out: ${fmt$(result.cashOutMaxAmount)} (at 70% LTV — 70 cents borrowed per dollar of value).`}
                  {result?.refiType === "NO_REFI" &&
                    "No meaningful savings and not enough equity. Stay in your current loan and revisit in 6–12 months."}
                  {!result && "Fill in the inputs on the left to see your readiness score."}
                </div>
              </div>

              {/* Refi Math */}
              <div
                style={{
                  background: dc.dark,
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
                {result ? (
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
                      sub: result.refiDSCR >= 1.0 ? "Still qualifies after the new payment." : "Caution — rent may not cover the new payment.",
                      val: result.refiDSCR.toFixed(2) + "x",
                      color: result.refiDSCR >= 1.0 ? dc.emerald : risk.danger,
                      flame: riskFromDscr(result.refiDSCR),
                    },
                    {
                      label: "Monthly savings",
                      sub: "How much less you'd pay per month vs. your current loan.",
                      val:
                        (result.monthlySavings >= 0 ? "+" : "") +
                        fmt$(result.monthlySavings),
                      color: result.monthlySavings >= 0 ? dc.emerald : risk.danger,
                    },
                    {
                      // ONE break-even number on this page. This row used to quote
                      // analyzeRefi's payment-savings shortcut while the chart and the
                      // verdict quoted evaluateRefinance's total-cost measure — 84
                      // months against 41 on the same deal, both on screen at once.
                      label: "Break-even",
                      sub:
                        chart?.breakEvenMonth == null
                          ? "Total cost never favours refinancing inside the remaining term — hold the existing loan."
                          : "Month from which refinancing costs less in total — payments made PLUS the balance still owed, not payment saving alone.",
                      val: chart?.breakEvenMonth == null ? "never" : chart.breakEvenMonth + " mo",
                      color: chart?.breakEvenMonth == null ? risk.dangerOnDark : chart.breakEvenMonth < 36 ? dc.emerald : dc.lemon,
                    },
                    {
                      label: "Cash-out capacity",
                      sub: "Max you could pull out at 70% LTV (how the loan compares to property value). Zero if not enough equity.",
                      val: fmt$(result.cashOutMaxAmount),
                      color: dc.cream,
                    },
                    {
                      label: "Seasoning requirement",
                      sub: "Lenders typically require you to own the property 6 months before refinancing.",
                      val: result.seasoningMet
                        ? "Met (6 mo)"
                        : `${monthsOwned}/6 mo — not yet met`,
                      color: result.seasoningMet ? dc.emerald : risk.danger,
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
                      color: risk.danger,
                      padding: "8px 0",
                    }}
                  >
                    No result yet — check that your loan balance and purchase price are filled in above.
                  </div>
                )}
              </div>

              {/* Score Breakdown */}
              <div
                style={{
                  background: dc.dark,
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
                <strong style={{ color: dc.emerald }}>How the score works:</strong> Four factors scored 0–25 each: seasoning (how long you've owned it), equity (LTV improvement), DSCR headroom (rent vs. new payment), and monthly savings. Cash-out is capped at 70% LTV (loan-to-value); rate &amp; term at 75%. Output from analyzeRefi v11.7.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2nd-lien / HELOC alternative — tap equity without refinancing ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(48px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Or: tap equity without refinancing</div>
          <H2 style={{ fontSize: "clamp(20px,3vw,38px)", margin: "0 0 12px", maxWidth: "20ch" }}>Keep your {currentRate}% first lien. Borrow against the equity.</H2>
          <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "62ch", margin: "0 0 26px" }}>
            A DSCR closed-end 2nd lien (the $21B market Angel Oak opened) pulls cash without touching a low-rate 1st lien or paying its prepay penalty. Qualifies on <strong style={{ color: dc.cream }}>combined</strong> DSCR = rent ÷ (1st payment + 2nd payment), CLTV ≤ 75%.
          </Lead>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { l: "2nd-lien draw", v: secondAmount, set: setSecondAmount, step: 5000, pre: "$" },
              { l: "2nd-lien rate", v: secondRate, set: setSecondRate, step: 0.125, suf: "%" },
            ].map((f) => (
              <label key={f.l} style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.6)", marginBottom: 6 }}>{f.l}</span>
                <CurrencyInput
                  surface="dark"
                  value={f.v}
                  onChange={f.set}
                  step={f.step}
                  prefix={f.pre}
                  suffix={f.suf}
                  style={{ display: "inline-flex", background: dc.dark }}
                  adornmentStyle={{ fontSize: 14 }}
                  inputStyle={{ width: 140, fontWeight: 600, fontSize: 15, padding: "11px 6px" }}
                />
              </label>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="dc-band-4">
            {[
              { v: `${secondLien.combinedDSCR.toFixed(2)}x`, l: "combined DSCR", c: secondLien.combinedDSCR >= 1.0 ? dc.emerald : risk.danger },
              { v: `${secondLien.cltv.toFixed(0)}%`, l: "CLTV (cap 75%)", c: secondLien.cltv <= 75 ? dc.cream : risk.danger },
              { v: fmt$(secondLien.maxSecondLien), l: `max 2nd lien · ${secondLien.bindingConstraint}-bound`, c: dc.cream },
              { v: secondLien.qualifies ? "QUALIFIES" : "TIGHT", l: `2nd pmt ${fmt$(secondLien.secondLienPayment)}/mo`, c: secondLien.qualifies ? dc.emerald : dc.lemon },
            ].map((s) => (
              <div key={s.l} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.14)", borderRadius: radius.md, padding: "clamp(16px,2vw,22px)" }}>
                <Mono style={{ fontSize: "clamp(18px,2.4vw,30px)", fontWeight: 700, color: s.c, letterSpacing: "-0.03em", display: "block", lineHeight: 1 }}>{s.v}</Mono>
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5, maxWidth: "72ch" }}>
            Best when your 1st lien is below market and carries a prepay penalty. Max draw is the lesser of the CLTV room and what combined DSCR supports. Illustrative — exact terms by lender.
          </p>
        </div>
      </section>

      {/* ── REFINANCE AT MATURITY — proceeds gap + debt covenants (Sprint 2) ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(48px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Refinance at maturity / ARM reset</div>
          <H2 style={{ fontSize: "clamp(20px,3vw,38px)", margin: "0 0 12px", maxWidth: "22ch" }}>When the loan comes due, can the property refinance out?</H2>
          <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "64ch", margin: "0 0 26px" }}>
            At a balloon maturity or ARM reset the new loan is capped by <strong style={{ color: dc.cream }}>both</strong> the 75% rate-term LTV and the DSCR floor — whichever binds first. If it can't cover the existing balance, you bring cash to close (the proceeds gap).
          </Lead>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { l: "DSCR covenant (maintenance)", v: covenantDscr, set: setCovenantDscr, step: 0.05, suf: "x", pre: "" },
              { l: "In-place rent now (day-one)", v: inPlaceRent, set: setInPlaceRent, step: 50, pre: "$", suf: "" },
            ].map((f) => (
              <label key={f.l} style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.6)", marginBottom: 6 }}>{f.l}</span>
                <CurrencyInput
                  surface="dark"
                  value={f.v}
                  onChange={f.set}
                  step={f.step}
                  prefix={f.pre}
                  suffix={f.suf}
                  style={{ display: "inline-flex" }}
                  adornmentStyle={{ fontSize: 14 }}
                  inputStyle={{ width: 150, fontWeight: 600, fontSize: 15, padding: "11px 6px" }}
                />
              </label>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="dc-band-4">
            {[
              { v: fmt$(refiGap.maxNewLoan), l: `max new loan · ${refiGap.bindingConstraint}-bound`, c: dc.cream },
              refiGap.canRetireBalance
                ? { v: fmt$(refiGap.cashOutAvailable), l: "cash-out available", c: dc.emerald }
                : { v: fmt$(refiGap.proceedsGap), l: "cash to close (gap)", c: risk.danger },
              { v: fmt$(refiGap.newPayment), l: "new P&I / mo", c: dc.cream },
              { v: refiGap.canRetireBalance ? "CLEARS" : "SHORT", l: `vs ${fmt$(currentBalance)} balance`, c: refiGap.canRetireBalance ? dc.emerald : risk.danger },
            ].map((s) => (
              <div key={s.l} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.14)", borderRadius: radius.md, padding: "clamp(16px,2vw,22px)" }}>
                <Mono style={{ fontSize: "clamp(18px,2.4vw,30px)", fontWeight: 700, color: s.c, letterSpacing: "-0.03em", display: "block", lineHeight: 1 }}>{s.v}</Mono>
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* debt-test flags */}
          <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
            {!refiGap.canRetireBalance && (
              <div style={{ background: risk.dangerBg, border: `1px solid ${risk.dangerBorder}`, borderLeft: `3px solid ${risk.danger}`, borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: risk.danger, marginBottom: 4 }}>Refi proceeds gap · {refiGap.bindingConstraint}-constrained</div>
                <p style={{ fontSize: 13.5, color: "rgba(238,239,211,0.75)", margin: 0, lineHeight: 1.5 }}>
                  A new loan tops out at {fmt$(refiGap.maxNewLoan)} — {fmt$(refiGap.proceedsGap)} short of the {fmt$(currentBalance)} balance. You'd bring that cash to close, or negotiate an extension/paydown. The {refiGap.bindingConstraint === "LTV" ? "value (LTV)" : "rent (DSCR)"} is the binding limit.
                </p>
              </div>
            )}
            {covenant.status !== "OK" && (
              <div style={{ background: covenant.status === "BREACH" ? risk.dangerBg : risk.warningBg, border: `1px solid ${covenant.status === "BREACH" ? risk.dangerBorder : risk.warningBorder}`, borderLeft: `3px solid ${covenant.status === "BREACH" ? risk.danger : risk.warning}`, borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: covenant.status === "BREACH" ? risk.danger : risk.warning, marginBottom: 4 }}>DSCR covenant · {covenant.status}</div>
                <p style={{ fontSize: 13.5, color: "rgba(238,239,211,0.75)", margin: 0, lineHeight: 1.5 }}>{covenant.note}</p>
              </div>
            )}
            {dayOne.leaseUpRisk && (
              <div style={{ background: risk.warningBg, border: `1px solid ${risk.warningBorder}`, borderLeft: `3px solid ${risk.warning}`, borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: risk.warning, marginBottom: 4 }}>Day-one vs stabilized · lease-up risk</div>
                <p style={{ fontSize: 13.5, color: "rgba(238,239,211,0.75)", margin: 0, lineHeight: 1.5 }}>{dayOne.note}</p>
              </div>
            )}
          </div>

          <p style={{ fontSize: 12.5, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5, maxWidth: "72ch" }}>
            Max new loan = lesser of the 75% rate-term LTV and what the DSCR floor (1.00x) supports at the projected {projectedRate}% rate. Covenant test uses current rent ÷ current PITIA. Illustrative — exact terms by lender.
          </p>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
