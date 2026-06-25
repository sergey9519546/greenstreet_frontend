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
import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { swatch, font, radius } from "../theme";

// ─── Types ────────────────────────────────────────────────────────────────────
type Purpose = "purchase" | "rate-term" | "cash-out";
type FicoBand = "under-680" | "680-719" | "720-759" | "760-plus";
type Role = "broker" | "investor";

interface StepOneData {
  propertyValue: number;
  rent: number;
  rate: number;
}
interface StepTwoData {
  purpose: Purpose | null;
  state: string;
  ficoBand: FicoBand | null;
}
interface StepFourData {
  name: string;
  email: string;
  phone: string;
  role: Role | null;
}

// ─── DSCR Formula (PRESERVED) ─────────────────────────────────────────────────
function calcDSCR(value: number, rent: number, rate: number): number {
  const loan = value * 0.75;
  const r = rate / 100 / 12;
  const pi =
    r > 0
      ? (loan * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1)
      : loan / 360;
  const taxesMo = (value * 0.012) / 12;
  const insMo = (value * 0.0035) / 12;
  const pitia = pi + taxesMo + insMo;
  return pitia > 0 ? Math.round((rent / pitia) * 100) / 100 : 0;
}

function dscrColor(dscr: number): string {
  if (dscr >= 1.25) return swatch.emerald;
  if (dscr >= 1.0) return swatch.rainforest;
  if (dscr >= 0.85) return swatch.lemon;
  return "#c25b4e";
}

function dscrVerdict(dscr: number): {
  tier: string;
  headline: string;
  detail: string;
  color: string;
} {
  if (dscr >= 1.25)
    return {
      tier: "Strong",
      headline: "This deal looks solid",
      detail:
        "Your DSCR clears our standard threshold. You're in a good position to move forward.",
      color: swatch.emerald,
    };
  if (dscr >= 1.0)
    return {
      tier: "Qualifying",
      headline: "This deal qualifies",
      detail:
        "Your DSCR meets our minimum. A specialist can confirm terms and get you to closing.",
      color: swatch.rainforest,
    };
  if (dscr >= 0.85)
    return {
      tier: "Borderline",
      headline: "This deal may work with the right structure",
      detail:
        "Your DSCR is just below standard threshold, but there are DSCR programs that accommodate this range. A specialist can explore options.",
      color: "#b8a820",
    };
  return {
    tier: "Below Threshold",
    headline: "This deal needs restructuring",
    detail:
      "Your current numbers don't meet standard DSCR requirements, but there may be alternative structures worth discussing with a specialist.",
    color: "#c25b4e",
  };
}

