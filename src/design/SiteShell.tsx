// Shared site chrome — the SAME Webflow nav + footer the marketing home uses,
// so every inner page is framed identically (no "polished home → one-off page"
// drop). These render Webflow design-system classes (.nav, .btn_main,
// .footer_wrap, .u-container, .u-text-style-*), which are styled by the globally
// loaded greenboard CSS, so they match the home pixel-for-pixel for free.
// Extracted from PageShell so DcShell (every tool/content page) can reuse them.
import React, { useState } from "react";
import { PISTACHIO, MIDNIGHT, RAINFOREST, LEMON, FADED } from "../theme";

export function SiteNav({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (v: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate?.(v); setMenuOpen(false); };
  return (
    <nav className="nav" data-wf--nav-main--variant="greenstreet" style={{ position: "sticky", top: 0, zIndex: 50, background: PISTACHIO, borderBottom: `1px solid ${FADED}` }}>
      <div className="nav-contain u-container">
        <div className="nav-wrap">
          <a className="nav-logo-wrap w-inline-block" href="/" onClick={go("marketing")}>
            <div className="nav-logo w-embed">
              <span style={{ fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif', fontSize: "28px", fontWeight: 600, letterSpacing: "-0.04em", color: "currentColor", whiteSpace: "nowrap", lineHeight: 1, display: "inline-block" }}>Greenstreet Finance</span>
            </div>
          </a>
          <div className="nav-links-contain">
            <div className="nav-links-wrap">
              <a className="nav-link w-inline-block" href="/investorgo" onClick={go("portal")}>
                <div className="nav_links_text font-go" style={{ color: RAINFOREST, fontWeight: 700 }}>
                  Investor<span style={{ color: MIDNIGHT, fontWeight: 500 }}>GO</span>
                </div>
              </a>
              <a className="nav-link w-inline-block" href="/products" onClick={go("products")}><div className="nav_links_text">Product</div></a>
              <a className="nav-link w-inline-block" href="/solutions" onClick={go("solutions")}><div className="nav_links_text">Who We Serve</div></a>
              <a className="nav-link w-inline-block" href="/blog" onClick={go("blog")}><div className="nav_links_text">Resources</div></a>
              <a className="nav-link w-inline-block" href="/about" onClick={go("about")}><div className="nav_links_text">About</div></a>
              <a className="nav-link is-underline w-inline-block" href="/investorgo" onClick={go("portal")}><div>Login</div></a>
              <div className="nav-btn">
                <div className="btn_main_wrap" data-wf--btn-main--style="secondary">
                  <a className="g_clickable_link w-inline-block" href="/rate-quiz" onClick={go("rate-quiz")}>
                    <span className="g_clickable_text u-sr-only">Book a demo</span>
                  </a>
                  <div aria-hidden="true" className="btn_main_text" onClick={() => onNavigate?.("rate-quiz")}>Book a demo</div>
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
          <div className="burger-wrap" style={{ cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)}>
            <div className="burger-line top"></div>
            <div className="burger-line middle"></div>
            <div className="burger-line bottom"></div>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="menu-mobile-wrap" style={{ display: "flex", flexDirection: "column", position: "absolute", top: "100%", left: 0, right: 0, background: PISTACHIO, borderBottom: `1px solid ${FADED}`, padding: "16px 24px 24px", gap: "12px", zIndex: 49 }}>
          <a href="/investorgo" className="nav-link" onClick={go("portal")}><span>Investor</span><span style={{ color: RAINFOREST, fontWeight: 700 }}>GO</span></a>
          <a href="/products" className="nav-link" onClick={go("products")}>Product</a>
          <a href="/solutions" className="nav-link" onClick={go("solutions")}>Who We Serve</a>
          <a href="/blog" className="nav-link" onClick={go("blog")}>Resources</a>
          <a href="/about" className="nav-link" onClick={go("about")}>About</a>
          <a href="/investorgo" className="nav-link" onClick={go("portal")}>Login</a>
          <a href="/rate-quiz" className="nav-link" style={{ background: LEMON, textAlign: "center", borderRadius: "8px", padding: "12px", fontWeight: 700 }} onClick={go("rate-quiz")}>Book a demo</a>
        </div>
      )}
    </nav>
  );
}

export function SiteFooter({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const go = (v: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate?.(v); };
  const goPath = (p: string) => (e: React.MouseEvent) => { e.preventDefault(); window.history.pushState({}, "", p); window.dispatchEvent(new PopStateEvent("popstate")); };
  return (
    <div className="footer_component">
      <footer className="footer_wrap">
        <h2 className="footer_title u-sr-only">Footer</h2>
        <div className="footer_contain u-container">
          <a className="footer_logo_wrap w-inline-block" href="/" onClick={go("marketing")}>
            <div className="footer_logo w-embed">
              <span style={{ fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif', fontSize: "24px", fontWeight: 600, letterSpacing: "-0.04em", color: "currentColor", whiteSpace: "nowrap", lineHeight: 1, display: "inline-block" }}>Greenstreet Finance</span>
            </div>
          </a>
          <nav className="footer_layout u-grid-autofit">
            <section className="footer_group_wrap u-column-2">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Product</h3>
              <div className="footer_group_list u-grid-column-2">
                <a className="footer_link_wrap w-inline-block" href="/dscr-calculator" onClick={go("dscr-calculator")}><div className="footer_link_text u-weight-bold">DSCR Calculator</div></a>
                <a className="footer_link_wrap w-inline-block" href="/deal-analyzer" onClick={go("deal-analyzer")}><div className="footer_link_text u-weight-bold">Deal Analyzer</div></a>
                <a className="footer_link_wrap w-inline-block" href="/lender-intel" onClick={go("lender-intel")}><div className="footer_link_text u-weight-bold">Lender Intelligence</div></a>
                <a className="footer_link_wrap w-inline-block" href="/state-laws" onClick={go("state-laws")}><div className="footer_link_text u-weight-bold">State Regulations</div></a>
                <a className="footer_link_wrap w-inline-block" href="/borrower-profiles" onClick={go("borrower-profiles")}><div className="footer_link_text u-weight-bold">DSCR Borrower Profiles</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Who We Serve</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/brokers" onClick={go("brokers")}><div className="footer_link_text u-weight-bold">Mortgage Brokers</div></a>
                <a className="footer_link_wrap w-inline-block" href="/investors" onClick={go("investors")}><div className="footer_link_text u-weight-bold">Private Funds</div></a>
                <a className="footer_link_wrap w-inline-block" href="/rate-quiz" onClick={go("rate-quiz")}><div className="footer_link_text u-weight-bold">Rate Quiz</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Company</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/about" onClick={go("about")}><div className="footer_link_text u-weight-bold">About</div></a>
                <a className="footer_link_wrap w-inline-block" href="/careers" onClick={go("careers")}><div className="footer_link_text u-weight-bold">Jobs</div></a>
                <a className="footer_link_wrap w-inline-block" href="/legal" onClick={go("legal")}><div className="footer_link_text u-weight-bold">Security &amp; Privacy</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Resources</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/blog" onClick={go("blog")}><div className="footer_link_text u-weight-bold">Greenstreet Guidance</div></a>
                <a className="footer_link_wrap w-inline-block" href="/case-studies" onClick={go("case-studies")}><div className="footer_link_text u-weight-bold">Customer Stories</div></a>
                <a className="footer_link_wrap w-inline-block" href="/faq" onClick={go("faq")}><div className="footer_link_text u-weight-bold">FAQ</div></a>
              </div>
            </section>
          </nav>
        </div>
        <div className="footer_bottom_wrap">
          <div className="footer_bottom_contain u-container">
            <div className="footer_bottom_text">© 2026 Greenstreet Finance. All rights reserved.</div>
            <div className="footer_bottom_list">
              <a className="footer_bottom_link_wrap w-inline-block" href="/privacy-policy" onClick={goPath("/privacy-policy")}><div className="footer_bottom_link_text u-text-style-small">Privacy Policy</div></a>
              <a className="footer_bottom_link_wrap w-inline-block" href="/terms-of-service" onClick={goPath("/terms-of-service")}><div className="footer_bottom_link_text u-text-style-small">Terms of Service</div></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
