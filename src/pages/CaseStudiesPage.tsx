import React, { useEffect, useRef } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn, useRevealOnView, CountUp } from "../design/dc";
import BottomCTA from "../design/BottomCTA";

// ── Live HyperFrames scenes ───────────────────────────────────────────────────
// The case-study explainers are authored HyperFrames HTML compositions (SVG + a
// paused GSAP timeline). They run LIVE in the page — embedded as a sandboxed
// iframe that plays the composition's own timeline on a seamless loop — and are
// never baked into an .mp4. Reduced-motion shows the static poster instead.
import velaScene from "../../hyperframes/cs-vela.html?raw";
import northshoreScene from "../../hyperframes/cs-northshore.html?raw";
import quinteroScene from "../../hyperframes/cs-quintero.html?raw";
import auroraScene from "../../hyperframes/cs-aurora.html?raw";

const SCENE_HTML: Record<string, string> = {
  vela: velaScene,
  northshore: northshoreScene,
  quintero: quinteroScene,
  aurora: auroraScene,
};

// Make an authored composition self-playing + responsive: fill the frame, then
// drive the paused timeline (window.__timelines.main) on an infinite loop.
function liveSceneDoc(html: string): string {
  const style =
    "<style>html,body{width:100%!important;height:100%!important;margin:0!important;overflow:hidden!important;}svg{width:100%!important;height:100%!important;display:block;}</style>";
  const script =
    "<script>(function(){function s(){var t=window.__timelines&&window.__timelines.main;if(!t){return setTimeout(s,40);}t.repeat(-1);t.play(0);}if(document.readyState==='complete'){s();}else{addEventListener('load',s);}})();<\/script>";
  return html.replace("</head>", style + "</head>").replace("</body>", script + "</body>");
}

// One case-study scene: a static poster <img> base (also the reduced-motion
// fallback) with the live composition iframe layered on top once `active`.
function HyperframeScene({
  sceneKey, poster, image, title, active, posterStyle,
}: {
  sceneKey?: string;
  poster?: string;
  image?: string;
  title: string;
  active: boolean;
  posterStyle?: React.CSSProperties;
}) {
  const cover: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
  const html = sceneKey ? SCENE_HTML[sceneKey] : undefined;
  return (
    <>
      <img src={poster || image} alt={title} loading="lazy" decoding="async" style={{ ...cover, objectFit: "cover", ...posterStyle }} />
      {active && html && (
        <iframe
          title={title}
          srcDoc={liveSceneDoc(html)}
          sandbox="allow-scripts"
          scrolling="no"
          loading="lazy"
          style={{ ...cover, border: "none", background: "#00302e" }}
        />
      )}
    </>
  );
}

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
  /** Educational takeaway for a hypothetical scenario, never a testimonial. */
  quote: string;
  program: string;
  /** Brand scene image (public/img/generated/scenes) for the case panel */
  image: string;
  /** HyperFrames scene id — the live composition in hyperframes/cs-<id>.html
   *  (runs in-page, never an mp4) + its poster frame (reduced-motion / loading). */
  scene?: string;
  poster?: string;
}

