// @ts-nocheck
import React, { useState } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";

const MINT = "#006565";
const CREAM = "#003738";
const YELLOW = "#8a6d00";

function paymentFactor(annualRate: number) {
  const r = annualRate / 12;
  if (r === 0) return 0;
  return (r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
}

function fmt(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

function DSCRCalc() {
  const [price, setPrice] = useState(425000);
  const [down, setDown] = useState(25);
  const [rent, setRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [tax, setTax] = useState(5000);
  const [ins, setIns] = useState(2000);
  const [hoa, setHoa] = useState(0);
  const [loanType, setLoanType] = useState<"30yr" | "io">("30yr");

  const loan = price * (1 - down / 100);
  const pAndI = loanType === "30yr"
    ? loan * paymentFactor(rate / 100)
    : loan * (rate / 100 / 12); // IO
  const pitia = pAndI + tax / 12 + ins / 12 + hoa;
  const dscr = pitia > 0 ? rent / pitia : 0;
  const cashFlow = rent - pitia;

  let verdict = { label: "BELOW FLOOR", bg: "#4a1515", border: "#ff6b6b", text: "Most lenders require DSCR ≥ 0.75. Restructure or decline." };
  if (dscr >= 1.20) verdict = { label: "GREEN DEAL", bg: "rgba(0,101,101,0.12)", border: MINT, text: "Strong cushion. Qualifies with most DSCR lenders." };
  else if (dscr >= 1.00) verdict = { label: "QUALIFIES", bg: "rgba(216,217,88,0.1)", border: YELLOW, text: "Meets the 1.00 floor. Verify lender minimums." };
  else if (dscr >= 0.75) verdict = { label: "SUB-1.0", bg: "rgba(1,133,130,0.2)", border: "#018582", text: "Some lenders accept to 0.75 with compensating factors (FICO, reserves)." };

  const inp: React.CSSProperties = {
    background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)",
    color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "15px", width: "100%", outline: "none",
  };
  const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
      {/* Inputs */}
      <div>
        <div style={{ marginBottom: "20px" }}>
          <label style={lbl}>Purchase Price</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: CREAM }}>$</span>
            <input style={inp} type="number" value={price} onChange={e => setPrice(+e.target.value)} step={5000} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={lbl}>Down Payment ({down}% → {fmt(price * down / 100)})</label>
          <input type="range" min={20} max={50} step={5} value={down} onChange={e => setDown(+e.target.value)} style={{ width: "100%", accentColor: MINT }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: "#6a7a7a", fontSize: "11px" }}>
            {[20,25,30,35,40,45,50].map(v => <span key={v}>{v}%</span>)}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={lbl}>Monthly Rent (1007 qualifying income)</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: CREAM }}>$</span>
            <input style={inp} type="number" value={rent} onChange={e => setRent(+e.target.value)} step={100} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={lbl}>Note Rate ({rate.toFixed(3)}%)</label>
          <input type="range" min={6} max={11} step={0.125} value={rate} onChange={e => setRate(+e.target.value)} style={{ width: "100%", accentColor: MINT }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: "#6a7a7a", fontSize: "11px" }}>
            {[6,7,8,9,10,11].map(v => <span key={v}>{v}%</span>)}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={lbl}>Loan Structure</label>
          <div style={{ display: "flex", gap: "12px" }}>
            {(["30yr","io"] as const).map(t => (
              <button key={t} onClick={() => setLoanType(t)} style={{
                padding: "8px 20px", borderRadius: "8px", border: "1px solid",
                borderColor: loanType === t ? MINT : "rgba(0,55,56,0.22)",
                background: loanType === t ? "rgba(0,101,101,0.12)" : "transparent",
                color: loanType === t ? MINT : "#4a5d5d", cursor: "pointer", fontSize: "14px",
              }}>
                {t === "30yr" ? "30yr Fixed" : "Interest-Only"}
              </button>
            ))}
          </div>
          {loanType === "io" && <p style={{ color: "#4a5d5d", fontSize: "12px", marginTop: "6px" }}>IO lowers monthly payment ~15–22% vs amortizing. Qualifies at ITIA = IO + tax + ins + HOA.</p>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[
            ["Annual Tax $", tax, (v: number) => setTax(v), 500],
            ["Annual Ins. $", ins, (v: number) => setIns(v), 250],
            ["Monthly HOA $", hoa, (v: number) => setHoa(v), 50],
          ].map(([l, val, fn, step]) => (
            <div key={l as string}>
              <label style={{ ...lbl, fontSize: "10px" }}>{l as string}</label>
              <input style={{ ...inp, fontSize: "13px" }} type="number" value={val as number} onChange={e => (fn as Function)(+e.target.value)} step={step as number} />
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <div style={{ ...card, border: `1px solid ${verdict.border}`, background: verdict.bg, textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "72px", fontWeight: 800, color: CREAM, lineHeight: 1 }}>{dscr.toFixed(2)}x</div>
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: verdict.border, margin: "8px 0" }}>{verdict.label}</div>
          <div style={{ fontSize: "14px", color: "#4a5d5d" }}>{verdict.text}</div>
        </div>

        <div style={card}>
          <div style={sectionTitle}>PITIA Breakdown</div>
          {[
            ["Loan Amount", fmt(loan)],
            [loanType === "30yr" ? "P&I (30yr)" : "Interest Only", fmt(pAndI)],
            ["Property Tax /mo", fmt(tax / 12)],
            ["Insurance /mo", fmt(ins / 12)],
            ["HOA /mo", fmt(hoa)],
            ["━━ Total PITIA", fmt(pitia)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", fontSize: "14px" }}>
              <span style={{ color: k.startsWith("━") ? CREAM : "#5a6b6b", fontWeight: k.startsWith("━") ? 700 : 400 }}>{k.replace("━━ ","")}</span>
              <span style={{ color: CREAM, fontWeight: k.startsWith("━") ? 700 : 400 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "15px" }}>
            <span style={{ color: "#5a6b6b" }}>Monthly cash flow (T2 est.)</span>
            <span style={{ color: cashFlow >= 0 ? MINT : "#ff6b6b", fontWeight: 700 }}>
              {cashFlow >= 0 ? "+" : ""}{fmt(cashFlow)}
            </span>
          </div>
        </div>

        <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(0,101,101,0.08)", borderRadius: "10px", border: "1px solid rgba(0,101,101,0.22)", fontSize: "12px", color: "#4a5d5d", lineHeight: 1.6 }}>
          <strong style={{ color: MINT }}>Formula (Track 1):</strong> DSCR = Rent ÷ PITIA &nbsp;·&nbsp;
          P&I = Loan × [r(1+r)³⁶⁰ / ((1+r)³⁶⁰ − 1)], r = rate/12 &nbsp;·&nbsp;
          Track 1 uses full 1007 rent, no vacancy haircut. Track 2 applies 8% vacancy + 8% mgmt.
        </div>
      </div>
    </div>
  );
}

function MaxPurchaseCalc() {
  const [rent, setRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [down, setDown] = useState(25);
  const [tax, setTax] = useState(5000);
  const [ins, setIns] = useState(2000);
  const [targetDSCR, setTargetDSCR] = useState(1.10);

  const maxPITIA = rent / targetDSCR;
  const maxPI = maxPITIA - tax / 12 - ins / 12;
  const factor = paymentFactor(rate / 100);
  const maxLoan = factor > 0 ? maxPI / factor : 0;
  const maxPrice = maxLoan / (1 - down / 100);

  const inp: React.CSSProperties = { background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "15px", width: "100%", outline: "none" };
  const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "6px" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
      <div>
        {[
          ["Monthly Rent $", rent, setRent, 100],
          ["Annual Tax $", tax, setTax, 500],
          ["Annual Insurance $", ins, setIns, 250],
        ].map(([l, val, fn, step]) => (
          <div key={l as string} style={{ marginBottom: "16px" }}>
            <label style={lbl}>{l as string}</label>
            <input style={inp} type="number" value={val as number} onChange={e => (fn as Function)(+e.target.value)} step={step as number} />
          </div>
        ))}
        <div style={{ marginBottom: "16px" }}>
          <label style={lbl}>Note Rate ({rate.toFixed(3)}%)</label>
          <input type="range" min={6} max={11} step={0.125} value={rate} onChange={e => setRate(+e.target.value)} style={{ width: "100%", accentColor: MINT }} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={lbl}>Down Payment ({down}%)</label>
          <input type="range" min={20} max={50} step={5} value={down} onChange={e => setDown(+e.target.value)} style={{ width: "100%", accentColor: MINT }} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={lbl}>Target DSCR ({targetDSCR.toFixed(2)}x)</label>
          <input type="range" min={0.75} max={1.50} step={0.05} value={targetDSCR} onChange={e => setTargetDSCR(+e.target.value)} style={{ width: "100%", accentColor: MINT }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: "#6a7a7a", fontSize: "11px" }}>
            <span>0.75 (min)</span><span>1.00</span><span>1.25</span><span>1.50</span>
          </div>
        </div>
      </div>
      <div>
        <div style={{ ...card, textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT, marginBottom: "12px" }}>Max Purchase Price</div>
          <div style={{ fontSize: "56px", fontWeight: 800, color: CREAM }}>{fmt(maxPrice)}</div>
          <div style={{ color: "#5a6b6b", fontSize: "14px", marginTop: "8px" }}>at {targetDSCR.toFixed(2)}x DSCR target · {rate.toFixed(3)}% · {down}% down</div>
        </div>
        <div style={card}>
          {[
            ["Max Loan Amount", fmt(maxLoan)],
            ["Down Payment", fmt(maxPrice - maxLoan)],
            ["Max P&I /mo", fmt(maxPI)],
            ["Max PITIA /mo", fmt(maxPITIA)],
            ["Qualifying rent", fmt(rent)],
          ].map(([k,v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,55,56,0.1)", fontSize: "14px" }}>
              <span style={{ color: "#5a6b6b" }}>{k}</span><span style={{ color: CREAM }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DSCRCalculatorPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [activeCalc, setActiveCalc] = useState<"dscr"|"maxprice">("dscr");
  const tabs = [{ id: "dscr", label: "DSCR Calculator" }, { id: "maxprice", label: "Max Purchase Price" }];

  return (
    <PageShell
      title="DSCR Calculators"
      subtitle="Run the numbers before you run the deal. The math here matches what lender Track 1 actually qualifies against."
      onBack={onBack} onNavigate={onNavigate}
    >
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "40px", borderBottom: "1px solid rgba(0,55,56,0.15)", paddingBottom: "0" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveCalc(t.id as any)} style={{
            padding: "10px 20px", background: "none", border: "none",
            borderBottom: `2px solid ${activeCalc === t.id ? MINT : "transparent"}`,
            color: activeCalc === t.id ? MINT : "#5a6b6b",
            cursor: "pointer", fontSize: "14px", fontWeight: 600,
            fontFamily: "Outfit, sans-serif", marginBottom: "-1px",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeCalc === "dscr" && <DSCRCalc />}
      {activeCalc === "maxprice" && <MaxPurchaseCalc />}

      {/* DSCR buckets reference */}
      <div style={{ marginTop: "60px" }}>
        <div style={sectionTitle}>DSCR Threshold Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px" }}>
          {[
            { range: "< 0.75x", label: "No-Go", color: "#ff6b6b", desc: "Below all lender floors" },
            { range: "0.75–0.99x", label: "Sub-1.0", color: "#018582", desc: "Visio Flex, Griffin, Defy" },
            { range: "1.00–1.09x", label: "Minimum", color: YELLOW, desc: "Qualifies at 1.00 floor" },
            { range: "1.10–1.24x", label: "Standard", color: CREAM, desc: "Typical qualifying range" },
            { range: "1.25x+", label: "Strong", color: MINT, desc: "Best rates, 3 mo reserves" },
          ].map(b => (
            <div key={b.label} style={{ ...card, textAlign: "center" }}>
              <div style={{ color: b.color, fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>{b.range}</div>
              <div style={{ color: b.color, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>{b.label}</div>
              <div style={{ color: "#777", fontSize: "12px" }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
