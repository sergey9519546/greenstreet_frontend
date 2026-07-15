import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  default as DscrCalculatorPage,
  calculateDscrScenario,
  parseFiniteNumberInput,
  type DscrScenarioInputs,
} from './DSCRCalculatorPage';
import {
  MAX_LOAN_AMOUNT,
  MAX_MONTHLY_RENT,
  MAX_PURCHASE_PRICE,
  buildEngineInputs,
} from '../engine/inputs';

const validScenario: DscrScenarioInputs = {
  price: 400_000,
  downPercent: 25,
  monthlyRent: 3_000,
  annualRatePercent: 6,
  annualTax: 4_800,
  annualInsurance: 2_400,
  monthlyHoa: 100,
};

const indexCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

describe('parseFiniteNumberInput', () => {
  it('accepts finite numeric text and rejects blank or non-finite input', () => {
    expect(parseFiniteNumberInput(' 2500.50 ')).toBe(2500.5);
    expect(parseFiniteNumberInput('0')).toBe(0);
    expect(parseFiniteNumberInput('   ')).toBeNull();
    expect(parseFiniteNumberInput('not-a-number')).toBeNull();
    expect(parseFiniteNumberInput('Infinity')).toBeNull();
    expect(parseFiniteNumberInput('1e308')).toBeNull();
    expect(parseFiniteNumberInput(String(MAX_PURCHASE_PRICE))).toBe(MAX_PURCHASE_PRICE);
    expect(parseFiniteNumberInput(String(MAX_PURCHASE_PRICE - 1))).toBe(MAX_PURCHASE_PRICE - 1);
  });
});

describe('calculateDscrScenario', () => {
  it('deterministically calculates loan, payment, PITIA, and DSCR', () => {
    const result = calculateDscrScenario(validScenario);

    expect(result).not.toBeNull();
    expect(result!.loan).toBe(300_000);
    expect(result!.principalAndInterest).toBeCloseTo(1_798.65, 2);
    expect(result!.pitia).toBeCloseTo(2_498.65, 2);
    expect(result!.dscr).toBeCloseTo(1.20065, 5);
  });

  const invalidScenarios: Array<[string, Partial<DscrScenarioInputs>]> = [
    ['missing price', { price: null }],
    ['zero rent', { monthlyRent: 0 }],
    ['missing taxes', { annualTax: null }],
    ['non-positive insurance', { annualInsurance: 0 }],
    ['negative HOA dues', { monthlyHoa: -1 }],
    ['invalid down payment', { downPercent: 100 }],
    ['non-finite interest rate', { annualRatePercent: Number.POSITIVE_INFINITY }],
  ];

  it.each(invalidScenarios)('rejects %s instead of emitting unsafe results', (_name, overrides) => {
    expect(calculateDscrScenario({ ...validScenario, ...overrides })).toBeNull();
  });

  it('rejects huge finite currency and rent before calculation', () => {
    expect(calculateDscrScenario({ ...validScenario, price: 1e308 })).toBeNull();
    expect(calculateDscrScenario({ ...validScenario, monthlyRent: 1e308 })).toBeNull();
  });

  it('preserves finite results at the supported purchase and rent boundaries', () => {
    const result = calculateDscrScenario({
      ...validScenario,
      price: MAX_PURCHASE_PRICE,
      monthlyRent: MAX_MONTHLY_RENT,
    });

    expect(result).not.toBeNull();
    expect(Object.values(result!).every(Number.isFinite)).toBe(true);
  });
});

describe('buildEngineInputs currency boundaries', () => {
  it('rejects huge finite purchase, rent, and loan payloads', () => {
    const inputs = buildEngineInputs({ purchasePrice: 1e308, monthlyRent: 1e308, loanAmount: 1e308, state: 'TX' });

    expect(inputs.property.purchasePrice).toBe(0);
    expect(inputs.property.leaseRent).toBe(0);
    expect(inputs.loan.ltv).toBe(75);
  });

  it('preserves near-bound finite purchase, rent, and loan payloads', () => {
    const inputs = buildEngineInputs({
      purchasePrice: MAX_PURCHASE_PRICE,
      monthlyRent: MAX_MONTHLY_RENT,
      loanAmount: MAX_LOAN_AMOUNT,
      state: 'TX',
    });

    expect(inputs.property.purchasePrice).toBe(MAX_PURCHASE_PRICE);
    expect(inputs.property.leaseRent).toBe(MAX_MONTHLY_RENT);
    expect(inputs.loan.ltv).toBe(100);
  });
});

describe('DSCR calculator accessibility', () => {
  it('explicitly names the disabled auto-derived property-tax input', () => {
    const html = renderToStaticMarkup(createElement(DscrCalculatorPage));
    const derivedTaxInput = html.match(/<input[^>]*aria-label="Estimated annual property taxes"[^>]*>/)?.[0];

    expect(derivedTaxInput).toBeDefined();
    expect(derivedTaxInput).toContain('class="gs-num"');
    expect(derivedTaxInput).toContain('disabled=""');
  });
});

describe('DSCR calculator narrow viewport containment', () => {
  it('keeps every direct section wrapper border-boxed inside 16px mobile gutters', () => {
    const html = renderToStaticMarkup(createElement(DscrCalculatorPage));

    expect(html.match(/<section[^>]*class="dscr-section"/g)).toHaveLength(3);
    expect(html.match(/<div[^>]*class="[^"]*dscr-section-inner[^"]*"/g)).toHaveLength(3);
    expect(html).toContain('.dscr-section > .dscr-section-inner { box-sizing:border-box; width:100%; min-width:0; max-width:100%; }');
    expect(html).toContain('@media (max-width: 480px) { .dscr-section { padding-left:16px !important; padding-right:16px !important; } }');
  });

  it('bounds and scales the loaded footer wordmark at every viewport through 480px', () => {
    expect(indexCss).toContain('.footer_logo > span {\n  max-width: 100% !important;\n  font-size: 46px !important;\n}');
    expect(indexCss).toContain('@media (max-width: 480px) {');
    expect(indexCss).toContain('font-size: min(46px, 8vw) !important;');
    expect(indexCss).not.toContain('overflow-x: hidden');
  });
});
