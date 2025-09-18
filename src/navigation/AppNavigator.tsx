import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import Onboarding1 from "../screens/Onboarding/Onboarding1";
import Onboarding2 from "../screens/Onboarding/Onboarding2";
import AuthNavigator from "./AuthNavigator";
import MainTabs from "./MainTabs";

export type RootStackParamList = {
  Splash: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Auth: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSplashVisible ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !isOnboardingDone ? (
        <>
          <Stack.Screen name="Onboarding1" component={Onboarding1} />
          <Stack.Screen name="Onboarding2">
            {(props) => (
              <Onboarding2 {...props} setIsOnboardingDone={setIsOnboardingDone} />
            )}
          </Stack.Screen>
        </>
      ) : !isLoggedIn ? (
        <Stack.Screen name="Auth">
          {(props) => <AuthNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
