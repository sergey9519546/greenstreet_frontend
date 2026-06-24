import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

// ── Use-case rows — numbered vertical list ────────────────────────────────────
interface UseCase {
  num: string;
  title: string;
  desc: string;
  cta: string;
  view: string;
  numBg: string;
  numInk: string;
}

const USECASES: UseCase[] = [
  {
    num: "01",
    title: "Price the deal in under a minute",
    desc: "Enter the property address, rent, rate and costs. Get DSCR, Track 1 and Track 2 analysis, cash-on-cash return and break-even — no login, no guesswork.",
    cta: "Open the calculator",
    view: "dscr-calculator",
    numBg: dc.lemon,
    numInk: dc.dark,
  },
  {
    num: "02",
    title: "Match the best-fit Greenstreet program for every file",
    desc: "Your deal is scored against Greenstreet DSCR program boxes — FICO floors, LTV caps, DSCR minimums, state coverage and entity rules — ranked by fit before you make a single call.",
    cta: "Open Lender Intel",
    view: "lender-intel",
    numBg: dc.dark,
    numInk: dc.lemon,
  },
  {
    num: "03",
    title: "Know the state rule before it bites",
    desc: "Prepayment-penalty, usury and STR rules for all 50 states, each traced to a statutory citation. Know if a deal is clean in NJ or needs restructuring before you quote.",
    cta: "Open State Rules",
    view: "state-laws",
    numBg: dc.lemon,
    numInk: dc.dark,
  },
  {
    num: "04",
    title: "Stress-test the rate and the rent",
    desc: "A 120-cell rate × rent shock matrix across five risk zones — run it in seconds to show the borrower how far the deal bends before it breaks.",
    cta: "Open the calculator",
    view: "dscr-calculator",
    numBg: dc.dark,
    numInk: dc.lemon,
  },
  {
    num: "05",
    title: "Submit clean. Close fast.",
    desc: "The IC memo, the state rule and the stress matrix — all defensible, all citable. Hand the lender the package they need to say yes the first time.",
    cta: "Run a deal",
    view: "dscr-calculator",
    numBg: dc.lemon,
    numInk: dc.dark,
  },
];

// ── Economics strip ───────────────────────────────────────────────────────────
const ECONOMICS = [
  {
    label: "Typical Origination",
    val: "1.0–2.0%",
    note: "Of loan amount at close",
    src: "Industry convention · lender published",
  },
  {
    label: "YSP on Rate",
    val: "0.50–1.50%",
    note: "Rate buyup / premium pricing",
    src: "Reg Z §1026.36(d) · broker comp rules",
  },
  {
    label: "Avg Loan Size",
    val: "$350K",
    note: "SFR purchase, 25% down",
    src: "Greenstreet engine · Apr 2026 deal sample",
  },
];

