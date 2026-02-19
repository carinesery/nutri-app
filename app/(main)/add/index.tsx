import { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Button, StyleSheet, Image } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

import { AddContext } from "./_layout";
import { MealsContext } from "../_layout";

const MEAL_TYPES = ["Petit déjeuner", "Déjeuner", "Dîner", "Snack"];

export default function CreateMealScreen() {
  // Type de repas choisi
  const [mealType, setMealType] = useState<string | null>(null);

  // Recherche
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { scannedFood } = useLocalSearchParams();
  const ctx = useContext(AddContext);
  if (!ctx) throw new Error("AddContext not found");

  const { selectedFoods, setSelectedFoods } = ctx;

  // Requête Open Food Facts
  const searchFoods = async (searchTerm: string) => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        searchTerm
      )}&search_simple=1&action=process&json=1&fields=code,product_name,product_name_fr,brands,nutriments,image_url,nutriscore_grade&page_size=10`;

      const response = await fetch(url);
      const data = await response.json();
      setResults(data.products || []);
    } catch (error) {
      console.error("Erreur API OpenFoodFacts:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const mealsCtx = useContext(MealsContext);
  if (!mealsCtx) throw new Error("MealsContext not found");

  const { setMeals } = mealsCtx;


  // Debounce de la recherche
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchFoods(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      if (!scannedFood) return;

      const food = JSON.parse(scannedFood as string);

      setSelectedFoods((prev) => {
        const exists = prev.find((f) => f.code === food.code);
        if (exists) return prev;
        return [...prev, food];
      });
    }, [scannedFood])
  );


  // Ajouter ou retirer un aliment de la sélection
  const toggleFood = (food: any) => {
    const exists = selectedFoods.find((f) => f.code === food.code);
    if (exists) {
      setSelectedFoods(selectedFoods.filter((f) => f.code !== food.code));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  // Valider le repas (exemple : log dans console)
  const validateMeal = () => {
    if (!mealType) {
      alert("Veuillez choisir le type de repas !");
      return;
    }

    const newMeal = {
      type: mealType,
      foods: selectedFoods.map(f => ({
        ...f,
        calories: f.nutriments?.["energy-kcal_100g"] ?? 0, // Champ normalisé
      })),
      date: new Date().toISOString(),
    };

    setMeals((prev) => [...prev, newMeal]);

    router.replace("/(main)/(home)");

    // Réinitialiser la sélection
    setSelectedFoods([]);
    setQuery("");
  };

  return (
    <View style={styles.container}>
      {/* Choix du type de repas */}
      <Text style={styles.label}>Type de repas :</Text>
      <View style={styles.mealTypeContainer}>
        {MEAL_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.mealTypeButton,
              mealType === type && styles.mealTypeButtonSelected,
            ]}
            onPress={() => setMealType(type)}
          >
            <Text
              style={[
                styles.mealTypeText,
                mealType === type && styles.mealTypeTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Barre de recherche */}
      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        value={query}
        onChangeText={setQuery}
      />
      {loading && <ActivityIndicator size="large" style={{ marginVertical: 10 }} />}

      {/* Résultats de la recherche */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => {
          const selected = !!selectedFoods.find((f) => f.code === item.code);
          return (
            <TouchableOpacity style={[styles.item, selected && styles.itemSelected]} onPress={() => toggleFood(item)}>
              {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.product_name_fr || item.product_name || item.product_name_en || "Nom inconnu"}</Text>
                <Text style={styles.sub}>{item.brands}</Text>
                {item.nutriscore_grade && <Text style={styles.sub}>Nutri-Score: {item.nutriscore_grade.toUpperCase()}</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Aliments déjà sélectionnés */}
      {selectedFoods.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.label}>Aliments sélectionnés :</Text>
          {selectedFoods.map((f) => (
            <Text key={f.code} style={styles.selectedItem}>
              {f.product_name_fr || f.product_name}
            </Text>
          ))}
        </View>
      )}

      {/* Boutons */}
      <View style={styles.buttonContainer}>
        <Button title="Valider le repas" onPress={validateMeal} />
        <Button title="Scanner un code-barres" onPress={() => router.push("/(main)/add/camera")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  mealTypeContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  mealTypeButton: { padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginRight: 8, marginBottom: 8 },
  mealTypeButtonSelected: { backgroundColor: "#007bff", borderColor: "#007bff" },
  mealTypeText: { color: "#000" },
  mealTypeTextSelected: { color: "#fff" },
  input: { height: 50, borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 12, borderRadius: 8, marginBottom: 16 },
  item: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee", alignItems: "center" },
  itemSelected: { backgroundColor: "#d0f0c0" },
  image: { width: 50, height: 50, marginRight: 10, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: "bold" },
  sub: { fontSize: 14, color: "#555" },
  selectedContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 8 },
  selectedItem: { fontSize: 14, marginBottom: 4 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
});
