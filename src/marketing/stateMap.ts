import { US_PATHS, US_VIEWBOX } from "../data/usMapPaths";

type Tier = 0 | 1 | 2 | 3;

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// DEPRECATED HARDCODED TIER TABLE — conflicts with legal engine source.
// This neutral map visualization is intentionally held behind MarketingHome.tsx:127-139
// review gate. The tier assignments below DO NOT reflect current law:
//   - MN: shown as tier 1, but HF 3437 (enacted 2026-04-23, effective 2026-08-01)
//     narrows § 58.137 to personal/family/household loans only — business-purpose
//     DSCR loans are now CONDITIONAL, not threshold-based tier 1.
//   - Other states may have drifted from src/engine/statePppLaws.ts (the legal source
//     of truth, verified monthly, with provenance and statutory citations).
//
// DO NOT use this table for product decisions. If this map is ever re-enabled,
// derive tiers from PPP_STATE_LAWS status, not this frozen snapshot.
//
// See docs/PROJECT_INTELLIGENCE_BLUEPRINT.md:145 and docs/RECOVERY_AUDIT_2026-08-19.md
// for the reconciliation decision.
const SPECIAL_TIER_DEPRECATED: Record<string, Tier> = {
  AK: 2, AR: 1, CA: 1, IL: 1, KS: 3, ME: 1, MD: 3, MN: 1, MS: 1,
  NJ: 2, NM: 1, NY: 1, ND: 3, OH: 1, OK: 1, PA: 1, RI: 1, SC: 1,
  WA: 1, WV: 1, WI: 1,
};

const TIER_META: Record<Tier, { label: string; color: string; copy: string }> = {
  0: { label: "PPP Allowed", color: "#4dbd97", copy: "Business-purpose DSCR penalty generally clear." },
  1: { label: "Threshold-Based", color: "#d8d958", copy: "Dollar, APR, term, or structure limit needs a check." },
  2: { label: "High-Risk", color: "#e6b84d", copy: "Entity structure or lender overlay matters." },
  3: { label: "Effectively Banned", color: "#e06363", copy: "Most lenders decline or require restructure." },
};

const MAP_CSS = `
  .gs-sm-map-shell{position:relative;width:100%;min-height:26rem;}
  .gs-sm-map-shell svg{width:100%;height:auto;display:block;overflow:visible;}
  .gs-sm-state{cursor:pointer;transform-box:fill-box;transform-origin:center;transition:fill .18s ease,filter .18s ease,stroke-width .18s ease,transform .18s ease;}
  .gs-sm-state:hover,.gs-sm-state:focus-visible{filter:brightness(1.12);stroke-width:2.2px;outline:none;transform:translateY(-1px) scale(1.008);}
  .gs-sm-tip{position:absolute;z-index:5;pointer-events:none;transform:translate(14px,14px);background:#003738;color:#eeefd3;border-radius:.65rem;padding:.75rem .85rem;min-width:11rem;border:1px solid rgba(238,239,211,.16);opacity:0;transition:opacity .12s ease;}
  .gs-sm-tip.is-visible{opacity:1;}
  .gs-sm-tip-title{font-weight:700;font-size:.9rem;margin-bottom:.2rem;}
  .gs-sm-tip-tier{font-size:.68rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;}
  .gs-sm-tip-copy{font-size:.72rem;line-height:1.35;margin-top:.3rem;color:rgba(238,239,211,.72);}
  .gs-sm-state{opacity:0;animation:gs-sm-pop .48s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i) * 10ms);}
  .gs-statemap-legend{display:grid;gap:.65rem;}
  .gs-sm-legend-row{display:flex;align-items:flex-start;gap:.6rem;color:#eeefd3;font-weight:600;}
  .gs-sm-legend-dot{width:.9rem;height:.9rem;border-radius:.28rem;flex:0 0 auto;margin-top:.1rem;}
  .gs-sm-legend-label{font-size:.9rem;line-height:1.1;color:#eeefd3;}
  .gs-sm-legend-copy{font-size:.72rem;line-height:1.25;color:rgba(238,239,211,.62);font-weight:500;margin-top:.15rem;}
  @keyframes gs-sm-pop{from{opacity:0;transform:translateY(10px) scale(.985);}to{opacity:1;transform:translateY(0) scale(1);}}
  @media (prefers-reduced-motion:reduce){
    .gs-sm-state{opacity:1;animation:none;transition:none;}
    .gs-sm-tip{transition:none;}
  }
`;

