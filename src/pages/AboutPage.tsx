import React from "react";
import { PageShell, AnimatedCard, AnimatedButton, AnimatedNumber } from "./PageShell";
import { Eyebrow, Body, Grid } from "../components/wf";
import { swatch } from "../theme";

const VALUES = [
  { icon: "⚡", title: "Speed is the product", body: "The broker who quotes in 90 seconds beats the one who quotes in 90 minutes — every single time. We build for that reality." },
  { icon: "🔍", title: "No black boxes", body: "Every rate, every DSCR, every approval flag traces back to a specific input you can see and change. Math you can argue with is math you can trust." },
  { icon: "🤝", title: "Your borrower stays yours", body: "We are a wholesale partner. We underwrite, fund, and disappear. Your relationship, your yield spread, your repeat business." },
  { icon: "🗺️", title: "Compliance is a feature, not a footnote", body: "50-state prepay and usury rules are baked into every quote. A deal structured legally in Texas won't blow up in New Jersey." },
];

const STATS = [
  { val: 4, format: (v: number) => `$${Math.round(v)}M`, label: "Max loan amount" },
  { val: 50, format: (v: number) => Math.round(v).toString(), label: "States with prepay + usury rules mapped" },
  { val: 2, format: (v: number) => Math.round(v).toString(), label: "DSCR tracks on every deal" },
  { val: 2026, format: (v: number) => Math.round(v).toString(), label: "Founded" },
];

export default function AboutPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="About Greenstreet"
      subtitle="We got tired of watching good deals die in spreadsheets. So we built the engine that kills that problem."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ maxWidth: "760px", marginBottom: "clamp(40px,5vw,64px)" }}>
        <Eyebrow>Why we exist</Eyebrow>
        <Body size="large" muted style={{ marginBottom: "20px" }}>
          DSCR is the fastest-growing corner of non-QM lending — and it was still being run on email chains, PDF rate sheets, and the same four lender portals re-keyed before lunch. We watched brokers lose deals to whoever quoted first. We watched investors overpay for properties that looked clean on Track 1 and quietly bled out on Track 2. Something was broken.
        </Body>
        <Body size="large" muted>
          Greenstreet runs every deal on two tracks simultaneously. Track 1 answers the lender's question: will this PITIA qualify? Track 2 answers the investor's question: will this property actually cash flow after vacancy, management, and CapEx? We never blend them — a deal can qualify and still be a bad investment. One application in, the right Greenstreet program out, with 50-state compliance already checked. Then we fund it, in-house, in 14–21 days.
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

      <Eyebrow>What we stand for</Eyebrow>
      <Grid min="280px" gap="20px" style={{ marginBottom: "clamp(40px,5vw,64px)" }}>
        {VALUES.map((v) => (
          <AnimatedCard key={v.title} hoverScale={true}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{v.icon}</div>
            <div style={{ color: swatch.midnight, fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>{v.title}</div>
            <Body size="small" muted>{v.body}</Body>
          </AnimatedCard>
        ))}
      </Grid>

      <AnimatedCard themeName="dark" hoverScale={false} style={{ maxWidth: "640px" }}>
        <Eyebrow style={{ color: swatch.lemon }}>Join us</Eyebrow>
        <div style={{ color: swatch.pistachio, fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>We're hiring people who care when the math is wrong.</div>
        <Body muted style={{ marginBottom: "20px", color: "#9fb0a8" }}>Engineering, lending, compliance, and broker success — see the open roles.</Body>
        <AnimatedButton themeName="dark" variant="primary" onClick={() => onNavigate("careers")}>
          View open roles
        </AnimatedButton>
      </AnimatedCard>
    </PageShell>
  );
}
