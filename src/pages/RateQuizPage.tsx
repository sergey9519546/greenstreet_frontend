import React, { useState, useMemo } from "react";
import { swatch } from "../theme";
import { DSCR_PROGRAMS } from "../data/dscrPrograms";

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
  const [dscr, setDscr] = useState(1.20);
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
    if (dscr < 1.00) baseRate += 0.375;
    else if (dscr < 1.10) baseRate += 0.125;

    if (state === "NJ" || state === "NY" || state === "MD" || state === "KS") baseRate += 0.25;
    if (state === "MN" || state === "PA" || state === "OH") baseRate += 0.10;

    const tier = baseRate <= 6.50 ? "BEST" : baseRate <= 7.00 ? "GOOD" : baseRate <= 7.75 ? "TYPICAL" : "WEAK";
    const tierColor = tier === "BEST" ? MINT : tier === "GOOD" ? YELLOW : tier === "TYPICAL" ? "#018582" : "#ff6b6b";

    const eligible = [
      fico >= 620 && ltv <= 85,
      state !== "MD" && state !== "KS",
      isSTR ? (state !== "NJ" || fico >= 700) : true,
    ].every(Boolean);

    const tierInfo = {
      BEST: "Top-tier pricing. 740+ FICO / ≤75% LTV sweet spot — Greenstreet's lowest rate tier.",
      GOOD: "Solid pricing. Most files land here; a little more FICO or a lower LTV moves you into best pricing.",
      TYPICAL: "Workable. Strong reserves or a shorter prepay penalty can sharpen the rate from here.",
      WEAK: "Tighter file. Greenstreet goes sub-1.0 to 620 FICO with compensating factors — otherwise, build credit and re-quote.",
    }[tier];

    // Filter real programs by FICO eligibility + LTV capacity + DSCR tier availability
    const matchedPrograms = DSCR_PROGRAMS.filter((p) => {
      if (fico < p.minFICO) return false;
      if (p.maxLTV < ltv) return false;
      if (isSTR && !p.isSTR) return false;
      // check a DSCR tier exists for this DSCR
      if (dscr < 1.0 && p.dscrFloor > dscr && !p.noRatio) return false;
      return true;
    });

    return { baseRate, tier, tierColor, eligible, tierInfo, matchedPrograms };
  }, [fico, propertyType, ltv, dscr, state, isSTR]);

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
      sub: "Greenstreet prices best at 75% LTV or below. Above 80% needs a strong file (740+ FICO, DSCR ≥ 1.0).",
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
      q: "What's the deal DSCR?",
      sub: "Gross rent ÷ PITIA. Sub-1.0 deals are eligible — they price higher. Use 1.00 if you don't know yet.",
      control: (
        <PremiumSlider
          label="Deal DSCR"
          min={0.50}
          max={1.50}
          step={0.05}
          value={dscr}
          onChange={setDscr}
          formatValue={(val) => val.toFixed(2) + "x"}
          ticks={[0.75, 1.00, 1.10, 1.25, 1.50]}
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
      subtitle="Five quick questions. Get a realistic rate tier and the Greenstreet programs your deal qualifies for. No email, no signup."
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
            {result.matchedPrograms.length === 0 ? (
              <p style={{ color: "#5a6b6b", fontSize: "13px", lineHeight: 1.6 }}>
                No standard program fits {fico} FICO / {ltv}% LTV / {dscr.toFixed(2)}x DSCR.
                Adjust parameters or speak with a specialist — exceptions exist.
              </p>
            ) : (
              result.matchedPrograms.map((p) => (
                <div key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
                  <div style={{ color: MINT, fontWeight: 700, fontSize: "14px" }}>{p.name}</div>
                  <div style={{ color: "#4a5d5d", fontSize: "12px", marginTop: "2px" }}>{p.tagline}</div>
                  <div style={{ color: "#647474", fontSize: "11px", marginTop: "2px" }}>
                    {p.features.slice(0, 2).join(" · ")}
                  </div>
                </div>
              ))
            )}
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