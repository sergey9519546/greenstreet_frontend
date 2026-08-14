import React, { useState } from "react";
import { dc, Mono, H2, Lead } from "../design/dc";

export interface PropertyTypeInfo {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  maxLtv: string;
  minDscr: string;
  highlights: string[];
  description: string;
}

export const PROPERTY_TYPES_DATA: PropertyTypeInfo[] = [
  {
    id: "SFR",
    title: "Single Family Residential",
    subtitle: "1-Unit Detached Homes & Townhomes",
    image: "/img/properties/cutout/sfr_bungalow.png",
    badge: "Most Popular",
    maxLtv: "80% LTV",
    minDscr: "0.75x Min DSCR",
    highlights: ["Form 1007 Market Rent", "Up to $3.5M Loan Amount", "Individual or LLC Vesting"],
    description: "The core DSCR benchmark. Qualify strictly on appraised market rent or signed lease agreement with zero tax return requirements."
  },
  {
    id: "2-4_UNIT",
    title: "2-4 Unit Multi-Family",
    subtitle: "Duplex, Triplex & Fourplex Properties",
    image: "/img/properties/cutout/duplex_craftsman.png",
    badge: "High Cash Flow",
    maxLtv: "75% LTV",
    minDscr: "1.00x Min DSCR",
    highlights: ["Aggregate Unit Income", "Stronger Cash-on-Cash", "30-Yr Fixed & ARMs"],
    description: "Combine gross rental income across all residential units to easily exceed 1.25x DSCR coverage even at higher leverage."
  },
  {
    id: "5+_UNIT",
    title: "5+ Unit Multi-Family",
    subtitle: "Commercial Multi-Family Buildings",
    image: "/img/properties/cutout/multifamily_brownstone.png",
    badge: "Commercial DSCR",
    maxLtv: "75% LTV",
    minDscr: "1.15x Min DSCR",
    highlights: ["Commercial Debt Yield", "Interest-Only Options", "Non-Recourse Available"],
    description: "Institutional commercial underwriting for 5–36 unit residential buildings using gross operating NOI and debt yield metrics."
  },
  {
    id: "CONDO",
    title: "Condos & High-Rises",
    subtitle: "Warrantable & Non-Warrantable Condos",
    image: "/img/properties/cutout/condo_highrise.png",
    badge: "Urban Markets",
    maxLtv: "75% LTV",
    minDscr: "1.00x Min DSCR",
    highlights: ["Non-Warrantable OK", "Single-Entity Cap Waiver", "Condotel Terms Available"],
    description: "Flexible guidelines covering high-density urban condo units, single-entity concentration issues, and HOA litigation exceptions."
  },
  {
    id: "STR",
    title: "Short-Term Rentals",
    subtitle: "Airbnbs, VRBOs & Resort Cabins",
    image: "/img/properties/cutout/str_cabin.png",
    badge: "AirDNA / Rabbu",
    maxLtv: "75% LTV",
    minDscr: "1.00x Min DSCR",
    highlights: ["AirDNA 20% Haircut", "Documented 12-Mo Actuals", "Seasonality Gap Protection"],
    description: "Qualify on projected STR gross revenue from AirDNA or Rabbu, or 100% of 12-month platform actual history across vacation markets."
  },
  {
    id: "MIXED_USE",
    title: "Commercial & Mixed-Use",
    subtitle: "Storefront Retail with Residential Above",
    image: "/img/properties/cutout/mixed_use_storefront.png",
    badge: "Hybrid Income",
    maxLtv: "70% LTV",
    minDscr: "1.20x Min DSCR",
    highlights: ["51%+ Residential Preference", "Commercial Lease Credit", "LLC Entity Vesting"],
    description: "Finance mixed-use urban properties featuring street-level retail or boutique office space with apartments above."
  }
];

