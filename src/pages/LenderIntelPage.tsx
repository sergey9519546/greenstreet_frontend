import React, { useState } from "react";
import { swatch } from "../theme";

import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
  PremiumSlider,
} from "./PageShell";
import { DSCR_PROGRAMS, DSCR_PROGRAMS_AS_OF } from "../data/dscrPrograms";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;
const FADED = swatch.midnightFaded;
const EMERALD = swatch.emerald;

const fmtLoan = (n: number) => "$" + (n % 1_000_000 === 0 ? n / 1_000_000 + "M" : (n / 1_000_000).toFixed(1) + "M");

export default function LenderIntelPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  const [minFICO, setMinFICO] = useState(680);
  const [minDSCR, setMinDSCR] = useState(1.00);
  const [maxLTV, setMaxLTV] = useState(75);
  const [needsSTR, setNeedsSTR] = useState(false);

  const filtered = DSCR_PROGRAMS.filter(p => {
    if (p.minFICO > minFICO) return false;
    if (!p.noRatio && p.dscrFloor > minDSCR) return false;
    if (p.maxLTV < maxLTV) return false;
    if (needsSTR && !p.isSTR) return false;
    return true;
  });

  return (
    <PageShell
      title="Greenstreet DSCR Programs"
      subtitle={`Seven programs. One application. Dial in your deal parameters and see which Greenstreet program fits — from 80% LTV standard to no-ratio, multi-family, and $3.5M jumbo. Every program underwritten and funded in-house.`}
      onBack={onBack} onNavigate={onNavigate}
    >
      {/* Filters */}
      <AnimatedCard hoverScale={false} style={{ marginBottom: "40px" }}>
        <div style={sectionTitle}>Match your deal to a program</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "32px", alignItems: "end" }}>
          <PremiumSlider
            label="Borrower FICO"
            min={600}
            max={800}
            step={20}
            value={minFICO}
            onChange={setMinFICO}
            formatValue={(val) => String(val)}
            ticks={[620, 680, 720, 760, 800]}
          />
          <PremiumSlider
            label="Deal DSCR"
            min={0.50}
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
        {filtered.length} Greenstreet program{filtered.length !== 1 ? "s" : ""} match your parameters
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map(p => (
          <AnimatedCard key={p.id} hoverScale={true} style={{ display: "grid", gridTemplateColumns: "230px 1fr auto", gap: "24px", alignItems: "center" }}>
            <div>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", marginBottom: "2px" }}>{p.name}</div>
              <div style={{ color: MINT, fontSize: "12px", fontWeight: 600 }}>{p.tagline}</div>
              <div style={{
                marginTop: "8px", fontSize: "10px", fontFamily: "JetBrains Mono, monospace",
                color: EMERALD, fontWeight: 700,
                paddingTop: "6px", borderTop: `1px dashed ${FADED}`,
              }}>
                ✓ underwritten + funded by Greenstreet
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "10px" }}>
                <div>
                  <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Min FICO</div>
                  <div style={{ color: CREAM, fontWeight: 600 }}>{p.minFICO}</div>
                </div>
                <div>
                  <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>DSCR Floor</div>
                  <div style={{ color: CREAM, fontWeight: 600 }}>{p.noRatio ? "No ratio" : p.dscrFloor.toFixed(2) + "x"}</div>
                </div>
                <div>
                  <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Max LTV</div>
                  <div style={{ color: CREAM, fontWeight: 600 }}>{p.maxLTV}%</div>
                </div>
                <div>
                  <div style={{ color: "#6a7a7a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Max Loan</div>
                  <div style={{ color: CREAM, fontWeight: 600 }}>{fmtLoan(p.maxLoan)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {p.features.map(f => (
                  <span key={f} style={{ fontSize: "11px", color: "#4a5d5d", background: "rgba(0,55,56,0.05)", border: `1px solid ${FADED}`, borderRadius: "6px", padding: "3px 8px" }}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", minWidth: "96px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {p.noRatio && <span style={pill(YELLOW, CREAM)}>No-ratio</span>}
              {p.multiFamily && <span style={pill(MINT, swatch.pistachio)}>Multi-family</span>}
              {p.foreignNational && <span style={pill(swatch.darkTeal, swatch.pistachio)}>Foreign nat'l</span>}
              {p.isSTR && <span style={pill(EMERALD, CREAM)}>STR</span>}
            </div>
          </AnimatedCard>
        ))}
        {filtered.length === 0 && (
          <AnimatedCard hoverScale={false} style={{ textAlign: "center", color: "#5a6b6b", padding: "40px" }}>
            No standard program fits these exact parameters. But we write exceptions — talk to a Greenstreet specialist, or try adjusting DSCR or LTV by a click.
          </AnimatedCard>
        )}
      </div>

      {/* Apply CTA — the funnel out of this page is always Greenstreet */}
      <AnimatedCard hoverScale={false} style={{ marginTop: "32px", borderColor: MINT, background: "rgba(0,101,101,0.07)" }}>
        <div style={sectionTitle}>Ready to move forward?</div>
        <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "18px", lineHeight: 1.6, maxWidth: "640px" }}>
          One application covers all seven programs — we place your file in the best fit and fund it ourselves. No portal-hopping. No re-keying the same numbers five times. Submit once and close.
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
        Program parameters effective {DSCR_PROGRAMS_AS_OF} and subject to full underwriting. Headline terms shown; full FICO × LTV pricing grids apply. Not a rate lock or credit approval.
      </p>
    </PageShell>
  );
}

const pill = (bg: string, fg: string): React.CSSProperties => ({
  fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
  padding: "4px 8px", borderRadius: "999px", background: bg, color: fg,
});
