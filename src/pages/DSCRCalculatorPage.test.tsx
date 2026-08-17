/**
 * DSCRCalculatorPage — the flagship interaction.
 *
 * The page recomputes DSCR from raw inputs on every keystroke and paints it into
 * the hero gauge. This suite drives the real inputs (purchase price, monthly
 * rent, note rate) and checks the number the user READS against an oracle built
 * from the engine primitives the page is supposed to be using — so a regression
 * in the wiring (wrong term, tax basis dropped, insurance ignored) fails here
 * even though every engine unit test still passes.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { calculatePaymentFactor } from '../engine';
import DscrCalculatorPage, { DEFAULT_EFF_TAX, EFF_TAX_RATE } from './DSCRCalculatorPage';
import { DEFAULT_DEAL } from '../lib/dealState';

/**
 * Independent re-derivation of the page's headline DSCR.
 *
 * Mirrors the page's documented model rather than copying its code: a 30-year
 * amortising payment on the loan balance, plus the purchase-year tax reset,
 * insurance and HOA, all monthly — with rent over the top.
 */
function expectedDscr(input: {
  price: number;
  rent: number;
  ratePct: number;
  downPct: number;
  stateCode: string;
  annualInsurance: number;
  monthlyHoa: number;
}): number {
  const effTaxRate = EFF_TAX_RATE[input.stateCode] ?? DEFAULT_EFF_TAX;
  const annualTax = Math.round(input.price * effTaxRate);
  const loan = input.price * (1 - input.downPct / 100);
  const principalAndInterest =
    input.ratePct === 0 ? 0 : loan * calculatePaymentFactor(input.ratePct, 360);
  const pitia =
    principalAndInterest + annualTax / 12 + input.annualInsurance / 12 + input.monthlyHoa;
  return pitia > 0 ? input.rent / pitia : 0;
}

/** The hero gauge exposes the live figure as its accessible name: "DSCR 1.11x". */
function readGaugeDscr(): number {
  const gauge = screen.getByRole('img', { name: /^DSCR /i });
  const label = gauge.getAttribute('aria-label') ?? '';
  const parsed = Number.parseFloat(label.replace(/^DSCR\s*/i, ''));
  expect(Number.isFinite(parsed), `unreadable gauge label: "${label}"`).toBe(true);
  return parsed;
}

function renderPage() {
  return render(<DscrCalculatorPage onBack={() => {}} onNavigate={() => {}} />);
}

/** Replace a formatted currency field's contents with `next`. */
async function setCurrency(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  next: number,
) {
  const field = screen.getByLabelText(label);
  await user.clear(field);
  await user.type(field, String(next));
  await user.tab();
}

