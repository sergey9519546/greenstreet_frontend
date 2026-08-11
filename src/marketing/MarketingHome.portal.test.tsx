import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketingHome from "./MarketingHome";

type TestMarketingRuntime = Window & {
  Webflow?: {
    ready?: () => void;
    require?: (module: string) => { init?: () => void } | undefined;
  };
  initAnimations?: () => void;
  __gsStartMarketing?: () => void;
  __gsStopMarketing?: () => void;
};

const runtime = window as TestMarketingRuntime;

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  delete runtime.Webflow;
  delete runtime.initAnimations;
  delete runtime.__gsStartMarketing;
  delete runtime.__gsStopMarketing;
  vi.restoreAllMocks();
});

describe("MarketingHome property guide integration", () => {
  it("mounts the compact guide into the static homepage before Resources", async () => {
    document.body.innerHTML = `
      <div id="webflow-root">
        <section class="feature_contain u-container">
          <h2>Resources</h2>
        </section>
      </div>
    `;

    render(<MarketingHome />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Which rental model fits the deal?" }),
      ).toBeVisible();
    });

    const slot = document.getElementById("gs-property-types-slot");
    const resources = document.querySelector(".feature_contain.u-container");
    expect(slot).not.toBeNull();
    expect(slot?.nextElementSibling).toBe(resources);
    expect(slot).toHaveAttribute("data-home-integration", "property-guide");
    expect(document.getElementById("investor-mindset-section")).toBeNull();
  });

  it("restarts the existing homepage animation runtime for static markup", async () => {
    document.body.innerHTML = `
      <div id="webflow-root">
        <button class="burger-wrap">Open</button>
        <button class="burger-wrap">Close</button>
        <section id="mobile-navigation"></section>
        <section class="feature_contain u-container">
          <h2>Resources</h2>
        </section>
      </div>
    `;

    const webflowReady = vi.fn();
    const ix2Init = vi.fn();
    const initAnimations = vi.fn();
    const startMarketing = vi.fn();
    const stopMarketing = vi.fn();
    runtime.Webflow = {
      ready: webflowReady,
      require: vi.fn(() => ({ init: ix2Init })),
    };
    runtime.initAnimations = initAnimations;
    runtime.__gsStartMarketing = startMarketing;
    runtime.__gsStopMarketing = stopMarketing;
    render(<MarketingHome />);

    await waitFor(() => expect(initAnimations).toHaveBeenCalledOnce());
    expect(stopMarketing).toHaveBeenCalledOnce();
    expect(webflowReady).toHaveBeenCalledOnce();
    expect(ix2Init).toHaveBeenCalledOnce();
    expect(startMarketing).toHaveBeenCalledOnce();
  });
});
