import { Stack, Slot } from "expo-router";
import { useState, createContext } from "react";

// Création d'un context pour la session "add"
export const AddContext = createContext<{
  selectedFoods: any[];
  setSelectedFoods: React.Dispatch<React.SetStateAction<any[]>>;
} | null>(null);

export default function AddLayout() {
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);

  return (
    <AddContext.Provider value={{ selectedFoods, setSelectedFoods }}>
      <Stack screenOptions={{
        headerShown: true, 
        headerStyle: {
          backgroundColor: '#2ecc71',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        <Stack.Screen name="index" options={{ title: "Nouveau repas" }} />
        <Stack.Screen name="camera" options={{ title: "Scan / photo" }} />
      </Stack>
    </AddContext.Provider>
  );
}
