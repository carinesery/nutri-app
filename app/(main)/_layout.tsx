import { Tabs } from "expo-router";
import { createContext, useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const MealsContext = createContext<{
  meals: any[];
  setMeals: React.Dispatch<React.SetStateAction<any[]>>;
} | null>(null);


export default function MainLayout() {
  const [meals, setMeals] = useState<any[]>([]);

  return (
    <MealsContext.Provider value={{ meals, setMeals }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 5,
            height: 80,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === '(home)') {
              iconName = 'restaurant-outline';
            } else if (route.name === 'add') {
              iconName = 'add-circle-outline';
            } else if (route.name === 'profile') {
              iconName = 'person-outline';
            } else {
              iconName = 'ellipse-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
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
