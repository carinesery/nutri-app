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

      {/* UTILISATEUR NON CONNECTÉ */}
      <SignedOut>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>
            Connectez-vous pour accéder à vos repas
          </Text>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Créer un compte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SignedOut>

      {/* UTILISATEUR CONNECTÉ */}
      <SignedIn>

        <Text style={styles.title}>Liste de mes repas</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {meals.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.noMeal}>
                Aucun repas enregistré pour l'instant 🍽
              </Text>
            </View>
          )}

          {meals.map((meal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.mealCard}
              onPress={() =>
                router.push({
                  pathname: '/[id]',
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
                  {food.image_url && (
                    <Image source={{ uri: food.image_url }} style={styles.foodImage} />
                  )}
                  <Text style={styles.foodName}>
                    {food.product_name_fr || food.product_name}
                  </Text>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f9',
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },

  /* AUTH CARD */

  authCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  authTitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },

  primaryButton: {
    backgroundColor: 'green',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: 'green',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: 'lightgreen',
    fontWeight: 'bold',
    fontSize: 16,
  },

  /* USER CARD */

  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  userGreeting: {
    fontSize: 14,
    color: '#777',
  },

  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'black',
  },

  emptyState: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },

  noMeal: {
    fontStyle: 'italic',
    color: '#777',
  },

  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  mealHeader: {
    marginBottom: 10,
  },

  mealType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },

  mealInfo: {
    fontSize: 12,
    color: '#666',
  },

  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  foodImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },

  foodName: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },

  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
  },
});
