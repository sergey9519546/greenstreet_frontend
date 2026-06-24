import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, HeroProof } from "../design/dc";
import {
  simulateARMResetLadder,
  DEFAULT_ARM_PROGRAMS,
  computeRemainingBalanceAtReset,
  CURRENT_MARKET_SNAPSHOT,
} from "../engine/armResetEngine";
import { calculatePI } from "../engine/engine";
import type { ARMTerms } from "../engine/types";

// ── helpers ──────────────────────────────────────────────────────────────────

type ArmType = "5_6_ARM" | "7_6_ARM" | "10_6_ARM";

const SOFR_SCENARIOS: { label: string; sofr: number; color: string }[] = [
  { label: "Bullish",  sofr: 2.59, color: dc.emerald },
  { label: "Base",     sofr: 3.59, color: dc.lemon },
  { label: "Bearish",  sofr: 4.59, color: "#ff8c42" },
  { label: "Stress",   sofr: 5.00, color: "#ff6b6b" },
  { label: "Crisis",   sofr: 7.00, color: "#c0392b" },
];

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function shockColor(pct: number): string {
  if (pct > 20) return "#ff6b6b";
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
    document.title = "ARM Reset Risk | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Inputs
  const [armType, setArmType] = useState<ArmType>("5_6_ARM");
  const [loanAmount, setLoanAmount]     = useState(340000);
  const [monthlyRent, setMonthlyRent]   = useState(3000);
  const [pitiaNonDebt, setPitiaNonDebt] = useState(750);    // taxes + ins + HOA /mo

  // Derived from engine
  const result = useMemo(() => {
    try {
      const cfg: ARMTerms = DEFAULT_ARM_PROGRAMS[armType];
      const fixedMonths = cfg.fixedPeriodMonths;
      const firstResetYear = fixedMonths / 12;

      // Initial P&I at origination rate (full 360-month amortization)
      const piInitial = calculatePI(loanAmount, cfg.initialRate, 360);

      // Remaining balance at first reset
      const balAtReset = computeRemainingBalanceAtReset(
        loanAmount,
        cfg.initialRate,
        360,
        fixedMonths,
      );
      const remTerm = 360 - fixedMonths;

      // ── 5-scenario reset ladders (using CURRENT_MARKET_SNAPSHOT SOFR for BASE)
      const scenarios = SOFR_SCENARIOS.map((sc) => {
        const ladder = simulateARMResetLadder(cfg, sc.sofr, 15);
        const firstReset  = ladder.trajectory[0];
        const lastReset   = ladder.trajectory[ladder.trajectory.length - 1];

        // P&I and DSCR at first reset
        const piAtFirst = firstReset
          ? calculatePI(balAtReset, firstReset.rate, remTerm)
          : 0;
        const dscrAtFirst =
          piAtFirst > 0 ? monthlyRent / (piAtFirst + pitiaNonDebt) : 0;

        // P&I and DSCR at stabilized (last ladder) rate
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

      // ── Payment shock: worst-case first reset (initial cap binding)
      const worstFirstResetRate = Math.min(
        cfg.initialRate + cfg.initialCapPct,
        cfg.initialRate + cfg.lifetimeCapPct,
      );
      const piAtWorstFirstReset = calculatePI(balAtReset, worstFirstResetRate, remTerm);
      const paymentShockPct =
        piInitial > 0
          ? ((piAtWorstFirstReset - piInitial) / piInitial) * 100
          : 0;

      // ── Bearish ladder for the reset schedule table
      const bearish = scenarios.find((s) => s.label === "Bearish")!;

      // ── Lifetime cap payment
      const lifetimeCapRate = cfg.initialRate + cfg.lifetimeCapPct;
      const piAtLifetimeCap = calculatePI(balAtReset, lifetimeCapRate, remTerm);

      // ── Fixed-period timeline label
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

  // HeroProof live value: payment shock at worst-case first reset
  const heroShockPct = result ? result.paymentShockPct : 0;
  const heroChipColor = shockColor(heroShockPct);
  const heroChipLabel =
    heroShockPct > 20 ? "HIGH SHOCK" : heroShockPct > 8 ? "MODERATE" : "LOW SHOCK";

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",  view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer" },
      ]}
      cta={{ label: "Model the reset →", onClick: scrollToTool }}
    >
      {/* hide number spinners */}
      <style>{`
        .arm-in::-webkit-outer-spin-button,.arm-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .arm-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
          minHeight: "clamp(480px,60vh,760px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="gs-dot-grid" />
        <div
          className="dc-hero"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: dc.maxW,
            margin: "0 auto",
            padding: `clamp(48px,7vh,88px) ${dc.pad}`,
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "clamp(32px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div id="gs-hero-content">
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.lemon,
                marginBottom: 22,
              }}
            >
              5/6 · 7/6 · 10/6 ARM &nbsp;·&nbsp; SOFR + margin &nbsp;·&nbsp; caps enforced
            </div>
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: "0 0 28px",
              }}
            >
              What happens when
              <br />
              the fixed period
              <br />
              ends?
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(238,239,211,0.7)",
                maxWidth: "48ch",
                margin: "0 0 36px",
              }}
            >
              Model the payment shock at first reset, every subsequent
              adjustment, and the lifetime cap — initial and periodic caps
              applied exactly as written in the note.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
              <a
                href="#arm-tool"
                onClick={scrollToTool}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 30px",
                  borderRadius: 6,
                }}
              >
                Model the reset ↓
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
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 26px",
                  borderRadius: 6,
                  border: "1px solid rgba(238,239,211,0.3)",
                }}
              >
                DSCR Calculator
              </a>
            </div>
          </div>

          {/* HeroProof — wired to worst-case first-reset payment shock */}
          <HeroProof
            eyebrow="First-reset payment shock"
            value={
              result
                ? `+${result.paymentShockPct.toFixed(1)}%`
                : "—"
            }
            sub={
              result
                ? `${fmt$(result.piInitial)}/mo → ${fmt$(result.piAtWorstFirstReset)}/mo at year ${result.firstResetYear}`
                : "Enter inputs below"
            }
            chip={{ label: heroChipLabel, color: heroChipColor }}
          />
        </div>
      </section>

      {/* ── 3-STEP TIMELINE BAND ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="gs-reveal dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "5fr 2fr 3fr",
              gap: "1px",
              background: "rgba(0,55,56,0.12)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {/* Fixed period */}
            <div
              style={{
                background: dc.emerald,
                color: dc.dark,
                padding: "clamp(22px,3vw,34px) clamp(18px,2.5vw,28px)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: 6,
                }}
              >
                {result ? `Years 1–${result.fixedYears}` : "Fixed period"}
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(22px,2.6vw,32px)", fontWeight: 600, lineHeight: 1.1 }}>Fixed</Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.75, marginTop: 4 }}>
                {result ? `${result.cfg.initialRate.toFixed(3)}% locked` : "rate locked"}
              </div>
            </div>
            {/* First reset */}
            <div
              style={{
                background: dc.lemon,
                color: dc.dark,
                padding: "clamp(22px,3vw,34px) clamp(18px,2.5vw,28px)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: 6,
                }}
              >
                First reset
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(22px,2.6vw,32px)", fontWeight: 600, lineHeight: 1.1 }}>
                {result ? `+${result.cfg.initialCapPct.toFixed(1)}%` : "+2.0%"}
              </Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.75, marginTop: 4 }}>cap-limited</div>
            </div>
            {/* Adjusts */}
            <div
              style={{
                background: dc.rain,
                color: dc.cream,
                padding: "clamp(22px,3vw,34px) clamp(18px,2.5vw,28px)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.65,
                  marginBottom: 6,
                }}
              >
                {result ? `Years ${result.fixedYears + 1}–30` : "Years 6–30"}
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(22px,2.6vw,32px)", fontWeight: 600, lineHeight: 1.1, color: dc.cream }}>Adjusts</Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.7, marginTop: 4 }}>
                {result ? `SOFR + ${result.cfg.marginPct.toFixed(2)}%` : "SOFR + margin"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <section
        id="arm-tool"
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 48 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              Live ARM reset engine
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,48px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                margin: 0,
                maxWidth: "28ch",
              }}
            >
              First-reset payment shock:{" "}
              <span style={{ color: result ? shockColor(result.paymentShockPct) : dc.rain }}>
                {result ? `+${result.paymentShockPct.toFixed(1)}%` : "—"}
              </span>
            </h2>
          </div>

          {/* Tool grid */}
          <div
            className="gs-reveal dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS (dark panel) ── */}
            <div
              style={{
                background: dc.dark,
                borderRadius: 8,
                padding: 30,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.lemon,
                  marginBottom: 20,
                }}
              >
                Loan &amp; ARM terms
              </div>

              {/* ARM type selector */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(238,239,211,0.55)",
                    marginBottom: 8,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  ARM Type
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["5_6_ARM", "7_6_ARM", "10_6_ARM"] as ArmType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setArmType(t)}
                      style={{
                        flex: 1,
                        padding: "9px 4px",
                        borderRadius: 6,
                        border: `1px solid ${armType === t ? dc.lemon : "rgba(238,239,211,0.18)"}`,
                        background: armType === t ? "rgba(216,217,88,0.12)" : "transparent",
                        color: armType === t ? dc.lemon : "rgba(238,239,211,0.55)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
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
                    borderRadius: 6,
                    border: "1px solid rgba(238,239,211,0.1)",
                  }}
                >
                  {[
                    ["Initial rate",     `${result.cfg.initialRate.toFixed(3)}%`],
                    ["Margin",           `${result.cfg.marginPct.toFixed(2)}%`],
                    ["First-reset cap",  `+${result.cfg.initialCapPct.toFixed(1)}%`],
                    ["Periodic cap",     `+${result.cfg.periodicCapPct.toFixed(1)}% / reset`],
                    ["Lifetime cap",     `+${result.cfg.lifetimeCapPct.toFixed(1)}%`],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: "1px solid rgba(238,239,211,0.07)",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "rgba(238,239,211,0.5)", fontWeight: 500 }}>{label}</span>
                      <Mono style={{ color: dc.cream, fontWeight: 600, fontSize: 12 }}>{val}</Mono>
                    </div>
                  ))}
                </div>
              )}

              {/* Deal inputs */}
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(238,239,211,0.55)",
                  marginBottom: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Deal inputs
              </div>

              {[
                { label: "Loan Amount", value: loanAmount, set: setLoanAmount, step: 5000, prefix: "$", suffix: "" },
                { label: "Monthly Rent", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$", suffix: "" },
                { label: "Taxes + Ins + HOA /mo", value: pitiaNonDebt, set: setPitiaNonDebt, step: 25, prefix: "$", suffix: "" },
              ].map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "rgba(238,239,211,0.55)",
                      marginBottom: 5,
                      fontWeight: 600,
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
                      borderRadius: 6,
                      padding: "0 13px",
                    }}
                  >
                    {f.prefix && (
                      <span style={{ color: "rgba(238,239,211,0.4)" }}>{f.prefix}</span>
                    )}
                    <input
                      className="arm-in"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => f.set(+e.target.value)}
                      style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                    />
                    {f.suffix && (
                      <span style={{ color: "rgba(238,239,211,0.4)" }}>{f.suffix}</span>
                    )}
                  </div>
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
                    background: "rgba(0,55,56,0.12)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ background: dc.mintBg, padding: "26px 22px" }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        color: dc.rain,
                        marginBottom: 10,
                      }}
                    >
                      Fixed payment
                    </div>
                    <Mono style={{ display: "block", fontSize: "clamp(24px,3vw,34px)", fontWeight: 600, color: dc.dark }}>
                      {fmt$(result.piInitial)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.55)", marginTop: 4 }}>
                      at {result.cfg.initialRate.toFixed(3)}%
                    </div>
                  </div>
                  <div style={{ background: dc.lemon, padding: "26px 22px" }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        color: "rgba(0,55,56,0.7)",
                        marginBottom: 10,
                      }}
                    >
                      First reset
                    </div>
                    <Mono style={{ display: "block", fontSize: "clamp(24px,3vw,34px)", fontWeight: 600, color: dc.dark }}>
                      {fmt$(result.piAtWorstFirstReset)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.6)", marginTop: 4 }}>
                      at {result.worstFirstResetRate.toFixed(3)}%
                    </div>
                  </div>
                  <div style={{ background: dc.dark, padding: "26px 22px" }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        color: dc.lemon,
                        marginBottom: 10,
                      }}
                    >
                      Lifetime cap
                    </div>
                    <Mono style={{ display: "block", fontSize: "clamp(24px,3vw,34px)", fontWeight: 600, color: dc.cream }}>
                      {fmt$(result.piAtLifetimeCap)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.5)", marginTop: 4 }}>
                      at {result.lifetimeCapRate.toFixed(3)}%
                    </div>
                  </div>
                </div>

                {/* 5-scenario table */}
                <div
                  style={{
                    background: dc.white,
                    borderRadius: 8,
                    padding: "24px 28px",
                    border: "1px solid rgba(0,55,56,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: dc.rain,
                      marginBottom: 6,
                    }}
                  >
                    5 SOFR scenarios
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(0,55,56,0.5)",
                      marginBottom: 16,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Each scenario walks the full reset ladder from origination — per-period caps enforced.
                  </div>
                  {result.scenarios.map((s) => {
                    const breaks = s.dscrAtFirst < 1.0 || s.dscrAtLast < 1.0;
                    return (
                      <div
                        key={s.label}
                        style={{
                          padding: "11px 0",
                          borderBottom: "1px solid rgba(0,55,56,0.07)",
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
                          <span style={{ fontWeight: 700, fontSize: 14, color: dc.dark, letterSpacing: "-0.01em" }}>
                            {s.label}
                          </span>
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
                            color: "rgba(0,55,56,0.55)",
                          }}
                        >
                          <div>
                            First reset&nbsp;
                            <Mono style={{ color: dc.dark, fontWeight: 600 }}>
                              {s.firstReset ? `${s.firstReset.rate.toFixed(3)}%` : "—"}
                            </Mono>
                          </div>
                          <div>
                            P&I /mo&nbsp;
                            <Mono style={{ color: dc.dark, fontWeight: 600 }}>
                              {s.piAtFirst > 0 ? fmt$(s.piAtFirst) : "—"}
                            </Mono>
                          </div>
                          <div>
                            DSCR @ reset&nbsp;
                            <Mono style={{ color: s.dscrAtFirst < 1.0 ? "#ff6b6b" : dc.dark, fontWeight: 600 }}>
                              {s.dscrAtFirst.toFixed(2)}x
                            </Mono>
                          </div>
                          <div>
                            DSCR @ stable&nbsp;
                            <Mono style={{ color: s.dscrAtLast < 1.0 ? "#ff6b6b" : dc.dark, fontWeight: 600 }}>
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
                              color: "#ff6b6b",
                            }}
                          >
                            Deal breaks at this SOFR
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bearish reset schedule */}
                <div
                  style={{
                    background: dc.white,
                    borderRadius: 8,
                    padding: "24px 28px",
                    border: "1px solid rgba(0,55,56,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: dc.rain,
                      marginBottom: 6,
                    }}
                  >
                    Reset schedule — Bearish path (SOFR {SOFR_SCENARIOS[2].sofr.toFixed(2)}%)
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(0,55,56,0.5)",
                      marginBottom: 16,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Each adjustment applies the periodic cap against the prior rate; fully-indexed rate = SOFR + margin.
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 400,
                      }}
                    >
                      <thead>
                        <tr>
                          {["Period", "Rate", "P&I /mo", "Cap binding"].map((h, i) => (
                            <th
                              key={h}
                              style={{
                                padding: "8px 10px",
                                fontSize: 11,
                                color: "rgba(0,55,56,0.45)",
                                textAlign: i >= 1 && i <= 2 ? "right" : "left",
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                borderBottom: "1px solid rgba(0,55,56,0.12)",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Fixed period row */}
                        <tr>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.dark, fontWeight: 600, borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
                            Fixed period
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.emerald, fontWeight: 700, textAlign: "right", borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
                            <Mono>{result.cfg.initialRate.toFixed(3)}%</Mono>
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.dark, textAlign: "right", borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
                            <Mono>{fmt$(result.piInitial)}</Mono>
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 12, color: "rgba(0,55,56,0.45)", borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
                            Years 1–{result.fixedYears}
                          </td>
                        </tr>
                        {result.bearish.ladder.trajectory.map((t) => {
                          const piRow = calculatePI(result.balAtReset, t.rate, result.remTerm);
                          const isLifetimeCap = t.capBinding === "LIFETIME_CAP";
                          const rateColor = isLifetimeCap ? "#ff6b6b" : dc.dark;
                          return (
                            <tr key={t.resetNumber}>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: dc.dark, fontWeight: 600, borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
                                Reset {t.resetNumber}
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: rateColor, fontWeight: 700, textAlign: "right", borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
                                <Mono>{t.rate.toFixed(3)}%</Mono>
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: dc.dark, textAlign: "right", borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
                                <Mono>{fmt$(piRow)}</Mono>
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 12, color: isLifetimeCap ? "#ff6b6b" : t.capBinding === "INITIAL_CAP" ? "#a16207" : "rgba(0,55,56,0.45)", borderBottom: "1px solid rgba(0,55,56,0.06)" }}>
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
                    background: "rgba(0,101,101,0.07)",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(0,55,56,0.65)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: dc.rain, fontWeight: 600 }}>Engine:</strong>{" "}
                  Fully-indexed rate = current SOFR + margin, bounded by the initial cap at first reset,
                  periodic cap each subsequent reset, and lifetime cap = start rate + life cap.
                  P&amp;I re-amortizes over the remaining term at each reset.
                  CRISIS scenario hits the lifetime cap after {result.cfg.lifetimeCapPct / result.cfg.periodicCapPct + 1} consecutive upward resets.
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: dc.white,
                  borderRadius: 8,
                  padding: 40,
                  textAlign: "center",
                  border: "1px solid rgba(0,55,56,0.1)",
                }}
              >
                <p style={{ color: "#ff6b6b", margin: 0 }}>Engine returned no result — adjust inputs.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </DcShell>
  );
}
