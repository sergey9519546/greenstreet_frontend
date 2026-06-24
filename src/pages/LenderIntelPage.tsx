import React, { useState } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
  PremiumSlider,
} from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;
const FADED = swatch.midnightFaded;
const EMERALD = swatch.emerald;
const DARK = swatch.darkTeal;
const AS_OF = "Jun 22, 2026";

// Greenstreet's own DSCR program lineup. One application, six programs —
// the deal parameters below route to the right one. Greenstreet underwrites
// and funds these directly; this is not a referral to outside lenders.
type Program = {
  name: string;
  tier: string;
  tierColor: string;
  minFICO: number | null;
  minDSCR: number | null;
  maxLTV: number;
  states: string;
  isSTR?: boolean;
  special: string;
};

const PROGRAMS: Program[] = [
  { name: "Greenstreet Premier", tier: "Best rate", tierColor: MINT, minFICO: 740, minDSCR: 1.25, maxLTV: 75, states: "All 50 + DC", special: "Our lowest rate tier for strong files. 740+ FICO, 1.25x+ DSCR, ≤75% LTV, three months reserves. 30-yr fixed or interest-only." },
  { name: "Greenstreet Core", tier: "Standard", tierColor: DARK, minFICO: 660, minDSCR: 1.00, maxLTV: 80, states: "All 50 + DC", special: "The everyday DSCR loan for buy-and-hold SFR and 2–4 units. 30-yr fixed, 40-yr interest-only, and ARM options. Loans to $4M." },
  { name: "Greenstreet Flex", tier: "Sub-1.0", tierColor: YELLOW, minFICO: 640, minDSCR: 0.75, maxLTV: 75, states: "All 50 + DC", special: "For tighter cash flow. Qualifies down to 0.75x DSCR with compensating factors — FICO, reserves, or a larger down payment." },
  { name: "Greenstreet STR", tier: "Short-term rental", tierColor: EMERALD, minFICO: 660, minDSCR: 0.90, maxLTV: 75, states: "All 50 + DC", isSTR: true, special: "Airbnb & VRBO. AirDNA projections or a 12-month operating history accepted. STR legality pre-checked in all 50 states." },
  { name: "Greenstreet Portfolio", tier: "5+ doors", tierColor: MINT, minFICO: 680, minDSCR: 1.10, maxLTV: 75, states: "All 50 + DC", special: "Blanket and cross-collateralized loans for portfolios. Five to ten-plus financed properties under one loan. Interest-only available." },
  { name: "Greenstreet Global", tier: "Foreign national / ITIN", tierColor: DARK, minFICO: null, minDSCR: 1.00, maxLTV: 70, states: "All 50 + DC", special: "No SSN required. Passport plus alternative credit, 30% down. Built for international and ITIN investors." },
];

