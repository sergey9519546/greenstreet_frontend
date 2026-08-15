/**
 * QualifyModal — 5-step value-first micro-commitment lead funnel
 * Step 1: Live DSCR calculator (hook)
 * Step 2: Deal details (purpose / state / FICO)
 * Step 3: Personalized result (the value drop)
 * Step 4: Contact capture
 * Step 5: Confirmation
 *
 * PRESERVED: DSCR calc formula and trigger pill + window.openQualify.
 *
 * ADDED: step-enter animation, progress bar transition, result reveal (count-up),
 * submit loading spinner, shake-on-error, DSCR color transition, pill hover states,
 * focus rings, trust signals, mobile-responsive padding.
 */
import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { swatch, font, radius } from "../theme";
import Notice from "./ui/Notice";
import { captureException } from "../monitoring/sentry";
import { track, AnalyticsEvent } from "../lib/analytics";
import { qualify, fmtUsd, fmtRateRange, PPP_STATE_LAWS } from "../engine";
import type {
  QuickDscrTier,
  QualifyPropertyType as PropertyType,
  BorrowerType,
  EngineFicoBand,
  QualifyInput,
} from "../engine";
import {
  sanitizeQualificationScenarioDraft,
  type QualificationScenarioDraft,
} from "../conversion/qualificationScenario";

// ─── Types ────────────────────────────────────────────────────────────────────
type Purpose = "purchase" | "rate-term" | "cash-out";
type FicoBand = "under-680" | "680-719" | "720-759" | "760-plus";
type Role = "investor" | "broker" | "foreign" | "str" | "vacation";
type Experience = "0" | "1-3" | "4-9" | "10-plus";
type Timeline = "exploring" | "under-30" | "30-90" | "refi-soon";

/** A failed submit, split into the copy the user reads and whether retrying can help. */
interface SubmissionError {
  title: string;
  message: string;
  canRetry: boolean;
}

interface StepOneData {
  propertyValue: number;
  loanAmount: number;
  rent: number;
  rate: number;
  propertyType: PropertyType | null;
  investmentConfirmed: boolean;
}
interface StepTwoData {
  purpose: Purpose | null;
  state: string;
  ficoBand: FicoBand | null;
  borrowerType: BorrowerType | null;
  experience: Experience | null;
}
interface StepFourData {
  name: string;
  email: string;
  phone: string;
  role: Role | null;
  timeline: Timeline | null;
  contactConsent: boolean;
  website: string;
}

function freshStepOne(): StepOneData {
  return {
    propertyValue: 425000,
    loanAmount: 318750,
    rent: 3000,
    rate: 7,
    propertyType: null,
    investmentConfirmed: true,
  };
}

function freshStepTwo(): StepTwoData {
  return {
    purpose: null,
    state: "",
    ficoBand: null,
    borrowerType: null,
    experience: null,
  };
}

function freshStepFour(): StepFourData {
  return {
    name: "",
    email: "",
    phone: "",
    role: null,
    timeline: null,
    contactConsent: false,
    website: "",
  };
}

function createSubmissionId(): string {
  return globalThis.crypto.randomUUID();
}

// Modal credit bands → engine credit bands (engine separates <660; the modal's
// lowest band is "under-680", mapped to the entry tier).
const FICO_TO_ENGINE: Record<FicoBand, EngineFicoBand> = {
  "under-680": "660-679",
  "680-719": "680-719",
  "720-759": "720-759",
  "760-plus": "760-plus",
};

// The property-state dropdown stores full state names (e.g. "Florida"), but
// PPP_STATE_LAWS (statePppLaws.ts) is keyed by 2-letter postal codes (e.g.
// "FL") — convert before lookup so PPP tier detection actually matches.
const STATE_NAME_TO_CODE: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY",
};

// PPP tier for qualify(): 0 = clear, 2 = confirm-by-hand, 3 = restricted.
// Derived from the engine's authoritative state-law data (statePppLaws.ts),
// which qualify() expects via stateTier — it never parses the state string.
function tierForState(state: string): number {
  const code = STATE_NAME_TO_CODE[state] ?? state;
  const law = PPP_STATE_LAWS[code?.toUpperCase?.() ?? ""];
  if (!law) return 2;
  switch (law.status) {
    case "PROHIBITED":
    case "PRACTICALLY_PROHIBITED":
      return 3;
    case "ENTITY_ONLY":
    case "CONDITIONAL":
    case "AMBIGUOUS":
    case "ARM_RESTRICTED":
      return 2;
    default:
      return 0;
  }
}

// Build a QualifyInput from modal state (used by the result screen + payload).
function buildQualifyInput(s1: StepOneData, s2: StepTwoData): QualifyInput {
  return {
    propertyType: s1.propertyType ?? "sfr",
    purpose: s2.purpose ?? "purchase",
    state: s2.state,
    stateTier: tierForState(s2.state),
    value: s1.propertyValue,
    loanAmount: s1.loanAmount > 0 ? s1.loanAmount : s1.propertyValue * 0.75,
    rent: s1.rent,
    annualRatePct: s1.rate,
    ficoBand: s2.ficoBand ? FICO_TO_ENGINE[s2.ficoBand] : "680-719",
    borrowerType: s2.borrowerType ?? undefined,
    investmentConfirmed: s1.investmentConfirmed,
  };
}

// ─── Engine-backed DSCR helpers ───────────────────────────────────────────────
// The modal delegates all result math to qualify(), using the visitor's actual
// loan amount and entered rate. One calculation now drives the live preview,
// result formula, levers, rate range, and persisted audit payload.

// Exported (with dscrVerdict below) for tests: QualifyModal.test.tsx asserts the
// tier the funnel SHOWS matches the DSCR it shows, instead of pinning copy.
export function classifyQuickDscr(dscr: number): {
  tier: QuickDscrTier;
  label: string;
} {
  if (dscr >= 1.25) {
    return {
      tier: "LIKELY_QUALIFIES",
      label: "Stronger estimated payment cushion",
    };
  }
  if (dscr >= 1.0) {
    return {
      tier: "BORDERLINE",
      label: "Estimated rent covers the payment",
    };
  }
  if (dscr >= 0.85) {
    return {
      tier: "SPECIALIST_REQUIRED",
      label: "Estimated rent is below the payment",
    };
  }
  return {
    tier: "UNLIKELY",
    label: "Material estimated payment shortfall",
  };
}

function dscrColor(dscr: number): string {
  if (dscr >= 1.25) return swatch.emerald;
  if (dscr >= 1.0) return swatch.rainforest;
  if (dscr >= 0.85) return swatch.lemon;
  return "#c25b4e";
}

