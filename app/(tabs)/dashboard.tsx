import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import PetCard from "../../components/PetCard";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

type Pet = {
  id: string;
  name: string;
  type: string;
  age?: string;
  breed?: string;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const petsRef = collection(db, "pets");
    const q = query(petsRef, where("userId", "==", user.uid)); // ✅ removed orderBy

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Pet[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Pet);
      });
      setPets(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Pets</Text>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(tabs)/pets/${item.id}`)}>
            <PetCard name={item.name} type={item.type} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No pets yet. Add one!</Text>}
      />

      <View style={styles.addBtn}>
        <Button title="Add Pet" onPress={() => router.push("/(tabs)/pets/add")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  empty: { textAlign: "center", marginTop: 20, color: "gray" },
  addBtn: { marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
