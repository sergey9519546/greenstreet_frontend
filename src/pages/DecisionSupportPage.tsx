import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { swatch, radius } from "../theme";
import { DscrGauge, BalanceScale, RiskFlame, riskFromDscr } from "../design/artifacts";
import { computeVerdict, computeDealKillCheck, computeAcquisitionScore, computeReturnGrade } from "../engine/decisionSupport";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import type { LenderRankingEntry } from "../engine/types";
import { DSCR_PROGRAMS, lookupMaxLTV } from "../data/dscrPrograms";

// ── helpers ─────────────────────────────────────────────────────────────────
function verdictColor(v: string): string {
  if (v === "PROCEED") return dc.emerald;
  if (v === "RESTRUCTURE") return "#d8d958";
  return "#ff6b6b";
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
  return "#ff6b6b";
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
        <path d="M 30,150 A 110,110 0 0 1 73,64"   fill="none" stroke="#ff6b6b" strokeWidth="16" strokeLinecap="round" />
        <path d="M 86,54  A 110,110 0 0 1 194,54"  fill="none" stroke="#d8d958" strokeWidth="16" strokeLinecap="round" />
        <path d="M 207,64 A 110,110 0 0 1 250,150" fill="none" stroke="#4dbd97" strokeWidth="16" strokeLinecap="round" />

        {/* Needle */}
        <g style={needleStyle}>
          <line x1="140" y1="150" x2="140" y2="60" stroke="#eeefd3" strokeWidth="4" strokeLinecap="round" />
          <circle cx="140" cy="150" r="9" fill="#eeefd3" />
        </g>

        {/* Zone labels */}
        <text x="28"  y="170" fill="rgba(255,107,107,0.85)"  fontSize="11" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">NO-GO</text>
        <text x="140" y="34"  fill="rgba(216,217,88,0.95)"   fontSize="11" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">CONDITIONAL</text>
        <text x="252" y="170" fill="rgba(77,189,151,0.95)"   fontSize="11" fontFamily="'JetBrains Mono',monospace" textAnchor="middle">GO</text>

        {/* Composite score centred below pivot */}
        <text x="140" y="168" fill="rgba(238,239,211,0.55)" fontSize="13" fontFamily="'JetBrains Mono',monospace" textAnchor="middle" fontWeight="600">
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
        afterTaxIRR,          // fixed: now uses the local computed value
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
        { label: "Est. 5-yr return proxy (20%)", v: irrScore,  note: `${(afterTaxIRR * 100).toFixed(1)}% (proxy, not true IRR)` },
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

  const heroVerdict  = result?.verdict.verdict ?? "—";
  const heroComposite = result?.composite ?? 50;

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",     view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer" },
      ]}
      cta={{ label: "Get the verdict →", onClick: scrollToTool }}
    >
      {/* Extra CSS: hide number spinners; unified dark-panel input style */}
      <style>{`
        .ds-in::-webkit-outer-spin-button,.ds-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .ds-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
        .ds-field{display:flex;align-items:center;background:${swatch.darkTeal};border:1.5px solid rgba(238,239,211,0.18);border-radius:${radius.sm};padding:0 13px;transition:border-color .15s;}
        .ds-field:focus-within{border-color:${swatch.lemon};outline:2px solid ${swatch.lemon};outline-offset:1px;}
        .ds-field:hover:not(:focus-within){border-color:rgba(238,239,211,0.38);}
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
                color: dc.dark,
                background: dc.lemon,
                borderRadius: 100,
                padding: "7px 14px",
                marginBottom: 24,
              }}
            >
              Decision engine · IC memo
            </div>
            <H1 style={{ margin: "0 0 24px" }}>
              Should you buy this deal?
            </H1>
            <Lead
              style={{
                color: "rgba(238,239,211,0.7)",
                maxWidth: "50ch",
                margin: "0 0 20px",
              }}
            >
              Enter your deal numbers. This tool checks DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger), leverage, returns, and liquidity all at once, then delivers a single plain-English verdict: GO, CONDITIONAL, or NO-GO — with the reasons spelled out so you know exactly what to fix.
            </Lead>
            <p style={{ color: "rgba(238,239,211,0.5)", fontSize: 14, fontWeight: 500, margin: "0 0 32px", lineHeight: 1.5 }}>
              How to use: fill in your deal on the left. The gauge and verdict update live. Aim for GO before you submit.
            </p>
            <Btn label="Run the decision engine ↓" href="#ds-tool" onClick={scrollToTool} />
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
            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.55)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              The composite score (0–100) weights DSCR coverage, leverage, estimated return, credit, and liquidity. A score above 66 typically clears underwriting.
            </p>
          </div>

          {/* Tool grid: inputs + results */}
          <div
            className="gs-reveal dc-split ds-tool-grid"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}
          >
            {/* ── INPUTS ── */}
            <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 30, border: "1px solid rgba(238,239,211,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                Deal &amp; borrower
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.45)", margin: "0 0 18px", lineHeight: 1.5 }}>
                Estimates are fine — the engine re-runs live as you type.
              </p>

              {([
                { label: "Purchase Price", hint: "What you're paying for the property.", value: purchasePrice, set: setPurchasePrice, step: 5000,  prefix: "$", suffix: "" },
                { label: "Down Payment",   hint: "Your cash in — higher down = lower LTV (how the loan amount compares to the property value; lower = more equity = better terms) = stronger approval odds.", value: downPct, set: setDownPct, step: 1, prefix: "", suffix: "%" },
                { label: "Note Rate",      hint: "The interest rate on the loan. Estimate is fine — use today's market rate.", value: rate, set: setRate, step: 0.125, prefix: "", suffix: "%" },
                { label: "Monthly Rent",   hint: "Expected gross rent. For vacant properties, use market-comparable rent — an estimate is fine.", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$", suffix: "" },
                { label: "FICO Score",     hint: "Your credit score. Affects which programs you qualify for. 620 minimum for most DSCR programs; 740+ unlocks best pricing.", value: fico, set: setFico, step: 5, prefix: "", suffix: "" },
                { label: "Annual Taxes",   hint: "Property taxes per year. Find on the county assessor site — estimate is fine.", value: annualTaxes, set: setAnnualTaxes, step: 250, prefix: "$", suffix: "" },
                { label: "Annual Ins.",    hint: "Homeowners insurance per year. Budget $1,500–$3,000 if unknown.", value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$", suffix: "" },
                { label: "Monthly HOA",    hint: "HOA dues per month. Enter 0 if none.", value: hoa, set: setHoa, step: 25, prefix: "$", suffix: "" },
              ] as const).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 16 }}>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.55)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {f.label}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.38)", marginBottom: 5, lineHeight: 1.4 }}>
                    {f.hint}
                  </span>
                  <div className="ds-field" style={{ display: "flex", alignItems: "center" }}>
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
              <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 40, border: "1px solid rgba(238,239,211,0.1)", textAlign: "center" }}>
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
                    border: "1px solid rgba(238,239,211,0.1)",
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
                        ? "This deal clears all primary underwriting signals. The rent covers the payment, leverage is within program limits, and at least one Greenstreet program fits. You can move to term sheet."
                        : result.verdict.verdict === "RESTRUCTURE"
                        ? "This deal is workable but has at least one weak signal — usually DSCR too close to the floor, LTV too high, or rate headroom too thin. See the IC memo below for what to fix before submitting."
                        : "This deal fails one or more hard gates. Most lenders will decline as structured. The IC memo and kill-criterion checklist below tell you specifically what needs to change."}
                    </p>
                  </div>

                  {/* Artifact strip: VerdictGauge + DscrGauge + BalanceScale */}
                  <div className="ds-verdict-inner" style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "clamp(16px,2.5vw,32px)", alignItems: "center", padding: "20px 0", borderTop: "1px solid rgba(238,239,211,0.1)", borderBottom: "1px solid rgba(238,239,211,0.1)", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.4)", marginBottom: 8, textAlign: "center" }}>Decision gauge</div>
                      <VerdictGauge composite={result.composite} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.4)", marginBottom: 4 }}>DSCR</div>
                      <DscrGauge value={result.deal.dscr} size={140} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <RiskFlame level={riskFromDscr(result.deal.dscr)} size={16} />
                        <span style={{ fontSize: 11, color: "rgba(238,239,211,0.45)", fontWeight: 500 }}>
                          {result.deal.dscr >= 1.25 ? "strong cushion" : result.deal.dscr >= 1.0 ? "qualifies" : "sub-1.0"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.4)", marginBottom: 4 }}>Rent vs PITIA</div>
                      <BalanceScale rent={monthlyRent} payment={result.deal.monthlyPITIA.total} size={170} />
                      <div style={{ display: "flex", justifyContent: "space-between", width: "90%" }}>
                        <span style={{ fontSize: 10, color: "rgba(238,239,211,0.4)" }}>${Math.round(monthlyRent).toLocaleString()} rent</span>
                        <span style={{ fontSize: 10, color: "rgba(238,239,211,0.4)" }}>${Math.round(result.deal.monthlyPITIA.total).toLocaleString()} PITIA</span>
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
                        ? "Your deal clears underwriting checks. Get a formal rate quote and term sheet from Greenstreet."
                        : result.verdict.verdict === "RESTRUCTURE"
                        ? "A Greenstreet specialist can walk through the IC memo items with you and identify the fastest path to a clean file."
                        : "Greenstreet can review what's blocking the deal and explore alternative structures — including sub-1.0 programs or global DSCR options."}
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 13, textDecoration: "none", padding: "10px 18px", borderRadius: radius.sm, minHeight: 44 }}>
                        Get my rate →
                      </a>
                      <a href="/deal-analyzer" onClick={(e) => { e.preventDefault(); onNavigate?.("deal-analyzer"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1.5px solid rgba(238,239,211,0.28)", color: "rgba(238,239,211,0.8)", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "10px 16px", borderRadius: radius.sm, minHeight: 44 }}>
                        Full deal analyzer →
                      </a>
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(238,239,211,0.38)", margin: "10px 0 0" }}>Preliminary estimate — not a commitment to lend. Contact Greenstreet at +1 (555) 010-0000.</p>
                  </div>
                </div>

                {/* COMPOSITE BREAKDOWN + IC MEMO — side by side (matches mockup 2-col bottom) */}
                <div className="ds-bottom-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
                  {/* Composite factors */}
                  <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 26, border: "1px solid rgba(238,239,211,0.1)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                      Score breakdown — what moved the needle
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.45)", margin: "0 0 14px", lineHeight: 1.4 }}>
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
                        <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.5)", marginTop: 5 }}>{f.note}</div>
                      </div>
                    ))}
                  </div>

                  {/* IC MEMO */}
                  <div style={{ background: dc.dark, borderRadius: radius.lg, padding: 26, border: "1px solid rgba(238,239,211,0.1)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                      Why — the plain-language reasons
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.45)", margin: "0 0 14px", lineHeight: 1.4 }}>
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
                  <div className="gs-reveal" style={{ background: dc.dark, borderRadius: radius.lg, padding: 28, border: "1px solid rgba(238,239,211,0.1)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                      Deal issues — {result.kill.criteria.length} flagged
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.45)", margin: "0 0 14px", lineHeight: 1.4 }}>
                      BLOCKER = must resolve before any lender will proceed. WARNING = worth addressing; may be offset by compensating factors. Each item includes a suggested action.
                    </p>
                    {result.kill.criteria.map((k, i) => {
                      const kc = k.severity === "BLOCKER" ? "#e06363" : k.severity === "WARNING" ? "#e6b84d" : dc.emerald;
                      return (
                        <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.07)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: dc.cream }}>{k.criterion}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: `${kc}22`, color: kc, border: `1px solid ${kc}` }}>
                              {k.severity}
                            </span>
                          </div>
                          <p style={{ color: "rgba(238,239,211,0.55)", fontSize: 12, margin: "0 0 2px" }}>{k.detail}</p>
                          <p style={{ color: "rgba(238,239,211,0.55)", fontSize: 12, margin: 0 }}>
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
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(238,239,211,0.1)", borderRadius: radius.lg, overflow: "hidden", border: "1px solid rgba(238,239,211,0.1)" }}
                >
                  <div style={{ background: dc.dark, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.emerald, marginBottom: 4 }}>Return grade</div>
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.4)", marginBottom: 10 }}>A = 10%+ IRR proxy · D = below 4%</div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 700, color: gradeColor(result.grade), lineHeight: 1 }}>
                      {result.grade}
                    </Mono>
                  </div>
                  <div style={{ background: dc.dark, padding: "28px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.emerald, marginBottom: 4 }}>Acquisition score</div>
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.4)", marginBottom: 10 }}>75+ = strong buy · 60–74 = conditional · below 60 = restructure</div>
                    <Mono style={{ display: "block", fontSize: "clamp(52px,7vw,80px)", fontWeight: 700, color: result.acq.score >= 75 ? dc.emerald : result.acq.score >= 60 ? "#e6b84d" : "#e06363", lineHeight: 1 }}>
                      {Math.round(result.acq.score)}
                    </Mono>
                    <div style={{ fontSize: 12, color: "rgba(238,239,211,0.5)", marginTop: 4 }}>{result.acq.band}</div>
                  </div>
                </div>

                {/* ENGINE FOOTNOTE */}
                <div style={{ padding: "14px 18px", background: "rgba(238,239,211,0.05)", borderRadius: radius.sm, border: "1px solid rgba(238,239,211,0.1)", fontSize: 12, color: "rgba(238,239,211,0.55)", lineHeight: 1.6 }}>
                  <strong style={{ color: dc.emerald }}>How PROCEED is decided: </strong>
                  The engine checks DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger) above the lender minimum with a small cushion, a second rent-coverage check at 1.0x, a return grade of B or better, at least 50 basis points of rate headroom before the deal breaks, no hard blockers, and at least one eligible Greenstreet program.{" "}
                  Preliminary estimate — not a commitment to lend. Final terms subject to full underwriting. Contact Greenstreet at +1 (555) 010-0000.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </DcShell>
  );
}
