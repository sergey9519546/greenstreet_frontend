import React, { useEffect, useState } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";

// ── Six borrower archetypes (preserved from existing page + mockup data) ──────
interface Profile {
  num: string;
  name: string;
  tagline: string;
  // Card face colours (solid fills, no blur/glass)
  bg: string;
  ink: string;
  body: string;
  accent: string;
  // Back-face matched program
  program: string;
  rate: string;
  specs: { k: string; v: string }[];
  // CTA routes to an internal view
  view: string;
}

const PROFILES: Profile[] = [
  {
    num: "01",
    name: "The First-Timer",
    tagline:
      "One rental, owner-savvy but new to DSCR. Wants a clean, no-income-doc close.",
    bg: dc.mintBg,
    ink: dc.dark,
    body: "rgba(0,55,56,0.62)",
    accent: dc.rain,
    program: "DSCR 1-4 Standard",
    rate: "6.75–7.25%",
    specs: [
      { k: "FICO", v: "660+" },
      { k: "LTV", v: "≤80%" },
      { k: "DSCR", v: "≥1.00x" },
    ],
    view: "dscr-calculator",
  },
  {
    num: "02",
    name: "The Portfolio Operator",
    tagline:
      "40 doors and counting. Needs blanket lines and one underwriting relationship.",
    bg: dc.dark,
    ink: dc.cream,
    body: "rgba(238,239,211,0.65)",
    accent: dc.lemon,
    program: "DSCR Portfolio / Blanket",
    rate: "6.99–7.50%",
    specs: [
      { k: "Loan", v: "to $25M" },
      { k: "LTV", v: "≤75%" },
      { k: "DSCR", v: "≥1.25x" },
    ],
    view: "lender-intel",
  },
  {
    num: "03",
    name: "The Foreign National",
    tagline:
      "Overseas investor, no US credit file. Buying US rentals through an LLC.",
    bg: dc.rain,
    ink: dc.cream,
    body: "rgba(238,239,211,0.7)",
    accent: dc.lemon,
    program: "DSCR Global",
    rate: "7.50–8.25%",
    specs: [
      { k: "Down", v: "30%+" },
      { k: "Credit", v: "Alt / passport" },
      { k: "DSCR", v: "≥1.00x" },
    ],
    view: "lender-intel",
  },
  {
    num: "04",
    name: "The STR Host",
    tagline:
      "Short-term rental in a seasonal market. Income swings month to month.",
    bg: dc.lemon,
    ink: dc.dark,
    body: "rgba(0,55,56,0.65)",
    accent: dc.rain,
    program: "DSCR — STR",
    rate: "7.10–7.75%",
    specs: [
      { k: "Qualifying", v: "1007 rent floor" },
      { k: "Haircut", v: "75% on history" },
      { k: "LTV", v: "≤75%" },
    ],
    view: "state-laws",
  },
  {
    num: "05",
    name: "The Thin-Margin Deal",
    tagline:
      "Great property, but rent barely covers PITIA. Sub-1.0 DSCR.",
    bg: dc.mintBg,
    ink: dc.dark,
    body: "rgba(0,55,56,0.62)",
    accent: dc.rain,
    program: "DSCR Sub-1.0",
    rate: "7.25–8.00%",
    specs: [
      { k: "DSCR", v: "≥0.75x" },
      { k: "FICO", v: "680+" },
      { k: "LTV", v: "≤70%" },
    ],
    view: "dscr-calculator",
  },
  {
    num: "06",
    name: "The Refi Candidate",
    tagline:
      "Bought high last year. Rates dropped — when does refinancing pay off?",
    bg: dc.teal,
    ink: dc.cream,
    body: "rgba(238,239,211,0.65)",
    accent: dc.emerald,
    program: "DSCR Rate-Term / Cash-Out",
    rate: "6.50–7.25%",
    specs: [
      { k: "Seasoning", v: "6 mo (R/T) · 12 mo (C/O)" },
      { k: "Cash-out", v: "≤75% LTV" },
      { k: "Rate-term", v: "≤80% LTV" },
    ],
    view: "dscr-calculator",
  },
];

// ── Flip card (CSS-only, no animation beyond the hover transform) ─────────────
// Solid fills, flat 1px borders — no blur, no glow, no radial gradients.
const FLIP_CSS = `
.bp-flip { perspective: 1200px; cursor: pointer; }
.bp-inner { position: relative; transition: transform .55s cubic-bezier(.2,.7,.2,1); transform-style: preserve-3d; }
.bp-flip:hover .bp-inner, .bp-flip:focus-within .bp-inner { transform: rotateY(180deg); }
.bp-face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 12px; overflow: hidden; }
.bp-back { transform: rotateY(180deg); }
@media (prefers-reduced-motion: reduce) {
  .bp-inner { transition: none !important; }
  .bp-flip:hover .bp-inner, .bp-flip:focus-within .bp-inner { transform: none !important; }
}
@media (max-width: 900px) {
  .bp-grid { grid-template-columns: 1fr !important; }
  .bp-flip { height: 380px !important; }
}
`;

