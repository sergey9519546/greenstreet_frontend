import React, { useState, useMemo, useRef, useCallback } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn, useRevealOnView } from "../design/dc";
import { runMonteCarloRatePath, DEFAULT_VASICEK_PARAMS, CURRENT_MARKET_SNAPSHOT } from "../engine/monteCarloRatePath";
import { DEFAULT_ARM_PROGRAMS } from "../engine/armResetEngine";
import { DscrGauge, RiskFlame, riskFromDscr, MotionWorkbench } from "../design/artifacts";

// ─── color helpers ────────────────────────────────────────────────────────────
const RED     = "#ff6b6b";
const ORANGE  = "#f97316";
const YELLOW  = dc.lemon;   // warn signal — bright on the dark canvas
const YELLOW_DARK = dc.lemon;
const BLUE    = "#7ec8d3";  // sky-blue — the rates / SOFR / uncertainty color

function pColor(p: number, warnAt: number, errorAt: number): string {
  if (p > errorAt) return RED;
  if (p > warnAt)  return YELLOW;
  return dc.emerald;
}

// ─── slider input helper ──────────────────────────────────────────────────────
interface SliderFieldProps {
  label: string;
  hint: string;
  value: number;
  set: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  fmt?: (v: number) => string;
}
function SliderField({ label, hint, value, set, min, max, step, prefix = "", suffix = "", fmt }: SliderFieldProps) {
  const display = fmt ? fmt(value) : value.toString();
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>
          {label}
        </span>
        <Mono style={{ fontSize: 14, fontWeight: 700, color: dc.lemon }}>
          {prefix}{display}{suffix}
        </Mono>
      </div>
      <input
        className="gs-range"
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(+e.target.value)}
      />
      {hint && (
        <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.4 }}>
          {hint}
        </span>
      )}
    </div>
  );
}

