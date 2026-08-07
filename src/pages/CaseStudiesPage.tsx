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
  /** Illustrative composite quote — not attributed to a verified named individual */
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
    company: "Portfolio operations scenario",
    location: "Buy-and-hold investor",
    type: "Portfolio investor",
    num: "01",
    image: "/img/generated/scenes/underwriting-desk-velocity.png",
    scene: "vela",
    poster: "/video/scenes/cs-vela-poster.jpg",
    headline: "From 25 minutes per file to 6. Same team, 4× the throughput.",
    metrics: [
      { v: "4×", k: "Modeled throughput ratio" },
      { v: "6 min", k: "Hypothetical review input (was 25)" },
      { v: "120+", k: "Hypothetical files / month" },
    ],
    challenge:
      "Assume a team reviews 120+ DSCR files a month and rebuilds two spreadsheets for each file — one payment-coverage view and another expense-aware view. The duplicate work becomes the modeled workflow constraint.",
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
    image: "/img/generated/scenes/desk-green-data.png",
    scene: "northshore",
    poster: "/video/scenes/cs-northshore-poster.jpg",
    headline: "Same-day rate lock — and Track 2 caught the deal that should have died.",
    metrics: [
      { v: "Modeled", k: "Scenario checkpoint" },
      { v: "12%", k: "Vacancy gap caught by Track 2" },
      { v: "1", k: "Scenario, multiple assumptions compared" },
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
    type: "Investor / Non-US investor",
    num: "03",
    image: "/img/generated/scenes/broker-building-dusk.png",
    scene: "quintero",
    poster: "/video/scenes/cs-quintero-poster.jpg",
    headline: "Three appraisals they never paid for. $14,800 in hard costs saved at the desk.",
    metrics: [
      { v: "3", k: "Hypothetical scenarios screened" },
      { v: "$14,800", k: "Modeled diligence-cost exposure" },
      { v: "3 min", k: "Hypothetical review target" },
    ],
    challenge:
      "Assume three marginal scenarios are not identified until after appraisal orders. The payment-coverage view clears its modeled threshold, while vacancy and management assumptions move the expense-aware view below break-even. The example assigns $3,000–7,000 of diligence cost to each scenario.",
    solution:
      "The scenario applies the expense-aware Track 2 view before diligence costs are committed. Any foreign-national or ITIN eligibility would require confirmation from the responsible licensed provider.",
    result:
      "Three deals that would have failed post-appraisal were killed pre-appraisal, saving $14,800 in hard costs. A non-US investor ITIN file that previously took a week to get a straight answer was approved on the Global program in under three minutes.",
    quote:
      "Non-US investor ITIN flow used to take a week. Greenstreet's Global program approved us fast — and Track 2 stopped us from buying three appraisals we'd have regretted.",
    program: "DSCR Global",
  },
];

const AURORA_STORY = {
  slug: "aurora",
  company: "Blanket portfolio scenario",
  location: "Portfolio operator",
  type: "Portfolio investor",
  num: "04",
  image: "/img/generated/scenes/residential-townhomes.png",
  scene: "aurora",
  poster: "/video/scenes/cs-aurora-poster.jpg",
  headline: "One blended view of 40 doors got the blanket line approved.",
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

// Logo map — only logos that exist under /img/logos/
// Client wordmarks render as styled text (no logo image assets exist for these
// reference clients) — keeps the cards clean with no broken images.
const LOGOS: Record<string, string> = {};

// ── Page CSS — responsive grids + animated meter fills ───────────────────────
const CS_PAGE_CSS = `
@media(max-width:820px){
  .cs-panel{grid-template-columns:1fr !important;gap:24px !important;}
  .cs-panel .cs-photo{order:-1 !important;}
}
@media(max-width:760px){
  .dt-grid{grid-template-columns:1fr !important;}
}
@media (max-width: 700px) {
  .dc-hero, .dc-band-2, .dc-band-3 { grid-template-columns: 1fr !important; }
  .dc-hero { min-height: 0 !important; }
  .dc-band-3 { gap: 12px !important; }
  .cs-line { display: none; }
}
.dt-fill{transition:width 1.15s cubic-bezier(.22,.7,0,1);}
@media(prefers-reduced-motion:reduce){.dt-fill{transition:none !important;}}
`;

// ── Aggregate scoreboard (hero) — the four scenarios summed, counting up on
//    scroll. Real proof, not a decorative diagram. ──────────────────────────────
const AGG: { value: number; prefix?: string; suffix?: string; group?: boolean; label: string; sub: string }[] = [
  { value: 14800, prefix: "$", group: true, label: "Hard costs killed at the desk", sub: "deals walked before a dollar of diligence" },
  { value: 4, suffix: "×", label: "Throughput, same team", sub: "25 min → 6 min per file" },
  { value: 3, label: "Bad deals stopped pre-appraisal", sub: "Track 2 caught what Track 1 passed" },
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
        Across all four scenarios
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
            <CountUp value={shown ? a.value : 0} prefix={a.prefix} suffix={a.suffix} group={a.group} duration={1.1} />
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
    { name: "Track 1 · Lender-qualifying DSCR", v: 1.18, color: dc.emerald, verdict: "Funds", note: "Rent covers the note. Most desks stop reading here." },
    { name: "Track 2 · Investor-survival DSCR", v: 0.98, color: "#e0635f", verdict: "Stops", note: "Price in a 12% vacancy and the same deal goes underwater." },
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
        <button
          onClick={() => (window.history.pushState({}, "", `/case-studies/${s.slug}`), window.dispatchEvent(new PopStateEvent("popstate")))}
          style={{ ...rise(0.18 + s.metrics.length * 0.08), background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 14, fontWeight: 700, color: dc.emerald, letterSpacing: "-0.01em", fontFamily: dc.sans, display: "inline-flex", alignItems: "center", gap: 6 }}
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
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: "rgba(238,239,211,0.62)",
              letterSpacing: "-0.01em", fontFamily: dc.sans, marginBottom: 28,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            ← All case studies
          </button>
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

          {/* Scenario takeaway — explicitly not a customer testimonial. */}
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
                fontStyle: "italic",
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
              Model a DSCR scenario
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
                Request a scenario review →
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
      document.title = "Illustrative Scenarios | Greenstreet Finance";
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
                Four constructed teaching scenarios showing how assumptions can
                change a modeled result. They are not customer histories, measured
                savings, financing outcomes, or evidence that a provider will act.
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
                Open the educational calculator →
              </button>
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
              The pattern behind every win
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
              One number gets you the loan. The other tells you whether to take it.
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
              Every scenario below turns on the same move: Greenstreet runs{" "}
              <strong style={{ color: dc.dark, fontWeight: 700 }}>two DSCRs on one file</strong>.
              Track 1 is what the lender funds on. Track 2 prices in vacancy,
              management, and CapEx — whether the deal actually survives. When they
              disagree, Track 2 is the reason a deal got stopped before it cost a dollar.
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
              Same property · same week · one application
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
                color: "rgba(238,239,211,0.62)",
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
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
