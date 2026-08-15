import React, { useEffect, useRef } from "react";
import { DcShell, dc, Mono } from "./dc";
import type { NavLink } from "./dc";

// ── Reusable "DSCR Go"-style landing for Who-We-Serve audience pages ──────────
// One scrolly landing: pill hero + workspace mock, a 3-step line-flow, a
// horizontal scroll-snap scenario track, a value grid and 2-up CTA cards.
// Each audience page supplies its own copy; design + motion live here once.
//
// Motion is GSAP-free on purpose: the app's marketing teardown
// (App __gsStopMarketing) kills ScrollTriggers created on React routes. So this
// uses IntersectionObserver + CSS only, with all content visible by default
// (no page-load reveal → no visual drop). The flow line draws once on view.

export interface GoTile { v: string; l: string; accent?: boolean }
export interface GoMock { dealId: string; bigStat: string; tiles: GoTile[] }
export interface GoFlowStep { step: string; title: string; body: string }
export interface GoScenario { num: string; bg: string; fg: string; title: string; body: string; tag: string; view: string }
export interface GoValue { icon: string; chip: string; chipFg: string; title: string; body: string }
export interface GoCtaCard { bg: string; fg?: string; blurb: string; title: string; view: string }

export interface GoLandingProps {
  onNavigate: (v: any) => void;
  navLinks?: NavLink[];
  cta?: NavLink;
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  primaryCta: { label: string; view: string };
  secondaryCtaLabel?: string;
  mock: GoMock;
  trustLabel: string;
  trustItems: string[];
  flowEyebrow: string;
  flowTitle: string;
  flowLead: string;
  flow: GoFlowStep[];
  scenariosEyebrow: string;
  scenariosTitle: string;
  scenarios: GoScenario[];
  valuesTitle: string;
  values: GoValue[];
  ctaCards: GoCtaCard[];
}

