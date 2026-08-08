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
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { swatch, risk, onDark, font, tracking } from "../theme";

const LEMON = swatch.lemon;
const EMERALD = swatch.emerald;
const MIDNIGHT = swatch.midnight;
const RAIN = swatch.rainforest;
const ORANGE = risk.warning;
const RED = risk.danger;

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
/* Perpetual "hyperflame" motion (flicker/orbit/bob/redraw/pulse) removed per
   design taste — these render STATIC now; only interaction-driven transitions
   (needle/beam/pan/fill, above) still animate on value change. */
.gsa-flame{transform-origin:50% 100%;}
.gsa-path{stroke-dasharray:none;stroke-dashoffset:0;}
.gsa-pulse-dot{transform-origin:center;}
/* DSCR coverage meter — a linear scale, one fill, labelled thresholds.
   Position transitions are value-driven only; nothing loops. */
.gsa-meter{outline:none;}
.gsa-meter:focus-visible{outline:2px solid ${LEMON};outline-offset:5px;border-radius:4px;}
.gsa-meter-fill,.gsa-meter-mark{transition:width .46s cubic-bezier(.22,.68,.3,1),left .46s cubic-bezier(.22,.68,.3,1);}
/* While dragging, the meter must track the pointer with no easing lag. */
.gsa-meter-live .gsa-meter-fill,.gsa-meter-live .gsa-meter-mark{transition:none;}
@media (prefers-reduced-motion: reduce){
  .gsa-needle,.gsa-beam,.gsa-pan,.gsa-fill,.gsa-meter-fill,.gsa-meter-mark{transition:none !important;}
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

// ── ClaudeDscrGauge — the DSCR coverage meter ────────────────────────────────
// WHAT THIS INSTRUMENT HAS TO SAY: does the rent cover the debt, and by how much
// margin? That is a comparison of one value against one or two fixed lines
// (1.00 break-even; the lender floor, typically 1.20). Position along a common
// scale reads that comparison far more accurately than arc length on a dial, and
// a horizontal axis is the only orientation that can carry a *legible* threshold
// label — which is the whole point, since an unlabelled colour band forces the
// reader to decode a legend instead of reading a number against a line.
//
// So this is a linear meter, not a dial:
//   • ONE neutral track, ONE fill from the scale start to the value.
//   • Fill colour = state against the thresholds, in three steps of the approved
//     ramp (below break-even / covers-but-under-floor / clears floor). No blended
//     bands, no rainbow, no decorative use of the risk ramp.
//   • Every threshold that changes the answer is drawn AND named on the axis.
//   • No rings, no glow, no ambient gradient. Flat, per the homepage.
// It remains a real control: drag or arrow-key it when `onValueChange` is given.

/** DSCR state against the two decisive lines. Three steps, deliberately. */
export type DscrCoverage = "fail" | "marginal" | "pass";
export function dscrCoverage(value: number, breakEven = 1.0, floor = 1.2): DscrCoverage {
  if (value < breakEven) return "fail";
  if (value < floor) return "marginal";
  return "pass";
}
const COVERAGE_COLOR: Record<DscrCoverage, string> = {
  fail: RED,        // risk.danger  — rent does not cover the debt
  marginal: ORANGE, // risk.warning — covers the debt, short of the lender floor
  pass: EMERALD,    // emerald      — clears the floor with margin
};

export function ClaudeDscrGauge({
  value,
  size = 320,
  min = 0.5,
  max = 1.5,
  label = "DSCR",
  breakEven = 1.0,
  floor = 1.2,
  onValueChange,
}: {
  value: number;
  size?: number;
  min?: number;
  max?: number;
  label?: string;
  /** The line where rent exactly equals the debt service. */
  breakEven?: number;
  /** The commercial line — the lender's minimum coverage. */
  floor?: number;
  onValueChange?: (value: number) => void;
}) {
  ensureCss();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [dragging, setDragging] = useState(false);

  const span = max - min || 1;
  const posOf = (v: number) => Math.max(0, Math.min(1, (v - min) / span));
  const pct = posOf(value);
  const state = dscrCoverage(value, breakEven, floor);
  const col = COVERAGE_COLOR[state];

  // A threshold is only drawn if it actually falls on this scale, and only if it
  // sits clear of the end labels — a tick crushed against "0.50" reads as noise.
  const marks = [
    { at: breakEven, name: "break-even" },
    { at: floor, name: "floor" },
  ].filter((m) => m.at > min && m.at < max && posOf(m.at) > 0.07 && posOf(m.at) < 0.93);

  const delta = Math.abs(value - (state === "fail" ? breakEven : floor));
  const sentence =
    state === "fail"
      ? `${delta.toFixed(2)} short of ${breakEven.toFixed(2)} break-even`
      : state === "marginal"
        ? `${delta.toFixed(2)} short of the ${floor.toFixed(2)} floor`
        : delta < 0.005
          ? `at the ${floor.toFixed(2)} floor`
          : `${delta.toFixed(2)} above the ${floor.toFixed(2)} floor`;
  const stateWord = state === "fail" ? "does not cover debt" : state === "marginal" ? "covers debt" : "clears lender floor";

  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The readout counts to the new value. Positions are CSS transitions (above),
  // so this is the only tween — and it is skipped while dragging or reduced.
  useEffect(() => {
    if (reduced || dragging) {
      gsap.killTweensOf(displayRef);
      displayRef.current = value;
      setDisplayValue(value);
      return;
    }
    gsap.to(displayRef, {
      current: value,
      duration: 0.46,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => setDisplayValue(displayRef.current),
      onComplete: () => setDisplayValue(value),
    });
  }, [value, reduced, dragging]);

  const setFromPointer = (clientX: number) => {
    const track = trackRef.current;
    if (!onValueChange || !track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = Math.max(min, Math.min(max, min + p * span));
    onValueChange(Number(next.toFixed(2)));
  };

  const nudge = (by: number) => {
    if (!onValueChange) return;
    onValueChange(Number(Math.max(min, Math.min(max, value + by)).toFixed(2)));
  };

  // Type scales off `size` so the 300px verdict meter and the 170px target
  // picker both stay legible without a second component.
  const valueSize = Math.max(24, Math.min(46, Math.round(size * 0.155)));
  const trackH = Math.max(12, Math.min(18, Math.round(size * 0.055)));
  const capSize = size < 210 ? 9 : 10;
  const tick = 6; // how far the caliper marks protrude past the track

  const interactive = Boolean(onValueChange);
  const valueText = `${value.toFixed(2)}x — ${stateWord}, ${sentence}`;
  const a11y = interactive
    ? { role: "slider" as const, tabIndex: 0, "aria-orientation": "horizontal" as const }
    : { role: "meter" as const };

  const capLabel = (left: string, text: string, sub?: string, transform?: string) => (
    <div style={{ position: "absolute", top: 0, left, transform, textAlign: "center" as const, whiteSpace: "nowrap" as const }}>
      <div style={{ fontFamily: font.mono, fontSize: capSize + 1, fontWeight: 600, color: onDark.dim, lineHeight: 1.3 }}>{text}</div>
      {sub && (
        <div style={{ fontSize: capSize, fontWeight: 600, letterSpacing: tracking.wide, textTransform: "uppercase" as const, color: onDark.tertiary, lineHeight: 1.3 }}>{sub}</div>
      )}
    </div>
  );

  return (
    // `width: size` (not 100%) so the meter still claims its space inside a
    // greedy `1fr auto` grid track, where a fluid item collapses to min-content;
    // `maxWidth: 100%` keeps it fluid once the container is narrower than `size`.
    <div style={{ width: size, maxWidth: "100%", margin: "0 auto" }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: tracking.caps, textTransform: "uppercase", color: onDark.secondary }}>{label}</div>
      <div
        style={{
          fontFamily: font.mono,
          fontSize: valueSize,
          fontWeight: 700,
          letterSpacing: tracking.tight,
          color: col,
          lineHeight: 1.1,
          marginTop: 2,
        }}
      >
        {displayValue.toFixed(2)}
        <span style={{ fontSize: "0.46em", fontWeight: 600 }}>x</span>
      </div>

      <div
        {...a11y}
        className={`gsa-meter${dragging ? " gsa-meter-live" : ""}`}
        aria-label={`${label} — debt service coverage ratio`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
        aria-valuetext={valueText}
        onPointerDown={(e) => {
          if (!interactive) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setDragging(true);
          setFromPointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!interactive || !(e.buttons & 1)) return;
          setFromPointer(e.clientX);
        }}
        onPointerUp={(e) => {
          if (!interactive) return;
          try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* already released */ }
          setDragging(false);
        }}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          if (!interactive) return;
          const step = e.shiftKey ? 0.1 : 0.05;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); nudge(-step); }
          else if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); nudge(step); }
          else if (e.key === "PageDown") { e.preventDefault(); nudge(-0.25); }
          else if (e.key === "PageUp") { e.preventDefault(); nudge(0.25); }
          else if (e.key === "Home") { e.preventDefault(); onValueChange?.(Number(min.toFixed(2))); }
          else if (e.key === "End") { e.preventDefault(); onValueChange?.(Number(max.toFixed(2))); }
        }}
        style={{
          marginTop: 10,
          padding: `${tick + 4}px 0`,
          cursor: interactive ? (dragging ? "grabbing" : "grab") : "default",
          touchAction: interactive ? "none" : "auto",
        }}
      >
        {/* The scale itself */}
        <div ref={trackRef} style={{ position: "relative", width: "100%", height: trackH, background: swatch.pistachioFaded, borderRadius: 2 }}>
          <div
            className="gsa-meter-fill"
            style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: col, borderRadius: 2 }}
          />
          {/* Caliper marks: two segments framing the threshold, above and below
              the track. They never cross the fill, so they stay readable at any
              value without fighting it for contrast. */}
          {marks.map((m) => (
            <React.Fragment key={m.name}>
              <div style={{ position: "absolute", left: `${posOf(m.at) * 100}%`, top: -tick, width: 2, height: tick, marginLeft: -1, background: onDark.dim }} />
              <div style={{ position: "absolute", left: `${posOf(m.at) * 100}%`, top: trackH, width: 2, height: tick, marginLeft: -1, background: onDark.dim }} />
            </React.Fragment>
          ))}
          {/* Current value marker — the one element that reads as "here". */}
          <div
            className="gsa-meter-mark"
            style={{
              position: "absolute",
              left: `${pct * 100}%`,
              top: -(tick + 1),
              width: 4,
              marginLeft: -2,
              height: trackH + (tick + 1) * 2,
              background: onDark.primary,
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Axis: the ends of the scale, plus every threshold, NAMED. */}
      <div style={{ position: "relative", height: capSize * 2.8, marginTop: 2 }}>
        {capLabel("0", min.toFixed(2))}
        {capLabel("100%", max.toFixed(2), undefined, "translateX(-100%)")}
        {marks.map((m) => (
          <React.Fragment key={m.name}>{capLabel(`${posOf(m.at) * 100}%`, m.at.toFixed(2), m.name, "translateX(-50%)")}</React.Fragment>
        ))}
      </div>

      <div style={{ fontSize: size < 210 ? 11 : 12, fontWeight: 500, color: onDark.secondary, marginTop: 8, lineHeight: 1.4 }}>
        {sentence}
      </div>
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

// ── RiskMeter (exported as RiskFlame for back-compat) ────────────────────────
// A calm 3-segment level meter — NOT cartoon flames. As coverage tightens, more
// segments light in the risk color (lemon → amber → red); "none" is an emerald
// all-clear check. Premium + legible at small sizes; off-segments use
// currentColor so it reads on either a light or dark ground.
export type RiskLevel = "none" | "low" | "med" | "high";
export function riskFromDscr(dscr: number): RiskLevel {
  if (dscr >= 1.25) return "none";
  if (dscr >= 1.1) return "low";
  if (dscr >= 1.0) return "med";
  return "high";
}
export function RiskFlame({ level, size = 22 }: { level: RiskLevel; size?: number }) {
  if (level === "none") {
    return (
      <span title="Comfortable cushion" style={{ display: "inline-flex", alignItems: "center", color: EMERALD }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={EMERALD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  const cfg = { low: { n: 1, c: LEMON }, med: { n: 2, c: ORANGE }, high: { n: 3, c: RED } }[level];
  const segs = 3;
  const gap = Math.max(1.5, size * 0.1);
  const w = (size - gap * (segs - 1)) / segs;
  return (
    <span role="img" aria-label={`${level} risk`} title={`${level} risk / stress`} style={{ display: "inline-flex", alignItems: "flex-end", gap, height: size }}>
      {Array.from({ length: segs }).map((_, i) => {
        const on = i < cfg.n;
        return (
          <span
            key={i}
            style={{ width: w, height: size * (0.5 + i * 0.25), borderRadius: Math.max(1, w * 0.3), background: on ? cfg.c : "currentColor", opacity: on ? 1 : 0.2 }}
          />
        );
      })}
    </span>
  );
}

export function MotionWorkbench({
  mode = "quiz",
  value = "1.25x",
  label = "Program fit",
  size = 420,
}: {
  mode?: "quiz" | "stress" | "sim";
  value?: string;
  label?: string;
  size?: number;
}) {
  ensureCss();
  const accent = mode === "stress" ? ORANGE : mode === "sim" ? EMERALD : LEMON;
  const secondary = mode === "stress" ? RED : mode === "sim" ? RAIN : EMERALD;
  const title = mode === "stress" ? "Stress path" : mode === "sim" ? "Rate futures" : "Loan fit";
  return (
    <div
      data-gs-motion-artifact="workbench"
      style={{
        width: "100%",
        maxWidth: size,
        margin: "0 auto",
        aspectRatio: "1.08",
        position: "relative",
        borderRadius: 18,
        background: mode === "quiz" ? "#e8e9bf" : MIDNIGHT,
        border: `1px solid ${mode === "quiz" ? "rgba(0,55,56,0.12)" : "rgba(238,239,211,0.14)"}`,
        overflow: "hidden",
        color: mode === "quiz" ? MIDNIGHT : "#eeefd3",
      }}
    >
      <svg viewBox="0 0 420 388" width="100%" height="100%" role="img" aria-label={`${title} animation`}>
        <defs>
          <pattern id={`dots-${mode}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill={mode === "quiz" ? MIDNIGHT : "#eeefd3"} opacity="0.13" />
          </pattern>
        </defs>
        <rect width="420" height="388" fill={`url(#dots-${mode})`} />
        {/* sim — a cone of diverging rate-path futures from "today" */}
        {mode === "sim" && (
          <g>
            {Array.from({ length: 9 }).map((_, i) => {
              const s = (i - 4) / 4;
              const y2 = 196 + s * 150;
              const op = 0.22 + (1 - Math.abs(s)) * 0.5;
              return <path key={i} d={`M58 198 C 168 ${196 + s * 26}, 284 ${196 + s * 92}, 374 ${y2}`} fill="none" stroke={i === 4 ? accent : secondary} strokeOpacity={op} strokeWidth={i === 4 ? 3.6 : 2} strokeLinecap="round" />;
            })}
            <circle cx="58" cy="198" r="7" fill={accent} />
            <text x="58" y="178" textAnchor="middle" fill="#eeefd3" opacity="0.5" fontFamily="JetBrains Mono, monospace" fontSize="11">today</text>
            <text x="378" y="200" textAnchor="end" fill="#eeefd3" opacity="0.4" fontFamily="JetBrains Mono, monospace" fontSize="11">+10yr</text>
          </g>
        )}
        {/* stress — a mini matrix of graded DSCR cells */}
        {mode === "stress" && (
          <g>
            {Array.from({ length: 24 }).map((_, i) => {
              const col = i % 6, row = Math.floor(i / 6);
              const x = 78 + col * 50, y = 118 + row * 50;
              const t = (col + (3 - row)) / 8;
              const c = t > 0.62 ? EMERALD : t > 0.4 ? LEMON : t > 0.2 ? ORANGE : RED;
              return <rect key={i} x={x} y={y} width="42" height="42" rx="8" fill={c} opacity="0.82" />;
            })}
          </g>
        )}
        {/* quiz — five fit bars filling toward a match */}
        {mode === "quiz" && (
          <g>
            {Array.from({ length: 5 }).map((_, i) => (
              <g key={i}>
                <rect x="70" y={130 + i * 34} width="280" height="20" rx="10" fill={MIDNIGHT} opacity="0.07" />
                <rect x="70" y={130 + i * 34} width={110 + i * 38} height="20" rx="10" fill={accent} opacity={0.55 + i * 0.09} />
              </g>
            ))}
          </g>
        )}
        <g>
          <rect x="42" y="314" width="336" height="44" rx="22" fill={mode === "quiz" ? MIDNIGHT : "#eeefd3"} opacity="0.96" />
          <text x="64" y="342" fill={mode === "quiz" ? "#eeefd3" : MIDNIGHT} fontFamily="Outfit, Arial, sans-serif" fontSize="18" fontWeight="700">{label}</text>
          <text x="332" y="342" textAnchor="end" fill={accent} fontFamily="JetBrains Mono, monospace" fontSize="22" fontWeight="800">{value}</text>
        </g>
      </svg>
    </div>
  );
}
