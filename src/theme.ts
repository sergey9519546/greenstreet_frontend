// Greenstreet Finance design system — values lifted verbatim from the Webflow
// reference stylesheet (greenboard-00.shared.css :root swatches + type scale).
// Single source of truth. Pages must import from here, never redefine colors.

export const swatch = {
  midnight: "#003738",        // --swatch--midnight-green
  midnightFaded: "#00373880", // --swatch--midnight-green-faded
  // Was "#003738". Collapsed onto midnight: it was a third ground sitting 9 RGB
  // points from #003738, used as the card fill across ~32 files, and
  // DESIGN_SOURCE_OF_TRUTH allows two surfaces with "no in-between tint" — it
  // names this exact hex as the single biggest reason app pages stopped looking
  // like the homepage. Collapsed here, at the swatch, because pages reach the
  // value two ways (dc.teal and swatch.darkTeal directly); fixing only dc.teal
  // would have left seven files still painting the old ground.
  // Safe: every consumer uses it as a background — no border, gradient or
  // stroke reads from it — so nothing goes invisible when the two grounds
  // match. Cards separate on their own 1px borders, which is how this flat
  // system is meant to work.
  darkTeal: "#003738",        // --swatch--dark-teal (now == midnight)
  mint: "#e8e9bf",            // --swatch--mint
  pistachio: "#eeefd3",       // --swatch--pistachio
  pistachioFaded: "#eeefd333",
  lemon: "#d8d958",           // --swatch--lemon-lime
  rainforest: "#006565",      // --swatch--rain-forrest
  emerald: "#4dbd97",         // --swatch--emerald
  lightGreen: "#039692",      // --swatch--light-green
  white: "#fff",
} as const;

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
  // Dark-ground variants. On the midnight/dark-teal app surface the base red and
  // lemon sit too close to the ground to read as an alert, so these lightened
  // pairs are the dark-ground equivalents of `danger` / `caution`. Use ONLY on a
  // dark surface — on the cream marketing ground they fail contrast.
  dangerOnDark: "#e88a8a",
  cautionOnDark: "#e6e76b",
  // Light-ground variant. `danger` itself does not clear WCAG AA as TEXT on any
  // of this palette's grounds — measured 2.92:1 on cream #eeefd3, 2.75:1 on mint
  // #e8e9bf, 3.83:1 on dark #003738, against a 4.5:1 requirement for normal
  // text. It reads fine as a FILL or BORDER (dangerBg/dangerBorder below, which
  // carry no contrast duty), which is why the gap went unnoticed.
  //
  // This is `danger` scaled to 74% of its own channels — same hue, no new colour
  // enters the ramp — which measures 4.88:1 on cream and 4.59:1 on mint. Use it
  // wherever red is TEXT on a light ground; use dangerOnDark (5.26:1) on dark.
  dangerOnLight: "#a64949",
  warningBg: "rgba(230,184,77,0.10)",
  warningBorder: "rgba(230,184,77,0.30)",
  dangerBg: "rgba(224,99,99,0.10)",
  dangerBorder: "rgba(224,99,99,0.30)",
  cautionBg: "rgba(216,217,88,0.12)",
  cautionBorder: "rgba(216,217,88,0.34)",
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
    btnBg: swatch.lemon, btnText: swatch.midnight,
    btnHoverBg: swatch.midnight, btnHoverText: swatch.mint,
  },
  // mint surface, midnight ink (secondary band)
  brand: {
    bg: swatch.mint,
    text: swatch.midnight,
    muted: swatch.rainforest,
    card: swatch.pistachio,
    cardText: swatch.midnight,
    border: swatch.midnightFaded,
    btnBg: swatch.midnight, btnText: swatch.mint,
    btnHoverBg: swatch.lemon, btnHoverText: swatch.midnight,
  },
  // midnight/dark-teal surface, pistachio ink (dark band, e.g. footer/CTA)
  dark: {
    bg: swatch.midnight,
    text: swatch.pistachio,
    muted: "#9fb0a8",
    card: swatch.darkTeal,
    cardText: swatch.pistachio,
    border: "rgba(238,239,211,0.16)",
    btnBg: swatch.lemon, btnText: swatch.midnight,
    btnHoverBg: swatch.pistachio, btnHoverText: swatch.midnight,
  },
} as const;

export const radius = { sm: "8px", md: "12px", lg: "16px", pill: "999px" } as const;
// Layout primitives shared by every React-routed surface.  The homepage uses
// open bands and a tight, deliberate mobile rail rather than nested card
// padding.  Keep the rail token here so routed pages and shell chrome land on
// the same x-axis at 390px without changing their desktop composition.
export const space = {
  section: "clamp(56px, 8vw, 128px)",
  gutter: "clamp(1.5rem, 4vw, 4rem)",
  pageGutter: "clamp(1rem, 4.6vw, 1.25rem)",
  mobileSection: "clamp(3.5rem, 12vw, 5rem)",
  touchTarget: "44px",
} as const;

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
  secondary: "rgba(238,239,211,0.62)",
  tertiary: "rgba(238,239,211,0.5)",   // large/secondary text only
  faint: "rgba(238,239,211,0.4)",      // decorative dividers, never body
} as const;
export const onLight = {
  primary: "#003738",
  secondary: "rgba(0,55,56,0.66)",
  tertiary: "rgba(0,55,56,0.5)",
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
