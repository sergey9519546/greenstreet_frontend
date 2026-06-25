// Shared "disciplined-cartoon" visual artifacts for risk / DSCR / stress areas.
// One coherent system reused across the tools (no per-page one-offs):
//   • DscrGauge    — needle gauge that animates to a DSCR value, colored by tier
//   • BalanceScale — beam that tips to show rent vs the full monthly payment
//   • RiskFlame    — the "Hyperflames" risk indicator: 1–3 stylized SVG flames,
//                    sized + colored by intensity (stress / volatility / danger)
//
// Rules honored: premium flat brand, stylized SVG (not literal fire, no
// characters/particles/bounce), all motion is CSS-transition / keyframe driven
// off the VALUE (never a page-load from()), and fully reduced-motion safe.
import React from "react";
import { swatch } from "../theme";

const LEMON = swatch.lemon;
const EMERALD = swatch.emerald;
const MIDNIGHT = swatch.midnight;
const RAIN = swatch.rainforest;
const ORANGE = "#f97316";
const RED = "#ff6b6b";

// Inject the shared keyframes/transitions once.
let _injected = false;
function ensureCss() {
  if (_injected || typeof document === "undefined") return;
  _injected = true;
  const el = document.createElement("style");
  el.setAttribute("data-gs-artifacts", "1");
  el.textContent = `
.gsa-needle{transform-origin:50% 100%;transition:transform .55s cubic-bezier(.34,1.3,.5,1);}
.gsa-beam{transform-origin:50% 50%;transition:transform .5s cubic-bezier(.34,1.2,.5,1);}
.gsa-pan{transition:transform .5s cubic-bezier(.34,1.2,.5,1);}
.gsa-fill{transition:width .5s ease;}
@keyframes gsaFlicker{0%,100%{transform:scaleY(1) translateY(0);opacity:1;}50%{transform:scaleY(1.08) translateY(-1px);opacity:.92;}}
.gsa-flame{transform-origin:50% 100%;animation:gsaFlicker 1.4s ease-in-out infinite;}
.gsa-flame.f2{animation-delay:.25s;}
.gsa-flame.f3{animation-delay:.5s;}
@media (prefers-reduced-motion: reduce){
  .gsa-needle,.gsa-beam,.gsa-pan,.gsa-fill{transition:none !important;}
  .gsa-flame{animation:none !important;}
}`;
  document.head.appendChild(el);
}

// ── DSCR tier color (shared with the rest of the product) ─────────────────────
export function dscrColor(dscr: number): string {
  if (dscr >= 1.25) return EMERALD;
  if (dscr >= 1.1) return LEMON;
  if (dscr >= 1.0) return RAIN;
  if (dscr >= 0.75) return ORANGE;
  return RED;
}

