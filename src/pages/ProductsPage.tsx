import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { MotionWorkbench } from "../design/artifacts";

// ScrollTrigger is already registered in dc.tsx — calling it again here is a
// no-op for GSAP but avoids the "Plugin already registered" warning in strict mode.
// We keep the import for the per-row scrollTrigger config below.

// ── Tool definitions — alternating 2-col feature rows ────────────────────────
// Panel colour sets rotate across the 11 tools so adjacent rows never share the
// same background.  contentOrder / visualOrder alternate so text swaps sides.
interface Tool {
  title: string;
  desc: string;
  cta: string;
  view: string;
  tag?: string;
  panelBg: string;
  panelAccent: string;
  panelBody: string;
  panelTag: string;
  panelMetric: string;
  panelNote: string;
}

const TOOLS: Tool[] = [
  {
    title: "Deal Analyzer",
    desc: "The full picture in one pass. Track 1 shows what the lender uses to qualify the file (DSCR: whether rent covers the full monthly PITIA payment — principal, interest, taxes, insurance, HOA). Track 2 strips out vacancy, management fees and CapEx reserves to show what you'll actually earn. Also computes break-even rate and cash-on-cash — before you wire earnest money.",
    cta: "Analyze my deal",
    view: "deal-analyzer",
    tag: "Most used",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Deal Analyzer",
    panelMetric: "1.11×",
    panelNote: "Dual-track DSCR · lender + investor",
  },
  {
    title: "DSCR Calculator",
    desc: "Quick DSCR check and max-purchase-price. Enter the rent, rate and property costs; get the PITIA breakdown (full monthly payment), rate tier guidance, and which Greenstreet programs fit — when you need an answer in 60 seconds, not 60 minutes.",
    cta: "Check my DSCR",
    view: "dscr-calculator",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "DSCR Calculator",
    panelMetric: "1.25×",
    panelNote: "Live dual-track coverage + lender shortlist",
  },
  {
    title: "Program Intelligence",
    desc: "Filter all 19 Greenstreet DSCR programs by FICO, DSCR, LTV (how the loan amount compares to property value — lower means more equity and better terms), and property type. See exactly which program will fund your file — and which will decline it — before you make a single call.",
    cta: "Match my file to a program",
    view: "products",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Loan Programs",
    panelMetric: "19",
    panelNote: "Programs ranked by fit score",
  },
  {
    title: "50-State Compliance Rules",
    desc: "50-state matrix with statutory citations covering prepayment penalties (a fee some loans charge if you pay off or refinance early), usury caps, and short-term-rental restrictions. Covers the traps that kill deals after you think you're done: OH/PA thresholds, NJ LLC risk, TX APR ban, MN HF 3437.",
    cta: "Check my state's rules",
    view: "state-laws",
    panelBg: dc.teal,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "State Laws",
    panelMetric: "50",
    panelNote: "Cited PPP & usury rule sets",
  },
  {
    title: "Monte Carlo Rate Simulation",
    desc: "500 simulated rate paths show the probability your DSCR (rent-to-payment ratio) breaks below 1.0 before the ARM resets. Uses a calibrated Vasicek stochastic model — the same framework bank stress teams use — giving P10/P50/P90 distributions so you can see best, median and worst case in one view.",
    cta: "Simulate my rate risk",
    view: "monte-carlo",
    panelBg: dc.teal,
    panelAccent: dc.emerald,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "Monte Carlo",
    panelMetric: "500×",
    panelNote: "Stochastic rate-path simulation",
  },
  {
    title: "Stress Matrix",
    desc: "A 120-cell grid shows every combination of rent haircut and rate shock — so you can see exactly where DSCR breaks before a lender asks. Run it in seconds; share it as a defensible page in the loan package.",
    cta: "Run the stress matrix",
    view: "stress-matrix",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "Stress Matrix",
    panelMetric: "120",
    panelNote: "Sensitivity cells: rent × rate",
  },
  {
    title: "After-Tax Returns",
    desc: "Levered IRR (return on your cash invested after debt), equity multiple (total returned ÷ invested), and after-tax IRR accounting for the full depreciation stack: §167 straight-line depreciation, §469 passive-activity-loss, §1250 recapture at sale, and §1411 net investment income tax. The real net return, every line traceable.",
    cta: "Run my returns",
    view: "returns",
    panelBg: dc.lemon,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.6)",
    panelTag: "Returns Engine",
    panelMetric: "IRR",
    panelNote: "After-tax IRR, equity multiple, fully traced",
  },
  {
    title: "Tax Engine",
    desc: "Rental property's biggest advantage is depreciation — the IRS lets you deduct a portion of the building each year. The Tax Engine runs the full stack: §167 straight-line depreciation, §469 passive-activity-loss rules with the real-estate-professional exception, §1250 recapture at 25%, and §1411 NIIT. Every line traceable to a code section.",
    cta: "Calculate my tax shield",
    view: "tax-engine",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Tax Engine",
    panelMetric: "§§",
    panelNote: "Depreciation · PAL · recapture · NIIT",
  },
  {
    title: "Short-Term Rental (STR) Underwriting",
    desc: "Short-term rental (Airbnb / VRBO) income is modeled on average daily rate (ADR) × occupancy with seasonal haircuts — the income methodology lenders actually accept, not the optimistic projections Airbnb shows hosts. Runs against the STR program parameters so you can see the qualifying DSCR before you list the property.",
    cta: "Underwrite my STR",
    view: "str-underwriting",
    panelBg: dc.teal,
    panelAccent: dc.emerald,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "STR",
    panelMetric: "ADR×",
    panelNote: "ADR × occupancy · seasonal haircut",
  },
  {
    title: "ARM Reset Analyzer",
    desc: "Adjustable-rate mortgages (ARMs) have a fixed period — e.g., 5 years on a 5/1 ARM — then reset based on an index (usually SOFR) plus a margin, subject to periodic and lifetime caps. The ARM Reset Analyzer computes the payment at every future reset date so you know the worst-case payment before your client signs.",
    cta: "Model my ARM resets",
    view: "arm-reset",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "ARM Reset",
    panelMetric: "5/1",
    panelNote: "Index + margin + cap schedule",
  },
  {
    title: "Refi Tracker",
    desc: "A rate & term refinance (replace your current loan to change the rate or term, without taking cash out) pencils only if the monthly savings pay back closing costs before you sell or refinance again. The Refi Tracker shows break-even month, NPV of savings, and the minimum rate drop that justifies closing costs — so you refinance when the math confirms it, not when rates feel low.",
    cta: "Find my refi break-even",
    view: "refi-tracker",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Refi Tracker",
    panelMetric: "NPV",
    panelNote: "Break-even month · min rate delta",
  },
];

