import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import { useTheme } from "react-native-paper";
import useProducts from "./hooks/useProducts";
import CreateQuotes from "./screens/CreateQuotes";
import ListQuotes from "./screens/ListQuotes";

export default function App() {
  const queryClient = new QueryClient();
  const Tab = createBottomTabNavigator();

  const { prefetchProducts } = useProducts();
  const theme = useTheme();

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    throttleTime: 3000,
  });

  useEffect(() => {
    // Get all products beforehand to have them cached in offline case.
    void prefetchProducts();
    // Makes sure to trigger paused mutations if we come back online
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
          .then(() => queryClient.invalidateQueries({ queryKey: ["quotes"] }))
      }
    >
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="ListQuotes"
          screenOptions={({ route }) => ({
            tabBarActiveBackgroundColor: theme.colors.primary,
            tabBarActiveTintColor: "white",
            tabBarIcon: (props) => {
              if (route.name === "ListQuotes") {
                return (
                  <MaterialIcons
                    name="task"
                    size={24}
                    color={props.focused ? "white" : "black"}
                  />
                );
              }
              if (route.name === "CreateQuotes") {
                return (
                  <MaterialIcons
                    name="person-add-alt-1"
                    size={24}
                    color={props.focused ? "white" : "black"}
                  />
                );
              }
            },
          })}
        >
          <Tab.Screen
            name="ListQuotes"
            component={ListQuotes}
            options={{ title: "List of quotes", headerTitleAlign: "center" }}
          />
          <Tab.Screen
            name="CreateQuotes"
            component={CreateQuotes}
            options={{
              title: "Create new quote",
              headerTitleAlign: "center",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PersistQueryClientProvider>
  );
}
