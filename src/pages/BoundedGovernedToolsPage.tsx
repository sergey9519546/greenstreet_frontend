import React, { useEffect, useMemo, useState } from "react";
import { calculatePI } from "../engine";
import type { LoanRequestDraft, LoanPurpose } from "../conversion/loanRequest";
import { Btn, DcShell, H1, Lead, Mono, dc } from "../design/dc";

export type GovernedTool =
  | "rate-quiz"
  | "state-laws"
  | "decision-support"
  | "str-underwriting"
  | "tax-engine";

export const GOVERNED_TOOL_CONTENT: Record<
  GovernedTool,
  { title: string; lead: string; label: string; note: string }
> = {
  "rate-quiz": {
    label: "Loan profile organizer",
    title: "Organize the facts behind your loan request.",
    lead:
      "Answer five factual questions to create a cleaner starting brief. This organizer does not generate a rate, choose a program, or determine eligibility.",
    note:
      "Your answers are a preparation aid, not a quote, approval, rate lock, or commitment to lend.",
  },
  "state-laws": {
    label: "State verification checklist",
    title: "Prepare the state-specific questions your transaction needs.",
    lead:
      "Record the transaction facts that can change the review, then use the generated checklist to verify them with current official sources and qualified counsel.",
    note:
      "This checklist does not state the law, determine licensing, interpret a prepayment provision, or provide legal advice.",
  },
  "decision-support": {
    label: "Deal arithmetic",
    title: "See the financing facts without a hidden verdict.",
    lead:
      "Use your own assumptions to calculate payment coverage, loan-to-value, reserve months, and simple monthly cash flow. The tool does not issue a GO signal, rank providers, or predict approval.",
    note:
      "Arithmetic is illustrative. Provider definitions, permitted income, expenses, reserves, rates, terms, and eligibility require current review.",
  },
  "str-underwriting": {
    label: "STR rent comparison",
    title: "Compare three rent views against one entered payment.",
    lead:
      "Model long-term, projected short-term, and documented rent with your own haircuts and seasonality assumption. You choose the scenario; the tool does not decide which rent a provider will accept.",
    note:
      "This comparison does not determine permitted use, legality, provider-accepted income, appraisal treatment, or eligibility.",
  },
  "tax-engine": {
    label: "Basis illustration",
    title: "Illustrate straight-line depreciation from your assumptions.",
    lead:
      "Enter the basis, land allocation, recovery period, and marginal rate you want to model. The output is transparent arithmetic, not a current-law eligibility determination or tax advice.",
    note:
      "Tax basis, land allocation, recovery period, deductions, timing, limitations, and tax treatment should be verified with a qualified tax professional.",
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

const nonNegative = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

export type LoanProfileInput = {
  purpose: string;
  propertyType: string;
  propertyValue: number;
  loanAmount: number;
  monthlyRent: number;
  assumedRatePct: number;
  occupancyEvidence: string;
  borrowerFileStatus: string;
};

export type LoanProfileSummary = {
  facts: string[];
  missing: string[];
};

export function buildLoanProfile(input: LoanProfileInput): LoanProfileSummary {
  const facts: string[] = [];
  const missing: string[] = [];

  if (input.purpose) facts.push(`Loan purpose: ${input.purpose}.`);
  else missing.push("Loan purpose");
  if (input.propertyType) facts.push(`Property type: ${input.propertyType}.`);
  else missing.push("Property type");

  const figures: string[] = [];
  if (input.propertyValue > 0)
    figures.push(`property value ${formatMoney(input.propertyValue)}`);
  if (input.loanAmount > 0)
    figures.push(`requested loan ${formatMoney(input.loanAmount)}`);
  if (input.monthlyRent > 0)
    figures.push(`monthly rent ${formatMoney(input.monthlyRent)}`);
  if (input.assumedRatePct >= 0 && Number.isFinite(input.assumedRatePct))
    figures.push(`user-entered rate assumption ${formatPercent(input.assumedRatePct)}`);
  if (figures.length > 0) facts.push(`Entered figures: ${figures.join("; ")}.`);
  else missing.push("Property and loan figures");

  if (input.occupancyEvidence)
    facts.push(`Rent / occupancy evidence available: ${input.occupancyEvidence}.`);
  else missing.push("Rent or occupancy evidence");
  if (input.borrowerFileStatus)
    facts.push(`Borrower file status: ${input.borrowerFileStatus}.`);
  else missing.push("Borrower file status");

  return { facts, missing };
}

export type StateVerificationInput = {
  state: string;
  entityOrVesting: string;
  purpose: string;
  prepaymentRequest: string;
  targetDate: string;
};

export type StateVerificationOutput = {
  recordedFacts: string[];
  checklist: string[];
  officialSearchPrompts: string[];
};

export function buildStateVerificationChecklist(
  input: StateVerificationInput,
): StateVerificationOutput {
  const state = input.state.trim();
  const recordedFacts = [
    state ? `Property state: ${state}.` : "Property state: not entered.",
    input.entityOrVesting.trim()
      ? `Entity or vesting: ${input.entityOrVesting.trim()}.`
      : "Entity or vesting: not entered.",
    input.purpose.trim()
      ? `Transaction purpose: ${input.purpose.trim()}.`
      : "Transaction purpose: not entered.",
    input.prepaymentRequest.trim()
      ? `Requested prepayment structure: ${input.prepaymentRequest.trim()}.`
      : "Requested prepayment structure: not entered.",
    input.targetDate
      ? `Target transaction date: ${input.targetDate}.`
      : "Target transaction date: not entered.",
  ];

  const checklist = [
    "Verify current business-purpose lending and licensing requirements for the transaction parties and property state.",
    "Confirm the borrowing entity, vesting, signing authority, and any required registrations or good-standing evidence.",
    "Have qualified counsel review the proposed loan documents and requested prepayment provision for this transaction.",
    "Verify any state, local, entity, title, recording, disclosure, or timing requirements that could affect closing.",
    "Date every source used and re-check it before signing because requirements and interpretations can change.",
  ];

  const location = state || "[property state]";
  const officialSearchPrompts = [
    `${location} official legislature business-purpose real estate lending`,
    `${location} official financial regulator lending license lookup`,
    `${location} secretary of state entity records`,
  ];

  return { recordedFacts, checklist, officialSearchPrompts };
}

export type DecisionFactsInput = {
  propertyValue: number;
  loanAmount: number;
  annualRatePct: number;
  amortizationYears: number;
  monthlyRent: number;
  taxesAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  otherMonthlyCosts: number;
  liquidReserves: number;
  reserveTargetMonths: number;
};

export type DecisionFacts = {
  monthlyPrincipalAndInterest: number;
  monthlyPitia: number;
  paymentCoverage: number | null;
  ltv: number | null;
  reserveMonths: number | null;
  simpleMonthlyCashFlow: number;
  attention: string[];
};

export function calculateDecisionFacts(input: DecisionFactsInput): DecisionFacts {
  const loanAmount = nonNegative(input.loanAmount);
  const propertyValue = nonNegative(input.propertyValue);
  const years = nonNegative(input.amortizationYears);
  const rate = nonNegative(input.annualRatePct);
  const rent = nonNegative(input.monthlyRent);
  const taxes = nonNegative(input.taxesAnnual) / 12;
  const insurance = nonNegative(input.insuranceAnnual) / 12;
  const hoa = nonNegative(input.hoaMonthly);
  const otherCosts = nonNegative(input.otherMonthlyCosts);
  const reserves = nonNegative(input.liquidReserves);
  const targetMonths = nonNegative(input.reserveTargetMonths);
  const monthlyPrincipalAndInterest =
    loanAmount > 0 && years > 0
      ? calculatePI(loanAmount, rate, Math.round(years * 12))
      : 0;
  const monthlyPitia = monthlyPrincipalAndInterest + taxes + insurance + hoa;
  const paymentCoverage = monthlyPitia > 0 ? rent / monthlyPitia : null;
  const ltv = propertyValue > 0 ? loanAmount / propertyValue : null;
  const reserveMonths = monthlyPitia > 0 ? reserves / monthlyPitia : null;
  const simpleMonthlyCashFlow = rent - monthlyPitia - otherCosts;
  const attention = [
    "Verify the entered rent, value, rate, amortization, taxes, insurance, HOA, and operating costs against current documents.",
  ];

  if (paymentCoverage !== null && paymentCoverage < 1)
    attention.push("Entered monthly rent is lower than the modeled monthly PITIA.");
  if (ltv !== null && ltv >= 1)
    attention.push("Entered loan amount is equal to or greater than entered property value.");
  if (
    reserveMonths !== null &&
    targetMonths > 0 &&
    reserveMonths < targetMonths
  )
    attention.push(
      `Entered reserves cover fewer months than your entered ${formatNumber(targetMonths)}-month target.`,
    );
  if (simpleMonthlyCashFlow < 0)
    attention.push(
      "Entered rent is lower than modeled PITIA plus entered monthly operating costs.",
    );

  return {
    monthlyPrincipalAndInterest,
    monthlyPitia,
    paymentCoverage,
    ltv,
    reserveMonths,
    simpleMonthlyCashFlow,
    attention,
  };
}

export type StrRentSource = "ltr" | "projected" | "documented";

export type StrComparisonInput = {
  loanAmount: number;
  annualRatePct: number;
  amortizationYears: number;
  taxesAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  ltrRent: number;
  projectedRent: number;
  documentedRent: number;
  ltrHaircutPct: number;
  projectedHaircutPct: number;
  documentedHaircutPct: number;
  seasonalityHaircutPct: number;
};

export type StrScenarioResult = {
  source: StrRentSource;
  label: string;
  enteredRent: number;
  adjustedRent: number;
  paymentCoverage: number | null;
};

export type StrComparison = {
  monthlyPitia: number;
  scenarios: StrScenarioResult[];
};

export function calculateStrComparison(input: StrComparisonInput): StrComparison {
  const loan = nonNegative(input.loanAmount);
  const years = nonNegative(input.amortizationYears);
  const monthlyPi =
    loan > 0 && years > 0
      ? calculatePI(
          loan,
          nonNegative(input.annualRatePct),
          Math.round(years * 12),
        )
      : 0;
  const monthlyPitia =
    monthlyPi +
    nonNegative(input.taxesAnnual) / 12 +
    nonNegative(input.insuranceAnnual) / 12 +
    nonNegative(input.hoaMonthly);
  const seasonalityMultiplier =
    1 - clamp(input.seasonalityHaircutPct, 0, 100) / 100;
  const sources: Array<{
    source: StrRentSource;
    label: string;
    rent: number;
    haircut: number;
  }> = [
    {
      source: "ltr",
      label: "Long-term rent",
      rent: input.ltrRent,
      haircut: input.ltrHaircutPct,
    },
    {
      source: "projected",
      label: "Projected STR rent",
      rent: input.projectedRent,
      haircut: input.projectedHaircutPct,
    },
    {
      source: "documented",
      label: "Documented STR rent",
      rent: input.documentedRent,
      haircut: input.documentedHaircutPct,
    },
  ];

  return {
    monthlyPitia,
    scenarios: sources.map(({ source, label, rent, haircut }) => {
      const enteredRent = nonNegative(rent);
      const adjustedRent =
        enteredRent * (1 - clamp(haircut, 0, 100) / 100) * seasonalityMultiplier;
      return {
        source,
        label,
        enteredRent,
        adjustedRent,
        paymentCoverage: monthlyPitia > 0 ? adjustedRent / monthlyPitia : null,
      };
    }),
  };
}

export type TaxIllustrationInput = {
  totalBasis: number;
  landAllocationPct: number;
  recoveryYears: number;
  marginalRatePct: number;
};

export type TaxIllustration = {
  depreciableBasis: number;
  annualStraightLineAmount: number;
  illustrativeAnnualTaxEffect: number;
};

export function calculateTaxIllustration(
  input: TaxIllustrationInput,
): TaxIllustration {
  const totalBasis = nonNegative(input.totalBasis);
  const landMultiplier = 1 - clamp(input.landAllocationPct, 0, 100) / 100;
  const recoveryYears = nonNegative(input.recoveryYears);
  const marginalRate = clamp(input.marginalRatePct, 0, 100) / 100;
  const depreciableBasis = totalBasis * landMultiplier;
  const annualStraightLineAmount =
    recoveryYears > 0 ? depreciableBasis / recoveryYears : 0;
  return {
    depreciableBasis,
    annualStraightLineAmount,
    illustrativeAnnualTaxEffect: annualStraightLineAmount * marginalRate,
  };
}

type Navigate = (view: any) => void;
type TextSetter = React.Dispatch<React.SetStateAction<string>>;

const TOOL_CSS = `
  .governed-layout{display:grid;grid-template-columns:minmax(280px,.7fr) minmax(0,1.3fr);gap:clamp(28px,5vw,72px);align-items:start}
  .governed-input-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .governed-metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .governed-scenarios{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .governed-fact{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;align-items:start}
  .governed-field input:focus-visible,.governed-field select:focus-visible,.governed-field textarea:focus-visible{outline:2px solid ${dc.lemon};outline-offset:2px}
  @media(max-width:980px){.governed-layout{grid-template-columns:1fr}}
  @media(max-width:760px){.governed-input-grid,.governed-metric-grid,.governed-scenarios{grid-template-columns:1fr}}
`;

const panelStyle: React.CSSProperties = {
  background: dc.mintBg,
  border: `1px solid ${dc.faded}`,
  borderRadius: dc.r.md,
  padding: "clamp(22px,3vw,34px)",
};

const darkPanelStyle: React.CSSProperties = {
  background: dc.dark,
  color: dc.cream,
  border: "1px solid rgba(238,239,211,.12)",
  borderRadius: dc.r.md,
  padding: "clamp(22px,3vw,34px)",
};

const controlStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${dc.faded}`,
  borderRadius: dc.r.sm,
  background: dc.cream,
  color: dc.dark,
  fontFamily: dc.sans,
  fontSize: 16,
  lineHeight: 1.35,
  minHeight: 48,
  padding: "12px 14px",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(nonNegative(value));
}

function formatSignedMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}

function formatNumber(value: number, digits = 2) {
  return Number.isFinite(value)
    ? value.toLocaleString("en-US", {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
      })
    : "0";
}

function toNumber(value: string) {
  if (value.trim() === "") return 0;
  return nonNegative(Number(value));
}

function asPurpose(value: string): LoanPurpose | undefined {
  if (value === "purchase" || value === "rate-term" || value === "cash-out")
    return value;
  return undefined;
}

function openLoanRequest(onNavigate: Navigate, draft?: LoanRequestDraft) {
  if (typeof window !== "undefined" && window.openQualify) {
    window.openQualify(draft);
    return;
  }
  onNavigate("book-demo");
}

function Field({
  label,
  value,
  setValue,
  type = "text",
  min,
  max,
  step,
  hint,
}: {
  label: string;
  value: string;
  setValue: TextSetter;
  type?: "text" | "number" | "date";
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="governed-field" style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          color: dc.dark,
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 7,
        }}
      >
        {label}
      </span>
      <input
        aria-label={label}
        type={type}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={{
          ...controlStyle,
          fontFamily: type === "number" ? dc.mono : dc.sans,
        }}
      />
      {hint ? (
        <span
          style={{
            display: "block",
            color: "rgba(0,55,56,.6)",
            fontSize: 12,
            lineHeight: 1.45,
            marginTop: 6,
          }}
        >
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: TextSetter;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="governed-field" style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          color: dc.dark,
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 7,
        }}
      >
        {label}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={controlStyle}
      >
        <option value="">Select an answer</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PanelHeading({
  title,
  copy,
}: {
  title: string;
  copy?: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          color: "inherit",
          fontSize: 27,
          letterSpacing: "-.035em",
          lineHeight: 1.12,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h2>
      {copy ? (
        <p
          style={{
            color: "rgba(0,55,56,.64)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}

function NumberedItem({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="governed-fact">
      <Mono
        style={{
          color: dc.rain,
          fontSize: 12,
          fontWeight: 700,
          paddingTop: 3,
        }}
      >
        {String(number).padStart(2, "0")}
      </Mono>
      <div>{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div
      style={{
        background: dc.mintBg,
        border: `1px solid ${dc.faded}`,
        borderRadius: dc.r.md,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          color: dc.rain,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <Mono
        style={{
          display: "block",
          color: dc.dark,
          fontSize: "clamp(24px,3vw,38px)",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {value}
      </Mono>
      {detail ? (
        <div
          style={{
            color: "rgba(0,55,56,.58)",
            fontSize: 12,
            lineHeight: 1.45,
            marginTop: 8,
          }}
        >
          {detail}
        </div>
      ) : null}
    </div>
  );
}

function ToolHero({ tool }: { tool: GovernedTool }) {
  const content = GOVERNED_TOOL_CONTENT[tool];
  return (
    <section
      style={{
        background: dc.dark,
        color: dc.cream,
        padding: `clamp(68px,9vw,126px) ${dc.pad}`,
      }}
    >
      <div id="gs-hero-content" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
        <div
          style={{
            color: dc.lemon,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          {content.label}
        </div>
        <H1 style={{ maxWidth: "18ch", margin: "0 0 24px" }}>
          {content.title}
        </H1>
        <Lead
          style={{
            color: "rgba(238,239,211,.72)",
            maxWidth: "66ch",
            margin: 0,
          }}
        >
          {content.lead}
        </Lead>
      </div>
    </section>
  );
}

function ToolNote({ tool }: { tool: GovernedTool }) {
  return (
    <p
      style={{
        color: "rgba(0,55,56,.64)",
        fontSize: 13,
        lineHeight: 1.55,
        margin: "22px 0 0",
        maxWidth: "76ch",
      }}
    >
      {GOVERNED_TOOL_CONTENT[tool].note}
    </p>
  );
}

function RateQuizTool({ onNavigate }: { onNavigate: Navigate }) {
  const [purpose, setPurpose] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [assumedRatePct, setAssumedRatePct] = useState("");
  const [occupancyEvidence, setOccupancyEvidence] = useState("");
  const [borrowerFileStatus, setBorrowerFileStatus] = useState("");

  const profile = useMemo(
    () =>
      buildLoanProfile({
        purpose,
        propertyType,
        propertyValue: toNumber(propertyValue),
        loanAmount: toNumber(loanAmount),
        monthlyRent: toNumber(monthlyRent),
        assumedRatePct:
          assumedRatePct.trim() === "" ? Number.NaN : toNumber(assumedRatePct),
        occupancyEvidence,
        borrowerFileStatus,
      }),
    [
      purpose,
      propertyType,
      propertyValue,
      loanAmount,
      monthlyRent,
      assumedRatePct,
      occupancyEvidence,
      borrowerFileStatus,
    ],
  );

  const draft: LoanRequestDraft = {
    purpose: asPurpose(purpose),
    propertyValue: toNumber(propertyValue) || undefined,
    loanAmount: toNumber(loanAmount) || undefined,
    rent: toNumber(monthlyRent) || undefined,
    rate:
      assumedRatePct.trim() === "" ? undefined : toNumber(assumedRatePct),
  };

  return (
    <div className="governed-layout">
      <div style={panelStyle}>
        <PanelHeading
          title="Five factual questions"
          copy="Leave anything unknown blank. No answer is converted into a rate or approval signal."
        />
        <div style={{ display: "grid", gap: 24 }}>
          <NumberedItem number={1}>
            <SelectField
              label="What is the loan purpose?"
              value={purpose}
              setValue={setPurpose}
              options={[
                { value: "purchase", label: "Purchase" },
                { value: "rate-term", label: "Rate-and-term refinance" },
                { value: "cash-out", label: "Cash-out refinance" },
              ]}
            />
          </NumberedItem>
          <NumberedItem number={2}>
            <SelectField
              label="What property type are you financing?"
              value={propertyType}
              setValue={setPropertyType}
              options={[
                { value: "Single-family", label: "Single-family" },
                { value: "2–4 unit", label: "2–4 unit" },
                { value: "Condo", label: "Condo" },
                { value: "Townhome", label: "Townhome" },
                { value: "Other / to verify", label: "Other / to verify" },
              ]}
            />
          </NumberedItem>
          <NumberedItem number={3}>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend
                style={{
                  color: dc.dark,
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                What figures are you organizing?
              </legend>
              <div className="governed-input-grid">
                <Field
                  label="Property value ($)"
                  type="number"
                  min={0}
                  step={1000}
                  value={propertyValue}
                  setValue={setPropertyValue}
                />
                <Field
                  label="Requested loan ($)"
                  type="number"
                  min={0}
                  step={1000}
                  value={loanAmount}
                  setValue={setLoanAmount}
                />
                <Field
                  label="Monthly rent ($)"
                  type="number"
                  min={0}
                  step={100}
                  value={monthlyRent}
                  setValue={setMonthlyRent}
                />
                <Field
                  label="Your rate assumption (%)"
                  type="number"
                  min={0}
                  step={0.125}
                  value={assumedRatePct}
                  setValue={setAssumedRatePct}
                  hint="Enter a rate only if you already have an assumption to model."
                />
              </div>
            </fieldset>
          </NumberedItem>
          <NumberedItem number={4}>
            <SelectField
              label="What rent or occupancy evidence is available?"
              value={occupancyEvidence}
              setValue={setOccupancyEvidence}
              options={[
                { value: "Executed lease", label: "Executed lease" },
                { value: "Current rent roll", label: "Current rent roll" },
                {
                  value: "Appraisal or market-rent support",
                  label: "Appraisal or market-rent support",
                },
                {
                  value: "Short-term rental history",
                  label: "Short-term rental history",
                },
                { value: "Not assembled yet", label: "Not assembled yet" },
              ]}
            />
          </NumberedItem>
          <NumberedItem number={5}>
            <SelectField
              label="How far along is the borrower file?"
              value={borrowerFileStatus}
              setValue={setBorrowerFileStatus}
              options={[
                {
                  value: "Entity and ownership documents ready",
                  label: "Entity and ownership documents ready",
                },
                {
                  value: "Financial and reserve documents ready",
                  label: "Financial and reserve documents ready",
                },
                {
                  value: "Some documents assembled",
                  label: "Some documents assembled",
                },
                { value: "Starting now", label: "Starting now" },
              ]}
            />
          </NumberedItem>
        </div>
      </div>

      <div>
        <div style={darkPanelStyle}>
          <PanelHeading title="Your organized brief" />
          {profile.facts.length > 0 ? (
            <ol
              style={{
                display: "grid",
                gap: 13,
                margin: "0 0 24px",
                paddingLeft: 20,
                color: "rgba(238,239,211,.78)",
                lineHeight: 1.55,
              }}
            >
              {profile.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ol>
          ) : (
            <p
              style={{
                color: "rgba(238,239,211,.66)",
                lineHeight: 1.55,
                margin: "0 0 24px",
              }}
            >
              Your entered facts will appear here. The organizer will not fill
              in missing facts.
            </p>
          )}
          {profile.missing.length > 0 ? (
            <div
              style={{
                borderTop: "1px solid rgba(238,239,211,.14)",
                paddingTop: 18,
                marginBottom: 26,
              }}
            >
              <div
                style={{
                  color: dc.lemon,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Still to assemble
              </div>
              <div
                style={{
                  color: "rgba(238,239,211,.7)",
                  fontSize: 14,
                  lineHeight: 1.55,
                }}
              >
                {profile.missing.join(" · ")}
              </div>
            </div>
          ) : null}
          <Btn
            label="Continue with these entered facts"
            onClick={() => openLoanRequest(onNavigate, draft)}
          />
        </div>
        <ToolNote tool="rate-quiz" />
      </div>
    </div>
  );
}

function StateLawsTool({ onNavigate }: { onNavigate: Navigate }) {
  const [state, setState] = useState("");
  const [entityOrVesting, setEntityOrVesting] = useState("");
  const [purpose, setPurpose] = useState("");
  const [prepaymentRequest, setPrepaymentRequest] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const output = useMemo(
    () =>
      buildStateVerificationChecklist({
        state,
        entityOrVesting,
        purpose,
        prepaymentRequest,
        targetDate,
      }),
    [state, entityOrVesting, purpose, prepaymentRequest, targetDate],
  );

  return (
    <div className="governed-layout">
      <div style={panelStyle}>
        <PanelHeading
          title="Transaction facts"
          copy="Enter facts, not conclusions. The checklist names what still needs current verification."
        />
        <div style={{ display: "grid", gap: 18 }}>
          <Field label="Property state" value={state} setValue={setState} />
          <Field
            label="Borrowing entity or intended vesting"
            value={entityOrVesting}
            setValue={setEntityOrVesting}
          />
          <SelectField
            label="Transaction purpose"
            value={purpose}
            setValue={setPurpose}
            options={[
              {
                value: "Business-purpose purchase",
                label: "Business-purpose purchase",
              },
              {
                value: "Business-purpose rate-and-term refinance",
                label: "Business-purpose rate-and-term refinance",
              },
              {
                value: "Business-purpose cash-out refinance",
                label: "Business-purpose cash-out refinance",
              },
              { value: "Needs verification", label: "Needs verification" },
            ]}
          />
          <Field
            label="Requested prepayment structure"
            value={prepaymentRequest}
            setValue={setPrepaymentRequest}
            hint="Record the request exactly; this tool does not interpret it."
          />
          <Field
            label="Target transaction date"
            type="date"
            value={targetDate}
            setValue={setTargetDate}
          />
        </div>
      </div>

      <div>
        <div style={darkPanelStyle}>
          <PanelHeading title="Verification checklist" />
          <div
            style={{
              borderBottom: "1px solid rgba(238,239,211,.14)",
              paddingBottom: 20,
              marginBottom: 20,
            }}
          >
            {output.recordedFacts.map((fact) => (
              <div
                key={fact}
                style={{
                  color: "rgba(238,239,211,.72)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  marginBottom: 5,
                }}
              >
                {fact}
              </div>
            ))}
          </div>
          <ol
            style={{
              display: "grid",
              gap: 14,
              margin: "0 0 26px",
              paddingLeft: 20,
              color: dc.cream,
              lineHeight: 1.55,
            }}
          >
            {output.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <div
            style={{
              background: "rgba(238,239,211,.06)",
              borderRadius: dc.r.sm,
              padding: 18,
              marginBottom: 26,
            }}
          >
            <div
              style={{
                color: dc.lemon,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Search prompts for official sources
            </div>
            {output.officialSearchPrompts.map((prompt) => (
              <Mono
                key={prompt}
                style={{
                  display: "block",
                  color: "rgba(238,239,211,.72)",
                  fontSize: 12,
                  lineHeight: 1.55,
                  marginBottom: 7,
                }}
              >
                {prompt}
              </Mono>
            ))}
          </div>
          <Btn
            label="Continue to a preliminary loan request"
            onClick={() =>
              openLoanRequest(onNavigate, {
                purpose: purpose.includes("purchase")
                  ? "purchase"
                  : purpose.includes("rate-and-term")
                    ? "rate-term"
                    : purpose.includes("cash-out")
                      ? "cash-out"
                      : undefined,
              })
            }
          />
        </div>
        <ToolNote tool="state-laws" />
      </div>
    </div>
  );
}

function DecisionSupportTool({ onNavigate }: { onNavigate: Navigate }) {
  const [propertyValue, setPropertyValue] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRatePct, setAnnualRatePct] = useState("");
  const [amortizationYears, setAmortizationYears] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [taxesAnnual, setTaxesAnnual] = useState("");
  const [insuranceAnnual, setInsuranceAnnual] = useState("");
  const [hoaMonthly, setHoaMonthly] = useState("");
  const [otherMonthlyCosts, setOtherMonthlyCosts] = useState("");
  const [liquidReserves, setLiquidReserves] = useState("");
  const [reserveTargetMonths, setReserveTargetMonths] = useState("");
  const hasPaymentInputs =
    loanAmount.trim() !== "" &&
    amortizationYears.trim() !== "" &&
    annualRatePct.trim() !== "";
  const facts = useMemo(
    () =>
      calculateDecisionFacts({
        propertyValue: toNumber(propertyValue),
        loanAmount: toNumber(loanAmount),
        annualRatePct: toNumber(annualRatePct),
        amortizationYears: toNumber(amortizationYears),
        monthlyRent: toNumber(monthlyRent),
        taxesAnnual: toNumber(taxesAnnual),
        insuranceAnnual: toNumber(insuranceAnnual),
        hoaMonthly: toNumber(hoaMonthly),
        otherMonthlyCosts: toNumber(otherMonthlyCosts),
        liquidReserves: toNumber(liquidReserves),
        reserveTargetMonths: toNumber(reserveTargetMonths),
      }),
    [
      propertyValue,
      loanAmount,
      annualRatePct,
      amortizationYears,
      monthlyRent,
      taxesAnnual,
      insuranceAnnual,
      hoaMonthly,
      otherMonthlyCosts,
      liquidReserves,
      reserveTargetMonths,
    ],
  );

  return (
    <div className="governed-layout">
      <div style={panelStyle}>
        <PanelHeading
          title="Your entered assumptions"
          copy="Blank fields remain zero; the page does not supply market or provider defaults."
        />
        <div className="governed-input-grid">
          <Field
            label="Property value ($)"
            type="number"
            min={0}
            step={1000}
            value={propertyValue}
            setValue={setPropertyValue}
          />
          <Field
            label="Loan amount ($)"
            type="number"
            min={0}
            step={1000}
            value={loanAmount}
            setValue={setLoanAmount}
          />
          <Field
            label="Annual rate assumption (%)"
            type="number"
            min={0}
            step={0.125}
            value={annualRatePct}
            setValue={setAnnualRatePct}
          />
          <Field
            label="Amortization (years)"
            type="number"
            min={1}
            step={1}
            value={amortizationYears}
            setValue={setAmortizationYears}
          />
          <Field
            label="Monthly rent ($)"
            type="number"
            min={0}
            step={100}
            value={monthlyRent}
            setValue={setMonthlyRent}
          />
          <Field
            label="Annual property taxes ($)"
            type="number"
            min={0}
            step={100}
            value={taxesAnnual}
            setValue={setTaxesAnnual}
          />
          <Field
            label="Annual insurance ($)"
            type="number"
            min={0}
            step={100}
            value={insuranceAnnual}
            setValue={setInsuranceAnnual}
          />
          <Field
            label="Monthly HOA ($)"
            type="number"
            min={0}
            step={25}
            value={hoaMonthly}
            setValue={setHoaMonthly}
          />
          <Field
            label="Other monthly operating costs ($)"
            type="number"
            min={0}
            step={25}
            value={otherMonthlyCosts}
            setValue={setOtherMonthlyCosts}
          />
          <Field
            label="Liquid reserves ($)"
            type="number"
            min={0}
            step={500}
            value={liquidReserves}
            setValue={setLiquidReserves}
          />
          <Field
            label="Your reserve target (months)"
            type="number"
            min={0}
            step={1}
            value={reserveTargetMonths}
            setValue={setReserveTargetMonths}
          />
        </div>
      </div>

      <div>
        {hasPaymentInputs ? (
          <>
            <div className="governed-metric-grid">
              <Metric
                label="Modeled PITIA"
                value={formatMoney(facts.monthlyPitia)}
                detail={`${formatMoney(facts.monthlyPrincipalAndInterest)} principal + interest, plus entered taxes, insurance, and HOA`}
              />
              <Metric
                label="Payment coverage"
                value={
                  facts.paymentCoverage === null
                    ? "—"
                    : `${formatNumber(facts.paymentCoverage)}x`
                }
                detail="entered monthly rent ÷ modeled PITIA"
              />
              <Metric
                label="Loan-to-value"
                value={
                  facts.ltv === null ? "—" : formatPercent(facts.ltv * 100)
                }
                detail="entered loan amount ÷ entered property value"
              />
              <Metric
                label="Reserve months"
                value={
                  facts.reserveMonths === null
                    ? "—"
                    : `${formatNumber(facts.reserveMonths)} mo`
                }
                detail="entered liquid reserves ÷ modeled PITIA"
              />
              <Metric
                label="Simple monthly cash flow"
                value={formatSignedMoney(facts.simpleMonthlyCashFlow)}
                detail="rent − PITIA − entered other monthly operating costs"
              />
            </div>
            <div style={{ ...darkPanelStyle, marginTop: 16 }}>
              <PanelHeading title="Attention checklist" />
              <ul
                style={{
                  display: "grid",
                  gap: 12,
                  margin: "0 0 26px",
                  paddingLeft: 20,
                  color: "rgba(238,239,211,.76)",
                  lineHeight: 1.55,
                }}
              >
                {facts.attention.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Btn
                label="Continue with these entered facts"
                onClick={() =>
                  openLoanRequest(onNavigate, {
                    propertyValue: toNumber(propertyValue) || undefined,
                    loanAmount: toNumber(loanAmount) || undefined,
                    rent: toNumber(monthlyRent) || undefined,
                    rate: toNumber(annualRatePct),
                    taxesAnnual: toNumber(taxesAnnual) || undefined,
                    insuranceAnnual: toNumber(insuranceAnnual) || undefined,
                    hoaMonthly: toNumber(hoaMonthly) || undefined,
                  })
                }
              />
            </div>
          </>
        ) : (
          <div style={darkPanelStyle}>
            <PanelHeading title="Your arithmetic will appear here" />
            <p
              style={{
                color: "rgba(238,239,211,.68)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Enter a loan amount, annual rate assumption, and amortization
              period to model payment. Add the remaining facts for coverage,
              LTV, reserves, and cash flow.
            </p>
          </div>
        )}
        <ToolNote tool="decision-support" />
      </div>
    </div>
  );
}

function StrUnderwritingTool({ onNavigate }: { onNavigate: Navigate }) {
  const [loanAmount, setLoanAmount] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [annualRatePct, setAnnualRatePct] = useState("");
  const [amortizationYears, setAmortizationYears] = useState("");
  const [taxesAnnual, setTaxesAnnual] = useState("");
  const [insuranceAnnual, setInsuranceAnnual] = useState("");
  const [hoaMonthly, setHoaMonthly] = useState("");
  const [ltrRent, setLtrRent] = useState("");
  const [projectedRent, setProjectedRent] = useState("");
  const [documentedRent, setDocumentedRent] = useState("");
  const [ltrHaircutPct, setLtrHaircutPct] = useState("");
  const [projectedHaircutPct, setProjectedHaircutPct] = useState("");
  const [documentedHaircutPct, setDocumentedHaircutPct] = useState("");
  const [seasonalityHaircutPct, setSeasonalityHaircutPct] = useState("");
  const [selectedSource, setSelectedSource] = useState<StrRentSource>("ltr");
  const hasPaymentInputs =
    loanAmount.trim() !== "" &&
    annualRatePct.trim() !== "" &&
    amortizationYears.trim() !== "";
  const comparison = useMemo(
    () =>
      calculateStrComparison({
        loanAmount: toNumber(loanAmount),
        annualRatePct: toNumber(annualRatePct),
        amortizationYears: toNumber(amortizationYears),
        taxesAnnual: toNumber(taxesAnnual),
        insuranceAnnual: toNumber(insuranceAnnual),
        hoaMonthly: toNumber(hoaMonthly),
        ltrRent: toNumber(ltrRent),
        projectedRent: toNumber(projectedRent),
        documentedRent: toNumber(documentedRent),
        ltrHaircutPct: toNumber(ltrHaircutPct),
        projectedHaircutPct: toNumber(projectedHaircutPct),
        documentedHaircutPct: toNumber(documentedHaircutPct),
        seasonalityHaircutPct: toNumber(seasonalityHaircutPct),
      }),
    [
      loanAmount,
      annualRatePct,
      amortizationYears,
      taxesAnnual,
      insuranceAnnual,
      hoaMonthly,
      ltrRent,
      projectedRent,
      documentedRent,
      ltrHaircutPct,
      projectedHaircutPct,
      documentedHaircutPct,
      seasonalityHaircutPct,
    ],
  );
  const selectedScenario = comparison.scenarios.find(
    (scenario) => scenario.source === selectedSource,
  );

  return (
    <div className="governed-layout">
      <div style={panelStyle}>
        <PanelHeading
          title="Payment and rent assumptions"
          copy="Every amount and adjustment is entered by you. No rent source is selected as provider-accepted."
        />
        <div className="governed-input-grid">
          <Field
            label="Property value ($)"
            type="number"
            min={0}
            step={1000}
            value={propertyValue}
            setValue={setPropertyValue}
          />
          <Field
            label="Loan amount ($)"
            type="number"
            min={0}
            step={1000}
            value={loanAmount}
            setValue={setLoanAmount}
          />
          <Field
            label="Annual rate assumption (%)"
            type="number"
            min={0}
            step={0.125}
            value={annualRatePct}
            setValue={setAnnualRatePct}
          />
          <Field
            label="Amortization (years)"
            type="number"
            min={1}
            step={1}
            value={amortizationYears}
            setValue={setAmortizationYears}
          />
          <Field
            label="Annual property taxes ($)"
            type="number"
            min={0}
            step={100}
            value={taxesAnnual}
            setValue={setTaxesAnnual}
          />
          <Field
            label="Annual insurance ($)"
            type="number"
            min={0}
            step={100}
            value={insuranceAnnual}
            setValue={setInsuranceAnnual}
          />
          <Field
            label="Monthly HOA ($)"
            type="number"
            min={0}
            step={25}
            value={hoaMonthly}
            setValue={setHoaMonthly}
          />
          <Field
            label="Seasonality haircut (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={seasonalityHaircutPct}
            setValue={setSeasonalityHaircutPct}
            hint="Applied equally after each source-specific haircut."
          />
          <Field
            label="Long-term rent ($ / month)"
            type="number"
            min={0}
            step={100}
            value={ltrRent}
            setValue={setLtrRent}
          />
          <Field
            label="Long-term rent haircut (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={ltrHaircutPct}
            setValue={setLtrHaircutPct}
          />
          <Field
            label="Projected STR rent ($ / month)"
            type="number"
            min={0}
            step={100}
            value={projectedRent}
            setValue={setProjectedRent}
          />
          <Field
            label="Projected rent haircut (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={projectedHaircutPct}
            setValue={setProjectedHaircutPct}
          />
          <Field
            label="Documented STR rent ($ / month)"
            type="number"
            min={0}
            step={100}
            value={documentedRent}
            setValue={setDocumentedRent}
          />
          <Field
            label="Documented rent haircut (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={documentedHaircutPct}
            setValue={setDocumentedHaircutPct}
          />
        </div>
      </div>

      <div>
        {hasPaymentInputs ? (
          <>
            <div
              style={{
                ...darkPanelStyle,
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "end",
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    color: dc.lemon,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  One entered payment
                </div>
                <Mono
                  style={{
                    color: dc.cream,
                    fontSize: "clamp(30px,4vw,48px)",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {formatMoney(comparison.monthlyPitia)}
                </Mono>
                <div
                  style={{
                    color: "rgba(238,239,211,.58)",
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  modeled monthly PITIA
                </div>
              </div>
              <label
                className="governed-field"
                style={{ display: "block", minWidth: 220 }}
              >
                <span
                  style={{
                    display: "block",
                    color: dc.cream,
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Scenario to carry into request
                </span>
                <select
                  aria-label="Scenario to carry into request"
                  value={selectedSource}
                  onChange={(event) =>
                    setSelectedSource(event.target.value as StrRentSource)
                  }
                  style={controlStyle}
                >
                  {comparison.scenarios.map((scenario) => (
                    <option key={scenario.source} value={scenario.source}>
                      {scenario.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="governed-scenarios">
              {comparison.scenarios.map((scenario) => (
                <article
                  key={scenario.source}
                  style={{
                    background:
                      scenario.source === selectedSource
                        ? dc.mintBg
                        : dc.cream,
                    border:
                      scenario.source === selectedSource
                        ? `2px solid ${dc.rain}`
                        : `1px solid ${dc.faded}`,
                    borderRadius: dc.r.md,
                    padding: "20px",
                  }}
                >
                  <h2
                    style={{
                      color: dc.dark,
                      fontSize: 17,
                      lineHeight: 1.25,
                      margin: "0 0 18px",
                    }}
                  >
                    {scenario.label}
                  </h2>
                  <Mono
                    style={{
                      display: "block",
                      color: dc.dark,
                      fontSize: 30,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {formatMoney(scenario.adjustedRent)}
                  </Mono>
                  <div
                    style={{
                      color: "rgba(0,55,56,.58)",
                      fontSize: 12,
                      lineHeight: 1.45,
                      margin: "7px 0 16px",
                    }}
                  >
                    after your source and seasonality haircuts
                  </div>
                  <div
                    style={{
                      borderTop: `1px solid ${dc.faded}`,
                      paddingTop: 12,
                      color: dc.rain,
                      fontSize: 13,
                    }}
                  >
                    Payment coverage{" "}
                    <Mono style={{ color: dc.dark, fontWeight: 700 }}>
                      {scenario.paymentCoverage === null
                        ? "—"
                        : `${formatNumber(scenario.paymentCoverage)}x`}
                    </Mono>
                  </div>
                </article>
              ))}
            </div>
            <div style={{ marginTop: 26 }}>
              <Btn
                label="Continue with the selected modeled rent"
                onClick={() =>
                  openLoanRequest(onNavigate, {
                    propertyValue: toNumber(propertyValue) || undefined,
                    loanAmount: toNumber(loanAmount) || undefined,
                    rent:
                      selectedScenario && selectedScenario.adjustedRent > 0
                        ? selectedScenario.adjustedRent
                        : undefined,
                    rate: toNumber(annualRatePct),
                    taxesAnnual: toNumber(taxesAnnual) || undefined,
                    insuranceAnnual: toNumber(insuranceAnnual) || undefined,
                    hoaMonthly: toNumber(hoaMonthly) || undefined,
                    role: "str",
                  })
                }
              />
            </div>
          </>
        ) : (
          <div style={darkPanelStyle}>
            <PanelHeading title="Your comparison will appear here" />
            <p
              style={{
                color: "rgba(238,239,211,.68)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Enter the loan amount, annual rate assumption, and amortization
              period to model PITIA. Then compare only the rent scenarios you
              enter.
            </p>
          </div>
        )}
        <ToolNote tool="str-underwriting" />
      </div>
    </div>
  );
}

function TaxEngineTool({ onNavigate }: { onNavigate: Navigate }) {
  const [totalBasis, setTotalBasis] = useState("");
  const [landAllocationPct, setLandAllocationPct] = useState("");
  const [recoveryYears, setRecoveryYears] = useState("");
  const [marginalRatePct, setMarginalRatePct] = useState("");
  const hasRequiredInputs =
    totalBasis.trim() !== "" &&
    landAllocationPct.trim() !== "" &&
    recoveryYears.trim() !== "" &&
    marginalRatePct.trim() !== "";
  const illustration = useMemo(
    () =>
      calculateTaxIllustration({
        totalBasis: toNumber(totalBasis),
        landAllocationPct: toNumber(landAllocationPct),
        recoveryYears: toNumber(recoveryYears),
        marginalRatePct: toNumber(marginalRatePct),
      }),
    [totalBasis, landAllocationPct, recoveryYears, marginalRatePct],
  );

  return (
    <div className="governed-layout">
      <div style={panelStyle}>
        <PanelHeading
          title="Your illustration assumptions"
          copy="All four inputs come from you. The tool supplies no tax classification or current-law default."
        />
        <div style={{ display: "grid", gap: 18 }}>
          <Field
            label="Total tax basis before land allocation ($)"
            type="number"
            min={0}
            step={1000}
            value={totalBasis}
            setValue={setTotalBasis}
          />
          <Field
            label="Land allocation (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={landAllocationPct}
            setValue={setLandAllocationPct}
          />
          <Field
            label="Recovery period (years)"
            type="number"
            min={0.1}
            step={0.1}
            value={recoveryYears}
            setValue={setRecoveryYears}
          />
          <Field
            label="Marginal tax rate for illustration (%)"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={marginalRatePct}
            setValue={setMarginalRatePct}
          />
        </div>
      </div>

      <div>
        {hasRequiredInputs ? (
          <>
            <div className="governed-metric-grid">
              <Metric
                label="Depreciable basis"
                value={formatMoney(illustration.depreciableBasis)}
                detail="entered total basis × (1 − entered land allocation)"
              />
              <Metric
                label="Annual straight-line amount"
                value={formatMoney(illustration.annualStraightLineAmount)}
                detail="depreciable basis ÷ entered recovery years"
              />
              <Metric
                label="Illustrative annual tax effect"
                value={formatMoney(illustration.illustrativeAnnualTaxEffect)}
                detail="annual straight-line amount × entered marginal rate"
              />
            </div>
            <div style={{ ...darkPanelStyle, marginTop: 16 }}>
              <PanelHeading title="What this arithmetic does not decide" />
              <ul
                style={{
                  display: "grid",
                  gap: 11,
                  color: "rgba(238,239,211,.74)",
                  lineHeight: 1.55,
                  margin: "0 0 26px",
                  paddingLeft: 20,
                }}
              >
                <li>Whether the property or taxpayer is eligible for a deduction.</li>
                <li>Whether the entered basis or land allocation is supportable.</li>
                <li>
                  Which recovery period, convention, limitation, or recapture
                  treatment applies.
                </li>
                <li>Your actual current-year or future tax liability.</li>
              </ul>
              <Btn
                label="Continue to a preliminary loan request"
                onClick={() => openLoanRequest(onNavigate)}
              />
            </div>
          </>
        ) : (
          <div style={darkPanelStyle}>
            <PanelHeading title="Your illustration will appear here" />
            <p
              style={{
                color: "rgba(238,239,211,.68)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Enter all four assumptions to calculate a straight-line basis
              illustration. Nothing is filled from a legal or tax table.
            </p>
          </div>
        )}
        <ToolNote tool="tax-engine" />
      </div>
    </div>
  );
}

export default function BoundedGovernedToolsPage({
  tool,
  onNavigate,
}: {
  tool: GovernedTool;
  onNavigate: Navigate;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${GOVERNED_TOOL_CONTENT[tool].label} | Greenstreet Finance`;
  }, [tool]);

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{TOOL_CSS}</style>
      <ToolHero tool={tool} />
      <section
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {tool === "rate-quiz" ? (
            <RateQuizTool onNavigate={onNavigate} />
          ) : tool === "state-laws" ? (
            <StateLawsTool onNavigate={onNavigate} />
          ) : tool === "decision-support" ? (
            <DecisionSupportTool onNavigate={onNavigate} />
          ) : tool === "str-underwriting" ? (
            <StrUnderwritingTool onNavigate={onNavigate} />
          ) : (
            <TaxEngineTool onNavigate={onNavigate} />
          )}
        </div>
      </section>
    </DcShell>
  );
}
