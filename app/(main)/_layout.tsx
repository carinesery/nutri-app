import { Tabs } from "expo-router";
import { createContext, useState } from "react";

export const MealsContext = createContext<{
  meals: any[];
  setMeals: React.Dispatch<React.SetStateAction<any[]>>;
} | null>(null);


export default function MainLayout() {
  const [meals, setMeals] = useState<any[]>([]);
  return (
    <MealsContext.Provider value={{ meals, setMeals }}>
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
    </MealsContext.Provider>
  );
}
