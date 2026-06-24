// @ts-nocheck
import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, AnimatedNumber, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

const STUDIES = [
  {
    slug: "eastside-rentals",
    company: "Eastside Rentals LLC",
    location: "Atlanta, GA",
    type: "Buy-and-Hold Portfolio",
    headline: "From 4 doors to 11 in eighteen months — without a single tax return",
    metrics: [
      { val: "11", label: "Doors financed" },
      { val: "6.625%", label: "Blended rate" },
      { val: "23 days", label: "Avg close time" },
    ],
    challenge: "Eastside had four stabilized SFRs and the cash to scale, but conventional lenders capped them at 10 financed properties and kept asking for personal income docs they didn't want to produce. Every new acquisition meant re-explaining the same self-employed tax situation.",
    solution: "We moved the entire portfolio to DSCR. Each property qualified on its own rent vs PITIA — no DTI, no tax returns. We matched them to Griffin Funding, which places no cap on the number of financed properties, and structured every deal at 75% LTV to hold the best rate tier.",
    result: "Eastside went from 4 to 11 doors in eighteen months at a 6.625% blended rate. Closes averaged 23 days. The owner now models each new deal in the Deal Analyzer before making an offer.",
    quote: "I price the deal and move on. The lender matching means I stopped second-guessing every quote.",
    person: "Marcus Johnson, Principal",
  },
  {
    slug: "lone-star-properties",
    company: "Lone Star Properties",
    location: "Dallas, TX",
    type: "STR + Long-Term Mix",
    headline: "Mixing Airbnb and long-term rentals under one financing strategy",
    metrics: [
      { val: "7", label: "STR units financed" },
      { val: "100%", label: "AirDNA accepted" },
      { val: "$2.1M", label: "Total volume" },
    ],
    challenge: "Lone Star ran a mix of short-term and long-term rentals across Texas. Their STR units kept getting hit with conservative 80% AirDNA haircuts that pushed DSCR below qualifying, and one lender flagged a Texas APR concern on a higher-rate file.",
    solution: "We split the strategy. Stabilized STRs with a 12-month operating history went to lenders accepting 100% AirDNA; newer units used the 80% haircut and a larger down payment to clear DSCR. We ran APR (not just note rate) on every Texas file to stay clear of the §302.101 12% ceiling.",
    result: "Seven STR units financed at full AirDNA income, $2.1M in total volume, zero Texas APR rejections. The long-term units anchored the portfolio's blended DSCR above 1.20x.",
    quote: "They knew which lender took 100% AirDNA before I even asked. That's the whole game for STR.",
    person: "Sandra Rivera, Managing Partner",
  },
  {
    slug: "pacific-coast-investors",
    company: "Pacific Coast Investors",
    location: "San Diego, CA",
    type: "BRRRR + Cash-Out Refi",
    headline: "Recycling capital with a 6-month cash-out instead of waiting a year",
    metrics: [
      { val: "5", label: "BRRRR cycles" },
      { val: "6 mo", label: "Seasoning achieved" },
      { val: "75%", label: "Cash-out LTV" },
    ],
    challenge: "Pacific Coast's BRRRR strategy stalled on seasoning. Most lenders made them wait 12 months to cash out at the new appraised value, locking up capital they needed for the next rehab. The slow recycle was capping how many projects they could run at once.",
    solution: "We routed their stabilized STR cash-outs to Easy Street Capital, which waives the standard 6-month seasoning on qualifying STR files. We lined up the appraisal and trailing income before application so the new value and rent were defensible on day one, and structured cash-outs at 75% LTV.",
    result: "Five BRRRR cycles completed with cash-out at six months instead of twelve, at 75% LTV. The faster recycle effectively doubled the number of simultaneous projects the team could carry.",
    quote: "Cutting seasoning from a year to six months changed how many deals we can run at once.",
    person: "David Chen, Founder",
  },
];

function renderMetricValue(val: string) {
  const numMatch = val.match(/([\d.]+)/);
  if (!numMatch) return val;
  const num = parseFloat(numMatch[1]);
  const parts = val.split(numMatch[1]);
  const prefix = parts[0] || "";
  const suffix = parts[1] || "";
  const decimals = numMatch[1].includes(".") ? numMatch[1].split(".")[1].length : 0;
  return (
    <span>
      {prefix}
      <AnimatedNumber value={num} format={(v) => v.toFixed(decimals)} />
      {suffix}
    </span>
  );
}

