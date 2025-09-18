// HomeScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BleManager, Device } from "react-native-ble-plx";

const manager = new BleManager();

const HomeScreen = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState(2); // default = Dashboard

  // --- Animated waveform bars ---
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

  // --- Permissions (Android only) ---
  const requestPermissions = async () => {
    if (Platform.OS === "android" && Platform.Version >= 23) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      manager.destroy();
    };
  }, []);

  // --- Start scanning ---
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
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 8000);
  };

  // --- Connect to device ---
  const connectToDevice = async (device: Device) => {
    try {
      setIsConnecting(true);
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      setIsConnecting(false);
    } catch (e) {
      console.error("Connection error:", e);
      setIsConnecting(false);
    }
  };

  // --- STEP 1: Bluetooth Devices ---
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Available Devices</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="search" size={20} color="#fff" />
              <Text style={styles.primaryText}>Scan Devices</Text>
            </>
          )}
        </TouchableOpacity>

        <ScrollView style={{ marginTop: 20 }}>
          {devices.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.deviceItem}
              onPress={() => connectToDevice(item)}
            >
              <Icon name="watch" size={22} color="#4CAF50" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>{item.id}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isConnecting && (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 10 }} />
        )}

        {connectedDevice && (
          <View style={styles.connectedBox}>
            <Icon name="bluetooth-connected" size={18} color="#2E7D32" />
            <Text style={styles.connectedText}>
              Connected to {connectedDevice.name}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 20 }]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.secondaryText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- STEP 2: Dashboard ---
  if (step === 2) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AirPulse Health</Text>
            <TouchableOpacity
              style={styles.connectionBtn}
              onPress={() => setStep(1)}
            >
              <Icon
                name={connectedDevice ? "bluetooth-connected" : "bluetooth-disabled"}
                size={18}
                color="#fff"
              />
              <Text style={styles.connectionText}>
                {connectedDevice ? "Connected" : "Connect"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back 👋</Text>
            <Text style={styles.cardDesc}>
              Monitor your heart health with AI-powered insights and real-time tracking.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep(3)}
            >
              <Text style={styles.primaryText}>Start Monitoring</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>71</Text>
              <Text style={styles.statLabel}>Avg BPM</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Recordings</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>12m</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityBox}>
            <View style={styles.activityItem}>
              <Icon name="fiber-manual-record" size={14} color="#4CAF50" />
              <Text style={styles.activityText}>Recording completed - 10:30 AM</Text>
            </View>
            <View style={styles.activityItem}>
              <Icon name="favorite" size={14} color="#e74c3c" />
              <Text style={styles.activityText}>Heart rate check - 9:15 AM</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- STEP 3: Recording ---
  if (step === 3) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center" }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recording</Text>
          <TouchableOpacity style={styles.connectionBtn}>
            <Text style={styles.connectionText}>
              {connectedDevice ? "Connected" : "Not Connected"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Waveform */}
        <View style={styles.waveformBox}>
          <Animated.View style={[styles.bar, { height: bar1 }]} />
          <Animated.View style={[styles.bar, { height: bar2 }]} />
          <Animated.View style={[styles.bar, { height: bar3 }]} />
          <Animated.View style={[styles.bar, { height: bar4 }]} />
        </View>

        {/* BPM Circle */}
        <View style={styles.bpmCircle}>
          <Text style={styles.bpmValue}>68</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>

        <Text style={styles.recordingLabel}>Recording in progress...</Text>

        {/* Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity>
            <Icon name="save" size={30} color="#4A545A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.micButton}>
            <Icon name="mic" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="share" size={30} color="#4A545A" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 30, alignSelf: "center" }]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.secondaryText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
