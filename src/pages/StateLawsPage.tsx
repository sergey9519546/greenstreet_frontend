import React, { useEffect, useState, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { US_PATHS, US_VIEWBOX } from "../data/usMapPaths";
import {
  PPP_MODEL_AS_OF,
  PPP_STATE_LAWS,
  STATE_CODE_TO_NAME,
  STATE_JURISDICTION_CODES,
  normalizeStateCode,
} from "../engine/statePppLaws";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = 0 | 1 | 2 | 3; // Model review categories only; not legal conclusions.

interface StateEntry {
  code: string;
  name: string;
  tier: Tier;
  ppp: string;
  usury: string;
  impact: string;
  threshold?: string;
  sourceUrl?: string | null;
  effectiveDate?: string | null;
  reviewedAt?: string | null;
  reviewer?: string | null;
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

const TIER_COLORS: Record<Tier, string> = { 0: dc.emerald, 1: dc.lemon, 2: "#e6b84d", 3: "#e06363" };
const TIER_LABELS: Record<Tier, string> = { 0: "No modeled flag", 1: "Threshold review", 2: "Heightened review", 3: "Manual legal review" };
const TIER_INK: Record<Tier, string> = { 0: dc.dark, 1: dc.dark, 2: dc.dark, 3: "#fff" };
const MAP_CODES = Object.keys(US_PATHS).filter((code) => STATE_JURISDICTION_CODES.includes(code));

export function stateSelectionForInput(value: string): string | null {
  const code = normalizeStateCode(value);
  return code && MAP_CODES.includes(code) ? code : null;
}

export function stateSearchWithSelection(search: string, code: string | null): string {
  const params = new URLSearchParams(search);
  if (code) params.set("state", code);
  else params.delete("state");
  const next = params.toString();
  return next ? `?${next}` : "";
}

function readStateFromQuery() {
  if (typeof window === "undefined") return null;
  return stateSelectionForInput(new URLSearchParams(window.location.search).get("state") ?? "");
}

function writeStateToHistory(code: string | null, mode: "pushState" | "replaceState") {
  if (typeof window === "undefined") return;
  const search = stateSearchWithSelection(window.location.search, code);
  const nextUrl = `${window.location.pathname}${search}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) window.history[mode]({}, "", nextUrl);
}

function resolve(code: string): StateEntry {
  const sp = SPECIAL[code];
  const tier: Tier = sp ? sp.tier : 0;
  return {
    code,
    name: sp ? sp.name : (STATE_CODE_TO_NAME[code] ?? code),
    tier,
    ppp: sp
      ? `Unverified educational summary from the internal rule model: ${sp.ppp} Confirm the current statute, applicability, and loan documents before relying on it.`
      : "No reviewed state-specific source is attached to this model entry. Do not infer that a penalty is permitted; verify current law and the proposed loan documents.",
    usury: sp
      ? `Unverified model note: ${sp.usury} Confirm the current cap, exemptions, lender status, borrower type, and loan purpose with qualified counsel.`
      : "No reviewed usury source is attached to this model entry. Verify the current rule and any exemption with qualified counsel.",
    impact: "Scenario flag only. No pricing adjustment, lender response, or legal outcome is assumed by this page.",
    threshold: sp?.threshold ? `${sp.threshold} (unverified model input)` : undefined,
    sourceUrl: null,
    effectiveDate: null,
    reviewedAt: null,
    reviewer: null,
  };
}

const RAIN = dc.rain; // #006565 — State Laws' distinct colour identity

export default function StateLawsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  useEffect(() => {
    document.title = "Prepayment Penalty Rules by State | Greenstreet Finance";
  }, []);

  const [selected, setSelected] = useState<string | null>(() => readStateFromQuery());
  const [q, setQ] = useState(() => {
    const code = readStateFromQuery();
    return code ? STATE_CODE_TO_NAME[code] : "";
  });
  const [hover, setHover] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const sel = selected ? resolve(selected) : null;

  useEffect(() => {
    const applyQueryState = () => {
      const code = readStateFromQuery();
      setSelected(code);
      setQ(code ? STATE_CODE_TO_NAME[code] : "");
    };
    applyQueryState();
    writeStateToHistory(readStateFromQuery(), "replaceState");
    window.addEventListener("popstate", applyQueryState);
    return () => window.removeEventListener("popstate", applyQueryState);
  }, []);

  // Keep map regions visible from first paint. Route-level reveal effects were
  // responsible for the post-load visual drop on routed pages.

  const jurisdictionCount = MAP_CODES.length;
  const pppDataCount = Object.keys(PPP_STATE_LAWS).filter((code) => MAP_CODES.includes(code)).length;
  const counts = MAP_CODES.map(resolve).reduce((a, r) => { a[r.tier]++; return a; }, [0, 0, 0, 0] as number[]);

  const scrollToTool = () => {
    const el = document.querySelector("#sl-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };
  const onSearch = (v: string) => {
    setQ(v);
    const hit = stateSelectionForInput(v);
    setSelected(hit);
    writeStateToHistory(hit, hit ? "pushState" : "replaceState");
  };
  const selectState = (code: string) => {
    setSelected(code);
    setQ(STATE_CODE_TO_NAME[code]);
    writeStateToHistory(code, "pushState");
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
        .sl-search-status{min-height:18px;margin-top:7px;font-size:12px;line-height:1.45;color:rgba(238,239,211,0.72);}
        @media(max-width:640px){
          .sl-stats{width:100%;justify-content:space-between;}
          .sl-search-wrap{min-width:100% !important;max-width:none !important;}
          .sl-detail{position:static !important;padding:22px !important;}
        }
      `}</style>

      {/* HERO — rain-forest, single column (distinct from the dark tool heroes) */}
      <section style={{ background: RAIN, color: dc.cream, padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`, overflow: "hidden" }}>
        <div id="gs-hero-content" className="dc-hero" style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
          <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginBottom: 20, letterSpacing: "-0.01em" }}>Product / {jurisdictionCount}-Jurisdiction Rule Engine</div>
          <H1 style={{ margin: "0 0 18px", maxWidth: "16ch" }}>
            Prepayment penalty topics by state.
          </H1>
          <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "54ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            A prepayment penalty is a fee a loan may charge when it is paid off or refinanced early. This educational map flags topics and thresholds contained in an internal model; it does not determine whether a provision is legal, enforceable, available, or correctly priced.
          </div>
          <Lead style={{ color: "rgba(238,239,211,0.78)", maxWidth: "54ch", margin: "0 0 28px" }}>
            Informational model snapshot current as of {PPP_MODEL_AS_OF}. State treatment can depend on loan purpose, borrower and entity type, lender status, property, principal balance, term, and contract language. Verify current primary sources and the final documents with qualified counsel; this is not legal advice.
          </Lead>
          <div style={{ display: "flex", gap: "clamp(20px,4vw,44px)", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="sl-stats" style={{ display: "flex", gap: "clamp(16px,3vw,32px)" }}>
              <div><Mono data-count={jurisdictionCount} style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: dc.lemon, lineHeight: 1, display: "block" }}>{jurisdictionCount}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>jurisdictions mapped</div></div>
              <div><Mono style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: "#e06363", lineHeight: 1, display: "block" }}>{pppDataCount}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>PPP model entries</div></div>
              <div><Mono style={{ fontSize: "clamp(30px,3.4vw,44px)", fontWeight: 600, color: dc.emerald, lineHeight: 1, display: "block" }}>{counts[0]}</Mono><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>no modeled flag</div></div>
            </div>
            <div className="sl-search-wrap" style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
              <label htmlFor="sl-state-search" style={{ display: "block", fontSize: 12, fontWeight: 600, color: dc.cream, marginBottom: 7 }}>State or District of Columbia</label>
              <input id="sl-state-search" className="sl-input" list="sl-state-options" aria-describedby="sl-search-help sl-search-status" aria-invalid={q.trim() !== "" && !selected} value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Type CA or California" autoComplete="off" />
              <datalist id="sl-state-options">
                {MAP_CODES.map((code) => <option key={code} value={STATE_CODE_TO_NAME[code]}>{code}</option>)}
              </datalist>
              <div id="sl-search-help" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Enter an exact two-letter postal code or full jurisdiction name.</div>
              <div id="sl-search-status" className="sl-search-status" role="status" aria-live="polite">
                {selected ? `${STATE_CODE_TO_NAME[selected]} selected.` : q.trim() ? "No matching jurisdiction. Previous results cleared." : "Enter a jurisdiction to view its informational model summary."}
              </div>
            </div>
          </div>
          </div>
          {/* Right: jurisdiction risk-zone breakdown */}
          <div style={{ background: "rgba(0,55,56,0.4)", border: "1px solid rgba(238,239,211,0.16)", borderRadius: dc.r.lg, padding: "clamp(20px,2.4vw,28px)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>{jurisdictionCount}-jurisdiction review categories</div>
            <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", marginBottom: 18 }}>
              {([0, 1, 2, 3] as Tier[]).map((t) => counts[t] > 0 ? (
                <div key={t} style={{ width: `${(counts[t] / jurisdictionCount) * 100}%`, background: TIER_COLORS[t] }} />
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
              Every entry requires a current source and professional review. Missing source, effective-date, and reviewer fields mean the model is not publication-grade legal guidance.
            </div>
          </div>
        </div>
      </section>

      

      {/* MAP GRID — the signature: animated 10-col state grid + sticky detail */}
      <section id="sl-tool" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: "rgba(0,55,56,0.6)", margin: "0 0 12px", lineHeight: 1.5 }}>
              Select any state or the District of Columbia by pointer, or tab to a map region and press Enter or Space. Each result is informational and still requires current-source verification.
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
            <div ref={mapRef} style={{ position: "relative", minWidth: 0 }}>
              <svg
                viewBox={US_VIEWBOX}
                style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
                role="group"
                aria-label="Interactive United States and District of Columbia prepayment-penalty topic map"
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
                      onClick={() => selectState(code)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectState(code);
                        }
                      }}
                      style={{ cursor: "pointer", filter: isHov ? "brightness(1.12)" : "none" }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSel}
                      aria-label={`Select ${r.name}. Current category: ${TIER_LABELS[r.tier]}.`}
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
            {sel ? <div className="sl-detail" role="region" aria-live="polite" aria-labelledby="sl-detail-title" style={{ background: dc.dark, borderRadius: 9, padding: 32, position: "sticky", top: 96 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 8 }}>{sel.code} · {sel.name}</div>
              <div id="sl-detail-title" style={{ fontSize: "clamp(28px,3vw,40px)", fontWeight: 600, letterSpacing: "-0.03em", color: TIER_COLORS[sel.tier], lineHeight: 1.05, marginBottom: 20 }}>{TIER_LABELS[sel.tier]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { k: "Educational PPP summary", v: sel.ppp, color: "#eeefd3", weight: 500 as const },
                  { k: "Usury topic to verify", v: sel.usury, color: "#eeefd3", weight: 500 as const },
                  { k: "Modeled scenario flag", v: sel.impact, color: TIER_COLORS[sel.tier], weight: 600 as const },
                  ...(sel.threshold ? [{ k: "Unverified threshold input", v: sel.threshold, color: "#eeefd3", weight: 600 as const }] : []),
                ].map((row) => (
                  <div key={row.k}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>{row.k}</div>
                    <div style={{ fontSize: 15, fontWeight: row.weight, color: row.color, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{row.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, fontSize: 11, color: "rgba(238,239,211,0.62)", lineHeight: 1.5 }}>
                Source URL: not provided · Effective date: not provided · Reviewed date: not provided · Reviewer: not provided. Educational only; not legal advice.
              </div>
              <Btn label={`Model a deal in ${sel.code}`} href="/dscr-calculator" size="sm" onClick={(e) => { e.preventDefault(); onNavigate("dscr-calculator"); }} style={{ width: "100%", justifyContent: "center", marginTop: 24 }} />
            </div> : <div className="sl-detail" role="status" aria-live="polite" style={{ background: dc.dark, borderRadius: 9, padding: 32, position: "sticky", top: 96 }}>
              <div style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 600, letterSpacing: "-0.03em", color: dc.cream, lineHeight: 1.1, marginBottom: 12 }}>Choose a jurisdiction</div>
              <p style={{ margin: 0, color: "rgba(238,239,211,0.7)", fontSize: 15, lineHeight: 1.6 }}>
                Enter an exact postal code or full name, or use the interactive map. Invalid or cleared input does not retain a previous result.
              </p>
            </div>}
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