const STUDIES: Study[] = [
  {
    slug: "vela-capital",
    company: "Illustrative scenario 01",
    location: "Rental-property analysis",
    type: "Workflow example",
    num: "01",
    image: "/img/generated/scenes/underwriting-desk-velocity.png",
    headline: "Compare a manual review with a structured DSCR scenario.",
    metrics: [
      { v: "Inputs", k: "Rent and proposed payment" },
      { v: "Output", k: "Preliminary coverage estimate" },
      { v: "Review", k: "Provider verification required" },
    ],
    challenge:
      "Hypothetical situation: an investor has rental income, proposed debt terms, and operating assumptions spread across separate notes and wants a consistent comparison.",
    solution:
      "The user enters the assumptions in one scenario and compares a basic rent-to-payment view with a separate stressed view that includes selected vacancy, management, and capital-expenditure assumptions.",
    result:
      "Illustrative outcome: the assumptions and differences are easier to discuss. The result remains an estimate and does not establish qualification, pricing, or provider approval.",
    quote:
      "A structured scenario can make assumptions visible without replacing underwriting or professional review.",
    program: "Educational model",
  },
  {
    slug: "northshore-non-qm",
    company: "Illustrative scenario 02",
    location: "Vacancy stress test",
    type: "Risk example",
    num: "02",
    image: "/img/generated/scenes/desk-green-data.png",
    headline: "Test how a vacancy assumption changes a coverage estimate.",
    metrics: [
      { v: "Base", k: "User-entered rent" },
      { v: "Stress", k: "Editable vacancy assumption" },
      { v: "Flag", k: "Question for further review" },
    ],
    challenge:
      "Hypothetical situation: a property's base rent appears to cover the proposed payment, but the user wants to see the effect of a vacancy assumption before incurring diligence costs.",
    solution:
      "The user compares the base scenario with a separate stressed scenario. The stress assumption is illustrative and should be replaced with property-specific evidence.",
    result:
      "Illustrative outcome: the comparison surfaces a risk question for the user, provider, appraiser, or adviser. It does not predict performance or direct the user to proceed or stop.",
    quote:
      "Stress tests are sensitivity exercises, not forecasts, approvals, or evidence of a typical result.",
    program: "Educational stress model",
  },
  {
    slug: "quintero-co",
    company: "Illustrative scenario 03",
    location: "Non-U.S. investor questions",
    type: "Documentation example",
    num: "03",
    image: "/img/generated/scenes/broker-building-dusk.png",
    headline: "Prepare questions for a non-U.S. investor scenario.",
    metrics: [
      { v: "Identity", k: "Documents may vary" },
      { v: "Assets", k: "Source and reserve review" },
      { v: "Provider", k: "Eligibility must be confirmed" },
    ],
    challenge:
      "Hypothetical situation: a non-U.S. investor wants to understand which identity, credit-reference, entity, asset, reserve, and property questions may affect a transaction.",
    solution:
      "The scenario organizes preliminary deal assumptions and a checklist of questions. It does not determine which documents a provider will accept or whether a borrower is eligible.",
    result:
      "Illustrative outcome: the user has a clearer list of items to verify with the responsible provider and qualified legal or tax advisers before relying on the scenario.",
    quote:
      "Documentation and eligibility vary by provider, jurisdiction, borrower facts, and transaction structure.",
    program: "Educational checklist",
  },
];

const AURORA_STORY = {
  slug: "aurora",
  company: "Illustrative scenario 04",
  location: "Portfolio comparison",
  type: "Aggregation example",
  num: "04",
  image: "/img/generated/scenes/residential-townhomes.png",
  headline: "Review multiple properties in one blended scenario.",
  metrics: [
    { v: "Assets", k: "Multiple property inputs" },
    { v: "Blend", k: "Illustrative aggregate view" },
    { v: "Review", k: "Property-level checks remain" },
  ],
  challenge:
    "Hypothetical situation: an investor wants to compare several property scenarios while preserving the assumptions and risks associated with each asset.",
  solution:
    "The user creates an illustrative aggregate view of rent, proposed payments, equity, and rates while retaining property-level inputs for separate review.",
  result:
    "Illustrative outcome: the portfolio is easier to compare at a high level. The aggregate does not establish collateral value, provider methodology, eligibility, or approval.",
  quote:
    "An aggregate view can support discussion, but each property and transaction still requires independent verification.",
  program: "Educational portfolio model",
};

const ALL_STUDIES = [AURORA_STORY, ...STUDIES];

// Logo map — only logos that exist under /img/logos/
// Client wordmarks render as styled text (no logo image assets exist for these
// reference clients) — keeps the cards clean with no broken images.

// ── Page CSS — responsive grids + animated meter fills ───────────────────────
const CS_PAGE_CSS = `
@media(max-width:820px){
  .cs-panel{grid-template-columns:1fr !important;gap:24px !important;}
  .cs-panel .cs-photo{order:-1 !important;}
}
@media(max-width:760px){
  .dt-grid{grid-template-columns:1fr !important;}
}
.dt-fill{transition:width 1.15s cubic-bezier(.22,.7,0,1);}
@media(prefers-reduced-motion:reduce){.dt-fill{transition:none !important;}}
`;

