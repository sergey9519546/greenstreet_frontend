import { describe, it, expect } from 'vitest';
import {
  CANONICAL_REDIRECTS,
  PUBLIC_BLOG_SLUGS,
  PUBLIC_CASE_STUDY_SLUGS,
  ROUTE_CONTRACT,
  canonicalRedirectFor,
  isKnownRoute,
  pathForView,
  resolveRoute,
  routeEntries,
} from './resolve';

describe('authoritative route contract', () => {
  for (const [view, definition] of routeEntries()) {
    if (!definition.dynamic) {
      it(`${definition.path} resolves to ${view}`, () => {
        expect(resolveRoute(definition.path)).toBe(view);
        expect(isKnownRoute(definition.path)).toBe(true);
      });
    }

    it(`${view} has the contract's canonical path`, () => {
      expect(pathForView(view)).toBe(definition.path);
    });

    for (const additionalPath of definition.additionalPaths ?? []) {
      it(`${additionalPath} resolves to ${view}`, () => {
        expect(resolveRoute(additionalPath)).toBe(view);
        expect(isKnownRoute(additionalPath)).toBe(true);
      });
    }
  }

  it('normalizes trailing slashes, queries, and hashes', () => {
    expect(resolveRoute('/dscr-calculator/')).toBe('dscr-calculator');
    expect(resolveRoute('/tools/portfolio/?mode=stress#results')).toBe('portfolio');
    expect(resolveRoute('/blog?utm_source=test#articles')).toBe('blog');
  });
});

describe('canonical aliases', () => {
  for (const [alias, destination] of Object.entries(CANONICAL_REDIRECTS)) {
    it(`${alias} redirects to ${destination}`, () => {
      expect(canonicalRedirectFor(alias)).toBe(destination);
      expect(resolveRoute(alias)).toBe(resolveRoute(destination));
      expect(isKnownRoute(alias)).toBe(true);
    });
  }

  it('/book-demo aliases the rate quiz view', () => {
    expect(canonicalRedirectFor('/book-demo')).toBe('/rate-quiz');
    expect(resolveRoute('/book-demo')).toBe('rate-quiz');
  });

  it('/partnerships is the canonical broker partner route', () => {
    expect(canonicalRedirectFor('/partnerships')).toBeNull();
    expect(resolveRoute('/partnerships')).toBe('brokers-partner');
  });
});

describe('bounded dynamic routes and not-found behavior', () => {
  it('recognizes only published blog slugs', () => {
    expect(resolveRoute(`/blog/${PUBLIC_BLOG_SLUGS[0]}`)).toBe('blog-post');
    expect(isKnownRoute(`/blog/${PUBLIC_BLOG_SLUGS[0]}`)).toBe(true);
    expect(resolveRoute('/blog/arbitrary-post')).toBe('not-found');
    expect(resolveRoute('/blog/arbitrary-post/section')).toBe('not-found');
    expect(isKnownRoute('/blog/arbitrary-post')).toBe(false);
  });

  it('recognizes only published case study slugs', () => {
    expect(resolveRoute(`/case-studies/${PUBLIC_CASE_STUDY_SLUGS[0]}`)).toBe('case-studies');
    expect(resolveRoute('/case-studies/arbitrary-study')).toBe('not-found');
  });

  it('returns not-found for unknown and near-prefix internal paths', () => {
    for (const path of [
      '/this-route-does-not-exist',
      '/blogger',
      '/book-demo/team',
      '/case-studiesXYZ',
      '/tools/portfolio-old',
      '/investgo/settings-old',
    ]) {
      expect(resolveRoute(path)).toBe('not-found');
      expect(isKnownRoute(path)).toBe(false);
    }
  });

  it('classifies absolute external URLs without requiring window', () => {
    expect(resolveRoute('https://example.com/blog')).toBe('external');
    expect(resolveRoute('mailto:hi@example.com')).toBe('external');
    expect(isKnownRoute('https://example.com/blog')).toBe(false);
    expect(isKnownRoute('blog')).toBe(false);
  });
});
