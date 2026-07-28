import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";
import { radius } from "../theme";

const BROKERS_PORTAL_MOBILE_CSS = `
  @media (max-width: 700px) {
    .dc-hero { grid-template-columns: 1fr !important; min-height: 0 !important; }
    .bp-benefit-grid { grid-template-columns: 1fr !important; }
    .bp-portal-actions { align-items: stretch !important; }
    .bp-portal-actions button { width: 100%; justify-content: center; min-height: 44px; }
  }
`;

// ── Partner workflow feature tiles ────────────────────────────────────────────
const BENEFITS = [
  {
    icon: "01",
    title: "One deal intake",
    desc: "Start with the property, requested loan, rent, purpose, and timing instead of a blank callback form.",
  },
  {
    icon: "02",
    title: "Preliminary DSCR",
    desc: "Review the modeled payment coverage before you decide whether to submit the borrower request.",
  },
  {
    icon: "03",
    title: "Broker context",
    desc: "Identify yourself as the mortgage broker so the request reaches review with the right relationship context.",
  },
  {
    icon: "04",
    title: "Clear consent",
    desc: "Share only the contact details and communication permission appropriate for the financing inquiry.",
  },
  {
    icon: "05",
    title: "No credit pull to start",
    desc: "The preliminary request begins with deal facts and does not ask for an SSN, bank information, or identity documents.",
  },
  {
    icon: "06",
    title: "A usable next step",
    desc: "Greenstreet receives the core property and loan request before any follow-up conversation begins.",
  },
];

// Representative partner stories explain the intended workflow without
// presenting invented endorsements or attributed customer claims.
const PARTNER_STORIES_NOTE =
  "Representative product journeys, not attributed customer reviews or reported transaction results.";
