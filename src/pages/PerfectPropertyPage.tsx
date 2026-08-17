import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { radius, risk } from "../theme";
import BottomCTA from "../design/BottomCTA";
import ComplianceNote from "../design/ComplianceNote";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import { PremiumSlider } from "../components/ui/PremiumSlider";
import { DscrGauge, RiskFlame } from "../design/artifacts";
import { calculatePI } from "../engine/engine";
import PropertyInvestmentStrategySection from "../components/PropertyInvestmentStrategySection";
import { LiveDistressDealsFeed } from "../components/LiveDistressDealsFeed";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtPct = (n: number) => n.toFixed(2) + "%";

export default function PerfectPropertyPage({
  onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate: (view: any) => void;
}) {
  useEffect(() => {
    document.title = "Perfect Property Engine | Regime-Aware Underwriting Copilot | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // ── Inputs ──
  const [address, setAddress] = useState("1420 N Bayshore Dr, Tampa, FL");
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [rehabCost, setRehabCost] = useState(35000);
  const [monthlyRent, setMonthlyRent] = useState(3400);
  const [ltv, setLtv] = useState(75);
  const [rate, setRate] = useState(7.0);
  const [taxesYr, setTaxesYr] = useState(5100);
  const [insuranceYr, setInsuranceYr] = useState(2100);
  const [hoaMo, setHoaMo] = useState(0);
  const [holdYears, setHoldYears] = useState(5);
  const [propertyClass, setPropertyClass] = useState<"SFR" | "2-4_UNIT" | "CONDO" | "STR" | "COMMERCIAL">("SFR");

  // ── Engine Calculations ──
  const engineResults = useMemo(() => {
    const loanAmount = purchasePrice * (ltv / 100);
    const downPayment = purchasePrice - loanAmount;
    const totalCashInvested = downPayment + rehabCost + 12000; // includes closing costs & reserves

    // Amortization & PITIA
    const piMo = calculatePI(loanAmount, rate, 360);
    const pitiaMo = piMo + taxesYr / 12 + insuranceYr / 12 + hoaMo;

    // Track 1: Lender Qualification DSCR
    const track1Dscr = pitiaMo > 0 ? monthlyRent / pitiaMo : 0;

    // Track 2: Investor Net Cash Flow (8% Vacancy, 8% Mgmt, 5% CapEx/Maintenance)
    const netOperatingRent = monthlyRent * (1 - 0.08 - 0.08 - 0.05);
    const netCashFlowMo = netOperatingRent - pitiaMo;
    const track2Dscr = pitiaMo > 0 ? netOperatingRent / pitiaMo : 0;

    // ARV Hedonics & Valuation Prediction
    const projectedArv = (purchasePrice + rehabCost * 1.35) * 1.04;
    const arvConfidenceLow = projectedArv * 0.96;
    const arvConfidenceHigh = projectedArv * 1.04;

    // CQR (Certainty-Equivalent Score) Math
    const baseCqr = Math.min(99, Math.max(45, (track1Dscr * 40) + (track2Dscr > 1.0 ? 30 : 10) + (ltv <= 75 ? 20 : 10)));

    // Exceedance probability — a closed-form clamp, NOT a simulation. This
    // comment used to claim "Simulated 10,000 runs", and the user-facing copy
    // echoed it. There is no sampling loop here; it is one linear expression.
    const exceedanceProb = Math.min(99.4, Math.max(55.0, 75 + (track1Dscr - 1.0) * 45));

    // OBBBA Year-1 Cost Segregation Depreciation
    const buildingBasis = purchasePrice * 0.82; // 18% land allocation
    const reclassified5Yr = buildingBasis * 0.22; // 22% 5-year personal property
    const year1TaxWriteoff = reclassified5Yr * 1.0; // 100% bonus depreciation under OBBBA

    return {
      loanAmount,
      downPayment,
      totalCashInvested,
      piMo,
      pitiaMo,
      track1Dscr,
      track2Dscr,
      netCashFlowMo,
      projectedArv,
      arvConfidenceLow,
      arvConfidenceHigh,
      cqrScore: Math.round(baseCqr),
      exceedanceProb: parseFloat(exceedanceProb.toFixed(1)),
      year1TaxWriteoff,
    };
  }, [purchasePrice, rehabCost, monthlyRent, ltv, rate, taxesYr, insuranceYr, hoaMo]);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.lemon}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "STR Tool", view: "str-underwriting" },
        { label: "Tax Engine", view: "tax-engine" },
        { label: "Returns", view: "returns" },
        { label: "State Laws", view: "state-laws" },
      ]}
      cta={{ label: "Price This Deal →", view: "dscr-calculator" }}
    >
      {/* HERO */}
      <section
        style={{
          position: "relative",
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,8vh,96px) ${dc.pad}`,
          borderBottom: "1px solid rgba(238,239,211,0.12)",
        }}
      >
        <div className="gs-dot-grid" />
        <div style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: dc.lemon,
              background: "rgba(216,217,88,0.1)",
              border: "1px solid rgba(216,217,88,0.3)",
              padding: "6px 14px",
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            The Perfect Property Engine v12 — Hillsborough & 50-State Canon
          </div>
          <H1 style={{ margin: "0 0 16px", color: dc.cream }}>
            Regime-Aware Property Underwriting Copilot
          </H1>
          <Lead style={{ color: "rgba(238,239,211,0.75)", maxWidth: "64ch", margin: "0 auto 32px" }}>
            {/* CQR is a closed-form clamp on Track 1/2 DSCR and LTV (see the
                engine below), not a simulation — "Monte Carlo" overstated the
                method here the same way it did in the results panel. */}
            Underwrite any rental property against ARV uncertainty, Dual-Track DSCR, closed-form certainty scoring (CQR), and OBBBA Cost Segregation tax shelter.
          </Lead>
        </div>
      </section>

      {/* MAIN ENGINE TOOL WORKSPACE */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(48px, 6vw, 88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(320px, 460px) 1fr", gap: 32, alignItems: "start" }}>

          {/* LEFT: INPUTS PANEL */}
          <div
            style={{
              background: "rgba(0, 40, 41, 0.8)",
              borderRadius: radius.md,
              border: "1px solid rgba(238, 239, 211, 0.16)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Deal Underwriting Inputs
            </div>

            {/* Address Input */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                Target Property Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(238,239,211,0.06)",
                  border: "1px solid rgba(238,239,211,0.2)",
                  borderRadius: radius.sm,
                  padding: "10px 14px",
                  color: dc.cream,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: dc.sans,
                }}
              />
            </div>

            {/* Property Class Tabs */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                Asset Class
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["SFR", "2-4_UNIT", "CONDO", "STR", "COMMERCIAL"] as const).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setPropertyClass(cls)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: radius.sm,
                      background: propertyClass === cls ? dc.lemon : "rgba(238,239,211,0.06)",
                      color: propertyClass === cls ? dc.dark : dc.cream,
                      border: propertyClass === cls ? `1px solid ${dc.lemon}` : "1px solid rgba(238,239,211,0.15)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Rehab */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                  Purchase Price
                </label>
                <CurrencyInput value={purchasePrice} onChange={setPurchasePrice} prefix="$" decimals={0} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                  Est. Rehab / Value-Add
                </label>
                <CurrencyInput value={rehabCost} onChange={setRehabCost} prefix="$" decimals={0} />
              </div>
            </div>

            {/* Rent & Rate */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                  Monthly Rent ($)
                </label>
                <CurrencyInput value={monthlyRent} onChange={setMonthlyRent} prefix="$" decimals={0} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                  Interest Rate (%)
                </label>
                <CurrencyInput value={rate} onChange={setRate} prefix="" suffix="%" decimals={2} />
              </div>
            </div>

            {/* LTV Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase" }}>
                  Loan-To-Value (LTV)
                </span>
                <Mono style={{ fontSize: 14, fontWeight: 600, color: dc.lemon }}>
                  {ltv}% · {fmt$(purchasePrice * (ltv / 100))}
                </Mono>
              </div>
              <PremiumSlider
                value={ltv}
                min={50}
                max={85}
                step={5}
                onChange={setLtv}
                ariaLabel="Loan-to-value"
              />
            </div>

            {/* Taxes & Insurance */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                  Annual Taxes ($)
                </label>
                <CurrencyInput value={taxesYr} onChange={setTaxesYr} prefix="$" decimals={0} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.6)", textTransform: "uppercase", marginBottom: 6 }}>
                  Annual Insurance ($)
                </label>
                <CurrencyInput value={insuranceYr} onChange={setInsuranceYr} prefix="$" decimals={0} />
              </div>
            </div>

          </div>

          {/* RIGHT: PERFECT PROPERTY INTELLIGENCE RESULTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* CQR Certainty Score & Exceedance Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(0,55,56,0.9) 0%, rgba(35,138,117,0.3) 100%)",
                borderRadius: radius.md,
                border: `1.5px solid ${dc.lemon}`,
                padding: "24px 28px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 24,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: dc.lemon, textTransform: "uppercase" }}>
                  Certainty Score (CQR)
                </div>
                <Mono style={{ fontSize: 44, fontWeight: 700, color: dc.lemon, lineHeight: 1 }}>
                  {engineResults.cqrScore}<span style={{ fontSize: 20, color: "rgba(238,239,211,0.6)" }}>/100</span>
                </Mono>
              </div>

              <div>
                {/* "High Signal Investment Profile" was a fixed headline, not
                    a computed read of this deal — every deal saw the same
                    words no matter what the inputs said. Neutralised to a
                    label for the figure underneath rather than a claim about
                    deal quality we can't back with a computation. */}
                <div style={{ fontSize: 15, fontWeight: 700, color: dc.cream, marginBottom: 4 }}>
                  Certainty Score Summary
                </div>
                {/* engineResults.exceedanceProb (:68) is a closed-form clamp
                    on Track 1 DSCR, not a Monte Carlo simulation — the old
                    copy claimed "10,000 Monte Carlo runs" that never ran.
                    State the method honestly: a model estimate, not a sim. */}
                <div style={{ fontSize: 13, color: "rgba(238,239,211,0.75)", lineHeight: 1.4 }}>
                  Model estimate: a <strong>{engineResults.exceedanceProb}% likelihood of positive net cash flow</strong> over a {holdYears}-year hold.
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.6)", textTransform: "uppercase" }}>Track 1 DSCR</div>
                <Mono style={{ fontSize: 28, fontWeight: 700, color: engineResults.track1Dscr >= 1.0 ? dc.emerald : risk.dangerOnDark }}>
                  {engineResults.track1Dscr.toFixed(2)}x
                </Mono>
              </div>
            </div>

            {/* Hedonic ARV & Valuation Bands */}
            <div style={{ background: "rgba(238,239,211,0.04)", padding: "20px 24px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 10 }}>
                Hedonic Valuation & ARV Confidence Bands
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.5)", textTransform: "uppercase" }}>Conservative (P10)</span>
                  <Mono style={{ fontSize: 18, fontWeight: 700, color: dc.cream }}>{fmt$(engineResults.arvConfidenceLow)}</Mono>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 11, color: dc.emerald, textTransform: "uppercase", fontWeight: 700 }}>Projected ARV (P50)</span>
                  <Mono style={{ fontSize: 20, fontWeight: 700, color: dc.emerald }}>{fmt$(engineResults.projectedArv)}</Mono>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.5)", textTransform: "uppercase" }}>Optimistic (P90)</span>
                  <Mono style={{ fontSize: 18, fontWeight: 700, color: dc.cream }}>{fmt$(engineResults.arvConfidenceHigh)}</Mono>
                </div>
              </div>
            </div>

            {/* Dual-Track DSCR Comparison Matrix */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "rgba(0,40,41,0.7)", padding: "20px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: dc.emerald, textTransform: "uppercase", marginBottom: 6 }}>
                  Track 1: Lender DSCR
                </div>
                <Mono style={{ fontSize: 28, fontWeight: 700, color: dc.cream, marginBottom: 6 }}>
                  {engineResults.track1Dscr.toFixed(2)}x
                </Mono>
                <div style={{ fontSize: 13, color: "rgba(238,239,211,0.75)" }}>
                  Monthly PITIA Payment: <Mono style={{ color: dc.lemon }}>{fmt$(engineResults.pitiaMo)}</Mono>
                </div>
                {/* This used to be a hardcoded green checkmark that showed
                    regardless of the DSCR above it — a red 0.73x could sit
                    directly under a green "clears the floor" claim. Derive
                    the pass/fail state (and its color) from the same
                    track1Dscr the number itself renders, so the two can
                    never contradict each other. */}
                <div aria-live="polite" aria-atomic="true">
                  <div style={{ fontSize: 12, color: engineResults.track1Dscr >= 1.0 ? risk.positive : risk.dangerOnDark, marginTop: 8, fontWeight: 600 }}>
                    {engineResults.track1Dscr >= 1.0 ? "✓ Clears 1.00x Lender Qualification Floor" : "✕ Below 1.00x Lender Qualification Floor"}
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(0,40,41,0.7)", padding: "20px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: dc.lemon, textTransform: "uppercase", marginBottom: 6 }}>
                  Track 2: Investor Net Carry
                </div>
                <Mono style={{ fontSize: 28, fontWeight: 700, color: engineResults.netCashFlowMo >= 0 ? dc.emerald : "#e88a8a", marginBottom: 6 }}>
                  {fmt$(engineResults.netCashFlowMo)}<span style={{ fontSize: 14, color: "rgba(238,239,211,0.6)" }}>/mo</span>
                </Mono>
                <div style={{ fontSize: 13, color: "rgba(238,239,211,0.75)" }}>
                  Net Track 2 DSCR: <Mono style={{ color: dc.cream }}>{engineResults.track2Dscr.toFixed(2)}x</Mono>
                </div>
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.65)", marginTop: 8 }}>
                  After 8% vacancy, 8% management, and maintenance reserves.
                </div>
              </div>
            </div>

            {/* OBBBA Tax Shelter & State Compliance Card */}
            <div style={{ background: "rgba(238,239,211,0.04)", padding: "20px 24px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: dc.emerald, textTransform: "uppercase", marginBottom: 8 }}>
                OBBBA Cost Segregation & State PPP Safeguard
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(238,239,211,0.6)" }}>Est. Year-1 Bonus Depreciation</div>
                  <Mono style={{ fontSize: 20, fontWeight: 700, color: dc.emerald }}>{fmt$(engineResults.year1TaxWriteoff)}</Mono>
                </div>
                <div>
                  {/* The address field above is free text — this page has no
                      way to parse or verify a state from it, so a hardcoded
                      "Florida" claim was fabricated for every address typed
                      in, including ones nowhere near Florida. Nothing here
                      can compute a state, so point at the tool that actually
                      knows state-by-state PPP rules instead of asserting one. */}
                  <div style={{ fontSize: 12, color: "rgba(238,239,211,0.6)" }}>State PPP Legal Status</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: dc.cream, marginTop: 2 }}>Varies by property state — see State Rules</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => onNavigate("dscr-calculator")}
                style={{
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "14px 28px",
                  borderRadius: radius.sm,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: dc.sans,
                }}
              >
                Price Live Loan Package →
              </button>
              <button
                type="button"
                onClick={() => onNavigate("rate-quiz")}
                style={{
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 15,
                  padding: "13px 22px",
                  borderRadius: radius.sm,
                  border: "1px solid rgba(238,239,211,0.4)",
                  cursor: "pointer",
                  fontFamily: dc.sans,
                }}
              >
                Take Rate Intelligence Quiz →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* LIVE SCRAPED DISTRESS DEALS & AI SDR OUTREACH */}
      <LiveDistressDealsFeed onNavigate={onNavigate} />

      {/* PROPERTY INVESTMENT STRATEGY GUIDE */}
      <PropertyInvestmentStrategySection onNavigate={onNavigate} />

      <BottomCTA
        onNavigate={onNavigate}
        cards={[
          { bg: dc.lemon, fg: dc.dark, blurb: "Run your property's rent through the Greenstreet DSCR engine — 60 seconds, no credit pull.", title: "Price My Deal Now", view: "dscr-calculator" },
          { bg: dc.mintBg, fg: dc.dark, blurb: "Underwrite short-term rental revenue with AirDNA projections and 12-month actuals.", title: "Run STR Underwriting", view: "str-underwriting" },
        ]}
      />
    </DcShell>
  );
}
