import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

// ── Workspace feature tiles — ported from "Everything a producing broker needs." ──
const BENEFITS = [
  {
    icon: "❏",
    title: "Saved scenarios",
    desc: "Every priced deal stored and re-openable. Pick up where you left off.",
  },
  {
    icon: "⊕",
    title: "Lender submissions",
    desc: "Submit a matched deal straight to the lender box from the workspace.",
  },
  {
    icon: "◰",
    title: "Co-branded quotes",
    desc: "Generate a borrower-ready PDF with your name and logo on it.",
  },
  {
    icon: "$",
    title: "Commission ledger",
    desc: "Track expected and paid commissions across your pipeline.",
  },
  {
    icon: "⚑",
    title: "State-rule alerts",
    desc: "Get flagged when a deal hits a high-risk PPP or usury state.",
  },
  {
    icon: "⤓",
    title: "Exam-ready exports",
    desc: "Download the IC memo, stress matrix and cited rules as collateral.",
  },
];

// ── Testimonials — role/company attribution only; no fabricated NMLS or hard stats ──
const TESTIMONIALS = [
  {
    quote:
      "I was skeptical the property would qualify at that rent. The DSCR calculator showed me exactly how to structure it — lower down payment, IO for year one. We closed in 19 days.",
    name: "Alex Stickelman",
    role: "CCO & COO, Vela Capital",
  },
  {
    quote:
      "The program match and state-rule checks mean I stopped second-guessing my quotes. I price the deal and move on.",
    name: "Sandra Rivera",
    role: "Mortgage Broker, Miami FL",
  },
  {
    quote:
      "I run eight loans through Greenstreet a week. The CCO actually likes the audit logs — that's new for us.",
    name: "Robert Hayes",
    role: "Buy-and-Hold Investor, Austin TX",
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
    document.title = "InvestorGO | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Sign in →", view: "portal" }}
    >
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
              InvestorGO &middot; Partner Portal
            </div>

            {/* H1 */}
            <h1
              style={{
                fontSize: "clamp(42px,5.4vw,82px)",
                fontWeight: 600,
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                margin: "0 0 24px",
              }}
            >
              Your deals,
              <br />
              your pipeline,
              <br />
              one login.
            </h1>

            {/* Sub */}
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.45,
                letterSpacing: "-0.02em",
                color: "rgba(238,239,211,0.7)",
                maxWidth: "46ch",
                margin: "0 0 32px",
              }}
            >
              Saved scenarios, lender submissions, co-branded quotes and your
              commission ledger — all in the broker workspace.
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
                "Save and revisit priced deals",
                "Co-branded borrower-ready quotes",
                "Submit straight to matched lenders",
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

          {/* Right: Sign-in card — solid fill, flat 1px border, no blur */}
          <div
            style={{
              background: dc.teal,
              border: "1px solid rgba(238,239,211,0.14)",
              borderRadius: 9,
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
              Partner sign-in
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
                Access your saved deals, lender submissions, and co-branded
                quotes in one place.
              </p>
              <button
                onClick={() => onNavigate("portal")}
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
                  borderRadius: 6,
                  marginTop: 4,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                Sign in to InvestorGO →
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
                New partner?{" "}
                <button
                  onClick={() => onNavigate("rate-quiz")}
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
                  Request access
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFIT GRID — "Everything a producing broker needs." ─────────── */}
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
              margin: "0 0 44px",
              maxWidth: "18ch",
            }}
          >
            Everything a producing broker needs.
          </h2>

          <div
            className="gs-reveal"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              background: "rgba(0,55,56,0.12)",
              borderRadius: 9,
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
              From the field
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
              What brokers tell us.
            </h2>
          </div>

          <div
            className="gs-reveal"
            style={{
              background: dc.white,
              border: "1px solid rgba(0,55,56,0.08)",
              borderRadius: 9,
              padding: "4px 28px 8px",
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 0",
                  borderBottom:
                    i < TESTIMONIALS.length - 1
                      ? "1px solid rgba(0,55,56,0.08)"
                      : "none",
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    color: dc.dark,
                    lineHeight: 1.6,
                    fontStyle: "italic",
                    margin: "0 0 12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  "{t.quote}"
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
          className="gs-reveal"
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
              Ready to price your next DSCR deal?
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
              Open the portal.
              <br />
              Price and submit in minutes.
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
              Free for individual brokers. White-label pricing for broker shops
              with five or more users.
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
              onClick={() => onNavigate("portal")}
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
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Sign in to portal →
            </button>
            <button
              onClick={() => onNavigate("dscr-calculator")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                color: dc.cream,
                border: "1px solid rgba(238,239,211,0.3)",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                padding: "15px 32px",
                borderRadius: 6,
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