const PARTNER_STORIES = [
  {
    story: "Daniel receives a purchase scenario with a signed contract and closing target. He enters the property and requested-loan facts once, checks the payment coverage, and carries the same facts into the borrower request.",
    name: "Daniel Cho",
    role: "Mortgage broker · purchase handoff",
  },
  {
    story: "Priya is comparing two refinance structures for a portfolio client. She uses the same entered rate and expenses to make the payment difference visible before asking the borrower which path to submit.",
    name: "Priya Shah",
    role: "Mortgage broker · portfolio refinance",
  },
  {
    story: "Mateo is working with a short-term-rental host. He keeps projected and documented revenue separate, records the borrower’s timeline and consent, and leaves provider income treatment for follow-up.",
    name: "Mateo Rivera",
    role: "Referral partner · STR request",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BrokersPortalPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Partner With Greenstreet | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "State Rules", view: "state-laws" },
        { label: "FAQ", view: "faq" },
      ]}
      cta={{ label: "Start a borrower request →", view: "book-demo" }}
    >
      <style>{BROKERS_PORTAL_MOBILE_CSS}</style>
      {/* ── HERO — solid dark, two-column: copy left + sign-in card right ─── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vh,104px) ${dc.pad} clamp(56px,7vh,96px)`,
          overflow: "hidden",
        }}
      >
        <div
          className="dc-hero"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
          }}
        >
          {/* Left: Hero copy */}
          <div id="gs-hero-content">
            {/* Eyebrow */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: "rgba(238,239,211,0.5)",
                marginBottom: 20,
              }}
            >
              GREENSTREET &middot; Partner workflow
            </div>

            {/* H1 */}
            <h1
              style={{
                fontSize: "clamp(42px,5.4vw,82px)",
                fontWeight: 600,
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                margin: "0 0 18px",
              }}
            >
              Model the deal once.
              <br />
              Move the borrower&apos;s
              <br />
              request forward.
            </h1>

            {/* Purpose line */}
            <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "46ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
              For mortgage brokers and referral partners who want to move from
              property math to a preliminary DSCR loan request without rebuilding
              the file.
            </div>

            {/* Sub */}
            <p
              style={{
                fontSize: "clamp(15px,1.2vw,18px)",
                fontWeight: 500,
                lineHeight: 1.55,
                letterSpacing: "-0.02em",
                color: "rgba(238,239,211,0.7)",
                maxWidth: "46ch",
                margin: "0 0 32px",
              }}
            >
              Start with the deal facts, see the preliminary coverage result, and
              choose whether to send the request for follow-up.
            </p>

            {/* Checklist */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxWidth: 300,
              }}
            >
              {[
                "Borrower deal context in one flow",
                "Preliminary DSCR before contact capture",
                "No credit pull to start",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(238,239,211,0.75)",
                  }}
                >
                  <span style={{ color: dc.emerald }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sign-in card — solid fill, flat 1.5px faded border, no blur */}
          <div
            style={{
              background: dc.teal,
              border: `1.5px solid ${dc.dark}30`,
              borderRadius: radius.md,
              padding: "clamp(28px,3vw,40px)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 18,
              }}
            >
              Submit a borrower deal
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* CTA block — real Firebase auth lives in the portal/ComplianceDashboard */}
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  color: "rgba(238,239,211,0.7)",
                  margin: "0 0 4px",
                  letterSpacing: "-0.01em",
                }}
              >
                Start with the property, requested loan amount, expected rent, and
                borrower context. The final step identifies you as the broker and
                records the contact consent you choose.
              </p>
              <button
                onClick={() => window.openQualify?.({ role: "broker" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: dc.lemon,
                  color: dc.dark,
                  border: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  padding: 14,
                  borderRadius: radius.sm,
                  marginTop: 4,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                Start a borrower loan request →
              </button>

              <div
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(238,239,211,0.5)",
                  marginTop: 6,
                  letterSpacing: "-0.01em",
                }}
              >
                Want to check the numbers first?{" "}
                <button
                  onClick={() => onNavigate("dscr-calculator")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: dc.emerald,
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: dc.sans,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Open the DSCR calculator →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFIT GRID — "Everything a serious investor needs." ─────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2
            className="gs-reveal"
            style={{
              fontSize: "clamp(28px,3.4vw,46px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: "0 0 12px",
              maxWidth: "18ch",
            }}
          >
            A cleaner partner handoff.
          </h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(0,55,56,0.6)", margin: "0 0 36px", maxWidth: "52ch", lineHeight: 1.6 }}>
            Give the financing team enough context to begin productively, while
            keeping the preliminary calculation and the request clearly labeled.
          </p>

          <div
            className="gs-reveal bp-benefit-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              background: `${dc.dark}20`,
              borderRadius: radius.md,
              overflow: "hidden",
            }}
          >
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                style={{ background: dc.cream, padding: "36px 30px" }}
              >
                <Mono
                  style={{
                    display: "block",
                    fontSize: 28,
                    fontWeight: 600,
                    color: dc.rain,
                    marginBottom: 14,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {b.icon}
                </Mono>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                    color: dc.dark,
                  }}
                >
                  {b.title}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    color: "rgba(0,55,56,0.6)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FROM THE FIELD — role-based testimonials ─────────────────────── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              How the flow connects
            </div>
            <h2
              style={{
                fontSize: "clamp(26px,3.2vw,44px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Three moments that should not require re-entry.
            </h2>
          </div>

          <div
            className="gs-reveal"
            style={{
              background: dc.white,
              border: `1px solid ${dc.dark}15`,
              borderRadius: radius.md,
              padding: "4px 28px 8px",
            }}
          >
            {PARTNER_STORIES.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 0",
                  borderBottom:
                    i < PARTNER_STORIES.length - 1
                      ? `1px solid ${dc.dark}15`
                      : "none",
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    color: dc.dark,
                    lineHeight: 1.6,
                    margin: "0 0 12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.story}
                </p>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: dc.rain,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(0,55,56,0.5)",
                    marginTop: 2,
                  }}
                >
                  {t.role}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 11, color: "rgba(0,55,56,0.45)", margin: "14px 0 0", lineHeight: 1.5 }}>
              {PARTNER_STORIES_NOTE}
            </p>
          </div>
        </div>
      </section>

      {/* ── PORTAL CTA — action-forward, portal-focused ──────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal bp-portal-actions"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "clamp(24px,4vw,56px)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 320px" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 14,
              }}
            >
              Have a borrower deal ready?
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.6vw,50px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                color: dc.cream,
                margin: "0 0 14px",
              }}
            >
              Start with the property.
              <br />
              Submit a clearer request.
            </h2>
            <p
              style={{
                fontSize: "clamp(14px,1.2vw,17px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(238,239,211,0.6)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              The initial request does not pull credit and is not an approval,
              rate quote, rate lock, or commitment to lend.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: "0 0 auto",
            }}
          >
            <button
              onClick={() => window.openQualify?.({ role: "broker" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: dc.lemon,
                color: dc.dark,
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                padding: "15px 32px",
                borderRadius: radius.sm,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Start a borrower request →
            </button>
            <button
              onClick={() => onNavigate("dscr-calculator")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                color: dc.cream,
                border: `1.5px solid rgba(238,239,211,0.3)`,
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                padding: "15px 32px",
                borderRadius: radius.sm,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Run the DSCR calc
            </button>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
