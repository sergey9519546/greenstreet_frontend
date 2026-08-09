import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PropertyInvestmentStrategySection, {
  PROPERTY_STRATEGIES,
} from "./PropertyInvestmentStrategySection";

describe("PropertyInvestmentStrategySection", () => {
  it("keeps decision support complete for every property type", () => {
    expect(PROPERTY_STRATEGIES).toHaveLength(10);
    expect(new Set(PROPERTY_STRATEGIES.map((strategy) => strategy.id)).size).toBe(
      PROPERTY_STRATEGIES.length,
    );

    for (const strategy of PROPERTY_STRATEGIES) {
      expect(strategy.image).toMatch(/^\/img\/properties\/.+\.(?:jpg|png|webp)$/);
      expect(strategy.advantages.length).toBeGreaterThanOrEqual(3);
      expect(strategy.tradeoffs.length).toBeGreaterThanOrEqual(3);
      expect(strategy.dueDiligence.length).toBeGreaterThan(40);
    }

    expect(PROPERTY_STRATEGIES.map((strategy) => strategy.id)).toEqual(
      expect.arrayContaining(["ADU", "STUDENT", "MANUFACTURED", "BUILD_TO_RENT"]),
    );
  });

  it("lets an investor compare a new property type and see both sides", async () => {
    const user = userEvent.setup();
    render(<PropertyInvestmentStrategySection />);

    const aduTab = screen.getByRole("tab", { name: "Home + ADU" });
    await user.click(aduTab);

    expect(aduTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "Primary Rental with an Accessory Dwelling Unit",
    );
    const fullGuideBackdrop = document.querySelector<HTMLImageElement>(
      ".gs-property-guide__backdrop img",
    );
    expect(fullGuideBackdrop).toHaveAttribute(
      "src",
      "/img/properties/adu_cottage.jpg",
    );
    expect(fullGuideBackdrop).toHaveAttribute("alt", "");
    expect(document.querySelector(".property-strategy-layout")).toBeNull();
    expect(document.querySelector(".property-strategy-art")).toBeNull();
    expect(document.querySelector(".gs-property-guide__eligibility")).toBeVisible();
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    expect(document.querySelector(".gs-property-guide")).toHaveClass(
      "u-theme-dark",
    );
    expect(
      screen.getByRole("heading", {
        name: "Choose the property. Then choose the debt.",
      }),
    ).toHaveClass("u-text-style-h2");
    expect(screen.getByText("The investment case")).toBeVisible();
    expect(screen.getByText("The operating friction")).toBeVisible();
    expect(screen.getByText(/Confirm permits, certificate of occupancy/)).toBeVisible();

    await user.keyboard("{ArrowRight}");
    const studentTab = screen.getByRole("tab", { name: "Student & Co-Living" });
    expect(studentTab).toHaveFocus();
    expect(studentTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "Student Housing & Co-Living Rentals",
    );
  });

  it("uses one full-background image and unframed property controls on the homepage", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <PropertyInvestmentStrategySection
        variant="homepage"
        onNavigate={onNavigate}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Which rental model fits the deal?" }),
    ).toHaveClass("u-text-style-h2");
    expect(document.querySelector(".gs-property-home")).toHaveClass(
      "u-theme-light",
    );
    expect(document.querySelector(".gs-property-home__inner")).toHaveClass(
      "u-container",
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(10);
    expect(screen.getByRole("tablist").querySelector("img")).toBeNull();
    expect(document.querySelector(".gs-property-home__dossier")).toBeNull();
    expect(document.querySelector(".gs-property-home__visual")).toBeNull();

    await user.click(screen.getByRole("tab", { name: "Manufactured & Modular" }));
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Manufactured & Modular Rental Homes");
    expect(panel).toHaveTextContent("The upside");
    expect(panel).toHaveTextContent("The tradeoffs");
    const backdrop = document.querySelector<HTMLImageElement>(
      ".gs-property-home__backdrop img",
    );
    expect(backdrop).toHaveAttribute(
      "src",
      "/img/properties/manufactured_modular.jpg",
    );
    expect(backdrop).toHaveAttribute("alt", "");

    await user.click(
      screen.getByRole("button", { name: /Explore the complete investor guide/ }),
    );
    expect(onNavigate).toHaveBeenCalledWith("investors");
  });
});
