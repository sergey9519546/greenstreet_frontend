import React, { useState } from "react";
import { swatch, font, radius } from "../../theme";

interface ControlTooltipProps {
  title: string;
  description: string;
  impact?: string;
  align?: "left" | "right" | "center";
}

export const ControlTooltip: React.FC<ControlTooltipProps> = ({
  title,
  description,
  impact,
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: "6px" }}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More info"
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "rgba(216, 217, 88, 0.15)",
          border: "1px solid rgba(216, 217, 88, 0.4)",
          color: "#d8d958",
          fontSize: "11px",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
          transition: "all 0.15s ease",
        }}
      >
        ?
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: align === "left" ? "0" : align === "right" ? "auto" : "50%",
            right: align === "right" ? "0" : "auto",
            transform: align === "center" ? "translateX(-50%)" : "none",
            width: "max-content",
            maxWidth: "280px",
            backgroundColor: swatch.midnight,
            border: "1px solid rgba(216, 217, 88, 0.3)",
            borderRadius: radius.md,
            padding: "10px 14px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.6)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontFamily: font.family, fontSize: "12px", fontWeight: 700, color: "#d8d958", marginBottom: "4px" }}>
            {title}
          </div>
          <div style={{ fontFamily: font.family, fontSize: "12px", color: swatch.mint, lineHeight: 1.45 }}>
            {description}
          </div>
          {impact && (
            <div style={{ fontFamily: font.family, fontSize: "11px", color: "#4dbd97", marginTop: "6px", paddingTop: "4px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <strong>Impact:</strong> {impact}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
