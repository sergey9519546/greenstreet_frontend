import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import MarketingHome from "./MarketingHome";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
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
});
