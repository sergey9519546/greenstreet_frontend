import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  CheckCircle2,
  FileCheck,
  Globe2,
  Home,
  Layers3,
  MapPinned,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { DcShell, dc, Mono } from "../design/dc";
import ComplianceNote from "../design/ComplianceNote";
import { DscrGauge } from "../design/artifacts";
import { risk } from "../theme";

type BorrowerProfile = {
  id: string;
  label: string;
  kicker: string;
  icon: LucideIcon;
  dscr: number;
  complexity: string;
  fit: string;
  program: string;
  ltv: string;
  fico: string;
  reserves: string;
  priceBand: string;
  decision: string;
  useWhen: string[];
  watch: string[];
  docs: string[];
};

const PROFILES: BorrowerProfile[] = [
  {
    id: "buy-hold",
    label: "Buy-and-hold",
    kicker: "Long-term rental file",
    icon: Home,
    dscr: 1.18,
    complexity: "Standard",
    fit: "1-10 stabilized rentals with lease or market rent support.",
    program: "Greenstreet Aspen",
    ltv: "80% max",
    fico: "660+",
    reserves: "3-6 mo PITIA",
    priceBand: "cleanest lane",
    decision: "Use the standard lane when the rent schedule and PITIA already clear the floor without a story.",
    useWhen: [
      "The property is leased or the 1007 rent schedule supports the payment.",
      "Entity vesting is ready before submission.",
      "You need a fast quote without tax returns or W-2 income.",
    ],
    watch: [
      "An 81% LTV file prices like a different loan.",
      "A DSCR at exactly 1.00x has no cushion for tax, HOA, or insurance movement.",
    ],
    docs: ["1007 rent schedule", "purchase contract", "LLC package", "insurance binder"],
  },
  {
    id: "non-us-investors",
    label: "Non-US investor",
    kicker: "Passport-led DSCR",
    icon: Globe2,
    dscr: 1.05,
    complexity: "High",
    fit: "Foreign national or no US bureau credit, buying US rental property through an entity.",
    program: "Maple / Aspen / Willow / Magnolia",
    ltv: "70-75% max",
    fico: "alt credit",
    reserves: "6-12 mo PITIA",
    priceBand: "premium lane",
    decision: "Route here when the deal qualifies on property cash flow but the borrower file needs non-US identity and funds sourcing.",
    useWhen: [
      "The borrower has passport ID but no usable US credit file.",
      "Funds can be sourced from a foreign or US bank with full paper trail.",
      "Entity and US closing logistics are solved early.",
    ],
    watch: [
      "Foreign wires add sourcing time. Budget days, not hours.",
      "Some markets require a lower leverage cap even when DSCR passes.",
    ],
    docs: ["passport ID", "bank reference", "foreign funds trail", "US entity docs"],
  },
  {
    id: "str-airbnb",
    label: "STR / Airbnb",
    kicker: "Seasonal revenue file",
    icon: MapPinned,
    dscr: 1.09,
    complexity: "Volatile",
    fit: "Short-term rental, Airbnb, VRBO, or seasonal income property.",
    program: "Program-specific STR path",
    ltv: "75% max",
    fico: "660+",
    reserves: "6-9 mo PITIA",
    priceBand: "haircut lane",
    decision: "Run STR when revenue history helps, but underwrite against the lower-of rule and local permit risk.",
    useWhen: [
      "The operator has trailing 12-month STR revenue or credible market support.",
      "The property is legally rentable in the city, HOA, and insurance policy.",
      "The borrower can survive slow-season cash flow.",
    ],
    watch: [
      "A permit ban can destroy the income model mid-loan.",
      "Gross platform revenue is not qualifying income until the haircut is applied.",
    ],
    docs: ["Airbnb or VRBO history", "permit evidence", "HOA rules", "commercial liability binder"],
  },
  {
    id: "vacation",
    label: "Vacation rental",
    kicker: "Personal use boundary",
    icon: Building2,
    dscr: 1.12,
    complexity: "Conditional",
    fit: "Second-home style property that will also be rented as an investment asset.",
    program: "Program-specific 1-4 / STR path",
    ltv: "75% max",
    fico: "660+",
    reserves: "6 mo PITIA",
    priceBand: "intent lane",
    decision: "Classify intent first. The same house can be DSCR, STR, or conventional depending on use and income proof.",
    useWhen: [
      "Rental use is real and documented before closing.",
      "Personal use stays inside the stated occupancy limits.",
      "Insurance names rental activity, not just homeowner coverage.",
    ],
    watch: [
      "Too much personal use can move the file out of business-purpose DSCR.",
      "Seasonal markets need reserves even when annual DSCR passes.",
    ],
    docs: ["occupancy certification", "rental plan", "insurance binder", "management agreement"],
  },
  {
    id: "portfolio",
    label: "Portfolio builder",
    kicker: "Multi-property desk",
    icon: Layers3,
    dscr: 1.32,
    complexity: "Structured",
    fit: "10+ doors, bulk terms, blanket loan, or cross-collateral request.",
    program: "Portfolio / blanket review",
    ltv: "75% max",
    fico: "680+ preferred",
    reserves: "blended review",
    priceBand: "scale lane",
    decision: "Use portfolio when one desk should price the whole relationship instead of forcing door-by-door approvals.",
    useWhen: [
      "You need one approval for multiple addresses.",
      "The blended portfolio DSCR is stronger than one thin property alone.",
      "Ownership is clean enough to pledge assets together.",
    ],
    watch: [
      "Cross-collateral releases must be priced before you sell one door.",
      "Messy LLC ownership slows a portfolio file more than weak rent usually does.",
    ],
    docs: ["rent roll", "property schedule", "entity org chart", "mortgage statements"],
  },
] as const;

