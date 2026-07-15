import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { swatch, radius } from "../theme";
import { DscrGauge, BalanceScale, RiskFlame, riskFromDscr } from "../design/artifacts";
import { computeVerdict, computeDealKillCheck, computeAcquisitionScore, computeWeightedCompositeScore } from "../engine/decisionSupport";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import type { LenderRankingEntry } from "../engine/types";
import { DSCR_PROGRAMS, lookupMaxLTV } from "../data/dscrPrograms";
import BottomCTA from "../design/BottomCTA";

// ── helpers ─────────────────────────────────────────────────────────────────
function verdictColor(v: string): string {
  if (v === "PROCEED") return dc.emerald;
  if (v === "RESTRUCTURE") return "#d8d958";
  return "#e06363";
}
function verdictBg(v: string): string {
  if (v === "PROCEED") return swatch.emerald;
  if (v === "RESTRUCTURE") return swatch.lemon;
  return swatch.midnight; // NO-GO — use midnight, not off-token dark red
}
function verdictInk(v: string): string {
  if (v === "PROCEED") return dc.dark;
  if (v === "RESTRUCTURE") return dc.dark;
  return "#ffd9d9";
}
function gradeColor(g: string): string {
  if (g === "A" || g === "B") return dc.rain;
  if (g === "C") return "#a16207";
  return "#d32f2f";
}
function factorColor(v: number): string {
  if (v >= 66) return dc.emerald;
  if (v >= 40) return "#d8d958";
  return "#e06363";
}

// Map composite 0-100 to needle rotation -74..+74 deg (left=NO-GO, right=GO)
function compositeToNeedleDeg(composite: number): number {
  return -74 + (composite / 100) * 148;
}

