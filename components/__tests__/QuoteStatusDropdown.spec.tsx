// QuoteStatusDropdown.test.tsx
import { render } from "@testing-library/react-native";
import React from "react";
import QuoteStatusDropdown from "../QuoteStatusDropdown";

describe("QuoteStatusDropdown", () => {
  it("renders the dropdown with the correct options", () => {
    const onSelect = jest.fn();
    const utils = render(<QuoteStatusDropdown onSelect={onSelect} />);

    utils.getByText("Filter by status");
  });
});