// ─── DSCR distribution bar chart ─────────────────────────────────────────────
// Visual spread from P10 → P90 as a horizontal bar with zones.
function DscrSpreadBar({ p10, median, p90, animate }: { p10: number; median: number; p90: number; animate: boolean }) {
  // Map DSCR 0.5–2.0 to % position in the bar
  const toX = (v: number) => Math.max(0, Math.min(100, ((Math.min(v, 2.0) - 0.5) / 1.5) * 100));
  const x10 = toX(p10);
  const xMed = toX(median);
  const x90 = toX(p90);
  const spread = x90 - x10;
  const medColor = pColor(100 - median * 50, 20, 50); // rough color for median
  const p10Color = p10 < 1.0 ? RED : p10 < 1.25 ? ORANGE : dc.emerald;

  return (
    <div style={{ position: "relative", marginTop: 8, marginBottom: 24 }}>
      {/* track */}
      <div style={{ position: "relative", height: 14, borderRadius: 999, background: "rgba(238,239,211,0.1)", overflow: "hidden" }}>
        {/* spread fill */}
        <div style={{
          position: "absolute", top: 0, left: `${x10}%`, width: animate ? `${spread}%` : "0%",
          height: "100%", borderRadius: 999,
          background: p10 < 1.0
            ? `linear-gradient(90deg, ${RED}88, ${dc.emerald}88)`
            : `linear-gradient(90deg, ${ORANGE}66, ${dc.emerald}88)`,
          transition: "width 0.6s cubic-bezier(0.16,1,0.3,1), left 0.6s cubic-bezier(0.16,1,0.3,1)",
        }} />
        {/* median tick */}
        <div style={{
          position: "absolute", top: 0, left: animate ? `${xMed}%` : "50%",
          width: 3, height: "100%",
          background: dc.cream, borderRadius: 2,
          transition: "left 0.6s cubic-bezier(0.16,1,0.3,1)",
        }} />
        {/* 1.0 threshold tick */}
        <div style={{
          position: "absolute", top: -2, left: `${toX(1.0)}%`,
          width: 2, height: "calc(100% + 4px)",
          background: RED, opacity: 0.6, borderRadius: 1,
        }} />
        {/* 1.25 threshold tick */}
        <div style={{
          position: "absolute", top: -2, left: `${toX(1.25)}%`,
          width: 2, height: "calc(100% + 4px)",
          background: dc.emerald, opacity: 0.5, borderRadius: 1,
        }} />
      </div>
      {/* labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 11, color: p10Color, fontWeight: 700, fontFamily: dc.mono }}>P10 {p10.toFixed(2)}x</span>
        <span style={{ fontSize: 11, color: dc.cream, fontWeight: 700, fontFamily: dc.mono }}>Med {median.toFixed(2)}x</span>
        <span style={{ fontSize: 11, color: dc.emerald, fontWeight: 700, fontFamily: dc.mono }}>P90 {p90.toFixed(2)}x</span>
      </div>
      {/* threshold legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 2, background: RED, display: "inline-block", borderRadius: 1 }} />
          1.0 = break-even
        </span>
        <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 2, background: dc.emerald, display: "inline-block", borderRadius: 1 }} />
          1.25 = lender comfort zone
        </span>
      </div>
    </div>
  );
}

// ─── P-probability card ───────────────────────────────────────────────────────
function ProbCard({
  title, value, color, sub, dark = false, flame,
}: { title: string; value: string; color: string; sub: string; dark?: boolean; flame?: React.ReactNode }) {
  const [ref, shown] = useRevealOnView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        background: dark ? dc.dark : "#fff",
        borderRadius: dc.r.md, padding: "clamp(22px,3vw,36px)",
        border: dark ? "none" : "1px solid rgba(0,55,56,0.1)",
        textAlign: "center",
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
          textTransform: "uppercase", color: dark ? YELLOW_DARK : dc.rain,
        }}>
          {title}
        </div>
        {flame && <div>{flame}</div>}
      </div>
      <Mono style={{
        fontSize: "clamp(48px,6vw,80px)", fontWeight: 600,
        letterSpacing: "-0.04em", color, lineHeight: 0.95, display: "block",
      }}>
        {value}
      </Mono>
      <div style={{ fontSize: 12, fontWeight: 500, color: dark ? "rgba(238,239,211,0.62)" : "rgba(0,55,56,0.5)", marginTop: 10, lineHeight: 1.45 }}>
        {sub}
      </div>
    </div>
  );
}

// ─── collapsible details disclosure ──────────────────────────────────────────
function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: dc.r.sm, border: "1px solid rgba(238,239,211,0.14)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 18px", background: "rgba(238,239,211,0.04)",
          border: "none", cursor: "pointer", fontFamily: dc.sans,
          fontSize: 12, fontWeight: 600, color: BLUE, letterSpacing: "0.04em", textTransform: "uppercase",
        }}
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
          <path d="M4 6l4 4 4-4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "16px 18px 18px", borderTop: "1px solid rgba(238,239,211,0.16)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── SOFR fan chart — the signature Monte Carlo viz ──────────────────────────
// Draws the cone of simulated SOFR rate paths: a P10–P90 band (sky-blue) with
// the mean line, plus the long-run θ the paths drift toward. Built from the
// engine's horizon percentiles (year 1/3/5/10), anchored at today's rate.
type FanPoint = { year: number; mean: number; p10: number; p90: number };
function SofrFanChart({ points, longRun }: { points: FanPoint[]; longRun: number }) {
  const W = 520, H = 240, padL = 38, padR = 16, padT = 14, padB = 28;
  if (points.length < 2) return null;
  const xmax = Math.max(...points.map((p) => p.year)) || 1;
  const lo = Math.min(longRun, ...points.map((p) => p.p10));
  const hi = Math.max(longRun, ...points.map((p) => p.p90));
  const yMin = Math.floor(lo - 0.5);
  const yMax = Math.ceil(hi + 0.5);
  const X = (yr: number) => padL + (yr / xmax) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - padT - padB);
  const top = points.map((p) => `${X(p.year).toFixed(1)},${Y(p.p90).toFixed(1)}`);
  const bot = points.slice().reverse().map((p) => `${X(p.year).toFixed(1)},${Y(p.p10).toFixed(1)}`);
  const band = `M ${top.join(" L ")} L ${bot.join(" L ")} Z`;
  const meanLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${X(p.year).toFixed(1)} ${Y(p.mean).toFixed(1)}`).join(" ");
  const gridY = [yMin, (yMin + yMax) / 2, yMax];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }} role="img" aria-label="Simulated SOFR rate cone over the horizon">
      {gridY.map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={Y(v)} y2={Y(v)} stroke="rgba(238,239,211,0.08)" strokeWidth="1" />
          <text x={padL - 8} y={Y(v) + 3} textAnchor="end" fill="rgba(238,239,211,0.5)" fontSize="10" fontFamily={dc.mono}>{v.toFixed(1)}%</text>
        </g>
      ))}
      {/* long-run θ */}
      <line x1={padL} x2={W - padR} y1={Y(longRun)} y2={Y(longRun)} stroke={dc.emerald} strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" />
      <text x={W - padR} y={Y(longRun) - 5} textAnchor="end" fill={dc.emerald} fontSize="10" fontWeight={700} fontFamily={dc.mono}>θ {longRun.toFixed(2)}%</text>
      {/* uncertainty band */}
      <path d={band} fill={BLUE} fillOpacity="0.16" stroke="none" />
      <polyline points={top.join(" ")} fill="none" stroke={BLUE} strokeOpacity="0.5" strokeWidth="1.2" />
      <polyline points={bot.join(" ")} fill="none" stroke={BLUE} strokeOpacity="0.5" strokeWidth="1.2" />
      {/* mean path */}
      <path d={meanLine} fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p) => (
        <g key={p.year}>
          <circle cx={X(p.year)} cy={Y(p.mean)} r="3.5" fill={BLUE} stroke={dc.dark} strokeWidth="1.5" />
          <text x={X(p.year)} y={H - 9} textAnchor="middle" fill="rgba(238,239,211,0.45)" fontSize="10" fontFamily={dc.mono}>{p.year === 0 ? "Now" : `Y${p.year}`}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function MonteCarloPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  // ── inputs ────────────────────────────────────────────────────────────────
  const [loanAmount,    setLoanAmount]    = useState(340000);
  const [monthlyRent,   setMonthlyRent]   = useState(3000);
  const [pitiaNonDebt,  setPitiaNonDebt]  = useState(750);
  const [initialSofr,   setInitialSofr]   = useState(CURRENT_MARKET_SNAPSHOT.sofr30Day);
  const [longRunSofr,   setLongRunSofr]   = useState(DEFAULT_VASICEK_PARAMS.longRunMeanSOFR);
  const [simulations,   setSimulations]   = useState(500);
  const [horizonYears,  setHorizonYears]  = useState(10);
  const [seed,          setSeed]          = useState(42);

  // track last-changed field for cause→effect highlight
  const [lastChanged, setLastChanged] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touch = useCallback((field: string, setter: (v: number) => void) => (v: number) => {
    setter(v);
    setLastChanged(field);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setLastChanged(null), 1800);
  }, []);

  // ── engine ────────────────────────────────────────────────────────────────
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

  // ── derived values ────────────────────────────────────────────────────────
  const pD1   = result ? result.probabilityDSCRBelow1_0  * 100 : 0;
  const pD125 = result ? result.probabilityDSCRBelow1_25 * 100 : 0;

  const dscrP10    = result?.dscrStats.p10    ?? 0;
  const dscrMedian = result?.dscrStats.median ?? 0;
  const dscrP90    = result?.dscrStats.p90    ?? 0;
  const dscrMin    = result?.dscrStats.min    ?? 0;
  const dscrMax    = result?.dscrStats.max    ?? 0;

  const sofrY1  = result ? result.sofrAtHorizon.year1.mean.toFixed(2)  + "%" : "—";
  const sofrY5  = result ? result.sofrAtHorizon.year5.mean.toFixed(2)  + "%" : "—";
  const sofrY10 = result ? result.sofrAtHorizon.year10.mean.toFixed(2) + "%" : "—";

  // Fan-chart points: today's rate, then the engine's horizon percentiles.
  const fanPoints: FanPoint[] = result
    ? [
        { year: 0, mean: initialSofr, p10: initialSofr, p90: initialSofr },
        ...([1, 3, 5, 10] as const)
          .filter((y) => y <= horizonYears)
          .map((y) => {
            const h = (result.sofrAtHorizon as Record<string, { mean: number; p10: number; p90: number }>)["year" + y];
            return { year: y, mean: h.mean, p10: h.p10, p90: h.p90 };
          })
          .filter((p) => p.mean > 0),
      ]
    : [];

  const pD1Color   = pColor(pD1,   5, 20);
  const pD125Color = pColor(pD125, 30, 60);

  // risk level based on pD1
  const riskLevel = pD1 > 20 ? "high" : pD1 > 5 ? "med" : pD1 > 1 ? "low" : "none";

  // headline verdict text
  const verdictText = pD1 > 20
    ? `High risk — ${pD1.toFixed(1)}% chance the property can't cover its own costs in some rate scenarios. Consider raising rent, reducing the loan, or choosing a fixed-rate program.`
    : pD1 > 5
    ? `Moderate risk — ${pD1.toFixed(1)}% chance of a coverage break. Review your long-run rate assumption and consider a lower LTV.`
    : `Low risk — only ${pD1.toFixed(1)}% of rate paths break coverage. This deal holds up across most simulated futures.`;

  // ── scroll helper ─────────────────────────────────────────────────────────
  const scrollToTool = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#mc-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  }, []);

  // ── highlight style helper ────────────────────────────────────────────────
  const hl = (field: string): React.CSSProperties =>
    lastChanged === field
      ? { outline: `2px solid ${dc.lemon}`, outlineOffset: 2, borderRadius: 6, transition: "outline 0.2s" }
      : {};

  const [spreadRef, spreadShown] = useRevealOnView<HTMLDivElement>();

  const navLinks = [
    { label: "DSCR Calc",     view: "dscr-calculator" },
    { label: "Stress Matrix", view: "stress-matrix" },
  ];
  const cta = { label: "Run simulation →", href: "#mc-tool", onClick: scrollToTool };

  return (
    <DcShell onNavigate={onNavigate} accent="#004041" navLinks={navLinks} cta={cta}>
      <style>{`
        @media (max-width: 991px) {
          .mc-3step { grid-template-columns: 1fr !important; }
          .mc-tool-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .mc-prob-grid { grid-template-columns: 1fr !important; }
        }
        .mc-path { fill: none; stroke-linecap: round; }
        .mc-card-highlight {
          transition: box-shadow 0.25s ease;
        }
        .mc-card-highlight.active {
          box-shadow: 0 0 0 2px ${dc.lemon};
        }
      `}</style>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", background: dc.teal, color: dc.cream,
        overflow: "hidden", minHeight: "clamp(480px,60vh,760px)",
        display: "flex", alignItems: "center",
      }}>
        <div className="gs-dot-grid" />
        <div className="dc-hero" style={{
          position: "relative", width: "100%", maxWidth: dc.maxW,
          margin: "0 auto", padding: `clamp(48px,7vh,88px) ${dc.pad}`,
          display: "grid", gridTemplateColumns: "1.1fr 0.9fr",
          gap: "clamp(32px,5vw,72px)", alignItems: "center",
        }}>
          {/* left */}
          <div id="gs-hero-content">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase", color: dc.dark,
              background: dc.lemon, padding: "7px 14px", borderRadius: 100, marginBottom: 24,
            }}>
              Monte Carlo · Vasicek SOFR · <span data-count={simulations}>{simulations}</span> paths
            </div>
            <H1 style={{ margin: "0 0 20px" }}>
              Stress-test the deal over {simulations} futures.
            </H1>
            <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "46ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
              This tool runs {simulations} what-if interest-rate scenarios to show the <em>range</em> of possible outcomes. Your DSCR (debt-service coverage ratio — whether the property's rent covers the loan payment; 1.00 = break-even, higher is safer) is computed at each simulated ARM (adjustable-rate mortgage) reset.
            </div>
            <Lead style={{ color: "rgba(238,239,211,0.65)", maxWidth: "46ch", margin: "0 0 36px" }}>
              The headline number is the <strong style={{ color: dc.cream }}>probability your deal breaks</strong> — that DSCR falls below 1.0 in some future rate scenario. Below 5% is comfortable; above 20% needs attention.
            </Lead>
            <Btn label="Run the simulation" href="#mc-tool" onClick={scrollToTool} />
          </div>

          {/* right — live preview card */}
          <div style={{ position: "relative", display: "grid", gap: 18 }}>
            <MotionWorkbench
              mode="sim"
              value={`${pD1.toFixed(1)}%`}
              label="Break-risk paths"
            />
            <div style={{ background: dc.dark, borderRadius: dc.r.lg, padding: 24, border: "1px solid rgba(238,239,211,0.16)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 16 }}>
                Live — median DSCR across {simulations} paths
              </div>
              {/* Gauge centered */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <DscrGauge value={Math.max(0.5, Math.min(2.0, dscrMedian || 1.2))} size={160} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}>
                  <Mono style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", display: "block" }}>P10 (worst 10%)</Mono>
                  <Mono style={{ fontSize: 18, fontWeight: 700, color: dscrP10 < 1.0 ? RED : dc.emerald }}>{result ? dscrP10.toFixed(2) + "x" : "—"}</Mono>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Mono style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", display: "block" }}>P90 (best 10%)</Mono>
                  <Mono style={{ fontSize: 18, fontWeight: 700, color: dc.emerald }}>{result ? dscrP90.toFixed(2) + "x" : "—"}</Mono>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TOOL ────────────────────────────────────────────────────────── */}
      <section id="mc-tool" style={{
        background: dc.dark, color: dc.cream,
        padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)`,
      }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* section headline + verdict */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>
              Live Monte Carlo engine
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 18px", color: dc.cream }}>
              <Mono>{simulations}</Mono> paths · <Mono>{horizonYears}</Mono>yr horizon
            </h2>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              background: pD1 > 20 ? "rgba(255,107,107,0.1)" : pD1 > 5 ? "rgba(216,217,88,0.12)" : "rgba(77,189,151,0.12)",
              border: `1px solid ${pD1 > 20 ? "rgba(255,107,107,0.3)" : pD1 > 5 ? "rgba(216,217,88,0.3)" : "rgba(77,189,151,0.3)"}`,
              borderRadius: dc.r.sm, padding: "14px 18px", maxWidth: 720,
            }}>
              <RiskFlame level={riskLevel} size={20} />
              <p style={{ fontSize: 14, fontWeight: 500, color: dc.cream, margin: 0, lineHeight: 1.5 }}>
                {verdictText}
              </p>
            </div>
          </div>

          {/* two-column tool layout */}
          <div className="mc-tool-grid" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 32, alignItems: "start" }}>

            {/* ── INPUT PANEL ─────────────────────────────────────────── */}
            <div style={{ background: dc.teal, borderRadius: dc.r.md, padding: 28, border: "1px solid rgba(238,239,211,0.16)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: BLUE, marginBottom: 6 }}>
                Simulation parameters
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 20px", lineHeight: 1.5 }}>
                Drag the sliders — results update live.
              </p>

              <div style={hl("loanAmount")}>
                <SliderField label="Loan Amount" hint="Total borrowed — not the purchase price." value={loanAmount} set={touch("loanAmount", setLoanAmount)} min={50000} max={2000000} step={5000} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
              </div>
              <div style={hl("monthlyRent")}>
                <SliderField label="Monthly Rent" hint="Gross rent the property generates." value={monthlyRent} set={touch("monthlyRent", setMonthlyRent)} min={500} max={10000} step={50} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
              </div>
              <div style={hl("pitiaNonDebt")}>
                <SliderField label="Taxes + Insurance + HOA /mo" hint="Non-debt PITIA costs. Together with the P&I payment, this makes up the full monthly obligation." value={pitiaNonDebt} set={touch("pitiaNonDebt", setPitiaNonDebt)} min={0} max={3000} step={25} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
              </div>

              <div style={{ borderTop: "1px solid rgba(238,239,211,0.16)", margin: "20px 0 20px" }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 16 }}>
                Rate assumptions
              </div>

              <div style={hl("initialSofr")}>
                <SliderField label="Initial SOFR %" hint="Today's short-term rate index. ARM resets float off this after the fixed period ends." value={initialSofr} set={touch("initialSofr", setInitialSofr)} min={0} max={10} step={0.05} suffix="%" fmt={(v) => v.toFixed(2)} />
              </div>
              <div style={hl("longRunSofr")}>
                <SliderField label="Long-run SOFR (θ) %" hint="Where you think rates settle over time. All paths drift toward this level." value={longRunSofr} set={touch("longRunSofr", setLongRunSofr)} min={0} max={10} step={0.05} suffix="%" fmt={(v) => v.toFixed(2)} />
              </div>

              <div style={{ borderTop: "1px solid rgba(238,239,211,0.16)", margin: "20px 0 20px" }} />
              <Disclosure label="Advanced parameters">
                <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
                  <SliderField label="Number of simulations" hint="More paths = more precise probability. 500 is a solid default." value={simulations} set={setSimulations} min={100} max={2000} step={100} suffix="" fmt={(v) => v.toLocaleString("en-US")} />
                  <SliderField label="Horizon (years)" hint="Match your planned hold period." value={horizonYears} set={setHorizonYears} min={1} max={30} step={1} suffix="yr" fmt={(v) => v.toString()} />
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>Random seed</span>
                      <Mono style={{ fontSize: 14, fontWeight: 700, color: dc.lemon }}>{seed}</Mono>
                    </div>
                    <input className="gs-range" aria-label="Random seed" type="range" min={1} max={999} step={1} value={seed} onChange={(e) => setSeed(+e.target.value)} />
                    <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.4 }}>Controls which specific paths are drawn. Different seeds give similar but not identical results.</span>
                  </div>
                </div>
              </Disclosure>
            </div>

            {/* ── OUTPUT PANEL ──────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Headline probabilities — P(<1.0) dominant lemon, P(<1.25) secondary blue */}
              <div className="mc-prob-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "stretch" }}>
                <div style={{ background: dc.teal, borderRadius: dc.r.md, padding: "clamp(22px,3vw,32px)", border: `1px solid ${pD1Color}44` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon }}>P(DSCR &lt; 1.0)</div>
                    <RiskFlame level={riskLevel} size={16} />
                  </div>
                  <Mono style={{ fontSize: "clamp(46px,6vw,82px)", fontWeight: 700, letterSpacing: "-0.04em", color: pD1Color, lineHeight: 0.92, display: "block" }}>{pD1.toFixed(1)}%</Mono>
                  <div style={{ fontSize: 13, color: "rgba(238,239,211,0.62)", marginTop: 12, lineHeight: 1.5 }}>chance the property can't cover its costs in some rate futures — below 5% is comfortable, above 20% is high-risk.</div>
                </div>
                <div style={{ background: dc.teal, borderRadius: dc.r.md, padding: "clamp(22px,3vw,32px)", border: "1px solid rgba(238,239,211,0.16)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: BLUE, marginBottom: 10 }}>P(DSCR &lt; 1.25)</div>
                  <Mono style={{ fontSize: "clamp(46px,6vw,82px)", fontWeight: 700, letterSpacing: "-0.04em", color: BLUE, lineHeight: 0.92, display: "block" }}>{pD125.toFixed(1)}%</Mono>
                  <div style={{ fontSize: 13, color: "rgba(238,239,211,0.62)", marginTop: 12, lineHeight: 1.5 }}>chance of missing the 1.25 cushion most lenders prefer — below 30% is acceptable.</div>
                </div>
              </div>

              {/* SOFR FAN CHART — the signature uncertainty cone */}
              <div style={{ background: dc.teal, borderRadius: dc.r.md, padding: "clamp(20px,2.5vw,28px)", border: "1px solid rgba(238,239,211,0.16)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: BLUE }}>Where rates could go — {simulations} simulated SOFR paths</div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: "rgba(238,239,211,0.62)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 14, height: 3, background: BLUE, borderRadius: 2, display: "inline-block" }} />mean</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 14, height: 9, background: BLUE, opacity: 0.22, borderRadius: 2, display: "inline-block" }} />P10–P90</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.5 }}>
                  The cone widens as uncertainty grows. When it sits well above θ (your long-run rate), the model sees rates staying elevated — a riskier ARM.
                </p>
                <SofrFanChart points={fanPoints} longRun={longRunSofr} />
              </div>

              {/* Median DSCR gauge + spread — dark */}
              <div style={{ background: dc.teal, borderRadius: dc.r.md, padding: 24, border: "1px solid rgba(238,239,211,0.16)" }}>
                <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: BLUE, marginBottom: 10 }}>Median DSCR</div>
                    <DscrGauge value={Math.max(0.5, Math.min(2.0, dscrMedian || 1.0))} size={130} />
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 6, lineHeight: 1.4 }}>
                      {dscrMedian >= 1.25 ? "Comfortable cushion" : dscrMedian >= 1.0 ? "Thin margin — watch for rate rises" : "Below break-even in median scenario"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: BLUE, marginBottom: 4 }}>
                      DSCR outcome spread
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 4px", lineHeight: 1.5 }}>
                      P10–P90 range of DSCR across all paths. Healthy = P10 above 1.0, median above 1.25.
                    </p>
                    <div ref={spreadRef}>
                      <DscrSpreadBar p10={dscrP10} median={dscrMedian} p90={dscrP90} animate={spreadShown} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full distribution — progressive disclosure */}
              <Disclosure label="Full distribution · P10 / Median / P90 / Min / Max">
                <div>
                  <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 12px", lineHeight: 1.5 }}>
                    P10 = worst 10% of outcomes. A deal is robust when even P10 stays above 1.0. Min shows the single worst path — outlier scenarios are real but rare.
                  </p>
                  {result ? (
                    [
                      { label: "P10 (worst 10%)",  val: dscrP10.toFixed(2) + "x",    color: dscrP10 < 1.0 ? RED : ORANGE },
                      { label: "P25",               val: result.dscrStats.p25.toFixed(2) + "x", color: dc.cream },
                      { label: "Median (P50)",      val: dscrMedian.toFixed(2) + "x",   color: dc.cream },
                      { label: "P75",               val: result.dscrStats.p75.toFixed(2) + "x", color: dc.cream },
                      { label: "P90 (best 10%)",    val: dscrP90.toFixed(2) + "x",    color: dc.emerald },
                      { label: "Min (worst path)",  val: dscrMin.toFixed(2) + "x",    color: RED },
                      { label: "Max (best path)",   val: dscrMax.toFixed(2) + "x",    color: dc.emerald },
                    ].map((row) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(238,239,211,0.08)", fontSize: 13 }}>
                        <span style={{ color: "rgba(238,239,211,0.6)", fontWeight: 500 }}>{row.label}</span>
                        <Mono style={{ color: row.color, fontWeight: 700 }}>{row.val}</Mono>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: RED, fontSize: 13 }}>Engine returned no result.</div>
                  )}
                </div>
              </Disclosure>

              {/* engine footnote */}
              {result && (
                <div style={{
                  padding: "14px 18px", background: "rgba(126,200,211,0.08)",
                  borderRadius: dc.r.sm, border: "1px solid rgba(126,200,211,0.22)",
                  fontSize: 12, color: "rgba(238,239,211,0.6)", lineHeight: 1.6,
                }}>
                  <strong style={{ color: BLUE }}>Model parameters:</strong>{" "}
                  Vasicek mean-reverting model · {result.simulations} paths × {result.horizonMonths} months.
                  θ={result.modelParameters.longRunMeanSOFR}% (long-run mean),
                  κ={result.modelParameters.meanReversionSpeed} (reversion speed),
                  σ={result.modelParameters.volatility}% (volatility),
                  r₀={result.modelParameters.initialSOFR}% (starting rate).
                  {" "}<em>Preliminary estimate — not a commitment to lend. Submit a scenario review for exact underwriting.</em>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNNEL CTA ──────────────────────────────────────────────────── */}
      <section style={{ background: dc.dark, padding: `clamp(56px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>
                Ready to move forward?
              </div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>
                Get a real rate on this deal.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch" }}>
                Submit once. Greenstreet places your file in the best-fit program and funds it.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <Btn label="Get my rate" href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} />
              <Btn label="Stress matrix" variant="secondary" href="/tools/stress-matrix" onClick={(e) => { e.preventDefault(); onNavigate?.("stress-matrix"); }} />
            </div>
          </div>
        </div>
      </section>

    </DcShell>
  );
}
