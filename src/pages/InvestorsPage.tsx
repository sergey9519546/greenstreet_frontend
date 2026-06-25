import React, { useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";

// ── Five myths — the centrepiece educational content ──────────────────────────
// Each myth gets a bps-specific rebuttal. Do not dilute or reorder.
const MYTHS = [
  {
    num: "01",
    myth: "DSCR is just rent ÷ payment.",
    truth:
      "That's Track 1 — the lender's qualifying view. Track 2 strips out vacancy, management fees, and CapEx reserves to show what you'll actually cash-flow. Most brokers only quote Track 1 because it makes the deal look better than it is. You need both numbers before you sign.",
    view: "dscr-calculator",
    cta: "Open DSCR Calculator",
  },
  {
    num: "02",
    myth: "A 0.1x DSCR improvement doesn't matter.",
    truth:
      "On a $400K deal, 0.1x DSCR moves the rate by 25–50 bps. That's $80–$150/month. Over a 30-year hold, that's $30K–$50K in interest you didn't have to pay. The calculator shows the binding constraint in the first 90 seconds.",
    view: "dscr-calculator",
    cta: "Find the constraint",
  },
  {
    num: "03",
    myth: "All DSCR loans price the same.",
    truth:
      "Greenstreet programs span high-leverage DSCR, no-ratio, multi-family, short-term rental, and foreign national. The right program moves your rate 100–150 bps. Program Match reads your file parameters and ranks which Greenstreet program fits — without a phone call.",
    view: "lender-intel",
    cta: "Run Program Match",
  },
  {
    num: "04",
    myth: "A 5/6 ARM is free money for the first 5 years.",
    truth:
      "You're betting SOFR stays low for 5 years and that you'll sell or refi before the first reset. The ARM Reset page models 5 SOFR paths from bullish to crisis. In the bear case, the reset rate exceeds 8%. Know the scenario before you sign the note.",
    view: "arm-reset",
    cta: "Model the reset",
  },
  {
    num: "05",
    myth: "Cash-out always means waiting 12 months to season.",
    truth:
      "Many lenders make you wait. Greenstreet seasons cash-out at six months on qualifying files — and the STR program is designed to recycle BRRRR capital faster than a conventional refi timeline.",
    view: "lender-intel",
    cta: "See STR program",
  },
];

// ── Value cards — the three headline guarantees ───────────────────────────────
const VALUE_CARDS = [
  {
    bg: dc.mintBg,
    ink: dc.dark,
    body: "rgba(0,55,56,0.62)",
    accent: dc.rain,
    headline: "Know if the deal works before you spend a dollar on appraisal.",
    desc: "Plug in the numbers. Track 1 shows what the lender sees. Track 2 shows what you'll actually earn after vacancy, management, and CapEx. Most investors only ever see Track 1 — that's the problem. Find the binding constraint in the first 90 seconds.",
    ctaLabel: "Open DSCR Calculator →",
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
    ctaLabel: "Open Stress Matrix →",
    view: "stress-matrix",
  },
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
      accent={dc.dark}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Tax Engine", view: "tax-engine" },
        { label: "Returns", view: "returns" },
      ]}
      cta={{ label: "Run the numbers →", view: "returns" }}
    >
      {/* ── HERO ── solid midnight, 2-col ────────────────────────────────────── */}
      <section style={{ background: dc.dark, color: dc.cream, overflow: "hidden" }}>
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
              For Investors
            </div>
            <H1 style={{ margin: "0 0 24px" }}>
              Underwrite
              <br />
              like an
              <br />
              institution.
            </H1>
            <Lead
              style={{
                color: "rgba(238,239,211,0.7)",
                maxWidth: "46ch",
                margin: "0 0 36px",
              }}
            >
              After-tax IRR, Monte Carlo rate paths, and a 120-cell stress
              matrix — the analysis a fund desk runs, on every one of your deals.
            </Lead>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <PrimaryBtn onClick={() => onNavigate("returns")}>
                Open Returns &amp; IRR →
              </PrimaryBtn>
              <GhostBtn onClick={() => onNavigate("dscr-calculator")}>
                Run a deal
              </GhostBtn>
            </div>
          </div>

          {/* Right column — live deal proof panel */}
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

      {/* ── USE-CASE LIST: vertical rail + numbered rows (mockup centrepiece) ── */}
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
                color: dc.dark,
              }}
            >
              Institutional analysis, no fund required.
            </h2>
          </div>

          <div style={{ position: "relative" }}>
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
            {[
              {
                num: "01",
                title: "Levered and unlevered IRR",
                desc: "Pre-tax levered IRR, equity multiple, yield-on-cost and a hold × rent-growth × exit-cap sensitivity matrix — all using proper amortization on every cell.",
                cta: "Open Returns & IRR",
                view: "returns",
                numBg: dc.lemon,
                numInk: dc.dark,
              },
              {
                num: "02",
                title: "Monte Carlo rate-path simulation",
                desc: "500 Vasicek SOFR paths using a calibrated OU process. Know the probability your DSCR breaks below 1.0 before the ARM resets, with P10/P50/P90 distributions.",
                cta: "Open Monte Carlo",
                view: "monte-carlo",
                numBg: dc.dark,
                numInk: dc.lemon,
              },
              {
                num: "03",
                title: "After-tax IRR with full depreciation stack",
                desc: "IRC §167 SL depreciation, §469 passive-activity-loss rules with the REP exception, §1250 recapture at 25%, §1(h) LTCG rates and §1411 NIIT — the real net.",
                cta: "Open Tax Engine",
                view: "tax-engine",
                numBg: dc.lemon,
                numInk: dc.dark,
              },
              {
                num: "04",
                title: "Portfolio and blanket view",
                desc: "Blended DSCR, aggregate equity and weighted rate across every door — the way a blanket lender actually sees your book. Add and edit properties inline.",
                cta: "Open Portfolio",
                view: "portfolio",
                numBg: dc.dark,
                numInk: dc.lemon,
              },
              {
                num: "05",
                title: "Refi timing and break-even",
                desc: "4-factor refi readiness score, monthly savings, break-even month and cash-out capacity at 70% LTV — so you know exactly when the refinance pencils.",
                cta: "Open Refi Tracker",
                view: "refi-tracker",
                numBg: dc.lemon,
                numInk: dc.dark,
              },
            ].map((u) => (
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
                  <Mono style={{ fontSize: 14, fontWeight: 700, color: u.numInk }}>
                    {u.num}
                  </Mono>
                </div>
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

      {/* ── VALUE CARDS ── 3-up grid, cream bg ───────────────────────────────── */}
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

      {/* ── FIVE MYTHS ── dark centerpiece, full-bleed, the page's signature ─── */}
      {/*
        Design intent: this section IS the Investors page.
        Each myth gets a full card with a strong "×" label, bold rebuttal,
        and a direct CTA. Section background matches the hero (midnight)
        so the page has a clear dark / cream / dark / cream rhythm.
      */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(72px,9vw,120px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: "clamp(48px,6vw,80px)" }}>
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
              Education
            </div>
            <h2
              style={{
                fontSize: "clamp(32px,4.4vw,62px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 0.97,
                margin: "0 0 20px",
                maxWidth: "22ch",
              }}
            >
              Five myths DSCR investors believe until they lose money.
            </h2>
            <p
              style={{
                fontSize: "clamp(15px,1.3vw,18px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(238,239,211,0.6)",
                maxWidth: "54ch",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Every one of these costs money in real deals. The rebuttals are
              bps-specific — not marketing copy.
            </p>
          </div>

          {/* Myth cards — vertical stack with left rail */}
          <div style={{ position: "relative" }}>
            {/* Timeline rail */}
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(238,239,211,0.12)",
                pointerEvents: "none",
              }}
            />

            {MYTHS.map((m, i) => (
              <div
                key={m.num}
                className="gs-reveal"
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: "clamp(24px,3.5vw,56px)",
                  alignItems: "start",
                  paddingBottom:
                    i < MYTHS.length - 1 ? "clamp(40px,5vw,64px)" : 0,
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
                    background:
                      i % 2 === 0 ? dc.lemon : "rgba(238,239,211,0.08)",
                    border:
                      i % 2 === 0
                        ? "none"
                        : "1px solid rgba(238,239,211,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mono
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: i % 2 === 0 ? dc.dark : dc.cream,
                    }}
                  >
                    {m.num}
                  </Mono>
                </div>

                {/* Content block */}
                <div style={{ paddingTop: 6 }}>
                  {/* Myth label */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(220,40,40,0.14)",
                      border: "1px solid rgba(220,40,40,0.28)",
                      borderRadius: 4,
                      padding: "4px 10px",
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase" as const,
                        color: "#f87171",
                      }}
                    >
                      Myth
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "clamp(20px,2.2vw,30px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                      color: dc.cream,
                      margin: "0 0 16px",
                    }}
                  >
                    "{m.myth}"
                  </h3>

                  {/* Reality rebuttal box */}
                  <div
                    style={{
                      background: "rgba(238,239,211,0.05)",
                      border: "1px solid rgba(238,239,211,0.1)",
                      borderLeft: `3px solid ${dc.lemon}`,
                      borderRadius: "0 6px 6px 0",
                      padding: "16px 20px",
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase" as const,
                        color: dc.lemon,
                        marginBottom: 8,
                      }}
                    >
                      Reality
                    </div>
                    <p
                      style={{
                        fontSize: "clamp(14px,1.2vw,17px)",
                        fontWeight: 500,
                        lineHeight: 1.65,
                        color: "rgba(238,239,211,0.75)",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {m.truth}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(m.view)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                      color: dc.lemon,
                      letterSpacing: "-0.01em",
                      fontFamily: dc.sans,
                    }}
                  >
                    {m.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BACK PILL ── matches mockup ─────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `0 ${dc.pad} clamp(72px,10vh,120px)`,
          paddingTop: "clamp(8px,2vh,24px)",
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

      {/* ── CTA STRIP ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal"
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
                color: dc.rain,
                marginBottom: 14,
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
                color: dc.dark,
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
                color: "rgba(0,55,56,0.6)",
                maxWidth: "52ch",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Every tool is free. No email required. Open a deal and see what the
              math says.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minWidth: 220,
            }}
          >
            <button
              onClick={() => onNavigate("dscr-calculator")}
              style={{
                background: dc.dark,
                color: dc.cream,
                border: "none",
                borderRadius: 6,
                padding: "15px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                textAlign: "left" as const,
              }}
            >
              DSCR Calculator →
            </button>
            <button
              onClick={() => onNavigate("tax-engine")}
              style={{
                background: dc.mintBg,
                color: dc.dark,
                border: "1px solid rgba(0,55,56,0.12)",
                borderRadius: 6,
                padding: "15px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                textAlign: "left" as const,
              }}
            >
              Tax Engine →
            </button>
            <button
              onClick={() => onNavigate("returns")}
              style={{
                background: dc.mintBg,
                color: dc.dark,
                border: "1px solid rgba(0,55,56,0.12)",
                borderRadius: 6,
                padding: "15px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                textAlign: "left" as const,
              }}
            >
              Returns &amp; IRR →
            </button>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
