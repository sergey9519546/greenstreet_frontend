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
    headline: "Scaled 4× by funding every DSCR deal through one desk",
    metrics: [
      { val: "4×", label: "Throughput increase" },
      { val: "6 min", label: "Decision per file (was 25)" },
      { val: "120+", label: "DSCR files / month" },
    ],
    challenge: "Vela Capital was pre-screening 120+ DSCR files a month across eight brokers. Every file meant rebuilding the same two spreadsheets by hand — one for what the lender would approve, another for what the deal would actually return after vacancy and management. The underwriting desk had become the ceiling on growth.",
    solution: "Vela moved every file through Greenstreet's Dual-Track engine. Track 1 returns the Lender Qualification DSCR the moment the file lands; Track 2 stress-tests Investor Survival with vacancy, management, and CapEx in the same pass. The right Greenstreet program surfaces automatically — one application, one set of conditions — so the desk stopped running portals and parallel Excel models side by side.",
    result: "Decision time fell from 25 minutes to 6 per file. Vela scaled throughput 4× across the same eight originators without adding underwriting headcount — funding through a single Greenstreet relationship.",
    quote: "Greenstreet surfaced a 1.42 DSCR pass and had us rate-locked inside 60 seconds. We stopped running parallel Excel models the same week.",
    person: "Marcos Vela, Managing Partner",
  },
  {
    slug: "northshore-non-qm",
    company: "Northshore Non-QM",
    location: "Wholesale brokerage",
    type: "Broker",
    headline: "From chasing outside quotes to a same-day Greenstreet rate lock",
    metrics: [
      { val: "6", label: "Programs, one application" },
      { val: "Same-day", label: "Rate lock" },
      { val: "12%", label: "Vacancy caught by Track 2" },
    ],
    challenge: "Northshore's brokers were chasing two outside quotes per loan, because checking more meant logging into more portals and re-keying the same file. Pipeline lived in scattered spreadsheets, and the Track 2 question — what the property actually earns after vacancy — rarely made it into the quote.",
    solution: "Now one file runs through Greenstreet and routes to the right program — DSCR 1-4, multi-family, or foreign national — in a single screen. Dual-Track DSCR rides along on every quote, so a vacancy gap that would sink a deal surfaces before the number ever reaches the borrower. Pipeline consolidated into one ledger.",
    result: "Brokers stopped chasing outside quotes and started locking same-day with Greenstreet. On one file that sailed through Track 1, Track 2 caught a 12% vacancy gap and flagged it before the borrower saw a number — a decline that protected both sides.",
    quote: "Dual-Track saved a deal our own policy would have waved through. Track 2 caught a 12% vacancy gap before it ever reached the borrower.",
    person: "Priya Ramachandran, Director of Underwriting",
  },
  {
    slug: "quintero-co",
    company: "Quintero & Co.",
    location: "Buy-and-hold investor",
    type: "Investor",
    headline: "Killed 3 bad deals before appraisal — saved $14,800 in fees",
    metrics: [
      { val: "3", label: "Deals killed pre-appraisal" },
      { val: "$14,800", label: "Hard costs saved" },
      { val: "3 min", label: "ITIN approval" },
    ],
    challenge: "Quintero & Co. kept discovering deals were marginal only after paying for the appraisal. On paper the rent covered the payment; in reality, vacancy and management quietly pushed the property underwater. Separately, their foreign-national ITIN files took a week to get a straight answer.",
    solution: "Quintero now runs Track 2 — Investor Survival DSCR — before spending a dollar on appraisal. Deals that pass Track 1 but fail Track 2 get walked away from at the desk, not at the closing table. For ITIN borrowers, Greenstreet's Global program takes a passport plus alternative credit and funds in-house — in minutes, not days.",
    result: "Three deals that would have failed post-appraisal were killed pre-appraisal, saving more than $14,800 in hard costs. A foreign-national ITIN file that used to take a week was approved on Greenstreet's Global program in under three minutes.",
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
