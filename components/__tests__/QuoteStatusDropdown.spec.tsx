// QuoteStatusDropdown.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import QuoteStatusDropdown from "../QuoteStatusDropdown";

describe("QuoteStatusDropdown", () => {
  it("renders the dropdown with the correct options", () => {
    const onSelect = jest.fn();
    const { getByText } = render(<QuoteStatusDropdown onSelect={onSelect} />);
    expect(getByText("Filter by status")).toBeTruthy();
    fireEvent.press(getByText("Filter by status"));
    expect(getByText("DRAFT")).toBeTruthy();
    expect(getByText("PENDING")).toBeTruthy();
    expect(getByText("REJECTED")).toBeTruthy();
    expect(getByText("ACCEPTED")).toBeTruthy();
    expect(getByText("SENT")).toBeTruthy();
    expect(getByText("EXPIRED")).toBeTruthy();
  });

  it("calls the onSelect callback when an option is selected", () => {
    const onSelect = jest.fn();
    const { getByText } = render(<QuoteStatusDropdown onSelect={onSelect} />);
    fireEvent.press(getByText("PENDING"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("PENDING");
  });
});
