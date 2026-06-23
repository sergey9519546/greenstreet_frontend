// @ts-nocheck
import React, { useState, useMemo } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";
import { runMonteCarloRatePath, DEFAULT_VASICEK_PARAMS, CURRENT_MARKET_SNAPSHOT } from "../engine/monteCarloRatePath";
import { DEFAULT_ARM_PROGRAMS } from "../engine/armResetEngine";

const MINT = "#006565";
const CREAM = "#003738";
const YELLOW = "#8a6d00";

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function MonteCarloPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [loanAmount, setLoanAmount] = useState(340000);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [pitiaNonDebt, setPitiaNonDebt] = useState(750);
  const [initialRate, setInitialRate] = useState(7.0);
  const [initialSofr, setInitialSofr] = useState(CURRENT_MARKET_SNAPSHOT.sofr30Day);
  const [longRunSofr, setLongRunSofr] = useState(DEFAULT_VASICEK_PARAMS.longRunMeanSOFR);
  const [simulations, setSimulations] = useState(500);
  const [horizonYears, setHorizonYears] = useState(10);
  const [seed, setSeed] = useState(42);

  const result = useMemo(() => {
    try {
      const qualifyingRent = monthlyRent;
      const fixedExpenses = pitiaNonDebt;
      const armTerms = DEFAULT_ARM_PROGRAMS["5_6_ARM"];
      const run = runMonteCarloRatePath(
        armTerms,
        loanAmount,
        360,
        qualifyingRent,
        fixedExpenses,
        simulations,
        horizonYears * 12,
        seed,
        { ...DEFAULT_VASICEK_PARAMS, longRunMeanSOFR: longRunSofr, initialSOFR: initialSofr },
        CURRENT_MARKET_SNAPSHOT,
      );
      return run;
    } catch (e) {
      return null;
    }
  }, [loanAmount, monthlyRent, pitiaNonDebt, initialRate, initialSofr, longRunSofr, simulations, horizonYears, seed]);

  return (
    <PageShell
      title="Monte Carlo Rate Paths"
      subtitle={`Runs engine.runMonteCarloRatePath (Vasicek mean-reverting SOFR). ${simulations} paths over ${horizonYears} years. Probability your DSCR breaks below 1.0 at ARM reset.`}
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <div style={{ ...card }}>
          <div style={sectionTitle}>Inputs</div>
          {[
            { label: "Loan Amount", value: loanAmount, set: setLoanAmount, step: 5000, prefix: "$" },
            { label: "Monthly Rent", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Taxes + Ins + HOA / mo", value: pitiaNonDebt, set: setPitiaNonDebt, step: 25, prefix: "$" },
            { label: "Initial Note Rate", value: initialRate, set: setInitialRate, step: 0.125, suffix: "%" },
            { label: "Initial SOFR", value: initialSofr, set: setInitialSofr, step: 0.05, suffix: "%" },
            { label: "Long-run SOFR mean", value: longRunSofr, set: setLongRunSofr, step: 0.05, suffix: "%" },
            { label: "Simulations", value: simulations, set: setSimulations, step: 100 },
            { label: "Horizon (years)", value: horizonYears, set: setHorizonYears, step: 1 },
            { label: "Random Seed", value: seed, set: setSeed, step: 1 },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
        </div>

        <div>
          {!result ? (
            <div style={{ ...card, textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ ...card, textAlign: "center", borderColor: result.probabilityDSCRBelow1_0 > 25 ? "#ff6b6b" : result.probabilityDSCRBelow1_0 > 10 ? YELLOW : MINT }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "8px" }}>P(DSCR &lt; 1.0)</div>
                  <div style={{ fontSize: "44px", fontWeight: 800, color: result.probabilityDSCRBelow1_0 > 25 ? "#ff6b6b" : result.probabilityDSCRBelow1_0 > 10 ? YELLOW : MINT, lineHeight: 1 }}>{result.probabilityDSCRBelow1_0.toFixed(1)}%</div>
                  <div style={{ fontSize: "11px", color: "#4a5d5d", marginTop: "6px" }}>Deal-break probability</div>
                </div>
                <div style={{ ...card, textAlign: "center", borderColor: result.probabilityDSCRBelow1_25 > 60 ? "#ff6b6b" : result.probabilityDSCRBelow1_25 > 30 ? YELLOW : MINT }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "8px" }}>P(DSCR &lt; 1.25)</div>
                  <div style={{ fontSize: "44px", fontWeight: 800, color: result.probabilityDSCRBelow1_25 > 60 ? "#ff6b6b" : result.probabilityDSCRBelow1_25 > 30 ? YELLOW : MINT, lineHeight: 1 }}>{result.probabilityDSCRBelow1_25.toFixed(1)}%</div>
                  <div style={{ fontSize: "11px", color: "#4a5d5d", marginTop: "6px" }}>Comfortable zone miss</div>
                </div>
              </div>

              <div style={{ ...card }}>
                <div style={sectionTitle}>Final Stabilized Rate Distribution</div>
                <Row label="10th percentile (low)" value={`${result.finalRateStats.p10.toFixed(2)}%`} highlight={MINT} />
                <Row label="Median (50th)" value={`${result.finalRateStats.median.toFixed(2)}%`} />
                <Row label="90th percentile (high)" value={`${result.finalRateStats.p90.toFixed(2)}%`} highlight="#ff6b6b" />
                <Row label="Std deviation" value={`${result.finalRateStats.stddev.toFixed(2)}%`} />
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>Final DSCR Distribution</div>
                <Row label="Worst 10% (P10)" value={`${result.dscrStats.p10.toFixed(2)}x`} highlight={result.dscrStats.p10 < 1.0 ? "#ff6b6b" : YELLOW} />
                <Row label="Median" value={`${result.dscrStats.median.toFixed(2)}x`} />
                <Row label="Best 10% (P90)" value={`${result.dscrStats.p90.toFixed(2)}x`} highlight={MINT} />
                <Row label="Probability rate hits lifetime cap" value={`${result.probabilityRateAboveLifetimeCap.toFixed(1)}%`} />
              </div>

              <div style={{ ...card, marginTop: "20px" }}>
                <div style={sectionTitle}>SOFR Path at Horizon ({horizonYears}yr)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "8px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b", textTransform: "uppercase" }}>Year 1 mean</div>
                    <div style={{ fontSize: "18px", color: CREAM, fontWeight: 700, fontFamily: "monospace" }}>{result.sofrAtHorizon.year1.mean.toFixed(2)}%</div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b" }}>P10-P90: {result.sofrAtHorizon.year1.p10.toFixed(2)}% – {result.sofrAtHorizon.year1.p90.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b", textTransform: "uppercase" }}>Year 5 mean</div>
                    <div style={{ fontSize: "18px", color: CREAM, fontWeight: 700, fontFamily: "monospace" }}>{result.sofrAtHorizon.year5.mean.toFixed(2)}%</div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b" }}>P10-P90: {result.sofrAtHorizon.year5.p10.toFixed(2)}% – {result.sofrAtHorizon.year5.p90.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b", textTransform: "uppercase" }}>Year 10 mean</div>
                    <div style={{ fontSize: "18px", color: CREAM, fontWeight: 700, fontFamily: "monospace" }}>{result.sofrAtHorizon.year10.mean.toFixed(2)}%</div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b" }}>P10-P90: {result.sofrAtHorizon.year10.p10.toFixed(2)}% – {result.sofrAtHorizon.year10.p90.toFixed(2)}%</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(0,101,101,0.08)", borderRadius: "10px", border: "1px solid rgba(0,101,101,0.22)", fontSize: "12px", color: "#4a5d5d", lineHeight: 1.6 }}>
                <strong style={{ color: MINT }}>Engine:</strong> Vasicek mean-reverting process. {simulations} paths × {horizonYears * 12} months. Process parameters: θ={result.modelParameters.longRunMeanSOFR}%, κ={result.modelParameters.meanReversionSpeed}, σ={result.modelParameters.volatility}%, r₀={result.modelParameters.initialSOFR}%.
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