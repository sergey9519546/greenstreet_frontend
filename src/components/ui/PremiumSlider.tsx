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
}

export function PremiumSlider({ 
  value, 
  min, 
  max, 
  step = 1, 
  onChange,
  accentColor = dc.emerald,
  trackColor = "rgba(0,55,56,0.1)"
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
          background: linear-gradient(to right, ${accentColor} ${percent}%, ${trackColor} ${percent}%);
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
          border: 2px solid ${accentColor};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gs-premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .gs-premium-slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        .gs-premium-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${dc.cream};
          border: 2px solid ${accentColor};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
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
      />
    </div>
  );
}
