import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { computeConstructionBridge } from "../engine/constructionBridge";
import { PremiumSlider } from "../components/PremiumUI";
import { risk, LEMON, MIDNIGHT } from "../theme";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function ConstructionBridgePage({
  onBack,
  onNavigate = () => {},
}: {
  onBack: () => void;
  onNavigate?: (view: any) => void;
}) {
  React.useEffect(() => {
    document.title = "Construction & Bridge Carry | Greenstreet Finance";
  }, []);

  // ── Inputs ──
  const [projectCost, setProjectCost] = useState(1000000);
  const [loanAmount, setLoanAmount] = useState(750000);
  const [bridgeRate, setBridgeRate] = useState(10.5);
  const [months, setMonths] = useState(12);
  const [stabilizedRent, setStabilizedRent] = useState(9000);
  const [stabilizedEscrows, setStabilizedEscrows] = useState(1200);
  const [exitRate, setExitRate] = useState(7.0);

  // ── Engine ──
  const result = useMemo(() => {
    try {
      return computeConstructionBridge({
        totalProjectCost: projectCost,
        loanAmount,
        bridgeRate,
        constructionMonths: months,
        avgDrawFraction: 0.5,
        stabilizedRentMonthly: stabilizedRent,
        stabilizedEscrowsMonthly: stabilizedEscrows,
        exitRate,
      });
    } catch {
      return null;
    }
  }, [projectCost, loanAmount, bridgeRate, months, stabilizedRent, stabilizedEscrows, exitRate]);

  return (
    <DcShell onNavigate={onNavigate}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <H1>Construction & Bridge Carry</H1>
        <Lead>
          Analyze short-term carry costs and exit viability. Calculates progressive-draw interest reserves 
          and ensures the permanent takeout loan can retire the bridge note.
        </Lead>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginTop: 40 }}>
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PremiumSlider label="Total Project Cost (LTC Basis)" value={projectCost} min={200000} max={5000000} step={10000} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setProjectCost} />
            <PremiumSlider label="Bridge Loan Amount" value={loanAmount} min={100000} max={4000000} step={10000} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setLoanAmount} />
            <PremiumSlider label="Bridge Note Rate (IO)" value={bridgeRate} min={8.0} max={15.0} step={0.25} formatValue={(v) => `${v}%`} onChange={setBridgeRate} />
            <PremiumSlider label="Construction Term (Months)" value={months} min={6} max={24} step={1} onChange={setMonths} />
            <div style={{ height: 1, background: "rgba(238,239,211,0.1)", margin: "8px 0" }} />
            <PremiumSlider label="Projected Stabilized Rent" value={stabilizedRent} min={1000} max={30000} step={100} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setStabilizedRent} />
            <PremiumSlider label="Stabilized Escrows (Tax/Ins/HOA)" value={stabilizedEscrows} min={100} max={5000} step={50} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setStabilizedEscrows} />
            <PremiumSlider label="Exit Takeout Rate" value={exitRate} min={5.0} max={9.0} step={0.125} formatValue={(v) => `${v}%`} onChange={setExitRate} />
          </div>

          {/* Outputs */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: dc.card, borderRadius: dc.r.lg, padding: 24, border: `1px solid ${dc.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: dc.muted, textTransform: "uppercase", marginBottom: 12 }}>
                  Exit Takeout Viability
                </div>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: result.viability === "SHORTFALL" ? risk.danger : result.viability === "TIGHT" ? LEMON : dc.emerald, letterSpacing: "-0.02em" }}>
                    {result.viability}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Stabilized DSCR</span>
                    <Mono style={{ color: result.exitDscr < 1.0 ? risk.danger : dc.light }}>{result.exitDscr.toFixed(2)}x</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Takeout Retires Bridge?</span>
                    <Mono style={{ color: result.takeoutRetiresBridge ? dc.emerald : risk.danger }}>
                      {result.takeoutRetiresBridge ? "YES" : "NO"}
                    </Mono>
                  </div>
                </div>

                {result.viability === "SHORTFALL" && (
                  <div style={{ marginTop: 20, background: risk.dangerBg, borderWidth: '1px 1px 1px 3px', borderStyle: 'solid', borderColor: risk.dangerBorder, borderLeftColor: risk.danger, borderRadius: '0 8px 8px 0', padding: 16 }}>
                    <div style={{ fontSize: 13, color: "rgba(238,239,211,0.8)", lineHeight: 1.5 }}>
                      The projected stabilized rent cannot support a takeout loan large enough to retire the bridge note at a 1.00x DSCR floor. Cash-in will be required at refinance.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: dc.panel, borderRadius: dc.r.md, padding: 20, border: `1px solid ${dc.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: dc.muted, textTransform: "uppercase", marginBottom: 12 }}>
                  Bridge Carry & LTC
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Loan to Cost (LTC)</span>
                    <Mono style={{ color: result.ltcPct > 85 ? risk.danger : dc.light }}>{result.ltcPct.toFixed(1)}%</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Peak IO Payment (100% Drawn)</span>
                    <Mono style={{ color: dc.light }}>{fmt$(result.monthlyIOPaymentFull)}/mo</Mono>
                  </div>
                  <div style={{ height: 1, background: "rgba(238,239,211,0.1)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
                    <span style={{ color: LEMON }}>Required Interest Reserve</span>
                    <Mono style={{ color: LEMON }}>{fmt$(result.interestReserveNeeded)}</Mono>
                  </div>
                  <div style={{ fontSize: 12, color: dc.muted, textAlign: "right" }}>
                    Assumes 50% avg draw over {months} months
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <BottomCTA onNavigate={onNavigate} />
      </div>
    </DcShell>
  );
}
