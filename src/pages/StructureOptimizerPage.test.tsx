import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StructureOptimizerPage from "./StructureOptimizerPage";

describe("StructureOptimizerPage", () => {
  it("discloses the distinct cash-on-cash and fixed-rate IRR assumptions", () => {
    render(<StructureOptimizerPage onNavigate={() => {}} />);

    const disclosure = screen.getByLabelText(
      /illustrative comparison assumptions/i,
    );

    expect(disclosure).toHaveTextContent(
      /cash-on-cash uses Track 2's expense model: 7% vacancy, 8% management, 8% maintenance, and 5% CapEx/i,
    );
    expect(disclosure).toHaveTextContent(
      /fixed-rate after-tax IRR uses a separate five-year schedule: 2% annual rent growth; 8% vacancy; 8% management; 5% maintenance; 2% turnover; 5%-of-EGI CapEx reserve; 0% fixed-expense growth; and 6% selling costs/i,
    );
    expect(disclosure).toHaveTextContent(
      /32% federal and 5% state tax rates; MFJ filing; \$250,000 MAGI; 20% land allocation; no cost segregation; no 1031 exchange/i,
    );
  });
});
