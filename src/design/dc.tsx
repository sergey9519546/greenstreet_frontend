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
import React, { useRef, useState, useEffect } from "react";
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
  brokers: "/brokers", investors: "/investors", "borrower-profiles": "/borrower-profiles", "brokers-partner": "/partners",
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
.gs-range{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:999px;background:${FADED}33;outline:none;cursor:pointer;}
.gs-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${MIDNIGHT};border:3px solid ${LEMON};cursor:pointer;transition:transform .15s;}
.gs-range::-webkit-slider-thumb:hover{transform:scale(1.18);}
.gs-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${MIDNIGHT};border:3px solid ${LEMON};cursor:pointer;}
.gs-dot-grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.055) 1px,transparent 1px);background-size:34px 34px;pointer-events:none;}
.gs-mono{font-family:${font.mono};font-variant-numeric:tabular-nums;letter-spacing:-0.03em;}
.ix-card{transition:transform .14s, background .15s;} .ix-card:hover{transform:translateY(-3px);}
.dc-nav a:focus-visible,.dc-nav button:focus-visible,a.dc-cta:focus-visible{outline:2px solid ${LEMON};outline-offset:3px;border-radius:6px;}
/* Floating/pulsing motion neutralized per design taste (no "flow"/glassmorphism). */
@keyframes gsFloat{from,to{transform:none;}}
@keyframes gsPulse{from,to{opacity:1;}}
@keyframes gsBar{from{width:0;}}
.gs-bar{animation:gsBar .8s ease-out both;}
@media (max-width:640px){.dc-navlinks{gap:14px !important;}.dc-navlink{display:none !important;}}
/* Responsive layout hooks — desktop grids stay inline; these stack them on
   small screens (the .dc.html mockups are desktop-only). Add the class to any
   2/3-col hero, band, or tool-split container. */
@media (max-width:900px){
  .dc-hero{grid-template-columns:1fr !important;gap:40px !important;}
  .dc-band-3,.dc-band-2,.dc-split{grid-template-columns:1fr !important;}
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
        gsap.from(hc.children, { y: 44, opacity: 0, duration: 0.9, stagger: 0.13, ease: "power3.out", clearProps: "all" });
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
      document.querySelectorAll(".gs-reveal").forEach((el) => {
        gsap.from(el, { y: 40, opacity: 0, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
      // Pop-in stagger for signature grids/tiles (e.g. the State Laws map cells).
      const pop = document.querySelectorAll(".dc-pop");
      if (pop.length) {
        gsap.from(pop, { scale: 0, opacity: 0, duration: 0.4, stagger: { each: 0.012, from: "start" }, delay: 0.25, ease: "back.out(1.5)", clearProps: "all", scrollTrigger: { trigger: pop[0], start: "top 90%", once: true } });
      }
      const t = setTimeout(() => ScrollTrigger.refresh(), 200);
      return () => clearTimeout(t);
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
  return (
    <div className="btn_main_wrap" data-wf--btn-main--style={variant} style={{ display: "inline-block", ...style }}>
      <div className="g_clickable_wrap">
        <a className="g_clickable_link w-inline-block" {...(href !== undefined ? { href } : {})} onClick={onClick}><span className="g_clickable_text u-sr-only">{label}</span></a>
      </div>
      <div className="btn_main_text" onClick={onClick}>{label}</div>
      <div className="btn-arrow-wrap">
        <div className="btn_main_icon w-embed">
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

// HeroProof — live product surface for tool-page heroes. Replaces the design's
// empty "drop a screenshot" image-slot with the tool's REAL signature metric so
// the hero proves the product is computing, not a faked screenshot frame.
//   value  — the live headline number (already formatted, e.g. "1.11x", "$612K")
//   eyebrow/sub — context lines
//   chip   — small verdict pill ({ label, color })
export function HeroProof({
  eyebrow = "Live preview",
  value,
  sub,
  chip,
}: {
  eyebrow?: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  chip?: { label: string; color: string };
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.1",
          borderRadius: radius.lg,
          overflow: "hidden",
          background: swatch.darkTeal,
          border: "1px solid rgba(238,239,211,0.14)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, padding: "clamp(24px,3vw,40px)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: LEMON }}>{eyebrow}</div>
          <Mono style={{ fontSize: "clamp(52px,7vw,88px)", fontWeight: 600, color: PISTACHIO, lineHeight: 0.9 }}>{value}</Mono>
          {sub && <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "rgba(238,239,211,0.6)" }}>{sub}</div>}
        </div>
      </div>
      {chip && (
        <div style={{ position: "absolute", bottom: -18, right: -14, background: MINT_BG, borderRadius: radius.md, padding: "16px 20px", zIndex: 2, border: "1px solid rgba(0,55,56,0.12)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: RAINFOREST, marginBottom: 4 }}>Verdict</div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: chip.color }}>{chip.label}</div>
        </div>
      )}
    </div>
  );
}

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
  return (
    <div ref={scope} style={{ background: PISTACHIO, color: MIDNIGHT, fontFamily: font.family, minHeight: "100vh", overflowX: "hidden", letterSpacing: "-0.02em" }}>
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
