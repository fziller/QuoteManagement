import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import PageButtons from "../PageButtons";

describe("PageButtons", () => {
  it("should render the correct number of buttons", () => {
    const { getAllByText } = render(
      <PageButtons pages={5} currentPage={1} onPageSelect={jest.fn()} />
    );

    const buttons = getAllByText(/[1-5]/);
    expect(buttons).toHaveLength(5);
  });

  it("should call onPageSelect with the correct page when a button is pressed", () => {
    const mockOnPageSelect = jest.fn();
    const { getByText } = render(
      <PageButtons pages={5} currentPage={1} onPageSelect={mockOnPageSelect} />
    );

    const button = getByText("3");
    fireEvent.press(button);
    expect(mockOnPageSelect).toHaveBeenCalledWith(3);
  });
});
