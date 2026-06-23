// @ts-nocheck
import React, { useState, useMemo } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";
import { buildEngineInputs, DealRequest } from "../engine/inputs";
import { analyzeRefi } from "../engine/refiTracker";
import type { PropertyInputs, BorrowerProfile } from "../engine/types";

const MINT = "#006565";
const CREAM = "#003738";
const YELLOW = "#8a6d00";

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function RefiTrackerPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [currentBalance, setCurrentBalance] = useState(340000);
  const [currentRate, setCurrentRate] = useState(7.25);
  const [currentPayment, setCurrentPayment] = useState(2317);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [monthsOwned, setMonthsOwned] = useState(8);
  const [projectedRate, setProjectedRate] = useState(6.5);
  const [projectedAppreciation, setProjectedAppreciation] = useState(5);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

  const result = useMemo(() => {
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
      const borrower: BorrowerProfile = {
        ficoScore: 740,
        experience: "EXPERIENCED",
        existingFinancedProperties: 1,
        entityType: "LLC",
        isUSCitizenOrPR: true,
        availableReserves: 0,
        reserveAssets: [],
        isFirstResponder: false,
        isForeignNational: false,
      };
      const analysis = analyzeRefi(
        property,
        borrower,
        { balance: currentBalance, rate: currentRate, monthlyPayment: currentPayment },
        monthsOwned,
        projectedAppreciation,
        projectedRate,
      );
      const totalScore = analysis.refiReadinessScore;
      const factors = analysis.readinessFactors.map((f) => ({
        factor: f.factor,
        score: f.score,
        maxScore: f.maxScore,
        status: f.status,
        detail: f.detail,
      }));
      const appreciatedValue = purchasePrice * (1 + projectedAppreciation / 100);
      return {
        totalScore,
        factors,
        currentDSCR: analysis.currentDSCR,
        refiDSCR: analysis.projectedRefiDSCR,
        appreciatedValue,
        cashOutMaxAmount: analysis.cashOutMaxAmount,
        monthlySavings: analysis.monthlySavings,
        breakEvenMonths: analysis.breakEvenMonths,
        refiType: analysis.refiType,
        seasoningMet: analysis.seasoningMet,
      };
    } catch (e) {
      return null;
    }
  }, [purchasePrice, currentBalance, currentRate, currentPayment, monthlyRent, monthsOwned, projectedRate, projectedAppreciation, annualTaxes, annualInsurance, hoa]);

  const verdictColor = !result ? "#ff6b6b" : result.totalScore >= 80 ? MINT : result.totalScore >= 55 ? YELLOW : "#ff6b6b";
  const verdictLabel = !result ? "INPUTS REQUIRED" : result.totalScore >= 80 ? "REFI READY" : result.totalScore >= 55 ? "CONDITIONAL" : "NOT READY";

  return (
    <PageShell
      title="Refi Tracker"
      subtitle="When does it pay to refi a DSCR loan? Uses the v11 engine's analyzeRefi: 4-factor readiness score + monthly savings + break-even + cash-out capacity."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <div style={{ ...card }}>
          <div style={sectionTitle}>Current Loan</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "Current Loan Balance", value: currentBalance, set: setCurrentBalance, step: 1000, prefix: "$" },
            { label: "Current Rate", value: currentRate, set: setCurrentRate, step: 0.125, suffix: "%" },
            { label: "Current Monthly P&I", value: currentPayment, set: setCurrentPayment, step: 25, prefix: "$" },
            { label: "Months Owned", value: monthsOwned, set: setMonthsOwned, step: 1 },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
          <div style={{ ...sectionTitle, marginTop: "20px" }}>Property and Refi Assumptions</div>
          {[
            { label: "Monthly Rent (qualifying)", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Annual Taxes", value: annualTaxes, set: setAnnualTaxes, step: 500, prefix: "$" },
            { label: "Annual Insurance", value: annualInsurance, set: setAnnualInsurance, step: 250, prefix: "$" },
            { label: "Monthly HOA", value: hoa, set: setHoa, step: 25, prefix: "$" },
            { label: "Projected Rate at Refi", value: projectedRate, set: setProjectedRate, step: 0.125, suffix: "%" },
            { label: "Projected Appreciation", value: projectedAppreciation, set: setProjectedAppreciation, step: 0.5, suffix: "%" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
        </div>

        <div>
          {!result ? (
            <div style={{ ...card, textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b", fontSize: "14px" }}>Engine returned no result for these inputs. Adjust loan amount or rent and try again.</p>
            </div>
          ) : (
            <>
              <div style={{ ...card, textAlign: "center", borderColor: verdictColor }}>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>Refi Readiness Score</div>
                <div style={{ fontSize: "72px", fontWeight: 800, color: verdictColor, lineHeight: 1 }}>{result.totalScore}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: verdictColor, margin: "8px 0 16px" }}>{verdictLabel}</div>
                <div style={{ fontSize: "14px", color: "#4a5d5d" }}>
                  {result.refiType === "RATE_TERM" && "Rate-and-term refi. Loan balance roughly flat."}
                  {result.refiType === "CASH_OUT" && `Cash-out capacity: ${fmt$(result.cashOutMaxAmount)} at 70% LTV.`}
                  {result.refiType === "NO_REFI" && "No savings, no equity. Wait for better conditions."}
                </div>
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Refi Math (engine.analyzeRefi)</div>
                <Row label="Current DSCR" value={`${result.currentDSCR.toFixed(2)}x`} />
                <Row label="Projected DSCR after refi" value={`${result.refiDSCR.toFixed(2)}x`} highlight={result.refiDSCR >= 1.0 ? MINT : "#ff6b6b"} />
                <Row label="Monthly savings" value={`${result.monthlySavings >= 0 ? "+" : ""}${fmt$(result.monthlySavings)}`} highlight={result.monthlySavings >= 0 ? MINT : "#ff6b6b"} />
                <Row label="Break-even (months)" value={result.breakEvenMonths > 120 ? "100+ (don't refi)" : `${result.breakEvenMonths}`} highlight={result.breakEvenMonths < 36 ? MINT : YELLOW} />
                <Row label="Cash-out capacity (70% LTV)" value={fmt$(result.cashOutMaxAmount)} />
                <Row label="Seasoning met (6 mo required)" value={result.seasoningMet ? "Yes" : `No — ${monthsOwned}/6 months`} highlight={result.seasoningMet ? MINT : "#ff6b6b"} />
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Score Breakdown (engine output)</div>
                {result.factors.map((f) => {
                  const color = f.status === "PASS" ? MINT : f.status === "WARN" ? YELLOW : "#ff6b6b";
                  return (
                    <div key={f.factor} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: CREAM, fontSize: "14px", fontWeight: 600 }}>{f.factor}</span>
                        <span style={{ color, fontWeight: 700, fontSize: "14px" }}>{f.score} / {f.maxScore}</span>
                      </div>
                      <p style={{ color: "#5a6b6b", fontSize: "12px", marginTop: "4px", lineHeight: 1.5 }}>{f.detail}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(0,101,101,0.08)", borderRadius: "10px", border: "1px solid rgba(0,101,101,0.22)", fontSize: "12px", color: "#4a5d5d", lineHeight: 1.6 }}>
                <strong style={{ color: MINT }}>Engine source:</strong> src/engine/refiTracker.ts → analyzeRefi (v11.7). 4-factor composite: seasoning (25), equity (25), DSCR headroom (25), monthly savings (25). Cash-out cap is 70% LTV; rate-term cap is 75%.
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", fontSize: "14px" }}>
      <span style={{ color: "#5a6b6b" }}>{label}</span>
      <span style={{ color: highlight || CREAM, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}