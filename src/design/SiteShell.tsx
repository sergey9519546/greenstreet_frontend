// Shared site chrome — the SAME Webflow nav + footer the marketing home uses,
// so every inner page is framed identically (no "polished home → one-off page"
// drop). These render Webflow design-system classes (.nav, .btn_main,
// .footer_wrap, .u-container, .u-text-style-*), which are styled by the globally
// loaded greenboard CSS, so they match the home pixel-for-pixel for free.
// Extracted from PageShell so DcShell (every tool/content page) can reuse them.
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { PISTACHIO, MIDNIGHT, LEMON, FADED } from "../theme";
import { INVESTGO_TEXT, NAV_MENUS, NAV_STANDALONE_LINKS, NAV_SYNC_CSS, type NavItem, type NavMenu } from "./navModel";

const INVESTGO_LABEL = (
  <>INVEST<span style={{ opacity: 0.5 }}>GO</span></>
);

const renderNavLabel = (label: string) => label === INVESTGO_TEXT ? INVESTGO_LABEL : label;

const isPlainNavigation = (event: React.MouseEvent<HTMLAnchorElement>) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

// Inner-page nav dropdown = the SAME component as the Webflow home's. The panel
// markup + classes (.nav_dropdown_component / .w-dropdown-toggle /
// .nav_dropdown_mega_wrap / .nav_dropdown_link / .nav_dropdown_text.u-text-style-h4
// / .nav_dropdown_link_icon_wrap) are styled entirely by the globally loaded
// greenboard CSS, plus NAV_SYNC_CSS for the 4-col grid — so it is pixel-identical
// to the home. We only drive open/close from React state by flipping
// aria-expanded + .w--open; greenboard's `:has(> .w-dropdown-toggle[aria-expanded
// ="true"]) > .w-dropdown-list` rule does the grid-rows reveal, same as the home.
const NAV_DD_CSS = `
.gs-site-nav,.gs-site-nav *,.footer_component,.footer_component *{box-sizing:border-box;}
.gs-site-nav .nav-contain{width:100%;max-width:1440px;padding-left:clamp(16px,2vw,32px);padding-right:clamp(16px,2vw,32px);}
.gs-site-nav .nav-wrap,.gs-site-nav .nav-links-contain,.gs-site-nav .nav-links-wrap{min-width:0;}
.gs-site-nav .nav-links-contain{flex:1 1 auto;}
.gs-site-nav .nav-links-wrap{width:100%;justify-content:flex-end;column-gap:clamp(4px,.7vw,12px);}
.gs-site-nav .nav-link{flex:0 1 auto;min-width:0;}
.gs-site-nav .nav-btn{flex:0 0 auto;max-width:100%;}
.burger-line{display:block;width:22px;height:2px;background:currentColor;border-radius:2px;transition:transform .25s ease,opacity .2s ease;}
.burger-wrap[aria-expanded="true"] .burger-line.top{transform:translateY(6px) rotate(45deg);}
.burger-wrap[aria-expanded="true"] .burger-line.middle{opacity:0;transform:scaleX(0);}
.burger-wrap[aria-expanded="true"] .burger-line.bottom{transform:translateY(-6px) rotate(-45deg);}
.gs-mnav-section{font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#006565;margin:14px 0 2px;}
/* Recreate Webflow's nav-link hover pill (greenboard .nav-link-background:
   opacity 0->1, .4s ease). IX2 isn't running in React, so trigger it in CSS.
   nav-link must be the positioned containing block so the pill anchors to it. */
.gs-site-nav .nav-link{position:relative;}
.gs-site-nav .nav-link .nav_links_text{position:relative;z-index:2;}
.gs-site-nav .nav-link:hover .nav-link-background,
.gs-site-nav .nav-link:focus-visible .nav-link-background{opacity:1;}
.gs-site-nav .nav-link.is-current .nav-link-background{opacity:1;}
.gs-site-nav .nav-btn{transition:filter .2s ease,transform .1s ease;}
.gs-site-nav .nav-btn:hover{filter:brightness(1.08);}
.gs-site-nav .nav-btn:active{transform:translateY(1px);}
.gs-site-nav .w-dropdown-toggle{cursor:pointer;}
.gs-site-nav a:focus-visible,.gs-site-nav button:focus-visible{outline:3px solid #006565;outline-offset:3px;}
.gs-site-nav .nav-btn:focus-visible{outline-color:#d8d958;box-shadow:0 0 0 2px #003738;}
.footer_component a:focus-visible{outline:3px solid #d8d958;outline-offset:3px;}
.gs-site-nav [aria-current="page"] .nav-link-background,.gs-site-nav a[aria-current="page"] .nav-link-background{opacity:1;}
@media (max-width:767px){
  .gs-site-nav .nav-contain{padding-left:12px;padding-right:12px;}
  .gs-site-nav .menu-mobile-wrap{width:100%;max-width:100vw;padding-left:clamp(16px,5vw,24px)!important;padding-right:clamp(16px,5vw,24px)!important;overflow-wrap:anywhere;}
  .gs-site-nav .menu-mobile-wrap .nav-link{min-width:0;max-width:100%;}
}
`;

