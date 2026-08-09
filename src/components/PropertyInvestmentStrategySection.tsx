import React, { useState } from "react";
import { Btn } from "../design/dc";
import "./PropertyInvestmentStrategySection.css";

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
  advantages: string[];
  tradeoffs: string[];
  dueDiligence: string;
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
    advantages: [
      "Deep tenant demand and familiar lease structures in most markets",
      "Straightforward comparable sales can support valuation and resale",
      "Simpler operations than multi-tenant or mixed-use properties",
    ],
    tradeoffs: [
      "One vacancy can remove the property's entire rental income",
      "A major repair is supported by only one rent stream",
      "Scaling a scattered portfolio can increase travel and vendor complexity",
    ],
    dueDiligence: "Stress one full vacancy, a major system replacement, and realistic property-management costs before relying on the headline cash flow.",
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
    advantages: [
      "Multiple leases reduce dependence on any single tenant",
      "Shared roofs, land, and systems can improve cost per rentable unit",
      "Residential-sized properties may have a broader resale audience than larger apartments",
    ],
    tradeoffs: [
      "Shared walls and common systems can create tenant and maintenance friction",
      "Utility metering and expense allocation require careful review",
      "Several turnovers or repairs can occur at the same time",
    ],
    dueDiligence: "Verify legal unit count, separate utility arrangements, current leases, and the condition of shared mechanical and life-safety systems.",
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
    advantages: [
      "Diversified rent across more doors can soften a single vacancy",
      "Professional operations can create repeatable leasing and maintenance systems",
      "Value may improve when durable net operating income increases",
    ],
    tradeoffs: [
      "Commercial underwriting, reporting, and reserves are more demanding",
      "Payroll, insurance, and deferred capital work can move NOI quickly",
      "Exit value is sensitive to both income and market capitalization rates",
    ],
    dueDiligence: "Rebuild trailing NOI from source documents, inspect deferred maintenance, and model a higher exit cap rate rather than relying on the seller's pro forma.",
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
    advantages: [
      "Exterior maintenance is often handled through the association",
      "Urban locations can offer durable renter demand and walkable amenities",
      "Entry price may be lower than a detached home in the same neighborhood",
    ],
    tradeoffs: [
      "HOA dues and special assessments can reduce cash flow without warning",
      "Rental caps, litigation, insurance gaps, or concentration can limit financing",
      "Owners have limited control over common-area budgets and repairs",
    ],
    dueDiligence: "Read the budget, reserve study, insurance certificate, meeting minutes, rental rules, litigation disclosures, and pending assessment history.",
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
    advantages: [
      "Nightly pricing can capture high-demand dates and local events",
      "Furnished units can serve several guest and mid-term rental segments",
      "Active revenue management may create more upside than a fixed lease",
    ],
    tradeoffs: [
      "Revenue can be seasonal and sensitive to reviews and platform changes",
      "Cleaning, furnishing, guest support, and utilities increase operating intensity",
      "Local permits, taxes, HOA rules, and neighborhood restrictions can change",
    ],
    dueDiligence: "Confirm current legal use in writing, normalize revenue by month, and include platform fees, lodging taxes, utilities, cleaning, replacement, and management costs.",
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
    advantages: [
      "Residential and commercial leases can diversify the income base",
      "A strong corner or main-street location can support multiple uses",
      "Longer commercial leases may reduce turnover in part of the property",
    ],
    tradeoffs: [
      "Commercial vacancies can last longer and require tenant-improvement capital",
      "Appraisal, zoning, environmental, and lease review are more specialized",
      "Financing options can narrow when the commercial share is too large",
    ],
    dueDiligence: "Review permitted uses, environmental history, commercial lease obligations, tenant improvements, expense reimbursements, and residential-commercial square-foot allocation.",
    keyGuidelines: [
      "Property must be at least 51% residential square footage",
      "Commercial tenants require active lease agreement or 12-month payment proof",
      "70% Max Purchase LTV; 65% Max Cash-Out LTV",
      "LLC or Corporate entity vesting mandatory"
    ],
    ctaPrimaryText: "Analyze Mixed-Use Deal →",
    ctaPrimaryTarget: "commercial-dscr"
  },
  {
    id: "ADU",
    tabLabel: "Home + ADU",
    title: "Primary Rental with an Accessory Dwelling Unit",
    subtitle: "Detached Cottages, Garage Apartments & Legal Secondary Units",
    image: "/img/properties/adu_cottage.jpg",
    badge: "Two-Income Footprint",
    maxLtv: "Program-specific",
    minDscr: "Case-by-case",
    bestLoanStructure: "Existing DSCR or Renovation-to-DSCR, subject to program eligibility",
    qualifyingIncomeBasis: "Documented lease or appraiser-supported market rent; ADU treatment varies by lender",
    reservesNeeded: "Program reserves plus a construction or repair contingency",
    targetInvestorProfile: "Investors seeking two rental streams on one parcel without operating a larger multi-family building.",
    strategySummary: "A legal ADU can add a second rent stream and improve land efficiency, but permitting, utility configuration, appraisal treatment, and lender eligibility must all line up.",
    whyThisLoanFits: "When both units are legal and supported by the appraisal, property cash flow may be evaluated without turning the asset into a conventional duplex. Program treatment varies materially.",
    taxEdge: "Building and land allocations, placed-in-service dates, and shared improvements should be documented with a qualified tax adviser; land itself is not depreciable.",
    advantages: [
      "Two potential rent streams can reduce dependence on one tenant",
      "Adds rentable density without acquiring a second parcel",
      "Can serve long-term, family, or mid-term tenant demand",
    ],
    tradeoffs: [
      "Unpermitted units may receive little or no underwriting credit",
      "Shared utilities, parking, privacy, and access can create operating friction",
      "Construction cost and timeline risk can erase projected returns",
    ],
    dueDiligence: "Confirm permits, certificate of occupancy, utility metering, parking, insurance, rent comparables, and whether the lender and appraiser will recognize the ADU income.",
    keyGuidelines: [
      "Treat projected ADU rent as unverified until the appraisal and program review agree",
      "Model shared and separately metered utility scenarios",
      "Verify local owner-occupancy and short-term-rental restrictions",
      "Keep a construction and lease-up contingency outside operating reserves",
    ],
    ctaPrimaryText: "Model a Home + ADU Scenario →",
    ctaPrimaryTarget: "dscr-calculator"
  },
  {
    id: "STUDENT",
    tabLabel: "Student & Co-Living",
    title: "Student Housing & Co-Living Rentals",
    subtitle: "Room-by-Room Leasing Near Schools and Employment Centers",
    image: "/img/properties/student_coliving.jpg",
    badge: "Higher-Touch Operations",
    maxLtv: "Program-specific",
    minDscr: "Lease-dependent",
    bestLoanStructure: "30-Year DSCR where eligible, with conservative stabilized rent",
    qualifyingIncomeBasis: "Executed leases and market rent; per-bedroom income treatment varies",
    reservesNeeded: "Program reserves plus turnover, furnishing, and make-ready liquidity",
    targetInvestorProfile: "Hands-on operators comfortable with frequent leasing, shared spaces, and concentrated seasonal turnover.",
    strategySummary: "Leasing by the room can increase gross income, but the operating model behaves more like hospitality: frequent turns, shared-space wear, local occupancy rules, and active management matter.",
    whyThisLoanFits: "A DSCR structure may fit when the property remains an eligible residential asset and the rent evidence is acceptable, but some programs will underwrite only a conventional whole-property lease.",
    taxEdge: "Furniture, appliances, and property improvements can have different recovery periods; maintain invoices and confirm treatment with a qualified tax adviser.",
    advantages: [
      "Per-bedroom leasing can produce more gross rent than one household lease",
      "Demand can renew predictably near durable education or employment anchors",
      "Several tenants reduce reliance on one payer when leases are structured well",
    ],
    tradeoffs: [
      "Turnover, cleaning, furnishing, and shared-space maintenance are intensive",
      "Demand and leasing activity can be highly seasonal",
      "Occupancy, parking, unrelated-person, and licensing rules may limit the model",
    ],
    dueDiligence: "Verify occupancy limits and licensing, audit leasing by month, inspect bedroom legality and egress, and model professional management plus a full turnover cycle.",
    keyGuidelines: [
      "Do not assume every per-bedroom lease will receive full underwriting credit",
      "Confirm legal bedroom count, egress, parking, and fire-safety requirements",
      "Budget internet, utilities, furniture, cleaning, and common-area repairs",
      "Stress the summer or off-cycle vacancy period",
    ],
    ctaPrimaryText: "Model a Co-Living Scenario →",
    ctaPrimaryTarget: "dscr-calculator"
  },
  {
    id: "MANUFACTURED",
    tabLabel: "Manufactured & Modular",
    title: "Manufactured & Modular Rental Homes",
    subtitle: "Permanent-Foundation Homes on Owned or Controlled Land",
    image: "/img/properties/manufactured_modular.jpg",
    badge: "Eligibility-Sensitive",
    maxLtv: "Program-specific",
    minDscr: "Case-by-case",
    bestLoanStructure: "Permanent-foundation DSCR or portfolio loan where eligible",
    qualifyingIncomeBasis: "Lease or market rent plus title, foundation, age, and appraisal review",
    reservesNeeded: "Program reserves plus site, utility, and systems contingency",
    targetInvestorProfile: "Yield-focused investors who can verify title, foundation, land control, and local resale depth before acquisition.",
    strategySummary: "Manufactured and modular homes can offer a lower acquisition basis, but financing and resale depend on whether the home is real property, permanently affixed, insurable, and supported by comparable sales.",
    whyThisLoanFits: "Some DSCR and portfolio programs will consider qualifying permanent-foundation homes. Chattel-titled homes, leased land, older units, or thin comparable sets can materially narrow options.",
    taxEdge: "Separate land from depreciable improvements and document site work, utilities, and placed-in-service costs with a qualified tax adviser.",
    advantages: [
      "Lower acquisition basis can improve rent-to-price economics",
      "Factory construction may reduce replacement cost and delivery time",
      "Workforce-housing demand can be resilient in supply-constrained markets",
    ],
    tradeoffs: [
      "Title, foundation, age, HUD-label, and land status can restrict financing",
      "Appraisal comparables and buyer demand may be thinner",
      "Park fees, leased land, utilities, and site infrastructure can add risk",
    ],
    dueDiligence: "Verify real-property title, HUD data plate or modular certification, permanent foundation, land ownership, insurance availability, utility systems, and local comparable sales.",
    keyGuidelines: [
      "Confirm eligibility before ordering an appraisal or relying on leverage",
      "Distinguish manufactured, modular, and mobile-home classifications",
      "Review land lease or park rules when the parcel is not owned",
      "Inspect well, septic, tie-down, foundation, and utility infrastructure",
    ],
    ctaPrimaryText: "Review a Manufactured-Home Scenario →",
    ctaPrimaryTarget: "dscr-calculator"
  },
  {
    id: "BUILD_TO_RENT",
    tabLabel: "Build-to-Rent",
    title: "Build-to-Rent Townhome Communities",
    subtitle: "Purpose-Built Attached Rentals with Shared Operations",
    image: "/img/properties/build_to_rent_townhomes.jpg",
    badge: "Development + Lease-Up",
    maxLtv: "Stage-dependent",
    minDscr: "Stabilized file",
    bestLoanStructure: "Construction or bridge financing, then stabilized DSCR or portfolio debt",
    qualifyingIncomeBasis: "Stabilized rent roll and operating history; pro forma income may be discounted",
    reservesNeeded: "Construction contingency, interest carry, lease-up, and operating reserves",
    targetInvestorProfile: "Experienced sponsors able to manage entitlement, construction, absorption, and institutional-quality property operations.",
    strategySummary: "Build-to-rent combines residential tenant demand with community-scale operations. Standardized units can be efficient, but development and lease-up risks arrive before stabilized DSCR financing is available.",
    whyThisLoanFits: "Permanent DSCR or portfolio debt is generally a takeout strategy after completion and stabilization, not a substitute for construction financing or lease-up capital.",
    taxEdge: "Capitalized development costs, interest carry, placed-in-service timing, and cost segregation require project-level tax and accounting advice.",
    advantages: [
      "Standardized units can simplify turns, maintenance, and vendor purchasing",
      "Multiple homes create diversified rent within one operating footprint",
      "New systems may reduce near-term deferred-maintenance exposure",
    ],
    tradeoffs: [
      "Entitlement, construction, cost-overrun, and completion risks are substantial",
      "Lease-up concentration can expose the entire project to one local demand shock",
      "Infrastructure, amenities, taxes, and insurance can exceed early projections",
    ],
    dueDiligence: "Underwrite land basis, permits, guaranteed-price limitations, infrastructure, absorption pace, concessions, operating payroll, taxes, insurance, and a delayed stabilization case.",
    keyGuidelines: [
      "Separate construction, lease-up, and stabilized financing assumptions",
      "Model slower absorption and higher concessions",
      "Carry interest, taxes, insurance, and operating payroll through stabilization",
      "Confirm the permanent lender's seasoning and occupancy requirements early",
    ],
    ctaPrimaryText: "Stress a Build-to-Rent Plan →",
    ctaPrimaryTarget: "commercial-dscr"
  }
];