export default function LenderIntelPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  const [minFICO, setMinFICO] = useState(680);
  const [minDSCR, setMinDSCR] = useState(1.00);
  const [maxLTV, setMaxLTV] = useState(75);
  const [needsSTR, setNeedsSTR] = useState(false);

  const filtered = PROGRAMS.filter(p => {
    if (p.minFICO && p.minFICO > minFICO) return false;
    if (p.minDSCR !== null && p.minDSCR > minDSCR) return false;
    if (p.maxLTV < maxLTV) return false;
    if (needsSTR && !p.isSTR) return false;
    return true;
  });

  return (
    <PageShell
      title="Greenstreet DSCR Programs"
      subtitle={`Six DSCR programs, one application. Set your deal parameters and see exactly which Greenstreet program fits — Premier, Core, Flex, STR, Portfolio, or Global. Underwritten and funded in-house.`}
      onBack={onBack} onNavigate={onNavigate}
    >
      {/* Filters */}
      <AnimatedCard hoverScale={false} style={{ marginBottom: "40px" }}>
        <div style={sectionTitle}>Match Your Deal to a Program</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "32px", alignItems: "end" }}>
          <PremiumSlider
            label="Borrower FICO"
            min={620}
            max={800}
            step={20}
            value={minFICO}
            onChange={setMinFICO}
            formatValue={(val) => String(val)}
            ticks={[620, 680, 720, 760, 800]}
          />
          <PremiumSlider
            label="Deal DSCR"
            min={0.75}
            max={1.50}
            step={0.05}
            value={minDSCR}
            onChange={setMinDSCR}
            formatValue={(val) => val.toFixed(2) + "x"}
            ticks={[0.75, 1.00, 1.25, 1.50]}
          />
          <PremiumSlider
            label="Needed LTV"
            min={65}
            max={85}
            step={5}
            value={maxLTV}
            onChange={setMaxLTV}
            formatValue={(val) => val + "%"}
            ticks={[65, 70, 75, 80, 85]}
          />
          <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MINT, marginBottom: "8px" }}>
              Property Type
            </span>
            <AnimatedButton
              type="button"
              variant={needsSTR ? "primary" : "secondary"}
              showArrow={false}
              onClick={() => setNeedsSTR(!needsSTR)}
              style={{ width: "100%", height: "46px" }}
            >
              {needsSTR ? "✓ STR Only" : "STR / Airbnb?"}
            </AnimatedButton>
            <div style={{ height: "15px" }} />
          </div>
        </div>
      </AnimatedCard>

      {/* Results */}
      <div style={{ marginBottom: "12px", color: "#5a6b6b", fontSize: "13px" }}>
        {filtered.length} Greenstreet program{filtered.length !== 1 ? "s" : ""} fit your deal
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map(p => (
          <AnimatedCard key={p.name} hoverScale={true} style={{ display: "grid", gridTemplateColumns: "210px 1fr auto", gap: "24px", alignItems: "center" }}>
            <div>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{p.name}</div>
              <div style={{ color: "#5a6b6b", fontSize: "12px" }}>{p.states}</div>
              <div style={{
                marginTop: "6px", fontSize: "10px", fontFamily: "JetBrains Mono, monospace",
                color: EMERALD, fontWeight: 700,
                paddingTop: "6px", borderTop: `1px dashed ${FADED}`,
              }}>
                ✓ underwritten + funded by Greenstreet
              </div>
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Min FICO</div>
                <div style={{ color: CREAM, fontWeight: 600 }}>{p.minFICO ?? "—"}</div>
              </div>
              <div>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Min DSCR</div>
                <div style={{ color: CREAM, fontWeight: 600 }}>{p.minDSCR !== null ? p.minDSCR.toFixed(2) + "x" : "None"}</div>
              </div>
              <div>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Max LTV</div>
                <div style={{ color: CREAM, fontWeight: 600 }}>{p.maxLTV}%</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>What it's for</div>
                <div style={{ color: "#4a5d5d", fontSize: "13px" }}>{p.special}</div>
              </div>
            </div>
            <div style={{ textAlign: "center", minWidth: "110px" }}>
              <span style={{
                display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "5px 12px", borderRadius: "999px", background: p.tierColor, color: p.tierColor === YELLOW ? CREAM : swatch.pistachio,
              }}>
                {p.tier}
              </span>
            </div>
          </AnimatedCard>
        ))}
        {filtered.length === 0 && (
          <AnimatedCard hoverScale={false} style={{ textAlign: "center", color: "#5a6b6b", padding: "40px" }}>
            No standard program fits these exact parameters — but we write exceptions. Adjust DSCR or LTV, or talk to a Greenstreet specialist.
          </AnimatedCard>
        )}
      </div>

      {/* Apply CTA — the funnel out of this page is always Greenstreet */}
      <AnimatedCard hoverScale={false} style={{ marginTop: "32px", borderColor: MINT, background: "rgba(0,101,101,0.07)" }}>
        <div style={sectionTitle}>Found your program?</div>
        <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "18px", lineHeight: 1.6, maxWidth: "640px" }}>
          One application covers all six programs — we place your file in the best-fitting one and fund it. No portal-hopping, no re-keying the same deal five times.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <AnimatedButton onClick={() => onNavigate("rate-quiz")} showArrow={true}>
            Get my rate
          </AnimatedButton>
          <AnimatedButton variant="secondary" onClick={() => onNavigate("deal-analyzer")} showArrow={true}>
            Model the deal first
          </AnimatedButton>
        </div>
      </AnimatedCard>

      <p style={{ color: "#8a9a9a", fontSize: "12px", marginTop: "16px" }}>
        Program parameters effective {AS_OF} and subject to full underwriting. Not a rate lock or credit approval.
      </p>
    </PageShell>
  );
}
