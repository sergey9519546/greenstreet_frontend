import React, { useState } from "react";
import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
  AnimatedNumber,
  PremiumInput,
  PremiumSlider,
} from "./PageShell";
import { swatch } from "../theme";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

function paymentFactor(annualRate: number) {
  const r = annualRate / 12;
  if (r === 0) return 0;
  return (r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1);
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

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

  let verdict = {
    label: "BELOW FLOOR",
    bg: "#4a151522",
    border: "#ff6b6b",
    text: "Most lenders require DSCR ≥ 0.75. Restructure or decline.",
  };
  if (dscr >= 1.20) {
    verdict = {
      label: "GREEN DEAL",
      bg: "rgba(0,101,101,0.06)",
      border: MINT,
      text: "Strong cushion. Qualifies with most DSCR lenders.",
    };
  } else if (dscr >= 1.00) {
    verdict = {
      label: "QUALIFIES",
      bg: "rgba(216,217,88,0.06)",
      border: YELLOW,
      text: "Meets the 1.00 floor. Verify lender minimums.",
    };
  } else if (dscr >= 0.75) {
    verdict = {
      label: "SUB-1.0",
      bg: "rgba(1,133,130,0.08)",
      border: "#018582",
      text: "Some lenders accept to 0.75 with compensating factors (FICO, reserves).",
    };
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
      {/* Inputs */}
      <AnimatedCard themeName="light" hoverScale={false}>
        <div style={{ marginBottom: "20px" }}>
          <PremiumInput
            label="Purchase Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
            step={5000}
            prefixSymbol="$"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <PremiumSlider
            label={`Down Payment (${down}% → ${fmt((price * down) / 100)})`}
            min={20}
            max={50}
            step={5}
            value={down}
            onChange={setDown}
            ticks={[20, 25, 30, 35, 40, 45, 50]}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <PremiumInput
            label="Monthly Rent (1007 qualifying income)"
            type="number"
            value={rent}
            onChange={(e) => setRent(+e.target.value)}
            step={100}
            prefixSymbol="$"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <PremiumSlider
            label={`Note Rate (${rate.toFixed(3)}%)`}
            min={6}
            max={11}
            step={0.125}
            value={rate}
            onChange={setRate}
            ticks={[6, 7, 8, 9, 10, 11]}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: swatch.rainforest,
              marginBottom: "8px",
            }}
          >
            Loan Structure
          </span>
          <div style={{ display: "flex", gap: "12px" }}>
            {(["30yr", "io"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setLoanType(t)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: loanType === t ? MINT : "rgba(0,55,56,0.22)",
                  background: loanType === t ? "rgba(0,101,101,0.12)" : "transparent",
                  color: loanType === t ? MINT : swatch.midnight,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                {t === "30yr" ? "30yr Fixed" : "Interest-Only"}
              </button>
            ))}
          </div>
          {loanType === "io" && (
            <p style={{ color: "rgba(0,55,56,0.7)", fontSize: "12px", marginTop: "8px", lineHeight: 1.5 }}>
              IO lowers monthly payment ~15–22% vs amortizing. Qualifies at ITIA = IO + tax + ins + HOA.
            </p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <PremiumInput
            label="Annual Tax"
            type="number"
            value={tax}
            onChange={(e) => setTax(+e.target.value)}
            step={500}
            prefixSymbol="$"
          />
          <PremiumInput
            label="Annual Ins."
            type="number"
            value={ins}
            onChange={(e) => setIns(+e.target.value)}
            step={250}
            prefixSymbol="$"
          />
          <PremiumInput
            label="Monthly HOA"
            type="number"
            value={hoa}
            onChange={(e) => setHoa(+e.target.value)}
            step={50}
            prefixSymbol="$"
          />
        </div>
      </AnimatedCard>

      {/* Results */}
      <div>
        <AnimatedCard
          style={{
            border: `1px solid ${verdict.border}`,
            background: verdict.bg,
            textAlign: "center",
            marginBottom: "20px",
          }}
          hoverScale={false}
        >
          <div style={{ fontSize: "72px", fontWeight: 800, color: CREAM, lineHeight: 1 }}>
            <AnimatedNumber value={dscr} format={(v) => v.toFixed(2) + "x"} />
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: verdict.border,
              margin: "8px 0",
            }}
          >
            {verdict.label}
          </div>
          <div style={{ fontSize: "14px", color: "rgba(0,55,56,0.8)" }}>{verdict.text}</div>
        </AnimatedCard>

        <AnimatedCard themeName="light" hoverScale={false}>
          <div style={sectionTitle}>PITIA Breakdown</div>
          {([
            ["Loan Amount", loan],
            [loanType === "30yr" ? "P&I (30yr)" : "Interest Only", pAndI],
            ["Property Tax /mo", tax / 12],
            ["Insurance /mo", ins / 12],
            ["HOA /mo", hoa],
            ["━━ Total PITIA", pitia],
          ] as [string, number][]).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid rgba(0,55,56,0.1)",
                fontSize: "14px",
              }}
            >
              <span style={{ color: k.startsWith("━") ? CREAM : "rgba(0,55,56,0.7)", fontWeight: k.startsWith("━") ? 700 : 400 }}>
                {k.replace("━━ ", "")}
              </span>
              <span style={{ color: CREAM, fontWeight: k.startsWith("━") ? 700 : 400 }}>
                <AnimatedNumber value={v} format={fmt} />
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "15px" }}>
            <span style={{ color: "rgba(0,55,56,0.7)" }}>Monthly cash flow (T2 est.)</span>
            <span style={{ color: cashFlow >= 0 ? MINT : "#ff6b6b", fontWeight: 700 }}>
              <AnimatedNumber value={cashFlow} format={(v) => (v >= 0 ? "+" : "") + fmt(v)} />
            </span>
          </div>
        </AnimatedCard>

        <div
          style={{
            marginTop: "16px",
            padding: "14px 18px",
            background: "rgba(0,101,101,0.08)",
            borderRadius: "10px",
            border: "1px solid rgba(0,101,101,0.22)",
            fontSize: "12px",
            color: "rgba(0,55,56,0.7)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: MINT }}>Formula (Track 1):</strong> DSCR = Rent ÷ PITIA &nbsp;·&nbsp; P&I = Loan ×
          [r(1+r)³⁶⁰ / ((1+r)³⁶⁰ − 1)], r = rate/12 &nbsp;·&nbsp; Track 1 uses full 1007 rent, no vacancy haircut. Track
          2 applies 8% vacancy + 8% mgmt.
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
      <AnimatedCard themeName="light" hoverScale={false}>
        <PremiumInput
          label="Monthly Rent"
          type="number"
          value={rent}
          onChange={(e) => setRent(+e.target.value)}
          step={100}
          prefixSymbol="$"
        />
        <PremiumInput
          label="Annual Tax"
          type="number"
          value={tax}
          onChange={(e) => setTax(+e.target.value)}
          step={500}
          prefixSymbol="$"
        />
        <PremiumInput
          label="Annual Insurance"
          type="number"
          value={ins}
          onChange={(e) => setIns(+e.target.value)}
          step={250}
          prefixSymbol="$"
        />
        <PremiumSlider
          label={`Note Rate (${rate.toFixed(3)}%)`}
          min={6}
          max={11}
          step={0.125}
          value={rate}
          onChange={setRate}
        />
        <PremiumSlider
          label={`Down Payment (${down}%)`}
          min={20}
          max={50}
          step={5}
          value={down}
          onChange={setDown}
        />
        <PremiumSlider
          label={`Target DSCR (${targetDSCR.toFixed(2)}x)`}
          min={0.75}
          max={1.5}
          step={0.05}
          value={targetDSCR}
          onChange={setTargetDSCR}
          ticks={[0.75, 1.0, 1.25, 1.5]}
        />
      </AnimatedCard>

      <div>
        <AnimatedCard style={{ textAlign: "center", marginBottom: "20px" }} hoverScale={false}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: MINT,
              marginBottom: "12px",
            }}
          >
            Max Purchase Price
          </div>
          <div style={{ fontSize: "56px", fontWeight: 800, color: CREAM }}>
            <AnimatedNumber value={maxPrice} format={fmt} />
          </div>
          <div style={{ color: "#5a6b6b", fontSize: "14px", marginTop: "8px" }}>
            at {targetDSCR.toFixed(2)}x DSCR target · {rate.toFixed(3)}% · {down}% down
          </div>
        </AnimatedCard>

        <AnimatedCard themeName="light" hoverScale={false}>
          {([
            ["Max Loan Amount", maxLoan],
            ["Down Payment", maxPrice - maxLoan],
            ["Max P&I /mo", maxPI],
            ["Max PITIA /mo", maxPITIA],
            ["Qualifying rent", rent],
          ] as [string, number][]).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(0,55,56,0.1)",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#5a6b6b" }}>{k}</span>
              <span style={{ color: CREAM }}>
                <AnimatedNumber value={v} format={fmt} />
              </span>
            </div>
          ))}
        </AnimatedCard>
      </div>
    </div>
  );
}