const DOCS = [
  { title: "Property evidence", body: "Executed contract, mortgage statement, 1007 or 1025 rent schedule, leases, and HOA dues." },
  { title: "Borrower evidence", body: "Photo ID, credit authorization, entity documents, signing authority, and ownership trail." },
  { title: "Cash evidence", body: "Down payment source, reserves after close, gift or transfer trail, and foreign wire support when needed." },
  { title: "Risk evidence", body: "Insurance binder, permit status, local rental restrictions, PPP state rules, and portfolio release terms." },
];

const RED_FLAGS = [
  { label: "Thin DSCR", detail: "1.00x is a floor, not a safety margin.", severity: "structure before lock" },
  { label: "Entity not ready", detail: "Missing or stale LLC docs can add days to underwriting.", severity: "fix before submit" },
  { label: "STR permit gap", detail: "The revenue model fails if the city or HOA blocks rentals.", severity: "kill-switch" },
  { label: "Foreign funds gap", detail: "Unclear wire sourcing can hold closing even when DSCR passes.", severity: "source early" },
  { label: "Portfolio ownership sprawl", detail: "Side partners and old entities slow blanket structures.", severity: "clean title path" },
];

const PAGE_CSS = `
.bp-page { color: ${dc.dark}; background: ${dc.cream}; }
.bp-hero {
  min-height: min(760px, calc(100dvh - 96px));
  color: ${dc.cream};
  background:
    linear-gradient(90deg, rgba(0,55,56,0.94) 0%, rgba(0,55,56,0.82) 38%, rgba(0,55,56,0.26) 74%, rgba(0,55,56,0.12) 100%),
    url("/img/resources/financial_dashboard.png") center / cover no-repeat;
  display: grid;
  align-items: end;
  overflow: hidden;
}
.bp-wrap { max-width: ${dc.maxW}px; margin: 0 auto; padding-left: ${dc.pad}; padding-right: ${dc.pad}; }
.bp-hero-copy { max-width: 980px; padding: clamp(64px, 7vw, 92px) 0 clamp(34px, 4vw, 42px); }
.bp-eyebrow { font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${dc.lemon}; margin-bottom: 18px; }
.bp-hero h1 {
  max-width: 12.5ch;
  margin: 0;
  font-size: clamp(52px, 7.1vw, 92px);
  line-height: 1.04;
  letter-spacing: -0.03em;
  font-weight: 600;
  text-wrap: balance;
}
.bp-hero-lead {
  max-width: 62ch;
  margin: 24px 0 0;
  color: rgba(238,239,211,0.78);
  font-size: clamp(17px, 1.35vw, 21px);
  line-height: 1.38;
  font-weight: 500;
  letter-spacing: 0;
}
.bp-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 30px; }
.bp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 14px 20px;
  min-height: 50px;
  font-family: ${dc.sans};
  font-size: 15px;
  font-weight: 750;
  letter-spacing: 0;
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, border-color .18s ease, color .18s ease;
}
.bp-btn:hover { transform: translateY(-2px); }
.bp-btn:active { transform: translateY(1px); }
.bp-btn:focus-visible, .bp-profile-button:focus-visible, .bp-card:focus-visible { outline: 2px solid ${dc.lemon}; outline-offset: 3px; }
.bp-btn-primary { background: ${dc.lemon}; color: ${dc.dark}; }
.bp-btn-secondary { background: rgba(238,239,211,0.08); color: ${dc.cream}; border-color: rgba(238,239,211,0.24); }
.bp-btn-secondary:hover { background: ${dc.cream}; color: ${dc.dark}; border-color: ${dc.cream}; }
.bp-hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  max-width: 760px;
  margin-top: 44px;
  border-top: 1px solid rgba(238,239,211,0.20);
  border-bottom: 1px solid rgba(238,239,211,0.20);
}
.bp-hero-metric { padding: 18px 22px 18px 0; border-right: 1px solid rgba(238,239,211,0.16); }
.bp-hero-metric:last-child { border-right: 0; padding-left: 22px; }
.bp-hero-metric + .bp-hero-metric { padding-left: 22px; }
.bp-hero-metric strong { display: block; font-family: ${dc.mono}; font-size: clamp(24px, 2.2vw, 34px); letter-spacing: -0.04em; color: ${dc.lemon}; line-height: 1; }
.bp-hero-metric span { display: block; margin-top: 7px; font-size: 12px; color: rgba(238,239,211,0.64); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.bp-rail {
  background: ${dc.dark};
  border-top: 1px solid rgba(238,239,211,0.14);
  color: ${dc.cream};
}
.bp-rail-inner {
  max-width: ${dc.maxW}px;
  margin: 0 auto;
  padding: 18px ${dc.pad};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}
.bp-rail-label { font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(238,239,211,0.58); }
.bp-rail-buttons { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
.bp-chip {
  border: 1px solid rgba(238,239,211,0.18);
  border-radius: 8px;
  background: rgba(238,239,211,0.04);
  color: ${dc.cream};
  padding: 10px 12px;
  white-space: nowrap;
  font: 750 13px/1 ${dc.sans};
  cursor: pointer;
  transition: background .18s ease, color .18s ease, border-color .18s ease;
}
.bp-chip.is-active, .bp-chip:hover { background: ${dc.lemon}; color: ${dc.dark}; border-color: ${dc.lemon}; }
.bp-section { padding: clamp(72px, 8vw, 132px) 0; }
.bp-section-head {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(320px, 0.5fr);
  gap: clamp(24px, 5vw, 72px);
  align-items: end;
  margin-bottom: clamp(32px, 5vw, 68px);
}
.bp-section h2 {
  margin: 0;
  font-size: clamp(36px, 5vw, 76px);
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 600;
  text-wrap: balance;
}
.bp-section-copy { margin: 0; max-width: 58ch; color: rgba(0,55,56,0.68); font-size: 17px; line-height: 1.5; letter-spacing: 0; }
.bp-workbench { background: ${dc.cream}; }
.bp-workbench-grid {
  display: grid;
  grid-template-columns: minmax(280px, 410px) minmax(0, 1fr);
  gap: clamp(20px, 3vw, 36px);
  align-items: start;
}
.bp-profile-list { position: sticky; top: 116px; display: grid; gap: 10px; }
.bp-profile-button {
  width: 100%;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  border: 1px solid rgba(0,55,56,0.18);
  border-radius: 8px;
  background: rgba(232,233,191,0.54);
  color: ${dc.dark};
  padding: 14px;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
}
.bp-profile-button:hover { transform: translateX(3px); background: ${dc.mintBg}; }
.bp-profile-button.is-active { background: ${dc.dark}; color: ${dc.cream}; border-color: ${dc.dark}; }
.bp-profile-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${dc.dark};
  color: ${dc.lemon};
}
.bp-profile-button.is-active .bp-profile-icon { background: ${dc.lemon}; color: ${dc.dark}; }
.bp-profile-label { display: block; font-weight: 800; font-size: 15px; letter-spacing: 0; }
.bp-profile-kicker { display: block; margin-top: 4px; color: rgba(0,55,56,0.58); font-size: 12px; font-weight: 650; letter-spacing: 0.02em; text-transform: uppercase; }
.bp-profile-button.is-active .bp-profile-kicker { color: rgba(238,239,211,0.62); }
.bp-dossier {
  background: ${dc.dark};
  color: ${dc.cream};
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(238,239,211,0.16);
}
.bp-dossier-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
  gap: 0;
}
.bp-dossier-main { padding: clamp(28px, 4vw, 52px); }
.bp-dossier-main h3 {
  margin: 14px 0 0;
  font-size: clamp(34px, 4.8vw, 68px);
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-weight: 600;
}
.bp-dossier-fit { max-width: 62ch; margin: 18px 0 0; color: rgba(238,239,211,0.72); font-size: 17px; line-height: 1.48; letter-spacing: 0; }
.bp-mini-label { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${dc.lemon}; }
.bp-dossier-side {
  border-left: 1px solid rgba(238,239,211,0.13);
  padding: clamp(26px, 3vw, 38px);
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 14px;
  background: rgba(238,239,211,0.045);
}
.bp-gauge-caption { text-align: center; color: rgba(238,239,211,0.66); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.bp-spec-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid rgba(238,239,211,0.12);
  border-bottom: 1px solid rgba(238,239,211,0.12);
}
.bp-spec { padding: 18px 20px; border-right: 1px solid rgba(238,239,211,0.12); }
.bp-spec:last-child { border-right: 0; }
.bp-spec span { display: block; color: rgba(238,239,211,0.52); font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
.bp-spec strong { display: block; color: ${dc.cream}; font-size: 15px; font-weight: 800; line-height: 1.25; }
.bp-dossier-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0;
}
.bp-dossier-block { padding: clamp(26px, 3.4vw, 44px); border-right: 1px solid rgba(238,239,211,0.12); }
.bp-dossier-block:last-child { border-right: 0; }
.bp-dossier-list { display: grid; gap: 12px; margin-top: 18px; }
.bp-dossier-item { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; align-items: start; color: rgba(238,239,211,0.76); font-size: 14px; line-height: 1.45; letter-spacing: 0; }
.bp-dossier-item svg { color: ${dc.lemon}; margin-top: 1px; }
.bp-dossier-item.is-risk svg { color: ${risk.warning}; }
.bp-dossier-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.bp-note { margin-top: 20px; max-width: 860px; }
.bp-matrix { background: ${dc.mintBg}; border-top: 1px solid rgba(0,55,56,0.16); }
.bp-card-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}
.bp-card {
  grid-column: span 2;
  min-height: 260px;
  border: 1px solid rgba(0,55,56,0.17);
  border-radius: 10px;
  background: ${dc.cream};
  color: ${dc.dark};
  padding: clamp(20px, 2vw, 28px);
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform .18s ease, border-color .18s ease, background .18s ease;
}
.bp-card:nth-child(1), .bp-card:nth-child(5) { grid-column: span 3; }
.bp-card:hover { transform: translateY(-4px); border-color: ${dc.dark}; background: #f4f5dc; }
.bp-card.is-active { background: ${dc.dark}; color: ${dc.cream}; border-color: ${dc.dark}; }
.bp-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.bp-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${dc.mintBg};
  color: ${dc.dark};
}
.bp-card.is-active .bp-card-icon { background: ${dc.lemon}; color: ${dc.dark}; }
.bp-card h3 { margin: 24px 0 9px; font-size: clamp(24px, 2.6vw, 38px); line-height: 1; letter-spacing: -0.025em; font-weight: 600; }
.bp-card p { margin: 0; color: rgba(0,55,56,0.66); font-size: 14px; line-height: 1.48; letter-spacing: 0; }
.bp-card.is-active p { color: rgba(238,239,211,0.70); }
.bp-card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
.bp-card-meta span { display: block; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(0,55,56,0.48); margin-bottom: 4px; }
.bp-card.is-active .bp-card-meta span { color: rgba(238,239,211,0.48); }
.bp-card-meta strong { font-size: 14px; line-height: 1.25; }
.bp-file { background: ${dc.cream}; }
.bp-file-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(24px, 5vw, 72px);
  align-items: start;
}
.bp-doc-list { display: grid; border-top: 1px solid rgba(0,55,56,0.18); }
.bp-doc-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 16px;
  padding: 22px 0;
  border-bottom: 1px solid rgba(0,55,56,0.18);
}
.bp-doc-row svg { color: ${dc.rain}; }
.bp-doc-row h3 { margin: 0 0 6px; font-size: 20px; line-height: 1.1; letter-spacing: -0.015em; }
.bp-doc-row p { margin: 0; color: rgba(0,55,56,0.66); line-height: 1.5; letter-spacing: 0; }
.bp-redflags { background: ${dc.dark}; color: ${dc.cream}; }
.bp-redflags .bp-section-copy { color: rgba(238,239,211,0.66); }
.bp-redflag-list { display: grid; border-top: 1px solid rgba(238,239,211,0.16); }
.bp-redflag-row {
  display: grid;
  grid-template-columns: minmax(180px, 0.32fr) minmax(0, 1fr) minmax(160px, 0.24fr);
  gap: 22px;
  align-items: center;
  padding: 22px 0;
  border-bottom: 1px solid rgba(238,239,211,0.16);
}
.bp-redflag-row strong { font-size: 20px; letter-spacing: -0.015em; }
.bp-redflag-row p { margin: 0; color: rgba(238,239,211,0.70); line-height: 1.45; letter-spacing: 0; }
.bp-severity { justify-self: end; color: ${dc.lemon}; font-size: 12px; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.bp-close { background: ${dc.dark}; color: ${dc.cream}; padding: clamp(78px, 9vw, 132px) 0; border-top: 1px solid rgba(238,239,211,0.16); }
.bp-close-inner {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.46fr);
  gap: clamp(28px, 5vw, 80px);
  align-items: end;
}
.bp-close h2 { margin: 0; max-width: 12ch; font-size: clamp(42px, 6vw, 92px); line-height: 1.1; letter-spacing: -0.03em; }
.bp-close p { margin: 18px 0 0; max-width: 54ch; color: rgba(238,239,211,0.70); font-size: 17px; line-height: 1.48; letter-spacing: 0; }
.bp-close-panel { border-top: 1px solid rgba(238,239,211,0.20); padding-top: 22px; }
.bp-close-panel .bp-actions { margin-top: 22px; }
@media (max-width: 1100px) {
  .bp-dossier-top, .bp-dossier-bottom, .bp-file-grid, .bp-close-inner { grid-template-columns: 1fr; }
  .bp-dossier-side, .bp-dossier-block { border-left: 0; border-right: 0; border-top: 1px solid rgba(238,239,211,0.12); }
  .bp-spec-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bp-spec:nth-child(2) { border-right: 0; }
  .bp-spec:nth-child(-n+2) { border-bottom: 1px solid rgba(238,239,211,0.12); }
}
@media (max-width: 991px) {
  .bp-hero { min-height: auto; align-items: end; background-position: 58% center; }
  .bp-hero-copy { padding-top: 72px; }
  .bp-section-head, .bp-workbench-grid { grid-template-columns: 1fr; }
  .bp-profile-list { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bp-card-grid { grid-template-columns: 1fr 1fr; }
  .bp-card, .bp-card:nth-child(1), .bp-card:nth-child(5) { grid-column: span 1; }
}
@media (max-width: 640px) {
  .bp-hero {
    background:
      linear-gradient(180deg, rgba(0,55,56,0.96) 0%, rgba(0,55,56,0.86) 55%, rgba(0,55,56,0.60) 100%),
      url("/img/resources/financial_dashboard.png") 56% center / cover no-repeat;
  }
  .bp-hero h1 { font-size: clamp(46px, 13.8vw, 62px); max-width: 8.5ch; }
  .bp-hero-lead { font-size: 16px; }
  .bp-hero-metrics { grid-template-columns: 1fr; }
  .bp-hero-metric, .bp-hero-metric + .bp-hero-metric, .bp-hero-metric:last-child { padding: 14px 0; border-right: 0; border-bottom: 1px solid rgba(238,239,211,0.16); }
  .bp-hero-metric:last-child { border-bottom: 0; }
  .bp-rail-inner { grid-template-columns: 1fr; }
  .bp-profile-list, .bp-card-grid, .bp-spec-grid { grid-template-columns: 1fr; }
  .bp-spec, .bp-spec:nth-child(2) { border-right: 0; border-bottom: 1px solid rgba(238,239,211,0.12); }
  .bp-spec:last-child { border-bottom: 0; }
  .bp-dossier-main, .bp-dossier-side, .bp-dossier-block { padding: 24px 18px; }
  .bp-redflag-row { grid-template-columns: 1fr; gap: 8px; }
  .bp-severity { justify-self: start; }
  .bp-btn { width: 100%; }
}
`;

