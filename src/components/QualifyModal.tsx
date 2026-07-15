/**
 * QualifyModal — 5-step value-first micro-commitment lead funnel
 * Step 1: Live DSCR calculator (hook)
 * Step 2: Deal details (purpose / state / FICO)
 * Step 3: Personalized result (the value drop)
 * Step 4: Contact capture
 * Step 5: Confirmation
 *
 * PRESERVED: DSCR calc formula, secure API lead submit, and user-invoked opening.
 *
 * ADDED: step-enter animation, progress bar transition, result reveal (count-up),
 * submit loading spinner, shake-on-error, DSCR color transition, pill hover states,
 * focus rings, trust signals, mobile-responsive padding.
 */
import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { swatch, font, radius } from "../theme";
import { quickDscrEstimate, qualify, fmtUsd } from "../engine";
import { trackEvent } from "../analytics/analytics";
import type {
  QuickDscrTier,
  QualifyPropertyType as PropertyType,
  BorrowerType,
  EngineFicoBand,
  QualifyInput,
} from "../engine";

// ─── Types ────────────────────────────────────────────────────────────────────
type Purpose = "purchase" | "rate-term" | "cash-out";
type FicoBand = "under-680" | "680-719" | "720-759" | "760-plus";
type Role = "investor" | "foreign" | "str" | "vacation";
type Experience = "0" | "1-3" | "4-9" | "10-plus";
type Timeline = "exploring" | "under-30" | "30-90" | "refi-soon";

function dscrBand(dscr: number): string {
  if (dscr < 0.8) return "under_0_80";
  if (dscr < 1) return "0_80_to_0_99";
  if (dscr < 1.25) return "1_00_to_1_24";
  if (dscr < 1.5) return "1_25_to_1_49";
  return "1_50_plus";
}

function ltvBand(propertyValue: number, loanAmount: number): string {
  if (propertyValue <= 0) return "unknown";
  const ltv = loanAmount / propertyValue;
  if (ltv <= 0.6) return "60_or_less";
  if (ltv <= 0.7) return "61_to_70";
  if (ltv <= 0.75) return "71_to_75";
  if (ltv <= 0.8) return "76_to_80";
  return "over_80";
}

function leadSubmitErrorCode(status?: number): string {
  if (!status) return "network_error";
  if (status === 400) return "invalid_submission";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "service_unavailable";
  return "request_rejected";
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
  smsConsent: boolean;
}

// Modal credit bands → engine credit bands (engine separates <660; the modal's
// lowest band is "under-680", mapped to the entry tier).
const FICO_TO_ENGINE: Record<FicoBand, EngineFicoBand> = {
  "under-680": "660-679",
  "680-719": "680-719",
  "720-759": "720-759",
  "760-plus": "760-plus",
};

// Build a QualifyInput from modal state (used by the result screen + payload).
function buildQualifyInput(s1: StepOneData, s2: StepTwoData): QualifyInput {
  return {
    propertyType: s1.propertyType ?? "sfr",
    purpose: s2.purpose ?? "purchase",
    state: s2.state,
    value: s1.propertyValue,
    loanAmount: s1.loanAmount > 0 ? s1.loanAmount : s1.propertyValue * 0.75,
    rent: s1.rent,
    ficoBand: s2.ficoBand ? FICO_TO_ENGINE[s2.ficoBand] : "680-719",
    borrowerType: s2.borrowerType ?? undefined,
    investmentConfirmed: s1.investmentConfirmed,
  };
}

// ─── Engine-backed DSCR helpers ───────────────────────────────────────────────
// The modal delegates all math to quickDscrEstimate (uses 0.5% ins, 1.2% tax,
// 75% LTV, 360-mo term — matches the rest of the product).

function dscrColor(dscr: number): string {
  if (dscr >= 1.25) return swatch.emerald;
  if (dscr >= 1.0) return swatch.rainforest;
  if (dscr >= 0.85) return swatch.lemon;
  return "#c25b4e";
}