const AS_OF = "Jun 22, 2026";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BrokersPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "For Brokers | Greenstreet Finance";
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
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      {/*   2-col: copy left, solid branded panel right. No glassmorphism.       */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
        }}
      >
        <div
          id="gs-hero-content"
          className="dc-hero"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            padding: `clamp(56px,7vh,96px) ${dc.pad}`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
            minHeight: "clamp(440px,56vh,700px)",
          }}
        >
          {/* Left column — copy */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "clamp(18px,2.5vw,32px)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
              }}
            >
              For Brokers
            </div>
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              Quote with
              <br />
              confidence.
            </h1>
            <p
              style={{
                fontSize: "clamp(18px,1.6vw,24px)",
                fontWeight: 500,
                lineHeight: 1.4,
                letterSpacing: "-0.025em",
                color: "rgba(238,239,211,0.72)",
                margin: 0,
                maxWidth: "38ch",
              }}
            >
              Non-QM wholesale for mortgage professionals who are tired of
              chasing lender portals. Price, match and stress-test a DSCR deal
              in under a minute — then walk into the call knowing the answer.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button
                onClick={() => onNavigate("dscr-calculator")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 600,
                  fontSize: 16,
                  border: "none",
                  cursor: "pointer",
                  padding: "15px 30px",
                  borderRadius: 6,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                Open the calculator →
              </button>
              <button
                onClick={() => onNavigate("lender-intel")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 16,
                  border: "1px solid rgba(238,239,211,0.3)",
                  cursor: "pointer",
                  padding: "15px 26px",
                  borderRadius: 6,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                See programs
              </button>
            </div>
          </div>

          {/* Right column — solid branded panel (no glassmorphism, no glow) */}
          <div
            style={{
              height: "clamp(280px,40vh,520px)",
              borderRadius: 12,
              overflow: "hidden",
              background: dc.teal,
              border: "1px solid rgba(238,239,211,0.12)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "clamp(28px,3.5vw,44px)",
            }}
          >
            {/* Header row */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: dc.lemon,
                  marginBottom: 16,
                }}
              >
                Greenstreet DSCR programs
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[
                  { label: "1–4 Unit Standard", spec: "≥1.00x DSCR" },
                  { label: "Portfolio / Blanket", spec: "to $25M" },
                  { label: "Foreign National", spec: "30%+ down" },
                  { label: "STR / Airbnb", spec: "ADR × occ" },
                  { label: "Sub-1.0", spec: "≥0.75x DSCR" },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: "1px solid rgba(238,239,211,0.10)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: dc.cream,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {row.label}
                    </span>
                    <Mono
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: dc.emerald,
                      }}
                    >
                      {row.spec}
                    </Mono>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer row */}
            <div
              style={{
                paddingTop: 16,
                borderTop: "1px solid rgba(238,239,211,0.10)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(238,239,211,0.5)",
                  letterSpacing: "-0.01em",
                }}
              >
                In-house underwriting · wholesale
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  color: dc.lemon,
                  padding: "4px 10px",
                  border: "1px solid rgba(216,217,88,0.4)",
                  borderRadius: 4,
                }}
              >
                Live programs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── USECASE LIST: numbered vertical rows ─────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad} clamp(40px,5vw,64px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: "clamp(40px,5vw,64px)" }}>
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

          {/* Vertical list with left-rail line */}
          <div style={{ position: "relative" }}>
            {/* Vertical rail */}
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(0,55,56,0.15)",
              }}
            />
            {USECASES.map((u) => (
              <div
                key={u.num}
                className="gs-reveal"
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: "clamp(20px,3vw,48px)",
                  alignItems: "start",
                  paddingBottom: "clamp(36px,4vw,56px)",
                }}
              >
                {/* Number bubble */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: u.numBg,
                    border: "1px solid rgba(0,55,56,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mono
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: u.numInk,
                    }}
                  >
                    {u.num}
                  </Mono>
                </div>

                {/* Content */}
                <div style={{ paddingTop: 10 }}>
                  <h3
                    style={{
                      fontSize: "clamp(21px,2.2vw,30px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      margin: "0 0 12px",
                      color: dc.dark,
                      lineHeight: 1.1,
                    }}
                  >
                    {u.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "clamp(16px,1.35vw,19px)",
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color: "rgba(0,55,56,0.65)",
                      margin: "0 0 16px",
                      maxWidth: "58ch",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {u.desc}
                  </p>
                  <button
                    onClick={() => onNavigate(u.view)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontSize: 15,
                      fontWeight: 600,
                      color: dc.rain,
                      letterSpacing: "-0.01em",
                      fontFamily: dc.sans,
                    }}
                  >
                    {u.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECONOMICS STRIP ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal"
          style={{ maxWidth: dc.maxW, margin: "0 auto" }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              color: dc.lemon,
              marginBottom: 12,
            }}
          >
            Broker economics
          </div>
          <h2
            style={{
              fontSize: "clamp(26px,3.2vw,44px)",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              color: dc.cream,
              margin: "0 0 clamp(36px,4vw,56px)",
            }}
          >
            What you earn on a funded deal.
          </h2>

          <div
            className="dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1,
              background: "rgba(238,239,211,0.10)",
              borderRadius: 9,
              overflow: "hidden",
            }}
          >
            {ECONOMICS.map((e) => (
              <div
                key={e.label}
                style={{
                  background: dc.dark,
                  padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
                  textAlign: "center",
                }}
              >
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4.5vw,60px)",
                    fontWeight: 600,
                    color: dc.lemon,
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {e.val}
                </Mono>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: dc.cream,
                    marginBottom: 4,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {e.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(238,239,211,0.5)",
                    marginBottom: 14,
                  }}
                >
                  {e.note}
                </div>
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: "1px solid rgba(238,239,211,0.10)",
                    fontSize: 10,
                    fontFamily: dc.mono,
                    color: dc.emerald,
                    letterSpacing: "0.02em",
                  }}
                >
                  src · {e.src}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS: 4-step how a deal moves ─────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
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
              How a deal moves
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
              From file to funded — and you own the relationship.
            </h2>
          </div>

          <div
            className="gs-reveal"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              maxWidth: 760,
            }}
          >
            {[
              {
                n: "01",
                title: "Send us the file",
                body: "Property address, purchase price, rent, borrower FICO. That's it. We pre-screen against every Greenstreet program and come back with a full structure — rate, LTV, reserves, PPP options — within 24 hours.",
                bg: dc.cream,
                numColor: dc.lemon,
                numBg: dc.dark,
              },
              {
                n: "02",
                title: "We place it, you review it",
                body: "We find the best-fit Greenstreet program for your deal — rate, LTV, reserves, and PPP structure. You get one clean submission with real numbers — not a menu of maybes.",
                bg: dc.dark,
                numColor: dc.dark,
                numBg: dc.lemon,
              },
              {
                n: "03",
                title: "You own the relationship",
                body: "We process in the background. You stay in front of the borrower. Your yield spread, your repeat client, your referral pipeline. We don't touch your relationship — ever.",
                bg: dc.cream,
                numColor: dc.lemon,
                numBg: dc.dark,
              },
              {
                n: "04",
                title: "Close in 14–30 days",
                body: "DSCR moves faster than conventional because there are no income docs, no employment calls, no bank statement underwriting. Appraisal + title + credit. Greenstreet closes clean files in 14–21 days; complex ones in 21–30.",
                bg: dc.lemon,
                numColor: dc.dark,
                numBg: dc.dark,
              },
            ].map((step, i) => (
              <div
                key={step.n}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr",
                  gap: 24,
                  alignItems: "start",
                  padding: "clamp(24px,3vw,36px) clamp(22px,3vw,32px)",
                  background: step.bg,
                  borderRadius: i === 0 ? "9px 9px 0 0" : i === 3 ? "0 0 9px 9px" : 0,
                  border: "1px solid rgba(0,55,56,0.08)",
                  borderTop: i > 0 ? "none" : "1px solid rgba(0,55,56,0.08)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: step.numBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                >
                  <Mono
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: step.numColor,
                    }}
                  >
                    {step.n}
                  </Mono>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "clamp(17px,1.8vw,22px)",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                      color: step.bg === dc.dark ? dc.cream : dc.dark,
                      marginBottom: 8,
                      lineHeight: 1.1,
                    }}
                  >
                    {step.title}
                  </div>
                  <p
                    style={{
                      fontSize: "clamp(14px,1.2vw,16px)",
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color:
                        step.bg === dc.dark
                          ? "rgba(238,239,211,0.65)"
                          : step.bg === dc.lemon
                          ? "rgba(0,55,56,0.75)"
                          : "rgba(0,55,56,0.65)",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────────────────────── */}
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
            Have a deal ready?
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
            Send us the file.
            <br />
            Get a full structure back.
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
            Address, rent, and FICO. We pre-screen same day and come back with a
            complete structure — rate, LTV, reserves, prepay options.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
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
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                padding: "15px 30px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Submit a deal →
            </button>
            <button
              onClick={() => onNavigate("dscr-calculator")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                color: dc.cream,
                fontWeight: 600,
                fontSize: 16,
                border: "1px solid rgba(238,239,211,0.3)",
                cursor: "pointer",
                padding: "15px 26px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Price it first
            </button>
          </div>
        </div>
      </section>

      {/* ── BACK PILL ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `0 ${dc.pad} clamp(72px,10vh,120px)`,
          paddingTop: "clamp(48px,6vh,72px)",
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => onBack()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: dc.mintBg,
              border: "none",
              borderRadius: 999,
              padding: "15px 30px",
              cursor: "pointer",
              fontFamily: dc.sans,
            }}
          >
            <span
              style={{
                fontSize: "clamp(16px,1.4vw,19px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: dc.dark,
              }}
            >
              Back to all tools
            </span>
            <span style={{ fontSize: 18, color: dc.rain }}>→</span>
          </button>
        </div>
      </section>

      {/* ── FRESHNESS SIGNAL ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `0 ${dc.pad} clamp(36px,4vh,48px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              padding: "14px 18px",
              background: "rgba(216,217,88,0.12)",
              borderRadius: 10,
              border: "1px solid rgba(216,217,88,0.3)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                padding: "4px 10px",
                borderRadius: 999,
                background: dc.lemon,
                color: dc.dark,
              }}
            >
              Reviewed
            </span>
            <span
              style={{ fontSize: 13, color: dc.dark, fontWeight: 600 }}
            >
              Page refreshed {AS_OF} · program lineup + fees reviewed · next
              review Jul 22, 2026
            </span>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
