import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, useRevealOnView, H1, Lead, Btn } from "../design/dc";
import { RiskFlame, riskFromDscr } from "../design/artifacts";
import {
  simulateARMResetLadder,
  DEFAULT_ARM_PROGRAMS,
  computeRemainingBalanceAtReset,
  CURRENT_MARKET_SNAPSHOT,
  computeMultiScenarioARMReset,
} from "../engine/armResetEngine";
import { calculatePI } from "../engine/engine";
import { computeRefiProceedsGap } from "../engine/refiProceeds";
import type { ARMTerms } from "../engine/types";
import BottomCTA from "../design/BottomCTA";
import { risk } from "../theme";

// ── helpers ───────────────────────────────────────────────────────────────────

type ArmType = "5_6_ARM" | "7_6_ARM" | "10_6_ARM";

const SOFR_SCENARIOS: { label: string; sofr: number; color: string }[] = [
  { label: "Bullish",  sofr: 2.59, color: dc.emerald },
  { label: "Base",     sofr: 3.59, color: dc.lemon },
  { label: "Bearish",  sofr: 4.59, color: "#ff8c42" },
  { label: "Stress",   sofr: 5.00, color: risk.danger },
  { label: "Crisis",   sofr: 7.00, color: "#c0392b" },
];

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function shockColor(pct: number): string {
  if (pct > 20) return risk.danger;
  if (pct > 8)  return dc.lemon;
  return dc.emerald;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ARMPage({
  onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate?: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "What Happens When My ARM Resets? | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Payment-jump bars reveal on scroll-in (state-driven transition, never stuck)
  const [jumpRef, jumpShown] = useRevealOnView<HTMLDivElement>();

  // Inputs
  const [armType, setArmType] = useState<ArmType>("5_6_ARM");
  const [loanAmount, setLoanAmount]     = useState(340000);
  const [monthlyRent, setMonthlyRent]   = useState(3000);
  const [pitiaNonDebt, setPitiaNonDebt] = useState(750);

  // Derived from engine
  const result = useMemo(() => {
    try {
      const cfg: ARMTerms = DEFAULT_ARM_PROGRAMS[armType];
      const fixedMonths = cfg.fixedPeriodMonths;
      const firstResetYear = fixedMonths / 12;

      const piInitial = calculatePI(loanAmount, cfg.initialRate, 360);

      const balAtReset = computeRemainingBalanceAtReset(
        loanAmount,
        cfg.initialRate,
        360,
        fixedMonths,
      );
      const remTerm = 360 - fixedMonths;

      const scenarios = SOFR_SCENARIOS.map((sc) => {
        const ladder = simulateARMResetLadder(cfg, sc.sofr, 15);
        const firstReset  = ladder.trajectory[0];
        const lastReset   = ladder.trajectory[ladder.trajectory.length - 1];

        const piAtFirst = firstReset
          ? calculatePI(balAtReset, firstReset.rate, remTerm)
          : 0;
        const dscrAtFirst =
          piAtFirst > 0 ? monthlyRent / (piAtFirst + pitiaNonDebt) : 0;

        const piAtLast = lastReset
          ? calculatePI(balAtReset, lastReset.rate, remTerm)
          : 0;
        const dscrAtLast =
          piAtLast > 0 ? monthlyRent / (piAtLast + pitiaNonDebt) : 0;

        return {
          ...sc,
          ladder,
          firstReset,
          lastReset,
          piAtFirst,
          dscrAtFirst,
          piAtLast,
          dscrAtLast,
        };
      });

      const worstFirstResetRate = Math.min(
        cfg.initialRate + cfg.initialCapPct,
        cfg.initialRate + cfg.lifetimeCapPct,
      );
      const piAtWorstFirstReset = calculatePI(balAtReset, worstFirstResetRate, remTerm);
      const paymentShockPct =
        piInitial > 0
          ? ((piAtWorstFirstReset - piInitial) / piInitial) * 100
          : 0;

      const bearish = scenarios.find((s) => s.label === "Bearish")!;

      const lifetimeCapRate = cfg.initialRate + cfg.lifetimeCapPct;
      const piAtLifetimeCap = calculatePI(balAtReset, lifetimeCapRate, remTerm);

      const fixedYears = fixedMonths / 12;

      return {
        cfg,
        fixedYears,
        firstResetYear,
        piInitial,
        balAtReset,
        remTerm,
        piAtWorstFirstReset,
        worstFirstResetRate,
        paymentShockPct,
        lifetimeCapRate,
        piAtLifetimeCap,
        scenarios,
        bearish,
      };
    } catch (_e) {
      return null;
    }
  }, [armType, loanAmount, monthlyRent, pitiaNonDebt]);

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#arm-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",     view: "dscr-calculator" },
        { label: "Programs",      view: "lender-intel" },
        { label: "Portfolio",     view: "portfolio" },
      ]}
      cta={{ label: "Model the reset →", onClick: scrollToTool }}
    >
      {/* hide number spinners */}
      <style>{`
        .arm-in::-webkit-outer-spin-button,.arm-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .arm-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="ar-hero"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: "clamp(64px,9vh,128px) clamp(1.5rem,4vw,3rem) clamp(56px,7vh,96px)",
          overflow: "hidden",
        }}
      >
        <div
          id="gs-hero-content"
          style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}
        >
          {/* Eyebrow pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
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
            5/6 · 7/6 · 10/6 ARM · SOFR + margin · caps
          </div>

          <H1 style={{ margin: "0 0 20px" }}>
            What happens when
            <br />
            the fixed period ends?
          </H1>

          {/* Glossed definition upfront */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: dc.lemon,
              maxWidth: "56ch",
              margin: "0 auto 14px",
              lineHeight: 1.6,
              letterSpacing: "-0.01em",
            }}
          >
            An ARM (a loan whose rate is fixed for a few years, then can adjust)
            looks cheap at first — but your payment jumps when the fixed period
            ends. This tool shows exactly how big that jump is, and whether your
            DSCR (whether the property's rent can cover the loan payment; 1.00 =
            rent exactly covers it; higher is stronger) still holds up.
          </div>

          <Lead
            style={{
              color: "rgba(238,239,211,0.7)",
              maxWidth: "58ch",
              margin: "0 auto 44px",
            }}
          >
            Enter your loan and pick a program. See the payment at first reset,
            every subsequent adjustment, and the worst-case lifetime cap — caps
            applied exactly as written in the note.
          </Lead>

          {/* ── PAYMENT-SHOCK TIMELINE — hero signature ── */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              maxWidth: 960,
              margin: "0 auto 36px",
              borderRadius: dc.r.md,
              overflow: "hidden",
            }}
          >
            {/* Fixed */}
            <div
              style={{
                flex: 5,
                background: dc.emerald,
                color: dc.dark,
                padding: "22px 20px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                {result ? `Years 1–${result.fixedYears}` : "Years 1–5"}
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
                Fixed
              </Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.75, marginTop: 2 }}>
                {result ? `${result.cfg.initialRate.toFixed(2)}% locked` : "7.00% locked"}
              </div>
            </div>

            {/* First reset */}
            <div
              style={{
                flex: 2,
                background: dc.lemon,
                color: dc.dark,
                padding: "22px 16px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                First reset
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
                {result ? `+${result.cfg.initialCapPct.toFixed(1)}%` : "+2.0%"}
              </Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.75, marginTop: 2 }}>
                cap-limited
              </div>
            </div>

            {/* Adjusts */}
            <div
              style={{
                flex: 3,
                background: dc.rain,
                color: dc.cream,
                padding: "22px 18px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.65 }}>
                {result ? `Years ${result.fixedYears + 1}–30` : "Years 6–30"}
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4, color: dc.cream }}>
                Adjusts
              </Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>
                {result ? `SOFR + ${result.cfg.marginPct.toFixed(2)}%` : "SOFR + 2.75%"}
              </div>
            </div>
          </div>

          {/* Payment trajectory step-chart — flat fixed period, the reset jump, then floating years */}
          {result && (() => {
            const pi0 = result.piInitial;
            const pi1 = result.piAtWorstFirstReset;
            const fy = result.fixedYears;
            const shock = result.paymentShockPct;
            const sc = shockColor(shock);
            const vMax = pi1 * 1.16, vMin = pi0 * 0.7;
            const xOf = (yr: number) => 50 + (yr / 30) * 414;
            const yOf = (v: number) => 150 - ((v - vMin) / (vMax - vMin)) * 114;
            const x0 = xOf(0), xR = xOf(fy), xE = xOf(30);
            const y0 = yOf(pi0), y1 = yOf(pi1);
            const fixedPath = `M${x0} ${y0} L${xR} ${y0}`;
            const jumpPath = `M${xR} ${y0} L${xR} ${y1} L${xE} ${y1}`;
            const area = `M${x0} ${y0} L${xR} ${y0} L${xR} ${y1} L${xE} ${y1} L${xE} 150 L${x0} 150 Z`;
            return (
              <div ref={jumpRef} style={{ margin: "8px 0 36px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", textAlign: "center", marginBottom: 16 }}>
                  Monthly P&amp;I — fixed period, the reset, then it floats
                </div>
                <svg viewBox="0 0 480 174" style={{ width: "100%", height: "auto", display: "block", maxWidth: 560, margin: "0 auto", overflow: "visible" }}>
                  {[150, 110, 70, 30].map((gy) => (
                    <line key={gy} x1={x0} y1={gy} x2={xE} y2={gy} stroke="rgba(238,239,211,0.08)" strokeWidth="1" />
                  ))}
                  <line x1={xR} y1={y1 - 6} x2={xR} y2={150} stroke="rgba(238,239,211,0.18)" strokeWidth="1" strokeDasharray="3 5" />
                  <path d={area} fill={`${sc}1f`} stroke="none" style={{ opacity: jumpShown ? 1 : 0, transition: "opacity .5s ease .35s" }} />
                  <path d={fixedPath} fill="none" stroke={dc.emerald} strokeWidth="3.5" strokeLinecap="round" pathLength={100} style={{ strokeDasharray: 100, strokeDashoffset: jumpShown ? 0 : 100, transition: "stroke-dashoffset .55s ease" }} />
                  <path d={jumpPath} fill="none" stroke={sc} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength={100} style={{ strokeDasharray: 100, strokeDashoffset: jumpShown ? 0 : 100, transition: "stroke-dashoffset .7s ease .5s" }} />
                  <circle cx={xR} cy={y1} r="5.5" fill={sc} style={{ opacity: jumpShown ? 1 : 0, transition: "opacity .3s ease 1.1s" }} />
                  <text x={x0} y={y0 - 10} fontSize="13" fontWeight="700" fill={dc.emerald} fontFamily={dc.mono}>{fmt$(pi0)}</text>
                  <text x={xE} y={y1 - 12} fontSize="13" fontWeight="700" fill={sc} fontFamily={dc.mono} textAnchor="end">{fmt$(pi1)}</text>
                  <text x={xR + 9} y={(y0 + y1) / 2} fontSize="12" fontWeight="700" fill={sc} fontFamily={dc.mono}>+{shock.toFixed(1)}%</text>
                  <text x={x0} y={168} fontSize="10" fontWeight="600" fill="rgba(238,239,211,0.62)">Yr 1</text>
                  <text x={xR} y={168} fontSize="10" fontWeight="600" fill="rgba(238,239,211,0.6)" textAnchor="middle">Yr {fy} · reset</text>
                  <text x={xE} y={168} fontSize="10" fontWeight="600" fill="rgba(238,239,211,0.62)" textAnchor="end">Yr 30</text>
                </svg>
              </div>
            );
          })()}

          {/* CTA row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Btn label="Model the reset ↓" href="#arm-tool" onClick={scrollToTool} />
            <Btn
              label="DSCR Calculator"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("dscr-calculator");
              }}
            />
          </div>
        </div>
      </section>

      {/* ── TOOL ─────────────────────────────────────────────────────────── */}
      <section
        id="arm-tool"
        style={{
          background: "#003a39",
          color: dc.cream,
          padding: `clamp(52px,7vw,92px) clamp(1.5rem,4vw,3rem) clamp(64px,9vh,116px)`,
          borderTop: `1px solid ${dc.faded}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.lemon,
                marginBottom: 12,
              }}
            >
              Live ARM reset engine
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,52px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                margin: "0 0 12px",
                color: dc.cream,
              }}
            >
              First-reset payment shock:{" "}
              <span style={{ color: result ? shockColor(result.paymentShockPct) : dc.lemon }}>
                {result ? `+${result.paymentShockPct.toFixed(1)}%` : "—"}
              </span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(238,239,211,0.6)",
                margin: 0,
                maxWidth: "62ch",
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Below 8% shock = manageable. 8–20% = watch carefully. Above 20% = red.
              If DSCR drops below 1.0 at reset, the property can no longer cover its own
              costs — a deal-breaker for most investors and underwriters. A prepayment
              penalty (a fee some loans charge if you refinance early) may also apply if
              you try to exit before the fixed period ends.
            </p>
          </div>

          {/* Tool grid */}
          <div
            className="dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ── */}
            <div
              style={{
                background: "#002a29",
                borderRadius: dc.r.lg,
                padding: 28,
                border: `1px solid ${dc.faded}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.emerald,
                  marginBottom: 18,
                }}
              >
                Loan &amp; ARM terms
              </div>

              {/* ARM type selector */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(238,239,211,0.62)",
                    marginBottom: 4,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  ARM Type
                </div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 8, lineHeight: 1.4 }}>
                  5/6 = fixed 5 yrs, adjusts every 6 months after. 7/6 = fixed 7 yrs. 10/6 = fixed 10 yrs.
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["5_6_ARM", "7_6_ARM", "10_6_ARM"] as ArmType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setArmType(t)}
                      style={{
                        flex: 1,
                        padding: "9px 4px",
                        borderRadius: dc.r.sm,
                        border: `1px solid ${armType === t ? dc.lemon : dc.faded}`,
                        background: armType === t ? risk.cautionBg : "transparent",
                        color: armType === t ? dc.lemon : "rgba(238,239,211,0.62)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {t.replace("_ARM", "").replace("_", "/")}
                    </button>
                  ))}
                </div>
              </div>

              {/* ARM structure readout */}
              {result && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: "14px 16px",
                    background: "rgba(238,239,211,0.05)",
                    borderRadius: dc.r.sm,
                    border: `1px solid ${dc.faded}`,
                  }}
                >
                  {[
                    ["Initial rate",    `${result.cfg.initialRate.toFixed(3)}%`],
                    ["Margin",          `${result.cfg.marginPct.toFixed(2)}%`],
                    ["First-reset cap", `+${result.cfg.initialCapPct.toFixed(1)}%`],
                    ["Periodic cap",    `+${result.cfg.periodicCapPct.toFixed(1)}% / reset`],
                    ["Lifetime cap",    `+${result.cfg.lifetimeCapPct.toFixed(1)}%`],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: `1px solid ${dc.faded}`,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "rgba(238,239,211,0.62)", fontWeight: 500 }}>{label}</span>
                      <Mono style={{ color: dc.cream, fontWeight: 700, fontSize: 12 }}>{val}</Mono>
                    </div>
                  ))}
                </div>
              )}

              {/* Deal inputs */}
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(238,239,211,0.62)",
                  marginBottom: 10,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Deal inputs
              </div>

              {[
                { label: "Loan Amount", hint: "The total amount borrowed — not the purchase price.", value: loanAmount, set: setLoanAmount, step: 5000, prefix: "$" },
                { label: "Monthly Rent", hint: "Gross rent the property generates each month. Used to compute DSCR at each reset.", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
                { label: "Taxes + Insurance + HOA /mo", hint: "Monthly taxes, insurance, and HOA combined. Together with P&I this is your PITIA (the total monthly cost of the loan including principal, interest, taxes, insurance, and association fees).", value: pitiaNonDebt, set: setPitiaNonDebt, step: 25, prefix: "$" },
              ].map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "rgba(238,239,211,0.62)",
                      marginBottom: 5,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {f.label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: dc.teal,
                      borderRadius: dc.r.sm,
                      padding: "0 13px",
                      border: `1px solid ${dc.faded}`,
                    }}
                  >
                    <span style={{ color: "rgba(238,239,211,0.62)" }}>{f.prefix}</span>
                    <input
                      className="arm-in"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => f.set(+e.target.value)}
                      style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                    />
                  </div>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.4 }}>
                    {f.hint}
                  </span>
                </label>
              ))}
            </div>

            {/* ── RESULTS ── */}
            {result ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Payment comparison tiles */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1px",
                    background: dc.faded,
                    borderRadius: dc.r.lg,
                    overflow: "hidden",
                    border: `1px solid ${dc.faded}`,
                  }}
                >
                  <div style={{ background: "#002a29", padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: dc.emerald, marginBottom: 10 }}>Fixed payment</div>
                    <Mono style={{ display: "block", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: dc.cream, letterSpacing: "-0.02em" }}>
                      {fmt$(result.piInitial)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                      at {result.cfg.initialRate.toFixed(3)}% — locked for {result.fixedYears} yrs
                    </div>
                  </div>
                  <div style={{ background: "#002a29", padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: dc.lemon, marginBottom: 10 }}>First reset (worst case)</div>
                    <Mono style={{ display: "block", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: dc.lemon, letterSpacing: "-0.02em" }}>
                      {fmt$(result.piAtWorstFirstReset)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                      at {result.worstFirstResetRate.toFixed(3)}% — initial cap applied
                    </div>
                  </div>
                  <div style={{ background: "#002a29", padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: risk.danger, marginBottom: 10 }}>Lifetime cap (absolute max)</div>
                    <Mono style={{ display: "block", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: risk.dangerOnDark, letterSpacing: "-0.02em" }}>
                      {fmt$(result.piAtLifetimeCap)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                      at {result.lifetimeCapRate.toFixed(3)}% — rate can never exceed this
                    </div>
                  </div>
                </div>

                {/* 5-scenario table — with RiskFlame per row */}
                <div
                  style={{
                    background: "#002a29",
                    borderRadius: dc.r.lg,
                    padding: 26,
                    border: `1px solid ${dc.faded}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                    5 rate scenarios — does the deal survive?
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginBottom: 16, letterSpacing: "-0.01em" }}>
                    SOFR is the index your rate floats with after the fixed period. Each row shows a different SOFR future — from falling rates (Bullish) to a spike (Crisis). "Deal breaks" means DSCR (rent ÷ full payment including taxes + insurance) drops below 1.0 — the property can no longer cover its own costs. Caps are enforced exactly as in your loan note.
                  </div>
                  {result.scenarios.map((s) => {
                    const breaks = s.dscrAtFirst < 1.0 || s.dscrAtLast < 1.0;
                    // Use the worst DSCR between first reset and stabilized for the flame
                    const worstDscr = Math.min(s.dscrAtFirst, s.dscrAtLast);
                    const riskLevel = riskFromDscr(worstDscr);
                    return (
                      <div
                        key={s.label}
                        style={{
                          padding: "11px 0",
                          borderBottom: `1px solid ${dc.faded}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: dc.cream, letterSpacing: "-0.01em" }}>
                              {s.label}
                            </span>
                            {/* RiskFlame: rate-rise danger indicator for ARM scenarios */}
                            <RiskFlame level={riskLevel} size={18} />
                          </div>
                          <Mono style={{ fontSize: 12, fontWeight: 700, color: s.color }}>
                            SOFR {s.sofr.toFixed(2)}%
                          </Mono>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 10,
                            fontSize: 12,
                            color: "rgba(238,239,211,0.62)",
                          }}
                        >
                          <div>
                            First reset&nbsp;
                            <Mono style={{ color: dc.cream, fontWeight: 700 }}>
                              {s.firstReset ? `${s.firstReset.rate.toFixed(3)}%` : "—"}
                            </Mono>
                          </div>
                          <div>
                            P&I /mo&nbsp;
                            <Mono style={{ color: dc.cream, fontWeight: 700 }}>
                              {s.piAtFirst > 0 ? fmt$(s.piAtFirst) : "—"}
                            </Mono>
                          </div>
                          <div>
                            DSCR @ reset&nbsp;
                            <Mono style={{ color: s.dscrAtFirst < 1.0 ? risk.danger : dc.cream, fontWeight: 700 }}>
                              {s.dscrAtFirst.toFixed(2)}x
                            </Mono>
                          </div>
                          <div>
                            DSCR @ stable&nbsp;
                            <Mono style={{ color: s.dscrAtLast < 1.0 ? risk.danger : dc.cream, fontWeight: 700 }}>
                              {s.dscrAtLast.toFixed(2)}x
                            </Mono>
                          </div>
                        </div>
                        {breaks && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              color: risk.danger,
                            }}
                          >
                            Deal breaks at this SOFR — DSCR drops below 1.0
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bearish reset schedule */}
                <div
                  style={{
                    background: "#002a29",
                    borderRadius: dc.r.lg,
                    padding: 26,
                    border: `1px solid ${dc.faded}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                    Reset schedule
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginBottom: 16, letterSpacing: "-0.01em" }}>
                    Shows the Bearish scenario (SOFR +4.59%). Each reset the rate moves by at most the periodic cap — it cannot jump all at once. "Cap binding" tells you which cap is holding the rate back.
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                      <thead>
                        <tr>
                          {["Period", "Rate", "P&I /mo", "Cap binding"].map((h, i) => (
                            <th
                              key={h}
                              style={{
                                padding: "8px 10px",
                                fontSize: 11,
                                color: "rgba(238,239,211,0.62)",
                                textAlign: i >= 1 && i <= 2 ? "right" : "left",
                                fontWeight: 700,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                borderBottom: `1px solid ${dc.faded}`,
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, fontWeight: 600, borderBottom: `1px solid ${dc.faded}` }}>Fixed period</td>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.emerald, fontWeight: 700, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                            <Mono>{result.cfg.initialRate.toFixed(3)}%</Mono>
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                            <Mono>{fmt$(result.piInitial)}</Mono>
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 12, color: "rgba(238,239,211,0.62)", borderBottom: `1px solid ${dc.faded}` }}>
                            Years 1–{result.fixedYears}
                          </td>
                        </tr>
                        {result.bearish.ladder.trajectory.map((t) => {
                          const piRow = calculatePI(result.balAtReset, t.rate, result.remTerm);
                          const isLifetimeCap = t.capBinding === "LIFETIME_CAP";
                          const rateColor = isLifetimeCap ? risk.danger : dc.cream;
                          return (
                            <tr key={t.resetNumber}>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, fontWeight: 600, borderBottom: `1px solid ${dc.faded}` }}>Reset {t.resetNumber}</td>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: rateColor, fontWeight: 700, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{t.rate.toFixed(3)}%</Mono>
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{fmt$(piRow)}</Mono>
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 12, color: isLifetimeCap ? risk.danger : t.capBinding === "INITIAL_CAP" ? risk.warning : "rgba(238,239,211,0.62)", borderBottom: `1px solid ${dc.faded}` }}>
                                {t.capBinding.replace("_", " ")} · Yr {t.year}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Engine footnote */}
                <div
                  style={{
                    padding: "16px 20px",
                    background: "rgba(238,239,211,0.05)",
                    borderRadius: dc.r.sm,
                    border: `1px solid ${dc.faded}`,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(238,239,211,0.62)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: dc.emerald, fontWeight: 700 }}>Engine:</strong>{" "}
                  Fully-indexed rate = current SOFR + margin, bounded by the initial cap at first reset,
                  periodic cap each subsequent reset, and lifetime cap = start rate + life cap.
                  P&amp;I re-amortizes over the remaining term at each reset.
                  CRISIS scenario hits the lifetime cap after {result.cfg.lifetimeCapPct / result.cfg.periodicCapPct + 1} consecutive upward resets.
                  Preliminary estimate — not a commitment to lend. Submit a scenario review for exact underwriting.
                </div>

                {/* Terminal CTA */}
                <div
                  style={{
                    background: dc.dark,
                    borderRadius: dc.r.lg,
                    padding: "clamp(24px,3vw,36px)",
                    border: `1px solid ${dc.faded}`,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap" as const,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                      Ready to lock a rate before the clock runs out?
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.6)", margin: 0, maxWidth: "46ch", lineHeight: 1.5 }}>
                      Greenstreet can refinance you into a fixed DSCR loan before your ARM resets — no income docs, qualify on rent alone.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    {/* Dominant lemon CTA */}
                    <button
                      onClick={() => onNavigate?.("rate-quiz")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: dc.lemon,
                        color: dc.dark,
                        fontWeight: 700,
                        fontSize: 14,
                        border: "none",
                        cursor: "pointer",
                        padding: "12px 22px",
                        borderRadius: dc.r.md,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      Get a refi rate →
                    </button>
                    {/* Secondary */}
                    <button
                      onClick={() => onNavigate?.("dscr-calculator")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "transparent",
                        color: dc.cream,
                        fontWeight: 600,
                        fontSize: 14,
                        border: `1.5px solid ${dc.faded}`,
                        cursor: "pointer",
                        padding: "12px 20px",
                        borderRadius: dc.r.md,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      Run the DSCR Calc
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#002a29",
                  borderRadius: dc.r.lg,
                  padding: 40,
                  textAlign: "center",
                  border: `1px solid ${dc.faded}`,
                }}
              >
                <p style={{ color: risk.danger, margin: 0 }}>Engine returned no result — adjust inputs.</p>
              </div>
            )}

            {/* Refi Proceeds Gap — Can you refinance at maturity? */}
            {result && (
              <div style={{ marginTop: 40, background: "#002a29", borderRadius: dc.r.lg, padding: "clamp(24px,3vw,36px)", border: `1px solid ${dc.faded}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 8 }}>
                  Maturity Risk Analysis
                </div>
                <h3 style={{ fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 12px", color: dc.cream }}>
                  Can you refinance at ARM reset?
                </h3>
                <p style={{ fontSize: 14, color: "rgba(238,239,211,0.65)", margin: "0 0 20px", lineHeight: 1.55, maxWidth: "68ch" }}>
                  At reset, the new loan amount is capped by BOTH LTV AND DSCR. If the max new loan can't retire your existing balance, you'll need to bring cash to close (the "proceeds gap"). This calculator shows if you can refi at maturity.
                </p>
                {(() => {
                  // Estimate property value assuming 75% LTV at origination
                  const estimatedValue = loanAmount / 0.75;
                  const refiGap = computeRefiProceedsGap({
                    propertyValue: estimatedValue,
                    currentBalance: result.balAtReset,
                    qualifyingRent: monthlyRent,
                    escrowsMonthly: pitiaNonDebt,
                    newRate: result.worstFirstResetRate,
                    maxLtvPct: 75,
                    minDscr: 1.0,
                    termYears: 30,
                  });
                  const gapColor = refiGap.canRetireBalance ? dc.emerald : risk.danger;
                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: dc.r.md, padding: "16px 18px", border: `1px solid ${dc.faded}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 6 }}>
                            Max new loan (LTV)
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream }}>
                            {fmt$(refiGap.maxLoanByLtv)}
                          </Mono>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: dc.r.md, padding: "16px 18px", border: `1px solid ${dc.faded}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 6 }}>
                            Max new loan (DSCR)
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream }}>
                            {fmt$(refiGap.maxLoanByDscr)}
                          </Mono>
                        </div>
                        <div style={{ background: refiGap.canRetireBalance ? "rgba(77,189,151,0.1)" : risk.dangerBg, borderRadius: dc.r.md, padding: "16px 18px", border: `2px solid ${gapColor}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: gapColor, marginBottom: 6 }}>
                            {refiGap.bindingConstraint} binds
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: gapColor }}>
                            {fmt$(refiGap.maxNewLoan)}
                          </Mono>
                        </div>
                        <div style={{ background: refiGap.canRetireBalance ? "rgba(77,189,151,0.1)" : risk.dangerBg, borderRadius: dc.r.md, padding: "16px 18px", border: `2px solid ${gapColor}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: gapColor, marginBottom: 6 }}>
                            {refiGap.canRetireBalance ? "Cash out available" : "Proceeds gap"}
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: gapColor }}>
                            {refiGap.canRetireBalance ? `+${fmt$(refiGap.cashOutAvailable)}` : fmt$(refiGap.proceedsGap)}
                          </Mono>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5 }}>
                        <strong style={{ color: "rgba(238,239,211,0.85)" }}>Verdict:</strong> {
                          refiGap.canRetireBalance
                            ? `You CAN refinance at maturity — max new loan (${fmt$(refiGap.maxNewLoan)}) exceeds your remaining balance (${fmt$(result.balAtReset)}). ${refiGap.cashOutAvailable > 0 ? `Cash-out available: ${fmt$(refiGap.cashOutAvailable)}.` : ''}`
                            : `You CANNOT refinance at maturity without bringing ${fmt$(refiGap.proceedsGap)} cash to close. The ${refiGap.bindingConstraint} constraint caps your new loan at ${fmt$(refiGap.maxNewLoan)}, but you owe ${fmt$(result.balAtReset)}. Plan to pay down principal or increase rent before reset.`
                        }
                      </p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* 5-Scenario SOFR Stress Analysis */}
            {result && (() => {
              const multiScenario = computeMultiScenarioARMReset(
                result.cfg,
                result.balAtReset,
                result.remTerm,
                monthlyRent,
                pitiaNonDebt,
                CURRENT_MARKET_SNAPSHOT,
              );
              return (
                <div style={{ marginTop: 40, background: "#002a29", borderRadius: dc.r.lg, padding: "clamp(24px,3vw,36px)", border: `1px solid ${dc.faded}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 8 }}>
                    5-Scenario SOFR Stress Analysis
                  </div>
                  <h3 style={{ fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 12px", color: dc.cream }}>
                    How does your ARM perform across rate environments?
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(238,239,211,0.65)", margin: "0 0 20px", lineHeight: 1.55, maxWidth: "68ch" }}>
                    Each row shows DSCR at first reset and last reset under a sustained SOFR environment. First reset = when the fixed period ends. Last reset = stabilized rate after {result.cfg.periodicCapPct > 0 ? "all periodic caps" : "caps"} are applied.
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                      <thead>
                        <tr>
                          {["Scenario", "SOFR", "First Reset Rate", "First Reset DSCR", "Last Reset Rate", "Last Reset DSCR"].map((h, i) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px 12px",
                                fontSize: 11,
                                color: "rgba(238,239,211,0.62)",
                                textAlign: i >= 2 ? "right" : "left",
                                fontWeight: 700,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                borderBottom: `1px solid ${dc.faded}`,
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {multiScenario.scenarios.map((sc) => {
                          const firstReset = sc.trajectory[0];
                          const lastReset = sc.trajectory[sc.trajectory.length - 1];
                          const piAtFirst = firstReset ? calculatePI(result.balAtReset, firstReset.rate, result.remTerm) : 0;
                          const dscrAtFirst = piAtFirst > 0 ? monthlyRent / (piAtFirst + pitiaNonDebt) : 0;
                          const piAtLast = lastReset ? calculatePI(result.balAtReset, lastReset.rate, result.remTerm) : 0;
                          const dscrAtLast = piAtLast > 0 ? monthlyRent / (piAtLast + pitiaNonDebt) : 0;
                          const scenarioColors: Record<string, string> = {
                            BULLISH: dc.emerald,
                            BASE: dc.lemon,
                            BEARISH: "#ff8c42",
                            STRESS: risk.danger,
                            CRISIS: "#c0392b",
                          };
                          const color = scenarioColors[sc.scenarioName] || dc.cream;
                          return (
                            <tr key={sc.scenarioName}>
                              <td style={{ padding: "11px 12px", fontSize: 14, color: dc.cream, fontWeight: 700, borderBottom: `1px solid ${dc.faded}` }}>
                                {sc.scenarioName.charAt(0) + sc.scenarioName.slice(1).toLowerCase()}
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: 13, color, fontWeight: 700, borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{sc.indexPct.toFixed(2)}%</Mono>
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: 13, color: dc.cream, fontWeight: 600, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{firstReset ? `${firstReset.rate.toFixed(3)}%` : "—"}</Mono>
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: 13, color: dscrAtFirst < 1.0 ? risk.danger : dc.cream, fontWeight: 700, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{dscrAtFirst.toFixed(2)}x</Mono>
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: 13, color: dc.cream, fontWeight: 600, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{lastReset ? `${lastReset.rate.toFixed(3)}%` : "—"}</Mono>
                              </td>
                              <td style={{ padding: "11px 12px", fontSize: 13, color: dscrAtLast < 1.0 ? risk.danger : dc.cream, fontWeight: 700, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{dscrAtLast.toFixed(2)}x</Mono>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5 }}>
                    <strong style={{ color: "rgba(238,239,211,0.85)" }}>Verdict:</strong> {multiScenario.summary}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={(v) => onNavigate?.(v)} />
    </DcShell>
  );
}
