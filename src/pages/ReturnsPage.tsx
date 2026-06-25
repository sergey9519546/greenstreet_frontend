import React, { useState, useRef, useCallback } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { computeReturns } from "../engine/returnsEngine";
import type { PropertyInputs, LoanStructure } from "../engine/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt$(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// Inline IRR bisection matching the mockup's calcIRR logic.
// Used only for the sensitivity matrix rows/cols that the real engine matrix
// doesn't expose (it uses its own HOLD_PERIODS / RENT_GROWTH_SCENARIOS).
// We replicate the same cash-flow model as the engine for consistency.
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
}): number {
  const {
    purchasePrice,
    ltv,
    rate,
    monthlyRent,
    annualTaxes,
    annualInsurance,
    hoa,
    holdYears,
    exitCapRate,
    rentGrowth,
    vacancy,
    prepayAtExit,
  } = opts;

  const loan = purchasePrice * (ltv / 100);
  const cashInv = purchasePrice - loan;
  const r = rate / 100 / 12;
  const n = 360;
  const piMo =
    r === 0
      ? loan / n
      : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const remBal = (elapsed: number) => {
    if (elapsed >= n) return 0;
    if (r === 0) return loan * (1 - elapsed / n);
    const f = Math.pow(1 + r, n);
    const e = Math.pow(1 + r, elapsed);
    return Math.max(0, (loan * (f - e)) / (f - 1));
  };

  const hold = Math.max(1, Math.min(15, holdYears));
  const cfs: number[] = [-cashInv];

  // NOI must match returnsEngine: mgmt 8% + maint 5% + turnover 2% of GROSS rent
  // (before vacancy). Omitting these overstates IRR — dangerous for a lending tool.
  const OPEX_PCT = 15;
  const noiForYear = (yrOffset: number) => {
    const gross = monthlyRent * 12 * Math.pow(1 + rentGrowth / 100, yrOffset);
    const egi = gross * (1 - vacancy / 100);
    return egi - annualTaxes - annualInsurance - hoa * 12 - gross * (OPEX_PCT / 100);
  };

  for (let yr = 1; yr <= hold; yr++) {
    const noi = noiForYear(yr - 1);
    let cf = noi - piMo * 12;
    if (yr === hold) {
      const stabNOI = noiForYear(yr); // next-year stabilized NOI capitalizes the exit
      const exit = stabNOI / (exitCapRate / 100);
      const bal = remBal(hold * 12);
      cf += exit - exit * 0.06 - bal - loan * (prepayAtExit / 100);
    }
    cfs.push(cf);
  }

  const f = (rate_: number) =>
    cfs.reduce((s, c, i) => s + c / Math.pow(1 + rate_, i), 0);

  let lo = -0.9,
    hi = 5;
  const flo = f(lo);
  // No sign change ⇒ no real IRR root. Return NaN (rendered as "—"), NOT 0 —
  // a literal 0.0% reads as a real result next to the -66%/-47% neighbors.
  if (flo * f(hi) > 0) return NaN;
  let curFlo = flo;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    const fm = f(m);
    if (Math.abs(fm) < 1) return m;
    if (curFlo * fm < 0) {
      hi = m;
    } else {
      lo = m;
      curFlo = fm;
    }
  }
  return (lo + hi) / 2;
}

// ─── component ──────────────────────────────────────────────────────────────

