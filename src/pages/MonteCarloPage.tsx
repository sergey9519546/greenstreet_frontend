import React, { useEffect, useMemo, useState } from "react";
import { DcShell, dc } from "../design/dc";
import { Mono } from "../components/PremiumUI";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };
type InputKey = "loan" | "rent" | "nonDebt" | "initialRate" | "longRunRate" | "volatility" | "years" | "simulations" | "seed";
type Inputs = Record<InputKey, string>;
type Parsed = Record<InputKey, number>;
type SimulationResult = { belowOne: number; belowCushion: number; p10: number; median: number; p90: number; paths: number; months: number };

const DEFAULTS: Inputs = {
  loan: "400000",
  rent: "3600",
  nonDebt: "850",
  initialRate: "7.25",
  longRunRate: "5.5",
  volatility: "1.25",
  years: "5",
  simulations: "500",
  seed: "42",
};

const FIELDS: { key: InputKey; label: string; min: number; max: number; step: number; help: string }[] = [
  { key: "loan", label: "Loan amount", min: 25000, max: 5000000, step: 5000, help: "Principal used for the modeled 30-year payment." },
  { key: "rent", label: "Monthly gross rent", min: 0, max: 50000, step: 50, help: "Held constant so this tool isolates the entered rate path." },
  { key: "nonDebt", label: "Taxes, insurance, HOA per month", min: 0, max: 20000, step: 25, help: "Monthly costs added to principal and interest." },
  { key: "initialRate", label: "Starting rate assumption (%)", min: 0, max: 20, step: 0.05, help: "The first modeled annual note rate, not a current quote." },
  { key: "longRunRate", label: "Long-run rate assumption (%)", min: 0, max: 20, step: 0.05, help: "The level toward which this simplified model drifts." },
  { key: "volatility", label: "Annualized volatility assumption", min: 0, max: 10, step: 0.05, help: "Controls modeled dispersion; it is not measured market volatility." },
  { key: "years", label: "Horizon in years", min: 1, max: 30, step: 1, help: "The period over which each path is evaluated." },
  { key: "simulations", label: "Number of paths", min: 100, max: 2000, step: 100, help: "Technical range for responsive browser calculation." },
  { key: "seed", label: "Random seed", min: 1, max: 999999, step: 1, help: "Makes the illustrative path set repeatable." },
];

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

function monthlyPayment(principal: number, annualRatePct: number) {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePct) || principal < 0 || annualRatePct < 0) return NaN;
  if (principal === 0) return 0;
  const rate = annualRatePct / 1200;
  if (rate === 0) return principal / 360;
  const factor = Math.pow(1 + rate, 360);
  const value = principal * rate * factor / (factor - 1);
  return Number.isFinite(value) ? value : NaN;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function normalSample(random: () => number) {
  let first = random();
  let second = random();
  if (first <= Number.EPSILON) first = Number.EPSILON;
  if (second <= Number.EPSILON) second = Number.EPSILON;
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function percentile(sorted: number[], fraction: number) {
  if (!sorted.length) return NaN;
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction)));
  return sorted[index];
}

function validate(values: Parsed) {
  const errors: Partial<Record<InputKey, string>> = {};
  FIELDS.forEach((field) => {
    const value = values[field.key];
    if (!Number.isFinite(value)) errors[field.key] = "Enter a finite number.";
    else if (value < field.min || value > field.max) errors[field.key] = "Use a value from " + field.min.toLocaleString("en-US") + " to " + field.max.toLocaleString("en-US") + ".";
  });
  if (Number.isFinite(values.years) && !Number.isInteger(values.years)) errors.years = "Use a whole number of years.";
  if (Number.isFinite(values.simulations) && !Number.isInteger(values.simulations)) errors.simulations = "Use a whole number of paths.";
  if (Number.isFinite(values.seed) && !Number.isInteger(values.seed)) errors.seed = "Use a whole-number seed.";
  return errors;
}

