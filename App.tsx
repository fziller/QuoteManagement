import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import Constants from "expo-constants";
import { useEffect } from "react";
import CreateQuotes from "./screens/CreateQuotes";
import ListQuotes from "./screens/ListQuotes";

export default function App() {
  const queryClient = new QueryClient();
  const Tab = createBottomTabNavigator();
  const hostname = Constants.expoConfig?.extra?.HOSTNAME;

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    throttleTime: 3000,
  });

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const status = !!state.isConnected;
      onlineManager.setOnline(status);
    });
  }, []);

  useEffect(() => {
    const prefetchProducts = async () => {
      await queryClient.prefetchInfiniteQuery({
        queryKey: ["products"],
        queryFn: async ({ pageParam }) => {
          const products = await fetch(
            `${hostname}/api/collections/products/records?page=${pageParam}&perPage=30`
          ).then((res) => res.json());
          console.log("Products: ", products);
          return products;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
          if (lastPage.page === lastPage.totalPages) return undefined;
          return lastPage.page + 1;
        },
        pages: 10,
        staleTime: 1000 * 60 * 60, // 1 hour
      });
    };

    void prefetchProducts();
  }, []);

  return (
    <PersistQueryClientProvider
      persistOptions={{ persister }}
      client={queryClient}
      onSuccess={() =>
        queryClient
          .resumePausedMutations()
          .then(() => queryClient.invalidateQueries())
      }
    >
      <NavigationContainer>
        <Tab.Navigator initialRouteName="ListQuotes">
          <Tab.Screen
            name="ListQuotes"
            component={ListQuotes}
            options={{ title: "List of quotes", headerTitleAlign: "center" }}
          />
          <Tab.Screen
            name="CreateQuotes"
            component={CreateQuotes}
            options={{
              title: "Create a new quote",
              headerTitleAlign: "center",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PersistQueryClientProvider>
  );
}
