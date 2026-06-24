// @ts-nocheck
import React, { useState } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
  AnimatedNumber,
  PremiumSlider,
} from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;
const FADED = swatch.midnightFaded;
const AS_OF = "Jun 22, 2026";

// Per-lender "lastVerified" — added 2026-06-22 refresh.
// 11 lenders with rate-sheet verification. The marketing site references
// "30+ programs"; this is the verified subset of those programs.
const LENDERS = [
  { name: "Griffin Funding", minFICO: 620, minDSCR: 0.75, maxLTV: 80, states: "50+DC", special: "No-ratio option · jumbo to $20M · all 50+DC · IO · ARM from 5.125%", confidence: 85, lastVerified: "Jun 18, 2026" },
  { name: "Defy Mortgage", minFICO: 640, minDSCR: 0.75, maxLTV: 85, states: "Most states", special: "High-leverage 85% LTV · 640–679 FICO · STR via AirDNA · closes 14–21d", confidence: 80, lastVerified: "Jun 18, 2026" },
  { name: "Easy Street Capital", minFICO: null, minDSCR: 0, maxLTV: 80, states: "Most states", special: "STR specialist · no DSCR minimum · AirDNA 100% pro · waives 12-mo seasoning", confidence: 82, lastVerified: "Jun 18, 2026" },
  { name: "Visio Lending", minFICO: 680, minDSCR: 0.75, maxLTV: 80, states: "48 (no AK/HI)", special: "Flex 0.75–0.99 · lower-of rent logic · broadest STR · no PPP option +0.625%", confidence: 78, lastVerified: "Jun 18, 2026" },
  { name: "Kiavi", minFICO: 660, minDSCR: 1.10, maxLTV: 90, states: "49+DC", special: "Tech-forward · AVM-heavy · 6–9 mo reserves · SSN required (no ITIN)", confidence: 70, lastVerified: "Jun 18, 2026" },
  { name: "New Silver", minFICO: 660, minDSCR: 0.75, maxLTV: 80, states: "Most states", special: "$150K–$3M loans · instant approval · closes 14–21d · rate 50–100bps above established", confidence: 72, lastVerified: "Jun 11, 2026" },
  { name: "Rocket Pro TPO", minFICO: 660, minDSCR: 1.00, maxLTV: 80, states: "All 50", special: "Speed-focused · non-QM expansion 2026 · closes 21–30d · max $3.5M", confidence: 75, lastVerified: "Jun 18, 2026" },
  { name: "Angel Oak", minFICO: 700, minDSCR: 1.00, maxLTV: 85, states: "Most states", special: "Largest non-QM securitizer · second liens $100K–$350K · Clear Capital AVM locked at prequal", confidence: 78, lastVerified: "Jun 18, 2026" },
  { name: "Lima One Capital", minFICO: null, minDSCR: null, maxLTV: 80, states: "~41 states", special: "STR via AirDNA · bridge-to-rental · blanket/portfolio · max $2M", confidence: 76, lastVerified: "Jun 18, 2026" },
  { name: "Deephaven", minFICO: 640, minDSCR: 0.75, maxLTV: 80, states: "Most states", special: "First-timer max 75% LTV · DSCR 2nd up to $500K · HELOC to $1M", confidence: 65, lastVerified: "Apr 22, 2026" },
  { name: "American Heritage", minFICO: 660, minDSCR: 0.75, maxLTV: 85, states: "Most states", special: "Sub-1.0 with compensating factors · STR: 75% proj or 100% with 12mo history", confidence: 65, lastVerified: "May 30, 2026" },
];

