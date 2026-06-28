import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { computeAfterTaxIRR } from "../engine/taxEngine";
import { calculatePI } from "../engine/engine";
import type { TaxProfile, FilingStatus } from "../engine/types";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function TaxEnginePage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  React.useEffect(() => {
    document.title = "Tax Engine | Greenstreet Finance";
  }, []);

  // ── Inputs ──
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [landPct, setLandPct] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(3800);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);
  const [rate, setRate] = useState(7.0);
  const [ltv, setLtv] = useState(75);
  const [holdYears, setHoldYears] = useState(5);
  const [rentGrowth, setRentGrowth] = useState(3);
  const [magi, setMagi] = useState(150000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("MFJ");
  const [isRep, setIsRep] = useState(false);
  const [stateRate, setStateRate] = useState(5);
  const [exitPppPct, setExitPppPct] = useState(1.0);

  // ── Engine ──
  const result = useMemo(() => {
    try {
      const loanAmount = purchasePrice * (ltv / 100);
      const piMonthly = calculatePI(loanAmount, rate, 360);
      const ads = piMonthly * 12;
      const annualNOI =
        monthlyRent * 12 * 0.85 - annualTaxes - annualInsurance - hoa * 12;
      const pitiaMonthly =
        piMonthly + annualTaxes / 12 + annualInsurance / 12 + hoa;
      const taxProfile: TaxProfile = {
        ordinaryIncomeBrackets: [],
        magi,
        filingStatus,
        stateTaxRatePct: stateRate,
        isRealEstateProfessional: isRep,
        yearsREP: isRep ? 5 : 0,
        landAllocationPct: landPct,
        costSegStudyCompleted: false,
        costSegReclassifiedPct: 0,
        acquisitionDate: "2024-01-01",
        placedInServiceDate: "2024-01-01",
        expectedHoldYears: holdYears,
        exitSellingCostsPct: 7,
        exitCapRatePct: 6.5,
        section1031Exchange: false,
      };
      return computeAfterTaxIRR(
        purchasePrice,
        loanAmount,
        monthlyRent,
        annualNOI,
        ads,
        pitiaMonthly,
        taxProfile,
        (exitPppPct / 100) * loanAmount,
        rate,
        360,
      );
    } catch {
      return null;
    }
  }, [
    purchasePrice,
    landPct,
    monthlyRent,
    annualTaxes,
    annualInsurance,
    hoa,
    rate,
    ltv,
    holdYears,
    rentGrowth,
    magi,
    filingStatus,
    isRep,
    stateRate,
    exitPppPct,
  ]);

  // ── Derived display values ──
  const afterTaxIRR = result?.afterTaxIRR ?? 0;
  const preTaxIRR = result?.preTaxIRR ?? 0;
  const drag = result?.irrImpactOfTaxes ?? 0;

  // Guard display: show "—" when result is null or IRR is exactly 0 (no confident value).
  const hasResult = result !== null && afterTaxIRR !== 0;

  // Engine returns IRR/drag as decimal fractions (e.g. 0.107 = 10.7%); scale to %.
  const afterTaxStr = hasResult ? (afterTaxIRR * 100).toFixed(1) + "%" : "—";
  const preTaxStr   = hasResult ? (preTaxIRR * 100).toFixed(1) + "%" : "—";
  const dragStr     = hasResult ? (drag * 100).toFixed(1) + " pts" : "—";

  const irrColor =
    !hasResult ? "rgba(238,239,211,0.3)"
    : afterTaxIRR >= 0.1 ? dc.emerald
    : afterTaxIRR >= 0.06 ? dc.lemon
    : "#e06363";

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#te-tool");
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
        { label: "Deal Analyzer", view: "deal-analyzer" },
      ]}
      cta={{ label: "Compute IRR →", onClick: scrollToTool }}
    >
      {/* Input-spinner suppression only */}
      <style>{`
        .te-num::-webkit-outer-spin-button,.te-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .te-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
        .te-sel{width:100%;border:none;outline:none;font-family:${dc.sans};-webkit-appearance:none;cursor:pointer;background:transparent;color:${dc.cream};letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO — lemon field, dark ink ── */}
      <section
        style={{
          position: "relative",
          background: dc.lemon,
          color: dc.dark,
          overflow: "hidden",
          minHeight: "clamp(480px,60vh,760px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* subtle dot grid in dark ink at low opacity */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(0,55,56,0.06) 1px,transparent 1px)",
            backgroundSize: "34px 34px",
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
                color: "rgba(238,239,211,0.62)",
                background: "rgba(238,239,211,0.06)",
                border: "1px solid rgba(238,239,211,0.18)",
                padding: "7px 14px",
                borderRadius: 100,
                marginBottom: 24,
              }}
            >
              Tax Engine &middot; &sect;167 &middot; &sect;469 &middot; &sect;1250 &middot; NIIT
            </div>
            <H1 style={{ margin: "0 0 28px" }}>
              What does this property really earn after taxes?
            </H1>
            <Lead style={{ color: "rgba(0,55,56,0.72)", maxWidth: "48ch", margin: "0 0 20px" }}>
              Most return calculators ignore taxes. This one doesn't. Enter your deal and tax profile and see: your depreciation tax shield (the annual tax saving from writing off the building), the tax bill at exit (depreciation recapture + capital gains + NIIT), and the after-tax IRR — what you actually keep.
            </Lead>
            <p style={{ color: "rgba(0,55,56,0.55)", fontSize: 14, fontWeight: 500, margin: "0 0 32px", lineHeight: 1.5 }}>
              How to use: fill in the deal numbers and your income situation on the left. Compare the after-tax IRR to the pre-tax IRR — the gap is your tax drag. Real estate professional status (750hr + 50% test) can dramatically reduce that drag.
            </p>
            {/* Dark-fill button — the lemon-fill primary would vanish on this lemon hero */}
            <a
              href="#te-tool"
              onClick={scrollToTool}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, background: dc.dark, color: dc.cream, fontWeight: 600, fontSize: 16, textDecoration: "none", padding: "16px 32px", borderRadius: dc.r.md, fontFamily: dc.sans }}
            >
              Open the tax engine <span style={{ fontSize: 18 }}>→</span>
            </a>
          </div>

          {/* Right — live IRR card matching the mockup's dark teal panel */}
          <div
            style={{
              background: dc.dark,
              borderRadius: 16,
              padding: 28,
              color: dc.cream,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: dc.lemon,
                marginBottom: 16,
              }}
            >
              After-Tax IRR Engine
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 18 }}>
              {[
                {
                  label: "Depreciation shield",
                  val: result ? fmt$(result.totalDepreciationShield / Math.max(1, holdYears)) + "/yr" : "—",
                  color: dc.emerald,
                },
                {
                  label: "Pre-tax IRR",
                  val: preTaxStr,
                  color: dc.cream,
                },
                {
                  label: "Tax drag",
                  val: dragStr,
                  color: "#e06363",
                },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(238,239,211,0.16)",
                  }}
                >
                  <span style={{ color: "rgba(238,239,211,0.6)" }}>{r.label}</span>
                  <Mono style={{ color: r.color, fontWeight: 700, fontSize: 13 }}>{r.val}</Mono>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: dc.lemon }}>After-Tax IRR</span>
              <Mono
                style={{
                  fontSize: "clamp(36px,4vw,48px)",
                  fontWeight: 600,
                  color: irrColor,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {afterTaxStr}
              </Mono>
            </div>
          </div>
        </div>
      </section>

      

      {/* ── TOOL ── */}
      <section
        id="te-tool"
        style={{
          background: dc.dark,
          color: dc.cream,
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
                color: dc.lemon,
                marginBottom: 12,
              }}
            >
              Live after-tax IRR engine
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,52px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.0,
                margin: "0 0 10px",
                color: dc.cream,
              }}
            >
              After-tax{" "}
              <span style={{ color: irrColor }}>{afterTaxStr}</span>
              {" "}· pre-tax {preTaxStr} · drag {dragStr}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.62)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              {!hasResult
                ? "Adjust inputs to see your after-tax return."
                : afterTaxIRR >= 0.1
                ? `After-tax IRR of ${afterTaxStr} is strong. The depreciation shield offsets some of the tax bill — your real return after the IRS takes its share still works.`
                : afterTaxIRR >= 0.06
                ? `After-tax IRR of ${afterTaxStr} is acceptable but the ${dragStr} tax drag is meaningful. Look for ways to increase the depreciation shield — a cost-segregation study or higher land allocation can help.`
                : `After-tax IRR of ${afterTaxStr} is below the typical 6% threshold. The ${dragStr} tax drag may be larger than expected. Check whether real estate professional status (REP) applies — it can unlock passive-loss deductions that significantly improve the after-tax number.`}
            </p>
          </div>

          {/* Grid: inputs + results */}
          <div
            className="gs-reveal dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "340px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ── */}
            <div
              style={{
                background: dc.teal,
                borderRadius: 9,
                padding: 26,
                border: "1px solid rgba(238,239,211,0.08)",
              }}
            >
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
                Deal &amp; Tax profile
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 16px", lineHeight: 1.5 }}>
                Deal numbers at the top; your personal tax situation below. Estimates are fine — numbers update live.
              </p>

              {/* Numeric fields */}
              {(
                [
                  {
                    label: "Purchase Price",
                    hint: "What you're paying for the property.",
                    key: "purchasePrice" as const,
                    step: 5000,
                    prefix: "$",
                    suffix: "",
                    val: purchasePrice,
                    set: setPurchasePrice,
                  },
                  {
                    label: "LTV",
                    hint: "Loan-to-value — loan ÷ value. E.g. 25% down = 75% LTV.",
                    key: "ltv" as const,
                    step: 1,
                    prefix: "",
                    suffix: "%",
                    val: ltv,
                    set: setLtv,
                  },
                  {
                    label: "Note Rate",
                    hint: "Your loan interest rate. Estimate is fine.",
                    key: "rate" as const,
                    step: 0.125,
                    prefix: "",
                    suffix: "%",
                    val: rate,
                    set: setRate,
                  },
                  {
                    label: "Monthly Rent",
                    hint: "Expected gross rent per month.",
                    key: "monthlyRent" as const,
                    step: 100,
                    prefix: "$",
                    suffix: "",
                    val: monthlyRent,
                    set: setMonthlyRent,
                  },
                  {
                    label: "Annual Taxes",
                    hint: "Property taxes per year.",
                    key: "annualTaxes" as const,
                    step: 250,
                    prefix: "$",
                    suffix: "",
                    val: annualTaxes,
                    set: setAnnualTaxes,
                  },
                  {
                    label: "Annual Insurance",
                    hint: "Homeowners insurance per year.",
                    key: "annualInsurance" as const,
                    step: 100,
                    prefix: "$",
                    suffix: "",
                    val: annualInsurance,
                    set: setAnnualInsurance,
                  },
                  {
                    label: "Monthly HOA",
                    hint: "HOA dues per month. Enter 0 if none.",
                    key: "hoa" as const,
                    step: 25,
                    prefix: "$",
                    suffix: "",
                    val: hoa,
                    set: setHoa,
                  },
                  {
                    label: "Hold Years",
                    hint: "How long you plan to own the property before selling.",
                    key: "holdYears" as const,
                    step: 1,
                    prefix: "",
                    suffix: "",
                    val: holdYears,
                    set: setHoldYears,
                  },
                  {
                    label: "Land %",
                    hint: "Estimated land value as a percent of purchase price. Land is not depreciable — lower land % = larger depreciation deduction. Typical range: 15%–30%.",
                    key: "landPct" as const,
                    step: 1,
                    prefix: "",
                    suffix: "%",
                    val: landPct,
                    set: setLandPct,
                  },
                  {
                    label: "MAGI — your income",
                    hint: "Modified adjusted gross income. Determines whether passive-loss rules limit your deductions and whether NIIT (3.8% extra tax) applies.",
                    key: "magi" as const,
                    step: 5000,
                    prefix: "$",
                    suffix: "",
                    val: magi,
                    set: setMagi,
                  },
                  {
                    label: "State Tax %",
                    hint: "Your state income tax rate. Enter 0 for states with no income tax (TX, FL, etc.).",
                    key: "stateRate" as const,
                    step: 0.5,
                    prefix: "",
                    suffix: "%",
                    val: stateRate,
                    set: setStateRate,
                  },
                  {
                    label: "Exit prepayment penalty %",
                    hint: "A fee some loans charge if you pay the loan off or refinance early. Expressed as % of loan balance. Enter 0 if your loan has no prepayment penalty.",
                    key: "exitPppPct" as const,
                    step: 0.5,
                    prefix: "",
                    suffix: "%",
                    val: exitPppPct,
                    set: setExitPppPct,
                  },
                ] as {
                  label: string;
                  hint: string;
                  key: string;
                  step: number;
                  prefix: string;
                  suffix: string;
                  val: number;
                  set: (n: number) => void;
                }[]
              ).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
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
                    {f.label}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>{f.hint}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: dc.dark,
                      borderRadius: 6,
                      padding: "0 11px",
                      border: "1px solid rgba(238,239,211,0.16)",
                    }}
                  >
                    {f.prefix && (
                      <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>
                        {f.prefix}
                      </span>
                    )}
                    <input
                      className="te-num"
                      type="number"
                      step={f.step}
                      value={f.val}
                      onChange={(e) => f.set(+e.target.value)}
                      style={{ padding: "10px 6px", fontSize: 15, fontWeight: 600 }}
                    />
                    {f.suffix && (
                      <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>
                        {f.suffix}
                      </span>
                    )}
                  </div>
                </label>
              ))}

              {/* Filing status */}
              <label style={{ display: "block", marginBottom: 14 }}>
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
                  Filing Status
                </span>
                <div
                  style={{
                    background: dc.dark,
                    borderRadius: 6,
                    padding: "0 11px",
                    border: "1px solid rgba(238,239,211,0.16)",
                  }}
                >
                  <select
                    className="te-sel"
                    value={filingStatus}
                    onChange={(e) =>
                      setFilingStatus(e.target.value as FilingStatus)
                    }
                    style={{ padding: "10px 6px", fontSize: 14, fontWeight: 600 }}
                  >
                    <option value="MFJ">Married Filing Jointly</option>
                    <option value="SINGLE">Single</option>
                    <option value="MFS">Married Filing Separately</option>
                    <option value="HOH">Head of Household</option>
                  </select>
                </div>
              </label>

              {/* REP checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  marginTop: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={isRep}
                  onChange={(e) => setIsRep(e.target.checked)}
                  style={{ accentColor: dc.lemon, width: 16, height: 16, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: "rgba(238,239,211,0.8)", lineHeight: 1.45 }}>
                  <strong style={{ color: dc.lemon }}>Real estate professional status</strong> (750hr test + 50% of work time in real estate) — unlocks the ability to deduct passive losses against ordinary income. If you don't meet both tests, leave this unchecked.
                </span>
              </label>
            </div>

            {/* ── RESULTS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {!result ? (
                <div
                  style={{
                    background: dc.teal,
                    borderRadius: 12,
                    padding: "clamp(28px,3.5vw,44px)",
                    textAlign: "center",
                    border: "1px solid rgba(238,239,211,0.08)",
                  }}
                >
                  <p style={{ color: "#e06363", fontWeight: 600 }}>
                    Engine returned no result. Check inputs.
                  </p>
                </div>
              ) : (
                <>
                  {/* Big After-Tax IRR */}
                  <div
                    style={{
                      background: dc.teal,
                      borderRadius: 12,
                      padding: "clamp(28px,3.5vw,44px)",
                      textAlign: "center",
                      border: `1px solid rgba(238,239,211,0.08)`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: dc.lemon,
                        marginBottom: 14,
                      }}
                    >
                      After-Tax IRR
                    </div>
                    <Mono
                      style={{
                        display: "block",
                        fontSize: "clamp(72px,9vw,120px)",
                        fontWeight: 600,
                        letterSpacing: "-0.04em",
                        color: irrColor,
                        lineHeight: 0.9,
                      }}
                    >
                      {afterTaxStr}
                    </Mono>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "rgba(238,239,211,0.62)",
                        marginTop: 16,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Pre-tax {preTaxStr} · Tax drag {dragStr}
                    </div>
                  </div>

                  {/* Tax stack */}
                  <div
                    style={{
                      background: dc.teal,
                      borderRadius: 9,
                      padding: 24,
                      border: "1px solid rgba(238,239,211,0.08)",
                    }}
                  >
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
                      Tax breakdown — where the money goes
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.5 }}>
                      Green = tax benefit that improves your return. Red = tax cost that reduces it. The difference between pre-tax and after-tax IRR is your total tax drag.
                    </p>
                    {(
                      [
                        {
                          label: "Depreciation shield (total hold) — your annual tax savings from writing off the building",
                          val: fmt$(result.totalDepreciationShield),
                          color: dc.emerald,
                        },
                        {
                          label: "Total tax on exit — depreciation recapture + capital gains tax owed when you sell",
                          val: fmt$(result.totalTaxOnExit),
                          color: "#e06363",
                        },
                        {
                          label: "§1250 recapture rate — the tax rate on depreciation you claimed (capped at 25%)",
                          val:
                            (result.effectiveRecaptureRate * 100).toFixed(1) + "%",
                          color: dc.lemon,
                        },
                        {
                          label: "Long-term capital gains rate — applied to the remaining profit above your basis",
                          val:
                            (result.effectiveLtcgRate * 100).toFixed(1) + "%",
                          color: dc.cream,
                        },
                        {
                          label: "NIIT (3.8% net investment income tax) — applies if MAGI exceeds $200K single / $250K joint",
                          val: result.niitApplies ? "Yes — adds 3.8% to investment income" : "No",
                          color: result.niitApplies ? "#e06363" : dc.emerald,
                        },
                      ] as { label: string; val: string; color: string }[]
                    ).map((r) => (
                      <div
                        key={r.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "9px 0",
                          borderBottom: "1px solid rgba(238,239,211,0.08)",
                          fontSize: 14,
                        }}
                      >
                        <span
                          style={{
                            color: "rgba(238,239,211,0.65)",
                            fontWeight: 500,
                          }}
                        >
                          {r.label}
                        </span>
                        <Mono
                          style={{ color: r.color, fontWeight: 700, fontSize: 14 }}
                        >
                          {r.val}
                        </Mono>
                      </div>
                    ))}
                  </div>

                  {/* Year-by-year table */}
                  <div
                    style={{
                      background: dc.teal,
                      borderRadius: 9,
                      padding: 24,
                      border: "1px solid rgba(238,239,211,0.08)",
                    }}
                  >
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
                      Year-by-year cash flow — before and after taxes
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 12px", lineHeight: 1.5 }}>
                      Pre-Tax = net operating income minus debt service. Dep. = depreciation deduction (reduces your taxable income each year). Fed+St Tax = federal plus state tax owed. After-Tax = what you actually keep. Green = positive; red = negative cash flow that year.
                    </p>
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          minWidth: 480,
                        }}
                      >
                        <thead>
                          <tr>
                            {["Yr", "Pre-Tax", "Dep.", "Fed+St Tax", "After-Tax"].map(
                              (h) => (
                                <th
                                  key={h}
                                  style={{
                                    padding: "5px 8px",
                                    fontSize: 11,
                                    color: "rgba(238,239,211,0.62)",
                                    textAlign: "right",
                                    fontWeight: 500,
                                    fontFamily: dc.mono,
                                  }}
                                >
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {result.yearByYear.map((row) => {
                            const atColor =
                              row.afterTaxNCF >= 0 ? dc.emerald : "#e06363";
                            return (
                              <tr key={row.year}>
                                <td
                                  style={{
                                    padding: "6px 8px",
                                    fontSize: 12,
                                    color: "rgba(238,239,211,0.62)",
                                    textAlign: "right",
                                    fontFamily: dc.mono,
                                  }}
                                >
                                  {row.year}
                                </td>
                                <td
                                  style={{
                                    padding: "6px 8px",
                                    fontSize: 12,
                                    color: dc.cream,
                                    textAlign: "right",
                                    fontFamily: dc.mono,
                                  }}
                                >
                                  {fmt$(row.preTaxNCF)}
                                </td>
                                <td
                                  style={{
                                    padding: "6px 8px",
                                    fontSize: 12,
                                    color: dc.lemon,
                                    textAlign: "right",
                                    fontFamily: dc.mono,
                                  }}
                                >
                                  {fmt$(row.depreciationDeduction)}
                                </td>
                                <td
                                  style={{
                                    padding: "6px 8px",
                                    fontSize: 12,
                                    color: "#e06363",
                                    textAlign: "right",
                                    fontFamily: dc.mono,
                                  }}
                                >
                                  {fmt$(row.federalTax + row.stateTax)}
                                </td>
                                <td
                                  style={{
                                    padding: "6px 8px",
                                    fontSize: 12,
                                    color: atColor,
                                    fontWeight: 700,
                                    textAlign: "right",
                                    fontFamily: dc.mono,
                                  }}
                                >
                                  {fmt$(row.afterTaxNCF)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Engine footnote */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "rgba(238,239,211,0.05)",
                      borderRadius: 9,
                      border: "1px solid rgba(238,239,211,0.16)",
                      fontSize: 12,
                      color: "rgba(238,239,211,0.62)",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: dc.lemon }}>Tax rules applied:</strong>{" "}
                    IRC §167 straight-line depreciation over 27.5 years · §469 passive-activity-loss rules (limited to $25K for incomes under $100K; phased out to $150K; suspended above unless you qualify as a real estate professional) · §1250 recapture at 25% on depreciation claimed · §1(h) long-term capital gains rates · §1411 net investment income tax 3.8%.{" "}
                    {result.disclaimer}{" "}
                    This is a model estimate — consult a tax advisor. Not a commitment to lend. Submit a scenario review for exact underwriting.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
