import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "List of quotes" }} />
      <Tabs.Screen name="createQuotes" options={{ title: "Create quotes" }} />
    </Tabs>
  );
}
