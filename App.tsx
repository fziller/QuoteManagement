import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { useTheme } from "react-native-paper";
import { DevToolsBubble } from "react-native-react-query-devtools";
import Toast from "react-native-toast-message";
import useProducts from "./hooks/useProducts";
import { queryClient } from "./networking/provider";
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
    // Get all products beforehand to have them cached in offline case.
    void prefetchProducts();
    // Makes sure to trigger paused mutations if we come back online
    return NetInfo.addEventListener((state) => {
      const status = !!state.isConnected;
      onlineManager.setOnline(status);
      if (!status) {
        Toast.show({
          type: "error",
          text1: "You are offline",
          text2: "Please check your internet connection",
          visibilityTime: 2000,
        });
      }
    });
  }, []);

  return (
    <PersistQueryClientProvider
      persistOptions={{ persister }}
      client={queryClient}
      onSuccess={() => {
        // As per https://github.com/TanStack/query/discussions/7044, this should resume persisted mutations even after app kill.
        // It does not seem to work and requires some further digging.
        const mutations = queryClient
          .getMutationCache()
          .getAll()
          .filter(
            (m) =>
              !m.state.isPaused &&
              (m.state.status === "idle" || m.state.status === "pending")
          );
        for (const mutation of mutations) {
          void mutation.continue();
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
      <DevToolsBubble />
    </PersistQueryClientProvider>
  );
}
