import React, { useEffect, useRef, useState } from "react";
import { swatch, themes, ThemeName, radius } from "../theme";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  themeName?: ThemeName;
  hoverScale?: boolean;
}

export function AnimatedCard({
  children,
  themeName = "light",
  hoverScale = true,
  style,
  ...props
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = themes[themeName];

  const { contextSafe } = useGSAP({ scope: cardRef });

  const onEnter = contextSafe(() => {
    if (!hoverScale || !cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -4,
      scale: 1.01,
      borderColor: swatch.lemon,
      duration: 0.3,
      ease: "power2.out",
    });
  });

  const onLeave = contextSafe(() => {
    if (!hoverScale || !cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      borderColor: theme.border,
      duration: 0.3,
      ease: "power2.out",
    });
  });

  return (
    <div
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: theme.card,
        color: theme.cardText,
        border: `1.5px solid ${theme.border}`,
        borderRadius: radius.md,
        padding: "24px",
        boxShadow: "none",
        transition: "border-color 0.25s, background-color 0.25s",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  themeName?: ThemeName;
  variant?: "primary" | "secondary";
  showArrow?: boolean;
}

export function AnimatedButton({
  children,
  themeName = "light",
  variant = "primary",
  showArrow = true,
  style,
  ...props
}: AnimatedButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const theme = themes[themeName];

  // Colors based on variant
  const isPrimary = variant === "primary";
  const defaultBg = isPrimary ? theme.btnBg : "transparent";
  const defaultText = isPrimary ? theme.btnText : theme.text;
  const defaultBorder = isPrimary ? theme.btnBg : theme.border;

  const hoverBg = isPrimary ? theme.btnHoverBg : theme.text;
  const hoverText = isPrimary ? theme.btnHoverText : theme.bg;
  const hoverBorder = isPrimary ? theme.btnHoverBg : theme.text;

  const { contextSafe } = useGSAP({ scope: btnRef });

  const onEnter = contextSafe(() => {
    const btn = btnRef.current;
    const arrow = arrowRef.current;
    if (!btn) return;
    
    gsap.to(btn, {
      backgroundColor: hoverBg,
      color: hoverText,
      borderColor: hoverBorder,
      scale: 1.02,
      duration: 0.25,
      ease: "power2.out",
    });
    if (arrow) {
      gsap.to(arrow, {
        x: 4,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  });

  const onLeave = contextSafe(() => {
    const btn = btnRef.current;
    const arrow = arrowRef.current;
    if (!btn) return;

    gsap.to(btn, {
      backgroundColor: defaultBg,
      color: defaultText,
      borderColor: defaultBorder,
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
    });
    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  });

  return (
    <button
      ref={btnRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px 24px",
        backgroundColor: defaultBg,
        color: defaultText,
        border: `1.5px solid ${defaultBorder}`,
        borderRadius: radius.sm,
        fontWeight: 700,
        fontSize: "15px",
        fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif',
        cursor: "pointer",
        outline: "none",
        transition: "box-shadow 0.2s",
        ...style,
      }}
      {...props}
    >
      {children}
      {showArrow && (
        <svg
          ref={arrowRef}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transition: "transform 0.2s" }}
        >
          <path
            d="M8 3L7.3 3.7L11.1 7.5H2V8.5H11.1L7.3 12.3L8 13L13 8L8 3Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
  style?: React.CSSProperties;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 0.5,
  format = (val) => val.toFixed(2),
  style,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const valueRef = useRef({ val: value });

  useGSAP(() => {
    gsap.to(valueRef.current, {
      val: value,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayValue(valueRef.current.val);
      },
    });
  }, [value, duration]);

  return <span style={style} className={className}>{format(displayValue)}</span>;
}

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefixSymbol?: string;
  suffixSymbol?: string;
}

export function PremiumInput({
  label,
  prefixSymbol,
  suffixSymbol,
  style,
  onFocus,
  onBlur,
  ...props
}: PremiumInputProps) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };

  const hasValue = props.value !== undefined && props.value !== "" && props.value !== null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        marginBottom: "20px",
        fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif',
        ...style,
      }}
    >
      <label
        style={{
          position: "absolute",
          left: prefixSymbol ? "24px" : "14px",
          top: focused || hasValue ? "6px" : "50%",
          transform: focused || hasValue ? "translateY(0)" : "translateY(-50%)",
          fontSize: focused || hasValue ? "10px" : "14px",
          fontWeight: focused || hasValue ? 700 : 400,
          color: focused ? swatch.rainforest : "rgba(0, 55, 56, 0.6)",
          textTransform: focused || hasValue ? "uppercase" : "none",
          letterSpacing: focused || hasValue ? "0.08em" : "normal",
          transition: "all 0.2s ease-out",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#ffffff",
          border: `1.5px solid ${focused ? swatch.rainforest : `${swatch.midnight}30`}`,
          boxShadow: focused ? `0 0 0 2px ${swatch.mint}` : "none",
          borderRadius: radius.sm,
          padding: prefixSymbol || suffixSymbol ? "0 12px" : "0",
          transition: "all 0.2s ease",
          height: "46px",
        }}
      >
        {prefixSymbol && (
          <span style={{ color: "rgba(0, 55, 56, 0.5)", fontWeight: 600, marginRight: "4px", fontSize: "14px", marginTop: "12px" }}>
            {prefixSymbol}
          </span>
        )}
        <input
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            padding: focused || hasValue ? "16px 14px 4px" : "10px 14px",
            fontSize: "15px",
            color: swatch.midnight,
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
          }}
          {...props}
        />
        {suffixSymbol && (
          <span style={{ color: "rgba(0, 55, 56, 0.5)", fontWeight: 600, marginLeft: "4px", fontSize: "14px", marginTop: "12px" }}>
            {suffixSymbol}
          </span>
        )}
      </div>
    </div>
  );
}

interface PremiumSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  ticks?: number[];
}

export function PremiumSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (val) => String(val),
  ticks,
}: PremiumSliderProps) {
  return (
    <div style={{ marginBottom: "24px", fontFamily: '"Outfit Variable", Outfit, Arial, sans-serif' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: swatch.rainforest }}>
          {label}
        </span>
        <span style={{ fontSize: "15px", fontWeight: 700, color: swatch.midnight }}>
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: swatch.rainforest,
          height: "6px",
          borderRadius: radius.sm,
          outline: "none",
          cursor: "pointer",
        }}
      />
      {ticks && (
        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(0, 55, 56, 0.4)", fontSize: "11px", marginTop: "4px" }}>
          {ticks.map((t) => (
            <span key={t} style={{ cursor: "pointer", fontWeight: value === t ? 700 : 400 }} onClick={() => onChange(t)}>
              {t}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
