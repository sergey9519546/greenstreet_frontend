import React, { useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { MotionWorkbench } from "../design/artifacts";

// ── Five myths — the centrepiece educational content ──────────────────────────
// Each myth gets a bps-specific rebuttal. Do not dilute or reorder.
const MYTHS = [
  {
    num: "01",
    myth: "DSCR is just rent ÷ payment.",
    truth:
      "That's Track 1 — the lender's qualifying view (DSCR: whether the property's rent can cover the loan payment; 1.00 = rent exactly covers it). Track 2 strips out vacancy, management fees, and CapEx reserves to show what you'll actually cash-flow after real expenses. Most brokers only quote Track 1 because it makes the deal look better than it is. You need both numbers before you sign.",
    view: "dscr-calculator",
    cta: "See both tracks on my deal",
  },
  {
    num: "02",
    myth: "A 0.1x DSCR improvement doesn't matter.",
    truth:
      "On a $400K deal, 0.1x DSCR moves your rate by 25–50 basis points (bps). That's $80–$150/month. Over a 30-year hold, that's $30K–$50K in interest you didn't have to pay. The calculator surfaces the binding constraint — the one number dragging your DSCR down — in the first 90 seconds.",
    view: "dscr-calculator",
    cta: "Find my binding constraint",
  },
  {
    num: "03",
    myth: "All DSCR loans price the same.",
    truth:
      "Greenstreet programs span high-leverage DSCR, no-ratio DSCR (a program that skips the rent-to-payment test; usually needs more down or reserves), multi-family, short-term rental, and foreign national. Picking the right program moves your rate 100–150 bps. Program Match reads your file parameters and ranks which program fits — without a phone call.",
    view: "lender-intel",
    cta: "Match my deal to a program",
  },
  {
    num: "04",
    myth: "A 5/6 ARM is free money for the first 5 years.",
    truth:
      "You're betting SOFR (the benchmark rate ARM payments follow) stays low for 5 years and that you'll sell or refinance before the first reset. The ARM Reset page models 5 SOFR paths from bullish to crisis. In the bear case, the reset rate exceeds 8%. Know your worst-case payment before you sign the note.",
    view: "arm-reset",
    cta: "Model the reset scenarios",
  },
  {
    num: "05",
    myth: "Cash-out refinance always means waiting 12 months to season.",
    truth:
      "A cash-out refinance (replace your loan with a larger one and take the difference in cash) typically requires seasoning — many lenders make you wait a full year. Greenstreet seasons cash-out at six months on qualifying files. The STR program is also designed to recycle BRRRR capital faster than a conventional refi timeline.",
    view: "lender-intel",
    cta: "See cash-out programs",
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
    desc: "Plug in the numbers. Track 1 shows what the lender sees (DSCR: does rent cover the full PITIA payment — principal, interest, taxes, insurance, and any HOA dues). Track 2 shows what you'll actually earn after vacancy, management, and CapEx. Most investors only ever see Track 1 — that's the problem. Find the binding constraint in the first 90 seconds.",
    ctaLabel: "Check my deal's DSCR →",
    view: "dscr-calculator",
  },
  {
    bg: dc.dark,
    ink: dc.cream,
    body: "rgba(238,239,211,0.65)",
    accent: dc.lemon,
    headline: "After-tax IRR. With real depreciation, not a rough estimate.",
    desc: "Year 1 typically shelters $12K–$20K of taxable income on a $400K deal. IRC §168(k) bonus depreciation is permanent under OBBBA. Rental property depreciation is one of the most valuable tax advantages individual investors have — and most never run the numbers. Don't leave the shield unused.",
    ctaLabel: "Run the Tax Engine →",
    view: "tax-engine",
  },
  {
    bg: dc.lemon,
    ink: dc.dark,
    body: "rgba(0,55,56,0.62)",
    accent: dc.rain,
    headline: "Stress-test before you sign. Not after you close.",
    desc: "A 2D rate × rent shock grid shows every scenario — rate jumps up, rent drops, or both. Know the break-even DSCR and see which scenario breaks your deal first before you commit capital. If the deal can't survive a 10% rent haircut, you need to know now.",
    ctaLabel: "Run the stress matrix →",
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
        borderRadius: dc.r.md,
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
        border: `1.5px solid ${dc.faded}`,
        cursor: "pointer",
        padding: "15px 26px",
        borderRadius: dc.r.md,
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
              DSCR loans (where qualifying is based on the property's rent, not your tax returns) let individual investors grow a rental portfolio without income docs. These tools give you the same analysis a private-fund desk runs — after-tax IRR, 500-path rate simulations, and a 120-cell stress matrix. No signup, no spreadsheet.
            </Lead>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <PrimaryBtn onClick={() => onNavigate("returns")}>
                See my deal's returns →
              </PrimaryBtn>
              <GhostBtn onClick={() => onNavigate("dscr-calculator")}>
                Check DSCR first
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
            <MotionWorkbench mode="stress" value="1.11x" label="Investor coverage" />
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
                DSCR — $3,330 rent ÷ $2,999 PITIA (full monthly payment)
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
                margin: "0 0 14px",
                maxWidth: "18ch",
                color: dc.dark,
              }}
            >
              Institutional analysis, no fund required.
            </h2>
            <p
              style={{
                fontSize: "clamp(16px,1.25vw,19px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(0,55,56,0.62)",
                margin: 0,
                maxWidth: "56ch",
                letterSpacing: "-0.01em",
              }}
            >
              Five tools below, in the order you'd actually use them — from qualifying
              a deal to modeling the exit.
            </p>
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
                title: "Levered returns and equity multiple",
                desc: "Pre-tax levered IRR (return on your cash invested, after debt), equity multiple (total dollars returned ÷ dollars put in), yield-on-cost, and a hold × rent-growth × exit-cap sensitivity matrix — all with proper amortization on every cell. Start here if you want to know whether the deal is worth your capital.",
                cta: "Run my returns",
                view: "returns",
                numBg: dc.lemon,
                numInk: dc.dark,
              },
              {
                num: "02",
                title: "Monte Carlo rate-path simulation",
                desc: "500 simulated rate paths show the probability your DSCR (rent-to-payment ratio) breaks below 1.0 before the ARM resets. The model uses a calibrated Vasicek process — the same stochastic framework bank stress teams use — with P10/P50/P90 distributions so you can see best, median and worst case side by side.",
                cta: "Run the rate simulation",
                view: "monte-carlo",
                numBg: dc.dark,
                numInk: dc.lemon,
              },
              {
                num: "03",
                title: "After-tax IRR with the full depreciation stack",
                desc: "Rental property's biggest tax advantage is depreciation — the IRS lets you deduct a portion of the building's value each year even while it appreciates. The Tax Engine runs the full stack: §167 straight-line depreciation, §469 passive-activity-loss (PAL) rules with the real-estate-professional exception, §1250 recapture at 25% when you sell, and §1411 net investment income tax. The result is your real after-tax IRR, every line traceable to a code section.",
                cta: "Calculate my tax shield",
                view: "tax-engine",
                numBg: dc.lemon,
                numInk: dc.dark,
              },
              {
                num: "04",
                title: "Portfolio and blanket view",
                desc: "When you own multiple rentals, lenders look at blended DSCR — the combined rent-to-payment ratio across all properties. The portfolio builder shows aggregate equity, weighted average rate, and blended DSCR across every door, so you can see your book the way a blanket lender actually underwrites it.",
                cta: "Build my portfolio view",
                view: "portfolio",
                numBg: dc.dark,
                numInk: dc.lemon,
              },
              {
                num: "05",
                title: "Refi timing and break-even",
                desc: "A rate & term refinance (replace your current loan to change the rate or term, without taking cash out) makes sense only if the monthly savings pay back the closing costs before you sell or refinance again. The Refi Tracker calculates the break-even month, NPV of savings, and cash-out capacity at 70% LTV (how the loan amount compares to property value) — so you refi when the math says go, not when rates feel low.",
                cta: "Find my refi break-even",
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

      {/* ── VALUE CARDS ── 3-up grid, mintBg breaks the cream→dark→cream rhythm ── */}
      <section
        style={{
          background: dc.mintBg,
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
                margin: "0 0 14px",
                maxWidth: "22ch",
              }}
            >
              Three checks every DSCR investor should run before signing.
            </h2>
            <p
              style={{
                fontSize: "clamp(16px,1.25vw,19px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(0,55,56,0.62)",
                margin: 0,
                maxWidth: "56ch",
                letterSpacing: "-0.01em",
              }}
            >
              Free. No signup. Open a deal and see what the math says.
            </p>
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
                className="gs-reveal ix-card"
                style={{
                  background: c.bg,
                  border: `1px solid ${dc.faded}`,
                  borderRadius: dc.r.md,
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
              Five things DSCR investors believe until they lose money.
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
              Each one shows up in real deals with real dollar consequences. The rebuttals are basis-point-specific — not marketing copy. Every number is reproducible in the calculator.
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
                  {/* Myth label — use contract banned-tier color for negative signal */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255,107,107,0.14)",
                      border: "1px solid rgba(255,107,107,0.28)",
                      borderRadius: dc.r.sm,
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
                        color: "#ff6b6b",
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

      {/* ── CTA STRIP — dark band, one lemon primary, two secondary links ─────── */}
      {/* Band is dark to break the preceding cream sequence (value cards + myths were
          cream → dark → now this is dark again, but myths ended on dark so we need
          a cream band before this. Insert cream spacer then dark CTA. */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,5vw,72px) ${dc.pad} clamp(32px,4vw,56px)`,
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
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <p
            style={{
              fontSize: "clamp(15px,1.2vw,17px)",
              fontWeight: 500,
              color: "rgba(0,55,56,0.6)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            No signup required. Every tool is free. Open a deal and see what the math says.{" "}
            <button
              onClick={() => onNavigate("solutions")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "inherit",
                fontWeight: 600,
                color: dc.rain,
                letterSpacing: "-0.01em",
                fontFamily: dc.sans,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              See who else uses Greenstreet →
            </button>
          </p>
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
              whiteSpace: "nowrap" as const,
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

      {/* ── CLOSING CTA STRIP — dark band so the page ends with intent ─────── */}
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
                color: "rgba(238,239,211,0.6)",
                maxWidth: "52ch",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Run the DSCR Calculator, Tax Engine, and Returns model on your next deal —
              all free, no credit pull, no email required. Start with the DSCR check,
              then layer in the tax shield and returns.
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
            {/* ONE dominant lemon primary per contract */}
            <button
              onClick={() => onNavigate("dscr-calculator")}
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
              Check my DSCR →
            </button>
            {/* Secondary CTAs: transparent + FADED border per contract */}
            <button
              onClick={() => onNavigate("tax-engine")}
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
              Tax Engine →
            </button>
            <button
              onClick={() => onNavigate("returns")}
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
              Returns &amp; IRR →
            </button>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
