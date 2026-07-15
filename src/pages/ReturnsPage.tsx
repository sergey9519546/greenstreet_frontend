import React, { useState, useRef, useCallback } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn, useRevealOnView } from "../design/dc";
import { computeRemainingBalance, computeReturns } from "../engine/returnsEngine";
import type { PropertyInputs, LoanStructure } from "../engine/types";
import { DscrGauge, RiskFlame, riskFromDscr } from "../design/artifacts";

// ─── helpers ──────────────────────────────────────────────────────────────────
const RED    = "#e06363";
const ORANGE = "#e6b84d";
const CAPEX_RESERVE_PCT = 5;

function ioMonths(ioPeriod: LoanStructure["ioPeriod"]): number {
  if (ioPeriod === "5_YR") return 60;
  if (ioPeriod === "7_YR") return 84;
  if (ioPeriod === "10_YR") return 120;
  return 0;
}

function fmt$(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// Inline IRR bisection — matches engine cash-flow model (OPEX 15%, mgmt+maint+turnover).
// Used for the headline and sensitivity matrix so every user-editable input is honored.
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
  closingCosts: number;
  ioPeriod: LoanStructure["ioPeriod"];
}): number {
  const { purchasePrice, ltv, rate, monthlyRent, annualTaxes, annualInsurance, hoa, holdYears, exitCapRate, rentGrowth, vacancy, prepayAtExit, closingCosts, ioPeriod } = opts;
  if (![purchasePrice, ltv, rate, monthlyRent, annualTaxes, annualInsurance, hoa, holdYears, exitCapRate, rentGrowth, vacancy, prepayAtExit, closingCosts].every(Number.isFinite) || exitCapRate <= 0) return NaN;
  const loan    = purchasePrice * (ltv / 100);
  const cashInv = purchasePrice - loan + closingCosts;
  if (cashInv <= 0) return NaN;
  const r       = rate / 100 / 12;
  const n       = 360;
  const io       = ioMonths(ioPeriod);
  const amortN   = n - io;
  const piMo     = r === 0
    ? loan / amortN
    : (loan * r * Math.pow(1 + r, amortN)) / (Math.pow(1 + r, amortN) - 1);
  const debtForYear = (year: number) => {
    let total = 0;
    for (let month = (year - 1) * 12 + 1; month <= year * 12; month++) {
      total += month <= io ? loan * r : piMo;
    }
    return total;
  };

  const remBal = (elapsed: number) => {
    if (elapsed <= io) return loan;
    if (elapsed >= n) return 0;
    const amortElapsed = elapsed - io;
    if (r === 0) return loan * (1 - amortElapsed / amortN);
    const f = Math.pow(1 + r, amortN);
    const e = Math.pow(1 + r, amortElapsed);
    return Math.max(0, (loan * (f - e)) / (f - 1));
  };

  const OPEX_PCT = 15;
  const hold = Math.max(1, Math.min(15, holdYears));
  const cfs: number[] = [-cashInv];

  const noiForYear = (yrOffset: number) => {
    const gross = monthlyRent * 12 * Math.pow(1 + rentGrowth / 100, yrOffset);
    const egi   = gross * (1 - vacancy / 100);
    const noi = egi - annualTaxes - annualInsurance - hoa * 12 - gross * (OPEX_PCT / 100);
    const capex = egi * (CAPEX_RESERVE_PCT / 100);
    return { noi, capex };
  };

  for (let yr = 1; yr <= hold; yr++) {
    const { noi, capex } = noiForYear(yr - 1);
    let cf = noi - capex - debtForYear(yr);
    if (yr === hold) {
      const stabNOI = noiForYear(yr).noi;
      const exit    = stabNOI / (exitCapRate / 100);
      const bal     = remBal(hold * 12);
      cf += exit - exit * 0.06 - bal - bal * (prepayAtExit / 100);
    }
    cfs.push(cf);
  }

  const f = (rate_: number) => cfs.reduce((s, c, i) => s + c / Math.pow(1 + rate_, i), 0);
  let lo = -0.9, hi = 5;
  const flo = f(lo);
  if (flo * f(hi) > 0) return NaN; // no sign change ⇒ no real IRR root
  let curFlo = flo;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    const fm = f(m);
    if (Math.abs(fm) < 1) return m;
    if (curFlo * fm < 0) { hi = m; }
    else { lo = m; curFlo = fm; }
  }
  return (lo + hi) / 2;
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
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>
          {label}
        </span>
        <Mono style={{ fontSize: 14, fontWeight: 700, color: dc.cream }}>
          {prefix}{display}{suffix}
        </Mono>
      </div>
      <input className="gs-range" aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
      {hint && (
        <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.4 }}>
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
    <div style={{ borderRadius: dc.r.sm, border: "1px solid rgba(238,239,211,0.12)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "13px 18px", background: "rgba(238,239,211,0.04)", border: "none", cursor: "pointer",
          fontFamily: dc.sans, fontSize: 12, fontWeight: 600, color: dc.lemon,
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }}>
          <path d="M4 6l4 4 4-4" stroke={dc.lemon} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "16px 18px 18px", borderTop: "1px solid rgba(238,239,211,0.08)" }}>
          {children}
        </div>
      )}
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
      <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", textAlign: "center", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ─── Returns journey — the signature viz (replaces the generic bar trio) ──────
