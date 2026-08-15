import React, { useMemo, useState } from "react";
import { DcShell, dc, Mono, CountUp, H1, H2, Lead } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { stdToTco, tcoThresholdTable } from "../engine/tcoThreshold";
import { PremiumSlider } from "../components/PremiumUI";

/**
 * TCO Threshold Converter — house tool-page structure (see LenderIntelPage /
 * DSCRCalculatorPage): the page ships its OWN dark section grounds instead of
 * floating loose markup on DcShell's pistachio shell.
 *
 *   1. HERO      · dc.teal  — copy left / the conversion explained right
 *   2. CONVERTER · dc.dark  — symmetric 1fr 1fr: inputs (light card) | readout (dark card)
 *   3. REFERENCE · dc.cream — the 7-step conversion ladder, 7 equal columns
 *   4. BottomCTA            — shared component, full-bleed (NOT nested in a narrow div)
 *
 * SURFACE DECISION (deliberate, per PremiumUI's constraints): PremiumSlider
 * hardcodes dark ink (swatch.rainforest label / swatch.midnight value), so it is
 * a LIGHT-surface component. The converter band is dark, so the inputs column is
 * a white card (dc.card) — the slider stays legible and the light fill reads as
 * "the panel you drive". The readout column is dc.teal because the risk ramp
 * (dc.emerald / dc.risk.warning) only clears AA on a dark ground; those same
 * accents fail contrast as text on white. Fill differs by function, not whim.
 */

const CONVERSION_STANDARDS = [0.75, 1.0, 1.1, 1.15, 1.2, 1.25, 1.3];

// The floor every DSCR program is scored against, and the ceiling of the live
// meter (the standard-DSCR slider tops out at 1.5x).
const DSCR_FLOOR = 1.0;
const METER_MAX = 1.5;

// ── Shared type specs — one vocabulary, so the vertical rhythm stays even. ──
const eyebrowOnDark: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: dc.tracking.caps,
  textTransform: "uppercase",
  color: dc.emerald,
};
const eyebrowOnLight: React.CSSProperties = { ...eyebrowOnDark, color: dc.rain };
const microLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: dc.tracking.wide,
  textTransform: "uppercase",
};
// Cream at low alpha — the house hairline/fill on the dark ground (same values
// the dc.Card primitive and every shipping tool page use). No new colors.
const HAIRLINE_ON_DARK = "rgba(238,239,211,0.16)";
const FILL_ON_DARK = "rgba(238,239,211,0.07)";

