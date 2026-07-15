import React, { useId } from "react";
import { dc } from "./dc";
import { canonicalView, labelForView, pathForView } from "./navModel";

export type BottomCTACard = { bg: string; fg?: string; blurb: string; title: string; view: string };

// Shared 2-up CTA band placed at the bottom of almost every page. Extracted from
// goLanding so the same investor-facing calls-to-action appear sitewide.
const DEFAULT_CARDS: BottomCTACard[] = [
  { bg: dc.lemon, fg: dc.dark, blurb: "Create a preliminary rent-coverage estimate from the property and payment assumptions you provide.", title: "Estimate DSCR fit", view: "dscr-calculator" },
  { bg: dc.mintBg, fg: dc.dark, blurb: "Compare preliminary financing scenarios and inspect the assumptions used in the result.", title: "Start the rate quiz", view: "rate-quiz" },
];

const PROMISSORY_COPY = /\b(?:approv(?:e|ed|al)|guarantee(?:d|s)?|instant(?:ly)?|same[- ]day|fast(?:er|est)?|quick(?:ly)?|sav(?:e|es|ed|ings)|lowest|best\s+rate|clos(?:e|ed|es|ing)|availab(?:le|ility)|qualif(?:y|ied|ication))\b/i;
const preliminaryBlurb = (card: BottomCTACard) => PROMISSORY_COPY.test(card.blurb)
  ? "Review preliminary planning information based on the assumptions you provide and verify current program criteria independently."
  : card.blurb;

const navigateFromAnchor = (onNavigate: (v: any) => void, view: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onNavigate(canonicalView(view));
};

export default function BottomCTA({
  onNavigate,
  cards = DEFAULT_CARDS,
}: {
  onNavigate: (v: any) => void;
  cards?: BottomCTACard[];
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} style={{ background: dc.dark, padding: `clamp(56px,7vh,96px) ${dc.pad}` }}>
      <h2 id={headingId} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Explore preliminary planning tools</h2>
      <p style={{ maxWidth: dc.maxW, margin: "0 auto 18px", color: "rgba(238,239,211,0.68)", fontSize: 13, lineHeight: 1.5 }}>Planning context only. Results depend on supplied assumptions and require independent verification against current program criteria.</p>
      <div className="dc-band-2" style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {cards.map((c, i) => (
          <a key={i} href={pathForView(c.view)} onClick={navigateFromAnchor(onNavigate, c.view)} style={{ background: c.bg, color: c.fg || dc.dark, borderRadius: 16, padding: "clamp(32px,4vw,52px)", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280, textAlign: "left", fontFamily: dc.sans, textDecoration: "none", boxSizing: "border-box" }}>
            <div style={{ fontSize: "clamp(15px,1.4vw,19px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3, opacity: 0.85, overflowWrap: "anywhere" }}>{preliminaryBlurb(c)}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, marginTop: 36, minWidth: 0 }}>
              <h3 style={{ minWidth: 0, overflowWrap: "anywhere", fontSize: "clamp(28px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: 0 }}>{labelForView(c.title, c.view)}</h3>
              <span aria-hidden="true" style={{ fontSize: 30 }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
