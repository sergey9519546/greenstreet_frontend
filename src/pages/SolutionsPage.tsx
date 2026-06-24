import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

// ── Audience segments (from Solutions.dc.html renderVals, alternating layout) ──
interface Segment {
  tag: string;
  title: string;
  desc: string;
  cta: string;
  view: string;
  // visual panel colours — solid fills, 1px borders only, no blur/glow
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
    desc: "Run a deal in seconds, hand the borrower a defensible rate band, and match to the right program before you ever call a lender.",
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
    title: "Underwrite like an institution",
    desc: "After-tax IRR, stress-tested rate paths and a sensitivity matrix — the analysis a fund runs, on your own deals.",
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
    desc: "Blended DSCR, aggregate equity and weighted rate across every door — the way a blanket lender actually sees your portfolio.",
    cta: "Open the portfolio builder",
    view: "lender-intel",
    panelBg: dc.rain,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.60)",
    gridline: "rgba(238,239,211,0.14)",
    statBg: "#005152",
    stats: [
      { v: "$25M", k: "blanket lines" },
      { v: "1.49×", k: "blended DSCR" },
      { v: "40+", k: "doors modeled" },
      { v: "1", k: "relationship" },
    ],
  },
  {
    tag: "Lenders & Partners",
    title: "Provenance you can defend at exam",
    desc: "Every rule traces to a citation. Hand a regulator the matrix, the state rule and the IC memo as collateral.",
    cta: "See the lender dashboard",
    view: "lender-intel",
    panelBg: dc.lemon,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.60)",
    gridline: "rgba(0,55,56,0.12)",
    statBg: "#e3e463",
    stats: [
      { v: "17a-4", k: "WORM compliant" },
      { v: "100%", k: "cited rules" },
      { v: "IC", k: "memo output" },
      { v: "0", k: "LLM in math" },
    ],
  },
];

// ── Stat panel — solid fills, flat 1px grid, no blur/glow ─────────────────────
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
          <div
            key={st.k}
            style={{
              background: seg.statBg,
              padding: "18px 16px",
            }}
          >
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

// ── Segment row — alternating content/visual order ────────────────────────────
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
      className="gs-reveal dc-band-2"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(32px,5vw,80px)",
        alignItems: "center",
      }}
    >
      {/* Content column */}
      <div style={{ order: contentFirst ? 1 : 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
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
            background: dc.dark,
            color: dc.cream,
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

// ── "Just want a rate?" card — intentionally informal, preserved from existing ─
function RateQuizCard({ onNavigate }: { onNavigate: (v: string) => void }) {
  return (
    <div
      className="gs-reveal"
      style={{
        background: dc.lemon,
        border: "1px solid rgba(0,55,56,0.12)",
        borderRadius: 9,
        padding: "clamp(28px,3.5vw,44px)",
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
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
        }}
      >
        Rate quiz
      </div>
      <h2
        style={{
          fontSize: "clamp(24px,2.8vw,38px)",
          fontWeight: 600,
          letterSpacing: "-0.035em",
          lineHeight: 1.05,
          margin: 0,
          color: dc.dark,
        }}
      >
        Just want a rate?
      </h2>
      <p
        style={{
          fontSize: "clamp(16px,1.3vw,19px)",
          fontWeight: 500,
          lineHeight: 1.5,
          color: "rgba(0,55,56,0.7)",
          margin: 0,
          letterSpacing: "-0.01em",
          maxWidth: "52ch",
        }}
      >
        Five questions. A real rate tier and your matched Greenstreet program. No email, no credit pull, no pitch.
      </p>
      <button
        onClick={() => onNavigate("rate-quiz")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: dc.dark,
          color: dc.cream,
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          padding: "13px 26px",
          borderRadius: 6,
          fontFamily: dc.sans,
          letterSpacing: "-0.01em",
          marginTop: 4,
        }}
      >
        Take the rate quiz →
      </button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
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
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* ── HERO — solid dark, eyebrow + large h1, no HeroProof for content page ── */}
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
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                margin: 0,
                maxWidth: "15ch",
              }}
            >
              Built for everyone in the deal
            </h1>
          </div>
          <p
            style={{
              fontSize: "clamp(19px,1.9vw,28px)",
              fontWeight: 500,
              lineHeight: 1.35,
              letterSpacing: "-0.025em",
              color: "rgba(238,239,211,0.72)",
              maxWidth: "40ch",
              margin: 0,
            }}
          >
            Brokers, investors, funds and lenders all work off the same provenance-tracked math.
          </p>
        </div>
      </section>

      {/* ── ALTERNATING AUDIENCE SEGMENT FEATURE ROWS ── */}
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
            <SegmentRow
              key={seg.tag}
              seg={seg}
              index={i}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* ── RATE QUIZ CARD ── */}
      <section
        style={{
          background: dc.cream,
          padding: `0 ${dc.pad} clamp(72px,10vh,120px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <RateQuizCard onNavigate={onNavigate} />
        </div>
      </section>

      {/* ── EXPLORE ALL TOOLS LINK ── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(32px,4vw,56px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal"
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
              border: "1px solid rgba(0,55,56,0.18)",
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
              Explore all tools
            </span>
            <span style={{ fontSize: 18, color: dc.rain }}>→</span>
          </button>
        </div>
      </section>
    </DcShell>
  );
}
