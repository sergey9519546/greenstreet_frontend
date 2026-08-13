import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DecisionSupportPage from './DecisionSupportPage';

describe('DecisionSupportPage — evidence-safe modeled verdict', () => {
  it('starts in manual review until the property state and evidence are recorded', () => {
    render(<DecisionSupportPage onNavigate={() => {}} />);

    expect(screen.getByLabelText(/property state/i)).toHaveValue('');
    expect(screen.getByText(/manual review required/i)).toBeInTheDocument();
    expect(screen.getAllByText(/property state not selected/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/preliminary modeled verdict/i)).toBeInTheDocument();
  });

  it('propagates the selected state into the governed PPP review instead of using a static state', async () => {
    render(<DecisionSupportPage onNavigate={() => {}} />);

    fireEvent.change(screen.getByLabelText(/property state/i), { target: { value: 'PA' } });

    await waitFor(() => {
      expect(screen.getByText(/PPP review for PA/i)).toBeInTheDocument();
    });
    expect(screen.queryAllByText(/property state not selected/i)).toHaveLength(0);
  });
});
