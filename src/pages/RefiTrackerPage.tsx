import React, { useState, useMemo, useEffect, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { gsap } from "gsap";
import { analyzeRefi } from "../engine/refiTracker";
import type { PropertyInputs, BorrowerProfile } from "../engine/types";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// Mint accent — the page's distinct colour identity (light warm-green)
const MINT = dc.mintBg; // #e8e9bf

// Colour helpers (via dc tokens only, no local consts)
const scoreColor = (score: number) =>
  score >= 80 ? dc.emerald : score >= 55 ? dc.lemon : "#ff6b6b";
const factorColor = (v: number) =>
  v >= 20 ? dc.emerald : v >= 12 ? dc.lemon : "#ff6b6b";

export default function RefiTrackerPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Refi Tracker | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Ref to the SVG lines for draw animation
  const costLineRef = useRef<SVGPathElement>(null);
  const saveLineRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const lblRef = useRef<SVGTextElement>(null);
  const animatedOnce = useRef(false);

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
        isForeignNational: false,
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
  const vColor = result ? scoreColor(score) : "#ff6b6b";
  const vLabel = result
    ? score >= 80
      ? "REFI READY"
      : score >= 55
      ? "CONDITIONAL"
      : "NOT READY"
    : "INPUTS REQUIRED";

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
  const noBreakeven = result === null || ms <= 0 || beMonths >= 120;
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

  // ── Animate SVG lines on mount (draw-on effect, matches mockup rf-line anim) ──
  useEffect(() => {
    if (animatedOnce.current) return;
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const cost = costLineRef.current;
    const save = saveLineRef.current;
    const dot = dotRef.current;
    const lbl = lblRef.current;
    if (!cost || !save) return;

    animatedOnce.current = true;

    // Cost line: fixed length 420
    const costLen = 420;
    const saveLen = save.getTotalLength ? save.getTotalLength() : 420;

    // Set initial dash state — cost keeps its 6,4 dashes but offset hides it
    gsap.set(cost, { strokeDasharray: "6,4", strokeDashoffset: costLen });
    gsap.set(save, { strokeDasharray: saveLen, strokeDashoffset: saveLen });
    if (dot) gsap.set(dot, { opacity: 0 });
    if (lbl) gsap.set(lbl, { opacity: 0 });

    gsap.to(cost, { strokeDashoffset: 0, duration: 1.3, delay: 0.5, ease: "power2.inOut" });
    gsap.to(save, { strokeDashoffset: 0, duration: 1.3, delay: 0.7, ease: "power2.inOut" });
    if (dot && lbl && showDot) {
      gsap.to([dot, lbl], { opacity: 1, duration: 0.5, delay: 1.7 });
    }
  }, []); // run once on mount

  // Input field definitions
  const loanFields: Array<{
    label: string;
    value: number;
    set: (v: number) => void;
    step: number;
    prefix?: string;
    suffix?: string;
  }> = [
    { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
    { label: "Current Loan Balance", value: currentBalance, set: setCurrentBalance, step: 1000, prefix: "$" },
    { label: "Current Rate", value: currentRate, set: setCurrentRate, step: 0.125, suffix: "%" },
    { label: "Current Monthly P&I", value: currentPayment, set: setCurrentPayment, step: 25, prefix: "$" },
    { label: "Months Owned", value: monthsOwned, set: setMonthsOwned, step: 1 },
    { label: "Monthly Rent (qualifying)", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
    { label: "Projected Rate at Refi", value: projectedRate, set: setProjectedRate, step: 0.125, suffix: "%" },
    { label: "Projected Appreciation", value: projectedAppreciation, set: setProjectedAppreciation, step: 0.5, suffix: "%" },
    { label: "Annual Taxes", value: annualTaxes, set: setAnnualTaxes, step: 500, prefix: "$" },
    { label: "Annual Insurance", value: annualInsurance, set: setAnnualInsurance, step: 250, prefix: "$" },
    { label: "Monthly HOA", value: hoa, set: setHoa, step: 25, prefix: "$" },
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

      {/* ── HERO — MINT background, dark ink, break-even chart as signature ── */}
      <section
        id="rf-hero"
        style={{
          background: MINT,
          color: dc.dark,
          padding: "clamp(56px,8vh,100px) clamp(1.25rem,4vw,2.5rem) clamp(48px,6vh,80px)",
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
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: dc.rain,
                marginBottom: 22,
                border: "1px solid rgba(0,101,101,0.4)",
                borderRadius: 8,
                padding: "7px 16px",
              }}
            >
              4-factor readiness · break-even · cash-out
            </div>
            <H1 style={{ margin: "0 0 22px" }}>
              Should you refi this DSCR loan yet?
            </H1>
            <Lead
              style={{
                color: "rgba(0,55,56,0.7)",
                maxWidth: "52ch",
                margin: "0 0 32px",
              }}
            >
              Seasoning, equity, DSCR headroom, and monthly savings — scored
              0–100. Plus the break-even month where refi costs cross savings.
            </Lead>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
              <Btn label="Open the refi tracker" href="#rf-tool" onClick={scrollToTool} />
              <Btn
                label="DSCR calc"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.("dscr-calculator");
                }}
              />
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
                  {result ? Math.round(score) : "—"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.55)", marginTop: 4 }}>
                  readiness / 100
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(32px,3.6vw,48px)",
                    fontWeight: 600,
                    color: dc.rain,
                    lineHeight: 1,
                  }}
                >
                  {result && beMonths < 120 ? Math.round(beMonths) + " mo" : "—"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.55)", marginTop: 4 }}>
                  break-even
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(32px,3.6vw,48px)",
                    fontWeight: 600,
                    color: dc.rain,
                    lineHeight: 1,
                  }}
                >
                  {result ? fmt$(result.cashOutMaxAmount) : "—"}
                </Mono>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.55)", marginTop: 4 }}>
                  cash-out capacity
                </div>
              </div>
            </div>
          </div>

          {/* Right — break-even crossing-lines chart (THE signature visual) */}
          <div
            style={{
              background: dc.dark,
              borderRadius: 16,
              padding: 26,
              boxShadow: "0 40px 80px -20px rgba(0,55,56,0.4)",
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
                stroke="#ff6b6b"
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
              <text x="6" y="34" fill="rgba(255,107,107,0.8)" fontSize={10} fontFamily={dc.mono}>refi cost</text>
              <text x="6" y="170" fill="rgba(77,189,151,0.9)" fontSize={10} fontFamily={dc.mono}>cumulative savings →</text>
            </svg>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "rgba(238,239,211,0.45)",
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
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)" }}>
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
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.4)", marginTop: 5, fontFamily: dc.mono }}>
                {noBreakeven
                  ? "no break-even at this rate — savings never recoup the cost"
                  : `break-even ≈ month ${Math.round(beMonths)} · drag to move it`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL (dark bg) ── */}
      <section
        id="rf-tool"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
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
                background: dc.teal,
                border: "1px solid rgba(238,239,211,0.12)",
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: dc.lemon,
                  marginBottom: 16,
                }}
              >
                Current Loan &amp; Refi Assumptions
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
                      <span style={{ color: "rgba(238,239,211,0.4)" }}>{f.prefix}</span>
                    )}
                    <input
                      className="rt-num"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => f.set(+e.target.value)}
                      style={{ padding: "10px 6px", fontSize: 15, fontWeight: 600 }}
                    />
                    {f.suffix && (
                      <span style={{ color: "rgba(238,239,211,0.4)" }}>{f.suffix}</span>
                    )}
                  </div>
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
                  {result ? Math.round(score) : "—"}
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
                  {result?.refiType === "RATE_TERM" &&
                    "Rate-and-term refi. Balance roughly flat."}
                  {result?.refiType === "CASH_OUT" &&
                    `Cash-out capacity: ${fmt$(result.cashOutMaxAmount)} at 70% LTV.`}
                  {result?.refiType === "NO_REFI" &&
                    "No savings, no equity. Wait for better conditions."}
                  {!result && "Adjust inputs to compute readiness."}
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
                {result ? (
                  [
                    {
                      label: "Current DSCR",
                      val: result.currentDSCR.toFixed(2) + "x",
                      color: dc.cream,
                    },
                    {
                      label: "Projected DSCR after refi",
                      val: result.refiDSCR.toFixed(2) + "x",
                      color: result.refiDSCR >= 1.0 ? dc.emerald : "#ff6b6b",
                    },
                    {
                      label: "Monthly savings",
                      val:
                        (result.monthlySavings >= 0 ? "+" : "") +
                        fmt$(result.monthlySavings),
                      color: result.monthlySavings >= 0 ? dc.emerald : "#ff6b6b",
                    },
                    {
                      label: "Break-even (months)",
                      val:
                        result.breakEvenMonths > 120
                          ? "120+ (don't refi)"
                          : Math.round(result.breakEvenMonths) + " mo",
                      color: result.breakEvenMonths < 36 ? dc.emerald : dc.lemon,
                    },
                    {
                      label: "Cash-out capacity (70% LTV)",
                      val: fmt$(result.cashOutMaxAmount),
                      color: dc.cream,
                    },
                    {
                      label: "Seasoning (6 mo required)",
                      val: result.seasoningMet
                        ? "Met"
                        : `${monthsOwned}/6 mo`,
                      color: result.seasoningMet ? dc.emerald : "#ff6b6b",
                    },
                  ].map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid rgba(238,239,211,0.08)",
                        fontSize: 14,
                      }}
                    >
                      <span style={{ color: "rgba(238,239,211,0.65)" }}>{r.label}</span>
                      <Mono style={{ color: r.color, fontWeight: 700 }}>{r.val}</Mono>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#ff6b6b",
                      padding: "8px 0",
                    }}
                  >
                    Engine returned no result. Adjust inputs.
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
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: dc.lemon,
                    marginBottom: 14,
                  }}
                >
                  Score Breakdown (4 factors × 25)
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
                            color: "rgba(238,239,211,0.5)",
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
                  <div style={{ fontSize: 13, color: "rgba(238,239,211,0.4)", padding: "8px 0" }}>
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
                  color: "rgba(238,239,211,0.45)",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: dc.emerald }}>Engine:</strong> src/engine/refiTracker.ts → analyzeRefi (v11.7). 4-factor composite: seasoning (25), equity (25), DSCR headroom (25), monthly savings (25). Cash-out cap 70% LTV; rate-term cap 75%.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINT CLOSING BAND — matches mockup footer treatment (mint bg, dark ink) ── */}
      <section
        style={{
          background: MINT,
          color: dc.dark,
          padding: `clamp(40px,5vw,64px) ${dc.pad}`,
          borderTop: "1px solid rgba(0,55,56,0.2)",
        }}
      >
        <div
          className="gs-reveal"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: dc.rain,
                marginBottom: 8,
              }}
            >
              Ready to run the numbers?
            </div>
            <p
              style={{
                fontSize: "clamp(20px,2.2vw,28px)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: dc.dark,
                margin: 0,
                maxWidth: "44ch",
              }}
            >
              Run your DSCR calc first — confirm the loan qualifies before pricing the refi.
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate?.("dscr-calculator"); }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: dc.dark,
              color: MINT,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              padding: "15px 30px",
              borderRadius: 8,
              whiteSpace: "nowrap",
            }}
          >
            Open DSCR Calc →
          </a>
        </div>
      </section>
    </DcShell>
  );
}
