import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import CreateQuotes from "./screens/CreateQuotes";
import ListQuotes from "./screens/ListQuotes";

export default function App() {
  const queryClient = new QueryClient();
  const Tab = createBottomTabNavigator();

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
          <Tab.Screen name="ListQuotes" component={ListQuotes} />
          <Tab.Screen name="CreateQuotes" component={CreateQuotes} />
        </Tab.Navigator>
      </NavigationContainer>
    </PersistQueryClientProvider>
  );
}