export default function DSCRCalculatorPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  const [activeCalc, setActiveCalc] = useState<"dscr" | "maxprice">("dscr");
  const tabs = [
    { id: "dscr", label: "DSCR Calculator" },
    { id: "maxprice", label: "Max Purchase Price" },
  ];

  return (
    <PageShell
      title="DSCR Calculators"
      subtitle="Run the numbers before you run the deal. The math here matches what lender Track 1 actually qualifies against."
      onBack={onBack}
      onNavigate={onNavigate}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "40px",
          borderBottom: "1px solid rgba(0,55,56,0.15)",
          paddingBottom: "0",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveCalc(t.id as any)}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${activeCalc === t.id ? MINT : "transparent"}`,
              color: activeCalc === t.id ? MINT : "#5a6b6b",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "Outfit, sans-serif",
              marginBottom: "-1px",
              transition: "all 0.2s",
            }}
          >
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
            { range: "0.75–0.99x", label: "Sub-1.0", color: "#018582", desc: "Greenstreet DSCR 1-4 (sub-1.0)" },
            { range: "1.00–1.09x", label: "Minimum", color: YELLOW, desc: "Qualifies at 1.00 floor" },
            { range: "1.10–1.24x", label: "Standard", color: CREAM, desc: "Typical qualifying range" },
            { range: "1.25x+", label: "Strong", color: MINT, desc: "Best rates, 3 mo reserves" },
          ].map((b) => (
            <AnimatedCard key={b.label} style={{ textAlign: "center" }} hoverScale={true}>
              <div style={{ color: b.color, fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>{b.range}</div>
              <div
                style={{
                  color: b.color,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                {b.label}
              </div>
              <div style={{ color: "rgba(0,55,56,0.6)", fontSize: "12px" }}>{b.desc}</div>
            </AnimatedCard>
          ))}
        </div>
      </div>
  </PageShell>
  );
}
