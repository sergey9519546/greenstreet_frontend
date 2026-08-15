import React, { useEffect, useRef, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font, risk, onDark, tracking } from "../theme";
import BottomCTA from "../design/BottomCTA";
import ComplianceNote from "../design/ComplianceNote";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import PropertyInvestmentStrategySection from "../components/PropertyInvestmentStrategySection";
import DSCRInvestorMindsetSection from "../components/DSCRInvestorMindsetSection";

const RED = risk.danger;
const HAIRLINE = "rgba(238,239,211,0.14)";
const SURFACE = "rgba(238,239,211,0.05)";
const RULE = "rgba(238,239,211,0.55)";
const fmt$ = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const pad2 = (n: number) => String(n).padStart(2, "0");

type Door = { id: string; rent: number; pay: number };
const START: Door[] = [
  { id: "door-1", rent: 2400, pay: 1850 },
  { id: "door-2", rent: 3100, pay: 2450 },
  { id: "door-3", rent: 2800, pay: 2300 },
];
const NEW_DOOR = { rent: 2600, pay: 2050 };
const DTI_CEILING = 4;

const LANE_MAX = 2;
const lanePct = (d: number) => Math.max(0, Math.min(1, d / LANE_MAX)) * 100;

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function InvestorsPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "DSCR Real Estate Investment Loans & Strategy Guide | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const [doors, setDoors] = useState<Door[]>(START);
  const seq = useRef(START.length);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const totalRent = doors.reduce((s, d) => s + d.rent, 0);
  const totalPay = doors.reduce((s, d) => s + d.pay, 0);
  const blended = totalPay > 0 ? totalRent / totalPay : 0;
  const cashFlow = totalRent - totalPay;

  useEffect(() => {
    if (!freshId) return;
    const t = window.setTimeout(() => setFreshId(null), 2200);
    return () => window.clearTimeout(t);
  }, [freshId]);

  const setDoor = (id: string, k: "rent" | "pay", v: number) =>
    setDoors((ds) => ds.map((d) => (d.id === id ? { ...d, [k]: v } : d)));

  const addDoor = () => {
    const id = `door-${++seq.current}`;
    setDoors((ds) => [...ds, { id, ...NEW_DOOR }]);
    setFreshId(id);
    setStatus(
      `Door ${pad2(doors.length + 1)} added at ${(NEW_DOOR.rent / NEW_DOOR.pay).toFixed(2)}x, on its own rent. No other door's DSCR changed.`
    );
  };

  const removeDoor = (id: string, n: number) => {
    if (doors.length <= 1) {
      setStatus("Keep at least one door to compare against the 1.00x line.");
      return;
    }
    setDoors((ds) => ds.filter((d) => d.id !== id));
    if (freshId === id) setFreshId(null);
    setStatus(`Door ${pad2(n)} removed. No remaining door's DSCR changed.`);
  };

  const moneyField = (label: string, srLabel: string, v: number, set: (n: number) => void) => (
    <label style={{ position: "relative", display: "block", minWidth: 0 }}>
      <span style={srOnly}>{srLabel}</span>
      <span
        aria-hidden="true"
        className="dn-fieldlabel"
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: tracking.wide, textTransform: "uppercase", color: onDark.secondary, marginBottom: 5 }}
      >
        {label}
      </span>
      <CurrencyInput
        value={v}
        onChange={set}
        prefix="$"
        decimals={0}
        style={{ width: "100%", minHeight: 44, fontSize: 15 }}
        inputStyle={{ fontWeight: 600 }}
      />
    </label>
  );

  const navLinks = [
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "STR Tool", view: "tools/str-underwriting" },
    { label: "Tax Engine", view: "tools/tax-engine" },
    { label: "Rate Quiz", view: "rate-quiz" },
    { label: "Portfolio", view: "portfolio" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Price a Deal →", view: "dscr-calculator" }}>
      <style>{`
        .dn-head,.dn-row{
          display:grid;align-items:center;column-gap:14px;
          grid-template-columns:96px minmax(112px,158px) minmax(112px,158px) minmax(150px,1fr) 96px 32px;
          grid-template-areas:"tag rent pay lane dscr rm";
        }
        .dn-head{align-items:end;padding:0 17px 10px 19px;}
        .dn-fieldlabel{display:none;}
        .dn-summary{position:sticky;top:96px;}
        @media(max-width:1120px){
          .inv-grid{grid-template-columns:minmax(0,1fr) !important;}
          .dn-summary{position:static;}
        }
        @media(max-width:860px){
          .dn-head{display:none;}
          .dn-fieldlabel{display:block;}
          .dn-row{
            grid-template-columns:minmax(0,1fr) 96px 32px;
            grid-template-areas:"tag dscr rm" "rent rent rent" "pay pay pay" "lane lane lane";
            row-gap:14px;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: "relative", background: dc.dark, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, background: "rgba(216,217,88,0.1)", border: "1px solid rgba(216,217,88,0.3)", padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
              The DSCR Investor Operating System
            </div>
            <H1 style={{ margin: "0 0 18px", maxWidth: "16ch" }}>Scale your rental portfolio without DTI limits.</H1>
            <Lead style={{ color: "rgba(238,239,211,0.78)", maxWidth: "52ch", margin: "0 0 30px" }}>
              Conventional lenders cap how many doors you can own based on your personal W-2 income and DTI. Greenstreet DSCR programs qualify each property strictly on its rental coverage, credit score, liquid reserves, and business-purpose LLC vesting.
            </Lead>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => onNavigate("dscr-calculator")} style={{ background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 28px", borderRadius: radius.sm, fontFamily: font.family, boxShadow: "0 4px 14px rgba(216,217,88,0.3)" }}>
                Run Scenario Tool →
              </button>
              <button onClick={() => onNavigate("rate-quiz")} style={{ background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 15, border: "1.5px solid rgba(238,239,211,0.4)", cursor: "pointer", padding: "14px 24px", borderRadius: radius.sm, fontFamily: font.family }}>
                Take Rate Quiz
              </button>
            </div>
          </div>
          <div style={{ background: "rgba(0,55,56,0.6)", borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.18)", padding: "clamp(20px,2.5vw,30px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            {[{ v: doors.length, l: "doors in model" }, { v: blended.toFixed(2) + "x", l: "blended DSCR" }, { v: fmt$(cashFlow) + "/mo", l: "net cash flow" }, { v: "ZERO", l: "DTI / Tax Returns" }].map((t, i) => (
              <div key={i} style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "16px 14px", border: "1px solid rgba(238,239,211,0.1)" }}>
                <Mono style={{ fontSize: 26, fontWeight: 700, color: i === 3 ? dc.lemon : dc.cream, display: "block", lineHeight: 1 }}>{t.v}</Mono>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.65)", marginTop: 6 }}>{t.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE PORTFOLIO DOOR CALCULATOR ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}`, borderTop: "1px solid rgba(238,239,211,0.1)" }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: tracking.caps, textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Door-by-Door Underwriting</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(22px,3.6vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 12px", maxWidth: "22ch" }}>Each property qualifies on its own rent.</h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: onDark.secondary, margin: "0 0 30px", maxWidth: "66ch", lineHeight: 1.5 }}>
            Adjust any property's monthly rent and payment below. The 1.00x line marks exact debt service coverage. Adding a new door brings its own rent without impacting any existing property's DSCR.
          </p>

          <div className="inv-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 28, alignItems: "start" }}>
            <div style={{ minWidth: 0 }}>
              <div className="dn-head" aria-hidden="true" style={{ fontSize: 11, fontWeight: 600, letterSpacing: tracking.wide, textTransform: "uppercase", color: onDark.secondary }}>
                <div style={{ gridArea: "tag" }}>Door</div>
                <div style={{ gridArea: "rent" }}>Monthly rent</div>
                <div style={{ gridArea: "pay" }}>Monthly payment</div>
                <div style={{ gridArea: "lane", position: "relative", height: 15, minWidth: 0 }}>
                  <span style={{ position: "absolute", left: 0, bottom: 0, color: onDark.faint }}>0</span>
                  <span style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", color: onDark.dim, whiteSpace: "nowrap" }}>1.00x</span>
                  <span style={{ position: "absolute", right: 0, bottom: 0, color: onDark.faint, whiteSpace: "nowrap" }}>{LANE_MAX.toFixed(2)}x</span>
                </div>
                <div style={{ gridArea: "dscr", textAlign: "right" }}>DSCR</div>
                <div style={{ gridArea: "rm" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {doors.map((d, i) => {
                  const ds = d.pay > 0 ? d.rent / d.pay : null;
                  const ok = ds !== null && ds >= 1.0;
                  const edge = ds === null ? "rgba(238,239,211,0.30)" : ok ? dc.emerald : RED;
                  const n = i + 1;
                  return (
                    <div
                      key={d.id}
                      className="dn-row"
                      style={{
                        background: SURFACE,
                        borderStyle: "solid",
                        borderWidth: "1px 1px 1px 3px",
                        borderColor: `${HAIRLINE} ${HAIRLINE} ${HAIRLINE} ${edge}`,
                        borderRadius: radius.md,
                        padding: "14px 16px",
                        transition: "outline-color .2s ease",
                        outline: `2px solid ${freshId === d.id ? RULE : "transparent"}`,
                        outlineOffset: 2,
                      }}
                    >
                      <div style={{ gridArea: "tag", display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: onDark.dim, letterSpacing: "-0.02em" }}>Door</span>
                        <Mono style={{ fontSize: 15, fontWeight: 700, color: dc.cream }}>{pad2(n)}</Mono>
                      </div>

                      <div style={{ gridArea: "rent", minWidth: 0 }}>
                        {moneyField("Monthly rent", `Door ${n} monthly rent`, d.rent, (v) => setDoor(d.id, "rent", v))}
                      </div>
                      <div style={{ gridArea: "pay", minWidth: 0 }}>
                        {moneyField("Monthly payment", `Door ${n} monthly payment`, d.pay, (v) => setDoor(d.id, "pay", v))}
                      </div>

                      <div style={{ gridArea: "lane", minWidth: 0 }} aria-hidden="true">
                        <div style={{ position: "relative", height: 12, borderRadius: radius.pill, background: "rgba(238,239,211,0.10)" }}>
                          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${lanePct(ds ?? 0)}%`, borderRadius: radius.pill, background: ds === null ? "transparent" : ok ? dc.emerald : RED, transition: "width .22s ease" }} />
                          <div style={{ position: "absolute", left: "50%", top: -5, bottom: -5, width: 2, marginLeft: -1, borderRadius: 1, background: RULE }} />
                          {ds !== null && ds > LANE_MAX && (
                            <span style={{ position: "absolute", right: -9, top: "50%", transform: "translateY(-50%)", fontSize: 13, lineHeight: 1, color: dc.emerald }}>›</span>
                          )}
                        </div>
                      </div>

                      <div style={{ gridArea: "dscr", textAlign: "right", minWidth: 0 }}>
                        <Mono style={{ display: "block", fontSize: 20, fontWeight: 700, lineHeight: 1.1, color: ds === null ? onDark.tertiary : ok ? dc.emerald : RED }}>
                          {ds === null ? "—" : ds.toFixed(2) + "x"}
                        </Mono>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: tracking.wide, textTransform: "uppercase", color: onDark.secondary, marginTop: 3 }}>
                          {ds === null ? "no payment" : ok ? "clears" : "short"}
                        </div>
                      </div>

                      <button
                        onClick={() => removeDoor(d.id, n)}
                        aria-label={`Remove door ${pad2(n)}`}
                        disabled={doors.length <= 1}
                        style={{ gridArea: "rm", justifySelf: "end", width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: `1px solid ${HAIRLINE}`, borderRadius: radius.sm, color: onDark.secondary, cursor: doors.length <= 1 ? "not-allowed" : "pointer", opacity: doors.length <= 1 ? 0.35 : 1, fontSize: 16, lineHeight: 1, fontFamily: font.family }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                <button onClick={addDoor} style={{ background: "transparent", border: `1.5px dashed ${onDark.tertiary}`, color: dc.cream, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "12px 22px", minHeight: 44, borderRadius: radius.sm, fontFamily: font.family }}>+ Add a door</button>
                <span style={{ fontSize: 13, color: onDark.secondary, maxWidth: "46ch", lineHeight: 1.45 }}>
                  Add as many doors as you want. Each property qualifies independently on its own DSCR coverage.
                </span>
              </div>

              <p role="status" aria-live="polite" style={{ margin: "12px 0 0", minHeight: 20, fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.45, color: dc.cream }}>
                {status}
              </p>

              {doors.length >= DTI_CEILING && (
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, borderTop: `1px solid ${HAIRLINE}`, paddingTop: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: tracking.wide, textTransform: "uppercase", color: risk.warning, whiteSpace: "nowrap" }}>Conventional DTI Cap Exceeded</span>
                  <span style={{ fontSize: 13, color: onDark.secondary, maxWidth: "52ch", lineHeight: 1.45 }}>
                    At 4+ doors, conventional lenders hit debt-to-income caps. DSCR programs bypass personal DTI completely.
                  </span>
                </div>
              )}
            </div>

            <div className="dn-summary" style={{ background: SURFACE, borderRadius: radius.lg, border: `1px solid ${HAIRLINE}`, padding: "clamp(22px,2.6vw,30px)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: tracking.caps, textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>Portfolio Summary</div>
              <Mono style={{ fontSize: "clamp(28px,6vw,68px)", fontWeight: 700, color: dc.lemon, lineHeight: 1, display: "block" }}>{doors.length}</Mono>
              <div style={{ fontSize: 13, color: onDark.secondary, marginTop: 6, marginBottom: 20, lineHeight: 1.45 }}>doors modeled — zero personal DTI math</div>
              {[{ l: "Blended DSCR", v: blended.toFixed(2) + "x", c: blended >= 1.0 ? dc.emerald : RED }, { l: "Total cash flow", v: fmt$(cashFlow) + "/mo", c: cashFlow >= 0 ? dc.emerald : RED }, { l: "Gross rent", v: fmt$(totalRent) + "/mo", c: dc.cream }].map((r) => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${HAIRLINE}` }}>
                  <span style={{ fontSize: 13, color: onDark.secondary }}>{r.l}</span>
                  <Mono style={{ fontSize: 16, fontWeight: 700, color: r.c }}>{r.v}</Mono>
                </div>
              ))}
              <button onClick={() => onNavigate("portfolio")} style={{ width: "100%", marginTop: 18, minHeight: 44, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", padding: "13px", borderRadius: radius.sm, fontFamily: font.family }}>Model Portfolio Strategy →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPERTY CLASS INVESTMENT STRATEGY & LINE ART CARDS ── */}
      <PropertyInvestmentStrategySection onNavigate={onNavigate} />

      {/* ── DSCR INVESTOR UNDERWRITING & INTELLIGENCE MATRIX ── */}
      <DSCRInvestorMindsetSection onNavigate={onNavigate} />

      {/* ── SCENARIO TOOLS GRID ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}`, borderTop: "1px solid rgba(238,239,211,0.1)" }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dc.lemon, marginBottom: 8 }}>Instant Institutional Analysis</div>
            <h2 style={{ fontSize: "clamp(21px,3.2vw,44px)", fontWeight: 700, color: dc.cream, margin: 0 }}>Greenstreet Investor Scenario Suite</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {[
              { title: "DSCR Coverage & Rates", desc: "Calculate exact coverage ratios, monthly PITIA, and lender rate pricing.", view: "dscr-calculator", btn: "Run Calculator →" },
              { title: "Short-Term Rental Tool", desc: "Underwrite Airbnbs and resort cabins using AirDNA projections or 12-mo actuals.", view: "tools/str-underwriting", btn: "Underwrite STR →" },
              { title: "50-State Penalty Rules", desc: "Check state-by-state prepayment penalty legal caps, thresholds, and LLC exemptions.", view: "state-laws", btn: "View State Laws →" },
              { title: "Cost Seg & Tax Engine", desc: "Estimate Year-1 OBBBA 100% bonus depreciation and passive loss tax offsets.", view: "tools/tax-engine", btn: "Run Tax Engine →" },
              { title: "10-Yr Cash Flow & IRR", desc: "Project multi-year cash-on-cash yield, equity accumulation, and IRR waterfall.", view: "tools/returns", btn: "Model Returns →" },
              { title: "Commercial 5+ & Mixed-Use", desc: "Underwrite commercial multi-family and mixed-use storefront properties.", view: "tools/commercial-dscr", btn: "Commercial DSCR →" },
            ].map((tool) => (
              <div key={tool.view} style={{ background: "rgba(238,239,211,0.04)", padding: "22px", borderRadius: radius.md, border: "1px solid rgba(238,239,211,0.12)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: dc.cream, margin: "0 0 8px" }}>{tool.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.7)", margin: 0, lineHeight: 1.5 }}>{tool.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(tool.view)}
                  style={{
                    background: "transparent",
                    color: dc.lemon,
                    fontWeight: 700,
                    fontSize: 13,
                    border: "1px solid rgba(216,217,88,0.4)",
                    padding: "10px 16px",
                    borderRadius: radius.sm,
                    cursor: "pointer",
                    fontFamily: dc.sans,
                    textAlign: "center",
                  }}
                >
                  {tool.btn}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <ComplianceNote tone="verify">
              Greenstreet Finance provides educational scenario modeling and lender intelligence tools for real estate investors. Scenario outputs are preliminary estimates, not binding commitments to lend or formal tax advice.
            </ComplianceNote>
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} cards={[
        { bg: dc.lemon, fg: dc.dark, blurb: "Run your next property's rent through Greenstreet — 60 seconds, zero credit impact.", title: "Price My Deal Now", view: "dscr-calculator" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "Underwrite short-term rental revenue with AirDNA projections and 12-month actuals.", title: "Run STR Scenario", view: "tools/str-underwriting" },
      ]} />
    </DcShell>
  );
}
