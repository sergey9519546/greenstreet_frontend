import React, { useState, useMemo, useRef, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { runMonteCarloRatePath, DEFAULT_VASICEK_PARAMS, CURRENT_MARKET_SNAPSHOT } from "../engine/monteCarloRatePath";
import { DEFAULT_ARM_PROGRAMS } from "../engine/armResetEngine";

// ─── colour helpers (use dc tokens, no local constants) ───────
const RED = "#ff6b6b";  // risk tier color (intentional, not from design system)
const YELLOW = "#9a7b00";  // dark-gold on cream (intentional risk indicator)
const YELLOW_DARK = dc.lemon;  // #d8d958 — lemon on dark bg labels

// ─── types ─────────────────────────────────────────────────────────────────
function pColor(p: number, warnAt: number, errorAt: number): string {
  if (p > errorAt) return RED;
  if (p > warnAt) return YELLOW;
  return dc.emerald;
}

export default function MonteCarloPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  // ── state ────────────────────────────────────────────────────────────────
  const [loanAmount, setLoanAmount]     = useState(340000);
  const [monthlyRent, setMonthlyRent]   = useState(3000);
  const [pitiaNonDebt, setPitiaNonDebt] = useState(750);
  const [initialSofr, setInitialSofr]   = useState(CURRENT_MARKET_SNAPSHOT.sofr30Day);
  const [longRunSofr, setLongRunSofr]   = useState(DEFAULT_VASICEK_PARAMS.longRunMeanSOFR);
  const [simulations, setSimulations]   = useState(500);
  const [horizonYears, setHorizonYears] = useState(10);
  const [seed, setSeed]                 = useState(42);

  // ── engine ───────────────────────────────────────────────────────────────
  const result = useMemo(() => {
    try {
      const armTerms = DEFAULT_ARM_PROGRAMS["5_6_ARM"];
      return runMonteCarloRatePath(
        armTerms,
        loanAmount,
        360,
        monthlyRent,
        pitiaNonDebt,
        Math.max(100, Math.min(2000, simulations)),
        Math.max(12, Math.min(360, horizonYears * 12)),
        seed,
        { ...DEFAULT_VASICEK_PARAMS, longRunMeanSOFR: longRunSofr, initialSOFR: initialSofr },
        CURRENT_MARKET_SNAPSHOT,
      );
    } catch {
      return null;
    }
  }, [loanAmount, monthlyRent, pitiaNonDebt, initialSofr, longRunSofr, simulations, horizonYears, seed]);

  // ── derived display values ─────────────────────────────────────────────
  // Engine returns fractions (0-1); multiply ×100 for percentage display
  const pD1   = result ? result.probabilityDSCRBelow1_0  * 100 : 0;
  const pD125 = result ? result.probabilityDSCRBelow1_25 * 100 : 0;
  const pD1Str   = pD1.toFixed(1)   + "%";
  const pD125Str = pD125.toFixed(1) + "%";
  const pD1Color   = pColor(pD1,   5, 20);
  const pD125Color = pColor(pD125, 30, 60);

  const dscrP10    = result?.dscrStats.p10    ?? 0;
  const dscrMedian = result?.dscrStats.median ?? 0;
  const dscrP90    = result?.dscrStats.p90    ?? 0;
  const dscrMin    = result?.dscrStats.min    ?? 0;
  const dscrMax    = result?.dscrStats.max    ?? 0;

  const sofrY1  = result ? result.sofrAtHorizon.year1.mean.toFixed(2)  + "%" : "—";
  const sofrY5  = result ? result.sofrAtHorizon.year5.mean.toFixed(2)  + "%" : "—";
  const sofrY10 = result ? result.sofrAtHorizon.year10.mean.toFixed(2) + "%" : "—";

  // ── mc-path stroke-draw animation (mockup signature) ─────────────────────
  useEffect(() => {
    let raf = 0;
    const animate = () => {
      const paths = document.querySelectorAll<SVGPathElement>(".mc-path");
      if (!paths.length) { raf = requestAnimationFrame(animate); return; }
      const reduce =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      paths.forEach((p, i) => {
        const len = p.getTotalLength ? p.getTotalLength() : 420;
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        p.style.transition = `stroke-dashoffset ${1.4 + i * 0.12}s ease-out ${0.5 + i * 0.12}s`;
        // force reflow then trigger
        void p.getBoundingClientRect();
        p.style.strokeDashoffset = "0";
      });
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── scroll helper ────────────────────────────────────────────────────────
  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#mc-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  // ── nav ──────────────────────────────────────────────────────────────────
  const navLinks = [
    { label: "DSCR Calc",     view: "dscr-calculator" },
    { label: "Stress Matrix", view: "stress-matrix" },
  ];
  const cta = {
    label: "Run simulation →",
    href: "#mc-tool",
    onClick: scrollToTool,
  };

  return (
    <DcShell onNavigate={onNavigate} accent="#004041" navLinks={navLinks} cta={cta}>
      <style>{`
        @media (max-width: 991px){.mc-3step{grid-template-columns:1fr !important;}}
        .mc-path{fill:none;stroke-linecap:round;}
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          background: dc.teal,
          color: dc.cream,
          overflow: "hidden",
          minHeight: "clamp(480px,60vh,760px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="gs-dot-grid" />

        <div className="dc-hero" style={{
          position: "relative", width: "100%", maxWidth: dc.maxW,
          margin: "0 auto", padding: `clamp(48px,7vh,88px) ${dc.pad}`,
          display: "grid", gridTemplateColumns: "1.1fr 0.9fr",
          gap: "clamp(32px,5vw,72px)", alignItems: "center",
        }}>
          {/* left col — GSAP target */}
          <div id="gs-hero-content">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase", color: dc.dark,
              background: dc.lemon, padding: "7px 14px", borderRadius: 100,
              marginBottom: 24,
            }}>
              Monte Carlo &middot; Vasicek SOFR &middot; {simulations} paths
            </div>
            <H1 style={{ margin: "0 0 20px" }}>
              Stress-test the deal over {simulations} futures.
            </H1>
            <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "46ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
              A Monte Carlo simulation (runs thousands of what-if scenarios to show the range of likely outcomes) models your DSCR (whether the property's rent can cover the loan payment; 1.00 = rent exactly covers it; higher is stronger) across hundreds of possible interest-rate futures. Enter your loan details to see the probability your deal survives.
            </div>
            <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "46ch", margin: "0 0 36px" }}>
              Every green line is a future where DSCR stays above 1.0 and the property covers its costs. Every red line is where it breaks. The badge shows the probability of a deal-break.
            </Lead>
            <Btn label="Run the simulation" href="#mc-tool" onClick={scrollToTool} />
          </div>

          {/* right col — animated preview card */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: dc.dark, borderRadius: dc.r.lg, padding: 22,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "rgba(238,239,211,0.5)",
                marginBottom: 12,
              }}>
                SOFR rate paths · {simulations} sims · {horizonYears}yr
              </div>
              <svg viewBox="0 0 420 200" style={{ width: "100%", display: "block" }} preserveAspectRatio="none">
                <line x1="0" y1="170" x2="420" y2="170" stroke="rgba(238,239,211,0.08)" />
                <line x1="0" y1="105" x2="420" y2="105" stroke="rgba(238,239,211,0.08)" />
                <path className="mc-path" d="M0,120 C120,108 240,96 420,88"  stroke="rgba(77,189,151,0.9)"  strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path className="mc-path" d="M0,120 C100,90 220,72 420,66"   stroke="rgba(77,189,151,0.5)"  strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path className="mc-path" d="M0,120 C110,100 240,88 420,82"  stroke="rgba(77,189,151,0.4)"  strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path className="mc-path" d="M0,120 C80,72 180,52 280,48 C340,44 390,50 420,52" stroke="rgba(216,217,88,0.65)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path className="mc-path" d="M0,120 C70,145 160,158 280,162 C350,165 400,162 420,160" stroke="rgba(255,107,107,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="0" cy="120" r="5" fill={dc.emerald} />
                <text x="8" y="116" fill={dc.emerald} fontSize="10" fontFamily={dc.mono}>
                  r0={initialSofr.toFixed(2)}%
                </text>
              </svg>
            </div>

            {/* P(DSCR<1.0) badge */}
            <div style={{
              position: "absolute", bottom: -14, right: -12,
              background: dc.lemon, borderRadius: 10,
              padding: "14px 18px", zIndex: 2,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                textTransform: "uppercase", color: "rgba(0,55,56,0.6)", marginBottom: 2,
              }}>
                P(DSCR&lt;1.0)
              </div>
              <div style={{
                fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em",
                color: dc.dark, fontFamily: dc.mono, lineHeight: 1,
              }}>
                {pD1Str}
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* ── 3-STEP BAND ───────────────────────────────────────────────── */}
      <section style={{
        background: dc.cream,
        padding: `clamp(48px,6vw,72px) ${dc.pad}`,
      }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal mc-3step" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1, background: "rgba(0,55,56,0.12)",
            borderRadius: 9, overflow: "hidden",
          }}>
            {/* 01 Seed */}
            <div style={{ background: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.lemon, marginBottom: 14, lineHeight: 1, display: "block" }}>01</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Set your deal</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: dc.faded, margin: 0, letterSpacing: "-0.01em" }}>
                Enter loan amount, monthly rent, and where you think interest rates start and settle long-term. Estimates are fine.
              </p>
            </div>
            {/* 02 Simulate */}
            <div style={{ background: dc.dark, color: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.emerald, marginBottom: 14, lineHeight: 1, display: "block" }}>02</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1, color: dc.cream }}>Run {simulations} rate paths</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, letterSpacing: "-0.01em" }}>
                The engine generates {simulations} possible interest-rate futures using a mean-reverting model (rates tend to drift back toward a long-run average). Your ARM resets at each future rate.
              </p>
            </div>
            {/* 03 Analyze */}
            <div style={{ background: dc.lemon, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: "rgba(0,55,56,0.5)", marginBottom: 14, lineHeight: 1, display: "block" }}>03</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Read the risk</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.65)", margin: 0, letterSpacing: "-0.01em" }}>
                See the % of futures where your DSCR breaks (below 1.0 = property can't cover costs) or falls short of the comfortable 1.25 threshold. Also shows the spread of DSCR outcomes and where rates land at year 1, 5, and 10.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL SECTION ──────────────────────────────────────────────── */}
      <section id="mc-tool" style={{
        background: dc.cream,
        padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)`,
      }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* section heading */}
          <div className="gs-reveal" style={{ marginBottom: 48 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
              textTransform: "uppercase", color: dc.rain, marginBottom: 12,
            }}>
              Live Monte Carlo engine
            </div>
            <h2 style={{
              fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600,
              letterSpacing: "-0.035em", lineHeight: 1.0, margin: 0,
            }}>
              <Mono>{simulations}</Mono> paths · <Mono>{horizonYears}</Mono>yr · seed <Mono>{seed}</Mono>
            </h2>
          </div>

          {/* two-column layout */}
          <div className="gs-reveal dc-split" style={{
            display: "grid", gridTemplateColumns: "320px 1fr",
            gap: 36, alignItems: "start",
          }}>

            {/* ── INPUT PANEL ──────────────────────────────────────────── */}
            <div style={{
              background: "#fff", borderRadius: dc.r.md, padding: 28,
              border: "1px solid rgba(0,55,56,0.1)",
            }}>
              <div style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
                textTransform: "uppercase", color: dc.rain, marginBottom: 20,
              }}>
                Simulation parameters
              </div>

              {(
                [
                  { label: "Loan Amount",               hint: "Total borrowed — not the purchase price.",                                                               value: loanAmount,   set: setLoanAmount,   step: 5000,  prefix: "$", suffix: ""   },
                  { label: "Monthly Rent",               hint: "Gross rent the property generates. Used to compute DSCR at each simulated reset.",                       value: monthlyRent,  set: setMonthlyRent,  step: 100,   prefix: "$", suffix: ""   },
                  { label: "Taxes + Insurance + HOA /mo", hint: "These costs plus P&I make up PITIA — the full monthly payment. Estimate is fine.",                     value: pitiaNonDebt, set: setPitiaNonDebt, step: 50,    prefix: "$", suffix: ""   },
                  { label: "Initial SOFR %",             hint: "Today's short-term rate index. Your ARM rate floats with this after the fixed period ends.",             value: initialSofr,  set: setInitialSofr,  step: 0.05,  prefix: "",  suffix: "%"  },
                  { label: "Long-run SOFR (theta) %",    hint: "Where you think rates settle over time. All simulated paths drift back toward this level.",              value: longRunSofr,  set: setLongRunSofr,  step: 0.05,  prefix: "",  suffix: "%"  },
                  { label: "Number of simulations",      hint: "More paths = more precise probability. 500 is a solid default; max 2,000.",                             value: simulations,  set: setSimulations,  step: 100,   prefix: "",  suffix: ""   },
                  { label: "Horizon (years)",            hint: "How far out to model — match your planned hold period.",                                                 value: horizonYears, set: setHorizonYears, step: 1,     prefix: "",  suffix: ""   },
                  { label: "Random seed",                hint: "Controls which specific paths are drawn. Change to see a different sample; results should be similar.",  value: seed,         set: setSeed,         step: 1,     prefix: "",  suffix: ""   },
                ] as Array<{ label: string; hint: string; value: number; set: (v: number) => void; step: number; prefix: string; suffix: string }>
              ).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 16 }}>
                  <span style={{
                    display: "block", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)", marginBottom: 4,
                  }}>
                    {f.label}
                  </span>
                  <div style={{
                    display: "flex", alignItems: "center",
                    background: dc.cream, borderRadius: 6, padding: "0 12px",
                  }}>
                    {f.prefix && <span style={{ color: "rgba(0,55,56,0.4)" }}>{f.prefix}</span>}
                    <input
                      className="gs-num"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => f.set(+e.target.value)}
                      style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600, color: dc.dark }}
                    />
                    {f.suffix && <span style={{ color: "rgba(0,55,56,0.4)", fontSize: 14, paddingLeft: 2 }}>{f.suffix}</span>}
                  </div>
                  {f.hint && (
                    <span style={{ display: "block", fontSize: 11, color: "rgba(0,55,56,0.45)", marginTop: 4, lineHeight: 1.4, letterSpacing: 0 }}>
                      {f.hint}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* ── OUTPUT PANEL ─────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* probability cards */}
              <div className="dc-band-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* P(DSCR < 1.0) */}
                <div style={{
                  background: dc.dark, borderRadius: 12,
                  padding: "clamp(24px,3vw,36px)", textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: YELLOW_DARK, marginBottom: 12,
                  }}>
                    P(DSCR &lt; 1.0)
                  </div>
                  <Mono style={{
                    fontSize: "clamp(48px,6vw,80px)", fontWeight: 600,
                    letterSpacing: "-0.04em", color: pD1Color, lineHeight: 0.95, display: "block",
                  }}>
                    {pD1Str}
                  </Mono>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.5)", marginTop: 10 }}>
                    chance the property can't cover its own costs — below 5% is acceptable, above 20% is high-risk
                  </div>
                </div>

                {/* P(DSCR < 1.25) */}
                <div style={{
                  background: dc.cream, border: "2px solid rgba(0,55,56,0.12)",
                  borderRadius: 12, padding: "clamp(24px,3vw,36px)", textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: dc.rain, marginBottom: 12,
                  }}>
                    P(DSCR &lt; 1.25)
                  </div>
                  <Mono style={{
                    fontSize: "clamp(48px,6vw,80px)", fontWeight: 600,
                    letterSpacing: "-0.04em", color: pD125Color, lineHeight: 0.95, display: "block",
                  }}>
                    {pD125Str}
                  </Mono>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.5)", marginTop: 10 }}>
                    chance of falling below the 1.25 comfort threshold most lenders prefer — below 30% is good
                  </div>
                </div>
              </div>

              {/* DSCR distribution table */}
              <div style={{
                background: "#fff", borderRadius: 9, padding: 24,
                border: "1px solid rgba(0,55,56,0.1)",
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
                  textTransform: "uppercase", color: dc.rain, marginBottom: 4,
                }}>
                  DSCR distribution at end of horizon
                </div>
                <div style={{ fontSize: 12, color: "rgba(0,55,56,0.5)", marginBottom: 14, lineHeight: 1.5 }}>
                  P10 = worst 10% of outcomes. Median = the middle outcome. P90 = best 10%. A healthy deal has a median above 1.25 and a P10 above 1.0.
                </div>
                {result ? (
                  [
                    { label: "P10 (worst 10%)",  val: dscrP10.toFixed(2)    + "x", color: dscrP10 < 1.0 ? RED : YELLOW },
                    { label: "Median",            val: dscrMedian.toFixed(2) + "x", color: dc.dark },
                    { label: "P90 (best 10%)",    val: dscrP90.toFixed(2)    + "x", color: dc.emerald },
                    { label: "Min",               val: dscrMin.toFixed(2)    + "x", color: RED },
                    { label: "Max",               val: dscrMax.toFixed(2)    + "x", color: dc.emerald },
                  ].map((r) => (
                    <div key={r.label} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "8px 0", borderBottom: "1px solid rgba(0,55,56,0.07)",
                      fontSize: 14,
                    }}>
                      <span style={{ color: "rgba(0,55,56,0.65)", fontWeight: 500 }}>{r.label}</span>
                      <Mono style={{ color: r.color, fontWeight: 700 }}>{r.val}</Mono>
                    </div>
                  ))
                ) : (
                  <div style={{ color: RED, fontSize: 14 }}>Engine returned no result.</div>
                )}
              </div>

              {/* SOFR at horizons */}
              <div style={{
                background: dc.dark, borderRadius: 9, padding: 22,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.5)", marginBottom: 12 }}>
                  Average simulated SOFR — where rates land across all paths
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { label: "Year 1 avg",  val: sofrY1  },
                  { label: "Year 5 avg",  val: sofrY5  },
                  { label: "Year 10 avg", val: sofrY10 },
                ].map((col) => (
                  <div key={col.label} style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: 11, color: "rgba(238,239,211,0.5)",
                      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
                    }}>
                      {col.label}
                    </div>
                    <Mono style={{
                      fontSize: "clamp(18px,2vw,24px)", fontWeight: 600,
                      color: dc.emerald, letterSpacing: "-0.02em", display: "block",
                    }}>
                      {col.val}
                    </Mono>
                  </div>
                ))}
                </div>
              </div>

              {/* engine parameters footnote */}
              {result && (
                <div style={{
                  padding: "14px 18px",
                  background: "rgba(0,101,101,0.08)",
                  borderRadius: 9,
                  border: "1px solid rgba(0,101,101,0.22)",
                  fontSize: 12, color: "rgba(0,55,56,0.6)", lineHeight: 1.6,
                }}>
                  <strong style={{ color: dc.rain }}>How this works:</strong>{" "}
                  Vasicek mean-reverting model — rates wander but drift back toward the long-run mean (theta). {result.simulations} paths × {result.horizonMonths} months.
                  Long-run mean θ={result.modelParameters.longRunMeanSOFR}%,
                  reversion speed κ={result.modelParameters.meanReversionSpeed},
                  volatility σ={result.modelParameters.volatility}%,
                  starting rate r₀={result.modelParameters.initialSOFR}%.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </DcShell>
  );
}
