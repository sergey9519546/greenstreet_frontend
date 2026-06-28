// Canonical shared shell for the Claude Design handoff reskin.
// Real GSAP motion (matches the .dc.html mockups + the DSCR Calculator flagship):
// sticky dark nav, scroll-reveal (.gs-reveal), hero stagger (#gs-hero-content),
// count-up ([data-count]), JetBrains-Mono numerics, footer.
// Tokens come from theme.ts — single source of truth, no per-page drift.
//
// Elevation pass (beyond a literal port):
//  • prefers-reduced-motion fully honored (no orphaned opacity:0, instant numbers)
//  • HeroProof — live product surface that replaces the design-tool "drop a
//    screenshot" placeholder with the tool's real signature metric
//  • responsive nav (collapses under 640px, hairline border, visible focus rings)
//  • tabular-nums on all mono figures so animated numbers never reflow-jitter
import React, { useRef, useState, useEffect, useContext, createContext } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PISTACHIO, MINT_BG, MIDNIGHT, RAINFOREST, LEMON, FADED, font, swatch, radius, scale, tracking, onDark, onLight, risk, size as typeScale } from "../theme";
import { SiteNav, SiteFooter } from "./SiteShell";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal-on-scroll gate. Returns [ref, shown]; `shown` flips true the first time
// the element scrolls into view — or instantly under reduced-motion, or via a 1.5s
// safety timer if the observer never fires. Drive CSS *transitions* off `shown`
// (state) rather than keyframe-animations-on-mount: a transition is idempotent
// across React re-renders, so the reveal can never get stuck restarting at its
// start frame (the bug that left grow-in bars invisible at scale 0). It also
// always ends VISIBLE — no observer, no JS timer, reduced motion: still shown.
export function useRevealOnView<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState<boolean>(() => prefersReducedMotion());
  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setShown(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    const t = window.setTimeout(() => { setShown(true); io.disconnect(); }, 1500);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [shown]);
  return [ref, shown] as const;
}

// Wheel-scrub: scroll the mouse wheel over any number input to step its value up/
// down. Controlled-input safe — writes through the native value setter then fires
// an `input` event so React's onChange fires and state updates. Range sliders and
// non-number fields are ignored; respects step/min/max.
export function useWheelScrub(scope: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    function onWheel(e: WheelEvent) {
      const t = e.target as HTMLElement;
      if (!(t instanceof HTMLInputElement) || t.type !== "number" || t.disabled || t.readOnly) return;
      e.preventDefault();
      const step = Math.abs(parseFloat(t.step)) || 1;
      const dir = e.deltaY < 0 ? 1 : -1;
      const cur = parseFloat(t.value) || 0;
      const min = t.min !== "" ? parseFloat(t.min) : -Infinity;
      const max = t.max !== "" ? parseFloat(t.max) : Infinity;
      const decimals = (String(step).split(".")[1] || "").length;
      let next = Math.min(max, Math.max(min, cur + dir * step));
      next = parseFloat(next.toFixed(decimals));
      setter?.call(t, String(next));
      t.dispatchEvent(new Event("input", { bubbles: true }));
    }
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [scope]);
}

// Re-export tokens under the dc.* alias used across ported pages.
export const dc = {
  dark: MIDNIGHT,          // #003738
  cream: PISTACHIO,        // #eeefd3
  mintBg: MINT_BG,         // #e8e9bf
  lemon: LEMON,            // #d8d958
  rain: RAINFOREST,        // #006565
  teal: swatch.darkTeal,   // #004041
  emerald: swatch.emerald, // #4dbd97
  // Semantic accent split (W4 — ration the brand color). Lemon is RESERVED for
  // the ONE live/primary action per view (the changing CountUp number, the
  // primary Btn). Everything that used to be decorated with lemon — eyebrows,
  // slider thumbs, focus rings, static chips — now uses `accent` (emerald) so
  // lemon stays scarce and keeps its punch on the thing that actually matters.
  liveInk: LEMON,          // the changing number / the single primary action
  accent: swatch.emerald,  // supporting accent for de-lemoned chrome
  risk,                    // semantic risk ramp (risk.danger/.warning/.caution/.positive + tints)
  faded: FADED,            // #00373880
  white: "#fff",
  mono: font.mono,
  sans: font.family,
  // Match the Webflow home container exactly (.u-container: max-width 1728px,
  // ~20px side padding) so page bodies line up edge-to-edge with the shared
  // nav/footer and carry the home's full-width feel.
  maxW: 1728,
  pad: "clamp(1.1rem, 2.4vw, 1.25rem)",
  r: radius,
  // Phase-0 scales (single vocabulary — see theme.ts)
  scale,          // spacing: dc.scale.lg etc.
  tracking,       // letter-spacing tokens
  ink: onDark,    // text-on-dark opacity ladder (AA-considered)
  inkLight: onLight,
  type: typeScale, // px ramp anchors
} as const;