function StudyCard({ s, onNavigate }: any) {
  return (
    <a href={`/case-studies/${s.slug}`} style={{ textDecoration: "none" }} onClick={(e) => { e.preventDefault(); onNavigate(`case-studies/${s.slug}`); }}>
      <AnimatedCard hoverScale={true} style={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
          <span style={{ padding: "3px 10px", background: "rgba(0,101,101,0.1)", color: MINT, borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>{s.type}</span>
        </div>
        <div style={{ color: CREAM, fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>{s.company}</div>
        <div style={{ color: "#5a6b6b", fontSize: "13px", marginBottom: "16px" }}>{s.location}</div>
        <p style={{ color: "#465a5a", fontSize: "15px", lineHeight: 1.5, flex: 1 }}>{s.headline}</p>
        <div style={{ display: "flex", gap: "20px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #ffffff" }}>
          {s.metrics.map((m: any) => (
            <div key={m.label}>
              <div style={{ color: MINT, fontWeight: 800, fontSize: "18px" }}>{renderMetricValue(m.val)}</div>
              <div style={{ color: "#647474", fontSize: "11px" }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ color: MINT, fontSize: "14px", fontWeight: 600, marginTop: "18px" }}>Read the deal →</div>
      </AnimatedCard>
    </a>
  );
}

export default function CaseStudiesPage({ onBack, onNavigate, path }: { onBack: () => void; onNavigate: (v: any) => void; path?: string }) {
  const p = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug = p && p.startsWith("/case-studies/") ? p.replace("/case-studies/", "").replace(/\/$/, "") : null;
  const study = slug ? STUDIES.find((s) => s.slug === slug) : null;

  if (study) {
    return (
      <PageShell title={study.company} subtitle={`${study.type} · ${study.location}`} onBack={onBack} onNavigate={onNavigate}>
        <div style={{ maxWidth: "780px" }}>
          {/* Metrics banner */}
          <AnimatedCard hoverScale={false} style={{ background: "rgba(0,101,101,0.08)", borderColor: MINT, marginBottom: "36px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }}>
              {study.metrics.map((m: any) => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <div style={{ color: MINT, fontWeight: 900, fontSize: "32px" }}>{renderMetricValue(m.val)}</div>
                  <div style={{ color: "#5a6b6b", fontSize: "13px" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          <h2 style={{ color: CREAM, fontSize: "28px", fontWeight: 800, lineHeight: 1.2, marginBottom: "32px" }}>{study.headline}</h2>

          {[["The Challenge", study.challenge], ["The Solution", study.solution], ["The Result", study.result]].map(([h, p]) => (
            <div key={h} style={{ marginBottom: "28px" }}>
              <div style={sectionTitle}>{h}</div>
              <p style={{ color: "#3f5252", fontSize: "17px", lineHeight: 1.75 }}>{p}</p>
            </div>
          ))}

          <blockquote style={{ borderLeft: `3px solid ${YELLOW}`, padding: "12px 24px", margin: "36px 0", color: CREAM, fontSize: "22px", fontStyle: "italic", lineHeight: 1.4, fontWeight: 500 }}>
            "{study.quote}"
            <div style={{ color: MINT, fontSize: "15px", fontStyle: "normal", fontWeight: 600, marginTop: "12px" }}>— {study.person}, {study.company}</div>
          </blockquote>

          <AnimatedCard hoverScale={false} style={{ marginTop: "40px", borderColor: MINT, background: "rgba(0,101,101,0.07)" }}>
            <div style={sectionTitle}>Your deal could be next</div>
            <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "18px", lineHeight: 1.6 }}>Model your scenario the same way these investors did.</p>
            <AnimatedButton onClick={() => onNavigate("deal-analyzer")} showArrow={true}>
              Open the Deal Analyzer
            </AnimatedButton>
          </AnimatedCard>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Case Studies"
      subtitle="Real DSCR deals, real structures, real outcomes. How investors used Greenstreet to scale rental portfolios."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {STUDIES.map((s) => <StudyCard key={s.slug} s={s} onNavigate={onNavigate} />)}
      </div>
    </PageShell>
  );
}
