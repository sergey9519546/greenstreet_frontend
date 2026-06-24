import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;

const AUDIENCES = [
  { href: "/brokers", icon: "🤝", title: "Mortgage Brokers", desc: "One application. Seven programs. You keep the borrower relationship and the yield spread — we underwrite and fund in the background.", cta: "For Brokers" },
  { href: "/investors", icon: "📈", title: "Real Estate Investors", desc: "Stress tests, after-tax IRR, ARM reset modeling, and Greenstreet program match — every tool you need to know if a deal works before you commit to it.", cta: "For Investors" },
  { href: "/borrower-profiles", icon: "👤", title: "By Borrower Profile", desc: "First-timer, STR operator, BRRRR recycler, ITIN borrower, cash-out refi — find your lane and the Greenstreet program that actually funds it.", cta: "Borrower Profiles" },
  { href: "/rate-quiz", icon: "⚡", title: "Just want a rate?", desc: "Five questions. A real rate tier and your matched Greenstreet program. No email, no credit pull, no pitch.", cta: "Rate Quiz" },
];

export default function SolutionsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="Who We Work With"
      subtitle="DSCR is a different kind of lending. Here's the right starting point depending on whether you're a broker, an investor, or a borrower figuring out where you fit."
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
