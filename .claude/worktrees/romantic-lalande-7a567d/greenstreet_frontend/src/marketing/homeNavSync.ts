import { INVESTGO_TEXT, NAV_MENUS, type NavItem } from "../design/navModel";

const ARROW_SVG = `
  <svg fill="none" height="100%" viewBox="0 0 14 14" width="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9.99964 11.5002L8.98714 10.5127L11.7871 7.68769H0.412109V6.31269H11.7871L8.98714 3.48769L9.99964 2.50019L14.4996 7.00019L9.99964 11.5002Z" fill="currentColor"></path>
  </svg>`;

const SYNC_CSS = `
  .nav_dropdown_mega_layout.is-desktop.gs-nav-synced{
    display:grid !important;
    grid-template-columns:repeat(4,minmax(0,1fr)) !important;
    gap:.875rem !important;
    align-items:stretch !important;
  }
  .nav_dropdown_mega_layout.is-desktop.gs-nav-synced .nav_dropdown_link{
    min-height:7.1rem;
    border-radius:.875rem;
  }
  .nav_dropdown_mega_layout.is-desktop.gs-nav-synced .nav_dropdown_link.gs-nav-feature{
    grid-row:span 2;
    min-height:auto;
  }
  .nav_dropdown_mega_layout.is-desktop.gs-nav-synced .nav_dropdown_text_logo{
    font-family:"Outfit Variable",Outfit,Arial,sans-serif;
    font-size:1.625rem;
    font-weight:700;
    letter-spacing:-.02em;
    line-height:1;
  }
`;

function injectStyle() {
  if (document.getElementById("gs-home-nav-sync-style")) return;
  const style = document.createElement("style");
  style.id = "gs-home-nav-sync-style";
  style.textContent = SYNC_CSS;
  document.head.appendChild(style);
}

function itemLabel(item: NavItem) {
  return item.label === INVESTGO_TEXT ? "INVESTGO" : item.label;
}

function createArrowWrap() {
  const wrap = document.createElement("div");
  wrap.className = "nav_dropdown_link_icon_wrap";
  const icon = document.createElement("div");
  icon.className = "nav_dropdown_link_icon w-embed";
  icon.innerHTML = ARROW_SVG;
  wrap.appendChild(icon);
  return wrap;
}

function createCard(item: NavItem) {
  const a = document.createElement("a");
  a.className = `nav_dropdown_link is-desktop w-inline-block${item.feature ? " u-theme-dark gs-nav-feature" : ""}`;
  a.href = item.path;

  if (item.feature) {
    const logo = document.createElement("div");
    logo.className = "nav_dropdown_text_logo w-embed";
    logo.innerHTML = `INVEST<span style="opacity:.5">GO</span>`;
    a.appendChild(logo);
  } else {
    const title = document.createElement("div");
    title.className = "nav_dropdown_text u-text-style-h4";
    title.textContent = itemLabel(item);
    a.appendChild(title);
  }

  a.appendChild(createArrowWrap());
  return a;
}

function syncDropdown(component: Element) {
  const trigger = component.querySelector(".nav_links_text")?.textContent?.replace(/\s+/g, " ").trim();
  const menu = NAV_MENUS.find((candidate) => candidate.label === trigger);
  if (!menu) return;

  const layout = component.querySelector(".nav_dropdown_mega_layout.is-desktop");
  if (!(layout instanceof HTMLElement)) return;
  if (layout.dataset.gsNavSynced === menu.label) return;

  layout.replaceChildren(...menu.items.map(createCard));
  layout.classList.add("gs-nav-synced");
  layout.dataset.gsNavSynced = menu.label;
}

function syncHomeNav() {
  injectStyle();
  document
    .querySelectorAll('#webflow-root nav.nav[data-wf--nav-main--variant="greenstreet"] .nav_dropdown_component')
    .forEach(syncDropdown);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", syncHomeNav, { once: true });
} else {
  syncHomeNav();
}

window.addEventListener("pageshow", syncHomeNav);
