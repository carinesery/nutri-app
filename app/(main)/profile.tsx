import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SignedOut, SignedIn, useUser } from "@clerk/clerk-expo";
import { SignOutButton } from "../components/sign-out-button";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user } = useUser();

  // Redirection si non connecté
  if (!user) {
    router.replace("/(main)/home");
    return null;
  }

  return (
    <View style={styles.container}>
      <SignedOut>
        <Text style={styles.notConnected}>Vous n'êtes pas connecté</Text>
      </SignedOut>

      <SignedIn>
       
        <View style={styles.card}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={40} color="#2ecc71" />
          </View>

          <Text style={styles.email}>{user?.emailAddresses[0].emailAddress}</Text>
        </View>
       
        <SignOutButton />
      </SignedIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30, // espace entre la box et le bouton
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#a8e6cf",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  signOutText: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 16,
  },
  notConnected: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
});
