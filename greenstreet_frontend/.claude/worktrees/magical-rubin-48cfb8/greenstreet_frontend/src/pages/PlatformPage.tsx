import React, { useEffect } from "react";
import ProductLanding, { ProductFeature, ProductCtaCard } from "../design/productLanding";
import { dc } from "../design/dc";

// ── Product › Platform ────────────────────────────────────────────────────────
// Platform-style landing (greenboard /products/platform reference), themed for
// the DSCR engine. Investor/lender framing — we are the lender.

const FEATURES: ProductFeature[] = [
  { title: "Deterministic engine", body: "One DSCR math on every deal — Track 1 qualifying and Track 2 real cash-flow, computed the same way every time. No black box." },
  { title: "50-state rule map", body: "Prepayment, usury and licensing rules for all 50 states, applied automatically before you lock — no surprises at close." },
  { title: "Program match", body: "Seven DSCR programs ranked by fit the moment the file lands — high-LTV, no-ratio, multi-family, short-term rental and non-US investor." },
  { title: "Stress built in", body: "Rate, rent and vacancy shocks run on every deal, with a 120-cell stress matrix one click away. Know what breaks it before you commit." },
  { title: "After-tax returns", body: "Full depreciation stack, IRR and cash-on-cash — the real net return, not a rough estimate or a marketing number." },
  { title: "Funded direct", body: "We are the lender. One file, one decision, funded direct — no broker portals, no middlemen, no re-keying numbers." },
];

const CTA_CARDS: ProductCtaCard[] = [
  { bg: dc.lemon,  fg: dc.dark, blurb: "See how the engine prices a deal in under a minute.", title: "Start a deal", view: "dscr-calculator" },
  { bg: dc.mintBg, fg: dc.dark, blurb: "See which of the seven DSCR programs fits your file.", title: "Match my program", view: "lender-intel" },
];

export default function PlatformPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Platform | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <ProductLanding
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Programs", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Start a deal →", view: "dscr-calculator" }}
      eyebrow="The DSCR underwriting platform"
      title="One system. Every DSCR workflow."
      lead="INVESTGO replaces scattered spreadsheets and stale rate sheets with a single engine — price, stress-test, structure and decide every DSCR deal in one place."
      primaryCta={{ label: "Start a deal", view: "dscr-calculator" }}
      secondaryCta={{ label: "See the programs", view: "lender-intel" }}
      featuresTitle="Everything you need, nothing you don't."
      features={FEATURES}
      ctaCards={CTA_CARDS}
    />
  );
}
