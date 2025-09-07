import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Image } from "react-native";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

type Pet = {
  id: string;
  name: string;
  type: string;
  age?: string;
  breed?: string;
  imageUrl?: string;
};

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPet = async () => {
      try {
        const docRef = doc(db, "pets", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setPet({ id: snap.id, ...snap.data() } as Pet);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pet:", err);
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    Alert.alert(
      "Delete Pet",
      "Are you sure you want to delete this pet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "pets", id));
              Alert.alert("Success", "Pet deleted successfully!");
              router.replace("/(tabs)/dashboard");
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.center}>
        <Text>Pet not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pet.name}</Text>

      {pet.imageUrl ? (
        <Image
          source={{ uri: pet.imageUrl }}
          style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 20 }}
        />
      ) : null}

      <Text style={styles.detail}>Type: {pet.type}</Text>
      {pet.age ? <Text style={styles.detail}>Age: {pet.age}</Text> : null}
      {pet.breed ? <Text style={styles.detail}>Breed: {pet.breed}</Text> : null}

      <View style={styles.buttons}>
        <Button title="Back" onPress={() => router.back()} />
        <Button title="Edit Pet" onPress={() => router.push(`/(tabs)/pets/edit?id=${pet.id}`)} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Delete Pet" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  detail: { fontSize: 18, marginBottom: 10 },
  buttons: { marginTop: 20, flexDirection: "row", justifyContent: "space-between" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
