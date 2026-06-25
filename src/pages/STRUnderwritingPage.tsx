import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono } from "../design/dc";
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
          color: "rgba(0,55,56,0.5)",
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: dc.cream,
          borderRadius: 6,
          padding: "0 11px",
        }}
      >
        {prefix && (
          <span style={{ color: "rgba(0,55,56,0.4)", fontSize: 13 }}>{prefix}</span>
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
          <span style={{ color: "rgba(0,55,56,0.4)", fontSize: 13 }}>{suffix}</span>
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
                  color: "rgba(0,55,56,0.4)",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  fontSize: 10,
                  borderBottom: "1px solid rgba(0,55,56,0.1)",
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
                ? "#006565"
                : m.monthlyDSCR >= 1.0
                ? "#9a7b00"
                : "#d32f2f";
            return (
              <tr key={m.month}>
                <td
                  style={{
                    padding: "6px 10px",
                    color: dc.dark,
                    borderBottom: "1px solid rgba(0,55,56,0.07)",
                  }}
                >
                  {m.month}
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    textAlign: "right",
                    color: "rgba(0,55,56,0.5)",
                    borderBottom: "1px solid rgba(0,55,56,0.07)",
                  }}
                >
                  {m.seasonalityIndex}
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    textAlign: "right",
                    color: dc.dark,
                    borderBottom: "1px solid rgba(0,55,56,0.07)",
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
                    borderBottom: "1px solid rgba(0,55,56,0.07)",
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
            ? "#006565"
            : m.monthlyDSCR >= 1.0
            ? "#9a7b00"
            : "#d32f2f";
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
                color: "rgba(0,55,56,0.45)",
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
  const vColor = bestDSCR !== null ? dscrColor(bestDSCR) : "rgba(0,55,56,0.35)";

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
        .str-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.dark};letter-spacing:-0.02em;}
      `}</style>

      {/* ══ HERO — dark-teal, copy-only, no device panel ═════════════════ */}
      <section
        id="gs-hero-content"
        style={{
          background: TEAL,
          color: dc.cream,
          padding: "clamp(56px,8vh,104px) clamp(1.5rem,4vw,3rem)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
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
            Short-term rental · ADR × occupancy × seasonality
          </div>
          <h1
            style={{
              fontSize: "clamp(44px,6.5vw,92px)",
              fontWeight: 600,
              lineHeight: 0.97,
              letterSpacing: "-0.04em",
              margin: "0 0 24px",
            }}
          >
            Will the STR cash flow in the off-season?
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
            Month-by-month revenue modeled across three underwriting worlds — LTR
            lease, STR projected, STR documented — against a 12-month seasonality
            curve. See the DSCR a lender will actually qualify.
          </p>
          <a
            href="#str-tool"
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
            Open the STR engine ↓
          </a>
        </div>
      </section>

      {/* ══ TOOL ══════════════════════════════════════════════════════════ */}
      <section
        id="str-tool"
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
                color: "#006565",
                marginBottom: 12,
              }}
            >
              Live STR engine
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,48px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.0,
                margin: 0,
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
                background: dc.white,
                borderRadius: 9,
                padding: 24,
                border: "1px solid rgba(0,55,56,0.1)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#006565",
                  marginBottom: 16,
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
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 5,
                  }}
                >
                  State
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 11px",
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
                    background: dc.white,
                    borderRadius: 9,
                    padding: 40,
                    textAlign: "center",
                    border: "1px solid rgba(0,55,56,0.1)",
                  }}
                >
                  <p style={{ color: "#d32f2f", margin: 0 }}>Engine returned no result. Check inputs.</p>
                </div>
              ) : (
                <>
                  {/* ── THREE METRICS ROW (mockup signature) ────────────── */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1px",
                      background: "rgba(0,55,56,0.1)",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ background: "#e8e9bf", padding: 22, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          color: dc.dark,
                        }}
                      >
                        {fmt(grossAnnual)}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(0,55,56,0.5)", marginTop: 5 }}>
                        gross annual
                      </div>
                    </div>
                    <div style={{ background: dc.lemon, padding: 22, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          color: dc.dark,
                        }}
                      >
                        {fmt(uwMonthly)}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(0,55,56,0.6)", marginTop: 5 }}>
                        underwritten /mo
                      </div>
                    </div>
                    <div style={{ background: dc.dark, padding: 22, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          color: vColor,
                        }}
                      >
                        {dscrStr}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.5)", marginTop: 5 }}>
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
                      background: "rgba(0,55,56,0.1)",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    {[
                      {
                        label: "World 1 — LTR",
                        world: result.underwriting.world1_LTR,
                        bg: "rgba(238,239,211,0.85)",
                        dark: false,
                      },
                      {
                        label: "World 2 — Projected",
                        world: result.underwriting.world2_Projected,
                        bg: dc.lemon,
                        dark: false,
                      },
                      {
                        label: "World 3 — Documented",
                        world: result.underwriting.world3_Documented,
                        bg: dc.dark,
                        dark: true,
                      },
                    ].map(({ label, world, bg, dark }) => {
                      const isBest = label
                        .toLowerCase()
                        .includes(result.underwriting.bestWorld.toLowerCase().slice(0, 5));
                      return (
                        <div
                          key={label}
                          style={{
                            background: bg,
                            padding: 22,
                            textAlign: "center",
                            outline: isBest ? "2px solid #006565" : undefined,
                            outlineOffset: isBest ? -2 : undefined,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: dark ? "rgba(238,239,211,0.5)" : "rgba(0,55,56,0.5)",
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
                              color: dscrColor(world.dscr),
                            }}
                          >
                            {world.dscr.toFixed(2)}x
                          </Mono>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: dark ? "rgba(238,239,211,0.5)" : "rgba(0,55,56,0.5)",
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
                                color: "#006565",
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
                        background: dc.white,
                        borderRadius: 9,
                        padding: 22,
                        border: "1px solid rgba(0,55,56,0.1)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "#006565",
                          marginBottom: 4,
                        }}
                      >
                        Month-by-month
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "rgba(0,55,56,0.5)",
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
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#d32f2f33", border: "1px solid #d32f2f" }} />
                          <span style={{ fontSize: 11, color: "rgba(0,55,56,0.55)", fontWeight: 500 }}>Off-season (DSCR &lt; 1.0)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#9a7b0033", border: "1px solid #9a7b00" }} />
                          <span style={{ fontSize: 11, color: "rgba(0,55,56,0.55)", fontWeight: 500 }}>Qualifies (1.0–1.24x)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#00656533", border: "1px solid #006565" }} />
                          <span style={{ fontSize: 11, color: "rgba(0,55,56,0.55)", fontWeight: 500 }}>Peak (≥ 1.25x)</span>
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
                            background: "rgba(211,47,47,0.06)",
                            borderRadius: 7,
                            border: "1px solid rgba(211,47,47,0.2)",
                            fontSize: 12,
                            color: "#b91c1c",
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
                              ? "#d32f2f"
                              : "#9a7b00",
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
                        border: `1px solid ${result.legality.incomeEnabled ? dc.emerald : "#d32f2f"}`,
                        color: result.legality.incomeEnabled ? dc.emerald : "#d32f2f",
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
                      background: "rgba(0,64,65,0.06)",
                      borderRadius: 9,
                      border: "1px solid rgba(0,55,56,0.1)",
                      fontSize: 12,
                      color: "rgba(0,55,56,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: "#006565" }}>Engine:</strong>{" "}
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
