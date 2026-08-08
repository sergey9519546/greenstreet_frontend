// @ts-nocheck
import React, { useState, useCallback } from "react";

function paymentFactor(annualRate: number): number {
  const r = annualRate / 12;
  if (r === 0) return 0;
  return (r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
}

function fmtDollar(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function DSCRCalculatorSection() {
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct, setDownPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [annualTax, setAnnualTax] = useState(5000);
  const [annualIns, setAnnualIns] = useState(2000);
  const [monthlyHOA, setMonthlyHOA] = useState(0);

  const loanAmount = purchasePrice * (1 - downPct / 100);
  const pAndI = loanAmount * paymentFactor(rate / 100);
  const pitia = pAndI + annualTax / 12 + annualIns / 12 + monthlyHOA;
  const dscr = pitia > 0 ? monthlyRent / pitia : 0;
  const monthlyCashFlow = monthlyRent - pitia;

  let verdict: { label: string; color: string; bg: string; desc: string };
  if (dscr >= 1.20) {
    verdict = { label: "GREEN DEAL", color: "#003738", bg: "#4DBD97", desc: "Strong cushion. Most lenders qualify at this DSCR." };
  } else if (dscr >= 1.00) {
    verdict = { label: "QUALIFIES", color: "#003738", bg: "#D8D958", desc: "Meets the 1.00 floor. Thin cushion — check lender minimums." };
  } else if (dscr >= 0.75) {
    verdict = { label: "SUB-1.0 DSCR", color: "#EEEFD3", bg: "#018582", desc: "Some lenders accept down to 0.75 with compensating factors." };
  } else {
    verdict = { label: "BELOW FLOOR", color: "#EEEFD3", bg: "#002D2E", desc: "Most lenders require DSCR ≥ 0.75. Restructure the deal." };
  }

  const inp = {
    style: {
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.18)",
      color: "#EEEFD3",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "16px",
      width: "100%",
      outline: "none",
    } as React.CSSProperties,
  };

  const label: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#4DBD97",
    marginBottom: "6px",
  };

  const field: React.CSSProperties = { marginBottom: "20px" };

  return (
    <section style={{ background: "#002D2E", padding: "80px 0", fontFamily: "Outfit, sans-serif" }}>
      <div className="u-container">
        {/* Header */}
        <div style={{ marginBottom: "48px", maxWidth: "640px" }}>
          <h2 className="u-text-style-h2" style={{ color: "#EEEFD3", marginBottom: "12px" }}>
            Does your rental deal qualify?
          </h2>
          <p style={{ color: "#4DBD97", fontSize: "18px", lineHeight: 1.5 }}>
            Enter your numbers. The DSCR formula runs instantly — no sign-up, no spreadsheet.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
          {/* Inputs */}
          <div>
            <div style={field}>
              <label style={label}>Purchase Price</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#EEEFD3", fontSize: "18px" }}>$</span>
                <input
                  {...inp}
                  type="number"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  step={5000}
                />
              </div>
            </div>

            <div style={field}>
              <label style={label}>Down Payment ({downPct}%  →  {fmtDollar(purchasePrice * downPct / 100)})</label>
              <input
                type="range"
                min={20} max={50} step={5}
                value={downPct}
                onChange={e => setDownPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#4DBD97" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", marginTop: "4px" }}>
                <span>20%</span><span>25%</span><span>30%</span><span>35%</span><span>40%</span><span>45%</span><span>50%</span>
              </div>
            </div>

            <div style={field}>
              <label style={label}>Monthly Rent (1007 qualifying income)</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#EEEFD3", fontSize: "18px" }}>$</span>
                <input {...inp} type="number" value={monthlyRent} onChange={e => setMonthlyRent(Number(e.target.value))} step={100} />
              </div>
            </div>

            <div style={field}>
              <label style={label}>Note Rate ({rate.toFixed(2)}%)</label>
              <input
                type="range"
                min={6.0} max={11.0} step={0.125}
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#4DBD97" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px", marginTop: "4px" }}>
                <span>6%</span><span>7%</span><span>8%</span><span>9%</span><span>10%</span><span>11%</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div style={field}>
                <label style={label}>Annual Tax</label>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "#EEEFD3" }}>$</span>
                  <input {...inp} type="number" value={annualTax} onChange={e => setAnnualTax(Number(e.target.value))} step={500} />
                </div>
              </div>
              <div style={field}>
                <label style={label}>Annual Ins.</label>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "#EEEFD3" }}>$</span>
                  <input {...inp} type="number" value={annualIns} onChange={e => setAnnualIns(Number(e.target.value))} step={250} />
                </div>
              </div>
              <div style={field}>
                <label style={label}>Monthly HOA</label>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "#EEEFD3" }}>$</span>
                  <input {...inp} type="number" value={monthlyHOA} onChange={e => setMonthlyHOA(Number(e.target.value))} step={50} />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {/* DSCR Badge */}
            <div style={{
              background: verdict.bg,
              color: verdict.color,
              borderRadius: "16px",
              padding: "32px",
              marginBottom: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1, marginBottom: "8px" }}>
                {dscr.toFixed(2)}x
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                {verdict.label}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>{verdict.desc}</div>
            </div>

            {/* Breakdown */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ color: "#4DBD97", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                PITIA Breakdown
              </div>
              {[
                ["Loan Amount", fmtDollar(loanAmount)],
                ["P&I (30yr fixed)", fmtDollar(pAndI)],
                ["Property Tax /mo", fmtDollar(annualTax / 12)],
                ["Insurance /mo", fmtDollar(annualIns / 12)],
                ["HOA /mo", fmtDollar(monthlyHOA)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#EEEFD3", fontSize: "15px" }}>
                  <span style={{ color: "#aaa" }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px", color: "#EEEFD3", fontSize: "16px", fontWeight: 700 }}>
                <span>Total PITIA</span>
                <span>{fmtDollar(pitia)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", fontSize: "16px" }}>
                <span style={{ color: "#aaa" }}>Monthly cash flow (T2 est.)</span>
                <span style={{ color: monthlyCashFlow >= 0 ? "#4DBD97" : "#ff6b6b", fontWeight: 700 }}>
                  {monthlyCashFlow >= 0 ? "+" : ""}{fmtDollar(monthlyCashFlow)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "20px", padding: "16px", background: "rgba(77,189,151,0.1)", borderRadius: "10px", border: "1px solid rgba(77,189,151,0.25)" }}>
              <p style={{ color: "#4DBD97", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>
                <strong>Formula:</strong> DSCR = Monthly Rent ÷ PITIA &nbsp;·&nbsp; P&I = Loan × [r(1+r)³⁶⁰ / ((1+r)³⁶⁰ − 1)] &nbsp;·&nbsp; r = rate/12 &nbsp;·&nbsp; Track 1 uses full 1007 rent, no vacancy haircut.
              </p>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "16px",
                background: "#4DBD97",
                color: "#003738",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Get My Rate in 60 Seconds →
            </button>
          </div>
        </div>

        {/* Rate context */}
        <div style={{ marginTop: "48px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }}>
          {[
            { tier: "Best rate tier", range: "6.125 – 6.5%", qualifier: "740+ FICO · ≤75% LTV · DSCR ≥1.0", color: "#4DBD97" },
            { tier: "Typical file", range: "6.5 – 7.5%", qualifier: "Standard credit · 75–80% LTV", color: "#D8D958" },
            { tier: "Thin / non-prime", range: "7.5 – 10.75%", qualifier: "Low DSCR · STR · low FICO", color: "#aaa" },
          ].map(t => (
            <div key={t.tier} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ color: t.color, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>{t.tier}</div>
              <div style={{ color: "#EEEFD3", fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>{t.range}</div>
              <div style={{ color: "#aaa", fontSize: "13px" }}>{t.qualifier}</div>
            </div>
          ))}
        </div>
        <p style={{ color: "#555", fontSize: "12px", marginTop: "16px", textAlign: "center" }}>
          Rate ranges as of June 2026 · 30yr fixed DSCR · Source: Greenstreet Finance lender matrix · Not a rate lock or commitment
        </p>
      </div>
    </section>
  );
}