// Shared CSS injected once per page.
export const DC_CSS = `
.gs-num::-webkit-outer-spin-button,.gs-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.gs-num{width:100%;border:none;background:none;outline:none;font-family:${font.family};color:${MIDNIGHT};letter-spacing:-0.02em;}
/* number boxes are wheel-scrubbable (see useWheelScrub) — signal it on hover */
input[type="number"]{cursor:ns-resize;}
.gs-range{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:999px;background:rgba(238,239,211,0.18);outline:none;cursor:pointer;}
.gs-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${MIDNIGHT};border:3px solid ${swatch.emerald};cursor:pointer;transition:transform .15s;}
.gs-range::-webkit-slider-thumb:hover{transform:scale(1.18);}
.gs-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${MIDNIGHT};border:3px solid ${swatch.emerald};cursor:pointer;}
.gs-dot-grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.055) 1px,transparent 1px);background-size:34px 34px;pointer-events:none;}
/* Dotted texture on every section's green background, sitewide — cream dots are
   invisible on light surfaces, subtle on all the green shades. !important layers
   the dot image over each section's inline background-color (which resets image). */
.dc-shell main > section{background-image:radial-gradient(rgba(238,239,211,0.05) 1px,transparent 1px) !important;background-size:34px 34px !important;}
.gs-mono{font-family:${font.mono};font-variant-numeric:tabular-nums;letter-spacing:-0.03em;}
.ix-card{transition:transform .14s, background .15s;} .ix-card:hover{transform:translateY(-3px);}
.dc-nav a:focus-visible,.dc-nav button:focus-visible,a.dc-cta:focus-visible{outline:2px solid ${LEMON};outline-offset:3px;border-radius:6px;}
/* Floating/pulsing motion neutralized per design taste (no "flow"/glassmorphism). */
@keyframes gsFloat{from,to{transform:none;}}
@keyframes gsPulse{from,to{opacity:1;}}
@keyframes gsBar{from{width:0;}}
.gs-bar{animation:gsBar .8s ease-out both;}
.hp-main-grid{display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(16px,2vw,26px);align-items:center;}
.hp-input-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.hp-logic-row{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;}
.hp-logic-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
@media (max-width: 767px){.dc-navlinks{gap:14px !important;}.dc-navlink{display:none !important;}}
/* Responsive layout hooks — desktop grids stay inline; these stack them on
   small screens (the .dc.html mockups are desktop-only). Add the class to any
   2/3-col hero, band, or tool-split container. */
@media (max-width: 991px){
  .dc-hero{grid-template-columns:1fr !important;gap:40px !important;}
  .dc-band-3,.dc-band-2,.dc-split{grid-template-columns:1fr !important;}
}
@media (max-width: 640px){
  .hp-card{min-height:680px !important;aspect-ratio:auto !important;}
  .hp-main-grid,.hp-input-grid,.hp-logic-row,.hp-logic-grid{grid-template-columns:1fr !important;}
}
@media (prefers-reduced-motion:reduce){
  [class*="gsFloat"],.gs-bar{animation:none !important;}
  *{animation-duration:.001ms !important;}
}
.gs-num:focus-visible{outline:2px solid #d8d958;outline-offset:2px;border-radius:3px;}
.gs-range:focus-visible{outline:2px solid #d8d958;outline-offset:4px;}
`;

