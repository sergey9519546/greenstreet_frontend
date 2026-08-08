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
      <button type="button" onClick={() => props.onNavigate?.('commercial-dscr')}>
        go to commercial dscr
      </button>
    </div>
  ),
}));
// Commercial DSCR is the nested-tool stand-in on purpose: it is a released tool
// with no record in TOOL_RELIABILITY_HOLDS, so its sentinel proves the /tools/*
// route resolved AND its lazy chunk loaded. A held tool cannot prove either —
// it renders ToolReliabilityHoldPage no matter how the chunk wiring is broken.
vi.mock('./pages/CommercialDSCRPage', () => ({
  default: () => <div data-testid="route-commercial-dscr" />,
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

  it('renders a nested tool route (/tools/commercial-dscr)', async () => {
    await renderAt('/tools/commercial-dscr');
    expect(await screen.findByTestId('route-commercial-dscr')).toBeInTheDocument();
    expect(screen.queryByTestId('route-marketing-home')).toBeNull();
  });

  /**
   * The release gate seen from the router. toolReliabilityHolds.test.ts proves no
   * hold record is orphaned by scanning App.tsx source; this proves the rendered
   * result at a held path is the hold page, not the tool.
   */
  it('resolves a held tool route (/tools/returns) to its reliability hold', async () => {
    await renderAt('/tools/returns');
    expect(await screen.findByText(/tool reliability review/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /investment returns/i })).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: /go to commercial dscr/i }));

    // Under test is the onNavigate wiring: the click must push the canonical path
    // and swap the rendered view to the destination tool.
    expect(window.location.pathname).toBe('/tools/commercial-dscr');
    expect(await screen.findByTestId('route-commercial-dscr')).toBeInTheDocument();
    expect(screen.queryByTestId('route-dscr-calculator')).toBeNull();
  });
});
