import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";
import { radius } from "../theme";

// ── Workspace feature tiles — ported from "Everything a serious investor needs." ──
const BENEFITS = [
  {
    icon: "❏",
    title: "Saved scenarios",
    desc: "Every deal you price is stored and reopenable. No re-entering data when you come back to it.",
  },
  {
    icon: "⊕",
    title: "Submit to underwriting",
    desc: "Once your deal matches a program, send it straight to underwriting from the same screen — we are the lender. No copy-paste, no portal-hop.",
  },
  {
    icon: "◰",
    title: "Shareable deal summary",
    desc: "Generate a clean deal-summary PDF in 10 seconds — share it with a partner or keep it for your records.",
  },
  {
    icon: "$",
    title: "Portfolio tracker",
    desc: "Track every deal across your portfolio so nothing slips through.",
  },
  {
    icon: "⚑",
    title: "State-rule alerts",
    desc: "Automatically flagged when a deal hits a high-risk prepayment penalty (a fee some loans charge for early payoff or refi) or usury state — before the quote goes out.",
  },
  {
    icon: "⤓",
    title: "Export-ready deal package",
    desc: "Download the IC memo, stress matrix, and cited state rules as a single file — ready for lender review or borrower presentation.",
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
    role: "Real Estate Investor, Miami FL",
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
    document.title = "InvestGO | Greenstreet Finance";
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
              INVEST<span style={{ opacity: 0.5 }}>GO</span> &middot; Investor Workspace
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
              Your deals,
              <br />
              your pipeline,
              <br />
              one login.
            </h1>

            {/* Purpose line */}
            <div style={{ fontSize: 15, fontWeight: 500, color: dc.lemon, maxWidth: "46ch", margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
              InvestGO is your investor workspace where your priced deals live between sessions. Save a DSCR scenario, come back tomorrow, and Greenstreet underwrites and funds it in-house — all without re-entering data.
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
              Free for individual investors. Team pricing for funds and portfolios.
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
                "Shareable deal summaries",
                "Submit straight to underwriting",
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
                Access your saved deals, underwriting submissions, and deal summaries in one place.
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
                  borderRadius: radius.sm,
                  marginTop: 4,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                Sign in to INVEST<span style={{ opacity: 0.5 }}>GO</span> →
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
            Everything a serious investor needs.
          </h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(0,55,56,0.6)", margin: "0 0 36px", maxWidth: "52ch", lineHeight: 1.6 }}>
            The workspace sits on top of the same DSCR engine you already use — so every saved deal includes the full analysis, not just a rate.
          </p>

          <div
            className="gs-reveal"
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
              What investors tell us.
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
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 0",
                  borderBottom:
                    i < TESTIMONIALS.length - 1
                      ? `1px solid ${dc.dark}15`
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
              Free for individual investors. Team pricing for funds
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
                borderRadius: radius.sm,
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
                border: `1.5px solid ${dc.dark}50`,
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
