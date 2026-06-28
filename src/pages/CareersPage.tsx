import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, ScenePhoto } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { radius } from "../theme";

// ── Open roles (all original descriptions preserved) ─────────────────────────
interface Role {
  title: string;
  team: string;
  location: string;
  type: string;
  body: string;
}

const ROLES: Role[] = [
  {
    title: "Account Executive",
    team: "Sales",
    location: "Remote (US)",
    type: "Full-time",
    body: "You've sold non-QM or DSCR financing to real estate investors before. You can read a rate sheet without squinting and explain DSCR to a skeptical investor in 60 seconds flat. You own the investor relationship from first demo to first funded deal — and you're allergic to commission cliffs.",
  },
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    body: "The Deal Engine prices one file against 7 custom programs in half a second. You'll build the rules engine, harden the math core, and ship the UI that investors reach for every morning. React, TypeScript, server-side arithmetic. You lose sleep when a rounding error slips through.",
  },
  {
    title: "DSCR Underwriting Lead",
    team: "Lending",
    location: "Remote (US)",
    type: "Full-time",
    body: "You've underwritten non-QM files. You read prepay statutes for fun. You can translate a lender rate sheet into a rule set that a machine can execute — and you spot a bad deal structure before anyone else in the room does.",
  },
  {
    title: "Investor Success Lead",
    team: "Customer",
    location: "Remote (US)",
    type: "Full-time",
    body: "You turn new investors into repeat closers. Onboard, guide deal structuring, answer the 10pm question from an investor in the middle of a close. The metric that matters: how fast does their first funded deal become their fifth.",
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote (US)",
    type: "Full-time",
    body: "You're designing tools that investors use when there's real money on the line — DSCR analyzers, program-match flows, deal-summary screens. Every decision you make should make the numbers clearer, faster, and harder to misread.",
  },
  {
    title: "Compliance Counsel",
    team: "Legal",
    location: "Remote (US)",
    type: "Contract",
    body: "The 50-state prepay and usury matrix is only as good as the person updating it. You track state lending statutes as they move and translate new legislation into product rules before anyone gets hurt by the old version.",
  },
];

// ── How we work values (from mockup) ─────────────────────────────────────────
const VALUES = [
  {
    title: "Determinism over vibes",
    desc: "If a number can't be traced to a formula and a source, it doesn't ship.",
  },
  {
    title: "Small team, big surface",
    desc: "Everyone owns a slice of the engine end to end. No ticket-shuffling.",
  },
  {
    title: "Remote, written, async",
    desc: "We default to writing things down. Deep work beats meetings.",
  },
  {
    title: "Investor-first design",
    desc: "Every screen is stress-tested by asking: does this help an investor close a better deal, faster?",
  },
];

// ── Scroll helper ─────────────────────────────────────────────────────────────
function scrollToJobs(e: React.MouseEvent) {
  e.preventDefault();
  const el = document.querySelector("#cr-jobs");
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
}