describe('DSCRCalculatorPage — live DSCR', () => {
  beforeEach(() => {
    // The page hydrates from the URL then localStorage; both are cleared by the
    // shared setup, so every test starts from DEFAULT_DEAL.
    expect(window.location.search).toBe('');
  });

  afterEach(() => {
    delete window.openQualify;
  });

  it('renders the opening deal at the DSCR the engine computes for it', () => {
    renderPage();

    const expected = expectedDscr({
      price: DEFAULT_DEAL.price,
      rent: DEFAULT_DEAL.rent,
      ratePct: DEFAULT_DEAL.rate,
      downPct: DEFAULT_DEAL.down,
      stateCode: DEFAULT_DEAL.stateCode,
      annualInsurance: DEFAULT_DEAL.ins,
      monthlyHoa: DEFAULT_DEAL.hoa,
    });

    expect(readGaugeDscr()).toBeCloseTo(expected, 2);
  });

  it('recomputes DSCR when the purchase price changes', async () => {
    const user = userEvent.setup();
    renderPage();
    const before = readGaugeDscr();

    const price = 300_000;
    await setCurrency(user, /purchase price/i, price);

    const expected = expectedDscr({
      price,
      rent: DEFAULT_DEAL.rent,
      ratePct: DEFAULT_DEAL.rate,
      downPct: DEFAULT_DEAL.down,
      stateCode: DEFAULT_DEAL.stateCode,
      annualInsurance: DEFAULT_DEAL.ins,
      monthlyHoa: DEFAULT_DEAL.hoa,
    });

    await waitFor(() => expect(readGaugeDscr()).toBeCloseTo(expected, 2));
    // A cheaper property at the same rent must improve coverage, not just change.
    expect(readGaugeDscr()).toBeGreaterThan(before);
  });

  it('recomputes DSCR when monthly rent changes', async () => {
    const user = userEvent.setup();
    renderPage();
    const before = readGaugeDscr();

    const rent = 4_200;
    await setCurrency(user, /monthly rent/i, rent);

    const expected = expectedDscr({
      price: DEFAULT_DEAL.price,
      rent,
      ratePct: DEFAULT_DEAL.rate,
      downPct: DEFAULT_DEAL.down,
      stateCode: DEFAULT_DEAL.stateCode,
      annualInsurance: DEFAULT_DEAL.ins,
      monthlyHoa: DEFAULT_DEAL.hoa,
    });

    await waitFor(() => expect(readGaugeDscr()).toBeCloseTo(expected, 2));
    expect(readGaugeDscr()).toBeGreaterThan(before);
  });

  it('recomputes DSCR when the note rate changes', async () => {
    renderPage();
    const before = readGaugeDscr();

    // The rate slider is identified by its domain (4%–12%), not by DOM order.
    const rateSlider = screen
      .getAllByRole('slider')
      .find((el) => el.getAttribute('min') === '4' && el.getAttribute('max') === '12');
    expect(rateSlider, 'no 4–12% rate slider on the page').toBeDefined();

    const ratePct = 9.5;
    fireEvent.change(rateSlider!, { target: { value: String(ratePct) } });

    const expected = expectedDscr({
      price: DEFAULT_DEAL.price,
      rent: DEFAULT_DEAL.rent,
      ratePct,
      downPct: DEFAULT_DEAL.down,
      stateCode: DEFAULT_DEAL.stateCode,
      annualInsurance: DEFAULT_DEAL.ins,
      monthlyHoa: DEFAULT_DEAL.hoa,
    });

    await waitFor(() => expect(readGaugeDscr()).toBeCloseTo(expected, 2));
    // A higher rate is a bigger payment, so coverage must fall.
    expect(readGaugeDscr()).toBeLessThan(before);
  });

  it('applies an input-derived rescue lever to the live calculator scenario', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /apply raise rent/i }));

    await waitFor(() => expect(readGaugeDscr()).toBeCloseTo(1.25, 2));
    expect(screen.queryByRole('button', { name: /apply raise rent/i })).not.toBeInTheDocument();
  });

  it('tracks compounding edits — price, rent and rate together', async () => {
    const user = userEvent.setup();
    renderPage();

    const price = 250_000;
    const rent = 2_600;
    const ratePct = 6.5;

    await setCurrency(user, /purchase price/i, price);
    await setCurrency(user, /monthly rent/i, rent);

    const rateSlider = screen
      .getAllByRole('slider')
      .find((el) => el.getAttribute('min') === '4' && el.getAttribute('max') === '12')!;
    fireEvent.change(rateSlider, { target: { value: String(ratePct) } });

    const expected = expectedDscr({
      price,
      rent,
      ratePct,
      downPct: DEFAULT_DEAL.down,
      stateCode: DEFAULT_DEAL.stateCode,
      annualInsurance: DEFAULT_DEAL.ins,
      monthlyHoa: DEFAULT_DEAL.hoa,
    });

    await waitFor(() => expect(readGaugeDscr()).toBeCloseTo(expected, 2));
  });

  it('carries the current scenario into the visitor-requested qualification flow', async () => {
    const user = userEvent.setup();
    const openQualify = vi.fn();
    window.openQualify = openQualify;
    renderPage();

    await user.click(
      screen.getByRole('button', { name: /continue scenario for qualification/i }),
    );

    expect(openQualify).toHaveBeenCalledWith({
      propertyValue: DEFAULT_DEAL.price,
      loanAmount: DEFAULT_DEAL.price * (1 - DEFAULT_DEAL.down / 100),
      rent: DEFAULT_DEAL.rent,
      rate: DEFAULT_DEAL.rate,
      purpose: 'purchase',
    });
  });

  describe('accessible verdict and controls', () => {
    it('names both sliders and wraps the verdict in a live region', () => {
      const { container } = renderPage();

      // The two PremiumSliders must carry an accessible name — bare range
      // inputs announce as a number, not "Down payment" / "Interest rate".
      expect(screen.getByRole('slider', { name: 'Down payment' })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Interest rate' })).toBeInTheDocument();

      // The verdict subtree (chip + headline + text) is a polite live region,
      // scoped away from the gauge so result changes are announced once.
      const liveRegions = Array.from(
        container.querySelectorAll('[aria-live="polite"][aria-atomic="true"]'),
      );
      expect(liveRegions.length).toBeGreaterThan(0);
      expect(
        liveRegions.some((region) =>
          /qualif|sub-1\.0|floor|green deal|strong coverage/i.test(region.textContent ?? ''),
        ),
      ).toBe(true);
    });
  });
});
