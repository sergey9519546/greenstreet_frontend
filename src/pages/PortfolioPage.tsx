import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, CountUp, useRevealOnView } from "../design/dc";
import { DscrGauge, RiskFlame, riskFromDscr } from "../design/artifacts";
import { analyzePortfolio, computePortfolioAggregates, computePortfolioHealthScore } from "../engine/portfolio";
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

const MAX_UI_VALUE = 1_000_000_000_000;

function finiteNonNegative(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(MAX_UI_VALUE, Math.max(0, value))
    : 0;
}

/** Monthly P&I for a 30-yr amortising loan */
function pi(balance: number, annualRate: number): number {
  const safeBalance = finiteNonNegative(balance);
  const safeRate = Math.min(1000, finiteNonNegative(annualRate));
  const r = safeRate / 100 / 12;
  if (r === 0) return safeBalance / 360;
  const payment = safeBalance * r / (1 - Math.pow(1 + r, -360));
  return Number.isFinite(payment) ? Math.min(MAX_UI_VALUE, payment) : 0;
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
      const value = finiteNonNegative(p.value);
      const balance = finiteNonNegative(p.balance);
      const rate = finiteNonNegative(p.rate);
      const rent = finiteNonNegative(p.rent);
      const pitiaExtra = finiteNonNegative(p.pitiaExtra);
      const piMo = pi(balance, rate);
      const pitia = Math.min(MAX_UI_VALUE, piMo + pitiaExtra);
      const dscr = pitia > 0 ? rent / pitia : 0;
      const cf = rent - pitia;
      const ltv = value > 0 ? (balance / value) * 100 : 0;
      return { ...p, value, balance, rate, rent, pitiaExtra, piMo, pitia, dscr, cf, ltv };
    }),
    [rows]
  );

  // ── Portfolio aggregates (blended) ────────────────────────────────────────
  const agg = useMemo(() => computePortfolioAggregates(computed), [computed]);

  // ── analyzePortfolio for rich signals ─────────────────────────────────────
  const portfolioResult = useMemo(() => {
    if (!agg.hasProperties) return null;
    try {
      const enriched = computed.map((c) => ({
        ...c,
        address: "",
        monthlyPITIA: c.pitia,
        track2DSCR: c.dscr * 0.9,
        isBlanket: false,
        purchasePrice: c.value,
        monthlyRent: c.rent,
      }));
      const borrower = buildEngineInputs({ purchasePrice: 400000, monthlyRent: 2800, state: "TX", ficoScore: 720 }).borrower;
      return analyzePortfolio(enriched as any, null, borrower, 50000);
    } catch {
      return null;
    }
  }, [agg.hasProperties, computed]);

  // ── Concentration lists ───────────────────────────────────────────────────
  const geoConc = useMemo(() => {
    if (!portfolioResult) return [];
    const m = new Map<string, number>();
    let tot = 0;
    for (const p of portfolioResult.properties) { if (p.state) { m.set(p.state, (m.get(p.state) ?? 0) + 1); tot++; } }
    return Array.from(m.entries()).map(([state, count]) => ({ state, count, pct: tot > 0 ? (count / tot) * 100 : 0 })).sort((a, b) => b.pct - a.pct);
  }, [portfolioResult]);

  // ── Portfolio health score ────────────────────────────────────────────────
  const healthScore = useMemo(() => {
    if (!portfolioResult || rows.length === 0) return null;
    return computePortfolioHealthScore(portfolioResult);
  }, [portfolioResult, rows.length]);

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
  const RED    = "#e06363";

  const blendColor = agg.blend >= 1.25 ? MINT : agg.blend >= 1.0 ? YELLOW : RED;
  const cashColor  = agg.totCash >= 0  ? MINT : RED;

  const blendStr  = agg.hasProperties ? agg.blend.toFixed(2) + "x" : "—";
  const equityStr = agg.hasProperties ? fmt(agg.equity) : "—";
  const cashStr   = agg.hasProperties ? (agg.totCash >= 0 ? "+" : "") + fmt(agg.totCash) : "—";
  const wRateStr  = agg.hasProperties ? agg.wRate.toFixed(2) + "%" : "—";

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
        { label: "Programs",      view: "lender-intel" },
        { label: "ARM Reset",     view: "arm-reset" },
      ]}
      cta={{ label: "Build portfolio →", onClick: scrollToTool }}
    >
      {/* Pistachio-nav ink overrides */}
      <style>{`
        .pf-in::-webkit-outer-spin-button,.pf-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .pf-in{width:68px;border:none;background:${dc.cream};outline:none;font-family:${dc.mono};color:${dc.dark};text-align:right;border-radius:5px;padding:6px 8px;font-size:13px;font-weight:600;}
        .pf-row:hover{background:rgba(0,55,56,0.03);}
        .dc-nav a{color:rgba(0,55,56,0.72) !important;}
        .dc-nav a.dc-cta{background:${dc.dark} !important;color:${dc.cream} !important;}
        .dc-nav{border-bottom:${PF_NAV_BORDER} !important;background:rgba(238,239,211,1) !important;}
        footer{color:rgba(0,55,56,0.55) !important;}
        footer div[style]{color:${dc.dark} !important;}
        .pf-hbar{transform-origin:bottom;}
        .pf-gbar{transform-origin:left;}
        @media (max-width:480px){
          #pf-tool{padding-left:12px !important;padding-right:12px !important;}
          .pf-stats,.pf-signals{grid-template-columns:1fr !important;}
          .pf-table-wrap{overflow:visible !important;}
          .pf-table{display:block;min-width:0 !important;width:100% !important;}
          .pf-table thead{display:none;}
          .pf-table tbody{display:block;width:100%;}
          .pf-table .pf-row{display:block;margin:10px;border:1px solid rgba(238,239,211,0.15);border-radius:10px;overflow:hidden;}
          .pf-table .pf-row td{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px !important;text-align:right !important;}
          .pf-table .pf-row td::before{content:attr(data-label);flex:0 0 78px;text-align:left;color:rgba(238,239,211,0.62);font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}
          .pf-table .pf-row input,.pf-table .pf-row select{width:min(150px,55vw) !important;max-width:100%;}
          .pf-table .pf-empty{display:block !important;width:auto !important;}
        }
      `}</style>

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
              <h1 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: 0, color: dc.cream }}>
                Blended DSCR{" "}
                {rows.length === 0 ? (
                  <Mono style={{ color: "rgba(238,239,211,0.3)" }}>—</Mono>
                ) : (
                  <CountUp value={agg.blend} decimals={2} suffix="x" style={{ color: blendColor }} />
                )}
                {rows.length > 0 && (
                  <>{" "}across {rows.length} door{rows.length !== 1 ? "s" : ""}</>
                )}
              </h1>
              {/* DscrGauge artifact — headline DSCR for the blended book */}
              {rows.length > 0 && (
                <DscrGauge value={agg.blend} size={80} label={false} />
              )}
            </div>
            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.62)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
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
            className="dc-band-2 pf-stats"
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
            {(() => {
              const big = (color: string) => ({ display: "block" as const, fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, letterSpacing: "-0.03em", color, lineHeight: 1 });
              return [
                { label: "Blended DSCR",     hint: "Combined rent ÷ combined payments. 1.25+ = strong; 1.0–1.24 = qualifies; below 1.0 = fix needed.", node: !agg.hasProperties ? <Mono style={big("rgba(238,239,211,0.3)")}>—</Mono> : <CountUp value={agg.blend} decimals={2} suffix="x" style={big(blendColor)} /> },
                { label: "Total Equity",      hint: "Sum of (property value minus loan balance) across all properties.", node: !agg.hasProperties ? <Mono style={big("rgba(238,239,211,0.3)")}>{equityStr}</Mono> : <CountUp value={agg.equity} group prefix="$" style={big(dc.cream)} /> },
                { label: "Monthly Cash Flow", hint: "Total rent minus total PITIA (full monthly payment including principal, interest, taxes, insurance, and fees) across all properties.", node: <Mono style={big(agg.hasProperties ? cashColor : "rgba(238,239,211,0.3)")}>{cashStr}</Mono> },
                { label: "Weighted Rate",     hint: "Average interest rate weighted by loan balance — the blended cost of your debt.", node: !agg.hasProperties ? <Mono style={big("rgba(238,239,211,0.3)")}>{wRateStr}</Mono> : <CountUp value={agg.wRate} decimals={2} suffix="%" style={big(dc.cream)} /> },
              ];
            })().map(({ label, hint, node }) => (
              <div key={label} style={{ background: dc.dark, padding: 26 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 8, lineHeight: 1.3 }}>{hint}</div>
                {node}
              </div>
            ))}
          </div>

          {/* Portfolio Health Score */}
          {healthScore !== null && (
            <div
              style={{
                background: dc.dark,
                borderRadius: dc.r.sm,
                padding: "20px 24px",
                marginBottom: 16,
                border: `1px solid ${dc.faded}`,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>Portfolio Health</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: healthScore.color }}>{healthScore.score}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: healthScore.color, letterSpacing: "0.06em" }}>{healthScore.label}</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                {/* Score bar */}
                <div style={{ height: 8, background: "rgba(238,239,211,0.1)", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${healthScore.score}%`, background: healthScore.color, borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
                {/* Breakdown pills */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "DSCR",          pts: healthScore.breakdown.dscrPts,          max: 40 },
                    { label: "Concentration", pts: healthScore.breakdown.concentrationPts, max: 20 },
                    { label: "Cash Flow",     pts: healthScore.breakdown.cashFlowPts,      max: 20 },
                    { label: "Reserves",      pts: healthScore.breakdown.reservePts,       max: 20 },
                  ].map(({ label, pts, max }) => (
                    <div key={label} style={{ fontSize: 11, fontWeight: 600, color: pts === max ? dc.lemon : pts === 0 ? "#e06363" : "#e6b84d", background: "rgba(238,239,211,0.07)", borderRadius: 4, padding: "3px 8px", letterSpacing: "0.03em" }}>
                      {label} {pts}/{max}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inline-editable property table */}
          <div
            style={{
              background: dc.dark,
              borderRadius: dc.r.lg,
              overflow: "clip",
              marginBottom: 16,
              border: `1px solid ${dc.faded}`,
            }}
          >
            <div className="pf-table-wrap" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table className="pf-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 780, color: dc.cream }}>
                <thead>
                  <tr>
                    {["Property", "Type", "Value", "Balance", "Rate %", "Rent/mo", "LTV", "DSCR", "Cash/mo", ""].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "12px 14px",
                          fontSize: 11,
                          color: "rgba(238,239,211,0.62)",
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
                      <td className="pf-empty" colSpan={10} style={{ padding: "40px 14px", textAlign: "center", color: "rgba(238,239,211,0.62)", fontSize: 14, fontWeight: 500 }}>
                        No properties yet — add one to see your blended DSCR.
                      </td>
                    </tr>
                  )}
                  {computed.map((c) => {
                    const rowDscrColor = c.dscr >= 1.25 ? MINT : c.dscr >= 1.0 ? YELLOW : RED;
                    const cc  = c.cf >= 0 ? MINT : RED;
                    return (
                      <tr key={c.id} className="pf-row" style={{ background: "transparent", transition: "background .12s" }}>
                        <td data-label="Property" style={{ padding: "7px 10px", borderBottom: `1px solid ${dc.faded}` }}>
                          <input type="text" aria-label={`Property name for row ${c.id}`} value={c.name} onChange={(e) => edit(c.id, "name", e.target.value)} placeholder="Property name"
                            style={{ width: 138, background: "transparent", border: "1px solid rgba(238,239,211,0.16)", borderRadius: 6, color: dc.cream, fontFamily: dc.sans, fontWeight: 600, fontSize: 14, padding: "7px 9px", outline: "none" }} />
                        </td>
                        <td data-label="Type" style={{ padding: "7px 10px", borderBottom: `1px solid ${dc.faded}` }}>
                          <select aria-label="Property type" value={c.propertyType} onChange={(e) => edit(c.id, "propertyType", e.target.value)}
                            style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.16)", borderRadius: 6, color: dc.cream, fontFamily: dc.sans, fontWeight: 500, fontSize: 13, padding: "7px 7px", outline: "none", cursor: "pointer" }}>
                            {["SFR", "2-4 unit", "Duplex", "Triplex", "4-plex", "5+ unit", "Condo", "Townhome", "STR / Airbnb"].map((t) => (
                              <option key={t} value={t} style={{ color: "#003738" }}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td data-label="Value" style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" aria-label="Property value" type="number" step={5000} value={c.value} onChange={(e) => edit(c.id, "value", e.target.value)} />
                        </td>
                        <td data-label="Balance" style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" aria-label="Loan balance" type="number" step={1000} value={c.balance} onChange={(e) => edit(c.id, "balance", e.target.value)} />
                        </td>
                        <td data-label="Rate" style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" aria-label="Note rate" type="number" step={0.125} value={c.rate} onChange={(e) => edit(c.id, "rate", e.target.value)} style={{ width: 56 }} />
                        </td>
                        <td data-label="Rent / mo" style={{ padding: "7px 10px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <input className="pf-in" aria-label="Monthly rent" type="number" step={100} value={c.rent} onChange={(e) => edit(c.id, "rent", e.target.value)} />
                        </td>
                        <td data-label="LTV" style={{ padding: "11px 14px", textAlign: "right", fontSize: 13, color: "rgba(238,239,211,0.62)", fontFamily: dc.mono, borderBottom: `1px solid ${dc.faded}` }}>
                          {c.ltv.toFixed(0)}%
                        </td>
                        <td data-label="DSCR" style={{ padding: "11px 14px", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <Mono style={{ fontSize: 14, fontWeight: 700, color: rowDscrColor }}>
                              {c.dscr.toFixed(2)}x
                            </Mono>
                            {c.dscr < 1.25 && <RiskFlame level={riskFromDscr(c.dscr)} size={14} />}
                          </span>
                        </td>
                        <td data-label="Cash / mo" style={{ padding: "11px 14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: cc, fontFamily: dc.mono, borderBottom: `1px solid ${dc.faded}` }}>
                          {(c.cf >= 0 ? "+" : "") + fmt(c.cf)}
                        </td>
                        <td data-label="Actions" style={{ padding: "11px 14px", borderBottom: `1px solid ${dc.faded}` }}>
                          <button
                            type="button"
                            aria-label={`Remove ${c.name}`}
                            onClick={() => removeRow(c.id)}
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
            className="dc-band-2 pf-signals"
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
              <p style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", margin: "0 0 12px", lineHeight: 1.4 }}>
                How entered properties are distributed across fixed model bands. Colors do not predict lender decisions or portfolio performance.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, alignItems: "end" }}>
                {[
                  { label: "LOW COVERAGE", range: "< 0.85", count: buckets.dealBreak,   color: RED,        riskLevel: "high" as const },
                  { label: "FRAGILE",    range: "0.85–1.0",  count: buckets.fragile,     color: RED,        riskLevel: "med" as const },
                  { label: "MARGINAL",   range: "1.0–1.25",  count: buckets.marginal,    color: dc.lemon,   riskLevel: "low" as const },
                  { label: "SOLID",      range: "1.25–1.5",  count: buckets.comfortable, color: dc.emerald, riskLevel: "none" as const },
                  { label: "HIGHER CUSHION", range: "≥ 1.5", count: buckets.safe,       color: dc.emerald, riskLevel: "none" as const },
                ].map((b, i) => (
                  <div key={b.label} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>{b.label}</div>
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
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>{b.range}</div>
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
              <p style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", margin: "0 0 12px", lineHeight: 1.4 }}>
                Concentration by state. The 30% and 50% color breaks are interface assumptions for comparing concentration, not lender limits or portfolio recommendations.
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
              {geoConc.length === 0 && <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 13 }}>No data.</p>}
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
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>Modeled refinance watchlist</div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 12px", lineHeight: 1.5 }}>
                These flags compare stored scenario rates and seasoning assumptions. They are not current quotes, refinance recommendations, eligibility decisions, or universal seasoning rules.
              </p>
              {portfolioResult.refiOpportunities.map((r) => {
                const action = r.seasoningMonthsRemaining <= 0 ? "REVIEW ASSUMPTIONS" : "MODELED SEASONING OPEN";
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
                      <div style={{ color: "rgba(238,239,211,0.62)", fontSize: 11, marginTop: 3 }}>
                        Modeled savings ${r.monthlySavings.toFixed(0)}/mo · entered {r.currentRate.toFixed(2)}% → stored scenario {r.projectedRate.toFixed(2)}%
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
          <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 12, marginTop: 24, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            Illustrative portfolio model only. Blended DSCR, cash flow, concentration bands, stored rates, seasoning, and refinance flags depend on entered and embedded assumptions. They are not approvals, recommendations, current quotes, or commitments to lend.
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
                Ready to finance your portfolio?
              </div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>
                Review a portfolio financing scenario.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch", letterSpacing: "-0.01em" }}>
                Bring the assumptions you modeled for a preliminary scenario review. Actual borrower, entity, property, income, reserve, credit, and documentation requirements vary by program.
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
                  border: "1.5px solid rgba(238,239,211,0.5)",
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