const SPECIAL_TOOLS = [
  {
    title: "Deal Workspace",
    desc: "The workspace-only version of the analyzer: inputs, lender match, sensitivity, optimization, and saved scenarios in one operating screen.",
    href: "/tools/deal-workspace",
    label: "Open workspace",
    stat: "01",
  },
  {
    title: "Sensitivity Lab",
    desc: "Rent breakpoints, rate headroom, appraisal stress, and structure changes after a deal has been priced.",
    href: "/tools/sensitivity",
    label: "Open sensitivity lab",
    stat: "02",
  },
  {
    title: "Structure Optimizer",
    desc: "Compare interest-only, amortization, rate, and cost structures against qualifying DSCR and investor cash flow.",
    href: "/tools/structure-optimizer",
    label: "Optimize structure",
    stat: "03",
  },
  {
    title: "Scenario History",
    desc: "Saved deal runs, state checks, and output logs for repeat analysis and audit trails inside InvestGO.",
    href: "/tools/scenario-history",
    label: "View saved scenarios",
    stat: "04",
  },
] as const;

// ── Feature row ───────────────────────────────────────────────────────────────
// Each row is a 2-col grid that alternates text/visual side.
// Class "pr-feat" is Products-specific; ProductsPage registers its own GSAP
// ScrollTrigger that staggers the two children per row (text → visual).
// No gs-reveal or dc-band-2 — those are generic; pr-feat has its own motion.
function FeatureRow({
  tool,
  index,
  onNavigate,
}: {
  tool: Tool;
  index: number;
  onNavigate: (v: string) => void;
}) {
  const textFirst = index % 2 === 0;

  return (
    <div
      className="pr-feat"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(32px, 5vw, 80px)",
        alignItems: "center",
      }}
    >
      {/* Text column */}
      <div
        style={{
          order: textFirst ? 1 : 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {tool.tag && (
          <div
            style={{
              display: "inline-block",
              padding: "4px 11px",
              background: dc.lemon,
              color: dc.dark,
              borderRadius: dc.r.pill,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              marginBottom: 14,
            }}
          >
            {tool.tag}
          </div>
        )}
        <h2
          style={{
            fontSize: "clamp(28px, 3.4vw, 46px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.04,
            margin: "0 0 18px",
            color: dc.dark,
          }}
        >
          {tool.title}
        </h2>
        <p
          style={{
            fontSize: "clamp(17px, 1.4vw, 21px)",
            fontWeight: 500,
            lineHeight: 1.55,
            color: "rgba(0,55,56,0.68)",
            margin: "0 0 28px",
            letterSpacing: "-0.01em",
          }}
        >
          {tool.desc}
        </p>
        <button
          onClick={() => onNavigate(tool.view)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: dc.lemon,
            color: dc.dark,
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            padding: "14px 26px",
            borderRadius: dc.r.md,
            fontFamily: dc.sans,
            letterSpacing: "-0.01em",
            minHeight: 44,
          }}
        >
          {tool.cta} →
        </button>
      </div>

      {/* Visual panel */}
      <div style={{ order: textFirst ? 2 : 1 }}>
        <div
          style={{
            position: "relative",
            borderRadius: dc.r.lg,
            overflow: "hidden",
            background: tool.panelBg,
            border: `1px solid ${dc.faded}`,
            padding: "clamp(18px, 2vw, 28px)",
            aspectRatio: "1.5",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              color: tool.panelAccent,
              marginBottom: 14,
            }}
          >
            {tool.panelTag}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mono
              style={{
                fontSize: "clamp(40px, 5.5vw, 84px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: tool.panelAccent,
              }}
            >
              {tool.panelMetric}
            </Mono>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: tool.panelBody,
              letterSpacing: "-0.01em",
            }}
          >
            {tool.panelNote}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecialToolCard({
  tool,
  onNavigate,
}: {
  tool: (typeof SPECIAL_TOOLS)[number];
  onNavigate: (v: string) => void;
}) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        minHeight: 280,
        background: dc.dark,
        color: dc.cream,
        borderRadius: 8,
        padding: "clamp(24px, 2.8vw, 36px)",
        border: "1px solid rgba(238,239,211,0.12)",
      }}
    >
      <Mono style={{ fontSize: 18, fontWeight: 700, color: dc.lemon, marginBottom: 28 }}>{tool.stat}</Mono>
      <div>
        <h3
          style={{
            fontSize: "clamp(25px,2.6vw,36px)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            fontWeight: 650,
            margin: "0 0 14px",
            color: dc.cream,
          }}
        >
          {tool.title}
        </h3>
        <p style={{ margin: 0, color: "rgba(238,239,211,0.66)", lineHeight: 1.55, fontWeight: 500 }}>
          {tool.desc}
        </p>
      </div>
      <button
        onClick={() => onNavigate("portal")}
        style={{
          marginTop: 30,
          justifySelf: "start",
          background: dc.lemon,
          color: dc.dark,
          border: "none",
          borderRadius: dc.r.md,
          padding: "13px 20px",
          fontFamily: dc.sans,
          fontWeight: 650,
          cursor: "pointer",
        }}
      >
        {tool.label} →
      </button>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Products | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "All tools", view: "products" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* ── HERO: solid dark, left-aligned, eyebrow + display h1 + sub ──────── */}
      {/* id="pr-hero" matches the mockup; useDcGsap animates #gs-hero-content   */}
      {/* children — here we put everything inside one wrapper so both the       */}
      {/* title block and the sub-paragraph get the hero stagger treatment.       */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px, 9vh, 128px) ${dc.pad}`,
          overflow: "hidden",
        }}
      >
        <div
          id="gs-hero-content"
          className="dc-hero"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.95fr) minmax(320px, 0.6fr)",
            alignItems: "center",
            gap: "clamp(28px, 4vw, 48px)",
            minHeight: "clamp(280px, 38vh, 420px)",
          }}
        >
          <div>
            {/* Title block — eyebrow + display h1 */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 18,
              }}
            >
              11 tools · one engine
            </div>
            <H1 style={{ margin: 0 }}>
              The DSCR Engine
            </H1>

            {/* Sub — separate child so hero stagger steps to it after the h1 */}
            <Lead
              style={{
                color: "rgba(238,239,211,0.72)",
                maxWidth: "48ch",
                margin: "clamp(24px,3vw,36px) 0 0",
              }}
            >
              Eleven tools for DSCR rental-loan underwriting — from a 60-second
              deal check to a full after-tax returns model. Every tool runs off the
              same deterministic core: versioned math, statutory citations, no
              AI-generated numbers. Brokers typically use three tools. Investors
              use five. Funds use all eleven. Start anywhere.
            </Lead>
          </div>
          <MotionWorkbench mode="sim" value="11" label="Connected tools" />
        </div>
      </section>

      {/* ── FEATURE LIST: alternating 2-col rows — the Products centrepiece ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px, 8vw, 112px) ${dc.pad} clamp(40px, 5vw, 64px)`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(56px, 8vw, 120px)",
          }}
        >
          {TOOLS.map((tool, i) => (
            <FeatureRow
              key={tool.view}
              tool={tool}
              index={i}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      <section
        style={{
          background: dc.mintBg,
          color: dc.dark,
          padding: `clamp(64px, 8vw, 112px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
              gap: "clamp(32px,5vw,80px)",
              alignItems: "end",
              marginBottom: "clamp(32px,5vw,56px)",
            }}
            className="dc-split"
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: dc.rain,
                  marginBottom: 14,
                }}
              >
                Special tools
              </div>
              <h2
                style={{
                  fontSize: "clamp(34px,4.4vw,64px)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.045em",
                  fontWeight: 650,
                  margin: 0,
                }}
              >
                Workspace-only tools, now directly linked.
              </h2>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "clamp(16px,1.4vw,19px)",
                lineHeight: 1.55,
                color: "rgba(0,55,56,0.66)",
                fontWeight: 500,
                maxWidth: "54ch",
              }}
            >
              These are the deeper InvestGO workbench views that used to live only inside the platform sidebar. They now have stable public routes and sit beside the standalone engines.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 16,
            }}
            className="pr-special-grid"
          >
            {SPECIAL_TOOLS.map((tool) => (
              <SpecialToolCard key={tool.href} tool={tool} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA — demo + solutions cross-link ── */}
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
              Not sure which tool to start with?
            </h2>
            <p
              style={{
                fontSize: "clamp(15px,1.3vw,18px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(238,239,211,0.6)",
                maxWidth: "48ch",
                margin: "0 0 18px",
                letterSpacing: "-0.01em",
              }}
            >
              New to DSCR? Start with the Deal Analyzer — it covers everything a
              first-time investor or broker needs in a single screen. Or see the
              recommended workflow for your role, or book a 15-minute walkthrough.
            </p>
            <button
              onClick={() => onNavigate("solutions")}
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
              See tools by role →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
            <button
              onClick={() => onNavigate("rate-quiz")}
              style={{
                background: dc.lemon,
                color: dc.dark,
                border: "none",
                borderRadius: dc.r.md,
                padding: "15px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                textAlign: "left" as const,
              }}
            >
              See my rate in 5 questions →
            </button>
            <button
              onClick={() => onNavigate("dscr-calculator")}
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
              }}
            >
              DSCR Calculator →
            </button>
          </div>
        </div>
      </section>

      {/* ── BACK PILL ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vh,72px) ${dc.pad} clamp(72px,10vh,120px)`,
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
            onClick={() => onNavigate("marketing")}
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
    </DcShell>
  );
}
