import React, { useState, useMemo } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedNumber,
  PremiumInput
} from "./PageShell";
import { buildEngineInputs, DealRequest } from "../engine/inputs";
import { analyzeRefi } from "../engine/refiTracker";
import type { PropertyInputs, BorrowerProfile } from "../engine/types";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

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
        <AnimatedCard hoverScale={false}>
          <div style={sectionTitle}>Current Loan</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "Current Loan Balance", value: currentBalance, set: setCurrentBalance, step: 1000, prefix: "$" },
            { label: "Current Rate", value: currentRate, set: setCurrentRate, step: 0.125, suffix: "%" },
            { label: "Current Monthly P&I", value: currentPayment, set: setCurrentPayment, step: 25, prefix: "$" },
            { label: "Months Owned", value: monthsOwned, set: setMonthsOwned, step: 1 },
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
          <div style={{ ...sectionTitle, marginTop: "20px" }}>Property and Refi Assumptions</div>
          {[
            { label: "Monthly Rent (qualifying)", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Annual Taxes", value: annualTaxes, set: setAnnualTaxes, step: 500, prefix: "$" },
            { label: "Annual Insurance", value: annualInsurance, set: setAnnualInsurance, step: 250, prefix: "$" },
            { label: "Monthly HOA", value: hoa, set: setHoa, step: 25, prefix: "$" },
            { label: "Projected Rate at Refi", value: projectedRate, set: setProjectedRate, step: 0.125, suffix: "%" },
            { label: "Projected Appreciation", value: projectedAppreciation, set: setProjectedAppreciation, step: 0.5, suffix: "%" },
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
              <p style={{ color: "#ff6b6b", fontSize: "14px" }}>Engine returned no result for these inputs. Adjust loan amount or rent and try again.</p>
            </AnimatedCard>
          ) : (
            <>
              <AnimatedCard hoverScale={true} style={{ textAlign: "center", borderColor: verdictColor }}>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>Refi Readiness Score</div>
                <div style={{ fontSize: "72px", fontWeight: 800, color: verdictColor, lineHeight: 1 }}>
                  <AnimatedNumber value={result.totalScore} format={(v) => String(Math.round(v))} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: verdictColor, margin: "8px 0 16px" }}>{verdictLabel}</div>
                <div style={{ fontSize: "14px", color: "#4a5d5d" }}>
                  {result.refiType === "RATE_TERM" && "Rate-and-term refi. Loan balance roughly flat."}
                  {result.refiType === "CASH_OUT" && `Cash-out capacity: ${fmt$(result.cashOutMaxAmount)} at 70% LTV.`}
                  {result.refiType === "NO_REFI" && "No savings, no equity. Wait for better conditions."}
                </div>
              </AnimatedCard>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Refi Math (engine.analyzeRefi)</div>
                <Row label="Current DSCR" value={<AnimatedNumber value={result.currentDSCR} format={(v) => `${v.toFixed(2)}x`} />} />
                <Row label="Projected DSCR after refi" value={<AnimatedNumber value={result.refiDSCR} format={(v) => `${v.toFixed(2)}x`} />} highlight={result.refiDSCR >= 1.0 ? MINT : "#ff6b6b"} />
                <Row label="Monthly savings" value={<AnimatedNumber value={result.monthlySavings} format={(v) => `${v >= 0 ? "+" : ""}${fmt$(v)}`} />} highlight={result.monthlySavings >= 0 ? MINT : "#ff6b6b"} />
                <Row label="Break-even (months)" value={result.breakEvenMonths > 120 ? "100+ (don't refi)" : <AnimatedNumber value={result.breakEvenMonths} format={(v) => String(Math.round(v))} />} highlight={result.breakEvenMonths < 36 ? MINT : YELLOW} />
                <Row label="Cash-out capacity (70% LTV)" value={<AnimatedNumber value={result.cashOutMaxAmount} format={(v) => fmt$(v)} />} />
                <Row label="Seasoning met (6 mo required)" value={result.seasoningMet ? "Yes" : `No — ${monthsOwned}/6 months`} highlight={result.seasoningMet ? MINT : "#ff6b6b"} />
              </AnimatedCard>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Score Breakdown (engine output)</div>
                {result.factors.map((f) => {
                  const color = f.status === "PASS" ? MINT : f.status === "WARN" ? YELLOW : "#ff6b6b";
                  return (
                    <div key={f.factor} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: CREAM, fontSize: "14px", fontWeight: 600 }}>{f.factor}</span>
                        <span style={{ color, fontWeight: 700, fontSize: "14px" }}>
                          <AnimatedNumber value={f.score} format={(v) => String(Math.round(v))} /> / {f.maxScore}
                        </span>
                      </div>
                      <p style={{ color: "#5a6b6b", fontSize: "12px", marginTop: "4px", lineHeight: 1.5 }}>{f.detail}</p>
                    </div>
                  );
                })}
              </AnimatedCard>

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

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", fontSize: "14px" }}>
      <span style={{ color: "#5a6b6b" }}>{label}</span>
      <span style={{ color: highlight || CREAM, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}