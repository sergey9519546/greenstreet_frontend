import React from "react";

// Greenstreet Finance logo — text only, in the site's title font with the heavy,
// tight wordmark treatment used by the Greenboard reference logo. No icon/mark.
//
// Props:
//   variant: "dark"  → midnight ink (use on light/pistachio bg)
//            "light" → pistachio ink (use on dark/footer bg)
//   size: font-size in px

const MIDNIGHT = "#003738";
const PISTACHIO = "#EEEFD3";

export function Logo({
  variant = "dark",
  size = 22,
  onClick,
  href = "/",
}: {
  variant?: "dark" | "light";
  size?: number;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
}) {
  const ink = variant === "light" ? PISTACHIO : MIDNIGHT;
  const [focused, setFocused] = React.useState(false);
  return (
    <a
      href={href}
      onClick={onClick}
      aria-label="Greenstreet Finance"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: "inline-block",
        textDecoration: "none",
        color: ink,
        fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif',
        fontSize: `${size}px`,
        fontWeight: 800,
        fontVariationSettings: '"wght" 800',
        letterSpacing: 0,
        wordSpacing: "0.055em",
        lineHeight: 0.96,
        whiteSpace: "nowrap",
        outline: focused ? `3px solid ${variant === "light" ? "#d8d958" : "#006565"}` : "2px solid transparent",
        outlineOffset: 4,
      }}
    >
      <span aria-hidden="true">
        Greenstreet
        <span style={{ fontWeight: 380, fontVariationSettings: '"wght" 380', letterSpacing: "0.006em" }}> Finance</span>
        <span
          style={{
            display: "inline-block",
            width: "0.2em",
            height: "0.2em",
            marginLeft: "0.11em",
            borderRadius: 999,
            background: "#d8d958",
            transform: "translateY(0.055em)",
            verticalAlign: "baseline",
          }}
        />
      </span>
    </a>
  );
}

export default Logo;
