import React, { useEffect, useState, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { US_PATHS, US_VIEWBOX } from "../data/usMapPaths";
import { PPP_STATE_LAWS, getNoPPPPremium } from "../engine";
import type { PPPStateStatus } from "../engine";

// ─── Types ────────────────────────────────────────────────────────────────────
// Tier is a purely presentational bucketing of the ENGINE's PPPStateStatus —
// it never invents a status of its own. See tierForStatus() below, which is
// the single place that maps engine truth onto a map colour.
//   0 ALLOWED · 1 CONDITIONAL / ARM_RESTRICTED · 2 ENTITY_ONLY
//   3 PRACTICALLY_PROHIBITED / PROHIBITED · 4 AMBIGUOUS (no legal consensus)
//   5 NOT_RESEARCHED (state has no entry in the engine's PPP_STATE_LAWS table)
type Tier = 0 | 1 | 2 | 3 | 4 | 5;

interface StateEntry {
  code: string;
  name: string;
  tier: Tier;
  status: PPPStateStatus | "NOT_RESEARCHED";
  ppp: string;
  statutoryReference: string;
  impact: string;
  threshold?: string;
}

// ─── State code / full-name lookup — plain US state names, not a legal claim ──
const ALL_CODES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const CODE_TO_NAME: Record<string, string> = { AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia" };

const TIER_COLORS: Record<Tier, string> = { 0: dc.emerald, 1: dc.lemon, 2: "#f97316", 3: "#ff6b6b", 4: "#a78bfa", 5: "#9aa3ab" };
const TIER_LABELS: Record<Tier, string> = { 0: "PPP Allowed", 1: "Conditional — Restrictions Apply", 2: "Entity Vesting Required", 3: "Effectively Prohibited", 4: "Ambiguous — No Consensus", 5: "Not Determined — Verify" };

// ─── Engine status → page tier ────────────────────────────────────────────────
// The ONLY place that decides how an engine status paints on the map. Anything
// that isn't explicitly ALLOWED must never fall through to the green tier.
function tierForStatus(status: PPPStateStatus): Tier {
  switch (status) {
    case "ALLOWED":
      return 0;
    case "CONDITIONAL":
    case "ARM_RESTRICTED":
      return 1;
    case "ENTITY_ONLY":
      return 2;
    case "PRACTICALLY_PROHIBITED":
    case "PROHIBITED":
      return 3;
    case "AMBIGUOUS":
      return 4;
    default:
      // Defensive: any future engine status this page hasn't been taught yet
      // renders as "verify" rather than silently defaulting to green.
      return 5;
  }
}

// ─── Pricing-impact caption — derived from the engine's own no-PPP premium
// math (getNoPPPPremium), never a hand-typed guess. ───────────────────────────
function impactFor(tier: Tier, ratePremium: number, feePremium: number): string {
  if (tier === 5) return "Not determined — verify before quoting";
  if (tier === 2) return "Entity vesting required — individual borrowers barred";
  if (tier === 4) {
    return ratePremium > 0 || feePremium > 0
      ? `No consensus — if treated as no-PPP: +${(ratePremium * 100).toFixed(2)}% rate / +${(feePremium * 100).toFixed(3)}% fee`
      : "No legal consensus — confirm with lender before quoting";
  }
  if (ratePremium > 0 || feePremium > 0) {
    return `+${(ratePremium * 100).toFixed(2)}% rate / +${(feePremium * 100).toFixed(3)}% fee if PPP unavailable`;
  }
  return "Standard pricing";
}

// ─── Resolve a state's DISPLAYED status straight from the compliance engine
// (PPP_STATE_LAWS + getNoPPPPremium, both imported from ../engine). A state
// with no entry in PPP_STATE_LAWS has not been legally researched and must
// never be presented as green/"allowed" — it renders as tier 5 instead.
function resolve(code: string): StateEntry {
  const st = code.toUpperCase();
  const name = CODE_TO_NAME[st] ?? st;
  const law = PPP_STATE_LAWS[st];

  if (!law) {
    return {
      code: st,
      name,
      tier: 5,
      status: "NOT_RESEARCHED",
      ppp:
        "Not yet researched in the Greenstreet compliance engine. Do not assume prepayment penalties are allowed here — confirm directly with your lender and legal counsel before quoting a PPP structure.",
      statutoryReference: "No statutory research on file for this state.",
      impact: impactFor(5, 0, 0),
    };
  }

  const tier = tierForStatus(law.status);
  const { ratePremium, feePremium } = getNoPPPPremium(st, "LLC");

  return {
    code: st,
    name,
    tier,
    status: law.status,
    ppp: law.reason,
    statutoryReference: law.statutoryReference ?? "Statutory reference not on file.",
    impact: impactFor(tier, ratePremium, feePremium),
    threshold: law.loanThreshold
      ? `$${law.loanThreshold.toLocaleString()}${law.thresholdYear ? ` (${law.thresholdYear})` : ""}`
      : undefined,
  };
}

const RAIN = dc.rain; // #006565 — State Laws' distinct colour identity

export default function StateLawsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  useEffect(() => {
    document.title = "State Rules | Greenstreet Finance";
  }, []);

  const [selected, setSelected] = useState("NJ");
  const [q, setQ] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const sel = resolve(selected);

  // Keep map regions visible from first paint. Route-level reveal effects were
  // responsible for the post-load visual drop on routed pages.

  const counts = ALL_CODES.map(resolve).reduce((a, r) => { a[r.tier]++; return a; }, [0, 0, 0, 0, 0, 0] as number[]);
  const researchedCount = ALL_CODES.length - counts[5];

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
      ]}
      cta={{ label: "Check a state →", onClick: scrollToTool }}
    >
      <style>{`
        .sl-cell{aspect-ratio:1;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s, outline-color .12s;font-family:${dc.mono};border:none;outline:3px solid transparent;outline-offset:2px;}
        .sl-cell:hover{transform:scale(1.09);}
        .sl-cell:focus-visible{outline-color:#d8d958;}
        .sl-input{width:100%;border:1px solid rgba(238,239,211,0.25);background:rgba(238,239,211,0.08);outline:none;color:#eeefd3;font-family:${dc.sans};font-size:15px;letter-spacing:-0.01em;border-radius:8px;padding:12px 14px;}
        .sl-input::placeholder{color:rgba(238,239,211,0.5);}
        .sl-input:focus-visible{outline:2px solid rgba(238,239,211,0.8);outline-offset:2px;}
        .us-state{transition:fill .15s, filter .15s, stroke .12s, stroke-width .12s;}
        .us-state:focus-visible{stroke:#d8d958 !important;stroke-width:2.5px !important;}
      `}</style>

      {/* HERO — rain-forest, single column (distinct from the dark tool heroes) */}
      <section style={{ background: RAIN, color: dc.cream, padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`, overflow: "hidden" }}>
        <div id="gs-hero-content" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginBottom: 20, letterSpacing: "-0.01em" }}>Product / 50-State Rule Engine</div>
          <H1 style={{ margin: "0 0 18px", maxWidth: "16ch" }}>
            Prepayment penalty rules, all fifty states.
          </H1>
          <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "54ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            A prepayment penalty (a fee some loans charge if you pay the loan off or refinance early) is allowed in most states for business-purpose loans — but not all. This map shows where it's clear, where thresholds or entity structuring apply, where lenders decline entirely, and where the law isn't settled or hasn't been researched yet. Click any state for full details.
          </div>
          <Lead style={{ color: "rgba(238,239,211,0.78)", maxWidth: "54ch", margin: "0 0 28px" }}>
            Every state entry cites the governing statute — including where a usury cap could apply — so you can verify it yourself. In most states business-purpose loans are exempt from consumer usury caps, but always confirm with your lender or counsel.
          </Lead>
          <div style={{ display: "flex", gap: "clamp(20px,4vw,44px)", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "clamp(16px,3vw,32px)" }}>
              <div><Mono data-count={researchedCount} style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: dc.lemon, lineHeight: 1, display: "block" }}>{researchedCount}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>states researched</div></div>
              <div><Mono style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: "#ff6b6b", lineHeight: 1, display: "block" }}>{counts[2] + counts[3]}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>need restructure</div></div>
              <div><Mono style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: dc.emerald, lineHeight: 1, display: "block" }}>{counts[0]}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>clear to quote</div></div>
            </div>
            <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
              <input className="sl-input" value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Jump to a state — type CA, TX, NJ…" />
            </div>
          </div>
        </div>
      </section>



      {/* MAP GRID — the signature: animated 10-col state grid + sticky detail */}
      <section id="sl-tool" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: "rgba(0,55,56,0.6)", margin: "0 0 12px", lineHeight: 1.5 }}>
              Click any state to see full prepayment penalty rules, statutory reference, and pricing impact. Hover to preview.
            </p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {([0, 1, 2, 3, 4, 5] as Tier[]).map((t) => (
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
                    <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TIER_COLORS[r.tier] }}>{TIER_LABELS[r.tier]}</div>
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
                  { k: "Statutory reference", v: sel.statutoryReference, color: "#eeefd3", weight: 500 as const },
                  { k: "Pricing impact for your deal", v: sel.impact, color: TIER_COLORS[sel.tier], weight: 600 as const },
                  ...(sel.threshold ? [{ k: "Key threshold to know", v: sel.threshold, color: "#eeefd3", weight: 600 as const }] : []),
                ].map((row) => (
                  <div key={row.k}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.5)", marginBottom: 4 }}>{row.k}</div>
                    <div style={{ fontSize: 15, fontWeight: row.weight, color: row.color, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{row.v}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("dscr-calculator")}
                style={{ marginTop: 24, width: "100%", background: dc.lemon, color: dc.dark, border: "none", borderRadius: 6, padding: "12px 0", fontSize: 14, fontWeight: 600, fontFamily: dc.sans, cursor: "pointer" }}
              >
                Price a deal in {sel.code} →
              </button>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
