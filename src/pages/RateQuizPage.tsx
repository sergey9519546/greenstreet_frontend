import React, { useState, useMemo } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
  AnimatedNumber,
  PremiumInput,
  PremiumSlider
} from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

export default function RateQuizPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [step, setStep] = useState(0);
  const [fico, setFico] = useState(740);
  const [propertyType, setPropertyType] = useState<"SFR" | "2-4 Unit" | "Condo" | "STR">("SFR");
  const [ltv, setLtv] = useState(75);
  const [state, setState] = useState("TX");
  const [isSTR, setIsSTR] = useState(false);

  const result = useMemo(() => {
    let baseRate = 7.0;
    if (fico >= 760) baseRate -= 0.50;
    else if (fico >= 740) baseRate -= 0.30;
    else if (fico >= 720) baseRate -= 0.15;
    else if (fico >= 700) baseRate -= 0.05;
    else if (fico >= 680) baseRate += 0.10;
    else if (fico >= 660) baseRate += 0.30;
    else if (fico >= 640) baseRate += 0.50;
    else baseRate += 0.80;

    if (ltv <= 70) baseRate -= 0.25;
    else if (ltv <= 75) baseRate -= 0.10;
    else if (ltv <= 80) baseRate += 0.10;
    else if (ltv <= 85) baseRate += 0.50;

    if (propertyType === "Condo") baseRate += 0.125;
    if (propertyType === "2-4 Unit") baseRate += 0.05;
    if (isSTR) baseRate += 0.20;

    if (state === "NJ" || state === "NY" || state === "MD" || state === "KS") baseRate += 0.25;
    if (state === "MN" || state === "PA" || state === "OH") baseRate += 0.10;

    const tier = baseRate <= 6.50 ? "BEST" : baseRate <= 7.00 ? "GOOD" : baseRate <= 7.75 ? "TYPICAL" : "WEAK";
    const tierColor = tier === "BEST" ? MINT : tier === "GOOD" ? YELLOW : tier === "TYPICAL" ? "#018582" : "#ff6b6b";

    const eligible = [
      fico >= 620 && ltv <= 80,
      state !== "MD" && state !== "KS",
      isSTR ? (state !== "NJ" || fico >= 700) : true,
    ].every(Boolean);

    const tierInfo = {
      BEST: "Top-tier pricing. You're at the 740+ FICO / ≤75% LTV sweet spot most lenders reserve their best rate sheet for.",
      GOOD: "Solid pricing. You'll see competitive quotes from Griffin, Visio, New Silver, and Rocket Pro TPO.",
      TYPICAL: "Workable, but not aggressive. You'll want to shop 3-4 lenders and possibly accept a smaller PPP for the rate.",
      WEAK: "Hard to qualify at most lenders. Consider Visio Flex (sub-1.0 DSCR), Griffin (640+ FICO), or wait for credit to improve.",
    }[tier];

    return { baseRate, tier, tierColor, eligible, tierInfo };
  }, [fico, propertyType, ltv, state, isSTR]);

  const questions = [
    {
      q: "What is the borrower's FICO?",
      sub: "Pull the middle of three scores. ITIN borrowers use the same range.",
      control: (
        <div>
          <PremiumSlider
            label="Borrower's FICO"
            min={580}
            max={850}
            step={5}
            value={fico}
            onChange={setFico}
            formatValue={(val) => String(val)}
          />
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(0, 55, 56, 0.4)", fontSize: "11px", marginTop: "-12px" }}>
            <span>580</span><span>660</span><span>700</span><span>740</span><span>780</span><span>850</span>
          </div>
        </div>
      ),
    },
    {
      q: "What type of property?",
      sub: "Condos and non-warrantable condos price +0.125%. STR adds another 0.20%.",
      control: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {(["SFR", "2-4 Unit", "Condo", "STR"] as const).map((t) => (
            <AnimatedButton
              key={t}
              showArrow={false}
              onClick={() => { setPropertyType(t); setIsSTR(t === "STR"); }}
              style={{
                padding: "16px", borderRadius: "10px", cursor: "pointer",
                border: `1px solid ${propertyType === t ? MINT : "rgba(0,55,56,0.22)"}`,
                background: propertyType === t ? "rgba(0,101,101,0.12)" : "transparent",
                color: propertyType === t ? MINT : "#4a5d5d", fontSize: "15px", fontWeight: 600,
              }}
            >
              {t}
            </AnimatedButton>
          ))}
        </div>
      ),
    },
    {
      q: "What's the LTV?",
      sub: "Standard pricing is best at 75% or below. Above 80% only Defy and a few others will quote.",
      control: (
        <PremiumSlider
          label="LTV"
          min={60}
          max={90}
          step={1}
          value={ltv}
          onChange={setLtv}
          formatValue={(val) => `${val}%`}
          ticks={[60, 70, 75, 80, 85, 90]}
        />
      ),
    },
    {
      q: "Which state is the property in?",
      sub: "NJ, NY, MD, KS add 0.25% for entity-only or restricted PPP workarounds.",
      control: (
        <PremiumInput
          type="text"
          maxLength={2}
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase())}
          placeholder="TX"
          style={{ fontWeight: 700 }}
        />
      ),
    },
  ];

  return (
    <PageShell
      title="Rate Quiz"
      subtitle="Four quick questions. We give you a realistic rate tier and the lender names behind it. No email, no signup."
      onBack={onBack} onNavigate={onNavigate}
    >
      {step < questions.length && (
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {questions.map((_, i) => (
              <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i <= step ? MINT : "rgba(0,55,56,0.15)" }} />
            ))}
          </div>
          <AnimatedCard hoverScale={false}>
            <div style={sectionTitle}>Question {step + 1} of {questions.length}</div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: CREAM, marginBottom: "8px", lineHeight: 1.2 }}>{questions[step].q}</h2>
            <p style={{ fontSize: "14px", color: "#4a5d5d", marginBottom: "24px", lineHeight: 1.5 }}>{questions[step].sub}</p>
            {questions[step].control}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
              <AnimatedButton
                showArrow={false}
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                style={{
                  background: "transparent", border: "1px solid rgba(0,55,56,0.22)", color: step === 0 ? "#6a7a7a" : CREAM,
                  borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: step === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Back
              </AnimatedButton>
              <AnimatedButton
                showArrow={true}
                onClick={() => setStep(Math.min(questions.length, step + 1))}
                style={{
                  background: MINT, color: "#002D2E", border: "none", borderRadius: "8px",
                  padding: "10px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
                }}
              >
                {step === questions.length - 1 ? "See my rate" : "Next"}
              </AnimatedButton>
            </div>
          </AnimatedCard>
        </div>
      )}

      {step >= questions.length && (
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <AnimatedCard hoverScale={true} style={{ borderColor: result.tierColor, textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MINT }}>Your Indicative Rate</div>
            <div style={{ fontSize: "72px", fontWeight: 800, color: result.tierColor, lineHeight: 1, marginTop: "8px" }}>
              <AnimatedNumber value={result.baseRate} format={(v) => `${v.toFixed(3)}%`} />
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: result.tierColor, margin: "8px 0 16px" }}>{result.tier} TIER</div>
            <p style={{ fontSize: "14px", color: "#4a5d5d", lineHeight: 1.6, marginBottom: "20px" }}>{result.tierInfo}</p>
            {!result.eligible && (
              <div style={{ background: "rgba(255,107,107,0.15)", border: "1px solid #ff6b6b", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <p style={{ fontSize: "13px", color: "#ff6b6b", fontWeight: 700 }}>Eligibility warning</p>
                <p style={{ fontSize: "12px", color: "#4a5d5d", marginTop: "4px" }}>This state/FICO/LTV combo won't qualify at most lenders. Talk to a specialist before locking a rate.</p>
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard hoverScale={true} style={{ marginTop: "20px" }}>
            <div style={sectionTitle}>Your Greenstreet Program Match</div>
            {[
              { name: "Greenstreet Premier", note: "Best rate tier — 740+ FICO, 1.25x+ DSCR, ≤75% LTV" },
              { name: "Greenstreet Core", note: "The everyday DSCR loan — 660 FICO, 1.00x DSCR, up to 80% LTV, to $4M" },
              { name: "Greenstreet Flex", note: "Sub-1.0 DSCR accepted down to 0.75x with compensating factors" },
              { name: "Greenstreet STR", note: "Airbnb / VRBO — AirDNA or 12-month history, STR legality checked" },
              { name: "Greenstreet Global", note: "Foreign national / ITIN — passport plus alternative credit, 30% down" },
            ].map((l) => (
              <div key={l.name} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                <div style={{ color: MINT, fontWeight: 700, fontSize: "14px" }}>{l.name}</div>
                <div style={{ color: "#4a5d5d", fontSize: "12px", marginTop: "2px" }}>{l.note}</div>
              </div>
            ))}
          </AnimatedCard>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <AnimatedButton
              showArrow={false}
              onClick={() => setStep(0)}
              style={{
                background: "transparent", border: "1px solid rgba(0,55,56,0.22)", color: CREAM,
                borderRadius: "8px", padding: "10px 24px", fontSize: "14px", cursor: "pointer"
              }}
            >
              Start over
            </AnimatedButton>
          </div>

          <p style={{ fontSize: "11px", color: "#647474", textAlign: "center", marginTop: "20px", lineHeight: 1.5 }}>
            Indicative only. Actual rates depend on DSCR, property condition, reserves, and lender overlays. This is not a rate lock or credit approval. June 2026 data.
          </p>
        </div>
      )}
    </PageShell>
  );
}