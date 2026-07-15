import React, { useEffect, useState } from "react";
import { DcShell, dc } from "../design/dc";
import { Mono } from "../components/PremiumUI";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (key: string, value: string, property = false) => {
      const attr = property ? "property" : "name";
      let node = document.head.querySelector("meta[" + attr + "='" + key + "']") as HTMLMetaElement | null;
      if (!node) { node = document.createElement("meta"); node.setAttribute(attr, key); document.head.appendChild(node); }
      node.content = value;
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

export default function VacationHomesPage({ onNavigate }: PageProps) {
  usePageMetadata(
    "Vacation Rental Use and DSCR Scenario Guide | Greenstreet Finance",
    "Compare personal-use and gross rental-income assumptions for a vacation property while reviewing occupancy, business-purpose, cost, and eligibility limits.",
    "/vacation-homes",
  );

  const [rentedNights, setRentedNights] = useState(14);
  const [nightlyRate, setNightlyRate] = useState(255);
  const [payment, setPayment] = useState(3100);
  const [operatingCostPct, setOperatingCostPct] = useState(30);

  const valid = [rentedNights, nightlyRate, payment, operatingCostPct].every(Number.isFinite)
    && rentedNights >= 0 && rentedNights <= 30 && nightlyRate >= 0 && payment > 0 && operatingCostPct >= 0 && operatingCostPct <= 100;
  const personalNights = valid ? 30 - rentedNights : 0;
  const grossIncome = valid ? nightlyRate * rentedNights : NaN;
  const modeledOperatingCosts = valid ? grossIncome * operatingCostPct / 100 : NaN;
  const netBeforeDebt = valid ? grossIncome - modeledOperatingCosts : NaN;
  const carry = valid ? payment - netBeforeDebt : NaN;
  const offset = valid && payment > 0 ? Math.max(0, Math.min(100, netBeforeDebt / payment * 100)) : NaN;
  const finiteResult = valid && [grossIncome, modeledOperatingCosts, netBeforeDebt, carry, offset].every(Number.isFinite);

  const update = (setter: (value: number) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.valueAsNumber;
    setter(Number.isFinite(next) ? next : 0);
  };

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={[{ label: "Solutions", view: "solutions" }, { label: "STR Guide", view: "str-hosts" }, { label: "DSCR Calc", view: "dscr-calculator" }]} cta={{ label: "Model rental use", view: "dscr-calculator" }}>
      <style>{`
        .vh-page{background:#003738;color:#eeefd3}.vh-wrap{width:min(1160px,calc(100% - 40px));margin:auto}.vh-hero{background:#0b4d4d;padding:clamp(68px,10vw,124px) 0}.vh-hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(34px,6vw,84px);align-items:center}
        .vh-kicker{font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#d8d958}.vh-hero h1{font-size:clamp(2.6rem,6.6vw,5.8rem);line-height:.94;letter-spacing:-.045em;margin:18px 0 24px;max-width:13ch}.vh-lead{font-size:clamp(1.05rem,1.9vw,1.3rem);line-height:1.6;color:rgba(238,239,211,.76);max-width:62ch}
        .vh-callout{background:#003738;border:1px solid rgba(238,239,211,.16);border-radius:12px;padding:clamp(22px,3vw,34px)}.vh-callout h2{font-size:clamp(1.5rem,2.8vw,2.3rem);line-height:1.1;margin:0 0 14px}.vh-callout p{line-height:1.65;color:rgba(238,239,211,.7);margin:0}.vh-callout strong{color:#d8d958}
        .vh-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.vh-link{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:7px;background:#d8d958;color:#003738;font-weight:800;text-decoration:none}.vh-link.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.34)}
        .vh-model,.vh-paths{padding:clamp(66px,8vw,110px) 0}.vh-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.04em;margin:12px 0 18px}.vh-intro{color:rgba(238,239,211,.68);line-height:1.65;max-width:70ch}
        .vh-model-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;margin-top:34px}.vh-form,.vh-result{background:#0b4d4d;border:1px solid rgba(238,239,211,.15);border-radius:12px;padding:clamp(22px,3vw,32px)}.vh-form fieldset{border:0;padding:0;margin:0}.vh-form legend{font-size:1.25rem;font-weight:800;margin-bottom:20px}
        .vh-split-label{display:flex;justify-content:space-between;gap:12px;font-size:.9rem;font-weight:800;margin-bottom:10px}.vh-split{display:flex;height:34px;border-radius:7px;overflow:hidden;margin-bottom:14px}.vh-use{background:#d8d958;color:#003738}.vh-rent{background:#7ec8d3;color:#003738}.vh-use,.vh-rent{display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:900}
        .vh-form input[type=range]{width:100%}.vh-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:22px}.vh-field label{display:block;font-size:.75rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px}.vh-field input[type=number]{box-sizing:border-box;width:100%;min-height:46px;background:#003738;color:#eeefd3;border:1px solid rgba(238,239,211,.24);border-radius:7px;padding:10px;font:inherit}
        .vh-help{font-size:.83rem;line-height:1.5;color:rgba(238,239,211,.58);margin:18px 0 0}.vh-result{display:flex;flex-direction:column;justify-content:center}.vh-result-value{font-size:clamp(3rem,7vw,5.6rem);line-height:.9;color:#7ec8d3}.vh-result h3{font-size:1.35rem;margin:14px 0 8px}.vh-result p{color:rgba(238,239,211,.68);line-height:1.6}.vh-error{color:#ffd1cb;border-left:4px solid #e06363;padding-left:14px}
        .vh-paths{background:#0b4d4d}.vh-path-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:34px}.vh-card{background:#003738;border:1px solid rgba(238,239,211,.15);border-radius:10px;padding:24px}.vh-card h3{margin:0 0 10px}.vh-card p{margin:0;color:rgba(238,239,211,.66);line-height:1.6}
        .vh-close{background:#dfe7c5;color:#003738;padding:clamp(58px,8vw,92px) 0}.vh-close-grid{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:end}.vh-close p{color:rgba(0,55,56,.7);line-height:1.6;max-width:62ch}.vh-close .vh-link.secondary{color:#003738;border-color:rgba(0,55,56,.3)}
        .vh-page a:focus-visible,.vh-page input:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}
        @media(max-width:760px){.vh-wrap{width:min(100% - 28px,1160px)}.vh-hero-grid,.vh-model-grid,.vh-path-grid,.vh-close-grid,.vh-fields{grid-template-columns:1fr}.vh-actions .vh-link{width:100%}.vh-hero h1{overflow-wrap:anywhere}.vh-split-label{font-size:.78rem}}
      `}</style>
      <div className="vh-page">
        <header className="vh-hero"><div className="vh-wrap vh-hero-grid"><div><div className="vh-kicker">For vacation-rental owners</div><h1>Decide occupancy before modeling the rental income.</h1><p className="vh-lead">A property used personally and a non-owner-occupied investment property may follow different financing rules. Model cash flow only after describing the intended use accurately.</p><div className="vh-actions"><a className="vh-link" href="#vacation-model">Compare use and income</a><a className="vh-link secondary" href="#occupancy-paths">Review occupancy limits</a></div></div>
          <aside className="vh-callout" aria-labelledby="vh-answer-heading"><h2 id="vh-answer-heading">Can a vacation home use DSCR financing?</h2><p><strong>It depends on occupancy and business purpose.</strong> DSCR financing is generally designed for non-owner-occupied investment property. Planned personal use may make the property ineligible for that path or require a different financing category.</p></aside></div></header>

        <section id="vacation-model" className="vh-model" aria-labelledby="vh-model-heading"><div className="vh-wrap"><div className="vh-kicker">Illustrative use-versus-income model</div><h2 id="vh-model-heading">Estimate net income before debt, not eligibility.</h2><p className="vh-intro">This planning model applies an editable operating-cost percentage to gross booked-night revenue, then compares the remainder with the entered payment. It does not account for every cost, tax, vacancy pattern, or provider rule.</p>
          <div className="vh-model-grid">
            <form className="vh-form" onSubmit={(event) => event.preventDefault()}><fieldset><legend>Monthly use assumptions</legend>
              <div className="vh-split-label"><span>{personalNights} personal-use nights</span><span>{rentedNights} rented nights</span></div>
              <div className="vh-split" aria-hidden="true"><div className="vh-use" style={{ width: personalNights / 30 * 100 + "%" }}>{personalNights > 4 ? "USE" : ""}</div><div className="vh-rent" style={{ width: rentedNights / 30 * 100 + "%" }}>{rentedNights > 4 ? "RENT" : ""}</div></div>
              <label htmlFor="vh-nights">Rented nights per 30-day month</label><input id="vh-nights" type="range" min="0" max="30" step="1" value={rentedNights} onChange={update(setRentedNights)} />
              <div className="vh-fields">
                <div className="vh-field"><label htmlFor="vh-rate">Nightly rate</label><input id="vh-rate" type="number" min="0" step="5" value={nightlyRate} onChange={update(setNightlyRate)} /></div>
                <div className="vh-field"><label htmlFor="vh-payment">Monthly payment</label><input id="vh-payment" type="number" min="1" step="50" value={payment} onChange={update(setPayment)} /></div>
                <div className="vh-field"><label htmlFor="vh-cost">Operating costs (%)</label><input id="vh-cost" type="number" min="0" max="100" step="1" value={operatingCostPct} onChange={update(setOperatingCostPct)} /></div>
              </div>
            </fieldset><p className="vh-help">Operating costs are a user-entered simplification. Verify management, platform fees, utilities, supplies, cleaning, maintenance, taxes, insurance, reserves, and seasonal vacancy separately.</p></form>
            <output className="vh-result" aria-live="polite">{finiteResult ? <><Mono className="vh-result-value">{Math.round(offset)}%</Mono><h3>of the entered payment is offset in this model.</h3><p>{money(grossIncome)} gross revenue less {money(modeledOperatingCosts)} modeled operating costs leaves {money(netBeforeDebt)} before debt. {carry > 0 ? "The remaining modeled payment is " + money(carry) + "." : "The modeled net income meets or exceeds the entered payment."} This is not an occupancy or financing decision.</p></> : <div className="vh-error"><h3>Enter a valid scenario.</h3><p>Rented nights must be from 0 to 30, payment must be above zero, and nightly rate and operating costs cannot be outside their displayed bounds.</p></div>}</output>
          </div></div></section>

        <section id="occupancy-paths" className="vh-paths" aria-labelledby="vh-path-heading"><div className="vh-wrap"><div className="vh-kicker">Choose the truthful category</div><h2 id="vh-path-heading">Three questions before financing comparisons.</h2><div className="vh-path-grid">
          <article className="vh-card"><h3>Will you occupy the property?</h3><p>Disclose intended personal use. Do not label an owner-used property as non-owner-occupied to fit a business-purpose scenario.</p></article>
          <article className="vh-card"><h3>Is rental use permitted?</h3><p>Confirm zoning, permits, HOA rules, insurance, and any local short-term-rental restrictions before relying on income.</p></article>
          <article className="vh-card"><h3>What evidence is accepted?</h3><p>Historical revenue, market reports, appraisals, leases, and provider income methods vary. Ask for the current, property-specific standard.</p></article>
        </div></div></section>

        <section className="vh-close" aria-labelledby="vh-close-heading"><div className="vh-wrap vh-close-grid"><div><div className="vh-kicker" style={{ color: dc.rain }}>Next useful step</div><h2 id="vh-close-heading">Use the workflow that matches the actual occupancy.</h2><p>For a non-owner-occupied rental scenario, continue to the DSCR calculator. For nightly income, review the STR guide and confirm the permitted income method.</p></div><div className="vh-actions"><a className="vh-link" href="/tools/dscr-calculator" onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }}>Model a rental property</a><a className="vh-link secondary" href="/str-hosts" onClick={(event) => { event.preventDefault(); onNavigate("str-hosts"); }}>Review STR assumptions</a></div></div></section>
      </div>
    </DcShell>
  );
}