// ── Accordion row for a single role ──────────────────────────────────────────
function RoleRow({ role, isOpen, onToggle }: { role: Role; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="cr-job"
      style={{
        background: isOpen ? dc.dark : dc.white,
        borderRadius: radius.md,
        border: `1.5px solid ${isOpen ? `${dc.dark}40` : `${dc.dark}20`}`,
        overflow: "hidden",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {/* Row header */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 24,
          alignItems: "center",
          width: "100%",
          background: "none",
          border: "none",
          padding: "26px 30px",
          cursor: "pointer",
          fontFamily: dc.sans,
          textAlign: "left",
        }}
      >
        <span
          className="cr-jt"
          style={{
            fontSize: "clamp(17px,2vw,22px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: isOpen ? dc.cream : dc.dark,
          }}
        >
          {role.title}
        </span>
        <span
          className="cr-jm"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: isOpen ? "rgba(238,239,211,0.6)" : "rgba(0,55,56,0.55)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {role.team} · {role.location} · {role.type}
        </span>
        <span
          className="cr-ja"
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: isOpen ? dc.lemon : dc.rain,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div
          style={{
            padding: "0 30px 26px",
            borderTop: "1px solid rgba(238,239,211,0.12)",
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.65,
              color: "rgba(238,239,211,0.75)",
              margin: "18px 0 20px",
              letterSpacing: "-0.01em",
              maxWidth: "68ch",
            }}
          >
            {role.body}
          </p>
          <a
            href="mailto:careers@greenstreetfinance.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: dc.lemon,
              color: dc.dark,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              padding: "11px 22px",
              borderRadius: radius.sm,
              letterSpacing: "-0.01em",
              fontFamily: dc.sans,
            }}
          >
            Apply for this role →
          </a>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CareersPage({
  onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate?: (v: any) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Careers | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "State Rules", view: "state-laws" },
        { label: "FAQ", view: "faq" },
      ]}
      cta={{ label: "See openings →", onClick: scrollToJobs }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(64px,9vh,128px) ${dc.pad} clamp(56px,7vh,88px)`,
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div id="gs-hero-content">
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(0,55,56,0.55)",
                marginBottom: 22,
                letterSpacing: "-0.01em",
              }}
            >
              Careers
            </div>
            <H1 style={{ margin: "0 0 20px", maxWidth: "17ch" }}>
              Build the math layer of real-estate lending.
            </H1>
            <Lead style={{ color: "rgba(0,55,56,0.68)", maxWidth: "48ch", margin: "0 0 20px" }}>
              We're a small team shipping tools that help DSCR (Debt-Service Coverage Ratio — whether a property's rent can cover its loan payment) investors price deals, model risk, and close faster. Remote-first, deeply technical, no hand-waving.
            </Lead>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={scrollToJobs}
                style={{ background: dc.dark, color: dc.mintBg, border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 600, fontFamily: dc.sans, cursor: "pointer", letterSpacing: "-0.01em" }}
              >
                See open roles below
              </button>
              <a
                href="mailto:careers@greenstreetfinance.com"
                style={{ display: "inline-flex", alignItems: "center", background: "transparent", color: "rgba(0,55,56,0.7)", border: "1.5px solid rgba(0,55,56,0.3)", borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 500, textDecoration: "none", fontFamily: dc.sans, letterSpacing: "-0.01em" }}
              >
                careers@greenstreetfinance.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN ROLES ───────────────────────────────────────────────────────── */}
      <section
        id="cr-jobs"
        className="gs-reveal"
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 36,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(26px,3vw,40px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                margin: 0,
                color: dc.dark,
              }}
            >
              Open roles
            </h2>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(0,55,56,0.55)",
                letterSpacing: "-0.01em",
              }}
            >
              {ROLES.length} positions · remote-first
            </span>
          </div>

          {/* Accordion list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ROLES.map((role, i) => (
              <RoleRow
                key={role.title}
                role={role}
                isOpen={open === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <ScenePhoto
        src="/img/generated/scenes/two-person-meeting.png"
        video="/video/scenes/careers-engine.mp4"
        poster="/video/scenes/careers-engine-poster.jpg"
        alt="A small team, each owning a module of the underwriting engine"
        eyebrow="Life at Greenstreet"
        caption="Small team, high ownership — you touch the engine, not a backlog ticket."
      />

      {/* ── HOW WE WORK ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal"
          style={{ maxWidth: dc.maxW, margin: "0 auto" }}
        >
          <h2
            style={{
              fontSize: "clamp(26px,3vw,40px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: "0 0 40px",
              color: dc.cream,
            }}
          >
            How we work
          </h2>

          <div
            className="dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "1px",
              background: `${dc.dark}20`,
              borderRadius: radius.md,
              overflow: "hidden",
            }}
          >
            {VALUES.map((v) => (
              <div
                key={v.title}
                style={{
                  background: dc.teal,
                  padding: "34px 28px",
                }}
              >
                <div
                  style={{
                    fontSize: 21,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: dc.lemon,
                    marginBottom: 10,
                  }}
                >
                  {v.title}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: "rgba(238,239,211,0.7)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA — mintBg for visual break from the dark "how we work" band ── */}
      <section
        style={{
          background: dc.mintBg,
          padding: "clamp(56px,7vw,88px) clamp(1.5rem,4vw,3rem)",
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "clamp(24px,4vw,56px)",
            flexWrap: "wrap" as const,
          }}
        >
          <div style={{ flex: "1 1 320px" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: dc.rain,
                marginBottom: 14,
              }}
            >
              We're hiring
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.6vw,50px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                color: dc.dark,
                margin: "0 0 14px",
              }}
            >
              Build the infrastructure
              <br />
              DSCR lending is missing.
            </h2>
            <p
              style={{
                fontSize: "clamp(14px,1.2vw,17px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(0,55,56,0.6)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Remote-first. Equity upside. Ship on day two.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "0 0 auto" }}>
            <a
              href="mailto:careers@greenstreetfinance.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: dc.dark,
                color: dc.cream,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                padding: "15px 30px",
                borderRadius: dc.r.md,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Email your application →
            </a>
            <button
              onClick={() => onNavigate?.("about")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: dc.dark,
                fontWeight: 600,
                fontSize: 15,
                border: `1.5px solid ${dc.dark}40`,
                cursor: "pointer",
                padding: "15px 30px",
                borderRadius: dc.r.md,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Learn about the team
            </button>
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={(v) => onNavigate?.(v)} />
    </DcShell>
  );
}
