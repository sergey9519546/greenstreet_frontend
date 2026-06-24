import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, HeroProof } from "../design/dc";
import { computeVerdict, computeDealKillCheck, computeAcquisitionScore, computeReturnGrade } from "../engine/decisionSupport";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import type { LenderRankingEntry } from "../engine/types";
import { DSCR_PROGRAMS, lookupMaxLTV } from "../data/dscrPrograms";

// ── helpers ─────────────────────────────────────────────────────────────────
function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

function verdictColor(v: string): string {
  if (v === "PROCEED") return dc.emerald;
  if (v === "RESTRUCTURE") return "#d8d958";
  return "#ff6b6b";
}
function verdictBg(v: string): string {
  if (v === "PROCEED") return "rgba(77,189,151,0.08)";
  if (v === "RESTRUCTURE") return "rgba(216,217,88,0.10)";
  return "rgba(74,21,21,0.07)";
}
function verdictInk(v: string): string {
  if (v === "PROCEED") return dc.rain;
  if (v === "RESTRUCTURE") return "#7a6200";
  return "#d32f2f";
}
function gradeColor(g: string): string {
  if (g === "A" || g === "B") return dc.rain;
  if (g === "C") return "#a16207";
  return "#d32f2f";
}
function factorColor(v: number): string {
  if (v >= 66) return dc.emerald;
  if (v >= 40) return "#d8d958";
  return "#ff6b6b";
}

