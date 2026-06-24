import React, { useState, useMemo } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedNumber,
  PremiumInput
} from "./PageShell";
import { computeVerdict, computeDealKillCheck, computeAcquisitionScore, computeReturnGrade } from "../engine/decisionSupport";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import type { PropertyInputs, BorrowerProfile, LoanStructure } from "../engine/types";

const MINT = swatch.emerald;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function DecisionSupportPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct, setDownPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [ltvFloor, setLtvFloor] = useState(75);
  const [fico, setFico] = useState(740);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

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
      const year1CoC = deal.dualTrackDSCR.track2.qualifyingRent * 12 - deal.monthlyPITIA.total * 12 > 0 ? ((deal.dualTrackDSCR.track2.qualifyingRent * 12 - deal.monthlyPITIA.total * 12) / cashInvested) * 100 : 0;
      const afterTaxIRR = Math.max(0, (year1CoC / 100) * 5);
      const track2DSCR = deal.dualTrackDSCR.track2.dscr;
      const verdict = computeVerdict({
        track1DSCR: deal.dscr,
        track2DSCR,
        lenderMinDSCR: 1.0,
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
        ltvCap: 80,
        loanAmount: deal.loanAmount,
        lenderMinLoan: 75000,
        bestLenderConfidence: 75,
        lenderRanking: [],
        isDecliningMarket: false,
      });
      const kill = computeDealKillCheck(deal, inputs.borrower, inputs.loan, inputs.property, inputs.strategy, null, null, null);
      const acq = computeAcquisitionScore(deal, null, inputs.property, inputs.borrower, inputs.loan, inputs.strategy, null, null);
      const grade = computeReturnGrade((year1CoC / 100) * 5, track2DSCR);
      return { deal, verdict, kill, acq, grade, year1CoC, track2DSCR, afterTaxIRR };
    } catch (e) {
      return null;
    }
  }, [purchasePrice, downPct, monthlyRent, rate, ltvFloor, fico, annualTaxes, annualInsurance, hoa]);

  return (
    <PageShell
      title="Decision Support (IC Memo)"
      subtitle="Calls engine.computeVerdict + computeDealKillCheck + computeAcquisitionScore + computeReturnGrade. Returns the yes/no, the binding constraint, and an A/B/C/D/F grade."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <AnimatedCard hoverScale={false}>
          <div style={sectionTitle}>Deal Inputs</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "Down Payment", value: downPct, set: setDownPct, step: 1, suffix: "%" },
            { label: "Note Rate", value: rate, set: setRate, step: 0.125, suffix: "%" },
            { label: "Monthly Rent", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "FICO", value: fico, set: setFico, step: 5 },
            { label: "Annual Taxes", value: annualTaxes, set: setAnnualTaxes, step: 250, prefix: "$" },
            { label: "Annual Insurance", value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$" },
            { label: "Monthly HOA", value: hoa, set: setHoa, step: 25, prefix: "$" },
          ].map((f) => (
            <PremiumInput
              key={f.label}
              type="number"
              label={f.label}
              value={f.value}
              step={f.step}
              prefixSymbol={f.prefix}
              suffixSymbol={f.suffix}
              onChange={(e) => f.set(+e.target.value)}
            />
          ))}
        </AnimatedCard>

        <div>
          {!result ? (
            <AnimatedCard hoverScale={false} style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result.</p>
            </AnimatedCard>
          ) : (
            <>
              <AnimatedCard hoverScale={true} style={{ textAlign: "center", borderColor: result.verdict.verdict === "PROCEED" ? MINT : result.verdict.verdict === "RESTRUCTURE" ? YELLOW : "#ff6b6b" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>Verdict</div>
                <div style={{ fontSize: "60px", fontWeight: 800, color: result.verdict.verdict === "PROCEED" ? MINT : result.verdict.verdict === "RESTRUCTURE" ? YELLOW : "#ff6b6b", lineHeight: 1 }}>{result.verdict.verdict}</div>
                <div style={{ fontSize: "13px", color: "#aaa", marginTop: "12px" }}>
                  Binding: <strong style={{ color: CREAM }}>{result.verdict.bindingConstraint}</strong>
                </div>
              </AnimatedCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginTop: "20px" }}>
                {[
                  { label: "Track 1 DSCR", value: result.deal.dscr, format: (v: number) => `${v.toFixed(2)}x`, color: result.deal.dscr >= 1.25 ? MINT : result.deal.dscr >= 1.0 ? YELLOW : "#ff6b6b" },
                  { label: "Track 2 DSCR", value: result.track2DSCR, format: (v: number) => `${v.toFixed(2)}x`, color: result.track2DSCR >= 1.25 ? MINT : result.track2DSCR >= 1.0 ? YELLOW : "#ff6b6b" },
                  { label: "Rate Cushion", value: result.deal.rateHeadroomBps, format: (v: number) => `${Math.round(v)} bps`, color: result.deal.rateHeadroomBps > 50 ? MINT : "#ff6b6b" },
                  { label: "Acq Score", value: result.acq.score, format: (v: number) => `${Math.round(v)}/100`, color: result.acq.score >= 75 ? MINT : result.acq.score >= 60 ? YELLOW : "#ff6b6b" },
                ].map((m) => (
                  <AnimatedCard key={m.label} hoverScale={true} style={{ background: "rgba(0,55,56,0.04)", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: m.color, marginTop: "4px" }}>
                      <AnimatedNumber value={m.value} format={m.format} />
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Kill-Criterion Checklist ({result.kill.criteria.length} flagged, {result.kill.allClear ? "all clear" : "review"})</div>
                {result.kill.criteria.length === 0 ? (
                  <p style={{ color: MINT, fontSize: "14px", padding: "12px 0" }}>No blockers or warnings.</p>
                ) : (
                  result.kill.criteria.map((k, i) => {
                    const color = k.severity === "BLOCKER" ? "#ff6b6b" : k.severity === "WARNING" ? YELLOW : "#018582";
                    return (
                      <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: CREAM, fontWeight: 600, fontSize: "14px" }}>{k.criterion}</span>
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", background: `${color}33`, color, border: `1px solid ${color}` }}>{k.severity}</span>
                        </div>
                        <p style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>{k.detail}</p>
                        <p style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}><strong style={{ color: MINT }}>Action:</strong> {k.action}</p>
                      </div>
                    );
                  })
                )}
              </AnimatedCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "20px" }}>
                <AnimatedCard hoverScale={true} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT }}>Return Grade</div>
                  <div style={{ fontSize: "60px", fontWeight: 800, color: result.grade === "A" || result.grade === "B" ? MINT : result.grade === "C" ? YELLOW : "#ff6b6b", lineHeight: 1, marginTop: "8px" }}>{result.grade}</div>
                </AnimatedCard>
                <AnimatedCard hoverScale={true} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT }}>Acquisition Score</div>
                  <div style={{ fontSize: "60px", fontWeight: 800, color: result.acq.score >= 75 ? MINT : result.acq.score >= 60 ? YELLOW : "#ff6b6b", lineHeight: 1, marginTop: "8px" }}>
                    <AnimatedNumber value={result.acq.score} format={(v) => String(Math.round(v))} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>{result.acq.band}</div>
                </AnimatedCard>
              </div>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(77,189,151,0.08)", borderRadius: "10px", border: "1px solid rgba(77,189,151,0.2)", fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
                <strong style={{ color: MINT }}>Engine:</strong> src/engine/decisionSupport.ts → computeVerdict + computeDealKillCheck + computeReturnGrade. PROCEED requires: T1 ≥ lender min + 5bps cushion, T2 ≥ 1.0 (or negative-carry ack), Grade ≥ B, cushion ≥ 50bps, no blockers, ≥1 eligible lender.
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}