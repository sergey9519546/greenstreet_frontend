// @ts-nocheck
// Greenstreet design kit — Webflow-faithful primitives (clean React, no Webflow JS).
// Mirrors u-theme-brand/-dark/-light, the type scale, themed buttons/cards.
import React from "react";
import { themes, type, font, radius, space, swatch } from "../theme";

const ThemeCtx = React.createContext(themes.light);
export const useTheme = () => React.useContext(ThemeCtx);

// Themed full-bleed band with centered container + section spacing.
export function Section({ theme = "light", space: pad = "section", first = false, children, style, id }) {
  const t = themes[theme] || themes.light;
  const py = pad === "none" ? 0 : pad === "tight" ? "clamp(40px,5vw,72px)" : space.section;
  return (
    <ThemeCtx.Provider value={t}>
      <section id={id} style={{ background: t.bg, color: t.text, padding: `${first ? 0 : py} ${space.gutter}`, paddingTop: first ? "clamp(32px,4vw,56px)" : py, ...style }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>{children}</div>
      </section>
    </ThemeCtx.Provider>
  );
}

const sizeMap = { display: type.display, h1: type.h1, h2: type.h2, h3: type.h3, h4: type.h4, h5: type.h5 };
export function Heading({ as = "h2", size = "h2", children, style }) {
  const t = useTheme();
  const Tag = as;
  return (
    <Tag style={{ fontFamily: font.family, fontSize: sizeMap[size] || type.h2, fontWeight: font.bold, lineHeight: 1.05, letterSpacing: "-0.03em", color: t.text, margin: 0, ...style }}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, style }) {
  const t = useTheme();
  return <div style={{ fontFamily: font.family, fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: t.muted, marginBottom: "14px", ...style }}>{children}</div>;
}

export function Body({ children, size = "main", muted = false, style }) {
  const t = useTheme();
  const fs = size === "large" ? type.large : size === "small" ? type.small : type.main;
  return <p style={{ fontFamily: font.family, fontSize: fs, lineHeight: 1.65, color: muted ? t.muted : t.text, margin: 0, ...style }}>{children}</p>;
}

export function Card({ theme, hover = false, children, style, onClick }) {
  const parent = useTheme();
  const t = theme ? themes[theme] : parent;
  const [h, setH] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: t.card, color: t.cardText,
        border: `1px solid ${h ? swatch.rainforest : t.border}`,
        borderRadius: radius.md, padding: "clamp(20px,2.4vw,30px)",
        transition: "border-color .18s ease, transform .18s ease, box-shadow .18s ease",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h ? "0 14px 40px rgba(0,0,0,0.12)" : "none",
        cursor: onClick ? "pointer" : "default", ...style,
      }}
    >{children}</div>
  );
}

// Primary button with Webflow hover-inversion.
export function Button({ href, onClick, variant = "primary", children, style }) {
  const t = useTheme();
  const [h, setH] = React.useState(false);
  const isPrimary = variant === "primary";
  const base = isPrimary
    ? { bg: t.btnBg, fg: t.btnText, hbg: t.btnHoverBg, hfg: t.btnHoverText, bd: t.btnBg }
    : { bg: "transparent", fg: t.text, hbg: t.text, hfg: t.bg, bd: t.text };
  return (
    <a
      href={href || "#"}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        fontFamily: font.family, fontSize: "15px", fontWeight: 700, textDecoration: "none",
        padding: "14px 26px", borderRadius: radius.sm,
        background: h ? base.hbg : base.bg, color: h ? base.hfg : base.fg,
        border: `1.5px solid ${h ? (isPrimary ? base.hbg : base.hfg === t.bg ? base.bg === "transparent" ? t.text : base.hbg : base.hbg) : base.bd}`,
        transition: "background-color .15s, color .15s, border-color .15s", cursor: "pointer", ...style,
      }}
    >{children}</a>
  );
}

export function Pill({ children, tone = "muted", style }) {
  const t = useTheme();
  const map = {
    muted: { bg: swatch.mint, fg: swatch.midnight },
    lemon: { bg: swatch.lemon, fg: swatch.midnight },
    dark: { bg: swatch.midnight, fg: swatch.pistachio },
  };
  const c = map[tone] || map.muted;
  return <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: radius.pill, background: c.bg, color: c.fg, fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em", ...style }}>{children}</span>;
}

export function Grid({ min = "320px", gap = "20px", children, style }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))`, gap, ...style }}>{children}</div>;
}
