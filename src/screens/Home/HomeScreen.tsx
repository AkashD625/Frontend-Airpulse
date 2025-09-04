// HomeScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Animated,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BleManager, Device } from "react-native-ble-plx";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import RNFS from "react-native-fs";

const manager = new BleManager();
const audioRecorderPlayer = new AudioRecorderPlayer();

const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000";

const HomeScreen = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState(2); // 1=BT, 2=Dashboard, 3=Recording

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState("00:00");
  const [filePath, setFilePath] = useState<string | null>(null);

  // Waveform animation bars
  const bar1 = useRef(new Animated.Value(20)).current;
  const bar2 = useRef(new Animated.Value(40)).current;
  const bar3 = useRef(new Animated.Value(30)).current;
  const bar4 = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animateBar = (bar: Animated.Value, min: number, max: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: max, duration: 500, useNativeDriver: false }),
          Animated.timing(bar, { toValue: min, duration: 500, useNativeDriver: false }),
        ])
      ).start();
    };
    animateBar(bar1, 20, 60);
    animateBar(bar2, 10, 50);
    animateBar(bar3, 15, 70);
    animateBar(bar4, 25, 65);
  }, []);

  // Request permissions (Android only)
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      const perms = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ].filter(Boolean) as string[];

      try {
        await PermissionsAndroid.requestMultiple(perms);
      } catch (e) {
        console.warn("Permission request error", e);
      }
    }
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      manager.destroy();
      audioRecorderPlayer.stopRecorder().catch(() => {});
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  // Start scanning Bluetooth devices
  const startScan = () => {
    setDevices([]);
    setIsScanning(true);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Scan error:", error);
        setIsScanning(false);
        return;
      }
      if (device && device.name) {
        setDevices((prev) => {
          const exists = prev.find((d) => d.id === device.id);
          if (!exists) return [...prev, device];
          return prev;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 8000);
  };

  // Connect to a Bluetooth device
  const connectToDevice = async (device: Device) => {
    try {
      setIsConnecting(true);
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
    } catch (e) {
      console.error("Connection error:", e);
      Alert.alert("Bluetooth", "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const path = Platform.select({
        ios: "airpulse_recording.m4a",
        android: `${RNFS.DocumentDirectoryPath}/airpulse_${Date.now()}.wav`,
      })!;

      const uri = await audioRecorderPlayer.startRecorder(path);
      setFilePath(uri);

      audioRecorderPlayer.addRecordBackListener((e: any) => {
        setRecordSecs(e.currentPosition);
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      });
      setIsRecording(true);
    } catch (e) {
      console.error("startRecording error:", e);
      Alert.alert("Recording", "Unable to start recording");
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setFilePath(result);
    } catch (e) {
      console.error("stopRecording error:", e);
    }
  };

  // Upload recording
  const uploadRecording = async () => {
    if (!filePath) {
      Alert.alert("Save", "No recording to upload");
      return;
    }

    const fileUri =
      Platform.OS === "android" && !filePath.startsWith("file://")
        ? `file://${filePath}`
        : filePath;

    const isWav = fileUri.toLowerCase().endsWith(".wav");
    const fileName = `rec_${Date.now()}.${isWav ? "wav" : "m4a"}`;
    const mime = isWav ? "audio/wav" : "audio/m4a";

    const formData: any = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mime,
    } as any);
    formData.append("title", fileName);
    formData.append("duration", Math.max(1, Math.round(recordSecs / 1000)).toString());

    try {
      const res = await fetch(`${API_BASE}/api/recordings`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      const data = await res.json();
      Alert.alert("Uploaded", `Saved as ${data.title}`);

      setRecordSecs(0);
      setRecordTime("00:00");
      setFilePath(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Upload Failed", err?.message || "Unknown error");
    }
  };

  // --- STEP 1: Bluetooth Devices
  if (step === 1) {
    return (
      <View>
        <Text>Available Devices</Text>
        <TouchableOpacity onPress={startScan} disabled={isScanning}>
          {isScanning ? <ActivityIndicator /> : <Text>Scan Devices</Text>}
        </TouchableOpacity>

        <ScrollView>
          {devices.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => connectToDevice(item)}>
              <Text>{item.name}</Text>
              <Text>{item.id}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isConnecting && <ActivityIndicator />}

        {connectedDevice && <Text>Connected to {connectedDevice.name}</Text>}

        <TouchableOpacity onPress={() => setStep(2)}>
          <Text>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- STEP 2: Dashboard
  if (step === 2) {
    return (
      <ScrollView>
        <View>
          <Text>AirPulse Health</Text>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text>{connectedDevice ? "Connected" : "Connect"}</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text>Welcome Back 👋</Text>
          <Text>Monitor your heart health with AI-powered insights.</Text>
          <TouchableOpacity onPress={() => setStep(3)}>
            <Text>Start Monitoring</Text>
          </TouchableOpacity>
        </View>

        <Text>Quick Stats</Text>
        <View>
          <Text>71 Avg BPM</Text>
          <Text>3 Recordings</Text>
          <Text>12m Today</Text>
        </View>

        <Text>Recent Activity</Text>
        <View>
          <Text>Recording completed - 10:30 AM</Text>
          <Text>Heart rate check - 9:15 AM</Text>
        </View>
      </ScrollView>
    );
  }

  // --- STEP 3: Recording
  if (step === 3) {
    return (
      <View>
        <Text>Recording</Text>
        <Text>{connectedDevice ? "Connected" : "Not Connected"}</Text>

        <View style={{ flexDirection: "row" }}>
          <Animated.View style={{ height: bar1, width: 10, backgroundColor: "green" }} />
          <Animated.View style={{ height: bar2, width: 10, backgroundColor: "green" }} />
          <Animated.View style={{ height: bar3, width: 10, backgroundColor: "green" }} />
          <Animated.View style={{ height: bar4, width: 10, backgroundColor: "green" }} />
        </View>

        <View>
          <Text>{isRecording ? 72 : 68} BPM</Text>
        </View>

        <Text>{isRecording ? `Recording… ${recordTime}` : "Ready"}</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <TouchableOpacity onPress={uploadRecording} disabled={!filePath}>
            <Text>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={isRecording ? stopRecording : startRecording}>
            <Text>{isRecording ? "Stop" : "Record"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Share", "Coming soon!")}>
            <Text>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setStep(2)}>
          <Text>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

export default HomeScreen;


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B" },
  connectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  connectionText: { color: "#fff", fontSize: 12, marginLeft: 6 },

  // Cards
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: "#111827" },
  cardDesc: { fontSize: 14, color: "#6B7280", marginBottom: 16 },

  // Primary button
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 25,
  },
  primaryText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 6 },

  // Secondary button
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#E5E7EB",
    borderRadius: 25,
  },
  secondaryText: { color: "#111827", fontSize: 15, fontWeight: "600" },

  // Stats
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    color: "#111827",
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#4CAF50" },
  statLabel: { fontSize: 14, color: "#6B7280" },

  // Recent Activity
  activityBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  activityItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  activityText: { marginLeft: 8, fontSize: 14, color: "#374151" },

  // Device list
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  deviceName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  deviceId: { fontSize: 12, color: "#6B7280" },
  connectedBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
  },
  connectedText: { color: "#065F46", fontWeight: "600", marginLeft: 6 },

  // Recording
  waveformBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 80,
    marginBottom: 20,
  },
  bar: {
    width: 10,
    backgroundColor: "#4CAF50",
    marginHorizontal: 6,
    borderRadius: 4,
  },
  bpmCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  bpmValue: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  bpmLabel: { fontSize: 16, color: "#fff" },
  recordingLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 30,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
  },
  micButton: {
    backgroundColor: "#4CAF50",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },

  // Titles
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
    color: "#111827",
  },
});
