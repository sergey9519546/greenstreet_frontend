import React from "react";
import { PageShell, AnimatedCard, AnimatedButton, sectionTitle } from "./PageShell";

const PRIVACY = {
  title: "Privacy Policy",
  subtitle: "How Greenstreet Finance collects, uses, and protects your information.",
  updated: "Last updated June 22, 2026",
  sections: [
    { h: "What we collect", p: "When you use our calculators and tools, we may collect the deal parameters you enter (property price, rent, FICO range, LTV, state). If you request a rate estimate or contact us, we collect your name, email, and phone number. We do not pull your credit or store full Social Security numbers through this website." },
    { h: "How we use it", p: "We use the information to provide rate estimates, match deals to lenders, respond to your inquiries, and improve our tools. Deal parameters entered into calculators are used to compute results and are not sold." },
    { h: "Sharing", p: "We share your contact information with lending partners only when you explicitly request to be matched or quoted. We do not sell personal information. Service providers (hosting, analytics) process data on our behalf under confidentiality terms." },
    { h: "Cookies", p: "We use cookies for basic site functionality and analytics. You can control cookie preferences through your browser settings. Some features may not function without essential cookies." },
    { h: "Your rights", p: "You may request access to, correction of, or deletion of your personal information by emailing privacy@greenstreetfinance.com. We respond to verified requests within 30 days." },
    { h: "Contact", p: "Questions about this policy? Email privacy@greenstreetfinance.com." },
  ],
};

const TERMS = {
  title: "Terms of Service",
  subtitle: "The terms governing your use of Greenstreet Finance tools and website.",
  updated: "Last updated June 22, 2026",
  sections: [
    { h: "Not financial or legal advice", p: "Greenstreet Finance provides educational tools and rate estimates for informational purposes only. Calculator outputs, DSCR figures, rate ranges, and lender information are estimates, not commitments, rate locks, or credit approvals. Nothing on this site is legal, tax, or financial advice." },
    { h: "Estimates and accuracy", p: "Rate ranges, lender criteria, and state prepay rules reflect our best information as of the date shown and change frequently. Verify all figures with the lender and qualified counsel before acting. We are not liable for decisions made based on estimates." },
    { h: "Lender matching", p: "When we match a deal to a lender, we make no guarantee of approval, rate, or terms. Final terms are set by the lender after full underwriting. Greenstreet Finance is a technology and matching platform, not the lender of record unless explicitly stated." },
    { h: "Acceptable use", p: "You agree not to misuse the tools, scrape data, or attempt to reverse-engineer the engine. The lender matrix, state rules, and content are provided for your business use, not redistribution." },
    { h: "Limitation of liability", p: "To the maximum extent permitted by law, Greenstreet Finance is not liable for any indirect, incidental, or consequential damages arising from use of the site or reliance on its estimates." },
    { h: "Contact", p: "Questions about these terms? Email legal@greenstreetfinance.com." },
  ],
};

export default function LegalPage({ onBack, onNavigate, path }: { onBack: () => void; onNavigate: (v: any) => void; path?: string }) {
  const p = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const doc = p && p.includes("terms") ? TERMS : PRIVACY;
  return (
    <PageShell title={doc.title} subtitle={doc.subtitle} onBack={onBack} onNavigate={onNavigate}>
      <div style={{ maxWidth: "740px" }}>
        <div style={{ color: "#5a6b6b", fontSize: "13px", marginBottom: "40px" }}>{doc.updated}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {doc.sections.map((s) => (
            <AnimatedCard key={s.h} hoverScale={true}>
              <div style={sectionTitle}>{s.h}</div>
              <p style={{ color: "#3f5252", fontSize: "16px", lineHeight: 1.75, margin: 0 }}>{s.p}</p>
            </AnimatedCard>
          ))}
        </div>
        <div style={{ marginTop: "48px", display: "flex", gap: "16px" }}>
          <AnimatedButton
            variant={doc === PRIVACY ? "primary" : "secondary"}
            showArrow={false}
            onClick={() => {
              window.history.pushState({}, "", "/privacy-policy");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            Privacy Policy
          </AnimatedButton>
          <AnimatedButton
            variant={doc === TERMS ? "primary" : "secondary"}
            showArrow={false}
            onClick={() => {
              window.history.pushState({}, "", "/terms-of-service");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            Terms of Service
          </AnimatedButton>
        </div>
      </div>
    </PageShell>
  );
}
