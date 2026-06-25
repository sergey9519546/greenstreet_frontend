import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";
import { computeStressMatrix, classifyRiskZone } from "../engine/stressMatrix";
import type { PropertyInputs, LoanStructure, StressRiskZone } from "../engine/types";

// ── Mint accent — the Stress Matrix colour identity ──────────────────────────
// Hero section background: #e8e9bf (mint).  Nav stays midnight for contrast.
const MINT = "#e8e9bf";
const DARK_INK = "#003738";

export default function StressMatrixPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Stress Matrix | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // ── Inputs ──────────────────────────────────────────────────
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct, setDownPct] = useState(25);
  const [baseRate, setBaseRate] = useState(7.0);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

  // ── Engine computation ───────────────────────────────────────
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
      const loan: LoanStructure = {
        ltv: 100 - downPct,
        term: "30_YR",
        ioPeriod: "NONE",
        armType: "FIXED",
        prepayPreference: "NONE",
        purpose: "PURCHASE",
        expectedHoldYears: 5,
        points: 0,
        lenderFees: 0,
        brokerFees: 0,
        rateLockCost: 0,
      };
      return computeStressMatrix(property, loan, "LTR", baseRate, monthlyRent);
    } catch {
      return null;
    }
  }, [purchasePrice, downPct, baseRate, monthlyRent, annualTaxes, annualInsurance, hoa]);

  // ── Derived display values ───────────────────────────────────
  const baseDSCR = result?.baseTrack1DSCR ?? 0;
  const safeCount = (result?.zoneCounts.SAFE ?? 0) + (result?.zoneCounts.COMFORTABLE ?? 0);
  const breakCount = result?.zoneCounts.DEAL_BREAK ?? 0;

  // Cell background + ink colors matching the mockup's exact palette
  function cellStyle(zone: StressRiskZone, isBaseCell: boolean): React.CSSProperties {
    const styles: Record<StressRiskZone, { bg: string; ink: string }> = {
      SAFE:        { bg: dc.rain,                   ink: dc.cream },
      COMFORTABLE: { bg: dc.emerald,                ink: dc.dark  },
      MARGINAL:    { bg: "rgba(216,217,88,0.85)",   ink: dc.dark  },
      FRAGILE:     { bg: "rgba(249,115,22,0.85)",   ink: "#fff"   },
      DEAL_BREAK:  { bg: "rgba(255,107,107,0.9)",   ink: "#fff"   },
    };
    const { bg, ink } = styles[zone];
    return {
      borderRadius: 4,
      background: bg,
      color: ink,
      fontSize: 10.5,
      fontWeight: 700,
      fontFamily: dc.mono,
      textAlign: "center",
      padding: "6px 3px",
      outline: isBaseCell ? `2px solid ${dc.lemon}` : "none",
    };
  }

  // ── Preview cells for the hero mini-heatmap (4 rows × 10 cols = 40 cells) ──
  const previewCells = useMemo(() => {
    const RENT_OFFSETS = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20];
    const BPS_ROWS = [-50, 0, 50, 100];
    const loan = purchasePrice * (1 - downPct / 100);
    const fixed = annualTaxes / 12 + annualInsurance / 12;
    function pi(loanAmt: number, rate: number, months: number) {
      const r = rate / 100 / 12;
      if (r === 0) return loanAmt / months;
      return (loanAmt * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    }
    const cells: { bg: string; ink: string; v: string }[] = [];
    BPS_ROWS.forEach((bps) => {
      RENT_OFFSETS.forEach((rp) => {
        const rate = Math.max(0.5, baseRate + bps / 100);
        const piAmt = pi(loan, rate, 360);
        const d = piAmt + fixed > 0 ? (monthlyRent * (1 + rp / 100)) / (piAmt + fixed) : 0;
        const zone = classifyRiskZone(d);
        const { bg, ink } = {
          SAFE:        { bg: dc.rain,                 ink: dc.cream },
          COMFORTABLE: { bg: dc.emerald,              ink: dc.dark  },
          MARGINAL:    { bg: "rgba(216,217,88,0.85)", ink: dc.dark  },
          FRAGILE:     { bg: "rgba(249,115,22,0.85)", ink: "#fff"   },
          DEAL_BREAK:  { bg: "rgba(255,107,107,0.9)", ink: "#fff"   },
        }[zone];
        cells.push({ bg, ink, v: d.toFixed(1) });
      });
    });
    return cells;
  }, [purchasePrice, downPct, baseRate, monthlyRent, annualTaxes, annualInsurance]);

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#sm-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  // ── Legend data ──────────────────────────────────────────────
  const legend: { zone: StressRiskZone; label: string; color: string }[] = [
    { zone: "SAFE",        label: "SAFE ≥1.50",       color: dc.rain    },
    { zone: "COMFORTABLE", label: "COMFORTABLE ≥1.25", color: dc.emerald },
    { zone: "MARGINAL",    label: "MARGINAL ≥1.00",    color: "#d8d958"  },
    { zone: "FRAGILE",     label: "FRAGILE ≥0.85",     color: "#f97316"  },
    { zone: "DEAL_BREAK",  label: "DEAL_BREAK <0.85",  color: "#ff6b6b"  },
  ];

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer" },
      ]}
      cta={{ label: "Run stress test →", onClick: scrollToTool }}
    >
      {/* Spinner suppression — the one allowed local style */}
      <style>{`
        .sm-num::-webkit-outer-spin-button,.sm-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .sm-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};letter-spacing:-0.02em;}
        .sm-cell-mini{aspect-ratio:1;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:${dc.mono};font-size:9px;font-weight:700;}
      `}</style>

      {/* ── HERO — mint background, dark ink ─────────────────── */}
      <section
        style={{
          position: "relative",
          background: MINT,
          overflow: "hidden",
          minHeight: "clamp(480px,60vh,760px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Dot grid — dark dots on mint */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px,transparent 1px)",
            backgroundSize: "34px 34px",
            pointerEvents: "none",
          }}
        />
        {/* Radial accent blob */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "-5%",
            width: "50%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(0,101,101,0.09),transparent 70%)",
            pointerEvents: "none",
          }}
        />
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
          {/* Left — hero copy on mint */}
          <div id="gs-hero-content">
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#006565",
                marginBottom: 22,
              }}
            >
              Stress Matrix &middot; 12&times;10 grid &middot; 5 risk zones
            </div>
            <h1
              style={{
                fontSize: "clamp(46px,7vw,108px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: "0 0 28px",
                color: DARK_INK,
              }}
            >
              See every stress scenario in one view.
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(0,55,56,0.65)",
                maxWidth: "48ch",
                margin: "0 0 36px",
              }}
            >
              120 cells. Rate shocks &minus;150 to +200bps. Rent shocks &minus;25% to +20%. Five risk zones from SAFE to DEAL_BREAK.
            </p>
            <a
              href="#sm-tool"
              onClick={scrollToTool}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: DARK_INK,
                color: MINT,
                fontWeight: 600,
                fontSize: 16,
                textDecoration: "none",
                padding: "15px 30px",
                borderRadius: 6,
              }}
            >
              Open the matrix ↓
            </a>
          </div>

          {/* Right — live mini heatmap (4×10 preview grid) */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: 5,
                background: DARK_INK,
                borderRadius: 14,
                padding: 14,
              }}
            >
              {previewCells.map((c, i) => (
                <div
                  key={i}
                  className="sm-cell-mini"
                  style={{ background: c.bg, color: c.ink }}
                >
                  {c.v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-STEP BAND (from mockup §59–68) ─────────────────── */}
      <section
        className="gs-reveal"
        style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "rgba(0,55,56,0.12)",
              borderRadius: 9,
              overflow: "hidden",
            }}
          >
            <div style={{ background: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.lemon, marginBottom: 14, lineHeight: 1 }}>01</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Base deal</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.6)", margin: 0 }}>
                Set price, rate, rent, taxes, insurance. The base scenario anchors the matrix center.
              </p>
            </div>
            <div style={{ background: dc.dark, color: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.emerald, marginBottom: 14, lineHeight: 1 }}>02</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1, color: dc.cream }}>120 cells</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0 }}>
                12 rate offsets &times; 10 rent offsets. Every cell recomputes live DSCR as you type.
              </p>
            </div>
            <div style={{ background: dc.lemon, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: "rgba(0,55,56,0.5)", marginBottom: 14, lineHeight: 1 }}>03</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>5 zones</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.65)", margin: 0 }}>
                SAFE to DEAL_BREAK color-coded instantly. Hover any cell for the exact DSCR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL SECTION ─────────────────────────────────────── */}
      <section
        id="sm-tool"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header — live headline from real engine */}
          <div className="gs-reveal" style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>
              Live stress matrix
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: 0, color: dc.cream }}>
              Base:{" "}
              <Mono style={{ color: dc.lemon }}>{baseDSCR.toFixed(2)}x</Mono>
              {" · "}
              <span style={{ color: dc.emerald }}>{(result?.zoneCounts.SAFE ?? 0) + (result?.zoneCounts.COMFORTABLE ?? 0)} SAFE</span>
              {" · "}
              <span style={{ color: "#ff6b6b" }}>{result?.zoneCounts.DEAL_BREAK ?? 0} DEAL_BREAK</span>
            </h2>
          </div>

          <div
            className="gs-reveal dc-split"
            style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 36, alignItems: "start" }}
          >
            {/* ── INPUTS (sticky sidebar) ─────────────────────── */}
            <div
              style={{
                background: dc.teal,
                borderRadius: 9,
                padding: 26,
                position: "sticky",
                top: 96,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 20 }}>
                Base deal
              </div>

              <InputField label="Purchase Price" prefix="$">
                <input
                  className="sm-num"
                  type="number"
                  step={5000}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(+e.target.value)}
                  style={inputStyle}
                />
              </InputField>

              <InputField label="Down %" suffix="%">
                <input
                  className="sm-num"
                  type="number"
                  step={1}
                  min={20}
                  max={50}
                  value={downPct}
                  onChange={(e) => setDownPct(+e.target.value)}
                  style={inputStyle}
                />
              </InputField>

              <InputField label="Base Rate" suffix="%">
                <input
                  className="sm-num"
                  type="number"
                  step={0.125}
                  value={baseRate}
                  onChange={(e) => setBaseRate(+e.target.value)}
                  style={inputStyle}
                />
              </InputField>

              <InputField label="Monthly Rent" prefix="$">
                <input
                  className="sm-num"
                  type="number"
                  step={100}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(+e.target.value)}
                  style={inputStyle}
                />
              </InputField>

              <InputField label="Annual Taxes" prefix="$">
                <input
                  className="sm-num"
                  type="number"
                  step={250}
                  value={annualTaxes}
                  onChange={(e) => setAnnualTaxes(+e.target.value)}
                  style={inputStyle}
                />
              </InputField>

              <InputField label="Annual Insurance" prefix="$">
                <input
                  className="sm-num"
                  type="number"
                  step={100}
                  value={annualInsurance}
                  onChange={(e) => setAnnualInsurance(+e.target.value)}
                  style={inputStyle}
                />
              </InputField>

              <InputField label="Monthly HOA" prefix="$">
                <input
                  className="sm-num"
                  type="number"
                  step={25}
                  value={hoa}
                  onChange={(e) => setHoa(+e.target.value)}
                  style={inputStyle}
                />
              </InputField>

              {/* Zone summary */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.5)", marginBottom: 3 }}>SAFE</div>
                  <Mono style={{ fontSize: 20, fontWeight: 600, color: dc.emerald }}>{safeCount}</Mono>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.5)", marginBottom: 3 }}>DEAL_BREAK</div>
                  <Mono style={{ fontSize: 20, fontWeight: 600, color: "#ff6b6b" }}>{breakCount}</Mono>
                </div>
              </div>
            </div>

            {/* ── HEATMAP ──────────────────────────────────────── */}
            <div>
              {!result ? (
                <div style={{ padding: 40, textAlign: "center", color: "#ff6b6b", background: "rgba(255,107,107,0.08)", borderRadius: 9, border: "1px solid rgba(255,107,107,0.3)" }}>
                  Engine returned no result. Check inputs.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(238,239,211,0.4)",
                      marginBottom: 10,
                      fontFamily: dc.mono,
                      letterSpacing: "0.03em",
                    }}
                  >
                    DOWN = rate offset bps &middot; ACROSS = rent offset %
                  </div>

                  {/* Heatmap table */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "separate", borderSpacing: 2, minWidth: 580 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "4px 8px", fontSize: 10, color: "rgba(238,239,211,0.4)", textAlign: "left", fontFamily: dc.mono, fontWeight: 500 }}>
                            bps
                          </th>
                          {result.rentAxis.map((rp) => (
                            <th
                              key={rp}
                              style={{ padding: "4px 3px", fontSize: 10, color: "rgba(238,239,211,0.4)", textAlign: "center", fontFamily: dc.mono, fontWeight: 500 }}
                            >
                              {rp > 0 ? "+" : ""}{rp}%
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.cells.map((row, ri) => {
                          const ratePct = result.rateAxis[ri];
                          const offsetBps = Math.round((ratePct - result.baseRate) * 100);
                          const isBaseRow = Math.abs(ratePct - result.baseRate) < 0.001;
                          return (
                            <tr key={ri}>
                              <td
                                style={{
                                  padding: "2px 8px",
                                  fontSize: 10,
                                  color: isBaseRow ? dc.lemon : "rgba(238,239,211,0.4)",
                                  fontFamily: dc.mono,
                                  fontWeight: isBaseRow ? 700 : 500,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {offsetBps > 0 ? "+" : offsetBps === 0 ? "±" : ""}{offsetBps}bps
                              </td>
                              {row.map((cell, ci) => {
                                const isBaseCell = isBaseRow && Math.abs(cell.rentOffsetPct) < 0.001;
                                return (
                                  <td key={ci} style={{ padding: 2 }} title={cell.interpretation}>
                                    <div style={cellStyle(cell.riskZone, isBaseCell)}>
                                      {cell.track1DSCR.toFixed(2)}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 16 }}>
                    {legend.map(({ label, color }) => (
                      <div
                        key={label}
                        style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)" }}
                      >
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block", flexShrink: 0 }} />
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Summary text */}
                  <div
                    style={{
                      marginTop: 20,
                      padding: "14px 18px",
                      background: "rgba(238,239,211,0.06)",
                      borderRadius: 8,
                      border: "1px solid rgba(238,239,211,0.12)",
                      fontSize: 12,
                      color: "rgba(238,239,211,0.6)",
                      lineHeight: 1.6,
                      fontFamily: dc.mono,
                    }}
                  >
                    {result.summary}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ── Local helpers ─────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: "10px 6px",
  fontSize: 15,
  fontWeight: 600,
  color: "#eeefd3",
};

function InputField({
  label,
  prefix,
  suffix,
  children,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "rgba(238,239,211,0.55)",
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#003738",
          borderRadius: 6,
          padding: "0 11px",
          border: "1px solid rgba(238,239,211,0.10)",
        }}
      >
        {prefix && <span style={{ color: "rgba(238,239,211,0.4)", flexShrink: 0 }}>{prefix}</span>}
        {children}
        {suffix && <span style={{ color: "rgba(238,239,211,0.4)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </label>
  );
}
