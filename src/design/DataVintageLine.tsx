import React from "react";
import { DATA_VINTAGE_DISCLOSURE } from "../engine/dataVintage";

/**
 * The one quiet line that tells users how old the platform's market data is.
 *
 * Deliberately unstyled beyond a muted tint: it belongs at the bottom of a
 * compliance/disclaimer block, reading as a continuation of the fine print
 * rather than as its own alert. Every tool page that shows rates, lender terms
 * or state rules renders exactly this — one sentence, one source of truth
 * (src/engine/dataVintage.ts), so no two pages can quote different dates.
 *
 * `ground` picks the tint: "light" for the cream/mint sections (dark ink),
 * "dark" for the midnight/rainforest sections (cream ink) — these match the two
 * disclaimer tints already used across the tool pages — or "inherit" when the
 * container already sets a color (e.g. inside ComplianceNote).
 */
const GROUND_COLOR = {
  light: "rgba(0,55,56,0.42)",
  dark: "rgba(238,239,211,0.52)",
  inherit: "inherit",
} as const;

export default function DataVintageLine({
  ground = "light",
  style,
}: {
  ground?: "light" | "dark" | "inherit";
  style?: React.CSSProperties;
}) {
  return (
    <p
      data-testid="data-vintage-line"
      style={{
        color: GROUND_COLOR[ground],
        opacity: ground === "inherit" ? 0.72 : undefined,
        fontSize: 12,
        lineHeight: 1.6,
        margin: "8px 0 0",
        ...style,
      }}
    >
      {DATA_VINTAGE_DISCLOSURE}
    </p>
  );
}
