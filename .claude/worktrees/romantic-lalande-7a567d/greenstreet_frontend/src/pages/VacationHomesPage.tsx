import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font } from "../theme";
import BottomCTA from "../design/BottomCTA";

// ── Who-We-Serve: Vacation & Second Homes ─────────────────────────────────────
// Signature: the Use-vs-Earn slider — split the month between nights you keep and
// nights you rent; watch the rental income offset your payment. The getaway that
// pays for itself.

const BLUE = "#7ec8d3";
const fmt$ = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

export default function VacationHomesPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Vacation & Second Home DSCR Loans | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const [rentNights, setRentNights] = useState(14);
  const [adr, setAdr] = useState(255);
  const [pay, setPay] = useState(3100);

  const useNights = 30 - rentNights;
  const income = adr * rentNights; // booked nights you rent out
  const net = pay - income; // out-of-pocket carry after rental income
  const offsetPct = Math.min(100, Math.round((income / pay) * 100));
  const paysForItself = net <= 0;

  const numIn = (v: number, set: (n: number) => void, step: number, pre = "", suf = "") => (
    <div style={{ display: "flex", alignItems: "center", background: dc.dark, border: "1.5px solid rgba(238,239,211,0.18)", borderRadius: radius.sm, padding: "0 12px" }}>
      {pre && <span style={{ color: "rgba(238,239,211,0.56)", fontSize: 14 }}>{pre}</span>}
      <input type="number" step={step} value={v} onChange={(e) => set(+e.target.value)} style={{ width: "100%", border: "none", background: "none", outline: "none", color: dc.cream, fontFamily: font.family, fontWeight: 600, fontSize: 15, padding: "11px 6px" }} />
      {suf && <span style={{ color: "rgba(238,239,211,0.56)", fontSize: 14 }}>{suf}</span>}
    </div>
  );

  const navLinks = [
    { label: "STR Underwriting", view: "str-underwriting" },
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "Programs", view: "lender-intel" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Run my second home →", view: "dscr-calculator" }}>
      <style>{`@media(max-width:760px){.vac-grid{grid-template-columns:1fr !important;}}`}</style>

      {/* HERO */}
      <section style={{ position: "relative", background: dc.teal, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.dark, background: dc.lemon, padding: "7px 14px", borderRadius: 100, marginBottom: 24 }}>For Vacation &amp; Second Homes</div>
            <H1 style={{ margin: "0 0 18px", maxWidth: "14ch" }}>The getaway that pays for itself.</H1>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "48ch", margin: "0 0 30px" }}>
              Keep the weeks you want. Rent the rest. A second home financed as an investment qualifies on the nights you let — so your escape carries part of its own payment.
            </Lead>
            <button onClick={() => onNavigate("dscr-calculator")} style={{ background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Run my second home →</button>
          </div>
          <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.1)", padding: "clamp(20px,2.5vw,30px)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE, marginBottom: 14 }}>Your month, split</div>
            <div style={{ display: "flex", height: 22, borderRadius: 100, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${(useNights / 30) * 100}%`, background: dc.lemon, transition: "width .25s" }} />
              <div style={{ width: `${(rentNights / 30) * 100}%`, background: BLUE, transition: "width .25s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(238,239,211,0.55)", marginBottom: 16 }}>
              <span><b style={{ color: dc.lemon }}>{useNights}</b> nights yours</span>
              <span><b style={{ color: BLUE }}>{rentNights}</b> nights rented</span>
            </div>
            <Mono style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: 700, color: paysForItself ? dc.emerald : dc.cream, display: "block", lineHeight: 1 }}>{paysForItself ? "Pays for itself" : fmt$(net) + "/mo"}</Mono>
            <div style={{ fontSize: 13, color: "rgba(238,239,211,0.55)", marginTop: 6 }}>{paysForItself ? `rental income covers the ${fmt$(pay)} payment` : `your carry after ${fmt$(income)} rental income`}</div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE USE-VS-EARN */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Use vs. earn</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04, margin: "0 0 10px", maxWidth: "20ch" }}>Slide the month. Watch it pay you back.</h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(238,239,211,0.6)", margin: "0 0 32px", maxWidth: "58ch", lineHeight: 1.5 }}>Drag the split between nights you keep and nights you rent. The more you rent, the more your getaway offsets its own payment.</p>
          <div className="vac-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "stretch" }}>
            {/* slider + bar */}
            <div style={{ background: dc.teal, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.1)", padding: "clamp(24px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: dc.lemon }}>{useNights} nights yours</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: BLUE }}>{rentNights} nights rented</span>
              </div>
              <div style={{ display: "flex", height: 40, borderRadius: radius.sm, overflow: "hidden", marginBottom: 18 }}>
                <div style={{ width: `${(useNights / 30) * 100}%`, background: dc.lemon, display: "flex", alignItems: "center", justifyContent: "center", color: dc.dark, fontWeight: 700, fontSize: 12, transition: "width .25s" }}>{useNights > 3 ? "USE" : ""}</div>
                <div style={{ width: `${(rentNights / 30) * 100}%`, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", color: dc.dark, fontWeight: 700, fontSize: 12, transition: "width .25s" }}>{rentNights > 3 ? "EARN" : ""}</div>
              </div>
              <input className="gs-range" type="range" min={0} max={28} step={1} value={rentNights} onChange={(e) => setRentNights(+e.target.value)} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(238,239,211,0.56)", marginTop: 6 }}><span>keep it all</span><span>rent most of it</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 24 }}>
                <label><span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.5)", marginBottom: 6 }}>Nightly rate</span>{numIn(adr, setAdr, 5, "$")}</label>
                <label><span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.5)", marginBottom: 6 }}>Monthly payment</span>{numIn(pay, setPay, 50, "$")}</label>
              </div>
            </div>
            {/* result */}
            <div style={{ background: dc.teal, borderRadius: radius.lg, border: `1px solid ${paysForItself ? "rgba(77,189,151,0.4)" : "rgba(238,239,211,0.1)"}`, padding: "clamp(24px,3vw,36px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: paysForItself ? dc.emerald : BLUE, marginBottom: 8 }}>{paysForItself ? "It pays for itself" : "Your monthly carry"}</div>
              <Mono style={{ fontSize: "clamp(40px,6vw,72px)", fontWeight: 700, color: paysForItself ? dc.emerald : dc.cream, lineHeight: 0.9 }}>{paysForItself ? "$0" : fmt$(net)}</Mono>
              <div style={{ fontSize: 14, color: "rgba(238,239,211,0.65)", marginTop: 12, lineHeight: 1.5 }}>
                {fmt$(income)} rental income offsets {offsetPct}% of the {fmt$(pay)} payment. {paysForItself ? "The income covers the loan — you own a getaway at no monthly cost." : `You'd carry ${fmt$(net)} a month and keep ${useNights} nights for yourself.`}
              </div>
              <button onClick={() => onNavigate("dscr-calculator")} style={{ marginTop: 20, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", padding: "13px", borderRadius: radius.sm, fontFamily: font.family }}>Price this as a loan →</button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: dc.teal, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>A second home, financed like the asset it is.</h2>
          <div className="gs-reveal dc-band-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { t: "Qualify on the rental nights", s: "We underwrite the income from the nights you let — not your salary. Use it yourself the rest of the year." },
              { t: "No second-home income docs", s: "It's a DSCR investment loan: the property's rent qualifies, so there's no DTI squeeze on top of your primary mortgage." },
              { t: "STR-aware underwriting", s: "Seasonal nightly income is modeled honestly — the number holds when the off-season hits." },
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
        { bg: dc.lemon, fg: dc.dark, blurb: "Price your second home as a DSCR loan — 60 seconds, no credit pull.", title: "Run my second home", view: "dscr-calculator" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "Renting it short-term? Underwrite the nightly income honestly.", title: "Underwrite the STR income", view: "str-underwriting" },
      ]} />
    </DcShell>
  );
}
