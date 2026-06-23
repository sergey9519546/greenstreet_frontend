// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { HowItWorks } from "./HowItWorks";
import { Logo } from "../components/Logo";

// Design tokens — single source of truth in src/theme.ts (Webflow-faithful)
import { PISTACHIO, MINT_BG, MIDNIGHT, RAINFOREST, LEMON, FADED } from "../theme";

type View =
  | "marketing" | "portal" | "products" | "solutions" | "about"
  | "careers" | "case-studies" | "blog" | "faq" | "rate-quiz"
  | "legal" | "dscr-calculator" | "lender-intel" | "state-laws"
  | "deal-analyzer" | "borrower-profiles" | "brokers" | "investors";

const NAV: { label: string; view: View }[] = [
  { label: "Product", view: "products" },
  { label: "Who We Serve", view: "solutions" },
  { label: "Resources", view: "blog" },
  { label: "About", view: "about" },
];

const FOOTER: { h: string; links: { label: string; view: View }[] }[] = [
  {
    h: "Product",
    links: [
      { label: "Deal Analyzer", view: "deal-analyzer" },
      { label: "DSCR Calculator", view: "dscr-calculator" },
      { label: "Lender Intelligence", view: "lender-intel" },
      { label: "State Rules", view: "state-laws" },
    ],
  },
  {
    h: "Who We Serve",
    links: [
      { label: "Mortgage Brokers", view: "brokers" },
      { label: "Real Estate Investors", view: "investors" },
      { label: "Borrower Profiles", view: "borrower-profiles" },
      { label: "Rate Quiz", view: "rate-quiz" },
    ],
  },
  {
    h: "Company",
    links: [
      { label: "About", view: "about" },
      { label: "Careers", view: "careers" },
      { label: "Case Studies", view: "case-studies" },
      { label: "Blog", view: "blog" },
    ],
  },
  {
    h: "Resources",
    links: [
      { label: "FAQ", view: "faq" },
      { label: "Privacy Policy", view: "legal", href: "/privacy-policy" },
      { label: "Terms of Service", view: "legal", href: "/terms-of-service" },
    ],
  },
];

