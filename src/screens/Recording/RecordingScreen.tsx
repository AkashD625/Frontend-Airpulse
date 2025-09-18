import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// ✅ Define navigation types for AnalysisStack
type AnalysisStackParamList = {
  Analysis: { recordingName: string };
  Chat: undefined;
};

type NavigationProp = NativeStackNavigationProp<
  AnalysisStackParamList,
  "Analysis"
>;

interface Recording {
  _id: string;
  title: string;
  url: string;
  duration: string;
  createdAt: string;
}

const RecordingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null); // 🎵 Track playing state

  // 👇 Fetch recordings from backend
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const res = await fetch("http://10.0.2.2:5000/api/recordings");
        const data = await res.json();
        setRecordings(data);
      } catch (err) {
        console.error("Error fetching recordings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const handleNavigate = (item: Recording) => {
    navigation.navigate("Analysis", { recordingName: item.title });
  };

  const handlePlayPause = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : id));
  };

const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`http://10.0.2.2:5000/api/recordings/${id}`, {
      method: "DELETE",
    });

    const text = await res.text(); // 👀 read raw response
    console.log("Raw response:", text);

    if (res.ok) {
      try {
        const data = JSON.parse(text);
        console.log("Deleted:", data);
      } catch {
        console.log("Deleted (no JSON body)");
      }
      setRecordings((prev) => prev.filter((rec) => rec._id !== id));
    } else {
      console.error("Failed to delete:", res.status, text);
    }
  } catch (err) {
    console.error("Error deleting recording:", err);
  }
};



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading recordings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Saved Recordings</Text>

      {recordings.length === 0 ? (
        <View style={styles.center}>
          <Icon name="library-music" size={60} color="#bbb" />
          <Text style={styles.empty}>No recordings found.</Text>
        </View>
      ) : (
        <FlatList
          data={recordings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleNavigate(item)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.details}>
                  {item.duration} • {new Date(item.createdAt).toDateString()}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable onPress={() => handlePlayPause(item._id)}>
                  <Icon
                    name={playingId === item._id ? "pause" : "play-arrow"}
                    size={28}
                    color="#4CAF50"
                    style={{ marginHorizontal: 6 }}
                  />
                </Pressable>

                <Pressable onPress={() => handleDelete(item._id)}>
                  <Icon
                    name="delete-outline"
                    size={26}
                    color="#e74c3c"
                    style={{ marginHorizontal: 6 }}
                  />
                </Pressable>

                <Icon name="chevron-right" size={28} color="#888" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default RecordingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: "#fdfdfd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#222" },
  details: { fontSize: 13, color: "#777" },
  actions: { flexDirection: "row", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", color: "#888", marginTop: 10, fontSize: 16 },
});
