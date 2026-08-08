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
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";

/** Paths that render ToolReliabilityHoldPage instead of the tool. */
const HELD_PATHS = new Set<string>(Object.values(TOOL_RELIABILITY_HOLDS).map((h) => h.path));
const isHeldPath = (path: string) => HELD_PATHS.has(path);

const INVESTGO_LABEL = (
  <>INVEST<span style={{ opacity: 0.5 }}>GO</span></>
);

const renderNavLabel = (label: string) => label === INVESTGO_TEXT ? INVESTGO_LABEL : label;

// Inner-page nav dropdown = the SAME component as the Webflow home's. The panel
// markup + classes (.nav_dropdown_component / .w-dropdown-toggle /
// .nav_dropdown_mega_wrap / .nav_dropdown_link / .nav_dropdown_text.u-text-style-h4
// / .nav_dropdown_link_icon_wrap) are styled entirely by the globally loaded
// greenboard CSS, plus NAV_SYNC_CSS for the 4-col grid — so it is pixel-identical
// to the home. We only drive open/close from React state by flipping
// aria-expanded + .w--open; greenboard's `:has(> .w-dropdown-toggle[aria-expanded
// ="true"]) > .w-dropdown-list` rule does the grid-rows reveal, same as the home.
const NAV_DD_CSS = `
/* Nav collapse. Webflow hides .nav-links-contain at its 991px tablet breakpoint
   via the hide-t attribute, so the burger must appear at exactly the same width
   and never before it. This lived as an inline display:flex on the button,
   which beats every stylesheet rule — so the burger rendered on TOP of the full
   desktop nav at every width. Keep display here, not inline. */
/* "In review" chip on nav entries whose tool is behind a reliability hold.
   Muted on purpose — it informs, it must not compete with the label. */
.gs-nav-hold{display:inline-block;margin-left:8px;padding:2px 7px;border-radius:999px;
  font-family:inherit;font-size:10px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;
  vertical-align:middle;color:rgba(238,239,211,0.72);border:1px solid rgba(238,239,211,0.28);}
.burger-wrap{display:none;}
@media screen and (max-width:991px){.burger-wrap{display:flex;}}
.burger-line{display:block;width:22px;height:2px;background:currentColor;border-radius:2px;transition:transform .25s ease,opacity .2s ease;}
.burger-wrap[aria-expanded="true"] .burger-line.top{transform:translateY(6px) rotate(45deg);}
.burger-wrap[aria-expanded="true"] .burger-line.middle{opacity:0;transform:scaleX(0);}
.burger-wrap[aria-expanded="true"] .burger-line.bottom{transform:translateY(-6px) rotate(-45deg);}
/* Recreate Webflow's nav-link hover pill (greenboard .nav-link-background:
   opacity 0->1, .4s ease). IX2 isn't running in React, so trigger it in CSS.
   nav-link must be the positioned containing block so the pill anchors to it. */
.gs-site-nav .nav-link{position:relative;}
.gs-site-nav .nav-link .nav_links_text{position:relative;z-index:2;}
.gs-site-nav .nav-link:hover .nav-link-background,
.gs-site-nav .nav-link:focus-visible .nav-link-background{opacity:1;}
.gs-site-nav .nav-link.is-current .nav-link-background{opacity:1;}
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
`;