function dscrVerdict(tier: QuickDscrTier, purpose?: Purpose | null): {
  tier: string;
  headline: string;
  detail: string;
  purposeNote: string;
  nextStep: string;
  color: string;
} {
  const purposeNote = purpose === "purchase"
    ? "For a purchase, verify the proposed loan amount, rent evidence, taxes, insurance, and provider requirements."
    : purpose === "rate-term"
      ? "For a rate-and-term refinance, verify the current payoff, property value, rent evidence, and provider requirements."
      : purpose === "cash-out"
        ? "For a cash-out refinance, the requested proceeds and resulting LTV are additional inputs a provider must review."
        : "A financing provider must review the complete scenario and current program requirements.";

  switch (tier) {
    case "LIKELY_QUALIFIES":
      return {
        tier: "Stronger coverage",
        headline: "The preliminary coverage math is above 1.25x",
        detail: "This result reflects only the assumptions entered here. It is not a qualification, approval, or indication of available pricing.",
        purposeNote,
        nextStep: "If you want a follow-up, you may submit the scenario for a current, provider-specific review.",
        color: swatch.emerald,
      };
    case "BORDERLINE":
      return {
        tier: "Near 1.00x",
        headline: "The preliminary coverage math is near 1.00x",
        detail: "Small changes to rent, payment, taxes, insurance, or fees may materially change this educational estimate.",
        purposeNote,
        nextStep: "A provider-specific review is required before drawing any conclusion about eligibility or terms.",
        color: swatch.rainforest,
      };
    case "SPECIALIST_REQUIRED":
      return {
        tier: "Below 1.00x",
        headline: "The preliminary coverage math is below 1.00x",
        detail: "The entered rent is lower than the estimated monthly obligation. This tool cannot determine whether any current program fits.",
        purposeNote,
        nextStep: "Review the assumptions and, if useful, request a current provider-specific assessment.",
        color: "#b8a820",
      };
    case "UNLIKELY":
    default:
      return {
        tier: "Lower coverage",
        headline: "The entered assumptions produce lower coverage",
        detail: "This educational estimate does not establish program availability or rule out alternatives. Verify every material input before relying on it.",
        purposeNote,
        nextStep: "You can revise the assumptions or request a current review without any promise of eligibility or terms.",
        color: "#c25b4e",
      };
  }
}