function runSimulation(values: Parsed): SimulationResult | null {
  const random = seededRandom(values.seed);
  const outcomes: number[] = [];
  const months = values.years * 12;

  for (let pathIndex = 0; pathIndex < values.simulations; pathIndex += 1) {
    let rate = values.initialRate;
    let minimumCoverage = Number.POSITIVE_INFINITY;
    for (let month = 0; month < months; month += 1) {
      const drift = (values.longRunRate - rate) * 0.06;
      const shock = values.volatility * 0.12 * normalSample(random);
      rate = Math.max(0, Math.min(20, rate + drift + shock));
      const fullPayment = monthlyPayment(values.loan, rate) + values.nonDebt;
      if (!Number.isFinite(fullPayment) || fullPayment <= 0) return null;
      const coverage = values.rent / fullPayment;
      if (!Number.isFinite(coverage)) return null;
      minimumCoverage = Math.min(minimumCoverage, coverage);
    }
    if (!Number.isFinite(minimumCoverage)) return null;
    outcomes.push(minimumCoverage);
  }

  if (outcomes.length !== values.simulations) return null;
  outcomes.sort((a, b) => a - b);
  const belowOne = outcomes.filter((value) => value < 1).length / outcomes.length * 100;
  const belowCushion = outcomes.filter((value) => value < 1.25).length / outcomes.length * 100;
  const result = {
    belowOne,
    belowCushion,
    p10: percentile(outcomes, 0.1),
    median: percentile(outcomes, 0.5),
    p90: percentile(outcomes, 0.9),
    paths: outcomes.length,
    months,
  };
  return Object.values(result).every(Number.isFinite) ? result : null;
}

