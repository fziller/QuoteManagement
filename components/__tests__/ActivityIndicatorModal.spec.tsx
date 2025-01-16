// Unit Test for ActivityIndicatorModal
import { render } from "@testing-library/react-native";
import React from "react";
import ActivityIndicatorModal from "../ActivityIndicatorModal";

describe("ActivityIndicatorModal", () => {
  it("should render the modal when isLoading is true", () => {
    const { getByRole } = render(<ActivityIndicatorModal isLoading={true} />);
    const modal = getByRole("progressbar");
    expect(modal).toBeTruthy();
  });

  it("should not render the modal when isLoading is false", () => {
    const { queryByRole } = render(
      <ActivityIndicatorModal isLoading={false} />
    );
    const modal = queryByRole("progressbar");
    expect(modal).toBeNull();
  });
});