// ─── US States ────────────────────────────────────────────────────────────────
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming","Other",
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface QualifyModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Animation CSS injected once ─────────────────────────────────────────────
const ANIMATION_CSS = `
  .gs-qualify-modal-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 2147483000 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    min-width: 0 !important;
    min-height: 0 !important;
    box-sizing: border-box !important;
    display: grid !important;
    place-items: center !important;
    padding: clamp(8px, 2vw, 20px) !important;
    overflow: auto !important;
    overscroll-behavior: contain;
    visibility: visible !important;
    opacity: 1 !important;
    isolation: isolate;
  }
  .gs-qualify-modal-dialog {
    display: block !important;
    position: relative !important;
    width: min(100%, 520px) !important;
    min-width: 0 !important;
    max-width: 520px !important;
    max-height: calc(100vh - 32px) !important;
    max-height: calc(100dvh - 32px) !important;
    margin: auto !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    overscroll-behavior: contain;
    visibility: visible !important;
    opacity: 1 !important;
  }
  @media (max-width: 380px) {
    .gs-qualify-modal-overlay {
      padding: 8px !important;
    }
    .gs-qualify-modal-dialog {
      width: 100% !important;
      max-height: calc(100vh - 16px) !important;
      max-height: calc(100dvh - 16px) !important;
      padding: 24px 18px 20px !important;
    }
  }

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

  /* Mobile: tighter card padding */
  @media (max-width: 479px) {
    .qm-card {
      padding: 20px 18px !important;
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
      role="progressbar"
      aria-label="Qualification progress"
      aria-valuemin={1}
      aria-valuemax={FUNNEL_STEPS}
      aria-valuenow={Math.min(step, FUNNEL_STEPS)}
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

const errorMsgStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#c25b4e",
  marginTop: 4,
};

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
  const labelId = useId();
  const messageId = useId();

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={helper || error ? messageId : undefined} aria-invalid={error ? true : undefined} style={{ marginBottom: 16 }}>
      <span id={labelId} style={labelStyle}>{label}</span>
      {children}
      {error ? (
        <p id={messageId} role="alert" aria-live="polite" style={errorMsgStyle}>{error}</p>
      ) : helper ? (
        <p id={messageId} style={helperStyle}>{helper}</p>
      ) : null}
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

  // Use engine for all DSCR math (0.5% ins, 1.2% tax, 75% LTV, 360mo)
  const estimate = quickDscrEstimate(data.propertyValue, data.rent, data.rate);
  const dscr = estimate.dscr;
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
        Explore your rental scenario — in about 60 seconds
      </h2>
      <p
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 24,
          marginTop: 0,
        }}
      >
        No credit pull &middot; no obligation &middot; preliminary DSCR estimate
      </p>

      {/* Loan purpose — first question, sets context for all results */}
      <FieldGroup
        label="What do you want to do with this property?"
        helper={
          step2.purpose === "cash-out"
            ? "Cash-out refinance — replace your loan with a larger one and take the difference in cash. Pricing is slightly higher than a purchase."
            : step2.purpose === "rate-term"
            ? "Rate & term refinance — replace your current loan to change the rate or term, without taking cash out."
            : "Are you buying it, refinancing the existing balance, or requesting cash out? Each requires different inputs to review."
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
        helper="DSCR loans (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger) are available for most rental property types. Short-term rentals and 5–8 unit buildings have specialty programs with higher down-payment requirements."
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
          style={
            attempted && data.loanAmount >= data.propertyValue && data.propertyValue > 0
              ? inputErrorStyle
              : inputStyle
          }
        />
        {attempted && data.loanAmount >= data.propertyValue && data.propertyValue > 0 ? (
          <p style={errorMsgStyle}>Loan amount can't equal or exceed the property value.</p>
        ) : (
          <p style={helperStyle}>
            LTV (how the loan amount compares to the property value — lower = more equity = better terms):{" "}
            <strong style={{ color: ltv > 0.8 ? "#c25b4e" : swatch.midnight, fontFamily: font.mono }}>
              {data.propertyValue > 0 ? `${(ltv * 100).toFixed(0)}%` : "—"}
            </strong>
            {ltv > 0.8 && data.propertyValue > 0
              ? " — above 80%, which may limit programs. Try reducing the loan amount."
              : ". Most DSCR programs cap around 75–80% LTV."}
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
          Enter a rate assumption only to model the monthly payment (PITIA). This tool does not quote, confirm, or lock a current interest rate.
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
            DSCR loans are business-purpose only — for rentals, not primary residences. Uncheck if you plan to live there and we'll point you to the right program.
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
                ? "Strong cushion — good position"
                : dscr >= 1.0
                ? "Meets the floor — workable"
                : dscr >= 0.85
                ? "Below 1.0 — programs exist"
                : "Below floor — needs restructuring"}
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
          ? `Your ${purposeLabel[data.purpose]} — these fields refine the preliminary math and identify questions for further review.`
          : "These details refine the preliminary math and identify questions for further review."}
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
          style={
            attempted && !data.state
              ? { ...inputStyle, marginTop: 4, borderColor: "#c25b4e" }
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
        {attempted && !data.state ? (
          <p style={errorMsgStyle}>Please select the property state.</p>
        ) : (
          <p style={helperStyle}>Where the property is located — not where you live. Some states have rules (like prepayment penalty restrictions) that limit which lenders participate.</p>
        )}
      </div>

      <FieldGroup
        label="Your credit score range (estimate)"
        helper="We don't pull your credit here. A rough range helps identify questions a financing provider may ask; it does not produce a quote or approval."
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
        helper="Borrower and entity requirements vary by provider, property, and jurisdiction. This selection only identifies a question for further review."
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
        helper="Some providers ask about rental-property experience. This answer does not determine program fit or reserve requirements."
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
  const estimate = quickDscrEstimate(step1.propertyValue, step1.rent, step1.rate);
  const dscr = estimate.dscr;
  const col = dscrColor(dscr);
  const verdict = dscrVerdict(estimate.tier, step2.purpose);
  const q = qualify(buildQualifyInput(step1, step2));
  const topLever = q.levers[0];

  // Animated count-up for the big DSCR number
  const displayDscr = useCountUp(dscr, 520);

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
          PITIA is the full monthly payment — principal, interest, taxes, insurance, and any HOA dues. Your DSCR = ${fmtUsd(step1.rent)} rent ÷ {fmtUsd(q.pitia)} PITIA = {(step1.rent / q.pitia).toFixed(2)}x.
        </p>
      </div>

      {/* Pricing disclosure */}
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
          Pricing requires a current provider review
        </div>
        <p style={{ fontSize: 12, color: swatch.rainforest, margin: 0 }}>
          Interest rates, fees, eligibility, and available terms change and depend on information this tool does not verify. No rate is quoted, confirmed, or locked here.
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
        Preliminary estimate — not a commitment to lend or a credit decision. Subject to full underwriting review.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="qm-btn-secondary" style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button className="qm-btn-primary" style={btnPrimary} onClick={onNext}>
          Continue to the optional contact step →
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
  submitError,
  headingId,
}: {
  data: StepFourData;
  onChange: (d: Partial<StepFourData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError?: string;
  headingId: string;
}) {
  const uid = useId();
  const idName  = `${uid}-name`;
  const idEmail = `${uid}-email`;
  const idPhone = `${uid}-phone`;
  const idNameError = `${uid}-name-error`;
  const idEmailMessage = `${uid}-email-message`;
  const idTimelineLabel = `${uid}-timeline-label`;
  const idTimelineHelp = `${uid}-timeline-help`;
  const idTimelineError = `${uid}-timeline-error`;
  const idConsentError = `${uid}-consent-error`;
  const idValidationSummary = `${uid}-validation-summary`;
  const idSubmitError = `${uid}-submit-error`;
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [shaking, setShaking] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const roles: { val: Role; label: string; helper: string }[] = [
    { val: "investor", label: "Buy & hold investor", helper: "Long-term rental income." },
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
  const showNameError = Boolean(touched.name && !nameValid);
  const showEmailError = Boolean(touched.email && !emailValid);
  const showTimelineError = Boolean(touched.timeline && !data.timeline);
  const showConsentError = Boolean(touched.contactConsent && !data.contactConsent);
  const invalidFields = [
    !nameValid ? "full name" : null,
    !emailValid ? "email address" : null,
    !data.timeline ? "closing timeline" : null,
    !data.contactConsent ? "contact consent" : null,
  ].filter((field): field is string => field !== null);
  const invalidFieldList = invalidFields.length <= 1
    ? invalidFields[0] ?? ""
    : `${invalidFields.slice(0, -1).join(", ")}, and ${invalidFields[invalidFields.length - 1]}`;
  const validationSummary = invalidFields.length > 0
    ? `Please correct ${invalidFields.length} required ${invalidFields.length === 1 ? "field" : "fields"}: ${invalidFieldList}.`
    : "";

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = () => {
    setTouched({ name: true, email: true, timeline: true, contactConsent: true, submit: true });
    if (isValid && !submitting) {
      onSubmit();
    } else if (!isValid) {
      setSubmitAttempt((attempt) => attempt + 1);
      setShaking(true);
      if (!nameValid) {
        nameRef.current?.focus();
      } else if (!emailValid) {
        emailRef.current?.focus();
      } else if (!data.timeline) {
        timelineRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      } else if (!data.contactConsent) {
        consentRef.current?.focus();
      }
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
        Where should we send your preliminary scenario?
      </h2>
      <p style={{ fontSize: 13, color: swatch.rainforest, marginBottom: 24, marginTop: 0 }}>
        If you submit this form, a Greenstreet specialist may contact you to discuss the assumptions and current options. Response timing varies. No credit pull is made here.
      </p>

      {submitAttempt > 0 && validationSummary && (
        <p
          key={submitAttempt}
          id={idValidationSummary}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-qualify-validation-summary="true"
          style={{
            ...errorMsgStyle,
            margin: "0 0 18px",
            padding: "10px 12px",
            border: "1px solid #c25b4e",
            borderRadius: radius.sm,
            background: "#fff7f5",
          }}
        >
          {validationSummary}
        </p>
      )}

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idName} style={labelStyle}>Full name</label>
        <input
          id={idName}
          ref={nameRef}
          type="text"
          value={data.name}
          placeholder="Jane Smith"
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => markTouched("name")}
          className="qm-input"
          style={showNameError ? inputErrorStyle : inputStyle}
          autoComplete="name"
          aria-invalid={showNameError ? true : undefined}
          aria-describedby={showNameError ? idNameError : undefined}
        />
        {showNameError && (
          <p id={idNameError} role="alert" aria-live="polite" style={errorMsgStyle}>Enter your full name.</p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={idEmail} style={labelStyle}>Work email</label>
        <input
          id={idEmail}
          ref={emailRef}
          type="email"
          value={data.email}
          placeholder="jane@brokerage.com"
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={() => markTouched("email")}
          className="qm-input"
          style={showEmailError ? inputErrorStyle : inputStyle}
          autoComplete="email"
          required
          aria-invalid={showEmailError ? true : undefined}
          aria-describedby={idEmailMessage}
        />
        {showEmailError ? (
          <p id={idEmailMessage} role="alert" aria-live="polite" style={errorMsgStyle}>
            {data.email.trim() ? "Enter a valid email address." : "Enter your email address."}
          </p>
        ) : (
          <p id={idEmailMessage} style={helperStyle}>We'll send the preliminary scenario here.</p>
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
        />
        <p style={helperStyle}>Prefer a call? Add your number and we'll reach out directly.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <span id={idTimelineLabel} style={labelStyle}>When do you need to close?</span>
        <div
          ref={timelineRef}
          role="group"
          aria-labelledby={idTimelineLabel}
          aria-invalid={showTimelineError ? true : undefined}
          aria-describedby={showTimelineError ? idTimelineError : idTimelineHelp}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) markTouched("timeline");
          }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}
        >
          {timelines.map((t) => (
            <PillBtn key={t.val} active={data.timeline === t.val} onClick={() => onChange({ timeline: t.val })}>
              {t.label}
            </PillBtn>
          ))}
        </div>
        {showTimelineError ? (
          <p id={idTimelineError} role="alert" aria-live="polite" style={errorMsgStyle}>Choose a closing timeline.</p>
        ) : (
          <p id={idTimelineHelp} style={helperStyle}>Helps us prioritize your file correctly. Exploring is fine; there's no pressure.</p>
        )}
      </div>

      <FieldGroup
        label="What best describes you?"
        helper="Helps us match the right program for your situation."
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
      <TrustBar text="No credit pull · no obligation. Your details are used to respond to this request." />

      {/* Consent — contact required, SMS optional (TCPA-safe, not pre-checked) */}
      <label
        style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, cursor: "pointer", fontSize: 12, color: swatch.midnight, lineHeight: 1.5 }}
      >
        <input
          ref={consentRef}
          type="checkbox"
          checked={data.contactConsent}
          onChange={(e) => onChange({ contactConsent: e.target.checked })}
          onBlur={() => markTouched("contactConsent")}
          aria-invalid={showConsentError ? true : undefined}
          aria-describedby={showConsentError ? idConsentError : undefined}
          style={{ marginTop: 1, width: 16, height: 16, accentColor: swatch.rainforest, flexShrink: 0 }}
        />
        <span>
          I agree to be contacted by Greenstreet Finance about my inquiry and accept the{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener" style={{ color: swatch.rainforest }}>Privacy Policy</a> and{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener" style={{ color: swatch.rainforest }}>Terms</a>.
        </span>
      </label>
      {showConsentError && (
        <p id={idConsentError} role="alert" aria-live="polite" style={{ ...errorMsgStyle, marginTop: -4, marginBottom: 10 }}>Agree to contact so we can respond to your request.</p>
      )}
      <label
        style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, cursor: "pointer", fontSize: 12, color: swatch.rainforest, lineHeight: 1.5 }}
      >
        <input
          type="checkbox"
          checked={data.smsConsent}
          onChange={(e) => onChange({ smsConsent: e.target.checked })}
          style={{ marginTop: 1, width: 16, height: 16, accentColor: swatch.rainforest, flexShrink: 0 }}
        />
        <span>Text me updates about my deal (optional). Msg &amp; data rates may apply; reply STOP to opt out.</span>
      </label>

      {submitError && <p id={idSubmitError} role="alert" aria-live="assertive" style={{ ...errorMsgStyle, fontSize: 13, margin: "0 0 14px" }}>{submitError}</p>}

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="qm-btn-secondary" style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className={`qm-btn-primary${shaking ? " qm-shake" : ""}`}
          style={!submitting ? btnPrimary : btnPrimaryDisabled}
          disabled={submitting}
          onClick={handleSubmit}
          onAnimationEnd={() => setShaking(false)}
          aria-describedby={submitError ? idSubmitError : submitAttempt > 0 && validationSummary ? idValidationSummary : undefined}
        >
          {submitting && <span className="qm-spinner" aria-hidden="true" />}
          {submitting ? "Sending…" : "Send my scenario for review →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────
function Step5({ name, onClose, headingId }: { name: string; onClose: () => void; headingId: string }) {
  const firstName = name.split(" ")[0] || "there";

  const handleBookTime = () => {
    trackEvent("cta_click", {
      cta_id: "qualification_schedule_call",
      placement: "qualification_confirmation",
      route: window.location.pathname,
    });
    onClose();
    window.history.pushState({}, "", "/rate-quiz");
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
        Your request was submitted. A Greenstreet specialist may contact you to discuss the assumptions and current options; response timing varies.
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
        This is not a loan approval, commitment, rate lock, or confirmed pricing. Any available terms require a separate provider review.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button className="qm-btn-primary" style={btnPrimary} onClick={handleBookTime}>
          Schedule a call with a specialist →
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
          I'll wait for the email — close
        </button>
      </div>
    </div>
  );
}

// ─── Focusable elements selector (for focus trap) ─────────────────────────────
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function QualifyModal({ open, onClose }: QualifyModalProps) {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<StepOneData>({
    propertyValue: 425000,
    loanAmount: 318750,
    rent: 3000,
    rate: 7,
    propertyType: null,
    investmentConfirmed: true,
  });
  const [step2, setStep2] = useState<StepTwoData>({
    purpose: null,
    state: "",
    ficoBand: null,
    borrowerType: null,
    experience: null,
  });
  const [step4, setStep4] = useState<StepFourData>({
    name: "",
    email: "",
    phone: "",
    role: null,
    timeline: null,
    contactConsent: false,
    smsConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // For returning focus on close
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const highestTrackedStepRef = useRef(1);

  // Unique id for the visible heading (aria-labelledby)
  const headingId = useId();

  // Inject animation CSS once
  useEffect(() => {
    ensureStyles();
  }, []);

  // Capture the focused element before opening, so we can restore it on close
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger?.isConnected) window.requestAnimationFrame(() => trigger.focus());
    };
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  // Autofocus first field on step 1 (or heading on other steps)
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      if (step === 1) return firstFieldRef.current?.focus();
      const heading = cardRef.current?.querySelector<HTMLElement>(`#${CSS.escape(headingId)}`);
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [open, step, headingId]);

  useEffect(() => {
    if (!open) setSubmitError("");
  }, [open]);

  // Reset to step 1 when closed
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      highestTrackedStepRef.current = 1;
      trackEvent("qualify_open", {
        source: "qualify_widget",
        route: window.location.pathname,
      });
    } else if (!open && wasOpenRef.current && step < 5) {
      trackEvent("qualify_abandon", {
        step_number: step,
        source: "qualify_widget",
      });
    }
    wasOpenRef.current = open;
  }, [open, step]);

  useEffect(() => {
    if (!open || step <= highestTrackedStepRef.current) return;
    trackEvent("qualify_step_complete", {
      step_number: step - 1,
      source: "qualify_widget",
    });

    if (step === 2) {
      const estimate = quickDscrEstimate(step1.propertyValue, step1.rent, step1.rate);
      trackEvent("dscr_calculation_complete", {
        dscr_band: dscrBand(estimate.dscr),
        ltv_band: ltvBand(step1.propertyValue, step1.loanAmount),
      });
    }
    if (step === 3) {
      const estimate = quickDscrEstimate(step1.propertyValue, step1.rent, step1.rate);
      trackEvent("qualification_complete", {
        result_category: estimate.tier.toLowerCase(),
      });
    }
    highestTrackedStepRef.current = step;
  }, [open, step, step1.loanAmount, step1.propertyValue, step1.rate, step1.rent]);

  // Esc to close + Tab focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusable = Array.from(
          cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => el.offsetParent !== null && !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!cardRef.current.contains(document.activeElement)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
          return;
        }
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
    const onFocusIn = (e: FocusEvent) => {
      const card = cardRef.current;
      if (!card || card.contains(e.target as Node)) return;
      const first = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE))
        .find((el) => el.offsetParent !== null && !el.hasAttribute("disabled"));
      (first ?? card).focus({ preventScroll: true });
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
    };
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

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    let responseStatus: number | undefined;
    // Use engine math for the persisted payload (matches the displayed result)
    const estimate = quickDscrEstimate(step1.propertyValue, step1.rent, step1.rate);
    const verdict = dscrVerdict(estimate.tier);
    const q = qualify(buildQualifyInput(step1, step2));

    const payload = {
      name: step4.name,
      email: step4.email,
      phone: step4.phone,
      role: step4.role,
      timeline: step4.timeline,
      // deal
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
      // engine result snapshot (frozen at submit — audit trail)
      dscr: estimate.dscr,
      verdict: verdict.headline,
      verdictTier: verdict.tier,
      qualify: {
        ltv: q.ltv,
        pitia: q.pitia,
        piMonthly: q.piMonthly,
        dscr: q.dscr,
        outcome: q.outcome,
        reasons: q.reasons,
        needsHumanReview: q.needsHumanReview,
      },
      // consent record (TCPA/ECOA audit)
      consent: {
        contact: step4.contactConsent,
        sms: step4.smsConsent,
        timestamp: new Date().toISOString(),
        policyVersion: "2026-06",
      },
      page: typeof window !== "undefined" ? window.location.pathname : "/",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      responseStatus = response.status;
      if (!response.ok) {
        throw new Error("lead_submission_rejected");
      }
      const result = (await response.json().catch(() => ({}))) as { leadId?: unknown };
      const leadId =
        typeof result.leadId === "string" && /^[A-Za-z0-9_-]{8,160}$/.test(result.leadId)
          ? result.leadId
          : "not_returned";
      trackEvent("lead_submitted", {
        lead_id: leadId,
        source: "qualify_widget",
        route: window.location.pathname,
      });
      setStep(5);
    } catch {
      trackEvent("lead_submit_error", {
        error_code: leadSubmitErrorCode(responseStatus),
        step_number: 4,
        source: "qualify_widget",
      });
      setSubmitError(responseStatus === 503
        ? "Scenario submission is temporarily unavailable. Your entries are still here; please try again later."
        : "We could not submit your scenario. Your entries are still here; please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="presentation"
      className="gs-qualify-modal-overlay"
      data-qualify-modal-overlay="true"
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
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="gs-qualify-modal-dialog"
        data-qualify-modal-dialog="true"
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
            submitError={submitError}
            headingId={headingId}
          />
        )}
        {step === 5 && <Step5 name={step4.name} onClose={onClose} headingId={headingId} />}
      </div>
    </div>,
    document.body
  );
}