export default function ReturnsPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  // Inputs matching the mockup defaults
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [ltv, setLtv] = useState(75);
  const [rate, setRate] = useState(7.0);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);
  const [holdYears, setHoldYears] = useState(5);
  const [exitCapRate, setExitCapRate] = useState(6.5);
  const [rentGrowth, setRentGrowth] = useState(3);
  const [vacancy, setVacancy] = useState(8);
  const [prepayAtExit, setPrepayAtExit] = useState(2);

  // Scroll to tool
  const scrollToTool = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#rt-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  }, []);

  // ── Real engine call ──────────────────────────────────────────────────────
  const engineResult = React.useMemo(() => {
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
        ltv,
        term: "30_YR",
        ioPeriod: "NONE",
        armType: "FIXED",
        prepayPreference: "321",
        purpose: "PURCHASE",
        expectedHoldYears: holdYears,
        points: 0,
        lenderFees: 0,
        brokerFees: 0,
        rateLockCost: 0,
      };
      const penalty = (prepayAtExit / 100) * (purchasePrice * (1 - ltv / 100));
      return computeReturns(property, loan, monthlyRent, "LTR", rate, penalty);
    } catch {
      return null;
    }
  }, [purchasePrice, ltv, monthlyRent, rate, holdYears, rentGrowth, vacancy, annualTaxes, annualInsurance, hoa, prepayAtExit]);

  // ── Derived display values wired to real engine ──────────────────────────
  const irrOpts = {
    purchasePrice,
    ltv,
    rate,
    monthlyRent,
    annualTaxes,
    annualInsurance,
    hoa,
    holdYears,
    exitCapRate,
    rentGrowth,
    vacancy,
    prepayAtExit,
  };

  // IRR via the inline model so the headline honors *every* input the user can
  // edit — exit cap, rent growth, vacancy, prepay — exactly like the sensitivity
  // matrix below. computeReturns uses fixed internal exit assumptions, so the
  // engine IRR would ignore those three fields and the headline would go stale.
  const levIRR = calcIRR(irrOpts) * 100;
  const unlIRR = calcIRR({ ...irrOpts, ltv: 0 }) * 100;

  const cashInv = purchasePrice * (1 - ltv / 100);
  const em = engineResult !== null ? engineResult.equityMultiple : 1;

  const irrColor =
    levIRR >= 12 ? dc.emerald : levIRR >= 8 ? dc.lemon : "#ff6b6b";
  const verdictLabel =
    levIRR >= 12 ? "STRONG DEAL" : levIRR >= 8 ? "WORKABLE" : "WEAK";

  // "—" when there's no real IRR (NaN) instead of a misleading number.
  const pct = (v: number) => (Number.isFinite(v) ? v.toFixed(1) + "%" : "—");
  const irrStr = pct(levIRR);
  const emStr = em.toFixed(2) + "x";

  // Hero bars scale to the real computed returns (20% IRR ≈ full bar), so the
  // heights are honest and animate live as inputs change.
  const barH = (v: number) => (Number.isFinite(v) ? `${Math.max(6, Math.min(72, (v / 20) * 72))}%` : "6%");

  // Returns stack — engine already returns these as percentages (see returnsEngine
  // lines 156-159: `x * 10000 / 100`), so do NOT scale again.
  const entryCapRate = engineResult !== null ? engineResult.entryCapRate : 0;
  const yoc = engineResult !== null ? engineResult.yieldOnCost : 0;
  const debtYield = engineResult !== null ? engineResult.debtYield : 0;
  const coc = engineResult !== null ? engineResult.year1CashOnCash : 0;

  const stack = [
    { label: "Entry Cap Rate", val: entryCapRate.toFixed(2) + "%", color: dc.cream },
    { label: "Yield on Cost", val: yoc.toFixed(2) + "%", color: dc.cream },
    { label: "Debt Yield", val: debtYield.toFixed(2) + "%", color: dc.cream },
    { label: "CoC Return", val: coc.toFixed(1) + "%", color: coc >= 8 ? dc.emerald : dc.lemon },
    { label: "Unlevered IRR", val: pct(unlIRR), color: dc.cream },
    { label: "Equity Multiple", val: emStr, color: dc.emerald },
  ];

  // Sensitivity matrix — 5 hold × 4 rent-growth cells, inline bisection for grid
  const holds = [3, 5, 7, 10, 12];
  const growths = [1, 2, 3, 4];

  // Input fields definition
  const fields: Array<{
    label: string;
    key: keyof typeof irrOpts;
    step: number;
    prefix?: string;
    suffix?: string;
    value: number;
    set: (v: number) => void;
  }> = [
    { label: "Purchase Price", key: "purchasePrice", step: 5000, prefix: "$", value: purchasePrice, set: setPurchasePrice },
    { label: "LTV", key: "ltv", step: 1, suffix: "%", value: ltv, set: setLtv },
    { label: "Note Rate", key: "rate", step: 0.125, suffix: "%", value: rate, set: setRate },
    { label: "Monthly Rent", key: "monthlyRent", step: 100, prefix: "$", value: monthlyRent, set: setMonthlyRent },
    { label: "Annual Taxes", key: "annualTaxes", step: 250, prefix: "$", value: annualTaxes, set: setAnnualTaxes },
    { label: "Annual Insurance", key: "annualInsurance", step: 100, prefix: "$", value: annualInsurance, set: setAnnualInsurance },
    { label: "Hold Years", key: "holdYears", step: 1, value: holdYears, set: setHoldYears },
    { label: "Exit Cap Rate", key: "exitCapRate", step: 0.25, suffix: "%", value: exitCapRate, set: setExitCapRate },
    { label: "Rent Growth", key: "rentGrowth", step: 0.5, suffix: "%", value: rentGrowth, set: setRentGrowth },
    { label: "Vacancy", key: "vacancy", step: 1, suffix: "%", value: vacancy, set: setVacancy },
  ];

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.dark}
      navLinks={[
        { label: "DSCR", view: "dscr-calculator" },
        { label: "Tax Engine", view: "tax-engine" },
      ]}
      cta={{ label: "Compute IRR →", onClick: scrollToTool }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────── */}
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
          {/* Left: hero copy */}
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
              Returns &amp; IRR &middot; Levered + Unlevered &middot; 16-cell sensitivity
            </div>
            <H1 style={{ margin: "0 0 28px" }}>
              The full return, not just the cash flow.
            </H1>
            <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "46ch", margin: "0 0 36px" }}>
              Levered and unlevered IRR, equity multiple, yield-on-cost, break-even
              occupancy, and a hold &times; rent-growth &times; exit-cap matrix.
            </Lead>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Btn label="Run returns engine" href="#rt-tool" onClick={scrollToTool} />
            </div>
          </div>

          {/* Right: animated bar chart */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "clamp(8px,2vw,20px)",
              height: "clamp(160px,22vh,240px)",
            }}
          >
            <HeroBar
              heightPct={barH(coc)}
              gradient="linear-gradient(180deg,#4dbd97,#006565)"
              label="CoC"
              valLabel={coc.toFixed(1) + "%"}
              valColor={dc.emerald}
            />
            <HeroBar
              heightPct={barH(unlIRR)}
              gradient="linear-gradient(180deg,#4dbd97,#006565)"
              label="Unlev."
              valLabel={unlIRR.toFixed(1) + "%"}
              valColor={dc.emerald}
            />
            <HeroBar
              heightPct={barH(levIRR)}
              gradient={`linear-gradient(180deg,${dc.lemon},#a8a838)`}
              label="Lev. IRR"
              valLabel={irrStr}
              valColor={dc.lemon}
              flex={1.3}
            />
          </div>
        </div>
      </section>


      {/* ── 3-STEP BAND ─────────────────────────────────────────────── */}
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
              gap: 1,
              background: "rgba(0,55,56,0.12)",
              borderRadius: 9,
              overflow: "hidden",
            }}
          >
            <StepCard
              num="01"
              numColor={dc.lemon}
              bg={dc.cream}
              heading="Deal inputs"
              body="Price, LTV, rate, rent, hold years, exit cap rate, rent growth and vacancy."
              bodyColor="rgba(0,55,56,0.6)"
            />
            <StepCard
              num="02"
              numColor={dc.emerald}
              bg={dc.dark}
              headingColor={dc.cream}
              heading="IRR engine"
              body="Cash-flow bisection for levered and unlevered IRR. Proper amortization every step."
              bodyColor="rgba(238,239,211,0.65)"
            />
            <StepCard
              num="03"
              numColor="rgba(0,55,56,0.5)"
              bg={dc.lemon}
              heading="Sensitivity"
              body="5×4 hold × rent-growth matrix. Every cell uses exact amortization for the exit balance."
              bodyColor="rgba(0,55,56,0.65)"
            />
          </div>
        </div>
      </section>

      {/* ── TOOL ────────────────────────────────────────────────────── */}
      <section
        id="rt-tool"
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
              Live returns engine
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
              Levered IRR{" "}
              <span style={{ color: irrColor }}>{irrStr}</span>{" "}
              &middot; {emStr} equity multiple
            </h2>
          </div>

          {/* Grid: inputs | results */}
          <div
            className="gs-reveal dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "360px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── Inputs panel ── */}
            <div
              style={{
                background: dc.white,
                borderRadius: 9,
                padding: 28,
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
                  marginBottom: 20,
                }}
              >
                Deal inputs
              </div>
              {fields.map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
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
                    {f.label}
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
                    {f.prefix && (
                      <span style={{ color: "rgba(0,55,56,0.4)" }}>{f.prefix}</span>
                    )}
                    <input
                      className="gs-num"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => f.set(+e.target.value)}
                      style={{ padding: "10px 6px", fontSize: 15, fontWeight: 600 }}
                    />
                    {f.suffix && (
                      <span style={{ color: "rgba(0,55,56,0.4)" }}>{f.suffix}</span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* ── Results column ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Big IRR card */}
              <div
                style={{
                  background: dc.dark,
                  borderRadius: 12,
                  padding: "clamp(28px,3.5vw,44px)",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <Mono
                    style={{
                      fontSize: "clamp(64px,8vw,108px)",
                      fontWeight: 600,
                      letterSpacing: "-0.04em",
                      color: irrColor,
                      lineHeight: 0.9,
                      display: "block",
                    }}
                  >
                    {irrStr}
                  </Mono>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: irrColor,
                      marginTop: 10,
                    }}
                  >
                    {verdictLabel}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  {stack.map((r) => (
                    <div
                      key={r.label}
                      style={{
                        background: "rgba(238,239,211,0.05)",
                        borderRadius: 8,
                        padding: 14,
                      }}
                    >
                      <Mono
                        style={{
                          fontSize: "clamp(17px,1.8vw,22px)",
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: r.color,
                          display: "block",
                        }}
                      >
                        {r.val}
                      </Mono>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(238,239,211,0.45)",
                          marginTop: 4,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {r.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sensitivity matrix */}
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
                    color: dc.rain,
                    marginBottom: 6,
                  }}
                >
                  Hold &times; Rent Growth sensitivity (Levered IRR)
                </div>
                <Mono
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,55,56,0.45)",
                    marginBottom: 14,
                    display: "block",
                  }}
                >
                  rows = hold years &middot; cols = annual rent growth
                </Mono>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 380,
                      fontFamily: dc.mono,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "5px 8px",
                            fontSize: 10,
                            color: "rgba(0,55,56,0.45)",
                            textAlign: "left",
                            fontWeight: 500,
                          }}
                        >
                          Hold
                        </th>
                        {growths.map((gr) => (
                          <th
                            key={gr}
                            style={{
                              padding: "5px 8px",
                              fontSize: 10,
                              color: "rgba(0,55,56,0.45)",
                              textAlign: "right",
                              fontWeight: 500,
                            }}
                          >
                            +{gr}%
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holds.map((h) => (
                        <tr key={h}>
                          <td
                            style={{
                              padding: "7px 8px",
                              fontSize: 12,
                              color: dc.dark,
                              fontWeight: 600,
                            }}
                          >
                            {h}yr
                          </td>
                          {growths.map((gr) => {
                            const r =
                              calcIRR({ ...irrOpts, holdYears: h, rentGrowth: gr }) * 100;
                            const cellColor =
                              r >= 14
                                ? dc.rain
                                : r >= 10
                                ? "#018582"
                                : r >= 6
                                ? "#9a7b00"
                                : "#ff6b6b";
                            const cellBg =
                              r >= 14 ? "rgba(0,101,101,0.1)" : "transparent";
                            return (
                              <td
                                key={gr}
                                style={{
                                  padding: "7px 8px",
                                  textAlign: "right",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: cellColor,
                                  background: cellBg,
                                  borderRadius: 4,
                                }}
                              >
                                {Number.isFinite(r) ? r.toFixed(1) + "%" : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────

function HeroBar({
  heightPct,
  gradient,
  label,
  valLabel,
  valColor,
  flex = 1,
}: {
  heightPct: string;
  gradient: string;
  label: string;
  valLabel: string;
  valColor: string;
  flex?: number;
}) {
  // Animate on mount via a simple CSS transition driven by a ref toggle
  const ref = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    // Let the browser paint at 0 first, then transition to target height
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (ref.current) ref.current.style.height = heightPct;
      });
    });
  }, [heightPct]);

  return (
    <div
      ref={ref}
      style={{
        flex,
        background: gradient,
        borderRadius: "6px 6px 0 0",
        height: 0,
        transition: "height 1.1s cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 8,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, -100%)",
          fontSize: 11,
          fontWeight: 700,
          color: valColor,
          marginBottom: 6,
          whiteSpace: "nowrap",
          paddingBottom: 6,
        }}
      >
        {valLabel}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(238,239,211,0.5)",
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function StepCard({
  num,
  numColor,
  bg,
  heading,
  headingColor,
  body,
  bodyColor,
}: {
  num: string;
  numColor: string;
  bg: string;
  heading: string;
  headingColor?: string;
  body: string;
  bodyColor: string;
}) {
  return (
    <div
      style={{
        background: bg,
        padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
      }}
    >
      <Mono
        style={{
          fontSize: "clamp(32px,4vw,52px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: numColor,
          marginBottom: 14,
          lineHeight: 1,
          display: "block",
        }}
      >
        {num}
      </Mono>
      <h3
        style={{
          fontSize: "clamp(20px,2.2vw,28px)",
          fontWeight: 600,
          letterSpacing: "-0.025em",
          margin: "0 0 10px",
          lineHeight: 1.1,
          color: headingColor,
        }}
      >
        {heading}
      </h3>
      <p
        style={{
          fontSize: "clamp(15px,1.2vw,17px)",
          fontWeight: 500,
          lineHeight: 1.55,
          color: bodyColor,
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {body}
      </p>
    </div>
  );
}
