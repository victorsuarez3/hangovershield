/**
 * Main App Navigator with Bottom Tabs - Hangover Shield
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from './types';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { SmartPlanScreen } from '../screens/SmartPlanScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { EveningCheckInScreen } from '../screens/EveningCheckInScreen';
import { DailyWaterLogScreen } from '../screens/DailyWaterLogScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="EveningCheckIn" component={EveningCheckInScreen} />
      <Stack.Screen name="DailyWaterLog" component={DailyWaterLogScreen} />
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

const ProgressStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
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

interface AppNavigatorProps {
  /**
   * Allow guest/test mode navigation without authentication
   * When true, bypasses auth check in ProtectedRoute (for development/testing)
   */
  allowGuestMode?: boolean;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ allowGuestMode = false }) => {
  return (
    <ProtectedRoute allowGuestMode={allowGuestMode}>
      <Tab.Navigator
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            display: 'none',
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="SmartPlan" component={SmartPlanStack} />
        <Tab.Screen name="Tools" component={ToolsStack} />
        <Tab.Screen name="Progress" component={ProgressStack} />
        <Tab.Screen name="Settings" component={ProfileStack} />
      </Tab.Navigator>
    </ProtectedRoute>
  );
};
