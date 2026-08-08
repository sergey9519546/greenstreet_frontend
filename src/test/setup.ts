/**
 * DOM test setup — loaded only by the `dom` vitest project (src/**\/*.test.tsx).
 *
 * The app's pages are animation-heavy (GSAP + ScrollTrigger via src/design/dc.tsx)
 * and lean on browser APIs jsdom does not implement. Rather than mocking GSAP
 * away wholesale — which would also delete the code paths that WRITE the numbers
 * users read — this setup pins the environment to `prefers-reduced-motion: reduce`.
 *
 * That is the app's own deterministic branch: dc.tsx's useDcGsap, CountUp and
 * HeroProof all short-circuit their timelines under reduced motion and paint
 * final values synchronously. Tests therefore observe settled, real output with
 * no rAF timing races — and the reduced-motion path itself gets exercised.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// ── prefers-reduced-motion: reduce ───────────────────────────────────────────
// Everything else reports "no match", which is what the components expect for
// unknown queries.
function makeMediaQueryList(query: string): MediaQueryList {
  const matches = /prefers-reduced-motion/.test(query);
  return {
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => makeMediaQueryList(query),
});

// ── Observers ────────────────────────────────────────────────────────────────
// jsdom ships neither. The reveal hooks treat "never intersects" as a fallback
// (they reveal via reduced-motion / safety timer), so inert stubs are correct
// and keep pages from throwing on `new IntersectionObserver(...)`.
class NoopObserver {
  constructor(_cb?: unknown, _opts?: unknown) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [] as unknown[];
  }
}

for (const name of ['IntersectionObserver', 'ResizeObserver', 'MutationObserver'] as const) {
  if (!(name in globalThis)) {
    Object.defineProperty(globalThis, name, {
      writable: true,
      configurable: true,
      value: NoopObserver,
    });
  }
}

// ── Scrolling ────────────────────────────────────────────────────────────────
// jsdom logs "Not implemented" for these; pages call them on mount.
window.scrollTo = (() => {}) as typeof window.scrollTo;
Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
Element.prototype.scrollIntoView = function scrollIntoView() {};

// ── requestIdleCallback ──────────────────────────────────────────────────────
// App.tsx warms EVERY route chunk on idle. Handing it an idle callback that
// never fires keeps a single-route test from dynamically importing ~30 pages.
Object.defineProperty(window, 'requestIdleCallback', {
  writable: true,
  configurable: true,
  value: (_cb: unknown) => 0,
});
Object.defineProperty(window, 'cancelIdleCallback', {
  writable: true,
  configurable: true,
  value: (_id: number) => {},
});

// ── Misc APIs touched by share / export affordances ──────────────────────────
if (!('clipboard' in navigator)) {
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true,
    value: { writeText: async () => {} },
  });
}
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:test';
  URL.revokeObjectURL = () => {};
}

beforeEach(() => {
  // Deal state persists to localStorage + the URL query; a leaked snapshot from
  // one test would silently seed the next one's inputs.
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
