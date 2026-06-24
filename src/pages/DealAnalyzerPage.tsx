import React, { useState, useMemo } from "react";
import { swatch } from "../theme";
import { DSCR_PROGRAMS, lookupMaxLTV } from "../data/dscrPrograms";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedNumber,
  PremiumInput
} from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function DealAnalyzerPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct, setDownPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [fico, setFico] = useState(720);
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
      NY: { rateAdj: 0.25, pppNote: "Business-purpose ALLOWED; criminal usury usury cap 25%", extra: "Banking Law §6-l." },
      PA: { rateAdj: 0.10, pppNote: "Threshold-based ($319,777 in 2026)", extra: "Above threshold: business-purpose allowed." },
      OH: { rateAdj: 0.10, pppNote: "Threshold-based ($116,356 in 2026)", extra: "Above threshold: max 1% penalty, 5yr cap." },
    };
    const sa = stateAdjustments[state] || { rateAdj: 0, pppNote: "No state PPP restrictions for business-purpose DSCR.", extra: "Standard pricing applies." };

    const ltvNeeded = 100 - downPct;
    const matchedPrograms = DSCR_PROGRAMS
      .map((p) => {
        const offerLTV = lookupMaxLTV(p, fico, loanAmount, dscr >= 0.01 ? dscr : null, "purchase");
        return offerLTV !== null && offerLTV >= ltvNeeded ? { program: p, offerLTV } : null;
      })
      .filter((x): x is { program: typeof DSCR_PROGRAMS[0]; offerLTV: number } => x !== null);

    return { loanAmount, cashInvested, piMonthly, pitia, dscr, cashFlow, noi, capRate, debtYield, ltv, verdictColor, sa, matchedPrograms };
  }, [purchasePrice, downPct, monthlyRent, rate, fico, state, annualTaxes, annualInsurance, hoa]);

  return (
    <PageShell
      title="DSCR Deal Analyzer"
      subtitle="The most important tool on the site. Plug in 7 numbers, get the verdict and your Greenstreet program match. No signup."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>
        <AnimatedCard hoverScale={false}>
          <div style={sectionTitle}>Property</div>
          {[
            { label: "Purchase Price", value: purchasePrice, set: setPurchasePrice, step: 5000, prefix: "$" },
            { label: "Down Payment", value: downPct, set: setDownPct, step: 1, suffix: "%" },
            { label: "Monthly Rent (qualifying)", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
            { label: "Note Rate", value: rate, set: setRate, step: 0.125, suffix: "%" },
            { label: "Borrower FICO", value: fico, set: setFico, step: 20 },
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
          <div style={{ ...sectionTitle, marginTop: "20px" }}>Carrying Costs</div>
          {[
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
              suffixSymbol={(f as { suffix?: string }).suffix}
              onChange={(e) => f.set(+e.target.value)}
            />
          ))}
          <PremiumInput
            type="text"
            maxLength={2}
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            style={{ fontWeight: 700 }}
          />
        </AnimatedCard>

        <div>
          <AnimatedCard hoverScale={true} style={{ textAlign: "center", borderColor: result.verdictColor }}>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>Verdict</div>
            <div style={{ fontSize: "72px", fontWeight: 800, color: result.verdictColor, lineHeight: 1 }}>
              <AnimatedNumber value={result.dscr} format={(v) => `${v.toFixed(2)}x`} />
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: result.verdictColor, margin: "8px 0 16px" }}>{result.ltv}</div>
            <div style={{ fontSize: "14px", color: "#4a5d5d" }}>
              Track 1 DSCR at {rate}% · {state} · {downPct}% down
            </div>
          </AnimatedCard>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "20px" }}>
            {[
              { label: "Monthly Cash Flow", value: result.cashFlow, format: (v: number) => fmt$(v), color: result.cashFlow > 0 ? MINT : "#ff6b6b" },
              { label: "Cap Rate", value: result.capRate, format: (v: number) => `${v.toFixed(2)}%`, color: CREAM },
              { label: "Debt Yield", value: result.debtYield, format: (v: number) => `${v.toFixed(2)}%`, color: CREAM },
            ].map((m) => (
              <AnimatedCard key={m.label} hoverScale={true} style={{ background: "#e8e9bf", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#5a6b6b", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: m.color, marginTop: "4px" }}>
                  <AnimatedNumber value={m.value} format={m.format} />
                </div>
              </AnimatedCard>
            ))}
          </div>

          <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
            <div style={sectionTitle}>State Rule ({state})</div>
            <p style={{ fontSize: "13px", color: CREAM, lineHeight: 1.6, marginBottom: "8px" }}>{result.sa.pppNote}</p>
            <p style={{ fontSize: "12px", color: "#5a6b6b", lineHeight: 1.5 }}>{result.sa.extra}</p>
            {result.sa.rateAdj > 0 && (
              <p style={{ fontSize: "12px", color: YELLOW, marginTop: "8px" }}>Rate adjustment: +{result.sa.rateAdj.toFixed(2)}% over base pricing.</p>
            )}
          </AnimatedCard>

          <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
            <div style={sectionTitle}>Your Greenstreet Program Options</div>
            {result.matchedPrograms.length === 0 ? (
              <p style={{ color: "#5a6b6b", fontSize: "13px", lineHeight: 1.6 }}>
                No standard program matches at {fico} FICO / {100 - downPct}% LTV / {result.dscr.toFixed(2)}x DSCR.
                Adjust FICO, down payment, or talk to a Greenstreet specialist — exceptions exist.
              </p>
            ) : (
              result.matchedPrograms.map(({ program: p, offerLTV }) => (
                <div key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: CREAM, fontWeight: 700, fontSize: "14px" }}>{p.name}</span>
                    <span style={{ color: MINT, fontFamily: "monospace", fontWeight: 700, fontSize: "13px" }}>
                      up to {offerLTV}% LTV
                    </span>
                  </div>
                  <p style={{ color: MINT, fontSize: "11px", marginTop: "2px" }}>{p.tagline}</p>
                  <p style={{ color: "#5a6b6b", fontSize: "11px", marginTop: "2px", lineHeight: 1.4 }}>
                    {p.features.slice(0, 2).join(" · ")}
                  </p>
                </div>
              ))
            )}
          </AnimatedCard>

          <div style={{ marginTop: "20px", padding: "14px 18px", background: "rgba(0,101,101,0.08)", borderRadius: "10px", border: "1px solid rgba(0,101,101,0.22)", fontSize: "12px", color: "#4a5d5d", lineHeight: 1.6 }}>
            <strong style={{ color: MINT }}>Want the full deal?</strong> Open the <a href="/dscr-calculator" style={{ color: MINT, fontWeight: 600 }}>DSCR Calculator</a> for a Track 1/Track 2 breakdown, or run the <a href="/decision-support" style={{ color: MINT, fontWeight: 600 }}>Decision Support</a> tool for an IC-memo-grade verdict.
          </div>
        </div>
      </div>
    </PageShell>
  );
}