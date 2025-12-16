/**
 * Main App Navigator - Hangover Shield
 * Uses Stack Navigator only (no Tab Navigator) - navigation via menu
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { TodayRecoveryPlanScreen } from '../screens/TodayRecoveryPlanScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { EveningCheckInScreen } from '../screens/EveningCheckInScreen';
import { DailyWaterLogScreen } from '../screens/DailyWaterLogScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          // Let each screen control its own background
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
        initialRouteName="HomeMain"
      >
        {/* Main screens - navigated via menu */}
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="SmartPlan" component={TodayRecoveryPlanScreen} />
        <Stack.Screen name="Tools" component={ToolsScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        
        {/* Nested screens */}
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="EveningCheckIn" component={EveningCheckInScreen} />
        <Stack.Screen name="DailyWaterLog" component={DailyWaterLogScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </ProtectedRoute>
  );
};
