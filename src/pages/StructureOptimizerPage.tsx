import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { swatch, radius, font } from "../theme";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import { compareLoanStructures } from "./structureComparison";

const BAND = dc.dark;
const CARD = swatch.darkTeal;
const HAIRLINE = "1px solid rgba(238,239,211,0.16)";
const INK = dc.cream;
const INK_DIM = dc.ink.secondary;

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
function money(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "not established";
  return n < 0 ? `-${USD.format(Math.abs(n))}` : USD.format(n);
}

function pct(n: number | null, digits = 2): string {
  if (n === null || !Number.isFinite(n)) return "not established";
  return `${n.toFixed(digits)}%`;
}

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ background: CARD, borderRadius: radius.lg, border: HAIRLINE, padding: 26, ...style }}>
      {children}
    </div>
  );
}

function Eyebrow({ children, color = dc.emerald }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color, marginBottom: 8 }}>
      {children}
    </div>
  );
}

export default function StructureOptimizerPage({ onNavigate }: { onBack?: () => void; onNavigate: (v: any) => void }) {
  useEffect(() => {
    document.title = "Structure Optimizer | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [downPct, setDownPct] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(3500);
  const [fico, setFico] = useState(740);

  const result = useMemo(
    () => compareLoanStructures({
      purchasePrice,
      downPaymentPct: downPct,
      monthlyRent,
      ficoScore: fico,
    }),
    [purchasePrice, downPct, monthlyRent, fico],
  );

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[{ label: "DSCR Calc", view: "dscr-calculator" }, { label: "Programs", view: "lender-intel" }]}
      cta={{ label: "Start a deal →", view: "dscr-calculator" }}
    >
      <section style={{ background: BAND, color: INK, padding: `clamp(64px,9vh,120px) ${dc.pad} clamp(56px,7vh,92px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          <div>
            <Eyebrow color={dc.lemon}>Structure Optimizer</Eyebrow>
            <H1 style={{ margin: "0 0 16px" }}>Compare Loan Structures</H1>
            <Lead style={{ color: dc.ink.dim, maxWidth: "60ch" }}>
              See how different loan structures impact your cash flow and returns side-by-side.
            </Lead>
          </div>

          <Card style={{ marginTop: 24, padding: "clamp(20px, 3vw, 32px)", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <label style={{ display: "block", flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 11, color: INK_DIM, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Purchase Price</span>
              <CurrencyInput value={purchasePrice} onChange={setPurchasePrice} step={5000} prefix="$" surface="dark" style={{ background: BAND, padding: "0 13px", marginTop: 6 }} inputStyle={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }} />
            </label>
            <label style={{ display: "block", flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 11, color: INK_DIM, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Down Payment %</span>
              <CurrencyInput value={downPct} onChange={setDownPct} step={1} suffix="%" surface="dark" style={{ background: BAND, padding: "0 13px", marginTop: 6 }} inputStyle={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }} />
            </label>
            <label style={{ display: "block", flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 11, color: INK_DIM, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Monthly Rent</span>
              <CurrencyInput value={monthlyRent} onChange={setMonthlyRent} step={100} prefix="$" surface="dark" style={{ background: BAND, padding: "0 13px", marginTop: 6 }} inputStyle={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }} />
            </label>
            <label style={{ display: "block", flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 11, color: INK_DIM, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>FICO Score</span>
              <CurrencyInput value={fico} onChange={setFico} step={5} surface="dark" style={{ background: BAND, padding: "0 13px", marginTop: 6 }} inputStyle={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }} />
            </label>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 24 }}>
            {result.map((struct) => (
              <Card key={struct.id}>
                <Eyebrow>{struct.name}</Eyebrow>
                <div style={{ margin: "16px 0", borderBottom: HAIRLINE, paddingBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: INK_DIM, fontSize: 14 }}>Note Rate</span>
                    <Mono style={{ fontWeight: 600 }}>{pct(struct.deal.solvedRate, 3)}</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: INK_DIM, fontSize: 14 }}>Monthly Payment (PI)</span>
                    <Mono style={{ fontWeight: 600 }}>{money(struct.deal.monthlyPITIA.isInterestOnly ? struct.deal.monthlyPITIA.interestOnlyPayment! : struct.deal.monthlyPITIA.principalAndInterest)}</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: INK_DIM, fontSize: 14 }}>DSCR</span>
                    <Mono style={{ fontWeight: 600 }}>{struct.deal.dscr.toFixed(2)}x</Mono>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: INK_DIM, fontSize: 14 }}>Year 1 Cash-on-Cash</span>
                    <Mono style={{ fontWeight: 600 }}>{pct(struct.cashOnCashPct, 2)}</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: INK_DIM, fontSize: 14 }}>After-Tax IRR (5yr)</span>
                    <Mono style={{ fontWeight: 600 }}>{pct(struct.afterTaxIrrPct, 2)}</Mono>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <p style={{ color: INK_DIM, fontSize: 12, lineHeight: 1.6, margin: "4px 0 0" }}>
            Five-year after-tax IRR is shown only for the fixed-rate structure. It is not established for the interest-only or ARM examples because this returns model does not simulate their payment changes.
          </p>
        </div>
      </section>
    </DcShell>
  );
}
