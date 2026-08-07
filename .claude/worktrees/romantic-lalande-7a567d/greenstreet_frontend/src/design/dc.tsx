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
import { PISTACHIO, MINT_BG, MIDNIGHT, RAINFOREST, LEMON, FADED, font, swatch, radius } from "../theme";
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
} as const;

// View → canonical path (kept in sync with resolve.ts ROUTE_MAP) so DcNav links
// render real hrefs instead of dead "#" anchors.
const VIEW_HREF: Record<string, string> = {
  marketing: "/", portal: "/investgo",
  brokers: "/brokers", investors: "/investors", "borrower-profiles": "/borrower-profiles", "brokers-partner": "/partnerships",
  "dscr-calculator": "/dscr-calculator", "lender-intel": "/lender-intel", "state-laws": "/state-laws",
  "deal-analyzer": "/deal-analyzer", "decision-support": "/decision-support",
  faq: "/faq", blog: "/blog", "case-studies": "/case-studies", about: "/about", careers: "/careers",
  legal: "/legal", "rate-quiz": "/rate-quiz", products: "/products", solutions: "/solutions", "book-demo": "/book-demo",
  "refi-tracker": "/tools/refi-tracker", "arm-reset": "/tools/arm-reset", "monte-carlo": "/tools/monte-carlo",
  returns: "/tools/returns", "tax-engine": "/tools/tax-engine", "stress-matrix": "/tools/stress-matrix",
  "str-underwriting": "/tools/str-underwriting", portfolio: "/tools/portfolio",
};

