import React from "react";
import { dc } from "./dc";
import { radius } from "../theme";

type Tone = "verify" | "legal" | "source";

const TONE_COPY: Record<Tone, string> = {
  verify: "Product-sheet verification required",
  legal: "Legal/compliance review required",
  source: "Source and methodology required",
};

export default function ComplianceNote({
  tone = "verify",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${tone === "legal" ? "rgba(255,107,107,0.42)" : "rgba(216,217,88,0.34)"}`,
        background: tone === "legal" ? "rgba(255,107,107,0.08)" : "rgba(216,217,88,0.10)",
        borderRadius: radius.md,
        padding: "14px 16px",
        color: dc.cream,
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: tone === "legal" ? "#ff8f8f" : dc.lemon,
          marginBottom: 6,
        }}
      >
        {TONE_COPY[tone]}
      </div>
      {children}
    </div>
  );
}
