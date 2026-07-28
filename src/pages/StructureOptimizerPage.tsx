import React, { useEffect, useMemo, useState } from "react";
import { calculatePI } from "../engine";
import { Btn, DcShell, H1, Lead, Mono, dc } from "../design/dc";

export type StructureComparisonInput = {
  loanAmount: number;
  annualRatePct: number;
  monthlyRent: number;
  monthlyNonDebtCosts: number;
};

export type StructureComparison = {
  id: "30-year" | "40-year" | "interest-only";
  name: string;
  monthlyPrincipalAndInterest: number;
  fullMonthlyPayment: number;
  dscr: number;
  principalPaidAfterFiveYears: number;
};

function remainingBalance(
  loanAmount: number,
  annualRatePct: number,
  termMonths: number,
  paidMonths: number,
): number {
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) {
    return Math.max(0, loanAmount - (loanAmount / termMonths) * paidMonths);
  }
  const payment = calculatePI(loanAmount, annualRatePct, termMonths);
  return Math.max(
    0,
    loanAmount * Math.pow(1 + monthlyRate, paidMonths) -
      payment * ((Math.pow(1 + monthlyRate, paidMonths) - 1) / monthlyRate),
  );
}

export function compareLoanStructures(input: StructureComparisonInput): StructureComparison[] {
  const loanAmount = Math.max(0, input.loanAmount);
  const rate = Math.max(0, input.annualRatePct);
  const rent = Math.max(0, input.monthlyRent);
  const nonDebt = Math.max(0, input.monthlyNonDebtCosts);

  const structures: StructureComparison[] = [
    { id: "30-year" as const, name: "30-year amortizing", months: 360 },
    { id: "40-year" as const, name: "40-year amortizing", months: 480 },
  ].map(({ id, name, months }) => {
    const pi = calculatePI(loanAmount, rate, months);
    const payment = pi + nonDebt;
    const balance = remainingBalance(loanAmount, rate, months, 60);
    return {
      id,
      name,
      monthlyPrincipalAndInterest: pi,
      fullMonthlyPayment: payment,
      dscr: payment > 0 ? rent / payment : 0,
      principalPaidAfterFiveYears: Math.max(0, loanAmount - balance),
    };
  });

  const interestOnlyPi = loanAmount * (rate / 100 / 12);
  const interestOnlyPayment = interestOnlyPi + nonDebt;
  structures.push({
    id: "interest-only",
    name: "Interest-only period",
    monthlyPrincipalAndInterest: interestOnlyPi,
    fullMonthlyPayment: interestOnlyPayment,
    dscr: interestOnlyPayment > 0 ? rent / interestOnlyPayment : 0,
    principalPaidAfterFiveYears: 0,
  });

  return structures;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${dc.faded}`,
  borderRadius: dc.r.md,
  background: dc.cream,
  color: dc.dark,
  fontFamily: dc.mono,
  fontSize: 17,
  padding: "13px 14px",
};

const STRUCTURE_CSS = `
  .structure-grid { display:grid; grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr); gap:clamp(28px,5vw,72px); align-items:start; }
  .structure-results { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
  @media (max-width:980px) { .structure-grid { grid-template-columns:1fr; } }
  @media (max-width:760px) { .structure-results { grid-template-columns:1fr; } }
`;

export default function StructureOptimizerPage({
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (view: any) => void;
}) {
  const [loanAmount, setLoanAmount] = useState(320000);
  const [annualRatePct, setAnnualRatePct] = useState(7);
  const [monthlyRent, setMonthlyRent] = useState(3000);
  const [monthlyNonDebtCosts, setMonthlyNonDebtCosts] = useState(650);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const results = useMemo(
    () => compareLoanStructures({ loanAmount, annualRatePct, monthlyRent, monthlyNonDebtCosts }),
    [loanAmount, annualRatePct, monthlyRent, monthlyNonDebtCosts],
  );

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "All tools", view: "products" },
        { label: "DSCR calculator", view: "dscr-calculator" },
      ]}
      cta={{ label: "Apply for a DSCR loan →", view: "book-demo" }}
    >
      <style>{STRUCTURE_CSS}</style>
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(68px,9vw,126px) ${dc.pad}` }}>
        <div id="gs-hero-content" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ color: dc.lemon, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>
            Structure comparison
          </div>
          <H1 style={{ maxWidth: "16ch", margin: "0 0 24px" }}>Compare payment structures with one set of assumptions.</H1>
          <Lead style={{ color: "rgba(238,239,211,.7)", maxWidth: "62ch", margin: 0 }}>
            Enter a loan amount, rate, rent, and monthly non-debt costs. The tool compares payment coverage and five-year principal reduction without selecting a program or predicting approval.
          </Lead>
        </div>
      </section>

      <section style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div className="structure-grid" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-card" style={{ background: dc.mintBg, border: `1px solid ${dc.faded}`, borderRadius: dc.r.md, padding: "clamp(22px,3vw,34px)" }}>
            <h2 style={{ color: dc.dark, fontSize: 27, letterSpacing: "-.035em", margin: "0 0 8px" }}>Your assumptions</h2>
            <p style={{ color: "rgba(0,55,56,.64)", lineHeight: 1.55, margin: "0 0 24px" }}>Use the same assumed note rate across all three structures for an apples-to-apples comparison.</p>
            {([
              { label: "Loan amount", value: loanAmount, setter: setLoanAmount, affix: "$", step: 1000 },
              { label: "Annual interest rate", value: annualRatePct, setter: setAnnualRatePct, affix: "%", step: 0.125 },
              { label: "Monthly rent", value: monthlyRent, setter: setMonthlyRent, affix: "$", step: 100 },
              { label: "Taxes, insurance and HOA /mo", value: monthlyNonDebtCosts, setter: setMonthlyNonDebtCosts, affix: "$", step: 25 },
            ] satisfies Array<{
              label: string;
              value: number;
              setter: React.Dispatch<React.SetStateAction<number>>;
              affix: string;
              step: number;
            }>).map(({ label, value, setter, affix, step }) => (
              <label key={label} style={{ display: "block", marginBottom: 18 }}>
                <span style={{ display: "block", color: dc.dark, fontSize: 13, fontWeight: 700, marginBottom: 7 }}>{label}</span>
                <div style={{ position: "relative" }}>
                  <input
                    aria-label={label}
                    type="number"
                    min="0"
                    step={step}
                    value={value}
                    onChange={(event) => setter(Math.max(0, Number(event.target.value) || 0))}
                    style={inputStyle}
                  />
                  <span style={{ position: "absolute", right: 14, top: 14, color: "rgba(0,55,56,.48)", fontFamily: dc.mono }}>{affix}</span>
                </div>
              </label>
            ))}
          </div>

          <div>
            <div className="structure-results">
              {results.map((result) => (
                <article key={result.id} className="gs-card" style={{ background: dc.dark, color: dc.cream, borderRadius: dc.r.md, border: "1px solid rgba(238,239,211,.12)", padding: "clamp(22px,2.6vw,32px)" }}>
                  <div style={{ color: dc.lemon, fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 18 }}>{result.name}</div>
                  <Mono style={{ display: "block", color: dc.cream, fontSize: "clamp(30px,3.4vw,48px)", fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>
                    ${Math.round(result.fullMonthlyPayment).toLocaleString()}
                  </Mono>
                  <div style={{ color: "rgba(238,239,211,.55)", fontSize: 12, marginBottom: 24 }}>modeled full monthly payment</div>
                  {[
                    ["Principal + interest", `$${Math.round(result.monthlyPrincipalAndInterest).toLocaleString()}`],
                    ["Modeled DSCR", `${result.dscr.toFixed(2)}x`],
                    ["Principal paid in 5 years", `$${Math.round(result.principalPaidAfterFiveYears).toLocaleString()}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, borderTop: "1px solid rgba(238,239,211,.12)", padding: "12px 0", fontSize: 13 }}>
                      <span style={{ color: "rgba(238,239,211,.58)" }}>{label}</span>
                      <Mono style={{ color: dc.cream, fontWeight: 700, textAlign: "right" }}>{value}</Mono>
                    </div>
                  ))}
                </article>
              ))}
            </div>
            <p style={{ color: "rgba(0,55,56,.62)", lineHeight: 1.55, margin: "20px 0 28px", maxWidth: "74ch" }}>
              Interest-only is modeled as no principal reduction during the five-year comparison period. Actual availability, payment changes after an interest-only period, rate, fees, and qualification depend on provider terms and underwriting.
            </p>
            <Btn
              label="Continue with these numbers"
              onClick={() =>
                window.openQualify?.({
                  loanAmount,
                  rent: monthlyRent,
                  rate: annualRatePct,
                })
              }
            />
          </div>
        </div>
      </section>
    </DcShell>
  );
}
