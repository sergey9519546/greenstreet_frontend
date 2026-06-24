import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, AnimatedNumber, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

const TOOLS = [
  { title: "DSCR Calculator", desc: "Dual-track analysis: what gets you qualified and what keeps you solvent.", tag: "free", path: "/dscr-calculator", view: "dscr-calculator" },
  { title: "Program Match", desc: "See which Greenstreet program fits — DSCR for 1–4 units, multi-family, or foreign national, plus full-doc and bank-statement options. One application.", tag: "free", path: "/lender-intel", view: "lender-intel" },
  { title: "State Laws", desc: "50-state PPP and usury matrix. Statutory references included.", tag: "free", path: "/state-laws", view: "state-laws" },
  { title: "Sensitivity", desc: "Rent drop, value drop, rate jump. See which one breaks the deal first.", tag: "free", path: "/deal-analyzer", view: "deal-analyzer" },
  { title: "Returns / IRR", desc: "Pre-tax levered IRR with exit math and a 4×4 hold × cap sensitivity grid.", tag: "free", path: "/tools/returns", view: "returns" },
  { title: "Tax Engine", desc: "Depreciation, passive losses, recapture, capital gains. After-tax IRR.", tag: "free", path: "/tools/tax-engine", view: "tax-engine" },
  { title: "ARM Reset", desc: "What happens when a 5/6, 7/6, or 10/6 ARM resets. Pick a SOFR path.", tag: "free", path: "/tools/arm-reset", view: "arm-reset" },
  { title: "Stress Matrix", desc: "2D rate × rent shock grid. See your deal's actual room.", tag: "free", path: "/tools/stress-matrix", view: "stress-matrix" },
];

