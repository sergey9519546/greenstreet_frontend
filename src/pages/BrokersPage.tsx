import React, { useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";

// ── Use-case rows — numbered vertical list (signature section) ────────────────
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
    desc: "Enter the property address, rent, rate and costs. Get DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger) on both tracks: Track 1 is what the lender uses to qualify you; Track 2 adds vacancy, management fees and CapEx to show what you'll actually pocket. No login, no guesswork.",
    cta: "See if my deal qualifies",
    view: "dscr-calculator",
    numBg: dc.lemon,
    numInk: dc.dark,
  },
  {
    num: "02",
    title: "Match the right Greenstreet program before your first call",
    desc: "Your file is scored against every Greenstreet DSCR program: FICO floors, LTV caps (how the loan amount compares to the property value — lower = more equity = better terms), DSCR minimums, state coverage and entity rules — ranked by fit score. Know which program funds your deal before you make an offer.",
    cta: "Find the best program for my file",
    view: "products",
    numBg: dc.dark,
    numInk: dc.lemon,
  },
  {
    num: "03",
    title: "Check the state rule before it kills the deal",
    desc: "Prepayment-penalty fees (a fee some loans charge if you pay the loan off or refinance early), usury caps and short-term-rental rules for all 50 states — each traced to a statutory citation. Know if a deal is clean in NJ or needs restructuring before you make an offer.",
    cta: "Look up state rules for my deal",
    view: "state-laws",
    numBg: dc.lemon,
    numInk: dc.dark,
  },
  {
    num: "04",
    title: "Stress-test the rate and the rent",
    desc: "A 120-cell rate × rent shock grid shows you exactly how far the deal can bend before DSCR breaks below 1.00. Run it in seconds — then keep it as a defensible page in your deal package.",
    cta: "Run the stress matrix",
    view: "stress-matrix",
    numBg: dc.dark,
    numInk: dc.lemon,
  },
  {
    num: "05",
    title: "Hand the lender everything they need to say yes",
    desc: "The investment-committee memo, the state compliance check, and the stress matrix — all generated in one pass, all citable. Submit a clean package and close faster, because the lender isn't waiting on missing documents.",
    cta: "Build the deal package",
    view: "deal-analyzer",
    numBg: dc.lemon,
    numInk: dc.dark,
  },
];

const AS_OF = "Aug 2, 2026";
// Next-review date is computed from AS_OF (mirrors FAQPage.tsx) so the promise
// can't silently lapse into the past the way a fixed date does — bump AS_OF
// and this follows automatically.
const REVIEW_CADENCE_DAYS = 30;
function reviewDateAfter(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
const NEXT_REVIEW = reviewDateAfter(AS_OF, REVIEW_CADENCE_DAYS);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BrokersPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "For Investors | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
      accent={dc.dark}
    >
      {/* ── HERO: 2-col — content left, product panel right ────────────────── */}
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
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
              }}
            >
              For Investors
            </div>
            <H1 style={{ margin: 0 }}>
              One deal.
              <br />
              We underwrite
              <br />
              your deal.
            </H1>
            <Lead
              style={{
                color: "rgba(238,239,211,0.72)",
                margin: 0,
                maxWidth: "38ch",
              }}
            >
              Greenstreet originates direct to you. Five tools price, qualify,
              and stress-test your DSCR rental deal — no income docs, no income
              tax returns, no middleman. Price a deal in under 60 seconds; we
              underwrite in-house and fund through our wholesale lending partner,
              Cake.
            </Lead>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn
                label="Price my first deal →"
                onClick={() => onNavigate("dscr-calculator")}
              />
              <button
                onClick={() => onNavigate("rate-quiz")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  color: "rgba(238,239,211,0.82)",
                  fontWeight: 600,
                  fontSize: 15,
                  border: `1.5px solid ${dc.faded}`,
                  cursor: "pointer",
                  padding: "13px 22px",
                  borderRadius: dc.r.md,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                  minHeight: 44,
                }}
              >
                See my rate in 5 questions →
              </button>
            </div>
          </div>

          {/* Right column — Greenstreet DSCR programs panel */}
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
                  { label: "Portfolio / Blanket", spec: "multi-door notes" },
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
                In-house underwriting · direct
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

      {/* ── USE-CASE LIST: vertical rail + numbered rows (centrepiece) ────────── */}
      {/*   This is the Brokers page signature — not shared with any other page.  */}
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
                margin: "0 0 14px",
                maxWidth: "18ch",
                color: dc.dark,
              }}
            >
              Five steps from first look to funded file.
            </h2>
            <p
              style={{
                fontSize: "clamp(16px,1.25vw,19px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(0,55,56,0.62)",
                margin: 0,
                maxWidth: "54ch",
                letterSpacing: "-0.01em",
              }}
            >
              DSCR loans qualify on rental income, not the borrower's pay stubs (business-purpose / non-owner-occupied — a rental you invest in, not a home you live in). These tools handle every step of that process.
            </p>
          </div>

          {/* Numbered list with continuous left-rail */}
          <div style={{ position: "relative" }}>
            {/* Vertical rail line — runs full height behind all bubbles */}
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
                {/* Numbered bubble — sits over the rail, alternating lemon/dark */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: u.numBg,
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

                {/* Row content */}
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

      {/* ── BROKER CTA STRIP ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal dc-band-2"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "clamp(32px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div>
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
              Direct · in-house underwriting
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
              Ready to submit your next deal?
            </h2>
            <p
              style={{
                fontSize: "clamp(15px,1.3vw,18px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(238,239,211,0.6)",
                maxWidth: "50ch",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Book a 15-minute walkthrough — we'll run a real file through the
              Greenstreet engine together, from pricing to submission, so you see
              exactly what you will see before you fund.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
            {/* ONE dominant lemon primary CTA per contract */}
            <button
              onClick={() => onNavigate("rate-quiz")}
              style={{
                background: dc.lemon,
                color: dc.dark,
                border: "none",
                borderRadius: dc.r.md,
                padding: "16px 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                textAlign: "left" as const,
                minHeight: 44,
              }}
            >
              See my rate in 5 questions →
            </button>
            {/* Secondary: transparent + FADED border, per contract */}
            <button
              onClick={() => onNavigate("rate-quiz")}
              style={{
                background: "transparent",
                color: dc.cream,
                border: `1.5px solid ${dc.faded}`,
                borderRadius: dc.r.md,
                padding: "15px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                textAlign: "left" as const,
                minHeight: 44,
              }}
            >
              Get a rate in 5 questions →
            </button>
          </div>
        </div>
      </section>

      {/* ── CLOSE BAND: freshness + back nav — mintBg breaks the cream/dark rhythm ── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(40px,5vw,64px) ${dc.pad}`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          {/* Freshness signal — intentional trust element, not decorative */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                padding: "5px 11px",
                borderRadius: dc.r.pill,
                background: dc.lemon,
                color: dc.dark,
              }}
            >
              Reviewed
            </span>
            <span style={{ fontSize: 13, color: dc.dark, fontWeight: 600 }}>
              Page refreshed {AS_OF} · program lineup + fees reviewed · next review {NEXT_REVIEW}
            </span>
          </div>

          {/* Back nav */}
          <button
            onClick={() => onBack()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: "transparent",
              border: `1.5px solid ${dc.faded}`,
              borderRadius: dc.r.pill,
              padding: "13px 24px",
              cursor: "pointer",
              fontFamily: dc.sans,
              minHeight: 44,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: dc.dark,
              }}
            >
              ← All tools
            </span>
          </button>
        </div>
      </section>
    </DcShell>
  );
}
