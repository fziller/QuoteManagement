import { getProducts } from "@/networking/products";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

const useProducts = () => {
  const prefetchProducts = async () => {
    const queryClient = useQueryClient();
    const result = await queryClient.prefetchInfiniteQuery({
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
    Toast.show({
      type: "success",
      text1: "Products are cached for offline mode. 🎉",
    });
  };

  return { prefetchProducts };
};

export default useProducts;
