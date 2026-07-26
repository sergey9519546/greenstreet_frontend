import React, { useState, useRef, useCallback } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn, useRevealOnView } from "../design/dc";
import { DscrGauge, RiskFlame, riskFromDscr } from "../design/artifacts";

// ─── helpers ──────────────────────────────────────────────────────────────────
const RED    = "#ff6b6b";
const ORANGE = "#f97316";

function fmt$(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// Shared op-ex ratio — matches engine's combined mgmt(8%)+maint(5%)+turnover(2%) = 15% of gross.
const OPEX_PCT = 15;

// Day-1 (or grown) NOI for a given assumption set. Honors the user's rentGrowth and
// vacancy sliders so every metric derived from it — not just IRR — reflects the same
// inputs. yrOffset=0 gives the un-grown "day 1" NOI used for the snapshot metrics
// (Cap Rate, Yield on Cost, Debt Yield, Cash-on-Cash).
function noiForYear(
  opts: { monthlyRent: number; rentGrowth: number; vacancy: number; annualTaxes: number; annualInsurance: number; hoa: number },
  yrOffset: number,
): number {
  const gross = opts.monthlyRent * 12 * Math.pow(1 + opts.rentGrowth / 100, yrOffset);
  const egi   = gross * (1 - opts.vacancy / 100);
  return egi - opts.annualTaxes - opts.annualInsurance - opts.hoa * 12 - gross * (OPEX_PCT / 100);
}

// Inline IRR bisection — matches engine cash-flow model (OPEX 15%, mgmt+maint+turnover).
// Used for the headline and sensitivity matrix so every user-editable input is honored.
// Returns the cash-flow array alongside the IRR so callers can derive Equity Multiple
// from the same slider-driven assumptions (see em below).
function calcIRR(opts: {
  purchasePrice: number;
  ltv: number;
  rate: number;
  monthlyRent: number;
  annualTaxes: number;
  annualInsurance: number;
  hoa: number;
  holdYears: number;
  exitCapRate: number;
  rentGrowth: number;
  vacancy: number;
  prepayAtExit: number;
}): { irr: number; cfs: number[] } {
  const { purchasePrice, ltv, rate, monthlyRent, annualTaxes, annualInsurance, hoa, holdYears, exitCapRate, rentGrowth, vacancy, prepayAtExit } = opts;
  const loan    = purchasePrice * (ltv / 100);
  const cashInv = purchasePrice - loan;
  const r       = rate / 100 / 12;
  const n       = 360;
  const piMo    = r === 0
    ? loan / n
    : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const remBal = (elapsed: number) => {
    if (elapsed >= n) return 0;
    if (r === 0) return loan * (1 - elapsed / n);
    const f = Math.pow(1 + r, n);
    const e = Math.pow(1 + r, elapsed);
    return Math.max(0, (loan * (f - e)) / (f - 1));
  };

  const hold = Math.max(1, Math.min(15, holdYears));
  const cfs: number[] = [-cashInv];

  const noiOpts = { monthlyRent, rentGrowth, vacancy, annualTaxes, annualInsurance, hoa };
  for (let yr = 1; yr <= hold; yr++) {
    const noi = noiForYear(noiOpts, yr - 1);
    let cf = noi - piMo * 12;
    if (yr === hold) {
      const stabNOI = noiForYear(noiOpts, yr);
      const exit    = stabNOI / (exitCapRate / 100);
      const bal     = remBal(hold * 12);
      cf += exit - exit * 0.06 - bal - loan * (prepayAtExit / 100);
    }
    cfs.push(cf);
  }

  const f = (rate_: number) => cfs.reduce((s, c, i) => s + c / Math.pow(1 + rate_, i), 0);
  let lo = -0.9, hi = 5;
  const flo = f(lo);
  if (flo * f(hi) > 0) return { irr: NaN, cfs }; // no sign change ⇒ no real IRR root
  let curFlo = flo;
  let irr = (lo + hi) / 2;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    const fm = f(m);
    if (Math.abs(fm) < 1) { irr = m; break; }
    if (curFlo * fm < 0) { hi = m; }
    else { lo = m; curFlo = fm; }
    irr = (lo + hi) / 2;
  }
  return { irr, cfs };
}

