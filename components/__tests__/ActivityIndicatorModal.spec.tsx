// // ActivityIndicatorModal.test.tsx
// import { render } from "@testing-library/react-native";
// import React from "react";
// import ActivityIndicatorModal from "../ActivityIndicatorModal";

// describe("ActivityIndicatorModal", () => {
//   it("renders the modal with the activity indicator", () => {
//     const utils = render(<ActivityIndicatorModal isLoading={true} />);
//     utils.findByTestId("activity-indicator");
//   });

//   it("hides the modal when isLoading is false", () => {
//     const utils = render(<ActivityIndicatorModal isLoading={false} />);
//     expect(utils.queryByTestId("activity-indicator")).toBeNull();
//   });
// });
