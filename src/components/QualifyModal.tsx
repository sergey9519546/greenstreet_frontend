/**
 * QualifyModal — 5-step value-first micro-commitment lead funnel
 * Step 1: Live DSCR calculator (hook)
 * Step 2: Deal details (purpose / state / FICO)
 * Step 3: Personalized result (the value drop)
 * Step 4: Contact capture
 * Step 5: Confirmation
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

// ─── DSCR Formula ─────────────────────────────────────────────────────────────
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

function dscrVerdict(dscr: number): { text: string; color: string } {
  if (dscr >= 1.0)
    return { text: "You likely qualify ✓", color: swatch.emerald };
  if (dscr >= 0.85)
    return {
      text: "You likely qualify — with the right structure",
      color: "#b8b820",
    };
  return {
    text: "Let's find a structure that works",
    color: swatch.rainforest,
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

// ─── Shared sub-components ────────────────────────────────────────────────────
const TOTAL_STEPS = 5;

function ProgressBar({ step }: { step: number }) {
  return (
    <div
      style={{
        height: 4,
        background: swatch.mint,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(step / TOTAL_STEPS) * 100}%`,
          background: swatch.lemon,
          borderRadius: 4,
          transition: "width 0.35s ease",
        }}
      />
    </div>
  );
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
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
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: font.semibold,
  color: swatch.rainforest,
  marginBottom: 2,
  letterSpacing: "0.02em",
};

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
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
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 28px",
  borderRadius: radius.sm,
  background: swatch.lemon,
  color: swatch.midnight,
  border: "none",
  fontFamily: font.family,
  fontWeight: font.bold,
  fontSize: 15,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 20px",
  borderRadius: radius.sm,
  background: "transparent",
  color: swatch.rainforest,
  border: `1.5px solid ${swatch.mint}`,
  fontFamily: font.family,
  fontWeight: font.semibold,
  fontSize: 14,
  cursor: "pointer",
};

// ─── Step 1 — Hook (live DSCR) ────────────────────────────────────────────────
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
  const label =
    dscr >= 1.25
      ? "Strong cash flow"
      : dscr >= 1.0
      ? "Qualifying DSCR"
      : dscr >= 0.85
      ? "Near qualifying"
      : "Below threshold";

  return (
    <div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 4,
          marginTop: 0,
        }}
      >
        See if your deal qualifies
      </h2>
      <p
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 24,
          marginTop: 0,
        }}
      >
        60 seconds &middot; no credit pull &middot; no obligation
      </p>

      <FieldGroup label="Property value ($)">
        <input
          ref={firstFieldRef as React.RefObject<HTMLInputElement>}
          type="number"
          value={data.propertyValue}
          min={50000}
          step={5000}
          onChange={(e) => onChange({ propertyValue: Number(e.target.value) })}
          style={inputStyle}
        />
      </FieldGroup>
      <FieldGroup label="Expected monthly rent ($)">
        <input
          type="number"
          value={data.rent}
          min={0}
          step={50}
          onChange={(e) => onChange({ rent: Number(e.target.value) })}
          style={inputStyle}
        />
      </FieldGroup>
      <FieldGroup label="Note rate (%)">
        <input
          type="number"
          value={data.rate}
          min={2}
          max={20}
          step={0.125}
          onChange={(e) => onChange({ rate: Number(e.target.value) })}
          style={inputStyle}
        />
      </FieldGroup>

      {/* Live DSCR readout */}
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
            Live DSCR
          </div>
          <div
            style={{
              fontSize: 36,
              fontFamily: font.mono,
              fontWeight: 700,
              color: col,
              lineHeight: 1,
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
            maxWidth: 130,
          }}
        >
          {label}
        </div>
      </div>

      <button style={btnPrimary} onClick={onNext}>
        Next →
      </button>
    </div>
  );
}

