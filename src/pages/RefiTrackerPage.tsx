import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";
import { analyzeRefi } from "../engine/refiTracker";
import type { PropertyInputs, BorrowerProfile } from "../engine/types";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

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

  // ── Inputs (all preserved from original engine) ──
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

  // Break-even chart values for SVG (solid/flat — no glow)
  const beMonths = result?.breakEvenMonths ?? 36;
  // Map break-even month into SVG x coord (0–60 month range → 0–420px)
  const bePct = Math.min(1, Math.max(0, beMonths / 60));
  const beDotX = Math.round(bePct * 420);
  // Savings line: starts bottom-left (0,178), crosses cost line at beDotX,40
  const savEndY = Math.max(10, 178 - (178 - 40) * (420 / Math.max(1, beDotX)));
  const showDot = result !== null && beMonths < 120;

  // Input field definitions (split into two groups matching mockup)
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
      {/* Input spinner reset only — no shell style */}
      <style>{`
        .rt-num::-webkit-outer-spin-button,.rt-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .rt-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:#eeefd3;letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO (cream bg, break-even chart) ── */}
      <section
        style={{
          background: dc.cream,
          color: dc.dark,
          padding: "clamp(56px,8vh,100px) clamp(1.5rem,4vw,3rem) clamp(48px,6vh,80px)",
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
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: "0 0 24px",
              }}
            >
              Should you refi<br />this DSCR<br />loan yet?
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(0,55,56,0.7)",
                maxWidth: "48ch",
                margin: "0 0 36px",
              }}
            >
              Seasoning, equity, DSCR headroom, and monthly savings — scored
              0–100. Break-even month where refi costs cross cumulative savings.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
              <a
                href="#rf-tool"
                onClick={scrollToTool}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: dc.dark,
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 30px",
                  borderRadius: 6,
                }}
              >
                Open the refi tracker ↓
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.("dscr-calculator");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "transparent",
                  color: dc.dark,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 26px",
                  borderRadius: 6,
                  border: "1px solid rgba(0,55,56,0.3)",
                }}
              >
                DSCR calc
              </a>
            </div>
            {/* Live stat bar */}
            <div style={{ display: "flex", gap: "clamp(24px,4vw,52px)", flexWrap: "wrap" }}>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: vColor,
                    lineHeight: 1,
                  }}
                >
                  {result ? Math.round(score) : "—"}
                </Mono>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(0,55,56,0.55)",
                    marginTop: 4,
                  }}
                >
                  readiness score /100
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.rain,
                    lineHeight: 1,
                  }}
                >
                  {result && beMonths < 120 ? Math.round(beMonths) + " mo" : "—"}
                </Mono>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(0,55,56,0.55)",
                    marginTop: 4,
                  }}
                >
                  break-even
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.rain,
                    lineHeight: 1,
                  }}
                >
                  {result ? fmt$(result.cashOutMaxAmount) : "—"}
                </Mono>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(0,55,56,0.55)",
                    marginTop: 4,
                  }}
                >
                  cash-out capacity
                </div>
              </div>
            </div>
          </div>

          {/* Right — break-even chart (solid/flat, no glow) */}
          <div
            style={{
              background: dc.dark,
              borderRadius: 16,
              padding: 26,
              border: "1px solid rgba(238,239,211,0.14)",
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
              viewBox="0 0 420 200"
              style={{ width: "100%", display: "block", overflow: "visible" }}
            >
              {/* Axes */}
              <line x1="0" y1="180" x2="420" y2="180" stroke="rgba(238,239,211,0.2)" strokeWidth="1" />
              <line x1="0" y1="20" x2="0" y2="180" stroke="rgba(238,239,211,0.2)" strokeWidth="1" />
              {/* Refi cost line (flat, dashed, red) */}
              <path
                d="M 0,40 L 420,40"
                fill="none"
                stroke="#ff6b6b"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              {/* Cumulative savings line (rising, solid) */}
              <path
                d={`M 0,178 L 420,${Math.max(10, 178 - 148)}`}
                fill="none"
                stroke={dc.emerald}
                strokeWidth="3"
              />
              {/* Break-even dot */}
              {showDot && (
                <>
                  <circle
                    cx={beDotX}
                    cy={40}
                    r={6}
                    fill={dc.lemon}
                  />
                  <text
                    x={Math.min(beDotX + 8, 330)}
                    y={36}
                    fill={dc.lemon}
                    fontSize={11}
                    fontFamily={dc.mono}
                  >
                    break-even ≈ mo {Math.round(beMonths)}
                  </text>
                </>
              )}
              {/* Labels */}
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
                        {/* Progress bar — solid fill, 1px border */}
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
    </DcShell>
  );
}
