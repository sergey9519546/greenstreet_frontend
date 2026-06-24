import React, { useState } from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;

const ROLES = [
  { title: "Account Executive", team: "Sales", location: "Remote (US)", type: "Full-time",
    body: "Own the broker relationship from first demo to first funded deal. You know non-QM, you've sold to mortgage professionals, and you can explain a DSCR rate sheet in your sleep." },
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Remote (US)", type: "Full-time",
    body: "Build the Deal Engine: the rules engine that prices one deal against eleven lenders in half a second. React, TypeScript, and a server-side math core. You care about correctness and speed equally." },
  { title: "DSCR Underwriting Lead", team: "Lending", location: "Remote (US)", type: "Full-time",
    body: "Translate lender rate sheets and overlays into the rule sets that power the engine. You've underwritten non-QM, you read prepay statutes for fun, and you spot a bad deal structure instantly." },
  { title: "Broker Success Manager", team: "Customer", location: "Remote (US)", type: "Full-time",
    body: "Make brokers wildly effective on the platform. Onboard new partners, run deal clinics, and turn the first funded deal into the first fifty." },
  { title: "Product Designer", team: "Design", location: "Remote (US)", type: "Full-time",
    body: "Design tools brokers reach for every day. Calculators, lender matrices, deal flows — clear, fast, and trustworthy with money on the line." },
  { title: "Compliance Counsel", team: "Legal", location: "Remote (US)", type: "Contract",
    body: "Keep the 50-state prepay and usury matrix correct as laws change. You track state lending statutes and can turn a new bill into a product rule." },
];

export default function CareersPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void; }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <PageShell
      title="Careers"
      subtitle="World-class people, an even better team. Help us build the rails for DSCR lending."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ maxWidth: "760px", marginBottom: "48px" }}>
        <p style={{ color: "#3f5252", fontSize: "18px", lineHeight: 1.7 }}>
          We're a small, remote-first team building software for real estate investors and the brokers who serve them. We move fast, ship real tools, and care about getting the math right when there's money on the line. If that sounds like you, we want to talk.
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
        <div style={sectionTitle}>Don't see your role?</div>
        <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "20px", lineHeight: 1.6 }}>
          We're always glad to meet sharp people in lending, engineering, and design. Send us a note.
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