function ProfileCard({
  p,
  onNavigate,
}: {
  p: Profile;
  onNavigate: (v: string) => void;
}) {
  return (
    <div
      className="bp-flip gs-reveal"
      style={{ height: "clamp(360px,28vw,420px)" }}
      tabIndex={0}
      role="article"
      aria-label={p.name}
    >
      <div className="bp-inner" style={{ height: "100%" }}>
        {/* ── Front ── */}
        <div
          className="bp-face"
          style={{
            background: p.bg,
            border: `1px solid ${dc.faded}`,
            padding: "clamp(24px,2.4vw,32px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Mono
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: p.accent,
                marginBottom: 18,
              }}
            >
              {p.num}
            </Mono>
            <div
              style={{
                fontSize: "clamp(22px,2.4vw,28px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: p.ink,
                lineHeight: 1.05,
                marginBottom: 12,
              }}
            >
              {p.name}
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5,
                color: p.body,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {p.tagline}
            </p>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: p.accent,
              letterSpacing: "-0.01em",
            }}
          >
            Hover or tap to see the matched program →
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className="bp-face bp-back"
          style={{
            background: dc.dark,
            border: `1px solid rgba(238,239,211,0.12)`,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: dc.cream,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 10,
              }}
            >
              Matched program
            </div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 6,
                color: dc.cream,
              }}
            >
              {p.program}
            </div>
            <Mono
              style={{
                display: "block",
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: dc.lemon,
                marginBottom: 16,
              }}
            >
              {p.rate}
            </Mono>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 7 }}
            >
              {p.specs.map((sp) => (
                <div
                  key={sp.k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    borderBottom: "1px solid rgba(238,239,211,0.10)",
                    paddingBottom: 6,
                  }}
                >
                  <span
                    style={{
                      color: "rgba(238,239,211,0.6)",
                      fontWeight: 500,
                    }}
                  >
                    {sp.k}
                  </span>
                  <Mono style={{ fontSize: 13, fontWeight: 600, color: dc.cream }}>
                    {sp.v}
                  </Mono>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => onNavigate(p.view)}
              style={{
                background: dc.lemon,
                border: "none",
                padding: "10px 18px",
                cursor: "pointer",
                textAlign: "left" as const,
                fontSize: 13,
                fontWeight: 700,
                color: dc.dark,
                letterSpacing: "-0.01em",
                fontFamily: dc.sans,
                borderRadius: 6,
              }}
            >
              Price this scenario →
            </button>
            <button
              onClick={() => (window as any).openQualify?.()}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left" as const,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(238,239,211,0.55)",
                letterSpacing: "-0.01em",
                fontFamily: dc.sans,
              }}
            >
              Get a preliminary estimate →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Checklist items preserved from existing page ──────────────────────────────
const DOCS = [
  {
    doc: "Purchase contract (or refinance authorization)",
    note: "Fully executed. Wholesaler assignments need the assignment addendum too.",
  },
  {
    doc: "1007 / 1025 appraisal with rent schedule",
    note: "Self-employed rental income needs the 1007. Most lenders won't accept the lease alone.",
  },
  {
    doc: "12 months bank statements (all pages)",
    note: "Liquid reserves post-closing — standard DSCR requirement is 12 months of statements. Retirement accounts count at 70% if 59½+; crypto is $0.",
  },
  {
    doc: "Credit report (tri-merge)",
    note: "Pulled within 90 days of close. Most lenders ignore medical collections but flag recent lates.",
  },
  {
    doc: "Entity documents (LLC / Corp / Trust)",
    note: "All owners ≥51% must be on the loan. Max 4 owners in the borrowing entity.",
  },
  {
    doc: "Insurance binder (hazard + liability)",
    note: "Lender needs to be shown as 'loss payee' for hazard. STR needs commercial liability.",
  },
];