export function dscrVerdict(tier: QuickDscrTier, purpose?: Purpose | null): {
  tier: string;
  headline: string;
  detail: string;
  purposeNote: string;
  nextStep: string;
  color: string;
} {
  const purposeContext: Record<Purpose, { strong: string; borderline: string; low: string }> = {
    purchase: {
      strong: "For this purchase scenario, the estimated rent leaves a stronger payment-coverage cushion.",
      borderline: "For this purchase scenario, the estimated rent is close to the full monthly payment.",
      low: "For this purchase scenario, reducing the loan amount or payment would improve the estimate.",
    },
    "rate-term": {
      strong: "For this refinance scenario, the estimated rent leaves a stronger payment-coverage cushion.",
      borderline: "For this refinance scenario, the estimated rent is close to the full monthly payment.",
      low: "At this level, a lower balance or payment would improve the refinance estimate.",
    },
    "cash-out": {
      strong: "For this cash-out scenario, the estimated rent leaves a stronger payment-coverage cushion.",
      borderline: "For this cash-out scenario, the estimated rent is close to the full monthly payment.",
      low: "Reducing the cash-out amount or loan-to-value would improve the estimate.",
    },
  };

  const ctx = purpose ? purposeContext[purpose] : null;

  switch (tier) {
    case "LIKELY_QUALIFIES":
      return {
        tier: "Strong",
        headline: "This estimate shows a stronger cushion",
        detail: "The estimated rent clears the illustrative 1.25x coverage marker used in this tool.",
        purposeNote: ctx?.strong ?? "",
        nextStep: "You can store this scenario with the configured intake for later review. A submission does not confirm staff notification or follow-up. Product availability, eligibility, timing, and terms still require confirmation by the responsible provider.",
        color: swatch.emerald,
      };
    case "BORDERLINE":
      return {
        tier: "At 1.0x+",
        headline: "This estimate reaches payment coverage",
        detail: "The estimated rent is at or above the full monthly payment in this scenario. That is not an approval or product-eligibility decision.",
        purposeNote: ctx?.borderline ?? "",
        nextStep: "You can store these assumptions with the configured intake for later review. A submission does not confirm staff notification or follow-up. Any program, rate, approval, or closing path must be confirmed by the responsible provider.",
        color: swatch.rainforest,
      };
    case "SPECIALIST_REQUIRED":
      return {
        tier: "Borderline",
        headline: "This estimate is below full payment coverage",
        detail: "The estimated rent is below the full monthly payment. A different structure may change the arithmetic, but this tool does not determine product eligibility.",
        purposeNote: ctx?.low ?? "Adjust the loan amount, rate, or rent assumptions to see how the estimate changes.",
        nextStep: "You can store these assumptions with the configured intake for later review. A submission does not confirm staff notification or follow-up. Do not treat this result as evidence that a sub-1.0 product is available.",
        color: "#b8a820",
      };
    case "UNLIKELY":
    default:
      return {
        tier: "Below Threshold",
        headline: "This deal needs restructuring",
        detail: "The estimated rent is materially below the full monthly payment. Lowering the payment or increasing verified rent would change the arithmetic.",
        purposeNote: ctx?.low ?? "Adjust the loan amount, rate, or rent assumptions to see how the estimate changes.",
        nextStep: "You can store these inputs with the configured intake for later review. A submission does not confirm staff notification or follow-up. This result is not a decline or a statement that financing is available.",
        color: "#c25b4e",
      };
  }
}

// ─── US States ────────────────────────────────────────────────────────────────
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface QualifyModalProps {
  open: boolean;
  onClose: () => void;
  initialDraft?: QualificationScenarioDraft | null;
}

// ─── Animation CSS injected once ─────────────────────────────────────────────
const ANIMATION_CSS = `
  @keyframes qm-step-enter {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes qm-scale-in {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes qm-shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-5px); }
    40%      { transform: translateX(5px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
  @keyframes qm-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes qm-checkmark-pop {
    0%   { transform: scale(0.4); opacity: 0; }
    70%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
  }

  .qm-step-enter {
    animation: qm-step-enter 220ms cubic-bezier(0.25,0.46,0.45,0.94) both;
  }
  .qm-result-reveal {
    animation: qm-scale-in 380ms cubic-bezier(0.34,1.56,0.64,1) both;
    animation-delay: 60ms;
  }
  .qm-checkmark-pop {
    animation: qm-checkmark-pop 420ms cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .qm-shake {
    animation: qm-shake 200ms ease both;
  }
  .qm-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(0,55,56,0.25);
    border-top-color: ${swatch.midnight};
    border-radius: 50%;
    animation: qm-spin 600ms linear infinite;
    vertical-align: middle;
    margin-right: 8px;
    flex-shrink: 0;
  }

  /* Pill hover states — unselected pill gets a tint on hover */
  .qm-pill:not(.qm-pill-active):hover {
    background: ${swatch.mint} !important;
    border-color: ${swatch.rainforest} !important;
  }
  .qm-pill-active:hover {
    opacity: 0.88;
  }

  /* Primary button hover/active */
  .qm-btn-primary:not(:disabled):hover {
    filter: brightness(1.06);
  }
  .qm-btn-primary:not(:disabled):active {
    transform: translateY(1px);
  }

  /* Secondary button hover */
  .qm-btn-secondary:hover {
    background: ${swatch.mint} !important;
  }

  /* Input focus ring */
  .qm-input:focus-visible {
    outline: 2px solid ${swatch.emerald} !important;
    outline-offset: 1px !important;
    border-color: ${swatch.emerald} !important;
  }
  .qm-input:focus {
    outline: 2px solid ${swatch.emerald} !important;
    outline-offset: 1px !important;
    border-color: ${swatch.emerald} !important;
  }

  /* Close button hover */
  .qm-close-btn:hover {
    background: ${swatch.mint} !important;
    color: ${swatch.midnight} !important;
  }

  /* Reduced-motion: disable all animations */
  @media (prefers-reduced-motion: reduce) {
    .qm-step-enter,
    .qm-result-reveal,
    .qm-checkmark-pop,
    .qm-shake,
    .qm-spinner {
      animation: none !important;
    }
    .qm-spinner {
      opacity: 0.6;
    }
  }

  /* Mobile: retain a single, usable scroll surface inside the viewport. */
  @media (max-width: 479px) {
    .qm-card {
      width: calc(100vw - 32px) !important;
      max-height: calc(100dvh - 32px) !important;
      padding: 20px 16px 18px !important;
      border-radius: 12px !important;
      scroll-padding: 16px;
      overscroll-behavior: contain;
    }
    .qm-card .qm-input {
      min-height: 44px;
      font-size: 16px !important;
    }
    .qm-card .qm-pill,
    .qm-card .qm-btn-primary,
    .qm-card .qm-btn-secondary {
      min-height: 44px;
    }
    .qm-card .qm-pill {
      flex: 1 1 132px;
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
    .qm-card .qm-close-btn {
      min-height: 36px;
      min-width: 36px;
      padding: 4px !important;
      top: 10px !important;
      right: 10px !important;
    }
  }
`;

// Inject styles once into the document head
let _stylesInjected = false;
function ensureStyles() {
  if (_stylesInjected || typeof document === "undefined") return;
  _stylesInjected = true;
  const el = document.createElement("style");
  el.setAttribute("data-qm", "1");
  el.textContent = ANIMATION_CSS;
  document.head.appendChild(el);
}

// ─── Shared sub-components ────────────────────────────────────────────────────
const FUNNEL_STEPS = 4;

