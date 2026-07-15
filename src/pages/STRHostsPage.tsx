import React, { useEffect, useMemo, useState } from "react";
import { DcShell, dc, Mono } from "../design/dc";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ILLUSTRATIVE_SEASON = [0.62, 0.68, 0.84, 0.96, 1.12, 1.28, 1.34, 1.26, 1.04, 0.88, 0.70, 0.78];

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (key: string, value: string, property = false) => {
      const attr = property ? "property" : "name";
      let tag = document.head.querySelector("meta[" + attr + "='" + key + "']") as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, key); document.head.appendChild(tag); }
      tag.content = value;
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    let canonical = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = new URL(path, window.location.origin).href;
    window.scrollTo(0, 0);
  }, [description, path, title]);
}

const money = (value: number) => Number.isFinite(value) ? "$" + Math.round(value).toLocaleString("en-US") : "Unavailable";

export const STR_HOSTS_NARROW_BREAKPOINT = 760;
export const STR_HOSTS_INTRINSIC_LAYOUT_CSS = `
  .str-model-grid{grid-template-columns:minmax(0,340px) minmax(0,1fr);min-width:0;max-width:100%}
  .str-form,.str-output{box-sizing:border-box;min-width:0;max-width:100%}
  .str-form fieldset{box-sizing:border-box;width:100%;min-inline-size:0;min-width:0;max-width:100%}
  .str-field,.str-field input{min-width:0;max-width:100%}
  .str-output,.str-result-grid,.str-stat,.str-chart-scroll,.str-chart,.str-month{min-width:0;max-width:100%}
  .str-result-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .str-stat,.str-message,.str-error{overflow-wrap:anywhere}
  .str-chart{width:100%;grid-template-columns:repeat(12,minmax(0,1fr));min-width:0}
  .str-month span{max-width:100%;overflow-wrap:anywhere}
  @media(max-width:${STR_HOSTS_NARROW_BREAKPOINT}px){
    .str-hero-grid,.str-model-grid,.str-evidence-grid,.str-close-grid,.str-result-grid{grid-template-columns:minmax(0,1fr)}
    .str-chart{gap:4px}
    .str-month span{font-size:.625rem}
  }
`;

