/**
 * QualifyModal — the lead funnel.
 *
 * This is the only path on the site that turns a visitor into a record in the
 * `leads` Firestore collection (POST /api/leads → firebase-admin write, see
 * src/routes/leads.ts), so the two things worth pinning are: the funnel actually
 * advances through its steps and produces a qualification tier consistent with
 * the DSCR it displays, and the submission carries the contact data the visitor
 * typed.
 *
 * Selectors here are deliberately structural — step counter, `role`, the
 * `qm-btn-primary` class, `aria-label`ed control groups — because the modal's
 * copy and its loading/error states are being reworked in parallel.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import QualifyModal, { classifyQuickDscr, dscrVerdict } from './QualifyModal';
import { LeadSubmissionSchema } from '../routes/leads';

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  timeline: string;
  purpose: string;
  state: string;
  propertyValue: number;
  loanAmount: number;
  rent: number;
  contactConsent: boolean;
  [key: string]: unknown;
};

const CONTACT = {
  name: 'Dana Okafor',
  email: 'dana@harborcapital.com',
  phone: '4155550142',
};

function dialog() {
  return screen.getByRole('dialog');
}

/** The step's forward CTA. Class, not copy — the label changes while loading. */
function primaryCta(): HTMLButtonElement {
  const btn = dialog().querySelector<HTMLButtonElement>('button[class*="qm-btn-primary"]');
  if (!btn) throw new Error('no primary CTA in the modal');
  return btn;
}

/** "Step 3 of 5" → 3. Absent once the funnel reaches confirmation. */
function currentStep(): number | null {
  const label = within(dialog()).queryByText(/^\s*Step \d+ of \d+\s*$/i);
  if (!label) return null;
  return Number.parseInt(label.textContent!.replace(/\D+/g, '').charAt(0), 10);
}

/** Pick the nth option out of an aria-labelled pill group. */
function pill(groupName: RegExp, index: number): HTMLElement {
  const group = within(dialog()).getByRole('group', { name: groupName });
  const options = within(group).getAllByRole('button');
  if (!options[index]) throw new Error(`group ${groupName} has no option ${index}`);
  return options[index];
}

function mockFetch(impl: () => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}

const okResponse = () =>
  Promise.resolve({ ok: true, status: 200, json: async () => ({ ok: true }) } as Response);

/** Step 1 → Step 2. Defaults for the numeric fields are already valid. */
async function completeStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.click(pill(/loan purpose/i, 0)); // Purchase
  await user.click(pill(/property type/i, 0)); // Single-family
  await user.click(primaryCta());
  await waitFor(() => expect(currentStep()).toBe(2));
}

/** Step 2 → Step 3. */
async function completeStep2(user: ReturnType<typeof userEvent.setup>, state = 'Texas') {
  await user.selectOptions(within(dialog()).getByLabelText(/property state/i), state);
  await user.click(pill(/credit score range/i, 3)); // 760+
  await user.click(pill(/borrower type/i, 1)); // LLC / entity
  await user.click(pill(/investor experience/i, 2)); // 4–9 properties
  await user.click(primaryCta());
  await waitFor(() => expect(currentStep()).toBe(3));
}

/**
 * On every step change the modal moves focus (first field on step 1, the step
 * heading elsewhere) from an 80ms timer. Typing before that timer fires loses
 * keystrokes to the heading, so let it land first.
 */
async function settleStepFocus() {
  await new Promise((resolve) => setTimeout(resolve, 150));
}

/** Step 4 contact capture, then submit. */
async function completeStep4(user: ReturnType<typeof userEvent.setup>) {
  await settleStepFocus();
  await user.type(within(dialog()).getByLabelText(/full name/i), CONTACT.name);
  await user.type(within(dialog()).getByLabelText(/work email/i), CONTACT.email);
  await user.type(within(dialog()).getByLabelText(/phone number/i), CONTACT.phone);
  await user.click(pill(/timeline/i, 1)); // Within 30 days
  await user.click(within(dialog()).getByRole('checkbox')); // contact consent
  await user.click(primaryCta());
}

