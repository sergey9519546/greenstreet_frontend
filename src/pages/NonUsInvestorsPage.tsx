import React, { useEffect, useState } from "react";
import { DcShell, dc } from "../design/dc";
import { Mono } from "../components/PremiumUI";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };

const FACTORS = [
  { title: "Identity and residency", body: "Government identification, residency, visa or tax-identification status, sanctions screening, and country-specific restrictions may affect review." },
  { title: "Credit and financial evidence", body: "Some profiles may consider alternative credit, bank references, assets, or other evidence when a usable U.S. credit file is unavailable." },
  { title: "Funds and reserves", body: "Down payment, closing funds, and reserves generally need a clear source and transfer trail. Banking and currency-conversion requirements vary." },
  { title: "Entity and guarantees", body: "Permitted vesting, entity documents, ownership, guarantees, and signing authority depend on the provider and transaction." },
  { title: "Property and income", body: "Appraisal, rent support, insurance, condition, property type, occupancy, and local rental rules remain part of the review." },
  { title: "Closing and professional advice", body: "Remote signing, notarization, title, tax, estate, legal, and foreign-exchange questions require the appropriate provider or qualified professional." },
];

const FAQS = [
  ["Can a non-U.S. citizen seek U.S. rental-property financing?", "Some providers consider foreign-national or ITIN borrower profiles. Availability and requirements vary by country, residency, property, transaction, documentation, and current program."],
  ["Is a U.S. credit score always required?", "Not every profile uses U.S. bureau credit, but alternative credit or other financial evidence may be required. The applicable provider must confirm what it accepts."],
  ["How much down payment is required?", "There is no universal figure. Required equity depends on the complete borrower, property, transaction, DSCR, market, and current provider terms."],
  ["Can the property be held in a U.S. LLC?", "Some structures may permit entity vesting, but entity eligibility, guarantees, ownership, tax treatment, and signing requirements vary. Obtain provider, legal, and tax guidance."],
  ["Can closing happen remotely?", "Remote signing may be possible, but state, title, notarization, provider, identity, and document rules control the process."],
];

function payment(principal: number, annualRatePct: number) {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePct) || principal < 0 || annualRatePct < 0) return NaN;
  if (principal === 0) return 0;
  const monthlyRate = annualRatePct / 1200;
  if (monthlyRate === 0) return principal / 360;
  const factor = Math.pow(1 + monthlyRate, 360);
  const result = principal * monthlyRate * factor / (factor - 1);
  return Number.isFinite(result) ? result : NaN;
}

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

