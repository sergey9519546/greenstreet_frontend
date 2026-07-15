import React, { type PropsWithChildren } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../design/dc', () => ({
  DcShell: ({ children }: PropsWithChildren) => <>{children}</>,
  dc: {
    teal: '#006565', cream: '#eeefd3', rain: '#006565', mintBg: '#e0eee7',
    faded: '#ccd8ce', dark: '#003738', lemon: '#d8d958', sans: 'sans-serif', mono: 'monospace',
  },
  Mono: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
  H1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props}>{children}</h1>,
  Lead: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  Btn: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));
vi.mock('../design/BottomCTA', () => ({ default: () => null }));

import FAQPage, { getFaqFocusIndex } from './FAQPage';

describe('FAQPage accordion semantics', () => {
  it('connects each question button to a controlled, labelled panel', () => {
    const markup = renderToStaticMarkup(<FAQPage onBack={() => {}} onNavigate={() => {}} />);
    expect(markup).toContain('id="faq-question-0"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('aria-controls="faq-panel-0"');
    expect(markup).toContain('id="faq-panel-0" role="region" aria-labelledby="faq-question-0"');
    expect(markup).toContain('id="faq-panel-1" role="region" aria-labelledby="faq-question-1" hidden=""');
    expect(markup).toContain('aria-hidden="true"');
  });

  it('keeps the hero heading as one correctly spaced text node', () => {
    const markup = renderToStaticMarkup(<FAQPage onBack={() => {}} onNavigate={() => {}} />);
    expect(markup).toContain('DSCR loan questions — answered in plain language.');
  });

  it('supports arrow, Home, and End focus movement with wrapping', () => {
    expect(getFaqFocusIndex('ArrowDown', 2, 4)).toBe(3);
    expect(getFaqFocusIndex('ArrowDown', 3, 4)).toBe(0);
    expect(getFaqFocusIndex('ArrowUp', 0, 4)).toBe(3);
    expect(getFaqFocusIndex('Home', 2, 4)).toBe(0);
    expect(getFaqFocusIndex('End', 1, 4)).toBe(3);
    expect(getFaqFocusIndex('Enter', 1, 4)).toBeNull();
  });
});
