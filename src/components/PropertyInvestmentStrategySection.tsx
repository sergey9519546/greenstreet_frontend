import React, { useState } from "react";
import { dc, Mono, H2, Lead } from "../design/dc";
import { radius } from "../theme";

export interface PropertyStrategyDetail {
  id: string;
  tabLabel: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  maxLtv: string;
  minDscr: string;
  bestLoanStructure: string;
  qualifyingIncomeBasis: string;
  reservesNeeded: string;
  targetInvestorProfile: string;
  strategySummary: string;
  whyThisLoanFits: string;
  taxEdge: string;
  keyGuidelines: string[];
  ctaPrimaryText: string;
  ctaPrimaryTarget: string;
}

export const PROPERTY_STRATEGIES: PropertyStrategyDetail[] = [
  {
    id: "SFR",
    tabLabel: "Single Family (1-Unit)",
    title: "Single Family Rental (SFR)",
    subtitle: "1-Unit Detached Homes, Townhomes & PUDs",
    image: "/img/properties/sfr_bungalow.jpg",
    badge: "Rental DSCR Scenario",
    maxLtv: "80% LTV",
    minDscr: "0.75x Min DSCR",
    bestLoanStructure: "30-Year Fixed or 5/6 ARM",
    qualifyingIncomeBasis: "LOWER of Signed Lease or Form 1007 Appraisal Market Rent",
    reservesNeeded: "3–6 Months PITIA Liquidity",
    targetInvestorProfile: "Buy-and-Hold Investors seeking long-term debt lock with zero W-2/Tax Return friction.",
    strategySummary: "Single Family Residential is the bedrock of DSCR lending. Qualification is 100% property-based using appraised market rent (FNMA Form 1007) or active lease agreement.",
    whyThisLoanFits: "A 30-Year Fixed DSCR loan locks low debt service for three decades with no refinancing risk. Switch to a 5/6 ARM if initial rate buydown is needed to clear 1.25x DSCR.",
    taxEdge: "Reclassify 20–25% of building basis into 5/7/15-year bonus depreciation under OBBBA rules, creating massive year-1 passive loss offsets.",
    keyGuidelines: [
      "No personal tax returns, W-2s, or DTI calculation required",
      "Qualify at 0.75x–1.00x DSCR with LTV adjustments (up to 80% LTV at 1.25x+)",
      "Borrower can vest in an LLC, S-Corp, C-Corp, or Individual name",
      "Unrestricted prepayment penalty options in 40+ states (5/4/3/2/1 or 3/2/1)"
    ],
    ctaPrimaryText: "Price a Single Family Deal →",
    ctaPrimaryTarget: "dscr-calculator"
  },
  {
    id: "2-4_UNIT",
    tabLabel: "2–4 Unit Multi-Family",
    title: "2–4 Unit Residential Multi-Family",
    subtitle: "Duplex, Triplex & Fourplex Properties",
    image: "/img/properties/duplex_craftsman.jpg",
    badge: "Maximum Cash Flow",
    maxLtv: "75% LTV",
    minDscr: "1.00x Min DSCR",
    bestLoanStructure: "30-Year Fixed with 10-Year Interest-Only (I/O)",
    qualifyingIncomeBasis: "Combined Gross Rent across all 2, 3, or 4 units (Form 1007 or Leases)",
    reservesNeeded: "6 Months PITIA Liquidity",
    targetInvestorProfile: "Cash-flow investors compounding rental yield across multi-tenant residential properties.",
    strategySummary: "Duplexes, triplexes, and fourplexes generate superior gross yield per door. Combining income across multiple units easily pushes DSCR past 1.30x.",
    whyThisLoanFits: "An Interest-Only 10/30 structure lowers monthly debt service by ~20–25% during the first decade, dramatically boosting Cash-on-Cash returns while preserving principal paydown flexibility.",
    taxEdge: "Multi-unit properties yield higher cost-segregation reclassification ratios for shared HVAC, paving, and exterior lighting systems.",
    keyGuidelines: [
      "Gross rent combines all occupied and vacant units (vacant units use Form 1007)",
      "75% Max LTV on purchases; 70% Max LTV on cash-out refinances",
      "LLC vesting strongly recommended for liability shielding across multi-tenant properties",
      "Short-term rental fallback: qualify units as STR or LTR independently"
    ],
    ctaPrimaryText: "Calculate Duplex/4-Plex DSCR →",
    ctaPrimaryTarget: "dscr-calculator"
  },
  {
    id: "5+_UNIT",
    tabLabel: "5+ Unit Commercial",
    title: "5+ Unit Commercial Multi-Family",
    subtitle: "5 to 36-Unit Apartment Buildings & Complexes",
    image: "/img/properties/multifamily_brownstone.jpg",
    badge: "Commercial Debt Yield",
    maxLtv: "75% LTV",
    minDscr: "1.15x Min DSCR",
    bestLoanStructure: "30-Year Commercial Amortization or 5-Year Hybrid IO",
    qualifyingIncomeBasis: "Net Operating Income (NOI) after 15% OPEX & Vacancy Haircut",
    reservesNeeded: "6–12 Months PITIA Liquidity",
    targetInvestorProfile: "Commercial real estate syndicators, mid-size portfolio operators, and family offices.",
    strategySummary: "Commercial multi-family DSCR loans bridge residential non-QM with institutional commercial underwriting. Valuations are driven by NOI and capitalization rates rather than residential comps.",
    whyThisLoanFits: "Commercial DSCR eliminates full commercial bank underwriting friction (no personal financial statements, tax returns, or global cash flow analysis required).",
    taxEdge: "Accelerate depreciation on 5-year appliances and 15-year site improvements for high-volume paper losses.",
    keyGuidelines: [
      "Underwritten on Debt Yield (NOI ÷ Loan Amount ≥ 8.5%–9.5%)",
      "51%+ Residential square footage required",
      "Non-recourse financing available on loans over $1,000,000",
      "Entity vesting required (LLC or Corporation)"
    ],
    ctaPrimaryText: "Analyze Commercial 5+ Deal →",
    ctaPrimaryTarget: "commercial-dscr"
  },
  {
    id: "CONDO",
    tabLabel: "Condos & High-Rises",
    title: "Condominiums & Urban High-Rises",
    subtitle: "Warrantable, Non-Warrantable Condos & Condotels",
    image: "/img/properties/condo_highrise.jpg",
    badge: "Urban Flexibility",
    maxLtv: "75% LTV",
    minDscr: "1.00x Min DSCR",
    bestLoanStructure: "30-Year Fixed or 7/6 ARM",
    qualifyingIncomeBasis: "Appraised Market Rent minus Monthly HOA Assessment Dues",
    reservesNeeded: "6 Months PITIA Liquidity",
    targetInvestorProfile: "Urban real estate investors seeking high-liquidity condo units in prime metropolitan downtowns.",
    strategySummary: "Condos often fail conventional Fannie/Freddie guidelines due to single-entity owner concentration, deferred maintenance, or active HOA litigation. DSCR non-QM fills this exact gap.",
    whyThisLoanFits: "Non-Warrantable Condo DSCR programs allow up to 25% single-entity ownership and accept ongoing HOA litigation provided budget reserves remain sound.",
    taxEdge: "Urban condos provide clean turn-key operations with HOA covering exterior maintenance and insurance.",
    keyGuidelines: [
      "Warrantable Condos up to 80% LTV; Non-Warrantable Condos up to 75% LTV",
      "Condotels (resort condo-hotels with front desk) qualified under STR guidelines",
      "HOA master insurance policy must cover 100% replacement cost",
      "Single-entity concentration cap waived up to 25% of total project units"
    ],
    ctaPrimaryText: "Explore Condo DSCR Terms →",
    ctaPrimaryTarget: "dscr-calculator"
  },
  {
    id: "STR",
    tabLabel: "Short-Term Rentals (STR)",
    title: "Short-Term Rentals & Resort Cabins",
    subtitle: "Airbnbs, VRBOs & Vacation Market Properties",
    image: "/img/properties/str_cabin.jpg",
    badge: "AirDNA / Rabbu",
    maxLtv: "75% LTV",
    minDscr: "1.00x Min DSCR",
    bestLoanStructure: "5/6 ARM or 10-Year Interest-Only",
    qualifyingIncomeBasis: "AirDNA / Rabbu 50th Percentile (20% haircut) OR 100% 12-Mo Platform Actuals",
    reservesNeeded: "6–12 Months PITIA Liquidity",
    targetInvestorProfile: "Vacation rental operators, short-term rental investors, and boutique hospitality hosts.",
    strategySummary: "Short-Term Rentals generate 1.5x–2.5x higher gross revenue than long-term leases. DSCR STR underwriting enables qualification on projected short-term revenue rather than low long-term rents.",
    whyThisLoanFits: "By using AirDNA or Rabbu 50th-percentile projected revenue (with a standard 20% haircut), your property qualifies at its true earning potential without requiring 2 years of tax returns.",
    taxEdge: "Combine short-term rental tax strategies (Section 469 STR loophole) with cost-segregation for active tax deduction benefits.",
    keyGuidelines: [
      "World 1: LTR Form 1007 fallback if municipal regulations restrict short-term rentals",
      "World 2: AirDNA / Rabbu projected revenue with 20% haircut for new acquisitions",
      "World 3: 100% of 12-month documented Airbnb/VRBO actual payouts (10% haircut)",
      "5-Point Legality Check: Verified municipal permit, zoning compliance, and HOA CC&R clearance"
    ],
    ctaPrimaryText: "Run STR Underwriting Suite →",
    ctaPrimaryTarget: "str-underwriting"
  },
  {
    id: "MIXED_USE",
    tabLabel: "Commercial & Mixed-Use",
    title: "Commercial & Mixed-Use Storefronts",
    subtitle: "Ground Floor Retail / Office with Apartments Above",
    image: "/img/properties/mixed_use_storefront.jpg",
    badge: "Hybrid Commercial",
    maxLtv: "70% LTV",
    minDscr: "1.20x Min DSCR",
    bestLoanStructure: "30-Year Commercial Amortization or 5-Yr Fixed ARM",
    qualifyingIncomeBasis: "Combined Commercial Lease Income + Residential Apartment Rent",
    reservesNeeded: "6–12 Months PITIA Liquidity",
    targetInvestorProfile: "Main Street investors, urban commercial landlords, and value-add mixed-use developers.",
    strategySummary: "Mixed-use storefront properties offer dual revenue streams: stable long-term commercial retail tenants on NNN leases combined with residential apartment rents above.",
    whyThisLoanFits: "DSCR Mixed-Use underwriting accepts commercial NNN lease credit alongside residential leases while maintaining simplified non-QM approval timelines.",
    taxEdge: "Commercial storefront improvements qualify for accelerated 15-year qualified leasehold improvement depreciation.",
    keyGuidelines: [
      "Property must be at least 51% residential square footage",
      "Commercial tenants require active lease agreement or 12-month payment proof",
      "70% Max Purchase LTV; 65% Max Cash-Out LTV",
      "LLC or Corporate entity vesting mandatory"
    ],
    ctaPrimaryText: "Analyze Mixed-Use Deal →",
    ctaPrimaryTarget: "commercial-dscr"
  }
];

