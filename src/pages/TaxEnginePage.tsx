// @ts-nocheck
import React, { useState, useMemo } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";
import { computeAfterTaxIRR } from "../engine/taxEngine";
import { calculatePI } from "../engine/engine";
import type { TaxProfile, FilingStatus } from "../engine/types";

const MINT = "#4DBD97";
const CREAM = "#003738";
const YELLOW = "#D8D958";

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function TaxEnginePage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
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

  const result = useMemo(() => {
    try {
      const loanAmount = purchasePrice * (1 - ltv / 100);
      const piMonthly = calculatePI(loanAmount, rate, 360);
      const ads = piMonthly * 12;
      const annualNOI = (monthlyRent * 12 * 0.85) - annualTaxes - annualInsurance - hoa * 12;
      const pitiaMonthly = piMonthly + annualTaxes / 12 + annualInsurance / 12 + hoa;
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
      const r = computeAfterTaxIRR(
        purchasePrice,
        loanAmount,
        monthlyRent,
        annualNOI,
        ads,
        pitiaMonthly,
        taxProfile,
        (1 / 100) * loanAmount,
        rate,
        360,
      );
      return r;
    } catch (e) {
      return null;
    }
  }, [purchasePrice, landPct, monthlyRent, annualTaxes, annualInsurance, hoa, rate, ltv, holdYears, rentGrowth, magi, filingStatus, isRep, stateRate]);

  return (
    <PageShell
      title="After-Tax IRR (Tax Engine)"
      subtitle="Calls engine.computeAfterTaxIRR. Depreciation shield, passive loss rules, recapture, capital gains — applied to your DSCR returns with proper amortization for remaining balance."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <div style={{ ...card }}>
          <div style={sectionTitle}>Property and Loan</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "Land Allocation", value: landPct, set: setLandPct, step: 1, suffix: "%" },
            { label: "Monthly Rent", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Annual Taxes", value: annualTaxes, set: setAnnualTaxes, step: 250, prefix: "$" },
            { label: "Annual Insurance", value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$" },
            { label: "Monthly HOA", value: hoa, set: setHoa, step: 25, prefix: "$" },
            { label: "Rate", value: rate, set: setRate, step: 0.125, suffix: "%" },
            { label: "LTV", value: ltv, set: setLtv, step: 1, suffix: "%" },
            { label: "Hold Years", value: holdYears, set: setHoldYears, step: 1 },
            { label: "Rent Growth", value: rentGrowth, set: setRentGrowth, step: 0.5, suffix: "%" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
          <div style={{ ...sectionTitle, marginTop: "20px" }}>Tax Profile</div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>Filing Status</label>
            <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as FilingStatus)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }}>
              <option value="SINGLE">Single</option>
              <option value="MFJ">Married Filing Jointly</option>
              <option value="MFS">Married Filing Separately</option>
              <option value="HOH">Head of Household</option>
            </select>
          </div>
          {[
            { label: "MAGI (other income)", value: magi, set: setMagi, step: 5000, prefix: "$" },
            { label: "State Income Tax Rate", value: stateRate, set: setStateRate, step: 0.5, suffix: "%" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", color: CREAM, fontSize: "13px", marginTop: "12px", cursor: "pointer" }}>
            <input type="checkbox" checked={isRep} onChange={(e) => setIsRep(e.target.checked)} style={{ accentColor: MINT }} />
            Real Estate Professional (750 hours + 50% test)
          </label>
        </div>

        <div>
          {!result ? (
            <div style={{ ...card, textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result.</p>
            </div>
          ) : (
            <>
              <div style={{ ...card, textAlign: "center", borderColor: result.afterTaxIRR >= 10 ? MINT : result.afterTaxIRR >= 6 ? YELLOW : "#ff6b6b" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>After-Tax IRR</div>
                <div style={{ fontSize: "60px", fontWeight: 800, color: result.afterTaxIRR >= 10 ? MINT : result.afterTaxIRR >= 6 ? YELLOW : "#ff6b6b", lineHeight: 1 }}>{result.afterTaxIRR.toFixed(1)}%</div>
                <div style={{ fontSize: "13px", color: "#aaa", marginTop: "12px" }}>
                  Pre-tax: {result.preTaxIRR.toFixed(1)}% · Tax drag: {result.irrImpactOfTaxes.toFixed(1)} pts
                </div>
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Year-by-Year After-Tax NCF (engine output)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginTop: "8px" }}>
                  {result.yearByYear.map((row) => (
                    <div key={row.year} style={{ background: "rgba(0,55,56,0.04)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                      <div style={{ fontSize: "10px", color: "#888", letterSpacing: "0.1em" }}>YEAR {row.year}</div>
                      <div style={{ fontSize: "16px", color: row.afterTaxNCF >= 0 ? CREAM : "#ff6b6b", fontWeight: 700, marginTop: "4px" }}>{fmt$(row.afterTaxNCF)}</div>
                      <div style={{ fontSize: "9px", color: "#888", marginTop: "2px" }}>dep: {fmt$(row.depreciationDeduction)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Tax Stack Summary (engine output)</div>
                <Row label="Total depreciation shield (over hold)" value={fmt$(result.totalDepreciationShield)} highlight={MINT} />
                <Row label="Total tax on exit" value={fmt$(result.totalTaxOnExit)} highlight="#ff6b6b" />
                <Row label="Effective recapture rate" value={`${(result.effectiveRecaptureRate * 100).toFixed(1)}%`} />
                <Row label="Effective LTCG rate" value={`${(result.effectiveLtcgRate * 100).toFixed(1)}%`} />
                <Row label="NIIT applies" value={result.niitApplies ? "Yes" : "No"} />
              </div>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(216,217,88,0.08)", borderRadius: "10px", border: "1px solid rgba(216,217,88,0.2)", fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
                <strong style={{ color: YELLOW }}>Engine:</strong> src/engine/taxEngine.ts → computeAfterTaxIRR with proper amortization (v11.1 FIX). Uses IRC §469 passive loss rules, §1250 recapture (25%), §1(h) LTCG (15%), §1411 NIIT (3.8%). Result: {result.disclaimer}
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