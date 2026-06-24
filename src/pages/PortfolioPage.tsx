import React, { useState, useMemo } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
  AnimatedNumber,
  PremiumInput,
  PremiumSlider,
} from "./PageShell";
import { analyzePortfolio } from "../engine/portfolio";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import type { PropertyInputs, PortfolioProperty } from "../engine/types";

const MINT = swatch.emerald;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

// Raw seed shape the page edits in the UI. Enriched into PortfolioProperty
// (adds name/address/monthlyPITIA/dscr/track2DSCR/isBlanket) in processedProperties.
type RawProperty = {
  id: string; purchasePrice: number; monthlyRent: number; state: string;
  loanBalance: number; rate: number; lender: string; propertyType: string; yearAcquired: number;
};

const SAMPLE_PROPERTIES: RawProperty[] = [
  { id: "P1", purchasePrice: 425000, monthlyRent: 3000, state: "TX", loanBalance: 318750, rate: 7.0, lender: "Prior loan", propertyType: "SFR" as const, yearAcquired: 2023 },
  { id: "P2", purchasePrice: 380000, monthlyRent: 2900, state: "GA", loanBalance: 304000, rate: 7.25, lender: "Prior loan", propertyType: "SFR" as const, yearAcquired: 2022 },
  { id: "P3", purchasePrice: 525000, monthlyRent: 4100, state: "FL", loanBalance: 393750, rate: 6.875, lender: "Prior loan", propertyType: "SFR" as const, yearAcquired: 2024 },
];