// ─── slider field ─────────────────────────────────────────────────────────────
interface SliderFieldProps {
  label: string;
  hint?: string;
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
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)" }}>
          {label}
        </span>
        <Mono style={{ fontSize: 14, fontWeight: 700, color: dc.dark }}>
          {prefix}{display}{suffix}
        </Mono>
      </div>
      <input className="gs-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
      {hint && (
        <span style={{ display: "block", fontSize: 11, color: "rgba(0,55,56,0.4)", marginTop: 4, lineHeight: 1.4 }}>
          {hint}
        </span>
      )}
    </div>
  );
}

// ─── collapsible disclosure ───────────────────────────────────────────────────
function Disclosure({ label, children, defaultOpen = false }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: dc.r.sm, border: "1px solid rgba(0,55,56,0.12)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "13px 18px", background: "rgba(0,55,56,0.04)", border: "none", cursor: "pointer",
          fontFamily: dc.sans, fontSize: 12, fontWeight: 600, color: dc.rain,
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }}>
          <path d="M4 6l4 4 4-4" stroke={dc.rain} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "16px 18px 18px", borderTop: "1px solid rgba(0,55,56,0.08)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── StepCard ────────────────────────────────────────────────────────────────
function StepCard({ num, numColor, bg, heading, headingColor, body, bodyColor }: {
  num: string; numColor: string; bg: string;
  heading: string; headingColor?: string; body: string; bodyColor: string;
}) {
  return (
    <div style={{ background: bg, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
      <Mono style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, letterSpacing: "-0.03em", color: numColor, marginBottom: 14, lineHeight: 1, display: "block" }}>{num}</Mono>
      <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1, color: headingColor }}>{heading}</h3>
      <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: bodyColor, margin: 0, letterSpacing: "-0.01em" }}>{body}</p>
    </div>
  );
}