export function SiteNav({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuViewportTop, setMenuViewportTop] = useState(120);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
  const menuTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number | null>(null);
  const path = typeof window !== "undefined" ? (window.location.pathname.replace(/\/$/, "") || "/") : "/";

  // Match Webflow's W.Dropdown 400ms hover-out delay (data-delay="400") so the
  // panel doesn't snap shut when the cursor crosses the gap to it.
  const openNow = (label: string) => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } setOpenMenu(label); };
  const scheduleClose = (label: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpenMenu((cur) => (cur === label ? null : cur)), 400); };

  const restoreFocus = (target: HTMLElement | null) => {
    window.requestAnimationFrame(() => target?.focus());
  };
  const closeAll = (restoreTarget?: HTMLElement | null) => {
    setMenuOpen(false);
    setOpenMenu(null);
    if (restoreTarget) restoreFocus(restoreTarget);
  };

  // Close mobile menu when user taps outside the nav.
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const go = (v: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate?.(v); closeAll(); };
  const goPath = (p: string) => (e: React.MouseEvent) => { e.preventDefault(); window.history.pushState({}, "", p); window.dispatchEvent(new PopStateEvent("popstate")); closeAll(); };
  const nav = (it: NavItem) => it.view ? go(it.view) : goPath(it.path);
  const itemActive = (it: NavItem) => !!it.path && it.path !== "/" && path === it.path.replace(/\/$/, "");
  const menuActive = (m: NavMenu) => path === m.path || m.items.some(itemActive);
  const menuPanelId = (label: string) => `site-nav-menu-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const toggleMobileMenu = () => {
    setMenuOpen((open) => {
      if (!open) {
        setMenuViewportTop(Math.ceil(navRef.current?.getBoundingClientRect().bottom ?? 120));
      }
      return !open;
    });
  };

  // Escape always closes the active disclosure and restores focus to the
  // control that opened it. This is important on mobile, where otherwise a
  // keyboard user can be left in a now-hidden menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) {
        e.preventDefault();
        closeAll(mobileToggleRef.current);
        return;
      }
      if (openMenu) {
        e.preventDefault();
        closeAll(menuTriggerRefs.current[openMenu]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, openMenu]);

  // Browser back/forward and SPA route changes must not leave a detached
  // disclosure visually open over the destination page.
  useEffect(() => {
    setMenuOpen(false);
    setOpenMenu(null);
  }, [path]);

  // Mouse users should be able to dismiss a mega menu by clicking elsewhere;
  // avoid changing focus because the pointer destination owns it.
  useEffect(() => {
    if (!openMenu) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [openMenu]);

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
    return (
      <div
        key={m.label}
        className="nav_dropdown_component w-dropdown"
        data-delay="400"
        data-hover="true"
        onMouseEnter={() => openNow(m.label)}
        onMouseLeave={(event) => {
          if (!event.currentTarget.contains(document.activeElement)) scheduleClose(m.label);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleClose(m.label);
        }}
      >
        <button
          ref={(element) => { menuTriggerRefs.current[m.label] = element; }}
          type="button"
          className={`nav-link w-dropdown-toggle${open ? " w--open" : ""}`}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={menuPanelId(m.label)}
          onClick={() => setOpenMenu((current) => current === m.label ? null : m.label)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            openNow(m.label);
            const panel = document.getElementById(menuPanelId(m.label));
            window.requestAnimationFrame(() => panel?.querySelector<HTMLAnchorElement>("a")?.focus());
          }}
          onFocus={() => openNow(m.label)}
        >
          {/* The label is TEXT, not a link. It used to be <a href={m.path}> nested
              inside this <button> — interactive content inside interactive
              content, which is invalid HTML and, worse, meant a click on the
              label hit the anchor and NAVIGATED instead of opening the menu.
              Desktop hover masked it; on touch there is no hover, so tapping
              "Product" navigated away and the mega panel was unreachable.
              The panel below carries the destination links. */}
          <div className="nav_links_text">{m.label}</div>
          {navCaret}
          <div className="nav-link-background" aria-hidden="true" />
        </button>
        <nav className={`nav_dropdown_mega_wrap is-desktop w-dropdown-list${open ? " w--open" : ""}`} id={menuPanelId(m.label)} role="menu" aria-label={m.label}>
          <div className="nav_dropdown_mega_content is-desktop">
            <div className="nav_dropdown_mega_scroll is-desktop">
              <div className="nav_dropdown_mega_contain is-desktop">
                <div className="nav_dropdown_mega_layout is-desktop gs-nav-synced">
                  {feature && (
                    <a className="nav_dropdown_link is-desktop u-theme-dark gs-nav-feature w-inline-block" href={feature.path} onClick={nav(feature)}>
                      <div className="nav_dropdown_text_logo w-embed">INVEST<span style={{ opacity: 0.5 }}>GO</span></div>
                      {cardIcon}
                    </a>
                  )}
                  {cards.map((it, i) => (
                    <a key={i} role="menuitem" className={`nav_dropdown_link is-desktop w-inline-block${itemActive(it) ? " w--current" : ""}`} href={it.path} onClick={nav(it)}>
                      <div className="nav_dropdown_text u-text-style-h4">
                        {renderNavLabel(it.label)}
                        {/* Every tool with an unmet reliability hold renders a wall
                            instead of the tool. Suppressing those links is not an
                            option — currently every dropdown entry is held, so the
                            menus would be empty. Say so before the click instead of
                            after it. Derived from TOOL_RELIABILITY_HOLDS so the chip
                            disappears the moment a hold record is deleted. */}
                        {isHeldPath(it.path) && <span className="gs-nav-hold">In review</span>}
                      </div>
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
      <style>{NAV_SYNC_CSS}</style>
      {announcementVisible && (
        <div className="announcement gs-site-announcement u-container u-theme-light">
          <a
            className="link-block w-inline-block"
            href="/blog/greenstreet-go-launch"
            aria-label="Read the InvestGO announcement"
          />
          <div className="announcement-txt w-richtext">
            <p><strong>⎋</strong> Explore <strong>InvestGO</strong> — an educational DSCR workflow concept</p>
          </div>
          <button
            type="button"
            className="announcement-close"
            aria-label="Dismiss announcement"
            onClick={() => setAnnouncementVisible(false)}
          >
            <svg className="svg" fill="none" viewBox="0 0 11 11" width="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <line stroke="currentColor" strokeWidth="1.3" x1="0.664698" x2="9.95041" y1="0.458349" y2="9.74406" />
              <line stroke="currentColor" strokeWidth="1.3" x1="0.459814" x2="9.74553" y1="9.74741" y2="0.461698" />
            </svg>
          </button>
        </div>
      )}
      <nav ref={navRef} className="nav gs-site-nav" data-wf--nav-main--variant="greenstreet" aria-label="Primary navigation" style={{ position: "sticky", top: 0, zIndex: 50, background: PISTACHIO, borderBottom: `1px solid ${FADED}` }}>
      <div className="nav-contain u-container">
        <div className="nav-wrap">
          <a className="nav-logo-wrap w-inline-block" href="/" onClick={go("marketing")}>
            <div className="nav-logo w-embed">
              <span style={{ fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif', fontSize: 30, fontWeight: 700, fontVariationSettings: '"wght" 700', letterSpacing: "-0.01em", color: "currentColor", whiteSpace: "nowrap", lineHeight: 0.98, display: "inline-block" }}>Greenstreet<span style={{ fontWeight: 400, fontVariationSettings: '"wght" 400' }}> Finance</span><span style={{ color: LEMON, fontSize: "1.2em" }}>.</span></span>
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
                <a key={it.label} className={`nav-link w-inline-block${itemActive(it) ? " is-current" : ""}`} href={it.path} onClick={nav(it)}>
                  <div className="nav-link-background" aria-hidden="true" />
                  <div className="nav_links_text">{renderNavLabel(it.label)}</div>
                </a>
              ))}
              {renderMenu(NAV_MENUS[2])}
              <a className="nav-link is-underline w-inline-block" href="/investgo" onClick={go("portal")} aria-current={path === "/investgo" ? "page" : undefined}><div className="nav-link-background" aria-hidden="true" /><div>Login</div></a>
              {/* Solid, always-visible CTA (matches the home nav button). */}
              <a className="nav-btn" href="/book-demo" onClick={go("book-demo")} aria-current={path === "/book-demo" ? "page" : undefined}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: MIDNIGHT, color: PISTACHIO, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "12px 22px", borderRadius: 8, whiteSpace: "nowrap" }}>
                Book a demo
                <svg fill="none" height="16" viewBox="0 0 24 25" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </div>
          <button ref={mobileToggleRef} type="button" className="burger-wrap" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={toggleMobileMenu} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, minHeight: 44, minWidth: 44, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div className="burger-line top" aria-hidden="true"></div>
            <div className="burger-line middle" aria-hidden="true"></div>
            <div className="burger-line bottom" aria-hidden="true"></div>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div ref={mobileRef} id="mobile-nav" className="menu-mobile-wrap gs-site-mobile-menu" role="navigation" aria-label="Mobile navigation" style={{ display: "flex", flexDirection: "column", position: "absolute", top: "100%", left: 0, right: 0, background: PISTACHIO, borderBottom: `1px solid ${FADED}`, padding: "18px var(--gs-page-gutter, 1.125rem) 28px", gap: "4px", zIndex: 49, maxHeight: `calc(100dvh - ${menuViewportTop}px)`, overflowY: "auto" }}>
          <a href="/investgo" className="nav-link" onClick={go("portal")} aria-current={path === "/investgo" ? "page" : undefined} style={{ fontWeight: 700 }}>{INVESTGO_LABEL}</a>
          {NAV_MENUS.map((m) => (
            <React.Fragment key={m.label}>
              <a href={m.path} className="gs-mnav-section" onClick={go(m.view)} style={{ textDecoration: "none", padding: "12px 0 2px", display: "block" }}>{m.label}</a>
              {m.items.map((it, i) => (
                <a key={i} href={it.path} className="nav-link" onClick={nav(it)} aria-current={itemActive(it) ? "page" : undefined} style={{ paddingLeft: 8 }}>{renderNavLabel(it.label)}</a>
              ))}
            </React.Fragment>
          ))}
          {NAV_STANDALONE_LINKS.map((it) => (
            <a key={it.label} href={it.path} className="nav-link" onClick={nav(it)} style={{ padding: "12px 0", display: "block" }}>{renderNavLabel(it.label)}</a>
          ))}
          <a href="/investgo" className="nav-link" onClick={go("portal")} aria-current={path === "/investgo" ? "page" : undefined}>Login</a>
          <a href="/book-demo" className="nav-link" style={{ background: LEMON, textAlign: "center", borderRadius: "8px", padding: "12px", fontWeight: 700, marginTop: 6 }} onClick={go("book-demo")} aria-current={path === "/book-demo" ? "page" : undefined}>Book a demo</a>
        </div>
      )}
      </nav>
    </>
  );
}

export function SiteFooter({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const go = (v: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate?.(v); };
  const goPath = (p: string) => (e: React.MouseEvent) => { e.preventDefault(); window.history.pushState({}, "", p); window.dispatchEvent(new PopStateEvent("popstate")); };
  const path = typeof window !== "undefined" ? (window.location.pathname.replace(/\/$/, "") || "/") : "/";
  const current = (href: string) => path === href.split("#")[0].replace(/\/$/, "") ? "page" : undefined;
  return (
    <div className="footer_component">
      <footer className="footer_wrap">
        <h2 className="footer_title u-sr-only">Footer</h2>
        <div className="footer_contain u-container">
          <a className="footer_logo_wrap w-inline-block" href="/" onClick={go("marketing")}>
            <div className="footer_logo w-embed">
              <span style={{ fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif', fontSize: "22px", fontWeight: 800, fontVariationSettings: '"wght" 800', letterSpacing: 0, color: "currentColor", whiteSpace: "nowrap", lineHeight: 0.96, display: "inline-block", wordSpacing: "0.055em" }}>Greenstreet<span style={{ fontWeight: 380, fontVariationSettings: '"wght" 380', letterSpacing: "0.006em" }}> Finance</span><span style={{ color: LEMON, fontSize: "1.2em" }}>.</span></span>
            </div>
          </a>
          <nav className="footer_layout u-grid-autofit" aria-label="Footer navigation">
            <section className="footer_group_wrap u-column-2">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Product</h3>
              <div className="footer_group_list u-grid-column-2">
                <a className="footer_link_wrap w-inline-block" href="/dscr-calculator" onClick={go("dscr-calculator")}><div className="footer_link_text u-weight-bold">DSCR Calculator</div></a>
                <a className="footer_link_wrap w-inline-block" href="/decision-support" onClick={go("decision-support")}><div className="footer_link_text u-weight-bold">Decision Support</div></a>
                <a className="footer_link_wrap w-inline-block" href="/lender-intel" onClick={go("lender-intel")}><div className="footer_link_text u-weight-bold">Our DSCR Programs</div></a>
                <a className="footer_link_wrap w-inline-block" href="/state-laws" onClick={go("state-laws")}><div className="footer_link_text u-weight-bold">State Regulations</div></a>
                <a className="footer_link_wrap w-inline-block" href="/borrower-profiles" onClick={go("borrower-profiles")}><div className="footer_link_text u-weight-bold">DSCR Borrower Profiles</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Who We Serve</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/investors" onClick={go("investors")}><div className="footer_link_text u-weight-bold">Real Estate Investors</div></a>
                <a className="footer_link_wrap w-inline-block" href="/non-us-investors" onClick={go("non-us-investors")}><div className="footer_link_text u-weight-bold">Non-US Investors</div></a>
                <a className="footer_link_wrap w-inline-block" href="/str-airbnb" onClick={go("str-hosts")}><div className="footer_link_text u-weight-bold">STR &amp; Airbnb</div></a>
                <a className="footer_link_wrap w-inline-block" href="/vacation-homes" onClick={go("vacation-homes")}><div className="footer_link_text u-weight-bold">Vacation Homes</div></a>
                <a className="footer_link_wrap w-inline-block" href="/rate-quiz" onClick={go("rate-quiz")}><div className="footer_link_text u-weight-bold">Rate Quiz</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Company</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/about" onClick={go("about")} aria-current={current("/about")}><div className="footer_link_text u-weight-bold">About</div></a>
                <a className="footer_link_wrap w-inline-block" href="/careers" onClick={go("careers")} aria-current={current("/careers")}><div className="footer_link_text u-weight-bold">Careers</div></a>
                <a className="footer_link_wrap w-inline-block" href="/legal" onClick={go("legal")} aria-current={current("/legal")}><div className="footer_link_text u-weight-bold">Security &amp; Privacy</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Resources</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/blog" onClick={go("blog")} aria-current={current("/blog")}><div className="footer_link_text u-weight-bold">Greenstreet Guidance</div></a>
                <a className="footer_link_wrap w-inline-block" href="/case-studies" onClick={go("case-studies")} aria-current={current("/case-studies")}><div className="footer_link_text u-weight-bold">Illustrative Scenarios</div></a>
                <a className="footer_link_wrap w-inline-block" href="/faq" onClick={go("faq")} aria-current={current("/faq")}><div className="footer_link_text u-weight-bold">FAQ</div></a>
              </div>
            </section>
            <section className="footer_group_wrap u-column-2">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Tools</h3>
              <div className="footer_group_list u-grid-column-2">
                <a className="footer_link_wrap w-inline-block" href="/tools/deal-workspace" onClick={goPath("/tools/deal-workspace")} aria-current={current("/tools/deal-workspace")}><div className="footer_link_text u-weight-bold">Deal Workspace</div></a>
                <a className="footer_link_wrap w-inline-block" href="/tools/sensitivity" onClick={goPath("/tools/sensitivity")} aria-current={current("/tools/sensitivity")}><div className="footer_link_text u-weight-bold">Sensitivity Lab</div></a>
                <a className="footer_link_wrap w-inline-block" href="/tools/structure-optimizer" onClick={goPath("/tools/structure-optimizer")} aria-current={current("/tools/structure-optimizer")}><div className="footer_link_text u-weight-bold">Structure Optimizer</div></a>
                <a className="footer_link_wrap w-inline-block" href="/tools/scenario-history" onClick={goPath("/tools/scenario-history")} aria-current={current("/tools/scenario-history")}><div className="footer_link_text u-weight-bold">Scenario History</div></a>
                <a className="footer_link_wrap w-inline-block" href="/tools/portfolio" onClick={go("portfolio")} aria-current={current("/tools/portfolio")}><div className="footer_link_text u-weight-bold">Portfolio Analyzer</div></a>
              </div>
            </section>
          </nav>
        </div>
        <div className="footer_bottom_wrap">
          <div className="footer_bottom_contain u-container">
            <div>
              <div className="footer_bottom_text">© 2026 Greenstreet Finance. All rights reserved. Educational business-purpose DSCR tools and preliminary scenario review; not a commitment to lend.</div>
              <div className="footer_bottom_text" style={{ marginTop: 6 }}>
                This site does not currently publish a legal entity name, NMLS identifier, state-license list, or verified lending-partner disclosure. Confirm the responsible licensed party before relying on a financing offer.
              </div>
            </div>
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