// Scroll/entrance animation over a scope. Pages add className="gs-reveal" to sections,
// id="gs-hero-content" to the hero column, and data-count="N" to count-up numbers.
// Honors prefers-reduced-motion: numbers snap to final, sections stay fully visible.
export function useDcGsap(scope: React.RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      if (reduce) {
        document.querySelectorAll("[data-count]").forEach((el) => {
          (el as HTMLElement).textContent = (el.getAttribute("data-count") || "0").toString();
        });
        return; // leave .gs-reveal / #gs-hero-content at natural (visible) state
      }

      const hc = document.querySelector("#gs-hero-content");
      if (hc) {
        // Count-up ONLY. Do NOT run any gsap.from() reveal — not on the hero, not
        // on .gs-reveal sections, not on .dc-pop grids. Those execute after the
        // first React paint (ScrollTrigger initialises post-layout), so the correct
        // final layout visibly drops/fades and then recovers on every route — the
        // bug a navbar-work commit reintroduced. Count-up only changes text content,
        // never layout, so it is safe and causes no drop. Routed pages stay stable
        // from first paint.
        hc.querySelectorAll("[data-count]").forEach((el) => {
          const end = +(el.getAttribute("data-count") || 0);
          const obj = { n: 0 };
          gsap.to(obj, {
            n: end,
            duration: 1.6,
            delay: 1.0,
            ease: "power2.out",
            onUpdate: () => { (el as HTMLElement).textContent = Math.round(obj.n).toString(); },
          });
        });
      }
    },
    { scope }
  );
}

// Back-compat shape for DcShell's (now-ignored) navLinks/cta props. The actual
// site nav + footer are the shared SiteNav / SiteFooter (one variant, sitewide).
export type NavLink = { label: string; view?: string; href?: string; onClick?: (e: React.MouseEvent) => void };

// ── Design-system typography + button primitives ──────────────────────────
// Emit the real Webflow classes (.u-text-style-*, .btn_main) which are styled by
// the globally loaded greenboard CSS — so they render IDENTICALLY to the home
// (verified: .u-text-style-h2 = 48px/600 on both). color:inherit keeps them
// correct on dark heroes AND light sections (the class's own color is ignored).
type TxtProps = { children: React.ReactNode; style?: React.CSSProperties; className?: string; id?: string };
const mk = (Tag: any, cls: string) => ({ children, style, className = "", id }: TxtProps) =>
  <Tag id={id} className={`${cls} ${className}`.trim()} style={{ color: "inherit", margin: 0, ...style }}>{children}</Tag>;
export const H1 = mk("h1", "u-text-style-h1");
export const H2 = mk("h2", "u-text-style-h2");
export const H3 = mk("h3", "u-text-style-h3");
export const H4 = mk("h4", "u-text-style-h4");
export const Lead = mk("p", "u-text-style-large");   // section description / lead
export const Body = mk("p", "u-text-style-h6");       // base body copy

/** Canonical CTA button — lemon fill (primary) / ghost (secondary), arrow.
 *  ONE spec: radius `sm` (8px), weight 700, tracking `snug`, sizes sm/md/lg.
 *  Use this everywhere instead of inlining lemon buttons (the audit found the
 *  same CTA at 6/8/9px radius and weight 500/600/700 across pages). */
