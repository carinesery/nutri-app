import { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

import { AddContext } from "./_layout";
import { MealsContext } from "../_layout";

const MEAL_TYPES = ["Petit déjeuner", "Déjeuner", "Dîner", "Snack"];

export default function CreateMealScreen() {
  const [mealType, setMealType] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { scannedFood } = useLocalSearchParams();

  const ctx = useContext(AddContext);
  if (!ctx) return null;

  const { selectedFoods, setSelectedFoods } = ctx;

  const mealsCtx = useContext(MealsContext);
  if (!mealsCtx) return null;

  const { setMeals } = mealsCtx;

  /* ------------------- API SEARCH ------------------- */

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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchFoods(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  /* ------------------- SCANNER ------------------- */

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

  /* ------------------- SELECTION ------------------- */

  const toggleFood = (food: any) => {
    const exists = selectedFoods.find((f) => f.code === food.code);
    if (exists) {
      setSelectedFoods(selectedFoods.filter((f) => f.code !== food.code));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const removeFood = (code: string) => {
    setSelectedFoods((prev) => prev.filter((f) => f.code !== code));
  };

  /* ------------------- VALIDATION ------------------- */

  const validateMeal = () => {
    if (!mealType) {
      alert("Veuillez choisir le type de repas !");
      return;
    }

    const newMeal = {
      type: mealType,
      foods: selectedFoods.map((f) => ({
        ...f,
        calories: f.nutriments?.["energy-kcal_100g"] ?? 0,
      })),
      date: new Date().toISOString(),
    };

    setMeals((prev) => [...prev, newMeal]);

    setSelectedFoods([]);
    setQuery("");
    router.replace("/(main)/(home)");
  };

  /* ------------------- UI ------------------- */

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type de repas</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        value={query}
        onChangeText={setQuery}
      />

      {loading && (
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginVertical: 10 }} />
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => {
          const selected = !!selectedFoods.find((f) => f.code === item.code);

          return (
            <TouchableOpacity
              style={[styles.item, selected && styles.itemSelected]}
              onPress={() => toggleFood(item)}
            >
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.image} />
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {item.product_name_fr ||
                    item.product_name ||
                    "Nom inconnu"}
                </Text>

                <Text style={styles.sub}>{item.brands}</Text>

                {item.nutriscore_grade && (
                  <Text style={styles.sub}>
                    Nutri-Score: {item.nutriscore_grade.toUpperCase()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {selectedFoods.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.label}>Aliments sélectionnés</Text>

          {selectedFoods.map((f) => (
            <View key={f.code} style={styles.selectedCard}>
              {f.image_url && (
                <Image source={{ uri: f.image_url }} style={styles.selectedImage} />
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.selectedTitle}>
                  {f.product_name_fr || f.product_name}
                </Text>

                {f.brands && (
                  <Text style={styles.selectedSub}>{f.brands}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => removeFood(f.code)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.bottomButton} onPress={validateMeal}>
          <Text style={styles.bottomButtonText}>Valider le repas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/(main)/add/camera")}
        >
          <Text style={styles.bottomButtonText}>Scanner un code-barres</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------- STYLES ------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f9",
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },

  mealTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  mealTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2ecc71",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  mealTypeButtonSelected: {
    backgroundColor: "#2ecc71",
  },

  mealTypeText: {
    color: "#2ecc71",
    fontWeight: "600",
  },

  mealTypeTextSelected: {
    color: "#fff",
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  item: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  itemSelected: {
    borderWidth: 2,
    borderColor: "#2ecc71",
  },

  image: {
    width: 55,
    height: 55,
    marginRight: 12,
    borderRadius: 10,
  },

  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },

  sub: {
    fontSize: 13,
    color: "#666",
  },

  selectedContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
  },

  selectedItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  selectedItemText: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "600",
    flex: 1,
  },

  removeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffe6e6",
    justifyContent: "center",
    alignItems: "center",
  },

  removeButtonText: {
    color: "#e74c3c",
    fontWeight: "bold",
  },

  primaryButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2ecc71",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  secondaryButtonText: {
    color: "#2ecc71",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fffb',
    borderWidth: 1,
    borderColor: '#d4f5e1',
  },

  selectedImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
  },

  selectedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },

  selectedSub: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  bottomButton: {
    flex: 1,
    backgroundColor: '#2ecc71', // vert
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },

  bottomButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

});