function injectStyle() {
  if (document.getElementById("gs-state-map-style")) return;
  const style = document.createElement("style");
  style.id = "gs-state-map-style";
  style.textContent = MAP_CSS;
  document.head.appendChild(style);
}

function tierFor(code: string): Tier {
  return SPECIAL_TIER_DEPRECATED[code] ?? 0;
}

function mountLegend() {
  const legend = document.getElementById("gs-state-map-legend");
  if (!legend || legend.dataset.gsMapLegend === "mounted") return;
  legend.replaceChildren();
  ([0, 1, 2, 3] as Tier[]).forEach((tier) => {
    const meta = TIER_META[tier];
    const row = document.createElement("div");
    row.className = "gs-sm-legend-row";
    const dot = document.createElement("span");
    dot.className = "gs-sm-legend-dot";
    dot.style.background = meta.color;
    const text = document.createElement("div");
    const label = document.createElement("div");
    label.className = "gs-sm-legend-label";
    label.textContent = meta.label;
    const copy = document.createElement("div");
    copy.className = "gs-sm-legend-copy";
    copy.textContent = meta.copy;
    text.append(label, copy);
    row.append(dot, text);
    legend.appendChild(row);
  });
  legend.dataset.gsMapLegend = "mounted";
}

function mountStateMap() {
  const root = document.getElementById("gs-state-map-root");
  if (!root || root.dataset.gsMapMounted === "true") return;
  injectStyle();
  mountLegend();

  const shell = document.createElement("div");
  shell.className = "gs-sm-map-shell";

  const tip = document.createElement("div");
  tip.className = "gs-sm-tip";
  tip.setAttribute("aria-hidden", "true");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", US_VIEWBOX);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "United States prepayment-penalty rule map");

  Object.entries(US_PATHS).forEach(([code, d], index) => {
    const tier = tierFor(code);
    const meta = TIER_META[tier];
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", meta.color);
    path.setAttribute("stroke", "#eeefd3");
    path.setAttribute("stroke-width", code === "DC" ? "1.8" : ".82");
    path.setAttribute("tabindex", "0");
    path.setAttribute("aria-label", `${STATE_NAMES[code] ?? code}: ${meta.label}`);
    path.classList.add("gs-sm-state");
    path.style.setProperty("--i", String(index));
    path.addEventListener("pointerenter", () => {
      const title = STATE_NAMES[code] ?? code;
      tip.innerHTML = `<div class="gs-sm-tip-title">${title}</div><div class="gs-sm-tip-tier" style="color:${meta.color}">${meta.label}</div><div class="gs-sm-tip-copy">${meta.copy}</div>`;
      tip.classList.add("is-visible");
    });
    path.addEventListener("pointermove", (event) => {
      const rect = shell.getBoundingClientRect();
      tip.style.left = `${event.clientX - rect.left}px`;
      tip.style.top = `${event.clientY - rect.top}px`;
    });
    path.addEventListener("pointerleave", () => tip.classList.remove("is-visible"));
    path.addEventListener("click", () => {
      window.location.href = `/state-laws?state=${encodeURIComponent(code)}`;
    });
    path.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = `/state-laws?state=${encodeURIComponent(code)}`;
      }
    });
    svg.appendChild(path);
  });

  shell.append(svg, tip);
  root.replaceChildren(shell);
  root.dataset.gsMapMounted = "true";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountStateMap, { once: true });
} else {
  mountStateMap();
}

window.addEventListener("pageshow", mountStateMap);
