import { getProducts } from "@/networking/products";
import { useQueryClient } from "@tanstack/react-query";

const useProducts = () => {
  const prefetchProducts = async () => {
    const queryClient = useQueryClient();
    await queryClient.prefetchInfiniteQuery({
      queryKey: ["products"],
      queryFn: async ({ pageParam }) => await getProducts(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.page === lastPage.totalPages) return undefined; // If last page is reached, stop.
        return lastPage.page + 1;
      },
      pages: 10,
      staleTime: 1000 * 60 * 60 * 24, // 24 hour - might need to be extended or shortened.
    });
  };

  return { prefetchProducts };
};

export default useProducts;
