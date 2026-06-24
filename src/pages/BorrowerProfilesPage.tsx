import React from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, AnimatedNumber, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

interface NavCard { tag: string; title: string; body: string; href: string; }

const CARDS: NavCard[] = [
  { tag: "First-time investor", title: "1-2 property borrowers", body: "Most DSCR lenders require 6-12 months PITIA in reserves and a clean credit report. We'll match you to lenders that accept 620+ FICO and walk you through the entity setup.", href: "/solutions/financial-advisors" },
  { tag: "Portfolio operator", title: "3-10 properties", body: "Blanket loan and portfolio lenders unlock here. Lenders like Lima One Capital and Deephaven build underwriting around your existing book, not each property in isolation.", href: "/solutions/private-funds" },
  { tag: "Institutional / LP", title: "10+ properties, LLCs, syndications", body: "Cap-stack underwriting, true-cost AEY, and tax-engine modeling. Most portfolio LPs use the engine for IC memos and quarterly LP reporting.", href: "/solutions/hedge-funds" },
  { tag: "Foreign national", title: "No SSN, foreign citizen", body: "Hard money and select non-QM shops (Kiavi is SSN-only; some portfolio lenders take ITIN). Expect 25-35% down and a 100-200bps rate premium.", href: "/solutions/ria-registration" },
  { tag: "STR operator", title: "Airbnb / VRBO host", body: "AirDNA 80-100% haircut rules differ by lender. Easy Street Capital and Visio Lending are the most STR-friendly. NYC Local Law 18 changed the math in September 2023.", href: "/solutions/broker-dealers" },
  { tag: "Credit-challenged", title: "Sub-660 FICO", body: "Sub-1.0 DSCR lenders (Visio Flex, Griffin) go to 620. Below that, you are looking at hard money or private lenders at 10%+ rates.", href: "/solutions/service-provider-platform" },
];

export default function BorrowerProfilesPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  return (
    <PageShell
      title="Borrower Profiles"
      subtitle="Which DSCR lane fits your situation? Six borrower archetypes and the lenders that price each one cleanly."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ marginBottom: "40px", padding: "32px", background: "rgba(0,101,101,0.08)", borderRadius: "14px", border: "1px solid rgba(0,101,101,0.22)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {[
            { value: 620, format: (v: number) => Math.round(v).toString(), label: "lowest FICO we'll quote" },
            { value: 75, format: (v: number) => Math.round(v) + "%", label: "LTV most lenders cap at" },
            { value: 0.75, format: (v: number) => v.toFixed(2) + "x", label: "DSCR floor (sub-1.0 lenders)" },
            { value: 21, format: (v: number) => Math.round(v) + "-30d", label: "typical close time", isRange: true, value2: 30 },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", fontWeight: 800, color: MINT, lineHeight: 1 }}>
                {s.isRange ? (
                  <span>
                    <AnimatedNumber value={s.value} format={(v) => Math.round(v).toString()} />
                    -
                    <AnimatedNumber value={s.value2} format={(v) => Math.round(v).toString()} />d
                  </span>
                ) : (
                  <AnimatedNumber value={s.value} format={s.format} />
                )}
              </div>
              <div style={{ fontSize: "12px", color: "#5a6b6b", marginTop: "6px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionTitle}>Choose Your Profile</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
        {CARDS.map((c) => (
          <AnimatedCard key={c.title} hoverScale={true} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", background: "rgba(0,101,101,0.12)", color: MINT, border: `1px solid ${MINT}`, alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.tag}</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: CREAM, lineHeight: 1.2 }}>{c.title}</h3>
            <p style={{ fontSize: "14px", color: "#4a5d5d", lineHeight: 1.6, flex: 1 }}>{c.body}</p>
            <div style={{ fontSize: "13px", fontWeight: 600, color: MINT, textDecoration: "underline", textUnderlineOffset: "3px" }}>See lenders →</div>
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard hoverScale={false} style={{ marginBottom: "32px" }}>
        <div style={sectionTitle}>Documents Most DSCR Lenders Ask For</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {[
            { doc: "Purchase contract (or refinance authorization)", note: "Fully executed. Wholesaler assignments need the assignment addendum too." },
            { doc: "1007 / 1025 appraisal with rent schedule", note: "Self-employed rental income needs the 1007. Most lenders won't accept the lease alone." },
            { doc: "2 months bank statements (all pages)", note: "Liquid reserves post-closing. Retirement accounts count at 70% if 59½+; crypto is $0." },
            { doc: "Credit report (tri-merge)", note: "Pulled within 90 days of close. Most lenders ignore medical collections but flag recent lates." },
            { doc: "Entity documents (LLC / Corp / Trust)", name: "Operating agreement, EIN, formation docs.", note: "All owners ≥51% must be on the loan. Max 4 owners in the borrowing entity." },
            { doc: "Insurance binder (hazard + liability)", name: "Paid receipt or binder letter from agent.", note: "Lender needs to be shown as 'loss payee' for hazard. STR needs commercial liability." },
          ].map((d) => (
            <div key={d.doc} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
              <div style={{ color: CREAM, fontWeight: 700, fontSize: "14px" }}>{d.doc}</div>
              <div style={{ color: "#5a6b6b", fontSize: "12px", marginTop: "4px", lineHeight: 1.5 }}>{d.note}</div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      <AnimatedCard hoverScale={false} style={{ marginBottom: "32px" }}>
        <div style={sectionTitle}>Common Borrower Mistakes</div>
        {[
          { mistake: "Not vesting in an LLC", fix: "Most lenders require entity vesting. Going individual adds 25-50bps and may disqualify you from business-purpose loans." },
          { mistake: "Pulling credit too early", fix: "Credit inquiries stay on the report for 12 months for mortgage scoring. Run rate-shopping within a 14-day window to count as one inquiry." },
          { mistake: "Funding the down payment from a gift", fix: "Some lenders accept gift funds with a 2-year seasoned donor letter. Cash-out proceeds from another property are usually cleaner." },
          { mistake: "Skipping the LLC operating agreement update", fix: "Outdated operating agreements flag underwriter review. Add a 'real estate' purpose clause if you're lending to the LLC." },
          { mistake: "Closing on the 25th of the month", fix: "Avoid mid-month closings. Per-diem interest from the 25th to month-end can cost $300-500. Aim for the 1st-5th." },
        ].map((m, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid rgba(0,55,56,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#ff6b6b", fontWeight: 600, fontSize: "14px" }}>✗ {m.mistake}</span>
            </div>
            <p style={{ color: "#4a5d5d", fontSize: "12px", marginTop: "6px", lineHeight: 1.5 }}><strong style={{ color: MINT }}>Fix:</strong> {m.fix}</p>
          </div>
        ))}
      </AnimatedCard>

      <div style={{ marginTop: "32px", padding: "32px", background: "#e8e9bf", borderRadius: "14px", border: "1px solid rgba(0,55,56,0.12)", textAlign: "center" }}>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: CREAM, marginBottom: "8px" }}>Not sure which profile you fit?</h3>
        <p style={{ fontSize: "14px", color: "#4a5d5d", marginBottom: "20px" }}>Answer 4 questions, get a lender shortlist. No signup, no email required.</p>
        <AnimatedButton onClick={() => onNavigate("rate-quiz")} showArrow={true}>
          Take the Rate Quiz
        </AnimatedButton>
      </div>
    </PageShell>
  );
}