export function SiteNav({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const path = typeof window !== "undefined" ? (window.location.pathname.replace(/\/$/, "") || "/") : "/";

  // Match Webflow's W.Dropdown 400ms hover-out delay (data-delay="400") so the
  // panel doesn't snap shut when the cursor crosses the gap to it.
  const openNow = (label: string) => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } setOpenMenu(label); };
  const scheduleClose = (label: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpenMenu((cur) => (cur === label ? null : cur)), 400); };

  const navRef = useRef<HTMLElement | null>(null);
  const closeAll = () => { setMenuOpen(false); setOpenMenu(null); };

  // Close mobile menu when user taps outside the nav.
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Keep keyboard and touch users inside the open mobile navigation, prevent
  // the page behind it from scrolling, and restore focus to the opener.
  useEffect(() => {
    if (!menuOpen || !mobileRef.current) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : menuButtonRef.current;
    const focusableSelector = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      mobileRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !mobileRef.current) return;
      const focusable = Array.from(mobileRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
      else menuButtonRef.current?.focus();
    };
  }, [menuOpen]);
  const go = (v: string) => (e: React.MouseEvent<HTMLAnchorElement>) => { if (!onNavigate || !isPlainNavigation(e)) return; e.preventDefault(); onNavigate(v); closeAll(); };
  const goPath = (p: string) => (e: React.MouseEvent<HTMLAnchorElement>) => { if (!isPlainNavigation(e)) return; e.preventDefault(); window.history.pushState({}, "", p); window.dispatchEvent(new PopStateEvent("popstate")); closeAll(); };
  const nav = (it: NavItem) => it.view ? go(it.view) : goPath(it.path);
  const itemActive = (it: NavItem) => !!it.path && it.path !== "/" && path === it.path.replace(/\/$/, "");

  // Escape closes either navigation layer. The mobile-menu effect restores
  // focus to the menu button when its panel unmounts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      document.documentElement.classList.toggle("reduce-motion", query.matches);
      if (query.matches) {
        document.querySelectorAll<HTMLVideoElement>("video[autoplay]").forEach((video) => {
          video.autoplay = false;
          video.pause();
        });
      }
    };
    applyPreference();
    query.addEventListener("change", applyPreference);
    return () => query.removeEventListener("change", applyPreference);
  }, []);

  // The mega panel open/close is the greenboard grid-rows reveal (CSS, driven by
  // aria-expanded + .w--open below) — identical to the home, so no JS animation here.

  // GSAP: mobile menu open (slide+fade, then staggered links). Reduced-motion safe.
  useEffect(() => {
    if (!menuOpen || !mobileRef.current) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    gsap.fromTo(mobileRef.current, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(mobileRef.current.children, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.26, stagger: 0.03, ease: "power2.out", delay: 0.05, clearProps: "transform,opacity" });
  }, [menuOpen]);

  // The toggle chevron (greenboard rotates it -180° when aria-expanded).
  const navCaret = (
    <svg aria-hidden="true" className="nav_links_svg" fill="none" viewBox="0 0 47 24" width="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L23.5 23L46 1" stroke="currentColor" strokeWidth="0.1rem" vectorEffect="non-scaling-stroke" />
    </svg>
  );

  // The card corner-arrow button icon (matches homeNavSync's ARROW_SVG exactly).
  const cardIcon = (
    <div className="nav_dropdown_link_icon_wrap">
      <div className="nav_dropdown_link_icon w-embed">
        <svg aria-hidden="true" fill="none" height="100%" viewBox="0 0 14 14" width="100%" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.99964 11.5002L8.98714 10.5127L11.7871 7.68769H0.412109V6.31269H11.7871L8.98714 3.48769L9.99964 2.50019L14.4996 7.00019L9.99964 11.5002Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );

  // Renders ONE primary menu as the exact Webflow home mega-dropdown: a hover-
  // opened .nav_dropdown_component whose .w-dropdown-list (.nav_dropdown_mega_wrap)
  // greenboard reveals via aria-expanded. The cards are byte-for-byte what
  // homeNavSync builds on the home, so the two dropdowns are the same component.
  const renderMenu = (m: NavMenu) => {
    const open = openMenu === m.label;
    const hasFeature = !!m.items[0]?.feature;
    const feature = hasFeature ? m.items[0] : null;
    const cards = hasFeature ? m.items.slice(1) : m.items;
    const menuSlug = m.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const triggerId = `nav-trigger-${menuSlug}`;
    const menuId = `nav-menu-${menuSlug}`;
    const focusMenuEdge = (edge: "first" | "last") => {
      openNow(m.label);
      window.requestAnimationFrame(() => {
        const items = document.getElementById(menuId)?.querySelectorAll<HTMLAnchorElement>('a[href]');
        items?.[edge === "first" ? 0 : items.length - 1]?.focus();
      });
    };
    return (
      <div
        key={m.label}
        className="nav_dropdown_component w-dropdown"
        data-delay="400"
        data-hover="true"
        onMouseEnter={() => openNow(m.label)}
        onMouseLeave={() => scheduleClose(m.label)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenMenu(null);
        }}
      >
        <div
          className={`nav-link w-dropdown-toggle${open ? " w--open" : ""}`}
          onFocus={() => openNow(m.label)}
        >
          <a
            id={triggerId}
            className="w-inline-block"
            href={m.path}
            onClick={go(m.view)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            aria-current={path === m.path.replace(/\/$/, "") ? "page" : undefined}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); focusMenuEdge("first"); }
              if (event.key === "ArrowUp") { event.preventDefault(); focusMenuEdge("last"); }
            }}
          >
            <div className="nav_links_text">{m.label}</div>
          </a>
          {navCaret}
          <div className="nav-link-background" aria-hidden="true" />
        </div>
        <nav
          id={menuId}
          className={`nav_dropdown_mega_wrap is-desktop w-dropdown-list${open ? " w--open" : ""}`}
          role="menu"
          aria-label={m.label}
          aria-labelledby={triggerId}
          onKeyDown={(event) => {
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>('a[href]'));
            const current = items.indexOf(event.target as HTMLAnchorElement);
            if (event.key === "Escape") {
              event.preventDefault();
              setOpenMenu(null);
              document.getElementById(triggerId)?.focus();
            } else if (event.key === "ArrowDown" && items.length) {
              event.preventDefault();
              items[(current + 1 + items.length) % items.length].focus();
            } else if (event.key === "ArrowUp" && items.length) {
              event.preventDefault();
              items[(current - 1 + items.length) % items.length].focus();
            } else if (event.key === "Home" && items.length) {
              event.preventDefault();
              items[0].focus();
            } else if (event.key === "End" && items.length) {
              event.preventDefault();
              items[items.length - 1].focus();
            }
          }}
        >
          <div className="nav_dropdown_mega_content is-desktop">
            <div className="nav_dropdown_mega_scroll is-desktop">
              <div className="nav_dropdown_mega_contain is-desktop">
                <div className="nav_dropdown_mega_layout is-desktop gs-nav-synced">
                  {feature && (
                    <a role="menuitem" aria-current={itemActive(feature) ? "page" : undefined} className="nav_dropdown_link is-desktop u-theme-dark gs-nav-feature w-inline-block" href={feature.path} onClick={nav(feature)}>
                      <div className="nav_dropdown_text_logo w-embed">INVEST<span style={{ opacity: 0.5 }}>GO</span></div>
                      {cardIcon}
                    </a>
                  )}
                  {cards.map((it, i) => (
                    <a key={i} role="menuitem" aria-current={itemActive(it) ? "page" : undefined} className={`nav_dropdown_link is-desktop w-inline-block${itemActive(it) ? " w--current" : ""}`} href={it.path} onClick={nav(it)}>
                      <div className="nav_dropdown_text u-text-style-h4">{renderNavLabel(it.label)}</div>
                      {cardIcon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  };

  return (
    <>
      <style>{NAV_DD_CSS}</style>
      <style>{NAV_SYNC_CSS}</style>
      <nav ref={navRef} aria-label="Primary" className="nav gs-site-nav" data-wf--nav-main--variant="greenstreet" style={{ position: "sticky", top: 0, zIndex: 50, background: PISTACHIO }}>
      <div className="nav-contain u-container">
        <div className="nav-wrap">
          <a aria-label="Greenstreet Finance home" className="nav-logo-wrap w-inline-block" href="/" onClick={go("marketing")}>
            <div className="nav-logo w-embed">
              <span style={{ fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif', fontWeight: 800, fontVariationSettings: '"wght" 800', letterSpacing: 0, color: "currentColor", whiteSpace: "nowrap", lineHeight: 0.96, display: "inline-block", wordSpacing: "0.055em" }}>Greenstreet<span style={{ fontWeight: 380, fontVariationSettings: '"wght" 380', letterSpacing: "0.006em" }}> Finance</span><span style={{ color: LEMON, fontSize: "1.2em" }}>.</span></span>
            </div>
          </a>
          <div className="nav-links-contain" hide-t="">
            <div className="nav-links-wrap">
              <a className="nav-link w-inline-block" href="/investgo" onClick={go("portal")} aria-current={path === "/investgo" ? "page" : undefined}>
                <div className="nav-link-background" aria-hidden="true" />
                <div className="nav_links_text font-go">{INVESTGO_LABEL}</div>
              </a>

              {renderMenu(NAV_MENUS[0])}
              {renderMenu(NAV_MENUS[1])}
              {NAV_STANDALONE_LINKS.map((it) => (
                <a key={it.label} aria-current={itemActive(it) ? "page" : undefined} className={`nav-link w-inline-block${itemActive(it) ? " is-current" : ""}`} href={it.path} onClick={nav(it)}>
                  <div className="nav-link-background" aria-hidden="true" />
                  <div className="nav_links_text">{renderNavLabel(it.label)}</div>
                </a>
              ))}
              {renderMenu(NAV_MENUS[2])}
              <a className="nav-link is-underline w-inline-block" href="/investgo" onClick={go("portal")} aria-current={path === "/investgo" ? "page" : undefined}><div className="nav-link-background" aria-hidden="true" /><div>Login</div></a>
              {/* Solid, always-visible CTA (matches the home nav button). */}
              <a className="nav-btn" href="/rate-quiz" onClick={go("rate-quiz")} aria-current={path === "/rate-quiz" ? "page" : undefined}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: MIDNIGHT, color: PISTACHIO, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "12px 22px", borderRadius: 8, whiteSpace: "nowrap" }}>
                Check my scenario
                <svg aria-hidden="true" focusable="false" fill="none" height="16" viewBox="0 0 24 25" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </div>
          <button ref={menuButtonRef} type="button" className="burger-wrap" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, minHeight: 44, minWidth: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div className="burger-line top" aria-hidden="true"></div>
            <div className="burger-line middle" aria-hidden="true"></div>
            <div className="burger-line bottom" aria-hidden="true"></div>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div ref={mobileRef} id="mobile-nav" className="menu-mobile-wrap" style={{ display: "flex", flexDirection: "column", position: "absolute", top: "100%", bottom: "auto", left: 0, right: 0, background: PISTACHIO, borderBottom: `1px solid ${FADED}`, padding: "8px 24px 20px", gap: 0, zIndex: 49, maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
          <a href="/investgo" className="nav-link" onClick={go("portal")} aria-current={path === "/investgo" ? "page" : undefined} style={{ fontWeight: 700, padding: "12px 0", display: "block" }}>{INVESTGO_LABEL}</a>
          {NAV_MENUS.map((m) => (
            <React.Fragment key={m.label}>
              <a href={m.path} className="gs-mnav-section" onClick={go(m.view)} aria-current={path === m.path.replace(/\/$/, "") ? "page" : undefined} style={{ textDecoration: "none", padding: "12px 0 2px", display: "block" }}>{m.label}</a>
              {m.items.map((it, i) => (
                <a key={i} href={it.path} className="nav-link" onClick={nav(it)} aria-current={itemActive(it) ? "page" : undefined} style={{ padding: "10px 0 10px 12px", display: "block" }}>{renderNavLabel(it.label)}</a>
              ))}
            </React.Fragment>
          ))}
          {NAV_STANDALONE_LINKS.map((it) => (
            <a key={it.label} href={it.path} className="nav-link" onClick={nav(it)} aria-current={itemActive(it) ? "page" : undefined} style={{ padding: "12px 0", display: "block" }}>{renderNavLabel(it.label)}</a>
          ))}
          <a href="/investgo" className="nav-link" onClick={go("portal")} aria-current={path === "/investgo" ? "page" : undefined} style={{ padding: "12px 0", display: "block" }}>Login</a>
          <a href="/rate-quiz" className="nav-link" aria-current={path === "/rate-quiz" ? "page" : undefined} style={{ background: LEMON, textAlign: "center", borderRadius: "8px", padding: "14px 12px", fontWeight: 700, marginTop: 10, display: "block" }} onClick={go("rate-quiz")}>Check my scenario</a>
        </div>
      )}
      </nav>
    </>
  );
}

export function SiteFooter({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const go = (v: string) => (e: React.MouseEvent<HTMLAnchorElement>) => { if (!onNavigate || !isPlainNavigation(e)) return; e.preventDefault(); onNavigate(v); };
  const goPath = (p: string) => (e: React.MouseEvent<HTMLAnchorElement>) => { if (!isPlainNavigation(e)) return; e.preventDefault(); window.history.pushState({}, "", p); window.dispatchEvent(new PopStateEvent("popstate")); };
  return (
    <div className="footer_component">
      <footer className="footer_wrap">
        <h2 className="footer_title u-sr-only">Footer</h2>
        <div className="footer_contain u-container">
          <a aria-label="Greenstreet Finance home" className="footer_logo_wrap w-inline-block" href="/" onClick={go("marketing")}>
            <div className="footer_logo w-embed">
              <span style={{ fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif', fontSize: "22px", fontWeight: 800, fontVariationSettings: '"wght" 800', letterSpacing: 0, color: "currentColor", whiteSpace: "nowrap", lineHeight: 0.96, display: "inline-block", wordSpacing: "0.055em" }}>Greenstreet<span style={{ fontWeight: 380, fontVariationSettings: '"wght" 380', letterSpacing: "0.006em" }}> Finance</span><span style={{ color: LEMON, fontSize: "1.2em" }}>.</span></span>
            </div>
          </a>
          <nav aria-label="Footer" className="footer_layout u-grid-autofit">
            <section className="footer_group_wrap u-column-2">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Product</h3>
              <div className="footer_group_list u-grid-column-2">
                <a className="footer_link_wrap w-inline-block" href="/dscr-calculator" onClick={go("dscr-calculator")}><div className="footer_link_text u-weight-bold">DSCR Calculator</div></a>
                <a className="footer_link_wrap w-inline-block" href="/tools/decision-support" onClick={go("decision-support")}><div className="footer_link_text u-weight-bold">Decision Support</div></a>
                <a className="footer_link_wrap w-inline-block" href="/lender-intel" onClick={go("lender-intel")}><div className="footer_link_text u-weight-bold">Program Scenarios</div></a>
                <a className="footer_link_wrap w-inline-block" href="/state-laws" onClick={go("state-laws")}><div className="footer_link_text u-weight-bold">State Rule Map</div></a>
                <a className="footer_link_wrap w-inline-block" href="/borrower-profiles" onClick={go("borrower-profiles")}><div className="footer_link_text u-weight-bold">DSCR Borrower Profiles</div></a>
                <a className="footer_link_wrap w-inline-block" href="/tools/portfolio" onClick={go("portfolio")}><div className="footer_link_text u-weight-bold">Portfolio Analyzer</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Who We Serve</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/investors" onClick={go("investors")}><div className="footer_link_text u-weight-bold">Real Estate Investors</div></a>
                <a className="footer_link_wrap w-inline-block" href="/non-us-investors" onClick={go("non-us-investors")}><div className="footer_link_text u-weight-bold">Non-US Investors</div></a>
                <a className="footer_link_wrap w-inline-block" href="/str-airbnb" onClick={go("str-hosts")}><div className="footer_link_text u-weight-bold">STR &amp; Airbnb</div></a>
                <a className="footer_link_wrap w-inline-block" href="/vacation-homes" onClick={go("vacation-homes")}><div className="footer_link_text u-weight-bold">Vacation Homes</div></a>
                <a className="footer_link_wrap w-inline-block" href="/brokers" onClick={go("brokers")}><div className="footer_link_text u-weight-bold">Mortgage Brokers</div></a>
                <a className="footer_link_wrap w-inline-block" href="/rate-quiz" onClick={go("rate-quiz")}><div className="footer_link_text u-weight-bold">Rate Quiz</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Company</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/about" onClick={go("about")}><div className="footer_link_text u-weight-bold">About</div></a>
                <a className="footer_link_wrap w-inline-block" href="/partnerships" onClick={go("brokers-partner")}><div className="footer_link_text u-weight-bold">Partnerships</div></a>
                <a className="footer_link_wrap w-inline-block" href="/careers" onClick={go("careers")}><div className="footer_link_text u-weight-bold">Jobs</div></a>
                <a className="footer_link_wrap w-inline-block" href="/legal" onClick={go("legal")}><div className="footer_link_text u-weight-bold">Legal &amp; Privacy</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Resources</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/blog" onClick={go("blog")}><div className="footer_link_text u-weight-bold">Greenstreet Guidance</div></a>
                <a className="footer_link_wrap w-inline-block" href="/case-studies" onClick={go("case-studies")}><div className="footer_link_text u-weight-bold">Illustrative Scenarios</div></a>
                <a className="footer_link_wrap w-inline-block" href="/how-it-works" onClick={go("how-it-works")}><div className="footer_link_text u-weight-bold">How It Works</div></a>
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