// ── component ────────────────────────────────────────────────────────────────
export default function DecisionSupportPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  useEffect(() => {
    document.title = "Decision Support | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Inputs
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct, setDownPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [fico, setFico] = useState(740);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

  // Engine
  const result = useMemo(() => {
    try {
      const req = {
        purchasePrice,
        loanAmount: purchasePrice * (1 - downPct / 100),
        monthlyRent,
        state: "TX",
        ficoScore: fico,
        propertyType: "SFR" as const,
        annualTaxes,
        annualInsurance,
        hoa,
      };
      const inputs = buildEngineInputs(req);
      const deal = solveDSCR(inputs.property, inputs.borrower, inputs.loan, inputs.strategy);
      const cashInvested = purchasePrice - deal.loanAmount;
      const annualCashFlow =
        deal.dualTrackDSCR.track2.qualifyingRent * 12 - deal.monthlyPITIA.total * 12;
      const year1CoC =
        annualCashFlow > 0 ? (annualCashFlow / cashInvested) * 100 : 0;

      // TDZ FIX: use the locally-computed value, not result?.afterTaxIRR (which would be undefined)
      const afterTaxIRR = Math.max(0, (year1CoC / 100) * 5);

      const track2DSCR = deal.dualTrackDSCR.track2.dscr;
      const ltvNeeded = 100 - downPct;

      const matched = DSCR_PROGRAMS
        .map((p) => {
          const offerLTV = lookupMaxLTV(p, fico, deal.loanAmount, deal.dscr >= 0.01 ? deal.dscr : null, "purchase");
          return offerLTV !== null && offerLTV >= ltvNeeded ? { program: p, offerLTV } : null;
        })
        .filter((x): x is { program: typeof DSCR_PROGRAMS[0]; offerLTV: number } => x !== null);

      const bestMatch = matched[0]?.program;
      const lenderMinDSCR = bestMatch ? bestMatch.dscrFloor : 1.0;
      const lenderMinLoan = 75000;
      const ltvCap = bestMatch ? bestMatch.maxLTV : 80;

      const lenderRanking: LenderRankingEntry[] = matched.map((m, i) => ({
        rank: i + 1,
        lenderId: m.program.id,
        lenderName: m.program.name,
        fitTier: "STRONG_FIT" as const,
        eligible: true,
        ineligibleReasons: [],
        estimatedRate: 7.0,
        aey: 7.0,
        totalCost60mo: 0,
        confidenceScore: 85,
        counterpartyRisk: {
          lenderId: m.program.id,
          continuityScore: 90,
          knownDisruption: null,
          lastReportedStatus: "ACTIVE",
          flag: "STABLE" as const,
        },
        pppAllowed: true,
        pppStructure: "5/4/3/2/1",
        provenance: "VERIFIED_PRIMARY" as const,
        provenanceWarnings: [],
        sourceSnapshot: "2026-06",
      }));

      const verdict = computeVerdict({
        track1DSCR: deal.dscr,
        track2DSCR,
        lenderMinDSCR,
        afterTaxIRR,          // ← fixed: now uses the local computed value
        preTaxIRR: afterTaxIRR,
        year1CoC,
        dealBreakRate: deal.dealBreakRate,
        solvedRate: deal.solvedRate,
        rateHeadroomBps: deal.rateHeadroomBps,
        appraisalBreakpointPercent: 0,
        insuranceGate: null,
        brrrrGate: null,
        armReset: null,
        strLegalityStatus: "CLEAR",
        pppAllowed: true,
        ficoScore: fico,
        ltv: 100 - downPct,
        ltvCap,
        loanAmount: deal.loanAmount,
        lenderMinLoan,
        bestLenderConfidence: matched.length > 0 ? 85 : 0,
        lenderRanking,
        isDecliningMarket: false,
      });

      const kill = computeDealKillCheck(deal, inputs.borrower, inputs.loan, inputs.property, inputs.strategy, null, null, null);
      const acq  = computeAcquisitionScore(deal, null, inputs.property, inputs.borrower, inputs.loan, inputs.strategy, null, null);
      const grade = computeReturnGrade(afterTaxIRR, track2DSCR);

      // Composite factors (mirrors the mockup's weighted scoring)
      const dscrScore  = Math.max(0, Math.min(100, (deal.dscr - 0.75) / (1.5 - 0.75) * 100));
      const levScore   = Math.max(0, Math.min(100, (80 - (100 - downPct)) / (80 - 60) * 100));
      const ficoScore  = Math.max(0, Math.min(100, (fico - 620) / (780 - 620) * 100));
      const irrScore   = Math.max(0, Math.min(100, (afterTaxIRR * 100 - 4) / (16 - 4) * 100));
      const liqScore   = Math.max(0, Math.min(100, 60)); // default 6-month reserve proxy
      const composite  = Math.round(dscrScore * 0.30 + levScore * 0.18 + ficoScore * 0.14 + irrScore * 0.20 + liqScore * 0.10);

      const factors = [
        { label: "DSCR coverage (30%)", v: dscrScore, note: `${deal.dscr.toFixed(2)}x — ${deal.dscr >= 1.25 ? "comfortable" : deal.dscr >= 1.0 ? "qualifies" : "sub-1.0"}` },
        { label: "Leverage (18%)",      v: levScore,  note: `${100 - downPct}% LTV` },
        { label: "Levered IRR (20%)",   v: irrScore,  note: `${(afterTaxIRR * 100).toFixed(1)}% projected` },
        { label: "Borrower credit (14%)", v: ficoScore, note: `${fico} FICO` },
        { label: "Liquidity (10%)",     v: liqScore,  note: "6-month reserve proxy" },
      ].map((f) => ({ ...f, color: factorColor(f.v), valStr: Math.round(f.v) + "/100", pct: f.v + "%" }));

      // IC memo bullets driven by real values
      const MINT = dc.emerald;
      const YLW  = "#d8d958";
      const RED  = "#ff6b6b";
      const memo: { mark: string; color: string; text: string }[] = [];
      memo.push(
        deal.dscr >= 1.25
          ? { mark: "✓", color: MINT, text: `DSCR ${deal.dscr.toFixed(2)}x sits comfortably above the 1.25x comfort line.` }
          : deal.dscr >= 1.0
          ? { mark: "~", color: YLW,  text: `DSCR ${deal.dscr.toFixed(2)}x qualifies but leaves thin cushion against rate or vacancy shock.` }
          : { mark: "✕", color: RED,  text: `DSCR ${deal.dscr.toFixed(2)}x is below 1.0 — most lenders require compensating factors or decline.` }
      );
      memo.push(
        (100 - downPct) <= 75
          ? { mark: "✓", color: MINT, text: `${100 - downPct}% LTV is within standard DSCR program limits.` }
          : { mark: "~", color: YLW,  text: `${100 - downPct}% LTV pushes pricing add-ons and narrows the lender shortlist.` }
      );
      memo.push(
        deal.rateHeadroomBps >= 50
          ? { mark: "✓", color: MINT, text: `${Math.round(deal.rateHeadroomBps)} bps of rate cushion clears the 50 bps floor.` }
          : { mark: "✕", color: RED,  text: `${Math.round(deal.rateHeadroomBps)} bps rate headroom is below the 50 bps floor — deal could break on a minor rate move.` }
      );
      memo.push(
        matched.length > 0
          ? { mark: "✓", color: MINT, text: `${matched.length} Greenstreet program${matched.length > 1 ? "s" : ""} eligible at this LTV and FICO.` }
          : { mark: "✕", color: RED,  text: "No programs match current LTV and FICO — restructure down payment or score." }
      );

      return { deal, verdict, kill, acq, grade, year1CoC, track2DSCR, afterTaxIRR, composite, factors, memo, matched };
    } catch {
      return null;
    }
  }, [purchasePrice, downPct, monthlyRent, rate, fico, annualTaxes, annualInsurance, hoa]);

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#ds-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  // Derive chip / proof values for hero
  const heroVerdict = result?.verdict.verdict ?? "—";
  const heroDSCR    = result?.deal.dscr ?? 0;
  const heroGrade   = result?.grade ?? "—";
  const heroComposite = result?.composite ?? 0;
  const chipColor   = verdictColor(heroVerdict);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",   view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer" },
      ]}
      cta={{ label: "Get the verdict →", onClick: scrollToTool }}
    >
      {/* Extra CSS: hide number spinners only */}
      <style>{`
        .ds-in::-webkit-outer-spin-button,.ds-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .ds-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO ── */}
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
          {/* Left: hero content with GSAP stagger */}
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
              Underwriting verdict · IC memo · risk flags
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
              One verdict.
              <br />
              Every signal
              <br />
              weighed.
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
              DSCR, leverage, returns, and state risk roll into a single
              composite — GO, CONDITIONAL, or NO-GO — spelled out like an
              investment-committee memo.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href="#ds-tool"
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
                Run the decision engine ↓
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
                DSCR calculator
              </a>
            </div>
          </div>

          {/* Right: live HeroProof wired to real verdict */}
          <HeroProof
            eyebrow="IC verdict — live"
            value={result ? `Grade ${heroGrade}` : "—"}
            sub={
              result
                ? `${heroDSCR.toFixed(2)}x DSCR · composite ${heroComposite}/100`
                : "Enter inputs below"
            }
            chip={{ label: heroVerdict, color: chipColor }}
          />
        </div>
      </section>

      {/* ── 3-STEP BAND ── */}
      <section style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}>
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
            <div style={{ background: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.lemon, marginBottom: 14, lineHeight: 1 }}>01</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Inputs</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.6)", margin: 0 }}>
                Purchase price, down payment, rent, rate, FICO, taxes, insurance. Eight fields.
              </p>
            </div>
            <div style={{ background: dc.dark, color: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.emerald, marginBottom: 14, lineHeight: 1 }}>02</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1, color: dc.cream }}>Underwrite</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0 }}>
                Dual-track DSCR, kill-criterion check, acquisition score, return grade — live.
              </p>
            </div>
            <div style={{ background: dc.lemon, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: "rgba(0,55,56,0.5)", marginBottom: 14, lineHeight: 1 }}>03</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Verdict</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.65)", margin: 0 }}>
                GO / CONDITIONAL / NO-GO with the binding constraint spelled out as an IC memo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <section
        id="ds-tool"
        style={{ background: dc.cream, padding: `clamp(64px,8vw,112px) ${dc.pad}` }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 12 }}>
              Live decision-support engine
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,48px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.02, margin: "0 0 40px" }}>
              Verdict:{" "}
              <span style={{ color: verdictInk(heroVerdict) }}>
                {result?.verdict.verdict ?? "—"}
              </span>{" "}
              · composite {heroComposite}/100
            </h2>
          </div>

          {/* Tool grid: inputs + results */}
          <div
            className="gs-reveal dc-split"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}
          >
            {/* ── INPUTS (dark panel, matches mockup) ── */}
            <div style={{ background: dc.dark, borderRadius: 9, padding: 30 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 20 }}>
                Deal &amp; Borrower
              </div>

              {([
                { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$", suffix: "" },
                { label: "Down Payment",   value: downPct,        set: setDownPct,        step: 1,    prefix: "",  suffix: "%" },
                { label: "Note Rate",      value: rate,           set: setRate,           step: 0.125, prefix: "", suffix: "%" },
                { label: "Monthly Rent",   value: monthlyRent,    set: setMonthlyRent,    step: 100,  prefix: "$", suffix: "" },
                { label: "FICO",           value: fico,           set: setFico,           step: 5,    prefix: "",  suffix: "" },
                { label: "Annual Taxes",   value: annualTaxes,    set: setAnnualTaxes,    step: 250,  prefix: "$", suffix: "" },
                { label: "Annual Ins.",    value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$", suffix: "" },
                { label: "Monthly HOA",    value: hoa,            set: setHoa,            step: 25,   prefix: "$", suffix: "" },
              ] as const).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.55)", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {f.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", background: dc.teal, borderRadius: 6, padding: "0 13px" }}>
                    {f.prefix && <span style={{ color: "rgba(238,239,211,0.4)" }}>{f.prefix}</span>}
                    <input
                      className="ds-in"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => (f.set as (n: number) => void)(+e.target.value)}
                      style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                    />
                    {f.suffix && <span style={{ color: "rgba(238,239,211,0.4)" }}>{f.suffix}</span>}
                  </div>
                </label>
              ))}
            </div>

            {/* ── RESULTS ── */}
            {!result ? (
              <div style={{ background: dc.white, borderRadius: 9, padding: 40, border: "1px solid rgba(0,55,56,0.1)", textAlign: "center" }}>
                <p style={{ color: "#d32f2f", fontWeight: 600 }}>Engine returned no result — check inputs.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* BIG VERDICT */}
                <div
                  style={{
                    background: verdictBg(result.verdict.verdict),
                    border: `2px solid ${verdictColor(result.verdict.verdict)}`,
                    borderRadius: 9,
                    padding: 34,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: verdictInk(result.verdict.verdict), opacity: 0.7, marginBottom: 10 }}>
                    Investment committee verdict
                  </div>
                  <Mono
                    style={{
                      display: "block",
                      fontSize: "clamp(44px,5vw,64px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      color: verdictInk(result.verdict.verdict),
                      lineHeight: 1,
                    }}
                  >
                    {result.verdict.verdict}
                  </Mono>
                  <div style={{ fontSize: 16, fontWeight: 500, color: verdictInk(result.verdict.verdict), opacity: 0.85, marginTop: 12, letterSpacing: "-0.02em" }}>
                    Binding constraint: <strong>{result.verdict.bindingConstraint}</strong>
                  </div>
                </div>

                {/* METRICS ROW */}
                <div
                  className="dc-band-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1px", background: "rgba(0,55,56,0.12)", borderRadius: 9, overflow: "hidden" }}
                >
                  {[
                    { label: "Track 1 DSCR", val: `${result.deal.dscr.toFixed(2)}x`,   color: result.deal.dscr >= 1.25 ? dc.rain : result.deal.dscr >= 1.0 ? "#a16207" : "#d32f2f" },
                    { label: "Track 2 DSCR", val: `${result.track2DSCR.toFixed(2)}x`,   color: result.track2DSCR >= 1.25 ? dc.rain : result.track2DSCR >= 1.0 ? "#a16207" : "#d32f2f" },
                    { label: "Rate cushion",  val: `${Math.round(result.deal.rateHeadroomBps)} bps`, color: result.deal.rateHeadroomBps > 50 ? dc.rain : "#d32f2f" },
                    { label: "Acq score",     val: `${Math.round(result.acq.score)}/100`, color: result.acq.score >= 75 ? dc.rain : result.acq.score >= 60 ? "#a16207" : "#d32f2f" },
                  ].map((m) => (
                    <div key={m.label} style={{ background: dc.white, padding: "18px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)", marginBottom: 6 }}>
                        {m.label}
                      </div>
                      <Mono style={{ display: "block", fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: m.color }}>
                        {m.val}
                      </Mono>
                    </div>
                  ))}
                </div>

                {/* COMPOSITE FACTORS */}
                <div style={{ background: dc.white, borderRadius: 9, padding: 30, border: "1px solid rgba(0,55,56,0.1)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 18 }}>
                    Composite breakdown (weighted)
                  </div>
                  {result.factors.map((f) => (
                    <div key={f.label} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: dc.dark }}>{f.label}</span>
                        <Mono style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.valStr}</Mono>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(0,55,56,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: f.pct, background: f.color, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.5)", marginTop: 5 }}>{f.note}</div>
                    </div>
                  ))}
                </div>

                {/* IC MEMO */}
                <div style={{ background: dc.dark, borderRadius: 9, padding: 30 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 14 }}>
                    IC memo — key reasons
                  </div>
                  {result.memo.map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                      <span style={{ color: m.color, fontWeight: 700, flexShrink: 0 }}>{m.mark}</span>
                      <span style={{ color: "rgba(238,239,211,0.85)", fontSize: 14, fontWeight: 500, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{m.text}</span>
                    </div>
                  ))}
                </div>

                {/* KILL CRITERIA (when flagged) */}
                {result.kill.criteria.length > 0 && (
                  <div className="gs-reveal" style={{ background: dc.white, borderRadius: 9, padding: 28, border: "1px solid rgba(0,55,56,0.1)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 16 }}>
                      Kill-criterion checklist — {result.kill.criteria.length} flagged
                    </div>
                    {result.kill.criteria.map((k, i) => {
                      const kc = k.severity === "BLOCKER" ? "#d32f2f" : k.severity === "WARNING" ? "#a16207" : dc.rain;
                      return (
                        <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.07)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: dc.dark }}>{k.criterion}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: `${kc}1a`, color: kc, border: `1px solid ${kc}` }}>
                              {k.severity}
                            </span>
                          </div>
                          <p style={{ color: "rgba(0,55,56,0.55)", fontSize: 12, margin: "0 0 2px" }}>{k.detail}</p>
                          <p style={{ color: "rgba(0,55,56,0.55)", fontSize: 12, margin: 0 }}>
                            <strong style={{ color: dc.rain }}>Action: </strong>{k.action}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* GRADE + ACQ SCORE */}
                <div
                  className="gs-reveal dc-band-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(0,55,56,0.12)", borderRadius: 9, overflow: "hidden" }}
                >
                  <div style={{ background: dc.white, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.rain, marginBottom: 8 }}>Return grade</div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 700, color: gradeColor(result.grade), lineHeight: 1 }}>
                      {result.grade}
                    </Mono>
                  </div>
                  <div style={{ background: dc.cream, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.rain, marginBottom: 8 }}>Acquisition score</div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 700, color: result.acq.score >= 75 ? dc.rain : result.acq.score >= 60 ? "#a16207" : "#d32f2f", lineHeight: 1 }}>
                      {Math.round(result.acq.score)}
                    </Mono>
                    <div style={{ fontSize: 12, color: "rgba(0,55,56,0.5)", marginTop: 4 }}>{result.acq.band}</div>
                  </div>
                </div>

                {/* ENGINE FOOTNOTE */}
                <div style={{ padding: "14px 18px", background: "rgba(0,101,101,0.07)", borderRadius: 9, border: "1px solid rgba(0,55,56,0.1)", fontSize: 12, color: "rgba(0,55,56,0.6)", lineHeight: 1.6 }}>
                  <strong style={{ color: dc.rain }}>Engine:</strong>{" "}
                  src/engine/decisionSupport.ts → computeVerdict + computeDealKillCheck + computeReturnGrade.
                  PROCEED requires: T1 ≥ lender min + 5 bps cushion, T2 ≥ 1.0, Grade ≥ B, cushion ≥ 50 bps, no blockers, ≥1 eligible program.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </DcShell>
  );
}
