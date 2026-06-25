import React, { useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";

// ── Audience segments — data from Solutions.dc.html renderVals() ───────────────
// Each segment has alternating content/visual order: even indices content-left,
// odd indices content-right. This is the SIGNATURE of this page.
interface Segment {
  tag: string;
  title: string;
  desc: string;
  cta: string;
  view: string;
  panelBg: string;
  panelAccent: string;
  panelBody: string;
  gridline: string;
  statBg: string;
  stats: { v: string; k: string }[];
}

const SEGMENTS: Segment[] = [
  {
    tag: "Brokers",
    title: "Quote with confidence, close faster",
    desc: "Price a DSCR deal in under 60 seconds, hand the borrower a defensible rate band, and match to the right Greenstreet program — all before your first call to a lender. No income docs needed: DSCR loans (business-purpose / non-owner-occupied rentals) qualify on the property's rent, not the borrower's pay stubs.",
    cta: "See the broker workflow",
    view: "brokers",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    gridline: "rgba(0,55,56,0.10)",
    statBg: dc.cream,
    stats: [
      { v: "<60s", k: "to a priced deal" },
      { v: "19", k: "lender programs" },
      { v: "50", k: "state rule sets" },
      { v: "0", k: "income docs" },
    ],
  },
  {
    tag: "Investors",
    title: "Underwrite your rental like an institution",
    desc: "After-tax IRR, 500-path Monte Carlo rate simulations, and a 120-cell stress matrix — the analysis a private-fund desk runs, on every deal you own. DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger) is the entry check. These tools tell you whether the deal survives the next five years.",
    cta: "Explore investor tools",
    view: "investors",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    gridline: "rgba(238,239,211,0.12)",
    statBg: dc.teal,
    stats: [
      { v: "14.4%", k: "levered IRR" },
      { v: "500×", k: "rate sims" },
      { v: "§469", k: "PAL handled" },
      { v: "4×4", k: "sensitivity" },
    ],
  },
  {
    tag: "Funds & Portfolios",
    title: "One book, one underwriting view",
    desc: "When you own 10+ doors, lenders look at blended DSCR — the rent-to-payment ratio across every property combined. The portfolio builder shows aggregate equity, weighted average rate, and blended DSCR in one screen, the way a blanket lender actually underwrites your book. Blanket lines to $25M.",
    cta: "Build my portfolio view",
    view: "portfolio",
    panelBg: dc.rain,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.60)",
    gridline: "rgba(238,239,211,0.14)",
    // darkTeal is the closest on-token surface darker than rainforest
    statBg: dc.teal,
    stats: [
      { v: "$25M", k: "blanket lines" },
      { v: "1.49×", k: "blended DSCR" },
      { v: "40+", k: "doors modeled" },
      { v: "1", k: "relationship" },
    ],
  },
  {
    tag: "Lenders & Partners",
    title: "Every rule cited. Every output defensible.",
    desc: "Every program rule and state compliance check traces to a statutory citation. Share the program fit, state rule, and investment-committee memo with partners or regulators without asking them to reverse-engineer the file. No LLM-generated numbers — deterministic math only.",
    cta: "See program intelligence",
    view: "lender-intel",
    panelBg: dc.lemon,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.60)",
    gridline: "rgba(0,55,56,0.12)",
    // mint is the closest on-token light surface for lemon panel stat cells
    statBg: dc.mintBg,
    stats: [
      { v: "50", k: "state rules" },
      { v: "100%", k: "cited rules" },
      { v: "Memo", k: "output" },
      { v: "0", k: "LLM in math" },
    ],
  },
];

// ── Stat panel: solid fills, flat 1-px grid, no blur/glow ────────────────────
function StatPanel({ seg }: { seg: Segment }) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: seg.panelBg,
        border: "1px solid rgba(0,55,56,0.10)",
        padding: "clamp(20px,2.2vw,30px)",
        aspectRatio: "1.4",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
          color: seg.panelAccent,
          marginBottom: 16,
        }}
      >
        {seg.tag}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: seg.gridline,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {seg.stats.map((st) => (
          <div key={st.k} style={{ background: seg.statBg, padding: "18px 16px" }}>
            <Mono
              style={{
                display: "block",
                fontSize: "clamp(22px,2.4vw,32px)",
                fontWeight: 600,
                color: seg.panelAccent,
                lineHeight: 1,
              }}
            >
              {st.v}
            </Mono>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: seg.panelBody,
                marginTop: 3,
                letterSpacing: "-0.01em",
              }}
            >
              {st.k}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SegmentRow: the CENTERPIECE — alternating content↔visual layout ───────────
// Each row gets its own gs-reveal so GSAP fires per-row, not for the whole list.
// CSS order property drives left/right alternation; the so-feat responsive override
// neutralizes order on mobile so text always appears first.
function SegmentRow({
  seg,
  index,
  onNavigate,
}: {
  seg: Segment;
  index: number;
  onNavigate: (v: string) => void;
}) {
  const contentFirst = index % 2 === 0;
  return (
    <div
      className="gs-reveal so-feat"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(32px,5vw,80px)",
        alignItems: "center",
      }}
    >
      {/* Content column */}
      <div
        style={{
          order: contentFirst ? 1 : 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
            color: dc.rain,
            marginBottom: 14,
          }}
        >
          {seg.tag}
        </div>
        <h2
          style={{
            fontSize: "clamp(28px,3.4vw,46px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.04,
            margin: "0 0 18px",
            color: dc.dark,
          }}
        >
          {seg.title}
        </h2>
        <p
          style={{
            fontSize: "clamp(17px,1.4vw,21px)",
            fontWeight: 500,
            lineHeight: 1.55,
            color: "rgba(0,55,56,0.68)",
            margin: "0 0 28px",
            letterSpacing: "-0.01em",
          }}
        >
          {seg.desc}
        </p>
        <button
          onClick={() => onNavigate(seg.view)}
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
          {seg.cta} →
        </button>
      </div>

      {/* Visual panel column */}
      <div style={{ order: contentFirst ? 2 : 1 }}>
        <StatPanel seg={seg} />
      </div>
    </div>
  );
}