export default function NonUsInvestorsPage({ onNavigate }: PageProps) {
  usePageMetadata(
    "U.S. DSCR Scenarios for Non-US Investors | Greenstreet Finance",
    "Learn which identity, credit, funds, entity, property, and closing questions non-US investors may need to verify, and model an illustrative rental scenario.",
    "/non-us-investors",
  );

  const [rent, setRent] = useState(4000);
  const [price, setPrice] = useState(560000);
  const [downPct, setDownPct] = useState(25);
  const [rate, setRate] = useState(7.5);
  const [nonDebt, setNonDebt] = useState(900);

  const valid = [rent, price, downPct, rate, nonDebt].every(Number.isFinite)
    && rent >= 0 && price > 0 && downPct >= 0 && downPct <= 100 && rate >= 0 && rate <= 20 && nonDebt >= 0;
  const loan = valid ? price * (1 - downPct / 100) : NaN;
  const principalAndInterest = valid ? payment(loan, rate) : NaN;
  const fullPayment = valid ? principalAndInterest + nonDebt : NaN;
  const dscr = valid && fullPayment > 0 ? rent / fullPayment : NaN;
  const finiteResult = valid && Number.isFinite(loan) && Number.isFinite(fullPayment) && Number.isFinite(dscr);

  const readNumber = (value: number, setter: (next: number) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.valueAsNumber;
    setter(Number.isFinite(next) ? next : 0);
  };

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={[{ label: "Borrower Profiles", view: "borrower-profiles" }, { label: "DSCR Calc", view: "dscr-calculator" }, { label: "Solutions", view: "solutions" }]} cta={{ label: "Model a property", view: "dscr-calculator" }}>
      <style>{`
        .nu-page{background:#003738;color:#eeefd3}.nu-wrap{width:min(1160px,calc(100% - 40px));margin:auto}.nu-hero{background:#0b4d4d;padding:clamp(68px,10vw,126px) 0}
        .nu-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(34px,6vw,84px);align-items:center}.nu-kicker{font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#d8d958}
        .nu-hero h1{font-size:clamp(2.6rem,6.6vw,5.8rem);line-height:.94;letter-spacing:-.045em;margin:18px 0 24px;max-width:13ch}.nu-lead{font-size:clamp(1.05rem,1.8vw,1.3rem);line-height:1.6;color:rgba(238,239,211,.76);max-width:63ch}
        .nu-answer{background:#003738;border:1px solid rgba(238,239,211,.16);border-radius:12px;padding:clamp(22px,3vw,34px)}.nu-answer h2{font-size:clamp(1.5rem,2.8vw,2.3rem);line-height:1.1;margin:0 0 16px}.nu-answer p{color:rgba(238,239,211,.72);line-height:1.65;margin:0}
        .nu-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.nu-link{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:7px;background:#d8d958;color:#003738;font-weight:800;text-decoration:none}.nu-link.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.34)}
        .nu-factors,.nu-model,.nu-faq{padding:clamp(66px,8vw,110px) 0}.nu-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.04em;margin:12px 0 18px}.nu-intro{color:rgba(238,239,211,.68);line-height:1.65;max-width:68ch}
        .nu-factor-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:36px}.nu-factor{background:#0b4d4d;border:1px solid rgba(238,239,211,.14);border-radius:10px;padding:24px}.nu-factor h3{margin:0 0 10px}.nu-factor p{margin:0;color:rgba(238,239,211,.67);line-height:1.6}
        .nu-model{background:#0b4d4d}.nu-model-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:18px;margin-top:34px}.nu-form,.nu-result{background:#003738;border:1px solid rgba(238,239,211,.16);border-radius:12px;padding:clamp(22px,3vw,32px)}
        .nu-form fieldset{border:0;padding:0;margin:0}.nu-form legend{font-size:1.25rem;font-weight:800;margin-bottom:20px}.nu-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}.nu-field label{display:block;font-size:.78rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px}.nu-field input{box-sizing:border-box;width:100%;min-height:46px;background:#0b4d4d;color:#eeefd3;border:1px solid rgba(238,239,211,.24);border-radius:7px;padding:10px 12px;font:inherit}
        .nu-help{font-size:.83rem;color:rgba(238,239,211,.58);line-height:1.5;margin:18px 0 0}.nu-result{display:flex;flex-direction:column;justify-content:center}.nu-result-value{font-size:clamp(3rem,8vw,6.5rem);line-height:.9;color:#7ec8d3}.nu-result h3{font-size:1.35rem;margin:14px 0 8px}.nu-result p{color:rgba(238,239,211,.68);line-height:1.6}.nu-error{color:#ffd1cb;border-left:4px solid #e06363;padding-left:14px}
        .nu-faq details{border-top:1px solid rgba(238,239,211,.18);padding:20px 0}.nu-faq details:last-child{border-bottom:1px solid rgba(238,239,211,.18)}.nu-faq summary{cursor:pointer;font-weight:800;font-size:1.08rem}.nu-faq details p{color:rgba(238,239,211,.68);line-height:1.6;max-width:72ch}
        .nu-close{background:#dfe7c5;color:#003738;padding:clamp(58px,8vw,92px) 0}.nu-close-grid{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:end}.nu-close p{color:rgba(0,55,56,.7);line-height:1.6;max-width:62ch}.nu-close .nu-link.secondary{color:#003738;border-color:rgba(0,55,56,.3)}
        .nu-page a:focus-visible,.nu-page input:focus-visible,.nu-page summary:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}
        @media(max-width:760px){.nu-wrap{width:min(100% - 28px,1160px)}.nu-hero-grid,.nu-factor-grid,.nu-model-grid,.nu-close-grid,.nu-fields{grid-template-columns:1fr}.nu-actions .nu-link{width:100%}.nu-hero h1{overflow-wrap:anywhere}}
      `}</style>
      <div className="nu-page">
        <header className="nu-hero">
          <div className="nu-wrap nu-hero-grid">
            <div>
              <div className="nu-kicker">For non-US rental-property investors</div>
              <h1>Can a non-US investor seek a U.S. DSCR loan?</h1>
              <p className="nu-lead">Some providers consider foreign-national or ITIN borrower profiles for U.S. investment property. Availability is not universal, and property coverage is only one part of the review.</p>
              <div className="nu-actions"><a className="nu-link" href="#non-us-model">Model a property scenario</a><a className="nu-link secondary" href="#non-us-factors">Review eligibility factors</a></div>
            </div>
            <aside className="nu-answer" aria-labelledby="nu-direct-answer">
              <h2 id="nu-direct-answer">The direct answer</h2>
              <p>Possible does not mean eligible. Country, residency, identity, sanctions, credit evidence, assets, reserves, entity, property, transaction, state, and current provider rules all matter. Confirm availability before moving funds or committing to a structure.</p>
            </aside>
          </div>
        </header>

        <section id="non-us-factors" className="nu-factors" aria-labelledby="nu-factors-heading">
          <div className="nu-wrap">
            <div className="nu-kicker">What may be reviewed</div><h2 id="nu-factors-heading">Six cross-border question groups.</h2>
            <p className="nu-intro">These are common diligence categories, not a universal checklist. The applicable provider and closing professionals must identify the current documents and restrictions for the specific file.</p>
            <div className="nu-factor-grid">{FACTORS.map((factor) => <article className="nu-factor" key={factor.title}><h3>{factor.title}</h3><p>{factor.body}</p></article>)}</div>
          </div>
        </section>

        <section id="non-us-model" className="nu-model" aria-labelledby="nu-model-heading">
          <div className="nu-wrap">
            <div className="nu-kicker">Illustrative property model</div><h2 id="nu-model-heading">Enter visible payment assumptions.</h2>
            <p className="nu-intro">This calculation models property rent divided by the entered principal, interest, and monthly non-debt housing costs. It does not screen country or borrower eligibility.</p>
            <div className="nu-model-grid">
              <form className="nu-form" onSubmit={(event) => event.preventDefault()}>
                <fieldset><legend>Scenario inputs</legend><div className="nu-fields">
                  <div className="nu-field"><label htmlFor="nu-rent">Monthly gross rent</label><input id="nu-rent" type="number" min="0" step="50" value={rent} onChange={readNumber(rent, setRent)} /></div>
                  <div className="nu-field"><label htmlFor="nu-price">Purchase price</label><input id="nu-price" type="number" min="1" step="5000" value={price} onChange={readNumber(price, setPrice)} /></div>
                  <div className="nu-field"><label htmlFor="nu-down">Down payment assumption (%)</label><input id="nu-down" type="number" min="0" max="100" step="1" value={downPct} onChange={readNumber(downPct, setDownPct)} /></div>
                  <div className="nu-field"><label htmlFor="nu-rate">Note-rate assumption (%)</label><input id="nu-rate" type="number" min="0" max="20" step="0.125" value={rate} onChange={readNumber(rate, setRate)} /></div>
                  <div className="nu-field"><label htmlFor="nu-costs">Taxes, insurance, HOA per month</label><input id="nu-costs" type="number" min="0" step="25" value={nonDebt} onChange={readNumber(nonDebt, setNonDebt)} /></div>
                </div></fieldset>
                <p className="nu-help">Technical bounds prevent non-finite output; they are not program limits. Enter a rate only as a scenario assumption, not as an expected or available quote.</p>
              </form>
              <output className="nu-result" aria-live="polite">
                {finiteResult ? <><Mono className="nu-result-value">{dscr.toFixed(2)}x</Mono><h3>{dscr >= 1 ? "Entered rent exceeds the modeled payment." : "Entered rent is below the modeled payment."}</h3><p>{money(rent)} rent divided by {money(fullPayment)} modeled monthly payment. The modeled loan amount is {money(loan)}. A ratio above 1.00x is mathematical coverage only, not a provider threshold or approval.</p></> : <div className="nu-error"><h3>Enter a valid scenario.</h3><p>Price must be above zero; down payment must be from 0% to 100%; rate must be from 0% to 20%; rent and monthly costs cannot be negative.</p></div>}
              </output>
            </div>
          </div>
        </section>

        <section className="nu-faq" aria-labelledby="nu-faq-heading">
          <div className="nu-wrap"><div className="nu-kicker">Common questions</div><h2 id="nu-faq-heading">Answers with the limits intact.</h2>{FAQS.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="nu-close" aria-labelledby="nu-close-heading">
          <div className="nu-wrap nu-close-grid">
            <div><div className="nu-kicker" style={{ color: dc.rain }}>Before relying on a result</div><h2 id="nu-close-heading">Confirm the profile and current provider terms.</h2><p>Use the borrower-profile guide to organize evidence. Obtain qualified legal and tax advice before choosing an entity, moving cross-border funds, or drawing conclusions about FIRPTA, estate exposure, or ownership.</p></div>
            <div className="nu-actions"><a className="nu-link" href="/borrower-profiles" onClick={(event) => { event.preventDefault(); onNavigate("borrower-profiles"); }}>Review borrower profiles</a><a className="nu-link secondary" href="/tools/dscr-calculator" onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }}>Open the full calculator</a></div>
          </div>
        </section>
      </div>
    </DcShell>
  );
}

