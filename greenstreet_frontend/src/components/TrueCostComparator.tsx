import React, { useState } from "react";
import { dc, Mono } from "../design/dc";
import { swatch, radius } from "../theme";
import { compareTrueCost, type LoanCostQuote } from "../engine/trueCostOfCapital";
import { computeAEY } from "../engine/trueCostEngine";
import type { PrepayType } from "../engine/types";

// ── True Cost of Capital comparator ──────────────────────────────────────────
// Behavioral finance (INNOVATION_BEHAVIORAL_FINANCE §6): present bias makes
// borrowers pick the lowest *rate*, ignoring points, fees, and prepay penalties.
// This ranks the real quotes a borrower has received by all-in cost over their
// hold — choice-architecture default sort, cheapest tagged "Recommended".
// Engine-only math (compareTrueCost); the borrower supplies real numbers, so
// nothing is fabricated.

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// Common DSCR prepay structures, friendly-labeled. Values map 1:1 to the
// engine's PrepayType union — no invented structures.
const PREPAY_OPTS: { value: PrepayType; label: string }[] = [
  { value: "NONE", label: "None (open)" },
  { value: "54321", label: "5-4-3-2-1 step-down" },
  { value: "4321", label: "4-3-2-1 step-down" },
  { value: "321", label: "3-2-1 step-down" },
  { value: "FLAT_5", label: "Flat 5%" },
  { value: "YIELD_MAINTENANCE", label: "Yield maintenance" },
];

// Two starter quotes that demonstrate the rate-myopia trap (lower rate, but a
// point + a prepay penalty). Clearly an EXAMPLE — the borrower overwrites these.
const EXAMPLE_QUOTES: LoanCostQuote[] = [
  { label: "Quote A — lowest rate", rate: 7.5, points: 1, fees: 1500, prepayType: "54321" },
  { label: "Quote B — slightly higher, open", rate: 7.875, points: 0, fees: 1500, prepayType: "NONE" },
];

