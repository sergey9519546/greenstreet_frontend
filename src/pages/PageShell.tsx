import React, { useState, useEffect, useRef } from "react";
import { HowItWorks } from "./HowItWorks";
import { Logo } from "../components/Logo";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

const FOOTER: { h: string; links: { label: string; view: View; href?: string }[] }[] = [
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
    // Dynamic SEO
    if (title) {
      document.title = `${title} | Greenstreet Finance`;
    }
    if (subtitle) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", subtitle);
      }
    }
    
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [title, subtitle]);

  useGSAP(() => {
    // Header: stagger-in on mount (label → h1 → subtitle)
    if (headerRef.current) {
      const headerEls = headerRef.current.children;
      gsap.from(headerEls, {
        y: 52, opacity: 0, duration: 0.85,
        stagger: 0.13, ease: "power3.out", clearProps: "all",
      });
    }

    // Main content: batch-reveal children as they scroll in
    if (mainRef.current) {
      const targets = mainRef.current.querySelectorAll(":scope > *");
      targets.forEach((el, i) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.7,
          ease: "power3.out", clearProps: "all",
          delay: i < 3 ? i * 0.07 : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });
    }
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
      {/* Webflow Design System Navbar */}
      <nav className="nav" data-wf--nav-main--variant="greenstreet" style={{ position: "sticky", top: 0, zIndex: 50, background: PISTACHIO, borderBottom: `1px solid ${FADED}` }}>
        <div className="nav-contain u-container">
          <div className="nav-wrap">
            <a className="nav-logo-wrap w-inline-block" href="/" onClick={(e) => { e.preventDefault(); onBack(); }}>
              <div className="nav-logo w-embed">
                <span style={{
                  fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif',
                  fontSize: "28px",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  color: "currentColor",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  display: "inline-block"
                }}>Greenstreet Finance</span>
              </div>
            </a>
            
            <div className="nav-links-contain">
              <div className="nav-links-wrap">
                <a className="nav-link w-inline-block" href="/investorgo" onClick={(e) => { e.preventDefault(); onNavigate("portal"); }}>
                  <div className="nav_links_text font-go" style={{ color: RAINFOREST, fontWeight: 700 }}>
                    Investor<span style={{ color: MIDNIGHT, fontWeight: 500 }}>GO</span>
                  </div>
                </a>
                <a className="nav-link w-inline-block" href="/products" onClick={(e) => { e.preventDefault(); onNavigate("products"); }}>
                  <div className="nav_links_text">Product</div>
                </a>
                <a className="nav-link w-inline-block" href="/solutions" onClick={(e) => { e.preventDefault(); onNavigate("solutions"); }}>
                  <div className="nav_links_text">Who We Serve</div>
                </a>
                <a className="nav-link w-inline-block" href="/blog" onClick={(e) => { e.preventDefault(); onNavigate("blog"); }}>
                  <div className="nav_links_text">Resources</div>
                </a>
                <a className="nav-link w-inline-block" href="/about" onClick={(e) => { e.preventDefault(); onNavigate("about"); }}>
                  <div className="nav_links_text">About</div>
                </a>
                <a className="nav-link is-underline w-inline-block" href="/investorgo" onClick={(e) => { e.preventDefault(); onNavigate("portal"); }}>
                  <div>Login</div>
                </a>
                <div className="nav-btn">
                  <div className="btn_main_wrap" data-wf--btn-main--style="secondary">
                    <a className="g_clickable_link w-inline-block" href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate("rate-quiz"); }}>
                      <span className="g_clickable_text u-sr-only">Book a demo</span>
                    </a>
                    <div aria-hidden="true" className="btn_main_text" onClick={() => onNavigate("rate-quiz")}>Book a demo</div>
                    <div className="btn-arrow-wrap">
                      <div className="btn_main_icon w-embed">
                        <svg fill="none" height="100%" viewBox="0 0 24 25" width="100%" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Burger toggle for mobile */}
            <div className="burger-wrap" style={{ cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)}>
              <div className="burger-line top"></div>
              <div className="burger-line middle"></div>
              <div className="burger-line bottom"></div>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu rendering */}
        {menuOpen && (
          <div className="menu-mobile-wrap" style={{ display: "flex", flexDirection: "column", position: "absolute", top: "100%", left: 0, right: 0, background: PISTACHIO, borderBottom: `1px solid ${FADED}`, padding: "16px 24px 24px", gap: "12px", zIndex: 49 }}>
            <a href="/investorgo" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate("portal"); setMenuOpen(false); }}><span>Investor</span><span style={{ color: RAINFOREST, fontWeight: 700 }}>GO</span></a>
            <a href="/products" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate("products"); setMenuOpen(false); }}>Product</a>
            <a href="/solutions" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate("solutions"); setMenuOpen(false); }}>Who We Serve</a>
            <a href="/blog" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate("blog"); setMenuOpen(false); }}>Resources</a>
            <a href="/about" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate("about"); setMenuOpen(false); }}>About</a>
            <a href="/investorgo" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate("portal"); setMenuOpen(false); }}>Login</a>
            <a href="/rate-quiz" className="nav-link" style={{ background: LEMON, textAlign: "center", borderRadius: "8px", padding: "12px", fontWeight: 700 }} onClick={(e) => { e.preventDefault(); onNavigate("rate-quiz"); setMenuOpen(false); }}>Book a demo</a>
          </div>
        )}
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

      {/* Webflow Design System Footer */}
      <div className="footer_component">
        <footer className="footer_wrap">
          <h2 className="footer_title u-sr-only">Footer</h2>
          <div className="footer_contain u-container">
            <a aria-current="page" className="footer_logo_wrap w-inline-block w--current" href="/" onClick={(e) => { e.preventDefault(); onNavigate("marketing"); }}>
              <div className="footer_logo w-embed">
                <span style={{
                  fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif',
                  fontSize: "24px",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  color: "currentColor",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  display: "inline-block"
                }}>Greenstreet Finance</span>
              </div>
            </a>
            <nav className="footer_layout u-grid-autofit">
              <section className="footer_group_wrap u-column-2">
                <h3 className="footer_group_title u-text-style-h4 u-mb-2">Product</h3>
                <div className="footer_group_list u-grid-column-2">
                  <a className="footer_link_wrap w-inline-block" href="/dscr-calculator" onClick={(e) => { e.preventDefault(); onNavigate("dscr-calculator"); }}>
                    <div className="footer_link_text u-weight-bold">DSCR Calculator</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/deal-analyzer" onClick={(e) => { e.preventDefault(); onNavigate("deal-analyzer"); }}>
                    <div className="footer_link_text u-weight-bold">Deal Analyzer</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate("lender-intel"); }}>
                    <div className="footer_link_text u-weight-bold">Lender Intelligence</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/state-laws" onClick={(e) => { e.preventDefault(); onNavigate("state-laws"); }}>
                    <div className="footer_link_text u-weight-bold">State Regulations</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/borrower-profiles" onClick={(e) => { e.preventDefault(); onNavigate("borrower-profiles"); }}>
                    <div className="footer_link_text u-weight-bold">DSCR Borrower Profiles</div>
                  </a>
                </div>
              </section>
              <section className="footer_group_wrap">
                <h3 className="footer_group_title u-text-style-h4 u-mb-2">Who We Serve</h3>
                <div className="footer_group_list">
                  <a className="footer_link_wrap w-inline-block" href="/brokers" onClick={(e) => { e.preventDefault(); onNavigate("brokers"); }}>
                    <div className="footer_link_text u-weight-bold">Mortgage Brokers</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/investors" onClick={(e) => { e.preventDefault(); onNavigate("investors"); }}>
                    <div className="footer_link_text u-weight-bold">Private Funds</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate("rate-quiz"); }}>
                    <div className="footer_link_text u-weight-bold">Rate Quiz</div>
                  </a>
                </div>
              </section>
              <section className="footer_group_wrap">
                <h3 className="footer_group_title u-text-style-h4 u-mb-2">Company</h3>
                <div className="footer_group_list">
                  <a className="footer_link_wrap w-inline-block" href="/about" onClick={(e) => { e.preventDefault(); onNavigate("about"); }}>
                    <div className="footer_link_text u-weight-bold">About</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/careers" onClick={(e) => { e.preventDefault(); onNavigate("careers"); }}>
                    <div className="footer_link_text u-weight-bold">Jobs</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/security.html">
                    <div className="footer_link_text u-weight-bold">Security & Privacy</div>
                  </a>
                </div>
              </section>
              <section className="footer_group_wrap">
                <h3 className="footer_group_title u-text-style-h4 u-mb-2">Resources</h3>
                <div className="footer_group_list">
                  <a className="footer_link_wrap w-inline-block" href="/blog" onClick={(e) => { e.preventDefault(); onNavigate("blog"); }}>
                    <div className="footer_link_text u-weight-bold">Greenstreet Guidance</div>
                  </a>
                  <a className="footer_link_wrap w-inline-block" href="/case-studies" onClick={(e) => { e.preventDefault(); onNavigate("case-studies"); }}>
                    <div className="footer_link_text u-weight-bold">Customer Stories</div>
                  </a>
                </div>
              </section>
            </nav>
          </div>
          <div className="footer_bottom_wrap">
            <div className="footer_bottom_contain u-container">
              <div className="footer_bottom_text">© 2026 Greenstreet Finance. All rights reserved.</div>
              <div className="footer_bottom_list">
                <a className="footer_bottom_link_wrap w-inline-block" href="/privacy-policy" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/privacy-policy"); window.dispatchEvent(new PopStateEvent("popstate")); }}>
                  <div className="footer_bottom_link_text u-text-style-small">Privacy Policy</div>
                </a>
                <a className="footer_bottom_link_wrap w-inline-block" href="/terms-of-service" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/terms-of-service"); window.dispatchEvent(new PopStateEvent("popstate")); }}>
                  <div className="footer_bottom_link_text u-text-style-small">Terms of Service</div>
                </a>
                <a className="footer_bottom_link_wrap w-inline-block" href="/security.html">
                  <div className="footer_bottom_link_text u-text-style-small">Data Privacy & Security</div>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
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

// Re-export premium UI components for easy access in all pages
export {
  AnimatedCard,
  AnimatedButton,
  AnimatedNumber,
  PremiumInput,
  PremiumSlider,
} from "../components/PremiumUI";