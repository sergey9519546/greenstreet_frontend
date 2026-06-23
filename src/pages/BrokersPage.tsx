// @ts-nocheck
import React from "react";
import { PageShell, card, sectionTitle } from "./PageShell";

const MINT = "#006565";
const CREAM = "#003738";
const YELLOW = "#8a6d00";
const FADED = "rgba(0,55,56,0.15)";
const AS_OF = "Jun 22, 2026";

const STEPS = [
  { n: "01", title: "Submit the Deal", body: "Send us the property address, purchase price, rent, and borrower FICO. We'll pre-screen against 11 verified lenders (out of 30+ programs in the engine matrix) in 24 hours." },
  { n: "02", title: "We Match & Structure", body: "We match your deal to the lender with the best rate and highest probability of approval. You get a complete structure: rate, LTV, reserves, PPP options." },
  { n: "03", title: "You Stay in Control", body: "You own the borrower relationship. We process in the background. You get the yield-spread on origination. No borrower poaching, ever." },
  { n: "04", title: "Close in 21–30 Days", body: `DSCR closes faster than conventional. No income docs, no employment calls, no bank statement underwriting. Appraisal + title + credit = done. Per Apr 2026 lender sweep, Kiavi and New Silver advertise 14–21 day close; most others 21–30.` },
];

const WHY = [
  { icon: "🏆", title: "30+ Lender Programs", body: "11 rate-sheet-verified partners (Griffin, Defy, Visio, Kiavi, Angel Oak, Rocket Pro TPO, Easy Street, New Silver, Lima One, Deephaven, American Heritage + new 2026 entrants Insula Capital and UWM Non-QM). Submit once, get the best deal across the verified matrix." },
  { icon: "📊", title: "Live DSCR Modeling", body: "Use our Deal Analyzer before you submit. Know DSCR, break-even rate, and lender eligibility before the conversation starts." },
  { icon: "⚡", title: "No Competing for Your Borrower", body: "We are a wholesale partner. Your borrower stays yours. We process behind the scenes. Always." },
  { icon: "📍", title: "50-State PPP Compliance", body: "We track prepay laws across all 50 states, refreshed Q2 2026. You get flagged before you structure a deal in OH, PA, NJ, or MN with compliance traps." },
];

// Partner economics — refreshed against Apr 2026 sweep. Sources cited below.
const ECONOMICS = [
  { label: "Typical Origination", val: "1.0–2.0%", note: "Of loan amount at close", src: "Industry convention · lender published" },
  { label: "YSP on Rate", val: "0.50–1.50%", note: "Rate buyup / premium pricing", src: "Reg Z §1026.36(d) · broker comp rules" },
  { label: "Avg Loan Size", val: "$350K", note: "SFR purchase, 25% down", src: "Greenstreet engine · Apr 2026 deal sample" },
];

export default function BrokersPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  return (
    <PageShell
      title="Partner With Us"
      subtitle={`For mortgage brokers and real estate professionals who want to offer DSCR investment property loans. Last refreshed ${AS_OF}.`}
      onBack={onBack} onNavigate={onNavigate}
    >
      {/* Why partner */}
      <div style={sectionTitle}>Why Greenstreet Finance</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginBottom: "60px" }}>
        {WHY.map(w => (
          <div key={w.title} style={card}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{w.icon}</div>
            <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{w.title}</div>
            <div style={{ color: "#4a5d5d", fontSize: "14px", lineHeight: 1.6 }}>{w.body}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={sectionTitle}>How It Works</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "60px", maxWidth: "720px" }}>
        {STEPS.map(s => (
          <div key={s.n} style={{ ...card, display: "grid", gridTemplateColumns: "60px 1fr", gap: "20px", alignItems: "start" }}>
            <div style={{ color: MINT, fontWeight: 900, fontSize: "28px" }}>{s.n}</div>
            <div>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>{s.title}</div>
              <div style={{ color: "#4a5d5d", fontSize: "14px", lineHeight: 1.6 }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fee structure — refreshed with per-row src */}
      <div style={{ ...card, maxWidth: "640px", marginBottom: "40px" }}>
        <div style={sectionTitle}>Partner Economics</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
          {ECONOMICS.map(e => (
            <div key={e.label} style={{ textAlign: "center" }}>
              <div style={{ color: MINT, fontWeight: 800, fontSize: "24px" }}>{e.val}</div>
              <div style={{ color: CREAM, fontWeight: 600, fontSize: "13px", marginTop: "4px" }}>{e.label}</div>
              <div style={{ color: "#647474", fontSize: "12px" }}>{e.note}</div>
              {/* Source attribution — added 2026-06-22 refresh */}
              <div style={{
                marginTop: "8px", paddingTop: "8px", borderTop: `1px dashed ${FADED}`,
                fontSize: "10px", color: MINT, fontFamily: "JetBrains Mono, monospace",
              }}>
                src · {e.src}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ ...card, maxWidth: "600px", borderColor: MINT, background: "rgba(0,101,101,0.07)" }}>
        <div style={sectionTitle}>Ready to Submit a Deal?</div>
        <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "20px", lineHeight: 1.6 }}>
          We pre-screen same day. Submit the property address, rent, and FICO and we'll come back with a full structure.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <a href="mailto:deals@greenstreetfinance.com" style={{
            display: "inline-block", padding: "14px 24px", background: MINT,
            color: "#002D2E", borderRadius: "10px", fontWeight: 700, fontSize: "15px",
            textDecoration: "none",
          }}>
            Submit a Deal
          </a>
          <a href="tel:+13324551462" style={{
            display: "inline-block", padding: "14px 24px", background: "transparent",
            color: MINT, border: `1px solid ${MINT}`, borderRadius: "10px", fontWeight: 700, fontSize: "15px",
            textDecoration: "none",
          }}>
            Call Us
          </a>
        </div>
      </div>

      {/* Freshness signal — added 2026-06-22 */}
      <div style={{
        marginTop: "24px", padding: "14px 18px",
        background: "rgba(216,217,88,0.12)", borderRadius: "10px",
        border: `1px solid rgba(216,217,88,0.3)`,
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        maxWidth: "640px",
      }}>
        <span style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: "999px",
          background: "#d8d958", color: "#003738",
        }}>
          Reviewed
        </span>
        <span style={{ fontSize: "13px", color: CREAM, fontWeight: 600 }}>
          Page refreshed {AS_OF} · lender count + fees reconciled with the verified-subset of 30+ programs · next review Jul 22, 2026
        </span>
      </div>
    </PageShell>
  );
}