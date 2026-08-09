import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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
    expect(screen.getByRole("img", { name: "Primary Rental with an Accessory Dwelling Unit" })).toHaveAttribute(
      "src",
      "/img/properties/adu_cottage.jpg",
    );
    expect(screen.getByText("The upside")).toBeVisible();
    expect(screen.getByText("The tradeoffs")).toBeVisible();
    expect(screen.getByText(/Confirm permits, certificate of occupancy/)).toBeVisible();

    await user.keyboard("{ArrowRight}");
    const studentTab = screen.getByRole("tab", { name: "Student & Co-Living" });
    expect(studentTab).toHaveFocus();
    expect(studentTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "Student Housing & Co-Living Rentals",
    );
  });
});
