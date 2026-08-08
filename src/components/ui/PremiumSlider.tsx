import React from "react";
import { dc } from "../../design/dc";

interface PremiumSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  accentColor?: string;
  trackColor?: string;
  /** Accessible name. Range inputs with no label announce as a bare number. */
  ariaLabel?: string;
  /** Spoken value, e.g. "40 percent" or "$170,000". Falls back to the number. */
  ariaValueText?: string;
}

/**
 * The fill, accent and track are passed as CSS CUSTOM PROPERTIES on the input
 * itself, not baked into the injected stylesheet.
 *
 * Previously each instance emitted its own `<style>` block containing
 * `.gs-premium-slider { background: linear-gradient(..., ${percent}%, ...) }`.
 * The class is global and the rules have equal specificity, so the LAST slider
 * mounted on the page won the cascade and every slider rendered that one's fill
 * percentage. On the DSCR calculator the down-payment track showed the interest
 * rate's position — dragging one slider visibly moved the other's fill, and
 * neither matched its own thumb.
 *
 * Custom properties are per-element and inherit into ::-webkit-slider-thumb, so
 * one shared stylesheet now drives any number of independent sliders.
 */
export function PremiumSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  accentColor = dc.emerald,
  trackColor = "rgba(0,55,56,0.1)",
  ariaLabel,
  ariaValueText,
}: PremiumSliderProps) {
  // Guard against division by zero
  const percent = max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;

  return (
    <div style={{ position: "relative", width: "100%", height: 32, display: "flex", alignItems: "center" }}>
      <style>{`
        .gs-premium-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          background: linear-gradient(
            to right,
            var(--gs-slider-accent) var(--gs-slider-pct),
            var(--gs-slider-track) var(--gs-slider-pct)
          );
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .gs-premium-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${dc.cream};
          border: 2px solid var(--gs-slider-accent);
          cursor: pointer;
          transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gs-premium-slider::-webkit-slider-thumb:hover { transform: scale(1.1); }
        .gs-premium-slider::-webkit-slider-thumb:active { transform: scale(0.95); }
        .gs-premium-slider:focus-visible::-webkit-slider-thumb {
          outline: 2px solid ${dc.lemon};
          outline-offset: 2px;
        }
        .gs-premium-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${dc.cream};
          border: 2px solid var(--gs-slider-accent);
          cursor: pointer;
          transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gs-premium-slider:focus-visible::-moz-range-thumb {
          outline: 2px solid ${dc.lemon};
          outline-offset: 2px;
        }
      `}</style>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="gs-premium-slider"
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
        style={
          {
            "--gs-slider-pct": `${percent}%`,
            "--gs-slider-accent": accentColor,
            "--gs-slider-track": trackColor,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