// ─── Step 2 — Deal details ────────────────────────────────────────────────────
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
  const purposes: { val: Purpose; label: string }[] = [
    { val: "purchase", label: "Purchase" },
    { val: "rate-term", label: "Rate-term refi" },
    { val: "cash-out", label: "Cash-out" },
  ];
  const ficos: { val: FicoBand; label: string }[] = [
    { val: "under-680", label: "Under 680" },
    { val: "680-719", label: "680–719" },
    { val: "720-759", label: "720–759" },
    { val: "760-plus", label: "760+" },
  ];

  return (
    <div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: font.bold,
          color: swatch.midnight,
          marginBottom: 20,
          marginTop: 0,
        }}
      >
        A few more details
      </h2>

      <FieldGroup label="Loan purpose">
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

      <FieldGroup label="Property state">
        <select
          value={data.state}
          onChange={(e) => onChange({ state: e.target.value })}
          style={{ ...inputStyle, marginTop: 4 }}
        >
          <option value="">Select state…</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup label="Borrower FICO band">
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
        <button style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button style={btnPrimary} onClick={onNext}>
          See my result →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 — Result ─────────────────────────────────────────────────────────
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

  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: font.semibold,
          color: swatch.rainforest,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 8,
          marginTop: 0,
        }}
      >
        Your result
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
        Here's how your deal stacks up
      </h2>

      {/* DSCR display */}
      <div
        style={{
          background: swatch.mint,
          borderRadius: radius.sm,
          padding: "20px 24px",
          marginBottom: 16,
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
          DSCR
        </div>
        <div
          style={{
            fontSize: 48,
            fontFamily: font.mono,
            fontWeight: 700,
            color: col,
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {dscr.toFixed(2)}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: font.semibold,
            color: verdict.color,
          }}
        >
          {verdict.text}
        </div>
      </div>

      {/* Rate estimate */}
      <div
        style={{
          background: "#fff",
          borderRadius: radius.sm,
          border: `1.5px solid ${swatch.mint}`,
          padding: "16px 20px",
          marginBottom: 16,
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
          Estimated rate (indicative)
        </div>
        <div
          style={{
            fontSize: 26,
            fontFamily: font.mono,
            fontWeight: 700,
            color: swatch.midnight,
          }}
        >
          {rate}
        </div>
        <div style={{ fontSize: 12, color: swatch.rainforest, marginTop: 4 }}>
          Subject to underwriting · not a commitment to lend
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: swatch.rainforest,
          marginBottom: 24,
          padding: "10px 14px",
          background: swatch.mint,
          borderRadius: radius.sm,
        }}
      >
        Matched to Greenstreet DSCR programs.
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button style={btnPrimary} onClick={onNext}>
          Get my personalized quote →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Contact capture ─────────────────────────────────────────────────
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
  const roles: { val: Role; label: string }[] = [
    { val: "broker", label: "Broker" },
    { val: "investor", label: "Investor" },
  ];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());

  return (
    <div>
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
        A Greenstreet specialist will prepare your personalized quote.
      </p>

      <FieldGroup label="Full name">
        <input
          type="text"
          value={data.name}
          placeholder="Jane Smith"
          onChange={(e) => onChange({ name: e.target.value })}
          style={inputStyle}
          autoComplete="name"
        />
      </FieldGroup>

      <FieldGroup label="Work email *">
        <input
          type="email"
          value={data.email}
          placeholder="jane@brokerage.com"
          onChange={(e) => onChange({ email: e.target.value })}
          style={{
            ...inputStyle,
            borderColor: data.email && !emailValid ? "#c25b4e" : swatch.mint,
          }}
          autoComplete="email"
          required
        />
      </FieldGroup>

      <FieldGroup label="Phone (optional)">
        <input
          type="tel"
          value={data.phone}
          placeholder="(555) 000-0000"
          onChange={(e) => onChange({ phone: e.target.value })}
          style={inputStyle}
          autoComplete="tel"
        />
      </FieldGroup>

      <FieldGroup label="I am a">
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
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

      <p
        style={{
          fontSize: 12,
          color: swatch.rainforest,
          margin: "4px 0 24px",
        }}
      >
        No credit pull. We'll only use this to prepare your quote.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button style={btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button
          style={{
            ...btnPrimary,
            opacity: emailValid && !submitting ? 1 : 0.45,
            cursor: emailValid && !submitting ? "pointer" : "not-allowed",
          }}
          disabled={!emailValid || submitting}
          onClick={onSubmit}
        >
          {submitting ? "Sending…" : "Get my quote →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────
function Step5({ onClose }: { onClose: () => void }) {
  const handleBookTime = () => {
    onClose();
    window.history.pushState({}, "", "/rate-quiz");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
      <div
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
          marginBottom: 10,
          marginTop: 0,
        }}
      >
        You're in ✓
      </h2>
      <p style={{ fontSize: 15, color: swatch.rainforest, marginBottom: 28 }}>
        A Greenstreet specialist will reach out within 1 business day.
      </p>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
      >
        <button
          onClick={handleBookTime}
          style={{
            background: "none",
            border: "none",
            color: swatch.rainforest,
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: font.family,
          }}
        >
          Prefer to talk now? Book a time →
        </button>
        <button style={btnPrimary} onClick={onClose}>
          Done
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

  // Autofocus first field
  useEffect(() => {
    if (open && step === 1) {
      setTimeout(() => firstFieldRef.current?.focus(), 80);
    }
  }, [open, step]);

  // Reset to step 1 when closed (so next open is fresh)
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
      verdict: verdict.text,
      rateEstimate,
      page: typeof window !== "undefined" ? window.location.pathname : "/",
      createdAt: new Date().toISOString(),
      // TODO: production lead endpoint / CRM
    };

    try {
      await addDoc(collection(db, "leads"), payload);
    } catch (err) {
      console.warn("[QualifyModal] Firestore write failed, falling back to localStorage:", err);
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
      aria-label="See if you qualify"
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
        {step === 5 && <Step5 onClose={onClose} />}
      </div>
    </div>
  );
}
