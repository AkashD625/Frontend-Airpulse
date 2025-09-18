import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Onboarding1 = () => {
  const navigation = useNavigation<any>(); // <-- navigation hook

  return (
    <View style={styles.container}>
      {/* Modern abstract illustration */}
      <View style={styles.illustrationContainer}>
        <View style={[styles.circle, styles.circleLarge]} />
        <View style={[styles.circle, styles.circleMedium]} />
        <View style={[styles.circle, styles.circleSmall]} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Welcome to AirPulse</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Transforming the way you monitor your{"\n"}health with digital technology.
      </Text>

      {/* Progress indicator */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Onboarding2")} // <-- works now
      >
        <Text style={styles.buttonText}>Next ➝</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding1;

// ...styles remain the same


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
  circle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "#5c6b73",
    opacity: 0.2,
  },
  circleLarge: {
    width: 220,
    height: 220,
    transform: [{ rotate: "45deg" }],
  },
  circleMedium: {
    width: 150,
    height: 150,
    opacity: 0.4,
    transform: [{ rotate: "20deg" }],
  },
  circleSmall: {
    width: 100,
    height: 100,
    opacity: 0.7,
    transform: [{ rotate: "-10deg" }],
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#5c6b73",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5c6b73",
    marginHorizontal: 5,
    opacity: 0.3,
  },
  activeDot: {
    opacity: 1,
  },
  button: {
    backgroundColor: "#5c6b73",
    paddingVertical: 14,
    paddingHorizontal: 40,
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
