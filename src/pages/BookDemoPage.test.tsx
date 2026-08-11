import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BookDemoPage from './BookDemoPage';

describe('BookDemoPage', () => {
  beforeEach(() => {
    delete window.openQualify;
  });

  afterEach(() => {
    delete window.openQualify;
  });

  it('does not render an external scheduling embed', () => {
    const { container } = render(<BookDemoPage onNavigate={() => {}} />);

    expect(container.querySelector('iframe')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(
      /meetings\.hubspot|meetings-iframe-container|calendly/i,
    );
  });

  it('opens the owned qualification flow when it is available', () => {
    const openQualify = vi.fn();
    const onNavigate = vi.fn();
    window.openQualify = openQualify;
    render(<BookDemoPage onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /send my scenario/i }));

    expect(openQualify).toHaveBeenCalledOnce();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('falls back to the rate quiz when the qualification flow is unavailable', () => {
    const onNavigate = vi.fn();
    render(<BookDemoPage onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /send my scenario/i }));

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith('rate-quiz');
  });
});
