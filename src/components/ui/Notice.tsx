import React from "react";
import { radius, risk, swatch, font } from "../../theme";

/**
 * Notice — the one small, dismissible banner used to surface a failed or degraded
 * user action (a save that didn't land, history that wouldn't load, a lead that
 * wasn't delivered). Deliberately quiet: tinted ground + 1px risk-token border,
 * no shadow, no motion. It is NOT a modal and never blocks the surface it sits on.
 *
 * Color discipline (see theme.ts `risk`):
 *  - ground="dark"  → the app/workspace midnight ground. Ink is the dark-ground
 *    risk ink (`dangerOnDark` / `cautionOnDark`), which is what the base red and
 *    lemon have to become to read as an alert on midnight.
 *  - ground="light" → the cream marketing ground. The base `risk.danger` red is
 *    only ~2.9:1 on pistachio, so it would fail AA as 13px body text. Instead the
 *    copy rides midnight ink and the risk token carries the *signal* — tinted
 *    background, colored border, colored icon. No new hex values are introduced.
 */

export type NoticeTone = "danger" | "warning";
export type NoticeGround = "dark" | "light";

interface ToneStyle {
  bg: string;
  border: string;
  ink: string;
  icon: string;
}

const TONES: Record<NoticeTone, Record<NoticeGround, ToneStyle>> = {
  danger: {
    dark: {
      bg: risk.dangerBg,
      border: risk.dangerBorder,
      ink: risk.dangerOnDark,
      icon: risk.dangerOnDark,
    },
    light: {
      bg: risk.dangerBg,
      border: risk.dangerBorder,
      ink: swatch.midnight,
      icon: risk.danger,
    },
  },
  warning: {
    dark: {
      bg: risk.cautionBg,
      border: risk.cautionBorder,
      ink: risk.cautionOnDark,
      icon: risk.cautionOnDark,
    },
    light: {
      bg: risk.warningBg,
      border: risk.warningBorder,
      ink: swatch.midnight,
      icon: risk.warning,
    },
  },
};

function AlertGlyph({ color }: { color: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export interface NoticeProps {
  /** Severity — `danger` for a failed action, `warning` for a degraded one. */
  tone?: NoticeTone;
  /** Which page ground the notice sits on. Drives ink so contrast never inverts. */
  ground?: NoticeGround;
  /** Short bold headline. */
  title: string;
  /** Explanatory copy / recovery instructions. */
  children?: React.ReactNode;
  /** Renders a "×" that clears the notice. Omit for a notice the user can't dismiss. */
  onDismiss?: () => void;
  /** Optional inline recovery action (e.g. "Try again"). */
  action?: { label: string; onClick: () => void };
  /** Optional second, lower-commitment action (e.g. "Book a call instead"). */
  secondaryAction?: { label: string; onClick: () => void };
  /**
   * `alert` interrupts the screen reader (use when the notice is the direct
   * result of pressing a button); `status` is polite. Defaults to `status`.
   */
  role?: "status" | "alert";
  style?: React.CSSProperties;
}

export default function Notice({
  tone = "danger",
  ground = "dark",
  title,
  children,
  onDismiss,
  action,
  secondaryAction,
  role = "status",
  style,
}: NoticeProps) {
  const t = TONES[tone][ground];

  const actionStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    padding: 0,
    font: "inherit",
    fontSize: 12,
    fontWeight: font.bold,
    color: t.ink,
    textDecoration: "underline",
    cursor: "pointer",
  };

  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: radius.md,
        color: t.ink,
        fontFamily: font.family,
        ...style,
      }}
    >
      <AlertGlyph color={t.icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: font.semibold, lineHeight: 1.4 }}>{title}</p>
        {children ? (
          <div style={{ margin: "3px 0 0", fontSize: 12, lineHeight: 1.5, opacity: 0.9 }}>{children}</div>
        ) : null}
        {(action || secondaryAction) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
            {action && (
              <button type="button" onClick={action.onClick} style={actionStyle}>
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button type="button" onClick={secondaryAction.onClick} style={{ ...actionStyle, fontWeight: font.medium }}>
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            flexShrink: 0,
            background: "transparent",
            border: "none",
            color: t.ink,
            opacity: 0.7,
            cursor: "pointer",
            lineHeight: 1,
            fontSize: 16,
            padding: "0 2px",
            minHeight: 20,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
