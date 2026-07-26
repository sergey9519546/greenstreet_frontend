import React, { useEffect, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";

// ── Case studies data ─────────────────────────────────────────────────────────
interface StudyMetric {
  v: string;
  k: string;
}

interface Study {
  slug: string;
  company: string;
  location: string;
  type: string;
  num: string;
  headline: string;
  metrics: StudyMetric[];
  challenge: string;
  solution: string;
  result: string;
  /** Illustrative composite quote — not attributed to a verified named individual */
  quote: string;
  program: string;
}

const STUDIES: Study[] = [
  {
    slug: "vela-capital",
    company: "Portfolio operations scenario",
    location: "Buy-and-hold investor",
    type: "Portfolio investor",
    num: "01",
    headline: "Modeling how a repeatable workflow could reduce time per file.",
    metrics: [
      { v: "4×", k: "Throughput increase" },
      { v: "6 min", k: "Decision per file (was 25)" },
      { v: "120+", k: "DSCR files / month" },
    ],
    challenge:
      "Running 120+ DSCR files a month. Every file meant two spreadsheets rebuilt by hand — one showing what qualified, another showing what the deal would actually return after vacancy and management fees. The underwriting desk had become the ceiling on growth.",
    solution:
      "The scenario compares a manual two-spreadsheet process with one shared calculation path. Track 1 estimates lender DSCR while Track 2 adds vacancy, management, and capital-reserve assumptions.",
    result:
      "Under the stated hypothetical timing assumptions, a six-minute review instead of a 25-minute review would represent roughly four times the file throughput. This is arithmetic, not a reported customer result.",
    quote:
      "A shared definition for rent, payment, and operating costs makes the two views easier to compare without rebuilding the scenario in separate spreadsheets.",
    program: "Illustrative 1–4 unit assumptions",
  },
  {
    slug: "northshore-non-qm",
    company: "Active investor scenario",
    location: "Real estate investor",
    type: "Active investor",
    num: "02",
    headline: "Modeling a deal that passes lender DSCR but fails the investor view.",
    metrics: [
      { v: "Same-day", k: "Rate lock" },
      { v: "12%", k: "Vacancy gap caught by Track 2" },
      { v: "1", k: "Application, multiple programs checked" },
    ],
    challenge:
      "Evaluating multiple property types — DSCR 1–4, multi-family — with no single view of how they stacked up. Pipeline lived in scattered spreadsheets. The investor-survival question (what does the deal actually earn after vacancy?) almost never made it into the analysis before money was committed.",
    solution:
      "The scenario calculates lender DSCR and then applies a vacancy assumption in the investor view so the difference is visible before the user relies on the headline ratio.",
    result:
      "In this hypothetical, Track 1 remains above 1.0x while the additional vacancy assumption weakens the investor result. No rate lock or transaction outcome is claimed.",
    quote:
      "The scenario demonstrates why a qualifying ratio should not be presented as proof that a property will cash-flow after operating assumptions.",
    program: "Illustrative multifamily assumptions",
  },
  {
    slug: "quintero-co",
    company: "Global borrower scenario",
    location: "Buy-and-hold investor",
    type: "Investor / Foreign national",
    num: "03",
    headline: "Three appraisals they never paid for. $14,800 in hard costs saved at the desk.",
    metrics: [
      { v: "3", k: "Deals killed pre-appraisal" },
      { v: "$14,800", k: "Hard costs avoided" },
      { v: "3 min", k: "Hypothetical review target" },
    ],
    challenge:
      "Discovering deals were marginal only after the appraisal was ordered. On paper the rent covered the payment. In reality, vacancy and management quietly pushed properties underwater on Track 2. Paying $3,000–7,000 per appraisal to get bad news that could have arrived on day one.",
    solution:
      "The scenario applies the expense-aware Track 2 view before diligence costs are committed. Any foreign-national or ITIN eligibility would require confirmation from the responsible licensed provider.",
    result:
      "If three unsuitable deals each carried the stated diligence costs, screening them earlier could avoid $14,800. This is a hypothetical cost illustration, not an approval or reported savings claim.",
    quote:
      "Early scenario screening can identify which assumptions require lender confirmation before appraisal or other diligence spending.",
    program: "Illustrative global-borrower assumptions",
  },
];

const AURORA_STORY = {
  slug: "aurora",
  company: "Blanket portfolio scenario",
  location: "Portfolio operator",
  type: "Portfolio investor",
  num: "04",
  headline: "Modeling a blended view across a 40-property portfolio.",
  metrics: [
    { v: "$18M", k: "Hypothetical balance" },
    { v: "1.11x", k: "Blended DSCR" },
    { v: "1 wk", k: "Hypothetical review" },
  ],
  challenge:
    "Reviewing properties one at a time makes it difficult to see the portfolio's combined debt-service coverage and concentration assumptions.",
  solution:
    "The illustrative model combines rent and payments across 40 properties to show blended DSCR, aggregate equity, and weighted rate in one view.",
  result:
    "The modeled output shows how a consolidated view could support a preliminary portfolio discussion. It does not claim an approval, closing, or timeline.",
  quote:
    "A consolidated portfolio view makes the assumptions easier to inspect before submission to a qualified provider.",
  program: "Illustrative portfolio assumptions",
};

const ALL_STUDIES = [AURORA_STORY, ...STUDIES];

// Logo map — only logos that exist under /img/logos/. Left empty: none of
// these illustrative case studies have a real logo asset checked in, and the
// render below is already gated on `LOGOS[s.slug]` being truthy, so an empty
// map just skips the logo — no broken-image icon next to a disclosed
// not-a-verified-named-customer case study.
const LOGOS: Record<string, string> = {};

// ── CSS for SVG stroke-draw animation ────────────────────────────────────────
const CS_LINE_CSS = `
@keyframes csLineDraw {
  from { stroke-dashoffset: var(--cs-len); }
  to   { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: no-preference) {
  .cs-anim-active .cs-line {
    animation: csLineDraw var(--cs-dur, 1.1s) var(--cs-delay, 0s) cubic-bezier(.22,.68,0,1.2) forwards;
  }
}
@keyframes csFadeIn {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: no-preference) {
  .cs-anim-active .cs-node {
    animation: csFadeIn 0.4s var(--cs-ndelay, 0s) ease-out forwards;
    opacity: 0;
  }
}
`;

// ── Animated SVG line diagram ─────────────────────────────────────────────────
function PriceMatchProveDiagram() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("cs-anim-active");
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <style>{CS_LINE_CSS}</style>
      <svg
        viewBox="0 0 480 480"
        style={{ width: "100%", display: "block" }}
        fill="none"
        aria-hidden="true"
      >
        <path className="cs-line" d="M 208,60 C 80,60 80,240 80,240" stroke={dc.dark} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.1s", strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties} />
        <path className="cs-line" d="M 272,60 C 400,60 400,240 400,240" stroke={dc.dark} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.2s", strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties} />
        <path className="cs-line" d="M 208,240 C 80,240 80,420 80,420" stroke={dc.rain} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.6s", strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties} />
        <path className="cs-line" d="M 272,240 C 400,240 400,420 400,420" stroke={dc.rain} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.7s", strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties} />
        <path className="cs-line" d="M 240,92 L 240,208" stroke={dc.dark} strokeWidth="2" strokeDasharray="8 4"
          style={{ "--cs-len": "116px", "--cs-dur": "0.7s", "--cs-delay": "0.45s", strokeDashoffset: 116 } as React.CSSProperties} />
        <path className="cs-line" d="M 240,272 L 240,388" stroke={dc.rain} strokeWidth="2" strokeDasharray="8 4"
          style={{ "--cs-len": "116px", "--cs-dur": "0.7s", "--cs-delay": "0.95s", strokeDashoffset: 116 } as React.CSSProperties} />
        <circle cx="80" cy="240" r="5" fill="rgba(0,55,56,0.3)" />
        <circle cx="400" cy="240" r="5" fill="rgba(0,55,56,0.3)" />
        <circle cx="80" cy="420" r="5" fill="rgba(0,101,101,0.3)" />
        <circle cx="400" cy="420" r="5" fill="rgba(0,101,101,0.3)" />
        <circle className="cs-node" cx="240" cy="60" r="32" fill={dc.dark}
          style={{ "--cs-ndelay": "0.05s" } as React.CSSProperties} />
        <circle className="cs-node" cx="240" cy="240" r="32" fill={dc.rain}
          style={{ "--cs-ndelay": "0.5s" } as React.CSSProperties} />
        <circle className="cs-node" cx="240" cy="420" r="32" fill={dc.lemon}
          style={{ "--cs-ndelay": "1.05s" } as React.CSSProperties} />
        <text x="240" y="65" textAnchor="middle" fill={dc.lemon} fontFamily={dc.mono} fontSize="12" fontWeight="700">01</text>
        <text x="240" y="245" textAnchor="middle" fill={dc.cream} fontFamily={dc.mono} fontSize="12" fontWeight="700">02</text>
        <text x="240" y="425" textAnchor="middle" fill={dc.dark} fontFamily={dc.mono} fontSize="12" fontWeight="700">03</text>
      </svg>
    </div>
  );
}

