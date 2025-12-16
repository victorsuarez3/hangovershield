/**
 * Auth Navigator - Hangover Shield
 * Handles authentication flow routing with Apple sign-in
 * Note: Google Sign-In temporarily disabled
 */

import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { showAlert } from '../utils/alert';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { signInWithApple } from '../services/auth';

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onAuthSuccess: () => void;
}

// Login screen component that handles auth
const LoginScreenContainer: React.FC<{
  onAuthSuccess: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}> = ({ onAuthSuccess, loading, setLoading }) => {
  
  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithApple();
      onAuthSuccess();
    } catch (error: any) {
      setLoading(false);
      if (error.message !== 'Apple sign-in was cancelled') {
        const errorMessage = error.message || 'Failed to sign in with Apple. Please try again.';
        showAlert('Sign In Error', errorMessage, 'error');
      }
    }
  };

  const handleGoogleSignIn = () => {
    showAlert('Coming Soon', 'Google Sign-In will be available soon.', 'info');
  };

  return (
    <LoginScreen
      onGoogleSignIn={handleGoogleSignIn}
      onAppleSignIn={handleAppleSignIn}
      loading={loading}
    />
  );
};

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login">
        {() => (
          <LoginScreenContainer
            onAuthSuccess={onAuthSuccess}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
