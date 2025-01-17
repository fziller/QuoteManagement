import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";
import useProducts from "./hooks/useProducts";
import { queryClient } from "./networking/provider";
import { postQuote } from "./networking/quotes";
import CreateQuotes from "./screens/CreateQuotes";
import ListQuotes from "./screens/ListQuotes";

export default function App() {
  const Tab = createBottomTabNavigator();

  const { prefetchProducts } = useProducts();
  const theme = useTheme();

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    throttleTime: 3000,
  });

  useEffect(() => {
    // Makes sure to trigger paused mutations if we come back online
    return NetInfo.addEventListener((state) => {
      const status = !!state.isConnected;
      onlineManager.setOnline(status);
      if (!state.isConnected) {
        Toast.show({
          type: "error",
          text1: "You are offline",
          text2: "Please check your internet connection",
          visibilityTime: 2000,
        });
      }
      // Make sure to fetch latest product information if we come back online.
      if (state.isConnected === true && state.isInternetReachable === true) {
        void prefetchProducts();
      }
    });
  }, []);

  return (
    <PersistQueryClientProvider
      persistOptions={{ persister }}
      client={queryClient}
      onSuccess={() => {
        const filteredMutations = queryClient
          .getMutationCache()
          .getAll()
          .filter((m) => m.options?.mutationKey?.[0] === "quotes");

        for (const mutation of filteredMutations) {
          // Actually, react-query supports continuing paused mutations by calling mutation.continue(), but this seems to not work here.
          // We do the workaround of manually posting created quotes here.
          postQuote(mutation.state?.variables?.quote);
        }

        queryClient
          .resumePausedMutations()
          .then(() => queryClient.invalidateQueries({ queryKey: ["quotes"] }));
      }}
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
            options={{
              title: "List of quotes",
              headerTitleAlign: "center",
              headerTintColor: "white",
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
            }}
          />
          <Tab.Screen
            name="CreateQuotes"
            component={CreateQuotes}
            options={{
              title: "Create new quote",
              headerTitleAlign: "center",
              headerTintColor: "white",

              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
      <StatusBar backgroundColor={theme.colors.primary} />
    </PersistQueryClientProvider>
  );
}
