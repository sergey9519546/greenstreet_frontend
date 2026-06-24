import React from "react";

// Greenstreet Finance logo — text only, in the site's title font (Outfit, weight 600,
// tight tracking) to match the original greenboard wordmark. No icon/mark.
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
  return (
    <a
      href={href}
      onClick={onClick}
      aria-label="Greenstreet Finance"
      style={{
        textDecoration: "none",
        color: ink,
        fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif',
        fontSize: `${size}px`,
        fontWeight: 600,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      Greenstreet Finance
    </a>
  );
}

export default Logo;
