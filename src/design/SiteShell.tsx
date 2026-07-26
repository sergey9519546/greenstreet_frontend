// Shared site chrome — the SAME Webflow nav + footer the marketing home uses,
// so every inner page is framed identically (no "polished home → one-off page"
// drop). These render Webflow design-system classes (.nav, .btn_main,
// .footer_wrap, .u-container, .u-text-style-*), which are styled by the globally
// loaded greenboard CSS, so they match the home pixel-for-pixel for free.
// Extracted from PageShell so DcShell (every tool/content page) can reuse them.
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { PISTACHIO, MIDNIGHT, LEMON, FADED, MINT_BG } from "../theme";

// ── Shared nav menu model — the SAME dropdowns + pages as the marketing home ──
// (Product / Who We Serve / Resources). Every inner page renders these, so the
// navbar + dropdown menu are identical sitewide.
type NavItem = { label: React.ReactNode; view?: string; path?: string };
type NavMenu = { label: string; view: string; path: string; items: NavItem[] };

const INVESTGO_LABEL = (
  <>INVEST<span style={{ opacity: 0.5 }}>GO</span></>
);

const NAV_MENUS: NavMenu[] = [
  {
    label: "Product", view: "products", path: "/products",
    items: [
      { label: INVESTGO_LABEL, view: "portal", path: "/investgo" },
      { label: "Platform", path: "/products/platform" },
      { label: "DSCR Calculator", view: "dscr-calculator", path: "/dscr-calculator" },
      { label: "State Regulations", view: "state-laws", path: "/state-laws" },
      { label: "Deal Analyzer", view: "deal-analyzer", path: "/deal-analyzer" },
      { label: "Borrower Profiles", view: "borrower-profiles", path: "/borrower-profiles" },
    ],
  },
  {
    label: "Who We Serve", view: "solutions", path: "/solutions",
    items: [
      { label: "Real Estate Investors", view: "investors", path: "/investors" },
      { label: "Foreign Nationals", path: "/borrower-profiles#foreign-nationals" },
      { label: "STR & Airbnb Hosts", path: "/borrower-profiles#str-airbnb" },
      { label: "Vacation & Second Homes", path: "/borrower-profiles#vacation" },
      { label: "Portfolio Builders", path: "/borrower-profiles#portfolio" },
      { label: "Rate Quiz", view: "rate-quiz", path: "/rate-quiz" },
    ],
  },
  {
    label: "Resources", view: "blog", path: "/blog",
    items: [
      { label: "Greenstreet Guidance", view: "blog", path: "/blog" },
      { label: "Illustrative Scenarios", view: "case-studies", path: "/case-studies" },
      { label: "FAQ", view: "faq", path: "/faq" },
      { label: "Support & FAQ", path: "/support" },
      { label: "About", view: "about", path: "/about" },
      { label: "Careers", view: "careers", path: "/careers" },
      { label: "Security & Privacy", view: "legal", path: "/legal" },
    ],
  },
];

