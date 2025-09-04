import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/Home/HomeScreen";
import RecordingScreen from "../screens/Recording/RecordingScreen";
import AnalysisScreen from "../screens/Analysis/AnalysisScreen";
import ChatScreen from "../screens/Chat/ChatScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

// ✅ Stack for Recording + Analysis + Chat
const AnalysisStack = createNativeStackNavigator();

const AnalysisStackNavigator = () => {
  return (
    <AnalysisStack.Navigator screenOptions={{ headerShown: false }}>
      <AnalysisStack.Screen name="Recordings" component={RecordingScreen} />
      <AnalysisStack.Screen name="Analysis" component={AnalysisScreen} />
      <AnalysisStack.Screen name="Chat" component={ChatScreen} />
    </AnalysisStack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* ✅ Entire flow is grouped inside one tab */}
      <Tab.Screen name="AnalysisStack" component={AnalysisStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
