/**
 * Router resolution tests.
 *
 * Guards the `/tools/*` reverse-route gap: every canonical path the app links
 * to must (a) resolve to the right PageView and (b) be recognised by
 * isKnownRoute so the global click interceptor handles it as an SPA route
 * instead of a full page reload. Documented intentional aliases are pinned
 * here too, so an accidental change to one shows up as a failing expectation
 * rather than a silent redirect.
 */

import { describe, it, expect } from 'vitest';
import { resolveRoute, isKnownRoute, type PageView } from './resolve';

// Canonical path → expected view. These are the paths the app's viewToPath()
// emits; each must round-trip back to the same view on reload / deep-link.
const CANONICAL: Record<string, PageView> = {
  '/': 'marketing',
  '/investgo': 'portal',
  '/dscr-calculator': 'dscr-calculator',
  '/lender-intel': 'lender-intel',
  '/state-laws': 'state-laws',
  '/borrower-profiles': 'borrower-profiles',
  '/non-us-investors': 'non-us-investors',
  '/brokers': 'brokers',
  '/investors': 'investors',
  '/faq': 'faq',
  '/blog': 'blog',
  '/case-studies': 'case-studies',
  '/rate-quiz': 'rate-quiz',
  '/about': 'about',
  '/careers': 'careers',
  '/legal': 'legal',
  '/products': 'products',
  '/products/platform': 'platform',
  '/solutions': 'solutions',
  '/tools/refi-tracker': 'refi-tracker',
  '/tools/arm-reset': 'arm-reset',
  '/tools/monte-carlo': 'monte-carlo',
  '/tools/returns': 'returns',
  '/tools/tax-engine': 'tax-engine',
  '/tools/stress-matrix': 'stress-matrix',
  '/tools/decision-support': 'decision-support',
  '/tools/str-underwriting': 'str-underwriting',
  '/tools/portfolio': 'portfolio',
};

describe('resolveRoute — canonical paths round-trip', () => {
  for (const [path, view] of Object.entries(CANONICAL)) {
    it(`${path} → ${view}`, () => {
      expect(resolveRoute(path)).toBe(view);
    });
  }

  it('tolerates a trailing slash', () => {
    expect(resolveRoute('/dscr-calculator/')).toBe('dscr-calculator');
    expect(resolveRoute('/tools/portfolio/')).toBe('portfolio');
  });

  it('resolves blog and case-study detail slugs', () => {
    expect(resolveRoute('/blog/some-post')).toBe('blog-post');
    expect(resolveRoute('/blog')).toBe('blog');
    expect(resolveRoute('/case-studies/some-study')).toBe('case-studies');
  });

  it('falls back to marketing for unknown internal paths', () => {
    expect(resolveRoute('/this-route-does-not-exist')).toBe('marketing');
  });
});

describe('resolveRoute — documented intentional aliases', () => {
  // These deliberately do NOT round-trip 1:1 (pages merged / removed).
  it('/deal-analyzer → lender-intel (Deal Analyzer merged into matcher)', () => {
    expect(resolveRoute('/deal-analyzer')).toBe('lender-intel');
  });
  it('/portfolio-builders → portfolio (page removed)', () => {
    expect(resolveRoute('/portfolio-builders')).toBe('portfolio');
  });
  it('/partnerships → portal (old Partnerships page lands on dashboard)', () => {
    expect(resolveRoute('/partnerships')).toBe('portal');
  });
  it('/foreign-nationals → non-us-investors (legacy slug; audience page renamed)', () => {
    expect(resolveRoute('/foreign-nationals')).toBe('non-us-investors');
  });
  it('/privacy-policy and /terms-of-service both resolve to legal', () => {
    expect(resolveRoute('/privacy-policy')).toBe('legal');
    expect(resolveRoute('/terms-of-service')).toBe('legal');
  });
});

describe('isKnownRoute — interceptor coverage', () => {
  for (const path of Object.keys(CANONICAL)) {
    it(`recognises ${path}`, () => {
      expect(isKnownRoute(path)).toBe(true);
    });
  }

  it('recognises blog / case-study detail paths', () => {
    expect(isKnownRoute('/blog/x')).toBe(true);
    expect(isKnownRoute('/case-studies/x')).toBe(true);
  });

  it('rejects external / unknown and non-rooted hrefs', () => {
    expect(isKnownRoute('/nope')).toBe(false);
    expect(isKnownRoute('https://example.com/foo')).toBe(false);
    expect(isKnownRoute('mailto:hi@greenstreet.com')).toBe(false);
  });
});
