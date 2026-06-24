// @ts-nocheck
import React, { useState } from "react";
import {
  PageShell,
  sectionTitle,
  AnimatedCard,
  AnimatedButton,
  AnimatedNumber,
  PremiumInput,
} from "./PageShell";
import { swatch } from "../theme";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

type Status = "ALLOWED" | "PROHIBITED" | "RESTRICTED" | "DE FACTO PROHIBITED";

const STATES: { state: string; code: string; ppp: Status; note: string; threshold?: string }[] = [
  { state: "Alaska", code: "AK", ppp: "RESTRICTED", note: "Individual: PROHIBITED. LLC/Corp: ALLOWED.", threshold: "N/A" },
  { state: "Arkansas", code: "AR", ppp: "ALLOWED", note: "First 3 years allowed on remaining balance. Max 3/2/1 schedule." },
  { state: "California", code: "CA", ppp: "ALLOWED", note: "Business-purpose DSCR generally allowed. Confirm lender overlay." },
  { state: "Florida", code: "FL", ppp: "ALLOWED", note: "Allowed. High climate-risk zone — insurance availability kill gate applies." },
  { state: "Georgia", code: "GA", ppp: "ALLOWED", note: "No state PPP restrictions for business-purpose loans." },
  { state: "Illinois", code: "IL", ppp: "RESTRICTED", note: "Individual: PROHIBITED or APR ≥ 8%. Entity: APR fall-rate tests apply." },
  { state: "Kansas", code: "KS", ppp: "DE FACTO PROHIBITED", note: "De facto prohibited for most DSCR structures." },
  { state: "Maine", code: "ME", ppp: "RESTRICTED", note: "ARM loans: no PPP (cap 2 months interest)." },
  { state: "Maryland", code: "MD", ppp: "DE FACTO PROHIBITED", note: "De facto prohibited. Most DSCR lenders decline to quote." },
  { state: "Minnesota", code: "MN", ppp: "ALLOWED", note: "HF 3437 ENACTED 4/23/26, eff 8/1/26 — business-purpose DSCR now ALLOWED. Consumer still prohibited (§58.137).", threshold: "eff. 8/1/2026" },
  { state: "Mississippi", code: "MS", ppp: "RESTRICTED", note: "Declining-only structure. Flat PPP above 1yr prohibited (§75-17-31)." },
  { state: "New Jersey", code: "NJ", ppp: "RESTRICTED", note: "Individual: PROHIBITED. LLC: HIGH-RISK (lender-split). C-Corp/S-Corp: ALLOWED. Flag NJ LLC deals." },
  { state: "New Mexico", code: "NM", ppp: "RESTRICTED", note: "Individual: PROHIBITED. Entity: varies by lender." },
  { state: "New York", code: "NY", ppp: "RESTRICTED", note: "Residential: PROHIBITED. Business-purpose: ALLOWED (Banking Law §6-l). Criminal usury cap: 25% (Penal Law §190.40)." },
  { state: "North Dakota", code: "ND", ppp: "DE FACTO PROHIBITED", note: "De facto prohibited." },
  { state: "Ohio", code: "OH", ppp: "RESTRICTED", note: "1–2 unit: threshold $116,356 (2026, indexed Jan 1). Above threshold: ALLOWED, max 1% penalty, max 5 years (ORC §1343.011). 3–4 unit: no restriction.", threshold: "$116,356 (2026)" },
  { state: "Oklahoma", code: "OK", ppp: "RESTRICTED", note: "APR ≥ 13%: BANNED." },
  { state: "Pennsylvania", code: "PA", ppp: "RESTRICTED", note: "1–2 unit: threshold $319,777 (2026). Below: restricted. Above: business-purpose ALLOWED. PA rate cap 7.25% (Jun/Jul 2026).", threshold: "$319,777 (2026)" },
  { state: "Rhode Island", code: "RI", ppp: "RESTRICTED", note: "Max 1 year, max 2% of remaining balance." },
  { state: "South Carolina", code: "SC", ppp: "RESTRICTED", note: "Below $690,000: NOT ALLOWED." },
  { state: "Texas", code: "TX", ppp: "RESTRICTED", note: "APR ≥ 12%: BANNED. Standard DSCR rates typically compliant." },
  { state: "Washington", code: "WA", ppp: "RESTRICTED", note: "5/6 ARM: no PPP on some lender matrices. Blanket ARM ban unverified." },
  { state: "West Virginia", code: "WV", ppp: "RESTRICTED", note: "Max 3 years, max 1% penalty." },
  { state: "Wisconsin", code: "WI", ppp: "RESTRICTED", note: "ARM loans: no PPP (cap 2 months interest)." },
];

