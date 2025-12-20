/**
 * Intro Onboarding Navigator - Hangover Shield
 * Pre-auth onboarding flow explaining app value
 * Shows BEFORE login/signup
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IntroScreen1 } from '../screens/intro/IntroScreen1';
import { IntroScreen2 } from '../screens/intro/IntroScreen2';
import { IntroScreen3 } from '../screens/intro/IntroScreen3';
import { NotificationPermissionScreen } from '../screens/intro/NotificationPermissionScreen';

export type IntroOnboardingStackParamList = {
  Intro1: undefined;
  Intro2: undefined;
  Intro3: undefined;
  NotificationPermission: undefined;
};

const Stack = createNativeStackNavigator<IntroOnboardingStackParamList>();

interface IntroOnboardingNavigatorProps {
  onComplete: () => void;
}

export const IntroOnboardingNavigator: React.FC<IntroOnboardingNavigatorProps> = ({
  onComplete,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
      initialRouteName="Intro1"
    >
      <Stack.Screen name="Intro1">
        {({ navigation }) => (
          <IntroScreen1 onNext={() => navigation.navigate('Intro2')} />
        )}
      </Stack.Screen>

      <Stack.Screen name="Intro2">
        {({ navigation }) => (
          <IntroScreen2 onNext={() => navigation.navigate('Intro3')} />
        )}
      </Stack.Screen>

      <Stack.Screen name="Intro3">
        {({ navigation }) => (
          <IntroScreen3 onNext={() => navigation.navigate('NotificationPermission')} />
        )}
      </Stack.Screen>

      <Stack.Screen name="NotificationPermission">
        {() => <NotificationPermissionScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default IntroOnboardingNavigator;