function getHashProfileId() {
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace(/^#/, "");
  return PROFILES.some((profile) => profile.id === id) ? id : null;
}

function scrollToWorkbench() {
  document.getElementById("profile-workbench")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function PrimaryActions({
  onQualify,
  onCalculator,
  light = false,
}: {
  onQualify: () => void;
  onCalculator: () => void;
  light?: boolean;
}) {
  return (
    <div className="bp-actions">
      <button className="bp-btn bp-btn-primary" type="button" onClick={onQualify}>
        <ShieldCheck size={18} strokeWidth={2} />
        Price my borrower lane
        <ArrowRight size={17} strokeWidth={2.1} />
      </button>
      <button className="bp-btn bp-btn-secondary" type="button" onClick={onCalculator} style={light ? { color: dc.dark, borderColor: "rgba(0,55,56,0.22)" } : undefined}>
        <Calculator size={18} strokeWidth={2} />
        Run the DSCR calculator
      </button>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bp-spec">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function BorrowerProfilesPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  void onBack;
  const [activeId, setActiveId] = useState(() => getHashProfileId() ?? PROFILES[0].id);
  const active = useMemo(() => PROFILES.find((p) => p.id === activeId) ?? PROFILES[0], [activeId]);
  const ActiveIcon = active.icon;

  useEffect(() => {
    document.title = "Borrower Profiles | Greenstreet Finance";
    const applyHash = (shouldScroll: boolean) => {
      const hashProfile = getHashProfileId();
      if (hashProfile) {
        setActiveId(hashProfile);
        if (shouldScroll) {
          window.setTimeout(scrollToWorkbench, 120);
        }
        return;
      }
      window.scrollTo(0, 0);
    };
    applyHash(true);
    const onHashChange = () => applyHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const qualify = () => {
    if (typeof window !== "undefined" && (window as any).openQualify) {
      (window as any).openQualify();
      return;
    }
    onNavigate("dscr-calculator");
  };
  const calc = () => onNavigate("dscr-calculator");
  const chooseProfile = (id: string, shouldScroll = false) => {
    setActiveId(id);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", `/borrower-profiles#${id}`);
    }
    if (shouldScroll) scrollToWorkbench();
  };

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{PAGE_CSS}</style>
      <div className="bp-page">
        <section className="bp-hero" aria-labelledby="bp-hero-title">
          <div className="bp-wrap">
            <div className="bp-hero-copy">
              <div className="bp-eyebrow">Borrower profile desk</div>
              <h1 id="bp-hero-title">Match the borrower before you quote the deal.</h1>
              <p className="bp-hero-lead">
                Greenstreet routes DSCR loans by borrower lane, property income, reserves, entity structure, and state risk. Pick the profile first, then price the loan with the right documents on the desk.
              </p>
              <PrimaryActions onQualify={qualify} onCalculator={calc} />
              <div className="bp-hero-metrics" aria-label="Borrower profile coverage">
                <div className="bp-hero-metric">
                  <strong>5</strong>
                  <span>borrower lanes</span>
                </div>
                <div className="bp-hero-metric">
                  <strong>0</strong>
                  <span>income docs first</span>
                </div>
                <div className="bp-hero-metric">
                  <strong>60s</strong>
                  <span>preliminary DSCR pass</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bp-rail" aria-label="Borrower profile shortcuts">
          <div className="bp-rail-inner">
            <div className="bp-rail-label">Choose a lane</div>
            <div className="bp-rail-buttons">
              {PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={`bp-chip${profile.id === activeId ? " is-active" : ""}`}
                  onClick={() => chooseProfile(profile.id, true)}
                >
                  {profile.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="profile-workbench" className="bp-section bp-workbench">
          <div className="bp-wrap">
            <div className="bp-section-head">
              <div>
                <div className="bp-eyebrow" style={{ color: dc.rain }}>Profile workbench</div>
                <h2>One screen for the lane, the terms, and the trap doors.</h2>
              </div>
              <p className="bp-section-copy">
                The old page made users read five long essays. This version behaves like an intake desk: choose the borrower, see the underwriting lane, then check what can stop the file before anyone locks a rate.
              </p>
            </div>

            <div className="bp-workbench-grid">
              <div className="bp-profile-list" aria-label="Borrower lanes">
                {PROFILES.map((profile) => {
                  const Icon = profile.icon;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      className={`bp-profile-button${profile.id === activeId ? " is-active" : ""}`}
                      onClick={() => chooseProfile(profile.id)}
                      aria-pressed={profile.id === activeId}
                    >
                      <span className="bp-profile-icon"><Icon size={19} strokeWidth={2} /></span>
                      <span>
                        <span className="bp-profile-label">{profile.label}</span>
                        <span className="bp-profile-kicker">{profile.kicker}</span>
                      </span>
                      <ArrowRight size={17} strokeWidth={2} />
                    </button>
                  );
                })}
              </div>

              <article className="bp-dossier" aria-live="polite">
                <div className="bp-dossier-top">
                  <div className="bp-dossier-main">
                    <div className="bp-mini-label">{active.complexity} complexity</div>
                    <h3>{active.label}</h3>
                    <p className="bp-dossier-fit">{active.fit}</p>
                    <p className="bp-dossier-fit"><strong style={{ color: dc.lemon }}>Decision rule:</strong> {active.decision}</p>
                    <PrimaryActions onQualify={qualify} onCalculator={calc} />
                  </div>
                  <aside className="bp-dossier-side" aria-label={`${active.label} DSCR illustration`}>
                    <ActiveIcon size={34} strokeWidth={1.8} />
                    <DscrGauge value={active.dscr} size={230} label={true} />
                    <div className="bp-gauge-caption">
                      Illustrative DSCR for this lane
                    </div>
                  </aside>
                </div>

                <div className="bp-spec-grid">
                  <Spec label="Program" value={active.program} />
                  <Spec label="Leverage" value={active.ltv} />
                  <Spec label="Credit" value={active.fico} />
                  <Spec label="Reserves" value={active.reserves} />
                </div>

                <div className="bp-dossier-bottom">
                  <div className="bp-dossier-block">
                    <div className="bp-mini-label">Use this lane when</div>
                    <div className="bp-dossier-list">
                      {active.useWhen.map((item) => (
                        <div className="bp-dossier-item" key={item}>
                          <CheckCircle2 size={18} strokeWidth={2.1} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bp-dossier-block">
                    <div className="bp-mini-label">Watch before lock</div>
                    <div className="bp-dossier-list">
                      {active.watch.map((item) => (
                        <div className="bp-dossier-item is-risk" key={item}>
                          <AlertTriangle size={18} strokeWidth={2.1} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bp-dossier-actions">
                      {active.docs.map((doc) => (
                        <span className="bp-chip" key={doc}>{doc}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="bp-note">
              <ComplianceNote tone="verify">
                Program terms on this page are illustrative examples for scenario triage, not a rate sheet or a commitment to lend. Confirm current rates, LTV caps, DSCR minimums, reserves, state rules, and foreign-national eligibility before relying on them.
              </ComplianceNote>
            </div>
          </div>
        </section>

        <section className="bp-section bp-matrix">
          <div className="bp-wrap">
            <div className="bp-section-head">
              <div>
                <div className="bp-eyebrow" style={{ color: dc.rain }}>Comparison matrix</div>
                <h2>Every profile should feel like a real underwriting path.</h2>
              </div>
              <p className="bp-section-copy">
                The cards below are not generic personas. Each one carries a different document burden, pricing story, reserve expectation, and risk flag.
              </p>
            </div>
            <div className="bp-card-grid">
              {PROFILES.map((profile) => {
                const Icon = profile.icon;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    className={`bp-card${profile.id === activeId ? " is-active" : ""}`}
                    onClick={() => chooseProfile(profile.id, true)}
                  >
                    <span>
                      <span className="bp-card-top">
                        <span className="bp-card-icon"><Icon size={21} strokeWidth={2} /></span>
                        <Mono style={{ fontSize: 18, fontWeight: 800 }}>{profile.dscr.toFixed(2)}x</Mono>
                      </span>
                      <h3>{profile.label}</h3>
                      <p>{profile.fit}</p>
                    </span>
                    <span className="bp-card-meta">
                      <span>
                        <span>Program</span>
                        <strong>{profile.program}</strong>
                      </span>
                      <span>
                        <span>Pricing read</span>
                        <strong>{profile.priceBand}</strong>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bp-section bp-file">
          <div className="bp-wrap bp-file-grid">
            <div>
              <div className="bp-eyebrow" style={{ color: dc.rain }}>Submission file</div>
              <h2>Make the borrower profile prove itself.</h2>
              <p className="bp-section-copy" style={{ marginTop: 22 }}>
                A profile page should not stop at marketing copy. These are the four evidence groups that decide whether the file reaches pricing cleanly or comes back with conditions.
              </p>
            </div>
            <div className="bp-doc-list">
              {DOCS.map((doc, index) => {
                const icons = [FileCheck, ShieldCheck, BarChart3, AlertTriangle] as const;
                const Icon = icons[index] ?? FileCheck;
                return (
                  <div className="bp-doc-row" key={doc.title}>
                    <Icon size={26} strokeWidth={1.9} />
                    <div>
                      <h3>{doc.title}</h3>
                      <p>{doc.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bp-section bp-redflags">
          <div className="bp-wrap">
            <div className="bp-section-head">
              <div>
                <div className="bp-eyebrow">Strict file audit</div>
                <h2>These are the profile failures that deserve the spotlight.</h2>
              </div>
              <p className="bp-section-copy">
                The redesign puts the risks where users actually make choices. No buried warning paragraphs, no soft disclaimer after the decision has already been made.
              </p>
            </div>
            <div className="bp-redflag-list">
              {RED_FLAGS.map((flag) => (
                <div className="bp-redflag-row" key={flag.label}>
                  <strong>{flag.label}</strong>
                  <p>{flag.detail}</p>
                  <span className="bp-severity">{flag.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bp-close">
          <div className="bp-wrap bp-close-inner">
            <div>
              <div className="bp-eyebrow">Ready to test the file</div>
              <h2>Price the borrower lane before you chase the rate.</h2>
              <p>
                Enter the property details, DSCR inputs, and borrower lane. Greenstreet can return a preliminary program match before the file turns into a week of back-and-forth conditions.
              </p>
            </div>
            <div className="bp-close-panel">
              <Mono style={{ color: dc.lemon, fontSize: 34, fontWeight: 800 }}>profile &gt; terms &gt; decision</Mono>
              <PrimaryActions onQualify={qualify} onCalculator={calc} />
            </div>
          </div>
        </section>
      </div>
    </DcShell>
  );
}
