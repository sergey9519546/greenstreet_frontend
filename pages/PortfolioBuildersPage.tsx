import React, { useEffect } from "react";
import { dc } from "../design/dc";
import GoLanding, { GoScenario, GoValue, GoFlowStep, GoCtaCard } from "../design/goLanding";

// ── Who-We-Serve: Portfolio Builders ──────────────────────────────────────────
// GO-style landing. Finance the whole book as one — blended DSCR.

const FLOW: GoFlowStep[] = [
  { step: "STEP 01", title: "Add your doors", body: "Enter each property's rent, payment and value — add and edit inline. Estimates are fine; the blended numbers update live." },
  { step: "STEP 02", title: "Blend", body: "We roll every door into one blended DSCR — total rent versus total payment — plus aggregate equity and a weighted average rate." },
  { step: "STEP 03", title: "Finance as one", body: "See the book the way a blanket lender underwrites it, then finance multiple properties under a single cross-collateral decision." },
];

const SCENARIOS: GoScenario[] = [
  { num: "01", bg: dc.lemon,   fg: dc.dark,  title: "Blanket loan",         body: "Roll several doors into one blended DSCR and a single cross-collateral verdict.", tag: "Portfolio", view: "portfolio" },
  { num: "02", bg: dc.mintBg,  fg: dc.teal,  title: "Cash-out to scale",    body: "Pull equity from performing doors to fund the next acquisition — model the new payment first.", tag: "Cash-out", view: "refi-tracker" },
  { num: "03", bg: dc.teal,    fg: dc.cream, title: "Portfolio stress",     body: "Shock rates and rents across the whole book to see which doors break coverage first.", tag: "Stress", view: "stress-matrix" },
  { num: "04", bg: dc.emerald, fg: dc.dark,  title: "Book-level returns",   body: "Aggregate IRR, equity multiple and cash-on-cash across every property you own.", tag: "Returns", view: "returns" },
  { num: "05", bg: dc.mintBg,  fg: dc.teal,  title: "ARM reset exposure",   body: "See which doors face a rate reset and when blended coverage drops below 1.0x.", tag: "ARM", view: "arm-reset" },
  { num: "06", bg: dc.dark,    fg: dc.cream, title: "Multi-state rules",    body: "Prepayment, usury and licensing rules checked across every state your doors sit in.", tag: "Compliance", view: "state-laws" },
];

const VALUES: GoValue[] = [
  { icon: "▦", chip: dc.lemon,   chipFg: dc.dark,  title: "Blended DSCR", body: "Total rent versus total payment across every door — the single number a blanket lender uses." },
  { icon: "Σ",  chip: dc.mintBg,  chipFg: dc.teal,  title: "Aggregate equity", body: "See combined equity and a weighted average rate across the whole book at a glance." },
  { icon: "◰",  chip: dc.emerald, chipFg: dc.dark,  title: "Portfolio stress", body: "Shock rates and rents across all doors at once — find the weak link before a lender does." },
  { icon: "✎",  chip: dc.dark,    chipFg: dc.cream, title: "Edit inline", body: "Add, remove and adjust properties on the fly — no spreadsheet, no re-keying numbers." },
  { icon: "§",  chip: dc.lemon,   chipFg: dc.dark,  title: "50-state rules", body: "Doors in different states each carry different rules — all checked automatically before you lock." },
  { icon: "⟳",  chip: dc.mintBg,  chipFg: dc.teal,  title: "Funded direct", body: "We are the lender. One file, one decision, funded direct — no broker portals, no middlemen." },
];

const CTA_CARDS: GoCtaCard[] = [
  { bg: dc.lemon,  fg: dc.dark, blurb: "Roll every door into one blended DSCR in under a minute.", title: "Build my portfolio view", view: "portfolio" },
  { bg: dc.mintBg, fg: dc.dark, blurb: "See aggregate returns across the whole book — after tax, after stress.", title: "See book returns", view: "returns" },
];

export default function PortfolioBuildersPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Portfolio & Blanket DSCR Loans | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <GoLanding
      onNavigate={onNavigate}
      navLinks={[
        { label: "Portfolio", view: "portfolio" },
        { label: "Returns", view: "returns" },
        { label: "Programs", view: "lender-intel" },
      ]}
      cta={{ label: "Build my portfolio view →", view: "portfolio" }}
      eyebrow="For Portfolio Builders"
      title="See your whole book the way a blanket lender does."
      lead="Blended DSCR, aggregate equity and weighted rate across every door — add and edit properties inline, then finance the portfolio as one."
      primaryCta={{ label: "Build my portfolio view", view: "portfolio" }}
      mock={{
        dealId: "Deal #GS-PF-7704",
        bigStat: "1.27x",
        tiles: [
          { v: "1.27x", l: "blended DSCR" },
          { v: "12", l: "doors", accent: true },
          { v: "GO", l: "verdict" },
        ],
      }}
      trustLabel="Direct DSCR lender · blanket & portfolio program"
      trustItems={["Blended DSCR", "Cross-collateral", "Edit inline", "Multi-state", "Funded direct"]}
      flowEyebrow="The Greenstreet loop"
      flowTitle="Add. Blend. Finance."
      flowLead="A portfolio flows the same three steps — every door rolls into one blended decision instead of a stack of separate files."
      flow={FLOW}
      scenariosEyebrow="Every scenario, one place"
      scenariosTitle="Six ways portfolio builders scale faster."
      scenarios={SCENARIOS}
      valuesTitle="Built for the way a book actually grows."
      values={VALUES}
      ctaCards={CTA_CARDS}
    />
  );
}
