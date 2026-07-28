import React, { useEffect } from "react";
import { DcShell, dc, H1, H2, Lead } from "../design/dc";
import { MINT_BG, PISTACHIO, MIDNIGHT, radius } from "../theme";

// ─── Content data — three path-driven documents ────────────────────────────

interface LegalSection {
  id: string;
  title: string;
  paras: string[];
}

interface LegalDoc {
  eyebrow: string;
  heading: string;
  sub: string;
  updated: string;
  sections: LegalSection[];
  contactLine: string;
}

const DISCLOSURES: LegalDoc = {
  eyebrow: "Legal & Disclosures",
  heading: "Terms, privacy, and the fine print.",
  sub: "Last updated July 25, 2026. Greenstreet's public tools produce educational estimates for business-purpose rental scenarios — not financial, legal, or tax advice. Use the navigation on the left to jump to any section.",
  updated: "July 25, 2026",
  sections: [
    {
      id: "estimates",
      title: "1. Estimates, not advice",
      paras: [
        "Public tools produce educational estimates from the inputs and assumptions shown on screen. Each result should be read as a model of those inputs, not as a provider decision or a statement of current market terms.",
        "They do not constitute financial, legal, tax, or investment advice. Confirm any figure with a licensed professional before relying on it to close a transaction or file a return.",
      ],
    },
    {
      id: "no-llm",
      title: "2. How figures are produced",
      paras: [
        "The public DSCR and payment calculators do not use a large language model in their numeric calculation path. Their outputs are computed from the inputs and formulas in the application code.",
      ],
    },
    {
      id: "state-rules",
      title: "3. State rule data",
      paras: [
        "Where a state-rule page includes a source, date, and jurisdiction, treat it as a research reference only. Unknown or unreviewed states require manual review. Law changes, and the site may not capture the most recent amendment or interpretation.",
      ],
    },
    {
      id: "privacy",
      title: "4. Privacy",
      paras: [
        "The public calculators can run without an account or personal information. The scenario-review form separately requests contact details and deal parameters; see the Privacy Policy before submitting it.",
      ],
    },
    {
      id: "lenders",
      title: "5. Program information and responsible provider",
      paras: [
        "Program parameters shown in public tools are educational assumptions. They are not proof of current availability and are not commitments. Final eligibility, terms, disclosures, and pricing must be supplied by the responsible licensed provider after review.",
        "This website does not currently publish enough verified business-identity, licensing, or counterparty information to establish whether Greenstreet Finance acts as a lender, broker, software provider, or another role. Do not infer that role from product copy or calculator output.",
      ],
    },
    {
      id: "fair-lending",
      title: "6. Fair-lending notice",
      paras: [
        "Any lender, broker, or other provider involved in a financing transaction must comply with applicable fair-lending and housing law, including the Equal Credit Opportunity Act and Fair Housing Act where applicable.",
        "The presence of this notice does not establish that Greenstreet Finance is a lender or that a financing product is available in a particular jurisdiction.",
      ],
    },
    {
      id: "licensing",
      title: "7. Licensing & identity",
      paras: [
        "Greenstreet tools are intended for business-purpose DSCR scenarios involving investment property. They are not an offer of consumer, owner-occupied, or personal/family/household-purpose mortgage financing.",
        "This website does not publish an NMLS ID, a state-license list, or a business address. Do not treat the site as a representation that a product is available in any particular jurisdiction.",
        "Before submitting an application or relying on a program, obtain the legal business identity, role, licensing information, state availability, and responsible counterparty in writing.",
      ],
    },
    {
      id: "liability",
      title: "8. Limitation of liability",
      paras: [
        'Greenstreet is provided "as is." To the maximum extent permitted by law, Greenstreet Finance is not liable for losses arising from reliance on tool outputs. Your use confirms acceptance of these terms.',
      ],
    },
  ],
  contactLine: "Questions about these terms? Contact legal@greenstreetfinance.com.",
};

