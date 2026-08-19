/**
 * Render smoke coverage for every interactive tool page.
 *
 * These pages carry the product's decision surfaces and, until now, none of them
 * had a test that so much as mounted them — a bad import, a null deref in a
 * memo, or a missing engine export would only surface in the browser.
 *
 * Each case asserts the page mounts without throwing and produces its shared
 * shell landmarks (DcShell → SiteNav + SiteFooter) plus a level-1 heading.
 * Deliberately NO copy assertions: headings and page titles are actively being
 * reworked, and structure is what these guard.
 *
 * They all run in one file on purpose — the pages share a large module graph
 * (design system + engine), so a single worker imports it once instead of 11x.
 */
import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';

import DSCRCalculatorPage from './DSCRCalculatorPage';
import ToolsPage from './ToolsPage';
import DealAnalyzerPage from './DealAnalyzerPage';
import LenderIntelPage from './LenderIntelPage';
import MonteCarloPage from './MonteCarloPage';
import PortfolioPage from './PortfolioPage';
import RateQuizPage from './RateQuizPage';
import RefiTrackerPage from './RefiTrackerPage';
import ReturnsPage from './ReturnsPage';
import STRUnderwritingPage from './STRUnderwritingPage';
import StressMatrixPage from './StressMatrixPage';
import TaxEnginePage from './TaxEnginePage';

// Every tool page takes the same navigation props from App.
type ToolPageProps = { onBack: () => void; onNavigate: (view: string) => void };

const TOOL_PAGES: ReadonlyArray<readonly [string, ComponentType<ToolPageProps>]> = [
  ['DSCRCalculatorPage', DSCRCalculatorPage as ComponentType<ToolPageProps>],
  ['ToolsPage', ToolsPage as ComponentType<ToolPageProps>],
  ['DealAnalyzerPage', DealAnalyzerPage as ComponentType<ToolPageProps>],
  ['StressMatrixPage', StressMatrixPage as ComponentType<ToolPageProps>],
  ['MonteCarloPage', MonteCarloPage as ComponentType<ToolPageProps>],
  ['PortfolioPage', PortfolioPage as ComponentType<ToolPageProps>],
  ['ReturnsPage', ReturnsPage as ComponentType<ToolPageProps>],
  ['RateQuizPage', RateQuizPage as ComponentType<ToolPageProps>],
  ['RefiTrackerPage', RefiTrackerPage as ComponentType<ToolPageProps>],
  ['LenderIntelPage', LenderIntelPage as ComponentType<ToolPageProps>],
  ['STRUnderwritingPage', STRUnderwritingPage as ComponentType<ToolPageProps>],
  ['TaxEnginePage', TaxEnginePage as ComponentType<ToolPageProps>],
];

describe('interactive tool pages — render smoke', () => {
  it.each(TOOL_PAGES)('%s mounts and renders its page shell', (_name, Page) => {
    expect(() =>
      render(<Page onBack={() => {}} onNavigate={() => {}} />),
    ).not.toThrow();

    // Shared shell landmarks — the page is inside DcShell, not a bare fragment.
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // A page-level heading with real text (not an empty placeholder shell).
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBeGreaterThan(0);
    expect(h1s[0].textContent?.trim().length ?? 0).toBeGreaterThan(0);

    // Each tool sets its own document title on mount for SEO/analytics.
    expect(document.title.trim().length).toBeGreaterThan(0);
  });

  it('every tool page renders at least one interactive control', () => {
    for (const [name, Page] of TOOL_PAGES) {
      const { unmount } = render(<Page onBack={() => {}} onNavigate={() => {}} />);
      const controls = [
        ...screen.queryAllByRole('button'),
        ...screen.queryAllByRole('link'),
        ...screen.queryAllByRole('textbox'),
        ...screen.queryAllByRole('slider'),
        ...screen.queryAllByRole('combobox'),
        ...screen.queryAllByRole('spinbutton'),
        ...screen.queryAllByRole('tab'),
      ];
      expect(controls.length, `${name} rendered no interactive controls`).toBeGreaterThan(0);
      unmount();
    }
  });
});
