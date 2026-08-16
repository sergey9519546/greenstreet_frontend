import React from "react";
import { dc } from "./dc";

export type BottomCTACard = { bg: string; fg?: string; blurb: string; title: string; view: string };

// Shared 2-up CTA band placed at the bottom of almost every page. Extracted from
// goLanding so the same investor-facing calls-to-action appear sitewide.
const DEFAULT_CARDS: BottomCTACard[] = [
  { bg: dc.lemon, fg: dc.dark, blurb: "Run the property's rent through Greenstreet — a real number in 60 seconds, no account, no credit pull.", title: "See what you can borrow", view: "dscr-calculator" },
  { bg: dc.mintBg, fg: dc.dark, blurb: "Questions on a deal? Talk to a Greenstreet specialist — one workflow prices, structures, and stress-tests it.", title: "Talk to a specialist", view: "book-demo" },
];

export default function BottomCTA({
  onNavigate,
  cards = DEFAULT_CARDS,
}: {
  onNavigate: (v: any) => void;
  cards?: BottomCTACard[];
}) {
  return (
    <section style={{ background: dc.dark, padding: `clamp(56px,7vh,96px) ${dc.pad}` }}>
      <div className="dc-band-2" style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {cards.map((c, i) => (
          <button key={i} onClick={() => onNavigate(c.view)} style={{ background: c.bg, color: c.fg || dc.dark, borderRadius: 16, padding: "clamp(32px,4vw,52px)", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280, textAlign: "left", fontFamily: dc.sans }}>
            <div style={{ fontSize: "clamp(15px,1.4vw,19px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3, opacity: 0.85 }}>{c.blurb}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 36 }}>
              <h2 style={{ fontSize: "clamp(22px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{c.title}</h2>
              <span style={{ fontSize: 30 }}>→</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
