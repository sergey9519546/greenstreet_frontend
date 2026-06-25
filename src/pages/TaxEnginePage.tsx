import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono } from "../design/dc";
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
  // ── Inputs ──
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [landPct, setLandPct] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(3000);
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
      const loanAmount = purchasePrice * (1 - ltv / 100);
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

  const afterTaxStr = afterTaxIRR.toFixed(1) + "%";
  const preTaxStr = preTaxIRR.toFixed(1) + "%";
  const dragStr = drag.toFixed(1) + " pts";

  const irrColor =
    afterTaxIRR >= 10 ? dc.emerald : afterTaxIRR >= 6 ? dc.lemon : "#ff6b6b";

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
        {/* ambient radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-8%",
            width: "55%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(0,55,56,0.08),transparent 70%)",
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
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(0,55,56,0.6)",
                marginBottom: 22,
              }}
            >
              Tax Engine &middot; IRC 167 &middot; 469 PAL &middot; 1250 &middot; NIIT
            </div>
            <h1
              style={{
                fontSize: "clamp(46px,7vw,108px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: "0 0 28px",
                color: dc.dark,
              }}
            >
              What does it really earn after taxes?
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(0,55,56,0.72)",
                maxWidth: "48ch",
                margin: "0 0 36px",
              }}
            >
              After-tax IRR with depreciation shield, §1250 recapture, LTCG,
              NIIT and IRC §469 passive-loss rules.
            </p>
            <a
              href="#te-tool"
              onClick={scrollToTool}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: dc.dark,
                color: dc.lemon,
                fontWeight: 600,
                fontSize: 16,
                textDecoration: "none",
                padding: "15px 30px",
                borderRadius: 6,
              }}
            >
              Open the tax engine ↓
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
                  val: drag > 0 ? "-" + Math.abs(drag).toFixed(1) + " pts" : drag.toFixed(1) + " pts",
                  color: "#ff6b6b",
                },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(238,239,211,0.1)",
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

      {/* ── EXPLAINER — rendered HyperFrames loop ── */}
      <section style={{ background: dc.lemon, padding: `clamp(40px,5vw,64px) ${dc.pad}` }}>
        <div className="gs-reveal" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <video
            src="/video/tax-explainer.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", display: "block", borderRadius: 16, border: "1px solid rgba(0,55,56,0.18)", aspectRatio: "16 / 9", objectFit: "cover" }}
          />
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
                margin: 0,
                color: dc.cream,
              }}
            >
              After-Tax{" "}
              <span style={{ color: irrColor }}>{afterTaxStr}</span>
              {" "}· Pre-tax {preTaxStr} · Drag {dragStr}
            </h2>
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
                  marginBottom: 20,
                }}
              >
                Deal &amp; Tax profile
              </div>

              {/* Numeric fields */}
              {(
                [
                  {
                    label: "Purchase Price",
                    key: "purchasePrice" as const,
                    step: 5000,
                    prefix: "$",
                    suffix: "",
                    val: purchasePrice,
                    set: setPurchasePrice,
                  },
                  {
                    label: "LTV",
                    key: "ltv" as const,
                    step: 1,
                    prefix: "",
                    suffix: "%",
                    val: ltv,
                    set: setLtv,
                  },
                  {
                    label: "Note Rate",
                    key: "rate" as const,
                    step: 0.125,
                    prefix: "",
                    suffix: "%",
                    val: rate,
                    set: setRate,
                  },
                  {
                    label: "Monthly Rent",
                    key: "monthlyRent" as const,
                    step: 100,
                    prefix: "$",
                    suffix: "",
                    val: monthlyRent,
                    set: setMonthlyRent,
                  },
                  {
                    label: "Annual Taxes",
                    key: "annualTaxes" as const,
                    step: 250,
                    prefix: "$",
                    suffix: "",
                    val: annualTaxes,
                    set: setAnnualTaxes,
                  },
                  {
                    label: "Annual Ins.",
                    key: "annualInsurance" as const,
                    step: 100,
                    prefix: "$",
                    suffix: "",
                    val: annualInsurance,
                    set: setAnnualInsurance,
                  },
                  {
                    label: "Monthly HOA",
                    key: "hoa" as const,
                    step: 25,
                    prefix: "$",
                    suffix: "",
                    val: hoa,
                    set: setHoa,
                  },
                  {
                    label: "Hold Years",
                    key: "holdYears" as const,
                    step: 1,
                    prefix: "",
                    suffix: "",
                    val: holdYears,
                    set: setHoldYears,
                  },
                  {
                    label: "Land %",
                    key: "landPct" as const,
                    step: 1,
                    prefix: "",
                    suffix: "%",
                    val: landPct,
                    set: setLandPct,
                  },
                  {
                    label: "MAGI ($)",
                    key: "magi" as const,
                    step: 5000,
                    prefix: "$",
                    suffix: "",
                    val: magi,
                    set: setMagi,
                  },
                  {
                    label: "State Tax %",
                    key: "stateRate" as const,
                    step: 0.5,
                    prefix: "",
                    suffix: "%",
                    val: stateRate,
                    set: setStateRate,
                  },
                  {
                    label: "Exit PPP %",
                    key: "exitPppPct" as const,
                    step: 0.5,
                    prefix: "",
                    suffix: "%",
                    val: exitPppPct,
                    set: setExitPppPct,
                  },
                ] as {
                  label: string;
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
                      color: "rgba(238,239,211,0.55)",
                      marginBottom: 5,
                    }}
                  >
                    {f.label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: dc.dark,
                      borderRadius: 6,
                      padding: "0 11px",
                      border: "1px solid rgba(238,239,211,0.1)",
                    }}
                  >
                    {f.prefix && (
                      <span style={{ color: "rgba(238,239,211,0.4)", fontSize: 14 }}>
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
                      <span style={{ color: "rgba(238,239,211,0.4)", fontSize: 14 }}>
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
                    color: "rgba(238,239,211,0.55)",
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
                    border: "1px solid rgba(238,239,211,0.1)",
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
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isRep}
                  onChange={(e) => setIsRep(e.target.checked)}
                  style={{ accentColor: dc.lemon, width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13, color: "rgba(238,239,211,0.8)" }}>
                  Real estate professional (750hr + 50% test)
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
                  <p style={{ color: "#ff6b6b", fontWeight: 600 }}>
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
                        color: "rgba(238,239,211,0.55)",
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
                        marginBottom: 14,
                      }}
                    >
                      Tax stack
                    </div>
                    {(
                      [
                        {
                          label: "Depreciation shield (total hold)",
                          val: fmt$(result.totalDepreciationShield),
                          color: dc.emerald,
                        },
                        {
                          label: "Total tax on exit",
                          val: fmt$(result.totalTaxOnExit),
                          color: "#ff6b6b",
                        },
                        {
                          label: "Effective recapture rate",
                          val:
                            (result.effectiveRecaptureRate * 100).toFixed(1) + "%",
                          color: dc.lemon,
                        },
                        {
                          label: "Effective LTCG rate",
                          val:
                            (result.effectiveLtcgRate * 100).toFixed(1) + "%",
                          color: dc.cream,
                        },
                        {
                          label: "NIIT applies",
                          val: result.niitApplies ? "Yes" : "No",
                          color: result.niitApplies ? "#ff6b6b" : dc.emerald,
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
                        marginBottom: 14,
                      }}
                    >
                      Year-by-year after-tax NCF
                    </div>
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
                                    fontSize: 10,
                                    color: "rgba(238,239,211,0.45)",
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
                              row.afterTaxNCF >= 0 ? dc.emerald : "#ff6b6b";
                            return (
                              <tr key={row.year}>
                                <td
                                  style={{
                                    padding: "6px 8px",
                                    fontSize: 12,
                                    color: "rgba(238,239,211,0.5)",
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
                                    color: "#ff6b6b",
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
                      border: "1px solid rgba(238,239,211,0.1)",
                      fontSize: 12,
                      color: "rgba(238,239,211,0.5)",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: dc.lemon }}>Engine:</strong>{" "}
                    src/engine/taxEngine.ts → computeAfterTaxIRR · IRC §167 27.5yr
                    SL · §469 PAL rules · §1250 recapture 25% · §1(h) LTCG ·
                    §1411 NIIT 3.8% · {result.disclaimer}
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
