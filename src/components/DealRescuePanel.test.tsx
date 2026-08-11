import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DealRescuePanel } from './DealRescuePanel';

describe('DealRescuePanel Component', () => {
  it('does not render when DSCR >= 1.00x', () => {
    const { container } = render(
      <DealRescuePanel
        currentDSCR={1.15}
        monthlyPITIA={2500}
        monthlyRent={2875}
        purchasePrice={400000}
        loanAmount={300000}
        currentRatePct={7.0}
        onApplyAction={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all 5 rescue strategies when DSCR < 1.00x', () => {
    const handleApply = vi.fn();
    render(
      <DealRescuePanel
        currentDSCR={0.88}
        monthlyPITIA={2800}
        monthlyRent={2464}
        purchasePrice={400000}
        loanAmount={300000}
        currentRatePct={7.0}
        onApplyAction={handleApply}
      />
    );

    expect(screen.getByText(/Interactive Deal Rescue Panel/i)).toBeInTheDocument();
    expect(screen.getByText(/Switch to Interest-Only \(IO\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Add 1\.0 Discount Point Buydown/i)).toBeInTheDocument();
    expect(screen.getByText(/Request 2% Seller Closing Credit/i)).toBeInTheDocument();
    expect(screen.getByText(/Switch to AirDNA STR Projection/i)).toBeInTheDocument();

    const ioBtn = screen.getByText(/Switch to Interest-Only \(IO\)/i);
    fireEvent.click(ioBtn);
    expect(handleApply).toHaveBeenCalledWith('IO');
  });
});
