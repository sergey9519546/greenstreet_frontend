import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, CountUp, Btn } from "../design/dc";
import { radius } from "../theme";
import { evaluateSTRUnderwriting } from "../engine/strUnderwriting";
import type { PropertyInputs } from "../engine/types";

// ── number formatting ──────────────────────────────────────────────────────
const fmt = (n: number) => Number.isFinite(n)
  ? "$" + Math.round(n).toLocaleString("en-US")
  : "Unknown";
const MAX_PRICE = 100_000_000;
const MAX_MONTHLY_RENT = 10_000_000;
const MAX_ANNUAL_COST = 20_000_000;

function rangeError(value: number, min: number, max: number, label: string): string | undefined {
  if (!Number.isFinite(value)) return `${label} is required.`;
  if (value < min || value > max) return `${label} must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`;
  return undefined;
}

// ── DSCR verdict helpers ───────────────────────────────────────────────────
// Uses dc tokens — no hardcoded hex outside the design system.
function dscrColor(d: number): string {
  if (!Number.isFinite(d)) return "rgba(238,239,211,0.35)";
  if (d >= 1.25) return dc.rain;   // RAINFOREST #006565
  if (d >= 1.0) return dc.lemon;   // LEMON #d8d958
  return "#d32f2f";
}
function dscrLabel(d: number): string {
  if (!Number.isFinite(d)) return "INCOMPLETE";
  if (d >= 1.25) return "STRONG";
  if (d >= 1.0) return "QUALIFIES";
  if (d >= 0.75) return "SUB-1.0";
  return "BELOW FLOOR";
}

