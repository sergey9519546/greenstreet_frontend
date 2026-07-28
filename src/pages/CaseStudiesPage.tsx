import React, { useEffect, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";

// ── Representative borrower stories ──────────────────────────────────────────
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
  /** Product-journey takeaway, not a customer quote or endorsement. */
  quote: string;
  program: string;
}

const STUDIES: Study[] = [
  {
    slug: "vela-capital",
    company: "Renee Carter",
    location: "Four-property refinance",
    type: "Portfolio investor",
    num: "01",
    headline: "Bringing four refinance requests into one consistent borrower brief.",
    metrics: [
      { v: "4", k: "Rental properties" },
      { v: "$1.1M", k: "Combined requested balance" },
      { v: "Refi", k: "Loan purpose" },
    ],
    challenge:
      "Renee is comparing rate-and-term refinance options across four rentals. Each property has a different balance, rent, payment, and expense profile, so she needs to keep the facts separate while seeing the portfolio together.",
    solution:
      "She enters each property's current balance, estimated value, rent, payment assumptions, and requested loan amount, then carries the same core facts into a preliminary loan request.",
    result:
      "The connected brief keeps four property records and their modeled coverage visible without implying a quote, program match, approval, or provider response.",
    quote:
      "Renee's decision point is which properties are ready for a financing conversation and which assumptions still need documentation.",
    program: "Portfolio refinance journey",
  },
  {
    slug: "northshore-non-qm",
    company: "Jason Kim",
    location: "First rental purchase",
    type: "Rental-property buyer",
    num: "02",
    headline: "Checking whether one rental's income covers the full modeled payment.",
    metrics: [
      { v: "$425K", k: "Purchase price" },
      { v: "75%", k: "Requested LTV" },
      { v: "1.11x", k: "Modeled DSCR" },
    ],
    challenge:
      "Jason has a single-family rental under contract. He wants to compare $3,000 in monthly rent with principal, interest, taxes, insurance, and HOA before deciding whether to continue.",
    solution:
      "He uses the deal analyzer to enter the purchase price, down payment, rent, rate, and property costs, then reviews both payment coverage and pre-tax cash flow.",
    result:
      "The modeled 1.11x DSCR comes directly from the displayed assumptions. It is a starting point for a preliminary request, not proof of eligibility or cash-flow performance.",
    quote:
      "Jason can see exactly which rent and payment inputs move the ratio before he shares contact information.",
    program: "Single-rental purchase journey",
  },
  {
    slug: "quintero-co",
    company: "Sofia Alvarez",
    location: "Entity purchase",
    type: "Foreign-national investor",
    num: "03",
    headline: "Surfacing entity and documentation questions before sensitive files are exchanged.",
    metrics: [
      { v: "Entity", k: "Intended vesting" },
      { v: "Purchase", k: "Loan purpose" },
      { v: "Verify", k: "Document path" },
    ],
    challenge:
      "Sofia is investing through an entity from outside the United States. She needs ownership, signing-authority, reserve, identity, and property questions identified early without uploading sensitive documents to a public calculator.",
    solution:
      "She organizes the property and requested-loan facts, uses the state checklist to record what requires current verification, and keeps identity and banking documents outside the public intake.",
    result:
      "The journey ends with a clearer question set for a responsible provider. It does not assume foreign-national eligibility, accepted documentation, legal conclusions, or financing terms.",
    quote:
      "Sofia's next step is to confirm which entity, identity, reserve, and property documents the actual provider will require.",
    program: "Foreign-national purchase journey",
  },
];

const AURORA_STORY = {
  slug: "aurora",
  company: "Malik Thompson",
  location: "Six-property portfolio",
  type: "Portfolio investor",
  num: "04",
  headline: "Reviewing six rental properties without losing the property-level detail.",
  metrics: [
    { v: "6", k: "Rental properties" },
    { v: "$1.8M", k: "Entered balances" },
    { v: "1", k: "Portfolio summary" },
  ],
  challenge:
    "Malik wants one view of six rentals while retaining each property's rent, balance, value, rate, payment, and modeled coverage.",
  solution:
    "He enters each property separately and uses the portfolio model to calculate aggregate value, debt, equity, rent, payment, weighted rate, and blended DSCR.",
  result:
    "The consolidated arithmetic highlights which property inputs drive the portfolio totals and prepares a cleaner starting point for a preliminary request.",
  quote:
    "Malik can compare the portfolio total with the individual property rows before deciding what to discuss with a provider.",
  program: "Portfolio review journey",
};

const ALL_STUDIES = [AURORA_STORY, ...STUDIES];

// No logos are used for representative personas. The render is still gated on
// `LOGOS[s.slug]` so the page cannot imply a real customer affiliation.
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
@media (max-width: 700px) {
  .dc-hero, .dc-band-2, .dc-band-3 { grid-template-columns: 1fr !important; }
  .dc-hero { min-height: 0 !important; }
  .dc-band-3 { gap: 12px !important; }
  .cs-line { display: none; }
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
          Representative borrower · {s.type} · {s.location}
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
          Read the full story →
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
    document.title = `${s.company} | Borrower Story | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [s.slug]);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Borrower Stories", view: "case-studies" },
        { label: "Portfolio", view: "portfolio" },
      ]}
      cta={{ label: "Apply for a loan →", view: "book-demo" }}
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
              ← All borrower stories
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
            ["Connected workflow", s.solution],
            ["What becomes clearer", s.result],
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

          {/* Representative product-journey takeaway, not a customer testimonial. */}
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
                fontStyle: "normal",
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
              Representative journey takeaway · {s.program}
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
              Move your property forward
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
              Enter the property and requested-loan details to see a preliminary
              DSCR estimate and continue into a loan request. Final eligibility,
              pricing, and terms require review.
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
                Start my loan request →
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
      document.title = "Borrower Stories | Greenstreet Finance";
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
      cta={{ label: "Apply for a loan →", view: "book-demo" }}
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
                Representative borrower stories
              </div>
              <H1 style={{ margin: 0 }}>
                See how different borrowers move from property facts to a loan request.
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
                Four representative personas with specific financing goals,
                property facts, and next steps. They are product stories—not
                customer reviews, endorsements, approvals, or reported outcomes.
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
                Model your property →
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
              Borrower starting points
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { label: "Portfolio refinance", value: "4 rentals" },
                { label: "Single-rental purchase", value: "$425K" },
                { label: "Entity purchase", value: "Verify" },
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
              Representative inputs, not customer outcomes. See each journey below.
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
              How each journey connects
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
              Three steps: enter the property facts, inspect the calculation,
              then carry the useful inputs into a preliminary loan request.
              Final programs, terms, and eligibility require confirmation.
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
                  heading: "Separate calculations from facts that need a source.",
                  body: "The calculator shows its arithmetic and assumptions. Provider rules, state-law conclusions, and transaction facts still require current primary sources and qualified review.",
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

      {/* ── BORROWER STORY ROWS ───────────────────────────────────────────── */}
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
            Representative borrowers and the decisions they need to make.
          </h2>

          {/* Representative-persona disclaimer */}
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
              These are fictional representative personas, not customer reviews
              or endorsements. Their entered figures illustrate how the tools
              connect; no approval, pricing, closing, or provider response is implied.
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
