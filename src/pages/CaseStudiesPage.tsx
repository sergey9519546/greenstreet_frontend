import React, { useEffect, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";

// ── Case studies data (kept from existing page, framed as illustrative) ────────
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
    company: "Vela Capital",
    location: "Wholesale originator",
    type: "Originator",
    num: "01",
    headline: "From 25 minutes per file to 6. Same team, 4× the throughput.",
    metrics: [
      { v: "4×", k: "Throughput increase" },
      { v: "6 min", k: "Decision per file (was 25)" },
      { v: "120+", k: "DSCR files / month" },
    ],
    challenge:
      "Running 120+ DSCR files a month through eight brokers. Every file meant two spreadsheets rebuilt by hand — one showing what the lender would approve, another showing what the deal would actually return after vacancy and management fees. The underwriting desk had become the ceiling.",
    solution:
      "Every file moved to Greenstreet's Dual-Track engine. Track 1 returns the lender-qualifying DSCR the moment the file lands. Track 2 stress-tests investor survival with vacancy, management, and CapEx in the same pass — no second spreadsheet. The right program surfaces automatically. One application, one set of conditions.",
    result:
      "Decision time dropped from 25 minutes to 6 per file. The team scaled 4× across the same eight originators without adding a single underwriter.",
    quote:
      "Greenstreet surfaced a 1.11x DSCR pass and had us rate-locked fast. We stopped running parallel Excel models the same week.",
    program: "DSCR 1-4 Standard",
  },
  {
    slug: "northshore-non-qm",
    company: "Northshore Non-QM",
    location: "Wholesale brokerage",
    type: "Broker",
    num: "02",
    headline: "Same-day rate lock — and Track 2 caught the deal that should have died.",
    metrics: [
      { v: "7", k: "Programs, one application" },
      { v: "Same-day", k: "Rate lock" },
      { v: "12%", k: "Vacancy gap caught by Track 2" },
    ],
    challenge:
      "Brokers were chasing two outside quotes per loan — not because they wanted to, but because checking more lenders meant logging into more portals and re-keying the same file. Pipeline lived in scattered spreadsheets. The Track 2 question — what does the investor actually earn after vacancy? — almost never made it into the conversation.",
    solution:
      "One file runs through Greenstreet and routes to the best-fit program — DSCR 1–4, multi-family, or foreign national — in a single pass. Dual-Track DSCR runs on every quote automatically, so a vacancy gap that would sink a deal surfaces before the number ever reaches the borrower.",
    result:
      "Brokers stopped chasing outside quotes and started locking same-day. On one file that sailed through Track 1 at a clean 1.18x, Track 2 caught a 12% effective vacancy gap and killed it at the desk — before appraisal, before earnest money, before the borrower knew anything was wrong.",
    quote:
      "Dual-Track saved a deal our own policy would have waved through. Track 2 caught a 12% vacancy gap before it ever reached the borrower.",
    program: "DSCR Multi / 1-4",
  },
  {
    slug: "quintero-co",
    company: "Quintero & Co.",
    location: "Buy-and-hold investor",
    type: "Investor",
    num: "03",
    headline: "Three appraisals they never paid for. $14,800 in hard costs saved at the desk.",
    metrics: [
      { v: "3", k: "Deals killed pre-appraisal" },
      { v: "$14,800", k: "Hard costs avoided" },
      { v: "3 min", k: "ITIN approval on Global program" },
    ],
    challenge:
      "Discovering deals were marginal only after the appraisal was ordered. On paper the rent covered the payment. In reality, vacancy and management quietly pushed the property underwater on Track 2. Paying $3,000–7,000 per appraisal to get bad news that could have come on day one.",
    solution:
      "Run Track 2 — Investor Survival DSCR — before spending a dollar on diligence. Deals that pass Track 1 but fail Track 2 get walked away from at the desk, not at the closing table. For ITIN borrowers, Greenstreet's Global program takes a passport plus alternative credit and funds in-house.",
    result:
      "Three deals that would have failed post-appraisal were killed pre-appraisal, saving $14,800 in hard costs. A foreign-national ITIN file that previously took a week to get a straight answer was approved on Greenstreet's Global program in under three minutes.",
    quote:
      "Foreign-national ITIN flow used to take a week. Greenstreet's Global program approved us fast — and Track 2 stopped us from buying three appraisals we'd have regretted.",
    program: "DSCR Global",
  },
];

