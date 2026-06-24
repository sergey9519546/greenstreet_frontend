import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = 0 | 1 | 2 | 3; // 0 allowed, 1 threshold, 2 high-risk, 3 banned

interface StateEntry {
  code: string;
  name: string;
  tier: Tier;
  /** Short PPP summary shown in the detail panel */
  ppp: string;
  /** Usury / rate cap note */
  usury: string;
  /** Rate impact line */
  impact: string;
  /** Statutory threshold (shown in full-list view) */
  threshold?: string;
}

// ─── State data ──────────────────────────────────────────────────────────────
// Full 50-state list. Special entries carry complete panel data; the rest
// receive generic "ALLOWED" data. All statutory citations preserved verbatim.
const SPECIAL: Record<string, Omit<StateEntry, "code">> = {
  AK: {
    name: "Alaska",
    tier: 2,
    ppp: "Individual borrower: PROHIBITED. LLC / Corp entity: ALLOWED.",
    usury: "Business-purpose exemption applies; confirm state cap with counsel.",
    impact: "Entity borrower required",
  },
  AR: {
    name: "Arkansas",
    tier: 1,
    ppp: "First 3 years allowed on remaining balance. Max 3/2/1 schedule.",
    usury: "5% above Federal Reserve discount rate or 17%; usury ceiling applies.",
    impact: "Structure penalty carefully",
  },
  CA: {
    name: "California",
    tier: 1,
    ppp: "Allowed on business-purpose; consumer 6-month/20% rule. Confirm lender overlay.",
    usury: "10% general; broker & business-purpose exemptions broad.",
    impact: "Standard",
  },
  FL: {
    name: "Florida",
    tier: 0,
    ppp: "PPP allowed. High climate-risk zone — insurance availability kill gate applies.",
    usury: "18% general; business-purpose exemption applies.",
    impact: "Standard pricing",
  },
  GA: {
    name: "Georgia",
    tier: 0,
    ppp: "No state PPP restrictions for business-purpose loans.",
    usury: "16% general; business exemption applies.",
    impact: "Standard pricing",
  },
  IL: {
    name: "Illinois",
    tier: 1,
    ppp: "Individual: PROHIBITED or APR ≥ 8%. Entity: APR fall-rate tests apply.",
    usury: "9% general; business exemption applies.",
    impact: "Standard (entity structure)",
  },
  KS: {
    name: "Kansas",
    tier: 3,
    ppp: "PPP de facto prohibited. Most DSCR lenders decline.",
    usury: "15% general; business exemptions narrow.",
    impact: "+0.50% / most lenders decline",
  },
  ME: {
    name: "Maine",
    tier: 1,
    ppp: "ARM loans: no PPP (cap 2 months interest).",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "ARM restrictions apply",
  },
  MD: {
    name: "Maryland",
    tier: 3,
    ppp: "PPP de facto prohibited on most residential business-purpose loans.",
    usury: "Capped; varies by loan type. Confirm exemption.",
    impact: "+0.50% / lenders decline",
  },
  MN: {
    name: "Minnesota",
    tier: 1,
    ppp: "Business-purpose ALLOWED (HF 3437 enacted 4/23/26, eff. 8/1/2026). Consumer still prohibited (§58.137).",
    usury: "8% legal / contract up to agreed for business.",
    impact: "+0.10% rate adj",
    threshold: "eff. 8/1/2026",
  },
  MS: {
    name: "Mississippi",
    tier: 1,
    ppp: "Declining-only structure. Flat PPP above 1 yr prohibited (§75-17-31).",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "Declining structure required",
  },
  NJ: {
    name: "New Jersey",
    tier: 2,
    ppp: "Individual: PROHIBITED. LLC: HIGH-RISK (lender-split). C-Corp/S-Corp: ALLOWED. Flag NJ LLC deals.",
    usury: "Criminal usury 30%; civil 16% (business exemption applies).",
    impact: "+0.25% rate adj",
  },
  NM: {
    name: "New Mexico",
    tier: 1,
    ppp: "Individual: PROHIBITED. Entity: varies by lender.",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "Entity borrower required",
  },
  NY: {
    name: "New York",
    tier: 1,
    ppp: "Residential: PROHIBITED. Business-purpose: ALLOWED (Banking Law §6-l). Criminal usury cap: 25% (Penal Law §190.40).",
    usury: "Criminal usury cap 25% (Penal Law §190.40).",
    impact: "+0.25% rate adj",
  },
  ND: {
    name: "North Dakota",
    tier: 3,
    ppp: "PPP de facto prohibited.",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "Most lenders decline",
  },
  OH: {
    name: "Ohio",
    tier: 1,
    ppp: "1–2 unit: threshold $116,356 (2026, indexed Jan 1). Above threshold: ALLOWED, max 1% penalty, max 5 years (ORC §1343.011). 3–4 unit: no restriction.",
    usury: "8% general; business-purpose exemption.",
    impact: "+0.10% near threshold",
    threshold: "$116,356 (2026)",
  },
  OK: {
    name: "Oklahoma",
    tier: 1,
    ppp: "APR ≥ 13%: BANNED.",
    usury: "Business-purpose exemption; APR 13% trigger.",
    impact: "Rate must stay below 13% APR",
  },
  PA: {
    name: "Pennsylvania",
    tier: 1,
    ppp: "1–2 unit: threshold $319,777 (2026). Below: restricted. Above: business-purpose ALLOWED. PA rate cap 7.25% (Jun/Jul 2026).",
    usury: "6% legal; business exemption over $35k.",
    impact: "+0.10% if below threshold",
    threshold: "$319,777 (2026)",
  },
  RI: {
    name: "Rhode Island",
    tier: 1,
    ppp: "Max 1 year, max 2% of remaining balance.",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "Term/amount cap applies",
  },
  SC: {
    name: "South Carolina",
    tier: 1,
    ppp: "Below $690,000: NOT ALLOWED.",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "Loan amount gate ($690K)",
  },
  TX: {
    name: "Texas",
    tier: 0,
    ppp: "Business-purpose PPP allowed. No special residential bar. APR ≥ 12%: BANNED.",
    usury: "18% general; business exemptions broad.",
    impact: "Standard pricing",
  },
  WA: {
    name: "Washington",
    tier: 1,
    ppp: "5/6 ARM: no PPP on some lender matrices. Blanket ARM ban unverified.",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "ARM structure check required",
  },
  WV: {
    name: "West Virginia",
    tier: 1,
    ppp: "Max 3 years, max 1% penalty.",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "Term/amount cap applies",
  },
  WI: {
    name: "Wisconsin",
    tier: 1,
    ppp: "ARM loans: no PPP (cap 2 months interest).",
    usury: "Business-purpose exemption; confirm applicable cap.",
    impact: "ARM restrictions apply",
  },
};

