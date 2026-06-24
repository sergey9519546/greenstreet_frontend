import React, { useState, useMemo } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedNumber,
  PremiumInput
} from "./PageShell";
import { simulateARMResetLadder, DEFAULT_ARM_PROGRAMS, computePaymentShockPct } from "../engine/armResetEngine";
import { calculatePI } from "../engine/engine";
import type { ARMTerms, ARMScenarioName } from "../engine/types";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

type ArmType = "5_6_ARM" | "7_6_ARM" | "10_6_ARM";

const SCENARIO_INDEXES: Record<ARMScenarioName, number> = {
  BULLISH: 2.50,
  BASE: 3.60,
  BEARISH: 4.50,
  STRESS: 5.00,
  CRISIS: 6.00,
};

const SCENARIO_COLORS: Record<ARMScenarioName, string> = {
  BULLISH: MINT,
  BASE: YELLOW,
  BEARISH: "#ff8c42",
  STRESS: "#ff6b6b",
  CRISIS: "#4a1515",
};

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function ARMPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [armType, setArmType] = useState<ArmType>("5_6_ARM");
  const [loanAmount, setLoanAmount] = useState(340000);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [pitiaNonDebt, setPitiaNonDebt] = useState(750);

  const result = useMemo(() => {
    try {
      const cfg = DEFAULT_ARM_PROGRAMS[armType];
      const armTerms: ARMTerms = cfg;
      const scenarios: { name: ARMScenarioName; index: number; ladder: ReturnType<typeof simulateARMResetLadder>; dscrAtFirstReset: number; dscrAtLifetime: number; }[] = [];
      for (const name of Object.keys(SCENARIO_INDEXES) as ARMScenarioName[]) {
        const index = SCENARIO_INDEXES[name];
        const ladder = simulateARMResetLadder(armTerms, index, 15);
        // Compute DSCR at first reset and at lifetime cap
        const firstReset = ladder.trajectory[0];
        const lastReset = ladder.trajectory[ladder.trajectory.length - 1];
        const piAtFirstReset = firstReset ? calculatePI(loanAmount, firstReset.rate, 360 - Math.round(firstReset.year * 12)) : 0;
        const piAtLifetime = lastReset ? calculatePI(loanAmount, lastReset.rate, 360 - Math.round(lastReset.year * 12)) : 0;
        const dscrAtFirstReset = piAtFirstReset > 0 ? monthlyRent / (piAtFirstReset + pitiaNonDebt) : 0;
        const dscrAtLifetime = piAtLifetime > 0 ? monthlyRent / (piAtLifetime + pitiaNonDebt) : 0;
        scenarios.push({ name, index, ladder, dscrAtFirstReset, dscrAtLifetime });
      }
      const bearScenario = scenarios.find((s) => s.name === "BEARISH")!;
      const firstResetYear = armTerms.fixedPeriodMonths / 12 + 1;
      const firstReset = bearScenario.ladder.trajectory[0];
      const piInitial = calculatePI(loanAmount, armTerms.initialRate, 360);
      const piAtFirstReset = firstReset ? calculatePI(loanAmount, firstReset.rate, 360 - Math.round(firstReset.year * 12)) : 0;
      const paymentShock = piInitial > 0 && piAtFirstReset > 0 ? ((piAtFirstReset - piInitial) / piInitial) * 100 : 0;
      return { cfg: armTerms, scenarios, bearScenario, firstResetYear, firstReset, piInitial, piAtFirstReset, paymentShock };
    } catch (e) {
      return null;
    }
  }, [armType, loanAmount, monthlyRent, pitiaNonDebt]);

  return (
    <PageShell
      title="ARM Reset Risk"
      subtitle="Models the actual ARM reset ladder from src/engine/armResetEngine.ts. Walks the per-period caps under 5 SOFR scenarios (Bullish / Base / Bearish / Stress / Crisis)."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <AnimatedCard hoverScale={false}>
          <div style={sectionTitle}>ARM Structure (engine DEFAULT_ARM_PROGRAMS)</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {(["5_6_ARM", "7_6_ARM", "10_6_ARM"] as ArmType[]).map((t) => (
              <button key={t} onClick={() => setArmType(t)} style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: `1px solid ${armType === t ? MINT : "rgba(0,55,56,0.22)"}`,
                background: armType === t ? "rgba(0,101,101,0.12)" : "transparent",
                color: armType === t ? MINT : "#4a5d5d", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              }}>
                {t.replace("_ARM", "").replace("_", "/")}
              </button>
            ))}
          </div>
          {result && (
            <>
              <Row label="Fixed period" value={`${result.cfg.fixedPeriodMonths / 12} years`} />
              <Row label="Initial rate" value={`${result.cfg.initialRate.toFixed(3)}%`} />
              <Row label="Margin" value={`${result.cfg.marginPct.toFixed(2)}%`} />
              <Row label="First-reset cap" value={`+${result.cfg.initialCapPct.toFixed(1)}%`} />
              <Row label="Periodic cap" value={`+${result.cfg.periodicCapPct.toFixed(1)}% / reset`} />
              <Row label="Lifetime cap" value={`+${result.cfg.lifetimeCapPct.toFixed(1)}%`} />
            </>
          )}

          <div style={{ ...sectionTitle, marginTop: "24px" }}>Deal Inputs</div>
          {[
            { label: "Loan Amount", value: loanAmount, set: setLoanAmount, step: 5000, prefix: "$" },
            { label: "Monthly Rent", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Taxes + Ins + HOA / mo", value: pitiaNonDebt, set: setPitiaNonDebt, step: 25, prefix: "$" },
          ].map((f) => (
            <PremiumInput
              key={f.label}
              type="number"
              label={f.label}
              value={f.value}
              step={f.step}
              prefixSymbol={f.prefix}
              suffixSymbol={(f as { suffix?: string }).suffix}
              onChange={(e) => f.set(+e.target.value)}
            />
          ))}
        </AnimatedCard>

        <div>
          {!result ? (
            <AnimatedCard hoverScale={false} style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#ff6b6b" }}>Engine returned no result. Adjust inputs.</p>
            </AnimatedCard>
          ) : (
            <>
              <AnimatedCard hoverScale={true} style={{ textAlign: "center", borderColor: result.paymentShock > 30 ? "#ff6b6b" : result.paymentShock > 15 ? YELLOW : MINT }}>
                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>First-Reset Payment Shock (Bearish SOFR)</div>
                <div style={{ fontSize: "60px", fontWeight: 800, color: result.paymentShock > 30 ? "#ff6b6b" : result.paymentShock > 15 ? YELLOW : MINT, lineHeight: 1 }}>
                  <AnimatedNumber value={result.paymentShock} format={(v) => `+${v.toFixed(0)}%`} />
                </div>
                <div style={{ fontSize: "13px", color: "#4a5d5d", marginTop: "12px" }}>
                  Payment jumps from <AnimatedNumber value={result.piInitial} format={fmt$} />/mo to <AnimatedNumber value={result.piAtFirstReset} format={fmt$} />/mo at year <AnimatedNumber value={result.firstResetYear} format={(v) => String(Math.round(v))} />.
                </div>
              </AnimatedCard>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>5 SOFR Scenarios (engine.simulateARMResetLadder)</div>
                {result.scenarios.map((s) => {
                  const color = SCENARIO_COLORS[s.name];
                  const firstReset = s.ladder.trajectory[0];
                  const lastReset = s.ladder.trajectory[s.ladder.trajectory.length - 1];
                  const breaks = s.dscrAtLifetime < 1.0;
                  return (
                    <div key={s.name} style={{ padding: "12px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: CREAM, fontWeight: 700, fontSize: "14px" }}>{s.name}</span>
                        <span style={{ color, fontSize: "12px", fontWeight: 700 }}>SOFR {s.index.toFixed(2)}%</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginTop: "8px", fontSize: "12px", color: "#4a5d5d" }}>
                        <div>First reset: <span style={{ color: CREAM, fontWeight: 600 }}>
                          {firstReset ? <AnimatedNumber value={firstReset.rate} format={(v) => `${v.toFixed(2)}%`} /> : "—"}
                        </span></div>
                        <div>Lifetime: <span style={{ color: CREAM, fontWeight: 600 }}>
                          {lastReset ? <AnimatedNumber value={lastReset.rate} format={(v) => `${v.toFixed(2)}%`} /> : "—"}
                        </span></div>
                        <div>DSCR @ reset: <span style={{ color: s.dscrAtFirstReset < 1.0 ? "#ff6b6b" : CREAM, fontWeight: 600 }}>
                          <AnimatedNumber value={s.dscrAtFirstReset} format={(v) => `${v.toFixed(2)}x`} />
                        </span></div>
                        <div>DSCR @ lifetime: <span style={{ color: breaks ? "#ff6b6b" : CREAM, fontWeight: 600 }}>
                          <AnimatedNumber value={s.dscrAtLifetime} format={(v) => `${v.toFixed(2)}x`} />
                        </span></div>
                      </div>
                    </div>
                  );
                })}
              </AnimatedCard>

              <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
                <div style={sectionTitle}>Reset Ladder (Bearish SOFR path)</div>
                <div style={{ overflowX: "auto", marginTop: "8px" }}>
                  <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "6px 4px", color: "#5a6b6b", textAlign: "left", fontWeight: 600 }}>Reset #</th>
                        <th style={{ padding: "6px 4px", color: "#5a6b6b", textAlign: "right", fontWeight: 600 }}>Year</th>
                        <th style={{ padding: "6px 4px", color: "#5a6b6b", textAlign: "right", fontWeight: 600 }}>Rate</th>
                        <th style={{ padding: "6px 4px", color: "#5a6b6b", textAlign: "right", fontWeight: 600 }}>Cap binding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.bearScenario.ladder.trajectory.map((t) => (
                        <tr key={t.resetNumber}>
                          <td style={{ padding: "6px 4px", color: CREAM }}>#{t.resetNumber}</td>
                          <td style={{ padding: "6px 4px", color: "#4a5d5d", textAlign: "right" }}>Y{t.year}</td>
                          <td style={{ padding: "6px 4px", color: CREAM, fontWeight: 600, textAlign: "right", fontFamily: "monospace" }}>
                            <AnimatedNumber value={t.rate} format={(v) => `${v.toFixed(3)}%`} />
                          </td>
                          <td style={{ padding: "6px 4px", color: t.capBinding === "LIFETIME_CAP" ? "#ff6b6b" : t.capBinding === "INITIAL_CAP" ? YELLOW : "#5a6b6b", textAlign: "right", fontSize: "10px" }}>{t.capBinding}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AnimatedCard>

              <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(216,217,88,0.08)", borderRadius: "10px", border: "1px solid rgba(216,217,88,0.2)", fontSize: "12px", color: "#4a5d5d", lineHeight: 1.6 }}>
                <strong style={{ color: YELLOW }}>Engine:</strong> Uses DEFAULT_ARM_PROGRAMS from armResetEngine.ts and simulates the actual reset ladder (per-period caps enforced). The CRISIS scenario hits the lifetime cap in 5 resets from origination; the BEARISH scenario may never hit it.
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", fontSize: "14px" }}>
      <span style={{ color: "#5a6b6b" }}>{label}</span>
      <span style={{ color: CREAM, fontWeight: 600 }}>{value}</span>
    </div>
  );
}