// ── Page ─────────────────────────────────────────────────────────────────────
// accent = dc.dark: midnight nav + footer, cream body — Solutions' own identity.
// No 3-step band. No generic HeroProof. Alternating segment list IS the page.
export default function SolutionsPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Who We Serve | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.dark}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* Page-scoped CSS: mobile stacking for the so-feat alternating grid.
          On ≤900 px the grid collapses to 1 col; order resets so text leads. */}
      <style>{`
        @media (max-width: 991px) {
          .so-feat { grid-template-columns: 1fr !important; }
          .so-feat > * { order: unset !important; }
        }
      `}</style>

      {/* ── HERO — midnight dark, "Who we serve" eyebrow, large h1 ─────────── */}
      {/* No HeroProof — this is an audience-routing page, not a live tool */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px,9vh,128px) ${dc.pad}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "flex-start",
            gap: "clamp(28px,4vw,48px)",
            minHeight: "clamp(280px,38vh,420px)",
            justifyContent: "space-between",
          }}
        >
          <div id="gs-hero-content">
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
              Who we serve
            </div>
            <H1 style={{ margin: 0, maxWidth: "15ch" }}>
              Find your workflow
            </H1>
          </div>
          <Lead
            style={{
              color: "rgba(238,239,211,0.72)",
              maxWidth: "44ch",
              margin: 0,
            }}
          >
            DSCR loans let rental-property owners qualify on the property's rent —
            not their personal income. Whether you're a broker placing a file,
            an investor underwriting your first rental, or a fund managing a
            blanket line, Greenstreet has a purpose-built workflow. All tools run
            off the same deterministic math.
          </Lead>
        </div>
      </section>

      {/* ── ALTERNATING AUDIENCE SEGMENT FEATURE ROWS — the centerpiece ──────── */}
      {/* Each row: text ↔ stat panel alternates left/right per mockup.
          Large gap between rows (clamp 56→120px) preserves the editorial pace.
          No numbered steps, no generic band classes — this section IS the page. */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad} clamp(40px,5vw,64px)`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column" as const,
            gap: "clamp(56px,8vw,120px)",
          }}
        >
          {SEGMENTS.map((seg, i) => (
            <SegmentRow key={seg.tag} seg={seg} index={i} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* ── RATE QUIZ + CLOSE — dark band breaks the cream sequence ─────────── */}
      {/* Collapses the two orphan cream sections into a single intentional band */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad}`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px,6vw,96px)",
            alignItems: "center",
          }}
        >
          {/* Left: rate quiz card */}
          <div className="gs-reveal">
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 16,
              }}
            >
              Rate quiz
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 20px",
                color: dc.cream,
              }}
            >
              Just want a rate estimate?
            </h2>
            <p
              style={{
                fontSize: "clamp(16px,1.3vw,19px)",
                fontWeight: 500,
                lineHeight: 1.5,
                color: "rgba(238,239,211,0.65)",
                margin: "0 0 28px",
                letterSpacing: "-0.01em",
                maxWidth: "42ch",
              }}
            >
              Five questions — property type, LTV (how the loan compares to the
              property value), DSCR, FICO, and state. Get a real rate tier and
              your matched Greenstreet program. No email, no credit pull, no pitch.
            </p>
            {/* ONE dominant lemon primary per contract */}
            <button
              onClick={() => onNavigate("rate-quiz")}
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
                padding: "16px 28px",
                borderRadius: dc.r.md,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                minHeight: 44,
              }}
            >
              Get my rate in 5 questions →
            </button>
          </div>

          {/* Right: explore nav */}
          <div className="gs-reveal" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: "rgba(238,239,211,0.45)",
                marginBottom: 4,
              }}
            >
              Explore further
            </div>
            <button
              onClick={() => onNavigate("marketing")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                border: `1.5px solid ${dc.faded}`,
                borderRadius: dc.r.pill,
                padding: "14px 26px",
                cursor: "pointer",
                fontFamily: dc.sans,
                minHeight: 44,
                alignSelf: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: dc.cream,
                }}
              >
                Explore all tools →
              </span>
            </button>
            <button
              onClick={() => onNavigate("products")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                border: `1.5px solid ${dc.faded}`,
                borderRadius: dc.r.pill,
                padding: "14px 26px",
                cursor: "pointer",
                fontFamily: dc.sans,
                minHeight: 44,
                alignSelf: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: dc.cream,
                }}
              >
                Full product catalog →
              </span>
            </button>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
