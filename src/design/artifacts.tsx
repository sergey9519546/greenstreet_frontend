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
/* Perpetual "hyperflame" motion (flicker/orbit/bob/redraw/pulse) removed per
   design taste — these render STATIC now; only interaction-driven transitions
   (needle/beam/pan/fill, above) still animate on value change. */
.gsa-flame{transform-origin:50% 100%;}
.gsa-path{stroke-dasharray:none;stroke-dashoffset:0;}
.gsa-pulse-dot{transform-origin:center;}
@media (prefers-reduced-motion: reduce){
  .gsa-needle,.gsa-beam,.gsa-pan,.gsa-fill{transition:none !important;}
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

// ── ClaudeDscrGauge ─────────────────────────────────────────────────────────
// Restores the larger Claude-design dial: conic color bands, glowing needle,
// center readout. GSAP only responds to value / pointer interactions.
export function ClaudeDscrGauge({
  value,
  size = 320,
  min = 0.5,
  max = 1.5,
  label = "DSCR",
  onValueChange,
}: {
  value: number;
  size?: number;
  min?: number;
  max?: number;
  label?: string;
  onValueChange?: (value: number) => void;
}) {
  ensureCss();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const needleRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min);
  const angle = -135 + pct * 270;
  const col = dscrColor(value);
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const needle = needleRef.current;
    if (!needle) return;
    if (reduced) {
      gsap.set(needle, { xPercent: -50, rotation: angle, transformOrigin: "50% 100%" });
      setDisplayValue(value);
      displayRef.current = value;
      return;
    }
    gsap.to(needle, {
      xPercent: -50,
      rotation: angle,
      transformOrigin: "50% 100%",
      duration: 0.74,
      ease: "back.out(1.35)",
      overwrite: true,
    });
    gsap.to(displayRef, {
      current: value,
      duration: 0.48,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => setDisplayValue(displayRef.current),
    });
    if (glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { scale: 0.78, opacity: 0.72 },
        { scale: 1, opacity: 1, duration: 0.36, ease: "power2.out", overwrite: true }
      );
    }
  }, [angle, reduced, value]);

  const setFromPointer = (clientX: number, clientY: number) => {
    if (!onValueChange || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const raw = Math.atan2(clientX - cx, -(clientY - cy)) * 180 / Math.PI;
    const nextAngle = Math.max(-135, Math.min(135, raw));
    const next = min + ((nextAngle + 135) / 270) * (max - min);
    onValueChange(Number(next.toFixed(2)));
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => !reduced && cardRef.current && gsap.to(cardRef.current, { y: -2, duration: 0.22, ease: "power2.out" })}
      onMouseLeave={() => !reduced && cardRef.current && gsap.to(cardRef.current, { y: 0, duration: 0.22, ease: "power2.out" })}
      style={{
        width: "100%",
        maxWidth: size,
        margin: "0 auto",
        position: "relative",
        touchAction: onValueChange ? "none" : "auto",
      }}
    >
      <div
        ref={wrapRef}
        role="slider"
        aria-label={`${label} gauge`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
        tabIndex={onValueChange ? 0 : -1}
        onPointerDown={(e) => {
          if (!onValueChange) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!onValueChange || !(e.buttons & 1)) return;
          setFromPointer(e.clientX, e.clientY);
        }}
        onKeyDown={(e) => {
          if (!onValueChange) return;
          const step = e.shiftKey ? 0.1 : 0.05;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") onValueChange(Math.max(min, Number((value - step).toFixed(2))));
          if (e.key === "ArrowRight" || e.key === "ArrowUp") onValueChange(Math.min(max, Number((value + step).toFixed(2))));
        }}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1",
          cursor: onValueChange ? "grab" : "default",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 56%, rgba(238,239,211,0.08), transparent 42%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 225deg,#e06363 0deg 67.5deg,#e6b84d 67.5deg 135deg,#d8d958 135deg 189deg,#4dbd97 189deg 270deg,rgba(238,239,211,0.07) 270deg 360deg)",
            WebkitMask: "radial-gradient(circle,transparent 0 59%,#000 60% 100%)",
            mask: "radial-gradient(circle,transparent 0 59%,#000 60% 100%)",
          }}
        />
        <div style={{ position: "absolute", inset: "10.5%", borderRadius: "50%", border: "1px dashed rgba(238,239,211,0.16)" }} />
        <div style={{ position: "absolute", inset: "22%", borderRadius: "50%", border: "1px solid rgba(238,239,211,0.08)" }} />
        <div
          ref={needleRef}
          className="gsa-needle"
          style={{
            position: "absolute",
            left: "50%",
            bottom: "50%",
            width: 5,
            height: "39%",
            borderRadius: 5,
            background: "linear-gradient(#eeefd3,#d8d958)",
            boxShadow: "0 10px 22px rgba(0,0,0,0.28)",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "50% 100%",
            zIndex: 3,
          }}
        >
          <div
            ref={glowRef}
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: col,
              boxShadow: `0 0 20px ${col}`,
            }}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: "7%", pointerEvents: "none", zIndex: 5 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>{label}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, color: "#eeefd3", lineHeight: 0.9, textShadow: `0 2px 20px ${col}55` }}>
            {displayValue.toFixed(2)}<span style={{ fontSize: "0.48em" }}>x</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: "8%", bottom: "11%", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "rgba(238,239,211,0.62)" }}>{min.toFixed(2)}</div>
        <div style={{ position: "absolute", right: "8%", bottom: "11%", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "rgba(238,239,211,0.62)" }}>{max.toFixed(2)}</div>
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
