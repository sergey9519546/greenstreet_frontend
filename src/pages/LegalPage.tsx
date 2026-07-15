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
  sub: "Greenstreet's tools organize educational rental-property financing scenarios. Outputs are estimates, not approvals, commitments, rate locks, or financial, legal, tax, or investment advice.",
  updated: "Pending owner and legal approval",
  sections: [
    {
      id: "estimates",
      title: "1. Estimates, not advice",
      paras: [
        "Figures produced by Greenstreet tools, including DSCR, payment, return, tax, program-fit, and state-rule outputs, are preliminary educational estimates based on the inputs and assumptions shown.",
        "They are not approvals, commitments to lend, rate locks, credit decisions, or financial, legal, tax, or investment advice. Verify material figures with the responsible transaction party and qualified professionals before acting.",
      ],
    },
    {
      id: "method",
      title: "2. Models and assumptions",
      paras: [
        "Outputs depend on user inputs, model assumptions, data freshness, rounding, and the scope of the selected tool. A result may omit facts that a provider, appraiser, attorney, accountant, insurer, or other professional considers material.",
      ],
    },
    {
      id: "state-rules",
      title: "3. State rule data",
      paras: [
        "State-law content is an educational summary, not a legal conclusion. Applicability can depend on the jurisdiction, loan purpose, borrower or entity, property, balance, term, and contract. Confirm current law and the final documents with qualified counsel.",
      ],
    },
    {
      id: "privacy",
      title: "4. Privacy",
      paras: [
        "Information handling depends on the feature used and the disclosures presented when information is collected. Review the Privacy Policy and any transaction-specific privacy notice before submitting personal or deal information.",
      ],
    },
    {
      id: "lenders",
      title: "5. Program information",
      paras: [
        "Program labels, thresholds, matches, and pricing scenarios are illustrative unless a transaction-specific disclosure states otherwise. The responsible provider, its role and licensing, required documentation, credit decision, and final terms must be identified in the disclosures and agreements supplied for the transaction.",
      ],
    },
    {
      id: "liability",
      title: "6. Limitation of liability",
      paras: [
        'The site and tools are provided on an "as is" and "as available" basis, subject to applicable law. Do not rely on a tool output as the sole basis for a transaction decision. Any enforceable limitation, warranty, or remedy is governed by the applicable terms and transaction documents.',
      ],
    },
  ],
  contactLine: "Questions may be submitted through the support channel available on this site or the contact method provided in your transaction documents.",
};

const PRIVACY_DOC: LegalDoc = {
  eyebrow: "Legal & Disclosures",
  heading: "Privacy Policy.",
  sub: "A plain-language description of information categories, possible uses, disclosures, and privacy choices. Transaction-specific notices control where they apply.",
  updated: "Pending owner and legal approval",
  sections: [
    {
      id: "what-we-collect",
      title: "1. What we collect",
      paras: [
        "Depending on the feature used, information may include scenario inputs, contact details you choose to submit, communications, account information, and technical data such as device, browser, and usage events. The notice shown at collection should describe any additional categories.",
      ],
    },
    {
      id: "how-we-use",
      title: "2. How we use it",
      paras: [
        "Information may be used to provide requested site functions, calculate scenarios, respond to requests, maintain security, troubleshoot, comply with law, and improve the service. A transaction-specific notice should explain any use for provider matching, underwriting, or a credit-related process.",
      ],
    },
    {
      id: "sharing",
      title: "3. Sharing",
      paras: [
        "Information may be disclosed to service providers, professional advisers, authorities when legally required, or transaction parties when you request or authorize a transaction-related service. The identity and role of transaction parties should be disclosed before information is supplied to them.",
      ],
    },
    {
      id: "cookies",
      title: "4. Cookies",
      paras: [
        "The site may use local storage, cookies, or similar technologies for functionality, security, preferences, and measurement. Browser controls may limit these technologies, although some features may then work differently.",
      ],
    },
    {
      id: "your-rights",
      title: "5. Your rights",
      paras: [
        "Depending on applicable law, you may have rights to request access, correction, deletion, portability, restriction, or an opt-out from certain uses or disclosures. Requests can be submitted through the support channel available on this site. Identity verification and legal exceptions may apply.",
      ],
    },
    {
      id: "contact",
      title: "6. Contact",
      paras: ["Privacy questions and rights requests can be submitted through the support channel available on this site. Transaction-specific notices may provide an additional contact."],
    },
  ],
  contactLine: "Privacy questions and rights requests may be submitted through the support channel available on this site.",
};

