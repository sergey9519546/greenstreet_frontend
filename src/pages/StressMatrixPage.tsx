import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, HeroProof } from "../design/dc";
import { computeStressMatrix, classifyRiskZone } from "../engine/stressMatrix";
import type { PropertyInputs, LoanStructure, StressRiskZone } from "../engine/types";

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

  // Chip color for HeroProof based on base DSCR zone
  const baseZone: StressRiskZone = classifyRiskZone(baseDSCR);
  const zoneChipColor: Record<StressRiskZone, string> = {
    SAFE: dc.emerald,
    COMFORTABLE: dc.emerald,
    MARGINAL: dc.lemon,
    FRAGILE: "#f97316",
    DEAL_BREAK: "#ff6b6b",
  };
  const chipColor = zoneChipColor[baseZone];

  // Cell background + ink colors matching the mockup's exact palette
  function cellStyle(zone: StressRiskZone, isBaseCell: boolean): React.CSSProperties {
    const styles: Record<StressRiskZone, { bg: string; ink: string }> = {
      SAFE:       { bg: dc.rain,             ink: dc.cream },
      COMFORTABLE:{ bg: dc.emerald,          ink: dc.dark  },
      MARGINAL:   { bg: "rgba(216,217,88,0.85)", ink: dc.dark },
      FRAGILE:    { bg: "rgba(249,115,22,0.85)", ink: "#fff"  },
      DEAL_BREAK: { bg: "rgba(255,107,107,0.9)", ink: "#fff"  },
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

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#sm-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  // ── Legend data ──────────────────────────────────────────────
  const legend: { zone: StressRiskZone; label: string; color: string }[] = [
    { zone: "SAFE",       label: "SAFE ≥1.50",       color: dc.rain    },
    { zone: "COMFORTABLE",label: "COMFORTABLE ≥1.25", color: dc.emerald },
    { zone: "MARGINAL",   label: "MARGINAL ≥1.00",    color: "#d8d958"  },
    { zone: "FRAGILE",    label: "FRAGILE ≥0.85",     color: "#f97316"  },
    { zone: "DEAL_BREAK", label: "DEAL_BREAK <0.85",  color: "#ff6b6b"  },
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
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
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
          {/* Left — stagger fires on id="gs-hero-content" */}
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
              Stress Matrix &middot; 12&times;10 grid &middot; 5 risk zones
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
              See every
              <br />
              stress scenario
              <br />
              at once.
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
              120 cells. Rate shocks &minus;150 to +200bps. Rent shocks &minus;25% to +20%.
              Five risk zones from SAFE to DEAL_BREAK, computed live.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
              <a
                href="#sm-tool"
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
                Open the matrix ↓
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate?.("dscr-calculator"); }}
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
            {/* Stat row — count-up */}
            <div style={{ display: "flex", gap: "clamp(24px,4vw,52px)", flexWrap: "wrap" }}>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.emerald,
                    lineHeight: 1,
                  }}
                >
                  <span data-count="120">0</span>
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  stress cells
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.emerald,
                    lineHeight: 1,
                  }}
                >
                  <span data-count="5">0</span>
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  risk zones
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.lemon,
                    lineHeight: 1,
                  }}
                >
                  live
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  as you type
                </div>
              </div>
            </div>
          </div>

          {/* Right — live HeroProof: base DSCR + SAFE/DEAL_BREAK counts */}
          <HeroProof
            eyebrow="Live stress preview"
            value={`${baseDSCR.toFixed(2)}x`}
            sub={
              <>
                <span style={{ color: dc.emerald }}>{safeCount} SAFE</span>
                {" · "}
                <span style={{ color: "#ff6b6b" }}>{breakCount} DEAL_BREAK</span>
                {" of "}
                {result?.totalCells ?? 120}
                {" cells"}
              </>
            }
            chip={{ label: baseZone, color: chipColor }}
          />
        </div>
      </section>

      {/* ── 3-STEP BAND ──────────────────────────────────────── */}
      <section
        className="gs-reveal"
        style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="dc-band-3"
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

              {/* Purchase Price */}
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

              {/* Down % */}
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

              {/* Base Rate */}
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

              {/* Monthly Rent */}
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

              {/* Annual Taxes */}
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

              {/* Annual Insurance */}
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

              {/* HOA */}
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
