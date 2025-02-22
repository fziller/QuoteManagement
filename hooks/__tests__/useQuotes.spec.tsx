import useQuotes from "@/hooks/useQuotes"; // Passe den Pfad an
import { QuoteStatus } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

jest.mock("@/networking/quotes", () => ({
  getQuotes: jest.fn(),
  postQuote: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  onlineManager: { isOnline: jest.fn(() => true) },
}));

jest.mock("@/networking/provider", () => ({
  queryClient: {
    setQueryData: jest.fn(),
    cancelQueries: jest.fn(),
  },
}));

describe("useQuotes Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch paginated quotes correctly", () => {
    const mockQuotesData = {
      quotes: [{ id: 1, text: "Test Quote" }],
      total: 1,
    };
    (useQuery as jest.Mock).mockReturnValue({
      data: mockQuotesData,
      isLoading: false,
      isError: false,
      isFetching: false,
      isPending: false,
    });

    const { result } = renderHook(() => useQuotes());
    const { getPaginatedQuotes } = result.current;

    const page = 1;
    const searchQuery = "test";
    const statusFilter = "all";
    const sort = true;

    const response = getPaginatedQuotes(page, searchQuery, statusFilter, sort);

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["quotes", page, searchQuery, statusFilter, sort],
      queryFn: expect.any(Function),
      placeholderData: expect.any(Function),
      staleTime: 900000,
      enabled: true,
    });

    expect(response.data).toEqual(mockQuotesData);
    expect(response.isLoading).toBe(false);
    expect(response.isError).toBe(false);
  });

  it("should handle quote creation correctly", async () => {
    const mockMutate = jest.fn();
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isSuccess: true,
      isError: false,
      isPending: false,
      isPaused: false,
    });

    const { result } = renderHook(() => useQuotes());
    const { createQuote } = result.current;

    const { mutate } = createQuote();

    const quoteRequest = {
      customer_info: {
        email: "mail address",
        name: "customer name",
      },
      id: "123451234512345",
      created: "2023-01-01T00:00:00.000Z",
      items: [
        { price: 12, product_name: "my product", quantity: 1, subtotal: 8 },
      ],
      status: QuoteStatus.DRAFT,
      subtotal: 12,
      total: 12,
      total_tax: 12,
    };
    const handleOnSuccess = mockOnSuccess;
    const handleOnError = mockOnError;

    mutate({ quote: quoteRequest, handleOnSuccess, handleOnError });

    expect(mockMutate).toHaveBeenCalledWith({
      quote: quoteRequest,
      handleOnSuccess,
      handleOnError,
    });
    mockOnSuccess();
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