// ── input field row ────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  value,
  step,
  prefix,
  suffix,
  min,
  max,
  error,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  step: number;
  prefix?: string;
  suffix?: string;
  min: number;
  max: number;
  error?: string;
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
      <div className={`str-field${error ? " str-field-error" : ""}`}>
        {prefix && (
          <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 13 }}>{prefix}</span>
        )}
        <input
          className="str-num"
          type="number"
          step={step}
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ""}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.currentTarget.value === "" ? Number.NaN : e.currentTarget.valueAsNumber)}
          style={{ padding: "10px 6px", fontSize: 15, fontWeight: 600 }}
        />
        {suffix && (
          <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 13 }}>{suffix}</span>
        )}
      </div>
      {error && (
        <span role="alert" style={{ display: "block", color: "#ff8a80", fontSize: 11, lineHeight: 1.4, marginTop: 5 }}>
          {error}
        </span>
      )}
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
    <div className="str-table-scroll" style={{ overflowX: "auto", maxWidth: "100%" }}>
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
            {["Mo", "Index", "Net Rev", "DSCR"].map((h) => (
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
                  {Number.isFinite(m.monthlyDSCR) ? `${m.monthlyDSCR.toFixed(2)}x` : "Unknown"}
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
export const STR_SEASONALITY_GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(12,minmax(0,1fr))",
  gap: 2,
  alignItems: "flex-end",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  height: 96,
};

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
  if (months.length === 0) return null;
  const maxIndex = Math.max(1, ...months.map((m) => Number.isFinite(m.seasonalityIndex) ? m.seasonalityIndex : 0));
  return (
    <div
      style={STR_SEASONALITY_GRID_STYLE}
    >
      {months.map((m) => {
        const heightPct = Number.isFinite(m.seasonalityIndex)
          ? Math.max(0, Math.min(100, (m.seasonalityIndex / maxIndex) * 100))
          : 0;
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
export function formatSTRWorldMonthlyOutput(qualifyingRent: number): string {
  return `${fmt(qualifyingRent)}/mo modeled`;
}

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
  const [leaseRent, setLeaseRent] = useState(3000);
  const [marketRent, setMarketRent] = useState(3000);
  const [documentedRent, setDocumentedRent] = useState(2800);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

  const inputErrors = {
    state: /^[A-Z]{2}$/.test(state) ? undefined : "Enter a two-letter state code.",
    purchasePrice: rangeError(purchasePrice, 1, MAX_PRICE, "Purchase price"),
    ltv: rangeError(ltv, 5, 100, "LTV"),
    rate: rangeError(rate, 0.01, 30, "Note rate"),
    leaseRent: rangeError(leaseRent, 1, MAX_MONTHLY_RENT, "LTR lease rent"),
    marketRent: rangeError(marketRent, 1, MAX_MONTHLY_RENT, "1007 market rent"),
    strRent: rangeError(strRent, 1, MAX_MONTHLY_RENT, "Projected STR revenue"),
    documentedRent: documentedRent === 0
      ? undefined
      : rangeError(documentedRent, 1, MAX_MONTHLY_RENT, "Documented STR revenue"),
    annualTaxes: rangeError(annualTaxes, 0, MAX_ANNUAL_COST, "Annual taxes"),
    annualInsurance: rangeError(annualInsurance, 0, MAX_ANNUAL_COST, "Annual insurance"),
    hoa: rangeError(hoa, 0, MAX_MONTHLY_RENT, "Monthly HOA"),
  };
  const hasBlockingInputError = Object.entries(inputErrors).some(
    ([key, error]) => key !== "documentedRent" && Boolean(error),
  ) || Boolean(inputErrors.documentedRent);

  // ── engine ───────────────────────────────────────────────────────────────
  const result = useMemo(() => {
    if (hasBlockingInputError) return null;
    try {
      const property: PropertyInputs = {
        purchasePrice,
        leaseRent,
        marketRent,
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
      const seasonality = underwriting.monthlySeasonality;
      return { underwriting, legality: underwriting.legalityGate, seasonality, loanAmount };
    } catch {
      return null;
    }
  }, [
    state,
    purchasePrice,
    ltv,
    rate,
    strRent,
    leaseRent,
    marketRent,
    documentedRent,
    annualTaxes,
    annualInsurance,
    hoa,
    hasBlockingInputError,
  ]);

  // ── derived display values ────────────────────────────────────────────────
  const selectedWorld = result
    ? [
        result.underwriting.world1_LTR,
        result.underwriting.world2_Projected,
        result.underwriting.world3_Documented,
      ].find((world) => world.name === result.underwriting.bestWorld)
    : undefined;
  const bestDSCR = selectedWorld && result && result.underwriting.bestQualifyingRent > 0 && Number.isFinite(selectedWorld.dscr)
    ? selectedWorld.dscr
    : null;

  const dscrStr = bestDSCR !== null ? bestDSCR.toFixed(2) + "x" : "—";
  const verdict = bestDSCR !== null ? dscrLabel(bestDSCR) : "INCOMPLETE";
  const vColor = bestDSCR !== null
    ? (bestDSCR >= 1.25 ? dc.emerald : bestDSCR >= 1.0 ? dc.lemon : "#e06363")
    : "rgba(238,239,211,0.35)";

  const grossAnnual = result && result.underwriting.world2_Projected.grossIncome > 0
    ? result.underwriting.world2_Projected.grossIncome * 12
    : null;

  const uwMonthly = result && result.underwriting.bestQualifyingRent > 0
    ? result.underwriting.bestQualifyingRent
    : null;

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
      cta={{ label: "Model an STR →", onClick: scrollToTool }}
    >
      {/* ── spinner-hide + flat input override ─────────────────────────── */}
      <style>{`
        .str-num::-webkit-outer-spin-button,.str-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .str-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
        .str-field{display:flex;align-items:center;min-width:0;background:${dc.teal};border:1.5px solid rgba(238,239,211,0.18);border-radius:${radius.sm};padding:0 12px;transition:border-color .15s;}
        .str-field-error{border-color:#ff8a80;}
        .str-field:focus-within{border-color:${dc.lemon};outline:2px solid ${dc.lemon};outline-offset:1px;}
        .str-field:hover:not(:focus-within){border-color:rgba(238,239,211,0.36);}
        .str-main-grid>*,.str-results{min-width:0;}
        .str-table-scroll,.str-seasonality-chart{max-width:100%;-webkit-overflow-scrolling:touch;}
        @media(max-width:991px){.str-main-grid{grid-template-columns:1fr !important;} .str-3col{grid-template-columns:1fr 1fr !important;}}
        @media(max-width:767px){.str-3col,.str-metrics,.str-worlds-grid{grid-template-columns:1fr !important;} .str-input-card{padding:20px !important;} .str-seasonality-card{padding:16px !important;} .str-metric-card,.str-world-card{padding:18px !important;}}
      `}</style>

      {/* ══ TOOL — dark teal, matches mockup #003a39 ══════════════════════ */}
      <section
        id="str-tool"
        className="str-tool-section"
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
                      Modeled DSCR{" "}
              {bestDSCR === null ? (
                <Mono style={{ color: vColor }}>—</Mono>
              ) : (
                <CountUp value={bestDSCR} decimals={2} suffix="x" style={{ color: vColor }} />
              )}
            </h1>
            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.62)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              {bestDSCR === null
                    ? "Enter assumptions to see the modeled DSCR."
                : bestDSCR >= 1.25
                    ? `Modeled DSCR is ${dscrStr}; the model-selected rent is above the entered monthly payment and expenses. This does not establish approval or lender treatment.`
                : bestDSCR >= 1.0
                ? `DSCR of ${dscrStr} qualifies but is close to the minimum. Check the month-by-month table below — if off-season months dip below 1.0x you'll need cash reserves (months of mortgage payments kept in the bank after closing) to cover the gap.`
                : `DSCR of ${dscrStr} is below 1.0x — the qualifying rent does not cover the full monthly payment. Consider increasing STR revenue projections, reducing the loan amount, or checking if a no-ratio DSCR program (which skips the rent-to-payment test) applies.`}
            </p>
          </div>

          {/* inputs + results split */}
          <div
            className="gs-reveal dc-split str-main-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ─────────────────────────────────────────────── */}
            <div
              className="str-input-card"
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
              Enter user assumptions and update them as evidence becomes available. The model uses LTR rent as a fallback scenario; actual qualifying income is lender- and program-specific.
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
                    aria-invalid={Boolean(inputErrors.state)}
                    onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                    style={{
                      padding: "10px 6px",
                      fontSize: 15,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  />
                </div>
                {inputErrors.state && (
                  <span role="alert" style={{ display: "block", color: "#ff8a80", fontSize: 11, lineHeight: 1.4, marginTop: 5 }}>
                    {inputErrors.state}
                  </span>
                )}
              </label>

              <Field label="Purchase price" hint="What you're paying for the property." value={purchasePrice} step={5000} min={1} max={MAX_PRICE} prefix="$" error={inputErrors.purchasePrice} onChange={setPurchasePrice} />
              <Field label="Loan-to-value (LTV)" hint="Loan amount as a percentage of purchase price. Allowed range: 5% to 100%." value={ltv} step={5} min={5} max={100} suffix="%" error={inputErrors.ltv} onChange={setLtv} />
              <Field label="Note rate" hint="Annual loan interest rate. Allowed range: 0.01% to 30%." value={rate} step={0.125} min={0.01} max={30} suffix="%" error={inputErrors.rate} onChange={setRate} />
              <Field label="LTR lease rent /mo" hint="Monthly rent supported by a signed long-term lease. World 1 uses the lower of this and 1007 market rent." value={leaseRent} step={100} min={1} max={MAX_MONTHLY_RENT} prefix="$" error={inputErrors.leaseRent} onChange={setLeaseRent} />
              <Field label="1007 market rent /mo" hint="Monthly appraiser market rent. World 1 uses the lower of this and the lease rent." value={marketRent} step={100} min={1} max={MAX_MONTHLY_RENT} prefix="$" error={inputErrors.marketRent} onChange={setMarketRent} />
              <Field label="Projected STR revenue /mo" hint="Estimated average gross monthly STR revenue over a full year, including slow months. World 2 applies a 20% haircut." value={strRent} step={100} min={1} max={MAX_MONTHLY_RENT} prefix="$" error={inputErrors.strRent} onChange={setStrRent} />
              <Field label="Documented STR revenue /mo (optional)" hint="Average monthly gross revenue supported by 12 months of platform history. World 3 uses this value exactly with no haircut. Enter 0 if unavailable; World 3 will be clearly excluded, not treated as $0 income." value={documentedRent} step={100} min={0} max={MAX_MONTHLY_RENT} prefix="$" error={inputErrors.documentedRent} onChange={setDocumentedRent} />
              <Field label="Annual property taxes" hint="Property taxes per year. Enter 0 only when the verified amount is zero." value={annualTaxes} step={250} min={0} max={MAX_ANNUAL_COST} prefix="$" error={inputErrors.annualTaxes} onChange={setAnnualTaxes} />
              <Field label="Annual STR insurance" hint="Annual insurance cost, including STR coverage where required." value={annualInsurance} step={100} min={0} max={MAX_ANNUAL_COST} prefix="$" error={inputErrors.annualInsurance} onChange={setAnnualInsurance} />
              <Field label="Monthly HOA dues" hint="Enter 0 if there is no HOA. Verify STR restrictions separately." value={hoa} step={25} min={0} max={MAX_MONTHLY_RENT} prefix="$" error={inputErrors.hoa} onChange={setHoa} />
            </div>

            {/* ── RESULTS ────────────────────────────────────────────── */}
            <div className="str-results" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
                  <p role="alert" style={{ color: "#ff8a80", margin: 0 }}>
                    {hasBlockingInputError
                      ? "Underwriting is incomplete. Correct the highlighted inputs to calculate a result."
                      : "Underwriting is unavailable because the engine could not produce a complete result."}
                  </p>
                </div>
              ) : (
                <>
                  {/* ── THREE METRICS ROW (matches mockup 3-tile strip) ─────── */}
                  <div
                    className="str-metrics"
                    aria-live="polite"
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
                    <div className="str-metric-card" style={{ background: dc.dark, padding: 24, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          letterSpacing: "-0.03em",
                          color: dc.cream,
                        }}
                      >
                        {grossAnnual !== null ? fmt(grossAnnual) : "Unknown"}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 6 }}>
                        projected gross annual
                      </div>
                    </div>
                    <div className="str-metric-card" style={{ background: dc.dark, padding: 24, textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,2.8vw,36px)",
                          fontWeight: 600,
                          letterSpacing: "-0.03em",
                          color: dc.lemon,
                        }}
                      >
                        {uwMonthly !== null ? fmt(uwMonthly) : "Unknown"}
                      </Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 6 }}>
                        governing rent /mo
                      </div>
                    </div>
                    <div className="str-metric-card" style={{ background: dc.dark, padding: 24, textAlign: "center" }}>
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
                        governing DSCR
                      </div>
                    </div>
                  </div>

                  {documentedRent === 0 && (
                    <div role="status" style={{ padding: "12px 16px", background: "rgba(216,217,88,0.08)", border: "1px solid rgba(216,217,88,0.3)", borderRadius: 8, color: dc.lemon, fontSize: 12, lineHeight: 1.5 }}>
                      Documented STR history is not provided. World 3 is unavailable and excluded from the governing-rent comparison; it is not treated as $0 income.
                    </div>
                  )}

                  {/* ── THREE WORLDS ───────────────────────────────────── */}
                  <div style={{ marginBottom: 2 }}>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 8px", lineHeight: 1.5 }}>
                This tool compares available income scenarios and marks the lowest eligible modeled rent as the governing result. World 1 uses the lower of lease and 1007 market rent, World 2 applies its disclosed 20% haircut to projected STR revenue, and World 3 uses documented history exactly as provided with no haircut. Unavailable worlds are excluded rather than treated as zero.
                    </p>
                  </div>
                  <div
                    className="dc-band-3 str-worlds-grid"
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
                      const isBest = world.name === result.underwriting.bestWorld;
                      const isAvailable = world.grossIncome > 0;
                      return (
                        <div
                          key={label}
                          className="str-world-card"
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
                            {isAvailable && Number.isFinite(world.dscr) ? `${world.dscr.toFixed(2)}x` : "Unknown"}
                          </Mono>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "rgba(238,239,211,0.62)",
                              marginTop: 5,
                            }}
                          >
                          {isAvailable ? formatSTRWorldMonthlyOutput(world.qualifyingRent) : "Not provided — excluded"}
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
                  {result.seasonality?.months?.length > 0 && (
                    <div
                      className="str-seasonality-card"
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
                        Each bar applies the model's built-in national seasonality index to the entered revenue. The index's current source date, geography, licensing, and data rights are not established on this page, so treat it as an illustrative pattern rather than market evidence.
                      </p>

                      {/* Signature seasonality bar chart */}
                      <div className="str-seasonality-chart" style={{ marginBottom: 20, overflowX: "auto" }}>
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
                          <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", fontWeight: 500 }}>Qualifies (1.0–1.24x)</span>
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
                        Preliminary legality status — {state || "—"}
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
                      {result.legality.incomeEnabled ? "STR SCENARIOS ELIGIBLE" : "REVIEW REQUIRED"}
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
                    <strong style={{ color: dc.emerald }}>How the scenario rent is chosen:</strong>{" "}
                    Internal state flag for <strong>{state}</strong>: {result.legality.status}. This is not a legal determination. The model currently treats STR income as{" "}
                    {result.legality.incomeEnabled
                      ? " enabled for scenario comparison"
                      : " disabled and falls back to World 1 LTR rent"}
                    . Governing scenario: <strong>{result.underwriting.bestWorld}</strong>,
                    modeled rent used: <strong>{result.underwriting.bestQualifyingRent > 0 ? `${fmt(result.underwriting.bestQualifyingRent)}/mo` : "Unknown — inputs incomplete"}</strong>. Verify current local law, licensing, program rules, evidence requirements, and the property's actual operating history.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 12, marginTop: 24, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            Illustrative STR scenario only. Revenue, seasonality, occupancy, local legality, expense, and income-qualification outputs depend on user inputs and internal model assumptions. They are not income forecasts, legal advice, approvals, or lender determinations.
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
                STR qualifies?
              </div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>
                Get your STR rate from Greenstreet.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch", letterSpacing: "-0.01em" }}>
                Request a scenario review to compare the model with current program requirements. Documentation, qualifying income, placement, and available terms vary.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <Btn label="Get my rate" href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} />
              <Btn label="Browse STR programs" variant="secondary" arrow={false} href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }} />
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
