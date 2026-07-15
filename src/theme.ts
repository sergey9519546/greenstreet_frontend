// Greenstreet Finance design system — values lifted verbatim from the Webflow
// reference stylesheet (greenboard-00.shared.css :root swatches + type scale).
// Single source of truth. Pages must import from here, never redefine colors.

export const swatch = {
  midnight: "#003738",        // --swatch--midnight-green
  midnightFaded: "#00373880", // --swatch--midnight-green-faded
  darkTeal: "#004041",        // --swatch--dark-teal
  mint: "#e8e9bf",            // --swatch--mint
  pistachio: "#eeefd3",       // --swatch--pistachio
  pistachioFaded: "#eeefd333",
  lemon: "#d8d958",           // --swatch--lemon-lime
  rainforest: "#006565",      // --swatch--rain-forrest
  emerald: "#4dbd97",         // --swatch--emerald
  lightGreen: "#039692",      // --swatch--light-green
  white: "#fff",
} as const;

// The default remains a light, warm-neutral brand surface. Dark is opt-in and
// no palette selection is inferred from a forced dark or purple color bias.
export const defaultThemeName = "light" as const;

// Back-compat aliases (names used across existing pages)
export const PISTACHIO = swatch.pistachio;
export const MINT_BG = swatch.mint;
export const MIDNIGHT = swatch.midnight;
export const RAINFOREST = swatch.rainforest;
export const LEMON = swatch.lemon;
export const FADED = swatch.midnightFaded;
export const DARK_TEAL = swatch.darkTeal;

// Semantic risk ramp — the ONE danger/warn system (see project_risk_color_system).
// Risk states pull from here; never reintroduce the old bright coral #ff6b6b or
// orange #f97316. Data-series colors (sky-blue #7ec8d3 for rates) are separate.
export const risk = {
  positive: swatch.emerald, // #4dbd97 — pass / safe
  caution: swatch.lemon,    // #d8d958 — watch / marginal
  warning: "#e6b84d",       // amber — fragile / sub-threshold
  danger: "#e06363",        // red — break / high-risk
  warningBg: "rgba(230,184,77,0.10)",
  warningBorder: "rgba(230,184,77,0.30)",
  dangerBg: "rgba(224,99,99,0.10)",
  dangerBorder: "rgba(224,99,99,0.30)",
} as const;

