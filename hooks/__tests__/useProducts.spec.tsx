import useProducts from "@/hooks/useProducts";
import { getProducts } from "@/networking/products";
import { useQueryClient } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
jest.mock("@/networking/products", () => ({
  getProducts: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(() => ({
    prefetchInfiniteQuery: jest.fn(),
  })),
}));

describe("useProducts Hook", () => {
  let queryClientMock: any;

  beforeEach(() => {
    queryClientMock = {
      prefetchInfiniteQuery: jest.fn(),
    };
    (useQueryClient as jest.Mock).mockReturnValue(queryClientMock);
    jest.clearAllMocks();
  });

  it("should prefetch products correctly", async () => {
    const { result } = renderHook(() => useProducts());
    const { prefetchProducts } = result.current;

    (getProducts as jest.Mock).mockResolvedValueOnce({
      page: 1,
      totalPages: 5,
    });

    await prefetchProducts();

    expect(queryClientMock.prefetchInfiniteQuery).toHaveBeenCalledTimes(1);
    expect(queryClientMock.prefetchInfiniteQuery).toHaveBeenCalledWith({
      queryKey: ["products"],
      queryFn: expect.any(Function),
      initialPageParam: 1,
      getNextPageParam: expect.any(Function),
      pages: 10,
      staleTime: 1000 * 60 * 60 * 24,
    });
  });
});