export default function TCOThresholdPage({
  onBack,
  onNavigate = () => {},
}: {
  onBack: () => void;
  onNavigate?: (view: any) => void;
}) {
  React.useEffect(() => {
    document.title = "TCO Threshold Converter | Greenstreet Finance";
  }, []);

  // ── Inputs ──
  const [standardDscr, setStandardDscr] = useState(1.25);
  const [reserveLoad, setReserveLoad] = useState(38.89);

  // ── Engine ──
  const result = useMemo(() => {
    try {
      const tcoDscr = stdToTco(standardDscr, reserveLoad / 100);
      return { tcoDscr };
    } catch {
      return null;
    }
  }, [standardDscr, reserveLoad]);

  const tableRows = useMemo(
    () => tcoThresholdTable(CONVERSION_STANDARDS, reserveLoad / 100),
    [reserveLoad],
  );

  const hasResult = result !== null && Number.isFinite(result.tcoDscr);
  const tco = hasResult ? result!.tcoDscr : 0;
  const clearsFloor = tco >= DSCR_FLOOR;
  // ONE risk ramp: emerald = clears, dc.risk.warning (amber #e6b84d) = fragile /
  // sub-threshold. Both clear AA on the dark teal readout card (5.0:1 and 6.3:1).
  const verdictInk = clearsFloor ? dc.emerald : dc.risk.warning;
  const meterPct = Math.max(0, Math.min(1, tco / METER_MAX)) * 100;
  const floorPct = (DSCR_FLOOR / METER_MAX) * 100;

  return (
    // accent is back-compat on DcShell (the shared SiteNav owns the chrome now) —
    // passed for parity with the other tool pages.
    <DcShell onNavigate={onNavigate} accent={dc.teal}>
      <style>{`
        /* src/index.css sets "#root .u-text-style-h1 { font-size: … !important }"
           (up to 5.5rem / 77px), so an inline fontSize on <H1> is dead markup —
           at 77px this 20-character title cannot fit the hero column and breaks
           mid-phrase. Same specificity + !important is the only lever available
           from inside a page file; scoped to .tco-h1 so nothing else moves. */
        #root .tco-h1.u-text-style-h1{
          font-size:clamp(34px,4.2vw,60px) !important;
          line-height:1.03 !important;
          letter-spacing:-0.035em !important;
        }
        /* Conversion ladder — always an EQUAL-column grid, never auto-fit. */
        .tco-ladder{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px;}
        @media (max-width:1240px){.tco-ladder{grid-template-columns:repeat(4,minmax(0,1fr));}}
        @media (max-width:860px){.tco-ladder{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media (max-width:420px){.tco-ladder{grid-template-columns:minmax(0,1fr);}}
        /* PremiumSlider ships a 6px track; give it a real touch target on mobile. */
        @media (max-width:767px){.tco-controls input[type="range"]{min-height:44px;}}
      `}</style>

      {/* ── 1 · HERO — dark teal, copy left / the conversion explained right ── */}
      <section
        style={{
          background: dc.teal,
          color: dc.cream,
          padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(56px,7vh,88px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            id="gs-hero-content"
            className="dc-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 0.95fr",
              gap: "clamp(32px,5vw,72px)",
              alignItems: "center",
            }}
          >
            {/* Left — copy */}
            <div>
              <div style={{ ...eyebrowOnDark, marginBottom: 20 }}>Tools · Threshold converter</div>
              <H1 className="tco-h1" style={{ maxWidth: "24ch", margin: "0 0 20px" }}>
                TCO vs Standard DSCR
              </H1>
              <Lead style={{ color: dc.ink.dim, maxWidth: "54ch", margin: "0 0 12px" }}>
                Convert standard Gross-Rent DSCR into True Cost of Ownership (TCO) DSCR, which
                loads CapEx and Maintenance reserves into the denominator.
              </Lead>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: dc.ink.secondary,
                  margin: 0,
                  maxWidth: "54ch",
                }}
              >
                How to use: set your standard DSCR and the reserve load below. The TCO equivalent
                and the full conversion ladder update as you drag.
              </p>
            </div>

            {/* Right — the formula, stated once, as a legend (no live figure here:
                the live number lives in the converter, and nothing renders twice). */}
            <div
              style={{
                background: FILL_ON_DARK,
                border: `1px solid ${HAIRLINE_ON_DARK}`,
                borderRadius: dc.r.lg,
                padding: "clamp(20px,2.4vw,32px)",
              }}
            >
              <div style={{ ...eyebrowOnDark, color: dc.ink.secondary, marginBottom: 16 }}>
                The conversion
              </div>
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(13px,1.2vw,17px)",
                  fontWeight: 700,
                  color: dc.cream,
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                TCO DSCR = Standard DSCR ÷ (1 + reserve load)
              </Mono>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    term: "Standard DSCR",
                    gloss: "Gross rent ÷ PITIA — the number the lender scores.",
                  },
                  {
                    term: "Reserve load",
                    gloss: "CapEx, maintenance and vacancy the gross-rent view leaves out.",
                  },
                  {
                    term: "TCO DSCR",
                    gloss: "What the property carries once those reserves are funded.",
                  },
                ].map((t) => (
                  <div
                    key={t.term}
                    style={{
                      background: FILL_ON_DARK,
                      border: `1px solid ${HAIRLINE_ON_DARK}`,
                      borderRadius: dc.r.md,
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ ...microLabel, color: dc.emerald, marginBottom: 4 }}>{t.term}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: dc.ink.secondary }}>
                      {t.gloss}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · CONVERTER — dark ground, symmetric 1fr 1fr ── */}
      <section
        id="tco-tool"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(64px,9vh,112px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ marginBottom: 36, maxWidth: "62ch" }}>
            <div style={{ ...eyebrowOnDark, marginBottom: 12 }}>Live converter</div>
            <H2
              style={{
                fontSize: "clamp(22px,3.4vw,44px)",
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 10px",
              }}
            >
              What the same deal looks like with reserves loaded
            </H2>
            <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, color: dc.ink.secondary, margin: 0 }}>
              Two inputs, one number. Drag either slider — the TCO equivalent and its position
              against the 1.00 floor update instantly.
            </p>
          </div>

          <div
            className="dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            {/* LEFT · inputs — LIGHT card by design (PremiumSlider hardcodes dark ink) */}
            <div
              className="tco-controls"
              style={{
                background: dc.card,
                border: `1px solid ${dc.border}`,
                borderRadius: dc.r.lg,
                padding: "clamp(24px,2.6vw,32px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ ...eyebrowOnLight, marginBottom: 8 }}>Your inputs</div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: dc.muted, margin: "0 0 24px" }}>
                Estimates are fine — every figure on this page recalculates as you drag.
              </p>

              <PremiumSlider
                label="Standard DSCR"
                value={standardDscr}
                min={0.75}
                max={1.5}
                step={0.05}
                formatValue={(v) => `${v}x`}
                onChange={setStandardDscr}
              />
              <PremiumSlider
                label="Reserve Load vs PITIA"
                value={reserveLoad}
                min={15}
                max={60}
                step={0.1}
                formatValue={(v) => `${v}%`}
                onChange={setReserveLoad}
              />

              <div style={{ height: 1, background: dc.border, margin: "0 0 20px" }} />
              <div>
                <div style={{ ...microLabel, color: dc.rain, marginBottom: 8 }}>
                  Why 38.89%
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: dc.muted, margin: 0 }}>
                  A 38.89% reserve load represents typical institutional CapEx, Maintenance, and
                  Vacancy reserves applied atop standard PITIA payments. Raise it for older stock
                  or heavier turnover; lower it for new construction under warranty.
                </p>
              </div>
            </div>

            {/* RIGHT · readout — DARK card so the risk ramp reads at AA contrast */}
            <div
              className="dc-results-first"
              style={{
                background: dc.teal,
                border: `1px solid ${HAIRLINE_ON_DARK}`,
                borderRadius: dc.r.lg,
                padding: "clamp(24px,2.6vw,32px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ ...eyebrowOnDark, color: dc.ink.secondary, marginBottom: 12 }}>
                TCO equivalent
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                {hasResult ? (
                  <CountUp
                    value={tco}
                    decimals={2}
                    suffix="x"
                    style={{
                      fontSize: "clamp(28px,5vw,64px)",
                      fontWeight: 700,
                      color: verdictInk,
                      lineHeight: 1,
                    }}
                  />
                ) : (
                  <Mono style={{ fontSize: "clamp(28px,5vw,64px)", fontWeight: 700, color: dc.cream, lineHeight: 1 }}>
                    —
                  </Mono>
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: dc.ink.secondary }}>TCO DSCR</span>
              </div>

              <div style={{ fontSize: 15, fontWeight: 600, color: verdictInk, marginBottom: 20 }}>
                {clearsFloor
                  ? "Clears the 1.00 floor with reserves funded"
                  : "Below the 1.00 floor once reserves are funded"}
              </div>

              {/* Inputs restated next to the output — a readout, not a second copy
                  of the controls. */}
              <div
                className="tp-split gs-reveal"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}
              >
                {[
                  { label: "Standard DSCR", val: `${standardDscr.toFixed(2)}x` },
                  { label: "Reserve load", val: `${reserveLoad.toFixed(2)}%` },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{ background: FILL_ON_DARK, borderRadius: dc.r.md, padding: "12px 16px" }}
                  >
                    <Mono style={{ display: "block", fontSize: 20, fontWeight: 700, color: dc.cream, lineHeight: 1 }}>
                      {s.val}
                    </Mono>
                    <div style={{ ...microLabel, color: dc.ink.secondary, marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Where this lands against the 1.00 floor — rendered once, here. */}
              <div style={{ marginTop: "auto" }}>
                <div style={{ ...microLabel, color: dc.ink.secondary, marginBottom: 12 }}>
                  Against the 1.00 floor
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 10,
                    borderRadius: dc.r.pill,
                    background: "rgba(238,239,211,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${meterPct}%`,
                      background: verdictInk,
                      borderRadius: dc.r.pill,
                      transition: "width .45s cubic-bezier(.16,.84,.44,1), background-color .3s",
                    }}
                  />
                  {/* the 1.00 floor tick, sitting exactly above its label below */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: `${floorPct}%`,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      marginLeft: -1,
                      background: dc.cream,
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 20,
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    color: dc.ink.secondary,
                  }}
                >
                  <span style={{ position: "absolute", left: 0 }}>0.00x</span>
                  <span
                    style={{
                      position: "absolute",
                      left: `${floorPct}%`,
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                      color: dc.cream,
                    }}
                  >
                    1.00 floor
                  </span>
                  <span style={{ position: "absolute", right: 0 }}>1.50x</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: dc.ink.secondary, margin: "16px 0 0" }}>
                  Lenders score the standard number. This is the one that decides whether the
                  property funds its own reserves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 · REFERENCE — light band, 7 equal columns ── */}
      <section style={{ background: dc.cream, color: dc.light, padding: `clamp(48px,6vw,80px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ marginBottom: 24, maxWidth: "62ch" }}>
            <div style={{ ...eyebrowOnLight, marginBottom: 12 }}>Conversion reference</div>
            <H2
              style={{
                fontSize: "clamp(21px,3vw,40px)",
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 10px",
                color: dc.light,
              }}
            >
              Every standard threshold, at a {reserveLoad.toFixed(2)}% reserve load
            </H2>
            {/* dc.rain, not dc.muted: on the cream ground dc.muted lands at 4.33:1
                (under AA). dc.rain clears it at 5.9:1 and ties to the eyebrow. */}
            <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, color: dc.rain, margin: 0 }}>
              The ladder moves with the reserve-load slider. Your current standard DSCR is marked.
            </p>
          </div>

          <div className="tco-ladder">
            {tableRows.map((row) => {
              // Epsilon compare — slider values are floats, `===` misses 1.15.
              const isActive = Math.abs(row.standard - standardDscr) < 0.001;
              const rowClears = row.tco >= DSCR_FLOOR;
              return (
                <div
                  key={row.standard}
                  style={{
                    background: isActive ? dc.panel : dc.card,
                    border: `${isActive ? 1.5 : 1}px solid ${isActive ? dc.light : dc.border}`,
                    borderRadius: dc.r.lg,
                    padding: "20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ ...microLabel, color: dc.rain }}>
                    {isActive ? "Your input" : "Standard"}
                  </div>
                  {/* dc.rain clears AA on BOTH tile fills (6.9:1 white, 5.5:1 mint);
                      dc.muted would drop to 4.2:1 on the active mint tile. */}
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: dc.rain, lineHeight: 1 }}>
                    {row.standard.toFixed(2)}x
                  </Mono>
                  <div aria-hidden style={{ height: 1, background: dc.border, margin: "4px 0" }} />
                  <div style={{ ...microLabel, color: dc.rain }}>TCO</div>
                  <Mono style={{ fontSize: 26, fontWeight: 700, color: dc.light, lineHeight: 1 }}>
                    {row.tco.toFixed(2)}x
                  </Mono>
                  {/* Status is carried by the WORDS in full-contrast ink; the ramp
                      colour is a dot, never the text (no colour-only meaning, no
                      low-contrast accent text on a light ground). */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: dc.r.pill,
                        background: rowClears ? dc.emerald : dc.risk.warning,
                        flex: "0 0 auto",
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: dc.light, lineHeight: 1.3 }}>
                      {rowClears ? "clears 1.00" : "below 1.00"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4 · Shared CTA band — full-bleed sibling section, not nested ── */}
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
