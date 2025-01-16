import useProducts from "@/hooks/useProducts";
import { getProducts } from "@/networking/products";
import { queryClient } from "@/networking/provider";
import { renderHook } from "@testing-library/react";
jest.mock("@/networking/products", () => ({
  getProducts: jest.fn(),
}));

jest.mock("@/networking/provider", () => ({
  queryClient: {
    prefetchInfiniteQuery: jest.fn(),
  },
}));

describe("useProducts Hook", () => {
  beforeEach(() => {
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

    expect(queryClient.prefetchInfiniteQuery).toHaveBeenCalledTimes(1);
    expect(queryClient.prefetchInfiniteQuery).toHaveBeenCalledWith({
      queryKey: ["products"],
      queryFn: expect.any(Function),
      initialPageParam: 1,
      getNextPageParam: expect.any(Function),
      pages: 10,
      staleTime: 1000 * 60 * 60 * 24,
    });
  });
});
