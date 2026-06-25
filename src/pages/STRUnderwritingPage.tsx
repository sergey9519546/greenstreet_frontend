import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { evaluateSTRUnderwriting, checkSTRLegality } from "../engine/strUnderwriting";
import type { PropertyInputs } from "../engine/types";

// ── number formatting ──────────────────────────────────────────────────────
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── DSCR verdict helpers ───────────────────────────────────────────────────
function dscrColor(d: number): string {
  if (d >= 1.25) return "#006565";
  if (d >= 1.0) return "#9a7b00";
  return "#d32f2f";
}
function dscrLabel(d: number): string {
  if (d >= 1.25) return "STRONG";
  if (d >= 1.0) return "QUALIFIES";
  if (d >= 0.75) return "SUB-1.0";
  return "BELOW FLOOR";
}

// ── input field row ────────────────────────────────────────────────────────
function Field({
  label,
  value,
  step,
  prefix,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "rgba(238,239,211,0.5)",
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#003a39",
          borderRadius: 7,
          padding: "0 12px",
        }}
      >
        {prefix && (
          <span style={{ color: "rgba(238,239,211,0.4)", fontSize: 13 }}>{prefix}</span>
        )}
        <input
          className="str-num"
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          style={{ padding: "10px 6px", fontSize: 15, fontWeight: 600 }}
        />
        {suffix && (
          <span style={{ color: "rgba(238,239,211,0.4)", fontSize: 13 }}>{suffix}</span>
        )}
      </div>
    </label>
  );
}

