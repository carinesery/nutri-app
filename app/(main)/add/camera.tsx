import { router } from "expo-router";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import {
  useCameraPermissions,
  CameraView,
  CameraType,
} from "expo-camera";
import { useEffect, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { useContext } from "react";
import { AddContext } from "./_layout";


export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [scanned, setScanned] = useState(false);
  const hasScanned = useRef(false);
  
  const ctx = useContext(AddContext);
  if (!ctx) throw new Error("AddContext not found");

  const { selectedFoods, setSelectedFoods } = ctx;

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    try {
      const response = await fetch(
        `https://fr.openfoodfacts.org/api/v2/product/${data}.json?fields=code,product_name,product_name_fr,product_name_en,brands,nutriments,image_url,nutriscore_grade`
      );

      const result = await response.json();

      if (result.status === 1 && result.product) {
        const product = result.product;

        setSelectedFoods((prev) => {
          const exists = prev.find((f) => f.code === product.code);
          if (exists) return prev;
          return [...prev, product];
        });
        router.back();
      } else {
        alert("Produit non trouvé");
        hasScanned.current = false;
      }
    } catch (error) {
      alert("Erreur lors du scan");
      hasScanned.current = false;
    }
  };


  if (!permission?.granted) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={hasScanned.current ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
      />

      <MaterialIcons
        name="flip-camera-ios"
        size={30}
        color="white"
        style={styles.flip}
        onPress={toggleCameraFacing}
      />

      <MaterialIcons
        name="close"
        size={30}
        color="white"
        style={styles.close}
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  flip: {
    position: "absolute",
    bottom: 50,
    right: 30,
  },
  close: {
    position: "absolute",
    top: 50,
    left: 20,
  },
});
