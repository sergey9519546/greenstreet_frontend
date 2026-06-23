// @ts-nocheck
import React from "react";
import { PageShell, card, sectionTitle } from "./PageShell";

const MINT = "#006565";
const CREAM = "#003738";
const YELLOW = "#8a6d00";

export default function InvestorsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="For Real Estate Investors"
      subtitle="The DSCR tool you actually want. Stress tests, after-tax IRR, lender matching, and exit modeling - all in plain English."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
        <div style={{ padding: "32px", background: "rgba(0,101,101,0.08)", borderRadius: "14px", border: "1px solid rgba(0,101,101,0.22)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: MINT, marginBottom: "12px", lineHeight: 1.2 }}>The deal-breaker math, before you wire earnest money.</h2>
          <p style={{ fontSize: "15px", color: "#4a5d5d", lineHeight: 1.6, marginBottom: "20px" }}>
            Plug in the numbers. See the Track 1 DSCR, the Track 2 cash flow, the rate headroom, and the lender match. Most investors find the binding constraint in the first 90 seconds.
          </p>
          <a href="/dscr-calculator" style={{ display: "inline-block", padding: "12px 28px", background: MINT, color: "#002D2E", borderRadius: "8px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>Open the DSCR Calculator →</a>
        </div>
        <div style={{ padding: "32px", background: "rgba(216,217,88,0.08)", borderRadius: "14px", border: "1px solid rgba(216,217,88,0.2)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: YELLOW, marginBottom: "12px", lineHeight: 1.2 }}>After-tax IRR with real depreciation.</h2>
          <p style={{ fontSize: "15px", color: "#4a5d5d", lineHeight: 1.6, marginBottom: "20px" }}>
            Year 1 typically shelters $12K-$20K of taxable income on a $400K deal. Most investors ignore the depreciation shield. Don't be most investors.
          </p>
          <a href="/tax-engine" style={{ display: "inline-block", padding: "12px 28px", background: YELLOW, color: "#002D2E", borderRadius: "8px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>Run the Tax Engine →</a>
        </div>
      </div>

      <div style={sectionTitle}>Tools Investors Use Most</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
        {[
          { title: "DSCR Calculator", desc: "Dual-track analysis: what gets you qualified and what keeps you solvent.", tag: "free" },
          { title: "Lender Match", desc: "Every eligible lender ranked 0-100 with reasons and concerns. Updated monthly.", tag: "free" },
          { title: "State Laws", desc: "50-state PPP and usury matrix. Statutory references included.", tag: "free" },
          { title: "Sensitivity", desc: "Rent drop, value drop, rate jump. See which one breaks the deal first.", tag: "free" },
          { title: "Returns / IRR", desc: "Pre-tax levered IRR with exit math and a 4×4 hold × cap sensitivity grid.", tag: "free" },
          { title: "Tax Engine", desc: "Depreciation, passive losses, recapture, capital gains. After-tax IRR.", tag: "free" },
          { title: "ARM Reset", desc: "What happens when a 5/6, 7/6, or 10/6 ARM resets. Pick a SOFR path.", tag: "free" },
          { title: "Stress Matrix", desc: "2D rate × rent shock grid. See your deal's actual room.", tag: "free" },
        ].map((f) => (
          <a key={f.title} href={`/${f.title.toLowerCase().replace(/ /g, "-").replace("/", "")}`} style={{ ...card, textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: CREAM }}>{f.title}</h3>
              <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "20px", background: "rgba(0,101,101,0.12)", color: MINT, textTransform: "uppercase" }}>{f.tag}</span>
            </div>
            <p style={{ fontSize: "12px", color: "#5a6b6b", lineHeight: 1.5 }}>{f.desc}</p>
          </a>
        ))}
      </div>

      <div style={{ ...card, marginBottom: "32px" }}>
        <div style={sectionTitle}>What Investors Get Wrong About DSCR</div>
        {[
          { myth: "DSCR is just rent ÷ payment.", truth: "That's Track 1, the lender-qualifying view. Track 2 strips out vacancy, management, and maintenance to show what you'll actually cash-flow. Most brokers only quote Track 1 because it makes the deal look better than it is." },
          { myth: "A 0.1 DSCR improvement is meaningless.", truth: "On a $400K deal, 0.1x DSCR moves the rate by 25-50bps. That's $80-150/month. Over a 30-year hold, $30K-50K in interest savings." },
          { myth: "All DSCR lenders quote the same rate.", truth: "Same-day rate sheets from Griffin, Kiavi, Visio, New Silver, and Rocket Pro can differ by 100-150bps. The lender matching engine reads rate sheets monthly and ranks them by your actual deal profile." },
          { myth: "A 5/6 ARM is 'free money' for the first 5 years.", truth: "You're betting SOFR stays low for 5 years and that you'll sell or refi before the first reset. The ARM page models 5 scenarios from bullish to crisis - in the bear case, the reset rate exceeds 8%." },
          { myth: "Cash-out at 6 months works at any lender.", truth: "Standard DSCR lenders require 6-12 months seasoning. Easy Street Capital and Lima One waive this for STR cash-outs. Most others won't talk to you until month 7." },
        ].map((m, i) => (
          <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
            <p style={{ fontSize: "14px", color: "#ff6b6b", fontWeight: 600, marginBottom: "6px" }}>✗ Myth: {m.myth}</p>
            <p style={{ fontSize: "13px", color: "#4a5d5d", lineHeight: 1.6 }}><strong style={{ color: MINT }}>Reality:</strong> {m.truth}</p>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginBottom: "32px" }}>
        <div style={sectionTitle}>Investor Profiles We Built This For</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { title: "LTR / Buy-and-Hold", desc: "Single-family or small multifamily, 1-4 doors, long-term tenant. Most common DSCR use case." },
            { title: "STR / Airbnb", desc: "Short-term rental with AirDNA or 12-month history. Higher qualifying rent, more lender-specific rules." },
            { title: "BRRRR", desc: "Buy, rehab, rent, refi, repeat. 6-month seasoning matters. Easy Street Capital waives it for STRs." },
            { title: "Portfolio / 10+ doors", desc: "Multiple properties, blanket loans, cross-collateralization. Lima One Capital and Deephaven are built for this." },
            { title: "Syndication / LP", desc: "Capital stack with multiple investors. The Tax Engine and IRR Waterfall pages are the workhorse here." },
            { title: "Foreign National / ITIN", desc: "No SSN. Hard money or select non-QM. 25-35% down, 100-200bps premium, but doable." },
          ].map((p) => (
            <div key={p.title} style={{ padding: "16px", background: "#e8e9bf", borderRadius: "10px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: CREAM, marginBottom: "6px" }}>{p.title}</h3>
              <p style={{ fontSize: "12px", color: "#4a5d5d", lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "32px", padding: "32px", background: "#e8e9bf", borderRadius: "14px", border: "1px solid rgba(0,55,56,0.12)", textAlign: "center" }}>
        <h3 style={{ fontSize: "24px", fontWeight: 700, color: CREAM, marginBottom: "8px" }}>Stop reading spreadsheets. Start seeing the deal.</h3>
        <p style={{ fontSize: "14px", color: "#4a5d5d", marginBottom: "20px" }}>Every tool above is free. No email required for the public ones.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/dscr-calculator" style={{ display: "inline-block", padding: "12px 28px", background: MINT, color: "#002D2E", borderRadius: "8px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>DSCR Calculator</a>
          <a href="/lender-intel" style={{ display: "inline-block", padding: "12px 28px", background: "transparent", color: MINT, border: `1px solid ${MINT}`, borderRadius: "8px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>Lender Intel</a>
        </div>
      </div>
    </PageShell>
  );
}