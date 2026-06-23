// @ts-nocheck
import React, { useState, useMemo } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";
import { analyzePortfolio } from "../engine/portfolio";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import type { PropertyInputs, PortfolioProperty } from "../engine/types";

const MINT = "#4DBD97";
const CREAM = "#003738";
const YELLOW = "#D8D958";
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const SAMPLE_PROPERTIES = [
  { id: "P1", purchasePrice: 425000, monthlyRent: 3000, state: "TX", loanBalance: 318750, rate: 7.0, lender: "Kiavi", propertyType: "SFR" as const, yearAcquired: 2023 },
  { id: "P2", purchasePrice: 380000, monthlyRent: 2900, state: "GA", loanBalance: 304000, rate: 7.25, lender: "Lima One", propertyType: "SFR" as const, yearAcquired: 2022 },
  { id: "P3", purchasePrice: 525000, monthlyRent: 4100, state: "FL", loanBalance: 393750, rate: 6.875, lender: "NewRez", propertyType: "SFR" as const, yearAcquired: 2024 },
];

export default function PortfolioPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [properties, setProperties] = useState<PortfolioProperty[]>(SAMPLE_PROPERTIES);
  const [newPurchasePrice, setNewPurchasePrice] = useState(450000);
  const [newMonthlyRent, setNewMonthlyRent] = useState(3200);
  const [newState, setNewState] = useState("TX");
  const [newLtv, setNewLtv] = useState(75);

  const result = useMemo(() => {
    try {
      const newDeal: PortfolioProperty = {
        id: "NEW",
        purchasePrice: newPurchasePrice,
        monthlyRent: newMonthlyRent,
        state: newState,
        loanBalance: newPurchasePrice * (1 - newLtv / 100),
        rate: 7.0,
        lender: "PROSPECTIVE",
        propertyType: "SFR",
        yearAcquired: 2026,
      };
      return analyzePortfolio([...properties, newDeal]);
    } catch (e) {
      return null;
    }
  }, [properties, newPurchasePrice, newMonthlyRent, newState, newLtv]);

  const handleAddProperty = () => {
    const id = `P${properties.length + 1}`;
    setProperties([...properties, { id, purchasePrice: 450000, monthlyRent: 3200, state: "TX", loanBalance: 337500, rate: 7.0, lender: "NewRez", propertyType: "SFR", yearAcquired: 2024 }]);
  };

  const handleRemoveProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  return (
    <PageShell
      title="Portfolio Analysis"
      subtitle="Calls engine.analyzePortfolio. Aggregates global DSCR across all properties, lender concentration, geographic concentration, and refi opportunities."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px", alignItems: "start" }}>
        <div>
          <div style={{ ...card }}>
            <div style={sectionTitle}>Existing Properties ({properties.length})</div>
            {properties.map((p, i) => (
              <div key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: CREAM, fontSize: "14px", fontWeight: 700 }}>{p.id} • {p.state}</div>
                  <div style={{ color: "#888", fontSize: "11px" }}>${(p.purchasePrice / 1000).toFixed(0)}k • ${p.monthlyRent}/mo • {p.rate.toFixed(2)}%</div>
                  <div style={{ color: MINT, fontSize: "11px", marginTop: "2px" }}>{p.lender}</div>
                </div>
                <button onClick={() => handleRemoveProperty(p.id)} style={{ background: "transparent", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" }}>Remove</button>
              </div>
            ))}
            <button onClick={handleAddProperty} style={{ marginTop: "12px", width: "100%", background: `${MINT}22`, border: `1px solid ${MINT}`, color: MINT, borderRadius: "8px", padding: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>+ Add Sample Property</button>
          </div>

          <div style={{ ...card, marginTop: "20px" }}>
            <div style={sectionTitle}>New Deal to Underwrite</div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>State</label>
              <select value={newState} onChange={(e) => setNewState(e.target.value)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }}>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {[
              { label: "Purchase Price", value: newPurchasePrice, set: setNewPurchasePrice, step: 5000, prefix: "$" },
              { label: "Monthly Rent", value: newMonthlyRent, set: setNewMonthlyRent, step: 100, prefix: "$" },
              { label: "LTV", value: newLtv, set: setNewLtv, step: 1, suffix: "%" },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
                <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
              </div>
            ))}
          </div>
        </div>

        <div>
          {!result ? (
            <div style={{ ...card, textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Total Properties", value: result.totalProperties.toString(), color: CREAM },
                  { label: "Global DSCR", value: result.globalDSCR.toFixed(2) + "x", color: result.globalDSCR >= 1.25 ? MINT : result.globalDSCR >= 1.0 ? YELLOW : "#ff6b6b" },
                  { label: "Total Loan Balance", value: `$${(result.totalLoanBalance / 1000).toFixed(0)}k`, color: CREAM },
                  { label: "Monthly NOI", value: `$${(result.monthlyNOI / 1000).toFixed(1)}k`, color: CREAM },
                ].map((m) => (
                  <div key={m.label} style={{ background: "rgba(0,55,56,0.04)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: m.color, marginTop: "6px" }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "20px" }}>
                <div style={{ ...card }}>
                  <div style={sectionTitle}>Lender Concentration</div>
                  {result.lenderConcentration.slice(0, 6).map((lc) => {
                    const color = lc.percentage > 40 ? "#ff6b6b" : lc.percentage > 25 ? YELLOW : MINT;
                    return (
                      <div key={lc.lender} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                          <span style={{ color: CREAM, fontWeight: 600 }}>{lc.lender}</span>
                          <span style={{ color, fontWeight: 700 }}>{lc.percentage.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(0,55,56,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, lc.percentage)}%`, background: color, transition: "width 0.3s" }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>{lc.count} properties</div>
                      </div>
                    );
                  })}
                  {result.lenderConcentration.length === 0 && <p style={{ color: "#888", fontSize: "13px" }}>No concentration data.</p>}
                </div>

                <div style={{ ...card }}>
                  <div style={sectionTitle}>Geographic Concentration</div>
                  {result.geographicConcentration.slice(0, 6).map((gc) => {
                    const color = gc.percentage > 50 ? "#ff6b6b" : gc.percentage > 30 ? YELLOW : MINT;
                    return (
                      <div key={gc.state} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                          <span style={{ color: CREAM, fontWeight: 600 }}>{gc.state}</span>
                          <span style={{ color, fontWeight: 700 }}>{gc.percentage.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(0,55,56,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, gc.percentage)}%`, background: color, transition: "width 0.3s" }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>{gc.count} properties</div>
                      </div>
                    );
                  })}
                  {result.geographicConcentration.length === 0 && <p style={{ color: "#888", fontSize: "13px" }}>No geographic data.</p>}
                </div>
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>DSCR Distribution</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                  {[
                    { label: "DEAL_BREAK", range: "< 0.85", count: result.dscrDistribution.dealBreak, color: "#ff6b6b" },
                    { label: "FRAGILE", range: "0.85–1.00", count: result.dscrDistribution.fragile, color: "#ff6b6b" },
                    { label: "MARGINAL", range: "1.00–1.25", count: result.dscrDistribution.marginal, color: YELLOW },
                    { label: "COMFORTABLE", range: "1.25–1.50", count: result.dscrDistribution.comfortable, color: MINT },
                    { label: "SAFE", range: "≥ 1.50", count: result.dscrDistribution.safe, color: MINT },
                  ].map((b) => (
                    <div key={b.label} style={{ background: `${b.color}11`, borderRadius: "8px", padding: "12px", textAlign: "center", border: `1px solid ${b.color}44` }}>
                      <div style={{ fontSize: "10px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{b.label}</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: b.color, marginTop: "4px" }}>{b.count}</div>
                      <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>{b.range}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Refi Opportunities</div>
                {result.refiOpportunities.length === 0 ? (
                  <p style={{ color: "#888", fontSize: "13px", padding: "8px 0" }}>No refinance opportunities identified (no properties meet seasoning + LTV criteria).</p>
                ) : (
                  result.refiOpportunities.map((r) => (
                    <div key={r.propertyId} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: CREAM, fontWeight: 700 }}>{r.propertyId} • {r.state}</span>
                        <span style={{ color: r.recommendedAction === "REFINANCE_NOW" ? MINT : r.recommendedAction === "MONITOR" ? YELLOW : "#888", fontWeight: 700, fontSize: "12px" }}>{r.recommendedAction}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>{r.detail}</div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(77,189,151,0.08)", borderRadius: "10px", border: "1px solid rgba(77,189,151,0.2)", fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
                <strong style={{ color: MINT }}>Engine:</strong> src/engine/portfolio.ts → analyzePortfolio. Total portfolio DSCR is weighted by loan balance. Lender concentration &gt;40% = concentration risk (red). Geographic concentration &gt;50% = regional risk (red). Refi opportunities require 6+ months seasoning and current LTV &lt;75%.
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}