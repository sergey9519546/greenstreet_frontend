// @ts-nocheck
import React, { useState, useMemo } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";
import { computeReturns, computeHoldMatrix } from "../engine/returnsEngine";
import type { PropertyInputs, LoanStructure } from "../engine/types";

const MINT = "#4DBD97";
const CREAM = "#003738";
const YELLOW = "#D8D958";

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function ReturnsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [ltv, setLtv] = useState(75);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [holdYears, setHoldYears] = useState(5);
  const [exitCapRate, setExitCapRate] = useState(6.5);
  const [rentGrowth, setRentGrowth] = useState(3);
  const [vacancy, setVacancy] = useState(8);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);
  const [prepayAtExit, setPrepayAtExit] = useState(2);

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
      const ret = computeReturns(property, loan, monthlyRent, "LTR", rate, (prepayAtExit / 100) * (purchasePrice * (1 - ltv / 100)));
      const matrix = computeHoldMatrix(property, loan, monthlyRent, "LTR", rate, holdYears, exitCapRate, rentGrowth);
      return { ret, matrix };
    } catch (e) {
      return null;
    }
  }, [purchasePrice, ltv, monthlyRent, rate, holdYears, exitCapRate, rentGrowth, vacancy, annualTaxes, annualInsurance, hoa, prepayAtExit]);

  const verdictColor = !result ? MINT : result.ret.leveredIRR >= 12 ? MINT : result.ret.leveredIRR >= 8 ? YELLOW : "#ff6b6b";
  const verdictLabel = !result ? "—" : result.ret.leveredIRR >= 12 ? "STRONG DEAL" : result.ret.leveredIRR >= 8 ? "WORKABLE" : "WEAK";

  return (
    <PageShell
      title="Returns and IRR"
      subtitle="Calls engine.computeReturns + engine.computeHoldMatrix. Pre-tax levered IRR, equity multiple, and a 4×4 hold × rent-growth × exit-cap sensitivity matrix."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <div style={{ ...card }}>
          <div style={sectionTitle}>Deal Inputs</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "LTV", value: ltv, set: setLtv, step: 1, suffix: "%" },
            { label: "Note Rate", value: rate, set: setRate, step: 0.125, suffix: "%" },
            { label: "Monthly Rent", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Annual Taxes", value: annualTaxes, set: setAnnualTaxes, step: 250, prefix: "$" },
            { label: "Annual Insurance", value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$" },
            { label: "Monthly HOA", value: hoa, set: setHoa, step: 25, prefix: "$" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
          <div style={{ ...sectionTitle, marginTop: "20px" }}>Exit Assumptions</div>
          {[
            { label: "Hold Years", value: holdYears, set: setHoldYears, step: 1 },
            { label: "Exit Cap Rate", value: exitCapRate, set: setExitCapRate, step: 0.25, suffix: "%" },
            { label: "Rent Growth (annual)", value: rentGrowth, set: setRentGrowth, step: 0.5, suffix: "%" },
            { label: "Prepay at Exit", value: prepayAtExit, set: setPrepayAtExit, step: 1, suffix: "%" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
        </div>

        <div>
          {!result ? (
            <div style={{ ...card, textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result. Adjust inputs.</p>
            </div>
          ) : (
            <>
              <div style={{ ...card, textAlign: "center", borderColor: verdictColor }}>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>Levered IRR (Year {holdYears} Exit)</div>
                <div style={{ fontSize: "60px", fontWeight: 800, color: verdictColor, lineHeight: 1 }}>{result.ret.leveredIRR.toFixed(1)}%</div>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: verdictColor, margin: "8px 0 16px" }}>{verdictLabel}</div>
                <div style={{ fontSize: "14px", color: "#aaa" }}>
                  Equity multiple: <strong style={{ color: CREAM }}>{result.ret.equityMultiple.toFixed(2)}x</strong> · Cash invested: {fmt$(result.ret.cashInvested)}
                </div>
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Returns Stack (Year 1, engine output)</div>
                <Row label="Entry Cap Rate" value={`${result.ret.entryCapRate.toFixed(2)}%`} />
                <Row label="Yield on Cost" value={`${result.ret.yieldOnCost.toFixed(2)}%`} />
                <Row label="Debt Yield" value={`${result.ret.debtYield.toFixed(2)}%`} />
                <Row label="Year 1 Cash-on-Cash" value={`${result.ret.year1CashOnCash.toFixed(1)}%`} highlight={result.ret.year1CashOnCash >= 8 ? MINT : YELLOW} />
                <Row label="Break-even Occupancy" value={`${result.ret.breakEvenOccupancy.toFixed(1)}%`} />
                <Row label="Levered IRR (Pre-tax)" value={`${result.ret.leveredIRR.toFixed(1)}%`} highlight={verdictColor} />
                <Row label="Unlevered IRR" value={`${result.ret.unleveredIRR.toFixed(1)}%`} />
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Exit Math (engine output)</div>
                <Row label="Exit value (cap rate applied)" value={fmt$(result.ret.exitValue)} />
                <Row label="Net to seller at exit" value={fmt$(result.ret.netExitProceeds)} highlight={MINT} />
                <Row label="Prepay penalty at exit" value={fmt$(result.ret.prepayPenaltyAtExit)} />
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Hold × Rent Growth × Exit Cap Matrix (engine.computeHoldMatrix)</div>
                <div style={{ overflowX: "auto", marginTop: "8px" }}>
                  <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "6px 4px", color: "#888", textAlign: "left", fontWeight: 600 }}>Hold × Rent</th>
                        {result.matrix.length > 0 && result.matrix[0].cells.map((c: any) => (
                          <th key={c.rentGrowthPct} style={{ padding: "6px 4px", color: "#888", textAlign: "right", fontWeight: 600 }}>+{c.rentGrowthPct}%</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.matrix.map((row: any) => (
                        <tr key={row.holdYears}>
                          <td style={{ padding: "6px 4px", color: CREAM, fontWeight: 600 }}>{row.holdYears} yr</td>
                          {row.cells.map((c: any) => {
                            const color = c.verdict === "ROBUST" ? MINT : c.verdict === "STABLE" ? YELLOW : c.verdict === "CONDITIONAL" ? "#018582" : c.verdict === "FRAGILE" ? "#ff6b6b" : "#888";
                            return (
                              <td key={c.rentGrowthPct} style={{ padding: "6px 4px", textAlign: "right", color, fontWeight: 700, background: c.verdict === "ROBUST" ? "rgba(77,189,151,0.08)" : "transparent" }}>
                                {c.leveredIRR.toFixed(1)}%
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(77,189,151,0.08)", borderRadius: "10px", border: "1px solid rgba(77,189,151,0.2)", fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
                <strong style={{ color: MINT }}>Engine:</strong> src/engine/returnsEngine.ts → computeReturns + computeHoldMatrix. {result.ret.holdMatrix.length * result.ret.holdMatrix[0]?.cells?.length || 16} cells in the sensitivity matrix. Each cell uses proper amortization for remaining balance.
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
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ color: highlight || CREAM, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}