export const font = {
  family: '"Outfit Variable", Arial, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// Webflow type scale (rem → clamped px). h1 5.5rem=88, h2 3rem=48, h3 2.5rem=40,
// h4 1.5rem=24, h5 1.25rem=20, large 1.25rem=20, main 1rem=16, small .875rem=14.
export const type = {
  display: "clamp(56px, 9vw, 112px)",
  h1: "clamp(40px, 6.5vw, 88px)",
  h2: "clamp(30px, 4.2vw, 48px)",
  h3: "clamp(26px, 3.2vw, 40px)",
  h4: "24px",
  h5: "20px",
  large: "20px",
  main: "16px",
  small: "14px",
} as const;

// Theme palettes — mirror Webflow u-theme-brand / -dark / -light component vars,
// including the button/card hover-inversion behaviour.
export type ThemeName = "light" | "brand" | "dark";
export const themes = {
  // pistachio page, midnight ink, lemon primary CTA (default site theme)
  light: {
    bg: swatch.pistachio,
    text: swatch.midnight,
    muted: swatch.rainforest,
    card: swatch.mint,
    cardText: swatch.midnight,
    border: swatch.midnightFaded,
    btnBg: swatch.lemon, btnText: swatch.midnight, btnBorder: swatch.midnight,
    btnHoverBg: swatch.midnight, btnHoverText: swatch.mint,
    focusRing: swatch.midnight,
  },
  // mint surface, midnight ink (secondary band)
  brand: {
    bg: swatch.mint,
    text: swatch.midnight,
    muted: swatch.rainforest,
    card: swatch.pistachio,
    cardText: swatch.midnight,
    border: swatch.midnightFaded,
    btnBg: swatch.midnight, btnText: swatch.mint, btnBorder: swatch.midnight,
    btnHoverBg: swatch.lemon, btnHoverText: swatch.midnight,
    focusRing: swatch.midnight,
  },
  // midnight/dark-teal surface, pistachio ink (dark band, e.g. footer/CTA)
  dark: {
    bg: swatch.midnight,
    text: swatch.pistachio,
    muted: "rgba(238,239,211,0.76)",
    card: swatch.darkTeal,
    cardText: swatch.pistachio,
    border: "rgba(238,239,211,0.16)",
    btnBg: swatch.lemon, btnText: swatch.midnight, btnBorder: swatch.lemon,
    btnHoverBg: swatch.pistachio, btnHoverText: swatch.midnight,
    focusRing: swatch.lemon,
  },
} as const;

// Focus indicators are at least 3px and use high-contrast colors paired to the
// adjacent surface. Consumers should select the color from the active theme.
export const focus = {
  width: "3px",
  offset: "3px",
  style: "solid",
  onLight: swatch.midnight,
  onDark: swatch.lemon,
} as const;

// Motion is opt-in and has one explicit reduced-motion path. Components should
// apply `reducedDuration` inside the exported media query.
export const motion = {
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
  reducedDuration: "0.01ms",
  duration: {
    instant: "0ms",
    fast: "160ms",
    standard: "240ms",
    slow: "420ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    enter: "cubic-bezier(0, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

export const radius = { sm: "8px", md: "12px", lg: "16px", pill: "999px" } as const;
export const space = { section: "clamp(56px, 8vw, 128px)", gutter: "clamp(1.5rem, 4vw, 4rem)" } as const;

// ── Design-system scales (Phase 0) — the single vocabulary for spacing, tracking,
// text-opacity, and type. Pages must pull from these instead of inlining one-off
// px/em values (the audit found 74 letter-spacings, 39 font-sizes, 30 gaps in use).

// 4px spacing scale — use for gap / padding / margin.
export const scale = {
  xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px",
  "2xl": "32px", "3xl": "48px", "4xl": "64px", "5xl": "96px",
} as const;

// Letter-spacing tokens — only these five. Display tight, body snug/normal,
// labels wide, eyebrows caps.
export const tracking = {
  tight: "-0.03em",   // display / big mono numbers
  snug: "-0.015em",   // headings, dense UI
  normal: "0em",      // body
  wide: "0.04em",     // small labels
  caps: "0.08em",     // uppercase eyebrows
} as const;

// Text-opacity ladder on the dark (teal) ground — AA-considered. Replaces the
// ad-hoc 0.5/0.55/0.56/0.6/0.78 sprawl. `secondary` is the AA-safe body-dim.
export const onDark = {
  primary: "#eeefd3",
  dim: "rgba(238,239,211,0.85)",
  secondary: "rgba(238,239,211,0.76)",
  tertiary: "rgba(238,239,211,0.66)",  // AA-oriented supporting text
  faint: "rgba(238,239,211,0.4)",      // decorative dividers, never body
} as const;
export const onLight = {
  primary: "#003738",
  secondary: "rgba(0,55,56,0.78)",
  tertiary: "rgba(0,55,56,0.68)",
} as const;

// ── Deal-depth ground ramp ────────────────────────────────────────────────────
// The page-ground tone encodes funnel stage: the cream marketing home and the
// midnight app are two ends of ONE descent, not two separate color worlds.
// Surface and ink are PAIRED (co-indexed) and must always be set together —
// flipping the surface without the ink inverts contrast mid-ramp (dark ink on a
// darkening ground = a window of unreadable text). The app is uniformly dark, so
// today the ramp has two stops; add intermediate stops here if a lighter
// "compare" tier of pages is ever introduced.
export const depth = {
  browse:     { bg: swatch.pistachio, ink: onLight.primary }, // marketing home
  underwrite: { bg: swatch.midnight,  ink: onDark.primary  }, // the React app
} as const;

// Type ramp (px anchors). Body = base; headings clamp between these anchors.
export const size = {
  xs: 11, sm: 13, base: 15, md: 18, lg: 22, xl: 30, "2xl": 44, "3xl": 64,
} as const;

/** Clamp untrusted numeric style input to a finite range. */
export function safeStyleNumber(
  value: number,
  fallback = 0,
  min = -10_000,
  max = 10_000,
): number {
  const safeFallback = Number.isFinite(fallback) ? fallback : 0;
  const safeMin = Number.isFinite(min) ? min : -10_000;
  const safeMax = Number.isFinite(max) ? max : 10_000;
  const lower = Math.min(safeMin, safeMax);
  const upper = Math.max(safeMin, safeMax);
  const candidate = Number.isFinite(value) ? value : safeFallback;
  const clamped = Math.min(upper, Math.max(lower, candidate));
  return Object.is(clamped, -0) ? 0 : clamped;
}

/** Convert numeric layout input to a finite, non-negative pixel value. */
export function safePx(value: number, fallback = 0, max = 10_000): string {
  return `${safeStyleNumber(value, fallback, 0, max)}px`;
}

/** Convert numeric timing input to a finite, non-negative millisecond value. */
export function safeMs(value: number, fallback = 0, max = 60_000): string {
  return `${safeStyleNumber(value, fallback, 0, max)}ms`;
}
