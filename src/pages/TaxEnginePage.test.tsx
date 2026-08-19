/**
 * TaxEnginePage — grouped input sections.
 *
 * The a11y audit found the engine's 14 controls in one flat div with no
 * <fieldset>/<legend> anywhere on the site: a screen-reader user heard each
 * control in isolation, never the fact that they were two sections ("deal
 * numbers" and "personal tax situation" — the page's own helper text says so).
 * This pins the two groups and the deal/personal split.
 *
 * Labels are matched by their leading text (content.startsWith): every label
 * wraps its hint too, and hints routinely contain other fields' words (e.g.
 * Land %'s hint mentions "purchase price"), so a bare regex would over-match.
 */
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import TaxEnginePage from './TaxEnginePage';

const startsWith = (prefix: string) => (content: string) => content.startsWith(prefix);

describe('TaxEnginePage — input grouping', () => {
  it('groups the controls into two named fieldsets with the right split', () => {
    render(<TaxEnginePage onBack={() => {}} onNavigate={() => {}} />);

    const deal = screen.getByRole('group', { name: 'Deal numbers' });
    const personal = screen.getByRole('group', { name: 'Personal tax situation' });

    // Deal economics live in the first group — and not in the second.
    expect(within(deal).getByLabelText(startsWith('Purchase Price'))).toBeInTheDocument();
    expect(within(deal).getByLabelText(startsWith('Exit prepayment penalty'))).toBeInTheDocument();
    expect(within(deal).queryByLabelText(startsWith('MAGI'))).not.toBeInTheDocument();

    // The borrower's income/tax profile lives in the second group, including
    // the filing-status select and the REP checkbox.
    expect(within(personal).getByLabelText(startsWith('MAGI'))).toBeInTheDocument();
    expect(within(personal).getByLabelText(startsWith('State Tax'))).toBeInTheDocument();
    expect(within(personal).getByLabelText(startsWith('Filing Status'))).toBeInTheDocument();
    expect(within(personal).getByRole('checkbox')).toBeInTheDocument();
    expect(within(personal).queryByLabelText(startsWith('Purchase Price'))).not.toBeInTheDocument();
  });
});
