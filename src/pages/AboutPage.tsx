import React from "react";
import { PageShell, AnimatedCard, AnimatedButton, AnimatedNumber } from "./PageShell";
import { Eyebrow, Body, Grid } from "../components/wf";
import { swatch } from "../theme";

const VALUES = [
  { icon: "⚡", title: "Speed is the product", body: "In non-QM, the broker who quotes in minutes wins the deal. Everything we build optimizes time-to-quote first." },
  { icon: "🔍", title: "Show the math", body: "Every rate and DSCR we display can be traced to its inputs. No black boxes, no mystery overlays." },
  { icon: "🤝", title: "Brokers stay in control", body: "We're a wholesale partner, not a competitor. Your borrower is always yours. We process behind the scenes." },
  { icon: "🗺️", title: "Compliance built in", body: "50-state prepay and usury rules live inside every quote, so a legal structure in Texas never becomes a trap in New Jersey." },
];

const STATS = [
  { val: 6, format: (v: number) => Math.round(v).toString(), label: "DSCR programs, one application" },
  { val: 50, format: (v: number) => Math.round(v).toString(), label: "States with prepay + usury rules mapped" },
  { val: 2, format: (v: number) => Math.round(v).toString(), label: "DSCR tracks on every deal" },
  { val: 2026, format: (v: number) => Math.round(v).toString(), label: "Founded" },
];

export default function AboutPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="About Greenstreet"
      subtitle="Building the fastest path from a rental property to a fundable DSCR loan."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ maxWidth: "760px", marginBottom: "clamp(40px,5vw,64px)" }}>
        <Eyebrow>Our mission</Eyebrow>
        <Body size="large" muted style={{ marginBottom: "20px" }}>
          DSCR is the fastest-growing corner of the mortgage market, and it's still run on spreadsheets and PDF rate sheets. We founded Greenstreet Finance after watching brokers re-key the same deal into four lender portals before lunch — losing borrowers to whoever quoted first.
        </Body>
        <Body size="large" muted>
          So we built Greenstreet to run every deal on two tracks at once. Track 1 — Lender Qualification — answers "will a lender say yes?" on PITIA and market rent. Track 2 — Investor Survival — answers "will the property actually cash flow?" after vacancy, management, and CapEx. We never blend them, because a deal can qualify and still be fragile. One application in, the right Greenstreet program out, with the 50-state rules already checked — and we fund it.
        </Body>
      </div>

      <Grid min="200px" gap="16px" style={{ marginBottom: "clamp(40px,5vw,64px)" }}>
        {STATS.map((s) => (
          <AnimatedCard key={s.label} hoverScale={true} style={{ textAlign: "center" }}>
            <div style={{ color: swatch.rainforest, fontWeight: 800, fontSize: "clamp(30px,3.4vw,40px)", letterSpacing: "-0.02em" }}>
              <AnimatedNumber value={s.val} format={s.format} />
            </div>
            <div style={{ color: swatch.rainforest, fontSize: "13px", marginTop: "4px" }}>{s.label}</div>
          </AnimatedCard>
        ))}
      </Grid>

      <Eyebrow>What we believe</Eyebrow>
      <Grid min="280px" gap="20px" style={{ marginBottom: "clamp(40px,5vw,64px)" }}>
        {VALUES.map((v) => (
          <AnimatedCard key={v.title} hoverScale={true}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{v.icon}</div>
            <div style={{ color: swatch.midnight, fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>{v.title}</div>
            <Body size="small" muted>{v.body}</Body>
          </AnimatedCard>
        ))}
      </Grid>

      {/* Dark CTA band — replaces the old invisible rainforest-on-tint card */}
      <AnimatedCard themeName="dark" hoverScale={false} style={{ maxWidth: "640px" }}>
        <Eyebrow style={{ color: swatch.lemon }}>Work with us</Eyebrow>
        <div style={{ color: swatch.pistachio, fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>We're hiring across engineering, lending, and broker success.</div>
        <Body muted style={{ marginBottom: "20px", color: "#9fb0a8" }}>See the open roles and how we work.</Body>
        <AnimatedButton themeName="dark" variant="primary" onClick={() => onNavigate("careers")}>
          View careers
        </AnimatedButton>
      </AnimatedCard>
    </PageShell>
  );
}
