import React, { useId, useState } from "react";
import { dc } from "../../design/dc";
import { swatch, radius, font } from "../../theme";

/**
 * The one numeric field primitive.
 *
 * Every tool page used to hand-roll the same bordered box (flex row, hairline
 * border, `$`/`%` adornment, borderless inner input). This is that box, once —
 * on either ground the site actually has.
 *
 * TWO INPUT MODES, because the pages genuinely need both:
 *   • `step` given   → native `type="number"`. Arrow keys, min/max clamping and
 *     the shared `useWheelScrub` (which only targets `input[type=number]`) all
 *     keep working, and the value renders raw — no thousands separators — which
 *     is exactly what the hand-rolled fields showed.
 *   • `step` omitted → formatted currency box: comma grouping while typing,
 *     `decimals` rounding at rest.
 *
 * DERIVED, NOT MIRRORED. The old version kept the display string in `useState`
 * and refilled it from a `useEffect`, which caused three real defects:
 *   1. blank first paint (state started `""`, the effect ran after paint);
 *   2. a dead `decimals` prop (blur formatted with `decimals`, then the effect
 *      immediately reformatted with the `Intl` default of 3 fraction digits);
 *   3. `0` rendered as blank (`value ? format(value) : ""`), so a `hoa` of 0
 *      showed an empty box and typing `0` made the field clear itself.
 * The display string is now computed during render from `value`. The only piece
 * of state is `draft` — the raw text the user is mid-way through typing — and it
 * exists solely so free typing ("1.", "1200") isn't fought by the formatter.
 * `draft === null` means "not being edited", i.e. show the model value.
 */

/** Which ground the field sits on. */
export type FieldSurface = "light" | "dark" | "underline";

type SurfaceSpec = {
  container: React.CSSProperties;
  input: React.CSSProperties;
  adornment: React.CSSProperties;
  /** Gap between an adornment and the input. */
  gap: number;
  hoverBorder: string;
};

const SURFACE: Record<FieldSurface, SurfaceSpec> = {
  // Pistachio chip — the light marketing shell, and the light-on-dark input
  // chips the calculator cards already use.
  light: {
    container: {
      display: "flex",
      background: swatch.pistachio,
      borderStyle: "solid",
      borderWidth: "1.5px",
      borderColor: swatch.midnightFaded,
      borderRadius: radius.sm,
      padding: "0 12px",
    },
    input: { color: dc.dark, fontFamily: font.family },
    adornment: { fontFamily: font.mono, color: "rgba(0,55,56,0.4)" },
    gap: 4,
    hoverBorder: "rgba(0,55,56,0.35)",
  },
  // Midnight box with a cream hairline — the dark tool bands.
  dark: {
    container: {
      display: "flex",
      background: dc.dark,
      borderStyle: "solid",
      borderWidth: "1.5px",
      borderColor: "rgba(238,239,211,0.18)",
      borderRadius: radius.sm,
      padding: "0 12px",
    },
    input: { color: dc.cream, fontFamily: font.family },
    adornment: { color: "rgba(238,239,211,0.62)" },
    gap: 0,
    hoverBorder: "rgba(238,239,211,0.5)",
  },
  // Inline underline field that sits inside a sentence on a dark ground.
  underline: {
    container: {
      display: "inline-flex",
      background: "none",
      borderStyle: "solid",
      borderWidth: "0 0 1.5px",
      borderColor: "rgba(238,239,211,0.25)",
      borderRadius: 0,
      padding: 0,
    },
    input: { color: dc.cream, fontFamily: font.mono },
    adornment: { color: "rgba(238,239,211,0.62)" },
    gap: 0,
    hoverBorder: "rgba(238,239,211,0.5)",
  },
};

