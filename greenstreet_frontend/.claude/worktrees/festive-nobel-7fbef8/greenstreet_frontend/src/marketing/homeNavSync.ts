import { INVESTGO_TEXT, NAV_MENUS, NAV_SYNC_CSS, type NavItem } from "../design/navModel";

const ARROW_SVG = `
  <svg fill="none" height="100%" viewBox="0 0 14 14" width="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9.99964 11.5002L8.98714 10.5127L11.7871 7.68769H0.412109V6.31269H11.7871L8.98714 3.48769L9.99964 2.50019L14.4996 7.00019L9.99964 11.5002Z" fill="currentColor"></path>
  </svg>`;

function injectStyle() {
  if (document.getElementById("gs-home-nav-sync-style")) return;
  const style = document.createElement("style");
  style.id = "gs-home-nav-sync-style";
  style.textContent = NAV_SYNC_CSS;
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