// Aurora entry — kept from prior design mentions, no logo referenced
const AURORA_STORY = {
  slug: "aurora",
  company: "Aurora",
  location: "Portfolio operator",
  type: "Portfolio",
  num: "04",
  headline: "One blended view of 40 doors got the blanket line approved.",
  metrics: [
    { v: "$18M", k: "Blanket line approved" },
    { v: "1.11x", k: "Blended DSCR" },
    { v: "1 wk", k: "To approval" },
  ],
  challenge:
    "Submitting properties one-at-a-time to lenders with no consolidated view. Each property evaluated in isolation — the portfolio's true debt-service strength was invisible.",
  solution:
    "The portfolio tool showed blended DSCR, aggregate equity, and weighted rate across all 40 properties in a single view — the same format lenders actually underwrite blanket lines against.",
  result:
    "The lender approved the blanket line in a week. No more one-at-a-time submissions.",
  quote:
    "One blended view replaced a spreadsheet stack that took two days to compile. The lender saw exactly what they needed.",
  program: "DSCR Portfolio / Blanket",
};

const ALL_STUDIES = [AURORA_STORY, ...STUDIES];

// Logo map — only logos that exist under /img/logos/
const LOGOS: Record<string, string> = {
  "vela-capital": "/img/logos/cs-vela-capital.png",
  "northshore-non-qm": "/img/logos/cs-northshore-nonqm.png",
  "quintero-co": "/img/logos/cs-quintero-co.png",
};

// ── CSS for SVG stroke-draw animation ──────────────────────────────────────────
// Each path gets a known approximate length set as strokeDasharray/strokeDashoffset.
// When the wrapper gains .cs-anim-active, the offsets animate to 0 (draw effect).
// No GSAP needed — pure CSS keyframes, triggered once via IntersectionObserver.
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
/* Nodes fade-in after lines draw */
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

// ── Animated SVG line diagram — stroke-draw on scroll-enter ────────────────────
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

  // Approximate path lengths for stroke-dasharray/offset:
  // line1 (vertical 240,92→240,208): ~116px
  // line2 (vertical 240,272→240,388): ~116px
  // r1 cubic (208,60 → 80,240): ~280px
  // r2 cubic (272,60 → 400,240): ~280px
  // r3 cubic (208,240 → 80,420): ~280px
  // r4 cubic (272,240 → 400,420): ~280px

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <style>{CS_LINE_CSS}</style>
      <svg
        viewBox="0 0 480 480"
        style={{ width: "100%", display: "block" }}
        fill="none"
        aria-hidden="true"
      >
        {/* Radiating curves — draw first, slower */}
        <path
          className="cs-line"
          d="M 208,60 C 80,60 80,240 80,240"
          stroke={dc.dark} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.1s",
                   strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties}
        />
        <path
          className="cs-line"
          d="M 272,60 C 400,60 400,240 400,240"
          stroke={dc.dark} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.2s",
                   strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties}
        />
        <path
          className="cs-line"
          d="M 208,240 C 80,240 80,420 80,420"
          stroke={dc.rain} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.6s",
                   strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties}
        />
        <path
          className="cs-line"
          d="M 272,240 C 400,240 400,420 400,420"
          stroke={dc.rain} strokeWidth="1.5" opacity="0.35"
          style={{ "--cs-len": "280px", "--cs-dur": "1.3s", "--cs-delay": "0.7s",
                   strokeDasharray: 280, strokeDashoffset: 280 } as React.CSSProperties}
        />

        {/* Spine connectors — draw after curves */}
        <path
          className="cs-line"
          d="M 240,92 L 240,208"
          stroke={dc.dark} strokeWidth="2" strokeDasharray="8 4"
          style={{ "--cs-len": "116px", "--cs-dur": "0.7s", "--cs-delay": "0.45s",
                   strokeDashoffset: 116 } as React.CSSProperties}
        />
        <path
          className="cs-line"
          d="M 240,272 L 240,388"
          stroke={dc.rain} strokeWidth="2" strokeDasharray="8 4"
          style={{ "--cs-len": "116px", "--cs-dur": "0.7s", "--cs-delay": "0.95s",
                   strokeDashoffset: 116 } as React.CSSProperties}
        />

        {/* End dots — solid, no animation */}
        <circle cx="80" cy="240" r="5" fill="rgba(0,55,56,0.3)" />
        <circle cx="400" cy="240" r="5" fill="rgba(0,55,56,0.3)" />
        <circle cx="80" cy="420" r="5" fill="rgba(0,101,101,0.3)" />
        <circle cx="400" cy="420" r="5" fill="rgba(0,101,101,0.3)" />

        {/* Node circles — fade in after spine draws */}
        <circle className="cs-node" cx="240" cy="60" r="32" fill={dc.dark}
          style={{ "--cs-ndelay": "0.05s" } as React.CSSProperties} />
        <circle className="cs-node" cx="240" cy="240" r="32" fill={dc.rain}
          style={{ "--cs-ndelay": "0.5s" } as React.CSSProperties} />
        <circle className="cs-node" cx="240" cy="420" r="32" fill={dc.lemon}
          style={{ "--cs-ndelay": "1.05s" } as React.CSSProperties} />

        {/* Node labels — always on top */}
        <text x="240" y="65" textAnchor="middle" fill={dc.lemon} fontFamily={dc.mono} fontSize="12" fontWeight="700">01</text>
        <text x="240" y="245" textAnchor="middle" fill={dc.cream} fontFamily={dc.mono} fontSize="12" fontWeight="700">02</text>
        <text x="240" y="425" textAnchor="middle" fill={dc.dark} fontFamily={dc.mono} fontSize="12" fontWeight="700">03</text>
      </svg>
    </div>
  );
}