export interface CurrencyInputProps {
  /** Model value. Rendered straight through — never copied into state. */
  value: number;
  onChange: (val: number) => void;
  /**
   * Visible label. When supplied the component renders a `<label htmlFor>` tied
   * to the input's id. Omit it when the page already wraps the field in its own
   * `<label>` — that wrapper is itself a valid accessible name.
   */
  label?: React.ReactNode;
  /** Accessible name for a field with no visible or wrapping label. */
  ariaLabel?: string;
  /** Adornments rendered INSIDE the border (e.g. `$`, `%`). */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  placeholder?: string;
  surface?: FieldSurface;
  /** Present ⇒ native number stepper (see the mode note above). */
  step?: number;
  min?: number;
  max?: number;
  /** Fraction digits for the formatted (non-stepper) display. */
  decimals?: number;
  id?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Class on the bordered container. */
  className?: string;
  /** Extra class on the inner `<input>` (added to `gs-num`). */
  inputClassName?: string;
  /** Bordered-container overrides (width, padding, background). */
  style?: React.CSSProperties;
  /** Inner `<input>` overrides (padding, font-size, font-weight, width). */
  inputStyle?: React.CSSProperties;
  /** Prefix/suffix overrides. */
  adornmentStyle?: React.CSSProperties;
  /** Container style applied only while focused. */
  focusedStyle?: React.CSSProperties;
  /** `<label>` overrides — only used when `label` is supplied. */
  labelStyle?: React.CSSProperties;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  ariaLabel,
  prefix,
  suffix,
  placeholder,
  surface = "light",
  step,
  min,
  max,
  decimals = 2,
  id,
  name,
  disabled,
  readOnly,
  className = "",
  inputClassName = "",
  style = {},
  inputStyle = {},
  adornmentStyle = {},
  focusedStyle = {},
  labelStyle = {},
}: CurrencyInputProps) {
  const generatedId = useId();
  const inputId = id ?? `gs-field-${generatedId}`;
  const spec = SURFACE[surface];
  const stepper = step !== undefined;

  /** Raw text mid-edit; `null` = not being edited, so derive from `value`. */
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  // ── The display value, derived during render ─────────────────────────────
  // No effect, so the first paint already carries the value; `decimals` is the
  // only formatter that ever runs; and 0 formats to "0" like any other number.
  const formatted = Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(value)
    : "";
  const textValue = draft ?? formatted;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericStr = e.target.value.replace(/[^0-9.]/g, "");

    if (numericStr === "") {
      setDraft("");
      onChange(0);
      return;
    }

    // Re-group thousands as they type so the field reads the same mid-edit.
    const parts = numericStr.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setDraft(parts.join("."));

    const numericVal = parseFloat(numericStr);
    if (!Number.isNaN(numericVal)) onChange(numericVal);
  };

  const containerStyle: React.CSSProperties = {
    alignItems: "center",
    boxSizing: "border-box",
    // Longhand border props on purpose: mixing the `border` shorthand with a
    // `borderColor` override makes React warn and drop the property on rerender.
    transition: "border-color .15s",
    ...spec.container,
    ...style,
    ...(hovered && !focused ? { borderColor: spec.hoverBorder } : null),
    ...(focused
      ? {
          // The outline is now handled globally via .gs-field:has(input:focus-visible) in index.css
          borderColor: swatch.lemon,
          ...focusedStyle,
        }
      : null),
  };

  const mergedInputStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    border: "none",
    background: "none",
    // The ring lives on the container so the adornments sit inside it.
    outline: "none",
    letterSpacing: "-0.02em",
    fontSize: "inherit",
    ...spec.input,
    ...inputStyle,
  };

  const adornment: React.CSSProperties = { flexShrink: 0, ...spec.adornment, ...adornmentStyle };

  const field = (
    <div
      className={`gs-field ${className}`.trim()}
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {prefix ? <span style={{ ...adornment, marginRight: spec.gap }}>{prefix}</span> : null}
      <input
        id={inputId}
        name={name}
        aria-label={ariaLabel}
        // `gs-num` (DC_CSS) hides the webkit spinners on number inputs.
        className={`gs-num ${inputClassName}`.trim()}
        {...(stepper
          ? {
              type: "number" as const,
              step,
              min,
              max,
              value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(+e.target.value),
            }
          : {
              type: "text" as const,
              inputMode: "decimal" as const,
              value: textValue,
              onChange: handleTextChange,
            })}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          // Drop the draft so the next render re-derives from `value`, applying
          // `decimals` exactly once. Nothing overwrites it afterwards.
          setDraft(null);
        }}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        style={mergedInputStyle}
      />
      {suffix ? <span style={{ ...adornment, marginLeft: spec.gap }}>{suffix}</span> : null}
    </div>
  );

  if (label === undefined) return field;

  return (
    <div style={{ display: "block" }}>
      <label htmlFor={inputId} style={labelStyle}>
        {label}
      </label>
      {field}
    </div>
  );
}
