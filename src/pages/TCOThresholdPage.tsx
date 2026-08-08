import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { stdToTco, tcoThresholdTable } from "../engine/tcoThreshold";
import { PremiumSlider } from "../components/PremiumUI";
import { risk, LEMON, MIDNIGHT } from "../theme";

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

  const tableRows = useMemo(() => tcoThresholdTable([0.75, 1.0, 1.1, 1.15, 1.2, 1.25, 1.3], reserveLoad / 100), [reserveLoad]);

  return (
    <DcShell onNavigate={onNavigate}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <H1>TCO vs Standard DSCR</H1>
        <Lead>
          Convert standard Gross-Rent DSCR into True Cost of Ownership (TCO) DSCR, 
          which loads CapEx and Maintenance reserves into the denominator.
        </Lead>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginTop: 40 }}>
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PremiumSlider label="Standard DSCR" value={standardDscr} min={0.75} max={1.5} step={0.05} formatValue={(v) => `${v}x`} onChange={setStandardDscr} />
            <PremiumSlider label="Reserve Load vs PITIA" value={reserveLoad} min={15} max={60} step={0.1} formatValue={(v) => `${v}%`} onChange={setReserveLoad} />
            
            <div style={{ marginTop: 24, padding: 20, background: "rgba(0,55,56,0.04)", borderRadius: dc.r.md, border: `1px solid ${dc.border}` }}>
              <div style={{ fontSize: 14, color: dc.muted, marginBottom: 12 }}>
                <strong>Formula:</strong> TCO DSCR = Standard DSCR / (1 + Reserve Load %)
              </div>
              <div style={{ fontSize: 13, color: "rgba(0,55,56,0.66)", lineHeight: 1.5 }}>
                A 38.89% reserve load represents typical institutional CapEx, Maintenance, and Vacancy reserves applied atop standard PITIA payments.
              </div>
            </div>
          </div>

          {/* Outputs */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: dc.card, borderRadius: dc.r.lg, padding: 24, border: `1px solid ${dc.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: dc.muted, textTransform: "uppercase", marginBottom: 12 }}>
                  TCO Equivalent
                </div>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: result.tcoDscr < 1.0 ? LEMON : dc.emerald, letterSpacing: "-0.02em" }}>
                    {result.tcoDscr.toFixed(2)}x
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: dc.muted }}>TCO DSCR</div>
                </div>
              </div>

              <div style={{ background: dc.panel, borderRadius: dc.r.md, padding: 20, border: `1px solid ${dc.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: dc.muted, textTransform: "uppercase", marginBottom: 16 }}>
                  Standard Conversion Table (38.89% Load)
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", borderBottom: `1px solid ${dc.border}`, paddingBottom: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: dc.muted, fontWeight: 600 }}>Standard DSCR</div>
                  <div style={{ fontSize: 12, color: dc.muted, fontWeight: 600, textAlign: "right" }}>TCO DSCR</div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tableRows.map((row) => (
                    <div key={row.standard} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <Mono style={{ fontSize: 14, color: row.standard === standardDscr ? dc.light : dc.muted }}>
                        {row.standard.toFixed(2)}x
                      </Mono>
                      <Mono style={{ fontSize: 14, textAlign: "right", color: row.tco < 1.0 ? LEMON : (row.standard === standardDscr ? dc.emerald : dc.muted) }}>
                        {row.tco.toFixed(2)}x
                      </Mono>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <BottomCTA onNavigate={onNavigate} />
      </div>
    </DcShell>
  );
}
