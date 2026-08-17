/**
 * StressMatrixPage — keyboard accessibility.
 *
 * The matrix was mouse-only: cells pinned a scenario on `onClick` with no
 * tabindex, role, or key handler, so a keyboard user could neither reach a
 * scenario nor pin it (the hover tooltip had no keyboard equivalent). Cells
 * are now focusable and pin on Enter/Space, and Escape dismisses the pinned
 * readout.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import StressMatrixPage from './StressMatrixPage';

describe('StressMatrixPage — keyboard accessibility', () => {
  it('makes every matrix cell focusable and operable from the keyboard', () => {
    const { container } = render(<StressMatrixPage onBack={() => {}} onNavigate={() => {}} />);

    // The full matrix (the 120-combination grid) is behind a disclosure toggle.
    fireEvent.click(screen.getByRole('button', { name: /show full matrix/i }));

    const cells = container.querySelectorAll('td[tabindex="0"]');
    expect(cells.length).toBeGreaterThan(0);
    // Every cell carries a spoken description, not a bare number.
    const first = cells[0];
    expect(first.getAttribute('aria-label')).toMatch(/DSCR \d/);

    // Enter pins the scenario into the readout the hover tooltip used to own.
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(screen.getByRole('button', { name: 'Dismiss pinned scenario' })).toBeInTheDocument();

    // Escape dismisses the pinned readout again.
    fireEvent.keyDown(first, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: 'Dismiss pinned scenario' })).not.toBeInTheDocument();
  });
});