// ── Metric chip ─────────────────────────────────────────────────────────────────
function MetricChip({ v, k }: StudyMetric) {
  return (
    <div>
      <Mono
        style={{
          display: "block",
          fontSize: "clamp(22px,2.4vw,32px)",
          fontWeight: 600,
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

// ── Study list row (dark band) ──────────────────────────────────────────────────
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
      className="gs-reveal dc-band-2"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: "clamp(28px,4vw,64px)",
        background: dc.dark,
        padding: "clamp(36px,4vw,56px) 0",
        borderBottom: isLast ? "none" : "1px solid rgba(238,239,211,0.1)",
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
          {/* Logo if available */}
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
              fontSize: "clamp(24px,2.6vw,36px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: dc.cream,
              lineHeight: 1.08,
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
          {s.company} · {s.type} · {s.location}
        </div>
      </div>

      {/* Right column */}
      <div>
        <p
          style={{
            fontSize: "clamp(17px,1.4vw,21px)",
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
          onClick={() => (window.history.pushState({},'',`/case-studies/${s.slug}`),window.dispatchEvent(new PopStateEvent('popstate')))}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: dc.emerald,
            letterSpacing: "-0.01em",
            fontFamily: dc.sans,
          }}
        >
          Read the deal →
        </button>
      </div>
    </div>
  );
}

// ── Detail view ─────────────────────────────────────────────────────────────────
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
        { label: "Lender Intel", view: "lender-intel" },
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
              ← All case studies
            </button>
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
          className="gs-reveal dc-band-3"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: `repeat(${s.metrics.length}, 1fr)`,
            gap: 1,
            background: "rgba(0,55,56,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(0,55,56,0.1)",
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
                    ? "1px solid rgba(0,55,56,0.1)"
                    : "none",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(28px,3.2vw,44px)",
                  fontWeight: 600,
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
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
          }}
        >
          {[
            ["The Challenge", s.challenge],
            ["The Solution", s.solution],
            ["The Result", s.result],
          ].map(([heading, body]) => (
            <div
              key={heading}
              className="gs-reveal"
              style={{ marginBottom: 32 }}
            >
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

          {/* Illustrative quote block */}
          <div
            className="gs-reveal"
            style={{
              borderLeft: `3px solid ${dc.lemon}`,
              padding: "18px 28px",
              margin: "40px 0",
              background: dc.mintBg,
              borderRadius: "0 8px 8px 0",
            }}
          >
            <p
              style={{
                fontSize: "clamp(18px,1.6vw,22px)",
                fontStyle: "italic",
                fontWeight: 500,
                lineHeight: 1.45,
                color: dc.dark,
                margin: "0 0 12px",
              }}
            >
              "{s.quote}"
            </p>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: dc.rain,
                fontStyle: "normal",
              }}
            >
              — {s.company} team · {s.program}
            </div>
          </div>

          {/* CTA card */}
          <div
            className="gs-reveal"
            style={{
              background: dc.dark,
              borderRadius: 12,
              padding: "clamp(28px,3.5vw,44px)",
              marginTop: 48,
              border: "1px solid rgba(238,239,211,0.12)",
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
              Run your own file
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
              The same engine. Free. No account required. Open a deal and see
              what the math says.
            </p>
            <button
              onClick={() => onNavigate("deal-analyzer")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: dc.lemon,
                color: dc.dark,
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
              Open the Deal Analyzer →
            </button>
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ── Page root ───────────────────────────────────────────────────────────────────
export default function CaseStudiesPage({
  onBack,
  onNavigate,
  path,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
  path?: string;
}) {
  // Route to detail if a slug is embedded in the path prop (key={pathname} compat)
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

  // ── Detail route ──
  if (study) {
    return (
      <StudyDetail
        s={study}
        onBack={() => onNavigate("case-studies")}
        onNavigate={onNavigate}
      />
    );
  }

  // ── List route ──
  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.dark}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Run a deal →", view: "dscr-calculator" }}
    >
      {/* ── HERO: solid dark, eyebrow + h1, no image-slot ── */}
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
          <div id="gs-hero-content" style={{ display: "flex", flexDirection: "column", gap: "clamp(24px,3vw,40px)", justifyContent: "center" }}>
            <div>
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
                Customer stories
              </div>
              <H1 style={{ margin: 0 }}>
                Real results.
              </H1>
            </div>
            <div>
              <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "40ch", margin: "0 0 32px" }}>
                Brokers and investors who switched to Greenstreet — and what
                changed for them.
              </Lead>
              <Btn label="Try it yourself" onClick={() => onNavigate("dscr-calculator")} />
            </div>
          </div>

          {/* Right: branded solid panel — replaces "drop a screenshot" slot */}
          <div
            style={{
              background: dc.teal,
              borderRadius: 12,
              border: "1px solid rgba(238,239,211,0.1)",
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
                { label: "Same-day rate lock", value: "Yes" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderBottom: "1px solid rgba(238,239,211,0.1)",
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
                      fontWeight: 600,
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

      {/* ── PRICE / MATCH / PROVE band: animated SVG + 3-panel copy ── */}
      {/* Signature centerpiece: greengo_lineanim — the workflow that makes every case study possible */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad}`,
          borderTop: `4px solid ${dc.dark}`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
          }}
        >
          {/* Section eyebrow label */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: dc.rain,
              marginBottom: "clamp(32px,4vw,56px)",
              paddingBottom: 12,
              borderBottom: `1px solid rgba(0,55,56,0.15)`,
            }}
          >
            How it works — Price · Match · Prove
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(240px,40%,480px) 1fr",
              gap: "clamp(36px,5vw,72px)",
              alignItems: "center",
            }}
          >
          {/* Animated stroke-draw SVG */}
          <PriceMatchProveDiagram />

          {/* 3-panel content */}
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
                body: "Enter seven numbers. Get DSCR, PITIA, cash flow, lender match — in under a minute.",
              },
              {
                step: "Match",
                stepColor: dc.rain,
                heading: "Match lenders before you pick up the phone.",
                body: "19 program boxes ranked by fit — FICO floors, LTV caps, state rules — no cold calls.",
              },
              {
                step: "Prove",
                stepColor: "#9a7b00",
                heading: "Prove every number with a cited source.",
                body: "IC memo, state PPP rule, stress matrix — all traceable to a statute. No black box.",
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
                    opacity: item.step === "Price" ? 0.55 : item.step === "Match" ? 0.75 : 1,
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

      {/* ── CASE STUDY ROWS ── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad} clamp(40px,5vw,64px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2
            className="gs-reveal"
            style={{
              fontSize: "clamp(28px,3.4vw,46px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: dc.cream,
              margin: `0 0 clamp(48px,6vw,72px)`,
            }}
          >
            What changed for our customers.
          </h2>

          {/* Illustrative disclaimer — FTC §5 / Reg Z compliance */}
          <div
            className="gs-reveal"
            style={{
              marginBottom: "clamp(32px,4vw,52px)",
              padding: "12px 18px",
              background: "rgba(238,239,211,0.06)",
              borderRadius: 6,
              border: "1px solid rgba(238,239,211,0.1)",
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
              Illustrative composite scenarios based on real deal patterns.
              Company names are representative examples, not verified named
              customers. Individual results will vary.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              background: "rgba(238,239,211,0.1)",
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

      {/* ── CTA STRIP ── */}
      <section
        style={{
          background: dc.dark,
          padding: `0 ${dc.pad} clamp(72px,10vh,120px)`,
        }}
      >
        <div
          className="gs-reveal"
          style={{ maxWidth: dc.maxW, margin: "0 auto", textAlign: "center" }}
        >
          <button
            onClick={() => onNavigate("dscr-calculator")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: dc.lemon,
              borderRadius: 8,
              padding: "15px 32px",
              border: "none",
              cursor: "pointer",
              fontFamily: dc.sans,
              minHeight: 52,
            }}
          >
            <span
              style={{
                fontSize: "clamp(15px,1.4vw,18px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: dc.dark,
              }}
            >
              Run your own deal
            </span>
            <span style={{ fontSize: 18, color: dc.dark }}>→</span>
          </button>
        </div>
      </section>
    </DcShell>
  );
}