export default function GoLanding(p: GoLandingProps) {
  const scope = useRef<HTMLDivElement>(null);

  // One-time line draw + node pop when the flow scrolls into view (IO + CSS).
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const flow = root.querySelector("#go-flow");
    if (!flow) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flow.classList.add("go-drawn");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { flow.classList.add("go-drawn"); io.disconnect(); }
      },
      { threshold: 0.3 }
    );
    io.observe(flow);
    const t = window.setTimeout(() => { flow.classList.add("go-drawn"); io.disconnect(); }, 1600);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, []);

  const scrollToFlow = () => {
    const el = scope.current?.querySelector("#go-flow");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: "smooth" });
  };

  return (
    <DcShell onNavigate={p.onNavigate} accent={dc.dark} navLinks={p.navLinks} cta={p.cta}>
      <div ref={scope}>
        <style>{`
          #go-path{stroke-dasharray:1840;stroke-dashoffset:1840;}
          .go-drawn #go-path{stroke-dashoffset:0;animation:goDraw 1.1s cubic-bezier(.4,0,.2,1) forwards;}
          @keyframes goDraw{from{stroke-dashoffset:1840;}to{stroke-dashoffset:0;}}
          .go-node circle{transform:scale(1);transform-origin:center;transform-box:fill-box;}
          .go-drawn .go-node circle{animation:goPop .5s cubic-bezier(.2,1.4,.4,1) both;}
          .go-drawn .go-node:nth-child(3) circle{animation-delay:.35s;}
          .go-drawn .go-node:nth-child(4) circle{animation-delay:.7s;}
          @keyframes goPop{from{transform:scale(0);}to{transform:scale(1);}}
          #go-track{scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x proximity;}
          #go-track::-webkit-scrollbar{display:none;}
          #go-track > button{scroll-snap-align:start;}
          @media (prefers-reduced-motion: reduce){
            .go-drawn #go-path{animation:none;}
            .go-drawn .go-node circle{animation:none;}
          }
        `}</style>

        {/* ── HERO ── dark, 2-col + workspace mock ─────────────────────────────── */}
        <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(64px,9vh,128px) ${dc.pad} clamp(56px,7vh,96px)` }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,5vw,80px)", alignItems: "center" }} className="dc-hero">
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.dark, background: dc.lemon, padding: "7px 14px", borderRadius: 100, marginBottom: 26 }}>
                {p.eyebrow}
              </div>
              <h1 style={{ fontSize: "clamp(28px,7vw,104px)", fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.04em", margin: "0 0 26px" }}>{p.title}</h1>
              <p style={{ fontSize: "clamp(17px,1.5vw,22px)", fontWeight: 500, lineHeight: 1.5, letterSpacing: "-0.02em", color: "rgba(238,239,211,0.7)", maxWidth: "46ch", margin: "0 0 38px" }}>{p.lead}</p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => p.onNavigate(p.primaryCta.view)} style={{ display: "inline-flex", alignItems: "center", gap: 9, background: dc.lemon, color: dc.dark, fontWeight: 600, fontSize: 16, border: "none", cursor: "pointer", padding: "16px 32px", borderRadius: dc.r.md, fontFamily: dc.sans }}>
                  {p.primaryCta.label} <span style={{ fontSize: 18 }}>→</span>
                </button>
                <button onClick={scrollToFlow} style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 16, cursor: "pointer", padding: "16px 30px", borderRadius: dc.r.md, border: "1.5px solid rgba(238,239,211,0.3)", fontFamily: dc.sans }}>
                  {p.secondaryCtaLabel || "See how it works"}
                </button>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ background: dc.teal, borderRadius: 14, padding: 22, border: "1px solid rgba(238,239,211,0.16)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: dc.lemon }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(238,239,211,0.3)" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(238,239,211,0.3)" }} />
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>{p.mock.dealId}</span>
                </div>
                <div style={{ width: "100%", aspectRatio: "4 / 3", borderRadius: 10, background: "linear-gradient(135deg, rgba(238,239,211,0.08), rgba(238,239,211,0.02))", border: "1px solid rgba(238,239,211,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mono style={{ fontSize: "clamp(26px,6vw,72px)", fontWeight: 600, color: dc.cream, letterSpacing: "-0.04em" }}>{p.mock.bigStat}</Mono>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.mock.tiles.length},1fr)`, gap: 1, background: "rgba(238,239,211,0.12)", borderRadius: 9, overflow: "hidden", marginTop: 16 }}>
                  {p.mock.tiles.map((t) => (
                    <div key={t.l} style={{ background: dc.teal, padding: 14, textAlign: "center" }}>
                      <Mono style={{ fontSize: 22, fontWeight: 600, color: t.accent ? dc.lemon : dc.cream, letterSpacing: "-0.03em" }}>{t.v}</Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>{t.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP (no competitor logos — we are the lender) ─────────────── */}
        <section style={{ background: dc.dark, padding: `0 ${dc.pad} clamp(48px,6vh,72px)` }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto", borderTop: "1px solid rgba(238,239,211,0.12)", paddingTop: 34, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>{p.trustLabel}</span>
            <div style={{ display: "flex", gap: "clamp(20px,3vw,44px)", alignItems: "center", flexWrap: "wrap" }}>
              {p.trustItems.map((s) => (
                <span key={s} style={{ fontSize: "clamp(15px,1.6vw,19px)", fontWeight: 600, letterSpacing: "-0.02em", color: "rgba(238,239,211,0.62)" }}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── LINE FLOW ─────────────────────────────────────────────────────────── */}
        <section id="go-flow" style={{ background: dc.cream, padding: `clamp(64px,9vh,128px) ${dc.pad}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.rain, marginBottom: 16 }}>{p.flowEyebrow}</div>
            <h2 style={{ fontSize: "clamp(24px,5vw,72px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 14px", color: dc.dark }}>{p.flowTitle}</h2>
            <p style={{ fontSize: "clamp(16px,1.4vw,20px)", fontWeight: 500, color: "rgba(0,55,56,0.6)", maxWidth: "50ch", margin: "0 auto 56px", lineHeight: 1.5 }}>{p.flowLead}</p>
          </div>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <svg viewBox="0 0 1180 240" style={{ width: "100%", height: "auto", overflow: "visible" }} fill="none">
              <path id="go-path" d="M 130 120 C 360 120, 360 120, 590 120 C 820 120, 820 120, 1050 120" stroke={dc.dark} strokeWidth={3} strokeLinecap="round" />
              <g className="go-node"><circle cx={130} cy={120} r={13} fill={dc.lemon} stroke={dc.dark} strokeWidth={3} /></g>
              <g className="go-node"><circle cx={590} cy={120} r={13} fill={dc.mintBg} stroke={dc.dark} strokeWidth={3} /></g>
              <g className="go-node"><circle cx={1050} cy={120} r={13} fill={dc.dark} stroke={dc.dark} strokeWidth={3} /></g>
            </svg>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(20px,3vw,48px)", marginTop: 8 }} className="dc-band-3">
              {p.flow.map((f) => (
                <div key={f.step} style={{ textAlign: "center" }}>
                  <Mono style={{ fontSize: 13, fontWeight: 600, color: dc.rain, marginBottom: 10, display: "block" }}>{f.step}</Mono>
                  <h3 style={{ fontSize: "clamp(19px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 10px", color: dc.dark }}>{f.title}</h3>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(0,55,56,0.6)", lineHeight: 1.5, margin: 0 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HORIZONTAL SCENARIO TRACK (native scroll-snap) ────────────────────── */}
        <section style={{ background: dc.dark }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto", padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(28px,3vh,44px)`, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 14 }}>{p.scenariosEyebrow}</div>
              <h2 style={{ fontSize: "clamp(23px,4.4vw,60px)", fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.04em", margin: 0, color: dc.cream, maxWidth: "18ch" }}>{p.scenariosTitle}</h2>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(238,239,211,0.62)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>Scroll →</div>
          </div>
          <div style={{ padding: "0 0 clamp(56px,7vh,96px)" }}>
            <div id="go-track" style={{ display: "flex", gap: 24, padding: `0 ${dc.pad}`, overflowX: "auto" }}>
              {p.scenarios.map((c) => (
                <button key={c.num} onClick={() => p.onNavigate(c.view)} style={{ flex: "0 0 clamp(300px,30vw,400px)", background: c.bg, color: c.fg, borderRadius: 14, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 360, border: "none", cursor: "pointer", textAlign: "left", fontFamily: dc.sans }}>
                  <div>
                    <Mono style={{ fontSize: 14, fontWeight: 600, opacity: 0.55, marginBottom: 24, display: "block", color: c.fg }}>{c.num}</Mono>
                    <h3 style={{ fontSize: "clamp(19px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 12px" }}>{c.title}</h3>
                    <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, opacity: 0.72, margin: 0 }}>{c.body}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, marginTop: 28 }}>{c.tag} <span style={{ fontSize: 16 }}>→</span></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUE GRID ────────────────────────────────────────────────────────── */}
        <section style={{ background: dc.cream, padding: `clamp(64px,8vh,112px) ${dc.pad}` }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(23px,4.4vw,58px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 48px", maxWidth: "20ch", color: dc.dark }}>{p.valuesTitle}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(0,55,56,0.12)", borderRadius: 14, overflow: "hidden" }} className="dc-band-3">
              {p.values.map((v) => (
                <div key={v.title} style={{ background: dc.cream, padding: 32, minHeight: 200 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: v.chip, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, color: v.chipFg, marginBottom: 18 }}>{v.icon}</div>
                  <h3 style={{ fontSize: "clamp(17px,1.8vw,23px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 8px", color: dc.dark }}>{v.title}</h3>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,55,56,0.6)", lineHeight: 1.5, margin: 0 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2-UP CTA CARDS ────────────────────────────────────────────────────── */}
        <section style={{ background: dc.dark, padding: `clamp(56px,7vh,96px) ${dc.pad}` }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="dc-band-2">
            {p.ctaCards.map((c, i) => (
              <button key={i} onClick={() => p.onNavigate(c.view)} style={{ background: c.bg, color: c.fg || dc.dark, borderRadius: 16, padding: "clamp(32px,4vw,52px)", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280, textAlign: "left", fontFamily: dc.sans }}>
                <div style={{ fontSize: "clamp(15px,1.4vw,19px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3, opacity: 0.85 }}>{c.blurb}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 36 }}>
                  <h2 style={{ fontSize: "clamp(22px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{c.title}</h2>
                  <span style={{ fontSize: 30 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </DcShell>
  );
}
