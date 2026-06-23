// @ts-nocheck
import React, { useState, useMemo } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";

const MINT = "#006565";
const CREAM = "#003738";
const YELLOW = "#8a6d00";

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function DealAnalyzerPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct, setDownPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [state, setState] = useState("TX");
  const [annualTaxes, setAnnualTaxes] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2000);
  const [hoa, setHoa] = useState(0);

  const result = useMemo(() => {
    const loanAmount = purchasePrice * (1 - downPct / 100);
    const cashInvested = purchasePrice - loanAmount;
    const r = rate / 100 / 12;
    const piMonthly = (loanAmount * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
    const pitia = piMonthly + annualTaxes / 12 + annualInsurance / 12 + hoa;
    const dscr = pitia > 0 ? monthlyRent / pitia : 0;
    const cashFlow = monthlyRent - pitia;
    const noi = (monthlyRent * 0.92 * 12) - annualTaxes - annualInsurance - hoa * 12 - monthlyRent * 12 * 0.13;
    const capRate = (noi / purchasePrice) * 100;
    const debtYield = (noi / loanAmount) * 100;

    let ltv, verdict, verdictColor;
    if (dscr >= 1.25) { ltv = "STRONG"; verdictColor = MINT; }
    else if (dscr >= 1.00) { ltv = "QUALIFIES"; verdictColor = YELLOW; }
    else if (dscr >= 0.75) { ltv = "SUB-1.0"; verdictColor = "#018582"; }
    else { ltv = "DEAL BREAK"; verdictColor = "#ff6b6b"; }

    const stateAdjustments: Record<string, { rateAdj: number; pppNote: string; extra: string }> = {
      NJ: { rateAdj: 0.25, pppNote: "PPP HIGH-RISK for LLC; C-Corp/S-Corp only", extra: "Some lenders won't quote." },
      MD: { rateAdj: 0.50, pppNote: "PPP de facto prohibited", extra: "Most DSCR lenders decline." },
      KS: { rateAdj: 0.50, pppNote: "PPP de facto prohibited", extra: "Most DSCR lenders decline." },
      MN: { rateAdj: 0.10, pppNote: "Business-purpose ALLOWED (HF 3437 eff. 8/1/2026)", extra: "Consumer still prohibited." },
      NY: { rateAdj: 0.25, pppNote: "Business-purpose ALLOWED; criminal usury cap 25%", extra: "Banking Law §6-l." },
      PA: { rateAdj: 0.10, pppNote: "Threshold-based ($319,777 in 2026)", extra: "Above threshold: business-purpose allowed." },
      OH: { rateAdj: 0.10, pppNote: "Threshold-based ($116,356 in 2026)", extra: "Above threshold: max 1% penalty, 5yr cap." },
    };
    const sa = stateAdjustments[state] || { rateAdj: 0, pppNote: "No state PPP restrictions for business-purpose DSCR.", extra: "Standard pricing applies." };

    return { loanAmount, cashInvested, piMonthly, pitia, dscr, cashFlow, noi, capRate, debtYield, ltv, verdictColor, sa };
  }, [purchasePrice, downPct, monthlyRent, rate, state, annualTaxes, annualInsurance, hoa]);

  return (
    <PageShell
      title="DSCR Deal Analyzer"
      subtitle="The most important tool on the site. Plug in 7 numbers, get the verdict and the lender shortlist. No signup."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <div style={{ ...card }}>
          <div style={sectionTitle}>Property</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "Down Payment", value: downPct, set: setDownPct, step: 1, suffix: "%" },
            { label: "Monthly Rent (qualifying)", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Note Rate", value: rate, set: setRate, step: 0.125, suffix: "%" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
          <div style={{ ...sectionTitle, marginTop: "20px" }}>Carrying Costs</div>
          {[
            { label: "Annual Taxes", value: annualTaxes, set: setAnnualTaxes, step: 250, prefix: "$" },
            { label: "Annual Insurance", value: annualInsurance, set: setAnnualInsurance, step: 100, prefix: "$" },
            { label: "Monthly HOA", value: hoa, set: setHoa, step: 25, prefix: "$" },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>{f.label}</label>
              <input type="number" value={f.value} step={f.step} onChange={(e) => f.set(+e.target.value)} style={{ width: "100%", background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" }}>State</label>
            <input type="text" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} style={{ width: "100%", background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "16px", fontWeight: 700, textAlign: "center", outline: "none", letterSpacing: "0.2em" }} />
          </div>
        </div>

        <div>
          <div style={{ ...card, textAlign: "center", borderColor: result.verdictColor }}>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>Verdict</div>
            <div style={{ fontSize: "72px", fontWeight: 800, color: result.verdictColor, lineHeight: 1 }}>{result.dscr.toFixed(2)}x</div>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: result.verdictColor, margin: "8px 0 16px" }}>{result.ltv}</div>
            <div style={{ fontSize: "14px", color: "#4a5d5d" }}>
              Track 1 DSCR at {rate}% · {state} · {downPct}% down
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "20px" }}>
            {[
              { label: "Monthly Cash Flow", value: fmt$(result.cashFlow), color: result.cashFlow > 0 ? MINT : "#ff6b6b" },
              { label: "Cap Rate", value: `${result.capRate.toFixed(2)}%`, color: CREAM },
              { label: "Debt Yield", value: `${result.debtYield.toFixed(2)}%`, color: CREAM },
            ].map((m) => (
              <div key={m.label} style={{ background: "#e8e9bf", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#5a6b6b", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: m.color, marginTop: "4px" }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ ...card, marginTop: "20px" }}>
            <div style={sectionTitle}>State Rule ({state})</div>
            <p style={{ fontSize: "13px", color: CREAM, lineHeight: 1.6, marginBottom: "8px" }}>{result.sa.pppNote}</p>
            <p style={{ fontSize: "12px", color: "#5a6b6b", lineHeight: 1.5 }}>{result.sa.extra}</p>
            {result.sa.rateAdj > 0 && (
              <p style={{ fontSize: "12px", color: YELLOW, marginTop: "8px" }}>Rate adjustment: +{result.sa.rateAdj.toFixed(2)}% over base pricing.</p>
            )}
          </div>

          <div style={{ ...card, marginTop: "20px" }}>
            <div style={sectionTitle}>Top Lender Shortlist</div>
            {[
              { name: "Griffin Funding", rate: (rate + result.sa.rateAdj - 0.875).toFixed(3), note: "Best rate tier. 50+DC, 620 FICO, jumbo to $20M." },
              { name: "Kiavi", rate: (rate + result.sa.rateAdj - 0.50).toFixed(3), note: "Tech-forward, fast close. 1.10+ DSCR required." },
              { name: "Visio Lending", rate: (rate + result.sa.rateAdj - 0.10).toFixed(3), note: "Sub-1.0 DSCR accepted. STR specialist." },
              { name: "New Silver", rate: (rate + result.sa.rateAdj).toFixed(3), note: "$150K-$3M, instant approval, 14-21 day close." },
              { name: "Rocket Pro TPO", rate: (rate + result.sa.rateAdj + 0.10).toFixed(3), note: "All 50 states, max $3.5M, 21-30 day close." },
            ].map((l) => (
              <div key={l.name} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: CREAM, fontWeight: 700, fontSize: "14px" }}>{l.name}</span>
                  <span style={{ color: MINT, fontFamily: "monospace", fontWeight: 700, fontSize: "14px" }}>{l.rate}%</span>
                </div>
                <p style={{ color: "#5a6b6b", fontSize: "12px", marginTop: "4px", lineHeight: 1.4 }}>{l.note}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", padding: "14px 18px", background: "rgba(0,101,101,0.08)", borderRadius: "10px", border: "1px solid rgba(0,101,101,0.22)", fontSize: "12px", color: "#4a5d5d", lineHeight: 1.6 }}>
            <strong style={{ color: MINT }}>Want the full deal?</strong> Open the <a href="/dscr-calculator" style={{ color: MINT, fontWeight: 600 }}>DSCR Calculator</a> for a Track 1/Track 2 breakdown, or run the <a href="/decision-support" style={{ color: MINT, fontWeight: 600 }}>Decision Support</a> tool for an IC-memo-grade verdict.
          </div>
        </div>
      </div>
    </PageShell>
  );
}