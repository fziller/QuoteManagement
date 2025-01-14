import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "List of quotes", headerTitleAlign: "center" }}
      />
      <Tabs.Screen
        name="createQuotes"
        options={{ title: "Create new quote", headerTitleAlign: "center" }}
      />
    </Tabs>
  );
}
