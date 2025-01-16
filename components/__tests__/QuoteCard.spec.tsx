import { QuoteStatus } from "@/types";
import { render } from "@testing-library/react-native";
import React from "react";
import QuoteCard from "../QuoteCard";

describe("QuoteCard", () => {
  const mockQuote = {
    id: "123451234512345",
    customer_info: { name: "John Doe", email: "john.doe@example.com" },
    status: QuoteStatus.DRAFT,
    valid_until: "2025-12-31T23:59:59Z",
    items: [
      { product_name: "Item 1", price: 10 },
      { product_name: "Item 2", price: 20 },
    ],
    total: 30,
    description: "bla bla",
    created: "yesterday",
    updated: "today",
    subtotal: 12,
    total_tax: 8,
  };

  it("should render customer info, status, and total correctly", () => {
    const { getByText } = render(<QuoteCard {...mockQuote} />);

    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("john.doe@example.com")).toBeTruthy();
    expect(getByText("DRAFT")).toBeTruthy();
    expect(getByText("30€")).toBeTruthy();
  });

  it("should render all items with correct prices", () => {
    const { getByText } = render(<QuoteCard {...mockQuote} />);

    expect(getByText("Item 1")).toBeTruthy();
    expect(getByText("10€")).toBeTruthy();
    expect(getByText("Item 2")).toBeTruthy();
    expect(getByText("20€")).toBeTruthy();
  });
});
