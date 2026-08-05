import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, useRevealOnView, H1, Lead, Btn } from "../design/dc";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";
import { analyzePortfolio } from "../engine/portfolio";
import { buildEngineInputs } from "../engine/inputs";

// Portfolio page uses pistachio nav (matching its mockup body color)
const PF_ACCENT = "#eeefd3";
const PF_NAV_BORDER = "1px solid rgba(0,55,56,0.15)";

// ─── Types ────────────────────────────────────────────────────────────────────

type RawProperty = {
  id: string;
  name: string;
  propertyType: string;
  state: string;
  value: number;
  balance: number;
  rate: number;
  rent: number;
  /** Additional monthly obligations (taxes + insurance) */
  pitiaExtra: number;
  lender: string;
  yearAcquired: number;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: RawProperty[] = [
  { id: "P1", name: "Austin TX",   propertyType: "SFR",    state: "TX", value: 425000, balance: 306000, rate: 7.0,   rent: 3000, pitiaExtra: 850,  lender: "Prior loan", yearAcquired: 2023 },
  { id: "P2", name: "Tampa FL",    propertyType: "Duplex", state: "FL", value: 520000, balance: 364000, rate: 6.875, rent: 4200, pitiaExtra: 1100, lender: "Prior loan", yearAcquired: 2022 },
  { id: "P3", name: "Phoenix AZ",  propertyType: "SFR",    state: "AZ", value: 390000, balance: 304000, rate: 7.25,  rent: 2400, pitiaExtra: 780,  lender: "Prior loan", yearAcquired: 2022 },
  { id: "P4", name: "Memphis TN",  propertyType: "4-plex", state: "TN", value: 640000, balance: 435000, rate: 6.99,  rent: 5800, pitiaExtra: 1400, lender: "Prior loan", yearAcquired: 2021 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  (n < 0 ? "-$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-US");

/** Monthly P&I for a 30-yr amortising loan */
function pi(balance: number, annualRate: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return balance / 360;
  return (balance * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Portfolio Builder | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const [rows, setRows] = useState<RawProperty[]>(SEED);

  // ── Inline-edit helper ────────────────────────────────────────────────────
  function edit(id: string, key: keyof RawProperty, raw: string) {
    const num = parseFloat(raw);
    setRows((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: isNaN(num) ? raw : num } : p))
    );
  }

  function addRow() {
    const id = `P${rows.length + 1}`;
    setRows((prev) => [
      ...prev,
      { id, name: "New property", propertyType: "SFR", state: "TX", value: 400000, balance: 300000, rate: 7.0, rent: 2800, pitiaExtra: 800, lender: "Prior loan", yearAcquired: 2024 },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Per-row computed ──────────────────────────────────────────────────────
  const computed = useMemo(() =>
    rows.map((p) => {
      const piMo  = pi(p.balance, p.rate);
      const pitia = piMo + p.pitiaExtra;
      const dscr  = pitia > 0 ? p.rent / pitia : 0;
      const cf    = p.rent - pitia;
      const ltv   = p.value > 0 ? (p.balance / p.value) * 100 : 0;
      return { ...p, piMo, pitia, dscr, cf, ltv };
    }),
    [rows]
  );

  // ── Portfolio aggregates (blended) ────────────────────────────────────────
  const agg = useMemo(() => {
    let totRent = 0, totDebt = 0, totValue = 0, totBal = 0, totCash = 0, wRateNum = 0;
    for (const c of computed) {
      totRent   += c.rent;
      totDebt   += c.pitia;
      totValue  += c.value;
      totBal    += c.balance;
      totCash   += c.cf;
      wRateNum  += c.rate * c.balance;
    }
    const blend  = totDebt > 0 ? totRent / totDebt : 0;
    const equity = totValue - totBal;
    const wRate  = totBal  > 0 ? wRateNum / totBal : 0;
    return { blend, equity, totCash, wRate, totBal };
  }, [computed]);

  // ── analyzePortfolio for rich signals ─────────────────────────────────────
  const portfolioResult = useMemo(() => {
    try {
      const enriched = computed.map((c) => ({
        ...c,
        address: "",
        monthlyPITIA: c.pitia,
        loanBalance: c.balance,
        track2DSCR: c.pitia > 0 ? (c.rent * (1 - 0.08 - 0.08 - 0.05)) / c.pitia : 0,
        isBlanket: false,
        purchasePrice: c.value,
        monthlyRent: c.rent,
      }));
      const borrower = buildEngineInputs({ purchasePrice: 400000, monthlyRent: 2800, state: "TX", ficoScore: 720 }).borrower;
      return analyzePortfolio(enriched, null, borrower, 50000);
    } catch {
      return null;
    }
  }, [computed]);

  // ── Concentration lists ───────────────────────────────────────────────────
  const geoConc = useMemo(() => {
    if (!portfolioResult) return [];
    const m = new Map<string, number>();
    let tot = 0;
    for (const p of portfolioResult.properties) { if (p.state) { m.set(p.state, (m.get(p.state) ?? 0) + 1); tot++; } }
    return Array.from(m.entries()).map(([state, count]) => ({ state, count, pct: tot > 0 ? (count / tot) * 100 : 0 })).sort((a, b) => b.pct - a.pct);
  }, [portfolioResult]);

  // ── DSCR buckets ──────────────────────────────────────────────────────────
  const buckets = useMemo(() => {
    let dealBreak = 0, fragile = 0, marginal = 0, comfortable = 0, safe = 0;
    for (const c of computed) {
      if      (c.dscr < 0.85) dealBreak++;
      else if (c.dscr < 1.00) fragile++;
      else if (c.dscr < 1.25) marginal++;
      else if (c.dscr < 1.50) comfortable++;
      else                     safe++;
    }
    const max = Math.max(1, dealBreak, fragile, marginal, comfortable, safe);
    return { dealBreak, fragile, marginal, comfortable, safe, max };
  }, [computed]);

  // ── Colors ────────────────────────────────────────────────────────────────
  const MINT   = dc.emerald;
  const YELLOW = dc.lemon;
  const RED    = "#ff6b6b";

  const blendColor = agg.blend >= 1.25 ? MINT : agg.blend >= 1.0 ? YELLOW : RED;
  const cashColor  = agg.totCash >= 0  ? MINT : RED;

  const blendStr  = agg.blend.toFixed(2) + "x";
  const equityStr = fmt(agg.equity);
  const cashStr   = (agg.totCash >= 0 ? "+" : "") + fmt(agg.totCash);
  const wRateStr  = agg.wRate.toFixed(2) + "%";

  // Distribution + spread bars reveal on scroll-in
  const [barsRef, barsShown] = useRevealOnView<HTMLDivElement>();

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#pf-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={PF_ACCENT}
      navLinks={[
        { label: "DSCR Calc",     view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer" },
        { label: "ARM Reset",     view: "arm-reset" },
      ]}
      cta={{ label: "Build portfolio →", onClick: scrollToTool }}
    >
      {/* Pistachio-nav ink overrides */}
      <style>{`
        .pf-in::-webkit-outer-spin-button,.pf-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .pf-in{width:68px;border:none;background:${dc.cream};outline:none;font-family:${dc.mono};color:${dc.dark};text-align:right;border-radius:5px;padding:6px 8px;font-size:13px;font-weight:600;}
        .pf-in:focus-visible{outline:2px solid ${dc.lemon};outline-offset:2px;border-radius:3px;}
        .pf-row:hover{background:rgba(0,55,56,0.03);}
        .dc-nav a{color:rgba(0,55,56,0.72) !important;}
        .dc-nav a.dc-cta{background:${dc.dark} !important;color:${dc.cream} !important;}
        .dc-nav{border-bottom:${PF_NAV_BORDER} !important;background:rgba(238,239,211,1) !important;}
        footer{color:rgba(0,55,56,0.55) !important;}
        footer div[style]{color:${dc.dark} !important;}
        .pf-hbar{transform-origin:bottom;}
        .pf-gbar{transform-origin:left;}
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
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
          {/* Left */}
          <div id="gs-hero-content">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.dark,
                background: dc.lemon,
                padding: "7px 14px",
                borderRadius: 100,
                marginBottom: 24,
              }}
            >
              Portfolio · Blanket · Multi-property
            </div>
            <H1 style={{ margin: "0 0 28px" }}>
              What do the combined portfolio assumptions show?
            </H1>
            <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "46ch", margin: "0 0 20px" }}>
              Add your properties. The tool calculates a blended DSCR (whether the
              combined rent across all properties can cover the combined loan
              payments — 1.00 = break-even; higher is stronger), total equity,
              weighted average rate, and total monthly cash flow in one educational
              view. Provider analysis and blanket-loan availability are not evaluated.
            </Lead>
            <p style={{ color: "rgba(238,239,211,0.5)", fontSize: 14, fontWeight: 500, margin: "0 0 32px", lineHeight: 1.5 }}>
              Add or edit properties in the table below. All numbers compute live. A
              blended DSCR above 1.25x and positive cash flow puts you in strong shape
              for a blanket or multi-property DSCR loan.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Btn label="Open the portfolio builder ↓" href="#pf-tool" onClick={scrollToTool} />
              <Btn
                label="DSCR calculator"
                variant="secondary"
                onClick={(e) => { e.preventDefault(); onNavigate?.("dscr-calculator"); }}
              />
            </div>
          </div>

          {/* Right — 4-property preview cards with DscrGauge + RiskFlame */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {computed.slice(0, 4).map((c, idx) => {
              const cardDscrColor = dscrColor(c.dscr);
              const cardBg   = [dc.mintBg, dc.dark,  dc.lemon, "#006565"][idx % 4];
              const labelClr = [dc.rain,   "#4dbd97","rgba(0,55,56,0.6)", dc.lemon][idx % 4];
              const nameClr  = [dc.dark,   dc.cream, dc.dark,  dc.cream][idx % 4];
              const subClr   = ["rgba(0,55,56,0.5)", "rgba(238,239,211,0.5)", "rgba(0,55,56,0.6)", "rgba(238,239,211,0.6)"][idx % 4];
              const borderSt = idx === 1 ? `1px solid ${dc.faded}` : "none";
              return (
                <div
                  key={c.id}
                  style={{
                    background: cardBg,
                    border: borderSt,
                    borderRadius: dc.r.md,
                    padding: "16px 14px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: labelClr, marginBottom: 6 }}>
                    {c.propertyType} · {c.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Mono
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: idx === 0 ? cardDscrColor : nameClr,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                      }}
                    >
                      {c.dscr.toFixed(2)}x
                    </Mono>
                    {/* RiskFlame for weak-DSCR holdings */}
                    {c.dscr < 1.25 && (
                      <RiskFlame level={riskFromDscr(c.dscr)} size={16} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: subClr, marginTop: 2 }}>
                    LTV {c.ltv.toFixed(0)}% · {(c.cf >= 0 ? "+" : "") + fmt(c.cf)}/mo
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3-STEP BAND ──────────────────────────────────────────────────── */}
      <section style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "rgba(0,55,56,0.12)",
              borderRadius: dc.r.md,
              overflow: "hidden",
            }}
          >
            {/* 01 */}
            <div style={{ background: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, letterSpacing: "-0.03em", color: dc.lemon, marginBottom: 14, lineHeight: 1 }}>01</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Add your properties</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.6)", margin: 0, letterSpacing: "-0.01em" }}>
                Enter each property's value, loan balance, interest rate, and monthly rent. Edit every field inline — click any number to change it.
              </p>
            </div>
            {/* 02 */}
            <div style={{ background: dc.dark, color: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, letterSpacing: "-0.03em", color: dc.emerald, marginBottom: 14, lineHeight: 1 }}>02</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1, color: dc.cream }}>See the blended picture</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, letterSpacing: "-0.01em" }}>
                Blended DSCR (combined rent ÷ combined payments), total equity, weighted rate, and monthly cash flow recompute live as you edit.
              </p>
            </div>
            {/* 03 */}
            <div style={{ background: dc.lemon, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, letterSpacing: "-0.03em", color: "rgba(0,55,56,0.5)", marginBottom: 14, lineHeight: 1 }}>03</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Prepare questions for provider review</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.65)", margin: 0, letterSpacing: "-0.01em" }}>
                Use the blended view to inspect assumptions and prepare questions. It is not an application, underwriting package, or statement that blanket structures are available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ─────────────────────────────────────────────────────────── */}
      <section
        id="pf-tool"
        style={{
          background: dc.teal,
          color: dc.cream,
          padding: `clamp(52px,7vw,92px) clamp(1.5rem,4vw,3rem) clamp(64px,9vh,116px)`,
          borderTop: `1px solid ${dc.faded}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* Section header with live DscrGauge */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>
              Live portfolio aggregator
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", marginBottom: 10 }}>
              <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: 0, color: dc.cream }}>
                Blended DSCR{" "}
                <Mono style={{ color: rows.length === 0 ? "rgba(238,239,211,0.3)" : blendColor }}>
                  {rows.length === 0 ? "—" : blendStr}
                </Mono>
                {rows.length > 0 && (
                  <>{" "}across {rows.length} door{rows.length !== 1 ? "s" : ""}</>
                )}
              </h2>
              {/* DscrGauge artifact — headline DSCR for the blended book */}
              {rows.length > 0 && (
                <DscrGauge value={agg.blend} size={80} label={false} />
              )}
            </div>
            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.55)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              {rows.length === 0
                ? "Add your first property to see the blended DSCR."
                : agg.blend >= 1.25
                ? `Blended DSCR of ${blendStr} is strong — the portfolio's combined rent comfortably covers all loan payments. This is a favorable position for blanket or multi-property financing with Greenstreet.`
                : agg.blend >= 1.0
                ? `Blended DSCR of ${blendStr} qualifies but is close to the minimum. Consider improving cash-flow on weaker properties or paying down balances before applying.`
                : `Blended DSCR of ${blendStr} is below 1.0 — the combined rent does not fully cover loan payments. Address the red-DSCR properties in the table below before submitting.`}
            </p>
          </div>

          {/* 4-stat strip */}
          <div
            className="dc-band-2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "1px",
              background: dc.faded,
              borderRadius: dc.r.sm,
              overflow: "hidden",
              marginBottom: 28,
            }}
          >
            {[
              { label: "Blended DSCR",     hint: "Combined rent ÷ combined payments. 1.25+ = strong; 1.0–1.24 = qualifies; below 1.0 = fix needed.", val: rows.length === 0 ? "—" : blendStr, color: rows.length === 0 ? "rgba(238,239,211,0.3)" : blendColor },
              { label: "Total Equity",      hint: "Sum of (property value minus loan balance) across all properties.", val: equityStr, color: dc.cream },
              { label: "Monthly Cash Flow", hint: "Total rent minus total PITIA (full monthly payment including principal, interest, taxes, insurance, and fees) across all properties.", val: cashStr, color: cashColor },
              { label: "Weighted Rate",     hint: "Average interest rate weighted by loan balance — the blended cost of your debt.", val: wRateStr, color: dc.cream },
            ].map(({ label, hint, val, color }) => (
              <div key={label} style={{ background: dc.dark, padding: 26 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.38)", marginBottom: 8, lineHeight: 1.3 }}>{hint}</div>
                <Mono style={{ display: "block", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, letterSpacing: "-0.03em", color, lineHeight: 1 }}>{val}</Mono>
              </div>
            ))}
          </div>

          {/* Inline-editable property table */}
          <div
            style={{
              background: dc.dark,
              borderRadius: dc.r.lg,
              overflow: "hidden",
              marginBottom: 16,
              border: `1px solid ${dc.faded}`,
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780, color: dc.cream }}>
                <thead>
                  <tr>
                    {["Property", "Type", "Value", "Balance", "Rate %", "Rent/mo", "LTV", "DSCR", "Cash/mo", ""].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "12px 14px",
                          fontSize: 11,
                          color: "rgba(238,239,211,0.42)",
                          textAlign: i >= 2 && i < 9 ? "right" : "left",
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
                  {computed.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: "40px 14px", textAlign: "center", color: "rgba(238,239,211,0.4)", fontSize: 14, fontWeight: 500 }}>
                        No properties yet — add one to see your blended DSCR.
                      </td>
                    </tr>
                  )}
                  {computed.map((c) => {
                    const rowDscrColor = c.dscr >= 1.25 ? MINT : c.dscr >= 1.0 ? YELLOW : RED;
                    const cc  = c.cf >= 0 ? MINT : RED;
                    return (
                      <tr key={c.id} className="pf-row" style={{ background: "transparent", transition: "background .12s" }}>
                        <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 600, color: dc.cream, borderBottom: `1px solid ${dc.faded}` }}>{c.name}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(238,239,211,0.5)", borderBottom: `1px solid ${dc.faded}` }}>{c.propertyType}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" type="number" step={5000} value={c.value} onChange={(e) => edit(c.id, "value", e.target.value)} />
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" type="number" step={1000} value={c.balance} onChange={(e) => edit(c.id, "balance", e.target.value)} />
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" type="number" step={0.125} value={c.rate} onChange={(e) => edit(c.id, "rate", e.target.value)} style={{ width: 56 }} />
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" type="number" step={100} value={c.rent} onChange={(e) => edit(c.id, "rent", e.target.value)} />
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "right", fontSize: 13, color: "rgba(238,239,211,0.5)", fontFamily: dc.mono, borderBottom: `1px solid ${dc.faded}` }}>
                          {c.ltv.toFixed(0)}%
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <Mono style={{ fontSize: 14, fontWeight: 700, color: rowDscrColor }}>
                              {c.dscr.toFixed(2)}x
                            </Mono>
                            {c.dscr < 1.25 && <RiskFlame level={riskFromDscr(c.dscr)} size={14} />}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: cc, fontFamily: dc.mono, borderBottom: `1px solid ${dc.faded}` }}>
                          {(c.cf >= 0 ? "+" : "") + fmt(c.cf)}
                        </td>
                        <td style={{ padding: "11px 14px", borderBottom: `1px solid ${dc.faded}` }}>
                          <button
                            onClick={() => removeRow(c.id)}
                            aria-label={`Remove ${c.name || "property"}`}
                            style={{ background: "none", border: "1px solid rgba(211,47,47,0.35)", color: "#d32f2f", borderRadius: dc.r.sm, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: dc.sans }}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add property */}
          <button
            onClick={addRow}
            style={{
              background: dc.lemon,
              color: dc.dark,
              border: "none",
              fontFamily: dc.sans,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "-0.01em",
              padding: "12px 22px",
              borderRadius: dc.r.sm,
              cursor: "pointer",
            }}
          >
            + Add property
          </button>

          {/* ── Secondary signals ─────────────────────────────────────────── */}
          <div
            ref={barsRef}
            className="dc-band-2"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 36 }}
          >
            {/* DSCR buckets histogram */}
            <div
              style={{
                background: "rgba(238,239,211,0.06)",
                borderRadius: dc.r.md,
                padding: 24,
                border: `1px solid ${dc.faded}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>DSCR distribution</div>
              <p style={{ fontSize: 11, color: "rgba(238,239,211,0.4)", margin: "0 0 12px", lineHeight: 1.4 }}>
                How the properties are spread across modeled DSCR buckets. Colors describe payment coverage, not lender approval or decline behavior.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, alignItems: "end" }}>
                {[
                  { label: "DEAL BREAK", range: "< 0.85",   count: buckets.dealBreak,   color: RED,        riskLevel: "high" as const },
                  { label: "FRAGILE",    range: "0.85–1.0",  count: buckets.fragile,     color: RED,        riskLevel: "med" as const },
                  { label: "MARGINAL",   range: "1.0–1.25",  count: buckets.marginal,    color: dc.lemon,   riskLevel: "low" as const },
                  { label: "SOLID",      range: "1.25–1.5",  count: buckets.comfortable, color: dc.emerald, riskLevel: "none" as const },
                  { label: "SAFE",       range: "≥ 1.5",     count: buckets.safe,        color: dc.emerald, riskLevel: "none" as const },
                ].map((b, i) => (
                  <div key={b.label} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.5)", marginBottom: 4 }}>{b.label}</div>
                    {/* RiskFlame — weak-DSCR holdings indicator */}
                    <div style={{ marginBottom: 4, minHeight: 18 }}>
                      {b.count > 0 && b.riskLevel !== "none" && (
                        <RiskFlame level={b.riskLevel} size={14} />
                      )}
                    </div>
                    <div style={{ height: 60, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
                      <div
                        className="pf-hbar"
                        style={{
                          width: 24,
                          height: `${Math.max(b.count > 0 ? 7 : 0, (b.count / buckets.max) * 100)}%`,
                          background: b.color,
                          opacity: b.count === 0 ? 0.18 : 1,
                          borderRadius: "3px 3px 0 0",
                          transform: barsShown ? "scaleY(1)" : "scaleY(0)",
                          transition: `transform .55s cubic-bezier(.16,1,.3,1) ${0.12 + i * 0.08}s`,
                        }}
                      />
                    </div>
                    <Mono style={{ display: "block", fontSize: 22, fontWeight: 700, color: b.color, lineHeight: 1 }}>{b.count}</Mono>
                    <div style={{ fontSize: 9, color: "rgba(238,239,211,0.4)", marginTop: 3 }}>{b.range}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic spread */}
            <div
              style={{
                background: "rgba(238,239,211,0.06)",
                borderRadius: dc.r.md,
                padding: 24,
                border: `1px solid ${dc.faded}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>Geographic spread</div>
              <p style={{ fontSize: 11, color: "rgba(238,239,211,0.4)", margin: "0 0 12px", lineHeight: 1.4 }}>
                A descriptive view of concentration by state. The color threshold is illustrative and does not represent a provider rule or preference.
              </p>
              {geoConc.slice(0, 5).map((g, i) => {
                const barColor = g.pct > 50 ? RED : g.pct > 30 ? dc.lemon : dc.emerald;
                return (
                  <div key={g.state} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: dc.cream, fontWeight: 700 }}>{g.state}</span>
                      <Mono style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{g.pct.toFixed(0)}%</Mono>
                    </div>
                    <div style={{ height: 5, background: "rgba(238,239,211,0.12)", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        className="pf-gbar"
                        style={{
                          height: "100%",
                          width: `${Math.min(100, g.pct)}%`,
                          background: barColor,
                          transform: barsShown ? "scaleX(1)" : "scaleX(0)",
                          transition: `transform .6s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.07}s, width .3s`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {geoConc.length === 0 && <p style={{ color: "rgba(238,239,211,0.4)", fontSize: 13 }}>No data.</p>}
            </div>
          </div>

          {/* Refi opportunities */}
          {portfolioResult && portfolioResult.refiOpportunities.length > 0 && (
            <div
              style={{
                background: "rgba(238,239,211,0.06)",
                borderRadius: dc.r.sm,
                padding: 24,
                border: `1px solid ${dc.faded}`,
                marginTop: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>Refinance opportunities</div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.45)", margin: "0 0 12px", lineHeight: 1.5 }}>
                These properties may benefit from a rate-and-term refinance based on estimated current rates. "REFINANCE NOW" means seasoning (the minimum time a loan must be held before refinancing) is complete. "MONITOR" means the seasoning period is still running.
              </p>
              {portfolioResult.refiOpportunities.map((r) => {
                const action = r.seasoningMonthsRemaining <= 0 ? "REFINANCE NOW" : "MONITOR";
                const actionColor = r.seasoningMonthsRemaining <= 0 ? dc.emerald : dc.lemon;
                return (
                  <div
                    key={r.propertyId}
                    style={{
                      padding: "10px 0",
                      borderBottom: `1px solid ${dc.faded}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div style={{ color: dc.cream, fontWeight: 700, fontSize: 14 }}>{r.propertyId}</div>
                      <div style={{ color: "rgba(238,239,211,0.5)", fontSize: 11, marginTop: 3 }}>
                        Save ${r.monthlySavings.toFixed(0)}/mo · {r.currentRate.toFixed(2)}% → {r.projectedRate.toFixed(2)}%
                        {r.seasoningMonthsRemaining > 0 ? ` · ${r.seasoningMonthsRemaining} mo seasoning left` : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: actionColor }}>{action}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Disclaimer */}
          <p style={{ color: "rgba(238,239,211,0.38)", fontSize: 12, marginTop: 24, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            Educational estimate only. Blended DSCR and portfolio aggregates reflect entered assumptions and do not provide a quote, program match, approval, underwriting result, or commitment.
          </p>
        </div>
      </section>

      {/* ── FUNNEL CTA ───────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
          borderTop: `1px solid ${dc.faded}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 32,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>
                Ready to review your portfolio assumptions?
              </div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>
                Organize the portfolio in one educational view.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch", letterSpacing: "-0.01em" }}>
                Blanket and multi-property financing depends on provider rules and
                transaction facts. Bring the view you just built and
                we'll tell you where it fits.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              {/* Dominant lemon CTA */}
              <a
                href="/rate-quiz"
                onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  padding: "14px 28px",
                  borderRadius: dc.r.md,
                  whiteSpace: "nowrap",
                }}
              >
                Get my portfolio rate →
              </a>
              {/* Secondary — transparent + 1.5px FADED */}
              <a
                href="/dscr-calculator"
                onClick={(e) => { e.preventDefault(); onNavigate?.("dscr-calculator"); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  padding: "14px 28px",
                  borderRadius: dc.r.md,
                  border: `1.5px solid ${dc.faded}`,
                  whiteSpace: "nowrap",
                }}
              >
                Run a single deal
              </a>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
