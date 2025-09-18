import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo with fade animation */}
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <Image
          source={require("../assets/images/logo.png")} // 👈 place your logo
          style={styles.logo}
          resizeMode="contain"
        />

        {/* App tagline */}
        <Text style={styles.subtitle}>
          Monitoring Your Heart, Digitally ❤️
        </Text>
      </Animated.View>

      {/* Loader */}
      <ActivityIndicator size="large" color="#5c6b73" style={styles.loader} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0fbfc", // main background
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#000", // black text
    marginTop: 10,
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  loader: {
    marginTop: 40,
  },
});
