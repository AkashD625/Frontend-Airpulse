import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

type Onboarding2Props = {
  setIsOnboardingDone: React.Dispatch<React.SetStateAction<boolean>>;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Onboarding2">;

const Onboarding2: React.FC<Onboarding2Props> = ({ setIsOnboardingDone }) => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = () => {
    setIsOnboardingDone(true);
    navigation.navigate("Auth");
  };

  return (
    <View style={styles.container}>
      {/* Illustration representing connection & Bluetooth */}
      <View style={styles.illustrationContainer}>
        {/* Base stethoscope circle */}
        <View style={styles.deviceCircle} />
        
        {/* Bluetooth signal waves */}
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Connect your{"\n"}Wireless Stethoscope</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Ensure Bluetooth is on and your device{"\n"}is nearby to pair.
      </Text>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login ➝</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0fbfc",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  illustrationContainer: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  deviceCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#5c6b73", // device base color
    elevation: 5,
  },
  wave: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#76c7c0",
    borderRadius: 999,
    opacity: 0.5,
  },
  wave1: {
    width: 140,
    height: 140,
  },
  wave2: {
    width: 170,
    height: 170,
  },
  wave3: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#5c6b73",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#5c6b73",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
});
