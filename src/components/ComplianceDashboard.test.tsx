/**
 * ComplianceDashboard — mobile nav drawer accessibility.
 *
 * The drawer was mouse-only chrome: no role, no name, no Escape, no focus
 * management — keyboard users could open it, but Tab ran out of the modal into
 * the page behind it and Escape did nothing. It is now a proper dialog:
 * role="dialog" + aria-modal + a name, focus moved inside on open and restored
 * on close, Tab trapped, Escape closes.
 *
 * The `dom` vitest project aliases every firebase/* entry to
 * src/test/firebaseStub.ts, so this test overrides only the auth-gate callback
 * on that stub (signed-in user) — everything else stays on the shared stub.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { mockUser } = vi.hoisted(() => ({
  mockUser: { uid: 'test-user', email: 't@example.com', displayName: 'Test User' },
}));

vi.mock('../test/firebaseStub', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../test/firebaseStub')>();
  return {
    ...actual,
    onAuthStateChanged: (_auth: unknown, next: unknown) => {
      if (typeof next === 'function') (next as (u: unknown) => void)(mockUser);
      return () => {};
    },
    // The stub hands snapshots a `docs` array, but ComplianceDashboard's audit
    // subscription iterates with snap.forEach — give it a shape it accepts.
    onSnapshot: (_ref: unknown, next: unknown) => {
      if (typeof next === 'function') {
        (next as (s: unknown) => void)({ docs: [], forEach: () => {}, empty: true, size: 0 });
      }
      return () => {};
    },
  };
});

import ComplianceDashboard from './ComplianceDashboard';

describe('ComplianceDashboard — mobile nav drawer', () => {
  it('opens as a named modal dialog, traps focus, and closes on Escape', async () => {
    const { container } = render(
      <ComplianceDashboard onBackToMarketing={() => {}} initialEmail="" initialTab="dashboard" />,
    );

    // The auth gate must resolve to the signed-in workspace first.
    await waitFor(() => {
      expect(screen.queryByText(/LOADING ENGINE/i)).not.toBeInTheDocument();
    });

    // The hamburger is the only button inside the mobile top-bar (md:hidden).
    const toggle = container.querySelector<HTMLButtonElement>('.md\\:hidden button');
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle!);

    // A named, modal dialog — not a nameless div.
    const dialog = screen.getByRole('dialog', { name: 'Workspace navigation' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    // Focus lands inside the dialog the moment it opens.
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Tab is trapped: from the last focusable element it wraps to the first.
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
    expect(focusables.length).toBeGreaterThan(0);
    focusables[focusables.length - 1].focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(focusables[0]);

    // Escape closes the dialog.
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Workspace navigation' })).not.toBeInTheDocument();
    });
  });
});
