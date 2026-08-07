import React, { useState, useEffect } from "react";
import { dc } from "../../design/dc";
import { swatch, radius } from "../../theme";

interface CurrencyInputProps {
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  focusedStyle?: React.CSSProperties;
  decimals?: number;
}

export function CurrencyInput({ 
  value, 
  onChange, 
  prefix, 
  suffix, 
  placeholder, 
  className = "", 
  style = {},
  focusedStyle = {},
  decimals = 2
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes (e.g. resets or initial load)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value ? new Intl.NumberFormat("en-US").format(value) : "");
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits and decimal points
    const numericStr = raw.replace(/[^0-9.]/g, "");
    
    if (numericStr === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    const numericVal = parseFloat(numericStr);
    
    // Add commas back immediately for typing feel
    const parts = numericStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = parts.join('.');
    
    setDisplayValue(formatted);

    if (!isNaN(numericVal)) {
      onChange(numericVal);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value) {
      setDisplayValue(new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(value));
    }
  };

  const baseContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    background: swatch.pistachio,
    border: `1.5px solid ${swatch.midnightFaded}`,
    borderRadius: radius.sm,
    padding: "0 12px",
    transition: "border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    ...style,
    ...(isFocused ? {
      borderColor: swatch.lemon,
      outline: `2px solid ${swatch.lemon}`,
      outlineOffset: 1,
      ...focusedStyle
    } : {})
  };

  return (
    <div 
      className={`gs-currency-input ${className}`} 
      style={baseContainerStyle}
      onMouseEnter={(e) => {
        if (!isFocused) {
          e.currentTarget.style.borderColor = "rgba(0,55,56,0.35)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isFocused) {
          e.currentTarget.style.borderColor = baseContainerStyle.border ? (baseContainerStyle.border as string).split(' ')[2] : swatch.midnightFaded;
        }
      }}
    >
      {prefix && (
        <span style={{ fontFamily: dc.mono, color: "rgba(0,55,56,0.4)", marginRight: 4, flexShrink: 0 }}>
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: "none",
          background: "none",
          outline: "none",
          fontFamily: dc.sans,
          color: dc.dark,
          letterSpacing: "-0.02em",
          fontSize: "inherit",
          minWidth: 0,
        }}
      />
      {suffix && (
        <span style={{ fontFamily: dc.mono, color: "rgba(0,55,56,0.4)", marginLeft: 4, flexShrink: 0 }}>
          {suffix}
        </span>
      )}
    </div>
  );
}