export default function InvestorsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="For Real Estate Investors"
      subtitle="The DSCR engine you actually want. Know if the deal works before you spend a dollar on appraisal."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
        <AnimatedCard hoverScale={true} style={{ padding: "32px", background: "rgba(0,101,101,0.08)", borderRadius: "14px", border: "1px solid rgba(0,101,101,0.22)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: MINT, marginBottom: "12px", lineHeight: 1.2 }}>Know if the deal survives before the appraisal is ordered.</h2>
          <p style={{ fontSize: "15px", color: "#4a5d5d", lineHeight: 1.6, marginBottom: "20px" }}>
            Plug in the numbers. Track 1 shows what the lender sees. Track 2 shows what you'll actually earn after vacancy, management, and CapEx. Most investors only ever see Track 1 — that's the problem. Find the binding constraint in the first <AnimatedNumber value={90} format={(v) => Math.round(v).toString()} /> seconds.
          </p>
          <AnimatedButton onClick={() => onNavigate("dscr-calculator")} showArrow={true}>
            Open the DSCR Calculator
          </AnimatedButton>
        </AnimatedCard>
        <AnimatedCard hoverScale={true} style={{ padding: "32px", background: "rgba(216,217,88,0.08)", borderRadius: "14px", border: "1px solid rgba(216,217,88,0.2)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: YELLOW, marginBottom: "12px", lineHeight: 1.2 }}>After-tax IRR. With real depreciation, not estimated depreciation.</h2>
          <p style={{ fontSize: "15px", color: "#4a5d5d", lineHeight: 1.6, marginBottom: "20px" }}>
            Year 1 typically shelters $<AnimatedNumber value={12} format={(v) => Math.round(v).toString()} />K–$<AnimatedNumber value={20} format={(v) => Math.round(v).toString()} />K of taxable income on a $<AnimatedNumber value={400} format={(v) => Math.round(v).toString()} />K deal. IRC §168(k) bonus depreciation is permanent under OBBBA. Don't be the investor who ignores the shield.
          </p>
          <AnimatedButton onClick={() => onNavigate("tax-engine")} showArrow={true} style={{ background: YELLOW, borderColor: YELLOW }}>
            Run the Tax Engine
          </AnimatedButton>
        </AnimatedCard>
      </div>

      <div style={sectionTitle}>The full toolkit — all free</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
        {TOOLS.map((f) => (
          <a key={f.title} href={f.path} style={{ textDecoration: "none" }} onClick={(e) => { e.preventDefault(); onNavigate(f.view); }}>
            <AnimatedCard hoverScale={true} style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: CREAM }}>{f.title}</h3>
                <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "20px", background: "rgba(0,101,101,0.12)", color: MINT, textTransform: "uppercase" }}>{f.tag}</span>
              </div>
              <p style={{ fontSize: "12px", color: "#5a6b6b", lineHeight: 1.5 }}>{f.desc}</p>
            </AnimatedCard>
          </a>
        ))}
      </div>

      <AnimatedCard hoverScale={false} style={{ marginBottom: "32px" }}>
        <div style={sectionTitle}>Five myths DSCR investors believe until they lose money</div>
        {[
          { myth: "DSCR is just rent ÷ payment.", truth: <span>That's Track 1 — the lender's qualifying view. Track 2 strips out vacancy, management fees, and CapEx reserves to show what you'll actually cash-flow. Most brokers only quote Track 1 because it makes the deal look better than it is. You need both numbers before you sign.</span> },
          { myth: "A 0.1x DSCR improvement doesn't matter.", truth: <span>On a $<AnimatedNumber value={400} format={(v) => Math.round(v).toString()} />K deal, <AnimatedNumber value={0.1} format={(v) => v.toFixed(1)} />x DSCR moves the rate by <AnimatedNumber value={25} format={(v) => Math.round(v).toString()} />–<AnimatedNumber value={50} format={(v) => Math.round(v).toString()} />bps. That's $<AnimatedNumber value={80} format={(v) => Math.round(v).toString()} />–$<AnimatedNumber value={150} format={(v) => Math.round(v).toString()} />/month. Over a <AnimatedNumber value={30} format={(v) => Math.round(v).toString()} />-year hold, that's $<AnimatedNumber value={30} format={(v) => Math.round(v).toString()} />K–$<AnimatedNumber value={50} format={(v) => Math.round(v).toString()} />K in interest you didn't have to pay.</span> },
          { myth: "All DSCR loans price the same.", truth: "Greenstreet has seven programs — from high-leverage DSCR to no-ratio, multi-family, and foreign national — and the right program can move your rate 100–150bps. The Program Match tool reads your file and finds the best fit in seconds." },
          { myth: "A 5/6 ARM is free money for the first 5 years.", truth: "You're betting SOFR stays low for 5 years and that you'll sell or refi before the first reset. The ARM page models 5 SOFR paths from bullish to crisis. In the bear case, the reset rate exceeds 8%. Know the scenario before you sign the note." },
          { myth: "Cash-out always means waiting 12 months to season.", truth: "Many lenders make you wait. Greenstreet seasons cash-out at six months on qualifying files — and the STR program is designed to recycle BRRRR capital faster than a conventional refi timeline." },
        ].map((m, i) => (
          <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
            <p style={{ fontSize: "14px", color: "#ff6b6b", fontWeight: 600, marginBottom: "6px" }}>✗ Myth: {m.myth}</p>
            <p style={{ fontSize: "13px", color: "#4a5d5d", lineHeight: 1.6 }}><strong style={{ color: MINT }}>Reality:</strong> {m.truth}</p>
          </div>
        ))}
      </AnimatedCard>

      <AnimatedCard hoverScale={false} style={{ marginBottom: "32px" }}>
        <div style={sectionTitle}>Which investor profile are you?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { title: "LTR / Buy-and-Hold", desc: "Single-family or small multifamily, 1-4 doors, long-term tenant. Most common DSCR use case." },
            { title: "STR / Airbnb", desc: "Short-term rental with AirDNA or 12-month history. Higher qualifying rent, more lender-specific rules." },
            { title: "BRRRR", desc: "Buy, rehab, rent, refi, repeat. 6-month seasoning matters — Greenstreet's STR program is built to recycle capital fast." },
            { title: "Portfolio / 10+ doors", desc: "Multiple properties, blanket loans, cross-collateralization. The Greenstreet DSCR Multi-Family program is built for this." },
            { title: "Syndication / LP", desc: "Capital stack with multiple investors. The Tax Engine and IRR Waterfall pages are the workhorse here." },
            { title: "Foreign National / ITIN", desc: "No SSN. Hard money or select non-QM. 25-35% down, 100-200bps premium, but doable." },
          ].map((p) => (
            <AnimatedCard hoverScale={true} key={p.title} style={{ padding: "16px", background: "#e8e9bf" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: CREAM, marginBottom: "6px" }}>{p.title}</h3>
              <p style={{ fontSize: "12px", color: "#4a5d5d", lineHeight: 1.5 }}>{p.desc}</p>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedCard>

      <div style={{ marginTop: "32px", padding: "32px", background: "#e8e9bf", borderRadius: "14px", border: "1px solid rgba(0,55,56,0.12)", textAlign: "center" }}>
        <h3 style={{ fontSize: "24px", fontWeight: 700, color: CREAM, marginBottom: "8px" }}>Stop hoping the deal works. Know before you close.</h3>
        <p style={{ fontSize: "14px", color: "#4a5d5d", marginBottom: "20px" }}>Every tool is free. No email required. Open a deal and see what the math says.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <AnimatedButton onClick={() => onNavigate("dscr-calculator")} showArrow={true}>
            DSCR Calculator
          </AnimatedButton>
          <AnimatedButton onClick={() => onNavigate("lender-intel")} variant="secondary" showArrow={true}>
            Lender Intel
          </AnimatedButton>
        </div>
      </div>
    </PageShell>
  );
}