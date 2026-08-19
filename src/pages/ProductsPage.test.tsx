/**
 * ProductsPage — crawlable tool CTAs.
 *
 * Every tool CTA used to be a <button onClick>: it worked in the browser but
 * left the tool graph invisible to the non-JS crawlers robots.txt invites
 * (GPTBot, ClaudeBot, PerplexityBot). The Wave 2 SEO slice converted them to
 * real anchors — and this pins that: a button has no href, so a regression
 * back to buttons fails here, and an href that does not resolve to a view
 * fails the second assertion.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { resolveRoute } from '../router/resolve';
import ProductsPage from './ProductsPage';

describe('ProductsPage — tool CTAs are crawlable anchors', () => {
  it('renders every CTA as an anchor whose href resolves to a real route', () => {
    render(<ProductsPage onBack={() => {}} onNavigate={() => {}} />);

    // The 14 feature-row CTAs and 4 special-tool CTAs all end in an arrow.
    const ctas = screen.getAllByRole('link', { name: /→$/ });
    expect(ctas.length).toBe(18);

    for (const cta of ctas) {
      const href = cta.getAttribute('href');
      expect(href, 'CTA has no href').toBeTruthy();
      expect(resolveRoute(href!), `${href} does not resolve to a route`).not.toBe('not-found');
    }
  });
});