// Shared CSS injected once per page.
export const DC_CSS = `
.gs-num::-webkit-outer-spin-button,.gs-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.gs-num{width:100%;border:none;background:none;outline:none;font-family:${font.family};color:${MIDNIGHT};letter-spacing:-0.02em;}
/* number boxes are wheel-scrubbable (see useWheelScrub) — signal it on hover */
input[type="number"]{cursor:ns-resize;}
.gs-range{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:999px;background:rgba(238,239,211,0.18);outline:none;cursor:pointer;}
.gs-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${MIDNIGHT};border:3px solid ${LEMON};cursor:pointer;transition:transform .15s;}
.gs-range::-webkit-slider-thumb:hover{transform:scale(1.18);}
.gs-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${MIDNIGHT};border:3px solid ${LEMON};cursor:pointer;}
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

export type NavLink = { label: string; view?: string; href?: string; onClick?: (e: React.MouseEvent) => void };

// Sticky dark nav. Links route via onNavigate when a view is given. Secondary
// links collapse under 640px (CSS); wordmark + primary CTA always visible.
export function DcNav({
  onNavigate,
  links = [],
  cta,
  bg = MIDNIGHT,
}: {
  onNavigate?: (v: string) => void;
  links?: NavLink[];
  cta?: NavLink;
  bg?: string;
}) {
  const handle = (l: NavLink) => (e: React.MouseEvent) => {
    if (l.onClick) { e.preventDefault(); l.onClick(e); }
    else if (l.view && onNavigate) { e.preventDefault(); onNavigate(l.view); }
  };
  // Real href per view (canonical paths from resolve.ts) so links aren't dead
  // "#" anchors — middle-click, copy-link, and no-JS all work; onClick SPA-navs.
  const hrefFor = (l: NavLink) => l.href || (l.view ? VIEW_HREF[l.view] : undefined) || "#";
  return (
    <nav className="dc-nav" style={{ position: "sticky", top: 0, zIndex: 50, background: bg, borderBottom: "1px solid rgba(238,239,211,0.12)" }}>
      <div style={{ maxWidth: dc.maxW, margin: "0 auto", padding: `0 ${dc.pad}`, display: "flex", alignItems: "center", justifyContent: "space-between", height: 74 }}>
        <a href="/" onClick={(e) => { e.preventDefault(); onNavigate?.("marketing"); }} style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.04em", color: PISTACHIO, textDecoration: "none" }}>Greenstreet</a>
        <div className="dc-navlinks" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {links.map((l) => (
            <a key={l.label} className="dc-navlink" href={hrefFor(l)} onClick={handle(l)} style={{ color: "rgba(238,239,211,0.78)", fontWeight: 500, textDecoration: "none", fontSize: 15, letterSpacing: "-0.01em" }}>{l.label}</a>
          ))}
          {cta && (
            <a className="dc-cta" href={hrefFor(cta)} onClick={handle(cta)} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: LEMON, color: MIDNIGHT, fontWeight: 600, fontSize: 14, textDecoration: "none", padding: "11px 22px", borderRadius: 6 }}>{cta.label}</a>
          )}
        </div>
      </div>
    </nav>
  );
}

export function DcFooter({ bg = MIDNIGHT }: { bg?: string } = {}) {
  return (
    <footer style={{ background: bg, color: "rgba(238,239,211,0.55)", padding: `48px ${dc.pad}` }}>
      <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.04em", color: PISTACHIO }}>Greenstreet</div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>© 2026 Greenstreet Finance</div>
      </div>
    </footer>
  );
}

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

/** Webflow primary/secondary button (lemon-lime fill, arrow) — matches home. */
export function Btn({ label, onClick, href, variant = "primary", style }: { label: string; onClick?: (e: React.MouseEvent) => void; href?: string; variant?: "primary" | "secondary"; style?: React.CSSProperties }) {
  // Explicit lemon/dark styling so the label is always high-contrast, regardless
  // of which Webflow variant CSS would otherwise tint it (teal-on-teal was unreadable).
  const dark = variant === "secondary";
  return (
    <div
      className="btn_main_wrap"
      data-wf--btn-main--style={variant}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer",
        background: dark ? "transparent" : LEMON,
        color: dark ? PISTACHIO : MIDNIGHT,
        border: dark ? `1.5px solid ${PISTACHIO}55` : "none",
        borderRadius: 8, padding: "13px 24px", minHeight: 44, ...style,
      }}
    >
      <div className="g_clickable_wrap" style={{ display: "contents" }}>
        <a className="g_clickable_link w-inline-block" {...(href !== undefined ? { href } : {})} onClick={onClick}><span className="g_clickable_text u-sr-only">{label}</span></a>
      </div>
      <div className="btn_main_text" style={{ color: "inherit", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{label}</div>
      <div className="btn-arrow-wrap" style={{ display: "inline-flex", color: "inherit" }}>
        <div className="btn_main_icon w-embed" style={{ width: 18, height: 18 }}>
          <svg fill="none" height="100%" viewBox="0 0 24 25" width="100%" xmlns="http://www.w3.org/2000/svg"><path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"></path></svg>
        </div>
      </div>
    </div>
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
}: {
  eyebrow?: string;
  value: React.ReactNode;
  valueNum?: number;          // when given, the KPI tweens on change
  valueFmt?: (n: number) => string;
  sub?: React.ReactNode;
  chip?: { label: string; color: string };
}) {
  const proofRef = useRef<HTMLDivElement>(null);
  const kpiTextRef = useRef<SVGTextElement>(null);
  const prevNum = useRef<number | undefined>(valueNum);
  const fmtNum = valueFmt || ((n: number) => n.toFixed(2) + "x");
  // Interaction-driven KPI tween: animate the SVG headline number when valueNum
  // changes (never on mount), reduced-motion safe.
  useEffect(() => {
    const el = kpiTextRef.current;
    if (!el || valueNum === undefined) return;
    const from = prevNum.current;
    prevNum.current = valueNum;
    if (from === undefined || from === valueNum || prefersReducedMotion()) { el.textContent = fmtNum(valueNum); return; }
    const o = { v: from };
    gsap.to(o, { v: valueNum, duration: 0.55, ease: "power2.out", overwrite: true, onUpdate: () => { el.textContent = fmtNum(o.v); } });
  }, [valueNum]); // eslint-disable-line react-hooks/exhaustive-deps
  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const root = proofRef.current;
      if (!root || reduce) return;

      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
      tl.from(".hp-panel", { y: 18, autoAlpha: 0.88, duration: 0.55, ease: "expo.out", stagger: 0.06 }, 0.12)
        .from(".hp-kpi", { scale: 0.94, duration: 0.72, ease: "back.out(1.25)" }, 0.18)
        .from(".hp-bar-fill", { scaleX: 0.16, transformOrigin: "0% 50%", duration: 0.78, ease: "power3.out", stagger: 0.09 }, 0.22)
        .fromTo(".hp-flow", { strokeDashoffset: 220 }, { strokeDashoffset: 0, duration: 1.05, ease: "circ.out", stagger: 0.08 }, 0.26)
        .from(".hp-node", { scale: 0.72, autoAlpha: 0.65, duration: 0.42, ease: "elastic.out(1,0.55)", stagger: 0.07 }, 0.38)
        .from(".hp-chip", { x: 14, autoAlpha: 0.9, duration: 0.46, ease: "power4.out" }, 0.48);

      return () => {
        tl.kill();
      };
    },
    { scope: proofRef }
  );

  const valueText = typeof value === "string" ? value : "";
  const subText = typeof sub === "string" ? sub : "";
  const parts = subText.split(/\s*\+\s*|÷/).map((p) => p.trim()).filter(Boolean);
  const leftInput = parts[0] || "Rent";
  const rightInput = parts[1] || "PITIA";
  const verdictColor = chip?.color || LEMON;
  const signalBars = [
    { label: "Income cover", width: "82%", value: "82%", color: dc.emerald },
    { label: "Lender floor", width: "72%", value: "1.00x", color: LEMON },
    { label: "Reserve drag", width: "28%", value: "18%", color: "#7fb7b5" },
  ];
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
          background: `linear-gradient(135deg, ${swatch.darkTeal} 0%, #003738 54%, #002d2e 100%)`,
          border: "1px solid rgba(238,239,211,0.18)",
          boxShadow: "inset 0 1px 0 rgba(238,239,211,0.08)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(238,239,211,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.55,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: "100%", padding: "clamp(22px,3vw,34px)", gap: 20 }}>
          <div className="hp-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: LEMON }}>{eyebrow}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(238,239,211,0.62)", fontSize: 12, fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: verdictColor, display: "inline-block" }} />
              preliminary scenario
            </div>
          </div>

          <div className="hp-main-grid">
            <div className="hp-panel" style={{ display: "grid", gap: 14 }}>
              <div className="hp-input-grid">
                <div style={{ background: "rgba(238,239,211,0.08)", border: "1px solid rgba(238,239,211,0.12)", borderRadius: radius.md, padding: "13px 14px" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(238,239,211,0.5)", fontWeight: 800, marginBottom: 6 }}>Rent input</div>
                  <Mono style={{ color: PISTACHIO, fontSize: 20, fontWeight: 800 }}>{leftInput}</Mono>
                </div>
                <div style={{ background: "rgba(238,239,211,0.08)", border: "1px solid rgba(238,239,211,0.12)", borderRadius: radius.md, padding: "13px 14px" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(238,239,211,0.5)", fontWeight: 800, marginBottom: 6 }}>PITIA load</div>
                  <Mono style={{ color: PISTACHIO, fontSize: 20, fontWeight: 800 }}>{rightInput}</Mono>
                </div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {signalBars.map(({ label, width, value: barValue, color }) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: "104px 1fr 44px", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(238,239,211,0.58)" }}>{label}</div>
                    <div style={{ height: 8, borderRadius: 99, background: "rgba(238,239,211,0.1)", overflow: "hidden" }}>
                      <div className="hp-bar-fill" style={{ width, height: "100%", borderRadius: 99, background: color }} />
                    </div>
                    <Mono style={{ color: PISTACHIO, fontSize: 12, fontWeight: 800, textAlign: "right" }}>{barValue}</Mono>
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-panel" style={{ position: "relative", minHeight: 250 }}>
              <svg viewBox="0 0 360 250" width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }} role="img" aria-label={`DSCR preview ${valueText}`}>
                <defs>
                  <linearGradient id="hp-flow-grad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor={LEMON} stopOpacity="0.35" />
                    <stop offset="55%" stopColor={dc.emerald} stopOpacity="0.92" />
                    <stop offset="100%" stopColor={PISTACHIO} stopOpacity="0.65" />
                  </linearGradient>
                </defs>
                <path className="hp-flow" d="M26 72 C82 40 116 53 156 102 C190 144 224 143 322 118" fill="none" stroke="url(#hp-flow-grad)" strokeWidth="4" strokeLinecap="round" strokeDasharray="220" />
                <path className="hp-flow" d="M33 174 C95 183 114 151 157 126 C206 98 246 71 332 75" fill="none" stroke={LEMON} strokeOpacity="0.44" strokeWidth="3" strokeLinecap="round" strokeDasharray="220" />
                <circle className="hp-node" cx="28" cy="72" r="10" fill={LEMON} />
                <circle className="hp-node" cx="156" cy="104" r="13" fill={dc.emerald} />
                <circle className="hp-node" cx="322" cy="118" r="10" fill={PISTACHIO} />
                <circle className="hp-node" cx="33" cy="174" r="8" fill="#7fb7b5" />
                <circle className="hp-node" cx="332" cy="75" r="8" fill={LEMON} />
                <g className="hp-kpi">
                  <rect x="96" y="65" width="170" height="110" rx="22" fill="rgba(0,45,46,0.94)" stroke="rgba(238,239,211,0.2)" />
                  <text x="181" y="93" textAnchor="middle" fill={LEMON} fontFamily={font.family} fontSize="12" fontWeight="800" letterSpacing="1.2">DSCR CORE</text>
                  <text ref={kpiTextRef} x="181" y="139" textAnchor="middle" fill={PISTACHIO} fontFamily={font.mono} fontSize="48" fontWeight="800">{valueNum !== undefined ? fmtNum(valueNum) : valueText}</text>
                  <text x="181" y="160" textAnchor="middle" fill="rgba(238,239,211,0.58)" fontFamily={font.family} fontSize="12" fontWeight="700">rent / full payment</text>
                </g>
              </svg>
            </div>
          </div>

          <div className="hp-panel hp-logic-row">
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(238,239,211,0.48)" }}>Matched file logic</div>
              <div className="hp-logic-grid">
                {["DSCR floor", "LTV band", "State rule"].map((label, i) => (
                  <div key={label} style={{ borderRadius: radius.sm, border: "1px solid rgba(238,239,211,0.12)", padding: "9px 10px", background: i === 0 ? "rgba(216,217,88,0.12)" : "rgba(238,239,211,0.06)" }}>
                    <div style={{ fontSize: 10, color: "rgba(238,239,211,0.48)", fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: PISTACHIO, fontWeight: 800 }}>{i === 0 ? "passes" : i === 1 ? "75%" : "screened"}</div>
                  </div>
                ))}
              </div>
            </div>
            {chip && (
              <div className="hp-chip" style={{ background: MINT_BG, borderRadius: radius.md, padding: "14px 16px", border: "1px solid rgba(0,55,56,0.12)", minWidth: 118 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: RAINFOREST, marginBottom: 4 }}>Verdict</div>
                <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: chip.color }}>{chip.label}</div>
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
          .dc-embedded main > section + section{padding-top:clamp(20px,3vh,40px) !important;border-top:1px solid rgba(238,239,211,0.1) !important;}
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
