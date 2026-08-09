import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import QualifyWidget from "./QualifyWidget";

const DEFAULT_INNER_HEIGHT = window.innerHeight;

vi.mock("./QualifyModal", () => ({
  default: ({
    open,
    initialDraft,
  }: {
    open: boolean;
    initialDraft?: Record<string, unknown> | null;
  }) => (
    <output
      data-testid="qualify-modal-state"
      data-open={open ? "true" : "false"}
    >
      {JSON.stringify(initialDraft ?? null)}
    </output>
  ),
}));

describe("QualifyWidget — visitor-controlled opening", () => {
  afterEach(() => {
    delete window.openQualify;
    delete window.closeQualify;
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: DEFAULT_INNER_HEIGHT,
    });
    vi.useRealTimers();
  });

  it("does not interrupt the visitor after a timer or deep scroll", () => {
    vi.useFakeTimers();
    render(<QualifyWidget />);

    const modal = screen.getByTestId("qualify-modal-state");
    expect(modal).toHaveAttribute("data-open", "false");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1_000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 500,
    });
    fireEvent.scroll(window);

    expect(modal).toHaveAttribute("data-open", "false");
  });

  it("carries only whitelisted non-PII scenario fields through the global helper", () => {
    render(<QualifyWidget />);

    act(() => {
      const openQualify = window.openQualify as unknown as (
        draft: Record<string, unknown>,
      ) => void;
      openQualify({
        propertyValue: 525_000,
        loanAmount: 393_750,
        rent: 3_650,
        rate: 7.125,
        purpose: "purchase",
        name: "must not cross the handoff",
        email: "must-not-cross@example.com",
      });
    });

    const modal = screen.getByTestId("qualify-modal-state");
    expect(modal).toHaveAttribute("data-open", "true");
    expect(JSON.parse(modal.textContent ?? "null")).toEqual({
      propertyValue: 525_000,
      loanAmount: 393_750,
      rent: 3_650,
      rate: 7.125,
      purpose: "purchase",
    });
  });
});
