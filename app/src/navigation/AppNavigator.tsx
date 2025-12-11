/**
 * Main App Navigator with Bottom Tabs - Hangover Shield
 */

import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from './types';
import { CustomTabBar } from '../components/CustomTabBar';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { SmartPlanScreen } from '../screens/SmartPlanScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
    </Stack.Navigator>
  );
};

const SmartPlanStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SmartPlan" component={SmartPlanScreen} />
    </Stack.Navigator>
  );
};

const ToolsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tools" component={ToolsScreen} />
    </Stack.Navigator>
  );
};

const HistoryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <ProtectedRoute>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'rgba(0,0,0,0)', // Transparente total
            position: 'absolute',
            borderTopWidth: 0, // NO borde
            elevation: 0, // Android: NO sombra
            shadowOpacity: 0, // iOS: NO sombra
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 0,
          },
          tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: 'transparent' }} />
          ),
        }}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="SmartPlan" component={SmartPlanStack} />
        <Tab.Screen name="Tools" component={ToolsStack} />
        <Tab.Screen name="History" component={HistoryStack} />
        <Tab.Screen name="Settings" component={ProfileStack} />
      </Tab.Navigator>
    </ProtectedRoute>
  );
};
