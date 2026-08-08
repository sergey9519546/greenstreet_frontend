import React, { useEffect, useRef, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font, risk, onDark, tracking } from "../theme";
import BottomCTA from "../design/BottomCTA";
import ComplianceNote from "../design/ComplianceNote";
import { CurrencyInput } from "../components/ui/CurrencyInput";

// ── Who-We-Serve: Real Estate Investors (primary wedge) ───────────────────────
// Signature section: every door is measured against ONE fixed 1.00x line, on its
// own rent.
//
// Deliberately NOT a staircase. The previous version indented each row by
// `i * 26px`, which encodes sequence — and sequence is the exact thing DSCR
// removes: no door depends on the door before it, and there is no income
// ceiling on the next one. It also pushed every DSCR figure to a different
// x-position, so the one comparison a reader actually wants to make was the one
// the layout prevented. The form is now peer rows on a shared threshold: same
// columns, same test, no order.

const RED = risk.danger;
const HAIRLINE = "rgba(238,239,211,0.14)";
const SURFACE = "rgba(238,239,211,0.05)"; // pistachio tint on the midnight band
const RULE = "rgba(238,239,211,0.55)";    // the 1.00x threshold rule
const fmt$ = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const pad2 = (n: number) => String(n).padStart(2, "0");

type Door = { id: string; rent: number; pay: number };
const START: Door[] = [
  { id: "door-1", rent: 2400, pay: 1850 },
  { id: "door-2", rent: 3100, pay: 2450 },
  { id: "door-3", rent: 2800, pay: 2300 },
];
const NEW_DOOR = { rent: 2600, pay: 2050 };
const DTI_CEILING = 4; // illustrative: where a typical W-2 borrower's DTI taps out

// Coverage lane — a ZERO-BASED DSCR axis, so 1.00x lands dead centre and every
// row's bar is read against the same fixed rule rather than against each other.
const LANE_MAX = 2;
const lanePct = (d: number) => Math.max(0, Math.min(1, d / LANE_MAX)) * 100;

