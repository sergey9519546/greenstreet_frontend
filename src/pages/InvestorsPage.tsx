import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font } from "../theme";
import BottomCTA from "../design/BottomCTA";

// ── Who-We-Serve: Real Estate Investors (primary wedge) ───────────────────────
// Signature: the Door Ladder — each property self-qualifies on its own rent, so
// there's no income ceiling. Conventional DTI caps you; DSCR doesn't.

const BLUE = "#7ec8d3";
const RED = "#ff6b6b";
const fmt$ = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

type Door = { rent: number; pay: number };
const START: Door[] = [
  { rent: 2400, pay: 1850 },
  { rent: 3100, pay: 2450 },
  { rent: 2800, pay: 2300 },
];
const DTI_CEILING = 4; // illustrative: where a typical W-2 borrower's DTI taps out

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
    <input type="number" aria-label={label} step={step} value={v} onChange={(e) => set(+e.target.value)}
      style={{ width: 78, border: "none", borderBottom: "1.5px solid rgba(238,239,211,0.25)", background: "none", outline: "none", color: dc.cream, fontFamily: dc.mono, fontWeight: 700, fontSize: 15, padding: "2px 2px", letterSpacing: "-0.02em" }} />
  );

  const navLinks = [
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "Programs", view: "lender-intel" },
    { label: "Portfolio", view: "portfolio" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Run my deal →", view: "dscr-calculator" }}>
      <style>{`
        @media(max-width:760px){.inv-grid{grid-template-columns:1fr !important;}.inv-door{flex-wrap:wrap;}}
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: "relative", background: dc.teal, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.dark, background: dc.lemon, padding: "7px 14px", borderRadius: 100, marginBottom: 24 }}>For Real Estate Investors</div>
            <H1 style={{ margin: "0 0 18px", maxWidth: "14ch" }}>Scale past the income ceiling.</H1>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "48ch", margin: "0 0 30px" }}>
              Conventional lenders cap how many doors you own by your debt-to-income. DSCR doesn't — every property qualifies on its own rent. Buy the next one, and the one after that.
            </Lead>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => onNavigate("dscr-calculator")} style={{ background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Run my next deal →</button>
              <button onClick={() => onNavigate("portfolio")} style={{ background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 15, border: "1.5px solid rgba(238,239,211,0.28)", cursor: "pointer", padding: "14px 24px", borderRadius: radius.sm, fontFamily: font.family }}>Blend my portfolio</button>
            </div>
          </div>
          <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.1)", padding: "clamp(20px,2.5vw,30px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[{ v: doors.length, l: "doors" }, { v: blended.toFixed(2) + "x", l: "blended DSCR" }, { v: fmt$(cashFlow) + "/mo", l: "cash flow" }, { v: "∞", l: "income cap" }].map((t, i) => (
              <div key={i} style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "16px 14px" }}>
                <Mono style={{ fontSize: 26, fontWeight: 700, color: i === 3 ? dc.emerald : dc.cream, display: "block", lineHeight: 1 }}>{t.v}</Mono>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.56)", marginTop: 6 }}>{t.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE DOOR LADDER ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>The door ladder</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04, margin: "0 0 10px", maxWidth: "20ch" }}>Stack doors. Each one carries itself.</h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(238,239,211,0.6)", margin: "0 0 32px", maxWidth: "58ch", lineHeight: 1.5 }}>Edit each door's rent and payment — scroll over the numbers. Every door qualifies on its own DSCR; the blend is just for show.</p>

          <div className="inv-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
            {/* ladder */}
            <div style={{ display: "flex", flexDirection: "column-reverse", gap: 10 }}>
              {doors.map((d, i) => {
                const ds = d.pay > 0 ? d.rent / d.pay : 0;
                const ok = ds >= 1.0;
                const past = i + 1 > DTI_CEILING;
                return (
                  <div key={i} className="inv-door" style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: `${Math.min(i, 8) * 26}px`, background: dc.teal, border: `1px solid ${ok ? "rgba(77,189,151,0.35)" : "rgba(255,107,107,0.35)"}`, borderRadius: radius.md, padding: "14px 18px" }}>
                    <Mono style={{ fontSize: 18, fontWeight: 700, color: past ? dc.emerald : "rgba(238,239,211,0.4)", width: 34 }}>{String(i + 1).padStart(2, "0")}</Mono>
                    <div style={{ fontSize: 13, color: "rgba(238,239,211,0.6)" }}>
                      rent {numIn(d.rent, (v) => setDoor(i, "rent", v), 50, "Door rent")} · pay {numIn(d.pay, (v) => setDoor(i, "pay", v), 50, "Door payment")}
                    </div>
                    <Mono style={{ marginLeft: "auto", fontSize: 18, fontWeight: 700, color: ok ? dc.emerald : RED }}>{ds.toFixed(2)}x</Mono>
                    <button onClick={() => removeDoor(i)} aria-label="remove door" style={{ background: "none", border: "none", color: "rgba(238,239,211,0.56)", cursor: "pointer", fontSize: 18, lineHeight: 1, fontFamily: font.family }}>×</button>
                  </div>
                );
              })}
              {doors.length >= DTI_CEILING && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: `${Math.min(DTI_CEILING - 0.5, 8) * 26}px`, padding: "2px 0" }}>
                  <div style={{ flex: 1, height: 1, borderTop: `1.5px dashed ${RED}`, opacity: 0.6 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: RED, whiteSpace: "nowrap" }}>conventional DTI caps here</span>
                </div>
              )}
              <button onClick={addDoor} style={{ alignSelf: "flex-start", marginTop: 6, background: "transparent", border: "1.5px dashed rgba(238,239,211,0.3)", color: dc.cream, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "12px 22px", borderRadius: radius.sm, fontFamily: font.family }}>+ Add a door</button>
            </div>

            {/* portfolio summary */}
            <div style={{ background: dc.teal, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.1)", padding: "clamp(22px,2.6vw,30px)", position: "sticky", top: 96 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: BLUE, marginBottom: 16 }}>Your book, blended</div>
              <Mono style={{ fontSize: "clamp(44px,6vw,68px)", fontWeight: 700, color: dc.lemon, lineHeight: 0.9, display: "block" }}>{doors.length}</Mono>
              <div style={{ fontSize: 13, color: "rgba(238,239,211,0.55)", marginTop: 4, marginBottom: 22 }}>doors — and no income limit on the next one</div>
              {[{ l: "Blended DSCR", v: blended.toFixed(2) + "x", c: blended >= 1.0 ? dc.emerald : RED }, { l: "Total cash flow", v: fmt$(cashFlow) + "/mo", c: cashFlow >= 0 ? dc.emerald : RED }, { l: "Gross rent", v: fmt$(totalRent) + "/mo", c: dc.cream }].map((r) => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(238,239,211,0.08)" }}>
                  <span style={{ fontSize: 13, color: "rgba(238,239,211,0.6)" }}>{r.l}</span>
                  <Mono style={{ fontSize: 16, fontWeight: 700, color: r.c }}>{r.v}</Mono>
                </div>
              ))}
              <button onClick={() => onNavigate("portfolio")} style={{ width: "100%", marginTop: 18, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", padding: "13px", borderRadius: radius.sm, fontFamily: font.family }}>Underwrite the whole book →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY DSCR SCALES ── */}
      <section style={{ background: dc.teal, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>Built for the investor who isn't stopping at one.</h2>
          <div className="gs-reveal dc-band-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { t: "No DTI math", s: "Your W-2, tax returns, and personal debt never enter the file. The rent qualifies the loan." },
              { t: "Close in your LLC", s: "Vesting in an entity is standard — keep your portfolio clean and separate from your personal credit." },
              { t: "One team, every door", s: "The same desk prices, structures, and funds each deal — no re-keying your file for every purchase." },
            ].map((v) => (
              <div key={v.t} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.1)", borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: dc.cream, letterSpacing: "-0.02em", marginBottom: 8 }}>{v.t}</div>
                <div style={{ fontSize: 14, color: "rgba(238,239,211,0.6)", lineHeight: 1.5 }}>{v.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} cards={[
        { bg: dc.lemon, fg: dc.dark, blurb: "Run your next property's rent through Greenstreet — 60 seconds, no credit pull.", title: "Run my next deal", view: "dscr-calculator" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "Roll the whole book into one blended DSCR and finance it together.", title: "Blend my portfolio", view: "portfolio" },
      ]} />
    </DcShell>
  );
}