// Cumulative cash from day one: you put the down payment in (negative), collect
// cash flow each year, then the sale returns the rest. The line crossing $0 is
// when your capital is back; the final point is total profit. Built from the same
// inputs the IRR uses — a projection, not a forecast.
type JPoint = { year: number; cum: number; exit?: boolean };
function buildJourney(o: {
  purchasePrice: number; ltv: number; rate: number; monthlyRent: number; annualTaxes: number;
  annualInsurance: number; hoa: number; holdYears: number; exitCapRate: number; rentGrowth: number; vacancy: number; prepayAtExit: number;
  closingCosts: number; ioPeriod: LoanStructure["ioPeriod"];
}): JPoint[] {
  const loan = o.purchasePrice * (o.ltv / 100);
  const cashInv = o.purchasePrice - loan + o.closingCosts;
  const r = o.rate / 100 / 12;
  const io = ioMonths(o.ioPeriod);
  const amortN = 360 - io;
  const pmt = r === 0 ? loan / amortN : (loan * r * Math.pow(1 + r, amortN)) / (Math.pow(1 + r, amortN) - 1);
  const fixed = o.annualTaxes + o.annualInsurance + o.hoa * 12;
  let cum = -cashInv, bal = loan;
  const pts: JPoint[] = [{ year: 0, cum }];
  const hold = Math.max(1, Math.round(o.holdYears));
  for (let y = 1; y <= hold; y++) {
    const gross = o.monthlyRent * 12 * Math.pow(1 + o.rentGrowth / 100, y - 1);
    const egi = gross * (1 - o.vacancy / 100);
    const noi = egi - fixed - gross * 0.15;
    const capex = egi * (CAPEX_RESERVE_PCT / 100);
    let annualDS = 0;
    for (let m = (y - 1) * 12 + 1; m <= y * 12; m++) {
      const interest = bal * r;
      const monthPmt = m <= io ? loan * r : pmt;
      annualDS += monthPmt;
      if (m > io) bal = Math.max(0, bal - (pmt - interest));
    }
    cum += noi - capex - annualDS;
    if (y === hold) {
      const exitVal = o.exitCapRate > 0 ? noi / (o.exitCapRate / 100) : 0;
      const net = exitVal - exitVal * 0.07 - Math.max(0, bal) - (o.prepayAtExit / 100) * Math.max(0, bal);
      cum += net;
      pts.push({ year: y, cum, exit: true });
    } else {
      pts.push({ year: y, cum });
    }
  }
  return pts;
}
function ReturnsJourney({ pts }: { pts: JPoint[] }) {
  const W = 470, H = 290, padL = 16, padR = 16, padT = 30, padB = 30;
  if (pts.length < 2) return null;
  const xmax = pts[pts.length - 1].year || 1;
  const vals = pts.map((p) => p.cum);
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  const pad = (hi - lo) * 0.14 || 1;
  const yMin = lo - pad, yMax = hi + pad;
  const X = (y: number) => padL + (y / xmax) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - padT - padB);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${X(p.year).toFixed(1)} ${Y(p.cum).toFixed(1)}`).join(" ");
  const area = `M ${X(0).toFixed(1)} ${Y(0).toFixed(1)} ` + pts.map((p) => `L ${X(p.year).toFixed(1)} ${Y(p.cum).toFixed(1)}`).join(" ") + ` L ${X(xmax).toFixed(1)} ${Y(0).toFixed(1)} Z`;
  const last = pts[pts.length - 1];
  const up = last.cum >= 0;
  const fmtk = (v: number) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(v / 1000)) + "k";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }} role="img" aria-label="Cumulative return over the hold period">
      <line x1={padL} x2={W - padR} y1={Y(0)} y2={Y(0)} stroke="rgba(238,239,211,0.5)" strokeWidth="1" strokeDasharray="4 5" />
      <text x={W - padR} y={Y(0) - 6} textAnchor="end" fill="rgba(238,239,211,0.5)" fontSize="10" fontFamily="'JetBrains Mono',monospace">break-even $0</text>
      <path d={area} fill={up ? "rgba(77,189,151,0.16)" : "rgba(224,99,99,0.16)"} />
      <path d={line} fill="none" stroke={up ? dc.lemon : RED} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.year)} cy={Y(p.cum)} r={p.exit ? 6 : i === 0 ? 5 : 3} fill={i === 0 ? RED : p.exit ? dc.lemon : dc.emerald} stroke={dc.dark} strokeWidth="1.6" />
          <text x={X(p.year)} y={H - 10} textAnchor="middle" fill="rgba(238,239,211,0.42)" fontSize="9" fontFamily="'JetBrains Mono',monospace">Y{p.year}</text>
        </g>
      ))}
      <text x={X(0) + 6} y={Y(pts[0].cum) + 16} textAnchor="start" fill={RED} fontSize="11" fontWeight={700} fontFamily="'JetBrains Mono',monospace">{fmtk(pts[0].cum)} down</text>
      <text x={X(last.year)} y={Y(last.cum) - 22} textAnchor="end" fill="rgba(238,239,211,0.62)" fontSize="9" fontFamily="'JetBrains Mono',monospace">exit · total</text>
      <text x={X(last.year)} y={Y(last.cum) - 8} textAnchor="end" fill={up ? dc.lemon : RED} fontSize="14" fontWeight={800} fontFamily="'JetBrains Mono',monospace">{fmtk(last.cum)}</text>
    </svg>
  );
}

// ─── sensitivity cell heat color ─────────────────────────────────────────────
function cellStyle(r: number): React.CSSProperties {
  const color = r >= 14 ? dc.emerald : r >= 10 ? dc.lemon : r >= 6 ? ORANGE : RED;
  const bg    = r >= 14 ? "rgba(77,189,151,0.14)" : r >= 10 ? "rgba(216,217,88,0.08)" : "transparent";
  return { padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 700, color, background: bg, borderRadius: 4 };
}

// ─── main component ───────────────────────────────────────────────────────────
export default function ReturnsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  React.useEffect(() => { document.title = "Returns & IRR | Greenstreet Finance"; }, []);

  // ── inputs ────────────────────────────────────────────────────────────────
  const [purchasePrice,   setPurchasePrice]   = useState(400000);
  const [ltv,             setLtv]             = useState(75);
  const [rate,            setRate]            = useState(6.75);
  const [monthlyRent,     setMonthlyRent]     = useState(3300);
  const [annualTaxes,     setAnnualTaxes]     = useState(4200);
  const [annualInsurance, setAnnualInsurance] = useState(1600);
  const [hoa,             setHoa]             = useState(0);
  const [holdYears,       setHoldYears]       = useState(5);
  const [exitCapRate,     setExitCapRate]      = useState(5.75);
  const [rentGrowth,      setRentGrowth]      = useState(4);
  const [vacancy,         setVacancy]         = useState(5);
  const [prepayAtExit,    setPrepayAtExit]    = useState(2);
  const [closingCosts,    setClosingCosts]    = useState(12000);
  const [ioPeriod,        setIoPeriod]        = useState<LoanStructure["ioPeriod"]>("NONE");

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
  const engineResult = React.useMemo(() => {
    try {
      const property: PropertyInputs = {
        purchasePrice, leaseRent: monthlyRent, marketRent: monthlyRent,
        strProjectedRent: 0, strDocumentedRent: 0, hoa,
        annualTaxes, annualInsurance, floodInsurance: 0,
        propertyType: "SFR", state: "TX", unitCount: 1, sqft: 1500, yearBuilt: 2000,
        isCondotel: false, isNonWarrantable: false, isRural: false, isDecliningMarket: false, hoaSTRPolicy: "UNKNOWN",
      };
      const loan: LoanStructure = {
        ltv, term: "30_YR", ioPeriod, armType: "FIXED", prepayPreference: "321",
        purpose: "PURCHASE", expectedHoldYears: holdYears, points: 0, lenderFees: 0, brokerFees: 0, rateLockCost: 0,
      };
      const loanAmount = purchasePrice * (ltv / 100);
      const balanceAtExit = computeRemainingBalance(loanAmount, rate, 360, holdYears * 12, ioMonths(ioPeriod));
      const penalty = (prepayAtExit / 100) * balanceAtExit;
      return computeReturns(property, loan, monthlyRent, "LTR", rate, penalty, purchasePrice - loanAmount + closingCosts);
    } catch { return null; }
  }, [purchasePrice, ltv, monthlyRent, rate, holdYears, rentGrowth, vacancy, annualTaxes, annualInsurance, hoa, prepayAtExit, closingCosts, ioPeriod]);

  // ── derived ───────────────────────────────────────────────────────────────
  const irrOpts = { purchasePrice, ltv, rate, monthlyRent, annualTaxes, annualInsurance, hoa, holdYears, exitCapRate, rentGrowth, vacancy, prepayAtExit, closingCosts, ioPeriod };

  const levIRR = calcIRR(irrOpts) * 100;
  const unlIRR = calcIRR({ ...irrOpts, ltv: 0 }) * 100;

  const cashInv = purchasePrice * (1 - ltv / 100) + closingCosts;
  const em      = engineResult !== null ? engineResult.equityMultiple : 1;

  const pct  = (v: number) => (Number.isFinite(v) ? v.toFixed(1) + "%" : "—");
  const irrStr     = pct(levIRR);
  const emStr      = em.toFixed(2) + "x";
  const irrColor   = levIRR >= 12 ? dc.emerald : levIRR >= 8 ? dc.lemon : RED;

  // verdict
  const verdictLabel = levIRR >= 12 ? "UPPER MODEL BAND" : levIRR >= 8 ? "MIDDLE MODEL BAND" : Number.isFinite(levIRR) ? "LOWER MODEL BAND" : "—";
  const verdictText  = levIRR >= 12
    ? "Modeled IRR is above the interface's 12% comparison band. This is not a risk-adjusted suitability conclusion."
    : levIRR >= 8
    ? "Modeled IRR is within the interface's 8-12% comparison band. The band is not a market standard or recommendation."
    : Number.isFinite(levIRR)
    ? "Modeled IRR is below the interface's 8% comparison band. Review the assumptions and sensitivity range without treating the result as advice."
    : "Adjust inputs to compute your IRR.";

  // engine returns (already %)
  const entryCapRate = engineResult !== null ? engineResult.entryCapRate       : 0;
  const yoc          = engineResult !== null ? engineResult.yieldOnCost        : 0;
  const debtYield    = engineResult !== null ? engineResult.debtYield          : 0;
  const coc          = engineResult !== null ? engineResult.year1CashOnCash    : 0;

  // DSCR for the gauge (NOI / annual debt service)
  const annualNOI  = entryCapRate > 0 ? purchasePrice * (entryCapRate / 100) : 0;
  const r_         = rate / 100 / 12;
  const loan_      = purchasePrice * (ltv / 100);
  const ioMonths_ = ioMonths(ioPeriod);
  const amortMonths_ = 360 - ioMonths_;
  const piMoCalc = ioMonths_ > 0
    ? loan_ * r_
    : r_ === 0
    ? loan_ / amortMonths_
    : (loan_ * r_ * Math.pow(1 + r_, amortMonths_)) / (Math.pow(1 + r_, amortMonths_) - 1);
  const annualPITIA = piMoCalc * 12;
  const dscrValue   = annualPITIA > 0 ? annualNOI / annualPITIA : 1.5;
  const dscrRisk    = riskFromDscr(dscrValue);

  // returns journey (cumulative cash over the hold) — the hero's signature viz
  const journeyPts = buildJourney(irrOpts);
  let beYear = "—";
  for (let i = 1; i < journeyPts.length; i++) {
    if (journeyPts[i - 1].cum < 0 && journeyPts[i].cum >= 0) { beYear = "Yr " + journeyPts[i].year; break; }
  }
  if (beYear === "—") beYear = journeyPts[journeyPts.length - 1].cum >= 0 ? "Yr 0" : "—";

  // sensitivity grid
  const holds   = [3, 5, 7, 10, 12];
  const growths = [1, 2, 3, 4];

  const [gaugeRef, gaugeShown] = useRevealOnView<HTMLDivElement>();

  return (
    <DcShell onNavigate={onNavigate} accent={dc.dark}
      navLinks={[{ label: "DSCR", view: "dscr-calculator" }, { label: "Monte Carlo", view: "monte-carlo" }]}
      cta={{ label: "Compute IRR →", onClick: scrollToTool }}
    >
      <style>{`
        .rt-input-panel{min-width:0;}
        @media(max-width:640px){ .rt-metric-grid{grid-template-columns:1fr 1fr !important;} .rt-input-panel{padding:20px !important;} }
        @media(max-width:400px){ .rt-metric-grid{grid-template-columns:1fr !important;} }
      `}</style>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", background: dc.dark, color: dc.cream,
        overflow: "hidden", minHeight: "clamp(440px,56vh,620px)",
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
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>Levered IRR</div>
                <Mono style={{ fontSize: "clamp(40px,5vw,64px)", fontWeight: 600, letterSpacing: "-0.04em", color: irrColor, lineHeight: 0.95, display: "block" }}>
                  {irrStr}
                </Mono>
              </div>
              <div style={{ width: 1, height: 48, background: "rgba(238,239,211,0.15)" }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>Verdict</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", color: irrColor }}>{verdictLabel}</span>
                  <RiskFlame level={levIRR < 8 ? "med" : levIRR < 12 ? "low" : "none"} size={18} />
                </div>
              </div>
            </div>
            <Lead style={{ color: "rgba(238,239,211,0.65)", maxWidth: "46ch", margin: "0 0 20px" }}>
              Cash-on-cash return (yearly cash flow as a % of the cash you put in), IRR (the annualized return on your equity, accounting for the full exit), and equity multiple — from day one through the sale.
            </Lead>
            <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 13, fontWeight: 500, margin: "0 0 32px", lineHeight: 1.5 }}>
            Adjust inputs on the left and use the sensitivity table to compare how the model changes under different rent-growth and hold-period assumptions.
            </p>
            <Btn label="Run the returns engine ↓" href="#rt-tool" onClick={scrollToTool} />
          </div>

          {/* right — the returns journey (cumulative cash over the hold) */}
          <div style={{ background: dc.teal, border: "1px solid rgba(238,239,211,0.16)", borderRadius: dc.r.lg, padding: "clamp(20px,2.4vw,28px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.emerald }}>Your money over the hold</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(238,239,211,0.62)" }}><span style={{ width: 12, height: 3, background: dc.lemon, borderRadius: 2, display: "inline-block" }} />cumulative cash</span>
            </div>
            <ReturnsJourney pts={journeyPts} />
            <p style={{ fontSize: 12.5, color: "rgba(238,239,211,0.6)", margin: "14px 0 16px", lineHeight: 1.55 }}>
              The model assumes <strong style={{ color: dc.cream }}>{"$" + Math.round(cashInv).toLocaleString("en-US")}</strong> of initial equity, annual modeled cash flow, and a sale in year {holdYears}. The break-even crossing and final profit are projections from those inputs, not promised outcomes.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, borderTop: "1px solid rgba(238,239,211,0.16)", paddingTop: 16 }}>
              {[
                { l: "Cash-on-cash", v: coc.toFixed(1) + "%", c: dc.emerald },
                { l: "Equity multiple", v: emStr, c: dc.cream },
                { l: "Capital back", v: beYear, c: dc.lemon },
              ].map((m) => (
                <div key={m.l}>
                  <Mono style={{ fontSize: 20, fontWeight: 700, color: m.c, display: "block", lineHeight: 1 }}>{m.v}</Mono>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginTop: 5 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ──────────────────────────────────────────────────────── */}
      <section id="rt-tool" style={{ background: dc.dark, padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* section header + live verdict */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>
              Live returns engine
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 12px", color: dc.cream }}>
              Levered IRR <span style={{ color: irrColor }}>{irrStr}</span> · {emStr} equity multiple
            </h2>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              background: levIRR >= 12 ? "rgba(77,189,151,0.1)" : levIRR >= 8 ? "rgba(216,217,88,0.1)" : "rgba(224,99,99,0.08)",
              border: `1px solid ${levIRR >= 12 ? "rgba(77,189,151,0.25)" : levIRR >= 8 ? "rgba(216,217,88,0.25)" : "rgba(224,99,99,0.2)"}`,
              borderRadius: dc.r.sm, padding: "14px 18px", maxWidth: 660,
            }}>
              <RiskFlame level={levIRR < 8 ? "med" : levIRR < 12 ? "low" : "none"} size={20} />
              <p style={{ fontSize: 14, fontWeight: 500, color: dc.cream, margin: 0, lineHeight: 1.5 }}>
                {verdictText}
              </p>
            </div>
          </div>

          {/* grid: inputs | results */}
          <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 32, alignItems: "start" }}>

            {/* ── INPUTS ─────────────────────────────────────────────── */}
            <div className="rt-input-panel" style={{ background: dc.teal, borderRadius: dc.r.md, padding: 28, border: "1px solid rgba(238,239,211,0.16)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                Deal inputs
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 18px", lineHeight: 1.5 }}>
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

              <div style={{ borderTop: "1px solid rgba(238,239,211,0.16)", margin: "18px 0" }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 14 }}>
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
                  <SliderField label="Closing costs" hint="Cash paid at acquisition in addition to the down payment." value={closingCosts} set={setClosingCosts} min={0} max={150000} step={500} prefix="$" fmt={(v) => v.toLocaleString("en-US")} />
                  <SliderField label="Prepay penalty at exit %" hint="Applied to the remaining loan balance." value={prepayAtExit} set={setPrepayAtExit} min={0} max={5} step={0.5} suffix="%" fmt={(v) => v.toFixed(1)} />
                  <label style={{ display: "block", marginTop: 14 }}>
                    <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 5 }}>Interest-only period</span>
                    <select value={ioPeriod} onChange={(e) => setIoPeriod(e.target.value as LoanStructure["ioPeriod"])} style={{ width: "100%", minWidth: 0, padding: "11px 12px", borderRadius: 6, border: "1px solid rgba(238,239,211,0.16)", background: dc.dark, color: dc.cream, fontFamily: dc.sans }}>
                      <option value="NONE">None</option>
                      <option value="5_YR">5 years</option>
                      <option value="7_YR">7 years</option>
                      <option value="10_YR">10 years</option>
                    </select>
                  </label>
                </div>
              </Disclosure>
            </div>

            {/* ── RESULTS ────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Big IRR card — centered headline + symmetric metric grid */}
              <div style={{
                background: dc.dark, borderRadius: dc.r.md, padding: "clamp(24px,3vw,40px)",
              }}>
                <div style={{ textAlign: "center", paddingBottom: "clamp(20px,2.4vw,28px)", marginBottom: "clamp(20px,2.4vw,28px)", borderBottom: "1px solid rgba(238,239,211,0.16)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 6 }}>
                    Levered IRR
                  </div>
                  <Mono style={{ fontSize: "clamp(56px,8vw,104px)", fontWeight: 600, letterSpacing: "-0.04em", color: irrColor, lineHeight: 0.9, display: "block" }}>
                    {irrStr}
                  </Mono>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: irrColor }}>
                      {verdictLabel}
                    </span>
                    <RiskFlame level={levIRR < 8 ? "med" : levIRR < 12 ? "low" : "none"} size={16} />
                  </div>
                </div>
                <div className="rt-metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
            { label: "Cash-on-Cash Return", val: coc.toFixed(1) + "%", color: coc >= 8 ? dc.emerald : dc.lemon, hint: "Modeled year-one cash flow / modeled cash invested" },
                    { label: "Unlevered IRR", val: pct(unlIRR), color: dc.cream, hint: "IRR if you paid all cash — no loan" },
                    { label: "Equity Multiple", val: emStr, color: dc.emerald, hint: "Total cash returned ÷ cash invested" },
                    { label: "Cash Invested", val: fmt$(cashInv), color: dc.cream, hint: "Down payment plus entered closing costs" },
                    { label: "Cap Rate (entry)", val: entryCapRate.toFixed(2) + "%", color: dc.cream, hint: "Net operating income ÷ purchase price" },
                    { label: "Debt Yield", val: debtYield.toFixed(2) + "%", color: dc.cream, hint: "Net income ÷ loan amount (lender metric)" },
                  ].map((r) => (
                    <div key={r.label} style={{ background: "rgba(238,239,211,0.05)", borderRadius: dc.r.sm, padding: 13 }}>
                      <Mono style={{ fontSize: "clamp(16px,1.8vw,22px)", fontWeight: 600, letterSpacing: "-0.02em", color: r.color, display: "block" }}>
                        {r.val}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2, lineHeight: 1.3 }}>{r.hint}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DSCR gauge — shows debt coverage quality */}
              <div ref={gaugeRef} style={{
                background: dc.teal, borderRadius: dc.r.md, padding: "22px 24px",
                border: "1px solid rgba(238,239,211,0.16)",
                display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center",
                opacity: gaugeShown ? 1 : 0, transform: gaugeShown ? "none" : "translateY(8px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}>
                <DscrGauge value={Math.max(0.5, Math.min(2.0, dscrValue))} size={120} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon }}>
                      DSCR at entry
                    </div>
                    <RiskFlame level={dscrRisk} size={15} />
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.6)", margin: 0, lineHeight: 1.5 }}>
                    DSCR (debt-service coverage ratio) measures whether the property's net income covers the full loan payment. <strong>{dscrValue.toFixed(2)}x</strong> means the income is {dscrValue >= 1 ? `${((dscrValue - 1) * 100).toFixed(0)}% above the break-even point` : `${((1 - dscrValue) * 100).toFixed(0)}% short of covering costs`}.
              {dscrValue >= 1.25 ? " This is the model's upper coverage band." : dscrValue >= 1.0 ? " This is the model's middle coverage band." : " Entered rent is below the modeled payment; lender treatment is not determined here."}
                  </p>
                </div>
              </div>

              {/* Sensitivity matrix */}
              <div style={{ background: dc.teal, borderRadius: dc.r.md, padding: 24, border: "1px solid rgba(238,239,211,0.16)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>
                  Sensitivity table — Levered IRR
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.5 }}>
            How modeled IRR changes under different hold periods and rent-growth assumptions. Colors are comparison bands selected by this interface, not investment ratings. Your current inputs are the base case.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380, fontFamily: dc.mono }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "5px 10px", fontSize: 11, color: "rgba(238,239,211,0.62)", textAlign: "left", fontWeight: 500 }}>Hold</th>
                        {growths.map((gr) => (
                          <th key={gr} style={{ padding: "5px 10px", fontSize: 11, color: "rgba(238,239,211,0.62)", textAlign: "right", fontWeight: 500 }}>
                            +{gr}% rent growth
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holds.map((h) => (
                        <tr key={h} style={{ borderTop: "1px solid rgba(238,239,211,0.08)" }}>
                          <td style={{ padding: "8px 10px", fontSize: 12, color: dc.cream, fontWeight: 600 }}>
                            {h}yr{h === holdYears ? <span style={{ color: dc.lemon, marginLeft: 4, fontSize: 11 }}>← you</span> : ""}
                          </td>
                          {growths.map((gr) => {
                            const r = calcIRR({ ...irrOpts, holdYears: h, rentGrowth: gr }) * 100;
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
                    { color: "rgba(77,189,151,0.14)", border: dc.emerald, label: "≥14% — strong" },
                    { color: "rgba(216,217,88,0.08)", border: dc.lemon, label: "10–14% — acceptable" },
                    { color: "transparent", border: ORANGE, label: "6–10% — marginal" },
                    { color: "transparent", border: RED, label: "<6% — weak" },
                  ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, background: l.color, border: `1.5px solid ${l.border}`, borderRadius: 2 }} />
                      <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", fontWeight: 500 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yield stack — progressive disclosure */}
              <Disclosure label="Full return stack — cap rate, yield on cost, debt yield">
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
              { label: "Cap Rate (entry)", val: entryCapRate.toFixed(2) + "%", hint: "Modeled NOI / purchase price; no universal target is assumed" },
                    { label: "Yield on Cost", val: yoc.toFixed(2) + "%", hint: "NOI ÷ total cost basis (including closing costs). Reflects true all-in yield." },
                    { label: "Debt Yield", val: debtYield.toFixed(2) + "%", hint: "NOI ÷ loan amount. Lenders typically require ≥8–10%." },
                    { label: "Cash-on-Cash (year 1)", val: coc.toFixed(1) + "%", hint: "After-debt cash flow ÷ cash invested. ≥8% = strong starting yield." },
                    { label: "Unlevered IRR", val: pct(unlIRR), hint: "IRR assuming no debt. Baseline return on the asset itself." },
              { label: "Levered IRR", val: irrStr, hint: "Modeled annualized return on equity under the entered cash flows" },
                    { label: "Equity Multiple", val: emStr, hint: "Total proceeds ÷ cash invested. 1.5× over 5yr ≈ 8.4% IRR." },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.08)", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: dc.cream }}>{row.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2, lineHeight: 1.4 }}>{row.hint}</div>
                      </div>
                      <Mono style={{ fontSize: 15, fontWeight: 700, color: dc.lemon, whiteSpace: "nowrap" }}>{row.val}</Mono>
                    </div>
                  ))}
                </div>
              </Disclosure>

              {/* Disclaimer */}
              <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            Illustrative return model only, not investment, tax, legal, or lending advice. IRR and equity multiple depend on the entered financing, 15% operating-expense assumption, 5% of effective gross income CapEx reserve, vacancy, rent growth, exit cap rate, sale timing, prepayment input, closing costs, and other omitted costs. Actual outcomes can differ materially.
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
              Review the financing assumptions.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch" }}>
                Submit once. Greenstreet places your file in the best-fit program and funds it — no re-keying the same numbers five times.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
            <Btn label="Review my scenario" href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} />
              <Btn label="See matching programs" variant="secondary" href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }} />
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