const MISTAKES = [
  {
    mistake: "Not vesting in an LLC",
    fix: "Most lenders require entity vesting. Going individual adds 25–50bps and may disqualify you from business-purpose loans.",
  },
  {
    mistake: "Rate-shopping across multiple lenders over weeks",
    fix: "Multiple mortgage inquiries within a 14-day window count as a single pull under FICO scoring. Submit all rate requests in that window — don't let comparisons stretch across months.",
  },
  {
    mistake: "Funding the down payment from a gift",
    fix: "Some lenders accept gift funds with a 2-year seasoned donor letter. Cash-out proceeds from another property are usually cleaner.",
  },
  {
    mistake: "Skipping the LLC operating agreement update",
    fix: "Outdated operating agreements flag underwriter review. Add a 'real estate' purpose clause.",
  },
  {
    mistake: "Closing mid-month",
    fix: "Per-diem interest from the 25th to month-end can cost $300–500. Aim for the 1st–5th.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BorrowerProfilesPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Borrower Profiles | Greenstreet Finance";
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
      cta={{ label: "Find your fit →", view: "dscr-calculator" }}
    >
      <style>{FLIP_CSS}</style>

      {/* ── HERO ── mint bg, dark ink — matches mockup exactly; no HeroProof, no CTA buttons ── */}
      <section
        style={{
          background: dc.mintBg,
          color: dc.dark,
          overflow: "hidden",
          padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`,
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(0,55,56,0.5)",
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            Who we serve
          </div>
          <H1 style={{ margin: "0 0 20px", maxWidth: "20ch" }}>
            Find yourself in one of these six borrower types.
          </H1>
          <Lead
            style={{
              color: "rgba(0,55,56,0.65)",
              maxWidth: "54ch",
              margin: "0 0 16px",
            }}
          >
            DSCR loans (where the property's rent, not your income, determines whether you qualify) fit a wide range of investors. Pick the profile that sounds most like you to see the matching program, rate range, and requirements.
          </Lead>
          <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,55,56,0.45)", margin: 0, letterSpacing: "-0.01em" }}>
            Hover or tap any card to see the program details.
          </p>
        </div>
      </section>

      {/* ── PROFILE CARDS GRID ── 3-col flip-card grid; centerpiece of the page ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,80px) ${dc.pad} clamp(72px,10vh,120px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="bp-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {PROFILES.map((p) => (
              <ProfileCard key={p.num} p={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOUR LENDER NEEDS ── */}
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
              Pre-close checklist
            </div>
            <h2
              style={{
                fontSize: "clamp(26px,3.2vw,44px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              What your lender needs from you.
            </h2>
            <p style={{ fontSize: "clamp(15px,1.25vw,17px)", fontWeight: 500, color: "rgba(0,55,56,0.62)", margin: 0, lineHeight: 1.6, maxWidth: "56ch" }}>
              No W-2s or tax returns — but DSCR loans do have a document list. Have these ready before you submit to avoid delays at closing.
            </p>
          </div>

          <div
            className="gs-reveal dc-band-2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {DOCS.map((d) => (
              <div
                key={d.doc}
                style={{
                  padding: "clamp(16px,2vw,22px) clamp(16px,2vw,20px)",
                  background: dc.cream,
                  borderRadius: 8,
                  border: `1px solid ${dc.faded}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: dc.rain, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✓</span>
                  <div
                    style={{
                      color: dc.dark,
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {d.doc}
                  </div>
                </div>
                <div
                  style={{
                    color: "rgba(0,55,56,0.6)",
                    fontSize: 12,
                    marginTop: 4,
                    lineHeight: 1.55,
                    paddingLeft: 21,
                  }}
                >
                  {d.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMON MISTAKES ── */}
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
              Watch-outs
            </div>
            <h2
              style={{
                fontSize: "clamp(26px,3.2vw,44px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              Five mistakes that slow or kill a DSCR closing.
            </h2>
            <p style={{ fontSize: "clamp(15px,1.25vw,17px)", fontWeight: 500, color: "rgba(0,55,56,0.62)", margin: 0, lineHeight: 1.6, maxWidth: "56ch" }}>
              These come up on almost every submission desk. Check your file against each one before you submit.
            </p>
          </div>

          <div
            className="gs-reveal"
            style={{
              background: dc.mintBg,
              borderRadius: 12,
              border: `1px solid ${dc.faded}`,
              padding: "8px clamp(20px,2.4vw,28px) 12px",
            }}
          >
            {MISTAKES.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "18px 0",
                  borderBottom:
                    i < MISTAKES.length - 1
                      ? `1px solid ${dc.faded}`
                      : "none",
                }}
              >
                <div
                  style={{
                    color: dc.dark,
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 7,
                    letterSpacing: "-0.015em",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  {/* Error mark — on-token dark ink, no hardcoded red */}
                  <span style={{ color: dc.rain, fontWeight: 800, flexShrink: 0 }}>✗</span>
                  {m.mistake}
                </div>
                <p
                  style={{
                    color: "rgba(0,55,56,0.65)",
                    fontSize: 13,
                    margin: "0 0 0 22px",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: dc.rain }}>Fix: </strong>
                  {m.fix}
                </p>
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
            Ready to check your deal?
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
            See if your deal qualifies.
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
            Enter your property details and get a preliminary DSCR estimate, rate range, and program match — no income docs, no commitment, result in under two minutes.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => (window as any).openQualify?.()}
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
              See if your deal qualifies →
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
              Run the DSCR Calculator
            </button>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