export default function PortfolioPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [properties, setProperties] = useState<RawProperty[]>(SAMPLE_PROPERTIES);
  const [newPurchasePrice, setNewPurchasePrice] = useState(450000);
  const [newMonthlyRent, setNewMonthlyRent] = useState(3200);
  const [newState, setNewState] = useState("TX");
  const [newLtv, setNewLtv] = useState(75);

  const processedProperties = useMemo(() => {
    return properties.map(p => {
      const r = (p.rate || 7.0) / 100 / 12;
      const monthlyPI = r > 0 ? (p.loanBalance * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1) : 0;
      const monthlyTI = (p.purchasePrice * 0.015) / 12;
      const monthlyPITIA = monthlyPI + monthlyTI;
      const dscr = monthlyPITIA > 0 ? p.monthlyRent / monthlyPITIA : 1.20;
      const track2NOI = p.monthlyRent * 0.79; // 1 - 0.08 - 0.08 - 0.05
      const track2DSCR = monthlyPITIA > 0 ? track2NOI / monthlyPITIA : 1.0;
      return {
        ...p,
        name: p.id,
        address: "",
        monthlyPITIA,
        dscr,
        track2DSCR,
        isBlanket: false,
      };
    });
  }, [properties]);

  const result = useMemo(() => {
    try {
      const newDealLtv = newLtv;
      const newDealBalance = newPurchasePrice * (1 - newDealLtv / 100);
      const r = 7.0 / 100 / 12;
      const newPI = (newDealBalance * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
      const newTI = (newPurchasePrice * 0.015) / 12;
      const newPITIA = newPI + newTI;
      const newDscr = newPITIA > 0 ? newMonthlyRent / newPITIA : 1.20;
      const newTrack2NOI = newMonthlyRent * 0.79;
      const newTrack2Dscr = newPITIA > 0 ? newTrack2NOI / newPITIA : 1.0;

      const newDealProp = {
        id: "NEW",
        name: "Subject Property",
        address: "",
        purchasePrice: newPurchasePrice,
        monthlyRent: newMonthlyRent,
        state: newState,
        loanBalance: newDealBalance,
        rate: 7.0,
        lender: "PROSPECTIVE",
        propertyType: "SFR",
        yearAcquired: 2026,
        monthlyPITIA: newPITIA,
        dscr: newDscr,
        track2DSCR: newTrack2Dscr,
        isBlanket: false,
      };
      
      const borrower = buildEngineInputs({ purchasePrice: newPurchasePrice, monthlyRent: newMonthlyRent, state: newState, ficoScore: 720 }).borrower;
      return analyzePortfolio([...processedProperties, newDealProp], null, borrower, 50000);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [processedProperties, newPurchasePrice, newMonthlyRent, newState, newLtv]);

  const lenderConcentrationList = useMemo(() => {
    if (!result) return [];
    const counts = new Map<string, number>();
    for (const p of result.properties) {
      counts.set(p.lender, (counts.get(p.lender) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([lender, count]) => ({
      lender,
      count,
      percentage: (count / result.properties.length) * 100,
    })).sort((a, b) => b.percentage - a.percentage);
  }, [result]);

  const geographicConcentrationList = useMemo(() => {
    if (!result) return [];
    const counts = new Map<string, number>();
    let totalWithState = 0;
    for (const p of result.properties) {
      if (p.state) {
        counts.set(p.state, (counts.get(p.state) ?? 0) + 1);
        totalWithState++;
      }
    }
    return Array.from(counts.entries()).map(([state, count]) => ({
      state,
      count,
      percentage: totalWithState > 0 ? (count / totalWithState) * 100 : 0,
    })).sort((a, b) => b.percentage - a.percentage);
  }, [result]);

  const dscrBuckets = useMemo(() => {
    if (!result) return { dealBreak: 0, fragile: 0, marginal: 0, comfortable: 0, safe: 0 };
    let dealBreak = 0;
    let fragile = 0;
    let marginal = 0;
    let comfortable = 0;
    let safe = 0;
    for (const p of result.properties) {
      const d = p.dscr;
      if (d < 0.85) dealBreak++;
      else if (d < 1.00) fragile++;
      else if (d < 1.25) marginal++;
      else if (d < 1.50) comfortable++;
      else safe++;
    }
    return { dealBreak, fragile, marginal, comfortable, safe };
  }, [result]);

  const handleAddProperty = () => {
    const id = `P${properties.length + 1}`;
    setProperties([...properties, { id, purchasePrice: 450000, monthlyRent: 3200, state: "TX", loanBalance: 337500, rate: 7.0, lender: "Prior loan", propertyType: "SFR", yearAcquired: 2024 }]);
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
          <AnimatedCard hoverScale={false}>
            <div style={sectionTitle}>Existing Properties ({properties.length})</div>
            {properties.map((p, i) => (
              <div key={p.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: CREAM, fontSize: "14px", fontWeight: 700 }}>{p.id} • {p.state}</div>
                  <div style={{ color: "rgba(0, 55, 56, 0.6)", fontSize: "11px" }}>${(p.purchasePrice / 1000).toFixed(0)}k • ${p.monthlyRent}/mo • {p.rate.toFixed(2)}%</div>
                  <div style={{ color: MINT, fontSize: "11px", marginTop: "2px" }}>{p.lender}</div>
                </div>
                <AnimatedButton
                  onClick={() => handleRemoveProperty(p.id)}
                  variant="secondary"
                  showArrow={false}
                  style={{ padding: "4px 12px", fontSize: "11px", borderColor: "rgba(255,107,107,0.3)", color: "#ff6b6b" }}
                >
                  Remove
                </AnimatedButton>
              </div>
            ))}
            <AnimatedButton
              onClick={handleAddProperty}
              variant="primary"
              style={{ marginTop: "16px", width: "100%" }}
            >
              Add Sample Property
            </AnimatedButton>
          </AnimatedCard>

          <AnimatedCard hoverScale={false} style={{ marginTop: "20px" }}>
            <div style={sectionTitle}>New Deal to Underwrite</div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>State</label>
              <div style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid rgba(0, 55, 56, 0.18)",
                borderRadius: "8px",
                height: "46px",
                padding: "0 12px",
              }}>
                <select
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: CREAM,
                    fontSize: "15px",
                    outline: "none",
                    fontFamily: "Outfit, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            
            <PremiumInput
              label="Purchase Price"
              type="number"
              value={newPurchasePrice}
              onChange={(e) => setNewPurchasePrice(+e.target.value)}
              prefixSymbol="$"
            />
            
            <PremiumInput
              label="Monthly Rent"
              type="number"
              value={newMonthlyRent}
              onChange={(e) => setNewMonthlyRent(+e.target.value)}
              prefixSymbol="$"
            />

            <PremiumSlider
              label="LTV"
              min={50}
              max={90}
              step={1}
              value={newLtv}
              onChange={setNewLtv}
              formatValue={(val) => val + "%"}
            />
          </AnimatedCard>
        </div>

        <div>
          {!result ? (
            <AnimatedCard hoverScale={false} style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result.</p>
            </AnimatedCard>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Total Properties", value: result.properties.length, color: CREAM },
                  { label: "Global DSCR", value: result.globalDSCR, format: (v) => v.toFixed(2) + "x", color: result.globalDSCR >= 1.25 ? MINT : result.globalDSCR >= 1.0 ? YELLOW : "#ff6b6b" },
                  { label: "Total Loan Balance", value: result.properties.reduce((sum, p) => sum + p.loanBalance, 0), format: (v) => `$${(v / 1000).toFixed(0)}k`, color: CREAM },
                  { label: "Monthly NOI", value: result.totalNOI / 12, format: (v) => `$${(v / 1000).toFixed(1)}k`, color: CREAM },
                ].map((m) => (
                  <div key={m.label} style={{ background: "rgba(0,55,56,0.04)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "rgba(0, 55, 56, 0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: m.color, marginTop: "6px" }}>
                      <AnimatedNumber value={m.value} format={m.format ?? ((v) => Math.round(v).toString())} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "20px" }}>
                <AnimatedCard hoverScale={true}>
                  <div style={sectionTitle}>Lender Concentration</div>
                  {lenderConcentrationList.slice(0, 6).map((lc) => {
                    const color = lc.percentage > 40 ? "#ff6b6b" : lc.percentage > 25 ? YELLOW : MINT;
                    return (
                      <div key={lc.lender} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                          <span style={{ color: CREAM, fontWeight: 600 }}>{lc.lender}</span>
                          <span style={{ color, fontWeight: 700 }}>
                            <AnimatedNumber value={lc.percentage} format={(v) => v.toFixed(1) + "%"} />
                          </span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(0,55,56,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, lc.percentage)}%`, background: color, transition: "width 0.3s" }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "rgba(0, 55, 56, 0.5)", marginTop: "2px" }}>{lc.count} properties</div>
                      </div>
                    );
                  })}
                  {lenderConcentrationList.length === 0 && <p style={{ color: "rgba(0, 55, 56, 0.5)", fontSize: "13px" }}>No concentration data.</p>}
                </AnimatedCard>

                <AnimatedCard hoverScale={true}>
                  <div style={sectionTitle}>Geographic Concentration</div>
                  {geographicConcentrationList.slice(0, 6).map((gc) => {
                    const color = gc.percentage > 50 ? "#ff6b6b" : gc.percentage > 30 ? YELLOW : MINT;
                    return (
                      <div key={gc.state} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                          <span style={{ color: CREAM, fontWeight: 600 }}>{gc.state}</span>
                          <span style={{ color, fontWeight: 700 }}>
                            <AnimatedNumber value={gc.percentage} format={(v) => v.toFixed(1) + "%"} />
                          </span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(0,55,56,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, gc.percentage)}%`, background: color, transition: "width 0.3s" }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "rgba(0, 55, 56, 0.5)", marginTop: "2px" }}>{gc.count} properties</div>
                      </div>
                    );
                  })}
                  {geographicConcentrationList.length === 0 && <p style={{ color: "rgba(0, 55, 56, 0.5)", fontSize: "13px" }}>No geographic data.</p>}
                </AnimatedCard>
              </div>

              <AnimatedCard hoverScale={false} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>DSCR Distribution</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                  {[
                    { label: "DEAL_BREAK", range: "< 0.85", count: dscrBuckets.dealBreak, color: "#ff6b6b" },
                    { label: "FRAGILE", range: "0.85–1.00", count: dscrBuckets.fragile, color: "#ff6b6b" },
                    { label: "MARGINAL", range: "1.00–1.25", count: dscrBuckets.marginal, color: YELLOW },
                    { label: "COMFORTABLE", range: "1.25–1.50", count: dscrBuckets.comfortable, color: MINT },
                    { label: "SAFE", range: "≥ 1.50", count: dscrBuckets.safe, color: MINT },
                  ].map((b) => (
                    <div key={b.label} style={{ background: `${b.color}11`, borderRadius: "8px", padding: "12px", textAlign: "center", border: `1px solid ${b.color}44` }}>
                      <div style={{ fontSize: "10px", color: "rgba(0, 55, 56, 0.5)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{b.label}</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: b.color, marginTop: "4px" }}>
                        <AnimatedNumber value={b.count} format={(v) => Math.round(v).toString()} />
                      </div>
                      <div style={{ fontSize: "10px", color: "rgba(0, 55, 56, 0.5)", marginTop: "2px" }}>{b.range}</div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              <AnimatedCard hoverScale={false} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Refi Opportunities</div>
                {result.refiOpportunities.length === 0 ? (
                  <p style={{ color: "rgba(0, 55, 56, 0.5)", fontSize: "13px", padding: "8px 0" }}>No refinance opportunities identified (no properties meet seasoning + LTV criteria).</p>
                ) : (
                  result.refiOpportunities.map((r) => {
                    const prop = properties.find(p => p.id === r.propertyId);
                    const propState = prop?.state ?? "";
                    const action = r.seasoningMonthsRemaining <= 0 ? "REFINANCE_NOW" : "MONITOR";
                    const detail = `Save $${r.monthlySavings.toFixed(0)}/mo refinancing from ${r.currentRate.toFixed(2)}% to projected ${r.projectedRate.toFixed(2)}%${r.seasoningMonthsRemaining > 0 ? ` — ${r.seasoningMonthsRemaining} mo seasoning left` : ""}`;
                    return (
                      <div key={r.propertyId} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: CREAM, fontWeight: 700 }}>{r.propertyId} • {propState}</span>
                          <span style={{ color: action === "REFINANCE_NOW" ? MINT : action === "MONITOR" ? YELLOW : MINT, fontWeight: 700, fontSize: "12px" }}>{action}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(0, 55, 56, 0.5)", marginTop: "4px" }}>{detail}</div>
                      </div>
                    );
                  })
                )}
              </AnimatedCard>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(77,189,151,0.08)", borderRadius: "10px", border: "1px solid rgba(77,189,151,0.2)", fontSize: "12px", color: "rgba(0, 55, 56, 0.6)", lineHeight: 1.6 }}>
                <strong style={{ color: MINT }}>Engine:</strong> src/engine/portfolio.ts → analyzePortfolio. Total portfolio DSCR is weighted by loan balance. Lender concentration &gt;40% = concentration risk (red). Geographic concentration &gt;50% = regional risk (red). Refi opportunities require 6+ months seasoning and current LTV &lt;75%.
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}