// ── month table ────────────────────────────────────────────────────────────
function MonthTable({
  months,
}: {
  months: Array<{
    month: string;
    seasonalityIndex: number;
    projectedRevenue: number;
    haircutRevenue: number;
    monthlyDSCR: number;
    isOffSeason: boolean;
  }>;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 400,
          fontFamily: dc.mono,
          fontSize: 12,
        }}
      >
        <thead>
          <tr>
            {["Mo", "Occ", "Net Rev", "DSCR"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "6px 10px",
                  textAlign: h === "Mo" ? "left" : "right",
                  color: "rgba(238,239,211,0.42)",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  fontSize: 10,
                  borderBottom: "1px solid rgba(238,239,211,0.1)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((m) => {
            const c =
              m.monthlyDSCR >= 1.25
                ? dc.emerald
                : m.monthlyDSCR >= 1.0
                ? dc.lemon
                : "#e06363";
            return (
              <tr key={m.month}>
                <td
                  style={{
                    padding: "6px 10px",
                    color: dc.cream,
                    borderBottom: "1px solid rgba(238,239,211,0.07)",
                  }}
                >
                  {m.month}
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    textAlign: "right",
                    color: "rgba(238,239,211,0.5)",
                    borderBottom: "1px solid rgba(238,239,211,0.07)",
                  }}
                >
                  {m.seasonalityIndex}
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    textAlign: "right",
                    color: dc.cream,
                    borderBottom: "1px solid rgba(238,239,211,0.07)",
                  }}
                >
                  {fmt(m.projectedRevenue)}
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    textAlign: "right",
                    color: c,
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(238,239,211,0.07)",
                  }}
                >
                  {m.monthlyDSCR.toFixed(2)}x
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Seasonality bar chart ──────────────────────────────────────────────────
function SeasonalityBars({
  months,
}: {
  months: Array<{
    month: string;
    seasonalityIndex: number;
    monthlyDSCR: number;
    isOffSeason: boolean;
  }>;
}) {
  const maxIndex = Math.max(...months.map((m) => m.seasonalityIndex));
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12,1fr)",
        gap: 4,
        alignItems: "flex-end",
        height: 96,
      }}
    >
      {months.map((m) => {
        const heightPct = (m.seasonalityIndex / maxIndex) * 100;
        const c =
          m.monthlyDSCR >= 1.25
            ? dc.emerald
            : m.monthlyDSCR >= 1.0
            ? dc.lemon
            : "#e06363";
        const bgAlpha = m.isOffSeason ? "22" : "33";
        return (
          <div
            key={m.month}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}
          >
            <div
              style={{
                width: "100%",
                height: `${heightPct}%`,
                background: `${c}${bgAlpha}`,
                borderTop: `2px solid ${c}`,
                borderRadius: "3px 3px 0 0",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 3,
                minHeight: 16,
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  fontFamily: dc.mono,
                  color: c,
                  lineHeight: 1,
                }}
              >
                {m.seasonalityIndex}
              </span>
            </div>
            <div
              style={{
                fontSize: 8,
                color: "rgba(238,239,211,0.45)",
                marginTop: 3,
                textAlign: "center",
                letterSpacing: 0,
              }}
            >
              {m.month}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function STRUnderwritingPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  // ── inputs ───────────────────────────────────────────────────────────────
  const [state, setState] = useState("TX");
  const [purchasePrice, setPurchasePrice] = useState(480000);
  const [ltv, setLtv] = useState(75);
  const [rate, setRate] = useState(7.5);
  const [strRent, setStrRent] = useState(4500);
  const [ltvRent, setLtvRent] = useState(3000);
  const [documentedRent, setDocumentedRent] = useState(2800);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

  // ── engine ───────────────────────────────────────────────────────────────
  const result = useMemo(() => {
    try {
      const property: PropertyInputs = {
        purchasePrice,
        leaseRent: ltvRent,
        marketRent: ltvRent,
        strProjectedRent: strRent,
        strDocumentedRent: documentedRent,
        hoa,
        annualTaxes,
        annualInsurance,
        floodInsurance: 0,
        propertyType: "SFR",
        state,
        unitCount: 1,
        sqft: 1500,
        yearBuilt: 2000,
        isCondotel: false,
        isNonWarrantable: false,
        isRural: false,
        isDecliningMarket: false,
        hoaSTRPolicy: "UNKNOWN",
      };
      const loanAmount = purchasePrice * (ltv / 100);
      const underwriting = evaluateSTRUnderwriting(
        property,
        loanAmount,
        rate,
        30,
        "0",
        annualTaxes,
        annualInsurance,
        hoa,
        0,
      );
      const legality = checkSTRLegality(
        state,
        "",
        "UNKNOWN",
        false,
        true,
        0,
        false,
        "MODERATE",
        false,
      );
      const seasonality = underwriting.monthlySeasonality;
      return { underwriting, legality, seasonality, loanAmount };
    } catch {
      return null;
    }
  }, [
    state,
    purchasePrice,
    ltv,
    rate,
    strRent,
    ltvRent,
    documentedRent,
    annualTaxes,
    annualInsurance,
    hoa,
  ]);

  // ── derived display values ────────────────────────────────────────────────
  const bestDSCR = result
    ? Math.max(
        result.underwriting.world1_LTR.dscr,
        result.underwriting.world2_Projected.dscr,
        result.underwriting.world3_Documented.dscr,
      )
    : null;

  const dscrStr = bestDSCR !== null ? bestDSCR.toFixed(2) + "x" : "—";
  const verdict = bestDSCR !== null ? dscrLabel(bestDSCR) : "—";
  const vColor = bestDSCR !== null
    ? (bestDSCR >= 1.25 ? dc.emerald : bestDSCR >= 1.0 ? dc.lemon : "#e06363")
    : "rgba(238,239,211,0.35)";

  const grossAnnual = result
    ? result.underwriting.world2_Projected.qualifyingRent * 12 / 0.8
    : 0;

  const uwMonthly = result ? result.underwriting.bestQualifyingRent : 0;

  const TEAL = "#004041";

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#str-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={TEAL}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lenders", view: "lender-intel" },
      ]}
      cta={{ label: "Underwrite STR →", onClick: scrollToTool }}
    >
      {/* ── spinner-hide + flat input override ─────────────────────────── */}
      <style>{`
        .str-num::-webkit-outer-spin-button,.str-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .str-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
      `}</style>

      {/* ══ HERO — dark bg matches mockup, 2-col: copy left, stats right ══ */}
      <section
        id="st-hero"
        style={{
          position: "relative",
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
          padding: "clamp(56px,8vh,108px) clamp(1.5rem,4vw,3rem) clamp(44px,6vh,76px)",
        }}
      >
        <div className="gs-dot-grid" />
        <div
          className="dc-hero"
          style={{
            position: "relative",
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.02fr 0.98fr",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div id="gs-hero-content">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.dark,
                background: dc.lemon,
                borderRadius: 100,
                padding: "7px 14px",
                marginBottom: 24,
              }}
            >
              STR · ADR × occupancy × seasonality
            </div>
            <H1 style={{ margin: "0 0 26px", color: dc.cream }}>
              Will the STR cash flow in the off-season?
            </H1>
            <Lead
              style={{
                color: "rgba(238,239,211,0.68)",
                maxWidth: "46ch",
                margin: "0 0 36px",
              }}
            >
              Month-by-month revenue from ADR, occupancy and a seasonality curve — then the DSCR a lender will actually underwrite, off-season included.
            </Lead>
            <Btn label="Open the STR engine ↓" href="#str-tool" onClick={scrollToTool} />
          </div>

          {/* Right — live metric preview */}
          <div
            style={{
              background: "linear-gradient(160deg,#00302f,#002423)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(238,239,211,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(238,239,211,0.5)" }}>Underwritten DSCR</div>
              <Mono style={{ fontSize: 13, fontWeight: 700, color: vColor }}>{dscrStr}</Mono>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {result ? [
                { label: "Gross annual", val: fmt(grossAnnual), color: dc.cream },
                { label: "UW /mo", val: fmt(uwMonthly), color: dc.lemon },
                { label: "DSCR", val: dscrStr, color: vColor },
              ].map((m) => (
                <div key={m.label} style={{ background: "rgba(238,239,211,0.07)", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                  <Mono style={{ display: "block", fontSize: "clamp(14px,1.6vw,20px)", fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.val}</Mono>
                  <div style={{ fontSize: 10, color: "rgba(238,239,211,0.4)", marginTop: 4, fontWeight: 500 }}>{m.label}</div>
                </div>
              )) : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", color: "rgba(238,239,211,0.35)", fontSize: 13, padding: "20px 0" }}>Enter inputs below</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TOOL — dark teal, matches mockup #003a39 ══════════════════════ */}
      <section
        id="str-tool"
        style={{
          background: "#003a39",
          color: dc.cream,
          padding: `clamp(52px,7vw,92px) clamp(1.5rem,4vw,3rem) clamp(64px,9vh,116px)`,
          borderTop: "1px solid rgba(238,239,211,0.07)",
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.lemon,
                marginBottom: 12,
              }}
            >
              Live STR engine
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,52px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                margin: 0,
                color: dc.cream,
              }}
            >
              Underwritten DSCR{" "}
              <Mono style={{ color: vColor }}>{dscrStr}</Mono>
            </h2>
          </div>

          {/* inputs + results split */}
          <div
            className="gs-reveal dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ─────────────────────────────────────────────── */}
            <div
              style={{
                background: "#002a29",
                borderRadius: 14,
                padding: 28,
                border: "1px solid rgba(238,239,211,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.emerald,
                  marginBottom: 18,
                }}
              >
                STR assumptions
              </div>

              {/* State field */}
              <label style={{ display: "block", marginBottom: 12 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(238,239,211,0.5)",
                    marginBottom: 5,
                  }}
                >
                  State
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#003a39",
                    borderRadius: 7,
                    padding: "0 12px",
                  }}
                >
                  <input
                    className="str-num"
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                    style={{
                      padding: "10px 6px",
                      fontSize: 15,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  />
                </div>
              </label>

              <Field label="Purchase Price" value={purchasePrice} step={5000} prefix="$" onChange={setPurchasePrice} />
              <Field label="LTV" value={ltv} step={5} suffix="%" onChange={setLtv} />
              <Field label="Note Rate" value={rate} step={0.125} suffix="%" onChange={setRate} />
              <Field label="LTR Lease Rent /mo" value={ltvRent} step={100} prefix="$" onChange={setLtvRent} />
              <Field label="STR Projected /mo" value={strRent} step={100} prefix="$" onChange={setStrRent} />
              <Field label="STR Documented /mo" value={documentedRent} step={100} prefix="$" onChange={setDocumentedRent} />
              <Field label="Annual Taxes" value={annualTaxes} step={250} prefix="$" onChange={setAnnualTaxes} />
              <Field label="Annual Insurance" value={annualInsurance} step={100} prefix="$" onChange={setAnnualInsurance} />
              <Field label="Monthly HOA" value={hoa} step={25} prefix="$" onChange={setHoa} />
            </div>

            {/* ── RESULTS ────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {!result ? (
                <div
                  style={{
                    background: "#002a29",
                    borderRadius: 14,
                    padding: 40,
                    textAlign: "center",
                    border: "1px solid rgba(238,239,211,0.08)",
                  }}
                >
                  <p style={{ color: "#e06363", margin: 0 }}>Engine returned no result. Check inputs.</p>
                </div>
              ) : (
                <>
                  {/* ── THREE METRICS ROW (matches mockup 3-tile strip) ─────── */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1px",
                      background: "rgba(238,239,211,0.1)",
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid rgba(238,239,211,0.08)",
                    }}
                  >
                    <div style={{ background: "#002a29", padding: 24, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          letterSpacing: "-0.03em",
                          color: dc.cream,
                        }}
                      >
                        {fmt(grossAnnual)}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.5)", marginTop: 6 }}>
                        gross annual
                      </div>
                    </div>
                    <div style={{ background: "#002a29", padding: 24, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          letterSpacing: "-0.03em",
                          color: dc.lemon,
                        }}
                      >
                        {fmt(uwMonthly)}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.5)", marginTop: 6 }}>
                        underwritten /mo
                      </div>
                    </div>
                    <div style={{ background: "#002a29", padding: 24, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          letterSpacing: "-0.03em",
                          color: vColor,
                        }}
                      >
                        {dscrStr}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.5)", marginTop: 6 }}>
                        underwritten DSCR
                      </div>
                    </div>
                  </div>

                  {/* ── THREE WORLDS ───────────────────────────────────── */}
                  <div
                    className="dc-band-3"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1px",
                      background: "rgba(238,239,211,0.1)",
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid rgba(238,239,211,0.08)",
                    }}
                  >
                    {[
                      {
                        label: "World 1 — LTR",
                        world: result.underwriting.world1_LTR,
                        bg: "#002a29",
                      },
                      {
                        label: "World 2 — Projected",
                        world: result.underwriting.world2_Projected,
                        bg: "#002a29",
                      },
                      {
                        label: "World 3 — Documented",
                        world: result.underwriting.world3_Documented,
                        bg: "#002a29",
                      },
                    ].map(({ label, world, bg }) => {
                      const isBest = label
                        .toLowerCase()
                        .includes(result.underwriting.bestWorld.toLowerCase().slice(0, 5));
                      return (
                        <div
                          key={label}
                          style={{
                            background: bg,
                            padding: 24,
                            textAlign: "center",
                            outline: isBest ? `2px solid ${dc.emerald}` : undefined,
                            outlineOffset: isBest ? -2 : undefined,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: "rgba(238,239,211,0.5)",
                              marginBottom: 8,
                            }}
                          >
                            {label}
                          </div>
                          <Mono
                            style={{
                              display: "block",
                              fontSize: "clamp(22px,2.8vw,36px)",
                              fontWeight: 600,
                              letterSpacing: "-0.03em",
                              color: dscrColor(world.dscr) === "#006565" ? dc.emerald : dscrColor(world.dscr) === "#9a7b00" ? dc.lemon : "#e06363",
                            }}
                          >
                            {world.dscr.toFixed(2)}x
                          </Mono>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "rgba(238,239,211,0.5)",
                              marginTop: 5,
                            }}
                          >
                            {fmt(world.qualifyingRent)}/mo qualifying
                          </div>
                          {isBest && (
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: dc.emerald,
                                marginTop: 6,
                              }}
                            >
                              ✓ Selected
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── SEASONALITY BAR CHART + TABLE (centerpiece) ────── */}
                  {result.seasonality?.months && (
                    <div
                      style={{
                        background: "#002a29",
                        borderRadius: 14,
                        padding: 22,
                        border: "1px solid rgba(238,239,211,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: dc.emerald,
                          marginBottom: 4,
                        }}
                      >
                        Month-by-month
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "rgba(238,239,211,0.5)",
                          margin: "0 0 16px",
                          lineHeight: 1.5,
                        }}
                      >
                        US national AirDNA seasonality index · off-season months in red
                      </p>

                      {/* Signature seasonality bar chart */}
                      <div style={{ marginBottom: 20 }}>
                        <SeasonalityBars months={result.seasonality.months} />
                      </div>

                      {/* off-season / peak legend */}
                      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(224,99,99,0.2)", border: "1px solid #e06363" }} />
                          <span style={{ fontSize: 11, color: "rgba(238,239,211,0.5)", fontWeight: 500 }}>Off-season (DSCR &lt; 1.0)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(216,217,88,0.2)", border: `1px solid ${dc.lemon}` }} />
                          <span style={{ fontSize: 11, color: "rgba(238,239,211,0.5)", fontWeight: 500 }}>Qualifies (1.0–1.24x)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(77,189,151,0.2)", border: `1px solid ${dc.emerald}` }} />
                          <span style={{ fontSize: 11, color: "rgba(238,239,211,0.5)", fontWeight: 500 }}>Peak (≥ 1.25x)</span>
                        </div>
                      </div>

                      {/* full table */}
                      <MonthTable months={result.seasonality.months} />

                      {/* off-season warning */}
                      {result.seasonality.offSeasonMonths?.length > 0 && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: "12px 16px",
                            background: "rgba(224,99,99,0.08)",
                            borderRadius: 7,
                            border: "1px solid rgba(224,99,99,0.25)",
                            fontSize: 12,
                            color: "#e06363",
                            lineHeight: 1.55,
                          }}
                        >
                          <strong>
                            {result.seasonality.offSeasonMonths.length} off-season month
                            {result.seasonality.offSeasonMonths.length > 1 ? "s" : ""}:
                          </strong>{" "}
                          {result.seasonality.offSeasonMonths.join(", ")} — DSCR below 1.0.
                          Reserve cash to cover PITIA gaps.
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── LEGALITY GATE ──────────────────────────────────── */}
                  <div
                    style={{
                      background: dc.dark,
                      borderRadius: 9,
                      padding: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: dc.lemon,
                          marginBottom: 6,
                        }}
                      >
                        Legality gate — {state || "—"}
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color:
                            result.legality.status === "CLEAR"
                              ? dc.emerald
                              : result.legality.status === "RESTRICTED"
                              ? "#e06363"
                              : dc.lemon,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {result.legality.status}
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "rgba(238,239,211,0.65)",
                          margin: "6px 0 0",
                          lineHeight: 1.5,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {result.legality.summary}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "8px 16px",
                        borderRadius: 20,
                        background: result.legality.incomeEnabled
                          ? "rgba(77,189,151,0.15)"
                          : "rgba(211,47,47,0.15)",
                        border: `1px solid ${result.legality.incomeEnabled ? dc.emerald : "#e06363"}`,
                        color: result.legality.incomeEnabled ? dc.emerald : "#e06363",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {result.legality.incomeEnabled ? "STR INCOME USED" : "LTR ONLY"}
                    </div>
                  </div>

                  {/* ── ENGINE FOOTNOTE ────────────────────────────────── */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "rgba(238,239,211,0.05)",
                      borderRadius: 9,
                      border: "1px solid rgba(238,239,211,0.08)",
                      fontSize: 12,
                      color: "rgba(238,239,211,0.5)",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: dc.emerald }}>Engine:</strong>{" "}
                    <code>evaluateSTRUnderwriting</code> +{" "}
                    <code>checkSTRLegality</code> +{" "}
                    <code>computeSTRMonthlySeasonality</code>. State{" "}
                    <strong>{state}</strong>: {result.legality.status} — STR income{" "}
                    {result.legality.incomeEnabled
                      ? "available for qualifying"
                      : "blocked, falls back to World 1 LTR"}
                    . Best world: <strong>{result.underwriting.bestWorld}</strong>,
                    qualifying rent{" "}
                    <strong>{fmt(result.underwriting.bestQualifyingRent)}/mo</strong>.
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
