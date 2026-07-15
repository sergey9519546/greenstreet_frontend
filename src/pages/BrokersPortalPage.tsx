import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";
import { radius } from "../theme";

// ── Workspace feature tiles — ported from "Everything a serious investor needs." ──
const BENEFITS = [
  {
    icon: "01",
    title: "Saved scenarios",
    desc: "Organize scenario inputs and revisit them when the workspace makes that feature available to your account.",
  },
  {
    icon: "02",
    title: "Prepare for provider review",
    desc: "Use a scenario summary to identify questions and documents for the responsible transaction party. A workspace action is not an underwriting submission or approval unless transaction disclosures expressly say so.",
  },
  {
    icon: "03",
    title: "Shareable deal summary",
    desc: "Create a summary of scenario inputs and assumptions for discussion or recordkeeping when export is available.",
  },
  {
    icon: "04",
    title: "Portfolio tracker",
    desc: "Keep scenario records together for comparison without treating workspace status as a provider's transaction status.",
  },
  {
    icon: "05",
    title: "State-rule alerts",
    desc: "Review educational state-rule prompts and verify applicability, current law, and final contract language with qualified counsel.",
  },
  {
    icon: "06",
    title: "Export-ready deal package",
    desc: "Collect available scenario materials for your own review. Exports remain estimates and do not become provider-issued underwriting documents.",
  },
];

