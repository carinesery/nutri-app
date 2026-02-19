// Liste des repas enregistrés
import { SignOutButton } from '../../components/sign-out-button';
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MealsContext } from '../_layout';
import { useContext } from 'react';

export default function Page() {
  type Food = {
    code: string;
    product_name?: string;
    product_name_fr?: string;
    image_url?: string;
    nutriments?: {
      energy_kcal_100g?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };

  type Meal = {
    type: string;
    foods: Food[];
    date: string;
  };

  const { user } = useUser();
  const { session } = useSession();
  console.log(session?.currentTask);

  const mealsCtx = useContext(MealsContext);
  if (!mealsCtx) throw new Error("MealsContext introuvable !");
  const { meals } = mealsCtx as { meals: Meal[]; setMeals: React.Dispatch<React.SetStateAction<Meal[]>> };

  // Calcul des calories totales
  const getTotalCalories = (meal: Meal) =>
    meal.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bienvenue ! Retrouvez ici la liste de vos repas.</Text>

      <SignedOut>
        <Link href="/(auth)/login">
          <Text style={styles.link}>Se connecter</Text>
        </Link>
        <Link href="/(auth)/signup">
          <Text style={styles.link}>S'inscrire</Text>
        </Link>
      </SignedOut>

      <SignedIn>
        <View style={styles.userHeader}>
          <Text style={styles.userEmail}>Hello {user?.emailAddresses[0].emailAddress}</Text>
          <SignOutButton />
        </View>

        <Text style={styles.title}>Mes repas :</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {meals.length === 0 && <Text style={styles.noMeal}>Aucun repas enregistré pour l'instant.</Text>}

          {meals.map((meal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.mealCard}
              onPress={() =>
                router.push({
                  pathname: '/(main)/home/detail',
                  params: { meal: JSON.stringify(meal) },
                })
              }
            >
              <View style={styles.mealHeader}>
                <Text style={styles.mealType}>{meal.type}</Text>
                <Text style={styles.mealInfo}>
                  {new Date(meal.date).toLocaleDateString()} • {getTotalCalories(meal)} kcal
                </Text>
              </View>

              {meal.foods.map((food: Food) => (
                <View key={food.code} style={styles.foodItem}>
                  {food.image_url && <Image source={{ uri: food.image_url }} style={styles.foodImage} />}
                  <Text style={styles.foodName}>{food.product_name_fr || food.product_name}</Text>
                </View>
              ))}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(main)/add')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </SignedIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  link: { fontSize: 16, color: '#007bff', marginBottom: 8 },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userEmail: { fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#007bff', marginBottom: 12 },
  noMeal: { fontStyle: 'italic', color: '#777', textAlign: 'center', marginTop: 8 },

  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mealType: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  mealInfo: { fontSize: 12, color: '#555' },

  foodItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  foodImage: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  foodName: { fontSize: 14, color: '#333', flexShrink: 1 },

  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: { color: '#fff', fontSize: 32, lineHeight: 32 },
});