function estimateRate(
  baseDSCR: number,
  ficoBand: FicoBand | null,
  purpose: Purpose | null
): string {
  let base = 6.5;
  // FICO adjustments
  if (ficoBand === "under-680") base += 1.25;
  else if (ficoBand === "680-719") base += 0.75;
  else if (ficoBand === "720-759") base += 0.25;
  // else 760+ stays at base
  // Purpose adjustments
  if (purpose === "cash-out") base += 0.375;
  else if (purpose === "rate-term") base += 0.0;
  // DSCR adjustment — sub-1.0 carries a spread
  if (baseDSCR < 1.0) base += 0.5;
  const lo = (base - 0.125).toFixed(2);
  const hi = (base + 0.25).toFixed(2);
  return `${lo}% – ${hi}%`;
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
  @media (max-width: 420px) {
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

// ─── Step 1 — Live DSCR Calculator ────────────────────────────────────────────
function Step1({
  data,
  onChange,
  onNext,
  firstFieldRef,
}: {
  data: StepOneData;
  onChange: (d: Partial<StepOneData>) => void;
  onNext: () => void;
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
}) {
  const dscr = calcDSCR(data.propertyValue, data.rent, data.rate);
  const col = dscrColor(dscr);

  // Track whether CTA was clicked while invalid (for shake)
  const [shaking, setShaking] = useState(false);

  const dscrLabel =
    dscr >= 1.25
      ? "Strong cash flow"
      : dscr >= 1.0
      ? "Qualifies at standard terms"
      : dscr >= 0.85
      ? "Near qualifying — options available"
      : "Below standard threshold";

  const isValid =
    data.propertyValue >= 50000 && data.rent > 0 && data.rate > 0;

  const handleNext = () => {
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
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 4,
          marginTop: 0,
        }}
      >
        Check your deal in 60 seconds
      </h2>
      <p
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 24,
          marginTop: 0,
        }}
      >
        No credit pull &middot; no obligation &middot; instant estimate
      </p>

      <FieldGroup
        label="Property value"
        helper="The purchase price or current appraised value of the property."
      >
        <input
          ref={firstFieldRef as React.RefObject<HTMLInputElement>}
          type="number"
          value={data.propertyValue}
          min={50000}
          step={5000}
          onChange={(e) => onChange({ propertyValue: Number(e.target.value) })}
          className="qm-input"
          style={inputStyle}
        />
      </FieldGroup>

      <FieldGroup
        label="Expected monthly rent"
        helper="The gross rent you expect the property to generate each month."
      >
        <input
          type="number"
          value={data.rent}
          min={0}
          step={50}
          onChange={(e) => onChange({ rent: Number(e.target.value) })}
          className="qm-input"
          style={inputStyle}
        />
      </FieldGroup>

      <FieldGroup
        label="Estimated interest rate (%)"
        helper="Your best estimate of the note rate. You can refine this later."
      >
        <input
          type="number"
          value={data.rate}
          min={2}
          max={20}
          step={0.125}
          onChange={(e) => onChange({ rate: Number(e.target.value) })}
          className="qm-input"
          style={inputStyle}
        />
      </FieldGroup>

      {/* Live DSCR readout — color transitions smoothly */}
      <div
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
            Your DSCR
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
          {dscrLabel}
        </div>
      </div>

      <button
        className={`qm-btn-primary${shaking ? " qm-shake" : ""}`}
        style={isValid ? btnPrimary : btnPrimaryDisabled}
        disabled={!isValid}
        onClick={handleNext}
        onAnimationEnd={() => setShaking(false)}
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2 — Deal Details ────────────────────────────────────────────────────
function Step2({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: StepTwoData;
  onChange: (d: Partial<StepTwoData>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [attempted, setAttempted] = useState(false);
  const [shaking, setShaking] = useState(false);

  const purposes: { val: Purpose; label: string }[] = [
    { val: "purchase", label: "Purchase" },
    { val: "rate-term", label: "Rate & term refi" },
    { val: "cash-out", label: "Cash-out refi" },
  ];
  const ficos: { val: FicoBand; label: string }[] = [
    { val: "under-680", label: "Below 680" },
    { val: "680-719", label: "680–719" },
    { val: "720-759", label: "720–759" },
    { val: "760-plus", label: "760 or above" },
  ];

  const isValid =
    data.purpose !== null && data.state !== "" && data.ficoBand !== null;

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
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        Tell us about the deal
      </h2>
      <p style={{ fontSize: 13, color: swatch.rainforest, marginBottom: 24, marginTop: 0 }}>
        These details let us tailor your rate estimate to your specific scenario.
      </p>

      <FieldGroup
        label="Loan purpose"
        helper="What type of transaction is this?"
        error={attempted && !data.purpose ? "Please select a loan purpose." : undefined}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {purposes.map((p) => (
            <PillBtn
              key={p.val}
              active={data.purpose === p.val}
              onClick={() => onChange({ purpose: p.val })}
            >
              {p.label}
            </PillBtn>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="Property state"
        helper="Some states have lender-specific overlays that affect available programs."
        error={attempted && !data.state ? "Please select the property state." : undefined}
      >
        <select
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
      </FieldGroup>

      <FieldGroup
        label="Borrower credit score range"
        helper="An estimate is fine. This affects your rate tier — we don't pull credit here."
        error={attempted && !data.ficoBand ? "Please select a credit score range." : undefined}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
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
}: {
  step1: StepOneData;
  step2: StepTwoData;
  onBack: () => void;
  onNext: () => void;
}) {
  const dscr = calcDSCR(step1.propertyValue, step1.rent, step1.rate);
  const col = dscrColor(dscr);
  const verdict = dscrVerdict(dscr);
  const rate = estimateRate(dscr, step2.ficoBand, step2.purpose);

  // Animated count-up for the big DSCR number
  const displayDscr = useCountUp(dscr, 520);

  const purposeLabel: Record<Purpose, string> = {
    purchase: "Purchase",
    "rate-term": "Rate & term refi",
    "cash-out": "Cash-out refi",
  };

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
        Your preliminary estimate
      </p>
      <h2
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

      {/* DSCR + verdict — reveals with scale-in */}
      <div
        className="qm-result-reveal"
        style={{
          background: swatch.mint,
          borderRadius: radius.sm,
          padding: "20px 24px",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 8 }}>
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
              DSCR
            </div>
            <div
              style={{
                fontSize: 48,
                fontFamily: font.mono,
                fontWeight: 700,
                color: col,
                lineHeight: 1,
              }}
            >
              {displayDscr.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: font.bold,
              color: verdict.color,
              paddingBottom: 4,
            }}
          >
            {verdict.tier}
          </div>
        </div>
        <p
          style={{
            fontSize: 13,
            color: swatch.midnight,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {verdict.detail}
        </p>
      </div>

      {/* Rate estimate */}
      <div
        style={{
          background: "#fff",
          borderRadius: radius.sm,
          border: `1.5px solid ${swatch.mint}`,
          padding: "16px 20px",
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
          Indicative rate range
        </div>
        <div
          style={{
            fontSize: 28,
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
          Based on {step2.ficoBand ? `credit score ${step2.ficoBand}` : "your credit range"},{" "}
          {step2.purpose ? purposeLabel[step2.purpose].toLowerCase() : "your loan type"},{" "}
          {step2.state || "your state"}.
        </p>
      </div>

      {/* Compliance + what happens next */}
      <div
        style={{
          fontSize: 12,
          color: swatch.rainforest,
          marginBottom: 24,
          padding: "10px 14px",
          background: swatch.mint,
          borderRadius: radius.sm,
          lineHeight: 1.55,
        }}
      >
        <strong style={{ display: "block", marginBottom: 3 }}>What happens next</strong>
        Share your contact details and a Greenstreet specialist will review your
        scenario and send you a detailed quote — typically within one business day.
        <br />
        <span style={{ opacity: 0.75, marginTop: 6, display: "block" }}>
          Preliminary estimate based on the figures you entered. Not a commitment to lend
          or a credit decision. Subject to underwriting review.
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="qm-btn-secondary" style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button className="qm-btn-primary" style={btnPrimary} onClick={onNext}>
          Unlock my full quote →
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
}: {
  data: StepFourData;
  onChange: (d: Partial<StepFourData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [shaking, setShaking] = useState(false);

  const roles: { val: Role; label: string; helper: string }[] = [
    { val: "broker", label: "Mortgage broker", helper: "I submit deals on behalf of clients." },
    { val: "investor", label: "Real-estate investor", helper: "I own or am acquiring the property." },
  ];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  const nameValid = data.name.trim().length >= 2;
  const isValid = nameValid && emailValid;

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = () => {
    setTouched({ name: true, email: true });
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
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        Where should we send your quote?
      </h2>
      <p style={{ fontSize: 13, color: swatch.rainforest, marginBottom: 24, marginTop: 0 }}>
        A Greenstreet specialist will review your scenario and follow up within
        one business day. Your information is only used to prepare your quote.
      </p>

      <FieldGroup
        label="Full name"
        error={touched.name && !nameValid ? "Please enter your full name." : undefined}
      >
        <input
          type="text"
          value={data.name}
          placeholder="Jane Smith"
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => markTouched("name")}
          className="qm-input"
          style={touched.name && !nameValid ? inputErrorStyle : inputStyle}
          autoComplete="name"
        />
      </FieldGroup>

      <FieldGroup
        label="Work email"
        helper={!touched.email || emailValid ? "We'll send your quote here." : undefined}
        error={touched.email && !emailValid ? "Please enter a valid email address." : undefined}
      >
        <input
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
      </FieldGroup>

      <FieldGroup
        label="Phone number (optional)"
        helper="Prefer a call? Add your number and we'll reach out directly."
      >
        <input
          type="tel"
          value={data.phone}
          placeholder="(555) 000-0000"
          onChange={(e) => onChange({ phone: e.target.value })}
          className="qm-input"
          style={inputStyle}
          autoComplete="tel"
        />
      </FieldGroup>

      <FieldGroup
        label="I am a"
        helper="Helps us tailor the right program for your situation."
      >
        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
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
          {submitting ? "Sending…" : "Send my quote request →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────
function Step5({ name, onClose }: { name: string; onClose: () => void }) {
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
        A Greenstreet specialist will review your scenario and be in touch
        within one business day.
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
        This is not a loan approval or commitment to lend. Your quote will be
        based on a full review of your scenario.
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

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function QualifyModal({ open, onClose }: QualifyModalProps) {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<StepOneData>({
    propertyValue: 425000,
    rent: 3000,
    rate: 7,
  });
  const [step2, setStep2] = useState<StepTwoData>({
    purpose: null,
    state: "",
    ficoBand: null,
  });
  const [step4, setStep4] = useState<StepFourData>({
    name: "",
    email: "",
    phone: "",
    role: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Inject animation CSS once
  useEffect(() => {
    ensureStyles();
  }, []);

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

  // Autofocus first field on step 1
  useEffect(() => {
    if (open && step === 1) {
      setTimeout(() => firstFieldRef.current?.focus(), 80);
    }
  }, [open, step]);

  // Reset to step 1 when closed
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
    const dscr = calcDSCR(step1.propertyValue, step1.rent, step1.rate);
    const verdict = dscrVerdict(dscr);
    const rateEstimate = estimateRate(dscr, step2.ficoBand, step2.purpose);

    const payload = {
      name: step4.name,
      email: step4.email,
      phone: step4.phone,
      role: step4.role,
      propertyValue: step1.propertyValue,
      rent: step1.rent,
      rate: step1.rate,
      purpose: step2.purpose,
      state: step2.state,
      ficoBand: step2.ficoBand,
      dscr,
      verdict: verdict.headline,
      verdictTier: verdict.tier,
      rateEstimate,
      page: typeof window !== "undefined" ? window.location.pathname : "/",
      createdAt: new Date().toISOString(),
      // TODO: production lead endpoint / CRM
    };

    try {
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
      aria-label="Check if your deal qualifies"
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
          />
        )}
        {step === 2 && (
          <Step2
            data={step2}
            onChange={(d) => setStep2((p) => ({ ...p, ...d }))}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            step1={step1}
            step2={step2}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <Step4
            data={step4}
            onChange={(d) => setStep4((p) => ({ ...p, ...d }))}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
        {step === 5 && <Step5 name={step4.name} onClose={onClose} />}
      </div>
    </div>
  );
}
