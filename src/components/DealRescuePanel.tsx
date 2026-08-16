import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { font, radius, risk, swatch } from '../theme';
import type { AmortizationRescuePreview, DealFix } from '../lib/dealState';

export interface DealRescuePanelProps {
  /** The coverage ratio calculated from the live desk inputs. */
  currentDscr: number;
  /** The minimum coverage target used to derive `fixes`. */
  targetDscr: number;
  /** Concrete input patches derived from the current calculator scenario. */
  fixes: readonly DealFix[];
  /** Exact current-rate payment comparisons that are not directly applied. */
  structurePreview?: AmortizationRescuePreview | null;
  /** Applies the selected scenario patch in the calculator owner. */
  onApplyFix: (fix: DealFix) => void;
}

const riskColor = (level: DealFix['risk']) => (
  level === 'LOW' ? risk.positive : level === 'MODERATE' ? swatch.lemon : risk.dangerOnDark
);

/**
 * A live calculator control, not a lender-program recommender. Every card is
 * generated from the current scenario and the parent owns the actual state
 * update, so a click immediately reruns the desk's normal calculations.
 */
export function DealRescuePanel({
  currentDscr,
  targetDscr,
  fixes,
  structurePreview,
  onApplyFix,
}: DealRescuePanelProps) {
  if (fixes.length === 0) return null;

  return (
    <section
      aria-label="Interactive deal rescue"
      style={{
        marginTop: 20,
        background: 'rgba(216,217,88,0.06)',
        borderWidth: '1px 1px 1px 3px',
        borderStyle: 'solid',
        borderColor: 'rgba(216,217,88,0.28)',
        borderLeftColor: swatch.lemon,
        borderRadius: '0 10px 10px 0',
        padding: '16px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: swatch.lemon }}>
          Interactive deal rescue
        </div>
        <span style={{ fontSize: 12, color: 'rgba(238,239,211,0.55)' }}>
          Current {currentDscr.toFixed(2)}x · target {targetDscr.toFixed(2)}x
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'rgba(238,239,211,0.72)', margin: '0 0 12px', lineHeight: 1.5 }}>
        Each option is calculated from this scenario. Applying one updates the calculator inputs and reruns the model.
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        {fixes.map((fix) => (
          <div key={fix.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: 'rgba(0,0,0,0.18)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(238,239,211,0.08)' }}>
            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: swatch.pistachio }}>{fix.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: riskColor(fix.risk), background: 'rgba(238,239,211,0.06)', borderRadius: 999, padding: '2px 8px' }}>{fix.risk} risk</span>
                <span style={{ fontSize: 12, fontFamily: font.mono, color: swatch.emerald }}>{fix.impact}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(238,239,211,0.65)', lineHeight: 1.45 }}>{fix.description}</div>
            </div>
            <button
              type="button"
              onClick={() => onApplyFix(fix)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: '0 0 auto', background: swatch.lemon, color: swatch.midnight, border: 'none', borderRadius: radius.sm, padding: '10px 14px', fontWeight: 700, fontSize: 13, fontFamily: font.family, cursor: 'pointer', minHeight: 44 }}
            >
              Apply {fix.label} <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      {structurePreview && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(238,239,211,0.1)' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(238,239,211,0.55)', marginBottom: 8 }}>
            Model-only structure comparisons
          </div>
          <div style={{ marginBottom: 8, fontSize: 11.5, color: 'rgba(238,239,211,0.58)' }}>
            Current 30-year P&amp;I ${Math.round(structurePreview.currentMonthlyPI).toLocaleString('en-US')}/mo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: swatch.pistachio }}>40-year model</div>
              <div style={{ marginTop: 3, fontSize: 12, color: 'rgba(238,239,211,0.68)' }}>
                P&amp;I ${Math.round(structurePreview.fortyYear.monthlyPI).toLocaleString('en-US')}/mo · {structurePreview.fortyYear.dscr.toFixed(2)}x DSCR
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: swatch.pistachio }}>IO recast model</div>
              <div style={{ marginTop: 3, fontSize: 12, color: 'rgba(238,239,211,0.68)', lineHeight: 1.45 }}>
                P&amp;I ${Math.round(structurePreview.interestOnly.monthlyPI).toLocaleString('en-US')}/mo · {structurePreview.interestOnly.dscr.toFixed(2)}x during IO<br />
                P&amp;I ${Math.round(structurePreview.interestOnly.recastMonthlyPI).toLocaleString('en-US')}/mo · {structurePreview.interestOnly.recastDscr.toFixed(2)}x after recast
              </div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.48)', margin: '9px 0 0', lineHeight: 1.45 }}>
            Uses the current balance and rate. IO assumes 10 years without principal reduction, then a 20-year recast at the same rate; actual product terms, pricing, and underwriting can differ.
          </p>
        </div>
      )}
      <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.48)', margin: '12px 0 0', lineHeight: 1.45 }}>
        These are scenario changes, not lender terms or approval outcomes. Confirm rent, pricing, and financing assumptions before acting.
      </p>
    </section>
  );
}
