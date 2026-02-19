// app/(main)/home/detail/[id].tsx
import { View, Text, ScrollView, Image, StyleSheet, Button, Alert } from "react-native";
import { useContext } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { MealsContext } from "../_layout";

export default function MealDetailPage() {
  type Food = {
    code: string;
    product_name?: string;
    product_name_fr?: string;
    brands?: string;
    calories?: number;
    image_url?: string; // ✅ ajouté
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
  if (!mealParam) throw new Error("Aucun repas fourni !");
  const meal: Meal = JSON.parse(mealParam as string);

  const mealsCtx = useContext(MealsContext);
  if (!mealsCtx) throw new Error("MealsContext introuvable !");
  const { meals, setMeals } = mealsCtx;

  // Calculs totaux
  const totalCalories = meal.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const totalProteins = meal.foods.reduce((sum, f) => sum + (f.nutriments?.proteins_100g || 0), 0);
  const totalCarbs = meal.foods.reduce((sum, f) => sum + (f.nutriments?.carbohydrates_100g || 0), 0);
  const totalFats = meal.foods.reduce((sum, f) => sum + (f.nutriments?.fat_100g || 0), 0);

  // Supprimer le repas
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
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.title}>{meal.type}</Text>
      <Text style={styles.date}>{new Date(meal.date).toLocaleString()}</Text>

      <View style={styles.nutriSummary}>
        <Text style={styles.nutriText}>Calories: {totalCalories} kcal</Text>
        <Text style={styles.nutriText}>Protéines: {totalProteins.toFixed(1)} g</Text>
        <Text style={styles.nutriText}>Glucides: {totalCarbs.toFixed(1)} g</Text>
        <Text style={styles.nutriText}>Lipides: {totalFats.toFixed(1)} g</Text>
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

      <Button title="Supprimer le repas" color="#ff3b30" onPress={handleDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", color: "#007bff", marginBottom: 4 },
  date: { fontSize: 14, color: "#555", marginBottom: 12 },
  nutriSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  nutriText: { fontSize: 14, fontWeight: "bold", color: "#333" },
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
});
