import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

// ── Value proposition cards (from existing page) ──────────────────────────────
const VALUE_CARDS = [
  {
    bg: dc.mintBg,
    ink: dc.dark,
    body: "rgba(0,55,56,0.62)",
    accent: dc.rain,
    headline: "Know if the deal survives before the appraisal is ordered.",
    desc: "Plug in the numbers. Track 1 shows what the lender sees. Track 2 shows what you'll actually earn after vacancy, management, and CapEx. Most investors only ever see Track 1 — that's the problem. Find the binding constraint in the first 90 seconds.",
    ctaLabel: "Open the DSCR Calculator →",
    view: "dscr-calculator",
  },
  {
    bg: dc.dark,
    ink: dc.cream,
    body: "rgba(238,239,211,0.65)",
    accent: dc.lemon,
    headline: "After-tax IRR. With real depreciation, not estimated depreciation.",
    desc: "Year 1 typically shelters $12K–$20K of taxable income on a $400K deal. IRC §168(k) bonus depreciation is permanent under OBBBA. Don't be the investor who ignores the shield.",
    ctaLabel: "Run the Tax Engine →",
    view: "tax-engine",
  },
  {
    bg: dc.lemon,
    ink: dc.dark,
    body: "rgba(0,55,56,0.62)",
    accent: dc.rain,
    headline: "Stress-test before you sign. Not after you close.",
    desc: "A 2D rate × rent shock grid shows your deal's actual margin before you commit. Know the break-even DSCR at 1.11x and see which scenario breaks the deal first — rate jump, vacancy spike, or exit-cap expansion.",
    ctaLabel: "Open the Stress Matrix →",
    view: "stress-matrix",
  },
];

// ── Numbered use-cases (from mockup, adapted to real Greenstreet tools) ────────
const USECASES = [
  {
    num: "01",
    numBg: dc.lemon,
    numInk: dc.dark,
    title: "Levered and unlevered IRR",
    desc: "Pre-tax levered IRR, equity multiple, yield-on-cost and a hold × rent-growth × exit-cap sensitivity matrix — all using proper amortization on every cell.",
    ctaLabel: "Open Returns & IRR",
    view: "returns",
  },
  {
    num: "02",
    numBg: dc.dark,
    numInk: dc.lemon,
    title: "After-tax IRR with full depreciation stack",
    desc: "IRC §167 SL depreciation, §469 passive-activity-loss rules with the REP exception, §1250 recapture at 25%, §1(h) LTCG rates and §1411 NIIT — the real net after-tax return, not the estimate.",
    ctaLabel: "Open Tax Engine",
    view: "tax-engine",
  },
  {
    num: "03",
    numBg: dc.lemon,
    numInk: dc.dark,
    title: "Dual-track DSCR analysis",
    desc: "Track 1 is the lender's qualifying view. Track 2 strips vacancy, management, and CapEx reserves to show actual cash flow. Both on one screen so you can find the constraint — and fix it — before the appraisal is ordered.",
    ctaLabel: "Open DSCR Calculator",
    view: "dscr-calculator",
  },
  {
    num: "04",
    numBg: dc.dark,
    numInk: dc.lemon,
    title: "Program match across Greenstreet products",
    desc: "DSCR 1–4 units, multi-family, short-term rental, foreign national, no-ratio, and more. The Program Match tool reads your file parameters and ranks which Greenstreet program fits — without a phone call.",
    ctaLabel: "Open Program Match",
    view: "lender-intel",
  },
  {
    num: "05",
    numBg: dc.lemon,
    numInk: dc.dark,
    title: "ARM reset and refi timing",
    desc: "Model 5 SOFR paths for a 5/6, 7/6, or 10/6 ARM. Then score refi readiness: monthly savings, break-even month, and cash-out capacity at 70% LTV — so you know when the refinance pencils before you need it.",
    ctaLabel: "Open ARM Reset",
    view: "arm-reset",
  },
];

// ── Five myths (preserved exactly from existing page) ─────────────────────────
const MYTHS = [
  {
    myth: "DSCR is just rent ÷ payment.",
    truth:
      "That's Track 1 — the lender's qualifying view. Track 2 strips out vacancy, management fees, and CapEx reserves to show what you'll actually cash-flow. Most brokers only quote Track 1 because it makes the deal look better than it is. You need both numbers before you sign.",
  },
  {
    myth: "A 0.1x DSCR improvement doesn't matter.",
    truth:
      "On a $400K deal, 0.1x DSCR moves the rate by 25–50bps. That's $80–$150/month. Over a 30-year hold, that's $30K–$50K in interest you didn't have to pay.",
  },
  {
    myth: "All DSCR loans price the same.",
    truth:
      "Greenstreet has multiple programs — from high-leverage DSCR to no-ratio, multi-family, and foreign national — and the right program can move your rate 100–150bps. The Program Match tool reads your file and finds the best fit in seconds.",
  },
  {
    myth: "A 5/6 ARM is free money for the first 5 years.",
    truth:
      "You're betting SOFR stays low for 5 years and that you'll sell or refi before the first reset. The ARM Reset page models 5 SOFR paths from bullish to crisis. In the bear case, the reset rate exceeds 8%. Know the scenario before you sign the note.",
  },
  {
    myth: "Cash-out always means waiting 12 months to season.",
    truth:
      "Many lenders make you wait. Greenstreet seasons cash-out at six months on qualifying files — and the STR program is designed to recycle BRRRR capital faster than a conventional refi timeline.",
  },
];

