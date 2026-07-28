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

// Back-compat aliases (names used across existing pages)
export const PISTACHIO = swatch.pistachio;
export const MINT_BG = swatch.mint;
export const MIDNIGHT = swatch.midnight;
export const RAINFOREST = swatch.rainforest;
export const LEMON = swatch.lemon;
export const FADED = swatch.midnightFaded;
export const DARK_TEAL = swatch.darkTeal;

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
  lead: "clamp(17px, 1.35vw, 20px)",
  main: "16px",
  meta: "13px",
  caption: "12px",
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

export const border = {
  light: "rgba(0,55,56,0.12)",
  lightStrong: "rgba(0,55,56,0.24)",
  dark: "rgba(238,239,211,0.14)",
  darkStrong: "rgba(238,239,211,0.28)",
} as const;

export const motion = {
  micro: "180ms",
  surface: "240ms",
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const elevation = {
  none: "none",
  floating: "0 18px 48px rgba(0,45,46,0.14)",
} as const;

// Layout primitives shared by every React-routed surface.  The homepage uses
// open bands and a tight, deliberate mobile rail rather than nested card
// padding.  Keep the rail token here so routed pages and shell chrome land on
// the same x-axis at 390px without changing their desktop composition.
export const space = {
  x1: "4px",
  x2: "8px",
  x3: "12px",
  x4: "16px",
  x5: "20px",
  x6: "24px",
  x8: "32px",
  x10: "40px",
  x12: "48px",
  x16: "64px",
  x24: "96px",
  grid: "clamp(16px, 1.5vw, 24px)",
  gridCompact: "clamp(12px, 1vw, 16px)",
  card: "clamp(20px, 2.2vw, 32px)",
  cardCompact: "clamp(16px, 1.5vw, 24px)",
  sectionCompact: "clamp(48px, 6vw, 80px)",
  sectionStandard: "clamp(64px, 8vw, 112px)",
  sectionMajor: "clamp(80px, 10vw, 144px)",
  section: "clamp(56px, 8vw, 128px)",
  gutter: "clamp(1.5rem, 4vw, 4rem)",
  pageGutter: "clamp(1rem, 4.6vw, 1.25rem)",
  mobileSection: "clamp(3.5rem, 12vw, 5rem)",
  touchTarget: "44px",
} as const;
