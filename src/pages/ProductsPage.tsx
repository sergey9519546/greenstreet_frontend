import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;

const TOOLS = [
  { href: "/deal-analyzer", icon: "📊", title: "Deal Analyzer", desc: "Full DSCR analysis — Track 1 and Track 2, break-even rate, cash-on-cash. The core engine.", tag: "Most used" },
  { href: "/dscr-calculator", icon: "🧮", title: "DSCR Calculator", desc: "Quick DSCR and max-purchase-price calc with payment factor, PITIA breakdown, and rate tiers." },
  { href: "/lender-intel", icon: "🏦", title: "Lender Intelligence", desc: "Filter 11 verified DSCR lenders by FICO, DSCR, LTV, and property type. June 2026 data." },
  { href: "/state-laws", icon: "🗺️", title: "State Prepay & Usury Rules", desc: "50-state PPP matrix. OH/PA thresholds, NJ LLC risk, TX APR ban, MN HF 3437." },
  { href: "/borrower-profiles", icon: "👤", title: "Borrower Profiles", desc: "Find your borrower type and see the lenders, structures, and rates that fit them." },
  { href: "/rate-quiz", icon: "⚡", title: "Rate Quiz", desc: "Four questions to a realistic rate tier and the lender names behind it. No signup." },
];

export default function ProductsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="Products"
      subtitle="One platform. Every step of a DSCR deal — from first quote to rate lock."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ maxWidth: "760px", marginBottom: "48px" }}>
        <p style={{ color: "#3f5252", fontSize: "18px", lineHeight: 1.7 }}>
          Greenstreet connects pricing, program match, compliance, and borrower fit in one place. Enter a deal once and every tool works from the same numbers.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: "20px" }}>
        {TOOLS.map((t) => (
          <a
            key={t.href}
            href={t.href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(t.href.replace("/", "") as any);
            }}
            style={{ textDecoration: "none" }}
          >
            <AnimatedCard hoverScale={true} style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "30px", marginBottom: "14px" }}>{t.icon}</div>
                {t.tag && <span style={{ padding: "3px 10px", background: "rgba(216,217,88,0.15)", color: "#8a6d00", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>{t.tag}</span>}
              </div>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>{t.title}</div>
              <p style={{ color: "#4a5d5d", fontSize: "14px", lineHeight: 1.6, flex: 1 }}>{t.desc}</p>
              <div style={{ color: MINT, fontSize: "14px", fontWeight: 600, marginTop: "18px" }}>Open →</div>
            </AnimatedCard>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
