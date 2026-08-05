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
    desc: "Reliability hold. This broader analysis view is not released for decision-making while its calculations and assumptions are reviewed. Use the released DSCR Calculator only for preliminary arithmetic from the inputs you provide.",
    cta: "View availability",
    view: "deal-analyzer",
    tag: "Reliability hold",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Deal Analyzer",
    panelMetric: "HOLD",
    panelNote: "Calculations and assumptions under review",
  },
  {
    title: "DSCR Calculator",
    desc: "Released for arithmetic-only DSCR estimates. Enter income, rate, and property-cost inputs to calculate a payment-based ratio and PITIA breakdown. Results are preliminary and do not determine pricing, eligibility, terms, approval, or underwriting.",
    cta: "Open DSCR Calculator",
    view: "dscr-calculator",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "DSCR Calculator",
    panelMetric: "DSCR",
    panelNote: "Released · input-based arithmetic only",
  },
  {
    title: "Program Intelligence",
    desc: "Reliability hold. Program comparisons and matching are unavailable for decision-making while the underlying information is reviewed. This tool does not provide program availability, eligibility, pricing, terms, or approval.",
    cta: "View availability",
    view: "products",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Loan Programs",
    panelMetric: "HOLD",
    panelNote: "Program information under review",
  },
  {
    title: "50-State Compliance Rules",
    desc: "Reliability hold. State-law information and citations are unavailable for legal or compliance decisions while sources are reviewed. Consult qualified legal counsel for advice on a specific transaction.",
    cta: "View availability",
    view: "state-laws",
    panelBg: dc.teal,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "State Laws",
    panelMetric: "HOLD",
    panelNote: "Legal and compliance content under review",
  },
  {
    title: "Monte Carlo Rate Simulation",
    desc: "Reliability hold. Rate simulations and projected outcomes are unavailable for decision-making while model assumptions and calculations are reviewed. This tool does not provide a forecast or a verified risk assessment.",
    cta: "View availability",
    view: "monte-carlo",
    panelBg: dc.teal,
    panelAccent: dc.emerald,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "Monte Carlo",
    panelMetric: "HOLD",
    panelNote: "Model assumptions under review",
  },
  {
    title: "Stress Matrix",
    desc: "Reliability hold. Sensitivity outputs are unavailable for decision-making while the underlying calculations are reviewed. Do not use this tool as a lending, investment, or risk conclusion.",
    cta: "View availability",
    view: "stress-matrix",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "Stress Matrix",
    panelMetric: "HOLD",
    panelNote: "Sensitivity calculations under review",
  },
  {
    title: "After-Tax Returns",
    desc: "Reliability hold. Return calculations are unavailable for decision-making while their methods and assumptions are reviewed. This tool does not provide verified performance or tax conclusions.",
    cta: "View availability",
    view: "returns",
    panelBg: dc.lemon,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.6)",
    panelTag: "Returns Engine",
    panelMetric: "HOLD",
    panelNote: "Return calculations under review",
  },
  {
    title: "Tax Engine",
    desc: "Reliability hold. Tax calculations and explanations are unavailable for tax decisions while their sources and calculations are reviewed. Consult a qualified tax professional for advice about your situation.",
    cta: "View availability",
    view: "tax-engine",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Tax Engine",
    panelMetric: "HOLD",
    panelNote: "Tax content and calculations under review",
  },
  {
    title: "Short-Term Rental (STR) Underwriting",
    desc: "Reliability hold. Short-term-rental analysis is unavailable for decision-making while its calculations and assumptions are reviewed. It does not determine income treatment, qualification, or underwriting.",
    cta: "View availability",
    view: "str-underwriting",
    panelBg: dc.teal,
    panelAccent: dc.emerald,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "STR",
    panelMetric: "HOLD",
    panelNote: "STR calculations under review",
  },
  {
    title: "ARM Reset Analyzer",
    desc: "Reliability hold. ARM payment projections are unavailable for decision-making while their calculations and assumptions are reviewed. This tool does not provide future-rate or payment conclusions.",
    cta: "View availability",
    view: "arm-reset",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "ARM Reset",
    panelMetric: "HOLD",
    panelNote: "ARM calculations under review",
  },
  {
    title: "Refi Tracker",
    desc: "Reliability hold. Refinance comparisons are unavailable for decision-making while their calculations and assumptions are reviewed. This tool does not provide a refinance recommendation, pricing, or savings conclusion.",
    cta: "View availability",
    view: "refi-tracker",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Refi Tracker",
    panelMetric: "HOLD",
    panelNote: "Refinance calculations under review",
  },
];

const SPECIAL_TOOLS = [
  {
    title: "Deal Workspace",
    desc: "Reliability hold. This workspace view is not released for analysis or decision-making while its calculations and data are reviewed.",
    href: "/tools/deal-workspace",
    label: "View availability",
    stat: "01",
  },
  {
    title: "Sensitivity Lab",
    desc: "Reliability hold. This workspace view is not released for analysis or decision-making while its calculations and data are reviewed.",
    href: "/tools/sensitivity",
    label: "View availability",
    stat: "02",
  },
  {
    title: "Structure Optimizer",
    desc: "Reliability hold. This workspace view is not released for analysis or decision-making while its calculations and data are reviewed.",
    href: "/tools/structure-optimizer",
    label: "View availability",
    stat: "03",
  },
  {
    title: "Scenario History",
    desc: "Reliability hold. This workspace view is not released for analysis or decision-making while its calculations and data are reviewed.",
    href: "/tools/scenario-history",
    label: "View availability",
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
        { label: "Tool availability", view: "products" },
        { label: "State Rules · on hold", view: "state-laws" },
      ]}
      cta={{ label: "Open DSCR Calculator →", view: "dscr-calculator" }}
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
              1 released calculator · 10 tools on hold
            </div>
            <H1 style={{ margin: 0 }}>
              DSCR calculation, clearly scoped
            </H1>

            {/* Sub — separate child so hero stagger steps to it after the h1 */}
            <Lead
              style={{
                color: "rgba(238,239,211,0.72)",
                maxWidth: "48ch",
                margin: "clamp(24px,3vw,36px) 0 0",
              }}
            >
              The DSCR Calculator is the currently released tool. It performs
              preliminary arithmetic from the values you enter. The other tools
              and workspace views are on reliability hold while their calculations
              and source data are reviewed. Nothing here provides a live program,
              pricing, eligibility, legal, tax, underwriting, approval, or
              performance conclusion.
            </Lead>
          </div>
          <MotionWorkbench mode="sim" value="1" label="Released calculator" />
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
                Workspace views · reliability hold
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
                Workspace views are not released for decisions.
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
              These linked workspace views remain on reliability hold while their calculations and data are reviewed. Do not use them for analysis, lending, investment, legal, tax, or compliance decisions.
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
              Start with the released DSCR Calculator.
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
              It provides a preliminary, input-based DSCR calculation and PITIA
              breakdown. All other listed tools, including the rate quiz, remain
              on reliability hold and are not for decision-making.
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
              See tool availability by role →
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
              Rate quiz availability →
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
