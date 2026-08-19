import React, { useCallback, useEffect, useRef, useState } from "react";

import { dc } from "../design/dc";
import { radius } from "../theme";
import {
  lookupZip,
  isValidZip,
  ZIP_DATA_SOURCES,
  type ZipFundamentals,
} from "../lib/zipFundamentals";

/**
 * Seeds a tool's hardest-to-guess inputs from real ZIP-level market data.
 *
 * Deliberately does NOT auto-fill. The visitor types a ZIP, sees what the data
 * says with its source and date, and decides whether to apply it. Three reasons
 * that is the right behaviour and not just politeness:
 *
 *   1. Silently overwriting a number someone typed is hostile, and worse here
 *      than usual — they may be modelling a property whose actual rent they
 *      already know.
 *   2. ZORI cross-checks against HUD SAFMR at r = 0.539. It is a defensible
 *      starting point, not this property's rent, and the UI has to say so.
 *   3. Rent/price are as-of 2026-05 and insurance as-of 2022. A stamped,
 *      user-accepted value ages honestly; a silent one does not.
 */

export interface ZipSeedValues {
  /** Monthly rent, Zillow ZORI. */
  rent?: number;
  /** Monthly insurance — converted from the annual FIO premium for PITIA. */
  insuranceMonthly?: number;
  /** Median list price, realtor.com. */
  price?: number;
}

interface Props {
  onApply: (values: ZipSeedValues) => void;
  /** Pre-fills the field, e.g. from a ZIP already present in the deal state. */
  initialZip?: string;
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function ZipSeedPanel({ onApply, initialZip = "" }: Props) {
  const [zip, setZip] = useState(initialZip);
  const [data, setData] = useState<ZipFundamentals | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "missing">("idle");
  // Guards against an earlier slow shard resolving after a later one.
  const requestRef = useRef(0);

  useEffect(() => {
    const trimmed = zip.trim();
    if (!isValidZip(trimmed)) {
      setData(null);
      setState("idle");
      return;
    }

    const request = ++requestRef.current;
    setState("loading");
    void lookupZip(trimmed).then((result) => {
      if (request !== requestRef.current) return;
      setData(result);
      setState(result ? "idle" : "missing");
    });
  }, [zip]);

  const apply = useCallback(() => {
    if (!data) return;
    onApply({
      rent: data.rent,
      // FIO publishes an annual premium; PITIA takes a monthly figure.
      insuranceMonthly: data.insuranceAnnual ? Math.round(data.insuranceAnnual / 12) : undefined,
      price: data.listPrice,
    });
  }, [data, onApply]);

  const hasSeed = Boolean(
    data && (data.rent || data.insuranceAnnual || data.listPrice || data.floodClaims || data.safmr2Br),
  );

  return (
    <div
      style={{
        border: `1px solid ${dc.faded}`,
        borderRadius: radius.sm,
        padding: 14,
        display: "grid",
        gap: 10,
      }}
    >
      <label style={{ display: "grid", gap: 6 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: dc.lemon,
          }}
        >
          Seed from market data
        </span>
        <span style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", lineHeight: 1.45 }}>
          Enter a ZIP to see real rent and insurance for that market. Nothing changes until
          you apply it, and every field stays editable.
        </span>
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
          inputMode="numeric"
          placeholder="ZIP code"
          aria-label="ZIP code to seed market data from"
          style={{
            background: "transparent",
            border: `1px solid ${dc.faded}`,
            borderRadius: radius.sm,
            color: dc.cream,
            font: "inherit",
            fontSize: 15,
            padding: "9px 11px",
          }}
        />
      </label>

      {/* Announced, because the result of typing a ZIP appears without any
          further interaction and is otherwise silent to a screen reader. */}
      <div aria-live="polite">
        {state === "loading" && (
          <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)" }}>Looking up {zip}…</div>
        )}

        {state === "missing" && (
          <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", lineHeight: 1.45 }}>
            No market data for {zip}. Coverage is 29,166 ZIPs — enter the numbers yourself.
          </div>
        )}

        {hasSeed && data && (
          <div style={{ display: "grid", gap: 8 }}>
            {(data.city || data.state) && (
              <div style={{ fontSize: 13, fontWeight: 600, color: dc.cream }}>
                {[data.city, data.state].filter(Boolean).join(", ")}
              </div>
            )}

            {data.rent !== undefined && (
              <Row label="Market rent" value={`${money(data.rent)}/mo`} source={ZIP_DATA_SOURCES.rent} />
            )}
            {data.insuranceAnnual !== undefined && (
              <Row
                label="Insurance"
                value={`${money(data.insuranceAnnual / 12)}/mo`}
                source={ZIP_DATA_SOURCES.insurance}
              />
            )}
            {data.listPrice !== undefined && (
              <Row label="Median list price" value={money(data.listPrice)} source={ZIP_DATA_SOURCES.listing} />
            )}
            {data.activeListings !== undefined && (
              <Row label="Active listings" value={`${data.activeListings.toLocaleString("en-US")}`} source={ZIP_DATA_SOURCES.listing} />
            )}
            {data.safmr2Br !== undefined && data.rent !== undefined && (
              <Row
                label="SAFMR 2BR cross-check"
                value={`${money(data.safmr2Br)}/mo`}
                source={ZIP_DATA_SOURCES.safmr}
              />
            )}
            {data.floodClaims !== undefined && (
              <Row
                label="Flood claims"
                value={`${data.floodClaims.toLocaleString("en-US")} since 1984`}
                source={ZIP_DATA_SOURCES.flood}
              />
            )}

            <button
              type="button"
              onClick={apply}
              style={{
                background: dc.lemon,
                border: "none",
                borderRadius: radius.sm,
                color: dc.dark,
                cursor: "pointer",
                font: "inherit",
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 14px",
              }}
            >
              Apply to this scenario
            </button>

            <div style={{ fontSize: 11, color: "rgba(238,239,211,0.5)", lineHeight: 1.45 }}>
              A market-wide index, not an appraisal of one property. Check it against the
              actual lease before relying on it.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <span style={{ fontSize: 12, color: "rgba(238,239,211,0.72)" }}>{label}</span>
      <span style={{ textAlign: "right" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: dc.cream }}>{value}</span>
        {/* The citation travels with the number, always. */}
        <span style={{ display: "block", fontSize: 10, color: "rgba(238,239,211,0.5)" }}>{source}</span>
      </span>
    </div>
  );
}