export default function PropertyTypesGallery({
  onSelectType,
  selectedType,
}: {
  onSelectType?: (typeId: string) => void;
  selectedType?: string;
}) {
  const [activeType, setActiveType] = useState<string>(selectedType || "SFR");

  const handleSelect = (id: string) => {
    setActiveType(id);
    if (onSelectType) {
      onSelectType(id);
    }
  };

  // This component is always mounted on the app shell's light ground
  // (`.dc-shell`, `#eeefd3` — confirmed by measuring the live page). Every
  // color here used to assume the opposite (dark-ground text, a translucent
  // navy card fill), which composited into an invented muddy tint no token in
  // the palette produces.
  //
  // The images themselves were the deeper problem: pencil sketches on
  // near-white paper (measured ~rgb(247,243,230) across all six), never
  // transparent, so no amount of card styling could make the rectangle they
  // sit in disappear. Color-matching it via multiply-blend was a workaround;
  // this reads the actual paper luminance and cuts it to real alpha —
  // `scripts/cutout-property-images.py`, threshold 215-246 with a linear
  // ramp between so pencil edges anti-alias instead of getting a hard ring.
  // The PNGs it produced live in `/img/properties/cutout/`. There is no
  // background left to match; there's nothing there.
  //
  // Layout follows the numbered-step motif the homepage itself uses
  // (`step_tab_content_step`, home-markup.html) rather than inventing a new
  // one: a small mono index, then image, then type — one composition, not a
  // stat-block card. Section padding, container width and grid come from
  // DESIGN_SOURCE_OF_TRUTH's measured values, not approximated ones.
  return (
    <section style={{ width: "100%", padding: "clamp(56px, 7vh, 92px) 0" }}>
      <div style={{ textAlign: "center", marginBottom: 56, maxWidth: dc.maxW, marginLeft: "auto", marginRight: "auto", padding: `0 ${dc.pad}` }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: dc.rain,
            marginBottom: 10,
          }}
        >
          Eligible Property Assets
        </div>
        <H2 style={{ color: dc.dark, marginBottom: 14 }}>
          Underwrite Every Property Class
        </H2>
        <Lead style={{ color: "rgba(0,55,56,0.68)", maxWidth: "56ch", margin: "0 auto" }}>
          From single-family rentals to commercial multi-family and vacation Airbnbs, select a property type below to explore guidelines.
        </Lead>
      </div>

      {/* Fixed 3-column grid crushed to ~84px-wide cards at 375px — measured
          live, not assumed. Two breakpoints, matching the pattern used
          elsewhere in this codebase (inline <style> + className, e.g.
          DSCRCalculatorPage's .calc-panel): 2 columns under 992px, 1 under
          640px, where a 2-up grid would still be too tight for the body copy. */}
      <style>{`
        @media (max-width: 991px) { .property-types-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .property-types-grid { grid-template-columns: 1fr !important; row-gap: 48px !important; } }
      `}</style>
      <div
        className="property-types-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 48,
          rowGap: 64,
          maxWidth: dc.maxW,
          margin: "0 auto",
          padding: `0 ${dc.pad}`,
        }}
      >
        {PROPERTY_TYPES_DATA.map((item, idx) => {
          const isSelected = activeType === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
              className="property-type-card"
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                {/* Ink, not lemon, when selected. Lemon on this cream ground
                    measures 1.28:1 — far under the 4.5:1 AA floor for text, and
                    effectively invisible. Selection is still marked in lemon by
                    the rule beside it, where the colour is a fill and carries no
                    contrast duty; the number just gets darker and heavier. */}
                <Mono style={{ fontSize: 13, fontWeight: 700, color: isSelected ? dc.dark : "rgba(0,55,56,0.35)" }}>
                  {String(idx + 1).padStart(2, "0")}
                </Mono>
                <div
                  style={{
                    height: 1,
                    flex: 1,
                    background: isSelected ? dc.lemon : "rgba(0,55,56,0.14)",
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: dc.rain,
                  }}
                >
                  {item.badge}
                </div>
              </div>

              {/* True transparency — no frame, no fill, no seam. */}
              <img
                src={item.image}
                alt={item.title}
                style={{ width: "100%", height: "auto", display: "block", marginBottom: 20 }}
                loading="lazy"
              />

              <h3
                style={{
                  fontSize: 18,
                  fontWeight: isSelected ? 700 : 600,
                  color: dc.dark,
                  margin: "0 0 4px",
                  letterSpacing: "-0.02em",
                }}
              >
                {item.title}
              </h3>
              <div style={{ fontSize: 12, color: "rgba(0,55,56,0.6)", marginBottom: 14 }}>
                {item.subtitle}
              </div>

              <p style={{ fontSize: 14, color: "rgba(0,55,56,0.78)", lineHeight: 1.5, marginBottom: 16 }}>
                {item.description}
              </p>

              {/* One typographic line, not a bordered stat tile. */}
              <Mono style={{ fontSize: 13, fontWeight: 700, color: dc.dark, marginBottom: 16 }}>
                <span style={{ color: dc.rain }}>{item.maxLtv}</span>
                <span style={{ color: "rgba(0,55,56,0.3)", margin: "0 8px" }}>·</span>
                {item.minDscr}
              </Mono>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  fontSize: 12,
                  color: "rgba(0,55,56,0.7)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {item.highlights.map((h, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: dc.emerald, fontWeight: "bold" }}>✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