const NAV_DD_CSS = `
.gs-dd-wrap{position:static;}
.gs-dd-panel{position:absolute;top:calc(100% + 12px);left:0;min-width:240px;background:${PISTACHIO};border:1px solid ${FADED};border-radius:12px;padding:8px;display:flex;flex-direction:column;z-index:60;}
.gs-dd-panel.is-mega{display:grid;grid-template-columns:1fr 1fr;gap:2px 6px;min-width:430px;}
.gs-dd-panel::before{content:"";position:absolute;top:-12px;left:0;right:0;height:12px;}
.gs-dd-item{display:block;padding:10px 13px;border-radius:8px;color:${MIDNIGHT};font-size:14px;font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .2s ease,box-shadow .2s ease;}
.gs-dd-item:hover,.gs-dd-item:focus-visible{background:${MINT_BG};outline:none;}
.gs-dd-item.is-active{background:${MINT_BG};box-shadow:inset 3px 0 0 ${LEMON};}
.gs-dd-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;cursor:pointer;background:none;border:none;color:inherit;font-family:inherit;text-align:inherit;appearance:none;position:relative;}
.gs-dd-caret{transition:transform .18s ease;}
.gs-dd-wrap.is-open .gs-dd-caret{transform:rotate(180deg);}
/* Active section / current page = the mint hover pill (matches the home's
   .nav-link:has(.w--current){background:card}). The original nav has NO
   underline — the lemon ::after line was a React-only addition; removed. */
.gs-site-nav .gs-dd-toggle.is-active .nav-link-background,
.gs-site-nav .nav-link.is-current .nav-link-background{opacity:1;}
.gs-mnav-section{font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#006565;margin:14px 0 2px;}
/* Recreate Webflow's nav-link hover pill (greenboard .nav-link-background:
   opacity 0->1, .4s ease). IX2 isn't running in React, so trigger it in CSS.
   nav-link must be the positioned containing block so the pill anchors to it. */
.gs-site-nav .nav-link{position:relative;}
.gs-site-nav .nav-link .nav_links_text,.gs-site-nav .nav-link .gs-dd-caret{position:relative;z-index:2;}
.gs-site-nav .nav-link:hover .nav-link-background,
.gs-site-nav .nav-link:focus-visible .nav-link-background{opacity:1;}
.gs-site-nav .nav-btn{transition:filter .2s ease,transform .1s ease;}
.gs-site-nav .nav-btn:hover{filter:brightness(1.08);}
.gs-site-nav .nav-btn:active{transform:translateY(1px);}
/* ── Mega dropdown — matches the Webflow home mega (full-width card grid) ── */
.gs-dd-wrap.is-open .gs-dd-toggle .nav-link-background{opacity:1;}
.gs-mega{position:absolute;top:100%;left:0;right:0;z-index:60;background:${PISTACHIO};border-top:1px solid ${FADED};border-radius:0 0 16px 16px;}
.gs-mega::before{content:"";position:absolute;top:-14px;left:0;right:0;height:14px;}
.gs-mega-inner{padding:16px 0 26px;}
.gs-mega-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;}
.gs-mega-card{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:20px;min-height:116px;padding:16px 18px;border-radius:14px;background:${MINT_BG};color:${MIDNIGHT};text-decoration:none;transition:background-color .18s ease,color .18s ease;}
.gs-mega-card:hover,.gs-mega-card:focus-visible{background:${LEMON};color:${MIDNIGHT};outline:none;}
.gs-mega-card.is-current{background:${LEMON};color:${MIDNIGHT};}
.gs-mega-title{font-size:18px;font-weight:600;letter-spacing:-0.02em;line-height:1.15;}
.gs-mega-arrow{align-self:flex-end;flex-shrink:0;}
.gs-mega-feature{grid-row:span 2;grid-column:1;min-height:auto;background:${MIDNIGHT};color:${PISTACHIO};}
.gs-mega-feature:hover,.gs-mega-feature:focus-visible{background:${MIDNIGHT};color:${PISTACHIO};}
.gs-mega-logo{font-size:26px;font-weight:700;letter-spacing:-0.01em;}
@media (max-width:991px){.gs-mega{display:none !important;}}
`;