export function PageShell({ title, subtitle, children, onBack, onNavigate }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack: () => void;
  onNavigate: (view: View) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const g = (window as any).gsap;
    const ST = (window as any).ScrollTrigger;
    if (!g || !ST) return;

    const kills: any[] = [];

    // Header: stagger-in on mount (label → h1 → subtitle)
    if (headerRef.current) {
      const headerEls = headerRef.current.children;
      kills.push(
        g.from(headerEls, {
          y: 52, opacity: 0, duration: 0.85,
          stagger: 0.13, ease: "power3.out", clearProps: "all",
        })
      );
    }

    // Main content: batch-reveal children as they scroll in
    if (mainRef.current) {
      const targets = mainRef.current.querySelectorAll(":scope > *");
      targets.forEach((el, i) => {
        kills.push(
          g.from(el, {
            y: 40, opacity: 0, duration: 0.7,
            ease: "power3.out", clearProps: "all",
            delay: i < 3 ? i * 0.07 : 0,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          })
        );
      });
    }

    return () => { kills.forEach((t) => { try { t?.scrollTrigger?.kill(); t?.kill?.(); } catch (_) {} }); };
  }, [title]);  // re-run when page changes

  return (
    <div style={{ minHeight: "100vh", background: PISTACHIO, color: MIDNIGHT, fontFamily: "Outfit, sans-serif" }}>
      <style>{`
        .gs-nav-links { display: flex; align-items: center; gap: 32px; }
        .gs-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
        .gs-mobile-menu { display: none; }
        .gs-dark-header h1 {
          font-size: clamp(36px, 5.5vw, 76px) !important;
          font-weight: 700 !important;
          color: #EEEFD3 !important;
          letter-spacing: -0.03em !important;
          line-height: 1.06 !important;
          margin: 0 0 20px 0 !important;
          max-width: 1000px !important;
          font-family: "Outfit Variable", Outfit, Arial, sans-serif !important;
        }
        .gs-dark-header p {
          font-size: 18px !important;
          color: rgba(238,239,211,0.7) !important;
          max-width: 720px !important;
          line-height: 1.6 !important;
          margin: 0 !important;
          font-family: "Outfit Variable", Outfit, Arial, sans-serif !important;
        }
        .gs-dark-header .gs-eyebrow {
          color: #d8d958 !important;
          font-family: "Outfit Variable", Outfit, Arial, sans-serif !important;
        }
        @media (max-width: 768px) {
          .gs-nav-links { display: none; }
          .gs-hamburger { display: flex; flex-direction: column; gap: 5px; }
          .gs-mobile-menu { display: ${menuOpen ? "flex" : "none"}; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: ${PISTACHIO}; border-bottom: 1px solid ${FADED}; padding: 16px clamp(1.5rem, 4vw, 2rem) 24px; gap: 0; z-index: 49; }
          .gs-mobile-menu a { display: block; padding: 12px 0; color: ${MIDNIGHT}; font-size: 16px; font-weight: 500; text-decoration: none; border-bottom: 1px solid ${FADED}; }
          .gs-mobile-menu a:last-child { border-bottom: none; margin-top: 12px; background: ${LEMON}; color: ${MIDNIGHT}; text-align: center; border-radius: 8px; padding: 12px; font-weight: 700; }
        }
      `}</style>
      {/* Global nav — full-width with inner padding */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px clamp(1.5rem, 4vw, 4rem)",
        borderBottom: `1px solid ${FADED}`,
        background: PISTACHIO,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Logo variant="dark" size={20} href="/" onClick={(e) => { e.preventDefault(); onBack(); }} />
        {/* Desktop nav */}
        <div className="gs-nav-links">
          <a href="/dscrgo" onClick={(e) => { e.preventDefault(); onNavigate("portal"); }}
             style={{ color: RAINFOREST, fontWeight: 700, fontSize: "15px", textDecoration: "none" }}>DSCRGo</a>
          {NAV.map((n) => (
            <a key={n.view} href={`/${n.view}`}
               onClick={(e) => { e.preventDefault(); onNavigate(n.view); }}
               style={{ color: MIDNIGHT, fontSize: "15px", textDecoration: "none", fontWeight: 500, cursor: "pointer" }}>
              {n.label}
            </a>
          ))}
          <a href="/dscrgo" onClick={(e) => { e.preventDefault(); onNavigate("portal"); }}
             style={{ color: MIDNIGHT, fontSize: "15px", textDecoration: "underline", textUnderlineOffset: "4px", cursor: "pointer" }}>Login</a>
          <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate("rate-quiz"); }}
             style={{
               background: LEMON, color: MIDNIGHT, padding: "12px 24px", borderRadius: "8px",
               fontWeight: 700, fontSize: "15px", textDecoration: "none", border: `0.094rem solid ${LEMON}`,
               transition: "background-color 0.15s, color 0.15s", cursor: "pointer",
             }}
             onMouseEnter={(e) => { e.currentTarget.style.background = MIDNIGHT; e.currentTarget.style.color = MINT_BG; e.currentTarget.style.borderColor = MIDNIGHT; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = LEMON; e.currentTarget.style.color = MIDNIGHT; e.currentTarget.style.borderColor = LEMON; }}
          >Book a demo</a>
        </div>
        {/* Hamburger */}
        <button className="gs-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span style={{ display: "block", width: 22, height: 2, background: MIDNIGHT, borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2, background: MIDNIGHT, borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2, background: MIDNIGHT, borderRadius: 2 }} />
        </button>
        {/* Mobile dropdown */}
        <div className="gs-mobile-menu">
          <a href="/dscrgo" onClick={(e) => { e.preventDefault(); onNavigate("portal"); closeMenu(); }}>DSCRGo</a>
          {NAV.map((n) => (
            <a key={n.view} href={`/${n.view}`} onClick={(e) => { e.preventDefault(); onNavigate(n.view); closeMenu(); }}>{n.label}</a>
          ))}
          <a href="/dscrgo" onClick={(e) => { e.preventDefault(); onNavigate("portal"); closeMenu(); }}>Login</a>
          <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate("rate-quiz"); closeMenu(); }}>Book a demo</a>
        </div>
      </nav>

      {/* Page header — dark hero band matching Webflow marketing page treatment */}
      <header ref={headerRef} className="gs-dark-header" style={{
        background: MIDNIGHT,
        padding: "clamp(48px, 7vw, 96px) clamp(1.5rem, 4vw, 4rem) clamp(40px, 5vw, 72px)",
      }}>
        <div className="gs-eyebrow" style={{
          display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", marginBottom: "20px", opacity: 0.9,
        }}>Greenstreet Finance</div>
        <h1 style={{
          fontSize: "clamp(36px, 5.5vw, 76px)", fontWeight: 700,
          marginBottom: "20px", lineHeight: 1.06, letterSpacing: "-0.03em", maxWidth: "1000px",
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "18px", maxWidth: "720px", lineHeight: 1.6 }}>
            {subtitle}
          </p>
        )}
      </header>

      {/* Content — full-width with inner padding */}
      <main ref={mainRef} style={{ padding: "24px clamp(1.5rem, 4vw, 4rem) 40px" }}>{children}</main>

      {/* Blue animated "How It Works" band — on every inner page */}
      <HowItWorks onCTA={() => onNavigate("rate-quiz")} />

      {/* Global footer — full-width */}
      <footer style={{ background: MIDNIGHT, color: PISTACHIO, marginTop: "40px" }}>
        <div style={{
          padding: "56px clamp(1.5rem, 4vw, 4rem) 40px",
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1.4fr) repeat(4, minmax(0, 1fr))",
          gap: "clamp(24px, 3vw, 56px)",
        }}>
          <div>
            <div style={{ marginBottom: "14px" }}>
              <Logo variant="light" size={20} href="/" onClick={(e) => { e.preventDefault(); onNavigate("marketing"); }} />
            </div>
            <p style={{ fontSize: "13px", color: "#9fb0a8", lineHeight: 1.6, maxWidth: "280px" }}>
              The fastest path from a rental property to a fundable DSCR loan.
            </p>
          </div>
          {FOOTER.map((col) => (
            <div key={col.h}>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>{col.h}</div>
              {col.links.map((l) => (
                <a key={l.label} href={(l as any).href ?? `/${l.view}`}
                   onClick={(e) => { e.preventDefault(); if ((l as any).href) { window.history.pushState({}, "", (l as any).href); window.dispatchEvent(new PopStateEvent("popstate")); } else { onNavigate(l.view); } }}
                   style={{ display: "block", color: "#b9c7c0", fontSize: "13px", textDecoration: "none", marginBottom: "9px", cursor: "pointer" }}>
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          padding: "20px clamp(1.5rem, 4vw, 4rem) 40px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
          fontSize: "12px", color: "#8a9a93",
        }}>
          <span>© 2026 Greenstreet Finance. All rights reserved.</span>
          <span style={{ display: "flex", gap: "20px" }}>
            <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/privacy-policy"); window.dispatchEvent(new PopStateEvent("popstate")); }}
               style={{ color: "#8a9a93", textDecoration: "none", cursor: "pointer" }}>Privacy Policy</a>
            <a href="/terms-of-service" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/terms-of-service"); window.dispatchEvent(new PopStateEvent("popstate")); }}
               style={{ color: "#8a9a93", textDecoration: "none", cursor: "pointer" }}>Terms of Service</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export const card: React.CSSProperties = {
  background: MINT_BG,
  border: `0.094rem solid ${FADED}`,
  borderRadius: "8px",
  padding: "28px",
};

export const sectionTitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: RAINFOREST,
  marginBottom: "20px",
};