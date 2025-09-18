import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  name: string;
  email: string;
  role?: string; // doctor/patient etc.
  createdAt?: string; // account creation date
  avatar?: string; // optional profile image
}

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          // 👉 Add navigation reset to Login if needed
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : "?"}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name || "Loading..."}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user?.role || "Patient"}</Text>

        <Text style={styles.label}>Joined</Text>
        <Text style={styles.value}>
          {user?.createdAt
            ? new Date(user.createdAt).toDateString()
            : "Unknown"}
        </Text>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacy & Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Help & Support</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#e0fbfc",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#5c6b73",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  email: {
    fontSize: 16,
    color: "#555",
  },
  infoSection: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    color: "#555",
  },
  value: {
    fontSize: 17,
    color: "#222",
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#76c7c0",
    marginHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  editText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  section: {
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginBottom: 30,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    marginHorizontal: 40,
    marginBottom: 40,
    backgroundColor: "#d9534f",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