const TERMS_DOC: LegalDoc = {
  eyebrow: "Legal & Disclosures",
  heading: "Terms of Service.",
  sub: "Terms for use of the Greenstreet Finance website and educational scenario tools. Separate transaction documents govern any financing or professional service.",
  updated: "Pending owner and legal approval",
  sections: [
    {
      id: "not-advice",
      title: "1. Not financial or legal advice",
      paras: [
        "Greenstreet Finance provides educational scenario tools and content for informational purposes. Calculator outputs, DSCR figures, rate scenarios, program-fit results, and legal or tax summaries are estimates, not commitments, rate locks, credit approvals, or professional advice.",
      ],
    },
    {
      id: "estimates-accuracy",
      title: "2. Estimates and accuracy",
      paras: [
        "Rates, program criteria, property information, and law can change or be incomplete. Verify every material figure with the responsible provider and qualified professionals. Do not treat a scenario output as the sole basis for a purchase, financing, legal, or tax decision.",
      ],
    },
    {
      id: "program-estimates",
      title: "3. Lending and program estimates",
      paras: [
        "A pre-screen, estimate, quote request, or program match is not a commitment to lend, rate lock, credit approval, or guarantee of eligibility. Transaction disclosures must identify the responsible provider, its role and licensing, and the terms that control after any required review.",
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable use",
      paras: [
        "You agree not to misuse the tools, scrape data, or attempt to reverse-engineer the engine. The program details, state rules, and content are provided for your business use, not redistribution.",
      ],
    },
    {
      id: "liability",
      title: "5. Limitation of liability",
      paras: [
        "Any limitation of liability is subject to applicable law and the terms accepted for the relevant service. Users remain responsible for independently reviewing material assumptions and transaction documents before acting.",
      ],
    },
    {
      id: "contact",
      title: "6. Contact",
      paras: ["Questions can be submitted through the support channel available on this site or the contact method provided in transaction documents."],
    },
  ],
  contactLine: "Questions can be submitted through the support channel available on this site.",
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
          <a
            key={p.label}
            href={p.path}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
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
              textDecoration: "none",
            }}
          >
            {p.label}
          </a>
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
        @media (max-width: 767px) { .lg-toc-col { display: none !important; } }
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
                "Greenstreet's tools produce preliminary educational estimates, not approvals, commitments, rate locks, or advice. State-law and program information must be verified before reliance."}
              {doc.sections[0]?.id === "what-we-collect" &&
                "Information handling depends on the feature used. Applicable law may provide access, correction, deletion, portability, restriction, or opt-out rights, subject to verification and exceptions."}
              {doc.sections[0]?.id === "not-advice" &&
                "Tool outputs are estimates, not rate locks or credit approvals. Verify material information with the responsible transaction party and qualified professionals before acting."}
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
              Questions about these documents can be submitted through the support
              page. Transaction-specific disclosures and agreements control any
              provider relationship, licensing representation, credit decision, or
              financing terms.
            </p>
          </div>
          <a
            href="/support"
            onClick={(event) => { event.preventDefault(); onNavigate("support"); }}
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
              textDecoration: "none",
            }}
          >
            Open support →
          </a>
        </div>
      </section>
    </DcShell>
  );
}
