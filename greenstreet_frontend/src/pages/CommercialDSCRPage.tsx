import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { computeCommercialDscr } from "../engine/commercialDscr";
import { PremiumSlider } from "../components/PremiumUI";
import { risk, LEMON, MIDNIGHT } from "../theme";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function CommercialDSCRPage({
  onBack,
  onNavigate = () => {},
}: {
  onBack: () => void;
  onNavigate?: (view: any) => void;
}) {
  React.useEffect(() => {
    document.title = "Commercial DSCR | Greenstreet Finance";
  }, []);

  // ── Inputs ──
  const [unitCount, setUnitCount] = useState(8);
  const [grossRent, setGrossRent] = useState(12000);
  const [vacancy, setVacancy] = useState(5);
  const [opex, setOpex] = useState(4000);
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [rate, setRate] = useState(7.5);

  // ── Engine ──
  const result = useMemo(() => {
    try {
      return computeCommercialDscr({
        unitCount,
        grossScheduledRentMonthly: grossRent,
        vacancyRatePct: vacancy,
        operatingExpensesMonthly: opex,
        loanAmount,
        interestRate: rate,
        amortizationYears: 30,
        minDscrFloor: 1.25,
      });
    } catch {
      return null;
    }
  }, [unitCount, grossRent, vacancy, opex, loanAmount, rate]);

  return (
    <DcShell onNavigate={onNavigate}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <H1>Commercial 5+ Unit DSCR</H1>
        <Lead>
          Analyze multifamily underwriting economics. Calculates Effective Gross Income (EGI), 
          Net Operating Income (NOI), and verifies expense-ratio minimums.
        </Lead>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginTop: 40 }}>
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PremiumSlider label="Unit Count" value={unitCount} min={5} max={50} step={1} onChange={setUnitCount} />
            <PremiumSlider label="Gross Scheduled Rent /mo" value={grossRent} min={4000} max={50000} step={100} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setGrossRent} />
            <PremiumSlider label="Vacancy & Collection Loss %" value={vacancy} min={3} max={15} step={0.5} formatValue={(v) => `${v}%`} onChange={setVacancy} />
            <PremiumSlider label="Operating Expenses /mo" value={opex} min={1000} max={20000} step={100} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setOpex} />
            <div style={{ height: 1, background: "rgba(238,239,211,0.1)", margin: "8px 0" }} />
            <PremiumSlider label="Target Loan Amount" value={loanAmount} min={500000} max={5000000} step={50000} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setLoanAmount} />
            <PremiumSlider label="Interest Rate" value={rate} min={5.0} max={10.0} step={0.125} formatValue={(v) => `${v}%`} onChange={setRate} />
          </div>

          {/* Outputs */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: dc.card, borderRadius: dc.r.lg, padding: 24, border: `1px solid ${dc.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: dc.muted, textTransform: "uppercase", marginBottom: 12 }}>
                  Underwriting Conclusion
                </div>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: result.disposition === "FAIL" ? risk.danger : result.disposition === "MARGINAL" ? LEMON : dc.emerald, letterSpacing: "-0.02em" }}>
                    {result.dscr.toFixed(2)}x
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: dc.muted }}>DSCR</div>
                </div>

                {result.noiSanity.isUnderstatedOpEx && (
                  <div style={{ marginTop: 20, background: risk.dangerBg, borderWidth: '1px 1px 1px 3px', borderStyle: 'solid', borderColor: risk.dangerBorder, borderLeftColor: risk.danger, borderRadius: '0 8px 8px 0', padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: risk.danger, textTransform: "uppercase", marginBottom: 6 }}>
                      OpEx Sanity Warning
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(238,239,211,0.8)", lineHeight: 1.5 }}>
                      {result.noiSanity.warningMessage}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: dc.panel, borderRadius: dc.r.md, padding: 20, border: `1px solid ${dc.border}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Effective Gross Income (EGI)</span>
                    <Mono style={{ color: dc.light }}>{fmt$(result.effectiveGrossIncomeMonthly)}/mo</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Operating Expenses</span>
                    <Mono style={{ color: dc.light }}>{fmt$(opex)}/mo</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Expense Ratio</span>
                    <Mono style={{ color: result.noiSanity.isUnderstatedOpEx ? risk.danger : dc.light }}>
                      {result.noiSanity.expenseRatioPct.toFixed(1)}%
                    </Mono>
                  </div>
                  <div style={{ height: 1, background: "rgba(238,239,211,0.1)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
                    <span style={{ color: dc.light }}>Net Operating Income (NOI)</span>
                    <Mono style={{ color: LEMON }}>{fmt$(result.noiMonthly)}/mo</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: dc.muted }}>Annual Debt Service</span>
                    <Mono style={{ color: dc.light }}>{fmt$(result.debtServiceAnnual)}/yr</Mono>
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
