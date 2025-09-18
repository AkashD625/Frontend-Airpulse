import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌐 Backend URLs
const LOCAL_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api" // Android Emulator
    : "http://localhost:5000/api"; // iOS Simulator

const HOSTED_URL = "https://backend-airpulse.onrender.com/api";

// Exported API_URL (will be updated dynamically)
let API_URL = HOSTED_URL;

// ✅ Detect local server
const detectServer = async () => {
  try {
    const res = await fetch(`${LOCAL_URL}/health`, { method: "GET" });
    if (res.ok) {
      API_URL = LOCAL_URL;
    } else {
      API_URL = HOSTED_URL;
    }
  } catch (error) {
    API_URL = HOSTED_URL;
  }
};

detectServer();

// ✅ Navigation stack
type RootStackParamList = {
  BluetoothConnect: undefined;
  UserScreen: undefined;
  Signup: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginScreenProps {
  setIsLoggedIn: (val: boolean) => void;
}

// ✅ Helper: fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = 15000
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]) as Promise<Response>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // ✅ Save securely
        await AsyncStorage.setItem("token", data.token);
        if (data.user) {
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }

        setIsLoggedIn(true);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      Alert.alert("Error", err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#e0fbfc", "#c2f0f5"]} style={styles.container}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.waveLine} />
          <View style={[styles.waveLine, { width: 120, top: 30 }]} />
          <View style={[styles.waveLine, { width: 140, top: 60 }]} />
          <View style={styles.deviceIcon} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.formContainer}
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Login to access your health dashboard
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#7a8c8f"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#7a8c8f"
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={{ marginTop: 16 }}
          >
            <Text style={styles.signupText}>
              Don't have an account?{" "}
              <Text style={styles.signupLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  illustrationContainer: {
    width: "100%",
    height: 180,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  waveLine: {
    width: 180,
    height: 4,
    backgroundColor: "#5c6b73",
    borderRadius: 2,
    marginVertical: 6,
    opacity: 0.5,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#76c7c0",
    borderRadius: 12,
    marginTop: 20,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#5c6b73",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 0,
  },
  loginButton: {
    backgroundColor: "#5c6b73",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  signupText: {
    color: "#5c6b73",
    textAlign: "center",
    fontSize: 16,
  },
  signupLink: {
    fontWeight: "bold",
  },
});