export default function MonteCarloPage({ onNavigate }: PageProps) {
  usePageMetadata(
    "Monte Carlo DSCR Rate-Risk Explorer | Greenstreet Finance",
    "Run a seeded, illustrative rate-path model and review the share of modeled paths below selected DSCR levels, with transparent inputs and limitations.",
    "/monte-carlo",
  );

  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const parsed = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, Number(value)])) as Parsed;
  const fieldErrors = validate(parsed);
  const validationMessage = Object.values(fieldErrors).filter(Boolean).join(" ");
  const result = useMemo(() => validationMessage ? null : runSimulation(parsed), [
    validationMessage,
    parsed.loan,
    parsed.rent,
    parsed.nonDebt,
    parsed.initialRate,
    parsed.longRunRate,
    parsed.volatility,
    parsed.years,
    parsed.simulations,
    parsed.seed,
  ]);

  const setField = (key: InputKey, value: string) => setInputs((current) => ({ ...current, [key]: value }));
  const applyPreset = (initialRate: string, longRunRate: string, volatility: string) => setInputs((current) => ({ ...current, initialRate, longRunRate, volatility }));

  return (
    <DcShell onNavigate={onNavigate} accent={dc.dark} navLinks={[{ label: "Products", view: "products" }, { label: "Stress Matrix", view: "stress-matrix" }, { label: "ARM Reset", view: "arm-reset" }]} cta={{ label: "Open the model", view: "monte-carlo" }}>
      <style>{`
        .mc-page{background:#003738;color:#eeefd3}.mc-wrap{width:min(1180px,calc(100% - 40px));margin:auto}.mc-hero{background:#0b4d4d;padding:clamp(68px,10vw,126px) 0}.mc-hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(34px,6vw,84px);align-items:center}
        .mc-kicker{font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#d8d958}.mc-hero h1{font-size:clamp(2.6rem,6.7vw,5.9rem);line-height:.94;letter-spacing:-.045em;margin:18px 0 24px;max-width:13ch}.mc-lead{font-size:clamp(1.05rem,1.9vw,1.3rem);line-height:1.6;color:rgba(238,239,211,.76);max-width:64ch}
        .mc-callout{background:#003738;border:1px solid rgba(238,239,211,.16);border-radius:12px;padding:clamp(22px,3vw,34px)}.mc-callout h2{font-size:clamp(1.5rem,2.8vw,2.3rem);line-height:1.1;margin:0 0 14px}.mc-callout p{line-height:1.65;color:rgba(238,239,211,.7);margin:0}
        .mc-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.mc-link{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:7px;background:#d8d958;color:#003738;font-weight:800;text-decoration:none}.mc-link.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.34)}
        .mc-model,.mc-method{padding:clamp(66px,8vw,110px) 0}.mc-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.04em;margin:12px 0 18px}.mc-intro{color:rgba(238,239,211,.68);line-height:1.65;max-width:72ch}
        .mc-presets{display:flex;flex-wrap:wrap;gap:10px;margin:26px 0 18px}.mc-preset{min-height:44px;border-radius:999px;padding:0 16px;background:#0b4d4d;color:#eeefd3;border:1px solid rgba(238,239,211,.25);font:inherit;font-weight:800;cursor:pointer}
        .mc-tool{display:grid;grid-template-columns:380px 1fr;gap:18px;align-items:start}.mc-form,.mc-output{background:#0b4d4d;border:1px solid rgba(238,239,211,.15);border-radius:12px;padding:clamp(22px,3vw,32px)}.mc-form fieldset{border:0;margin:0;padding:0}.mc-form legend{font-size:1.25rem;font-weight:800;margin-bottom:20px}
        .mc-fields{display:grid;gap:15px}.mc-field-head{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.mc-field label{font-size:.78rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.mc-field input{box-sizing:border-box;width:100%;min-height:46px;margin-top:6px;background:#003738;color:#eeefd3;border:1px solid rgba(238,239,211,.24);border-radius:7px;padding:10px 12px;font:inherit}.mc-field input[aria-invalid=true]{border-color:#e06363}.mc-help{display:block;color:rgba(238,239,211,.55);font-size:.78rem;line-height:1.4;margin-top:5px}.mc-field-error{display:block;color:#ffd1cb;font-size:.78rem;margin-top:5px}
        .mc-output{min-width:0}.mc-output h3{font-size:1.35rem;margin:0 0 18px}.mc-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.mc-stat{background:#003738;border:1px solid rgba(238,239,211,.12);border-radius:9px;padding:clamp(18px,3vw,26px)}.mc-value{font-size:clamp(2.4rem,6vw,5.2rem);line-height:.9;color:#d8d958}.mc-stat h4{margin:12px 0 7px}.mc-stat p{margin:0;color:rgba(238,239,211,.62);line-height:1.5;font-size:.9rem}
        .mc-spread{margin-top:16px;background:#003738;border-radius:9px;padding:22px}.mc-spread-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.mc-spread span{display:block;color:rgba(238,239,211,.55);font-size:.78rem;margin-top:5px}.mc-note{margin-top:18px;padding:16px;border-left:4px solid #7ec8d3;background:rgba(126,200,211,.08);color:rgba(238,239,211,.7);line-height:1.6}.mc-error{color:#ffd1cb;border-left:4px solid #e06363;padding-left:16px}
        .mc-method{background:#0b4d4d}.mc-method-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:34px}.mc-card{background:#003738;border:1px solid rgba(238,239,211,.15);border-radius:10px;padding:24px}.mc-card h3{margin:0 0 10px}.mc-card p{margin:0;color:rgba(238,239,211,.66);line-height:1.6}
        .mc-close{background:#dfe7c5;color:#003738;padding:clamp(58px,8vw,92px) 0}.mc-close-grid{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:end}.mc-close p{color:rgba(0,55,56,.7);line-height:1.6;max-width:62ch}.mc-close .mc-link.secondary{color:#003738;border-color:rgba(0,55,56,.3)}
        .mc-page a:focus-visible,.mc-page button:focus-visible,.mc-page input:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}
        @media(max-width:820px){.mc-wrap{width:min(100% - 28px,1180px)}.mc-hero-grid,.mc-tool,.mc-method-grid,.mc-close-grid,.mc-stat-grid{grid-template-columns:1fr}.mc-actions .mc-link{width:100%}.mc-hero h1{overflow-wrap:anywhere}.mc-spread-grid{grid-template-columns:1fr}.mc-output{overflow:hidden}}
        @media(prefers-reduced-motion:reduce){.mc-page *{scroll-behavior:auto!important;transition:none!important}}
      `}</style>
      <div className="mc-page">
        <header className="mc-hero"><div className="mc-wrap mc-hero-grid"><div><div className="mc-kicker">Illustrative rate-risk tool</div><h1>Explore DSCR across many modeled rate paths.</h1><p className="mc-lead">This Monte Carlo explorer generates repeatable, simplified rate scenarios from the assumptions you enter. It reports model behavior, not the probability of future rates, loss, approval, or investment performance.</p><div className="mc-actions"><a className="mc-link" href="#monte-carlo-model">Open the model</a><a className="mc-link secondary" href="#monte-carlo-method">Read the method and limits</a></div></div>
          <aside className="mc-callout" aria-labelledby="mc-answer-heading"><h2 id="mc-answer-heading">What does the output mean?</h2><p>Each path changes the modeled rate over time, recalculates payment coverage, and records that path's lowest DSCR. The summary shows how many of those synthetic paths crossed selected coverage levels. It does not estimate actual default or loss probability.</p></aside></div></header>

        <section id="monte-carlo-model" className="mc-model" aria-labelledby="mc-model-heading"><div className="mc-wrap"><div className="mc-kicker">Seeded scenario engine</div><h2 id="mc-model-heading">Set every assumption before interpreting the output.</h2><p className="mc-intro">Technical input bounds keep browser calculations finite and responsive. They are model safeguards, not loan-program limits.</p>
          <div className="mc-presets" aria-label="Illustrative rate environment presets"><button type="button" className="mc-preset" onClick={() => applyPreset("7.25", "5.5", "1.25")}>Higher start, lower mean</button><button type="button" className="mc-preset" onClick={() => applyPreset("6.5", "6.5", "0.75")}>Stable mean</button><button type="button" className="mc-preset" onClick={() => applyPreset("6.0", "8.0", "1.75")}>Lower start, higher mean</button></div>
          <div className="mc-tool">
            <form className="mc-form" onSubmit={(event) => event.preventDefault()}><fieldset><legend>Simulation inputs</legend><div className="mc-fields">
              {FIELDS.map((field) => <div className="mc-field" key={field.key}><div className="mc-field-head"><label htmlFor={"mc-" + field.key}>{field.label}</label></div><input id={"mc-" + field.key} type="number" min={field.min} max={field.max} step={field.step} value={inputs[field.key]} aria-invalid={Boolean(fieldErrors[field.key])} aria-describedby={"mc-" + field.key + "-help" + (fieldErrors[field.key] ? " mc-" + field.key + "-error" : "")} onChange={(event) => setField(field.key, event.currentTarget.value)} /><small className="mc-help" id={"mc-" + field.key + "-help"}>{field.help}</small>{fieldErrors[field.key] && <small className="mc-field-error" id={"mc-" + field.key + "-error"} role="alert">{fieldErrors[field.key]}</small>}</div>)}
            </div></fieldset></form>
            <output className="mc-output" aria-live="polite">
              {validationMessage ? <div className="mc-error"><h3>Fix the highlighted inputs.</h3><p>The simulation is paused until every value is finite and within the displayed technical bounds.</p></div> : result ? <><h3>Lowest coverage observed within each modeled path</h3><div className="mc-stat-grid">
                <article className="mc-stat"><Mono className="mc-value">{result.belowOne.toFixed(1)}%</Mono><h4>of modeled paths fell below 1.00x</h4><p>This is a share of synthetic paths, not a probability of default, loss, or an actual rate outcome.</p></article>
                <article className="mc-stat"><Mono className="mc-value" style={{ color: dc.rain }}>{result.belowCushion.toFixed(1)}%</Mono><h4>of modeled paths fell below 1.25x</h4><p>1.25x is shown as a comparison level only. It is not represented as a current provider requirement.</p></article>
              </div><div className="mc-spread"><h4>Distribution of path minimums</h4><div className="mc-spread-grid"><div><Mono style={{ fontSize: 25, fontWeight: 800 }}>{result.p10.toFixed(2)}x</Mono><span>10th percentile</span></div><div><Mono style={{ fontSize: 25, fontWeight: 800 }}>{result.median.toFixed(2)}x</Mono><span>median</span></div><div><Mono style={{ fontSize: 25, fontWeight: 800 }}>{result.p90.toFixed(2)}x</Mono><span>90th percentile</span></div></div></div><p className="mc-note">Calculated from {result.paths.toLocaleString("en-US")} seeded paths across {result.months.toLocaleString("en-US")} monthly steps. Rent and non-debt costs remain fixed; the loan is modeled as a 30-year amortizing payment at each path rate. Real loan reset mechanics may differ.</p></> : <div className="mc-error"><h3>The model could not produce a finite result.</h3><p>Adjust the inputs or reduce the horizon and path count. No result is displayed when a payment, coverage value, or summary statistic is non-finite.</p></div>}
            </output>
          </div>
        </div></section>

        <section id="monte-carlo-method" className="mc-method" aria-labelledby="mc-method-heading"><div className="mc-wrap"><div className="mc-kicker">Method and limitations</div><h2 id="mc-method-heading">Useful for sensitivity, not prediction.</h2><div className="mc-method-grid">
          <article className="mc-card"><h3>Simplified mean reversion</h3><p>Rates drift toward the entered long-run level and receive random shocks scaled by the entered volatility. The coefficients are educational model choices, not calibrated forecasts.</p></article>
          <article className="mc-card"><h3>Deliberately fixed inputs</h3><p>Rent and non-debt costs remain constant so the rate effect is visible. Real rent, taxes, insurance, HOA dues, vacancies, repairs, and loan balances can change.</p></article>
          <article className="mc-card"><h3>No provider conclusion</h3><p>The model does not determine eligibility, pricing, reserves, credit, property acceptance, approval, or investment suitability. Verify the note and current terms separately.</p></article>
        </div></div></section>

        <section className="mc-close" aria-labelledby="mc-close-heading"><div className="mc-wrap mc-close-grid"><div><div className="mc-kicker" style={{ color: dc.rain }}>Compare another lens</div><h2 id="mc-close-heading">Use deterministic stress tests beside stochastic paths.</h2><p>The stress matrix shows specific rent-and-rate combinations, while the ARM reset tool applies note terms you enter. Neither replaces the executed note or provider review.</p></div><div className="mc-actions"><a className="mc-link" href="/tools/stress-matrix" onClick={(event) => { event.preventDefault(); onNavigate("stress-matrix"); }}>Open the stress matrix</a><a className="mc-link secondary" href="/tools/arm-reset" onClick={(event) => { event.preventDefault(); onNavigate("arm-reset"); }}>Model ARM reset terms</a></div></div></section>
      </div>
    </DcShell>
  );
}