const PRIVACY_DOC: LegalDoc = {
  eyebrow: "Legal & Disclosures",
  heading: "Privacy Policy.",
  sub: "How Greenstreet Finance handles information submitted through this website. Jump to any section using the navigation on the left.",
  updated: "July 25, 2026",
  sections: [
    {
      id: "what-we-collect",
      title: "1. What we collect",
      paras: [
        "Calculator inputs are used to produce the displayed estimate. If you submit a preliminary loan request, the site collects the property, requested-loan, timing, and contact details you choose to send. The public form is not designed for Social Security numbers, bank-account details, identity documents, or other sensitive records.",
      ],
    },
    {
      id: "how-we-use",
      title: "2. How we use it",
      paras: [
        "Calculator inputs support the preliminary result shown in the browser. A submitted preliminary loan request is stored so Greenstreet can review the property and contact details. This first-stage request is not a completed mortgage application, lender match, credit decision, rate quote, rate lock, or commitment to lend.",
      ],
    },
    {
      id: "sharing",
      title: "3. Sharing",
      paras: [
        "A preliminary loan request is stored by configured infrastructure so it can be reviewed. This policy does not identify or verify every downstream recipient or contractual control. Do not submit Social Security numbers, bank-account numbers, or other sensitive identity documents through the public form.",
      ],
    },
    {
      id: "cookies",
      title: "4. Cookies",
      paras: [
        "The site uses cookies and browser storage for basic application functionality, consent management, and analytics. Analytics behavior may depend on your consent choices and browser settings. You can clear browser storage through your browser settings; some signed-in features may then require authentication again.",
      ],
    },
    {
      id: "your-rights",
      title: "5. Your rights",
      paras: [
        "Privacy questions may be sent to legal@greenstreetfinance.com. Do not include Social Security numbers, bank-account details, identity documents, or other sensitive identifiers in an email. Applicable rights and response periods depend on governing law.",
      ],
    },
    {
      id: "contact",
      title: "6. Contact",
      paras: ["Privacy questions: legal@greenstreetfinance.com."],
    },
  ],
  contactLine: "Privacy questions: legal@greenstreetfinance.com.",
};