export default function LenderIntelPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  const [minFICO, setMinFICO] = useState(680);
  const [minDSCR, setMinDSCR] = useState(1.00);
  const [maxLTV, setMaxLTV] = useState(75);
  const [needsSTR, setNeedsSTR] = useState(false);

  const filtered = LENDERS.filter(l => {
    if (l.minFICO && l.minFICO > minFICO) return false;
    if (l.minDSCR !== null && l.minDSCR > minDSCR) return false;
    if (l.maxLTV < maxLTV) return false;
    if (needsSTR && !l.special.toLowerCase().includes("str")) return false;
    return true;
  }).sort((a, b) => b.confidence - a.confidence);

  const EMERALD = swatch.emerald;
  const confColor = (c: number) => c >= 80 ? MINT : c >= 70 ? YELLOW : "#5a6b6b";
  const verifiedColor = (v: string) => {
    const verifiedDate = new Date(v);
    const today = new Date(AS_OF);
    const daysAgo = Math.floor((today - verifiedDate) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 30) return EMERALD;
    if (daysAgo <= 60) return YELLOW;
    return "#b1432e";
  };

  return (
    <PageShell
      title="Lender Intelligence"
      subtitle={`DSCR lender matrix, verified monthly against wholesale rate sheets. ${LENDERS.length} lenders shown — verified subset of 30+ programs in the engine. Filter by FICO, DSCR, LTV, and STR.`}
      onBack={onBack} onNavigate={onNavigate}
    >
      {/* Filters */}
      <AnimatedCard hoverScale={false} style={{ marginBottom: "40px" }}>
        <div style={sectionTitle}>Filter by Deal Parameters</div>
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
        {filtered.length} lender{filtered.length !== 1 ? "s" : ""} match your parameters
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map(l => (
          <AnimatedCard key={l.name} hoverScale={true} style={{ display: "grid", gridTemplateColumns: "200px 1fr auto", gap: "24px", alignItems: "center" }}>
            <div>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{l.name}</div>
              <div style={{ color: "#5a6b6b", fontSize: "12px" }}>{l.states}</div>
              {/* Last-verified freshness tag — added 2026-06-22 refresh */}
              <div style={{
                marginTop: "6px", fontSize: "10px", fontFamily: "JetBrains Mono, monospace",
                color: verifiedColor(l.lastVerified), fontWeight: 700,
                paddingTop: "6px", borderTop: `1px dashed ${FADED}`,
              }}>
                ✓ verified {l.lastVerified}
              </div>
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Min FICO</div>
                <div style={{ color: CREAM, fontWeight: 600 }}>{l.minFICO ?? "—"}</div>
              </div>
              <div>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Min DSCR</div>
                <div style={{ color: CREAM, fontWeight: 600 }}>{l.minDSCR !== null ? l.minDSCR.toFixed(2) + "x" : "None"}</div>
              </div>
              <div>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Max LTV</div>
                <div style={{ color: CREAM, fontWeight: 600 }}>{l.maxLTV}%</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Notes</div>
                <div style={{ color: "#4a5d5d", fontSize: "13px" }}>{l.special}</div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: confColor(l.confidence), fontWeight: 800, fontSize: "22px" }}>
                <AnimatedNumber value={l.confidence} format={(v) => Math.round(v).toString()} />
              </div>
              <div style={{ color: "#6a7a7a", fontSize: "11px" }}>confidence</div>
            </div>
          </AnimatedCard>
        ))}
        {filtered.length === 0 && (
          <AnimatedCard hoverScale={false} style={{ textAlign: "center", color: "#5a6b6b", padding: "40px" }}>
            No lenders match these parameters. Try adjusting DSCR or LTV.
          </AnimatedCard>
        )}
      </div>

      {/* Freshness + cadence — added 2026-06-22 */}
      <div style={{
        marginTop: "24px", display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 18px", background: "rgba(77,189,151,0.08)",
        border: `1px solid rgba(77,189,151,0.25)`, borderRadius: "10px",
        flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: "999px",
          background: EMERALD, color: CREAM,
        }}>
          Data freshness
        </span>
        <span style={{ fontSize: "13px", color: CREAM, fontWeight: 600 }}>
          Last sweep {AS_OF} · cadence: monthly against wholesale rate sheets · 11 of 30+ programs shown (verified subset)
        </span>
      </div>

      <p style={{ color: "#8a9a9a", fontSize: "12px", marginTop: "16px" }}>
        Confidence scores decay over time. Per-lender last-verified dates are shown inline. Not a rate lock or credit approval.
      </p>
    </PageShell>
  );
}