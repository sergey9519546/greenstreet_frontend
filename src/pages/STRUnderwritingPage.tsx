import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, CountUp, Btn } from "../design/dc";
import ComplianceNote from "../design/ComplianceNote";
import { radius } from "../theme";
import { evaluateSTRUnderwriting, checkSTRLegality } from "../engine/strUnderwriting";
import type { PropertyInputs } from "../engine/types";

// ── number formatting ──────────────────────────────────────────────────────
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── DSCR verdict helpers ───────────────────────────────────────────────────
// Uses dc tokens — no hardcoded hex outside the design system.
function dscrColor(d: number): string {
  if (d >= 1.25) return dc.rain;   // RAINFOREST #006565
  if (d >= 1.0) return dc.lemon;   // LEMON #d8d958
  return "#d32f2f";
}
function dscrLabel(d: number): string {
  if (d >= 1.25) return "STRONG";
  if (d >= 1.0) return "REVIEW";
  if (d >= 0.75) return "WEAK REVIEW";
  return "SHORTFALL";
}

// ── input field row ────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  value,
  step,
  prefix,
  suffix,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (v: number) => void;
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
          color: "rgba(238,239,211,0.62)",
          marginBottom: 3,
        }}
      >
        {label}
      </span>
      {hint && (
        <span
          style={{
            display: "block",
            fontSize: 11,
            color: "rgba(238,239,211,0.62)",
            marginBottom: 5,
            lineHeight: 1.4,
          }}
        >
          {hint}
        </span>
      )}
      <div className="str-field">
        {prefix && (
          <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 13 }}>{prefix}</span>
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
          <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 13 }}>{suffix}</span>
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
                  color: "rgba(238,239,211,0.62)",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  fontSize: 11,
                  borderBottom: "1px solid rgba(238,239,211,0.16)",
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
                    color: "rgba(238,239,211,0.62)",
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
                color: "rgba(238,239,211,0.62)",
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

  const TEAL = dc.teal;

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
        .str-field{display:flex;align-items:center;background:${dc.teal};border:1.5px solid rgba(238,239,211,0.18);border-radius:${radius.sm};padding:0 12px;transition:border-color .15s;}
        .str-field:focus-within{border-color:${dc.lemon};outline:2px solid ${dc.lemon};outline-offset:1px;}
        .str-field:hover:not(:focus-within){border-color:rgba(238,239,211,0.36);}
        @media(max-width:991px){.str-hero-grid{grid-template-columns:1fr !important;} .str-tool-grid{grid-template-columns:1fr !important;} .str-3col{grid-template-columns:1fr 1fr !important;}}
        @media(max-width:767px){.str-3col{grid-template-columns:1fr !important;}}
        @media(max-width:479px){.str-worlds{grid-template-columns:1fr !important;}}
      `}</style>

      {/* ══ TOOL — dark teal, matches mockup #003a39 ══════════════════════ */}
      <section
        id="str-tool"
        style={{
          background: dc.teal,
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
            <h1
              style={{
                fontSize: "clamp(30px,3.8vw,52px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                margin: "0 0 10px",
                color: dc.cream,
              }}
            >
              Projected STR DSCR{" "}
              {bestDSCR === null ? (
                <Mono style={{ color: vColor }}>—</Mono>
              ) : (
                <CountUp value={bestDSCR} decimals={2} suffix="x" style={{ color: vColor }} />
              )}
            </h1>
            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.62)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              {bestDSCR === null
                ? "Enter your deal details to see a preliminary STR DSCR scenario."
                : bestDSCR >= 1.25
                ? `DSCR of ${dscrStr} is strong in this scenario because the selected rent input covers the estimated full monthly payment. Final qualifying income and program fit still require source verification and underwriting.`
                : bestDSCR >= 1.0
                ? `DSCR of ${dscrStr} covers the estimated payment in this scenario but is sensitive to off-season revenue, reserve requirements, and underwriting haircuts.`
                : `DSCR of ${dscrStr} is below 1.0x under these inputs. Review source data, loan amount, reserves, and eligible program alternatives before relying on the model.`}
            </p>
            <div style={{ maxWidth: 760, marginTop: 16 }}>
              <ComplianceNote tone="verify">
                STR revenue, rent eligibility, reserve overlays, DSCR thresholds, and state/local STR legality require approved data sources, current product-sheet verification, and underwriting review. This tool is not an approval, rate quote, or commitment to lend.
              </ComplianceNote>
            </div>
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
                background: dc.dark,
                borderRadius: dc.r.lg,
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
                  marginBottom: 6,
                }}
              >
                STR assumptions
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.5 }}>
                Use supportable assumptions. LTR lease rent is modeled as a fallback when STR income is not eligible or cannot be documented.
              </p>

              {/* State field */}
              <label style={{ display: "block", marginBottom: 12 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(238,239,211,0.62)",
                    marginBottom: 5,
                  }}
                >
                  State
                </span>
                <div className="str-field">
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

              <Field label="Purchase Price" hint="What you're paying for the property." value={purchasePrice} step={5000} prefix="$" onChange={setPurchasePrice} />
              <Field label="LTV" hint="Loan divided by value. Product caps, pricing, and down-payment requirements must be verified against the current product sheet." value={ltv} step={5} suffix="%" onChange={setLtv} />
              <Field label="Illustrative note rate" hint="Use a verified current quote or product-sheet assumption. This field is not a rate offer." value={rate} step={0.125} suffix="%" onChange={setRate} />
              <Field label="LTR Lease Rent /mo" hint="What the property could rent for on a standard 12-month lease. Modeled as a fallback when STR income is not eligible or documented." value={ltvRent} step={100} prefix="$" onChange={setLtvRent} />
              <Field label="STR Projected /mo" hint="Estimated average monthly STR revenue over a full year. Replace with approved market data before underwriting." value={strRent} step={100} prefix="$" onChange={setStrRent} />
              <Field label="STR Documented /mo" hint="Average monthly revenue from actual booking history, tax records, or platform statements when allowed by program guidelines." value={documentedRent} step={100} prefix="$" onChange={setDocumentedRent} />
              <Field label="Annual Taxes" hint="Property taxes per year. Find on county assessor site." value={annualTaxes} step={250} prefix="$" onChange={setAnnualTaxes} />
              <Field label="Annual Insurance" hint="Homeowners/STR insurance per year. STR policies typically cost more than standard HO." value={annualInsurance} step={100} prefix="$" onChange={setAnnualInsurance} />
              <Field label="Monthly HOA" hint="HOA dues per month. Enter 0 if none. Some HOAs restrict STR — check your HOA docs." value={hoa} step={25} prefix="$" onChange={setHoa} />
            </div>

            {/* ── RESULTS ────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {!result ? (
                <div
                  style={{
                    background: dc.dark,
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
                    <div style={{ background: dc.dark, padding: 24, textAlign: "center" }}>
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
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 6 }}>
                        gross annual
                      </div>
                    </div>
                    <div style={{ background: dc.dark, padding: 24, textAlign: "center" }}>
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
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 6 }}>
                        scenario /mo
                      </div>
                    </div>
                    <div style={{ background: dc.dark, padding: 24, textAlign: "center" }}>
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
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 6 }}>
                        projected DSCR
                      </div>
                    </div>
                  </div>

                  {/* ── THREE WORLDS ───────────────────────────────────── */}
                  <div style={{ marginBottom: 2 }}>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 8px", lineHeight: 1.5 }}>
                      This model compares three review scenarios. World 1 uses the long-term lease rate. World 2 uses projected STR revenue. World 3 uses documented historical STR income when program guidelines allow it.
                    </p>
                  </div>
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
                        label: "World 1 — Long-term lease",
                        world: result.underwriting.world1_LTR,
                        bg: "#002a29",
                      },
                      {
                        label: "World 2 — Projected STR",
                        world: result.underwriting.world2_Projected,
                        bg: "#002a29",
                      },
                      {
                        label: "World 3 — Documented STR",
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
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: "rgba(238,239,211,0.62)",
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
                              color: world.dscr >= 1.25 ? dc.emerald : world.dscr >= 1.0 ? dc.lemon : "#e06363",
                            }}
                          >
                            {world.dscr.toFixed(2)}x
                          </Mono>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "rgba(238,239,211,0.62)",
                              marginTop: 5,
                            }}
                          >
                            {fmt(world.qualifyingRent)}/mo scenario
                          </div>
                          {isBest && (
                            <div
                              style={{
                                fontSize: 11,
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
                        background: dc.dark,
                        borderRadius: dc.r.lg,
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
                        Month-by-month — does it cash flow all year?
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "rgba(238,239,211,0.62)",
                          margin: "0 0 16px",
                          lineHeight: 1.5,
                        }}
                      >
                        Each bar shows the modeled occupancy index for that month and the resulting monthly DSCR. Replace these assumptions with approved market data before using the result in underwriting. Green = covers the payment; yellow = near coverage; red = cash shortfall that month.
                      </p>

                      {/* Signature seasonality bar chart */}
                      <div style={{ marginBottom: 20 }}>
                        <SeasonalityBars months={result.seasonality.months} />
                      </div>

                      {/* off-season / peak legend */}
                      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(224,99,99,0.2)", border: "1px solid #e06363" }} />
                          <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", fontWeight: 500 }}>Off-season (DSCR &lt; 1.0)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(216,217,88,0.2)", border: `1px solid ${dc.lemon}` }} />
                          <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", fontWeight: 500 }}>Review range (1.0-1.24x)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(77,189,151,0.2)", border: `1px solid ${dc.emerald}` }} />
                          <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", fontWeight: 500 }}>Peak (≥ 1.25x)</span>
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
                          Keep cash reserves (months of mortgage payments in the bank after closing) to cover PITIA (the full monthly payment — principal, interest, taxes, insurance, and any HOA dues) gaps in slow months.
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
                      {result.legality.incomeEnabled ? "STR SCENARIO USED" : "LTR ONLY"}
                    </div>
                  </div>

                  {/* ── ENGINE FOOTNOTE ────────────────────────────────── */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "rgba(238,239,211,0.05)",
                      borderRadius: dc.r.md,
                      border: "1px solid rgba(238,239,211,0.08)",
                      fontSize: 12,
                      color: "rgba(238,239,211,0.62)",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: dc.emerald }}>How qualifying rent is chosen:</strong>{" "}
                    State <strong>{state}</strong> legality status: {result.legality.status} — STR income{" "}
                    {result.legality.incomeEnabled
                      ? "is modeled as potentially usable subject to current legal, licensing, HOA, and program review"
                      : "is modeled as unavailable, so the engine falls back to World 1 long-term-lease rent"}
                    . Selected scenario: <strong>{result.underwriting.bestWorld}</strong>,
                    rent input used: <strong>{fmt(result.underwriting.bestQualifyingRent)}/mo</strong>.{" "}
                    Preliminary model only. Submit source documentation for underwriting review.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 12, marginTop: 24, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            Preliminary model only — not a commitment to lend, approval, or rate quote. STR revenue projections require source verification, local legality review, and current product-sheet confirmation before underwriting can rely on them.
          </p>
        </div>
      </section>

      {/* ── FUNNEL CTA ── */}
      <section
        className="gs-reveal"
        style={{ background: dc.dark, padding: `clamp(56px,7vw,88px) ${dc.pad}`, borderTop: "1px solid rgba(238,239,211,0.07)" }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="dc-split"
            style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>
                STR review
              </div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>
                Request an STR scenario review.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch", letterSpacing: "-0.01em" }}>
                Send the property, rent support, and state details so a specialist can verify whether the STR income can be used.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <Btn label="Request review" href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} />
              <Btn label="Browse STR programs" variant="secondary" arrow={false} href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }} />
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