// ─── IRR bar (interaction-driven CSS transition only) ─────────────────────────
// Starts at 0, transitions to heightPct after first paint.
// The transition is driven by state/prop change, NOT gsap.from() — compliant.
function IrrBar({ heightPct, gradient, label, valLabel, valColor, flex = 1 }: {
  heightPct: string; gradient: string; label: string; valLabel: string; valColor: string; flex?: number;
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const prev = useRef<string>("0%");
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const cur = heightPct;
    if (cur === prev.current) return;
    prev.current = cur;
    ref.current.style.height = cur;
  }, [heightPct]);

  return (
    <div ref={ref} style={{
      flex, background: gradient, borderRadius: "6px 6px 0 0",
      height: "0%", transition: "height 0.7s cubic-bezier(0.16,1,0.3,1)",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      alignItems: "center", paddingBottom: 8, position: "relative",
    }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -120%)", fontSize: 11, fontWeight: 700, color: valColor, whiteSpace: "nowrap", paddingBottom: 6 }}>
        {valLabel}
      </div>
      <div style={{ fontSize: 10, color: "rgba(238,239,211,0.5)", textAlign: "center", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ─── sensitivity cell heat color ─────────────────────────────────────────────
function cellStyle(r: number): React.CSSProperties {
  const color = r >= 14 ? dc.rain : r >= 10 ? "#018582" : r >= 6 ? "#9a7b00" : RED;
  const bg    = r >= 14 ? "rgba(0,101,101,0.1)" : r >= 10 ? "rgba(1,133,130,0.06)" : "transparent";
  return { padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 700, color, background: bg, borderRadius: 4 };
}

// ─── main component ───────────────────────────────────────────────────────────
export default function ReturnsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  React.useEffect(() => { document.title = "Returns & IRR | Greenstreet Finance"; }, []);

  // ── inputs ────────────────────────────────────────────────────────────────
  const [purchasePrice,   setPurchasePrice]   = useState(425000);
  const [ltv,             setLtv]             = useState(75);
  const [rate,            setRate]            = useState(7.0);
  const [monthlyRent,     setMonthlyRent]     = useState(3000);
  const [annualTaxes,     setAnnualTaxes]     = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa,             setHoa]             = useState(0);
  const [holdYears,       setHoldYears]       = useState(5);
  const [exitCapRate,     setExitCapRate]      = useState(6.5);
  const [rentGrowth,      setRentGrowth]      = useState(3);
  const [vacancy,         setVacancy]         = useState(8);
  const [prepayAtExit,    setPrepayAtExit]    = useState(2);

  // cause→effect highlight
  const [lastChanged, setLastChanged] = useState<string | null>(null);
  const hlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touch = useCallback((field: string, setter: (v: number) => void) => (v: number) => {
    setter(v);
    setLastChanged(field);
    if (hlTimer.current) clearTimeout(hlTimer.current);
    hlTimer.current = setTimeout(() => setLastChanged(null), 1600);
  }, []);
  const hl = (field: string): React.CSSProperties =>
    lastChanged === field
      ? { outline: `2px solid ${dc.lemon}`, outlineOffset: 2, borderRadius: 6 }
      : {};

  // ── scroll ────────────────────────────────────────────────────────────────
  const scrollToTool = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#rt-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  }, []);

  // ── engine ────────────────────────────────────────────────────────────────
  // ── derived ───────────────────────────────────────────────────────────────
  const irrOpts = { purchasePrice, ltv, rate, monthlyRent, annualTaxes, annualInsurance, hoa, holdYears, exitCapRate, rentGrowth, vacancy, prepayAtExit };

  const levResult = calcIRR(irrOpts);
  const unlResult = calcIRR({ ...irrOpts, ltv: 0 });
  const levIRR    = levResult.irr * 100;
  const unlIRR    = unlResult.irr * 100;

  const cashInv = purchasePrice * (1 - ltv / 100);

  // Shared day-1 assumption set — every metric below is derived from the same
  // rentGrowth/vacancy-honoring NOI and P&I that drive the headline Levered IRR,
  // so no metric on this page silently ignores the sliders.
  const loanAmt    = purchasePrice * (ltv / 100);
  const r_         = rate / 100 / 12;
  const piMoCalc   = r_ === 0 ? loanAmt / 360 : (loanAmt * r_ * Math.pow(1 + r_, 360)) / (Math.pow(1 + r_, 360) - 1);
  const annualPI   = piMoCalc * 12;
  const year1NOI   = noiForYear({ monthlyRent, rentGrowth, vacancy, annualTaxes, annualInsurance, hoa }, 0);

  // Cap Rate / Yield on Cost / Debt Yield / CoC are day-1 snapshot metrics — they
  // correctly do not vary with rentGrowth, only with vacancy (matching calcIRR's
  // noiForYear(0)). Yield on Cost equals Cap Rate here because this page hardcodes
  // lenderFees/brokerFees to 0, making purchase price the full cost basis.
  const entryCapRate = purchasePrice > 0 ? (year1NOI / purchasePrice) * 100 : 0;
  const yoc          = entryCapRate;
  const debtYield    = loanAmt > 0 ? (year1NOI / loanAmt) * 100 : 0;
  const coc          = cashInv > 0 ? ((year1NOI - annualPI) / cashInv) * 100 : 0;
  // Equity Multiple: sum of the levered cash-flow array (already honors rentGrowth
  // and vacancy via calcIRR/noiForYear) over cash invested — same assumptions as IRR.
  const em = cashInv > 0 && levResult.cfs.length > 1
    ? levResult.cfs.slice(1).reduce((s, c) => s + c, 0) / cashInv
    : 1;

  const pct  = (v: number) => (Number.isFinite(v) ? v.toFixed(1) + "%" : "—");
  const irrStr     = pct(levIRR);
  const emStr      = em.toFixed(2) + "x";
  const irrColor   = levIRR >= 12 ? dc.emerald : levIRR >= 8 ? dc.lemon : RED;

  // verdict
  const verdictLabel = levIRR >= 12 ? "STRONG DEAL" : levIRR >= 8 ? "WORKABLE" : Number.isFinite(levIRR) ? "WEAK" : "—";
  const verdictText  = levIRR >= 12
    ? "IRR above 12% — this deal is working hard relative to the risk. The rent is well above debt service."
    : levIRR >= 8
    ? "IRR between 8–12% — acceptable, but look for ways to reduce the purchase price, increase rent, or tighten vacancy."
    : Number.isFinite(levIRR)
    ? "IRR below 8% — the deal may not reward the risk. Try a lower price, higher rent, or a shorter prepay structure."
    : "Adjust inputs to compute your IRR.";

  // DSCR for the gauge (NOI / annual debt service)
  const annualNOI   = year1NOI;
  const annualPITIA = annualPI;
  const dscrValue   = annualPITIA > 0 ? annualNOI / annualPITIA : 1.5;
  const dscrRisk    = riskFromDscr(dscrValue);

  // hero bar heights
  const barH = (v: number) => (Number.isFinite(v) ? `${Math.max(6, Math.min(72, (v / 20) * 72))}%` : "6%");

  // sensitivity grid
  const holds   = [3, 5, 7, 10, 12];
  const growths = [1, 2, 3, 4];

  const [gaugeRef, gaugeShown] = useRevealOnView<HTMLDivElement>();

  return (
    <DcShell onNavigate={onNavigate} accent={dc.dark}
      navLinks={[{ label: "DSCR", view: "dscr-calculator" }, { label: "Monte Carlo", view: "monte-carlo" }]}
      cta={{ label: "Compute IRR →", onClick: scrollToTool }}
    >
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", background: dc.dark, color: dc.cream,
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
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 22 }}>
              Returns &amp; IRR · levered + unlevered
            </div>
            <H1 style={{ margin: "0 0 22px" }}>
              What will this investment actually earn?
            </H1>
            {/* headline IRR badge — visible in hero */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.12)", borderRadius: dc.r.md, padding: "18px 24px", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.45)", marginBottom: 4 }}>Levered IRR</div>
                <Mono style={{ fontSize: "clamp(40px,5vw,64px)", fontWeight: 600, letterSpacing: "-0.04em", color: irrColor, lineHeight: 0.95, display: "block" }}>
                  {irrStr}
                </Mono>
              </div>
              <div style={{ width: 1, height: 48, background: "rgba(238,239,211,0.15)" }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.45)", marginBottom: 4 }}>Verdict</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", color: irrColor }}>{verdictLabel}</span>
                  <RiskFlame level={levIRR < 8 ? "med" : levIRR < 12 ? "low" : "none"} size={18} />
                </div>
              </div>
            </div>
            <Lead style={{ color: "rgba(238,239,211,0.65)", maxWidth: "46ch", margin: "0 0 20px" }}>
              Cash-on-cash return (yearly cash flow as a % of the cash you put in), IRR (the annualized return on your equity, accounting for the full exit), and equity multiple — from day one through the sale.
            </Lead>
            <p style={{ color: "rgba(238,239,211,0.45)", fontSize: 13, fontWeight: 500, margin: "0 0 32px", lineHeight: 1.5 }}>
              Tip: adjust inputs on the left. The IRR updates live. Then check the sensitivity table to see if the deal still works under slower rent growth or an earlier exit.
            </p>
            <Btn label="Run the returns engine ↓" href="#rt-tool" onClick={scrollToTool} />
          </div>

          {/* right — live bar chart */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(8px,2vw,20px)", height: "clamp(160px,22vh,240px)" }}>
              <IrrBar heightPct={barH(coc)}    gradient="linear-gradient(180deg,#4dbd97,#006565)" label="CoC"      valLabel={coc.toFixed(1) + "%"}    valColor={dc.emerald} />
              <IrrBar heightPct={barH(unlIRR)} gradient="linear-gradient(180deg,#4dbd97,#006565)" label="Unlev."   valLabel={pct(unlIRR)}              valColor={dc.emerald} />
              <IrrBar heightPct={barH(levIRR)} gradient={`linear-gradient(180deg,${dc.lemon},#a8a838)`} label="Lev. IRR" valLabel={irrStr} valColor={dc.lemon} flex={1.3} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 4 }}>
              {[{ l: "CoC", h: "Cash-on-cash: yr 1 cash flow ÷ cash invested" }, { l: "Unlev.", h: "IRR with no debt (all-cash)" }, { l: "Lev. IRR", h: "Annualized return on your down payment" }].map((item) => (
                <div key={item.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "rgba(238,239,211,0.35)", lineHeight: 1.3, maxWidth: 72 }}>{item.h}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-STEP BAND ───────────────────────────────────────────────── */}
      <section style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="dc-band-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(0,55,56,0.12)", borderRadius: 9, overflow: "hidden" }}>
            <StepCard num="01" numColor={dc.lemon}               bg={dc.cream} heading="Enter your deal"      body="Purchase price, LTV (down payment as a % of price), rate, rent, hold years, exit cap rate (the expected income yield when you sell), rent growth, and vacancy." bodyColor="rgba(0,55,56,0.6)" />
            <StepCard num="02" numColor={dc.emerald}             bg={dc.dark}  heading="IRR computed"         headingColor={dc.cream} body="The engine builds a year-by-year cash-flow model: rents in, mortgage out, equity at exit. It then solves for the annualized return (IRR) on your invested cash." bodyColor="rgba(238,239,211,0.65)" />
            <StepCard num="03" numColor="rgba(0,55,56,0.5)"      bg={dc.lemon} heading="Test your assumptions" body="The 5×4 sensitivity table shows IRR across five hold periods and four rent-growth rates. Green (≥14%) = strong. Red = deal needs work. Use it to find the edges of the deal." bodyColor="rgba(0,55,56,0.65)" />
          </div>
        </div>
      </section>

      {/* ── TOOL ──────────────────────────────────────────────────────── */}
      <section id="rt-tool" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* section header + live verdict */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 12 }}>
              Live returns engine
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 12px" }}>
              Levered IRR <span style={{ color: irrColor }}>{irrStr}</span> · {emStr} equity multiple
            </h2>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              background: levIRR >= 12 ? "rgba(77,189,151,0.1)" : levIRR >= 8 ? "rgba(216,217,88,0.1)" : "rgba(255,107,107,0.08)",
              border: `1px solid ${levIRR >= 12 ? "rgba(77,189,151,0.25)" : levIRR >= 8 ? "rgba(216,217,88,0.25)" : "rgba(255,107,107,0.2)"}`,
              borderRadius: dc.r.sm, padding: "14px 18px", maxWidth: 660,
            }}>
              <RiskFlame level={levIRR < 8 ? "med" : levIRR < 12 ? "low" : "none"} size={20} />
              <p style={{ fontSize: 14, fontWeight: 500, color: dc.dark, margin: 0, lineHeight: 1.5 }}>
                {verdictText}
              </p>
            </div>
          </div>

          {/* grid: inputs | results */}
          <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 32, alignItems: "start" }}>

            {/* ── INPUTS ─────────────────────────────────────────────── */}
            <div style={{ background: dc.white, borderRadius: dc.r.md, padding: 28, border: "1px solid rgba(0,55,56,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 6 }}>
                Deal inputs
              </div>
              <p style={{ fontSize: 12, color: "rgba(0,55,56,0.45)", margin: "0 0 18px", lineHeight: 1.5 }}>
                Drag any slider — the IRR and sensitivity table update instantly.
              </p>

              {/* Primary deal inputs */}
              <div style={hl("purchasePrice")}>
                <SliderField label="Purchase Price" hint="Total acquisition cost." value={purchasePrice} set={touch("purchasePrice", setPurchasePrice)} min={50000} max={3000000} step={5000} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
              </div>
              <div style={hl("ltv")}>
                <SliderField label="LTV (Loan-to-Value)" hint="Your down payment = 100% − LTV. Example: 75% LTV means 25% down." value={ltv} set={touch("ltv", setLtv)} min={50} max={80} step={1} suffix="%" fmt={(v) => v.toFixed(0)} />
              </div>
              <div style={hl("rate")}>
                <SliderField label="Note Rate" hint="Your fixed mortgage rate." value={rate} set={touch("rate", setRate)} min={3} max={14} step={0.125} suffix="%" fmt={(v) => v.toFixed(3)} />
              </div>
              <div style={hl("monthlyRent")}>
                <SliderField label="Monthly Rent" hint="Gross scheduled rent before vacancy." value={monthlyRent} set={touch("monthlyRent", setMonthlyRent)} min={500} max={15000} step={50} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
              </div>

              <div style={{ borderTop: "1px solid rgba(0,55,56,0.08)", margin: "18px 0" }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.4)", marginBottom: 14 }}>
                Hold &amp; exit
              </div>
              <div style={hl("holdYears")}>
                <SliderField label="Hold Years" hint="Your planned hold — the IRR is highly sensitive to this." value={holdYears} set={touch("holdYears", setHoldYears)} min={1} max={15} step={1} suffix="yr" fmt={(v) => v.toString()} />
              </div>
              <div style={hl("exitCapRate")}>
                <SliderField label="Exit Cap Rate" hint="The expected cap rate when you sell — higher cap rate = lower exit value. Conservative: assume 0.5–1% above your entry cap." value={exitCapRate} set={touch("exitCapRate", setExitCapRate)} min={3} max={12} step={0.25} suffix="%" fmt={(v) => v.toFixed(2)} />
              </div>
              <div style={hl("rentGrowth")}>
                <SliderField label="Rent Growth /yr" hint="Annual rent increase assumption. 2–3% is typical; stress-test with 1%." value={rentGrowth} set={touch("rentGrowth", setRentGrowth)} min={0} max={8} step={0.5} suffix="%" fmt={(v) => v.toFixed(1)} />
              </div>
              <div style={hl("vacancy")}>
                <SliderField label="Vacancy %" hint="Fraction of the year the unit is vacant. 5–10% is typical." value={vacancy} set={touch("vacancy", setVacancy)} min={0} max={30} step={1} suffix="%" fmt={(v) => v.toFixed(0)} />
              </div>

              <Disclosure label="Operating costs + prepay">
                <div style={{ paddingTop: 4 }}>
                  <SliderField label="Annual Taxes" value={annualTaxes} set={setAnnualTaxes} min={0} max={30000} step={250} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
                  <SliderField label="Annual Insurance" value={annualInsurance} set={setAnnualInsurance} min={0} max={15000} step={100} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
                  <SliderField label="HOA /mo" value={hoa} set={setHoa} min={0} max={1500} step={25} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
                  <SliderField label="Prepay penalty at exit %" hint="Applied to the remaining loan balance." value={prepayAtExit} set={setPrepayAtExit} min={0} max={5} step={0.5} suffix="%" fmt={(v) => v.toFixed(1)} />
                </div>
              </Disclosure>
            </div>

            {/* ── RESULTS ────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Big IRR card */}
              <div style={{
                background: dc.dark, borderRadius: dc.r.md, padding: "clamp(24px,3vw,40px)",
                display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center",
              }}>
                <div style={{ textAlign: "center" }}>
                  <Mono style={{ fontSize: "clamp(64px,8vw,108px)", fontWeight: 600, letterSpacing: "-0.04em", color: irrColor, lineHeight: 0.9, display: "block" }}>
                    {irrStr}
                  </Mono>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: irrColor }}>
                      {verdictLabel}
                    </span>
                    <RiskFlame level={levIRR < 8 ? "med" : levIRR < 12 ? "low" : "none"} size={16} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Cash-on-Cash Return", val: coc.toFixed(1) + "%", color: coc >= 8 ? dc.emerald : dc.lemon, hint: "Year 1 cash flow ÷ cash invested. Good: ≥8%" },
                    { label: "Unlevered IRR", val: pct(unlIRR), color: dc.cream, hint: "IRR if you paid all cash — no loan" },
                    { label: "Equity Multiple", val: emStr, color: dc.emerald, hint: "Total cash returned ÷ cash invested" },
                    { label: "Cash Invested", val: fmt$(cashInv), color: dc.cream, hint: "Down payment only" },
                    { label: "Cap Rate (entry)", val: entryCapRate.toFixed(2) + "%", color: dc.cream, hint: "Net operating income ÷ purchase price" },
                    { label: "Debt Yield", val: debtYield.toFixed(2) + "%", color: dc.cream, hint: "Net income ÷ loan amount (lender metric)" },
                  ].map((r) => (
                    <div key={r.label} style={{ background: "rgba(238,239,211,0.05)", borderRadius: dc.r.sm, padding: 13 }}>
                      <Mono style={{ fontSize: "clamp(16px,1.8vw,22px)", fontWeight: 600, letterSpacing: "-0.02em", color: r.color, display: "block" }}>
                        {r.val}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(238,239,211,0.3)", marginTop: 2, lineHeight: 1.3 }}>{r.hint}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DSCR gauge — shows debt coverage quality */}
              <div ref={gaugeRef} style={{
                background: "#fff", borderRadius: dc.r.md, padding: "22px 24px",
                border: "1px solid rgba(0,55,56,0.1)",
                display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center",
                opacity: gaugeShown ? 1 : 0, transform: gaugeShown ? "none" : "translateY(8px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}>
                <DscrGauge value={Math.max(0.5, Math.min(2.0, dscrValue))} size={120} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain }}>
                      DSCR at entry
                    </div>
                    <RiskFlame level={dscrRisk} size={15} />
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(0,55,56,0.6)", margin: 0, lineHeight: 1.5 }}>
                    DSCR (debt-service coverage ratio) measures whether the property's net income covers the full loan payment. <strong>{dscrValue.toFixed(2)}x</strong> means the income is {dscrValue >= 1 ? `${((dscrValue - 1) * 100).toFixed(0)}% above the break-even point` : `${((1 - dscrValue) * 100).toFixed(0)}% short of covering costs`}.
                    {dscrValue >= 1.25 ? " Most lenders are comfortable here." : dscrValue >= 1.0 ? " Most lenders require ≥1.25; consider increasing rent or reducing the loan." : " Below lender minimums — deal will likely not qualify as-is."}
                  </p>
                </div>
              </div>

              {/* Sensitivity matrix */}
              <div style={{ background: dc.white, borderRadius: dc.r.md, padding: 24, border: "1px solid rgba(0,55,56,0.1)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 4 }}>
                  Sensitivity table — Levered IRR
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.55)", margin: "0 0 14px", lineHeight: 1.5 }}>
                  How your IRR changes under different hold periods (rows) and rent-growth rates (columns). Teal cells (≥14%) are strong; amber is acceptable; red needs work. Your current inputs are the base case.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380, fontFamily: dc.mono }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "5px 10px", fontSize: 10, color: "rgba(0,55,56,0.45)", textAlign: "left", fontWeight: 500 }}>Hold</th>
                        {growths.map((gr) => (
                          <th key={gr} style={{ padding: "5px 10px", fontSize: 10, color: "rgba(0,55,56,0.45)", textAlign: "right", fontWeight: 500 }}>
                            +{gr}% rent growth
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holds.map((h) => (
                        <tr key={h} style={{ borderTop: "1px solid rgba(0,55,56,0.06)" }}>
                          <td style={{ padding: "8px 10px", fontSize: 12, color: dc.dark, fontWeight: 600 }}>
                            {h}yr{h === holdYears ? <span style={{ color: dc.lemon, marginLeft: 4, fontSize: 10 }}>← you</span> : ""}
                          </td>
                          {growths.map((gr) => {
                            const r = calcIRR({ ...irrOpts, holdYears: h, rentGrowth: gr }).irr * 100;
                            return (
                              <td key={gr} style={cellStyle(r)}>
                                {Number.isFinite(r) ? r.toFixed(1) + "%" : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                  {[
                    { color: "rgba(0,101,101,0.1)", border: dc.rain, label: "≥14% — strong" },
                    { color: "rgba(1,133,130,0.06)", border: "#018582", label: "10–14% — acceptable" },
                    { color: "transparent", border: "#9a7b00", label: "6–10% — marginal" },
                    { color: "transparent", border: RED, label: "<6% — weak" },
                  ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, background: l.color, border: `1.5px solid ${l.border}`, borderRadius: 2 }} />
                      <span style={{ fontSize: 11, color: "rgba(0,55,56,0.55)", fontWeight: 500 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yield stack — progressive disclosure */}
              <Disclosure label="Full return stack — cap rate, yield on cost, debt yield">
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { label: "Cap Rate (entry)", val: entryCapRate.toFixed(2) + "%", hint: "NOI ÷ purchase price. Good: ≥5% for most markets." },
                    { label: "Yield on Cost", val: yoc.toFixed(2) + "%", hint: "NOI ÷ total cost basis (including closing costs). Reflects true all-in yield." },
                    { label: "Debt Yield", val: debtYield.toFixed(2) + "%", hint: "NOI ÷ loan amount. Lenders typically require ≥8–10%." },
                    { label: "Cash-on-Cash (year 1)", val: coc.toFixed(1) + "%", hint: "After-debt cash flow ÷ cash invested. ≥8% = strong starting yield." },
                    { label: "Unlevered IRR", val: pct(unlIRR), hint: "IRR assuming no debt. Baseline return on the asset itself." },
                    { label: "Levered IRR", val: irrStr, hint: "Annualized return on your equity. ≥12% = strong on DSCR rentals." },
                    { label: "Equity Multiple", val: emStr, hint: "Total proceeds ÷ cash invested. 1.5× over 5yr ≈ 8.4% IRR." },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.07)", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: dc.dark }}>{row.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(0,55,56,0.45)", marginTop: 2, lineHeight: 1.4 }}>{row.hint}</div>
                      </div>
                      <Mono style={{ fontSize: 15, fontWeight: 700, color: dc.rain, whiteSpace: "nowrap" }}>{row.val}</Mono>
                    </div>
                  ))}
                </div>
              </Disclosure>

              {/* Disclaimer */}
              <p style={{ color: "rgba(0,55,56,0.45)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                Preliminary estimate — not a commitment to lend. IRR and equity multiple are model outputs; actual returns depend on market conditions, financing terms, vacancies and costs not captured here. Book a demo for a live scenario review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNNEL CTA ────────────────────────────────────────────────── */}
      <section style={{ background: dc.dark, padding: `clamp(56px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>
                Ready to move forward?
              </div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>
                Lock the numbers in. Get your rate.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch" }}>
                Submit once. Greenstreet places your file in the best-fit program and funds it — no re-keying the same numbers five times.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <a
                href="/rate-quiz"
                onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: dc.lemon, color: dc.dark, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: 6, whiteSpace: "nowrap" }}
              >
                Get my rate →
              </a>
              <a
                href="/deal-analyzer"
                onClick={(e) => { e.preventDefault(); onNavigate?.("deal-analyzer"); }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: 6, border: "1px solid rgba(238,239,211,0.25)", whiteSpace: "nowrap" }}
              >
                Full deal analyzer
              </a>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
