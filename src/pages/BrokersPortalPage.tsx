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

// ── Workflow steps — ported from existing page ────────────────────────────────
const WORKFLOW = [
  {
    step: "01",
    title: "Borrower calls with a deal",
    desc: "Address, list price, projected rent, FICO. Sometimes a signed lease. Usually not.",
  },
  {
    step: "02",
    title: "Open the portal, type 7 numbers",
    desc: "Price, loan amount, rent, rate, taxes, insurance, HOA. Solver runs in under a second.",
  },
  {
    step: "03",
    title: "Review program match + state rule",
    desc: "Best-fit Greenstreet programs with reasoning. State PPP auto-checked with no-PPP premium called out.",
  },
  {
    step: "04",
    title: "Send quote, get paid",
    desc: "Forward the IC memo or quote PDF. Most brokers close in 21–30 days, sometimes 14.",
  },
];

// ── What you get on Day 1 ─────────────────────────────────────────────────────
const DAY1 = [
  {
    num: "1",
    title: "DSCR Solver",
    desc: "Dual-track analysis. Track 1 is what gets the loan approved. Track 2 is what keeps the borrower from bleeding cash when vacancy hits.",
  },
  {
    num: "2",
    title: "Program Match Scoring",
    desc: "Your file scored against each Greenstreet program with the three reasons and two concerns spelled out. No more guessing which program to apply for.",
  },
  {
    num: "3",
    title: "State PPP Database",
    desc: "50-state prepayment penalty rules with statutory references. MN, NJ, NY, OH, PA, TX edge cases all flagged.",
  },
  {
    num: "4",
    title: "Sensitivity + Tornado",
    desc: "What if rent drops 10%? What if value drops 10%? What if rates jump 100bps? See which levers matter most.",
  },
  {
    num: "5",
    title: "Structure Optimizer",
    desc: "IO vs 30yr P&I vs 40yr amortization vs ARM. The engine ranks structures by Track 1 DSCR and projected monthly savings.",
  },
  {
    num: "6",
    title: "IC Memo Export",
    desc: "Generate a credit-committee-ready memo in 30 seconds. Includes return stack, lender ranking, and assumption disclosure.",
  },
];

// ── Testimonials — preserved from existing page; role/company framing retained ──
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

// ── Reusable button (no CSS class needed — self-contained inline) ─────────────
function Btn({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost";
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        background: isPrimary ? dc.lemon : "transparent",
        color: isPrimary ? dc.dark : dc.cream,
        border: isPrimary ? "none" : "1px solid rgba(238,239,211,0.3)",
        fontWeight: 600,
        fontSize: 16,
        cursor: "pointer",
        padding: "15px 30px",
        borderRadius: 6,
        fontFamily: dc.sans,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BrokersPortalPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Broker Portal | Greenstreet Finance";
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
      {/* ── HERO ── solid dark, two-column, left content + right sign-in card ─── */}
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
          {/* Left: Hero content */}
          <div id="gs-hero-content">
            {/* Eyebrow */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 22,
              }}
            >
              Partner Portal
            </div>

            {/* H1 */}
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
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
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
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
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 20,
              }}
            >
              Partner sign-in
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                className="gs-num"
                type="email"
                placeholder="you@brokerage.com"
                style={{
                  width: "100%",
                  background: dc.dark,
                  color: dc.cream,
                  border: "1px solid rgba(238,239,211,0.18)",
                  borderRadius: 6,
                  padding: "13px 14px",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: dc.sans,
                }}
              />
              <input
                className="gs-num"
                type="password"
                placeholder="Password"
                style={{
                  width: "100%",
                  background: dc.dark,
                  color: dc.cream,
                  border: "1px solid rgba(238,239,211,0.18)",
                  borderRadius: 6,
                  padding: "13px 14px",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: dc.sans,
                }}
              />
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
                Sign in →
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

      {/* ── EVERYTHING A PRODUCING BROKER NEEDS ── 3-col benefit grid ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 44 }}>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                margin: 0,
                maxWidth: "18ch",
              }}
            >
              Everything a producing broker needs.
            </h2>
          </div>

          <div
            className="gs-reveal dc-band-3"
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

      {/* ── WHAT YOU GET ON DAY 1 ── tools grid ─────────────────────────────── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(48px,6vw,80px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 40 }}>
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
              Day 1 toolkit
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
              What you get on day one.
            </h2>
          </div>

          <div
            className="gs-reveal dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {DAY1.map((f) => (
              <div
                key={f.title}
                style={{
                  background: dc.white,
                  border: "1px solid rgba(0,55,56,0.08)",
                  borderRadius: 8,
                  padding: "24px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <Mono
                  style={{
                    display: "inline-flex",
                    width: 32,
                    height: 32,
                    background: dc.rain,
                    color: dc.cream,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {f.num}
                </Mono>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: dc.dark,
                    lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {f.title}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(0,55,56,0.6)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE WORKFLOW ── 4-step horizontal band ───────────────────────────── */}
      <section
        style={{
          background: dc.cream,
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
              How it works
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
              From deal call to quote — four steps.
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0,
              }}
            >
              {WORKFLOW.map((s, i) => (
                <div
                  key={s.step}
                  style={{
                    padding: "28px 20px 28px 0",
                    borderRight:
                      i < WORKFLOW.length - 1
                        ? "1px solid rgba(0,55,56,0.08)"
                        : "none",
                    paddingLeft: i > 0 ? 20 : 0,
                  }}
                >
                  <Mono
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: dc.rain,
                      letterSpacing: "0.08em",
                      marginBottom: 8,
                    }}
                  >
                    STEP {s.step}
                  </Mono>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: dc.dark,
                      marginBottom: 6,
                      lineHeight: 1.3,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.title}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(0,55,56,0.6)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — role/company attribution, no fabricated NMLS ─────── */}
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

      {/* ── CTA STRIP ── */}
      <section
        style={{
          background: dc.dark,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              color: dc.lemon,
              marginBottom: 16,
            }}
          >
            Ready to price your next DSCR deal?
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,52px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: dc.cream,
              margin: "0 0 16px",
            }}
          >
            Open the portal.
            <br />
            Price and submit in minutes.
          </h2>
          <p
            style={{
              fontSize: "clamp(15px,1.3vw,18px)",
              fontWeight: 500,
              lineHeight: 1.55,
              color: "rgba(238,239,211,0.65)",
              maxWidth: "46ch",
              margin: "0 auto 36px",
              letterSpacing: "-0.01em",
            }}
          >
            Free for individual brokers. White-label pricing for broker shops
            with 5 or more users.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Btn onClick={() => onNavigate("portal")}>
              Sign in to portal →
            </Btn>
            <Btn onClick={() => onNavigate("dscr-calculator")} variant="ghost">
              Run the DSCR calc
            </Btn>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
