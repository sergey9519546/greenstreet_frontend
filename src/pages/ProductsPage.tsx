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
    desc: "Model payment coverage, cash flow, cap rate, and debt yield from the property and financing assumptions you enter.",
    cta: "Analyze a deal",
    view: "deal-analyzer",
    tag: "Input-based",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Deal Analyzer",
    panelMetric: "5×",
    panelNote: "Five connected deal measures",
  },
  {
    title: "DSCR Calculator",
    desc: "Enter income, rate, and property costs to calculate payment-based DSCR, PITIA, and an expense-aware investor view.",
    cta: "Open DSCR Calculator",
    view: "dscr-calculator",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "DSCR Calculator",
    panelMetric: "DSCR",
    panelNote: "Input-based payment coverage",
  },
  {
    title: "Loan Profile",
    desc: "Organize borrower, property, leverage, and coverage inputs into a plain-language financing profile before starting a request. It does not publish live pricing or eligibility.",
    cta: "Build a loan profile",
    view: "rate-quiz",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Loan Profile",
    panelMetric: "5Q",
    panelNote: "Five borrower and property inputs",
  },
  {
    title: "State Rules Reference",
    desc: "Look up educational prepayment-penalty research by state, inspect the displayed source, and identify questions that require provider or counsel confirmation.",
    cta: "Open state reference",
    view: "state-laws",
    panelBg: dc.teal,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "State Laws",
    panelMetric: "50",
    panelNote: "State and district reference entries",
  },
  {
    title: "Rate-Path Simulation",
    desc: "Run repeatable modeled rate paths from explicit assumptions to see a range of possible payment-coverage outcomes. It is a simulation, not a forecast.",
    cta: "Simulate rate paths",
    view: "monte-carlo",
    panelBg: dc.teal,
    panelAccent: dc.emerald,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "Monte Carlo",
    panelMetric: "1K",
    panelNote: "Modeled paths from entered assumptions",
  },
  {
    title: "Stress Matrix",
    desc: "Change rate, rent, vacancy, and property-cost assumptions to see how each modeled shock changes DSCR.",
    cta: "Stress a deal",
    view: "stress-matrix",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "Stress Matrix",
    panelMetric: "4×10",
    panelNote: "Rate and rent sensitivity grid",
  },
  {
    title: "After-Tax Returns",
    desc: "Compare modeled cash flow, equity multiple, and IRR from the acquisition, operations, sale, and tax assumptions you enter.",
    cta: "Model returns",
    view: "returns",
    panelBg: dc.lemon,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.6)",
    panelTag: "Returns Engine",
    panelMetric: "IRR",
    panelNote: "Assumption-based return schedule",
  },
  {
    title: "Tax Scenario Model",
    desc: "Explore depreciation and sale-tax scenarios using your own rates and assumptions. The output is planning arithmetic for discussion with a tax professional, not tax advice.",
    cta: "Model a tax scenario",
    view: "tax-engine",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Tax Engine",
    panelMetric: "TAX",
    panelNote: "User-entered tax assumptions",
  },
  {
    title: "Short-Term Rental Model",
    desc: "Compare long-term rent, projected STR revenue, and documented STR revenue assumptions with month-by-month payment coverage.",
    cta: "Model STR income",
    view: "str-underwriting",
    panelBg: dc.teal,
    panelAccent: dc.emerald,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "STR",
    panelMetric: "STR",
    panelNote: "Three entered income views",
  },
  {
    title: "ARM Reset Analyzer",
    desc: "Enter an ARM structure, index assumptions, margin, and caps to model reset payments and DSCR across several rate paths.",
    cta: "Model an ARM reset",
    view: "arm-reset",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "ARM Reset",
    panelMetric: "ARM",
    panelNote: "Cap-aware reset calculations",
  },
  {
    title: "Refi Tracker",
    desc: "Compare an existing loan with a proposed refinance using entered balance, payment, rate, costs, and hold-period assumptions.",
    cta: "Compare a refinance",
    view: "refi-tracker",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Refi Tracker",
    panelMetric: "B/E",
    panelNote: "Modeled monthly break-even",
  },
];

const SPECIAL_TOOLS = [
  {
    title: "Decision Support",
    desc: "Reconcile coverage, leverage, liquidity, and return assumptions in one clearly labeled decision worksheet.",
    view: "decision-support",
    label: "Open worksheet",
    stat: "01",
  },
  {
    title: "Structure Comparison",
    desc: "Compare amortizing and interest-only payment structures with the same loan, rate, rent, and cost inputs.",
    view: "structure-optimizer",
    label: "Compare structures",
    stat: "02",
  },
  {
    title: "Portfolio Model",
    desc: "Enter multiple rental properties and view blended DSCR, debt, equity, and cash flow from one table.",
    view: "portfolio",
    label: "Model a portfolio",
    stat: "03",
  },
  {
    title: "Deal Workspace",
    desc: "Use the public deal analyzer as a no-sign-in workspace, then carry the property and requested-loan context into an application.",
    view: "deal-analyzer",
    label: "Open workspace",
    stat: "04",
  },
] as const;

const PRODUCTS_MOBILE_CSS = `
  @media (max-width: 700px) {
    .pr-feat, .dc-hero, .dc-split, .dc-band-2 { grid-template-columns: 1fr !important; }
    .pr-feat { gap: 24px !important; }
    .pr-feat > * { order: unset !important; }
    .pr-visual-panel { aspect-ratio: auto !important; min-height: 250px; }
    .pr-special-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .pr-special-grid > * { min-height: 0 !important; }
    .dc-hero > *:last-child { max-width: 100%; }
  }
`;

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
          className="pr-visual-panel"
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
        onClick={() => onNavigate(tool.view)}
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
      cta={{ label: "Apply for a DSCR loan →", view: "book-demo" }}
    >
      <style>{PRODUCTS_MOBILE_CSS}</style>
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
              Connected tools · explicit assumptions
            </div>
            <H1 style={{ margin: 0 }}>
              DSCR tools that show their work
            </H1>

            {/* Sub — separate child so hero stagger steps to it after the h1 */}
            <Lead
              style={{
                color: "rgba(238,239,211,0.72)",
                maxWidth: "48ch",
                margin: "clamp(24px,3vw,36px) 0 0",
              }}
            >
              Each tool runs coded calculations from the values you enter and
              exposes the assumptions behind its output. These are educational
              scenario models—not live pricing, eligibility, legal or tax advice,
              underwriting, approval, or a commitment to lend.
            </Lead>
          </div>
          <MotionWorkbench mode="sim" value="15" label="Connected tool views" />
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
                Connected comparison views
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
                Move between tools without changing the contract.
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
              These tools keep calculations bounded to visible visitor-entered assumptions. They help organize questions and compare scenarios; a responsible provider and qualified professionals still determine transaction-specific financing, legal, and tax conclusions.
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
              <SpecialToolCard key={tool.view} tool={tool} onNavigate={onNavigate} />
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
              Start with the deal in front of you.
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
              Use the calculator for payment coverage, add the relevant stress,
              structure, return, or portfolio view, then carry the useful facts
              into a preliminary DSCR loan request.
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
              See the connected loan path →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
            <button
              onClick={() => onNavigate("book-demo")}
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
              Apply for a DSCR loan →
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
