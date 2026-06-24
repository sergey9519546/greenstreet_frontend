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

// Greenstreet's program menu — pick your income type, match your deal.
// Greenstreet underwrites and funds these directly; this is not a referral
// to outside lenders.
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
  { name: "Greenstreet DSCR 1-4", tier: "DSCR", tierColor: MINT, minFICO: 620, minDSCR: 0.75, maxLTV: 80, states: "All 50 + DC", isSTR: true, special: "DSCR loan for 1–4 unit rentals — qualifies on rent vs PITIA, no tax returns. Long-term or short-term (AirDNA / 12-mo history). Down to 0.75x DSCR with compensating factors. Interest-only available, loans to $4M." },
  { name: "Greenstreet DSCR Multi-Family", tier: "DSCR", tierColor: MINT, minFICO: 660, minDSCR: 1.00, maxLTV: 75, states: "All 50 + DC", special: "DSCR for 5+ unit and mixed-use property. Blanket and cross-collateralized structures for scaling investors. Loans to $4M." },
  { name: "Greenstreet DSCR Global", tier: "Foreign national", tierColor: DARK, minFICO: null, minDSCR: 1.00, maxLTV: 70, states: "All 50 + DC", special: "DSCR for foreign nationals & ITIN borrowers. No SSN — passport plus alternative credit, 30% down." },
  { name: "Greenstreet Full Doc", tier: "Full doc", tierColor: DARK, minFICO: 620, minDSCR: null, maxLTV: 80, states: "All 50 + DC", special: "For investors who document income with tax returns. Up to 80% LTV on investment property, loans to $4M." },
  { name: "Greenstreet Bank Statement", tier: "Alt doc", tierColor: YELLOW, minFICO: 660, minDSCR: null, maxLTV: 85, states: "All 50 + DC", special: "12–24 months of bank statements for self-employed borrowers. No tax returns, up to 85% LTV." },
  { name: "Greenstreet 1099", tier: "Alt doc", tierColor: YELLOW, minFICO: 660, minDSCR: null, maxLTV: 85, states: "All 50 + DC", special: "Qualify on 1099 income — one or two years. Built for independent contractors and gig income." },
  { name: "Greenstreet Asset Utilization", tier: "Alt doc", tierColor: EMERALD, minFICO: 680, minDSCR: null, maxLTV: 80, states: "All 50 + DC", special: "Qualify on liquid assets instead of monthly income. For strong-reserve and retired borrowers." },
  { name: "Greenstreet Second", tier: "Second lien", tierColor: EMERALD, minFICO: 680, minDSCR: null, maxLTV: 85, states: "All 50 + DC", special: "Closed-end second mortgage to tap equity without disturbing a low-rate first lien. Combined LTV to 85%." },
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
      subtitle={`Greenstreet's program menu — pick your income type, match your deal. DSCR for rentals (1–4 unit, multi-family, foreign national), plus full-doc, bank statement, 1099, and asset-based options. Underwritten and funded in-house, loans to $4M.`}
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
          One application covers the whole menu — we place your file in the best-fitting program and fund it. No portal-hopping, no re-keying the same deal five times.
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
