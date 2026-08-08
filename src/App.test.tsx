/**
 * App — route resolution integration.
 *
 * App owns path → view resolution, lazy chunk loading and history navigation.
 * Nothing exercised that wiring end to end before; a broken lazy import or a
 * dropped `case` in renderPage would only show up as a blank screen in prod.
 *
 * The tool pages themselves are replaced with sentinels: this test is about
 * routing, and their own render coverage lives in toolPages.smoke.test.tsx.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Sentinels for the heavy route modules App pulls in via React.lazy / dynamic
// import. vi.mock intercepts dynamic imports, so the real chunks never load.
vi.mock('./marketing/MarketingHome', () => ({
  default: () => <div data-testid="route-marketing-home" />,
}));
vi.mock('./pages/DSCRCalculatorPage', () => ({
  default: (props: { onNavigate?: (v: string) => void }) => (
    <div data-testid="route-dscr-calculator">
      <button type="button" onClick={() => props.onNavigate?.('returns')}>
        go to returns
      </button>
    </div>
  ),
}));
vi.mock('./pages/ReturnsPage', () => ({
  default: () => <div data-testid="route-returns" />,
}));
vi.mock('./pages/LenderIntelPage', () => ({
  default: () => <div data-testid="route-lender-intel" />,
}));

import App from './App';

function go(pathname: string) {
  window.history.replaceState({}, '', pathname);
}

async function renderAt(pathname: string) {
  go(pathname);
  const utils = render(<App />);
  return utils;
}

describe('App routing', () => {
  beforeEach(() => {
    // Suppress the qualify widget's 30s auto-open so it can never race a test.
    window.localStorage.setItem('gs_qualify_seen', '1');
  });

  afterEach(() => {
    go('/');
  });

  it('renders the marketing home at /', async () => {
    await renderAt('/');
    expect(await screen.findByTestId('route-marketing-home')).toBeInTheDocument();
  });

  it('renders the DSCR calculator at /dscr-calculator', async () => {
    await renderAt('/dscr-calculator');
    expect(await screen.findByTestId('route-dscr-calculator')).toBeInTheDocument();
    expect(screen.queryByTestId('route-marketing-home')).toBeNull();
  });

  it('renders a nested tool route (/tools/returns)', async () => {
    await renderAt('/tools/returns');
    expect(await screen.findByTestId('route-returns')).toBeInTheDocument();
  });

  it('renders the not-found page for an unknown path', async () => {
    await renderAt('/definitely-not-a-real-route');
    // NotFoundPage is imported eagerly, so it is on screen immediately.
    await waitFor(() =>
      expect(screen.getAllByRole('heading').length).toBeGreaterThan(0),
    );
    expect(screen.queryByTestId('route-marketing-home')).toBeNull();
    expect(screen.queryByTestId('route-dscr-calculator')).toBeNull();
  });

  it('swaps the rendered tool when history navigation changes the path', async () => {
    await renderAt('/dscr-calculator');
    expect(await screen.findByTestId('route-dscr-calculator')).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, '', '/lender-intel');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(await screen.findByTestId('route-lender-intel')).toBeInTheDocument();
    expect(screen.queryByTestId('route-dscr-calculator')).toBeNull();
  });

  it('navigates via the onNavigate prop a tool page is given', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    await renderAt('/dscr-calculator');
    await screen.findByTestId('route-dscr-calculator');

    await user.click(screen.getByRole('button', { name: /go to returns/i }));

    expect(await screen.findByTestId('route-returns')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/tools/returns');
  });
});
