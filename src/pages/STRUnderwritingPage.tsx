import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, HeroProof } from "../design/dc";
import { evaluateSTRUnderwriting, checkSTRLegality } from "../engine/strUnderwriting";
import type { PropertyInputs } from "../engine/types";

// ── number formatting ──────────────────────────────────────────────────────
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── DSCR verdict helpers ───────────────────────────────────────────────────
function dscrColor(d: number): string {
  if (d >= 1.25) return dc.rain;
  if (d >= 1.0) return "#a16207";
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
    <label style={{ display: "block", marginBottom: 14 }}>
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "rgba(0,55,56,0.5)",
          marginBottom: 6,
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
          <span style={{ color: "rgba(0,55,56,0.4)", fontSize: 13 }}>
            {prefix}
          </span>
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
          <span style={{ color: "rgba(0,55,56,0.4)", fontSize: 13 }}>
            {suffix}
          </span>
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
  const MINT = dc.rain;
  const AMBER = "#a16207";
  const RED = "#d32f2f";
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
            {["Mo", "Index", "Proj Rev", "UW Rev", "DSCR"].map((h) => (
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
                ? MINT
                : m.monthlyDSCR >= 1.0
                ? AMBER
                : RED;
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
                    color: dc.dark,
                    borderBottom: "1px solid rgba(0,55,56,0.07)",
                  }}
                >
                  {fmt(m.haircutRevenue)}
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
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [ltv, setLtv] = useState(75);
  const [rate, setRate] = useState(7.0);
  const [strRent, setStrRent] = useState(4500);        // STR projected monthly
  const [ltvRent, setLtvRent] = useState(3000);         // LTR lease rent
  const [documentedRent, setDocumentedRent] = useState(2800); // STR documented 12-mo
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
      const loanAmount = purchasePrice * (1 - ltv / 100);
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
    : 1.11;

  const dscrStr = bestDSCR.toFixed(2) + "x";
  const verdict = dscrLabel(bestDSCR);
  const vColor = dscrColor(bestDSCR);

  const grossAnnual = result
    ? result.underwriting.world2_Projected.qualifyingRent * 12 /
      (1 - 0.2) /* undo 20% haircut to get gross */
    : 0;

  const uwMonthly = result
    ? result.underwriting.bestQualifyingRent
    : 0;

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

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
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
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "clamp(32px,5vw,72px)",
            alignItems: "center",
          }}
        >
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
              Short-term rental · ADR × occupancy × seasonality
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
              Will the STR
              <br />
              cash flow in
              <br />
              the off-season?
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(238,239,211,0.7)",
                maxWidth: "46ch",
                margin: "0 0 36px",
              }}
            >
              Three underwriting worlds — LTR lease, STR projected, STR
              documented — run against a national seasonality curve. See the
              DSCR a lender will actually qualify.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.("state-laws");
                }}
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
                State STR rules
              </a>
            </div>
            {/* stats row */}
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
                  3
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  underwriting worlds
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
                  12
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  months modeled
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
                  1.11x
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  sample off-season DSCR
                </div>
              </div>
            </div>
          </div>

          {/* Hero proof — wired to live best-world DSCR */}
          <HeroProof
            eyebrow="Underwritten DSCR"
            value={dscrStr}
            sub={`Best world: ${result?.underwriting.bestWorld ?? "—"} · ${fmt(uwMonthly)}/mo qualifying`}
            chip={{ label: verdict, color: vColor }}
          />
        </div>
      </section>

      {/* ══ 3-STEP BAND ═══════════════════════════════════════════════════ */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="gs-reveal dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "rgba(0,55,56,0.12)",
              borderRadius: 9,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: dc.cream,
                padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: dc.lemon,
                  marginBottom: 14,
                  lineHeight: 1,
                }}
              >
                01
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(20px,2.2vw,28px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 10px",
                  lineHeight: 1.1,
                }}
              >
                Legality
              </h3>
              <p
                style={{
                  fontSize: "clamp(15px,1.2vw,17px)",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(0,55,56,0.6)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                State STR gate runs first. Blocked markets fall back to LTR
                lease rent — no blending.
              </p>
            </div>

            <div
              style={{
                background: dc.dark,
                color: dc.cream,
                padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: dc.emerald,
                  marginBottom: 14,
                  lineHeight: 1,
                }}
              >
                02
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(20px,2.2vw,28px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 10px",
                  lineHeight: 1.1,
                  color: dc.cream,
                }}
              >
                Three worlds
              </h3>
              <p
                style={{
                  fontSize: "clamp(15px,1.2vw,17px)",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(238,239,211,0.65)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                World 1 LTR, World 2 STR projected (20% haircut), World 3 STR
                documented (10% haircut). Engine picks the best.
              </p>
            </div>

            <div
              style={{
                background: dc.lemon,
                padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "rgba(0,55,56,0.5)",
                  marginBottom: 14,
                  lineHeight: 1,
                }}
              >
                03
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(20px,2.2vw,28px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 10px",
                  lineHeight: 1.1,
                }}
              >
                Seasonality
              </h3>
              <p
                style={{
                  fontSize: "clamp(15px,1.2vw,17px)",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(0,55,56,0.65)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                12-month revenue curve from US national AirDNA index. Off-season
                months flagged so you see the worst-case DSCR.
              </p>
            </div>
          </div>
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
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              Live STR engine
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,52px)",
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
              gridTemplateColumns: "300px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ─────────────────────────────────────────────── */}
            <div
              style={{
                background: dc.white,
                borderRadius: 9,
                padding: 26,
                border: "1px solid rgba(0,55,56,0.1)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.rain,
                  marginBottom: 18,
                }}
              >
                STR assumptions
              </div>

              {/* State dropdown */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 6,
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
                    onChange={(e) =>
                      setState(e.target.value.toUpperCase().slice(0, 2))
                    }
                    style={{
                      padding: "10px 6px",
                      fontSize: 15,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  />
                </div>
              </label>

              <Field
                label="Purchase Price"
                value={purchasePrice}
                step={5000}
                prefix="$"
                onChange={setPurchasePrice}
              />
              <Field
                label="Down Payment"
                value={ltv}
                step={5}
                suffix="%"
                onChange={(v) => setLtv(100 - v)}
              />
              <Field
                label="Note Rate"
                value={rate}
                step={0.125}
                suffix="%"
                onChange={setRate}
              />
              <Field
                label="LTR Lease Rent /mo"
                value={ltvRent}
                step={100}
                prefix="$"
                onChange={setLtvRent}
              />
              <Field
                label="STR Projected /mo"
                value={strRent}
                step={100}
                prefix="$"
                onChange={setStrRent}
              />
              <Field
                label="STR Documented /mo"
                value={documentedRent}
                step={100}
                prefix="$"
                onChange={setDocumentedRent}
              />
              <Field
                label="Annual Taxes"
                value={annualTaxes}
                step={250}
                prefix="$"
                onChange={setAnnualTaxes}
              />
              <Field
                label="Annual Insurance"
                value={annualInsurance}
                step={100}
                prefix="$"
                onChange={setAnnualInsurance}
              />
              <Field
                label="Monthly HOA"
                value={hoa}
                step={25}
                prefix="$"
                onChange={setHoa}
              />
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
                  <p style={{ color: "#d32f2f", margin: 0 }}>
                    Engine returned no result. Check inputs.
                  </p>
                </div>
              ) : (
                <>
                  {/* ── LEGALITY GATE ──────────────────────────────────── */}
                  <div
                    style={{
                      background: dc.dark,
                      borderRadius: 9,
                      padding: 24,
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
                          marginBottom: 8,
                        }}
                      >
                        Legality gate — {state || "—"}
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color:
                            result.legality.status === "CLEAR"
                              ? dc.emerald
                              : result.legality.status === "RESTRICTED"
                              ? "#d32f2f"
                              : "#a16207",
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
                          margin: "8px 0 0",
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
                        color: result.legality.incomeEnabled
                          ? dc.emerald
                          : "#d32f2f",
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
                      },
                      {
                        label: "World 2 — Projected",
                        world: result.underwriting.world2_Projected,
                        bg: dc.lemon,
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
                            outline: isBest
                              ? `2px solid ${dc.rain}`
                              : undefined,
                            outlineOffset: isBest ? -2 : undefined,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: dark
                                ? "rgba(238,239,211,0.5)"
                                : "rgba(0,55,56,0.5)",
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
                              color: dark
                                ? "rgba(238,239,211,0.5)"
                                : "rgba(0,55,56,0.5)",
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
                                color: dc.rain,
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

                  {/* ── BEST WORLD SUMMARY ─────────────────────────────── */}
                  <div
                    style={{
                      background: dc.white,
                      borderRadius: 9,
                      padding: 22,
                      border: `1px solid rgba(0,55,56,0.1)`,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(24px,3vw,38px)",
                          fontWeight: 600,
                          color: vColor,
                        }}
                      >
                        {dscrStr}
                      </Mono>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(0,55,56,0.5)",
                          marginTop: 5,
                        }}
                      >
                        underwritten DSCR
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(24px,3vw,38px)",
                          fontWeight: 600,
                          color: dc.dark,
                        }}
                      >
                        {fmt(uwMonthly)}
                      </Mono>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(0,55,56,0.5)",
                          marginTop: 5,
                        }}
                      >
                        qualifying /mo
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(24px,3vw,38px)",
                          fontWeight: 600,
                          color: dc.dark,
                        }}
                      >
                        {(result.underwriting.haircutPercent * 100).toFixed(0)}%
                      </Mono>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(0,55,56,0.5)",
                          marginTop: 5,
                        }}
                      >
                        haircut applied
                      </div>
                    </div>
                  </div>

                  {/* ── MONTHLY SEASONALITY ────────────────────────────── */}
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
                          color: dc.rain,
                          marginBottom: 6,
                        }}
                      >
                        Month-by-month seasonality
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "rgba(0,55,56,0.5)",
                          margin: "0 0 14px",
                          lineHeight: 1.5,
                        }}
                      >
                        US national AirDNA index · UW Rev = projected after
                        haircut · off-season months are DSCR &lt; 1.0
                      </p>

                      {/* mini bar chart */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(12,1fr)",
                          gap: 4,
                          marginBottom: 18,
                        }}
                      >
                        {result.seasonality.months.map((m) => {
                          const barH = Math.max(
                            16,
                            (m.seasonalityIndex / 140) * 64,
                          );
                          const c = dscrColor(m.monthlyDSCR);
                          return (
                            <div
                              key={m.month}
                              style={{
                                background: "rgba(0,55,56,0.04)",
                                borderRadius: 6,
                                padding: "6px 3px",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 9,
                                  color: "rgba(0,55,56,0.4)",
                                  marginBottom: 3,
                                }}
                              >
                                {m.month}
                              </div>
                              <div
                                style={{
                                  height: barH,
                                  background: `${c}22`,
                                  borderRadius: 3,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: c,
                                  fontWeight: 700,
                                  fontSize: 9,
                                  fontFamily: dc.mono,
                                  marginBottom: 3,
                                }}
                              >
                                {m.seasonalityIndex}
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  color: dc.dark,
                                  fontWeight: 700,
                                  fontFamily: dc.mono,
                                }}
                              >
                                {m.monthlyDSCR.toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
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
                            {result.seasonality.offSeasonMonths.length} off-season
                            month
                            {result.seasonality.offSeasonMonths.length > 1
                              ? "s"
                              : ""}
                            :
                          </strong>{" "}
                          {result.seasonality.offSeasonMonths.join(", ")} — DSCR
                          below 1.0. Reserve cash to cover PITIA gaps.
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ENGINE FOOTNOTE ────────────────────────────────── */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "rgba(0,101,101,0.06)",
                      borderRadius: 9,
                      border: "1px solid rgba(0,55,56,0.1)",
                      fontSize: 12,
                      color: "rgba(0,55,56,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: dc.rain }}>Engine:</strong>{" "}
                    src/engine/strUnderwriting.ts →{" "}
                    <code>evaluateSTRUnderwriting</code> +{" "}
                    <code>checkSTRLegality</code> +{" "}
                    <code>computeSTRMonthlySeasonality</code>. State{" "}
                    <strong>{state}</strong>:{" "}
                    {result.legality.status} — STR income{" "}
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