// ── Investor profiles (preserved from existing page) ──────────────────────────
const PROFILES = [
  {
    title: "LTR / Buy-and-Hold",
    desc: "Single-family or small multifamily, 1–4 doors, long-term tenant. Most common DSCR use case.",
    view: "dscr-calculator",
  },
  {
    title: "STR / Airbnb",
    desc: "Short-term rental with AirDNA or 12-month history. Higher qualifying rent, more lender-specific rules.",
    view: "lender-intel",
  },
  {
    title: "BRRRR",
    desc: "Buy, rehab, rent, refi, repeat. 6-month seasoning matters — Greenstreet's STR program is built to recycle capital fast.",
    view: "dscr-calculator",
  },
  {
    title: "Portfolio / 10+ doors",
    desc: "Multiple properties, blanket loans, cross-collateralization. The Greenstreet DSCR Multi-Family program is built for this.",
    view: "lender-intel",
  },
  {
    title: "Syndication / LP",
    desc: "Capital stack with multiple investors. The Tax Engine and IRR Waterfall pages are the workhorse here.",
    view: "tax-engine",
  },
  {
    title: "Foreign National / ITIN",
    desc: "No SSN. Non-QM foreign national program. 25–35% down, 100–200bps premium, but doable.",
    view: "lender-intel",
  },
];

// ── Full toolkit list ──────────────────────────────────────────────────────────
const TOOLS = [
  { title: "DSCR Calculator", desc: "Dual-track analysis: what gets you qualified and what keeps you solvent.", view: "dscr-calculator" },
  { title: "Program Match", desc: "See which Greenstreet program fits your file. One application.", view: "lender-intel" },
  { title: "State Laws", desc: "50-state PPP and usury matrix. Statutory references included.", view: "state-laws" },
  { title: "Stress Matrix", desc: "2D rate × rent shock grid. See which scenario breaks your deal first.", view: "stress-matrix" },
  { title: "Returns / IRR", desc: "Pre-tax levered IRR with exit math and a 4×4 hold × cap sensitivity grid.", view: "returns" },
  { title: "Tax Engine", desc: "Depreciation, passive losses, recapture, capital gains. After-tax IRR.", view: "tax-engine" },
  { title: "ARM Reset", desc: "What happens when a 5/6, 7/6, or 10/6 ARM resets. Pick a SOFR path.", view: "arm-reset" },
  { title: "Sensitivity", desc: "Rent drop, value drop, rate jump. See which one breaks the deal first.", view: "deal-analyzer" },
];

// ── Shared button helpers ──────────────────────────────────────────────────────
function PrimaryBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
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
      {children}
    </button>
  );
}

function GhostBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
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
      {children}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InvestorsPage({
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
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Run the numbers →", view: "returns" }}
    >
      {/* ── HERO ── solid dark ─────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
        }}
      >
        <div
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
          {/* Left column */}
          <div id="gs-hero-content">
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 20,
              }}
            >
              For Investors · DSCR + Returns + Tax
            </div>
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: "0 0 24px",
              }}
            >
              Underwrite
              <br />
              like an
              <br />
              institution.
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(238,239,211,0.7)",
                maxWidth: "46ch",
                margin: "0 0 36px",
              }}
            >
              Know if the deal works before you spend a dollar on appraisal.
              After-tax IRR, stress matrix, and dual-track DSCR — the analysis a
              fund desk runs, on every one of your deals.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <PrimaryBtn onClick={() => onNavigate("returns")}>
                Open Returns &amp; IRR →
              </PrimaryBtn>
              <GhostBtn onClick={() => onNavigate("dscr-calculator")}>
                Run a deal
              </GhostBtn>
            </div>
          </div>

          {/* Right column — live DSCR proof panel (solid, no glass) */}
          <div
            style={{
              background: dc.teal,
              border: "1px solid rgba(238,239,211,0.14)",
              borderRadius: 12,
              padding: "clamp(28px,3.5vw,44px)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
              }}
            >
              Sample deal preview
            </div>
            <div>
              <Mono
                style={{
                  fontSize: "clamp(52px,7vw,88px)",
                  fontWeight: 600,
                  color: dc.cream,
                  lineHeight: 0.9,
                  display: "block",
                }}
              >
                1.11x
              </Mono>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(238,239,211,0.55)",
                  marginTop: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                DSCR · $3,330 rent ÷ $2,999 PITIA
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { label: "After-tax IRR", val: "9.4%" },
                { label: "Equity multiple", val: "2.1×" },
                { label: "Year-1 tax shield", val: "$14K" },
                { label: "Break-even rent", val: "$2,600" },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    background: "rgba(238,239,211,0.05)",
                    border: "1px solid rgba(238,239,211,0.09)",
                    borderRadius: 7,
                    padding: "12px 14px",
                  }}
                >
                  <Mono
                    style={{
                      display: "block",
                      fontSize: 22,
                      fontWeight: 600,
                      color: dc.lemon,
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {m.val}
                  </Mono>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(238,239,211,0.5)",
                      letterSpacing: "0.02em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(238,239,211,0.35)",
                letterSpacing: "-0.01em",
              }}
            >
              Illustrative. Open the calculator to price your deal.
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE CARDS ── 3-up grid ──────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(48px,6vw,72px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 48 }}>
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
              Why Greenstreet
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                margin: 0,
                maxWidth: "22ch",
              }}
            >
              Institutional analysis, no fund required.
            </h2>
          </div>

          <div
            className="dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {VALUE_CARDS.map((c) => (
              <div
                key={c.headline}
                className="gs-reveal"
                style={{
                  background: c.bg,
                  border: "1px solid rgba(0,55,56,0.10)",
                  borderRadius: 10,
                  padding: "clamp(24px,3vw,36px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: "clamp(18px,1.8vw,22px)",
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.15,
                    color: c.ink,
                    margin: 0,
                  }}
                >
                  {c.headline}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: c.body,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {c.desc}
                </p>
                <button
                  onClick={() => onNavigate(c.view)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left" as const,
                    fontSize: 14,
                    fontWeight: 600,
                    color: c.accent,
                    letterSpacing: "-0.01em",
                    fontFamily: dc.sans,
                    alignSelf: "flex-start",
                  }}
                >
                  {c.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUMBERED USE-CASES (mockup timeline) ─────────────────────────── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 52 }}>
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
              The full engine
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                margin: 0,
                maxWidth: "22ch",
              }}
            >
              Every analysis a fund desk runs — for every deal you touch.
            </h2>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {/* Vertical timeline rail */}
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(0,55,56,0.15)",
                pointerEvents: "none",
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
                {/* Number badge */}
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
                      fontSize: "clamp(19px,2vw,26px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      margin: "0 0 10px",
                      color: dc.dark,
                    }}
                  >
                    {u.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "clamp(15px,1.3vw,18px)",
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color: "rgba(0,55,56,0.65)",
                      margin: "0 0 14px",
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
                    {u.ctaLabel} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIVE MYTHS (best educational content — preserved exactly) ─────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 44 }}>
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
              Education
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                margin: 0,
              }}
            >
              Five myths DSCR investors believe until they lose money.
            </h2>
          </div>

          <div
            className="gs-reveal"
            style={{
              background: dc.white,
              borderRadius: 10,
              border: "1px solid rgba(0,55,56,0.08)",
              padding: "4px 28px 8px",
            }}
          >
            {MYTHS.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 0",
                  borderBottom:
                    i < MYTHS.length - 1
                      ? "1px solid rgba(0,55,56,0.08)"
                      : "none",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    color: "#c0392b",
                    fontWeight: 600,
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}
                >
                  ✗ Myth: {m.myth}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(0,55,56,0.65)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  <strong style={{ color: dc.rain }}>Reality: </strong>
                  {m.truth}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTOR PROFILES (6-up) ───────────────────────────────────────── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 44 }}>
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
              Investor profiles
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                margin: 0,
                maxWidth: "22ch",
              }}
            >
              Which investor profile are you?
            </h2>
          </div>

          <div
            className="dc-band-3 gs-reveal"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {PROFILES.map((p) => (
              <button
                key={p.title}
                onClick={() => onNavigate(p.view)}
                style={{
                  background: dc.cream,
                  border: "1px solid rgba(0,55,56,0.10)",
                  borderRadius: 9,
                  padding: "20px 22px",
                  cursor: "pointer",
                  textAlign: "left" as const,
                  fontFamily: dc.sans,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: dc.dark,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(0,55,56,0.6)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL TOOLKIT GRID ─────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,80px) ${dc.pad}`,
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
              All tools
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
              The full toolkit — all free.
            </h2>
          </div>

          <div
            className="dc-band-3 gs-reveal"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
            }}
          >
            {TOOLS.map((t) => (
              <button
                key={t.title}
                onClick={() => onNavigate(t.view)}
                style={{
                  background: dc.white,
                  border: "1px solid rgba(0,55,56,0.09)",
                  borderRadius: 8,
                  padding: "18px 20px",
                  cursor: "pointer",
                  textAlign: "left" as const,
                  fontFamily: dc.sans,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: dc.dark,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(0,55,56,0.58)",
                    lineHeight: 1.5,
                  }}
                >
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────────────────────── */}
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
            No signup required
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
            Stop hoping the deal works.
            <br />
            Know before you close.
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
            Every tool is free. No email required. Open a deal and see what the
            math says.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <PrimaryBtn onClick={() => onNavigate("dscr-calculator")}>
              DSCR Calculator →
            </PrimaryBtn>
            <GhostBtn onClick={() => onNavigate("lender-intel")}>
              Lender Intel
            </GhostBtn>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
