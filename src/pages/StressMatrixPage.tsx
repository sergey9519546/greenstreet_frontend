// @ts-nocheck
import React, { useState, useMemo } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedNumber,
  PremiumInput
} from "./PageShell";
import { computeStressMatrix, riskZoneColor, riskZoneLabel, classifyRiskZone } from "../engine/stressMatrix";
import { calculatePI, calculatePITIA } from "../engine/engine";
import type { PropertyInputs, LoanStructure } from "../engine/types";

const MINT = swatch.emerald;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

export default function StressMatrixPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [ltv, setLtv] = useState(75);
  const [baseRate, setBaseRate] = useState(7.0);
  const [monthlyRent, setMonthlyRent] = useState(3000);
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
      const loan: LoanStructure = {
        ltv,
        term: "30_YR",
        ioPeriod: "NONE",
        armType: "FIXED",
        prepayPreference: "NONE",
        purpose: "PURCHASE",
        expectedHoldYears: 5,
        points: 0,
        lenderFees: 0,
        brokerFees: 0,
        rateLockCost: 0,
      };
      const matrix = computeStressMatrix(property, loan, "LTR", baseRate, monthlyRent);
      return matrix;
    } catch (e) {
      return null;
    }
  }, [purchasePrice, ltv, baseRate, monthlyRent, annualTaxes, annualInsurance, hoa]);

  return (
    <PageShell
      title="Stress Matrix"
      subtitle="Calls engine.computeStressMatrix. 2D rate × rent shock grid (12×10 cells), 5-zone risk classification, and break-even curve per rent offset."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px", alignItems: "start" }}>
        <AnimatedCard hoverScale={false}>
          <div style={sectionTitle}>Base Deal</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "Down Payment", value: 100 - ltv, set: (v: number) => setLtv(100 - v), step: 1, suffix: "%" },
            { label: "Base Rate", value: baseRate, set: setBaseRate, step: 0.125, suffix: "%" },
            { label: "Base Rent", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
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
          <div style={{ ...sectionTitle, marginTop: "20px" }}>Zone Distribution ({result?.totalCells || 0} cells)</div>
          <Row label="SAFE / COMFORTABLE" value={<AnimatedNumber value={result?.safeZonePct ?? 0} format={(v) => `${v.toFixed(0)}%`} />} highlight={MINT} />
          <Row label="FRAGILE / DEAL_BREAK" value={<AnimatedNumber value={result?.fragileZonePct ?? 0} format={(v) => `${v.toFixed(0)}%`} />} highlight="#ff6b6b" />
          {result && (
            <p style={{ marginTop: "12px", fontSize: "12px", color: "#aaa", lineHeight: 1.5 }}>{result.summary}</p>
          )}
        </AnimatedCard>

        <div>
          {!result ? (
            <AnimatedCard hoverScale={false} style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result.</p>
            </AnimatedCard>
          ) : (
            <>
              <AnimatedCard hoverScale={true}>
                <div style={sectionTitle}>Rate × Rent Shock Heatmap (engine.computeStressMatrix)</div>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "12px" }}>Rows: rate offsets ({result.rateAxis.length} bps steps from −150 to +200). Columns: rent offsets ({result.rentAxis.length} pct steps from −25 to +20). Numbers are Track 1 DSCR.</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "6px", color: "#888", textAlign: "left", fontWeight: 600 }}>Rate ↓ / Rent →</th>
                        {result.rentAxis.map((r) => (
                          <th key={r} style={{ padding: "6px", color: "#888", textAlign: "center", fontWeight: 600 }}>{r >= 0 ? "+" : ""}{r}%</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.cells.map((row, ri) => {
                        const ratePct = result.rateAxis[ri];
                        return (
                          <tr key={ri}>
                            <td style={{ padding: "6px", color: ratePct === result.baseRate ? CREAM : "#888", fontWeight: ratePct === result.baseRate ? 700 : 400, textAlign: "left" }}>
                              {ratePct >= result.baseRate ? "+" : ""}{(ratePct - result.baseRate).toFixed(2)}%
                            </td>
                            {row.map((cell, ci) => {
                              const color = riskZoneColor(cell.riskZone).includes("emerald-600") ? MINT : riskZoneColor(cell.riskZone).includes("yellow-500") || riskZoneColor(cell.riskZone).includes("emerald-400") ? YELLOW : "#ff6b6b";
                              const isBase = Math.abs(ratePct - result.baseRate) < 0.001 && Math.abs(cell.rentOffsetPct) < 0.001;
                              return (
                                <td key={ci} style={{
                                  padding: "8px 4px",
                                  textAlign: "center",
                                  background: `${color}22`,
                                  color: color,
                                  fontWeight: 700,
                                  border: isBase ? `2px solid ${CREAM}` : "1px solid rgba(0,55,56,0.1)",
                                }}>
                                  {cell.track1DSCR.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </AnimatedCard>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginTop: "16px" }}>
                {(["SAFE", "COMFORTABLE", "MARGINAL", "FRAGILE", "DEAL_BREAK"] as const).map((zone) => (
                  <div key={zone} style={{ background: `${riskZoneColor(zone).includes("emerald-600") ? MINT : riskZoneColor(zone).includes("yellow-500") || riskZoneColor(zone).includes("emerald-400") ? YELLOW : riskZoneColor(zone).includes("red-500") ? "#ff6b6b" : "#4a1515"}22`, border: `1px solid ${riskZoneColor(zone).includes("emerald-600") ? MINT : riskZoneColor(zone).includes("yellow-500") || riskZoneColor(zone).includes("emerald-400") ? YELLOW : riskZoneColor(zone).includes("red-500") ? "#ff6b6b" : "#4a1515"}`, borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#888", fontWeight: 700 }}>{zone}</div>
                    <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>{riskZoneLabel(zone)}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(216,217,88,0.08)", borderRadius: "10px", border: "1px solid rgba(216,217,88,0.2)", fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
                <strong style={{ color: YELLOW }}>Engine:</strong> src/engine/stressMatrix.ts → computeStressMatrix. {result.totalCells} cells. Base-rate row highlighted; base-rate/base-rent cell double-bordered. Risk zones: SAFE ≥1.50, COMFORTABLE ≥1.25, MARGINAL ≥1.00, FRAGILE ≥0.85, DEAL_BREAK &lt;0.85.
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
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ color: highlight || CREAM, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}