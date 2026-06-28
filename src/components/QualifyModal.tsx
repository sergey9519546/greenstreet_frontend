/**
 * QualifyModal — 5-step value-first micro-commitment lead funnel
 * Step 1: Live DSCR calculator (hook)
 * Step 2: Deal details (purpose / state / FICO)
 * Step 3: Personalized result (the value drop)
 * Step 4: Contact capture
 * Step 5: Confirmation
 *
 * PRESERVED: DSCR calc formula, Firestore leads submit + localStorage fallback,
 * trigger pill + window.openQualify + one-time auto-open + localStorage gate.
 *
 * ADDED: step-enter animation, progress bar transition, result reveal (count-up),
 * submit loading spinner, shake-on-error, DSCR color transition, pill hover states,
 * focus rings, trust signals, mobile-responsive padding.
 */
import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { swatch, font, radius } from "../theme";
import { quickDscrEstimate, qualify, fmtUsd } from "../engine";
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
// The modal delegates DSCR math to quickDscrEstimate. Displayed product terms
// still need the active Greenstreet product sheet before they can be quoted.

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
  const purposeContext: Record<Purpose, { strong: string; borderline: string; low: string }> = {
    purchase: {
      strong: "For a purchase at this DSCR, the scenario is worth a specialist review.",
      borderline: "Purchases at this DSCR may need tighter structure, reserve review, or a lower loan amount.",
      low: "A lower DSCR scenario needs product-sheet verification and compensating-factor review.",
    },
    "rate-term": {
      strong: "A rate-and-term refinance at this DSCR is worth checking against the current matrix.",
      borderline: "This DSCR may be workable for a rate-and-term refinance after program review.",
      low: "At this DSCR level, a rate & term refi may require compensating factors. A specialist can review your full picture.",
    },
    "cash-out": {
      strong: "A cash-out refinance at this DSCR has more room in the scenario, but overlays still matter.",
      borderline: "Cash-out refinances at this DSCR need LTV, FICO, reserve, and program review.",
      low: "Cash-out refinances require more cushion. A specialist can look at reducing the cash-out amount or LTV to hit threshold.",
    },
  };

  const ctx = purpose ? purposeContext[purpose] : null;

  switch (tier) {
    case "LIKELY_QUALIFIES":
      return {
        tier: "Strong",
        headline: "This scenario looks strong enough to review",
        detail: "Your modeled DSCR has room above the estimated payment. Program fit, pricing, and eligibility still require underwriting review.",
        purposeNote: ctx?.strong ?? "",
        nextStep: "Share your contact details and a Greenstreet specialist will review program fit, pricing assumptions, and required documentation.",
        color: swatch.emerald,
      };
    case "BORDERLINE":
      return {
        tier: "Review",
        headline: "This deal is close enough for review",
        detail: "Your modeled DSCR covers the estimated payment, but final outcome depends on product thresholds, verified rent, reserves, credit, and state rules.",
        purposeNote: ctx?.borderline ?? "",
        nextStep: "A Greenstreet specialist can confirm which programs may fit after reviewing the full scenario.",
        color: swatch.rainforest,
      };
    case "SPECIALIST_REQUIRED":
      return {
        tier: "Borderline",
        headline: "This deal may work with the right structure",
        detail: "Your modeled DSCR is below 1.0x. A specialist needs to check whether product guidelines, reserves, or a lower loan amount change the result.",
        purposeNote: ctx?.low ?? "A Greenstreet specialist can explore whether any current programs or structuring options apply.",
        nextStep: "A Greenstreet specialist can explore whether current programs or structuring options apply.",
        color: "#b8a820",
      };
    case "UNLIKELY":
    default:
      return {
        tier: "Below Threshold",
        headline: "This deal needs restructuring",
        detail: "Your current numbers are below a clean DSCR scenario. A lower loan amount, verified higher rent, or different structure may be required.",
        purposeNote: ctx?.low ?? "A specialist can assess whether a restructured deal changes the picture.",
        nextStep: "A Greenstreet specialist can walk through what adjustments would change the model. No commitment required.",
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
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error ? (
        <p style={errorMsgStyle}>{error}</p>
      ) : helper ? (
        <p style={helperStyle}>{helper}</p>
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
        Check a preliminary DSCR scenario
      </h2>
      <p
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 24,
          marginTop: 0,
        }}
      >
        No hard credit pull at this step &middot; product terms verified by specialist review
      </p>

      {/* Loan purpose — first question, sets context for all results */}
      <FieldGroup
        label="What do you want to do with this property?"
        helper={
          step2.purpose === "cash-out"
            ? "Cash-out refinance — replace your loan with a larger one and take the difference in cash. Pricing is slightly higher than a purchase."
            : step2.purpose === "rate-term"
            ? "Rate & term refinance — replace your current loan to change the rate or term, without taking cash out."
            : "Are you buying it, refinancing for a better rate, or pulling cash out? Each has different pricing and programs."
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
        helper="DSCR loans model whether the property's rent can cover the loan payment. Property type can affect eligibility, documentation, down payment, reserves, and pricing."
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
          step={250}
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
              ? " — higher leverage may limit programs. Try reducing the loan amount."
              : ". Product LTV caps and pricing require current product-sheet verification."}
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
          Your best guess at the note rate, used only to estimate the monthly payment. A specialist must verify current pricing from the active rate sheet before any quote is issued.
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
          ? `Your ${purposeLabel[data.purpose]} — these fields let us tailor your rate estimate and flag any state-level rules.`
          : "These details let us tailor your rate estimate and flag any state-level rules that affect your deal."}
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
        helper="We do not run a hard credit pull here. A rough range helps route the scenario; final pricing and minimum down payment depend on verified credit and current product guidelines."
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
        helper="Entity and individual vesting rules vary by product and state. This affects title, documentation, compliance review, and possibly pricing."
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
        helper="Experience can affect program fit and reserve overlays. First-time investors may still be reviewable depending on product guidelines."
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
          PITIA is the full monthly payment — principal, interest, taxes, insurance, and any HOA dues. Your DSCR = ${fmtUsd(step1.rent)} rent ÷ {fmtUsd(q.pitia)} PITIA = {(step1.rent / q.pitia).toFixed(2)}x.
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
          Pricing status
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
          [VERIFY: current rate sheet]
        </div>
        <p style={{ fontSize: 12, color: swatch.rainforest, margin: 0 }}>
          Based on credit {step2.ficoBand ?? "range"},{" "}
          {step2.purpose ? purposeLabel[step2.purpose].toLowerCase() : "your loan type"},{" "}
          {step2.state || "your state"}. A specialist must verify pricing, product fit, and state eligibility before quoting.
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
        Preliminary model only — not a loan approval, commitment to lend, rate quote, or credit decision. Subject to product-sheet verification, documentation, state eligibility, and full underwriting review.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="qm-btn-secondary" style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button className="qm-btn-primary" style={btnPrimary} onClick={onNext}>
          Get my full scenario review →
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
  headingId,
}: {
  data: StepFourData;
  onChange: (d: Partial<StepFourData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
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
        A Greenstreet specialist will review your numbers and follow up with the next review step. Your information is used to prepare the scenario review; no hard credit pull is performed at this step.
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
          style={touched.name && !nameValid ? inputErrorStyle : inputStyle}
          autoComplete="name"
        />
        {touched.name && !nameValid && (
          <p style={errorMsgStyle}>Please enter your full name.</p>
        )}
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
          style={touched.email && !emailValid ? inputErrorStyle : inputStyle}
          autoComplete="email"
          required
        />
        {touched.email && !emailValid ? (
          <p style={errorMsgStyle}>Please enter a valid email address.</p>
        ) : (
          <p style={helperStyle}>We'll send your quote here.</p>
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
      <TrustBar text="No credit pull · no obligation · no spam. Your details are used only to prepare your quote." />

      {/* Consent — contact required, SMS optional (TCPA-safe, not pre-checked) */}
      <label
        style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, cursor: "pointer", fontSize: 12, color: swatch.midnight, lineHeight: 1.5 }}
      >
        <input
          type="checkbox"
          checked={data.contactConsent}
          onChange={(e) => onChange({ contactConsent: e.target.checked })}
          style={{ marginTop: 1, width: 16, height: 16, accentColor: swatch.rainforest, flexShrink: 0 }}
        />
        <span>
          I agree to be contacted by Greenstreet Finance about my inquiry and accept the{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener" style={{ color: swatch.rainforest }}>Privacy Policy</a> and{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener" style={{ color: swatch.rainforest }}>Terms</a>.
        </span>
      </label>
      {touched.submit && !data.contactConsent && (
        <p style={{ ...errorMsgStyle, marginTop: -4, marginBottom: 10 }}>Please agree to be contacted so we can send your result.</p>
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
          {submitting ? "Sending…" : "Send my scenario — get a specialist review →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────
function Step5({ name, onClose, headingId }: { name: string; onClose: () => void; headingId: string }) {
  const firstName = name.split(" ")[0] || "there";

  const handleBookTime = () => {
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
        A Greenstreet specialist will review your numbers, check program fit, and send you a scenario response after the required product, documentation, and state checks. No obligation.
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
        This is not a loan approval, rate quote, or commitment to lend. Any pricing or terms must come from a full review of your scenario.
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

  // Reset to step 1 when closed
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

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

  const handleSubmit = async () => {
    setSubmitting(true);
    // Use engine math for the persisted payload (matches the displayed result)
    const estimate = quickDscrEstimate(step1.propertyValue, step1.rent, step1.rate);
    const verdict = dscrVerdict(estimate.tier);
    const rateEstimate = "[VERIFY: current rate sheet]";
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
      rateEstimate,
      qualify: {
        ltv: q.ltv,
        pitia: q.pitia,
        piMonthly: q.piMonthly,
        dscr: q.dscr,
        outcome: q.outcome,
        reasons: q.reasons,
        rateRange: "[VERIFY: current rate sheet]",
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
      createdAt: new Date().toISOString(),
      // (lead persists to Firestore `leads` below; CRM/email sync is a future add)
    };

    try {
      // Firebase is imported lazily so its ~524 kB client SDK is NOT pulled into
      // the initial bundle (QualifyModal mounts globally on the home page). It
      // loads only when a visitor actually submits a lead.
      const [{ db }, { collection, addDoc }] = await Promise.all([
        import("../firebase"),
        import("firebase/firestore"),
      ]);
      await addDoc(collection(db, "leads"), payload);
    } catch (err) {
      console.warn(
        "[QualifyModal] Firestore write failed, falling back to localStorage:",
        err
      );
      try {
        const existing = JSON.parse(localStorage.getItem("gs_leads") || "[]");
        existing.push(payload);
        localStorage.setItem("gs_leads", JSON.stringify(existing));
      } catch (_) {
        // localStorage unavailable — silently swallow
      }
    } finally {
      setSubmitting(false);
      setStep(5);
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
            headingId={headingId}
          />
        )}
        {step === 5 && <Step5 name={step4.name} onClose={onClose} headingId={headingId} />}
      </div>
    </div>
  );
}
