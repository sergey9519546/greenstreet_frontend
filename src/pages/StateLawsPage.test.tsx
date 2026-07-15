import React, { type PropsWithChildren } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../design/dc', () => ({
  DcShell: ({ children }: PropsWithChildren) => <>{children}</>,
  dc: {
    emerald: '#00a878', lemon: '#d8d958', dark: '#003738', cream: '#eeefd3',
    rain: '#006565', mono: 'monospace', sans: 'sans-serif', pad: '24px', maxW: 1080,
    r: { lg: 12 },
  },
  Mono: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
  H1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props}>{children}</h1>,
  Lead: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  Btn: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));
vi.mock('../design/BottomCTA', () => ({ default: () => null }));
vi.mock('../data/usMapPaths', () => ({
  US_VIEWBOX: '0 0 100 100',
  US_PATHS: { CA: 'M0 0h20v20z', TX: 'M30 30h20v20z', DC: 'M60 60h4v4z' },
}));

import StateLawsPage, { stateSearchWithSelection, stateSelectionForInput } from './StateLawsPage';

describe('StateLawsPage selection behavior', () => {
  it('clears invalid and empty input instead of preserving a prior result', () => {
    expect(stateSelectionForInput('Texas')).toBe('TX');
    expect(stateSelectionForInput('Atlantis')).toBeNull();
    expect(stateSelectionForInput('')).toBeNull();
  });

  it('updates a stable state query parameter while preserving other parameters', () => {
    expect(stateSearchWithSelection('?campaign=summer&state=NJ', 'CA')).toBe('?campaign=summer&state=CA');
    expect(stateSearchWithSelection('?campaign=summer&state=NJ', null)).toBe('?campaign=summer');
  });

  it('renders an empty result initially and keyboard-operable map regions', () => {
    const markup = renderToStaticMarkup(<StateLawsPage onBack={() => {}} onNavigate={() => {}} />);
    expect(markup).toContain('Choose a jurisdiction');
    expect(markup).toContain('role="button"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('aria-pressed="false"');
  });
});
