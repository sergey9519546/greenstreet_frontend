import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;

const TOOLS = [
  { href: "/deal-analyzer", icon: "📊", title: "Deal Analyzer", desc: "The full picture, in one pass. Track 1 (lender qualification), Track 2 (investor survival), break-even rate, and cash-on-cash — before you wire earnest money.", tag: "Most used" },
  { href: "/dscr-calculator", icon: "🧮", title: "DSCR Calculator", desc: "Quick DSCR and max-purchase-price. Payment factor, PITIA breakdown, and rate tier guidance — when you need an answer in 60 seconds, not 60 minutes." },
  { href: "/lender-intel", icon: "🏦", title: "Program Intelligence", desc: "Filter 7 custom Greenstreet DSCR programs by FICO, DSCR, LTV, and property type. See exactly which program funds your file — not just which ones advertise." },
  { href: "/state-laws", icon: "🗺️", title: "State Prepay & Usury Rules", desc: "50-state matrix with statutory citations. OH/PA thresholds, NJ LLC risk, TX APR ban, MN HF 3437 — the compliance traps that kill deals after you think you're done." },
  { href: "/borrower-profiles", icon: "👤", title: "Borrower Profiles", desc: "Six borrower archetypes — first-timer to foreign national — with the DSCR requirements, down payment, and Greenstreet program each one actually qualifies for." },
  { href: "/rate-quiz", icon: "⚡", title: "Rate Quiz", desc: "Five questions. A real rate tier. The Greenstreet programs behind it. No email, no signup, no credit pull — just the number." },
];

export default function ProductsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="Products & Tools"
      subtitle="Every step of a DSCR deal — from first quote to rate lock — in one place. Enter a deal once; every tool works from the same numbers."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ maxWidth: "760px", marginBottom: "48px" }}>
        <p style={{ color: "#3f5252", fontSize: "18px", lineHeight: 1.7 }}>
          Most DSCR tools are calculators duct-taped to a PDF. Greenstreet connects pricing, program match, compliance, and borrower fit in a single engine. The Deal Analyzer and the Rate Quiz read from the same math. What you see is what underwrites.
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