const TERMS_DOC: LegalDoc = {
  eyebrow: "Legal & Disclosures",
  heading: "Terms of Service.",
  sub: "The terms governing your use of Greenstreet Finance tools and website. Jump to any section using the navigation on the left.",
  updated: "July 25, 2026",
  sections: [
    {
      id: "not-advice",
      title: "1. Not financial or legal advice",
      paras: [
        "Greenstreet Finance provides educational scenario tools for informational purposes only. Calculator outputs and DSCR figures are estimates, not commitments, rate locks, or credit approvals. Nothing on this site is legal, tax, or financial advice.",
      ],
    },
    {
      id: "estimates-accuracy",
      title: "2. Estimates and accuracy",
      paras: [
        "Greenstreet tools apply the inputs, formulas, and assumptions identified in their interfaces. Educational results do not establish current pricing, program availability, state-law conclusions, tax treatment, eligibility, or terms. Verify transaction facts with the responsible provider and qualified professionals before acting.",
      ],
    },
    {
      id: "program-estimates",
      title: "3. Financing decisions",
      paras: [
        "A scenario estimate is not a pre-screen, quote, program match, commitment to lend, rate lock, or credit approval. Any actual financing terms must be set by the responsible licensed provider after its review.",
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable use",
      paras: [
        "You agree not to misuse the tools, scrape data, or attempt to reverse-engineer the engine. Published content is provided for your business use, not redistribution.",
      ],
    },
    {
      id: "liability",
      title: "5. Limitation of liability",
      paras: [
        "To the maximum extent permitted by law, Greenstreet Finance is not liable for any indirect, incidental, or consequential damages arising from use of the site or reliance on its estimates.",
      ],
    },
    {
      id: "contact",
      title: "6. Contact",
      paras: ["Legal questions: legal@greenstreetfinance.com."],
    },
  ],
  contactLine: "Legal questions: legal@greenstreetfinance.com.",
};

// ─── Path → document resolver ───────────────────────────────────────────────
function resolveDoc(path: string | undefined): LegalDoc {
  const p = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  if (p.includes("terms-of-service")) return TERMS_DOC;
  if (p.includes("privacy-policy")) return PRIVACY_DOC;
  return DISCLOSURES;
}

// ─── Sticky TOC highlight ────────────────────────────────────────────────────
function useTocHighlight() {
  useEffect(() => {
    const update = () => {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".lg-toc-link"));
      if (!links.length) return;
      const scrollY = window.scrollY + 120;
      let active = links[0];
      for (const link of links) {
        const id = link.getAttribute("href")?.replace("#", "");
        if (!id) continue;
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) {
          active = link;
        }
      }
      links.forEach((l) => {
        const isActive = l === active;
        l.style.color = isActive ? MIDNIGHT : "rgba(0,55,56,0.50)";
        l.style.fontWeight = isActive ? "600" : "500";
        l.style.borderLeftColor = isActive ? dc.rain : "transparent";
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
}

// ─── Doc switcher pills ──────────────────────────────────────────────────────
function DocSwitcher({ current }: { current: LegalDoc }) {
  const pills: { label: string; path: string }[] = [
    { label: "Disclosures", path: "/legal" },
    { label: "Privacy Policy", path: "/legal/privacy-policy" },
    { label: "Terms of Service", path: "/legal/terms-of-service" },
  ];

  const currentHeading = current.heading.replace(".", "");

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 28 }}>
      {pills.map((p) => {
        const isActive =
          (p.label === "Disclosures" && currentHeading === "Terms, privacy, and the fine print") ||
          (p.label === "Privacy Policy" && currentHeading === "Privacy Policy") ||
          (p.label === "Terms of Service" && currentHeading === "Terms of Service");
        return (
          <button
            key={p.label}
            onClick={() => {
              window.history.pushState({}, "", p.path);
              window.dispatchEvent(new PopStateEvent("popstate"));
              window.scrollTo({ top: 0 });
            }}
            style={{
              padding: "9px 18px",
              borderRadius: radius.sm,
              border: `1.5px solid ${isActive ? MIDNIGHT : `${dc.dark}30`}`,
              background: isActive ? MIDNIGHT : "transparent",
              color: isActive ? MINT_BG : MIDNIGHT,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              cursor: "pointer",
              fontFamily: dc.sans,
              transition: "background .15s, border-color .15s, color .15s",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function LegalPage({
  onBack,
  onNavigate,
  path,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
  path?: string;
}) {
  const doc = resolveDoc(path);
  const toc = doc.sections.map((s) => ({
    label: s.title.replace(/^\d+\.\s*/, ""),
    href: "#" + s.id,
  }));

  useTocHighlight();

  useEffect(() => {
    document.title = `${doc.heading.replace(".", "")} | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{`
        .lg-toc-link {
          transition: color .12s, border-left-color .12s;
          text-decoration: none;
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: rgba(0,55,56,0.50);
          padding: 8px 0 8px 14px;
          letter-spacing: -0.01em;
          border-left: 2px solid transparent;
        }
        .lg-toc-link:hover { color: ${MIDNIGHT} !important; }
        @media (max-width: 767px) {
          .lg-content-grid { grid-template-columns: 1fr !important; }
          .lg-toc-col { display: none !important; }
          .lg-toc-link { min-height: 44px; display: flex; align-items: center; }
        }
      `}</style>

      {/* ── HERO — mint bg, dark ink ── */}
      <section
        style={{
          background: MINT_BG,
          padding: "clamp(56px,7vh,96px) clamp(1.5rem,4vw,3rem) clamp(40px,5vh,64px)",
          overflow: "hidden",
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(0,55,56,0.55)",
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            {doc.eyebrow}
          </div>
          <H1
            style={{
              fontSize: "clamp(40px,5vw,76px)",
              lineHeight: 0.99,
              letterSpacing: "-0.035em",
              marginBottom: 18,
              maxWidth: "18ch",
              color: MIDNIGHT,
            }}
          >
            {doc.heading}
          </H1>
          <Lead
            style={{
              fontSize: "clamp(16px,1.4vw,20px)",
              color: "rgba(0,55,56,0.62)",
              maxWidth: "54ch",
              margin: 0,
            }}
          >
            {doc.sub}
          </Lead>
          <DocSwitcher current={doc} />
        </div>
      </section>

      {/* ── CONTENT: sticky TOC + sections card — pistachio band ── */}
      <section
        className="gs-reveal"
        style={{
          background: PISTACHIO,
          padding: "clamp(48px,6vw,80px) clamp(1.5rem,4vw,3rem) clamp(72px,10vh,120px)",
        }}
      >
        <div
          className="lg-content-grid"
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Sticky TOC sidebar */}
          <nav
            className="lg-toc-col"
            aria-label="Section navigation"
            style={{
              position: "sticky",
              top: 96,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {toc.map((t) => (
              <a key={t.href} href={t.href} className="lg-toc-link">
                {t.label}
              </a>
            ))}
          </nav>

          {/* Sections card — solid white, 1px faded border per design system */}
          <div
            style={{
              background: "#fff",
              borderRadius: radius.md,
              border: `1px solid rgba(0,55,56,0.10)`,
              padding: "clamp(32px,4vw,56px)",
            }}
          >
            <div style={{ padding: "14px 18px", background: "rgba(0,55,56,0.04)", borderRadius: 8, border: "1px solid rgba(0,55,56,0.1)", marginBottom: 36, fontSize: 14, color: "rgba(0,55,56,0.65)", lineHeight: 1.6 }}>
              <strong style={{ color: MIDNIGHT }}>Plain summary:</strong>{" "}
              {doc.eyebrow === "Legal & Disclosures" && doc.sections[0]?.id === "estimates" &&
                "This page explains that Greenstreet's tools produce educational estimates from visible inputs and coded formulas, not advice, current market terms, or provider decisions."}
              {doc.sections[0]?.id === "what-we-collect" &&
                "The preliminary-loan-request intake collects the property, requested-loan, timing, and contact details you choose to submit. Do not submit identity documents, bank details, or government identifiers."}
              {doc.sections[0]?.id === "not-advice" &&
                "Tool outputs are estimates, not rate locks or credit approvals. Verify financing with the responsible provider and legal, tax, or investment questions with qualified professionals."}
            </div>
            {doc.sections.map((s) => (
              <div
                key={s.id}
                id={s.id}
                style={{ marginBottom: 40, scrollMarginTop: 100 }}
              >
                <H2
                  style={{
                    fontSize: "clamp(22px,2.4vw,30px)",
                    letterSpacing: "-0.03em",
                    marginBottom: 16,
                    color: MIDNIGHT,
                  }}
                >
                  {s.title}
                </H2>
                {s.paras.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1.65,
                      color: "rgba(0,55,56,0.70)",
                      margin: "0 0 14px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            ))}

            {/* Contact footer line */}
            <div
              style={{
                borderTop: `1px solid ${dc.dark}20`,
                paddingTop: 24,
                fontSize: 14,
                fontWeight: 500,
                color: `${dc.dark}80`,
                letterSpacing: "-0.01em",
              }}
            >
              {doc.contactLine}
            </div>
          </div>
        </div>
      </section>

      {/* ── INVESTOR CTA — clear next step after reading legal copy ── */}
      <section
        style={{
          background: MIDNIGHT,
          color: PISTACHIO,
          padding: "clamp(48px,6vw,72px) clamp(1.5rem,4vw,3rem)",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "clamp(24px,4vw,48px)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "clamp(15px,1.3vw,18px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(238,239,211,0.65)",
                margin: 0,
                letterSpacing: "-0.01em",
                maxWidth: "44ch",
              }}
            >
              Questions about terms? Email{" "}
              <a href="mailto:legal@greenstreetfinance.com" style={{ color: dc.lemon, textDecoration: "none" }}>
                legal@greenstreetfinance.com
              </a>
              . Ready to review a deal? The calculator has no login and shows the assumptions used.
            </p>
          </div>
          <button
            onClick={() => onNavigate("dscr-calculator")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: dc.lemon,
              color: MIDNIGHT,
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
              padding: "14px 28px",
              borderRadius: radius.sm,
              fontFamily: dc.sans,
              letterSpacing: "-0.01em",
              flexShrink: 0,
            }}
          >
            Price a deal — no login →
          </button>
        </div>
      </section>
    </DcShell>
  );
}
