import React from "react";
import { dc } from "./dc";
import { radius } from "../theme";

// Compliance / disclaimer callout. A flat bordered note that flags illustrative
// numbers, legal caveats, or sourcing. `color: inherit` so it reads on either a
// light (mint/cream) or dark (midnight) section. Tints use the unified risk ramp
// (dc.risk) for the legal tone; lemon for the softer "verify/source" tones.
type Tone = "verify" | "legal" | "source";

const TONE_LABEL: Record<Tone, string> = {
  verify: "Illustrative — verify current terms",
  legal: "Important",
  source: "Note",
};

export default function ComplianceNote({
  tone = "verify",
  label,
  children,
}: {
  tone?: Tone;
  /** Optional eyebrow override; defaults to a sensible per-tone label. */
  label?: string;
  children: React.ReactNode;
}) {
  const legal = tone === "legal";
  return (
    <div
      style={{
        border: `1px solid ${legal ? dc.risk.dangerBorder : "rgba(216,217,88,0.34)"}`,
        background: legal ? dc.risk.dangerBg : "rgba(216,217,88,0.10)",
        borderRadius: radius.md,
        padding: "14px 16px",
        color: "inherit",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: legal ? dc.risk.danger : dc.rain,
          marginBottom: 6,
        }}
      >
        {label || TONE_LABEL[tone]}
      </div>
      {children}
    </div>
  );
}
