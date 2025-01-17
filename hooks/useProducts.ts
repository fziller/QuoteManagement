import { getProducts } from "@/networking/products";
import { queryClient } from "@/networking/provider";
import { Product, ProductResponse } from "@/types";
import Toast from "react-native-toast-message";

const useProducts = () => {
  const prefetchProducts = async () => {
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
    Toast.show({
      type: "success",
      text1: "Latest product data is cached for offline mode. 🎉",
    });
  };

  const getPrefetchedProducts = (): Product[] => {
    let products: ProductResponse = queryClient.getQueryData(["products"]) ?? {
      pageParams: [],
      pages: [],
    };

    // Get the proper format out of the cached data
    return products.pages
      .map((productResponse) => productResponse.items)
      .flat();
  };

  return { prefetchProducts, getPrefetchedProducts };
};

export default useProducts;
