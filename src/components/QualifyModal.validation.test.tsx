// @vitest-environment jsdom

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import QualifyModal from "./QualifyModal";

vi.mock("../analytics/analytics", () => ({ trackEvent: vi.fn() }));

function currentPrimaryButton(): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>(".qm-btn-primary"))
    .find((candidate) => !candidate.disabled);
  if (!button) throw new Error("Expected an enabled primary action");
  return button;
}

async function advanceToContactStep() {
  render(<QualifyModal open onClose={vi.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: "Purchase" }));
  fireEvent.click(screen.getByRole("button", { name: "Single-family" }));
  fireEvent.click(currentPrimaryButton());

  fireEvent.change(screen.getByLabelText("Property state"), { target: { value: "California" } });
  fireEvent.click(within(screen.getByRole("group", { name: "Borrower credit score range" })).getAllByRole("button")[0]);
  fireEvent.click(within(screen.getByRole("group", { name: "Borrower type" })).getAllByRole("button")[0]);
  fireEvent.click(within(screen.getByRole("group", { name: "Investor experience" })).getAllByRole("button")[0]);
  fireEvent.click(currentPrimaryButton());
  fireEvent.click(currentPrimaryButton());

  await waitFor(() => expect(screen.getByLabelText("Full name")).toBeTruthy());
}

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("QualifyModal field validation", () => {
  it("shows stable field descriptions when required text fields are blurred", async () => {
    await advanceToContactStep();
    const name = screen.getByLabelText("Full name");
    const email = screen.getByLabelText("Work email");

    fireEvent.blur(name);
    const nameErrorId = name.getAttribute("aria-describedby");
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(nameErrorId).toMatch(/-name-error$/);
    expect(document.getElementById(nameErrorId ?? "")?.textContent).toBe("Enter your full name.");

    fireEvent.change(name, { target: { value: "Jane Smith" } });
    fireEvent.change(name, { target: { value: "" } });
    fireEvent.blur(name);
    expect(name.getAttribute("aria-describedby")).toBe(nameErrorId);

    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.blur(email);
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(email.getAttribute("aria-describedby") ?? "")?.textContent)
      .toBe("Enter a valid email address.");
    expect(document.querySelector("[data-qualify-validation-summary]")).toBeNull();
  });

  it("announces every empty required field and focuses the first invalid field on submit", async () => {
    await advanceToContactStep();
    const name = screen.getByLabelText("Full name");
    const email = screen.getByLabelText("Work email");
    const timeline = screen.getByRole("group", { name: "When do you need to close?" });
    const consent = screen.getByRole("checkbox", { name: /I agree to be contacted/i });

    fireEvent.click(screen.getByRole("button", { name: /Send my scenario for review/i }));

    const summary = document.querySelector<HTMLElement>("[data-qualify-validation-summary]");
    expect(summary?.getAttribute("role")).toBe("alert");
    expect(summary?.getAttribute("aria-live")).toBe("assertive");
    expect(summary?.textContent).toContain("full name, email address, closing timeline, and contact consent");

    for (const field of [name, email, timeline, consent]) {
      expect(field.getAttribute("aria-invalid")).toBe("true");
      const descriptionId = field.getAttribute("aria-describedby");
      expect(descriptionId).toBeTruthy();
      expect(document.getElementById(descriptionId ?? "")?.textContent).toBeTruthy();
    }

    expect(document.activeElement).toBe(name);
    expect(fetch).not.toHaveBeenCalled();
  });
});
