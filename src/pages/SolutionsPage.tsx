import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;

const AUDIENCES = [
  { href: "/brokers", icon: "🤝", title: "Mortgage Brokers", desc: "Submit a deal once, get the best structure across 11 lenders. Keep your borrower, earn the spread.", cta: "For Brokers" },
  { href: "/investors", icon: "📈", title: "Real Estate Investors", desc: "Six investment strategies, the DSCR each requires, and the lenders that fund them — buy-and-hold to BRRRR.", cta: "For Investors" },
  { href: "/borrower-profiles", icon: "👤", title: "By Borrower Profile", desc: "First-timer, STR operator, portfolio builder, ITIN, cash-out — find the lane that fits and the lenders behind it.", cta: "Borrower Profiles" },
  { href: "/rate-quiz", icon: "⚡", title: "Just Want a Rate?", desc: "Four questions to a realistic rate tier and the lender names behind it. No email, no signup.", cta: "Rate Quiz" },
];

export default function SolutionsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="Who We Serve"
      subtitle="DSCR done right for everyone on the deal — brokers, investors, and every borrower profile in between."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px,1fr))", gap: "20px" }}>
        {AUDIENCES.map((a) => (
          <a
            key={a.href}
            href={a.href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(a.href.replace("/", "") as any);
            }}
            style={{ textDecoration: "none" }}
          >
            <AnimatedCard hoverScale={true} style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px" }}>
              <div style={{ fontSize: "32px", marginBottom: "14px" }}>{a.icon}</div>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "20px", marginBottom: "10px" }}>{a.title}</div>
              <p style={{ color: "#4a5d5d", fontSize: "15px", lineHeight: 1.6, flex: 1 }}>{a.desc}</p>
              <div style={{ color: MINT, fontSize: "14px", fontWeight: 600, marginTop: "20px" }}>{a.cta} →</div>
            </AnimatedCard>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
