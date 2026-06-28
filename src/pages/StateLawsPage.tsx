import React, { useEffect, useState, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { US_PATHS, US_VIEWBOX } from "../data/usMapPaths";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = 0 | 1 | 2 | 3; // 0 allowed, 1 threshold, 2 high-risk, 3 banned

interface StateEntry {
  code: string;
  name: string;
  tier: Tier;
  ppp: string;
  usury: string;
  impact: string;
  threshold?: string;
}

// ─── State data (statutory citations preserved verbatim) ────────────────────────
const SPECIAL: Record<string, Omit<StateEntry, "code">> = {
  AK: { name: "Alaska", tier: 2, ppp: "Individual borrower: PROHIBITED. LLC / Corp entity: ALLOWED.", usury: "Business-purpose exemption applies; confirm state cap with counsel.", impact: "Entity borrower required" },
  AR: { name: "Arkansas", tier: 1, ppp: "First 3 years allowed on remaining balance. Max 3/2/1 schedule.", usury: "5% above Federal Reserve discount rate or 17%; usury ceiling applies.", impact: "Structure penalty carefully" },
  CA: { name: "California", tier: 1, ppp: "Allowed on business-purpose; consumer 6-month/20% rule. Confirm lender overlay.", usury: "10% general; broker & business-purpose exemptions broad.", impact: "Standard" },
  FL: { name: "Florida", tier: 0, ppp: "PPP allowed. High climate-risk zone — insurance availability kill gate applies.", usury: "18% general; business-purpose exemption applies.", impact: "Standard pricing" },
  GA: { name: "Georgia", tier: 0, ppp: "No state PPP restrictions for business-purpose loans.", usury: "16% general; business exemption applies.", impact: "Standard pricing" },
  IL: { name: "Illinois", tier: 1, ppp: "Individual: PROHIBITED or APR ≥ 8%. Entity: APR fall-rate tests apply.", usury: "9% general; business exemption applies.", impact: "Standard (entity structure)" },
  KS: { name: "Kansas", tier: 3, ppp: "PPP de facto prohibited. Most DSCR lenders decline.", usury: "15% general; business exemptions narrow.", impact: "+0.50% / most lenders decline" },
  ME: { name: "Maine", tier: 1, ppp: "ARM loans: no PPP (cap 2 months interest).", usury: "Business-purpose exemption; confirm applicable cap.", impact: "ARM restrictions apply" },
  MD: { name: "Maryland", tier: 3, ppp: "PPP de facto prohibited on most residential business-purpose loans.", usury: "Capped; varies by loan type. Confirm exemption.", impact: "+0.50% / lenders decline" },
  MN: { name: "Minnesota", tier: 1, ppp: "Business-purpose ALLOWED (HF 3437 enacted 4/23/26, eff. 8/1/2026). Consumer still prohibited (§58.137).", usury: "8% legal / contract up to agreed for business.", impact: "+0.10% rate adj", threshold: "eff. 8/1/2026" },
  MS: { name: "Mississippi", tier: 1, ppp: "Declining-only structure. Flat PPP above 1 yr prohibited (§75-17-31).", usury: "Business-purpose exemption; confirm applicable cap.", impact: "Declining structure required" },
  NJ: { name: "New Jersey", tier: 2, ppp: "Individual: PROHIBITED. LLC: HIGH-RISK (lender-split). C-Corp/S-Corp: ALLOWED. Flag NJ LLC deals.", usury: "Criminal usury 30%; civil 16% (business exemption applies).", impact: "+0.25% rate adj" },
  NM: { name: "New Mexico", tier: 1, ppp: "Individual: PROHIBITED. Entity: varies by lender.", usury: "Business-purpose exemption; confirm applicable cap.", impact: "Entity borrower required" },
  NY: { name: "New York", tier: 1, ppp: "Residential: PROHIBITED. Business-purpose: ALLOWED (Banking Law §6-l). Criminal usury cap: 25% (Penal Law §190.40).", usury: "Criminal usury cap 25% (Penal Law §190.40).", impact: "+0.25% rate adj" },
  ND: { name: "North Dakota", tier: 3, ppp: "PPP de facto prohibited.", usury: "Business-purpose exemption; confirm applicable cap.", impact: "Most lenders decline" },
  OH: { name: "Ohio", tier: 1, ppp: "1–2 unit: threshold $116,356 (2026, indexed Jan 1). Above threshold: ALLOWED, max 1% penalty, max 5 years (ORC §1343.011). 3–4 unit: no restriction.", usury: "8% general; business-purpose exemption.", impact: "+0.10% near threshold", threshold: "$116,356 (2026)" },
  OK: { name: "Oklahoma", tier: 1, ppp: "APR ≥ 13%: BANNED.", usury: "Business-purpose exemption; APR 13% trigger.", impact: "Rate must stay below 13% APR" },
  PA: { name: "Pennsylvania", tier: 1, ppp: "1–2 unit: threshold $319,777 (2026). Below: restricted. Above: business-purpose ALLOWED. PA rate cap 7.25% (Jun/Jul 2026).", usury: "6% legal; business exemption over $35k.", impact: "+0.10% if below threshold", threshold: "$319,777 (2026)" },
  RI: { name: "Rhode Island", tier: 1, ppp: "Max 1 year, max 2% of remaining balance.", usury: "Business-purpose exemption; confirm applicable cap.", impact: "Term/amount cap applies" },
  SC: { name: "South Carolina", tier: 1, ppp: "Below $690,000: NOT ALLOWED.", usury: "Business-purpose exemption; confirm applicable cap.", impact: "Loan amount gate ($690K)" },
  TX: { name: "Texas", tier: 0, ppp: "Business-purpose PPP allowed. No special residential bar. APR ≥ 12%: BANNED.", usury: "18% general; business exemptions broad.", impact: "Standard pricing" },
  WA: { name: "Washington", tier: 1, ppp: "5/6 ARM: no PPP on some lender matrices. Blanket ARM ban unverified.", usury: "Business-purpose exemption; confirm applicable cap.", impact: "ARM structure check required" },
  WV: { name: "West Virginia", tier: 1, ppp: "Max 3 years, max 1% penalty.", usury: "Business-purpose exemption; confirm applicable cap.", impact: "Term/amount cap applies" },
  WI: { name: "Wisconsin", tier: 1, ppp: "ARM loans: no PPP (cap 2 months interest).", usury: "Business-purpose exemption; confirm applicable cap.", impact: "ARM restrictions apply" },
};

const ALL_CODES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const CODE_TO_NAME: Record<string, string> = { AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia" };

const TIER_COLORS: Record<Tier, string> = { 0: dc.emerald, 1: dc.lemon, 2: "#e6b84d", 3: "#e06363" };
const TIER_LABELS: Record<Tier, string> = { 0: "PPP Allowed", 1: "Threshold-Based", 2: "High-Risk", 3: "Effectively Banned" };
const TIER_INK: Record<Tier, string> = { 0: dc.dark, 1: dc.dark, 2: dc.dark, 3: "#fff" };
const MAP_CODES = Object.keys(US_PATHS);

function readStateFromQuery() {
  if (typeof window === "undefined") return null;
  const code = new URLSearchParams(window.location.search).get("state")?.trim().toUpperCase();
  return code && MAP_CODES.includes(code) ? code : null;
}

function resolve(code: string): StateEntry {
  const sp = SPECIAL[code];
  const tier: Tier = sp ? sp.tier : 0;
  return {
    code,
    name: sp ? sp.name : (CODE_TO_NAME[code] ?? code),
    tier,
    ppp: sp ? sp.ppp : "Business-purpose prepayment penalties generally permitted. No special residential restriction on record.",
    usury: sp ? sp.usury : "Business-purpose exemption typically applies; confirm state cap with counsel.",
    impact: sp ? sp.impact : "Standard pricing",
    threshold: sp?.threshold,
  };
}

const RAIN = dc.rain; // #006565 — State Laws' distinct colour identity

export default function StateLawsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  useEffect(() => {
    document.title = "Prepayment Penalty Rules by State | Greenstreet Finance";
  }, []);

  const [selected, setSelected] = useState(() => readStateFromQuery() ?? "NJ");
  const [q, setQ] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const sel = resolve(selected);

  useEffect(() => {
    const applyQueryState = () => {
      const code = readStateFromQuery();
      if (code) setSelected(code);
    };
    window.addEventListener("popstate", applyQueryState);
    return () => window.removeEventListener("popstate", applyQueryState);
  }, []);

  // Keep map regions visible from first paint. Route-level reveal effects were
  // responsible for the post-load visual drop on routed pages.

  const counts = ALL_CODES.map(resolve).reduce((a, r) => { a[r.tier]++; return a; }, [0, 0, 0, 0] as number[]);

  const scrollToTool = () => {
    const el = document.querySelector("#sl-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };
  const onSearch = (v: string) => {
    setQ(v);
    const t = v.trim().toUpperCase();
    if (!t) return;
    const hit = ALL_CODES.find((c) => c === t) || ALL_CODES.find((c) => CODE_TO_NAME[c].toUpperCase().startsWith(t));
    if (hit) setSelected(hit);
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={RAIN}
      navLinks={[
        { label: "Calculator", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
      ]}
      cta={{ label: "Check a state →", onClick: scrollToTool }}
    >
      <style>{`
        .sl-cell{aspect-ratio:1;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s, outline-color .12s;font-family:${dc.mono};border:none;outline:3px solid transparent;outline-offset:2px;}
        .sl-cell:hover{transform:scale(1.09);}
        .sl-cell:focus-visible{outline-color:#d8d958;}
        .sl-input{width:100%;border:1px solid rgba(238,239,211,0.25);background:rgba(238,239,211,0.08);outline:none;color:#eeefd3;font-family:${dc.sans};font-size:15px;letter-spacing:-0.01em;border-radius:8px;padding:12px 14px;}
        .sl-input::placeholder{color:rgba(238,239,211,0.62);}
        .sl-input:focus-visible{outline:2px solid rgba(238,239,211,0.8);outline-offset:2px;}
        .us-state{transition:fill .15s, filter .15s, stroke .12s, stroke-width .12s;}
        .us-state:focus-visible{stroke:#d8d958 !important;stroke-width:2.5px !important;}
      `}</style>

      {/* HERO — rain-forest, single column (distinct from the dark tool heroes) */}
      <section style={{ background: RAIN, color: dc.cream, padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`, overflow: "hidden" }}>
        <div id="gs-hero-content" className="dc-hero" style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
          <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginBottom: 20, letterSpacing: "-0.01em" }}>Product / 50-State Rule Engine</div>
          <H1 style={{ margin: "0 0 18px", maxWidth: "16ch" }}>
            Prepayment penalty rules by state.
          </H1>
          <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "54ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            A prepayment penalty (a fee some loans charge if you pay the loan off or refinance early) is allowed in most states for business-purpose loans — but not all. This map shows where it's clear, where thresholds apply, and where lenders decline entirely. Click any state for full details.
          </div>
          <Lead style={{ color: "rgba(238,239,211,0.78)", maxWidth: "54ch", margin: "0 0 28px" }}>
            Also shows the usury cap — the maximum interest rate a lender can legally charge. In most states, business-purpose loans are exempt, but a few have binding caps that can affect your rate.
          </Lead>
          <div style={{ display: "flex", gap: "clamp(20px,4vw,44px)", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "clamp(16px,3vw,32px)" }}>
              <div><Mono data-count={50} style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: dc.lemon, lineHeight: 1, display: "block" }}>50</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>states mapped</div></div>
              <div><Mono style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: "#e06363", lineHeight: 1, display: "block" }}>{counts[2] + counts[3]}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>need restructure</div></div>
              <div><Mono style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: dc.emerald, lineHeight: 1, display: "block" }}>{counts[0]}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>clear to quote</div></div>
            </div>
            <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
              <input className="sl-input" aria-label="Jump to a state" value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Jump to a state - type CA, TX, NJ..." />
            </div>
          </div>
          </div>
          {/* Right: 50-state risk-zone breakdown */}
          <div style={{ background: "rgba(0,55,56,0.4)", border: "1px solid rgba(238,239,211,0.16)", borderRadius: dc.r.lg, padding: "clamp(20px,2.4vw,28px)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>50-state risk zones</div>
            <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", marginBottom: 18 }}>
              {([0, 1, 2, 3] as Tier[]).map((t) => counts[t] > 0 ? (
                <div key={t} style={{ width: `${(counts[t] / 50) * 100}%`, background: TIER_COLORS[t] }} />
              ) : null)}
            </div>
            <div style={{ display: "grid", gap: 11 }}>
              {([0, 1, 2, 3] as Tier[]).map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: TIER_COLORS[t], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.78)", flex: 1 }}>{TIER_LABELS[t]}</span>
                  <Mono style={{ fontSize: 17, fontWeight: 700, color: dc.cream }}>{counts[t]}</Mono>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(238,239,211,0.12)", fontSize: 12, color: "rgba(238,239,211,0.6)", lineHeight: 1.5 }}>
              Click any state on the map below for its exact prepay rule, usury cap, and pricing impact.
            </div>
          </div>
        </div>
      </section>

      

      {/* MAP GRID — the signature: animated 10-col state grid + sticky detail */}
      <section id="sl-tool" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: "rgba(0,55,56,0.6)", margin: "0 0 12px", lineHeight: 1.5 }}>
              Click any state to see full prepayment penalty rules, usury cap, and pricing impact. Hover to preview.
            </p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {([0, 1, 2, 3] as Tier[]).map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.7)" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: TIER_COLORS[t] }} />{TIER_LABELS[t]}
                </div>
              ))}
            </div>
          </div>
          <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 36, alignItems: "start" }}>
            {/* interactive US map — hover to peek, click to lock the detail panel */}
            <div ref={mapRef} style={{ position: "relative" }}>
              <svg
                viewBox={US_VIEWBOX}
                style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
                role="img"
                aria-label="United States prepayment-penalty rule map"
                onMouseMove={(e) => {
                  const rect = mapRef.current?.getBoundingClientRect();
                  if (rect) setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => setHover(null)}
              >
                {Object.keys(US_PATHS).map((code) => {
                  const r = resolve(code);
                  const isSel = code === selected;
                  const isHov = code === hover;
                  return (
                    <path
                      key={code}
                      className="us-state"
                      d={US_PATHS[code]}
                      fill={TIER_COLORS[r.tier]}
                      stroke={isSel ? dc.dark : "#eeefd3"}
                      strokeWidth={isSel ? 2.4 : 0.8}
                      onMouseEnter={() => setHover(code)}
                      onClick={() => setSelected(code)}
                      style={{ cursor: "pointer", filter: isHov ? "brightness(1.12)" : "none" }}
                      aria-label={`${r.name}: ${TIER_LABELS[r.tier]}`}
                    />
                  );
                })}
              </svg>
              {hover && (() => {
                const r = resolve(hover);
                return (
                  <div style={{ position: "absolute", left: pos.x + 14, top: pos.y + 14, pointerEvents: "none", background: dc.dark, color: dc.cream, borderRadius: 8, padding: "10px 13px", maxWidth: 240, boxShadow: "0 14px 32px -18px rgba(0,0,0,0.55)", zIndex: 5 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{r.name}</div>
                    <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TIER_COLORS[r.tier] }}>{TIER_LABELS[r.tier]}</div>
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.7)", marginTop: 5, lineHeight: 1.4 }}>{r.impact}</div>
                  </div>
                );
              })()}
            </div>
            {/* sticky detail panel */}
            <div style={{ background: dc.dark, borderRadius: 9, padding: 32, position: "sticky", top: 96 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 8 }}>{sel.code} · {sel.name}</div>
              <div style={{ fontSize: "clamp(28px,3vw,40px)", fontWeight: 600, letterSpacing: "-0.03em", color: TIER_COLORS[sel.tier], lineHeight: 1.05, marginBottom: 20 }}>{TIER_LABELS[sel.tier]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { k: "Prepayment penalty rules", v: sel.ppp, color: "#eeefd3", weight: 500 as const },
                  { k: "Usury / max rate cap", v: sel.usury, color: "#eeefd3", weight: 500 as const },
                  { k: "Pricing impact for your deal", v: sel.impact, color: TIER_COLORS[sel.tier], weight: 600 as const },
                  ...(sel.threshold ? [{ k: "Key threshold to know", v: sel.threshold, color: "#eeefd3", weight: 600 as const }] : []),
                ].map((row) => (
                  <div key={row.k}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>{row.k}</div>
                    <div style={{ fontSize: 15, fontWeight: row.weight, color: row.color, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{row.v}</div>
                  </div>
                ))}
              </div>
              <Btn label={`Price a deal in ${sel.code}`} href="/dscr-calculator" size="sm" onClick={(e) => { e.preventDefault(); onNavigate("dscr-calculator"); }} style={{ width: "100%", justifyContent: "center", marginTop: 24 }} />
            </div>
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
