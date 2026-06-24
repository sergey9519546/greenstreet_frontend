import React, { useState } from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;

const ROLES = [
  { title: "Account Executive", team: "Sales", location: "Remote (US)", type: "Full-time",
    body: "You've sold non-QM to mortgage brokers before. You can read a rate sheet without squinting and explain DSCR to a skeptical borrower in 60 seconds flat. You own the broker relationship from first demo to first funded deal — and you're allergic to commission cliffs." },
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Remote (US)", type: "Full-time",
    body: "The Deal Engine prices one file against 7 custom programs in half a second. You'll build the rules engine, harden the math core, and ship the UI that brokers reach for every morning. React, TypeScript, server-side arithmetic. You lose sleep when a rounding error slips through." },
  { title: "DSCR Underwriting Lead", team: "Lending", location: "Remote (US)", type: "Full-time",
    body: "You've underwritten non-QM files. You read prepay statutes for fun. You can translate a lender rate sheet into a rule set that a machine can execute — and you spot a bad deal structure before anyone else in the room does." },
  { title: "Broker Success Manager", team: "Customer", location: "Remote (US)", type: "Full-time",
    body: "You turn new partners into power users. Onboard, train, run deal clinics, answer the 10pm question from a broker in the middle of a close. The metric that matters: how fast does their first deal become their fiftieth?" },
  { title: "Product Designer", team: "Design", location: "Remote (US)", type: "Full-time",
    body: "You're designing tools that brokers use when there's real money on the line — DSCR calculators, lender matrices, deal flow screens. Every decision you make should make the numbers clearer, faster, and harder to misread." },
  { title: "Compliance Counsel", team: "Legal", location: "Remote (US)", type: "Contract",
    body: "The 50-state prepay and usury matrix is only as good as the person updating it. You track state lending statutes as they move and translate new legislation into product rules before anyone gets hurt by the old version." },
];

export default function CareersPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <PageShell
      title="Careers at Greenstreet"
      subtitle="Small team. Hard problems. Real math. We ship tools that professionals use when money is on the line — come build with us."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ maxWidth: "760px", marginBottom: "48px" }}>
        <p style={{ color: "#3f5252", fontSize: "18px", lineHeight: 1.7 }}>
          We're a remote-first team building software that mortgage brokers and real estate investors use when they have a real deal on the line. We move fast, we sweat the math, and we ship tools that are actually useful — not demos that look good in Figma and break in production. If that sounds like your kind of work, we'd like to meet you.
        </p>
      </div>

      <div style={sectionTitle}>Open Roles</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "860px" }}>
        {ROLES.map((r, i) => (
          <AnimatedCard
            key={r.title}
            hoverScale={true}
            style={{
              borderColor: open === i ? MINT : "rgba(0,55,56,0.15)",
              transition: "border-color 0.15s, transform 0.3s, box-shadow 0.3s",
              padding: "28px"
            }}
          >
            <div onClick={() => setOpen(open === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <div>
                <div style={{ color: CREAM, fontWeight: 700, fontSize: "18px" }}>{r.title}</div>
                <div style={{ color: "#5a6b6b", fontSize: "13px", marginTop: "4px" }}>{r.team} · {r.location} · {r.type}</div>
              </div>
              <span style={{ color: MINT, fontSize: "22px", flexShrink: 0, marginLeft: "16px" }}>{open === i ? "−" : "+"}</span>
            </div>
            {open === i && (
              <div style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid rgba(0,55,56,0.12)" }}>
                <p style={{ color: "#465a5a", fontSize: "15px", lineHeight: 1.7, marginBottom: "18px" }}>{r.body}</p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => { window.location.href = "mailto:careers@greenstreetfinance.com"; }}
                >
                  Apply for this role
                </AnimatedButton>
              </div>
            )}
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard hoverScale={false} style={{ marginTop: "48px", maxWidth: "600px", padding: "28px" }}>
        <div style={sectionTitle}>Don't see the right role?</div>
        <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "20px", lineHeight: 1.6 }}>
          We're always glad to meet sharp people in lending, engineering, design, and compliance. Send a note — tell us what you'd build.
        </p>
        <AnimatedButton
          variant="secondary"
          onClick={() => { window.location.href = "mailto:careers@greenstreetfinance.com"; }}
        >
          careers@greenstreetfinance.com
        </AnimatedButton>
      </AnimatedCard>
    </PageShell>
  );
}
