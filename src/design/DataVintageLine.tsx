import React from "react";
import {
  ageInDays,
  DATA_VINTAGE_DISCLOSURE,
  getDataVintage,
  type DataVintageKey,
} from "../engine/dataVintage";

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
  datasetKey,
  ground = "light",
  now = new Date(),
  style,
}: {
  datasetKey?: DataVintageKey;
  ground?: "light" | "dark" | "inherit";
  now?: Date;
  style?: React.CSSProperties;
}) {
  const entry = datasetKey ? getDataVintage(datasetKey) : null;
  const asOfLabel = entry?.asOf
    ? new Date(`${entry.asOf}T00:00:00.000Z`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;
  const isPastCadence = entry
    ? ageInDays(entry, now.toISOString().slice(0, 10)) > entry.refreshCadenceDays
    : false;
  const disclosure = entry
    ? `${entry.label} as of ${asOfLabel ?? "an undocumented date"}. ${
        isPastCadence
          ? `This dataset is past its ${entry.refreshCadenceDays}-day review cadence — `
          : ""
      }verify current rates before relying on it.`
    : DATA_VINTAGE_DISCLOSURE;

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
      {disclosure}
    </p>
  );
}
