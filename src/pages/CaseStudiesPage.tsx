import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, AnimatedNumber, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

const STUDIES = [
  {
    slug: "vela-capital",
    company: "Vela Capital",
    location: "Wholesale originator",
    type: "Originator",
    headline: "From 25 minutes per file to 6. Same team, 4× the throughput.",
    metrics: [
      { val: "4×", label: "Throughput increase" },
      { val: "6 min", label: "Decision per file (was 25)" },
      { val: "120+", label: "DSCR files / month" },
    ],
    challenge: "Vela Capital was running 120+ DSCR files a month through eight brokers. Every file meant two spreadsheets rebuilt by hand — one showing what the lender would approve, another showing what the deal would actually return after vacancy and management fees. The underwriting desk had become the ceiling. They couldn't grow without adding headcount they didn't want.",
    solution: "Vela moved every file to Greenstreet's Dual-Track engine. Track 1 returns the lender-qualifying DSCR the moment the file lands. Track 2 stress-tests investor survival with vacancy, management, and CapEx in the same pass — no second spreadsheet. The right program surfaces automatically. One application, one set of conditions, one desk instead of four portals running side by side.",
    result: "Decision time dropped from 25 minutes to 6 per file. Vela scaled 4× across the same eight originators without adding a single underwriter. They fund everything through one Greenstreet relationship and haven't reopened a lender portal since.",
    quote: "Greenstreet surfaced a 1.42x DSCR pass and had us rate-locked inside 60 seconds. We stopped running parallel Excel models the same week.",
    person: "Marcos Vela, Managing Partner",
  },
  {
    slug: "northshore-non-qm",
    company: "Northshore Non-QM",
    location: "Wholesale brokerage",
    type: "Broker",
    headline: "Same-day rate lock — and Track 2 caught the deal that should have died.",
    metrics: [
      { val: "7", label: "Programs, one application" },
      { val: "Same-day", label: "Rate lock" },
      { val: "12%", label: "Vacancy gap caught by Track 2" },
    ],
    challenge: "Northshore's brokers were chasing two outside quotes per loan — not because they wanted to, but because checking more lenders meant logging into more portals and re-keying the same file. Pipeline lived in scattered spreadsheets. The Track 2 question — what does the investor actually earn after vacancy? — almost never made it into the conversation.",
    solution: "Now one file runs through Greenstreet and routes to the best-fit program — DSCR 1–4, multi-family, or foreign national — in a single pass. Dual-Track DSCR runs on every quote automatically, so a vacancy gap that would sink a deal surfaces before the number ever reaches the borrower.",
    result: "Brokers stopped chasing outside quotes and started locking same-day. On one file that sailed through Track 1 at a clean 1.18x, Track 2 caught a 12% effective vacancy gap and killed it at the desk — before appraisal, before earnest money, before the borrower knew anything was wrong.",
    quote: "Dual-Track saved a deal our own policy would have waved through. Track 2 caught a 12% vacancy gap before it ever reached the borrower.",
    person: "Priya Ramachandran, Director of Underwriting",
  },
  {
    slug: "quintero-co",
    company: "Quintero & Co.",
    location: "Buy-and-hold investor",
    type: "Investor",
    headline: "Three appraisals they never paid for. $14,800 in hard costs saved at the desk.",
    metrics: [
      { val: "3", label: "Deals killed pre-appraisal" },
      { val: "$14,800", label: "Hard costs avoided" },
      { val: "3 min", label: "ITIN approval on Global program" },
    ],
    challenge: "Quintero & Co. kept discovering deals were marginal only after the appraisal was ordered. On paper the rent covered the payment. In reality, vacancy and management quietly pushed the property underwater on Track 2. They were paying $3,000–7,000 per appraisal to get bad news they could have gotten for free on day one.",
    solution: "Quintero now runs Track 2 — Investor Survival DSCR — before spending a dollar on diligence. Deals that pass Track 1 but fail Track 2 get walked away from at the desk, not at the closing table. For ITIN borrowers, Greenstreet's Global program takes a passport plus alternative credit and funds in-house. No week-long wait for a foreign-national answer.",
    result: "Three deals that would have failed post-appraisal were killed pre-appraisal, saving $14,800 in hard costs. A foreign-national ITIN file that previously took a week to get a straight answer was approved on Greenstreet's Global program in under three minutes.",
    quote: "Foreign-national ITIN flow used to take a week. Greenstreet's Global program approved us in under three minutes — and Track 2 stopped us from buying three appraisals we'd have regretted.",
    person: "Rafael Quintero, Principal",
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
            <div style={sectionTitle}>Run your own file</div>
            <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "18px", lineHeight: 1.6 }}>The same engine these investors used. Free. No account required. Open a deal and see what the math says.</p>
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
      subtitle="Real files. Real decisions. Real outcomes. How investors and brokers used Greenstreet to move faster and lose less."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {STUDIES.map((s) => <StudyCard key={s.slug} s={s} onNavigate={onNavigate} />)}
      </div>
    </PageShell>
  );
}
