import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useContext, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { MealsContext } from "../_layout";

export default function MealDetailPage() {
  type Food = {
    code: string;
    product_name?: string;
    product_name_fr?: string;
    brands?: string;
    calories?: number;
    image_url?: string;
    nutriments?: {
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      [key: string]: any;
    };
  };

  type Meal = {
    type: string;
    foods: Food[];
    date: string;
  };

  const { meal: mealParam } = useLocalSearchParams();

  useEffect(() => {
    if (!mealParam) {
      router.replace("/(main)/(home)");
    }
  }, [mealParam]);

  if (!mealParam) return null;

  const meal: Meal = JSON.parse(mealParam as string);
  const mealsCtx = useContext(MealsContext);
  if (!mealsCtx) throw new Error("MealsContext introuvable !");
  const { meals, setMeals } = mealsCtx;

  // Calculs totaux
  const totalCalories = meal.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const totalProteins = meal.foods.reduce((sum, f) => sum + (f.nutriments?.proteins_100g || 0), 0);
  const totalCarbs = meal.foods.reduce((sum, f) => sum + (f.nutriments?.carbohydrates_100g || 0), 0);
  const totalFats = meal.foods.reduce((sum, f) => sum + (f.nutriments?.fat_100g || 0), 0);

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le repas",
      "Voulez-vous vraiment supprimer ce repas ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setMeals(meals.filter(m => m.date !== meal.date));
            router.replace("/(main)/(home)");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.title}>{meal.type}</Text>
      <Text style={styles.date}>{new Date(meal.date).toLocaleString()}</Text>

      <View style={styles.nutriRow}>
        <View style={[styles.circle, { borderColor: "#2ecc71" }]}>
          <Text style={styles.circleValue}>{totalCalories}</Text>
          <Text style={styles.circleLabel}>kcal</Text>
        </View>
        <View style={[styles.circle, { borderColor: "#3498db" }]}>
          <Text style={styles.circleValue}>{totalProteins.toFixed(1)}g</Text>
          <Text style={styles.circleLabel}>prot.</Text>
        </View>
        <View style={[styles.circle, { borderColor: "#f1c40f" }]}>
          <Text style={styles.circleValue}>{totalCarbs.toFixed(1)}g</Text>
          <Text style={styles.circleLabel}>glu.</Text>
        </View>
        <View style={[styles.circle, { borderColor: "#e74c3c" }]}>
          <Text style={styles.circleValue}>{totalFats.toFixed(1)}g</Text>
          <Text style={styles.circleLabel}>lip.</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Aliments :</Text>
      {meal.foods.map(food => (
        <View key={food.code} style={styles.foodCard}>
          {food.image_url && <Image source={{ uri: food.image_url }} style={styles.foodImage} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.foodName}>{food.product_name_fr || food.product_name}</Text>
            {food.brands && <Text style={styles.foodBrand}>{food.brands}</Text>}
            <Text style={styles.foodNutri}>
              {food.calories || 0} kcal • P: {food.nutriments?.proteins_100g || 0} g •
              C: {food.nutriments?.carbohydrates_100g || 0} g •
              L: {food.nutriments?.fat_100g || 0} g
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Supprimer le repas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", color: "#007bff", marginBottom: 4 },
  date: { fontSize: 14, color: "#555", marginBottom: 12 },

  // Nutri summary row
  nutriRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  circleValue: { fontWeight: "bold", fontSize: 16 },
  circleLabel: { fontSize: 12, color: "#555" },

  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#007bff" },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  foodImage: { width: 50, height: 50, borderRadius: 6, marginRight: 10 },
  foodName: { fontSize: 16, fontWeight: "bold" },
  foodBrand: { fontSize: 12, color: "#555", marginBottom: 2 },
  foodNutri: { fontSize: 12, color: "#333" },

  deleteButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
