import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, AnimatedNumber, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

export default function BrokersPortalPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="For Mortgage Brokers"
      subtitle="Everything a wholesale broker needs to price, place, and close DSCR deals without juggling six logins."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
        <AnimatedCard hoverScale={true} style={{ padding: "32px", background: "rgba(0,101,101,0.08)", borderRadius: "14px", border: "1px solid rgba(0,101,101,0.22)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: MINT, marginBottom: "12px", lineHeight: 1.2 }}>
            <AnimatedNumber value={24} format={(v) => Math.round(v).toString()} /> hours saved per week
          </h2>
          <p style={{ fontSize: "15px", color: "#4a5d5d", lineHeight: 1.6, marginBottom: "20px" }}>
            Per broker. On average. The DSCR solver, lender matching, and state-rule checks mean you stop second-guessing your quote and move on.
          </p>
          <AnimatedButton onClick={() => onNavigate("portal")} showArrow={true}>
            Sign in to portal
          </AnimatedButton>
        </AnimatedCard>
        <AnimatedCard hoverScale={true} style={{ padding: "32px", background: "rgba(216,217,88,0.08)", borderRadius: "14px", border: "1px solid rgba(216,217,88,0.2)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: YELLOW, marginBottom: "12px", lineHeight: 1.2 }}>
            <AnimatedNumber value={20} format={(v) => Math.round(v) + "%"} /> more deals priced per week
          </h2>
          <p style={{ fontSize: "15px", color: "#4a5d5d", lineHeight: 1.6, marginBottom: "20px" }}>
            Brokers on the platform price 20% more deals per week. Most of those wouldn't have penciled out before the engine caught the missing compensating factors.
          </p>
          <AnimatedButton onClick={() => onNavigate("rate-quiz")} showArrow={true} style={{ background: YELLOW, borderColor: YELLOW }}>
            Book a demo
          </AnimatedButton>
        </AnimatedCard>
      </div>

      <div style={sectionTitle}>What You Get on Day 1</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
        {[
          { title: "DSCR Solver", desc: "Dual-track analysis. Track 1 is what gets the loan approved. Track 2 is what keeps the borrower from bleeding cash when vacancy hits.", icon: "1" },
          { title: "Lender Match Scoring", desc: "Every eligible lender ranked 0-100 with the three reasons and two concerns spelled out. No more guessing which lender to submit to.", icon: "2" },
          { title: "State PPP Database", desc: "50-state prepayment penalty rules with statutory references. MN, NJ, NY, OH, PA, TX edge cases all flagged.", icon: "3" },
          { title: "Sensitivity + Tornado", desc: "What if rent drops 10%? What if value drops 10%? What if rates jump 100bps? See which levers matter most.", icon: "4" },
          { title: "Structure Optimizer", desc: "IO vs 30yr P&I vs 40yr amortization vs ARM. The engine ranks structures by Track 1 DSCR and projected monthly savings.", icon: "5" },
          { title: "IC Memo Export", desc: "Generate a credit-committee-ready memo in 30 seconds. Includes return stack, lender ranking, and assumption disclosure.", icon: "6" },
        ].map((f) => (
          <AnimatedCard key={f.title} hoverScale={true} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: MINT, color: "#002D2E", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{f.icon}</div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: CREAM, lineHeight: 1.3 }}>{f.title}</h3>
            <p style={{ fontSize: "13px", color: "#4a5d5d", lineHeight: 1.5, flex: 1 }}>{f.desc}</p>
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard hoverScale={false} style={{ marginBottom: "32px" }}>
        <div style={sectionTitle}>The Workflow</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {[
            { step: "01", title: "Borrower calls with a deal", desc: "Address, list price, projected rent, FICO. Sometimes a signed lease. Usually not." },
            { step: "02", title: "Open the portal, type 7 numbers", desc: "Price, loan amount, rent, rate, taxes, insurance, HOA. Solver runs in under a second." },
            { step: "03", title: "Review lender match + state rule", desc: "Top 3 eligible lenders with reasoning. State PPP auto-checked with no-PPP premium called out." },
            { step: "04", title: "Send quote, get paid", desc: "Forward the IC memo or quote PDF. Most brokers close in 21-30 days, sometimes 14." },
          ].map((s) => (
            <div key={s.step} style={{ padding: "16px 0" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: MINT, letterSpacing: "0.1em", marginBottom: "6px" }}>STEP {s.step}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: CREAM, marginBottom: "6px", lineHeight: 1.3 }}>{s.title}</h3>
              <p style={{ fontSize: "12px", color: "#5a6b6b", lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </AnimatedCard>

      <AnimatedCard hoverScale={false} style={{ marginBottom: "32px" }}>
        <div style={sectionTitle}>What Brokers Tell Us</div>
        {[
          { quote: "I was skeptical the property would qualify at that rent. The DSCR calculator showed me exactly how to structure it - lower down payment, IO for year one. We closed in 19 days.", name: "Alex Stickelman", role: "CCO & COO, Root Financial" },
          { quote: "The lender matching and state-rule checks mean I stopped second-guessing my quotes. I price the deal and move on.", name: "Sandra Rivera", role: "Mortgage Broker, Miami FL" },
          { quote: "I run eight loans through Greenstreet a week. The CCO actually likes the audit logs - that's new for us.", name: "Robert Hayes", role: "Buy-and-Hold Investor, Austin TX" },
        ].map((t, i) => (
          <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
            <p style={{ fontSize: "15px", color: CREAM, lineHeight: 1.6, fontStyle: "italic", marginBottom: "12px" }}>"{t.quote}"</p>
            <p style={{ fontSize: "12px", color: MINT, fontWeight: 700 }}>{t.name}</p>
            <p style={{ fontSize: "11px", color: "#5a6b6b" }}>{t.role}</p>
          </div>
        ))}
      </AnimatedCard>

      <div style={{ marginTop: "32px", padding: "32px", background: "#e8e9bf", borderRadius: "14px", border: "1px solid rgba(0,55,56,0.12)", textAlign: "center" }}>
        <h3 style={{ fontSize: "24px", fontWeight: 700, color: CREAM, marginBottom: "8px" }}>Ready to price your next DSCR deal?</h3>
        <p style={{ fontSize: "14px", color: "#4a5d5d", marginBottom: "20px" }}>Free for individual brokers. White-label pricing for broker shops with 5+ users.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <AnimatedButton onClick={() => onNavigate("portal")} showArrow={true}>
            Open the Portal
          </AnimatedButton>
          <AnimatedButton onClick={() => onNavigate("rate-quiz")} variant="secondary" showArrow={true}>
            Book a Demo
          </AnimatedButton>
        </div>
      </div>
    </PageShell>
  );
}