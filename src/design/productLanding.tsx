import React, { useId } from "react";
import { DcShell, dc } from "./dc";
import type { NavLink } from "./dc";
import { canonicalView, labelForView, pathForView } from "./navModel";

// ── Reusable "platform"-style landing for Product / info pages ────────────────
// Ported from the greenboard /products/platform reference: dark hero (eyebrow +
// "One system. Every X workflow." + lead + CTAs) → a feature grid → a 2-up CTA
// pair. Copy is supplied per page; design lives here once. No motion needed —
// all content is static and visible by default.

export interface ProductFeature { title: string; body: string }
export interface ProductCtaCard { bg: string; fg?: string; blurb: string; title: string; view: string }

export interface ProductLandingProps {
  onNavigate: (v: any) => void;
  navLinks?: NavLink[];
  cta?: NavLink;
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  primaryCta: { label: string; view: string };
  secondaryCta?: { label: string; view: string };
  featuresTitle: string;
  features: ProductFeature[];
  ctaCards: ProductCtaCard[];
  heroBg?: string;
}

const navigateFromAnchor = (onNavigate: (v: any) => void, view: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onNavigate(canonicalView(view));
};

const PROMISSORY_COPY = /\b(?:approv(?:e|ed|al)|guarantee(?:d|s)?|instant(?:ly)?|same[- ]day|fast(?:er|est)?|quick(?:ly)?|sav(?:e|es|ed|ings)|lowest|best\s+rate|clos(?:e|ed|es|ing)|availab(?:le|ility)|qualif(?:y|ied|ication))\b/i;
const safeCopy = (copy: string, fallback: string) => PROMISSORY_COPY.test(copy) ? fallback : copy;

export default function ProductLanding(p: ProductLandingProps) {
  const heroBg = p.heroBg || dc.teal;
  const heroTitleId = useId();
  const featuresTitleId = useId();
  const ctaTitleId = useId();
  return (
    <DcShell onNavigate={p.onNavigate} accent={dc.dark} navLinks={p.navLinks} cta={p.cta}>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section aria-labelledby={heroTitleId} style={{ background: heroBg, color: dc.cream, padding: `clamp(64px,8vh,112px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ fontSize: "clamp(14px,1.2vw,17px)", opacity: 0.6, marginBottom: 16 }}>{p.eyebrow}</div>
          <h1 id={heroTitleId} style={{ overflowWrap: "anywhere", fontSize: "clamp(40px,6vw,84px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "16ch", margin: "0 0 22px" }}>{typeof p.title === "string" ? safeCopy(p.title, "Preliminary property planning") : p.title}</h1>
          <p style={{ fontSize: "clamp(17px,1.5vw,22px)", lineHeight: 1.5, maxWidth: "44ch", opacity: 0.8, margin: "0 0 12px" }}>{safeCopy(p.lead, "Explore preliminary scenario information based on the assumptions you provide.")}</p>
          <p style={{ maxWidth: "58ch", margin: 0, color: "rgba(238,239,211,0.58)", fontSize: 12.5, lineHeight: 1.5 }}>Planning context only. Outputs are preliminary, depend on supplied assumptions, and require independent verification against current program criteria.</p>
          <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href={pathForView(p.primaryCta.view)} onClick={navigateFromAnchor(p.onNavigate, p.primaryCta.view)} style={{ display: "inline-flex", alignItems: "center", gap: 9, background: dc.lemon, color: dc.dark, fontWeight: 600, fontSize: 16, border: "none", cursor: "pointer", padding: "16px 32px", borderRadius: dc.r.md, fontFamily: dc.sans, textDecoration: "none" }}>
              {labelForView(safeCopy(p.primaryCta.label, "Open planning tool"), p.primaryCta.view)} <span aria-hidden="true" style={{ fontSize: 18 }}>→</span>
            </a>
            {p.secondaryCta && (
              <a href={pathForView(p.secondaryCta.view)} onClick={navigateFromAnchor(p.onNavigate, p.secondaryCta.view)} style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 16, cursor: "pointer", padding: "16px 30px", borderRadius: dc.r.md, border: "1.5px solid rgba(238,239,211,0.3)", fontFamily: dc.sans, textDecoration: "none" }}>
                {labelForView(safeCopy(p.secondaryCta.label, "Review planning information"), p.secondaryCta.view)}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID ─────────────────────────────────────────────────────── */}
      <section aria-labelledby={featuresTitleId} style={{ background: dc.cream, padding: `clamp(64px,8vh,112px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 id={featuresTitleId} style={{ fontSize: "clamp(30px,4.4vw,58px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 40px", maxWidth: "20ch", color: dc.dark }}>{safeCopy(p.featuresTitle, "Preliminary planning features")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 1, background: "rgba(0,55,56,0.12)", borderRadius: 14, overflow: "hidden" }} className="dc-band-3">
            {p.features.map((f) => (
              <div key={f.title} style={{ background: dc.cream, padding: "clamp(24px,3vw,36px)", minHeight: 180 }}>
                <h3 style={{ overflowWrap: "anywhere", fontSize: "clamp(19px,1.9vw,24px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 10px", color: dc.dark }}>{safeCopy(f.title, "Planning detail")}</h3>
                <p style={{ fontSize: 15, fontWeight: 500, opacity: 0.75, lineHeight: 1.5, margin: 0, color: dc.dark }}>{safeCopy(f.body, "Review preliminary information based on supplied assumptions.")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2-UP CTA PAIR ────────────────────────────────────────────────────── */}
      <section aria-labelledby={ctaTitleId} style={{ background: dc.dark, padding: `clamp(56px,7vh,96px) ${dc.pad}` }}>
        <h2 id={ctaTitleId} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Continue with preliminary planning</h2>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="dc-band-2">
          {p.ctaCards.map((c, i) => (
            <a key={i} href={pathForView(c.view)} onClick={navigateFromAnchor(p.onNavigate, c.view)} style={{ background: c.bg, color: c.fg || dc.dark, borderRadius: 16, padding: "clamp(32px,4vw,52px)", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260, textAlign: "left", fontFamily: dc.sans, textDecoration: "none", boxSizing: "border-box" }}>
              <div style={{ fontSize: "clamp(15px,1.4vw,19px)", fontWeight: 600, opacity: 0.7, marginBottom: 16, lineHeight: 1.35, overflowWrap: "anywhere" }}>Preliminary planning context: {safeCopy(c.blurb, "Review scenario assumptions and current program criteria independently.")}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, minWidth: 0 }}>
                <h3 style={{ minWidth: 0, overflowWrap: "anywhere", fontSize: "clamp(26px,3vw,40px)", fontWeight: 600, letterSpacing: "-0.035em", margin: 0 }}>{labelForView(safeCopy(c.title, "Open planning tool"), c.view)}</h3>
                <span aria-hidden="true" style={{ fontSize: 28 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </DcShell>
  );
}