const ALL_CODES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const CODE_TO_NAME: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",
  KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",
  MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",
  NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",
  NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",
  OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

const TIER_COLORS: Record<Tier, string> = {
  0: dc.emerald,   // #4dbd97 — allowed
  1: dc.lemon,     // #d8d958 — threshold
  2: "#f97316",    // orange  — high-risk
  3: "#ff6b6b",    // red     — effectively banned
};
const TIER_LABELS: Record<Tier, string> = {
  0: "PPP Allowed",
  1: "Threshold-Based",
  2: "High-Risk",
  3: "Effectively Banned",
};
// Ink on top of each tier's cell background
const TIER_INK: Record<Tier, string> = {
  0: dc.dark,
  1: dc.dark,
  2: dc.dark,
  3: "#fff",
};

function resolve(code: string): StateEntry {
  const sp = SPECIAL[code];
  const tier: Tier = sp ? sp.tier : 0;
  return {
    code,
    name: sp ? sp.name : (CODE_TO_NAME[code] ?? code),
    tier,
    ppp: sp
      ? sp.ppp
      : "Business-purpose prepayment penalties generally permitted. No special residential restriction on record.",
    usury: sp
      ? sp.usury
      : "Business-purpose exemption typically applies; confirm state cap with counsel.",
    impact: sp ? sp.impact : "Standard pricing",
    threshold: sp?.threshold,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StateLawsPage({
  onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate?: (v: string) => void;
}) {
  const [selected, setSelected] = useState("NJ");
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | "0" | "1" | "2" | "3">("all");

  useEffect(() => {
    document.title = "State Laws | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#sl-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
  };

  const sel = resolve(selected);

  // Stats for hero
  const countAllowed    = ALL_CODES.filter(c => resolve(c).tier === 0).length;
  const countThreshold  = ALL_CODES.filter(c => resolve(c).tier === 1).length;
  const countHighRisk   = ALL_CODES.filter(c => resolve(c).tier === 2).length;
  const countBanned     = ALL_CODES.filter(c => resolve(c).tier === 3).length;

  // Filtered list for the table below the grid
  const tableStates = ALL_CODES
    .map(resolve)
    .filter((s) => {
      if (filterTier !== "all" && s.tier !== +filterTier) return false;
      const q = search.toLowerCase();
      if (q && !s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
      return true;
    });

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",      view: "dscr-calculator" },
        { label: "Deal Analyzer",  view: "deal-analyzer" },
        { label: "Lender Intel",   view: "lender-intel" },
      ]}
      cta={{ label: "Check a state →", onClick: scrollToTool }}
    >
      {/* Input CSS: spinner removal only */}
      <style>{`
        .sl-cell{aspect-ratio:1;border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s;font-family:${dc.mono};}
        .sl-cell:hover{transform:scale(1.08);}
        .sl-input{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.dark};letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
          minHeight: "clamp(440px,52vh,680px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="gs-dot-grid"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px,transparent 1px)",
            backgroundSize: "34px 34px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: dc.maxW,
            margin: "0 auto",
            padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`,
          }}
        >
          <div id="gs-hero-content">
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(238,239,211,0.6)",
                marginBottom: 20,
                letterSpacing: "-0.01em",
              }}
            >
              Product &middot; 50-State Rule Engine
            </div>
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: "0 0 24px",
                maxWidth: "18ch",
              }}
            >
              Prepayment penalty rules, all fifty states.
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(238,239,211,0.78)",
                maxWidth: "52ch",
                margin: "0 0 40px",
              }}
            >
              Where a prepay penalty holds, where it&rsquo;s banned, where a
              threshold applies, and the usury cap that bounds your rate. Click
              any state.
            </p>
            <div
              style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}
            >
              <a
                href="#sl-tool"
                onClick={scrollToTool}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 30px",
                  borderRadius: 6,
                }}
              >
                Check a state ↓
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.("dscr-calculator");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 26px",
                  borderRadius: 6,
                  border: "1px solid rgba(238,239,211,0.3)",
                }}
              >
                DSCR Calculator
              </a>
            </div>

            {/* ── Hero stat row ── */}
            <div
              style={{ display: "flex", gap: "clamp(24px,4vw,52px)", flexWrap: "wrap" }}
            >
              {([
                { n: countAllowed,   label: "states allowed",        color: dc.emerald },
                { n: countThreshold, label: "threshold-based",       color: dc.lemon },
                { n: countHighRisk,  label: "high-risk entity req.",  color: "#f97316" },
                { n: countBanned,    label: "effectively banned",     color: "#ff6b6b" },
              ] as const).map(({ n, label, color }) => (
                <div key={label}>
                  <Mono
                    data-count={n}
                    style={{
                      display: "block",
                      fontSize: "clamp(36px,4vw,52px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </Mono>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(238,239,211,0.55)",
                      marginTop: 4,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP GRID + DETAIL PANEL ── */}
      <section
        id="sl-tool"
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Legend */}
          <div
            className="gs-reveal"
            style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 28 }}
          >
            {([
              { color: dc.emerald, label: "PPP allowed" },
              { color: dc.lemon,   label: "Threshold-based" },
              { color: "#f97316",  label: "High-risk" },
              { color: "#ff6b6b",  label: "Effectively banned" },
            ] as const).map(({ color, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(0,55,56,0.7)",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {label}
              </div>
            ))}
          </div>

          {/* Grid + Panel */}
          <div
            className="gs-reveal dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* 10-column map grid */}
            <div
              id="sl-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: 7,
              }}
            >
              {ALL_CODES.map((code) => {
                const s = resolve(code);
                const isSel = code === selected;
                return (
                  <div
                    key={code}
                    className="sl-cell"
                    onClick={() => setSelected(code)}
                    style={{
                      background: TIER_COLORS[s.tier],
                      color: TIER_INK[s.tier],
                      outline: isSel ? `3px solid ${dc.dark}` : "none",
                      outlineOffset: isSel ? 2 : 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {code}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Sticky detail panel */}
            <div
              style={{
                background: dc.dark,
                borderRadius: 9,
                padding: 32,
                position: "sticky",
                top: 96,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.lemon,
                  marginBottom: 8,
                }}
              >
                {sel.code} &middot; {sel.name}
              </div>
              <div
                style={{
                  fontSize: "clamp(28px,3vw,40px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: TIER_COLORS[sel.tier],
                  lineHeight: 1.05,
                  marginBottom: 20,
                  fontFamily: dc.sans,
                }}
              >
                {TIER_LABELS[sel.tier]}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "rgba(238,239,211,0.5)",
                      marginBottom: 4,
                    }}
                  >
                    Prepay penalty
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: dc.cream,
                      lineHeight: 1.5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {sel.ppp}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "rgba(238,239,211,0.5)",
                      marginBottom: 4,
                    }}
                  >
                    Usury / rate cap
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: dc.cream,
                      lineHeight: 1.5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {sel.usury}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "rgba(238,239,211,0.5)",
                      marginBottom: 4,
                    }}
                  >
                    Rate impact
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: TIER_COLORS[sel.tier],
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {sel.impact}
                  </div>
                </div>
                {sel.threshold && (
                  <div
                    style={{
                      borderTop: "1px solid rgba(238,239,211,0.12)",
                      paddingTop: 14,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(238,239,211,0.5)",
                    }}
                  >
                    Threshold: <Mono style={{ color: dc.lemon }}>{sel.threshold}</Mono>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL LIST TABLE ── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              Full 50-state matrix
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.5vw,48px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Every state, every rule.
            </h2>
          </div>

          {/* Search + filter row */}
          <div
            className="gs-reveal"
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: dc.white,
                border: "1px solid rgba(0,55,56,0.15)",
                borderRadius: 6,
                padding: "0 14px",
                width: 220,
              }}
            >
              <input
                className="sl-input"
                type="text"
                placeholder="Search state…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "11px 0", fontSize: 14, fontWeight: 500 }}
              />
            </div>

            {/* Tier filter pills */}
            {(
              [
                { key: "all", label: "All States" },
                { key: "0",   label: "Allowed" },
                { key: "1",   label: "Threshold" },
                { key: "2",   label: "High-Risk" },
                { key: "3",   label: "Banned" },
              ] as { key: typeof filterTier; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterTier(key)}
                style={{
                  padding: "10px 18px",
                  background:
                    filterTier === key ? dc.dark : dc.white,
                  color:
                    filterTier === key ? dc.cream : "rgba(0,55,56,0.7)",
                  border: `1px solid ${filterTier === key ? dc.dark : "rgba(0,55,56,0.2)"}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table rows */}
          <div className="gs-reveal" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tableStates.map((s) => (
              <div
                key={s.code}
                onClick={() => {
                  setSelected(s.code);
                  const el = document.querySelector("#sl-tool");
                  if (el)
                    window.scrollTo({
                      top: el.getBoundingClientRect().top + window.scrollY - 30,
                      behavior: "smooth",
                    });
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "88px 160px 1fr auto",
                  gap: 20,
                  alignItems: "center",
                  padding: "16px 22px",
                  background: dc.white,
                  borderRadius: 8,
                  border: "1px solid rgba(0,55,56,0.08)",
                  cursor: "pointer",
                  transition: "transform .12s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.transform = "")
                }
              >
                {/* State code */}
                <Mono
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: dc.dark,
                  }}
                >
                  {s.code}
                </Mono>

                {/* Status pill */}
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: TIER_COLORS[s.tier] + "22",
                      color: s.tier === 3 ? "#c0392b" : TIER_COLORS[s.tier] === dc.lemon ? "#857400" : TIER_COLORS[s.tier],
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {TIER_LABELS[s.tier]}
                  </span>
                </div>

                {/* PPP note */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(0,55,56,0.75)",
                    lineHeight: 1.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.ppp}
                </div>

                {/* Threshold badge */}
                {s.threshold ? (
                  <Mono
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#857400",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.threshold}
                  </Mono>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>

          {/* Attribution */}
          <p
            style={{
              color: "rgba(0,55,56,0.45)",
              fontSize: 12,
              marginTop: 28,
              fontFamily: dc.sans,
              lineHeight: 1.5,
            }}
          >
            Source: Greenstreet Finance state matrix &middot; June 2026 &middot;
            OH threshold $116,356 / PA threshold $319,777 re-index January 1
            annually &middot; MN HF 3437 effective 8/1/2026. Not legal advice.
            Verify with counsel before closing.
          </p>
        </div>
      </section>
    </DcShell>
  );
}