export function SiteNav({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuViewportTop, setMenuViewportTop] = useState(120);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
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
  const go = (v: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate?.(v); closeAll(); };
  const goPath = (p: string) => (e: React.MouseEvent) => { e.preventDefault(); window.history.pushState({}, "", p); window.dispatchEvent(new PopStateEvent("popstate")); closeAll(); };
  const nav = (it: NavItem) => it.view ? go(it.view) : goPath(it.path || "/");
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

  // GSAP: premium dropdown open (panel slide+fade, then staggered items).
  // Reduced-motion safe — skips entirely and leaves the panel fully visible.
  useEffect(() => {
    if (!openMenu || !panelRef.current) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    // Transform-only (no opacity-from-0): if the rAF ticker is ever throttled the
    // panel still ends VISIBLE — a stuck few-px slide is fine, an invisible menu is not.
    gsap.fromTo(panelRef.current, { y: -10 }, { y: 0, duration: 0.3, ease: "power2.out", clearProps: "transform" });
    gsap.fromTo(panelRef.current.querySelectorAll(".gs-mega-card"), { y: -8 }, { y: 0, duration: 0.28, stagger: 0.03, ease: "power2.out", delay: 0.04, clearProps: "transform" });
  }, [openMenu]);

  // GSAP: mobile menu open (slide+fade, then staggered links). Reduced-motion safe.
  useEffect(() => {
    if (!menuOpen || !mobileRef.current) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    gsap.fromTo(mobileRef.current, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(mobileRef.current.children, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.26, stagger: 0.03, ease: "power2.out", delay: 0.05, clearProps: "all" });
  }, [menuOpen]);

  const caret = (
    <svg className="gs-dd-caret" width="11" height="11" viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );

  const arrow = (
    <svg className="gs-mega-arrow" width="17" height="17" viewBox="0 0 24 25" fill="none" aria-hidden="true">
      <path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor" />
    </svg>
  );

  const renderMenu = (m: NavMenu) => {
    // First item is the INVESTGO portal -> render as the tall dark feature card
    // (matches the home mega); the rest fill the 4-col card grid beside it.
    const hasFeature = m.items[0]?.view === "portal";
    const feature = hasFeature ? m.items[0] : null;
    const cards = hasFeature ? m.items.slice(1) : m.items;
    return (
      <div
        key={m.label}
        className={`gs-dd-wrap${openMenu === m.label ? " is-open" : ""}`}
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
          className={`nav-link gs-dd-toggle w-inline-block${menuActive(m) ? " is-active" : ""}`}
          aria-controls={menuPanelId(m.label)}
          aria-expanded={openMenu === m.label}
          onClick={() => setOpenMenu((current) => current === m.label ? null : m.label)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            openNow(m.label);
            window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus());
          }}
        >
          <div className="nav-link-background" aria-hidden="true" />
          <div className="nav_links_text">{m.label}</div>
          {caret}
        </button>
        {openMenu === m.label && (
          <div ref={panelRef} id={menuPanelId(m.label)} className="gs-mega" role="group" aria-label={`${m.label} links`}>
            <div className="gs-mega-inner">
              <div className="gs-mega-grid">
                {feature && (
                  <a className="gs-mega-card gs-mega-feature" href={feature.path} onClick={nav(feature)} aria-current={itemActive(feature) ? "page" : undefined}>
                    <div className="gs-mega-logo">INVEST<span style={{ opacity: 0.5 }}>GO</span></div>
                    {arrow}
                  </a>
                )}
                {cards.map((it, i) => (
                  <a key={i} className={`gs-mega-card${itemActive(it) ? " is-current" : ""}`} href={it.path} onClick={nav(it)} aria-current={itemActive(it) ? "page" : undefined}>
                    <div className="gs-mega-title">{it.label}</div>
                    {arrow}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{NAV_DD_CSS}</style>
      {announcementVisible && (
        <div className="announcement gs-site-announcement u-container u-theme-light">
          <a
            className="link-block w-inline-block"
            href="/blog/greenstreet-go-launch"
            aria-label="Read the InvestGO announcement"
          />
          <div className="announcement-txt w-richtext">
            <p><strong>⎋</strong> Greenstreet Finance announces <strong>InvestGO</strong> — the unified DSCR loan platform</p>
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
                <div className="nav_links_text font-go" style={{ color: MIDNIGHT, fontWeight: 700 }}>{INVESTGO_LABEL}</div>
              </a>

              {renderMenu(NAV_MENUS[0])}
              {renderMenu(NAV_MENUS[1])}
              <a className="nav-link w-inline-block" href="/partners" onClick={go("brokers-partner")} aria-current={path === "/partners" ? "page" : undefined}>
                <div className="nav-link-background" aria-hidden="true" />
                <div className="nav_links_text">Partnerships</div>
              </a>
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
          <button ref={mobileToggleRef} type="button" className="burger-wrap" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={toggleMobileMenu} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
              <a href={m.path} className="gs-mnav-section" onClick={go(m.view)} style={{ textDecoration: "none" }}>{m.label}</a>
              {m.items.map((it, i) => (
                <a key={i} href={it.path} className="nav-link" onClick={nav(it)} aria-current={itemActive(it) ? "page" : undefined} style={{ paddingLeft: 8 }}>{it.label}</a>
              ))}
            </React.Fragment>
          ))}
          <a href="/partners" className="nav-link" onClick={go("brokers-partner")} aria-current={path === "/partners" ? "page" : undefined}>Partnerships</a>
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
              <span style={{ fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif', fontSize: "22px", fontWeight: 700, fontVariationSettings: '"wght" 700', letterSpacing: "-0.04em", color: "currentColor", whiteSpace: "nowrap", lineHeight: 0.98, display: "inline-block" }}>Greenstreet<span style={{ fontWeight: 400, fontVariationSettings: '"wght" 400' }}> Finance</span><span style={{ color: LEMON, fontSize: "1.2em" }}>.</span></span>
            </div>
          </a>
          <nav className="footer_layout u-grid-autofit" aria-label="Footer navigation">
            <section className="footer_group_wrap u-column-2">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Product</h3>
              <div className="footer_group_list u-grid-column-2">
                <a className="footer_link_wrap w-inline-block" href="/dscr-calculator" onClick={go("dscr-calculator")} aria-current={current("/dscr-calculator")}><div className="footer_link_text u-weight-bold">DSCR Calculator</div></a>
                <a className="footer_link_wrap w-inline-block" href="/deal-analyzer" onClick={go("deal-analyzer")} aria-current={current("/deal-analyzer")}><div className="footer_link_text u-weight-bold">Deal Analyzer</div></a>
                <a className="footer_link_wrap w-inline-block" href="/products" onClick={go("products")} aria-current={current("/products")}><div className="footer_link_text u-weight-bold">Product Overview</div></a>
                <a className="footer_link_wrap w-inline-block" href="/state-laws" onClick={go("state-laws")} aria-current={current("/state-laws")}><div className="footer_link_text u-weight-bold">State Regulations</div></a>
                <a className="footer_link_wrap w-inline-block" href="/borrower-profiles" onClick={go("borrower-profiles")} aria-current={current("/borrower-profiles")}><div className="footer_link_text u-weight-bold">DSCR Borrower Profiles</div></a>
              </div>
            </section>
            <section className="footer_group_wrap">
              <h3 className="footer_group_title u-text-style-h4 u-mb-2">Who We Serve</h3>
              <div className="footer_group_list">
                <a className="footer_link_wrap w-inline-block" href="/investors" onClick={go("investors")} aria-current={current("/investors")}><div className="footer_link_text u-weight-bold">Real Estate Investors</div></a>
                <a className="footer_link_wrap w-inline-block" href="/borrower-profiles#foreign-nationals" onClick={goPath("/borrower-profiles#foreign-nationals")} aria-current={current("/borrower-profiles#foreign-nationals")}><div className="footer_link_text u-weight-bold">Foreign Nationals</div></a>
                <a className="footer_link_wrap w-inline-block" href="/borrower-profiles#str-airbnb" onClick={goPath("/borrower-profiles#str-airbnb")} aria-current={current("/borrower-profiles#str-airbnb")}><div className="footer_link_text u-weight-bold">STR &amp; Airbnb</div></a>
                <a className="footer_link_wrap w-inline-block" href="/rate-quiz" onClick={go("rate-quiz")} aria-current={current("/rate-quiz")}><div className="footer_link_text u-weight-bold">Rate Quiz</div></a>
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