function ProgressBar({ step }: { step: number }) {
  const pct = Math.min(step, FUNNEL_STEPS) / FUNNEL_STEPS;
  return (
    <div
      style={{
        height: 4,
        background: swatch.mint,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct * 100}%`,
          background: swatch.lemon,
          borderRadius: 4,
          transition: "width 0.35s ease",
        }}
      />
    </div>
  );
}

function StepLabel({ step }: { step: number }) {
  if (step >= 5) return null;
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: font.semibold,
        color: swatch.rainforest,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        margin: "0 0 20px",
      }}
    >
      Step {step} of {FUNNEL_STEPS}
    </p>
  );
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="qm-close-btn"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: swatch.rainforest,
        fontSize: 22,
        lineHeight: 1,
        padding: "4px 8px",
        borderRadius: radius.sm,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      ✕
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  borderRadius: radius.sm,
  border: `1.5px solid ${swatch.mint}`,
  background: "#fff",
  color: swatch.midnight,
  fontSize: 15,
  fontFamily: font.family,
  outline: "none",
  marginTop: 4,
  transition: "border-color 0.15s",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "#c25b4e",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: font.semibold,
  color: swatch.rainforest,
  marginBottom: 2,
  letterSpacing: "0.02em",
};

const helperStyle: React.CSSProperties = {
  fontSize: 12,
  color: swatch.rainforest,
  marginTop: 4,
  opacity: 0.8,
};

// Error ink. NOT theme `risk.danger` (#e06363): on this pistachio card that red
// lands at ~2.9:1, which fails AA for 12px text. #c25b4e is the same red family
// darkened to clear the cream ground — the risk tokens themselves still carry the
// signal in the submission Notice below (tinted ground + colored border/icon).
const DANGER_INK = "#c25b4e";

const errorMsgStyle: React.CSSProperties = {
  fontSize: 12,
  color: DANGER_INK,
  marginTop: 4,
};

/**
 * Always-mounted live region for a field's validation message.
 *
 * It renders even when there is no error (as an empty, zero-height div) on
 * purpose: a live region that is inserted into the DOM at the same moment it
 * gains content is frequently NOT announced by screen readers. Mounting it up
 * front and only swapping its children makes the announcement reliable, and the
 * stable `id` gives the control something to point `aria-describedby` at.
 */
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div id={id} aria-live="polite">
      {message ? <p style={errorMsgStyle}>{message}</p> : null}
    </div>
  );
}

function FieldGroup({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const uid = useId();
  const errorId = `${uid}-error`;
  // Link the control (a <select>, or the role="group" pill row) to its message so
  // the error is announced with the field instead of floating unattached.
  const described = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-describedby": [
          (children as React.ReactElement<Record<string, unknown>>).props["aria-describedby"],
          errorId,
        ]
          .filter(Boolean)
          .join(" "),
        ...(error ? { "aria-invalid": true } : {}),
      })
    : children;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {described}
      <FieldError id={errorId} message={error} />
      {!error && helper ? <p style={helperStyle}>{helper}</p> : null}
    </div>
  );
}

function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={active ? "qm-pill qm-pill-active" : "qm-pill"}
      style={{
        padding: "8px 16px",
        borderRadius: radius.sm,
        border: `1.5px solid ${active ? swatch.midnight : swatch.mint}`,
        background: active ? swatch.midnight : "#fff",
        color: active ? swatch.pistachio : swatch.midnight,
        fontFamily: font.family,
        fontWeight: font.semibold,
        fontSize: 14,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

const btnPrimaryBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 28px",
  borderRadius: radius.sm,
  background: swatch.lemon,
  color: swatch.midnight,
  border: "none",
  fontFamily: font.family,
  fontWeight: font.bold,
  fontSize: 15,
  cursor: "pointer",
  transition: "filter 0.15s, transform 0.1s",
};

const btnPrimary: React.CSSProperties = { ...btnPrimaryBase };

const btnPrimaryDisabled: React.CSSProperties = {
  ...btnPrimaryBase,
  opacity: 0.42,
  cursor: "not-allowed",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 20px",
  borderRadius: radius.sm,
  background: "transparent",
  color: swatch.rainforest,
  border: `1.5px solid ${swatch.mint}`,
  fontFamily: font.family,
  fontWeight: font.semibold,
  fontSize: 14,
  cursor: "pointer",
  transition: "background 0.15s",
};

// ─── Lock/Trust glyph ─────────────────────────────────────────────────────────
function TrustBar({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 12,
        color: swatch.rainforest,
        margin: "4px 0 24px",
        padding: "9px 13px",
        borderRadius: radius.sm,
        background: swatch.mint,
        lineHeight: 1.5,
      }}
    >
      {/* Shield / lock SVG — 14px, no animation */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0, opacity: 0.75 }}
      >
        <path
          d="M7 1L2 3.2V7c0 2.95 2.18 5.56 5 6 2.82-.44 5-3.05 5-6V3.2L7 1z"
          fill={swatch.rainforest}
          opacity="0.55"
        />
        <path
          d="M5.5 7a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"
          fill="#fff"
        />
      </svg>
      <span>{text}</span>
    </div>
  );
}

// ─── Step 1 — Loan Purpose + Live DSCR Calculator ─────────────────────────────
function Step1({
  data,
  onChange,
  onNext,
  firstFieldRef,
  headingId,
  step2,
  onStep2Change,
}: {
  data: StepOneData;
  onChange: (d: Partial<StepOneData>) => void;
  onNext: () => void;
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  headingId: string;
  step2: StepTwoData;
  onStep2Change: (d: Partial<StepTwoData>) => void;
}) {
  const uid = useId();
  const idPropVal = `${uid}-propval`;
  const idRent    = `${uid}-rent`;
  const idRate    = `${uid}-rate`;

  const qualification = qualify(buildQualifyInput(data, step2));
  const dscr = qualification.dscr;
  const estimate = classifyQuickDscr(dscr);
  const col = dscrColor(dscr);

  const [shaking, setShaking] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const purposes: { val: Purpose; label: string }[] = [
    { val: "purchase", label: "Purchase" },
    { val: "rate-term", label: "Rate & term refi" },
    { val: "cash-out", label: "Cash-out refi" },
  ];

  const propertyTypes: { val: PropertyType; label: string }[] = [
    { val: "sfr", label: "Single-family" },
    { val: "2-4-unit", label: "2–4 unit" },
    { val: "condo", label: "Condo" },
    { val: "townhouse", label: "Townhouse" },
    { val: "5-8-unit", label: "5–8 unit" },
    { val: "short-term-rental", label: "Short-term rental" },
  ];

  const ltv = data.propertyValue > 0 ? data.loanAmount / data.propertyValue : 0;
  const loanExceedsValue =
    attempted && data.loanAmount >= data.propertyValue && data.propertyValue > 0;

  const isValid =
    step2.purpose !== null &&
    data.propertyType !== null &&
    data.propertyValue >= 50000 &&
    data.loanAmount > 0 &&
    data.loanAmount < data.propertyValue &&
    data.rent > 0 &&
    data.rate > 0 &&
    data.investmentConfirmed;

  const handleNext = () => {
    setAttempted(true);
    if (!isValid) {
      setShaking(true);
      return;
    }
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNext();
  };

  return (
    <div className="qm-step-enter" onKeyDown={handleKeyDown}>
      <h2
        id={headingId}
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 4,
          marginTop: 0,
        }}
      >
        Estimate your rental DSCR — in 60 seconds
      </h2>
      <p
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 24,
          marginTop: 0,
        }}
      >
        No credit pull &middot; no obligation &middot; instant DSCR estimate
      </p>

      {/* Loan purpose — first question, sets context for all results */}
      <FieldGroup
        label="What do you want to do with this property?"
        helper={
          step2.purpose === "cash-out"
            ? "Cash-out refinance — replace your loan with a larger one and take the difference in cash. Pricing is slightly higher than a purchase."
            : step2.purpose === "rate-term"
            ? "Rate & term refinance — replace your current loan to change the rate or term, without taking cash out."
            : "Are you buying it, refinancing for a different rate or term, or modeling cash out? The purpose changes the assumptions shown."
        }
        error={attempted && !step2.purpose ? "Please select a loan purpose to continue." : undefined}
      >
        <div
          role="group"
          aria-label="Loan purpose"
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}
        >
          {purposes.map((p) => (
            <PillBtn
              key={p.val}
              active={step2.purpose === p.val}
              onClick={() => onStep2Change({ purpose: p.val })}
            >
              {p.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="Property type"
        helper="DSCR measures whether the property's rent can cover the full monthly payment. Property type can affect how a responsible provider evaluates income and eligibility; this calculator does not decide either."
        error={attempted && !data.propertyType ? "Please select a property type." : undefined}
      >
        <div role="group" aria-label="Property type" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {propertyTypes.map((t) => (
            <PillBtn key={t.val} active={data.propertyType === t.val} onClick={() => onChange({ propertyType: t.val })}>
              {t.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idPropVal} style={labelStyle}>
          {step2.purpose === "purchase" ? "Purchase price" : "Estimated property value"}
        </label>
        <input
          id={idPropVal}
          ref={firstFieldRef as React.RefObject<HTMLInputElement>}
          type="number"
          value={data.propertyValue}
          min={50000}
          step={5000}
          onChange={(e) => onChange({ propertyValue: Number(e.target.value) })}
          className="qm-input"
          style={inputStyle}
        />
        <p style={helperStyle}>
          {step2.purpose === "purchase"
            ? "The agreed-upon or expected purchase price. An estimate is fine if you haven't made an offer yet."
            : "Your best estimate of what the property is worth today — use a recent appraisal or a site like Zillow if you're unsure."}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={`${uid}-loan`} style={labelStyle}>
          Desired loan amount
        </label>
        <input
          id={`${uid}-loan`}
          type="number"
          value={data.loanAmount}
          min={0}
          step={5000}
          onChange={(e) => onChange({ loanAmount: Number(e.target.value) })}
          className="qm-input"
          aria-describedby={`${uid}-loan-error`}
          aria-invalid={loanExceedsValue || undefined}
          style={loanExceedsValue ? inputErrorStyle : inputStyle}
        />
        <FieldError
          id={`${uid}-loan-error`}
          message={loanExceedsValue ? "Loan amount can't equal or exceed the property value." : undefined}
        />
        {loanExceedsValue ? null : (
          <p style={helperStyle}>
            LTV (how the loan amount compares to the property value — lower = more equity = better terms):{" "}
            <strong style={{ color: ltv > 0.8 ? "#c25b4e" : swatch.midnight, fontFamily: font.mono }}>
              {data.propertyValue > 0 ? `${(ltv * 100).toFixed(0)}%` : "—"}
            </strong>
            {ltv > 0.8 && data.propertyValue > 0
              ? " — above 80%, which increases leverage. Try reducing the loan amount to model a lower payment."
              : ". Product limits vary and require provider confirmation."}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idRent} style={labelStyle}>
          Expected monthly rent
        </label>
        <input
          id={idRent}
          type="number"
          value={data.rent}
          min={0}
          step={50}
          onChange={(e) => onChange({ rent: Number(e.target.value) })}
          className="qm-input"
          style={inputStyle}
        />
        <p style={helperStyle}>
          The gross rent you expect the property to bring in each month (before expenses). This is the numerator in your DSCR — whether the property's rent can cover the loan payment (1.00 = rent exactly covers it; higher is stronger). An estimate is fine.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idRate} style={labelStyle}>
          Estimated interest rate (%)
        </label>
        <input
          id={idRate}
          type="number"
          value={data.rate}
          min={2}
          max={20}
          step={0.125}
          onChange={(e) => onChange({ rate: Number(e.target.value) })}
          className="qm-input"
          style={inputStyle}
        />
        <p style={helperStyle}>
          Your note-rate assumption is used only to estimate the monthly payment
          (PITIA). It is not a current market quote or an available rate.
        </p>
      </div>

      {/* Occupancy gate — DSCR is business-purpose, non-owner-occupied only */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 18,
          cursor: "pointer",
          fontSize: 13,
          color: swatch.midnight,
          lineHeight: 1.45,
        }}
      >
        <input
          type="checkbox"
          checked={data.investmentConfirmed}
          onChange={(e) => onChange({ investmentConfirmed: e.target.checked })}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: swatch.rainforest, flexShrink: 0 }}
        />
        <span>
          This is a rental I invest in, not a home I live in (business-purpose / non-owner-occupied).
          <span style={{ display: "block", fontSize: 12, color: swatch.rainforest, opacity: 0.85 }}>
            This flow is limited to business-purpose rental scenarios and does not
            evaluate owner-occupied or personal-purpose financing.
          </span>
        </span>
      </label>

      {/* Live DSCR readout — color transitions smoothly */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          background: swatch.mint,
          borderRadius: radius.sm,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: font.semibold,
                color: swatch.rainforest,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Live DSCR
            </div>
            <div
              style={{
                fontSize: 36,
                fontFamily: font.mono,
                fontWeight: 700,
                color: col,
                lineHeight: 1,
                transition: "color 0.2s ease",
              }}
            >
              {dscr.toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: swatch.rainforest, marginTop: 3, opacity: 0.75 }}>
              rent ÷ full payment
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: font.semibold,
            color: col,
            textAlign: "right",
            maxWidth: 140,
            transition: "color 0.2s ease",
          }}
        >
          {estimate.label}
          {dscr > 0 && (
            <div style={{ fontSize: 11, color: swatch.rainforest, fontWeight: 400, marginTop: 4, opacity: 0.75 }}>
              {dscr >= 1.25
                ? "Stronger modeled cushion"
                : dscr >= 1.0
                ? "Estimated rent covers payment"
                : dscr >= 0.85
                ? "Estimated rent is below payment"
                : "Material modeled shortfall"}
            </div>
          )}
        </div>
      </div>

      <button
        className={`qm-btn-primary${shaking ? " qm-shake" : ""}`}
        style={isValid ? btnPrimary : btnPrimaryDisabled}
        disabled={!isValid}
        onClick={handleNext}
        onAnimationEnd={() => setShaking(false)}
      >
        See my preliminary result →
      </button>
    </div>
  );
}

// ─── Step 2 — Deal Details (state + credit) ───────────────────────────────────
function Step2({
  data,
  onChange,
  onBack,
  onNext,
  headingId,
}: {
  data: StepTwoData;
  onChange: (d: Partial<StepTwoData>) => void;
  onBack: () => void;
  onNext: () => void;
  headingId: string;
}) {
  const uid = useId();
  const idState = `${uid}-state`;
  const [attempted, setAttempted] = useState(false);
  const [shaking, setShaking] = useState(false);

  const ficos: { val: FicoBand; label: string }[] = [
    { val: "under-680", label: "Below 680" },
    { val: "680-719", label: "680–719" },
    { val: "720-759", label: "720–759" },
    { val: "760-plus", label: "760 or above" },
  ];

  const purposeLabel: Record<Purpose, string> = {
    purchase: "purchase",
    "rate-term": "rate & term refinance",
    "cash-out": "cash-out refinance",
  };

  const borrowerTypes: { val: BorrowerType; label: string }[] = [
    { val: "individual", label: "In my own name" },
    { val: "entity", label: "LLC / entity" },
  ];
  const experiences: { val: Experience; label: string }[] = [
    { val: "0", label: "First one" },
    { val: "1-3", label: "1–3" },
    { val: "4-9", label: "4–9" },
    { val: "10-plus", label: "10+" },
  ];

  const isValid =
    data.state !== "" &&
    data.ficoBand !== null &&
    data.borrowerType !== null &&
    data.experience !== null;

  const handleNext = () => {
    setAttempted(true);
    if (isValid) {
      onNext();
    } else {
      setShaking(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNext();
  };

  return (
    <div className="qm-step-enter" onKeyDown={handleKeyDown}>
      <h2
        id={headingId}
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        A few more details — then your result
      </h2>
      <p style={{ fontSize: 13, color: swatch.rainforest, marginBottom: 24, marginTop: 0 }}>
        {data.purpose
          ? `Your ${purposeLabel[data.purpose]} — these fields select assumptions for the educational estimate and flag state details for manual review.`
          : "These details select assumptions for the educational estimate and flag state details for manual review."}
      </p>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idState} style={labelStyle}>
          Property state
        </label>
        <select
          id={idState}
          value={data.state}
          onChange={(e) => onChange({ state: e.target.value })}
          className="qm-input"
          aria-describedby={`${idState}-error`}
          aria-invalid={(attempted && !data.state) || undefined}
          style={
            attempted && !data.state
              ? { ...inputStyle, marginTop: 4, borderColor: DANGER_INK }
              : { ...inputStyle, marginTop: 4 }
          }
        >
          <option value="">Select a state…</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <FieldError
          id={`${idState}-error`}
          message={attempted && !data.state ? "Please select the property state." : undefined}
        />
        {attempted && !data.state ? null : (
          <p style={helperStyle}>Where the property is located — not where you live. State law and provider policies may affect a transaction; this estimate does not determine either.</p>
        )}
      </div>

      <FieldGroup
        label="Your credit score range (estimate)"
        helper="We don't pull your credit here. The selected range changes the illustrative model band; it is not a credit decision or quote."
        error={attempted && !data.ficoBand ? "Please select a credit score range." : undefined}
      >
        <div
          role="group"
          aria-label="Borrower credit score range"
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}
        >
          {ficos.map((f) => (
            <PillBtn
              key={f.val}
              active={data.ficoBand === f.val}
              onClick={() => onChange({ ficoBand: f.val })}
            >
              {f.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="Who will be on the loan?"
        helper="Borrower vesting can affect legal and product requirements. A responsible provider and qualified counsel must confirm the permitted structure."
        error={attempted && !data.borrowerType ? "Please choose how you'll borrow." : undefined}
      >
        <div role="group" aria-label="Borrower type" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {borrowerTypes.map((b) => (
            <PillBtn key={b.val} active={data.borrowerType === b.val} onClick={() => onChange({ borrowerType: b.val })}>
              {b.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="How many rental properties do you currently own?"
        helper="Experience may be considered by a provider. This answer is context for a human review and does not determine eligibility."
        error={attempted && !data.experience ? "Please pick a range." : undefined}
      >
        <div role="group" aria-label="Investor experience" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {experiences.map((x) => (
            <PillBtn key={x.val} active={data.experience === x.val} onClick={() => onChange({ experience: x.val })}>
              {x.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      <div
        style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}
      >
        <button
          className="qm-btn-secondary"
          style={btnSecondary}
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className={`qm-btn-primary${shaking ? " qm-shake" : ""}`}
          style={isValid ? btnPrimary : btnPrimaryDisabled}
          onClick={handleNext}
          onAnimationEnd={() => setShaking(false)}
        >
          See my result →
        </button>
      </div>
    </div>
  );
}

// ─── Count-up hook for the DSCR reveal ───────────────────────────────────────
function useCountUp(target: number, duration = 520): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }
    let startTime: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (startTime === null) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * 100 * eased) / 100);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// ─── Step 3 — Personalized Result ────────────────────────────────────────────
function Step3({
  step1,
  step2,
  onBack,
  onNext,
  headingId,
}: {
  step1: StepOneData;
  step2: StepTwoData;
  onBack: () => void;
  onNext: () => void;
  headingId: string;
}) {
  const q = qualify(buildQualifyInput(step1, step2));
  const dscr = q.dscr;
  const estimate = classifyQuickDscr(dscr);
  const col = dscrColor(dscr);
  const verdict = dscrVerdict(estimate.tier, step2.purpose);
  const rate = fmtRateRange(q.rateLow, q.rateHigh);
  const topLever = q.levers[0];

  // Animated count-up for the big DSCR number
  const displayDscr = useCountUp(dscr, 520);

  const purposeLabel: Record<Purpose, string> = {
    purchase: "Purchase",
    "rate-term": "Rate & term refi",
    "cash-out": "Cash-out refi",
  };

  const isBorderlineOrLow =
    estimate.tier === "SPECIALIST_REQUIRED" || estimate.tier === "UNLIKELY";

  return (
    <div className="qm-step-enter">
      <p
        style={{
          fontSize: 11,
          fontWeight: font.semibold,
          color: swatch.rainforest,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        Preliminary estimate
      </p>
      <h2
        id={headingId}
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 20,
          marginTop: 0,
        }}
      >
        {verdict.headline}
      </h2>

      {/* (a) Plain verdict first — DSCR + verdict tile */}
      <div
        className="qm-result-reveal"
        style={{
          background: swatch.mint,
          borderRadius: radius.sm,
          padding: "20px 24px",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 10 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: font.semibold,
                color: swatch.rainforest,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Your DSCR — whether the property's rent can cover the loan payment
            </div>
            <div
              style={{
                fontSize: 48,
                fontFamily: font.mono,
                fontWeight: 700,
                color: col,
                lineHeight: 1,
                transition: "color 0.25s ease",
              }}
            >
              {displayDscr.toFixed(2)}x
            </div>
            <div style={{ fontSize: 12, color: swatch.rainforest, marginTop: 4, opacity: 0.75 }}>
              1.00 = rent exactly covers it · higher is stronger
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: font.bold,
              color: verdict.color,
              paddingBottom: 28,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {verdict.tier}
          </div>
        </div>

        {/* Plain-language verdict */}
        <p
          style={{
            fontSize: 14,
            color: swatch.midnight,
            margin: "0 0 8px",
            lineHeight: 1.5,
            fontWeight: font.semibold,
          }}
        >
          {verdict.detail}
        </p>

        {/* Purpose-tailored context */}
        {verdict.purposeNote && (
          <p
            style={{
              fontSize: 13,
              color: swatch.rainforest,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {verdict.purposeNote}
          </p>
        )}
      </div>

      {/* (b) Which numbers mattered most — key deal metrics */}
      <div
        style={{
          background: "#fff",
          borderRadius: radius.sm,
          border: `1.5px solid ${swatch.mint}`,
          padding: "14px 18px",
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: font.semibold, color: swatch.rainforest, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          The numbers that drove this result
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            {
              k: "LTV",
              v: `${(q.ltv * 100).toFixed(0)}%`,
              sub: "loan ÷ value",
            },
            {
              k: "PITIA / mo",
              v: fmtUsd(q.pitia),
              sub: "full payment",
            },
            {
              k: "P&I / mo",
              v: fmtUsd(q.piMonthly),
              sub: "principal + interest",
            },
          ].map((m) => (
            <div
              key={m.k}
              style={{
                flex: 1,
                background: swatch.mint,
                borderRadius: radius.sm,
                padding: "10px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: font.semibold, color: swatch.rainforest, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
                {m.k}
              </div>
              <div style={{ fontSize: 15, fontFamily: font.mono, fontWeight: 700, color: swatch.midnight }}>{m.v}</div>
              <div style={{ fontSize: 11, color: swatch.rainforest, marginTop: 2, opacity: 0.7 }}>{m.sub}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: swatch.rainforest, margin: "10px 0 0", lineHeight: 1.5 }}>
          PITIA is the full monthly payment — principal, interest, taxes, insurance, and any HOA dues. Your DSCR = {fmtUsd(step1.rent)} rent ÷ {fmtUsd(q.pitia)} PITIA = {(step1.rent / q.pitia).toFixed(2)}x.
        </p>
      </div>

      {/* Rate estimate */}
      <div
        style={{
          background: "#fff",
          borderRadius: radius.sm,
          border: `1.5px solid ${swatch.mint}`,
          padding: "14px 18px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: font.semibold,
            color: swatch.rainforest,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Illustrative model range
        </div>
        <div
          style={{
            fontSize: 26,
            fontFamily: font.mono,
            fontWeight: 700,
            color: swatch.midnight,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {rate}
        </div>
        <p style={{ fontSize: 12, color: swatch.rainforest, margin: 0 }}>
          Based on credit {step2.ficoBand ?? "range"},{" "}
          {step2.purpose ? purposeLabel[step2.purpose].toLowerCase() : "your loan type"},{" "}
          {step2.state || "your state"}. This is a model assumption, not a quote,
          available product, or rate lock. A responsible provider must confirm any
          financing terms.
        </p>
      </div>

      {/* (c) How to improve it — top lever */}
      {topLever && (
        <div
          style={{
            background: "rgba(77,189,151,0.10)",
            border: `1.5px solid ${swatch.emerald}`,
            borderRadius: radius.sm,
            padding: "12px 16px",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: font.semibold, color: swatch.rainforest, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
            Biggest lever to improve this deal — {topLever.label}
          </div>
          <p style={{ fontSize: 13, color: swatch.midnight, margin: 0, lineHeight: 1.5 }}>{topLever.detail}</p>
        </div>
      )}

      {/* (d) What happens next */}
      <div
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 20,
          padding: "14px 16px",
          background: isBorderlineOrLow
            ? "rgba(184,168,32,0.08)"
            : swatch.mint,
          borderRadius: radius.sm,
          lineHeight: 1.55,
          borderLeft: isBorderlineOrLow
            ? "3px solid #b8a820"
            : `3px solid ${swatch.emerald}`,
        }}
      >
        <strong style={{ display: "block", marginBottom: 6, color: swatch.midnight, fontSize: 13 }}>
          What happens next
        </strong>
        {verdict.nextStep}
      </div>

      {/* (e) Preliminary disclaimer */}
      <p style={{ fontSize: 11, color: swatch.rainforest, opacity: 0.65, marginBottom: 20, lineHeight: 1.5 }}>
        Preliminary educational estimate — not a commitment to lend, rate quote,
        approval, or credit decision. Any financing requires review by the
        responsible licensed provider.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="qm-btn-secondary" style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button className="qm-btn-primary" style={btnPrimary} onClick={onNext}>
          Store scenario for review →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Contact Capture ─────────────────────────────────────────────────
function Step4({
  data,
  onChange,
  onBack,
  onSubmit,
  submitting,
  submissionError,
  onDismissError,
  onBookCall,
  headingId,
}: {
  data: StepFourData;
  onChange: (d: Partial<StepFourData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submissionError: SubmissionError | null;
  onDismissError: () => void;
  onBookCall: () => void;
  headingId: string;
}) {
  const uid = useId();
  const idName  = `${uid}-name`;
  const idEmail = `${uid}-email`;
  const idPhone = `${uid}-phone`;
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [shaking, setShaking] = useState(false);

  const roles: { val: Role; label: string; helper: string }[] = [
    { val: "investor", label: "Buy & hold investor", helper: "Long-term rental income." },
    { val: "broker", label: "Broker or loan officer", helper: "Reviewing a scenario for a client." },
    { val: "foreign", label: "Non-US investor", helper: "Investing from outside the U.S." },
    { val: "str", label: "STR / Airbnb host", helper: "Short-term / vacation rental." },
    { val: "vacation", label: "Second / vacation home", helper: "A second home I'll also rent." },
  ];
  const timelines: { val: Timeline; label: string }[] = [
    { val: "exploring", label: "Just exploring" },
    { val: "under-30", label: "Within 30 days" },
    { val: "30-90", label: "30–90 days" },
    { val: "refi-soon", label: "Refi soon" },
  ];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  const nameValid = data.name.trim().length >= 2;
  const isValid = nameValid && emailValid && data.contactConsent && data.timeline !== null;
  const nameInvalid = Boolean(touched.name) && !nameValid;
  const emailInvalid = Boolean(touched.email) && !emailValid;
  const consentMissing = Boolean(touched.submit) && !data.contactConsent;

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = () => {
    setTouched({ name: true, email: true, submit: true });
    if (isValid && !submitting) {
      onSubmit();
    } else if (!isValid) {
      setShaking(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitting) handleSubmit();
  };

  return (
    <div className="qm-step-enter" onKeyDown={handleKeyDown}>
      <h2
        id={headingId}
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        Where should we send your scenario review?
      </h2>
      <p style={{ fontSize: 13, color: swatch.rainforest, marginBottom: 24, marginTop: 0 }}>
        Submit only the contact details you want stored with this scenario. The
        intake does not confirm staff notification or promise follow-up, a quote,
        a program match, or a financing outcome, and this form does not pull credit.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idName} style={labelStyle}>Full name</label>
        <input
          id={idName}
          type="text"
          value={data.name}
          placeholder="Jane Smith"
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => markTouched("name")}
          className="qm-input"
          aria-describedby={`${idName}-error`}
          aria-invalid={nameInvalid || undefined}
          style={nameInvalid ? inputErrorStyle : inputStyle}
          autoComplete="name"
          maxLength={100}
        />
        <FieldError id={`${idName}-error`} message={nameInvalid ? "Please enter your full name." : undefined} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idEmail} style={labelStyle}>Work email</label>
        <input
          id={idEmail}
          type="email"
          value={data.email}
          placeholder="jane@brokerage.com"
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={() => markTouched("email")}
          className="qm-input"
          aria-describedby={`${idEmail}-error`}
          aria-invalid={emailInvalid || undefined}
          style={emailInvalid ? inputErrorStyle : inputStyle}
          autoComplete="email"
          maxLength={200}
          required
        />
        <FieldError id={`${idEmail}-error`} message={emailInvalid ? "Please enter a valid email address." : undefined} />
        {emailInvalid ? null : (
          <p style={helperStyle}>Use an address where you can receive a response to this request.</p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idPhone} style={labelStyle}>Phone number (optional)</label>
        <input
          id={idPhone}
          type="tel"
          value={data.phone}
          placeholder="Business phone"
          onChange={(e) => onChange({ phone: e.target.value })}
          className="qm-input"
          style={inputStyle}
          autoComplete="tel"
          maxLength={30}
        />
        <p style={helperStyle}>Add a number only if you consent to a phone response.</p>
      </div>

      <input
        type="text"
        name="website"
        value={data.website}
        onChange={(e) => onChange({ website: e.target.value })}
        autoComplete="new-password"
        tabIndex={-1}
        hidden
      />

      <FieldGroup
        label="When do you need to close?"
        helper="Helps us prioritize your file correctly. Exploring is fine — there's no pressure."
        error={touched.submit && !data.timeline ? "Please pick a timeline." : undefined}
      >
        <div role="group" aria-label="Timeline" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {timelines.map((t) => (
            <PillBtn key={t.val} active={data.timeline === t.val} onClick={() => onChange({ timeline: t.val })}>
              {t.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="What best describes you?"
        helper="Provides context if the stored request is reviewed."
      >
        <div
          role="group"
          aria-label="I am a"
          style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}
        >
          {roles.map((r) => (
            <PillBtn
              key={r.val}
              active={data.role === r.val}
              onClick={() => onChange({ role: r.val })}
            >
              {r.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      {/* Trust bar with lock icon */}
      <TrustBar text="No credit pull · no obligation. Do not submit SSNs, bank details, or identity documents." />

      {/* Contact consent is required. SMS is intentionally not offered until a
          verified messaging provider and opt-out workflow are documented. */}
      <label
        style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, cursor: "pointer", fontSize: 12, color: swatch.midnight, lineHeight: 1.5 }}
      >
        <input
          type="checkbox"
          checked={data.contactConsent}
          onChange={(e) => onChange({ contactConsent: e.target.checked })}
          aria-describedby={`${uid}-consent-error`}
          aria-invalid={consentMissing || undefined}
          style={{ marginTop: 1, width: 16, height: 16, accentColor: swatch.rainforest, flexShrink: 0 }}
        />
        <span>
          I agree to be contacted by Greenstreet Finance about my inquiry and accept the{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener" style={{ color: swatch.rainforest }}>Privacy Policy</a> and{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener" style={{ color: swatch.rainforest }}>Terms</a>.
        </span>
      </label>
      <div id={`${uid}-consent-error`} aria-live="polite">
        {consentMissing && (
          <p style={{ ...errorMsgStyle, marginTop: -4, marginBottom: 10 }}>Please agree to be contacted so the team can respond to this request.</p>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="qm-btn-secondary" style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button
          className={`qm-btn-primary${shaking ? " qm-shake" : ""}`}
          style={
            isValid && !submitting ? btnPrimary : btnPrimaryDisabled
          }
          disabled={!isValid || submitting}
          onClick={handleSubmit}
          onAnimationEnd={() => setShaking(false)}
        >
          {submitting && <span className="qm-spinner" aria-hidden="true" />}
          {submitting ? "Sending…" : "Send my scenario for review →"}
        </button>
      </div>
      {submissionError && (
        <Notice
          role="alert"
          tone="danger"
          ground="light"
          title={submissionError.title}
          onDismiss={onDismissError}
          action={submissionError.canRetry ? { label: "Try again", onClick: onSubmit } : undefined}
          secondaryAction={submissionError.canRetry ? { label: "Book a call instead", onClick: onBookCall } : undefined}
          style={{ marginTop: 14 }}
        >
          {submissionError.message}
        </Notice>
      )}
    </div>
  );
}

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────
function Step5({ name, onClose, headingId }: { name: string; onClose: () => void; headingId: string }) {
  const firstName = name.split(" ")[0] || "there";

  const handleAnotherEstimate = () => {
    onClose();
    window.history.pushState({}, "", "/dscr-calculator");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="qm-step-enter" style={{ textAlign: "center", padding: "12px 0 8px" }}>
      <div
        className="qm-checkmark-pop"
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: swatch.emerald,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 28,
          color: "#fff",
        }}
      >
        ✓
      </div>
      <h2
        id={headingId}
        style={{
          fontSize: 24,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 8,
          marginTop: 0,
        }}
      >
        Request received, {firstName}
      </h2>
      <p
        style={{
          fontSize: 15,
          color: swatch.rainforest,
          marginBottom: 8,
          lineHeight: 1.55,
        }}
      >
        The configured intake stored your request for review. This does not
        confirm a staff notification or promise a response time, program match,
        quote, or financing outcome.
      </p>
      <p
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 28,
          opacity: 0.75,
          lineHeight: 1.5,
        }}
      >
        This is not a loan application, approval, rate quote, or commitment to
        lend. Do not rely on the submitted estimate to make a transaction
        decision.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button className="qm-btn-primary" style={btnPrimary} onClick={handleAnotherEstimate}>
          Run another estimate →
        </button>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: swatch.rainforest,
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: font.family,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Focusable elements selector (for focus trap) ─────────────────────────────
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function QualifyModal({ open, onClose, initialDraft = null }: QualifyModalProps) {
  const submissionIdRef = useRef(createSubmissionId());
  const formGenerationRef = useRef(0);
  const submitAbortRef = useRef<AbortController | null>(null);
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<StepOneData>(freshStepOne);
  const [step2, setStep2] = useState<StepTwoData>(freshStepTwo);
  const [step4, setStep4] = useState<StepFourData>(freshStepFour);
  const [submitting, setSubmitting] = useState(false);
  // `canRetry` separates the two failure classes: a delivery failure is worth
  // pressing again (and worth offering a human fallback), whereas missing
  // scenario details need the user to walk back through the steps.
  const [submissionError, setSubmissionError] = useState<SubmissionError | null>(null);

  // Start every opening from fresh defaults, then hydrate only whitelisted,
  // non-PII scenario values. Closing also clears contact and consent state,
  // aborts an in-flight request, and invalidates its callbacks.
  useEffect(() => {
    formGenerationRef.current += 1;
    submitAbortRef.current?.abort();
    submitAbortRef.current = null;
    setStep(1);
    setStep4(freshStepFour());
    setSubmitting(false);
    setSubmissionError(null);

    const draft = open
      ? sanitizeQualificationScenarioDraft(initialDraft)
      : null;
    setStep1({
      ...freshStepOne(),
      ...(draft?.propertyValue !== undefined
        ? { propertyValue: draft.propertyValue }
        : {}),
      ...(draft?.loanAmount !== undefined ? { loanAmount: draft.loanAmount } : {}),
      ...(draft?.rent !== undefined ? { rent: draft.rent } : {}),
      ...(draft?.rate !== undefined ? { rate: draft.rate } : {}),
    });
    setStep2({
      ...freshStepTwo(),
      ...(draft?.purpose ? { purpose: draft.purpose } : {}),
    });
    if (open) submissionIdRef.current = createSubmissionId();
  }, [initialDraft, open]);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // For returning focus on close
  const triggerRef = useRef<Element | null>(null);

  // Unique id for the visible heading (aria-labelledby)
  const headingId = useId();

  // Inject animation CSS once
  useEffect(() => {
    ensureStyles();
  }, []);

  // Capture the focused element before opening, so we can restore it on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
    } else {
      // Return focus to the trigger element when the modal closes
      const el = triggerRef.current;
      if (el && typeof (el as HTMLElement).focus === "function") {
        // Small delay lets the modal finish unmounting first
        setTimeout(() => (el as HTMLElement).focus(), 30);
      }
      triggerRef.current = null;
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Autofocus first field on step 1 (or heading on other steps)
  useEffect(() => {
    if (!open) return;
    if (step === 1) {
      setTimeout(() => firstFieldRef.current?.focus(), 80);
    } else {
      // Focus the heading so screen readers announce the new step
      setTimeout(() => {
        const heading = cardRef.current?.querySelector<HTMLElement>(`#${CSS.escape(headingId)}`);
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus();
        }
      }, 80);
    }
  }, [open, step, headingId]);

  // Keep a failed submission explanation in view on compact screens.
  useEffect(() => {
    if (!open || !submissionError) return;
    const timer = window.setTimeout(() => {
      cardRef.current?.querySelector<HTMLElement>('[role="alert"]')?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, submissionError]);

  // Esc to close + Tab focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusable = Array.from(
          cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => el.offsetParent !== null); // skip hidden
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Scrim click
  const handleScrimClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  // Human fallback when the lead POST fails: close the modal and hand the visitor
  // to the booking page rather than leaving them staring at an error. (Same
  // navigation shape Step5 uses — the app's global link/popstate router picks it up.)
  const handleBookCallFallback = useCallback(() => {
    onClose();
    window.history.pushState({}, "", "/book-demo");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [onClose]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionError(null);

    if (
      !step1.propertyType ||
      !step2.purpose ||
      !step2.ficoBand ||
      !step2.borrowerType ||
      !step2.experience ||
      !step4.timeline
    ) {
      setSubmissionError({
        title: "Some scenario details are still missing",
        message:
          "Your information was not sent. Step back through the earlier questions and fill in anything left blank, then send again.",
        canRetry: false,
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      name: step4.name.trim(),
      email: step4.email.trim(),
      phone: step4.phone.trim(),
      ...(step4.role ? { role: step4.role } : {}),
      timeline: step4.timeline,
      propertyType: step1.propertyType,
      propertyValue: step1.propertyValue,
      loanAmount: step1.loanAmount,
      rent: step1.rent,
      rate: step1.rate,
      purpose: step2.purpose,
      state: step2.state,
      ficoBand: step2.ficoBand,
      borrowerType: step2.borrowerType,
      experience: step2.experience,
      investmentConfirmed: step1.investmentConfirmed,
      contactConsent: step4.contactConsent,
      page: typeof window !== "undefined" ? window.location.pathname : "/",
      submissionId: submissionIdRef.current,
      website: step4.website,
      // No client timestamps. LeadSubmissionSchema is .strict() and rejects any
      // key it does not declare, so sending createdAt/submittedAt made every
      // real submission fail with HTTP 400. The server stamps submittedAt and
      // contactConsentAt with FieldValue.serverTimestamp() in defaultPersistLead.
      // The lead is stored in Firestore. No staff-notification or CRM delivery
      // is implied by this request or its acknowledgement.
    };

    const controller = new AbortController();
    const formGeneration = formGenerationRef.current;
    submitAbortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Lead endpoint returned ${response.status}`);
      }
      if (formGeneration !== formGenerationRef.current) return;
      // The conversion event. Fired only after the intake route accepted the
      // lead, so it counts deliveries and not attempts. Deliberately carries no
      // property of any kind — name, email, phone and the loan scenario are all
      // PII and none of them belong in an analytics payload.
      track(AnalyticsEvent.LeadSubmitted);
      setStep(5);
    } catch (err) {
      if (formGeneration !== formGenerationRef.current) return;
      // Do not store loan scenarios or contact details in a visitor's browser,
      // and do not show a success state unless the business received the lead.
      console.error(
        "[QualifyModal] Lead write failed; the lead was not delivered:",
        err
      );
      captureException(err);
      // Never dead-end the lead: the notice below carries a retry AND a live
      // human path (book a call), so a failed POST is not the end of the funnel.
      setSubmissionError({
        title: "We couldn't send your request",
        message:
          "Your details were not delivered, and nothing was stored in this browser. Try again — or book a call and the review team will take your scenario live.",
        canRetry: true,
      });
    } finally {
      window.clearTimeout(timeout);
      if (submitAbortRef.current === controller) submitAbortRef.current = null;
      if (formGeneration === formGenerationRef.current) setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onClick={handleScrimClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,55,56,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 70,
        padding: "16px",
      }}
    >
      <div
        ref={cardRef}
        className="qm-card"
        style={{
          background: swatch.pistachio,
          borderRadius: radius.lg,
          padding: "28px 32px",
          width: "min(520px, 92vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <ProgressBar step={step} />
        <StepLabel step={step} />
        <CloseBtn onClose={onClose} />

        {step === 1 && (
          <Step1
            data={step1}
            onChange={(d) => setStep1((p) => ({ ...p, ...d }))}
            onNext={() => setStep(2)}
            firstFieldRef={firstFieldRef}
            headingId={headingId}
            step2={step2}
            onStep2Change={(d) => setStep2((p) => ({ ...p, ...d }))}
          />
        )}
        {step === 2 && (
          <Step2
            data={step2}
            onChange={(d) => setStep2((p) => ({ ...p, ...d }))}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            headingId={headingId}
          />
        )}
        {step === 3 && (
          <Step3
            step1={step1}
            step2={step2}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            headingId={headingId}
          />
        )}
        {step === 4 && (
          <Step4
            data={step4}
            onChange={(d) => setStep4((p) => ({ ...p, ...d }))}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            submitting={submitting}
            submissionError={submissionError}
            onDismissError={() => setSubmissionError(null)}
            onBookCall={handleBookCallFallback}
            headingId={headingId}
          />
        )}
        {step === 5 && <Step5 name={step4.name} onClose={onClose} headingId={headingId} />}
      </div>
    </div>
  );
}