describe('QualifyModal — lead funnel', () => {
  beforeEach(() => {
    mockFetch(okResponse);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('walks steps 1 → 2 → 3 and shows a tier consistent with the DSCR it displays', async () => {
    const user = userEvent.setup();
    render(<QualifyModal open onClose={() => {}} />);

    expect(currentStep()).toBe(1);
    await completeStep1(user);
    await completeStep2(user);

    // Step 3 shows the headline DSCR (e.g. "1.11x") plus a qualification tier.
    const shownDscr = within(dialog())
      .getAllByText(/^\d+\.\d{2}x$/)
      .map((el) => Number.parseFloat(el.textContent!))
      .find((n) => Number.isFinite(n));
    expect(shownDscr, 'no DSCR figure on the result step').toBeDefined();

    // The tier is not asserted as fixed copy — it is derived from the number the
    // visitor is looking at, so the two can never silently drift apart.
    const expectedTier = dscrVerdict(classifyQuickDscr(shownDscr!).tier, 'purchase').tier;
    expect(within(dialog()).getAllByText(expectedTier).length).toBeGreaterThan(0);
  });

  it('hydrates the opening step from an in-memory non-PII scenario draft', async () => {
    render(
      <QualifyModal
        open
        onClose={() => {}}
        initialDraft={{
          propertyValue: 610_000,
          loanAmount: 427_000,
          rent: 4_900,
          rate: 6.875,
          purpose: 'cash-out',
        }}
      />,
    );

    await waitFor(() => {
      expect(within(dialog()).getByLabelText(/estimated property value/i)).toHaveValue(610_000);
      expect(within(dialog()).getByLabelText(/desired loan amount/i)).toHaveValue(427_000);
      expect(within(dialog()).getByLabelText(/expected monthly rent/i)).toHaveValue(4_900);
      expect(within(dialog()).getByLabelText(/estimated interest rate/i)).toHaveValue(6.875);
    });
    expect(
      within(within(dialog()).getByRole('group', { name: /loan purpose/i })).getByRole(
        'button',
        { name: /cash-out refi/i },
      ),
    ).toHaveClass('qm-pill-active');
  });

  it('supports District of Columbia properties and broker contacts', async () => {
    const user = userEvent.setup();
    render(<QualifyModal open onClose={() => {}} />);

    await completeStep1(user);
    await completeStep2(user, 'District of Columbia');
    await user.click(primaryCta()); // step 3 → step 4
    await waitFor(() => expect(currentStep()).toBe(4));

    expect(
      within(within(dialog()).getByRole('group', { name: /i am a/i })).getByRole(
        'button',
        { name: /broker or loan officer/i },
      ),
    ).toBeInTheDocument();
  });

  it('submits the entered contact data to the lead endpoint and confirms', async () => {
    const fetchMock = mockFetch(okResponse);
    const user = userEvent.setup();
    render(<QualifyModal open onClose={() => {}} />);

    await completeStep1(user);
    await completeStep2(user);
    await user.click(primaryCta()); // step 3 → step 4
    await waitFor(() => expect(currentStep()).toBe(4));

    await completeStep4(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/leads');
    expect(init.method).toBe('POST');

    const payload = JSON.parse(String(init.body)) as LeadPayload;
    expect(payload).toMatchObject({
      name: CONTACT.name,
      email: CONTACT.email,
      phone: CONTACT.phone,
      contactConsent: true,
      purpose: 'purchase',
      state: 'Texas',
    });
    // The scenario the visitor was shown must travel with the lead.
    expect(payload.propertyValue).toBeGreaterThan(0);
    expect(payload.loanAmount).toBeGreaterThan(0);
    expect(payload.rent).toBeGreaterThan(0);
    expect(payload.timeline).toBeTruthy();

    // Confirmation replaces the step counter entirely.
    await waitFor(() => expect(currentStep()).toBeNull());
  });

  /**
   * The assertion above is `toMatchObject`, which ignores extra keys — which is
   * exactly how the funnel shipped broken: the client appended `createdAt` and
   * `submittedAt`, LeadSubmissionSchema is `.strict()`, and every real
   * submission was rejected with HTTP 400 while this suite stayed green.
   *
   * So parse the payload the component actually sends with the schema the
   * server actually enforces. Any key added to the request that the server does
   * not declare fails here instead of silently zeroing out the lead funnel.
   */
  it('sends a payload the server schema accepts exactly — no extra keys', async () => {
    const fetchMock = mockFetch(okResponse);
    const user = userEvent.setup();
    render(<QualifyModal open onClose={() => {}} />);

    await completeStep1(user);
    await completeStep2(user);
    await user.click(primaryCta()); // step 3 → step 4
    await waitFor(() => expect(currentStep()).toBe(4));
    await completeStep4(user);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as unknown;

    const parsed = LeadSubmissionSchema.safeParse(payload);
    // Surface the offending keys rather than a bare `false`.
    expect(parsed.success ? [] : parsed.error.issues.map((i) => i.path.join('.'))).toEqual([]);
    expect(parsed.success).toBe(true);
  });

  it('never sends a lead until the contact step is valid', async () => {
    const fetchMock = mockFetch(okResponse);
    const user = userEvent.setup();
    render(<QualifyModal open onClose={() => {}} />);

    await completeStep1(user);
    await completeStep2(user);
    await user.click(primaryCta());
    await waitFor(() => expect(currentStep()).toBe(4));

    // Name + email only: consent and timeline are still missing.
    await settleStepFocus();
    await user.type(within(dialog()).getByLabelText(/full name/i), CONTACT.name);
    await user.type(within(dialog()).getByLabelText(/work email/i), CONTACT.email);
    await user.click(primaryCta());

    expect(fetchMock).not.toHaveBeenCalled();
    expect(currentStep()).toBe(4);
  });

  it('keeps the visitor on the contact step when delivery fails', async () => {
    const fetchMock = mockFetch(() =>
      Promise.resolve({ ok: false, status: 500, json: async () => ({}) } as Response),
    );
    const user = userEvent.setup();
    render(<QualifyModal open onClose={() => {}} />);

    await completeStep1(user);
    await completeStep2(user);
    await user.click(primaryCta());
    await waitFor(() => expect(currentStep()).toBe(4));

    await completeStep4(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    // A rejected write must never look like a delivered lead.
    await waitFor(() => expect(currentStep()).toBe(4));
  });

  it('renders nothing while closed', () => {
    const { container } = render(<QualifyModal open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
