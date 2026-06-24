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
import { runMonteCarloRatePath, DEFAULT_VASICEK_PARAMS, CURRENT_MARKET_SNAPSHOT } from "../engine/monteCarloRatePath";
import { DEFAULT_ARM_PROGRAMS } from "../engine/armResetEngine";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

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
        <AnimatedCard hoverScale={false}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <AnimatedCard hoverScale={true} style={{ textAlign: "center", borderColor: result.probabilityDSCRBelow1_0 > 25 ? "#ff6b6b" : result.probabilityDSCRBelow1_0 > 10 ? YELLOW : MINT }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "8px" }}>P(DSCR &lt; 1.0)</div>
                  <div style={{ fontSize: "44px", fontWeight: 800, color: result.probabilityDSCRBelow1_0 > 25 ? "#ff6b6b" : result.probabilityDSCRBelow1_0 > 10 ? YELLOW : MINT, lineHeight: 1 }}>
                    <AnimatedNumber value={result.probabilityDSCRBelow1_0} format={(v) => `${v.toFixed(1)}%`} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#4a5d5d", marginTop: "6px" }}>Deal-break probability</div>
                </AnimatedCard>
                <AnimatedCard hoverScale={true} style={{ textAlign: "center", borderColor: result.probabilityDSCRBelow1_25 > 60 ? "#ff6b6b" : result.probabilityDSCRBelow1_25 > 30 ? YELLOW : MINT }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "8px" }}>P(DSCR &lt; 1.25)</div>
                  <div style={{ fontSize: "44px", fontWeight: 800, color: result.probabilityDSCRBelow1_25 > 60 ? "#ff6b6b" : result.probabilityDSCRBelow1_25 > 30 ? YELLOW : MINT, lineHeight: 1 }}>
                    <AnimatedNumber value={result.probabilityDSCRBelow1_25} format={(v) => `${v.toFixed(1)}%`} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#4a5d5d", marginTop: "6px" }}>Comfortable zone miss</div>
                </AnimatedCard>
              </div>

              <AnimatedCard hoverScale={true}>
                <div style={sectionTitle}>Final Stabilized Rate Distribution</div>
                <Row label="10th percentile (low)" value={<AnimatedNumber value={result.finalRateStats.p10} format={(v) => `${v.toFixed(2)}%`} />} highlight={MINT} />
                <Row label="Median (50th)" value={<AnimatedNumber value={result.finalRateStats.median} format={(v) => `${v.toFixed(2)}%`} />} />
                <Row label="90th percentile (high)" value={<AnimatedNumber value={result.finalRateStats.p90} format={(v) => `${v.toFixed(2)}%`} />} highlight="#ff6b6b" />
                <Row label="Std deviation" value={<AnimatedNumber value={result.finalRateStats.stddev} format={(v) => `${v.toFixed(2)}%`} />} />
              </AnimatedCard>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Final DSCR Distribution</div>
                <Row label="Worst 10% (P10)" value={<AnimatedNumber value={result.dscrStats.p10} format={(v) => `${v.toFixed(2)}x`} />} highlight={result.dscrStats.p10 < 1.0 ? "#ff6b6b" : YELLOW} />
                <Row label="Median" value={<AnimatedNumber value={result.dscrStats.median} format={(v) => `${v.toFixed(2)}x`} />} />
                <Row label="Best 10% (P90)" value={<AnimatedNumber value={result.dscrStats.p90} format={(v) => `${v.toFixed(2)}x`} />} highlight={MINT} />
                <Row label="Probability rate hits lifetime cap" value={<AnimatedNumber value={result.probabilityRateAboveLifetimeCap} format={(v) => `${v.toFixed(1)}%`} />} />
              </AnimatedCard>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>SOFR Path at Horizon ({horizonYears}yr)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "8px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b", textTransform: "uppercase" }}>Year 1 mean</div>
                    <div style={{ fontSize: "18px", color: CREAM, fontWeight: 700, fontFamily: "monospace" }}>
                      <AnimatedNumber value={result.sofrAtHorizon.year1.mean} format={(v) => `${v.toFixed(2)}%`} />
                    </div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b" }}>
                      P10-P90: <AnimatedNumber value={result.sofrAtHorizon.year1.p10} format={(v) => `${v.toFixed(2)}%`} /> – <AnimatedNumber value={result.sofrAtHorizon.year1.p90} format={(v) => `${v.toFixed(2)}%`} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b", textTransform: "uppercase" }}>Year 5 mean</div>
                    <div style={{ fontSize: "18px", color: CREAM, fontWeight: 700, fontFamily: "monospace" }}>
                      <AnimatedNumber value={result.sofrAtHorizon.year5.mean} format={(v) => `${v.toFixed(2)}%`} />
                    </div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b" }}>
                      P10-P90: <AnimatedNumber value={result.sofrAtHorizon.year5.p10} format={(v) => `${v.toFixed(2)}%`} /> – <AnimatedNumber value={result.sofrAtHorizon.year5.p90} format={(v) => `${v.toFixed(2)}%`} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b", textTransform: "uppercase" }}>Year 10 mean</div>
                    <div style={{ fontSize: "18px", color: CREAM, fontWeight: 700, fontFamily: "monospace" }}>
                      <AnimatedNumber value={result.sofrAtHorizon.year10.mean} format={(v) => `${v.toFixed(2)}%`} />
                    </div>
                    <div style={{ fontSize: "10px", color: "#5a6b6b" }}>
                      P10-P90: <AnimatedNumber value={result.sofrAtHorizon.year10.p10} format={(v) => `${v.toFixed(2)}%`} /> – <AnimatedNumber value={result.sofrAtHorizon.year10.p90} format={(v) => `${v.toFixed(2)}%`} />
                    </div>
                  </div>
                </div>
              </AnimatedCard>

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

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", fontSize: "14px" }}>
      <span style={{ color: "#5a6b6b" }}>{label}</span>
      <span style={{ color: highlight || CREAM, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}