import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Button,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Recording {
  _id: string;
  title: string;
  url: string;
  duration?: string;
  createdAt: string;
}

type AnalysisStackParamList = {
  Analysis: { recordingName: string; url: string };
  Chat: undefined;
};

type NavigationProp = NativeStackNavigationProp<
  AnalysisStackParamList,
  "Analysis"
>;

export const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api/recordings"
    : "http://localhost:5000/api/recordings";

const RecordingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const data: Recording[] = await res.json();
      setRecordings(data);
    } catch (err) {
      console.error("Error fetching recordings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Bulk upload trigger
  const handleBulkUpload = async () => {
    try {
      const res = await fetch(`${API_URL}/bulk-upload`, { method: "POST" });
      const data = await res.json();
      Alert.alert("Success", `Uploaded ${data.count} files`);
      fetchData(); // reload list
    } catch (err) {
      Alert.alert("Error", "Failed to bulk upload");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavigate = (item: Recording) => {
  navigation.navigate("Analysis", {
    id: item._id,             // 👈 pass the id here
    recordingName: item.title,
    url: item.url,
  });
};


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Recordings</Text>

      {/* ✅ Upload button */}
      <Button title="Upload All Files" onPress={handleBulkUpload} />

      <FlatList
        data={recordings}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate(item)}
          >
            <View>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.details}>
                {item.duration || "N/A"} •{" "}
                {item.createdAt
                  ? new Date(item.createdAt).toDateString()
                  : "Unknown date"}
              </Text>
            </View>

            <View style={styles.actions}>
              <Icon name="chevron-right" size={28} color="#4CAF50" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default RecordingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  details: { fontSize: 13, color: "#777" },
  actions: { flexDirection: "row", alignItems: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