const srOnly: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

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
  // Stable ids, so removing a middle door can never re-map a row's state (or its
  // focus) onto a different DOM node the way an array-index key did.
  const seq = useRef(START.length);
  // One-shot marker on the row that was just added, plus a live-region sentence.
  // Together they are the proof of the claim: the new door arrives, and no other
  // door's DSCR moves.
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
      `Door ${pad2(doors.length + 1)} added at ${(NEW_DOOR.rent / NEW_DOOR.pay).toFixed(2)}x, on its own rent. ` +
      `No other door's DSCR changed.`
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

  // The one numeric field spec for this section: a real, sized, currency-
  // formatted box with a visible column label — not a borderless 78px stub
  // wedged mid-sentence. No `step`, because the stepper mode renders the value
  // raw (`2400`); the formatted mode is what prints `$2,400`.
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
    { label: "Programs", view: "lender-intel" },
    { label: "Portfolio", view: "portfolio" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Run my deal →", view: "dscr-calculator" }}>
      <style>{`
        /* One grid template, shared by the column header and EVERY door row, so
           the DSCR figures and the 1.00x rule land on identical x-positions. */
        .dn-head,.dn-row{
          display:grid;align-items:center;column-gap:14px;
          grid-template-columns:96px minmax(112px,158px) minmax(112px,158px) minmax(150px,1fr) 96px 32px;
          grid-template-areas:"tag rent pay lane dscr rm";
        }
        /* 19px = the row's 3px status edge + 16px padding; 17px = 1px + 16px. */
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
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 100, marginBottom: 24 }}>For Real Estate Investors</div>
            <H1 style={{ margin: "0 0 18px", maxWidth: "14ch" }}>Scale past the income ceiling.</H1>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "48ch", margin: "0 0 30px" }}>
              Conventional lenders cap how many doors you own by your debt-to-income. DSCR programs generally don't — each property is evaluated on its own rent. Model the next one, and the one after that. Figures here are preliminary estimates, not quotes or approvals.
            </Lead>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => onNavigate("dscr-calculator")} style={{ background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Run my next deal →</button>
              <button onClick={() => onNavigate("portfolio")} style={{ background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 15, border: "1.5px solid rgba(238,239,211,0.5)", cursor: "pointer", padding: "14px 24px", borderRadius: radius.sm, fontFamily: font.family }}>Blend my portfolio</button>
            </div>
          </div>
          <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(20px,2.5vw,30px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[{ v: doors.length, l: "doors" }, { v: blended.toFixed(2) + "x", l: "blended DSCR" }, { v: fmt$(cashFlow) + "/mo", l: "cash flow" }, { v: "∞", l: "income cap" }].map((t, i) => (
              <div key={i} style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "16px 14px" }}>
                <Mono style={{ fontSize: 26, fontWeight: 700, color: i === 3 ? dc.emerald : dc.cream, display: "block", lineHeight: 1 }}>{t.v}</Mono>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginTop: 6 }}>{t.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOOR BY DOOR — peer rows against one shared 1.00x line ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: tracking.caps, textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Door by door</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 12px", maxWidth: "20ch" }}>Each door qualifies on its own rent.</h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: onDark.secondary, margin: "0 0 30px", maxWidth: "62ch", lineHeight: 1.5 }}>
            Set any door's monthly rent and payment. Its bar is that rent measured against that payment, and the line is 1.00x — the point where the rent exactly covers it. No door's number depends on any other door: that is what qualifying on the property means.
          </p>

          <div className="inv-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 28, alignItems: "start" }}>
            {/* the bench: identical rows, identical columns, one shared threshold */}
            <div style={{ minWidth: 0 }}>
              {/* Column header. Same grid template as the rows, so "1.00x" sits
                  exactly over the rule drawn inside every lane below it. */}
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
                  // Computed from THIS door's two fields and nothing else — the
                  // structural reason adding a door can't move another's number.
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

                      {/* Coverage lane. Decorative: the figure and the word beside
                          it carry the same information for assistive tech. */}
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
                  A new door brings its own rent, its own payment and its own DSCR. Every row above it stays exactly where it is.
                </span>
              </div>

              <p role="status" aria-live="polite" style={{ margin: "12px 0 0", minHeight: 20, fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.45, color: dc.cream }}>
                {status}
              </p>

              {doors.length >= DTI_CEILING && (
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, borderTop: `1px solid ${HAIRLINE}`, paddingTop: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: tracking.wide, textTransform: "uppercase", color: risk.warning, whiteSpace: "nowrap" }}>Conventional DTI</span>
                  <span style={{ fontSize: 13, color: onDark.secondary, maxWidth: "52ch", lineHeight: 1.45 }}>
                    Around this count, a debt-to-income–qualified borrower typically runs out of room — their next door is priced against their salary, not its rent. Illustrative; limits vary by program.
                  </span>
                </div>
              )}
            </div>

            {/* portfolio view — stated for what it is, not sold as a verdict */}
            <div className="dn-summary" style={{ background: SURFACE, borderRadius: radius.lg, border: `1px solid ${HAIRLINE}`, padding: "clamp(22px,2.6vw,30px)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: tracking.caps, textTransform: "uppercase", color: dc.accent, marginBottom: 16 }}>Portfolio view</div>
              <Mono style={{ fontSize: "clamp(44px,6vw,68px)", fontWeight: 700, color: dc.lemon, lineHeight: 1, display: "block" }}>{doors.length}</Mono>
              <div style={{ fontSize: 13, color: onDark.secondary, marginTop: 6, marginBottom: 20, lineHeight: 1.45 }}>doors — and no income test on the next one</div>
              {[{ l: "Blended DSCR", v: blended.toFixed(2) + "x", c: blended >= 1.0 ? dc.emerald : RED }, { l: "Total cash flow", v: fmt$(cashFlow) + "/mo", c: cashFlow >= 0 ? dc.emerald : RED }, { l: "Gross rent", v: fmt$(totalRent) + "/mo", c: dc.cream }].map((r) => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${HAIRLINE}` }}>
                  <span style={{ fontSize: 13, color: onDark.secondary }}>{r.l}</span>
                  <Mono style={{ fontSize: 16, fontWeight: 700, color: r.c }}>{r.v}</Mono>
                </div>
              ))}
              <p style={{ fontSize: 12, lineHeight: 1.5, color: onDark.secondary, margin: "14px 0 0" }}>
                Blended DSCR is total rent divided by total debt service across the doors above — a portfolio-level view of the book you already hold. It is not a qualification figure: a lender underwrites each property on that property's own DSCR.
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.5, color: onDark.secondary, margin: "8px 0 0" }}>
                Add a door and these three totals move. No individual door's DSCR does.
              </p>
              <button onClick={() => onNavigate("portfolio")} style={{ width: "100%", marginTop: 18, minHeight: 44, background: dc.emerald, color: dc.dark, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", padding: "13px", borderRadius: radius.sm, fontFamily: font.family }}>Model the whole book →</button>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <ComplianceNote tone="verify">
              Rents and payments here are yours to type; nothing is verified. DSCR floors, reserve requirements and how rent may be documented vary by program and by state. These figures are preliminary estimates, not quotes, approvals or an offer of credit.
            </ComplianceNote>
          </div>
        </div>
      </section>

      {/* ── WHY DSCR SCALES ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 28px", color: dc.cream }}>Built for the investor who isn't stopping at one.</h2>
          <div className="gs-reveal dc-band-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { t: "No DTI math", s: "DSCR programs qualify on the property's rent rather than your debt-to-income. Documentation rules vary by program — verify before relying on it." },
              { t: "Entity vesting is common", s: "Most DSCR programs allow title to be vested in an LLC. Confirm each program's entity rules before you structure around it." },
              { t: "One workflow, every door", s: "The same tools price, structure, and document each scenario — no rebuilding your model for every purchase." },
            ].map((v) => (
              <div key={v.t} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: dc.cream, letterSpacing: "-0.02em", marginBottom: 8 }}>{v.t}</div>
                <div style={{ fontSize: 14, color: "rgba(238,239,211,0.6)", lineHeight: 1.5 }}>{v.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} cards={[
        { bg: dc.lemon, fg: dc.dark, blurb: "Run your next property's rent through Greenstreet — 60 seconds, no credit pull.", title: "Run my next deal", view: "dscr-calculator" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "Roll the whole book into one blended DSCR and model it as a single structure.", title: "Blend my portfolio", view: "portfolio" },
      ]} />
    </DcShell>
  );
}
