import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead } from "../design/dc";
import { Mono } from "../components/PremiumUI";
import { radius, font } from "../theme";
import BottomCTA from "../design/BottomCTA";

// ── Who-We-Serve: Real Estate Investors (primary wedge) ───────────────────────
// Signature: the Door Ladder — an illustrative property-level coverage model.
// Actual borrower and portfolio requirements vary by provider and program.

const fmt$ = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

type Door = { rent: number; pay: number };
const START: Door[] = [
  { rent: 2400, pay: 1850 },
  { rent: 3100, pay: 2450 },
  { rent: 2800, pay: 2300 },
];
export default function InvestorsPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "DSCR Loans for Real Estate Investors | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const [doors, setDoors] = useState<Door[]>(START);
  const totalRent = doors.reduce((s, d) => s + d.rent, 0);
  const totalPay = doors.reduce((s, d) => s + d.pay, 0);
  const blended = totalPay > 0 ? totalRent / totalPay : 0;
  const cashFlow = totalRent - totalPay;

  const setDoor = (i: number, k: keyof Door, v: number) =>
    setDoors((ds) => ds.map((d, j) => (j === i ? { ...d, [k]: v } : d)));
  const addDoor = () => setDoors((ds) => [...ds, { rent: 2600, pay: 2050 }]);
  const removeDoor = (i: number) => setDoors((ds) => (ds.length > 1 ? ds.filter((_, j) => j !== i) : ds));

  const numIn = (v: number, set: (n: number) => void, step: number, label = "amount") => (
    <input className="inv-number-input" type="number" inputMode="decimal" min={0} aria-label={label} step={step} value={v} onChange={(e) => set(+e.target.value)}
      style={{ width: 78, border: "none", borderBottom: "1.5px solid rgba(238,239,211,0.25)", background: "none", color: dc.cream, fontFamily: dc.mono, fontWeight: 700, fontSize: 15, padding: "4px 2px", letterSpacing: "-0.02em" }} />
  );

  const navigateLink = (view: string) => ({
    href: `#${view}`,
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onNavigate(view);
    },
  });

  const navLinks = [
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "Programs", view: "lender-intel" },
    { label: "Portfolio", view: "portfolio" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Run my deal →", view: "dscr-calculator" }}>
      <style>{`
        .inv-link:focus-visible,
        .investors-page button:focus-visible,
        .investors-page input:focus-visible {
          outline: 3px solid ${dc.lemon};
          outline-offset: 3px;
        }
        .inv-hero > *,
        .inv-grid > *,
        .inv-metrics > *,
        .inv-band > * {
          min-width: 0;
        }
        @media(max-width:760px){
          .inv-hero,
          .inv-grid,
          .inv-band {
            grid-template-columns:minmax(0, 1fr) !important;
          }
          .inv-summary {
            position: static !important;
          }
          .inv-door {
            display: grid !important;
            grid-template-columns: auto minmax(0, 1fr) auto;
            margin-left: 0 !important;
          }
          .inv-door-index {
            grid-column: 1;
            grid-row: 1;
          }
          .inv-door-fields {
            grid-column: 1 / -1;
            grid-row: 2;
            width: 100%;
          }
          .inv-door-output {
            grid-column: 2;
            grid-row: 1;
            justify-self: end;
            margin-left: 0 !important;
          }
          .inv-door-remove {
            grid-column: 3;
            grid-row: 1;
          }
          .inv-actions {
            align-items: stretch;
            flex-direction: column;
          }
          .inv-actions .inv-link {
            box-sizing: border-box;
            justify-content: center;
            text-align: center;
            width: 100%;
          }
        }
        @media(max-width:420px){
          .inv-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .inv-metrics {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .inv-door-fields {
            display: grid !important;
            gap: 12px !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          .inv-door-field {
            align-items: stretch !important;
            display: grid !important;
            gap: 5px !important;
          }
          .inv-number-input {
            box-sizing: border-box;
            width: 100% !important;
          }
          .investors-page {
            overflow-wrap: anywhere;
          }
        }
      `}</style>

      <div className="investors-page" id="main-content">

      {/* ── HERO ── */}
      <section className="inv-section" aria-labelledby="investors-page-title" style={{ position: "relative", background: dc.teal, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero inv-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 100, marginBottom: 24 }}>For Real Estate Investors</div>
            <H1 id="investors-page-title" style={{ margin: "0 0 18px", maxWidth: "14ch" }}>Model each rental on its own cash flow.</H1>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "48ch", margin: "0 0 30px" }}>
              DSCR programs generally emphasize property rent relative to the proposed payment, while borrower credit, assets, reserves, entity, portfolio, and documentation requirements may still apply. Use this page to compare property-level and blended scenarios.
            </Lead>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(238,239,211,0.62)", maxWidth: "58ch", margin: "-14px 0 24px" }}>
              Programs, rates, terms, and availability vary by provider, property, borrower, and market. Any examples are illustrative, not guaranteed, and remain subject to provider underwriting and approval.
            </p>
            <div className="inv-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a {...navigateLink("dscr-calculator")} className="inv-link" style={{ display: "inline-flex", background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family, textDecoration: "none" }}>Run an illustrative deal →</a>
              <a {...navigateLink("portfolio")} className="inv-link" style={{ display: "inline-flex", background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 15, border: "1.5px solid rgba(238,239,211,0.5)", cursor: "pointer", padding: "14px 24px", borderRadius: radius.sm, fontFamily: font.family, textDecoration: "none" }}>Model a portfolio</a>
            </div>
          </div>
          <div className="inv-metrics" role="group" aria-label="Illustrative editable scenario metrics" style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(20px,2.5vw,30px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[{ v: doors.length, l: "scenario doors" }, { v: blended.toFixed(2) + "x", l: "modeled DSCR" }, { v: fmt$(cashFlow) + "/mo", l: "modeled difference" }, { v: "Rent", l: "illustrative basis" }].map((t, i) => (
              <div key={i} style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "16px 14px" }}>
                <Mono style={{ fontSize: 26, fontWeight: 700, color: dc.cream, display: "block", lineHeight: 1 }}>{t.v}</Mono>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginTop: 6 }}>{t.l}</div>
              </div>
            ))}
            <p style={{ gridColumn: "1 / -1", fontSize: 12, lineHeight: 1.5, color: "rgba(238,239,211,0.58)", margin: "2px 0 0" }}>These values update only from the inputs on this page. They are not live lender data, qualification results, or an approval.</p>
          </div>
        </div>
      </section>

      {/* ── THE DOOR LADDER ── */}
      <section className="inv-section" aria-labelledby="door-ladder-title" style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>The door ladder</div>
          <h2 id="door-ladder-title" className="gs-reveal" style={{ fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04, margin: "0 0 10px", maxWidth: "20ch" }}>Compare each door, then review the blend.</h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(238,239,211,0.6)", margin: "0 0 32px", maxWidth: "58ch", lineHeight: 1.5 }}>Edit each door's rent and payment to see property-level and blended DSCR. This is an educational cash-flow model, not a qualification or portfolio approval.</p>

          <div className="inv-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
            {/* ladder */}
            <div style={{ display: "flex", flexDirection: "column-reverse", gap: 10 }}>
              {doors.map((d, i) => {
                const ds = d.pay > 0 ? d.rent / d.pay : 0;
                return (
                  <div key={i} className="inv-door" style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: `${Math.min(i, 8) * 26}px`, background: dc.teal, border: "1px solid rgba(238,239,211,0.18)", borderRadius: radius.md, padding: "14px 18px" }}>
                    <Mono className="inv-door-index" style={{ fontSize: 18, fontWeight: 700, color: "rgba(238,239,211,0.5)", width: 34 }}>{String(i + 1).padStart(2, "0")}</Mono>
                    <div className="inv-door-fields" style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(238,239,211,0.6)" }}>
                      <label className="inv-door-field" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>rent</span>
                        {numIn(d.rent, (v) => setDoor(i, "rent", v), 50, `Door ${i + 1} monthly rent`)}
                      </label>
                      <label className="inv-door-field" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>payment</span>
                        {numIn(d.pay, (v) => setDoor(i, "pay", v), 50, `Door ${i + 1} monthly payment`)}
                      </label>
                    </div>
                    <Mono as="output" className="inv-door-output" aria-label={`Door ${i + 1} modeled DSCR`} style={{ marginLeft: "auto", fontSize: 18, fontWeight: 700, color: dc.cream }}>{ds.toFixed(2)}x</Mono>
                    <button type="button" className="inv-door-remove" onClick={() => removeDoor(i)} disabled={doors.length === 1} aria-label={`Remove door ${i + 1} from this scenario`} title={`Remove door ${i + 1}`} style={{ background: "none", border: "none", color: "rgba(238,239,211,0.62)", cursor: doors.length === 1 ? "not-allowed" : "pointer", opacity: doors.length === 1 ? 0.4 : 1, fontSize: 18, lineHeight: 1, fontFamily: font.family }}>×</button>
                  </div>
                );
              })}
              <button type="button" onClick={addDoor} style={{ alignSelf: "flex-start", marginTop: 6, background: "transparent", border: "1.5px dashed rgba(238,239,211,0.3)", color: dc.cream, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "12px 22px", borderRadius: radius.sm, fontFamily: font.family }}>+ Add a door to this scenario</button>
            </div>

            {/* portfolio summary */}
            <aside className="inv-summary" aria-labelledby="portfolio-summary-title" style={{ background: dc.teal, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(22px,2.6vw,30px)", position: "sticky", top: 96 }}>
              <h3 id="portfolio-summary-title" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, margin: "0 0 16px" }}>Illustrative blended scenario</h3>
              <Mono style={{ fontSize: "clamp(44px,6vw,68px)", fontWeight: 700, color: dc.lemon, lineHeight: 0.9, display: "block" }}>{doors.length}</Mono>
              <div style={{ fontSize: 13, color: "rgba(238,239,211,0.62)", marginTop: 4, marginBottom: 22 }}>doors in this editable scenario</div>
              {[{ l: "Modeled DSCR", v: blended.toFixed(2) + "x" }, { l: "Modeled difference", v: fmt$(cashFlow) + "/mo" }, { l: "Input gross rent", v: fmt$(totalRent) + "/mo" }].map((r) => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                  <span style={{ fontSize: 13, color: "rgba(238,239,211,0.6)" }}>{r.l}</span>
                  <Mono style={{ fontSize: 16, fontWeight: 700, color: dc.cream }}>{r.v}</Mono>
                </div>
              ))}
              <p style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(238,239,211,0.58)", margin: "14px 0 0" }}>Calculated only from the editable inputs above; not lender-maintained portfolio data or an underwriting result.</p>
              <a {...navigateLink("portfolio")} className="inv-link" style={{ boxSizing: "border-box", display: "inline-flex", justifyContent: "center", width: "100%", marginTop: 18, background: dc.emerald, color: dc.dark, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: "13px", borderRadius: radius.sm, fontFamily: font.family, textDecoration: "none" }}>Open a portfolio scenario →</a>
            </aside>
          </div>
        </div>
      </section>

      {/* ── WHY DSCR SCALES ── */}
      <section className="inv-section" aria-labelledby="investor-program-context-title" style={{ background: dc.teal, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 id="investor-program-context-title" className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>Context for multi-property scenarios.</h2>
          <div className="gs-reveal dc-band-3 inv-band" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { t: "Property-income focus", s: "Many DSCR programs focus primarily on rent coverage, but borrower credit, assets, reserves, and documentation may still apply." },
              { t: "Entity scenarios", s: "Compare entity-vesting assumptions, then confirm eligibility, documents, guarantees, and legal effects with the relevant professionals." },
              { t: "Consistent inputs", s: "Reuse the same rent, payment, and stress assumptions across properties without implying a provider decision or financing commitment." },
            ].map((v) => (
              <div key={v.t} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: dc.cream, letterSpacing: "-0.02em", margin: "0 0 8px" }}>{v.t}</h3>
                <div style={{ fontSize: 14, color: "rgba(238,239,211,0.6)", lineHeight: 1.5 }}>{v.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} cards={[
        { bg: dc.lemon, fg: dc.dark, blurb: "Explore an educational property scenario. Calculator use is not an application, credit decision, or underwriting submission.", title: "Model my next deal", view: "dscr-calculator" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "Combine property inputs into one illustrative blended-DSCR view.", title: "Blend my portfolio", view: "portfolio" },
      ]} />
      </div>
    </DcShell>
  );
}
