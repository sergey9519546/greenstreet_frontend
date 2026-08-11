import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SiteNav } from './SiteShell';

describe('SiteNav', () => {
  it('does not render the retired InvestGO campaign announcement', () => {
    render(<SiteNav onNavigate={vi.fn()} />);

    expect(screen.queryByRole('link', { name: /read the investgo announcement/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dismiss announcement/i })).not.toBeInTheDocument();
  });

  it('opens a focused mobile menu without duplicate InvestGO or misleading story copy', () => {
    render(<SiteNav onNavigate={vi.fn()} />);

    const toggle = document.querySelector<HTMLButtonElement>('.burger-wrap');
    expect(toggle).not.toBeNull();
    fireEvent.click(toggle!);

    const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
    expect(within(mobileNav).getAllByRole('link', { name: /invest\s*go/i })).toHaveLength(1);
    expect(within(mobileNav).getByRole('link', { name: 'Illustrative Scenarios' })).toBeInTheDocument();
    expect(within(mobileNav).queryByText('Customer Stories')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-label', 'Close menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