export default function PropertyInvestmentStrategySection({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>("SFR");
  const activeStrategy = PROPERTY_STRATEGIES.find((s) => s.id === selectedId) || PROPERTY_STRATEGIES[0];

  const handleCtaClick = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.href = "/" + target;
    }
  };

  return (
    <section
      style={{
        background: dc.dark,
        color: dc.cream,
        padding: "clamp(56px, 8vw, 104px) clamp(1.5rem, 4vw, 3rem)",
        borderTop: "1px solid rgba(238,239,211,0.08)",
        borderBottom: "1px solid rgba(238,239,211,0.08)",
      }}
      id="property-strategy-section"
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: dc.lemon,
              marginBottom: 10,
            }}
          >
            Property & Investment Strategy Master Guide
          </div>
          <H2 style={{ color: dc.cream, fontSize: "clamp(30px, 4vw, 54px)", marginBottom: 16, lineHeight: 1.05 }}>
            Which Property Class Are You Financing?
          </H2>
          <Lead style={{ color: "rgba(238,239,211,0.68)", maxWidth: "62ch", margin: "0 auto" }}>
            Every property type has its own optimal DSCR loan structure, income qualification basis, and leverage ceiling. Select a property class below to see how to structure your deal.
          </Lead>
        </div>

        {/* 6 Property Type Selector Tabs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 44,
          }}
        >
          {PROPERTY_STRATEGIES.map((item) => {
            const isActive = item.id === selectedId;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                style={{
                  padding: "12px 20px",
                  borderRadius: radius.sm,
                  background: isActive ? dc.lemon : "rgba(238, 239, 211, 0.06)",
                  color: isActive ? dc.dark : "rgba(238, 239, 211, 0.8)",
                  border: isActive ? `1px solid ${dc.lemon}` : "1px solid rgba(238, 239, 211, 0.16)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: dc.sans,
                  minHeight: 44,
                }}
              >
                {item.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Active Property Investment Strategy Card Container */}
        <div
          style={{
            background: "rgba(0, 55, 56, 0.5)",
            borderRadius: radius.lg,
            border: "1px solid rgba(238, 239, 211, 0.18)",
            padding: "clamp(24px, 4vw, 44px)",
            display: "grid",
            gridTemplateColumns: "minmax(300px, 440px) 1fr",
            gap: "clamp(24px, 4vw, 48px)",
            alignItems: "start",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          {/* Left Column: Hand-Drawn Architectural Artwork Frame */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                position: "relative",
                borderRadius: radius.md,
                overflow: "hidden",
                border: `2px solid ${dc.lemon}`,
                background: "#f7f6f0", // Warm cream architectural paper
                boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={activeStrategy.image}
                alt={activeStrategy.title}
                style={{ width: "100%", height: 320, objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: dc.dark,
                  color: dc.lemon,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: 100,
                  border: `1px solid ${dc.lemon}`,
                  letterSpacing: "0.04em",
                }}
              >
                {activeStrategy.badge}
              </div>
            </div>

            {/* Quick Metrics Callout Box */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                background: "rgba(238, 239, 211, 0.05)",
                padding: "16px 18px",
                borderRadius: radius.sm,
                border: "1px solid rgba(238, 239, 211, 0.12)",
              }}
            >
              <div>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                  Max Purchase LTV
                </span>
                <Mono style={{ fontSize: 20, fontWeight: 700, color: dc.rain }}>
                  {activeStrategy.maxLtv}
                </Mono>
              </div>
              <div style={{ borderLeft: "1px solid rgba(238,239,211,0.12)", paddingLeft: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                  Min Coverage Floor
                </span>
                <Mono style={{ fontSize: 20, fontWeight: 700, color: dc.lemon }}>
                  {activeStrategy.minDscr}
                </Mono>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Underwriting Strategy & Integrated CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Underwriting Blueprint
              </div>
              <h3 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 700, color: dc.cream, margin: "0 0 8px" }}>
                {activeStrategy.title}
              </h3>
              <div style={{ fontSize: 14, color: "rgba(238,239,211,0.65)", fontWeight: 500 }}>
                {activeStrategy.subtitle}
              </div>
            </div>

            <p style={{ fontSize: 15, color: "rgba(238,239,211,0.85)", lineHeight: 1.6, margin: 0 }}>
              {activeStrategy.strategySummary}
            </p>

            {/* Structuring Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div style={{ background: "rgba(0, 55, 56, 0.6)", padding: "14px 16px", borderRadius: radius.sm, border: "1px solid rgba(238,239,211,0.1)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: dc.emerald, textTransform: "uppercase", marginBottom: 4 }}>Recommended Debt Structure</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: dc.cream }}>{activeStrategy.bestLoanStructure}</div>
              </div>
              <div style={{ background: "rgba(0, 55, 56, 0.6)", padding: "14px 16px", borderRadius: radius.sm, border: "1px solid rgba(238,239,211,0.1)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: dc.emerald, textTransform: "uppercase", marginBottom: 4 }}>Income Qualification Basis</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: dc.cream }}>{activeStrategy.qualifyingIncomeBasis}</div>
              </div>
            </div>

            {/* Why This Loan Fits & Tax Edge */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, color: "rgba(238,239,211,0.8)", lineHeight: 1.5 }}>
                <strong style={{ color: dc.lemon }}>Loan Fit: </strong> {activeStrategy.whyThisLoanFits}
              </div>
              <div style={{ fontSize: 13, color: "rgba(238,239,211,0.8)", lineHeight: 1.5 }}>
                <strong style={{ color: dc.rain }}>Tax & Depreciation Edge: </strong> {activeStrategy.taxEdge}
              </div>
            </div>

            {/* Key Guidelines Checklist */}
            <div style={{ background: "rgba(238,239,211,0.04)", padding: "18px 20px", borderRadius: radius.sm, border: "1px solid rgba(238,239,211,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: dc.cream, marginBottom: 10, textTransform: "uppercase" }}>
                Underwriting & Eligibility Check
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {activeStrategy.keyGuidelines.map((rule, idx) => (
                  <li key={idx} style={{ fontSize: 13, color: "rgba(238,239,211,0.78)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: dc.lemon, fontWeight: "bold" }}>✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── MERGED MASTER CALL TO ACTION (CTA) ── */}
            <div
              style={{
                marginTop: 10,
                padding: "24px 28px",
                background: "linear-gradient(135deg, rgba(216, 217, 88, 0.12) 0%, rgba(0, 101, 101, 0.25) 100%)",
                borderRadius: radius.md,
                border: `1.5px solid ${dc.lemon}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: dc.cream, marginBottom: 4 }}>
                  Ready to price a {activeStrategy.title}?
                </div>
                <div style={{ fontSize: 13, color: "rgba(238,239,211,0.7)" }}>
                  Run live DSCR coverage, PITIA payment breakdown, and lender program matching instantly.
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleCtaClick(activeStrategy.ctaPrimaryTarget)}
                  style={{
                    background: dc.lemon,
                    color: dc.dark,
                    fontWeight: 700,
                    fontSize: 15,
                    padding: "14px 26px",
                    borderRadius: radius.sm,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: dc.sans,
                    boxShadow: "0 4px 14px rgba(216, 217, 88, 0.3)",
                    transition: "transform 0.15s ease",
                    minHeight: 44,
                  }}
                >
                  {activeStrategy.ctaPrimaryText}
                </button>

                <button
                  type="button"
                  onClick={() => handleCtaClick("book-demo")}
                  style={{
                    background: "transparent",
                    color: dc.cream,
                    fontWeight: 600,
                    fontSize: 14,
                    padding: "13px 20px",
                    borderRadius: radius.sm,
                    border: "1px solid rgba(238,239,211,0.3)",
                    cursor: "pointer",
                    fontFamily: dc.sans,
                    minHeight: 44,
                  }}
                >
                  Book 15-Min Strategy Session →
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
