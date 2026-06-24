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
import { evaluateSTRUnderwriting, checkSTRLegality, computeSTRMonthlySeasonality, US_NATIONAL_STR_SEASONALITY } from "../engine/strUnderwriting";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";
import type { PropertyInputs } from "../engine/types";

const MINT = swatch.emerald;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function STRUnderwritingPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [state, setState] = useState("TX");
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [ltv, setLtv] = useState(75);
  const [rate, setRate] = useState(7.0);
  const [strRent, setStrRent] = useState(4500);
  const [ltvRent, setLtvRent] = useState(3000);
  const [documentedRent, setDocumentedRent] = useState(2800);
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

  const result = useMemo(() => {
    try {
      const property: PropertyInputs = {
        purchasePrice,
        leaseRent: ltvRent,
        marketRent: ltvRent,
        strProjectedRent: strRent,
        strDocumentedRent: documentedRent,
        hoa,
        annualTaxes,
        annualInsurance,
        floodInsurance: 0,
        propertyType: "SFR",
        state,
        unitCount: 1,
        sqft: 1500,
        yearBuilt: 2000,
        isCondotel: false,
        isNonWarrantable: false,
        isRural: false,
        isDecliningMarket: false,
        hoaSTRPolicy: "UNKNOWN",
      };
      const loanAmount = purchasePrice * (1 - ltv / 100);
      const underwriting = evaluateSTRUnderwriting(property, loanAmount, rate, 30, 0, annualTaxes, annualInsurance, hoa, 0);
      const legality = checkSTRLegality(state, "SFR", false, "UNKNOWN");
      const seasonality = computeSTRMonthlySeasonality(US_NATIONAL_STR_SEASONALITY, strRent);
      return { underwriting, legality, seasonality, loanAmount };
    } catch (e) {
      return null;
    }
  }, [state, purchasePrice, ltv, rate, strRent, ltvRent, documentedRent, annualTaxes, annualInsurance, hoa]);

  return (
    <PageShell
      title="STR Underwriting"
      subtitle="Calls engine.evaluateSTRUnderwriting. Three worlds: World 1 LTR (lease rent), World 2 Projected STR, World 3 Documented STR. Returns the qualifying rent the lender will use, the best world, and the legality gate."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px", alignItems: "start" }}>
        <AnimatedCard hoverScale={false}>
          <div style={sectionTitle}>Property & Rent Inputs</div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>State</label>
            <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: "100%", background: "rgba(0,55,56,0.05)", border: "1px solid rgba(0,55,56,0.4)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }}>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "LTV", value: ltv, set: setLtv, step: 1, suffix: "%" },
            { label: "Note Rate", value: rate, set: setRate, step: 0.125, suffix: "%" },
            { label: "LTR Lease Rent", value: ltvRent, set: setLtvRent, step: 100, prefix: "$" },
            { label: "STR Projected Rent", value: strRent, set: setStrRent, step: 100, prefix: "$" },
            { label: "STR Documented Rent (12mo)", value: documentedRent, set: setDocumentedRent, step: 100, prefix: "$" },
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
              <AnimatedCard hoverScale={true} style={{ borderColor: result.legality.status === "CLEAR" ? MINT : result.legality.status === "RESTRICTED" ? YELLOW : result.legality.status === "UNCERTAIN" ? YELLOW : "#ff6b6b" }}>
                <div style={sectionTitle}>Legality Gate (engine.checkSTRLegality)</div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "36px", fontWeight: 800, color: result.legality.status === "CLEAR" ? MINT : result.legality.status === "RESTRICTED" ? YELLOW : result.legality.status === "UNCERTAIN" ? YELLOW : "#ff6b6b", flex: 1 }}>
                    {result.legality.status}
                  </div>
                  <div style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", background: result.legality.incomeEnabled ? "rgba(77,189,151,0.2)" : "rgba(255,107,107,0.2)", color: result.legality.incomeEnabled ? MINT : "#ff6b6b", border: `1px solid ${result.legality.incomeEnabled ? MINT : "#ff6b6b"}`, fontWeight: 700 }}>
                    {result.legality.incomeEnabled ? "STR INCOME USED" : "LTR ONLY"}
                  </div>
                </div>
                <p style={{ color: "#aaa", fontSize: "13px", marginTop: "12px", lineHeight: 1.6 }}>{result.legality.detail}</p>
              </AnimatedCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "20px" }}>
                {[
                  { label: "World 1: LTR", value: result.underwriting.world1_LTR.dscr, rent: result.underwriting.world1_LTR.qualifyingRent },
                  { label: "World 2: STR Projected", value: result.underwriting.world2_Projected.dscr, rent: result.underwriting.world2_Projected.qualifyingRent },
                  { label: "World 3: STR Documented", value: result.underwriting.world3_Documented.dscr, rent: result.underwriting.world3_Documented.qualifyingRent },
                ].map((w) => (
                  <AnimatedCard key={w.label} hoverScale={true} style={{ background: "rgba(0,55,56,0.04)", padding: "16px", border: w.label.includes(result.underwriting.bestWorld) ? `2px solid ${MINT}` : "1px solid rgba(0,55,56,0.1)" }}>
                    <div style={{ fontSize: "11px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{w.label}</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: w.value >= 1.25 ? MINT : w.value >= 1.0 ? YELLOW : "#ff6b6b", marginTop: "6px" }}>
                      <AnimatedNumber value={w.value} format={(v) => `${v.toFixed(2)}x`} />
                    </div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                      Qualifying Rent: <AnimatedNumber value={w.rent} format={(v) => `$${Math.round(v).toLocaleString()}`} />
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px", background: "rgba(77,189,151,0.08)", borderColor: MINT }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "8px" }}>Best World Selected by Engine</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: CREAM }}>{result.underwriting.bestWorld}</div>
                <div style={{ fontSize: "12px", color: "#aaa", marginTop: "6px" }}>
                  Haircut Applied: <strong style={{ color: CREAM }}><AnimatedNumber value={result.underwriting.haircutPercent * 100} format={(v) => `${v.toFixed(1)}%`} /></strong>
                </div>
                <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
                  Best Qualifying Rent: <strong style={{ color: CREAM }}><AnimatedNumber value={result.underwriting.bestQualifyingRent} format={(v) => `$${Math.round(v).toLocaleString()}`} />/mo</strong>
                </div>
              </AnimatedCard>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Monthly Seasonality (engine.computeSTRMonthlySeasonality)</div>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "12px" }}>National average STR monthly index (100 = annual mean). Multiply projected annual rent by these to get month-by-month revenue.</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "6px" }}>
                  {result.seasonality.map((m, i) => {
                    const height = Math.max(20, (m.factor / 130) * 100);
                    const color = m.factor >= 110 ? MINT : m.factor >= 95 ? YELLOW : "#ff6b6b";
                    return (
                      <div key={i} style={{ background: "rgba(0,55,56,0.04)", borderRadius: "6px", padding: "8px 4px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>{MONTHS[i]}</div>
                        <div style={{ height: `${height}px`, background: `${color}44`, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 700, fontSize: "11px", marginBottom: "4px" }}>{m.factor}</div>
                        <div style={{ fontSize: "11px", color: CREAM, fontWeight: 700 }}>
                          <AnimatedNumber value={m.monthlyRent} format={(v) => `$${Math.round(v).toLocaleString()}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(216,217,88,0.08)", borderRadius: "10px", border: "1px solid rgba(216,217,88,0.2)", fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
                <strong style={{ color: YELLOW }}>Engine:</strong> src/engine/strUnderwriting.ts → evaluateSTRUnderwriting + checkSTRLegality + computeSTRMonthlySeasonality. {result.legality.status} state, STR income {result.legality.incomeEnabled ? "available for qualifying" : "blocked — falls back to LTR (World 1)"}. Best world DSCR = {result.underwriting.world1_LTR.dscr >= result.underwriting.world2_Projected.dscr && result.underwriting.world1_LTR.dscr >= result.underwriting.world3_Documented.dscr ? result.underwriting.world1_LTR.dscr.toFixed(2) : result.underwriting.world2_Projected.dscr >= result.underwriting.world3_Documented.dscr ? result.underwriting.world2_Projected.dscr.toFixed(2) : result.underwriting.world3_Documented.dscr.toFixed(2)}x.
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}