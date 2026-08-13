import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DealRescuePanel } from './DealRescuePanel';
import type { DealFix } from '../lib/dealState';

describe('DealRescuePanel Component', () => {
  const fixes: DealFix[] = [
    {
      id: 'down',
      label: 'Increase down payment',
      description: 'Bring 10 more points of equity → 35% down.',
      impact: '→ 1.00x DSCR',
      risk: 'LOW',
      apply: { down: 35, mDown: 35 },
    },
  ];

  it('does not render when there are no input-derived rescue levers', () => {
    const { container } = render(
      <DealRescuePanel
        currentDscr={1.15}
        targetDscr={1.25}
        fixes={[]}
        onApplyFix={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('passes the selected input-derived fix to its apply callback', () => {
    const handleApply = vi.fn();
    render(
      <DealRescuePanel
        currentDscr={0.88}
        targetDscr={1.0}
        fixes={fixes}
        structurePreview={{
          currentMonthlyPI: 480,
          fortyYear: { monthlyPI: 440, dscr: 2.27 },
          interestOnly: { monthlyPI: 400, dscr: 2.5, recastMonthlyPI: 573, recastDscr: 1.74 },
        }}
        onApplyFix={handleApply}
      />
    );

    expect(screen.getByRole('region', { name: /interactive deal rescue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^apply increase down payment$/i })).toBeInTheDocument();
    expect(screen.getByText(/40-year model/i)).toBeInTheDocument();
    expect(screen.getByText(/IO recast model/i)).toBeInTheDocument();
    expect(screen.queryByText(/airDNA/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /apply increase down payment/i }));
    expect(handleApply).toHaveBeenCalledWith(fixes[0]);
  });
});
