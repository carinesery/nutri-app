import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export const SignOutButton =  () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(main)/home");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <MaterialIcons
        name="logout"
        size={20}
        color="#e74c3c"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.text}>Se déconnecter</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 33,
    backgroundColor: "#fff",
    justifyContent: "center",
    marginTop: 20,
  },
  text: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 16,
  },
});
