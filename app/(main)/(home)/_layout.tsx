import { Stack } from "expo-router";

export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: true }}>
    <Stack.Screen name="index"
      options={{ title: "Mes repas" }} />
       <Stack.Screen name="[id]"
      options={{ title: "Détail d'un repas" }} />
  </Stack>;
}