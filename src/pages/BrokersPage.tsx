import React from "react";
import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
} from "./PageShell";
import { swatch } from "../theme";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;
const FADED = swatch.midnightFaded;
const AS_OF = "Jun 22, 2026";

const STEPS = [
  { n: "01", title: "Send us the file", body: "Property address, purchase price, rent, borrower FICO. That's it. We pre-screen against every Greenstreet program and come back with a full structure — rate, LTV, reserves, PPP options — within 24 hours." },
  { n: "02", title: "We place it, you review it", body: "We match your deal to the Greenstreet program with the highest approval probability and best rate. You get one clean structure with real numbers — not a menu of maybes." },
  { n: "03", title: "You own the relationship", body: "We process in the background. You stay in front of the borrower. Your yield spread, your repeat client, your referral pipeline. We don't touch your relationship — ever." },
  { n: "04", title: "Close in 14–30 days", body: `DSCR moves faster than conventional because there are no income docs, no employment calls, no bank statement underwriting. Appraisal + title + credit. Greenstreet closes clean files in 14–21 days; complex ones in 21–30.` },
];

const WHY = [
  { icon: "🏆", title: "One application. Every program.", body: "DSCR for 1–4 units, multi-family, and foreign nationals — plus full-doc, bank-statement, 1099, and asset-based. Submit once and Greenstreet places your file in the best-fitting program. No hunting across portals." },
  { icon: "📊", title: "Model the deal before you pitch it", body: "Run your file through the Deal Analyzer before you pick up the phone. Know the DSCR, break-even rate, and program eligibility before the conversation starts — so you never quote what you can't deliver." },
  { icon: "⚡", title: "We are not your competition", body: "Wholesale means wholesale. Your borrower is yours — before, during, and after close. We underwrite, fund, and step back. Your relationship survives the transaction." },
  { icon: "📍", title: "50-state compliance, already done", body: "We track prepay and usury law across all 50 states, refreshed Q2 2026. Before you structure a deal in Ohio, Pennsylvania, New Jersey, or Minnesota, the engine has already flagged what you need to know." },
];

const ECONOMICS = [
  { label: "Typical Origination", val: "1.0–2.0%", note: "Of loan amount at close", src: "Industry convention · lender published" },
  { label: "YSP on Rate", val: "0.50–1.50%", note: "Rate buyup / premium pricing", src: "Reg Z §1026.36(d) · broker comp rules" },
  { label: "Avg Loan Size", val: "$350K", note: "SFR purchase, 25% down", src: "Greenstreet engine · Apr 2026 deal sample" },
];

export default function BrokersPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  return (
    <PageShell
      title="Partner With Greenstreet"
      subtitle={`Non-QM wholesale for mortgage professionals who are tired of chasing lender portals. One relationship. Seven programs. In-house underwriting and funding. Last refreshed ${AS_OF}.`}
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={sectionTitle}>Why brokers choose Greenstreet</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginBottom: "60px" }}>
        {WHY.map(w => (
          <AnimatedCard key={w.title} themeName="light" hoverScale={true}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{w.icon}</div>
            <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{w.title}</div>
            <div style={{ color: "rgba(0,55,56,0.8)", fontSize: "14px", lineHeight: 1.6 }}>{w.body}</div>
          </AnimatedCard>
        ))}
      </div>

      <div style={sectionTitle}>How a deal moves through Greenstreet</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "60px", maxWidth: "720px" }}>
        {STEPS.map(s => (
          <AnimatedCard key={s.n} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "20px", alignItems: "center" }} hoverScale={true}>
            <div style={{ color: MINT, fontWeight: 900, fontSize: "28px" }}>{s.n}</div>
            <div>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>{s.title}</div>
              <div style={{ color: "rgba(0,55,56,0.8)", fontSize: "14px", lineHeight: 1.6 }}>{s.body}</div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard style={{ maxWidth: "640px", marginBottom: "40px" }} hoverScale={false}>
        <div style={sectionTitle}>What you earn on a funded deal</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
          {ECONOMICS.map(e => (
            <div key={e.label} style={{ textAlign: "center" }}>
              <div style={{ color: MINT, fontWeight: 800, fontSize: "24px" }}>{e.val}</div>
              <div style={{ color: CREAM, fontWeight: 600, fontSize: "13px", marginTop: "4px" }}>{e.label}</div>
              <div style={{ color: "rgba(0,55,56,0.6)", fontSize: "12px" }}>{e.note}</div>
              <div style={{
                marginTop: "8px", paddingTop: "8px", borderTop: `1px dashed ${FADED}`,
                fontSize: "10px", color: MINT, fontFamily: "JetBrains Mono, monospace",
              }}>
                src · {e.src}
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      <AnimatedCard style={{ maxWidth: "600px", borderColor: MINT, background: "rgba(0,101,101,0.06)" }} hoverScale={false}>
        <div style={sectionTitle}>Have a deal ready to go?</div>
        <p style={{ color: "rgba(0,55,56,0.8)", fontSize: "15px", marginBottom: "20px", lineHeight: 1.6 }}>
          Send us the address, rent, and FICO. We pre-screen same day and come back with a complete structure — rate, LTV, reserves, prepay options.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <AnimatedButton onClick={() => window.location.href = "mailto:deals@greenstreetfinance.com"}>
            Submit a Deal
          </AnimatedButton>
          {/* TODO: replace placeholder with Greenstreet's real line before launch */}
          <AnimatedButton variant="secondary" onClick={() => window.location.href = "tel:+15550100000"}>
            Call Us
          </AnimatedButton>
        </div>
      </AnimatedCard>

      {/* Freshness signal */}
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
          Page refreshed {AS_OF} · program lineup + fees reviewed · next review Jul 22, 2026
        </span>
      </div>
    </PageShell>
  );
}