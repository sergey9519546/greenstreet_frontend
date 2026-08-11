import { describe, expect, it } from 'vitest';
import { calculate40YearPayment, calculateIORecastPayment, calculatePointsBuydownBreakeven } from './amortization';

describe('Amortization Engine Expansions (40-Year & IO Recast Shock)', () => {
  it('calculates exact 40-Year Amortization P&I for $318,750 @ 7.00%', () => {
    const payment = calculate40YearPayment(318750, 7.0);
    // Golden vector: $1,980.78 / mo (vs 30-year $2,120.64 / mo, saving $139.86/mo)
    expect(payment).toBeGreaterThan(1975);
    expect(payment).toBeLessThan(1985);
    expect(Math.round(payment * 100) / 100).toBeCloseTo(1980.78, 0);
  });

  it('calculates exact Year 11 IO Recast Shock payment for $318,750 @ 7.00% over 240 months', () => {
    const ioPayment = (318750 * 0.07) / 12; // $1,859.375
    const recastPayment = calculateIORecastPayment(318750, 7.0, 240);
    
    // Golden vector: $2,471.25 / mo
    expect(recastPayment).toBeGreaterThan(ioPayment);
    expect(recastPayment).toBeGreaterThan(2460);
    expect(recastPayment).toBeLessThan(2480);
    
    const paymentSpikePct = ((recastPayment - ioPayment) / ioPayment) * 100;
    expect(paymentSpikePct).toBeGreaterThan(30); // ~32.9% payment spike
  });

  it('calculates exact discount points buydown breakeven months', () => {
    // $300,000 loan, 1.0 point buydown ($3,000 upfront)
    // Par payment: $2,000 / mo, Buydown payment: $1,900 / mo (saves $100 / mo)
    // Breakeven = $3,000 / $100 = 30 months
    const res = calculatePointsBuydownBreakeven(300000, 1.0, 2000, 1900);
    expect(res.upfrontCostDollars).toBe(3000);
    expect(res.monthlySavingsDollars).toBe(100);
    expect(res.breakevenMonths).toBe(30);
    expect(res.recommendedForHoldMonths(36)).toBe(true);  // 3 years hold -> recommend
    expect(res.recommendedForHoldMonths(24)).toBe(false); // 2 years hold -> do not recommend
  });
});
