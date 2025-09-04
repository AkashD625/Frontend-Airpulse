import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

// ✅ Define navigation types
type RootStackParamList = {
  Recordings: undefined;
  Analysis: { id: string; recordingName: string; url: string }; // 👈 add id + url
  Chat: { recordingName: string; analysisData: any };
};


type AnalysisRouteProp = RouteProp<RootStackParamList, "Analysis">;

type Props = {
  route: AnalysisRouteProp;
};

const AnalysisScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation();
  const recordingName = route.params?.recordingName ?? "Unknown Recording";

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);

 const id = route.params?.id;

useEffect(() => {
  const fetchAnalysis = async () => {
    try {
      const res = await fetch(
        `http://10.0.2.2:5000/api/recordings/analyze/${id}`
      );
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchAnalysis();
}, [id]);



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Analyzing {recordingName}...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Analysis</Text>
      <Text style={styles.subtitle}>Recording: {recordingName}</Text>

      {/* BPM */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Heart Rate (BPM)</Text>
        <Text style={styles.value}>{analysis.bpm} bpm</Text>
      </View>

      {/* ECG Graph */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ECG-like Signal</Text>
        <LineChart
          data={{
            labels: [],
            datasets: [{ data: analysis.ecg }],
          }}
          width={Dimensions.get("window").width - 40}
          height={200}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: () => "#4CAF50",
            labelColor: () => "#555",
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 10 }}
        />
      </View>

      {/* Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Status</Text>
        <Text style={styles.value}>{analysis.status}</Text>
      </View>

      {/* Probabilities */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Condition Probabilities</Text>
        <Text style={styles.details}>Normal: 82%</Text>
        <Text style={styles.details}>Murmur: 10%</Text>
        <Text style={styles.details}>Arrhythmia: 8%</Text>
      </View>

      {/* Back to Recordings */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Recordings" as never)}
      >
        <Text style={styles.backText}>⬅ Back to Recordings</Text>
      </TouchableOpacity>

      {/* Chat with AI */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() =>
          navigation.navigate("Chat" as never, {
            recordingName,
            analysisData: analysis,
          } as never)
        }
      >
        <Text style={styles.chatText}>💬 Chat with AI</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AnalysisScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  details: {
    fontSize: 14,
    color: "#555",
  },
  backButton: {
    backgroundColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  backText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  chatButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  chatText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