export default function PropertyInvestmentStrategySection({
  onNavigate,
  variant = "full",
}: {
  onNavigate?: (view: string) => void;
  variant?: "full" | "homepage";
}) {
  const [selectedId, setSelectedId] = useState<string>("SFR");
  const activeStrategy = PROPERTY_STRATEGIES.find((s) => s.id === selectedId) || PROPERTY_STRATEGIES[0];
  const activeIndex = PROPERTY_STRATEGIES.findIndex((strategy) => strategy.id === activeStrategy.id);
  const tabIdPrefix = variant === "homepage" ? "home-property-strategy" : "property-strategy";

  const revealTab = (button: HTMLButtonElement | null) => {
    if (!button?.scrollIntoView) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    button.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const selectStrategy = (id: string, button: HTMLButtonElement | null) => {
    setSelectedId(id);
    revealTab(button);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % PROPERTY_STRATEGIES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + PROPERTY_STRATEGIES.length) % PROPERTY_STRATEGIES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = PROPERTY_STRATEGIES.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();

    const nextStrategy = PROPERTY_STRATEGIES[nextIndex];
    const nextButton = document.getElementById(`${tabIdPrefix}-tab-${nextStrategy.id}`) as HTMLButtonElement | null;
    setSelectedId(nextStrategy.id);
    nextButton?.focus();
    revealTab(nextButton);
  };

  const handleCtaClick = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.href = "/" + target;
    }
  };

  if (variant === "homepage") {
    return (
      <section
        className="gs-property-home u-theme-light"
        id="property-strategy-home-section"
        aria-labelledby="property-strategy-home-heading"
      >
        <div className="gs-property-home__backdrop" aria-hidden="true">
          <img
            key={activeStrategy.id}
            src={activeStrategy.image}
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="gs-property-home__inner u-container">
          <header className="gs-property-home__intro">
            <div className="gs-property-home__headline">
              <div className="gs-property-home__eyebrow u-text-style-h5">Property field guide</div>
              <h2 className="u-text-style-h2" id="property-strategy-home-heading">
                Which rental model fits the deal?
              </h2>
            </div>
            <div className="gs-property-home__lede">
              <p className="u-text-style-large">
                Property type changes the income story, operating workload, and
                financing path. Compare the upside and the friction before you
                underwrite the headline rent.
              </p>
              <button type="button" onClick={() => handleCtaClick("investors")}>
                Explore the complete investor guide <span aria-hidden="true">→</span>
              </button>
              <div className="gs-property-home__position" aria-live="polite">
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>
                <span>of {PROPERTY_STRATEGIES.length} property lenses</span>
              </div>
            </div>
          </header>

          <div
            className="gs-property-home__rail"
            role="tablist"
            aria-label="Compare investment property types"
          >
            {PROPERTY_STRATEGIES.map((item, index) => {
              const isActive = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  id={`${tabIdPrefix}-tab-${item.id}`}
                  className="gs-property-home__tab"
                  type="button"
                  role="tab"
                  aria-label={item.tabLabel}
                  aria-selected={isActive}
                  aria-controls={`${tabIdPrefix}-panel`}
                  tabIndex={isActive ? 0 : -1}
                  data-active={isActive ? "true" : "false"}
                  onClick={(event) => selectStrategy(item.id, event.currentTarget)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span className="gs-property-home__tab-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="gs-property-home__tab-label">{item.tabLabel}</span>
                </button>
              );
            })}
          </div>

          <article
            className="gs-property-home__story"
            id={`${tabIdPrefix}-panel`}
            role="tabpanel"
            aria-labelledby={`${tabIdPrefix}-tab-${activeStrategy.id}`}
          >
            <div className="gs-property-home__narrative">
              <div className="gs-property-home__content-heading">
                <div className="gs-property-home__eyebrow is-dark">
                  {activeStrategy.badge} · {activeStrategy.subtitle}
                </div>
                <h3 className="u-text-style-h2">{activeStrategy.title}</h3>
                <p>{activeStrategy.strategySummary}</p>
              </div>

              <div className="gs-property-home__actions">
                <Btn
                  label="Model this property"
                  onClick={() => handleCtaClick(activeStrategy.ctaPrimaryTarget)}
                />
                <Btn
                  label="See all investor criteria"
                  variant="secondary"
                  arrow={false}
                  onClick={() => handleCtaClick("investors")}
                />
              </div>
            </div>

            <div className="gs-property-home__details">
              <div className="gs-property-home__underwriting">
                <div>
                  <span>Debt path</span>
                  <strong>{activeStrategy.bestLoanStructure}</strong>
                </div>
                <div>
                  <span>Income evidence</span>
                  <strong>{activeStrategy.qualifyingIncomeBasis}</strong>
                </div>
              </div>

              <div className="gs-property-home__balance">
                <section aria-labelledby="property-home-upside-heading">
                  <h4 id="property-home-upside-heading">The upside</h4>
                  <ul>
                    {activeStrategy.advantages.map((advantage) => (
                      <li key={advantage}>{advantage}</li>
                    ))}
                  </ul>
                </section>
                <section aria-labelledby="property-home-tradeoffs-heading">
                  <h4 id="property-home-tradeoffs-heading">The tradeoffs</h4>
                  <ul>
                    {activeStrategy.tradeoffs.map((tradeoff) => (
                      <li key={tradeoff}>{tradeoff}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <aside className="gs-property-home__checkpoint">
                <span>Decision checkpoint</span>
                <p>{activeStrategy.dueDiligence}</p>
              </aside>
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section
      className="gs-property-guide u-theme-dark"
      id="property-strategy-section"
      aria-labelledby="property-strategy-heading"
    >
      <div className="gs-property-guide__backdrop" aria-hidden="true">
        <img
          key={activeStrategy.id}
          src={activeStrategy.image}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="gs-property-guide__shell u-container">
        <header className="gs-property-guide__intro">
          <div>
            <div className="gs-property-guide__eyebrow u-text-style-h5">
              Property &amp; investment strategy field guide
            </div>
            <h2 className="u-text-style-h2" id="property-strategy-heading">
              Choose the property. Then choose the debt.
            </h2>
          </div>

          <div className="gs-property-guide__lede">
            <p className="u-text-style-large">
              Every rental model has a different income story, operating burden,
              and leverage ceiling. Select a property lens to see the case for it,
              the friction against it, and the evidence an underwriter will ask for.
            </p>
            <div className="gs-property-guide__counter" aria-live="polite">
              <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
              <span>/ {String(PROPERTY_STRATEGIES.length).padStart(2, "0")} lenses</span>
            </div>
          </div>
        </header>

        <div className="gs-property-guide__workspace">
          <div
            className="gs-property-guide__index"
            role="tablist"
            aria-label="Investment property types"
            aria-orientation="horizontal"
          >
            {PROPERTY_STRATEGIES.map((item, index) => {
              const isActive = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  id={`property-strategy-tab-${item.id}`}
                  className="gs-property-guide__tab"
                  type="button"
                  role="tab"
                  aria-label={item.tabLabel}
                  aria-selected={isActive}
                  aria-controls="property-strategy-panel"
                  tabIndex={isActive ? 0 : -1}
                  data-active={isActive ? "true" : "false"}
                  onClick={(event) => selectStrategy(item.id, event.currentTarget)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.tabLabel}</strong>
                </button>
              );
            })}
          </div>

          <article
            className="gs-property-guide__canvas"
            id="property-strategy-panel"
            role="tabpanel"
            aria-labelledby={`property-strategy-tab-${activeStrategy.id}`}
          >
            <header className="gs-property-guide__identity">
              <div className="gs-property-guide__eyebrow is-accent">
                Lens {String(activeIndex + 1).padStart(2, "0")} · {activeStrategy.badge}
              </div>
              <h3 className="u-text-style-h2">{activeStrategy.title}</h3>
              <div className="gs-property-guide__subtitle u-text-style-large">{activeStrategy.subtitle}</div>
              <p>{activeStrategy.strategySummary}</p>
            </header>

            <dl className="gs-property-guide__metrics">
              <div>
                <dt>Leverage signal</dt>
                <dd>{activeStrategy.maxLtv}</dd>
              </div>
              <div>
                <dt>Coverage floor</dt>
                <dd>{activeStrategy.minDscr}</dd>
              </div>
              <div>
                <dt>Liquidity posture</dt>
                <dd>{activeStrategy.reservesNeeded}</dd>
              </div>
            </dl>

            <div className="gs-property-guide__debt">
              <section>
                <span>Debt path</span>
                <strong>{activeStrategy.bestLoanStructure}</strong>
              </section>
              <section>
                <span>Income evidence</span>
                <strong>{activeStrategy.qualifyingIncomeBasis}</strong>
              </section>
            </div>

            <div className="gs-property-guide__principles">
              <p>
                <strong>Why this loan fits</strong>
                {activeStrategy.whyThisLoanFits}
              </p>
              <p>
                <strong>Tax and depreciation note</strong>
                {activeStrategy.taxEdge}
              </p>
            </div>

            <div className="gs-property-guide__balance">
              <section aria-labelledby="property-guide-upside-heading">
                <h4 id="property-guide-upside-heading">The investment case</h4>
                <ul>
                  {activeStrategy.advantages.map((advantage) => (
                    <li key={advantage}>{advantage}</li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="property-guide-tradeoffs-heading">
                <h4 id="property-guide-tradeoffs-heading">The operating friction</h4>
                <ul>
                  {activeStrategy.tradeoffs.map((tradeoff) => (
                    <li key={tradeoff}>{tradeoff}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="gs-property-guide__desk-notes">
              <aside className="gs-property-guide__checkpoint">
                <span>Decision checkpoint</span>
                <p>{activeStrategy.dueDiligence}</p>
              </aside>

              <section className="gs-property-guide__eligibility">
                <div className="gs-property-guide__eyebrow">Underwriting desk notes</div>
                <ol>
                  {activeStrategy.keyGuidelines.map((rule, index) => (
                    <li key={rule}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <p>{rule}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <footer className="gs-property-guide__cta">
              <div>
                <div className="gs-property-guide__eyebrow is-accent">Take the next step</div>
                <h4 className="u-text-style-h2">Pressure-test this {activeStrategy.title.toLowerCase()}.</h4>
                <p>
                  Run coverage, payment, and lender-program logic against the
                  actual deal—not the headline rent.
                </p>
              </div>
              <div className="gs-property-guide__actions">
                <Btn
                  label={activeStrategy.ctaPrimaryText.replace(/\s*→$/, "")}
                  onClick={() => handleCtaClick(activeStrategy.ctaPrimaryTarget)}
                />
                <Btn
                  label="Review it with Greenstreet"
                  variant="secondary"
                  onClick={() => handleCtaClick("book-demo")}
                />
              </div>
            </footer>
          </article>
        </div>
      </div>
    </section>
  );
}
