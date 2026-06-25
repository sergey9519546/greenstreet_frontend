import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DcShell, dc, Mono } from "../design/dc";

gsap.registerPlugin(ScrollTrigger);

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
    desc: "The full picture, in one pass. Track 1 (lender qualification), Track 2 (investor survival), break-even rate, and cash-on-cash — before you wire earnest money.",
    cta: "Open Deal Analyzer",
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
    desc: "Quick DSCR and max-purchase-price. Payment factor, PITIA breakdown, and rate tier guidance — when you need an answer in 60 seconds, not 60 minutes.",
    cta: "Open the calculator",
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
    desc: "Filter Greenstreet DSCR programs by FICO, DSCR, LTV, and property type. See exactly which program funds your file — not just which ones advertise.",
    cta: "Open Lender Intel",
    view: "lender-intel",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Lender Intel",
    panelMetric: "19",
    panelNote: "Programs ranked by fit score",
  },
  {
    title: "50-state rules",
    desc: "50-state matrix with statutory citations. OH/PA thresholds, NJ LLC risk, TX APR ban, MN HF 3437 — the compliance traps that kill deals after you think you're done.",
    cta: "Open State Laws",
    view: "state-laws",
    panelBg: dc.teal,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.6)",
    panelTag: "State Laws",
    panelMetric: "50",
    panelNote: "Cited PPP & usury rule sets",
  },
  {
    title: "Risk & Monte Carlo",
    desc: "500 Vasicek SOFR rate paths — know the probability DSCR breaks before the ARM resets. Stochastic simulation, not a sensitivity table.",
    cta: "Open Monte Carlo",
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
    desc: "120-cell sensitivity grid — rent haircut vs. rate shock — so you can show a lender exactly where DSCR breaks before they ask.",
    cta: "Open Stress Matrix",
    view: "stress-matrix",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    panelTag: "Stress Matrix",
    panelMetric: "120",
    panelNote: "Sensitivity cells: rent × rate",
  },
  {
    title: "After-tax returns",
    desc: "Levered IRR, equity multiple and after-tax IRR with §167 depreciation, §469 PAL, §1250 recapture and §1411 NIIT.",
    cta: "Open Returns",
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
    desc: "Step-by-step §167 depreciation, §469 passive-activity loss, §1250 recapture, and §1411 NIIT — each line traceable to a code section.",
    cta: "Open Tax Engine",
    view: "tax-engine",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Tax Engine",
    panelMetric: "§§",
    panelNote: "Depreciation · PAL · recapture · NIIT",
  },
  {
    title: "STR Underwriting",
    desc: "Short-term rental income modeled on ADR × occupancy with seasonal haircuts — the income lenders actually accept, not Airbnb projections.",
    cta: "Open STR Underwriting",
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
    desc: "Index + margin + caps computed for every reset date. Know the worst-case payment before your client signs a 5/1 ARM.",
    cta: "Open ARM Reset",
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
    desc: "Break-even month, NPV of savings, and the minimum rate drop that justifies closing costs — so your client refi's when the math says go, not when rates feel low.",
    cta: "Open Refi Tracker",
    view: "refi-tracker",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    panelTag: "Refi Tracker",
    panelMetric: "NPV",
    panelNote: "Break-even month · min rate delta",
  },
];

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
              padding: "3px 10px",
              background: "rgba(216,217,88,0.18)",
              color: "#6b5400",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.03em",
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
            background: dc.dark,
            color: dc.mintBg,
            fontWeight: 600,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            padding: "13px 26px",
            borderRadius: 6,
            fontFamily: dc.sans,
            letterSpacing: "-0.01em",
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
            borderRadius: 12,
            overflow: "hidden",
            background: tool.panelBg,
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

  // Products-specific GSAP: per-row child stagger on each .pr-feat.
  // Registered after mount so all rows exist in the DOM.
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const rows = document.querySelectorAll<HTMLElement>(".pr-feat");
    rows.forEach((row) => {
      gsap.from(Array.from(row.children), {
        y: 50,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: row,
          start: "top 82%",
          once: true,
        },
      });
    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => {
      clearTimeout(refresh);
    };
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "All tools", view: "products" },
        { label: "Lender Intel", view: "lender-intel" },
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
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "clamp(28px, 4vw, 48px)",
            minHeight: "clamp(280px, 38vh, 420px)",
            justifyContent: "space-between",
          }}
        >
          {/* Title block — eyebrow + display h1 */}
          <div>
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
              Product
            </div>
            <h1
              style={{
                fontSize: "clamp(46px, 7vw, 108px)",
                fontWeight: 600,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              The DSCR Engine
            </h1>
          </div>

          {/* Sub — separate child so hero stagger steps to it after the h1 */}
          <p
            style={{
              fontSize: "clamp(19px, 1.9vw, 28px)",
              fontWeight: 500,
              lineHeight: 1.35,
              letterSpacing: "-0.025em",
              color: "rgba(238,239,211,0.72)",
              maxWidth: "38ch",
              margin: 0,
            }}
          >
            Deterministic underwriting and thoughtful automation to price every
            rental loan with confidence.
          </p>
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

      {/* ── BACK TO ALL TOOLS — matches mockup footer link ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(32px, 4vw, 56px) ${dc.pad} clamp(72px, 10vh, 120px)`,
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
            onClick={() => onNavigate("products")}
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
                fontSize: "clamp(16px, 1.4vw, 19px)",
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