// ── Aggregate scoreboard (hero) — the four scenarios summed, counting up on
//    scroll. Real proof, not a decorative diagram. ──────────────────────────────
const AGG: { value: string; label: string; sub: string }[] = [
  { value: "Preliminary", label: "Educational estimates", sub: "not approvals, rate locks, or commitments" },
  { value: "Editable", label: "Scenario assumptions", sub: "replace examples with property-specific evidence" },
  { value: "Review", label: "Transaction verification", sub: "provider and professional review still required" },
];
function AggregateScoreboard() {
  const [ref, shown] = useRevealOnView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        background: dc.teal,
        borderRadius: dc.r.lg,
        border: `1px solid ${dc.faded}`,
        boxShadow: "0 18px 50px -30px rgba(0,0,0,0.55)",
        padding: "clamp(28px,3.4vw,44px)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(18px,2.2vw,26px)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)" }}>
        How to read all four examples
      </div>
      {AGG.map((a, i) => (
        <div
          key={a.label}
          style={{
            paddingBottom: i < AGG.length - 1 ? "clamp(16px,2vw,22px)" : 0,
            borderBottom: i < AGG.length - 1 ? `1px solid ${dc.faded}` : "none",
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : "translateY(14px)",
            transition: `opacity .6s ease ${0.1 + i * 0.12}s, transform .6s cubic-bezier(.22,.7,0,1) ${0.1 + i * 0.12}s`,
          }}
        >
          <Mono style={{ display: "block", fontSize: "clamp(34px,4.4vw,54px)", fontWeight: 700, letterSpacing: "-0.035em", color: dc.lemon, lineHeight: 1 }}>
            {a.value}
          </Mono>
          <div style={{ fontSize: 15, fontWeight: 600, color: dc.cream, marginTop: 8, letterSpacing: "-0.01em" }}>{a.label}</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 3, letterSpacing: "-0.01em" }}>{a.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Dual-Track proof — the through-line of every scenario. One file, two DSCRs:
//    Track 1 is what the lender funds on; Track 2 is whether the deal survives.
//    Meters fill + verdicts resolve on scroll (reduced-motion safe). ─────────────
const DT_MIN = 0.5, DT_MAX = 2.0;
const dtPct = (v: number) => Math.max(0, Math.min(100, ((v - DT_MIN) / (DT_MAX - DT_MIN)) * 100));
function DualTrackProof() {
  const [ref, shown] = useRevealOnView<HTMLDivElement>();
  const tracks = [
    { name: "Illustrative base coverage", v: 1.18, color: dc.emerald, verdict: "Example pass", note: "Uses the rent and payment assumptions entered for this hypothetical example." },
    { name: "Illustrative stressed coverage", v: 0.98, color: "#e0635f", verdict: "Review flag", note: "Adds an example vacancy assumption to show sensitivity, not a forecast." },
  ];
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "clamp(26px,3vw,40px)" }}>
      {tracks.map((t, i) => (
        <div
          key={t.name}
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : "translateY(18px)",
            transition: `opacity .6s ease ${i * 0.18}s, transform .6s cubic-bezier(.22,.7,0,1) ${i * 0.18}s`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: "clamp(13px,1.2vw,15px)", fontWeight: 700, color: dc.dark, letterSpacing: "-0.01em" }}>{t.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <Mono style={{ fontSize: "clamp(22px,2.4vw,30px)", fontWeight: 700, color: t.color, letterSpacing: "-0.03em" }}>
                <CountUp value={shown ? t.v : 0} decimals={2} suffix="x" duration={1.15} />
              </Mono>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: t.color, background: `${t.color}22`, border: `1px solid ${t.color}55`, borderRadius: 999, padding: "4px 11px" }}>{t.verdict}</span>
            </div>
          </div>
          {/* meter with a break-even tick at 1.00 */}
          <div style={{ position: "relative", height: 12, borderRadius: 999, background: "rgba(0,55,56,0.1)" }}>
            <div className="dt-fill" style={{ position: "absolute", inset: "0 auto 0 0", width: shown ? `${dtPct(t.v)}%` : "0%", background: t.color, borderRadius: 999 }} />
            <div style={{ position: "absolute", left: `${dtPct(1.0)}%`, top: -3, bottom: -3, width: 2, background: "rgba(0,55,56,0.5)", transform: "translateX(-1px)", borderRadius: 2 }} />
          </div>
          <div style={{ position: "relative", height: 16, marginTop: 5 }}>
            <span style={{ position: "absolute", left: `${dtPct(1.0)}%`, transform: "translateX(-50%)", fontSize: 10.5, fontWeight: 600, color: "rgba(0,55,56,0.55)", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>1.00 break-even</span>
          </div>
          <p style={{ fontSize: "clamp(13px,1.1vw,15px)", fontWeight: 500, lineHeight: 1.5, color: "rgba(0,55,56,0.62)", margin: "8px 0 0", letterSpacing: "-0.01em" }}>{t.note}</p>
        </div>
      ))}
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
          color: "rgba(238,239,211,0.62)",
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
  index,
}: {
  s: Study;
  onNavigate: (v: string) => void;
  isLast: boolean;
  index: number;
}) {
  const [ref, shown] = useRevealOnView<HTMLDivElement>();
  const photoLeft = index % 2 === 0;
  // Reveal: each piece rises + fades in on scroll, staggered. Idempotent CSS
  // transition driven off `shown` (reduced-motion + hidden-tab safe).
  const rise = (d: number): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(26px)",
    transition: `opacity .7s cubic-bezier(.22,.7,0,1) ${d}s, transform .7s cubic-bezier(.22,.7,0,1) ${d}s`,
  });
  const reduce = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Shared cover style for the panel media (img or video), with the parallax settle.
  const mediaStyle: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: shown ? "scale(1)" : "scale(1.08)", transition: "transform 1.3s cubic-bezier(.2,.6,0,1)" };
  return (
    <div
      ref={ref}
      className="cs-panel"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(28px,4.5vw,72px)",
        alignItems: "center",
        padding: "clamp(40px,5.5vw,80px) 0",
        borderBottom: isLast ? "none" : `1px solid ${dc.faded}`,
      }}
    >
      {/* Photo panel — big index + client wordmark composited over the scene */}
      <div className="cs-photo" style={{ order: photoLeft ? 0 : 1, ...rise(0) }}>
        <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: dc.r.lg, overflow: "hidden", border: "1px solid rgba(238,239,211,0.12)", background: "#00302e" }}>
          {s.scene && !reduce ? (
            // Live HyperFrames composition — the authored HTML/GSAP runs in a
            // sandboxed iframe (lazy: mounts only once the row reveals). Reduced
            // motion falls through to the static poster <img> below.
            <HyperframeScene
              sceneKey={s.scene}
              poster={s.poster}
              image={s.image}
              title={`${s.company} — ${s.type}, animated`}
              active={shown}
              posterStyle={mediaStyle}
            />
          ) : (
            <img
              src={s.poster || s.image}
              alt={`${s.company} — ${s.type}`}
              loading="lazy"
              decoding="async"
              style={mediaStyle}
            />
          )}
          {/* The animation is self-contained; for the static photo fallback only,
              keep the legibility gradient + the client wordmark. */}
          {!(s.scene && !reduce) && (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, rgba(0,55,56,0.34) 0%, rgba(0,55,56,0) 42%, rgba(0,55,56,0.88) 100%)" }} />
          )}
          <Mono style={{ position: "absolute", top: "clamp(14px,1.6vw,22px)", left: "clamp(16px,1.8vw,26px)", fontSize: "clamp(28px,3.4vw,50px)", fontWeight: 600, letterSpacing: "-0.04em", color: "rgba(238,239,211,0.88)", lineHeight: 1, textShadow: "0 2px 16px rgba(0,26,24,0.6)" }}>{s.num}</Mono>
          {!(s.scene && !reduce) && (
            <div style={{ position: "absolute", left: "clamp(16px,1.8vw,24px)", right: "clamp(16px,1.8vw,24px)", bottom: "clamp(14px,1.6vw,20px)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.cream }}>{s.company}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.7)", marginTop: 3, letterSpacing: "-0.01em" }}>{s.type} · {s.location}</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="cs-content" style={{ order: photoLeft ? 1 : 0 }}>
        <div style={{ ...rise(0.02), display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap", marginBottom: 14, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          <span style={{ color: dc.emerald }}>{s.company}</span>
          <span style={{ color: "rgba(238,239,211,0.42)", fontWeight: 600 }}>·</span>
          <span style={{ color: "rgba(238,239,211,0.55)", fontWeight: 600 }}>{s.type}</span>
        </div>
        <h3 style={{ ...rise(0.06), fontSize: "clamp(22px,2.4vw,34px)", fontWeight: 600, letterSpacing: "-0.03em", color: dc.cream, lineHeight: 1.12, margin: "0 0 18px" }}>
          {s.headline}
        </h3>
        <p style={{ ...rise(0.12), fontSize: "clamp(15px,1.2vw,19px)", fontWeight: 500, lineHeight: 1.6, color: "rgba(238,239,211,0.72)", margin: "0 0 28px", letterSpacing: "-0.01em" }}>
          {s.result}
        </p>
        <div className="dc-band-3" style={{ display: "grid", gridTemplateColumns: `repeat(${s.metrics.length},auto)`, gap: "clamp(20px,3vw,44px)", justifyContent: "start", marginBottom: 28 }}>
          {s.metrics.map((m, i) => (
            <div key={m.k} style={rise(0.18 + i * 0.08)}>
              <MetricChip {...m} />
            </div>
          ))}
        </div>
        <a
          href={`/case-studies/${s.slug}`}
          onClick={(event) => { event.preventDefault(); window.history.pushState({}, "", `/case-studies/${s.slug}`); window.dispatchEvent(new PopStateEvent("popstate")); }}
          style={{ ...rise(0.18 + s.metrics.length * 0.08), padding: 0, cursor: "pointer", fontSize: 14, fontWeight: 700, color: dc.emerald, textDecoration: "none", letterSpacing: "-0.01em", fontFamily: dc.sans, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          Read the full scenario →
        </a>
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
    document.title = `${s.company} | Illustrative Scenarios | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [s.slug]);

  const reduce = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cover: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{`@media (max-width: 860px){ .cs-detail-grid{ grid-template-columns:1fr !important; } .cs-detail-media{ order:-1; } }`}</style>

      {/* Detail hero — leads with the SAME 16:9 media panel + MetricChip metrics
          as the case-studies list, on the dark ground (was a light mintBg bar). */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(40px,6vh,72px) ${dc.pad} clamp(40px,6vh,72px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <a
            href="/case-studies"
            onClick={(event) => { event.preventDefault(); onBack(); }}
            style={{
              padding: 0, cursor: "pointer", textDecoration: "none",
              fontSize: 13, fontWeight: 600, color: "rgba(238,239,211,0.62)",
              letterSpacing: "-0.01em", fontFamily: dc.sans, marginBottom: 28,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            ← All illustrative scenarios
          </a>
          <div
            id="gs-hero-content"
            className="cs-detail-grid"
            style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(28px,4.5vw,64px)", alignItems: "center" }}
          >
            {/* Copy + metrics */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap", marginBottom: 16, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <span style={{ color: dc.emerald }}>{s.company}</span>
                <span style={{ color: "rgba(238,239,211,0.42)", fontWeight: 600 }}>·</span>
                <span style={{ color: "rgba(238,239,211,0.55)", fontWeight: 600 }}>{s.type}</span>
                <span style={{ color: "rgba(238,239,211,0.42)", fontWeight: 600 }}>·</span>
                <span style={{ color: "rgba(238,239,211,0.55)", fontWeight: 600 }}>{s.location}</span>
              </div>
              <H1 style={{ margin: "0 0 28px", maxWidth: "20ch" }}>
                {s.headline}
              </H1>
              <div
                className="dc-band-3"
                style={{ display: "grid", gridTemplateColumns: `repeat(${s.metrics.length},auto)`, gap: "clamp(20px,3vw,44px)", justifyContent: "start" }}
              >
                {s.metrics.map((m) => (
                  <MetricChip key={m.k} {...m} />
                ))}
              </div>
            </div>

            {/* 16:9 media panel — the study's animated explainer (poster fallback) */}
            <div className="cs-detail-media">
              <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: dc.r.lg, overflow: "hidden", border: "1px solid rgba(238,239,211,0.12)", background: "#00302e" }}>
                {s.scene && !reduce ? (
                  <HyperframeScene
                    sceneKey={s.scene}
                    poster={s.poster}
                    image={s.image}
                    title={`${s.company} — ${s.type}, animated`}
                    active={true}
                    posterStyle={cover}
                  />
                ) : (
                  <img src={s.poster || s.image} alt={`${s.company} — ${s.type}`} style={cover} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(48px,6vw,80px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {[
            ["The situation", s.challenge],
            ["What we did", s.solution],
            ["The outcome", s.result],
          ].map(([heading, body]) => (
            <div key={heading} style={{ marginBottom: 32 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: dc.lemon,
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
                  color: "rgba(238,239,211,0.78)",
                  margin: 0,
                }}
              >
                {body}
              </p>
            </div>
          ))}

          {/* Educational takeaway, not a quote or testimonial. */}
          <div
            style={{
              padding: "20px 28px",
              margin: "40px 0",
              background: "rgba(238,239,211,0.05)",
              borderRadius: `0 ${dc.r.sm} ${dc.r.sm} 0`,
              border: `1px solid ${dc.faded}`,
              borderLeft: `3px solid ${dc.lemon}`,
            }}
          >
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,21px)",
                fontWeight: 500,
                lineHeight: 1.45,
                color: dc.cream,
                margin: "0 0 12px",
              }}
            >
              {s.quote}
            </p>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: dc.emerald,
                fontStyle: "normal",
              }}
            >
              Educational takeaway · {s.program}
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
              Explore your own scenario
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
              Enter property and proposed financing assumptions to produce a
              preliminary educational estimate. The output is not an approval,
              commitment, rate lock, or statement of required documentation.
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
                Start my scenario →
              </button>
              {/* Secondary — transparent + 1.5px FADED */}
              <a
                href="/dscr-calculator"
                onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }}
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
                  textDecoration: "none",
                }}
              >
                Open the DSCR Calculator
              </a>
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
      <style>{CS_PAGE_CSS}</style>
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
                  color: "rgba(238,239,211,0.6)",
                  marginBottom: 20,
                }}
              >
                Educational examples
              </div>
              <H1 style={{ margin: 0 }}>
                Illustrative DSCR scenarios, not customer results.
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
                Four hypothetical examples show how users might organize inputs,
                compare assumptions, and identify questions for further review.
                They are not customers, testimonials, approvals, or typical results.
              </Lead>
              {/* Dominant lemon CTA */}
              <a
                href="/dscr-calculator"
                onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }}
                style={{ display: "inline-flex", alignItems: "center", background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: dc.r.md, fontFamily: dc.sans, textDecoration: "none", letterSpacing: "-0.01em" }}
              >
                Price your deal now →
              </a>
            </div>
          </div>

          {/* Right: animated aggregate scoreboard */}
          <AggregateScoreboard />
        </div>
      </section>

      {/* ── THE PATTERN: DUAL-TRACK PROOF ─────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad}`,
          borderTop: `4px solid ${dc.dark}`,
        }}
      >
        <div
          className="dt-grid"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px,5vw,80px)",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: dc.rain,
                marginBottom: 16,
              }}
            >
              The pattern behind every example
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: dc.dark,
                lineHeight: 1.08,
                margin: "0 0 20px",
              }}
            >
              One view estimates coverage. Another tests an assumption.
            </h2>
            <p
              style={{
                fontSize: "clamp(15px,1.3vw,18px)",
                fontWeight: 500,
                lineHeight: 1.6,
                color: "rgba(0,55,56,0.68)",
                margin: "0 0 24px",
                maxWidth: "46ch",
              }}
            >
              Each hypothetical example compares a base calculation with a separate
              sensitivity view. The second view may include selected vacancy,
              management, or capital-expenditure assumptions. Neither view predicts
              performance or represents a provider's underwriting decision.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
                fontWeight: 600,
                color: dc.rain,
                background: "rgba(0,55,56,0.06)",
                border: "1px solid rgba(0,55,56,0.14)",
                borderRadius: 999,
                padding: "8px 16px",
                letterSpacing: "-0.01em",
              }}
            >
              Same hypothetical property · two editable views
            </div>
          </div>
          <DualTrackProof />
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
            The situations, the work, the outcomes.
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
                color: "rgba(238,239,211,0.62)",
                margin: 0,
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
              }}
            >
              These are wholly hypothetical educational scenarios. They do not
              describe customers, transactions, approvals, commitments, savings,
              performance, or typical results.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {ALL_STUDIES.map((s, i) => (
              <StudyRow
                key={s.slug}
                s={s}
                onNavigate={onNavigate}
                isLast={i === ALL_STUDIES.length - 1}
                index={i}
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
            Ready to explore your own assumptions in a preliminary scenario?
          </p>
          {/* Dominant lemon CTA */}
          <a
            href="/dscr-calculator"
            onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }}
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
              textDecoration: "none",
            }}
          >
            Run your own deal →
          </a>
          {/* Secondary */}
          <a
            href="/borrower-profiles"
            onClick={(event) => { event.preventDefault(); onNavigate("borrower-profiles"); }}
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
              textDecoration: "none",
            }}
          >
            See all investor profiles
          </a>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
