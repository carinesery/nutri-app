import { Tabs } from "expo-router";

export default function MainLayout() {
  return (
    <Tabs>
//     <Tabs.Screen
      name="(home)"
      options={{ title: "Mes repas", headerShown: false }}
    />
   <Tabs.Screen
      name="add"
      options={{ title: "Ajouter", headerShown: false }}
      
    />
    <Tabs.Screen
      name="profile"
      options={{ title: "Profil" }}
    />
    </Tabs>
  );
}