// ── Metric chip ───────────────────────────────────────────────────────────────
function MetricChip({ v, k }: StudyMetric) {
  return (
    <div>
      <Mono
        style={{
          display: "block",
          fontSize: "clamp(22px,2.4vw,32px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: dc.lemon,
        }}
      >
        {v}
      </Mono>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(238,239,211,0.5)",
          marginTop: 3,
          letterSpacing: "-0.01em",
        }}
      >
        {k}
      </div>
    </div>
  );
}

// ── Study list row ────────────────────────────────────────────────────────────
function StudyRow({
  s,
  onNavigate,
  isLast,
}: {
  s: Study;
  onNavigate: (v: string) => void;
  isLast: boolean;
}) {
  return (
    <div
      className="dc-band-2"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: "clamp(28px,4vw,64px)",
        background: dc.dark,
        padding: "clamp(36px,4vw,56px) 0",
        borderBottom: isLast ? "none" : `1px solid ${dc.faded}`,
      }}
    >
      {/* Left column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <Mono
            style={{
              display: "block",
              fontSize: "clamp(40px,5.5vw,80px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: "rgba(238,239,211,0.12)",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {s.num}
          </Mono>
          {LOGOS[s.slug] && (
            <img
              src={LOGOS[s.slug]}
              alt={`${s.company} logo`}
              style={{
                display: "block",
                height: 32,
                width: "auto",
                marginBottom: 14,
                opacity: 0.85,
                filter: "brightness(0) invert(1)",
              }}
            />
          )}
          <h3
            style={{
              fontSize: "clamp(22px,2.4vw,34px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: dc.cream,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {s.headline}
          </h3>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(238,239,211,0.5)",
            letterSpacing: "-0.01em",
          }}
        >
          Illustrative composite · {s.type} · {s.location}
        </div>
      </div>

      {/* Right column */}
      <div>
        <p
          style={{
            fontSize: "clamp(16px,1.3vw,20px)",
            fontWeight: 500,
            lineHeight: 1.6,
            color: "rgba(238,239,211,0.72)",
            margin: "0 0 28px",
            letterSpacing: "-0.01em",
          }}
        >
          {s.result}
        </p>

        {/* Metrics row */}
        <div
          className="dc-band-3"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${s.metrics.length},auto)`,
            gap: "clamp(20px,3vw,40px)",
            justifyContent: "start",
            marginBottom: 24,
          }}
        >
          {s.metrics.map((m) => (
            <MetricChip key={m.k} {...m} />
          ))}
        </div>

        <button
          onClick={() => (window.history.pushState({}, "", `/case-studies/${s.slug}`), window.dispatchEvent(new PopStateEvent("popstate")))}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            color: dc.emerald,
            letterSpacing: "-0.01em",
            fontFamily: dc.sans,
          }}
        >
          Read the full scenario →
        </button>
      </div>
    </div>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────
function StudyDetail({
  s,
  onBack,
  onNavigate,
}: {
  s: Study;
  onBack: () => void;
  onNavigate: (v: string) => void;
}) {
  useEffect(() => {
    document.title = `${s.company} | Case Studies | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [s.slug]);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Case Studies", view: "case-studies" },
        { label: "Portfolio", view: "portfolio" },
      ]}
      cta={{ label: "Run a deal →", view: "dscr-calculator" }}
    >
      {/* Detail hero */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div id="gs-hero-content">
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(238,239,211,0.5)",
                letterSpacing: "-0.01em",
                fontFamily: dc.sans,
                marginBottom: 24,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← All illustrative scenarios
            </button>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 16,
              }}
            >
              {s.type} · {s.location}
            </div>
            {LOGOS[s.slug] && (
              <img
                src={LOGOS[s.slug]}
                alt={`${s.company} logo`}
                style={{
                  display: "block",
                  height: 36,
                  width: "auto",
                  marginBottom: 20,
                  opacity: 0.9,
                  filter: "brightness(0) invert(1)",
                }}
              />
            )}
            <H1 style={{ margin: "0 0 24px", maxWidth: "22ch" }}>
              {s.headline}
            </H1>
          </div>
        </div>
      </section>

      {/* Metrics bar */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(32px,4vw,48px) ${dc.pad}`,
        }}
      >
        <div
          className="dc-band-3"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: `repeat(${s.metrics.length}, 1fr)`,
            gap: 1,
            background: "rgba(0,55,56,0.08)",
            borderRadius: dc.r.md,
            overflow: "hidden",
            border: `1px solid ${dc.faded}`,
          }}
        >
          {s.metrics.map((m, i) => (
            <div
              key={m.k}
              style={{
                background: dc.mintBg,
                padding: "clamp(20px,2.5vw,32px)",
                textAlign: "center",
                borderRight:
                  i < s.metrics.length - 1
                    ? `1px solid ${dc.faded}`
                    : "none",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(28px,3.2vw,44px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: dc.rain,
                }}
              >
                {m.v}
              </Mono>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,55,56,0.6)",
                  marginTop: 4,
                  letterSpacing: "-0.01em",
                }}
              >
                {m.k}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Body */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,80px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {[
            ["The situation", s.challenge],
            ["Modeled approach", s.solution],
            ["Illustrative outcome", s.result],
          ].map(([heading, body]) => (
            <div key={heading} style={{ marginBottom: 32 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: dc.rain,
                  marginBottom: 10,
                }}
              >
                {heading}
              </div>
              <p
                style={{
                  fontSize: "clamp(16px,1.3vw,19px)",
                  fontWeight: 500,
                  lineHeight: 1.7,
                  color: "rgba(0,55,56,0.78)",
                  margin: 0,
                }}
              >
                {body}
              </p>
            </div>
          ))}

          {/* Scenario takeaway — explicitly not a customer testimonial. */}
          <div
            style={{
              padding: "18px 28px",
              margin: "40px 0",
              background: dc.mintBg,
              borderRadius: `0 ${dc.r.sm} ${dc.r.sm} 0`,
              border: `1px solid ${dc.faded}`,
              borderLeft: `3px solid ${dc.lemon}`,
            }}
          >
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,21px)",
                fontStyle: "italic",
                fontWeight: 500,
                lineHeight: 1.45,
                color: dc.dark,
                margin: "0 0 12px",
              }}
            >
              {s.quote}
            </p>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: dc.rain,
                fontStyle: "normal",
              }}
            >
              Illustrative composite takeaway · {s.program}
            </div>
          </div>

          {/* CTA card */}
          <div
            style={{
              background: dc.dark,
              borderRadius: dc.r.md,
              padding: "clamp(28px,3.5vw,44px)",
              marginTop: 48,
              border: `1px solid ${dc.faded}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 12,
              }}
            >
              See if your deal qualifies
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.6,
                color: "rgba(238,239,211,0.65)",
                margin: "0 0 20px",
              }}
            >
              Enter your property's rent and loan details to receive an educational
              DSCR estimate and request a preliminary scenario review. Final
              eligibility and pricing require independent confirmation.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              {/* Dominant lemon CTA */}
              <button
                onClick={() => (window as any).openQualify?.()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: "pointer",
                  padding: "13px 26px",
                  borderRadius: dc.r.md,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                Price my deal now →
              </button>
              {/* Secondary — transparent + 1.5px FADED */}
              <button
                onClick={() => onNavigate("dscr-calculator")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 15,
                  border: `1.5px solid ${dc.faded}`,
                  cursor: "pointer",
                  padding: "13px 24px",
                  borderRadius: dc.r.md,
                  fontFamily: dc.sans,
                  letterSpacing: "-0.01em",
                }}
              >
                Open the DSCR Calculator
              </button>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function CaseStudiesPage({
  onBack,
  onNavigate,
  path,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
  path?: string;
}) {
  const p =
    path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug =
    p && p.startsWith("/case-studies/")
      ? p.replace("/case-studies/", "").replace(/\/$/, "")
      : null;
  const study = slug ? ALL_STUDIES.find((s) => s.slug === slug) : null;

  useEffect(() => {
    if (!study) {
      document.title = "Case Studies | Greenstreet Finance";
      window.scrollTo(0, 0);
    }
  }, [study]);

  if (study) {
    return (
      <StudyDetail
        s={study}
        onBack={() => onNavigate("case-studies")}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.dark}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Portfolio", view: "portfolio" },
        { label: "Products", view: "products" },
      ]}
      cta={{ label: "Run a deal →", view: "dscr-calculator" }}
    >
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
          padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`,
        }}
      >
        <div
          className="dc-hero"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
            minHeight: "clamp(320px,44vh,560px)",
          }}
        >
          {/* Left: hero copy */}
          <div
            id="gs-hero-content"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(24px,3vw,40px)",
              justifyContent: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  color: dc.lemon,
                  marginBottom: 20,
                }}
              >
                Illustrative scenarios
              </div>
              <H1 style={{ margin: 0 }}>
                How DSCR deal assumptions change the outcome.
              </H1>
            </div>
            <div>
              <Lead
                style={{
                  color: "rgba(238,239,211,0.72)",
                  maxWidth: "40ch",
                  margin: "0 0 32px",
                }}
              >
                Four illustrative scenarios — faster decisions, avoided appraisal
                costs, and deals caught before they failed. Each shows the
                assumptions, modeled approach, and hypothetical outcome.
              </Lead>
              {/* Dominant lemon CTA */}
              <button
                onClick={() => onNavigate("dscr-calculator")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: dc.lemon,
                  color: dc.dark,
                  border: 0,
                  borderRadius: 6,
                  padding: "13px 24px",
                  font: "inherit",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Price your deal now →
              </button>
            </div>
          </div>

          {/* Right: outcome panel */}
          <div
            style={{
              background: dc.teal,
              borderRadius: dc.r.lg,
              border: `1px solid ${dc.faded}`,
              padding: "clamp(28px,3.5vw,48px)",
              display: "flex",
              flexDirection: "column",
              gap: 28,
              minHeight: "clamp(280px,38vh,440px)",
              justifyContent: "space-between",
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
              Illustrative outcomes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { label: "Throughput improvement", value: "4×" },
                { label: "Hard costs avoided", value: "$14,800" },
                { label: "Hypothetical screening", value: "Early" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderBottom: `1px solid ${dc.faded}`,
                    paddingBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(238,239,211,0.6)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.label}
                  </span>
                  <Mono
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: dc.cream,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.value}
                  </Mono>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(238,239,211,0.38)",
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
              }}
            >
              Illustrative composite figures. See individual scenarios below.
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW GREENSTREET WORKS band ────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad}`,
          borderTop: `4px solid ${dc.dark}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              marginBottom: "clamp(32px,4vw,56px)",
              paddingBottom: 20,
              borderBottom: "1px solid rgba(0,55,56,0.15)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              How Greenstreet works
            </div>
            <p
              style={{
                color: "rgba(0,55,56,0.65)",
                fontSize: "clamp(15px,1.3vw,17px)",
                fontWeight: 500,
                margin: 0,
                maxWidth: "58ch",
                lineHeight: 1.6,
              }}
            >
              Three steps: enter a scenario, inspect both DSCR views, then use
              the result as the start of a preliminary review. Final programs,
              terms, and eligibility require confirmation.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(240px,40%,480px) 1fr",
              gap: "clamp(36px,5vw,72px)",
              alignItems: "center",
            }}
          >
            <PriceMatchProveDiagram />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "clamp(28px,3.5vw,48px)",
              }}
            >
              {[
                {
                  step: "Price",
                  stepColor: dc.dark,
                  heading: "Price the deal like you already know the answer.",
                  body: "Enter the core property and loan assumptions. Get an educational DSCR, full monthly payment, and expense-aware cash-flow view.",
                },
                {
                  step: "Match",
                  stepColor: dc.rain,
                  heading: "Identify what still needs confirmation.",
                  body: "See which inputs are driving the result and which product, state, or borrower details require review by the responsible provider.",
                },
                {
                  step: "Prove",
                  stepColor: "#9a7b00",
                  heading: "Prove every number with a cited source.",
                  body: "Investment-committee memo, state rule, stress matrix — all traceable to a statute. No black box, no LLM math.",
                },
              ].map((item) => (
                <div key={item.step}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                      color: item.stepColor,
                      marginBottom: 8,
                      opacity:
                        item.step === "Price"
                          ? 0.55
                          : item.step === "Match"
                          ? 0.75
                          : 1,
                    }}
                  >
                    {item.step}
                  </div>
                  <h3
                    style={{
                      fontSize: "clamp(20px,2.2vw,30px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      margin: "0 0 10px",
                      lineHeight: 1.1,
                      color: dc.dark,
                    }}
                  >
                    {item.heading}
                  </h3>
                  <p
                    style={{
                      fontSize: "clamp(14px,1.2vw,17px)",
                      fontWeight: 500,
                      lineHeight: 1.55,
                      color: "rgba(0,55,56,0.65)",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE STUDY ROWS ───────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad} clamp(40px,5vw,64px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(28px,3.4vw,46px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: dc.cream,
              margin: `0 0 clamp(48px,6vw,72px)`,
            }}
          >
            The assumptions, the model, the hypothetical outcomes.
          </h2>

          {/* Illustrative disclaimer */}
          <div
            style={{
              marginBottom: "clamp(32px,4vw,52px)",
              padding: "12px 18px",
              background: "rgba(238,239,211,0.06)",
              borderRadius: dc.r.sm,
              border: `1px solid ${dc.faded}`,
              display: "inline-block",
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(238,239,211,0.45)",
                margin: 0,
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
              }}
            >
              These are constructed teaching examples, not customer histories.
              Names, quotes, figures, approvals, timelines, and outcomes are
              hypothetical. Individual results will vary.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              background: `${dc.faded}`,
            }}
          >
            {ALL_STUDIES.map((s, i) => (
              <StudyRow
                key={s.slug}
                s={s}
                onNavigate={onNavigate}
                isLast={i === ALL_STUDIES.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          padding: `0 ${dc.pad} clamp(72px,10vh,120px)`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 17, fontWeight: 500, color: "rgba(238,239,211,0.65)", maxWidth: "44ch", margin: 0 }}>
            Ready to run your own deal through the same engine?
          </p>
          {/* Dominant lemon CTA */}
          <button
            onClick={() => onNavigate("dscr-calculator")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: dc.lemon,
              color: dc.dark,
              fontWeight: 700,
              fontSize: "clamp(15px,1.4vw,18px)",
              border: "none",
              borderRadius: dc.r.md,
              padding: "16px 32px",
              cursor: "pointer",
              fontFamily: dc.sans,
              letterSpacing: "-0.02em",
              minHeight: 52,
            }}
          >
            Run your own deal →
          </button>
          {/* Secondary */}
          <button
            onClick={() => onNavigate("borrower-profiles")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: "transparent",
              color: dc.cream,
              fontWeight: 600,
              fontSize: 15,
              border: `1.5px solid ${dc.faded}`,
              borderRadius: dc.r.md,
              padding: "13px 24px",
              cursor: "pointer",
              fontFamily: dc.sans,
              letterSpacing: "-0.01em",
            }}
          >
            See all investor profiles
          </button>
        </div>
      </section>
    </DcShell>
  );
}
