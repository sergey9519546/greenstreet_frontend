import React, { useEffect } from "react";
import ProductLanding, { ProductFeature, ProductCtaCard } from "../design/productLanding";
import { dc } from "../design/dc";

// ── Support ───────────────────────────────────────────────────────────────────
// Platform-style help landing. Previously /support just aliased to the FAQ;
// this is a real page that routes to guides, the FAQ and the Greenstreet team.

const FEATURES: ProductFeature[] = [
  { title: "Getting started", body: "How DSCR qualifying works, what each tool does, and how to price your first deal in minutes — no signup needed." },
  { title: "DSCR & qualifying", body: "What DSCR, PITIA (the full monthly payment) and LTV mean, and how the engine decides whether a deal qualifies on rent." },
  { title: "Programs & rates", body: "The seven DSCR programs, who each one fits, and how rate tiers are set from your file." },
  { title: "State rules", body: "Prepayment, usury and licensing questions, answered for the state your property sits in." },
  { title: "Your file & funding", body: "Documents, reserves, timelines and what happens after you submit — straight from the lender." },
  { title: "Talk to a human", body: "When you'd rather speak to a person, reach the Greenstreet team directly — no phone tree." },
];

const CTA_CARDS: ProductCtaCard[] = [
  { bg: dc.lemon,  fg: dc.dark, blurb: "Common questions, answered in plain English.", title: "Open the FAQ", view: "faq" },
  { bg: dc.mintBg, fg: dc.dark, blurb: "Get your questions answered by the Greenstreet team.", title: "Book a demo", view: "book-demo" },
];

export default function SupportPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Help & Support | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <ProductLanding
      onNavigate={onNavigate}
      navLinks={[
        { label: "FAQ", view: "faq" },
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Programs", view: "lender-intel" },
      ]}
      cta={{ label: "Browse the FAQ →", view: "faq" }}
      eyebrow="Help & Support"
      title="Answers when you're mid-deal."
      lead="Self-serve guides, a full FAQ and a direct line to the Greenstreet team — so a question never stalls a deal."
      primaryCta={{ label: "Browse the FAQ", view: "faq" }}
      secondaryCta={{ label: "Book a demo", view: "book-demo" }}
      featuresTitle="Find the answer, fast."
      features={FEATURES}
      ctaCards={CTA_CARDS}
    />
  );
}
