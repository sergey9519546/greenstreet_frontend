import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DataVintageLine from './DataVintageLine';

describe('DataVintageLine dataset disclosure', () => {
  it('flags SOFR data after its registered 30-day refresh cadence', () => {
    render(
      <DataVintageLine
        datasetKey="sofrModel"
        now={new Date('2026-08-08T00:00:00.000Z')}
      />,
    );

    expect(screen.getByTestId('data-vintage-line')).toHaveTextContent('June 17, 2026');
    expect(screen.getByTestId('data-vintage-line')).toHaveTextContent('past its 30-day review cadence');
    expect(screen.getByTestId('data-vintage-line')).toHaveTextContent('verify current rates');
  });

  it('does not label the same dataset stale while it remains within cadence', () => {
    render(
      <DataVintageLine
        datasetKey="sofrModel"
        now={new Date('2026-06-30T00:00:00.000Z')}
      />,
    );

    expect(screen.getByTestId('data-vintage-line')).toHaveTextContent('June 17, 2026');
    expect(screen.getByTestId('data-vintage-line')).not.toHaveTextContent('past its 30-day review cadence');
  });
});