export default function TrueCostComparator({ accent = dc.rain }: { accent?: string }) {
  const [loanAmount, setLoanAmount] = useState(300_000);
  const [holdYears, setHoldYears] = useState(3);
  const [quotes, setQuotes] = useState<LoanCostQuote[]>(EXAMPLE_QUOTES);

  const update = (i: number, patch: Partial<LoanCostQuote>) =>
    setQuotes((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const addQuote = () =>
    setQuotes((qs) =>
      qs.length >= 3
        ? qs
        : [...qs, { label: `Quote ${String.fromCharCode(65 + qs.length)}`, rate: 7.75, points: 0, fees: 1500, prepayType: "NONE" }],
    );
  const removeQuote = (i: number) =>
    setQuotes((qs) => (qs.length <= 2 ? qs : qs.filter((_, idx) => idx !== i)));

  const cmp = compareTrueCost(loanAmount, quotes, holdYears);

  // Augment each ranked result with its All-In Effective Yield (AEY) — the
  // XIRR of the borrower's actual cash flows (net proceeds in, P&I out, balloon
  // + prepay at exit). AEY folds rate + points + fees + prepay into one
  // comparable yield; the lowest AEY is the cheapest capital. par rate is
  // estimated as rate minus the buy-down bought with points (~0.25%/point),
  // used only for the points-recoup break-even verdict.
  const holdMonths = Math.round(holdYears * 12);
  const aeyByLabel = new Map(
    quotes.map((q) => {
      const penalty = cmp.ranked.find((r) => r.label === q.label)?.prepayPenalty ?? 0;
      const parRate = Math.max(0, q.rate - q.points * 0.25);
      const tc = computeAEY(loanAmount, q.rate, 360, holdMonths, q.points, q.fees, 0, 0, penalty, parRate);
      return [q.label, tc] as const;
    }),
  );
  const fmtPct = (n: number) => n.toFixed(2) + "%";

  const fieldStyle: React.CSSProperties = { width: "100%", border: `1.5px solid ${swatch.midnightFaded}`, background: swatch.white, borderRadius: radius.sm, padding: "9px 11px", fontFamily: dc.sans, fontSize: 14, fontWeight: 600, color: dc.dark, outline: "none" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)", marginBottom: 5 };

  return (
    <div style={{ background: swatch.white, border: `1px solid ${swatch.midnightFaded}`, borderRadius: radius.md, padding: "clamp(20px,2.6vw,32px)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>True cost of capital</div>
      <h3 style={{ fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 8px", color: dc.dark }}>Compare offers on total cost — not the rate.</h3>
      <p style={{ fontSize: 14, color: "rgba(0,55,56,0.6)", margin: "0 0 22px", lineHeight: 1.55, maxWidth: "64ch" }}>
        The lowest rate is not always the cheapest loan. Enter the real quotes you've received — points, fees, and prepay penalty included — and we rank them by what you actually pay over your hold. Replace the example numbers below.
      </p>

      {/* deal-level inputs */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <label style={{ flex: "1 1 180px" }}>
          <span style={labelStyle}>Loan amount</span>
          <input type="number" step={5000} value={loanAmount} onChange={(e) => setLoanAmount(+e.target.value)} style={fieldStyle} />
        </label>
        <label style={{ flex: "1 1 140px" }}>
          <span style={labelStyle}>Years you'll hold</span>
          <input type="number" step={1} min={1} max={10} value={holdYears} onChange={(e) => setHoldYears(Math.max(1, Math.min(10, +e.target.value)))} style={fieldStyle} />
        </label>
      </div>

      {/* quote editors */}
      <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        {quotes.map((q, i) => (
          <div key={i} style={{ background: swatch.pistachio, border: `1px solid ${swatch.midnightFaded}`, borderRadius: radius.sm, padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <label style={{ flex: "2 1 200px" }}>
                <span style={labelStyle}>Label</span>
                <input type="text" value={q.label} onChange={(e) => update(i, { label: e.target.value })} style={fieldStyle} />
              </label>
              <label style={{ flex: "1 1 90px" }}>
                <span style={labelStyle}>Rate %</span>
                <input type="number" step={0.125} value={q.rate} onChange={(e) => update(i, { rate: +e.target.value })} style={fieldStyle} />
              </label>
              <label style={{ flex: "1 1 80px" }}>
                <span style={labelStyle}>Points %</span>
                <input type="number" step={0.25} value={q.points} onChange={(e) => update(i, { points: +e.target.value })} style={fieldStyle} />
              </label>
              <label style={{ flex: "1 1 90px" }}>
                <span style={labelStyle}>Fees $</span>
                <input type="number" step={250} value={q.fees} onChange={(e) => update(i, { fees: +e.target.value })} style={fieldStyle} />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                <span style={labelStyle}>Prepay</span>
                <select value={q.prepayType} onChange={(e) => update(i, { prepayType: e.target.value as PrepayType })} style={{ ...fieldStyle, cursor: "pointer" }}>
                  {PREPAY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              {quotes.length > 2 && (
                <button onClick={() => removeQuote(i)} aria-label="Remove quote" style={{ flexShrink: 0, background: "none", border: `1.5px solid ${swatch.midnightFaded}`, borderRadius: radius.sm, color: "rgba(0,55,56,0.55)", cursor: "pointer", fontFamily: dc.sans, fontWeight: 700, fontSize: 16, lineHeight: 1, padding: "9px 12px" }}>×</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {quotes.length < 3 && (
        <button onClick={addQuote} style={{ background: "none", border: `1.5px dashed ${swatch.midnightFaded}`, borderRadius: radius.sm, color: accent, cursor: "pointer", fontFamily: dc.sans, fontWeight: 600, fontSize: 13, padding: "10px 16px", marginBottom: 24 }}>+ Add a third quote</button>
      )}

      {/* headline — the rate-myopia callout */}
      <div style={{ background: cmp.savingsVsLowestRate > 0 ? "rgba(230,184,77,0.12)" : "rgba(77,189,151,0.1)", border: `1px solid ${cmp.savingsVsLowestRate > 0 ? "rgba(230,184,77,0.4)" : "rgba(77,189,151,0.4)"}`, borderRadius: radius.sm, padding: "14px 18px", margin: "0 0 18px" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: dc.dark, margin: 0, lineHeight: 1.5 }}>
          {cmp.savingsVsLowestRate > 0 ? (
            <>The lowest-rate option ({cmp.lowestRateLabel}) costs <strong style={{ color: "#b8901f" }}>{fmt(cmp.savingsVsLowestRate)} more</strong> over {holdYears} {holdYears === 1 ? "year" : "years"} than {cmp.cheapest.label}, once points, fees, and prepay are counted.</>
          ) : (
            <>Here the lowest-rate option is also the cheapest all-in over {holdYears} {holdYears === 1 ? "year" : "years"} — no rate-myopia penalty.</>
          )}
        </p>
      </div>

      {/* ranked results — cheapest first */}
      <div style={{ display: "grid", gap: 10 }}>
        {cmp.ranked.map((r, i) => {
          const best = i === 0;
          const tc = aeyByLabel.get(r.label);
          // Points-recoup verdict → color + plain-language note. Only shown when
          // the quote actually paid points (otherwise there's nothing to recoup).
          const recoupColor =
            tc?.pointsRecoupVerdict === "GREEN" ? dc.emerald
              : tc?.pointsRecoupVerdict === "YELLOW" ? "#b8901f"
                : "#c0554f";
          const recoupNote =
            !tc || r.upfront === 0 || tc.pointsPct === 0
              ? null
              : tc.pointsRecoupVerdict === "RED"
                ? `Points don't recoup within your ${holdYears}yr hold`
                : `Points recoup in ~${tc.pointsRecoupMonths} mo`;
          return (
            <div key={r.label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, background: best ? "rgba(0,101,101,0.05)" : swatch.white, border: `1.5px solid ${best ? dc.rain : swatch.midnightFaded}`, borderRadius: radius.sm, padding: "16px 18px" }}>
              <div style={{ flex: "2 1 200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: dc.dark }}>{r.label}</span>
                  {best && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.cream, background: dc.rain, borderRadius: 100, padding: "3px 9px" }}>Recommended</span>}
                </div>
                <div style={{ fontSize: 12, color: "rgba(0,55,56,0.55)" }}>{r.rate}% · interest {fmt(r.interestPaid)} · upfront {fmt(r.upfront)} · prepay {fmt(r.prepayPenalty)}</div>
                {recoupNote && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7, fontSize: 11, fontWeight: 700, fontFamily: dc.mono, color: recoupColor, background: `${recoupColor}14`, borderRadius: 5, padding: "3px 8px", letterSpacing: "-0.01em" }}>
                    {tc?.pointsRecoupVerdict === "RED" ? "●" : "✓"} {recoupNote}
                  </div>
                )}
              </div>
              <div style={{ flex: "1 1 120px", textAlign: "right" }}>
                <Mono style={{ fontSize: "clamp(20px,2.4vw,26px)", fontWeight: 700, letterSpacing: "-0.02em", color: best ? dc.rain : dc.dark, display: "block", lineHeight: 1 }}>{fmt(r.totalCost)}</Mono>
                <div style={{ fontSize: 11, color: "rgba(0,55,56,0.5)", marginTop: 3 }}>all-in over {holdYears}yr</div>
                {tc && (
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: dc.mono, color: best ? dc.rain : "rgba(0,55,56,0.7)", marginTop: 6, letterSpacing: "-0.01em" }}>
                    {fmtPct(tc.aey)} AEY
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "rgba(0,55,56,0.45)", margin: "16px 0 0", lineHeight: 1.5 }}>
        All-in cost = interest over your hold + points + fees + any prepay penalty owed if you exit at the end of the hold. <strong>AEY (all-in effective yield)</strong> is the true annual cost of the money once points, fees, and prepay are folded in — the lowest AEY is the cheapest capital, even if it isn't the lowest rate. Estimate — confirm exact figures on each lender's Loan Estimate.
      </p>
    </div>
  );
}
