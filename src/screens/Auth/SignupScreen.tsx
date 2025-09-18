<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
import React, { useState } from "react";
>>>>>>> 1e3ca2e9921006468160f15e5449fe00755acc79
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
<<<<<<< HEAD
=======
import { API_URL } from "./config";


>>>>>>> 1e3ca2e9921006468160f15e5449fe00755acc79

const COLORS = {
  primary: "#5c6b73",
  accent: "#76c7c0",
  white: "#fff",
  gray: "#5c6b73",
  inputBg: "#f9f9f9",
};

<<<<<<< HEAD
// --- Local + Hosted API detection ---
const LOCAL_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://localhost:5000/api";

const HOSTED_URL = "https://backend-airpulse.onrender.com/api";

let API_URL = HOSTED_URL; // fallback

const detectServer = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const res = await fetch(`${LOCAL_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      API_URL = LOCAL_URL;
    }
  } catch {
    API_URL = HOSTED_URL; // if local fails, keep hosted
  }
};

=======
>>>>>>> 1e3ca2e9921006468160f15e5449fe00755acc79
const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"Normal" | "Doctor">("Normal");
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  // detect server on mount
  useEffect(() => {
    detectServer();
  }, []);

=======
>>>>>>> 1e3ca2e9921006468160f15e5449fe00755acc79
  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Success", "Account created successfully!", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Registration Failed", data.message || "Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#e0fbfc", "#c2f0f5"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.innerContainer}
          >
            {/* Abstract Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.circle} />
              <View style={styles.rectangle} />
              <View style={styles.ellipse} />
            </View>

            <Text style={styles.title}>Create Account</Text>

            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#7a8c8f"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#7a8c8f"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#7a8c8f"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#7a8c8f"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              {/* User Type Selector */}
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={[styles.radioButton, userType === "Normal" && styles.radioSelected]}
                  onPress={() => setUserType("Normal")}
                >
                  <Text style={[styles.radioText, userType !== "Normal" && { color: "#000" }]}>
                    Normal User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, userType === "Doctor" && styles.radioSelected]}
                  onPress={() => setUserType("Doctor")}
                >
                  <Text style={[styles.radioText, userType !== "Doctor" && { color: "#000" }]}>
                    Doctor
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signupButton, loading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.signupText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Navigation */}
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={{ marginTop: 16 }}
              >
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                  <Text style={styles.loginBold}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 25 },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 20,
    height: 150,
    justifyContent: "center",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(118,199,192,0.3)",
    position: "absolute",
    top: 10,
    left: 50,
  },
  rectangle: {
    width: 50,
    height: 70,
    borderRadius: 15,
    backgroundColor: "rgba(92,107,115,0.3)",
    position: "absolute",
    top: 40,
    right: 40,
  },
  ellipse: {
    width: 100,
    height: 60,
    borderRadius: 50,
    backgroundColor: "rgba(118,199,192,0.2)",
    position: "absolute",
    bottom: 0,
    left: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.gray,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 0,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: "#eee",
    alignItems: "center",
    marginHorizontal: 5,
  },
  radioSelected: {
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontWeight: "600",
    color: "#fff",
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  signupText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  loginText: { textAlign: "center", fontSize: 16, color: COLORS.gray },
  loginBold: { color: COLORS.primary, fontWeight: "bold" },
});