// Hypothetical use cases. These are not customers, testimonials, or typical results.
const EXAMPLES = [
  {
    title: "Illustrative use: compare assumptions",
    body: "A user can compare how rent, payment, leverage, and expense assumptions change a preliminary coverage estimate before speaking with a provider.",
  },
  {
    title: "Illustrative use: prepare questions",
    body: "A scenario summary can help a user identify which program, documentation, state-law, and pricing questions still require professional review.",
  },
  {
    title: "Illustrative use: preserve context",
    body: "Saved assumptions can make later comparisons easier, but they do not represent an approval, rate lock, commitment, or provider-maintained loan file.",
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
    document.title = "InvestGO | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const navigateLink = (view: string) => ({
    href: `#${view}`,
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onNavigate(view);
    },
  });

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "State Rules", view: "state-laws" },
        { label: "FAQ", view: "faq" },
      ]}
      cta={{ label: "Sign in →", view: "portal" }}
    >
      <style>{`
        .bp-link:focus-visible,
        .bp-page button:focus-visible {
          outline: 3px solid ${dc.emerald};
          outline-offset: 3px;
        }
        .bp-hero > *,
        .bp-benefits > *,
        .bp-page section > div {
          min-width: 0;
        }
        @media (max-width: 760px) {
          .bp-hero,
          .bp-benefits {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .bp-cta {
            align-items: stretch !important;
          }
          .bp-cta-actions {
            flex: 1 1 100% !important;
            width: 100%;
          }
          .bp-cta-actions .bp-link {
            box-sizing: border-box;
            justify-content: center;
            width: 100%;
          }
        }
        @media (max-width: 420px) {
          .bp-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .bp-benefit-card {
            padding: 26px 20px !important;
          }
          .bp-example-card {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .bp-page {
            overflow-wrap: anywhere;
          }
        }
      `}</style>
      <div className="bp-page" id="main-content">
      {/* ── HERO — solid dark, two-column: copy left + sign-in card right ─── */}
      <section
        className="bp-section"
        aria-labelledby="bp-page-title"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vh,104px) ${dc.pad} clamp(56px,7vh,96px)`,
          overflow: "hidden",
        }}
      >
        <div
          className="dc-hero bp-hero"
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
                color: "rgba(238,239,211,0.62)",
                marginBottom: 20,
              }}
            >
              INVEST<span style={{ opacity: 0.5 }}>GO</span> &middot; Investor Workspace
            </div>

            {/* H1 */}
            <h1
              id="bp-page-title"
              style={{
                fontSize: "clamp(42px,5.4vw,82px)",
                fontWeight: 600,
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                margin: "0 0 18px",
              }}
            >
              Your scenarios,{" "}
              <br aria-hidden="true" />
              your assumptions,{" "}
              <br aria-hidden="true" />
              one workspace.
            </h1>

            {/* Purpose line */}
            <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "46ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
              InvestGO is presented as a workspace for organizing educational DSCR
              scenarios and their assumptions. A saved result is not an
              underwriting decision, approval, rate lock, submission, or commitment
              to lend.
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
              Access, storage, export, and account terms depend on the version made
              available to you and the disclosures shown at sign-in.
            </p>

            {/* Checklist */}
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxWidth: 300,
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {[
                "Save and revisit scenario estimates",
                "Prepare shareable scenario summaries",
                "Prepare questions for provider review",
              ].map((item) => (
                <li
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
                  <span aria-hidden="true" style={{ color: dc.emerald }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Sign-in card — solid fill, flat 1.5px faded border, no blur */}
          <div
            aria-label="Investor workspace access"
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
              Investor sign-in
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
                Access available saved scenarios and summaries in one place. Any
                provider workflow is governed by separate transaction disclosures.
              </p>
              <a
                {...navigateLink("portal")}
                className="bp-link"
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
                  textDecoration: "none",
                }}
              >
                Sign in to INVEST<span style={{ opacity: 0.5 }}>GO</span> →
              </a>

              <div
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(238,239,211,0.62)",
                  marginTop: 6,
                  letterSpacing: "-0.01em",
                }}
              >
                New to Greenstreet?{" "}
                <a
                  {...navigateLink("rate-quiz")}
                  className="bp-link"
                  style={{
                    background: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: dc.emerald,
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: dc.sans,
                    letterSpacing: "-0.01em",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Explore a first scenario →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFIT GRID — "Everything a serious investor needs." ─────────── */}
      <section
        className="bp-section"
        aria-labelledby="bp-benefits-title"
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2
            id="bp-benefits-title"
            className="gs-reveal"
            style={{
              fontSize: "clamp(28px,3.4vw,46px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: "0 0 12px",
              maxWidth: "18ch",
            }}
          >
            A workspace for organizing scenarios.
          </h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(0,55,56,0.6)", margin: "0 0 36px", maxWidth: "52ch", lineHeight: 1.6 }}>
            Each scenario can preserve the inputs and assumptions used for an
            educational estimate. Availability varies by account and release.
          </p>

          <div
            className="gs-reveal bp-benefits"
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
                className="bp-benefit-card"
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
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                    color: dc.dark,
                    lineHeight: 1.2,
                  }}
                >
                  {b.title}
                </h3>
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

      {/* Hypothetical use cases, not testimonials or customer evidence. */}
      <section
        className="bp-section"
        aria-labelledby="bp-examples-title"
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
              Educational examples
            </div>
            <h2
              id="bp-examples-title"
              style={{
                fontSize: "clamp(26px,3.2vw,44px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Ways a scenario workspace may be used.
            </h2>
          </div>

          <div
            className="gs-reveal bp-example-card"
            style={{
              background: dc.white,
              border: `1px solid ${dc.dark}15`,
              borderRadius: radius.md,
              padding: "4px 28px 8px",
            }}
          >
            {EXAMPLES.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 0",
                  borderBottom:
                    i < EXAMPLES.length - 1
                      ? `1px solid ${dc.dark}15`
                      : "none",
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: dc.rain,
                    letterSpacing: "-0.01em",
                    margin: "0 0 8px",
                  }}
                >
                  {t.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: dc.dark,
                    lineHeight: 1.6,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTAL CTA — action-forward, portal-focused ──────────────────── */}
      <section
        className="bp-section"
        aria-labelledby="bp-cta-title"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal bp-cta"
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
              Ready to model another DSCR scenario?
            </div>
            <h2
              id="bp-cta-title"
              style={{
                fontSize: "clamp(28px,3.6vw,50px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                color: dc.cream,
                margin: "0 0 14px",
              }}
            >
              Open the workspace.{" "}
              <br aria-hidden="true" />
              Organize a preliminary scenario.
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
              Review all assumptions and limitations before sharing any output.
              Program availability, rates, and terms vary, are not guaranteed, and
              remain subject to provider underwriting and transaction disclosures.
            </p>
          </div>

          <div
            className="bp-cta-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: "0 0 auto",
            }}
          >
            <a
              {...navigateLink("portal")}
              className="bp-link"
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
                textDecoration: "none",
              }}
            >
              Sign in to portal →
            </a>
            <a
              {...navigateLink("dscr-calculator")}
              className="bp-link"
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
                textDecoration: "none",
              }}
            >
              Run the DSCR calc
            </a>
          </div>
        </div>
      </section>
      </div>
    </DcShell>
  );
}