const ALL_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri",
  "Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia",
  "Washington","West Virginia","Wisconsin","Wyoming"
].map(s => {
  const found = STATES.find(x => x.state === s);
  if (found) return found;
  return { state: s, code: s.substring(0,2).toUpperCase(), ppp: "ALLOWED" as Status, note: "No known PPP restrictions for business-purpose DSCR loans." };
});

const statusColor = (s: Status) => ({
  "ALLOWED": MINT,
  "RESTRICTED": YELLOW,
  "PROHIBITED": "#ff6b6b",
  "DE FACTO PROHIBITED": "#ff6b6b",
}[s] || "#5a6b6b");

export default function StateLawsPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"restricted"|"prohibited">("all");

  const results = ALL_STATES.filter(s => {
    const q = search.toLowerCase();
    if (q && !s.state.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
    if (filter === "restricted" && s.ppp !== "RESTRICTED") return false;
    if (filter === "prohibited" && s.ppp !== "PROHIBITED" && s.ppp !== "DE FACTO PROHIBITED") return false;
    return true;
  });

  const countAllowed = results.filter(s => s.ppp === "ALLOWED").length;
  const countRestricted = results.filter(s => s.ppp === "RESTRICTED").length;
  const countProhibited = results.filter(s => s.ppp === "DE FACTO PROHIBITED" || s.ppp === "PROHIBITED").length;

  return (
    <PageShell
      title="State Prepay and Usury Rules"
      subtitle="50-state PPP matrix for business-purpose DSCR loans. Verify with legal counsel before closing."
      onBack={onBack} onNavigate={onNavigate}
    >
      {/* Summary badges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "36px" }}>
        {[
          { label: "States with no restrictions", count: countAllowed, color: MINT },
          { label: "States with restrictions", count: countRestricted, color: YELLOW },
          { label: "De facto prohibited", count: countProhibited, color: "#ff6b6b" },
        ].map(b => (
          <AnimatedCard key={b.label} style={{ textAlign: "center" }} hoverScale={true}>
            <div style={{ color: b.color, fontWeight: 800, fontSize: "36px" }}>
              <AnimatedNumber value={b.count} format={Math.round} />
            </div>
            <div style={{ color: "rgba(0,55,56,0.6)", fontSize: "13px" }}>{b.label}</div>
          </AnimatedCard>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: "240px" }}>
          <PremiumInput
            label="Search state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["all","restricted","prohibited"] as const).map(f => (
            <AnimatedButton
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? "primary" : "secondary"}
              showArrow={false}
              style={{ height: "46px" }}
            >
              {f === "all" ? "All States" : f === "restricted" ? "Restricted" : "Prohibited"}
            </AnimatedButton>
          ))}
        </div>
      </div>

      {/* State rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {results.map(s => (
          <AnimatedCard key={s.state} style={{ display: "grid", gridTemplateColumns: "140px 140px 1fr auto", gap: "20px", alignItems: "center", padding: "18px 24px" }} hoverScale={true}>
            <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px" }}>{s.state}</div>
            <div>
              <span style={{
                display: "inline-block", padding: "4px 12px", borderRadius: "20px",
                background: statusColor(s.ppp) + "18", color: statusColor(s.ppp),
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
              }}>
                {s.ppp}
              </span>
            </div>
            <div style={{ color: "rgba(0,55,56,0.8)", fontSize: "14px", lineHeight: 1.5 }}>{s.note}</div>
            {s.threshold && <div style={{ color: YELLOW, fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>{s.threshold}</div>}
          </AnimatedCard>
        ))}
      </div>
      <p style={{ color: "rgba(0,55,56,0.5)", fontSize: "12px", marginTop: "24px", fontFamily: "Outfit, sans-serif" }}>
        Source: Greenstreet Finance state matrix · June 2026 · OH/PA thresholds re-index January 1 annually · MN HF 3437 effective 8/1/2026. Not legal advice.
      </p>
    </PageShell>
  );
}