export default function STRHostsPage({ onNavigate }: PageProps) {
  usePageMetadata(
    "Short-Term Rental DSCR Scenario Guide | Greenstreet Finance",
    "Model an illustrative short-term rental scenario using nightly rate, occupancy, seasonality, and payment inputs, then review income-method and eligibility limits.",
    "/str-hosts",
  );

  const [adr, setAdr] = useState(185);
  const [occupancy, setOccupancy] = useState(64);
  const [payment, setPayment] = useState(2750);
  const valid = [adr, occupancy, payment].every(Number.isFinite) && adr >= 0 && occupancy >= 0 && occupancy <= 100 && payment > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const baseMonth = adr * 30 * (occupancy / 100);
    const revenue = ILLUSTRATIVE_SEASON.map((multiplier) => baseMonth * multiplier);
    if (!revenue.every(Number.isFinite)) return null;
    const worst = Math.min(...revenue);
    const peak = Math.max(...revenue);
    const average = revenue.reduce((sum, value) => sum + value, 0) / revenue.length;
    const worstIndex = revenue.indexOf(worst);
    const worstDscr = worst / payment;
    const averageDscr = average / payment;
    if (![worst, peak, average, worstDscr, averageDscr].every(Number.isFinite)) return null;
    return { revenue, worst, peak, average, worstIndex, worstDscr, averageDscr };
  }, [adr, occupancy, payment, valid]);

  const update = (setter: (value: number) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.valueAsNumber;
    setter(Number.isFinite(next) ? next : 0);
  };

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={[{ label: "STR Tool", view: "str-underwriting" }, { label: "DSCR Calc", view: "dscr-calculator" }, { label: "Profiles", view: "borrower-profiles" }]} cta={{ label: "Model STR income", view: "str-underwriting" }}>
      <style>{`
        .str-page{background:#003738;color:#eeefd3}.str-wrap{width:min(1160px,calc(100% - 40px));margin:auto}.str-hero{background:#0b4d4d;padding:clamp(68px,10vw,124px) 0}
        .str-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(34px,6vw,84px);align-items:center}.str-kicker{font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#d8d958}
        .str-hero h1{font-size:clamp(2.6rem,6.6vw,5.8rem);line-height:.94;letter-spacing:-.045em;margin:18px 0 24px;max-width:13ch}.str-lead{font-size:clamp(1.05rem,1.9vw,1.3rem);line-height:1.6;color:rgba(238,239,211,.76);max-width:62ch}
        .str-callout{background:#003738;border:1px solid rgba(238,239,211,.16);border-radius:12px;padding:clamp(22px,3vw,34px)}.str-callout h2{font-size:clamp(1.5rem,2.8vw,2.3rem);line-height:1.1;margin:0 0 14px}.str-callout p{line-height:1.65;color:rgba(238,239,211,.7);margin:0}
        .str-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.str-link{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:7px;background:#d8d958;color:#003738;font-weight:800;text-decoration:none}.str-link.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.34)}
        .str-model,.str-evidence{padding:clamp(66px,8vw,110px) 0}.str-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.04em;margin:12px 0 18px}.str-intro{color:rgba(238,239,211,.68);line-height:1.65;max-width:70ch}
        .str-model-grid{display:grid;grid-template-columns:340px 1fr;gap:18px;margin-top:34px}.str-form,.str-output{background:#0b4d4d;border:1px solid rgba(238,239,211,.15);border-radius:12px;padding:clamp(22px,3vw,32px)}.str-form fieldset{border:0;padding:0;margin:0}.str-form legend{font-size:1.25rem;font-weight:800;margin-bottom:20px}
        .str-field{margin:0 0 15px}.str-field label{display:block;font-size:.78rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px}.str-field input{box-sizing:border-box;width:100%;min-height:46px;background:#003738;color:#eeefd3;border:1px solid rgba(238,239,211,.24);border-radius:7px;padding:10px 12px;font:inherit}
        .str-help{font-size:.83rem;line-height:1.5;color:rgba(238,239,211,.58)}.str-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.str-stat{background:#003738;padding:18px;border-radius:8px}.str-stat span{display:block;color:rgba(238,239,211,.58);font-size:.8rem;margin-top:6px}
        .str-chart-scroll{overflow-x:auto;margin-top:24px;padding-bottom:8px}.str-chart{display:grid;grid-template-columns:repeat(12,minmax(38px,1fr));align-items:end;gap:8px;min-width:610px;height:190px;border-bottom:1px solid rgba(238,239,211,.22)}.str-month{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:7px}.str-bar{width:100%;max-width:28px;background:#7ec8d3;border-radius:5px 5px 0 0}.str-month span{font-size:.7rem;color:rgba(238,239,211,.58)}
        .str-message{margin-top:18px;line-height:1.6;color:rgba(238,239,211,.7)}.str-error{color:#ffd1cb;border-left:4px solid #e06363;padding-left:14px}.str-evidence{background:#0b4d4d}.str-evidence-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:34px}.str-card{background:#003738;border:1px solid rgba(238,239,211,.15);border-radius:10px;padding:24px}.str-card h3{margin:0 0 10px}.str-card p{margin:0;color:rgba(238,239,211,.66);line-height:1.6}
        .str-close{background:#dfe7c5;color:#003738;padding:clamp(58px,8vw,92px) 0}.str-close-grid{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:end}.str-close p{color:rgba(0,55,56,.7);line-height:1.6;max-width:62ch}.str-close .str-link.secondary{color:#003738;border-color:rgba(0,55,56,.3)}
        .str-page a:focus-visible,.str-page input:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}
        @media(max-width:760px){.str-wrap{width:min(100% - 28px,1160px)}.str-hero-grid,.str-model-grid,.str-evidence-grid,.str-close-grid,.str-result-grid{grid-template-columns:1fr}.str-actions .str-link{width:100%}.str-hero h1{overflow-wrap:anywhere}}
        ${STR_HOSTS_INTRINSIC_LAYOUT_CSS}
      `}</style>
      <div className="str-page">
        <header className="str-hero">
          <div className="str-wrap str-hero-grid">
            <div><div className="str-kicker">For short-term rental hosts</div><h1>Model STR coverage without hiding the slow months.</h1><p className="str-lead">Short-term rental income changes with occupancy, nightly rate, season, operating history, local rules, and the evidence a provider accepts. A transparent scenario can reveal stress points; it cannot establish qualifying income.</p><div className="str-actions"><a className="str-link" href="#str-scenario">Try the seasonal model</a><a className="str-link secondary" href="#str-evidence">Review evidence questions</a></div></div>
            <aside className="str-callout" aria-labelledby="str-answer-heading"><h2 id="str-answer-heading">What is STR DSCR analysis?</h2><p>It compares a supported rental-income assumption with the proposed property payment. Providers may use historical revenue, a market report, long-term market rent, another method, or none of those. Confirm the permitted method before relying on a ratio.</p></aside>
          </div>
        </header>

        <section id="str-scenario" className="str-model" aria-labelledby="str-model-heading">
          <div className="str-wrap"><div className="str-kicker">Illustrative seasonality model</div><h2 id="str-model-heading">Compare a fictional summer-peak year.</h2><p className="str-intro">The monthly pattern below is an educational example, not property, platform, market, or provider data. Replace it with verified evidence for a real review.</p>
            <div className="str-model-grid">
              <form className="str-form" onSubmit={(event) => event.preventDefault()}><fieldset><legend>Scenario inputs</legend>
                <div className="str-field"><label htmlFor="str-adr">Average nightly rate</label><input id="str-adr" type="number" min="0" step="5" value={adr} onChange={update(setAdr)} /></div>
                <div className="str-field"><label htmlFor="str-occ">Average occupancy (%)</label><input id="str-occ" type="number" min="0" max="100" step="1" value={occupancy} onChange={update(setOccupancy)} /></div>
                <div className="str-field"><label htmlFor="str-payment">Monthly PITIA payment</label><input id="str-payment" type="number" min="1" step="50" value={payment} onChange={update(setPayment)} /></div>
              </fieldset><p className="str-help">Gross revenue equals nightly rate x 30 days x occupancy x the displayed seasonal multiplier. It excludes platform fees, vacancy beyond the entered occupancy, management, utilities, maintenance, supplies, and taxes.</p></form>
              <output className="str-output" aria-live="polite">
                {result ? <><div className="str-result-grid"><div className="str-stat"><Mono style={{ color: result.worstDscr >= 1 ? dc.emerald : "#e06363", fontSize: 30, fontWeight: 800 }}>{result.worstDscr.toFixed(2)}x</Mono><span>lowest modeled month</span></div><div className="str-stat"><Mono style={{ color: dc.cream, fontSize: 30, fontWeight: 800 }}>{result.averageDscr.toFixed(2)}x</Mono><span>average modeled month</span></div></div>
                  <div className="str-chart-scroll" role="img" aria-label={"Illustrative monthly gross revenue. Lowest month is " + MONTHS[result.worstIndex] + " at " + money(result.worst) + "."}><div className="str-chart">{result.revenue.map((value, index) => <div className="str-month" key={MONTHS[index]} title={MONTHS[index] + ": " + money(value)}><div className="str-bar" style={{ height: Math.max(4, result.peak > 0 ? value / result.peak * 100 : 4) + "%" }} /><span>{MONTHS[index]}</span></div>)}</div></div>
                  <p className="str-message">The example's lowest month is {MONTHS[result.worstIndex]} at {money(result.worst)} against a {money(payment)} payment. A value above 1.00x means modeled gross revenue exceeds the entered payment; it is not an eligibility threshold or net cash-flow conclusion.</p></> : <div className="str-error"><h3>Enter a valid scenario.</h3><p>Nightly rate cannot be negative, occupancy must be from 0% to 100%, and payment must be above zero.</p></div>}
              </output>
            </div>
          </div>
        </section>

        <section id="str-evidence" className="str-evidence" aria-labelledby="str-evidence-heading"><div className="str-wrap"><div className="str-kicker">Before requesting current terms</div><h2 id="str-evidence-heading">Verify the income, use, and cost story.</h2><div className="str-evidence-grid">
          <article className="str-card"><h3>Income evidence</h3><p>Ask which historical statements, market reports, appraisals, leases, or other sources the provider permits and how it treats fees or haircuts.</p></article>
          <article className="str-card"><h3>Legal rental use</h3><p>Confirm permits, zoning, HOA rules, insurance coverage, and any local restrictions. A modeled income stream does not override a use restriction.</p></article>
          <article className="str-card"><h3>Borrower and property</h3><p>Credit, assets, reserves, entity, appraisal, property type, condition, state, and complete documentation may still affect eligibility.</p></article>
        </div></div></section>

        <section className="str-close" aria-labelledby="str-close-heading"><div className="str-wrap str-close-grid"><div><div className="str-kicker" style={{ color: dc.rain }}>Next useful step</div><h2 id="str-close-heading">Compare seasonal and long-term-rent assumptions.</h2><p>Use the dedicated STR tool for a deeper income scenario, then ask the applicable provider which income method and evidence it will review for the actual property.</p></div><div className="str-actions"><a className="str-link" href="/tools/str-underwriting" onClick={(event) => { event.preventDefault(); onNavigate("str-underwriting"); }}>Open STR underwriting</a><a className="str-link secondary" href="/borrower-profiles" onClick={(event) => { event.preventDefault(); onNavigate("borrower-profiles"); }}>Review borrower profiles</a></div></div></section>
      </div>
    </DcShell>
  );
}