export function Btn({ label, onClick, href, variant = "primary", size = "md", arrow = true, style }: { label: string; onClick?: (e: React.MouseEvent) => void; href?: string; variant?: "primary" | "secondary"; size?: "sm" | "md" | "lg"; arrow?: boolean; style?: React.CSSProperties }) {
  const dark = variant === "secondary";
  const S = { sm: { pad: "10px 18px", fs: 14, mh: 40, ic: 16 }, md: { pad: "13px 24px", fs: 15, mh: 46, ic: 18 }, lg: { pad: "16px 30px", fs: 16, mh: 52, ic: 20 } }[size];
  return (
    <div
      className="btn_main_wrap"
      data-wf--btn-main--style={variant}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer",
        // primary = reserved lemon action; secondary = solid emerald (legible on
        // both the cream and midnight grounds — was a low-contrast cream ghost).
        background: dark ? swatch.emerald : LEMON,
        color: MIDNIGHT,
        border: "none",
        borderRadius: radius.sm, padding: S.pad, minHeight: S.mh, ...style,
      }}
    >
      <div className="g_clickable_wrap" style={{ display: "contents" }}>
        <a className="g_clickable_link w-inline-block" {...(href !== undefined ? { href } : {})} onClick={onClick}><span className="g_clickable_text u-sr-only">{label}</span></a>
      </div>
      <div className="btn_main_text" style={{ color: "inherit", fontWeight: 700, fontSize: S.fs, letterSpacing: tracking.snug }}>{label}</div>
      {arrow && (
        <div className="btn-arrow-wrap" style={{ display: "inline-flex", color: "inherit" }}>
          <div className="btn_main_icon w-embed" style={{ width: S.ic, height: S.ic }}>
            <svg fill="none" height="100%" viewBox="0 0 24 25" width="100%" xmlns="http://www.w3.org/2000/svg"><path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"></path></svg>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Primitives (Phase 0) — Eyebrow / Stat / Card. Replace the inline repeats of
// these patterns so the type, tracking, opacity, and radius come from tokens.

/** Uppercase section label. One spec: 12px / 700 / caps tracking. */
export function Eyebrow({ children, color = onDark.secondary, style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: tracking.caps, textTransform: "uppercase", color, ...style }}>{children}</div>;
}

/** Mono figure + label (+ optional sub). The canonical "stat" used under heroes
 *  and in result cards — one type/tracking/opacity spec instead of per-page copies. */
export function Stat({ value, label, sub, color = PISTACHIO, align = "left" }: { value: React.ReactNode; label: React.ReactNode; sub?: React.ReactNode; color?: string; align?: "left" | "center" }) {
  return (
    <div style={{ textAlign: align }}>
      <Mono style={{ fontSize: 22, fontWeight: 700, color, display: "block", lineHeight: 1 }}>{value}</Mono>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: tracking.wide, textTransform: "uppercase", color: onDark.secondary, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: onDark.tertiary, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

/** Surface card on the dark ground. `tone` controls fill + a readable border
 *  (the audit flagged 0.1 borders as too faint to separate cards from the bg). */
export function Card({ children, style, tone = "subtle", pad = scale.xl }: { children: React.ReactNode; style?: React.CSSProperties; tone?: "subtle" | "raised" | "solid"; pad?: string }) {
  const tones = {
    subtle: { bg: "rgba(238,239,211,0.05)", bd: "rgba(238,239,211,0.14)" },
    raised: { bg: swatch.darkTeal, bd: "rgba(238,239,211,0.16)" },
    solid: { bg: MIDNIGHT, bd: "rgba(238,239,211,0.12)" },
  }[tone];
  return <div style={{ background: tones.bg, border: `1px solid ${tones.bd}`, borderRadius: radius.md, padding: pad, ...style }}>{children}</div>;
}

/** Cinematic brand photo band — a framed scene image (public/img/generated) with
 *  a teal gradient that ties it into the dark ground, plus an optional caption.
 *  Warms the data-forward pages with the on-brand image library. */
export function ScenePhoto({ src, alt, caption, eyebrow, video, poster, height = "clamp(260px,40vh,460px)", style }: { src: string; alt: string; caption?: React.ReactNode; eyebrow?: React.ReactNode; video?: string; poster?: string; height?: string; style?: React.CSSProperties }) {
  const reduce = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const media: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" };
  return (
    <section style={{ background: dc.teal, padding: `clamp(24px,4vh,56px) ${dc.pad}`, ...style }}>
      <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
      <div style={{ position: "relative", height, borderRadius: radius.lg, overflow: "hidden", border: "1px solid rgba(238,239,211,0.12)" }}>
        {video && !reduce ? (
          <video src={video} poster={poster} autoPlay muted loop playsInline preload="none" aria-label={alt} style={media} />
        ) : (
          <img src={video && poster ? poster : src} alt={alt} loading="lazy" decoding="async" style={media} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,55,56,0.10) 0%, rgba(0,55,56,0) 42%, rgba(0,55,56,0.80) 100%)" }} />
        {(eyebrow || caption) && (
          <div style={{ position: "absolute", left: "clamp(20px,3vw,40px)", right: "clamp(20px,3vw,40px)", bottom: "clamp(18px,2.6vw,30px)" }}>
            {eyebrow && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: tracking.caps, textTransform: "uppercase", color: onDark.secondary, marginBottom: 7 }}>{eyebrow}</div>}
            {caption && <div style={{ fontSize: "clamp(16px,1.8vw,22px)", fontWeight: 600, letterSpacing: tracking.snug, color: "#eeefd3", maxWidth: "34ch", lineHeight: 1.25 }}>{caption}</div>}
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

export function Mono({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  // Inline font so this works with or without DC_CSS injected (e.g. the
  // self-contained flagship page). tabular-nums keeps animated numbers from jittering.
  return (
    <span style={{ fontFamily: font.mono, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em", ...style }}>
      {children}
    </span>
  );
}

// CountUp — interaction-driven numeric tween. Animates ONLY when `value` changes
// (never on mount → no route-drop opacity/transform hide), reduced-motion safe.
// Drop-in for <Mono> around any live figure so it ticks as inputs change.
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", group = false, duration = 0.55, style }: {
  value: number; decimals?: number; prefix?: string; suffix?: string; group?: boolean; duration?: number; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  // group → thousands separators (currency). Sign placed before the prefix so
  // negatives read "-$454" not "$-454".
  const fmt = (n: number) =>
    group
      ? (n < 0 ? "-" : "") + prefix + Math.round(Math.abs(n)).toLocaleString("en-US") + suffix
      : prefix + n.toFixed(decimals) + suffix;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { el.textContent = fmt(value); return; }
    const obj = { v: from };
    gsap.to(obj, { v: value, duration, ease: "power2.out", overwrite: true, onUpdate: () => { el.textContent = fmt(obj.v); } });
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span ref={ref} style={{ fontFamily: font.mono, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em", ...style }}>
      {fmt(value)}
    </span>
  );
}

// HeroProof — live product surface for tool-page heroes. Replaces the design's
// empty "drop a screenshot" image-slot with the tool's REAL signature metric so
// the hero proves the product is computing, not a faked screenshot frame.
//   value  — the live headline number (already formatted, e.g. "1.11x", "$612K")
//   eyebrow/sub — context lines
//   chip   — small verdict pill ({ label, color })
export function HeroProof({
  eyebrow = "Live preview",
  value,
  valueNum,
  valueFmt,
  sub,
  chip,
  track2Num,                  // investor-survival DSCR → triggers the dual-track reveal
  costsLabel = "after vacancy · management · maintenance · capex",
}: {
  eyebrow?: string;
  value: React.ReactNode;
  valueNum?: number;          // lender DSCR (Track 1) — the headline gauge value
  valueFmt?: (n: number) => string;
  sub?: React.ReactNode;
  chip?: { label: string; color: string };
  track2Num?: number;
  costsLabel?: string;
}) {
  const proofRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const numRef = useRef<SVGTextElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const gapNumRef = useRef<HTMLSpanElement>(null);
  const t2NumRef = useRef<HTMLSpanElement>(null);
  const fmtNum = valueFmt || ((n: number) => n.toFixed(2) + "x");

  const CORAL = "#e0635f";
  const ARC_LEN = Math.PI * 110;            // semicircle gauge, r=110
  const t1 = valueNum ?? (typeof value === "string" ? parseFloat(value) : 0);
  const hasDual = track2Num !== undefined && track2Num < t1 - 0.001;
  const verdictColor = chip?.color || LEMON;
  const zoneColor = (d: number) => (d >= 1.25 ? dc.emerald : d >= 1.0 ? LEMON : CORAL);

  // Paint the gauge (arc fill + colour) and the headline number to a DSCR value.
  const paint = (d: number) => {
    const f = Math.max(0, Math.min(1, d / 2)); // 0–2.0x maps across the semicircle
    if (arcRef.current) {
      arcRef.current.style.strokeDashoffset = String(ARC_LEN * (1 - f));
      arcRef.current.style.stroke = zoneColor(d);
    }
    if (numRef.current) {
      numRef.current.textContent = fmtNum(d);
      numRef.current.style.fill = zoneColor(d);
    }
  };
  const setState = (txt: string, col: string) => {
    if (stateRef.current) { stateRef.current.textContent = txt; stateRef.current.style.color = col; }
  };
  const setGapText = (lender: number, investor: number) => {
    if (gapNumRef.current) gapNumRef.current.textContent = "−" + Math.max(0, lender - investor).toFixed(2) + "x";
    if (t2NumRef.current) t2NumRef.current.textContent = fmtNum(investor);
  };

  // Mount: the reveal. Count up to the lender DSCR (qualifies), then DIP to the
  // investor-survival DSCR (the costs the lender ignores) and recover — the drop
  // IS the message. Rests on the lender number with the gap annotation revealed.
  useGSAP(() => {
    if (!proofRef.current) return;
    if (prefersReducedMotion()) {
      paint(t1);
      setState(t1 >= 1 ? "Lender — qualifies" : "Below the 1.00 floor", zoneColor(t1));
      if (hasDual) { setGapText(t1, track2Num as number); if (gapRef.current) gsap.set(gapRef.current, { autoAlpha: 1, y: 0 }); }
      return;
    }
    paint(0);
    const proxy = { d: 0 };
    const tl = gsap.timeline();
    tl.from(".hp-panel", { y: 16, autoAlpha: 0, duration: 0.55, ease: "expo.out", stagger: 0.07 }, 0)
      .to(proxy, { d: t1, duration: 1.0, ease: "power2.out", onUpdate: () => paint(proxy.d),
            onComplete: () => setState(t1 >= 1 ? "Lender — qualifies" : "Below the 1.00 floor", zoneColor(t1)) }, 0.25);
    if (hasDual) {
      tl.to(gapRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, "+=0.5")
        .to(proxy, { d: track2Num as number, duration: 0.95, ease: "power2.inOut",
              onStart: () => setState("Investor survival — loses money", CORAL),
              onUpdate: () => { paint(proxy.d); setGapText(t1, proxy.d); } }, "<0.1")
        .to(proxy, { d: t1, duration: 0.9, ease: "power2.inOut", onUpdate: () => paint(proxy.d),
              onComplete: () => { setState("Lender qualifies — but the investor doesn't", verdictColor); setGapText(t1, track2Num as number); } }, "+=0.7");
    }
    return () => tl.kill();
  }, { scope: proofRef, dependencies: [] }); // mount only — see the change effect below

  // Deal changes after mount: snap-tween the gauge + gap to the new numbers
  // (no re-dip — the reveal plays once on mount, owned by useGSAP above).
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return; }
    if (prefersReducedMotion()) { paint(t1); if (hasDual) setGapText(t1, track2Num as number); return; }
    const proxy = { d: parseFloat(numRef.current?.textContent || String(t1)) || t1 };
    gsap.to(proxy, { d: t1, duration: 0.5, ease: "power2.out", overwrite: true, onUpdate: () => paint(proxy.d) });
    setState(t1 >= 1 ? "Lender — qualifies" : "Below the 1.00 floor", zoneColor(t1));
    if (hasDual) setGapText(t1, track2Num as number);
  }, [t1, track2Num]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={proofRef} style={{ position: "relative" }}>
      <div
        className="hp-card"
        style={{
          position: "relative",
          width: "100%",
          minHeight: 420,
          aspectRatio: "1.08",
          borderRadius: radius.lg,
          overflow: "hidden",
          background: `linear-gradient(160deg, ${swatch.darkTeal} 0%, #003738 60%, #002a2b 100%)`,
          border: "1px solid rgba(238,239,211,0.16)",
          boxShadow: "inset 0 1px 0 rgba(238,239,211,0.07)",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: "100%", padding: "clamp(24px,3.2vw,38px)", gap: 18 }}>
          {/* Header */}
          <div className="hp-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: LEMON }}>{eyebrow}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(238,239,211,0.55)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: verdictColor, display: "inline-block" }} />
              preliminary scenario
            </div>
          </div>

          {/* The one focal element: a DSCR gauge that tells the dual-track story */}
          <div className="hp-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <svg viewBox="0 0 280 168" width="min(86%, 340px)" style={{ overflow: "visible" }} role="img" aria-label={`DSCR ${typeof value === "string" ? value : ""}`}>
              {/* track */}
              <path d="M30 150 A110 110 0 0 1 250 150" fill="none" stroke="rgba(238,239,211,0.12)" strokeWidth="14" strokeLinecap="round" />
              {/* the 1.00 floor tick (top-centre = 50% of the 0–2.0x sweep) */}
              <line x1="140" y1="30" x2="140" y2="52" stroke="rgba(238,239,211,0.45)" strokeWidth="2" />
              <text x="140" y="22" textAnchor="middle" fill="rgba(238,239,211,0.5)" fontFamily={font.family} fontSize="10" fontWeight="700">1.00 floor</text>
              {/* animated fill */}
              <path ref={arcRef} d="M30 150 A110 110 0 0 1 250 150" fill="none" stroke={LEMON} strokeWidth="14" strokeLinecap="round"
                    style={{ strokeDasharray: ARC_LEN, strokeDashoffset: ARC_LEN }} />
              {/* headline number */}
              <text ref={numRef} x="140" y="132" textAnchor="middle" fill={LEMON} fontFamily={font.mono} fontSize="56" fontWeight="800" letterSpacing="-0.03em">{value}</text>
              <text x="140" y="156" textAnchor="middle" fill="rgba(238,239,211,0.5)" fontFamily={font.family} fontSize="11" fontWeight="700" letterSpacing="0.04em">DSCR · rent ÷ payment</text>
            </svg>

            <div ref={stateRef} style={{ marginTop: 6, fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em", color: LEMON }}>Lender — qualifies</div>

            {/* The reveal: the gap the lender doesn't see */}
            <div ref={gapRef} style={{ marginTop: 14, opacity: 0, transform: "translateY(8px)", background: "rgba(224,99,99,0.09)", border: "1px solid rgba(224,99,99,0.28)", borderRadius: radius.md, padding: "10px 16px", maxWidth: 360 }}>
              <span style={{ fontSize: 12.5, color: "rgba(238,239,211,0.72)", lineHeight: 1.5 }}>
                Investor survival <span ref={t2NumRef} style={{ color: CORAL, fontWeight: 800, fontFamily: font.mono }}>—</span> {costsLabel} · a <span ref={gapNumRef} style={{ color: CORAL, fontWeight: 800, fontFamily: font.mono }}>—</span> gap the lender doesn&apos;t see.
              </span>
            </div>
          </div>

          {/* Footer: real inputs (supporting) + honest verdict */}
          <div className="hp-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12.5, color: "rgba(238,239,211,0.6)", fontFamily: font.mono, letterSpacing: "-0.01em" }}>{sub}</div>
            {chip && (
              <div className="hp-chip" style={{ background: MINT_BG, borderRadius: radius.md, padding: "12px 16px", border: "1px solid rgba(0,55,56,0.12)" }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: RAINFOREST, marginBottom: 3 }}>Verdict</div>
                <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase", color: chip.color }}>{chip.label}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** When true (provided by an embedding workspace), DcShell drops its site
 *  chrome (SiteNav + SiteFooter) so tool pages render bare inside the portal. */
export const DcEmbeddedContext = createContext(false);

// Page wrapper: scope ref + injected CSS + GSAP + nav + content + footer.
export function DcShell({
  children,
  onNavigate,
  navLinks,
  cta,
  accent = MIDNIGHT,
}: {
  children: React.ReactNode;
  onNavigate?: (v: string) => void;
  navLinks?: NavLink[];
  cta?: NavLink;
  /** Nav + footer background — lets each page carry its own colour identity. */
  accent?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  useDcGsap(scope);
  useWheelScrub(scope);
  const embedded = useContext(DcEmbeddedContext);
  if (embedded) {
    // Inside the InvestGO workspace: no site nav/footer, no own page background.
    // Tool pages ship their own dark <section> bg + big padding for the marketing
    // site — here that reads as a framed card-in-a-card. Flatten it: transparent
    // sections, no horizontal padding/border, full width → flush with the workspace.
    return (
      <div ref={scope} className="dc-embedded" style={{ color: MIDNIGHT, fontFamily: font.family, overflowX: "hidden", letterSpacing: "-0.02em" }}>
        <style>{DC_CSS}</style>
        <style>{`
          .dc-embedded main > section{background:transparent !important;background-image:none !important;border:none !important;border-top:none !important;border-bottom:none !important;padding-left:0 !important;padding-right:0 !important;padding-top:0 !important;padding-bottom:clamp(28px,5vh,56px) !important;}
          .dc-embedded main > section + section{padding-top:clamp(20px,3vh,40px) !important;border-top:1px solid rgba(238,239,211,0.16) !important;}
          .dc-embedded main > section > div{max-width:100% !important;}
          .dc-embedded .gs-dot-grid{display:none !important;}
        `}</style>
        <main>{children}</main>
      </div>
    );
  }
  return (
    <div ref={scope} className="dc-shell" style={{ background: PISTACHIO, color: MIDNIGHT, fontFamily: font.family, minHeight: "100vh", overflowX: "hidden", letterSpacing: "-0.02em" }}>
      <style>{DC_CSS}</style>
      {/* Shared site chrome (same nav + footer as the marketing home) so every
          page is framed identically. Per-page navLinks/cta/accent are no longer
          used for the shell — kept in the signature for back-compat only. */}
      <SiteNav onNavigate={onNavigate} />
      <main>{children}</main>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