// ── Gauge SVG — signature hero element ───────────────────────────────────────
function VerdictGauge({ composite }: { composite: number }) {
  const needleDeg = compositeToNeedleDeg(composite);
  const needleStyle: React.CSSProperties = {
    transformOrigin: "140px 150px",
    transform: `rotate(${needleDeg}deg)`,
    transition: "transform 0.55s cubic-bezier(.4,0,.2,1)",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "clamp(12px,2vw,28px)" }}>
      <svg
        id="ds-gauge"
        viewBox="0 0 280 175"
        style={{ width: "100%", maxWidth: 380, overflow: "visible" }}
        aria-label={`Verdict gauge — composite score ${composite}/100`}
      >
        {/* Arc segments: NO-GO (red), CONDITIONAL (yellow), GO (green) */}
        <path d="M 30,150 A 110,110 0 0 1 73,64"   fill="none" stroke="#e06363" strokeWidth="16" strokeLinecap="round" />
        <path d="M 86,54  A 110,110 0 0 1 194,54"  fill="none" stroke="#d8d958" strokeWidth="16" strokeLinecap="round" />
        <path d="M 207,64 A 110,110 0 0 1 250,150" fill="none" stroke="#4dbd97" strokeWidth="16" strokeLinecap="round" />

        {/* Needle */}
        <g style={needleStyle}>
          <line x1="140" y1="150" x2="140" y2="60" stroke="#eeefd3" strokeWidth="4" strokeLinecap="round" />
          <circle cx="140" cy="150" r="9" fill="#eeefd3" />
        </g>

        {/* Zone labels */}
        <text x="28"  y="170" fill="rgba(224,99,99,0.85)"  fontSize="11" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">NO-GO</text>
        <text x="140" y="34"  fill="rgba(216,217,88,0.95)"   fontSize="11" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">CONDITIONAL</text>
        <text x="252" y="170" fill="rgba(77,189,151,0.95)"   fontSize="11" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">GO</text>

        {/* Composite score centred below pivot */}
        <text x="140" y="168" fill="rgba(238,239,211,0.62)" fontSize="13" fontFamily="'JetBrains Mono',monospace" textAnchor="middle" fontWeight="600">
          {composite}/100
        </text>
      </svg>
    </div>
  );
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
      const rawInputs = [purchasePrice, downPct, monthlyRent, rate, fico, annualTaxes, annualInsurance, hoa];
      if (
        !rawInputs.every(Number.isFinite) ||
        purchasePrice <= 0 || monthlyRent <= 0 || rate <= 0 || fico <= 0 ||
        downPct <= 0 || downPct >= 100 || annualTaxes < 0 || annualInsurance < 0 || hoa < 0
      ) {
        return null;
      }

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
      const cashInvested = purchasePrice - deal.loanAmount + purchasePrice * 0.03; // down + ~3% closing costs
      const annualCashFlow =
        deal.dualTrackDSCR.track2.qualifyingRent * 12 - deal.monthlyPITIA.total * 12;
      const year1CoC =
        cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : Number.NaN;

      // This page does not collect hold-period, exit, growth, or tax inputs, so it
      // cannot calculate a defensible IRR. Keep the cash-flow proxy separate and
      // force the verdict into review until a real after-tax IRR is available.
      const fiveYearCashFlowReturnProxyPct = year1CoC * 5;
      const afterTaxIRR = Number.NaN;

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
        afterTaxIRR,
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
      const grade = "N/A";

      // Composite weights sum to 1.00. The return factor is explicitly a cash-flow
      // proxy, not IRR, because the necessary exit and tax assumptions are absent.
      const dscrScore  = Math.max(0, Math.min(100, (deal.dscr - 0.75) / (1.5 - 0.75) * 100));
      const levScore   = Math.max(0, Math.min(100, (80 - (100 - downPct)) / (80 - 60) * 100));
      const ficoScore  = Math.max(0, Math.min(100, (fico - 620) / (780 - 620) * 100));
      const returnProxyScore = Math.max(0, Math.min(100, (fiveYearCashFlowReturnProxyPct - 4) / (16 - 4) * 100));
      const liqScore   = Math.max(0, Math.min(100, 60)); // default 6-month reserve proxy
      const composite = computeWeightedCompositeScore([
        { score: dscrScore, weight: 0.30 },
        { score: levScore, weight: 0.20 },
        { score: returnProxyScore, weight: 0.20 },
        { score: ficoScore, weight: 0.15 },
        { score: liqScore, weight: 0.15 },
      ]);

      const factors = [
        { label: "DSCR coverage (30%)", v: dscrScore, note: `${deal.dscr.toFixed(2)}x — ${deal.dscr >= 1.25 ? "comfortable" : deal.dscr >= 1.0 ? "qualifies" : "sub-1.0"}` },
        { label: "Leverage (20%)",      v: levScore,  note: `${100 - downPct}% LTV` },
        { label: "Est. 5-yr cash-flow proxy (20%)", v: returnProxyScore, note: `${fiveYearCashFlowReturnProxyPct.toFixed(1)}% cumulative proxy; not IRR` },
        { label: "Borrower credit (15%)", v: ficoScore, note: `${fico} FICO` },
        { label: "Liquidity (15%)",     v: liqScore,  note: "6-month reserve proxy" },
      ].map((f) => ({ ...f, color: factorColor(f.v), valStr: Math.round(f.v) + "/100", pct: f.v + "%" }));

      // IC memo bullets driven by real values
      const MINT = dc.emerald;
      const YLW  = "#d8d958";
      const RED  = "#e06363";
      const memo: { mark: string; color: string; text: string }[] = [];
      memo.push(
        deal.dscr >= 1.25
          ? { mark: "✓", color: MINT, text: `DSCR ${deal.dscr.toFixed(2)}x sits comfortably above the 1.25x comfort line.` }
          : deal.dscr >= 1.0
          ? { mark: "~", color: YLW,  text: `DSCR ${deal.dscr.toFixed(2)}x qualifies but leaves thin cushion against rate or vacancy shock.` }
      : { mark: "✕", color: RED,  text: `DSCR ${deal.dscr.toFixed(2)}x is below the model's 1.0 comparison line; actual program treatment varies.` }
      );
      memo.push(
        (100 - downPct) <= 75
      ? { mark: "✓", color: MINT, text: `${100 - downPct}% LTV is within the stored model matrix for this scenario.` }
      : { mark: "~", color: YLW,  text: `${100 - downPct}% LTV is outside some stored matrix assumptions; this is not a pricing or eligibility finding.` }
      );
      memo.push(
        deal.rateHeadroomBps >= 50
          ? { mark: "✓", color: MINT, text: `${Math.round(deal.rateHeadroomBps)} bps of rate cushion clears the 50 bps floor.` }
          : { mark: "✕", color: RED,  text: `${Math.round(deal.rateHeadroomBps)} bps rate headroom is below the 50 bps floor — deal could break on a minor rate move.` }
      );
      memo.push(
        matched.length > 0
      ? { mark: "✓", color: MINT, text: `${matched.length} stored program scenario${matched.length > 1 ? "s" : ""} match the entered LTV and FICO assumptions.` }
      : { mark: "✕", color: RED,  text: "No stored program scenario matches the entered LTV and FICO assumptions. This does not establish ineligibility." }
      );

      return { deal, verdict, kill, acq, grade, year1CoC, track2DSCR, fiveYearCashFlowReturnProxyPct, composite, factors, memo, matched };
    } catch {
      return null;
    }
  }, [purchasePrice, downPct, monthlyRent, rate, fico, annualTaxes, annualInsurance, hoa]);

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#ds-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  const heroVerdict  = result?.verdict.verdict ?? "—";
  const heroComposite = result?.composite ?? 50;

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",     view: "dscr-calculator" },
        { label: "Programs",      view: "lender-intel" },
      ]}
      cta={{ label: "Get the verdict →", onClick: scrollToTool }}
    >
      {/* Extra CSS: hide number spinners; unified dark-panel input style */}
      <style>{`
        .ds-in::-webkit-outer-spin-button,.ds-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .ds-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
        .ds-field{display:flex;align-items:center;background:${swatch.darkTeal};border:1.5px solid rgba(238,239,211,0.18);border-radius:${radius.sm};padding:0 13px;transition:border-color .15s;}
        .ds-field:focus-within{border-color:${swatch.lemon};outline:2px solid ${swatch.lemon};outline-offset:1px;}
        .ds-field:hover:not(:focus-within){border-color:rgba(238,239,211,0.5);}
        @media(max-width:991px){.ds-tool-grid{grid-template-columns:1fr !important;} .dc-hero{grid-template-columns:1fr !important;} .ds-verdict-inner{grid-template-columns:1fr !important;} .ds-bottom-2{grid-template-columns:1fr !important;} }
        @media(max-width:767px){.ds-band-2{grid-template-columns:1fr !important;}}
      `}</style>

      {/* ── HERO — dark, 2-col: copy left / gauge right (mockup signature) ── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px,9vh,120px) ${dc.pad} clamp(56px,7vh,92px)`,
          overflow: "hidden",
        }}
      >
        <div
          className="dc-hero"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "clamp(36px,5vw,80px)",
            alignItems: "center",
          }}
        >
          {/* Left: hero copy */}
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
                borderRadius: 100,
                padding: "7px 14px",
                marginBottom: 24,
              }}
            >
              Decision engine · IC memo
            </div>
            <H1 style={{ margin: "0 0 24px" }}>
            Explore this deal's modeled tradeoffs.
            </H1>
            <Lead
              style={{
                color: "rgba(238,239,211,0.7)",
                maxWidth: "50ch",
                margin: "0 0 20px",
              }}
            >
            Enter assumptions to compare rent coverage, leverage, modeled returns, and liquidity. The GO, CONDITIONAL, and NO-GO labels are internal model bands for organizing scenarios, not purchase advice, approvals, or underwriting decisions.
            </Lead>
          </div>

          {/* Right: live verdict gauge — the mockup's signature */}
          <VerdictGauge composite={heroComposite} />
        </div>
      </section>

      {/* ── TOOL — dark teal ── */}
      <section
        id="ds-tool"
        style={{ background: dc.teal, color: dc.cream, padding: `clamp(52px,7vw,92px) clamp(1.5rem,4vw,3rem) clamp(64px,9vh,116px)`, borderTop: "1px solid rgba(238,239,211,0.08)" }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 34 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>
              Live decision-support engine
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 10px", color: dc.cream }}>
              Verdict:{" "}
              <span style={{ color: result ? verdictColor(heroVerdict) : dc.lemon }}>
                {result?.verdict.verdict ?? "—"}
              </span>{" "}
              · composite {heroComposite}/100
            </h2>
            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.62)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            The composite score weights DSCR coverage, leverage, estimated return, credit, and liquidity using fixed interface weights. The bands have not been validated as approval or performance predictors.
            </p>
          </div>

          {/* Tool grid: inputs + results */}
          <div
            className="gs-reveal dc-split ds-tool-grid"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}
          >
            {/* ── INPUTS ── */}
            <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 30, border: "1px solid rgba(238,239,211,0.16)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                Deal &amp; borrower
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 18px", lineHeight: 1.5 }}>
                Estimates are fine — the engine re-runs live as you type.
              </p>

              {([
                { label: "Purchase Price", hint: "What you're paying for the property.", value: purchasePrice, set: setPurchasePrice, step: 5000,  prefix: "$", suffix: "" },
            { label: "Down Payment",   hint: "Your modeled cash contribution. A higher input reduces modeled LTV and payment; it does not guarantee terms or approval.", value: downPct, set: setDownPct, step: 1, prefix: "", suffix: "%" },
                { label: "Note Rate",      hint: "The interest rate on the loan. Estimate is fine — use today's market rate.", value: rate, set: setRate, step: 0.125, prefix: "", suffix: "%" },
                { label: "Monthly Rent",   hint: "Expected gross rent. For vacant properties, use market-comparable rent — an estimate is fine.", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$", suffix: "" },
            { label: "FICO Score",     hint: "A scenario input compared with the stored program matrix. Actual credit requirements and pricing vary and must be verified.", value: fico, set: setFico, step: 5, prefix: "", suffix: "" },
                { label: "Annual Taxes",   hint: "Property taxes per year. Find on the county assessor site — estimate is fine.", value: annualTaxes, set: setAnnualTaxes, step: 250, prefix: "$", suffix: "" },
                { label: "Annual Ins.",    hint: "Homeowners insurance per year. Budget $1,500–$3,000 if unknown.", value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$", suffix: "" },
                { label: "Monthly HOA",    hint: "HOA dues per month. Enter 0 if none.", value: hoa, set: setHoa, step: 25, prefix: "$", suffix: "" },
              ] as const).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 16 }}>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {f.label}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>
                    {f.hint}
                  </span>
                  <div className="ds-field" style={{ display: "flex", alignItems: "center" }}>
                    {f.prefix && <span style={{ color: "rgba(238,239,211,0.62)" }}>{f.prefix}</span>}
                    <input
                      className="ds-in"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => (f.set as (n: number) => void)(+e.target.value)}
                      style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                    />
                    {f.suffix && <span style={{ color: "rgba(238,239,211,0.62)" }}>{f.suffix}</span>}
                  </div>
                </label>
              ))}
            </div>

            {/* ── RESULTS ── */}
            {!result ? (
              <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 40, border: "1px solid rgba(238,239,211,0.16)", textAlign: "center" }}>
                <p style={{ color: "#e06363", fontWeight: 600 }}>Engine returned no result — check inputs.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* VERDICT CARD — headline + gauge + BalanceScale + copy */}
                <div
                  className="gs-reveal"
                  style={{
                    background: dc.dark,
                    borderRadius: radius.lg,
                    padding: "clamp(28px,3vw,40px)",
                    border: "1px solid rgba(238,239,211,0.16)",
                  }}
                >
                  {/* Headline answer — verdict first */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: result.verdict.verdict === "PROCEED" ? "rgba(77,189,151,0.12)" : result.verdict.verdict === "RESTRUCTURE" ? "rgba(216,217,88,0.12)" : "rgba(224,99,99,0.12)", border: `1px solid ${verdictColor(result.verdict.verdict)}`, borderRadius: 100, padding: "6px 14px" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: verdictColor(result.verdict.verdict), display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: verdictColor(result.verdict.verdict) }}>IC verdict</span>
                      </div>
                    </div>
                    <Mono style={{ display: "block", fontSize: "clamp(42px,5vw,64px)", fontWeight: 600, letterSpacing: "-0.035em", color: verdictColor(result.verdict.verdict), lineHeight: 1, marginBottom: 12 }}>
                      {result.verdict.verdict}
                    </Mono>
                    <p style={{ fontSize: "clamp(14px,1.2vw,16px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.72)", margin: 0 }}>
                      {result.verdict.verdict === "PROCEED"
              ? "The scenario is within the model's upper band for the entered coverage, leverage, and stored program assumptions. This is not underwriting clearance or a term-sheet invitation."
                        : result.verdict.verdict === "RESTRUCTURE"
              ? "The scenario is within the model's middle band and contains one or more sensitivity flags. Review the assumptions below before relying on the result."
              : "The scenario is outside one or more model bands. This does not predict a lender decision or tell you whether to proceed."}
                    </p>
                  </div>

                  {/* Three symmetric bays: composite score · DSCR · rent vs PITIA.
                      (The big arc gauge lives once in the hero — not duplicated here.) */}
                  <div className="ds-verdict-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "clamp(16px,2.5vw,28px)", alignItems: "stretch", padding: "24px 0", borderTop: "1px solid rgba(238,239,211,0.16)", borderBottom: "1px solid rgba(238,239,211,0.16)", marginBottom: 20 }}>
                    {/* Bay 1 — composite score + zone bar */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>Composite score</div>
                      <Mono style={{ fontSize: "clamp(40px,4.6vw,60px)", fontWeight: 700, letterSpacing: "-0.03em", color: verdictColor(result.verdict.verdict), lineHeight: 1 }}>
                        {result.composite}<span style={{ fontSize: "0.42em", color: "rgba(238,239,211,0.62)" }}>/100</span>
                      </Mono>
                      <div style={{ width: "100%", maxWidth: 210 }}>
                        <div style={{ position: "relative", height: 10, borderRadius: 999, background: "linear-gradient(90deg,#e06363 0 33%,#d8d958 33% 66%,#4dbd97 66% 100%)" }}>
                          <div style={{ position: "absolute", top: "50%", left: `${Math.max(2, Math.min(98, result.composite))}%`, transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: dc.cream, border: `3px solid ${verdictColor(result.verdict.verdict)}`, boxShadow: "0 2px 7px rgba(0,0,0,0.45)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 11, fontFamily: dc.mono, letterSpacing: "0.04em", color: "rgba(238,239,211,0.45)" }}>
                          <span>NO-GO</span><span>COND</span><span>GO</span>
                        </div>
                      </div>
                    </div>
                    {/* Bay 2 — DSCR gauge */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>DSCR</div>
                      <DscrGauge value={result.deal.dscr} size={138} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <RiskFlame level={riskFromDscr(result.deal.dscr)} size={16} />
                        <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", fontWeight: 500 }}>
                          {result.deal.dscr >= 1.25 ? "strong cushion" : result.deal.dscr >= 1.0 ? "qualifies" : "sub-1.0"}
                        </span>
                      </div>
                    </div>
                    {/* Bay 3 — rent vs PITIA balance */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>Rent vs PITIA</div>
                      <BalanceScale rent={monthlyRent} payment={result.deal.monthlyPITIA.total} size={150} />
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 210 }}>
                        <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>${Math.round(monthlyRent).toLocaleString()} rent</span>
                        <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>${Math.round(result.deal.monthlyPITIA.total).toLocaleString()} PITIA</span>
                      </div>
                    </div>
                  </div>

                  {/* Next-step CTA block */}
                  <div style={{ background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.14)", borderRadius: radius.sm, padding: "14px 18px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                      {result.verdict.verdict === "PROCEED" ? "Ready to move forward?" : result.verdict.verdict === "RESTRUCTURE" ? "Want help restructuring?" : "Need guidance on next steps?"}
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(238,239,211,0.65)", margin: "0 0 12px", lineHeight: 1.5 }}>
                      {result.verdict.verdict === "PROCEED"
              ? "The scenario is within the model's upper band. Request an independent review of current terms and requirements if useful."
                        : result.verdict.verdict === "RESTRUCTURE"
                        ? "A Greenstreet specialist can walk through the IC memo items with you and identify the fastest path to a clean file."
                        : "Greenstreet can review what's blocking the deal and explore alternative structures — including sub-1.0 programs or global DSCR options."}
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: dc.emerald, color: dc.dark, fontWeight: 700, fontSize: 13, textDecoration: "none", padding: "10px 18px", borderRadius: radius.sm, minHeight: 44 }}>
                        Get my rate →
                      </a>
                      <a href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1.5px solid rgba(238,239,211,0.5)", color: "rgba(238,239,211,0.8)", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "10px 16px", borderRadius: radius.sm, minHeight: 44 }}>
                        See matching programs →
                      </a>
                    </div>
            <p style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", margin: "10px 0 0" }}>Illustrative decision-support model only. It is not investment advice, underwriting, an approval, a rate quote, or a commitment to lend.</p>
                  </div>
                </div>

                {/* COMPOSITE BREAKDOWN + IC MEMO — side by side (matches mockup 2-col bottom) */}
                <div className="ds-bottom-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
                  {/* Composite factors */}
                  <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 26, border: "1px solid rgba(238,239,211,0.16)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                      Score breakdown — what moved the needle
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.4 }}>
                      Each factor is scored 0–100. Green = strong; yellow = marginal; red = needs attention. The percentage in each label is how much weight it carries in the composite.
                    </p>
                    {result.factors.map((f) => (
                      <div key={f.label} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: dc.cream }}>{f.label}</span>
                          <Mono style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.valStr}</Mono>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "rgba(238,239,211,0.1)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: f.pct, background: f.color, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 5 }}>{f.note}</div>
                      </div>
                    ))}
                  </div>

                  {/* IC MEMO */}
                  <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 26, border: "1px solid rgba(238,239,211,0.16)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                      Why — the plain-language reasons
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.4 }}>
                      ✓ = passing · ~ = borderline · ✕ = fix required
                    </p>
                    {result.memo.map((m, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                        <span style={{ color: m.color, fontWeight: 700, flexShrink: 0 }}>{m.mark}</span>
                        <span style={{ color: "rgba(238,239,211,0.82)", fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{m.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KILL CRITERIA (when flagged) */}
                {result.kill.criteria.length > 0 && (
                  <div className="gs-reveal" style={{ background: dc.dark, borderRadius: radius.lg, padding: 28, border: "1px solid rgba(238,239,211,0.16)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                      Deal issues — {result.kill.criteria.length} flagged
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.4 }}>
                      BLOCKER = must resolve before any lender will proceed. WARNING = worth addressing; may be offset by compensating factors. Each item includes a suggested action.
                    </p>
                    {result.kill.criteria.map((k, i) => {
                      const kc = k.severity === "BLOCKER" ? "#e06363" : k.severity === "WARNING" ? "#e6b84d" : dc.emerald;
                      return (
                        <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.07)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: dc.cream }}>{k.criterion}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: `${kc}22`, color: kc, border: `1px solid ${kc}` }}>
                              {k.severity}
                            </span>
                          </div>
                          <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 12, margin: "0 0 2px" }}>{k.detail}</p>
                          <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 12, margin: 0 }}>
                            <strong style={{ color: dc.emerald }}>Action: </strong>{k.action}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* GRADE + ACQ SCORE */}
                <div
                  className="gs-reveal ds-band-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(238,239,211,0.1)", borderRadius: radius.lg, overflow: "hidden", border: "1px solid rgba(238,239,211,0.16)" }}
                >
                  <div style={{ background: dc.dark, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.emerald, marginBottom: 4 }}>Return grade</div>
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 10 }}>Unavailable without hold, exit, growth, and tax inputs</div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 700, color: dc.cream, lineHeight: 1 }}>
                      {result.grade}
                    </Mono>
                  </div>
                  <div style={{ background: dc.dark, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.emerald, marginBottom: 4 }}>Acquisition score</div>
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 10 }}>75+ = strong buy · 60–74 = conditional · below 60 = restructure</div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 700, color: result.acq.score >= 75 ? dc.emerald : result.acq.score >= 60 ? "#e6b84d" : "#e06363", lineHeight: 1 }}>
                      {Math.round(result.acq.score)}
                    </Mono>
                    <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>{result.acq.band}</div>
                  </div>
                </div>

                {/* ENGINE FOOTNOTE */}
                <div style={{ padding: "14px 18px", background: "rgba(238,239,211,0.05)", borderRadius: radius.sm, border: "1px solid rgba(238,239,211,0.16)", fontSize: 12, color: "rgba(238,239,211,0.62)", lineHeight: 1.6 }}>
                  <strong style={{ color: dc.emerald }}>How PROCEED is decided: </strong>
            The model compares DSCR, a second expense-adjusted coverage track, return bands, rate headroom, stored flags, and program-matrix matches. Its 1.0x line, score weights, return grades, 50-basis-point headroom, program snapshot, and PPP setting are internal assumptions.{" "}
            Results are illustrative and do not determine purchase suitability, legal availability, lender eligibility, approval, pricing, or final terms.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