// ── DscrGauge ────────────────────────────────────────────────────────────────
// Semicircle gauge; needle maps DSCR 0.5–2.0 across 180°. Ticks at 1.00 / 1.25.
export function DscrGauge({ value, size = 200, label = true }: { value: number; size?: number; label?: boolean }) {
  ensureCss();
  const min = 0.5, max = 2.0;
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -90 + t * 180; // -90° (left) … +90° (right)
  const col = dscrColor(value);
  const r = 90, cx = 100, cy = 100;
  const arc = (from: number, to: number) => {
    const a0 = Math.PI * (1 - from), a1 = Math.PI * (1 - to);
    const x0 = cx + r * Math.cos(a0), y0 = cy - r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const seg = (lo: number, hi: number) => ({ from: (lo - min) / (max - min), to: (hi - min) / (max - min) });
  const zones = [
    { ...seg(0.5, 1.0), c: RED }, { ...seg(1.0, 1.1), c: ORANGE },
    { ...seg(1.1, 1.25), c: LEMON }, { ...seg(1.25, 2.0), c: EMERALD },
  ];
  return (
    <div style={{ width: size, display: "inline-block", textAlign: "center" }}>
      <svg viewBox="0 0 200 120" width={size} height={size * 0.6} role="img" aria-label={`DSCR ${value.toFixed(2)}`}>
        {zones.map((z, i) => (
          <path key={i} d={arc(z.from, z.to)} fill="none" stroke={z.c} strokeWidth="12" strokeLinecap="butt" opacity={0.9} />
        ))}
        {/* needle */}
        <g className="gsa-needle" style={{ transform: `rotate(${angle}deg)` }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 6} stroke={MIDNIGHT} strokeWidth="3.5" strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r="7" fill={MIDNIGHT} />
      </svg>
      {label && (
        <div style={{ marginTop: -6, fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: size * 0.16, color: col, lineHeight: 1 }}>
          {value.toFixed(2)}
          <span style={{ fontSize: size * 0.07 }}>x</span>
        </div>
      )}
    </div>
  );
}

// ── BalanceScale ─────────────────────────────────────────────────────────────
// Beam tips toward the heavier side. ratio = rent / payment (>1 = rent wins).
export function BalanceScale({ rent, payment, size = 220 }: { rent: number; payment: number; size?: number }) {
  ensureCss();
  const ratio = payment > 0 ? rent / payment : 1;
  const tilt = Math.max(-14, Math.min(14, (ratio - 1) * 26)); // degrees, clamped
  const rentWins = ratio >= 1;
  return (
    <svg viewBox="0 0 220 130" width={size} height={size * 0.59} role="img" aria-label="Rent vs payment balance">
      {/* stand */}
      <rect x="106" y="40" width="8" height="74" rx="3" fill={MIDNIGHT} />
      <rect x="80" y="112" width="60" height="8" rx="4" fill={MIDNIGHT} />
      <circle cx="110" cy="42" r="6" fill={MIDNIGHT} />
      {/* beam + pans */}
      <g className="gsa-beam" style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "110px 42px" }}>
        <rect x="24" y="39" width="172" height="6" rx="3" fill={MIDNIGHT} />
        <g className="gsa-pan">
          <line x1="40" y1="42" x2="40" y2="64" stroke={MIDNIGHT} strokeWidth="2" />
          <path d="M22 64 H58 L52 80 H28 Z" fill={rentWins ? EMERALD : "#cfd0a8"} />
          <text x="40" y="76" textAnchor="middle" fontSize="9" fontWeight="700" fill={MIDNIGHT} fontFamily="Outfit, sans-serif">Rent</text>
        </g>
        <g className="gsa-pan">
          <line x1="180" y1="42" x2="180" y2="64" stroke={MIDNIGHT} strokeWidth="2" />
          <path d="M162 64 H198 L192 80 H168 Z" fill={!rentWins ? ORANGE : "#cfd0a8"} />
          <text x="180" y="76" textAnchor="middle" fontSize="9" fontWeight="700" fill={MIDNIGHT} fontFamily="Outfit, sans-serif">Pay</text>
        </g>
      </g>
    </svg>
  );
}

// ── RiskFlame (Hyperflames) ──────────────────────────────────────────────────
// intensity: "none" | "low" | "med" | "high" — 0..3 stylized flames, color-coded.
export type RiskLevel = "none" | "low" | "med" | "high";
export function riskFromDscr(dscr: number): RiskLevel {
  if (dscr >= 1.25) return "none";
  if (dscr >= 1.1) return "low";
  if (dscr >= 1.0) return "med";
  return "high";
}
const FLAME = "M12 2C12 6 7 7 7 12a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 1-3-1-6-1-9z";
export function RiskFlame({ level, size = 22 }: { level: RiskLevel; size?: number }) {
  ensureCss();
  if (level === "none") {
    return (
      <span title="Comfortable cushion" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: EMERALD, fontWeight: 700, fontSize: size * 0.6 }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={EMERALD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  const cfg = { low: { n: 1, c: LEMON }, med: { n: 2, c: ORANGE }, high: { n: 3, c: RED } }[level];
  return (
    <span role="img" aria-label={`${level} risk`} title={`${level} risk / stress`} style={{ display: "inline-flex", alignItems: "flex-end", gap: 1 }}>
      {Array.from({ length: cfg.n }).map((_, i) => (
        <svg key={i} className={`gsa-flame f${i + 1}`} width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d={FLAME} fill={cfg.c} opacity={0.92} />
          <path d="M12 9c0 2-2 3-2 5a2 2 0 0 0 4 0c0-1-1-2-2-5z" fill="#fff" opacity={0.45} />
        </svg>
      ))}
    </span>
  );
}
